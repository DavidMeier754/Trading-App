// The lessons this player can open, plus the market profile used for §9 tokens.
// All of it is YAML parsed at build time by metro/yaml-transformer.js.
//
// The chapter files are the repo's own content and are never copied or
// rewritten. all-screens is a throwaway test bench that lives in demo/,
// deliberately outside content/, so tools/validate_content.py never sees it.
import c1_011 from '../content/shared/chapter-01-market-basics/level-01-1.yaml';
import c1_012 from '../content/shared/chapter-01-market-basics/level-01-2.yaml';
import c1_013 from '../content/shared/chapter-01-market-basics/level-01-3.yaml';
import c1_014 from '../content/shared/chapter-01-market-basics/level-01-4.yaml';
import c1_021 from '../content/shared/chapter-01-market-basics/level-02-1.yaml';
import c1_022 from '../content/shared/chapter-01-market-basics/level-02-2.yaml';
import c1_023 from '../content/shared/chapter-01-market-basics/level-02-3.yaml';
import c1_031 from '../content/shared/chapter-01-market-basics/level-03-1.yaml';
import c1_032 from '../content/shared/chapter-01-market-basics/level-03-2.yaml';
import c1_033 from '../content/shared/chapter-01-market-basics/level-03-3.yaml';
import c1_041 from '../content/shared/chapter-01-market-basics/level-04-1.yaml';
import c1_042 from '../content/shared/chapter-01-market-basics/level-04-2.yaml';
import c1_043 from '../content/shared/chapter-01-market-basics/level-04-3.yaml';
import c1_044 from '../content/shared/chapter-01-market-basics/level-04-4.yaml';
import c1_051 from '../content/shared/chapter-01-market-basics/level-05-1.yaml';
import c1_061 from '../content/shared/chapter-01-market-basics/level-06-1.yaml';
import c1_062 from '../content/shared/chapter-01-market-basics/level-06-2.yaml';
import c1_063 from '../content/shared/chapter-01-market-basics/level-06-3.yaml';
import c1_071 from '../content/shared/chapter-01-market-basics/level-07-1.yaml';
import c1_072 from '../content/shared/chapter-01-market-basics/level-07-2.yaml';
import c1_073 from '../content/shared/chapter-01-market-basics/level-07-3.yaml';
import c1_074 from '../content/shared/chapter-01-market-basics/level-07-4.yaml';
import c1_081 from '../content/shared/chapter-01-market-basics/level-08-1.yaml';
import c1_082 from '../content/shared/chapter-01-market-basics/level-08-2.yaml';
import c1_083 from '../content/shared/chapter-01-market-basics/level-08-3.yaml';
import c1_091 from '../content/shared/chapter-01-market-basics/level-09-1.yaml';
import c1_092 from '../content/shared/chapter-01-market-basics/level-09-2.yaml';
import c1_101 from '../content/shared/chapter-01-market-basics/level-10-1.yaml';
import c1_102 from '../content/shared/chapter-01-market-basics/level-10-2.yaml';
import c1_103 from '../content/shared/chapter-01-market-basics/level-10-3.yaml';
import c1_111 from '../content/shared/chapter-01-market-basics/level-11-1.yaml';
import c1_121 from '../content/shared/chapter-01-market-basics/level-12-1.yaml';
import c1_122 from '../content/shared/chapter-01-market-basics/level-12-2.yaml';
import c1_123 from '../content/shared/chapter-01-market-basics/level-12-3.yaml';
import c1_131 from '../content/shared/chapter-01-market-basics/level-13-1.yaml';
import c1_132 from '../content/shared/chapter-01-market-basics/level-13-2.yaml';
import c1_133 from '../content/shared/chapter-01-market-basics/level-13-3.yaml';
import c1_134 from '../content/shared/chapter-01-market-basics/level-13-4.yaml';
import c1_141 from '../content/shared/chapter-01-market-basics/level-14-1.yaml';
import c1_142 from '../content/shared/chapter-01-market-basics/level-14-2.yaml';
import c1_143 from '../content/shared/chapter-01-market-basics/level-14-3.yaml';
import c1_151 from '../content/shared/chapter-01-market-basics/level-15-1.yaml';
import c1_152 from '../content/shared/chapter-01-market-basics/level-15-2.yaml';
import c1_153 from '../content/shared/chapter-01-market-basics/level-15-3.yaml';
import c1_161 from '../content/shared/chapter-01-market-basics/level-16-1.yaml';
import c1_162 from '../content/shared/chapter-01-market-basics/level-16-2.yaml';
import c1_171 from '../content/shared/chapter-01-market-basics/level-17-1.yaml';
import c1_172 from '../content/shared/chapter-01-market-basics/level-17-2.yaml';
import s2_011 from '../content/paths/scalping/chapter-02-charts-101/level-01-1.yaml';
import s2_012 from '../content/paths/scalping/chapter-02-charts-101/level-01-2.yaml';
import s2_013 from '../content/paths/scalping/chapter-02-charts-101/level-01-3.yaml';
import s2_014 from '../content/paths/scalping/chapter-02-charts-101/level-01-4.yaml';
import s2_021 from '../content/paths/scalping/chapter-02-charts-101/level-02-1.yaml';
import s2_022 from '../content/paths/scalping/chapter-02-charts-101/level-02-2.yaml';
import s2_023 from '../content/paths/scalping/chapter-02-charts-101/level-02-3.yaml';
import s2_031 from '../content/paths/scalping/chapter-02-charts-101/level-03-1.yaml';
import s2_032 from '../content/paths/scalping/chapter-02-charts-101/level-03-2.yaml';
import s2_033 from '../content/paths/scalping/chapter-02-charts-101/level-03-3.yaml';
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
 * What a node on the path is (docs/UI.md §7.1): a level of lessons, a scored
 * Checkpoint (`test`, a shield) or Final Exam (`final`, a trophy), or the path
 * choice that closes Chapter 1 (docs/UI.md §11.4).
 */
