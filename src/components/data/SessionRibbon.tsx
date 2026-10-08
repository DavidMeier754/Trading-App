import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { copy } from '../../format';
import { Arrive } from '../../lesson/Celebrate';
import { inkOn, useLookSpec } from '../../lesson/look';
import { colors, radius, space, type, themed } from '../../theme';
import { GROW_DELAY } from './GrowBar';
import { localClock, marketMinutes, nowOnRibbon, spanOf } from './sessionClock';

/** Below this width a segment's name goes to the key under the ribbon only. */
const LABEL_ROOM = 84;
const TAG_W = 220;

/**
 * docs/ui/09-order-tools-and-other-visuals.md §6.5 — pre-market / regular / after-hours with a
 * "now" marker. [LOOK-COMPONENTS] Drawn to scale in hours: each session is as
 * wide as it is long (Germany's one-hour pre-market is a sliver beside its
 * eight-and-a-half-hour day), with the times in a key underneath, so no name
 * has to squeeze into a sliver. "Now" is where the market's clock stands at
 * the moment the screen opens, labelled with the learner's own clock; outside
 * the sessions it waits at the nearer end and says the market is closed. It
 * does not tick: nothing on a screen moves by itself (docs/ui/02-lesson-player-layout.md §2).
 */
export default function SessionRibbon({
  data,
  now: nowProp,
}: {
  data: { premarket?: string; regular?: string; afterhours?: string; timezone?: string };
  /** The moment shown as "now"; the clock when the screen opened, by default. */
  now?: Date;
}) {
  const accent = useLookSpec().accent;
  const [now] = useState(() => nowProp ?? new Date());
  const [width, setWidth] = useState(0);
  const segments = [
    { key: 'premarket', label: 'Pre-market', value: data.premarket, tint: colors.surfaceAlt },
    { key: 'regular', label: 'Regular', value: data.regular, tint: accent },
    { key: 'afterhours', label: 'After-hours', value: data.afterhours, tint: colors.surfaceAlt },
  ]
    .filter((s) => s.value)
    .map((s) => ({ ...s, value: copy(String(s.value)) }))
    .map((s) => ({ ...s, span: spanOf(s.value) }));
  const zone = data.timezone ? copy(data.timezone) : undefined;

  // To scale when every session has its hours; otherwise as the ribbon was.
  const scaled = segments.length > 0 && segments.every((s) => s.span);
  const start = scaled ? Math.min(...segments.map((s) => s.span!.from)) : 0;
  const end = scaled ? Math.max(...segments.map((s) => s.span!.to)) : 1;
  const minutes = scaled ? marketMinutes(now, zone) : null;
  const mark = minutes === null ? null : nowOnRibbon(minutes, start, end);
  const sameClock = minutes !== null && minutes === now.getHours() * 60 + now.getMinutes();
  const tagText = mark
    ? `Now ${localClock(now)}${sameClock ? '' : ' your time'}${mark.closed ? ' · closed' : ''}`
    : '';
  const x = mark ? mark.at * width : 0;
  const tagLeft = Math.max(0, Math.min(width - TAG_W, x - TAG_W / 2));

  return (
    <View style={styles.wrap}>
      {mark ? (
        <View style={styles.tagRow}>
          {width > 0 ? (
            <Arrive
              delay={GROW_DELAY + segments.length * 110}
              style={[styles.tag, { left: tagLeft }]}
            >
              <Text style={[styles.tagText, { color: colors.text }]} numberOfLines={1}>
                {tagText}
              </Text>
            </Arrive>
          ) : null}
        </View>
      ) : null}
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.ribbon}>
          {/* The day laid down left to right, one session after another. */}
          {segments.map((s, i) => {
            const flex = scaled ? s.span!.to - s.span!.from : s.key === 'regular' ? 5 : 3;
            const room = scaled && width > 0 ? (flex / (end - start)) * width : LABEL_ROOM;
            return (
              <Arrive
                key={s.key}
                from="right"
                delay={GROW_DELAY + i * 110}
                style={[styles.segment, { flex, backgroundColor: s.tint }]}
              >
                <Text
                  style={[styles.segLabel, s.tint === accent && { color: inkOn(accent) }]}
                  numberOfLines={1}
                >
                  {room >= LABEL_ROOM ? s.label : ' '}
                </Text>
              </Arrive>
            );
          })}
        </View>
        {mark && width > 0 ? (
          <View
            pointerEvents="none"
            style={[styles.nowLine, { left: Math.max(0, Math.min(width - 3, x - 1.5)) }]}
          />
        ) : null}
      </View>
      <View style={styles.key}>
        {segments.map((s) => (
          <View key={s.key} style={styles.keyRow}>
            <View style={[styles.swatch, { backgroundColor: s.tint }]} />
            <Text style={styles.keyName}>{s.label}</Text>
            <Text style={styles.keyTime}>{s.value}</Text>
          </View>
        ))}
      </View>
      {zone ? <Text style={styles.tz}>{`Times in ${zone}`}</Text> : null}
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.sm, alignSelf: 'stretch' },
  tagRow: { height: 24 },
  tag: { position: 'absolute', top: 0, width: TAG_W, alignItems: 'center' },
  tagText: { ...type.small, fontWeight: '700' },
  ribbon: { flexDirection: 'row', gap: 2, borderRadius: radius.sm, overflow: 'hidden' },
  segment: { paddingVertical: space.md, alignItems: 'center' },
  segLabel: { ...type.small, color: colors.text },
  nowLine: {
    position: 'absolute',
    top: -6,
    bottom: -6,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.text,
  },
  key: { gap: 4, marginTop: space.xs },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  keyName: { ...type.small, color: colors.text, width: 92 },
  keyTime: { ...type.small, color: colors.textMuted, flex: 1 },
  tz: { ...type.small, color: colors.textFaint },
}));
