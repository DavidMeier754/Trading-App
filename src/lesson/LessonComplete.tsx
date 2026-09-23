import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';

import { colors, glass, radius, space, type } from '../theme';
import type { Screen } from '../types';
import type { Grade } from './answers';
import Confetti from './Confetti';
import { celebrateFeedback, coinFeedback, noteFeedback } from './feedback';
import { emitMood, useLook } from './look';
import { EASE_OUT, EASE_SINE, SPRING_POP, useMotion } from './motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING = 148;
const STROKE = 12;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/** The ring is heard as it fills: one rising note per eighth of a full circle. */
const RING_STEPS = 8;
/** Coins no closer together than this, however fast the number runs. */
const COIN_GAP_MS = 55;

/**
 * docs/UI.md §5.3 — sub-level complete. Rare tier, so this is where the delight
 * budget goes, and it is choreographed rather than thrown on screen at once:
 *
 *   1. The title arrives.
 *   2. The accuracy ring sweeps round, and every eighth of a circle it passes
 *      rings the next note up the scale, with a tick you feel -- the ring is a
 *      rising arpeggio you can watch.
 *   3. It closes on a chord and a heavy pulse, swells, throws two rings of
 *      light and a burst of confetti. A perfect run is gold and throws more.
 *   4. The XP counts up out of the ring, a coin a step.
 *   5. The breakdown settles in underneath, silently: the show is over.
 *
 * Every sound and haptic in it comes from the same cue table as the rest of the
 * app, so the arpeggio's notes are the replay's notes and the chord is in the
 * same key as every chime before it.
 */
