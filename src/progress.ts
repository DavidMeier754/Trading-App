import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  CHAPTER_ONE,
  Chapter,
  PATH,
  PATH_CHOICE_ID,
  TradingPath,
  chaptersFor,
  levelsOf,
} from './content';
import {
  getHapticsSetting,
  HapticsSetting,
  setHapticsSetting,
  subscribeHaptics,
} from './lesson/haptics';
import { getLook, isLook, Look, setLook, subscribeLook } from './lesson/look';
import { isSoundEnabled, setSoundEnabled, subscribeSound } from './lesson/sound';
import {
  getThemeMode,
  isColourBlind,
  setColourBlind,
  setThemeMode,
  subscribeTheme,
  type ThemeMode,
} from './theme';
import {
  getMotionSetting,
  MotionSetting,
  setMotionSetting,
  subscribeMotion,
} from './lesson/useReduceMotion';

/**
 * What the learner has done, and how they like the app, kept on the device.
 *
 * Progress is what the path map draws (docs/UI.md §7.1): which sub-levels are
 * finished and whether every answer in one was right (a perfect run earns the
 * gold ring). The HUD reads the rest (§7.2): the streak in days -- one
 * finished lesson a day keeps it (§5.3) -- and the hearts (§5.2): a wrong
 * answer in a lesson or a test costs one, and five hours after the first was
 * lost they are all back.
 *
 * It also keeps the learner's record (docs/UI.md §7.3, DESIGN-REVIEW): every
 * graded question with its spaced-repetition box, the mistakes still open,
 * each chart decision, the skills collected and the plan's dates. Practice,
 * the mistakes reviews and the stats are built on it. Nothing in it is money.
 *
 * Saved with AsyncStorage (localStorage on the web). A storage that fails or
 * is missing is not an error: the app runs on what is in memory, and simply
 * starts fresh next time.
 */
export type Progress = {
  /** Finished sub-levels, by lesson id (`level-01-2`). */
  done: Record<string, { perfect: boolean }>;
  /** Days in a row with a finished lesson; `last` is the last of them. */
  streak: { days: number; last: string | null };
  /** Lessons finished today: the first of them keeps the streak. */
  today: { date: string; count: number };
  /** Every XP the summaries have handed out, replays included. */
  xp: number;
  /**
   * Gems, the in-game currency (docs/UI.md §7.2), shown in the top bar since
   * David asked for them on 2026-09-30. How they are earned and what they buy
   * come later (stage LOOP-DAILY, decision U); until then only the testing
   * tools hand them out.
   */
  gems: number;
  /** docs/UI.md §11.4: the path picked after Chapter 1, or null before that. */
  path: TradingPath | null;
  /**
   * Paths not written yet that the learner wants to hear about (S27): someone
   * without time at the market open flags Swing Trading. Kept on this device
   * only; the reminder that reads it comes with stage LOOP-DAILY.
   */
  wanted: TradingPath[];
  /**
   * The learner's plan (docs/schema.md "The plan"): every plan-card field they
   * have filled, by key. A card that asks for a key again opens on this value.
   */
  plan: Record<string, string>;
  /** Hearts as last written; `heartsNow` adds the ones that have come back since. */
  hearts: number;
  /** When the first missing heart was lost (ms since 1970): the refill clock. Null when full. */
  heartsAt: number | null;

  // --- The record (docs/UI.md §7.3) ----------------------------------------

  /** Every graded question, by `questionKey` (`level-01-1#5`). */
  questions: Record<string, QuestionRecord>;
  /** Questions missed and not answered right since, with what was answered. */
  mistakes: Record<string, MistakeRecord>;
  /** Each chart decision answered, oldest first, the last `DECISION_LOG_MAX`. */
  decisions: DecisionRecord[];
  /** Skills collected (`skillsOf` in content.ts), by id: when, and whether Practice has shown it. */
  skills: Record<string, { at: number; seen: boolean }>;
  /** Skills collected since the Practice tab was last opened: its dot, and the cards that fly to it. */
  newSkills: number;
  /** Times each sub-level was finished. */
  plays: Record<string, number>;
  /** When each plan key was last written (ms). */
  planAt: Record<string, number>;
  /** The longest streak so far, in days. */
  bestStreak: number;
  /**
   * Lessons finished on each local day, `2026-10-04` -> 2: the heat map on
   * Account (docs/UI.md §7.4 [DESIGN-REVIEW], "Practice as a heat map").
   */
  days: Record<string, number>;
  /** The first trade of a fresh install (docs/UI.md §11.1) has been played. */
  firstTrade: boolean;
  /**
   * docs/UI.md §7.4: the chapters whose medal the Account shelf has already
   * landed. A medal won since lands and shines once the next time the shelf
   * shows. Null until the shelf is first seen: it then takes the medals there
   * are as shown, so nothing old plays as new.
   */
  medalsShown: number[] | null;
};

