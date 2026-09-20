import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import Chart from '../components/Chart';
import OrderBook from '../components/data/OrderBook';
import ScannerTable from '../components/data/ScannerTable';
import Visual from '../components/Visual';
import { price } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { selectHaptic } from '../lesson/haptics';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type {
  ChartSpec,
  ChartTapScreen as ChartTap,
  DepthLadderScreen as DepthLadder,
  HotspotScreen as Hotspot,
  ScannerPickScreen as ScannerPick,
  SliderScreen as SliderS,
} from '../types';
import { Prompt } from './common';

/** Green for the right target, red for a wrong pick: the same key everywhere. */
function resolveHighlight(
  revealed: boolean,
  picked: string | null,
  correct: string[]
): Record<string, string> | undefined {
  if (!revealed) return picked ? { [picked]: colors.accent } : undefined;
  const out: Record<string, string> = {};
  correct.forEach((id) => (out[id] = colors.success));
  if (picked && !correct.includes(picked)) out[picked] = colors.down;
  return out;
}

/** docs/UI.md §4.1 `hotspot` — tap the right region of a mock component. */
export function HotspotScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: Hotspot;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const picked = value.kind === 'target' ? value.id : null;
  const targets = screen.targets ?? (screen.target ? [screen.target] : []);

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <Visual
        component={screen.component}
        data={screen.data}
        width={width}
        onTapTarget={
          revealed
            ? undefined
            : (id) => {
                selectHaptic();
                onChange({ kind: 'target', id });
              }
        }
        highlight={resolveHighlight(revealed, picked, targets)}
      />
    </View>
  );
}

/** docs/UI.md §4.2 `scanner-pick` — tap the row that meets the criteria. */
export function ScannerPickScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: ScannerPick;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const picked = value.kind === 'target' ? value.id : null;
  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <ScannerTable
        rows={screen.rows}
        selected={picked}
        onTapRow={
          revealed
            ? undefined
            : (ticker) => {
                selectHaptic();
                onChange({ kind: 'target', id: ticker });
              }
        }
        resolved={resolveHighlight(revealed, picked, [screen.target])}
      />
    </View>
  );
}

/** docs/UI.md §4.2 `depth-ladder` — answer where an order fills. */
export function DepthLadderScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: DepthLadder;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const picked = value.kind === 'target' ? value.id : null;
  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <OrderBook
        bids={screen.bids}
        asks={screen.asks}
        selected={picked}
        onTapRow={
          revealed
            ? undefined
            : (id) => {
                selectHaptic();
                onChange({ kind: 'target', id });
              }
        }
        resolved={resolveHighlight(revealed, picked, [screen.target])}
      />
    </View>
  );
}

/** docs/UI.md §4.1 `chart-tap` — tap a candle on a chart. */
export function ChartTapScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: ChartTap;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const picked = value.kind === 'index' ? value.index : null;
  const bars = screen.chart.data.length;
  const height = 220;
  const spec: ChartSpec = {
    kind: screen.chart.kind,
    data: screen.chart.data as any,
    decision_index: -1,
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <View style={{ width, height }}>
        <Chart spec={spec} visibleCount={bars} width={width} height={height} showDecisionMarker={false} />
        {/* An invisible column per bar: a candle is far too small a tap target
            on its own (docs/UI.md §10, 48 pt minimum). */}
        <View style={styles.tapRow}>
          {Array.from({ length: bars }, (_, i) => {
            const tint =
              revealed && i === screen.target
                ? colors.successTint
                : revealed && i === picked
                  ? colors.downTint
                  : picked === i
                    ? colors.accentTint
                    : 'transparent';
            const border =
              revealed && i === screen.target
                ? colors.success
                : revealed && i === picked
                  ? colors.down
                  : picked === i
                    ? colors.accent
                    : 'transparent';
            return (
              <Pressable
                key={i}
                disabled={revealed}
                onPress={() => {
                  selectHaptic();
                  onChange({ kind: 'index', index: i });
                }}
                style={[styles.tapCol, { backgroundColor: tint, borderColor: border }]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** docs/UI.md §4.1 `slider` — set a value with a tolerance band. */
export function SliderScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: SliderS;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const step = screen.step ?? 1;
  const current = value.kind === 'slider' ? value.value : null;
  const shown = current ?? (screen.min + screen.max) / 2;
  const pct = (v: number) => ((v - screen.min) / (screen.max - screen.min)) * 100;

  const nudge = (delta: number) => {
    const next = Math.min(
      screen.max,
      Math.max(screen.min, (current ?? (screen.min + screen.max) / 2) + delta)
    );
    selectHaptic();
    onChange({ kind: 'slider', value: Number(next.toFixed(4)) });
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <Text style={styles.sliderValue}>
        {`${shown}${screen.unit ? ` ${screen.unit}` : ''}`}
      </Text>

      <View style={styles.track}>
        {revealed ? (
          <View
            style={[
              styles.band,
              {
                left: `${pct(screen.answer - (screen.tolerance ?? 0))}%`,
                width: `${(((screen.tolerance ?? 0) * 2) / (screen.max - screen.min)) * 100}%`,
              },
            ]}
          />
        ) : null}
        <View style={[styles.fill, { width: `${pct(shown)}%` }]} />
        <View
          style={[
            styles.knob,
            { left: `${pct(shown)}%` },
            revealed && {
              borderColor:
                Math.abs(shown - screen.answer) <= (screen.tolerance ?? 0)
                  ? colors.success
                  : colors.down,
            },
          ]}
        />
      </View>

      {/* docs/UI.md §10: every drag has a tap alternative. */}
      <View style={styles.nudgeRow}>
        <Pressable disabled={revealed} onPress={() => nudge(-step)} style={styles.nudge}>
          <Text style={styles.nudgeText}>{'−'}</Text>
        </Pressable>
        <Pressable disabled={revealed} onPress={() => nudge(step)} style={styles.nudge}>
          <Text style={styles.nudgeText}>+</Text>
        </Pressable>
      </View>

      {revealed ? (
        <Text style={styles.sliderAnswer}>
          {`Intended: ${screen.answer}${screen.unit ? ` ${screen.unit}` : ''} (±${screen.tolerance ?? 0})`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.lg },
  tapRow: { position: 'absolute', top: 0, bottom: 0, left: 6, right: 44, flexDirection: 'row' },
  tapCol: { flex: 1, borderRadius: radius.sm, borderWidth: 1.5, marginHorizontal: 1 },
  sliderValue: { ...type.display, color: colors.text, textAlign: 'center' },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
  },
  band: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    backgroundColor: colors.successTint,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 5 },
  knob: {
    position: 'absolute',
    width: 26,
    height: 26,
    marginLeft: -13,
    borderRadius: 13,
    backgroundColor: colors.text,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  nudgeRow: { flexDirection: 'row', gap: space.md },
  nudge: {
    flex: 1,
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeText: { ...type.title, color: colors.text },
  sliderAnswer: { ...type.small, color: colors.textMuted, textAlign: 'center' },
});
