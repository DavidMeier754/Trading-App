import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import type { Grade } from '../../lesson/answers';
import {
  commitFeedback,
  detentFeedback,
  flipFeedback,
  revealFeedback,
  runBefore,
} from '../../lesson/feedback';
import { surfaceStyle, tint, useLookSpec } from '../../lesson/look';
import { EASE_OUT } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, MONO_FONT, radius, space, themed, type } from '../../theme';
import Icon from '../icons';
import { DemoKey, KeyRow, MiniChart, Suggestion } from './kit';

/** Ideas for the moment of answering: the bar, the answers, the call, the verdict. */
export const ANSWERS: Suggestion[] = [
  {
    id: 'candle-bar',
    section: 'answers',
    icon: 'candles',
    title: 'Progress bar of candles',
    line: 'Each answer adds a candle, green when right and red when wrong: the lesson draws its own chart.',
    again: 'Start again',
    Preview: CandleBar,
  },
  {
    id: 'swipe-call',
    section: 'answers',
    icon: 'updown',
    title: 'Swipe to make the call',
    line: 'Swipe the chart right for Long, left for Short. The buttons still work.',
    again: 'Start again',
    Preview: SwipeCall,
  },
  {
    id: 'flip-reveal',
    section: 'answers',
    icon: 'repeat',
    title: 'The answer turns over',
    line: 'The answer you pick flips over and shows the verdict on its back.',
    again: 'Start again',
    Preview: FlipReveal,
  },
  {
    id: 'deep-keys',
    section: 'answers',
    icon: 'key',
    title: 'Answers with depth',
    line: 'Answer rows stand on an edge and press down into it, like the key does. The one you pick stays down.',
    again: 'Start again',
    Preview: DeepKeys,
  },
  {
    id: 'breakout',
    section: 'answers',
    icon: 'breakout',
    title: 'A right answer breaks out',
    line: 'A right answer sends the price up through a level with a burst; a wrong one sinks through the floor.',
    again: 'Start again',
    Preview: Breakout,
  },
  {
    id: 'slide-confirm',
    section: 'answers',
    icon: 'ticket',
    title: 'Slide to place the trade',
    line: 'On a decision, Continue becomes a slider, like confirming an order. A tap on the knob works too.',
    again: 'Start again',
    Preview: SlideConfirm,
  },
  {
    id: 'chart-scrub',
    section: 'answers',
    icon: 'zoom',
    title: 'Run a finger along the chart',
    line: 'Touch the chart to read the price at any moment, with a crosshair and the change since the open.',
    again: 'Start again',
    Preview: ChartScrub,
  },
  {
    id: 'typed-theory',
    section: 'answers',
    icon: 'monitor',
    title: 'Theory typed out like a terminal',
    line: 'A theory card writes itself out in a mono face behind a caret. A tap shows it all at once.',
    tag: 'moves',
    note: 'It types and blinks without a tap, against docs/ui/01-design-principles.md §1: "Nothing moves unless the learner moved it".',
    again: 'Play again',
    Preview: TypedTheory,
  },
];

// ---------------------------------------------------------------------------
// Progress bar of candles
// ---------------------------------------------------------------------------

const BAR_STEPS = 12;
const BAR_H = 52;
/** Three answers in already, so the bar has a story before the first tap. */
const SEED: Grade[] = ['correct', 'correct', 'wrong'];

type Bar = { o: number; c: number; h: number; l: number; up: boolean };

/** Each right answer a step up, each wrong one a step down, from where the last one closed. */
function barsOf(grades: Grade[]): Bar[] {
  let close = 0;
  return grades.map((g, i) => {
    const up = g === 'correct';
    const o = close;
    const c = o + (up ? 0.8 + (i % 3) * 0.3 : -1.3);
    close = c;
    return { o, c, h: Math.max(o, c) + 0.35, l: Math.min(o, c) - 0.35, up };
  });
}

