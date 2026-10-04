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
import Svg, { Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, MONO_FONT, space, themed, type } from '../../theme';
import { detentFeedback } from '../feedback';
import { EASE_OUT, EASE_SINE } from '../motion';
import { useReduceMotion } from '../useReduceMotion';
import { headline, rowsOf, type WinData } from './data';

const SLOT_H = 22;
const PAPER_MAX = 260;
const PAPER_PAD = 16;
/** The torn edge: half-teeth across the paper (an even number), and how deep they bite. */
const TEETH = 42;
const TEAR = 7;
const STAMP_W = 150;
const STAMP_H = 52;

/**
 * The beats, in ms: the paper feeds out, its lines print one after another
 * (each typed on in `wipe`), and the stamp comes down, landing `thump` later.
 */
const BEAT = { feed: 160, feedMs: 820, print: 1020, stagger: 140, wipe: 180, thump: 150 } as const;

/** Flecks of ink thrown off the stamp as it lands, round its edge. */
const SPECKS = [
  { x: -88, y: -14, r: 2.4 },
  { x: -72, y: 24, r: 1.8 },
  { x: -20, y: -32, r: 1.6 },
  { x: 26, y: 31, r: 2 },
  { x: 82, y: -22, r: 1.8 },
  { x: 92, y: 12, r: 2.6 },
];

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

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW] win screen "A trade receipt" (David's pick
 * of 2026-10-04): the lesson as an order confirmation. The paper feeds down
 * out of the printer's slot, the lesson and its numbers print on it one line
 * after another, each with a tick, and a FILLED stamp thumps down on it -- the
 * landing.
 */
export default function ReceiptWin({
  data,
  width,
  onLand,
}: {
  data: WinData;
  width: number;
  onLand: () => void;
}) {
  const reduced = useReduceMotion();
  const paperW = Math.min(PAPER_MAX, Math.max(200, width - 28));
  const slotW = paperW + 28;
  const ruleW = paperW - PAPER_PAD * 2;
  const rows = rowsOf(data);
  const head = headline(data);
  const lines: { label: string; value: string; strong?: boolean }[] = [
    ...rows.map((r) => ({ label: r.label.toUpperCase(), value: r.value.toUpperCase() })),
    {
      label: 'TOTAL',
      value: `${head.text(head.value)} ${data.practice ? '' : 'XP'}`.trim(),
      strong: true,
    },
  ];
  // The lesson's line, then a line for each row.
  const prints = lines.length + 1;
  const printMs = (prints - 1) * BEAT.stagger + BEAT.wipe;
  const stampAt = BEAT.print + printMs + 260;

  const [height, setHeight] = useState(0);
  const feed = useSharedValue(reduced ? 1 : 0);
  const clock = useSharedValue(reduced ? printMs : 0);
  const stamp = useSharedValue(reduced ? 1 : 0);
  const ink = useSharedValue(reduced ? 1 : 0);
  const jolt = useSharedValue(0);
  // The paper starts all the way inside the slot, so the feed waits for its height.
  const ready = reduced || height > 0;

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      onLand();
      return;
    }
    const hit = stampAt + BEAT.thump;
    // Near a steady speed, as a printer's motor feeds it.
    feed.set(withDelay(BEAT.feed, withTiming(1, { duration: BEAT.feedMs, easing: EASE_SINE })));
    clock.set(
      withDelay(BEAT.print, withTiming(printMs, { duration: printMs, easing: Easing.linear })),
    );
    stamp.set(
      withDelay(
        stampAt,
        withSequence(
          withTiming(1.05, { duration: BEAT.thump, easing: Easing.in(Easing.quad) }),
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
      ...Array.from({ length: prints }, (_, i) =>
        setTimeout(detentFeedback, BEAT.print + i * BEAT.stagger),
      ),
      setTimeout(onLand, hit),
    ];
    return () => timers.forEach(clearTimeout);
    // Once, when the paper is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Read here, in render: the styles below are worklets.
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
  const up = colors.up;
  const torn = tornEdge(paperW);

  return (
    <View
      style={[styles.printer, { width: slotW }]}
      accessible
      accessibilityLabel={`Order confirmation. ${data.ref ? `Lesson ${data.ref}, ` : ''}${data.title}: ${lines
        .map((l) => `${l.label.toLowerCase()} ${l.value.toLowerCase()}`)
        .join(', ')}. Filled.`}
    >
      <View style={[styles.feedClip, { width: paperW }]}>
        <Animated.View
          style={[{ width: paperW }, paper]}
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        >
          <View style={styles.paperBody}>
            <Text style={styles.head}>ORDER CONFIRMATION</Text>
            <DashedRule width={ruleW} />
            <PrintedLine index={0} clock={clock}>
              <Text style={styles.lesson}>
                {`${data.ref ? `${data.ref} · ` : ''}${data.title.toUpperCase()}`}
              </Text>
            </PrintedLine>
            <DashedRule width={ruleW} />
            {lines.map((line, i) => (
              <PrintedLine key={line.label} index={i + 1} clock={clock}>
                <View style={styles.row}>
                  <Text style={[styles.label, line.strong && styles.strong]}>{line.label}</Text>
                  <Text style={[styles.value, line.strong && styles.strong]}>{line.value}</Text>
                </View>
              </PrintedLine>
            ))}
            <DashedRule width={ruleW} />
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
          <Svg width={paperW} height={TEAR + 1}>
            <Path d={torn.fill} fill={colors.surface} />
            <Path d={torn.edge} fill="none" stroke={colors.border} strokeWidth={1} />
          </Svg>
        </Animated.View>
      </View>
      {/* The slot is drawn over the paper, so the paper comes out from inside it. */}
      <View style={styles.slot}>
        <View style={styles.slit} />
      </View>
      <Svg width={paperW} height={12} style={[styles.slotShade, { left: (slotW - paperW) / 2 }]}>
        <Defs>
          <LinearGradient id="receiptShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0.28} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={paperW} height={12} fill="url(#receiptShade)" />
      </Svg>
    </View>
  );
}

/** The torn bottom edge: the paper's shape, and the line along its teeth. */
function tornEdge(w: number) {
  const step = w / TEETH;
  const teeth = Array.from(
    { length: TEETH + 1 },
    (_, k) => `L${(w - k * step).toFixed(1)} ${k % 2 === 0 ? TEAR : 0}`,
  ).join(' ');
  return { fill: `M0 0 L${w} 0 ${teeth} Z`, edge: `M${w} 0 ${teeth} L0 0` };
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
  const start = index * BEAT.stagger;
  const cover = useAnimatedStyle(() => {
    const w = Math.min(1, Math.max(0, (clock.get() - start) / BEAT.wipe));
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

function DashedRule({ width }: { width: number }) {
  return (
    <Svg width={width} height={8}>
      <Line
        x1={0}
        x2={width}
        y1={4}
        y2={4}
        stroke={colors.borderStrong}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
    </Svg>
  );
}

const styles = themed(() => ({
  printer: { alignItems: 'center', alignSelf: 'center' },
  feedClip: { marginTop: SLOT_H / 2, overflow: 'hidden' },
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
  slotShade: { position: 'absolute', top: SLOT_H },
  head: { ...type.small, fontFamily: MONO_FONT, color: colors.textMuted, letterSpacing: 1 },
  lesson: {
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
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  label: { ...type.label, fontFamily: MONO_FONT, color: colors.textMuted },
  value: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700', color: colors.text },
  strong: { color: colors.text, fontWeight: '800' },
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
}));
