import React, { useEffect } from 'react';
import { BackHandler, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { copy } from '../format';
import { definitionOf, lessonOf, SKILL_BY_ID } from '../skills';
import { colors, radius, space, type, themed } from '../theme';
import SkillCardView from './SkillCardView';

export { TermsContext, TermText, type ScreenTerms } from './termText';

/**
 * The sheet a marked term opens (docs/UI.md §8): the term, its sentence from
 * the glossary once it exists, where it was taught, and the card that taught
 * it. Closing it returns to the screen exactly as it was.
 */
export function TermSheet({
  skillId,
  onClose,
  closeLabel = 'Back to the lesson',
}: {
  skillId: string | null;
  onClose: () => void;
  /** The key's words: back to where the sheet was opened from. */
  closeLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const skill = skillId ? SKILL_BY_ID.get(skillId) : undefined;
  useEffect(() => {
    if (!skillId) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [skillId, onClose]);
  if (!skill) return null;
  const definition = skill.kind === 'term' ? definitionOf(skill.name) : null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(140)}
        style={styles.scrim}
      >
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.duration(280)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}
      >
        <View style={styles.grab} />
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.kicker}>{skill.kind === 'term' ? 'Term' : 'Skill'}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {skill.name}
          </Text>
          {definition ? <Text style={styles.definition}>{copy(definition)}</Text> : null}
          <Text style={styles.where}>{`Taught in ${skill.where}`}</Text>
          <SkillCardView skill={skill} entry={lessonOf(skill)} />
        </ScrollView>
        <Pressable testID="key" accessibilityRole="button" onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>{closeLabel}</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = themed(() => ({
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '86%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.md,
  },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  body: { gap: space.sm, paddingBottom: space.sm },
  kicker: { ...type.label, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...type.title, color: colors.text },
  definition: { ...type.body, color: colors.text },
  where: { ...type.small, fontSize: 13, color: colors.textMuted },
  close: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { ...type.answer, color: colors.text },
}));
