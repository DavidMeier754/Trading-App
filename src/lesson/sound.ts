import { useSyncExternalStore } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

/**
 * docs/UI.md §5.1 — the soft "ding" on a correct answer, and the rest of the
 * cues around it. §10 gives sounds their own toggle, separate from haptics.
 *
 * The files are synthesised by `tools/gen_sounds.py` rather than sourced: six
 * short tones need no library and no licence, and a generator can be re-run
 * when the palette changes. Every one is under 250 ms except the end-of-lesson
 * flourish — a sound the learner meets several hundred times over a path has to
 * be over before it is noticed.
 *
 * Players are created on first use, not at import: building an audio graph for
 * a lesson that may never make a sound is work for nothing, and on the web it
 * would open an AudioContext before any user gesture has happened.
 */

const FILES = {
  correct: require('../../assets/sounds/correct.wav'),
  amber: require('../../assets/sounds/amber.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  tap: require('../../assets/sounds/tap.wav'),
  commit: require('../../assets/sounds/commit.wav'),
  complete: require('../../assets/sounds/complete.wav'),
} as const;

export type Cue = keyof typeof FILES;

const players: Partial<Record<Cue, AudioPlayer>> = {};

let enabled = true;
const listeners = new Set<() => void>();

export function setSoundEnabled(next: boolean): void {
  if (next === enabled) return;
  enabled = next;
  listeners.forEach((listener) => listener());
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    isSoundEnabled,
    isSoundEnabled
  );
}

export function playCue(cue: Cue): void {
  if (!enabled) return;
  try {
    let player = players[cue];
    if (!player) {
      player = createAudioPlayer(FILES[cue]);
      players[cue] = player;
    }
    // Rewind first: the same cue fires again long before a lesson ends, and a
    // player left at the end of its buffer plays nothing at all.
    const p = player;
    Promise.resolve(p.seekTo(0))
      .then(() => p.play())
      .catch(() => {});
  } catch {
    // A platform without audio, or a browser that has not been gestured at
    // yet, is not an error. The lesson is playable in silence.
  }
}
