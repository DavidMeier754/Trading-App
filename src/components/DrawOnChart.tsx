import React, { useEffect } from 'react';
import {
  SharedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DURATION, EASE_OUT } from '../lesson/motion';

/**
 * docs/UI.md §6.4: a Chapter 1 line chart draws on.
 *
 * One 0 -> 1 shared value sweeps a dash mask along the finished path, so the
 * line grows continuously instead of stepping from data point to data point.
 * A line arriving is an *entering* element, so it eases out; the old inOut curve
 * was ease-in for its first half, holding the line back through exactly the
 * frames the learner is watching.
 */
export default function DrawOnChart({
  bars,
  children,
}: {
  bars: number;
  children: (visibleCount: number, draw: SharedValue<number>) => React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const draw = useSharedValue(0);

  useEffect(() => {
    if (reduced || bars <= 1) {
      draw.set(1);
      return;
    }
    draw.set(0);
    draw.set(withTiming(1, { duration: DURATION.draw, easing: EASE_OUT }));
  }, [bars, reduced, draw]);

  return <>{children(bars, draw)}</>;
}
