import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutRectangle, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
import { scheduleOnRN } from 'react-native-worklets';
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

import {
  badgeFeedback,
  celebrateFeedback,
  coinFeedback,
  detentFeedback,
  doneFeedback,
  landFeedback,
  noteFeedback,
  rattleFeedback,
  tapFeedback,
  unlockFeedback,
} from '../../lesson/feedback';
import { shade, surfaceStyle, tint, useLookSpec } from '../../lesson/look';
import { EASE_IN_OUT, EASE_OUT, EASE_SINE, SPRING_POP } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, MONO_FONT, space, themed, type } from '../../theme';
import Icon from '../icons';
import { Gem, PathLogo } from '../scenes';
import type { Suggestion } from './kit';

/** Ideas for the moments that pay out: lesson complete, gems, a badge, a chest. */
export const REWARDS: Suggestion[] = [
  {
    id: 'receipt',
    section: 'rewards',
    icon: 'ticket',
    title: 'Lesson complete as a trade receipt',
    line: 'The summary prints out like an order confirmation, and a FILLED stamp lands on it.',
    again: 'Play again',
    Preview: Receipt,
  },
  {
    id: 'split-flap',
    section: 'rewards',
    icon: 'clock',
    title: 'Numbers on a split-flap board',
    line: 'Results flip in digit by digit, like a departure board.',
    again: 'Play again',
    Preview: SplitFlap,
  },
  {
    id: 'gem-flight',
    section: 'rewards',
    icon: 'star',
    title: 'Gems fly to the counter',
    line: 'Earned gems burst from the reward and fly into the top bar, which counts them in.',
    again: 'Play again',
    Preview: GemFlight,
  },
  {
    id: 'foil-badge',
    section: 'rewards',
    icon: 'trophy',
    title: 'A badge you can tilt',
    line: 'Drag across the chapter badge: it tilts towards your finger and its foil catches the light.',
    again: 'Start again',
    Preview: FoilBadge,
  },
  {
    id: 'coin-confetti',
    section: 'rewards',
    icon: 'coin',
    title: 'Confetti of candles and coins',
    line: 'The celebration throws little green candles and gold coins instead of paper.',
    again: 'Play again',
    Preview: CoinConfetti,
  },
  {
    id: 'chest',
    section: 'rewards',
    icon: 'key',
    title: 'A chest for a perfect lesson',
    line: 'A perfect lesson leaves a chest. Tap it: it shakes, bursts open and pays out gems.',
    again: 'Start again',
    Preview: Chest,
  },
];

// ---------------------------------------------------------------------------
// Lesson complete as a trade receipt
// ---------------------------------------------------------------------------

const SLOT_W = 276;
const SLOT_H = 22;
const PAPER_W = 248;
const PAPER_PAD = 16;
const RULE_W = PAPER_W - PAPER_PAD * 2;
/** The torn edge: half-teeth across the paper (an even number), and how deep they bite. */
const TEETH = 42;
const TEAR = 7;
const STAMP_W = 150;
const STAMP_H = 52;

const RECEIPT_ROWS = [
  { label: 'ANSWERS', value: '8/10' },
  { label: 'ACCURACY', value: '88 %' },
  { label: 'XP', value: '+40' },
  { label: 'STREAK', value: '4 DAYS' },
];
/** The lesson's line, then a line for each row. */
const PRINTS = RECEIPT_ROWS.length + 1;
/**
 * The beats, in ms: the paper feeds out, its lines print one after another
 * (each typed on in `wipe`), and the stamp comes down, landing `thump` later.
 */
const RECEIPT = {
  feed: 160,
  feedMs: 820,
  print: 1020,
  stagger: 140,
  wipe: 180,
  stamp: 1960,
  thump: 150,
} as const;
const PRINT_MS = (PRINTS - 1) * RECEIPT.stagger + RECEIPT.wipe;

/** The torn bottom edge: the paper's shape, and the line along its teeth. */
const TORN = (() => {
  const step = PAPER_W / TEETH;
  const teeth = Array.from(
    { length: TEETH + 1 },
    (_, k) => `L${(PAPER_W - k * step).toFixed(1)} ${k % 2 === 0 ? TEAR : 0}`,
  ).join(' ');
  return { fill: `M0 0 L${PAPER_W} 0 ${teeth} Z`, edge: `M${PAPER_W} 0 ${teeth} L0 0` };
})();

/** A barcode: bars and gaps from a fixed run of widths, the same on every receipt. */
const BARCODE = (() => {
  const widths = [
    3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 1, 2, 2, 1, 3, 3, 1, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2,
    1, 1, 3, 2, 1,
  ];
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ x, w: w * 2 });
    x += w * 2;
  });
  return { bars, width: x };
})();

/** Flecks of ink thrown off the stamp as it lands, round its edge. */
const SPECKS = [
  { x: -88, y: -14, r: 2.4 },
  { x: -72, y: 24, r: 1.8 },
  { x: -20, y: -32, r: 1.6 },
  { x: 26, y: 31, r: 2 },
  { x: 82, y: -22, r: 1.8 },
  { x: 92, y: 12, r: 2.6 },
];

/**
 * Lesson complete as an order confirmation: the paper feeds down out of the
 * printer's slot, the lesson and its numbers print on it one line after
 * another, and a FILLED stamp thumps down on it.
 */
