import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { LessonEntry } from '../content';
import AccountScreen from './AccountScreen';
import AnimationsScreen from './AnimationsScreen';
import ChangeDesign from './ChangeDesign';
import EmptyTab from './EmptyTab';
import LearnScreen from './LearnScreen';
import SettingsScreen from './SettingsScreen';
import Suggestions from './Suggestions';
import TabBar, { Tab } from './TabBar';

/**
 * A page over the tabs: Settings and its Change design, and in test builds the
 * pages its testing tools open (docs/UI.md §11.5).
 */
type Page = 'settings' | 'design' | 'animations' | 'suggestions' | null;
const PAGES: Exclude<Page, null>[] = ['settings', 'design', 'animations', 'suggestions'];

/**
 * Where the learner was, kept while a lesson is open. The home screen is
 * unmounted under a lesson, so coming back from the test bench opened on the
 * Settings page lands there, and coming back from a lesson on the path
 * lands on the path.
 */
let lastTab: Tab = 'learn';
let lastPage: Page = null;

/**
 * Test builds: `#home/settings` (or another page: design, animations,
 * suggestions; or a tab: learn, practice, account) opens the home
 * screen there, so the contact sheets and the UI check see it
 * (tools/contact_sheets.mjs). Returns false for a name it does not know.
 */
export function openHomeAt(name: string): boolean {
  const page = PAGES.find((p) => p === name);
  if (page) {
    lastPage = page;
    return true;
  }
  if (name === 'learn' || name === 'practice' || name === 'account') {
    lastPage = null;
    lastTab = name;
    return true;
  }
  return false;
}

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
}: {
  width: number;
  onStart: (entry: LessonEntry) => void;
  onOpenBench: () => void;
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
      />
    );
  }
  if (page === 'suggestions') return <Suggestions onBack={() => setPage('settings')} />;
  if (page === 'design') return <ChangeDesign width={width} onBack={() => setPage('settings')} />;
  if (page === 'settings') {
    return (
      <SettingsScreen
        onBack={() => setPage(null)}
        onOpenDesign={() => setPage('design')}
        onOpenBench={onOpenBench}
        onOpenAnimations={() => setPage('animations')}
        onOpenSuggestions={() => setPage('suggestions')}
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
            line="Review mixes and setup drills come here."
          />
        ) : tab === 'leaderboard' ? (
          <EmptyTab
            title="Leaderboard"
            icon="leaderboard"
            line="How your week compares, once it opens."
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
