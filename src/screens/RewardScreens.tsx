import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Text, useWindowDimensions, View } from 'react-native';
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
import {
  landFeedback,
  medalFeedback,
  pulseAt,
  tierFeedback,
  unlockFeedback,
} from '../lesson/feedback';
import { EASE_IN_OUT, EASE_OUT, SPRING_POP, useMotion } from '../lesson/motion';
import { EMBLEM_NAMES, Medal, MedalCoin, medalFace } from '../rewards/Medal';
import { PATH_CHAPTERS, PATHS, type TradingPath } from '../content';
import { MaterialRow, TierFlip } from '../rewards/TierCard';
import { NO_TIER, nextTier, tierNamed, TIERS } from '../rewards/tiers';
import { colors, space, type, themed } from '../theme';
import type { BadgeScreen as Badge, TierUpScreen as TierUp } from '../types';

/** How long one letter of the chapter name takes to type in. */
const TYPE_MS = 36;

/** The medal's width; it is 1.3 times as tall. */
const MEDAL = 150;
/** A coin in the row of the path's eight emblems. */
const COIN = 30;

/**
 * What the chapter just finished opens, as the screen says it: "Chapter 3 is
 * open: Orders, Costs & Position Size" when the level file names a chapter of
 * this path, otherwise the file's own words ("Your path unlocked").
 */
export function opensLine(unlocks: string | undefined, path: string | null): string | null {
  if (!unlocks) return null;
  const m = /^Chapter (\d+)$/.exec(unlocks.trim());
  if (m) {
    const n = Number(m[1]);
    const chapters = path && path in PATH_CHAPTERS ? PATH_CHAPTERS[path as TradingPath] : [];
    const next = chapters.find((c) => c.number === n);
    return next ? `Chapter ${n} is open: ${copy(next.title)}` : `Chapter ${n} is open`;
  }
  return `${copy(unlocks)} unlocked`;
}

/**
 * docs/UI.md §5.4 `badge` — chapter complete, a great accomplishment and so a
 * bigger moment [DESIGN-REVIEW] (§1, principle 12). In order: the chapter's
 * medal drops from above and lands with the heavy `medal` cue; a glow blooms
 * behind it and light runs once across its face; the name types in; the row
 * of the path's eight emblems shows how far the path has come, this
 * chapter's coin landing in its place; the next chapter is named; the key
 * comes last (the player holds it until `onSettled`).
 *
 * The drop accelerates -- an ease-in, which is wrong for UI and right for
 * something falling -- and the landing is the animation's own completion, so
 * the cue fires from the frame the medal touches down.
 */
