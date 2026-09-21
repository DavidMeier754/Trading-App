import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { signedPercent } from '../../format';
import { colors, radius, space, type } from '../../theme';
import type { ScannerRow } from '../../types';

/** docs/UI.md §6.8 — the mock scanner / watchlist table. */
export default function ScannerTable({
  rows,
  onTapRow,
  selected,
  resolved,
}: {
  rows: ScannerRow[];
  onTapRow?: (ticker: string) => void;
  selected?: string | null;
  resolved?: Record<string, string>;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={[styles.head, styles.cTicker]}>Ticker</Text>
        <Text style={[styles.head, styles.cNum]}>%</Text>
        <Text style={[styles.head, styles.cNum]}>RVol</Text>
        <Text style={[styles.head, styles.cNum]}>Spread</Text>
      </View>
      {rows.map((row) => (
        <Pressable
          accessibilityRole="button"
          key={row.ticker}
          disabled={!onTapRow}
          onPress={() => onTapRow?.(row.ticker)}
          style={[
            styles.row,
            selected === row.ticker && { borderColor: colors.accent },
            resolved?.[row.ticker] ? { borderColor: resolved[row.ticker] } : null,
          ]}
        >
          <View style={styles.cTicker}>
            <Text style={styles.ticker}>{row.ticker}</Text>
            {row.catalyst ? <Text style={styles.catalyst}>{row.catalyst}</Text> : null}
          </View>
          <Text
            style={[
              styles.cell,
              styles.cNum,
              { color: (row.change_pct ?? 0) >= 0 ? colors.up : colors.down },
            ]}
          >
            {row.change_pct !== undefined ? signedPercent(row.change_pct) : '—'}
          </Text>
          <Text style={[styles.cell, styles.cNum]}>
            {row.rvol !== undefined ? `${row.rvol.toFixed(1)}x` : '—'}
          </Text>
          <Text style={[styles.cell, styles.cNum]}>
            {row.spread !== undefined ? row.spread.toFixed(2) : '—'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  headRow: { flexDirection: 'row', paddingHorizontal: space.sm },
  head: { ...type.small, fontSize: 10, color: colors.textFaint, letterSpacing: 0.8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  cTicker: { flex: 3 },
  cNum: { flex: 2, textAlign: 'right' },
  ticker: { ...type.answer, color: colors.text },
  catalyst: { ...type.small, fontSize: 10, color: colors.textFaint },
  cell: { ...type.small, color: colors.text },
});
