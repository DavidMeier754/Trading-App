import {
  AnswerValue,
  branchPath,
  canCheck,
  emptyValue,
  grade,
  gradeDecision,
  isSum,
  parseNumeric,
  replayLabels,
  tilePool,
} from '../lesson/answers';
import type { BranchScreen, ChartReplayScreen, QuestionScreen } from '../types';

// Only the fields grading reads; the rest of a screen does not change the grade.
const q = (screen: object) => screen as unknown as QuestionScreen;

describe('parseNumeric', () => {
  it.each([
    ['42', 42],
    ['-7', -7],
    ['0.5', 0.5],
    ['.5', 0.5],
    ['3.', 3],
    ['2+3*4', 14],
    ['10-4/2', 8],
    ['500*0.04+2', 22],
    ['2*3+4*5', 26],
    ['10-2-3', 5],
    ['-2*-3', 6],
    ['5--3', 8],
    ['0.1+0.2', 0.3],
    ['0.03/0.6', 0.05],
    ['7−2', 5],
    ['3×4', 12],
    ['9÷3', 3],
  ])('%s is %d', (text, value) => {
    expect(parseNumeric(text)).toBe(value);
  });

  it.each(['', '-', '5*', '5+', '*5', 'abc', '1..2', '4/0', '1/0+2', '2 + 3'])(
    '%p is not a whole sum',
    (text) => {
      expect(parseNumeric(text)).toBeNull();
    },
  );

  it('tells a sum from a single number', () => {
    expect(isSum('500*0.04')).toBe(true);
    expect(isSum('3-1')).toBe(true);
    expect(isSum('-3')).toBe(false);
    expect(isSum('12.5')).toBe(false);
  });
});

