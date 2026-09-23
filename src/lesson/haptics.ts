import { useSyncExternalStore } from 'react';
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
  if (next === 'off') stopRumble();
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
// Rumble: a continuous vibration, for as long as something is happening.
// ---------------------------------------------------------------------------

/**
 * A pulse is an event; a rumble is a state -- "the line is climbing right now".
 *
 * Android and the web have a real continuous motor: one long vibration, cut off
 * when the state ends, which is as smooth as it gets. iOS has no public
 * continuous haptic in expo-haptics, and its `Vibration` is a fixed system
 * buzz, so there it is a texture instead: impacts every 34 ms, closer than the
 * hand can separate, which the Taptic Engine renders as a purr. It swells in
 * over its first few beats rather than starting at full strength, and `level`
 * picks how hard it purrs -- a steep climb rumbles harder than a gentle one.
 */
const RUMBLE_BEAT_MS = 34;
const RUMBLE_MAX_MS = 6000;

let rumbleTimer: ReturnType<typeof setInterval> | null = null;
let rumbleOn = false;

const hasContinuousMotor = Platform.OS === 'android';
const webVibrate =
  Platform.OS === 'web' && typeof navigator !== 'undefined' && 'vibrate' in navigator;

export function startRumble(level: number): void {
  if (beforeFirstTap()) return;
  if (setting === 'off') return;
  const strength = Math.max(0, Math.min(1, level));
  stopRumble();
  rumbleOn = true;
  try {
    if (hasContinuousMotor) {
      // Android cannot set the motor's strength from here, so a gentler climb
      // purrs on a duty cycle instead of holding the motor on.
      if (strength > 0.66) Vibration.vibrate(RUMBLE_MAX_MS);
      else {
        const on = Math.round(16 + 40 * strength);
        const off = Math.round(24 - 16 * strength);
        Vibration.vibrate([0, on, off], true);
      }
      return;
    }
    if (webVibrate) {
      navigator.vibrate(RUMBLE_MAX_MS);
      return;
    }
  } catch {
    // fall through to the texture
  }
  // The texture: soft at first, then settling at the strength asked for.
  const top: Motor = setting === 'classic'
    ? S.Soft
    : strength > 0.66 ? S.Medium : strength > 0.33 ? S.Light : S.Soft;
  let beat = 0;
  const tick = () => {
    if (!rumbleOn || setting === 'off') return;
    motor(beat < 2 ? S.Soft : beat < 4 && top === S.Medium ? S.Light : top);
    beat += 1;
  };
  tick();
  rumbleTimer = setInterval(tick, RUMBLE_BEAT_MS);
}

export function stopRumble(): void {
  if (!rumbleOn && !rumbleTimer) return;
  rumbleOn = false;
  if (rumbleTimer) {
    clearInterval(rumbleTimer);
    rumbleTimer = null;
  }
  try {
    if (hasContinuousMotor) Vibration.cancel();
    else if (webVibrate) navigator.vibrate(0);
  } catch {
    // ignored
  }
}
