import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { axisPrice, volume as fmtVolume } from '../format';
import { CHART_GRID_STEP, colors, GRID, type } from '../theme';
import type { ChartSpec } from '../types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export type Candle = { o: number; h: number; l: number; c: number };

/** The stroke, revealed by sweeping a dash mask along the finished path. */
function AnimatedStroke({
  d,
  length,
  draw,
}: {
  d: string;
  length: number;
  draw: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - draw.get()),
  }));
  return (
    <AnimatedPath
      d={d}
      stroke={colors.accent}
      strokeWidth={2.25}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeDasharray={`${length} ${length}`}
      animatedProps={props}
    />
  );
}

function AnimatedFill({ d, draw }: { d: string; draw: SharedValue<number> }) {
  const props = useAnimatedProps(() => ({
    opacity: Math.max(0, (draw.get() - 0.8) / 0.2),
  }));
  return (
    <AnimatedG animatedProps={props}>
      <Path d={d} fill="url(#lineFill)" />
    </AnimatedG>
  );
}

function AnimatedDot({
  cx,
  cy,
  draw,
}: {
  cx: number;
  cy: number;
  draw: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => ({
    opacity: draw.get() > 0.92 ? (draw.get() - 0.92) / 0.08 : 0,
  }));
  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={4}
      fill={colors.accent}
      stroke={colors.background}
      strokeWidth={2}
      animatedProps={props}
    />
  );
}

/**
 * Everything the replay needs, as plain numbers so the worklets below can read
 * it on the UI thread.
 *
 * `lo0/hi0` is the price domain as it stood at the decision and `lo1/hi1` the
 * domain once every bar is in. Interpolating between them is what makes the
 * axis grow smoothly: the old playback raised `visibleCount` one bar at a time,
 * and each of those steps was a React render that re-scaled every point already
 * on screen. Five rescales in 600ms is what read as stutter.
 */
export type PlayGeom = {
  xs: number[];
  closes: number[];
  /** The other three series, for the candle replay. Empty on a line chart. */
  opens: number[];
  highs: number[];
  lows: number[];
  /** Bars visible at the decision. */
  from: number;
  n: number;
  padTop: number;
  priceH: number;
  baseline: number;
  lo0: number;
  hi0: number;
  lo1: number;
  hi1: number;
};

/**
 * How far the price axis has travelled from the decision to its final range, at
 * replay position `t`.
 *
 * The axis has to widen: at the decision it fits six bars and by the end it
 * fits eleven, and the plot's height is fixed by the grid, so everything
 * already drawn must compress. Measured on Chapter 1's first decision, the six
 * bars the learner studied go from 137.7 points tall to 55.1.
 *
 * That is unavoidable. What is avoidable is doing it *linearly across the whole
 * replay*, which is what this used to do: the line sagged continuously under the
 * pen while it was being drawn, and the compression read as the chart going
 * flat rather than as the view making room.
 *
 * So the whole widening happens in the first quarter, on an ease-out, before
 * most of the line exists -- the chart takes one quick step back -- and the rest
 * of the replay draws at a scale that does not move at all. Same start, same
 * end, and nothing distorts while the eye is following the line.
 */
const ZOOM_OUT = 0.3;

function domainProgress(t: number) {
  'worklet';
  const u = Math.min(1, t / ZOOM_OUT);
  // Smoothstep rather than an ease-out: an ease-out put nine tenths of the
  // widening into the first 80 ms, which reads as a jolt, not a camera move.
  return u * u * (3 - 2 * u);
}

/** The same curve off the worklet, for the first frame. */
function domainProgressAt(t: number) {
  const u = Math.min(1, t / ZOOM_OUT);
  return u * u * (3 - 2 * u);
}

/** Price -> y at replay position `t`, against the widening domain. */
function playY(g: PlayGeom, t: number, price: number) {
  'worklet';
  const d = domainProgress(t);
  const lo = g.lo0 + (g.lo1 - g.lo0) * d;
  const hi = g.hi0 + (g.hi1 - g.hi0) * d;
  return g.padTop + g.priceH - ((price - lo) / (hi - lo)) * g.priceH;
}

/** The fractional index of the leading edge: from-1 at t=0, n-1 at t=1. */
function playHead(g: PlayGeom, t: number) {
  'worklet';
  return g.from - 1 + t * (g.n - g.from);
}

