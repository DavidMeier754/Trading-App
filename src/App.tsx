import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Backdrop from './components/Backdrop';
import { GridOriginProvider } from './components/gridAlign';
import ErrorBoundary from './ErrorBoundary';
import { LessonEntry, LESSONS } from './content';
import LessonPlayer from './lesson/LessonPlayer';
import LessonPicker from './LessonPicker';
import { colors, space } from './theme';

/** docs/UI.md §2 is portrait-only, so the player is capped at a phone width. */
const MAX_WIDTH = 480;

export default function App() {
  const { width, height } = useWindowDimensions();
  const frameWidth = Math.min(width, MAX_WIDTH);
  const contentWidth = frameWidth - space.lg * 2;

  const [entry, setEntry] = useState<LessonEntry | null>(null);

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

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        <View
          ref={frameRef}
          onLayout={measureFrame}
          style={[styles.frame, { width: frameWidth }]}
        >
          <Backdrop width={frameWidth} height={height} />
          <GridOriginProvider originY={gridOrigin}>
            <ErrorBoundary>
              {entry ? (
                <LessonPlayer
                  key={entry.id}
                  level={entry.level}
                  contentWidth={contentWidth}
                  onQuit={() => setEntry(null)}
                />
              ) : (
                <LessonPicker lessons={LESSONS} onPick={setEntry} />
              )}
            </ErrorBoundary>
          </GridOriginProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  frame: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
});
