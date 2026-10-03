import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProgress } from '../progress';
import { colors, MONO_FONT, radius, space, type, themed } from '../theme';
import { allStats, RISK_NOTE } from './accountData';
import { PageHeader, pageStyles, useBackButton, useSlideIn } from './pageParts';

/**
 * docs/UI.md §7.4 [DESIGN-REVIEW] "All stats" (David: "the all stats can be
 * added"): the learner's own numbers -- lessons, XP, streaks, skills,
 * mistakes, chart decisions -- and the variance view: the right calls as one
 * bar, won against lost. No rate is called good or normal (docs/agent.md
 * §3.11). The one-line risk note closes the page.
 */
export default function StatsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  useBackButton(onBack);
  const enter = useSlideIn();
  const progress = useProgress();
  const s = useMemo(() => allStats(progress), [progress]);
  const calls = s.variance.won + s.variance.lost;
  return (
    <Animated.View style={[pageStyles.wrap, enter]}>
      <PageHeader title="All stats" top={insets.top} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[pageStyles.content, { paddingBottom: insets.bottom + space.xxl }]}
      >
        <Text style={pageStyles.section}>Lessons</Text>
        <View style={styles.grid}>
          <Stat value={s.lessons} label="finished" />
          <Stat value={s.perfect} label="perfect" />
          <Stat value={s.xp} label="XP" />
        </View>
        <View style={styles.grid}>
          <Stat value={s.streak} label={s.streak === 1 ? 'day in a row' : 'days in a row'} />
          <Stat value={s.longest} label="most days in a row" />
          <Stat value={s.skills} label="skills" />
        </View>
        <View style={styles.grid}>
          <Stat value={s.mistakes} label="mistakes open" />
        </View>

        <Text style={pageStyles.section}>Chart decisions</Text>
        <View style={styles.grid}>
          <Stat value={s.decisions.right} label="good calls" tone={colors.success} />
          <Stat value={s.decisions.reasonable} label="reasonable" tone={colors.warning} />
          <Stat value={s.decisions.wrong} label="not this time" tone={colors.down} />
        </View>

        <Text style={pageStyles.section}>Right calls, won and lost</Text>
        <View
          style={styles.card}
          accessible
          accessibilityLabel={
            calls
              ? `Of your right calls on a trade, ${s.variance.won} won and ${s.variance.lost} lost. Right calls lose too. Judge the decision, not the result.`
              : 'No right calls on a trade yet.'
          }
        >
          {calls ? (
            <>
              <View style={styles.bar}>
                <View style={[styles.won, { flex: s.variance.won }]} />
                <View style={[styles.lost, { flex: s.variance.lost }]} />
              </View>
              <Text style={styles.split}>{`${s.variance.won} won · ${s.variance.lost} lost`}</Text>
              <Text style={styles.line}>
                Right calls lose too. Judge the decision, not the result.
              </Text>
            </>
          ) : (
            <Text style={styles.line}>
              No right calls on a trade yet. Once there are, this shows how many won and how many
              lost.
            </Text>
          )}
        </View>

        <Text style={styles.risk}>{RISK_NOTE}</Text>
      </ScrollView>
    </Animated.View>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={[styles.value, tone ? { color: tone } : null]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = themed(() => ({
  grid: { flexDirection: 'row', gap: space.sm },
  stat: {
    flex: 1,
    gap: 2,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  value: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: MONO_FONT,
    color: colors.text,
  },
  label: { ...type.small, fontSize: 13, color: colors.textMuted },
  card: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  bar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', gap: 2 },
  won: { backgroundColor: colors.up },
  lost: { backgroundColor: colors.down },
  split: { ...type.answer, color: colors.text, fontFamily: MONO_FONT },
  line: { ...type.body, color: colors.textMuted },
  risk: {
    ...type.small,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: space.lg,
  },
}));
