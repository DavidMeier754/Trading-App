import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Chart, {
  chartHeightFor,
  chartWidthFor,
  closeAt,
  DEFAULT_GAPS,
  PLAY_START,
} from '../components/Chart';
import { DECISION_LABEL } from '../components/DecisionButtons';
import { useGridAnchor } from '../components/gridAlign';
import StateChips from '../components/StateChips';
import { copy, count, signedPercent, signedPrice } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { type ChartMove, startChartMove } from '../lesson/haptics';
import { REVEAL_GROWTH, useChartGaps } from '../lesson/fit';
import { useFit } from '../lesson/fitState';
import { RevealProbe } from '../lesson/Reveal';
import {
  EASE_IN_OUT,
  EASE_OUT,
  EASE_OUT_SETTLE,
  REVEAL_BAR_MS,
  REVEAL_CANDLE_MS,
  revealTiming,
} from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, GRID, space, type } from '../theme';
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

/** The frame stepping back once the call is made, before the first new bar. */
const PULL_BACK_MS = 520;

/** Tap to skip: the rest of the replay in one short sweep. */
const SKIP_MS = 220;

/** The brief folding away once the call is made, as the frame pulls back. */
const FOLD_MS = 460;

/** The tallest plot this screen may take (lesson/fit.tsx, useChartGaps). */
const MAX_DECISION_GAPS = 7;

