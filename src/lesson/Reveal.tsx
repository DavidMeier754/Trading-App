import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { copy } from '../format';
import { colors, radius, space, type, themed } from '../theme';
import type { Grade } from './answers';
import { Celebrate, PopIn } from './Celebrate';
import DecisionGrid from './DecisionGrid';
import { type DecisionReveal, decisionRevealLabel } from './decisionReveal';
import { isStreakMilestone, pulseAt, STREAK_FROM } from './feedback';
import { useLookSpec } from './look';
import { DURATION, EASE_OUT, RISE, useMotion } from './motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

function toneOf(key: 'correct' | 'amber' | 'wrong') {
  const table = {
    correct: { accent: colors.success, tint: colors.successTint, label: 'Correct' },
    amber: { accent: colors.warning, tint: colors.warningTint, label: 'Reasonable' },
    wrong: { accent: colors.down, tint: colors.downTint, label: 'Not quite' },
  } as const;
  return table[key];
}

/** The mark in the badge, drawn on a 20 x 20 box. */
const MARK = {
  correct: 'M5 10.5 L8.6 14 L15 6.5',
  amber: 'M5.5 10 L14.5 10',
  wrong: 'M6.5 6.5 L13.5 13.5 M13.5 6.5 L6.5 13.5',
} as const;
const MARK_LEN = { correct: 16, amber: 9, wrong: 20 } as const;

/**
 * docs/UI.md §5.1 — the inline reveal, tinted by grade, with the "Show working"
 * toggle on numeric screens.
 *
 * It arrives in three beats rather than one block. The panel rises on a spring
 * -- a lively one after a right answer, a settled one after anything else, so
 * the physics carry the mood before a word is read. The badge pops in and its
 * mark draws itself on the cue's second pulse, the same instant the second
 * note and the second haptic land. Then the words fade up underneath.
 *
 * A run of right answers shows here as "3 in a row", from the third on, and a
 * milestone rings. A run that ends is never mentioned (docs/UI.md §1.6).
 */
