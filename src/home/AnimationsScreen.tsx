import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LESSONS } from '../content';
import type { Grade } from '../lesson/answers';
import Cta from '../lesson/Cta';
import { revealFeedback, runBefore, STREAK_FROM, tapFeedback } from '../lesson/feedback';
import HeartMeter from '../lesson/HeartMeter';
import LessonComplete from '../lesson/LessonComplete';
import { emitMood, useLookSpec } from '../lesson/look';
import { EASE_OUT, usePressFeedback } from '../lesson/motion';
import OutOfHearts from '../lesson/OutOfHearts';
import ProgressBar from '../lesson/ProgressBar';
import StreakMeter from '../lesson/StreakMeter';
import { StreakLost, StreakUp } from '../lesson/StreakScreens';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { MAX_HEARTS, streakDays, useProgress } from '../progress';
import { BadgeScreen, TierUpScreen } from '../screens/RewardScreens';
import { colors, radius, space, type, themed } from '../theme';
import type { BadgeScreen as Badge, Screen, TierUpScreen as TierUp } from '../types';
import Icon, { type IconName } from './icons';
import { rewindUnlock } from './LevelNode';
import { PageHeader } from './pageParts';
import { pathView } from './pathState';

/**
 * Settings → Testing → Animations (David, 2026-09-29): the animations that
 * only play in certain moments -- a level opening, a perfect run, a chapter's
 * badge, a lost heart -- played on a tap, as often as wanted, without earning
 * or losing anything. Every new animation of a rare moment gets a row here,
 * such as the streak screens (David, 2026-09-30: "missing from the play rare
 * animations tab"). Test builds only.
 */

type StageId = 'complete' | 'perfect' | 'up' | 'lost' | 'badge' | 'tier' | 'run' | 'heart' | 'out';

const APP: { id: StageId; icon: IconName; title: string; sub: string }[] = [
  { id: 'complete', icon: 'bolt', title: 'Lesson complete', sub: 'The ring, the XP, the confetti' },
  { id: 'perfect', icon: 'star', title: 'Perfect run', sub: 'Every answer right: gold' },
  {
    id: 'up',
    icon: 'flame',
    title: 'Streak goes up',
    sub: "The day's goal met: the flame catches",
  },
  { id: 'lost', icon: 'calendar', title: 'Streak lost', sub: 'A day missed: the flame goes out' },
  { id: 'badge', icon: 'trophy', title: 'Chapter complete', sub: "The chapter's medal lands" },
  { id: 'tier', icon: 'shield', title: 'New tier', sub: 'The tier card turns over' },
  { id: 'run', icon: 'flame', title: 'Right answers in a row', sub: 'The flame in the top bar' },
  { id: 'heart', icon: 'heart', title: 'Heart lost', sub: 'A wrong answer costs a heart' },
  { id: 'out', icon: 'heart', title: 'Out of hearts', sub: 'The last heart is gone' },
];

/** A lesson of eight answers: one missed and one "reasonable", so the ring stops at 88 %. */
const SOME_MISSED: Grade[] = [
  'correct',
  'correct',
  'wrong',
  'correct',
  'amber',
  'correct',
  'correct',
  'correct',
];
const ALL_RIGHT: Grade[] = Array.from({ length: 8 }, () => 'correct' as const);

// The chapter's badge and the tier, as the content has them.
const SCREENS: Screen[] = LESSONS.flatMap((e) => e.level.screens);
const BADGE = SCREENS.find((s): s is Badge => s.type === 'badge');
const TIER = SCREENS.find((s): s is TierUp => s.type === 'tier-up');
/** The level each sits in: the medal shows its chapter, the tier card its path. */
const levelWith = (screen: Screen | undefined) =>
  screen ? LESSONS.find((l) => l.level.screens.includes(screen))?.level : undefined;
const BADGE_LEVEL = levelWith(BADGE);
const TIER_LEVEL = levelWith(TIER);
const pathOf = (path: string | undefined) => (!path || path === 'all' ? null : path);

