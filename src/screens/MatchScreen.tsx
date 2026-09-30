import React, { useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { Celebrate } from '../lesson/Celebrate';
import { matchHitFeedback, matchMissFeedback, tapFeedback } from '../lesson/feedback';
import Shake from '../lesson/Shake';
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

/**
 * docs/UI.md §4.1 `match`: tap a term and a definition, either first. Correct pairs lock green,
 * wrong pairs flash red and reset. Drag is the alternative the doc also allows;
 * §10 requires the tap-tap path, which is what this builds.
 *
 * The doc draws a connecting line between the two columns; this build marks the
 * locked pair with a shared colour and a check instead (see report).
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

  const pair = (left: number, right: number) => {
    setPendingLeft(null);
    setPendingRight(null);
    if (left === right) {
      // Every pair lands with its own feel the moment it lands, each a step
      // higher than the last.
      matchHitFeedback(Object.keys(linked).length);
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
      <View style={styles.columns}>
        <View style={styles.leftCol}>
          {screen.pairs.map(([term], i) => {
            const chip = (
              <Pressable
                accessibilityRole="button"
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
                {linked[i] !== undefined ? <Celebrate rings={1}>{chip}</Celebrate> : chip}
              </Shake>
            );
          })}
        </View>
        <View style={styles.rightCol}>
          {rightOrder.map((i) => {
            const isLinked = isRightLinked(i);
            const chip = (
              <Pressable
                accessibilityRole="button"
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
                {isLinked ? <Celebrate rings={1}>{chip}</Celebrate> : chip}
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
  );
}

const styles = themed(() => ({
  wrap: { gap: space.lg },
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
