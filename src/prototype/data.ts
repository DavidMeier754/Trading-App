/**
 * Stage LOOK-BRIEF: the content every direction shows, so the three are judged
 * on how they look and move, never on what they say. It is lesson-shaped copy
 * from Chapter 2 and 3, not a lesson: nothing here is read by the validator.
 */

import type { IconName } from '../home/icons';

export type Candle = { o: number; h: number; l: number; c: number };

/**
 * A small deterministic random walk (mulberry32), so every build, every
 * direction and the render test draw the same chart.
 */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Candles that look like a one-minute chart rather than a staircase: bodies of
 * uneven size, wicks on both sides, the odd doji, and a trend that pauses.
 * `drift` is the average move per bar; each bar's close lands on a cent.
 */
function walk(start: number, drifts: number[], seed: number): Candle[] {
  const r = rng(seed);
  const out: Candle[] = [];
  let prev = start;
  for (const drift of drifts) {
    const o = prev + (r() - 0.5) * 0.01;
    const body = drift + (r() - 0.5) * 0.09;
    const c = Math.round((o + body) * 100) / 100;
    const h = Math.max(o, c) + r() * 0.035 + 0.005;
    const l = Math.min(o, c) - r() * 0.035 - 0.005;
    out.push({
      o: Math.round(o * 100) / 100,
      h: Math.round(h * 100) / 100,
      l: Math.round(l * 100) / 100,
      c,
    });
    prev = c;
  }
  return out;
}

/**
 * The scenario: a clean pullback to support in an uptrend. Long is the good
 * call. This time it loses: price bounces, stalls under the high and comes
 * back through the stop. The chart that makes "right, but lost" visible.
 */
const history = walk(
  9.62,
  [
    0.02, 0.03, 0.01, 0.04, 0.02, -0.01, 0.03, 0.02, 0.03, 0.01, -0.02, -0.03, -0.02, -0.01, 0.0,
    0.01,
  ],
  7,
);
const lastClose = history[history.length - 1].c;
const STOP = Math.round((lastClose - 0.12) * 100) / 100;
/**
 * Playback ends at the first candle that touches the stop (docs/UI.md §6.4),
 * so the walk is cut there.
 */
const walked = walk(lastClose, [0.03, 0.03, -0.01, -0.04, -0.05, -0.05, -0.04, -0.03], 11);
const hit = walked.findIndex((c) => c.l <= STOP);
const outcome = hit === -1 ? walked : walked.slice(0, hit + 1);

export const SCENARIO = {
  ticker: 'XYZ',
  history,
  outcome,
  entry: lastClose,
  stop: STOP,
  target: Math.round((lastClose + 0.24) * 100) / 100,
  shares: 400,
  best: 'long' as const,
  story: 'Uptrend all morning. Price pulls back to the level it broke out from.',
  prompt: 'Pullback to support in an uptrend. Your call?',
  state: ['Day +0.4R', 'Limit −2R', 'Trades 1'],
};

/** Where the outcome ends relative to the entry: this time the stop is hit. */
/**
 * The result of a side this time. Long is stopped out at the stop. A short
 * would have ridden the drop and is taken off at the last close: the wrong
 * call that happened to win, which the reveal has to say out loud too.
 */
export function outcomeResult(side: 'long' | 'short') {
  const exit = side === 'long' ? SCENARIO.stop : outcome[outcome.length - 1].c;
  const perShare = side === 'long' ? exit - SCENARIO.entry : SCENARIO.entry - exit;
  const r = perShare / (SCENARIO.entry - SCENARIO.stop);
  return { perShare, total: perShare * SCENARIO.shares, r };
}

export const THEORY = {
  eyebrow: 'Chapter 2 · The candle',
  title: 'One candle, four prices',
  body: 'Open, high, low and close of one minute. The body spans open to close; the wicks reach the extremes.',
};

export const CHOICE = {
  prompt: 'Previous close $50.00. Price now $51.50. What is the change in percent?',
  options: ['1.5 %', '3 %', '15 %', '51.5 %'],
  correct: 1,
  explanation: 'The dollar change, $1.50, divided by the previous close, $50.00: 3 %.',
  why: [
    'That is the change in dollars, not in percent.',
    '',
    'Off by a factor of ten.',
    'That is the new price itself.',
  ],
};

export const MATCH = {
  prompt: 'Which order does what you need?',
  pairs: [
    { term: 'Market', meaning: 'Fills now, at the best price there is' },
    { term: 'Limit', meaning: 'Fills only at your price or better' },
    { term: 'Stop', meaning: 'Waits, then fires once price is touched' },
    { term: 'Bracket', meaning: 'Entry with a stop and a target attached' },
  ],
  /** The right-hand column, shuffled once and kept. */
  order: [2, 0, 3, 1],
};

export const COMPLETE = {
  lesson: 'Pullbacks · Lesson 2 of 4',
  decisions: { right: 7, total: 8 },
  results: { won: 4, lost: 3 },
  xp: 40,
  streak: 3,
  goal: { done: 2, of: 2 },
  missed: 'Which order fills only at your price?',
};

export type MapLevel = {
  n: number;
  title: string;
  kind: 'New ideas' | 'Practice' | 'Checkpoint';
  icon: IconName;
  lessons: number;
  done: number;
  state: 'done' | 'perfect' | 'current' | 'locked';
};

/**
 * One chapter of the map. Every level carries its own symbol, as Chapter 1's
 * do, instead of a bulb for every "new ideas" level (David's critique).
 */
export const MAP = {
  chapter: 'Chapter 4 · Reading the tape',
  hud: { streak: 3, today: 1, goal: 2, xp: 230, hearts: 5 },
  levels: [
    {
      n: 4,
      title: 'Volume Tells',
      kind: 'New ideas',
      icon: 'volume',
      lessons: 4,
      done: 4,
      state: 'perfect',
    },
    {
      n: 5,
      title: 'Practice: Volume',
      kind: 'Practice',
      icon: 'repeat',
      lessons: 3,
      done: 3,
      state: 'done',
    },
    {
      n: 6,
      title: 'Candle Signals on the 1-Minute',
      kind: 'New ideas',
      icon: 'candles',
      lessons: 4,
      done: 1,
      state: 'current',
    },
    {
      n: 7,
      title: 'Confluence',
      kind: 'New ideas',
      icon: 'levels',
      lessons: 3,
      done: 0,
      state: 'locked',
    },
    {
      n: 8,
      title: 'Checkpoint',
      kind: 'Checkpoint',
      icon: 'shield',
      lessons: 1,
      done: 0,
      state: 'locked',
    },
    {
      n: 9,
      title: 'The Opening Minutes',
      kind: 'New ideas',
      icon: 'bell',
      lessons: 4,
      done: 0,
      state: 'locked',
    },
  ] as MapLevel[],
};

/** Money with a sign in front of the currency: −$48.00. */
export function money(v: number): string {
  const sign = v < 0 ? '−' : '+';
  return `${sign}$${Math.abs(v).toFixed(2)}`;
}
