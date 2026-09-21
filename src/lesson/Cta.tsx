import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, radius, TAP_TARGET, type } from '../theme';
import { usePressFeedback } from './motion';

/** docs/UI.md §2: single primary CTA, full width, bottom safe area. */
export default function Cta({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const press = usePressFeedback(!disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      // A finger drifting a few pixels should not cancel a press the user meant.
      pressRetentionOffset={16}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.button,
            disabled && styles.disabled,
            press.style,
            pressed && press.pressedStyle,
          ]}
        >
          <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TAP_TARGET + 4,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { backgroundColor: colors.surfaceAlt },
  label: { ...type.prompt, color: colors.accentText },
  labelDisabled: { color: colors.textFaint },
});
