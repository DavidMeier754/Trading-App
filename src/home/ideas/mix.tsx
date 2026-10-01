import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import {
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Path } from 'react-native-svg';

import { surfaceStyle, useLookSpec } from '../../lesson/look';
import { EASE_OUT } from '../../lesson/motion';
import ProgressBar from '../../lesson/ProgressBar';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, MONO_FONT, space, TAP_TARGET, themed, type } from '../../theme';
import Icon from '../icons';
import type { Suggestion } from './kit';

/**
 * The ideas David was asked about in stage LOOK-BRIEF (2026-09-29): numbers
 * that count up and the step count went into the mix; small caps, letters on
 * the answers and the board-style map did not.
 */
export const MIX: Suggestion[] = [
  {
    id: 'countup',
    section: 'mix',
    icon: 'bolt',
    title: 'Numbers that count up',
    line: 'Lesson complete counts its numbers up.',
    tag: 'in',
    again: 'Play again',
    Preview: CountUp,
  },
  {
    id: 'steps',
    section: 'mix',
    icon: 'levels',
    title: 'Progress bar with a step count',
    line: 'The lesson bar says which screen of how many.',
    tag: 'in',
    Preview: Steps,
  },
  {
    id: 'smallcaps',
    section: 'mix',
    icon: 'book',
    title: 'Labels in small caps',
    line: 'Small labels in spaced capitals.',
    tag: 'out',
    Preview: SmallCaps,
  },
  {
    id: 'keys',
    section: 'mix',
    icon: 'quiz',
    title: 'Answers keyed A to D',
    line: 'Each answer wears a letter.',
    tag: 'out',
    Preview: Keys,
  },
  {
    id: 'board',
    section: 'mix',
    icon: 'learn',
    title: 'Board-style map',
    line: 'The levels as rows on a board instead of the path.',
    tag: 'out',
    Preview: Board,
  },
];

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
      {['1.5 %', '3 %', '6 %'].map((option, i) => (
        <View key={option} style={[surfaceStyle(spec), styles.keyed]}>
          <View style={styles.letter}>
            <Text style={styles.letterText}>{['A', 'B', 'C'][i]}</Text>
          </View>
          <Text style={styles.number}>{option}</Text>
        </View>
      ))}
    </View>
  );
}

/** "+40 XP", counted up from 0 when it appears (at once with reduced motion). */
function CountUp() {
  const to = 40;
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
  muted: { ...type.small, color: colors.textMuted },
  mutedColor: { color: colors.textMuted },
  label: { ...type.label, color: colors.text },
  caps: { textTransform: 'uppercase', letterSpacing: 1.2 },
  pair: { flexDirection: 'row', gap: space.md, alignSelf: 'stretch' },
  half: { flex: 1, gap: space.xs },
  stack: { gap: space.sm, alignSelf: 'stretch' },
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
  counter: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  xp: {
    ...type.display,
    fontSize: 44,
    lineHeight: 52,
    fontFamily: MONO_FONT,
    color: colors.accent,
  },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.md, alignSelf: 'stretch' },
  step: { ...type.label, fontFamily: MONO_FONT, color: colors.textMuted },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  board: { overflow: 'hidden', alignSelf: 'stretch' },
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
