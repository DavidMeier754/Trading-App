import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Icon from '../home/icons';
import { MAX_HEARTS, useHearts } from '../progress';
import { colors, MONO_FONT, type } from '../theme';
import { EASE_OUT, SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** How long the lost heart takes to fall away. */
const FALL_MS = 640;

/**
 * The learner's hearts, at the right end of the lesson's top bar -- the same
 * count the home screen shows.
 *
 * docs/ui/06-reveal-and-hearts.md §5.2: a wrong answer costs one. It lands with the verdict, in the
 * same frame: the heart flinches, a copy of it drops away and fades, and the
 * count steps down. The last one greys out. Under reduced motion only the count
 * and the colour change.
 */
export default function HeartMeter({ count }: { count?: number } = {}) {
  // `count` stands in for the learner's hearts on the Animations test page.
  const live = useHearts().hearts;
  const hearts = count ?? live;
  const reduced = useReduceMotion();
  const size = 20;
  const tint = hearts > 0 ? colors.down : colors.textFaint;

  const kick = useSharedValue(1);
  const fall = useSharedValue(1);
  const last = useRef(hearts);
  useEffect(() => {
    if (hearts < last.current && !reduced) {
      kick.set(
        withSequence(
          withTiming(0.7, { duration: 90, easing: EASE_OUT }),
          withSpring(1, SPRING_POP),
        ),
      );
      fall.set(0);
      fall.set(withTiming(1, { duration: FALL_MS, easing: EASE_OUT }));
    }
    last.current = hearts;
  }, [hearts, reduced, kick, fall]);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: kick.get() }] }));
  // The lost heart: it tips, drops and shrinks as it fades.
  const ghostStyle = useAnimatedStyle(() => {
    const t = fall.get();
    return {
      opacity: t >= 1 ? 0 : 1 - t,
      transform: [
        { translateY: 18 * t },
        { translateX: -6 * t },
        { rotate: `${-28 * t}deg` },
        { scale: 1 - 0.35 * t },
      ],
    };
  });

  return (
    <View
      style={styles.wrap}
      accessibilityRole="text"
      accessibilityLabel={`${hearts} of ${MAX_HEARTS} hearts`}
      accessibilityLiveRegion="polite"
    >
      <View style={{ width: size, height: size }}>
        <Animated.View style={[StyleSheet.absoluteFill, ghostStyle]} pointerEvents="none">
          <Icon name="heart" size={size} color={colors.down} />
        </Animated.View>
        <Animated.View style={heartStyle}>
          <Icon name="heart" size={size} color={tint} />
        </Animated.View>
      </View>
      <Text style={[styles.count, { color: tint }]}>{hearts}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  count: {
    ...type.label,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: MONO_FONT,
    fontVariant: ['tabular-nums'],
  },
});
