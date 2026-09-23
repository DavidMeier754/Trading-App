import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors, type } from '../theme';
import { EASE_OUT, SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

/**
 * The run of right answers, in the top bar's empty heart slot (the new look
 * only). It lights up from the second in a row, kicks on every one after, and
 * burns gold from the third, matching the progress bar and the room.
 *
 * When a run ends it simply goes out -- no count-down, no broken-streak
 * message. docs/UI.md §1.6: a wrong answer in a lesson costs nothing.
 */
export default function StreakMeter({ run }: { run: number }) {
  const reduced = useReduceMotion();
  const shown = run >= 2;
  const on = useSharedValue(shown ? 1 : 0);
  const kick = useSharedValue(1);
  const last = useRef(run);

  useEffect(() => {
    on.set(withTiming(shown ? 1 : 0, { duration: shown ? 260 : 420, easing: EASE_OUT }));
    if (run > last.current && shown && !reduced) {
      kick.set(withSequence(withTiming(1.35, { duration: 110, easing: EASE_OUT }), withSpring(1, SPRING_POP)));
    }
    last.current = run;
  }, [run, shown, reduced, on, kick]);

  const style = useAnimatedStyle(() => ({
    opacity: on.get(),
    transform: [{ scale: kick.get() * (0.6 + 0.4 * on.get()) }],
  }));

  const hot = run >= 3;
  const tint = hot ? colors.warning : colors.textMuted;
  return (
    <Animated.View style={[styles.wrap, style]} accessibilityLabel={`${run} in a row`}>
      <Svg width={12} height={15} viewBox="0 0 12 15">
        <Path
          d="M6 0.6 C6.6 3.4 10.8 5.2 10.8 9.6 C10.8 12.5 8.6 14.4 6 14.4 C3.4 14.4 1.2 12.5 1.2 9.8 C1.2 7.6 2.6 6.3 3.6 5.2 C3.7 6.8 4.3 7.6 5.1 8 C4.9 5.4 5.3 2.6 6 0.6 Z"
          fill={tint}
        />
      </Svg>
      <Text style={[styles.count, { color: tint }]}>{Math.max(run, 2)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  count: { ...type.label, fontWeight: '800' },
});
