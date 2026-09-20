import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { Grade } from './answers';

/**
 * docs/UI.md §5.1 asks for a light haptic on correct and a medium one on wrong.
 * Everything here uses the softest style that still registers: a verdict should
 * feel like a tap on the shoulder, not a buzz.
 *
 * §10 asks for a haptics toggle; there is no Settings screen yet, so haptics are
 * always on where the platform has a motor. Web has none, and every call is
 * guarded, so a device without one is a silent no-op rather than an error.
 */

function impact(style: Haptics.ImpactFeedbackStyle): void {
  if (Platform.OS === 'web') return;
  try {
    void Haptics.impactAsync(style);
  } catch {
    // A device without haptics is not an error.
  }
}

/** The verdict on a question. Fired the instant the answer is committed. */
export function revealHaptic(grade: Grade): void {
  impact(
    grade === 'wrong'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Soft
  );
}

/** A letter tile, a keypad key, an option being picked: the lightest tick there is. */
export function selectHaptic(): void {
  if (Platform.OS === 'web') return;
  try {
    void Haptics.selectionAsync();
  } catch {
    // ignored
  }
}

/** A pair locking green in `match`. */
export function matchHitHaptic(): void {
  impact(Haptics.ImpactFeedbackStyle.Soft);
}

/** A pair bouncing back in `match`. Firmer than a hit, softer than a verdict. */
export function matchMissHaptic(): void {
  impact(Haptics.ImpactFeedbackStyle.Rigid);
}

/** Committing a Long / Short / No-trade call, before the chart plays out. */
export function commitHaptic(): void {
  impact(Haptics.ImpactFeedbackStyle.Soft);
}

/** The lesson-complete screen. */
export function celebrateHaptic(): void {
  if (Platform.OS === 'web') return;
  try {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignored
  }
}
