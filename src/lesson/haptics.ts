import { useEffect, useSyncExternalStore } from 'react';
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

/** Called whenever the setting changes (the settings are saved from here). */
export function subscribeHaptics(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useHapticsSetting(): HapticsSetting {
  return useSyncExternalStore(subscribeHaptics, getHapticsSetting, getHapticsSetting);
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
  soft: [
    [0, S.Medium],
    [24, S.Soft],
  ],
  light: [
    [0, S.Medium],
    [22, S.Soft],
  ],
  medium: [
    [0, S.Heavy],
    [26, S.Soft],
  ],
  rigid: [
    [0, S.Rigid],
    [20, S.Medium],
  ],
  heavy: [
    [0, S.Heavy],
    [30, S.Heavy],
    [70, S.Soft],
  ],
};

function motor(m: Motor): void {
  if (beforeFirstTap()) return;
  try {
    const done = m === 'selection' ? Haptics.selectionAsync() : Haptics.impactAsync(m);
    void Promise.resolve(done).catch(ignore);
  } catch {
    // A device without haptics is not an error.
  }
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
// A chart moving: one haptic as it starts, one as it lands, nothing between.
// ---------------------------------------------------------------------------

/**
 * Whenever a chart moves -- builds in, draws on, plays out an outcome -- the
 * phone gives one light haptic the moment it starts and one firm haptic the
 * moment it comes to rest. Nothing while it moves: the steady vibration that
 * used to run under every move was more than the hand wanted, on every chart.
 *
 * Moves are counted. Two charts building on one screen, or a replay begun
 * while the entrance is still building, are one movement to the hand: it
 * starts once and lands once, when the last of them ends.
 */

let moveSeq = 0;
/** The moves under way, and when each one ends (ms since the epoch). */
const moves = new Map<number, number>();
let moveTimer: ReturnType<typeof setTimeout> | null = null;

function lastEnd(): number {
  let end = 0;
  moves.forEach((at) => {
    end = Math.max(end, at);
  });
  return end;
}

/** The start: a light haptic, on the frame the chart starts to move. */
function departure(): void {
  if (setting === 'off' || beforeFirstTap()) return;
  pulse('light');
}

/** The landing: one firm haptic, on the frame the chart comes to rest. */
function landing(): void {
  if (setting === 'off' || beforeFirstTap()) return;
  pulse('medium');
}

function plan(): void {
  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = null;
  if (moves.size === 0) return;
  moveTimer = setTimeout(settle, Math.max(0, lastEnd() - Date.now()));
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
  landing();
}

function stopChartMoves(): void {
  moves.clear();
  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = null;
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
 * A chart has started a move that will take `ms`: a haptic now, unless another
 * chart is already moving, and one when it lands. `ms` is when it *looks* finished -- lesson/motion.ts, EASE_OUT_SETTLE
 * -- not the tail of a curve the eye no longer follows.
 */
export function startChartMove(ms: number): ChartMove {
  const id = ++moveSeq;
  if (ms > 0 && setting !== 'off' && !beforeFirstTap()) {
    if (moves.size === 0) departure();
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
