import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
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
import { useGridAnchor } from '../components/gridAlign';
import StateChips from '../components/StateChips';
import { signedPercent, signedPrice } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { decisionButtons } from '../lesson/answers';
import { detentFeedback } from '../lesson/feedback';
import { type ChartMove, startChartMove } from '../lesson/haptics';
import { REVEAL_GROWTH, useChartGaps } from '../lesson/fit';
import { RevealProbe } from '../lesson/Reveal';
import {
  decisionMove,
  DECISION_LABEL,
  DIRECTION,
  longestDecisionReveal,
  positionTag,
} from '../lesson/decisionReveal';
import { DecisionSpace, useLessonInfo } from '../lesson/lessonContext';
import { tradePlanOf } from '../lesson/tradePlan';
import { RULER_W } from '../components/ChartPlan';
import { useProgress } from '../progress';
import { knowsR } from '../skills';
import {
  EASE_IN_OUT,
  EASE_OUT,
  EASE_OUT_SETTLE,
  REVEAL_BAR_MS,
  REVEAL_CANDLE_MS,
  revealTiming,
} from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, GRID, MONO_FONT, space, type, themed } from '../theme';
import type { ChartDecisionScreen as S, DecisionButton } from '../types';
import { TermText } from '../lesson/termText';

export type DecisionPhase = 'deciding' | 'playing' | 'done';

/** The frame stepping back once the call is made, before the first new bar. */
const PULL_BACK_MS = 520;

/** Tap to skip: the rest of the replay in one short sweep. */
const SKIP_MS = 220;

/** The brief folding away once the call is made, as the frame pulls back. */
const FOLD_MS = 460;

/**
 * The tallest plot this screen may take (lesson/fit.tsx, useChartGaps). Eight
 * since DESIGN-REVIEW: the chart is as large as the screen allows (David,
 * 2026-10-03: "make the chart bigger").
 */
const MAX_DECISION_GAPS = 8;

/** How far the chart is dragged, in points, before letting go makes the call. */
const CALL_AT = 96;

/**
 * docs/ui/05-chart-questions-and-mistakes-round.md §4.3 [DESIGN-REVIEW] "Swipe to make the call" (David's pick of
 * 2026-10-04): which call a swipe across the chart makes. Right is the call
 * up (Long, Buy); left is Short, or on a Buy / Wait screen, Wait. A screen
 * whose keys have no call for a side does not answer a swipe that way.
 */
export function swipeCalls(buttons: DecisionButton[]): {
  right: DecisionButton | null;
  left: DecisionButton | null;
} {
  const right = buttons.find((b) => b === 'long' || b === 'buy') ?? null;
  const left =
    buttons.find((b) => b === 'short') ??
    (buttons.includes('buy') ? (buttons.find((b) => b === 'wait') ?? null) : null);
  return { right, left };
}

