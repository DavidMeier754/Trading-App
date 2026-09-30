import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import Icon from '../home/icons';
import { Flame } from '../home/scenes';
import { colors, MONO_FONT, space, themed, type } from '../theme';
import { dayFeedback, fizzleFeedback, flipFeedback, igniteFeedback } from './feedback';
import { EASE_OUT, SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

/**
 * The streak, full screen (docs/UI.md §7.2; David, 2026-09-29: "an animation
 * for every time the streak is lost or advances ... full screen"; on
 * 2026-09-30: "Make them real nice fancy"). Each comes after something the
 * learner did -- the lesson that met the day's goal, opening the app on a
 * lost streak -- plays once, about two seconds, and then holds still; the key
 * under it ends it. Under reduced motion each shows where it ends, at once.
 *
 * Built for the Animations page (Settings → Testing) in stage LOOK-SYSTEM at
 * David's request; stage LOOP-DAILY shows them in the app's own flow.
 */

/** The flame's fixed colours, like a sticker: the same on every ground. */
const EMBER = ['#FFB02E', '#FFD23F', '#FF6A1A'];
const GLOW = '#FF9F1C';
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** The streak goes up by a day. */
const UP = { ignite: 250, roll: 650, word: 900, week: 1100, today: 1350 } as const;
/** The streak is lost. */
const LOST = { flicker: 300, out: 700, roll: 1200, word: 1450, line: 1650 } as const;

/**
 * Which days of this week, Monday first, the streak covers: the `days` days
 * that end today. Monday to Wednesday and today, Thursday, for a streak of 4
 * or more on a Thursday.
 */
export function weekOf(days: number, now = new Date()): { today: number; kept: boolean[] } {
  const today = (now.getDay() + 6) % 7;
  const kept = DAYS.map((_, i) => i <= today && i > today - days);
  return { today, kept };
}

/**
 * The streak goes up a day: the flame catches -- it springs up out of its cold
 * ember with a rush of air, a warm light blooms behind it, rings go out and
 * embers fly up -- the count turns over to the new day with a "+1", and
 * today's dot fills in the week.
 */
export function StreakUp({ from, to, now }: { from: number; to: number; now?: Date }) {
  const reduced = useReduceMotion();
  const [{ today, kept }] = useState(() => weekOf(to, now));
  const lit = useSharedValue(reduced ? 1 : 0);
  const glow = useSharedValue(reduced ? 1 : 0);
  const burst = useSharedValue(0);
  const embers = useSharedValue(0);
  const roll = useSharedValue(reduced ? 1 : 0);
  const bump = useSharedValue(0);
  const plus = useSharedValue(0);
  const word = useSharedValue(reduced ? 1 : 0);
  const week = useSharedValue(reduced ? 1 : 0);
  const fill = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      igniteFeedback();
      return;
    }
    lit.set(withDelay(UP.ignite, withSpring(1, { duration: 750, dampingRatio: 0.5 })));
    glow.set(withDelay(UP.ignite, withTiming(1, { duration: 600, easing: EASE_OUT })));
    burst.set(withDelay(UP.ignite, withTiming(1, { duration: 1000, easing: EASE_OUT })));
    embers.set(withDelay(UP.ignite, withTiming(1, { duration: 1500, easing: Easing.linear })));
    roll.set(withDelay(UP.roll, withSpring(1, { duration: 520, dampingRatio: 0.62 })));
    // The new number lands with a small swell.
    bump.set(
      withDelay(
        UP.roll + 140,
        withSequence(
          withTiming(1, { duration: 120, easing: EASE_OUT }),
          withTiming(0, { duration: 380, easing: EASE_OUT }),
        ),
      ),
    );
    plus.set(withDelay(UP.roll + 120, withTiming(1, { duration: 900, easing: EASE_OUT })));
    word.set(withDelay(UP.word, withTiming(1, { duration: 360, easing: EASE_OUT })));
    week.set(withDelay(UP.week, withTiming(1, { duration: 360, easing: EASE_OUT })));
    fill.set(withDelay(UP.today, withSpring(1, SPRING_POP)));
    const timers = [
      setTimeout(igniteFeedback, UP.ignite),
      setTimeout(flipFeedback, UP.roll + 140),
      setTimeout(dayFeedback, UP.today),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced, lit, glow, burst, embers, roll, bump, plus, word, week, fill]);

  const coldStyle = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, lit.get() * 3) }));
  const litStyle = useAnimatedStyle(() => {
    const t = lit.get();
    return {
      opacity: Math.min(1, t * 2.5),
      transform: [{ translateY: 22 * (1 - t) }, { scale: 0.35 + 0.65 * t }],
    };
  });
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.get(),
    transform: [{ scale: 0.4 + 0.6 * glow.get() }],
  }));
  const bumpStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.12 * bump.get() }] }));
  const plusStyle = useAnimatedStyle(() => {
    const t = plus.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8,
      transform: [{ translateY: -26 * t }, { scale: 0.7 + 0.5 * Math.min(1, t * 3) }],
    };
  });
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.get(),
    transform: [{ translateY: 8 * (1 - word.get()) }],
  }));
  const weekStyle = useAnimatedStyle(() => ({
    opacity: week.get(),
    transform: [{ translateY: 10 * (1 - week.get()) }],
  }));

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${to} day streak`}>
      <View style={styles.stage}>
        <Animated.View style={[styles.layer, glowStyle]}>
          <Glow id="streakUpGlow" color={GLOW} size={STAGE} />
        </Animated.View>
        <Ring t={burst} delay={0} color={EMBER[0]} />
        <Ring t={burst} delay={0.16} color={EMBER[1]} />
        {EMBERS.map((e, i) => (
          <Ember key={i} spec={e} t={embers} />
        ))}
        <Animated.View style={[styles.layer, coldStyle]}>
          <Flame size={FLAME} lit={false} id="suCold" />
        </Animated.View>
        <Animated.View style={[styles.layer, litStyle]}>
          <Flame size={FLAME} id="suLit" />
        </Animated.View>
      </View>
      <View>
        <Animated.View style={bumpStyle}>
          <Roll from={from} to={to} t={roll} up color={colors.warning} from0={colors.textMuted} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.plus, plusStyle]}>
          <Text style={styles.plusText}>+1</Text>
        </Animated.View>
      </View>
      <Animated.Text style={[styles.word, wordStyle]}>day streak</Animated.Text>
      <Animated.View style={[styles.week, weekStyle]}>
        {DAYS.map((day, i) => (
          <View key={i} style={styles.day}>
            <Text style={[styles.dayName, i === today && { color: colors.text }]}>{day}</Text>
            <View style={[styles.dot, (!kept[i] || i === today) && styles.dotEmpty]}>
              {kept[i] && i !== today ? <DayDone /> : null}
              {i === today ? <DayToday t={fill} /> : null}
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

/**
 * The streak is lost: the flame gutters -- it dips and flickers -- then goes
 * out with a breath of air, smoke curling up from where it was, and it stands
 * cold and grey; the count rolls down to nought. Friendly, never guilty
 * (docs/UI.md §7.2): no red, and a new streak starts today.
 */
export function StreakLost({ lost }: { lost: number }) {
  const reduced = useReduceMotion();
  const gutter = useSharedValue(1);
  const out = useSharedValue(reduced ? 1 : 0);
  const smoke = useSharedValue(0);
  const roll = useSharedValue(reduced ? 1 : 0);
  const word = useSharedValue(reduced ? 1 : 0);
  const line = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      fizzleFeedback();
      return;
    }
    // Three dips, each deeper, as a candle does before it goes.
    gutter.set(
      withDelay(
        LOST.flicker,
        withSequence(
          withTiming(0.9, { duration: 90 }),
          withTiming(1.02, { duration: 70 }),
          withTiming(0.84, { duration: 90 }),
          withTiming(0.97, { duration: 70 }),
          withTiming(0.76, { duration: 80 }),
        ),
      ),
    );
    out.set(withDelay(LOST.out, withTiming(1, { duration: 520, easing: EASE_OUT })));
    smoke.set(withDelay(LOST.out, withTiming(1, { duration: 1500, easing: Easing.linear })));
    roll.set(withDelay(LOST.roll, withTiming(1, { duration: 480, easing: EASE_OUT })));
    word.set(withDelay(LOST.word, withTiming(1, { duration: 360, easing: EASE_OUT })));
    line.set(withDelay(LOST.line, withTiming(1, { duration: 360, easing: EASE_OUT })));
    const t = setTimeout(fizzleFeedback, LOST.out);
    return () => clearTimeout(t);
  }, [reduced, gutter, out, smoke, roll, word, line]);

  const litStyle = useAnimatedStyle(() => {
    const o = out.get();
    const g = gutter.get();
    return {
      opacity: (1 - Math.min(1, o * 1.6)) * (0.55 + 0.45 * g),
      transform: [{ translateY: 10 * o }, { scale: g * (1 - 0.4 * o) }],
    };
  });
  const coldStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, out.get() * 1.4),
    transform: [{ translateY: 10 * out.get() }, { scale: 0.86 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: (1 - out.get()) * (0.4 + 0.6 * gutter.get()),
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.get(),
    transform: [{ translateY: 8 * (1 - word.get()) }],
  }));
  const lineStyle = useAnimatedStyle(() => ({
    opacity: line.get(),
    transform: [{ translateY: 8 * (1 - line.get()) }],
  }));

  return (
    <View style={styles.wrap} accessible accessibilityLabel="Streak lost. A new one starts today.">
      <View style={styles.stage}>
        <Animated.View style={[styles.layer, glowStyle]}>
          <Glow id="streakLostGlow" color={GLOW} size={STAGE} />
        </Animated.View>
        <Animated.View style={[styles.layer, coldStyle]}>
          <Flame size={FLAME} lit={false} id="slCold" />
        </Animated.View>
        <Animated.View style={[styles.layer, litStyle]}>
          <Flame size={FLAME} id="slLit" />
        </Animated.View>
        {WISPS.map((w, i) => (
          <Wisp key={i} spec={w} t={smoke} />
        ))}
      </View>
      <Roll from={lost} to={0} t={roll} color={colors.textMuted} from0={colors.warning} />
      <Animated.Text style={[styles.word, wordStyle]}>Streak lost</Animated.Text>
      <Animated.Text style={[styles.line, lineStyle]}>A new one starts today.</Animated.Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

const STAGE = 250;
const FLAME = 124;
const NUMBER = { fontSize: 72, lineHeight: 86 };

/** A warm light behind the flame. */
function Glow({ id, color, size }: { id: string; color: string; size: number }) {
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="55%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity="0.36" />
          <Stop offset="0.55" stopColor={color} stopOpacity="0.1" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={size} height={size} fill={`url(#${id})`} />
    </Svg>
  );
}

