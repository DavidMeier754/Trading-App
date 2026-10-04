import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlanLine } from '../components/data/MiscPanels';
import { useProgress } from '../progress';
import { colors, space, type, themed } from '../theme';
import { dayText, planDocument } from './accountData';
import { PageHeader, pageStyles, useBackButton, useSlideIn } from './pageParts';

/**
 * docs/ui/12-practice-and-stats.md §7.4 [DESIGN-REVIEW] "Your plan": the plan as one page of a
 * document (§6.8 `plan-sheet`) -- "My trading plan", when it was started and
 * last changed, then its lines with dotted leaders, grouped as the plan's
 * keys are. Nothing else on it (David: "don't overdo"). Before the first
 * plan card it says where the plan starts.
 */
export default function PlanScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  useBackButton(onBack);
  const enter = useSlideIn();
  const progress = useProgress();
  const doc = useMemo(() => planDocument(progress), [progress]);
  return (
    <Animated.View style={[pageStyles.wrap, enter]}>
      <PageHeader title="Your plan" top={insets.top} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[pageStyles.content, { paddingBottom: insets.bottom + space.xxl }]}
      >
        <View style={styles.page}>
          <Text style={styles.heading}>My trading plan</Text>
          {doc.since && doc.changed ? (
            <Text style={styles.dates}>
              {doc.since === doc.changed || dayText(doc.since) === dayText(doc.changed)
                ? `Written ${dayText(doc.changed)}`
                : `Kept since ${dayText(doc.since)} · changed ${dayText(doc.changed)}`}
            </Text>
          ) : null}
          {doc.groups.length === 0 ? (
            <Text style={styles.empty}>
              Your plan starts in Chapter 1, Level 16, with where you will practise and the one name
              you will watch. Every chapter after it adds a few lines.
            </Text>
          ) : (
            doc.groups.map((g) => (
              <View key={g.name} style={styles.group}>
                <Text style={styles.groupName}>{g.name}</Text>
                {g.lines.map((l) => (
                  <PlanLine key={l.label} label={l.label} value={l.value} />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = themed(() => ({
  page: { gap: space.md, paddingTop: space.sm },
  heading: { ...type.title, color: colors.text },
  dates: { ...type.small, fontSize: 13, color: colors.textMuted, marginTop: -space.sm },
  empty: { ...type.body, color: colors.textMuted },
  group: { gap: space.sm, marginTop: space.sm },
  groupName: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}));