/**
 * How present bar `i` is at replay position `t`.
 *
 * A candle cannot grow out of the axis the way a line extends, so it fades in
 * over the one bar-width the playhead takes to reach it: 0 while the head is a
 * bar away, 1 once it arrives. Bars the learner could already see start at 1 and
 * stay there.
 */
function barAlpha(g: PlayGeom, t: number, i: number) {
  'worklet';
  const head = g.from - 1 + t * (g.n - g.from);
  return Math.max(0, Math.min(1, head - i + 1));
}

/**
 * The same two functions without the worklet directive, for the first frame.
 * Animated props are applied after the first commit, and a native SVG view wants
 * a real number from the start — the same reason `playLineAt` exists below.
 */
function playYAt(g: PlayGeom, t: number, price: number) {
  const d = domainProgressAt(t);
  const lo = g.lo0 + (g.lo1 - g.lo0) * d;
  const hi = g.hi0 + (g.hi1 - g.hi0) * d;
  return g.padTop + g.priceH - ((price - lo) / (hi - lo)) * g.priceH;
}

function barAlphaAt(g: PlayGeom, t: number, i: number) {
  const head = g.from - 1 + t * (g.n - g.from);
  return Math.max(0, Math.min(1, head - i + 1));
}

function playHeadPoint(g: PlayGeom, t: number) {
  'worklet';
  const head = playHead(g, t);
  const whole = Math.floor(head);
  const frac = head - whole;
  if (frac <= 0.0001 || whole + 1 >= g.n) {
    const i = Math.min(whole, g.n - 1);
    return { x: g.xs[i], y: playY(g, t, g.closes[i]) };
  }
  const price = g.closes[whole] + (g.closes[whole + 1] - g.closes[whole]) * frac;
  return {
    x: g.xs[whole] + (g.xs[whole + 1] - g.xs[whole]) * frac,
    y: playY(g, t, price),
  };
}

function playLine(g: PlayGeom, t: number) {
  'worklet';
  const head = playHead(g, t);
  const whole = Math.floor(head);
  let d = `M${g.xs[0].toFixed(2)},${playY(g, t, g.closes[0]).toFixed(2)}`;
  for (let i = 1; i <= whole; i++) {
    d += ` L${g.xs[i].toFixed(2)},${playY(g, t, g.closes[i]).toFixed(2)}`;
  }
  const tip = playHeadPoint(g, t);
  d += ` L${tip.x.toFixed(2)},${tip.y.toFixed(2)}`;
  return d;
}

/**
 * The same two functions again, without the worklet directive, for computing the
 * first frame on the React side. Animated props are applied after the first
 * commit, and the native SVG views want a real `d` and a real centre from the
 * very first frame -- react-native-web tolerates undefined, a device does not.
 */
function playHeadPointAt(g: PlayGeom, t: number) {
  const head = g.from - 1 + t * (g.n - g.from);
  const whole = Math.floor(head);
  const frac = head - whole;
  const yOf = (price: number) => {
    const d = domainProgressAt(t);
    const lo = g.lo0 + (g.lo1 - g.lo0) * d;
    const hi = g.hi0 + (g.hi1 - g.hi0) * d;
    return g.padTop + g.priceH - ((price - lo) / (hi - lo)) * g.priceH;
  };
  if (frac <= 0.0001 || whole + 1 >= g.n) {
    const i = Math.min(whole, g.n - 1);
    return { x: g.xs[i], y: yOf(g.closes[i]) };
  }
  const price = g.closes[whole] + (g.closes[whole + 1] - g.closes[whole]) * frac;
  return { x: g.xs[whole] + (g.xs[whole + 1] - g.xs[whole]) * frac, y: yOf(price) };
}

function playLineAt(g: PlayGeom, t: number) {
  const head = g.from - 1 + t * (g.n - g.from);
  const whole = Math.floor(head);
  const dp = domainProgressAt(t);
  const lo = g.lo0 + (g.lo1 - g.lo0) * dp;
  const hi = g.hi0 + (g.hi1 - g.hi0) * dp;
  const yOf = (price: number) =>
    g.padTop + g.priceH - ((price - lo) / (hi - lo)) * g.priceH;
  let d = `M${g.xs[0].toFixed(2)},${yOf(g.closes[0]).toFixed(2)}`;
  for (let i = 1; i <= whole; i++) {
    d += ` L${g.xs[i].toFixed(2)},${yOf(g.closes[i]).toFixed(2)}`;
  }
  const tip = playHeadPointAt(g, t);
  return `${d} L${tip.x.toFixed(2)},${tip.y.toFixed(2)}`;
}

