import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASE_OUT, usePressFeedback } from '../lesson/motion';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type { DecisionButton } from '../types';

export const DECISION_LABEL: Record<DecisionButton, string> = {
  long: 'Long',
  short: 'Short',
  'no-trade': 'No trade',
  buy: 'Buy',
  wait: 'Wait',
};

/**
 * docs/UI.md §6.4 "decision overlay": at the pause point the buttons rise from the
 * bottom. They sit in the CTA slot, which is why the player hides the CTA while a
 * chart-decision is still open.
 */
export default function DecisionButtons({
  buttons,
  chosen = null,
  onChoose,
}: {
  buttons: DecisionButton[];
  /** The call already made: it stays lit, the others step back, none can be pressed. */
  chosen?: DecisionButton | null;
  onChoose: (button: DecisionButton) => void;
}) {
  return (
    <View style={styles.row}>
      {buttons.map((button) => (
        <DecisionButton key={button} button={button} chosen={chosen} onChoose={onChoose} />
      ))}
    </View>
  );
}

function DecisionButton({
  button,
  chosen,
  onChoose,
}: {
  button: DecisionButton;
  chosen: DecisionButton | null;
  onChoose: (button: DecisionButton) => void;
}) {
  const locked = chosen !== null;
  // Nothing on the way down: the call commits on release, with its own cue.
  const press = usePressFeedback(!locked, { cue: null });
  const dim = useSharedValue(0);
  const lit = useSharedValue(0);

  useEffect(() => {
    dim.set(withTiming(locked && chosen !== button ? 1 : 0, { duration: 320, easing: EASE_OUT }));
    lit.set(withTiming(chosen === button ? 1 : 0, { duration: 220, easing: EASE_OUT }));
  }, [locked, chosen, button, dim, lit]);

  const tone = button === 'long' || button === 'buy' ? colors.up : button === 'short' ? colors.down : colors.accent;
  const state = useAnimatedStyle(() => ({
    opacity: 1 - 0.7 * dim.get(),
    backgroundColor: interpolateColor(lit.get(), [0, 1], [colors.surface, `${tone}33`]),
    borderColor: interpolateColor(lit.get(), [0, 1], [BORDER[button], tone]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: locked, selected: chosen === button }}
      disabled={locked}
      onPress={() => onChoose(button)}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      pressRetentionOffset={16}
      style={styles.flex}
    >
      <Animated.View style={[styles.button, state, press.style]}>
        <Text style={styles.text}>{DECISION_LABEL[button]}</Text>
      </Animated.View>
    </Pressable>
  );
}

// docs/UI.md §6: up is green, down is red. The direction buttons carry the same
// pairing so Long/Short read the way the candles do.
const BORDER: Record<DecisionButton, string> = {
  long: colors.up,
  buy: colors.up,
  short: colors.down,
  'no-trade': colors.borderStrong,
  wait: colors.borderStrong,
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  button: {
    flex: 1,
    minHeight: TAP_TARGET + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  text: { ...type.answer, color: colors.text },
});
