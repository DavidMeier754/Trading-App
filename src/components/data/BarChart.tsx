import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useChartMove } from '../../lesson/haptics';
import { useLookSpec } from '../../lesson/look';
import { EASE_OUT_SETTLE } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { copy, count, volume } from '../../format';
import { colors, radius, space, type } from '../../theme';
import GrowBar, { GROW_DELAY, GROW_MS } from './GrowBar';

const STAGGER_MS = 80;

/** Unit words that ride on every value; `tight` ones sit on the number with no space. */
const SUFFIX: Record<string, { tight: boolean }> = {
  M: { tight: true },
  K: { tight: true },
  '%': { tight: false },
  x: { tight: true },
  min: { tight: false },
  h: { tight: false },
};

/**
 * A bar's number and what is said once for all of them. "M shares" puts "M" on
 * every bar and "shares" under the chart; "shares a day" goes under the chart
 * whole, so a value column never has to hold a sentence.
 */
function splitUnit(unit: string | undefined): { suffix: string; tight: boolean; caption: string } {
  if (!unit) return { suffix: '', tight: true, caption: '' };
  if (unit === '$') return { suffix: '$', tight: true, caption: '' };
  const [first, ...rest] = unit.split(' ');
  const known = SUFFIX[first];
  if (known) return { suffix: first, tight: known.tight, caption: rest.join(' ') };
  return { suffix: '', tight: true, caption: unit };
}

function valueText(value: number, unit: ReturnType<typeof splitUnit>): string {
  // Big counts in the chart strip's own short form (4.2M, 640K).
  const n =
    value >= 10_000 ? volume(value) : Number.isInteger(value) ? count(value) : String(value);
  if (unit.suffix === '$') return copy(`$${n}`);
  if (!unit.suffix) return n;
  return unit.tight ? `${n}${unit.suffix}` : `${n} ${unit.suffix}`;
}

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
  const unit = splitUnit(data.unit);
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
            {/* A currency leads its number ($25); anything else follows it (80 %, 4.2M). */}
            {valueText(bar.value, unit)}
          </Text>
        </View>
      ))}
      {unit.caption ? <Text style={styles.unit}>{copy(unit.caption)}</Text> : null}
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
  value: {
    ...type.small,
    color: colors.text,
    width: 56,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  unit: { ...type.small, fontSize: 11, color: colors.textFaint, textAlign: 'right' },
});
