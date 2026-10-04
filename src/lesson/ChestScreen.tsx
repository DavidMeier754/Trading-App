import React, { useEffect, useRef, useState } from 'react';
import { LayoutRectangle, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { Gem } from '../home/scenes';
import { earnGems, getProgress } from '../progress';
import { colors, MONO_FONT, space, themed, type } from '../theme';
import {
  badgeFeedback,
  coinFeedback,
  noteFeedback,
  rattleFeedback,
  unlockFeedback,
} from './feedback';
import { tint } from './look';
import { EASE_IN_OUT, EASE_OUT, SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** What a chest pays: one gem for each that springs out of it. */
export const CHEST_PAYOUT = 5;

const CHEST_W = 156;
const LID_H = 58;
const BASE_H = 80;
const AREA_W = 270;
const AREA_H = 250;
/** Where the lid meets the base, from the top of the area. */
const SEAM_Y = AREA_H - 8 - BASE_H;
const RAYS = 224;
const GLOW_W = 220;
const GLOW_H = 110;
const GEM_SIZE = 28;
/** The chest's own colours, like a sticker: the same on every ground. */
const WOOD_INK = '#3E2410';
const GOLD = '#F2B544';
const GOLD_INK = '#9A6210';
/** Taps it takes: two rattles, and the third opens it. */
const TAPS = 3;
const HINTS = ['Tap the chest to open it', 'Tap again', 'One more tap'];
/**
 * The opening, in ms: the chest gathers itself and the lid flies; the gems
 * spring out round it, hang a moment and fly one after another into the
 * counter.
 */
const OPEN = { gather: 90, payout: 560, leave: 1250, gap: 110, flyMs: 560 } as const;
/** Where the gems land round the opening before they fly, and how far they turn. */
const SPRAY = [
  { x: -88, y: -58, spin: -160 },
  { x: -48, y: -108, spin: -120 },
  { x: 0, y: -132, spin: 140 },
  { x: 48, y: -108, spin: 180 },
  { x: 88, y: -58, spin: 200 },
];

/** When gem `i` lands on the counter, from the opening. */
function homeAt(i: number): number {
  return OPEN.leave + i * OPEN.gap + OPEN.flyMs;
}

/** Twelve rays of light round a centre, each a thin wedge. */
const RAY_PATH = Array.from({ length: 12 }, (_, i) => {
  const c = RAYS / 2;
  const a0 = (i / 12) * Math.PI * 2;
  const a1 = a0 + Math.PI / 16;
  const at = (a: number) =>
    `${(c + Math.cos(a) * c).toFixed(1)} ${(c + Math.sin(a) * c).toFixed(1)}`;
  return `M${c} ${c} L${at(a0)} L${at(a1)} Z`;
}).join(' ');

type Point = { x: number; y: number };

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW] "A chest for a perfect lesson" and "Gems fly
 * to the counter" (David's picks of 2026-10-04): the first time a lesson is
 * played without a mistake, it leaves a chest, after its last screen and
 * before the summary. Each tap on it rattles it harder, with light leaking
 * from under its lid, and the third bursts it open -- the key under it ("Open
 * the chest") opens it at once, as the tap path. The lid flies up, rays of
 * light turn once behind it, and five gems spring out round the opening, hang
 * a moment and fly on bowed paths into the gem counter above, which counts
 * each one in with a note a step higher and shines when the last is home.
 *
 * The gems are the learner's the moment it opens (progress.ts, earnGems). A
 * lesson already played perfectly once leaves none, so a chest is not farmed.
 */
export default function ChestScreen({
  open,
  onOpen,
  demo = false,
}: {
  open: boolean;
  onOpen: () => void;
  /** Settings → Testing → Animations: plays it all and pays nothing. */
  demo?: boolean;
}) {
  const reduced = useReduceMotion();
  const [taps, setTaps] = useState(0);
  const [held] = useState(() => getProgress().gems);
  const [count, setCount] = useState(held);
  const paid = useRef(false);
  const swing = useSharedValue(0);
  const hop = useSharedValue(0);
  const squash = useSharedValue(0);
  const leak = useSharedValue(0);
  const lid = useSharedValue(0);
  const rays = useSharedValue(0);
  const payout = useSharedValue(0);
  const bump = useSharedValue(0);
  const shine = useSharedValue(0);
  // Where the chest and the counter sit, so the gems leave one and land on the other.
  const [area, setArea] = useState<LayoutRectangle | null>(null);
  const [counter, setCounter] = useState<LayoutRectangle | null>(null);

  const onTap = () => {
    if (open) return;
    const n = taps + 1;
    setTaps(n);
    leak.set(reduced ? n / TAPS : withTiming(n / TAPS, { duration: 220, easing: EASE_OUT }));
    if (n >= TAPS) {
      onOpen();
      return;
    }
    rattleFeedback();
    if (reduced) return;
    // Three swings, harder each tap.
    const a = 4 + n * 3;
    swing.set(
      withSequence(
        withTiming(-a, { duration: 45, easing: EASE_OUT }),
        withTiming(a, { duration: 90, easing: EASE_IN_OUT }),
        withTiming(-a * 0.6, { duration: 90, easing: EASE_IN_OUT }),
        withTiming(a * 0.3, { duration: 70 }),
        withTiming(0, { duration: 80 }),
      ),
    );
    hop.set(
      withSequence(
        withTiming(-3 - n * 2, { duration: 70, easing: EASE_OUT }),
        withSpring(0, { duration: 300, dampingRatio: 0.5 }),
      ),
    );
  };

  useEffect(() => {
    if (!open) return;
    if (!paid.current && !demo) {
      paid.current = true;
      earnGems(CHEST_PAYOUT);
    }
    leak.set(1);
    if (reduced) {
      lid.set(1);
      rays.set(1);
      payout.set(1);
      unlockFeedback();
      const t = setTimeout(badgeFeedback, 320);
      return () => clearTimeout(t);
    }
    squash.set(
      withSequence(
        withTiming(1, { duration: OPEN.gather, easing: EASE_OUT }),
        withSpring(0, { duration: 560, dampingRatio: 0.4 }),
      ),
    );
    lid.set(withDelay(OPEN.gather, withSpring(1, { duration: 760, dampingRatio: 0.5 })));
    // One slow turn that comes to rest: no loop.
    rays.set(withDelay(OPEN.gather, withTiming(1, { duration: 2400, easing: EASE_OUT })));
    payout.set(withDelay(OPEN.payout, withSpring(1, SPRING_POP)));
    const last = homeAt(CHEST_PAYOUT - 1);
    shine.set(withDelay(last + 80, withTiming(1, { duration: 760, easing: EASE_OUT })));
    const timers = [
      setTimeout(unlockFeedback, OPEN.gather),
      setTimeout(badgeFeedback, OPEN.payout),
      ...SPRAY.map((_, i) =>
        setTimeout(() => {
          setCount((c) => c + 1);
          noteFeedback(2 + i);
          bump.set(
            withSequence(
              withTiming(1, { duration: 60, easing: EASE_OUT }),
              withSpring(0, { duration: 320, dampingRatio: 0.5 }),
            ),
          );
        }, homeAt(i)),
      ),
      setTimeout(coinFeedback, last + 80),
    ];
    return () => timers.forEach(clearTimeout);
    // Once, when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const body = useAnimatedStyle(() => {
    const s = squash.get();
    return {
      transform: [
        { translateY: hop.get() },
        { rotate: `${swing.get()}deg` },
        { scaleX: 1 + 0.07 * s },
        { scaleY: 1 - 0.12 * s },
      ],
    };
  });
  const lidStyle = useAnimatedStyle(() => {
    const o = lid.get();
    return {
      transform: [
        { perspective: 600 },
        { translateY: -26 * o },
        { rotateX: `${58 * o}deg` },
        { rotate: `${-7 * o}deg` },
      ],
    };
  });
  const seam = useAnimatedStyle(() => ({
    opacity: 0.9 * leak.get() * Math.max(0, 1 - lid.get() * 2),
  }));
  const glow = useAnimatedStyle(() => ({
    opacity: Math.min(1, 0.55 * leak.get() + 0.6 * Math.min(1, lid.get())),
  }));
  const raysStyle = useAnimatedStyle(() => {
    const r = rays.get();
    return {
      opacity: r <= 0 ? 0 : Math.min(1, r * 6) * (1 - 0.3 * r),
      transform: [{ rotate: `${75 * r}deg` }, { scale: 0.45 + 0.55 * Math.min(1, r * 2.5) }],
    };
  });
  const payoutStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, payout.get() * 2),
    transform: [{ scale: 0.6 + 0.4 * payout.get() }],
  }));
  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.24 * bump.get() }],
  }));
  const sheen = useAnimatedStyle(() => {
    const t = shine.get();
    return { opacity: t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) };
  });
  const gem = colors.gem;
  // Under reduced motion the gems are in the counter the moment it opens.
  const shownCount = open && reduced ? held + CHEST_PAYOUT : count;
  const from: Point = area ? { x: area.x + AREA_W / 2, y: area.y + SEAM_Y } : { x: 0, y: 0 };
  // The counter's gem is the first thing in it.
  const to: Point = counter
    ? { x: counter.x + space.md + 11, y: counter.y + counter.height / 2 }
    : { x: 0, y: 0 };

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Animated.View
          style={[styles.counter, { borderColor: tint(gem, 0.5) }, counterStyle]}
          onLayout={(e) => setCounter(e.nativeEvent.layout)}
          accessible
          accessibilityLabel={`${shownCount} gems`}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.counterGlow, { backgroundColor: tint(gem, 0.22) }, sheen]}
          />
          <Gem size={22} color={gem} />
          <Text style={[styles.counterValue, { color: gem }]}>{shownCount}</Text>
        </Animated.View>
      </View>
      <Text style={styles.kicker}>Perfect lesson</Text>
      <Text style={styles.title}>A chest for you</Text>
      <View style={styles.area} onLayout={(e) => setArea(e.nativeEvent.layout)}>
        <Animated.View pointerEvents="none" style={[styles.rays, raysStyle]}>
          <Svg width={RAYS} height={RAYS}>
            <Defs>
              <RadialGradient id="chestRays" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFE08A" stopOpacity={0.9} />
                <Stop offset="0.6" stopColor="#FFC94D" stopOpacity={0.3} />
                <Stop offset="1" stopColor="#FFC94D" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Path d={RAY_PATH} fill="url(#chestRays)" />
          </Svg>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.glow, glow]}>
          <Svg width={GLOW_W} height={GLOW_H}>
            <Defs>
              <RadialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFE9A8" stopOpacity={0.95} />
                <Stop offset="0.5" stopColor="#FFC94D" stopOpacity={0.35} />
                <Stop offset="1" stopColor="#FFC94D" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={GLOW_W} height={GLOW_H} fill="url(#chestGlow)" />
          </Svg>
        </Animated.View>
        <View style={styles.shadow} />
        {/* No press scale: the rattle is the answer to the tap. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'The chest, open' : 'A chest. Tap it to open it.'}
          accessibilityState={{ disabled: open }}
          disabled={open}
          onPress={onTap}
          style={styles.hit}
        >
          <Animated.View style={[styles.body, body]}>
            <Animated.View style={[styles.lid, lidStyle]}>
              <ChestLid />
            </Animated.View>
            <ChestBase />
            <Animated.View pointerEvents="none" style={[styles.seam, seam]} />
          </Animated.View>
        </Pressable>
      </View>
      <View style={styles.caption}>
        {open ? (
          <Animated.View style={[styles.payout, payoutStyle]}>
            <Gem size={24} color={gem} />
            <Text style={[styles.payoutText, { color: gem }]}>
              <Text style={styles.mono}>{`+${CHEST_PAYOUT}`}</Text> gems
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.hint}>{HINTS[taps]}</Text>
        )}
      </View>
      {open && !reduced && area && counter ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {SPRAY.map((_, i) => (
            <FlyingGem key={i} index={i} from={from} to={to} color={gem} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * One gem: up out of the chest on a spring to its place round the opening, a
 * beat in the air, then along its bowed curve into the counter, gathering
 * speed as if pulled in.
 */
function FlyingGem({
  index,
  from,
  to,
  color,
}: {
  index: number;
  from: Point;
  to: Point;
  color: string;
}) {
  const { x: dx, y: dy, spin } = SPRAY[index];
  const pop = useSharedValue(0);
  const fly = useSharedValue(0);
  useEffect(() => {
    pop.set(
      withDelay(
        OPEN.gather + 60 + index * 55,
        withSpring(1, { duration: 720, dampingRatio: 0.55 }),
      ),
    );
    fly.set(
      withDelay(
        OPEN.leave + index * OPEN.gap,
        withTiming(1, { duration: OPEN.flyMs, easing: Easing.in(Easing.cubic) }),
      ),
    );
  }, [index, pop, fly]);
  const bow = (index % 2 ? 1 : -1) * (40 + (index % 3) * 16);
  const bx = from.x + dx;
  const by = from.y + dy;
  const len = Math.max(1, Math.hypot(to.x - bx, to.y - by));
  const cx = (bx + to.x) / 2 - ((to.y - by) / len) * bow;
  const cy = (by + to.y) / 2 + ((to.x - bx) / len) * bow;
  const style = useAnimatedStyle(() => {
    const p = pop.get();
    const f = fly.get();
    const u = 1 - f;
    // Out of the chest on an arc, then along the curve.
    const x = f > 0 ? u * u * bx + 2 * u * f * cx + f * f * to.x : from.x + dx * p;
    const y =
      f > 0 ? u * u * by + 2 * u * f * cy + f * f * to.y : from.y + dy * p - 120 * p * (1 - p);
    return {
      opacity: p < 0.02 || f > 0.97 ? 0 : 1,
      transform: [
        { translateX: x - GEM_SIZE / 2 },
        { translateY: y - GEM_SIZE / 2 },
        { rotate: `${spin * f}deg` },
        { scale: (0.3 + 0.7 * Math.min(1.1, p)) * (1 - 0.25 * f) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.flyer, style]}>
      <Gem size={GEM_SIZE} color={color} />
    </Animated.View>
  );
}

/** The chest's lid: planks under two gold bands and a gold rim. */
function ChestLid() {
  return (
    <Svg width={CHEST_W} height={LID_H} viewBox={`0 0 ${CHEST_W} ${LID_H}`}>
      <Defs>
        <LinearGradient id="chestLid" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#B87A3D" />
          <Stop offset="1" stopColor="#7E4B1F" />
        </LinearGradient>
      </Defs>
      <Path
        d="M5 57 V28 Q5 5 30 5 H126 Q151 5 151 28 V57 Z"
        fill="url(#chestLid)"
        stroke={WOOD_INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M18 22 Q22 12 34 11 H122 Q134 12 138 22"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={0.28}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Rect x={30} y={6} width={14} height={50} fill={GOLD} stroke={GOLD_INK} strokeWidth={1.5} />
      <Rect x={112} y={6} width={14} height={50} fill={GOLD} stroke={GOLD_INK} strokeWidth={1.5} />
      <Rect
        x={5}
        y={46}
        width={146}
        height={11}
        rx={2}
        fill={GOLD}
        stroke={GOLD_INK}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

/** The chest's base: planks, the same bands, and the lock. */
function ChestBase() {
  return (
    <Svg width={CHEST_W} height={BASE_H} viewBox={`0 0 ${CHEST_W} ${BASE_H}`}>
      <Defs>
        <LinearGradient id="chestBase" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9C602C" />
          <Stop offset="1" stopColor="#663B18" />
        </LinearGradient>
      </Defs>
      <Path
        d="M5 1 H151 V68 Q151 77 142 77 H14 Q5 77 5 68 Z"
        fill="url(#chestBase)"
        stroke={WOOD_INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Line
        x1={7}
        x2={149}
        y1={42}
        y2={42}
        stroke={WOOD_INK}
        strokeOpacity={0.45}
        strokeWidth={1.5}
      />
      <Rect x={30} y={1} width={14} height={76} fill={GOLD} stroke={GOLD_INK} strokeWidth={1.5} />
      <Rect x={112} y={1} width={14} height={76} fill={GOLD} stroke={GOLD_INK} strokeWidth={1.5} />
      <Rect
        x={64}
        y={6}
        width={28}
        height={30}
        rx={5}
        fill={GOLD}
        stroke={GOLD_INK}
        strokeWidth={1.5}
      />
      <Circle cx={78} cy={18} r={4} fill={GOLD_INK} />
      <Rect x={76.5} y={19} width={3} height={9} rx={1} fill={GOLD_INK} />
    </Svg>
  );
}

const styles = themed(() => ({
  wrap: { alignItems: 'center', gap: space.sm, alignSelf: 'stretch' },
  top: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-end' },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  counterGlow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  counterValue: { ...type.body, fontWeight: '800', fontFamily: MONO_FONT },
  kicker: { ...type.label, color: colors.warning, textTransform: 'uppercase', letterSpacing: 1.6 },
  title: { ...type.title, color: colors.text, textAlign: 'center' },
  area: { width: AREA_W, height: AREA_H },
  rays: {
    position: 'absolute',
    left: AREA_W / 2 - RAYS / 2,
    top: SEAM_Y - 18 - RAYS / 2,
    width: RAYS,
    height: RAYS,
  },
  glow: {
    position: 'absolute',
    left: AREA_W / 2 - GLOW_W / 2,
    top: SEAM_Y - GLOW_H / 2,
    width: GLOW_W,
    height: GLOW_H,
  },
  shadow: {
    position: 'absolute',
    left: AREA_W / 2 - 72,
    top: SEAM_Y + BASE_H - 8,
    width: 144,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  hit: {
    position: 'absolute',
    left: (AREA_W - CHEST_W) / 2,
    top: SEAM_Y - LID_H,
    width: CHEST_W,
    height: LID_H + BASE_H,
  },
  // It turns and squashes about the middle of its bottom, where it stands.
  body: { width: CHEST_W, height: LID_H + BASE_H, transformOrigin: 'bottom' },
  lid: { transformOrigin: 'bottom' },
  seam: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: LID_H - 3,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE08A',
  },
  caption: { height: 40, alignItems: 'center', justifyContent: 'center' },
  hint: { ...type.label, color: colors.textMuted },
  payout: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  payoutText: { ...type.title },
  mono: { fontFamily: MONO_FONT },
  flyer: { position: 'absolute', left: 0, top: 0 },
}));
