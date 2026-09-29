import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { cue } from '../lesson/feedback';
import type { CueName } from '../lesson/cues.generated';
import { EASE_OUT } from '../lesson/motion';
import type { Candle } from './data';
import type { Direction, LayoutId, Palette, Skin, ThemeId, TypeStep } from './directions';

/**
 * The prototype's shared kit: the context every direction's screens read, text
 * in a direction's type scale, press feedback, the entrance a direction plays
 * on a new screen, and the candle chart with its playback. The directions
 * compose these differently; the kit does not decide how anything looks.
 */

export type Proto = {
  d: Direction;
  p: Palette;
  theme: ThemeId;
  layout: LayoutId;
  reduced: boolean;
  width: number;
  height: number;
  /** The prototype's own Continue: on to the next of the six screens. */
  next: () => void;
  /** The mix only: the design of today it wears (skin.tsx). */
  skin?: Skin;
};

const Ctx = createContext<Proto | null>(null);
export const ProtoProvider = Ctx.Provider;

export function useProto(): Proto {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProto outside the prototype');
  return v;
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

type Variant = keyof Direction['type'];

export function textStyle(d: Direction, v: Variant): TextStyle {
  const s: TypeStep = d.type[v];
  return {
    fontSize: s.fontSize,
    lineHeight: s.lineHeight,
    fontWeight: s.fontWeight,
    letterSpacing: s.letterSpacing,
    fontFamily: d.font,
  };
}

/** A number in running text: a sign, a dollar, digits, a decimal part, then % or R. */
const NUMBER = /([−+-]?\$?\d[\d,]*(?:\.\d+)?(?:\s?%|R)?)/;

/**
 * The mix sets only the numbers in the number face and leaves the words around
 * them in the text face ("4 won, 3 lost"); Precise sets the whole line in it.
 */
function numberRuns(text: string, font: string | undefined): React.ReactNode[] {
  return text.split(NUMBER).map((part, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={{ fontFamily: font }}>
        {part}
      </Text>
    ) : (
      part
    ),
  );
}

export function T({
  v = 'body',
  color,
  style,
  children,
  upper,
  num,
  center,
  lines,
}: {
  v?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  upper?: boolean;
  /** Numbers: tabular figures, and the direction's number face if it has one. */
  num?: boolean;
  center?: boolean;
  lines?: number;
}) {
  const { d, p } = useProto();
  const runs =
    num && d.id === 'mix' && typeof children === 'string'
      ? numberRuns(children, d.numberFont)
      : null;
  return (
    <Text
      numberOfLines={lines}
      style={[
        textStyle(d, v),
        { color: color ?? p.text },
        upper && { textTransform: 'uppercase' },
        num && {
          fontVariant: ['tabular-nums'],
          fontFamily: runs ? d.font : (d.numberFont ?? d.font),
        },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {runs ?? children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Sound. David's critique of the current app, applied in the prototypes only:
// Continue uses the soft sound of the lesson's close button (tick) instead of
// its own, and small steps -- a keypad digit, a letter tile -- use the barely
// there detent. The real app changes in a later stage.
// ---------------------------------------------------------------------------

export const SOUND = {
  choose: 'tick' as CueName,
  small: 'detent' as CueName,
  advance: 'tick' as CueName,
  commit: 'commit' as CueName,
};

// ---------------------------------------------------------------------------
// Press
// ---------------------------------------------------------------------------

/**
 * A pressable surface with the direction's press: a scale for Calm and
 * Precise, a sink into its own bottom edge for Playful (`sink` = the edge's
 * height). The cue fires on press-in, so the sound never waits for the finger
 * to lift.
 */
export function Press({
  onPress,
  sound = SOUND.choose,
  disabled,
  style,
  sink = 0,
  children,
  label,
  role = 'button',
}: {
  onPress?: () => void;
  sound?: CueName | null;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  sink?: number;
  children: React.ReactNode;
  label?: string;
  role?: 'button' | 'radio' | 'link';
}) {
  const { reduced } = useProto();
  const pressed = useSharedValue(0);
  const anim = useAnimatedStyle(() =>
    sink
      ? { transform: [{ translateY: pressed.get() * sink }] }
      : { transform: [{ scale: 1 - 0.03 * pressed.get() }] },
  );
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={() => {
        if (sound) cue(sound);
        if (!reduced) pressed.set(withTiming(1, { duration: 90, easing: EASE_OUT }));
      }}
      onPressOut={() => {
        if (!reduced) pressed.set(withTiming(0, { duration: 160, easing: EASE_OUT }));
      }}
      onPress={onPress}
    >
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Entrances: how a direction brings a new screen in. A screen's blocks are
// wrapped in <Enter i={n}>; `i` only matters to Precise, which staggers them.
// ---------------------------------------------------------------------------

export function Enter({
  i = 0,
  style,
  children,
}: {
  i?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { d, reduced } = useProto();
  // The mix moves like Calm, its base.
  const moves = d.id === 'mix' ? 'calm' : d.id;
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    if (moves === 'calm') t.set(withTiming(1, { duration: 320, easing: EASE_OUT }));
    else if (moves === 'playful') t.set(withSpring(1, { duration: 420, dampingRatio: 0.78 }));
    else t.set(withDelay(i * 40, withTiming(1, { duration: 200, easing: EASE_OUT })));
  }, [moves, i, reduced, t]);
  const style2 = useAnimatedStyle(() => {
    const v = t.get();
    if (moves === 'calm') return { opacity: v, transform: [{ translateY: (1 - v) * 6 }] };
    if (moves === 'playful')
      return { opacity: Math.min(1, v * 1.6), transform: [{ translateX: (1 - v) * 48 }] };
    return { opacity: v, transform: [{ translateY: (1 - v) * 3 }] };
  });
  return <Animated.View style={[style, style2]}>{children}</Animated.View>;
}

/** Something that appears in place (a reveal): opacity and a short rise, or a spring. */
export function Appear({
  show,
  from = 8,
  spring,
  duration = 280,
  style,
  children,
}: {
  show: boolean;
  from?: number;
  spring?: boolean;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { reduced } = useProto();
  const t = useSharedValue(show ? 1 : 0);
  useEffect(() => {
    const to = show ? 1 : 0;
    if (reduced) t.set(withTiming(to, { duration: 120 }));
    else if (spring) t.set(withSpring(to, { duration: 380, dampingRatio: 0.72 }));
    else t.set(withTiming(to, { duration, easing: EASE_OUT }));
  }, [show, reduced, spring, duration, t]);
  const a = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.get()),
    transform: [{ translateY: reduced ? 0 : (1 - t.get()) * from }],
  }));
  return (
    <Animated.View pointerEvents={show ? 'auto' : 'none'} style={[style, a]}>
      {children}
    </Animated.View>
  );
}

/** A number that ticks up to its value (Playful's XP, Precise's report). */
export function useCountUp(to: number, ms: number, delay = 0): number {
  const { reduced } = useProto();
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const start = Date.now() + delay;
    const step = () => {
      const u = Math.min(1, Math.max(0, (Date.now() - start) / ms));
      const eased = 1 - Math.pow(1 - u, 3);
      setV(Math.round(to * eased));
      if (u < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, delay, reduced]);
  return v;
}

/** A 0→1 value on the UI thread, started once (a ring filling). */
export function useProgress(ms: number, delay = 0) {
  const { reduced } = useProto();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced)
      t.set(
        withDelay(delay, withTiming(1, { duration: ms, easing: Easing.bezier(0.33, 1, 0.68, 1) })),
      );
  }, [ms, delay, reduced, t]);
  return t;
}

