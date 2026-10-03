import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { count, price } from '../../format';
import type { BookWalk } from '../../lesson/bookWalk';
import { EASE_IN_OUT, SPRING_POP } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, radius, space, TAP_TARGET, type, themed } from '../../theme';
import GrowBar from './GrowBar';

/** The walk: a pause after Check, then one level after the next. */
const WALK_START_MS = 300;
const WALK_STEP_MS = 340;
const DRAIN_MS = 280;

type Level = [number, number];

/**
 * docs/UI.md §6.6 — the order-book ladder. Two columns of price levels with size
 * bars, best bid/ask highlighted. Rows are tappable for `depth-ladder`.
 */
export default function OrderBook({
  bids,
  asks,
  onTapRow,
  selected,
  resolved,
  walk,
}: {
  bids: Level[];
  asks: Level[];
  onTapRow?: (id: string) => void;
  selected?: string | null;
  resolved?: Record<string, string>;
  /** docs/UI.md §4.2 [DESIGN-REVIEW]: after Check, the order walked through the book. */
  walk?: BookWalk | null;
}) {
  // A book drawn already walked (coming back to the screen) shows it done.
  const [still] = useState(() => !!walk);
  const maxSize = Math.max(...bids.map((b) => b[1]), ...asks.map((a) => a[1]), 1);

  const side = (levels: Level[], kind: 'bid' | 'ask') => (
    <View style={styles.col}>
      <Text style={[styles.head, { color: kind === 'bid' ? colors.up : colors.down }]}>
        {kind === 'bid' ? 'BIDS' : 'ASKS'}
      </Text>
      {levels.map(([p, size], i) => {
        const id = `${kind}-${i + 1}`;
        const tint = kind === 'bid' ? colors.up : colors.down;
        return (
          <Pressable
            accessibilityRole="button"
            key={id}
            disabled={!onTapRow}
            onPress={() => onTapRow?.(id)}
            style={[
              styles.row,
              i === 0 && styles.best,
              selected === id && { borderColor: colors.accent },
              resolved?.[id] ? { borderColor: resolved[id] } : null,
            ]}
          >
            {/* Depth grows out from the spread, level by level; after Check
                the order drains the levels it fills. */}
            <Drain
              anchor={kind === 'bid' ? 'right' : 'left'}
              taken={
                walk && walk.side === kind && i < walk.levels
                  ? i === walk.levels - 1
                    ? (walk.last ?? 0)
                    : 1
                  : 0
              }
              step={i}
              still={still}
            >
              <GrowBar
                to={(size / maxSize) * 100}
                from={kind === 'bid' ? 'right' : 'left'}
                delay={i * 70}
                style={[styles.sizeBar, { backgroundColor: tint, opacity: 0.16 }]}
              />
            </Drain>
            <Text style={[styles.price, { color: tint }]}>{price(p)}</Text>
            {walk && walk.side === kind && i === walk.levels - 1 ? (
              <LastFill step={walk.levels} still={still} />
            ) : null}
            <Text style={styles.size}>{count(size)}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {side(bids, 'bid')}
      {side(asks, 'ask')}
    </View>
  );
}

/**
 * A level's size bar giving up what the order takes: it shrinks towards the
 * spread, in its turn. Played once; a book drawn after the walk (coming back
 * to the screen, reduced motion) shows it drained.
 */
function Drain({
  anchor,
  taken,
  step,
  still,
  children,
}: {
  anchor: 'left' | 'right';
  taken: number;
  step: number;
  still: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReduceMotion();
  const d = useSharedValue(still || reduced ? taken : 0);
  useEffect(() => {
    if (taken <= 0) {
      d.set(0);
      return;
    }
    if (reduced || still) {
      d.set(taken);
      return;
    }
    d.set(
      withDelay(
        WALK_START_MS + step * WALK_STEP_MS,
        withTiming(taken, { duration: DRAIN_MS, easing: EASE_IN_OUT }),
      ),
    );
  }, [taken, step, still, reduced, d]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - d.get() }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transformOrigin: anchor }, style]}
    >
      {children}
    </Animated.View>
  );
}

/** The mark on the level where the last share fills, once the walk reaches it. */
function LastFill({ step, still }: { step: number; still: boolean }) {
  const reduced = useReduceMotion();
  const v = useSharedValue(reduced || still ? 1 : 0);
  useEffect(() => {
    if (reduced || still) return;
    v.set(withDelay(WALK_START_MS + step * WALK_STEP_MS, withSpring(1, SPRING_POP)));
  }, [reduced, still, step, v]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, v.get() * 2),
    transform: [{ scale: 0.6 + 0.4 * v.get() }],
  }));
  return (
    <Animated.View style={[styles.lastFill, style]} pointerEvents="none">
      <Text style={styles.lastFillText}>last share</Text>
    </Animated.View>
  );
}

const styles = themed(() => ({
  lastFill: {
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  lastFillText: {
    ...type.small,
    fontSize: 11,
    lineHeight: 14,
    color: colors.background,
    fontWeight: '700',
  },
  wrap: { flexDirection: 'row', gap: space.sm },
  col: { flex: 1, gap: 3 },
  head: { ...type.small, letterSpacing: 1, marginBottom: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.sm,
    minHeight: TAP_TARGET,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  best: { backgroundColor: colors.surfaceAlt },
  sizeBar: { position: 'absolute', top: 0, bottom: 0 },
  price: { ...type.small, fontWeight: '600' },
  size: { ...type.small, color: colors.textMuted },
}));
