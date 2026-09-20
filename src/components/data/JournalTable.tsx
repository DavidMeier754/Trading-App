import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '../../theme';

/** docs/UI.md §6.8 — the journal, one row per finished trade. */
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
          <Text key={c} style={styles.head}>
            {c}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {columns.map((c) => (
            <Text key={c} style={styles.cell} numberOfLines={1}>
              {row[c] !== undefined ? String(row[c]) : '—'}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 10,
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
});
