import { useSyncExternalStore } from 'react';

/**
 * How the map shows its chapters (docs/ui/10-path-map.md §7.1).
 *
 * - `cards`: every chapter as a card on the path, folded or open (the map as
 *   built in DESIGN-REVIEW).
 * - `switcher`: David's alternative of 2026-10-06 -- the banner holds the
 *   chapter, with arrows to step through them; the map shows that chapter's
 *   path alone. Settings → Testing switches between the two, and `?map=switcher`
 *   opens a test build with it.
 */
export type MapStyle = 'cards' | 'switcher';

let style: MapStyle = 'cards';
const listeners = new Set<() => void>();

export function getMapStyle(): MapStyle {
  return style;
}

export function isMapStyle(value: unknown): value is MapStyle {
  return value === 'cards' || value === 'switcher';
}

export function setMapStyle(next: MapStyle): void {
  if (next === style) return;
  style = next;
  listeners.forEach((listener) => listener());
}

export function subscribeMapStyle(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMapStyle(): MapStyle {
  return useSyncExternalStore(subscribeMapStyle, getMapStyle, getMapStyle);
}
