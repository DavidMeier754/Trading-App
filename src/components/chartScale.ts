/**
 * The smallest price span a line chart is drawn over.
 *
 * Scaled to its own extremes, four cents of drift on an $8 stock fills the
 * whole plot, and a chart the lesson calls flat -- "nothing is moving" -- looks
 * like the wildest one in the lesson. Below 1.5 % of the price (and never under
 * 12 cents) the frame widens evenly around the middle instead, so a quiet
 * chart reads as quiet. Candles are left alone: their tight intraday ranges are
 * the point of those charts.
 */
export function floorSpan(
  kind: string | undefined,
  lo: number,
  hi: number,
): { lo: number; hi: number } {
  if (kind === 'candles') return { lo, hi };
  const mid = (lo + hi) / 2;
  const floor = Math.max(0.12, Math.abs(mid) * 0.015);
  if (hi - lo >= floor) return { lo, hi };
  return { lo: mid - floor / 2, hi: mid + floor / 2 };
}

/**
 * The steps a price axis counts in (docs/ui/08-quotes-and-charts.md §6.4): cents, fives of
 * cents, dimes, quarters, halves, dollars and on up -- the steps a trading
 * platform's price scale uses.
 */
export const AXIS_STEPS = [
  0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500,
];

/** The least room between two gridlines, in points, so their prices never crowd. */
export const MIN_TICK_GAP = 44;

/**
 * The gridlines of a price axis, TradingView's way: the frame is what the bars
 * need, and the lines fall on round prices inside it -- every multiple of the
 * finest step that keeps them at least MIN_TICK_GAP apart on a plot `plotH`
 * points tall. Stretch the axis and the step gets finer; squeeze it and it
 * gets coarser.
 */
export function niceTicks(
  lo: number,
  hi: number,
  plotH: number,
): { ticks: number[]; step: number } {
  const span = hi - lo;
  if (!(span > 0) || !(plotH > 0)) return { ticks: [], step: 1 };
  const step =
    AXIS_STEPS.find((s) => (s / span) * plotH >= MIN_TICK_GAP) ?? AXIS_STEPS[AXIS_STEPS.length - 1];
  // Whole cents, so 0.1 + 0.2 never lands a label on 0.30000000000000004.
  const units = Math.round(step * 100);
  const ticks: number[] = [];
  for (let k = Math.ceil((lo * 100) / units - 1e-6); k * units <= hi * 100 + 1e-6; k++) {
    ticks.push((k * units) / 100);
  }
  return { ticks, step };
}

/**
 * A price window stretched or squeezed about its middle: `scale` above 1
 * squeezes the bars (more prices on the axis), below 1 stretches them.
 */
export function scaleFrame(lo: number, hi: number, scale: number): { lo: number; hi: number } {
  const mid = (lo + hi) / 2;
  const half = ((hi - lo) / 2) * scale;
  return { lo: mid - half, hi: mid + half };
}

/** How far the price axis can be stretched and squeezed (TradingView-style drag). */
export const Y_SCALE_MIN = 0.2;
export const Y_SCALE_MAX = 5;

/** The fewest candle slots a pinch can zoom in to. */
export const X_MIN_SLOTS = 4;

/**
 * The bars in view after a pinch (TradingView-style): `count` slots from
 * `start`, zoomed by `scale` about the point under the fingers, which also
 * moves with them -- so a pinch zooms and pans at once. The slot under the
 * fingers stays under the fingers. Never past the first bar or the last slot.
 */
export function pinchView(
  from: { start: number; count: number },
  scale: number,
  /** Where the fingers began and are now, in points from the plot's left edge. */
  focal0: number,
  focal1: number,
  plotW: number,
  total: number,
): { start: number; count: number } {
  const minCount = Math.min(total, X_MIN_SLOTS);
  const count = Math.max(minCount, Math.min(total, from.count / Math.max(0.05, scale)));
  const anchor = from.start + (focal0 / plotW) * from.count;
  const start = anchor - (focal1 / plotW) * count;
  return { start: Math.max(0, Math.min(total - count, start)), count };
}
