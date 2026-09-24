import { useEffect, useSyncExternalStore } from 'react';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { HapticStyle, Pulse } from './cues.generated';
import { beforeFirstTap } from './gesture';

/**
 * The motor half of a cue. Which pulses fire, and when, is not decided here: it
 * comes from `cues.generated.ts`, the same table the sounds are rendered from,
 * so a pattern and its sound share their timings by construction. This module
 * decides what one pulse of each weight *feels* like, and whether it may.
 *
 * docs/UI.md §10 gives haptics a toggle of their own, separate from sounds. It
 * is three-way here: off, `classic` (one generator event per pulse, the way it
 * shipped first) and `strong`, the default.
 *
 * `strong` is harder and smoother at once. Harder: every pulse is played one
 * weight up -- a tick is a light impact, a light one medium, a medium one
 * heavy. Smoother: the weightier pulses do not stop dead on a single click.
 * They get a short, softer tail 20-30 ms behind them, which the hand reads as
 * one rounded bump with a decay rather than a tap -- the difference between a
 * knuckle on a table and a hand on a drum.
 *
 * The web is left to expo-haptics rather than skipped: on a phone browser it
 * vibrates on Android and uses the switch-control tap on iOS, and on a desktop
 * it does nothing. Every call is guarded either way, so a device without a
 * motor is a silent no-op, never an error.
 */

export type HapticsSetting = 'strong' | 'classic' | 'off';

let setting: HapticsSetting = 'strong';
const listeners = new Set<() => void>();

export function setHapticsSetting(next: HapticsSetting): void {
  if (next === setting) return;
  setting = next;
  if (next === 'off') stopChartMoves();
  listeners.forEach((listener) => listener());
}

export function getHapticsSetting(): HapticsSetting {
  return setting;
}

export function isHapticsEnabled(): boolean {
  return setting !== 'off';
}

export function useHapticsSetting(): HapticsSetting {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getHapticsSetting,
    getHapticsSetting
  );
}

const ignore = () => {};

type Motor = 'selection' | Haptics.ImpactFeedbackStyle;

