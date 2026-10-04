import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EASE_OUT, SPRING_POP } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { detentFeedback } from '../lesson/feedback';
import { colors, type, themed } from '../theme';
import Icon, { IconName } from './icons';

export type Tab = 'learn' | 'practice' | 'leaderboard' | 'account';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'learn', label: 'Learn', icon: 'learn' },
  { id: 'practice', label: 'Practice', icon: 'practice' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { id: 'account', label: 'Account', icon: 'account' },
];

const PILL_W = 56;
const PILL_H = 32;
/** The pill's front end gets there first and its back end catches up, so it stretches on the way. */
const PILL_FRONT = { duration: 240, easing: EASE_OUT };
const PILL_BACK = { duration: 380, easing: EASE_OUT };

/**
 * The bar along the bottom. Tabs are peers, so the screen switches at once --
 * no slide, no fade -- and the touch gets the lightest cue there is: this is
 * pressed dozens of times a session.
 *
 * [DESIGN-REVIEW] "Tabs with a sliding pill" (David's pick of 2026-10-04, an
 * exception to §11.2's "never a slide" for the bar itself, not the screen): a
 * pill behind the open tab's icon slides to the tab tapped, its front end
 * ahead of its back so it stretches on the way and draws up as it lands, and
 * the icon it lands on hops. Under reduced motion it is simply there.
 */
export default function TabBar({
  tab,
  onChange,
  dots = {},
  bumps = 0,
  onLayout,
}: {
  tab: Tab;
  onChange: (next: Tab) => void;
  /** docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW]: a tab with something new waiting (Practice's new skills). */
  dots?: Partial<Record<Tab, boolean>>;
  /** Practice's icon swells each time this goes up: a skill card landing in it. */
  bumps?: number;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  const insets = useSafeAreaInsets();
  const swell = useSharedValue(1);
  useEffect(() => {
    if (bumps === 0) return;
    swell.set(
      withSequence(withTiming(1.28, { duration: 90, easing: EASE_OUT }), withSpring(1, SPRING_POP)),
    );
  }, [bumps, swell]);
  const swellStyle = useAnimatedStyle(() => ({ transform: [{ scale: swell.get() }] }));

  // The pill: its two ends, in tabs from the left, and the bar's width to
  // place them by (the tabs are equal columns).
  const reduced = useReduceMotion();
  const at = TABS.findIndex((t) => t.id === tab);
  const [width, setWidth] = useState(0);
  const from = useSharedValue(at);
  const to = useSharedValue(at);
  const last = useRef(at);
  useEffect(() => {
    const before = last.current;
    last.current = at;
    if (before === at) return;
    if (reduced) {
      from.set(at);
      to.set(at);
      return;
    }
    const right = at > before;
    from.set(withTiming(at, right ? PILL_BACK : PILL_FRONT));
    to.set(withTiming(at, right ? PILL_FRONT : PILL_BACK));
  }, [at, reduced, from, to]);
  const col = width / TABS.length;
  const pill = useAnimatedStyle(() => {
    const a = (Math.min(from.get(), to.get()) + 0.5) * col;
    const b = (Math.max(from.get(), to.get()) + 0.5) * col;
    return { opacity: col > 0 ? 1 : 0, left: a - PILL_W / 2, width: PILL_W + (b - a) };
  });

  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      accessibilityRole="tablist"
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
        onLayout?.(e);
      }}
    >
      <Animated.View pointerEvents="none" style={[styles.pill, pill]} />
      {TABS.map((item) => {
        const on = item.id === tab;
        const color = on ? colors.accent : colors.textFaint;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={dots[item.id] ? `${item.label}, something new` : item.label}
            onPressIn={on ? undefined : detentFeedback}
            onPress={() => onChange(item.id)}
            style={styles.item}
          >
            <Hop on={on} reduced={reduced}>
              <Animated.View style={item.id === 'practice' ? swellStyle : null}>
                <Icon name={item.icon} size={24} color={color} filled={on} />
                {dots[item.id] ? <View style={styles.dot} /> : null}
              </Animated.View>
            </Hop>
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A tab's icon: up as the pill gets there, and down onto it with a spring that settles. */
function Hop({
  on,
  reduced,
  children,
}: {
  on: boolean;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const hop = useSharedValue(0);
  const was = useRef(on);
  useEffect(() => {
    if (was.current === on) return;
    was.current = on;
    if (!on || reduced) return;
    hop.set(
      withDelay(
        40,
        withSequence(
          withTiming(-7, { duration: 150, easing: Easing.out(Easing.quad) }),
          withSpring(0, { duration: 560, dampingRatio: 0.42 }),
        ),
      ),
    );
  }, [on, reduced, hop]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: hop.get() }] }));
  return <Animated.View style={[styles.iconSlot, style]}>{children}</Animated.View>;
}

const styles = themed(() => ({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { flex: 1, alignItems: 'center', paddingTop: 6, paddingBottom: 2, gap: 2, minHeight: 52 },
  // The pill sits behind the open tab's icon slot.
  pill: {
    position: 'absolute',
    top: 6,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    backgroundColor: colors.accentTint,
  },
  iconSlot: { height: PILL_H, alignItems: 'center', justifyContent: 'center' },
  label: { ...type.small },
  dot: {
    position: 'absolute',
    top: -2,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.down,
    borderWidth: 2,
    borderColor: colors.background,
  },
}));
