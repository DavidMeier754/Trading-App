import type { Grade } from './answers';
import {
  celebrateHaptic,
  commitHaptic,
  matchHitHaptic,
  matchMissHaptic,
  revealHaptic,
  selectHaptic,
} from './haptics';
import { playCue } from './sound';

/**
 * What a moment feels and sounds like, in one place.
 *
 * docs/UI.md §5.1 specifies both halves of the same beat — a light haptic and a
 * soft "ding" on a correct answer — and §10 gives each its own toggle. So they
 * are two modules with one caller: screens fire a *moment*, and whether it
 * reaches the motor, the speaker, both or neither is settled here and in the
 * toggles, not at two hundred call sites.
 */

export function tapFeedback(): void {
  selectHaptic();
  playCue('tap');
}

/** The verdict on a question, the instant the answer is committed. */
export function revealFeedback(grade: Grade): void {
  revealHaptic(grade);
  playCue(grade === 'correct' ? 'correct' : grade === 'amber' ? 'amber' : 'wrong');
}

/** Committing a Long / Short / No-trade call, before the chart plays out. */
export function commitFeedback(): void {
  commitHaptic();
  playCue('commit');
}

/** A pair locking green in `match`. */
export function matchHitFeedback(): void {
  matchHitHaptic();
  playCue('tap');
}

/** A pair bouncing back in `match`. Firmer than a hit, softer than a verdict. */
export function matchMissFeedback(): void {
  matchMissHaptic();
  playCue('wrong');
}

/** The lesson-complete screen. */
export function celebrateFeedback(): void {
  celebrateHaptic();
  playCue('complete');
}
