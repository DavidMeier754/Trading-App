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

/** Moving on: Continue, Got it, Finish. */
export function advanceFeedback(): void {
  cue('advance');
}

/** Committing a Long / Short / No-trade call, before the chart plays out. */
export function commitFeedback(): void {
  cue('commit');
}

/**
 * A run of correct answers climbs the key; the chime is a step higher each time,
 * up to five steps. Milestones (3, 5, 10, 15 ...) get a sparkle on top.
 *
 * Amber holds a run and wrong ends it -- quietly. docs/UI.md §1 says a wrong
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

export function isStreakMilestone(streak: number): boolean {
  return streak === 3 || (streak >= 5 && streak % 5 === 0);
}

function correctCue(streak: number): CueName {
  if (isStreakMilestone(streak)) return 'streak';
  const level = Math.max(0, Math.min(4, streak - 1));
  return `correct${level}` as CueName;
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

export function unlockFeedback(): void {
  cue('unlock');
}

export function tierFeedback(): void {
  cue('tier');
}
