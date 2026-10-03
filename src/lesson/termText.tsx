import React, { createContext, useContext } from 'react';
import { Text, TextStyle } from 'react-native';

import { copy } from '../format';
import { findTerm, SKILL_BY_ID, type Skill } from '../skills';
import { colors, themed } from '../theme';
import { tapFeedback } from './feedback';

/**
 * docs/UI.md §8 [DESIGN-REVIEW]: the terms a screen marks, and what a tap on
 * one opens. The lesson player works out which terms each screen marks
 * (skills.ts, markPlan) and provides them here; `TermText` draws them.
 */
export type ScreenTerms = { ids: string[]; onOpen: (skillId: string) => void };

export const TermsContext = createContext<ScreenTerms>({ ids: [], onOpen: () => {} });

/**
 * A text with the screen's marked terms in it: a soft highlighter stroke and a
 * dotted underline under each, the first time it appears, and a tap opens its
 * sheet. Without marked terms it is a plain text.
 */
export function TermText({ text, style }: { text: string; style: TextStyle | TextStyle[] }) {
  const { ids, onOpen } = useContext(TermsContext);
  const shown = copy(text);
  if (ids.length === 0) return <Text style={style}>{shown}</Text>;
  // Each marked term at its first place in the text, in reading order.
  const hits = ids
    .map((id) => SKILL_BY_ID.get(id))
    .filter((s): s is Skill => !!s)
    .map((skill) => ({ skill, at: findTerm(shown, skill.name) }))
    .filter((h): h is { skill: Skill; at: { index: number; length: number } } => h.at !== null)
    .sort((a, b) => a.at.index - b.at.index);
  if (hits.length === 0) return <Text style={style}>{shown}</Text>;
  const parts: React.ReactNode[] = [];
  let from = 0;
  hits.forEach(({ skill, at }, k) => {
    if (at.index < from) return;
    parts.push(shown.slice(from, at.index));
    parts.push(
      <Text
        key={k}
        style={styles.term}
        accessibilityRole="button"
        accessibilityHint="Opens what this term means"
        onPress={() => {
          tapFeedback();
          onOpen(skill.id);
        }}
        suppressHighlighting
      >
        {shown.slice(at.index, at.index + at.length)}
      </Text>,
    );
    from = at.index + at.length;
  });
  parts.push(shown.slice(from));
  return <Text style={style}>{parts}</Text>;
}

const styles = themed(() => ({
  term: {
    color: colors.text,
    backgroundColor: colors.warningTint,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.warning,
  },
}));
