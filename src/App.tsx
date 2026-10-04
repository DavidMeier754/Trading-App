import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Backdrop from './components/Backdrop';
import { GridOriginProvider } from './components/gridAlign';
import ErrorBoundary, { DebugCrash } from './ErrorBoundary';
import { isBonus, LessonEntry, LESSONS, nodeOf, TEST_BENCH } from './content';
import Home, { openHomeAt } from './home/Home';
import { SUGGESTIONS } from './home/ideas';
import { isLook, setLook, useLookSpec } from './lesson/look';
import LessonPlayer from './lesson/LessonPlayer';
import {
  choosePath,
  collectSkills,
  completeLesson,
  dayOf,
  earnGems,
  endLostStreak,
  finishFirstTrade,
  getProgress,
  giveHeart,
  loadSaved,
  lostStreak,
  streakDays,
} from './progress';
import { flySkills } from './home/fly';
import { skillsOf } from './skills';
import { igniteFlame } from './home/moments';
import StreakMoment, { type StreakChange } from './lesson/StreakMoment';
import { setMotionSetting } from './lesson/useReduceMotion';
import { TEST_TOOLS } from './testTools';
import {
  colors,
  holdSystemTheme,
  setThemeMode,
  space,
  themed,
  useScheme,
  useThemeKey,
  type ThemeMode,
} from './theme';
import { loadFonts } from './fonts';
import { NEW_DESIGNS } from './home/newDesigns';
import { FIRST_TRADE } from './onboarding/firstTrade';

/** docs/UI.md §2 is portrait-only, so the player is capped at a phone width. */
const MAX_WIDTH = 480;

