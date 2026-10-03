import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, { G, Line, Path, Rect, Text as SvgText, type TextProps } from 'react-native-svg';

import { axisPrice } from '../format';
import { Arrive } from '../lesson/Celebrate';
import { formatR, type TradePlan } from '../lesson/tradePlan';
import { colors, MONO_FONT, radius, type, themed } from '../theme';
import type { ChartNote } from '../types';

const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * What a chart decision draws on top of its bars since DESIGN-REVIEW
 * (docs/UI.md §6.4): the open, the trade plan's lines, the R ruler's scale and
 * the notes. All of it is static geometry; the ruler's moving part plays in
 * Chart.tsx, where the replay's worklets are.
 */

/** The room the R ruler takes beside the price axis. */
export const RULER_W = 46;

/** A label on the chart is 13 pt bold: about this wide per character. */
export const LABEL_CHAR_W = 7.4;
/** A label's height above its baseline, and a little under it. */
const LABEL_ASCENT = 13;
const LABEL_H = 17;

/** A label's box on the chart, so the notes can keep off it. */
export type LabelBox = { left: number; top: number; width: number; height: number };

/** The box of a 13 pt label written at (x, baseline). */
export function labelBox(
  text: string,
  x: number,
  baseline: number,
  anchor: 'start' | 'end' = 'start',
): LabelBox {
  const width = text.length * LABEL_CHAR_W;
  return {
    left: anchor === 'end' ? x - width : x,
    top: baseline - LABEL_ASCENT,
    width,
    height: LABEL_H,
  };
}

/** How much of box `a` lies on box `b`, in square points. */
function overlapArea(a: LabelBox, b: LabelBox): number {
  const w = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
  const h = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/** What a level label's move away from its usual spot must save, in square points of bar. */
const MOVE_COST = 40;

export type LevelLabelSpot = { text: string; x: number; y: number; anchor: 'start' | 'end' };

/**
 * Where each level's label goes: at the left or the right end of its line,
 * just above it or just under it -- the spot that covers the least of the
 * bars and the other levels' lines, and none of the chart's other words.
 * `ink` is every bar of the chart, those still to come included, so a label
 * never moves while the replay plays. Ties, and near-ties, go left, then above.
 */
export function placeLevelLabels(
  levels: { text: string; y: number }[],
  {
    left,
    right,
    top,
    bottom,
    ink,
    avoid = [],
  }: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    /** The bars' bodies and wicks, or a line's track: covering them costs by the area. */
    ink: LabelBox[];
    /** Words a label must not cover. */
    avoid?: LabelBox[];
  },
): LevelLabelSpot[] {
  const placed: LabelBox[] = [];
  return levels.map((lvl, i) => {
    // The other levels' lines count as ink: a label sitting on one reads as its label.
    const lines = levels
      .filter((_, j) => j !== i)
      .map((o) => ({ left, top: o.y - 1.5, width: right - left, height: 3 }));
    const spots: LevelLabelSpot[] = [
      { text: lvl.text, x: left + 4, y: lvl.y - 5, anchor: 'start' },
      { text: lvl.text, x: left + 4, y: lvl.y + 15, anchor: 'start' },
      { text: lvl.text, x: right - 4, y: lvl.y - 5, anchor: 'end' },
      { text: lvl.text, x: right - 4, y: lvl.y + 15, anchor: 'end' },
    ];
    let best = spots[0];
    let bestScore = Infinity;
    spots.forEach((spot, k) => {
      const box = labelBox(spot.text, spot.x, spot.y, spot.anchor);
      // A label moves off its usual spot (left, above) only to clear a real
      // part of a bar, not the tip of a wick.
      let score = k * MOVE_COST;
      for (const b of [...ink, ...lines]) score += overlapArea(box, b);
      for (const b of [...avoid, ...placed]) if (overlapArea(box, b) > 0) score += 1e5;
      if (box.top < top - 2 || box.top + box.height > bottom + 2) score += 1e6;
      if (score < bestScore) {
        best = spot;
        bestScore = score;
      }
    });
    placed.push(labelBox(best.text, best.x, best.y, best.anchor));
    return best;
  });
}

/**
 * A label that stays readable where it crosses a bar or a line: the letters
 * sit on a rim of the page's colour, drawn first, then the letters on top.
 */
