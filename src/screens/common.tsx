import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { copy } from '../format';
import { Celebrate, PopIn } from '../lesson/Celebrate';
import Shake from '../lesson/Shake';
import { usePressFeedback } from '../lesson/motion';
import { Tone, useToneTransition } from '../lesson/toneTransition';
import { useVerdict } from '../lesson/verdict';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import { surfaceStyle, useLookSpec } from '../lesson/look';

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
 * A tappable answer surface: ticks on press-in, ramps to its verdict colour
 * (docs/UI.md §5.1), wobbles when the verdict is wrong, and rings out when the
 * learner got it right -- only then: after a wrong pick the right option turns
 * green too, and it does not get the celebration the learner did not earn.
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
  const verdict = useVerdict();
  const spec = useLookSpec();
  const shape = {
    borderRadius: spec.surface.radius,
    borderWidth: spec.surface.borderWidth,
    ...(spec.surface.edge ? { borderBottomWidth: spec.surface.edge } : null),
    ...(spec.surface.borderTop && tone === 'idle' ? { borderTopColor: spec.surface.borderTop } : null),
  };

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
      <Animated.View style={[styles.surface, shape, style, animated, press.style]}>
        {children}
      </Animated.View>
    </Pressable>
  );

  if (tone === 'wrong') return <Shake>{surface}</Shake>;
  if (tone === 'correct' && verdict?.grade === 'correct') {
    return <Celebrate radius={spec.surface.radius}>{surface}</Celebrate>;
  }
  return surface;
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
      {tone === 'correct' ? (
        <PopIn delay={60}>
          <Text style={styles.markCorrect}>{'✓'}</Text>
        </PopIn>
      ) : null}
      {tone === 'wrong' ? (
        <PopIn>
          <Text style={styles.markWrong}>{'✕'}</Text>
        </PopIn>
      ) : null}
    </ToneSurface>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const spec = useLookSpec();
  return <View style={[styles.card, surfaceStyle(spec), style]}>{children}</View>;
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