export function BadgeScreen({
  screen,
  chapter,
  path,
  onSettled,
}: {
  screen: Badge;
  /** The chapter just finished; its emblem is on the medal. */
  chapter: number;
  /** The learner's path, for the next chapter's name. */
  path: string | null;
  onSettled: () => void;
}) {
  const m = useMotion();
  const name = copy(screen.name).replace(/\s+—\s+Complete$/, '');
  const drop = useSharedValue(m.reduced ? 1 : 0);
  const squash = useSharedValue(1);
  const glow = useSharedValue(m.reduced ? 1 : 0);
  const sheen = useSharedValue(m.reduced ? 1 : 0);
  const ring = useSharedValue(m.reduced ? 1 : 0);
  const typed = useSharedValue(m.reduced ? name.length : 0);
  const row = useSharedValue(m.reduced ? 1 : 0);
  const coin = useSharedValue(m.reduced ? 1 : 0);
  const opens = useSharedValue(m.reduced ? 1 : 0);
  const [letters, setLetters] = useState(m.reduced ? name.length : 0);
  const line = opensLine(screen.unlocks, path);

  const landed = useCallback(() => medalFeedback(), []);
  const placed = useCallback(() => landFeedback(), []);
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
    const rowAt = 360 + typing + 240;
    const coinAt = rowAt + 380;
    drop.set(
      withTiming(1, { duration: 460, easing: Easing.in(Easing.quad) }, (finished) => {
        'worklet';
        if (!finished) return;
        scheduleOnRN(landed);
        squash.set(
          withSequence(
            withTiming(0.88, { duration: 80, easing: EASE_OUT }),
            withSpring(1, SPRING_POP),
          ),
        );
        glow.set(withTiming(1, { duration: 900, easing: EASE_OUT }));
        ring.set(withTiming(1, { duration: 1100, easing: EASE_OUT }));
        sheen.set(withDelay(260, withTiming(1, { duration: 760, easing: EASE_IN_OUT })));
        typed.set(
          withDelay(360, withTiming(name.length, { duration: typing, easing: Easing.linear })),
        );
        row.set(withDelay(rowAt, withTiming(1, { duration: 360, easing: EASE_OUT })));
        coin.set(
          withDelay(
            coinAt,
            withSpring(1, SPRING_POP, (done) => {
              'worklet';
              if (done) scheduleOnRN(placed);
            }),
          ),
        );
        opens.set(
          withDelay(
            coinAt + 360,
            withTiming(1, { duration: 420, easing: EASE_OUT }, (done) => {
              'worklet';
              if (done) scheduleOnRN(unlocked);
            }),
          ),
        );
      }),
    );
  }, [
    m.reduced,
    name,
    landed,
    placed,
    unlocked,
    onSettled,
    drop,
    squash,
    glow,
    sheen,
    ring,
    typed,
    row,
    coin,
    opens,
  ]);

  useAnimatedReaction(
    () => Math.floor(typed.get()),
    (n, previous) => {
      if (n !== previous) scheduleOnRN(setLetters, n);
    },
  );

  const medalStyle = useAnimatedStyle(() => {
    const d = drop.get();
    const s = squash.get();
    return {
      opacity: Math.min(1, d * 3),
      transform: [
        { translateY: -160 * (1 - d) },
        { scaleX: (0.8 + 0.2 * d) * (2 - s) },
        { scaleY: (0.8 + 0.2 * d) * s },
      ],
    };
  });
  const glowStyle = useAnimatedStyle(() => {
    const g = glow.get();
    return {
      opacity: g <= 0 ? 0 : 0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, g * 0.75 + 0.25)),
      transform: [{ scale: 0.5 + 0.6 * g }],
    };
  });
  const ringStyle = useLightRing(ring, 2.2);
  const face = medalFace(MEDAL);
  const sheenStyle = useAnimatedStyle(() => ({
    opacity: sheen.get() <= 0 || sheen.get() >= 1 ? 0 : 0.8,
    transform: [{ translateX: -face.r * 2.2 + face.r * 4.4 * sheen.get() }, { rotate: '18deg' }],
  }));
  const rowStyle = useAnimatedStyle(() => ({
    opacity: row.get(),
    transform: [{ translateY: 8 * (1 - row.get()) }],
  }));
  const coinStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, coin.get() * 2),
    transform: [{ translateY: -14 * (1 - coin.get()) }, { scale: 0.5 + 0.5 * coin.get() }],
  }));
  const opensStyle = useAnimatedStyle(() => ({
    opacity: opens.get(),
    transform: [{ translateY: 10 * (1 - opens.get()) }],
  }));

  return (
    <View style={styles.centered}>
      <View style={styles.medalSlot}>
        <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]}>
          <Svg width={GLOW} height={GLOW}>
            <Defs>
              <RadialGradient id="medalGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.warning} stopOpacity={0.5} />
                <Stop offset="0.5" stopColor={colors.warning} stopOpacity={0.14} />
                <Stop offset="1" stopColor={colors.warning} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#medalGlow)" />
          </Svg>
        </Animated.View>
        <Animated.View style={medalStyle}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.lightRing,
              {
                left: face.cx - face.r,
                top: face.cy - face.r,
                width: face.r * 2,
                height: face.r * 2,
                borderRadius: face.r,
              },
              ringStyle,
            ]}
          />
          <Medal chapter={chapter} size={MEDAL} id={`medal-${chapter}`} />
          {/* The light running across the face, clipped to it. */}
          <View
            pointerEvents="none"
            style={[
              styles.faceClip,
              {
                left: face.cx - face.r,
                top: face.cy - face.r,
                width: face.r * 2,
                height: face.r * 2,
                borderRadius: face.r,
              },
            ]}
          >
            <Animated.View style={[styles.sheen, { height: face.r * 3 }, sheenStyle]} />
          </View>
        </Animated.View>
      </View>
      {/* The full name holds the layout from the first frame, so typing it in
          never reflows the screen; the untyped part is simply invisible. */}
      <View style={styles.titleBlock}>
        <Text style={styles.kickerGold}>{`Chapter ${chapter} complete`}</Text>
        <Text style={styles.bigTitle} accessibilityRole="header">
          {name.slice(0, letters)}
          <Text style={styles.untyped}>{name.slice(letters)}</Text>
        </Text>
      </View>
      <Animated.View
        style={[styles.emblemRow, rowStyle]}
        accessible
        accessibilityLabel={`Chapter ${chapter} of ${EMBLEM_NAMES.length} done`}
      >
        {EMBLEM_NAMES.map((_, i) => {
          const n = i + 1;
          if (n === chapter) {
            return (
              <View key={n} style={styles.coinSlot}>
                <View style={styles.coinGhost}>
                  <MedalCoin chapter={n} size={COIN} earned={false} id={`ghost-${n}`} />
                </View>
                <Animated.View style={coinStyle}>
                  <MedalCoin chapter={n} size={COIN} earned id={`row-${n}`} />
                </Animated.View>
              </View>
            );
          }
          return (
            <View key={n} style={styles.coinSlot}>
              <MedalCoin chapter={n} size={COIN} earned={n < chapter} id={`row-${n}`} />
            </View>
          );
        })}
      </Animated.View>
      {line ? (
        <Animated.View style={opensStyle}>
          <Text style={styles.unlocks}>{line}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * docs/UI.md §5.5 `tier-up` — rarer and louder than a badge.
 *
 * [DESIGN-REVIEW] The tier card turns over in place, from the old tier's
 * material to the new one, landing on the `tier` cue's chord -- read from the
 * cue table -- where the gold confetti goes up. Then the file's sentence on
 * what the tier means, the row of the four materials with the learner's
 * place in it, and one line on the next tier.
 */
export function TierUpScreen({
  screen,
  path,
  onSettled,
}: {
  screen: TierUp;
  /** The learner's path, printed on the card. */
  path: string | null;
  onSettled: () => void;
}) {
  const m = useMotion();
  const { width } = useWindowDimensions();
  const hit = pulseAt('tier', 3); // the chord, 440 ms after the cue starts
  const tier = tierNamed(screen.tier) ?? TIERS[0];
  const before = TIERS.find((t) => t.rank === tier.rank - 1) ?? NO_TIER;
  const next = nextTier(tier);
  const cardW = Math.min(320, width - space.lg * 2);
  const words = useSharedValue(m.reduced ? 1 : 0);
  const [burst, setBurst] = useState(false);
  const [wrap, setWrap] = useState({ w: 0, h: 0 });
  const [cardY, setCardY] = useState(0);
  const stage =
    wrap.h > 0 && cardY > 0
      ? { width: wrap.w, height: wrap.h, originY: cardY / wrap.h }
      : { width, height: 640, originY: 0.4 };
  const pathName = PATHS.find((p) => p.id === path)?.name;

  // The old card is seen for a beat, then turns; the cue starts so that its
  // chord lands on the turn's end, where the confetti goes up.
  const land = FLIP_DELAY + FLIP_MS;
  useEffect(() => {
    if (m.reduced) {
      tierFeedback();
      onSettled();
      return;
    }
    const t0 = setTimeout(tierFeedback, Math.max(0, land - hit));
    const t1 = setTimeout(() => setBurst(true), land);
    words.set(withDelay(land + 380, withTiming(1, { duration: 520, easing: EASE_OUT })));
    const t2 = setTimeout(onSettled, land + 1100);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [m.reduced, hit, land, onSettled, words]);

  const after = useAnimatedStyle(() => ({
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
        <Confetti
          width={stage.width}
          height={stage.height}
          pieces={70}
          gold
          originY={stage.originY}
        />
      ) : null}
      <Text style={styles.tierKicker}>Tier unlocked</Text>
      <View
        style={styles.cardSlot}
        onLayout={(e: LayoutChangeEvent) => {
          const { y, height } = e.nativeEvent.layout;
          setCardY(y + height / 2);
        }}
      >
        <TierFlip
          from={before}
          to={tier}
          width={cardW}
          path={pathName}
          delay={FLIP_DELAY}
          ms={FLIP_MS}
        />
      </View>
      <Animated.View style={[styles.tierAfter, after]}>
        <Text style={styles.tierMeans}>{copy(screen.means)}</Text>
        <MaterialRow rank={tier.rank} />
        <Text style={styles.tierNext}>
          {next
            ? `Next: ${next.name}, at the end of Chapter ${next.after}.`
            : 'The last tier of the path.'}
        </Text>
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

const GLOW = 280;
/** The tier card: the old one held for a beat, then the turn. */
const FLIP_DELAY = 500;
const FLIP_MS = 640;

const styles = themed(() => ({
  centered: { gap: space.lg },
  medalSlot: {
    alignSelf: 'center',
    width: GLOW,
    height: MEDAL * 1.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.warning,
  },
  faceClip: { position: 'absolute', overflow: 'hidden' },
  sheen: {
    position: 'absolute',
    top: -20,
    left: '50%',
    width: 18,
    marginLeft: -9,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  titleBlock: { gap: space.xs, alignItems: 'center' },
  kickerGold: {
    ...type.label,
    color: colors.warning,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  emblemRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  coinSlot: { width: COIN, height: COIN },
  coinGhost: { position: 'absolute' },
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
  cardSlot: { alignItems: 'center', justifyContent: 'center' },
  tierAfter: { gap: space.lg, alignItems: 'center' },
  tierNext: { ...type.small, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
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
  tierName: {
    ...type.display,
    fontSize: 38,
    lineHeight: 46,
    color: colors.text,
    textAlign: 'center',
  },
  tierMeans: { ...type.body, color: colors.textMuted, textAlign: 'center' },
}));
