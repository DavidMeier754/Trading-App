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
/**
 * How long the reveal after a decision spends getting up to speed, and coming
 * back down again, at each end. It is a fixed number of milliseconds rather
 * than a share of the animation, which is the whole point of `rampEasing`
 * below: a twelve-bar chart gets the same unhurried start as a five-bar one
 * instead of a ramp two and a half times as long.
 */
export const REVEAL_RAMP_MS = 450;

/**
 * Slow in, constant, slow out -- for a reveal that lands one thing after
 * another. `ramp` is the share of the run spent at each end, and is clamped at
 * a half, where the two ramps meet and there is no constant stretch left.
 *
 * Neither bezier above does this job. They are shaped for a single element
 * travelling, and a `chart-decision` replay is a row of separate arrivals, so
 * what the curve really controls is the gap between them. A bezier sets those
 * gaps as a ratio, which means the middle has to be starved to pay for the
 * ends: `EASE_IN_OUT` over the 600 ms of Chapter 1's first decision leaves the
 * middle bars 25 ms apart, and 25 ms is a bar and a half at 60fps -- it does
 * not read as fast, it reads as dropped. A bezier's ramp also scales with the
 * duration, so the longer the chart, the longer the pause before anything
 * happens.
 *
 * This curve buys the ends with time instead. The bars in the middle keep the
 * 120 ms a candle of docs/UI.md §4.3 at every length, and the ramp costs a flat
 * 450 ms on top. Measured on Chapter 1's first decision, five bars:
 *
 *   linear                 120 120 120 120 120 ms   flat, no shape at all
 *   EASE_IN_OUT            235  40  25  44 255 ms   10x spread: a stutter
 *   sine bezier            178  84  76  84 178 ms   2.3x, and paid for by the middle
 *   this, ramp 450         340 125 120 125 340 ms   2.8x, and the middle is untouched
 *
 * The velocity is zero at both ends and rises as a half-cosine, so the first
 * bar creeps out rather than starting mid-stride.
 */
export function rampEasing(ramp: number) {
  const r = Math.min(0.5, Math.max(0, ramp));
  // the constant-speed stretch, set so the area under the velocity curve is 1
  const v = 1 / (1 - r);
  const k = r / (2 * Math.PI);
  return (u: number) => {
    'worklet';
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    if (r <= 0) return u;
    if (u < r) return v * (u / 2 - k * Math.sin((Math.PI * u) / r));
    if (u > 1 - r) {
      const w = 1 - u;
      return 1 - v * (w / 2 - k * Math.sin((Math.PI * w) / r));
    }
    return v * (r / 2 + (u - r));
  };
}

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
