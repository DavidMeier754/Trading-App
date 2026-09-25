import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { useChartMove } from '../lesson/haptics';
import { surfaceStyle, useLookSpec } from '../lesson/look';
import { DURATION, EASE_OUT_SETTLE } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { price } from '../format';
import { colors } from '../theme';
import type { MiniChart as Spec } from '../types';
import { BUILD_MS, BuildCandle, buildStagger, useEntrance } from './ChartBuild';
import { floorSpan } from './chartScale';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

/** The card is still arriving when the bars start. */
const ENTRY_DELAY = 140;

/**
 * docs/UI.md §6.4 "[v3] Mini variant" — no axes, no volume, 8-10 bars, one
 * optional level line. Readable at a glance at half height, for `swipe-deck`
 * and `compare`.
 *
 * It builds in like the full chart (components/ChartBuild.tsx): candles grow
 * left to right, a line draws itself on, and the level is ruled in after. A
 * deck card mounts as it comes up, so every card arrives this way.
 */
export default function MiniChart({
  spec,
  width,
  height = 130,
  visible,
  showPrice = false,
}: {
  spec: Spec;
  width: number;
  height?: number;
  /**
   * Label the last drawn point with its price: a `branch` asks about "$29.70"
   * and "a stop at $29.60", and a chart with no numbers on it could not be
   * checked against either.
   */
  showPrice?: boolean;
  /**
   * Draw only the first this-many bars, on the scale of all of them: a chart
   * that moves on as a story does (`branch`) keeps its frame still while the
   * price walks into it.
   */
  visible?: number;
}) {
  const look = useLookSpec();
  const isCandles = spec.kind === 'candles';
  const rows = spec.data as any[];
  const n = rows.length;
  const shown = visible === undefined ? n : Math.max(1, Math.min(n, visible));

  const highs = isCandles ? rows.map((r) => r[1]) : (rows as number[]);
  const lows = isCandles ? rows.map((r) => r[2]) : (rows as number[]);
  const levels = spec.levels ?? [];

  const range = spec.range ?? [];
  let { lo, hi } = floorSpan(
    spec.kind,
    Math.min(...lows, ...levels.map((l) => l.price), ...range),
    Math.max(...highs, ...levels.map((l) => l.price), ...range)
  );
  const span = hi - lo || 1;
  lo -= span * 0.12;
  hi += span * 0.12;

  const pad = 6;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;
  const y = (p: number) => pad + plotH - ((p - lo) / (hi - lo)) * plotH;
  const slot = plotW / n;
  const cx = (i: number) => pad + slot * (i + 0.5);
  // Bodies most of their slot wide: at two-thirds, capped at 16, a full-width
  // deck card read as a few candles lost in a lot of gap.
  const bodyW = Math.max(3, Math.min(slot * 0.74, 26));

  const stagger = buildStagger(n);
  const draw = useEntrance(!isCandles, ENTRY_DELAY, DURATION.draw);
  // Like every chart, it vibrates while it builds and lands when it settles
  // (lesson/haptics.ts, startChartMove). Two side by side on a `compare`
  // screen are one move to the hand.
  const reduced = useReduceMotion();
  useChartMove(
    ENTRY_DELAY +
      (isCandles ? (n - 1) * stagger + BUILD_MS * EASE_OUT_SETTLE : DURATION.draw * EASE_OUT_SETTLE),
    !reduced && n > 0
  );
  const overlay = useEntrance(true, ENTRY_DELAY + n * stagger * 0.7, 480);

  const line = useMemo(() => {
    if (isCandles) return { d: '', length: 0 };
    let d = '';
    let length = 0;
    (rows as number[]).slice(0, shown).forEach((v, i) => {
      d += `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(2)},${y(v).toFixed(2)} `;
      if (i > 0) length += Math.hypot(cx(i) - cx(i - 1), y(v) - y(rows[i - 1]));
    });
    return { d, length };
    // cx and y are derived from the same inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, width, height, isCandles, lo, hi, shown]);

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: line.length * (1 - draw.get()),
  }));
  const levelProps = useAnimatedProps(() => ({ opacity: overlay.get() }));

  return (
    <View style={[styles.wrap, surfaceStyle(look), { width, height }]}>
      <Svg width={width} height={height}>
        <AnimatedG animatedProps={levelProps}>
          {levels.map((lvl, i) => (
            <G key={i}>
              <Line
                x1={pad}
                x2={pad + plotW}
                y1={y(lvl.price)}
                y2={y(lvl.price)}
                stroke={colors.warning}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              {lvl.label ? (
                <SvgText
                  x={pad + 2}
                  y={y(lvl.price) - 4}
                  fontSize={10}
                  fontWeight="600"
                  fill={colors.warning}
                >
                  {`${lvl.label} ${price(lvl.price)}`}
                </SvgText>
              ) : null}
            </G>
          ))}
        </AnimatedG>
        {isCandles ? (
          <G>
            {rows.slice(0, shown).map((r, i) => {
              const [o, h, l, c] = r as number[];
              return (
                <BuildCandle
                  key={i}
                  x={cx(i)}
                  bodyW={bodyW}
                  yOpen={y(o)}
                  yClose={y(c)}
                  yHigh={y(h)}
                  yLow={y(l)}
                  up={c >= o}
                  play
                  delay={ENTRY_DELAY + i * stagger}
                  strokeWidth={1}
                  rx={0}
                />
              );
            })}
          </G>
        ) : (
          <AnimatedPath
            d={line.d}
            stroke={look.chartLine}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={`${line.length} ${line.length}`}
            animatedProps={lineProps}
          />
        )}
        {showPrice && !isCandles && shown > 0 ? (
          <AnimatedG animatedProps={levelProps}>
            <Circle cx={cx(shown - 1)} cy={y(rows[shown - 1] as number)} r={3} fill={look.chartLine} />
            <SvgText
              x={Math.min(cx(shown - 1) + 6, width - 4)}
              y={y(rows[shown - 1] as number) - 7}
              fontSize={11}
              fontWeight="700"
              fill={colors.text}
              textAnchor={cx(shown - 1) > width - 60 ? 'end' : 'start'}
            >
              {price(rows[shown - 1] as number)}
            </SvgText>
          </AnimatedG>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