describe('grade', () => {
  it('mc and numeric-mc: the option marked correct', () => {
    const mc = q({ type: 'mc', options: [{ text: 'a' }, { text: 'b', correct: true }] });
    expect(grade(mc, { kind: 'option', index: 1 })).toBe('correct');
    expect(grade(mc, { kind: 'option', index: 0 })).toBe('wrong');
    expect(grade(mc, { kind: 'option', index: null })).toBe('wrong');
    const nmc = q({ type: 'numeric-mc', options: [{ text: '1', correct: true }, { text: '2' }] });
    expect(grade(nmc, { kind: 'option', index: 0 })).toBe('correct');
  });

  it('fill-choice: the option that matches the answer', () => {
    const s = q({ type: 'fill-choice', options: ['stop', 'target'], answer: 'target' });
    expect(grade(s, { kind: 'option', index: 1 })).toBe('correct');
    expect(grade(s, { kind: 'option', index: 0 })).toBe('wrong');
  });

  it('tf: true and false both grade', () => {
    const s = q({ type: 'tf', answer: false });
    expect(grade(s, { kind: 'bool', value: false })).toBe('correct');
    expect(grade(s, { kind: 'bool', value: true })).toBe('wrong');
    expect(grade(s, { kind: 'bool', value: null })).toBe('wrong');
  });

  it('numeric-input: within the tolerance, and a worked sum counts', () => {
    const s = q({ type: 'numeric-input', answer: 20, tolerance: 0.5 });
    expect(grade(s, { kind: 'numeric', text: '20' })).toBe('correct');
    expect(grade(s, { kind: 'numeric', text: '20.5' })).toBe('correct');
    expect(grade(s, { kind: 'numeric', text: '500*0.04' })).toBe('correct');
    expect(grade(s, { kind: 'numeric', text: '20.6' })).toBe('wrong');
    expect(grade(s, { kind: 'numeric', text: '5*' })).toBe('wrong');
  });

  it('numeric-input: without a tolerance, float noise is still exact', () => {
    const s = q({ type: 'numeric-input', answer: 0.3 });
    expect(grade(s, { kind: 'numeric', text: '0.1+0.2' })).toBe('correct');
    expect(grade(s, { kind: 'numeric', text: '0.31' })).toBe('wrong');
  });

  it('fill-tiles: the tiles spell the answer', () => {
    const s = q({ type: 'fill-tiles', answer: 'Risk' });
    const pool = tilePool('Risk');
    expect(pool).toHaveLength(4 + 3);
    const used = new Set<number>();
    const placed = 'RISK'.split('').map((letter) => {
      const i = pool.findIndex((t, k) => t === letter && !used.has(k));
      used.add(i);
      return i;
    });
    expect(grade(s, { kind: 'tiles', placed })).toBe('correct');
    expect(grade(s, { kind: 'tiles', placed: [...placed].reverse() })).toBe('wrong');
  });

  it('fill-tiles: the pool is the same on every render', () => {
    expect(tilePool('stop')).toEqual(tilePool('stop'));
  });

  it('match: right only without a wrong tap', () => {
    const s = q({ type: 'match', pairs: [['a', 'b']] });
    expect(grade(s, { kind: 'match', linked: { 0: 0 }, misses: 0 })).toBe('correct');
    expect(grade(s, { kind: 'match', linked: { 0: 0 }, misses: 1 })).toBe('wrong');
  });

  it('chart-decision: best is green, reasonable is amber, the rest red', () => {
    const s = q({ type: 'chart-decision', best: 'no-trade', reasonable: ['short'] });
    expect(grade(s, { kind: 'decision', choice: 'no-trade' })).toBe('correct');
    expect(grade(s, { kind: 'decision', choice: 'short' })).toBe('amber');
    expect(grade(s, { kind: 'decision', choice: 'long' })).toBe('wrong');
    expect(grade(s, { kind: 'decision', choice: null })).toBe('wrong');
    expect(gradeDecision({ best: 'long' }, 'short')).toBe('wrong');
  });

  it('sort: every item in its bucket', () => {
    const s = q({ type: 'sort', items: [{ bucket: 'A' }, { bucket: 'B' }] });
    expect(grade(s, { kind: 'buckets', placed: { 0: 'A', 1: 'B' } })).toBe('correct');
    expect(grade(s, { kind: 'buckets', placed: { 0: 'B', 1: 'B' } })).toBe('wrong');
  });

  it('order: items in the order they are listed', () => {
    const s = q({ type: 'order', items: ['a', 'b', 'c'] });
    expect(grade(s, { kind: 'sequence', order: [0, 1, 2] })).toBe('correct');
    expect(grade(s, { kind: 'sequence', order: [0, 2, 1] })).toBe('wrong');
  });

  it('hotspot: one target or several', () => {
    const one = q({ type: 'hotspot', target: 'x' });
    expect(grade(one, { kind: 'target', id: 'x' })).toBe('correct');
    expect(grade(one, { kind: 'target', id: 'y' })).toBe('wrong');
    const many = q({ type: 'hotspot', targets: ['x', 'y'] });
    expect(grade(many, { kind: 'target', id: 'y' })).toBe('correct');
    expect(grade(many, { kind: 'target', id: null })).toBe('wrong');
  });

  it('slider and chart-annotate: the tolerance edge is inside', () => {
    const s = q({ type: 'slider', answer: 10, tolerance: 2 });
    expect(grade(s, { kind: 'slider', value: 12 })).toBe('correct');
    expect(grade(s, { kind: 'slider', value: 8 })).toBe('correct');
    expect(grade(s, { kind: 'slider', value: 12.5 })).toBe('wrong');
    const a = q({ type: 'chart-annotate', answer: 101.5 });
    expect(grade(a, { kind: 'slider', value: 101.5 })).toBe('correct');
    expect(grade(a, { kind: 'slider', value: 101.6 })).toBe('wrong');
  });

  it('chart-tap and spot-mistake: the right index', () => {
    const tap = q({ type: 'chart-tap', target: 3 });
    expect(grade(tap, { kind: 'index', index: 3 })).toBe('correct');
    expect(grade(tap, { kind: 'index', index: 4 })).toBe('wrong');
    const spot = q({ type: 'spot-mistake', segments: [{ text: 'a' }, { text: 'b', wrong: true }] });
    expect(grade(spot, { kind: 'index', index: 1 })).toBe('correct');
    expect(grade(spot, { kind: 'index', index: 0 })).toBe('wrong');
    expect(grade(spot, { kind: 'index', index: 9 })).toBe('wrong');
  });

  it('swipe-deck: all right is green, 70% is amber, less is red', () => {
    const cards = Array.from({ length: 10 }, () => ({ answer: 'take' }));
    const s = q({ type: 'swipe-deck', cards });
    const picks = (right: number) =>
      cards.map((_, i) => (i < right ? 'take' : 'pass')) as ('take' | 'pass')[];
    expect(grade(s, { kind: 'deck', picks: picks(10) })).toBe('correct');
    expect(grade(s, { kind: 'deck', picks: picks(7) })).toBe('amber');
    expect(grade(s, { kind: 'deck', picks: picks(6) })).toBe('wrong');
  });

  it('order-build and journal-row: every slot filled right', () => {
    for (const type of ['order-build', 'journal-row']) {
      const s = q({ type, slots: ['side', 'size'], answer: { side: 'long', size: '1' } });
      expect(grade(s, { kind: 'slots', filled: { side: 'long', size: '1' } })).toBe('correct');
      expect(grade(s, { kind: 'slots', filled: { side: 'long', size: '2' } })).toBe('wrong');
    }
  });

  it('scanner-pick, compare and depth-ladder: the named target', () => {
    const scan = q({ type: 'scanner-pick', targets: ['AAPL', 'MSFT'] });
    expect(grade(scan, { kind: 'target', id: 'MSFT' })).toBe('correct');
    expect(grade(scan, { kind: 'target', id: 'TSLA' })).toBe('wrong');
    const compare = q({ type: 'compare', answer: 'left' });
    expect(grade(compare, { kind: 'target', id: 'left' })).toBe('correct');
    expect(grade(compare, { kind: 'target', id: 'right' })).toBe('wrong');
    const ladder = q({ type: 'depth-ladder', target: 'bid-2' });
    expect(grade(ladder, { kind: 'target', id: 'bid-2' })).toBe('correct');
    expect(grade(ladder, { kind: 'target', id: 'ask-1' })).toBe('wrong');
  });

  it('a value of the wrong kind is wrong, never a crash', () => {
    const s = q({ type: 'mc', options: [{ text: 'a', correct: true }] });
    expect(grade(s, { kind: 'bool', value: true })).toBe('wrong');
  });
});

