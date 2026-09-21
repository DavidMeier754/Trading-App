import { useCallback } from 'react';
import { cubicBezier, Easing, useReducedMotion } from 'react-native-reanimated';

import { selectHaptic } from './haptics';

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
 */
export function usePressFeedback(enabled = true) {
  const reduced = useReducedMotion();

  const onPressIn = useCallback(() => {
    if (!enabled) return;
    selectHaptic();
  }, [enabled]);

  const animates = enabled && !reduced;

  return {
    onPressIn,
    /**
     * Reanimated CSS transition: a two-state change needs no shared value.
     *
     * The resting `transform` has to be declared here. A transition animates
     * between two *declared* values, and this style used to declare none -- the
     * pressed style introduced the first `transform` the view had ever had, so
     * there was nothing to interpolate from and every press snapped. That snap
     * is what read as a stutter on the decision buttons.
     */
    style: animates ? PRESS_BASE : undefined,
    /** The pressed end state. Spread after `style`, never instead of it. */
    pressedStyle: animates ? PRESS_DOWN : undefined,
  };
}

/**
 * The same strong ease-out EASE_OUT encodes, for a CSS transition.
 *
 * It has to be Reanimated's own easing object, not the `cubic-bezier(...)`
 * string CSS takes: react-native-web hands the string straight to the browser,
 * so the string works on web and throws on a device -- "Invalid predefined
 * timing function". `cubicBezier` is correct on both.
 */
const PRESS_EASE = cubicBezier(0.23, 1, 0.32, 1);

const PRESS_BASE = {
  transform: [{ scale: 1 }],
  transitionProperty: 'transform',
  transitionDuration: `${DURATION.press}ms`,
  transitionTimingFunction: PRESS_EASE,
} as const;

const PRESS_DOWN = { transform: [{ scale: 0.97 }] } as const;

/** Reduced motion means gentler, not none: colour stays, movement goes. */
export function useMotion() {
  const reduced = useReducedMotion();
  return {
    reduced,
    travel: (px: number) => (reduced ? 0 : px),
    fade: (ms: number) => (reduced ? Math.min(ms, 140) : ms),
    move: (ms: number) => (reduced ? 0 : ms),
  };
}
