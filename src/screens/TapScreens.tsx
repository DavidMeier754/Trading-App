import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Chart, {
  chartHeightFor,
  chartLayout,
  chartWidthFor,
  DEFAULT_GAPS,
  domainOf,
  toCandles,
} from '../components/Chart';
import { useGridAnchor } from '../components/gridAlign';
import OrderBook from '../components/data/OrderBook';
import ScannerTable from '../components/data/ScannerTable';
import Visual from '../components/Visual';
import type { AnswerValue } from '../lesson/answers';
import { detentFeedback, tapFeedback } from '../lesson/feedback';
import { REVEAL_GROWTH, useChartGaps } from '../lesson/fit';
import { useLookSpec } from '../lesson/look';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type {
  ChartSpec,
  ChartTapScreen as ChartTap,
  DepthLadderScreen as DepthLadder,
  HotspotScreen as Hotspot,
  ScannerPickScreen as ScannerPick,
  SliderScreen as SliderS,
} from '../types';
import { Prompt } from './common';

/** Green for the right target, red for a wrong pick: the same key everywhere. */
function resolveHighlight(
  revealed: boolean,
  picked: string | null,
  correct: string[]
): Record<string, string> | undefined {
  if (!revealed) return picked ? { [picked]: colors.accent } : undefined;
  const out: Record<string, string> = {};
  correct.forEach((id) => (out[id] = colors.success));
  if (picked && !correct.includes(picked)) out[picked] = colors.down;
  return out;
}

/** docs/UI.md §4.1 `hotspot` — tap the right region of a mock component. */
export function HotspotScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: Hotspot;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const picked = value.kind === 'target' ? value.id : null;
  const targets = screen.targets ?? (screen.target ? [screen.target] : []);

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <Visual
        component={screen.component}
        data={screen.data}
        width={width}
        onTapTarget={
          revealed
            ? undefined
            : (id) => {
                tapFeedback();
                onChange({ kind: 'target', id: picked === id ? null : id });
              }
        }
        highlight={resolveHighlight(revealed, picked, targets)}
      />
    </View>
  );
}

/** docs/UI.md §4.2 `scanner-pick` — tap the row that meets the criteria. */
export function ScannerPickScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: ScannerPick;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const picked = value.kind === 'target' ? value.id : null;
  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <ScannerTable
        rows={screen.rows}
        selected={picked}
        onTapRow={
          revealed
            ? undefined
            : (ticker) => {
                tapFeedback();
                onChange({ kind: 'target', id: picked === ticker ? null : ticker });
              }
        }
        resolved={resolveHighlight(revealed, picked, [screen.target])}
      />
    </View>
  );
}

/** docs/UI.md §4.2 `depth-ladder` — answer where an order fills. */
export function DepthLadderScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: DepthLadder;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const picked = value.kind === 'target' ? value.id : null;
  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <OrderBook
        bids={screen.bids}
        asks={screen.asks}
        selected={picked}
        onTapRow={
          revealed
            ? undefined
            : (id) => {
                tapFeedback();
                onChange({ kind: 'target', id: picked === id ? null : id });
              }
        }
        resolved={resolveHighlight(revealed, picked, [screen.target])}
      />
    </View>
  );
}

