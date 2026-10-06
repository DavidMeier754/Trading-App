import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useDisplayFace } from '../fonts';
import { usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, space, type, themed } from '../theme';
import Icon from './icons';
import type { ChapterView, LevelView } from './pathState';

/**
 * docs/ui/10-path-map.md §7.1 [David, 2026-10-06] The chapter switcher: the map's
 * alternative to the chapter cards (home/mapStyle.ts, `switcher`). The banner
 * holds a chapter, and ‹ › step through them:
 *
 * - the chapter the learner is in: blue, its name over the level they are on
 *   ("Level 4 · Lesson 1 of 3") and that level's title, as the banner always was;
 * - a finished chapter: gold with a sheen and a check, its name and "17/17";
 * - a chapter still ahead: plain and quiet, with a lock and when it opens;
 * - before a path is chosen, the closed door after Chapter 1.
 *
 * Under the words a pip per chapter tells them apart at a glance -- gold done,
 * blue now, hollow ahead -- with the one shown ringed. A tap on the words
 * opens all the chapters at a glance (ChaptersOverview), as the banner did.
 * Nothing moves unless the learner moved it: the words change with a short
 * fade when an arrow is pressed, and not otherwise.
 */
export type SwitcherItem = { kind: 'chapter'; view: ChapterView } | { kind: 'door' };

