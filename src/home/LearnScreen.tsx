import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeOut,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { LessonEntry, PATHS, TradingPath } from '../content';
import { isQuestion } from '../types';
import { noteFeedback } from '../lesson/feedback';
import { EASE_IN_OUT, EASE_OUT, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import {
  choosePath,
  DAILY_GOAL,
  doneToday,
  Hearts,
  streakDays,
  useHearts,
  useProgress,
  waitText,
} from '../progress';
import { tint, useLookSpec } from '../lesson/look';
import { PATH_CARDS } from '../screens/StaticScreens';
import { colors, MONO_FONT, radius, space, type, themed } from '../theme';
import Icon, { type IconName } from './icons';
import LevelNode, { RING, shownStatusOf, UNLOCK } from './LevelNode';
import { ChapterView, chapterViews, currentLevel, LevelView } from './pathState';
import { Gem, PathLogo } from './scenes';

/** Vertical distance between two nodes' centres. */
const STEP_Y = 148;
/** Room between a chapter's header and its first node, for the START tag. */
const NODES_TOP = 52;
/** A chapter's header card, and the space left under an expanded chapter's last node. */
const HEAD_H = 76;
const NODES_BOTTOM = 36;
const CHAPTER_GAP = 16;
/** Room under the last section for a level card opened on its last node. */
const BOTTOM_PAD = 280;
/** Room for the note after the last chapter (PathFinale). */
const FINALE_H = 120;
/** The top bar's row: its 48 pt targets. */
const HUD_ROW = 48;
/** The path winds: centre, left, centre, right, and round again. */
const WIND = [0, -1, 0, 1];

type NodeItem = { t: 'node'; gi: number; li: number; ci: number; x: number; y: number };
type Item =
  | { t: 'header'; ci: number; y: number }
  | NodeItem
  | { t: 'end'; ci: number; x: number; y: number; text: string }
  | { t: 'teaser'; y: number }
  | { t: 'finale'; y: number };

/**
 * The home screen's path (docs/UI.md §7.1): Classic's flat panels, on the
 * ground of whichever design is picked.
 *
 * - The top bar (§7.2): the path's logo, the streak, the gems and the
 *   hearts, lined up with the banner and the cards under it. A tap on the
 *   logo opens the paths.
 * - A banner with the level the learner is on.
 * - The path, chapter by chapter. Each chapter has a header card (its name,
 *   levels done of all, and a badge that lights when it is finished) and
 *   folds away under it; the chapter being worked on is open, the others
 *   folded, and any can be opened with a tap. In a chapter, one button per
 *   level winds down the screen on the look's own ground; an open level
 *   sits in a ring that fills a lesson at a time, and a finished one wears a
 *   check. Checkpoints are shields and the Final Exam a trophy. The level
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
  const amp = Math.min(64, width * 0.17);
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
          const node = {
            t: 'node' as const,
            gi: gi + li,
            li,
            ci,
            x: cxOf(li),
            y: y + RING / 2 + li * STEP_Y,
          };
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
            text: `Levels ${wired + 1}–${c.chapter.planned} are being written`,
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
    } else {
      // S26: after the last chapter, what there is and what is still to come.
      out.push({ t: 'finale', y });
      y += FINALE_H + CHAPTER_GAP;
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
  // The paths, open under the top bar's logo.
  const [picking, setPicking] = useState(false);
  const closePicker = useCallback(() => setPicking(false), []);

  // "The current path in focus": the path opens scrolled to the level the
  // learner is on, and a card opened low on the screen is scrolled into view.
  const scroll = useAnimatedRef<Animated.ScrollView>();
  // Moving on (UNLOCK), the map glides from the level just finished to the one
  // it opened: eased in and out, on the UI thread, at the pace of the spark
  // running down the path between them. A finger on the map stops it.
  const glide = useSharedValue(-1);
  useAnimatedReaction(
    () => glide.get(),
    (y, before) => {
      if (y >= 0 && y !== before) scrollTo(scroll, 0, y, false);
    },
  );
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
      const from = focusY(unlocking - 1);
      const to = focusY(unlocking);
      scroll.current?.scrollTo({ y: from, animated: false });
      if (reduced) {
        setTimeout(() => scroll.current?.scrollTo({ y: to, animated: false }), 0);
        return;
      }
      glide.set(from);
      glide.set(
        withDelay(
          UNLOCK.scroll,
          withTiming(to, { duration: UNLOCK.scrollMs, easing: EASE_IN_OUT }),
        ),
      );
    },
    // focusY reads the layout of this render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeAt, hereAt, unlocking, reduced, glide],
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
    if (overflow > 0)
      scroll.current?.scrollTo({ y: scrollYRef.current + overflow, animated: true });
  };

  // docs/UI.md §7.1 "jump to current": offered once the level the learner is
  // on is off screen or folded away.
  const hereY = nodeAt[hereAt]?.y;
  const hereVisible =
    viewH === 0 ||
    (hereY !== undefined && hereY > scrollY - RING / 2 && hereY < scrollY + viewH - RING / 2);
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
        path={progress.path}
        picking={picking}
        onPickPath={() => {
          setOpen(null);
          setPicking((v) => !v);
        }}
        streak={streakDays(progress)}
        today={doneToday(progress)}
        gems={progress.gems}
        hearts={hearts}
      />
      <Banner view={bannerAt !== null ? views[bannerAt] : here} allDone={allDone} />
      <Animated.ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={{ height: contentH }}
        showsVerticalScrollIndicator={false}
        onLayout={onViewport}
        onScroll={onScroll}
        onScrollBeginDrag={() => cancelAnimation(glide)}
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
          ) : it.t === 'finale' ? (
            <PathFinale key="finale" top={it.y} width={width} />
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
                side={WIND[it.li % WIND.length] > 0 ? 'left' : 'right'}
                room={labelRoom(it.li)}
              />
            </Animated.View>
          ),
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
      </Animated.ScrollView>
      {!hereVisible && !allDone ? <JumpButton view={here} onPress={jump} /> : null}
      {picking ? (
        <PathPicker
          top={insets.top + space.xs + HUD_ROW}
          width={width}
          path={progress.path}
          onClose={closePicker}
        />
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// HUD and banner
// ---------------------------------------------------------------------------

/**
 * docs/UI.md §7.2: the top bar -- which path (its logo, a stand-in until stage
 * BRAND), the streak, the gems (David, 2026-09-30: third, with their use to
 * come) and the hearts. It lines up with what is under it (David, 2026-10-01):
 * the logo on the banner's left edge, the hearts on its right, the streak and
 * the gems evenly between. A tap on the logo opens the paths (PathPicker). The
 * flame lights once today's goal is met, and a tap on it says how far today
 * has got ("Today 1/2"); the hearts show the wait while one is on its way back.
 */
function Hud({
  top,
  path,
  picking,
  onPickPath,
  streak,
  today,
  gems,
  hearts,
}: {
  top: number;
  path: TradingPath | null;
  /** The paths are open under the logo. */
  picking: boolean;
  onPickPath: () => void;
  streak: number;
  today: number;
  gems: number;
  hearts: Hearts;
}) {
  const spec = useLookSpec();
  const lit = today >= DAILY_GOAL;
  const done = Math.min(today, DAILY_GOAL);
  const pathName = PATHS.find((p) => p.id === path)?.name;
  const press = usePressFeedback(true, { cue: 'tick' });
  const logoPress = usePressFeedback(true, { cue: 'tick' });
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(false), 2400);
    return () => clearTimeout(t);
  }, [shown]);
  const flame = lit ? colors.warning : colors.textMuted;
  const heart = hearts.hearts > 0 ? colors.down : colors.textMuted;
  return (
    <View style={[styles.hud, { paddingTop: top + space.xs }]}>
      <Animated.View style={logoPress.style}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={pathName ? `Path: ${pathName}` : 'Path: not chosen yet'}
          accessibilityHint="Shows the paths"
          accessibilityState={{ expanded: picking }}
          onPressIn={logoPress.onPressIn}
          onPressOut={logoPress.onPressOut}
          onPress={onPickPath}
          style={[styles.hudItem, styles.hudStart]}
        >
          <PathLogo
            size={30}
            face={spec.cta.face}
            mark={spec.cta.text}
            icon={PATH_CARDS.find((c) => c.id === path)?.icon}
          />
        </Pressable>
      </Animated.View>
      <View>
        <Animated.View style={press.style}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${streak} day streak`}
            accessibilityHint="Shows today's lessons"
            onPressIn={press.onPressIn}
            onPressOut={press.onPressOut}
            onPress={() => {
              setShown((v) => !v);
              AccessibilityInfo.announceForAccessibility(`Today ${done} of ${DAILY_GOAL} lessons`);
            }}
            style={styles.hudItem}
          >
            <Icon name="flame" size={22} color={flame} filled={lit} />
            <Text style={[styles.hudValue, { color: flame }]}>{streak}</Text>
          </Pressable>
        </Animated.View>
        {/* As wide as the bar round it, not the flame, so the words are whole
            (David, 2026-09-30: it read "T..."). */}
        {shown ? (
          <Animated.View
            entering={FadeIn.duration(160)}
            exiting={FadeOut.duration(120)}
            pointerEvents="none"
            style={styles.todayWrap}
          >
            <View style={styles.today}>
              <View style={styles.todayPoint} />
              <Text style={styles.todayText} numberOfLines={1}>
                {`Today ${done}/${DAILY_GOAL}`}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </View>
      <View accessible accessibilityLabel={`${gems} gems`} style={styles.hudItem}>
        <Gem size={22} color={colors.gem} />
        <Text style={[styles.hudValue, { color: colors.gem }]}>{gems}</Text>
      </View>
      {/* docs/UI.md §5.2: while one is on its way back, the wait sits beside them. */}
      <View
        accessible
        style={[styles.hudItem, styles.hudEnd]}
        accessibilityLabel={`${hearts.hearts} hearts${
          hearts.nextAt ? `, the next one back in ${waitText(hearts.nextAt)}` : ''
        }`}
      >
        {hearts.nextAt ? <Text style={styles.hudWait}>{waitText(hearts.nextAt)}</Text> : null}
        <Icon name="heart" size={22} color={heart} filled={hearts.hearts > 0} />
        <Text style={[styles.hudValue, { color: heart }]}>{hearts.hearts}</Text>
      </View>
    </View>
  );
}

/**
 * docs/UI.md §7.2: the paths, from the top bar's logo (David, 2026-10-01: "if
 * you click the path logo you can choose the path"). A card drops from the
 * logo, as a level's card opens under its level: the three paths, the one in
 * use ticked, a path still being written shut. Before Chapter 1 is finished
 * they show shut, and it says when the choice comes (§11.4: in Chapter 1's
 * last level), as Settings does. A tap anywhere else, or Android's back
 * button, closes it.
 */
function PathPicker({
  top,
  width,
  path,
  onClose,
}: {
  top: number;
  width: number;
  path: TradingPath | null;
  onClose: () => void;
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
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);
  const chosen = path !== null;
  return (
    <View style={styles.pickerLayer} pointerEvents="box-none">
      <Pressable
        accessibilityLabel="Close the paths"
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <Animated.View
        accessibilityRole="radiogroup"
        style={[
          styles.picker,
          { top, width: Math.min(width - space.lg * 2, 360), transformOrigin: 'top left' },
          enter,
        ]}
      >
        <Text style={styles.pickerKicker} accessibilityRole="header">
          Your path
        </Text>
        {PATH_CARDS.map((card) => {
          const p = PATHS.find((x) => x.id === card.id);
          return (
            <PathOption
              key={card.id}
              name={p?.name ?? card.id}
              hold={card.hold}
              icon={card.icon}
              on={card.id === path}
              written={!!p?.written}
              open={chosen && !!p?.written}
              onPick={() => {
                if (card.id !== path) choosePath(card.id);
                onClose();
              }}
            />
          );
        })}
        <Text style={styles.pickerNote}>
          {chosen ? 'Your progress stays when you switch.' : 'You choose it after Chapter 1.'}
        </Text>
      </Animated.View>
    </View>
  );
}

/** One path in the picker: its logo, its name and how long its trades last. */
function PathOption({
  name,
  hold,
  icon,
  on,
  written,
  open,
  onPick,
}: {
  name: string;
  hold: string;
  icon: IconName;
  on: boolean;
  written: boolean;
  /** It can be picked: chosen paths are open once Chapter 1 is done. */
  open: boolean;
  onPick: () => void;
}) {
  const spec = useLookSpec();
  const press = usePressFeedback(open, { cue: on ? null : 'tick' });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: on, disabled: !open }}
        accessibilityLabel={`${name}. ${hold}${written ? '' : '. Being written'}`}
        disabled={!open}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPick}
        style={[styles.option, on && styles.optionOn]}
      >
        <PathLogo
          size={36}
          icon={icon}
          face={open || on ? spec.cta.face : colors.surfaceAlt}
          mark={open || on ? spec.cta.text : colors.textFaint}
        />
        <View style={styles.optionText}>
          <Text style={[styles.optionName, !open && !on && { color: colors.textMuted }]}>
            {name}
          </Text>
          <Text style={styles.optionHold}>{hold}</Text>
        </View>
        {on ? (
          <Icon name="check" size={20} color={colors.accent} strokeWidth={3} />
        ) : written ? null : (
          <Text style={styles.optionSoon}>Being written</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** What a node is called in words: "Level 4", "Checkpoint", "Your path". */
function nodeName(view: LevelView): string {
  const { kind, number } = view.level;
  if (kind === 'path') return 'Your path';
  return `Level ${number}`;
}

/**
 * A title as the map shows it: whole, and never broken at a hyphen ("1-" at
 * the end of one line, "Minute" on the next). A non-breaking hyphen looks the
 * same and keeps "1-Minute" together.
 */
export function unbroken(title: string): string {
  return title.replace(/-/g, '\u2011');
}

/**
 * The level the learner is on, named at the top of the path: where it is in
 * its level ("Level 4 · Lesson 1 of 3", review S9), and its title.
 */
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
    swell.set(
      withSequence(
        withTiming(1, { duration: 140, easing: EASE_OUT }),
        withTiming(0, { duration: 420, easing: EASE_OUT }),
      ),
    );
  }, [view.level.key, reduced, t, swell]);
  const words = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: 14 * (1 - t.get()) }],
  }));
  const whole = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.035 * swell.get() }] }));
  const kicker = allDone
    ? `Chapter ${view.level.chapter} · ${view.level.chapterTitle}`
    : kind === 'lesson'
      ? `${nodeName(view)} · Lesson ${lesson} of ${view.total}`
      : kind === 'test' && !/checkpoint/i.test(view.level.title)
        ? `${nodeName(view)} · Checkpoint`
        : kind === 'final' && !/final/i.test(view.level.title)
          ? `${nodeName(view)} · Final Exam`
          : kind === 'path'
            ? `Chapter ${view.level.chapter} · ${nodeName(view)}`
            : nodeName(view);
  return (
    <Animated.View style={[styles.banner, whole]} accessibilityRole="header">
      <Animated.View style={[styles.bannerText, words]}>
        <Text style={styles.bannerKicker}>{kicker}</Text>
        <Text style={styles.bannerTitle}>
          {allDone ? 'More levels are on the way' : unbroken(view.level.title)}
        </Text>
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
    turn.set(
      reduced
        ? expanded
          ? 1
          : 0
        : withTiming(expanded ? 1 : 0, { duration: 200, easing: EASE_OUT }),
    );
  }, [expanded, reduced, turn]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${180 * turn.get()}deg` }] }));
  const press = usePressFeedback(view !== null, { cue: 'tick' });

  const door = view === null;
  const done = view?.status === 'complete';
  const locked = door || view?.status === 'locked';
  const kicker = door ? 'Chapter 2' : `Chapter ${view.chapter.number}`;
  const title = door ? 'Your path starts here' : view.chapter.title;
  const meta = door
    ? 'Opens after Chapter 1.'
    : done
      ? 'Chapter complete'
      : view.done >= view.total
        ? // Every level is played and only the path node is left open.
          `${view.done}/${view.total} levels · choose your path`
        : `${view.done}/${view.total} levels`;
  const share = door ? 0 : view.done / Math.max(1, view.total);

  return (
    <Animated.View
      style={[styles.chapter, { top, left: space.lg, width: width - space.lg * 2 }, press.style]}
    >
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
            color={done ? colors.background : locked ? colors.textFaint : colors.warning}
          />
        </View>
        <View style={styles.chapterText}>
          <Text style={[styles.chapterKicker, done && { color: colors.warning }]}>{kicker}</Text>
          {/* The header keeps its height, so a long name shrinks to fit its one line. */}
          <Text
            style={[styles.chapterTitle, locked && { color: colors.textMuted }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {unbroken(title)}
          </Text>
          <View style={styles.chapterMetaRow}>
            {door ? null : (
              <View style={styles.chapterBar}>
                <View
                  style={[
                    styles.chapterFill,
                    {
                      width: `${share * 100}%`,
                      backgroundColor: done ? colors.warning : colors.accent,
                    },
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
        <Icon name="target" size={18} color={colors.accentText} />
        <Text style={styles.jumpText} numberOfLines={1}>{`Jump to ${nodeName(view)}`}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// The path
// ---------------------------------------------------------------------------

/**
 * A level's label beside it, on the side the path leaves open: its title
 * alone (docs/UI.md §7.1), in whole lines. It wraps, it is never cut off, and
 * it is one text laid out once, so nothing is drawn twice or out of place.
 */
export function NodeLabel({
  view,
  side,
  room,
}: {
  view: LevelView;
  side: 'left' | 'right';
  room: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.label,
        { width: Math.max(90, Math.min(170, room)) },
        side === 'right' ? { left: RING + space.sm } : { right: RING + space.sm },
      ]}
    >
      <Text
        style={[
          styles.labelTitle,
          view.status === 'locked' && { color: colors.textMuted },
          side === 'left' && styles.alignRight,
        ]}
      >
        {unbroken(view.level.title)}
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
 *
 * Moving on (UNLOCK), the stretch into the level that opened lights up as a
 * spark runs down it: each dot pops as the spark passes, and five notes climb
 * the scale on the way, each a light tap (David, 2026-09-30: smoother, with
 * haptics and sounds).
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
    drawing !== null &&
    !!nodeAt[drawing] &&
    !!nodeAt[drawing - 1] &&
    chapterOf(drawing) === chapterOf(drawing - 1);
  const draw = useSharedValue(drawable && !reduced ? 0 : 1);
  useEffect(() => {
    if (!drawable || reduced) return;
    draw.set(
      withDelay(UNLOCK.draw, withTiming(1, { duration: UNLOCK.drawMs, easing: EASE_IN_OUT })),
    );
    // The notes climb C5 to A5 as the spark runs, under the unlock's G5 to E6.
    const timers = [0, 1, 2, 3, 4].map((step) =>
      setTimeout(() => noteFeedback(step), UNLOCK.draw + 60 + step * ((UNLOCK.drawMs - 120) / 4)),
    );
    return () => timers.forEach(clearTimeout);
  }, [drawable, reduced, draw]);

  const dots: { x: number; y: number; t: number; lit: boolean; seg: number }[] = [];
  const segment = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    lit: boolean,
    seg: number,
  ) => {
    const steps = Math.max(8, Math.round((b.y - a.y) / 12));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      // A soft S between the two: out of one straight down, into the next.
      const e = t * t * (3 - 2 * t);
      const x = a.x + (b.x - a.x) * e;
      const y = a.y + (b.y - a.y) * t;
      const clear = RING / 2 + 8;
      if (Math.hypot(x - a.x, y - a.y) < clear || Math.hypot(x - b.x, y - b.y) < clear) continue;
      dots.push({ x, y, t, lit, seg });
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
  const trail = dots.filter(drawn);
  const t0 = trail[0]?.t ?? 0;
  const t1 = trail[trail.length - 1]?.t ?? 1;
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
      {drawable && trail.length ? (
        <>
          {trail.map((d, k) => (
            <TrailDot
              key={k}
              x={d.x}
              y={d.y}
              at={(d.t - t0) / Math.max(0.001, t1 - t0)}
              draw={draw}
            />
          ))}
          <TrailSpark
            a={nodeAt[(drawing as number) - 1]}
            b={nodeAt[drawing as number]}
            t0={t0}
            t1={t1}
            draw={draw}
          />
        </>
      ) : null}
    </>
  );
}

/** One dot of the stretch being lit: it pops, a size too big, as the spark reaches it. */
function TrailDot({
  x,
  y,
  at,
  draw,
}: {
  x: number;
  y: number;
  /** How far along the run the spark reaches it, 0 to 1. */
  at: number;
  draw: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const s = Math.min(1, Math.max(0, (draw.get() - at) / 0.14));
    const scale = s <= 0 ? 0 : s < 0.45 ? 1.9 * (s / 0.45) : 1.9 - 0.9 * ((s - 0.45) / 0.55);
    return { opacity: s > 0 ? 0.75 : 0, transform: [{ scale }] };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.trailDot, { left: x - 3.4, top: y - 3.4 }, style]}
    />
  );
}

/** The spark: a bright point in a glow, running the stretch's own curve from one level to the next. */
function TrailSpark({
  a,
  b,
  t0,
  t1,
  draw,
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  t0: number;
  t1: number;
  draw: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const d = draw.get();
    const t = t0 + (t1 - t0) * d;
    const e = t * t * (3 - 2 * t);
    const x = a.x + (b.x - a.x) * e;
    const y = a.y + (b.y - a.y) * t;
    return {
      opacity: d <= 0 || d >= 1 ? 0 : Math.min(1, d / 0.06, (1 - d) / 0.12),
      transform: [{ translateX: x - SPARK / 2 }, { translateY: y - SPARK / 2 }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.spark, style]}>
      <View style={styles.sparkGlow} />
      <View style={styles.sparkCore} />
    </Animated.View>
  );
}

/** The spark's glow, across. */
const SPARK = 26;

/**
 * S26: the end of the map. No "soon" without context: it says that this is
 * everything written so far, what is still being written, and where practice
 * will be.
 */
function PathFinale({ top, width }: { top: number; width: number }) {
  return (
    <View style={[styles.finale, { top, left: space.lg, width: width - space.lg * 2 }]}>
      <View style={styles.finaleHead}>
        <Icon name="signpost" size={18} color={colors.textMuted} />
        <Text style={styles.finaleTitle}>The end of the map, for now</Text>
      </View>
      <Text style={styles.finaleText}>
        Every lesson so far is on it. Chapter 8 gets one more level before the release, and after
        the course the Practice tab keeps you sharp.
      </Text>
    </View>
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
 * the time, and Start. It opens under the level it belongs to, with
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
  const tone = locked
    ? colors.textFaint
    : complete
      ? colors.success
      : kind === 'lesson'
        ? colors.accent
        : colors.warning;
  const pathName = PATHS.find((p) => p.id === chosen)?.name;

  // docs/UI.md §5.2: with no hearts left a lesson or test cannot start; the
  // button says when it can instead. Choosing a path costs nothing.
  const empty = hearts.hearts === 0 && kind !== 'path';
  const press = usePressFeedback(!locked && !empty, { cue: 'advance' });
  // Fewer words (David, stage LOOK-BRIEF): the key says what it does, and the
  // line above it where the level stands.
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
          ? 'Review'
          : 'Retake'
        : kind === 'lesson' && view.done > 0
          ? 'Continue'
          : 'Start';

  const opener =
    before === null
      ? ''
      : before.level.kind === 'path'
        ? 'Choose your path first.'
        : before.level.kind === 'test'
          ? 'Pass the Checkpoint first.'
          : before.level.kind === 'final'
            ? 'Pass the Final Exam first.'
            : `Finish Level ${before.level.number} first.`;
  const meta = locked
    ? opener
    : kind === 'path'
      ? pathName
        ? `You are on ${pathName}.`
        : 'Scalping, Day Trading or Swing Trading.'
      : kind === 'lesson'
        ? complete
          ? `All ${view.total} lessons done.`
          : `Lesson ${view.nextIndex + 1} of ${view.total} · about 3 min`
        : complete
          ? view.perfect
            ? 'Passed, every answer right.'
            : 'Passed.'
          : `${questionsIn(view)} questions · 70 % to pass`;
  const kicker = kind === 'path' ? 'Your path' : nodeName(view);

  return (
    <Animated.View
      style={[styles.card, { top, left, width: cardW, transformOrigin: 'top' }, enter]}
    >
      <View style={[styles.cardPoint, { left: arrowX - left - 8 }]} />
      <Text style={[styles.cardKicker, { color: tone }]}>{kicker}</Text>
      <Text style={styles.cardTitle}>{unbroken(view.level.title)}</Text>
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
            testID="key"
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
              <Icon
                name={kind === 'path' ? 'signpost' : 'play'}
                size={16}
                color={colors.accentText}
              />
            )}
            {/* docs/UI.md §10: a key's label is one line, always; a long one shrinks to fit. */}
            <Text
              style={[
                styles.cardButtonText,
                complete && { color: colors.text },
                empty && { color: colors.textMuted },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {label}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = themed(() => ({
  wrap: { flex: 1 },
  // Over the banner, so the flame's "Today 1/2" can drop down across it. As
  // wide as the banner: its first and last items sit on the banner's edges.
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.xs,
    zIndex: 2,
  },
  hudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 48,
    minHeight: 48,
  },
  // The 48 pt targets reach past their icons; these keep the icons on the edges.
  hudStart: { justifyContent: 'flex-start' },
  hudEnd: { justifyContent: 'flex-end' },
  hudValue: { fontSize: 17, lineHeight: 22, fontWeight: '800', fontFamily: MONO_FONT },
  hudWait: {
    ...type.small,
    color: colors.textMuted,
    fontFamily: MONO_FONT,
    marginRight: 2,
  },
  todayWrap: { position: 'absolute', top: 48, left: -90, right: -90, alignItems: 'center' },
  today: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
  },
  todayPoint: {
    position: 'absolute',
    top: -7,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: colors.surface,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: colors.borderStrong,
    transform: [{ rotate: '45deg' }],
  },
  todayText: { ...type.label, color: colors.text, fontFamily: MONO_FONT },

  // Over everything, the top bar too, so a tap anywhere else closes it.
  pickerLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 3 },
  picker: {
    position: 'absolute',
    left: space.lg,
    padding: space.sm,
    gap: 2,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    shadowColor: colors.shade,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  pickerKicker: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: space.sm,
    paddingTop: space.xs,
    paddingBottom: space.xs,
  },
  pickerNote: {
    ...type.small,
    color: colors.textMuted,
    paddingHorizontal: space.sm,
    paddingTop: space.xs,
    paddingBottom: space.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  optionOn: { backgroundColor: colors.accentTint },
  optionText: { flex: 1, gap: 1 },
  optionName: { ...type.answer, fontWeight: '700', color: colors.text },
  optionHold: { ...type.small, color: colors.textMuted },
  optionSoon: { ...type.small, color: colors.textFaint },

  banner: {
    marginHorizontal: space.lg,
    marginBottom: space.xs,
    backgroundColor: colors.accentFill,
    borderRadius: 14,
    paddingVertical: space.md,
    paddingLeft: space.lg,
    paddingRight: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  bannerText: { flex: 1, gap: 2, minHeight: 52, justifyContent: 'center' },
  bannerKicker: {
    ...type.label,
    color: colors.accentText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bannerTitle: { ...type.title, color: colors.accentText },

  scroll: { flex: 1 },
  chapter: { position: 'absolute', height: HEAD_H - space.sm },
  chapterInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  chapterLocked: { backgroundColor: tint(colors.surface, 0.72), borderColor: colors.border },
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
  chapterKicker: {
    ...type.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
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
    backgroundColor: colors.accentFill,
    shadowColor: colors.shade,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  jumpText: { ...type.label, fontSize: 14, color: colors.accentText, fontWeight: '700' },
  nodeSlot: { position: 'absolute', width: RING, height: RING },
  trailDot: {
    position: 'absolute',
    width: 6.8,
    height: 6.8,
    borderRadius: 3.4,
    backgroundColor: colors.accent,
  },
  spark: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SPARK,
    height: SPARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkGlow: {
    position: 'absolute',
    width: SPARK,
    height: SPARK,
    borderRadius: SPARK / 2,
    backgroundColor: colors.accent,
    opacity: 0.28,
  },
  sparkCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  // Beside its node, centred on it.
  label: { position: 'absolute', top: 0, height: RING, justifyContent: 'center' },
  labelTitle: { fontSize: 15, lineHeight: 19, fontWeight: '700', color: colors.text },
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
  finale: {
    position: 'absolute',
    minHeight: FINALE_H,
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.surfaceAlt,
  },
  finaleHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  finaleTitle: { ...type.prompt, color: colors.text },
  finaleText: { ...type.small, color: colors.textMuted },

  card: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
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
    borderColor: colors.borderStrong,
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
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  cardButtonQuiet: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  cardButtonEmpty: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardButtonText: { ...type.prompt, fontSize: 17, color: colors.accentText, flexShrink: 1 },
}));
