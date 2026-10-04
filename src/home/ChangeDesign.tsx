import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LESSONS } from '../content';
import { AnswerValue, emptyValue } from '../lesson/answers';
import Cta from '../lesson/Cta';
import { detentFeedback } from '../lesson/feedback';
import { FitScreen } from '../lesson/fit';
import { fitScale, fitTop } from '../lesson/fitState';
import HeartMeter from '../lesson/HeartMeter';
import {
  Look,
  LOOK_ORDER,
  LOOKS,
  previewLook,
  setLook,
  useChosenLook,
  useLookSpec,
} from '../lesson/look';
import ProgressBar from '../lesson/ProgressBar';
import { QuitButton } from '../lesson/QuitSheet';
import ComboMeter from '../lesson/ComboMeter';
import { useReduceMotion } from '../lesson/useReduceMotion';
import McScreen from '../screens/McScreen';
import { colors, MONO_FONT, space, TAP_TARGET, type, themed } from '../theme';
import type { QuestionScreen } from '../types';
import Icon from './icons';
import { useBackButton } from './pageParts';

/**
 * The lesson each design is shown on: lesson 1-1 at its first question with a
 * Check key (the profit question), whose key becomes "Use this design".
 */
const LESSON = LESSONS.find((e) => e.id === 'level-01-1') ?? LESSONS[0];
const AT = Math.max(
  0,
  LESSON.level.screens.findIndex((s) => s.type === 'mc' || s.type === 'numeric-mc'),
);
const SCREEN = LESSON.level.screens[AT] as Extract<QuestionScreen, { type: 'mc' | 'numeric-mc' }>;
const STEPS = LESSON.level.screens.length;
/** How far a finger has to travel sideways for a swipe to change the design. */
const SWIPE = 48;

/**
 * Settings → Change design (David, stage LOOK-BRIEF: "a button that shows each
 * of the three looks full screen on a real lesson screen"). The whole screen
 * wears the design shown -- the ground, the lesson's top bar, its answers and
 * its key -- without choosing it; a swipe or the arrows move to the next one,
 * and the key, "Use this design", chooses the one on screen. The answers can
 * be tapped, to see how a pick looks. Leaving puts the chosen design back.
 */
export default function ChangeDesign({ width, onBack }: { width: number; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const chosen = useChosenLook();
  const spec = useLookSpec();
  const [shown, setShown] = useState<Look>(chosen);
  const [value, setValue] = useState<AnswerValue | null>(() => emptyValue(SCREEN));
  useBackButton(onBack);

  // The design on screen is a preview until it is chosen; leaving ends it,
  // and lets go of the screen's fit, as leaving a lesson does.
  useEffect(
    () => () => {
      previewLook(null);
      fitScale.set(1);
      fitTop.set(0);
    },
    [],
  );

  const at = LOOK_ORDER.indexOf(shown);
  const show = useCallback((next: number) => {
    const look = LOOK_ORDER[next];
    if (!look) return;
    detentFeedback();
    previewLook(look);
    setShown(look);
  }, []);

  // docs/ui/15-theming-and-accessibility.md §10: every drag has a tap alternative -- here the arrows.
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_e, g) =>
          Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_e, g) => {
          if (g.dx <= -SWIPE && at < LOOK_ORDER.length - 1) show(at + 1);
          else if (g.dx >= SWIPE && at > 0) show(at - 1);
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [at, show],
  );

  const inUse = shown === chosen;
  return (
    <View style={styles.wrap}>
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <QuitButton open={false} onPress={onBack} label="Close" />
        <ProgressBar progress={AT / STEPS} steps={STEPS} />
        <Text style={styles.page} accessibilityLabel={`Step ${AT + 1} of ${STEPS}`}>
          {`${AT + 1}/${STEPS}`}
        </Text>
        {spec.streak !== 'none' ? <ComboMeter run={0} /> : null}
        <HeartMeter />
      </View>

      <View style={styles.stage} {...swipe.panHandlers}>
        <Animated.View
          key={shown}
          entering={reduced ? undefined : FadeIn.duration(200)}
          style={styles.stage}
        >
          <FitScreen contentStyle={styles.content} bottomPad={space.lg}>
            <McScreen
              screen={SCREEN}
              value={value as AnswerValue}
              onChange={setValue}
              revealed={false}
            />
          </FitScreen>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.pager}>
          <Arrow dir={-1} off={at === 0} onPress={() => show(at - 1)} />
          <View style={styles.name} accessibilityLiveRegion="polite">
            <Text style={styles.lookName} numberOfLines={1}>
              {LOOKS[shown].name}
            </Text>
            <View style={styles.dots}>
              {LOOK_ORDER.map((id) => (
                <View key={id} style={[styles.dot, id === shown && styles.dotOn]} />
              ))}
            </View>
          </View>
          <Arrow dir={1} off={at === LOOK_ORDER.length - 1} onPress={() => show(at + 1)} />
        </View>
        <Cta
          label={inUse ? 'In use' : 'Use this design'}
          disabled={inUse}
          onPress={() => setLook(shown)}
        />
      </View>
    </View>
  );
}

function Arrow({ dir, off, onPress }: { dir: 1 | -1; off: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dir < 0 ? 'Previous design' : 'Next design'}
      accessibilityState={{ disabled: off }}
      disabled={off}
      onPress={onPress}
      style={[styles.arrow, off && styles.arrowOff]}
    >
      <Icon name={dir < 0 ? 'back' : 'next'} size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = themed(() => ({
  wrap: { flex: 1 },
  // The lesson's own top bar (LessonPlayer.tsx), the ✕ leaving this page.
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  page: { ...type.label, fontFamily: MONO_FONT, color: colors.textMuted },
  stage: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.sm,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flex: 1, alignItems: 'center', gap: 6 },
  lookName: { ...type.answer, fontWeight: '700', color: colors.text },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  dotOn: { width: 16, backgroundColor: colors.accent },
  arrow: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    borderRadius: TAP_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrowOff: { opacity: 0.35 },
}));
