/**
 * docs/UI.md §5.3 [DESIGN-REVIEW]: a lesson that taught new skills hands them
 * to the home screen, which flies them into the Practice tab as it opens. Kept
 * here between the two, since the home screen is not mounted under a lesson.
 */
let pending = 0;

/** The lesson just collected `n` new skills. */
export function flySkills(n: number): void {
  pending += Math.max(0, n);
}

/** How many to fly now; the count is used up. */
export function takeFlight(): number {
  const n = pending;
  pending = 0;
  return n;
}
