import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { tilePool } from '../lesson/answers';
import { tapFeedback } from '../lesson/feedback';
import Shake from '../lesson/Shake';
import { useBorderTransition } from '../lesson/toneTransition';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type { FillTilesScreen as S } from '../types';

/**
 * docs/UI.md §4.1 `fill-tiles`: sentence with a blank, letter tiles below
 * (with 2-4 distractor letters), tapped into the blank. The level file carries
 * only the answer word, so the distractor letters are generated (see answers.ts).
 */
export default function FillTilesScreen({
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
  const pool = useMemo(() => tilePool(screen.answer), [screen.answer]);
  const placed = value.kind === 'tiles' ? value.placed : [];
  const [before, after] = copy(screen.sentence).split('___');

  const word = placed.map((i) => pool[i]).join('');
  const isRight = word === screen.answer.toUpperCase();

  const slotColor = !revealed
    ? colors.accent
    : isRight
      ? colors.success
      : colors.down;

  // docs/UI.md §5.1: the blank ramps to its verdict colour over 200 ms.
  const animatedSlot = useBorderTransition(slotColor, revealed);

  const blank = (
    <Animated.View style={[styles.blank, animatedSlot]}>
      <Text style={[styles.blankText, { color: revealed ? slotColor : colors.text }]}>
        {word || ' '}
      </Text>
    </Animated.View>
  );

  // The sentence is laid out word by word so the blank sits inline in the flow
  // instead of being pushed onto a line of its own.
  const words = (chunk: string) => chunk.trim().split(/\s+/).filter(Boolean);

  return (
    <View style={styles.wrap}>
      <View style={styles.sentence}>
        {words(before).map((word, i) => (
          <Text key={`b${i}`} style={styles.sentenceText}>
            {word}
          </Text>
        ))}
        {revealed && !isRight ? <Shake>{blank}</Shake> : blank}
        {words(after).map((word, i) => (
          <Text key={`a${i}`} style={styles.sentenceText}>
            {word}
          </Text>
        ))}
      </View>

      {revealed && !isRight ? (
        <Text style={styles.answerLine}>
          {'Answer: '}
          <Text style={{ color: colors.success }}>{screen.answer}</Text>
        </Text>
      ) : null}

      <View style={styles.tiles}>
        {pool.map((letter, i) => {
          const used = placed.includes(i);
          return (
            <Pressable
              key={`${letter}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={used ? 'Used tile' : `Letter ${letter}`}
              disabled={revealed || used}
              onPress={() => {
                tapFeedback();
                onChange({ kind: 'tiles', placed: [...placed, i] });
              }}
              style={[styles.tile, used && styles.tileUsed]}
            >
              {/* A used tile keeps its footprint but drops the glyph, so the letter
                  is not read out twice or tapped a second time. */}
              <Text style={styles.tileText}>{used ? '' : letter}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={revealed || placed.length === 0}
        onPress={() => {
          tapFeedback();
          onChange({ kind: 'tiles', placed: placed.slice(0, -1) });
        }}
        hitSlop={8}
      >
        <Text
          style={[
            styles.undo,
            (revealed || placed.length === 0) && { color: colors.textFaint },
          ]}
        >
          Undo last letter
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.xl },
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    rowGap: space.sm,
  },
  sentenceText: { ...type.prompt, color: colors.text },
  blank: {
    minWidth: 92,
    minHeight: 40,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  blankText: { ...type.prompt, letterSpacing: 1.5 },
  answerLine: { ...type.body, color: colors.textMuted },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: {
    minWidth: TAP_TARGET,
    minHeight: TAP_TARGET,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileUsed: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  tileText: { ...type.prompt, color: colors.text },
  undo: { ...type.label, color: colors.accent },
});
