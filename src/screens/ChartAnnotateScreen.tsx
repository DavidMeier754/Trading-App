import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { measure, useAnimatedRef, useSharedValue } from 'react-native-reanimated';
import Svg, { Line, Text as SvgText } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import Chart, {
  AXIS_W,
  chartHeightFor,
  chartLayout,
  chartWidthFor,
  DEFAULT_GAPS,
  domainOf,
  toCandles,
} from '../components/Chart';
import { useGridAnchor } from '../components/gridAlign';
import { price } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { detentFeedback, tapFeedback } from '../lesson/feedback';
import { REVEAL_GROWTH, useChartGaps } from '../lesson/fit';
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
  // The chart takes the room the screen has (lesson/fit.tsx); it stops
  // choosing once a line is on it, so it never resizes under a placed line.
  const fit = useChartGaps({
    preferred: DEFAULT_GAPS,
    growth: REVEAL_GROWTH,
    locked: placed !== null || revealed,
  });
  const height = chartHeightFor(hasVolume, fit.gaps);
  const chartWidth = chartWidthFor(width, hasVolume, fit.gaps);
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

  // Tap to drop the line, or drag it (docs/UI.md §4.2: "drag a horizontal line
  // onto a chart"). It snaps to cents, and every fifth cent clicks under the
  // finger, so a drag across the chart is felt as well as seen. The price is
  // worked out on the UI thread from the chart's own geometry and handed to
  // React only when the cent changes.
  const hit = useAnimatedRef<Animated.View>();
  const lastCent = useSharedValue(Number.NaN);
  // The touch that drops the line is a tap; the notches a drag passes after
  // it are only detents.
  const onDrag = useCallback(
    (price: number, first: boolean, detent: boolean) => {
      if (first) tapFeedback();
      else if (detent) detentFeedback();
      onChange({ kind: 'slider', value: price });
    },
    [onChange],
  );
  const { padTop, priceH } = layout;
  const place = (absoluteY: number, first: boolean) => {
    'worklet';
    const box = measure(hit);
    if (!box || box.height <= 0) return;
    // Touch and box are both where the chart is drawn; the ratio turns the
    // distance into the chart's own units even on a screen scaled to fit.
    const y = ((absoluteY - box.pageY) * height) / box.height;
    // A touch in the padding or the volume strip clamps to the price axis
    // rather than letting the line run off the chart.
    const price = Math.min(hi, Math.max(lo, lo + ((padTop + priceH - y) / priceH) * (hi - lo)));
    const cent = Math.round(price * 100);
    const prev = lastCent.get();
    if (cent === prev) return;
    lastCent.set(cent);
    const detent = Math.floor(cent / 5) !== Math.floor(prev / 5);
    scheduleOnRN(onDrag, cent / 100, first, detent);
  };
  const pan = Gesture.Pan()
    .minDistance(0)
    .enabled(!revealed)
    .onBegin((e) => {
      lastCent.set(Number.NaN);
      place(e.absoluteY, true);
    })
    .onUpdate((e) => place(e.absoluteY, false));

  // The chart does not change while the line moves; keeping its props stable
  // lets it skip those renders entirely.
  const chartSpec = useMemo(() => ({ ...screen.chart, decision_index: -1 }), [screen.chart]);

  const nudge = (delta: number) => {
    tapFeedback();
    const from = placed ?? (lo + hi) / 2;
    onChange({ kind: 'slider', value: Math.round((from + delta) * 100) / 100 });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.column} onLayout={fit.onLayout}>
        <Prompt>{screen.prompt}</Prompt>

        <View
          ref={grid.ref}
          onLayout={grid.onLayout}
          style={{ width: chartWidth, height, alignSelf: 'center' }}
        >
          <GestureDetector gesture={pan}>
            <Animated.View
              ref={hit}
              collapsable={false}
              accessibilityRole="adjustable"
              accessibilityLabel="Chart. Tap or drag to place the line; the buttons below move it a cent."
              style={{ width: chartWidth, height }}
            >
              <Chart
                spec={chartSpec}
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
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Kept in the layout once the line is placed, only emptied, so the
          buttons under it do not jump up at the first tap. */}
        <Text style={styles.hint}>
          {placed === null && !revealed ? 'Tap or drag on the chart to place your line.' : ' '}
        </Text>

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
          // In the buttons' place and at their height, so the screen does not get
          // shorter under the reveal -- a shorter screen is re-fitted, and moves.
          <View style={styles.answerRow}>
            <Text style={styles.hint}>
              {`${screen.label ?? 'Intended'}: ${price(screen.answer)} (±${screen.tolerance.toFixed(2)})`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  column: { gap: space.md },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hint: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  nudgeRow: { flexDirection: 'row', gap: space.md },
  answerRow: { minHeight: TAP_TARGET, justifyContent: 'center' },
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
