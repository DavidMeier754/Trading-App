/**
 * Moments the home screen plays once on its way back from somewhere else,
 * kept here between the two, as the skills' flight is (fly.ts): the home
 * screen is not mounted under a lesson.
 */

let ignite = false;

/** docs/UI.md §5.3: the day's first lesson is done; the flame catches on the map. */
export function igniteFlame(): void {
  ignite = true;
}

/** Whether the flame should catch now; the flag is used up. */
export function takeIgnite(): boolean {
  const on = ignite;
  ignite = false;
  return on;
}

let shelf: number | null = null;

/** Settings → Testing → Animations: land this chapter's medal on the shelf again. */
export function replayShelf(chapter: number): void {
  shelf = chapter;
}

/** The medal to land again, if one was asked for; used up. */
export function takeShelfReplay(): number | null {
  const n = shelf;
  shelf = null;
  return n;
}
