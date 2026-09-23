import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonEntry } from './content';
import { Arrive } from './lesson/Celebrate';
import { tapFeedback } from './lesson/feedback';
import { HapticsSetting, setHapticsSetting, useHapticsSetting } from './lesson/haptics';
import { FitScreen } from './lesson/fit';
import { Look, LookFamily, LOOKS, setLook, surfaceStyle, tint, useLook } from './lesson/look';
import { setSoundEnabled, useSoundEnabled } from './lesson/sound';
import {
  MotionSetting,
  setMotionSetting,
  useMotionSetting,
} from './lesson/useReduceMotion';
import { colors, radius, space, type } from './theme';

/**
 * Not part of the app: the lesson player proper has no home screen. This exists
 * so the real lesson and the renderer test bench are both reachable from one
 * build while the screen types are being reviewed -- and, since there is no
 * Settings screen yet (docs/UI.md §11), it is where the settings live that
 * decide how the next lesson looks, sounds and feels.
 */
export default function LessonPicker({
  lessons,
  onPick,
}: {
  lessons: LessonEntry[];
  onPick: (entry: LessonEntry) => void;
}) {
  const insets = useSafeAreaInsets();
  const look = useLook();
  const spec = LOOKS[look];
  const haptics = useHapticsSetting();
  const sound = useSoundEnabled();
  const motion = useMotionSetting();

  // Nothing scrolls here either (lesson/fit.tsx): on a short window the
  // picker scales down to fit rather than hiding its settings below the fold.
  return (
    <View style={[styles.outer, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.md }]}>
    <FitScreen contentStyle={styles.wrap} bottomPad={0}>
      <Arrive>
        <Text style={styles.title}>Pick a lesson</Text>
      </Arrive>
      <View style={styles.list}>
        {lessons.map((entry, i) => (
          <Arrive key={entry.id} delay={80 + i * 70}>
            <Pressable
              accessibilityRole="button"
              onPressIn={tapFeedback}
              onPress={() => onPick(entry)}
              style={({ pressed }) => [
                styles.card,
                surfaceStyle(spec),
                pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
              ]}
            >
              <Text style={styles.cardTitle}>{entry.title}</Text>
              <Text style={styles.cardSub}>{entry.subtitle}</Text>
              <Text style={[styles.cardMeta, { color: spec.accent }]}>
                {`${entry.level.screens.length} screens`}
              </Text>
            </Pressable>
          </Arrive>
        ))}
      </View>

      <Arrive delay={260}>
        <View style={[styles.panel, surfaceStyle(spec)]}>
          <Text style={styles.panelTitle}>Before you start</Text>
          {/* Whole designs, not colour swaps (lesson/look.ts), grouped by the
              idea they vary. The line under the chips says what the picked
              one is. */}
          {FAMILIES.map((family) => (
            <Choice<Look>
              key={family.id}
              label={family.label}
              value={look}
              onChange={setLook}
              accent={spec.accent}
              options={(Object.keys(LOOKS) as Look[])
                .filter((id) => LOOKS[id].family === family.id)
                .map((id) => ({ id, text: LOOKS[id].chip }))}
            />
          ))}
          <Text style={styles.blurb}>{`${spec.name}. ${spec.blurb}`}</Text>
          {/* docs/UI.md §10 gives haptics and sounds a toggle each. Strong is
              the harder, rounder set; Classic is one light tap per beat. */}
          <Choice<HapticsSetting>
            label="Haptics"
            accent={spec.accent}
            value={haptics}
            onChange={setHapticsSetting}
            options={[
              { id: 'strong', text: 'Strong' },
              { id: 'classic', text: 'Classic' },
              { id: 'off', text: 'Off' },
            ]}
          />
          <Choice<boolean>
            label="Sound"
            accent={spec.accent}
            value={sound}
            onChange={setSoundEnabled}
            options={[
              { id: true, text: 'On' },
              { id: false, text: 'Off' },
            ]}
          />
          {/* docs/UI.md §10 follows the OS setting; the reduced-motion branches
              are the least-played paths in the app, and forcing either side
              from here is how they get looked at. */}
          <Choice<MotionSetting>
            label="Motion"
            accent={spec.accent}
            value={motion}
            onChange={setMotionSetting}
            options={[
              { id: 'system', text: 'System' },
              { id: 'full', text: 'Full' },
              { id: 'reduced', text: 'Reduced' },
            ]}
          />
        </View>
      </Arrive>
    </FitScreen>
    </View>
  );
}

const FAMILIES: { id: LookFamily; label: string }[] = [
  { id: 'neo', label: 'Neo' },
  { id: 'classic', label: 'Classic' },
  { id: 'more', label: 'More' },
];

function Choice<T>({
  label,
  value,
  options,
  onChange,
  accent,
}: {
  label: string;
  value: T;
  options: { id: T; text: string }[];
  onChange: (next: T) => void;
  accent: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const on = option.id === value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              key={option.text}
              onPressIn={tapFeedback}
              onPress={() => onChange(option.id)}
              hitSlop={6}
              style={[styles.chip, on && { borderColor: accent, backgroundColor: tint(accent, 0.16) }]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{option.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  wrap: {
    flexGrow: 1,
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
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  blurb: { ...type.small, color: colors.textMuted, marginTop: -space.xs, marginLeft: 62 + space.sm },
  panelTitle: { ...type.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowLabel: { ...type.small, color: colors.textFaint, width: 62 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, flex: 1 },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  chipText: { ...type.small, color: colors.textMuted },
  chipTextOn: { color: colors.text },
});
