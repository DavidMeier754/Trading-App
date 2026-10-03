import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PATHS } from '../content';
import { useProgress } from '../progress';
import { EMBLEM_NAMES, MedalCoin } from '../rewards/Medal';
import { TierCard } from '../rewards/TierCard';
import { colors, space, type, themed } from '../theme';
import { dayText, planDocument, standing } from './accountData';
import { pageStyles, RowButton } from './pageParts';

/** A medal on the shelf. */
const COIN = 34;

/**
 * docs/UI.md §7.4 [DESIGN-REVIEW] (David, 2026-10-03): the Account page, top
 * to bottom -- the tier card in its material, the medal shelf, All stats,
 * Your plan, Settings. The learning chart David liked goes to the tab the
 * Leaderboard becomes, decided with the tabs concept (§11.2).
 */
export default function AccountScreen({
  onOpenSettings,
  onOpenStats,
  onOpenPlan,
}: {
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenPlan: () => void;
}) {
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const { finished, tier } = useMemo(() => standing(progress), [progress]);
  const plan = useMemo(() => planDocument(progress), [progress]);
  const lines = plan.groups.reduce((n, g) => n + g.lines.length, 0);
  const pathName = PATHS.find((p) => p.id === progress.path)?.name;
  const [w, setW] = useState(0);
  return (
    <ScrollView
      style={pageStyles.wrap}
      contentContainerStyle={[
        pageStyles.content,
        { paddingTop: insets.top + space.lg, paddingBottom: space.xxl },
      ]}
      onLayout={(e) => setW(e.nativeEvent.layout.width - space.lg * 2)}
    >
      <Text style={styles.title} accessibilityRole="header">
        Account
      </Text>
      {w > 0 ? <TierCard tier={tier} width={w} path={pathName} /> : null}

      <Text style={pageStyles.section}>Medals</Text>
      <View
        style={styles.shelf}
        accessible
        accessibilityLabel={`Medals: ${finished.size} of ${EMBLEM_NAMES.length} chapters finished`}
      >
        {EMBLEM_NAMES.map((_, i) => {
          const n = i + 1;
          const earned = finished.has(n);
          return (
            <View key={n} style={styles.slot}>
              <MedalCoin chapter={n} size={COIN} earned={earned} id={`shelf-${n}`} />
              <Text style={[styles.slotNumber, earned && styles.slotNumberEarned]}>{n}</Text>
            </View>
          );
        })}
      </View>

      <Text style={pageStyles.section}>You</Text>
      <RowButton
        icon="gauge"
        title="All stats"
        sub="Lessons, streaks, skills and your decisions"
        onPress={onOpenStats}
      />
      <RowButton
        icon="book"
        title="Your plan"
        sub={
          lines && plan.changed
            ? `${lines} ${lines === 1 ? 'line' : 'lines'} · changed ${dayText(plan.changed)}`
            : 'Starts in Chapter 1, Level 16'
        }
        onPress={onOpenPlan}
      />
      <RowButton
        icon="gear"
        title="Settings"
        sub="Design, appearance, feel, your path"
        onPress={onOpenSettings}
      />
    </ScrollView>
  );
}

const styles = themed(() => ({
  title: { ...type.display, color: colors.text },
  shelf: { flexDirection: 'row', justifyContent: 'space-between' },
  slot: { alignItems: 'center', gap: 4 },
  slotNumber: { ...type.small, fontSize: 13, color: colors.textFaint },
  slotNumberEarned: { color: colors.text, fontWeight: '700' },
}));
