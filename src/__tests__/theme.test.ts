import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import ts from 'typescript';

/**
 * Light, dark and the colour-blind palette (src/theme.ts) work because every
 * colour is read when a screen is drawn. A colour copied into a module-level
 * constant is read once, at import, and keeps the palette the app started
 * with: a dark key in a light app. This finds every `colors.x` that is not
 * inside a function (a component, a hook, `themed(() => …)`).
 */

const SRC = join(__dirname, '..');
// The prototypes of stage LOOK-BRIEF carry their own palettes and go in LOOK-SYSTEM's second session.
const SKIP = ['prototype', '__tests__'];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return SKIP.includes(name) ? [] : files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

function moduleLevelReads(path: string): string[] {
  const text = readFileSync(path, 'utf8');
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const visit = (node: ts.Node, inFunction: boolean) => {
    const inside = inFunction || ts.isFunctionLike(node);
    if (
      !inside &&
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'colors'
    ) {
      const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      found.push(`${relative(SRC, path)}:${line} ${node.getText()}`);
    }
    node.forEachChild((child) => visit(child, inside));
  };
  visit(source, false);
  return found;
}

test('no colour is read at import', () => {
  expect(files(SRC).flatMap(moduleLevelReads)).toEqual([]);
});

test('the theme switches every colour, and themed styles follow it', () => {
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const theme = require('../theme') as typeof import('../theme');
    const styles = theme.themed(() => ({ text: { color: theme.colors.text } }));
    theme.setThemeMode('dark');
    const dark = styles.text.color;
    expect(theme.colors.background).toBe('#0E1116');
    theme.setThemeMode('light');
    expect(theme.getScheme()).toBe('light');
    expect(theme.colors.background).not.toBe('#0E1116');
    expect(styles.text.color).not.toBe(dark);
    theme.setColourBlind(true);
    expect(theme.colors.up).not.toBe('#136B42');
  });
});
