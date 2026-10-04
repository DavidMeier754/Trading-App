import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, MONO_FONT } from '../theme';
import { STREAK_FROM } from './feedback';
import { EASE_OUT } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** The slot in the top bar the counter lives in; the ring and sparks reach past it. */
export const COMBO_SLOT_W = 46;
const SLOT_H = 32;
const BADGE_W = 42;
const RING = 40;
/** The burst's sparks, round the badge. */
const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4 + Math.PI / 8);
/** Where the badge's three colours sit on its warmth, 0 at ×3 to 1 at ×6. */
const RAMP_AT = [0, 0.5, 1];

/**
 * docs/ui/02-lesson-player-layout.md §2 [DESIGN-REVIEW] "A combo counter" (David's pick of
 * 2026-10-04; it replaces the run's flame, StreakMeter): from the third right
 * answer in a row a "×3" punches in beside the progress bar with a ring and a
 * burst of sparks; every right answer after bumps it harder, the other way
 * each time, and warmer, from the accent through coral to amber at ×6. A wrong
 * answer tips it over and it drops away, quietly: no count-down, no message
 * (docs/ui/01-design-principles.md §1.6).
 *
 * It answers the learner's own answer, so it moves only when they do (§1).
 * Under reduced motion it simply shows the count in its colour.
 */
export default function ComboMeter({ run }: { run: number }) {
  const reduced = useReduceMotion();
  const last = useRef(run);
  // The number on the badge: the run while it lasts, and after a wrong answer
  // the run it ended, so the badge falls with its number on.
  const [shown, setShown] = useState(run);
  if (run >= STREAK_FROM && run !== shown) setShown(run);
  const show = useSharedValue(run >= STREAK_FROM ? 1 : 0);
  const scale = useSharedValue(1);
  const tilt = useSharedValue(0);
  const drop = useSharedValue(0);
  const warm = useSharedValue(Math.min(1, Math.max(0, (run - STREAK_FROM) / 3)));
  const ring = useSharedValue(0);
  const burst = useSharedValue(0);
  // Read here, in render: the styles below are worklets. The badge warms from
  // the accent to amber by way of the down colour's coral: a straight blend of
  // blue and amber goes grey on the way.
  const ramp = [colors.accent, colors.down, colors.warning];

  useEffect(() => {
    const before = last.current;
    last.current = run;
    if (run === before) return;
    if (run < STREAK_FROM) {
      if (before >= STREAK_FROM && !reduced) {
        // Broken: it tips over and drops away.
        drop.set(0);
        drop.set(withTiming(1, { duration: 560, easing: Easing.in(Easing.quad) }));
      } else {
        show.set(0);
        drop.set(0);
      }
      return;
    }
    const heat = Math.min(1, (run - STREAK_FROM) / 3);
    if (reduced || run < before) {
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
    if (before < STREAK_FROM) {
      // In: from big and tilted, onto its place with a spring.
      drop.set(0);
      warm.set(heat);
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
    const punch = Math.min(1.6, 1.2 + 0.1 * (run - STREAK_FROM));
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
  }, [run, reduced, show, scale, tilt, drop, warm, ring, burst]);

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
  const reach = 20 + 4 * Math.min(4, Math.max(0, run - STREAK_FROM));
  const on = run >= STREAK_FROM;

  return (
    <Animated.View
      style={styles.slot}
      accessible={on}
      accessibilityLabel={on ? `Combo: ${run} right in a row` : undefined}
      accessibilityElementsHidden={!on}
      importantForAccessibility={on ? 'auto' : 'no-hide-descendants'}
    >
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
      {SPARKS.map((angle, i) => (
        <Spark key={i} angle={angle} reach={reach} burst={burst} warm={warm} ramp={ramp} />
      ))}
      <Animated.View style={[styles.badge, { backgroundColor: colors.surface }, badge]}>
        <Animated.Text style={[styles.text, ink]} numberOfLines={1}>
          {`×${shown}`}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
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

const styles = StyleSheet.create({
  slot: {
    width: COMBO_SLOT_W,
    height: SLOT_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: BADGE_W,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: MONO_FONT, fontSize: 15, lineHeight: 20, fontWeight: '800' },
  ring: {
    position: 'absolute',
    left: (COMBO_SLOT_W - RING) / 2,
    top: (SLOT_H - RING) / 2,
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
  },
  spark: {
    position: 'absolute',
    left: COMBO_SLOT_W / 2 - 1.5,
    top: SLOT_H / 2 - 4.5,
    width: 3,
    height: 9,
    borderRadius: 1.5,
  },
});
