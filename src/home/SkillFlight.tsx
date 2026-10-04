import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { landFeedback } from '../lesson/feedback';
import { colors, radius, themed } from '../theme';
import Icon from './icons';

/** At most this many cards fly; a lesson with more sends five. */
export const FLY_MAX = 5;
/** When the first card leaves, after the home screen opens. */
export const FLY_START = 380;
/** One card's flight, and the gap between two. */
const FLY_MS = 620;
export const FLY_STEP = 140;

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW] (David: "an animation where those
 * cards/skills get transferred to the Practice tab"): back on the home
 * screen, the new skills fly from the middle of the screen into the Practice
 * tab's icon, one after another, on an arc. Each landing is a light tap, and
 * `onLand` swells the icon (TabBar). Not drawn under reduced motion: the
 * tab's dot alone says it.
 */
export default function SkillFlight({
  count,
  from,
  to,
  onLand,
}: {
  count: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  onLand: () => void;
}) {
  const n = Math.min(FLY_MAX, count);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: n }, (_, i) => (
        <FlyingCard key={i} i={i} from={from} to={to} onLand={onLand} />
      ))}
    </View>
  );
}

function FlyingCard({
  i,
  from,
  to,
  onLand,
}: {
  i: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  onLand: () => void;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    const landed = () => {
      landFeedback();
      onLand();
    };
    t.set(
      withDelay(
        FLY_START + i * FLY_STEP,
        withTiming(1, { duration: FLY_MS, easing: Easing.bezier(0.45, 0, 0.25, 1) }, (done) => {
          'worklet';
          if (done) scheduleOnRN(landed);
        }),
      ),
    );
    // Once, as the home screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // A slight fan as they leave, so five do not read as one.
  const spread = (i - 2) * 14;
  const style = useAnimatedStyle(() => {
    const v = t.get();
    const x = from.x + spread * (1 - v) + (to.x - from.x) * v;
    // An arc: up a little first, then down into the tab.
    const y = from.y + (to.y - from.y) * v * v - 70 * Math.sin(Math.PI * v);
    return {
      opacity: v <= 0 ? 0 : v > 0.92 ? (1 - v) / 0.08 : 1,
      transform: [
        { translateX: x - CARD_W / 2 },
        { translateY: y - CARD_H / 2 },
        { scale: 1 - 0.55 * v },
        { rotate: `${(1 - v) * (i % 2 ? 8 : -8)}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[styles.card, style]}>
      <Icon name="book" size={18} color={colors.accent} />
    </Animated.View>
  );
}

const CARD_W = 52;
const CARD_H = 38;

const styles = themed(() => ({
  card: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
