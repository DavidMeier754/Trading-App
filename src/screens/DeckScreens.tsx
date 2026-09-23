import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import MiniChart from '../components/MiniChart';
import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { tapFeedback } from '../lesson/feedback';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type {
  CompareScreen as Compare,
  SwipeDeckScreen as SwipeDeck,
} from '../types';
import { Prompt, ToneSurface } from './common';

/**
 * docs/UI.md §4.2 `swipe-deck` — a deck of mini-charts, one at a time, with a
 * one-line verdict as each flies off and a run strip at the end. Never timed.
 *
 * The buttons are the interaction, not a fallback: §10 requires the tap-only
 * path, and a swipe gesture on top of it is a later nicety, not the contract.
 */
export function SwipeDeckScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: SwipeDeck;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const picks = value.kind === 'deck' ? value.picks : [];
  const index = Math.min(picks.length, screen.cards.length - 1);
  const card = screen.cards[index];
  const done = picks.length >= screen.cards.length;
  const lastPick = picks.length > 0 ? picks[picks.length - 1] : null;
  const lastCard = picks.length > 0 ? screen.cards[picks.length - 1] : null;

  const answer = (pick: 'take' | 'pass') => {
    tapFeedback();
    onChange({ kind: 'deck', picks: [...picks, pick] });
  };

  if (done || revealed) {
    const hits = screen.cards.filter((c, i) => picks[i] === c.answer).length;
    return (
      <View style={styles.wrap}>
        <Prompt>{screen.prompt}</Prompt>
        <Text style={styles.runLine}>{`${hits} of ${screen.cards.length} read right`}</Text>
        <View style={styles.runStrip}>
          {screen.cards.map((c, i) => (
            <View
              key={i}
              style={[
                styles.runPip,
                {
                  backgroundColor:
                    picks[i] === c.answer ? colors.success : colors.down,
                },
              ]}
            >
              <Text style={styles.runPipText}>{picks[i] === 'take' ? 'T' : 'P'}</Text>
            </View>
          ))}
        </View>
        {lastCard ? <Text style={styles.verdict}>{copy(lastCard.verdict)}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <Text style={styles.counter}>{`${index + 1}/${screen.cards.length}`}</Text>
      {/* Keyed by card, so each one builds itself in as it comes up. */}
      <MiniChart key={index} spec={card.chart} width={width} height={180} />
      {lastCard && lastPick ? (
        <Text
          style={[
            styles.verdictSmall,
            { color: lastPick === lastCard.answer ? colors.success : colors.warning },
          ]}
        >
          {copy(lastCard.verdict)}
        </Text>
      ) : null}
      <View style={styles.deckButtons}>
        <Pressable accessibilityRole="button" onPress={() => answer('pass')} style={[styles.deckButton, styles.pass]}>
          <Text style={styles.deckButtonText}>Pass</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => answer('take')} style={[styles.deckButton, styles.take]}>
          <Text style={styles.deckButtonText}>Take it</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** docs/UI.md §4.2 `compare` — two or three charts, pick the one that matches. */
export function CompareScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: Compare;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const picked = value.kind === 'target' ? value.id : null;
  const cols = screen.charts.length;
  const chartWidth = (width - space.sm * (cols - 1)) / cols;

  const toneFor = (id: string) => {
    if (!revealed) return picked === id ? 'selected' : 'idle';
    if (id === screen.answer) return 'correct';
    if (id === picked) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <View style={styles.compareRow}>
        {screen.charts.map((chart, i) => {
          const id = chart.label ?? String(i);
          return (
            <ToneSurface
              key={id}
              tone={toneFor(id) as any}
              disabled={revealed}
              onPress={() => {
                onChange({ kind: 'target', id });
              }}
              style={styles.compareCard}
            >
              <MiniChart spec={chart} width={chartWidth - 12} height={130} />
              <Text style={styles.compareLabel}>{id}</Text>
            </ToneSurface>
          );
        })}
      </View>
      {screen.allow_neither ? (
        <ToneSurface
          tone={toneFor('neither') as any}
          disabled={revealed}
          onPress={() => {
            onChange({ kind: 'target', id: 'neither' });
          }}
          style={styles.neither}
        >
          <Text style={styles.neitherText}>Neither</Text>
        </ToneSurface>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.md },
  counter: { ...type.label, color: colors.textMuted, alignSelf: 'center' },
  deckButtons: { flexDirection: 'row', gap: space.md },
  deckButton: {
    flex: 1,
    minHeight: TAP_TARGET + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pass: { borderColor: colors.borderStrong },
  take: { borderColor: colors.up },
  deckButtonText: { ...type.answer, color: colors.text },
  verdict: { ...type.body, color: colors.text, textAlign: 'center' },
  verdictSmall: { ...type.small, textAlign: 'center' },
  runLine: { ...type.title, color: colors.text, textAlign: 'center' },
  runStrip: { flexDirection: 'row', gap: space.xs, justifyContent: 'center' },
  runPip: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runPipText: { ...type.small, color: colors.background, fontWeight: '700' },
  compareRow: { flexDirection: 'row', gap: space.sm },
  compareCard: { flex: 1, padding: 6, alignItems: 'center', gap: 6 },
  compareLabel: { ...type.small, color: colors.text },
  neither: { minHeight: TAP_TARGET, alignItems: 'center', justifyContent: 'center' },
  neitherText: { ...type.answer, color: colors.text },
});
