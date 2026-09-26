import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { price, signedPercent } from '../../format';
import { surfaceStyle, tint, useLookSpec } from '../../lesson/look';
import { colors, radius, space, type } from '../../theme';
import type { ScannerRow } from '../../types';

type Column = {
  key: keyof ScannerRow;
  head: string;
  cell: (row: ScannerRow) => string;
  color?: (row: ScannerRow) => string;
};

/**
 * Every column the schema allows, in reading order. A table shows the ones its
 * rows actually carry: a column of dashes is noise the learner has to read past.
 */
const COLUMNS: Column[] = [
  { key: 'price', head: 'Price', cell: (r) => (r.price !== undefined ? price(r.price) : '—') },
  {
    key: 'change_pct',
    head: '%',
    cell: (r) => (r.change_pct !== undefined ? signedPercent(r.change_pct) : '—'),
    color: (r) => ((r.change_pct ?? 0) >= 0 ? colors.up : colors.down),
  },
  {
    key: 'rvol',
    head: 'RVol',
    cell: (r) => (r.rvol !== undefined ? `${r.rvol.toFixed(1)}x` : '—'),
  },
  { key: 'float', head: 'Float', cell: (r) => r.float ?? '—' },
  {
    key: 'spread',
    head: 'Spread',
    cell: (r) => (r.spread !== undefined ? r.spread.toFixed(2) : '—'),
  },
];

/** docs/UI.md §6.8 — the mock scanner / watchlist table. */
export default function ScannerTable({
  rows,
  onTapRow,
  selected,
  resolved,
  asAnswers,
}: {
  rows: ScannerRow[];
  onTapRow?: (ticker: string) => void;
  selected?: string | null;
  resolved?: Record<string, string>;
  /** Drawn as answer cards even when not tappable -- a revealed scanner-pick
   *  keeps the look it was answered in, instead of collapsing into a table. */
  asAnswers?: boolean;
}) {
  const look = useLookSpec();
  // As a question the rows are answers, so they look like answers: a card each,
  // in the look's own surface, with a radio mark that fills when picked. Read
  // only, they stay a table.
  const tappable = !!onTapRow || !!asAnswers;
  const columns = COLUMNS.filter((c) => rows.some((r) => r[c.key] !== undefined));
  return (
    <View style={[styles.wrap, tappable && styles.wrapCards]}>
      <View style={[styles.headRow, tappable && styles.headRowCards]}>
        <Text style={[styles.head, styles.cTicker]}>Ticker</Text>
        {columns.map((c) => (
          <Text key={c.key} style={[styles.head, styles.cNum]}>
            {c.head}
          </Text>
        ))}
      </View>
      {rows.map((row) => (
        <Pressable
          accessibilityRole="button"
          key={row.ticker}
          testID={`row-${row.ticker}`}
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
              ? {
                  borderColor: resolved[row.ticker],
                  backgroundColor: tint(resolved[row.ticker], 0.1),
                }
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
                  style={[
                    styles.radioDot,
                    { backgroundColor: resolved?.[row.ticker] ?? look.accent },
                  ]}
                />
              ) : null}
            </View>
          ) : null}
          <View style={styles.cTicker}>
            <Text style={styles.ticker}>{row.ticker}</Text>
            {row.catalyst ? <Text style={styles.catalyst}>{row.catalyst}</Text> : null}
          </View>
          {columns.map((c) => (
            <Text
              key={c.key}
              style={[styles.cell, styles.cNum, c.color ? { color: c.color(row) } : null]}
            >
              {c.cell(row)}
            </Text>
          ))}
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
