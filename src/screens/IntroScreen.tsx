import React from 'react';
import { Text, View } from 'react-native';

import { copy } from '../format';
import { Arrive } from '../lesson/Celebrate';
import { colors, radius, space, type, themed } from '../theme';
import type { IntroScreen as S } from '../types';

/** What a Checkpoint or Final Exam tells before it starts (docs/ui/03-screen-types.md §3 `intro`). */
export type Briefing = {
  kind: 'Checkpoint' | 'Final Exam';
  questions: number;
  /** The pass mark in percent. */
  pass: number;
  /** The hearts the learner takes in, or null where none are spent (the test bench). */
  hearts: number | null;
};

/**
 * docs/ui/03-screen-types.md §3 `intro`: big headline, optional subline. A test's intro is a
 * briefing card instead [DESIGN-REVIEW]: the kind as the kicker, the
 * chapter's name as the title, the intro text as one line, a row of empty
 * pips (one per question), the terms in one row -- questions, pass mark,
 * hearts -- and the file's `facts` (the account numbers) as chips.
 */
export default function IntroScreen({
  screen,
  levelTitle,
  chapterTitle,
  briefing,
}: {
  screen: S;
  levelTitle: string;
  chapterTitle: string;
  briefing?: Briefing;
}) {
  if (briefing) return <BriefingCard screen={screen} chapterTitle={chapterTitle} b={briefing} />;
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

function BriefingCard({
  screen,
  chapterTitle,
  b,
}: {
  screen: S;
  chapterTitle: string;
  b: Briefing;
}) {
  const terms = [
    `${b.questions} questions`,
    `${b.pass} % to pass`,
    b.hearts === null ? null : `${b.hearts} ${b.hearts === 1 ? 'heart' : 'hearts'}`,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <View style={styles.wrap}>
      <Arrive delay={80}>
        <Text style={styles.kicker}>{b.kind}</Text>
      </Arrive>
      <Arrive delay={180}>
        <Text style={styles.headline} accessibilityRole="header">
          {copy(chapterTitle)}
        </Text>
      </Arrive>
      <Arrive delay={280}>
        <Text style={styles.subline}>{copy(screen.text)}</Text>
      </Arrive>
      <Arrive delay={380}>
        <View
          style={styles.pips}
          accessible
          accessibilityLabel={`${b.questions} questions, none answered yet`}
        >
          {Array.from({ length: b.questions }, (_, i) => (
            <View key={i} style={styles.pip} />
          ))}
        </View>
      </Arrive>
      <Arrive delay={460}>
        <Text style={styles.terms}>{terms}</Text>
      </Arrive>
      {screen.facts?.length ? (
        <Arrive delay={540}>
          <View style={styles.facts}>
            {screen.facts.map((f) => (
              <View key={f} style={styles.fact}>
                <Text style={styles.factText}>{copy(f)}</Text>
              </View>
            ))}
          </View>
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
  pips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  pip: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  terms: { ...type.body, color: colors.text, fontWeight: '600' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  fact: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  factText: {
    ...type.small,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
}));
