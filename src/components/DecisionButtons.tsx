import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressFeedback } from '../lesson/motion';
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
  onChoose,
}: {
  buttons: DecisionButton[];
  onChoose: (button: DecisionButton) => void;
}) {
  return (
    <View style={styles.row}>
      {buttons.map((button) => (
        <DecisionButton key={button} button={button} onChoose={onChoose} />
      ))}
    </View>
  );
}

function DecisionButton({
  button,
  onChoose,
}: {
  button: DecisionButton;
  onChoose: (button: DecisionButton) => void;
}) {
  const press = usePressFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onChoose(button)}
      onPressIn={press.onPressIn}
      pressRetentionOffset={16}
      style={styles.flex}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.button,
            button === 'long' || button === 'buy' ? styles.up : null,
            button === 'short' ? styles.down : null,
            press.style,
            pressed && press.pressedStyle,
          ]}
        >
          <Text style={styles.text}>{DECISION_LABEL[button]}</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

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
  // docs/UI.md §6: up is green, down is red. The direction buttons carry the same
  // pairing so Long/Short read the way the candles do.
  up: { borderColor: colors.up },
  down: { borderColor: colors.down },
  text: { ...type.answer, color: colors.text },
});
