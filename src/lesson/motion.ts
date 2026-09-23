import { useCallback, useMemo } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { CueName } from './cues.generated';
import { cue as fireCue } from './feedback';
import { useReduceMotion } from './useReduceMotion';

/**
 * The app's motion tokens, on Reanimated.
 *
 * Reanimated's worklets run on the UI thread and keep running while JS is busy;
 * core `Animated` only gets that for transform and opacity, and never for
 * colour. Since the reveal animates a colour and a shake at the same moment,
 * core Animated had them on two different threads.
 *
 * Two speeds, on purpose. What answers the finger -- the press, the colour
 * the instant an answer is judged -- stays fast, because a slow press reads as
 * lag, not luxury. Everything that *arrives* afterwards -- the reveal panel,
 * the next screen, the chart, the celebration -- takes its time, and those are
 * the numbers below that grew.
 */

/** Strong ease-out. Everything that enters or exits uses this. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** Strong ease-in-out, for something already on screen that moves. */
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
/** A gentle ease-in-out (a sine), for a value sweeping across a range. */
export const EASE_SINE = Easing.bezier(0.37, 0, 0.63, 1);

export const DURATION = {
  /** Press feedback. Kept inside the 100-150 ms band; anything slower lags the finger. */
  press: 140,
  /** An answer taking its verdict colour. Starts at once (UI.md §1.4), settles slowly. */
  reveal: 380,
  /** Screen to screen. */
  screen: 420,
  /** How long the screen's slide takes to settle. Longer than the fade on purpose. */
  screenSettle: 640,
  /** A chart drawing itself. Explanatory, so it is allowed past the UI budget. */
  draw: 1200,
  /** The end-of-lesson ring filling. Rare tier, so it gets the delight budget. */
  celebrate: 1500,
};

/** No-overshoot settle, for the screen slide. */
export const SPRING_SETTLE = { duration: DURATION.screenSettle, dampingRatio: 1 } as const;
/** The reveal panel after a right answer: it arrives with a little lift. */
export const SPRING_PANEL = { duration: 620, dampingRatio: 0.74 } as const;
/** The reveal panel after anything else: the same arrival, without the bounce. */
export const SPRING_PANEL_CALM = { duration: 620, dampingRatio: 1 } as const;
/** A little life, for marks and badges popping in. */
export const SPRING_POP = { duration: 520, dampingRatio: 0.55 } as const;
/** Something with weight landing: a badge, a tier. */
export const SPRING_LAND = { duration: 900, dampingRatio: 0.6 } as const;

/**
 * The replay after a `chart-decision`: a slow reveal.
 *
 * Every bar lands on a tick you can feel and hear, so the curve is really
 * setting the gaps between ticks. It starts from rest, runs at one bar per
 * `REVEAL_BAR_MS` through the middle, and spends longer coming to rest than it
 * spent getting going -- the last bar is the one the learner is waiting on, so
 * that is where the wait goes. The ramps are fixed lengths bought on top of the
 * run, not shares of it, so every chart gets the same unhurried start and the
 * same long glide into its final bar however many bars it has.
 *
 * Measured in the browser on Chapter 1's first decision (five bars), the gap
 * before each bar lands, and the whole run:
 *
 *   linear, 120 ms a bar         117 117 117 117 117 ms    600 ms
 *   ramp 450 / 450, 120 a bar    340 125 120 125 340 ms   1050 ms
 *   this, 700 / 1200, 260 a bar  630 266 250 284 ~770 ms  2220 ms
 *
 * The first bar lands six tenths of a second in, the middle ones a quarter of
 * a second apart, and the last glides in over three quarters of a second: the
 * playhead moves at 15% of its average speed in the first eighth of the run
 * and 13% in the last.
 */
export const REVEAL_IN_MS = 700;
export const REVEAL_OUT_MS = 1200;
export const REVEAL_BAR_MS = 260;

export function revealTiming(bars: number) {
  const legs = Math.max(1, bars);
  let duration = REVEAL_BAR_MS * legs + (REVEAL_IN_MS + REVEAL_OUT_MS) / 2;
  // Too few bars for both ramps and a middle: the ramps meet, and the run is
  // pure slow-in, slow-out.
  if ((REVEAL_IN_MS + REVEAL_OUT_MS) / (2 * REVEAL_BAR_MS) > legs) {
    duration = REVEAL_IN_MS + REVEAL_OUT_MS;
  }
  return {
    duration,
    easing: rampEasing(REVEAL_IN_MS / duration, REVEAL_OUT_MS / duration),
  };
}

/**
 * Slow in, constant, slow out, with the two ends set separately.
 *
 * `rampIn` and `rampOut` are the shares of the run spent getting up to speed
 * and coming back to rest. The velocity rises and falls as half-cosines, so it
 * is zero at both ends -- the first bar creeps out rather than starting
 * mid-stride, and the last one settles instead of stopping dead.
 *
 * Not a bezier: a bezier sets the gaps between bars as a ratio, so the middle
 * has to be starved to pay for slow ends, and its ramps stretch with the
 * duration. This one buys the ends with time and leaves the middle alone.
 */
export function rampEasing(rampIn: number, rampOut: number) {
  let a = Math.max(0, rampIn);
  let b = Math.max(0, rampOut);
  if (a + b > 1) {
    const s = 1 / (a + b);
    a *= s;
    b *= s;
  }
  // the constant-speed stretch, set so the area under the velocity curve is 1
  const v = 1 / (1 - (a + b) / 2);
  const ka = a / (2 * Math.PI);
  const kb = b / (2 * Math.PI);
  return (u: number) => {
    'worklet';
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    if (a > 0 && u < a) return v * (u / 2 - ka * Math.sin((Math.PI * u) / a));
    if (b > 0 && u > 1 - b) {
      const w = 1 - u;
      return 1 - v * (w / 2 - kb * Math.sin((Math.PI * w) / b));
    }
    return v * (a / 2 + (u - a));
  };
}

/**
 * Press feedback: scale to 0.97 on press-*in*, and the press's cue with it.
 *
 * Waiting for the tap to complete before showing anything is the latency the
 * user actually perceives, so the visual, the haptic and the sound all start on
 * press-in, in the same frame. `cue` is `'tick'` for something being chosen and
 * `null` for a press whose meaning only exists on release -- Check, a trade
 * call -- which fires its own verdict or commit cue then. One press, one cue:
 * a surface that ticked on the way down and again on the way up was two
 * haptics for one tap.
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
  { cue = 'tick' }: { cue?: CueName | null } = {}
) {
  const reduced = useReduceMotion();
  const animates = enabled && !reduced;
  // 0 at rest, 1 fully pressed. Exposed so a surface can build its own press
  // (the CTA sinks into its edge) on the same timing as everything else.
  const pressed = useSharedValue(0);

  const onPressIn = useCallback(() => {
    if (!enabled) return;
    if (cue) fireCue(cue);
    if (animates) pressed.set(withTiming(1, PRESS_IN));
  }, [enabled, animates, cue, pressed]);

  // Coming back up is given a touch longer than going down: the press itself
  // should feel immediate, the release should not snap.
  const onPressOut = useCallback(() => {
    if (animates) pressed.set(withTiming(0, PRESS_OUT));
  }, [animates, pressed]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - PRESSED_SCALE) * pressed.get() }],
  }));

  return { onPressIn, onPressOut, style, pressed };
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
