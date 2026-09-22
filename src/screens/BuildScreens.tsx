import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { tapFeedback } from '../lesson/feedback';
import type { Tone } from '../lesson/toneTransition';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type {
  BranchScreen as Branch,
  JournalRowScreen as JournalRow,
  OrderBuildScreen as OrderBuild,
} from '../types';
import { Prompt, ToneSurface } from './common';

/**
 * docs/UI.md §4.2 `order-build` and `journal-row` are the same interaction with
 * different labels: a row of named slots, a chip tray per slot, and a reveal
 * that grades each slot on its own. One component serves both.
 */
function SlotBuilder({
  prompt,
  slots,
  chips,
  answer,
  value,
  onChange,
  revealed,
}: {
  prompt: string;
  slots: string[];
  chips: Record<string, string[]>;
  answer: Record<string, string>;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const filled = value.kind === 'slots' ? value.filled : {};
  const [active, setActive] = React.useState<string>(slots[0]);

  const toneFor = (slot: string): Tone => {
    if (!revealed) {
      if (active === slot) return 'selected';
      return filled[slot] ? 'idle' : 'idle';
    }
    return filled[slot] === answer[slot] ? 'correct' : 'wrong';
  };

  return (
    <View style={styles.wrap}>
      <Prompt>{prompt}</Prompt>

      <View style={styles.slotList}>
        {slots.map((slot) => (
          <ToneSurface
            key={slot}
            tone={toneFor(slot)}
            disabled={revealed}
            onPress={() => {
              tapFeedback();
              setActive(slot);
            }}
            style={styles.slot}
          >
            <Text style={styles.slotLabel}>{copy(slot)}</Text>
            <Text style={[styles.slotValue, !filled[slot] && styles.slotEmpty]}>
              {filled[slot] ?? 'tap to fill'}
            </Text>
          </ToneSurface>
        ))}
      </View>

      {!revealed ? (
        <View style={styles.tray}>
          <Text style={styles.trayLabel}>{copy(active)}</Text>
          <View style={styles.chips}>
            {(chips[active] ?? []).map((chip) => (
              <Pressable
                accessibilityRole="button"
                key={chip}
                onPress={() => {
                  tapFeedback();
                  const next = { ...filled, [active]: chip };
                  onChange({ kind: 'slots', filled: next });
                  const remaining = slots.find((s) => next[s] === undefined);
                  if (remaining) setActive(remaining);
                }}
                style={[styles.chip, filled[active] === chip && styles.chipOn]}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.tray}>
          <Text style={styles.trayLabel}>Intended</Text>
          {slots
            .filter((slot) => filled[slot] !== answer[slot])
            .map((slot) => (
              <Text key={slot} style={styles.fixLine}>
                {`${copy(slot)}: `}
                <Text style={{ color: colors.success }}>{answer[slot]}</Text>
              </Text>
            ))}
        </View>
      )}
    </View>
  );
}

export function OrderBuildScreen(props: {
  screen: OrderBuild;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  return (
    <SlotBuilder
      prompt={props.screen.prompt}
      slots={props.screen.slots}
      chips={props.screen.chips}
      answer={props.screen.answer}
      value={props.value}
      onChange={props.onChange}
      revealed={props.revealed}
    />
  );
}

export function JournalRowScreen(props: {
  screen: JournalRow;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  return (
    <SlotBuilder
      prompt={props.screen.prompt}
      slots={props.screen.slots}
      chips={props.screen.chips}
      answer={props.screen.answer}
      value={props.value}
      onChange={props.onChange}
      revealed={props.revealed}
    />
  );
}

/**
 * docs/UI.md §4.2 `branch` — choose, see the consequence, choose again. Each
 * step carries its own reveal; the last screen shows the path taken. Counts as
 * one screen per step, so the cursor lives here.
 */
export function BranchScreen({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: Branch;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const picks = value.kind === 'branch' ? value.picks : [];
  const stepIndex = Math.min(picks.length, screen.steps.length - 1);
  const step = screen.steps[stepIndex];
  const done = picks.length >= screen.steps.length;

  if (done || revealed) {
    return (
      <View style={styles.wrap}>
        <Prompt>{screen.prompt}</Prompt>
        <View style={styles.pathList}>
          {screen.steps.map((s, i) => {
            const option = s.options[picks[i]];
            const right = option?.correct === true;
            return (
              <View
                key={i}
                style={[
                  styles.pathStep,
                  { borderColor: right ? colors.success : colors.warning },
                ]}
              >
                <Text style={styles.pathStepNum}>{`Step ${i + 1}`}</Text>
                <Text style={styles.pathStepChoice}>{copy(option?.text ?? '—')}</Text>
                <Text style={styles.pathStepConsequence}>
                  {copy(option?.consequence ?? '')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  const previous = picks.length > 0 ? screen.steps[picks.length - 1].options[picks[picks.length - 1]] : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.counter}>{`Step ${stepIndex + 1} of ${screen.steps.length}`}</Text>
      {/* The scenario has to stay on screen: by step 2 the learner still needs to
          know what position they are managing. */}
      <Text style={styles.scenario}>{copy(screen.prompt)}</Text>
      {previous ? (
        <View style={styles.consequence}>
          <Text style={styles.consequenceText}>{copy(previous.consequence)}</Text>
        </View>
      ) : null}
      <Prompt>{step.text}</Prompt>
      <View style={styles.options}>
        {step.options.map((option, i) => (
          <ToneSurface
            key={option.text}
            tone="idle"
            onPress={() => {
              tapFeedback();
              onChange({ kind: 'branch', picks: [...picks, i] });
            }}
            style={styles.option}
          >
            <Text style={styles.optionText}>{copy(option.text)}</Text>
          </ToneSurface>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.lg },
  slotList: { gap: space.sm },
  slot: {
    minHeight: TAP_TARGET,
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  slotLabel: { ...type.small, color: colors.textMuted },
  slotValue: { ...type.answer, color: colors.text },
  slotEmpty: { color: colors.textFaint },
  tray: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.sm,
  },
  trayLabel: { ...type.small, color: colors.textMuted, textTransform: 'capitalize' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: TAP_TARGET - 8,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  chipText: { ...type.answer, color: colors.text },
  fixLine: { ...type.small, color: colors.textMuted },
  counter: { ...type.label, color: colors.textMuted },
  scenario: { ...type.small, color: colors.textMuted },
  consequence: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: space.md,
  },
  consequenceText: { ...type.body, color: colors.textMuted },
  options: { gap: space.sm },
  option: { minHeight: TAP_TARGET, paddingHorizontal: space.lg, justifyContent: 'center' },
  optionText: { ...type.answer, color: colors.text },
  pathList: { gap: space.sm },
  pathStep: {
    borderLeftWidth: 3,
    borderColor: colors.success,
    paddingLeft: space.md,
    gap: 2,
  },
  pathStepNum: { ...type.small, fontSize: 10, color: colors.textFaint },
  pathStepChoice: { ...type.answer, color: colors.text },
  pathStepConsequence: { ...type.small, color: colors.textMuted },
});
