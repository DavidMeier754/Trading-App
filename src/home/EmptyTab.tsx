import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, space, type } from '../theme';
import Icon, { IconName } from './icons';

/** A tab that is on the bar but not built yet: Practice and Leaderboard, for now. */
export default function EmptyTab({
  title,
  icon,
  line,
}: {
  title: string;
  icon: IconName;
  line: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + space.lg }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.center}>
        <View style={styles.badge}>
          <Icon name={icon} size={40} color={colors.textFaint} />
        </View>
        <Text style={styles.soon}>Coming soon</Text>
        <Text style={styles.line}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space.lg },
  title: { ...type.display, color: colors.text },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingBottom: 60,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  soon: { ...type.prompt, color: colors.text },
  line: { ...type.body, color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
});
