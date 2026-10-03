import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { copy } from '../format';
import { colors, radius, space, type, themed } from '../theme';
import { surfaceStyle, useLookSpec } from './look';
import { EASE_IN_OUT, EASE_OUT, SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** How long the deck takes to gather and shuffle before the round starts. */
export const DEAL_MS = 520;

/** The most cards fanned; more are counted on the last. */
const SHOWN = 4;

export type DeckItem = { line: string; answer: string };

/**
 * docs/UI.md §4.5 [DESIGN-REVIEW]: before the mistakes round, the missed
 * questions lie as a small fanned deck, each with what was answered. The key
 * gathers it, shuffles it once and the round begins. Small and concrete, so
 * it reads as a second chance, not a punishment.
 */
export default function MistakesDeck({ items, dealing }: { items: DeckItem[]; dealing: boolean }) {
  const reduced = useReduceMotion();
  const fan = useSharedValue(reduced ? 1 : 0);
  const gather = useSharedValue(0);
  useEffect(() => {
    if (!reduced) fan.set(withDelay(180, withSpring(1, SPRING_POP)));
  }, [reduced, fan]);
  useEffect(() => {
    if (!dealing || reduced) return;
    gather.set(
      withSequence(
        withTiming(1, { duration: DEAL_MS * 0.45, easing: EASE_OUT }),
        withTiming(1.25, { duration: DEAL_MS * 0.2, easing: EASE_IN_OUT }),
        withTiming(1, { duration: DEAL_MS * 0.35, easing: EASE_IN_OUT }),
      ),
    );
  }, [dealing, reduced, gather]);

  const cards = items.slice(0, SHOWN);
  const more = items.length - cards.length;
  const n = items.length;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.kicker}>Mistakes round</Text>
        <Text style={styles.title} accessibilityRole="header">
          {`${n} to fix`}
        </Text>
        <Text style={styles.line}>
          {n === 1 ? 'It comes back once.' : 'Each comes back once, in a new order.'}
        </Text>
      </View>
      <View
        style={styles.deck}
        accessible
        accessibilityLabel={`${n} ${n === 1 ? 'question' : 'questions'} to fix: ${items
          .map((it) => it.line)
          .join('; ')}`}
      >
        {cards.map((item, i) => (
          <DeckCard
            key={i}
            item={item}
            i={i}
            count={cards.length}
            fan={fan}
            gather={gather}
            more={more}
          />
        ))}
      </View>
    </View>
  );
}

/** How far each card behind sits above the one in front, so its first line shows. */
const PEEK = 40;

function DeckCard({
  item,
  i,
  count,
  fan,
  gather,
  more,
}: {
  item: DeckItem;
  i: number;
  count: number;
  fan: SharedValue<number>;
  gather: SharedValue<number>;
  more: number;
}) {
  const spec = useLookSpec();
  // A pile, the front card last: each one behind peeks out above the next,
  // a little smaller and tilted the other way, so its first line reads.
  const depth = count - 1 - i;
  const front = depth === 0;
  const angle = depth === 0 ? 0 : (depth % 2 === 1 ? -1 : 1) * (0.8 + 0.4 * depth);
  const style = useAnimatedStyle(() => {
    const f = fan.get();
    const g = Math.min(1, gather.get());
    // Past 1 the gathered deck shuffles: alternate cards step out to each side.
    const shuffle = Math.max(0, gather.get() - 1) * 4;
    const side = i % 2 === 0 ? -1 : 1;
    const spread = f * (1 - g);
    return {
      transform: [
        { translateX: side * 30 * shuffle },
        { translateY: -PEEK * depth * spread + (1 - f) * 24 * (depth + 1) },
        { rotate: `${angle * spread}deg` },
        { scale: 1 - 0.03 * depth * spread },
      ],
      opacity: Math.min(1, f * 1.5),
    };
  });
  return (
    <Animated.View
      style={[
        styles.card,
        surfaceStyle(spec),
        // Opaque, whatever the look's surface: the cards lie on each other.
        { backgroundColor: colors.surface, zIndex: i },
        style,
      ]}
    >
      <Text style={styles.cardLine} numberOfLines={front ? 3 : 1}>
        {copy(item.line)}
      </Text>
      {front && item.answer ? (
        <Text style={styles.cardAnswer} numberOfLines={1}>
          {`You said: ${item.answer}`}
        </Text>
      ) : null}
      {front && more > 0 ? <Text style={styles.more}>{`+${more} more`}</Text> : null}
    </Animated.View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.xl, alignItems: 'center' },
  head: { gap: space.xs, alignItems: 'center' },
  kicker: { ...type.label, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...type.display, color: colors.text, textAlign: 'center' },
  line: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  deck: { width: 300, height: 246, alignItems: 'center', justifyContent: 'flex-end' },
  card: {
    position: 'absolute',
    bottom: 0,
    width: 280,
    minHeight: 116,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: 'flex-start',
    gap: space.sm,
  },
  cardLine: { ...type.small, fontSize: 14, lineHeight: 19, color: colors.text },
  cardAnswer: { ...type.small, fontSize: 13, color: colors.down, fontWeight: '700' },
  more: {
    ...type.small,
    fontSize: 13,
    color: colors.textMuted,
    position: 'absolute',
    right: space.md,
    bottom: space.sm,
  },
}));
