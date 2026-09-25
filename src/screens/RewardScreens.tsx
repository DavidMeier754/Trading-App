import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { copy } from '../format';
import Confetti from '../lesson/Confetti';
import { badgeFeedback, pulseAt, tierFeedback, unlockFeedback } from '../lesson/feedback';
import { EASE_OUT, SPRING_POP, useMotion } from '../lesson/motion';
import { colors, space, type } from '../theme';
import type { BadgeScreen as Badge, TierUpScreen as TierUp } from '../types';

/** How long one letter of the chapter name takes to type in. */
const TYPE_MS = 36;

/**
 * docs/UI.md §5.4 `badge` — chapter complete.
 *
 * The doc specifies a sequence and this is it, in order: the badge drops in
 * and lands with weight, a ring of light goes out from it, the chapter name
 * types in, "unlocked" arrives with its own chime, and the CTA comes last (the
 * player holds it until `onSettled`).
 *
 * The drop accelerates -- an ease-in, which is wrong for UI and right for
 * something falling -- and the landing is the animation's own completion, so
 * the heavy pulse and the thud are fired from the frame the badge touches down,
 * not from a timer that guesses when that is. The second ring leaves on the
 * cue's second pulse, read from the cue table.
 */
export function BadgeScreen({
  screen,
  onSettled,
}: {
  screen: Badge;
  onSettled: () => void;
}) {
  const m = useMotion();
  const name = copy(screen.name);
  const drop = useSharedValue(m.reduced ? 1 : 0);
  const squash = useSharedValue(1);
  const ring1 = useSharedValue(m.reduced ? 1 : 0);
  const ring2 = useSharedValue(m.reduced ? 1 : 0);
  const typed = useSharedValue(m.reduced ? name.length : 0);
  const unlock = useSharedValue(m.reduced ? 1 : 0);
  const [letters, setLetters] = useState(m.reduced ? name.length : 0);

  const landed = useCallback(() => badgeFeedback(), []);
  const unlocked = useCallback(() => {
    if (screen.unlocks) unlockFeedback();
    onSettled();
  }, [screen.unlocks, onSettled]);

  useEffect(() => {
    if (m.reduced) {
      onSettled();
      return;
    }
    const typing = name.length * TYPE_MS;
    drop.set(
      withTiming(1, { duration: 420, easing: Easing.in(Easing.quad) }, (finished) => {
        'worklet';
        if (!finished) return;
        scheduleOnRN(landed);
        squash.set(withSequence(withTiming(0.86, { duration: 70, easing: EASE_OUT }), withSpring(1, SPRING_POP)));
        ring1.set(withTiming(1, { duration: 1000, easing: EASE_OUT }));
        ring2.set(withDelay(pulseAt('badge', 1), withTiming(1, { duration: 1100, easing: EASE_OUT })));
        typed.set(withDelay(360, withTiming(name.length, { duration: typing, easing: Easing.linear })));
        unlock.set(
          withDelay(
            360 + typing + 260,
            withTiming(1, { duration: 420, easing: EASE_OUT }, (done) => {
              'worklet';
              if (done) scheduleOnRN(unlocked);
            })
          )
        );
      })
    );
  }, [m.reduced, name, landed, unlocked, onSettled, drop, squash, ring1, ring2, typed, unlock]);

  useAnimatedReaction(
    () => Math.floor(typed.get()),
    (n, previous) => {
      if (n !== previous) scheduleOnRN(setLetters, n);
    }
  );

  const badge = useAnimatedStyle(() => {
    const d = drop.get();
    const s = squash.get();
    return {
      opacity: Math.min(1, d * 3),
      transform: [
        { translateY: -110 * (1 - d) },
        { scaleX: (0.75 + 0.25 * d) * (2 - s) },
        { scaleY: (0.75 + 0.25 * d) * s },
      ],
    };
  });
  const r1 = useLightRing(ring1, 1.9);
  const r2 = useLightRing(ring2, 2.4);
  const unlockStyle = useAnimatedStyle(() => ({
    opacity: unlock.get(),
    transform: [{ translateY: 10 * (1 - unlock.get()) }],
  }));

  return (
    <View style={styles.centered}>
      <View style={styles.badgeSlot}>
        <Animated.View pointerEvents="none" style={[styles.lightRing, r1]} />
        <Animated.View pointerEvents="none" style={[styles.lightRing, r2]} />
        <Animated.View style={[styles.badgeRing, badge]}>
          <Text style={styles.badgeMark}>{'★'}</Text>
        </Animated.View>
      </View>
      {/* The full name holds the layout from the first frame, so typing it in
          never reflows the screen; the untyped part is simply invisible. */}
      <Text style={styles.bigTitle}>
        {name.slice(0, letters)}
        <Text style={styles.untyped}>{name.slice(letters)}</Text>
      </Text>
      {screen.unlocks ? (
        <Animated.View style={unlockStyle}>
          <Text style={styles.unlocks}>{`${copy(screen.unlocks)} unlocked`}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * docs/UI.md §5.5 `tier-up` — rarer and louder than a badge.
 *
 * Built on the `tier` cue's own shape: three rising pickup notes, then the chord
 * on a heavy pulse. The tier name grows through the pickup and hits full size
 * exactly on the chord, where the light flares, the rings go out and the gold
 * confetti goes up. All of those take the chord's time from the cue table.
 */
export function TierUpScreen({
  screen,
  onSettled,
}: {
  screen: TierUp;
  onSettled: () => void;
}) {
  const m = useMotion();
  const { width } = useWindowDimensions();
  const hit = pulseAt('tier', 3); // the chord, 460 ms
  const grow = useSharedValue(m.reduced ? 1 : 0);
  const pop = useSharedValue(1);
  const flare = useSharedValue(m.reduced ? 1 : 0);
  const ring = useSharedValue(m.reduced ? 1 : 0);
  const words = useSharedValue(m.reduced ? 1 : 0);
  const [burst, setBurst] = useState(false);
  // Where the name sits, so the confetti goes up from behind it and not from
  // a guessed height.
  const [wrap, setWrap] = useState({ w: 0, h: 0 });
  const [nameY, setNameY] = useState(0);
  const stage =
    wrap.h > 0 && nameY > 0
      ? { width: wrap.w, height: wrap.h, originY: nameY / wrap.h }
      : { width, height: 640, originY: 0.45 };

  const impact = useCallback(() => setBurst(true), []);

  useEffect(() => {
    tierFeedback();
    if (m.reduced) {
      onSettled();
      return;
    }
    grow.set(
      withTiming(1, { duration: hit, easing: Easing.in(Easing.cubic) }, (finished) => {
        'worklet';
        if (!finished) return;
        scheduleOnRN(impact);
        pop.set(withSequence(withTiming(1.14, { duration: 80, easing: EASE_OUT }), withSpring(1, SPRING_POP)));
        flare.set(withTiming(1, { duration: 900, easing: EASE_OUT }));
        ring.set(withTiming(1, { duration: 1100, easing: EASE_OUT }));
        words.set(withDelay(380, withTiming(1, { duration: 520, easing: EASE_OUT })));
      })
    );
    const t = setTimeout(onSettled, hit + 1100);
    return () => clearTimeout(t);
  }, [m.reduced, hit, impact, onSettled, grow, pop, flare, ring, words]);

  const kicker = useAnimatedStyle(() => ({
    opacity: Math.min(1, grow.get() * 2.5),
    transform: [{ translateY: 8 * (1 - Math.min(1, grow.get() * 2)) }],
  }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, 0.2 + grow.get()),
    transform: [{ scale: (0.55 + 0.45 * grow.get()) * pop.get() }],
  }));
  const glow = useAnimatedStyle(() => {
    const g = grow.get();
    const f = flare.get();
    return {
      opacity: 0.45 * g + 0.55 * (f > 0 ? Math.sin(Math.PI * Math.min(1, f * 1.4)) : 0),
      transform: [{ scale: 0.3 + 0.7 * g + 0.25 * f }],
    };
  });
  const ringStyle = useLightRing(ring, 2.6);
  const means = useAnimatedStyle(() => ({
    opacity: words.get(),
    transform: [{ translateY: 10 * (1 - words.get()) }],
  }));

  return (
    <View
      style={styles.centered}
      onLayout={(e: LayoutChangeEvent) =>
        setWrap({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      {burst ? (
        <Confetti width={stage.width} height={stage.height} pieces={70} gold originY={stage.originY} />
      ) : null}
      <Animated.View style={kicker}>
        <Text style={styles.tierKicker}>Tier unlocked</Text>
      </Animated.View>
      <View
        style={styles.tierSlot}
        onLayout={(e: LayoutChangeEvent) => {
          const { y, height } = e.nativeEvent.layout;
          setNameY(y + height / 2);
        }}
      >
        <Animated.View pointerEvents="none" style={[styles.glow, glow]}>
          <Svg width={GLOW} height={GLOW}>
            <Defs>
              <RadialGradient id="tierGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.warning} stopOpacity={0.55} />
                <Stop offset="0.45" stopColor={colors.warning} stopOpacity={0.18} />
                <Stop offset="1" stopColor={colors.warning} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#tierGlow)" />
          </Svg>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.tierRing, ringStyle]} />
        <Animated.View style={nameStyle}>
          <Text style={styles.tierName}>{copy(screen.tier)}</Text>
        </Animated.View>
      </View>
      <Animated.View style={means}>
        <Text style={styles.tierMeans}>{copy(screen.means)}</Text>
      </Animated.View>
    </View>
  );
}

/** A ring of light going out: grows to `reach` times its size and fades. */
function useLightRing(v: SharedValue<number>, reach: number) {
  return useAnimatedStyle(() => {
    const t = v.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : 0.85 * (1 - t),
      transform: [{ scale: 1 + (reach - 1) * t }],
    };
  });
}

const BADGE = 152;
const GLOW = 280;

const styles = StyleSheet.create({
  centered: { gap: space.lg },
  badgeSlot: {
    alignSelf: 'center',
    width: BADGE,
    height: BADGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightRing: {
    position: 'absolute',
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 3,
    borderColor: colors.warning,
  },
  badgeRing: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 3,
    borderColor: colors.warning,
    backgroundColor: colors.warningTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMark: { fontSize: 60, color: colors.warning },
  bigTitle: { ...type.display, color: colors.text, textAlign: 'center' },
  untyped: { color: 'transparent' },
  unlocks: { ...type.body, color: colors.warning, textAlign: 'center' },
  tierKicker: {
    ...type.label,
    color: colors.warning,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  tierSlot: { alignItems: 'center', justifyContent: 'center', minHeight: 120 },
  glow: {
    position: 'absolute',
    width: GLOW,
    height: GLOW,
  },
  tierRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: colors.warning,
  },
  tierName: { ...type.display, fontSize: 38, lineHeight: 46, color: colors.text, textAlign: 'center' },
  tierMeans: { ...type.body, color: colors.textMuted, textAlign: 'center' },
});
