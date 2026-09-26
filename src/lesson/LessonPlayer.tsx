import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import DecisionButtons, { DECISION_LABEL } from '../components/DecisionButtons';
import ChartDecisionScreen, { DecisionPhase } from '../screens/ChartDecisionScreen';
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
import PlanCardScreen, { planCardComplete } from '../screens/PlanCardScreen';
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
import Summary, { scoreOf } from './Summary';
import { NodeKind, PATHS, TradingPath, sourceCardOf } from '../content';
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
import { colors, radius, space, type } from '../theme';
import type { Level, QuestionScreen, Screen } from '../types';
import { isQuestion } from '../types';
import type { AnswerValue, Grade } from './answers';
import {
  branchExplanation,
  canCheck,
  commitsOnTap,
  decisionButtons,
  emptyValue,
  grade as gradeAnswer,
} from './answers';
import type { CueName } from './cues.generated';
import Cta from './Cta';
import {
  commitFeedback,
  revealFeedback,
  runBefore,
  STREAK_FROM,
  streakAfter,
  tapFeedback,
} from './feedback';
import ProgressBar from './ProgressBar';
import QuitSheet, { QuitButton } from './QuitSheet';
import Reveal, { RevealProbe } from './Reveal';
import LessonComplete from './LessonComplete';
import { DURATION, EASE_OUT, SPRING_SETTLE, useMotion } from './motion';
import { FitScreen, REVEAL_GROWTH } from './fit';
import { fitScale, fitTop } from './fitState';
import { dealScreen } from './shuffle';
import { emitMood, useLookSpec } from './look';
import { preloadCues } from './sound';
import HeartMeter from './HeartMeter';
import OutOfHearts from './OutOfHearts';
import { getProgress, heartsNow, loseHeart, savePlan } from '../progress';
import StreakMeter from './StreakMeter';
import { VerdictProvider } from './verdict';

