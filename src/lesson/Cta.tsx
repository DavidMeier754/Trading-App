import React from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, TAP_TARGET, type } from '../theme';
import { usePressScale } from './motion';

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
  // scale(0.97) over 160 ms. An opacity flick is the weakest press feedback
  // there is, and Pressable's style callback is an instant cut either way.
  const press = usePressScale(!disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Animated.View
        style={[styles.button, disabled && styles.disabled, press.style]}
      >
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </Animated.View>
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
