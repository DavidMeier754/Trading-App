import React from 'react';
import { Text, View } from 'react-native';

import { copy } from '../../format';
import { Arrive } from '../../lesson/Celebrate';
import { inkOn, useLookSpec } from '../../lesson/look';
import { colors, radius, space, type, themed } from '../../theme';
import { GROW_DELAY } from './GrowBar';

/** docs/ui/09-order-tools-and-other-visuals.md §6.5 — pre-market / regular / after-hours with a "now" marker. */
export default function SessionRibbon({
  data,
}: {
  data: { premarket?: string; regular?: string; afterhours?: string; timezone?: string };
}) {
  const accent = useLookSpec().accent;
  const segments = [
    {
      key: 'premarket',
      label: 'Pre-market',
      value: data.premarket,
      flex: 3,
      tint: colors.surfaceAlt,
    },
    { key: 'regular', label: 'Regular', value: data.regular, flex: 5, tint: accent },
    {
      key: 'afterhours',
      label: 'After-hours',
      value: data.afterhours,
      flex: 3,
      tint: colors.surfaceAlt,
    },
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
            <Text style={[styles.segLabel, s.tint === accent && { color: inkOn(accent) }]}>
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
      {data.timezone ? <Text style={styles.tz}>{copy(data.timezone)}</Text> : null}
    </View>
  );
}

/** Dark lettering on a light accent (Neo Mono's white), light on the rest. */
const styles = themed(() => ({
  wrap: { gap: space.sm },
  ribbon: { flexDirection: 'row', gap: 2, borderRadius: radius.sm, overflow: 'hidden' },
  segment: { paddingVertical: space.md, alignItems: 'center' },
  segLabel: { ...type.small, color: colors.text },
  times: { flexDirection: 'row', gap: 2 },
  time: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  tz: { ...type.small, color: colors.textFaint, textAlign: 'center' },
}));
