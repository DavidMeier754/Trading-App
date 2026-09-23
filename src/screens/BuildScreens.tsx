import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../format';
import type { AnswerValue } from '../lesson/answers';
import { Arrive, PopIn } from '../lesson/Celebrate';
import { tapFeedback } from '../lesson/feedback';
import { surfaceStyle, tint, useLookSpec } from '../lesson/look';
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
  const look = useLookSpec();

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
        // The choices for the field being filled. They are buttons and look it:
        // raised keys in the look's accent, arriving together whenever the
        // field changes, so the tray visibly answers the tap above it.
        <View style={[styles.tray, surfaceStyle(look)]}>
          <Text style={styles.trayLabel}>
            {'Pick the '}
            <Text style={{ color: look.accent }}>{copy(active).toLowerCase()}</Text>
          </Text>
          <View key={active} style={styles.chips}>
            {(chips[active] ?? []).map((chip, i) => {
              const on = filled[active] === chip;
              return (
                <PopIn key={chip} delay={i * 45}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      tapFeedback();
                      // The chip already in the field takes it back out.
                      if (on) {
                        const next = { ...filled };
                        delete next[active];
                        onChange({ kind: 'slots', filled: next });
                        return;
                      }
                      const next = { ...filled, [active]: chip };
                      onChange({ kind: 'slots', filled: next });
                      const remaining = slots.find((s) => next[s] === undefined);
                      if (remaining) setActive(remaining);
                    }}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        borderColor: tint(look.accent, 0.55),
                        backgroundColor: tint(look.accent, 0.14),
                        borderBottomColor: tint(look.accent, 0.8),
                        borderRadius: Math.max(6, Math.min(look.surface.radius, 14)),
                      },
                      on && { backgroundColor: look.accent, borderColor: look.accent },
                      pressed && { transform: [{ translateY: 2 }], borderBottomWidth: 1.5 },
                    ]}
                  >
                    <Text style={[styles.chipText, on && { color: look.accentText }]}>{chip}</Text>
                  </Pressable>
                </PopIn>
              );
            })}
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
  const look = useLookSpec();
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

  // A step is a new question, and it has to look like one: the step pill
  // moves on, what your last choice led to arrives as its own card, and the
  // new question slides in from the side -- keyed by step, so it re-enters
  // rather than silently swapping its text.
  return (
    <View style={styles.wrap}>
      <View style={styles.stepRow}>
        {screen.steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepPip,
              i < stepIndex && { backgroundColor: tint(look.accent, 0.5) },
              i === stepIndex && { backgroundColor: look.accent, width: 28 },
            ]}
          />
        ))}
        <Text style={styles.counter}>{`Step ${stepIndex + 1} of ${screen.steps.length}`}</Text>
      </View>
      {/* The scenario has to stay on screen: by step 2 the learner still needs to
          know what position they are managing. */}
      <Text style={styles.scenario}>{copy(screen.prompt)}</Text>
      <Arrive key={stepIndex} from="right" style={styles.stepBody}>
        {previous ? (
          <PopIn>
            <View style={[styles.consequence, { borderLeftColor: look.accent }]}>
              <Text style={styles.consequenceKicker}>What happened</Text>
              <Text style={styles.consequenceText}>{copy(previous.consequence)}</Text>
            </View>
          </PopIn>
        ) : null}
        <Prompt>{step.text}</Prompt>
        <View style={styles.options}>
          {step.options.map((option, i) => (
            <ToneSurface
              key={option.text}
              tone="idle"
              onPress={() => {
                onChange({ kind: 'branch', picks: [...picks, i] });
              }}
              style={styles.option}
            >
              <Text style={styles.optionText}>{copy(option.text)}</Text>
            </ToneSurface>
          ))}
        </View>
      </Arrive>
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
  trayLabel: { ...type.label, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: TAP_TARGET,
    paddingHorizontal: space.lg,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { ...type.answer, color: colors.text, fontWeight: '600' },
  fixLine: { ...type.small, color: colors.textMuted },
  counter: { ...type.label, color: colors.textMuted, marginLeft: space.xs },
  scenario: { ...type.small, color: colors.textMuted },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepPip: { width: 14, height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt },
  stepBody: { gap: space.lg },
  consequence: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: space.md,
    gap: 2,
  },
  consequenceKicker: { ...type.small, fontSize: 11, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 },
  consequenceText: { ...type.body, color: colors.text },
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
