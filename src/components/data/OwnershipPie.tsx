import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { count } from '../../format';

import { useChartMove } from '../../lesson/haptics';
import { useLookSpec } from '../../lesson/look';
import { EASE_OUT, EASE_OUT_SETTLE } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, space, type, themed } from '../../theme';
import { GROW_DELAY } from './GrowBar';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** One slice lighting. */
const SLICE_MS = 260;

/**
 * [v4] Above this many parts the circle becomes a grid (docs/ui/08-quotes-and-charts.md §6.1):
 * a circle of 100 slices reads as a dark disc.
 */
const MAX_SLICES = 20;

/** The grid is ten squares a row, and never more than a hundred squares. */
const GRID_COLS = 10;
const GRID_MAX = 100;

/** "1", "0.5", "2.5": a share of the whole to one decimal, no trailing zero. */
function percent(owned: number, total: number): string {
  return String(Math.round((owned / total) * 1000) / 10);
}

/**
 * docs/ui/08-quotes-and-charts.md §6.1 — a circle of N equal slices, `owned` of them filled,
 * up to 20 parts; above that a grid of squares. A circle of a hundred slices
 * read as a dark disc, and a thousand could only be one wedge.
 */
export default function OwnershipPie({
  data,
  size = 150,
}: {
  data: { total: number; owned: number };
  size?: number;
}) {
  if (data.total > MAX_SLICES) return <OwnershipGrid data={data} size={size} />;
  return <OwnershipCircle data={data} size={size} />;
}

/**
 * [LOOK-COMPONENTS] Above 20 parts, a 10 × 10 grid of squares (docs/ui/08-quotes-and-charts.md §6.1).
 * Up to a hundred parts each square is one part; past that each square is an
 * equal share of them (1,000 shares: ten a square), and a share of a square
 * fills that part of it, from the left. The owned squares light one after
 * another, row by row, as the slices did.
 */
function OwnershipGrid({ data, size }: { data: { total: number; owned: number }; size: number }) {
  const { total, owned } = data;
  const cells = Math.min(total, GRID_MAX);
  const per = total / cells;
  const lit = Math.max(0, Math.min(cells, owned / per));
  const full = Math.floor(lit + 1e-9);
  const part = lit - full;
  const rows = Math.ceil(cells / GRID_COLS);
  const gap = 2;
  const width = Math.max(size, 170);
  const cell = (width - gap * (GRID_COLS - 1)) / GRID_COLS;
  const height = rows * cell + (rows - 1) * gap;
  const accent = useLookSpec().accent;
  const reduced = useReduceMotion();
  const shown = full + (part > 0.001 ? 1 : 0);
  const step = Math.min(90, 520 / Math.max(1, shown));
  useChartMove(
    GROW_DELAY + Math.max(0, shown - 1) * step + SLICE_MS * EASE_OUT_SETTLE,
    !reduced && shown > 0,
  );
  const at = (i: number) => ({
    x: (i % GRID_COLS) * (cell + gap),
    y: Math.floor(i / GRID_COLS) * (cell + gap),
  });
  const each = Math.round(per * 100) / 100;
  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`${count(owned)} of ${count(total)} shares, ${percent(owned, total)} %`}
    >
      <Svg width={width} height={height}>
        {Array.from({ length: cells }, (_, i) => (
          <Rect
            key={i}
            {...at(i)}
            width={cell}
            height={cell}
            rx={2}
            fill={colors.surfaceAlt}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: shown }, (_, i) => (
          <OwnedSquare
            key={`o${i}`}
            {...at(i)}
            width={i < full ? cell : cell * part}
            height={cell}
            fill={accent}
            delay={GROW_DELAY + i * step}
          />
        ))}
      </Svg>
      <Text style={styles.caption}>
        {`${count(owned)} of ${count(total)} = ${percent(owned, total)} %`}
      </Text>
      {per > 1 ? <Text style={styles.note}>{`Each square is ${count(each)} shares.`}</Text> : null}
    </View>
  );
}

function OwnedSquare({
  x,
  y,
  width,
  height,
  fill,
  delay,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  delay: number;
}) {
  const reduced = useReduceMotion();
  const v = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) v.set(withDelay(delay, withTiming(1, { duration: SLICE_MS, easing: EASE_OUT })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const props = useAnimatedProps(() => ({ fillOpacity: v.get() }));
  return (
    <AnimatedRect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={2}
      fill={fill}
      fillOpacity={reduced ? 1 : 0}
      animatedProps={props}
    />
  );
}

/** Up to 20 parts: a circle of equal slices. */
function OwnershipCircle({ data, size }: { data: { total: number; owned: number }; size: number }) {
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
  useChartMove(
    GROW_DELAY + Math.max(0, owned - 1) * step + SLICE_MS * EASE_OUT_SETTLE,
    !reduced && owned > 0,
  );

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

const styles = themed(() => ({
  wrap: { alignItems: 'center', gap: space.sm },
  caption: { ...type.body, color: colors.textMuted },
  note: { ...type.small, color: colors.textMuted, marginTop: -space.xs },
}));
