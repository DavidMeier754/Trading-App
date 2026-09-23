import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { PopIn } from '../../lesson/Celebrate';
import { surfaceStyle, useLookSpec } from '../../lesson/look';
import { EASE_OUT } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, radius, space, type } from '../../theme';
import { GROW_DELAY } from './GrowBar';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  // Laid out like the keys they are: raised caps, two to a row, the key's name
  // large and what it does under it in the colour of the action -- green buys,
  // red sells -- so the pad reads as a keyboard, not a list of labels.
  const look = useLookSpec();
  return (
    <View style={styles.pad}>
      {data.keys.map((k, i) => {
        const tone = keyTone(k.action, look.accent);
        return (
          <PopIn key={k.label} delay={GROW_DELAY + i * 70} style={styles.keySlot}>
            <View
              style={[
                styles.key,
                { borderBottomColor: tone.edge, borderRadius: Math.max(6, look.surface.radius) },
                active === k.label && { borderColor: look.accent },
              ]}
            >
              <Text style={styles.keyLabel}>{k.label}</Text>
              <View style={styles.keyActionRow}>
                <Text style={[styles.keyGlyph, { color: tone.color }]}>{tone.glyph}</Text>
                <Text style={[styles.keyAction, { color: tone.color }]}>{capitalise(k.action)}</Text>
              </View>
            </View>
          </PopIn>
        );
      })}
    </View>
  );
}

