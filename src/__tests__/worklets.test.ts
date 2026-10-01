import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, relative } from 'path';
import ts from 'typescript';

/**
 * Worklets as a phone runs them (David, 2026-10-01: "Chapter complete" on the
 * Animations page crashed the app). On a phone a worklet runs on the UI thread
 * with copies of what it uses; on the web it runs on the JS thread with the
 * real thing. So two mistakes work on the web, where the smoke run and the
 * contact sheets look, and only go wrong on a phone:
 *
 * - A worklet calling a plain function. The UI thread has no plain functions,
 *   only a stand-in that throws ("Tried to synchronously call a Remote
 *   Function") and takes the app down. A value a plain function gives is
 *   worked out on the JS thread first, in the component or the effect, and the
 *   worklet takes the number.
 * - A worklet reading `colors` or `LOOKS`. Their getters read the palette in
 *   use, but the phone copies the object the first time a worklet uses it and
 *   keeps that copy, so a change of theme never reaches the worklet. The colour
 *   is read in the component, and the worklet takes the string.
 *
 * A worklet is a function with the 'worklet' directive, or one Reanimated runs
 * as a worklet: useAnimatedStyle's updater, an animation's end callback and the
 * like. Everything inside it counts, the functions nested in it too.
 */

const SRC = join(__dirname, '..');

/** The calls whose function arguments Reanimated runs as worklets, by position. */
const WORKLET_ARGS = new Map<string, number[]>([
  ['useAnimatedStyle', [0]],
  ['useAnimatedProps', [0]],
  ['useDerivedValue', [0]],
  ['useAnimatedReaction', [0, 1]],
  ['useAnimatedScrollHandler', [0]],
  ['useFrameCallback', [0]],
  ['withTiming', [2]],
  ['withSpring', [2]],
  ['withDecay', [1]],
  ['withRepeat', [3]],
  ['runOnUI', [0]],
  ['scheduleOnUI', [0]],
]);
/** Everything in these is a worklet or made to be called from one. */
const UI_MODULES = new Set(['react-native-reanimated', 'react-native-worklets']);
/** Globals the UI thread has as well. */
const GLOBALS = new Set([
  'Math',
  'Number',
  'String',
  'Boolean',
  'Array',
  'Object',
  'JSON',
  'Date',
  'console',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
]);
/** Methods of what a worklet holds: shared values, arrays, strings, numbers. */
const METHODS = new Set([
  'get',
  'set',
  'modify',
  'map',
  'filter',
  'reduce',
  'forEach',
  'some',
  'every',
  'find',
  'findIndex',
  'includes',
  'indexOf',
  'slice',
  'concat',
  'join',
  'push',
  'pop',
  'fill',
  'at',
  'toFixed',
  'toString',
  'padStart',
  'split',
  'trim',
  'replace',
]);
/** The objects whose getters read the palette in use (theme.ts, look.ts). */
const LIVE = new Set(['colors', 'LOOKS']);

type Fn = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const parsed = new Map<string, ts.SourceFile>();

function parse(file: string): ts.SourceFile {
  let source = parsed.get(file);
  if (!source) {
    source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    parsed.set(file, source);
  }
  return source;
}

function isFunction(node: ts.Node): node is Fn {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isMethodDeclaration(node)
  );
}

function hasDirective(fn: Fn): boolean {
  if (!fn.body || !ts.isBlock(fn.body)) return false;
  for (const statement of fn.body.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    if (statement.expression.text === 'worklet') return true;
  }
  return false;
}

