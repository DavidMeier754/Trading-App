import { chromium } from '/home/user/Trading-App/node_modules/playwright-core/index.mjs';
import fs from 'fs';
import path from 'path';

const IN = process.argv[2], OUT = process.argv[3], SCALE = Number(process.argv[4] || 3);
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 200, height: 240 }, deviceScaleFactor: SCALE });
for (const file of fs.readdirSync(IN).filter(f => f.endsWith('.svg'))) {
  const svg = fs.readFileSync(path.join(IN, file), 'utf8');
  await page.setContent(`<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>${svg}`);
  await page.waitForTimeout(60);
  const out = path.join(OUT, file.replace('.svg', '.png'));
  await page.screenshot({ path: out, omitBackground: true });
  console.log('->', out);
}
await browser.close();
