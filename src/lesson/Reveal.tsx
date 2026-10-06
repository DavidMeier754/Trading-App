import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { copy } from '../format';
import NumberText from '../components/NumberText';
import { colors, radius, space, type, themed } from '../theme';
import type { Grade } from './answers';
import { Celebrate, PopIn } from './Celebrate';
import DecisionGrid from './DecisionGrid';
import { type DecisionReveal, decisionRevealLabel, type LogRow } from './decisionReveal';
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
 * docs/ui/06-reveal-and-hearts.md §5.1 — the inline reveal, tinted by grade, with the "Show working"
 * toggle on numeric screens.
 *
 * It arrives in three beats rather than one block. The panel rises on a spring
 * -- a lively one after a right answer, a settled one after anything else, so
 * the physics carry the mood before a word is read. The badge pops in and its
 * mark draws itself on the cue's second pulse, the same instant the second
 * note and the second haptic land. Then the words fade up underneath.
 *
 * A run of right answers shows here as "3 in a row", from the third on, and a
 * milestone rings. A run that ends is never mentioned (docs/ui/01-design-principles.md §1.6).
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
  /** docs/ui/06-reveal-and-hearts.md §5.1: an amber reveal opens with what was right about the choice. */
  lead?: string;
  explanation: string;
  working?: string;
  extra?: React.ReactNode;
  /** Consecutive right answers, this one included. */
  streak?: number;
  /**
   * docs/ui/06-reveal-and-hearts.md §5.1b: a chart decision's reveal names the decision in the chip
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
    // Calm's reveal: the panel fades up a few points (docs/ui/15-theming-and-accessibility.md §10). Reduced
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
        // docs/ui/06-reveal-and-hearts.md §5.1b [DESIGN-REVIEW]: a chart's reveal is compact, so the
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
        // docs/ui/06-reveal-and-hearts.md §5.1b [DESIGN-REVIEW]: the grade and its line on the left,
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
        {/* docs/ui/06-reveal-and-hearts.md §5.1b [David, 2026-10-06: "the reveal box is way too big
            and unordered"]: a chart decision's reveal reads top to bottom --
            the verdict, the trade log, then why. */}
        {decision ? <DecisionOutcome decision={decision} /> : null}
        <Text style={[styles.body, decision && styles.bodyCompact]}>{copy(explanation)}</Text>
        {fill && !decision ? <View style={styles.fill} /> : null}
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
 * The trade log, under the grade and smaller than it (docs/ui/06-reveal-and-hearts.md §5.1b; Precise's
 * log from LOOK-BRIEF): how the trade ended, the result with the share count,
 * and R once R is taught -- each a name on the left and its value on the right
 * in the number face, so the numbers line up, between two hairlines. Only the
 * values take their sign's colour, so it never reads as the verdict; standing
 * aside shows the "would have" in grey. The level file's outcome sentence is
 * not drawn (David, 2026-10-06: the box was "way too big"); a screen reader
 * still hears it (decisionRevealLabel). A right call that lost gets the line
 * that joins the two.
 */
function DecisionOutcome({ decision }: { decision: DecisionReveal }) {
  const colorOf = (tone: LogRow['tone']) =>
    tone === 'up'
      ? colors.up
      : tone === 'down'
        ? colors.down
        : tone === 'flat' || tone === 'plain'
          ? colors.text
          : colors.textMuted;
  return (
    <>
      <View style={styles.log}>
        {decision.log.map((row) => (
          <View key={row.label} style={styles.logRow}>
            <Text style={styles.logLabel}>{row.label}</Text>
            <NumberText style={[styles.logValue, { color: colorOf(row.tone) }]}>
              {copy(row.value)}
            </NumberText>
          </View>
        ))}
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
        {decision ? <DecisionOutcome decision={decision} /> : null}
        <Text style={[styles.body, decision && styles.bodyCompact]}>{copy(explanation)}</Text>
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
  bodyCompact: { ...type.body, fontSize: 15, lineHeight: 21 },
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
  log: {
    marginVertical: 2,
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    gap: 1,
  },
  logRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  // The name keeps its width; a long value wraps under itself instead.
  logLabel: { ...type.label, fontWeight: '400', color: colors.textMuted, flexShrink: 0 },
  logValue: {
    ...type.label,
    fontWeight: '700',
    flexShrink: 1,
    marginLeft: 'auto',
    textAlign: 'right',
  },
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