// ---------------------------------------------------------------------------
// The chart
// ---------------------------------------------------------------------------

/**
 * Where a candle is while it forms. Real one-minute candles do not grow from
 * nothing to their close: price opens, runs to one extreme, then the other,
 * and settles on the close, and the wicks are what it left behind. So the
 * candle at `f` (0..1 of its minute) is the path open → first extreme →
 * second extreme → close, and its high and low so far are what that path has
 * touched. David's critique asked for candles that move more like real ones.
 */
export function formingCandle(c: Candle, f: number): Candle {
  const upFirst = c.c < c.o; // a red candle usually tags its high first
  const e1 = upFirst ? c.h : c.l;
  const e2 = upFirst ? c.l : c.h;
  const legs: [number, number][] = [
    [c.o, e1],
    [e1, e2],
    [e2, c.c],
  ];
  const u = Math.max(0, Math.min(1, f)) * 3;
  const leg = Math.min(2, Math.floor(u));
  const within = u - leg;
  const [a, b] = legs[leg];
  const price = a + (b - a) * within;
  const touched = [c.o, price, ...legs.slice(0, leg).map((l) => l[1])];
  return { o: c.o, c: price, h: Math.max(...touched), l: Math.min(...touched) };
}

/**
 * Plays `total` candles forward: `pos` goes from 0 to `total`, its whole part
 * the candles done and its fraction the one forming. A tap anywhere on the
 * chart calls `skip`, which finishes it (docs/UI.md §5.1: a tap finishes or
 * skips any running motion). Reduced motion lands on the end at once.
 */
