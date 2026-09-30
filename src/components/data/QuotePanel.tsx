import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { price } from '../../format';
import { tint } from '../../lesson/look';
import { colors, radius, space, type, themed } from '../../theme';
import { spotlight } from '../spotlight';

/** docs/UI.md §6.3 — Bid / Ask / Last / Spread. */
export default function QuotePanel({
  data,
  onTapTarget,
  highlight,
  focus,
}: {
  data: { bid: number; ask: number; last?: number };
  onTapTarget?: (id: string) => void;
  highlight?: Record<string, string>;
  focus?: string;
}) {
  const spread = data.ask - data.bid;

  const cell = (id: string, label: string, value: string, tint?: string) => (
    <Pressable
      accessibilityRole="button"
      testID={`target-${id}`}
      disabled={!onTapTarget}
      onPress={() => onTapTarget?.(id)}
      style={[
        styles.cell,
        tint ? { backgroundColor: tint } : null,
        // One border width lit or not, so lighting a cell never resizes it.
        highlight?.[id] ? { borderColor: highlight[id] } : null,
        spotlight(id, focus, highlight),
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {cell('bid', 'BID', price(data.bid), tint(colors.up, 0.1))}
        {cell('spread', 'SPREAD', price(spread))}
        {cell('ask', 'ASK', price(data.ask), tint(colors.down, 0.1))}
      </View>
      {data.last !== undefined ? cell('last', 'LAST', price(data.last)) : null}
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  cell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
    gap: 2,
    minHeight: 64,
    justifyContent: 'center',
  },
  label: { ...type.small, color: colors.textMuted, letterSpacing: 1 },
  value: { ...type.answer, color: colors.text },
}));