function Receipt() {
  const reduced = useReduceMotion();
  const [height, setHeight] = useState(0);
  const feed = useSharedValue(reduced ? 1 : 0);
  const clock = useSharedValue(reduced ? PRINT_MS : 0);
  const stamp = useSharedValue(reduced ? 1 : 0);
  const ink = useSharedValue(reduced ? 1 : 0);
  const jolt = useSharedValue(0);
  // The paper starts all the way inside the slot, so the feed waits for its height.
  const ready = reduced || height > 0;

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      landFeedback();
      return;
    }
    const hit = RECEIPT.stamp + RECEIPT.thump;
    feed.set(
      withDelay(
        RECEIPT.feed,
        // Near a steady speed, as a printer's motor feeds it.
        withTiming(1, { duration: RECEIPT.feedMs, easing: EASE_SINE }),
      ),
    );
    clock.set(
      withDelay(RECEIPT.print, withTiming(PRINT_MS, { duration: PRINT_MS, easing: Easing.linear })),
    );
    stamp.set(
      withDelay(
        RECEIPT.stamp,
        withSequence(
          withTiming(1.05, { duration: RECEIPT.thump, easing: Easing.in(Easing.quad) }),
          withSpring(1, { duration: 380, dampingRatio: 0.5 }),
        ),
      ),
    );
    ink.set(withDelay(hit, withTiming(1, { duration: 520, easing: EASE_OUT })));
    jolt.set(
      withDelay(
        hit,
        withSequence(
          withTiming(1, { duration: 40 }),
          withSpring(0, { duration: 360, dampingRatio: 0.45 }),
        ),
      ),
    );
    // A tick for each line printed, and the thump.
    const timers = [
      ...Array.from({ length: PRINTS }, (_, i) =>
        setTimeout(detentFeedback, RECEIPT.print + i * RECEIPT.stagger),
      ),
      setTimeout(landFeedback, hit),
    ];
    return () => timers.forEach(clearTimeout);
  }, [ready, reduced, feed, clock, stamp, ink, jolt]);

  // Read here, in render: the styles below are worklets.
  const up = colors.up;
  const hidden = height || 600;
  const paper = useAnimatedStyle(() => ({
    transform: [{ translateY: -(1 - feed.get()) * hidden + 3 * jolt.get() }],
  }));
  const stampStyle = useAnimatedStyle(() => {
    const s = stamp.get();
    return {
      opacity: Math.min(1, s * 4),
      transform: [{ rotate: `${-7 - 6 * s}deg` }, { scale: 1.6 - 0.6 * s }],
    };
  });
  const ring = useAnimatedStyle(() => {
    const t = ink.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : 0.55 * (1 - t),
      transform: [{ rotate: '-13deg' }, { scale: 1 + 0.4 * t }],
    };
  });

  return (
    <View
      style={styles.printer}
      accessible
      accessibilityLabel="Order confirmation. Lesson 6-2, Candle signals: 8 of 10 answers, 88 % accuracy, 40 XP, a 4 day streak. Filled."
    >
      <View style={styles.feedClip}>
        <Animated.View
          style={[styles.paper, paper]}
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        >
          <View style={styles.paperBody}>
            <Text style={styles.receiptHead}>ORDER CONFIRMATION</Text>
            <DashedRule />
            <PrintedLine index={0} clock={clock}>
              <Text style={styles.receiptLesson}>6-2 · CANDLE SIGNALS</Text>
            </PrintedLine>
            <DashedRule />
            {RECEIPT_ROWS.map((row, i) => (
              <PrintedLine key={row.label} index={i + 1} clock={clock}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>{row.label}</Text>
                  <Text style={styles.receiptValue}>{row.value}</Text>
                </View>
              </PrintedLine>
            ))}
            <DashedRule />
            <View style={styles.stampZone}>
              {SPECKS.map((s, i) => (
                <Speck key={i} x={s.x} y={s.y} r={s.r} ink={ink} color={up} />
              ))}
              <Animated.View
                pointerEvents="none"
                style={[styles.stamp, { borderColor: up }, ring]}
              />
              <Animated.View style={[styles.stamp, { borderColor: up }, stampStyle]}>
                <View style={[styles.stampInner, { borderColor: up }]}>
                  <Text style={[styles.stampText, { color: up }]}>FILLED</Text>
                </View>
              </Animated.View>
            </View>
            <Svg width={BARCODE.width} height={20}>
              {BARCODE.bars.map((b, i) => (
                <Rect key={i} x={b.x} y={0} width={b.w} height={20} fill={colors.text} />
              ))}
            </Svg>
          </View>
          <Svg width={PAPER_W} height={TEAR + 1}>
            <Path d={TORN.fill} fill={colors.surface} />
            <Path d={TORN.edge} fill="none" stroke={colors.border} strokeWidth={1} />
          </Svg>
        </Animated.View>
      </View>
      {/* The slot is drawn over the paper, so the paper comes out from inside it. */}
      <View style={styles.slot}>
        <View style={styles.slit} />
      </View>
      <Svg width={PAPER_W} height={12} style={styles.slotShade}>
        <Defs>
          <LinearGradient id="receiptShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0.28} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={PAPER_W} height={12} fill="url(#receiptShade)" />
      </Svg>
    </View>
  );
}

/**
 * One line of the receipt, printed: the blank paper over it comes off from
 * left to right in steps, as a print head goes along it.
 */
function PrintedLine({
  index,
  clock,
  children,
}: {
  index: number;
  clock: SharedValue<number>;
  children: React.ReactNode;
}) {
  const start = index * RECEIPT.stagger;
  const wipe = RECEIPT.wipe;
  const cover = useAnimatedStyle(() => {
    const w = Math.min(1, Math.max(0, (clock.get() - start) / wipe));
    return { transform: [{ scaleX: 1 - Math.floor(w * 12) / 12 }] };
  });
  return (
    <View style={styles.printed}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.printCover, cover]} />
    </View>
  );
}

