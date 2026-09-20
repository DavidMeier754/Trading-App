import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';
import type { MiniChart as Spec } from '../types';

/**
 * docs/UI.md §6.4 "[v3] Mini variant" — no axes, no volume, 8-10 bars, one
 * optional level line. Readable at a glance at half height, for `swipe-deck`
 * and `compare`.
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
  const bodyW = Math.max(3, Math.min(slot * 0.6, 14));

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
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
        {isCandles ? (
          <G>
            {rows.map((r, i) => {
              const [o, h, l, c] = r as number[];
              const up = c >= o;
              const stroke = up ? colors.up : colors.down;
              const top = y(Math.max(o, c));
              const bottom = y(Math.min(o, c));
              return (
                <G key={i}>
                  <Line x1={cx(i)} x2={cx(i)} y1={y(h)} y2={y(l)} stroke={stroke} strokeWidth={1} />
                  <Rect
                    x={cx(i) - bodyW / 2}
                    y={top}
                    width={bodyW}
                    height={Math.max(1.5, bottom - top)}
                    fill={up ? stroke : colors.background}
                    stroke={stroke}
                    strokeWidth={1}
                  />
                </G>
              );
            })}
          </G>
        ) : (
          <Path
            d={(rows as number[])
              .map((v, i) => `${i === 0 ? 'M' : 'L'}${cx(i)},${y(v)}`)
              .join(' ')}
            stroke={colors.accent}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
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