export default function LessonPlayer({
  level,
  contentWidth,
  onQuit,
  onComplete,
  startAt = 0,
  testBench = false,
  kind = 'lesson',
  onChoosePath,
  initialPath = null,
}: {
  level: Level;
  contentWidth: number;
  /** docs/UI.md §2: the close ✕ leaves the lesson. */
  onQuit?: () => void;
  /**
   * The sub-level reached its summary: it counts as finished from there, so
   * leaving by the ✕ on the summary still keeps it. Given this, the summary's
   * button goes back to the path instead of playing the lesson again.
   */
  onComplete?: (result: { perfect: boolean }) => void;
  /** Open on this screen instead of the first (the test bench's deep links). */
  startAt?: number;
  /**
   * A test level (content.ts): page numbers in the top bar and a back button.
   * A real lesson has neither -- docs/UI.md §2, no back button in a lesson.
   */
  testBench?: boolean;
  /**
   * What the node on the path is (content.ts). A Checkpoint or Final Exam is
   * scored at its `summary` screen: a pass counts it, a miss offers a retry
   * and counts nothing. The path choice ends the moment a path is picked.
   */
  kind?: NodeKind;
  /** The path choice was made (kind `path`). */
  onChoosePath?: (path: TradingPath) => void;
  /** The path already chosen, pre-selected when the choice is made again. */
  initialPath?: string | null;
}) {
  const insets = useSafeAreaInsets();
  const scored = kind === 'test' || kind === 'final';
  const [runKey, setRunKey] = useState(0);
  // Every list of choices is dealt afresh each run (lesson/shuffle.ts), and the
  // dealt screens are the ones shown and graded.
  const [deckSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const screens = useMemo(
    () => level.screens.map((s, i) => dealScreen(s, deckSeed + runKey * 7919 + i * 104729)),
    [level.screens, deckSeed, runKey],
  );

  const [index, setIndex] = useState(() => Math.max(0, Math.min(startAt, screens.length - 1)));
  const [values, setValues] = useState<(AnswerValue | null)[]>(() => screens.map(emptyValue));
  const [revealed, setRevealed] = useState<boolean[]>(() => screens.map(() => false));
  const [grades, setGrades] = useState<(Grade | null)[]>(() => screens.map(() => null));
  // The run of right answers each reveal ended on (feedback.ts, streakAfter).
  const [streaks, setStreaks] = useState<number[]>(() => screens.map(() => 0));
  // A trade call's phase belongs to the screen that reported it. Kept with its
  // index, so a second chart-decision straight after a first never inherits the
  // first one's 'done' -- which revealed it, graded wrong, before any choice.
  const [phaseAt, setPhaseAt] = useState<{ index: number; phase: DecisionPhase }>({
    index: -1,
    phase: 'deciding',
  });
  const [quitOpen, setQuitOpen] = useState(false);
  // docs/UI.md §5.2: a wrong answer costs a heart, and a lesson stops once the
  // last one is gone. The test bench is not on the path and spends none.
  // The path-choice lesson costs no hearts: a wrong guess about which style
  // holds overnight should never stand between the learner and their path.
  const spendsHearts = !testBench && kind !== 'path';
  const [outOfHearts, setOutOfHearts] = useState(
    () => spendsHearts && heartsNow(getProgress()).hearts === 0,
  );
  // docs/UI.md §5.4: on a badge or a tier the CTA comes last. The screen says
  // when its sequence is done, and the CTA is held until then.
  const [settledAt, setSettledAt] = useState(-1);
  // `carousel`, `walkthrough` and `checklist-reveal` count as several screens
  // (docs/schema.md), so they hold a cursor the CTA advances before the index does.
  const [cursor, setCursor] = useState(0);
  // The learner's own plan, for this run (docs/schema.md, "The plan").
  // docs/UI.md §3 `plan-card`: the learner's plan is theirs to keep. A card
  // opens on what they wrote before, and what they write is saved as they go.
  const [plan, setPlan] = useState<Record<string, string>>(() => ({ ...getProgress().plan }));
  // Changing a path opens on the one already chosen.
  const [pathChoice, setPathChoice] = useState<string | null>(initialPath);

  // A screen change is a beat, not a cut: the outgoing screen fades and slides
  // left, the incoming one arrives from the right while the progress bar fills.
  const fade = useSharedValue(1);
  const slide = useSharedValue(0);
  const lastAdvance = useRef(0);
  // Which way the last screen change went: a step back arrives from the left.
  const direction = useRef<1 | -1>(1);
  const m = useMotion();

  const spec = useLookSpec();

  // Every cue's player is built when the lesson opens, so none of them loads on
  // its first play -- the first play is the one whose lag you would hear.
  // Leaving the lesson settles the edge light (components/Atmosphere.tsx) and
  // lets go of a screen's fit, so the home screen's grid is drawn full size.
  useEffect(() => {
    preloadCues();
    emitMood('calm');
    return () => {
      emitMood('calm');
      fitScale.set(1);
      fitTop.set(0);
    };
  }, []);

  // Leaving is a beat too: the lesson sinks and fades off the ground before
  // the path appears, whichever way out was taken.
  const exit = useSharedValue(0);
  const leaving = useRef(false);
  const leave = useCallback(() => {
    if (!onQuit || leaving.current) return;
    leaving.current = true;
    exit.set(
      withTiming(1, { duration: m.reduced ? 180 : 260, easing: EASE_OUT }, (done) => {
        if (done) scheduleOnRN(onQuit);
      }),
    );
  }, [onQuit, exit, m.reduced]);
  const exitStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.get(),
    transform: m.reduced ? [] : [{ translateY: 18 * exit.get() }, { scale: 1 - 0.03 * exit.get() }],
  }));

  // Android's back button asks before leaving, as the ✕ does, and closes the
  // question again if it is already asked.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setQuitOpen((o) => !o);
      return true;
    });
    return () => sub.remove();
  }, []);

  const atSummary = index >= screens.length;
  // Reported once per run, the moment the summary is reached (docs/UI.md
  // §5.3). Perfect is the summary's own rule: every graded answer right.
  const reported = useRef(-1);
  useEffect(() => {
    // Scored levels and the path choice report on their own terms (onCta).
    if (kind !== 'lesson') return;
    if (!atSummary || !onComplete || reported.current === runKey) return;
    reported.current = runKey;
    const answered = grades.filter((g) => g !== null);
    onComplete({ perfect: answered.length > 0 && answered.every((g) => g === 'correct') });
  }, [atSummary, onComplete, runKey, grades, kind]);
  const screen = atSummary ? null : screens[index];
  const decisionPhase: DecisionPhase = phaseAt.index === index ? phaseAt.phase : 'deciding';
  const setDecisionPhase = useCallback(
    (phase: DecisionPhase) => setPhaseAt({ index, phase }),
    [index],
  );
  const value = atSummary ? null : values[index];
  const isRevealed = atSummary ? false : revealed[index];
  const isLast = index === screens.length - 1;

  const reset = useCallback(() => {
    setIndex(0);
    setValues(screens.map(emptyValue));
    setRevealed(screens.map(() => false));
    setGrades(screens.map(() => null));
    setStreaks(screens.map(() => 0));
    setPhaseAt({ index: -1, phase: 'deciding' });
    setCursor(0);
    setPlan({ ...getProgress().plan });
    setPathChoice(initialPath);
    setRunKey((k) => k + 1);
    setSettledAt(-1);
    setOutOfHearts(false);
    emitMood('calm');
    fade.set(1);
    slide.set(0);
    lastAdvance.current = 0;
  }, [screens, fade, slide]);

  const doReveal = useCallback(() => {
    if (!screen || !isQuestion(screen) || !value) return;
    // Nothing chosen is nothing to grade.
    if (!canCheck(screen as QuestionScreen, value)) return;
    const g = gradeAnswer(screen as QuestionScreen, value);
    const streak = streakAfter(grades, index, g);
    setGrades((prev) => prev.map((x, i) => (i === index ? g : x)));
    setStreaks((prev) => prev.map((x, i) => (i === index ? streak : x)));
    setRevealed((prev) => prev.map((x, i) => (i === index ? true : x)));
    // docs/UI.md §5.1: the verdict lands the instant it is known. A run of right
    // answers climbs the chime a step at a time.
    revealFeedback(g, streak);
    emitMood(g === 'correct' ? (streak >= STREAK_FROM ? 'streak' : 'correct') : g, streak);
    // The heart goes with the verdict, in the same frame (HeartMeter).
    if (g === 'wrong' && spendsHearts) loseHeart();
  }, [screen, value, index, grades, spendsHearts]);

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
    slide.set(m.travel(36) * direction.current);
    fade.set(withTiming(1, { duration: m.fade(DURATION.screen), easing: EASE_OUT }));
    slide.set(m.reduced ? 0 : withSpring(0, SPRING_SETTLE));
  }, [index, runKey, outOfHearts, fade, slide, m]);

  // The new look adds depth to the same beat: the incoming screen also comes
  // up from slightly further back, so it arrives rather than slides.
  const depth = spec.depth && !m.reduced ? 0.035 : 0;
  const screenStyle = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateX: slide.get() }, { scale: 1 - depth * (1 - fade.get()) }],
  }));

  const advance = () => {
    // Only swallow a true double-fire. This used to block for the whole length
    // of the transition, which ate deliberate fast taps and made the CTA feel
    // like it needed pressing twice.
    const now = Date.now();
    if (now - lastAdvance.current < 90) return;
    lastAdvance.current = now;
    direction.current = 1;
    setIndex((i) => i + 1);
  };

  // Back, on a test level only (docs/UI.md §2 keeps it out of lessons): a card
  // within a carousel or walkthrough first, then the screen before. Nothing is
  // undone -- an answered screen comes back answered, its reveal showing and
  // its Continue waiting, so going back is for looking, not for a second try.
  const canGoBack = testBench && (index > 0 || cursor > 0);
  const goBack = () => {
    tapFeedback();
    if (cursor > 0) {
      setCursor((c) => c - 1);
      return;
    }
    if (index === 0) return;
    direction.current = -1;
    setIndex((i) => Math.max(0, i - 1));
  };

  // A test's score, for its summary screen's button (Summary.tsx).
  const score = useMemo(() => scoreOf(screens, grades), [screens, grades]);
  const failedTest = scored && screen?.type === 'summary' && !score.passed;
  const pathName = PATHS.find((p) => p.id === pathChoice)?.name;

  const ctaLabel = useMemo(() => {
    if (outOfHearts) return 'Back to path';
    if (!screen) return onComplete ? 'Continue' : 'Play again';
    if (failedTest) return 'Retry';
    if (scored && screen.type === 'summary') return 'Continue';
    if (kind === 'path' && screen.type === 'path-choice') {
      return pathName ? `Start ${pathName}` : 'Pick a path';
    }
    if (screen.type === 'checklist-reveal' && cursor < screen.items.length) {
      return cursor === 0 ? 'Start the list' : 'Next item';
    }
    // A card or step with more after it: "Next", so the button says there is more.
    if (screen.type === 'carousel' && cursor < screen.cards.length - 1) return 'Next';
    if (screen.type === 'walkthrough' && cursor < screen.steps.length - 1) return 'Next';
    if (!isQuestion(screen)) return isLast ? 'Finish' : 'Continue';
    if (!isRevealed) return 'Check';
    return isLast ? 'Finish' : 'Got it';
  }, [
    screen,
    isLast,
    isRevealed,
    cursor,
    onComplete,
    outOfHearts,
    failedTest,
    kind,
    pathName,
    scored,
  ]);

  // A type that commits on tap has no Check state, so before the reveal there is
  // simply no CTA to show — the answer itself is the button.
  const ctaHiddenBeforeReveal =
    !!screen && isQuestion(screen) && commitsOnTap(screen) && !isRevealed;

  // docs/UI.md §6.4: the decision buttons occupy the CTA slot until the outcome
  // lands. They stay there through the replay, the chosen one lit and the rest
  // stepped back: the learner watches the outcome of *that* call, and the slot
  // keeping its height means the chart does not drop the moment it starts.
  const showDecisionButtons =
    !outOfHearts && !!screen && screen.type === 'chart-decision' && !isRevealed;
  const chosenDecision = value && value.kind === 'decision' ? value.choice : null;

  const onSettled = useCallback(() => setSettledAt(index), [index]);
  const held =
    !!screen && (screen.type === 'badge' || screen.type === 'tier-up') && settledAt !== index;

  const ctaHidden = ctaHiddenBeforeReveal && !outOfHearts;

  // One press, one cue. Check fires nothing on the way down: the verdict is its
  // sound, on release. A checklist's CTA reveals the next item, which rings its
  // own note. Everything else that moves the lesson on steps forward.
  const ctaCue: CueName | null =
    !screen || outOfHearts
      ? 'advance'
      : screen.type === 'checklist-reveal' && cursor < screen.items.length
        ? null
        : isQuestion(screen) && !isRevealed
          ? null
          : 'advance';

  const ctaDisabled =
    !outOfHearts &&
    ((!!screen &&
      isQuestion(screen) &&
      !isRevealed &&
      !(value && canCheck(screen as QuestionScreen, value))) ||
      (screen?.type === 'path-choice' && pathChoice === null) ||
      // A plan card is filled in before it is kept: every line, or no button.
      (screen?.type === 'plan-card' && !planCardComplete(screen, plan)));

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
    if (outOfHearts) {
      if (onQuit) leave();
      else reset();
      return;
    }
    if (!screen) {
      if (onComplete && onQuit) leave();
      else reset();
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
    // The last heart went on this screen: the lesson ends here, not at the
    // next screen or the summary.
    if (spendsHearts && heartsNow(getProgress()).hearts === 0) {
      direction.current = 1;
      emitMood('calm');
      setOutOfHearts(true);
      return;
    }
    // docs/UI.md §3 `summary`: below the pass mark the button retries, from
    // the top, with the questions dealt afresh.
    if (failedTest) {
      reset();
      return;
    }
    if (kind === 'path' && screen.type === 'path-choice') {
      if (pathChoice) onChoosePath?.(pathChoice as TradingPath);
      leave();
      return;
    }
    // A passed test ends on its last screen -- the summary, or the badge after
    // a Final Exam -- and goes back to the path, where the next level opens.
    if (scored && isLast) {
      if (score.passed) onComplete?.({ perfect: score.perfect });
      leave();
      return;
    }
    advance();
  };

  const g = atSummary ? null : grades[index];
  const streak = atSummary ? 0 : streaks[index];
  const verdict = useMemo(() => (g ? { grade: g, streak } : null), [g, streak]);
  // A run of three or more warms the progress bar (ProgressBar).
  const onRun = runBefore(grades, index + 1) >= 3;

  // How tall this screen's verdict will be, from its invisible copy in the
  // footer; the screen keeps that much room free under itself (lesson/fit.tsx).
  const [probeH, setProbeH] = useState(0);
  const revealRoom = probeH > 0 ? probeH + space.md : REVEAL_GROWTH;

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
    : (index + (stepCount(screen) > 1 ? cursor / stepCount(screen) : 0)) / screens.length;

  return (
    <Animated.View style={[styles.root, exitStyle]}>
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <QuitButton open={quitOpen} onPress={() => setQuitOpen(true)} />
        {testBench ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous screen"
            accessibilityState={{ disabled: !canGoBack }}
            disabled={!canGoBack}
            onPress={goBack}
            hitSlop={10}
            style={[styles.close, !canGoBack && styles.backOff]}
          >
            <Text style={styles.backText}>{'‹'}</Text>
          </Pressable>
        ) : null}
        <ProgressBar progress={progress} steps={screens.length} hot={onRun} />
        {testBench && !atSummary ? (
          <Text style={styles.page} accessibilityLabel={`Page ${index + 1} of ${screens.length}`}>
            {`${index + 1}/${screens.length}`}
          </Text>
        ) : null}
        {/* The run of right answers, in the looks that count it: a fixed slot,
            so the bar keeps its length as the flame comes and goes. */}
        {spec.streak !== 'none' ? (
          <View style={styles.streakSlot}>
            <StreakMeter run={runBefore(grades, atSummary ? grades.length : index + 1)} />
          </View>
        ) : null}
        <HeartMeter />
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
        <FitScreen
          key={`${runKey}-${index}-${outOfHearts}`}
          contentStyle={styles.content}
          bottomPad={space.lg}
          // chart-decision holds its own chart on the grid; every other screen
          // is placed by the fit area and then held still (lesson/fit.tsx).
          anchor={!outOfHearts && screen?.type === 'chart-decision' ? 'fill' : 'center'}
          reserve={!outOfHearts && screen && isQuestion(screen) ? revealRoom : 0}
        >
          <VerdictProvider value={verdict}>
            {outOfHearts ? (
              <OutOfHearts />
            ) : atSummary ? (
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
                setPlanValue: (key, v) => {
                  setPlan((prev) => ({ ...prev, [key]: v }));
                  if (spendsHearts) savePlan({ [key]: v });
                },
                pathChoice,
                setPathChoice,
                onSettled,
                allScreens: screens,
                grades,
              })
            )}
          </VerdictProvider>
        </FitScreen>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        {/* docs/UI.md §2: the reveal lies over a strip the screen kept free for
            it, just above the button, instead of pushing the content area
            shorter -- a shorter area is what moved and shrank everything on
            the screen the moment Check was pressed. The strip is as tall as
            this screen's own verdict, measured beforehand by a copy of it. */}
        {!outOfHearts && screen && isQuestion(screen) && !isRevealed ? (
          <View style={styles.revealSlot} pointerEvents="none">
            <RevealProbe
              key={`${runKey}-${index}`}
              explanation={probeExplanation(screen)}
              working={!!working}
              onHeight={setProbeH}
            />
          </View>
        ) : null}
        {!outOfHearts && screen && isQuestion(screen) && isRevealed && g ? (
          <View style={styles.revealSlot}>
            <View style={styles.revealGround}>
              <Reveal
                grade={g}
                lead={revealLead}
                explanation={
                  // A branch's reveals live on its steps (docs/schema.md); the panel
                  // gives the one that matters most for the path taken.
                  screen.type === 'branch'
                    ? branchExplanation(screen, value?.kind === 'branch' ? value.picks : [])
                    : (screen as Exclude<QuestionScreen, { type: 'branch' }>).explanation
                }
                working={working}
                streak={streak}
              />
            </View>
          </View>
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
            good={!outOfHearts && !!screen && isQuestion(screen) && isRevealed && g === 'correct'}
            hidden={held && !outOfHearts}
          />
        )}
        {failedTest && !outOfHearts ? (
          <Pressable
            accessibilityRole="button"
            onPressIn={tapFeedback}
            onPress={() => (onQuit ? leave() : reset())}
            hitSlop={8}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Back to path</Text>
          </Pressable>
        ) : null}
      </View>

      <QuitSheet
        visible={quitOpen}
        onCancel={() => setQuitOpen(false)}
        onQuit={() => {
          setQuitOpen(false);
          if (onQuit) leave();
          else reset();
        }}
      />
    </Animated.View>
  );
}

