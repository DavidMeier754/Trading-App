import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from './useReduceMotion';

import { colors } from '../theme';

/** The coins' gold: a face and its rim. */
const COIN_FACE = '#F5C04A';
const COIN_RIM = '#C98A1B';

/**
 * A burst for a finished lesson. Rare tier, so it gets the delight budget.
 *
 * [DESIGN-REVIEW] "Confetti of candles and coins" (David's pick of
 * 2026-10-04): the pieces are little green candles and gold coins, not paper.
 * Each is thrown up out of a tight origin, arcs over and drifts down, and
 * tumbles as it goes: a candle turns end over end, a coin spins on its edge --
 * its width swings through zero and back, which is what a coin turning over in
 * the air looks like.
 *
 * Transform and opacity only, one shared value per piece, no layout. Under
 * reduced motion it renders nothing at all -- a celebration is decoration, and
 * decoration is exactly what reduced motion is asking to be spared.
 */
export default function Confetti({
  width,
  height,
  pieces = 28,
  gold = false,
  originY = 0.3,
}: {
  width: number;
  height: number;
  pieces?: number;
  /** A perfect run: more coins than candles. */
  gold?: boolean;
  /** Where the burst starts, as a share of `height`. */
  originY?: number;
}) {
  const reduced = useReduceMotion();
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={[styles.layer, { overflow: 'hidden' }]}>
      {Array.from({ length: pieces }, (_, i) => (
        <Piece
          key={i}
          index={i}
          count={pieces}
          width={width}
          height={height}
          originY={originY}
          kind={i % (gold ? 3 : 2) === 0 ? 'candle' : 'coin'}
        />
      ))}
    </View>
  );
}

function Piece({
  index,
  count,
  width,
  height,
  originY,
  kind,
}: {
  index: number;
  count: number;
  width: number;
  height: number;
  originY: number;
  kind: 'candle' | 'coin';
}) {
  // Deterministic scatter: a seeded spread beats Math.random, which would give a
  // different burst on every re-render of the same screen.
  const seed = useMemo(() => {
    const a = Math.sin(index * 127.1) * 43758.5453;
    const b = Math.sin(index * 311.7) * 24634.6345;
    const c = Math.sin(index * 74.7) * 12345.6789;
    return { x: a - Math.floor(a), y: b - Math.floor(b), z: c - Math.floor(c) };
  }, [index]);

  const progress = useSharedValue(0);

  React.useEffect(() => {
    // Most of the burst leaves at once; a few stragglers make it read as thrown.
    const delay = (index / count) * 140 + seed.z * 60;
    progress.set(
      withDelay(delay, withTiming(1, { duration: 2100 + seed.y * 700, easing: Easing.linear })),
    );
  }, [index, count, seed, progress]);

  const startX = width * (0.44 + (seed.x - 0.5) * 0.12);
  const startY = height * originY;
  const drift = (seed.x - 0.5) * width * 1.4;
  const lift = height * (0.18 + seed.y * 0.26);
  const fall = height * (0.75 + seed.z * 0.3);
  const turns = 2 + seed.y * 4;
  const flips = 3 + seed.z * 5;
  const sway = 10 + seed.x * 18;

  const coin = kind === 'coin';
  const style = useAnimatedStyle(() => {
    const t = progress.get();
    // Up fast and decelerating, then down under gravity: a thrown arc.
    const up = 1 - (1 - Math.min(1, t / 0.28)) ** 2;
    const down = Math.max(0, (t - 0.28) / 0.72);
    const y = startY - lift * up + (fall + lift) * down * down;
    const x = startX + drift * (1 - (1 - t) ** 2) + Math.sin(t * Math.PI * 4) * sway * down;
    const spin = Math.cos(t * flips * Math.PI * 2);
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        // A coin keeps upright and spins on its edge; a candle turns end over end.
        { rotate: `${coin ? Math.sin(t * 3) * 25 : t * turns * 360}deg` },
        coin ? { scaleX: spin } : { scaleY: spin },
      ],
      opacity: t <= 0 ? 0 : t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1,
    };
  });

  if (coin) {
    const d = index % 3 === 0 ? 10 : 13;
    return (
      <Animated.View
        style={[
          styles.piece,
          {
            width: d,
            height: d,
            borderRadius: d / 2,
            backgroundColor: COIN_FACE,
            borderWidth: 2,
            borderColor: COIN_RIM,
          },
          style,
        ]}
      />
    );
  }
  // A green candle: a body on its wick.
  const tall = index % 4 === 0;
  return (
    <Animated.View style={[styles.piece, styles.candle, style]}>
      <View style={[styles.wick, { backgroundColor: colors.up, height: tall ? 20 : 16 }]} />
      <View
        style={[
          styles.body,
          { backgroundColor: colors.up, height: tall ? 12 : 8, top: tall ? 4 : 4 },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  piece: { position: 'absolute', top: 0, left: 0 },
  candle: { width: 8, height: 20, alignItems: 'center' },
  wick: { position: 'absolute', top: 0, width: 1.5, borderRadius: 1 },
  body: { position: 'absolute', width: 8, borderRadius: 1.5 },
});
