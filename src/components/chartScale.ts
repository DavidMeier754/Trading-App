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
 * The steps a price axis counts in (docs/ui/08-quotes-and-charts.md §6.4): a
 * cent or two on the tightest charts, then fives of cents, quarters, halves
 * and whole dollars -- whole from a dollar up, so a label on a $120 stock
 * reads "$125" and fits the axis. Finer than the 1-2-5 series, so the frame a step forces
 * is rarely much taller than the bars need -- with 0.05 / 0.10 / 0.25 alone
 * the bars filled 60 % of the plot on the median chart, with these 75 %.
 */
export const AXIS_STEPS = [
  0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50,
  100,
];

/**
 * A price window on round prices: `gaps` equal steps from one of AXIS_STEPS,
 * holding at least lo..hi. The gridlines are fixed fractions of the plot
 * (they sit on the backdrop's grid), so rounding the window is what makes
 * their labels round.
 *
 * Each step is tried with every line on a multiple of the step ($16.00,
 * $16.40, $16.80), then, where that cannot hold lo..hi, on multiples of five
 * cents ($15.65, $16.05, $16.45) -- still round prices, and a frame a whole
 * step shorter than the next step up would need, so the candles stay tall.
 *
 * Of the windows a step allows, the one whose middle is nearest the middle
 * of lo..hi: a decision chart's frame is centred on the bars the learner can
 * see (§6.4), and rounding moves that middle by under half a step, the same
 * way whatever the price does next.
 */
export function roundFrame(
  lo: number,
  hi: number,
  gaps: number,
): { lo: number; hi: number; step: number } {
  const g = Math.max(1, gaps);
  const mid = (lo + hi) / 2;
  for (const step of AXIS_STEPS) {
    // Whole cents, so 0.1 + 0.2 never lands a label on 0.30000000000000004.
    const units = Math.round(step * 100);
    for (const grain of units > 5 ? [units, 5] : [units]) {
      // The first line sits on a multiple of `grain`, at or under lo, with
      // the last at or over hi.
      const kMin = Math.ceil((hi * 100 - g * units) / grain - 1e-6);
      const kMax = Math.floor((lo * 100) / grain + 1e-6);
      if (kMin > kMax) continue;
      const ideal = (mid * 100 - (g * units) / 2) / grain;
      const k = Math.min(kMax, Math.max(kMin, Math.round(ideal)));
      return { lo: (k * grain) / 100, hi: (k * grain + g * units) / 100, step };
    }
  }
  // Past every step: a window as tall as asked, unrounded.
  return { lo, hi, step: (hi - lo) / g };
}
