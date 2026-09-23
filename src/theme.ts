// docs/UI.md §10 names the tokens (background, surface, text, accent, up-green,
// down-red, warning, success) but not their values. The values below are this
// player's choices; they are listed in the build report.

export const colors = {
  background: '#0E1116',
  surface: '#171C23',
  surfaceAlt: '#1F2630',
  border: '#2A323D',
  /**
   * The backdrop grid. Two weights: a cell line every GRID, and a heavier one
   * every fourth cell so the grid has a rhythm instead of one flat texture.
   *
   * These were far weaker at first -- 4% white, which measures fine in a
   * screenshot on a large display and is invisible on a phone at arm's length.
   * Read on the device, not in a capture.
   */
  gridLine: 'rgba(255, 255, 255, 0.075)',
  gridLineMajor: 'rgba(255, 255, 255, 0.15)',
  borderStrong: '#3A4553',

  text: '#E8ECF1',
  textMuted: '#93A0B1',
  textFaint: '#66717F',

  accent: '#4C8DFF',
  accentText: '#FFFFFF',

  up: '#26C281',
  down: '#F0574F',
  warning: '#E5A23C',
  success: '#26C281',

  // tints used behind revealed answers
  successTint: 'rgba(38, 194, 129, 0.14)',
  downTint: 'rgba(240, 87, 79, 0.14)',
  warningTint: 'rgba(229, 162, 60, 0.14)',
  accentTint: 'rgba(76, 141, 255, 0.14)',
};

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

export const type = {
  // docs/UI.md §10 asks for dynamic type to 130% without truncation; nothing is
  // height-clamped, and a screen that grows past its window is scaled to fit
  // it (lesson/fit.tsx) rather than cut off.
  display: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 29, fontWeight: '700' as const },
  prompt: { fontSize: 19, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  answer: { fontSize: 16, lineHeight: 22, fontWeight: '500' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  mono: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
};

/** docs/UI.md §1.3 / §10: minimum tap target. */
export const TAP_TARGET = 48;

/**
 * The backdrop grid cell, in points. The chart's price gridlines are snapped to
 * multiples of it so the two grids read as one grid rather than as two that
 * nearly line up.
 */
export const GRID = 28;
/** Price gridlines sit every second cell; four lines make three gaps. */
export const CHART_GRID_STEP = GRID * 2;
export const CHART_PLOT_H = CHART_GRID_STEP * 3;
