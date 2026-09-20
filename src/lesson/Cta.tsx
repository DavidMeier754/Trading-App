import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, TAP_TARGET, type } from '../theme';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
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
  pressed: { opacity: 0.85 },
  disabled: { backgroundColor: colors.surfaceAlt },
  label: { ...type.prompt, color: colors.accentText },
  labelDisabled: { color: colors.textFaint },
});
