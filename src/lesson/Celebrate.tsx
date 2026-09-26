import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { colors, radius as radii } from '../theme';
import { pulseAt } from './feedback';
import { useLookSpec } from './look';
import { EASE_OUT, SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  // Each look celebrates in its own way (lesson/look.ts): rings and sparks in
  // Neo, rings alone in Classic, a square outline stepping out like a cursor
  // box in Terminal, a pencil circle in Blueprint, a burst of stars in Arcade,
  // a bloom of light behind the answer in Neo Violet.
  const kind = useLookSpec().celebrate;
  const hasRings = kind !== 'pencil';
  const square = kind === 'box';
  const peak = kind === 'stars' ? 1.08 : kind === 'box' || kind === 'pencil' ? 1 : 1.04;
  const ring1 = useSharedValue(reduced ? 1 : 0);
  const ring2 = useSharedValue(reduced ? 1 : 0);
  const swell = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    const second = rings === 2 ? pulseAt('correct0', 1) : 60;
    // The terminal's box steps outward in four jumps, like a redraw.
    const easing = square ? Easing.steps(4, true) : EASE_OUT;
    ring1.set(withTiming(1, { duration: square ? 520 : 720, easing }));
    ring2.set(withDelay(second, withTiming(1, { duration: square ? 520 : 820, easing })));
    if (peak > 1) {
      swell.set(
        withSequence(
          withDelay(Math.max(0, second - 80), withTiming(peak, { duration: 80, easing: EASE_OUT })),
          withSpring(1, SPRING_POP),
        ),
      );
    }
  }, [reduced, rings, square, peak, ring1, ring2, swell]);

  const r1 = useRingStyle(ring1, square ? 0 : radius, 0.85);
  const r2 = useRingStyle(ring2, square ? 0 : radius, 0.55);
  const body = useAnimatedStyle(() => ({ transform: [{ scale: swell.get() }] }));

  const [box, setBox] = useState({ w: 0, h: 0 });
  const measured = !reduced && box.w > 0;

  return (
    <View
      style={{ maxWidth: '100%' }}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {measured && kind === 'bloom' ? <Bloom w={box.w} h={box.h} color={color} /> : null}
      {hasRings ? (
        <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: color }, r1]} />
      ) : null}
      {hasRings && rings === 2 ? (
        <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: color }, r2]} />
      ) : null}
      <Animated.View style={body}>{children}</Animated.View>
      {measured && kind === 'sparks' ? (
        <Sparks w={box.w} h={box.h} color={color} waves={rings} />
      ) : null}
      {measured && kind === 'stars' ? (
        <Sparks w={box.w} h={box.h} color={color} waves={rings} stars />
      ) : null}
      {kind === 'pencil' && box.w > 0 ? (
        <PencilCircle w={box.w} h={box.h} instant={reduced} />
      ) : null}
    </View>
  );
}

/**
 * Blueprint's verdict: the right answer circled by hand. An open loop, a little
 * wobbly and a little tilted, that overshoots its own start the way a pencil
 * does -- drawn on over half a second from the cue's second pulse, and left there.
 */
function PencilCircle({ w, h, instant }: { w: number; h: number; instant: boolean }) {
  const PAD = 12;
  const { d, length } = React.useMemo(() => {
    const cx = w / 2 + PAD;
    const cy = h / 2 + PAD;
    const rx = w / 2 + 7;
    const ry = h / 2 + 7;
    const start = -Math.PI * 0.62;
    const sweep = Math.PI * 2 + 0.42;
    const tilt = -0.03;
    const pts: [number, number][] = [];
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const a = start + sweep * u;
      const wobble = 1 + 0.025 * Math.sin(a * 3 + 1.3) + 0.035 * u;
      const x = rx * wobble * Math.cos(a);
      const y = ry * wobble * Math.sin(a);
      pts.push([
        cx + x * Math.cos(tilt) - y * Math.sin(tilt),
        cy + x * Math.sin(tilt) + y * Math.cos(tilt),
      ]);
    }
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    }
    const path = pts
      .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');
    return { d: path, length: len };
  }, [w, h]);

  const draw = useSharedValue(instant ? 1 : 0);
  useEffect(() => {
    if (instant) return;
    draw.set(withDelay(pulseAt('correct0', 1), withTiming(1, { duration: 520, easing: EASE_OUT })));
  }, [instant, draw]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - draw.get()) }));

  return (
    <View pointerEvents="none" style={[styles.pencil, { left: -PAD, top: -PAD }]}>
      <Svg width={w + PAD * 2} height={h + PAD * 2}>
        <AnimatedPath
          d={d}
          stroke="#DCEAFF"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={`${length} ${length}`}
          strokeDashoffset={instant ? 0 : length}
          animatedProps={props}
        />
      </Svg>
    </View>
  );
}

