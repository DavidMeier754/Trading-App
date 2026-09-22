import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * docs/UI.md §10: reduce motion removes confetti, flicker and auto-playback.
 *
 * One source for the whole app. It used to be two: this hook, which follows the
 * OS live, and Reanimated's own `useReducedMotion`, which reads the setting once
 * at startup. Half the app therefore reacted to the switch and half did not, so
 * toggling it mid-session produced a state neither branch was written for.
 *
 * `override` exists because the reduced-motion branches are the least-played
 * paths in the app — they are threaded through every animation on the branch and
 * had never been run once. The lesson picker (which is not part of the product,
 * see LessonPicker.tsx) can force either side so they can be looked at without
 * digging through OS settings between runs.
 */

export type MotionSetting = 'system' | 'reduced' | 'full';

let override: MotionSetting = 'system';
let systemReduced = false;
let started = false;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function start() {
  if (started) return;
  started = true;
  // A platform without the API (or a browser that blocks it) is not an error:
  // the app simply stays on full motion, which is the documented default.
  try {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (value === systemReduced) return;
        systemReduced = value;
        notify();
      })
      .catch(() => {});
    AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      if (value === systemReduced) return;
      systemReduced = value;
      notify();
    });
  } catch {
    // ignored
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

function resolve(): boolean {
  if (override === 'reduced') return true;
  if (override === 'full') return false;
  return systemReduced;
}

export function setMotionSetting(next: MotionSetting): void {
  if (next === override) return;
  override = next;
  notify();
}

export function getMotionSetting(): MotionSetting {
  return override;
}

/** True when motion should be reduced, from the OS or from the override. */
export function useReduceMotion(): boolean {
  return useSyncExternalStore(subscribe, resolve, resolve);
}

/** The current override, re-rendering the caller when it changes. */
export function useMotionSetting(): MotionSetting {
  return useSyncExternalStore(subscribe, getMotionSetting, getMotionSetting);
}
