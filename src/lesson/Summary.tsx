import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { copy } from '../format';
import { colors, radius, space, type, themed } from '../theme';
import type { Screen } from '../types';
import { isQuestion } from '../types';
import type { Grade } from './answers';
import { tapFeedback } from './feedback';
import { EASE_OUT } from './motion';
import { useReduceMotion } from './useReduceMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** docs/agent.md §3.7 and docs/UI.md §3: a test is passed at 70 %. */
export const PASS_MARK = 0.7;

function dotOf(key: Grade): string {
  const table: Record<Grade, string> = {
    correct: colors.success,
    amber: colors.warning,
    wrong: colors.down,
  };
  return table[key];
}

/** How a test is scored: right answers and reasonable calls both count; a miss does not. */
export function scoreOf(screens: Screen[], grades: (Grade | null)[]) {
  const asked = screens
    .map((screen, i) => ({ screen, grade: grades[i], i }))
    .filter((row) => isQuestion(row.screen));
  const counted = asked.filter((r) => r.grade === 'correct' || r.grade === 'amber').length;
  const total = asked.length;
  const ratio = total === 0 ? 0 : counted / total;
  return {
    asked,
    counted,
    total,
    ratio,
    passed: ratio >= PASS_MARK - 1e-9,
    perfect: total > 0 && asked.every((r) => r.grade === 'correct'),
  };
}

/** One line that says which question a row is: its prompt, statement or scenario. */
function lineOf(screen: Screen): string {
  const s = screen as Record<string, unknown>;
  const text = (s.prompt ?? s.statement ?? s.scenario ?? s.sentence ?? s.title ?? '') as string;
  return copy(text).replace(/\s+/g, ' ');
}

/** The reveal's sentence, for the one-line reminder under a row. */
function reminderOf(screen: Screen): string {
  const s = screen as Record<string, unknown>;
  if (typeof s.explanation === 'string') return copy(s.explanation);
  return '';
}

/** The score ring: it sweeps to the score, green at a pass, amber below. */
function Ring({ value, passed }: { value: number; passed: boolean }) {
  const size = 104;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const reduced = useReduceMotion();
  const t = useSharedValue(reduced ? value : 0);
  useEffect(() => {
    if (!reduced) t.set(withDelay(200, withTiming(value, { duration: 900, easing: EASE_OUT })));
  }, [value, reduced, t]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - t.get()) }));
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
        {/* The pass mark, a tick on the track at 70 %. */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.textFaint}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`2 ${c - 2}`}
          strokeDashoffset={-c * PASS_MARK}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={passed ? colors.success : colors.warning}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - value)}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
          animatedProps={props}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringText}>{`${Math.round(value * 100)} %`}</Text>
      </View>
    </View>
  );
}

/**
 * docs/UI.md §3 `summary` — the end of a Checkpoint or Final Exam: "X/N
 * correct", a ring, and a row per question with its dot; tapping a row gives
 * the one-line reminder from its reveal. Pass mark 70 %: a pass continues (to
 * the badge, after a Final Exam), below it the heading says "Almost" and the
 * button retries. Reasonable calls on a chart count towards the pass.
 */
export default function Summary({
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
  const { asked, counted, total, ratio, passed, perfect } = scoreOf(screens, grades);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const reduced = useReduceMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withTiming(1, { duration: 360, easing: EASE_OUT }));
  }, [reduced, t]);
  const enter = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: 12 * (1 - t.get()) }],
  }));
  const misses = asked.filter((r) => r.grade === 'wrong').length;

  return (
    // No scroll box of its own: the lesson's content area fits a long list to
    // the screen (lesson/fit.tsx), and a scroller inside it would be the one
    // place a lesson still scrolled.
    <Animated.View style={[styles.wrap, enter]}>
      <Text style={[styles.kicker, { color: passed ? colors.success : colors.warning }]}>
        {passed ? (perfect ? 'Passed · Perfect' : 'Passed') : 'Almost'}
      </Text>
      <Text style={styles.title}>{levelTitle}</Text>
      <View style={styles.scoreRow}>
        <Ring value={ratio} passed={passed} />
        <View style={styles.scoreText}>
          <Text style={styles.score}>{`${counted}/${total} correct`}</Text>
          <Text style={styles.scoreNote}>
            {passed
              ? `+${xp + (perfect ? Math.round(xp * 0.5) : 0)} XP`
              : `${Math.ceil(total * PASS_MARK)} of ${total} passes. Review these and try again.`}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {asked.map(({ screen, grade, i }, k) => {
          const open = openRow === i;
          const g = (grade ?? 'wrong') as Grade;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`Question ${k + 1}, ${g === 'wrong' ? 'missed' : 'right'}. ${lineOf(screen)}`}
              onPress={() => {
                tapFeedback();
                setOpenRow(open ? null : i);
              }}
              style={[styles.row, k > 0 && styles.rowRule]}
            >
              <View style={styles.rowHead}>
                <Text style={styles.rowNum}>{k + 1}</Text>
                <View style={[styles.dot, { backgroundColor: dotOf(g) }]} />
                <Text
                  style={[styles.rowLabel, !passed && g === 'wrong' && styles.rowMissed]}
                  numberOfLines={open ? 3 : 1}
                >
                  {lineOf(screen)}
                </Text>
              </View>
              {open ? <Text style={styles.reminder}>{reminderOf(screen)}</Text> : null}
            </Pressable>
          );
        })}
      </View>
      {!passed && misses > 0 ? (
        <Text style={styles.hint}>Tap a red row for the one-line reminder.</Text>
      ) : null}
    </Animated.View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.lg, paddingVertical: space.lg },
  kicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { ...type.title, color: colors.text, marginTop: -space.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  scoreText: { gap: space.xs, flex: 1 },
  score: { ...type.title, color: colors.text },
  scoreNote: { ...type.body, color: colors.textMuted },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { ...type.prompt, color: colors.text },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: { paddingHorizontal: space.md, paddingVertical: 7, gap: 4 },
  rowRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowNum: {
    ...type.small,
    color: colors.textFaint,
    width: 16,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  rowLabel: { ...type.small, fontSize: 13, color: colors.textMuted, flex: 1 },
  rowMissed: { color: colors.text },
  reminder: { ...type.small, fontSize: 13, lineHeight: 18, color: colors.text, marginLeft: 33 },
  hint: { ...type.small, color: colors.textFaint, textAlign: 'center' },
}));