export function usePlayback(total: number, msPerCandle: number, run: boolean, onEnd?: () => void) {
  const { reduced } = useProto();
  const [pos, setPos] = useState(0);
  const done = useRef(false);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  }, [onEnd]);
  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setPos(total);
    endRef.current?.();
  }, [total]);
  useEffect(() => {
    if (!run) return;
    done.current = false;
    if (reduced) {
      finish();
      return;
    }
    let raf = 0;
    const start = Date.now();
    // A slow first and last candle, the middle at speed: the ramp the app's
    // own replay uses (lesson/motion.ts, revealTiming), in miniature.
    const lead = msPerCandle * 0.8;
    const trail = msPerCandle * 1.2;
    const span = lead + trail + msPerCandle * total;
    const step = () => {
      const ms = Date.now() - start;
      if (ms >= span) return finish();
      let p: number;
      if (ms < lead) p = (ms / lead) * 0.5;
      else if (ms < lead + msPerCandle * (total - 1)) p = 0.5 + (ms - lead) / msPerCandle;
      else
        p = total - 0.5 + ((ms - lead - msPerCandle * (total - 1)) / (msPerCandle + trail)) * 0.5;
      setPos(Math.min(total, p));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, total, msPerCandle, reduced, finish]);
  return { pos, skip: finish, playing: run && pos < total };
}

/** Round price steps for the axis (docs/UI.md §6.4): 0.05, 0.10, 0.25, 0.50, 1. */
export function niceTicks(lo: number, hi: number, want = 4): number[] {
  const steps = [0.05, 0.1, 0.25, 0.5, 1, 2, 5];
  const step = steps.find((s) => (hi - lo) / s <= want) ?? 5;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step)
    out.push(Math.round(v * 100) / 100);
  return out;
}

export type ChartStyle = 'calm' | 'playful' | 'precise' | 'mix';

/**
 * A candle chart in one of four drawings. The mix draws Calm's candles and
 * grid but takes Precise's behaviour: candles form, a live price tag follows
 * the forming one, and the axis and the levels carry their prices in the
 * number face. `shown` is how many candles are
 * visible, the last possibly still forming (a fraction). The price domain is
 * fixed from the first frame over everything the chart will ever show, so the
 * axis never jumps between the decision and the reveal.
 */
