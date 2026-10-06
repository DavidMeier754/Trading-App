import React from 'react';
import { Text, View } from 'react-native';

import { copy } from '../format';
import { colors, radius, space, type, themed } from '../theme';
import NumberText from './NumberText';

/**
 * A chip's two parts: "Day: −2R" is the name "Day" and the value "−2R". A
 * chip with no name ("1R of room left") is all value.
 */
export function chipParts(chip: string): { name: string | null; value: string } {
  const at = chip.indexOf(': ');
  if (at <= 0) return { name: null, value: chip };
  return { name: chip.slice(0, at), value: chip.slice(at + 2) };
}

/** A value that is a day's result in R takes its sign's colour; the sign stays with it. */
function toneOf(value: string): 'up' | 'down' | null {
  if (!/^[+−-]?\d+(\.\d+)?R$/.test(value)) return null;
  if (value.startsWith('+')) return 'up';
  if (value.startsWith('−') || value.startsWith('-')) return 'down';
  return null;
}

/**
 * docs/ui/08-quotes-and-charts.md §6.4 — the level file's `state` strings as chips above the chart.
 * Easy to read at a glance: the name quiet, the value in the text colour and
 * the number face, a day's result in R in its sign's colour.
 */
export default function StateChips({ state }: { state: string[] }) {
  return (
    <View style={styles.row}>
      {state.map((chip) => {
        const { name, value } = chipParts(copy(chip));
        const tone = toneOf(value);
        return (
          <View key={chip} style={styles.chip} accessible accessibilityLabel={copy(chip)}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            <NumberText
              style={[
                styles.value,
                tone === 'up' && { color: colors.up },
                tone === 'down' && { color: colors.down },
              ]}
            >
              {value}
            </NumberText>
          </View>
        );
      })}
    </View>
  );
}

const styles = themed(() => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 5,
  },
  name: { ...type.label, fontWeight: '500', color: colors.textMuted },
  value: { ...type.label, fontWeight: '700', color: colors.text },
}));
