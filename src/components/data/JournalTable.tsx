import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { copy } from '../../format';
import { colors, radius, space, type, themed } from '../../theme';

/** A column key as a heading: "setup" reads "Setup"; "R" stays "R". */
function heading(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * A cell as it is read: the profile's currency, a real minus sign, and a
 * signed number -- an R, a P&L -- in the colour of its sign.
 */
function cellOf(value: string | number | undefined): { text: string; color?: string } {
  if (value === undefined) return { text: '—' };
  const text = copy(String(value)).replace(/^-(?=[\d$€.])/, '−');
  if (/^\+\d/.test(text)) return { text, color: colors.up };
  if (/^−\d/.test(text)) return { text, color: colors.down };
  return { text };
}

/**
 * docs/UI.md §6.8 — the journal, one row per finished trade. The same table
 * carries any small grid of words: a first column keyed "" is a row label.
 */
export default function JournalTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Record<string, string | number>[];
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        {columns.map((c) => (
          <Text key={c} style={[styles.head, c === '' && styles.labelCol]}>
            {heading(c)}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {columns.map((c) => {
            const cell = cellOf(row[c]);
            return (
              <Text
                key={c}
                style={[
                  styles.cell,
                  c === '' && [styles.labelCol, styles.label],
                  cell.color ? { color: cell.color } : null,
                ]}
                numberOfLines={2}
              >
                {cell.text}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = themed(() => ({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  headRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    gap: space.xs,
  },
  head: {
    ...type.small,
    fontSize: 13,
    flex: 1,
    color: colors.textFaint,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    gap: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cell: { ...type.small, flex: 1, color: colors.text },
  labelCol: { flex: 1.1 },
  label: { color: colors.textMuted },
}));