function CandleBar() {
  const [grades, setGrades] = useState<Grade[]>(SEED);
  const [width, setWidth] = useState(0);
  const bars = barsOf(grades);
  const right = grades.filter((g) => g === 'correct').length;
  const full = grades.length >= BAR_STEPS;

  const answer = (g: Grade) => {
    revealFeedback(g, g === 'correct' ? runBefore(grades, grades.length) + 1 : 0);
    setGrades((all) => [...all, g]);
  };

  // The strip fits the run so far: as it climbs, the candles before it make room.
  const lo = Math.min(...bars.map((b) => b.l)) - 0.3;
  const hi = Math.max(...bars.map((b) => b.h)) + 0.3;
  const span = Math.max(3, hi - lo);
  const y = (v: number) => 4 + ((hi - v) / span) * (BAR_H - 8);
  const slot = width / BAR_STEPS;

  return (
    <View style={styles.column}>
      <View style={styles.lessonBar}>
        <Cross size={18} color={colors.textMuted} />
        <View
          style={styles.strip}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          accessibilityRole="progressbar"
          accessibilityLabel={`${grades.length} of ${BAR_STEPS} answered, ${right} right`}
        >
          {width > 0
            ? Array.from({ length: BAR_STEPS }, (_, i) =>
                i < bars.length ? (
                  <Candle
                    key={i}
                    bar={bars[i]}
                    left={slot * i + slot * 0.2}
                    width={slot * 0.6}
                    y={y}
                    // The seeded three are there from the start; the rest grow in.
                    grow={i >= SEED.length}
                  />
                ) : (
                  <View
                    key={i}
                    style={[styles.slot, { left: slot * i + slot / 2 - 1.5, top: BAR_H / 2 - 1.5 }]}
                  />
                ),
              )
            : null}
        </View>
        <Text style={styles.count}>{`${grades.length}/${BAR_STEPS}`}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.big}>{`${right} right`}</Text>
        <Text style={styles.muted}>{`${grades.length - right} wrong`}</Text>
      </View>
      <KeyRow>
        <DemoKey label="Wrong" tone="wrong" disabled={full} onPress={() => answer('wrong')} />
        <DemoKey label="Right" tone="right" disabled={full} onPress={() => answer('correct')} />
      </KeyRow>
    </View>
  );
}

/** One candle on the bar: its wick, and a body that grows from its open to its close. */
function Candle({
  bar,
  left,
  width,
  y,
  grow,
}: {
  bar: Bar;
  left: number;
  width: number;
  y: (v: number) => number;
  grow: boolean;
}) {
  const reduced = useReduceMotion();
  const t = useSharedValue(grow && !reduced ? 0 : 1);
  useEffect(() => {
    if (grow && !reduced) t.set(withTiming(1, { duration: 360, easing: EASE_OUT }));
  }, [grow, reduced, t]);
  const tone = bar.up ? colors.up : colors.down;
  const top = y(Math.max(bar.o, bar.c));
  const height = Math.max(2, Math.abs(y(bar.o) - y(bar.c)));
  const body = useAnimatedStyle(() => ({ transform: [{ scaleY: t.get() }] }));
  const wick = useAnimatedStyle(() => ({ opacity: t.get() }));
  return (
    <>
      <Animated.View
        style={[
          styles.wick,
          { left: left + width / 2 - 0.75, top: y(bar.h), height: y(bar.l) - y(bar.h) },
          { backgroundColor: tone },
          wick,
        ]}
      />
      <Animated.View
        style={[
          styles.body,
          {
            left,
            width,
            top,
            height,
            backgroundColor: tone,
            // It grows out of its open: up from the bottom, down from the top.
            transformOrigin: bar.up ? 'bottom' : 'top',
          },
          body,
        ]}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Swipe to make the call
// ---------------------------------------------------------------------------

/** How far the card goes before letting go makes the call. */
const CALL_AT = 110;

function SwipeCall() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [call, setCall] = useState<'long' | 'short' | null>(null);
  const x = useSharedValue(0);
  // Read here, in render: the styles below are worklets.
  const up = colors.up;
  const down = colors.down;

  const onCall = (side: 'long' | 'short') => {
    setCall(side);
    revealFeedback(side === 'long' ? 'correct' : 'wrong');
  };
  const fly = (side: 'long' | 'short') => {
    const to = side === 'long' ? 480 : -480;
    if (reduced) x.set(to);
    else x.set(withTiming(to, { duration: 260, easing: EASE_OUT }));
    onCall(side);
  };

  const pan = Gesture.Pan()
    .enabled(call === null)
    .onUpdate((e) => {
      x.set(e.translationX);
    })
    .onEnd((e) => {
      const far = Math.abs(x.get()) > CALL_AT || Math.abs(e.velocityX) > 900;
      if (far) {
        const right = x.get() + e.velocityX * 0.1 > 0;
        x.set(withTiming(right ? 480 : -480, { duration: 240, easing: Easing.out(Easing.cubic) }));
        scheduleOnRN(onCall, right ? 'long' : 'short');
      } else {
        x.set(withSpring(0, { duration: 420, dampingRatio: 0.7 }));
      }
    });

  const card = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { rotate: `${x.get() / 22}deg` }],
  }));
  const longStamp = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, x.get() / CALL_AT)),
  }));
  const shortStamp = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -x.get() / CALL_AT)),
  }));
  const wash = useAnimatedStyle(() => ({
    backgroundColor: x.get() >= 0 ? up : down,
    opacity: Math.min(0.16, (Math.abs(x.get()) / CALL_AT) * 0.16),
  }));

  return (
    <View style={styles.column}>
      <View style={styles.deck}>
        {call ? (
          <View style={[surfaceStyle(spec), styles.verdict]}>
            <Text style={[styles.verdictHead, { color: call === 'long' ? up : down }]}>
              {call === 'long' ? 'Long: right' : 'Short: not this time'}
            </Text>
            <Text style={styles.body16}>
              {call === 'long'
                ? 'The breakout held. The trade made 2R.'
                : 'The breakout held and the price kept rising.'}
            </Text>
          </View>
        ) : null}
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityLabel="Chart card. Swipe right for Long, left for Short."
            style={[surfaceStyle(spec), styles.card, card]}
          >
            <Animated.View pointerEvents="none" style={[styles.cardWash, wash]} />
            <Text style={styles.cardKicker}>ACME · 1 min</Text>
            <MiniChart width={236} height={120} />
            <Text style={styles.cardPrompt}>A break above $54. Your call?</Text>
            <Animated.View style={[styles.stamp, styles.stampLong, { borderColor: up }, longStamp]}>
              <Text style={[styles.stampText, { color: up }]}>LONG</Text>
            </Animated.View>
            <Animated.View
              style={[styles.stamp, styles.stampShort, { borderColor: down }, shortStamp]}
            >
              <Text style={[styles.stampText, { color: down }]}>SHORT</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
      <KeyRow>
        <DemoKey label="Short" disabled={call !== null} onPress={() => fly('short')} />
        <DemoKey label="Long" disabled={call !== null} onPress={() => fly('long')} />
      </KeyRow>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The answer turns over
// ---------------------------------------------------------------------------

const FLIP_MS = 560;

function FlipReveal() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <View style={styles.column}>
      <Text style={styles.prompt}>Price breaks above resistance on heavy volume. What now?</Text>
      <View style={styles.flips}>
        {[
          { text: 'Buy the breakout', right: true, back: 'Heavy volume backs the move.' },
          { text: 'Sell it short', right: false, back: 'Heavy volume backs the move up.' },
        ].map((a, i) => (
          <FlipCard
            key={a.text}
            text={a.text}
            right={a.right}
            back={a.back}
            flipped={picked === i}
            dim={picked !== null && picked !== i}
            onPick={() => setPicked(i)}
            locked={picked !== null}
          />
        ))}
      </View>
    </View>
  );
}

