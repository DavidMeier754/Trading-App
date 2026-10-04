import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tapFeedback } from '../lesson/feedback';
import { HapticsSetting, setHapticsSetting, useHapticsSetting } from '../lesson/haptics';
import { LOOKS, useChosenLook } from '../lesson/look';
import { usePressFeedback } from '../lesson/motion';
import { setSoundEnabled, useSoundEnabled } from '../lesson/sound';
import { MotionSetting, setMotionSetting, useMotionSetting } from '../lesson/useReduceMotion';
import { PATHS } from '../content';
import { WantSwing } from '../screens/StaticScreens';
import {
  choosePath,
  doneToday,
  heartsNow,
  MAX_HEARTS,
  resetProgress,
  streakDays,
  useProgress,
} from '../progress';
import { TEST_TOOLS } from '../testTools';
import {
  colors,
  radius,
  setColourBlind,
  setThemeMode,
  space,
  themed,
  type,
  useColourBlind,
  useThemeMode,
  type ThemeMode,
  TAP_TARGET,
} from '../theme';
import Icon from './icons';
import { forgetShownPath } from './LevelNode';
import TestingTools from './TestingTools';
import {
  PageHeader,
  pageStyles,
  RowButton,
  rowStyles,
  useBackButton,
  useSlideIn,
} from './pageParts';
import { totalXp } from './pathState';
import type { LessonEntry } from '../content';

/**
 * Settings (docs/ui/16-navigation.md §11.5), opened from Account: the design, which opens
 * full screen on a lesson to be chosen (ChangeDesign.tsx), the theme, the
 * toggles the lesson reads -- haptics, sound, motion -- the path, starting
 * over, and in test builds the testing tools (TestingTools.tsx).
 */
