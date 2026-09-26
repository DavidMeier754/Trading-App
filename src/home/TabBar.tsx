import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { detentFeedback } from '../lesson/feedback';
import { colors, type } from '../theme';
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
export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (next: Tab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      accessibilityRole="tablist"
    >
      {TABS.map((item) => {
        const on = item.id === tab;
        const color = on ? colors.accent : colors.textFaint;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={item.label}
            onPressIn={on ? undefined : detentFeedback}
            onPress={() => onChange(item.id)}
            style={styles.item}
          >
            <View style={[styles.mark, on && { backgroundColor: colors.accent }]} />
            <Icon name={item.icon} size={24} color={color} filled={on} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { flex: 1, alignItems: 'center', paddingTop: 6, paddingBottom: 2, gap: 2, minHeight: 52 },
  // A short bar over the open tab, flush with the top edge.
  mark: { width: 28, height: 3, borderRadius: 2, marginTop: -6, marginBottom: 5 },
  label: { ...type.small, fontSize: 11 },
});
