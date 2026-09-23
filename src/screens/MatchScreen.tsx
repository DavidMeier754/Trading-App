import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { Celebrate, PopIn } from '../lesson/Celebrate';
import { matchHitFeedback, matchMissFeedback, tapFeedback } from '../lesson/feedback';
import Shake from '../lesson/Shake';
import { colors, glass, radius, space, TAP_TARGET, type } from '../theme';
import { useLook } from '../lesson/look';
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
 * docs/UI.md §4.1 `match`: tap a term, then a definition. Correct pairs lock green,
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
    [screen.prompt]
  );
  const rightOrder = useMemo(
    () => shuffled(screen.pairs.map((_, i) => i), seed),
    [screen.pairs, seed]
  );

  const [pendingLeft, setPendingLeft] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ left: number; right: number } | null>(null);
  // Per chip, how many times it has bounced back: bumping it wobbles that chip
  // and no other (lesson/Shake.tsx).
  const [bounces, setBounces] = useState<{ left: number[]; right: number[] }>(() => ({
    left: screen.pairs.map(() => 0),
    right: screen.pairs.map(() => 0),
  }));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tapLeft = (i: number) => {
    if (revealed || linked[i] !== undefined) return;
    // Picking a term is a choice like any other: it ticks.
    tapFeedback();
    setPendingLeft((prev) => (prev === i ? null : i));
  };

  // The last pair finishes the screen. There is no Check step, because by this
  // point every pair on screen is already green.

  const tapRight = (rightIndex: number) => {
    if (revealed || pendingLeft === null) return;
    const takenBy = Object.entries(linked).find(([, r]) => r === rightIndex);
    if (takenBy) return;

    if (rightIndex === pendingLeft) {
      // Every pair lands with its own feel, right or wrong, the moment it lands.
      // Each pair on the screen pops a step higher than the last.
      matchHitFeedback(Object.keys(linked).length);
      onChange({
        kind: 'match',
        linked: { ...linked, [pendingLeft]: rightIndex },
        misses,
      });
      setPendingLeft(null);
    } else {
      matchMissFeedback();
      setFlash({ left: pendingLeft, right: rightIndex });
      const missedLeft = pendingLeft;
      setBounces((b) => ({
        left: b.left.map((n, i) => (i === missedLeft ? n + 1 : n)),
        right: b.right.map((n, i) => (i === rightIndex ? n + 1 : n)),
      }));
      onChange({ kind: 'match', linked, misses: misses + 1 });
      // Asymmetric: the red is the system's answer, so it lands at once and
      // is held only briefly; the recovery is the gentle half. 450 ms of hard
      // red followed by a hard cut back was both edges snapping.
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setFlash(null);
        setPendingLeft(null);
      }, 260);
    }
  };

  const idle = useLook() === 'neo' ? [styles.idle, glass] : styles.idle;
  const leftStyle = (i: number) => {
    if (flash?.left === i) return styles.wrong;
    if (linked[i] !== undefined) return styles.locked;
    if (pendingLeft === i) return styles.pending;
    return idle;
  };

  const rightStyle = (i: number) => {
    if (flash?.right === i) return styles.wrong;
    const isLinked = Object.values(linked).includes(i);
    if (isLinked) return styles.locked;
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
                style={[styles.chip, leftStyle(i)]}
              >
                <Text style={styles.term}>{copy(term)}</Text>
                {linked[i] !== undefined ? (
                  <PopIn>
                    <Text style={styles.check}>{'✓'}</Text>
                  </PopIn>
                ) : null}
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
            const chip = (
              <Pressable
                accessibilityRole="button"
                onPress={() => tapRight(i)}
                style={[styles.chip, rightStyle(i)]}
              >
                <Text style={styles.definition}>{copy(screen.pairs[i][1])}</Text>
              </Pressable>
            );
            const isLinked = Object.values(linked).includes(i);
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

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.lg },
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
  check: { ...type.small, color: colors.success },
  hint: { ...type.small, color: colors.textMuted },
});
