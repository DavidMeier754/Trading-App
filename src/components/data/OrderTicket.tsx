import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { price } from '../../format';
import { colors, radius, space, TAP_TARGET, type } from '../../theme';
import { spotlight } from '../spotlight';

function capital(value: unknown): string {
  const text = value === undefined || value === null ? '—' : String(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** docs/UI.md §6.7 — the order ticket mock. */
export default function OrderTicket({
  data,
  onTapTarget,
  highlight,
  focus,
}: {
  data: {
    ticker?: string;
    side?: string;
    qty?: number | string;
    type?: string;
    price?: number | string;
    stop_price?: number | string;
  };
  onTapTarget?: (id: string) => void;
  highlight?: Record<string, string>;
  focus?: string;
}) {
  const field = (id: string, label: string, value: React.ReactNode) => (
    <Pressable
      accessibilityRole="button"
      key={id}
      testID={`target-${id}`}
      disabled={!onTapTarget}
      onPress={() => onTapTarget?.(id)}
      style={[
        styles.field,
        highlight?.[id] ? { borderColor: highlight[id] } : null,
        spotlight(id, focus, highlight),
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? '—'}</Text>
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.ticker}>{data.ticker ?? 'XYZ'}</Text>
      <View style={styles.grid}>
        {/* One case for every value on the ticket: "Buy" and "Limit", not
            "BUY" next to "limit". */}
        {field('side', 'Side', capital(data.side))}
        {field('type', 'Order type', capital(data.type))}
        {field('qty', 'Quantity', String(data.qty ?? '—'))}
        {field(
          'price',
          'Limit price',
          typeof data.price === 'number' ? price(data.price) : (data.price ?? '—')
        )}
        {data.stop_price !== undefined
          ? field(
              'stop_price',
              'Stop price',
              typeof data.stop_price === 'number'
                ? price(data.stop_price)
                : data.stop_price
            )
          : null}
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={!onTapTarget}
        onPress={() => onTapTarget?.('submit')}
        style={[
          styles.submit,
          highlight?.submit ? { borderColor: highlight.submit } : null,
          spotlight('submit', focus, highlight),
        ]}
      >
        <Text style={styles.submitText}>Submit order</Text>
      </Pressable>
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
    gap: space.md,
  },
  ticker: { ...type.prompt, color: colors.text, letterSpacing: 0.5 },
  grid: { gap: space.sm },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  label: { ...type.small, color: colors.textMuted },
  value: { ...type.answer, color: colors.text },
  // Part of the mock, not the screen's call to action: drawn as quietly as the
  // fields, so it stops pulling the eye away from them. It is still a target
  // (docs/schema.md lists `submit`) and lights like any field when picked.
  submit: {
    minHeight: TAP_TARGET - 4,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    // A mock ticket's send button: drawn like one, in the muted accent, but
    // not a dashed box that reads as a slot waiting for something.
    borderColor: 'rgba(79,140,255,0.35)',
    backgroundColor: 'rgba(79,140,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { ...type.small, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.4 },
});