export type NodeKind = 'lesson' | 'test' | 'final' | 'path';

/**
 * One node on the path: a level, made of its sub-levels, which are played in
 * order and each unlock the next through `prerequisite`.
 */
export type PathLevel = {
  /** Unique on the map: `1-5`, `1-path`, `2-1`. */
  key: string;
  /** The level's number within its chapter: the `2` of `2-3`. The path choice has none. */
  number: number | null;
  title: string;
  chapter: number;
  chapterTitle: string;
  kind: NodeKind;
  subs: LessonEntry[];
};

/** What a level teaches, as its node draws it: the first `icon` among its lessons. */
export function levelIconOf(level: PathLevel): string | undefined {
  return level.subs.find((s) => s.level.icon)?.level.icon;
}

/**
 * docs/UI.md §7.1: what kind of level a node is, which its button shows as a
 * symbol instead of a number. A level with any new-theory lesson in it teaches
 * something new; one made only of repetition is practice.
 */
export type LevelType = 'new' | 'practice' | 'test' | 'final' | 'path';

export function levelTypeOf(level: PathLevel): LevelType {
  if (level.kind !== 'lesson') return level.kind;
  return level.subs.some((s) => s.level.category === 'new-theory') ? 'new' : 'practice';
}

/** The kind of level in words, beside its symbol. */
export const LEVEL_TYPE_NAME: Record<LevelType, string> = {
  new: 'New ideas',
  practice: 'Practice',
  test: 'Checkpoint',
  final: 'Final Exam',
  path: 'Your path',
};

export type Chapter = {
  number: number;
  title: string;
  /** `all` for the shared Chapter 1; otherwise the path it belongs to. */
  path: string;
  levels: PathLevel[];
  /** How many levels docs/curriculum.md gives the chapter; more than `levels` while it is being wired in. */
  planned: number;
};

/** docs/curriculum.md: the three paths, and whether their chapters are written yet. */
export type TradingPath = 'scalping' | 'day-trading' | 'swing-trading';
export const PATHS: { id: TradingPath; name: string; written: boolean }[] = [
  { id: 'scalping', name: 'Scalping', written: true },
  { id: 'day-trading', name: 'Day Trading', written: false },
  { id: 'swing-trading', name: 'Swing Trading', written: false },
];

const chapterOne = [
  c1_011, c1_012, c1_013, c1_014, c1_021, c1_022, c1_023, c1_031, c1_032, c1_033, c1_041,
  c1_042, c1_043, c1_044, c1_051, c1_061, c1_062, c1_063, c1_071, c1_072, c1_073, c1_074,
  c1_081, c1_082, c1_083, c1_091, c1_092, c1_101, c1_102, c1_103, c1_111, c1_121, c1_122,
  c1_123, c1_131, c1_132, c1_133, c1_134, c1_141, c1_142, c1_143, c1_151, c1_152, c1_153,
  c1_161, c1_162, c1_171, c1_172,
].map((file) => file as unknown as Level);
const scalpingTwo = [
  s2_011, s2_012, s2_013, s2_014, s2_021, s2_022, s2_023, s2_031, s2_032, s2_033,
].map((file) => file as unknown as Level);

/** The id a sub-level is saved and linked under. Chapter 1 keeps its first, short form. */
function entryId(level: Level): string {
  const [number, sub] = level.id.split('-');
  const tail = `level-${number.padStart(2, '0')}-${sub}`;
  return level.chapter === 1 ? tail : `${level.path}-ch${level.chapter}-${tail}`;
}

function kindOf(level: Level): NodeKind {
  if (level.category === 'test') return 'test';
  if (level.category === 'final-exam') return 'final';
  return 'lesson';
}

/**
 * The path choice is a lesson of its own, Level 17-2 (docs/curriculum.md): it
 * lays the three paths side by side and ends on the `path-choice` screen. On
 * the map it is not part of Level 17 but a node after it -- the exam ends on
 * its badge, the choice is played from its own node, and it can be played
 * again to change the path.
 */
