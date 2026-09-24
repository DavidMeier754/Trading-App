// The lessons this player can open, plus the market profile used for §9 tokens.
// All of it is YAML parsed at build time by metro/yaml-transformer.js.
//
// The chapter files are the repo's own content and are never copied or
// rewritten. all-screens is a throwaway test bench that lives in demo/,
// deliberately outside content/, so tools/validate_content.py never sees it.
import l0101 from '../content/shared/chapter-01-market-basics/level-01-1.yaml';
import l0102 from '../content/shared/chapter-01-market-basics/level-01-2.yaml';
import l0103 from '../content/shared/chapter-01-market-basics/level-01-3.yaml';
import l0104 from '../content/shared/chapter-01-market-basics/level-01-4.yaml';
import l0201 from '../content/shared/chapter-01-market-basics/level-02-1.yaml';
import l0202 from '../content/shared/chapter-01-market-basics/level-02-2.yaml';
import l0203 from '../content/shared/chapter-01-market-basics/level-02-3.yaml';
import l0301 from '../content/shared/chapter-01-market-basics/level-03-1.yaml';
import l0302 from '../content/shared/chapter-01-market-basics/level-03-2.yaml';
import l0303 from '../content/shared/chapter-01-market-basics/level-03-3.yaml';
import profilesYaml from '../content/market_profiles.yaml';
import demoLevel from '../demo/all-screens.yaml';

import type { Level, MarketProfile } from './types';

export type LessonEntry = {
  id: string;
  title: string;
  subtitle: string;
  level: Level;
  /**
   * A test level, not a lesson. It is reviewed screen by screen, so it shows
   * "12/49" in the top bar -- what makes "screen 34 looks off" findable -- and
   * a back button to look at the screen before again. Real lessons keep
   * docs/UI.md §2's rule: no back button inside a lesson.
   */
  testBench?: boolean;
};

/**
 * One node on the path (docs/UI.md §7.1): a level, made of its sub-levels, which
 * are played in order and each unlock the next through `prerequisite`.
 */
export type PathLevel = {
  /** The level's number within its chapter: the `2` of `2-3`. */
  number: number;
  title: string;
  chapter: number;
  chapterTitle: string;
  subs: LessonEntry[];
};

const levelFiles = [l0101, l0102, l0103, l0104, l0201, l0202, l0203, l0301, l0302, l0303].map(
  (file) => file as unknown as Level
);

/**
 * The path the home screen shows: Chapter 1's first three levels. Grouped from
 * the files' own ids (`1-3` is level 1, sub-level 3), so adding a level is
 * adding its files above.
 */
export const PATH: PathLevel[] = (() => {
  const levels: PathLevel[] = [];
  for (const level of levelFiles) {
    const [number, sub] = level.id.split('-').map(Number);
    let node = levels.find((l) => l.number === number);
    if (!node) {
      node = {
        number,
        title: level.title,
        chapter: level.chapter,
        chapterTitle: level.chapter_title,
        subs: [],
      };
      levels.push(node);
    }
    node.subs.push({
      id: `level-${String(number).padStart(2, '0')}-${sub}`,
      title: level.title,
      subtitle: '',
      level,
    });
  }
  for (const node of levels) {
    node.subs.forEach((entry, i) => {
      entry.subtitle = `Level ${node.number} · Lesson ${i + 1} of ${node.subs.length}`;
    });
  }
  return levels;
})();

/** The test bench: every screen type back to back (Settings → Test bench). */
export const TEST_BENCH: LessonEntry = {
  id: 'all-screens',
  title: 'Every Screen Type',
  subtitle: 'Test bench: all 36 archetypes back to back',
  level: demoLevel as unknown as Level,
  testBench: true,
};

/** Everything a deep link can open: every sub-level on the path, and the bench. */
export const LESSONS: LessonEntry[] = [...PATH.flatMap((level) => level.subs), TEST_BENCH];

/** Kept for anything that just wants the first lesson. */
export const level = LESSONS[0].level;

const profiles = profilesYaml as unknown as Record<string, MarketProfile>;

/** docs/UI.md §11.5 makes this a Settings choice; this player has no settings, so US. */
export const ACTIVE_PROFILE = 'US';
export const market: MarketProfile = profiles[ACTIVE_PROFILE];
