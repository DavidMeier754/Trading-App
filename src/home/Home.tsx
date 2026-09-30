import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { LessonEntry } from '../content';
import type { PrototypePage } from '../testTools';
import AccountScreen from './AccountScreen';
import AnimationsScreen from './AnimationsScreen';
import EmptyTab from './EmptyTab';
import LearnScreen from './LearnScreen';
import SettingsScreen from './SettingsScreen';
import TabBar, { Tab } from './TabBar';

/** A page over the tabs: Settings, or its Animations page (test builds). */
type Page = 'settings' | 'animations' | null;

/**
 * Where the learner was, kept while a lesson is open. The home screen is
 * unmounted under a lesson, so coming back from the test bench opened in
 * Settings lands in Settings, coming back from the prototype opened on the
 * Animations page lands there, and coming back from a lesson on the path
 * lands on the path.
 */
let lastTab: Tab = 'learn';
let lastPage: Page = null;

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
  onOpenPrototype: (page?: PrototypePage) => void;
}) {
  const [tab, setTabState] = useState<Tab>(lastTab);
  const [page, setPageState] = useState<Page>(lastPage);
  const setTab = (next: Tab) => {
    lastTab = next;
    setTabState(next);
  };
  const setPage = (next: Page) => {
    lastPage = next;
    setPageState(next);
  };

  if (page === 'animations') {
    return (
      <AnimationsScreen
        onBack={() => setPage('settings')}
        onShowMap={() => {
          setPage(null);
          setTab('learn');
        }}
        onOpenPrototype={onOpenPrototype}
      />
    );
  }
  if (page === 'settings') {
    return (
      <SettingsScreen
        width={width}
        onBack={() => setPage(null)}
        onOpenBench={onOpenBench}
        onOpenPrototype={onOpenPrototype}
        onOpenAnimations={() => setPage('animations')}
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
          <AccountScreen onOpenSettings={() => setPage('settings')} />
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