export default function LessonComplete({
  grades,
  levelTitle,
  xp,
}: {
  screens: Screen[];
  grades: (Grade | null)[];
  levelTitle: string;
  xp: number;
}) {
  const m = useMotion();
  const { width } = useWindowDimensions();

  const answered = grades.filter((g) => g !== null && g !== undefined) as Grade[];
  const clean = answered.filter((g) => g === 'correct' || g === 'amber').length;
  const total = answered.length;
  const accuracy = total === 0 ? 1 : clean / total;
  const perfect = total > 0 && answered.every((g) => g === 'correct');

  const bonus = perfect ? Math.round(xp * 0.5) : 0;
  const earned = xp + bonus;
  const tone = perfect ? colors.warning : colors.success;

  const title = useSharedValue(m.reduced ? 1 : 0);
  const ring = useSharedValue(m.reduced ? 1 : 0);
  const swell = useSharedValue(1);
  const burst = useSharedValue(m.reduced ? 1 : 0);
  const count = useSharedValue(m.reduced ? 1 : 0);
  const rows = useSharedValue(m.reduced ? 1 : 0);
  const [shownXp, setShownXp] = useState(m.reduced ? earned : 0);
  const [landed, setLanded] = useState(m.reduced);
  const lastCoin = useRef(0);
  // Where the ring sits, so the confetti is thrown from it.
  // (Measured, not the window: on a wide screen the app is a phone-width column,
  // and a burst sized to the window would be thrown mostly off it.)
  const [wrap, setWrap] = useState({ w: 0, h: 0 });
  const [ringY, setRingY] = useState(0);

  const land = useCallback(() => {
    celebrateFeedback(perfect);
    emitMood('complete');
    setLanded(true);
  }, [perfect]);
  const neo = useLook() === 'neo';

  const onStep = useCallback((step: number) => noteFeedback(step), []);

  const onXp = useCallback((value: number) => {
    setShownXp(value);
    const now = Date.now();
    if (value > 0 && now - lastCoin.current >= COIN_GAP_MS) {
      lastCoin.current = now;
      coinFeedback();
    }
  }, []);

  useEffect(() => {
    if (m.reduced) {
      // Everything is already in place; the chord still says "done".
      celebrateFeedback(perfect);
      return;
    }
    title.set(withSpring(1, SPRING_POP));
    // A fuller ring takes longer to draw, so every step is heard at one pace.
    const fill = 500 + 1100 * accuracy;
    ring.set(
      withDelay(
        320,
        withTiming(1, { duration: fill, easing: EASE_SINE }, (finished) => {
          'worklet';
          if (!finished) return;
          scheduleOnRN(land);
          swell.set(withSequence(withTiming(1.09, { duration: 110, easing: EASE_OUT }), withSpring(1, SPRING_POP)));
          burst.set(withTiming(1, { duration: 1100, easing: EASE_OUT }));
          count.set(withDelay(260, withTiming(1, { duration: 1100, easing: EASE_OUT })));
          rows.set(withDelay(1100, withSpring(1, SPRING_POP)));
        })
      )
    );
  }, [m.reduced, perfect, accuracy, land, title, ring, swell, burst, count, rows]);

  // The arpeggio: the eighths of a full circle the arc has passed. A ring that
  // only reaches 60% plays the first five notes, and stops there.
  useAnimatedReaction(
    () => (m.reduced ? -1 : Math.floor(ring.get() * accuracy * RING_STEPS + 1e-6)),
    (step, previous) => {
      if (previous === null || step <= previous || step < 1 || step > RING_STEPS) return;
      scheduleOnRN(onStep, step - 1);
    },
    [m.reduced, accuracy, onStep]
  );

  // The number reads off its own curve and crosses to React only when the
  // displayed integer changes -- a few dozen times, never every frame.
  useAnimatedReaction(
    () => Math.round(earned * count.get()),
    (value, previous) => {
      if (value !== previous) scheduleOnRN(onXp, value);
    },
    [earned, onXp]
  );

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - accuracy * ring.get()),
  }));

  const travel = m.travel(18);
  const titleStyle = useRise(title, travel);
  const rowsStyle = useRise(rows, travel);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, title.get() * 1.5),
    transform: [{ scale: swell.get() * (0.9 + 0.1 * Math.min(1, title.get())) }],
  }));
  const xpStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, count.get() * 4),
    transform: [{ scale: 0.7 + 0.3 * Math.min(1, count.get() * 3) }],
  }));
  const halo1 = useHalo(burst, 0, tone);
  const halo2 = useHalo(burst, 0.18, tone);

  return (
    <View
      style={styles.wrap}
      onLayout={(e: LayoutChangeEvent) =>
        setWrap({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      {landed && !m.reduced ? (
        <Confetti
          width={wrap.w || width}
          height={wrap.h || 640}
          pieces={perfect ? 64 : 30}
          gold={perfect}
          originY={wrap.h && ringY ? ringY / wrap.h : 0.4}
        />
      ) : null}

      <Animated.View style={[styles.textBlock, titleStyle]}>
        <Text style={[styles.kicker, { color: tone }]}>
          {perfect ? 'Perfect run' : 'Lesson complete'}
        </Text>
        <Text style={styles.title}>{levelTitle}</Text>
      </Animated.View>

      <View
        style={styles.ringSlot}
        onLayout={(e: LayoutChangeEvent) => {
          const { y, height } = e.nativeEvent.layout;
          setRingY(y + height / 2);
        }}
      >
        <Animated.View pointerEvents="none" style={[styles.halo, halo1]} />
        <Animated.View pointerEvents="none" style={[styles.halo, halo2]} />
        <Animated.View style={[styles.ringWrap, ringStyle]}>
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
              stroke={tone}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={CIRC * (1 - accuracy * (m.reduced ? 1 : 0))}
              animatedProps={ringProps}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <Animated.View style={[styles.ringCenter, xpStyle]}>
            <Text style={styles.xp}>{`+${shownXp}`}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.rows, neo && glass, rowsStyle]}>
        <Row label="Lesson" value={`+${xp} XP`} />
        {bonus > 0 ? <Row label="Perfect bonus" value={`+${bonus} XP`} accent /> : null}
        <Row label="Answers" value={`${clean} of ${total}`} accent={accuracy === 1} />
      </Animated.View>
    </View>
  );
}

/** A block arriving: fades up from a little below. */
function useRise(v: SharedValue<number>, travel: number) {
  return useAnimatedStyle(() => ({
    opacity: Math.min(1, v.get()),
    transform: [{ translateY: (1 - v.get()) * travel }],
  }));
}

/** A ring of light leaving the closed ring; `lag` delays it along the same curve. */
function useHalo(v: SharedValue<number>, lag: number, color: string) {
  return useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (v.get() - lag) / (1 - lag)));
    return {
      borderColor: color,
      opacity: t <= 0 || t >= 1 ? 0 : 0.8 * (1 - t),
      transform: [{ scale: 1 + 0.55 * t }],
    };
  });
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: colors.warning }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl },
  textBlock: { alignItems: 'center', gap: space.xs },
  kicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1.6 },
  title: { ...type.title, color: colors.text, textAlign: 'center' },
  ringSlot: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 3,
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  xp: { ...type.display, fontSize: 36, lineHeight: 42, color: colors.text },
  xpLabel: { ...type.label, color: colors.textMuted, letterSpacing: 1.5 },
  rows: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  rowLabel: { ...type.answer, color: colors.textMuted },
  rowValue: { ...type.answer, color: colors.text },
});
