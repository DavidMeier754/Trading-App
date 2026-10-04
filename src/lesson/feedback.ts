import type { Grade } from './answers';
import { CUES, type CueName } from './cues.generated';
import { playPulses } from './haptics';
import { playSound } from './sound';

/**
 * What a moment feels and sounds like, in one place.
 *
 * Screens fire a *moment* -- a tap, a verdict, a pair locking in -- and never a
 * haptic or a sound on their own. A moment is one cue from `cues.generated.ts`,
 * and a cue carries both halves: the file and the pulses, written from one table
 * by `tools/gen_sounds.py`. Whether either half reaches the speaker or the motor
 * is settled by the two toggles, not at the call site.
 *
 * One user action, one cue. The old surfaces ticked the motor on press-in and
 * again on release, with the sound only on the second: two haptics and one
 * sound for a single tap.
 */
export function cue(name: CueName): void {
  playSound(name);
  playPulses(CUES[name].pulses);
}

/** When pulse `i` of a cue lands, for a visual that should land with it. */
export function pulseAt(name: CueName, i: number): number {
  return CUES[name].pulses[i]?.[0] ?? 0;
}

/** Choosing: an option, a tile, a key, a chip. */
export function tapFeedback(): void {
  cue('tick');
}

/**
 * A drag passing a step: a slider's notch, a dragged line's fifth cent, a chip
 * lifted. It can come several times a second, so it is barely there -- a
 * fraction of a tap, felt more than heard.
 */
export function detentFeedback(): void {
  cue('detent');
}

/** Moving on: Continue, Got it, Finish. */
export function advanceFeedback(): void {
  cue('advance');
}

/** Committing a Long / Short / No-trade call, before the chart plays out. */
export function commitFeedback(): void {
  cue('commit');
}

/**
 * A run of right answers is three sounds, no more: the chime for the first,
 * the same chime a step higher for the second, and from the third on -- streak
 * mode, where the screen's own streak signals light up too -- the streak
 * sound, the same every time. The climb says "keep going"; the streak stays
 * put instead of climbing on into a squeal. (It used to climb five steps and
 * cut in with the streak sound at 3, 5, 10 ..., so a run hopped between a
 * rising chime and a different sound and never settled.)
 *
 * Amber holds a run and wrong ends it -- quietly. docs/ui/01-design-principles.md §1 says a wrong
 * answer in a lesson costs nothing but a second look, and "No trade" is never
 * red, so nothing here ever announces a run being lost. The next correct answer
 * simply starts from the bottom of the scale again.
 */
export function streakAfter(grades: (Grade | null)[], index: number, grade: Grade): number {
  const run = runBefore(grades, index);
  if (grade === 'correct') return run + 1;
  return grade === 'wrong' ? 0 : run;
}

/** The run standing before screen `upTo`: screens without a grade hold it. */
export function runBefore(grades: (Grade | null)[], upTo: number): number {
  let run = 0;
  for (let i = 0; i < Math.min(upTo, grades.length); i++) {
    if (grades[i] === 'correct') run += 1;
    else if (grades[i] === 'wrong') run = 0;
  }
  return run;
}

/** Right answers in a row from which a run is a streak. */
export const STREAK_FROM = 3;

/** Where a streak earns its bigger reveal badge: 3, then 5, 10, 15 ... */
export function isStreakMilestone(streak: number): boolean {
  return streak === STREAK_FROM || (streak >= 5 && streak % 5 === 0);
}

function correctCue(streak: number): CueName {
  if (streak >= STREAK_FROM) return 'streak';
  return streak >= 2 ? 'correct1' : 'correct0';
}

/** The verdict on a question, the instant it is known. */
export function revealFeedback(grade: Grade, streak = 1): void {
  if (grade === 'correct') cue(correctCue(streak));
  else cue(grade === 'amber' ? 'amber' : 'wrong');
}

/** The `n`th pair locking in on a `match` screen: each one pops a step higher. */
export function matchHitFeedback(n: number): void {
  cue(`pop${Math.max(0, Math.min(3, n))}` as CueName);
}

/** The last pair locking in: the board is done, and a wave runs across it (docs/ui/04-question-types.md §4.1). */
export function matchBoardFeedback(): void {
  cue('board');
}

/** A pair bouncing back in `match`. */
export function matchMissFeedback(): void {
  cue('miss');
}

/** One step of the pentatonic scale, 0 (low) to 9 (high). */
export const NOTE_STEPS = 10;
export function noteFeedback(step: number): void {
  const i = Math.max(0, Math.min(NOTE_STEPS - 1, Math.round(step)));
  cue(`note${i}` as CueName);
}

/** XP counting up. */
export function coinFeedback(): void {
  cue('coin');
}

/** The lesson-complete ring closing. */
export function celebrateFeedback(perfect: boolean): void {
  cue(perfect ? 'perfect' : 'complete');
}

export function badgeFeedback(): void {
  cue('badge');
}

/** A chapter's medal landing: heavier and longer than a badge (docs/ui/07-lesson-chapter-and-tier-complete.md §5.4). */
export function medalFeedback(): void {
  cue('medal');
}

export function unlockFeedback(): void {
  cue('unlock');
}

/** A level's lock shaking loose on its three swings, before `unlockFeedback` (home/LevelNode.tsx). */
export function rattleFeedback(): void {
  cue('rattle');
}

/** Something small landing in place: the START tag over a level that has just opened. */
export function landFeedback(): void {
  cue('pop0');
}

/** A level's check badge landing as the level is finished on the map. */
export function doneFeedback(): void {
  cue('pop2');
}

/** The streak screens (docs/ui/11-top-bar.md §7.2): the flame catching, as the streak goes up a day. */
export function igniteFeedback(): void {
  cue('ignite');
}

/** A big number turning over to its next value: the streak's day count. */
export function flipFeedback(): void {
  cue('flip');
}

/** Today's dot in the week filling in. */
export function dayFeedback(): void {
  cue('pop3');
}

/** The flame going out, as a streak is lost: soft and falling, never a scolding. */
export function fizzleFeedback(): void {
  cue('fizzle');
}

export function tierFeedback(): void {
  cue('tier');
}
