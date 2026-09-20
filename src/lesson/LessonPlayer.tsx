import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DecisionButtons, { DECISION_LABEL } from '../components/DecisionButtons';
import ChartDecisionScreen, {
  DecisionPhase,
} from '../screens/ChartDecisionScreen';
import ExampleScreen from '../screens/ExampleScreen';
import FillTilesScreen from '../screens/FillTilesScreen';
import IntroScreen from '../screens/IntroScreen';
import MatchScreen from '../screens/MatchScreen';
import McScreen from '../screens/McScreen';
import NumericInputScreen from '../screens/NumericInputScreen';
import TfScreen from '../screens/TfScreen';
import TheoryScreen from '../screens/TheoryScreen';
import { colors, space, type } from '../theme';
import type { Level, QuestionScreen, Screen } from '../types';
import { isQuestion } from '../types';
import type { AnswerValue, Grade } from './answers';
import { canCheck, decisionButtons, emptyValue, grade as gradeAnswer } from './answers';
import Cta from './Cta';
import { revealHaptic } from './haptics';
import ProgressBar from './ProgressBar';
import QuitSheet from './QuitSheet';
import Reveal from './Reveal';
import Summary from './Summary';
import { useReduceMotion } from './useReduceMotion';

export default function LessonPlayer({
  level,
  contentWidth,
}: {
  level: Level;
  contentWidth: number;
}) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReduceMotion();
  const screens = level.screens;

  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<(AnswerValue | null)[]>(() =>
    screens.map(emptyValue)
  );
  const [revealed, setRevealed] = useState<boolean[]>(() => screens.map(() => false));
  const [grades, setGrades] = useState<(Grade | null)[]>(() => screens.map(() => null));
  const [decisionPhase, setDecisionPhase] = useState<DecisionPhase>('deciding');
  const [quitOpen, setQuitOpen] = useState(false);
  const [runKey, setRunKey] = useState(0);

  // A screen change is a beat, not a cut: the outgoing screen fades and slides
  // left, the incoming one arrives from the right while the progress bar fills.
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const lastAdvance = useRef(0);


  const atSummary = index >= screens.length;
  const screen = atSummary ? null : screens[index];
  const value = atSummary ? null : values[index];
  const isRevealed = atSummary ? false : revealed[index];
  const isLast = index === screens.length - 1;

  const reset = useCallback(() => {
    setIndex(0);
    setValues(screens.map(emptyValue));
    setRevealed(screens.map(() => false));
    setGrades(screens.map(() => null));
    setDecisionPhase('deciding');
    setRunKey((k) => k + 1);
    fade.setValue(1);
    slide.setValue(0);
    lastAdvance.current = 0;
  }, [screens, fade, slide]);

  const doReveal = useCallback(() => {
    if (!screen || !isQuestion(screen) || !value) return;
    const g = gradeAnswer(screen as QuestionScreen, value);
    setGrades((prev) => prev.map((x, i) => (i === index ? g : x)));
    setRevealed((prev) => prev.map((x, i) => (i === index ? true : x)));
    // docs/UI.md §5.1: light haptic on correct and amber, medium on wrong.
    revealHaptic(g);
  }, [screen, value, index]);

  // docs/UI.md §4.1: `tf` reveals instantly on tap, with no Check step.
  useEffect(() => {
    if (!screen || screen.type !== 'tf' || isRevealed) return;
    if (value?.kind === 'bool' && value.value !== null) doReveal();
  }, [screen, value, isRevealed, doReveal]);

  // docs/UI.md §4.3: the reveal for a chart-decision waits for the playback to finish.
  useEffect(() => {
    if (!screen || screen.type !== 'chart-decision' || isRevealed) return;
    if (decisionPhase === 'done') doReveal();
  }, [screen, decisionPhase, isRevealed, doReveal]);

  useEffect(() => {
    setDecisionPhase('deciding');
  }, [index]);

  const setValue = (next: AnswerValue) =>
    setValues((prev) => prev.map((v, i) => (i === index ? next : v)));

  // The incoming screen is what gets the beat: it arrives from the right and
  // fades up while the progress bar fills underneath it. Fading the outgoing
  // screen out first would buy nothing but a blank frame between two screens.
  useEffect(() => {
    fade.setValue(reducedMotion ? 1 : 0);
    slide.setValue(reducedMotion ? 0 : 22);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: reducedMotion ? 0 : 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: reducedMotion ? 0 : 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, runKey, reducedMotion, fade, slide]);

  const advance = () => {
    // A double tap on the CTA should not skip a screen.
    const now = Date.now();
    if (now - lastAdvance.current < 280) return;
    lastAdvance.current = now;
    setIndex((i) => i + 1);
  };

  const ctaLabel = useMemo(() => {
    if (!screen) return 'Play again';
    if (!isQuestion(screen)) return isLast ? 'Finish' : 'Continue';
    if (!isRevealed) return 'Check';
    return isLast ? 'Finish' : 'Got it';
  }, [screen, isLast, isRevealed]);

  // docs/UI.md §6.4: the decision buttons occupy the CTA slot until the outcome lands.
  const showDecisionButtons =
    !!screen &&
    screen.type === 'chart-decision' &&
    decisionPhase === 'deciding' &&
    !isRevealed;

  const ctaHidden =
    !!screen && screen.type === 'chart-decision' && !isRevealed;

  const ctaDisabled =
    !!screen &&
    isQuestion(screen) &&
    !isRevealed &&
    !(value && canCheck(screen as QuestionScreen, value));

  const onCta = () => {
    if (!screen) {
      reset();
      return;
    }
    if (isQuestion(screen) && !isRevealed) {
      doReveal();
      return;
    }
    advance();
  };

  const g = atSummary ? null : grades[index];

  const revealLead = useMemo(() => {
    if (!screen || screen.type !== 'chart-decision' || !g || g === 'correct') return undefined;
    const best = DECISION_LABEL[screen.best] ?? screen.best;
    return g === 'amber'
      ? `Standing aside costs nothing here. The better call was ${best}.`
      : `The better call was ${best}.`;
  }, [screen, g]);

  const working =
    screen && (screen.type === 'numeric-mc' || screen.type === 'numeric-input')
      ? screen.working
      : undefined;

  const progress = atSummary ? 1 : index / screens.length;

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close lesson"
          onPress={() => setQuitOpen(true)}
          hitSlop={12}
          style={styles.close}
        >
          <Text style={styles.closeText}>{'✕'}</Text>
        </Pressable>
        <ProgressBar progress={progress} />
        {/* docs/UI.md §2: hearts live in the top bar for tests and exams only.
            This sub-level's category is new-theory, so the slot stays empty. */}
        <View style={styles.heartSlot} />
      </View>

      {/* The animated wrapper must outlive the screen swap: if the node carrying
          the opacity is the one that remounts, Animated loses its host and the
          incoming screen stays at the outgoing screen's last value. The keyed
          ScrollView inside gives each screen a fresh scroll offset and fresh
          component state; the wrapper around it stays put. */}
      <Animated.View
        style={[styles.scroll, { opacity: fade, transform: [{ translateX: slide }] }]}
      >
        <ScrollView
          key={`${runKey}-${index}`}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        {atSummary ? (
          <Summary screens={screens} grades={grades} levelTitle={level.title} />
        ) : (
          renderScreen({
            screen: screen as Screen,
            value: value as AnswerValue,
            setValue,
            isRevealed,
            contentWidth,
            level,
            onPhaseChange: setDecisionPhase,
          })
        )}
        </ScrollView>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        {screen && isQuestion(screen) && isRevealed && g ? (
          <Reveal
            grade={g}
            lead={revealLead}
            explanation={(screen as QuestionScreen).explanation}
            working={working}
          />
        ) : null}
        {showDecisionButtons ? (
          <DecisionButtons
            buttons={decisionButtons(screen as any)}
            onChoose={(button) => setValue({ kind: 'decision', choice: button })}
          />
        ) : ctaHidden ? null : (
          <Cta label={ctaLabel} disabled={ctaDisabled} onPress={onCta} />
        )}
      </View>

      <QuitSheet
        visible={quitOpen}
        onCancel={() => setQuitOpen(false)}
        onQuit={() => {
          setQuitOpen(false);
          reset();
        }}
      />
    </View>
  );
}

