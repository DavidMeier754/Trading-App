jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import { labelBox, placeLevelLabels, placeNotes, planLabels } from '../components/ChartPlan';
import type { TradePlan } from '../lesson/tradePlan';

/** docs/UI.md §6.4: the words on a chart keep off each other, and off the bars where they can. */

const hits = (
  a: { left: number; top: number; width: number; height: number },
  b: { left: number; top: number; width: number; height: number },
) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height;

describe('level labels', () => {
  const frame = { left: 0, right: 300, top: 20, bottom: 220 };

  it('sit at the left end, over the line, when nothing is there', () => {
    const [spot] = placeLevelLabels([{ text: 'Floor 14.00', y: 120 }], { ...frame, ink: [] });
    expect(spot).toMatchObject({ x: 4, y: 115, anchor: 'start' });
  });

  it('move to the right end when a bar fills the left end', () => {
    const bar = { left: 10, top: 90, width: 20, height: 60 };
    const [spot] = placeLevelLabels([{ text: 'Floor 14.00', y: 120 }], { ...frame, ink: [bar] });
    expect(spot.anchor).toBe('end');
    expect(spot.x).toBe(296);
  });

  it('stay put for the tip of a wick', () => {
    const wick = { left: 20, top: 112, width: 2, height: 4 };
    const [spot] = placeLevelLabels([{ text: 'Floor 14.00', y: 120 }], { ...frame, ink: [wick] });
    expect(spot).toMatchObject({ x: 4, y: 115, anchor: 'start' });
  });

  it('never cover another word', () => {
    const word = { left: 0, top: 95, width: 300, height: 22 };
    const [spot] = placeLevelLabels([{ text: 'Floor 14.00', y: 120 }], {
      ...frame,
      ink: [],
      avoid: [word],
    });
    expect(hits(labelBox(spot.text, spot.x, spot.y, spot.anchor), word)).toBe(false);
  });

  it('keep off each other', () => {
    const spots = placeLevelLabels(
      [
        { text: 'Ceiling 14.10', y: 120 },
        { text: 'Floor 14.05', y: 126 },
      ],
      { ...frame, ink: [] },
    );
    const [a, b] = spots.map((s) => labelBox(s.text, s.x, s.y, s.anchor));
    expect(hits(a, b)).toBe(false);
  });
});

describe('plan labels', () => {
  const plan = {
    dir: 1,
    entry: 16.84,
    stop: 16.76,
    target: 17.0,
    risk: 0.08,
    targetR: 2,
  } as unknown as TradePlan;
  // A frame where 17.00 is 10 points under the plot's top.
  const y = (p: number) => 30 + (17.0 - p) * 400;

  it('put the target under its line when over it would reach the decision tag', () => {
    const labels = planLabels(plan, { y, x0: 100, x1: 300, top: 20, bottom: 220 });
    expect(labels.target.y).toBeGreaterThan(y(17.0));
  });

  it('put the target over its line when there is room', () => {
    const roomy = (p: number) => 120 + (17.0 - p) * 400;
    const labels = planLabels(plan, { y: roomy, x0: 100, x1: 300, top: 20, bottom: 260 });
    expect(labels.target.y).toBeLessThan(roomy(17.0));
    // The stop sits under its line, away from the entry.
    expect(labels.stop.y).toBeGreaterThan(roomy(16.76));
  });
});

describe('chart notes', () => {
  const geometry = {
    cx: (bar: number) => 40 + bar * 30,
    yHigh: () => 100,
    yLow: () => 140,
    bounds: { left: 0, right: 300, top: 0, bottom: 260 },
  };

  it('stand over the bar they mean', () => {
    const [tag] = placeNotes([{ bar: 2, text: 'Breakout', at: 'high' }], geometry);
    expect(tag.top + 24).toBeLessThanOrEqual(100);
  });

  it('step clear of a label in the way', () => {
    const label = { left: 0, top: 50, width: 300, height: 17 };
    const [tag] = placeNotes([{ bar: 2, text: 'Breakout', at: 'high' }], {
      ...geometry,
      avoid: [label],
    });
    expect(hits({ left: tag.left, top: tag.top, width: tag.width, height: 24 }, label)).toBe(false);
  });

  it('take the other side of the bar when their own has no room', () => {
    const [tag] = placeNotes([{ bar: 2, text: 'Breakout', at: 'high' }], {
      ...geometry,
      avoid: [{ left: 0, top: 0, width: 300, height: 99 }],
    });
    expect(tag.top).toBeGreaterThan(140);
    // The leader runs to the side of the bar the tag is on.
    expect(tag.py).toBe(143);
  });
});
