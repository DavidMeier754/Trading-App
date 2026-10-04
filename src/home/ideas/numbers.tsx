import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Grade } from '../../lesson/answers';
import {
  celebrateFeedback,
  detentFeedback,
  fizzleFeedback,
  noteFeedback,
  revealFeedback,
  runBefore,
  STREAK_FROM,
  tapFeedback,
} from '../../lesson/feedback';
import { emitMood, tint, useLookSpec } from '../../lesson/look';
import { EASE_IN_OUT, EASE_OUT, SPRING_POP, usePressFeedback } from '../../lesson/motion';
import ProgressBar from '../../lesson/ProgressBar';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, MONO_FONT, radius, space, themed, type } from '../../theme';
import Icon from '../icons';
import { DemoKey, KeyRow, Suggestion } from './kit';

/** Ideas for numbers and feedback: the bar, a number set by hand, hearts, runs and days. */
export const NUMBERS: Suggestion[] = [
  {
    id: 'liquid-bar',
    section: 'numbers',
    icon: 'drop',
    title: 'A progress bar that sloshes',
    line: 'The bar is a liquid: each step pours in and its surface rocks, then settles.',
    again: 'Start again',
    Preview: LiquidBar,
  },
  {
    id: 'dial',
    section: 'numbers',
    icon: 'gauge',
    title: 'Numbers on a dial',
    line: 'Turn a dial to answer a number question, with a click at every step. Minus and plus still work.',
    again: 'Start again',
    Preview: Dial,
  },
  {
    id: 'heart-crack',
    section: 'numbers',
    icon: 'heart',
    title: 'A heart that breaks',
    line: 'A wrong answer cracks the heart in two and the halves fall away.',
    again: 'Start again',
    Preview: HeartCrack,
  },
  {
    id: 'combo',
    section: 'numbers',
    icon: 'bolt',
    title: 'A combo counter',
    line: 'From three right in a row, a ×3, ×4 and on punches in beside the bar and grows with the run.',
    note: 'It would stand in for the flame of right answers in a row (docs/ui/11-top-bar.md §7.2).',
    again: 'Start again',
    Preview: Combo,
  },
  {
    id: 'heatmap',
    section: 'numbers',
    icon: 'calendar',
    title: 'Your practice as a heat map',
    line: 'Every day you learned is a square, darker the more you did: months on one screen.',
    Preview: Heatmap,
  },
];

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ---------------------------------------------------------------------------
// A progress bar that sloshes
// ---------------------------------------------------------------------------

const TUBE_STEPS = 12;
/** Three screens done already, so there is liquid to slosh before the first tap. */
const TUBE_SEED = 3;
const TUBE_W = 264;
const TUBE_H = 48;
/** Points down the liquid's front, and waves along it. */
const TUBE_ROWS = 16;
const TUBE_WAVES = 1.25;
/** The wave on the front at rest and as a step pours in, and how far the front leans. */
const AMP_REST = 1.6;
const AMP_POUR = 9;
const LEAN = 14;
/** How far the wave runs along the front with each step. */
const PHASE_STEP = Math.PI * 2.5;
/** A drop falls into the bar; the level starts to rise as it lands. */
const DROP = 22;
const DROP_FALL = 40;
const DROP_MS = 170;
const POUR_AT = 120;
/**
 * Bubbles that rise through the liquid as a step pours in: how far behind the
 * front each one starts, its size, and when it sets off in the fizz (0..1).
 */
const BUBBLES = [
  { back: 7, r: 2.2, at: 0 },
  { back: 16, r: 1.6, at: 0.14 },
  { back: 10, r: 2.6, at: 0.28 },
  { back: 21, r: 1.8, at: 0.42 },
];
const FIZZ_MS = 1100;

/**
 * The liquid as a path: along the top to its front, down the front as a wave
 * that leans, and back along the bottom. The wave and the lean flatten out in
 * the first and the last step, so an empty bar is empty and a full one full.
 */
function liquidPath(level: number, amp: number, phase: number, lean: number, ahead: number) {
  'worklet';
  const k = Math.max(0, Math.min(1, level * TUBE_STEPS, (1 - level) * TUBE_STEPS));
  const x0 = level * TUBE_W + ahead * k;
  let d = 'M-2,-2';
  for (let i = 0; i <= TUBE_ROWS; i++) {
    const v = i / TUBE_ROWS;
    const wave = amp * Math.sin(phase + v * Math.PI * 2 * TUBE_WAVES);
    const x = x0 + k * (wave + lean * LEAN * (0.5 - v));
    d += ` L${x.toFixed(1)},${(v * (TUBE_H + 4) - 2).toFixed(1)}`;
  }
  return `${d} L-2,${TUBE_H + 2} Z`;
}

/** The first frame, drawn before the animated props arrive (a phone wants a real path). */
const FRONT_FIRST = liquidPath(TUBE_SEED / TUBE_STEPS, AMP_REST, 0, 0, 0);
const BACK_FIRST = liquidPath(TUBE_SEED / TUBE_STEPS, AMP_REST * 1.3, 2.2, 0, 6);

/**
 * The lesson's bar as a glass tube of liquid. "Next screen" drops a drop in:
 * the level eases up a step, the front surges, rocks back and forth and
 * settles, and each step sounds a note higher, like a bottle filling.
 */