function PlaybackLine({
  g,
  progress,
}: {
  g: PlayGeom;
  progress: SharedValue<number>;
}) {
  const fill = useAnimatedProps(() => {
    const t = progress.get();
    const tip = playHeadPoint(g, t);
    const base = g.baseline.toFixed(2);
    return {
      d: `${playLine(g, t)} L${tip.x.toFixed(2)},${base} L${g.xs[0].toFixed(2)},${base} Z`,
    };
  });
  const stroke = useAnimatedProps(() => ({ d: playLine(g, progress.get()) }));
  const dot = useAnimatedProps(() => {
    const tip = playHeadPoint(g, progress.get());
    return { cx: tip.x, cy: tip.y };
  });

  const first = playLineAt(g, 0);
  const firstTip = playHeadPointAt(g, 0);

  return (
    <G>
      <AnimatedPath
        d={`${first} L${firstTip.x.toFixed(2)},${g.baseline.toFixed(2)} L${g.xs[0].toFixed(
          2
        )},${g.baseline.toFixed(2)} Z`}
        animatedProps={fill}
        fill="url(#lineFill)"
      />
      <AnimatedPath
        d={first}
        animatedProps={stroke}
        stroke={colors.accent}
        strokeWidth={2.25}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <AnimatedCircle
        cx={firstTip.x}
        cy={firstTip.y}
        animatedProps={dot}
        r={4}
        fill={colors.accent}
        stroke={colors.background}
        strokeWidth={2}
      />
    </G>
  );
}

/**
 * One candle during the replay.
 *
 * Every bar of the series is mounted from the start — the future ones simply sit
 * at zero opacity — so the replay never mounts a view mid-flight. Both the wick
 * and the body take their y from the interpolating domain, which is what makes
 * the axis grow under the bars already on screen instead of snapping between
 * scales. Line charts have had this since the first build; 496 of the corpus's
 * 544 chart decisions are candles and had a jump cut instead.
 */
function PlaybackCandle({
  g,
  i,
  bar,
  bodyW,
  progress,
}: {
  g: PlayGeom;
  i: number;
  bar: Candle;
  bodyW: number;
  progress: SharedValue<number>;
}) {
  const up = bar.c >= bar.o;
  const stroke = up ? colors.up : colors.down;

  const wick = useAnimatedProps(() => {
    const t = progress.get();
    return {
      y1: playY(g, t, g.highs[i]),
      y2: playY(g, t, g.lows[i]),
      opacity: barAlpha(g, t, i),
    };
  });

  const body = useAnimatedProps(() => {
    const t = progress.get();
    const top = playY(g, t, Math.max(g.opens[i], g.closes[i]));
    const bottom = playY(g, t, Math.min(g.opens[i], g.closes[i]));
    return {
      y: top,
      height: Math.max(1.5, bottom - top),
      opacity: barAlpha(g, t, i),
    };
  });

  const alpha0 = barAlphaAt(g, 0, i);
  const top0 = playYAt(g, 0, Math.max(bar.o, bar.c));
  const bottom0 = playYAt(g, 0, Math.min(bar.o, bar.c));

  return (
    <G>
      <AnimatedLine
        x1={g.xs[i]}
        x2={g.xs[i]}
        y1={playYAt(g, 0, bar.h)}
        y2={playYAt(g, 0, bar.l)}
        opacity={alpha0}
        stroke={stroke}
        strokeWidth={1.25}
        animatedProps={wick}
      />
      <AnimatedRect
        x={g.xs[i] - bodyW / 2}
        y={top0}
        width={bodyW}
        height={Math.max(1.5, bottom0 - top0)}
        opacity={alpha0}
        fill={up ? stroke : colors.background}
        stroke={stroke}
        strokeWidth={1.25}
        rx={1}
        animatedProps={body}
      />
    </G>
  );
}

/** A volume bar during the replay. Its height is fixed — only its presence moves. */
function PlaybackVolumeBar({
  g,
  i,
  x,
  y,
  width,
  height,
  fill,
  progress,
}: {
  g: PlayGeom;
  i: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  progress: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => ({
    opacity: 0.45 * barAlpha(g, progress.get(), i),
  }));
  return (
    <AnimatedRect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={1}
      fill={fill}
      opacity={0.45 * barAlphaAt(g, 0, i)}
      animatedProps={props}
    />
  );
}