export default function SettingsScreen({
  onBack,
  onOpenDesign,
  onOpenBench,
  onOpenLesson,
  onOpenAnimations,
  onOpenSuggestions,
}: {
  onBack: () => void;
  /** Change design: each look full screen on a lesson (ChangeDesign.tsx). */
  onOpenDesign: () => void;
  /** Test builds: the lesson with every screen type. */
  onOpenBench: () => void;
  onOpenLesson: (entry: LessonEntry) => void;
  /** Test builds: the Animations page. */
  onOpenAnimations: () => void;
  /** Test builds: the Design suggestions page. */
  onOpenSuggestions: () => void;
}) {
  const insets = useSafeAreaInsets();
  const haptics = useHapticsSetting();
  const sound = useSoundEnabled();
  const motion = useMotionSetting();
  const theme = useThemeMode();
  const colourBlind = useColourBlind();
  const look = useChosenLook();
  useBackButton(onBack);
  const enter = useSlideIn();

  return (
    <Animated.View style={[pageStyles.wrap, enter]}>
      <PageHeader title="Settings" top={insets.top} onBack={onBack} />

      <ScrollView
        contentContainerStyle={[pageStyles.content, { paddingBottom: insets.bottom + space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={pageStyles.section}>Design</Text>
        <RowButton
          icon="monitor"
          title="Change design"
          sub={LOOKS[look].name}
          onPress={onOpenDesign}
        />

        <Text style={pageStyles.section}>Appearance</Text>
        <View style={styles.panel}>
          <Segmented<ThemeMode>
            label="Theme"
            value={theme}
            onChange={setThemeMode}
            options={[
              { id: 'system', text: 'System' },
              { id: 'light', text: 'Light' },
              { id: 'dark', text: 'Dark' },
            ]}
          />
          <Segmented<boolean>
            label="Colour-blind colours"
            value={colourBlind}
            onChange={setColourBlind}
            options={[
              { id: false, text: 'Off' },
              { id: true, text: 'On' },
            ]}
          />
        </View>

        <Text style={pageStyles.section}>Feel</Text>
        <View style={styles.panel}>
          <Segmented<HapticsSetting>
            label="Haptics"
            value={haptics}
            onChange={setHapticsSetting}
            options={[
              { id: 'strong', text: 'Strong' },
              { id: 'classic', text: 'Classic' },
              { id: 'off', text: 'Off' },
            ]}
          />
          <Segmented<boolean>
            label="Sound"
            value={sound}
            onChange={setSoundEnabled}
            options={[
              { id: true, text: 'On' },
              { id: false, text: 'Off' },
            ]}
          />
          <Segmented<MotionSetting>
            label="Motion"
            value={motion}
            onChange={setMotionSetting}
            options={[
              { id: 'system', text: 'System' },
              { id: 'full', text: 'Full' },
              { id: 'reduced', text: 'Reduced' },
            ]}
          />
        </View>

        <Text style={pageStyles.section}>Your path</Text>
        <PathRow />

        <Text style={pageStyles.section}>Progress</Text>
        <ResetRow />

        {TEST_TOOLS ? (
          <TestingTools
            onOpenBench={onOpenBench}
            onOpenLesson={onOpenLesson}
            onOpenAnimations={onOpenAnimations}
            onOpenSuggestions={onOpenSuggestions}
          />
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

function Segmented<T>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; text: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.segRow}>
      <Text style={styles.segLabel}>{label}</Text>
      <View style={styles.seg} accessibilityRole="radiogroup">
        {options.map((option) => {
          const on = option.id === value;
          return (
            <Pressable
              key={option.text}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPressIn={on ? undefined : tapFeedback}
              onPress={() => onChange(option.id)}
              style={[styles.segItem, on && styles.segItemOn]}
            >
              <Text style={[styles.segText, on && styles.segTextOn]}>{option.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * docs/ui/16-navigation.md §11.4: the path chosen after Chapter 1, changeable here. Before
 * Chapter 1 is finished there is nothing to change yet, and it says so.
 */
function PathRow() {
  const progress = useProgress();
  const chosen = progress.path;
  return (
    <View style={styles.panel}>
      {chosen ? (
        <View style={styles.seg} accessibilityRole="radiogroup">
          {PATHS.map((p) => {
            const on = p.id === chosen;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on, disabled: !p.written }}
                disabled={!p.written}
                onPressIn={on ? undefined : tapFeedback}
                onPress={() => choosePath(p.id)}
                style={[styles.segItem, on && styles.segItemOn, !p.written && { opacity: 0.45 }]}
              >
                <Text style={[styles.segText, on && styles.segTextOn]} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <Text style={rowStyles.rowSub}>
        {chosen
          ? 'Day Trading and Swing Trading come before the release. Your progress stays when you switch.'
          : 'You choose it after Chapter 1.'}
      </Text>
      <WantSwing />
    </View>
  );
}

/**
 * Starting over. The row says what there is to lose; a press asks once more,
 * in words, with the way out beside the way through -- so a stray tap never
 * wipes the path. The settings on this page are not progress and stay.
 */
function ResetRow() {
  const progress = useProgress();
  const lessons = Object.keys(progress.done).length;
  const xp = totalXp(progress);
  const streak = streakDays(progress);
  const hearts = heartsNow(progress).hearts;
  const empty = lessons === 0 && streak === 0 && doneToday(progress) === 0 && hearts === MAX_HEARTS;
  const [stage, setStage] = useState<'idle' | 'confirm' | 'done'>('idle');
  const press = usePressFeedback(!empty && stage === 'idle', { cue: 'tick' });

  const had = [
    `${lessons} ${lessons === 1 ? 'lesson' : 'lessons'} done`,
    `${xp} XP`,
    streak > 0 ? `${streak}-day streak` : null,
    hearts < MAX_HEARTS ? `${hearts} of ${MAX_HEARTS} hearts` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const cleared = [
    lessons > 0 ? `${lessons} finished ${lessons === 1 ? 'lesson' : 'lessons'}` : null,
    xp > 0 ? `${xp} XP` : null,
    streak > 0 ? `your ${streak}-day streak` : null,
  ]
    .filter(Boolean)
    .join(', ')
    .replace(/, ([^,]*)$/, ' and $1');
  const refill = hearts < MAX_HEARTS ? 'refills your hearts' : null;
  const lost = cleared
    ? `This clears ${cleared}${refill ? ` and ${refill}` : ''}.`
    : `This ${refill ?? 'starts the path again'}.`;

  const reset = () => {
    resetProgress();
    forgetShownPath();
    setStage('done');
  };

  const confirming = stage === 'confirm';
  return (
    <Animated.View style={[styles.resetCard, confirming && styles.resetCardArmed, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: empty || confirming }}
        disabled={empty || confirming}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={() => setStage('confirm')}
        style={styles.resetHead}
      >
        <View
          style={[
            rowStyles.rowIcon,
            { backgroundColor: empty ? colors.surfaceAlt : colors.downTint },
          ]}
        >
          <Icon name="reset" size={22} color={empty ? colors.textFaint : colors.down} />
        </View>
        <View style={rowStyles.rowText}>
          <Text style={[rowStyles.rowTitle, { color: empty ? colors.textMuted : colors.down }]}>
            {confirming ? 'Start over from Level 1?' : 'Reset progress'}
          </Text>
          <Text style={rowStyles.rowSub}>
            {confirming
              ? `${lost} Your settings stay.`
              : stage === 'done'
                ? 'Done. You start again at Level 1.'
                : empty
                  ? 'Nothing to reset yet.'
                  : had}
          </Text>
        </View>
      </Pressable>
      {confirming ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.confirmRow}>
          <Pressable
            accessibilityRole="button"
            onPressIn={tapFeedback}
            onPress={() => setStage('idle')}
            style={[styles.confirmButton, styles.keepButton]}
          >
            <Text style={styles.keepText}>Keep progress</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPressIn={tapFeedback}
            onPress={reset}
            style={[styles.confirmButton, styles.resetButton]}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = themed(() => ({
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  segRow: { gap: 6 },
  segLabel: { ...type.label, color: colors.textMuted },
  seg: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  segItem: {
    flex: 1,
    minHeight: TAP_TARGET,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segItemOn: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.accent },
  segText: { ...type.label, color: colors.textMuted },
  segTextOn: { color: colors.text },

  resetCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  resetCardArmed: { borderColor: colors.down },
  resetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  confirmButton: {
    flex: 1,
    height: TAP_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  keepText: { ...type.prompt, fontSize: 16, color: colors.text },
  resetButton: { backgroundColor: colors.dangerFill },
  resetText: { ...type.prompt, fontSize: 16, color: colors.accentText },
}));
