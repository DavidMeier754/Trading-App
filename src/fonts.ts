import { Archivo_700Bold } from '@expo-google-fonts/archivo/700Bold';
import * as Font from 'expo-font';
import { useSyncExternalStore } from 'react';
import type { TextStyle } from 'react-native';

/**
 * docs/UI.md §10 [DESIGN-REVIEW]: one display face, for titles only --
 * Archivo in its normal width, bold (David: the stretched width "looks too
 * stretched out"). The banner's level title, the chapter cards' names, the
 * lesson-complete headline, the medal's and the tier's names and the page
 * titles; never body text, answers, keys or numbers. It loads with the app
 * and nothing waits for it: until it is in, titles stay in the text face.
 */
const FAMILY = 'Archivo_700Bold';

let loaded = false;
const listeners = new Set<() => void>();

/** Start loading the face; safe to call more than once. */
export function loadFonts(): void {
  if (loaded) return;
  Font.loadAsync({ [FAMILY]: Archivo_700Bold })
    .then(() => {
      loaded = true;
      listeners.forEach((l) => l());
    })
    // No face is not an error the learner should see: the titles keep the text face.
    .catch(() => {});
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The title face to add to a title's style once it has loaded; nothing before. */
export function useDisplayFace(): TextStyle | null {
  const ready = useSyncExternalStore(
    subscribe,
    () => loaded,
    () => loaded,
  );
  // The face is its own bold: a second bold on top makes Android pick a fallback.
  return ready ? { fontFamily: FAMILY, fontWeight: 'normal' } : null;
}