export default function ChartDecisionScreen({
  screen,
  value,
  width,
  onPhaseChange,
  onDecide,
  revealed = false,
}: {
  screen: S;
  value: AnswerValue;
  width: number;
  onPhaseChange: (phase: DecisionPhase) => void;
  /** A call made by swiping the chart, as its key would make it. */
  onDecide?: (button: DecisionButton) => void;
  /** Already answered: a screen come back to, which shows its end state. */
  revealed?: boolean;
}) {
  const reduced = useReduceMotion();
  const bars = Array.isArray(screen.chart.data) ? screen.chart.data.length : 0;
  const start = screen.chart.decision_index + 1;
  // docs/ui/08-quotes-and-charts.md §6.4 [DESIGN-REVIEW]: the plan in the file, where the trade
  // ended, and whether R has been taught yet -- the ruler waits for that lesson.
  const plan = useMemo(() => tradePlanOf(screen), [screen]);
  const endAt = plan ? plan.exit.bar : bars - 1;
  const { lessonId, everything } = useLessonInfo();
  const { done: played } = useProgress();
  const showR = !!plan && (everything || knowsR(lessonId, played));

  const choice = value.kind === 'decision' ? value.choice : null;
  // A screen come back to (the back button) opens on its finished chart; the
  // replay and what it plays on the hand belong to the first time only.
  const [revisit] = useState(revealed && choice !== null);
  const [done, setDone] = useState(revisit);

  // docs/ui/05-chart-questions-and-mistakes-round.md §4.3: after the choice the chart continues. It used to do that by
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
  const legs = Math.max(1, endAt + 1 - start);
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
    // windowAt), then docs/ui/05-chart-questions-and-mistakes-round.md §4.3 plays the outcome bar by bar; how slowly,
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
  // To where the trade ended: the stop or the target when the file has them.
  const move = decisionMove(screen);
  const movePct = (move / decisionPrice) * 100;

  // The verdict this screen keeps room for, measured rather than guessed: the
  // card laid out invisibly (Reveal.tsx, RevealProbe) with this screen's
  // explanation and the tallest reveal any of its buttons can get. Sized for less, a
  // wrong answer's card overflowed and the whole screen was scaled down to
  // fit it the moment it landed -- the chart squeezed at the very end.
  const [probeH, setProbeH] = useState(0);
  const verdictH = probeH > 0 ? probeH + space.md : REVEAL_GROWTH;
  const longest = useMemo(() => longestDecisionReveal(screen, { showR }), [screen, showR]);

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

  // docs/ui/05-chart-questions-and-mistakes-round.md §4.3's outcome strip, as a tag on the chart: the move in
  // points and percent, and the position held. What it made or lost is the
  // reveal's result line (§5.1b), under the grade -- said here as well, it
  // was a second, coloured verdict (review M7).
  const outcome = useMemo(
    () => ({
      move: `${move >= 0 ? '▲' : '▼'} ${signedPrice(move)}  ${signedPercent(movePct)}`,
      position: positionTag(screen, choice),
      up: move >= 0,
      flat: Math.abs(move) < 1e-9,
    }),
    [move, movePct, screen, choice],
  );
  const chartHeight = chartHeightFor(!!screen.chart.volume, fit.gaps);
  // Once the brief has folded the chart starts at the top of the area, so it
  // ends at its own height: the reveal takes the room from there to the key.
  const reportBottom = React.useContext(DecisionSpace);
  useEffect(() => {
    reportBottom(phase !== 'deciding' && folded ? chartHeight : null);
  }, [phase, folded, chartHeight, reportBottom]);
  useEffect(() => () => reportBottom(null), [reportBottom]);
  const chartWidth = chartWidthFor(width, !!screen.chart.volume, fit.gaps, showR ? RULER_W : 0);
  // The ruler measures the file's trade: shown for the learner who took it,
  // faint for one who stood aside, and not for one who traded the other way.
  const choiceDir = choice ? DIRECTION[choice] : null;
  const ruler =
    !showR || !plan || choiceDir === null
      ? null
      : choiceDir === plan.dir
        ? 'full'
        : choiceDir === 0
          ? 'faint'
          : null;

  // The swipe: while the call is open the chart follows the finger sideways,
  // leaning the way it goes, with the call it would make stamped on it; let
  // go far enough and that call is made, as its key would make it, and the
  // chart springs back into place to play it out. Not far enough, it springs
  // back and nothing is decided. The keys stay the tap path (§10).
  const calls = useMemo(() => swipeCalls(decisionButtons(screen)), [screen]);
  const drag = useSharedValue(0);
  const armed = useSharedValue(0);
  const canSwipe = choice === null && !revisit && !!onDecide;
  const call = useCallback(
    (right: boolean) => {
      const button = right ? calls.right : calls.left;
      if (button) onDecide?.(button);
    },
    [calls, onDecide],
  );
  const armedFeel = useCallback(() => detentFeedback(), []);
  const hasRight = !!calls.right;
  const hasLeft = !!calls.left;
  const swipe = Gesture.Pan()
    .enabled(canSwipe && (hasRight || hasLeft))
    // Sideways only: an up-and-down move is the page's.
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      const x = e.translationX;
      // A side with no call gives a little and no further.
      const to = (x > 0 && !hasRight) || (x < 0 && !hasLeft) ? x * 0.15 : x * 0.8;
      drag.set(to);
      const far = Math.abs(to) >= CALL_AT ? 1 : 0;
      if (far !== armed.get()) {
        armed.set(far);
        if (far) scheduleOnRN(armedFeel);
      }
    })
    .onEnd((e) => {
      const x = drag.get();
      const right = x + e.velocityX * 0.05 > 0;
      const allowed = right ? hasRight : hasLeft;
      const far = Math.abs(x) >= CALL_AT || (Math.abs(e.velocityX) > 900 && Math.abs(x) > 40);
      if (far && allowed) scheduleOnRN(call, right);
    })
    .onFinalize(() => {
      armed.set(0);
      drag.set(reduced ? 0 : withSpring(0, { duration: 420, dampingRatio: 0.7 }));
    });
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.get() }, { rotate: `${drag.get() / 40}deg` }],
  }));
  const rightStamp = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, drag.get() / CALL_AT)),
  }));
  const leftStamp = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -drag.get() / CALL_AT)),
  }));
  const swipeHint =
    hasLeft && hasRight
      ? `← ${DECISION_LABEL[calls.left!]} · ${DECISION_LABEL[calls.right!]} →`
      : hasRight
        ? `Swipe → ${DECISION_LABEL[calls.right!]}`
        : '';

  // docs/ui/02-lesson-player-layout.md §2 [v4]: the scenario and its chart start at the top of the
  // area, as every screen does (Calm's layout, stage LOOK-BRIEF); the decision
  // buttons are in the footer, under the thumb, and the verdict lands in the
  // room the brief folds out of.
  return (
    <View style={styles.wrap}>
      {revisit ? null : (
        <RevealProbe
          lead={longest.lead}
          explanation={screen.explanation}
          decision={longest}
          onHeight={setProbeH}
        />
      )}
      <View style={styles.column} onLayout={fit.onLayout}>
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
              <TermText text={screen.scenario} style={styles.scenario} />
              {screen.state?.length ? <StateChips state={screen.state} /> : null}
            </View>
            <View style={{ height: briefH > 0 ? briefH - briefText : space.md }} />
          </Animated.View>
        )}

        <View ref={grid.ref} onLayout={grid.onLayout} style={styles.chartBox}>
          <GestureDetector gesture={swipe}>
            <Animated.View style={dragStyle}>
              <Pressable
                // Only while the replay plays is the chart a key (tap to skip);
                // otherwise a screen reader reaches the chart's own sentence.
                accessible={phase === 'playing'}
                accessibilityRole="button"
                accessibilityLabel="Skip the replay"
                onPress={onChartPress}
                disabled={choice === null}
              >
                <Chart
                  spec={screen.chart}
                  visibleCount={done ? endAt + 1 : start}
                  revealFrom={start}
                  playback={playing ? progress : undefined}
                  gridAnchor={grid.gridAnchor}
                  width={chartWidth}
                  height={chartHeight}
                  outcome={phase === 'done' ? outcome : undefined}
                  plan={plan ?? undefined}
                  planShown={choice !== null}
                  ruler={ruler}
                  rulerSpace={showR}
                  endAt={endAt}
                  notes={screen.notes}
                  showNotes={phase === 'done'}
                  scrub={phase === 'done'}
                />
              </Pressable>
              {canSwipe && hasRight ? (
                <Animated.View
                  pointerEvents="none"
                  style={[styles.stamp, styles.stampRight, { borderColor: colors.up }, rightStamp]}
                >
                  <Text style={[styles.stampText, { color: colors.up }]}>
                    {DECISION_LABEL[calls.right!].toUpperCase()}
                  </Text>
                </Animated.View>
              ) : null}
              {canSwipe && hasLeft ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.stamp,
                    styles.stampLeft,
                    { borderColor: calls.left === 'short' ? colors.down : colors.textMuted },
                    leftStamp,
                  ]}
                >
                  <Text
                    style={[
                      styles.stampText,
                      { color: calls.left === 'short' ? colors.down : colors.textMuted },
                    ]}
                  >
                    {DECISION_LABEL[calls.left!].toUpperCase()}
                  </Text>
                </Animated.View>
              ) : null}
            </Animated.View>
          </GestureDetector>
          {/* In the strip under the plot, opposite the VWAP key: a line of its
            own cost the screen a row. While the replay plays it says how to
            skip it; once it is over it carries the risk note docs/ui/16-navigation.md §11.6
            wants on every scenario result. */}
          <Text
            pointerEvents="none"
            // The outcome sentence is the reveal's to say, after the grade (docs/ui/06-reveal-and-hearts.md §5.1b).
            accessibilityLabel={
              phase === 'done' ? 'Not a prediction.' : phase === 'deciding' ? '' : undefined
            }
            style={[
              styles.playHint,
              phase === 'deciding' && !(canSwipe && swipeHint) && styles.playHintHidden,
            ]}
          >
            {phase === 'done'
              ? 'Not a prediction'
              : phase === 'deciding'
                ? swipeHint || 'Tap to skip'
                : 'Tap to skip'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { flex: 1 },
  column: {},
  brief: { overflow: 'hidden' },
  briefText: { gap: space.md },
  chartBox: { alignSelf: 'center' },
  scenario: { ...type.body, color: colors.text },
  playHint: {
    ...type.small,
    fontSize: 13,
    color: colors.textFaint,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  // Kept in the layout at all times: appearing mid-replay would shift the chart
  // under the line that is still drawing.
  playHintHidden: { opacity: 0 },
  stamp: {
    position: 'absolute',
    top: space.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderWidth: 3,
    borderRadius: 8,
  },
  stampRight: { left: space.lg, transform: [{ rotate: '-12deg' }] },
  stampLeft: { right: space.xxl + space.lg, transform: [{ rotate: '12deg' }] },
  stampText: {
    fontFamily: MONO_FONT,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
}));