/** The axis labels are the only part of the frame the replay changes, so they
 *  cross-fade rather than re-render: old values out, final values in. */
function PlaybackAxis({
  progress,
  children,
  fadeOut,
}: {
  progress: SharedValue<number>;
  children: React.ReactNode;
  fadeOut: boolean;
}) {
  const props = useAnimatedProps(() => {
    const t = progress.get();
    // The labels belong to the scale, so they change with it: the old set is
    // gone before the zoom is half done and the final set is in by the time it
    // settles. Fading them across the whole replay left stale prices beside a
    // scale that had already stopped moving.
    const opacity = fadeOut
      ? Math.max(0, 1 - t / (ZOOM_OUT * 0.5))
      : Math.max(0, Math.min(1, (t - ZOOM_OUT * 0.5) / (ZOOM_OUT * 0.7)));
    return { opacity };
  });
  return <AnimatedG animatedProps={props}>{children}</AnimatedG>;
}

/** Both chart kinds reduce to a candle list; a line bar is a flat candle at its close. */
export function toCandles(spec: ChartSpec): Candle[] {
  if (spec.kind === 'candles') {
    return (spec.data as [number, number, number, number][]).map(([o, h, l, c]) => ({
      o,
      h,
      l,
      c,
    }));
  }
  const closes = spec.data as number[];
  return closes.map((close, i) => {
    const open = i === 0 ? close : closes[i - 1];
    return { o: open, h: Math.max(open, close), l: Math.min(open, close), c: close };
  });
}

/**
 * The price domain over the first `count` bars, plus any annotation levels,
 * with a little headroom. Scaling to every bar up front would reserve space
 * exactly where the price is about to go and give a decision away before it is
 * made, so the caller passes only what the learner can see.
 */
