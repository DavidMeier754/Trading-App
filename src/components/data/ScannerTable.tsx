import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { signedPercent } from '../../format';
import { surfaceStyle, tint, useLookSpec } from '../../lesson/look';
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
  const look = useLookSpec();
  // As a question the rows are answers, so they look like answers: a card each,
  // in the look's own surface, with a radio mark that fills when picked. Read
  // only, they stay a table.
  const tappable = !!onTapRow;
  return (
    <View style={[styles.wrap, tappable && styles.wrapCards]}>
      <View style={[styles.headRow, tappable && styles.headRowCards]}>
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
          style={({ pressed }) => [
            styles.row,
            tappable && [surfaceStyle(look), styles.rowCard],
            selected === row.ticker && {
              borderColor: look.accent,
              backgroundColor: tint(look.accent, 0.12),
            },
            resolved?.[row.ticker]
              ? { borderColor: resolved[row.ticker], backgroundColor: tint(resolved[row.ticker], 0.1) }
              : null,
            pressed && tappable && { transform: [{ scale: 0.985 }] },
          ]}
        >
          {tappable ? (
            <View
              style={[
                styles.radio,
                (selected === row.ticker || resolved?.[row.ticker]) && {
                  borderColor: resolved?.[row.ticker] ?? look.accent,
                },
              ]}
            >
              {selected === row.ticker || resolved?.[row.ticker] ? (
                <View
                  style={[styles.radioDot, { backgroundColor: resolved?.[row.ticker] ?? look.accent }]}
                />
              ) : null}
            </View>
          ) : null}
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
  wrapCards: { gap: space.sm },
  headRow: { flexDirection: 'row', paddingHorizontal: space.sm },
  // Clears the radio column, so the headings sit over their numbers.
  headRowCards: { paddingLeft: space.md + 18 + space.sm, paddingRight: space.md },
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
  rowCard: { minHeight: 56, paddingHorizontal: space.md, gap: space.sm },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  cTicker: { flex: 3 },
  cNum: { flex: 2, textAlign: 'right' },
  ticker: { ...type.answer, color: colors.text },
  catalyst: { ...type.small, fontSize: 10, color: colors.textFaint },
  cell: { ...type.small, color: colors.text },
});
