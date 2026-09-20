import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { count, price } from '../../format';
import { colors, radius, space, type } from '../../theme';

/** docs/UI.md §6.5 — spread + slippage + fees against the target, per share. */
export default function CostStack({
  data,
}: {
  data: {
    shares: number;
    spread?: number;
    slippage?: number;
    fees?: number;
    target: number;
  };
}) {
  const parts = [
    { key: 'Spread', value: data.spread ?? 0, color: colors.down },
    { key: 'Slippage', value: data.slippage ?? 0, color: colors.warning },
    { key: 'Fees', value: data.fees ?? 0, color: colors.textMuted },
  ].filter((p) => p.value > 0);

  const cost = parts.reduce((a, p) => a + p.value, 0);
  const pct = data.target > 0 ? (cost / data.target) * 100 : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Cost</Text>
          <View style={styles.track}>
            {parts.map((p) => (
              <View
                key={p.key}
                style={{
                  width: `${(p.value / Math.max(data.target, cost)) * 100}%`,
                  backgroundColor: p.color,
                }}
              />
            ))}
          </View>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Target</Text>
          <View style={styles.track}>
            <View
              style={{
                width: `${(data.target / Math.max(data.target, cost)) * 100}%`,
                backgroundColor: colors.up,
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        {parts.map((p) => (
          <View key={p.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: p.color }]} />
            <Text style={styles.legendText}>{`${p.key} ${price(p.value)}`}</Text>
          </View>
        ))}
      </View>

      {/* docs/UI.md §9: cost math always shows a share count. */}
      <Text style={styles.summary}>
        {`${price(cost)} per share on ${count(data.shares)} shares eats ${pct.toFixed(0)} % of the target.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  bars: { gap: space.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  barLabel: { ...type.small, color: colors.textMuted, width: 48 },
  track: {
    flex: 1,
    height: 22,
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...type.small, color: colors.textMuted },
  summary: { ...type.small, color: colors.text },
});