function renderScreen(props: {
  screen: Screen;
  value: AnswerValue;
  setValue: (v: AnswerValue) => void;
  isRevealed: boolean;
  contentWidth: number;
  level: Level;
  onPhaseChange: (p: DecisionPhase) => void;
}) {
  const { screen, value, setValue, isRevealed, contentWidth, level, onPhaseChange } =
    props;

  switch (screen.type) {
    case 'intro':
      return (
        <IntroScreen
          screen={screen}
          levelTitle={level.title}
          chapterTitle={level.chapter_title}
        />
      );
    case 'theory':
      return <TheoryScreen screen={screen} width={contentWidth} />;
    case 'example':
      return <ExampleScreen screen={screen} width={contentWidth} />;
    case 'mc':
    case 'numeric-mc':
      return (
        <McScreen
          screen={screen}
          value={value}
          onChange={setValue}
          revealed={isRevealed}
        />
      );
    case 'tf':
      return (
        <TfScreen
          screen={screen}
          value={value}
          onChange={setValue}
          revealed={isRevealed}
        />
      );
    case 'fill-tiles':
      return (
        <FillTilesScreen
          screen={screen}
          value={value}
          onChange={setValue}
          revealed={isRevealed}
        />
      );
    case 'match':
      return (
        <MatchScreen
          screen={screen}
          value={value}
          onChange={setValue}
          revealed={isRevealed}
        />
      );
    case 'numeric-input':
      return (
        <NumericInputScreen
          screen={screen}
          value={value}
          onChange={setValue}
          revealed={isRevealed}
        />
      );
    case 'chart-decision':
      return (
        <ChartDecisionScreen
          screen={screen}
          value={value}
          width={contentWidth}
          onPhaseChange={onPhaseChange}
        />
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText: { ...type.title, color: colors.textMuted },
  heartSlot: { width: 32 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: space.lg, paddingBottom: space.lg },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.background,
  },
});