function FlipCard({
  text,
  right,
  back,
  flipped,
  dim,
  locked,
  onPick,
}: {
  text: string;
  right: boolean;
  back: string;
  flipped: boolean;
  dim: boolean;
  locked: boolean;
  onPick: () => void;
}) {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const t = useSharedValue(0);
  const fade = useSharedValue(1);
  useEffect(() => {
    if (!flipped) return;
    flipFeedback();
    if (reduced) {
      t.set(1);
      revealFeedback(right ? 'correct' : 'wrong');
      return;
    }
    t.set(withTiming(1, { duration: FLIP_MS, easing: EASE_OUT }));
    // The verdict sounds as its side comes round.
    const timer = setTimeout(() => revealFeedback(right ? 'correct' : 'wrong'), FLIP_MS * 0.4);
    return () => clearTimeout(timer);
  }, [flipped, reduced, right, t]);
  useEffect(() => {
    fade.set(withTiming(dim ? 0.4 : 1, { duration: 260 }));
  }, [dim, fade]);

  const front = useAnimatedStyle(() => ({
    opacity: fade.get() * (t.get() < 0.5 ? 1 : 0),
    transform: [{ perspective: 900 }, { rotateY: `${t.get() * 180}deg` }],
  }));
  const rear = useAnimatedStyle(() => ({
    opacity: t.get() < 0.5 ? 0 : 1,
    transform: [{ perspective: 900 }, { rotateY: `${t.get() * 180 - 180}deg` }],
  }));
  const tone = right ? colors.success : colors.down;

  return (
    <View style={styles.flipSlot}>
      <Animated.View style={[StyleSheetFill, front]}>
        {/* No press scale: the flip is the answer to the tap. */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: locked }}
          disabled={locked}
          onPress={onPick}
          style={[surfaceStyle(spec), styles.flipFace]}
        >
          <Text style={styles.answer}>{text}</Text>
        </Pressable>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheetFill, rear]}>
        <View
          style={[
            surfaceStyle(spec),
            styles.flipFace,
            styles.flipBack,
            { borderColor: tone, backgroundColor: tint(tone, 0.14) },
          ]}
        >
          <View style={styles.flipHead}>
            {right ? (
              <Icon name="check" size={18} color={tone} strokeWidth={3} />
            ) : (
              <Cross size={18} color={tone} />
            )}
            <Text style={[styles.flipVerdict, { color: tone }]}>
              {right ? 'Right' : 'Not quite'}
            </Text>
          </View>
          <Text style={styles.muted}>{back}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const StyleSheetFill = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const;

// ---------------------------------------------------------------------------
// Answers with depth
// ---------------------------------------------------------------------------

/** How far a row stands above its edge. */
const EDGE = 5;