/** docs/UI.md §4.1 `chart-tap` — tap a candle on a chart. */
export function ChartTapScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: ChartTap;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const picked = value.kind === 'index' ? value.index : null;
  const bars = screen.chart.data.length;
  const spec: ChartSpec = {
    kind: screen.chart.kind,
    data: screen.chart.data as any,
    decision_index: -1,
  };
  const fit = useChartGaps({
    preferred: DEFAULT_GAPS,
    growth: REVEAL_GROWTH,
    locked: picked !== null || revealed,
  });
  const height = chartHeightFor(false, fit.gaps);
  const chartWidth = chartWidthFor(width, false, fit.gaps);
  const grid = useGridAnchor(picked);

  // The columns are placed from the chart's own geometry. They used to be a
  // flex row inset by the literals 6 and 44 -- the chart's padding and axis
  // width copied by hand -- which put every target half a bar off centre.
  const candles = toCandles(spec);
  const domain = domainOf(candles, spec, candles.length);
  const layout = chartLayout({
    width: chartWidth,
    height,
    bars,
    lo: domain.lo,
    hi: domain.hi,
    hasVolume: false,
    gridAnchor: grid.gridAnchor,
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.column} onLayout={fit.onLayout}>
      <Prompt>{screen.prompt}</Prompt>
      <View
        ref={grid.ref}
        onLayout={grid.onLayout}
        style={{ width: chartWidth, height, alignSelf: 'center' }}
      >
        <Chart
          spec={spec}
          visibleCount={bars}
          width={chartWidth}
          height={height}
          showDecisionMarker={false}
          gridAnchor={grid.gridAnchor}
        />
        {/* An invisible column per bar: a candle is far too small a tap target
            on its own (docs/UI.md §10, 48 pt minimum). */}
        <View style={styles.tapRow} pointerEvents="box-none">
          {Array.from({ length: bars }, (_, i) => {
            const tint =
              revealed && i === screen.target
                ? colors.successTint
                : revealed && i === picked
                  ? colors.downTint
                  : picked === i
                    ? colors.accentTint
                    : 'transparent';
            const border =
              revealed && i === screen.target
                ? colors.success
                : revealed && i === picked
                  ? colors.down
                  : picked === i
                    ? colors.accent
                    : 'transparent';
            return (
              <Pressable
                accessibilityRole="button"
                key={i}
                disabled={revealed}
                onPress={() => {
                  tapFeedback();
                  onChange({ kind: 'index', index: picked === i ? null : i });
                }}
                style={[
                  styles.tapCol,
                  {
                    left: layout.cx(i) - layout.slot / 2 + 1,
                    width: Math.max(1, layout.slot - 2),
                    top: layout.padTop,
                    height: layout.priceH,
                    backgroundColor: tint,
                    borderColor: border,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
      </View>
    </View>
  );
}

/** docs/UI.md §4.1 `slider` — set a value with a tolerance band. */
export function SliderScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: SliderS;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const step = screen.step ?? 1;
  const current = value.kind === 'slider' ? value.value : null;
  const shown = current ?? (screen.min + screen.max) / 2;
  const pct = (v: number) => ((v - screen.min) / (screen.max - screen.min)) * 100;
  const accent = useLookSpec().accent;

  const nudge = (delta: number) => {
    const next = Math.min(
      screen.max,
      Math.max(screen.min, (current ?? (screen.min + screen.max) / 2) + delta)
    );
    tapFeedback();
    onChange({ kind: 'slider', value: Number(next.toFixed(4)) });
  };

  // Drag anywhere on the track. The value moves in the screen's steps, and
  // each step it lands on clicks -- a tick you hear and feel, like a detent --
  // so the hand counts the 5s the eye is reading. The reaction to a step is on
  // the React side, but only when the step changes, never per frame.
  const hit = useAnimatedRef<View>();
  const landed = useSharedValue(Number.NaN);
  const knob = useSharedValue(pct(shown));
  useEffect(() => {
    knob.set(withSpring(pct(shown), { duration: 220, dampingRatio: 0.9 }));
    // pct depends only on the screen's range
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, knob]);

  const onStep = useCallback(
    (v: number) => {
      detentFeedback();
      onChange({ kind: 'slider', value: v });
    },
    [onChange]
  );
  const { min, max } = screen;
  const pan = Gesture.Pan()
    .minDistance(0)
    .enabled(!revealed)
    .onBegin((e) => {
      landed.set(Number.NaN);
      const box = measure(hit);
      if (!box || box.width <= 0) return;
      const frac = Math.min(1, Math.max(0, (e.absoluteX - box.pageX) / box.width));
      const v = Math.round((min + frac * (max - min)) / step) * step;
      landed.set(v);
      scheduleOnRN(onStep, v);
    })
    .onUpdate((e) => {
      // Both the touch and the box are where the track is drawn, so a screen
      // scaled to fit (lesson/fit.tsx) needs no correction here.
      const box = measure(hit);
      if (!box || box.width <= 0) return;
      const frac = Math.min(1, Math.max(0, (e.absoluteX - box.pageX) / box.width));
      const v = Math.round((min + frac * (max - min)) / step) * step;
      if (v !== landed.get()) {
        landed.set(v);
        scheduleOnRN(onStep, v);
      }
    });

  const fillStyle = useAnimatedStyle(() => ({ width: `${knob.get()}%` }));
  const knobStyle = useAnimatedStyle(() => ({ left: `${knob.get()}%` }));

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <Text style={styles.sliderValue}>
        {`${shown}${screen.unit ? ` ${screen.unit}` : ''}`}
      </Text>

      <GestureDetector gesture={pan}>
        <Animated.View ref={hit} style={styles.trackHit} collapsable={false}>
          <View style={styles.track}>
            {revealed ? (
              <View
                style={[
                  styles.band,
                  {
                    left: `${pct(screen.answer - (screen.tolerance ?? 0))}%`,
                    width: `${(((screen.tolerance ?? 0) * 2) / (screen.max - screen.min)) * 100}%`,
                  },
                ]}
              />
            ) : null}
            <Animated.View style={[styles.fill, { backgroundColor: accent }, fillStyle]} />
            <Animated.View
              style={[
                styles.knob,
                { borderColor: accent },
                knobStyle,
                revealed && {
                  borderColor:
                    Math.abs(shown - screen.answer) <= (screen.tolerance ?? 0)
                      ? colors.success
                      : colors.down,
                },
              ]}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      {/* docs/UI.md §10: every drag has a tap alternative. */}
      <View style={styles.nudgeRow}>
        <Pressable accessibilityRole="button" disabled={revealed} onPress={() => nudge(-step)} style={styles.nudge}>
          <Text style={styles.nudgeText}>{'−'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={revealed} onPress={() => nudge(step)} style={styles.nudge}>
          <Text style={styles.nudgeText}>+</Text>
        </Pressable>
      </View>

      {revealed ? (
        <Text style={styles.sliderAnswer}>
          {`Intended: ${screen.answer}${screen.unit ? ` ${screen.unit}` : ''} (±${screen.tolerance ?? 0})`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.lg },
  column: { gap: space.lg },
  tapRow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  tapCol: { position: 'absolute', borderRadius: radius.sm, borderWidth: 1.5 },
  sliderValue: { ...type.display, color: colors.text, textAlign: 'center' },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
  },
  band: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    backgroundColor: colors.successTint,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 5 },
  // The finger's target: the whole row, not the 10-point track inside it.
  trackHit: { height: 48, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    width: 26,
    height: 26,
    marginLeft: -13,
    borderRadius: 13,
    backgroundColor: colors.text,
    borderWidth: 3,
    borderColor: colors.accent,
  },
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
  nudgeText: { ...type.title, color: colors.text },
  sliderAnswer: { ...type.small, color: colors.textMuted, textAlign: 'center' },
});
