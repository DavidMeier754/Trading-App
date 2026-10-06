import { describeChart, describeMove, zoneLabel, zonePillLines } from '../components/chartWords';
import { AXIS_STEPS, roundFrame } from '../components/chartScale';
import { numberRuns } from '../components/NumberText';
import type { ChartSpec } from '../types';

const line = (data: number[], decision_index = -1): ChartSpec =>
  ({ kind: 'line', data, decision_index }) as unknown as ChartSpec;

describe('the chart in a sentence (docs/ui/08-quotes-and-charts.md §6.4)', () => {
  it('names a climb in steps', () => {
    expect(describeMove([9.8, 9.86, 9.84, 9.95, 10.05], 0, 4)).toBe(
      'climbed in steps from $9.80 to $10.05',
    );
  });

  it('names a steady fall', () => {
    expect(describeMove([10, 9.9, 9.8, 9.7], 0, 3)).toBe('fell steadily from $10.00 to $9.70');
  });

  it('names a turn', () => {
    expect(describeMove([9.6, 9.7, 9.8, 9.74, 9.66], 0, 4)).toBe(
      'rose from $9.60 to $9.80, then fell back to $9.66',
    );
  });

  it('says nothing past the decision before it is made', () => {
    const spec = line([10, 10.1, 10.2, 10.3, 9.5, 9.2], 3);
    const before = describeChart(spec, 4, { decisionAt: 3 });
    expect(before).toContain('$10.30');
    expect(before).not.toContain('9.20');
    expect(before).toContain('What happens next is hidden.');
    const after = describeChart(spec, 6, { decisionAt: 3 });
    expect(after).toContain('After the decision it fell');
  });
});

describe('round prices on the axis', () => {
  it('lands every gridline on a round price', () => {
    const f = roundFrame(9.731, 10.122, 5);
    expect(AXIS_STEPS).toContain(f.step);
    expect(f.lo).toBeLessThanOrEqual(9.731);
    expect(f.hi).toBeGreaterThanOrEqual(10.122);
    for (let i = 0; i <= 5; i++) {
      const tick = f.lo + ((f.hi - f.lo) * i) / 5;
      const cents = Math.round(tick * 100);
      expect(Math.abs(tick * 100 - cents)).toBeLessThan(1e-6);
      expect(cents % 5 === 0 || f.step < 0.05).toBe(true);
    }
  });

  it('keeps a centred window centred to within half a step', () => {
    const f = roundFrame(19.62, 20.38, 7);
    expect(Math.abs((f.lo + f.hi) / 2 - 20)).toBeLessThanOrEqual(f.step / 2 + 1e-9);
  });
});

describe('the hatched zone says candles, never bars', () => {
  it('counts candles, and asks on a line', () => {
    expect(zoneLabel('candles', 5)).toBe('Next 5 candles');
    expect(zoneLabel('candles', 1)).toBe('Next 1 candle');
    expect(zoneLabel('line', 4)).toBe('What happens next');
  });

  it('breaks a label that does not fit into two lines', () => {
    expect(zonePillLines('What happens next', 400)).toEqual(['WHAT HAPPENS NEXT']);
    expect(zonePillLines('What happens next', 100)).toEqual(['WHAT HAPPENS', 'NEXT']);
  });
});

describe('numbers in the number face', () => {
  it('cuts a line into its words and its numbers', () => {
    expect(numberRuns('+$184.00 on 1,200 shares')).toEqual([
      { text: '+$184.00', number: true },
      { text: ' on ', number: false },
      { text: '1,200', number: true },
      { text: ' shares', number: false },
    ]);
    expect(numberRuns('−2R')).toEqual([{ text: '−2R', number: true }]);
    expect(numberRuns('Stood aside')).toEqual([{ text: 'Stood aside', number: false }]);
  });
});