/**
 * Neo Violet's verdict: light blooming out from behind the surface -- a soft
 * glow that swells past its edges on the cue's second pulse and fades as it
 * goes, as if the answer had been lit from underneath.
 */
function Bloom({ w, h, color }: { w: number; h: number; color: string }) {
  const PAD = 36;
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withDelay(
        Math.max(0, pulseAt('correct0', 1) - 60),
        withTiming(1, { duration: 1100, easing: EASE_OUT }),
      ),
    );
  }, [t]);
  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v <= 0 ? 0 : Math.min(1, v * 5) * (1 - v) * 0.9,
      transform: [{ scaleX: 0.85 + 0.25 * v }, { scaleY: 0.7 + 0.5 * v }],
    };
  });
  const W = w + PAD * 2;
  const H = h + PAD * 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pencil, { left: -PAD, top: -PAD, width: W, height: H }, style]}
    >
      <Svg width={W} height={H}>
        <Defs>
          <RadialGradient id="bloom" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={color} stopOpacity="0.55" />
            <Stop offset="0.6" stopColor={color} stopOpacity="0.18" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} fill="url(#bloom)" />
      </Svg>
    </Animated.View>
  );
}

const SPARKS_PER_WAVE = 9;
const SPARK_COLORS = ['#FFFFFF', colors.warning];

/**
 * Sparks thrown off a surface's edge: each leaves from the border at its own
 * angle and flies out, shrinking and fading. The second wave leaves on the
 * cue's second pulse, offset by half a step so the two do not overlap.
 */
const STAR_COLORS = ['#FFD23F', '#FFFFFF', '#FF5FA2', '#5FD4FF'];

function Sparks({
  w,
  h,
  color,
  waves,
  stars = false,
}: {
  w: number;
  h: number;
  color: string;
  waves: 1 | 2;
  /** Arcade: bigger, further, spinning diamonds in four colours. */
  stars?: boolean;
}) {
  const second = pulseAt('correct0', 1);
  const per = stars ? 12 : SPARKS_PER_WAVE;
  const all = [];
  for (let wave = 0; wave < waves; wave++) {
    for (let i = 0; i < per; i++) {
      const angle = ((i + wave * 0.5) / per) * Math.PI * 2 + 0.3;
      const seed = Math.abs(Math.sin((i + 1) * 12.9898 + wave * 78.233)) % 1;
      const reach = stars ? 34 + 44 * seed : 22 + 30 * seed;
      all.push(
        <Spark
          key={`${wave}-${i}`}
          x={w / 2 + (w / 2) * Math.cos(angle)}
          y={h / 2 + (h / 2) * Math.sin(angle)}
          dx={Math.cos(angle) * reach}
          dy={Math.sin(angle) * reach}
          delay={wave === 0 ? 0 : second}
          size={stars ? 7 + 5 * seed : 3 + 3 * seed}
          color={
            stars
              ? STAR_COLORS[i % STAR_COLORS.length]
              : i % 3 === 0
                ? SPARK_COLORS[wave % 2]
                : color
          }
          diamond={stars}
        />,
      );
    }
  }
  return (
    <View pointerEvents="none" style={styles.ring}>
      {all}
    </View>
  );
}

function Spark({
  x,
  y,
  dx,
  dy,
  delay,
  size,
  color,
  diamond = false,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
  size: number;
  color: string;
  diamond?: boolean;
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
        { rotate: diamond ? `${45 + 200 * v}deg` : '0deg' },
        { scale: 1.2 - 0.9 * v },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.spark,
        {
          width: size,
          height: size,
          borderRadius: diamond ? 1.5 : size / 2,
          backgroundColor: color,
        },
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
  pencil: { position: 'absolute' },
});
