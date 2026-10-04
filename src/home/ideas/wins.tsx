import React from 'react';
import { View } from 'react-native';

import LessonComplete from '../../lesson/LessonComplete';
import { SAMPLE_WIN, WIN_DESIGNS, WIN_INFO, type WinDesign } from '../../lesson/wins/data';
import { themed } from '../../theme';
import type { Suggestion } from './kit';

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW] "Win screens" (David, 2026-10-04: "Actually
 * also add another suggestion tab just dedicated to such designs"): every
 * design of the lesson-complete screen, played with a sample lesson. These
 * are the real screens (lesson/wins/), the ones that take turns in the app;
 * new ones are tried here first.
 */
const ICONS: Record<WinDesign, Suggestion['icon']> = {
  ring: 'target',
  receipt: 'ticket',
  board: 'clock',
  candle: 'candles',
  curve: 'trend',
  quote: 'coin',
};

export const WINS: Suggestion[] = WIN_DESIGNS.map((id) => ({
  id: `win-${id}`,
  section: 'wins',
  icon: ICONS[id],
  title: WIN_INFO[id].title,
  line: WIN_INFO[id].line,
  tag: 'app',
  again: 'Play again',
  Preview: () => <WinPreview design={id} />,
}));

function WinPreview({ design }: { design: WinDesign }) {
  return (
    <View style={styles.wrap}>
      <LessonComplete
        screens={[]}
        grades={SAMPLE_WIN.grades}
        levelTitle={SAMPLE_WIN.title}
        xp={SAMPLE_WIN.base}
        daily
        lessonId="level-06-2"
        design={design}
      />
    </View>
  );
}

const styles = themed(() => ({
  wrap: { alignSelf: 'stretch' },
}));