/** A ring going out from the flame as it catches, `delay` of the way behind the first. */
function Ring({ t, delay, color }: { t: SharedValue<number>; delay: number; color: string }) {
  const style = useAnimatedStyle(() => {
    const u = Math.max(0, (t.get() - delay) / (1 - delay));
    return {
      opacity: u <= 0 || u >= 1 ? 0 : 0.65 * (1 - u),
      transform: [{ scale: 0.5 + 1.1 * u }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: color }, style]} />
  );
}

type EmberSpec = {
  angle: number;
  dist: number;
  size: number;
  start: number;
  span: number;
  color: string;
  sway: number;
};
/** Fourteen embers flying up and out, each on its own line, at its own time and pace. */
const EMBERS: EmberSpec[] = Array.from({ length: 14 }, (_, i) => ({
  angle: (((i * 53) % 120) - 60) * (Math.PI / 180),
  dist: 80 + ((i * 37) % 70),
  size: 4 + (i % 3) * 2,
  start: (i % 5) * 0.05,
  span: 0.5 + (i % 4) * 0.12,
  color: EMBER[i % EMBER.length],
  sway: i % 2 ? 6 : -6,
}));

function Ember({ spec, t }: { spec: EmberSpec; t: SharedValue<number> }) {
  const { angle, dist, size, start, span, sway } = spec;
  const style = useAnimatedStyle(() => {
    const raw = Math.min(1, Math.max(0, (t.get() - start) / span));
    const u = 1 - (1 - raw) * (1 - raw);
    return {
      opacity: raw <= 0 || raw >= 1 ? 0 : raw < 0.12 ? raw / 0.12 : 1 - (raw - 0.12) / 0.88,
      transform: [
        { translateX: Math.sin(angle) * dist * u + sway * Math.sin(u * Math.PI * 2) },
        { translateY: -Math.cos(angle) * dist * u - 20 * u },
        { scale: 1 - 0.6 * u },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ember,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: spec.color,
          left: STAGE / 2 - size / 2,
          top: STAGE / 2 + 10 - size / 2,
        },
        style,
      ]}
    />
  );
}

