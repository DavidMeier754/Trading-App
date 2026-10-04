import React from 'react';
import { Text, View } from 'react-native';

import type { AnswerValue } from '../lesson/answers';
import type { Tone } from '../lesson/toneTransition';
import { colors, space, type, themed } from '../theme';
import type { TfScreen as S } from '../types';
import { Card, ToneSurface } from './common';
import { TermText } from '../lesson/termText';

/**
 * docs/UI.md §4.1 `tf`: two large side-by-side buttons, revealed instantly on tap
 * (so this screen has no Check step — the CTA goes straight to "Got it").
 */
export default function TfScreen({
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
  const chosen = value.kind === 'bool' ? value.value : null;

  const toneFor = (option: boolean): Tone => {
    if (!revealed) return chosen === option ? 'selected' : 'idle';
    if (option === screen.answer) return 'correct';
    if (option === chosen) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.wrap}>
      <Card>
        <TermText text={screen.statement} style={styles.statement} />
      </Card>
      <View style={styles.row}>
        {[true, false].map((option) => (
          <View key={String(option)} style={styles.half}>
            <ToneSurface
              tone={toneFor(option)}
              disabled={revealed}
              deep
              onPress={() => {
                // Tapped again, the choice is taken back.
                onChange({ kind: 'bool', value: chosen === option ? null : option });
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{option ? 'True' : 'False'}</Text>
            </ToneSurface>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.xl },
  statement: { ...type.prompt, color: colors.text },
  row: { flexDirection: 'row', gap: space.md },
  half: { flex: 1 },
  button: { height: 92, alignItems: 'center', justifyContent: 'center' },
  buttonText: { ...type.title, color: colors.text },
}));