const DEEP_ANSWERS = [
  { text: '+3 %', right: false },
  { text: '+6 %', right: true },
  { text: '+53 %', right: false },
];

function DeepKeys() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <View style={styles.column}>
      <Text style={styles.prompt}>A share goes from $50 to $53. By how much did it rise?</Text>
      <View style={styles.deepList}>
        {DEEP_ANSWERS.map((a, i) => (
          <DeepKey
            key={a.text}
            text={a.text}
            state={
              picked === null
                ? 'idle'
                : picked === i
                  ? a.right
                    ? 'right'
                    : 'wrong'
                  : a.right
                    ? 'shown'
                    : 'off'
            }
            onPick={() => {
              setPicked(i);
              revealFeedback(a.right ? 'correct' : 'wrong');
            }}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * One answer standing on its edge: it sinks into it while pressed and comes
 * back up on release, unless it was the one picked, which stays down.
 */
function DeepKey({
  text,
  state,
  onPick,
}: {
  text: string;
  state: 'idle' | 'right' | 'wrong' | 'shown' | 'off';
  onPick: () => void;
}) {
  const reduced = useReduceMotion();
  const down = useSharedValue(0);
  const chosen = state === 'right' || state === 'wrong';
  useEffect(() => {
    if (chosen) down.set(reduced ? 1 : withTiming(1, { duration: 90 }));
  }, [chosen, reduced, down]);
  const face = useAnimatedStyle(() => ({ transform: [{ translateY: EDGE * down.get() }] }));

  const tone =
    state === 'right' || state === 'shown'
      ? colors.success
      : state === 'wrong'
        ? colors.down
        : colors.borderStrong;
  // The verdict's wash over an opaque face: the edge must not show through it.
  const wash =
    state === 'right'
      ? tint(colors.success, 0.16)
      : state === 'wrong'
        ? tint(colors.down, 0.16)
        : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: state !== 'idle', selected: chosen }}
      disabled={state !== 'idle'}
      // Nothing on the way down: the verdict on release has its own cue.
      onPressIn={() => {
        if (!reduced) down.set(withTiming(1, { duration: 70 }));
      }}
      onPressOut={() => {
        if (!reduced) down.set(withTiming(0, { duration: 140 }));
      }}
      onPress={onPick}
      style={[styles.deepSlot, state === 'off' && styles.dim]}
    >
      <View style={[styles.deepEdge, { backgroundColor: tone }]} />
      <Animated.View style={[styles.deepFace, { borderColor: tone }, face]}>
        <View style={[styles.deepWash, { backgroundColor: wash }]} />
        <Text
          style={[
            styles.deepText,
            state === 'shown' && { color: colors.success },
            state === 'wrong' && { color: colors.down },
          ]}
        >
          {text}
        </Text>
        {state === 'right' || state === 'shown' ? (
          <Icon name="check" size={20} color={colors.success} strokeWidth={3} />
        ) : state === 'wrong' ? (
          <Cross size={18} color={colors.down} />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// A right answer breaks out
// ---------------------------------------------------------------------------

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CHART_H = 180;
/** The price so far, as fractions of the chart: it drifts up under the level. */
const HISTORY = [0.7, 0.62, 0.66, 0.55, 0.6, 0.5, 0.54, 0.45, 0.5, 0.42];
const LEVEL = 0.36;
const FLOOR = 0.74;
/** Where it goes next: through the level, or through the floor. */
const AFTER = {
  up: [0.42, 0.48, 0.41, 0.45, 0.29, 0.32, 0.15],
  down: [0.42, 0.48, 0.41, 0.52, 0.68, 0.8, 0.88],
};
/** The run tests the line first, so the break comes after a beat. */
const DRAW_MS = 1100;
/** The verdict over the crossing, on one line. */
const LABEL_W = 180;

function Breakout() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [width, setWidth] = useState(0);
  const [side, setSide] = useState<'up' | 'down' | null>(null);
  const draw = useSharedValue(0);
  const burst = useSharedValue(0);

  const n = HISTORY.length + AFTER.up.length - 1;
  const step = width / n;
  const pt = (i: number, f: number) => ({ x: i * step, y: f * CHART_H });
  const history = HISTORY.map((f, i) => pt(i, f));
  const next = side ? AFTER[side].map((f, i) => pt(HISTORY.length - 1 + i, f)) : [];
  const d = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  // The run's length, so its dash can draw it; and where it crosses the line.
  let length = 0;
  let at = 0;
  let cross = { x: 0, y: 0 };
  const line = side === 'up' ? LEVEL : FLOOR;
  for (let i = 1; i < next.length; i++) {
    const a = next[i - 1];
    const b = next[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    const y0 = line * CHART_H;
    if (!at && (a.y - y0) * (b.y - y0) <= 0 && a.y !== b.y) {
      const k = (y0 - a.y) / (b.y - a.y);
      cross = { x: a.x + (b.x - a.x) * k, y: y0 };
      at = length + seg * k;
    }
    length += seg;
  }
  const crossAt = length ? at / length : 0;

  const play = (s: 'up' | 'down') => {
    setSide(s);
    if (reduced) {
      draw.set(1);
      burst.set(1);
      revealFeedback(s === 'up' ? 'correct' : 'wrong');
      return;
    }
    draw.set(0);
    burst.set(0);
    draw.set(withTiming(1, { duration: DRAW_MS, easing: Easing.inOut(Easing.quad) }));
  };
  // The burst goes off as the line reaches the level, with the verdict's sound.
  useEffect(() => {
    if (!side || reduced) return;
    const timer = setTimeout(
      () => {
        revealFeedback(side === 'up' ? 'correct' : 'wrong');
        burst.set(withTiming(1, { duration: 900, easing: EASE_OUT }));
      },
      DRAW_MS * Math.min(1, crossAt * 1.08),
    );
    return () => clearTimeout(timer);
    // once per call, when its run is laid out
  }, [side, reduced, crossAt, burst]);

  const tone = side === 'down' ? colors.down : colors.up;
  const runProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - draw.get()) }));
  const ringProps = useAnimatedProps(() => ({
    r: 4 + 36 * burst.get(),
    strokeWidth: 3.5 - 2.5 * burst.get(),
    opacity: burst.get() > 0 && burst.get() < 1 ? 1 - burst.get() : 0,
  }));
  // A dot pops where it broke and stays there, marking the spot.
  const dotProps = useAnimatedProps(() => {
    const t = burst.get();
    return { r: t > 0 ? 4 + 5 * Math.sin(Math.PI * Math.min(1, t * 1.6)) : 0 };
  });
  const label = useAnimatedStyle(() => ({
    opacity: Math.min(1, burst.get() * 3),
    transform: [
      { translateY: -8 * burst.get() },
      { scale: 0.8 + 0.2 * Math.min(1, burst.get() * 2) },
    ],
  }));

  return (
    <View style={styles.column}>
      <View
        style={styles.breakChart}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessibilityLabel={
          side === 'up'
            ? 'The price broke out above the level'
            : side === 'down'
              ? 'The price fell through the floor'
              : 'A price under a level'
        }
      >
        {width > 0 ? (
          <Svg width={width} height={CHART_H}>
            <Line
              x1={0}
              x2={width}
              y1={LEVEL * CHART_H}
              y2={LEVEL * CHART_H}
              stroke={colors.textFaint}
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />
            <Line
              x1={0}
              x2={width}
              y1={FLOOR * CHART_H}
              y2={FLOOR * CHART_H}
              stroke={colors.borderStrong}
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />
            <Path
              d={d(history)}
              stroke={spec.chartLine}
              strokeWidth={2.5}
              fill="none"
              strokeLinejoin="round"
            />
            {side ? (
              <>
                <AnimatedPath
                  d={d(next)}
                  stroke={tone}
                  strokeWidth={3}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={`${length} ${length}`}
                  animatedProps={runProps}
                />
                <AnimatedCircle
                  cx={cross.x}
                  cy={cross.y}
                  fill="none"
                  stroke={tone}
                  animatedProps={ringProps}
                />
                {SPARKS.map((a, i) => (
                  <Spark key={i} angle={a} x={cross.x} y={cross.y} burst={burst} color={tone} />
                ))}
                <AnimatedCircle cx={cross.x} cy={cross.y} fill={tone} animatedProps={dotProps} />
              </>
            ) : null}
          </Svg>
        ) : null}
        <Text style={[styles.levelTag, { top: LEVEL * CHART_H - 22 }]}>Resistance</Text>
        <Text style={[styles.levelTag, { top: FLOOR * CHART_H + 4 }]}>Support</Text>
        {side ? (
          <Animated.View
            style={[
              styles.breakLabel,
              {
                left: Math.max(0, Math.min(width - LABEL_W, cross.x - LABEL_W / 2)),
                top: side === 'up' ? cross.y - 64 : cross.y + 22,
              },
              label,
            ]}
          >
            <Text style={[styles.breakText, { color: tone }]}>
              {side === 'up' ? 'Breakout +2.4\u00a0%' : 'Breakdown −1.8\u00a0%'}
            </Text>
          </Animated.View>
        ) : null}
      </View>
      <KeyRow>
        <DemoKey label="Wrong" tone="wrong" disabled={side !== null} onPress={() => play('down')} />
        <DemoKey label="Right" tone="right" disabled={side !== null} onPress={() => play('up')} />
      </KeyRow>
    </View>
  );
}

