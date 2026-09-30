#!/usr/bin/env node
// The static half of the UI check (docs/UI.md §10, stage LOOK-SYSTEM). It
// reads the colour and type tokens as data -- src/themeTokens.ts and
// src/lesson/lookSpecs.ts -- and fails when
//   - a text colour is below 4.5 : 1 on a ground or surface it is drawn on,
//     in dark and light, with and without the colour-blind palette, in each
//     of the three looks;
//   - a label is below 4.5 : 1 on the key or fill it is drawn on;
//   - a type style, or a font size written in src/, is below 13 pt.
// The measured half (tools/ui_audit.mjs, run by `npm run sheets`) checks the
// screens as drawn.
//
//   npm run check:ui
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Loads a dependency-free TypeScript module as it is. */
async function load(file) {
  const out = ts.transpileModule(readFileSync(join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dir = mkdtempSync(join(tmpdir(), 'check-ui-'));
  const path = join(dir, 'module.mjs');
  writeFileSync(path, out);
  try {
    return await import(pathToFileURL(path).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const tokens = await load('src/themeTokens.ts');
const looks = await load('src/lesson/lookSpecs.ts');

// ---------------------------------------------------------------------------
// Colour.
// ---------------------------------------------------------------------------

function parse(value) {
  const v = value.trim();
  if (v.startsWith('#')) {
    const h = v.slice(1);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(a);
  }
  const m = /rgba?\(([^)]+)\)/.exec(v);
  if (!m) throw new Error(`Not a colour: ${value}`);
  const p = m[1].split(',').map(Number);
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
const over = (top, bottom) =>
  [0, 1, 2].map((i) => top[i] * top[3] + bottom[i] * (1 - top[3])).concat(1);
const lum = (c) => {
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
/** Colours laid over each other, bottom first: the ground, a surface, a tint. */
const stack = (...layers) => layers.map(parse).reduce((below, top) => over(top, below));

const NEED = 4.5;
const failures = [];
let pairs = 0;
function check(where, textColor, ...ground) {
  pairs += 1;
  const bg = stack(...ground);
  const r = ratio(over(parse(textColor), bg), bg);
  if (r < NEED - 0.005)
    failures.push(`${where}: ${r.toFixed(2)} : 1 (${textColor} on ${ground.join(' + ')})`);
}

/** Every colour that is used for text. */
const TEXT = ['text', 'textMuted', 'textFaint', 'accent', 'up', 'down', 'warning', 'success'];

for (const scheme of ['dark', 'light']) {
  for (const cb of [false, true]) {
    const p = tokens.paletteFor(scheme, cb);
    const tag = `${scheme}${cb ? ' colour-blind' : ''}`;
    for (const id of looks.LOOK_ORDER) {
      const look = looks.LOOK_SPECS[id][scheme];
      const ground = look.ground.color;
      // The grounds and surfaces text sits on in this look.
      const grounds = {
        ground: [ground],
        'look surface': [ground, look.surface.background],
        surface: [ground, p.surface],
        surfaceAlt: [ground, p.surfaceAlt],
      };
      for (const [name, layers] of Object.entries(grounds)) {
        for (const t of TEXT) check(`${tag} ${id}: ${t} on ${name}`, p[t], ...layers);
      }
      // A revealed answer: its verdict colour and the text on its tint.
      for (const [ink, wash] of [
        ['success', 'successTint'],
        ['down', 'downTint'],
        ['warning', 'warningTint'],
        ['accent', 'accentTint'],
      ]) {
        for (const base of ['look surface', 'surface']) {
          const layers = [...grounds[base], p[wash]];
          check(`${tag} ${id}: ${ink} on ${wash} over ${base}`, p[ink], ...layers);
          check(`${tag} ${id}: text on ${wash} over ${base}`, p.text, ...layers);
          check(`${tag} ${id}: textFaint on ${wash} over ${base}`, p.textFaint, ...layers);
        }
      }
      // The key's label on its face, and text on the look's accent.
      check(`${tag} ${id}: key label`, look.cta.text, look.cta.face);
      check(`${tag} ${id}: accentText on accent`, look.accentText, look.accent);
    }
    // Filled buttons and badges.
    check(`${tag}: accentText on accentFill`, p.accentText, p.accentFill);
    check(`${tag}: successText on successFill`, p.successText, p.successFill);
    check(`${tag}: accentText on dangerFill`, p.accentText, p.dangerFill);
  }
}

// ---------------------------------------------------------------------------
// Size.
// ---------------------------------------------------------------------------

const MIN = tokens.MIN_FONT;
for (const [name, step] of Object.entries(tokens.TYPE_SCALE)) {
  if (step.fontSize < MIN) failures.push(`type.${name}: ${step.fontSize} pt, below ${MIN}`);
}
if (tokens.TAP_TARGET < 48) failures.push(`TAP_TARGET is ${tokens.TAP_TARGET}, below 48`);

/**
 * Written font sizes in src/: `fontSize: 12` or `fontSize={12}`. A line marked
 * `ui-check: picture` (or the line after it) is exempt: the design picker's miniature of a lesson,
 * drawn to scale and hidden from screen readers. The prototypes of stage
 * LOOK-BRIEF go in its second session.
 */
function sources(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory())
      return name === 'prototype' || name === '__tests__' ? [] : sources(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}
for (const file of sources(join(root, 'src'))) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // The marker covers its own line and the one after it (a JSX comment
    // cannot share a line with the style it marks).
    if (line.includes('ui-check: picture') || lines[i - 1]?.includes('ui-check: picture')) return;
    for (const m of line.matchAll(/fontSize(?::\s*|=\{)(\d+(?:\.\d+)?)\b/g)) {
      if (Number(m[1]) < MIN)
        failures.push(`${relative(root, file)}:${i + 1}: fontSize ${m[1]}, below ${MIN}`);
    }
  });
}

if (failures.length) {
  console.error(`UI check: ${failures.length} failures (of ${pairs} colour pairs):\n`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `UI check: ${pairs} colour pairs at ${NEED} : 1 or more, every type style and written size at ${MIN} pt or more.`,
);
