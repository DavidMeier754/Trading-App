import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import type { LessonEntry } from '../content';
import { EASE_OUT, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { DAILY_GOAL, doneToday, Hearts, streakDays, useHearts, useProgress, waitText } from '../progress';
import { colors, radius, space, type } from '../theme';
import Icon from './icons';
import LevelNode, { RING } from './LevelNode';
import { currentLevel, LevelView, pathView, totalXp } from './pathState';

/** Vertical distance between two nodes' centres, and room above the first for its tag. */
const STEP_Y = 172;
const TOP_PAD = 76;
/** Room under the last node for the path's tail and a level card opened on it. */
const BOTTOM_PAD = 300;
/** The path winds: centre, left, centre, right, and round again. */
const WIND = [0, -1, 0, 1];

/**
 * The home screen's path (docs/UI.md §7.1): Classic's flat panels, on the
 * ground of whichever design is picked.
 *
 * - The HUD (§7.2): the streak, the XP with the day's goal as a ring round it,
 *   and the hearts, top right.
 * - A banner with the level the learner is on.
 * - The path: one round button per level, winding down the screen, each in a
 *   ring that fills a lesson at a time. The level waiting for the learner
 *   pulses and wears a START tag; tapping any level opens its card beneath it.
 */
export default function LearnScreen({
  width,
  onStart,
}: {
  width: number;
  onStart: (entry: LessonEntry) => void;
}) {
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const views = useMemo(() => pathView(progress), [progress]);
  const here = currentLevel(views);
  const xp = useMemo(() => totalXp(progress), [progress]);
  const hearts = useHearts();

  const amp = Math.min(76, width * 0.2);
  const cx = (i: number) => width / 2 + WIND[i % WIND.length] * amp;
  const cy = (i: number) => TOP_PAD + RING / 2 + i * STEP_Y;
  const contentH = cy(views.length - 1) + RING / 2 + BOTTOM_PAD;
  // A label sits on the open side of its node and takes what width is left
  // there, so a long title wraps instead of running off the screen.
  const labelRoom = (i: number) =>
    WIND[i % WIND.length] > 0
      ? cx(i) - RING / 2 - space.sm - space.lg
      : width - (cx(i) + RING / 2 + space.sm) - space.lg;

  const [open, setOpen] = useState<number | null>(null);

  // "The current path in focus": the path opens scrolled to the level the
  // learner is on, and a card opened low on the screen is scrolled into view.
  const scroll = useRef<ScrollView | null>(null);
  const viewport = useRef(0);
  const scrollY = useRef(0);
  const focused = useRef(false);
  const onViewport = useCallback(
    (e: LayoutChangeEvent) => {
      viewport.current = e.nativeEvent.layout.height;
      if (focused.current) return;
      focused.current = true;
      const i = views.indexOf(here);
      const y = Math.max(0, cy(i) - viewport.current * 0.38);
      scroll.current?.scrollTo({ y, animated: false });
    },
    // cy is derived from constants and the width
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [views, here]
  );
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  };
  const openCard = (i: number) => {
    setOpen((prev) => (prev === i ? null : i));
    const cardBottom = cy(i) + RING / 2 + 16 + CARD_H;
    const overflow = cardBottom - (scrollY.current + viewport.current - space.lg);
    if (overflow > 0) scroll.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
  };

  return (
    <View style={styles.wrap}>
      <Hud
        top={insets.top}
        streak={streakDays(progress)}
        xp={xp}
        today={doneToday(progress)}
        hearts={hearts}
      />
      <Banner view={here} allDone={views.every((v) => v.status === 'complete')} />
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={{ height: contentH }}
        showsVerticalScrollIndicator={false}
        onLayout={onViewport}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        <Connectors views={views} cx={cx} cy={cy} width={width} height={contentH} />
        {views.map((view, i) => (
          <View
            key={view.level.number}
            style={[styles.nodeSlot, { left: cx(i) - RING / 2, top: cy(i) - RING / 2 }]}
          >
            <LevelNode view={view} onPress={() => openCard(i)} />
            <NodeLabel
              view={view}
              side={WIND[i % WIND.length] > 0 ? 'left' : 'right'}
              room={labelRoom(i)}
            />
          </View>
        ))}
        <PathEnd x={cx(views.length)} y={cy(views.length - 1) + STEP_Y * 0.72} />
        {open !== null ? (
          <>
            <Pressable
              accessibilityLabel="Close level card"
              style={StyleSheet.absoluteFill}
              onPress={() => setOpen(null)}
            />
            <LevelCard
              key={open}
              view={views[open]}
              before={open > 0 ? views[open - 1] : null}
              top={cy(open) + RING / 2 + 16}
              arrowX={cx(open)}
              width={width}
              hearts={hearts}
              onStart={(entry) => {
                setOpen(null);
                onStart(entry);
              }}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// HUD and banner
// ---------------------------------------------------------------------------

/**
 * docs/UI.md §7.2: streak flame with its day count, the daily XP goal as a ring
 * (two lessons fill it), and the hearts -- top right, where the learner looks
 * before starting a test.
 */
function Hud({
  top,
  streak,
  xp,
  today,
  hearts,
}: {
  top: number;
  streak: number;
  xp: number;
  today: number;
  hearts: Hearts;
}) {
  const goal = Math.min(1, today / DAILY_GOAL);
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <View style={[styles.hud, { paddingTop: top + space.sm }]}>
      <View style={styles.hudItem} accessibilityLabel={`${streak} day streak`}>
        <Icon name="flame" size={22} color={streak > 0 ? colors.warning : colors.textFaint} />
        <Text style={[styles.hudValue, { color: streak > 0 ? colors.warning : colors.textFaint }]}>
          {streak}
        </Text>
      </View>
      <View
        style={styles.hudItem}
        accessibilityLabel={`${xp} XP, ${Math.min(today, DAILY_GOAL)} of ${DAILY_GOAL} lessons today`}
      >
        <View style={styles.goal}>
          <Svg width={26} height={26} style={StyleSheet.absoluteFill}>
            <Circle cx={13} cy={13} r={r} stroke={colors.surfaceAlt} strokeWidth={2.5} fill="none" />
            <Circle
              cx={13}
              cy={13}
              r={r}
              stroke={colors.accent}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={c * (1 - goal)}
              rotation={-90}
              origin="13, 13"
            />
          </Svg>
          <Icon name="bolt" size={14} color={colors.accent} />
        </View>
        <Text style={[styles.hudValue, { color: colors.accent }]}>{xp}</Text>
      </View>
      <View style={styles.hudSpacer} />
      {/* docs/UI.md §5.2: while one is on its way back, the wait sits beside them. */}
      <View
        style={styles.hudItem}
        accessibilityLabel={`${hearts.hearts} hearts${
          hearts.nextAt ? `, the next one back in ${waitText(hearts.nextAt)}` : ''
        }`}
      >
        {hearts.nextAt ? <Text style={styles.hudWait}>{waitText(hearts.nextAt)}</Text> : null}
        <Icon name="heart" size={22} color={hearts.hearts > 0 ? colors.down : colors.textFaint} />
        <Text style={[styles.hudValue, { color: hearts.hearts > 0 ? colors.down : colors.textFaint }]}>
          {hearts.hearts}
        </Text>
      </View>
    </View>
  );
}

/** The level the learner is on, named at the top of the path. */
function Banner({ view, allDone }: { view: LevelView; allDone: boolean }) {
  const lesson = Math.min(view.done + 1, view.total);
  return (
    <View style={styles.banner} accessibilityRole="header">
      <View style={styles.bannerText}>
        <Text style={styles.bannerKicker}>
          {allDone
            ? `Chapter ${view.level.chapter} · ${view.level.chapterTitle}`
            : `Chapter ${view.level.chapter} · Level ${view.level.number}`}
        </Text>
        <Text style={styles.bannerTitle} numberOfLines={2}>
          {allDone ? 'Every level here is done' : view.level.title}
        </Text>
      </View>
      <View style={styles.bannerBadge}>
        {allDone ? (
          <Icon name="check" size={22} color="#FFFFFF" strokeWidth={3} />
        ) : (
          <>
            <Text style={styles.bannerBadgeValue}>{`${lesson}/${view.total}`}</Text>
            <Text style={styles.bannerBadgeLabel}>lesson</Text>
          </>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The path
// ---------------------------------------------------------------------------

function NodeLabel({
  view,
  side,
  room,
}: {
  view: LevelView;
  side: 'left' | 'right';
  room: number;
}) {
  const locked = view.status === 'locked';
  return (
    <View
      pointerEvents="none"
      style={[
        styles.label,
        { width: Math.max(90, Math.min(170, room)) },
        side === 'right' ? { left: RING + space.sm } : { right: RING + space.sm },
      ]}
    >
      <Text style={[styles.labelKicker, side === 'left' && styles.alignRight]}>
        {`Level ${view.level.number}`}
      </Text>
      <Text
        style={[
          styles.labelTitle,
          locked && { color: colors.textFaint },
          side === 'left' && styles.alignRight,
        ]}
        numberOfLines={3}
      >
        {view.level.title}
      </Text>
      <Text style={[styles.labelMeta, side === 'left' && styles.alignRight]}>
        {view.status === 'complete'
          ? view.perfect
            ? 'Perfect'
            : 'Done'
          : `${view.done}/${view.total} lessons`}
      </Text>
    </View>
  );
}

/**
 * Dots from each level down to the next, lit as far as the learner has got:
 * the trail says which way the path runs without a line cutting through the
 * labels beside the nodes.
 */
function Connectors({
  views,
  cx,
  cy,
  width,
  height,
}: {
  views: LevelView[];
  cx: (i: number) => number;
  cy: (i: number) => number;
  width: number;
  height: number;
}) {
  const dots: { x: number; y: number; lit: boolean }[] = [];
  const segment = (i: number, endY: number, lit: boolean) => {
    const x0 = cx(i);
    const y0 = cy(i);
    const x1 = cx(i + 1);
    const y1 = endY;
    const steps = 14;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      // A soft S between the two: out of one straight down, into the next.
      const e = t * t * (3 - 2 * t);
      const x = x0 + (x1 - x0) * e;
      const y = y0 + (y1 - y0) * t;
      const clear = RING / 2 + 8;
      if (Math.hypot(x - x0, y - y0) < clear || Math.hypot(x - x1, y - y1) < clear) continue;
      dots.push({ x, y, lit });
    }
  };
  for (let i = 0; i < views.length - 1; i++) {
    segment(i, cy(i + 1), views[i + 1].status !== 'locked');
  }
  segment(views.length - 1, cy(views.length - 1) + STEP_Y * 0.72, false);
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((d, k) => (
        <Circle
          key={k}
          cx={d.x}
          cy={d.y}
          r={3.4}
          fill={d.lit ? colors.accent : colors.surfaceAlt}
          opacity={d.lit ? 0.75 : 1}
        />
      ))}
    </Svg>
  );
}

/** Where the path, for now, stops: the rest of Chapter 1 is still to be wired in. */
function PathEnd({ x, y }: { x: number; y: number }) {
  return (
    <View pointerEvents="none" style={[styles.end, { top: y - 16, left: x - 90 }]}>
      <Icon name="lock" size={14} color={colors.textFaint} />
      <Text style={styles.endText}>More of Chapter 1 soon</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The level card
// ---------------------------------------------------------------------------

const CARD_H = 196;

/**
 * docs/UI.md §7.1: tapping a level shows its title, its lessons as they stand,
 * the XP and the time, and Start. It opens under the level it belongs to, with
 * a point towards it, so it reads as that level's card and not a new screen.
 */
function LevelCard({
  view,
  before,
  top,
  arrowX,
  width,
  hearts,
  onStart,
}: {
  view: LevelView;
  before: LevelView | null;
  top: number;
  arrowX: number;
  width: number;
  hearts: Hearts;
  onStart: (entry: LessonEntry) => void;
}) {
  const reduced = useReduceMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withTiming(1, { duration: 200, easing: EASE_OUT }));
  }, [reduced, t]);
  const enter = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: (1 - t.get()) * -6 }, { scale: 0.96 + 0.04 * t.get() }],
  }));

  const left = space.lg;
  const cardW = width - space.lg * 2;
  const locked = view.status === 'locked';
  const complete = view.status === 'complete';
  const xp = view.next.level.xp;
  const tone = locked ? colors.textFaint : complete ? colors.success : colors.accent;

  // docs/UI.md §5.2: with no hearts left a lesson cannot start; the button
  // says when it can instead.
  const empty = hearts.hearts === 0;
  const press = usePressFeedback(!locked && !empty, { cue: 'advance' });
  const label = empty
    ? hearts.nextAt
      ? `Next heart in ${waitText(hearts.nextAt)}`
      : 'Out of hearts'
    : complete
      ? 'Review lesson 1'
      : view.done === 0
        ? 'Start'
        : `Continue: lesson ${view.nextIndex + 1}`;

  return (
    <Animated.View style={[styles.card, { top, left, width: cardW, transformOrigin: 'top' }, enter]}>
      <View style={[styles.cardPoint, { left: arrowX - left - 8 }]} />
      <Text style={[styles.cardKicker, { color: tone }]}>
        {`Level ${view.level.number}${
          complete ? (view.perfect ? ' · Perfect' : ' · Done') : locked ? ' · Locked' : ''
        }`}
      </Text>
      <Text style={styles.cardTitle}>{view.level.title}</Text>
      <View style={styles.segments}>
        {view.level.subs.map((entry, i) => {
          const done = view.doneFlags[i];
          const next = !locked && !complete && i === view.nextIndex;
          return (
            <View
              key={entry.id}
              style={[
                styles.segment,
                done && { backgroundColor: colors.success, borderColor: colors.success },
                next && { borderColor: colors.accent },
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.cardMeta}>
        {locked
          ? `Finish Level ${before?.level.number ?? view.level.number - 1} to open this level.`
          : complete
            ? `All ${view.total} lessons done.`
            : `Lesson ${view.nextIndex + 1} of ${view.total} · +${xp} XP · about 3 min`}
      </Text>
      {locked ? null : (
        <Animated.View style={press.style}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: empty }}
            disabled={empty}
            onPressIn={press.onPressIn}
            onPressOut={press.onPressOut}
            onPress={() => onStart(view.next)}
            style={[
              styles.cardButton,
              complete && styles.cardButtonQuiet,
              empty && styles.cardButtonEmpty,
            ]}
          >
            {empty ? (
              <Icon name="heart" size={16} color={colors.textFaint} />
            ) : complete ? null : (
              <Icon name="play" size={16} color="#FFFFFF" />
            )}
            <Text
              style={[
                styles.cardButtonText,
                complete && { color: colors.text },
                empty && { color: colors.textMuted },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hudValue: { fontSize: 17, lineHeight: 22, fontWeight: '800' },
  hudSpacer: { flex: 1 },
  hudWait: { ...type.small, color: colors.textMuted, fontVariant: ['tabular-nums'], marginRight: 2 },
  goal: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },

  banner: {
    marginHorizontal: space.lg,
    marginBottom: space.xs,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: space.md,
    paddingLeft: space.lg,
    paddingRight: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  bannerText: { flex: 1, gap: 2 },
  bannerKicker: {
    ...type.label,
    color: 'rgba(255, 255, 255, 0.78)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bannerTitle: { ...type.title, color: '#FFFFFF' },
  bannerBadge: {
    minWidth: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  bannerBadgeValue: { fontSize: 17, lineHeight: 20, fontWeight: '800', color: '#FFFFFF' },
  bannerBadgeLabel: { ...type.small, fontSize: 10, color: 'rgba(255, 255, 255, 0.78)' },

  scroll: { flex: 1 },
  nodeSlot: { position: 'absolute', width: RING, height: RING },
  label: { position: 'absolute', top: 10, gap: 1 },
  labelKicker: { ...type.small, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 },
  labelTitle: { fontSize: 15, lineHeight: 19, fontWeight: '700', color: colors.text },
  labelMeta: { ...type.small, color: colors.textMuted },
  alignRight: { textAlign: 'right' },
  end: {
    position: 'absolute',
    width: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  endText: { ...type.small, color: colors.textFaint },

  card: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  },
  cardPoint: {
    position: 'absolute',
    top: -9,
    width: 16,
    height: 16,
    backgroundColor: colors.surface,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: '#3A4553',
    transform: [{ rotate: '45deg' }],
  },
  cardKicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { ...type.title, color: colors.text },
  segments: { flexDirection: 'row', gap: 6 },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.surfaceAlt,
  },
  cardMeta: { ...type.small, color: colors.textMuted },
  cardButton: {
    marginTop: space.xs,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  cardButtonQuiet: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: '#3A4553' },
  cardButtonEmpty: { backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border },
  cardButtonText: { ...type.prompt, fontSize: 17, color: '#FFFFFF' },
});
