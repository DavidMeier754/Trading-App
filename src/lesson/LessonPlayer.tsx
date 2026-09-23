import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DecisionButtons, { DECISION_LABEL } from '../components/DecisionButtons';
import ChartDecisionScreen, {
  DecisionPhase,
} from '../screens/ChartDecisionScreen';
import ChartAnnotateScreen from '../screens/ChartAnnotateScreen';
import ChartReplayScreen from '../screens/ChartReplayScreen';
import {
  FillChoiceScreen,
  OrderScreen,
  SortScreen,
  SpotMistakeScreen,
} from '../screens/ChoiceScreens';
import { BranchScreen, JournalRowScreen, OrderBuildScreen } from '../screens/BuildScreens';
import { CompareScreen, SwipeDeckScreen } from '../screens/DeckScreens';
import ExampleScreen from '../screens/ExampleScreen';
import PlanCardScreen from '../screens/PlanCardScreen';
import {
  CarouselScreen,
  ChecklistRevealScreen,
  PathChoiceScreen,
  RecapScreen,
  StoryScreen,
  VisualScreen,
  WalkthroughScreen,
} from '../screens/StaticScreens';
import { BadgeScreen, TierUpScreen } from '../screens/RewardScreens';
import Summary from './Summary';
import {
  ChartTapScreen,
  DepthLadderScreen,
  HotspotScreen,
  ScannerPickScreen,
  SliderScreen,
} from '../screens/TapScreens';
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
import {
  canCheck,
  commitsOnTap,
  decisionButtons,
  emptyValue,
  grade as gradeAnswer,
} from './answers';
import type { CueName } from './cues.generated';
import Cta from './Cta';
import { commitFeedback, revealFeedback, runBefore, streakAfter, tapFeedback } from './feedback';
import ProgressBar from './ProgressBar';
import QuitSheet from './QuitSheet';
import Reveal from './Reveal';
import LessonComplete from './LessonComplete';
import { DURATION, EASE_OUT, SPRING_SETTLE, useMotion } from './motion';
import { FitScreen } from './fit';
import { emitMood, useLookSpec } from './look';
import { preloadCues } from './sound';
import StreakMeter from './StreakMeter';
import { VerdictProvider } from './verdict';

