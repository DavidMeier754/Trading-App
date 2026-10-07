import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import MiniChart from '../components/MiniChart';
import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { PopIn } from '../lesson/Celebrate';
import { detentFeedback, matchHitFeedback, matchMissFeedback } from '../lesson/feedback';
import { fitScale } from '../lesson/fitState';
import { useLookSpec } from '../lesson/look';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import type { CompareScreen as Compare, SwipeDeckScreen as SwipeDeck } from '../types';
import { Prompt, Stack, ToneSurface } from './common';

/**
 * docs/ui/04-question-types.md §4.2 `swipe-deck` — a deck of mini-charts, one at a time, with a
 * one-line verdict as each flies off and a run strip at the end. Never timed.
 *
 * [LOOK-COMPONENTS] The card is swiped: it follows the finger sideways,
 * leaning as it goes, and the word it will mean -- "Take it" to the right,
 * "Pass" to the left -- comes up on it. Let go past a third of its width (or
 * flicked) and it flies off that way and counts as that call; short of it, it
 * springs back. The buttons underneath stay: §10's tap-only path.
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
      <SwipeCard key={index} width={width} onSwipe={answer}>
        <MiniChart spec={card.chart} width={width} height={180} />
      </SwipeCard>
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

/** How far a card must travel, as a share of its width, to count as a swipe. */
const SWIPE_AT = 0.33;
/** A flick this fast (points a second) counts however short it was. */
const FLICK = 900;

/**
 * One card of the deck under the finger. Only the learner moves it: it holds
 * still until dragged, follows the finger, and either flies off the side it
 * was swiped to or springs back to where it was.
 */
function SwipeCard({
  width,
  onSwipe,
  children,
}: {
  width: number;
  onSwipe: (pick: 'take' | 'pass') => void;
  children: React.ReactNode;
}) {
  const x = useSharedValue(0);
  const gone = useSharedValue(0);
  const commit = useCallback((pick: 'take' | 'pass') => onSwipe(pick), [onSwipe]);
  const tick = useCallback(() => detentFeedback(), []);

  const pan = Gesture.Pan()
    // Sideways only: an up-and-down drag is left to the screen.
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onStart(() => {
      scheduleOnRN(tick);
    })
    .onUpdate((e) => {
      if (gone.get()) return;
      x.set(e.translationX / fitScale.get());
    })
    .onEnd((e) => {
      if (gone.get()) return;
      const dx = x.get();
      const far = Math.abs(dx) > width * SWIPE_AT;
      const flick = Math.abs(e.velocityX) > FLICK && Math.sign(e.velocityX) === Math.sign(dx);
      if (far || flick) {
        const dir = dx > 0 ? 1 : -1;
        gone.set(1);
        x.set(
          withTiming(dir * width * 1.3, { duration: 200 }, (finished) => {
            if (finished) scheduleOnRN(commit, dir > 0 ? 'take' : 'pass');
          }),
        );
      } else {
        x.set(withSpring(0, { duration: 380, dampingRatio: 0.8 }));
      }
    });

  const card = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.get() },
      { rotate: `${interpolate(x.get(), [-width, width], [-8, 8])}deg` },
    ],
  }));
  const takeWord = useAnimatedStyle(() => ({
    opacity: interpolate(x.get(), [0, width * SWIPE_AT], [0, 1], 'clamp'),
  }));
  const passWord = useAnimatedStyle(() => ({
    opacity: interpolate(x.get(), [-width * SWIPE_AT, 0], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={card} accessibilityHint="Swipe right to take it, left to pass">
        {children}
        <Animated.View pointerEvents="none" style={[styles.swipeWord, styles.swipeTake, takeWord]}>
          <Text style={[styles.swipeWordText, { color: colors.success }]}>Take it</Text>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.swipeWord, styles.swipePass, passWord]}>
          <Text style={[styles.swipeWordText, { color: colors.down }]}>Pass</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
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
  swipeWord: {
    position: 'absolute',
    top: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  swipeTake: { left: space.sm, borderColor: colors.success },
  swipePass: { right: space.sm, borderColor: colors.down },
  swipeWordText: { ...type.label, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
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
