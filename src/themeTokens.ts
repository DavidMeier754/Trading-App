/**
 * The app's colour and type tokens as plain data (docs/UI.md §10), in dark and
 * light, with the colour-blind palette on top of either. No imports: the check
 * script (tools/check_ui.mjs) reads this file as it is and measures every text
 * colour against every ground it sits on, so a value here that fails 4.5 : 1
 * fails CI.
 *
 * `src/theme.ts` picks the palette in use and serves it to the app.
 */

export type Scheme = 'light' | 'dark';

export type Palette = {
  /** The app's ground, under the look's own (lesson/lookSpecs.ts). */
  background: string;
  /** Panels and answer rows at rest. */
  surface: string;
  /** Raised or pressed panels, keys that are off, the keypad. */
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  /**
   * The backdrop grid. Two weights: a cell line every GRID, and a heavier one
   * every fourth cell so the grid has a rhythm instead of one flat texture.
   * Measured on a phone at arm's length, not in a capture: weaker than this
   * disappears.
   */
  gridLine: string;
  gridLineMajor: string;

  text: string;
  textMuted: string;
  /** The quietest text: hints, locked labels. Still 4.5 : 1, like all text. */
  textFaint: string;

  /** Selection, links, lines and text in the accent. */
  accent: string;
  /** A filled button or badge in the accent, deep enough to hold white text. */
  accentFill: string;
  /** Text and icons on `accentFill`. */
  accentText: string;

  /** Chart data and results: up, down. Never the only signal (an arrow or sign goes with it). */
  up: string;
  down: string;
  /** Amber: a reasonable answer, a warning. */
  warning: string;
  /** A right answer. */
  success: string;
  /** A filled right-answer key (the lesson's key after a right answer). */
  successFill: string;
  /** Text on `successFill`. */
  successText: string;
  /** A button that destroys something (Reset progress). White text on it. */
  dangerFill: string;

  // Tints behind revealed answers.
  successTint: string;
  downTint: string;
  warningTint: string;
  accentTint: string;

  /** Around the app on a wide screen, and the ground's vignette (dark only). */
  shade: string;
  /** A sheet's scrim over the screen. */
  scrim: string;
};

const DARK: Palette = {
  background: '#0E1116',
  surface: '#171C23',
  surfaceAlt: '#1F2630',
  border: '#2A323D',
  borderStrong: '#3A4553',
  gridLine: 'rgba(255, 255, 255, 0.075)',
  gridLineMajor: 'rgba(255, 255, 255, 0.15)',

  text: '#E8ECF1',
  textMuted: '#A7B2C0',
  textFaint: '#939FAE',

  accent: '#5A96FF',
  accentFill: '#2F6FEB',
  accentText: '#FFFFFF',

  up: '#26C281',
  down: '#F4665E',
  warning: '#E5A23C',
  success: '#26C281',
  successFill: '#26C281',
  successText: '#06200F',
  dangerFill: '#C9362F',

  successTint: 'rgba(38, 194, 129, 0.14)',
  downTint: 'rgba(244, 102, 94, 0.14)',
  warningTint: 'rgba(229, 162, 60, 0.14)',
  accentTint: 'rgba(90, 150, 255, 0.14)',

  shade: '#000000',
  scrim: 'rgba(0, 0, 0, 0.6)',
};

/**
 * Light: the prototype's light versions from stage LOOK-BRIEF (David,
 * 2026-09-29: "good as a start"), tuned until every text passes.
 */
const LIGHT: Palette = {
  background: '#EEF1F5',
  surface: '#FFFFFF',
  surfaceAlt: '#E4E8EE',
  border: '#D3D9E1',
  borderStrong: '#AEB8C5',
  gridLine: 'rgba(16, 24, 40, 0.06)',
  gridLineMajor: 'rgba(16, 24, 40, 0.11)',

  text: '#121821',
  textMuted: '#414B58',
  textFaint: '#4C5765',

  accent: '#1F59CC',
  accentFill: '#2360D8',
  accentText: '#FFFFFF',

  up: '#136B42',
  down: '#B02A25',
  warning: '#7A4E00',
  success: '#136B42',
  successFill: '#157347',
  successText: '#FFFFFF',
  dangerFill: '#B02A25',

  successTint: 'rgba(21, 115, 71, 0.10)',
  downTint: 'rgba(176, 42, 37, 0.09)',
  warningTint: 'rgba(122, 78, 0, 0.10)',
  accentTint: 'rgba(31, 89, 204, 0.10)',

  shade: '#CDD3DC',
  scrim: 'rgba(16, 24, 40, 0.45)',
};

/**
 * The colour-blind palette (docs/UI.md §10): up and right in blue, down and
 * wrong in orange, amber in a yellow that neither is. It changes these and
 * nothing else, and applies to charts too.
 */
const COLOUR_BLIND: Record<Scheme, Partial<Palette>> = {
  dark: {
    up: '#4FA3FF',
    success: '#4FA3FF',
    successFill: '#4FA3FF',
    successText: '#04172E',
    down: '#F28A2E',
    warning: '#E8D44D',
    successTint: 'rgba(79, 163, 255, 0.14)',
    downTint: 'rgba(242, 138, 46, 0.14)',
    warningTint: 'rgba(232, 212, 77, 0.14)',
  },
  light: {
    up: '#1A5BBF',
    success: '#1A5BBF',
    successFill: '#1A5BBF',
    successText: '#FFFFFF',
    down: '#9A4A00',
    warning: '#6A5C00',
    successTint: 'rgba(26, 91, 191, 0.10)',
    downTint: 'rgba(154, 74, 0, 0.10)',
    warningTint: 'rgba(106, 92, 0, 0.10)',
  },
};

export function paletteFor(scheme: Scheme, colourBlind: boolean): Palette {
  const base = scheme === 'light' ? LIGHT : DARK;
  return colourBlind ? { ...base, ...COLOUR_BLIND[scheme] } : base;
}

/**
 * Calm's type scale from stage LOOK-BRIEF (docs/UI.md §10): display 30, title
 * 23, prompt 20, body 17, answer 17, label 14, caption 13. Nothing goes below
 * 13 -- not a state chip, not an axis value a question asks about.
 * Numbers take the monospaced face (`mono`) while the words around them keep
 * the text face.
 */
export const TYPE_SCALE = {
  display: { fontSize: 30, lineHeight: 38, fontWeight: '700' },
  title: { fontSize: 23, lineHeight: 30, fontWeight: '700' },
  prompt: { fontSize: 20, lineHeight: 27, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 25, fontWeight: '400' },
  answer: { fontSize: 17, lineHeight: 23, fontWeight: '500' },
  label: { fontSize: 14, lineHeight: 19, fontWeight: '600' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  mono: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
} as const;

/** The smallest type anything may use (docs/UI.md §10). */
export const MIN_FONT = 13;
/** The smallest tap target (docs/UI.md §1.3, §10). */
export const TAP_TARGET = 48;
