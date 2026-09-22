import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Mascot from '../components/Mascot';
import { copy } from '../format';
import { colors, space, type } from '../theme';
import type { IntroScreen as S } from '../types';

/** docs/UI.md §3 `intro`: big headline, optional subline, mascot slot. */
export default function IntroScreen({
  screen,
  levelTitle,
  chapterTitle,
}: {
  screen: S;
  levelTitle: string;
  chapterTitle: string;
}) {
  return (
    <View style={styles.wrap}>
      {/* docs/UI.md §3: headline, optional subline, mascot. Large here, small in
          the reveal slot. */}
      <Mascot size={104} />
      <Text style={styles.kicker}>{copy(chapterTitle)}</Text>
      <Text style={styles.headline}>{copy(screen.text)}</Text>
      <Text style={styles.subline}>{copy(levelTitle)}</Text>
      {screen.counter !== undefined ? (
        <Text style={styles.counter}>{`0/${screen.counter}`}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.md },
  kicker: {
    ...type.label,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: { ...type.display, fontSize: 32, lineHeight: 40, color: colors.text },
  subline: { ...type.body, color: colors.textMuted },
  counter: { ...type.title, color: colors.textMuted, marginTop: space.lg },
});
