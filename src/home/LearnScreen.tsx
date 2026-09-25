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
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { LEVEL_TYPE_NAME, LessonEntry, PATHS, TradingPath, levelTypeOf } from '../content';
import { isQuestion } from '../types';
import { EASE_IN_OUT, EASE_OUT, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { DAILY_GOAL, doneToday, Hearts, streakDays, useHearts, useProgress, waitText } from '../progress';
import { colors, radius, space, type } from '../theme';
import Icon from './icons';
import LevelNode, { RING, shownStatusOf, UNLOCK } from './LevelNode';
import { ChapterView, chapterViews, currentLevel, LevelView, totalXp } from './pathState';

/** Vertical distance between two nodes' centres. */
const STEP_Y = 172;
/** Room between a chapter's header and its first node, for the START tag. */
const NODES_TOP = 64;
/** A chapter's header card, and the space left under an expanded chapter's last node. */
const HEAD_H = 76;
const NODES_BOTTOM = 36;
const CHAPTER_GAP = 16;
/** Room under the last section for a level card opened on its last node. */
const BOTTOM_PAD = 280;
/** The path winds: centre, left, centre, right, and round again. */
const WIND = [0, -1, 0, 1];

type Item =
  | { t: 'header'; ci: number; y: number }
  | { t: 'node'; gi: number; li: number; ci: number; x: number; y: number }
  | { t: 'end'; ci: number; x: number; y: number; text: string }
  | { t: 'teaser'; y: number };

/**
 * The home screen's path (docs/UI.md §7.1): Classic's flat panels, on the
 * ground of whichever design is picked.
 *
 * - The HUD (§7.2): the streak, the XP with the day's goal as a ring round it,
 *   and the hearts, top right.
 * - A banner with the level the learner is on.
 * - The path, chapter by chapter. Each chapter has a header card (its name,
 *   levels done of all, and a badge that lights when it is finished) and
 *   folds away under it; the chapter being worked on is open, the others
 *   folded, and any can be opened with a tap. In a chapter, one button per
 *   level winds down the screen, each in a ring that fills a lesson at a
 *   time; Checkpoints are shields and the Final Exam a trophy. The level
 *   waiting for the learner pulses and wears a START tag, and tapping any
 *   level opens its card beneath it.
 * - When the level the learner is on has scrolled away, a button brings it back.
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
  const chapters = useMemo(() => chapterViews(progress), [progress]);
  const views = useMemo(() => chapters.flatMap((c) => c.levels), [chapters]);
  const here = currentLevel(views);
  const hereAt = views.indexOf(here);
  const xp = useMemo(() => totalXp(progress), [progress]);
  const hearts = useHearts();
  const reduced = useReduceMotion();
  const chapterOf = (gi: number) => {
    let n = 0;
    for (let ci = 0; ci < chapters.length; ci++) {
      n += chapters[ci].levels.length;
      if (gi < n) return ci;
    }
    return chapters.length - 1;
  };

  // Moving on (LevelNode, UNLOCK): the level that the lesson just finished
  // opened -- the one after a level the map last drew as unfinished. Read once
  // as the map first draws: the nodes record what they showed as they mount,
  // so a later render would no longer see the change.
  const [unlocking] = useState(() => {
    const i = views.findIndex((v, k) => {
      if (k === 0 || v.status !== 'current') return false;
      const before = shownStatusOf(views[k - 1].level.key);
      return views[k - 1].status === 'complete' && before !== undefined && before !== 'complete';
    });
    return i > 0 ? i : null;
  });
  // The banner keeps naming the level just finished until the next one opens.
  const [bannerAt, setBannerAt] = useState(unlocking !== null ? unlocking - 1 : null);

  // docs/UI.md §7.1: the chapter being worked on is open and the rest folded.
  // While a level opens, the chapter of the level before it stays open too, so
  // the move from one to the other can be watched across the boundary.
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    const open = new Set<number>([chapterOf(hereAt)]);
    if (unlocking !== null) open.add(chapterOf(unlocking - 1));
    return open;
  });
  // Chapters opened after the first draw fade their levels in.
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const toggle = (ci: number) => {
    setOpen(null);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(ci)) next.delete(ci);
      else next.add(ci);
      return next;
    });
    setOpened((prev) => new Set(prev).add(ci));
  };

  const pathChosen = progress.path !== null;
  const amp = Math.min(76, width * 0.2);
  const cxOf = (li: number) => width / 2 + WIND[li % WIND.length] * amp;
  // Where everything sits: a header per chapter, then its levels if it is open.
  const { items, nodeAt, contentH } = useMemo(() => {
    const out: Item[] = [];
    const at: Record<number, { x: number; y: number; li: number }> = {};
    let y = space.sm;
    let gi = 0;
    chapters.forEach((c, ci) => {
      out.push({ t: 'header', ci, y });
      y += HEAD_H;
      if (expanded.has(ci)) {
        y += NODES_TOP;
        c.levels.forEach((_, li) => {
          const node = { t: 'node' as const, gi: gi + li, li, ci, x: cxOf(li), y: y + RING / 2 + li * STEP_Y };
          out.push(node);
          at[gi + li] = { x: node.x, y: node.y, li };
        });
        y += (c.levels.length - 1) * STEP_Y + RING;
        // A chapter still being wired in trails off to a note of what is next.
        const wired = c.levels.filter((l) => l.level.kind !== 'path').length;
        if (wired < c.chapter.planned) {
          out.push({
            t: 'end',
            ci,
            x: cxOf(c.levels.length),
            y: y + STEP_Y * 0.55 - RING / 2,
            text: `Levels ${wired + 1}–${c.chapter.planned} of Chapter ${c.chapter.number} soon`,
          });
          y += STEP_Y * 0.55;
        }
        y += NODES_BOTTOM;
      }
      gi += c.levels.length;
      y += CHAPTER_GAP;
    });
    // Before a path is chosen, the chapter after Chapter 1 is a closed door.
    if (!pathChosen) {
      out.push({ t: 'teaser', y });
      y += HEAD_H + CHAPTER_GAP;
    }
    return { items: out, nodeAt: at, contentH: y + BOTTOM_PAD };
    // cxOf is derived from the width
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, expanded, width, pathChosen]);

  // A label sits on the open side of its node and takes what width is left
  // there, so a long title wraps instead of running off the screen.
  const labelRoom = (li: number) =>
    WIND[li % WIND.length] > 0
      ? cxOf(li) - RING / 2 - space.sm - space.lg
      : width - (cxOf(li) + RING / 2 + space.sm) - space.lg;

  const [open, setOpen] = useState<number | null>(null);

  // "The current path in focus": the path opens scrolled to the level the
  // learner is on, and a card opened low on the screen is scrolled into view.
  const scroll = useRef<ScrollView | null>(null);
  const viewport = useRef(0);
  const [viewH, setViewH] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const scrollYRef = useRef(0);
  const focused = useRef(false);
  const focusY = (gi: number) => Math.max(0, (nodeAt[gi]?.y ?? 0) - viewport.current * 0.38);
  const onViewport = useCallback(
    (e: LayoutChangeEvent) => {
      viewport.current = e.nativeEvent.layout.height;
      setViewH(e.nativeEvent.layout.height);
      if (focused.current) return;
      focused.current = true;
      if (unlocking === null) {
        scroll.current?.scrollTo({ y: focusY(hereAt), animated: false });
        return;
      }
      // Open on the level just finished, then travel down to the one it opened.
      scroll.current?.scrollTo({ y: focusY(unlocking - 1), animated: false });
      setTimeout(
        () => scroll.current?.scrollTo({ y: focusY(unlocking), animated: !reduced }),
        reduced ? 0 : UNLOCK.scroll
      );
    },
    // focusY reads the layout of this render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeAt, hereAt, unlocking, reduced]
  );

  useEffect(() => {
    if (bannerAt === null) return;
    const t = setTimeout(() => setBannerAt(null), reduced ? 400 : UNLOCK.open);
    return () => clearTimeout(t);
    // once, on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
    setScrollY(e.nativeEvent.contentOffset.y);
  };
  const openCard = (gi: number) => {
    setOpen((prev) => (prev === gi ? null : gi));
    const cardBottom = (nodeAt[gi]?.y ?? 0) + RING / 2 + 16 + CARD_H;
    const overflow = cardBottom - (scrollYRef.current + viewport.current - space.lg);
    if (overflow > 0) scroll.current?.scrollTo({ y: scrollYRef.current + overflow, animated: true });
  };

  // docs/UI.md §7.1 "jump to current": offered once the level the learner is
  // on is off screen or folded away.
  const hereY = nodeAt[hereAt]?.y;
  const hereVisible =
    viewH === 0 || (hereY !== undefined && hereY > scrollY - RING / 2 && hereY < scrollY + viewH - RING / 2);
  const jump = () => {
    const ci = chapterOf(hereAt);
    if (!expanded.has(ci)) {
      setExpanded((prev) => new Set(prev).add(ci));
      setOpened((prev) => new Set(prev).add(ci));
      // Its levels are placed on the next render; go there once they are.
      pendingJump.current = true;
      return;
    }
    scroll.current?.scrollTo({ y: focusY(hereAt), animated: !reduced });
  };
  const pendingJump = useRef(false);
  useEffect(() => {
    if (!pendingJump.current) return;
    pendingJump.current = false;
    scroll.current?.scrollTo({ y: focusY(hereAt), animated: !reduced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeAt]);

  const allDone = bannerAt === null && views.every((v) => v.status === 'complete');
  return (
    <View style={styles.wrap}>
      <Hud
        top={insets.top}
        streak={streakDays(progress)}
        xp={xp}
        today={doneToday(progress)}
        hearts={hearts}
      />
      <Banner view={bannerAt !== null ? views[bannerAt] : here} allDone={allDone} />
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={{ height: contentH }}
        showsVerticalScrollIndicator={false}
        onLayout={onViewport}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        <Connectors
          views={views}
          nodeAt={nodeAt}
          chapterOf={chapterOf}
          ends={items.filter((it): it is Extract<Item, { t: 'end' }> => it.t === 'end')}
          width={width}
          height={contentH}
          drawing={unlocking}
        />
        {items.map((it) =>
          it.t === 'teaser' ? (
            <ChapterHeader
              key="teaser"
              view={null}
              top={it.y}
              width={width}
              expanded={false}
              onToggle={() => {}}
            />
          ) : it.t === 'header' ? (
            <ChapterHeader
              key={`h${it.ci}`}
              view={chapters[it.ci]}
              top={it.y}
              width={width}
              expanded={expanded.has(it.ci)}
              onToggle={() => toggle(it.ci)}
            />
          ) : it.t === 'end' ? (
            <PathEnd key={`e${it.ci}`} x={it.x} y={it.y} text={it.text} />
          ) : (
            <Animated.View
              key={views[it.gi].level.key}
              entering={opened.has(it.ci) ? FadeIn.duration(220) : undefined}
              style={[styles.nodeSlot, { left: it.x - RING / 2, top: it.y - RING / 2 }]}
            >
              <LevelNode
                view={views[it.gi]}
                onPress={() => openCard(it.gi)}
                unlocking={it.gi === unlocking}
              />
              <NodeLabel
                view={views[it.gi]}
                chosen={progress.path}
                side={WIND[it.li % WIND.length] > 0 ? 'left' : 'right'}
                room={labelRoom(it.li)}
              />
            </Animated.View>
          )
        )}
        {open !== null && nodeAt[open] ? (
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
              chosen={progress.path}
              top={nodeAt[open].y + RING / 2 + 16}
              arrowX={nodeAt[open].x}
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
      {!hereVisible && !allDone ? <JumpButton view={here} onPress={jump} /> : null}
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

/** What a node is called in words: "Level 4", "Checkpoint", "Your path". */
function nodeName(view: LevelView): string {
  const { kind, number } = view.level;
  if (kind === 'path') return 'Your path';
  return `Level ${number}`;
}

/** The label over a node: its number and, in words, the kind its symbol shows. */
function nodeKicker(view: LevelView): string[] {
  if (view.level.kind === 'path') return ['Your path'];
  return [nodeName(view), LEVEL_TYPE_NAME[levelTypeOf(view.level)]];
}

/**
 * "Level 4 · New ideas" on one line where the label has the room, and as two
 * whole lines -- "Level 4", then "New ideas" -- where it has not, instead of
 * breaking inside "New ideas". The one-line width is measured on an invisible
 * copy that is never squeezed, so the choice cannot flip back and forth.
 */
function Kicker({ parts, right }: { parts: string[]; right: boolean }) {
  const [full, setFull] = useState(0);
  const [box, setBox] = useState(0);
  const line = parts.join(' · ');
  const split = parts.length > 1 && full > 0 && box > 0 && full > box + 0.5;
  const align = right ? styles.alignRight : null;
  return (
    <View onLayout={(e) => setBox(e.nativeEvent.layout.width)}>
      <View style={styles.kickerProbeClip} pointerEvents="none" aria-hidden>
        <View style={styles.kickerProbe}>
          <Text style={styles.labelKicker} onLayout={(e) => setFull(e.nativeEvent.layout.width)}>
            {line}
          </Text>
        </View>
      </View>
      {split ? (
        parts.map((part) => (
          <Text key={part} style={[styles.labelKicker, align]}>
            {part}
          </Text>
        ))
      ) : (
        <Text style={[styles.labelKicker, align]}>{line}</Text>
      )}
    </View>
  );
}

/** The level the learner is on, named at the top of the path. */
function Banner({ view, allDone }: { view: LevelView; allDone: boolean }) {
  const lesson = Math.min(view.done + 1, view.total);
  const kind = view.level.kind;
  // When it comes to name a new level, the words rise into place and the
  // banner gives a small swell -- the last beat of moving on (LevelNode, UNLOCK).
  const reduced = useReduceMotion();
  const t = useSharedValue(1);
  const swell = useSharedValue(0);
  const named = useRef(view.level.key);
  useEffect(() => {
    if (named.current === view.level.key) return;
    named.current = view.level.key;
    if (reduced) return;
    t.set(0);
    t.set(withTiming(1, { duration: 420, easing: EASE_OUT }));
    swell.set(withSequence(withTiming(1, { duration: 140, easing: EASE_OUT }), withTiming(0, { duration: 420, easing: EASE_OUT })));
  }, [view.level.key, reduced, t, swell]);
  const words = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: 14 * (1 - t.get()) }],
  }));
  const whole = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.035 * swell.get() }] }));
  return (
    <Animated.View style={[styles.banner, whole]} accessibilityRole="header">
      <Animated.View style={[styles.bannerText, words]}>
        <Text style={styles.bannerKicker}>
          {allDone
            ? `Chapter ${view.level.chapter} · ${view.level.chapterTitle}`
            : `Chapter ${view.level.chapter} · ${nodeName(view)}`}
        </Text>
        <Text style={styles.bannerTitle} numberOfLines={2}>
          {allDone ? 'More levels are on the way' : view.level.title}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.bannerBadge, words]}>
        {allDone ? (
          <Icon name="check" size={22} color="#FFFFFF" strokeWidth={3} />
        ) : kind === 'lesson' ? (
          <>
            <Text style={styles.bannerBadgeValue}>{`${lesson}/${view.total}`}</Text>
            <Text style={styles.bannerBadgeLabel}>lesson</Text>
          </>
        ) : (
          <>
            <Icon
              name={kind === 'test' ? 'shield' : kind === 'final' ? 'trophy' : 'signpost'}
              size={20}
              color="#FFFFFF"
              filled
            />
            <Text style={styles.bannerBadgeLabel}>
              {kind === 'test' ? 'test' : kind === 'final' ? 'exam' : 'choice'}
            </Text>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}

/**
 * A chapter's header on the map (docs/UI.md §7.1): its number and name, the
 * levels finished of all of them, and a badge slot that lights gold when the
 * chapter is done. A tap folds the chapter away or opens it. `view` null is
 * the closed door after Chapter 1 before a path has been chosen.
 */
function ChapterHeader({
  view,
  top,
  width,
  expanded,
  onToggle,
}: {
  view: ChapterView | null;
  top: number;
  width: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const reduced = useReduceMotion();
  const turn = useSharedValue(expanded ? 1 : 0);
  useEffect(() => {
    turn.set(reduced ? (expanded ? 1 : 0) : withTiming(expanded ? 1 : 0, { duration: 200, easing: EASE_OUT }));
  }, [expanded, reduced, turn]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${180 * turn.get()}deg` }] }));
  const press = usePressFeedback(view !== null, { cue: 'tick' });

  const door = view === null;
  const done = view?.status === 'complete';
  const locked = door || view?.status === 'locked';
  const kicker = door ? 'Chapter 2' : `Chapter ${view.chapter.number}`;
  const title = door ? 'Your path starts here' : view.chapter.title;
  const meta = door
    ? 'Finish Chapter 1 and choose your path to open it.'
    : done
      ? 'Chapter complete'
      : view.done >= view.total
        ? // Every level is played and only the path node is left open.
          `${view.done}/${view.total} levels · choose your path`
        : `${view.done}/${view.total} levels`;
  const share = door ? 0 : view.done / Math.max(1, view.total);

  return (
    <Animated.View style={[styles.chapter, { top, left: space.lg, width: width - space.lg * 2 }, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${kicker}: ${title}. ${meta}`}
        accessibilityState={{ expanded, disabled: door }}
        disabled={door}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onToggle}
        style={[styles.chapterInner, locked && styles.chapterLocked]}
      >
        <View style={[styles.chapterBadge, done && styles.chapterBadgeDone]}>
          <Icon
            name={door ? 'signpost' : locked ? 'lock' : 'trophy'}
            size={22}
            color={done ? '#FFFFFF' : locked ? colors.textFaint : colors.warning}
          />
        </View>
        <View style={styles.chapterText}>
          <Text style={[styles.chapterKicker, done && { color: colors.warning }]}>{kicker}</Text>
          <Text style={[styles.chapterTitle, locked && { color: colors.textMuted }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.chapterMetaRow}>
            {door ? null : (
              <View style={styles.chapterBar}>
                <View
                  style={[
                    styles.chapterFill,
                    { width: `${share * 100}%`, backgroundColor: done ? colors.warning : colors.accent },
                  ]}
                />
              </View>
            )}
            <Text style={styles.chapterMeta} numberOfLines={2}>
              {meta}
            </Text>
          </View>
        </View>
        {door ? null : (
          <Animated.View style={chevron}>
            <Icon name="chevron-down" size={20} color={colors.textMuted} strokeWidth={2.4} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** docs/UI.md §7.1 "jump to current": back to the level waiting for the learner. */
function JumpButton({ view, onPress }: { view: LevelView; onPress: () => void }) {
  const press = usePressFeedback(true, { cue: 'tick' });
  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(120)}
      style={[styles.jump, press.style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Jump to ${nodeName(view)}`}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={styles.jumpInner}
      >
        <Icon name="target" size={18} color="#FFFFFF" />
        <Text style={styles.jumpText}>{`Jump to ${nodeName(view)}`}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// The path
// ---------------------------------------------------------------------------

function NodeLabel({
  view,
  chosen,
  side,
  room,
}: {
  view: LevelView;
  chosen: TradingPath | null;
  side: 'left' | 'right';
  room: number;
}) {
  const locked = view.status === 'locked';
  const complete = view.status === 'complete';
  const kind = view.level.kind;
  const meta =
    kind === 'path'
      ? chosen
        ? PATHS.find((p) => p.id === chosen)?.name ?? ''
        : 'Pick one of three'
      : kind === 'lesson'
        ? complete
          ? view.perfect
            ? 'Perfect'
            : 'Done'
          : `${view.done}/${view.total} lessons`
        : complete
          ? view.perfect
            ? 'Passed · Perfect'
            : 'Passed'
          : `${questionsIn(view)} questions · 70 % to pass`;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.label,
        { width: Math.max(90, Math.min(170, room)) },
        side === 'right' ? { left: RING + space.sm } : { right: RING + space.sm },
      ]}
    >
      <Kicker parts={nodeKicker(view)} right={side === 'left'} />
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
      <Text
        style={[
          styles.labelMeta,
          kind !== 'lesson' && !complete && !locked && { color: colors.warning },
          side === 'left' && styles.alignRight,
        ]}
      >
        {meta}
      </Text>
    </View>
  );
}

/** A test's scored questions: its intro's counter (docs/schema.md), or a count of them. */
function questionsIn(view: LevelView): number {
  const level = view.level.subs[0].level;
  const intro = level.screens[0];
  if (intro?.type === 'intro' && intro.counter) return intro.counter;
  return level.screens.filter((s) => isQuestion(s)).length;
}

/**
 * Dots from each level down to the next, lit as far as the learner has got:
 * the trail says which way the path runs without a line cutting through the
 * labels beside the nodes. Only within a chapter: between two chapters the
 * header is the link.
 */
function Connectors({
  views,
  nodeAt,
  chapterOf,
  ends,
  width,
  height,
  drawing,
}: {
  views: LevelView[];
  nodeAt: Record<number, { x: number; y: number }>;
  chapterOf: (gi: number) => number;
  ends: { ci: number; x: number; y: number }[];
  width: number;
  height: number;
  /** The level being unlocked: the path into it lights up top to bottom (UNLOCK). */
  drawing: number | null;
}) {
  const reduced = useReduceMotion();
  // Drawn only when the level before it sits in the same chapter, on screen.
  const drawable =
    drawing !== null && !!nodeAt[drawing] && !!nodeAt[drawing - 1] && chapterOf(drawing) === chapterOf(drawing - 1);
  const draw = useSharedValue(drawable && !reduced ? 0 : 1);
  useEffect(() => {
    if (!drawable || reduced) return;
    draw.set(withDelay(UNLOCK.draw, withTiming(1, { duration: UNLOCK.drawMs, easing: EASE_IN_OUT })));
  }, [drawable, reduced, draw]);
  // The lit copy of that one stretch sits in a window that opens downwards.
  const top = drawable ? nodeAt[(drawing as number) - 1].y : 0;
  const span = drawable ? nodeAt[drawing as number].y - top : 0;
  const reveal = useAnimatedStyle(() => ({ height: span * draw.get() }));

  const dots: { x: number; y: number; lit: boolean; seg: number }[] = [];
  const segment = (a: { x: number; y: number }, b: { x: number; y: number }, lit: boolean, seg: number) => {
    const steps = Math.max(8, Math.round((b.y - a.y) / 12));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      // A soft S between the two: out of one straight down, into the next.
      const e = t * t * (3 - 2 * t);
      const x = a.x + (b.x - a.x) * e;
      const y = a.y + (b.y - a.y) * t;
      const clear = RING / 2 + 8;
      if (Math.hypot(x - a.x, y - a.y) < clear || Math.hypot(x - b.x, y - b.y) < clear) continue;
      dots.push({ x, y, lit, seg });
    }
  };
  for (let i = 0; i < views.length - 1; i++) {
    if (!nodeAt[i] || !nodeAt[i + 1] || chapterOf(i) !== chapterOf(i + 1)) continue;
    segment(nodeAt[i], nodeAt[i + 1], views[i + 1].status !== 'locked', i);
  }
  // A chapter still being written trails off towards its note.
  for (const end of ends) {
    const last = Object.keys(nodeAt)
      .map(Number)
      .filter((gi) => chapterOf(gi) === end.ci)
      .pop();
    if (last !== undefined) segment(nodeAt[last], { x: end.x, y: end.y }, false, -1);
  }
  // While it draws, that stretch starts dim underneath its lit copy.
  const drawn = (d: (typeof dots)[number]) => drawable && d.seg === (drawing as number) - 1;
  return (
    <>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {dots.map((d, k) => {
          const lit = d.lit && !drawn(d);
          return (
            <Circle
              key={k}
              cx={d.x}
              cy={d.y}
              r={3.4}
              fill={lit ? colors.accent : colors.surfaceAlt}
              opacity={lit ? 0.75 : 1}
            />
          );
        })}
      </Svg>
      {drawable ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', left: 0, top, width, overflow: 'hidden' }, reveal]}
        >
          <Svg width={width} height={span} style={{ position: 'absolute', left: 0, top: 0 }}>
            {dots.filter(drawn).map((d, k) => (
              <Circle key={k} cx={d.x} cy={d.y - top} r={3.4} fill={colors.accent} opacity={0.75} />
            ))}
          </Svg>
        </Animated.View>
      ) : null}
    </>
  );
}

/** Where a chapter being wired in stops for now. */
function PathEnd({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <View pointerEvents="none" style={[styles.end, { top: y + RING / 2 + 6, left: x - 110 }]}>
      <Icon name="lock" size={14} color={colors.textFaint} />
      <Text style={styles.endText}>{text}</Text>
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
 * A Checkpoint or the Final Exam says what it scores and what passing takes;
 * the path choice says which path is chosen.
 */
function LevelCard({
  view,
  before,
  chosen,
  top,
  arrowX,
  width,
  hearts,
  onStart,
}: {
  view: LevelView;
  before: LevelView | null;
  chosen: TradingPath | null;
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
  const kind = view.level.kind;
  const locked = view.status === 'locked';
  const complete = view.status === 'complete';
  const xp = view.next.level.xp;
  const tone = locked ? colors.textFaint : complete ? colors.success : kind === 'lesson' ? colors.accent : colors.warning;
  const pathName = PATHS.find((p) => p.id === chosen)?.name;

  // docs/UI.md §5.2: with no hearts left a lesson or test cannot start; the
  // button says when it can instead. Choosing a path costs nothing.
  const empty = hearts.hearts === 0 && kind !== 'path';
  const press = usePressFeedback(!locked && !empty, { cue: 'advance' });
  const noun = kind === 'test' ? 'test' : kind === 'final' ? 'exam' : 'lesson 1';
  const label = empty
    ? hearts.nextAt
      ? `Next heart in ${waitText(hearts.nextAt)}`
      : 'Out of hearts'
    : kind === 'path'
      ? complete
        ? 'Change path'
        : 'Choose your path'
      : complete
        ? kind === 'lesson'
          ? 'Review lesson 1'
          : `Retake ${noun}`
        : kind !== 'lesson'
          ? `Start ${noun}`
          : view.done === 0
            ? 'Start'
            : `Continue: lesson ${view.nextIndex + 1}`;

  const opener =
    before === null
      ? ''
      : before.level.kind === 'path'
        ? 'Choose your path to open this level.'
        : before.level.kind === 'test'
          ? 'Pass the Checkpoint before it to open this.'
          : before.level.kind === 'final'
            ? 'Pass the Final Exam to open this.'
            : `Finish Level ${before.level.number} to open this.`;
  const meta = locked
    ? opener
    : kind === 'path'
      ? pathName
        ? `You are on ${pathName}. You can change it here or in Settings.`
        : 'Scalping, Day Trading or Swing Trading: pick the one that fits your day.'
      : kind === 'lesson'
        ? complete
          ? `All ${view.total} lessons done.`
          : `Lesson ${view.nextIndex + 1} of ${view.total} · +${xp} XP · about 3 min`
        : complete
          ? view.perfect
            ? 'Passed with every answer right.'
            : 'Passed. Retake it any time to practise.'
          : `${questionsIn(view)} scored questions · 70 % to pass · +${xp} XP${
              kind === 'final' ? ' and the chapter badge' : ''
            }`;
  const kicker =
    kind === 'path'
      ? 'Your path'
      : `${nodeName(view)}${complete ? (view.perfect ? ' · Perfect' : kind === 'lesson' ? ' · Done' : ' · Passed') : locked ? ' · Locked' : ''}`;

  return (
    <Animated.View style={[styles.card, { top, left, width: cardW, transformOrigin: 'top' }, enter]}>
      <View style={[styles.cardPoint, { left: arrowX - left - 8 }]} />
      <Text style={[styles.cardKicker, { color: tone }]}>{kicker}</Text>
      <Text style={styles.cardTitle}>{view.level.title}</Text>
      {view.total > 1 ? (
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
      ) : null}
      <Text style={styles.cardMeta}>{meta}</Text>
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
              <Icon name={kind === 'path' ? 'signpost' : 'play'} size={16} color="#FFFFFF" />
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
  chapter: { position: 'absolute', height: HEAD_H - space.sm },
  chapterInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  chapterLocked: { backgroundColor: 'rgba(23, 28, 35, 0.72)', borderColor: colors.border },
  chapterBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  chapterBadgeDone: { backgroundColor: colors.warning },
  chapterText: { flex: 1, gap: 1 },
  chapterKicker: { ...type.small, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  chapterTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', color: colors.text },
  chapterMetaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  chapterBar: {
    width: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  chapterFill: { height: 5, borderRadius: 3 },
  chapterMeta: { ...type.small, color: colors.textMuted, flexShrink: 1 },
  jump: { position: 'absolute', right: space.lg, bottom: space.lg },
  jumpInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 44,
    paddingHorizontal: space.lg,
    borderRadius: 22,
    backgroundColor: colors.accent,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  jumpText: { ...type.label, fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  nodeSlot: { position: 'absolute', width: RING, height: RING },
  label: { position: 'absolute', top: 10, gap: 1 },
  labelKicker: { ...type.small, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Clipped to nothing, so the measuring copy is laid out but never seen and
  // never widens the map.
  kickerProbeClip: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, overflow: 'hidden' },
  kickerProbe: { position: 'absolute', left: 0, top: 0, width: 400, flexDirection: 'row' },
  labelTitle: { fontSize: 15, lineHeight: 19, fontWeight: '700', color: colors.text },
  labelMeta: { ...type.small, color: colors.textMuted },
  alignRight: { textAlign: 'right' },
  end: {
    position: 'absolute',
    width: 220,
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
