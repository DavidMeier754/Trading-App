import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { tapFeedback } from '../lesson/feedback';
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
              tapFeedback();
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

/** docs/UI.md §4.1 `sort` — 2-3 buckets, chips tapped into them. */
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

  const unplaced = screen.items
    .map((item, i) => ({ item, i }))
    .filter(({ i }) => placed[i] === undefined);

  const toneFor = (i: number): Tone => {
    if (!revealed) return 'idle';
    return placed[i] === screen.items[i].bucket ? 'correct' : 'wrong';
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <View style={styles.chips}>
        {unplaced.map(({ item, i }) => (
          <ToneSurface
            key={item.text}
            tone={pending === i ? 'selected' : 'idle'}
            disabled={revealed}
            onPress={() => {
              tapFeedback();
              setPending((p) => (p === i ? null : i));
            }}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{copy(item.text)}</Text>
          </ToneSurface>
        ))}
      </View>

      <View style={styles.buckets}>
        {screen.buckets.map((bucket) => (
          <Pressable
            accessibilityRole="button"
            key={bucket}
            disabled={revealed || pending === null}
            onPress={() => {
              if (pending === null) return;
              tapFeedback();
              onChange({
                kind: 'buckets',
                placed: { ...placed, [pending]: bucket },
              });
              setPending(null);
            }}
            style={[styles.bucket, pending !== null && !revealed && styles.bucketOpen]}
          >
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
        ))}
      </View>
    </View>
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
  const remaining = screen.items
    .map((text, i) => ({ text, i }))
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
              tapFeedback();
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
              tapFeedback();
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
              tapFeedback();
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
  buckets: { flexDirection: 'row', gap: space.sm },
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
