import { useCallback, useMemo } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from './useReduceMotion';

import { selectHaptic } from './haptics';
import { playCue } from './sound';

/**
 * The app's motion tokens, on Reanimated.
 *
 * Reanimated's worklets run on the UI thread and keep running while JS is busy;
 * core `Animated` only gets that for transform and opacity, and never for
 * colour. Since the reveal animates a colour and a shake at the same moment,
 * core Animated had them on two different threads.
 */

/** Strong ease-out. Everything that enters or exits uses this. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** Strong ease-in-out, for something already on screen that moves. */
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export const DURATION = {
  /** Press feedback. Kept inside the 100-150 ms band; anything slower lags the finger. */
  press: 140,
  /** The inline reveal panel. */
  reveal: 260,
  /** Screen to screen. */
  screen: 300,
  /** How long the screen's slide takes to settle. Longer than the fade on purpose. */
  screenSettle: 450,
  /** A chart drawing itself. Explanatory, so it is allowed past the UI budget. */
  draw: 700,
  /** The end-of-lesson celebration. Rare tier, so it gets the delight budget. */
  celebrate: 900,
};

/** No-overshoot settle, for the screen slide. */
export const SPRING_SETTLE = { duration: DURATION.screenSettle, dampingRatio: 1 } as const;
/** A little life, for the celebration only. */
export const SPRING_POP = { duration: 520, dampingRatio: 0.62 } as const;

/**
 * Press feedback: scale to 0.97 with a tick, on press-*in*.
 *
 * Waiting for the tap to complete before showing anything is the latency the
 * user actually perceives, so the visual and the haptic both fire on press-in,
 * at the causal moment.
 *
 * This is a shared value rather than a Reanimated CSS transition. The CSS
 * transition reads better -- a two-state change wants no shared value -- but it
 * is the newest part of Reanimated and it was rejecting this config on device
 * while working in the web build. A shared value driving `useAnimatedStyle` is
 * the oldest path in the library, it is what the charts and the tone
 * transitions in this app already use, and it has the better thread behaviour
 * anyway: no React render on press at all, where the transition needed two.
 */
export function usePressFeedback(
  enabled = true,
  { sound = false }: { sound?: boolean } = {}
) {
  const reduced = useReduceMotion();
  const animates = enabled && !reduced;
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (!enabled) return;
    // The haptic is the press itself and always fires. The sound is opt-in:
    // most surfaces that use this hook are answers, and an answer already
    // sounds when it resolves -- ticking on the way down as well would play two
    // cues for one tap.
    selectHaptic();
    if (sound) playCue('tap');
    if (animates) scale.set(withTiming(PRESSED_SCALE, PRESS_IN));
  }, [enabled, animates, sound, scale]);

  // Coming back up is given a touch longer than going down: the press itself
  // should feel immediate, the release should not snap.
  const onPressOut = useCallback(() => {
    if (animates) scale.set(withTiming(1, PRESS_OUT));
  }, [animates, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return { onPressIn, onPressOut, style };
}

const PRESSED_SCALE = 0.97;
const PRESS_IN = { duration: DURATION.press, easing: EASE_OUT } as const;
const PRESS_OUT = { duration: DURATION.press + 50, easing: EASE_OUT } as const;

/**
 * Reduced motion means gentler, not none: colour stays, movement goes.
 *
 * Memoised on `reduced`, and that is not a micro-optimisation. Callers put this
 * object in the dependency array of the effect that plays a screen's entrance.
 * Returning a fresh object each render made every one of those effects re-run
 * on every render, so the screen replayed its entrance animation on each answer
 * tap, each keypad press and each reveal -- motion firing on input that had
 * nothing to do with arriving on a screen.
 */
export function useMotion() {
  const reduced = useReduceMotion();
  return useMemo(
    () => ({
      reduced,
      travel: (px: number) => (reduced ? 0 : px),
      fade: (ms: number) => (reduced ? Math.min(ms, 140) : ms),
      move: (ms: number) => (reduced ? 0 : ms),
    }),
    [reduced]
  );
}