type WispSpec = { start: number; drift: number; rise: number; size: number };
/** Three wisps of smoke curling up from where the flame was. */
const WISPS: WispSpec[] = [
  { start: 0, drift: -14, rise: 90, size: 26 },
  { start: 0.12, drift: 12, rise: 110, size: 30 },
  { start: 0.24, drift: -4, rise: 80, size: 22 },
];

function Wisp({ spec, t }: { spec: WispSpec; t: SharedValue<number> }) {
  const { start, drift, rise, size } = spec;
  const style = useAnimatedStyle(() => {
    const raw = Math.min(1, Math.max(0, (t.get() - start) / 0.7));
    const u = 1 - (1 - raw) * (1 - raw);
    return {
      opacity:
        raw <= 0 || raw >= 1 ? 0 : 0.42 * (raw < 0.15 ? raw / 0.15 : 1 - (raw - 0.15) / 0.85),
      transform: [
        { translateX: drift * u + 5 * Math.sin(u * Math.PI * 1.5) },
        { translateY: -rise * u },
        { scale: 0.4 + 1.2 * u },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wisp,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: STAGE / 2 - size / 2,
          top: STAGE / 2 - FLAME * 0.45 - size / 2,
        },
        style,
      ]}
    />
  );
}

/**
 * A big number turning over: the old one leaves and the new one comes in, up
 * for a streak going on (`up`), down for one lost, its colour changing with it.
 */
