import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LessonEntry, LESSONS } from './content';
import LessonPlayer from './lesson/LessonPlayer';
import LessonPicker from './LessonPicker';
import { colors, space } from './theme';

/** docs/UI.md §2 is portrait-only, so the player is capped at a phone width. */
const MAX_WIDTH = 480;

export default function App() {
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, MAX_WIDTH);
  const contentWidth = frameWidth - space.lg * 2;

  const [entry, setEntry] = useState<LessonEntry | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        <View style={[styles.frame, { width: frameWidth }]}>
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
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  frame: { flex: 1, backgroundColor: colors.background },
});