/** Twelve sparks round the crossing, every 30 degrees. */
const SPARKS = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

/** One spark flying out from where the price crossed the line. */
function Spark({
  angle,
  x,
  y,
  burst,
  color,
}: {
  angle: number;
  x: number;
  y: number;
  burst: SharedValue<number>;
  color: string;
}) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const props = useAnimatedProps(() => {
    const t = burst.get();
    return {
      cx: x + dx * 46 * t,
      cy: y + dy * 46 * t + 14 * t * t,
      r: 3.6 * (1 - t) + 0.6,
      opacity: t > 0 && t < 1 ? 1 - t * t : 0,
    };
  });
  return <AnimatedCircle fill={color} animatedProps={props} />;
}

// ---------------------------------------------------------------------------
// Slide to place the trade
// ---------------------------------------------------------------------------

const KNOB = 52;
const TRACK_PAD = 4;

function SlideConfirm() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [width, setWidth] = useState(0);
  const [placed, setPlaced] = useState(false);
  const x = useSharedValue(0);
  const notch = useSharedValue(0);
  const start = useSharedValue(0);
  const max = Math.max(0, width - KNOB - TRACK_PAD * 2);
  // Read here, in render: the styles and the gesture below are worklets.
  const face = spec.cta.face;
  const success = colors.success;

  const onPlaced = () => {
    setPlaced(true);
    commitFeedback();
  };
  // A tap slides the knob home on its own; the trade is placed as it lands.
  const [sliding, setSliding] = useState(false);
  useEffect(() => {
    if (!sliding) return;
    const timer = setTimeout(onPlaced, 380);
    return () => clearTimeout(timer);
    // once per tap
  }, [sliding]);
  const slideHome = () => {
    if (placed || sliding) return;
    if (reduced) {
      x.set(max);
      onPlaced();
      return;
    }
    x.set(withTiming(max, { duration: 380, easing: EASE_OUT }));
    setSliding(true);
  };

  const pan = Gesture.Pan()
    .enabled(!placed && max > 0)
    .onBegin(() => {
      start.set(x.get());
    })
    .onUpdate((e) => {
      const next = Math.min(max, Math.max(0, start.get() + e.translationX));
      x.set(next);
      // A click at every quarter of the way.
      const at = Math.floor((next / max) * 4);
      if (at !== notch.get()) {
        notch.set(at);
        scheduleOnRN(detentFeedback);
      }
    })
    .onEnd(() => {
      if (x.get() > max * 0.85) {
        x.set(withTiming(max, { duration: 160 }));
        scheduleOnRN(onPlaced);
      } else {
        x.set(withSpring(0, { duration: 380, dampingRatio: 0.75 }));
        notch.set(0);
      }
    });
  const tap = Gesture.Tap()
    .enabled(!placed)
    .onEnd(() => {
      scheduleOnRN(slideHome);
    });

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const trail = useAnimatedStyle(() => ({ width: x.get() + KNOB + TRACK_PAD }));
  const hint = useAnimatedStyle(() => ({
    opacity: max > 0 ? 1 - Math.min(1, x.get() / (max * 0.6)) : 1,
  }));

  return (
    <View style={styles.column}>
      <View style={[surfaceStyle(spec), styles.ticket]}>
        <View style={styles.ticketRow}>
          <Text style={[styles.ticketSide, { color: colors.up }]}>BUY</Text>
          <Text style={styles.ticketMain}>10 ACME @ $53.40</Text>
        </View>
        <View style={styles.ticketRule} />
        <View style={styles.ticketRow}>
          <Text style={styles.muted}>Stop</Text>
          <Text style={styles.ticketNum}>$52.80</Text>
          <Text style={styles.muted}>Target</Text>
          <Text style={styles.ticketNum}>$54.60</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.muted}>Risk</Text>
          <Text style={styles.ticketNum}>$6.00 · 1R</Text>
        </View>
      </View>
      <View
        style={[
          styles.track,
          placed && { backgroundColor: tint(success, 0.18), borderColor: success },
        ]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[styles.trail, { backgroundColor: tint(placed ? success : face, 0.22) }, trail]}
        />
        <Animated.Text style={[styles.trackText, placed && { color: success }, hint]}>
          {placed ? '' : 'Slide to place'}
        </Animated.Text>
        {placed ? (
          <View style={styles.placed}>
            <Text style={[styles.trackText, { color: success }]}>Placed</Text>
          </View>
        ) : null}
        <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
          <Animated.View
            accessible
            accessibilityRole="button"
            accessibilityLabel="Place the trade"
            accessibilityHint="Slide to the end, or tap"
            style={[styles.knob, { backgroundColor: placed ? success : face }, knob]}
          >
            {placed ? (
              <Icon name="check" size={22} color={colors.background} strokeWidth={3} />
            ) : (
              <Icon name="next" size={24} color={spec.cta.text} strokeWidth={2.6} />
            )}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Run a finger along the chart
