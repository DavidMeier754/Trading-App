import { ANSWERS } from './answers';
import { BARS } from './bars';
import type { Section, Suggestion } from './kit';
import { LOOKS } from './looks';
import { MAP } from './map';
import { MIX } from './mix';
import { NUMBERS } from './numbers';
import { REWARDS } from './rewards';

export type { Section, Suggestion } from './kit';
export { TAG_TEXT } from './kit';

/** The list's groups, in order: where in the app each idea would go. */
export const SECTIONS: { id: Section; title: string }[] = [
  { id: 'answers', title: 'Answering' },
  { id: 'rewards', title: 'Rewards' },
  { id: 'map', title: 'The map' },
  { id: 'bars', title: 'Top bar and tabs' },
  { id: 'numbers', title: 'Numbers and feedback' },
  { id: 'looks', title: 'Whole looks' },
  { id: 'mix', title: 'Asked in LOOK-BRIEF' },
];

/** Every suggestion, in the order of the list. */
export const SUGGESTIONS: Suggestion[] = [
  ...ANSWERS,
  ...REWARDS,
  ...MAP,
  ...BARS,
  ...NUMBERS,
  ...LOOKS,
  ...MIX,
];

export function suggestionById(id: string): Suggestion | undefined {
  return SUGGESTIONS.find((s) => s.id === id);
}
