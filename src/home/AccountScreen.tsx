import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PATHS } from '../content';
import { useDisplayFace } from '../fonts';
import { medalFeedback } from '../lesson/feedback';
import { EASE_IN_OUT, SPRING_POP } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { getProgress, markMedalsShown, useProgress } from '../progress';
import { EMBLEM_NAMES, MedalCoin } from '../rewards/Medal';
import { TierCard } from '../rewards/TierCard';
import { colors, space, type, themed } from '../theme';
import { dayText, planDocument, standing } from './accountData';
import { takeShelfReplay } from './moments';
import PracticeHeatmap from './PracticeHeatmap';
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
  const display = useDisplayFace();
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const { finished, tier } = useMemo(() => standing(progress), [progress]);
  const plan = useMemo(() => planDocument(progress), [progress]);
  const lines = plan.groups.reduce((n, g) => n + g.lines.length, 0);
  const pathName = PATHS.find((p) => p.id === progress.path)?.name;
  const [w, setW] = useState(0);
  // docs/UI.md §7.4: a medal won since the shelf last showed lands in its slot
  // and shines once (David, 2026-10-04: "add every missing animation like the
  // award medal animation"). Worked out once, as the page opens.
  const [landing] = useState(() => {
    const shown = getProgress().medalsShown;
    const replay = takeShelfReplay();
    const fresh = shown === null ? [] : [...finished].filter((n) => !shown.includes(n));
    return replay !== null && !fresh.includes(replay) ? [...fresh, replay] : fresh;
  });
  useEffect(() => {
    // The first time the shelf shows, what is there counts as shown: nothing old plays as new.
    markMedalsShown([...finished]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScrollView
      style={pageStyles.wrap}
      contentContainerStyle={[
        pageStyles.content,
        { paddingTop: insets.top + space.lg, paddingBottom: space.xxl },
      ]}
      onLayout={(e) => setW(e.nativeEvent.layout.width - space.lg * 2)}
    >
      <Text style={[styles.title, display]} accessibilityRole="header">
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
          const land = landing.indexOf(n);
          // A medal landing again from the Animations page is shown won.
          const earned = finished.has(n) || land >= 0;
          return (
            <View key={n} style={styles.slot}>
              <ShelfCoin chapter={n} earned={earned} landAt={land < 0 ? null : 420 + land * 380} />
              <Text style={[styles.slotNumber, earned && styles.slotNumberEarned]}>{n}</Text>
            </View>
          );
        })}
      </View>

      {/* docs/UI.md §7.4 [DESIGN-REVIEW] "Practice as a heat map". */}
      <Text style={pageStyles.section}>Your days</Text>
      <PracticeHeatmap days={progress.days} />

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

/**
 * A medal on the shelf. One just won drops into its slot from above with a
 * spring and a heavy tap, and a band of light runs across its face once.
 */
function ShelfCoin({
  chapter,
  earned,
  landAt,
}: {
  chapter: number;
  earned: boolean;
  /** When this medal lands (ms after the page opens), or null if it is already there. */
  landAt: number | null;
}) {
  const reduced = useReduceMotion();
  const land = useSharedValue(landAt === null || reduced ? 1 : 0);
  const sheen = useSharedValue(0);
  useEffect(() => {
    if (landAt === null) return;
    const tap = setTimeout(() => medalFeedback(), reduced ? 0 : landAt + 180);
    if (!reduced) {
      land.set(withDelay(landAt, withSpring(1, SPRING_POP)));
      sheen.set(withDelay(landAt + 360, withTiming(1, { duration: 760, easing: EASE_IN_OUT })));
    }
    return () => clearTimeout(tap);
  }, [landAt, reduced, land, sheen]);
  const coin = useAnimatedStyle(() => ({
    opacity: Math.min(1, land.get() * 2),
    transform: [{ translateY: -44 * (1 - land.get()) }, { scale: 1 + 0.7 * (1 - land.get()) }],
  }));
  const band = useAnimatedStyle(() => {
    const t = sheen.get();
    return {
      opacity: t > 0 && t < 1 ? 0.75 : 0,
      transform: [{ translateX: -COIN + t * COIN * 2 }, { rotate: '22deg' }],
    };
  });
  return (
    <View>
      <Animated.View style={coin}>
        <MedalCoin chapter={chapter} size={COIN} earned={earned} id={`shelf-${chapter}`} />
      </Animated.View>
      {landAt !== null ? (
        <View pointerEvents="none" style={styles.sheenClip}>
          <Animated.View style={[styles.sheenBand, band]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = themed(() => ({
  title: { ...type.display, color: colors.text },
  sheenClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: COIN,
    height: COIN,
    borderRadius: COIN / 2,
    overflow: 'hidden',
  },
  // Light on gold, the same in both themes (the medal's colours are fixed).
  sheenBand: {
    position: 'absolute',
    top: -COIN * 0.3,
    left: COIN / 2 - 5,
    width: 10,
    height: COIN * 1.6,
    backgroundColor: '#FFFFFF',
  },
  shelf: { flexDirection: 'row', justifyContent: 'space-between' },
  slot: { alignItems: 'center', gap: 4 },
  slotNumber: { ...type.small, fontSize: 13, color: colors.textFaint },
  slotNumberEarned: { color: colors.text, fontWeight: '700' },
}));