function isPathLesson(level: Level): boolean {
  return level.screens[level.screens.length - 1]?.type === 'path-choice';
}

/** Groups sub-level files into their levels, from the files' own ids (`2-3` is level 2, sub 3). */
function chapterFrom(files: Level[], planned: number): Chapter {
  const levels: PathLevel[] = [];
  let pathChoice: Level | null = null;
  for (const file of files) {
    const level = file;
    if (isPathLesson(file)) {
      pathChoice = file;
      continue;
    }
    const [number] = level.id.split('-').map(Number);
    let node = levels.find((l) => l.number === number);
    if (!node) {
      node = {
        key: `${level.chapter}-${number}`,
        number,
        title: level.title,
        chapter: level.chapter,
        chapterTitle: level.chapter_title,
        kind: kindOf(level),
        subs: [],
      };
      levels.push(node);
    }
    node.subs.push({ id: entryId(level), title: level.title, subtitle: '', level });
  }
  for (const node of levels) {
    node.subs.forEach((entry, i) => {
      entry.subtitle = `Level ${node.number} · Lesson ${i + 1} of ${node.subs.length}`;
    });
  }
  if (pathChoice) {
    levels.push({
      key: `${files[0].chapter}-path`,
      number: null,
      title: 'Choose Your Path',
      chapter: files[0].chapter,
      chapterTitle: files[0].chapter_title,
      kind: 'path',
      subs: [{ id: PATH_CHOICE_ID, title: 'Choose Your Path', subtitle: 'Your path', level: pathChoice }],
    });
  }
  return {
    number: files[0].chapter,
    title: files[0].chapter_title,
    path: files[0].path,
    levels,
    planned,
  };
}

/** Saved as done once a path is chosen; the choice itself is `progress.path`. */
export const PATH_CHOICE_ID = 'path-choice';

/** docs/curriculum.md: Chapter 1 has 17 levels, all written and wired in. */
export const CHAPTER_ONE: Chapter = chapterFrom(chapterOne, 17);

/**
 * Each path's chapters after the first, as far as they are wired in. Scalping
 * Chapter 2 is here to its Level 3; Day Trading and Swing Trading are outlined
 * in docs/curriculum.md and not written yet.
 */
export const PATH_CHAPTERS: Record<TradingPath, Chapter[]> = {
  scalping: [chapterFrom(scalpingTwo, 18)],
  'day-trading': [],
  'swing-trading': [],
};

/** The map for a learner on `path` (none chosen yet: Chapter 1 alone). */
export function chaptersFor(path: TradingPath | null): Chapter[] {
  return [CHAPTER_ONE, ...(path ? PATH_CHAPTERS[path] : [])];
}

/** Every level of every chapter, in map order. */
export function levelsOf(chapters: Chapter[]): PathLevel[] {
  return chapters.flatMap((c) => c.levels);
}

/** Kept for code that wants the one list: Chapter 1 and the scalping chapters. */
export const PATH: PathLevel[] = levelsOf(chaptersFor('scalping'));

/** The test bench: every screen type back to back (Settings → Test bench). */
export const TEST_BENCH: LessonEntry = {
  id: 'all-screens',
  title: 'Every Screen Type',
  subtitle: 'Test bench: all 36 archetypes back to back',
  level: demoLevel as unknown as Level,
  testBench: true,
};

/** Everything a deep link can open: every sub-level of every wired path, and the bench. */
export const LESSONS: LessonEntry[] = [
  ...levelsOf([CHAPTER_ONE, ...Object.values(PATH_CHAPTERS).flat()]).flatMap((level) => level.subs),
  TEST_BENCH,
];

/** The node a lesson belongs to. */
export function nodeOf(entryIdToFind: string): PathLevel | undefined {
  return levelsOf([CHAPTER_ONE, ...Object.values(PATH_CHAPTERS).flat()]).find((l) =>
    l.subs.some((s) => s.id === entryIdToFind)
  );
}

/**
 * docs/UI.md §3 `recap`: a takeaway re-opens the card it came from. The card is
 * the first theory card of that sub-level, found in the same chapter and path
 * as the recap (a recap names its sources by id, `3-1`).
 */
export function sourceCardOf(
  from: Level,
  id: string
): { title: string; body: string; lesson: string } | null {
  const entry = LESSONS.find(
    (e) => !e.testBench && e.level.id === id && e.level.chapter === from.chapter && e.level.path === from.path
  );
  const card = entry?.level.screens.find((s) => s.type === 'theory') as
    | { title: string; body: string }
    | undefined;
  return entry && card ? { title: card.title, body: card.body, lesson: entry.subtitle } : null;
}

/** Kept for anything that just wants the first lesson. */
export const level = LESSONS[0].level;

const profiles = profilesYaml as unknown as Record<string, MarketProfile>;

/** docs/UI.md §11.5 makes this a Settings choice; this player has no settings, so US. */
export const ACTIVE_PROFILE = 'US';
export const market: MarketProfile = profiles[ACTIVE_PROFILE];
