import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { Celebrate } from '../lesson/Celebrate';
import {
  matchBoardFeedback,
  matchHitFeedback,
  matchMissFeedback,
  tapFeedback,
} from '../lesson/feedback';
import { EASE_OUT, SPRING_POP } from '../lesson/motion';
import Shake from '../lesson/Shake';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import { surfaceStyle, tint, useLookSpec } from '../lesson/look';
import type { MatchScreen as S } from '../types';
import { Prompt } from './common';

function shuffled<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let cursor = seed;
  for (let i = out.length - 1; i > 0; i--) {
    cursor = (cursor * 1103515245 + 12345) % 2147483648;
    const j = cursor % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** How far a locking pair snaps towards each other, in points. */
const SNAP = 7;
/** A locked pair, once it has landed: a step back, so the open cards stand out. */
const REST_OPACITY = 0.62;
const REST_SCALE = 0.97;
/** The wave after the last pair: one card after the next, row by row. */
const WAVE_STEP_MS = 55;

/**
 * One card's motion on the board (docs/ui/04-question-types.md §4.1, DESIGN-REVIEW: no colour
 * per pair, "just make it fun via the animations and the haptic feedback").
 * When its pair locks it snaps a few points towards its partner and springs
 * back, under the one ring Celebrate sends out; once it has landed it steps
 * back a little. When the last pair locks, every card lifts once in turn, a
 * wave across the board. Reduced motion keeps the step back as a fade and
 * drops the travel.
 */
function MatchCard({
  side,
  locked,
  order,
  board,
  children,
}: {
  side: 'left' | 'right';
  locked: boolean;
  /** Its place in the wave. */
  order: number;
  /** The board is done. */
  board: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReduceMotion();
  const snap = useSharedValue(0);
  const rest = useSharedValue(0);
  const lift = useSharedValue(0);

  // The snap is for the moment the pair locks, not for every render after.
  const wasLocked = useRef(locked);
  useEffect(() => {
    const now = locked && !wasLocked.current;
    wasLocked.current = locked;
    if (!locked) {
      rest.set(0);
      return;
    }
    if (!now) return;
    if (!reduced) {
      snap.set(
        withSequence(withTiming(1, { duration: 90, easing: EASE_OUT }), withSpring(0, SPRING_POP)),
      );
    }
    // The board's last pair does not step back: the wave is its moment.
    if (!board) rest.set(withDelay(520, withTiming(1, { duration: 360 })));
  }, [locked, board, reduced, snap, rest]);

  // Come back to a finished board, it is just there: the wave was its moment.
  const doneAtMount = useRef(board);
  useEffect(() => {
    if (!board || reduced || doneAtMount.current) return;
    rest.set(withTiming(0, { duration: 240 }));
    lift.set(
      withDelay(
        order * WAVE_STEP_MS + 120,
        withSequence(withTiming(1, { duration: 140, easing: EASE_OUT }), withSpring(0, SPRING_POP)),
      ),
    );
  }, [board, reduced, order, lift, rest]);

  const style = useAnimatedStyle(() => {
    const r = rest.get();
    const l = lift.get();
    return {
      opacity: 1 - (1 - REST_OPACITY) * r,
      transform: [
        { translateX: (side === 'left' ? SNAP : -SNAP) * snap.get() },
        { translateY: -5 * l },
        { scale: (1 - (1 - REST_SCALE) * r) * (1 + 0.035 * l) },
      ],
    };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

/**
 * docs/ui/04-question-types.md §4.1 `match`: tap a term and a definition, either first. Correct
 * pairs lock in the one success colour, wrong pairs flash red and reset. Drag
 * is the alternative the doc also allows; §10 requires the tap-tap path, which
 * is what this builds. The fun is in the feel (MatchCard): the snap, the ring,
 * a note a step higher for each pair, and a wave when the board is done.
 */
export default function MatchScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: S;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const linked = value.kind === 'match' ? value.linked : {};
  const misses = value.kind === 'match' ? value.misses : 0;

  const seed = useMemo(
    () => screen.prompt.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 99991, 11),
    [screen.prompt],
  );
  const rightOrder = useMemo(
    () =>
      shuffled(
        screen.pairs.map((_, i) => i),
        seed,
      ),
    [screen.pairs, seed],
  );

  // Either side can be picked first: a definition tapped first waits for its
  // term, just as a term waits for its definition. (A definition tapped first
  // used to do nothing at all -- no highlight and no sound -- which read as
  // the screen not responding.)
  const [pendingLeft, setPendingLeft] = useState<number | null>(null);
  const [pendingRight, setPendingRight] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ left: number; right: number } | null>(null);
  // Per chip, how many times it has bounced back: bumping it wobbles that chip
  // and no other (lesson/Shake.tsx).
  const [bounces, setBounces] = useState<{ left: number[]; right: number[] }>(() => ({
    left: screen.pairs.map(() => 0),
    right: screen.pairs.map(() => 0),
  }));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Every chip is as tall as the tallest one, so the two columns line up row
  // by row and no card stands taller than its neighbour. Only ever grows, so
  // it settles on the first layout and cannot flip back and forth.
  const [tallest, setTallest] = useState(0);
  const measure = (h: number) => setTallest((t) => (h > t + 0.5 ? h : t));

  const isRightLinked = (r: number) => Object.values(linked).includes(r);
  const board = Object.keys(linked).length === screen.pairs.length;

  const pair = (left: number, right: number) => {
    setPendingLeft(null);
    setPendingRight(null);
    if (left === right) {
      // Every pair lands with its own feel the moment it lands, each a step
      // higher than the last; the last one finishes the board, firmer.
      const n = Object.keys(linked).length;
      if (n + 1 === screen.pairs.length) matchBoardFeedback();
      else matchHitFeedback(n);
      onChange({ kind: 'match', linked: { ...linked, [left]: right }, misses });
      return;
    }
    matchMissFeedback();
    setFlash({ left, right });
    setBounces((b) => ({
      left: b.left.map((n, i) => (i === left ? n + 1 : n)),
      right: b.right.map((n, i) => (i === right ? n + 1 : n)),
    }));
    onChange({ kind: 'match', linked, misses: misses + 1 });
    // Asymmetric: the red is the system's answer, so it lands at once and is
    // held only briefly; the recovery is the gentle half.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(null), 260);
  };

  const tapLeft = (i: number) => {
    if (revealed || linked[i] !== undefined) return;
    if (pendingRight !== null) {
      pair(i, pendingRight);
      return;
    }
    // Picking a term is a choice like any other: it ticks.
    tapFeedback();
    setPendingLeft((prev) => (prev === i ? null : i));
  };

  const tapRight = (r: number) => {
    if (revealed || isRightLinked(r)) return;
    if (pendingLeft !== null) {
      pair(pendingLeft, r);
      return;
    }
    tapFeedback();
    setPendingRight((prev) => (prev === r ? null : r));
  };

  const spec = useLookSpec();
  const idle = [styles.idle, surfaceStyle(spec)];
  const shape = { borderRadius: spec.surface.radius };
  const leftStyle = (i: number) => {
    if (flash?.left === i) return styles.wrong;
    if (linked[i] !== undefined) return styles.locked;
    if (pendingLeft === i)
      return { borderColor: spec.accent, backgroundColor: tint(spec.accent, 0.14) };
    return idle;
  };

  const rightStyle = (i: number) => {
    if (flash?.right === i) return styles.wrong;
    if (isRightLinked(i)) return styles.locked;
    if (pendingRight === i)
      return { borderColor: spec.accent, backgroundColor: tint(spec.accent, 0.14) };
    return idle;
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <View style={styles.zone}>
        <View style={styles.columns}>
          <View style={styles.leftCol}>
            {screen.pairs.map(([term], i) => {
              const chip = (
                <Pressable
                  accessibilityRole="button"
                  disabled={linked[i] !== undefined}
                  aria-selected={pendingLeft === i}
                  onPress={() => tapLeft(i)}
                  onLayout={(e) => measure(e.nativeEvent.layout.height)}
                  style={[
                    styles.chip,
                    shape,
                    { minHeight: Math.max(TAP_TARGET, tallest) },
                    leftStyle(i),
                  ]}
                >
                  <Text style={styles.term}>{copy(term)}</Text>
                </Pressable>
              );
              return (
                <Shake key={term} onMount={false} trigger={bounces.left[i]}>
                  <MatchCard
                    side="left"
                    locked={linked[i] !== undefined}
                    order={i * 2}
                    board={board}
                  >
                    {linked[i] !== undefined ? <Celebrate rings={1}>{chip}</Celebrate> : chip}
                  </MatchCard>
                </Shake>
              );
            })}
          </View>
          <View style={styles.rightCol}>
            {rightOrder.map((i, row) => {
              const isLinked = isRightLinked(i);
              const chip = (
                <Pressable
                  accessibilityRole="button"
                  disabled={isLinked}
                  aria-selected={pendingRight === i}
                  onPress={() => tapRight(i)}
                  onLayout={(e) => measure(e.nativeEvent.layout.height)}
                  style={[
                    styles.chip,
                    shape,
                    { minHeight: Math.max(TAP_TARGET, tallest) },
                    rightStyle(i),
                  ]}
                >
                  <Text style={styles.definition}>{copy(screen.pairs[i][1])}</Text>
                </Pressable>
              );
              return (
                <Shake key={screen.pairs[i][1]} onMount={false} trigger={bounces.right[i]}>
                  <MatchCard side="right" locked={isLinked} order={row * 2 + 1} board={board}>
                    {isLinked ? <Celebrate rings={1}>{chip}</Celebrate> : chip}
                  </MatchCard>
                </Shake>
              );
            })}
          </View>
        </View>
        <Text style={styles.hint}>
          {revealed
            ? misses === 0
              ? 'Matched without a miss.'
              : `Matched, after ${misses} wrong ${misses === 1 ? 'tap' : 'taps'}.`
            : `${Object.keys(linked).length}/${screen.pairs.length} matched`}
        </Text>
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.lg },
  zone: { gap: space.lg },
  columns: { flexDirection: 'row', gap: space.sm },
  leftCol: { flex: 4, gap: space.sm },
  rightCol: { flex: 6, gap: space.sm },
  chip: {
    minHeight: TAP_TARGET,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  idle: { borderColor: colors.borderStrong, backgroundColor: colors.surface },
  pending: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  locked: { borderColor: colors.success, backgroundColor: colors.successTint },
  wrong: { borderColor: colors.down, backgroundColor: colors.downTint },
  term: { ...type.answer, color: colors.text, flexShrink: 1 },
  definition: { ...type.small, color: colors.text, flexShrink: 1 },
  hint: { ...type.small, color: colors.textMuted },
}));
