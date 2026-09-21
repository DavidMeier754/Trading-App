import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { AnswerValue } from '../lesson/answers';
import { signedPrice } from '../format';
import { parseNumeric } from '../lesson/answers';
import Shake from '../lesson/Shake';
import { useBorderTransition } from '../lesson/toneTransition';
import { usePressFeedback } from '../lesson/motion';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type { NumericInputScreen as S } from '../types';
import { Prompt } from './common';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '−'];

/**
 * One key. It owns its own press feedback, which is why it is a component and
 * not a branch inside the map: `usePressFeedback` is a hook.
 */
function Key({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const press = usePressFeedback(!disabled);
  const [down, setDown] = React.useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        setDown(true);
        press.onPressIn();
      }}
      onPressOut={() => {
        setDown(false);
        press.onPressOut();
      }}
      pressRetentionOffset={12}
    >
      <Animated.View
        style={[styles.key, press.style, down && !disabled && styles.keyDown]}
      >
        <Text style={styles.keyText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * docs/UI.md §4.1 `numeric-input`: a custom keypad (digits, `.`, `−`) — not the
 * OS keyboard — with a configurable tolerance. `unit` prefixes or suffixes the field.
 */
export default function NumericInputScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: S;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const text = value.kind === 'numeric' ? value.text : '';
  const entered = parseNumeric(text);
  const isRight =
    entered !== null && Math.abs(entered - screen.answer) <= (screen.tolerance ?? 0);

  const press = (key: string) => {
    if (revealed) return;
    if (key === '−') {
      onChange({
        kind: 'numeric',
        text: text.startsWith('-') ? text.slice(1) : `-${text}`,
      });
      return;
    }
    if (key === '.' && text.includes('.')) return;
    onChange({ kind: 'numeric', text: text + key });
  };

  const unitIsPrefix = screen.unit === '$' || screen.unit === '€';
  const typed = text.replace('-', '−');
  const isEmpty = typed.length === 0;
  // An empty field used to read "$—", which looks like a value rather than a gap.
  // It now shows a faint 0.00 the first keypress replaces.
  const shown = isEmpty ? '0.00' : typed;

  const fieldColor = !revealed ? colors.accent : isRight ? colors.success : colors.down;

  // docs/UI.md §5.1: the field ramps to its verdict colour over 200 ms.
  const animatedBorder = useBorderTransition(fieldColor, revealed);

  const field = (
    <Animated.View style={[styles.field, animatedBorder]}>
      <View style={styles.fieldRow}>
        {unitIsPrefix && screen.unit ? (
          <Text style={[styles.unit, isEmpty && styles.faint]}>{screen.unit}</Text>
        ) : null}
        <Text
          style={[
            styles.fieldText,
            isEmpty && styles.faint,
            revealed && !isEmpty && { color: fieldColor },
          ]}
        >
          {shown}
        </Text>
        {!unitIsPrefix && screen.unit ? (
          <Text style={[styles.unit, isEmpty && styles.faint]}>{screen.unit}</Text>
        ) : null}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      {revealed && !isRight ? <Shake trigger={1}>{field}</Shake> : field}
      {revealed && !isRight ? (
        <Text style={styles.answerLine}>
          {'Answer: '}
          <Text style={{ color: colors.success }}>
            {unitIsPrefix
              ? signedPrice(screen.answer)
              : `${screen.answer}${screen.unit ? ` ${screen.unit}` : ''}`}
          </Text>
        </Text>
      ) : null}

      <View style={styles.pad}>
        {KEYS.map((key) => (
          <Key key={key} label={key} disabled={revealed} onPress={() => press(key)} />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={revealed || text.length === 0}
        onPress={() => onChange({ kind: 'numeric', text: text.slice(0, -1) })}
        hitSlop={8}
      >
        <Text
          style={[
            styles.clear,
            (revealed || text.length === 0) && { color: colors.textFaint },
          ]}
        >
          Delete
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.lg },
  field: {
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
  },
  fieldRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 3 },
  fieldText: { ...type.display, color: colors.text },
  unit: { ...type.title, color: colors.textMuted },
  faint: { color: colors.textFaint },
  answerLine: { ...type.body, color: colors.textMuted },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  key: {
    width: '31.5%',
    minHeight: TAP_TARGET,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDown: { backgroundColor: colors.surfaceAlt, transform: [{ scale: 0.96 }] },
  keyText: { ...type.prompt, color: colors.text },
  clear: { ...type.label, color: colors.accent },
});
