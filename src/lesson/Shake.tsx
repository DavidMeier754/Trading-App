import React, { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** docs/UI.md §5.1: a wrong element shakes 3 x 4 px over 250 ms. */
export default function Shake({
  trigger,
  children,
}: {
  trigger: number;
  children: React.ReactNode;
}) {
  const x = useSharedValue(0);
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    // Linear: a shake is a jolt. An eased curve on each of six legs is mush.
    const leg = (to: number) => withTiming(to, { duration: 250 / 6 });
    x.set(withSequence(leg(-4), leg(4), leg(-4), leg(4), leg(-4), leg(0)));
  }, [trigger, reduced, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