/** One graded question in the record: how it has gone, and when it is due again. */
export type QuestionRecord = {
  right: number;
  wrong: number;
  last: 'right' | 'wrong';
  /** When it was last answered (ms). */
  at: number;
  /** Its Leitner box, 1–5 (docs/UI.md §7.3). */
  box: number;
  /** The local day it is due again, `2026-10-04`. */
  due: string;
};

export type MistakeRecord = {
  /** What the learner answered, in words: "Short", "$0.40". */
  answer: string;
  at: number;
};

export type DecisionRecord = {
  q: string;
  choice: string;
  grade: 'correct' | 'amber' | 'wrong';
  /** The trade's result, or what standing aside would have given. */
  result: 'won' | 'lost' | 'flat';
  /** The learner stood aside (wait, no trade). */
  aside: boolean;
  at: number;
};

/** The decision log keeps this many, newest last. */
export const DECISION_LOG_MAX = 2000;

/** docs/UI.md §7.3: days until a question is due again, by its box. */
export const BOX_DAYS = [1, 3, 7, 16, 35] as const;

export const MAX_HEARTS = 5;
/**
 * docs/UI.md §5.2 (David, 2026-10-03): "all 5 hours ALL hearts get added
 * back". The first heart lost starts the clock; five hours later every heart
 * is back at once.
 */
export const HEART_REFILL_MS = 5 * 60 * 60 * 1000;

const PROGRESS_KEY = 'progress.v1';
const SETTINGS_KEY = 'settings.v1';

const fresh = (): Progress => ({
  done: {},
  streak: { days: 0, last: null },
  today: { date: dayOf(new Date()), count: 0 },
  xp: 0,
  gems: 0,
  path: null,
  wanted: [],
  plan: {},
  hearts: MAX_HEARTS,
  heartsAt: null,
  questions: {},
  mistakes: {},
  decisions: [],
  skills: {},
  newSkills: 0,
  plays: {},
  planAt: {},
  bestStreak: 0,
  days: {},
  firstTrade: false,
  medalsShown: null,
});

let progress: Progress = fresh();
const listeners = new Set<() => void>();

function publish(next: Progress): void {
  progress = next;
  listeners.forEach((listener) => listener());
  save(PROGRESS_KEY, next);
}

export function getProgress(): Progress {
  return progress;
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getProgress,
    getProgress,
  );
}

/** A local calendar day, `2026-09-24`: a streak counts the learner's days, not UTC's. */
export function dayOf(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function dayBefore(day: string): string {
  return addDays(day, -1);
}

/** A local day `n` days after `day` (or before, for a negative `n`). */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayOf(new Date(y, m - 1, d + n));
}

/** The streak as it stands today: a run whose last day is before yesterday is over. */
export function streakDays(p: Progress, now = new Date()): number {
  const today = dayOf(now);
  if (p.streak.last === today || p.streak.last === dayBefore(today)) return p.streak.days;
  return 0;
}

/** Lessons finished today; one keeps the streak (docs/UI.md §5.3). */
export function doneToday(p: Progress, now = new Date()): number {
  return p.today.date === dayOf(now) ? p.today.count : 0;
}

/** docs/UI.md §5.3: what a summary hands out -- the lesson's XP, and half again for a perfect run. */
export function earnedXp(base: number, perfect: boolean): number {
  return base + (perfect ? Math.round(base * 0.5) : 0);
}

