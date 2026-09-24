import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useChartMove } from '../../lesson/haptics';
import { useLookSpec } from '../../lesson/look';
import { EASE_OUT_SETTLE } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, radius, space, type } from '../../theme';
import GrowBar, { GROW_DELAY, GROW_MS } from './GrowBar';

const STAGGER_MS = 80;

/** docs/UI.md §6.5 — a horizontal bar chart. */
export default function BarChart({
  data,
}: {
  data: { bars: { label: string; value: number }[]; unit?: string };
}) {
  const accent = useLookSpec().accent;
  const max = Math.max(...data.bars.map((b) => b.value), 1);
  // Like every chart, it vibrates while it moves and lands when it settles
  // (lesson/haptics.ts, startChartMove): here, while the bars grow.
  const reduced = useReduceMotion();
  const last = data.bars.length - 1;
  useChartMove(GROW_DELAY + last * STAGGER_MS + GROW_MS * EASE_OUT_SETTLE, !reduced && last >= 0);
  return (
    <View style={styles.wrap}>
      {data.bars.map((bar, i) => (
        <View key={bar.label} style={styles.row}>
          <Text style={styles.label}>{bar.label}</Text>
          <View style={styles.track}>
            <GrowBar
              to={(bar.value / max) * 100}
              delay={i * STAGGER_MS}
              style={[styles.fill, { backgroundColor: accent }]}
            />
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
  fill: { borderRadius: radius.sm },
  value: { ...type.small, color: colors.text, width: 52, textAlign: 'right' },
});
