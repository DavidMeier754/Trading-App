import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Settings → Testing → Open a screen (test builds; David, 2026-10-08: "a
 * Screen Opener in the developer Settings where I can just put in the # and
 * it automatically opens the screen"). The row hands the link to the app,
 * which opens it exactly as a web deep link (`#level-09-2/3`) opens: App.tsx
 * registers the opener, and says whether the link named anything.
 *
 * The links opened last are kept, so a test checklist can be walked by tapping
 * them again instead of pasting each one.
 */

type Opener = (link: string) => boolean;

let opener: Opener | null = null;

/** App.tsx: the one function that opens a link. Returns the unregister. */
export function setScreenOpener(next: Opener): () => void {
  opener = next;
  return () => {
    if (opener === next) opener = null;
  };
}

/** Opens a link; false when it names no screen (or nothing is listening). */
export function openScreen(link: string): boolean {
  const text = cleanLink(link);
  if (!text || !opener) return false;
  const opened = opener(text);
  if (opened) remember(text);
  return opened;
}

/**
 * A link as it is kept and shown: what follows the `#`, without the address
 * of the preview before it or `?test=1` after it.
 */
export function cleanLink(link: string): string {
  const hash = link
    .trim()
    .replace(/^[^#]*#/, '')
    .replace(/^\/+/, '');
  const [path, query = ''] = hash.split('?');
  const kept = query
    .split('&')
    .filter((p) => p && !/^test=/.test(p))
    .join('&');
  return kept ? `${path}?${kept}` : path;
}

/** How many links the row keeps. */
export const RECENT_MAX = 6;
const KEY = 'screenOpener.v1';

let recent: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function publish(next: string[]) {
  recent = next;
  listeners.forEach((l) => l());
  try {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  } catch {
    // no storage: kept for this run only
  }
}

function remember(link: string) {
  publish([link, ...recent.filter((l) => l !== link)].slice(0, RECENT_MAX));
}

/** The links opened last, newest first. */
export function recentLinks(): string[] {
  return recent;
}

/** Loads the kept links once; calls back when they change. Returns the unsubscribe. */
export function watchRecent(listener: () => void): () => void {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    try {
      AsyncStorage.getItem(KEY)
        .then((raw) => {
          const saved = raw ? (JSON.parse(raw) as unknown) : null;
          if (Array.isArray(saved) && recent.length === 0) {
            recent = saved.filter((x): x is string => typeof x === 'string').slice(0, RECENT_MAX);
            listeners.forEach((l) => l());
          }
        })
        .catch(() => {});
    } catch {
      // no storage
    }
  }
  return () => {
    listeners.delete(listener);
  };
}

/** Forgets the kept links. */
export function clearRecent(): void {
  publish([]);
}
