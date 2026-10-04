import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { noteFeedback } from '../lesson/feedback';
import { EASE_IN_OUT, EASE_OUT, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, MONO_FONT, radius, space, themed, type } from '../theme';
import Icon from './icons';
import type { ChapterView } from './pathState';

/** The course's chapters: Chapter 1, then a path's seven. */
const CHAPTERS = 8;
/** A tier's 48 pt row, and the bar drawn in it. */
const PITCH = 48;
const BAR_H = 40;
const ZOOM_MS = 520;

type Tier = {
  /** Its place in the map's chapters, or null for one not open to this learner yet. */
  ci: number | null;
  n: number;
  title: string;
  status: 'done' | 'current' | 'locked';
  done: number;
  total: number;
};

/**
 * docs/UI.md §7.1 [DESIGN-REVIEW] "All eight chapters at a glance" (David's
 * pick of 2026-10-04): a tap on the map's banner opens the course as a
 * mountain of eight tiers, Chapter 1 at its foot -- the chapters done in gold,
 * the one being played in the accent with "You" on it, the rest locked. A tap
 * on a tier that is open zooms it up to fill the view while the others part
 * and fade, and the map goes to that chapter. Before a path is chosen the
 * tiers above Chapter 1 are the path's, still to come.
 */
export default function ChaptersOverview({
  chapters,
  width,
  top,
  onPick,
  onClose,
}: {
  chapters: ChapterView[];
  width: number;
  top: number;
  onPick: (ci: number) => void;
  onClose: () => void;
}) {
  const reduced = useReduceMotion();
  const tiers: Tier[] = Array.from({ length: CHAPTERS }, (_, i) => {
    const view = chapters[i];
    if (!view) {
      return { ci: null, n: i + 1, title: 'Your path', status: 'locked', done: 0, total: 0 };
    }
    return {
      ci: i,
      n: view.chapter.number,
      title: view.chapter.title,
      status: view.status === 'complete' ? 'done' : view.status === 'locked' ? 'locked' : 'current',
      done: view.done,
      total: view.total,
    };
  });
  const w = Math.min(320, width - space.lg * 2);
  // Each tier up is this much narrower: a mountain, with Chapter 1 at its foot.
  const step = Math.round(w * 0.042);
  const h = PITCH * CHAPTERS;
  const [sel, setSel] = useState<number | null>(null);
  const z = useSharedValue(0);
  const show = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!reduced) show.set(withTiming(1, { duration: 220, easing: EASE_OUT }));
    // The tiers come in from the foot up, a note each.
    if (reduced) return;
    const timers = [0, 1, 2, 3].map((k) => setTimeout(() => noteFeedback(k * 2), 60 + k * 70));
    return () => timers.forEach(clearTimeout);
  }, [reduced, show]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const pick = (i: number) => {
    const tier = tiers[i];
    if (sel !== null || tier.ci === null || tier.status === 'locked') return;
    setSel(i);
    if (reduced) {
      onPick(tier.ci);
      return;
    }
    z.set(withTiming(1, { duration: ZOOM_MS, easing: EASE_IN_OUT }));
    setTimeout(() => onPick(tier.ci as number), ZOOM_MS + 40);
  };

  const sheet = useAnimatedStyle(() => ({
    opacity: show.get(),
    transform: [{ translateY: -8 * (1 - show.get()) }],
  }));

  return (
    <View style={styles.layer}>
      <Pressable
        accessibilityLabel="Close all chapters"
        style={[StyleSheet.absoluteFill, styles.scrim]}
        onPress={onClose}
      />
      <Animated.View style={[styles.sheet, { top, width: w + space.lg * 2 }, sheet]}>
        <View style={styles.head}>
          <Text style={styles.title}>All chapters</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={styles.close}
          >
            <Icon name="chevron-down" size={20} color={colors.textMuted} strokeWidth={2.4} />
          </Pressable>
        </View>
        <View style={{ width: w, height: h }}>
          {tiers.map((tier, i) => (
            <TierBar
              key={tier.n}
              tier={tier}
              index={i}
              w={w - i * step}
              full={w}
              h={h}
              sel={sel}
              z={z}
              onPress={() => pick(i)}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

function TierBar({
  tier,
  index,
  w,
  full,
  h,
  sel,
  z,
  onPress,
}: {
  tier: Tier;
  index: number;
  w: number;
  full: number;
  h: number;
  sel: number | null;
  z: SharedValue<number>;
  onPress: () => void;
}) {
  const x = (full - w) / 2;
  const y = h - (index + 1) * PITCH;
  const chosen = sel === index;
  const away = sel !== null && !chosen;
  const above = sel !== null && index > sel;
  const open = tier.status !== 'locked' && tier.ci !== null;
  const press = usePressFeedback(open && sel === null, { cue: 'tick' });
  const fill =
    tier.status === 'done'
      ? colors.warningTint
      : tier.status === 'current'
        ? colors.accentFill
        : colors.surface;
  const edge =
    tier.status === 'done'
      ? colors.warning
      : tier.status === 'current'
        ? colors.accentFill
        : colors.border;
  const ink =
    tier.status === 'done'
      ? colors.warning
      : tier.status === 'current'
        ? colors.accentText
        : colors.textMuted;

  // The chosen tier grows to fill the view; the others part, up and down, and fade.
  const frame = useAnimatedStyle(() => {
    const k = chosen ? z.get() : 0;
    const gone = away ? z.get() : 0;
    return {
      left: x * (1 - k),
      top: y * (1 - k),
      width: w + (full - w) * k,
      height: PITCH + (h - PITCH) * k,
      opacity: Math.max(0, 1 - gone * 1.6),
      transform: [{ translateY: (above ? -28 : 28) * gone }, { scale: 1 - 0.06 * gone }],
    };
  });
  const bar = useAnimatedStyle(() => {
    const k = chosen ? z.get() : 0;
    const inset = ((PITCH - BAR_H) / 2) * (1 - k);
    return { top: inset, bottom: inset, borderRadius: 10 + 8 * k };
  });
  const state =
    tier.status === 'done'
      ? 'Chapter complete'
      : tier.status === 'current'
        ? `You are here, ${tier.done} of ${tier.total} levels`
        : 'Locked';

  return (
    <Animated.View style={[styles.slot, chosen && styles.chosen, frame]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Chapter ${tier.n}: ${tier.title}. ${state}`}
        accessibilityState={{ disabled: !open }}
        disabled={!open || sel !== null}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View
          style={[styles.bar, { borderColor: edge, backgroundColor: fill }, bar, press.style]}
        >
          <View style={styles.row}>
            <Text style={[styles.num, { color: ink }]}>{tier.n}</Text>
            <Text style={[styles.name, { color: ink }]} numberOfLines={1}>
              {tier.title}
            </Text>
            {tier.status === 'current' ? (
              <View style={styles.you}>
                <Text style={styles.youText}>You</Text>
              </View>
            ) : (
              <Icon
                name={tier.status === 'done' ? 'check' : 'lock'}
                size={16}
                color={tier.status === 'done' ? colors.warning : colors.textFaint}
                strokeWidth={tier.status === 'done' ? 3 : 2}
              />
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = themed(() => ({
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 3 },
  scrim: { backgroundColor: colors.scrim },
  sheet: {
    position: 'absolute',
    alignSelf: 'center',
    padding: space.lg,
    paddingTop: space.sm,
    gap: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.title, color: colors.text },
  close: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -12,
  },
  slot: { position: 'absolute' },
  chosen: { zIndex: 2 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  row: {
    height: BAR_H - 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  num: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700', minWidth: 10 },
  name: { ...type.label, fontWeight: '700', flex: 1 },
  you: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 1,
  },
  youText: { ...type.small, color: colors.accent, fontWeight: '700' },
}));
