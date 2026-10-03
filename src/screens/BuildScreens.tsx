import React from 'react';
import { Pressable, Text, View } from 'react-native';

import MiniChart from '../components/MiniChart';
import { copy, count, price } from '../format';
import { type AnswerValue, branchPath } from '../lesson/answers';
import { Arrive, PopIn } from '../lesson/Celebrate';
import { tapFeedback } from '../lesson/feedback';
import { surfaceStyle, tint, useLookSpec } from '../lesson/look';
import type { Tone } from '../lesson/toneTransition';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
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
/** The fields' names as a person reads them; the schema's keys are terse. */
const SLOT_LABEL: Record<string, string> = {
  side: 'Side',
  type: 'Order type',
  qty: 'Share count',
  price: 'Price',
  stop: 'Stop',
  target: 'Target',
  tif: 'Time in force',
  r_risked: 'R risked',
  r_made: 'R made',
};

function slotLabel(slot: string): string {
  const known = SLOT_LABEL[slot];
  if (known) return known;
  const words = copy(slot).replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function SlotBuilder({
  prompt,
  heading,
  slots,
  chips,
  answer,
  value,
  onChange,
  revealed,
}: {
  prompt: string;
  /** A line over the fields: whose ticket this is. */
  heading?: string;
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
        {heading ? <Text style={styles.heading}>{heading}</Text> : null}
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
            <Text style={styles.slotLabel}>{slotLabel(slot)}</Text>
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
            <Text style={{ color: look.accent }}>{slotLabel(active).toLowerCase()}</Text>
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
      ) : slots.every((slot) => filled[slot] === answer[slot]) ? null : (
        <View style={styles.tray}>
          <Text style={styles.trayLabel}>Intended</Text>
          {slots
            .filter((slot) => filled[slot] !== answer[slot])
            .map((slot) => (
              <Text key={slot} style={styles.fixLine}>
                {`${slotLabel(slot)}: `}
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
    <View style={styles.wrap}>
      <Prompt>{props.screen.prompt}</Prompt>
      <OrderTicket {...props} />
    </View>
  );
}

/** A chip as the ticket shows it: words capitalised, prices and counts formatted. */
function chipText(slot: string, chip: string | number): string {
  if (typeof chip === 'number') {
    return slot === 'qty'
      ? count(chip)
      : slot === 'price' || slot === 'stop' || slot === 'target'
        ? price(chip)
        : String(chip);
  }
  const words = copy(chip);
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** What a row is called on the ticket: the price row follows the order type. */
function ticketLabel(slot: string, filled: Record<string, string>): string {
  if (slot === 'qty') return 'Shares';
  if (slot === 'price') {
    const kind = String(filled.type ?? '').toLowerCase();
    return kind === 'limit' ? 'Limit price' : kind === 'stop' ? 'Stop price' : 'Price';
  }
  return slotLabel(slot);
}

const SELL = /^(sell|short)/i;

/**
 * docs/UI.md §4.2 / §6.7 `order-build` [DESIGN-REVIEW] (David approved the
 * real ticket on 2026-10-03): the question drawn as a broker's order ticket.
 * The ticker in the head; a Buy / Sell switch whose chosen half turns green
 * or red; then each other field as a labelled row of segments; and at the
 * bottom the estimated cost once shares and a price are chosen. The slots,
 * chips and grading are the schema's, unchanged: a tap fills a field, a tap
 * on the chosen segment empties it, and Check grades each row on its own.
 */
function OrderTicket({
  screen,
  value,
  onChange,
  revealed,
}: {
  screen: OrderBuild;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) {
  const look = useLookSpec();
  const filled = value.kind === 'slots' ? value.filled : {};
  const set = (slot: string, chip: string) => {
    tapFeedback();
    const next = { ...filled };
    if (next[slot] === chip) delete next[slot];
    else next[slot] = chip;
    onChange({ kind: 'slots', filled: next });
  };
  const qty = Number(filled.qty);
  const px = Number(filled.price);
  const cost =
    filled.qty !== undefined && filled.price !== undefined && qty > 0 && px > 0 ? qty * px : null;

  // Each segment's look: chosen, and after Check right or wrong; the intended
  // segment of a wrong row is outlined in the success colour.
  const segStyle = (slot: string, chip: string, sell = false) => {
    const on = filled[slot] === chip;
    if (revealed) {
      const right = screen.answer[slot] === chip;
      if (on) return right ? styles.segRight : styles.segWrong;
      if (right && filled[slot] !== chip) return styles.segIntended;
      return null;
    }
    if (!on) return null;
    if (slot === 'side') return sell ? styles.segSell : styles.segBuy;
    return { backgroundColor: tint(look.accent, 0.16), borderColor: look.accent };
  };

  return (
    <View style={[styles.ticket, surfaceStyle(look)]}>
      <View style={styles.ticketHead}>
        <Text style={styles.ticketKicker}>Order ticket</Text>
        {screen.ticker ? <Text style={styles.ticketTicker}>{screen.ticker}</Text> : null}
      </View>
      {screen.slots.map((slot) => {
        const chips = (screen.chips[slot] ?? []) as (string | number)[];
        const side = slot === 'side';
        return (
          <View key={slot} style={styles.ticketRow}>
            {side ? null : <Text style={styles.ticketLabel}>{ticketLabel(slot, filled)}</Text>}
            <View
              style={[styles.segments, side && styles.switch]}
              accessibilityRole="radiogroup"
              accessibilityLabel={ticketLabel(slot, filled)}
            >
              {chips.map((raw) => {
                const chip = raw as string;
                const sell = side && SELL.test(String(chip));
                const on = filled[slot] === chip;
                return (
                  <Pressable
                    key={String(chip)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on, disabled: revealed }}
                    disabled={revealed}
                    onPress={() => set(slot, chip)}
                    style={({ pressed }) => [
                      styles.segment,
                      side && styles.switchHalf,
                      segStyle(slot, chip, sell),
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segText,
                        side && styles.switchText,
                        on && side && !revealed && { color: colors.background },
                      ]}
                    >
                      {chipText(slot, raw)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
      {screen.slots.includes('price') && screen.slots.includes('qty') ? (
        <View style={styles.estimate}>
          <Text style={styles.ticketLabel}>Estimated cost</Text>
          <Text style={[styles.estimateValue, cost === null && styles.estimateEmpty]}>
            {cost === null
              ? '—'
              : `≈ ${copy('$')}${count(Math.round(cost))} for ${count(qty)} shares`}
          </Text>
        </View>
      ) : null}
    </View>
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
 * docs/UI.md §4.2 `branch` — choose, see what it meant, choose again. The
 * scenario and its chart stay on screen the whole way: by the second step the
 * learner still needs to see the position they are managing, and the chart
 * walks on a little with each step, on the scale of the whole session so the
 * frame never jumps. Each step carries its own reveal (docs/schema.md: the
 * step's `explanation`), shown as the next step arrives; an option's `next`
 * says which step that is, and the last screen shows the path taken.
 */
export function BranchScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: Branch;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const picks = value.kind === 'branch' ? value.picks : [];
  const look = useLookSpec();
  const { visited, current, done } = branchPath(screen, picks);
  const total = screen.steps.length;

  // The chart shows the session up to the decision, then walks on towards
  // its end a share at a time as the steps go by; the path shown in full.
  const chart = screen.chart;
  const n = chart ? chart.data.length : 0;
  const at = chart?.decision_index ?? n - 1;
  const shown =
    done || revealed
      ? n
      : Math.min(n, at + 1 + Math.round((visited.length * (n - at - 1)) / Math.max(1, total - 1)));
  const chartView = chart ? (
    <MiniChart spec={chart} width={width} height={104} visible={shown} showPrice />
  ) : null;

  // The step row stays at the top through to the end, all steps lit, so the
  // scenario and chart under it do not rise when the path summary replaces the
  // last question.
  const stepRow = (reached: number) => (
    <View style={styles.stepRow}>
      {screen.steps.map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepPip,
            i < reached && { backgroundColor: tint(look.accent, 0.5) },
            i === reached && { backgroundColor: look.accent, width: 28 },
          ]}
        />
      ))}
      <Text style={styles.counter}>
        {reached >= total ? `All ${total} steps` : `Step ${reached + 1} of ${total}`}
      </Text>
    </View>
  );

  if (done || revealed) {
    return (
      <View style={styles.wrap}>
        {stepRow(total)}
        <Text style={styles.scenario}>{copy(screen.scenario)}</Text>
        {chartView}
        <View style={styles.pathList}>
          {visited.map((step, k) => {
            const option = screen.steps[step].options[picks[k]];
            const right = option?.correct === true;
            return (
              <View
                key={k}
                style={[styles.pathStep, { borderColor: right ? colors.success : colors.warning }]}
              >
                <Text style={styles.pathStepNum}>{`Step ${k + 1}`}</Text>
                <Text style={styles.pathStepChoice}>{copy(option?.text ?? '—')}</Text>
                <Text style={styles.pathStepConsequence}>
                  {copy(screen.steps[step].explanation)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  const step = screen.steps[current ?? 0];
  const lastStep = visited.length > 0 ? visited[visited.length - 1] : null;
  const lastRight =
    lastStep !== null && screen.steps[lastStep].options[picks[picks.length - 1]]?.correct === true;

  // A step is a new question, and it has to look like one: the step pill
  // moves on, the last step's reveal arrives as its own card, and the new
  // question slides in from the side -- keyed by step, so it re-enters rather
  // than silently swapping its text.
  return (
    <View style={styles.wrap}>
      {stepRow(visited.length)}
      <Text style={styles.scenario}>{copy(screen.scenario)}</Text>
      {chartView}
      <View>
        <Arrive key={visited.length} from="right" style={styles.stepBody}>
          {lastStep !== null ? (
            <PopIn>
              <View
                style={[
                  styles.consequence,
                  { borderLeftColor: lastRight ? colors.success : colors.warning },
                ]}
              >
                <Text
                  style={[
                    styles.consequenceKicker,
                    { color: lastRight ? colors.success : colors.warning },
                  ]}
                >
                  {lastRight ? 'Right call' : 'Not quite'}
                </Text>
                <Text style={styles.consequenceText}>
                  {copy(screen.steps[lastStep].explanation)}
                </Text>
              </View>
            </PopIn>
          ) : null}
          <Prompt>{step.prompt}</Prompt>
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
    </View>
  );
}

const styles = themed(() => ({
  ticket: { padding: space.md, gap: space.md, borderWidth: 1.5, borderColor: colors.borderStrong },
  ticketHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  ticketKicker: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ticketTicker: { ...type.answer, color: colors.text, fontWeight: '800', letterSpacing: 0.6 },
  ticketRow: { gap: space.xs },
  ticketLabel: { ...type.small, fontSize: 13, color: colors.textMuted },
  segments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  segment: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 72,
    minHeight: TAP_TARGET - 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: space.sm,
  },
  segText: { ...type.body, color: colors.text, fontVariant: ['tabular-nums'] },
  switch: {
    gap: 0,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    padding: 3,
    backgroundColor: colors.background,
  },
  switchHalf: { borderWidth: 0, minHeight: TAP_TARGET - 6, backgroundColor: 'transparent' },
  switchText: { ...type.answer, fontWeight: '700' },
  segBuy: { backgroundColor: colors.up },
  segSell: { backgroundColor: colors.down },
  segRight: { borderWidth: 1.5, borderColor: colors.success, backgroundColor: colors.successTint },
  segWrong: { borderWidth: 1.5, borderColor: colors.down, backgroundColor: colors.downTint },
  segIntended: { borderWidth: 1.5, borderColor: colors.success, borderStyle: 'dashed' },
  estimate: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.sm,
    gap: space.sm,
  },
  estimateValue: {
    ...type.mono,
    color: colors.text,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  estimateEmpty: { ...type.body, color: colors.textFaint },
  wrap: { gap: space.lg },
  slotList: { gap: space.sm },
  heading: { ...type.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
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
  consequenceKicker: {
    ...type.small,
    fontSize: 13,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
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
  pathStepNum: { ...type.small, color: colors.textFaint },
  pathStepChoice: { ...type.answer, color: colors.text },
  pathStepConsequence: { ...type.small, color: colors.textMuted },
}));
