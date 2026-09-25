import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { AnswerValue } from '../lesson/answers';
import { groupThousands, signedPrice } from '../format';
import { isSum, parseNumeric } from '../lesson/answers';
import Shake from '../lesson/Shake';
import { useBorderTransition } from '../lesson/toneTransition';
import { usePressFeedback } from '../lesson/motion';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type { NumericInputScreen as S } from '../types';
import { Prompt } from './common';

// Digits as on a phone, the four operators down the right the way a
// calculator has them, and = to fold a sum into its result. The sum is what
// is graded, so the learner can work 0.03 ÷ 0.60 on the pad rather than on
// paper.
const ROWS = [
  ['1', '2', '3', '÷'],
  ['4', '5', '6', '×'],
  ['7', '8', '9', '−'],
  ['.', '0', '=', '+'],
];
/** The keypad's operators as the field stores them. */
const OP: Record<string, string> = { '÷': '/', '×': '*', '−': '-', '+': '+' };
const SAID: Record<string, string> = {
  '÷': 'Divided by',
  '×': 'Times',
  '−': 'Minus',
  '+': 'Plus',
  '=': 'Equals',
  '.': 'Point',
};
/** Long enough for any sum a lesson asks for; short enough to stay on one line. */
const MAX_LENGTH = 20;

/** A result as the field holds it: no float noise, no trailing zeros. */
function plain(v: number): string {
  return String(Number(v.toFixed(6)));
}

/** What the field shows: × ÷ − for * / -, and room either side of an operator. */
function pretty(text: string): string {
  return text
    .replace(/([\d.])([-+*/])/g, '$1 $2 ')
    .replace(/-/g, '−')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .trim();
}

/**
 * The field's type size for what it holds: full size for a number, stepping
 * down as a sum grows, so it stays on one line. The line height does not
 * change, so neither does the field.
 */
