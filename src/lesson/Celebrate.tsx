import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius as radii } from '../theme';
import { pulseAt } from './feedback';
import { useLook } from './look';
import { EASE_OUT, SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** How far each ring travels out from the surface's edge. */
const REACH = 12;

/**
 * The right answer, landing: two rings go out from the surface and it swells a
 * few percent, then settles.
 *
 * Two rings because the `correct` cue has two pulses: the first ring leaves on
 * the first pulse and the second on the second, and the swell peaks with the
 * second too, so the eye, the ear and the hand all count the same "da-DING".
 * The second pulse's time is read from the cue table rather than copied here.
 *
 * The rings are absolutely positioned and childless, so growing their insets
 * lays out nothing else -- the one case where animating layout is free.
 */
export function Celebrate({
  children,
  radius = radii.md,
  color = colors.success,
  rings = 2,
}: {
  children: React.ReactNode;
  radius?: number;
  color?: string;
  /** One ring for a one-pulse cue (a match pair), two for the verdict. */
  rings?: 1 | 2;
}) {
  const reduced = useReduceMotion();
  const ring1 = useSharedValue(reduced ? 1 : 0);
  const ring2 = useSharedValue(reduced ? 1 : 0);
  const swell = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    const second = rings === 2 ? pulseAt('correct0', 1) : 60;
    ring1.set(withTiming(1, { duration: 720, easing: EASE_OUT }));
    ring2.set(withDelay(second, withTiming(1, { duration: 820, easing: EASE_OUT })));
    swell.set(
      withSequence(
        withDelay(Math.max(0, second - 80), withTiming(1.04, { duration: 80, easing: EASE_OUT })),
        withSpring(1, SPRING_POP)
      )
    );
  }, [reduced, rings, ring1, ring2, swell]);

  const r1 = useRingStyle(ring1, radius, 0.85);
  const r2 = useRingStyle(ring2, radius, 0.55);
  const body = useAnimatedStyle(() => ({ transform: [{ scale: swell.get() }] }));

  // The new look throws sparks off the edge as well, in two waves on the same
  // two pulses as the rings.
  const neo = useLook() === 'neo';
  const [box, setBox] = useState({ w: 0, h: 0 });

  return (
    <View onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: color }, r1]} />
      {rings === 2 ? (
        <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: color }, r2]} />
      ) : null}
      <Animated.View style={body}>{children}</Animated.View>
      {neo && !reduced && box.w > 0 ? (
        <Sparks w={box.w} h={box.h} color={color} waves={rings} />
      ) : null}
    </View>
  );
}

const SPARKS_PER_WAVE = 9;
const SPARK_COLORS = ['#FFFFFF', colors.warning];

/**
 * Sparks thrown off a surface's edge: each leaves from the border at its own
 * angle and flies out, shrinking and fading. The second wave leaves on the
 * cue's second pulse, offset by half a step so the two do not overlap.
 */
function Sparks({ w, h, color, waves }: { w: number; h: number; color: string; waves: 1 | 2 }) {
  const second = pulseAt('correct0', 1);
  const all = [];
  for (let wave = 0; wave < waves; wave++) {
    for (let i = 0; i < SPARKS_PER_WAVE; i++) {
      const angle = ((i + wave * 0.5) / SPARKS_PER_WAVE) * Math.PI * 2 + 0.3;
      const seed = Math.abs(Math.sin((i + 1) * 12.9898 + wave * 78.233)) % 1;
      all.push(
        <Spark
          key={`${wave}-${i}`}
          x={w / 2 + (w / 2) * Math.cos(angle)}
          y={h / 2 + (h / 2) * Math.sin(angle)}
          dx={Math.cos(angle) * (22 + 30 * seed)}
          dy={Math.sin(angle) * (22 + 30 * seed)}
          delay={wave === 0 ? 0 : second}
          size={3 + 3 * seed}
          color={i % 3 === 0 ? SPARK_COLORS[wave % 2] : color}
        />
      );
    }
  }
  return <View pointerEvents="none" style={styles.ring}>{all}</View>;
}

function Spark({
  x,
  y,
  dx,
  dy,
  delay,
  size,
  color,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
  size: number;
  color: string;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: 640, easing: EASE_OUT })));
  }, [delay, t]);
  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v <= 0 || v >= 1 ? 0 : 1 - v * v,
      transform: [
        { translateX: x - size / 2 + dx * v },
        { translateY: y - size / 2 + dy * v },
        { scale: 1.2 - 0.9 * v },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.spark,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

function useRingStyle(v: SharedValue<number>, radius: number, strength: number) {
  return useAnimatedStyle((): ViewStyle => {
    const r = v.get();
    const out = -REACH * r;
    return {
      top: out,
      left: out,
      right: out,
      bottom: out,
      borderRadius: radius + REACH * r,
      opacity: r >= 1 ? 0 : strength * (1 - r),
      borderWidth: 2.5 - 1.5 * r,
    };
  });
}

/**
 * A mark arriving: a check, a cross, a badge. Scales up from 40% with a little
 * overshoot, optionally after a delay so it can land on a pulse.
 */
export function PopIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
}) {
  const reduced = useReduceMotion();
  const v = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    v.set(withDelay(delay, withSpring(1, SPRING_POP)));
  }, [reduced, delay, v]);

  const s = useAnimatedStyle(() => ({
    opacity: Math.min(1, v.get() * 2.5),
    transform: [{ scale: 0.4 + 0.6 * v.get() }],
  }));

  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}

/**
 * Something arriving on screen: fades in while it travels the last few points
 * into place on a settled spring. `from` picks the direction, `delay` staggers
 * a group so it reads as one arrival in a few beats rather than a blink.
 */
export function Arrive({
  children,
  delay = 0,
  from = 'below',
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: 'below' | 'right';
  style?: ViewStyle | ViewStyle[];
}) {
  const reduced = useReduceMotion();
  const v = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    v.set(withDelay(delay, withSpring(1, ARRIVE)));
  }, [reduced, delay, v]);

  const s = useAnimatedStyle(() => {
    const t = v.get();
    const d = 1 - t;
    return {
      opacity: Math.min(1, t * 1.6),
      transform: from === 'right' ? [{ translateX: 28 * d }] : [{ translateY: 16 * d }],
    };
  });

  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}

const ARRIVE = { duration: 620, dampingRatio: 0.86 } as const;

const styles = StyleSheet.create({
  ring: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  spark: { position: 'absolute', top: 0, left: 0 },
});
