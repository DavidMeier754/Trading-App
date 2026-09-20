import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { copy } from '../../format';
import { colors, radius, space, type } from '../../theme';

/** docs/UI.md §6.5 — pre-market / regular / after-hours with a "now" marker. */
export default function SessionRibbon({
  data,
}: {
  data: { premarket?: string; regular?: string; afterhours?: string; timezone?: string };
}) {
  const segments = [
    { key: 'premarket', label: 'Pre-market', value: data.premarket, flex: 3, tint: colors.surfaceAlt },
    { key: 'regular', label: 'Regular', value: data.regular, flex: 5, tint: colors.accent },
    { key: 'afterhours', label: 'After-hours', value: data.afterhours, flex: 3, tint: colors.surfaceAlt },
  ].filter((s) => s.value);

  return (
    <View style={styles.wrap}>
      <View style={styles.ribbon}>
        {segments.map((s) => (
          <View key={s.key} style={[styles.segment, { flex: s.flex, backgroundColor: s.tint }]}>
            <Text style={styles.segLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.times}>
        {segments.map((s) => (
          <Text key={s.key} style={[styles.time, { flex: s.flex }]}>
            {copy(String(s.value))}
          </Text>
        ))}
      </View>
      {data.timezone ? (
        <Text style={styles.tz}>{copy(data.timezone)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  ribbon: { flexDirection: 'row', gap: 2, borderRadius: radius.sm, overflow: 'hidden' },
  segment: { paddingVertical: space.md, alignItems: 'center' },
  segLabel: { ...type.small, fontSize: 11, color: colors.text },
  times: { flexDirection: 'row', gap: 2 },
  time: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  tz: { ...type.small, color: colors.textFaint, textAlign: 'center' },
});