function fieldSize(length: number): number {
  if (length <= 11) return 28;
  if (length <= 15) return 23;
  if (length <= 20) return 18;
  if (length <= 26) return 15;
  return 13;
}

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
  const operator = label in OP || label === '=';
  const press = usePressFeedback(!disabled);
  const [down, setDown] = React.useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={SAID[label]}
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
      // The slot carries the size, the view inside it carries the look. The
      // other way round -- a size on the inner view -- measures against a
      // parent that is itself sized by its content, so every key collapsed to
      // the width of its digit and the pad rendered as a row of slivers.
      style={styles.keySlot}
    >
      <Animated.View
        style={[
          styles.key,
          operator && styles.keyOperator,
          press.style,
          down && !disabled && styles.keyDown,
        ]}
      >
        <Text style={[styles.keyText, operator && styles.keyOperatorText]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * docs/UI.md §4.1 `numeric-input`: a custom keypad (digits, `.`, × ÷ − + and
 * `=`) — not the OS keyboard — with a configurable tolerance. The field takes a
 * number or a sum; a sum's value shows under it as it is typed, and that value
 * is what is graded. `unit` prefixes or suffixes the field.
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
    entered !== null && Math.abs(entered - screen.answer) <= (screen.tolerance ?? 0) + 1e-9;

  const set = (next: string) => onChange({ kind: 'numeric', text: next });

  const press = (key: string) => {
    if (revealed) return;
    if (key === '=') {
      // Folds the sum into its value, to carry on from: "0.60 − 0.03 =" leaves 0.57.
      if (isSum(text) && entered !== null) set(plain(entered));
      return;
    }
    if (text.length >= MAX_LENGTH) return;
    const op = OP[key];
    if (op) {
      const last = text.slice(-1);
      // Nothing to work on yet: only a minus, the sign of a negative answer.
      if (text === '' || text === '-') {
        if (op === '-' && text === '') set('-');
        return;
      }
      if ('+-*/'.includes(last)) {
        // A minus after × or ÷ is the next number's sign (3 × −2); any other
        // operator after an operator replaces it, as on a calculator.
        if (op === '-' && (last === '*' || last === '/')) {
          set(text + op);
          return;
        }
        const base = text.replace(/[-+*/]+$/, '');
        if (base !== '') set(base + op);
        return;
      }
      set(text + op);
      return;
    }
    // One point per number, not per field: 0.03 ÷ 0.60 has two.
    if (key === '.' && (text.split(/[-+*/]/).pop() ?? '').includes('.')) return;
    set(text + key);
  };

  const unitIsPrefix = screen.unit === '$' || screen.unit === '€';
  const sum = isSum(text);
  const typed = sum ? pretty(text) : text.replace('-', '−');
  const isEmpty = typed.length === 0;
  // An empty field used to read "$—", which looks like a value rather than a gap.
  // It now shows a faint 0.00 the first keypress replaces.
  const shown = isEmpty ? '0.00' : typed;

  const fieldColor = !revealed ? colors.accent : isRight ? colors.success : colors.down;

  // docs/UI.md §5.1: the field ramps to its verdict colour over 200 ms.
  const animatedBorder = useBorderTransition(fieldColor, revealed);

  // A minus leads the currency, as every price in the app writes it: "−$0.40",
  // not "$−0.40".
  const negative = !sum && typed.startsWith('−');
  const digits = negative ? typed.slice(1) : typed;
  const canDelete = !revealed && text.length > 0;
  // A sum is shown as typed, with no unit on it: the unit belongs to the
  // answer, and the line under the field gives the sum's value with it.
  const showUnit = !!screen.unit && !sum;
  const size = { fontSize: fieldSize(typed.length) };

  const withUnit = (v: number): string => {
    if (!unitIsPrefix) return `${plain(v)}${screen.unit ? ` ${screen.unit}` : ''}`;
    const [int, frac] = plain(Math.abs(v)).split('.');
    const cents = frac === undefined ? '' : `.${frac.padEnd(2, '0')}`;
    return `${v < 0 ? '−' : ''}${screen.unit}${groupThousands(int)}${cents}`;
  };
  const worked = sum && entered !== null ? `= ${withUnit(entered)}` : null;

  const field = (
    <Animated.View style={[styles.field, animatedBorder]}>
      <View style={styles.fieldRow}>
        {negative && unitIsPrefix ? (
          <Text style={[styles.fieldText, size, revealed && { color: fieldColor }]}>−</Text>
        ) : null}
        {unitIsPrefix && showUnit ? (
          <Text style={[styles.unit, isEmpty && styles.faint]}>{screen.unit}</Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={[
            styles.fieldText,
            size,
            isEmpty && styles.faint,
            revealed && !isEmpty && { color: fieldColor },
          ]}
        >
          {isEmpty ? shown : unitIsPrefix && !sum ? digits : typed}
        </Text>
        {!unitIsPrefix && showUnit ? (
          <Text style={[styles.unit, isEmpty && styles.faint]}>{screen.unit}</Text>
        ) : null}
      </View>
      {/* Backspace where the eye already is, the way a calculator has it; the
          little "Delete" link under the pad was easy to miss. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete"
        disabled={!canDelete}
        onPress={() => onChange({ kind: 'numeric', text: text.slice(0, -1) })}
        hitSlop={8}
        style={styles.backspace}
      >
        <Text style={[styles.backspaceText, !canDelete && { color: colors.textFaint }]}>⌫</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      {revealed && !isRight ? <Shake>{field}</Shake> : field}
      {/* The line under the field keeps its place whether or not it has
          anything to say, so the pad under it never drops: it gives a sum's
          value as it is typed, and after a wrong answer the right one. */}
      <Text style={styles.answerLine} numberOfLines={1}>
        {revealed && !isRight ? (
          <>
            {worked ? `${worked} · ` : ''}
            {'Answer: '}
            <Text style={{ color: colors.success }}>
              {unitIsPrefix
                ? signedPrice(screen.answer)
                : `${screen.answer}${screen.unit ? ` ${screen.unit}` : ''}`}
            </Text>
          </>
        ) : worked ? (
          <Text style={revealed ? { color: colors.success } : null}>{worked}</Text>
        ) : (
          // A space that holds its line: kept to one line, a plain space
          // collapses to nothing.
          '\u00A0'
        )}
      </Text>

      <View style={styles.pad}>
        {ROWS.map((row) => (
          <View key={row.join('')} style={styles.padRow}>
            {row.map((key) => (
              <Key key={key} label={key} disabled={revealed} onPress={() => press(key)} />
            ))}
          </View>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
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
  answerLine: { ...type.body, color: colors.textMuted, minHeight: type.body.lineHeight },
  pad: { gap: space.sm },
  padRow: { flexDirection: 'row', gap: space.sm },
  keySlot: { flex: 1, minHeight: TAP_TARGET },
  key: {
    flex: 1,
    minHeight: TAP_TARGET,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDown: { backgroundColor: colors.surfaceAlt },
  keyText: { ...type.prompt, color: colors.text },
  keyOperator: { backgroundColor: 'rgba(76,141,255,0.10)', borderColor: 'rgba(76,141,255,0.35)' },
  keyOperatorText: { color: colors.accent },
  backspace: {
    position: 'absolute',
    right: space.sm,
    top: 0,
    bottom: 0,
    width: TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backspaceText: { fontSize: 22, lineHeight: 26, color: colors.textMuted },
});