export function CandleChart({
  candles,
  shown,
  width,
  height,
  kind,
  lines = [],
  splitAt,
  hideAfterSplit,
  extent = [],
}: {
  candles: Candle[];
  shown: number;
  width: number;
  height: number;
  kind: ChartStyle;
  lines?: { price: number; label: string; color: string; dash?: boolean }[];
  /** The decision point: bars after it are "what happened next". */
  splitAt?: number;
  hideAfterSplit?: boolean;
  /** Prices the domain must hold from the first frame, drawn or not yet (stop, target). */
  extent?: number[];
}) {
  const { p, d } = useProto();
  const exact = kind === 'precise' || kind === 'mix';
  const axisW = exact ? 52 : 44;
  const plotW = width - axisW;
  // The top strip holds the "What happened next" label, above every candle.
  const padTop = 24;
  const padY = 10;
  const prices = candles
    .flatMap((c) => [c.h, c.l])
    .concat(
      lines.map((l) => l.price),
      extent,
    );
  const lo = Math.min(...prices) - 0.02;
  const hi = Math.max(...prices) + 0.02;
  const y = (v: number) => padTop + ((hi - v) / (hi - lo)) * (height - padTop - padY);
  const slot = plotW / candles.length;
  const bodyW = Math.max(3, slot * (kind === 'playful' ? 0.7 : exact ? 0.56 : 0.5));
  const ticks = niceTicks(lo, hi, kind === 'precise' ? 6 : 5);
  const whole = Math.floor(shown);
  const frac = shown - whole;
  const visible: { c: Candle; i: number; forming: boolean; alpha: number }[] = [];
  for (let i = 0; i < Math.min(candles.length, Math.ceil(shown)); i++) {
    const forming = i === whole && frac > 0;
    if (kind === 'calm') {
      // Calm does not form candles: each fades in whole, a quiet reveal.
      visible.push({ c: candles[i], i, forming: false, alpha: forming ? frac : 1 });
    } else {
      visible.push({
        c: forming ? formingCandle(candles[i], frac) : candles[i],
        i,
        forming,
        alpha: 1,
      });
    }
  }
  const last = visible[visible.length - 1];
  const fontFamily = exact ? d.numberFont : d.font;
  const axisColor = p.muted;
  // The live price tag sits on the axis; an axis price it would cover steps aside.
  const tagY = exact && last && shown < candles.length ? y(last.c.c) : null;
  return (
    <Svg
      width={width}
      height={height}
      accessibilityLabel="Price climbed from 9.60 to 9.80, then pulled back to 9.74."
    >
      {ticks.map((t) => (
        <G key={t}>
          <Line
            x1={0}
            x2={plotW}
            y1={y(t)}
            y2={y(t)}
            stroke={p.line}
            strokeWidth={1}
            strokeDasharray={kind === 'calm' || kind === 'mix' ? '2 4' : undefined}
          />
          {tagY === null || Math.abs(y(t) - tagY) > 16 ? (
            <SvgText
              x={width - 2}
              y={y(t) + 4.5}
              fontSize={13}
              fill={axisColor}
              textAnchor="end"
              fontFamily={fontFamily}
            >
              {`$${t.toFixed(2)}`}
            </SvgText>
          ) : null}
        </G>
      ))}
      {splitAt !== undefined && hideAfterSplit && (
        <Rect
          x={splitAt * slot}
          y={0}
          width={plotW - splitAt * slot}
          height={height}
          fill={p.surfaceAlt}
          opacity={0.6}
          rx={kind === 'playful' ? 12 : 2}
        />
      )}
      {splitAt !== undefined && (
        <Line
          x1={splitAt * slot}
          x2={splitAt * slot}
          y1={0}
          y2={height}
          stroke={p.lineStrong}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      {visible.map(({ c, i, alpha }) => {
        const up = c.c >= c.o;
        const col = up ? p.up : p.down;
        const cx = i * slot + slot / 2;
        const top = y(Math.max(c.o, c.c));
        const bh = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
        return (
          <G key={i} opacity={alpha}>
            <Line
              x1={cx}
              x2={cx}
              y1={y(c.h)}
              y2={y(c.l)}
              stroke={col}
              strokeWidth={kind === 'playful' ? 2 : 1.25}
              strokeLinecap="round"
            />
            <Rect
              x={cx - bodyW / 2}
              y={top}
              width={bodyW}
              height={bh}
              fill={kind === 'precise' && up ? p.ground : col}
              stroke={col}
              strokeWidth={kind === 'precise' ? 1.25 : 0}
              rx={kind === 'playful' ? Math.min(3, bodyW / 3) : 1}
            />
          </G>
        );
      })}
      {splitAt !== undefined && hideAfterSplit && (
        <SvgText
          x={plotW - 4}
          y={15}
          fontSize={13}
          fontWeight="600"
          fill={p.muted}
          textAnchor="end"
          fontFamily={d.font}
        >
          {kind === 'precise' ? 'WHAT HAPPENED NEXT' : 'What happened next'}
        </SvgText>
      )}
      {/* Stop, target and entry over the candles, so a candle cannot hide them. */}
      {lines.map((l) => (
        <G key={l.label}>
          <Line
            x1={0}
            x2={plotW}
            y1={y(l.price)}
            y2={y(l.price)}
            stroke={l.color}
            strokeWidth={kind === 'playful' ? 2 : 1.25}
            strokeDasharray={l.dash ? '5 4' : undefined}
          />
          {/* A label on the ground's colour, so a candle under it cannot garble it. */}
          <Rect
            x={2}
            y={y(l.price) - 19}
            width={l.label.length * 8 + 8}
            height={17}
            rx={3}
            fill={p.ground}
            opacity={0.92}
          />
          <SvgText
            x={6}
            y={y(l.price) - 6}
            fontSize={13}
            fill={l.color}
            fontWeight="600"
            fontFamily={fontFamily}
          >
            {l.label}
          </SvgText>
        </G>
      ))}
      {exact && last && shown < candles.length && (
        // The live price: a tag on the axis that follows the forming candle.
        <G>
          <Line
            x1={last.i * slot + slot / 2}
            x2={plotW}
            y1={y(last.c.c)}
            y2={y(last.c.c)}
            stroke={p.accent}
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <Rect x={plotW} y={y(last.c.c) - 10} width={axisW} height={20} fill={p.accent} rx={3} />
          <SvgText
            x={plotW + axisW / 2}
            y={y(last.c.c) + 4.5}
            fontSize={13}
            fontWeight="600"
            fill={p.onAccent}
            textAnchor="middle"
            fontFamily={fontFamily}
          >
            {last.c.c.toFixed(2)}
          </SvgText>
        </G>
      )}
    </Svg>
  );
}

/** A labelled HUD (docs/UI.md §7.2 [v4]): nothing is a bare number. */
export function useHudText(h: {
  streak: number;
  today: number;
  goal: number;
  xp: number;
  hearts: number;
}) {
  return useMemo(
    () => ({
      streak: `${h.streak} days`,
      today: `Today ${h.today}/${h.goal}`,
      xp: `${h.xp} XP`,
      hearts: `${h.hearts}`,
    }),
    [h],
  );
}

/** A plain row, for spacing without a StyleSheet. */
export function Row({
  children,
  gap = 8,
  style,
  center = true,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  center?: boolean;
}) {
  return (
    <View
      style={[{ flexDirection: 'row', alignItems: center ? 'center' : 'flex-start', gap }, style]}
    >
      {children}
    </View>
  );
}
