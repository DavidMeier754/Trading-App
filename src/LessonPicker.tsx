import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonEntry } from './content';
import { colors, radius, space, type } from './theme';

/**
 * Not part of the app: the lesson player proper has no home screen. This exists
 * so the real lesson and the renderer test bench are both reachable from one
 * build while the screen types are being reviewed.
 */
export default function LessonPicker({
  lessons,
  onPick,
}: {
  lessons: LessonEntry[];
  onPick: (entry: LessonEntry) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl }]}>
      <Text style={styles.title}>Pick a lesson</Text>
      <View style={styles.list}>
        {lessons.map((entry) => (
          <Pressable
            key={entry.id}
            onPress={() => onPick(entry)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.cardTitle}>{entry.title}</Text>
            <Text style={styles.cardSub}>{entry.subtitle}</Text>
            <Text style={styles.cardMeta}>
              {`${entry.level.screens.length} screens`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: space.lg,
    gap: space.lg,
    justifyContent: 'center',
  },
  title: { ...type.display, color: colors.text },
  list: { gap: space.md },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: 4,
  },
  cardTitle: { ...type.title, color: colors.text },
  cardSub: { ...type.body, color: colors.textMuted },
  cardMeta: { ...type.small, color: colors.accent },
});
