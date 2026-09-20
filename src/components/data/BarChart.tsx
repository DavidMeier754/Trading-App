import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '../../theme';

/** docs/UI.md §6.5 — a horizontal bar chart. */
export default function BarChart({
  data,
}: {
  data: { bars: { label: string; value: number }[]; unit?: string };
}) {
  const max = Math.max(...data.bars.map((b) => b.value), 1);
  return (
    <View style={styles.wrap}>
      {data.bars.map((bar) => (
        <View key={bar.label} style={styles.row}>
          <Text style={styles.label}>{bar.label}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(bar.value / max) * 100}%` }]} />
          </View>
          <Text style={styles.value}>
            {`${bar.value}${data.unit ? ` ${data.unit}` : ''}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { ...type.small, color: colors.textMuted, width: 78 },
  track: {
    flex: 1,
    height: 18,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: radius.sm },
  value: { ...type.small, color: colors.text, width: 52, textAlign: 'right' },
});