function LiquidBar() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [step, setStep] = useState(TUBE_SEED);
  const level = useSharedValue(TUBE_SEED / TUBE_STEPS);
  const amp = useSharedValue(reduced ? 0 : AMP_REST);
  const phase = useSharedValue(0);
  const lean = useSharedValue(0);
  const drop = useSharedValue(0);
  const bump = useSharedValue(1);
  const fizz = useSharedValue(0);
  const full = step >= TUBE_STEPS;
  const accent = spec.accent;
  // Light bubbles, unless the liquid is nearly white (Neo Mono in the dark).
  const bubble = brightness(accent) > 0.8 ? spec.ground.color : '#FFFFFF';

  const pour = () => {
    if (full) return;
    const next = step + 1;
    setStep(next);
    if (next === TUBE_STEPS) celebrateFeedback(false);
    else noteFeedback(((next - TUBE_SEED - 1) * 9) / (TUBE_STEPS - TUBE_SEED - 2));
    const to = next / TUBE_STEPS;
    if (reduced) {
      level.set(withTiming(to, { duration: 140, easing: EASE_OUT }));
      return;
    }
    drop.set(0);
    drop.set(withTiming(1, { duration: DROP_MS, easing: Easing.in(Easing.quad) }));
    fizz.set(0);
    fizz.set(
      withDelay(POUR_AT, withTiming(1, { duration: FIZZ_MS, easing: Easing.out(Easing.quad) })),
    );
    level.set(withDelay(POUR_AT, withTiming(to, { duration: 700, easing: EASE_OUT })));
    amp.set(
      withDelay(
        POUR_AT,
        withSequence(
          withTiming(AMP_POUR, { duration: 140, easing: EASE_OUT }),
          withTiming(AMP_REST, { duration: 1600, easing: Easing.out(Easing.cubic) }),
        ),
      ),
    );
    phase.set(
      withDelay(POUR_AT, withTiming(next * PHASE_STEP, { duration: 1800, easing: EASE_OUT })),
    );
    // The front surges forward, then rocks back and forth, less each time.
    lean.set(
      withDelay(
        POUR_AT,
        withSequence(
          withTiming(1, { duration: 220, easing: EASE_OUT }),
          withTiming(-0.5, { duration: 360, easing: EASE_IN_OUT }),
          withTiming(0.24, { duration: 360, easing: EASE_IN_OUT }),
          withTiming(-0.1, { duration: 360, easing: EASE_IN_OUT }),
          withTiming(0, { duration: 400, easing: EASE_OUT }),
        ),
      ),
    );
    bump.set(
      withDelay(
        POUR_AT,
        withSequence(
          withTiming(1.2, { duration: 110, easing: EASE_OUT }),
          withSpring(1, SPRING_POP),
        ),
      ),
    );
  };

  const front = useAnimatedProps(() => ({
    d: liquidPath(level.get(), amp.get(), phase.get(), lean.get(), 0),
  }));
  // A paler wave behind, a little ahead and out of step: the liquid has depth.
  const back = useAnimatedProps(() => ({
    d: liquidPath(level.get(), amp.get() * 1.3, phase.get() + 2.2, lean.get() * 0.7, 6),
  }));
  const dropStyle = useAnimatedStyle(() => {
    const t = drop.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : Math.min(1, (1 - t) * 5),
      transform: [
        { translateY: -DROP_FALL + (DROP_FALL + TUBE_H / 2 - DROP / 2) * t },
        { scaleY: 1 + 0.25 * t },
      ],
    };
  });
  const countStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.get() }] }));

  return (
    <View style={styles.column}>
      <View style={styles.tubeWrap}>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={`${step} of ${TUBE_STEPS} screens`}
          accessibilityValue={{ min: 0, max: TUBE_STEPS, now: step }}
        >
          <Svg width={TUBE_W} height={TUBE_H}>
            <Defs>
              <ClipPath id="liquid-tube">
                <Rect x={0} y={0} width={TUBE_W} height={TUBE_H} rx={TUBE_H / 2} />
              </ClipPath>
            </Defs>
            <Rect
              x={0.75}
              y={0.75}
              width={TUBE_W - 1.5}
              height={TUBE_H - 1.5}
              rx={(TUBE_H - 1.5) / 2}
              fill={spec.track}
            />
            <G clipPath="url(#liquid-tube)">
              <AnimatedPath d={BACK_FIRST} animatedProps={back} fill={tint(accent, 0.4)} />
              <AnimatedPath d={FRONT_FIRST} animatedProps={front} fill={accent} />
              {BUBBLES.map((b, i) => (
                <Bubble
                  key={i}
                  // Behind the front as it stood before this step: always in the liquid.
                  x={((step - 1) / TUBE_STEPS) * TUBE_W - b.back}
                  r={b.r}
                  at={b.at}
                  fizz={fizz}
                  color={bubble}
                />
              ))}
              {/* A mark per screen, like the lines on a measuring glass. */}
              {Array.from({ length: TUBE_STEPS - 1 }, (_, i) => {
                const x = ((i + 1) * TUBE_W) / TUBE_STEPS;
                return (
                  <Line
                    key={i}
                    x1={x}
                    x2={x}
                    y1={TUBE_H - 10}
                    y2={TUBE_H - 5}
                    stroke={colors.textFaint}
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* The glass catching the light. */}
              <Rect
                x={18}
                y={7}
                width={TUBE_W - 36}
                height={5}
                rx={2.5}
                fill="#FFFFFF"
                opacity={0.2}
              />
            </G>
            <Rect
              x={0.75}
              y={0.75}
              width={TUBE_W - 1.5}
              height={TUBE_H - 1.5}
              rx={(TUBE_H - 1.5) / 2}
              fill="none"
              stroke={spec.surface.border}
              strokeWidth={1.5}
            />
          </Svg>
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.drop,
            { left: ((step - 0.5) / TUBE_STEPS) * TUBE_W - DROP / 2 },
            dropStyle,
          ]}
        >
          <Icon name="drop" size={DROP} color={accent} />
        </Animated.View>
      </View>
      <Animated.View style={[styles.tubeCount, countStyle]}>
        <Text style={styles.tubeNow}>{step}</Text>
        <Text style={styles.tubeOf}>{`/${TUBE_STEPS}`}</Text>
      </Animated.View>
      <KeyRow>
        <DemoKey label="Next screen" tone="accent" disabled={full} onPress={pour} />
      </KeyRow>
    </View>
  );
}

/** One bubble: it rises from the bottom of the tube, wavering, and fades as it goes. */
function Bubble({
  x,
  r,
  at,
  fizz,
  color,
}: {
  x: number;
  r: number;
  at: number;
  fizz: SharedValue<number>;
  color: string;
}) {
  const props = useAnimatedProps(() => {
    const t = Math.min(1, Math.max(0, (fizz.get() - at) / 0.55));
    return {
      cx: x + 2 * Math.sin(t * Math.PI * 2),
      cy: TUBE_H - 7 - (TUBE_H - 16) * t,
      opacity: t > 0 && t < 1 ? 0.6 * (1 - t) : 0,
    };
  });
  return (
    <AnimatedCircle cx={x} cy={TUBE_H - 7} r={r} fill={color} opacity={0} animatedProps={props} />
  );
}

