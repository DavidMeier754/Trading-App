import React from 'react';
import { Text, View } from 'react-native';

import { copy } from '../format';
import { Arrive } from '../lesson/Celebrate';
import { colors, space, type, themed } from '../theme';
import type { IntroScreen as S } from '../types';

/** docs/UI.md §3 `intro`: big headline, optional subline. */
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
      {/* The first screen of a lesson arrives in beats: where you are, what
          this is, which lesson. */}
      <Arrive delay={80}>
        <Text style={styles.kicker}>{copy(chapterTitle)}</Text>
      </Arrive>
      <Arrive delay={200}>
        <Text style={styles.headline}>{copy(screen.text)}</Text>
      </Arrive>
      <Arrive delay={330}>
        <Text style={styles.subline}>{copy(levelTitle)}</Text>
      </Arrive>
      {screen.counter !== undefined ? (
        <Arrive delay={440}>
          <Text style={styles.counter}>{`0/${screen.counter}`}</Text>
        </Arrive>
      ) : null}
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.md },
  kicker: {
    ...type.label,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: { ...type.display, fontSize: 32, lineHeight: 40, color: colors.text },
  subline: { ...type.body, color: colors.textMuted },
  counter: { ...type.title, color: colors.textMuted, marginTop: space.lg },
}));
