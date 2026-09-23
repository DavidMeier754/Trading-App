import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonEntry } from './content';
import { tapFeedback } from './lesson/feedback';
import { setHapticsEnabled, useHapticsEnabled } from './lesson/haptics';
import { setSoundEnabled, useSoundEnabled } from './lesson/sound';
import {
  MotionSetting,
  setMotionSetting,
  useMotionSetting,
} from './lesson/useReduceMotion';
import { colors, radius, space, type } from './theme';

const MOTION_OPTIONS: { id: MotionSetting; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'full', label: 'Full' },
  { id: 'reduced', label: 'Reduced' },
];

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
  const motion = useMotionSetting();
  const sound = useSoundEnabled();
  const haptics = useHapticsEnabled();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl }]}>
      <Text style={styles.title}>Pick a lesson</Text>
      <View style={styles.list}>
        {lessons.map((entry) => (
          <Pressable
            accessibilityRole="button"
            key={entry.id}
            onPressIn={tapFeedback}
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

      {/* docs/UI.md §10 follows the OS setting; the app has no Settings screen
          yet, and the reduced-motion branches are the least-played paths in it.
          Forcing either side from here is how they get looked at. */}
      <View style={styles.motionRow}>
        <Text style={styles.motionLabel}>Motion</Text>
        {MOTION_OPTIONS.map((option) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: motion === option.id }}
            key={option.id}
            onPress={() => setMotionSetting(option.id)}
            hitSlop={6}
            style={[styles.motionChip, motion === option.id && styles.motionChipOn]}
          >
            <Text
              style={[
                styles.motionChipText,
                motion === option.id && styles.motionChipTextOn,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* docs/UI.md §10 gives sounds and haptics a toggle each; there is no
          Settings screen yet, so they sit here beside the motion one. */}
      <OnOff label="Sound" value={sound} onChange={setSoundEnabled} />
      <OnOff label="Haptics" value={haptics} onChange={setHapticsEnabled} />
    </View>
  );
}

function OnOff({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.motionRow}>
      <Text style={styles.motionLabel}>{label}</Text>
      {[
        { on: true, text: 'On' },
        { on: false, text: 'Off' },
      ].map((option) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: value === option.on }}
          key={option.text}
          onPress={() => onChange(option.on)}
          hitSlop={6}
          style={[styles.motionChip, value === option.on && styles.motionChipOn]}
        >
          <Text style={[styles.motionChipText, value === option.on && styles.motionChipTextOn]}>
            {option.text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
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
  motionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  motionLabel: { ...type.small, color: colors.textFaint, marginRight: space.xs },
  motionChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  motionChipOn: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  motionChipText: { ...type.small, color: colors.textMuted },
  motionChipTextOn: { color: colors.text },
});
