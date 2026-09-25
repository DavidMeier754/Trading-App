import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePressFeedback } from '../lesson/motion';
import { colors, radius, space, type } from '../theme';
import Icon from './icons';

/**
 * The Account tab. The profile and stats (docs/UI.md §7.4) are still to come;
 * for now it is where Settings opens from.
 */
export default function AccountScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  const insets = useSafeAreaInsets();
  const press = usePressFeedback(true, { cue: 'tick' });
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + space.lg }]}>
      <Text style={styles.title}>Account</Text>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Icon name="account" size={34} color={colors.accent} filled />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>Your profile</Text>
          <Text style={styles.sub}>Stats and your Trader Card will live here.</Text>
        </View>
      </View>

      <Animated.View style={press.style}>
        <Pressable
          accessibilityRole="button"
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          onPress={onOpenSettings}
          style={styles.row}
        >
          <Icon name="gear" size={22} color={colors.text} />
          <Text style={styles.rowText}>Settings</Text>
          <Icon name="next" size={20} color={colors.textFaint} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space.lg, gap: space.lg },
  title: { ...type.display, color: colors.text },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { flex: 1, gap: 2 },
  name: { ...type.prompt, color: colors.text },
  sub: { ...type.small, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 56,
    paddingHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  rowText: { ...type.prompt, color: colors.text, flex: 1 },
});
