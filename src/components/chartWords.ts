import { price } from '../format';
import type { ChartSpec } from '../types';

/**
 * A chart in one sentence, for screen readers (docs/ui/08-quotes-and-charts.md §6.4 [v4]: "Price
 * climbed in steps from 9.80 to 10.05"). Worked out from the bars the learner
 * can see and no others, so before a decision it says nothing of what comes
 * next. Pure, so every shape can be tested without drawing a chart
 * (src/__tests__/chartWords.test.ts).
 */

/** The closes of a chart, whichever kind it is. */
function closesOf(spec: ChartSpec): number[] {
  return (spec.data as (number | number[])[]).map((bar) => (Array.isArray(bar) ? bar[3] : bar));
}

/**
 * What the closes from `from` to `to` (both included) did, as a clause that
 * starts with a verb: "climbed in steps from $9.80 to $10.05".
 */
export function describeMove(closes: number[], from: number, to: number): string {
  const c = closes.slice(Math.max(0, from), Math.max(from, to) + 1);
  if (c.length < 2) return `stood at ${price(c[0] ?? 0)}`;
  const first = c[0];
  const last = c[c.length - 1];
  const hi = Math.max(...c);
  const lo = Math.min(...c);
  const range = hi - lo;
  const change = last - first;
  // Under a cent of travel, or a net move small against the swings: sideways.
  if (range < 0.005) return `held flat at ${price(first)}`;
  const steps = c.slice(1).map((v, i) => v - c[i]);
  const ups = steps.filter((d) => d > 0).length;
  const downs = steps.filter((d) => d < 0).length;
  const peak = c.indexOf(hi);
  const trough = c.indexOf(lo);
  const inside = (i: number) => i > 0 && i < c.length - 1;
  // A turn: the extreme sits inside the stretch and price gave back a good
  // part of the way to it.
  if (inside(peak) && hi - Math.max(first, last) > range * 0.35) {
    return `rose from ${price(first)} to ${price(hi)}, then fell back to ${price(last)}`;
  }
  if (inside(trough) && Math.min(first, last) - lo > range * 0.35) {
    return `fell from ${price(first)} to ${price(lo)}, then climbed back to ${price(last)}`;
  }
  if (Math.abs(change) < range * 0.3) {
    return `moved sideways between ${price(lo)} and ${price(hi)}, ending at ${price(last)}`;
  }
  const rising = change > 0;
  const steady = (rising ? downs : ups) === 0;
  const verb = rising ? 'climbed' : 'fell';
  const how = steady ? ' steadily' : (rising ? ups : downs) > steps.length / 2 ? ' in steps' : '';
  return `${verb}${how} from ${price(first)} to ${price(last)}`;
}

/**
 * The sentence a chart is read as. `shown` is how many bars are on screen; on
 * a decision chart `decisionAt` is the bar the call is made on, and once bars
 * past it are shown the sentence tells the two parts apart.
 */
export function describeChart(
  spec: ChartSpec,
  shown: number,
  { decisionAt }: { decisionAt?: number } = {},
): string {
  const closes = closesOf(spec);
  const n = Math.max(1, Math.min(shown, closes.length));
  const head = spec.kind === 'candles' ? `${n} ${n === 1 ? 'candle' : 'candles'}. ` : '';
  let body: string;
  if (decisionAt !== undefined && decisionAt >= 0 && decisionAt < n - 1) {
    body =
      `Price ${describeMove(closes, 0, decisionAt)}. ` +
      `After the decision it ${describeMove(closes, decisionAt, n - 1)}.`;
  } else {
    body = `Price ${describeMove(closes, 0, n - 1)}.`;
    if (decisionAt !== undefined && decisionAt >= 0) body += ' What happens next is hidden.';
  }
  const levels = (spec.levels ?? [])
    .filter((l) => l.label)
    .map((l) => `${l.label} at ${price(l.price)}`);
  const marked = levels.length ? ` Marked: ${levels.join('; ')}.` : '';
  return `${head}${body}${marked}`;
}

/** One line of the zone's pill: 13 pt bold capitals, letter-spaced. */
export const PILL_CHAR_W = 8.4;
export const PILL_LINE_H = 16;

/**
 * The zone's label as it is drawn: one line where the zone is wide enough,
 * else two, broken at the space nearest the middle ("WHAT HAPPENS" over
 * "NEXT"), so a narrow zone still says it rather than saying nothing.
 */
export function zonePillLines(label: string, room: number): string[] {
  const text = label.toUpperCase();
  if (!text) return [];
  if (text.length * PILL_CHAR_W + 14 <= room) return [text];
  const spaces = [...text].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i > 0);
  if (!spaces.length) return [text];
  const cut = spaces.reduce((a, b) =>
    Math.abs(b - text.length / 2) < Math.abs(a - text.length / 2) ? b : a,
  );
  return [text.slice(0, cut), text.slice(cut + 1)];
}

/**
 * How wide and tall the zone's pill is: its lines and a little room round
 * them. The level labels keep off it (levelLabels), and it off them (pillZone).
 */
export function zonePillSize(lines: string[]): { width: number; height: number } {
  const longest = Math.max(0, ...lines.map((l) => l.length));
  return { width: longest * PILL_CHAR_W + 14, height: lines.length * PILL_LINE_H + 2 };
}

/**
 * What the zone says (docs/ui/08-quotes-and-charts.md §6.4, CONTENT-REVIEW C1-01, C2-01): on a
 * line chart "What happens next" -- Chapter 1 has no candles yet -- and on a
 * candle chart how many candles are still to come. Never "bars": in the
 * course those are the volume bars.
 */
export function zoneLabel(kind: ChartSpec['kind'], toCome: number): string {
  if (kind === 'line') return 'What happens next';
  return `Next ${toCome} ${toCome === 1 ? 'candle' : 'candles'}`;
}
