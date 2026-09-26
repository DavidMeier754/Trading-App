import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { count } from '../../format';

import { useChartMove } from '../../lesson/haptics';
import { useLookSpec } from '../../lesson/look';
import { EASE_OUT, EASE_OUT_SETTLE } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, space, type } from '../../theme';
import { GROW_DELAY } from './GrowBar';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One slice lighting. */
const SLICE_MS = 260;

/** Past this many, a slice is thinner than the line between two; see below. */
const MAX_SLICES = 120;

/** "1", "0.5", "2.5": a share of the whole to one decimal, no trailing zero. */
function percent(owned: number, total: number): string {
  return String(Math.round((owned / total) * 1000) / 10);
}

/**
 * docs/UI.md §6.1 — a circle of N equal slices, `owned` of them filled.
 *
 * Up to MAX_SLICES the slices are drawn and the owned ones counted out. A
 * thousand shares cannot be: each slice would be under half a point wide, the
 * hairlines between them would paint the whole disc the ground's colour, and
 * the owned slices vanished into it. There the whole company is one disc and
 * the owned part one wedge of it, the same size it would have been.
 */
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

  const sliced = total <= MAX_SLICES;

  // The owned part in one piece: a wedge clockwise from twelve.
  const wedge = (frac: number) => {
    if (frac >= 1) return `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx - 0.01},${cy - r} Z`;
    const a1 = frac * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x1},${y1} Z`;
  };

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
  const step = sliced ? Math.min(90, 520 / Math.max(1, owned)) : 0;
  // Like every chart, it vibrates while it moves and lands when it settles
  // (lesson/haptics.ts, startChartMove): here, while the slices light.
  const reduced = useReduceMotion();
  useChartMove(
    GROW_DELAY + (sliced ? owned - 1 : 0) * step + SLICE_MS * EASE_OUT_SETTLE,
    !reduced && owned > 0,
  );

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        {sliced ? null : (
          <>
            <Circle cx={cx} cy={cy} r={r} fill={colors.surfaceAlt} />
            {owned > 0 ? (
              <OwnedSlice d={wedge(owned / total)} fill={accent} delay={GROW_DELAY} />
            ) : null}
          </>
        )}
        {!sliced
          ? null
          : Array.from({ length: total }, (_, i) => (
              <Path
                key={i}
                d={slice(i)}
                fill={colors.surfaceAlt}
                stroke={colors.background}
                strokeWidth={1}
              />
            ))}
        {!sliced
          ? null
          : Array.from({ length: owned }, (_, i) => (
              <OwnedSlice key={`o${i}`} d={slice(i)} fill={accent} delay={GROW_DELAY + i * step} />
            ))}
      </Svg>
      <Text style={styles.caption}>
        {`${count(owned)} of ${count(total)} = ${percent(owned, total)} %`}
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
