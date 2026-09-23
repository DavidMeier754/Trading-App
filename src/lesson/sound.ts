import { useSyncExternalStore } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { CUES, type CueName } from './cues.generated';

/**
 * The speaker half of a cue. The files are rendered by `tools/gen_sounds.py`
 * from the same table as the haptic pulses (see `cues.generated.ts`), so this
 * module plays a file and nothing else: when its notes land is already baked in.
 *
 * docs/UI.md §10 gives sounds their own toggle, separate from haptics.
 *
 * Players are made once and kept. `preloadCues` builds them when a lesson opens
 * rather than on first use, for two reasons. A player's first play on a device
 * has to load and decode its file, and that first play is exactly the one whose
 * lag the learner feels as sound arriving after the haptic. And on the web the
 * replay fires its bar ticks from the animation, not from a tap; a player that
 * already exists plays there without a gesture of its own.
 */

const players: Partial<Record<CueName, AudioPlayer>> = {};

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

function playerFor(name: CueName): AudioPlayer | null {
  try {
    let player = players[name];
    if (!player) {
      player = createAudioPlayer(CUES[name].file);
      players[name] = player;
    }
    return player;
  } catch {
    return null;
  }
}

/** Builds every player up front, so no cue pays for loading on its first play. */
export function preloadCues(): void {
  (Object.keys(CUES) as CueName[]).forEach(playerFor);
}

export function playSound(name: CueName): void {
  if (!enabled) return;
  const player = playerFor(name);
  if (!player) return;
  try {
    // Rewind first: the same cue fires again long before a lesson ends, and a
    // player left at the end of its buffer plays nothing at all.
    Promise.resolve(player.seekTo(0))
      .then(() => player.play())
      .catch(() => {});
  } catch {
    // A platform without audio, or a browser that has not been gestured at
    // yet, is not an error. The lesson is playable in silence.
  }
}
