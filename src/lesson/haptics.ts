import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { Grade } from './answers';

/**
 * docs/UI.md §5.1 — light haptic on a correct answer, medium on a wrong one.
 * An amber answer is "no shake, no heart lost", so it gets the soft one.
 *
 * §10 asks for a haptics toggle; this slice has no Settings screen, so haptics are
 * always on where the platform has them. Web has no haptics API worth using, and
 * every call is guarded so a platform without a motor is a silent no-op.
 */
export function revealHaptic(grade: Grade): void {
  if (Platform.OS === 'web') return;
  try {
    if (grade === 'wrong') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // A device without haptics is not an error.
  }
}
