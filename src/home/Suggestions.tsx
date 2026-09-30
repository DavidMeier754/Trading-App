import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Path } from 'react-native-svg';

import { tapFeedback } from '../lesson/feedback';
import { surfaceStyle, useLookSpec } from '../lesson/look';
import { EASE_OUT } from '../lesson/motion';
import ProgressBar from '../lesson/ProgressBar';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, MONO_FONT, radius, space, TAP_TARGET, themed, type } from '../theme';
import Icon from './icons';
import { PageHeader, pageStyles, useBackButton, useSlideIn } from './pageParts';

/**
 * Settings → Development → Design suggestions (David, stage LOOK-BRIEF: "add
 * another development page where you show design suggestions like the ones you
 * asked me about"). Each idea is drawn live, in the design in use, and marked
 * in the mix or not. New ideas are shown here before they go in.
 */

export type Idea = {
  id: 'smallcaps' | 'keys' | 'countup' | 'steps' | 'board';
  title: string;
  line: string;
  inMix: boolean;
};

/** David's answers of 2026-09-29: numbers that count up and the step count are in. */
export const IDEAS: Idea[] = [
  {
    id: 'smallcaps',
    title: 'Labels in small caps',
    line: 'Small labels in spaced capitals.',
    inMix: false,
  },
  { id: 'keys', title: 'Answers keyed A to D', line: 'Each answer wears a letter.', inMix: false },
  {
    id: 'countup',
    title: 'Numbers that count up',
    line: 'Lesson complete counts its numbers up.',
    inMix: true,
  },
  {
    id: 'steps',
    title: 'Progress bar with a step count',
    line: 'The lesson bar says which screen of how many.',
    inMix: true,
  },
  {
    id: 'board',
    title: 'Board-style map',
    line: 'The levels as rows on a board instead of the path.',
    inMix: false,
  },
];

