import React, { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
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

import { colors, space, themed, type } from '../../theme';
import { noteFeedback } from '../feedback';
import { EASE_OUT, EASE_SINE, SPRING_POP, useMotion } from '../motion';
import { headline, rowsOf, type WinData } from './data';
import { RowsCard, useCount, useRise } from './parts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const RING = 148;
const STROKE = 12;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/** The ring is heard as it fills: one rising note per eighth of a full circle. */
const RING_STEPS = 8;

/**
 * The accuracy ring (docs/UI.md §5.3), the lesson-complete design the app had
 * first, now one of the win screens that take turns:
 *
 *   1. The accuracy ring sweeps round, and every eighth of a circle it passes
 *      rings the next note up the scale, with a tick you feel -- the ring is a
 *      rising arpeggio you can watch.
 *   2. It closes on the landing (`onLand`: a chord and a heavy pulse), swells
 *      and throws two rings of light.
 *   3. The XP counts up out of the ring, a coin a step.
 *   4. The breakdown settles in underneath, silently: the show is over.
 */
export default function RingWin({ data, onLand }: { data: WinData; onLand: () => void }) {
  const m = useMotion();
  const tone = data.perfect ? colors.warning : colors.success;
  const head = headline(data);
  const ring = useSharedValue(m.reduced ? 1 : 0);
  const swell = useSharedValue(1);
  const burst = useSharedValue(m.reduced ? 1 : 0);
  const count = useSharedValue(m.reduced ? 1 : 0);
  const rows = useSharedValue(m.reduced ? 1 : 0);
  const shown = useCount(count, head.value, m.reduced ? head.value : 0, !data.practice);
  const accuracy = data.accuracy;

  const land = useCallback(() => onLand(), [onLand]);
  const onStep = useCallback((step: number) => noteFeedback(step), []);

  useEffect(() => {
    if (m.reduced) {
      land();
      return;
    }
    // A fuller ring takes longer to draw, so every step is heard at one pace.
    const fill = 500 + 1100 * accuracy;
    ring.set(
      withDelay(
        320,
        withTiming(1, { duration: fill, easing: EASE_SINE }, (finished) => {
          'worklet';
          if (!finished) return;
          scheduleOnRN(land);
          swell.set(
            withSequence(
              withTiming(1.09, { duration: 110, easing: EASE_OUT }),
              withSpring(1, SPRING_POP),
            ),
          );
          burst.set(withTiming(1, { duration: 1100, easing: EASE_OUT }));
          count.set(withDelay(260, withTiming(1, { duration: 1100, easing: EASE_OUT })));
          rows.set(withDelay(1100, withSpring(1, SPRING_POP)));
        }),
      ),
    );
  }, [m.reduced, accuracy, land, ring, swell, burst, count, rows]);

  // The arpeggio: the eighths of a full circle the arc has passed. A ring that
  // only reaches 60% plays the first five notes, and stops there.
  useAnimatedReaction(
    () => (m.reduced ? -1 : Math.floor(ring.get() * accuracy * RING_STEPS + 1e-6)),
    (step, previous) => {
      if (previous === null || step <= previous || step < 1 || step > RING_STEPS) return;
      scheduleOnRN(onStep, step - 1);
    },
    [m.reduced, accuracy, onStep],
  );

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - accuracy * ring.get()),
  }));
  const rowsStyle = useRise(rows, m.travel(18));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, 0.4 + ring.get() * 3),
    transform: [{ scale: swell.get() * (0.94 + 0.06 * Math.min(1, ring.get() * 3)) }],
  }));
  const xpStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, count.get() * 4),
    transform: [{ scale: 0.7 + 0.3 * Math.min(1, count.get() * 3) }],
  }));
  const halo1 = useHalo(burst, 0, tone);
  const halo2 = useHalo(burst, 0.18, tone);

  return (
    <View style={styles.wrap}>
      <View style={styles.ringSlot}>
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
            <Text style={styles.xp}>{head.text(shown)}</Text>
            <Text style={styles.xpLabel}>{head.unit}</Text>
          </Animated.View>
        </Animated.View>
      </View>
      <RowsCard rows={rowsOf(data)} style={rowsStyle} />
    </View>
  );
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

const styles = themed(() => ({
  wrap: { alignItems: 'center', gap: space.xl, alignSelf: 'stretch' },
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
}));