/** A fleck of ink off the stamp: it lands just after the stamp does, and stays. */
function Speck({
  x,
  y,
  r,
  ink,
  color,
}: {
  x: number;
  y: number;
  r: number;
  ink: SharedValue<number>;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const t = ink.get();
    const out = 0.7 + 0.3 * Math.min(1, t * 3);
    return {
      opacity: Math.min(1, t * 5) * 0.85,
      transform: [{ translateX: x * out }, { translateY: y * out }, { scale: Math.min(1, t * 4) }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.speck,
        {
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          marginLeft: -r,
          marginTop: -r,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function DashedRule() {
  return (
    <Svg width={RULE_W} height={8}>
      <Line
        x1={0}
        x2={RULE_W}
        y1={4}
        y2={4}
        stroke={colors.borderStrong}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Numbers on a split-flap board
// ---------------------------------------------------------------------------

const TILE_W = 32;
const TILE_H = 46;
/** A flap falling, and one character to the next. */
const FLAP_MS = 70;
const FLAP_STEP = 86;
/** Every tile turns over this many times on its way to its character. */
const FLAPS = 6;
/** The drum each tile turns: the digits, then the two signs. */
const DRUM = '0123456789+%';
const BOARD = [
  { label: 'XP', value: '+040' },
  { label: 'ACCURACY', value: '088%' },
  { label: 'STREAK', value: '004' },
];
/** When the first row starts, the gap to each next row, and to each next tile along. */
const BOARD_AT = 240;
const ROW_GAP = 380;
const TILE_GAP = 95;

/** What a tile shows on its way to `target`: blank, then up the drum to it. */
function flapsTo(target: string): string[] {
  const at = DRUM.indexOf(target);
  return [
    ' ',
    ...Array.from(
      { length: FLAPS },
      (_, j) => DRUM[(at - FLAPS + 1 + j + DRUM.length) % DRUM.length],
    ),
  ];
}
const BOARD_FLAPS = BOARD.map((row) => row.value.split('').map(flapsTo));

/**
 * Results on a split-flap board, as at a station: each tile turns over
 * through its drum to its character, left to right and row by row, with a
 * soft click as each one lands, and a row's lamp lights once it is complete.
 */
function SplitFlap() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const last = useRef(0);
  // A click as each tile lands, never two closer together than 60 ms.
  const onLand = useCallback(() => {
    const now = Date.now();
    if (now - last.current < 60) return;
    last.current = now;
    detentFeedback();
  }, []);
  return (
    <View
      style={[surfaceStyle(spec), styles.board]}
      accessible
      accessibilityLabel="Results: XP plus 40, accuracy 88 %, streak 4."
    >
      <View style={styles.boardHead}>
        <Text style={styles.boardTitle}>RESULTS</Text>
        <Text style={styles.boardSub}>LESSON 6-2</Text>
      </View>
      {BOARD.map((row, r) => (
        <BoardRow
          key={row.label}
          label={row.label}
          tiles={BOARD_FLAPS[r]}
          at={BOARD_AT + r * ROW_GAP}
          reduced={reduced}
          onLand={onLand}
        />
      ))}
    </View>
  );
}

function BoardRow({
  label,
  tiles,
  at,
  reduced,
  onLand,
}: {
  label: string;
  tiles: string[][];
  at: number;
  reduced: boolean;
  onLand: () => void;
}) {
  // Complete when its last tile lands.
  const done = at + (tiles.length - 1) * TILE_GAP + (FLAPS - 1) * FLAP_STEP + FLAP_MS;
  const lamp = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) lamp.set(withDelay(done, withSpring(1, SPRING_POP)));
  }, [reduced, done, lamp]);
  const lit = useAnimatedStyle(() => ({
    opacity: Math.min(1, lamp.get() * 3),
    transform: [{ scale: lamp.get() }],
  }));
  return (
    <View style={styles.boardRow}>
      <View style={styles.lamp}>
        <Animated.View style={[styles.lampOn, lit]} />
      </View>
      <Text style={styles.boardLabel}>{label}</Text>
      <View style={styles.tiles}>
        {tiles.map((seq, i) => (
          <FlapTile key={i} seq={seq} at={at + i * TILE_GAP} reduced={reduced} onLand={onLand} />
        ))}
      </View>
    </View>
  );
}

/**
 * One tile: behind its flap, the top half of the character coming and the
 * bottom half of the one going. At each step the flap is drawn afresh (it is
 * keyed on the step), so the characters and the flap's start change in the
 * same frame and nothing flickers between them.
 */
function FlapTile({
  seq,
  at,
  reduced,
  onLand,
}: {
  seq: string[];
  at: number;
  reduced: boolean;
  onLand: () => void;
}) {
  const end = seq.length - 1;
  const [step, setStep] = useState(reduced ? end : 0);
  useEffect(() => {
    if (reduced) return;
    const timers = Array.from({ length: end }, (_, i) =>
      setTimeout(() => setStep(i + 1), at + i * FLAP_STEP),
    );
    timers.push(setTimeout(onLand, at + (end - 1) * FLAP_STEP + FLAP_MS));
    return () => timers.forEach(clearTimeout);
  }, [reduced, end, at, onLand]);
  const turning = !reduced && step > 0;
  const to = seq[step];
  const from = turning ? seq[step - 1] : to;
  return (
    <View style={styles.tile}>
      <Half char={to} top />
      <Half char={from} />
      {turning ? <Flap key={step} from={from} to={to} /> : null}
      <View style={styles.hinge} />
    </View>
  );
}

/** Half a tile, cut from a whole character: its top half, or its bottom. */
function Half({ char, top = false }: { char: string; top?: boolean }) {
  return (
    <View style={[styles.half, top ? styles.halfTop : styles.halfLow]}>
      <View style={[styles.face, !top && styles.faceLow]}>
        <Text style={styles.flapChar}>{char}</Text>
      </View>
    </View>
  );
}

/** The flap: the old character's top half folds down, then the new one's bottom half lands. */
function Flap({ from, to }: { from: string; to: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    // It falls, so it gathers speed.
    p.set(withTiming(1, { duration: FLAP_MS, easing: Easing.in(Easing.quad) }));
  }, [p]);
  const upper = useAnimatedStyle(() => ({
    opacity: p.get() < 0.5 ? 1 : 0,
    transform: [{ perspective: 400 }, { rotateX: `${-180 * Math.min(0.5, p.get())}deg` }],
  }));
  const lower = useAnimatedStyle(() => ({
    opacity: p.get() < 0.5 ? 0 : 1,
    transform: [{ perspective: 400 }, { rotateX: `${180 * (1 - Math.max(0.5, p.get()))}deg` }],
  }));
  return (
    <>
      <Animated.View style={[styles.half, styles.halfTop, styles.flapUpper, upper]}>
        <View style={styles.face}>
          <Text style={styles.flapChar}>{from}</Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.half, styles.halfLow, styles.flapLower, lower]}>
        <View style={[styles.face, styles.faceLow]}>
          <Text style={styles.flapChar}>{to}</Text>
        </View>
      </Animated.View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Gems fly to the counter
// ---------------------------------------------------------------------------

const GEMS_HELD = 120;
const GEMS_EARNED = 6;
const GEM_SIZE = 26;
const BIG_GEM = 64;
/** The beats, in ms: the burst, the first gem leaving, the gap to each next one, a flight. */
const FLIGHT = { burst: 450, leave: 980, gap: 95, flyMs: 560 } as const;

/** When gem `i` lands on the counter. */
function homeAt(i: number): number {
  return FLIGHT.leave + i * FLIGHT.gap + FLIGHT.flyMs;
}

/** Where each gem pops out to, round the reward; which way its path bows; how it turns. */
const SPRAY = Array.from({ length: GEMS_EARNED }, (_, i) => {
  const angle = ((-150 + i * 24) * Math.PI) / 180;
  return {
    dx: Math.cos(angle) * 70,
    dy: Math.sin(angle) * 56,
    bow: (i % 2 ? 1 : -1) * (40 + (i % 3) * 16),
    spin: (i % 2 ? 1 : -1) * (140 + i * 30),
  };
});

type Point = { x: number; y: number };

/**
 * Gems paid out: they burst from the reward, hang for a moment and fly on
 * bowed paths into the gems in the top bar, which counts each one in with a
 * pop and a note a step higher, and shines when the last one is home.
 */
function GemFlight() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [count, setCount] = useState(reduced ? GEMS_HELD + GEMS_EARNED : GEMS_HELD);
  // Where things sit, so the gems leave from the reward and land on the counter.
  const [hud, setHud] = useState<LayoutRectangle | null>(null);
  const [counter, setCounter] = useState<LayoutRectangle | null>(null);
  const [card, setCard] = useState<LayoutRectangle | null>(null);
  const [jewel, setJewel] = useState<LayoutRectangle | null>(null);
  const burst = useSharedValue(reduced ? 1 : 0);
  const bump = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      coinFeedback();
      return;
    }
    const last = homeAt(GEMS_EARNED - 1);
    burst.set(withDelay(FLIGHT.burst, withTiming(1, { duration: 700, easing: EASE_OUT })));
    shine.set(withDelay(last + 80, withTiming(1, { duration: 760, easing: EASE_OUT })));
    const timers = [
      setTimeout(doneFeedback, FLIGHT.burst),
      ...SPRAY.map((_, i) =>
        setTimeout(() => {
          setCount((n) => n + 1);
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
  }, [reduced, burst, bump, shine]);

  const gem = colors.gem;
  const ready = !!(hud && counter && card && jewel);
  const from =
    card && jewel
      ? { x: card.x + jewel.x + jewel.width / 2, y: card.y + jewel.y + jewel.height / 2 }
      : { x: 0, y: 0 };
  // The counter's gem is the first thing in it, 22 pt wide.
  const to =
    hud && counter
      ? { x: hud.x + counter.x + 11, y: hud.y + counter.y + counter.height / 2 }
      : { x: 0, y: 0 };

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.24 * bump.get() }],
  }));
  const glow = useAnimatedStyle(() => {
    const t = shine.get();
    return { opacity: t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) };
  });
  const sheen = useAnimatedStyle(() => ({
    transform: [{ translateX: -24 + 120 * shine.get() }, { rotate: '20deg' }],
  }));
  const halo = useAnimatedStyle(() => {
    const t = shine.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : 0.8 * (1 - t),
      transform: [{ scale: 1 + 1.3 * t }],
    };
  });
  // The reward kicks as the gems leave it, and a ring goes out from it.
  const kick = useAnimatedStyle(() => {
    const b = burst.get();
    return {
      transform: [{ scale: 1 + 0.18 * (b > 0 && b < 0.3 ? Math.sin((b / 0.3) * Math.PI) : 0) }],
    };
  });
  const ring = useAnimatedStyle(() => {
    const b = burst.get();
    return {
      opacity: b <= 0 || b >= 1 ? 0 : 0.7 * (1 - b),
      transform: [{ scale: 0.8 + 1.1 * b }],
    };
  });

  return (
    <View style={styles.gemStage}>
      <View style={[surfaceStyle(spec), styles.hud]} onLayout={(e) => setHud(e.nativeEvent.layout)}>
        <PathLogo size={28} face={spec.cta.face} mark={spec.cta.text} />
        <View style={styles.hudItem} accessible accessibilityLabel="4 day streak">
          <Icon name="flame" size={20} color={colors.warning} filled />
          <Text style={[styles.hudValue, { color: colors.warning }]}>4</Text>
        </View>
        <Animated.View
          style={[styles.hudItem, counterStyle]}
          onLayout={(e) => setCounter(e.nativeEvent.layout)}
          accessible
          accessibilityLabel={`${count} gems`}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.counterGlow, { backgroundColor: tint(gem, 0.18) }, glow]}
          >
            <Animated.View style={[styles.counterSheen, sheen]} />
          </Animated.View>
          <View>
            <Animated.View
              pointerEvents="none"
              style={[styles.counterHalo, { borderColor: gem }, halo]}
            />
            <Gem size={22} color={gem} />
          </View>
          <Text style={[styles.hudValue, { color: gem }]}>{count}</Text>
        </Animated.View>
        <View style={styles.hudItem} accessible accessibilityLabel="5 hearts">
          <Icon name="heart" size={20} color={colors.down} filled />
          <Text style={[styles.hudValue, { color: colors.down }]}>5</Text>
        </View>
      </View>
      <View
        style={[surfaceStyle(spec), styles.rewardCard]}
        onLayout={(e) => setCard(e.nativeEvent.layout)}
      >
        <Text style={styles.rewardKicker}>Lesson bonus</Text>
        <View style={styles.jewel} onLayout={(e) => setJewel(e.nativeEvent.layout)}>
          <Animated.View
            pointerEvents="none"
            style={[styles.jewelRing, { borderColor: gem }, ring]}
          />
          <Animated.View style={kick}>
            <Gem size={BIG_GEM} color={gem} />
          </Animated.View>
        </View>
        <Text style={[styles.rewardAmount, { color: gem }]}>
          <Text style={styles.monoNum}>+6</Text> gems
        </Text>
      </View>
      {reduced ? null : (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {SPRAY.map((_, i) => (
            <FlyingGem key={i} index={i} from={from} to={to} ready={ready} color={gem} />
          ))}
        </View>
      )}
    </View>
  );
}

