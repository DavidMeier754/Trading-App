import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import {
  coinFeedback,
  doneFeedback,
  flipFeedback,
  landFeedback,
  noteFeedback,
} from '../../lesson/feedback';
import { inkOn, shade } from '../../lesson/look';
import { EASE_IN_OUT, EASE_OUT, SPRING_POP, usePressFeedback } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, MONO_FONT, radius, space, themed, type } from '../../theme';
import Icon, { type IconName } from '../icons';
import { DemoKey, KeyRow, Suggestion } from './kit';

/** Ideas for the path map: its buttons, its cards, the line between them, the whole course. */
export const MAP: Suggestion[] = [
  {
    id: 'coin-level',
    section: 'map',
    icon: 'coin',
    title: 'Finished levels turn into coins',
    line: 'A level you finish spins over and becomes a gold coin with its check.',
    again: 'Start again',
    Preview: CoinLevel,
  },
  {
    id: 'card-grows',
    section: 'map',
    icon: 'zoom',
    title: 'The level card grows out of its button',
    line: 'Tap a level: its card opens out of the button itself instead of fading in under it.',
    again: 'Start again',
    Preview: CardGrows,
  },
  {
    id: 'spark-cards',
    section: 'map',
    icon: 'trend',
    title: 'Chapter cards with a sparkline',
    line: 'Each chapter card draws how its levels went, a point per level, instead of a plain bar.',
    Preview: SparkCards,
  },
  {
    id: 'price-path',
    section: 'map',
    icon: 'zigzag',
    title: 'The path as a price line',
    line: 'Levels are joined by a price line instead of dots: lit up to where you are, dim after.',
    Preview: PricePath,
  },
  {
    id: 'tier-overview',
    section: 'map',
    icon: 'levels',
    title: 'All eight chapters at a glance',
    line: 'The whole course as tiers. Tap a tier to dive into its chapter, and back out again.',
    note: 'Planned in docs/UI.md §7.1 for the map, not built yet.',
    again: 'Start again',
    Preview: TierOverview,
  },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ---------------------------------------------------------------------------
// The map's level button, drawn
// ---------------------------------------------------------------------------

/** The map's sizes (home/LevelNode.tsx): a 66 pt button in an 86 pt ring. */
export const RING = 86;
export const NODE = 66;
const STROKE = 6;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export type Status = 'done' | 'current' | 'locked';

type Pt = { x: number; y: number };

/** Clamped to 0..1. */
function unit(v: number): number {
  'worklet';
  return Math.min(1, Math.max(0, v));
}

/** A level's face in each state, as the map colours it. */
function faceOf(status: Status): string {
  return status === 'locked'
    ? colors.surfaceAlt
    : status === 'done'
      ? colors.success
      : colors.accent;
}

/**
 * A level's button as the map draws it, still: the face in its state's colour
 * with the level's symbol, the ring of a level still open (filled by its
 * lessons done), and the check of a finished level or the lock of a locked
 * one. `node` draws it smaller, everything in proportion.
 */
export function LevelButton({
  status,
  icon,
  fill = 0,
  node = NODE,
}: {
  status: Status;
  icon: IconName;
  /** The share of its lessons done, 0 to 1, on the ring of the level being played. */
  fill?: number;
  node?: number;
}) {
  const k = node / NODE;
  const ring = Math.round(RING * k);
  const stroke = STROKE * k;
  const r = (ring - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const badge = Math.max(20, Math.round(26 * k));
  const inset = (ring - node) / 2 - 5 * k;
  const locked = status === 'locked';
  return (
    <View style={[styles.button, { width: ring, height: ring }]}>
      {status === 'done' ? null : (
        <Svg width={ring} height={ring} style={StyleSheet.absoluteFill}>
          <Circle
            cx={ring / 2}
            cy={ring / 2}
            r={r}
            stroke={colors.surfaceAlt}
            strokeWidth={stroke}
            fill="none"
          />
          {!locked && fill > 0 ? (
            <Circle
              cx={ring / 2}
              cy={ring / 2}
              r={r}
              stroke={colors.accent}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${circ} ${circ}`}
              strokeDashoffset={circ * (1 - fill)}
              rotation={-90}
              origin={`${ring / 2}, ${ring / 2}`}
            />
          ) : null}
        </Svg>
      )}
      <View
        style={[
          styles.face,
          { width: node, height: node, borderRadius: node / 2, backgroundColor: faceOf(status) },
          locked && styles.faceLocked,
        ]}
      >
        <Icon
          name={icon}
          size={Math.round(30 * k)}
          color={locked ? colors.textFaint : '#FFFFFF'}
          strokeWidth={2.4}
        />
      </View>
      {status === 'current' ? null : (
        <View
          style={[
            styles.badge,
            { width: badge, height: badge, borderRadius: badge / 2, right: inset, bottom: inset },
            locked ? styles.lockBadge : { backgroundColor: colors.success },
          ]}
        >
          <Icon
            name={locked ? 'lock' : 'check'}
            size={Math.round(badge * (locked ? 0.5 : 0.54))}
            color={locked ? colors.textMuted : '#FFFFFF'}
            strokeWidth={locked ? 2 : 3.4}
          />
        </View>
      )}
    </View>
  );
}

/** The tag over the level waiting for the learner (LevelNode's), still. Sits in a level's ring box. */
export function StartTag({ label = 'START' }: { label?: string }) {
  return (
    <View pointerEvents="none" style={styles.tagWrap}>
      <View style={styles.tag}>
        <Text style={styles.tagText} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.tagPoint} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Finished levels turn into coins
// ---------------------------------------------------------------------------

/** The coin's beats, in ms from the tap: it leaves the ground, lands, and catches the light. */
const COIN = { toss: 340, land: 1320, glint: 1500 } as const;
/** Two and a half turns, so it lands on its other face. */
const TURNS = 5 * Math.PI;
/** How high the toss goes, in points. */
const TOSS = 30;
/** A curved four-point star, 12 across. */
const STAR =
  'M6 0C6.6 3.6 8.4 5.4 12 6C8.4 6.6 6.6 8.4 6 12C5.4 8.4 3.6 6.6 0 6C3.6 5.4 5.4 3.6 6 0Z';
/** The sparkles round the coin as it lands: where from its centre, how big, and when (a share of the burst). */
const SPARKLES = [
  { x: -48, y: -28, size: 13, at: 0 },
  { x: 44, y: -40, size: 10, at: 0.1 },
  { x: 48, y: 22, size: 12, at: 0.2 },
  { x: -40, y: 36, size: 9, at: 0.3 },
];
/** The notches milled round a coin's rim, in degrees. */
const MILLING = Array.from({ length: 30 }, (_, i) => i * 12);

/**
 * A level finished on the map: its ring fills the rest of the way, then the
 * button is tossed like a coin, turning two and a half times as it rises and
 * falls (its width the cosine of the turn, the faces swapping edge-on), and
 * lands with a thud as a gold coin wearing its check, sparkles going off and a
 * glint running across it. A tap on the level does it too.
 */
function CoinLevel() {
  const reduced = useReduceMotion();
  const [done, setDone] = useState(false);
  const fill = useSharedValue(2 / 3);
  const ringOn = useSharedValue(1);
  const spin = useSharedValue(0);
  const lift = useSharedValue(0);
  const thud = useSharedValue(0);
  const badge = useSharedValue(0);
  const burst = useSharedValue(0);
  const glint = useSharedValue(0);
  const word = useSharedValue(0);
  const press = usePressFeedback(!done, { cue: 'tick' });

  const finish = () => {
    if (done) return;
    setDone(true);
    if (!reduced) return;
    // Reduced motion: where it ends, at once.
    fill.set(1);
    ringOn.set(0);
    spin.set(TURNS);
    badge.set(1);
    word.set(1);
    doneFeedback();
  };

  useEffect(() => {
    if (!done || reduced) return;
    const air = COIN.land - COIN.toss;
    fill.set(withTiming(1, { duration: COIN.toss, easing: EASE_OUT }));
    ringOn.set(withDelay(COIN.toss, withTiming(0, { duration: 240, easing: EASE_OUT })));
    // Fast off the ground, slowing as it comes down to land face up.
    spin.set(
      withDelay(
        COIN.toss,
        withTiming(TURNS, { duration: air + 60, easing: Easing.out(Easing.cubic) }),
      ),
    );
    lift.set(
      withDelay(
        COIN.toss,
        withSequence(
          withTiming(1, { duration: air * 0.46, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: air * 0.54, easing: Easing.in(Easing.quad) }),
        ),
      ),
    );
    // It lands with weight: a squash, and a spring back.
    thud.set(
      withDelay(
        COIN.land,
        withSequence(withTiming(1, { duration: 70, easing: EASE_OUT }), withSpring(0, SPRING_POP)),
      ),
    );
    badge.set(withDelay(COIN.land + 90, withSpring(1, SPRING_POP)));
    burst.set(withDelay(COIN.land, withTiming(1, { duration: 900, easing: EASE_OUT })));
    word.set(withDelay(COIN.land, withTiming(1, { duration: 320, easing: EASE_OUT })));
    glint.set(withDelay(COIN.glint, withTiming(1, { duration: 620, easing: EASE_IN_OUT })));
    const timers = [
      setTimeout(flipFeedback, COIN.toss),
      setTimeout(doneFeedback, COIN.land),
      setTimeout(coinFeedback, COIN.glint + 140),
    ];
    return () => timers.forEach(clearTimeout);
  }, [done, reduced, fill, ringOn, spin, lift, thud, badge, burst, glint, word]);

  // Read here, in render: the styles below are worklets.
  const gold = colors.warning;
  const accent = colors.accent;
  const frontEdge = shade(accent, 0.35);
  const backEdge = shade(gold, 0.35);
  const engrave = inkOn(gold) === '#FFFFFF' ? '#FFFFFF' : shade(gold, 0.55);

  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOn.get() }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - fill.get()) }));
  const tossStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -TOSS * lift.get() },
      { scaleX: 1 + 0.1 * thud.get() },
      { scaleY: 1 - 0.12 * thud.get() },
    ],
  }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(0.001, Math.abs(Math.cos(spin.get()))) }],
  }));
  const frontStyle = useAnimatedStyle(() => ({ opacity: Math.cos(spin.get()) >= 0 ? 1 : 0 }));
  const backStyle = useAnimatedStyle(() => ({ opacity: Math.cos(spin.get()) >= 0 ? 0 : 1 }));
  // A face turned away catches less light...
  const dimStyle = useAnimatedStyle(() => ({
    opacity: 0.4 * (1 - Math.abs(Math.cos(spin.get()))),
  }));
  // ...and edge-on the coin shows its rim.
  const edgeStyle = useAnimatedStyle(() => {
    const c = Math.cos(spin.get());
    return { opacity: unit(1 - Math.abs(c) * 6), backgroundColor: c >= 0 ? frontEdge : backEdge };
  });
  // Its shadow shows on the ground under it while it is up.
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 * lift.get(),
    transform: [{ scaleX: 1 - 0.35 * lift.get() }],
  }));
  const burstStyle = useAnimatedStyle(() => {
    const t = burst.get();
    return {
      opacity: t > 0 && t < 1 ? 0.7 * (1 - t) : 0,
      transform: [{ scale: 1 + 0.75 * t }],
    };
  });
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge.get() > 0.01 ? 1 : 0,
    transform: [{ scale: badge.get() }],
  }));
  const glintStyle = useAnimatedStyle(() => {
    const g = glint.get();
    return {
      opacity: g > 0 && g < 1 ? 1 : 0,
      transform: [{ translateX: -NODE + 2 * NODE * g }, { rotate: '22deg' }],
    };
  });
  const beforeStyle = useAnimatedStyle(() => ({ opacity: 1 - word.get() }));
  const afterStyle = useAnimatedStyle(() => ({
    opacity: word.get(),
    transform: [{ translateY: 6 * (1 - word.get()) }],
  }));

  return (
    <View style={styles.column}>
      <View style={styles.coinStage}>
        <View style={styles.coinRow}>
          <Animated.View style={press.style}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                done ? 'Level 1: The Candle. Done' : 'Level 1: The Candle. 2 of 3 lessons done'
              }
              accessibilityState={{ disabled: done }}
              disabled={done}
              onPressIn={press.onPressIn}
              onPressOut={press.onPressOut}
              onPress={finish}
              style={styles.coinBox}
            >
              <Animated.View pointerEvents="none" style={[styles.coinShadow, shadowStyle]} />
              <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, ringStyle]}>
                <Svg width={RING} height={RING}>
                  <Circle
                    cx={RING / 2}
                    cy={RING / 2}
                    r={R}
                    stroke={colors.surfaceAlt}
                    strokeWidth={STROKE}
                    fill="none"
                  />
                  <AnimatedCircle
                    cx={RING / 2}
                    cy={RING / 2}
                    r={R}
                    stroke={accent}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${CIRC} ${CIRC}`}
                    strokeDashoffset={CIRC / 3}
                    rotation={-90}
                    origin={`${RING / 2}, ${RING / 2}`}
                    animatedProps={ringProps}
                  />
                </Svg>
              </Animated.View>
              <Animated.View
                pointerEvents="none"
                style={[styles.coinBurst, { borderColor: gold }, burstStyle]}
              />
              {SPARKLES.map((s, i) => (
                <Sparkle key={i} spec={s} t={burst} color={gold} />
              ))}
              <Animated.View pointerEvents="none" style={[styles.coinToss, tossStyle]}>
                <Animated.View style={[styles.coinEdge, edgeStyle]} />
                <Animated.View style={[styles.coinSpin, spinStyle]}>
                  <Animated.View style={[styles.coinFace, { backgroundColor: accent }, frontStyle]}>
                    <Icon name="candle" size={30} color="#FFFFFF" strokeWidth={2.4} />
                  </Animated.View>
                  <Animated.View style={[styles.coinFace, backStyle]}>
                    <CoinFace gold={gold} />
                    <Icon name="candle" size={28} color={engrave} strokeWidth={2.4} />
                    <Animated.View style={[styles.glint, glintStyle]}>
                      <View style={styles.glintWide} />
                      <View style={styles.glintThin} />
                    </Animated.View>
                  </Animated.View>
                  <Animated.View style={[styles.coinDim, dimStyle]} />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.badge,
                    styles.coinBadge,
                    { backgroundColor: colors.success },
                    badgeStyle,
                  ]}
                >
                  <Icon name="check" size={14} color="#FFFFFF" strokeWidth={3.4} />
                </Animated.View>
              </Animated.View>
            </Pressable>
          </Animated.View>
          <View style={styles.coinLabel}>
            <Text style={styles.kicker}>Level 1</Text>
            <Text style={styles.levelTitle}>The Candle</Text>
            <View>
              <Animated.Text style={[styles.coinMeta, beforeStyle]}>2 of 3 lessons</Animated.Text>
              <Animated.Text
                style={[styles.coinMeta, styles.coinMetaDone, { color: gold }, afterStyle]}
              >
                Finished
              </Animated.Text>
            </View>
          </View>
        </View>
      </View>
      <KeyRow>
        <DemoKey
          label="Finish the level"
          tone="accent"
          cue="tick"
          disabled={done}
          onPress={finish}
        />
      </KeyRow>
    </View>
  );
}

/** A gold coin's face: a milled rim, an engraved ring, and a shine on its upper left. */
function CoinFace({ gold }: { gold: string }) {
  const c = NODE / 2;
  const rim = shade(gold, 0.3);
  const shine = c - 12;
  const at = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(c + Math.cos(a) * r).toFixed(2)} ${(c + Math.sin(a) * r).toFixed(2)}`;
  };
  return (
    <Svg width={NODE} height={NODE} style={StyleSheet.absoluteFill}>
      <Circle cx={c} cy={c} r={c} fill={gold} />
      {MILLING.map((deg) => (
        <Path
          key={deg}
          d={`M${at(deg, c - 1.5)} L${at(deg, c - 4.5)}`}
          stroke={rim}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      ))}
      <Circle cx={c} cy={c} r={c - 8} fill="none" stroke={rim} strokeWidth={1.6} />
      <Path
        d={`M${at(200, shine)} A${shine} ${shine} 0 0 1 ${at(250, shine)}`}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={0.5}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** A sparkle going off by the coin: it swells, turns and is gone. */
function Sparkle({
  spec,
  t,
  color,
}: {
  spec: (typeof SPARKLES)[number];
  t: SharedValue<number>;
  color: string;
}) {
  const { x, y, size, at } = spec;
  const style = useAnimatedStyle(() => {
    const k = unit((t.get() - at) / 0.45);
    return {
      opacity: k > 0 && k < 1 ? 1 : 0,
      transform: [{ scale: Math.sin(Math.PI * k) }, { rotate: `${90 * k}deg` }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sparkle,
        {
          left: RING / 2 + x - size / 2,
          top: RING / 2 + y - size / 2,
          width: size,
          height: size,
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 12 12">
        <Path d={STAR} fill={color} />
      </Svg>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// The level card grows out of its button
// ---------------------------------------------------------------------------

const GROW_W = 280;
const CARD_H = 192;
const GROW_MS = 460;
const SHRINK_MS = 300;

type GrowStop = {
  x: number;
  y: number;
  status: Status;
  icon: IconName;
  fill: number;
  n: number;
  title: string;
  /** Its lessons, done or not. */
  lessons: boolean[];
  meta: string;
  key: string;
};

const GROW_STOPS: GrowStop[] = [
  {
    x: 66,
    y: 86,
    status: 'done',
    icon: 'coin',
    fill: 1,
    n: 1,
    title: 'Your First Trade',
    lessons: [true, true, true, true],
    meta: 'All 4 lessons done.',
    key: 'Review',
  },
  {
    x: 212,
    y: 104,
    status: 'current',
    icon: 'scale',
    fill: 0.25,
    n: 2,
    title: 'Why Prices Move',
    lessons: [true, false, false, false],
    meta: 'Lesson 2 of 4 · about 3 min',
    key: 'Continue',
  },
];

/** A card sits under its button, as on the map; a finished level has no ring. */
const cardTop = (s: GrowStop) => s.y + (s.status === 'done' ? NODE / 2 : RING / 2) + 14;
const GROW_H = Math.max(...GROW_STOPS.map((s) => cardTop(s) + CARD_H)) + 4;

/**
 * Two levels on a little path. A tap on one opens its card out of the button
 * itself: a blob in the button's colour leaves it and spreads into the card,
 * its corners settling from round to the card's own, and then its words come
 * up. A tap on the button again, or the card's close, folds it back in.
 */
function CardGrows() {
  const reduced = useReduceMotion();
  // The card asked for, and the card drawn: on a switch the old one folds away first.
  const [want, setWant] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const t = useSharedValue(0);
  const inner = useSharedValue(0);

  const tap = (i: number) => {
    if (shown === null) setShown(i);
    setWant((w) => (w === i ? null : i));
  };

  useEffect(() => {
    if (shown === null) return;
    if (want === shown) {
      if (reduced) {
        t.set(1);
        inner.set(withTiming(1, { duration: 140 }));
        return;
      }
      t.set(withTiming(1, { duration: GROW_MS, easing: EASE_OUT }));
      inner.set(withDelay(GROW_MS * 0.45, withTiming(1, { duration: 240, easing: EASE_OUT })));
      const timer = setTimeout(landFeedback, GROW_MS * 0.4);
      return () => clearTimeout(timer);
    }
    // Asked away: its words go first, then it folds back into its button.
    inner.set(withTiming(0, { duration: reduced ? 140 : 110 }));
    if (!reduced) {
      t.set(withDelay(70, withTiming(0, { duration: SHRINK_MS, easing: EASE_IN_OUT })));
    }
    const timer = setTimeout(
      () => {
        t.set(0);
        setShown(want);
      },
      reduced ? 140 : SHRINK_MS + 70,
    );
    return () => clearTimeout(timer);
  }, [want, shown, reduced, t, inner]);

  return (
    <View style={styles.growArea}>
      <Trail a={GROW_STOPS[0]} b={GROW_STOPS[1]} />
      {GROW_STOPS.map((s, i) => (
        <GrowNode key={s.n} stop={s} open={want === i} onPress={() => tap(i)} />
      ))}
      {shown !== null ? (
        <GrowCard
          key={shown}
          stop={GROW_STOPS[shown]}
          t={t}
          inner={inner}
          reduced={reduced}
          onClose={() => setWant(null)}
        />
      ) : null}
    </View>
  );
}

/** The dotted path from one level to the next, lit: the next one is open. */
function Trail({ a, b }: { a: GrowStop; b: GrowStop }) {
  const dots: Pt[] = [];
  const steps = 14;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const e = t * t * (3 - 2 * t);
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * e;
    if (Math.hypot(x - a.x, y - a.y) < NODE / 2 + 10) continue;
    if (Math.hypot(x - b.x, y - b.y) < RING / 2 + 8) continue;
    dots.push({ x, y });
  }
  return (
    <Svg width={GROW_W} height={GROW_H} style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((d, k) => (
        <Circle key={k} cx={d.x} cy={d.y} r={3.4} fill={colors.accent} opacity={0.75} />
      ))}
    </Svg>
  );
}

function GrowNode({ stop, open, onPress }: { stop: GrowStop; open: boolean; onPress: () => void }) {
  const press = usePressFeedback(true, { cue: 'tick' });
  const state =
    stop.status === 'done' ? 'Done' : `${stop.lessons.filter(Boolean).length} of 4 lessons done`;
  return (
    <Animated.View
      style={[styles.growNode, { left: stop.x - RING / 2, top: stop.y - RING / 2 }, press.style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Level ${stop.n}: ${stop.title}. ${state}`}
        accessibilityState={{ expanded: open }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={styles.growPress}
      >
        <LevelButton status={stop.status} icon={stop.icon} fill={stop.fill} />
      </Pressable>
      {stop.status === 'current' ? <StartTag label="CONTINUE" /> : null}
    </Animated.View>
  );
}

/**
 * The card, as a box that starts on its button (its size, its colour, fully
 * round) and spreads to the card's frame under it. Its words are laid out at
 * the card's size from the start, so nothing reflows while it grows.
 */
function GrowCard({
  stop,
  t,
  inner,
  reduced,
  onClose,
}: {
  stop: GrowStop;
  t: SharedValue<number>;
  inner: SharedValue<number>;
  reduced: boolean;
  onClose: () => void;
}) {
  const wash = faceOf(stop.status);
  const tone = stop.status === 'done' ? colors.success : colors.accent;
  const top = cardTop(stop);
  const x0 = stop.x - NODE / 2;
  const y0 = stop.y - NODE / 2;
  const corner = radius.lg;

  const box = useAnimatedStyle(() => {
    const k = reduced ? 1 : t.get();
    return {
      left: x0 * (1 - k),
      top: y0 + (top - y0) * k,
      width: NODE + (GROW_W - NODE) * k,
      height: NODE + (CARD_H - NODE) * k,
      borderRadius: NODE / 2 + (corner - NODE / 2) * k,
      borderWidth: Math.min(1.5, k * 5),
      opacity: reduced ? inner.get() : 1,
    };
  });
  // The button's colour, fading into the card's as it leaves the button.
  const washStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : unit(1 - t.get() * 1.8),
  }));
  const words = useAnimatedStyle(() => ({
    opacity: inner.get(),
    transform: [{ translateY: reduced ? 0 : 6 * (1 - inner.get()) }],
  }));
  const point = useAnimatedStyle(() => ({
    opacity: inner.get(),
    transform: [{ rotate: '45deg' }, { scale: reduced ? 1 : 0.4 + 0.6 * inner.get() }],
  }));

  const done = stop.status === 'done';
  return (
    <>
      <Animated.View style={[styles.growCard, box]}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: wash }, washStyle]}
        />
        <Animated.View style={[styles.growWords, words]}>
          <Text style={[styles.cardKicker, { color: tone }]}>{`Level ${stop.n}`}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {stop.title}
          </Text>
          <View style={styles.segments}>
            {stop.lessons.map((lesson, i) => {
              const next = !done && i === stop.lessons.indexOf(false);
              return (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    lesson && { backgroundColor: colors.success, borderColor: colors.success },
                    next && { borderColor: colors.accent },
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.cardMeta}>{stop.meta}</Text>
          {/* Drawn, not pressable: a picture of the card's key. */}
          <View style={[styles.cardKey, done && styles.cardKeyQuiet]}>
            {done ? null : <Icon name="play" size={16} color={colors.accentText} />}
            <Text style={[styles.cardKeyText, done && { color: colors.text }]} numberOfLines={1}>
              {stop.key}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close the card"
            onPress={onClose}
            style={styles.close}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path
                d="M4.5 4.5l9 9M13.5 4.5l-9 9"
                stroke={colors.textMuted}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </Animated.View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.cardPoint, { left: stop.x - 8, top: top - 9 }, point]}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Chapter cards with a sparkline
// ---------------------------------------------------------------------------

type SparkChapter = { n: number; title: string; levels: number; scores: number[] };

/** How each level went, right answers in per cent: a chapter finished, and one under way. */
const SPARK_CHAPTERS: SparkChapter[] = [
  {
    n: 1,
    title: 'Market Basics',
    levels: 17,
    scores: [72, 80, 77, 88, 85, 91, 86, 93, 90, 84, 92, 95, 89, 96, 94, 97, 98],
  },
  { n: 2, title: 'Charts 101', levels: 18, scores: [82, 76, 88, 85, 91, 89] },
];
const SPARK_H = 36;
/** The line's floor, in per cent: what the cards draw is the top of the range. */
const SPARK_LO = 60;
const SPARK_PAD = 7;

/**
 * Two chapter cards as the map draws them, each with a sparkline in place of
 * its bar: a point per level, as high as its right answers, the last one
 * ringed and its score beside it. A finished chapter's line is gold; one under
 * way draws as far as it has got and dashes the rest.
 */
function SparkCards() {
  return (
    <View style={styles.sparkList}>
      {SPARK_CHAPTERS.map((c) => (
        <SparkCard key={c.n} chapter={c} />
      ))}
    </View>
  );
}

function SparkCard({ chapter }: { chapter: SparkChapter }) {
  const [width, setWidth] = useState(0);
  const played = chapter.scores.length;
  const complete = played >= chapter.levels;
  const tone = complete ? colors.warning : colors.accent;
  const last = chapter.scores[played - 1];
  return (
    <View
      style={styles.sparkCard}
      accessible
      accessibilityLabel={`Chapter ${chapter.n}: ${chapter.title}. ${played} of ${chapter.levels} levels. Right answers per level, the last ${last} %.`}
    >
      <View style={[styles.chapterBadge, complete && { backgroundColor: colors.warning }]}>
        <Icon name="trophy" size={22} color={complete ? colors.background : colors.warning} />
      </View>
      <View style={styles.sparkText}>
        <View style={styles.sparkHead}>
          <Text
            style={[styles.chapterKicker, complete && { color: colors.warning }]}
            numberOfLines={1}
          >
            {`Chapter ${chapter.n}`}
          </Text>
          <Text style={styles.sparkMeta} numberOfLines={1}>
            {`${played}/${chapter.levels} levels`}
          </Text>
        </View>
        <Text style={styles.chapterTitle} numberOfLines={1}>
          {chapter.title}
        </Text>
        <View style={styles.sparkRow}>
          <View style={styles.sparkBox} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
            {width > 0 ? (
              <Sparkline
                id={`spark${chapter.n}`}
                width={width}
                scores={chapter.scores}
                levels={chapter.levels}
                tone={tone}
              />
            ) : null}
          </View>
          <Text style={[styles.sparkLast, { color: tone }]}>{`${last}\u00a0%`}</Text>
        </View>
      </View>
      <Icon name="chevron-down" size={20} color={colors.textMuted} strokeWidth={2.4} />
    </View>
  );
}

function Sparkline({
  id,
  width,
  scores,
  levels,
  tone,
}: {
  id: string;
  width: number;
  scores: number[];
  levels: number;
  tone: string;
}) {
  const x = (i: number) => SPARK_PAD + (i * (width - SPARK_PAD * 2)) / Math.max(1, levels - 1);
  const y = (v: number) =>
    SPARK_PAD + (1 - (v - SPARK_LO) / (100 - SPARK_LO)) * (SPARK_H - SPARK_PAD * 2);
  const pts = scores.map((v, i) => ({ x: x(i), y: y(v) }));
  const end = pts[pts.length - 1];
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${end.x.toFixed(1)} ${SPARK_H} L${pts[0].x.toFixed(1)} ${SPARK_H} Z`;
  return (
    <Svg width={width} height={SPARK_H}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tone} stopOpacity={0.28} />
          <Stop offset="1" stopColor={tone} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${id})`} />
      {/* The levels still to play: the line runs on, dashed, at where it stands. */}
      {scores.length < levels ? (
        <Line
          x1={end.x}
          y1={end.y}
          x2={x(levels - 1)}
          y2={end.y}
          stroke={colors.textFaint}
          strokeOpacity={0.7}
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
      ) : null}
      <Path
        d={line}
        stroke={tone}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.slice(0, -1).map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={1.7} fill={tone} />
      ))}
      <Circle cx={end.x} cy={end.y} r={7} fill={tone} opacity={0.2} />
      <Circle cx={end.x} cy={end.y} r={3.6} fill={tone} stroke={colors.surface} strokeWidth={1.5} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// The path as a price line
