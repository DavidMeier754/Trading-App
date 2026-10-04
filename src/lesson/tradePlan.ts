import type { ChartDecisionScreen, ChartSpec } from '../types';

/**
 * The plan a chart decision's file gives (docs/level-files/ `stop`, `target`):
 * where the trade gets in, where it is wrong and where it is done, and where
 * the bars actually took it out. docs/ui/08-quotes-and-charts.md §6.4 (DESIGN-REVIEW): the chart
 * draws these after the choice, playback ends at the first line touched, and
 * the R ruler measures the result in R.
 *
 * Pure, so every case can be tested without drawing a chart
 * (src/__tests__/tradePlan.test.ts).
 */
export type TradePlan = {
  /** +1 for a long (or a Chapter 1 buy), -1 for a short. */
  dir: 1 | -1;
  entry: number;
  stop: number;
  target: number;
  /** One R, per share: the distance to the stop. */
  risk: number;
  /** The target in R. */
  targetR: number;
  exit: TradeExit;
};

export type TradeExit = {
  /** The bar the trade ended on. */
  bar: number;
  price: number;
  /** What ended it: the stop, the target, or the chart running out. */
  reason: 'stop' | 'target' | 'end';
  /** The result in R. */
  r: number;
};

type Bar = { o: number; h: number; l: number; c: number };

function barsOf(spec: ChartSpec): Bar[] {
  if (spec.kind === 'candles') {
    return (spec.data as [number, number, number, number][]).map(([o, h, l, c]) => ({
      o,
      h,
      l,
      c,
    }));
  }
  const closes = spec.data as number[];
  return closes.map((c, i) => {
    const o = i === 0 ? c : closes[i - 1];
    return { o, h: Math.max(o, c), l: Math.min(o, c), c };
  });
}

/** The trade the file describes, or null when it has no stop and target, or no direction. */
export function tradePlanOf(screen: ChartDecisionScreen): TradePlan | null {
  const { stop, target, best } = screen;
  if (typeof stop !== 'number' || typeof target !== 'number') return null;
  const dir: 1 | -1 | 0 = best === 'long' || best === 'buy' ? 1 : best === 'short' ? -1 : 0;
  if (dir === 0) return null;
  const bars = barsOf(screen.chart);
  const at = screen.chart.decision_index;
  if (at < 0 || at >= bars.length) return null;
  const entry = bars[at].c;
  const risk = Math.abs(entry - stop);
  // A plan the validator would refuse (a stop on the wrong side) draws nothing.
  if (risk <= 0 || (target - entry) * dir <= 0 || (entry - stop) * dir <= 0) return null;
  const r = (price: number) => (dir * (price - entry)) / risk;
  let exit: TradeExit = {
    bar: bars.length - 1,
    price: bars[bars.length - 1].c,
    reason: 'end',
    r: r(bars[bars.length - 1].c),
  };
  for (let i = at + 1; i < bars.length; i++) {
    const b = bars[i];
    const hitStop = dir > 0 ? b.l <= stop : b.h >= stop;
    const hitTarget = dir > 0 ? b.h >= target : b.l <= target;
    // Both in one bar: which came first cannot be read from it, so the
    // careful answer -- the stop -- is the one taken.
    if (hitStop) {
      exit = { bar: i, price: stop, reason: 'stop', r: r(stop) };
      break;
    }
    if (hitTarget) {
      exit = { bar: i, price: target, reason: 'target', r: r(target) };
      break;
    }
  }
  return { dir, entry, stop, target, risk, targetR: Math.abs(target - entry) / risk, exit };
}

/** "+1.6R", "−1R", "0R": one decimal, dropped when it is whole. */
export function formatR(r: number): string {
  const rounded = Math.round(r * 10) / 10;
  if (Math.abs(rounded) < 0.05) return '0R';
  const body = Number.isInteger(rounded) ? String(Math.abs(rounded)) : Math.abs(rounded).toFixed(1);
  return `${rounded > 0 ? '+' : '−'}${body}R`;
}
