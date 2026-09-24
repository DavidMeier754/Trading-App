import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useChartMove } from '../../lesson/haptics';
import { useLookSpec } from '../../lesson/look';
import { EASE_OUT, EASE_OUT_SETTLE } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, space, type } from '../../theme';
import { GROW_DELAY } from './GrowBar';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One slice lighting. */
const SLICE_MS = 260;

/** docs/UI.md §6.1 — a circle of N equal slices, `owned` of them filled. */
export default function OwnershipPie({
  data,
  size = 150,
}: {
  data: { total: number; owned: number };
  size?: number;
}) {
  const { total, owned } = data;
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const slice = (i: number) => {
    const a0 = (i / total) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`;
  };

  const accent = useLookSpec().accent;
  // The owned slices light one after another, clockwise from twelve: the
  // count is the lesson, so it is counted out rather than shown at once.
  const step = Math.min(90, 520 / Math.max(1, owned));
  // Like every chart, it vibrates while it moves and lands when it settles
  // (lesson/haptics.ts, startChartMove): here, while the slices light.
  const reduced = useReduceMotion();
  useChartMove(GROW_DELAY + (owned - 1) * step + SLICE_MS * EASE_OUT_SETTLE, !reduced && owned > 0);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        {Array.from({ length: total }, (_, i) => (
          <Path
            key={i}
            d={slice(i)}
            fill={colors.surfaceAlt}
            stroke={colors.background}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: owned }, (_, i) => (
          <OwnedSlice key={`o${i}`} d={slice(i)} fill={accent} delay={GROW_DELAY + i * step} />
        ))}
      </Svg>
      <Text style={styles.caption}>
        {`${owned} of ${total} = ${((owned / total) * 100).toFixed(0)} %`}
      </Text>
    </View>
  );
}

function OwnedSlice({ d, fill, delay }: { d: string; fill: string; delay: number }) {
  const reduced = useReduceMotion();
  const v = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) v.set(withDelay(delay, withTiming(1, { duration: SLICE_MS, easing: EASE_OUT })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const props = useAnimatedProps(() => ({ fillOpacity: v.get() }));
  return (
    <AnimatedPath
      d={d}
      fill={fill}
      fillOpacity={reduced ? 1 : 0}
      stroke={colors.background}
      strokeWidth={1}
      animatedProps={props}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm },
  caption: { ...type.body, color: colors.textMuted },
});
