import React, { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';

import Icon from '../home/icons';
import { copy } from '../format';
import type { Skill } from '../skills';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import { Arrive } from './Celebrate';
import { tapFeedback } from './feedback';
import { TermsContext } from './termText';

/** How long the chips take to arrive, all of them: a lesson can bring ten words. */
const ARRIVE_SPAN_MS = 600;
/** Up to this many skills, each is a card with its info line; more are chips. */
const CARDS_UP_TO = 3;

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW] (David, 2026-10-03): after a lesson that
 * taught something new, "a small overview of what he has learned" -- before
 * lesson complete. A tap on a skill opens the card that taught it (the same
 * sheet as a marked term). Back home they fly into the Practice tab.
 *
 * Most lessons teach one to three skills: each is then a card with its one
 * line from content/skills.yaml under the name. A lesson that brings more
 * (1-1's ten words) shows names only, as chips, so they fit on one screen;
 * the line is on the sheet.
 */
export default function SkillsLearned({ skills }: { skills: Skill[] }) {
  const { onOpen } = useContext(TermsContext);
  const step = Math.min(90, ARRIVE_SPAN_MS / Math.max(1, skills.length));
  const words = skills.filter((s) => s.kind === 'term').length;
  const techniques = skills.length - words;
  const cards = skills.length <= CARDS_UP_TO;
  const counted = [
    words ? `${words} new ${words === 1 ? 'word' : 'words'}` : null,
    techniques ? `${techniques} new ${techniques === 1 ? 'technique' : 'techniques'}` : null,
  ]
    .filter(Boolean)
    .join(' and ');
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.kicker}>New skills</Text>
        <Text style={styles.title} accessibilityRole="header">
          What you learned
        </Text>
        <Text style={styles.line}>{`${counted}. Tap one to see its card again.`}</Text>
      </View>
      <View style={cards ? styles.cards : styles.chips}>
        {skills.map((skill, i) => (
          <Arrive key={skill.id} delay={160 + i * step}>
            <Pressable
              onPress={() => {
                tapFeedback();
                onOpen(skill.id);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${skill.kind === 'term' ? 'Word' : 'Technique'}: ${skill.name}${
                cards && skill.info ? `. ${skill.info}` : ''
              }`}
              accessibilityHint="Opens the card that taught it"
              style={({ pressed }) => [
                cards ? styles.card : styles.chip,
                pressed && styles.chipPressed,
              ]}
            >
              <Icon
                name={skill.kind === 'term' ? 'book' : 'bulb'}
                size={16}
                color={colors.accent}
              />
              {cards ? (
                <View style={styles.cardText}>
                  <Text style={styles.name}>{skill.name}</Text>
                  {skill.info ? <Text style={styles.info}>{copy(skill.info)}</Text> : null}
                </View>
              ) : (
                <Text style={styles.name} numberOfLines={1}>
                  {skill.name}
                </Text>
              )}
            </Pressable>
          </Arrive>
        ))}
      </View>
      <Text style={styles.note}>They go to Practice, where you can open each one again.</Text>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.lg },
  head: { gap: space.xs },
  kicker: { ...type.label, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...type.display, color: colors.text },
  line: { ...type.body, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: TAP_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipPressed: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  cards: { gap: space.sm },
  card: {
    minHeight: TAP_TARGET,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  cardText: { flex: 1, gap: space.xs },
  info: { ...type.body, color: colors.textMuted },
  name: { ...type.answer, color: colors.text },
  note: { ...type.small, fontSize: 13, color: colors.textMuted },
}));
