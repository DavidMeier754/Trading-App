import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { EASE_OUT } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';

/** The screen is still fading in when the first bar starts. */
export const GROW_DELAY = 160;

/** One bar's growth. */
export const GROW_MS = 400;

/**
 * docs/UI.md §6.5: bars grow from 0 (400 ms, staggered 80 ms).
 *
 * A bar in a data panel, growing from its edge to its value once, on mount.
 * It is absolutely positioned and has no children, so animating its width
 * lays out nothing else. `offset` places it along the track, for stacked bars
 * whose parts arrive one after another.
 */
export default function GrowBar({
  to,
  offset = 0,
  from = 'left',
  delay = 0,
  duration = GROW_MS,
  style,
}: {
  /** Final width, in percent of the track. */
  to: number;
  /** Where it starts, in percent of the track from its `from` edge. */
  offset?: number;
  from?: 'left' | 'right';
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReduceMotion();
  const v = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      v.set(1);
      return;
    }
    v.set(withDelay(GROW_DELAY + delay, withTiming(1, { duration, easing: EASE_OUT })));
    // Mount only: a panel that re-renders does not grow its bars again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const grow = useAnimatedStyle(() => ({ width: `${to * v.get()}%` }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 0, bottom: 0 },
        from === 'left' ? { left: `${offset}%` } : { right: `${offset}%` },
        style,
        grow,
      ]}
    />
  );
}
