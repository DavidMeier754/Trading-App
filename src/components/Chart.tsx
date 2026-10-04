import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
import { floorSpan } from './chartScale';
import ChartScrub from './ChartScrub';
import { type ChartMove, startChartMove } from '../lesson/haptics';
import { tint, useLookSpec } from '../lesson/look';
import { Arrive } from '../lesson/Celebrate';
import { DURATION, EASE_OUT_SETTLE } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { BUILD_MS, BuildCandle, buildStagger, BuildVolume, useEntrance } from './ChartBuild';
import { CHART_GRID_STEP, colors, GRID, type, themed } from '../theme';
import type { ChartNote, ChartSpec } from '../types';
import type { TradePlan } from '../lesson/tradePlan';
import { EASE_OUT } from '../lesson/motion';
import {
  ChartNotes,
  HaloText,
  labelBox,
  type LabelBox,
  levelLabelText,
  PlanLines,
  planLabels,
  placeLevelLabels,
  placeNotes,
  RULER_W,
  RulerResult,
  RulerScale,
  SessionOpen,
} from './ChartPlan';

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
  neo = false,
  width = LINE_W,
}: {
  d: string;
  length: number;
  draw: SharedValue<number>;
  neo?: boolean;
  width?: number;
}) {
  const lineColor = useLookSpec().chartLine;
  const props = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - draw.get()),
  }));
  const glow = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - draw.get()),
  }));
  return (
    <G>
      {neo ? (
        <AnimatedPath
          d={d}
          stroke={lineColor}
          strokeWidth={GLOW_W + (width - LINE_W) * 2}
          strokeOpacity={GLOW_OPACITY}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${length} ${length}`}
          animatedProps={glow}
        />
      ) : null}
      <AnimatedPath
        d={d}
        stroke={lineColor}
        strokeWidth={width}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={`${length} ${length}`}
        animatedProps={props}
      />
    </G>
  );
}

/**
 * The experimental look's neon: a wide, faint copy of the line under it, which
 * reads as the line glowing on the dark ground. Two strokes, no filter -- an
 * SVG blur is the one effect react-native-svg renders differently everywhere.
 */
const GLOW_W = 8;
/** The price line's weight, and its weight where the chart is the lesson. */
const LINE_W = 2.25;
const LINE_W_EMPHASIS = 3;
const GLOW_OPACITY = 0.2;

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
  halo = false,
}: {
  cx: number;
  cy: number;
  draw: SharedValue<number>;
  /** The neon look's soft ring round the pen. */
  halo?: boolean;
}) {
  const lineColor = useLookSpec().chartLine;
  const props = useAnimatedProps(() => ({
    opacity: draw.get() > 0.92 ? (draw.get() - 0.92) / 0.08 : 0,
  }));
  return (
    <AnimatedG animatedProps={props}>
      {halo ? <Circle cx={cx} cy={cy} r={10} fill={lineColor} opacity={0.22} /> : null}
      <Circle cx={cx} cy={cy} r={4} fill={lineColor} stroke={colors.background} strokeWidth={2} />
    </AnimatedG>
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
  /** The frame at the decision: the visible bars, filling the plot. */
  tlo: number;
  thi: number;
  /** The frame the replay plays in: as tall as the finished session needs,
   *  centred where the decision frame was. */
  lo0: number;
  hi0: number;
  /** The frame it ends on: every bar, filling the plot. */
  lo1: number;
  hi1: number;
  /** Running extremes over bars 0..i, so the window can follow the data. */
  runHi: number[];
  runLo: number[];
  /**
   * The frame holds still from the first frame to the last (David,
   * 2026-10-03; docs/UI.md §6.4): lo0..hi0 already covers every bar to come,
   * centred on the bars the learner can see, so nothing rescales or slides.
   */
  fixed: boolean;
};

/**
 * The price window at replay position `t`, which runs from -1 to 1.
 *
 * A decision chart is framed three ways, and the price is never rescaled while
 * it moves:
 *
 * 1. **Deciding** (t = -1, and the static chart before the tap): the visible
 *    bars fill the plot. Nothing on screen says where the price goes next, so
 *    the frame can be as tight as the bars allow, and the candles are tall.
 * 2. **Pulling back** (-1 < t < 0): the moment the call is made, the frame
 *    grows -- evenly above and below, so it still says nothing about which way
 *    -- to exactly the height the whole session will need. The bars shrink
 *    into it before anything new is drawn: a camera stepping back, not a
 *    chart squashing a move that is under way.
 * 3. **Playing** (0 <= t <= 1): the height stays; the frame only slides, and
 *    only as far as the revealed bars require. At t = 1 it sits exactly on the
 *    finished session, every bar filling the plot, which is the static frame
 *    the chart settles into.
 *
 * The first version reserved 2.5x the room up front instead, before the
 * decision -- which was the same on every chart, so it gave nothing away, but
 * left the bars the learner had to judge squeezed into the middle third.
 */
function windowAt(g: PlayGeom, t: number) {
  'worklet';
  if (g.fixed) return { lo: g.lo0, hi: g.hi0 };
  if (t < 0) {
    const u = t + 1;
    return { lo: g.tlo + (g.lo0 - g.tlo) * u, hi: g.thi + (g.hi0 - g.thi) * u };
  }
  const span = g.hi0 - g.lo0;
  const head = g.from - 1 + Math.max(0, t) * (g.n - g.from);
  const i = Math.max(0, Math.min(g.n - 1, Math.floor(head)));
  const j = Math.min(g.n - 1, i + 1);
  const f = Math.max(0, Math.min(1, head - i));
  const needHi = g.runHi[i] + (g.runHi[j] - g.runHi[i]) * f;
  const needLo = g.runLo[i] + (g.runLo[j] - g.runLo[i]) * f;
  const reach = needHi - needLo || 1;
  let lo = g.lo0;
  let hi = g.hi0;
  // The same padding domainOf uses, so t=1 lands exactly on the static frame.
  if (needHi + reach * 0.12 > hi) {
    hi = needHi + reach * 0.12;
    lo = hi - span;
  }
  if (needLo - reach * 0.1 < lo) {
    lo = needLo - reach * 0.1;
    hi = lo + span;
  }
  return { lo, hi };
}

/** Where the replay's progress starts: the decision frame, before the pull-back. */
export const PLAY_START = -1;

/** Price -> y at replay position `t`. */
function playY(g: PlayGeom, t: number, price: number) {
  'worklet';
  const w = windowAt(g, t);
  return g.padTop + g.priceH - ((price - w.lo) / (w.hi - w.lo)) * g.priceH;
}

/** The fractional index of the leading edge: from-1 at t=0, n-1 at t=1. */
function playHead(g: PlayGeom, t: number) {
  'worklet';
  // Nothing new is drawn while the frame is still pulling back (t < 0).
  return g.from - 1 + Math.max(0, t) * (g.n - g.from);
}

/**
 * How far through its own time bar `i` is at replay position `t`: 0 before
 * the playhead reaches it, 1 once it has closed, and in between while it forms.
 * Bars the learner could already see are at 1 from the start.
 */
function barProgress(g: PlayGeom, t: number, i: number) {
  'worklet';
  const head = g.from - 1 + Math.max(0, t) * (g.n - g.from);
  return Math.max(0, Math.min(1, head - (i - 1)));
}

function smooth(x: number) {
  'worklet';
  const k = Math.max(0, Math.min(1, x));
  return k * k * (3 - 2 * k);
}

/** Where a forming candle's path turns: the first extreme, then the second. */
const LEG_A = 0.3;
const LEG_B = 0.74;

/**
 * A candle `u` of the way through its time: the price, and the highest and
 * lowest it has been so far.
 *
 * It travels open, then the extreme on the far side of where it will close,
 * then the other extreme, then its close -- the order a market draws a candle
 * of that shape in: an up bar dips first and rallies, a down bar pops first
 * and sells off. So the body grows and shrinks and can change colour while it
 * forms, the wicks reach out as the extremes are set, and it comes to rest as
 * the bar it is in the data.
 */
function formAt(o: number, h: number, l: number, c: number, u: number) {
  'worklet';
  const up = c >= o;
  const a = up ? l : h;
  const b = up ? h : l;
  let p;
  if (u <= LEG_A) p = o + (a - o) * smooth(u / LEG_A);
  else if (u <= LEG_B) p = a + (b - a) * smooth((u - LEG_A) / (LEG_B - LEG_A));
  else p = b + (c - b) * smooth((u - LEG_B) / (1 - LEG_B));
  let hi = Math.max(o, p);
  let lo = Math.min(o, p);
  if (u > LEG_A) {
    hi = Math.max(hi, a);
    lo = Math.min(lo, a);
  }
  if (u > LEG_B) {
    hi = Math.max(hi, b);
    lo = Math.min(lo, b);
  }
  return { p, hi, lo };
}

/** The live price at replay position `t`, and whether its bar is up so far. */
function liveAt(g: PlayGeom, t: number) {
  'worklet';
  const head = g.from - 1 + Math.max(0, t) * (g.n - g.from);
  const k = Math.floor(head);
  const u = head - k;
  if (u < 1e-6 || k + 1 >= g.n) {
    const j = Math.max(0, Math.min(g.n - 1, k));
    return { p: g.closes[j], up: g.closes[j] >= g.opens[j] };
  }
  const i = k + 1;
  const s = formAt(g.opens[i], g.highs[i], g.lows[i], g.closes[i], u);
  return { p: s.p, up: s.p >= g.opens[i] };
}

/**
 * playY without the worklet directive, for the first frame.
 * Animated props are applied after the first commit, and a native SVG view wants
 * a real number from the start — the same reason `playLineAt` exists below.
 */
function playYAt(g: PlayGeom, t: number, price: number) {
  const w = windowAt(g, t);
  return g.padTop + g.priceH - ((price - w.lo) / (w.hi - w.lo)) * g.priceH;
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
  const head = g.from - 1 + Math.max(0, t) * (g.n - g.from);
  const whole = Math.floor(head);
  const frac = head - whole;
  const yOf = (price: number) => playYAt(g, t, price);
  if (frac <= 0.0001 || whole + 1 >= g.n) {
    const i = Math.min(whole, g.n - 1);
    return { x: g.xs[i], y: yOf(g.closes[i]) };
  }
  const price = g.closes[whole] + (g.closes[whole + 1] - g.closes[whole]) * frac;
  return { x: g.xs[whole] + (g.xs[whole + 1] - g.xs[whole]) * frac, y: yOf(price) };
}

function playLineAt(g: PlayGeom, t: number) {
  const head = g.from - 1 + Math.max(0, t) * (g.n - g.from);
  const whole = Math.floor(head);
  const yOf = (price: number) => playYAt(g, t, price);
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
  neo,
}: {
  g: PlayGeom;
  progress: SharedValue<number>;
  /** The experimental look: a glow under the line and a halo round the pen. */
  neo: boolean;
}) {
  const lineColor = useLookSpec().chartLine;
  const glow = useAnimatedProps(() => ({ d: playLine(g, progress.get()) }));
  const halo = useAnimatedProps(() => {
    const tip = playHeadPoint(g, progress.get());
    return { cx: tip.x, cy: tip.y };
  });
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

  const first = playLineAt(g, PLAY_START);
  const firstTip = playHeadPointAt(g, PLAY_START);

  return (
    <G>
      <AnimatedPath
        d={`${first} L${firstTip.x.toFixed(2)},${g.baseline.toFixed(2)} L${g.xs[0].toFixed(
          2,
        )},${g.baseline.toFixed(2)} Z`}
        animatedProps={fill}
        fill="url(#lineFill)"
      />
      {neo ? (
        <AnimatedPath
          d={first}
          animatedProps={glow}
          stroke={lineColor}
          strokeWidth={GLOW_W}
          strokeOpacity={GLOW_OPACITY}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
      {neo ? (
        <AnimatedCircle
          cx={firstTip.x}
          cy={firstTip.y}
          animatedProps={halo}
          r={10}
          fill={lineColor}
          opacity={0.25}
        />
      ) : null}
      <AnimatedPath
        d={first}
        animatedProps={stroke}
        stroke={lineColor}
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
        fill={lineColor}
        stroke={colors.background}
        strokeWidth={2}
      />
    </G>
  );
}

/**
 * One candle during the replay.
 *
 * A bar the learner could already see is simply drawn, riding the frame as it
 * pulls back and slides. A bar still to come is not faded in -- it *forms*:
 * from the moment the playhead reaches its slot it opens as a hairline at its
 * open, then its body and wicks follow the price along formAt's path, taking
 * the colour of wherever the price is against the open, until it settles into
 * the candle in the data as the playhead leaves. That is how a candle is born
 * on a live chart, and it is the part of the replay worth watching.
 *
 * The two colours are two drawings of the same candle, one shown at a time,
 * rather than one drawing whose colour is animated: a colour set from the UI
 * thread does not reach an SVG shape on every platform, an opacity does.
 *
 * Every bar of the series is mounted from the start -- the future ones sit
 * invisible -- so the replay never mounts a view mid-flight, and all of it is
 * worked out on the UI thread from the one progress value.
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
  const shown0 = i < g.from;

  // Where the candle is at replay position t: its wick ends, its body's two
  // edges and whether it is above its open, or null before it has begun.
  const state = (t: number) => {
    'worklet';
    const u = barProgress(g, t, i);
    if (u <= 0) return null;
    const s =
      u >= 1
        ? { p: g.closes[i], hi: g.highs[i], lo: g.lows[i] }
        : formAt(g.opens[i], g.highs[i], g.lows[i], g.closes[i], u);
    const yo = playY(g, t, g.opens[i]);
    const yp = playY(g, t, s.p);
    return {
      y1: playY(g, t, s.hi),
      y2: playY(g, t, s.lo),
      top: Math.min(yo, yp),
      height: Math.max(1.5, Math.abs(yp - yo)),
      rising: s.p >= g.opens[i],
    };
  };
  const wick = (t: number, rising: boolean) => {
    'worklet';
    const k = state(t);
    if (!k) return { y1: 0, y2: 0, opacity: 0 };
    return { y1: k.y1, y2: k.y2, opacity: k.rising === rising ? 1 : 0 };
  };
  const body = (t: number, rising: boolean) => {
    'worklet';
    const k = state(t);
    if (!k) return { y: 0, height: 1.5, opacity: 0 };
    return { y: k.top, height: k.height, opacity: k.rising === rising ? 1 : 0 };
  };
  // Each reads `progress` itself: an animated-props worklet only re-runs for a
  // shared value it reads directly, not for one read inside a helper it calls.
  const wickUp = useAnimatedProps(() => wick(progress.get(), true));
  const wickDown = useAnimatedProps(() => wick(progress.get(), false));
  const bodyUp = useAnimatedProps(() => body(progress.get(), true));
  const bodyDown = useAnimatedProps(() => body(progress.get(), false));

  const top0 = playYAt(g, PLAY_START, Math.max(bar.o, bar.c));
  const bottom0 = playYAt(g, PLAY_START, Math.min(bar.o, bar.c));
  const layer = (rising: boolean) => {
    const color = rising ? colors.up : colors.down;
    const visible = shown0 && up === rising ? 1 : 0;
    return (
      <G key={rising ? 'up' : 'down'}>
        <AnimatedLine
          x1={g.xs[i]}
          x2={g.xs[i]}
          y1={playYAt(g, PLAY_START, bar.h)}
          y2={playYAt(g, PLAY_START, bar.l)}
          opacity={visible}
          stroke={color}
          strokeWidth={1.25}
          animatedProps={rising ? wickUp : wickDown}
        />
        <AnimatedRect
          x={g.xs[i] - bodyW / 2}
          y={top0}
          width={bodyW}
          height={Math.max(1.5, bottom0 - top0)}
          opacity={visible}
          fill={rising ? color : colors.background}
          stroke={color}
          strokeWidth={1.25}
          rx={1}
          animatedProps={rising ? bodyUp : bodyDown}
        />
      </G>
    );
  };

  // A bar that was already on the chart keeps its colour, so it needs only the
  // one drawing; a bar still to come can change colour as it forms.
  return <G>{shown0 ? layer(up) : [layer(false), layer(true)]}</G>;
}

/**
 * A volume bar during the replay. A bar still to come fills up while its
 * candle forms -- volume is what trades during the bar -- in the colour the
 * candle has so far, so it never tells the close before the candle does.
 */
function PlaybackVolumeBar({
  g,
  i,
  x,
  y,
  width,
  height,
  progress,
}: {
  g: PlayGeom;
  i: number;
  x: number;
  y: number;
  width: number;
  height: number;
  progress: SharedValue<number>;
}) {
  const floor = y + height;
  const shown0 = i < g.from;
  const up = g.closes[i] >= g.opens[i];
  const fillFor = (t: number, rising: boolean) => {
    'worklet';
    const u = barProgress(g, t, i);
    if (u <= 0) return { y: floor - 1, height: 1, opacity: 0 };
    const h = Math.max(1, height * u);
    const p = u >= 1 ? g.closes[i] : formAt(g.opens[i], g.highs[i], g.lows[i], g.closes[i], u).p;
    return { y: floor - h, height: h, opacity: p >= g.opens[i] === rising ? 0.45 : 0 };
  };
  const upProps = useAnimatedProps(() => fillFor(progress.get(), true));
  const downProps = useAnimatedProps(() => fillFor(progress.get(), false));
  return (
    <G>
      {(shown0 ? [up] : [false, true]).map((rising) => (
        <AnimatedRect
          key={rising ? 'up' : 'down'}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={1}
          fill={rising ? colors.up : colors.down}
          opacity={shown0 && up === rising ? 0.45 : 0}
          animatedProps={rising ? upProps : downProps}
        />
      ))}
    </G>
  );
}

/**
 * The last price, while a candle replay plays: a fine line across the plot at
 * wherever the price is right now, ending in a lit point at the plot's edge in
 * the colour of the forming bar. It is what a live chart shows beside a candle
 * being made, and it carries the eye along the price between one candle and
 * the next. Worked out per frame on the UI thread.
 */
function PlaybackLivePrice({
  g,
  progress,
  x0,
  x1,
}: {
  g: PlayGeom;
  progress: SharedValue<number>;
  x0: number;
  x1: number;
}) {
  const visible = (t: number) => {
    'worklet';
    if (t <= 0 || t >= 1) return 0;
    return Math.min(1, t / 0.03) * Math.min(1, (1 - t) / 0.03);
  };
  const line = useAnimatedProps(() => {
    const t = progress.get();
    const yy = playY(g, t, liveAt(g, t).p);
    return { y1: yy, y2: yy, opacity: 0.55 * visible(t) };
  });
  const point = (t: number, rising: boolean, alpha: number) => {
    'worklet';
    const live = liveAt(g, t);
    return { cy: playY(g, t, live.p), opacity: live.up === rising ? alpha * visible(t) : 0 };
  };
  const dotUp = useAnimatedProps(() => point(progress.get(), true, 1));
  const dotDown = useAnimatedProps(() => point(progress.get(), false, 1));
  const haloUp = useAnimatedProps(() => point(progress.get(), true, 0.22));
  const haloDown = useAnimatedProps(() => point(progress.get(), false, 0.22));

  return (
    <G>
      <AnimatedLine
        x1={x0}
        x2={x1}
        y1={0}
        y2={0}
        stroke={colors.textMuted}
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0}
        animatedProps={line}
      />
      <AnimatedCircle cx={x1} cy={0} r={8} fill={colors.up} opacity={0} animatedProps={haloUp} />
      <AnimatedCircle
        cx={x1}
        cy={0}
        r={8}
        fill={colors.down}
        opacity={0}
        animatedProps={haloDown}
      />
      <AnimatedCircle cx={x1} cy={0} r={3.5} fill={colors.up} opacity={0} animatedProps={dotUp} />
      <AnimatedCircle
        cx={x1}
        cy={0}
        r={3.5}
        fill={colors.down}
        opacity={0}
        animatedProps={dotDown}
      />
    </G>
  );
}

/**
 * The R ruler while the trade plays out (docs/UI.md §6.4): a bar from 0 to
 * wherever the price is now, in R, up or down from the entry and held between
 * the stop and the target, with a lit point at its end. Worked out per frame
 * on the UI thread, like the live price.
 */
function PlaybackRuler({
  g,
  progress,
  plan,
  x,
  faint,
}: {
  g: PlayGeom;
  progress: SharedValue<number>;
  plan: TradePlan;
  x: number;
  faint: boolean;
}) {
  const { entry, stop, target } = plan;
  const lo = Math.min(stop, target);
  const hi = Math.max(stop, target);
  const alpha = faint ? 0.5 : 1;
  const bar = (t: number, rising: boolean) => {
    'worklet';
    const live = Math.min(hi, Math.max(lo, liveAt(g, t).p));
    const y0 = playY(g, t, entry);
    const y1 = playY(g, t, live);
    const gaining = (live - entry) * plan.dir >= 0;
    const on = t > 0 && t < 1 && gaining === rising;
    return { y: Math.min(y0, y1), height: Math.max(1, Math.abs(y1 - y0)), opacity: on ? alpha : 0 };
  };
  const tip = (t: number) => {
    'worklet';
    const live = Math.min(hi, Math.max(lo, liveAt(g, t).p));
    return { cy: playY(g, t, live), opacity: t > 0 && t < 1 ? alpha : 0 };
  };
  const upProps = useAnimatedProps(() => bar(progress.get(), true));
  const downProps = useAnimatedProps(() => bar(progress.get(), false));
  const tipProps = useAnimatedProps(() => tip(progress.get()));
  return (
    <G>
      <AnimatedRect
        x={x - 3}
        y={0}
        width={6}
        height={1}
        rx={3}
        fill={colors.up}
        opacity={0}
        animatedProps={upProps}
      />
      <AnimatedRect
        x={x - 3}
        y={0}
        width={6}
        height={1}
        rx={3}
        fill={colors.down}
        opacity={0}
        animatedProps={downProps}
      />
      <AnimatedCircle cx={x} cy={0} r={5} fill={colors.text} opacity={0} animatedProps={tipProps} />
    </G>
  );
}

/** A shared value that eases to 1 when `on` turns on (at once under reduced motion). */
function useShowing(on: boolean, ms: number): SharedValue<number> {
  const reduced = useReduceMotion();
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.set(reduced ? (on ? 1 : 0) : withTiming(on ? 1 : 0, { duration: ms, easing: EASE_OUT }));
  }, [on, reduced, ms, v]);
  return v;
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
    // The labels belong to the frame, so they follow it: the decision's set
    // leaves in the first half of the pull-back, and the finished session's
    // set arrives as the frame comes to rest on it. In between the frame is
    // moving and any printed price would be a stale one.
    const opacity = fadeOut
      ? Math.max(0, Math.min(1, (-0.5 - t) / 0.5))
      : Math.max(0, Math.min(1, (t - 0.85) / 0.15));
    return { opacity };
  });
  return <AnimatedG animatedProps={props}>{children}</AnimatedG>;
}

/** The outcome tag's height: two short lines. */
const OUTCOME_TAG_H = 40;
/** Roughly how wide the outcome tag's words draw, per character. */
const OUTCOME_CHAR_W = 7.6;

/** How long after mount a chart starts building: the screen is still fading in. */
const ENTRY_DELAY = 160;
/** Levels, VWAP and the markers, once the bars are in. */
const OVERLAY_MS = 520;

/** A marked level, ruled in from the left edge. Its label is drawn over the bars (LevelLabel). */
function DrawnLevel({
  x1,
  x2,
  y,
  enter,
}: {
  x1: number;
  x2: number;
  y: number;
  enter: SharedValue<number>;
}) {
  const line = useAnimatedProps(() => ({ x2: x1 + (x2 - x1) * enter.get() }));
  return (
    <AnimatedLine
      x1={x1}
      x2={x2}
      y1={y}
      y2={y}
      stroke={colors.warning}
      strokeWidth={1.25}
      strokeDasharray="5 4"
      opacity={0.85}
      animatedProps={line}
    />
  );
}

/** A level's label, on top of the bars so none of them covers it; it follows the pen. */
function LevelLabel({
  x,
  y,
  anchor,
  label,
  enter,
}: {
  x: number;
  y: number;
  anchor: 'start' | 'end';
  label: string;
  enter: SharedValue<number>;
}) {
  const text = useAnimatedProps(() => ({ opacity: Math.max(0, (enter.get() - 0.35) / 0.65) }));
  return (
    <AnimatedG animatedProps={text}>
      <HaloText
        x={x}
        y={y}
        textAnchor={anchor}
        fill={colors.warning}
        fontSize={13}
        fontWeight="600"
      >
        {label}
      </HaloText>
    </AnimatedG>
  );
}

/** The part of a decision chart the replay will fill. */
type Zone = { x0: number; x1: number; y0: number; y1: number; midY: number; label: string };

/** Diagonal hatching clipped to the zone by hand -- no clip path, which some
 *  react-native-svg renderers drop. */
function hatchPath({ x0, x1, y0, y1 }: Zone, step = 9): string {
  let d = '';
  for (let c = x0 - y1; c < x1 - y0; c += step) {
    // The line x = y + c, from where it enters the zone to where it leaves.
    const ya = Math.max(y0, x0 - c);
    const yb = Math.min(y1, x1 - c);
    if (yb - ya < 1) continue;
    d += `M${(ya + c).toFixed(1)},${ya.toFixed(1)} L${(yb + c).toFixed(1)},${yb.toFixed(1)} `;
  }
  return d;
}

/**
 * How wide the zone's pill is: its label in 13 pt bold capitals, letter-spaced,
 * and a little room each side. The level labels keep off it (levelLabels).
 */
export function zonePillWidth(label: string): number {
  return label.length * 8.4 + 14;
}

function FutureZone({ zone }: { zone: Zone }) {
  const w = zone.x1 - zone.x0;
  if (w < 12) return null;
  const labelW = zonePillWidth(zone.label);
  const cx = (zone.x0 + zone.x1) / 2;
  return (
    <G>
      <Rect
        x={zone.x0}
        y={zone.y0}
        width={w}
        height={zone.y1 - zone.y0}
        rx={3}
        fill={colors.text}
        opacity={0.025}
      />
      <Path d={hatchPath(zone)} stroke={colors.text} strokeOpacity={0.055} strokeWidth={1} />
      {zone.label && w >= labelW + 8 ? (
        <G>
          <Rect
            x={cx - labelW / 2}
            y={zone.midY - 9}
            width={labelW}
            height={18}
            rx={9}
            fill={colors.background}
            opacity={0.85}
          />
          <SvgText
            x={cx}
            y={zone.midY + 3.5}
            fill={colors.textFaint}
            fontSize={13}
            fontWeight="700"
            letterSpacing={0.8}
            textAnchor="middle"
          >
            {zone.label.toUpperCase()}
          </SvgText>
        </G>
      ) : null}
    </G>
  );
}

/**
 * The zone during the replay: the shade draws back from the left as each bar
 * lands in it, and the hatching and its label clear out of the way as the
 * first bar leaves the decision.
 */
function PlaybackFuture({
  g,
  progress,
  zone,
  slot,
}: {
  g: PlayGeom;
  progress: SharedValue<number>;
  zone: Zone;
  slot: number;
}) {
  const shade = useAnimatedProps(() => {
    const head = playHead(g, progress.get());
    const x = Math.min(zone.x1, Math.max(zone.x0, PAD_LEFT + slot * (head + 1)));
    return { x, width: Math.max(0, zone.x1 - x) };
  });
  const marks = useAnimatedProps(() => ({ opacity: Math.max(0, 1 - progress.get() * 6) }));
  return (
    <G>
      <AnimatedRect
        x={zone.x0}
        y={zone.y0}
        width={zone.x1 - zone.x0}
        height={zone.y1 - zone.y0}
        rx={3}
        fill={colors.text}
        opacity={0.025}
        animatedProps={shade}
      />
      <AnimatedG animatedProps={marks}>
        <FutureZone zone={zone} />
      </AnimatedG>
    </G>
  );
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
  if (spec.range) {
    min = Math.min(min, spec.range[0]);
    max = Math.max(max, spec.range[1]);
  }
  ({ lo: min, hi: max } = floorSpan(spec.kind, min, max));
  const span = max - min || Math.max(max * 0.01, 0.1);
  return { lo: min - span * 0.1, hi: max + span * 0.12 };
}

export function closeAt(spec: ChartSpec, index: number): number {
  const bars = toCandles(spec);
  return bars[Math.max(0, Math.min(index, bars.length - 1))].c;
}

type Props = {
  spec: ChartSpec;
  /**
   * docs/UI.md §6.4 [DESIGN-REVIEW]: a finger run along the chart reads the
   * price at each bar (ChartScrub). For charts that are there to be read, not
   * answered on.
   */
  scrub?: boolean;
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
  /**
   * How many bars were on screen at the decision. Its presence says this chart
   * will replay an outcome: the slots still to come are hatched until they
   * fill, and the replay frames itself as windowAt describes.
   */
  revealFrom?: number;
  /**
   * Hatch the slots of the bars not shown yet, for a chart that fills in as
   * the learner goes (`chart-replay`). A decision chart does this on its own.
   */
  showFuture?: boolean;
  /**
   * What the replay came to, once every bar is in (docs/UI.md §4.3's outcome
   * strip), drawn on the chart itself: a line at the decision price and a tag
   * with the move and what it did to the position, in whichever corner the
   * bars before the decision leave free.
   */
  outcome?: { move: string; position: string; up: boolean; flat: boolean };
  /**
   * The chart is what the screen teaches (a theory card's visual): the line
   * draws heavier, glows in every look and lays a deeper fill under itself.
   * Nothing moves off the grid -- only ink is added.
   */
  emphasis?: boolean;
  /**
   * Numbered markers on bars, for a post-mortem that points back at the chart:
   * a dashed line through the bar and its number in a dot under the plot.
   */
  marks?: { bar: number; label: string; color: string }[];
  /** Trades the learner took, as an arrow under (long) or over (short) the bar. */
  trades?: { bar: number; side: 'long' | 'short' }[];
  /**
   * docs/UI.md §6.4 [DESIGN-REVIEW]: the trade the file plans (tradePlan.ts).
   * Its lines are drawn once `planShown`; the frame makes room for them from
   * the first frame, evenly above and below, so it gives nothing away.
   */
  plan?: TradePlan;
  planShown?: boolean;
  /** The R ruler beside the axis: the trade taken, or faint for one stood aside. */
  ruler?: 'full' | 'faint' | null;
  /** Keep the ruler's column free from the first frame, so nothing shifts when it arrives. */
  rulerSpace?: boolean;
  /** The last bar the replay plays: where the trade ended (tradePlan.ts). Default: the last bar. */
  endAt?: number;
  /** The file's notes on bars, drawn when `showNotes`. */
  notes?: ChartNote[];
  showNotes?: boolean;
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
 * so the height itself has to be a whole number of gaps. Offering several sizes
 * is what lets a chart stay aligned in a short window instead of falling back
 * to an arbitrary height: it drops from five lines to four to three rather than
 * from aligned to not. Which one a screen gets is decided by the room it has
 * (lesson/fit.tsx, useChartGaps); most screens stop at five gaps, and a
 * `chart-decision`, whose chart is the whole screen once the call is made, may
 * take seven.
 */
const PLOT_GAPS = [7, 6, 5, 4, 3, 2];

/**
 * A chart's plot when nothing decides otherwise. Candle charts with volume
 * used to get two gaps to the line chart's three, to leave room for the strip
 * -- which left their price plot 112 points tall and every candle a dash.
 */
export const DEFAULT_GAPS = 3;

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
export function chartWidthFor(
  available: number,
  hasVolume: boolean,
  gaps?: number,
  /** Room beside the axis for the R ruler (ChartPlan.tsx, RULER_W). */
  extra = 0,
): number {
  const chosen = gaps ?? DEFAULT_GAPS;
  const ink = chosen * CHART_GRID_STEP + (hasVolume ? VOLUME_GAP + VOLUME_H : 0);
  return Math.min(available, ink * MAX_PLOT_ASPECT + PAD_LEFT + AXIS_W + extra);
}

/** The height a chart needs for a grid-aligned plot, with or without volume. */
export function chartHeightFor(hasVolume: boolean, gaps?: number): number {
  const chosen = gaps ?? DEFAULT_GAPS;
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
  rightPad = 0,
}: {
  width: number;
  height: number;
  bars: number;
  lo: number;
  hi: number;
  hasVolume: boolean;
  gridAnchor?: number;
  /** Room kept right of the axis (the R ruler's column). */
  rightPad?: number;
}): ChartLayout {
  const plotW = width - PAD_LEFT - AXIS_W - rightPad;
  const volH = hasVolume ? VOLUME_H : 0;
  const fixed = PAD_TOP + PAD_BOTTOM + (hasVolume ? VOLUME_GAP + volH : 0);

  // The tallest grid-locked plot that still fits, leaving GRID for the snap.
  const fitted = PLOT_GAPS.map((g) => g * CHART_GRID_STEP).find((h) => fixed + GRID + h <= height);
  const aligns = gridAnchor !== undefined && fitted !== undefined;

  // Before the chart has been measured it already takes its grid-locked
  // size, centred in the snap's slack, so the snap when the measurement lands
  // is a shift of at most half a cell -- not a change in the number of lines
  // under a chart that is still building itself in.
  const priceH = fitted !== undefined ? fitted : Math.max(GRID, height - fixed);
  // priceH is a whole number of backdrop cells when aligning, so shifting the
  // top by the remainder puts every line on one.
  const padTop = aligns
    ? PAD_TOP + ((GRID - (((gridAnchor as number) + PAD_TOP) % GRID)) % GRID)
    : PAD_TOP + (fitted !== undefined ? GRID / 2 : 0);
  const gaps = fitted !== undefined ? fitted / CHART_GRID_STEP : 3;

  const slot = plotW / Math.max(1, bars);
  const span = hi - lo || 1;

  return {
    aligns,
    padTop,
    priceH,
    plotW,
    slot,
    // Wide enough to read as bodies rather than ticks. At 0.62 of the slot the
    // gaps between candles were nearly as wide as the candles.
    bodyW: Math.max(3, Math.min(slot * 0.7, 24)),
    volTop: padTop + priceH + VOLUME_GAP,
    volH,
    gaps,
    y: (price: number) => padTop + priceH - ((price - lo) / span) * priceH,
    priceAt: (yPx: number) => lo + ((padTop + priceH - yPx) / priceH) * span,
    cx: (i: number) => PAD_LEFT + slot * (i + 0.5),
  };
}

/**
 * Memoised: a chart is the heaviest thing on its screen, and the screens
 * around it re-render for things that do not touch it -- a line being dragged
 * over it, a pick in the row under it.
 */
export default React.memo(Chart);

function Chart({
  spec,
  visibleCount,
  width,
  height,
  showDecisionMarker = true,
  draw,
  playback,
  gridAnchor,
  revealFrom,
  showFuture = false,
  outcome,
  marks,
  trades,
  emphasis = false,
  plan,
  planShown = false,
  ruler = null,
  rulerSpace = false,
  endAt,
  notes,
  showNotes = false,
  scrub = false,
}: Props) {
  const lookSpec = useLookSpec();
  const neo = lookSpec.chartGlow || emphasis;
  const lineW = emphasis ? LINE_W_EMPHASIS : LINE_W;
  const lineColor = lookSpec.chartLine;
  const bars = useMemo(() => toCandles(spec), [spec]);
  const n = bars.length;
  const shown = Math.max(0, Math.min(visibleCount, n));
  const hasVolume = Array.isArray(spec.volume) && spec.volume.length > 0;

  // The entrance (components/ChartBuild.tsx). Bars on screen at the first
  // commit build in a row, left to right; a bar that appears later -- the next
  // bar of a `chart-replay` -- builds on its own, at once. A bar the replay
  // has already shown is never built again, so the static chart a
  // `chart-decision` settles into after its playback just stays.
  const entering = useRef(true);
  const seen = useRef(new Set<number>());
  const stagger = useRef(buildStagger(shown)).current;
  const buildDelay = (i: number) => (entering.current ? ENTRY_DELAY + i * stagger : 0);
  const builds = (i: number) => !seen.current.has(i);
  // The hand feels the chart move (lesson/haptics.ts, startChartMove): one
  // steady vibration while the bars build in and the line draws on, and one
  // landing as the last of them settles. Worked out before `seen` is updated
  // below, so it knows which bars this commit builds. A bar that joins later
  // -- the next bar of a `chart-replay` -- is a short move of its own. A
  // replay's move is ChartDecisionScreen's, which knows its timing.
  const reduced = useReduceMotion();
  let moveMs = 0;
  if (!reduced && !playback) {
    if (spec.kind !== 'line' || hasVolume) {
      for (let i = 0; i < shown; i++) {
        if (builds(i)) moveMs = Math.max(moveMs, buildDelay(i) + BUILD_MS * EASE_OUT_SETTLE);
      }
    }
    // A line draws on over DURATION.draw: by itself after the entry delay, or
    // from mount when the DrawOnChart around it is doing the drawing.
    if (spec.kind === 'line' && entering.current && n > 1) {
      moveMs = Math.max(moveMs, (draw ? 0 : ENTRY_DELAY) + DURATION.draw * EASE_OUT_SETTLE);
    }
  }
  const moving = useRef<ChartMove[]>([]);
  useEffect(() => {
    if (moveMs > 0) moving.current.push(startChartMove(moveMs));
  });
  useEffect(() => () => moving.current.forEach((m) => m.cancel()), []);

  useEffect(() => {
    entering.current = false;
    const upTo = playback ? n : shown;
    for (let i = 0; i < upTo; i++) seen.current.add(i);
  });
  // What is drawn over the bars -- levels, VWAP, the decision marker, the zone
  // still to come -- lands once most of the row is in.
  const overlay = useEntrance(true, ENTRY_DELAY + shown * stagger * 0.7, OVERLAY_MS);
  // A line chart draws itself on when nothing else is drawing it.
  const selfDraw = useEntrance(
    spec.kind === 'line' && !draw && !playback,
    ENTRY_DELAY,
    DURATION.draw,
  );
  const lineDraw = draw ?? selfDraw;
  const overlayProps = useAnimatedProps(() => ({ opacity: overlay.get() }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.get() }));

  // The window the axis shows: the bars on screen, filling the plot. For a
  // chart that replays an outcome that is the decision frame; how it moves
  // from there is windowAt's.
  //
  // A chart that replays an outcome (`revealFrom`) holds one frame from the
  // first frame to the last instead (David, 2026-10-03, docs/UI.md §6.4: "the
  // line before it gets revealed already is at the middle of the chart so the
  // y-axis units don't get bigger or smaller"): centred on the bars the learner
  // can see, and tall enough for every bar to come and the plan's lines. The
  // extra room is the same above and below, so it says nothing about the way.
  const fixedFrame = useMemo(() => {
    if (revealFrom === undefined) return null;
    const seen = domainOf(bars, spec, Math.max(1, revealFrom));
    const all = domainOf(bars, spec, n);
    let lo0 = all.lo;
    let hi0 = all.hi;
    if (plan) {
      const pad = (all.hi - all.lo) * 0.06;
      lo0 = Math.min(lo0, Math.min(plan.stop, plan.target) - pad);
      hi0 = Math.max(hi0, Math.max(plan.stop, plan.target) + pad);
    }
    const mid = (seen.lo + seen.hi) / 2;
    const half = Math.max(mid - lo0, hi0 - mid, (seen.hi - seen.lo) / 2);
    return { lo: mid - half, hi: mid + half };
  }, [revealFrom, bars, spec, n, plan]);
  const visibleFrame = useMemo(
    () => domainOf(bars, spec, Math.max(1, shown)),
    [bars, spec.vwap, spec.levels, shown],
  );
  const { lo, hi } = fixedFrame ?? visibleFrame;

  // Where the axis ends up once every bar is in.
  const fullFrame = useMemo(() => domainOf(bars, spec, n), [bars, spec.vwap, spec.levels, n]);
  const full = fixedFrame ?? fullFrame;

  const rightPad = rulerSpace ? RULER_W : 0;
  const layout = useMemo(
    () => chartLayout({ width, height, bars: n, lo, hi, hasVolume, gridAnchor, rightPad }),
    [width, height, n, lo, hi, hasVolume, gridAnchor, rightPad],
  );
  const { padTop, priceH, plotW, bodyW, volTop, volH, gaps, y, cx } = layout;
  // The price labels, right of the plot; the R ruler's column, if any, after them.
  const axisX = PAD_LEFT + plotW + 6;
  const rulerX = PAD_LEFT + plotW + AXIS_W + 8;
  const planEnter = useShowing(!!plan && planShown, 360);
  const rulerEnter = useShowing(!!plan && !!ruler, 360);

  // With the room reserved up front the window usually never moves, so the
  // labels are the same before and after and swapping them is a flicker.
  const axisMoves = Math.abs(full.lo - lo) > 1e-9 || Math.abs(full.hi - hi) > 1e-9;

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
    for (let i = 0; i <= gaps; i++) out.push(full.lo + ((full.hi - full.lo) * i) / gaps);
    return out;
  }, [full.lo, full.hi, gaps]);

  const playGeom = useMemo<PlayGeom | null>(() => {
    if (!playback || shown < 1) return null;
    // Running extremes, so the window can follow what has actually been
    // revealed rather than run ahead of it. Levels and VWAP are folded in
    // because domainOf counts them too, and the last frame has to land exactly
    // on the static one.
    const levelHi = Math.max(...(spec.levels ?? []).map((l) => l.price), -Infinity);
    const levelLo = Math.min(...(spec.levels ?? []).map((l) => l.price), Infinity);
    const runHi: number[] = [];
    const runLo: number[] = [];
    let mh = levelHi;
    let ml = levelLo;
    bars.forEach((b, i) => {
      mh = Math.max(mh, b.h, spec.vwap?.[i] ?? -Infinity);
      ml = Math.min(ml, b.l, spec.vwap?.[i] ?? Infinity);
      runHi.push(mh);
      runLo.push(ml);
    });
    // The replay's frame: the finished session's height, centred where the
    // decision frame was. A fixed frame is that already, from the start.
    const mid = (lo + hi) / 2;
    const half = (full.hi - full.lo) / 2;
    return {
      xs: bars.map((_, i) => cx(i)),
      closes: bars.map((b) => b.c),
      opens: bars.map((b) => b.o),
      highs: bars.map((b) => b.h),
      lows: bars.map((b) => b.l),
      from: shown,
      // The replay stops where the trade ended (docs/UI.md §6.4); the bars
      // after it stay under the hatching.
      n: endAt !== undefined ? Math.max(shown, Math.min(n, endAt + 1)) : n,
      padTop,
      priceH,
      baseline: padTop + priceH,
      tlo: lo,
      thi: hi,
      lo0: fixedFrame ? lo : mid - half,
      hi0: fixedFrame ? hi : mid + half,
      lo1: full.lo,
      hi1: full.hi,
      runHi,
      runLo,
      fixed: !!fixedFrame,
    };
  }, [playback, spec, bars, n, shown, layout, lo, hi, full.lo, full.hi, fixedFrame, endAt]);

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
      2,
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
    spec.kind === 'line' ? cx(spec.decision_index) : cx(spec.decision_index) + bodyW / 2 + 3;
  const lastVisible = shown > 0 ? bars[shown - 1] : null;

  const decisionZone = showDecisionMarker && revealFrom !== undefined;
  const future: Zone | null =
    (decisionZone || showFuture) && shown < n
      ? {
          // A decision chart's zone starts at its marker; a replay's at the
          // edge of the last bar it has shown, and it carries no label -- the
          // count is already under the chart, and nothing here is waiting.
          // Once the replay has played past the decision -- it ended early, at
          // the stop or the target -- the zone is only what it never reached.
          x0:
            decisionZone && shown <= (revealFrom as number)
              ? decisionX + 4
              : PAD_LEFT + layout.slot * shown + 2,
          x1: PAD_LEFT + plotW,
          y0: padTop,
          y1: padTop + priceH + (hasVolume ? VOLUME_GAP + volH : 0),
          midY: padTop + priceH / 2,
          label: decisionZone && shown <= (revealFrom as number) ? `next ${n - shown} bars` : '',
        }
      : null;

  // The plan's labels, which the levels' labels and the notes keep off.
  const planBoxes = plan
    ? planLabels(plan, {
        y,
        x0: decisionX,
        x1: PAD_LEFT + plotW,
        top: padTop,
        bottom: padTop + priceH,
      }).boxes
    : [];
  const decisionTagBox = {
    left: Math.max(0, decisionX - 26),
    top: Math.max(0, padTop - 15),
    width: 88,
    height: 22,
  };

  // The levels' labels: each at the end of its line where it covers the
  // fewest bars (docs/UI.md §6.4), drawn over the bars on a rim of the page.
  const levelLabels = useMemo(() => {
    const marked = (spec.levels ?? []).filter((lvl) => !!lvl.label);
    if (!marked.length) return [];
    const ink: LabelBox[] = [];
    if (spec.kind === 'line') {
      // A line's track, sampled along each segment.
      for (let i = 1; i < n; i++) {
        for (let k = 0; k <= 8; k++) {
          const t = k / 8;
          const px = cx(i - 1) + (cx(i) - cx(i - 1)) * t;
          const py = y(bars[i - 1].c) + (y(bars[i].c) - y(bars[i - 1].c)) * t;
          ink.push({ left: px - 2, top: py - 2, width: 4, height: 4 });
        }
      }
    } else {
      bars.forEach((b, i) => {
        const bodyTop = y(Math.max(b.o, b.c));
        ink.push({
          left: cx(i) - bodyW / 2 - 2,
          top: bodyTop - 2,
          width: bodyW + 4,
          height: Math.max(1, y(Math.min(b.o, b.c)) - bodyTop) + 4,
        });
        ink.push({ left: cx(i) - 1, top: y(b.h), width: 2, height: Math.max(1, y(b.l) - y(b.h)) });
      });
    }
    const avoid: LabelBox[] = [...planBoxes];
    if (showDecisionMarker && spec.decision_index >= 0) avoid.push(decisionTagBox);
    // The "next 5 bars" pill is a hint: it makes way for the labels (pillZone).
    return placeLevelLabels(
      marked.map((lvl) => ({
        text: levelLabelText(lvl.label as string, axisPrice(lvl.price), plotW),
        y: y(lvl.price),
      })),
      { left: PAD_LEFT, right: PAD_LEFT + plotW, top: padTop, bottom: padTop + priceH, ink, avoid },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, bars, n, layout, plan, decisionX, showDecisionMarker, decisionZone]);

  // The "next 5 bars" pill sits in the middle of the hatched zone, or as near
  // it as it can without covering a level's label (Ch 4 10-1 at 320 pt: two
  // levels at the top, their labels reaching into the zone).
  const pillZone = useMemo(() => {
    if (!future || !future.label || !levelLabels.length) return future;
    const boxes = [...levelLabels.map((l) => labelBox(l.text, l.x, l.y, l.anchor)), ...planBoxes];
    const w = zonePillWidth(future.label);
    const cxZone = (future.x0 + future.x1) / 2;
    const free = (midY: number) =>
      boxes.every(
        (b) =>
          b.left > cxZone + w / 2 ||
          b.left + b.width < cxZone - w / 2 ||
          b.top > midY + 9 ||
          b.top + b.height < midY - 9,
      );
    for (let k = 0; k <= 8; k++) {
      for (const sign of k ? [1, -1] : [1]) {
        const midY = future.midY + sign * k * 10;
        if (midY - 9 < padTop || midY + 9 > padTop + priceH) continue;
        if (free(midY)) return { ...future, midY };
      }
    }
    return future;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [future?.x0, future?.x1, future?.midY, future?.label, levelLabels, planBoxes]);

  // The outcome tag goes where the bars before the decision are not: above
  // them or below, whichever gap is taller, at the left of the plot.
  const showOutcome = !!outcome && shown >= n && !playback && spec.decision_index >= 0;
  const entryY = spec.decision_index >= 0 ? y(bars[Math.min(spec.decision_index, n - 1)].c) : 0;
  const outcomeTop = useMemo(() => {
    if (!showOutcome) return 0;
    let top = Infinity;
    let bottom = -Infinity;
    for (let i = 0; i <= spec.decision_index && i < n; i++) {
      top = Math.min(top, y(bars[i].h));
      bottom = Math.max(bottom, y(bars[i].l));
    }
    const above = top - padTop;
    const below = padTop + priceH - bottom;
    const centred =
      below >= above
        ? Math.min(padTop + priceH - OUTCOME_TAG_H - 4, bottom + (below - OUTCOME_TAG_H) / 2)
        : Math.max(padTop + 4, padTop + (above - OUTCOME_TAG_H) / 2);
    // Off the levels' labels: step out from the middle of the gap, either way,
    // to the first spot that clears them all.
    if (!levelLabels.length) return centred;
    const width =
      Math.max(outcome?.move.length ?? 0, outcome?.position.length ?? 0) * OUTCOME_CHAR_W + 18;
    const boxes = levelLabels.map((l) => labelBox(l.text, l.x, l.y, l.anchor));
    const [lo, hi] =
      below >= above
        ? [bottom + 2, padTop + priceH - OUTCOME_TAG_H - 2]
        : [padTop + 2, top - OUTCOME_TAG_H - 2];
    const clear = (t: number) =>
      !boxes.some(
        (b) =>
          b.left < PAD_LEFT + 4 + width &&
          PAD_LEFT + 4 < b.left + b.width &&
          b.top < t + OUTCOME_TAG_H + 3 &&
          t - 3 < b.top + b.height,
      );
    for (let d = 0; d <= Math.max(0, hi - lo); d += 4) {
      for (const t of [centred - d, centred + d]) if (t >= lo && t <= hi && clear(t)) return t;
    }
    return centred;
  }, [showOutcome, spec.decision_index, n, bars, layout, padTop, priceH, levelLabels, outcome]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity={emphasis ? '0.4' : '0.28'} />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
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

        {playGeom && playback && axisMoves ? (
          <G>
            <PlaybackAxis progress={playback} fadeOut>
              {ticks.map((t, i) => (
                <SvgText
                  key={`ao${i}`}
                  x={axisX}
                  y={y(t) + 4}
                  fill={colors.textFaint}
                  fontSize={13}
                >
                  {axisPrice(t)}
                </SvgText>
              ))}
            </PlaybackAxis>
            <PlaybackAxis progress={playback} fadeOut={false}>
              {fullTicks.map((t, i) => (
                <SvgText
                  key={`an${i}`}
                  x={axisX}
                  y={y(ticks[i]) + 4}
                  fill={colors.textFaint}
                  fontSize={13}
                >
                  {axisPrice(t)}
                </SvgText>
              ))}
            </PlaybackAxis>
          </G>
        ) : (
          <G>
            {ticks.map((t, i) => (
              <SvgText key={`a${i}`} x={axisX} y={y(t) + 4} fill={colors.textFaint} fontSize={13}>
                {axisPrice(t)}
              </SvgText>
            ))}
          </G>
        )}

        {/* annotation levels: ruled in from the left once the bars are in
            (docs/UI.md §6.4, "animate in") */}
        {(spec.levels ?? []).map((lvl, i) => (
          <DrawnLevel
            key={`lvl${i}`}
            x1={PAD_LEFT}
            x2={PAD_LEFT + plotW}
            y={y(lvl.price)}
            enter={overlay}
          />
        ))}

        {/* VWAP overlay */}
        {vwapPath ? (
          <AnimatedG animatedProps={overlayProps}>
            <Path
              d={vwapPath}
              stroke={colors.accent}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="none"
              opacity={0.9}
            />
          </AnimatedG>
        ) : null}

        {/* docs/UI.md §6.4 [DESIGN-REVIEW]: the open, where it matters. */}
        {spec.session_open !== undefined && spec.session_open >= 1 && spec.session_open < n ? (
          <AnimatedG animatedProps={overlayProps}>
            <SessionOpen
              x={PAD_LEFT + layout.slot * spec.session_open}
              left={PAD_LEFT}
              top={padTop}
              bottom={padTop + priceH}
            />
          </AnimatedG>
        ) : null}

        {/* The bars still to come, before and during the replay: a hatched
            zone right of the decision, so the empty half of the chart reads as
            "not yet" rather than as nothing. */}
        {future && playGeom && playback ? (
          <PlaybackFuture
            g={playGeom}
            progress={playback}
            zone={pillZone ?? future}
            slot={layout.slot}
          />
        ) : pillZone ? (
          <AnimatedG animatedProps={overlayProps}>
            <FutureZone zone={pillZone} />
          </AnimatedG>
        ) : null}

        {/* bars */}
        {spec.kind === 'line' && playGeom && playback ? (
          <G>
            <PlaybackLine g={playGeom} progress={playback} neo={neo} />
          </G>
        ) : spec.kind === 'line' ? (
          <G>
            {lineFill ? (
              // The fill covers the whole plot from the first frame, so it
              // cannot fade in alongside the stroke -- it would sit out to the
              // right of a line that has not arrived yet. It follows instead.
              <AnimatedFill d={lineFill} draw={lineDraw} />
            ) : null}
            {linePath ? (
              linePathLength > 0 ? (
                <AnimatedStroke
                  d={linePath}
                  length={linePathLength}
                  draw={lineDraw}
                  neo={neo}
                  width={lineW}
                />
              ) : (
                <G>
                  {neo ? (
                    <Path
                      d={linePath}
                      stroke={lineColor}
                      strokeWidth={GLOW_W}
                      strokeOpacity={GLOW_OPACITY}
                      fill="none"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ) : null}
                  <Path
                    d={linePath}
                    stroke={lineColor}
                    strokeWidth={2.25}
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </G>
              )
            ) : null}
            {lastVisible ? (
              <AnimatedDot cx={cx(shown - 1)} cy={y(lastVisible.c)} draw={lineDraw} halo={neo} />
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
            <PlaybackLivePrice
              g={playGeom}
              progress={playback}
              x0={PAD_LEFT}
              x1={PAD_LEFT + plotW}
            />
          </G>
        ) : (
          <G>
            {bars.slice(0, shown).map((b, i) => (
              <BuildCandle
                key={`c${i}`}
                x={cx(i)}
                bodyW={bodyW}
                yOpen={y(b.o)}
                yClose={y(b.c)}
                yHigh={y(b.h)}
                yLow={y(b.l)}
                up={b.c >= b.o}
                play={builds(i)}
                delay={buildDelay(i)}
              />
            ))}
          </G>
        )}

        {/* volume strip */}
        {hasVolume
          ? (spec.volume as number[]).slice(0, playGeom && playback ? n : shown).map((v, i) => {
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
                  progress={playback}
                />
              ) : (
                <BuildVolume
                  key={`v${i}`}
                  x={cx(i) - bodyW / 2}
                  width={bodyW}
                  floor={volTop + volH}
                  height={barH}
                  fill={fill}
                  play={builds(i)}
                  delay={buildDelay(i)}
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
          // Two lines: at 13 pt, "vol 16k" is wider than the axis.
          <G>
            <SvgText x={axisX} y={volTop + volH - 15} fill={colors.textFaint} fontSize={13}>
              vol
            </SvgText>
            <SvgText x={axisX} y={volTop + volH} fill={colors.textFaint} fontSize={13}>
              {fmtVolume(maxVol)}
            </SvgText>
          </G>
        ) : null}

        {/* post-mortem markers and the learner's own trades */}
        {(marks ?? []).map((m, i) => (
          <G key={`mk${i}`}>
            <Line
              x1={cx(m.bar)}
              x2={cx(m.bar)}
              y1={padTop}
              y2={padTop + priceH}
              stroke={m.color}
              strokeWidth={1.25}
              strokeDasharray="3 3"
              opacity={0.8}
            />
            {/* In the gap under the plot, which every chart has. */}
            <Circle cx={cx(m.bar)} cy={padTop + priceH + 8} r={7} fill={m.color} />
            <SvgText
              x={cx(m.bar)}
              y={padTop + priceH + 11.5}
              fill={colors.background}
              fontSize={13}
              fontWeight="800"
              textAnchor="middle"
            >
              {m.label}
            </SvgText>
          </G>
        ))}
        {(trades ?? []).map((t, i) => {
          const b = bars[Math.min(n - 1, Math.max(0, t.bar))];
          const x = cx(t.bar);
          const long = t.side === 'long';
          const tip = long ? y(b.l) + 5 : y(b.h) - 5;
          const base = long ? tip + 8 : tip - 8;
          return (
            <Path
              key={`tr${i}`}
              d={`M${x},${tip} L${x - 5},${base} L${x + 5},${base} Z`}
              fill={long ? colors.up : colors.down}
            />
          );
        })}

        {/* The decision price, carried across to where the replay ended, so
            the move reads as a distance from it. */}
        {showOutcome && !plan ? (
          <Line
            x1={decisionX}
            x2={PAD_LEFT + plotW}
            y1={entryY}
            y2={entryY}
            stroke={colors.textMuted}
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.8}
          />
        ) : null}

        {/* docs/UI.md §6.4 [DESIGN-REVIEW]: the plan, once the call is made,
            and the R ruler beside the axis. */}
        {/* The levels' labels, over the bars. */}
        {levelLabels.map((l, i) => (
          <LevelLabel
            key={`ll${i}`}
            x={l.x}
            y={l.y}
            anchor={l.anchor}
            label={l.text}
            enter={overlay}
          />
        ))}

        {plan ? (
          <PlanLines
            plan={plan}
            y={y}
            x0={decisionX}
            x1={PAD_LEFT + plotW}
            top={padTop}
            bottom={padTop + priceH}
            enter={planEnter}
          />
        ) : null}
        {plan && ruler ? (
          <RulerScale plan={plan} y={y} x={rulerX} faint={ruler === 'faint'} enter={rulerEnter} />
        ) : null}
        {plan && ruler && playGeom && playback ? (
          <PlaybackRuler
            g={playGeom}
            progress={playback}
            plan={plan}
            x={rulerX}
            faint={ruler === 'faint'}
          />
        ) : null}

        {/* decision marker */}
        {showDecisionMarker ? (
          <AnimatedG animatedProps={overlayProps}>
            <Line
              x1={decisionX}
              x2={decisionX}
              y1={padTop}
              y2={padTop + priceH + (hasVolume ? VOLUME_GAP + volH : 0)}
              stroke={colors.textMuted}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            <Circle cx={decisionX} cy={padTop + 1} r={3} fill={colors.textMuted} />
          </AnimatedG>
        ) : null}
      </Svg>

      {showDecisionMarker ? (
        <Animated.View
          style={[
            styles.decisionTag,
            { left: Math.max(0, decisionX - 26), top: Math.max(0, padTop - 15) },
            overlayStyle,
          ]}
        >
          <Text style={styles.decisionTagText}>
            {shown > spec.decision_index + 1 ? 'decision' : 'you are here'}
          </Text>
        </Animated.View>
      ) : null}

      {showOutcome && outcome ? (
        <Arrive style={[styles.outcomeTag, { left: PAD_LEFT + 4, top: outcomeTop }]}>
          <Text
            style={[
              styles.outcomeMove,
              { color: outcome.flat ? colors.textMuted : outcome.up ? colors.up : colors.down },
            ]}
          >
            {outcome.move}
          </Text>
          <Text style={styles.outcomePosition}>{outcome.position}</Text>
        </Arrive>
      ) : null}

      {plan &&
      ruler &&
      !playback &&
      shown > (revealFrom ?? n) - 1 &&
      shown >= (endAt ?? n - 1) + 1 ? (
        <RulerResult plan={plan} y={y} x={rulerX} faint={ruler === 'faint'} />
      ) : null}

      {notes && notes.length && showNotes ? (
        <ChartNotes
          placed={placeNotes(
            notes.filter((note) => note.bar >= 0 && note.bar < shown),
            {
              cx,
              yHigh: (bar) => y(bars[bar].h),
              yLow: (bar) => y(bars[bar].l),
              bounds: { left: 0, right: PAD_LEFT + plotW, top: 0, bottom: padTop + priceH + 14 },
              avoid: [
                ...levelLabels.map((l) => labelBox(l.text, l.x, l.y, l.anchor)),
                ...(planShown ? planBoxes : []),
                ...(showDecisionMarker ? [decisionTagBox] : []),
              ],
              bars: bars.slice(0, shown).map((b, i) => ({
                left: cx(i) - bodyW / 2,
                top: y(b.h),
                width: bodyW,
                height: Math.max(1, y(b.l) - y(b.h)),
              })),
            },
          )}
          width={width}
          height={height}
          reduced={reduced}
        />
      ) : null}

      {spec.vwap ? (
        <View style={styles.legend}>
          <View style={styles.legendSwatch} />
          <Text style={styles.legendText}>VWAP</Text>
        </View>
      ) : null}

      {scrub && !playback && shown > 1 ? (
        <ChartScrub
          width={width}
          height={height}
          xs={bars.slice(0, shown).map((_, i) => cx(i))}
          ys={bars.slice(0, shown).map((b) => y(b.c))}
          closes={bars.slice(0, shown).map((b) => b.c)}
          top={padTop}
          bottom={padTop + priceH}
          right={PAD_LEFT + plotW}
        />
      ) : null}
    </View>
  );
}

const styles = themed(() => ({
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
    fontSize: 13,
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
  legendText: { ...type.small, color: colors.accent },
  outcomeTag: {
    pointerEvents: 'none',
    position: 'absolute',
    height: OUTCOME_TAG_H,
    justifyContent: 'center',
    backgroundColor: tint(colors.background, 0.88),
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  outcomeMove: { ...type.label, fontWeight: '700' },
  outcomePosition: { ...type.small, color: colors.textMuted },
}));
