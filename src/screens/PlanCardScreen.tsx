import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../format';
import { tapFeedback } from '../lesson/feedback';
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
export default function PlanCardScreen({
  screen,
  values,
  onChange,
}: {
  screen: S;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const scopedKey = (key: string) => (screen.slot ? `card.${screen.slot}.${key}` : key);

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
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{copy(field.label)}</Text>
              <View style={styles.valueRow}>
                <Text style={[styles.value, !current && styles.valueEmpty]}>
                  {current ?? 'not set'}
                </Text>
                {suggestion ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      tapFeedback();
                      onChange(key, suggestion);
                    }}
                    style={[
                      styles.suggest,
                      current === suggestion && styles.suggestOn,
                    ]}
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
  wrap: { flex: 1, justifyContent: 'center', gap: space.lg },
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
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  value: { ...type.title, color: colors.text },
  valueEmpty: { color: colors.textFaint, fontSize: 18 },
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
