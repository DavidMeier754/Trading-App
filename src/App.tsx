import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Backdrop from './components/Backdrop';
import { GridOriginProvider } from './components/gridAlign';
import ErrorBoundary from './ErrorBoundary';
import { LessonEntry, LESSONS, nodeOf, TEST_BENCH } from './content';
import Home from './home/Home';
import { Look, LOOKS, setLook } from './lesson/look';
import LessonPlayer from './lesson/LessonPlayer';
import { choosePath, completeLesson, getProgress, loadSaved } from './progress';
import { colors, space } from './theme';

/** docs/UI.md §2 is portrait-only, so the player is capped at a phone width. */
const MAX_WIDTH = 480;

export default function App() {
  const { width, height } = useWindowDimensions();
  const frameWidth = Math.min(width, MAX_WIDTH);
  const contentWidth = frameWidth - space.lg * 2;

  // A web deep link, `#all-screens/34`, opens a lesson on page 34 -- the number
  // the test bench shows in its top bar. It is how the bench's 49 screens get
  // looked at one by one; the app proper has no URLs.
  const [link] = useState(() => readDeepLink());
  const [entry, setEntry] = useState<LessonEntry | null>(link?.entry ?? null);

  // Saved progress and settings come back before the home screen is drawn, so
  // the path never flashes empty first. A deep link opens its lesson at once,
  // and a look it names wins over the saved one.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadSaved({ restoreLook: !link?.look }).finally(() => setReady(true));
  }, [link]);

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

  return (
    // Drags (a slider, a line on a chart, a chip into a bucket) run through
    // react-native-gesture-handler, which needs its root at the top.
    <GestureHandlerRootView style={styles.gestures}>
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        <View
          ref={frameRef}
          onLayout={measureFrame}
          style={[styles.frame, { width: frameWidth }]}
        >
          {/* One ground for the whole app: the design picked in Settings is the
              one the home screen stands on too, so a change shows at once. */}
          <Backdrop width={frameWidth} height={height} />
          <GridOriginProvider originY={gridOrigin}>
            <ErrorBoundary>
              {entry ? (
                <LessonPlayer
                  key={entry.id}
                  level={entry.level}
                  startAt={link && link.entry === entry ? link.screen : 0}
                  testBench={entry.testBench}
                  kind={entry.testBench ? 'lesson' : (nodeOf(entry.id)?.kind ?? 'lesson')}
                  initialPath={getProgress().path}
                  onChoosePath={choosePath}
                  contentWidth={contentWidth}
                  onQuit={() => setEntry(null)}
                  // A lesson on the path counts once its summary is reached; the
                  // test bench is not on the path and just plays again.
                  onComplete={
                    entry.testBench
                      ? undefined
                      : (result) => completeLesson(entry.id, { ...result, xp: entry.level.xp })
                  }
                />
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

function readDeepLink(): { entry: LessonEntry | null; screen: number; look: boolean } | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?');
  // `?look=neoMono` opens it in a given look, for comparing them screen by screen.
  const look = new URLSearchParams(query).get('look');
  const named = !!look && look in LOOKS;
  if (named) setLook(look as Look);
  const [id, screen] = path.split('/');
  const entry = LESSONS.find((l) => l.id === id) ?? null;
  if (!entry && !named) return null;
  // Pages count from 1, as they are shown; the player counts from 0.
  return { entry, screen: Math.max(1, Number(screen) || 1) - 1, look: named };
}

const styles = StyleSheet.create({
  gestures: { flex: 1 },
  root: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  frame: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
});