/** One gem: out of the reward on a spring, a beat in the air, then along its curve into the counter. */
function FlyingGem({
  index,
  from,
  to,
  ready,
  color,
}: {
  index: number;
  from: Point;
  to: Point;
  /** Where the reward and the counter sit is known. */
  ready: boolean;
  color: string;
}) {
  const { dx, dy, bow, spin } = SPRAY[index];
  const pop = useSharedValue(0);
  const fly = useSharedValue(0);
  useEffect(() => {
    pop.set(
      withDelay(FLIGHT.burst + index * 30, withSpring(1, { duration: 520, dampingRatio: 0.55 })),
    );
    // It gathers speed into the counter, as if pulled in.
    fly.set(
      withDelay(
        FLIGHT.leave + index * FLIGHT.gap,
        withTiming(1, { duration: FLIGHT.flyMs, easing: Easing.in(Easing.cubic) }),
      ),
    );
  }, [index, pop, fly]);
  // The curve: from where it popped out to the counter, bowed out to one side.
  const fx = from.x;
  const fy = from.y;
  const bx = fx + dx;
  const by = fy + dy;
  const tx = to.x;
  const ty = to.y;
  const len = Math.max(1, Math.hypot(tx - bx, ty - by));
  const cx = (bx + tx) / 2 - ((ty - by) / len) * bow;
  const cy = (by + ty) / 2 + ((tx - bx) / len) * bow;
  const style = useAnimatedStyle(() => {
    const p = pop.get();
    const f = fly.get();
    const u = 1 - f;
    const x = f > 0 ? u * u * bx + 2 * u * f * cx + f * f * tx : fx + dx * p;
    const y = f > 0 ? u * u * by + 2 * u * f * cy + f * f * ty : fy + dy * p;
    return {
      opacity: !ready || p < 0.02 || f > 0.97 ? 0 : 1,
      transform: [
        { translateX: x - GEM_SIZE / 2 },
        { translateY: y - GEM_SIZE / 2 },
        { rotate: `${spin * f}deg` },
        { scale: (0.3 + 0.7 * Math.min(1.15, p)) * (1 - 0.2 * f) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.flyer, style]}>
      <Gem size={GEM_SIZE} color={color} />
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// A badge you can tilt
// ---------------------------------------------------------------------------

const BADGE_W = 200;
const BADGE_H = 250;
/** How far it leans, in degrees, with a finger at its edge. */
const TILT = 16;
const GLARE_W = 120;
const HOLO_W = 170;
const BAND_H = 420;

/** A point on the badge, as -1..1 across and down from its middle. */
function lean(x: number, y: number) {
  'worklet';
  return {
    across: Math.max(-1, Math.min(1, (x - BADGE_W / 2) / (BADGE_W / 2))),
    down: Math.max(-1, Math.min(1, (y - BADGE_H / 2) / (BADGE_H / 2))),
  };
}

/**
 * Chapter complete's badge as a foil card: it drops in and lands, leans
 * towards a finger dragged across it while the foil's glare and rainbow
 * follow, and springs back when let go. A tap wobbles it and runs the light
 * across it once.
 */
function FoilBadge() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const lift = useSharedValue(0);
  // Where the light is across the badge, -1 its left edge to 1 its right (off it at rest),
  // and how bright it is.
  const glare = useSharedValue(-1.8);
  const lit = useSharedValue(0);
  const arrive = useSharedValue(reduced ? 1 : 0);
  const hint = useSharedValue(reduced ? 1 : 0);
  const still = reduced;

  useEffect(() => {
    if (reduced) {
      badgeFeedback();
      return;
    }
    arrive.set(withDelay(120, withSpring(1, { duration: 720, dampingRatio: 0.55 })));
    // As it lands the light runs across it once, so the foil shows.
    glare.set(withDelay(620, withTiming(1.8, { duration: 950, easing: EASE_IN_OUT })));
    lit.set(
      withDelay(
        620,
        withSequence(
          withTiming(1, { duration: 220 }),
          withDelay(420, withTiming(0, { duration: 320 })),
        ),
      ),
    );
    hint.set(withDelay(1300, withTiming(1, { duration: 360, easing: EASE_OUT })));
    const t = setTimeout(badgeFeedback, 380);
    return () => clearTimeout(t);
  }, [reduced, arrive, glare, lit, hint]);

  // A tap: a wobble, and the light run across once. Still, the light only comes and goes.
  const wobble = () => {
    'worklet';
    if (still) {
      glare.set(0);
      lit.set(
        withSequence(
          withTiming(1, { duration: 140 }),
          withDelay(500, withTiming(0, { duration: 140 })),
        ),
      );
      return;
    }
    rx.set(withSpring(0, { duration: 500, dampingRatio: 0.6 }));
    ry.set(
      withSequence(
        withTiming(12, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(-9, { duration: 150, easing: Easing.inOut(Easing.quad) }),
        withTiming(5, { duration: 130, easing: Easing.inOut(Easing.quad) }),
        withSpring(0, { duration: 460, dampingRatio: 0.5 }),
      ),
    );
    glare.set(
      withSequence(
        withTiming(-1.8, { duration: 0 }),
        withTiming(1.8, { duration: 760, easing: Easing.inOut(Easing.quad) }),
      ),
    );
    lit.set(
      withSequence(
        withTiming(1, { duration: 160 }),
        withDelay(360, withTiming(0, { duration: 300 })),
      ),
    );
  };

  const pan = Gesture.Pan()
    .minDistance(4)
    .onBegin((e) => {
      const { across, down } = lean(e.x, e.y);
      if (!still) {
        ry.set(withTiming(across * TILT, { duration: 140, easing: Easing.out(Easing.quad) }));
        rx.set(withTiming(-down * TILT, { duration: 140, easing: Easing.out(Easing.quad) }));
        lift.set(withTiming(1, { duration: 140 }));
      }
      glare.set(withTiming(across, { duration: still ? 0 : 140 }));
      lit.set(withTiming(1, { duration: 140 }));
    })
    .onStart(() => {
      scheduleOnRN(detentFeedback);
    })
    .onUpdate((e) => {
      const { across, down } = lean(e.x, e.y);
      if (!still) {
        ry.set(withTiming(across * TILT, { duration: 60 }));
        rx.set(withTiming(-down * TILT, { duration: 60 }));
      }
      glare.set(withTiming(across, { duration: 60 }));
    })
    .onFinalize(() => {
      if (!still) {
        rx.set(withSpring(0, { duration: 700, dampingRatio: 0.45 }));
        ry.set(withSpring(0, { duration: 700, dampingRatio: 0.45 }));
        lift.set(withTiming(0, { duration: 260 }));
      }
      lit.set(withTiming(0, { duration: still ? 140 : 420 }));
    });
  const tap = Gesture.Tap().onEnd(() => {
    scheduleOnRN(tapFeedback);
    wobble();
  });

  const card = useAnimatedStyle(() => {
    const a = arrive.get();
    return {
      opacity: Math.min(1, a * 3),
      transform: [
        { perspective: 800 },
        { translateY: -50 * (1 - a) },
        { rotateX: `${rx.get()}deg` },
        { rotateY: `${ry.get()}deg` },
        { scale: (0.85 + 0.15 * a) * (1 + 0.04 * lift.get()) },
      ],
    };
  });
  // The medal stands proud of the card, so it shifts a little the way the card leans.
  const medal = useAnimatedStyle(() => ({
    transform: [{ translateX: ry.get() * 0.4 }, { translateY: -rx.get() * 0.4 }],
  }));
  const glareStyle = useAnimatedStyle(() => ({
    opacity: lit.get(),
    transform: [{ translateX: glare.get() * BADGE_W * 0.7 }, { rotate: '20deg' }],
  }));
  const holoStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * lit.get(),
    transform: [{ translateX: -glare.get() * BADGE_W * 0.4 }, { rotate: '20deg' }],
  }));
  const shadow = useAnimatedStyle(() => ({
    opacity: Math.min(1, arrive.get()) * (1 - 0.3 * lift.get()),
    transform: [{ translateX: -ry.get() * 1.2 }, { scaleX: 1 + 0.12 * lift.get() }],
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: hint.get() }));
  const warning = colors.warning;

  return (
    <View style={styles.badgeStage}>
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <View
          style={styles.badgeHit}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Chapter 2 badge: Reading the Chart"
          accessibilityHint="Makes its foil shine"
          onAccessibilityTap={() => {
            tapFeedback();
            wobble();
          }}
        >
          <Animated.View style={[styles.badgeShadow, shadow]} />
          <Animated.View style={[styles.badge, card]}>
            <Svg width={BADGE_W} height={BADGE_H} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="badgeWash" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={warning} stopOpacity={0.16} />
                  <Stop offset="0.55" stopColor={warning} stopOpacity={0.02} />
                  <Stop offset="1" stopColor={warning} stopOpacity={0.12} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width={BADGE_W} height={BADGE_H} fill="url(#badgeWash)" />
            </Svg>
            <Animated.View style={medal}>
              <Medal ribbon={spec.accent} />
            </Animated.View>
            <Text style={styles.badgeKicker}>CHAPTER 2</Text>
            <Text style={styles.badgeTitle}>Reading the Chart</Text>
            <Animated.View pointerEvents="none" style={[styles.band, styles.holo, holoStyle]}>
              <HoloBand />
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.band, styles.glare, glareStyle]}>
              <GlareBand />
            </Animated.View>
          </Animated.View>
        </View>
      </GestureDetector>
      <Animated.Text style={[styles.badgeHint, hintStyle]}>Drag across it, or tap it</Animated.Text>
    </View>
  );
}

