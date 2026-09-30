import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { chaptersFor, PathLevel } from '../content';
import { tapFeedback } from '../lesson/feedback';
import { EASE_OUT, SPRING_POP, usePressFeedback } from '../lesson/motion';
import {
  addGems,
  MAX_HEARTS,
  refillHearts,
  skipTo,
  useHearts,
  useProgress,
  waitText,
} from '../progress';
import { colors, radius, space, themed, type } from '../theme';
import Icon from './icons';
import { Gem } from './scenes';
import { forgetShownPath } from './LevelNode';
import { pageStyles, RowButton, rowStyles } from './pageParts';
import { pathView } from './pathState';

/**
 * Settings → Testing (docs/UI.md §11.5): the testing tools, in test builds
 * only, as a section of Settings itself (David, 2026-09-30: "bring back all
 * the developer options into the settings"). Three change the learner's
 * progress on the spot -- the hearts back, gems for the top bar, a jump ahead --
 * and three open pages of their own: the lesson with every screen type, the
 * Animations page and the Design suggestions.
 */
export default function TestingTools({
  onOpenBench,
  onOpenAnimations,
  onOpenSuggestions,
}: {
  onOpenBench: () => void;
  onOpenAnimations: () => void;
  onOpenSuggestions: () => void;
}) {
  return (
    <>
      <Text style={pageStyles.section}>Testing</Text>
      <HeartsRow />
      <GemsRow />
      <SkipRow />
      <RowButton
        icon="flask"
        title="Every screen type"
        sub="The test lesson"
        onPress={onOpenBench}
      />
      <RowButton
        icon="play"
        title="Animations"
        sub="Rare moments, on a tap"
        onPress={onOpenAnimations}
      />
      <RowButton
        icon="bulb"
        title="Design suggestions"
        sub="Ideas for the look"
        onPress={onOpenSuggestions}
      />
    </>
  );
}

/**
 * While hearts are being tried out: every heart back in one tap, without
 * waiting out the four hours. Goes when the refill rules settle.
 */
function HeartsRow() {
  const { hearts, nextAt } = useHearts();
  const full = hearts >= MAX_HEARTS;
  const press = usePressFeedback(!full, { cue: 'tick' });
  const pop = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: full }}
        disabled={full}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={() => {
          refillHearts();
          pop.set(
            withSequence(
              withTiming(1.3, { duration: 120, easing: EASE_OUT }),
              withSpring(1, SPRING_POP),
            ),
          );
        }}
        style={rowStyles.row}
      >
        <Animated.View style={[rowStyles.rowIcon, { backgroundColor: colors.downTint }, popStyle]}>
          <Icon name="heart" size={22} color={colors.down} />
        </Animated.View>
        <View style={rowStyles.rowText}>
          <Text style={[rowStyles.rowTitle, full && { color: colors.textMuted }]}>
            Refill hearts
          </Text>
          <Text style={rowStyles.rowSub}>
            {full
              ? `All ${MAX_HEARTS} are here.`
              : `${hearts} of ${MAX_HEARTS}${nextAt ? ` · next in ${waitText(nextAt)}` : ''}`}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Gems for the top bar (David, 2026-09-30), 50 a tap, while nothing in the
 * app hands them out yet: to see the count at two and three digits.
 */