/** The verdict text a question's reveal will carry, the longest it can be. */
function probeExplanation(screen: QuestionScreen): string {
  if (screen.type === 'branch') {
    return screen.steps.reduce((a, s) => (s.explanation.length > a.length ? s.explanation : a), '');
  }
  return (screen as Exclude<QuestionScreen, { type: 'branch' }>).explanation ?? '';
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
  /** Every screen of the run and its grade, for a test's `summary`. */
  allScreens: Screen[];
  grades: (Grade | null)[];
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
    allScreens,
    grades,
  } = props;

  const q = { value, onChange: setValue, revealed: isRevealed };

  switch (screen.type) {
    case 'intro':
      return (
        <IntroScreen screen={screen} levelTitle={level.title} chapterTitle={level.chapter_title} />
      );
    case 'theory':
      return <TheoryScreen screen={screen} width={contentWidth} />;
    case 'example':
      return <ExampleScreen screen={screen} width={contentWidth} />;
    case 'mc':
    case 'numeric-mc':
      return <McScreen screen={screen} value={value} onChange={setValue} revealed={isRevealed} />;
    case 'tf':
      return <TfScreen screen={screen} value={value} onChange={setValue} revealed={isRevealed} />;
    case 'fill-tiles':
      return (
        <FillTilesScreen screen={screen} value={value} onChange={setValue} revealed={isRevealed} />
      );
    case 'match':
      return (
        <MatchScreen screen={screen} value={value} onChange={setValue} revealed={isRevealed} />
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
          revealed={isRevealed}
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
      return (
        <ChecklistRevealScreen
          screen={screen}
          cursor={cursor}
          onNext={() => {
            if (cursor < screen.items.length) setCursor(cursor + 1);
          }}
        />
      );
    case 'story':
      return <StoryScreen screen={screen} />;
    case 'recap':
      return <RecapScreen screen={screen} source={(id) => sourceCardOf(level, id)} />;
    case 'plan-card':
      return <PlanCardScreen screen={screen} values={plan} onChange={setPlanValue} />;
    case 'badge':
      return <BadgeScreen screen={screen} onSettled={onSettled} />;
    case 'tier-up':
      return <TierUpScreen screen={screen} onSettled={onSettled} />;
    case 'path-choice':
      return <PathChoiceScreen screen={screen} value={pathChoice} onChange={setPathChoice} />;
    case 'summary':
      // docs/schema.md keeps `summary` for tests and final exams, where a pass
      // mark and a retry make the per-question list mean something. A lesson
      // ends on LessonComplete instead.
      return (
        <Summary screens={allScreens} grades={grades} levelTitle={level.title} xp={level.xp} />
      );

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
      return <BranchScreen screen={screen} {...q} width={contentWidth} />;
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
  backText: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: -3,
  },
  backOff: { opacity: 0.25 },
  streakSlot: { minWidth: 32, alignItems: 'flex-end' },
  // Tabular figures, so "9/49" to "10/49" does not nudge the bar.
  page: { ...type.label, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: space.lg, paddingBottom: space.lg },
  secondary: { alignSelf: 'center', paddingVertical: space.xs, paddingHorizontal: space.md },
  secondaryText: { ...type.label, color: colors.textMuted },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  // Just above the footer, over the bottom of the content area.
  revealSlot: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    bottom: '100%',
    paddingBottom: space.md,
  },
  // The reveal's tint is see-through; over the content area it needs ground.
  revealGround: { backgroundColor: colors.background, borderRadius: radius.md },
});