// ---------------------------------------------------------------------------

const LINE_W = 280;
const LINE_AMP = 96;
/** The path winds as the map's does: centre, left, centre, right. */
const LINE_WIND = [0, -1, 0, 1];
const LINE_STOPS: { status: Status; icon: IconName; title: string; y: number }[] = [
  { status: 'done', icon: 'coin', title: 'Your First Trade', y: 48 },
  { status: 'done', icon: 'scale', title: 'Why Prices Move', y: 140 },
  // A longer step into the level that is next, so its tag clears the title above it.
  { status: 'current', icon: 'ticket', title: 'The Quote Card', y: 252 },
  { status: 'locked', icon: 'drop', title: 'Volume and Liquidity', y: 344 },
];
const LINE_H = LINE_STOPS[LINE_STOPS.length - 1].y + RING / 2 + 4;
const lineX = (i: number) => LINE_W / 2 + LINE_WIND[i] * LINE_AMP;
/** How far from a level's centre its line stops: the edge of its button, or of its ring. */
const clearOf = (status: Status) => (status === 'done' ? NODE / 2 + 5 : RING / 2 + 3);

/**
 * A price-like line from one level to the next: the map's soft S between them,
 * jittered across its way like the ticks of a price, and still at both ends.
 * Points inside a level's button are left out, so the line stops at its edge.
 */
