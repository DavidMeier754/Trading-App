import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import DecisionButtons from '../components/DecisionButtons';
import { PlanValues } from '../components/Visual';
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
import Summary, { PASS_MARK, scoreOf } from './Summary';
import { NodeKind, PATHS, TradingPath, sourceCardOf } from '../content';
import {
  ChartTapScreen,
  DepthLadderScreen,
  HotspotScreen,
  ScannerPickScreen,
  SliderScreen,
} from '../screens/TapScreens';
import FillTilesScreen from '../screens/FillTilesScreen';
import IntroScreen, { type Briefing } from '../screens/IntroScreen';
import MatchScreen from '../screens/MatchScreen';
import McScreen from '../screens/McScreen';
import NumericInputScreen from '../screens/NumericInputScreen';
import TfScreen from '../screens/TfScreen';
import TheoryScreen from '../screens/TheoryScreen';
import { colors, MONO_FONT, radius, space, TAP_TARGET, type, themed } from '../theme';
import type { DecisionButton, Level, QuestionScreen, Screen } from '../types';
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
import { Arrive } from './Celebrate';
import ChestScreen, { CHEST_PAYOUT } from './ChestScreen';
import Cta from './Cta';
import SlideKey from './SlideKey';
import {
  advanceFeedback,
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
import { FIRST_TRADE_LINE } from '../onboarding/firstTrade';
import { decisionReveal, longestDecisionReveal } from './decisionReveal';
import LessonComplete from './LessonComplete';
import { DURATION, EASE_OUT, RISE, useMotion } from './motion';
import { FitScreen, REVEAL_GROWTH } from './fit';
import { fitScale, fitTop } from './fitState';
import { dealScreen } from './shuffle';
import { emitMood, useLookSpec } from './look';
import { preloadCues } from './sound';
import HeartMeter from './HeartMeter';
import OutOfHearts from './OutOfHearts';
import {
  collectSkills,
  getProgress,
  heartsNow,
  loseHeart,
  questionKey,
  recordAnswer,
  recordDecision,
  savePlan,
} from '../progress';
import { knowsR, markableTerms, markPlan, skillsOf, type Skill } from '../skills';
import { LESSONS } from '../content';
import { answerSummary, questionLine } from './answerSummary';
import { resolveKey } from '../practice';
import { copy } from '../format';
import { DecisionSpace, LessonContext } from './lessonContext';
import MistakesDeck, { DEAL_MS, type DeckItem } from './MistakesDeck';
import SkillsLearned from './SkillsLearned';
import { TermSheet, TermsContext } from './terms';
import ComboMeter from './ComboMeter';
import { VerdictProvider } from './verdict';

/** A screen the player adds after a lesson's own (DESIGN-REVIEW): the deck, the skills. */
type DeckScreen = { type: 'mistakes-deck'; items: DeckItem[] };
type SkillsScreen = { type: 'skills-learned'; skills: Skill[] };
type ChestStep = { type: 'chest' };
type PlayerScreen = Screen | DeckScreen | SkillsScreen | ChestStep;

/** What the player is playing: a node of the path, or a round made in code. */
/**
 * `first`: the fresh install's first decision (onboarding/firstTrade.ts) --
 * not graded, no record, no hearts, and it ends on its own note.
 */
export type PlayerKind = NodeKind | 'practice' | 'bonus' | 'first';

/** A second press within 90 ms of the last is the same tap fired twice. */
function doubleFire(last: { current: number }): boolean {
  const now = Date.now();
  if (now - last.current < 90) return true;
  last.current = now;
  return false;
}

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
  lessonId,
  sourceKeys,
  onPractice,
}: {
  level: Level;
  contentWidth: number;
  /** docs/ui/02-lesson-player-layout.md §2: the close ✕ leaves the lesson. */
  onQuit?: () => void;
  /**
   * The sub-level reached its summary: it counts as finished from there, so
   * leaving by the ✕ on the summary still keeps it. Given this, the summary's
   * button goes back to the path instead of playing the lesson again.
   * `skills` are the ones collected for the first time (docs/ui/07-lesson-chapter-and-tier-complete.md §5.3).
   */
  onComplete?: (result: {
    perfect: boolean;
    skills: string[];
    right: number;
    asked: number;
  }) => void;
  /** The lesson's id on the path (content.ts): what the record keys its questions by. */
  lessonId?: string;
  /**
   * A practice round's screens come from many lessons: each one's question
   * key in the record (progress.ts), or null for a screen that is not graded.
   */
  sourceKeys?: (string | null)[];
  /** Open on this screen instead of the first (the test bench's deep links). */
  startAt?: number;
  /**
   * A test level (content.ts): page numbers in the top bar and a back button.
   * A real lesson has neither -- docs/ui/02-lesson-player-layout.md §2, no back button in a lesson.
   */
  testBench?: boolean;
  /**
   * What the node on the path is (content.ts). A Checkpoint or Final Exam is
   * scored at its `summary` screen: a pass counts it, a miss offers a retry
   * and counts nothing. The path choice ends the moment a path is picked.
   */
  kind?: PlayerKind;
  /** The path choice was made (kind `path`). */
  onChoosePath?: (path: TradingPath) => void;
  /** The path already chosen, pre-selected when the choice is made again. */
  initialPath?: string | null;
  /**
   * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3: "Practice these" on lesson complete, with
   * the record's keys of the questions missed in the lesson.
   */
  onPractice?: (keys: string[]) => void;
}) {
  const insets = useSafeAreaInsets();
  const scored = kind === 'test' || kind === 'final';
  const lessonEntry = useMemo(
    () => (lessonId ? LESSONS.find((e) => e.id === lessonId) : undefined),
    [lessonId],
  );
  const [runKey, setRunKey] = useState(0);
  // Every list of choices is dealt afresh each run (lesson/shuffle.ts), and the
  // dealt screens are the ones shown and graded.
  const [deckSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const base = useMemo(
    () => level.screens.map((s, i) => dealScreen(s, deckSeed + runKey * 7919 + i * 104729)),
    [level.screens, deckSeed, runKey],
  );
  const mainLen = base.length;
  // docs/ui/05-chart-questions-and-mistakes-round.md §4.5 and docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW]: after a lesson's own screens,
  // the mistakes round (opened by its deck) and the skills it taught. Built
  // when the last screen is passed; `tailFrom` maps each added question back
  // to the screen it repeats (-1 for the deck, a scene, the skills).
  const [tail, setTail] = useState<{ screens: PlayerScreen[]; from: number[] } | null>(null);
  const screens: PlayerScreen[] = useMemo(
    () => (tail ? [...base, ...tail.screens] : base),
    [base, tail],
  );

  const [index, setIndex] = useState(() => Math.max(0, Math.min(startAt, base.length - 1)));
  const [values, setValues] = useState<(AnswerValue | null)[]>(() => base.map(emptyValue));
  const [revealed, setRevealed] = useState<boolean[]>(() => base.map(() => false));
  const [grades, setGrades] = useState<(Grade | null)[]>(() => base.map(() => null));
  // The run of right answers each reveal ended on (feedback.ts, streakAfter).
  const [streaks, setStreaks] = useState<number[]>(() => base.map(() => 0));
  // The round's deck gathers before its first card is dealt.
  const [dealing, setDealing] = useState(false);
  // A trade call's phase belongs to the screen that reported it. Kept with its
  // index, so a second chart-decision straight after a first never inherits the
  // first one's 'done' -- which revealed it, graded wrong, before any choice.
  const [phaseAt, setPhaseAt] = useState<{ index: number; phase: DecisionPhase }>({
    index: -1,
    phase: 'deciding',
  });
  const [quitOpen, setQuitOpen] = useState(false);
  // Where a chart decision's chart ends, once its call is made (DecisionSpace).
  const [chartBottom, setChartBottom] = useState<number | null>(null);
  // docs/ui/14-glossary-and-copy.md §8: the sheet of a marked term, open over the screen.
  const [termOpen, setTermOpen] = useState<string | null>(null);
  const closeTerm = useCallback(() => setTermOpen(null), []);
  // docs/ui/06-reveal-and-hearts.md §5.2 [DESIGN-REVIEW, David 2026-10-04: "I want the hearts to go
  // away even if it isn't a checkpoint level"]: every wrong answer in a lesson
  // or a test costs a heart, its mistakes round included, and the run stops
  // once the last one is gone. Practice, the first trade and the path choice
  // never cost one; practice gives one back (§7.3).
  const spendsHearts = !testBench && kind !== 'practice' && kind !== 'first' && kind !== 'path';
  // A test opens on a briefing: what it asks, the pass mark, the hearts taken in.
  const briefing: Briefing | undefined = scored
    ? {
        kind: kind === 'final' ? 'Final Exam' : 'Checkpoint',
        questions: base.filter((sc) => isQuestion(sc as Screen)).length,
        pass: Math.round(PASS_MARK * 100),
        hearts: spendsHearts ? heartsNow(getProgress()).hearts : null,
      }
    : undefined;
  const [outOfHearts, setOutOfHearts] = useState(
    () => spendsHearts && heartsNow(getProgress()).hearts === 0,
  );
  // docs/ui/07-lesson-chapter-and-tier-complete.md §5.4: on a badge or a tier the CTA comes last. The screen says
  // when its sequence is done, and the CTA is held until then.
  const [settledAt, setSettledAt] = useState(-1);
  // `carousel`, `walkthrough` and `checklist-reveal` count as several screens
  // (docs/level-files/), so they hold a cursor the CTA advances before the index does.
  const [cursor, setCursor] = useState(0);
  // The learner's own plan, for this run (docs/level-files/05-the-plan.md, "The plan").
  // docs/ui/03-screen-types.md §3 `plan-card`: the learner's plan is theirs to keep. A card
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
  // The lesson's own answers decide perfect: the mistakes round does not
  // (docs/ui/05-chart-questions-and-mistakes-round.md §4.5: a lesson with a round is finished, not perfect).
  const mainGrades = grades.slice(0, mainLen);
  const answeredMain = mainGrades.filter((g) => g !== null);
  const perfectRun = answeredMain.length > 0 && answeredMain.every((g) => g === 'correct');
  // docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW]: the first perfect run of a lesson leaves
  // a chest (ChestScreen), after its last screen and before the summary.
  const [wasPerfect] = useState(() => !!(lessonId && getProgress().done[lessonId]?.perfect));
  const chestDue =
    kind === 'lesson' &&
    !testBench &&
    !wasPerfect &&
    base.every((s, i) => !isQuestion(s as Screen) || grades[i] === 'correct') &&
    base.some((s) => isQuestion(s as Screen));
  // Reported once per run, the moment the summary is reached (docs/ui/
  // §5.3). The lesson's skills are collected then, and the new ones reported
  // for the flight into Practice.
  const reported = useRef(-1);
  useEffect(() => {
    // Scored levels and the path choice report on their own terms (onCta).
    if (kind !== 'lesson' && kind !== 'practice' && kind !== 'bonus') return;
    if (!atSummary || !onComplete || reported.current === runKey) return;
    reported.current = runKey;
    const fresh =
      kind === 'lesson' && lessonEntry ? collectSkills(skillsOf(lessonEntry).map((s) => s.id)) : [];
    onComplete({
      perfect: perfectRun,
      skills: fresh,
      right: answeredMain.filter((g) => g !== 'wrong').length,
      asked: answeredMain.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atSummary, onComplete, runKey, kind]);
  const screen = atSummary ? null : (screens[index] as Screen);
  const decisionPhase: DecisionPhase = phaseAt.index === index ? phaseAt.phase : 'deciding';
  const setDecisionPhase = useCallback(
    (phase: DecisionPhase) => setPhaseAt({ index, phase }),
    [index],
  );
  const value = atSummary ? null : values[index];
  const isRevealed = atSummary ? false : revealed[index];
  // On a lesson's last screen, its mistakes round and new skills are still to
  // come when it has any: the key says "Continue", not "Finish".
  const tailAhead =
    index === mainLen - 1 &&
    tail === null &&
    kind === 'lesson' &&
    !testBench &&
    (base.some((s, i) => isQuestion(s) && grades[i] === 'wrong') ||
      (!!lessonEntry && skillsOf(lessonEntry).some((sk) => !getProgress().skills[sk.id])) ||
      chestDue);
  const isLast = index === screens.length - 1 && !tailAhead;

  const reset = useCallback(() => {
    setIndex(0);
    setTail(null);
    setDealing(false);
    setValues(base.map(emptyValue));
    setRevealed(base.map(() => false));
    setGrades(base.map(() => null));
    setStreaks(base.map(() => 0));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, fade, slide]);

  const doReveal = useCallback(() => {
    if (!screen || !isQuestion(screen) || !value) return;
    // Nothing chosen is nothing to grade.
    if (!canCheck(screen as QuestionScreen, value)) return;
    const g = gradeAnswer(screen as QuestionScreen, value);
    const streak = streakAfter(grades, index, g);
    setGrades((prev) => prev.map((x, i) => (i === index ? g : x)));
    setStreaks((prev) => prev.map((x, i) => (i === index ? streak : x)));
    setRevealed((prev) => prev.map((x, i) => (i === index ? true : x)));
    // docs/ui/06-reveal-and-hearts.md §5.1: the verdict lands the instant it is known. A run of right
    // answers climbs the chime a step at a time. The first decision has no
    // verdict: it lands as a page turning.
    if (kind === 'first') advanceFeedback();
    else {
      revealFeedback(g, streak);
      emitMood(g === 'correct' ? (streak >= STREAK_FROM ? 'streak' : 'correct') : g, streak);
    }
    // The heart goes with the verdict, in the same frame (HeartMeter).
    if (g === 'wrong' && spendsHearts) loseHeart();
    // docs/ui/12-practice-and-stats.md §7.3: the record behind practice and the stats. The test
    // bench and the lessons made in code keep none.
    const key = keyOf(index);
    if (key) {
      recordAnswer(key, g, answerSummary(screen as QuestionScreen, value), {
        keepMistake: index >= mainLen,
      });
      if (screen.type === 'chart-decision' && value.kind === 'decision' && value.choice) {
        const r = decisionReveal(screen, value.choice, g);
        recordDecision({
          q: key,
          choice: value.choice,
          grade: g,
          result: r.pnl > 0 ? 'won' : r.pnl < 0 ? 'lost' : 'flat',
          aside: r.stoodAside,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, value, index, grades, spendsHearts, kind]);

  // Types that commit on the tap itself reveal as soon as an answer exists, with
  // no Check step in between (see COMMITS_ON_TAP). `chart-decision` is the one
  // exception: it commits on tap too, but its reveal waits for the chart to
  // finish playing out (docs/ui/05-chart-questions-and-mistakes-round.md §4.3).
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

  // The incoming screen is what gets the beat: Calm's cross-fade, rising a
  // few points into place (docs/ui/15-theming-and-accessibility.md §10) while the progress bar fills
  // underneath it. Going back, it settles down from above instead. Fading the
  // outgoing screen out first would buy nothing but a blank frame between two
  // screens. A tap never waits for this: Continue and the answers work from
  // the first frame, and the next screen restarts the beat.
  useEffect(() => {
    const beat = { duration: m.fade(DURATION.screen), easing: EASE_OUT };
    fade.set(0);
    slide.set(m.travel(RISE.screen) * direction.current);
    fade.set(withTiming(1, beat));
    slide.set(m.reduced ? 0 : withTiming(0, beat));
  }, [index, runKey, outOfHearts, fade, slide, m]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateY: slide.get() }],
  }));

  const advance = () => {
    // Only swallow a true double-fire. This used to block for the whole length
    // of the transition, which ate deliberate fast taps and made the CTA feel
    // like it needed pressing twice.
    if (doubleFire(lastAdvance)) return;
    direction.current = 1;
    // Past a lesson's last screen: its mistakes round and its skills, if any.
    if (index === mainLen - 1 && tail === null && kind === 'lesson' && !testBench) {
      const added = buildTail();
      setTail(added);
      if (added.screens.length) {
        const blank = added.screens.map(() => null);
        setValues((prev) => [...prev, ...added.screens.map((s) => emptyValue(s as Screen))]);
        setRevealed((prev) => [...prev, ...added.screens.map(() => false)]);
        setGrades((prev) => [...prev, ...blank]);
        setStreaks((prev) => [...prev, ...added.screens.map(() => 0)]);
      }
    }
    setIndex((i) => i + 1);
  };

  /**
   * docs/ui/05-chart-questions-and-mistakes-round.md §4.5: every question answered wrong comes back once, in a new
   * order and dealt afresh, opened by the deck; a question that followed a
   * scene brings the scene. Then §5.3: the skills this lesson taught that the
   * learner did not have yet.
   */
  const buildTail = (): { screens: PlayerScreen[]; from: number[] } => {
    const out: PlayerScreen[] = [];
    const from: number[] = [];
    const missed = base
      .map((s, i) => ({ s, i }))
      .filter(({ s, i }) => isQuestion(s) && grades[i] === 'wrong');
    if (missed.length) {
      out.push({
        type: 'mistakes-deck',
        items: missed.map(({ s, i }) => ({
          line: questionLine(s),
          answer: answerSummary(s as QuestionScreen, values[i]),
        })),
      });
      from.push(-1);
      // A new order: the round's own shuffle, seeded by the run.
      const order = [...missed].sort(
        (a, b) =>
          ((a.i * 7919 + runKey * 31 + deckSeed) % 97) -
          ((b.i * 7919 + runKey * 31 + deckSeed) % 97),
      );
      for (const { i } of order) {
        const before = level.screens[i - 1];
        if (before?.type === 'story') {
          out.push(before);
          from.push(-1);
        }
        out.push(dealScreen(level.screens[i], deckSeed + runKey * 7919 + i * 104729 + 15485863));
        from.push(i);
      }
    }
    const learned = lessonEntry
      ? skillsOf(lessonEntry).filter((sk) => !getProgress().skills[sk.id])
      : [];
    if (learned.length) {
      out.push({ type: 'skills-learned', skills: learned });
      from.push(-1);
    }
    if (chestDue) {
      out.push({ type: 'chest' });
      from.push(-1);
    }
    return { screens: out, from };
  };

  /** The record's key for the question on screen `i`, or null where none is kept. */
  const keyOf = (i: number): string | null => {
    if (testBench) return null;
    const at = i < mainLen ? i : (tail?.from[i - mainLen] ?? -1);
    if (at < 0) return null;
    if (sourceKeys) return sourceKeys[at] ?? null;
    return lessonId ? questionKey(lessonId, at) : null;
  };

  // docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [v4]: the questions missed in the lesson's
  // own screens (the mistakes round does not count again), for the list on
  // lesson complete and its "Practice these".
  const missed = base
    .map((sc, i) => ({ sc: sc as Screen, i }))
    .filter(({ sc, i }) => isQuestion(sc) && mainGrades[i] === 'wrong')
    .map(({ sc, i }) => ({ line: copy(questionLine(sc, 56)) || `Screen ${i + 1}`, key: keyOf(i) }));
  const missedKeys = missed
    .map((m) => m.key)
    .filter((k): k is string => k !== null && resolveKey(k) !== null);

  // Back, on a test level only (docs/ui/02-lesson-player-layout.md §2 keeps it out of lessons): a card
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
  const score = useMemo(() => scoreOf(screens as Screen[], grades), [screens, grades]);
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
    if ((screen as PlayerScreen).type === 'mistakes-deck') return 'Start the round';
    if ((screen as PlayerScreen).type === 'chest' && cursor === 0) return 'Open the chest';
    if (screen.type === 'checklist-reveal' && cursor < screen.items.length) {
      return cursor === 0 ? 'Start the list' : 'Next item';
    }
    // A card or step with more after it: "Next", so the button says there is more.
    if (screen.type === 'carousel' && cursor < screen.cards.length - 1) return 'Next';
    if (screen.type === 'walkthrough' && cursor < screen.steps.length - 1) return 'Next';
    if (!isQuestion(screen)) return isLast ? 'Finish' : 'Continue';
    if (!isRevealed) return 'Check';
    if (kind === 'first') return 'Continue';
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

  // docs/ui/08-quotes-and-charts.md §6.4: the decision buttons occupy the CTA slot until the outcome
  // lands. They stay there through the replay, the chosen one lit and the rest
  // stepped back: the learner watches the outcome of *that* call, and the slot
  // keeping its height means the chart does not drop the moment it starts.
  const showDecisionButtons =
    !outOfHearts && !!screen && screen.type === 'chart-decision' && !isRevealed;
  const chosenDecision = value && value.kind === 'decision' ? value.choice : null;
  // docs/ui/09-order-tools-and-other-visuals.md §6.7 [DESIGN-REVIEW]: an order ticket is placed with a slide, not checked with a tap.
  const slidesToPlace =
    !outOfHearts && !!screen && screen.type === 'order-build' && !isRevealed && kind !== 'first';

  const onSettled = useCallback(() => setSettledAt(index), [index]);
  const held =
    !!screen && (screen.type === 'badge' || screen.type === 'tier-up') && settledAt !== index;

  const ctaHidden = ctaHiddenBeforeReveal && !outOfHearts;

  // One press, one cue. Check fires nothing on the way down: the verdict is its
  // sound, on release. A checklist's CTA reveals the next item, which rings its
  // own note. Everything else that moves the lesson on plays the soft tap of
  // the lesson's ✕ (stage LOOK-BRIEF, docs/ui/15-theming-and-accessibility.md §10): Continue is pressed on
  // every screen, so it is the quietest sound there is.
  const ctaCue: CueName | null =
    !screen || outOfHearts
      ? 'tick'
      : screen.type === 'checklist-reveal' && cursor < screen.items.length
        ? null
        : isQuestion(screen) && !isRevealed
          ? null
          : 'tick';

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
    // Shut, then open (ChestScreen): the key opens it before it moves on.
    if ((s as PlayerScreen).type === 'chest') return 2;
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
    // The first decision ends on its own note, with no summary.
    if (kind === 'first' && isRevealed && isLast) {
      onComplete?.({ perfect: false, skills: [], right: 0, asked: 0 });
      leave();
      return;
    }
    // The deck gathers and shuffles once, then the round's first card comes.
    if ((screen as PlayerScreen).type === 'mistakes-deck') {
      if (dealing) return;
      tapFeedback();
      setDealing(true);
      setTimeout(
        () => {
          setDealing(false);
          advance();
        },
        m.reduced ? 0 : DEAL_MS,
      );
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
    // docs/ui/03-screen-types.md §3 `summary`: below the pass mark the button retries, from
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
      if (score.passed) {
        onComplete?.({
          perfect: score.perfect,
          skills: [],
          right: score.counted,
          asked: score.total,
        });
      }
      leave();
      return;
    }
    advance();
  };

  const g = atSummary ? null : grades[index];
  const streak = atSummary ? 0 : streaks[index];
  // docs/ui/06-reveal-and-hearts.md §5.1 [DESIGN-REVIEW]: the lesson's last question is the one
  // whose chosen answer turns over to its verdict.
  const lastQuestion = useMemo(() => {
    for (let i = mainLen - 1; i >= 0; i--) if (isQuestion(screens[i] as Screen)) return i;
    return -1;
  }, [screens, mainLen]);
  const big = kind !== 'first' && index === lastQuestion;
  const verdict = useMemo(() => (g ? { grade: g, streak, big } : null), [g, streak, big]);
  // A trade call, from its key (docs/ui/05-chart-questions-and-mistakes-round.md §4.3).
  // The feel has to land on the call, not when the chart stops playing.
  const decide = (button: DecisionButton) => {
    commitFeedback();
    emitMood('commit', runBefore(grades, index));
    setValue({ kind: 'decision', choice: button });
  };
  // A run of three or more warms the progress bar (ProgressBar).
  const onRun = runBefore(grades, index + 1) >= 3;

  // How tall this screen's verdict will be, from its invisible copy in the
  // footer; the screen keeps that much room free under itself (lesson/fit.tsx).
  const [probeH, setProbeH] = useState(0);
  const revealRoom = probeH > 0 ? probeH + space.md : REVEAL_GROWTH;

  // docs/ui/06-reveal-and-hearts.md §5.1b: a chart decision's reveal is worked out from the button
  // actually pressed, so its first line always speaks to that choice.
  const lessonInfo = useMemo(
    () => ({ lessonId: lessonId ?? null, everything: testBench }),
    [lessonId, testBench],
  );
  // docs/ui/08-quotes-and-charts.md §6.4: R joins the result line once the lesson that teaches it is behind.
  const showR = testBench || knowsR(lessonId ?? null, getProgress().done);
  const decision = useMemo(() => {
    if (!screen || screen.type !== 'chart-decision' || !g) return undefined;
    if (value?.kind !== 'decision' || !value.choice) return undefined;
    return decisionReveal(screen, value.choice, g, { showR });
  }, [screen, g, value, showR]);

  // docs/ui/14-glossary-and-copy.md §8 [DESIGN-REVIEW]: which terms each screen marks, worked out
  // once per run: terms of lessons played, a term's first appearance only, two
  // on a screen at most.
  const termPlan = useMemo(
    () =>
      testBench
        ? []
        : markPlan(screens as Screen[], markableTerms(lessonId ?? null, getProgress().done)),
    [screens, testBench, lessonId],
  );

  // The room under a decided chart, from its bottom to the key: the reveal
  // fills it when it holds the tallest reveal this screen can have.
  const [areaH, setAreaH] = useState(0);
  const fillsUnderChart =
    !!screen &&
    screen.type === 'chart-decision' &&
    chartBottom !== null &&
    areaH > 0 &&
    areaH - chartBottom - space.sm >= probeH - 2;

  const working =
    screen && (screen.type === 'numeric-mc' || screen.type === 'numeric-input')
      ? screen.working
      : undefined;

  // The lesson's own screens fill the bar; the round after them keeps it full
  // and counts itself beside it ("Fix 1/2").
  const inTail = !atSummary && index >= mainLen;
  const roundAt =
    inTail && tail ? tail.from.slice(0, index - mainLen + 1).filter((f) => f >= 0).length : 0;
  const roundOf = tail ? tail.from.filter((f) => f >= 0).length : 0;
  const progress =
    atSummary || inTail
      ? 1
      : (index + (stepCount(screen) > 1 ? cursor / stepCount(screen) : 0)) / mainLen;

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
            style={[styles.close, styles.back, !canGoBack && styles.backOff]}
          >
            <Text style={styles.backText}>{'‹'}</Text>
          </Pressable>
        ) : null}
        <ProgressBar progress={progress} steps={mainLen} hot={onRun} />
        {/* docs/ui/02-lesson-player-layout.md §2: the step count beside the bar, in the number face
            (Precise, stage LOOK-BRIEF). In the mistakes round it counts the
            round instead. */}
        {!atSummary && !inTail ? (
          <Text style={styles.page} accessibilityLabel={`Step ${index + 1} of ${mainLen}`}>
            {`${index + 1}/${mainLen}`}
          </Text>
        ) : inTail && roundAt > 0 ? (
          <Text style={styles.page} accessibilityLabel={`Mistake ${roundAt} of ${roundOf}`}>
            {`Fix ${roundAt}/${roundOf}`}
          </Text>
        ) : null}
        {/* The run of right answers, in the looks that count it: the combo
            counter (docs/ui/02-lesson-player-layout.md §2 [DESIGN-REVIEW]) in a fixed slot, so the
            bar keeps its length as the badge comes and goes. */}
        {spec.streak !== 'none' ? (
          <ComboMeter run={runBefore(grades, atSummary ? grades.length : index + 1)} />
        ) : null}
        <HeartMeter />
      </View>

      {/* The animated wrapper must outlive the screen swap: if the node carrying
          the opacity is the one that remounts, Animated loses its host and the
          incoming screen stays at the outgoing screen's last value. The keyed
          content area inside gives each screen fresh component state; the
          wrapper around it stays put. */}
      <Animated.View
        style={[styles.scroll, screenStyle]}
        onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}
      >
        {/* docs/ui/02-lesson-player-layout.md §2: a screen is one screenful. One that does not fit --
            a short window, a long reveal, type past 130% -- is scaled down to
            85 % at most, and scrolls past that (lesson/fit.tsx). */}
        <FitScreen
          key={`${runKey}-${index}-${outOfHearts}`}
          contentStyle={styles.content}
          bottomPad={space.lg}
          // chart-decision holds its own chart on the grid; every other screen
          // sits in the middle of the area (lesson/fit.tsx).
          anchor={!outOfHearts && screen?.type === 'chart-decision' ? 'fill' : 'center'}
          reserve={!outOfHearts && screen && isQuestion(screen) ? revealRoom : 0}
          revealed={isRevealed}
        >
          <VerdictProvider value={verdict}>
            {/* Which lesson this is, and the terms this screen marks (DESIGN-REVIEW). */}
            <LessonContext.Provider value={lessonInfo}>
              <DecisionSpace.Provider value={setChartBottom}>
                <TermsContext.Provider value={{ ids: termPlan[index] ?? [], onOpen: setTermOpen }}>
                  {/* The learner's plan, for every plan-sheet on any screen (review M1). */}
                  <PlanValues.Provider value={plan}>
                    {outOfHearts ? (
                      <OutOfHearts />
                    ) : atSummary ? (
                      <LessonComplete
                        screens={base}
                        grades={mainGrades}
                        levelTitle={level.title}
                        subtitle={
                          kind === 'practice'
                            ? undefined
                            : (level.subtitle ?? (testBench ? undefined : lessonEntry?.subtitle))
                        }
                        missed={missed.map((m) => m.line)}
                        onPractice={
                          onPractice && kind !== 'practice' && missedKeys.length > 0
                            ? () => onPractice(missedKeys)
                            : undefined
                        }
                        xp={kind === 'practice' ? 0 : level.xp}
                        daily={!testBench && !!onComplete && kind === 'lesson'}
                        practice={kind === 'practice'}
                        gems={
                          (kind === 'bonus' ? (level.gems ?? 0) : 0) +
                          (tail?.screens.some((t) => t.type === 'chest') ? CHEST_PAYOUT : 0)
                        }
                        lessonId={lessonId ?? null}
                      />
                    ) : (screen as PlayerScreen).type === 'mistakes-deck' ? (
                      <MistakesDeck
                        items={(screen as unknown as DeckScreen).items}
                        dealing={dealing}
                      />
                    ) : (screen as PlayerScreen).type === 'chest' ? (
                      <ChestScreen open={cursor > 0} onOpen={() => setCursor(1)} />
                    ) : (screen as PlayerScreen).type === 'skills-learned' ? (
                      <SkillsLearned skills={(screen as unknown as SkillsScreen).skills} />
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
                          // The plan is kept from every lesson on the path; the test
                          // bench and the path choice only show it.
                          if (!testBench && kind !== 'path') savePlan({ [key]: v });
                        },
                        pathChoice,
                        setPathChoice,
                        onSettled,
                        allScreens: screens as Screen[],
                        grades,
                        briefing,
                      })
                    )}
                  </PlanValues.Provider>
                </TermsContext.Provider>
              </DecisionSpace.Provider>
            </LessonContext.Provider>
          </VerdictProvider>
        </FitScreen>
        {/* docs/ui/02-lesson-player-layout.md §2: the reveal lies over a strip the screen kept free for
            it, at the bottom of the content area just above the key, instead of
            pushing the content area shorter -- a shorter area is what moved and
            shrank everything on the screen the moment Check was pressed. The
            strip is as tall as this screen's own verdict, measured beforehand
            by a copy of it. It is placed from the content area's own bottom
            edge in points (David, 2026-09-30: on his iPhone the box sat over
            Continue when it hung from the footer by a percentage). */}
        {!outOfHearts && screen && isQuestion(screen) && !isRevealed ? (
          <View style={styles.revealSlot} pointerEvents="none">
            <RevealProbe
              key={`${runKey}-${index}`}
              explanation={probeExplanation(screen)}
              working={!!working}
              decision={
                screen.type === 'chart-decision'
                  ? // Once the call is made, the verdict it brings (ChartDecisionScreen
                    // sizes its chart to that one).
                    value?.kind === 'decision' && value.choice
                    ? decisionReveal(screen, value.choice, undefined, { showR })
                    : longestDecisionReveal(screen, { showR })
                  : undefined
              }
              onHeight={setProbeH}
            />
          </View>
        ) : null}
        {!outOfHearts && screen && isQuestion(screen) && isRevealed && g ? (
          <View
            style={[
              styles.revealSlot,
              // A chart decision's reveal fills the room under its chart, so
              // chart and verdict fill the screen together (DecisionSpace).
              fillsUnderChart ? { top: (chartBottom as number) + space.sm } : null,
            ]}
          >
            <View style={[styles.revealGround, fillsUnderChart ? styles.revealFill : null]}>
              {kind === 'first' ? (
                <FirstNote fill={fillsUnderChart} />
              ) : (
                <Reveal
                  grade={g}
                  lead={decision?.lead}
                  decision={decision}
                  fill={fillsUnderChart}
                  explanation={
                    // A branch's reveals live on its steps (docs/level-files/); the panel
                    // gives the one that matters most for the path taken.
                    screen.type === 'branch'
                      ? branchExplanation(screen, value?.kind === 'branch' ? value.picks : [])
                      : (screen as Exclude<QuestionScreen, { type: 'branch' }>).explanation
                  }
                  working={working}
                  streak={streak}
                />
              )}
            </View>
          </View>
        ) : null}
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        {showDecisionButtons ? (
          <DecisionButtons
            buttons={decisionButtons(screen as any)}
            chosen={chosenDecision}
            onChoose={decide}
          />
        ) : ctaHidden ? null : slidesToPlace ? (
          <SlideKey label="Slide to place" disabled={ctaDisabled} onPlace={onCta} />
        ) : (
          <Cta
            label={ctaLabel}
            disabled={ctaDisabled}
            onPress={onCta}
            cue={ctaCue}
            good={
              kind !== 'first' &&
              !outOfHearts &&
              !!screen &&
              isQuestion(screen) &&
              isRevealed &&
              g === 'correct'
            }
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

      <TermSheet skillId={termOpen} onClose={closeTerm} />

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

/**
 * docs/ui/16-navigation.md §11.1 [DESIGN-REVIEW]: the first decision is not graded. In the
 * verdict's place, one neutral note: what just happened, and what the app is.
 */
function FirstNote({ fill }: { fill: boolean }) {
  return (
    <Arrive style={fill ? styles.firstFill : undefined}>
      <View
        style={[styles.firstNote, fill && styles.firstFill]}
        accessible
        accessibilityRole="summary"
      >
        <Text style={styles.firstTitle}>That was your first decision.</Text>
        <Text style={styles.firstLine}>{FIRST_TRADE_LINE}</Text>
      </View>
    </Arrive>
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
  /** Every screen of the run and its grade, for a test's `summary`. */
  allScreens: Screen[];
  grades: (Grade | null)[];
  /** A test's intro is a briefing card (docs/ui/03-screen-types.md §3 `intro`). */
  briefing?: Briefing;
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
    briefing,
  } = props;

  const q = { value, onChange: setValue, revealed: isRevealed };

  switch (screen.type) {
    case 'intro':
      return (
        <IntroScreen
          screen={screen}
          levelTitle={level.title}
          chapterTitle={level.chapter_title}
          briefing={briefing}
        />
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
    // --- docs/ui/03-screen-types.md §3, the remaining non-question archetypes ---
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
      return <RecapScreen screen={screen} source={(point) => sourceCardOf(level, point)} />;
    case 'plan-card':
      return <PlanCardScreen screen={screen} values={plan} onChange={setPlanValue} />;
    case 'badge':
      return (
        <BadgeScreen
          screen={screen}
          chapter={level.chapter}
          path={level.path === 'all' ? null : level.path}
          onSettled={onSettled}
        />
      );
    case 'tier-up':
      return (
        <TierUpScreen
          screen={screen}
          path={level.path === 'all' ? null : level.path}
          onSettled={onSettled}
        />
      );
    case 'path-choice':
      return <PathChoiceScreen screen={screen} value={pathChoice} onChange={setPathChoice} />;
    case 'summary':
      // docs/level-files/ keeps `summary` for tests and final exams, where a pass
      // mark and a retry make the per-question list mean something. A lesson
      // ends on LessonComplete instead.
      return (
        <Summary screens={allScreens} grades={grades} levelTitle={level.title} xp={level.xp} />
      );

    // --- docs/ui/04-question-types.md §4.1, the remaining v2 question types ---
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

    // --- docs/ui/04-question-types.md §4.2, the v3 question types ---
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

const styles = themed(() => ({
  firstNote: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  firstFill: { flexGrow: 1 },
  firstTitle: { ...type.title, color: colors.text },
  firstLine: { ...type.body, color: colors.textMuted },
  // The backdrop paints the ground now; every container above it is glass.
  root: { flex: 1, backgroundColor: 'transparent' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  // A 48 pt target (docs/ui/15-theming-and-accessibility.md §10) that lays out like a 32 pt one.
  close: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    margin: -(TAP_TARGET - 32) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Its 48 pt target meets the ✕'s instead of covering 4 pt of it.
  back: { marginLeft: -(TAP_TARGET - 32) / 2 + 4 },
  backText: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: -3,
  },
  backOff: { opacity: 0.25 },
  // Monospaced, so "9/12" to "10/12" does not nudge the bar.
  page: { ...type.label, fontFamily: MONO_FONT, color: colors.textMuted },
  scroll: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  secondary: { alignSelf: 'center', paddingVertical: space.xs, paddingHorizontal: space.md },
  secondaryText: { ...type.label, color: colors.textMuted },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  // At the bottom of the content area, right on the footer (DESIGN-REVIEW,
  // David: "just above the button, else the gap looks weird").
  revealSlot: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    bottom: 0,
    paddingBottom: space.xs,
  },
  // The reveal's tint is see-through; over the content area it needs ground.
  revealGround: { backgroundColor: colors.background, borderRadius: radius.md },
  revealFill: { flex: 1 },
}));
