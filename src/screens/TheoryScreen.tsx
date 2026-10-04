import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import Visual from '../components/Visual';
import { copy } from '../format';
import { detentFeedback } from '../lesson/feedback';
import { TermText } from '../lesson/termText';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, space, themed, type } from '../theme';
import type { TheoryScreen as S } from '../types';
import { ScreenTitle } from './common';

/** How often the writing moves on, and by how many letters: about 65 a second. */
const TYPE_TICK = 30;
const TYPE_STEP = 2;
/** A key's click every this many letters, not every one. */
const CLICK_EVERY = 6;

/**
 * docs/UI.md §3 `theory`: title + body (max 3 lines) + optional visual.
 *
 * [DESIGN-REVIEW] "Theory typed out like a terminal" (David's pick of
 * 2026-10-04, an exception to "nothing moves unless the learner moved it",
 * §1): the body writes itself out behind a block caret, quickly, with a soft
 * click every few letters. The words still to come are laid out from the
 * start, so the card never grows as it types; a tap on the text shows it all
 * at once, and Continue works at any moment. Under reduced motion the body is
 * there at once. The title stays in the title face, set at once.
 */
export default function TheoryScreen({ screen, width }: { screen: S; width: number }) {
  const reduced = useReduceMotion();
  const length = copy(screen.body).length;
  const [typed, setTyped] = useState(reduced ? length : 0);
  const done = typed >= length;

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => {
      const next = Math.min(length, typed + TYPE_STEP);
      if (Math.floor(next / CLICK_EVERY) > Math.floor(typed / CLICK_EVERY)) detentFeedback();
      setTyped(next);
    }, TYPE_TICK);
    return () => clearTimeout(timer);
  }, [typed, done, length]);

  return (
    <View style={styles.wrap}>
      {screen.visual ? (
        <Visual component={screen.visual} data={screen.visual_data} width={width} />
      ) : null}
      <View style={styles.text}>
        <ScreenTitle>{screen.title}</ScreenTitle>
        <Pressable
          disabled={done}
          accessibilityHint={done ? undefined : 'Shows it all'}
          onPress={() => setTyped(length)}
        >
          <TermText text={screen.body} style={styles.body} typed={done ? undefined : typed} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = themed(() => ({
  // docs/UI.md §2: visual above text.
  wrap: { gap: space.xl },
  text: { gap: space.md },
  body: { ...type.body, color: colors.textMuted },
}));
