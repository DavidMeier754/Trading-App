import React, { useEffect, useRef } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { pulseAt } from './feedback';
import { useReduceMotion } from './useReduceMotion';

/** The wobble's swing, peak by peak: a jolt, then three dying swings. */
const SWING = [-6, 5, -3, 1.5, 0];

/**
 * docs/ui/06-reveal-and-hearts.md §5.1: a wrong element shakes.
 *
 * Not the flat 3 x 4 px buzz it was. It is a knock and a wobble: the element is
 * jolted sideways at once, then swings back and forth, each swing smaller, the
 * way a thing that has been bumped settles. Its second peak lands exactly on
 * the second pulse of the `wrong` cue -- read from the cue table, so if the cue
 * is retimed the wobble follows -- which is what makes the haptic, the falling
 * note and the swing read as one event instead of three.
 */
export default function Shake({
  trigger = 0,
  onMount = true,
  children,
}: {
  /** Bump this to shake again while mounted. */
  trigger?: number;
  /** Whether mounting shakes too. Off for a surface that only shakes on a miss. */
  onMount?: boolean;
  children: React.ReactNode;
}) {
  const x = useSharedValue(0);
  const reduced = useReduceMotion();
  const first = useRef(true);

  useEffect(() => {
    const mounting = first.current;
    first.current = false;
    if (reduced || (mounting && !onMount)) return;
    const jolt = 45;
    const second = Math.max(jolt + 60, pulseAt('wrong', 1)); // 170 ms
    const swing = second - jolt;
    const sine = Easing.bezier(0.37, 0, 0.63, 1);
    x.set(
      withSequence(
        withTiming(SWING[0], { duration: jolt, easing: Easing.out(Easing.quad) }),
        withTiming(SWING[1], { duration: swing, easing: sine }),
        withTiming(SWING[2], { duration: swing * 0.88, easing: sine }),
        withTiming(SWING[3], { duration: swing * 0.76, easing: sine }),
        withTiming(SWING[4], { duration: swing * 0.64, easing: Easing.out(Easing.quad) }),
      ),
    );
  }, [trigger, reduced, onMount, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return <Animated.View style={[{ maxWidth: '100%' }, style]}>{children}</Animated.View>;
}
