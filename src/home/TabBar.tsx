import React, { useEffect } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EASE_OUT, SPRING_POP } from '../lesson/motion';
import { detentFeedback } from '../lesson/feedback';
import { colors, type, themed } from '../theme';
import Icon, { IconName } from './icons';

export type Tab = 'learn' | 'practice' | 'leaderboard' | 'account';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'learn', label: 'Learn', icon: 'learn' },
  { id: 'practice', label: 'Practice', icon: 'practice' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { id: 'account', label: 'Account', icon: 'account' },
];

/**
 * The bar along the bottom. Tabs are peers, so switching is instant -- no
 * slide, no fade -- and the touch gets the lightest cue there is: this is
 * pressed dozens of times a session.
 */
export default function TabBar({
  tab,
  onChange,
  dots = {},
  bumps = 0,
  onLayout,
}: {
  tab: Tab;
  onChange: (next: Tab) => void;
  /** docs/UI.md §5.3 [DESIGN-REVIEW]: a tab with something new waiting (Practice's new skills). */
  dots?: Partial<Record<Tab, boolean>>;
  /** Practice's icon swells each time this goes up: a skill card landing in it. */
  bumps?: number;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  const insets = useSafeAreaInsets();
  const swell = useSharedValue(1);
  useEffect(() => {
    if (bumps === 0) return;
    swell.set(
      withSequence(withTiming(1.28, { duration: 90, easing: EASE_OUT }), withSpring(1, SPRING_POP)),
    );
  }, [bumps, swell]);
  const swellStyle = useAnimatedStyle(() => ({ transform: [{ scale: swell.get() }] }));
  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      accessibilityRole="tablist"
      onLayout={onLayout}
    >
      {TABS.map((item) => {
        const on = item.id === tab;
        const color = on ? colors.accent : colors.textFaint;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={dots[item.id] ? `${item.label}, something new` : item.label}
            onPressIn={on ? undefined : detentFeedback}
            onPress={() => onChange(item.id)}
            style={styles.item}
          >
            <View style={[styles.mark, on && { backgroundColor: colors.accent }]} />
            <Animated.View style={item.id === 'practice' ? swellStyle : null}>
              <Icon name={item.icon} size={24} color={color} filled={on} />
              {dots[item.id] ? <View style={styles.dot} /> : null}
            </Animated.View>
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = themed(() => ({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { flex: 1, alignItems: 'center', paddingTop: 6, paddingBottom: 2, gap: 2, minHeight: 52 },
  // A short bar over the open tab, flush with the top edge.
  mark: { width: 28, height: 3, borderRadius: 2, marginTop: -6, marginBottom: 5 },
  label: { ...type.small },
  dot: {
    position: 'absolute',
    top: -2,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.down,
    borderWidth: 2,
    borderColor: colors.background,
  },
}));
