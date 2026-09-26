import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { copy } from '../format';
import { colors, radius, space, type } from '../theme';
import type { Grade } from './answers';
import { Celebrate, PopIn } from './Celebrate';
import { isStreakMilestone, pulseAt, STREAK_FROM } from './feedback';
import { useLookSpec } from './look';
import { EASE_OUT, SPRING_PANEL, SPRING_PANEL_CALM, useMotion } from './motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const TONE = {
  correct: { accent: colors.success, tint: colors.successTint, label: 'Correct' },
  amber: { accent: colors.warning, tint: colors.warningTint, label: 'Reasonable' },
  wrong: { accent: colors.down, tint: colors.downTint, label: 'Not quite' },
} as const;

/** The mark in the badge, drawn on a 20 x 20 box. */
const MARK = {
  correct: 'M5 10.5 L8.6 14 L15 6.5',
  amber: 'M5.5 10 L14.5 10',
  wrong: 'M6.5 6.5 L13.5 13.5 M13.5 6.5 L6.5 13.5',
} as const;
const MARK_LEN = { correct: 16, amber: 9, wrong: 20 } as const;

/**
 * docs/UI.md §5.1 — the inline reveal, tinted by grade, with the "Show working"
 * toggle on numeric screens.
 *
 * It arrives in three beats rather than one block. The panel rises on a spring
 * -- a lively one after a right answer, a settled one after anything else, so
 * the physics carry the mood before a word is read. The badge pops in and its
 * mark draws itself on the cue's second pulse, the same instant the second
 * note and the second haptic land. Then the words fade up underneath.
 *
 * A run of right answers shows here as "3 in a row", from the third on, and a
 * milestone rings. A run that ends is never mentioned (docs/UI.md §1.6).
 */
export default function Reveal({
  grade,
  lead,
  explanation,
  working,
  extra,
  streak = 0,
}: {
  grade: Grade;
  /** docs/UI.md §5.1: an amber reveal opens with what was right about the choice. */
  lead?: string;
  explanation: string;
  working?: string;
  extra?: React.ReactNode;
  /** Consecutive right answers, this one included. */
  streak?: number;
}) {
  const tone = TONE[grade];
  const m = useMotion();
  const spec = useLookSpec();
  const [showWorking, setShowWorking] = useState(false);

  const fade = useSharedValue(0);
  const rise = useSharedValue(m.reduced ? 1 : 0);
  const words = useSharedValue(0);
  const mark = useSharedValue(m.reduced ? 1 : 0);

  useEffect(() => {
    // Reduced motion keeps the fades; only the travel and the bounce go.
    fade.set(withTiming(1, { duration: m.fade(280), easing: EASE_OUT }));
    if (!m.reduced) {
      rise.set(withSpring(1, grade === 'correct' ? SPRING_PANEL : SPRING_PANEL_CALM));
      mark.set(
        withDelay(pulseAt('correct0', 1), withTiming(1, { duration: 260, easing: EASE_OUT })),
      );
    }
    words.set(
      withDelay(m.reduced ? 0 : 120, withTiming(1, { duration: m.fade(380), easing: EASE_OUT })),
    );
  }, [grade, m, fade, rise, words, mark]);

  const travel = m.travel(28);
  const panel = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateY: (1 - rise.get()) * travel }],
  }));
  const wordsStyle = useAnimatedStyle(() => ({
    opacity: words.get(),
    transform: [{ translateY: (1 - words.get()) * (travel / 3) }],
  }));
  const markProps = useAnimatedProps(() => ({
    strokeDashoffset: MARK_LEN[grade] * (1 - mark.get()),
  }));

  const showStreak = grade === 'correct' && streak >= STREAK_FROM;
  const milestone = showStreak && isStreakMilestone(streak);
  const pill = (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{`${streak} in a row`}</Text>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          backgroundColor: tone.tint,
          borderColor: tone.accent,
          borderRadius: Math.max(2, spec.surface.radius),
        },
        panel,
      ]}
    >
      <View style={styles.headRow}>
        <PopIn style={[styles.badge, { backgroundColor: tone.accent }]}>
          <Svg width={20} height={20}>
            <AnimatedPath
              d={MARK[grade]}
              stroke={colors.background}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={`${MARK_LEN[grade]} ${MARK_LEN[grade]}`}
              strokeDashoffset={m.reduced ? 0 : MARK_LEN[grade]}
              animatedProps={markProps}
            />
          </Svg>
        </PopIn>
        <Text style={[styles.head, { color: tone.accent }]}>{tone.label}</Text>
        {showStreak ? (
          <PopIn delay={m.reduced ? 0 : 260} style={styles.pillSlot}>
            {milestone ? (
              <Celebrate radius={radius.pill} color={colors.warning}>
                {pill}
              </Celebrate>
            ) : (
              pill
            )}
          </PopIn>
        ) : null}
      </View>
      <Animated.View style={[styles.words, wordsStyle]}>
        {lead ? <Text style={[styles.lead, { color: tone.accent }]}>{copy(lead)}</Text> : null}
        <Text style={styles.body}>{copy(explanation)}</Text>
        {extra}
        {working ? (
          <View style={styles.workingWrap}>
            <Pressable
              onPress={() => setShowWorking((v) => !v)}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text style={[styles.toggle, { color: tone.accent }]}>
                {showWorking ? 'Hide working' : 'Show working'}
              </Text>
            </Pressable>
            {showWorking ? <Text style={styles.working}>{copy(working)}</Text> : null}
          </View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

/**
 * How tall a verdict card will be, before there is a verdict: the card's own
 * padding, head row and words, laid out once and invisibly. For a screen that
 * has to keep room for a verdict it has not had yet (ChartDecisionScreen) --
 * a guess at it was a correct answer's card, and a wrong answer's, a lead line
 * taller, then overflowed the screen the moment it landed.
 */
export function RevealProbe({
  lead,
  explanation,
  working = false,
  onHeight,
}: {
  lead?: string;
  explanation: string;
  /** The verdict will carry a "Show working" line. */
  working?: boolean;
  onHeight: (height: number) => void;
}) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, styles.probe]}
      onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
    >
      <View style={styles.probeHead} />
      <View style={styles.words}>
        {lead ? <Text style={styles.lead}>{copy(lead)}</Text> : null}
        <Text style={styles.body}>{copy(explanation)}</Text>
        {working ? <Text style={styles.toggle}>Show working</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.lg,
    gap: space.sm,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: { ...type.label, textTransform: 'uppercase', letterSpacing: 0.6 },
  pillSlot: { marginLeft: 'auto' },
  pill: {
    borderRadius: radius.pill,
    backgroundColor: colors.warningTint,
    borderColor: colors.warning,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  pillText: { ...type.small, color: colors.warning, fontWeight: '700' },
  words: { gap: space.sm },
  lead: { ...type.answer },
  body: { ...type.body, color: colors.text },
  workingWrap: { gap: space.xs },
  toggle: { ...type.label },
  probe: { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 },
  probeHead: { height: 24 },
  working: {
    ...type.mono,
    color: colors.textMuted,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
});
