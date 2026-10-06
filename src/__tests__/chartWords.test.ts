import { describeChart, describeMove, zoneLabel, zonePillLines } from '../components/chartWords';
import {
  AXIS_STEPS,
  MIN_TICK_GAP,
  niceTicks,
  pinchView,
  scaleFrame,
  X_MIN_SLOTS,
} from '../components/chartScale';
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

describe('the price axis (TradingView-style)', () => {
  it('puts every gridline on a round price inside the frame', () => {
    const { ticks, step } = niceTicks(9.731, 10.122, 300);
    expect(AXIS_STEPS).toContain(step);
    expect(ticks.length).toBeGreaterThan(1);
    for (const t of ticks) {
      expect(t).toBeGreaterThanOrEqual(9.731);
      expect(t).toBeLessThanOrEqual(10.122);
      const cents = Math.round(t * 100);
      expect(Math.abs(t * 100 - cents)).toBeLessThan(1e-6);
      expect(cents % Math.round(step * 100)).toBe(0);
    }
  });

  it('never crowds the lines, and stretching the plot makes the step finer', () => {
    const tall = niceTicks(10, 11, 600);
    const short = niceTicks(10, 11, 150);
    expect(tall.step).toBeLessThan(short.step);
    expect(tall.step * 600).toBeGreaterThanOrEqual(MIN_TICK_GAP);
    expect(short.step * 150).toBeGreaterThanOrEqual(MIN_TICK_GAP);
  });

  it('stretches and squeezes about the middle', () => {
    expect(scaleFrame(10, 12, 0.5)).toEqual({ lo: 10.5, hi: 11.5 });
    expect(scaleFrame(10, 12, 2)).toEqual({ lo: 9, hi: 13 });
  });
});

describe('a pinch zooms in time about the fingers', () => {
  it('keeps the slot under the fingers under them', () => {
    const v = pinchView({ start: 0, count: 10 }, 2, 150, 150, 300, 10);
    expect(v.count).toBe(5);
    // Slot 5 sat under x = 150 before; it still does.
    expect(v.start + (150 / 300) * v.count).toBeCloseTo(5);
  });

  it('pans with the fingers and stops at either end', () => {
    const v = pinchView({ start: 2, count: 6 }, 1, 150, 0, 300, 10);
    expect(v.start).toBe(4);
    expect(pinchView({ start: 0, count: 6 }, 1, 0, 300, 300, 10).start).toBe(0);
    expect(pinchView({ start: 0, count: 10 }, 0.5, 150, 150, 300, 10)).toEqual({
      start: 0,
      count: 10,
    });
    expect(pinchView({ start: 0, count: 10 }, 100, 150, 150, 300, 10).count).toBe(X_MIN_SLOTS);
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
