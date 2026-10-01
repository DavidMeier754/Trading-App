import { useSyncExternalStore } from 'react';

import { getScheme, useScheme } from '../theme';
import { LOOK_SPECS, type Look, type LookSpec } from './lookSpecs';

export { LOOK_ORDER, type Look, type LookSpec } from './lookSpecs';

/**
 * Which design the lesson wears (lookSpecs.ts): Neo, Neo Mono or Classic
 * Contrast, picked in Settings. `LOOKS[look]` is that design in the scheme on
 * screen, light or dark.
 */
export const LOOKS = {} as Record<Look, LookSpec>;
for (const id of Object.keys(LOOK_SPECS) as Look[]) {
  Object.defineProperty(LOOKS, id, { enumerable: true, get: () => LOOK_SPECS[id][getScheme()] });
}

/** A saved design from before stage LOOK-SYSTEM, when there were nine. */
export function isLook(value: unknown): value is Look {
  return typeof value === 'string' && value in LOOK_SPECS;
}

let look: Look = 'neo';
/**
 * Settings → Change design: a look worn for a moment to see it full screen,
 * without choosing it. It is on screen, never saved.
 */
let preview: Look | null = null;
const listeners = new Set<() => void>();
const shownListeners = new Set<() => void>();

export function setLook(next: Look): void {
  if (next === look) return;
  look = next;
  listeners.forEach((listener) => listener());
  shownListeners.forEach((listener) => listener());
}

/** The look chosen in Settings: the one that is saved. */
export function getLook(): Look {
  return look;
}

/** Wear `next` on screen until it is called with null (Change design). */
export function previewLook(next: Look | null): void {
  if (next === preview) return;
  preview = next;
  shownListeners.forEach((listener) => listener());
}

/** The look on screen: the one being previewed, or else the one chosen. */
function shownLook(): Look {
  return preview ?? look;
}

/** Called whenever the chosen look changes (the settings are saved from here). */
export function subscribeLook(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function subscribeShown(listener: () => void): () => void {
  shownListeners.add(listener);
  return () => {
    shownListeners.delete(listener);
  };
}

/** The look on screen, previews included. */
export function useLook(): Look {
  return useSyncExternalStore(subscribeShown, shownLook, shownLook);
}

/** The look chosen in Settings, which a preview does not change. */
export function useChosenLook(): Look {
  return useSyncExternalStore(subscribeLook, getLook, getLook);
}

export function useLookSpec(): LookSpec {
  useScheme();
  return LOOKS[useLook()];
}

/** A surface at rest in a look, as a style: background, border, corners, edge. */
export function surfaceStyle(spec: LookSpec) {
  const s = spec.surface;
  return {
    backgroundColor: s.background,
    borderColor: s.border,
    ...(s.borderTop ? { borderTopColor: s.borderTop } : null),
    borderRadius: s.radius,
    borderWidth: s.borderWidth,
  };
}

/** A colour pushed towards black by `amount` (0..1): the edge of a key under its face. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const k = 1 - amount;
  const ch = (v: number) =>
    Math.round(v * k)
      .toString(16)
      .padStart(2, '0');
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

/** WCAG relative luminance of a `#rrggbb` colour. */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
}

/** White or near-black, whichever reads better on a filled `#rrggbb` colour. */
export function inkOn(hex: string): string {
  const l = luminance(hex);
  // Contrast with white is 1.05 / (l + 0.05); with near-black (#0B0C0E) it is (l + 0.05) / 0.054.
  return 1.05 / (l + 0.05) >= (l + 0.05) / 0.054 ? '#FFFFFF' : '#0B0C0E';
}

/** A translucent wash of a colour, for selections and tints. */
export function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// ---------------------------------------------------------------------------
// Mood: what just happened, for the surfaces that react to it.
// ---------------------------------------------------------------------------

/**
 * The lesson's last beat, broadcast. The backdrop listens and lights the
 * bottom edge with it -- green on a right answer, a dull red dip on a wrong
 * one, warm gold while a run is on (components/Atmosphere.tsx). It is an event
 * bus rather than a prop because the backdrop sits in App, under the player,
 * and the player is the one that knows.
 */
export type Mood = 'correct' | 'amber' | 'wrong' | 'streak' | 'calm' | 'complete' | 'commit';

type MoodListener = (mood: Mood, run: number) => void;
const moodListeners = new Set<MoodListener>();

export function emitMood(mood: Mood, run = 0): void {
  moodListeners.forEach((listener) => listener(mood, run));
}

export function onMood(listener: MoodListener): () => void {
  moodListeners.add(listener);
  return () => {
    moodListeners.delete(listener);
  };
}
