import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Mood, onMood } from '../lesson/look';
import { colors } from '../theme';

const TEXTURES = {
  grain: require('../../assets/textures/grain.png'),
  scanlines: require('../../assets/textures/scanlines.png'),
  dots: require('../../assets/textures/dots.png'),
} as const;

/**
 * The new look's ground: a lit surface, not a colour field.
 *
 * The first version was an aurora -- blue, violet and teal blobs drifting on
 * loops -- and it read as generated, because it is the generated look: soft
 * saturated clouds with nothing casting them. This one takes its cues from
 * things that are lit instead. The ground has a grain, like print or film,
 * which breaks the digital smoothness and gives the dark a surface. There is
 * no ambient movement at all. And the only light that changes comes from one
 * place, the bottom edge, where the answer and the button are, and only
 * because something happened: a right answer spills green up from there, a
 * wrong one a brief dull red, a trade call a flash of blue; a run of three
 * warms it gold and holds, and a finished lesson floods it.
 *
 * One hue at a time, from the app's own tokens, and never more than a fifth
 * opaque. The grain is a 46 KB static tile (tools/gen_textures.py), repeated.
 */
export default function Atmosphere({ width, height }: { width: number; height: number }) {
  const flash = useSharedValue(0);
  const warm = useSharedValue(0);
  const [flashColor, setFlashColor] = useState(colors.success);

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
        warm.set(withTiming(hot ? (mood === 'complete' ? 1 : 0.7) : 0, { duration: hot ? 800 : 1200 }));
      }),
    [flash, warm]
  );

  return (
    <View style={styles.fill} pointerEvents="none">
      <EdgeLight id="warm" color={colors.warning} width={width} height={height * 0.5} level={warm} max={0.16} />
      <EdgeLight id="mood" color={flashColor} width={width} height={height * 0.42} level={flash} max={0.22} />
    </View>
  );
}

/**
 * A look's texture (tools/gen_textures.py): grain, scanlines or a dot grid,
 * one small tile repeated over the ground and under everything else.
 */
export function Texture({ kind }: { kind: keyof typeof TEXTURES }) {
  return (
    <View style={styles.fill} pointerEvents="none">
      <Image source={TEXTURES[kind]} resizeMode="repeat" style={styles.grain} />
    </View>
  );
}

/** How each beat lights the edge: how bright, how fast up, how slow down. */
const MOOD_LIGHT: Partial<
  Record<Mood, { color: string; peak: number; rest: number; rise: number; fall: number }>
> = {
  correct: { color: colors.success, peak: 1, rest: 0, rise: 240, fall: 1500 },
  streak: { color: colors.success, peak: 1, rest: 0, rise: 220, fall: 1700 },
  amber: { color: colors.warning, peak: 0.75, rest: 0, rise: 260, fall: 1300 },
  wrong: { color: colors.down, peak: 0.6, rest: 0, rise: 160, fall: 900 },
  commit: { color: colors.accent, peak: 0.7, rest: 0, rise: 140, fall: 1100 },
  complete: { color: colors.warning, peak: 1, rest: 0.4, rise: 500, fall: 2400 },
  calm: { color: colors.success, peak: 0, rest: 0, rise: 1, fall: 400 },
};

/**
 * Light spilling up from the bottom edge. The falloff is stepped like real
 * light -- strong at the source, most of it gone within a quarter of the way
 * up -- rather than a straight ramp, which is what reads as a painted stripe.
 */
function EdgeLight({
  id,
  color,
  width,
  height,
  level,
  max,
}: {
  id: string;
  color: string;
  width: number;
  height: number;
  level: SharedValue<number>;
  max: number;
}) {
  const style = useAnimatedStyle(() => ({ opacity: level.get() }));
  return (
    <Animated.View style={[styles.edge, { height }, style]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`edge-${id}`} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={max} />
            <Stop offset="0.18" stopColor={color} stopOpacity={max * 0.5} />
            <Stop offset="0.42" stopColor={color} stopOpacity={max * 0.18} />
            <Stop offset="0.7" stopColor={color} stopOpacity={max * 0.05} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#edge-${id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' },
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  grain: { width: '100%', height: '100%' },
});