/** The badge's medal: a gold disc on two ribbons, with a trophy struck on it. */
function Medal({ ribbon }: { ribbon: string }) {
  return (
    <View style={styles.medal}>
      <Svg width={116} height={124} viewBox="0 0 116 124">
        <Defs>
          <LinearGradient id="medalGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFEAA8" />
            <Stop offset="0.5" stopColor="#F2B84B" />
            <Stop offset="1" stopColor="#B87818" />
          </LinearGradient>
        </Defs>
        <Path d="M38 74 L24 120 L38 112 L46 122 L56 82 Z" fill={ribbon} />
        <Path d="M78 74 L92 120 L78 112 L70 122 L60 82 Z" fill={ribbon} />
        <Path d="M38 74 L24 120 L38 112 L46 122 L56 82 Z" fill="#000000" opacity={0.2} />
        <Circle cx={58} cy={54} r={46} fill="url(#medalGold)" stroke="#9A6210" strokeWidth={2} />
        <Circle
          cx={58}
          cy={54}
          r={37}
          fill="none"
          stroke="#FFF4CF"
          strokeOpacity={0.75}
          strokeWidth={2}
        />
      </Svg>
      <View style={styles.medalMark}>
        <Icon name="trophy" size={42} color="#7A4A00" filled />
      </View>
    </View>
  );
}

