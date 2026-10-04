import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { price, signedPercent } from '../../format';
import { surfaceStyle, tint, useLookSpec } from '../../lesson/look';
import { colors, radius, space, type, themed } from '../../theme';
import type { ScannerRow } from '../../types';
import Sparkline from '../Sparkline';

type Column = {
  key: keyof ScannerRow;
  head: string;
  cell: (row: ScannerRow) => string;
};

/**
 * The columns after the day's move, each shown only when the rows carry it:
 * a column of dashes is noise the learner has to read past.
 */
const MORE: Column[] = [
  {
    key: 'spread',
    head: 'Spread',
    cell: (r) => (r.spread !== undefined ? r.spread.toFixed(2) : '—'),
  },
  { key: 'float', head: 'Float', cell: (r) => r.float ?? '—' },
];

/** Relative volume a full bar stands for. */
const RVOL_FULL = 5;
const SPARK_W = 48;
const SPARK_H = 22;

/**
 * The day so far, for the row's sparkline (docs/UI.md §6.8 [DESIGN-REVIEW]):
 * the file's `spark` when it gives one; otherwise a plain line from the
 * previous close to the change -- never invented wiggles -- drawn in percent
 * on one scale for the whole table, so +0.2 % lies nearly flat and +18.6 %
 * climbs.
 */
function dayOf(
  row: ScannerRow,
  pctRange: [number, number],
): { values: number[]; base?: number; range?: [number, number] } | null {
  if (row.spark && row.spark.length >= 2) return { values: row.spark };
  if (row.change_pct === undefined) return null;
  return { values: [0, row.change_pct], base: 0, range: pctRange };
}

/** A catalyst that says there is none is no tag. */
const NO_CATALYST = /^\s*(—|-|–|none|no news)?\s*$/i;

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
  const more = MORE.filter((c) => rows.some((r) => r[c.key] !== undefined));
  const hasChange = rows.some((r) => r.change_pct !== undefined || r.spark);
  const hasRvol = rows.some((r) => r.rvol !== undefined);
  const hasPrice = rows.some((r) => r.price !== undefined);
  // From the previous close (0 %) to the furthest move either way, so the
  // biggest mover spans the line's height and the rest compare with it.
  const pcts = rows.map((r) => r.change_pct ?? 0);
  const pctRange: [number, number] = [Math.min(0, ...pcts), Math.max(0.5, ...pcts)];
  return (
    <View style={[styles.wrap, tappable && styles.wrapCards]}>
      <View style={[styles.headRow, tappable && styles.headRowCards]}>
        <Text style={[styles.head, styles.cStock]}>Stock</Text>
        {hasChange ? <Text style={[styles.head, styles.cToday]}>Today</Text> : null}
        {hasChange || hasPrice ? (
          <Text style={[styles.head, styles.cNum]}>{hasChange ? '%' : 'Price'}</Text>
        ) : null}
        {hasRvol ? <Text style={[styles.head, styles.cNum]}>RVol</Text> : null}
        {more.map((c) => (
          <Text key={c.key} style={[styles.head, styles.cNum]}>
            {c.head}
          </Text>
        ))}
      </View>
      {rows.map((row) => {
        const day = dayOf(row, pctRange);
        const label = [
          row.ticker,
          row.catalyst,
          row.change_pct !== undefined ? `${signedPercent(row.change_pct)} today` : null,
          row.price !== undefined ? price(row.price) : null,
          row.rvol !== undefined ? `relative volume ${row.rvol.toFixed(1)}` : null,
          ...more.map((c) => `${c.head} ${c.cell(row)}`),
        ]
          .filter(Boolean)
          .join(', ');
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
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
            <View style={styles.cStock}>
              <Text style={styles.ticker}>{row.ticker}</Text>
              {row.catalyst && !NO_CATALYST.test(row.catalyst) ? (
                // Two lines at most: "Halted, reopened" wraps rather than losing its end.
                <Text style={styles.catalyst} numberOfLines={2}>
                  {row.catalyst}
                </Text>
              ) : null}
            </View>
            {hasChange ? (
              <View style={styles.cToday}>
                {day ? (
                  <Sparkline
                    values={day.values}
                    base={day.base}
                    range={day.range}
                    width={SPARK_W}
                    height={SPARK_H}
                    strokeWidth={1.5}
                  />
                ) : null}
              </View>
            ) : null}
            {hasChange || hasPrice ? (
              <View style={styles.cNum}>
                {row.change_pct !== undefined ? (
                  <Text
                    style={[
                      styles.change,
                      { color: row.change_pct >= 0 ? colors.up : colors.down },
                    ]}
                  >
                    {signedPercent(row.change_pct)}
                  </Text>
                ) : null}
                {row.price !== undefined ? (
                  <Text style={hasChange ? styles.sub : styles.cell}>{price(row.price)}</Text>
                ) : null}
              </View>
            ) : null}
            {hasRvol ? (
              <View style={styles.cNum}>
                <Text style={styles.cell}>
                  {row.rvol !== undefined ? `${row.rvol.toFixed(1)}×` : '—'}
                </Text>
                {row.rvol !== undefined ? (
                  <View style={styles.rvolTrack}>
                    <View
                      style={[
                        styles.rvolBar,
                        { width: `${Math.min(1, row.rvol / RVOL_FULL) * 100}%` },
                      ]}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
            {more.map((c) => (
              <Text key={c.key} style={[styles.cell, styles.cNum]}>
                {c.cell(row)}
              </Text>
            ))}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: 4 },
  wrapCards: { gap: space.sm },
  headRow: { flexDirection: 'row', paddingHorizontal: space.sm, gap: space.sm },
  // Clears the radio column, so the headings sit over their numbers.
  headRowCards: { paddingLeft: space.md + 18 + space.sm, paddingRight: space.md },
  head: { ...type.small, color: colors.textFaint, letterSpacing: 0.8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  rowCard: { minHeight: 56, paddingHorizontal: space.md, gap: space.sm, paddingVertical: space.sm },
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
  // David, 2026-10-03: "not so much space between the Stock and Today".
  cStock: { width: 76, alignItems: 'flex-start', gap: 2 },
  cToday: { width: SPARK_W },
  cNum: { flex: 1, alignItems: 'flex-end', textAlign: 'right' },
  ticker: { ...type.answer, color: colors.text },
  catalyst: {
    ...type.small,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMuted,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  cell: { ...type.small, color: colors.text, fontVariant: ['tabular-nums'] },
  change: { ...type.small, fontWeight: '700', fontVariant: ['tabular-nums'] },
  sub: { ...type.small, fontSize: 13, color: colors.textFaint, fontVariant: ['tabular-nums'] },
  rvolTrack: {
    marginTop: 3,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  rvolBar: { height: 4, borderRadius: 2, backgroundColor: colors.textMuted },
}));