// ---------------------------------------------------------------------------

const SCRUB_H = 170;
/** A morning of prices, a point every five minutes from the open at 9:30. */
const PRICES = [
  52.1, 52.3, 52.0, 52.4, 52.6, 52.5, 52.9, 53.2, 53.0, 52.8, 52.7, 53.1, 53.5, 53.4, 53.8, 54.1,
  53.9, 53.6, 53.7, 54.0, 54.3, 54.2, 54.5, 54.4,
];
const OPEN = PRICES[0];

function timeOf(i: number): string {
  const m = 9 * 60 + 30 + i * 5;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

function ChartScrub() {
  const spec = useLookSpec();
  const [width, setWidth] = useState(0);
  const [at, setAt] = useState<number | null>(null);
  const x = useSharedValue(0);
  const shown = useSharedValue(0);
  const index = useSharedValue(-1);

  const lo = Math.min(...PRICES) - 0.3;
  const hi = Math.max(...PRICES) + 0.3;
  const step = width / (PRICES.length - 1);
  const ys = PRICES.map((p) => 8 + ((hi - p) / (hi - lo)) * (SCRUB_H - 16));
  const line = ys
    .map((y, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${width.toFixed(1)} ${SCRUB_H} L0 ${SCRUB_H} Z`;
  const accent = spec.chartLine;

  const onIndex = (i: number) => {
    setAt(i);
    detentFeedback();
  };
  const pan = Gesture.Pan()
    .minDistance(0)
    .enabled(width > 0)
    .onBegin((e) => {
      shown.set(1);
      x.set(Math.min(width, Math.max(0, e.x)));
      const i = Math.round(x.get() / step);
      if (i !== index.get()) {
        index.set(i);
        scheduleOnRN(onIndex, i);
      }
    })
    .onUpdate((e) => {
      x.set(Math.min(width, Math.max(0, e.x)));
      const i = Math.round(x.get() / step);
      if (i !== index.get()) {
        index.set(i);
        scheduleOnRN(onIndex, i);
      }
    });

  const hair = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateX: Math.round(x.get() / step) * step - 0.75 }],
  }));
  const dot = useAnimatedStyle(() => {
    const i = Math.max(0, Math.min(ys.length - 1, Math.round(x.get() / step)));
    return {
      opacity: shown.get(),
      transform: [{ translateX: i * step - 7 }, { translateY: ys[i] - 7 }],
    };
  });

  const price = at === null ? PRICES[PRICES.length - 1] : PRICES[at];
  const change = ((price - OPEN) / OPEN) * 100;
  const tone = change >= 0 ? colors.up : colors.down;
  return (
    <View style={styles.column}>
      <View style={styles.scrubHead}>
        <Text style={styles.muted}>{`ACME · ${at === null ? 'Now' : timeOf(at)}`}</Text>
        <Text style={styles.scrubPrice}>{`$${price.toFixed(2)}`}</Text>
        <Text style={[styles.scrubChange, { color: tone }]}>
          {`${change >= 0 ? '▲ +' : '▼ −'}${Math.abs(change).toFixed(2)} % since the open`}
        </Text>
      </View>
      <GestureDetector gesture={pan}>
        <View
          style={styles.scrubChart}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          accessible
          accessibilityLabel="The morning's chart. Touch it to read the price at a moment."
        >
          {width > 0 ? (
            <Svg width={width} height={SCRUB_H}>
              <Defs>
                <LinearGradient id="scrubFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={accent} stopOpacity={0.28} />
                  <Stop offset="1" stopColor={accent} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={area} fill="url(#scrubFill)" />
              <Path d={line} stroke={accent} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
            </Svg>
          ) : null}
          <Animated.View pointerEvents="none" style={[styles.hair, hair]} />
          <Animated.View
            pointerEvents="none"
            style={[styles.scrubDot, { borderColor: accent, backgroundColor: colors.surface }, dot]}
          />
        </View>
      </GestureDetector>
      <View style={styles.scrubAxis}>
        <Text style={styles.axisText}>9:30</Text>
        <Text style={styles.axisText}>{timeOf(PRICES.length - 1)}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Theory typed out like a terminal
// ---------------------------------------------------------------------------

const THEORY =
  'The spread is the gap between the bid and the ask. You pay it every time you trade.';
const TYPE_MS = 32;

function TypedTheory() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [n, setN] = useState(reduced ? THEORY.length : 0);
  const [blink, setBlink] = useState(true);
  const done = n >= THEORY.length;

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => {
      setN((k) => k + 1);
      // A key's click every few letters, not every one.
      if (n % 3 === 0) detentFeedback();
    }, TYPE_MS);
    return () => clearTimeout(timer);
  }, [n, done]);
  // The caret blinks while it types and goes once the card is written.
  useEffect(() => {
    if (reduced || done) return;
    const timer = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(timer);
  }, [reduced, done]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={THEORY}
      accessibilityHint="Shows it all"
      onPress={() => setN(THEORY.length)}
      style={[surfaceStyle(spec), styles.theory]}
    >
      <Text style={[styles.theoryKicker, { color: colors.accent }]}>{'> THE SPREAD'}</Text>
      {/* The words still to come are there but clear, so the card never grows as it types. */}
      <Text style={styles.theoryText}>
        {THEORY.slice(0, n)}
        {done ? null : (
          <Text style={{ color: blink || reduced ? colors.accent : 'transparent' }}>▍</Text>
        )}
        <Text style={styles.clear}>{THEORY.slice(n)}</Text>
      </Text>
      <Text style={styles.muted}>
        {done ? 'Bid $53.38 · Ask $53.40 · Spread 2¢' : 'Tap to show it all'}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------

/** The cross of a wrong answer, drawn: the app's icons have none. */
export function Cross({ size = 18, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M4 4l10 10M14 4L4 14"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = themed(() => ({
  column: { alignSelf: 'stretch', gap: space.xl },
  middle: { alignItems: 'center', gap: 2 },
  big: { ...type.display, color: colors.text, fontFamily: MONO_FONT },
  muted: { ...type.small, color: colors.textMuted },
  prompt: { ...type.prompt, color: colors.text },
  answer: { ...type.answer, color: colors.text },
  body16: { ...type.body, color: colors.text },

  lessonBar: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  strip: { flex: 1, height: BAR_H },
  slot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.borderStrong,
  },
  wick: { position: 'absolute', width: 1.5, borderRadius: 1 },
  body: { position: 'absolute', borderRadius: 1.5 },
  count: { ...type.label, fontFamily: MONO_FONT, color: colors.textMuted },

  deck: { height: 240, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 268,
    padding: space.md,
    gap: space.sm,
    overflow: 'hidden',
  },
  cardWash: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  cardKicker: { ...type.small, fontFamily: MONO_FONT, color: colors.textMuted },
  cardPrompt: { ...type.label, color: colors.text },
  stamp: {
    position: 'absolute',
    top: space.lg,
    borderWidth: 2.5,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  stampLong: { left: space.lg, transform: [{ rotate: '-12deg' }] },
  stampShort: { right: space.lg, transform: [{ rotate: '12deg' }] },
  stampText: { ...type.title, fontFamily: MONO_FONT, letterSpacing: 2 },
  verdict: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: space.lg,
    gap: space.xs,
  },
  verdictHead: { ...type.title },

  dim: { opacity: 0.45 },
  deepList: { gap: space.md },
  deepSlot: { height: 54 + EDGE },
  deepEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: EDGE,
    height: 54,
    borderRadius: radius.md,
  },
  deepFace: {
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  deepWash: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  deepText: { ...type.answer, fontFamily: MONO_FONT, color: colors.text },

  breakChart: { height: CHART_H },
  levelTag: { ...type.small, color: colors.textMuted, position: 'absolute', left: 0 },
  breakLabel: { position: 'absolute', width: LABEL_W, alignItems: 'center' },
  breakText: { ...type.label, fontFamily: MONO_FONT, fontWeight: '800' },

  ticket: { padding: space.lg, gap: space.sm },
  ticketRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  ticketSide: { ...type.label, fontFamily: MONO_FONT, fontWeight: '800' },
  ticketMain: { ...type.prompt, fontFamily: MONO_FONT, color: colors.text },
  ticketNum: { ...type.label, fontFamily: MONO_FONT, color: colors.text, marginRight: space.sm },
  ticketRule: { height: 1, backgroundColor: colors.border, borderStyle: 'dashed' },
  track: {
    height: KNOB + TRACK_PAD * 2,
    borderRadius: (KNOB + TRACK_PAD * 2) / 2,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: (KNOB + TRACK_PAD * 2) / 2,
  },
  trackText: { ...type.label, color: colors.textMuted, textAlign: 'center', paddingLeft: KNOB / 2 },
  placed: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  knob: {
    position: 'absolute',
    left: TRACK_PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrubHead: { gap: 2 },
  scrubPrice: { ...type.display, fontFamily: MONO_FONT, color: colors.text },
  scrubChange: { ...type.label, fontFamily: MONO_FONT },
  scrubChart: { height: SCRUB_H },
  hair: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: colors.textMuted },
  scrubDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
  scrubAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -space.md },
  axisText: { ...type.small, fontFamily: MONO_FONT, color: colors.textMuted },

  theory: { alignSelf: 'stretch', padding: space.lg, gap: space.md },
  theoryKicker: { ...type.label, fontFamily: MONO_FONT, letterSpacing: 1 },
  theoryText: { ...type.body, fontFamily: MONO_FONT, color: colors.text },
  clear: { color: 'transparent' },

  flips: { gap: space.md },
  flipSlot: { height: 92 },
  flipFace: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    gap: space.xs,
  },
  flipBack: { borderWidth: 1.5 },
  flipHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flipVerdict: { ...type.prompt },
}));
