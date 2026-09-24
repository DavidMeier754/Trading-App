import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

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
 * goal of two sub-levels (§5.3), and the hearts, which only tests and exams
 * spend (§5.2) -- so on a path with neither they stay full.
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
  hearts: number;
};

export const MAX_HEARTS = 5;
/** docs/UI.md §5.3: the daily goal is two sub-levels. */
export const DAILY_GOAL = 2;

const PROGRESS_KEY = 'progress.v1';
const SETTINGS_KEY = 'settings.v1';

const fresh = (): Progress => ({
  done: {},
  streak: { days: 0, last: null },
  today: { date: dayOf(new Date()), count: 0 },
  hearts: MAX_HEARTS,
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

/** A sub-level reached its summary. A replay keeps a perfect run it already had. */
export function completeLesson(id: string, { perfect }: { perfect: boolean }): void {
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
    streak: { days, last: today },
    today: { date: today, count: (p.today.date === today ? p.today.count : 0) + 1 },
  });
}

export function resetProgress(): void {
  publish(fresh());
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
