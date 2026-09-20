import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { price } from '../../format';
import { colors, radius, space, type } from '../../theme';

/** docs/UI.md §6.3 — Bid / Ask / Last / Spread. */
export default function QuotePanel({
  data,
  onTapTarget,
  highlight,
}: {
  data: { bid: number; ask: number; last?: number };
  onTapTarget?: (id: string) => void;
  highlight?: Record<string, string>;
}) {
  const spread = data.ask - data.bid;

  const cell = (id: string, label: string, value: string, tint?: string) => (
    <Pressable
      disabled={!onTapTarget}
      onPress={() => onTapTarget?.(id)}
      style={[
        styles.cell,
        tint ? { backgroundColor: tint } : null,
        highlight?.[id] ? { borderColor: highlight[id], borderWidth: 2 } : null,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {cell('bid', 'BID', price(data.bid), 'rgba(38,194,129,0.10)')}
        {cell('spread', 'SPREAD', spread.toFixed(2))}
        {cell('ask', 'ASK', price(data.ask), 'rgba(240,87,79,0.10)')}
      </View>
      {data.last !== undefined
        ? cell('last', 'LAST', price(data.last))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  cell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
    gap: 2,
    minHeight: 64,
    justifyContent: 'center',
  },
  label: { ...type.small, fontSize: 10, color: colors.textMuted, letterSpacing: 1 },
  value: { ...type.answer, color: colors.text },
});
