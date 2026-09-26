import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { copy } from '../format';
import { tapFeedback } from '../lesson/feedback';
import { surfaceStyle, useLookSpec } from '../lesson/look';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type { PlanCardScreen as S } from '../types';
import { Body, ScreenTitle } from './common';

/**
 * docs/UI.md §3 `plan-card` — the card the learner fills in and keeps.
 *
 * Values are held by the player for this run only. Persisting them to a profile
 * is what docs/schema.md's "The plan" namespace is for, and that needs storage
 * this slice does not have; the keys written here are already the real ones, so
 * wiring a store later is a swap of the setter.
 */
/** The key a card's field writes: a playbook slot's row, or the plain key. */
export function planKeyOf(screen: S, key: string): string {
  return screen.slot ? `card.${screen.slot}.${key}` : key;
}

/**
 * Every line of the card filled in: a text line with words in it, a number
 * above zero -- a loss limit or a trade cap of 0 is not a plan. The card's
 * button waits for it (LessonPlayer).
 */
export function planCardComplete(screen: S, values: Record<string, string>): boolean {
  return screen.fields.every((field) => {
    const v = (values[planKeyOf(screen, field.key)] ?? '').trim();
    return field.kind === 'text' ? v.length > 0 : Number(v) > 0;
  });
}

export default function PlanCardScreen({
  screen,
  values,
  onChange,
}: {
  screen: S;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const look = useLookSpec();
  const scopedKey = (key: string) => planKeyOf(screen, key);

  return (
    <View style={styles.wrap}>
      <ScreenTitle>{screen.title}</ScreenTitle>
      {screen.intro ? <Body>{screen.intro}</Body> : null}

      <View style={styles.fields}>
        {screen.fields.map((field) => {
          const key = scopedKey(field.key);
          const current = values[key];
          const suggestion = field.suggest !== undefined ? String(field.suggest) : null;
          return (
            <View key={key} style={[styles.field, surfaceStyle(look)]}>
              <Text style={styles.label}>{copy(field.label)}</Text>
              <View style={styles.valueRow}>
                {field.kind === 'text' ? (
                  // Words are typed. The suggestion, where there is one, is the
                  // placeholder (docs/schema.md "The plan").
                  <TextInput
                    value={current ?? ''}
                    onChangeText={(text) => onChange(key, text)}
                    placeholder={suggestion ?? 'Type it here'}
                    placeholderTextColor={colors.textFaint}
                    maxLength={60}
                    returnKeyType="done"
                    blurOnSubmit
                    accessibilityLabel={copy(field.label)}
                    style={[styles.value, styles.input]}
                  />
                ) : (
                  // An empty number shows its suggestion, faint, in the value's
                  // own size and place (docs/schema.md: `suggest` is the
                  // placeholder while the key is empty); 0 only when there is none.
                  <Text style={[styles.value, !current && styles.valueEmpty]}>
                    {current ?? suggestion ?? '0'}
                  </Text>
                )}
                {suggestion ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      tapFeedback();
                      onChange(key, suggestion);
                    }}
                    style={[styles.suggest, current === suggestion && styles.suggestOn]}
                  >
                    <Text style={styles.suggestText}>{`Use ${suggestion}`}</Text>
                  </Pressable>
                ) : null}
              </View>
              {field.kind !== 'text' ? (
                <View style={styles.stepper}>
                  {['−', '+'].map((sign) => (
                    <Pressable
                      accessibilityRole="button"
                      key={sign}
                      onPress={() => {
                        tapFeedback();
                        // From what is shown: an empty field steps from its
                        // faint suggestion, or from 0 when it has none.
                        const base = Number(current ?? suggestion ?? 0);
                        const next = sign === '+' ? base + 1 : Math.max(0, base - 1);
                        onChange(key, String(next));
                      }}
                      style={styles.stepperKey}
                    >
                      <Text style={styles.stepperText}>{sign}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {screen.note ? <Text style={styles.note}>{copy(screen.note)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  fields: { gap: space.md },
  field: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
  },
  label: { ...type.small, color: colors.textMuted },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  value: { ...type.title, color: colors.text },
  valueEmpty: { color: colors.textFaint },
  input: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderStrong,
  },
  suggest: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  suggestOn: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  suggestText: { ...type.small, color: colors.text },
  stepper: { flexDirection: 'row', gap: space.sm },
  stepperKey: {
    flex: 1,
    minHeight: TAP_TARGET - 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { ...type.prompt, color: colors.text },
  note: { ...type.small, color: colors.textFaint },
});
