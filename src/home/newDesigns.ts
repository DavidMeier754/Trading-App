import type { LessonEntry } from '../content';
import type { Level } from '../types';

/**
 * Settings → Testing → New designs (docs/ui/16-navigation.md §11.5, DESIGN-REVIEW): a
 * lesson made in code that shows every field the design review added, before
 * any level file uses them (docs/content-todo/): a scene as a market alert,
 * stop and target with the R ruler and chart notes, the open on a chart, a
 * right call that loses, the decision grid as a card, scanner rows with their
 * day, a ladder with its order size, the order ticket and the match.
 */
const CANDLES_UP: [number, number, number, number][] = [
  [16.3, 16.36, 16.28, 16.34],
  [16.34, 16.42, 16.32, 16.4],
  [16.4, 16.5, 16.38, 16.48],
  [16.48, 16.58, 16.46, 16.56],
  [16.56, 16.62, 16.5, 16.6],
  [16.6, 16.86, 16.58, 16.84],
  [16.84, 16.92, 16.82, 16.9],
  [16.9, 16.98, 16.88, 16.96],
  [16.96, 17.04, 16.94, 17.02],
  [17.02, 17.1, 17.0, 17.08],
  [17.08, 17.14, 17.05, 17.11],
];

const CANDLES_STOPPED: [number, number, number, number][] = [
  ...CANDLES_UP.slice(0, 6),
  [16.84, 16.9, 16.8, 16.82],
  [16.82, 16.84, 16.74, 16.76],
  [16.76, 16.8, 16.7, 16.72],
  [16.72, 16.78, 16.68, 16.74],
  [16.74, 16.8, 16.72, 16.78],
];

const VOLUME = [42000, 38000, 51000, 47000, 44000, 168000, 121000, 98000, 86000, 74000, 69000];

const level: Level = {
  id: 'new-designs',
  title: 'New designs',
  chapter: 0,
  chapter_title: 'Testing',
  path: 'all',
  category: 'new-theory',
  tags: [],
  learning_goal: '',
  purpose: '',
  prerequisite: null,
  xp: 0,
  difficulty: 1,
  screens: [
    { type: 'intro', text: 'New designs: every new field of the design review, one screen each.' },
    {
      type: 'story',
      text: 'The bell has just gone. XYZ is up on the day and trading heavy.',
      alert: {
        ticker: 'XYZ',
        time: '1 min after the open',
        facts: ['Gap +3.1 %', 'RVOL 3.8×'],
        spark: [16.3, 16.36, 16.34, 16.44, 16.52, 16.5, 16.6],
      },
    },
    {
      type: 'chart-decision',
      scenario:
        'XYZ held the pre-market high and the first candle after it broke out on the heaviest bar of the day. Long 1,200 shares with the stop under the breakout?',
      shares: 1200,
      chart: {
        kind: 'candles',
        data: CANDLES_UP,
        volume: VOLUME,
        decision_index: 5,
        session_open: 2,
        levels: [{ price: 16.6, label: 'Pre-market high' }],
      },
      buttons: ['long', 'short', 'no-trade'],
      best: 'long',
      reasonable: ['no-trade'],
      stop: 16.76,
      target: 17.0,
      notes: [
        { bar: 4, text: 'Holds the level', at: 'low' },
        { bar: 5, text: 'Heavy breakout', at: 'high' },
      ],
      outcome: 'It ran to the target at $17.00.',
      explanation:
        'The level held and the breakout came on volume: a long with the stop under it risks 8 cents to make 16.',
    },
    {
      type: 'chart-decision',
      scenario: 'The same breakout on another day. Long 1,200 shares, stop under the breakout?',
      shares: 1200,
      chart: {
        kind: 'candles',
        data: CANDLES_STOPPED,
        volume: VOLUME,
        decision_index: 5,
        session_open: 2,
        levels: [{ price: 16.6, label: 'Pre-market high' }],
      },
      buttons: ['long', 'short', 'no-trade'],
      best: 'long',
      reasonable: ['no-trade'],
      stop: 16.76,
      target: 17.0,
      notes: [{ bar: 7, text: 'Stop touched', at: 'low' }],
      outcome: 'It fell back to the stop at $16.76.',
      explanation:
        'The same setup, the same plan: the right call. This one lost, and the stop kept the loss to 1R.',
    },
    {
      type: 'theory',
      title: 'Right call, lost anyway',
      body: 'A decision and its result are two things. Every chart decision lands in one of four boxes.',
      visual: 'decision-grid',
      visual_data: { cell: 'right-lost' },
    },
    {
      type: 'scanner-pick',
      prompt: 'Which one is moving on real volume?',
      data: {
        rows: [
          {
            ticker: 'MARL',
            price: 14.8,
            change_pct: 8.6,
            rvol: 6.8,
            spread: 0.02,
            catalyst: 'Results',
            spark: [13.63, 13.7, 14.1, 14.55, 14.4, 14.62, 14.8],
          },
          {
            ticker: 'ORCA',
            price: 21.3,
            change_pct: 5.8,
            rvol: 1.4,
            spread: 0.03,
            catalyst: 'Upgrade',
            spark: [20.13, 21.4, 21.1, 20.8, 21.0, 21.2, 21.3],
          },
          { ticker: 'SALT', price: 13.6, change_pct: 2.1, rvol: 1.2, spread: 0.02 },
        ],
      },
      target: 'MARL',
      explanation: 'MARL: 6.8× its normal day, two cents wide and a steady climb.',
    },
    {
      type: 'depth-ladder',
      prompt: 'You market-buy 1,000 shares. Where does the last share fill?',
      data: {
        bids: [
          [45.2, 1200],
          [45.19, 800],
          [45.18, 2400],
        ],
        asks: [
          [45.24, 400],
          [45.25, 900],
          [45.26, 700],
        ],
      },
      target: 'ask-2',
      shares: 1000,
      explanation: '400 at $45.24 leaves 600, which come out of the 900 at $45.25.',
    },
    {
      type: 'order-build',
      prompt: 'Build the ticket: buy 700 shares of XYZ, never above $18.30.',
      ticker: 'XYZ',
      slots: ['side', 'type', 'qty', 'price'],
      chips: {
        side: ['buy', 'sell'],
        type: ['market', 'limit'],
        qty: ['400', '700', '1000'],
        price: ['18.26', '18.30', '18.34'],
      },
      answer: { side: 'buy', type: 'limit', qty: '700', price: '18.30' },
      explanation: 'A limit order is the only one that caps what you pay.',
    },
    {
      type: 'match',
      prompt: 'Which word describes which part of a trade?',
      pairs: [
        ['Buy', 'Open a position'],
        ['Sell', 'Close a position'],
        ['Position', 'Shares you hold'],
        ['Stop', 'Where you are wrong'],
      ],
      explanation: 'Buy opens, sell closes, the stop says where the idea is wrong.',
    },
  ],
};

export const NEW_DESIGNS: LessonEntry = {
  id: 'new-designs',
  title: 'New designs',
  subtitle: 'New designs',
  level,
  testBench: true,
};