/**
 * A sub-level reached its summary: the XP it showed goes on the total, replays
 * included, so the number on the home screen is the sum of the summaries seen.
 * A replay keeps a perfect run it already had.
 */
export function completeLesson(
  id: string,
  { perfect, xp }: { perfect: boolean; xp: number },
): void {
  const today = dayOf(new Date());
  const p = progress;
  const days =
    p.streak.last === today
      ? p.streak.days
      : p.streak.last === dayBefore(today)
        ? p.streak.days + 1
        : 1;
  publish({
    ...p,
    done: { ...p.done, [id]: { perfect: perfect || !!p.done[id]?.perfect } },
    xp: p.xp + earnedXp(xp, perfect),
    streak: { days, last: today },
    today: { date: today, count: (p.today.date === today ? p.today.count : 0) + 1 },
    bestStreak: Math.max(p.bestStreak, days),
    plays: { ...p.plays, [id]: (p.plays[id] ?? 0) + 1 },
    days: { ...p.days, [today]: (p.days[today] ?? 0) + 1 },
  });
}

export function resetProgress(): void {
  publish(fresh());
}

/**
 * docs/UI.md §7.2: a streak that broke since the last lesson -- it had days,
 * and neither today nor yesterday has a lesson. Its screen plays once.
 */
export function lostStreak(p: Progress, now = new Date()): number {
  return p.streak.days > 0 && streakDays(p, now) === 0 ? p.streak.days : 0;
}

/** The lost streak's screen has played: the count is 0 until the next lesson. */
export function endLostStreak(): void {
  publish({ ...progress, streak: { days: 0, last: null } });
}

/**
 * Settings → Testing → Reset streak (David, 2026-10-04): the streak back to 0,
 * as if no lesson had been finished today or before. The longest streak stays.
 */
export function resetStreak(): void {
  publish({
    ...progress,
    streak: { days: 0, last: null },
    today: { date: dayOf(new Date()), count: 0 },
  });
}

/** The shelf has landed these medals (docs/UI.md §7.4). */
export function markMedalsShown(chapters: number[]): void {
  const shown = new Set([...(progress.medalsShown ?? []), ...chapters]);
  publish({ ...progress, medalsShown: [...shown].sort((a, b) => a - b) });
}

/**
 * docs/UI.md §11.4: the path, chosen once after Chapter 1 and changeable in
 * Settings. Choosing counts the path-choice node as done. Changing it later
 * keeps what was finished on the old path -- ids carry their path -- so going
 * back to it picks up where it was left.
 */
export function choosePath(path: TradingPath): void {
  const p = progress;
  // The lesson's XP once, the first time through; changing path later is free.
  const first = !p.done[PATH_CHOICE_ID];
  const xp = first ? p.xp + (pathLessonXp() ?? 0) : p.xp;
  publish({ ...p, path, xp, done: { ...p.done, [PATH_CHOICE_ID]: { perfect: true } } });
}

function pathLessonXp(): number | undefined {
  const node = CHAPTER_ONE.levels.find((l) => l.kind === 'path');
  return node?.subs[0]?.level.xp;
}

/** Flags a path that is not written yet as wanted, or takes the flag back. */
export function toggleWanted(path: TradingPath): void {
  const p = progress;
  const wanted = p.wanted.includes(path) ? p.wanted.filter((w) => w !== path) : [...p.wanted, path];
  publish({ ...p, wanted });
}

/** A plan card was filled in: its keys join the plan, over any older values. */
export function savePlan(values: Record<string, string>): void {
  const keys = Object.keys(values);
  if (keys.length === 0) return;
  const now = Date.now();
  const planAt = { ...progress.planAt };
  for (const key of keys) planAt[key] = now;
  publish({ ...progress, plan: { ...progress.plan, ...values }, planAt });
}

// ---------------------------------------------------------------------------
// The record (docs/UI.md §7.3).
// ---------------------------------------------------------------------------

/** A question's id in the record: its lesson and its place in the lesson's screens. */
export function questionKey(lessonId: string, screen: number): string {
  return `${lessonId}#${screen}`;
}

