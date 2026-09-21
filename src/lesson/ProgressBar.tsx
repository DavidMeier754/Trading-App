import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { DURATION, EASE_OUT } from './motion';
import { useReduceMotion } from './useReduceMotion';

/**
 * docs/UI.md §2 — screens completed in this sub-level.
 *
 * Driven by `scaleX` on a full-width fill rather than by an animated `width`.
 * An animated width runs layout on the JS thread every frame, and this bar
 * fills at exactly the moment the screen transition is also running, so it was
 * competing for the busiest thread in the app. `scaleX` is native-driven.
 */
export default function ProgressBar({ progress }: { progress: number }) {
  const anim = useRef(new Animated.Value(progress)).current;
  const reduced = useReduceMotion();

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: reduced ? 0 : DURATION.screen,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();
  }, [progress, reduced, anim]);

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <Animated.View
        style={[
          styles.fill,
          // Anchored left so it grows from the start of the bar, not the middle.
          { transform: [{ scaleX: anim }] },
        ]}
      />
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
    width: '100%',
    borderRadius: 4,
    backgroundColor: colors.accent,
    transformOrigin: 'left',
  },
});
