import React, { useEffect, useRef } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';
import { EASE_IN_OUT, EASE_OUT, useMotion } from './motion';

const HEIGHT = 12;

/** The fill springs to its new length, and lands with a little give. */
const SPRING_FILL = { duration: 760, dampingRatio: 0.7 } as const;

/**
 * docs/UI.md §2 — screens completed in this sub-level.
 *
 * Every advance is a small reward of its own: the fill springs forward and
 * overshoots a hair, then a highlight sweeps along it. A run of three right
 * answers or more warms the bar from blue to gold; it cools back without a word
 * when the run ends (docs/UI.md §1.6: a wrong answer costs nothing).
 *
 * The fill animates `width`, which is normally a layout pass per frame. It is
 * the documented exception: an absolutely positioned element that lays out
 * nothing else, and `width` keeps the corner radius that a scaleX would smear
 * flat at low progress. Its two children are absolute too.
 */
export default function ProgressBar({ progress, hot = false }: { progress: number; hot?: boolean }) {
  const m = useMotion();
  const target = Math.max(0, Math.min(1, progress));
  const p = useSharedValue(target);
  const warm = useSharedValue(hot ? 1 : 0);
  const sweep = useSharedValue(1);
  const trackW = useSharedValue(0);
  const last = useRef(target);

  useEffect(() => {
    if (m.reduced) {
      p.set(withTiming(target, { duration: 140, easing: EASE_OUT }));
    } else {
      p.set(withSpring(target, SPRING_FILL));
      if (target > last.current + 1e-6) {
        sweep.set(0);
        sweep.set(withDelay(160, withTiming(1, { duration: 900, easing: EASE_IN_OUT })));
      }
    }
    last.current = target;
  }, [target, m.reduced, p, sweep]);

  useEffect(() => {
    warm.set(withTiming(hot ? 1 : 0, { duration: 520, easing: EASE_OUT }));
  }, [hot, warm]);

  const fill = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, p.get())) * 100}%`,
    backgroundColor: interpolateColor(warm.get(), [0, 1], [colors.accent, colors.warning]),
  }));

  const shine = useAnimatedStyle(() => {
    const filled = trackW.get() * Math.max(0, Math.min(1, p.get()));
    const s = sweep.get();
    return {
      opacity: s >= 1 ? 0 : 0.5 * Math.sin(Math.PI * s),
      transform: [{ translateX: -24 + (filled + 24) * s }, { skewX: '-24deg' }],
    };
  });

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      onLayout={(e: LayoutChangeEvent) => trackW.set(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.fill, fill]}>
        <View pointerEvents="none" style={styles.gloss} />
        <Animated.View pointerEvents="none" style={[styles.shine, shine]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: HEIGHT / 2,
    overflow: 'hidden',
  },
  // A lighter strip along the top: the fill reads as a lit, rounded bar.
  gloss: {
    position: 'absolute',
    top: 2.5,
    left: 5,
    right: 5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  shine: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    left: 0,
    width: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
