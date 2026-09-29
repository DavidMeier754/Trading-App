import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { LessonEntry } from '../content';
import AccountScreen from './AccountScreen';
import EmptyTab from './EmptyTab';
import LearnScreen from './LearnScreen';
import SettingsScreen from './SettingsScreen';
import TabBar, { Tab } from './TabBar';

/**
 * Where the learner was, kept while a lesson is open. The home screen is
 * unmounted under a lesson, so coming back from the test bench opened in
 * Settings lands in Settings, and coming back from a lesson on the path lands
 * on the path.
 */
let lastTab: Tab = 'learn';
let lastSettings = false;

/**
 * The home screen (docs/UI.md §11.2): the path, and the tabs along the bottom.
 * Its panels are Classic's whatever look is picked; the ground under them is
 * the picked look's (components/Backdrop.tsx), so a new design shows here the
 * moment it is chosen.
 */
export default function Home({
  width,
  onStart,
  onOpenBench,
  onOpenPrototype,
}: {
  width: number;
  onStart: (entry: LessonEntry) => void;
  onOpenBench: () => void;
  onOpenPrototype: (page?: 'suggestions') => void;
}) {
  const [tab, setTabState] = useState<Tab>(lastTab);
  const [settings, setSettingsState] = useState(lastSettings);
  const setTab = (next: Tab) => {
    lastTab = next;
    setTabState(next);
  };
  const setSettings = (open: boolean) => {
    lastSettings = open;
    setSettingsState(open);
  };

  if (settings) {
    return (
      <SettingsScreen
        width={width}
        onBack={() => setSettings(false)}
        onOpenBench={onOpenBench}
        onOpenPrototype={onOpenPrototype}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.page}>
        {tab === 'learn' ? (
          <LearnScreen
            width={width}
            onStart={(entry) => {
              lastTab = 'learn';
              onStart(entry);
            }}
          />
        ) : tab === 'practice' ? (
          <EmptyTab
            title="Practice"
            icon="practice"
            line="Review mixes, setup drills and the replay tab will live here."
          />
        ) : tab === 'leaderboard' ? (
          <EmptyTab
            title="Leaderboard"
            icon="leaderboard"
            line="See how your week compares once the leaderboard opens."
          />
        ) : (
          <AccountScreen onOpenSettings={() => setSettings(true)} />
        )}
      </View>
      <TabBar tab={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  page: { flex: 1 },
});