/** Where a key points: the lesson id and the screen index. */
export function parseQuestionKey(key: string): { lesson: string; screen: number } | null {
  const at = key.lastIndexOf('#');
  if (at <= 0) return null;
  const screen = Number(key.slice(at + 1));
  return Number.isInteger(screen) ? { lesson: key.slice(0, at), screen } : null;
}

/** The next state of one question after an answer: the Leitner box moves, and it is due again. */
export function nextRecord(
  before: QuestionRecord | undefined,
  right: boolean,
  now: number,
): QuestionRecord {
  const box = right ? Math.min(BOX_DAYS.length, (before?.box ?? 0) + 1) : 1;
  return {
    right: (before?.right ?? 0) + (right ? 1 : 0),
    wrong: (before?.wrong ?? 0) + (right ? 0 : 1),
    last: right ? 'right' : 'wrong',
    at: now,
    box,
    due: addDays(dayOf(new Date(now)), BOX_DAYS[box - 1]),
  };
}

/**
 * A graded answer goes into the record. Amber counts as right (it is, docs/UI.md
 * §4.3). A wrong answer opens a mistake with what was answered; a right one
 * closes it -- unless `keepMistake`, which the lesson's own mistakes round sets:
 * that round comes straight after the reveal, too soon to prove anything
 * (docs/UI.md §7.3).
 */
export function recordAnswer(
  key: string,
  grade: 'correct' | 'amber' | 'wrong',
  answer: string,
  { keepMistake = false }: { keepMistake?: boolean } = {},
): void {
  const now = Date.now();
  const p = progress;
  const right = grade !== 'wrong';
  const mistakes = { ...p.mistakes };
  if (!right) mistakes[key] = { answer, at: now };
  else if (!keepMistake) delete mistakes[key];
  publish({
    ...p,
    questions: { ...p.questions, [key]: nextRecord(p.questions[key], right, now) },
    mistakes,
  });
}

/** A chart decision for the decision grid's counts and the variance view (docs/UI.md §7.4). */
export function recordDecision(entry: Omit<DecisionRecord, 'at'>): void {
  const p = progress;
  const decisions = [...p.decisions, { ...entry, at: Date.now() }];
  publish({ ...p, decisions: decisions.slice(-DECISION_LOG_MAX) });
}

/** Skills reached at the end of a lesson (docs/UI.md §5.3). Returns the ones that are new. */
export function collectSkills(ids: string[]): string[] {
  const p = progress;
  const fresh = ids.filter((id) => !p.skills[id]);
  if (fresh.length === 0) return [];
  const now = Date.now();
  const skills = { ...p.skills };
  for (const id of fresh) skills[id] = { at: now, seen: false };
  publish({ ...p, skills, newSkills: p.newSkills + fresh.length });
  return fresh;
}

/** The Practice tab was opened: its dot goes. */
export function clearNewSkills(): void {
  if (progress.newSkills === 0) return;
  publish({ ...progress, newSkills: 0 });
}

/** Practice → Skills showed these: they lose their "new" mark. */
export function markSkillsSeen(ids: string[]): void {
  const p = progress;
  const unseen = ids.filter((id) => p.skills[id] && !p.skills[id].seen);
  if (unseen.length === 0) return;
  const skills = { ...p.skills };
  for (const id of unseen) skills[id] = { ...skills[id], seen: true };
  publish({ ...p, skills });
}

/** The first trade has been played (docs/UI.md §11.1). */
export function finishFirstTrade(): void {
  if (!progress.firstTrade) publish({ ...progress, firstTrade: true });
}

/** Test builds only (docs/UI.md §11.5): show the first trade again. */
export function replayFirstTrade(): void {
  publish({ ...progress, firstTrade: false });
}

/**
 * Test builds only (docs/UI.md §11.5): jump to the start of level `key`
 * (`1-9`, `2-1`) as if everything before it had been played. Earlier lessons
 * count as done but earn no XP (W11): the total stays the sum of the summaries
 * the learner actually saw. Nothing at or after it is touched, so what was
 * already played there stays. Past Chapter 1 the path is chosen for you as
 * Scalping, the one with chapters written.
 */
