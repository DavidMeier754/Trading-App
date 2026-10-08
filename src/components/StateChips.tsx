import React from 'react';
import { Text, View } from 'react-native';

import { copy } from '../format';
import { colors, radius, space, type, themed } from '../theme';
import NumberText from './NumberText';
import { BADGE, ExplainBadge } from './ExplainKey';
import { chipParts } from './explain';

export { chipParts };

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
export default function StateChips({
  state,
  numbers,
}: {
  state: string[];
  /** docs/ui/08-quotes-and-charts.md §6.4a: with the "?" key on, a chip's number in its legend. */
  numbers?: Record<number, number>;
}) {
  return (
    <View style={styles.row}>
      {state.map((chip, i) => {
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
            {numbers?.[i] ? <ExplainBadge n={numbers[i]} style={styles.badge} /> : null}
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
  // On the chip's corner, over its border, so the chip keeps its size.
  badge: { top: -BADGE / 2, right: -BADGE / 3 },
  value: { ...type.label, fontWeight: '700', color: colors.text },
}));