function priceLine(a: Pt, b: Pt, clearA: number, clearB: number, seed: number): string {
  const n = 28;
  const out: string[] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const e = t * t * (3 - 2 * t);
    const x = a.x + (b.x - a.x) * e;
    const y = a.y + (b.y - a.y) * t;
    // Across the way the line runs here.
    const dx = (b.x - a.x) * 6 * t * (1 - t);
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const tick =
      Math.sin(Math.PI * t) *
      (4.5 * Math.sin(k * 1.9 + seed) +
        2.5 * Math.sin(k * 4.3 + seed * 2.1) +
        (k % 2 ? 1.6 : -1.6));
    const px = x - (dy / len) * tick;
    const py = y + (dx / len) * tick;
    if (Math.hypot(px - a.x, py - a.y) < clearA || Math.hypot(px - b.x, py - b.y) < clearB) {
      continue;
    }
    out.push(`${out.length ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return out.join(' ');
}

/**
 * Four levels of the map, joined by a price line in place of the dotted path:
 * bright, with a soft glow, as far as the level the learner is on, and dashed
 * and dim after it.
 */
function PricePath() {
  const accent = colors.accent;
  const pts = LINE_STOPS.map((s, i) => ({ x: lineX(i), y: s.y }));
  const leg = (i: number) =>
    priceLine(
      pts[i],
      pts[i + 1],
      clearOf(LINE_STOPS[i].status),
      clearOf(LINE_STOPS[i + 1].status),
      i * 2.3 + 0.7,
    );
  const here = LINE_STOPS.findIndex((s) => s.status === 'current');
  const walked = LINE_STOPS.slice(0, here)
    .map((_, i) => leg(i))
    .join(' ');
  const ahead = LINE_STOPS.slice(here, -1)
    .map((_, i) => leg(here + i))
    .join(' ');
  return (
    <View
      style={styles.lineArea}
      accessible
      accessibilityLabel="Four levels joined by a price line: two done, the third next, the fourth locked."
    >
      <Svg width={LINE_W} height={LINE_H} style={StyleSheet.absoluteFill}>
        <Path
          d={walked}
          stroke={accent}
          strokeOpacity={0.1}
          strokeWidth={14}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Path
          d={walked}
          stroke={accent}
          strokeOpacity={0.22}
          strokeWidth={6}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Path
          d={walked}
          stroke={accent}
          strokeWidth={2.4}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Path
          d={ahead}
          stroke={colors.textFaint}
          strokeOpacity={0.6}
          strokeWidth={2}
          strokeDasharray="5 6"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
      {LINE_STOPS.map((s, i) => {
        const x = lineX(i);
        // The title goes on the side the path leaves open, as on the map.
        const left = LINE_WIND[i] > 0;
        const room = left ? x - RING / 2 - space.sm : LINE_W - (x + RING / 2 + space.sm);
        return (
          <View
            key={s.title}
            style={[styles.lineNode, { left: x - RING / 2, top: s.y - RING / 2 }]}
          >
            <LevelButton status={s.status} icon={s.icon} />
            {s.status === 'current' ? <StartTag /> : null}
            <View
              style={[
                styles.nodeLabel,
                { width: Math.max(80, Math.min(170, room)) },
                left ? { right: RING + space.sm } : { left: RING + space.sm },
              ]}
            >
              <Text
                style={[
                  styles.nodeLabelText,
                  s.status === 'locked' && { color: colors.textMuted },
                  left && styles.alignRight,
                ]}
              >
                {s.title}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// All eight chapters at a glance
// ---------------------------------------------------------------------------

const TIER_W = 280;
/** A tier's 48 pt row, and the bar drawn in it. */
const TIER_PITCH = 48;
const TIER_H = 40;
const TIERS_H = TIER_PITCH * 8;
/** Each tier up is this much narrower: a mountain, with Chapter 1 at its foot. */
const TIER_STEP = 12;
const ZOOM_MS = 560;
/** After the zoom, the chapter's levels come in one after another. */
const INSIDE_MS = 620;
const INSIDE_AT = ZOOM_MS * 0.75;
/** The chapter's own path, laid out inside the zoomed tier. */
const INSIDE_W = TIER_W - 3 - space.lg * 2;
const INSIDE_PATH_H = 196;
const INSIDE_NODE = 40;
const INSIDE_RING = Math.round((RING * INSIDE_NODE) / NODE);

type ChapterTier = {
  n: number;
  title: string;
  status: Status;
  levels: number;
  done: number;
  icons: IconName[];
};

const TIERS: ChapterTier[] = [
  {
    n: 1,
    title: 'Market Basics',
    status: 'done',
    levels: 17,
    done: 17,
    icons: ['coin', 'scale', 'pie', 'ticket'],
  },
  {
    n: 2,
    title: 'Charts 101',
    status: 'done',
    levels: 18,
    done: 18,
    icons: ['candle', 'candles', 'zoom', 'volume'],
  },
  {
    n: 3,
    title: 'Orders and Costs',
    status: 'current',
    levels: 19,
    done: 6,
    icons: ['ticket', 'coin', 'scale', 'key'],
  },
  {
    n: 4,
    title: 'Reading Fast Markets',
    status: 'locked',
    levels: 18,
    done: 0,
    icons: ['zigzag', 'gauge', 'volume', 'bolt'],
  },
  {
    n: 5,
    title: 'Finding the Trade',
    status: 'locked',
    levels: 17,
    done: 0,
    icons: ['target', 'zoom', 'news', 'bell'],
  },
  {
    n: 6,
    title: 'Risk and Psychology',
    status: 'locked',
    levels: 19,
    done: 0,
    icons: ['shield', 'pie', 'scale', 'battery'],
  },
  {
    n: 7,
    title: 'Scalping Playbook',
    status: 'locked',
    levels: 19,
    done: 0,
    icons: ['bolt', 'breakout', 'pullback', 'levels'],
  },
  {
    n: 8,
    title: 'The Trading Day',
    status: 'locked',
    levels: 18,
    done: 0,
    icons: ['bell', 'clock', 'monitor', 'trophy'],
  },
];

/** How far into the chapter's arrival level `k` of its path comes in, 0 to 1. */
function insideAt(v: number, k: number): number {
  'worklet';
  return unit((v - 0.12 - k * 0.16) / 0.3);
}

/**
 * The course as a mountain of eight tiers, Chapter 1 at its foot: the
 * chapters done in gold, the one being played in the accent with "You" on it,
 * the rest locked. A tap on a tier zooms it up to fill the view while the
 * others part and fade, and its own path comes in level by level, each a note
 * higher; "All chapters" zooms back out.
 */
function TierOverview() {
  const reduced = useReduceMotion();
  const [sel, setSel] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const z = useSharedValue(0);
  const inner = useSharedValue(0);

  useEffect(() => {
    if (sel === null) return;
    if (!leaving) {
      if (reduced) {
        z.set(1);
        inner.set(withTiming(1, { duration: 140 }));
        return;
      }
      z.set(withTiming(1, { duration: ZOOM_MS, easing: EASE_IN_OUT }));
      inner.set(
        withDelay(INSIDE_AT, withTiming(1, { duration: INSIDE_MS, easing: Easing.linear })),
      );
      const timers = [0, 1, 2, 3].map((k) =>
        setTimeout(() => noteFeedback(2 + k * 2), INSIDE_AT + INSIDE_MS * (0.14 + k * 0.16)),
      );
      return () => timers.forEach(clearTimeout);
    }
    // Back out: the chapter's path goes, and the tier shrinks back into the mountain.
    inner.set(withTiming(0, { duration: reduced ? 140 : 160, easing: EASE_OUT }));
    if (!reduced) {
      z.set(withDelay(120, withTiming(0, { duration: ZOOM_MS - 80, easing: EASE_IN_OUT })));
    }
    const timer = setTimeout(
      () => {
        z.set(0);
        setLeaving(false);
        setSel(null);
      },
      reduced ? 140 : ZOOM_MS + 60,
    );
    return () => clearTimeout(timer);
  }, [sel, leaving, reduced, z, inner]);

  return (
    <View style={styles.tiers}>
      {TIERS.map((tier, i) => (
        <Tier
          key={tier.n}
          tier={tier}
          index={i}
          sel={sel}
          z={z}
          inner={inner}
          onPress={() => setSel((s) => (s === null ? i : s))}
          onBack={() => setLeaving(true)}
        />
      ))}
    </View>
  );
}

function Tier({
  tier,
  index,
  sel,
  z,
  inner,
  onPress,
  onBack,
}: {
  tier: ChapterTier;
  index: number;
  sel: number | null;
  z: SharedValue<number>;
  inner: SharedValue<number>;
  onPress: () => void;
  onBack: () => void;
}) {
  const w = TIER_W - index * TIER_STEP;
  const x = (TIER_W - w) / 2;
  const y = TIERS_H - (index + 1) * TIER_PITCH;
  const chosen = sel === index;
  const away = sel !== null && !chosen;
  const above = sel !== null && index > sel;
  const press = usePressFeedback(sel === null, { cue: 'tick' });
  const fill =
    tier.status === 'done'
      ? colors.warningTint
      : tier.status === 'current'
        ? colors.accentFill
        : colors.surface;
  const edge =
    tier.status === 'done'
      ? colors.warning
      : tier.status === 'current'
        ? colors.accentFill
        : colors.border;
  const ink =
    tier.status === 'done'
      ? colors.warning
      : tier.status === 'current'
        ? colors.accentText
        : colors.textMuted;

  // The chosen tier grows to fill the view; the others part, up and down, and fade.
  const frame = useAnimatedStyle(() => {
    const k = chosen ? z.get() : 0;
    const gone = away ? z.get() : 0;
    return {
      left: x * (1 - k),
      top: y * (1 - k),
      width: w + (TIER_W - w) * k,
      height: TIER_PITCH + (TIERS_H - TIER_PITCH) * k,
      opacity: unit(1 - gone * 1.6),
      transform: [{ translateY: (above ? -28 : 28) * gone }, { scale: 1 - 0.06 * gone }],
    };
  });
  const bar = useAnimatedStyle(() => {
    const k = chosen ? z.get() : 0;
    const inset = ((TIER_PITCH - TIER_H) / 2) * (1 - k);
    return { top: inset, bottom: inset, borderRadius: 10 + 8 * k };
  });
  const wash = useAnimatedStyle(() => ({ opacity: chosen ? unit(1 - z.get() * 1.6) : 1 }));
  const label = useAnimatedStyle(() => ({ opacity: chosen ? unit(1 - z.get() * 3) : 1 }));

  const state =
    tier.status === 'done'
      ? 'Chapter complete'
      : tier.status === 'current'
        ? `You are here, ${tier.done} of ${tier.levels} levels`
        : 'Locked';
  return (
    <Animated.View
      pointerEvents={away ? 'none' : 'box-none'}
      style={[styles.tierSlot, chosen && styles.tierChosen, frame]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Chapter ${tier.n}: ${tier.title}. ${state}`}
        accessibilityState={{ disabled: sel !== null }}
        disabled={sel !== null}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View style={[styles.tierBar, { borderColor: edge }, bar, press.style]}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: fill }, wash]} />
          <Animated.View style={[styles.tierRow, { width: w - 3 }, label]}>
            <Text style={[styles.tierNum, { color: ink }]}>{tier.n}</Text>
            <Text style={[styles.tierTitle, { color: ink }]} numberOfLines={1}>
              {tier.title}
            </Text>
            {tier.status === 'current' ? (
              <View style={styles.you}>
                <Text style={styles.youText}>You</Text>
              </View>
            ) : (
              <Icon
                name={tier.status === 'done' ? 'check' : 'lock'}
                size={16}
                color={tier.status === 'done' ? colors.warning : colors.textFaint}
                strokeWidth={tier.status === 'done' ? 3 : 2}
              />
            )}
          </Animated.View>
        </Animated.View>
      </Pressable>
      {chosen ? <ChapterInside tier={tier} inner={inner} onBack={onBack} /> : null}
    </Animated.View>
  );
}

