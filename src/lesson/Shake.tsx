import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { useReduceMotion } from './useReduceMotion';

/** docs/UI.md §5.1: a wrong element shakes 3 x 4 px over 250 ms. */
export default function Shake({
  trigger,
  children,
}: {
  trigger: number;
  children: React.ReactNode;
}) {
  const x = useRef(new Animated.Value(0)).current;
  const reduced = useReduceMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    const leg = (to: number) =>
      Animated.timing(x, { toValue: to, duration: 250 / 6, useNativeDriver: true });
    Animated.sequence([
      leg(-4),
      leg(4),
      leg(-4),
      leg(4),
      leg(-4),
      leg(0),
    ]).start();
  }, [trigger, reduced, x]);

  return (
    <Animated.View style={{ transform: [{ translateX: x }] }}>{children}</Animated.View>
  );
}
