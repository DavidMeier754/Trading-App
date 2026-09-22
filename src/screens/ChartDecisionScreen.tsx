import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Chart, { chartHeightFor, closeAt } from '../components/Chart';
import { useGridAnchor } from '../components/gridAlign';
import StateChips from '../components/StateChips';
import { copy, count, signedPercent, signedPrice } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { EASE_OUT } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, radius, space, type } from '../theme';
import type { ChartDecisionScreen as S, DecisionButton } from '../types';

/** Which way a choice faces, for the P/L side of the outcome strip. */
const DIRECTION: Record<DecisionButton, 1 | -1 | 0> = {
  long: 1,
  buy: 1,
  short: -1,
  'no-trade': 0,
  wait: 0,
};

const PLAYBACK_MS = 120; // docs/UI.md §4.3

export type DecisionPhase = 'deciding' | 'playing' | 'done';

export default function ChartDecisionScreen({
  screen,
  value,
  width,
  onPhaseChange,
}: {
  screen: S;
  value: AnswerValue;
  width: number;
  onPhaseChange: (phase: DecisionPhase) => void;
}) {
  const reduced = useReduceMotion();
  const bars = Array.isArray(screen.chart.data) ? screen.chart.data.length : 0;
  const start = screen.chart.decision_index + 1;

  const choice = value.kind === 'decision' ? value.choice : null;
  const [done, setDone] = useState(false);

  // docs/UI.md §4.3: after the choice the chart continues. It used to do that by
  // raising a React state one bar at a time on a 120ms interval -- and since the
  // price axis is derived from the bars in view, every one of those steps
  // re-scaled and re-rendered the whole chart. Now a single shared value runs
  // 0 -> 1 on the UI thread and the chart derives the line, its fill, the leading
  // dot and the axis from it, so the replay is continuous and costs no renders.
  const progress = useSharedValue(0);
  const playing = choice !== null && !done;
  const phase: DecisionPhase =
    choice === null ? 'deciding' : done ? 'done' : 'playing';

  useEffect(() => {
    onPhaseChange(phase);
  }, [phase, onPhaseChange]);

  const finish = useCallback(() => setDone(true), []);

  useEffect(() => {
    if (choice === null) return;
    // §10: reduce motion keeps the outcome, drops the travel.
    if (reduced) {
      progress.set(1);
      setDone(true);
      return;
    }
    progress.set(0);
    progress.set(
      withTiming(
        1,
        { duration: PLAYBACK_MS * Math.max(1, bars - start), easing: Easing.linear },
        (finished) => {
          'worklet';
          if (finished) scheduleOnRN(finish);
        }
      )
    );
  }, [choice, reduced, bars, start, progress, finish]);

  // Tap to skip: the rest of the replay in one short sweep, not a jump cut.
  const onChartPress = () => {
    if (choice === null || done) return;
    progress.set(
      withTiming(1, { duration: 220, easing: EASE_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(finish);
      })
    );
  };

  // The chart's price gridlines snap onto the backdrop grid, which needs to know
  // how far down the grid the chart sits. `phase` is passed because the outcome
  // card re-centres the column: the chart moves without resizing, and on web
  // `onLayout` is a resize observer that never fires for a move.
  const grid = useGridAnchor(phase);

  const decisionPrice = closeAt(screen.chart, screen.chart.decision_index);
  const finalPrice = closeAt(screen.chart, bars - 1);
  const move = finalPrice - decisionPrice;
  const movePct = (move / decisionPrice) * 100;
  const direction = choice ? DIRECTION[choice] : 0;
  const pnl = direction * move * screen.shares;

  // Sized from the chart's own geometry, so the grid-aligned plot, the volume
  // strip and the slack the snap shifts into all fit exactly.
  const chartHeight = chartHeightFor(!!screen.chart.volume);

  return (
    <View style={styles.wrap}>
      <Text style={styles.scenario}>{copy(screen.scenario)}</Text>

      {screen.state?.length ? <StateChips state={screen.state} /> : null}

      <View ref={grid.ref} onLayout={grid.onLayout}>
        <Pressable accessibilityRole="button" onPress={onChartPress} disabled={choice === null}>
          <Chart
            spec={screen.chart}
            visibleCount={done ? bars : start}
            playback={playing ? progress : undefined}
            gridAnchor={grid.gridAnchor}
            width={width}
            height={chartHeight}
          />
        </Pressable>
      </View>

      <Text style={[styles.playHint, !playing && styles.playHintHidden]}>
        Tap the chart to skip
      </Text>

      {phase === 'done' ? (
        // One line of numbers, one line of prose. The card used to repeat the
        // decision and final prices, which the chart already shows, and to
        // restate the choice the learner had just made.
        <View style={styles.outcome}>
          <View style={styles.outcomeRow}>
            <Text
              style={[
                styles.outcomeMove,
                { color: move >= 0 ? colors.up : colors.down },
              ]}
            >
              {`${move >= 0 ? '▲' : '▼'} ${signedPrice(move)} ${signedPercent(movePct)}`}
            </Text>
            <Text
              style={[
                styles.outcomePnl,
                {
                  color:
                    direction === 0
                      ? colors.textMuted
                      : pnl >= 0
                        ? colors.up
                        : colors.down,
                },
              ]}
            >
              {direction === 0
                ? 'you stood aside'
                : `${signedPrice(pnl)} · ${count(screen.shares)}`}
            </Text>
          </View>
          <Text style={styles.outcomeText}>{copy(screen.outcome)}</Text>
          {/* docs/UI.md §11.6 wants the risk note on every scenario result; this
              is the smallest form that still says it. */}
          <Text style={styles.outcomeFoot}>Not a prediction.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.md },
  scenario: { ...type.body, color: colors.text },
  playHint: { ...type.small, color: colors.textFaint, textAlign: 'center' },
  // Kept in the layout at all times: appearing mid-replay would shift the chart
  // under the line that is still drawing.
  playHintHidden: { opacity: 0 },
  outcome: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  outcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: space.sm,
  },
  outcomeMove: { ...type.answer },
  outcomePnl: { ...type.answer },
  outcomeText: { ...type.body, color: colors.text },
  outcomeFoot: { ...type.small, fontSize: 11, color: colors.textFaint },
});
