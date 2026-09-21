import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { colors } from '../theme';
import { DURATION, EASE_OUT, useMotion } from './motion';

/**
 * docs/UI.md §2 — screens completed in this sub-level.
 *
 * The fill animates `width`, which is normally a layout pass per frame. It is
 * the documented exception: an absolutely positioned element with no children
 * lays out nothing else, and `width` keeps the 4 px corner radius that a scaleX
 * would smear flat at low progress.
 */
export default function ProgressBar({ progress }: { progress: number }) {
  const m = useMotion();

  const fill = useAnimatedStyle(() => ({
    width: withTiming(`${Math.max(0, Math.min(1, progress)) * 100}%`, {
      duration: m.fade(DURATION.screen),
      easing: EASE_OUT,
    }),
  }));

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
