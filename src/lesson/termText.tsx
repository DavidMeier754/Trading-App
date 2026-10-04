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
 *
 * `typed` (docs/UI.md §3 `theory` [DESIGN-REVIEW], "Theory typed out like a
 * terminal"): only the first `typed` characters are drawn, the next one wears
 * the caret, and the rest is laid out but clear, so the text takes its full
 * room from the start and nothing moves as it types.
 */
export function TermText({
  text,
  style,
  typed,
}: {
  text: string;
  style: TextStyle | TextStyle[];
  typed?: number;
}) {
  const { ids, onOpen } = useContext(TermsContext);
  const shown = copy(text);
  // Each marked term at its first place in the text, in reading order.
  const hits = ids
    .map((id) => SKILL_BY_ID.get(id))
    .filter((s): s is Skill => !!s)
    .map((skill) => ({ skill, at: findTerm(shown, skill.name) }))
    .filter((h): h is { skill: Skill; at: { index: number; length: number } } => h.at !== null)
    .sort((a, b) => a.at.index - b.at.index);
  // The text in runs: plain, or a term.
  const runs: { text: string; skill?: Skill }[] = [];
  let from = 0;
  for (const { skill, at } of hits) {
    if (at.index < from) continue;
    runs.push({ text: shown.slice(from, at.index) });
    runs.push({ text: shown.slice(at.index, at.index + at.length), skill });
    from = at.index + at.length;
  }
  runs.push({ text: shown.slice(from) });
  const writing = typed !== undefined && typed < shown.length;
  if (!writing && hits.length === 0) return <Text style={style}>{shown}</Text>;

  const term = (skill: Skill, part: string, key: string) => (
    <Text
      key={key}
      style={styles.term}
      accessibilityRole="button"
      accessibilityHint="Opens what this term means"
      onPress={() => {
        tapFeedback();
        onOpen(skill.id);
      }}
      suppressHighlighting
    >
      {part}
    </Text>
  );
  const parts: React.ReactNode[] = [];
  let at = 0;
  runs.forEach((run, k) => {
    const start = at;
    at += run.text.length;
    if (!run.text) return;
    if (!writing || at <= typed!) {
      parts.push(run.skill ? term(run.skill, run.text, `t${k}`) : run.text);
      return;
    }
    // This run is where the writing has got to, or after it.
    const cut = Math.max(0, typed! - start);
    const seen = run.text.slice(0, cut);
    if (seen) parts.push(run.skill ? term(run.skill, seen, `t${k}`) : seen);
    if (start + cut === typed) {
      parts.push(
        <Text key={`c${k}`} style={[styles.unseen, styles.caret]}>
          {run.text.slice(cut, cut + 1)}
        </Text>,
      );
      parts.push(
        <Text key={`u${k}`} style={styles.unseen}>
          {run.text.slice(cut + 1)}
        </Text>,
      );
    } else {
      parts.push(
        <Text key={`u${k}`} style={styles.unseen}>
          {run.text.slice(cut)}
        </Text>,
      );
    }
  });
  return (
    <Text style={style} accessibilityLabel={writing ? shown : undefined}>
      {parts}
    </Text>
  );
}

const styles = themed(() => ({
  term: {
    color: colors.text,
    backgroundColor: colors.warningTint,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.warning,
  },
  // Laid out, not drawn: the words still to come.
  unseen: { color: 'transparent' },
  // A block caret on the next letter, as a terminal draws it.
  caret: { backgroundColor: colors.accent },
}));
