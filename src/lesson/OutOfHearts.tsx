import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { HEART_REFILL_MS, useHearts, waitText } from '../progress';
import { colors, space, type } from '../theme';
import { EASE_OUT, SPRING_POP, useMotion } from './motion';

const HEART = 112;
const HOURS = HEART_REFILL_MS / 3_600_000;

/**
 * docs/UI.md §5.2: the last heart is gone, so the sub-level stops here and the
 * CTA leads back to the path. It says plainly what happened and when the next
 * heart is back -- no alarm, no upsell. The lesson simply is not counted yet.
 *
 * The heart settles in cracked: the two halves arrive a hair apart and then sit
 * still. Nothing loops -- this is a pause, not a scene.
 */
export default function OutOfHearts() {
  const { nextAt } = useHearts();
  const m = useMotion();
  const t = useSharedValue(m.reduced ? 1 : 0);
  const split = useSharedValue(m.reduced ? 1 : 0);
  useEffect(() => {
    if (m.reduced) return;
    t.set(withTiming(1, { duration: 360, easing: EASE_OUT }));
    split.set(withDelay(220, withSpring(1, SPRING_POP)));
  }, [m.reduced, t, split]);

  const heart = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: 16 * (1 - t.get()) }, { scale: 0.92 + 0.08 * t.get() }],
  }));
  const left = useAnimatedStyle(() => ({
    transform: [{ translateX: -4 * split.get() }, { rotate: `${-6 * split.get()}deg` }],
  }));
  const right = useAnimatedStyle(() => ({
    transform: [{ translateX: 4 * split.get() }, { rotate: `${6 * split.get()}deg` }],
  }));
  const text = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: 8 * (1 - t.get()) }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.heart, heart]} accessibilityElementsHidden>
        {/* One heart drawn as two halves along a crack, each clipped to its side. */}
        <Animated.View style={[StyleSheet.absoluteFill, left]}>
          <Svg width={HEART} height={HEART} viewBox="0 0 24 24">
            <Path
              d="M12 20.5s-8.5-5.2-8.5-11.2A4.7 4.7 0 0 1 12 6.6l-1.4 3.2 2.2 2.4-1.9 3.1 1.1 5.2z"
              fill={colors.textFaint}
            />
          </Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, right]}>
          <Svg width={HEART} height={HEART} viewBox="0 0 24 24">
            <Path
              d="M12 6.6a4.7 4.7 0 0 1 8.5 2.7c0 6-8.5 11.2-8.5 11.2l-1.1-5.2 1.9-3.1-2.2-2.4z"
              fill={colors.textFaint}
            />
          </Svg>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.text, text]}>
        <Text style={styles.title} accessibilityRole="header">
          You're out of hearts
        </Text>
        <Text style={styles.body}>
          {`A heart comes back ${HOURS} hours after you lose it. ${
            nextAt ? `The next one is back in ${waitText(nextAt)}.` : 'One is back already.'
          }`}
        </Text>
        <Text style={styles.note}>This lesson is not counted yet. Start it again from the path.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.xl },
  heart: { width: HEART, height: HEART },
  text: { alignItems: 'center', gap: space.sm, maxWidth: 320 },
  title: { ...type.display, color: colors.text, textAlign: 'center' },
  body: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  note: { ...type.small, fontSize: 13, color: colors.textFaint, textAlign: 'center' },
});
