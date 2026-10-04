import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { detentFeedback, tapFeedback } from '../lesson/feedback';
import { useLookSpec } from '../lesson/look';
import { EASE_OUT, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, MONO_FONT, space, TAP_TARGET, themed, type } from '../theme';

/** The scale runs round 270 degrees, with the gap at the bottom. */
const FROM = -0.75 * Math.PI;
const TO = 0.75 * Math.PI;
/** The largest the dial is drawn; on a narrow screen it gives way to the − and + keys. */
const DIAL_MAX = 176;
/**
 * The drawing's own units: the dial is drawn on a 168 grid and scaled. Near
 * the middle a small move swings the angle right round, so a turn there is
 * not read.
 */
const GRID = 168;
const DEAD = 18;
const KNOB = 120;

/** A point at angle `a` (0 at the top, clockwise) and radius `r` from a middle at `c`. */
function polar(c: number, a: number, r: number) {
  return { x: c + r * Math.sin(a), y: c - r * Math.cos(a) };
}

/** An arc's path, from angle `a` to `b` at radius `r` round `c`. */
function arc(c: number, a: number, b: number, r: number): string {
  const p = polar(c, a, r);
  const q = polar(c, b, r);
  const large = b - a > Math.PI ? 1 : 0;
  return `M${p.x.toFixed(2)} ${p.y.toFixed(2)} A${r} ${r} 0 ${large} 1 ${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
}

/** The knob's grip: ridges round its rim, with room for the pointer at the top. */
const GRIP = Array.from({ length: 36 }, (_, i) => (i * 2 * Math.PI) / 36)
  .filter((a) => a > 0.3 && a < 2 * Math.PI - 0.3)
  .map((a) => ({ from: polar(KNOB / 2, a, 50), to: polar(KNOB / 2, a, 56) }));

/**
 * docs/UI.md §4.1 `slider` [DESIGN-REVIEW] "Numbers on a dial" (David's pick
 * of 2026-10-04): the value is set on a dial in place of a track. Twist it
 * anywhere: it turns by as much as the finger goes round its middle, clicks at
 * every step, stops at the ends of the scale and settles into the nearest step
 * when let go. The − and + keys beside it turn it a step at a time (§10: every
 * drag has a tap alternative), and so do a screen reader's swipes. The value
 * sits in the knob's middle; after the check the intended band lights on the
 * scale and the pointer takes the verdict's colour.
 */
export default function Dial({
  steps,
  step,
  onStep,
  text,
  low,
  high,
  band,
  verdict,
  width,
}: {
  /** How many steps the scale has, end to end. */
  steps: number;
  /** The step the dial is on. */
  step: number;
  /** A new step, from a turn or a key; the dial has already clicked. */
  onStep: (step: number) => void;
  /** The value, as it is read. */
  text: string;
  low: string;
  high: string;
  /** The intended band, in steps, once checked. */
  band: [number, number] | null;
  /** Once checked: whether the value was in the band. */
  verdict: 'correct' | 'wrong' | null;
  width: number;
}) {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const locked = verdict !== null;
  const size = Math.max(132, Math.min(DIAL_MAX, width - 2 * (TAP_TARGET + space.md)));
  const k = size / GRID;
  const c = size / 2;
  const notch = (TO - FROM) / Math.max(1, steps);
  const angleOf = useCallback((s: number) => FROM + s * notch, [notch]);

  const hit = useAnimatedRef<View>();
  const turn = useSharedValue(angleOf(step));
  const grab = useSharedValue(0);
  const landed = useSharedValue(step);
  const dragging = useSharedValue(0);
  const knock = useSharedValue(0);

  // A step set from outside -- a key, the first render, a reset -- turns the
  // knob there; a step the finger is turning to is already under it.
  useEffect(() => {
    landed.set(step);
    if (dragging.get()) return;
    const to = angleOf(step);
    turn.set(reduced ? to : withSpring(to, { duration: 320, dampingRatio: 0.62 }));
  }, [step, angleOf, reduced, landed, dragging, turn]);

  const nudge = (delta: number) => {
    if (locked) return;
    const s = Math.max(0, Math.min(steps, step + delta));
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
    detentFeedback();
    onStep(s);
  };

  const turned = useCallback(
    (s: number) => {
      detentFeedback();
      onStep(s);
    },
    [onStep],
  );

  // Both the touch and the box are where the dial is drawn, so a screen
  // scaled to fit (lesson/fit.tsx) needs no correction here: an angle is the
  // same at any scale.
  const pan = Gesture.Pan()
    .minDistance(0)
    .enabled(!locked)
    .onBegin((e) => {
      const box = measure(hit);
      if (!box || box.width <= 0) return;
      dragging.set(1);
      const cx = box.pageX + box.width / 2;
      const cy = box.pageY + box.height / 2;
      grab.set(Math.atan2(e.absoluteX - cx, cy - e.absoluteY));
    })
    .onUpdate((e) => {
      const box = measure(hit);
      if (!box || box.width <= 0) return;
      const cx = box.pageX + box.width / 2;
      const cy = box.pageY + box.height / 2;
      const dx = e.absoluteX - cx;
      const dy = cy - e.absoluteY;
      const a = Math.atan2(dx, dy);
      let d = a - grab.get();
      if (d > Math.PI) d -= 2 * Math.PI;
      else if (d < -Math.PI) d += 2 * Math.PI;
      grab.set(a);
      const dead = (DEAD / GRID) * box.width;
      if (dx * dx + dy * dy < dead * dead) return;
      const next = Math.min(TO, Math.max(FROM, turn.get() + d));
      turn.set(next);
      const s = Math.round((next - FROM) / notch);
      if (s !== landed.get()) {
        landed.set(s);
        scheduleOnRN(turned, s);
      }
    })
    .onFinalize(() => {
      dragging.set(0);
      const to = FROM + landed.get() * notch;
      turn.set(reduced ? to : withSpring(to, { duration: 260, dampingRatio: 0.8 }));
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.get() + knock.get()}rad` }],
  }));

  // A tick per step on a short scale; on a long one, one every few steps,
  // never more than 25 round the dial. Every fifth tick is longer.
  const ticks = useMemo(() => {
    let every = 1;
    while (steps / every > 30) every += 1;
    for (let e = every; e <= every * 2; e++) {
      if (steps % e === 0) {
        every = e;
        break;
      }
    }
    const at: number[] = [];
    for (let s = 0; s < steps; s += every) at.push(s);
    at.push(steps);
    const count = at.length - 1;
    return at.map((s, i) => {
      const a = FROM + s * notch;
      const major = count % 5 === 0 ? i % 5 === 0 : i === 0 || i === count;
      return {
        s,
        major,
        from: polar(c, a, (major ? 67 : 72) * k),
        to: polar(c, a, 80 * k),
      };
    });
  }, [steps, notch, c, k]);

  const tone =
    verdict === 'correct' ? colors.success : verdict === 'wrong' ? colors.down : spec.accent;
  const lowAt = polar(c, FROM, 80 * k);
  const highAt = polar(c, TO, 80 * k);
  const knobSize = KNOB * k;

  return (
    <View style={styles.row}>
      <StepKey label="−" name="Less" disabled={locked} onPress={() => nudge(-1)} />
      <GestureDetector gesture={pan}>
        <Animated.View
          ref={hit}
          collapsable={false}
          style={{ width: size, height: size }}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Dial"
          accessibilityValue={{ text }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        >
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            <Circle cx={c} cy={c} r={knobSize / 2 + 3 * k} fill={colors.surfaceAlt} />
            {band ? (
              <Path
                d={arc(c, angleOf(band[0]), angleOf(band[1]) + 1e-3, 74 * k)}
                stroke={colors.success}
                strokeOpacity={0.35}
                strokeWidth={16 * k}
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
            {ticks.map((t) => {
              const lit = t.s <= step;
              return (
                <Line
                  key={t.s}
                  x1={t.from.x}
                  y1={t.from.y}
                  x2={t.to.x}
                  y2={t.to.y}
                  stroke={lit ? tone : colors.borderStrong}
                  strokeWidth={lit ? 3.5 : 2}
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>
          <Text style={[styles.end, { left: lowAt.x - 32, top: lowAt.y + 4 }]} numberOfLines={1}>
            {low}
          </Text>
          <Text style={[styles.end, { left: highAt.x - 32, top: highAt.y + 4 }]} numberOfLines={1}>
            {high}
          </Text>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.knob,
              {
                left: c - knobSize / 2,
                top: c - knobSize / 2,
                width: knobSize,
                height: knobSize,
              },
              knobStyle,
            ]}
          >
            <Svg width={knobSize} height={knobSize} viewBox={`0 0 ${KNOB} ${KNOB}`}>
              <Circle
                cx={KNOB / 2}
                cy={KNOB / 2}
                r={KNOB / 2 - 1}
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
              <Circle cx={KNOB / 2} cy={KNOB / 2} r={45} fill={colors.surfaceAlt} />
              <Line
                x1={KNOB / 2}
                y1={4}
                x2={KNOB / 2}
                y2={13}
                stroke={tone}
                strokeWidth={4.5}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
            <Text
              style={[styles.value, { width: 84 * k, color: verdict ? tone : colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {text}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
      <StepKey label="+" name="More" disabled={locked} onPress={() => nudge(1)} />
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

const styles = themed(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  knob: { position: 'absolute' },
  value: {
    fontFamily: MONO_FONT,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  end: {
    ...type.small,
    position: 'absolute',
    width: 64,
    textAlign: 'center',
    color: colors.textFaint,
  },
  stepKey: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    borderRadius: TAP_TARGET / 2,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepKeyText: { ...type.title, color: colors.text },
  off: { opacity: 0.45 },
}));
