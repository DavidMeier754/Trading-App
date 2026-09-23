import { useSyncExternalStore } from 'react';

/**
 * Which visual layer the lesson wears.
 *
 * `neo` is the experimental one, and the default: a grained, lit ground whose
 * bottom edge answers the lesson's mood, glowing chart lines, sparks off a
 * right answer, glass surfaces, a streak meter in the top bar. `classic` is the
 * lesson as it was, flat panels on the grid, for anyone who would rather have
 * the numbers without the light show. Set from the picker before a lesson.
 *
 * Everything `neo` adds is decoration, so under reduced motion it keeps its
 * colour and loses its movement, like the rest of the app.
 */
export type Look = 'neo' | 'classic';

let look: Look = 'neo';
const listeners = new Set<() => void>();

export function setLook(next: Look): void {
  if (next === look) return;
  look = next;
  listeners.forEach((listener) => listener());
}

export function getLook(): Look {
  return look;
}

export function useLook(): Look {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getLook,
    getLook
  );
}

// ---------------------------------------------------------------------------
// Mood: what just happened, for the surfaces that react to it.
// ---------------------------------------------------------------------------

/**
 * The lesson's last beat, broadcast. The backdrop listens and lights the
 * bottom edge with it -- green on a right answer, a dull red dip on a wrong
 * one, warm gold while a run is on (components/Atmosphere.tsx). It is an event
 * bus rather than a prop because the backdrop sits in App, under the player,
 * and the player is the one that knows.
 */
export type Mood = 'correct' | 'amber' | 'wrong' | 'streak' | 'calm' | 'complete' | 'commit';

type MoodListener = (mood: Mood, run: number) => void;
const moodListeners = new Set<MoodListener>();

export function emitMood(mood: Mood, run = 0): void {
  moodListeners.forEach((listener) => listener(mood, run));
}

export function onMood(listener: MoodListener): () => void {
  moodListeners.add(listener);
  return () => {
    moodListeners.delete(listener);
  };
}
