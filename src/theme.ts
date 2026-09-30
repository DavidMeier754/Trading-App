import { useSyncExternalStore } from 'react';
import { Appearance, Platform, StyleSheet } from 'react-native';

import { paletteFor, TYPE_SCALE, type Palette, type Scheme } from './themeTokens';

export { MIN_FONT, TAP_TARGET, type Palette, type Scheme } from './themeTokens';

/**
 * The theme in use: light, dark or the phone's own (docs/UI.md §10), and the
 * colour-blind palette on top. The values are in `themeTokens.ts`; this file
 * serves the ones in use to the app.
 *
 * How a colour reaches the screen. `colors.text` reads the palette in use at the
 * moment it is read, and module-level styles are made with `themed()`, which
 * builds them once per palette. The app draws itself afresh when the theme
 * changes (App.tsx keys its tree on `useThemeKey()`), so every read happens
 * under the new palette. What must not happen is a colour copied into a
 * module-level constant at import -- it would keep the palette the app started
 * with. `src/__tests__/theme.test.ts` fails on one.
 */

export type ThemeMode = 'system' | 'light' | 'dark';

let mode: ThemeMode = 'system';
let colourBlind = false;
let systemScheme: Scheme = readSystemScheme();
/** While a lesson is open the phone's own switch waits (a lesson never redraws under the learner). */
let hold = false;

/** The theme on screen. It trails the settings only while `hold` is on. */
let applied = { scheme: resolve(), colourBlind };
let palette: Palette = paletteFor(applied.scheme, applied.colourBlind);
let key = keyOf(applied);

const listeners = new Set<() => void>();

function readSystemScheme(): Scheme {
  return Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
}

function resolve(): Scheme {
  return mode === 'system' ? systemScheme : mode;
}

function keyOf(a: { scheme: Scheme; colourBlind: boolean }): string {
  return `${a.scheme}${a.colourBlind ? '-cb' : ''}`;
}

/** Puts the settings on screen, if they differ from what is there. */
function apply(): void {
  const next = { scheme: resolve(), colourBlind };
  const nextKey = keyOf(next);
  if (nextKey !== key) {
    applied = next;
    palette = paletteFor(next.scheme, next.colourBlind);
    key = nextKey;
  }
  listeners.forEach((listener) => listener());
}

Appearance.addChangeListener(({ colorScheme }) => {
  systemScheme = colorScheme === 'light' ? 'light' : 'dark';
  if (!hold) apply();
});

export function setThemeMode(next: ThemeMode): void {
  if (next === mode) return;
  mode = next;
  apply();
}

export function getThemeMode(): ThemeMode {
  return mode;
}

export function setColourBlind(next: boolean): void {
  if (next === colourBlind) return;
  colourBlind = next;
  apply();
}

export function isColourBlind(): boolean {
  return colourBlind;
}

/**
 * While a lesson is open, the phone switching to dark at sunset waits until
 * the lesson closes: redrawing the app would lose the learner's place.
 */
export function holdSystemTheme(next: boolean): void {
  hold = next;
  if (!hold) apply();
}

/** The scheme on screen: light or dark. */
export function getScheme(): Scheme {
  return applied.scheme;
}

/** Called whenever a theme setting changes (the settings are saved from here). */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getKey = () => key;

/** Changes whenever the palette on screen does; App.tsx redraws on it. */
export function useThemeKey(): string {
  return useSyncExternalStore(subscribeTheme, getKey, getKey);
}

export function useScheme(): Scheme {
  useThemeKey();
  return applied.scheme;
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribeTheme, getThemeMode, getThemeMode);
}

export function useColourBlind(): boolean {
  return useSyncExternalStore(subscribeTheme, isColourBlind, isColourBlind);
}

/** The palette in use, read field by field when it is read. */
export const colors = {} as Palette;
for (const name of Object.keys(paletteFor('dark', false)) as (keyof Palette)[]) {
  Object.defineProperty(colors, name, { enumerable: true, get: () => palette[name] });
}

/**
 * Styles that use colours: `themed(() => ({ … colors.text … }))` in place of
 * `StyleSheet.create({ … })`. The sheet is made on first use under each
 * palette and kept.
 */
export function themed<T extends StyleSheet.NamedStyles<T>>(make: () => T): T {
  const sheets = new Map<string, T>();
  const current = (): T => {
    let sheet = sheets.get(key);
    if (!sheet) {
      sheet = StyleSheet.create(make());
      sheets.set(key, sheet);
    }
    return sheet;
  };
  return new Proxy({} as T, {
    get: (_target, prop) => current()[prop as keyof T],
    has: (_target, prop) => prop in current(),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_target, prop) => ({
      enumerable: true,
      configurable: true,
      value: current()[prop as keyof T],
    }),
  });
}

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

/** The monospaced face numbers take (docs/UI.md §10); the words around them keep the text face. */
export const MONO_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  default: 'monospace',
});

export const type = {
  // docs/UI.md §10 asks for dynamic type to 130% without truncation; nothing is
  // height-clamped, and a screen that grows past its window is scaled to fit
  // it (lesson/fit.tsx) rather than cut off.
  ...TYPE_SCALE,
  mono: { ...TYPE_SCALE.mono, fontFamily: MONO_FONT },
};

/**
 * The backdrop grid cell, in points. The chart's price gridlines are snapped to
 * multiples of it so the two grids read as one grid rather than as two that
 * nearly line up.
 */
export const GRID = 28;
/** Price gridlines sit every second cell; four lines make three gaps. */
export const CHART_GRID_STEP = GRID * 2;
export const CHART_PLOT_H = CHART_GRID_STEP * 3;
