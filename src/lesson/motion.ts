import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { useReduceMotion } from './useReduceMotion';

/**
 * The app's motion tokens. Durations and curves used to be literals scattered
 * across eight files, which is how a 300 ms fade ended up paired with a 420 ms
 * slide in the same transition.
 */

/** Strong ease-out. Everything that enters or exits uses this. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** Strong ease-in-out, for something already on screen that moves. */
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export const DURATION = {
  /** Press feedback. */
  press: 160,
  /** The inline reveal panel. */
  reveal: 200,
  /** Screen to screen, and the progress bar that fills underneath it. */
  screen: 220,
  /** A chart drawing itself. Explanatory, so it is allowed past the UI budget. */
  draw: 600,
  /** The end-of-lesson celebration. Rare, so it can take its time. */
  celebrate: 900,
};

/**
 * docs/UI.md §10 and the reduced-motion rule: reduced motion means *gentler*,
 * not none. Position changes go away; the opacity fade that tells you the
 * screen changed at all stays, at a shorter duration.
 */
export function motionFor(reduced: boolean) {
  return {
    /** Distance an entering element travels. Zero when motion is reduced. */
    travel: (px: number) => (reduced ? 0 : px),
    /** Duration for a fade. Kept non-zero so state changes stay legible. */
    fade: (ms: number) => (reduced ? Math.min(ms, 120) : ms),
    /** Duration for movement. Collapses to zero when motion is reduced. */
    move: (ms: number) => (reduced ? 0 : ms),
  };
}

/**
 * Press feedback: `scale(0.97)` over 160 ms (STANDARDS: subtle, 0.95-0.98).
 *
 * React Native's `Pressable` style callback is an instant cut, so a pressed
 * style alone can only flick opacity. This drives a real transition and is
 * shared by every tappable surface in the player.
 */
export function usePressScale(enabled = true) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReduceMotion();

  const to = useCallback(
    (value: number) => {
      if (!enabled || reduced) return;
      Animated.timing(scale, {
        toValue: value,
        duration: DURATION.press,
        easing: EASE_OUT,
        useNativeDriver: true,
      }).start();
    },
    [enabled, reduced, scale]
  );

  return {
    onPressIn: () => to(0.97),
    onPressOut: () => to(1),
    style: { transform: [{ scale }] },
  };
}