function Roll({
  from,
  to,
  t,
  up = false,
  color,
  from0,
}: {
  from: number;
  to: number;
  t: SharedValue<number>;
  up?: boolean;
  /** The new number's colour, and the old one's. */
  color: string;
  from0: string;
}) {
  const dir = up ? -1 : 1;
  const outStyle = useAnimatedStyle(() => {
    const u = Math.min(1, Math.max(0, t.get()));
    return {
      opacity: 1 - u,
      transform: [{ translateY: dir * NUMBER.lineHeight * 0.7 * u }],
    };
  });
  const inStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, t.get())),
    transform: [{ translateY: -dir * NUMBER.lineHeight * 0.7 * (1 - t.get()) }],
  }));
  return (
    <View style={styles.roll}>
      <Animated.Text style={[styles.number, { color: from0 }, outStyle]}>
        {String(from)}
      </Animated.Text>
      <Animated.Text style={[styles.number, { color }, inStyle]}>{String(to)}</Animated.Text>
    </View>
  );
}

function DayDone() {
  return (
    <View style={styles.dotFill}>
      <Icon name="check" size={15} color="#FFFFFF" strokeWidth={3.4} />
    </View>
  );
}

/** Today's dot filling: it springs in with a check, and a ring goes out round it. */
function DayToday({ t }: { t: SharedValue<number> }) {
  const fillStyle = useAnimatedStyle(() => ({
    opacity: t.get() > 0.01 ? 1 : 0,
    transform: [{ scale: t.get() }],
  }));
  const ringStyle = useAnimatedStyle(() => {
    const u = Math.min(1, Math.max(0, t.get()));
    return {
      opacity: u <= 0 || u >= 1 ? 0 : 0.7 * (1 - u),
      transform: [{ scale: 1 + 0.9 * u }],
    };
  });
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.dayRing, ringStyle]} />
      <Animated.View style={[styles.dotFill, fillStyle]}>
        <Icon name="check" size={15} color="#FFFFFF" strokeWidth={3.4} />
      </Animated.View>
    </>
  );
}

const styles = themed(() => ({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: space.xs },
  stage: { width: STAGE, height: STAGE - 30, alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
  },
  ember: { position: 'absolute' },
  wisp: { position: 'absolute', backgroundColor: '#8A95A3' },
  roll: { height: NUMBER.lineHeight, minWidth: 160, alignItems: 'center' },
  number: {
    position: 'absolute',
    fontSize: NUMBER.fontSize,
    lineHeight: NUMBER.lineHeight,
    fontWeight: '800',
    fontFamily: MONO_FONT,
    fontVariant: ['tabular-nums'],
  },
  plus: { position: 'absolute', right: -6, top: 4 },
  plusText: { ...type.title, color: colors.warning, fontFamily: MONO_FONT },
  word: { ...type.title, color: colors.text },
  line: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  week: { flexDirection: 'row', gap: 10, marginTop: space.xl },
  day: { alignItems: 'center', gap: 6 },
  dayName: { ...type.small, color: colors.textMuted },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotEmpty: { borderWidth: 1.5, borderColor: colors.borderStrong },
  dotFill: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GLOW,
  },
}));