export default function LessonPlayer({
  level,
  contentWidth,
  onQuit,
  startAt = 0,
}: {
  level: Level;
  contentWidth: number;
  /** docs/UI.md §2: the close ✕ leaves the lesson. */
  onQuit?: () => void;
  /** Open on this screen instead of the first (the test bench's deep links). */
  startAt?: number;
}) {
  const insets = useSafeAreaInsets();
  const screens = level.screens;

  const [index, setIndex] = useState(() => Math.max(0, Math.min(startAt, screens.length - 1)));
  const [values, setValues] = useState<(AnswerValue | null)[]>(() =>
    screens.map(emptyValue)
  );
  const [revealed, setRevealed] = useState<boolean[]>(() => screens.map(() => false));
  const [grades, setGrades] = useState<(Grade | null)[]>(() => screens.map(() => null));
  // The run of right answers each reveal ended on (feedback.ts, streakAfter).
  const [streaks, setStreaks] = useState<number[]>(() => screens.map(() => 0));
  const [decisionPhase, setDecisionPhase] = useState<DecisionPhase>('deciding');
  const [quitOpen, setQuitOpen] = useState(false);
  const [runKey, setRunKey] = useState(0);
  // docs/UI.md §5.4: on a badge or a tier the CTA comes last. The screen says
  // when its sequence is done, and the CTA is held until then.
  const [settledAt, setSettledAt] = useState(-1);
  // `carousel`, `walkthrough` and `checklist-reveal` count as several screens
  // (docs/schema.md), so they hold a cursor the CTA advances before the index does.
  const [cursor, setCursor] = useState(0);
  // The learner's own plan, for this run (docs/schema.md, "The plan").
  const [plan, setPlan] = useState<Record<string, string>>({});
  const [pathChoice, setPathChoice] = useState<string | null>(null);

  // A screen change is a beat, not a cut: the outgoing screen fades and slides
  // left, the incoming one arrives from the right while the progress bar fills.
  const fade = useSharedValue(1);
  const slide = useSharedValue(0);
  const lastAdvance = useRef(0);
  const m = useMotion();

  const spec = useLookSpec();

  // Every cue's player is built when the lesson opens, so none of them loads on
  // its first play -- the first play is the one whose lag you would hear.
  // Leaving the lesson settles the edge light (components/Atmosphere.tsx).
  useEffect(() => {
    preloadCues();
    emitMood('calm');
    return () => emitMood('calm');
  }, []);

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
    setStreaks(screens.map(() => 0));
    setDecisionPhase('deciding');
    setCursor(0);
    setPlan({});
    setPathChoice(null);
    setRunKey((k) => k + 1);
    setSettledAt(-1);
    emitMood('calm');
    fade.set(1);
    slide.set(0);
    lastAdvance.current = 0;
  }, [screens, fade, slide]);

  const doReveal = useCallback(() => {
    if (!screen || !isQuestion(screen) || !value) return;
    const g = gradeAnswer(screen as QuestionScreen, value);
    const streak = streakAfter(grades, index, g);
    setGrades((prev) => prev.map((x, i) => (i === index ? g : x)));
    setStreaks((prev) => prev.map((x, i) => (i === index ? streak : x)));
    setRevealed((prev) => prev.map((x, i) => (i === index ? true : x)));
    // docs/UI.md §5.1: the verdict lands the instant it is known. A run of right
    // answers climbs the chime a step at a time.
    revealFeedback(g, streak);
    emitMood(g === 'correct' ? (streak >= 3 ? 'streak' : 'correct') : g, streak);
  }, [screen, value, index, grades]);

  // Types that commit on the tap itself reveal as soon as an answer exists, with
  // no Check step in between (see COMMITS_ON_TAP). `chart-decision` is the one
  // exception: it commits on tap too, but its reveal waits for the chart to
  // finish playing out (docs/UI.md §4.3).
  useEffect(() => {
    if (!screen || isRevealed) return;
    if (!commitsOnTap(screen) || screen.type === 'chart-decision') return;
    if (value && canCheck(screen as QuestionScreen, value)) doReveal();
  }, [screen, value, isRevealed, doReveal]);

  useEffect(() => {
    if (!screen || screen.type !== 'chart-decision' || isRevealed) return;
    if (decisionPhase === 'done') doReveal();
  }, [screen, decisionPhase, isRevealed, doReveal]);

  useEffect(() => {
    setDecisionPhase('deciding');
    setCursor(0);
  }, [index]);

  const setValue = (next: AnswerValue) =>
    setValues((prev) => prev.map((v, i) => (i === index ? next : v)));

  // The incoming screen is what gets the beat: it arrives from the right and
  // fades up while the progress bar fills underneath it. Fading the outgoing
  // screen out first would buy nothing but a blank frame between two screens.
  useEffect(() => {
    // The fade is a timing curve; the slide is a no-overshoot spring that keeps
    // settling after the fade is done. That reads smoother than two timings,
    // which either land together (abrupt) or drift apart (laggy).
    fade.set(0);
    slide.set(m.travel(36));
    fade.set(withTiming(1, { duration: m.fade(DURATION.screen), easing: EASE_OUT }));
    slide.set(m.reduced ? 0 : withSpring(0, SPRING_SETTLE));
  }, [index, runKey, fade, slide, m]);

  // The new look adds depth to the same beat: the incoming screen also comes
  // up from slightly further back, so it arrives rather than slides.
  const depth = spec.depth && !m.reduced ? 0.035 : 0;
  const screenStyle = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [
      { translateX: slide.get() },
      { scale: 1 - depth * (1 - fade.get()) },
    ],
  }));

  const advance = () => {
    // Only swallow a true double-fire. This used to block for the whole length
    // of the transition, which ate deliberate fast taps and made the CTA feel
    // like it needed pressing twice.
    const now = Date.now();
    if (now - lastAdvance.current < 90) return;
    lastAdvance.current = now;
    setIndex((i) => i + 1);
  };

  const ctaLabel = useMemo(() => {
    if (!screen) return 'Play again';
    if (screen.type === 'checklist-reveal' && cursor < screen.items.length) {
      return cursor === 0 ? 'Start the list' : 'Next item';
    }
    if (!isQuestion(screen)) return isLast ? 'Finish' : 'Continue';
    if (!isRevealed) return 'Check';
    return isLast ? 'Finish' : 'Got it';
  }, [screen, isLast, isRevealed, cursor]);

  // A type that commits on tap has no Check state, so before the reveal there is
  // simply no CTA to show — the answer itself is the button.
  const ctaHiddenBeforeReveal =
    !!screen && isQuestion(screen) && commitsOnTap(screen) && !isRevealed;

  // docs/UI.md §6.4: the decision buttons occupy the CTA slot until the outcome
  // lands. They stay there through the replay, the chosen one lit and the rest
  // stepped back: the learner watches the outcome of *that* call, and the slot
  // keeping its height means the chart does not drop the moment it starts.
  const showDecisionButtons =
    !!screen && screen.type === 'chart-decision' && !isRevealed;
  const chosenDecision =
    value && value.kind === 'decision' ? value.choice : null;

  const onSettled = useCallback(() => setSettledAt(index), [index]);
  const held =
    !!screen && (screen.type === 'badge' || screen.type === 'tier-up') && settledAt !== index;

  const ctaHidden = ctaHiddenBeforeReveal;

  // One press, one cue. Check fires nothing on the way down: the verdict is its
  // sound, on release. A checklist's CTA reveals the next item, which rings its
  // own note. Everything else that moves the lesson on steps forward.
  const ctaCue: CueName | null = !screen
    ? 'advance'
    : screen.type === 'checklist-reveal' && cursor < screen.items.length
      ? null
      : isQuestion(screen) && !isRevealed
        ? null
        : 'advance';

  const ctaDisabled =
    (!!screen &&
      isQuestion(screen) &&
      !isRevealed &&
      !(value && canCheck(screen as QuestionScreen, value))) ||
    (screen?.type === 'path-choice' && pathChoice === null);

  /** How many sub-steps a screen has, for the types that count as several. */
  const stepCount = (s: Screen | null): number => {
    if (!s) return 1;
    if (s.type === 'carousel') return s.cards.length;
    if (s.type === 'walkthrough') return s.steps.length;
    // One CTA press per item, plus the press that moves on.
    if (s.type === 'checklist-reveal') return s.items.length + 1;
    return 1;
  };

  const onCta = () => {
    if (!screen) {
      reset();
      return;
    }
    // A multi-step screen walks its own cursor first; only the last step moves on.
    const steps = stepCount(screen);
    if (steps > 1 && cursor < steps - 1) {
      setCursor((c) => c + 1);
      return;
    }
    if (isQuestion(screen) && !isRevealed) {
      doReveal();
      return;
    }
    advance();
  };

  const g = atSummary ? null : grades[index];
  const streak = atSummary ? 0 : streaks[index];
  const verdict = useMemo(() => (g ? { grade: g, streak } : null), [g, streak]);
  // A run of three or more warms the progress bar (ProgressBar).
  const onRun = runBefore(grades, index + 1) >= 3;

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

  const progress = atSummary
    ? 1
    : (index + (stepCount(screen) > 1 ? cursor / stepCount(screen) : 0)) /
      screens.length;

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close lesson"
          onPressIn={tapFeedback}
          onPress={() => setQuitOpen(true)}
          hitSlop={12}
          style={styles.close}
        >
          <Text style={styles.closeText}>{'✕'}</Text>
        </Pressable>
        <ProgressBar progress={progress} steps={screens.length} hot={onRun} />
        {/* docs/UI.md §2: hearts live in the top bar for tests and exams only.
            A lesson has none, so in the new look the slot carries the run of
            right answers instead. */}
        <View style={styles.heartSlot}>
          {spec.streak !== 'none' ? (
            <StreakMeter run={runBefore(grades, atSummary ? grades.length : index + 1)} />
          ) : null}
        </View>
      </View>

      {/* The animated wrapper must outlive the screen swap: if the node carrying
          the opacity is the one that remounts, Animated loses its host and the
          incoming screen stays at the outgoing screen's last value. The keyed
          content area inside gives each screen fresh component state; the
          wrapper around it stays put. */}
      <Animated.View style={[styles.scroll, screenStyle]}>
        {/* docs/UI.md §2: a screen is one screenful and does not scroll. One
            that does not fit -- a short window, a long reveal, type past 130% --
            is scaled down until it does (lesson/fit.tsx), never scrolled. */}
        <FitScreen key={`${runKey}-${index}`} contentStyle={styles.content} bottomPad={space.lg}>
        <VerdictProvider value={verdict}>
        {atSummary ? (
          <LessonComplete
            screens={screens}
            grades={grades}
            levelTitle={level.title}
            xp={level.xp}
          />
        ) : (
          renderScreen({
            screen: screen as Screen,
            value: value as AnswerValue,
            setValue,
            isRevealed,
            contentWidth,
            level,
            onPhaseChange: setDecisionPhase,
            cursor,
            setCursor,
            plan,
            setPlanValue: (key, v) => setPlan((prev) => ({ ...prev, [key]: v })),
            pathChoice,
            setPathChoice,
            onSettled,
          })
        )}
        </VerdictProvider>
        </FitScreen>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        {screen && isQuestion(screen) && isRevealed && g ? (
          <Reveal
            grade={g}
            lead={revealLead}
            explanation={(screen as QuestionScreen).explanation}
            working={working}
            streak={streak}
          />
        ) : null}
        {showDecisionButtons ? (
          <DecisionButtons
            buttons={decisionButtons(screen as any)}
            chosen={chosenDecision}
            onChoose={(button) => {
              // The feel has to land on the tap, not when the chart stops playing.
              commitFeedback();
              emitMood('commit', runBefore(grades, index));
              setValue({ kind: 'decision', choice: button });
            }}
          />
        ) : ctaHidden ? null : (
          <Cta
            label={ctaLabel}
            disabled={ctaDisabled}
            onPress={onCta}
            cue={ctaCue}
            good={!!screen && isQuestion(screen) && isRevealed && g === 'correct'}
            hidden={held}
          />
        )}
      </View>

      <QuitSheet
        visible={quitOpen}
        onCancel={() => setQuitOpen(false)}
        onQuit={() => {
          setQuitOpen(false);
          if (onQuit) onQuit();
          else reset();
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
  cursor: number;
  setCursor: (n: number) => void;
  plan: Record<string, string>;
  setPlanValue: (key: string, value: string) => void;
  pathChoice: string | null;
  setPathChoice: (id: string) => void;
  onSettled: () => void;
}) {
  const {
    screen,
    value,
    setValue,
    isRevealed,
    contentWidth,
    level,
    onPhaseChange,
    cursor,
    setCursor,
    plan,
    setPlanValue,
    pathChoice,
    setPathChoice,
    onSettled,
  } = props;

  const q = { value, onChange: setValue, revealed: isRevealed };

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
    // --- docs/UI.md §3, the remaining non-question archetypes ---
    case 'carousel':
      return <CarouselScreen screen={screen} cursor={cursor} onCursor={setCursor} />;
    case 'walkthrough':
      return <WalkthroughScreen screen={screen} cursor={cursor} width={contentWidth} />;
    case 'visual':
      return <VisualScreen screen={screen} width={contentWidth} />;
    case 'checklist-reveal':
      return <ChecklistRevealScreen screen={screen} cursor={cursor} />;
    case 'story':
      return <StoryScreen screen={screen} />;
    case 'recap':
      return <RecapScreen screen={screen} />;
    case 'plan-card':
      return <PlanCardScreen screen={screen} values={plan} onChange={setPlanValue} />;
    case 'badge':
      return <BadgeScreen screen={screen} onSettled={onSettled} />;
    case 'tier-up':
      return <TierUpScreen screen={screen} onSettled={onSettled} />;
    case 'path-choice':
      return (
        <PathChoiceScreen screen={screen} value={pathChoice} onChange={setPathChoice} />
      );
    case 'summary':
      // docs/schema.md keeps `summary` for tests and final exams, where a pass
      // mark and a retry make the per-question list mean something. A lesson
      // ends on LessonComplete instead.
      return <Summary screens={[]} grades={[]} levelTitle={level.title} />;

    // --- docs/UI.md §4.1, the remaining v2 question types ---
    case 'fill-choice':
      return <FillChoiceScreen screen={screen} {...q} />;
    case 'sort':
      return <SortScreen screen={screen} {...q} />;
    case 'order':
      return <OrderScreen screen={screen} {...q} />;
    case 'hotspot':
      return <HotspotScreen screen={screen} {...q} width={contentWidth} />;
    case 'slider':
      return <SliderScreen screen={screen} {...q} width={contentWidth} />;
    case 'chart-tap':
      return <ChartTapScreen screen={screen} {...q} width={contentWidth} />;
    case 'spot-mistake':
      return <SpotMistakeScreen screen={screen} {...q} />;

    // --- docs/UI.md §4.2, the v3 question types ---
    case 'swipe-deck':
      return <SwipeDeckScreen screen={screen} {...q} width={contentWidth} />;
    case 'chart-annotate':
      return <ChartAnnotateScreen screen={screen} {...q} width={contentWidth} />;
    case 'order-build':
      return <OrderBuildScreen screen={screen} {...q} />;
    case 'scanner-pick':
      return <ScannerPickScreen screen={screen} {...q} />;
    case 'compare':
      return <CompareScreen screen={screen} {...q} width={contentWidth} />;
    case 'branch':
      return <BranchScreen screen={screen} {...q} />;
    case 'journal-row':
      return <JournalRowScreen screen={screen} {...q} />;
    case 'depth-ladder':
      return <DepthLadderScreen screen={screen} {...q} />;
    case 'chart-replay':
      return <ChartReplayScreen screen={screen} {...q} width={contentWidth} />;

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  // The backdrop paints the ground now; every container above it is glass.
  root: { flex: 1, backgroundColor: 'transparent' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText: { ...type.title, color: colors.textMuted },
  heartSlot: { minWidth: 32, alignItems: 'flex-end' },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: space.lg, paddingBottom: space.lg },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