/** The light on the foil: a soft white band. */
function GlareBand() {
  return (
    <Svg width={GLARE_W} height={BAND_H}>
      <Defs>
        <LinearGradient id="foilGlare" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.6} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={GLARE_W} height={BAND_H} fill="url(#foilGlare)" />
    </Svg>
  );
}

/** The foil's rainbow: a wider band that drifts the other way. */
function HoloBand() {
  return (
    <Svg width={HOLO_W} height={BAND_H}>
      <Defs>
        <LinearGradient id="foilHolo" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FF7AD9" stopOpacity={0} />
          <Stop offset="0.25" stopColor="#FF7AD9" stopOpacity={0.5} />
          <Stop offset="0.45" stopColor="#FFE66D" stopOpacity={0.5} />
          <Stop offset="0.65" stopColor="#6DFFD2" stopOpacity={0.5} />
          <Stop offset="0.85" stopColor="#7AA8FF" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#7AA8FF" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={HOLO_W} height={BAND_H} fill="url(#foilHolo)" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Confetti of candles and coins
// ---------------------------------------------------------------------------

/** When the burst goes off, and how long its clock runs. */
const BURST_AT = 380;
const BURST_MS = 2100;
/** The pull down, in points a second squared. */
const GRAVITY = 1500;
const CHEER_W = 240;
const CHEER_H = 200;
const CHEER_CARD_W = 220;
const CHEER_CARD_H = 132;

type Bit = {
  coin: boolean;
  up: boolean;
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  /** How quickly the air slows it: candles more than coins. */
  drag: number;
  delay: number;
  life: number;
  spin: number;
  flip: number;
  size: number;
};

/** A seeded number in 0..1: the same burst on every take, where Math.random would differ. */
function seeded(i: number, salt: number): number {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** Twenty-six pieces, a candle and a coin in turn, thrown up and out from behind the card. */
const BITS: Bit[] = Array.from({ length: 26 }, (_, i) => {
  const r = (salt: number) => seeded(i, salt);
  const coin = i % 2 === 1;
  return {
    coin,
    up: r(1) > 0.25,
    x0: (r(2) - 0.5) * 70,
    y0: -20 + (r(3) - 0.5) * 16,
    vx: (r(4) - 0.5) * 680,
    vy: -(700 + r(5) * 300),
    drag: coin ? 2.1 : 2.5,
    delay: r(6) * 120,
    life: 1250 + r(7) * 550,
    spin: (r(8) - 0.5) * 900,
    flip: 1.2 + r(9) * 1.6,
    size: Math.round(13 + r(10) * 4),
  };
});

/**
 * Lesson complete's celebration in the app's own things: little candles,
 * mostly green, and gold coins turning over, thrown up from behind the card,
 * slowed by the air and pulled back down. One clock drives them all.
 */
function CoinConfetti() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const enter = useSharedValue(reduced ? 1 : 0);
  const swell = useSharedValue(0);
  const flash = useSharedValue(0);
  const clock = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      celebrateFeedback(false);
      return;
    }
    enter.set(withTiming(1, { duration: 320, easing: EASE_OUT }));
    swell.set(
      withDelay(
        BURST_AT,
        withSequence(withTiming(1, { duration: 100, easing: EASE_OUT }), withSpring(0, SPRING_POP)),
      ),
    );
    flash.set(withDelay(BURST_AT, withTiming(1, { duration: 700, easing: EASE_OUT })));
    clock.set(
      withDelay(BURST_AT, withTiming(BURST_MS, { duration: BURST_MS, easing: Easing.linear })),
    );
    const t = setTimeout(() => celebrateFeedback(false), BURST_AT);
    return () => clearTimeout(t);
  }, [reduced, enter, swell, flash, clock]);

  // Read here, in render: the styles are worklets.
  const up = colors.up;
  const down = colors.down;
  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.get(),
    transform: [{ scale: (0.92 + 0.08 * enter.get()) * (1 + 0.07 * swell.get()) }],
  }));
  const ringStyle = useAnimatedStyle(() => {
    const t = flash.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : 0.8 * (1 - t),
      transform: [{ scale: 1 + 0.3 * t }],
    };
  });

  return (
    <View style={styles.cheer}>
      {/* Behind the card, so nothing is ever thrown over its words. */}
      {reduced ? null : (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {BITS.map((bit, i) => (
            <Piece key={i} bit={bit} clock={clock} color={bit.up ? up : down} />
          ))}
        </View>
      )}
      <Animated.View
        pointerEvents="none"
        style={[styles.cheerRing, { borderRadius: spec.surface.radius + 2 }, ringStyle]}
      />
      <Animated.View style={[surfaceStyle(spec), styles.cheerCard, cardStyle]}>
        <Text style={styles.cheerKicker}>Lesson complete</Text>
        <View style={styles.cheerXp}>
          <Text style={styles.cheerNum}>+40</Text>
          <Text style={styles.cheerUnit}>XP</Text>
        </View>
      </Animated.View>
    </View>
  );
}

