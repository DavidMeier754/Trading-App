import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, radius, space, type } from '../theme';
import type { Screen } from '../types';
import type { Grade } from './answers';

const DOT: Record<Grade, string> = {
  correct: colors.success,
  amber: colors.warning,
  wrong: colors.down,
};

const TYPE_LABEL: Record<string, string> = {
  mc: 'Multiple choice',
  'numeric-mc': 'Number choice',
  tf: 'True or false',
  'numeric-input': 'Calculation',
  'fill-tiles': 'Fill the blank',
  match: 'Match',
  'chart-decision': 'Chart decision',
};

function Ring({ value }: { value: number }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceAlt}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={value >= 0.7 ? colors.success : colors.warning}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * value} ${circumference}`}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringText}>{`${Math.round(value * 100)}%`}</Text>
      </View>
    </View>
  );
}

/**
 * docs/UI.md §3 `summary`: "X/N correct", a ring, and a per-question list with
 * green/red dots. The archetype is specified for tests and exams; level-01-1 is a
 * lesson and carries no `summary` screen, so this one is synthesised from the run
 * (see report). No XP, streak or confetti — out of scope for this slice.
 */
export default function Summary({
  screens,
  grades,
  levelTitle,
}: {
  screens: Screen[];
  grades: (Grade | null)[];
  levelTitle: string;
}) {
  const answered = screens
    .map((screen, i) => ({ screen, grade: grades[i], i }))
    .filter((row) => row.grade !== null && row.grade !== undefined);

  const correct = answered.filter((r) => r.grade === 'correct').length;
  const amber = answered.filter((r) => r.grade === 'amber').length;
  const total = answered.length;
  const ratio = total === 0 ? 0 : (correct + amber) / total;

  return (
    // No scroll box of its own: the lesson's content area fits a long list to
    // the screen (lesson/fit.tsx), and a scroller inside it would be the one
    // place a lesson still scrolled.
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{levelTitle}</Text>
      <View style={styles.scoreRow}>
        <Ring value={ratio} />
        <View style={styles.scoreText}>
          <Text style={styles.score}>{`${correct}/${total} correct`}</Text>
          {amber > 0 ? (
            <Text style={styles.amberNote}>
              {`${amber} reasonable ${amber === 1 ? 'call' : 'calls'}`}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.list}>
        {answered.map(({ screen, grade, i }) => (
          <View key={i} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: DOT[grade as Grade] }]} />
            <Text style={styles.rowLabel}>
              {TYPE_LABEL[screen.type] ?? screen.type}
            </Text>
            <Text style={styles.rowScreen}>{`screen ${i + 1}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', gap: space.xl, paddingVertical: space.xl },
  kicker: {
    ...type.label,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  scoreText: { gap: space.xs },
  score: { ...type.title, color: colors.text },
  amberNote: { ...type.body, color: colors.warning },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringText: { ...type.answer, color: colors.text },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowLabel: { ...type.answer, color: colors.text, flex: 1 },
  rowScreen: { ...type.small, color: colors.textFaint },
});
