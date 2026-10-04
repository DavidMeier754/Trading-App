import { useSyncExternalStore } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { CUES, type CueName } from './cues.generated';
import { beforeFirstTap } from './gesture';

/**
 * The speaker half of a cue. The files are rendered by `tools/gen_sounds.py`
 * from the same table as the haptic pulses (see `cues.generated.ts`), so this
 * module plays a file and nothing else: when its notes land is already baked in.
 *
 * docs/ui/15-theming-and-accessibility.md §10 gives sounds their own toggle, separate from haptics.
 *
 * Players are made once and kept. `preloadCues` builds them when a lesson opens
 * rather than on first use, for two reasons. A player's first play on a device
 * has to load and decode its file, and that first play is exactly the one whose
 * lag the learner feels as sound arriving after the haptic. And on the web the
 * replay fires its bar ticks from the animation, not from a tap; a player that
 * already exists plays there without a gesture of its own.
 *
 * Each cue has `VOICES` players that take turns. One player can only play one
 * sound at a time: a second tap while it still rang rewound it, cutting the
 * first sound off or swallowing the second. With three, fast taps each sound.
 *
 * Sounds play with the phone on silent (stage LOOK-BRIEF, docs/ui/15-theming-and-accessibility.md §10): the
 * app's own Sound toggle is the one switch that mutes them. They mix with other
 * apps' audio instead of stopping it.
 */

const VOICES = 3;
const players: Partial<Record<CueName, AudioPlayer[]>> = {};
const turn: Partial<Record<CueName, number>> = {};

let audioMode: Promise<void> | null = null;
function setUpAudio(): void {
  if (audioMode) return;
  try {
    audioMode = setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
  } catch {
    audioMode = Promise.resolve();
  }
}

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

/** Called whenever the toggle changes (the settings are saved from here). */
export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribeSound, isSoundEnabled, isSoundEnabled);
}

function voicesOf(name: CueName): AudioPlayer[] | null {
  try {
    let voices = players[name];
    if (!voices) {
      voices = Array.from({ length: VOICES }, () => createAudioPlayer(CUES[name].file));
      players[name] = voices;
    }
    return voices;
  } catch {
    return null;
  }
}

/** Builds every player up front, so no cue pays for loading on its first play. */
export function preloadCues(): void {
  setUpAudio();
  (Object.keys(CUES) as CueName[]).forEach(voicesOf);
}

export function playSound(name: CueName): void {
  if (!enabled || beforeFirstTap()) return;
  setUpAudio();
  const voices = voicesOf(name);
  if (!voices) return;
  const next = turn[name] ?? 0;
  turn[name] = (next + 1) % voices.length;
  const player = voices[next];
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
