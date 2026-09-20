import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, TAP_TARGET, type } from '../../theme';

/**
 * The four small [v3] panels from docs/UI.md §6.8 that are read-only surfaces
 * rather than interactions: internals, hotkeys, stats and the R strip. They sit
 * together because each is a handful of rows and they share the same card.
 */

/** docs/UI.md §6.8 `internals-panel`. */
export function InternalsPanel({
  data,
}: {
  data: {
    index?: { label: string; data: number[] };
    breadth?: string | number;
    sectors?: { label: string; value: number }[];
    tone?: string;
  };
}) {
  const riskOn = (data.tone ?? '').toLowerCase().includes('on');
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{data.index?.label ?? 'Index'}</Text>
        {data.tone ? (
          <View
            style={[
              styles.tag,
              { borderColor: riskOn ? colors.up : colors.down },
            ]}
          >
            <Text style={[styles.tagText, { color: riskOn ? colors.up : colors.down }]}>
              {data.tone}
            </Text>
          </View>
        ) : null}
      </View>
      {data.breadth !== undefined ? (
        <Row label="Breadth" value={String(data.breadth)} />
      ) : null}
      {(data.sectors ?? []).map((s) => (
        <Row
          key={s.label}
          label={s.label}
          value={`${s.value > 0 ? '+' : ''}${s.value}%`}
          tint={s.value >= 0 ? colors.up : colors.down}
        />
      ))}
    </View>
  );
}

/** docs/UI.md §6.8 `hotkey-pad`. */
export function HotkeyPad({
  data,
  active,
}: {
  data: { keys: { label: string; action: string }[] };
  active?: string;
}) {
  return (
    <View style={styles.pad}>
      {data.keys.map((k) => (
        <View
          key={k.label}
          style={[styles.key, active === k.label && styles.keyActive]}
        >
          <Text style={styles.keyLabel}>{k.label}</Text>
          <Text style={styles.keyAction}>{k.action}</Text>
        </View>
      ))}
    </View>
  );
}

/** docs/UI.md §6.8 `stats-card`. */
export function StatsCard({
  data,
}: {
  data: { rows: { label: string; value: string | number }[] };
}) {
  return (
    <View style={styles.card}>
      {data.rows.map((r) => (
        <Row key={r.label} label={r.label} value={String(r.value)} />
      ))}
    </View>
  );
}

/** docs/UI.md §6.8 `r-tracker` — each trade as a bar against the day's limit. */
export function RTracker({
  data,
}: {
  data: { trades: number[]; limit: number };
}) {
  const scale = Math.max(...data.trades.map(Math.abs), data.limit, 1);
  const total = data.trades.reduce((a, b) => a + b, 0);
  return (
    <View style={styles.card}>
      <View style={styles.rRow}>
        {data.trades.map((r, i) => (
          <View key={i} style={styles.rSlot}>
            <View style={styles.rUp}>
              {r > 0 ? (
                <View
                  style={[
                    styles.rBar,
                    { height: `${(r / scale) * 100}%`, backgroundColor: colors.up },
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.rAxis} />
            <View style={styles.rDown}>
              {r < 0 ? (
                <View
                  style={[
                    styles.rBar,
                    {
                      height: `${(Math.abs(r) / scale) * 100}%`,
                      backgroundColor: colors.down,
                    },
                  ]}
                />
              ) : null}
            </View>
          </View>
        ))}
      </View>
      <Row
        label={`Day (limit ${data.limit}R)`}
        value={`${total > 0 ? '+' : ''}${total.toFixed(1)}R`}
        tint={total >= 0 ? colors.up : colors.down}
      />
    </View>
  );
}

/** docs/UI.md §6.8 `plan-sheet` — the learner's own saved plan. */
export function PlanSheet({
  data,
  values,
}: {
  data: { fields: { key: string; label: string; value?: string | number }[] };
  values?: Record<string, string>;
}) {
  return (
    <View style={styles.card}>
      {data.fields.map((f) => {
        // A field with a literal is a specimen; one without renders what the
        // learner wrote (docs/schema.md, "The plan").
        const shown = f.value !== undefined ? String(f.value) : values?.[f.key];
        return (
          <Row
            key={f.key}
            label={f.label}
            value={shown ?? 'not set yet'}
            tint={shown ? undefined : colors.textFaint}
          />
        );
      })}
    </View>
  );
}

function Row({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, tint ? { color: tint } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    gap: 2,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs,
  },
  cardTitle: { ...type.answer, color: colors.text },
  tag: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 2 },
  tagText: { ...type.small, fontSize: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.sm,
    gap: space.md,
  },
  rowLabel: { ...type.small, color: colors.textMuted, flexShrink: 1 },
  rowValue: { ...type.answer, color: colors.text },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  key: {
    minWidth: TAP_TARGET + 18,
    minHeight: TAP_TARGET,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyActive: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  keyLabel: { ...type.answer, color: colors.text },
  keyAction: { ...type.small, fontSize: 10, color: colors.textFaint },
  rRow: { flexDirection: 'row', gap: space.xs, height: 92, paddingVertical: space.sm },
  rSlot: { flex: 1 },
  rUp: { flex: 1, justifyContent: 'flex-end' },
  rDown: { flex: 1 },
  rAxis: { height: 1, backgroundColor: colors.border },
  rBar: { width: '100%', borderRadius: 2 },
});