/** A chapter zoomed in: its name, how far it has got, its path, and the way back out. */
function ChapterInside({
  tier,
  inner,
  onBack,
}: {
  tier: ChapterTier;
  inner: SharedValue<number>;
  onBack: () => void;
}) {
  const head = useAnimatedStyle(() => {
    const k = unit(inner.get() / 0.3);
    return { opacity: k, transform: [{ translateY: 8 * (1 - k) }] };
  });
  const trail = useAnimatedStyle(() => ({ opacity: unit((inner.get() - 0.1) / 0.4) }));
  const foot = useAnimatedStyle(() => ({ opacity: unit((inner.get() - 0.55) / 0.45) }));
  const kicker =
    tier.status === 'done'
      ? colors.warning
      : tier.status === 'current'
        ? colors.accent
        : colors.textMuted;
  const meta =
    tier.status === 'done'
      ? 'Chapter complete'
      : tier.status === 'current'
        ? `${tier.done}/${tier.levels} levels`
        : `Finish Chapter ${tier.n - 1} first.`;
  const states: Status[] =
    tier.status === 'done'
      ? ['done', 'done', 'done', 'done']
      : tier.status === 'current'
        ? ['done', 'done', 'current', 'locked']
        : ['locked', 'locked', 'locked', 'locked'];
  const pts = states.map((_, k) => ({
    x: INSIDE_W / 2 + LINE_WIND[k] * 62,
    y: INSIDE_RING / 2 + 4 + k * 48,
  }));
  const dots: { x: number; y: number; lit: boolean }[] = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k];
    const b = pts[k + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const clear = INSIDE_RING / 2 + 6;
    const n = Math.max(1, Math.floor((len - clear * 2) / 8));
    for (let j = 0; j <= n; j++) {
      const d = clear + ((len - clear * 2) * j) / n;
      dots.push({
        x: a.x + ((b.x - a.x) * d) / len,
        y: a.y + ((b.y - a.y) * d) / len,
        lit: states[k + 1] !== 'locked',
      });
    }
  }
  return (
    <View pointerEvents="box-none" style={styles.inside}>
      <Animated.View style={head}>
        <Text style={[styles.insideKicker, { color: kicker }]}>{`Chapter ${tier.n}`}</Text>
        <Text style={styles.insideTitle} numberOfLines={1}>
          {tier.title}
        </Text>
        <Text style={styles.insideMeta}>{meta}</Text>
      </Animated.View>
      <View pointerEvents="none" style={styles.insidePath}>
        <Animated.View style={[StyleSheet.absoluteFill, trail]}>
          <Svg width={INSIDE_W} height={INSIDE_PATH_H}>
            {dots.map((d, k) => (
              <Circle
                key={k}
                cx={d.x}
                cy={d.y}
                r={2.6}
                fill={d.lit ? colors.accent : colors.surfaceAlt}
                opacity={d.lit ? 0.75 : 1}
              />
            ))}
          </Svg>
        </Animated.View>
        {states.map((s, k) => (
          <InsideNode
            key={k}
            k={k}
            at={pts[k]}
            status={s}
            icon={tier.icons[k]}
            inner={inner}
            you={s === 'current'}
          />
        ))}
      </View>
      <Animated.View style={foot}>
        <KeyRow>
          <DemoKey label="All chapters" cue="tick" onPress={onBack} />
        </KeyRow>
      </Animated.View>
    </View>
  );
}

