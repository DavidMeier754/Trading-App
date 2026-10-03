import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

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
 * The plan's lines once the choice is made: the entry quiet, the stop in the
 * down colour, the target in the up colour, each with its price, from the
 * decision to the right edge -- the trade exists only from the entry on.
 */
export function PlanLines({
  plan,
  y,
  x0,
  x1,
  enter,
}: {
  plan: TradePlan;
  y: (price: number) => number;
  x0: number;
  x1: number;
  enter: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => ({ opacity: enter.get() }));
  const ye = y(plan.entry);
  const ys = y(plan.stop);
  const yt = y(plan.target);
  // The target's label sits on the side away from the entry, and so does the stop's.
  const above = (yy: number, other: number) => (yy <= other ? yy - 5 : yy + 15);
  const line = (yy: number, color: string, dash: string, label: string, ly: number) => (
    <G>
      <Line
        x1={x0}
        x2={x1}
        y1={yy}
        y2={yy}
        stroke={color}
        strokeWidth={1.4}
        strokeDasharray={dash}
      />
      <SvgText x={x1 - 3} y={ly} fill={color} fontSize={13} fontWeight="700" textAnchor="end">
        {label}
      </SvgText>
    </G>
  );
  return (
    <AnimatedG animatedProps={props} opacity={0} pointerEvents="none">
      {line(ye, colors.textMuted, '2 3', '', 0)}
      <SvgText x={x0 + 4} y={ye - 5} fill={colors.textMuted} fontSize={13} fontWeight="600">
        {`Entry ${axisPrice(plan.entry)}`}
      </SvgText>
      {line(ys, colors.down, '5 4', `Stop ${axisPrice(plan.stop)}`, above(ys, ye))}
      {line(yt, colors.up, '5 4', `Target ${axisPrice(plan.target)}`, above(yt, ye))}
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
 * inside the chart, and stepped further out when it would sit on a tag
 * already placed. Notes are few (1–4), so a plain pass is enough.
 */
export function placeNotes(
  notes: ChartNote[],
  {
    cx,
    yHigh,
    yLow,
    bounds,
  }: {
    cx: (bar: number) => number;
    yHigh: (bar: number) => number;
    yLow: (bar: number) => number;
    bounds: { left: number; right: number; top: number; bottom: number };
  },
): PlacedNote[] {
  const placed: PlacedNote[] = [];
  const overlaps = (a: PlacedNote, b: PlacedNote) =>
    a.left < b.left + b.width + 4 &&
    b.left < a.left + a.width + 4 &&
    a.top < b.top + NOTE_H + 4 &&
    b.top < a.top + NOTE_H + 4;
  for (const note of notes) {
    const low = note.at === 'low';
    const px = cx(note.bar);
    const py = low ? yLow(note.bar) + 3 : yHigh(note.bar) - 3;
    const width = note.text.length * NOTE_CHAR_W + 16;
    const left = Math.max(bounds.left, Math.min(bounds.right - width, px - width / 2));
    let top = low ? py + NOTE_REACH : py - NOTE_REACH - NOTE_H;
    let tag: PlacedNote = { text: note.text, px, py, left, top, width };
    for (let tries = 0; tries < 4 && placed.some((p) => overlaps(p, tag)); tries++) {
      top += low ? NOTE_H + 4 : -(NOTE_H + 4);
      tag = { ...tag, top };
    }
    // Inside the chart: a tag that would leave it flips to the other side of its bar.
    if (tag.top < bounds.top) tag = { ...tag, top: Math.max(bounds.top, py + NOTE_REACH) };
    if (tag.top + NOTE_H > bounds.bottom) {
      tag = { ...tag, top: Math.min(bounds.bottom - NOTE_H, py - NOTE_REACH - NOTE_H) };
    }
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