export default function Suggestions({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  useBackButton(onBack);
  const enter = useSlideIn();
  return (
    <Animated.View style={[pageStyles.wrap, enter]}>
      <PageHeader title="Design suggestions" top={insets.top} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[pageStyles.content, { paddingBottom: insets.bottom + space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>Ideas for the look, tried here first.</Text>
        {IDEAS.map((idea) => (
          <Card key={idea.id} idea={idea} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function Card({ idea }: { idea: Idea }) {
  const spec = useLookSpec();
  return (
    <View style={[surfaceStyle(spec), styles.card]}>
      <View style={styles.cardHead}>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{idea.title}</Text>
          <Text style={styles.muted}>{idea.line}</Text>
        </View>
        <View style={[styles.tag, idea.inMix ? styles.tagIn : styles.tagOut]}>
          <Text style={idea.inMix ? styles.tagInText : styles.muted} numberOfLines={1}>
            {idea.inMix ? 'In your mix' : 'Not in your mix'}
          </Text>
        </View>
      </View>
      <Sample id={idea.id} />
    </View>
  );
}

function Sample({ id }: { id: Idea['id'] }) {
  if (id === 'smallcaps') return <SmallCaps />;
  if (id === 'keys') return <Keys />;
  if (id === 'countup') return <CountUp />;
  if (id === 'steps') return <Steps />;
  return <Board />;
}

function SmallCaps() {
  return (
    <View style={styles.pair}>
      <View style={styles.half}>
        <Text style={styles.muted}>Now</Text>
        <Text style={styles.label}>Lesson 2 of 4</Text>
      </View>
      <View style={styles.half}>
        <Text style={styles.muted}>Small caps</Text>
        <Text style={[styles.label, styles.caps]}>Lesson 2 of 4</Text>
      </View>
    </View>
  );
}

function Keys() {
  const spec = useLookSpec();
  return (
    <View style={styles.stack}>
      {['1.5 %', '3 %'].map((option, i) => (
        <View key={option} style={[surfaceStyle(spec), styles.keyed]}>
          <View style={styles.letter}>
            <Text style={styles.letterText}>{['A', 'B'][i]}</Text>
          </View>
          <Text style={styles.number}>{option}</Text>
        </View>
      ))}
    </View>
  );
}

function CountUp() {
  const [run, setRun] = useState(0);
  return (
    <View style={styles.between}>
      <Counter key={run} to={40} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Count again"
        onPressIn={tapFeedback}
        onPress={() => setRun((r) => r + 1)}
        style={styles.again}
      >
        <Icon name="reset" size={16} color={colors.accent} />
        <Text style={styles.againText}>Again</Text>
      </Pressable>
    </View>
  );
}

/** "+40 XP", counted up from 0 when it appears (at once with reduced motion). */
function Counter({ to }: { to: number }) {
  const reduced = useReduceMotion();
  const [shown, setShown] = useState(reduced ? to : 0);
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withDelay(150, withTiming(1, { duration: 700, easing: EASE_OUT })));
  }, [reduced, t]);
  const onValue = useCallback((v: number) => setShown(v), []);
  useAnimatedReaction(
    () => Math.round(to * t.get()),
    (v, prev) => {
      if (v !== prev) scheduleOnRN(onValue, v);
    },
    [to, onValue],
  );
  return (
    <View style={styles.counter}>
      <Text style={styles.xp}>{`+${shown}`}</Text>
      <Text style={styles.muted}>XP</Text>
    </View>
  );
}

function Steps() {
  return (
    <View style={styles.bar}>
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Path
          d="M3.5 3.5l11 11M14.5 3.5l-11 11"
          stroke={colors.textMuted}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </Svg>
      <ProgressBar progress={4 / 12} steps={12} />
      <Text style={styles.step}>4/12</Text>
      <View style={styles.hearts}>
        <Icon name="heart" size={16} color={colors.down} filled />
        <Text style={styles.step}>5</Text>
      </View>
    </View>
  );
}

function Board() {
  const spec = useLookSpec();
  const rows: { n: number; title: string; state: 'done' | 'current' | 'locked' }[] = [
    { n: 5, title: 'Practice: Volume', state: 'done' },
    { n: 6, title: 'Candle Signals', state: 'current' },
    { n: 7, title: 'Confluence', state: 'locked' },
  ];
  return (
    <View style={[surfaceStyle(spec), styles.board]}>
      {rows.map((r, i) => (
        <View
          key={r.n}
          style={[
            styles.boardRow,
            i > 0 && styles.boardRule,
            r.state === 'current' && { backgroundColor: colors.accentTint },
          ]}
        >
          <Text style={styles.boardNum}>{`L${r.n}`}</Text>
          <Text
            style={[styles.label, styles.boardTitle, r.state === 'locked' && styles.mutedColor]}
            numberOfLines={1}
          >
            {r.title}
          </Text>
          {r.state === 'current' ? (
            // Drawn, not pressable: a picture of the key, in the look's colours.
            <View
              style={[
                styles.miniKey,
                { backgroundColor: spec.cta.face, borderRadius: Math.min(spec.cta.radius, 18) },
              ]}
            >
              <Text style={[styles.label, { color: spec.cta.text }]}>Continue</Text>
            </View>
          ) : (
            <Text style={[styles.muted, r.state === 'done' && { color: colors.success }]}>
              {r.state === 'done' ? 'Done' : 'Locked'}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = themed(() => ({
  intro: { ...type.small, color: colors.textMuted },
  card: { padding: space.md, gap: space.md },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { ...type.answer, fontWeight: '700', color: colors.text },
  muted: { ...type.small, color: colors.textMuted },
  mutedColor: { color: colors.textMuted },
  tag: { borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 3 },
  tagIn: { backgroundColor: colors.successFill },
  tagOut: { borderWidth: 1, borderColor: colors.borderStrong },
  tagInText: { ...type.small, color: colors.successText, fontWeight: '700' },
  label: { ...type.label, color: colors.text },
  caps: { textTransform: 'uppercase', letterSpacing: 1.2 },
  pair: { flexDirection: 'row', gap: space.md },
  half: { flex: 1, gap: space.xs },
  stack: { gap: space.sm },
  keyed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: TAP_TARGET,
    paddingHorizontal: space.md,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { ...type.label, color: colors.textMuted },
  number: { ...type.answer, fontFamily: MONO_FONT, color: colors.text },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  again: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TAP_TARGET,
    minWidth: TAP_TARGET,
    paddingHorizontal: space.sm,
  },
  againText: { ...type.label, color: colors.accent },
  counter: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  xp: { ...type.display, fontFamily: MONO_FONT, color: colors.accent },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  step: { ...type.label, fontFamily: MONO_FONT, color: colors.textMuted },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  board: { overflow: 'hidden' },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.sm,
  },
  boardRule: { borderTopWidth: 1, borderTopColor: colors.border },
  boardNum: { ...type.small, fontFamily: MONO_FONT, color: colors.textMuted },
  boardTitle: { flex: 1 },
  miniKey: {
    height: 36,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
