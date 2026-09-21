import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';

const PIECES = 24;
const PALETTE = [colors.accent, colors.up, colors.warning, colors.down, '#FA742D'];

/**
 * A burst for the end of a lesson. Rare tier, so it gets the delight budget.
 *
 * Transform and opacity only, one shared value per piece, no layout. Under
 * reduced motion it renders nothing at all -- a celebration is decoration, and
 * decoration is exactly what reduced motion is asking to be spared.
 */
export default function Confetti({ width, height }: { width: number; height: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={[styles.layer, { overflow: 'hidden' }]}>
      {Array.from({ length: PIECES }, (_, i) => (
        <Piece key={i} index={i} width={width} height={height} />
      ))}
    </View>
  );
}

function Piece({
  index,
  width,
  height,
}: {
  index: number;
  width: number;
  height: number;
}) {
  // Deterministic scatter: a seeded spread beats Math.random, which would give a
  // different burst on every re-render of the same screen.
  const seed = useMemo(() => {
    const a = Math.sin(index * 127.1) * 43758.5453;
    const b = Math.sin(index * 311.7) * 24634.6345;
    return { x: a - Math.floor(a), y: b - Math.floor(b) };
  }, [index]);

  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 22;
    progress.set(
      withDelay(delay, withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }))
    );
    spin.set(withDelay(delay, withTiming(1, { duration: 1500, easing: Easing.linear })));
  }, [index, progress, spin]);

  // Thrown from the ring, not from the middle of nowhere: a tight origin that
  // spreads wide reads as a burst; a wide origin reads as rain.
  const startX = width * (0.42 + seed.x * 0.16);
  const drift = (seed.x - 0.5) * width * 1.35;
  const rise = -height * (0.2 + seed.y * 0.22);
  const fall = height * 0.95;
  const turns = 2 + seed.y * 3;

  const style = useAnimatedStyle(() => {
    const t = progress.get();
    // Up fast, then down: the arc is what makes it read as thrown, not dropped.
    const y = t < 0.32 ? rise * (t / 0.32) : rise + (fall - rise) * ((t - 0.32) / 0.68);
    return {
      transform: [
        { translateX: startX + drift * t },
        { translateY: y },
        { rotate: `${spin.get() * turns * 360}deg` },
      ],
      opacity: t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1,
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          backgroundColor: PALETTE[index % PALETTE.length],
          width: index % 3 === 0 ? 7 : 10,
          height: index % 3 === 0 ? 14 : 8,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  piece: { position: 'absolute', top: '34%', left: 0, borderRadius: 2 },
});
