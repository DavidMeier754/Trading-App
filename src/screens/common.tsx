import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { copy } from '../format';
import Shake from '../lesson/Shake';
import { usePressFeedback } from '../lesson/motion';
import { Tone, useToneTransition } from '../lesson/toneTransition';
import { colors, radius, space, TAP_TARGET, type } from '../theme';

export function Prompt({ children }: { children: string }) {
  return <Text style={styles.prompt}>{copy(children)}</Text>;
}

export function ScreenTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{copy(children)}</Text>;
}

export function Body({ children }: { children: string }) {
  return <Text style={styles.body}>{copy(children)}</Text>;
}

/**
 * A tappable answer surface that ramps to its verdict colour over 200 ms
 * (docs/UI.md §5.1) and shakes when the verdict is wrong.
 */
export function ToneSurface({
  tone,
  onPress,
  disabled,
  style,
  accessibilityLabel,
  children,
}: {
  tone: Tone;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  children: React.ReactNode;
}) {
  const animated = useToneTransition(tone);
  const press = usePressFeedback(!disabled);

  const surface = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, selected: tone === 'selected' }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      pressRetentionOffset={16}
    >
      <Animated.View style={[styles.surface, style, animated, press.style]}>
        {children}
      </Animated.View>
    </Pressable>
  );

  return tone === 'wrong' ? <Shake trigger={1}>{surface}</Shake> : surface;
}

/** A single answer card (docs/UI.md §4.1 `mc` / `numeric-mc`). */
export function AnswerCard({
  label,
  tone,
  onPress,
  disabled,
}: {
  label: string;
  tone: Tone;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <ToneSurface tone={tone} onPress={onPress} disabled={disabled} style={styles.answerCard}>
      <Text style={styles.answerText}>{copy(label)}</Text>
      {tone === 'correct' ? <Text style={styles.markCorrect}>{'✓'}</Text> : null}
      {tone === 'wrong' ? <Text style={styles.markWrong}>{'✕'}</Text> : null}
    </ToneSurface>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  prompt: { ...type.prompt, color: colors.text },
  title: { ...type.title, color: colors.text },
  body: { ...type.body, color: colors.textMuted },
  surface: { borderWidth: 1.5, borderRadius: radius.md },
  answerCard: {
    minHeight: TAP_TARGET,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  answerText: { ...type.answer, color: colors.text, flexShrink: 1 },
  markCorrect: { ...type.answer, color: colors.success },
  markWrong: { ...type.answer, color: colors.down },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
  },
});
