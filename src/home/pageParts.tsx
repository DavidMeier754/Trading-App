import React, { useEffect } from 'react';
import { BackHandler, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { tapFeedback } from '../lesson/feedback';
import { EASE_OUT, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import Icon, { type IconName } from './icons';

/**
 * What the pages over the tabs share (docs/UI.md §11.5): Settings, Animations
 * and Design suggestions each arrive from the right, go back with the arrow or
 * Android's back button, and open what they hold from rows.
 */

/** Android's back button goes back, as the arrow does, rather than out of the app. */
export function useBackButton(onBack: () => void): void {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);
}

/** Pushed in from the right, the way a settings page arrives. */
export function useSlideIn() {
  const reduced = useReduceMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withTiming(1, { duration: 260, easing: EASE_OUT }));
  }, [reduced, t]);
  return useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateX: (1 - t.get()) * 28 }],
  }));
}

/** The page's title, with the way back before it; a long one may take two lines. */
export function PageHeader({
  title,
  top,
  onBack,
  lines = 1,
}: {
  title: string;
  top: number;
  onBack: () => void;
  lines?: 1 | 2;
}) {
  return (
    <View style={[styles.header, { paddingTop: top + space.sm }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPressIn={tapFeedback}
        onPress={onBack}
        hitSlop={10}
        style={styles.back}
      >
        <Icon name="back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={lines}>
        {title}
      </Text>
    </View>
  );
}

/** A row that opens something: its icon, what it is, one short line, and a chevron. */
export function RowButton({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: IconName;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  const press = usePressFeedback(true, { cue: 'tick' });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={rowStyles.row}
      >
        <View style={rowStyles.rowIcon}>
          <Icon name={icon} size={22} color={colors.accent} />
        </View>
        <View style={rowStyles.rowText}>
          <Text style={rowStyles.rowTitle}>{title}</Text>
          <Text style={rowStyles.rowSub}>{sub}</Text>
        </View>
        <Icon name="next" size={20} color={colors.textFaint} />
      </Pressable>
    </Animated.View>
  );
}

/** A page's scrolling column, and the small caps over each of its groups. */
export const pageStyles = themed(() => ({
  wrap: { flex: 1 },
  content: { paddingHorizontal: space.lg, gap: space.md },
  section: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: space.md,
  },
}));

export const rowStyles = themed(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...type.answer, color: colors.text, fontWeight: '700' },
  rowSub: { ...type.small, color: colors.textMuted },
}));

const styles = themed(() => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  // A 48 pt target (docs/UI.md §10) laid out as the 36 pt one it replaced.
  back: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    margin: -(TAP_TARGET - 36) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -space.sm - (TAP_TARGET - 36) / 2,
  },
  title: { ...type.title, color: colors.text, flexShrink: 1 },
}));
