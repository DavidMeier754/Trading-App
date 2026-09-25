import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { AnswerValue } from '../lesson/answers';
import { correctOptionIndex } from '../lesson/answers';
import type { Tone } from '../lesson/toneTransition';
import { space } from '../theme';
import type { McScreen as Mc, NumericMcScreen as NumMc } from '../types';
import { AnswerCard, Prompt } from './common';

/** docs/UI.md §4.1 `mc` and `numeric-mc`: 2-4 answer cards, single select. */
export default function McScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: Mc | NumMc;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const selected = value.kind === 'option' ? value.index : null;
  const correct = correctOptionIndex(screen.options);

  const toneFor = (i: number): Tone => {
    if (!revealed) return selected === i ? 'selected' : 'idle';
    if (i === correct) return 'correct';
    if (i === selected) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <View style={styles.options}>
        {screen.options.map((option, i) => (
          <AnswerCard
            key={`${option.text}-${i}`}
            label={option.text}
            tone={toneFor(i)}
            disabled={revealed}
            onPress={() => {
              // A choice, not an answer yet: Check commits it (lesson/answers.ts),
              // so a second tap on the same one takes it back.
              onChange({ kind: 'option', index: selected === i ? null : i });
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xl },
  options: { gap: space.md },
});