export function HaloText({ children, ...props }: TextProps & { children: string }) {
  return (
    <G>
      <SvgText
        {...props}
        fill={colors.background}
        stroke={colors.background}
        strokeWidth={4}
        strokeLinejoin="round"
      >
        {children}
      </SvgText>
      <SvgText {...props}>{children}</SvgText>
    </G>
  );
}

/** docs/UI.md §6.4: the bars before the open shaded, a dashed line and a bell at the open. */
export function SessionOpen({
  x,
  left,
  top,
  bottom,
}: {
  /** The open's x: the edge between the last pre-market bar and the first regular one. */
  x: number;
  left: number;
  top: number;
  bottom: number;
}) {
  return (
    <G pointerEvents="none">
      <Rect
        x={left}
        y={top}
        width={Math.max(0, x - left)}
        height={bottom - top}
        fill={colors.text}
        opacity={0.045}
      />
      <Line
        x1={x}
        x2={x}
        y1={top}
        y2={bottom}
        stroke={colors.warning}
        strokeWidth={1.25}
        strokeDasharray="4 3"
        opacity={0.9}
      />
      {/* A small bell, then the word: the open at a glance. */}
      <G transform={`translate(${x + 4}, ${top + 2}) scale(0.62)`}>
        <Path
          d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 2.2H4.2z"
          fill={colors.warning}
          stroke={colors.warning}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <Path
          d="M10 21a2 2 0 0 0 4 0"
          fill="none"
          stroke={colors.warning}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </G>
      <SvgText x={x + 22} y={top + 14} fill={colors.warning} fontSize={13} fontWeight="700">
        Open
      </SvgText>
    </G>
  );
}

/**
 * Where the plan's labels go: the entry's just right of the decision, the
 * stop's and the target's at the right edge, each on the side of its line
 * away from the entry -- unless that side runs off the plot, or into the
 * decision's tag at its top, when it takes the other side.
 */
export function planLabels(
  plan: TradePlan,
  {
    y,
    x0,
    x1,
    top,
    bottom,
  }: {
    y: (price: number) => number;
    x0: number;
    x1: number;
    /** The plot's top; the decision's tag sits on it. */
    top: number;
    bottom: number;
  },
) {
  const ye = y(plan.entry);
  // Clear of the decision's tag, which reaches a few points into the plot.
  const ceiling = top + 8;
  const above = (yy: number) => yy - 5;
  const below = (yy: number) => yy + 15;
  const side = (yy: number, wantAbove: boolean) => {
    if (wantAbove && above(yy) - LABEL_ASCENT < ceiling) return below(yy);
    if (!wantAbove && below(yy) > bottom - 2) return above(yy);
    return wantAbove ? above(yy) : below(yy);
  };
  const ys = y(plan.stop);
  const yt = y(plan.target);
  const entry = { text: `Entry ${axisPrice(plan.entry)}`, x: x0 + 4, y: side(ye, true) };
  const stop = { text: `Stop ${axisPrice(plan.stop)}`, x: x1 - 3, y: side(ys, ys <= ye) };
  const target = { text: `Target ${axisPrice(plan.target)}`, x: x1 - 3, y: side(yt, yt <= ye) };
  return {
    entry,
    stop,
    target,
    boxes: [
      labelBox(entry.text, entry.x, entry.y),
      labelBox(stop.text, stop.x, stop.y, 'end'),
      labelBox(target.text, target.x, target.y, 'end'),
    ],
  };
}

/**
 * The plan's lines once the choice is made: the entry quiet, the stop in the
 * down colour, the target in the up colour, each with its price, from the
 * decision to the right edge -- the trade exists only from the entry on.
 */
export function PlanLines({
  plan,
  y,
  x0,
  x1,
  top,
  bottom,
  enter,
}: {
  plan: TradePlan;
  y: (price: number) => number;
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  enter: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => ({ opacity: enter.get() }));
  const labels = planLabels(plan, { y, x0, x1, top, bottom });
  const line = (yy: number, color: string, dash: string) => (
    <Line x1={x0} x2={x1} y1={yy} y2={yy} stroke={color} strokeWidth={1.4} strokeDasharray={dash} />
  );
  return (
    <AnimatedG animatedProps={props} opacity={0} pointerEvents="none">
      {line(y(plan.entry), colors.textMuted, '2 3')}
      {line(y(plan.stop), colors.down, '5 4')}
      {line(y(plan.target), colors.up, '5 4')}
      <HaloText
        x={labels.entry.x}
        y={labels.entry.y}
        fill={colors.textMuted}
        fontSize={13}
        fontWeight="600"
      >
        {labels.entry.text}
      </HaloText>
      <HaloText
        x={labels.stop.x}
        y={labels.stop.y}
        fill={colors.down}
        fontSize={13}
        fontWeight="700"
        textAnchor="end"
      >
        {labels.stop.text}
      </HaloText>
      <HaloText
        x={labels.target.x}
        y={labels.target.y}
        fill={colors.up}
        fontSize={13}
        fontWeight="700"
        textAnchor="end"
      >
        {labels.target.text}
      </HaloText>
    </AnimatedG>
  );
}

