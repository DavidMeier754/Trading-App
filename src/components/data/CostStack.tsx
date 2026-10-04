import React from 'react';
import { Text, View } from 'react-native';

import { copy, count, price } from '../../format';
import { useChartMove } from '../../lesson/haptics';
import { surfaceStyle, useLookSpec } from '../../lesson/look';
import { EASE_OUT_SETTLE } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, radius, space, type, themed } from '../../theme';
import GrowBar, { GROW_DELAY } from './GrowBar';

/** The target lands first, then the costs eat into it one at a time. */
const TARGET_MS = 420;
const PART_MS = 300;

type PerShare = {
  shares: number;
  spread?: number;
  slippage?: number;
  fees?: number;
  target: number;
};
/** One cost against several moves: "the same five cents" next to each target. */
type AgainstTargets = {
  spread?: number;
  slippage?: number;
  fees?: number;
  targets: { label: string; value: number }[];
};
/** Two or more cost totals side by side, e.g. two fee structures. */
type Totals = { rows: { label: string; value: number }[]; unit?: string };

export type CostStackData = PerShare | AgainstTargets | Totals;

/**
 * docs/ui/09-order-tools-and-other-visuals.md §6.5 — what costs take out of a trade. docs/level-files/ allows three
 * shapes: the per-share stack against one target, one cost against several
 * `targets`, or cost totals as `rows`.
 */
export default function CostStack({ data }: { data: CostStackData }) {
  if ('rows' in data && Array.isArray(data.rows)) return <CostTotals data={data} />;
  if ('targets' in data && Array.isArray(data.targets)) return <CostAgainstTargets data={data} />;
  return <PerShareStack data={data as PerShare} />;
}

function costParts(data: { spread?: number; slippage?: number; fees?: number }) {
  return [
    { key: 'Spread', value: data.spread ?? 0, color: colors.down },
    { key: 'Slippage', value: data.slippage ?? 0, color: colors.warning },
    { key: 'Fees', value: data.fees ?? 0, color: colors.textMuted },
  ].filter((p) => p.value > 0);
}