/** One level of a zoomed chapter, popping in when its turn comes. */
function InsideNode({
  k,
  at,
  status,
  icon,
  inner,
  you,
}: {
  k: number;
  at: Pt;
  status: Status;
  icon: IconName;
  inner: SharedValue<number>;
  you: boolean;
}) {
  const style = useAnimatedStyle(() => {
    const t = insideAt(inner.get(), k);
    return {
      opacity: t,
      transform: [{ scale: 0.6 + 0.4 * t + 0.14 * Math.sin(Math.PI * t) }],
    };
  });
  return (
    <Animated.View
      style={[
        styles.insideNode,
        { left: at.x - INSIDE_RING / 2, top: at.y - INSIDE_RING / 2 },
        style,
      ]}
    >
      <LevelButton status={status} icon={icon} fill={status === 'current' ? 1 / 3 : 0} node={40} />
      {you ? (
        <View style={styles.insideYou}>
          <Text style={styles.youTextOnSurface}>You</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = themed(() => ({
  column: { alignSelf: 'stretch', gap: space.xl },
  kicker: { ...type.small, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  levelTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', color: colors.text },
  alignRight: { textAlign: 'right' },

  // The level button and its tag, as LevelNode draws them.
  button: { alignItems: 'center', justifyContent: 'center' },
  face: { alignItems: 'center', justifyContent: 'center' },
  faceLocked: { borderWidth: 1.5, borderColor: colors.borderStrong },
  badge: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: { backgroundColor: colors.surfaceAlt },
  tagWrap: { position: 'absolute', top: -42, left: -90, right: -90, alignItems: 'center' },
  tag: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { ...type.label, color: colors.accent, letterSpacing: 1.2 },
  tagPoint: {
    width: 10,
    height: 10,
    marginTop: -6,
    backgroundColor: colors.surface,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.accent,
    transform: [{ rotate: '45deg' }],
  },

  // Finished levels turn into coins
  coinStage: { height: 236, alignItems: 'center', justifyContent: 'center' },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  coinBox: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  coinShadow: {
    position: 'absolute',
    left: (RING - 54) / 2,
    top: RING / 2 + NODE / 2 - 5,
    width: 54,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  coinBurst: {
    position: 'absolute',
    left: (RING - NODE) / 2,
    top: (RING - NODE) / 2,
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 3,
  },
  sparkle: { position: 'absolute' },
  coinToss: { width: NODE, height: NODE, transformOrigin: 'bottom' },
  coinEdge: {
    position: 'absolute',
    left: NODE / 2 - 3,
    top: 1,
    width: 6,
    height: NODE - 2,
    borderRadius: 3,
  },
  coinSpin: { width: NODE, height: NODE },
  coinFace: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinDim: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: '#000000',
  },
  glint: {
    position: 'absolute',
    top: -NODE * 0.3,
    left: NODE / 2 - 11,
    width: 22,
    height: NODE * 1.6,
    flexDirection: 'row',
    gap: 5,
  },
  glintWide: { width: 12, backgroundColor: 'rgba(255, 255, 255, 0.5)' },
  glintThin: { width: 5, backgroundColor: 'rgba(255, 255, 255, 0.32)' },
  coinBadge: { right: -5, bottom: -5, width: 26, height: 26, borderRadius: 13 },
  coinLabel: { width: 132, gap: 2 },
  coinMeta: { ...type.label, color: colors.textMuted },
  coinMetaDone: { position: 'absolute', left: 0, top: 0 },

  // The level card grows out of its button
  growArea: { width: GROW_W, height: GROW_H },
  growNode: { position: 'absolute', width: RING, height: RING },
  growPress: { width: RING, height: RING },
  growCard: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  growWords: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: GROW_W - 3,
    height: CARD_H - 3,
    padding: space.lg,
    gap: space.sm,
  },
  cardPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: colors.surface,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  cardKicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { ...type.title, color: colors.text },
  segments: { flexDirection: 'row', gap: 6 },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.surfaceAlt,
  },
  cardMeta: { ...type.small, color: colors.textMuted },
  cardKey: {
    marginTop: space.xs,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.accentFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  cardKeyQuiet: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  cardKeyText: { ...type.prompt, fontSize: 17, color: colors.accentText },
  close: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chapter cards with a sparkline
  sparkList: { alignSelf: 'stretch', gap: space.md },
  sparkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  chapterBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  sparkText: { flex: 1, gap: 2 },
  sparkHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  chapterKicker: {
    ...type.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flexShrink: 1,
  },
  sparkMeta: { ...type.small, color: colors.textMuted, marginLeft: 'auto' },
  chapterTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', color: colors.text },
  sparkRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 2 },
  sparkBox: { flex: 1, height: SPARK_H },
  sparkLast: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700' },

  // The path as a price line
  lineArea: { width: LINE_W, height: LINE_H },
  lineNode: { position: 'absolute', width: RING, height: RING },
  nodeLabel: { position: 'absolute', top: 0, height: RING, justifyContent: 'center' },
  nodeLabelText: { fontSize: 15, lineHeight: 19, fontWeight: '700', color: colors.text },

  // All eight chapters at a glance
  tiers: { width: TIER_W, height: TIERS_H },
  tierSlot: { position: 'absolute' },
  tierChosen: { zIndex: 2 },
  tierBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  tierRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: TIER_H - 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  tierNum: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700', minWidth: 10 },
  tierTitle: { ...type.label, fontWeight: '700', flex: 1 },
  you: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 1,
  },
  youText: { ...type.small, color: colors.accent, fontWeight: '700' },
  inside: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    padding: space.lg,
    gap: space.md,
  },
  insideKicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1 },
  insideTitle: { ...type.prompt, color: colors.text },
  insideMeta: { ...type.small, color: colors.textMuted },
  insidePath: {
    flex: 1,
    alignSelf: 'center',
    width: INSIDE_W,
    maxHeight: INSIDE_PATH_H,
  },
  insideNode: { position: 'absolute', width: INSIDE_RING, height: INSIDE_RING },
  insideYou: {
    position: 'absolute',
    left: INSIDE_RING + space.xs,
    top: INSIDE_RING / 2 - 13,
    height: 26,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
  },
  youTextOnSurface: { ...type.small, color: colors.accent, fontWeight: '700' },
}));
