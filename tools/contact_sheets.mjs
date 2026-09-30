#!/usr/bin/env node
// Contact sheets of the test bench (docs/build-plan.md, stage LOOK-SYSTEM item 8):
// every screen of the all-screens lesson at three phone sizes, in light and
// dark, one sheet per size and theme. On every page it also runs the measured
// UI check (tools/ui_audit.mjs) and writes sheets/ui-check.md; with --strict
// a finding fails the run, as it does in CI.
//
//   npm run sheets                          build the test build, then shoot
//   npm run sheets -- --no-build            reuse dist-smoke/ from the last run
//   npm run sheets -- --looks neo,neoMono   more looks (default: neo)
//   npm run sheets -- --themes dark         one theme (default: light,dark)
//   npm run sheets -- --out sheets-before   another folder (default: sheets/)
//   npm run sheets -- --strict              exit 1 on a UI check finding
//
// Each screen opens by its deep link, `#all-screens/<n>?test=1&theme=<t>&look=<l>`,
// with animations off, as the render test opens it (tools/smoke.mjs).
import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { AUDIT, auditScreen } from './ui_audit.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist-smoke');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const list = (value) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const looks = list(option('--looks', 'neo'));
const themes = list(option('--themes', 'light,dark'));
const outDir = join(root, option('--out', 'sheets'));
const shots = join(outDir, 'shots');

/** The three sizes of the plan, in points: a current iPhone, an iPhone SE, the smallest. */
const SIZES = [
  { width: 390, height: 844 },
  { width: 375, height: 667 },
  { width: 320, height: 568 },
];
const BENCH = 'all-screens';
/** The home screens, by their test links (src/home/Home.tsx, openHomeAt). */
const HOME = ['learn', 'account', 'settings', 'design', 'animations', 'suggestions'];

if (!flag('--no-build') || !existsSync(join(dist, 'index.html'))) {
  console.log('Building the web export with the testing tools…');
  const built = spawnSync(
    'npx',
    ['expo', 'export', '--platform', 'web', '--output-dir', dist, '--clear'],
    { cwd: root, stdio: 'inherit', env: { ...process.env, EXPO_PUBLIC_TEST_TOOLS: '1' } },
  );
  if (built.status !== 0) process.exit(built.status ?? 1);
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function serve(dir) {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    let file = join(dir, path);
    if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) {
      file = join(dir, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(shots, { recursive: true });

const server = await serve(dist);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

let failures = 0;
const findings = [];
const sheets = [];
for (const look of looks) {
  for (const theme of themes) {
    for (const size of SIZES) {
      const context = await browser.newContext({
        viewport: size,
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
        reducedMotion: 'reduce',
        colorScheme: theme === 'light' ? 'light' : 'dark',
      });
      const page = await context.newPage();
      const query = `?test=1&theme=${theme}&look=${look}`;
      await page.goto(`${base}/${query}`);
      await page.waitForFunction(() => document.documentElement.dataset.visit === '0', null, {
        timeout: 60_000,
      });
      const count = await page.evaluate(
        (id) => window.__lessons.find((l) => l.id === id)?.screens ?? 0,
        BENCH,
      );
      const tag = `${look}-${theme}-${size.width}`;
      const cells = [];
      const pages = [
        ...Array.from({ length: count }, (_, i) => `${BENCH}/${i + 1}`),
        ...HOME.map((name) => `home/${name}`),
      ];
      for (const [i, link] of pages.entries()) {
        const n = link.startsWith(BENCH) ? String(i + 1) : link;
        const visit = await page.evaluate(() => Number(document.documentElement.dataset.visit));
        await page.evaluate(
          ([hash]) => {
            window.location.hash = hash;
          },
          [`${link}${query}`],
        );
        try {
          await page.waitForFunction(
            (v) => Number(document.documentElement.dataset.visit) > v,
            visit,
            { timeout: 20_000 },
          );
          await page.evaluate(
            () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
          );
          for (const f of await page.evaluate(auditScreen, AUDIT))
            findings.push({ look, theme, width: size.width, screen: link, ...f });
          const file = join(shots, `${tag}-${i}.jpg`);
          await page.screenshot({ path: file, type: 'jpeg', quality: 60 });
          cells.push(
            `<figure><img src="shots/${tag}-${i}.jpg"><figcaption>${n}</figcaption></figure>`,
          );
        } catch {
          failures += 1;
          cells.push(`<figure class="bad"><figcaption>${n} did not open</figcaption></figure>`);
        }
      }
      await context.close();
      sheets.push(await sheet(tag, size, cells));
      console.log(`${tag}: ${pages.length} screens`);
    }
  }
}

async function sheet(tag, size, cells) {
  const cols = 10;
  const w = Math.round(size.width / 2.6);
  const h = Math.round(size.height / 2.6);
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#1a1a1a;color:#ddd;font:11px system-ui,sans-serif}
    h1{font-size:16px;margin:8px}
    main{display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:8px}
    figure{margin:0}img{width:${w}px;height:${h}px;display:block;border:1px solid #444}
    figure.bad figcaption{color:#f66}
  </style><h1>Test bench and home · ${tag.replace(/-/g, ' · ')} pt</h1><main>${cells.join('')}</main>`;
  const file = join(outDir, `sheet-${tag}.html`);
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: cols * (w + 6) + 16, height: 400 } });
  await page.goto(`file://${file}`);
  await page.waitForLoadState('load');
  const name = `bench-${tag}.jpg`;
  await page.screenshot({ path: join(outDir, name), type: 'jpeg', quality: 72, fullPage: true });
  await page.close();
  rmSync(file);
  return name;
}

await browser.close();
server.close();
rmSync(shots, { recursive: true, force: true });
// The UI check's findings, grouped by what they are and where.
const kinds = {
  small: 'Text below 13 px',
  contrast: 'Text below 4.5 : 1',
  target: 'Buttons below 48 x 48',
  key: 'Key labels not on one line',
};
const unique = new Map();
for (const f of findings) {
  const k = `${f.kind}|${f.look}|${f.theme}|${f.screen}|${f.detail}`;
  if (!unique.has(k)) unique.set(k, { ...f, widths: [] });
  unique.get(k).widths.push(f.width);
}
const rows = [...unique.values()];
const md = [
  `**UI check** (docs/UI.md §10) on the test bench and the home screens: ${looks.length} look(s) × ${themes.length} theme(s) × ${SIZES.length} sizes.`,
  '',
  ...Object.entries(kinds).map(
    ([kind, name]) => `- ${name}: **${rows.filter((r) => r.kind === kind).length}**`,
  ),
  '',
  rows.length
    ? `<details><summary>${rows.length} findings</summary>\n\n${rows
        .map(
          (r) =>
            `- \`#${r.screen}\` ${r.look} ${r.theme} ${r.widths.join('/')} pt · ${r.kind}: ${String(r.detail).replace(/[`|]/g, "'")}`,
        )
        .join('\n')}\n\n</details>`
    : 'No findings.',
].join('\n');
writeFileSync(join(outDir, 'ui-check.md'), md + '\n');
writeFileSync(join(outDir, 'ui-check.json'), JSON.stringify(rows, null, 2));
console.log(`\n${md}\n`);
console.log(
  `Wrote ${sheets.length} sheets to ${outDir}${failures ? `; ${failures} screens did not open` : ''}.`,
);
// --strict (CI): a finding fails the run, like a screen that does not open.
process.exit(failures || (flag('--strict') && rows.length) ? 1 : 0);
