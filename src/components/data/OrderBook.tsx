import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { count, price } from '../../format';
import { colors, radius, space, type } from '../../theme';
import GrowBar from './GrowBar';

type Level = [number, number];

/**
 * docs/UI.md §6.6 — the order-book ladder. Two columns of price levels with size
 * bars, best bid/ask highlighted. Rows are tappable for `depth-ladder`.
 */
export default function OrderBook({
  bids,
  asks,
  onTapRow,
  selected,
  resolved,
}: {
  bids: Level[];
  asks: Level[];
  onTapRow?: (id: string) => void;
  selected?: string | null;
  resolved?: Record<string, string>;
}) {
  const maxSize = Math.max(...bids.map((b) => b[1]), ...asks.map((a) => a[1]), 1);

  const side = (levels: Level[], kind: 'bid' | 'ask') => (
    <View style={styles.col}>
      <Text style={[styles.head, { color: kind === 'bid' ? colors.up : colors.down }]}>
        {kind === 'bid' ? 'BIDS' : 'ASKS'}
      </Text>
      {levels.map(([p, size], i) => {
        const id = `${kind}-${i + 1}`;
        const tint = kind === 'bid' ? colors.up : colors.down;
        return (
          <Pressable
            accessibilityRole="button"
            key={id}
            disabled={!onTapRow}
            onPress={() => onTapRow?.(id)}
            style={[
              styles.row,
              i === 0 && styles.best,
              selected === id && { borderColor: colors.accent },
              resolved?.[id] ? { borderColor: resolved[id] } : null,
            ]}
          >
            {/* Depth grows out from the spread, level by level. */}
            <GrowBar
              to={(size / maxSize) * 100}
              from={kind === 'bid' ? 'right' : 'left'}
              delay={i * 70}
              style={[styles.sizeBar, { backgroundColor: tint, opacity: 0.16 }]}
            />
            <Text style={[styles.price, { color: tint }]}>{price(p)}</Text>
            <Text style={styles.size}>{count(size)}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {side(bids, 'bid')}
      {side(asks, 'ask')}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: space.sm },
  col: { flex: 1, gap: 3 },
  head: { ...type.small, fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    minHeight: 34,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  best: { backgroundColor: colors.surfaceAlt },
  sizeBar: { position: 'absolute', top: 0, bottom: 0 },
  price: { ...type.small, fontWeight: '600' },
  size: { ...type.small, color: colors.textMuted },
});
