import { ANSWERS } from './answers';
import { BARS } from './bars';
import type { Section, Suggestion } from './kit';
import { LOOKS } from './looks';
import { MAP } from './map';
import { MIX } from './mix';
import { NUMBERS } from './numbers';
import { REWARDS } from './rewards';
import { WINS } from './wins';

export type { Section, Suggestion } from './kit';
export { TAG_TEXT } from './kit';

/** The list's groups, in order: where in the app each idea would go. */
export const SECTIONS: { id: Section; title: string }[] = [
  { id: 'answers', title: 'Answering' },
  { id: 'rewards', title: 'Rewards' },
  { id: 'wins', title: 'Win screens' },
  { id: 'map', title: 'The map' },
  { id: 'bars', title: 'Top bar and tabs' },
  { id: 'numbers', title: 'Numbers and feedback' },
  { id: 'looks', title: 'Whole looks' },
  { id: 'mix', title: 'Asked in LOOK-BRIEF' },
];

/**
 * David's picks of 2026-10-04 (the artifact "Nutrade design picks"): what went
 * into the app in DESIGN-REVIEW, and what he left out (and the typed theory,
 * which he took out again after trying it). The rest keep their own tag.
 */
const IN_APP = new Set([
  'swipe-call',
  'flip-reveal',
  'deep-keys',
  'slide-confirm',
  'chart-scrub',
  'receipt',
  'split-flap',
  'gem-flight',
  'foil-badge',
  'coin-confetti',
  'chest',
  'card-grows',
  'spark-cards',
  'tier-overview',
  'tab-pill',
  'flame-tiers',
  'tab-columns',
  'dial',
  'combo',
  'heatmap',
  'keys',
  'countup',
  'steps',
]);
const LEFT_OUT = new Set([
  // In the app for a moment, then taken out (David, 2026-10-04: "Remove the terminal typing").
  'typed-theory',
  'candle-bar',
  'breakout',
  'coin-level',
  'price-path',
  'ticker',
  'liquid-bar',
  'heart-crack',
  'look-terminal',
  'look-paper',
  'look-glass',
  'look-arcade',
  'smallcaps',
  'board',
]);

function marked(s: Suggestion): Suggestion {
  if (IN_APP.has(s.id)) return { ...s, tag: 'app' };
  if (LEFT_OUT.has(s.id)) return { ...s, tag: 'out' };
  return s;
}

/** Every suggestion, in the order of the list. */
export const SUGGESTIONS: Suggestion[] = [
  ...ANSWERS,
  ...REWARDS,
  ...WINS,
  ...MAP,
  ...BARS,
  ...NUMBERS,
  ...LOOKS,
  ...MIX,
].map(marked);

export function suggestionById(id: string): Suggestion | undefined {
  return SUGGESTIONS.find((s) => s.id === id);
}