function keyTone(action: string, accent: string): { color: string; edge: string; glyph: string } {
  const a = action.toLowerCase();
  if (a.includes('buy') || a.includes('long')) return { color: colors.up, edge: '#1B7A53', glyph: '▲' };
  if (a.includes('sell') || a.includes('short')) return { color: colors.down, edge: '#8E2F2C', glyph: '▼' };
  if (a.includes('flat') || a.includes('cancel')) return { color: colors.warning, edge: '#8A6A1E', glyph: '✕' };
  return { color: accent, edge: '#2E4A7A', glyph: '⇅' };
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

/**
 * docs/UI.md §6.8 `r-tracker` — the session in R, against the day's limit.
 *
 * The total leads, because it is the number that decides whether the day goes
 * on. Under it, each trade is a bar up or down from zero, labelled with its R,
 * and a line runs through them with the day's running total -- so the shape of
 * the day is there, not only its sum. The limit is drawn where it bites, and
 * the room left to it is said in words underneath.
 */
export function RTracker({
  data,
}: {
  data: { trades: number[]; limit: number };
}) {
  const look = useLookSpec();
  const reduced = useReduceMotion();
  const [w, setW] = useState(0);
  const trades = data.trades;
  const total = trades.reduce((a, b) => a + b, 0);
  const running = trades.reduce<number[]>((out, r) => [...out, (out[out.length - 1] ?? 0) + r], []);
  const hi = Math.max(0.5, ...trades, ...running);
  const lo = Math.min(-data.limit, ...trades, ...running);
  const H = 132;
  const padT = 16;
  const padB = 14;
  const labelW = 34;
  const plotW = Math.max(1, w - labelW);
  const y = (r: number) => padT + ((hi - r) / (hi - lo)) * (H - padT - padB);
  const slot = plotW / Math.max(1, trades.length);
  const barW = Math.min(28, slot * 0.56);
  const cx = (i: number) => slot * (i + 0.5);
  const zero = y(0);
  const limitY = y(-data.limit);
  const room = total + data.limit;

  const line = running.map((r, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${y(r).toFixed(1)}`).join(' ');
  const lineLen = running.reduce(
    (len, r, i) => (i === 0 ? 0 : len + Math.hypot(slot, y(r) - y(running[i - 1]))),
    0
  );
  const draw = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced && w > 0) {
      draw.set(withDelay(GROW_DELAY + trades.length * 90 + 200, withTiming(1, { duration: 700, easing: EASE_OUT })));
    }
    // once the width is known
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w > 0]);
  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: lineLen * (1 - draw.get()) }));

  return (
    <View style={[styles.card, surfaceStyle(look), styles.rCard]}>
      <View style={styles.rHead}>
        <View>
          <Text style={styles.rKicker}>Day so far</Text>
          <Text style={[styles.rTotal, { color: total >= 0 ? colors.up : colors.down }]}>
            {`${total > 0 ? '+' : ''}${total.toFixed(1)}R`}
          </Text>
        </View>
        <View style={[styles.tag, { borderColor: colors.down }]}>
          <Text style={[styles.tagText, { color: colors.down }]}>{`limit −${data.limit}R`}</Text>
        </View>
      </View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
        {w > 0 ? (
          <Svg width={w} height={H}>
            <Line x1={0} x2={plotW} y1={zero} y2={zero} stroke={colors.borderStrong} strokeWidth={1} />
            <SvgText x={plotW + 6} y={zero + 4} fill={colors.textFaint} fontSize={10}>0R</SvgText>
            <Line
              x1={0}
              x2={plotW}
              y1={limitY}
              y2={limitY}
              stroke={colors.down}
              strokeWidth={1.25}
              strokeDasharray="4 3"
              opacity={0.8}
            />
            <SvgText x={plotW + 6} y={limitY + 4} fill={colors.down} fontSize={10}>
              {`−${data.limit}R`}
            </SvgText>
            {trades.map((r, i) => (
              <RBar
                key={i}
                x={cx(i) - barW / 2}
                width={barW}
                zero={zero}
                to={y(r)}
                color={r >= 0 ? colors.up : colors.down}
                delay={GROW_DELAY + i * 90}
                label={`${r > 0 ? '+' : ''}${r.toFixed(1)}`}
                cx={cx(i)}
              />
            ))}
            <AnimatedPath
              d={line}
              stroke={colors.text}
              strokeWidth={1.75}
              fill="none"
              strokeLinejoin="round"
              strokeDasharray={`${lineLen} ${lineLen}`}
              animatedProps={lineProps}
              opacity={0.85}
            />
            <Circle cx={cx(trades.length - 1)} cy={y(total)} r={3.5} fill={colors.text} />
          </Svg>
        ) : null}
      </View>
      <Text style={styles.rFoot}>
        {`${trades.length} trades · the line is the running total · ${room.toFixed(1)}R left before the limit`}
      </Text>
    </View>
  );
}

/** One trade's bar, growing out of the zero line, its R written at its end. */
function RBar({
  x,
  width,
  zero,
  to,
  color,
  delay,
  label,
  cx,
}: {
  x: number;
  width: number;
  zero: number;
  to: number;
  color: string;
  delay: number;
  label: string;
  cx: number;
}) {
  const reduced = useReduceMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withDelay(delay, withTiming(1, { duration: 420, easing: EASE_OUT })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const up = to < zero;
  const props = useAnimatedProps(() => {
    const end = zero + (to - zero) * t.get();
    return { y: Math.min(zero, end), height: Math.max(0.5, Math.abs(end - zero)) };
  });
  return (
    <G>
      <AnimatedRect
        x={x}
        y={reduced ? Math.min(zero, to) : zero}
        width={width}
        height={reduced ? Math.abs(to - zero) : 0.5}
        rx={2}
        fill={color}
        opacity={0.85}
        animatedProps={props}
      />
      <SvgText
        x={cx}
        y={up ? to - 4 : to + 11}
        fill={color}
        fontSize={10}
        fontWeight="700"
        textAnchor="middle"
      >
        {label}
      </SvgText>
    </G>
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
  keySlot: { width: '48%', flexGrow: 1 },
  key: {
    minHeight: 72,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  keyLabel: { ...type.title, fontFamily: 'monospace', color: colors.text },
  keyActionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyGlyph: { fontSize: 11, lineHeight: 14, fontWeight: '800' },
  keyAction: { ...type.label },
  rCard: { paddingVertical: space.md, gap: space.sm },
  rHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  rKicker: { ...type.small, color: colors.textMuted },
  rTotal: { ...type.display },
  rFoot: { ...type.small, color: colors.textMuted },
});
