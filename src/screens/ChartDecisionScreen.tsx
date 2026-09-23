import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Chart, { chartHeightFor, chartWidthFor, closeAt } from '../components/Chart';
import { useGridAnchor } from '../components/gridAlign';
import StateChips from '../components/StateChips';
import { copy, count, signedPercent, signedPrice } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { Arrive } from '../lesson/Celebrate';
import { NOTE_STEPS, noteFeedback } from '../lesson/feedback';
import { startRumble, stopRumble } from '../lesson/haptics';
import { EASE_OUT, revealTiming } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, glass, radius, space, type } from '../theme';
import { useLook } from '../lesson/look';
import type { ChartDecisionScreen as S, DecisionButton } from '../types';

/** Which way a choice faces, for the P/L side of the outcome strip. */
const DIRECTION: Record<DecisionButton, 1 | -1 | 0> = {
  long: 1,
  buy: 1,
  short: -1,
  'no-trade': 0,
  wait: 0,
};

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
  const neo = useLook() === 'neo';
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

  const finish = useCallback(() => {
    stopRumble();
    setDone(true);
  }, []);

  // The slow reveal: every bar after the decision lands on a tick you can feel
  // and hear, pitched by where it closes -- a climb sounds like one. The last
  // bar gets no tick of its own, because the verdict lands with it.
  const legs = Math.max(1, bars - start);
  // The decision bar and every bar after it.
  const { closes, span } = useMemo(() => {
    const c: number[] = [];
    for (let i = start - 1; i < bars; i++) c.push(closeAt(screen.chart, i));
    const lo = Math.min(...c);
    const hi = Math.max(...c);
    // A near-flat replay hums around the middle of the scale instead of leaping
    // two octaves for a cent.
    return { closes: c, span: Math.max(hi - lo, Math.abs((lo + hi) / 2) * 0.02, 1e-9) };
  }, [screen.chart, start, bars]);
  const pitch = useMemo(() => {
    const mid = (Math.min(...closes) + Math.max(...closes)) / 2;
    return closes.map((c) =>
      Math.round((NOTE_STEPS - 1) / 2 + ((c - mid) / span) * (NOTE_STEPS - 3))
    );
  }, [closes, span]);

  // While the line is climbing, the phone rumbles -- continuously, not bar by
  // bar -- and a steeper leg rumbles harder. Segment `j` runs from bar j-1 to
  // bar j after the decision; it begins as bar j-1 lands. A leg that falls or
  // goes flat is quiet, so the hand feels the climbs and only the climbs.
  const segment = useCallback(
    (j: number) => {
      if (j < 1 || j > legs) return stopRumble();
      const rise = closes[j] - closes[j - 1];
      if (rise > 0) startRumble(0.25 + (rise / span) * 2.2);
      else stopRumble();
    },
    [legs, closes, span]
  );
  const onBar = useCallback(
    (k: number) => {
      noteFeedback(pitch[k] ?? 4);
      segment(k + 1);
    },
    [pitch, segment]
  );
  // The first leg begins as the decision commits, but the line only creeps out
  // of it (the slow start), so its rumble waits until the movement shows.
  const firstLeg = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quiet = useCallback(() => {
    if (firstLeg.current) clearTimeout(firstLeg.current);
    firstLeg.current = null;
    stopRumble();
  }, []);
  useEffect(() => quiet, [quiet]);

  // Ticks only while the replay plays on its own. A skip, or reduced motion,
  // goes straight to the verdict without a drum-roll in between.
  const armed = useSharedValue(false);
  useAnimatedReaction(
    () => (armed.get() ? Math.floor(progress.get() * legs + 1e-6) : -1),
    (landed, previous) => {
      if (previous === null || landed <= previous || landed < 1 || landed >= legs) return;
      scheduleOnRN(onBar, landed);
    },
    [legs, onBar]
  );

  useEffect(() => {
    if (choice === null) return;
    // §10: reduce motion keeps the outcome, drops the travel.
    if (reduced) {
      armed.set(false);
      progress.set(1);
      setDone(true);
      return;
    }
    armed.set(true);
    progress.set(0);
    quiet();
    firstLeg.current = setTimeout(() => segment(1), 180);
    // docs/UI.md §4.3 plays the outcome candle by candle; how slowly, and why
    // the end takes longest, is in lesson/motion.ts.
    progress.set(
      withTiming(1, revealTiming(legs), (finished) => {
        'worklet';
        if (finished) scheduleOnRN(finish);
      })
    );
  }, [choice, reduced, legs, progress, armed, finish, quiet, segment]);

  // Tap to skip: the rest of the replay in one short sweep, not a jump cut.
  const onChartPress = () => {
    if (choice === null || done) return;
    armed.set(false);
    quiet();
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
  const chartWidth = chartWidthFor(width, !!screen.chart.volume);

  return (
    <View style={styles.wrap}>
      <Text style={styles.scenario}>{copy(screen.scenario)}</Text>

      {screen.state?.length ? <StateChips state={screen.state} /> : null}

      <View ref={grid.ref} onLayout={grid.onLayout} style={styles.chartBox}>
        <Pressable accessibilityRole="button" onPress={onChartPress} disabled={choice === null}>
          <Chart
            spec={screen.chart}
            visibleCount={done ? bars : start}
            revealFrom={start}
            playback={playing ? progress : undefined}
            gridAnchor={grid.gridAnchor}
            width={chartWidth}
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
        <Arrive style={neo ? [styles.outcome, glass] : styles.outcome}>
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
        </Arrive>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.md },
  chartBox: { alignSelf: 'center' },
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
