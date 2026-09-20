import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Chart, { closeAt } from '../components/Chart';
import StateChips from '../components/StateChips';
import { copy, count, signedPercent, signedPrice } from '../format';
import type { AnswerValue } from '../lesson/answers';
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
  const [visible, setVisible] = useState(start);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const playing = choice !== null && visible < bars;
  const phase: DecisionPhase =
    choice === null ? 'deciding' : visible < bars ? 'playing' : 'done';

  useEffect(() => {
    onPhaseChange(phase);
  }, [phase, onPhaseChange]);

  // docs/UI.md §4.3: after the choice the chart continues candle by candle.
  // §10: reduce motion turns auto-playback off; the candles then appear on tap.
  useEffect(() => {
    if (choice === null || reduced || visible >= bars) return;
    timer.current = setInterval(() => {
      setVisible((v) => {
        if (v + 1 >= bars && timer.current) clearInterval(timer.current);
        return Math.min(v + 1, bars);
      });
    }, PLAYBACK_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [choice, reduced, bars, visible >= bars]);

  const onChartPress = () => {
    if (choice === null) return;
    // Tap to skip; under reduce motion, tap advances one bar.
    setVisible((v) => (reduced ? Math.min(v + 1, bars) : bars));
  };

  const decisionPrice = closeAt(screen.chart, screen.chart.decision_index);
  const finalPrice = closeAt(screen.chart, bars - 1);
  const move = finalPrice - decisionPrice;
  const movePct = (move / decisionPrice) * 100;
  const direction = choice ? DIRECTION[choice] : 0;
  const pnl = direction * move * screen.shares;

  const chartHeight = screen.chart.volume ? 252 : 220;

  return (
    <View style={styles.wrap}>
      <Text style={styles.scenario}>{copy(screen.scenario)}</Text>

      {screen.state?.length ? <StateChips state={screen.state} /> : null}

      <Pressable onPress={onChartPress} disabled={choice === null}>
        <Chart
          spec={screen.chart}
          visibleCount={visible}
          width={width}
          height={chartHeight}
        />
      </Pressable>

      {playing ? (
        <Text style={styles.playHint}>
          {reduced ? 'Tap the chart for the next bar' : 'Tap the chart to skip'}
        </Text>
      ) : null}

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
