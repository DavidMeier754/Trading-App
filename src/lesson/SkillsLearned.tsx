import React, { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';

import Icon from '../home/icons';
import type { Skill } from '../skills';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import { Arrive } from './Celebrate';
import { tapFeedback } from './feedback';
import { TermsContext } from './termText';

/** How long the chips take to arrive, all of them: a lesson can bring ten words. */
const ARRIVE_SPAN_MS = 600;

/**
 * docs/UI.md §5.3 [DESIGN-REVIEW] (David, 2026-10-03): after a lesson that
 * taught something new, "a small overview of what he has learned" -- before
 * lesson complete. Each new skill is a chip, so even a lesson's ten new words
 * fit on one screen; a tap opens the card that taught it (the same sheet as a
 * marked term). Back home they fly into the Practice tab.
 *
 * Names only, for now: a one-line meaning per skill needs the glossary's
 * sentences (stage GLOSSARY); a lesson card's sentence torn out of its place
 * ("That's a profit.") explains nothing.
 */
export default function SkillsLearned({ skills }: { skills: Skill[] }) {
  const { onOpen } = useContext(TermsContext);
  const step = Math.min(90, ARRIVE_SPAN_MS / Math.max(1, skills.length));
  const words = skills.filter((s) => s.kind === 'term').length;
  const techniques = skills.length - words;
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
      <View style={styles.chips}>
        {skills.map((skill, i) => (
          <Arrive key={skill.id} delay={160 + i * step}>
            <Pressable
              onPress={() => {
                tapFeedback();
                onOpen(skill.id);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${skill.kind === 'term' ? 'Word' : 'Technique'}: ${skill.name}`}
              accessibilityHint="Opens the card that taught it"
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            >
              <Icon
                name={skill.kind === 'term' ? 'book' : 'bulb'}
                size={16}
                color={colors.accent}
              />
              <Text style={styles.name} numberOfLines={1}>
                {skill.name}
              </Text>
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
  name: { ...type.answer, color: colors.text },
  note: { ...type.small, fontSize: 13, color: colors.textMuted },
}));
