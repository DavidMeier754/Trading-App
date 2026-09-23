import React, { useEffect } from 'react';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { G, Line, Rect } from 'react-native-svg';

import { EASE_OUT } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors } from '../theme';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * A chart arriving builds itself, left to right, the way the session did.
 *
 * docs/UI.md §6.4 draws a line chart on; candles had no entrance at all and
 * simply were there, which on a screen where everything else rises and pops
 * read as the one thing that had not loaded. Now each candle grows its body
 * from its open to its close -- a green one grows up, a red one down -- and
 * its wick reaches out after it, one bar after another. The volume bar under
 * it rises from the floor at the same moment.
 *
 * Only an entrance: a bar builds once, when it first appears. A chart that
 * re-renders, or a replay that has already shown a bar, does not build it
 * again (Chart decides which bars are new). Reduced motion shows them built.
 */

/** One bar's build. */
export const BUILD_MS = 460;

/** The gap between one bar starting and the next: the whole row in ~0.5 s. */
export function buildStagger(bars: number): number {
  return Math.max(26, Math.min(60, 520 / Math.max(1, bars)));
}

/** A body settling onto its close, a hair past and back. */
const BODY_EASE = Easing.bezier(0.3, 1.25, 0.6, 1);

/** 0 -> 1 once, from mount, after `delay`. Starts at 1 when it should not play. */
export function useEntrance(play: boolean, delay: number, duration: number): SharedValue<number> {
  const reduced = useReduceMotion();
  const animate = play && !reduced;
  const t = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) return;
    t.set(withDelay(delay, withTiming(1, { duration, easing: EASE_OUT })));
    // Mount only: the entrance is not replayed by a later render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return t;
}

export function BuildCandle({
  x,
  bodyW,
  yOpen,
  yClose,
  yHigh,
  yLow,
  up,
  play,
  delay,
  strokeWidth = 1.25,
  rx = 1,
}: {
  x: number;
  bodyW: number;
  yOpen: number;
  yClose: number;
  yHigh: number;
  yLow: number;
  up: boolean;
  play: boolean;
  delay: number;
  strokeWidth?: number;
  rx?: number;
}) {
  const reduced = useReduceMotion();
  const animate = play && !reduced;
  const t = useSharedValue(animate ? 0 : 1);
  const body = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) return;
    t.set(withDelay(delay, withTiming(1, { duration: BUILD_MS, easing: EASE_OUT })));
    body.set(withDelay(delay, withTiming(1, { duration: BUILD_MS, easing: BODY_EASE })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stroke = up ? colors.up : colors.down;
  const top = Math.min(yOpen, yClose);
  const bottom = Math.max(yOpen, yClose);

  const bodyProps = useAnimatedProps(() => {
    const yc = yOpen + (yClose - yOpen) * body.get();
    return {
      y: Math.min(yOpen, yc),
      height: Math.max(1.5, Math.abs(yc - yOpen)),
      opacity: Math.min(1, t.get() * 3),
    };
  });
  const wickProps = useAnimatedProps(() => {
    // The wick follows the body out rather than arriving with it.
    const k = Math.max(0, Math.min(1, (t.get() - 0.3) / 0.7));
    return {
      y1: top + (yHigh - top) * k,
      y2: bottom + (yLow - bottom) * k,
      opacity: Math.min(1, t.get() * 3),
    };
  });

  return (
    <G>
      <AnimatedLine
        x1={x}
        x2={x}
        y1={animate ? top : yHigh}
        y2={animate ? bottom : yLow}
        opacity={animate ? 0 : 1}
        stroke={stroke}
        strokeWidth={strokeWidth}
        animatedProps={wickProps}
      />
      <AnimatedRect
        x={x - bodyW / 2}
        y={animate ? yOpen : top}
        width={bodyW}
        height={animate ? 1.5 : Math.max(1.5, bottom - top)}
        opacity={animate ? 0 : 1}
        fill={up ? stroke : colors.background}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={rx}
        animatedProps={bodyProps}
      />
    </G>
  );
}

/** A volume bar rising from the floor of its strip. */
export function BuildVolume({
  x,
  width,
  floor,
  height,
  fill,
  play,
  delay,
}: {
  x: number;
  width: number;
  /** The strip's bottom edge. */
  floor: number;
  height: number;
  fill: string;
  play: boolean;
  delay: number;
}) {
  const reduced = useReduceMotion();
  const animate = play && !reduced;
  const t = useEntrance(play, delay, BUILD_MS);
  const props = useAnimatedProps(() => {
    const h = Math.max(1, height * t.get());
    return { y: floor - h, height: h };
  });
  return (
    <AnimatedRect
      x={x}
      y={animate ? floor - 1 : floor - height}
      width={width}
      height={animate ? 1 : height}
      fill={fill}
      opacity={0.45}
      rx={1}
      animatedProps={props}
    />
  );
}