export function domainOf(bars: Candle[], spec: ChartSpec, count: number) {
  let min = Infinity;
  let max = -Infinity;
  for (const b of bars.slice(0, Math.max(1, count))) {
    min = Math.min(min, b.l);
    max = Math.max(max, b.h);
  }
  for (const v of (spec.vwap ?? []).slice(0, Math.max(1, count))) {
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  for (const lvl of spec.levels ?? []) {
    min = Math.min(min, lvl.price);
    max = Math.max(max, lvl.price);
  }
  const span = max - min || Math.max(max * 0.01, 0.1);
  return { lo: min - span * 0.1, hi: max + span * 0.12 };
}

export function closeAt(spec: ChartSpec, index: number): number {
  const bars = toCandles(spec);
  return bars[Math.max(0, Math.min(index, bars.length - 1))].c;
}

type Props = {
  spec: ChartSpec;
  /** How many bars are drawn. Playback raises this one bar at a time. */
  visibleCount: number;
  width: number;
  height: number;
  /** Draw the dashed marker at `decision_index`. Off for plain theory visuals. */
  showDecisionMarker?: boolean;
  /**
   * 0 -> 1 draw-on for a line chart (docs/UI.md §6.4). The whole path is drawn
   * and revealed with a dash mask, so the line grows continuously instead of
   * jumping from data point to data point.
   */
  draw?: SharedValue<number>;
  /**
   * Continuous replay after a decision (docs/UI.md §4.3). `progress` runs 0 -> 1
   * across the bars the learner has not seen; the path, its fill, the leading
   * dot and the axis cross-fade are all derived from it on the UI thread, so the
   * whole replay costs zero React renders.
   */
  playback?: SharedValue<number>;
  /**
   * The chart's y on screen. Given it, the price gridlines are snapped onto the
   * backdrop's grid so the two read as one grid instead of two that nearly line
   * up. Line charts without a volume strip only.
   */
  gridAnchor?: number;
};

export const AXIS_W = 44;
export const PAD_LEFT = 6;
const PAD_TOP = 10;
const PAD_BOTTOM = 18; // leaves room for the legend strip under the plot
// The gap and the strip together are one backdrop cell pair, so the line under
// the volume strip lands on the grid as well. Picked as a pair for that reason:
// 16 + 46 left it 6 points off, which is exactly the kind of near-miss that
// reads worse than no grid at all.
const VOLUME_GAP = 16;
const VOLUME_H = CHART_GRID_STEP - VOLUME_GAP;

/**
 * The plot heights that can line up with the backdrop, tallest first, as a
 * count of CHART_GRID_STEP gaps.
 *
 * A gridline only lands on a backdrop line if the gaps between them are whole
 * backdrop cells, and the plot's lines sit at fixed fractions of its height —
 * so the height itself has to be a whole number of gaps. Offering two sizes is
 * what lets a chart stay aligned in a short window instead of falling back to
 * an arbitrary height: it drops from four lines to three rather than from
 * aligned to not.
 */
const PLOT_GAPS = [3, 2];

/** Widest the plot may be against the height of its ink. */
const MAX_PLOT_ASPECT = 2;

/**
 * How wide a chart may be drawn in `available` points.
 *
 * Its height is fixed by the grid, so letting the width follow the container
 * stretches the same eight points across 208 points on a small phone and 348 on
 * a wide one -- the identical chart reading as two different shapes. The plot is
 * capped at twice the height of its ink and the chart is centred in whatever is
 * left, so a chart keeps one shape and simply stops growing.
 */
export function chartWidthFor(available: number, hasVolume: boolean, gaps?: number): number {
  const chosen = gaps ?? (hasVolume ? 2 : 3);
  const ink = chosen * CHART_GRID_STEP + (hasVolume ? VOLUME_GAP + VOLUME_H : 0);
  return Math.min(available, ink * MAX_PLOT_ASPECT + PAD_LEFT + AXIS_W);
}

/** The height a chart needs for a grid-aligned plot, with or without volume. */
export function chartHeightFor(hasVolume: boolean, gaps?: number): number {
  const chosen = gaps ?? (hasVolume ? 2 : 3);
  return (
    PAD_TOP +
    GRID + // slack the snap shifts into; 0-27 points depending on where it sits
    chosen * CHART_GRID_STEP +
    (hasVolume ? VOLUME_GAP + VOLUME_H : 0) +
    PAD_BOTTOM
  );
}

export type ChartLayout = {
  aligns: boolean;
  padTop: number;
  priceH: number;
  plotW: number;
  slot: number;
  bodyW: number;
  volTop: number;
  volH: number;
  /** Number of gaps between price gridlines; there is one more line than gaps. */
  gaps: number;
  y: (price: number) => number;
  priceAt: (y: number) => number;
  cx: (i: number) => number;
};

/**
 * One source for where everything lands, so an overlay drawn on top of a chart
 * cannot disagree with the chart underneath it.
 *
 * `chart-annotate` used to recompute all of this itself, with its own padding
 * and a domain that left out `levels` and `vwap` — so on any chart carrying a
 * marked level, the line the learner placed sat at a different price from the
 * line the reveal drew. `chart-tap` hard-coded the plot's left and right insets
 * as literals. Both now ask here.
 */
export function chartLayout({
  width,
  height,
  bars,
  lo,
  hi,
  hasVolume,
  gridAnchor,
}: {
  width: number;
  height: number;
  bars: number;
  lo: number;
  hi: number;
  hasVolume: boolean;
  gridAnchor?: number;
}): ChartLayout {
  const plotW = width - PAD_LEFT - AXIS_W;
  const volH = hasVolume ? VOLUME_H : 0;
  const fixed = PAD_TOP + PAD_BOTTOM + (hasVolume ? VOLUME_GAP + volH : 0);

  // The tallest grid-locked plot that still fits, leaving GRID for the snap.
  const fitted = PLOT_GAPS.map((g) => g * CHART_GRID_STEP).find(
    (h) => fixed + GRID + h <= height
  );
  const aligns = gridAnchor !== undefined && fitted !== undefined;

  const priceH = aligns ? (fitted as number) : Math.max(GRID, height - fixed);
  // priceH is a whole number of backdrop cells when aligning, so shifting the
  // top by the remainder puts every line on one.
  const padTop = aligns
    ? PAD_TOP + ((GRID - (((gridAnchor as number) + PAD_TOP) % GRID)) % GRID)
    : PAD_TOP;
  const gaps = aligns ? priceH / CHART_GRID_STEP : 3;

  const slot = plotW / Math.max(1, bars);
  const span = hi - lo || 1;

  return {
    aligns,
    padTop,
    priceH,
    plotW,
    slot,
    bodyW: Math.max(3, Math.min(slot * 0.62, 22)),
    volTop: padTop + priceH + VOLUME_GAP,
    volH,
    gaps,
    y: (price: number) => padTop + priceH - ((price - lo) / span) * priceH,
    priceAt: (yPx: number) => lo + ((padTop + priceH - yPx) / priceH) * span,
    cx: (i: number) => PAD_LEFT + slot * (i + 0.5),
  };
}

export default function Chart({
  spec,
  visibleCount,
  width,
  height,
  showDecisionMarker = true,
  draw,
  playback,
  gridAnchor,
}: Props) {
  const bars = useMemo(() => toCandles(spec), [spec]);
  const n = bars.length;
  const shown = Math.max(0, Math.min(visibleCount, n));
  const hasVolume = Array.isArray(spec.volume) && spec.volume.length > 0;

  // The domain is built from the bars the learner can actually see, plus the
  // annotation levels (which are drawn from the start). Scaling to every bar up
  // front would reserve headroom exactly where the price is about to go and give
  // the decision away before it is made. The domain only ever grows, so the axis
  // never snaps back during playback.
  const domainRef = useRef<{ lo: number; hi: number } | null>(null);
  const { lo, hi } = useMemo(() => {
    const next = domainOf(bars, spec, Math.max(1, shown));
    const prev = domainRef.current;
    const merged = prev
      ? { lo: Math.min(prev.lo, next.lo), hi: Math.max(prev.hi, next.hi) }
      : next;
    domainRef.current = merged;
    return merged;
  }, [bars, shown, spec.vwap, spec.levels]);

  // Where the axis ends up once every bar is in. The replay interpolates
  // towards it; it is never used before a decision has been made.
  const full = useMemo(() => {
    const next = domainOf(bars, spec, n);
    return { lo: Math.min(lo, next.lo), hi: Math.max(hi, next.hi) };
  }, [bars, spec.vwap, spec.levels, n, lo, hi]);

  const layout = useMemo(
    () => chartLayout({ width, height, bars: n, lo, hi, hasVolume, gridAnchor }),
    [width, height, n, lo, hi, hasVolume, gridAnchor]
  );
  const { padTop, priceH, plotW, bodyW, volTop, volH, gaps, y, cx } = layout;

  const maxVol = hasVolume ? Math.max(...(spec.volume as number[])) : 1;
  const volY = (v: number) => volTop + volH - (v / maxVol) * volH;

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= gaps; i++) out.push(lo + ((hi - lo) * i) / gaps);
    return out;
  }, [lo, hi, gaps]);

  // The same four lines read against the domain the replay ends on. The lines
  // themselves never move -- they are fixed fractions of the plot height -- so
  // only these labels change, and they cross-fade rather than re-render.
  const fullTicks = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= gaps; i++)
      out.push(full.lo + ((full.hi - full.lo) * i) / gaps);
    return out;
  }, [full.lo, full.hi, gaps]);

  const playGeom = useMemo<PlayGeom | null>(() => {
    if (!playback || shown < 1) return null;
    return {
      xs: bars.map((_, i) => cx(i)),
      closes: bars.map((b) => b.c),
      opens: bars.map((b) => b.o),
      highs: bars.map((b) => b.h),
      lows: bars.map((b) => b.l),
      from: shown,
      n,
      padTop,
      priceH,
      baseline: padTop + priceH,
      lo0: lo,
      hi0: hi,
      lo1: full.lo,
      hi1: full.hi,
    };
  }, [playback, spec.kind, bars, n, shown, layout, lo, hi, full.lo, full.hi]);

  const linePath = useMemo(() => {
    if (spec.kind !== 'line' || shown === 0) return '';
    return bars
      .slice(0, shown)
      .map((b, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(2)},${y(b.c).toFixed(2)}`)
      .join(' ');
  }, [spec.kind, shown, bars, lo, hi, layout]);

  const linePathLength = useMemo(() => {
    if (spec.kind !== 'line' || shown < 2) return 0;
    let total = 0;
    for (let i = 1; i < shown; i++) {
      const dx = cx(i) - cx(i - 1);
      const dy = y(bars[i].c) - y(bars[i - 1].c);
      total += Math.hypot(dx, dy);
    }
    return total;
  }, [spec.kind, shown, bars, lo, hi, layout]);

  const lineFill = useMemo(() => {
    if (!linePath) return '';
    const last = cx(shown - 1);
    const first = cx(0);
    const base = padTop + priceH;
    return `${linePath} L${last.toFixed(2)},${base.toFixed(2)} L${first.toFixed(
      2
    )},${base.toFixed(2)} Z`;
  }, [linePath, shown, layout]);

  const vwapPath = useMemo(() => {
    const vwap = spec.vwap;
    if (!vwap || shown === 0) return '';
    return vwap
      .slice(0, shown)
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(2)},${y(v).toFixed(2)}`)
      .join(' ');
  }, [spec.vwap, shown, lo, hi, layout]);

  // A line chart decides *at* its last visible point, so the marker sits on it.
  // A candle has width, so the marker clears the body by a hair instead of
  // cutting through it -- but stays attached to the bar, not half a slot away.
  const decisionX =
    spec.kind === 'line'
      ? cx(spec.decision_index)
      : cx(spec.decision_index) + bodyW / 2 + 3;
  const lastVisible = shown > 0 ? bars[shown - 1] : null;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.28" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* price gridlines + right-hand axis (docs/UI.md §6.4) */}
        <G>
          {ticks.map((t, i) => (
            <Line
              key={`tl${i}`}
              x1={PAD_LEFT}
              x2={PAD_LEFT + plotW}
              y1={y(t)}
              y2={y(t)}
              stroke={colors.border}
              strokeWidth={1}
            />
          ))}
        </G>

        {playGeom && playback ? (
          <G>
            <PlaybackAxis progress={playback} fadeOut>
              {ticks.map((t, i) => (
                <SvgText
                  key={`ao${i}`}
                  x={width - AXIS_W + 6}
                  y={y(t) + 4}
                  fill={colors.textFaint}
                  fontSize={11}
                >
                  {axisPrice(t)}
                </SvgText>
              ))}
            </PlaybackAxis>
            <PlaybackAxis progress={playback} fadeOut={false}>
              {fullTicks.map((t, i) => (
                <SvgText
                  key={`an${i}`}
                  x={width - AXIS_W + 6}
                  y={y(ticks[i]) + 4}
                  fill={colors.textFaint}
                  fontSize={11}
                >
                  {axisPrice(t)}
                </SvgText>
              ))}
            </PlaybackAxis>
          </G>
        ) : (
          <G>
            {ticks.map((t, i) => (
              <SvgText
                key={`a${i}`}
                x={width - AXIS_W + 6}
                y={y(t) + 4}
                fill={colors.textFaint}
                fontSize={11}
              >
                {axisPrice(t)}
              </SvgText>
            ))}
          </G>
        )}

        {/* annotation levels */}
        {(spec.levels ?? []).map((lvl, i) => (
          <G key={`lvl${i}`}>
            <Line
              x1={PAD_LEFT}
              x2={PAD_LEFT + plotW}
              y1={y(lvl.price)}
              y2={y(lvl.price)}
              stroke={colors.warning}
              strokeWidth={1.25}
              strokeDasharray="5 4"
              opacity={0.85}
            />
            {lvl.label ? (
              <SvgText
                x={PAD_LEFT + 4}
                y={y(lvl.price) - 5}
                fill={colors.warning}
                fontSize={10}
                fontWeight="600"
              >
                {`${lvl.label} ${axisPrice(lvl.price)}`}
              </SvgText>
            ) : null}
          </G>
        ))}

        {/* VWAP overlay */}
        {vwapPath ? (
          <Path
            d={vwapPath}
            stroke={colors.accent}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
            opacity={0.9}
          />
        ) : null}

        {/* bars */}
        {spec.kind === 'line' && playGeom && playback ? (
          <PlaybackLine g={playGeom} progress={playback} />
        ) : spec.kind === 'line' ? (
          <G>
            {lineFill ? (
              draw ? (
                // The fill covers the whole plot from the first frame, so it
                // cannot fade in alongside the stroke -- it would sit out to the
                // right of a line that has not arrived yet. It follows instead.
                <AnimatedFill d={lineFill} draw={draw} />
              ) : (
                <Path d={lineFill} fill="url(#lineFill)" />
              )
            ) : null}
            {linePath ? (
              draw && linePathLength > 0 ? (
                <AnimatedStroke d={linePath} length={linePathLength} draw={draw} />
              ) : (
                <Path
                  d={linePath}
                  stroke={colors.accent}
                  strokeWidth={2.25}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )
            ) : null}
            {lastVisible ? (
              draw ? (
                <AnimatedDot
                  cx={cx(shown - 1)}
                  cy={y(lastVisible.c)}
                  draw={draw}
                />
              ) : (
                <Circle
                  cx={cx(shown - 1)}
                  cy={y(lastVisible.c)}
                  r={4}
                  fill={colors.accent}
                  stroke={colors.background}
                  strokeWidth={2}
                />
              )
            ) : null}
          </G>
        ) : playGeom && playback ? (
          <G>
            {bars.map((b, i) => (
              <PlaybackCandle
                key={`pc${i}`}
                g={playGeom}
                i={i}
                bar={b}
                bodyW={bodyW}
                progress={playback}
              />
            ))}
          </G>
        ) : (
          <G>
            {bars.slice(0, shown).map((b, i) => {
              const upBar = b.c >= b.o;
              const stroke = upBar ? colors.up : colors.down;
              const top = y(Math.max(b.o, b.c));
              const bottom = y(Math.min(b.o, b.c));
              return (
                <G key={`c${i}`}>
                  <Line
                    x1={cx(i)}
                    x2={cx(i)}
                    y1={y(b.h)}
                    y2={y(b.l)}
                    stroke={stroke}
                    strokeWidth={1.25}
                  />
                  <Rect
                    x={cx(i) - bodyW / 2}
                    y={top}
                    width={bodyW}
                    height={Math.max(1.5, bottom - top)}
                    fill={upBar ? stroke : colors.background}
                    stroke={stroke}
                    strokeWidth={1.25}
                    rx={1}
                  />
                </G>
              );
            })}
          </G>
        )}

        {/* volume strip */}
        {hasVolume
          ? (spec.volume as number[])
              .slice(0, playGeom && playback ? n : shown)
              .map((v, i) => {
                const b = bars[i];
                const upBar = b.c >= b.o;
                const fill = upBar ? colors.up : colors.down;
                const barY = volY(v);
                const barH = Math.max(1, volTop + volH - barY);
                return playGeom && playback ? (
                  <PlaybackVolumeBar
                    key={`v${i}`}
                    g={playGeom}
                    i={i}
                    x={cx(i) - bodyW / 2}
                    y={barY}
                    width={bodyW}
                    height={barH}
                    fill={fill}
                    progress={playback}
                  />
                ) : (
                  <Rect
                    key={`v${i}`}
                    x={cx(i) - bodyW / 2}
                    y={barY}
                    width={bodyW}
                    height={barH}
                    fill={fill}
                    opacity={0.45}
                    rx={1}
                  />
                );
              })
          : null}
        {hasVolume ? (
          <Line
            x1={PAD_LEFT}
            x2={PAD_LEFT + plotW}
            y1={volTop + volH}
            y2={volTop + volH}
            stroke={colors.border}
            strokeWidth={1}
          />
        ) : null}
        {hasVolume ? (
          <SvgText
            x={width - AXIS_W + 6}
            y={volTop + volH}
            fill={colors.textFaint}
            fontSize={9}
          >
            {`vol ${fmtVolume(maxVol)}`}
          </SvgText>
        ) : null}

        {/* decision marker */}
        {showDecisionMarker ? (
          <G>
            <Line
              x1={decisionX}
              x2={decisionX}
              y1={padTop}
              y2={padTop + priceH + (hasVolume ? VOLUME_GAP + volH : 0)}
              stroke={colors.textMuted}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            <Circle
              cx={decisionX}
              cy={padTop + 1}
              r={3}
              fill={colors.textMuted}
            />
          </G>
        ) : null}
      </Svg>

      {showDecisionMarker ? (
        <View
          style={[
            styles.decisionTag,
            { left: Math.max(0, decisionX - 26), top: Math.max(0, padTop - 15) },
          ]}
        >
          <Text style={styles.decisionTagText}>
            {shown > spec.decision_index + 1 ? 'decision' : 'you are here'}
          </Text>
        </View>
      ) : null}

      {spec.vwap ? (
        <View style={styles.legend}>
          <View style={styles.legendSwatch} />
          <Text style={styles.legendText}>VWAP</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decisionTag: {
    pointerEvents: 'none',
    position: 'absolute',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  decisionTagText: {
    ...type.small,
    fontSize: 10,
    color: colors.textMuted,
  },
  // The VWAP overlay is labelled beside the chart, not on it: at 8-12 bars there
  // is no position inside the plot that clears the candles at every scenario.
  legend: {
    pointerEvents: 'none',
    position: 'absolute',
    bottom: 0,
    left: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 14,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  legendText: { ...type.small, fontSize: 10, color: colors.accent },
});
