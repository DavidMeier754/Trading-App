import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { copy } from '../../format';
import { Arrive } from '../../lesson/Celebrate';
import { useLookSpec } from '../../lesson/look';
import { colors, radius, space, type } from '../../theme';
import { GROW_DELAY } from './GrowBar';

/** docs/UI.md §6.5 — pre-market / regular / after-hours with a "now" marker. */
export default function SessionRibbon({
  data,
}: {
  data: { premarket?: string; regular?: string; afterhours?: string; timezone?: string };
}) {
  const accent = useLookSpec().accent;
  const segments = [
    { key: 'premarket', label: 'Pre-market', value: data.premarket, flex: 3, tint: colors.surfaceAlt },
    { key: 'regular', label: 'Regular', value: data.regular, flex: 5, tint: accent },
    { key: 'afterhours', label: 'After-hours', value: data.afterhours, flex: 3, tint: colors.surfaceAlt },
  ].filter((s) => s.value);

  return (
    <View style={styles.wrap}>
      <View style={styles.ribbon}>
        {/* The day laid down left to right, one session after another. */}
        {segments.map((s, i) => (
          <Arrive
            key={s.key}
            from="right"
            delay={GROW_DELAY + i * 110}
            style={[styles.segment, { flex: s.flex, backgroundColor: s.tint }]}
          >
            <Text style={[styles.segLabel, s.tint === accent && { color: readableOn(accent) }]}>
              {s.label}
            </Text>
          </Arrive>
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

/** Dark lettering on a light accent (Neo Mono's white), light on the rest. */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 170 ? colors.background : colors.text;
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
