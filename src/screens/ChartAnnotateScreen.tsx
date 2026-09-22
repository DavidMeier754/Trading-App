import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';

import Chart, {
  AXIS_W,
  chartHeightFor,
  chartLayout,
  chartWidthFor,
  domainOf,
  toCandles,
} from '../components/Chart';
import { useGridAnchor } from '../components/gridAlign';
import { price } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { tapFeedback } from '../lesson/feedback';
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
  const placed = value.kind === 'slider' ? value.value : null;

  const rows = screen.chart.data as any[];
  const hasVolume = Array.isArray(screen.chart.volume) && screen.chart.volume.length > 0;
  const height = chartHeightFor(hasVolume);
  const chartWidth = chartWidthFor(width, hasVolume);
  const grid = useGridAnchor(placed === null ? 'empty' : 'placed');

  // The overlay has to agree with the chart to the pixel, so it asks the chart
  // for its geometry instead of rebuilding it. The old copy had its own padding
  // and a domain that left out `levels` and `vwap`, so on any chart carrying a
  // marked level the placed line sat at a different price from the one the
  // reveal drew underneath it.
  const bars = toCandles(screen.chart);
  const base = domainOf(bars, screen.chart, bars.length);
  const lo = Math.min(base.lo, screen.answer);
  const hi = Math.max(base.hi, screen.answer);
  const layout = chartLayout({
    width: chartWidth,
    height,
    bars: bars.length,
    lo,
    hi,
    hasVolume,
    gridAnchor: grid.gridAnchor,
  });
  const toY = layout.y;
  // A tap can land in the padding or, on a chart with volume, in the strip
  // below the plot. Clamping keeps the placed line on the chart instead of
  // letting it run off the top or bottom of the price axis.
  const toPrice = (y: number) =>
    Math.round(Math.min(hi, Math.max(lo, layout.priceAt(y))) * 100) / 100;

  const nudge = (delta: number) => {
    tapFeedback();
    const from = placed ?? (lo + hi) / 2;
    onChange({ kind: 'slider', value: Math.round((from + delta) * 100) / 100 });
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <Pressable
        ref={grid.ref}
        onLayout={grid.onLayout}
        accessibilityRole="button"
        disabled={revealed}
        onPress={(e) => {
          tapFeedback();
          // `pageY` against the chart's own measured top, never `locationY`:
          // on the web that is relative to whichever SVG child took the event —
          // a candle, a gridline — so a tap on a candle landed tens of points
          // above where the finger was.
          const native = e.nativeEvent as any;
          const y =
            grid.windowY !== undefined && Number.isFinite(native.pageY)
              ? native.pageY - grid.windowY
              : (native.locationY ?? layout.padTop + layout.priceH / 2);
          onChange({ kind: 'slider', value: toPrice(y) });
        }}
        style={{ width: chartWidth, height, alignSelf: 'center' }}
      >
        <Chart
          spec={{ ...screen.chart, decision_index: -1 }}
          visibleCount={rows.length}
          width={chartWidth}
          height={height}
          showDecisionMarker={false}
          gridAnchor={grid.gridAnchor}
        />
        <View style={styles.overlay} pointerEvents="none">
          <Svg width={chartWidth} height={height}>
            {revealed ? (
              <>
                <Line
                  x1={0}
                  x2={chartWidth - AXIS_W}
                  y1={toY(screen.answer)}
                  y2={toY(screen.answer)}
                  stroke={colors.success}
                  strokeWidth={2}
                />
                <Line
                  x1={0}
                  x2={chartWidth - AXIS_W}
                  y1={toY(screen.answer + screen.tolerance)}
                  y2={toY(screen.answer + screen.tolerance)}
                  stroke={colors.success}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
                <Line
                  x1={0}
                  x2={chartWidth - AXIS_W}
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
                  x2={chartWidth - AXIS_W}
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
          <Pressable accessibilityRole="button" onPress={() => nudge(-0.01)} style={styles.nudge}>
            <Text style={styles.nudgeText}>{'− 1¢'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => nudge(0.01)} style={styles.nudge}>
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