/** The R values the ruler marks: every whole R from −1 up to the target, and the target itself. */
export function rulerMarks(plan: TradePlan): number[] {
  const marks: number[] = [];
  for (let k = -1; k <= Math.floor(plan.targetR + 1e-9); k++) marks.push(k);
  if (Math.abs(plan.targetR - Math.round(plan.targetR)) > 0.05) marks.push(plan.targetR);
  return marks;
}

/**
 * The R ruler's scale beside the price axis (docs/UI.md §6.4): −1R at the
 * stop, 0 at the entry, +1R and on up to the target. Faint when the learner
 * stood aside: it shows what would have happened.
 */
export function RulerScale({
  plan,
  y,
  x,
  faint,
  enter,
}: {
  plan: TradePlan;
  y: (price: number) => number;
  /** The ruler's spine. */
  x: number;
  faint: boolean;
  enter: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => ({ opacity: enter.get() * (faint ? 0.5 : 1) }));
  const priceOf = (r: number) => plan.entry + plan.dir * r * plan.risk;
  const marks = rulerMarks(plan);
  return (
    <AnimatedG animatedProps={props} opacity={0} pointerEvents="none">
      <Line
        x1={x}
        x2={x}
        y1={y(priceOf(-1))}
        y2={y(priceOf(plan.targetR))}
        stroke={colors.borderStrong}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {marks.map((r) => {
        const yy = y(priceOf(r));
        const whole = Math.abs(r - Math.round(r)) < 1e-9;
        return (
          <G key={r}>
            <Line
              x1={x - 4}
              x2={x + 4}
              y1={yy}
              y2={yy}
              stroke={colors.borderStrong}
              strokeWidth={2}
            />
            {whole ? (
              <SvgText
                x={x + 8}
                y={yy + 4.5}
                fill={r === 0 ? colors.text : colors.textMuted}
                fontSize={13}
                fontWeight="700"
                fontFamily={MONO_FONT}
              >
                {r === 0 ? '0' : formatR(r)}
              </SvgText>
            ) : null}
          </G>
        );
      })}
    </AnimatedG>
  );
}

/** The result on the ruler once the trade has ended: a pill at the exit, "+1.6R". */
export function RulerResult({
  plan,
  y,
  x,
  faint,
}: {
  plan: TradePlan;
  y: (price: number) => number;
  x: number;
  faint: boolean;
}) {
  const up = plan.exit.r > 0;
  const flat = Math.abs(plan.exit.r) < 0.05;
  const color = flat ? colors.textMuted : up ? colors.up : colors.down;
  return (
    <Arrive
      style={[
        styles.pill,
        { top: y(plan.exit.price) - 12, left: x - 6, borderColor: color, opacity: faint ? 0.6 : 1 },
      ]}
    >
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>
        {formatR(plan.exit.r)}
      </Text>
    </Arrive>
  );
}

/** A note's tag: one line at 13 pt, about this wide per character. */
const NOTE_CHAR_W = 7.4;
const NOTE_H = 24;
/** How far a tag stands off the bar it means. */
const NOTE_REACH = 22;

export type PlacedNote = {
  text: string;
  /** The point on the bar the leader meets. */
  px: number;
  py: number;
  /** The tag's box. */
  left: number;
  top: number;
  width: number;
};

/**
 * Where each note's tag goes: above the bar's high (or under its low), kept
 * inside the chart. A tag that would sit on a tag already placed, a label
 * (`avoid`: the levels', the plan's, the decision's tag) or another bar
 * steps further out; if its side has no room, it tries the bar's other side.
 * Bars give way first: a tag may cover a bar before it covers a word. Notes
 * are few (1–4), so a plain pass is enough.
 */
