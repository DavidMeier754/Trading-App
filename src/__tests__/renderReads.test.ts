import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import ts from 'typescript';

/**
 * No shared value is read while React renders (David, 2026-09-30: the app
 * crashed with "[Reanimated] Reading from `value` during component render").
 * Reanimated warns on every re-render that reads one, so a read belongs in a
 * worklet (`useAnimatedStyle`, `useAnimatedReaction` ...), an effect or a
 * handler -- never in a component's or a hook's own body, such as a prop
 * computed from `fill.get()`.
 *
 * Found by reading the source: every `x.get()` with no argument whose
 * nearest enclosing function is a component (a capitalised name) or a hook
 * (`useSomething`).
 */

const SRC = join(__dirname, '..');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

function nameOf(fn: ts.Node): string {
  if (ts.isFunctionDeclaration(fn) && fn.name) return fn.name.text;
  const parent = fn.parent;
  if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.text;
  }
  return '';
}

function isFunction(node: ts.Node): boolean {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isMethodDeclaration(node)
  );
}

describe('shared values are read in worklets, never while React renders', () => {
  it('has no .get() in a component or hook body', () => {
    const found: string[] = [];
    for (const file of files(SRC)) {
      const source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      const visit = (node: ts.Node) => {
        if (
          ts.isCallExpression(node) &&
          node.arguments.length === 0 &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'get'
        ) {
          let fn: ts.Node | undefined = node.parent;
          while (fn && !isFunction(fn)) fn = fn.parent;
          const name = fn ? nameOf(fn) : '';
          if (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name)) {
            const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
            found.push(`${relative(SRC, file)}:${line} ${name}: ${node.getText()}`);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(found).toEqual([]);
  });
});