export function skipTo(key: string): void {
  const p = progress;
  const onScalping = key.split('-')[0] !== '1' || key === '1-path';
  const path: TradingPath | null = p.path ?? (onScalping ? 'scalping' : null);
  const chapters: Chapter[] = path ? chaptersFor(path) : [CHAPTER_ONE];
  const levels = levelsOf(chapters);
  const at = levels.findIndex((l) => l.key === key);
  if (at === -1) return;
  const done = { ...p.done };
  for (const level of levels.slice(0, at)) {
    for (const entry of level.subs) {
      if (!done[entry.id]) done[entry.id] = { perfect: false };
    }
  }
  publish({ ...p, done, path: at > levels.findIndex((l) => l.kind === 'path') ? path : p.path });
}

// ---------------------------------------------------------------------------
// Hearts.
// ---------------------------------------------------------------------------

export type Hearts = {
  hearts: number;
  /** When every heart is back (ms), or null when they are all here. */
  fullAt: number | null;
};

/**
 * The hearts as they stand at `now`. Nothing ticks in the background: the
 * store keeps the count and when the first one was lost, and five hours after
 * that they are all back -- so a phone left in a drawer comes back full
 * without having run a timer. `clock` is when that five hours started.
 */
export function heartsNow(p: Progress, now = Date.now()): Hearts & { clock: number | null } {
  const held = Math.min(p.hearts, MAX_HEARTS);
  if (held >= MAX_HEARTS || p.heartsAt === null) return { hearts: held, fullAt: null, clock: null };
  const fullAt = p.heartsAt + HEART_REFILL_MS;
  if (now >= fullAt) return { hearts: MAX_HEARTS, fullAt: null, clock: null };
  return { hearts: held, fullAt, clock: p.heartsAt };
}

/** How far the refill clock has run, 0 to 1 (the ring round the heart, docs/UI.md §7.2). */
export function refillShare(h: Hearts & { clock?: number | null }, now = Date.now()): number {
  if (h.fullAt === null) return 0;
  return Math.min(1, Math.max(0, 1 - (h.fullAt - now) / HEART_REFILL_MS));
}

/**
 * Gems earned (docs/UI.md §7.2): a bonus side lesson pays its gems on the
 * first finish (DESIGN-REVIEW). The rest of the earning comes in LOOP-DAILY.
 */
export function earnGems(n: number): void {
  if (n > 0) publish({ ...progress, gems: progress.gems + n });
}

/** Test builds only (docs/UI.md §11.5): gems to see the top bar with, until they are earned. */
export function addGems(n: number): void {
  publish({ ...progress, gems: Math.max(0, progress.gems + n) });
}

/** Test builds only (docs/UI.md §11.5): every heart back at once. */
export function refillHearts(): void {
  publish({ ...progress, hearts: MAX_HEARTS, heartsAt: null });
}

/** A wrong answer in a test (§5.2). A clock already running keeps running; it does not restart. */
export function loseHeart(): void {
  const now = Date.now();
  const { hearts, clock } = heartsNow(progress, now);
  if (hearts <= 0) return;
  publish({ ...progress, hearts: hearts - 1, heartsAt: clock ?? now });
}

/** A finished practice round gives a heart back (docs/UI.md §5.2, §7.3). True if one was missing. */
export function giveHeart(): boolean {
  const now = Date.now();
  const { hearts, clock } = heartsNow(progress, now);
  if (hearts >= MAX_HEARTS) return false;
  const next = hearts + 1;
  publish({
    ...progress,
    hearts: next,
    heartsAt: next >= MAX_HEARTS ? null : (clock ?? now),
  });
  return true;
}

/**
 * The hearts, kept current on screen: it re-renders when they are all back,
 * and once a minute in between so the ring and a countdown move.
 */
export function useHearts(): Hearts {
  const p = useProgress();
  const [tick, setTick] = useState(0);
  const { hearts, fullAt } = heartsNow(p);
  useEffect(() => {
    if (fullAt === null) return;
    const wait = Math.min(60_000, Math.max(1_000, fullAt - Date.now() + 50));
    const t = setTimeout(() => setTick((n) => n + 1), wait);
    return () => clearTimeout(t);
  }, [fullAt, tick]);
  return { hearts, fullAt };
}