function GemsRow() {
  const { gems } = useProgress();
  const press = usePressFeedback(true, { cue: 'coin' });
  const pop = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={() => {
          addGems(50);
          pop.set(
            withSequence(
              withTiming(1.3, { duration: 120, easing: EASE_OUT }),
              withSpring(1, SPRING_POP),
            ),
          );
        }}
        style={rowStyles.row}
      >
        <Animated.View style={[rowStyles.rowIcon, popStyle]}>
          <Gem size={22} color={colors.gem} />
        </Animated.View>
        <View style={rowStyles.rowText}>
          <Text style={rowStyles.rowTitle}>Add 50 gems</Text>
          <Text style={rowStyles.rowSub}>{`${gems} in the top bar · their use comes later`}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Jump ahead to any level. Everything before it counts as done, with its XP;
 * the level itself and what comes after are left as they are. Past Chapter 1
 * the path is set to Scalping, the one that is written.
 */
function SkipRow() {
  const progress = useProgress();
  const [open, setOpen] = useState(false);
  const [landed, setLanded] = useState<string | null>(null);
  const chapters = chaptersFor(progress.path ?? 'scalping');
  const press = usePressFeedback(true, { cue: 'tick' });
  const views = pathView(progress);
  const here = views.find((v) => v.status === 'current');
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.set(withTiming(open ? 1 : 0, { duration: 200, easing: EASE_OUT }));
  }, [open, turn]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${180 * turn.get()}deg` }] }));

  return (
    <View style={styles.skipCard}>
      <Animated.View style={press.style}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          onPress={() => setOpen((o) => !o)}
          style={styles.skipHead}
        >
          <View style={rowStyles.rowIcon}>
            <Icon name="next" size={22} color={colors.accent} />
          </View>
          <View style={rowStyles.rowText}>
            <Text style={rowStyles.rowTitle}>Skip ahead</Text>
            <Text style={rowStyles.rowSub}>
              {landed ?? (here ? `On ${labelOf(here.level)}` : 'Pick a level')}
            </Text>
          </View>
          <Animated.View style={chevron}>
            <Icon name="chevron-down" size={20} color={colors.textMuted} strokeWidth={2.4} />
          </Animated.View>
        </Pressable>
      </Animated.View>
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.skipList}>
          {chapters.map((chapter) => (
            <View key={chapter.number} style={styles.skipChapter}>
              <Text
                style={styles.skipChapterTitle}
              >{`Chapter ${chapter.number} · ${chapter.title}`}</Text>
              {chapter.levels.map((level) => {
                const view = views.find((v) => v.level.key === level.key);
                const status = view?.status ?? 'locked';
                return (
                  <Pressable
                    key={level.key}
                    accessibilityRole="button"
                    accessibilityLabel={`Skip to ${labelOf(level)}: ${level.title}`}
                    onPressIn={tapFeedback}
                    onPress={() => {
                      skipTo(level.key);
                      forgetShownPath();
                      setLanded(`Jumped to ${labelOf(level)}. Everything before it is done.`);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [styles.skipItem, pressed && styles.skipItemPressed]}
                  >
                    <Text style={styles.skipNum}>
                      {level.kind === 'path' ? '→' : String(level.number)}
                    </Text>
                    <Text style={styles.skipTitle} numberOfLines={1}>
                      {level.title}
                    </Text>
                    <Text
                      style={[
                        styles.skipState,
                        status === 'complete' && { color: colors.success },
                        status === 'current' && { color: colors.accent },
                      ]}
                    >
                      {status === 'complete' ? 'Done' : status === 'current' ? 'Here' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

/** "Level 4", "Chapter 2, Level 5", "the path choice" -- a level named in a sentence. */
function labelOf(level: PathLevel): string {
  if (level.kind === 'path') return 'the path choice';
  const where = level.chapter > 1 ? `Chapter ${level.chapter}, ` : '';
  return `${where}Level ${level.number}`;
}

const styles = themed(() => ({
  skipCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  skipHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  skipList: { paddingHorizontal: space.md, paddingBottom: space.md, gap: space.md },
  skipChapter: { gap: 2 },
  skipChapterTitle: {
    ...type.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.xs,
    marginLeft: space.sm,
  },
  skipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 48,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  skipItemPressed: { backgroundColor: colors.surfaceAlt },
  skipNum: {
    ...type.label,
    color: colors.textMuted,
    width: 22,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  skipTitle: { ...type.answer, color: colors.text, flex: 1 },
  skipState: { ...type.small, color: colors.textMuted, width: 40, textAlign: 'right' },
}));
