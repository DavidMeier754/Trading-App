import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';

import Chart from '../components/Chart';
import { price } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { selectHaptic } from '../lesson/haptics';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type { ChartAnnotateScreen as S } from '../types';
import { Prompt } from './common';

/**
 * docs/UI.md §4.2 `chart-annotate` — place a horizontal line on the chart to
 * mark a level. Snaps to cents; the reveal shows the intended line and its
 * tolerance band.
 *
 * §10 requires the tap-to-place-then-nudge path, which is what this is: tap the
 * chart to drop the line, then nudge it a cent at a time. Dragging is a later
 * addition on top, not a replacement.
 */
export default function ChartAnnotateScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: S;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const height = 240;
  const placed = value.kind === 'slider' ? value.value : null;

  const rows = screen.chart.data as any[];
  const isCandles = screen.chart.kind === 'candles';
  const highs = isCandles ? rows.map((r) => r[1]) : (rows as number[]);
  const lows = isCandles ? rows.map((r) => r[2]) : (rows as number[]);
  let lo = Math.min(...lows, screen.answer);
  let hi = Math.max(...highs, screen.answer);
  const span = hi - lo || 1;
  lo -= span * 0.1;
  hi += span * 0.12;

  // Mirrors Chart's own geometry so the line lands where the learner tapped.
  const PAD_TOP = 10;
  const PAD_BOTTOM = 18;
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  const toY = (p: number) => PAD_TOP + plotH - ((p - lo) / (hi - lo)) * plotH;
  const toPrice = (y: number) =>
    Math.round((lo + ((PAD_TOP + plotH - y) / plotH) * (hi - lo)) * 100) / 100;

  const nudge = (delta: number) => {
    selectHaptic();
    const base = placed ?? (lo + hi) / 2;
    onChange({ kind: 'slider', value: Math.round((base + delta) * 100) / 100 });
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <Pressable
        disabled={revealed}
        onPress={(e) => {
          selectHaptic();
          const y = (e.nativeEvent as any).locationY ?? plotH / 2;
          onChange({ kind: 'slider', value: toPrice(y) });
        }}
        style={{ width, height }}
      >
        <Chart
          spec={{ ...screen.chart, decision_index: -1 }}
          visibleCount={rows.length}
          width={width}
          height={height}
          showDecisionMarker={false}
        />
        <View style={styles.overlay} pointerEvents="none">
          <Svg width={width} height={height}>
            {revealed ? (
              <>
                <Line
                  x1={0}
                  x2={width - 44}
                  y1={toY(screen.answer)}
                  y2={toY(screen.answer)}
                  stroke={colors.success}
                  strokeWidth={2}
                />
                <Line
                  x1={0}
                  x2={width - 44}
                  y1={toY(screen.answer + screen.tolerance)}
                  y2={toY(screen.answer + screen.tolerance)}
                  stroke={colors.success}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
                <Line
                  x1={0}
                  x2={width - 44}
                  y1={toY(screen.answer - screen.tolerance)}
                  y2={toY(screen.answer - screen.tolerance)}
                  stroke={colors.success}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
              </>
            ) : null}
            {placed !== null ? (
              <>
                <Line
                  x1={0}
                  x2={width - 44}
                  y1={toY(placed)}
                  y2={toY(placed)}
                  stroke={
                    !revealed
                      ? colors.accent
                      : Math.abs(placed - screen.answer) <= screen.tolerance
                        ? colors.success
                        : colors.down
                  }
                  strokeWidth={2.5}
                />
                <SvgText
                  x={4}
                  y={toY(placed) - 6}
                  fill={colors.accent}
                  fontSize={11}
                  fontWeight="700"
                >
                  {price(placed)}
                </SvgText>
              </>
            ) : null}
          </Svg>
        </View>
      </Pressable>

      {placed === null && !revealed ? (
        <Text style={styles.hint}>Tap the chart to place your line.</Text>
      ) : null}

      {!revealed ? (
        <View style={styles.nudgeRow}>
          <Pressable onPress={() => nudge(-0.01)} style={styles.nudge}>
            <Text style={styles.nudgeText}>{'− 1¢'}</Text>
          </Pressable>
          <Pressable onPress={() => nudge(0.01)} style={styles.nudge}>
            <Text style={styles.nudgeText}>{'+ 1¢'}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.hint}>
          {`Intended: ${price(screen.answer)} (±${screen.tolerance.toFixed(2)})`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.md },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hint: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  nudgeRow: { flexDirection: 'row', gap: space.md },
  nudge: {
    flex: 1,
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeText: { ...type.answer, color: colors.text },
});