/** The worklets in a file: with the directive, or handed to Reanimated. */
function worklets(source: ts.SourceFile): Fn[] {
  const found: Fn[] = [];
  const visit = (node: ts.Node) => {
    if (isFunction(node) && hasDirective(node)) found.push(node);
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      for (const i of WORKLET_ARGS.get(node.expression.text) ?? []) {
        const arg = node.arguments[i];
        if (arg && isFunction(arg) && !hasDirective(arg)) found.push(arg);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function binds(name: ts.BindingName, text: string): boolean {
  if (ts.isIdentifier(name)) return name.text === text;
  return name.elements.some((e) => !ts.isOmittedExpression(e) && binds(e.name, text));
}

/** Every name declared inside a worklet, its parameters included. */
function locals(fn: Fn): Set<string> {
  const names = new Set<string>();
  const add = (name: ts.BindingName) => {
    if (ts.isIdentifier(name)) names.add(name.text);
    else name.elements.forEach((e) => (ts.isOmittedExpression(e) ? null : add(e.name)));
  };
  const visit = (node: ts.Node) => {
    if (ts.isParameter(node) || ts.isVariableDeclaration(node)) add(node.name);
    if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name) {
      names.add(node.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(fn);
  return names;
}

/** What `text` names at `from`: the nearest declaration in an enclosing scope. */
function declaration(text: string, from: ts.Node): ts.Node | undefined {
  for (let scope: ts.Node | undefined = from; scope; scope = scope.parent) {
    if (isFunction(scope)) {
      const param = scope.parameters.find((p) => binds(p.name, text));
      if (param) return param;
    }
    if (!ts.isSourceFile(scope) && !ts.isBlock(scope)) continue;
    for (const statement of scope.statements) {
      if (ts.isFunctionDeclaration(statement) && statement.name?.text === text) return statement;
      if (ts.isVariableStatement(statement)) {
        const found = statement.declarationList.declarations.find((d) => binds(d.name, text));
        if (found) return found;
      }
      const bindings = ts.isImportDeclaration(statement)
        ? statement.importClause?.namedBindings
        : undefined;
      if (bindings && ts.isNamedImports(bindings)) {
        const found = bindings.elements.find((e) => e.name.text === text);
        if (found) return found;
      }
    }
  }
  return undefined;
}

function moduleOf(node: ts.Node): string {
  while (!ts.isSourceFile(node) && !ts.isImportDeclaration(node)) node = node.parent;
  return ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)
    ? node.moduleSpecifier.text
    : '';
}

function resolveModule(from: string, specifier: string): string | undefined {
  const base = join(dirname(from), specifier);
  return [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')].find(
    (file) => existsSync(file),
  );
}

/** The declaration behind `text` in a file's exports. */
function exported(file: string, text: string): ts.Node | undefined {
  const source = parse(file);
  for (const statement of source.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.exportClause) continue;
    if (!ts.isNamedExports(statement.exportClause)) continue;
    const found = statement.exportClause.elements.find((e) => e.name.text === text);
    if (!found) continue;
    const local = (found.propertyName ?? found.name).text;
    if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
      return declaration(local, source);
    }
    const next = resolveModule(file, statement.moduleSpecifier.text);
    return next ? exported(next, local) : undefined;
  }
  return declaration(text, source);
}

/** Whether a worklet may call what `node` declares: another worklet, or Reanimated. */
function callable(node: ts.Node | undefined, text: string): boolean {
  if (!node) return GLOBALS.has(text);
  if (ts.isImportSpecifier(node)) {
    const module = moduleOf(node);
    if (UI_MODULES.has(module)) return true;
    const file = module.startsWith('.')
      ? resolveModule(node.getSourceFile().fileName, module)
      : undefined;
    const name = (node.propertyName ?? node.name).text;
    return file !== undefined && callable(exported(file, name), name);
  }
  if (isFunction(node)) return hasDirective(node);
  if (ts.isVariableDeclaration(node) && node.initializer && isFunction(node.initializer)) {
    return hasDirective(node.initializer);
  }
  return false;
}

/** Whether a worklet may call `callee`; `own` holds the names declared inside it. */
function safeCall(callee: ts.Expression, own: Set<string>): boolean {
  if (ts.isIdentifier(callee)) {
    return own.has(callee.text) || callable(declaration(callee.text, callee), callee.text);
  }
  // `runOnJS(f)(x)`: what is called is what Reanimated made.
  if (ts.isCallExpression(callee)) return safeCall(callee.expression, own);
  if (!ts.isPropertyAccessExpression(callee)) return false;
  if (METHODS.has(callee.name.text)) return true;
  let root: ts.Expression = callee.expression;
  while (ts.isPropertyAccessExpression(root) || ts.isElementAccessExpression(root)) {
    root = root.expression;
  }
  if (!ts.isIdentifier(root)) return false;
  if (own.has(root.text)) return true;
  const node = declaration(root.text, root);
  return node ? UI_MODULES.has(moduleOf(node)) : GLOBALS.has(root.text);
}

function where(source: ts.SourceFile, node: ts.Node): string {
  const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  return `${relative(SRC, source.fileName)}:${line}`;
}

describe('worklets work the same on a phone as on the web', () => {
  it('calls only worklets from a worklet', () => {
    const found = new Set<string>();
    for (const file of files(SRC)) {
      const source = parse(file);
      for (const fn of worklets(source)) {
        const own = locals(fn);
        const visit = (node: ts.Node) => {
          if (ts.isCallExpression(node) && !safeCall(node.expression, own)) {
            found.add(`${where(source, node)} ${node.expression.getText()}`);
          }
          ts.forEachChild(node, visit);
        };
        visit(fn);
      }
      // An animation's end callback named rather than written in place is
      // called on the UI thread just the same.
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          for (const i of WORKLET_ARGS.get(node.expression.text) ?? []) {
            const arg = node.arguments[i];
            if (
              arg &&
              ts.isIdentifier(arg) &&
              arg.text !== 'undefined' &&
              !callable(declaration(arg.text, arg), arg.text)
            ) {
              found.add(`${where(source, arg)} ${node.expression.text}(…, ${arg.text})`);
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect([...found]).toEqual([]);
  });

  it('reads no colour from colors or LOOKS in a worklet', () => {
    const found = new Set<string>();
    for (const file of files(SRC)) {
      const source = parse(file);
      for (const fn of worklets(source)) {
        const visit = (node: ts.Node) => {
          const parent = node.parent;
          if (
            ts.isIdentifier(node) &&
            LIVE.has(node.text) &&
            !(ts.isPropertyAccessExpression(parent) && parent.name === node)
          ) {
            found.add(`${where(source, node)} ${parent.getText()}`);
          }
          ts.forEachChild(node, visit);
        };
        visit(fn);
      }
    }
    expect([...found]).toEqual([]);
  });
});
