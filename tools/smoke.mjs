#!/usr/bin/env node
// The render test (docs/build-plan.md, stage WIRE): opens every screen of every
// lesson by deep link and reports what broke.
//
//   npm run smoke                       build the web export, then test every screen
//   npm run smoke -- --no-build         reuse dist-smoke/ from the last run
//   npm run smoke -- --only chapter-03-orders-costs-position-size,chapter-05-finding-the-trade
//                                       only those chapter folders (content-only PRs)
//   npm run smoke -- --workers 4        pages in parallel (default: one per CPU)
//
// It builds a test build (EXPO_PUBLIC_TEST_TOOLS=1), serves it locally and
// opens it once per worker with `?test=1`, which turns animations off and lets
// each new hash open its screen in place (src/App.tsx). For every screen it
// records:
//   - crash:   the error page ("Something broke") is up;
//   - nan:     `NaN` in a drawn attribute (a price line's y1) or in the text;
//   - console: an error on the console or an uncaught exception;
//   - blank:   nothing to read and nothing drawn.
// It writes smoke/smoke-report.json and one contact sheet per chapter
// (smoke/contact-<chapter>.jpg), and exits 1 when anything was found.
//
// The screen count is checked against `python3 tools/validate_content.py
// --status`, chapter by chapter, so a lesson the app does not know fails too.
import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { cpus } from 'node:os';
import { dirname, extname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist-smoke');
const outDir = join(root, 'smoke');
const shots = join(outDir, 'shots');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const only = (option('--only') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const workers = Number(option('--workers')) || Math.max(1, cpus().length);
const VIEWPORT = { width: 390, height: 844 };

const started = Date.now();
const seconds = () => Math.round((Date.now() - started) / 100) / 10;

// ---------------------------------------------------------------------------
// Build and serve.
// ---------------------------------------------------------------------------

if (!flag('--no-build') || !existsSync(join(dist, 'index.html'))) {
  console.log('Building the web export with the testing tools…');
  // --clear: Metro's cache does not key on EXPO_PUBLIC_* values.
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

// ---------------------------------------------------------------------------
// The screens, as the app knows them and as the validator counts them.
// ---------------------------------------------------------------------------

/** `chapter-03-orders…` → 3. */
const chapterNumber = (folder) => Number(/^chapter-(\d+)/.exec(folder)?.[1]);

/** The validator's screen count per chapter folder (`--status`), or null without Python. */
function validatorCounts() {
  const run = spawnSync('python3', ['tools/validate_content.py', '--status'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (run.status !== 0 && !run.stdout) return null;
  const counts = {};
  for (const line of run.stdout.split('\n')) {
    const m = /^content\/(?:shared|paths\/([\w-]+))\/(chapter-[\w-]+)\s+\d+\s+\d+\s+(\d+)/.exec(
      line,
    );
    if (m) counts[`${m[1] ?? 'all'}/${m[2]}`] = Number(m[3]);
  }
  return counts;
}

/**
 * How many screens tools/validate_content.py counts for one screen (its
 * `screen_units`): a carousel counts its cards, a walkthrough its steps, a
 * checklist half its items, a swipe deck its cards, a branch its steps.
 */
function units([type, cards, steps, items]) {
  if (type === 'carousel') return cards;
  if (type === 'walkthrough') return steps;
  if (type === 'checklist-reveal') return Math.max(1, Math.floor(items / 2));
  if (type === 'swipe-deck') return Math.max(1, cards);
  if (type === 'branch') return Math.max(1, steps);
  return 1;
}

/** A lesson's chapter folder key, `scalping/chapter-03-…`, found from the validator's keys. */
function keyOf(lesson, keys) {
  if (lesson.bench) return 'bench';
  return (
    keys.find((k) => {
      const [path, folder] = k.split('/');
      return path === lesson.path && chapterNumber(folder) === lesson.chapter;
    }) ?? `${lesson.path}/chapter-${String(lesson.chapter).padStart(2, '0')}`
  );
}

// ---------------------------------------------------------------------------
// One screen.
// ---------------------------------------------------------------------------

/** Looks at the screen that is up and says what is wrong with it. */
function inspect() {
  const rootEl = document.getElementById('root');
  const text = (rootEl?.innerText ?? '').trim();
  const crash = text.includes('Something broke');
  const nan = [];
  for (const el of rootEl?.querySelectorAll('*') ?? []) {
    for (const attr of el.attributes) {
      if (/\bNaN\b/.test(attr.value) && attr.name !== 'class') {
        nan.push(`<${el.tagName.toLowerCase()} ${attr.name}="${attr.value.slice(0, 60)}">`);
      }
    }
  }
  if (/\bNaN\b/.test(text)) nan.push('"NaN" in the text');
  const drawn = (rootEl?.querySelectorAll('svg, img').length ?? 0) > 0;
  return {
    crash,
    crashMessage: crash ? text.split('\n').slice(1, 2).join(' ').slice(0, 200) : null,
    nan: nan.slice(0, 5),
    blank: text.length === 0 && !drawn,
  };
}

async function openPage(browser, base) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (err) => errors.push(`Uncaught: ${String(err.message).slice(0, 300)}`));
  await page.goto(`${base}/?test=1`);
  await page.waitForFunction(() => document.documentElement.dataset.visit === '0', null, {
    timeout: 60_000,
  });
  return { page, errors, visit: 0 };
}

async function visitScreen(worker, task) {
  const { page } = worker;
  worker.errors.length = 0;
  worker.visit += 1;
  const expected = String(worker.visit);
  await page.evaluate((hash) => {
    window.location.hash = hash;
  }, `${task.id}/${task.screen}?test=1`);
  await page.waitForFunction((v) => document.documentElement.dataset.visit === v, expected, {
    timeout: 20_000,
  });
  // Two frames: layout that measures itself (fit.tsx, charts) settles.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))),
  );
  const found = await page.evaluate(inspect);
  const shot = join(shots, `${task.n}.jpg`);
  await page.screenshot({ path: shot, type: 'jpeg', quality: 55 });
  return { ...found, console: [...worker.errors] };
}

// ---------------------------------------------------------------------------
// Contact sheets.
// ---------------------------------------------------------------------------

async function contactSheet(browser, key, tasks, results) {
  const cols = 16;
  const cells = tasks
    .map((t) => {
      const r = results[t.n];
      const bad = r.problems.length > 0;
      return `<figure class="${bad ? 'bad' : ''}"><img src="shots/${t.n}.jpg"><figcaption>${t.id.replace(/^[\w-]+-ch\d+-/, '')}/${t.screen}${bad ? ` · ${r.problems.map((p) => p.kind).join(', ')}` : ''}</figcaption></figure>`;
    })
    .join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#111;color:#ddd;font:10px system-ui,sans-serif}
    h1{font-size:16px;margin:8px}
    main{display:grid;grid-template-columns:repeat(${cols},98px);gap:4px;padding:8px}
    figure{margin:0}img{width:98px;height:212px;display:block;border:2px solid #333}
    figure.bad img{border-color:#f33}figure.bad figcaption{color:#f66}
    figcaption{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:98px}
  </style><h1>${key} · ${tasks.length} screens · ${tasks.filter((t) => results[t.n].problems.length).length} with problems</h1><main>${cells}</main>`;
  const file = join(outDir, `sheet-${key.replace(/\//g, '_')}.html`);
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: cols * 102 + 16, height: 400 } });
  await page.goto(`file://${file}`);
  await page.waitForLoadState('load');
  const name = `contact-${key.split('/').pop()}.jpg`;
  await page.screenshot({ path: join(outDir, name), type: 'jpeg', quality: 70, fullPage: true });
  await page.close();
  rmSync(file);
  return name;
}

// ---------------------------------------------------------------------------
// Run.
// ---------------------------------------------------------------------------

rmSync(outDir, { recursive: true, force: true });
mkdirSync(shots, { recursive: true });

const server = await serve(dist);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

const first = await openPage(browser, base);
const lessons = await first.page.evaluate(() => window.__lessons);
const counts = validatorCounts();
const keys = counts ? Object.keys(counts) : [];

const tasks = [];
for (const lesson of lessons) {
  const key = keyOf(lesson, keys);
  if (only.length && !only.some((o) => key.endsWith(`/${o}`) || key === o)) continue;
  for (let screen = 1; screen <= lesson.screens; screen++) {
    tasks.push({
      n: tasks.length,
      id: lesson.id,
      screen,
      key,
      units: units(lesson.shape[screen - 1]),
    });
  }
}
console.log(
  `${tasks.length} screens in ${new Set(tasks.map((t) => t.id)).size} lessons, ${workers} pages in parallel…`,
);

const pages = [first];
for (let i = 1; i < workers; i++) pages.push(await openPage(browser, base));

const results = new Array(tasks.length);
let next = 0;
let finished = 0;
await Promise.all(
  pages.map(async (worker) => {
    while (next < tasks.length) {
      const task = tasks[next++];
      let found;
      try {
        found = await visitScreen(worker, task);
      } catch (err) {
        found = { crash: false, nan: [], blank: false, console: [], timeout: String(err.message) };
        // The page may be stuck; start it again for the next screen.
        await worker.page.context().close();
        Object.assign(worker, await openPage(browser, base));
      }
      const problems = [];
      if (found.crash) problems.push({ kind: 'crash', detail: found.crashMessage });
      if (found.nan.length) problems.push({ kind: 'nan', detail: found.nan.join(' ') });
      if (found.blank) problems.push({ kind: 'blank', detail: null });
      if (found.timeout) problems.push({ kind: 'timeout', detail: found.timeout.slice(0, 200) });
      // The error page logs its own throw; that is the crash, not a second finding.
      // A NaN attribute also logs "Expected length, NaN": the same finding.
      const noise = found.crash
        ? /render failed|The above error|Something broke/
        : found.nan.length
          ? /NaN/
          : null;
      const logged = found.console.filter((c) => !(noise && noise.test(c)));
      if (logged.length && !found.crash) problems.push({ kind: 'console', detail: logged[0] });
      results[task.n] = { problems };
      finished += 1;
      if (finished % 500 === 0) console.log(`  ${finished}/${tasks.length} (${seconds()} s)`);
    }
  }),
);

// Totals, per chapter and overall.
const KINDS = ['crash', 'nan', 'console', 'blank', 'timeout'];
const empty = () => Object.fromEntries(KINDS.map((k) => [k, 0]));
const chapters = {};
const problems = [];
const totals = { screens: tasks.length, lessons: new Set(tasks.map((t) => t.id)).size, ...empty() };
for (const task of tasks) {
  const c = (chapters[task.key] ??= {
    screens: 0,
    units: 0,
    lessons: new Set(),
    validatorScreens: counts?.[task.key] ?? null,
    ...empty(),
  });
  c.screens += 1;
  c.units += task.units;
  c.lessons.add(task.id);
  for (const p of results[task.n].problems) {
    c[p.kind] += 1;
    totals[p.kind] += 1;
    problems.push({
      link: `#${task.id}/${task.screen}`,
      chapter: task.key,
      kind: p.kind,
      detail: p.detail,
    });
  }
}
for (const c of Object.values(chapters)) c.lessons = c.lessons.size;

// The app must open exactly the screens the validator counts.
const mismatches = [];
if (counts) {
  for (const [key, n] of Object.entries(counts)) {
    if (only.length && !only.some((o) => key.endsWith(`/${o}`))) continue;
    const seen = chapters[key]?.units ?? 0;
    if (seen !== n)
      mismatches.push(`${key}: the app has ${seen} screens, the validator counts ${n}`);
  }
}

console.log('Writing contact sheets…');
const sheets = [];
for (const key of Object.keys(chapters)) {
  sheets.push(
    await contactSheet(
      browser,
      key,
      tasks.filter((t) => t.key === key),
      results,
    ),
  );
}

await browser.close();
server.close();
rmSync(shots, { recursive: true, force: true });

const report = {
  finishedAt: new Date().toISOString(),
  seconds: seconds(),
  only: only.length ? only : null,
  totals,
  countCheck: counts
    ? { validatorScreens: Object.values(counts).reduce((a, b) => a + b, 0), mismatches }
    : 'skipped: python3 tools/validate_content.py --status did not run',
  chapters,
  problems,
  sheets,
};
writeFileSync(join(outDir, 'smoke-report.json'), JSON.stringify(report, null, 2));

// The summary, also as Markdown for the CI job page and the PR comment.
const rows = Object.entries(chapters).map(
  ([key, c]) =>
    `| ${key.split('/').pop()} | ${c.lessons} | ${c.screens} | ${c.units}${c.validatorScreens !== null && c.validatorScreens !== c.units ? ` ≠ ${c.validatorScreens}` : ''} | ${c.crash} | ${c.nan} | ${c.console} | ${c.blank} |`,
);
const md = [
  `**Render test:** ${totals.screens} screens in ${totals.lessons} lessons, ${report.seconds} s${only.length ? ` (only ${only.join(', ')})` : ''}.`,
  '',
  `Crashes **${totals.crash}** · NaN **${totals.nan}** · console errors **${totals.console}** · blank **${totals.blank}**${totals.timeout ? ` · timeouts **${totals.timeout}**` : ''}`,
  '',
  counts
    ? mismatches.length
      ? `Screen count vs \`validate_content.py --status\`: **mismatch**\n${mismatches.map((m) => `- ${m}`).join('\n')}`
      : `Every lesson is in the app: its screens, counted the validator's way (a carousel's cards, a deck's cards and a walkthrough's steps count one each), match \`validate_content.py --status\` chapter by chapter (${report.countCheck.validatorScreens}).`
    : 'Screen count not compared (the validator did not run).',
  '',
  '| Chapter | Lessons | Screens opened | Validator count | Crash | NaN | Console | Blank |',
  '|---|---:|---:|---:|---:|---:|---:|---:|',
  ...rows,
  '',
  problems.length
    ? `<details><summary>${problems.length} findings on ${new Set(problems.map((p) => p.link)).size} screens</summary>\n\n${problems
        .map(
          (p) =>
            `- \`${p.link}\` ${p.kind}${p.detail ? `: ${String(p.detail).replace(/[`|]/g, "'").slice(0, 140)}` : ''}`,
        )
        .join('\n')}\n\n</details>`
    : 'No problem screens.',
].join('\n');
writeFileSync(join(outDir, 'summary.md'), md + '\n');

console.log(`\n${md}\n\nReport: ${relative(root, join(outDir, 'smoke-report.json'))}`);
process.exit(problems.length || mismatches.length ? 1 : 0);
