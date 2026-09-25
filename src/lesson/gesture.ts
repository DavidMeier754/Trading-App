import { Platform } from 'react-native';

/**
 * Whether the browser is still waiting for the first tap. Until then it refuses
 * to vibrate or to play sound, and complains about each attempt -- a vibrate
 * in the console, a `play()` as an unhandled rejection. Only a screen opened
 * straight from a link (a badge landing on load) can ask that early; the
 * lesson is fine in silence, so it simply does not ask.
 */
export function beforeFirstTap(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
    .userActivation;
  return !!activation && !activation.hasBeenActive;
}