describe('branch', () => {
  const step = (next?: number) => ({
    prompt: '',
    explanation: '',
    options: [
      { text: 'right', correct: true, next },
      { text: 'wrong', next },
    ],
  });
  const screen = {
    type: 'branch',
    steps: [step(1), step(2), step()],
  } as unknown as BranchScreen;
  const value = (picks: number[]): AnswerValue => ({ kind: 'branch', picks });

  it('walks the steps and ends where an option has no next', () => {
    expect(branchPath(screen, [0])).toEqual({ visited: [0], current: 1, done: false });
    expect(branchPath(screen, [0, 0, 0]).done).toBe(true);
    expect(branchPath(screen, []).done).toBe(false);
  });

  it('one wrong turn is amber, two are red', () => {
    expect(grade(screen, value([0, 0, 0]))).toBe('correct');
    expect(grade(screen, value([0, 1, 0]))).toBe('amber');
    expect(grade(screen, value([1, 1, 0]))).toBe('wrong');
  });
});

describe('chart-replay', () => {
  const screen = {
    type: 'chart-replay',
    moments: [
      { bar: 10, kind: 'setup', note: '' },
      { bar: 30, kind: 'decoy', note: '' },
    ],
  } as unknown as ChartReplayScreen;
  const acted = (...bars: number[]) => ({
    kind: 'replay' as const,
    acted: bars.map((bar) => ({ bar, side: 'long' })),
    ended: true,
  });
  const labels = (...bars: number[]) => replayLabels(screen, acted(...bars)).map((l) => l.label);

  it('labels a hit by how far off it is', () => {
    expect(labels(10)).toEqual(['Textbook', 'Passed']);
    expect(labels(11)).toEqual(['Textbook', 'Passed']);
    expect(labels(8)).toEqual(['Early', 'Passed']);
    expect(labels(12)).toEqual(['Late', 'Passed']);
    expect(labels()).toEqual(['Missed', 'Passed']);
    expect(labels(10, 30)).toEqual(['Textbook', 'Phantom']);
    expect(labels(10, 50)).toEqual(['Textbook', 'Passed', 'Phantom']);
  });

  it('a clean run is green; restraint is never red', () => {
    expect(grade(screen, acted(10))).toBe('correct');
    expect(grade(screen, acted())).toBe('amber');
    expect(grade(screen, acted(12, 30))).toBe('wrong');
  });
});

describe('canCheck', () => {
  it('waits for an answer', () => {
    const mc = q({ type: 'mc', options: [] });
    expect(canCheck(mc, emptyValue(mc) as AnswerValue)).toBe(false);
    expect(canCheck(mc, { kind: 'option', index: 0 })).toBe(true);
  });

  it('numeric-input waits for a whole sum', () => {
    const s = q({ type: 'numeric-input', answer: 1 });
    expect(canCheck(s, { kind: 'numeric', text: '5*' })).toBe(false);
    expect(canCheck(s, { kind: 'numeric', text: '5*2' })).toBe(true);
    expect(canCheck(s, { kind: 'numeric', text: '5/0' })).toBe(false);
  });

  it('fill-tiles waits for every letter', () => {
    const s = q({ type: 'fill-tiles', answer: 'ab' });
    expect(canCheck(s, { kind: 'tiles', placed: [0] })).toBe(false);
    expect(canCheck(s, { kind: 'tiles', placed: [0, 1] })).toBe(true);
  });
});
