import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, TAP_TARGET, type } from '../theme';
import { useLookSpec } from './look';
import type { CueName } from './cues.generated';
import { EASE_OUT, SPRING_POP, usePressFeedback } from './motion';
import { useReduceMotion } from './useReduceMotion';

const OFF = { face: colors.surfaceAlt, rim: '#151A21' };
const GOOD = { face: colors.success, rim: '#1B8F5E' };

/**
 * docs/UI.md §2: single primary CTA, full width, bottom safe area.
 *
 * It is a physical key rather than a flat panel: the face sits on a darker edge
 * and sinks into it on press-in, on the same timing as the cue. It is pressed
 * fifteen times a lesson, so it is the one surface whose feel the learner knows
 * best -- and it answers the thumb before the thumb lifts.
 *
 * Two states get a flourish, both about reading the button rather than
 * decorating it. Becoming pressable (an answer was picked, Check woke up) pops
 * it a few percent, which pulls the eye down to the thumb. After a correct
 * answer it turns green; after anything else it stays blue, because the reveal
 * above it already says "not quite" and the button does not need to say it
 * twice.
 */
export default function Cta({
  label,
  disabled,
  onPress,
  cue = 'advance',
  good = false,
  hidden = false,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
  /** Fired on press-in. `null` when the press means something only on release (Check). */
  cue?: CueName | null;
  /** The last answer was right. */
  good?: boolean;
  /**
   * Held back (a badge is still landing): invisible and inert, but still taking
   * its place in the layout, so the screen above does not jump when it arrives.
   */
  hidden?: boolean;
}) {
  const reduced = useReduceMotion();
  // Colour, corners, depth and lettering are the look's (lesson/look.ts): a
  // sunken key in Neo, a flat cyan bar in Terminal, a fat yellow one in Arcade.
  const spec = useLookSpec();
  const EDGE = spec.cta.edge;
  const face0 = spec.cta.face;
  const rim0 = spec.cta.rim;
  const darkLabel = spec.accentText !== '#FFFFFF';
  const inert = disabled || hidden;
  const press = usePressFeedback(!inert, { cue });
  const on = useSharedValue(disabled ? 0 : 1);
  const green = useSharedValue(good ? 1 : 0);
  const pop = useSharedValue(1);
  const enter = useSharedValue(reduced ? 1 : 0);
  const wasDisabled = useRef(!!disabled);

  // It rises into place whenever it appears -- at the start of a lesson, after
  // a trade call's replay, after a badge has finished -- rather than blinking in.
  useEffect(() => {
    if (hidden) enter.set(0);
    else enter.set(withTiming(1, { duration: 340, easing: EASE_OUT }));
  }, [hidden, enter]);

  useEffect(() => {
    on.set(withTiming(disabled ? 0 : 1, { duration: 220, easing: EASE_OUT }));
    if (wasDisabled.current && !disabled && !reduced) {
      pop.set(withSequence(withTiming(1.035, { duration: 110, easing: EASE_OUT }), withSpring(1, SPRING_POP)));
    }
    wasDisabled.current = !!disabled;
  }, [disabled, reduced, on, pop]);

  useEffect(() => {
    green.set(withTiming(good ? 1 : 0, { duration: 320, easing: EASE_OUT }));
  }, [good, green]);

  const keyStyle = useAnimatedStyle(() => ({
    opacity: enter.get(),
    transform: [{ translateY: 14 * (1 - enter.get()) }, { scale: pop.get() }],
  }));

  const rim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      on.get(),
      [0, 1],
      [OFF.rim, interpolateColor(green.get(), [0, 1], [rim0, GOOD.rim])]
    ),
  }));

  const face = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      on.get(),
      [0, 1],
      [OFF.face, interpolateColor(green.get(), [0, 1], [face0, GOOD.face])]
    ),
    // A key sinks into its edge; a flat button (no edge) gives a little instead.
    transform:
      EDGE > 0
        ? [{ translateY: EDGE * press.pressed.get() }]
        : [{ scale: 1 - 0.03 * press.pressed.get() }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inert }}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      disabled={inert}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      // A finger drifting a few pixels should not cancel a press the user meant.
      pressRetentionOffset={16}
    >
      {/* The edge is the key's side, offset down by its own depth; the face
          covers all of it but the bottom strip, and all of it once pressed.
          Nothing moves in layout: the footprint is the same either way. */}
      <Animated.View style={[{ paddingBottom: EDGE }, keyStyle]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.rim, { top: EDGE, borderRadius: spec.cta.radius }, rim]}
        />
        <Animated.View style={[styles.face, { borderRadius: spec.cta.radius }, face]}>
          <Text
            style={[
              styles.label,
              {
                color: good ? (darkLabel ? '#06200F' : '#FFFFFF') : spec.accentText,
              },
              spec.cta.uppercase && styles.upper,
              disabled && styles.labelDisabled,
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  face: {
    minHeight: TAP_TARGET + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upper: { textTransform: 'uppercase', letterSpacing: 2, fontWeight: '800' },
  label: { ...type.prompt, color: colors.accentText, letterSpacing: 0.2 },
  labelDisabled: { color: colors.textFaint },
});