/** Spread + slippage + fees against the target, per share. */
function PerShareStack({ data }: { data: PerShare }) {
  const parts = costParts(data);

  const look = useLookSpec();
  const cost = parts.reduce((a, p) => a + p.value, 0);
  const pct = data.target > 0 ? (cost / data.target) * 100 : 0;
  const scale = Math.max(data.target, cost);
  const width = (v: number) => (v / scale) * 100;

  // Like every chart, it vibrates while it moves and lands when it settles
  // (lesson/haptics.ts, startChartMove): the target, then each cost in turn.
  const reduced = useReduceMotion();
  const settled = parts.length
    ? TARGET_MS + (parts.length - 1) * PART_MS + PART_MS * EASE_OUT_SETTLE
    : TARGET_MS * EASE_OUT_SETTLE;
  useChartMove(GROW_DELAY + settled, !reduced);

  // What it means first, then the picture of it, then the detail: the share of
  // the target the costs take, big; the target and the costs as two bars on one
  // scale, so the cost bar is visibly a slice of the target; the parts named
  // under the bar they make up; the per-share sum and the share count last.
  return (
    <View style={[styles.wrap, styles.card, surfaceStyle(look)]}>
      <View style={styles.head}>
        <Text style={[styles.pct, { color: pct >= 50 ? colors.down : colors.warning }]}>
          {`${pct.toFixed(0)}%`}
        </Text>
        <Text style={styles.headText}>{`of a ${price(data.target)} target goes to costs`}</Text>
      </View>

      <View style={styles.bars}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Target</Text>
          <View style={styles.track}>
            <GrowBar
              to={width(data.target)}
              duration={TARGET_MS}
              style={{ backgroundColor: colors.up }}
            />
          </View>
          <Text style={styles.barValue}>{price(data.target)}</Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Costs</Text>
          <View style={styles.track}>
            {parts.map((p, i) => (
              <GrowBar
                key={p.key}
                to={width(p.value)}
                offset={parts.slice(0, i).reduce((a, q) => a + width(q.value), 0)}
                delay={TARGET_MS + i * PART_MS}
                duration={PART_MS}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </View>
          <Text style={styles.barValue}>{price(cost)}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {parts.map((p) => (
          <View key={p.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: p.color }]} />
            <Text style={styles.legendText}>{`${p.key} ${price(p.value)}`}</Text>
          </View>
        ))}
      </View>

      {/* docs/ui/14-glossary-and-copy.md §9: cost math always shows a share count. */}
      <Text style={styles.summary}>
        {`${price(cost)} a share, on every one of ${count(data.shares)} shares.`}
      </Text>
    </View>
  );
}

/**
 * The same cost held against each target in turn: every row is one target at
 * full width with the cost as its slice, so "three quarters of one, a sixth of
 * the other" is the picture itself.
 */
function CostAgainstTargets({ data }: { data: AgainstTargets }) {
  const look = useLookSpec();
  const cost = costParts(data).reduce((a, p) => a + p.value, 0);
  const rows = data.targets;
  const reduced = useReduceMotion();
  useChartMove(
    GROW_DELAY + TARGET_MS + Math.max(rows.length - 1, 0) * PART_MS + PART_MS * EASE_OUT_SETTLE,
    !reduced && rows.length > 0,
  );
  return (
    <View style={[styles.wrap, styles.card, surfaceStyle(look)]}>
      <Text style={styles.headText}>{`The same ${price(cost)} against each move`}</Text>
      {rows.map((t, i) => {
        const pct = t.value > 0 ? (cost / t.value) * 100 : 0;
        return (
          <View key={`${t.label}-${i}`} style={styles.targetRow}>
            <View style={styles.targetHead}>
              <Text style={styles.targetLabel}>{copy(t.label)}</Text>
              <Text style={[styles.targetPct, { color: pct >= 50 ? colors.down : colors.warning }]}>
                {pct < 1 && pct > 0 ? '<1%' : `${pct.toFixed(0)}%`}
              </Text>
            </View>
            <View style={[styles.track, styles.trackAlone]}>
              <GrowBar
                to={100}
                delay={i * PART_MS}
                duration={TARGET_MS}
                style={{ backgroundColor: colors.up }}
              />
              <GrowBar
                to={Math.min(pct, 100)}
                delay={TARGET_MS + i * PART_MS}
                duration={PART_MS}
                style={{ backgroundColor: colors.down }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** "$ per day" puts "$" on every value and "per day" under the bars. */
function moneyUnit(unit: string | undefined): { money: boolean; caption: string } {
  if (!unit) return { money: false, caption: '' };
  const [first, ...rest] = unit.split(' ');
  if (first === '$') return { money: true, caption: rest.join(' ') };
  return { money: false, caption: unit };
}

/** Cost totals side by side on one scale, e.g. a per-order fee against a per-share one. */
function CostTotals({ data }: { data: Totals }) {
  const look = useLookSpec();
  const unit = moneyUnit(data.unit);
  const max = Math.max(...data.rows.map((r) => r.value), 0);
  const reduced = useReduceMotion();
  useChartMove(
    GROW_DELAY + Math.max(data.rows.length - 1, 0) * PART_MS + TARGET_MS * EASE_OUT_SETTLE,
    !reduced && data.rows.length > 0,
  );
  const valueText = (v: number) => {
    const n = Number.isInteger(v) ? count(v) : v.toFixed(2);
    return unit.money ? copy(`$${n}`) : n;
  };
  return (
    <View style={[styles.wrap, styles.card, surfaceStyle(look)]}>
      {data.rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={styles.targetRow}>
          <View style={styles.targetHead}>
            <Text style={styles.targetLabel}>{copy(r.label)}</Text>
            <Text style={styles.totalValue}>{valueText(r.value)}</Text>
          </View>
          <View style={[styles.track, styles.trackAlone]}>
            <GrowBar
              to={max > 0 ? (r.value / max) * 100 : 0}
              delay={i * PART_MS}
              duration={TARGET_MS}
              style={{ backgroundColor: colors.down }}
            />
          </View>
        </View>
      ))}
      {unit.caption ? <Text style={styles.summary}>{unit.caption}</Text> : null}
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.md },
  card: { padding: space.md },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, flexWrap: 'wrap' },
  pct: { ...type.display },
  headText: { ...type.body, color: colors.textMuted, flexShrink: 1 },
  bars: { gap: space.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  barLabel: { ...type.small, color: colors.textMuted, width: 48 },
  barValue: { ...type.small, color: colors.text, width: 44, textAlign: 'right' },
  track: {
    flex: 1,
    height: 22,
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginLeft: 48 + space.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...type.small, color: colors.textMuted },
  summary: { ...type.small, color: colors.textFaint },
  targetRow: { gap: space.xs },
  // A bar under its label, not beside it: full width, its own height.
  trackAlone: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  targetHead: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  targetLabel: { ...type.small, color: colors.textMuted, flexShrink: 1 },
  targetPct: { ...type.small, fontWeight: '700' },
  totalValue: { ...type.small, color: colors.text },
}));