export default function ChartDecisionScreen({
  screen,
  value,
  width,
  onPhaseChange,
  revealed = false,
}: {
  screen: S;
  value: AnswerValue;
  width: number;
  onPhaseChange: (phase: DecisionPhase) => void;
  /** Already answered: a screen come back to, which shows its end state. */
  revealed?: boolean;
}) {
  const reduced = useReduceMotion();
  const bars = Array.isArray(screen.chart.data) ? screen.chart.data.length : 0;
  const start = screen.chart.decision_index + 1;

  const choice = value.kind === 'decision' ? value.choice : null;
  // A screen come back to (the back button) opens on its finished chart; the
  // replay and what it plays on the hand belong to the first time only.
  const [revisit] = useState(revealed && choice !== null);
  const [done, setDone] = useState(revisit);

  // docs/UI.md §4.3: after the choice the chart continues. It used to do that by
  // raising a React state one bar at a time on a 120ms interval -- and since the
  // price axis is derived from the bars in view, every one of those steps
  // re-scaled and re-rendered the whole chart. Now a single shared value runs
  // 0 -> 1 on the UI thread and the chart derives the line, its fill, the leading
  // dot and the axis from it, so the replay is continuous and costs no renders.
  const progress = useSharedValue(revisit ? 1 : PLAY_START);
  const playing = choice !== null && !done;
  const phase: DecisionPhase = choice === null ? 'deciding' : done ? 'done' : 'playing';

  useEffect(() => {
    onPhaseChange(phase);
  }, [phase, onPhaseChange]);

  // What the hand feels while the outcome plays, line or candles alike: one
  // steady vibration from the moment the call is made -- the frame pulling
  // back is the chart moving too -- until the last bar settles, and then one
  // firm landing (lesson/haptics.ts, startChartMove). The verdict lands with
  // it. A skip brings the landing forward to the end of the sweep; leaving
  // the screen stops the vibration without one.
  const isLine = screen.chart.kind === 'line';
  const legs = Math.max(1, bars - start);
  const motion = useRef<ChartMove | null>(null);
  const quiet = useCallback(() => {
    motion.current?.cancel();
    motion.current = null;
  }, []);
  useEffect(() => quiet, [quiet]);

  const finish = useCallback(() => {
    motion.current?.land();
    motion.current = null;
    setDone(true);
  }, []);

  useEffect(() => {
    if (choice === null || revisit) return;
    // §10: reduce motion keeps the outcome, drops the travel.
    if (reduced) {
      quiet();
      progress.set(1);
      setDone(true);
      return;
    }
    // First the frame pulls back to the height the session needs (Chart's
    // windowAt), then docs/UI.md §4.3 plays the outcome bar by bar; how slowly,
    // and why the end takes longest, is in lesson/motion.ts. Candles take
    // longer per bar than a line, because each one forms as it goes.
    const reveal = revealTiming(legs, isLine ? REVEAL_BAR_MS : REVEAL_CANDLE_MS);
    quiet();
    motion.current = startChartMove(PULL_BACK_MS + reveal.duration);
    progress.set(PLAY_START);
    progress.set(
      withSequence(
        withTiming(0, { duration: PULL_BACK_MS, easing: EASE_IN_OUT }),
        withTiming(1, reveal, (finished) => {
          'worklet';
          if (finished) scheduleOnRN(finish);
        }),
      ),
    );
  }, [choice, reduced, revisit, isLine, legs, progress, finish, quiet]);

  // Tap to skip: the rest of the replay in one short sweep, not a jump cut.
  const onChartPress = () => {
    if (choice === null || done) return;
    motion.current?.retime(SKIP_MS * EASE_OUT_SETTLE);
    progress.set(
      withTiming(1, { duration: SKIP_MS, easing: EASE_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(finish);
      }),
    );
  };

  // Once the call is made the brief -- the scenario and its chips -- has done
  // its job, so it folds away while the frame pulls back: the chart glides up
  // into its place, and the verdict, when it lands, takes the room the brief
  // gave up. That is what lets the chart be sized for the whole screen instead
  // of for what is left of it after the verdict -- it was the verdict's room,
  // kept empty under the chart from the start, that squeezed it.
  //
  // The brief's height is rounded up to whole backdrop cells, so the chart ends
  // its glide exactly as far down the grid as it started and nothing has to
  // snap into line after it.
  const [briefText, setBriefText] = useState(0);
  const briefH = briefText > 0 ? Math.ceil((briefText + space.md) / GRID) * GRID : 0;
  const fold = useSharedValue(revisit ? 1 : 0);
  const [folded, setFolded] = useState(revisit);
  useEffect(() => {
    if (choice === null || revisit) return;
    const done = () => setFolded(true);
    fold.set(
      withTiming(1, { duration: reduced ? 0 : FOLD_MS, easing: EASE_IN_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(done);
      }),
    );
  }, [choice, revisit, reduced, fold]);
  const briefStyle = useAnimatedStyle(() => {
    const f = fold.get();
    return {
      // Its own height until it folds, then down to nothing.
      maxHeight: f <= 0 ? 10000 : briefH * (1 - f),
      opacity: 1 - Math.min(1, f * 1.8),
    };
  });

  // The chart's price gridlines snap onto the backdrop grid, which needs to know
  // how far down the grid the chart sits. It is measured again once the brief
  // has folded and once the verdict is in -- at rest, never mid-glide, when a
  // reading would snap the lines to a place the chart is only passing through.
  const grid = useGridAnchor(`${phase === 'done'}-${folded}`);

  const decisionPrice = closeAt(screen.chart, screen.chart.decision_index);
  const finalPrice = closeAt(screen.chart, bars - 1);
  const move = finalPrice - decisionPrice;
  const movePct = (move / decisionPrice) * 100;
  const direction = choice ? DIRECTION[choice] : 0;
  const pnl = direction * move * screen.shares;

  // The verdict this screen keeps room for, measured rather than guessed: the
  // card laid out invisibly (Reveal.tsx, RevealProbe) with this screen's
  // explanation and the longest lead a decision can get. Sized for less, a
  // wrong answer's card overflowed and the whole screen was scaled down to
  // fit it the moment it landed -- the chart squeezed at the very end.
  const [probeH, setProbeH] = useState(0);
  const verdictH = probeH > 0 ? probeH + space.md : REVEAL_GROWTH;
  const longestLead = `Standing aside costs nothing here. The better call was ${
    DECISION_LABEL[screen.best] ?? screen.best
  }.`;

  // As tall as the screen has room for, counting the reveal still to come
  // (lesson/fit.tsx), and sized from the chart's own geometry, so the
  // grid-aligned plot, the volume strip and the slack the snap shifts into all
  // fit exactly. Nothing else joins the screen after the replay: the outcome
  // is drawn on the chart, so the chart can have that room too.
  const fit = useChartGaps({
    preferred: DEFAULT_GAPS,
    // The verdict moves into the room the brief folds out of, so only what it
    // needs past that has to be kept free. Come back to, the reveal is already
    // under the screen and the room measured already allows for it.
    growth: revisit ? 0 : Math.max(0, verdictH - briefH),
    locked: phase !== 'deciding' && !revisit,
    max: MAX_DECISION_GAPS,
    // With the verdict's room measured, only a sliver past it is let through:
    // at worst -- the longest lead, on a phone where the chart just fits -- a
    // scale of about one in a hundred, too little to see. Guessing the room
    // instead scaled the screen by up to a fifth.
    tolerance: 0.03,
  });

  // docs/UI.md §4.3's outcome strip, as a tag on the chart: the move in
  // points and percent, and what it did to this position at the scenario's
  // share count.
  const outcome = useMemo(
    () => ({
      move: `${move >= 0 ? '▲' : '▼'} ${signedPrice(move)}  ${signedPercent(movePct)}`,
      position:
        direction === 0
          ? `you stood aside · ${count(screen.shares)}`
          : `${signedPrice(pnl)} on ${count(screen.shares)}`,
      up: move >= 0,
      flat: Math.abs(move) < 1e-9,
    }),
    [move, movePct, direction, pnl, screen.shares],
  );
  const chartHeight = chartHeightFor(!!screen.chart.volume, fit.gaps);
  const chartWidth = chartWidthFor(width, !!screen.chart.volume, fit.gaps);

  // Centred while there is room to centre in -- in whole backdrop cells, so
  // the grid still lines up -- but never lower than the finished screen, chart
  // and verdict with the brief gone, can afford. Worked out while deciding and
  // then held, so the chart does not move again when the verdict lands.
  const { room } = useFit();
  const [columnH, setColumnH] = useState(0);
  const [spacer, setSpacer] = useState(0);
  const measuring = phase === 'deciding' || revisit;
  const onColumnLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (measuring) setColumnH(e.nativeEvent.layout.height);
      fit.onLayout(e);
    },
    [measuring, fit.onLayout],
  );
  useEffect(() => {
    if (!measuring || room === undefined || columnH <= 0) return;
    const centred = (room - columnH) / 2;
    const finished = room - (revisit ? 0 : verdictH) - chartHeight;
    setSpacer(Math.max(0, Math.floor(Math.min(centred, finished) / GRID) * GRID));
  }, [measuring, revisit, room, columnH, chartHeight, verdictH]);

  return (
    <View style={styles.wrap}>
      {revisit ? null : (
        <RevealProbe lead={longestLead} explanation={screen.explanation} onHeight={setProbeH} />
      )}
      <View style={{ height: spacer }} />
      <View style={styles.column} onLayout={onColumnLayout}>
        {revisit ? null : (
          <Animated.View
            style={[styles.brief, briefStyle]}
            accessibilityElementsHidden={folded}
            importantForAccessibility={folded ? 'no-hide-descendants' : 'auto'}
          >
            <View
              style={styles.briefText}
              onLayout={(e) => setBriefText(e.nativeEvent.layout.height)}
            >
              <Text style={styles.scenario}>{copy(screen.scenario)}</Text>
              {screen.state?.length ? <StateChips state={screen.state} /> : null}
            </View>
            <View style={{ height: briefH > 0 ? briefH - briefText : space.md }} />
          </Animated.View>
        )}

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
              outcome={phase === 'done' ? outcome : undefined}
            />
          </Pressable>
          {/* In the strip under the plot, opposite the VWAP key: a line of its
            own cost the screen a row. While the replay plays it says how to
            skip it; once it is over it carries the risk note docs/UI.md §11.6
            wants on every scenario result. */}
          <Text
            pointerEvents="none"
            accessibilityLabel={
              phase === 'done' ? `${copy(screen.outcome)} Not a prediction.` : undefined
            }
            style={[styles.playHint, phase === 'deciding' && styles.playHintHidden]}
          >
            {phase === 'done' ? 'Not a prediction' : 'Tap to skip'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  column: {},
  brief: { overflow: 'hidden' },
  briefText: { gap: space.md },
  chartBox: { alignSelf: 'center' },
  scenario: { ...type.body, color: colors.text },
  playHint: {
    ...type.small,
    fontSize: 11,
    color: colors.textFaint,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  // Kept in the layout at all times: appearing mid-replay would shift the chart
  // under the line that is still drawing.
  playHintHidden: { opacity: 0 },
});
