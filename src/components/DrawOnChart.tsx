import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { DURATION, EASE_OUT } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';

/**
 * docs/UI.md §6.4: a Chapter 1 line chart draws on. It used to step from data
 * point to data point, which at eight points reads as eight jumps; it now hands
 * the chart a single 0 -> 1 value that sweeps a dash mask along the finished
 * path, so the line grows continuously. Reduce motion skips to the end.
 */
export default function DrawOnChart({
  bars,
  children,
}: {
  bars: number;
  children: (visibleCount: number, draw: Animated.Value) => React.ReactNode;
}) {
  const reduced = useReduceMotion();
  const draw = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced || bars <= 1) {
      draw.setValue(1);
      return;
    }
    draw.setValue(0);
    const animation = Animated.timing(draw, {
      toValue: 1,
      duration: DURATION.draw,
      // A line drawing itself is an *entering* element, so it eases out. The
      // old inOut curve was ease-in for its first half, which held the line
      // back through exactly the frames the learner is watching.
      easing: EASE_OUT,
      // strokeDashoffset is not a transform, so this one stays on the JS driver.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [bars, reduced, draw]);

  return <>{children(bars, draw)}</>;
}
