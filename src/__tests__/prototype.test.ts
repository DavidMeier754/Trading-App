// Reanimated and worklets need their native modules; under Jest their mocks stand in.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import { SCENARIO, outcomeResult } from '../prototype/data';
import { DIRECTION_ORDER, DIRECTIONS } from '../prototype/directions';
import { formingCandle, niceTicks } from '../prototype/kit';
import { parsePrototypeLink, prototypeRoutes } from '../prototype/Prototype';
import { contrast } from '../prototype/TypeSheet';

describe('stage LOOK-BRIEF prototypes', () => {
  it('reads a prototype link and falls back for anything unknown', () => {
    expect(parsePrototypeLink('prototype/playful/chart', 'theme=dark')).toEqual({
      dir: 'playful',
      screen: 'chart',
      theme: 'dark',
      layout: 'thumb',
    });
    expect(parsePrototypeLink('prototype/nope/nope', 'layout=today')).toEqual({
      dir: 'calm',
      screen: 'theory',
      theme: 'light',
      layout: 'today',
    });
    expect(parsePrototypeLink('level-01-1/3', '')).toBeNull();
  });

  it('lists every direction, screen and theme for the render test', () => {
    const routes = prototypeRoutes();
    expect(routes).toHaveLength(3 * 7 * 2 + 3 * 3);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('puts round prices on the axis', () => {
    expect(niceTicks(9.58, 10.0, 5)).toEqual([9.6, 9.7, 9.8, 9.9, 10]);
    for (const t of niceTicks(9.58, 10.0, 3)) expect(Math.round(t * 100) % 5).toBe(0);
  });

  it('forms a candle from its open to its close without leaving its range', () => {
    const c = { o: 9.7, h: 9.9, l: 9.62, c: 9.84 };
    expect(formingCandle(c, 0)).toEqual({ o: 9.7, h: 9.7, l: 9.7, c: 9.7 });
    expect(formingCandle(c, 1)).toEqual(c);
    for (let f = 0; f <= 1; f += 0.05) {
      const k = formingCandle(c, f);
      expect(k.h).toBeLessThanOrEqual(c.h + 1e-9);
      expect(k.l).toBeGreaterThanOrEqual(c.l - 1e-9);
      expect(k.c).toBeLessThanOrEqual(k.h + 1e-9);
      expect(k.c).toBeGreaterThanOrEqual(k.l - 1e-9);
    }
  });

  it('plays out "right, but lost": the good call is stopped out for −1R', () => {
    expect(SCENARIO.best).toBe('long');
    const last = SCENARIO.outcome[SCENARIO.outcome.length - 1];
    expect(last.l).toBeLessThanOrEqual(SCENARIO.stop);
    expect(Math.max(...SCENARIO.outcome.map((c) => c.h))).toBeLessThan(SCENARIO.target);
    const r = outcomeResult('long');
    expect(r.total).toBeCloseTo(-48, 6);
    expect(r.r).toBeCloseTo(-1, 6);
  });

  it('keeps text and muted text at 4.5 : 1 or better in every direction and theme', () => {
    for (const id of DIRECTION_ORDER) {
      for (const theme of ['light', 'dark'] as const) {
        const p = DIRECTIONS[id].palettes[theme];
        for (const fg of [p.text, p.muted, p.up, p.down, p.amber, p.accent]) {
          expect(contrast(fg, p.ground)).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(DIRECTIONS[id].type.caption.fontSize).toBeGreaterThanOrEqual(13);
      expect(DIRECTIONS[id].type.label.fontSize).toBeGreaterThanOrEqual(13);
    }
  });
});
