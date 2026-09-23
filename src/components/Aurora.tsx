import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Mood, onMood } from '../lesson/look';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors } from '../theme';

/**
 * The experimental look's sky: soft coloured light drifting behind the grid, and
 * a room that answers the lesson.
 *
 * Three slow blobs -- blue, violet, teal -- wander on long Lissajous loops, each
 * on its own period so the pattern never visibly repeats. Under them sits the
 * mood light, fed by `emitMood`: a right answer sends green light up from the
 * bottom of the screen, a wrong one a brief, dull red, a trade call a flash of
 * blue; a run of three or more warms the whole room gold until it ends, and a
 * finished lesson floods it.
 *
 * Every blob is a radial gradient in an SVG that never re-renders; only its
 * view's transform and opacity move, so the drift is compositor work. Reduced
 * motion stops the drift and keeps the colour, which is the state change.
 */
export default function Aurora({ width, height }: { width: number; height: number }) {
  const reduced = useReduceMotion();
  const drift = useSharedValue(0);
  const flash = useSharedValue(0);
  const warm = useSharedValue(0);
  const [flashColor, setFlashColor] = useState(colors.success);

  useEffect(() => {
    if (reduced) {
      drift.set(0);
      return;
    }
    // One long cycle; the blobs run at different multiples of it.
    drift.set(withRepeat(withTiming(1, { duration: 60000, easing: Easing.linear }), -1, false));
  }, [reduced, drift]);

  useEffect(
    () =>
      onMood((mood: Mood, run: number) => {
        const light = MOOD_LIGHT[mood];
        if (light) {
          setFlashColor(light.color);
          flash.set(
            withSequence(
              withTiming(light.peak, { duration: light.rise, easing: Easing.out(Easing.quad) }),
              withTiming(light.rest, { duration: light.fall, easing: Easing.inOut(Easing.quad) })
            )
          );
        }
        const hot = mood === 'complete' || (mood !== 'wrong' && mood !== 'calm' && run >= 3);
        warm.set(withTiming(hot ? (mood === 'complete' ? 1 : 0.75) : 0, { duration: hot ? 700 : 1100 }));
      }),
    [flash, warm]
  );

  const size = Math.max(width, 320);
  return (
    <View style={styles.fill} pointerEvents="none">
      <Blob id="a1" color={colors.accent} alpha={0.26} size={size * 1.15} drift={drift}
        x={-0.28 * size} y={-0.18 * size} ax={34} ay={28} fx={3} fy={2} phase={0} />
      <Blob id="a2" color="#8B5CF6" alpha={0.2} size={size * 1.05} drift={drift}
        x={0.42 * width} y={0.22 * height} ax={40} ay={36} fx={2} fy={3} phase={0.3} />
      <Blob id="a3" color="#14B8A6" alpha={0.15} size={size} drift={drift}
        x={-0.2 * size} y={0.58 * height} ax={30} ay={26} fx={4} fy={3} phase={0.6} />
      <Glow id="warm" color={colors.warning} size={size * 1.5} level={warm}
        x={width / 2 - (size * 1.5) / 2} y={height * 0.35 - (size * 1.5) / 2} max={0.24} />
      <Glow id="mood" color={flashColor} size={size * 1.4} level={flash}
        x={width / 2 - (size * 1.4) / 2} y={height - size * 0.62} max={0.42} />
    </View>
  );
}

/** How each beat lights the room: how bright, how fast up, how slow down. */
const MOOD_LIGHT: Partial<
  Record<Mood, { color: string; peak: number; rest: number; rise: number; fall: number }>
> = {
  correct: { color: colors.success, peak: 1, rest: 0, rise: 220, fall: 1500 },
  streak: { color: colors.success, peak: 1, rest: 0, rise: 200, fall: 1700 },
  amber: { color: colors.warning, peak: 0.7, rest: 0, rise: 260, fall: 1300 },
  wrong: { color: colors.down, peak: 0.55, rest: 0, rise: 160, fall: 900 },
  commit: { color: colors.accent, peak: 0.7, rest: 0, rise: 140, fall: 1100 },
  complete: { color: colors.warning, peak: 1, rest: 0.35, rise: 500, fall: 2400 },
  calm: { color: colors.success, peak: 0, rest: 0, rise: 1, fall: 400 },
};

function Blob({
  id,
  color,
  alpha,
  size,
  drift,
  x,
  y,
  ax,
  ay,
  fx,
  fy,
  phase,
}: {
  id: string;
  color: string;
  alpha: number;
  size: number;
  drift: SharedValue<number>;
  x: number;
  y: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  phase: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = (drift.get() + phase) * Math.PI * 2;
    return {
      transform: [
        { translateX: x + ax * Math.sin(t * fx) },
        { translateY: y + ay * Math.cos(t * fy) },
        { scale: 1 + 0.06 * Math.sin(t * (fx + fy)) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.blob, { width: size, height: size }, style]}>
      <Disc id={id} color={color} alpha={alpha} size={size} />
    </Animated.View>
  );
}

function Glow({
  id,
  color,
  size,
  level,
  x,
  y,
  max,
}: {
  id: string;
  color: string;
  size: number;
  level: SharedValue<number>;
  x: number;
  y: number;
  max: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: level.get(),
    transform: [{ translateX: x }, { translateY: y }, { scale: 0.9 + 0.1 * level.get() }],
  }));
  return (
    <Animated.View style={[styles.blob, { width: size, height: size }, style]}>
      <Disc id={id} color={color} alpha={max} size={size} />
    </Animated.View>
  );
}

function Disc({ id, color, alpha, size }: { id: string; color: string; alpha: number; size: number }) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={`aurora-${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={alpha} />
          <Stop offset="0.5" stopColor={color} stopOpacity={alpha * 0.4} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#aurora-${id})`} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' },
  blob: { position: 'absolute', left: 0, top: 0 },
});
