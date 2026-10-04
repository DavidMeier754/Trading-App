import React from 'react';
import { Pressable, Text, View } from 'react-native';

import Chart, {
  chartHeightFor,
  chartLayout,
  chartWidthFor,
  DEFAULT_GAPS,
  domainOf,
  toCandles,
} from '../components/Chart';
import { useGridAnchor } from '../components/gridAlign';
import { copy } from '../format';
import OrderBook from '../components/data/OrderBook';
import ScannerTable from '../components/data/ScannerTable';
import { bookWalk } from '../lesson/bookWalk';
import Visual from '../components/Visual';
import type { AnswerValue } from '../lesson/answers';
import { tapFeedback } from '../lesson/feedback';
import { REVEAL_GROWTH, useChartGaps } from '../lesson/fit';
import { colors, radius, space, type, themed } from '../theme';
import type {
  ChartSpec,
  ChartTapScreen as ChartTap,
  DepthLadderScreen as DepthLadder,
  HotspotScreen as Hotspot,
  ScannerPickScreen as ScannerPick,
  SliderScreen as SliderS,
} from '../types';
import { scannerRowsOf, scannerTargetsOf } from '../types';
import Dial from './Dial';
import { Prompt } from './common';

/** Green for the right target, red for a wrong pick: the same key everywhere. */
function resolveHighlight(
  revealed: boolean,
  picked: string | null,
  correct: string[],
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
      <View>
        <Visual
          component={screen.component}
          data={screen.data}
          width={width}
          onTapTarget={
            revealed
              ? undefined
              : (id) => {
                  tapFeedback();
                  onChange({ kind: 'target', id: picked === id ? null : id });
                }
          }
          highlight={resolveHighlight(revealed, picked, targets)}
        />
      </View>
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
      <View>
        <ScannerTable
          asAnswers
          rows={scannerRowsOf(screen)}
          selected={picked}
          onTapRow={
            revealed
              ? undefined
              : (ticker) => {
                  tapFeedback();
                  onChange({ kind: 'target', id: picked === ticker ? null : ticker });
                }
          }
          resolved={resolveHighlight(revealed, picked, scannerTargetsOf(screen))}
        />
      </View>
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
      <View>
        <OrderBook
          bids={screen.data.bids}
          asks={screen.data.asks}
          selected={picked}
          onTapRow={
            revealed
              ? undefined
              : (id) => {
                  tapFeedback();
                  onChange({ kind: 'target', id: picked === id ? null : id });
                }
          }
          resolved={resolveHighlight(revealed, picked, [screen.target])}
          walk={revealed ? bookWalk(screen) : null}
        />
      </View>
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
  const spec: ChartSpec = {
    kind: screen.chart.kind,
    data: screen.chart.data as any,
    decision_index: -1,
  };
  const fit = useChartGaps({
    preferred: DEFAULT_GAPS,
    growth: REVEAL_GROWTH,
    locked: picked !== null || revealed,
  });
  const height = chartHeightFor(false, fit.gaps);
  const chartWidth = chartWidthFor(width, false, fit.gaps);
  const grid = useGridAnchor(picked);

  // The columns are placed from the chart's own geometry. They used to be a
  // flex row inset by the literals 6 and 44 -- the chart's padding and axis
  // width copied by hand -- which put every target half a bar off centre.
  const candles = toCandles(spec);
  const domain = domainOf(candles, spec, candles.length);
  const layout = chartLayout({
    width: chartWidth,
    height,
    bars,
    lo: domain.lo,
    hi: domain.hi,
    hasVolume: false,
    gridAnchor: grid.gridAnchor,
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.column} onLayout={fit.onLayout}>
        <Prompt>{screen.prompt}</Prompt>
        <View
          ref={grid.ref}
          onLayout={grid.onLayout}
          style={{ width: chartWidth, height, alignSelf: 'center' }}
        >
          <Chart
            spec={spec}
            visibleCount={bars}
            width={chartWidth}
            height={height}
            showDecisionMarker={false}
            gridAnchor={grid.gridAnchor}
          />
          {/* An invisible column per bar: a candle is far too small a tap target
            on its own (docs/UI.md §10, 48 pt minimum). */}
          <View style={styles.tapRow} pointerEvents="box-none">
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
                  accessibilityRole="button"
                  accessibilityLabel={`Candle ${i + 1} of ${bars}`}
                  key={i}
                  testID={`candle-${i}`}
                  disabled={revealed}
                  onPress={() => {
                    tapFeedback();
                    onChange({ kind: 'index', index: picked === i ? null : i });
                  }}
                  style={[
                    styles.tapCol,
                    {
                      left: layout.cx(i) - layout.slot / 2 + 1,
                      width: Math.max(1, layout.slot - 2),
                      top: layout.padTop,
                      height: layout.priceH,
                      backgroundColor: tint,
                      borderColor: border,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

/** Decimals a step needs: 5 -> 0, 0.5 -> 1, 0.01 -> 2. */
function decimalsOf(step: number): number {
  const text = String(step);
  return text.includes('.') ? text.split('.')[1].length : 0;
}

/** A slider value as it is read: "$36", "$0.40", "25 %", "12 min". */
function sliderText(v: number, unit: string | undefined, step: number): string {
  if (unit === '$') {
    const dp = Number.isInteger(v) && step >= 1 ? 0 : 2;
    return `${v < 0 ? '−' : ''}${copy('$')}${Math.abs(v).toFixed(dp)}`;
  }
  const n = v.toFixed(decimalsOf(step));
  return unit ? `${n} ${unit}` : n;
}

/**
 * Where the knob waits before the first touch. The middle of the range, unless
 * the middle is already right -- a slider that opens on its answer is a freebie
 * -- in which case a quarter of the way in from the end further from it.
 */
function restOf(screen: SliderS): number {
  const { min, max, answer } = screen;
  const step = screen.step ?? 1;
  const tolerance = screen.tolerance ?? 0;
  const snap = (x: number) => Number((min + Math.round((x - min) / step) * step).toFixed(4));
  const mid = snap((min + max) / 2);
  if (Math.abs(mid - answer) > tolerance) return mid;
  const low = snap(min + (max - min) * 0.25);
  const high = snap(max - (max - min) * 0.25);
  const pick = Math.abs(low - answer) >= Math.abs(high - answer) ? low : high;
  if (Math.abs(pick - answer) > tolerance) return pick;
  return Math.abs(min - answer) >= Math.abs(max - answer) ? min : max;
}

/**
 * docs/UI.md §4.1 `slider` — set a value with a tolerance band. [DESIGN-REVIEW]
 * The value is set on a dial (screens/Dial.tsx, David's pick of 2026-10-04),
 * with − and + beside it.
 */
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
  const shown = current ?? restOf(screen);
  const steps = Math.max(1, Math.round((screen.max - screen.min) / step));
  const stepOf = (v: number) => Math.round((v - screen.min) / step);
  const tolerance = screen.tolerance ?? 0;
  // The ends keep a currency or a percent, not a long unit.
  const short = screen.unit === '$' || screen.unit === '%' ? screen.unit : undefined;

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <View style={styles.zone}>
        <Dial
          steps={steps}
          step={stepOf(shown)}
          onStep={(s) =>
            onChange({ kind: 'slider', value: Number((screen.min + s * step).toFixed(4)) })
          }
          text={sliderText(shown, screen.unit, step)}
          low={sliderText(screen.min, short, step)}
          high={sliderText(screen.max, short, step)}
          band={
            revealed
              ? [
                  Math.max(0, stepOf(screen.answer - tolerance)),
                  Math.min(steps, stepOf(screen.answer + tolerance)),
                ]
              : null
          }
          verdict={
            revealed ? (Math.abs(shown - screen.answer) <= tolerance ? 'correct' : 'wrong') : null
          }
          width={width}
        />

        {/* Kept in the layout before the reveal, only empty, so the line
          arriving does not move what is above it. */}
        <Text style={styles.sliderAnswer}>
          {revealed
            ? `Intended: ${sliderText(screen.answer, screen.unit, step)} (±${sliderText(
                tolerance,
                // The band is a distance: it keeps a currency or a percent, not a long label.
                short,
                step,
              )})`
            : ' '}
        </Text>
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.lg },
  zone: { gap: space.lg },
  column: { gap: space.lg },
  tapRow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  tapCol: { position: 'absolute', borderRadius: radius.sm, borderWidth: 1.5 },
  sliderAnswer: { ...type.small, color: colors.textMuted, textAlign: 'center' },
}));