/** One piece: thrown up, slowed by the air, pulled down, turning as it goes, gone by the end of its life. */
function Piece({ bit, clock, color }: { bit: Bit; clock: SharedValue<number>; color: string }) {
  const { coin, x0, y0, vx, vy, drag, delay, life, spin, flip, size } = bit;
  const style = useAnimatedStyle(() => {
    const ms = Math.max(0, clock.get() - delay);
    const t = ms / 1000;
    // With the air's drag the fall tends to a steady speed, so it floats down.
    const fall = GRAVITY / drag;
    const reach = (1 - Math.exp(-drag * t)) / drag;
    const age = ms / life;
    return {
      opacity: ms <= 0 || age >= 1 ? 0 : age > 0.65 ? (1 - age) / 0.35 : 1,
      transform: [
        { translateX: x0 + vx * reach },
        { translateY: y0 + (vy - fall) * reach + fall * t },
        { rotate: `${spin * t}deg` },
        // A coin spins edge over edge; a candle tumbles.
        { scaleX: coin ? Math.cos(t * flip * Math.PI * 2) : 1 },
        { scale: Math.min(1, 0.3 + t * 7) },
      ],
    };
  });
  if (coin) {
    return (
      <Animated.View
        style={[
          styles.coin,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: -size / 2,
            marginTop: -size / 2,
          },
          style,
        ]}
      >
        <View style={[styles.coinRing, { borderRadius: size / 2 }]} />
      </Animated.View>
    );
  }
  return (
    <Animated.View style={[styles.candle, style]}>
      <View style={[styles.candleWick, { backgroundColor: color }]} />
      <View style={[styles.candleBody, { backgroundColor: color }]} />
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// A chest for a perfect lesson
// ---------------------------------------------------------------------------

const CHEST_W = 156;
const LID_H = 58;
const BASE_H = 80;
const CHEST_AREA_W = 270;
const CHEST_AREA_H = 250;
/** Where the lid meets the base, from the top of the area. */
const SEAM_Y = CHEST_AREA_H - 8 - BASE_H;
const RAYS = 224;
const GLOW_W = 220;
const GLOW_H = 110;
/** The chest's own colours, like a sticker: the same on every ground. */
const WOOD_INK = '#3E2410';
const GOLD = '#F2B544';
const GOLD_INK = '#9A6210';
/** Taps it takes: two rattles, and the third opens it. */
const CHEST_TAPS = 3;
const CHEST_HINTS = ['Tap to open', 'Tap again', 'One more tap'];
/** The opening, in ms: the chest gathers itself, the lid flies; the payout lands after. */
const OPEN = { gather: 90, payout: 560 } as const;
/** Where the gems land round the opening, and how far they turn. */
const CHEST_GEMS = [
  { x: -88, y: -58, size: 26, spin: -20 },
  { x: -48, y: -108, size: 30, spin: -10 },
  { x: 0, y: -132, size: 34, spin: 0 },
  { x: 48, y: -108, size: 30, spin: 10 },
  { x: 88, y: -58, size: 26, spin: 20 },
];

/** Twelve rays of light round a centre, each a thin wedge. */
const RAY_PATH = Array.from({ length: 12 }, (_, i) => {
  const c = RAYS / 2;
  const a0 = (i / 12) * Math.PI * 2;
  const a1 = a0 + Math.PI / 16;
  const at = (a: number) =>
    `${(c + Math.cos(a) * c).toFixed(1)} ${(c + Math.sin(a) * c).toFixed(1)}`;
  return `M${c} ${c} L${at(a0)} L${at(a1)} Z`;
}).join(' ');

/**
 * A perfect lesson's chest: each tap rattles it harder, with light leaking
 * from under its lid, and the third bursts it open. The lid flies up, rays
 * of light turn once behind it, gems spring out and the payout lands.
 */
function Chest() {
  const reduced = useReduceMotion();
  const [taps, setTaps] = useState(0);
  const open = taps >= CHEST_TAPS;
  const swing = useSharedValue(0);
  const hop = useSharedValue(0);
  const squash = useSharedValue(0);
  const leak = useSharedValue(0);
  const lid = useSharedValue(0);
  const rays = useSharedValue(0);
  const payout = useSharedValue(0);

  const onTap = () => {
    if (open) return;
    const n = taps + 1;
    setTaps(n);
    leak.set(
      reduced ? n / CHEST_TAPS : withTiming(n / CHEST_TAPS, { duration: 220, easing: EASE_OUT }),
    );
    // The third tap opens it (the effect below).
    if (n >= CHEST_TAPS) return;
    rattleFeedback();
    if (reduced) return;
    // Three swings, harder each tap, a click of the rattle at each.
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
    const timers = [
      setTimeout(unlockFeedback, OPEN.gather),
      setTimeout(badgeFeedback, OPEN.payout),
    ];
    return () => timers.forEach(clearTimeout);
  }, [open, reduced, squash, lid, rays, payout]);

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
  const gem = colors.gem;

  return (
    <View style={styles.chestStage}>
      <View style={styles.chestArea}>
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
        <Animated.View pointerEvents="none" style={[styles.chestGlow, glow]}>
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
        <View style={styles.chestShadow} />
        {/* No press scale: the rattle is the answer to the tap. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'The chest, open' : 'A chest. Tap it to open it.'}
          accessibilityState={{ disabled: open }}
          disabled={open}
          onPress={onTap}
          style={styles.chestHit}
        >
          <Animated.View style={[styles.chestBody, body]}>
            <Animated.View style={[styles.lid, lidStyle]}>
              <ChestLid />
            </Animated.View>
            <ChestBase />
            <Animated.View pointerEvents="none" style={[styles.seam, seam]} />
          </Animated.View>
        </Pressable>
        {open
          ? CHEST_GEMS.map((_, i) => <ChestGem key={i} index={i} color={gem} reduced={reduced} />)
          : null}
      </View>
      <View style={styles.chestCaption}>
        {open ? (
          <Animated.View style={[styles.payout, payoutStyle]}>
            <Gem size={24} color={gem} />
            <Text style={[styles.payoutText, { color: gem }]}>
              <Text style={styles.monoNum}>+15</Text> gems
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.chestHint}>{CHEST_HINTS[taps]}</Text>
        )}
      </View>
    </View>
  );
}

/** A gem from the chest: it springs up out of the opening on an arc and lands round it. */
function ChestGem({ index, color, reduced }: { index: number; color: string; reduced: boolean }) {
  const { x, y, size, spin } = CHEST_GEMS[index];
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) {
      t.set(
        withDelay(
          OPEN.gather + 60 + index * 55,
          withSpring(1, { duration: 720, dampingRatio: 0.55 }),
        ),
      );
    }
  }, [reduced, index, t]);
  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v < 0.02 ? 0 : 1,
      transform: [
        { translateX: x * v },
        { translateY: y * v - 120 * v * (1 - v) },
        { rotate: `${spin * v}deg` },
        { scale: 0.25 + 0.75 * Math.min(1.1, v) },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.chestGem,
        { left: CHEST_AREA_W / 2 - size / 2, top: SEAM_Y - size / 2 },
        style,
      ]}
    >
      <Gem size={size} color={color} />
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
      <Rect x={30} y={2} width={14} height={74} fill={GOLD} stroke={GOLD_INK} strokeWidth={1.5} />
      <Rect x={112} y={2} width={14} height={74} fill={GOLD} stroke={GOLD_INK} strokeWidth={1.5} />
      <Rect
        x={5}
        y={1}
        width={146}
        height={10}
        rx={2}
        fill={GOLD}
        stroke={GOLD_INK}
        strokeWidth={1.5}
      />
      <Rect
        x={63}
        y={3}
        width={30}
        height={34}
        rx={6}
        fill="#F7CB5E"
        stroke={GOLD_INK}
        strokeWidth={2}
      />
      <Circle cx={78} cy={16} r={4.5} fill={WOOD_INK} />
      <Path d="M76 18 H80 L81.5 28 H74.5 Z" fill={WOOD_INK} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------

