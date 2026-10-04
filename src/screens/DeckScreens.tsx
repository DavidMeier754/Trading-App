import React from 'react';
import { Pressable, Text, View } from 'react-native';

import MiniChart from '../components/MiniChart';
import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { PopIn } from '../lesson/Celebrate';
import { matchHitFeedback, matchMissFeedback } from '../lesson/feedback';
import { useLookSpec } from '../lesson/look';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import type { CompareScreen as Compare, SwipeDeckScreen as SwipeDeck } from '../types';
import { Prompt, Stack, ToneSurface } from './common';

/**
 * docs/ui/04-question-types.md §4.2 `swipe-deck` — a deck of mini-charts, one at a time, with a
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

  const accent = useLookSpec().accent;
  // Each card is its own call, so each one says at once whether it was right
  // -- the way a pair locks in `match`: a rising pop for a right read, the
  // soft miss for one that was not. The run keeps count in the strip above.
  const answer = (pick: 'take' | 'pass') => {
    const hits = screen.cards.filter((c, i) => picks[i] === c.answer).length;
    if (pick === card.answer) matchHitFeedback(Math.min(3, hits));
    else matchMissFeedback();
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
                  backgroundColor: picks[i] === c.answer ? colors.success : colors.down,
                },
              ]}
            >
              <Text style={styles.runPipText}>{picks[i] === 'take' ? 'T' : 'P'}</Text>
            </View>
          ))}
        </View>
        {/* The run is the summary: the last card's own note stays with that
            card, not under the total where it read as a verdict on the deck. */}
      </View>
    );
  }

  const lastRight = lastCard && lastPick ? lastPick === lastCard.answer : null;

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      {/* The run so far: a mark for every card read, a ring on this one. */}
      <View style={styles.pips} accessibilityLabel={`Card ${index + 1} of ${screen.cards.length}`}>
        {screen.cards.map((c, i) => {
          if (i < picks.length) {
            const right = picks[i] === c.answer;
            return (
              <PopIn key={i}>
                <View
                  style={[styles.pip, { backgroundColor: right ? colors.success : colors.down }]}
                >
                  <Text style={styles.pipMark}>{right ? '✓' : '✕'}</Text>
                </View>
              </PopIn>
            );
          }
          return (
            <View
              key={i}
              style={[
                styles.pip,
                i === index ? { borderColor: accent, borderWidth: 2 } : styles.pipAhead,
              ]}
            />
          );
        })}
      </View>
      {/* Keyed by card, so each one builds itself in as it comes up. */}
      <MiniChart key={index} spec={card.chart} width={width} height={180} />
      {/* Room for the longest verdict from the first card on, so the first one
          to arrive does not push the buttons down under the thumb. */}
      <Stack
        current={-1}
        items={screen.cards.map((c, i) => (
          <View key={i} style={styles.verdictRow}>
            <Text style={styles.verdictHead}>{`✕ Not this one · card ${i + 1}`}</Text>
            <Text style={styles.verdictSmall}>{copy(c.note)}</Text>
          </View>
        ))}
        shown={
          lastCard && lastRight !== null ? (
            <PopIn key={`v${picks.length}`}>
              <View style={styles.verdictRow}>
                <Text
                  style={[
                    styles.verdictHead,
                    { color: lastRight ? colors.success : colors.warning },
                  ]}
                >
                  {`${lastRight ? '✓ Right' : '✕ Not this one'} · card ${picks.length}`}
                </Text>
                <Text style={styles.verdictSmall}>{copy(lastCard.note)}</Text>
              </View>
            </PopIn>
          ) : null
        }
      />
      <View style={styles.deckButtons}>
        <Pressable
          accessibilityRole="button"
          onPress={() => answer('pass')}
          style={[styles.deckButton, styles.pass]}
        >
          <Text style={styles.deckButtonText}>Pass</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => answer('take')}
          style={[styles.deckButton, styles.take]}
        >
          <Text style={styles.deckButtonText}>Take it</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** docs/ui/04-question-types.md §4.2 `compare` — two or three charts, pick the one that matches. */
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
      <View style={styles.zone}>
        <View style={styles.compareRow}>
          {screen.charts.map((chart, i) => {
            const id = chart.label ?? String(i);
            return (
              <ToneSurface
                key={id}
                tone={toneFor(id) as any}
                disabled={revealed}
                onPress={() => {
                  onChange({ kind: 'target', id: picked === id ? null : id });
                }}
                style={styles.compareCard}
              >
                {/* Taller than a deck card's strip: the difference between the two is
                  the whole question, and the screen has the room. */}
                <MiniChart spec={chart} width={chartWidth - 12} height={cols > 2 ? 150 : 180} />
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
              onChange({ kind: 'target', id: picked === 'neither' ? null : 'neither' });
            }}
            style={styles.neither}
          >
            <Text style={styles.neitherText}>Neither</Text>
          </ToneSurface>
        ) : null}
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.md },
  zone: { gap: space.md },
  pips: { flexDirection: 'row', gap: space.sm, justifyContent: 'center', alignItems: 'center' },
  pip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipAhead: { borderWidth: 1.5, borderColor: colors.borderStrong },
  pipMark: { fontSize: 13, lineHeight: 16, fontWeight: '800', color: colors.background },
  verdictRow: { alignItems: 'center', gap: 2 },
  verdictHead: { ...type.label },
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
  verdictSmall: { ...type.small, color: colors.textMuted, textAlign: 'center' },
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
}));
