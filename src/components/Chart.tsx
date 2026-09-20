import React, { useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { axisPrice, volume as fmtVolume } from '../format';
import { colors, type } from '../theme';
import type { ChartSpec } from '../types';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

export type Candle = { o: number; h: number; l: number; c: number };

/** Both chart kinds reduce to a candle list; a line bar is a flat candle at its close. */
export function toCandles(spec: ChartSpec): Candle[] {
  if (spec.kind === 'candles') {
    return (spec.data as [number, number, number, number][]).map(([o, h, l, c]) => ({
      o,
      h,
      l,
      c,
    }));
  }
  const closes = spec.data as number[];
  return closes.map((close, i) => {
    const open = i === 0 ? close : closes[i - 1];
    return { o: open, h: Math.max(open, close), l: Math.min(open, close), c: close };
  });
}

export function closeAt(spec: ChartSpec, index: number): number {
  const bars = toCandles(spec);
  return bars[Math.max(0, Math.min(index, bars.length - 1))].c;
}

type Props = {
  spec: ChartSpec;
  /** How many bars are drawn. Playback raises this one bar at a time. */
  visibleCount: number;
  width: number;
  height: number;
  /** Draw the dashed marker at `decision_index`. Off for plain theory visuals. */
  showDecisionMarker?: boolean;
  /**
   * 0 -> 1 draw-on for a line chart (docs/UI.md §6.4). The whole path is drawn
   * and revealed with a dash mask, so the line grows continuously instead of
   * jumping from data point to data point.
   */
  draw?: Animated.Value;
};

const AXIS_W = 44;
const PAD_LEFT = 6;
const PAD_TOP = 10;
const PAD_BOTTOM = 18; // leaves room for the legend strip under the plot
const VOLUME_SHARE = 0.2; // of the plot height
const VOLUME_GAP = 16;

export default function Chart({
  spec,
  visibleCount,
  width,
  height,
  showDecisionMarker = true,
  draw,
}: Props) {
  const bars = useMemo(() => toCandles(spec), [spec]);
  const n = bars.length;
  const shown = Math.max(0, Math.min(visibleCount, n));
  const hasVolume = Array.isArray(spec.volume) && spec.volume.length > 0;

  const plotW = width - PAD_LEFT - AXIS_W;
  const volH = hasVolume ? (height - PAD_TOP - PAD_BOTTOM) * VOLUME_SHARE : 0;
  const priceH = height - PAD_TOP - PAD_BOTTOM - volH - (hasVolume ? VOLUME_GAP : 0);

  // The domain is built from the bars the learner can actually see, plus the
  // annotation levels (which are drawn from the start). Scaling to every bar up
  // front would reserve headroom exactly where the price is about to go and give
  // the decision away before it is made. The domain only ever grows, so the axis
  // never snaps back during playback.
  const domainRef = useRef<{ lo: number; hi: number } | null>(null);
  const { lo, hi } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const b of bars.slice(0, Math.max(1, shown))) {
      min = Math.min(min, b.l);
      max = Math.max(max, b.h);
    }
    for (const v of (spec.vwap ?? []).slice(0, Math.max(1, shown))) {
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
    for (const lvl of spec.levels ?? []) {
      min = Math.min(min, lvl.price);
      max = Math.max(max, lvl.price);
    }
    const span = max - min || Math.max(max * 0.01, 0.1);
    const next = { lo: min - span * 0.1, hi: max + span * 0.12 };
    const prev = domainRef.current;
    const merged = prev
      ? { lo: Math.min(prev.lo, next.lo), hi: Math.max(prev.hi, next.hi) }
      : next;
    domainRef.current = merged;
    return merged;
  }, [bars, shown, spec.vwap, spec.levels]);

  const y = (price: number) =>
    PAD_TOP + priceH - ((price - lo) / (hi - lo)) * priceH;

  const slot = plotW / n;
  const cx = (i: number) => PAD_LEFT + slot * (i + 0.5);
  const bodyW = Math.max(3, Math.min(slot * 0.62, 22));

  const maxVol = hasVolume ? Math.max(...(spec.volume as number[])) : 1;
  const volTop = PAD_TOP + priceH + VOLUME_GAP;
  const volY = (v: number) => volTop + volH - (v / maxVol) * volH;

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= 3; i++) out.push(lo + ((hi - lo) * i) / 3);
    return out;
  }, [lo, hi]);

  const linePath = useMemo(() => {
    if (spec.kind !== 'line' || shown === 0) return '';
    return bars
      .slice(0, shown)
      .map((b, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(2)},${y(b.c).toFixed(2)}`)
      .join(' ');
  }, [spec.kind, shown, bars, lo, hi, plotW, priceH]);

  const linePathLength = useMemo(() => {
    if (spec.kind !== 'line' || shown < 2) return 0;
    let total = 0;
    for (let i = 1; i < shown; i++) {
      const dx = cx(i) - cx(i - 1);
      const dy = y(bars[i].c) - y(bars[i - 1].c);
      total += Math.hypot(dx, dy);
    }
    return total;
  }, [spec.kind, shown, bars, lo, hi, plotW, priceH]);

  const lineFill = useMemo(() => {
    if (!linePath) return '';
    const last = cx(shown - 1);
    const first = cx(0);
    const base = PAD_TOP + priceH;
    return `${linePath} L${last.toFixed(2)},${base.toFixed(2)} L${first.toFixed(
      2
    )},${base.toFixed(2)} Z`;
  }, [linePath, shown, priceH]);

  const vwapPath = useMemo(() => {
    const vwap = spec.vwap;
    if (!vwap || shown === 0) return '';
    return vwap
      .slice(0, shown)
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(2)},${y(v).toFixed(2)}`)
      .join(' ');
  }, [spec.vwap, shown, lo, hi, plotW, priceH]);

  // A line chart decides *at* its last visible point, so the marker sits on it.
  // A candle has width, so the marker clears the body by a hair instead of
  // cutting through it -- but stays attached to the bar, not half a slot away.
  const decisionX =
    spec.kind === 'line'
      ? cx(spec.decision_index)
      : cx(spec.decision_index) + bodyW / 2 + 3;
  const lastVisible = shown > 0 ? bars[shown - 1] : null;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.28" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* price gridlines + right-hand axis (docs/UI.md §6.4) */}
        <G>
          {ticks.map((t, i) => (
            <G key={`t${i}`}>
              <Line
                x1={PAD_LEFT}
                x2={PAD_LEFT + plotW}
                y1={y(t)}
                y2={y(t)}
                stroke={colors.border}
                strokeWidth={1}
              />
              <SvgText
                x={width - AXIS_W + 6}
                y={y(t) + 4}
                fill={colors.textFaint}
                fontSize={11}
              >
                {axisPrice(t)}
              </SvgText>
            </G>
          ))}
        </G>

        {/* annotation levels */}
        {(spec.levels ?? []).map((lvl, i) => (
          <G key={`lvl${i}`}>
            <Line
              x1={PAD_LEFT}
              x2={PAD_LEFT + plotW}
              y1={y(lvl.price)}
              y2={y(lvl.price)}
              stroke={colors.warning}
              strokeWidth={1.25}
              strokeDasharray="5 4"
              opacity={0.85}
            />
            {lvl.label ? (
              <SvgText
                x={PAD_LEFT + 4}
                y={y(lvl.price) - 5}
                fill={colors.warning}
                fontSize={10}
                fontWeight="600"
              >
                {`${lvl.label} ${axisPrice(lvl.price)}`}
              </SvgText>
            ) : null}
          </G>
        ))}

        {/* VWAP overlay */}
        {vwapPath ? (
          <Path
            d={vwapPath}
            stroke={colors.accent}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
            opacity={0.9}
          />
        ) : null}

        {/* bars */}
        {spec.kind === 'line' ? (
          <G>
            {lineFill ? (
              draw ? (
                <AnimatedG opacity={draw}>
                  <Path d={lineFill} fill="url(#lineFill)" />
                </AnimatedG>
              ) : (
                <Path d={lineFill} fill="url(#lineFill)" />
              )
            ) : null}
            {linePath ? (
              draw && linePathLength > 0 ? (
                <AnimatedPath
                  d={linePath}
                  stroke={colors.accent}
                  strokeWidth={2.25}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={`${linePathLength} ${linePathLength}`}
                  strokeDashoffset={draw.interpolate({
                    inputRange: [0, 1],
                    outputRange: [linePathLength, 0],
                  })}
                />
              ) : (
                <Path
                  d={linePath}
                  stroke={colors.accent}
                  strokeWidth={2.25}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )
            ) : null}
            {lastVisible ? (
              draw ? (
                <AnimatedG
                  opacity={draw.interpolate({
                    inputRange: [0, 0.92, 1],
                    outputRange: [0, 0, 1],
                  })}
                >
                  <Circle
                    cx={cx(shown - 1)}
                    cy={y(lastVisible.c)}
                    r={4}
                    fill={colors.accent}
                    stroke={colors.background}
                    strokeWidth={2}
                  />
                </AnimatedG>
              ) : (
                <Circle
                  cx={cx(shown - 1)}
                  cy={y(lastVisible.c)}
                  r={4}
                  fill={colors.accent}
                  stroke={colors.background}
                  strokeWidth={2}
                />
              )
            ) : null}
          </G>
        ) : (
          <G>
            {bars.slice(0, shown).map((b, i) => {
              const upBar = b.c >= b.o;
              const stroke = upBar ? colors.up : colors.down;
              const top = y(Math.max(b.o, b.c));
              const bottom = y(Math.min(b.o, b.c));
              return (
                <G key={`c${i}`}>
                  <Line
                    x1={cx(i)}
                    x2={cx(i)}
                    y1={y(b.h)}
                    y2={y(b.l)}
                    stroke={stroke}
                    strokeWidth={1.25}
                  />
                  <Rect
                    x={cx(i) - bodyW / 2}
                    y={top}
                    width={bodyW}
                    height={Math.max(1.5, bottom - top)}
                    fill={upBar ? stroke : colors.background}
                    stroke={stroke}
                    strokeWidth={1.25}
                    rx={1}
                  />
                </G>
              );
            })}
          </G>
        )}

        {/* volume strip */}
        {hasVolume
          ? (spec.volume as number[]).slice(0, shown).map((v, i) => {
              const b = bars[i];
              const upBar = b.c >= b.o;
              return (
                <Rect
                  key={`v${i}`}
                  x={cx(i) - bodyW / 2}
                  y={volY(v)}
                  width={bodyW}
                  height={Math.max(1, volTop + volH - volY(v))}
                  fill={upBar ? colors.up : colors.down}
                  opacity={0.45}
                  rx={1}
                />
              );
            })
          : null}
        {hasVolume ? (
          <Line
            x1={PAD_LEFT}
            x2={PAD_LEFT + plotW}
            y1={volTop + volH}
            y2={volTop + volH}
            stroke={colors.border}
            strokeWidth={1}
          />
        ) : null}
        {hasVolume ? (
          <SvgText
            x={width - AXIS_W + 6}
            y={volTop + volH}
            fill={colors.textFaint}
            fontSize={9}
          >
            {`vol ${fmtVolume(maxVol)}`}
          </SvgText>
        ) : null}

        {/* decision marker */}
        {showDecisionMarker ? (
          <G>
            <Line
              x1={decisionX}
              x2={decisionX}
              y1={PAD_TOP}
              y2={PAD_TOP + priceH + (hasVolume ? VOLUME_GAP + volH : 0)}
              stroke={colors.textMuted}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            <Circle
              cx={decisionX}
              cy={PAD_TOP + 1}
              r={3}
              fill={colors.textMuted}
            />
          </G>
        ) : null}
      </Svg>

      {showDecisionMarker ? (
        <View style={[styles.decisionTag, { left: Math.max(0, decisionX - 26) }]}>
          <Text style={styles.decisionTagText}>
            {shown > spec.decision_index + 1 ? 'decision' : 'you are here'}
          </Text>
        </View>
      ) : null}

      {spec.vwap ? (
        <View style={styles.legend}>
          <View style={styles.legendSwatch} />
          <Text style={styles.legendText}>VWAP</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decisionTag: {
    pointerEvents: 'none',
    position: 'absolute',
    top: -2,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  decisionTagText: {
    ...type.small,
    fontSize: 10,
    color: colors.textMuted,
  },
  // The VWAP overlay is labelled beside the chart, not on it: at 8-12 bars there
  // is no position inside the plot that clears the candles at every scenario.
  legend: {
    pointerEvents: 'none',
    position: 'absolute',
    bottom: 0,
    left: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 14,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  legendText: { ...type.small, fontSize: 10, color: colors.accent },
});
