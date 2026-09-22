import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Mascot, { poseForGrade } from '../components/Mascot';
import { copy } from '../format';
import { colors, radius, space, type } from '../theme';
import type { Grade } from './answers';
import { DURATION, EASE_OUT, useMotion } from './motion';

const TONE = {
  correct: { accent: colors.success, tint: colors.successTint, label: 'Correct' },
  amber: { accent: colors.warning, tint: colors.warningTint, label: 'Reasonable' },
  wrong: { accent: colors.down, tint: colors.downTint, label: 'Not quite' },
} as const;

/**
 * docs/UI.md §5.1 — the inline reveal. Slides up in place (200 ms), tinted by grade,
 * with the "Show working" toggle on numeric screens.
 */
export default function Reveal({
  grade,
  lead,
  explanation,
  working,
  extra,
}: {
  grade: Grade;
  /** docs/UI.md §5.1: an amber reveal opens with what was right about the choice. */
  lead?: string;
  explanation: string;
  working?: string;
  extra?: React.ReactNode;
}) {
  const tone = TONE[grade];
  const anim = useSharedValue(0);
  const m = useMotion();
  const [showWorking, setShowWorking] = useState(false);

  useEffect(() => {
    // Reduced motion keeps a short fade; only the slide-up goes away.
    anim.set(withTiming(1, { duration: m.fade(DURATION.reveal), easing: EASE_OUT }));
  }, [anim, m]);

  const travel = m.travel(16);
  const panel = useAnimatedStyle(() => ({
    opacity: anim.get(),
    transform: [{ translateY: (1 - anim.get()) * travel }],
  }));

  return (
    <Animated.View
      style={[
        styles.wrap,
        { backgroundColor: tone.tint, borderColor: tone.accent },
        panel,
      ]}
    >
      {/* docs/UI.md §2: the mascot slot is bottom-left of the reveal area, small,
          and it reacts to the verdict (§5.1 — nod on correct, "hm" on wrong). */}
      <View style={styles.mascotSlot}>
        <Mascot pose={poseForGrade(grade)} size={34} />
      </View>

      <View style={styles.content}>
        <View style={styles.headRow}>
          <Text style={[styles.head, { color: tone.accent }]}>{tone.label}</Text>
        </View>
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
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.md,
  },
  // Bottom-aligned so the mascot stands on the floor of the panel however many
  // lines the explanation runs to.
  mascotSlot: { width: 34 * (200 / 240), alignItems: 'center' },
  content: { flex: 1, gap: space.sm },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  head: { ...type.label, textTransform: 'uppercase', letterSpacing: 0.6 },
  lead: { ...type.answer },
  body: { ...type.body, color: colors.text },
  workingWrap: { gap: space.xs },
  toggle: { ...type.label },
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
