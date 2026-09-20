import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import Mascot from '../components/Mascot';
import { colors, radius, space, type } from '../theme';
import type { Screen } from '../types';
import type { Grade } from './answers';
import { celebrateHaptic } from './haptics';
import { useReduceMotion } from './useReduceMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * docs/UI.md §5.3 — sub-level complete.
 *
 * This replaces the per-question score list that used to end a lesson. That list
 * is the `summary` archetype, which docs/schema.md defines for tests and final
 * exams, where a pass mark and a retry make it mean something. At the end of a
 * lesson it was a verdict nobody asked for. A lesson ends on what was earned.
 *
 * XP count-up and the accuracy ring are in. Streak flame and confetti are not:
 * they belong to the home screen and the badge moment, neither of which exists
 * in this slice.
 */
export default function LessonComplete({
  screens,
  grades,
  levelTitle,
  xp,
}: {
  screens: Screen[];
  grades: (Grade | null)[];
  levelTitle: string;
  xp: number;
}) {
  const reduced = useReduceMotion();

  const answered = grades.filter((g) => g !== null && g !== undefined) as Grade[];
  const clean = answered.filter((g) => g === 'correct' || g === 'amber').length;
  const total = answered.length;
  const accuracy = total === 0 ? 1 : clean / total;
  const perfect = total > 0 && answered.every((g) => g === 'correct');

  // A perfect run is worth more than a scraped pass, and the number has to be
  // legible as "why": base XP, plus a bonus the card names.
  const bonus = perfect ? Math.round(xp * 0.5) : 0;
  const earned = xp + bonus;

  const [shownXp, setShownXp] = useState(reduced ? earned : 0);
  const ring = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const card = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    celebrateHaptic();
    if (reduced) {
      setShownXp(earned);
      return;
    }

    Animated.parallel([
      Animated.timing(card, {
        toValue: 1,
        duration: 420,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(ring, {
        toValue: 1,
        duration: 900,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // docs/UI.md §5.3: XP counts up from 0 over 600 ms.
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 600);
      setShownXp(Math.round(earned * (1 - Math.pow(1 - t, 3))));
      if (t >= 1) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [earned, reduced, ring, card]);

  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: card,
          transform: [
            { translateY: card.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          ],
        },
      ]}
    >
      <Mascot pose="cheer" size={104} />

      <View style={styles.ringWrap}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.surfaceAlt}
            strokeWidth={stroke}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={perfect ? colors.warning : colors.success}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={ring.interpolate({
              inputRange: [0, 1],
              outputRange: [circumference, circumference * (1 - accuracy)],
            })}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.xp}>{`+${shownXp}`}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>{perfect ? 'Perfect run' : 'Lesson complete'}</Text>
        <Text style={styles.subtitle}>{levelTitle}</Text>
      </View>

      <View style={styles.rows}>
        <Row label="Lesson" value={`+${xp} XP`} />
        {bonus > 0 ? <Row label="Perfect bonus" value={`+${bonus} XP`} accent /> : null}
        <Row
          label="Answers"
          value={`${clean} of ${total}`}
          accent={accuracy === 1}
        />
      </View>
    </Animated.View>
  );
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
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xp: { ...type.display, fontSize: 32, color: colors.text },
  xpLabel: {
    ...type.label,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
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
