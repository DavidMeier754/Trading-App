import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { CHAPTER_ONE, Chapter, PATH, PATH_CHOICE_ID, TradingPath, chaptersFor, levelsOf } from './content';
import {
  getHapticsSetting,
  HapticsSetting,
  setHapticsSetting,
  subscribeHaptics,
} from './lesson/haptics';
import { getLook, Look, LOOKS, setLook, subscribeLook } from './lesson/look';
import { isSoundEnabled, setSoundEnabled, subscribeSound } from './lesson/sound';
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
 * gold ring). The HUD reads the rest (§7.2): the streak in days, the daily
 * goal of two sub-levels (§5.3), and the hearts (§5.2): a wrong answer costs
 * one, and each comes back four hours after it was lost.
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
  /** Lessons finished today, towards the daily goal. */
  today: { date: string; count: number };
  /** Every XP the summaries have handed out, replays included. */
  xp: number;
  /** docs/UI.md §11.4: the path picked after Chapter 1, or null before that. */
  path: TradingPath | null;
  /**
   * The learner's plan (docs/schema.md "The plan"): every plan-card field they
   * have filled, by key. A card that asks for a key again opens on this value.
   */
  plan: Record<string, string>;
  /** Hearts as last written; `heartsNow` adds the ones that have come back since. */
  hearts: number;
  /** When the next missing heart started coming back (ms since 1970), or null when full. */
  heartsAt: number | null;
};

export const MAX_HEARTS = 5;
/** docs/UI.md §5.3: the daily goal is two sub-levels. */
export const DAILY_GOAL = 2;
/** docs/UI.md §5.2: each lost heart returns after four hours. */
export const HEART_REFILL_MS = 4 * 60 * 60 * 1000;

const PROGRESS_KEY = 'progress.v1';
const SETTINGS_KEY = 'settings.v1';

const fresh = (): Progress => ({
  done: {},
  streak: { days: 0, last: null },
  today: { date: dayOf(new Date()), count: 0 },
  xp: 0,
  path: null,
  plan: {},
  hearts: MAX_HEARTS,
  heartsAt: null,
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
    getProgress
  );
}

/** A local calendar day, `2026-09-24`: a streak counts the learner's days, not UTC's. */
export function dayOf(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function dayBefore(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayOf(new Date(y, m - 1, d - 1));
}

/** The streak as it stands today: a run whose last day is before yesterday is over. */
export function streakDays(p: Progress, now = new Date()): number {
  const today = dayOf(now);
  if (p.streak.last === today || p.streak.last === dayBefore(today)) return p.streak.days;
  return 0;
}

/** Lessons finished today, towards the daily goal. */
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
  { perfect, xp }: { perfect: boolean; xp: number }
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
  });
}

export function resetProgress(): void {
  publish(fresh());
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

/** A plan card was filled in: its keys join the plan, over any older values. */
export function savePlan(values: Record<string, string>): void {
  if (Object.keys(values).length === 0) return;
  publish({ ...progress, plan: { ...progress.plan, ...values } });
}

/**
 * Temporary, for testing from Settings: jump to the start of level `key`
 * (`1-9`, `2-1`) as if everything before it had been played. Earlier lessons
 * count as done, with their XP; nothing at or after it is touched, so what was
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
  let xp = p.xp;
  for (const level of levels.slice(0, at)) {
    for (const entry of level.subs) {
      if (done[entry.id]) continue;
      done[entry.id] = { perfect: false };
      xp += entry.level.xp;
    }
  }
  publish({ ...p, done, xp, path: at > levels.findIndex((l) => l.kind === 'path') ? path : p.path });
}

// ---------------------------------------------------------------------------
// Hearts.
// ---------------------------------------------------------------------------

export type Hearts = {
  hearts: number;
  /** When the next heart is back (ms), or null when they are all here. */
  nextAt: number | null;
};

/**
 * The hearts as they stand at `now`. Nothing ticks in the background: the
 * store keeps the count and when its refill clock started, and every four
 * hours since then is a heart back -- so a phone left in a drawer overnight
 * comes back full without having run a timer.
 */
export function heartsNow(p: Progress, now = Date.now()): Hearts & { clock: number | null } {
  const held = Math.min(p.hearts, MAX_HEARTS);
  if (held >= MAX_HEARTS || p.heartsAt === null) return { hearts: held, nextAt: null, clock: null };
  const back = Math.max(0, Math.floor((now - p.heartsAt) / HEART_REFILL_MS));
  const hearts = Math.min(MAX_HEARTS, held + back);
  if (hearts >= MAX_HEARTS) return { hearts, nextAt: null, clock: null };
  const clock = p.heartsAt + back * HEART_REFILL_MS;
  return { hearts, nextAt: clock + HEART_REFILL_MS, clock };
}

/** Temporary, for testing from Settings: every heart back at once. */
export function refillHearts(): void {
  publish({ ...progress, hearts: MAX_HEARTS, heartsAt: null });
}

/** A wrong answer (§5.2). A heart already on its way back keeps its place in the queue. */
export function loseHeart(): void {
  const now = Date.now();
  const { hearts, clock } = heartsNow(progress, now);
  if (hearts <= 0) return;
  publish({ ...progress, hearts: hearts - 1, heartsAt: clock ?? now });
}

/**
 * The hearts, kept current on screen: it re-renders when the next heart is
 * back, and once a minute in between so a countdown beside them moves.
 */
export function useHearts(): Hearts {
  const p = useProgress();
  const [tick, setTick] = useState(0);
  const { hearts, nextAt } = heartsNow(p);
  useEffect(() => {
    if (nextAt === null) return;
    const wait = Math.min(60_000, Math.max(1_000, nextAt - Date.now() + 50));
    const t = setTimeout(() => setTick((n) => n + 1), wait);
    return () => clearTimeout(t);
  }, [nextAt, tick]);
  return { hearts, nextAt };
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
export function loadSaved({ restoreLook = true }: { restoreLook?: boolean } = {}): Promise<void> {
  if (loaded) return loaded;
  loaded = (async () => {
    const [savedProgress, settings] = await Promise.all([
      read<Partial<Progress>>(PROGRESS_KEY),
      read<SavedSettings>(SETTINGS_KEY),
    ]);
    if (savedProgress) {
      progress = { ...fresh(), ...savedProgress };
      // Saved before hearts could be lost in a lesson: start the clock now.
      if (progress.hearts < MAX_HEARTS && progress.heartsAt === null) progress.heartsAt = Date.now();
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
      if (restoreLook && settings.look && settings.look in LOOKS) setLook(settings.look);
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
      } satisfies SavedSettings);
    subscribeLook(saveSettings);
    subscribeHaptics(saveSettings);
    subscribeSound(saveSettings);
    subscribeMotion(saveSettings);
  })();
  return loaded;
}