export default function Reveal({
  grade,
  lead,
  explanation,
  working,
  extra,
  streak = 0,
  decision,
  fill = false,
}: {
  grade: Grade;
  /** docs/UI.md §5.1: an amber reveal opens with what was right about the choice. */
  lead?: string;
  explanation: string;
  working?: string;
  extra?: React.ReactNode;
  /** Consecutive right answers, this one included. */
  streak?: number;
  /**
   * docs/UI.md §5.1b: a chart decision's reveal names the decision in the chip
   * and reports the outcome under it, smaller, in a neutral box of its own.
   */
  decision?: DecisionReveal;
  /** Fill the height it is given: the words at the top, the outcome at the bottom. */
  fill?: boolean;
}) {
  const tone = toneOf(grade);
  const label = decision ? decision.chip : tone.label;
  const m = useMotion();
  const spec = useLookSpec();
  const [showWorking, setShowWorking] = useState(false);

  const fade = useSharedValue(0);
  const rise = useSharedValue(m.reduced ? 1 : 0);
  const words = useSharedValue(0);
  const mark = useSharedValue(m.reduced ? 1 : 0);

  useEffect(() => {
    // Calm's reveal: the panel fades up a few points (docs/UI.md §10). Reduced
    // motion keeps the fades; only the travel goes.
    const up = { duration: m.fade(DURATION.panel), easing: EASE_OUT };
    fade.set(withTiming(1, up));
    if (!m.reduced) {
      rise.set(withTiming(1, up));
      mark.set(
        withDelay(pulseAt('correct0', 1), withTiming(1, { duration: 260, easing: EASE_OUT })),
      );
    }
    words.set(
      withDelay(m.reduced ? 0 : 120, withTiming(1, { duration: m.fade(380), easing: EASE_OUT })),
    );
  }, [grade, m, fade, rise, words, mark]);

  const travel = m.travel(RISE.reveal);
  const panel = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateY: (1 - rise.get()) * travel }],
  }));
  const wordsStyle = useAnimatedStyle(() => ({
    opacity: words.get(),
    transform: [{ translateY: (1 - words.get()) * (travel / 3) }],
  }));
  const markProps = useAnimatedProps(() => ({
    strokeDashoffset: MARK_LEN[grade] * (1 - mark.get()),
  }));

  const showStreak = grade === 'correct' && streak >= STREAK_FROM;
  const milestone = showStreak && isStreakMilestone(streak);
  const pill = (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{`${streak} in a row`}</Text>
    </View>
  );

  const head = (
    <View style={styles.headRow}>
      <PopIn style={[styles.badge, { backgroundColor: tone.accent }]}>
        <Svg width={20} height={20}>
          <AnimatedPath
            d={MARK[grade]}
            stroke={colors.background}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={`${MARK_LEN[grade]} ${MARK_LEN[grade]}`}
            strokeDashoffset={m.reduced ? 0 : MARK_LEN[grade]}
            animatedProps={markProps}
          />
        </Svg>
      </PopIn>
      <Text style={[styles.head, { color: tone.accent }]}>{label}</Text>
      {showStreak ? (
        <PopIn delay={m.reduced ? 0 : 260} style={styles.pillSlot}>
          {milestone ? (
            <Celebrate radius={radius.pill} color={colors.warning}>
              {pill}
            </Celebrate>
          ) : (
            pill
          )}
        </PopIn>
      ) : null}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.wrap,
        // docs/UI.md §5.1b [DESIGN-REVIEW]: a chart's reveal is compact, so the
        // chart above it keeps the screen.
        decision && styles.wrapCompact,
        fill && styles.fill,
        {
          backgroundColor: tone.tint,
          borderColor: tone.accent,
          borderRadius: Math.max(2, spec.surface.radius),
        },
        panel,
      ]}
      // One announcement in §5.1b's order: the grade, the outcome, the result.
      accessible={decision ? true : undefined}
      accessibilityLabel={decision ? decisionRevealLabel(decision, explanation) : undefined}
    >
      {decision ? (
        // docs/UI.md §5.1b [DESIGN-REVIEW]: the grade and its line on the left,
        // the decision grid beside them, so the outcome box below can run the
        // full width and the chart above keeps the room.
        <View style={styles.decisionTop}>
          <View style={styles.decisionHead}>
            {head}
            <Animated.Text
              style={[styles.lead, styles.leadCompact, { color: tone.accent }, wordsStyle]}
            >
              {copy(decision.lead)}
            </Animated.Text>
          </View>
          <DecisionGrid cell={decision.cell} />
        </View>
      ) : (
        head
      )}
      <Animated.View
        style={[styles.words, decision && styles.wordsCompact, fill && styles.fill, wordsStyle]}
      >
        {lead && !decision ? (
          <Text style={[styles.lead, { color: tone.accent }]}>{copy(lead)}</Text>
        ) : null}
        <Text style={[styles.body, decision && styles.bodyCompact]}>{copy(explanation)}</Text>
        {fill ? <View style={styles.fill} /> : null}
        {decision ? <DecisionOutcome decision={decision} /> : null}
        {extra}
        {working ? (
          <View style={styles.workingWrap}>
            <Pressable
              onPress={() => setShowWorking((v) => !v)}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text style={[styles.toggle, { color: tone.accent }]}>
                {showWorking ? 'Hide working' : 'Show working'}
              </Text>
            </Pressable>
            {showWorking ? <Text style={styles.working}>{copy(working)}</Text> : null}
          </View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

/**
 * The outcome, under the grade and smaller than it (docs/UI.md §5.1b): the
 * level file's sentence, then the result line with the share count. The line
 * takes its sign's colour but sits in a neutral box, so it never reads as the
 * verdict; standing aside shows the "would have" in grey. A right call that
 * lost gets the line that joins the two.
 */
function DecisionOutcome({ decision }: { decision: DecisionReveal }) {
  const color =
    decision.tone === 'up'
      ? colors.up
      : decision.tone === 'down'
        ? colors.down
        : decision.tone === 'flat'
          ? colors.text
          : colors.textMuted;
  return (
    <>
      <View style={styles.outcomeBox}>
        <Text style={styles.outcomeText}>{copy(decision.outcome)}</Text>
        <Text style={[styles.resultText, { color }]}>{copy(decision.result)}</Text>
      </View>
      {decision.variance ? <Text style={styles.variance}>{copy(decision.variance)}</Text> : null}
    </>
  );
}

/**
 * How tall a verdict card will be, before there is a verdict: the card's own
 * padding, head row and words, laid out once and invisibly. For a screen that
 * has to keep room for a verdict it has not had yet (ChartDecisionScreen) --
 * a guess at it was a correct answer's card, and a wrong answer's, a lead line
 * taller, then overflowed the screen the moment it landed.
 */
export function RevealProbe({
  lead,
  explanation,
  working = false,
  decision,
  onHeight,
}: {
  lead?: string;
  explanation: string;
  /** The verdict will carry a "Show working" line. */
  working?: boolean;
  /** A chart decision's outcome block, at its tallest (decisionReveal.ts). */
  decision?: DecisionReveal;
  onHeight: (height: number) => void;
}) {
  return (
    // Hidden from screen readers on every platform: it holds the verdict's
    // words before there is a verdict (review M6). `aria-hidden` is the one a
    // browser honours; the other two are the native ones.
    <View
      pointerEvents="none"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, decision && styles.wrapCompact, styles.probe]}
      onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
    >
      {decision ? (
        <View style={styles.decisionTop}>
          <View style={styles.decisionHead}>
            <View style={styles.probeHead} />
            <Text style={[styles.lead, styles.leadCompact]}>{copy(decision.lead)}</Text>
          </View>
          <DecisionGrid />
        </View>
      ) : (
        <View style={styles.probeHead} />
      )}
      <View style={[styles.words, decision && styles.wordsCompact]}>
        {lead && !decision ? <Text style={styles.lead}>{copy(lead)}</Text> : null}
        <Text style={[styles.body, decision && styles.bodyCompact]}>{copy(explanation)}</Text>
        {decision ? <DecisionOutcome decision={decision} /> : null}
        {working ? <Text style={styles.toggle}>Show working</Text> : null}
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.lg,
    gap: space.sm,
  },
  fill: { flexGrow: 1 },
  wrapCompact: { paddingHorizontal: space.md, paddingVertical: space.md, gap: space.xs },
  wordsCompact: { gap: space.xs },
  leadCompact: { ...type.body, fontWeight: '600' },
  bodyCompact: { ...type.body, fontSize: 16, lineHeight: 22 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: { ...type.label, textTransform: 'uppercase', letterSpacing: 0.6 },
  pillSlot: { marginLeft: 'auto' },
  pill: {
    borderRadius: radius.pill,
    backgroundColor: colors.warningTint,
    borderColor: colors.warning,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  pillText: { ...type.small, color: colors.warning, fontWeight: '700' },
  words: { gap: space.sm },
  lead: { ...type.answer },
  body: { ...type.body, color: colors.text },
  workingWrap: { gap: space.xs },
  toggle: { ...type.label },
  decisionTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  decisionHead: { flex: 1, gap: space.xs },
  outcomeBox: {
    marginTop: space.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    gap: 2,
  },
  // docs/UI.md §10: nothing a learner reads to judge the trade goes below 13 pt.
  outcomeText: { ...type.label, fontWeight: '400', color: colors.textMuted },
  resultText: { ...type.label, fontWeight: '700', fontVariant: ['tabular-nums'] },
  variance: { ...type.label, fontWeight: '500', color: colors.text },
  probe: { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 },
  probeHead: { height: 24 },
  working: {
    ...type.mono,
    color: colors.textMuted,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
}));
