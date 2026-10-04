import { decisionReveal, VARIANCE_LINE } from '../lesson/decisionReveal';
import { formatR, tradePlanOf } from '../lesson/tradePlan';
import type { ChartDecisionScreen } from '../types';

/** A candle decision: entry at bar 4's close, 18.10. */
const screen = (over: Partial<ChartDecisionScreen> = {}): ChartDecisionScreen => ({
  type: 'chart-decision',
  scenario: 's',
  shares: 600,
  best: 'long',
  reasonable: ['no-trade'],
  outcome: 'o',
  explanation: 'e',
  chart: {
    kind: 'candles',
    decision_index: 4,
    data: [
      [18.0, 18.05, 17.98, 18.02],
      [18.02, 18.08, 18.0, 18.06],
      [18.06, 18.1, 18.03, 18.05],
      [18.05, 18.12, 18.04, 18.08],
      [18.08, 18.12, 18.06, 18.1],
      // after the decision
      [18.1, 18.16, 18.07, 18.14],
      [18.14, 18.3, 18.12, 18.28],
      [18.28, 18.36, 18.25, 18.3],
    ],
  },
  stop: 18.0,
  target: 18.3,
  ...over,
});

describe('the trade plan (docs/ui/08-quotes-and-charts.md §6.4, docs/level-files/ stop/target)', () => {
  it('reads entry, risk and the target in R', () => {
    const plan = tradePlanOf(screen())!;
    expect(plan).toMatchObject({ dir: 1, entry: 18.1, stop: 18.0, target: 18.3 });
    expect(plan.risk).toBeCloseTo(0.1);
    expect(plan.targetR).toBeCloseTo(2);
  });

  it('ends the trade at the first line the bars touch', () => {
    const plan = tradePlanOf(screen())!;
    expect(plan.exit).toMatchObject({ bar: 6, price: 18.3, reason: 'target' });
    expect(plan.exit.r).toBeCloseTo(2);
  });

  it('a stop touched first ends it at -1R', () => {
    const data = screen().chart.data as [number, number, number, number][];
    const dip = [...data.slice(0, 5), [18.1, 18.12, 17.98, 18.0], ...data.slice(6)] as typeof data;
    const plan = tradePlanOf(screen({ chart: { ...screen().chart, data: dip } }))!;
    expect(plan.exit).toMatchObject({ bar: 5, price: 18.0, reason: 'stop' });
    expect(plan.exit.r).toBeCloseTo(-1);
  });

  it('both in one bar: the stop is taken, the careful reading', () => {
    const data = screen().chart.data as [number, number, number, number][];
    const wide = [...data.slice(0, 5), [18.1, 18.4, 17.9, 18.2], ...data.slice(6)] as typeof data;
    expect(tradePlanOf(screen({ chart: { ...screen().chart, data: wide } }))!.exit.reason).toBe(
      'stop',
    );
  });

  it('neither touched: the chart runs out, and the result is the last close', () => {
    const plan = tradePlanOf(screen({ target: 19 }))!;
    expect(plan.exit).toMatchObject({ bar: 7, price: 18.3, reason: 'end' });
  });

  it('a short mirrors it', () => {
    const plan = tradePlanOf(
      screen({ best: 'short', stop: 18.2, target: 17.9, reasonable: ['no-trade'] }),
    )!;
    expect(plan).toMatchObject({ dir: -1 });
    expect(plan.exit).toMatchObject({ reason: 'stop', bar: 6, price: 18.2 });
    expect(plan.exit.r).toBeCloseTo(-1);
  });

  it('no plan without both lines, without a direction, or with a line on the wrong side', () => {
    expect(tradePlanOf(screen({ stop: undefined }))).toBeNull();
    expect(tradePlanOf(screen({ best: 'no-trade' }))).toBeNull();
    expect(tradePlanOf(screen({ stop: 18.2 }))).toBeNull();
  });

  it('writes R with one decimal, and a true minus', () => {
    expect(formatR(1.6)).toBe('+1.6R');
    expect(formatR(-1)).toBe('−1R');
    expect(formatR(2)).toBe('+2R');
    expect(formatR(0.01)).toBe('0R');
  });
});

describe('the reveal with a plan (docs/ui/06-reveal-and-hearts.md §5.1b)', () => {
  it('pays out at the exit, not at the last bar', () => {
    const r = decisionReveal(screen(), 'long');
    expect(r.pnl).toBeCloseTo(0.2 * 600);
    expect(r.r).toBeCloseTo(2);
  });

  it('adds R to the result line once R is taught', () => {
    expect(decisionReveal(screen(), 'long').result).toBe('+$120.00 on 600 shares');
    expect(decisionReveal(screen(), 'long', undefined, { showR: true }).result).toBe(
      '+$120.00 on 600 shares · +2R',
    );
  });

  it("the other side's trade has no R of the plan", () => {
    expect(decisionReveal(screen(), 'short').r).toBeUndefined();
  });

  it('standing aside is the hollow dot of what would have happened', () => {
    const r = decisionReveal(screen(), 'no-trade');
    expect(r.cell).toEqual({ row: 'between', col: 'won', hollow: true });
  });

  it('a right call that lost lands in its cell, with the line that has no rate', () => {
    const data = screen().chart.data as [number, number, number, number][];
    const dip = [...data.slice(0, 5), [18.1, 18.12, 17.98, 18.0], ...data.slice(6)] as typeof data;
    const r = decisionReveal(screen({ chart: { ...screen().chart, data: dip } }), 'long');
    expect(r.cell).toEqual({ row: 'right', col: 'lost', hollow: false });
    expect(r.variance).toBe(VARIANCE_LINE);
    expect(VARIANCE_LINE).not.toMatch(/\d/);
  });
});
