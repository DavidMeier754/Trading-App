import React, { useCallback, useState } from 'react';
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
    ...(spec.surface.borderTop && tone === 'idle'
      ? { borderTopColor: spec.surface.borderTop }
      : null),
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
      // The Pressable is what sits in a row of chips: capped at the row, so a
      // long label wraps rather than widening the screen.
      style={styles.cap}
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
      {/* The mark's room is kept on every card from the start, so a long
          answer is wrapped the same before and after the check: a mark that
          took its room only when it arrived would push the words onto a new
          line, and every card below down with them. */}
      <View style={styles.markSlot}>
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
      </View>
    </ToneSurface>
  );
}

/**
 * Several versions of one block -- a carousel's cards, a walkthrough's steps --
 * laid out in the same place, so the block is as tall as the tallest of them.
 * Moving to the next one changes what is drawn, never how much room it takes,
 * and nothing below it moves (docs/UI.md §2). The versions not showing are
 * still laid out, invisibly and out of reach, only to be measured.
 */
export function Stack({
  current,
  items,
  shown,
}: {
  current: number;
  /** Every version, plain, for measuring. */
  items: React.ReactNode[];
  /** The one on screen; defaults to `items[current]`. It can carry an entrance. */
  shown?: React.ReactNode;
}) {
  const [heights, setHeights] = useState<number[]>([]);
  const onItem = useCallback((i: number, h: number) => {
    setHeights((prev) => {
      if (Math.abs((prev[i] ?? -1) - h) < 0.5) return prev;
      const next = prev.slice();
      next[i] = h;
      return next;
    });
  }, []);
  const tallest = heights.reduce((m, h) => Math.max(m, h ?? 0), 0);
  return (
    <View style={{ minHeight: tallest }}>
      {items.map((item, i) => (
        <View
          key={i}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          style={styles.stackGhost}
          onLayout={(e) => onItem(i, e.nativeEvent.layout.height)}
        >
          {item}
        </View>
      ))}
      {shown ?? items[current]}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const spec = useLookSpec();
  return <View style={[styles.card, surfaceStyle(spec), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  stackGhost: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
  cap: { maxWidth: '100%' },
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
  markSlot: { width: 18, alignItems: 'center' },
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
