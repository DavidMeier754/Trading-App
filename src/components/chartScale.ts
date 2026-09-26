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
