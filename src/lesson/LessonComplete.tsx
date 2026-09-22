import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';

import { colors, radius, space, type } from '../theme';
import type { Screen } from '../types';
import type { Grade } from './answers';
import Confetti from './Confetti';
import { celebrateHaptic } from './haptics';
import { DURATION, EASE_OUT, SPRING_POP, useMotion } from './motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING = 132;
const STROKE = 10;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/**
 * docs/UI.md §5.3 — sub-level complete.
 *
 * Rare tier, so this is where the delight budget goes: a confetti burst, a ring
 * that draws, XP counting up off that same ring, and three blocks arriving on a
 * stagger. Everything is transform and opacity except the ring's dash offset.
 */
export default function LessonComplete({
  grades,
  levelTitle,
  xp,
}: {
  screens: Screen[];
  grades: (Grade | null)[];
  levelTitle: string;
  xp: number;
}) {
  const m = useMotion();
  const { width } = useWindowDimensions();

  const answered = grades.filter((g) => g !== null && g !== undefined) as Grade[];
  const clean = answered.filter((g) => g === 'correct' || g === 'amber').length;
  const total = answered.length;
  const accuracy = total === 0 ? 1 : clean / total;
  const perfect = total > 0 && answered.every((g) => g === 'correct');

  const bonus = perfect ? Math.round(xp * 0.5) : 0;
  const earned = xp + bonus;

  const ring = useSharedValue(m.reduced ? 1 : 0);
  const t0 = useSharedValue(m.reduced ? 1 : 0);
  const t1 = useSharedValue(m.reduced ? 1 : 0);
  const t2 = useSharedValue(m.reduced ? 1 : 0);
  const [shownXp, setShownXp] = useState(m.reduced ? earned : 0);

  useEffect(() => {
    celebrateHaptic();
    if (m.reduced) return;
    // A spring per block, 70 ms apart: one arrival, not a pop.
    [t0, t1, t2].forEach((v, i) => v.set(withDelay(i * 70, withSpring(1, SPRING_POP))));
    ring.set(withDelay(180, withTiming(1, { duration: DURATION.celebrate, easing: EASE_OUT })));
  }, [m.reduced, ring, t0, t1, t2]);

  // The counter reads off the ring rather than a parallel timer, so the number
  // and the arc can never drift apart. It crosses to the RN runtime only when
  // the displayed integer actually changes -- roughly 30 times, not every frame.
  useAnimatedReaction(
    () => Math.round(earned * Math.min(1, ring.get() * 1.5)),
    (value, previous) => {
      if (value !== previous) scheduleOnRN(setShownXp, value);
    }
  );

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - accuracy * ring.get()),
  }));

  const travel = m.travel(16);
  const s0 = useTierStyle(t0, travel);
  const s1 = useTierStyle(t1, travel);
  const s2 = useTierStyle(t2, travel);

  return (
    <View style={styles.wrap}>
      {!m.reduced ? <Confetti width={width} height={620} /> : null}

      <Animated.View style={[styles.ringWrap, s0]}>
        <Svg width={RING} height={RING}>
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={colors.surfaceAlt}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={perfect ? colors.warning : colors.success}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${CIRC} ${CIRC}`}
            animatedProps={ringProps}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.xp}>{`+${shownXp}`}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.textBlock, s1]}>
        <Text style={styles.title}>{perfect ? 'Perfect run' : 'Lesson complete'}</Text>
        <Text style={styles.subtitle}>{levelTitle}</Text>
      </Animated.View>

      <Animated.View style={[styles.rows, s2]}>
        <Row label="Lesson" value={`+${xp} XP`} />
        {bonus > 0 ? <Row label="Perfect bonus" value={`+${bonus} XP`} accent /> : null}
        <Row label="Answers" value={`${clean} of ${total}`} accent={accuracy === 1} />
      </Animated.View>
    </View>
  );
}

/** One staggered block of the entrance. */
function useTierStyle(v: SharedValue<number>, travel: number) {
  return useAnimatedStyle(() => ({
    opacity: v.get(),
    transform: [{ translateY: (1 - v.get()) * travel }],
  }));
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: colors.warning }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  xp: { ...type.display, fontSize: 32, color: colors.text },
  xpLabel: { ...type.label, color: colors.textMuted, letterSpacing: 1.5 },
  textBlock: { alignItems: 'center', gap: space.xs },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted },
  rows: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  rowLabel: { ...type.answer, color: colors.textMuted },
  rowValue: { ...type.answer, color: colors.text },
});
