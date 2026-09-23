import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  AnimatedRef,
  measure,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { tapFeedback } from '../lesson/feedback';
import { fitScale } from '../lesson/fitState';
import { tint, useLookSpec } from '../lesson/look';
import type { Tone } from '../lesson/toneTransition';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type {
  FillChoiceScreen as FillChoice,
  OrderScreen as OrderS,
  SortScreen as SortS,
  SpotMistakeScreen as SpotMistake,
} from '../types';
import { AnswerCard, Prompt, ToneSurface } from './common';

/** docs/UI.md §4.1 `fill-choice` — a blank with 3-4 word chips. */
export function FillChoiceScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: FillChoice;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const selected = value.kind === 'option' ? value.index : null;
  const correct = screen.options.indexOf(screen.answer);
  const [before, after] = copy(screen.sentence).split('___');
  const filled = selected !== null ? screen.options[selected] : null;

  const toneFor = (i: number): Tone => {
    if (!revealed) return selected === i ? 'selected' : 'idle';
    if (i === correct) return 'correct';
    if (i === selected) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.sentence}>
        {before.trim().split(/\s+/).filter(Boolean).map((w, i) => (
          <Text key={`b${i}`} style={styles.sentenceText}>{w}</Text>
        ))}
        <View style={[styles.blank, filled && styles.blankFilled]}>
          <Text style={styles.blankText}>{filled ?? '      '}</Text>
        </View>
        {after.trim().split(/\s+/).filter(Boolean).map((w, i) => (
          <Text key={`a${i}`} style={styles.sentenceText}>{w}</Text>
        ))}
      </View>

      <View style={styles.chips}>
        {screen.options.map((option, i) => (
          <ToneSurface
            key={option}
            tone={toneFor(i)}
            disabled={revealed}
            onPress={() => {
              onChange({ kind: 'option', index: i });
            }}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{option}</Text>
          </ToneSurface>
        ))}
      </View>
    </View>
  );
}