export default function App() {
  const { width, height } = useWindowDimensions();
  // docs/UI.md §10: the titles' face loads alongside; nothing waits for it.
  useEffect(() => loadFonts(), []);
  const frameWidth = Math.min(width, MAX_WIDTH);
  const contentWidth = frameWidth - space.lg * 2;

  // A web deep link, `#all-screens/34`, opens a lesson on page 34 -- the number
  // the test bench shows in its top bar. It is how the bench's 49 screens get
  // looked at one by one; the app proper has no URLs.
  const [link, setLink] = useState(() => readDeepLink());
  const [entry, setEntry] = useState<LessonEntry | null>(link?.entry ?? null);
  // `#debug-crash`, test builds only: a screen that throws (ErrorBoundary.tsx).
  const [crash, setCrash] = useState(() => !!link?.crash);
  // docs/UI.md §7.2: a change of the streak, full screen, between a lesson and
  // the map (up) or as the app opens (lost). `streakUp` waits for the lesson
  // that made it to close.
  const [moment, setMoment] = useState<StreakChange | null>(null);
  const streakUp = useRef<StreakChange | null>(null);
  const endMoment = useCallback(() => {
    if (moment?.kind === 'lost') endLostStreak();
    // Back on the map, the flame catches (LearnScreen's Hud).
    if (moment?.kind === 'up') igniteFlame();
    setMoment(null);
  }, [moment]);

  // Saved progress and settings come back before the home screen is drawn, so
  // the path never flashes empty first. A deep link opens its lesson at once,
  // and a look it names wins over the saved one.
  const [ready, setReady] = useState(false);
  const [restoreLook] = useState(() => !link?.look);
  const [restoreTheme] = useState(() => !link?.theme);
  useEffect(() => {
    loadSaved({ restoreLook, restoreTheme }).finally(() => {
      if (TEST_MODE) setMotionSetting('reduced');
      setReady(true);
      // docs/UI.md §11.1 [DESIGN-REVIEW]: a fresh install opens on its first
      // decision -- not over a deep link of any kind (a lesson, a home page, a
      // look), which asks for its own screen, and not in the render test.
      if (!TEST_MODE && !link && !getProgress().firstTrade) setEntry(FIRST_TRADE);
      // A streak that broke since the last visit gets its screen, once.
      else if (!TEST_MODE && !link && lostStreak(getProgress()) > 0)
        setMoment({ kind: 'lost', lost: lostStreak(getProgress()) });
    });
    // Once, as the app opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreLook, restoreTheme]);

  // The render test (`npm run smoke`, `?test=1`) walks every screen in one page:
  // each new hash opens its screen afresh, error page included, without
  // reloading the app, and the page is marked once that screen has rendered.
  const [visit, setVisit] = useState(0);
  useEffect(() => {
    if (!TEST_MODE) return;
    const onHash = () => {
      const next = readDeepLink();
      setLink(next);
      setEntry(next?.entry ?? null);
      setCrash(!!next?.crash);
      setVisit((v) => v + 1);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (TEST_MODE && ready) document.documentElement.dataset.visit = String(visit);
  }, [visit, ready]);
  useEffect(() => {
    if (!TEST_MODE) return;
    // What the render test walks: every lesson the app can open, as the app sees it.
    (window as unknown as { __lessons: unknown }).__lessons = LESSONS.map((e) => ({
      id: e.id,
      screens: e.level.screens.length,
      // Each screen's type and the parts the validator counts as screens of their own.
      shape: e.level.screens.map((sc) => {
        const parts = sc as {
          type: string;
          cards?: unknown[];
          steps?: unknown[];
          items?: unknown[];
        };
        return [
          parts.type,
          parts.cards?.length ?? 0,
          parts.steps?.length ?? 0,
          parts.items?.length ?? 0,
        ];
      }),
      chapter: e.level.chapter,
      path: e.level.path,
      bench: !!e.testBench,
    }));
    // And every design suggestion, whose previews it opens one by one too.
    (window as unknown as { __suggestions: string[] }).__suggestions = SUGGESTIONS.map((s) => s.id);
  }, []);

  // Where the backdrop's grid starts. Charts subtract it from their own measured
  // y to find how far down the grid they sit (components/gridAlign.tsx). It is
  // 0 on a phone, where the frame fills the window, and is measured rather than
  // assumed because nothing guarantees that — a browser with a margin, a host
  // that insets the app, and the whole grid is off by that much.
  const frameRef = useRef<View | null>(null);
  const [gridOrigin, setGridOrigin] = useState(0);
  const measureFrame = useCallback(() => {
    frameRef.current?.measureInWindow((_x, y) => {
      if (!Number.isFinite(y)) return;
      setGridOrigin((prev) => (Math.abs(prev - y) < 0.5 ? prev : y));
    });
  }, []);
  useEffect(() => {
    measureFrame();
  }, [measureFrame, width, height]);

  useEffect(pinPage, []);

  // Light, dark or the phone's own (theme.ts). A change draws the app afresh,
  // so every colour is read again; while a lesson is open, the phone switching
  // on its own waits until the lesson closes.
  const themeKey = useThemeKey();
  const scheme = useScheme();
  // The look's ground under everything, drawn by the backdrop too; set here so
  // the frame itself is that colour (tools/ui_audit.mjs measures against it).
  const ground = useLookSpec().ground.color;
  useEffect(() => {
    holdSystemTheme(!!entry);
  }, [entry]);
  useEffect(() => paintBrowserBar(ground, scheme), [ground, scheme]);

  // "Back to the map" on the error page: home, and a deep link that led to the
  // crash is dropped, so a reload does not open it again.
  const backToMap = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setCrash(false);
    setEntry(null);
    setLink(null);
  }, []);

  return (
    // Drags (a slider, a line on a chart, a chip into a bucket) run through
    // react-native-gesture-handler, which needs its root at the top.
    <GestureHandlerRootView style={styles.gestures}>
      <SafeAreaProvider>
        <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
        <View key={themeKey} style={styles.root}>
          <View
            ref={frameRef}
            onLayout={measureFrame}
            style={[styles.frame, { width: frameWidth, backgroundColor: ground }]}
          >
            {/* One ground for the whole app: the design picked in Settings is the
              one the home screen stands on too, so a change shows at once. */}
            <Backdrop width={frameWidth} height={height} />
            <GridOriginProvider originY={gridOrigin}>
              <ErrorBoundary key={visit} onBack={backToMap}>
                {crash ? (
                  <DebugCrash />
                ) : entry ? (
                  <LessonPlayer
                    key={`${entry.id}#${visit}`}
                    level={entry.level}
                    startAt={link && link.entry === entry ? link.screen : 0}
                    testBench={entry.testBench}
                    kind={
                      entry === FIRST_TRADE
                        ? 'first'
                        : entry.testBench
                          ? 'lesson'
                          : entry.practice
                            ? 'practice'
                            : isBonus(entry)
                              ? 'bonus'
                              : (nodeOf(entry.id)?.kind ?? 'lesson')
                    }
                    lessonId={
                      entry.testBench || entry.practice || entry === FIRST_TRADE
                        ? undefined
                        : entry.id
                    }
                    sourceKeys={entry.practice?.keys}
                    initialPath={getProgress().path}
                    onChoosePath={(path) => {
                      choosePath(path);
                      // The path choice ends on its own key, with no summary;
                      // its skill flies into Practice as any lesson's does.
                      const fresh = collectSkills(skillsOf(entry).map((s) => s.id));
                      if (fresh.length) flySkills(fresh.length);
                    }}
                    contentWidth={contentWidth}
                    onQuit={() => {
                      // The first trade is shown once, finished or not.
                      if (entry === FIRST_TRADE) finishFirstTrade();
                      setEntry(null);
                      // The day's first lesson: the streak's screen before the map.
                      if (streakUp.current) {
                        setMoment(streakUp.current);
                        streakUp.current = null;
                      }
                    }}
                    // A lesson on the path counts once its summary is reached; the
                    // test bench is not on the path and just plays again. A
                    // practice round gives a heart back (docs/UI.md §5.2); a bonus
                    // lesson pays its gems the first time; new skills fly into
                    // Practice on the way home (§5.3).
                    onComplete={
                      entry.testBench
                        ? undefined
                        : (result) => {
                            if (entry === FIRST_TRADE) {
                              finishFirstTrade();
                              return;
                            }
                            if (entry.practice) {
                              giveHeart();
                              return;
                            }
                            const before = getProgress();
                            const first = !before.done[entry.id];
                            // docs/UI.md §5.3: the day's first lesson keeps the streak.
                            const firstToday = before.streak.last !== dayOf(new Date());
                            const from = streakDays(before);
                            completeLesson(entry.id, {
                              perfect: result.perfect,
                              xp: entry.level.xp,
                            });
                            if (firstToday)
                              streakUp.current = {
                                kind: 'up',
                                from,
                                to: streakDays(getProgress()),
                              };
                            if (first && isBonus(entry)) earnGems(entry.level.gems ?? 0);
                            if (result.skills.length) flySkills(result.skills.length);
                          }
                    }
                  />
                ) : moment ? (
                  <StreakMoment change={moment} onDone={endMoment} />
                ) : ready ? (
                  <Home
                    width={frameWidth}
                    onStart={setEntry}
                    onOpenBench={() => setEntry(TEST_BENCH)}
                  />
                ) : null}
              </ErrorBoundary>
            </GridOriginProvider>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * docs/UI.md §2: nothing scrolls. In a browser that has to hold for the page as
 * well as the app. `overflow: hidden` alone does not stop iOS Safari: the page
 * still rubber-bands, and two quick taps -- a keypad, "Next bar" -- zoom it in,
 * after which the whole lesson pans under the finger. So the page is pinned,
 * overscroll is off and double-tap zoom is off. Pinch zoom is left alone: it
 * is an accessibility tool, not a gesture the lesson competes with.
 *
 * The same sheet gives chart text the app's typeface, see below.
 */
function pinPage() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    html, body { overscroll-behavior: none; touch-action: manipulation; }
    body { position: fixed; inset: 0; overflow: hidden; }
    #root { touch-action: manipulation; }
    /* SVG text (chart axes, labels) inherits its font from the page rather
       than taking the app's, and a browser's page default is a serif. */
    #root svg { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
  `;
  document.head.appendChild(style);
  return () => {
    style.remove();
  };
}

/**
 * On the web, the browser's bar and the page behind the app take the ground's
 * colour, following the app's own theme rather than only the system's
 * (public/index.html sets both until the app runs).
 */
function paintBrowserBar(ground: string, scheme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = ground;
  document.head.appendChild(meta);
  document.documentElement.style.colorScheme = scheme;
  document.body.style.backgroundColor = ground;
}

/**
 * `?test=1` on a test build: the render test's switch. It turns animations off
 * (reduced motion) and lets a hash change open the next screen in place.
 */
const TEST_MODE =
  TEST_TOOLS &&
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  /[?&]test=1\b/.test(window.location.search + window.location.hash);

function readDeepLink(): {
  entry: LessonEntry | null;
  screen: number;
  look: boolean;
  theme: boolean;
  crash?: boolean;
} | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?');
  // `?look=neoMono` opens it in a given look and `?theme=light` in a given
  // theme, for comparing them screen by screen (tools/contact_sheets.mjs).
  const params = new URLSearchParams(query);
  const look = params.get('look');
  const named = isLook(look);
  if (named) setLook(look);
  const theme = params.get('theme');
  const themed = theme === 'light' || theme === 'dark' || theme === 'system';
  if (themed) setThemeMode(theme as ThemeMode);
  const [id, screen] = path.split('/');
  if (id === 'home' && TEST_TOOLS && openHomeAt(path.split('/').slice(1).join('/')))
    return { entry: null, screen: 0, look: named, theme: themed };
  if (id === 'debug-crash' && TEST_TOOLS)
    return { entry: null, screen: 0, look: named, theme: themed, crash: true };
  const found =
    LESSONS.find((l) => l.id === id) ??
    (TEST_TOOLS ? [NEW_DESIGNS, FIRST_TRADE].find((l) => l.id === id) : undefined) ??
    null;
  // The test bench is a testing tool: a release build does not open it.
  const entry = found?.testBench && !TEST_TOOLS ? null : found;
  if (!entry && !named && !themed) return null;
  // Pages count from 1, as they are shown; the player counts from 0.
  return {
    entry,
    screen: Math.max(1, Number(screen) || 1) - 1,
    look: named,
    theme: themed,
  };
}

const styles = themed(() => ({
  gestures: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.shade, alignItems: 'center' },
  frame: { flex: 1, overflow: 'hidden' },
}));