export default function ChapterSwitcher({
  items,
  shown,
  hereCi,
  here,
  allDone,
  onStep,
  onPress,
}: {
  items: SwitcherItem[];
  /** The item in the banner. */
  shown: number;
  /** The chapter the learner is in. */
  hereCi: number;
  /** The level the learner is on (or was just on, while the next one opens). */
  here: LevelView;
  allDone: boolean;
  onStep: (by: -1 | 1) => void;
  onPress: () => void;
}) {
  const display = useDisplayFace();
  const reduced = useReduceMotion();
  const item = items[shown];
  const view = item.kind === 'chapter' ? item.view : null;
  const tone: 'now' | 'done' | 'ahead' =
    item.kind === 'door'
      ? 'ahead'
      : shown === hereCi && !allDone
        ? 'now'
        : view!.status === 'complete'
          ? 'done'
          : shown === hereCi
            ? 'now'
            : 'ahead';

  const number = view ? view.chapter.number : 2;
  const name = view ? view.chapter.title : 'Your path starts here';
  let kicker: string;
  let title: string;
  let meta: string;
  if (tone === 'now') {
    const lesson = Math.min(here.done + 1, here.total);
    const where =
      here.level.kind === 'lesson'
        ? `Level ${here.level.number} · Lesson ${lesson} of ${here.total}`
        : here.level.title;
    kicker = `Chapter ${number} · ${name}`;
    title = allDone ? 'More levels are on the way' : here.level.title;
    meta = allDone ? `${view!.done}/${view!.total} levels` : where;
  } else if (tone === 'done') {
    kicker = `Chapter ${number} · Complete`;
    title = name;
    meta = `${view!.total}/${view!.total} levels`;
  } else {
    kicker = `Chapter ${number}`;
    title = name;
    meta = item.kind === 'door' ? 'Opens after Chapter 1.' : `Opens after Chapter ${number - 1}`;
  }

  const ink = tone === 'now' ? colors.accentText : tone === 'done' ? colors.goldText : colors.text;
  const quiet =
    tone === 'now' ? colors.accentText : tone === 'done' ? colors.goldText : colors.textMuted;
  const press = usePressFeedback(true, { cue: 'tick' });
  const first = shown === 0;
  const last = shown === items.length - 1;

  return (
    <View
      style={[
        styles.banner,
        tone === 'now' && styles.now,
        tone === 'done' && styles.done,
        tone === 'ahead' && styles.ahead,
      ]}
    >
      {tone === 'done' ? <Sheen /> : null}
      <Arrow dir={-1} disabled={first} color={ink} onPress={() => onStep(-1)} />
      <Animated.View style={[styles.middle, press.style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${kicker}. ${title}. ${meta}`}
          accessibilityHint="Shows all the chapters"
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          onPress={onPress}
          style={styles.words}
        >
          <Animated.View
            key={shown}
            entering={reduced ? undefined : FadeIn.duration(180)}
            style={styles.wordsInner}
          >
            <View style={styles.kickerRow}>
              {tone === 'done' ? (
                <View style={styles.check}>
                  <Icon name="check" size={13} color={colors.goldFill} strokeWidth={3} />
                </View>
              ) : tone === 'ahead' ? (
                <Icon name="lock" size={14} color={colors.textMuted} />
              ) : null}
              <Text style={[styles.kicker, { color: quiet }]} numberOfLines={1}>
                {kicker}
              </Text>
            </View>
            <Text
              style={[styles.title, display, { color: ink, fontSize: titleSize(title) }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.meta, { color: quiet }]} numberOfLines={1}>
                {meta}
              </Text>
              <Pips items={items} shown={shown} hereCi={hereCi} tone={tone} />
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
      <Arrow dir={1} disabled={last} color={ink} onPress={() => onStep(1)} />
    </View>
  );
}

/**
 * The title's size: the banner keeps one height, so a long title gets a
 * smaller face rather than a second line (adjustsFontSizeToFit does nothing
 * on the web).
 */
function titleSize(title: string): number {
  return title.length > 26 ? 17 : title.length > 20 ? 19 : 23;
}

/** ‹ or ›: a 48 pt key with a chevron. At either end it stays, faded and off. */
function Arrow({
  dir,
  disabled,
  color,
  onPress,
}: {
  dir: -1 | 1;
  disabled: boolean;
  color: string;
  onPress: () => void;
}) {
  const press = usePressFeedback(!disabled, { cue: 'tick' });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dir < 0 ? 'Chapter before' : 'Next chapter'}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={[styles.arrow, disabled && styles.arrowOff]}
      >
        <View style={{ transform: [{ rotate: dir < 0 ? '90deg' : '-90deg' }] }}>
          <Icon name="chevron-down" size={22} color={color} strokeWidth={2.6} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * A pip per chapter: gold done, blue the one the learner is in, hollow ahead;
 * the one in the banner ringed.
 */
function Pips({
  items,
  shown,
  hereCi,
  tone,
}: {
  items: SwitcherItem[];
  shown: number;
  hereCi: number;
  tone: 'now' | 'done' | 'ahead';
}) {
  // On the blue and the gold the pips need a light rim to show.
  const rim = tone === 'ahead' ? colors.borderStrong : 'rgba(255, 255, 255, 0.75)';
  return (
    <View style={styles.pips} accessibilityElementsHidden importantForAccessibility="no">
      {items.map((it, k) => {
        const done = it.kind === 'chapter' && it.view.status === 'complete';
        const now = k === hereCi && !done;
        return (
          <View
            key={k}
            style={[
              styles.pip,
              { borderColor: rim },
              // On the gold itself a done pip is the gold's ink, or it would vanish.
              done && { backgroundColor: tone === 'done' ? colors.goldText : colors.goldFill },
              now && { backgroundColor: tone === 'now' ? colors.accentText : colors.accentFill },
              k === shown && styles.pipShown,
            ]}
          />
        );
      })}
    </View>
  );
}

/** The gold's sheen: a band of light across it, still. */
function Sheen() {
  return (
    <View style={styles.sheen} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="chapterSheen" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="0.38" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.38" />
            <Stop offset="0.62" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#chapterSheen)" />
      </Svg>
    </View>
  );
}

const styles = themed(() => ({
  banner: {
    marginHorizontal: space.lg,
    marginBottom: space.xs,
    borderRadius: 14,
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  now: { backgroundColor: colors.accentFill },
  done: { backgroundColor: colors.goldFill },
  ahead: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  sheen: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  arrow: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  arrowOff: { opacity: 0.35 },
  middle: { flex: 1 },
  words: { minHeight: 72, justifyContent: 'center' },
  wordsInner: { gap: 2 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.goldText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 1 },
  title: { ...type.title },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  meta: { ...type.label, fontWeight: '500', flexShrink: 1 },
  pips: { flexDirection: 'row', gap: 4, marginLeft: 'auto' },
  pip: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
  pipShown: { transform: [{ scale: 1.35 }] },
}));