/** docs/UI.md §4.1 `sort` — 2-3 buckets, chips tapped or dragged into them. */
export function SortScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: SortS;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const placed = value.kind === 'buckets' ? value.placed : {};
  const [pending, setPending] = React.useState<number | null>(null);
  const accent = useLookSpec().accent;

  // Up to four buckets, each measured on the UI thread while a chip is being
  // dragged, so the one under the finger can light up without React.
  const b0 = useAnimatedRef<Animated.View>();
  const b1 = useAnimatedRef<Animated.View>();
  const b2 = useAnimatedRef<Animated.View>();
  const b3 = useAnimatedRef<Animated.View>();
  const bucketRefs = [b0, b1, b2, b3].slice(0, screen.buckets.length);
  const hover = useSharedValue(-1);
  // A drag ends on the chip it started on, which its Pressable reads as a
  // tap; this keeps that release from also selecting the chip.
  const dragging = useRef(false);

  const unplaced = screen.items
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => placed[i] === undefined);

  const toneFor = (i: number): Tone => {
    if (!revealed) return 'idle';
    return placed[i] === screen.items[i].bucket ? 'correct' : 'wrong';
  };

  const put = (item: number, bucket: string) => {
    tapFeedback();
    onChange({ kind: 'buckets', placed: { ...placed, [item]: bucket } });
    setPending(null);
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      {/* Above the buckets in the stacking order, so a chip dragged down
          passes over them rather than under. */}
      <View style={[styles.chips, styles.chipsOver]}>
        {unplaced.map(({ item, i }) => (
          <DragChip
            key={item.text}
            disabled={revealed}
            bucketRefs={bucketRefs}
            hover={hover}
            dragging={dragging}
            onDrop={(b) => put(i, screen.buckets[b])}
          >
            <ToneSurface
              tone={pending === i ? 'selected' : 'idle'}
              disabled={revealed}
              onPress={() => {
                if (dragging.current) return;
                setPending((p) => (p === i ? null : i));
              }}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{copy(item.text)}</Text>
            </ToneSurface>
          </DragChip>
        ))}
      </View>

      <View style={styles.buckets}>
        {screen.buckets.map((bucket, b) => (
          <Animated.View key={bucket} ref={bucketRefs[b]} style={styles.bucketSlot} collapsable={false}>
            <Pressable
              accessibilityRole="button"
              disabled={revealed || pending === null}
              onPress={() => {
                if (pending === null) return;
                put(pending, bucket);
              }}
              style={[styles.bucket, pending !== null && !revealed && styles.bucketOpen]}
            >
              <BucketGlow index={b} hover={hover} color={accent} />
              <Text style={styles.bucketTitle}>{copy(bucket)}</Text>
              <View style={styles.bucketItems}>
                {screen.items.map((item, i) =>
                  placed[i] === bucket ? (
                    <ToneSurface
                      key={item.text}
                      tone={toneFor(i)}
                      disabled
                      style={styles.chipSmall}
                    >
                      <Text style={styles.chipSmallText}>{copy(item.text)}</Text>
                    </ToneSurface>
                  ) : null
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

/**
 * A chip that can be picked up. It follows the finger on the UI thread, and
 * the bucket under the finger lights; let go over one and the chip goes in,
 * let go anywhere else and it springs home. A tap still selects it, for the
 * tap-then-bucket path docs/UI.md §10 requires alongside every drag.
 */
function DragChip({
  children,
  disabled,
  bucketRefs,
  hover,
  dragging,
  onDrop,
}: {
  children: React.ReactNode;
  disabled: boolean;
  bucketRefs: AnimatedRef<Animated.View>[];
  hover: SharedValue<number>;
  dragging: React.MutableRefObject<boolean>;
  onDrop: (bucket: number) => void;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const lift = useSharedValue(0);
  const onLift = useCallback(() => {
    dragging.current = true;
    tapFeedback();
  }, [dragging]);
  // Cleared a moment after the release, once the Pressable has had its say.
  const onLand = useCallback(() => {
    setTimeout(() => {
      dragging.current = false;
    }, 60);
  }, [dragging]);
  const count = bucketRefs.length;

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(6)
    .onStart(() => {
      lift.set(withSpring(1, { duration: 220, dampingRatio: 0.7 }));
      scheduleOnRN(onLift);
    })
    .onUpdate((e) => {
      // Translation is in drawn points; the chip moves in layout points, which
      // differ on a screen scaled to fit (lesson/fit.tsx).
      const s = fitScale.get();
      x.set(e.translationX / s);
      y.set(e.translationY / s);
      let over = -1;
      for (let b = 0; b < count; b++) {
        const m = measure(bucketRefs[b]);
        if (
          m &&
          e.absoluteX >= m.pageX &&
          e.absoluteX <= m.pageX + m.width &&
          e.absoluteY >= m.pageY &&
          e.absoluteY <= m.pageY + m.height
        ) {
          over = b;
        }
      }
      hover.set(over);
    })
    .onEnd(() => {
      const over = hover.get();
      hover.set(-1);
      scheduleOnRN(onLand);
      lift.set(withSpring(0, { duration: 260, dampingRatio: 0.9 }));
      if (over >= 0) {
        scheduleOnRN(onDrop, over);
      } else {
        x.set(withSpring(0, { duration: 420, dampingRatio: 0.75 }));
        y.set(withSpring(0, { duration: 420, dampingRatio: 0.75 }));
      }
    });

  const style = useAnimatedStyle(() => ({
    zIndex: lift.get() > 0.01 ? 10 : 0,
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: 1 + 0.06 * lift.get() }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}

/** The bucket under a dragged chip, lit. */
function BucketGlow({ index, hover, color }: { index: number; hover: SharedValue<number>; color: string }) {
  const style = useAnimatedStyle(() => ({ opacity: hover.get() === index ? 1 : 0 }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bucketGlow, { borderColor: color, backgroundColor: tint(color, 0.12) }, style]}
    />
  );
}

/** docs/UI.md §4.1 `order` — put 3-5 cards in sequence. */
export function OrderScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: OrderS;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const order = value.kind === 'sequence' ? value.order : [];
  // Dealt, never in the answer's order (lesson/shuffle.ts).
  const deal = screen.deal ?? screen.items.map((_, i) => i);
  const remaining = deal
    .map((i) => ({ text: screen.items[i], i }))
    .filter(({ i }) => !order.includes(i));

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <View style={styles.slots}>
        {order.map((itemIndex, position) => (
          <ToneSurface
            key={itemIndex}
            tone={revealed ? (itemIndex === position ? 'correct' : 'wrong') : 'selected'}
            disabled={revealed}
            onPress={() => {
              onChange({
                kind: 'sequence',
                order: order.filter((x) => x !== itemIndex),
              });
            }}
            style={styles.slotRow}
          >
            <Text style={styles.slotNum}>{position + 1}</Text>
            <Text style={styles.slotText}>{copy(screen.items[itemIndex])}</Text>
          </ToneSurface>
        ))}
        {remaining.length > 0 && !revealed ? (
          <View style={styles.slotEmpty}>
            <Text style={styles.slotHint}>{`${order.length + 1}. tap a card below`}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chips}>
        {remaining.map(({ text, i }) => (
          <ToneSurface
            key={text}
            tone="idle"
            disabled={revealed}
            onPress={() => {
              onChange({ kind: 'sequence', order: [...order, i] });
            }}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{copy(text)}</Text>
          </ToneSurface>
        ))}
      </View>
    </View>
  );
}

/** docs/UI.md §4.1 `spot-mistake` — tap the wrong segment of a statement. */
export function SpotMistakeScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: SpotMistake;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const picked = value.kind === 'index' ? value.index : null;
  const wrongIndex = screen.segments.findIndex((s) => s.wrong);

  const toneFor = (i: number): Tone => {
    if (!revealed) return picked === i ? 'selected' : 'idle';
    if (i === wrongIndex) return 'correct';
    if (i === picked) return 'wrong';
    return 'idle';
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>
      <View style={styles.segments}>
        {screen.segments.map((segment, i) => (
          <ToneSurface
            key={segment.text}
            tone={toneFor(i)}
            disabled={revealed}
            onPress={() => {
              onChange({ kind: 'index', index: i });
            }}
            style={styles.segment}
          >
            <Text style={styles.segmentText}>{copy(segment.text)}</Text>
          </ToneSurface>
        ))}
      </View>
    </View>
  );
}

export { AnswerCard };

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.lg },
  sentence: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, rowGap: space.sm },
  sentenceText: { ...type.prompt, color: colors.text },
  blank: {
    minWidth: 92,
    minHeight: 38,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  blankFilled: { borderBottomColor: colors.accent },
  blankText: { ...type.prompt, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: TAP_TARGET,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  chipText: { ...type.answer, color: colors.text },
  chipSmall: { paddingHorizontal: space.sm, paddingVertical: 6 },
  chipSmallText: { ...type.small, color: colors.text },
  chipsOver: { zIndex: 2 },
  buckets: { flexDirection: 'row', gap: space.sm, zIndex: 1 },
  bucketSlot: { flex: 1 },
  bucketGlow: {
    position: 'absolute',
    top: -1.5,
    left: -1.5,
    right: -1.5,
    bottom: -1.5,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  bucket: {
    flex: 1,
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: space.sm,
    gap: space.sm,
  },
  bucketOpen: { borderColor: colors.accent, borderStyle: 'solid' },
  bucketTitle: { ...type.small, color: colors.textMuted },
  bucketItems: { gap: space.xs },
  slots: { gap: space.sm },
  slotRow: { flexDirection: 'row', alignItems: 'center', minHeight: TAP_TARGET, paddingHorizontal: space.md, gap: space.md },
  slotNum: { ...type.answer, color: colors.accent, width: 18 },
  slotText: { ...type.answer, color: colors.text, flex: 1 },
  slotEmpty: {
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  slotHint: { ...type.small, color: colors.textFaint },
  segments: { gap: space.sm },
  segment: { minHeight: TAP_TARGET, paddingHorizontal: space.lg, justifyContent: 'center' },
  segmentText: { ...type.answer, color: colors.text },
});
