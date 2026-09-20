import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { price, signedPercent, signedPrice } from '../format';
import { colors, radius, space, type } from '../theme';

type Data = {
  ticker: string;
  name?: string;
  price: number;
  change?: number;
  change_pct?: number;
  volume?: string;
  prev_close?: number;
};

/** docs/UI.md §6.2 — quote card. */
export default function QuoteCard({ data }: { data: Data }) {
  const up = (data.change ?? 0) >= 0;
  const changeColor = up ? colors.up : colors.down;
  const hasChange = data.change !== undefined || data.change_pct !== undefined;

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.ticker}>{data.ticker}</Text>
        {data.name ? <Text style={styles.name}>{data.name}</Text> : null}
      </View>
      <Text style={styles.price}>{price(data.price)}</Text>
      {hasChange ? (
        <Text style={[styles.change, { color: changeColor }]}>
          {/* docs/UI.md §6: up/down always paired with an arrow or sign. */}
          {up ? '▲' : '▼'}{' '}
          {data.change !== undefined ? signedPrice(data.change) : ''}
          {data.change_pct !== undefined ? ` (${signedPercent(data.change_pct)})` : ''}
        </Text>
      ) : null}
      {data.volume ? <Text style={styles.volume}>Vol {data.volume}</Text> : null}
      {data.prev_close !== undefined ? (
        <Text style={styles.volume}>Prev close {price(data.prev_close)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.xs,
  },
  headRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  ticker: { ...type.prompt, color: colors.text, letterSpacing: 0.5 },
  name: { ...type.small, color: colors.textMuted },
  price: { ...type.display, color: colors.text },
  change: { ...type.answer },
  volume: { ...type.small, color: colors.textMuted },
});