/** "3h 59m", "12m", "under a minute": how long until `at`. */
export function waitText(at: number, now = Date.now()): string {
  const minutes = Math.ceil((at - now) / 60_000);
  if (minutes <= 1) return 'under a minute';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

// ---------------------------------------------------------------------------
// Loading and saving.
// ---------------------------------------------------------------------------

type SavedSettings = {
  look?: Look;
  haptics?: HapticsSetting;
  sound?: boolean;
  motion?: MotionSetting;
  theme?: ThemeMode;
  colourBlind?: boolean;
};

function save(key: string, value: unknown): void {
  try {
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  } catch {
    // no storage: the session simply is not kept
  }
}

async function read<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

let loaded: Promise<void> | null = null;

/**
 * Restores the saved progress and settings, then keeps the settings saved as
 * they change. Called once at start; the app shows its home screen when this
 * settles, so the path never flashes empty before the learner's progress lands.
 */
export function loadSaved({
  restoreLook = true,
  restoreTheme = true,
}: { restoreLook?: boolean; restoreTheme?: boolean } = {}): Promise<void> {
  if (loaded) return loaded;
  loaded = (async () => {
    const [savedProgress, settings] = await Promise.all([
      read<Partial<Progress>>(PROGRESS_KEY),
      read<SavedSettings>(SETTINGS_KEY),
    ]);
    if (savedProgress) {
      progress = { ...fresh(), ...savedProgress };
      // Saved before the first trade existed (DESIGN-REVIEW): someone already
      // on the path does not get the first-run screen in the middle of it.
      if (typeof savedProgress.firstTrade !== 'boolean') {
        progress.firstTrade = Object.keys(progress.done).length > 0;
      }
      // Saved before the days were kept (DESIGN-REVIEW): the current streak's
      // days had a lesson each, and today as many as it counts.
      if (!savedProgress.days || typeof savedProgress.days !== 'object') {
        const seeded: Record<string, number> = {};
        if (progress.streak.last) {
          for (let k = 0; k < progress.streak.days; k++) {
            seeded[addDays(progress.streak.last, -k)] = 1;
          }
        }
        if (progress.today.count > 0) seeded[progress.today.date] = progress.today.count;
        progress.days = seeded;
      }
      // Saved before the longest streak was kept: the current one is the best known.
      if (typeof savedProgress.bestStreak !== 'number') {
        progress.bestStreak = progress.streak.days;
      }
      // Saved before hearts could be lost in a lesson: start the clock now.
      if (progress.hearts < MAX_HEARTS && progress.heartsAt === null)
        progress.heartsAt = Date.now();
      // Saved before XP was kept: each finished lesson once, as its summary showed it.
      if (typeof savedProgress.xp !== 'number') {
        progress.xp = PATH.flatMap((level) => level.subs).reduce((sum, entry) => {
          const done = progress.done[entry.id];
          return sum + (done ? earnedXp(entry.level.xp, done.perfect) : 0);
        }, 0);
      }
      listeners.forEach((listener) => listener());
    }
    if (settings) {
      // A design from before stage LOOK-SYSTEM, when there were nine, falls back to Neo.
      if (restoreLook) setLook(isLook(settings.look) ? settings.look : 'neo');
      if (restoreTheme && settings.theme) setThemeMode(settings.theme);
      if (typeof settings.colourBlind === 'boolean') setColourBlind(settings.colourBlind);
      if (settings.haptics) setHapticsSetting(settings.haptics);
      if (typeof settings.sound === 'boolean') setSoundEnabled(settings.sound);
      if (settings.motion) setMotionSetting(settings.motion);
    }
    const saveSettings = () =>
      save(SETTINGS_KEY, {
        look: getLook(),
        haptics: getHapticsSetting(),
        sound: isSoundEnabled(),
        motion: getMotionSetting(),
        theme: getThemeMode(),
        colourBlind: isColourBlind(),
      } satisfies SavedSettings);
    subscribeLook(saveSettings);
    subscribeHaptics(saveSettings);
    subscribeSound(saveSettings);
    subscribeMotion(saveSettings);
    subscribeTheme(saveSettings);
  })();
  return loaded;
}