const styles = themed(() => ({
  monoNum: { fontFamily: MONO_FONT },

  // Lesson complete as a trade receipt
  printer: { width: SLOT_W, alignItems: 'center' },
  feedClip: { marginTop: SLOT_H / 2, width: PAPER_W, overflow: 'hidden' },
  paper: { width: PAPER_W },
  paperBody: {
    alignItems: 'center',
    gap: 6,
    // The top runs on under the slot.
    paddingTop: SLOT_H / 2 + space.md,
    paddingBottom: space.sm,
    paddingHorizontal: PAPER_PAD,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  slot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SLOT_H,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: SLOT_H / 2,
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  slit: { height: 4, borderRadius: 2, backgroundColor: '#000000' },
  slotShade: { position: 'absolute', top: SLOT_H, left: (SLOT_W - PAPER_W) / 2 },
  receiptHead: {
    ...type.small,
    fontFamily: MONO_FONT,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  receiptLesson: {
    ...type.small,
    fontFamily: MONO_FONT,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  printed: { alignSelf: 'stretch' },
  printCover: {
    position: 'absolute',
    top: -1,
    bottom: -1,
    left: -2,
    right: -2,
    backgroundColor: colors.surface,
    transformOrigin: 'right',
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptLabel: { ...type.label, fontFamily: MONO_FONT, color: colors.textMuted },
  receiptValue: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700', color: colors.text },
  stampZone: { alignSelf: 'stretch', height: 66 },
  stamp: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: STAMP_W,
    height: STAMP_H,
    marginLeft: -STAMP_W / 2,
    marginTop: -STAMP_H / 2,
    padding: 3,
    borderWidth: 3,
    borderRadius: 8,
  },
  stampInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 5,
  },
  stampText: { ...type.title, fontFamily: MONO_FONT, letterSpacing: 4 },
  speck: { position: 'absolute', left: '50%', top: '50%' },

  // Numbers on a split-flap board
  board: { width: '100%', maxWidth: 340, padding: space.lg, gap: space.md },
  boardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  boardTitle: { ...type.label, color: colors.textMuted, letterSpacing: 1.5 },
  boardSub: { ...type.small, fontFamily: MONO_FONT, color: colors.textMuted },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  lamp: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  lampOn: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  boardLabel: { ...type.label, flex: 1, color: colors.text, letterSpacing: 1 },
  tiles: { flexDirection: 'row', gap: 4 },
  tile: { width: TILE_W, height: TILE_H },
  half: { position: 'absolute', left: 0, right: 0, height: TILE_H / 2, overflow: 'hidden' },
  halfTop: {
    top: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: colors.surfaceAlt,
  },
  // A shade darker: the light comes from above.
  halfLow: {
    top: TILE_H / 2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: shade(colors.surfaceAlt, 0.06),
  },
  flapUpper: { transformOrigin: 'bottom' },
  flapLower: { transformOrigin: 'top' },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TILE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceLow: { top: -TILE_H / 2 },
  flapChar: {
    ...type.display,
    lineHeight: 36,
    fontFamily: MONO_FONT,
    color: colors.text,
    includeFontPadding: false,
  },
  hinge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: TILE_H / 2 - 1,
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },

  // Gems fly to the counter
  gemStage: { alignSelf: 'stretch', height: 360 },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: space.md,
  },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  hudValue: { ...type.body, fontWeight: '800', fontFamily: MONO_FONT },
  counterGlow: {
    position: 'absolute',
    left: -8,
    right: -10,
    top: 6,
    bottom: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  counterSheen: {
    position: 'absolute',
    top: -14,
    width: 12,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  counterHalo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  rewardCard: {
    alignSelf: 'center',
    width: 200,
    marginTop: 64,
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.lg,
  },
  rewardKicker: { ...type.label, color: colors.textMuted },
  jewel: {
    width: BIG_GEM + 24,
    height: BIG_GEM + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jewelRing: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: BIG_GEM + 8,
    height: BIG_GEM + 8,
    borderRadius: (BIG_GEM + 8) / 2,
    borderWidth: 3,
  },
  rewardAmount: { ...type.title },
  flyer: { position: 'absolute', left: 0, top: 0 },

  // A badge you can tilt
  badgeStage: { alignItems: 'center', gap: space.xxl },
  badgeHit: { width: BADGE_W, height: BADGE_H },
  badge: {
    width: BADGE_W,
    height: BADGE_H,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: colors.surface,
  },
  badgeShadow: {
    position: 'absolute',
    left: 30,
    bottom: -16,
    width: BADGE_W - 60,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  medal: { width: 116, height: 124, marginBottom: space.xs },
  medalMark: { position: 'absolute', left: 0, right: 0, top: 33, alignItems: 'center' },
  badgeKicker: { ...type.label, color: colors.warning, letterSpacing: 1.6 },
  badgeTitle: { ...type.answer, fontWeight: '700', color: colors.text, textAlign: 'center' },
  band: { position: 'absolute', top: (BADGE_H - BAND_H) / 2, height: BAND_H },
  glare: { left: (BADGE_W - GLARE_W) / 2, width: GLARE_W },
  holo: { left: (BADGE_W - HOLO_W) / 2, width: HOLO_W },
  badgeHint: { ...type.small, color: colors.textMuted, textAlign: 'center' },

  // Confetti of candles and coins
  cheer: { width: CHEER_W, height: CHEER_H, alignItems: 'center', justifyContent: 'center' },
  cheerRing: {
    position: 'absolute',
    left: (CHEER_W - CHEER_CARD_W) / 2,
    top: (CHEER_H - CHEER_CARD_H) / 2,
    width: CHEER_CARD_W,
    height: CHEER_CARD_H,
    borderWidth: 3,
    borderColor: colors.warning,
  },
  // Solid, so the pieces pass behind it.
  cheerCard: {
    width: CHEER_CARD_W,
    height: CHEER_CARD_H,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.surface,
  },
  cheerKicker: {
    ...type.label,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  cheerXp: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  cheerNum: {
    ...type.display,
    fontSize: 44,
    lineHeight: 52,
    fontFamily: MONO_FONT,
    color: colors.text,
  },
  cheerUnit: { ...type.label, color: colors.textMuted, letterSpacing: 1.5 },
  coin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    backgroundColor: '#F4B740',
    borderWidth: 1,
    borderColor: 'rgba(122, 78, 0, 0.6)',
  },
  coinRing: {
    position: 'absolute',
    top: 2.5,
    left: 2.5,
    right: 2.5,
    bottom: 2.5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  candle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 8,
    height: 20,
    marginLeft: -4,
    marginTop: -10,
  },
  candleWick: { position: 'absolute', left: 3.25, top: 0, bottom: 0, width: 1.5, borderRadius: 1 },
  candleBody: { position: 'absolute', left: 0, right: 0, top: 5, height: 10, borderRadius: 1.5 },

  // A chest for a perfect lesson
  chestStage: { alignItems: 'center', gap: space.sm },
  chestArea: { width: CHEST_AREA_W, height: CHEST_AREA_H },
  rays: {
    position: 'absolute',
    left: CHEST_AREA_W / 2 - RAYS / 2,
    top: SEAM_Y - 18 - RAYS / 2,
    width: RAYS,
    height: RAYS,
  },
  chestGlow: {
    position: 'absolute',
    left: CHEST_AREA_W / 2 - GLOW_W / 2,
    top: SEAM_Y - GLOW_H / 2,
    width: GLOW_W,
    height: GLOW_H,
  },
  chestShadow: {
    position: 'absolute',
    left: CHEST_AREA_W / 2 - 72,
    top: SEAM_Y + BASE_H - 8,
    width: 144,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  chestHit: {
    position: 'absolute',
    left: (CHEST_AREA_W - CHEST_W) / 2,
    top: SEAM_Y - LID_H,
    width: CHEST_W,
    height: LID_H + BASE_H,
  },
  // It turns and squashes about the middle of its bottom, where it stands.
  chestBody: { width: CHEST_W, height: LID_H + BASE_H, transformOrigin: 'bottom' },
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
  chestGem: { position: 'absolute' },
  chestCaption: { height: 40, alignItems: 'center', justifyContent: 'center' },
  chestHint: { ...type.label, color: colors.textMuted },
  payout: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  payoutText: { ...type.title },
}));
