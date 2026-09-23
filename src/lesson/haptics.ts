import { useSyncExternalStore } from 'react';
import * as Haptics from 'expo-haptics';

import type { HapticStyle, Pulse } from './cues.generated';

/**
 * The motor half of a cue. Which pulses fire, and when, is not decided here: it
 * comes from `cues.generated.ts`, the same table the sounds are rendered from,
 * so a pattern and its sound share their timings by construction. This module
 * only knows how to make one pulse of each weight, and whether it may.
 *
 * docs/UI.md §10 gives haptics a toggle of their own, separate from sounds.
 *
 * The web is left to expo-haptics rather than skipped: on a phone browser it
 * vibrates on Android and uses the switch-control tap on iOS, and on a desktop
 * it does nothing. Every call is guarded either way, so a device without a
 * motor is a silent no-op, never an error.
 */

let enabled = true;
const listeners = new Set<() => void>();

export function setHapticsEnabled(next: boolean): void {
  if (next === enabled) return;
  enabled = next;
  listeners.forEach((listener) => listener());
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

export function useHapticsEnabled(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    isHapticsEnabled,
    isHapticsEnabled
  );
}

const ignore = () => {};

const IMPACT: Record<Exclude<HapticStyle, 'selection'>, Haptics.ImpactFeedbackStyle> = {
  soft: Haptics.ImpactFeedbackStyle.Soft,
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  rigid: Haptics.ImpactFeedbackStyle.Rigid,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

function pulse(style: HapticStyle): void {
  try {
    const done =
      style === 'selection' ? Haptics.selectionAsync() : Haptics.impactAsync(IMPACT[style]);
    void Promise.resolve(done).catch(ignore);
  } catch {
    // A device without haptics is not an error.
  }
}

/**
 * Plays a cue's pulses at their offsets. The first is fired synchronously, in
 * the same frame as the visual and the sound that start with it; the rest are
 * timers, and each re-checks the toggle so switching haptics off mid-pattern
 * stops it at once.
 */
export function playPulses(pulses: readonly Pulse[]): void {
  if (!enabled) return;
  for (const [ms, style] of pulses) {
    if (ms <= 0) pulse(style);
    else setTimeout(() => enabled && pulse(style), ms);
  }
}