export default function AnimationsScreen({
  onBack,
  onShowMap,
}: {
  onBack: () => void;
  /** Leave for the map, which plays what `rewindUnlock` set up. */
  onShowMap: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const progress = useProgress();
  const views = useMemo(() => pathView(progress), [progress]);
  const k = views.findIndex((v) => v.status === 'current');
  const here = k >= 0 ? views[k] : views[0];
  // A level opens after the one before it: there has to be one, finished.
  const canOpen = k > 0 && views[k - 1].status === 'complete';
  const [stage, setStage] = useState<StageId | null>(null);

  // Android's back button steps back, as the arrow does.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stage) setStage(null);
      else onBack();
      return true;
    });
    return () => sub.remove();
  }, [stage, onBack]);

  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withTiming(1, { duration: 260, easing: EASE_OUT }));
  }, [reduced, t]);
  const enter = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateX: (1 - t.get()) * 28 }],
  }));

  if (stage) {
    return (
      <Stage
        id={stage}
        title={APP.find((a) => a.id === stage)?.title ?? ''}
        levelTitle={here.next.level.title}
        xp={here.next.level.xp}
        streak={streakDays(progress)}
        onClose={() => setStage(null)}
      />
    );
  }

  return (
    <Animated.View style={[styles.wrap, enter]}>
      <PageHeader title="Animations" top={insets.top} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {reduced ? (
          <Text style={styles.note}>
            Motion is set to Reduced (Settings → Feel), so each one shows where it ends.
          </Text>
        ) : null}

        <Text style={styles.section}>In the app</Text>
        <Row
          icon="lock"
          title="Level opens"
          sub={canOpen ? `On the map: ${views[k].level.title}` : 'Needs a finished level first'}
          disabled={!canOpen}
          onPress={() => {
            rewindUnlock(views[k - 1], views[k]);
            onShowMap();
          }}
        />
        {APP.map((a) => (
          <Row
            key={a.id}
            icon={a.icon}
            title={a.title}
            sub={a.sub}
            onPress={() => setStage(a.id)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

/** One animation, full page: played on arrival, and again on every Play again. */
function Stage({
  id,
  title,
  levelTitle,
  xp,
  streak,
  onClose,
}: {
  id: StageId;
  title: string;
  levelTitle: string;
  xp: number;
  /** The learner's streak today: the streak screens go on from it, or lose it. */
  streak: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [take, setTake] = useState(0);
  // Every take starts in a quiet room, and leaving leaves it quiet.
  useEffect(() => {
    emitMood('calm');
  }, [take]);
  useEffect(() => () => emitMood('calm'), []);

  const topBar = id === 'run' || id === 'heart';
  let body: React.ReactNode;
  if (id === 'complete' || id === 'perfect')
    body = (
      <LessonComplete
        screens={[]}
        grades={id === 'perfect' ? ALL_RIGHT : SOME_MISSED}
        levelTitle={levelTitle}
        xp={xp}
      />
    );
  else if (id === 'badge')
    body = BADGE ? (
      <BadgeScreen
        screen={BADGE}
        chapter={BADGE_LEVEL?.chapter ?? 1}
        path={pathOf(BADGE_LEVEL?.path)}
        onSettled={noop}
      />
    ) : (
      <Missing what="badge" />
    );
  else if (id === 'tier')
    body = TIER ? (
      <TierUpScreen screen={TIER} path={pathOf(TIER_LEVEL?.path)} onSettled={noop} />
    ) : (
      <Missing what="tier" />
    );
  else if (id === 'out') body = <OutOfHearts />;
  else if (id === 'up') body = <StreakUp from={streak} to={streak + 1} />;
  // Nothing to lose yet: a streak of 12 stands in.
  else if (id === 'lost') body = <StreakLost lost={streak > 0 ? streak : 12} />;
  else body = <TopBarDemo bottom={insets.bottom} />;

  return (
    <View style={styles.wrap}>
      <PageHeader title={title} top={insets.top} onBack={onClose} />
      {topBar ? (
        body
      ) : (
        <>
          <View key={take} style={styles.stage}>
            {body}
          </View>
          <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
            <Cta label="Play again" cue="tick" onPress={() => setTake((n) => n + 1)} />
          </View>
        </>
      )}
    </View>
  );
}

/**
 * A lesson's top bar and nothing else: Right and Wrong stand in for answers,
 * with their sounds and the ground's light, so the flame and the hearts move
 * exactly as they do in a lesson. No heart is really lost.
 */
function TopBarDemo({ bottom }: { bottom: number }) {
  const spec = useLookSpec();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const steps = 12;
  const run = runBefore(grades, grades.length);

  const answer = (g: Grade) => {
    const next = g === 'correct' ? run + 1 : 0;
    revealFeedback(g, next);
    emitMood(g === 'correct' ? (next >= STREAK_FROM ? 'streak' : 'correct') : g, next);
    if (g === 'wrong') setHearts((h) => Math.max(0, h - 1));
    setGrades((all) => [...all, g]);
  };
  const again = () => {
    tapFeedback();
    emitMood('calm');
    setGrades([]);
    setHearts(MAX_HEARTS);
  };

  return (
    <View style={styles.demo}>
      <View style={styles.topBar}>
        <ProgressBar
          progress={Math.min(grades.length, steps) / steps}
          steps={steps}
          hot={run >= STREAK_FROM}
        />
        {spec.streak !== 'none' ? (
          <View style={styles.streakSlot}>
            <StreakMeter run={run} />
          </View>
        ) : null}
        <HeartMeter count={hearts} />
      </View>
      <View style={styles.demoMiddle}>
        <Text style={styles.demoCount}>{`${run} in a row`}</Text>
        {spec.streak === 'none' ? (
          <Text style={styles.note}>
            {`${spec.name} shows no flame. Neo and the other designs do.`}
          </Text>
        ) : null}
      </View>
      <View style={[styles.demoKeys, { paddingBottom: bottom + space.lg }]}>
        <View style={styles.keyRow}>
          <Key
            label="Right"
            color={colors.successFill}
            text={colors.successText}
            onPress={() => answer('correct')}
          />
          <Key
            label="Wrong"
            color={colors.dangerFill}
            text={colors.accentText}
            onPress={() => answer('wrong')}
          />
        </View>
        <Pressable accessibilityRole="button" onPress={again} hitSlop={8} style={styles.again}>
          <Text style={styles.againText}>Start again</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Key({
  label,
  color,
  text,
  onPress,
}: {
  label: string;
  color: string;
  text: string;
  onPress: () => void;
}) {
  // The verdict's own sound plays on the press; the key itself stays silent.
  const press = usePressFeedback(true, { cue: null });
  return (
    <Animated.View style={[styles.keyWrap, press.style]}>
      <Pressable
        accessibilityRole="button"
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={[styles.key, { backgroundColor: color }]}
      >
        <Text style={[styles.keyText, { color: text }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function Missing({ what }: { what: string }) {
  return <Text style={styles.note}>{`No ${what} in the lessons yet.`}</Text>;
}

function noop() {}

function Row({
  icon,
  title,
  sub,
  onPress,
  disabled = false,
}: {
  icon: IconName;
  title: string;
  sub: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const press = usePressFeedback(!disabled, { cue: 'tick' });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={styles.row}
      >
        <View style={[styles.rowIcon, disabled && { backgroundColor: colors.surfaceAlt }]}>
          <Icon name={icon} size={20} color={disabled ? colors.textFaint : colors.accent} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, disabled && { color: colors.textMuted }]}>{title}</Text>
          <Text style={styles.rowSub}>{sub}</Text>
        </View>
        {disabled ? null : <Icon name="play" size={18} color={colors.textFaint} />}
      </Pressable>
    </Animated.View>
  );
}

const styles = themed(() => ({
  wrap: { flex: 1 },
  content: { paddingHorizontal: space.lg, gap: space.md },
  section: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: space.md,
  },
  note: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...type.answer, color: colors.text, fontWeight: '700' },
  rowSub: { ...type.small, color: colors.textMuted },

  stage: { flex: 1, justifyContent: 'center', paddingHorizontal: space.lg },
  footer: { paddingHorizontal: space.lg, paddingTop: space.md },

  demo: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  streakSlot: { minWidth: 32, alignItems: 'flex-end' },
  demoMiddle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  demoCount: { ...type.title, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  demoKeys: { paddingHorizontal: space.lg, gap: space.md },
  keyRow: { flexDirection: 'row', gap: space.md },
  keyWrap: { flex: 1 },
  key: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { ...type.prompt, fontSize: 17 },
  again: { alignSelf: 'center', paddingVertical: space.xs, paddingHorizontal: space.md },
  againText: { ...type.label, color: colors.textMuted },
}));
