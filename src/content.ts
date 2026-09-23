// The lessons this player can open, plus the market profile used for §9 tokens.
// All of it is YAML parsed at build time by metro/yaml-transformer.js.
//
// level-01-1 is the repo's own content and is never copied or rewritten.
// all-screens is a throwaway test bench that lives in demo/, deliberately
// outside content/, so tools/validate_content.py never sees it.
import realLevel from '../content/shared/chapter-01-market-basics/level-01-1.yaml';
import profilesYaml from '../content/market_profiles.yaml';
import demoLevel from '../demo/all-screens.yaml';

import type { Level, MarketProfile } from './types';

export type LessonEntry = {
  id: string;
  title: string;
  subtitle: string;
  level: Level;
  /**
   * Show "12/49" in the top bar. The test bench is reviewed screen by screen,
   * and a page number is what makes "screen 34 looks off" findable.
   */
  pageNumbers?: boolean;
};

export const LESSONS: LessonEntry[] = [
  {
    id: 'level-01-1',
    title: 'Your First Trade',
    subtitle: 'The real Chapter 1 lesson, 14 screens',
    level: realLevel as unknown as Level,
  },
  {
    id: 'all-screens',
    title: 'Every Screen Type',
    subtitle: 'Test bench: all 36 archetypes back to back',
    level: demoLevel as unknown as Level,
    pageNumbers: true,
  },
];

/** Kept for anything that just wants the real lesson. */
export const level = LESSONS[0].level;

const profiles = profilesYaml as unknown as Record<string, MarketProfile>;

/** docs/UI.md §11.5 makes this a Settings choice; this player has no settings, so US. */
export const ACTIVE_PROFILE = 'US';
export const market: MarketProfile = profiles[ACTIVE_PROFILE];