/** How light a `#rrggbb` colour looks, 0 (black) to 1 (white). */
function brightness(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

// ---------------------------------------------------------------------------
// Numbers on a dial
// ---------------------------------------------------------------------------

const DIAL = 168;
const DIAL_C = DIAL / 2;
const KNOB = 120;
const KNOB_C = KNOB / 2;
/** $0 to $200 in steps of $10, round 270 degrees with the gap at the bottom. */
const DIAL_STEPS = 20;
const DIAL_FROM = -0.75 * Math.PI;
const DIAL_TO = 0.75 * Math.PI;
const DIAL_NOTCH = (DIAL_TO - DIAL_FROM) / DIAL_STEPS;
/** 1 % of $5,000. */
const DIAL_ANSWER = 5;
/** Near the middle a small move swings the angle right round, so a turn there is not read. */
const DIAL_DEAD = 18;

/** A point at angle `a` (0 at the top, clockwise) and radius `r` from a middle at `c`. */
function polar(c: number, a: number, r: number) {
  return { x: c + r * Math.sin(a), y: c - r * Math.cos(a) };
}

/** The scale: a tick per $10, longer every $50. */
const DIAL_TICKS = Array.from({ length: DIAL_STEPS + 1 }, (_, i) => {
  const a = DIAL_FROM + i * DIAL_NOTCH;
  const major = i % 5 === 0;
  return { major, from: polar(DIAL_C, a, major ? 67 : 72), to: polar(DIAL_C, a, 80) };
});

/** The knob's grip: ridges round its rim, with room for the pointer at the top. */
const GRIP = Array.from({ length: 36 }, (_, i) => (i * 2 * Math.PI) / 36)
  .filter((a) => a > 0.3 && a < 2 * Math.PI - 0.3)
  .map((a) => ({ from: polar(KNOB_C, a, 50), to: polar(KNOB_C, a, 56) }));

/** Where the scale's two ends are labelled, under the ends of its arc. */
const DIAL_LOW = polar(DIAL_C, DIAL_FROM, 80);
const DIAL_HIGH = polar(DIAL_C, DIAL_TO, 80);

/**
 * A number question answered on a dial: twist it anywhere and it clicks at
 * every $10, and lets go into the nearest step. Minus and plus turn it a step
 * at a time, and Check grades it.
 */
function Dial() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [step, setStep] = useState(0);
  const [verdict, setVerdict] = useState<Grade | null>(null);
  const turn = useSharedValue(DIAL_FROM);
  const grab = useSharedValue(0);
  const landed = useSharedValue(0);
  const knock = useSharedValue(0);
  const shake = useSharedValue(0);
  const ring = useSharedValue(0);
  const pop = useSharedValue(1);
  const reveal = useSharedValue(0);
  const locked = verdict !== null;

  const onStep = useCallback((s: number) => {
    setStep(s);
    detentFeedback();
  }, []);

  const nudge = (delta: number) => {
    if (locked) return;
    const s = Math.max(0, Math.min(DIAL_STEPS, step + delta));
    if (s === step) {
      // At the end of the scale: it knocks against the stop and goes no further.
      tapFeedback();
      if (!reduced) {
        knock.set(
          withSequence(
            withTiming(delta * 0.07, { duration: 60, easing: EASE_OUT }),
            withSpring(0, { duration: 360, dampingRatio: 0.45 }),
          ),
        );
      }
      return;
    }
    landed.set(s);
    setStep(s);
    detentFeedback();
    const to = DIAL_FROM + s * DIAL_NOTCH;
    turn.set(reduced ? to : withSpring(to, { duration: 320, dampingRatio: 0.62 }));
  };

  const check = () => {
    if (locked) return;
    const grade: Grade = step === DIAL_ANSWER ? 'correct' : 'wrong';
    setVerdict(grade);
    revealFeedback(grade);
    emitMood(grade);
    if (reduced) {
      reveal.set(1);
      return;
    }
    reveal.set(withTiming(1, { duration: 240, easing: EASE_OUT }));
    if (grade === 'correct') {
      ring.set(0);
      ring.set(withTiming(1, { duration: 640, easing: EASE_OUT }));
      pop.set(
        withSequence(
          withTiming(1.16, { duration: 120, easing: EASE_OUT }),
          withSpring(1, SPRING_POP),
        ),
      );
    } else {
      shake.set(
        withSequence(
          withTiming(-9, { duration: 50 }),
          withTiming(9, { duration: 80 }),
          withTiming(-6, { duration: 80 }),
          withTiming(4, { duration: 70 }),
          withTiming(0, { duration: 70 }),
        ),
      );
    }
  };

  // The knob turns by as much as the finger goes round its middle, wherever it
  // is grabbed, and stops at the ends of the scale.
  const pan = Gesture.Pan()
    .minDistance(0)
    .enabled(!locked)
    .onBegin((e) => {
      grab.set(Math.atan2(e.x - DIAL_C, DIAL_C - e.y));
    })
    .onUpdate((e) => {
      const dx = e.x - DIAL_C;
      const dy = DIAL_C - e.y;
      const a = Math.atan2(dx, dy);
      let d = a - grab.get();
      if (d > Math.PI) d -= 2 * Math.PI;
      else if (d < -Math.PI) d += 2 * Math.PI;
      grab.set(a);
      if (dx * dx + dy * dy < DIAL_DEAD * DIAL_DEAD) return;
      const next = Math.min(DIAL_TO, Math.max(DIAL_FROM, turn.get() + d));
      turn.set(next);
      const s = Math.round((next - DIAL_FROM) / DIAL_NOTCH);
      if (s !== landed.get()) {
        landed.set(s);
        scheduleOnRN(onStep, s);
      }
    })
    .onFinalize(() => {
      const to = DIAL_FROM + landed.get() * DIAL_NOTCH;
      turn.set(reduced ? to : withSpring(to, { duration: 260, dampingRatio: 0.8 }));
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.get() + knock.get()}rad` }],
  }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));
  const ringStyle = useAnimatedStyle(() => {
    const r = ring.get();
    return {
      opacity: r > 0 && r < 1 ? 0.9 * (1 - r) : 0,
      transform: [{ scale: 0.85 + 0.35 * r }],
    };
  });
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  const verdictStyle = useAnimatedStyle(() => ({
    opacity: reveal.get(),
    transform: [{ translateY: 6 * (1 - reveal.get()) }],
  }));

  const tone =
    verdict === 'correct' ? colors.success : verdict === 'wrong' ? colors.down : spec.accent;
  const value = step * 10;

  return (
    <View style={[styles.column, styles.dialColumn]}>
      <Text style={styles.prompt}>Risk 1 % of $5,000. How much is that?</Text>
      <View style={styles.dialRow}>
        <StepKey label="−" name="Less" disabled={locked} onPress={() => nudge(-1)} />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[styles.dial, shakeStyle]}
            accessibilityRole="adjustable"
            accessibilityLabel="Dial"
            accessibilityValue={{ text: `$${value}` }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.dialRing, { borderColor: colors.success }, ringStyle]}
            />
            <Svg width={DIAL} height={DIAL} style={StyleSheet.absoluteFill}>
              <Circle cx={DIAL_C} cy={DIAL_C} r={KNOB_C + 3} fill={colors.surfaceAlt} />
              {DIAL_TICKS.map((t, i) => {
                // After a wrong answer the right one is marked on the scale.
                const answer = verdict === 'wrong' && i === DIAL_ANSWER;
                const lit = i <= step;
                return (
                  <Line
                    key={i}
                    x1={t.from.x}
                    y1={t.from.y}
                    x2={t.to.x}
                    y2={t.to.y}
                    stroke={answer ? colors.success : lit ? tone : colors.borderStrong}
                    strokeWidth={answer || lit ? 3.5 : 2}
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>
            <Text style={[styles.dialEnd, { left: DIAL_LOW.x - 24, top: DIAL_LOW.y + 5 }]}>$0</Text>
            <Text style={[styles.dialEnd, { left: DIAL_HIGH.x - 24, top: DIAL_HIGH.y + 5 }]}>
              $200
            </Text>
            <Animated.View pointerEvents="none" style={[styles.knob, knobStyle]}>
              <Svg width={KNOB} height={KNOB}>
                <Circle
                  cx={KNOB_C}
                  cy={KNOB_C}
                  r={KNOB_C - 1}
                  fill={colors.surface}
                  stroke={colors.borderStrong}
                  strokeWidth={1.5}
                />
                {GRIP.map((g, i) => (
                  <Line
                    key={i}
                    x1={g.from.x}
                    y1={g.from.y}
                    x2={g.to.x}
                    y2={g.to.y}
                    stroke={colors.borderStrong}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                ))}
                <Circle cx={KNOB_C} cy={KNOB_C} r={45} fill={colors.surfaceAlt} />
                <Line
                  x1={KNOB_C}
                  y1={4}
                  x2={KNOB_C}
                  y2={13}
                  stroke={tone}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />
              </Svg>
            </Animated.View>
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
              <Animated.Text
                style={[styles.dialValue, { color: verdict ? tone : colors.text }, popStyle]}
              >
                {`$${value}`}
              </Animated.Text>
            </View>
          </Animated.View>
        </GestureDetector>
        <StepKey label="+" name="More" disabled={locked} onPress={() => nudge(1)} />
      </View>
      {/* The verdict takes the key's place, so nothing below the dial moves. */}
      {verdict ? (
        <Animated.View style={[styles.verdict, { borderColor: tone }, verdictStyle]}>
          <View
            style={[
              styles.verdictWash,
              { backgroundColor: verdict === 'correct' ? colors.successTint : colors.downTint },
            ]}
          >
            <Text style={[styles.verdictText, { color: tone }]}>
              {verdict === 'correct'
                ? 'Right: 1 % of $5,000 is $50.'
                : 'Not quite: 1 % of $5,000 is $50.'}
            </Text>
          </View>
        </Animated.View>
      ) : (
        <KeyRow>
          <DemoKey label="Check" tone="accent" onPress={check} />
        </KeyRow>
      )}
    </View>
  );
}

/** A round key beside the dial that turns it one step. */
function StepKey({
  label,
  name,
  disabled,
  onPress,
}: {
  label: string;
  name: string;
  disabled: boolean;
  onPress: () => void;
}) {
  // No cue of its own: the step it turns clicks.
  const press = usePressFeedback(!disabled, { cue: null });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={[styles.stepKey, disabled && styles.off]}
      >
        <Text style={styles.stepKeyText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// A heart that breaks
// ---------------------------------------------------------------------------

const HEARTS = 5;
const HEART_W = 136;
/** The big heart's box is 100 × 92; the two halves meet along the crack. */
const HEART_H = HEART_W * 0.92;
const HEART_D =
  'M50 88C20 66 4 50 4 30C4 14 16 4 29 4C39 4 46 10 50 18C54 10 61 4 71 4C84 4 96 14 96 30C96 50 80 66 50 88Z';
const HEART_LEFT =
  'M50 18C46 10 39 4 29 4C16 4 4 14 4 30C4 50 20 66 50 88L47 76L54 65L45 54L55 42L44 31Z';
const HEART_RIGHT =
  'M50 18L44 31L55 42L45 54L54 65L47 76L50 88C80 66 96 50 96 30C96 14 84 4 71 4C61 4 54 10 50 18Z';
const CRACK_D = 'M50 18L44 31L55 42L45 54L54 65L47 76L50 88';
const CRACK_LEN = 86;
/** The light on the left lobe. */
const SHINE_D = 'M14 27C14 18 20 12 28 11';
/** The row's hearts, as the top bar draws them. */
const ROW_HEART_D =
  'M12 20.5s-8.5-5.2-8.5-11.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.7c0 6-8.5 11.2-8.5 11.2z';

type Shard = { x: number; y: number; dx: number; up: number; spin: number };

/** Chips off the crack: where each starts in the heart's box, and how it flies. */
const SHARDS: Shard[] = [
  { x: 50, y: 20, dx: 10, up: 38, spin: -260 },
  { x: 44, y: 31, dx: -36, up: 26, spin: -200 },
  { x: 55, y: 42, dx: 32, up: 32, spin: 240 },
  { x: 45, y: 54, dx: -28, up: 18, spin: 180 },
  { x: 54, y: 65, dx: 38, up: 12, spin: -220 },
  { x: 47, y: 76, dx: -20, up: 8, spin: 160 },
];

/**
 * Hearts at the top, a big one in the middle. "Wrong answer" cracks the big
 * heart along a jagged line, the halves part like a hinge at the tip and fall
 * away while chips fly off the crack, and the row loses a heart with a shake.
 * A new heart pops in for the next one, until none are left.
 */
function HeartCrack() {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const [lost, setLost] = useState(0);
  const [out, setOut] = useState(false);
  const crack = useSharedValue(0);
  const split = useSharedValue(0);
  const fall = useSharedValue(0);
  const back = useSharedValue(1);
  const flinch = useSharedValue(1);
  const shake = useSharedValue(0);
  const outIn = useSharedValue(0);
  const hearts = HEARTS - lost;
  // Read here, in render: the styles below are worklets.
  const down = colors.down;

  const wrong = () => {
    if (lost >= HEARTS) return;
    revealFeedback('wrong');
    emitMood('wrong');
    setLost((n) => n + 1);
  };

  useEffect(() => {
    if (lost === 0) return;
    const last = lost >= HEARTS;
    if (reduced) {
      // The cracked heart, still, for a moment; then whole again, or none left.
      crack.set(1);
      const timer = setTimeout(() => {
        crack.set(0);
        if (last) {
          outIn.set(1);
          setOut(true);
          fizzleFeedback();
        }
      }, 700);
      return () => clearTimeout(timer);
    }
    shake.set(
      withSequence(
        withTiming(-6, { duration: 45 }),
        withTiming(6, { duration: 70 }),
        withTiming(-4, { duration: 70 }),
        withTiming(3, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      ),
    );
    crack.set(0);
    split.set(0);
    fall.set(0);
    back.set(1);
    flinch.set(
      withSequence(
        withTiming(0.88, { duration: 70, easing: EASE_OUT }),
        withTiming(1, { duration: 120, easing: EASE_OUT }),
      ),
    );
    crack.set(withDelay(110, withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) })));
    split.set(withDelay(270, withTiming(1, { duration: 260, easing: EASE_OUT })));
    fall.set(withDelay(400, withTiming(1, { duration: 780, easing: Easing.in(Easing.quad) })));
    const timer = setTimeout(() => {
      crack.set(0);
      split.set(0);
      fall.set(0);
      if (last) {
        outIn.set(withTiming(1, { duration: 420, easing: EASE_OUT }));
        setOut(true);
        fizzleFeedback();
      } else {
        back.set(0);
        back.set(withSpring(1, SPRING_POP));
      }
    }, 1250);
    return () => clearTimeout(timer);
  }, [lost, reduced, crack, split, fall, back, flinch, shake, outIn]);

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));
  const wholeStyle = useAnimatedStyle(() => ({
    opacity: split.get() > 0.001 ? 0 : Math.min(1, back.get()),
    transform: [{ scale: flinch.get() * (0.4 + 0.6 * back.get()) }],
  }));
  // The halves hinge at the tip, part, and fall away as they fade.
  const leftStyle = useAnimatedStyle(() => {
    const s = split.get();
    const f = fall.get();
    return {
      opacity: s > 0.001 ? 1 - f : 0,
      transform: [
        { translateX: -10 * s - 26 * f },
        { translateY: 3 * s + 230 * f },
        { rotate: `${-13 * s - 34 * f}deg` },
      ],
    };
  });
  const rightStyle = useAnimatedStyle(() => {
    const s = split.get();
    const f = fall.get();
    return {
      opacity: s > 0.001 ? 1 - f : 0,
      transform: [
        { translateX: 10 * s + 30 * f },
        { translateY: 3 * s + 240 * f },
        { rotate: `${13 * s + 38 * f}deg` },
      ],
    };
  });
  const crackProps = useAnimatedProps(() => ({
    strokeDashoffset: reduced ? 0 : CRACK_LEN * (1 - crack.get()),
    strokeOpacity: crack.get() > 0 ? 1 : 0,
  }));
  const outStyle = useAnimatedStyle(() => ({
    opacity: outIn.get(),
    transform: [{ translateY: 10 * (1 - outIn.get()) }],
  }));

  return (
    <View style={styles.column}>
      <Animated.View
        style={[styles.heartRow, rowStyle]}
        accessibilityRole="text"
        accessibilityLabel={`${hearts} of ${HEARTS} hearts`}
        accessibilityLiveRegion="polite"
      >
        {Array.from({ length: HEARTS }, (_, i) => (
          <RowHeart key={i} full={i < hearts} />
        ))}
      </Animated.View>
      <View style={styles.heartStage}>
        {out ? (
          <Animated.View style={[styles.outBox, outStyle]}>
            <Svg width={72} height={66} viewBox="0 0 100 92">
              <Path
                d={HEART_D}
                fill="none"
                stroke={colors.textFaint}
                strokeWidth={5}
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.outTitle}>Out of hearts</Text>
            <Text style={styles.muted}>The next one is back in 4 hours.</Text>
          </Animated.View>
        ) : (
          <View style={styles.heartBox} pointerEvents="none">
            {SHARDS.map((s, i) => (
              <ShardChip key={i} shard={s} split={split} fall={fall} color={down} />
            ))}
            <Animated.View style={[StyleSheet.absoluteFill, styles.half, leftStyle]}>
              <Svg width={HEART_W} height={HEART_H} viewBox="0 0 100 92">
                <Path d={HEART_LEFT} fill={down} />
                <Shine />
              </Svg>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.half, rightStyle]}>
              <Svg width={HEART_W} height={HEART_H} viewBox="0 0 100 92">
                <Path d={HEART_RIGHT} fill={down} />
              </Svg>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, wholeStyle]}>
              <Svg width={HEART_W} height={HEART_H} viewBox="0 0 100 92">
                <Path d={HEART_D} fill={down} />
                <Shine />
                <AnimatedPath
                  d={CRACK_D}
                  animatedProps={crackProps}
                  stroke={spec.ground.color}
                  strokeWidth={3.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={[CRACK_LEN, CRACK_LEN]}
                  strokeDashoffset={CRACK_LEN}
                  strokeOpacity={0}
                  fill="none"
                />
              </Svg>
            </Animated.View>
          </View>
        )}
      </View>
      <KeyRow>
        <DemoKey label="Wrong answer" tone="wrong" disabled={lost >= HEARTS} onPress={wrong} />
      </KeyRow>
    </View>
  );
}

function Shine() {
  return (
    <Path
      d={SHINE_D}
      stroke="#FFFFFF"
      strokeOpacity={0.32}
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
    />
  );
}

/** One heart in the row: it jumps as it is lost and stays an empty outline. */
function RowHeart({ full }: { full: boolean }) {
  const reduced = useReduceMotion();
  const pop = useSharedValue(1);
  useEffect(() => {
    if (full || reduced) return;
    pop.set(
      withSequence(withTiming(1.4, { duration: 90, easing: EASE_OUT }), withSpring(1, SPRING_POP)),
    );
  }, [full, reduced, pop]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  return (
    <Animated.View style={style}>
      <Svg width={26} height={26} viewBox="0 0 24 24">
        <Path
          d={ROW_HEART_D}
          fill={full ? colors.down : 'none'}
          stroke={full ? colors.down : colors.textFaint}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}

/** A chip off the crack: out and up as the halves part, then down with them. */
function ShardChip({
  shard,
  split,
  fall,
  color,
}: {
  shard: Shard;
  split: SharedValue<number>;
  fall: SharedValue<number>;
  color: string;
}) {
  const { dx, up, spin } = shard;
  const style = useAnimatedStyle(() => {
    const s = split.get();
    const f = fall.get();
    return {
      opacity: s > 0.001 ? 1 - f : 0,
      transform: [
        { translateX: dx * (s + 0.6 * f) },
        { translateY: -up * s + 170 * f },
        { rotate: `${45 + spin * (s + f)}deg` },
        { scale: 1 - 0.5 * f },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.shard,
        { left: (shard.x * HEART_W) / 100 - 3.5, top: (shard.y * HEART_W) / 100 - 3.5 },
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// A combo counter
// ---------------------------------------------------------------------------

const COMBO_STEPS = 12;
const COMBO_SLOT_W = 56;
const COMBO_SLOT_H = 32;
/** The burst's sparks, round the badge. */
const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4 + Math.PI / 8);
/** Where the badge's three colours sit on its warmth, 0 at ×3 to 1 at ×6. */
const RAMP_AT = [0, 0.5, 1];

/**
 * A lesson's top bar with Right and Wrong for answers. From the third right
 * answer in a row a "×3" punches in beside the bar with a ring and a burst of
 * sparks; every right answer after bumps it harder and warmer, and a wrong
 * one drops it.
 */
function Combo() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const run = runBefore(grades, grades.length);
  // The run a wrong answer just ended, so the badge can fall with its number on.
  const before = runBefore(grades, grades.length - 1);
  const broke = grades[grades.length - 1] === 'wrong' && before >= STREAK_FROM;
  const full = grades.length >= COMBO_STEPS;

  const answer = (g: Grade) => {
    const next = g === 'correct' ? run + 1 : 0;
    revealFeedback(g, next);
    emitMood(g === 'correct' ? (next >= STREAK_FROM ? 'streak' : 'correct') : 'wrong', next);
    setGrades((all) => [...all, g]);
  };

  return (
    <View style={[styles.column, styles.comboColumn]}>
      <View style={styles.topBar}>
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Path
            d="M3.5 3.5l11 11M14.5 3.5l-11 11"
            stroke={colors.textMuted}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </Svg>
        {/* Not warmed to gold at three, as the bar is in a lesson: the badge
            carries the heat here, and a gold bar beside a blue ×3 would clash. */}
        <ProgressBar progress={grades.length / COMBO_STEPS} steps={COMBO_STEPS} />
        <View style={styles.comboSlot}>
          <ComboBadge run={run} shown={broke ? before : run} broke={broke} />
        </View>
        <View style={styles.hearts} accessibilityLabel="5 hearts">
          <Icon name="heart" size={18} color={colors.down} />
          <Text style={styles.heartCount}>5</Text>
        </View>
      </View>
      <View style={styles.middle}>
        <Text style={styles.runBig}>{run}</Text>
        <Text style={styles.muted}>in a row</Text>
      </View>
      <KeyRow>
        <DemoKey label="Wrong" tone="wrong" disabled={full} onPress={() => answer('wrong')} />
        <DemoKey label="Right" tone="right" disabled={full} onPress={() => answer('correct')} />
      </KeyRow>
    </View>
  );
}

/** The badge itself: it comes, grows and goes with the run. */
function ComboBadge({ run, shown, broke }: { run: number; shown: number; broke: boolean }) {
  const reduced = useReduceMotion();
  const show = useSharedValue(0);
  const scale = useSharedValue(1);
  const tilt = useSharedValue(0);
  const drop = useSharedValue(0);
  const warm = useSharedValue(0);
  const ring = useSharedValue(0);
  const burst = useSharedValue(0);
  // Read here, in render: the styles below are worklets. The badge warms from
  // the accent to amber by way of the down colour's coral: a straight blend of
  // blue and amber goes grey on the way.
  const ramp = [colors.accent, colors.down, colors.warning];

  useEffect(() => {
    if (run < STREAK_FROM) {
      if (broke && !reduced) {
        // Broken: it tips over and drops away, quietly (docs/ui/01-design-principles.md §1.6).
        drop.set(0);
        drop.set(withTiming(1, { duration: 560, easing: Easing.in(Easing.quad) }));
      } else if (broke) {
        show.set(withTiming(0, { duration: 140 }));
      } else {
        show.set(0);
        drop.set(0);
      }
      return;
    }
    // From ×3 to ×6 it warms from the accent to amber.
    const heat = Math.min(1, (run - STREAK_FROM) / 3);
    if (reduced) {
      drop.set(0);
      scale.set(1);
      tilt.set(0);
      show.set(1);
      warm.set(heat);
      return;
    }
    const flare = () => {
      ring.set(0);
      ring.set(withTiming(1, { duration: 520, easing: EASE_OUT }));
      burst.set(0);
      burst.set(withTiming(1, { duration: 480, easing: EASE_OUT }));
    };
    if (run === STREAK_FROM) {
      // In: from big and tilted, onto its place with a spring.
      drop.set(0);
      warm.set(0);
      show.set(0);
      show.set(withTiming(1, { duration: 90 }));
      scale.set(1.8);
      scale.set(withSpring(1, { duration: 560, dampingRatio: 0.5 }));
      tilt.set(-16);
      tilt.set(withSpring(0, { duration: 560, dampingRatio: 0.5 }));
      flare();
      return;
    }
    // Each one after: a harder punch, the other way each time.
    const punch = Math.min(1.7, 1.2 + 0.1 * (run - STREAK_FROM));
    const side = run % 2 === 0 ? 1 : -1;
    warm.set(withTiming(heat, { duration: 320, easing: EASE_OUT }));
    scale.set(
      withSequence(
        withTiming(punch, { duration: 90, easing: EASE_OUT }),
        withSpring(1, { duration: 520, dampingRatio: 0.45 }),
      ),
    );
    tilt.set(
      withSequence(
        withTiming(side * Math.min(14, 5 + run), { duration: 90, easing: EASE_OUT }),
        withSpring(0, { duration: 520, dampingRatio: 0.5 }),
      ),
    );
    flare();
  }, [run, broke, reduced, show, scale, tilt, drop, warm, ring, burst]);

  const badge = useAnimatedStyle(() => {
    const d = drop.get();
    return {
      opacity: show.get() * (1 - d),
      borderColor: interpolateColor(warm.get(), RAMP_AT, ramp),
      transform: [
        { translateY: 30 * d },
        { rotate: `${tilt.get() + 28 * d}deg` },
        { scale: scale.get() * (1 - 0.2 * d) },
      ],
    };
  });
  const ink = useAnimatedStyle(() => ({
    color: interpolateColor(warm.get(), RAMP_AT, ramp),
  }));
  const ringStyle = useAnimatedStyle(() => {
    const r = ring.get();
    return {
      opacity: r > 0 && r < 1 ? 0.85 * (1 - r) : 0,
      borderColor: interpolateColor(warm.get(), RAMP_AT, ramp),
      transform: [{ scale: 0.5 + 1.5 * r }],
    };
  });
  // The longer the run, the further the sparks fly.
  const reach = 24 + 4 * Math.min(4, Math.max(0, run - STREAK_FROM));

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.comboRing, ringStyle]} />
      {SPARKS.map((angle, i) => (
        <Spark key={i} angle={angle} reach={reach} burst={burst} warm={warm} ramp={ramp} />
      ))}
      <Animated.View
        style={[styles.combo, badge]}
        accessibilityLabel={`Combo ${shown}`}
        accessibilityElementsHidden={run < STREAK_FROM}
        importantForAccessibility={run < STREAK_FROM ? 'no-hide-descendants' : 'auto'}
      >
        <Animated.Text style={[styles.comboText, ink]}>{`×${shown}`}</Animated.Text>
      </Animated.View>
    </>
  );
}

function Spark({
  angle,
  reach,
  burst,
  warm,
  ramp,
}: {
  angle: number;
  reach: number;
  burst: SharedValue<number>;
  warm: SharedValue<number>;
  ramp: string[];
}) {
  const style = useAnimatedStyle(() => {
    const b = burst.get();
    const d = 10 + reach * b;
    return {
      opacity: b > 0 && b < 1 ? 1 - b : 0,
      backgroundColor: interpolateColor(warm.get(), RAMP_AT, ramp),
      transform: [
        { translateX: Math.cos(angle) * d },
        { translateY: Math.sin(angle) * d },
        { rotate: `${angle + Math.PI / 2}rad` },
        { scaleY: 1 - 0.6 * b },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.spark, style]} />;
}

// ---------------------------------------------------------------------------
// Your practice as a heat map
// ---------------------------------------------------------------------------

const WEEKS = 18;
const HEAT_GAP = 3;
/** Room round the grid for today's ring. */
const HEAT_PAD = 2;
const DAY_W = 32;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Mon', '', 'Wed', '', 'Fri', '', ''];

/** A small seeded generator, so the made-up days are the same every time. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lessons a day over the last WEEKS weeks, oldest first, 0 to 4: a learner who
 * started slowly and found a rhythm. Days come in runs, more of them as the
 * weeks go on, and the last six are a streak up to today.
 */
const PRACTICE: number[] = (() => {
  const draw = seeded(21);
  const n = WEEKS * 7;
  const days: number[] = [];
  let on = false;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    on = i >= n - 6 || draw() < (on ? 0.62 + 0.2 * p : 0.06 + 0.3 * p);
    days.push(on ? Math.min(4, 1 + Math.floor(draw() * (1.6 + 3 * p))) : 0);
  }
  return days;
})();

/** `a` laid over `b` at `t` (0..1), both `#rrggbb`. */
function blend(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1, 7), 16);
  const y = parseInt(b.slice(1, 7), 16);
  const ch = (shift: number) =>
    Math.round(((x >> shift) & 255) * t + ((y >> shift) & 255) * (1 - t));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

/**
 * Eighteen weeks of practice on one screen: a square a day, Monday to Sunday
 * down each column, darker the more lessons that day, today ringed. The days
 * are made up but the same every time.
 */
function Heatmap() {
  const [width, setWidth] = useState(288);
  const [today] = useState(() => new Date());
  // The last column runs up to today.
  const weekday = (today.getDay() + 6) % 7;
  const shown = (WEEKS - 1) * 7 + weekday + 1;
  const days = PRACTICE.slice(PRACTICE.length - shown);
  let learned = 0;
  let longest = 0;
  let streak = 0;
  for (const d of days) {
    streak = d > 0 ? streak + 1 : 0;
    learned += d > 0 ? 1 : 0;
    longest = Math.max(longest, streak);
  }

  const cell = Math.max(
    9,
    Math.min(16, Math.floor((width - DAY_W - HEAT_PAD * 2 - (WEEKS - 1) * HEAT_GAP) / WEEKS)),
  );
  const pitch = cell + HEAT_GAP;
  const gridW = WEEKS * pitch - HEAT_GAP + HEAT_PAD * 2;
  const gridH = 7 * pitch - HEAT_GAP + HEAT_PAD * 2;
  const base = colors.surfaceAlt;
  const shades = [
    base,
    blend(colors.success, base, 0.3),
    blend(colors.success, base, 0.52),
    blend(colors.success, base, 0.76),
    colors.success,
  ];

  // A month's name over the first week that starts in it.
  const first = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (shown - 1));
  const months: { col: number; name: string }[] = [];
  let month = -1;
  for (let col = 0; col < WEEKS; col++) {
    const m = new Date(first.getFullYear(), first.getMonth(), first.getDate() + col * 7).getMonth();
    if (m !== month) months.push({ col, name: MONTHS[m] });
    month = m;
  }
  // The first column's month gives way when the next one would touch it.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();
  const last = shown - 1;

  return (
    <View style={styles.heat} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={[styles.heatBlock, { width: DAY_W + gridW }]}>
        <View style={styles.stats}>
          <View>
            <Text style={styles.statNum}>{learned}</Text>
            <Text style={styles.muted}>days learned</Text>
          </View>
          <View>
            <Text style={[styles.statNum, { color: colors.success }]}>{longest}</Text>
            <Text style={styles.muted}>longest streak</Text>
          </View>
        </View>
        <View>
          <View style={[styles.monthRow, { marginLeft: DAY_W + HEAT_PAD }]}>
            {months.map((m) => (
              <Text key={m.col} style={[styles.heatLabel, styles.month, { left: m.col * pitch }]}>
                {m.name}
              </Text>
            ))}
          </View>
          <View style={styles.heatRow}>
            <View style={{ width: DAY_W, height: gridH }}>
              {DAY_NAMES.map((name, row) =>
                name ? (
                  <Text
                    key={row}
                    style={[
                      styles.heatLabel,
                      styles.dayName,
                      { top: HEAT_PAD + row * pitch + cell / 2 - 9 },
                    ]}
                  >
                    {name}
                  </Text>
                ) : null,
              )}
            </View>
            <View
              accessible
              accessibilityRole="image"
              accessibilityLabel={`${learned} days learned in ${WEEKS} weeks, longest streak ${longest} days`}
            >
              <Svg width={gridW} height={gridH}>
                {days.map((d, i) => (
                  <Rect
                    key={i}
                    x={HEAT_PAD + Math.floor(i / 7) * pitch}
                    y={HEAT_PAD + (i % 7) * pitch}
                    width={cell}
                    height={cell}
                    rx={2.5}
                    fill={shades[d]}
                  />
                ))}
                <Rect
                  x={HEAT_PAD + Math.floor(last / 7) * pitch - 2}
                  y={HEAT_PAD + (last % 7) * pitch - 2}
                  width={cell + 4}
                  height={cell + 4}
                  rx={4}
                  fill="none"
                  stroke={colors.text}
                  strokeWidth={1.5}
                />
              </Svg>
            </View>
          </View>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendPart}>
            <Text style={styles.heatLabel}>Less</Text>
            {shades.map((shade, i) => (
              <View key={i} style={[styles.swatch, { backgroundColor: shade }]} />
            ))}
            <Text style={styles.heatLabel}>More</Text>
          </View>
          <View style={styles.legendPart}>
            <View style={[styles.swatch, styles.swatchToday]} />
            <Text style={styles.heatLabel}>Today</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

const styles = themed(() => ({
  column: { alignSelf: 'stretch', gap: space.xl },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { ...type.small, color: colors.textMuted },
  off: { opacity: 0.5 },

  // A progress bar that sloshes
  tubeWrap: { alignSelf: 'center', width: TUBE_W, paddingTop: DROP_FALL },
  drop: { position: 'absolute', top: DROP_FALL, width: DROP, height: DROP },
  tubeCount: { flexDirection: 'row', alignItems: 'baseline', alignSelf: 'center' },
  tubeNow: {
    ...type.display,
    fontSize: 44,
    lineHeight: 52,
    fontFamily: MONO_FONT,
    color: colors.text,
  },
  tubeOf: { ...type.title, fontFamily: MONO_FONT, color: colors.textMuted },

  // Numbers on a dial
  dialColumn: { gap: space.lg },
  prompt: { ...type.prompt, color: colors.text },
  dialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  dial: { width: DIAL, height: DIAL },
  dialRing: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: DIAL - 8,
    height: DIAL - 8,
    borderRadius: (DIAL - 8) / 2,
    borderWidth: 3,
  },
  dialEnd: {
    ...type.small,
    position: 'absolute',
    width: 48,
    textAlign: 'center',
    fontFamily: MONO_FONT,
    color: colors.textMuted,
  },
  knob: {
    position: 'absolute',
    left: (DIAL - KNOB) / 2,
    top: (DIAL - KNOB) / 2,
    width: KNOB,
    height: KNOB,
  },
  dialValue: { ...type.display, fontFamily: MONO_FONT },
  stepKey: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepKeyText: { ...type.title, color: colors.text },
  verdict: {
    alignSelf: 'stretch',
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  verdictWash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  verdictText: { ...type.label, textAlign: 'center' },

  // A heart that breaks
  heartRow: { flexDirection: 'row', alignSelf: 'center', gap: space.sm },
  heartStage: { height: 184, alignItems: 'center', justifyContent: 'center' },
  heartBox: { width: HEART_W, height: HEART_H },
  half: { transformOrigin: '50% 96%' },
  shard: { position: 'absolute', width: 7, height: 7, borderRadius: 1.5 },
  outBox: { alignItems: 'center', gap: space.sm },
  outTitle: { ...type.title, color: colors.text },

  // A combo counter
  comboColumn: { gap: space.xxl + space.md },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.md, alignSelf: 'stretch' },
  comboSlot: {
    width: COMBO_SLOT_W,
    height: COMBO_SLOT_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  combo: {
    minWidth: 44,
    height: 30,
    paddingHorizontal: space.sm,
    borderRadius: 15,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboText: { fontFamily: MONO_FONT, fontSize: 17, lineHeight: 22, fontWeight: '800' },
  comboRing: {
    position: 'absolute',
    left: (COMBO_SLOT_W - 44) / 2,
    top: (COMBO_SLOT_H - 44) / 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  spark: {
    position: 'absolute',
    left: COMBO_SLOT_W / 2 - 1.5,
    top: COMBO_SLOT_H / 2 - 4.5,
    width: 3,
    height: 9,
    borderRadius: 1.5,
  },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartCount: { ...type.label, fontFamily: MONO_FONT, fontWeight: '800', color: colors.down },
  middle: { alignItems: 'center', gap: 2 },
  runBig: {
    ...type.display,
    fontSize: 44,
    lineHeight: 52,
    fontFamily: MONO_FONT,
    color: colors.text,
  },

  // Your practice as a heat map
  heat: { alignSelf: 'stretch', alignItems: 'center' },
  heatBlock: { gap: space.lg },
  stats: { flexDirection: 'row', gap: space.xxl },
  statNum: { ...type.display, fontFamily: MONO_FONT, color: colors.text },
  monthRow: { height: 20 },
  month: { position: 'absolute', top: 0 },
  heatRow: { flexDirection: 'row' },
  heatLabel: { ...type.small, color: colors.textMuted },
  dayName: { position: 'absolute', left: 0 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendPart: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swatch: { width: 11, height: 11, borderRadius: 2.5 },
  swatchToday: { borderWidth: 1.5, borderColor: colors.text, marginRight: 2 },
}));
