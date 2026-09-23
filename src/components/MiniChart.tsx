import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { G, Line, Path } from 'react-native-svg';

import { surfaceStyle, useLookSpec } from '../lesson/look';
import { DURATION } from '../lesson/motion';
import { colors } from '../theme';
import type { MiniChart as Spec } from '../types';
import { BuildCandle, buildStagger, useEntrance } from './ChartBuild';

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
}: {
  spec: Spec;
  width: number;
  height?: number;
}) {
  const look = useLookSpec();
  const isCandles = spec.kind === 'candles';
  const rows = spec.data as any[];
  const n = rows.length;

  const highs = isCandles ? rows.map((r) => r[1]) : (rows as number[]);
  const lows = isCandles ? rows.map((r) => r[2]) : (rows as number[]);
  const levels = spec.levels ?? [];

  let lo = Math.min(...lows, ...levels.map((l) => l.price));
  let hi = Math.max(...highs, ...levels.map((l) => l.price));
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
  const overlay = useEntrance(true, ENTRY_DELAY + n * stagger * 0.7, 480);

  const line = useMemo(() => {
    if (isCandles) return { d: '', length: 0 };
    let d = '';
    let length = 0;
    (rows as number[]).forEach((v, i) => {
      d += `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(2)},${y(v).toFixed(2)} `;
      if (i > 0) length += Math.hypot(cx(i) - cx(i - 1), y(v) - y(rows[i - 1]));
    });
    return { d, length };
    // cx and y are derived from the same inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, width, height, isCandles, lo, hi]);

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: line.length * (1 - draw.get()),
  }));
  const levelProps = useAnimatedProps(() => ({ opacity: overlay.get() }));

  return (
    <View style={[styles.wrap, surfaceStyle(look), { width, height }]}>
      <Svg width={width} height={height}>
        <AnimatedG animatedProps={levelProps}>
          {levels.map((lvl, i) => (
            <Line
              key={i}
              x1={pad}
              x2={pad + plotW}
              y1={y(lvl.price)}
              y2={y(lvl.price)}
              stroke={colors.warning}
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          ))}
        </AnimatedG>
        {isCandles ? (
          <G>
            {rows.map((r, i) => {
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