export function placeNotes(
  notes: ChartNote[],
  {
    cx,
    yHigh,
    yLow,
    bounds,
    avoid = [],
    bars = [],
  }: {
    cx: (bar: number) => number;
    yHigh: (bar: number) => number;
    yLow: (bar: number) => number;
    bounds: { left: number; right: number; top: number; bottom: number };
    /** Words on the chart a tag must not cover. */
    avoid?: LabelBox[];
    /** The bars on the chart, which a tag would rather not cover. */
    bars?: LabelBox[];
  },
): PlacedNote[] {
  const placed: PlacedNote[] = [];
  const asBox = (t: PlacedNote): LabelBox => ({
    left: t.left,
    top: t.top,
    width: t.width,
    height: NOTE_H,
  });
  const hits = (a: LabelBox, b: LabelBox) =>
    a.left < b.left + b.width + 4 &&
    b.left < a.left + a.width + 4 &&
    a.top < b.top + b.height + 4 &&
    b.top < a.top + a.height + 4;
  const inside = (t: PlacedNote) => t.top >= bounds.top && t.top + NOTE_H <= bounds.bottom;
  const clearOf = (t: PlacedNote, boxes: LabelBox[]) => !boxes.some((b) => hits(asBox(t), b));
  for (const note of notes) {
    const width = note.text.length * NOTE_CHAR_W + 16;
    const px = cx(note.bar);
    const left = Math.max(bounds.left, Math.min(bounds.right - width, px - width / 2));
    const first: 'low' | 'high' = note.at === 'low' ? 'low' : 'high';
    // The note's own side, stepping out from the bar, then the other side.
    const candidates: PlacedNote[] = [];
    for (const side of first === 'low' ? (['low', 'high'] as const) : (['high', 'low'] as const)) {
      const py = side === 'low' ? yLow(note.bar) + 3 : yHigh(note.bar) - 3;
      for (let k = 0; k < 4; k++) {
        const out = NOTE_REACH + k * (NOTE_H + 4);
        const top = side === 'low' ? py + out : py - out - NOTE_H;
        candidates.push({ text: note.text, px, py, left, top, width });
      }
    }
    const words = [...avoid, ...placed.map(asBox)];
    // The bar the note means is never in the way: its leader runs to it.
    const others = bars.filter((_, i) => i !== note.bar);
    const tag =
      candidates.find((t) => inside(t) && clearOf(t, words) && clearOf(t, others)) ??
      candidates.find((t) => inside(t) && clearOf(t, words)) ??
      (() => {
        const t = candidates[0];
        return {
          ...t,
          top: Math.max(bounds.top, Math.min(bounds.bottom - NOTE_H, t.top)),
        };
      })();
    placed.push(tag);
  }
  return placed;
}

/**
 * docs/UI.md §6.4: the file's notes on the chart once everything has played
 * out, each a few words on a tag with a thin leader to the bar it means. They
 * arrive one after another.
 */
export function ChartNotes({
  placed,
  width,
  height,
  reduced,
}: {
  placed: PlacedNote[];
  width: number;
  height: number;
  reduced: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessible
      accessibilityLabel={`Notes on the chart: ${placed.map((p) => p.text).join('; ')}.`}
    >
      {placed.map((p, i) => {
        const tagMidX = p.left + p.width / 2;
        const tagEdgeY = p.top > p.py ? p.top : p.top + NOTE_H;
        return (
          <Arrive key={i} delay={reduced ? 0 : 120 + i * 180} style={StyleSheet.absoluteFill}>
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
              <Line
                x1={p.px}
                y1={p.py}
                x2={tagMidX}
                y2={tagEdgeY}
                stroke={colors.text}
                strokeWidth={1}
                opacity={0.55}
              />
              <Rect
                x={p.px - 2}
                y={p.py - 2}
                width={4}
                height={4}
                rx={2}
                fill={colors.text}
                opacity={0.7}
              />
            </Svg>
            <View style={[styles.note, { left: p.left, top: p.top, width: p.width }]}>
              <Text style={styles.noteText} numberOfLines={1}>
                {p.text}
              </Text>
            </View>
          </Arrive>
        );
      })}
    </View>
  );
}

const styles = themed(() => ({
  // Coloured words on the surface, not white on colour: green under white
  // text does not hold 4.5 : 1 in the dark theme (docs/UI.md §10).
  pill: {
    position: 'absolute',
    height: 24,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  pillText: { ...type.small, fontSize: 13, fontWeight: '800', fontFamily: MONO_FONT },
  note: {
    position: 'absolute',
    height: NOTE_H,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { ...type.small, fontSize: 13, fontWeight: '700', color: colors.text },
}));