const IMPACT: Record<Exclude<HapticStyle, 'selection'>, Haptics.ImpactFeedbackStyle> = {
  soft: Haptics.ImpactFeedbackStyle.Soft,
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  rigid: Haptics.ImpactFeedbackStyle.Rigid,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

const S = Haptics.ImpactFeedbackStyle;

/**
 * What each weight becomes under `strong`: the hit, and the tail behind it,
 * as [ms, motor] pairs. The hit is always at 0, so the pulse still lands on
 * the frame its sound and its visual start on.
 */
const STRONG: Record<HapticStyle, readonly (readonly [number, Motor])[]> = {
  selection: [[0, S.Light]],
  soft: [[0, S.Medium], [24, S.Soft]],
  light: [[0, S.Medium], [22, S.Soft]],
  medium: [[0, S.Heavy], [26, S.Soft]],
  rigid: [[0, S.Rigid], [20, S.Medium]],
  heavy: [[0, S.Heavy], [30, S.Heavy], [70, S.Soft]],
};

function motor(m: Motor): void {
  if (beforeFirstTap()) return;
  try {
    const done = m === 'selection' ? Haptics.selectionAsync() : Haptics.impactAsync(m);
    void Promise.resolve(done).catch(ignore);
  } catch {
    // A device without haptics is not an error.
  }
  rehold();
}

function pulse(style: HapticStyle): void {
  if (setting === 'classic') {
    motor(style === 'selection' ? 'selection' : IMPACT[style]);
    return;
  }
  for (const [ms, m] of STRONG[style]) {
    if (ms <= 0) motor(m);
    else setTimeout(() => setting !== 'off' && motor(m), ms);
  }
}

/**
 * Plays a cue's pulses at their offsets. The first is fired synchronously, in
 * the same frame as the visual and the sound that start with it; the rest are
 * timers, and each re-checks the toggle so switching haptics off mid-pattern
 * stops it at once.
 */
export function playPulses(pulses: readonly Pulse[]): void {
  if (setting === 'off') return;
  for (const [ms, style] of pulses) {
    if (ms <= 0) pulse(style);
    else setTimeout(() => setting !== 'off' && pulse(style), ms);
  }
}

// ---------------------------------------------------------------------------
// A chart moving: one steady vibration, then one landing.
// ---------------------------------------------------------------------------

/**
 * Whenever a chart moves -- builds in, draws on, plays out an outcome -- the
 * phone vibrates, steadily, for as long as it moves, and gives one firm haptic
 * the moment it comes to rest. Every chart, every kind.
 *
 * Steady means a vibration, not a run of taps. Android and the web hold the
 * motor on for the length of the move. iOS offers nothing continuous that
 * Expo Go can reach -- an impact is an event, and a texture of light impacts
 * every 34 ms, which is what this used to be, was too faint to feel at all --
 * so there it is the system vibration, the one a silenced phone rings with,
 * chained back to back. Each of those runs ~400 ms and cannot be cut short, so
 * the chain is laid out ahead of time to finish just before the chart does,
 * and never runs over the landing. What does not divide into whole buzzes is
 * left at the start, where the tap that set the chart moving has just played
 * its own haptic -- never at the end, where it would be a silence between the
 * vibration and the landing it leads into.
 *
 * Moves are counted. Two charts building on one screen, or a replay begun
 * while the entrance is still building, are one movement to the hand: the
 * vibration runs until the last of them ends, and lands once.
 */

/** One iOS system vibration. Fixed by the system; it cannot be cut short. */
const BUZZ_MS = 400;
/** Chained this far apart: back to back, never one over the last. */
const BUZZ_EVERY_MS = 420;
/**
 * The vibration stops this long before the landing: a beat of stillness is
 * what makes the landing its own event, not the last of the vibration.
 */
const CLEAR_MS = 70;
/** The landing on Android and the web: one short, full-strength pulse. */
const LAND_MS = 40;
/** How long a tap's own pulse holds the motor before the move takes it back. */
const REHOLD_MS = 90;

const isIOS = Platform.OS === 'ios';
const hasContinuousMotor = Platform.OS === 'android';
const webVibrate =
  Platform.OS === 'web' && typeof navigator !== 'undefined' && 'vibrate' in navigator;

let moveSeq = 0;
/** The moves under way, and when each one ends (ms since the epoch). */
const moves = new Map<number, number>();
let moveTimer: ReturnType<typeof setTimeout> | null = null;
let reholdTimer: ReturnType<typeof setTimeout> | null = null;
let buzzTimers: ReturnType<typeof setTimeout>[] = [];
/** When the iOS buzz fired last runs out. */
let buzzEnds = 0;
let motorHeld = false;

function lastEnd(): number {
  let end = 0;
  moves.forEach((at) => {
    end = Math.max(end, at);
  });
  return end;
}

function buzz(): void {
  if (setting === 'off') return;
  try {
    Vibration.vibrate(BUZZ_MS);
    buzzEnds = Date.now() + BUZZ_MS;
  } catch {
    // no motor: nothing to hold
  }
}

function clearBuzzes(): void {
  buzzTimers.forEach(clearTimeout);
  buzzTimers = [];
}

/**
 * Keep the motor running from now until just short of the landing at `end`.
 * Called again whenever `end` moves.
 */
function hold(end: number): void {
  const now = Date.now();
  const until = end - CLEAR_MS;
  const left = Math.round(until - now);
  if (left <= 0) return;
  try {
    if (hasContinuousMotor) {
      Vibration.vibrate(left);
      motorHeld = true;
      return;
    }
    if (webVibrate) {
      navigator.vibrate(left);
      motorHeld = true;
      return;
    }
  } catch {
    return;
  }
  if (!isIOS) return;
  // A buzz still running is left to finish, and the chain goes on from it
  // back to back; a fresh chain starts late by whatever is left over, so that
  // it ends on time.
  clearBuzzes();
  const running = buzzEnds > now;
  const from = running ? buzzEnds + (BUZZ_EVERY_MS - BUZZ_MS) : now;
  const room = until - from;
  if (room < BUZZ_MS) return;
  const count = Math.floor((room - BUZZ_MS) / BUZZ_EVERY_MS) + 1;
  const lead = running ? 0 : room - ((count - 1) * BUZZ_EVERY_MS + BUZZ_MS);
  for (let k = 0; k < count; k++) {
    buzzTimers.push(setTimeout(buzz, from - now + lead + k * BUZZ_EVERY_MS));
  }
  motorHeld = true;
}

/** Stop the motor now, without a landing. */
function release(): void {
  clearBuzzes();
  if (reholdTimer) clearTimeout(reholdTimer);
  reholdTimer = null;
  if (!motorHeld) return;
  motorHeld = false;
  try {
    if (hasContinuousMotor) Vibration.cancel();
    else if (webVibrate) navigator.vibrate(0);
  } catch {
    // ignored
  }
}

/**
 * Android and the web have one motor, and each new effect replaces the one
 * running: a tap's pulse during a move would end the move's vibration. So once
 * the pulse has played, the move takes the motor back. (On iOS a tap and the
 * system vibration play side by side.)
 */
function rehold(): void {
  if (isIOS || !motorHeld || moves.size === 0) return;
  if (reholdTimer) clearTimeout(reholdTimer);
  reholdTimer = setTimeout(() => {
    reholdTimer = null;
    if (moves.size > 0) hold(lastEnd());
  }, REHOLD_MS);
}

/** The landing: one firm haptic, on the frame the chart comes to rest. */
function landing(): void {
  if (setting === 'off' || beforeFirstTap()) return;
  try {
    if (hasContinuousMotor) {
      Vibration.vibrate(LAND_MS);
      return;
    }
    if (webVibrate) {
      navigator.vibrate(LAND_MS);
      return;
    }
  } catch {
    return;
  }
  // iOS: a heavy impact -- in `strong`, with the heavy tail that rounds it.
  pulse('heavy');
}

function plan(): void {
  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = null;
  if (moves.size === 0) return;
  const end = lastEnd();
  hold(end);
  moveTimer = setTimeout(settle, Math.max(0, end - Date.now()));
}

/** Moves whose time is up are over; when the last one is, the chart lands. */
function settle(): void {
  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = null;
  if (moves.size === 0) return;
  const now = Date.now();
  moves.forEach((end, id) => {
    if (end <= now + 8) moves.delete(id);
  });
  if (moves.size > 0) {
    plan();
    return;
  }
  release();
  landing();
}

function stopChartMoves(): void {
  moves.clear();
  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = null;
  release();
}

export type ChartMove = {
  /** The move now ends `ms` from now: a skip that sweeps to the end. */
  retime: (ms: number) => void;
  /** The move is over, now: land, unless another chart is still moving. */
  land: () => void;
  /** The chart left mid-move: stop, with no landing. */
  cancel: () => void;
};

/**
 * A chart has started a move that will take `ms`: vibrate until it ends, then
 * land. `ms` is when it *looks* finished -- lesson/motion.ts, EASE_OUT_SETTLE
 * -- not the tail of a curve the eye no longer follows.
 */
export function startChartMove(ms: number): ChartMove {
  const id = ++moveSeq;
  if (ms > 0 && setting !== 'off' && !beforeFirstTap()) {
    moves.set(id, Date.now() + ms);
    plan();
  }
  return {
    retime: (next) => {
      if (!moves.has(id)) return;
      moves.set(id, Date.now() + Math.max(0, next));
      plan();
    },
    land: () => {
      if (!moves.has(id)) return;
      moves.set(id, Date.now());
      settle();
    },
    cancel: () => {
      if (!moves.delete(id)) return;
      if (moves.size > 0) plan();
      else stopChartMoves();
    },
  };
}

/**
 * A chart's entrance, from mount: a move of `ms`, or none when it does not
 * play (reduced motion, nothing to build). Leaving mid-move cuts it off,
 * without a landing.
 */
export function useChartMove(ms: number, play: boolean): void {
  useEffect(() => {
    if (!play || ms <= 0) return;
    return startChartMove(ms).cancel;
    // Mount only, like the entrance it follows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
