// The lessons this player can open, plus the market profile used for §9 tokens.
// All of it is YAML parsed at build time by metro/yaml-transformer.js.
//
// The chapter files are the repo's own content and are never copied or
// rewritten. Which files there are comes from content.generated.ts, which
// `npm run gen:content` writes from content/** (CI checks it is up to date).
// all-screens is a throwaway test bench that lives in demo/, deliberately
// outside content/, so tools/validate_content.py never sees it.
import { CHAPTER_FILES } from './content.generated';
import profilesYaml from '../content/market_profiles.yaml';
import demoLevel from '../demo/all-screens.yaml';

import type { Level, MarketProfile, Screen } from './types';

export type LessonEntry = {
  id: string;
  title: string;
  subtitle: string;
  level: Level;
  /**
   * A test level, not a lesson. It is reviewed screen by screen, so it shows
   * "12/49" in the top bar -- what makes "screen 34 looks off" findable -- and
   * a back button to look at the screen before again. Real lessons keep
   * docs/ui/02-lesson-player-layout.md §2's rule: no back button inside a lesson.
   */
  testBench?: boolean;
  /**
   * A practice round made in code (practice.ts): its screens come from many
   * lessons, and `keys` gives each one's question key in the record.
   */
  practice?: { keys: (string | null)[] };
};

/**
 * What a node on the path is (docs/ui/10-path-map.md §7.1): a level of lessons, a scored
 * Checkpoint (`test`, a shield) or Final Exam (`final`, a trophy), or the path
 * choice that closes Chapter 1 (docs/ui/16-navigation.md §11.4).
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
 * docs/ui/10-path-map.md §7.1: what kind of level a node is, which its button shows as a
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
  /** How many levels docs/course/ gives the chapter; more than `levels` while it is being wired in. */
  planned: number;
  /** Its bonus side lessons (docs/level-files/, DESIGN-REVIEW), by the level they follow. */
  bonus: BonusLesson[];
};

/** A bonus side lesson beside the path (docs/ui/10-path-map.md §7.1 "Side stops"). */
export type BonusLesson = {
  /** The number of the level it follows, in its chapter. */
  after: number;
  /** Gems paid on the first finish. */
  gems: number;
  entry: LessonEntry;
};

/** docs/course/: the three paths, and whether their chapters are written yet. */
export type TradingPath = 'scalping' | 'day-trading' | 'swing-trading';
export const PATHS: { id: TradingPath; name: string; written: boolean }[] = [
  { id: 'scalping', name: 'Scalping', written: true },
  { id: 'day-trading', name: 'Day Trading', written: false },
  { id: 'swing-trading', name: 'Swing Trading', written: false },
];

/** Each chapter's sub-level files, as generated from content/. */
const chapterFiles = CHAPTER_FILES.map((c) => ({
  path: c.path,
  files: c.files.map((file) => file as Level),
  bonus: (c.bonus ?? []).map((file) => file as Level),
}));

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
 * The path choice is a lesson of its own, Level 17-2 (docs/course/): it
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
      subs: [
        { id: PATH_CHOICE_ID, title: 'Choose Your Path', subtitle: 'Your path', level: pathChoice },
      ],
    });
  }
  return {
    number: files[0].chapter,
    title: files[0].chapter_title,
    path: files[0].path,
    levels,
    planned,
    bonus: [],
  };
}

/** A chapter's bonus files as side stops: each after a level the chapter has. */
function bonusFrom(files: Level[], levels: PathLevel[]): BonusLesson[] {
  return files
    .filter((f) => f.category === 'bonus' && levels.some((l) => l.number === f.after))
    .map((f) => ({
      after: f.after as number,
      gems: f.gems ?? 0,
      entry: { id: entryId(f), title: f.title, subtitle: f.subtitle ?? 'Spot it', level: f },
    }))
    .sort((a, b) => a.after - b.after);
}

/** Saved as done once a path is chosen; the choice itself is `progress.path`. */
export const PATH_CHOICE_ID = 'path-choice';

/**
 * A chapter as its files make it. Every written chapter is complete, so what
 * docs/course/ plans is what is written, with one exception: Scalping
 * Chapter 8's new Level 15 comes in stage OFFER, which renumbers the levels
 * after it. Until then that chapter is its 17 written levels.
 */
function chapterOf(c: { path: string; files: Level[]; bonus?: Level[] }): Chapter {
  const written = new Set(c.files.filter((f) => !isPathLesson(f)).map((f) => f.id.split('-')[0]));
  const chapter = chapterFrom(c.files, written.size);
  return { ...chapter, bonus: bonusFrom(c.bonus ?? [], chapter.levels) };
}

const shared = chapterFiles.filter((c) => c.path === 'all').map(chapterOf);

/** docs/course/: Chapter 1, the one every learner plays. */
export const CHAPTER_ONE: Chapter = shared[0];

/**
 * Each path's chapters after the first, from content/paths/<path>/. Scalping's
 * Chapters 2–8 are written; Day Trading and Swing Trading are outlined in
 * docs/course/ and not written yet, so they have none.
 */
export const PATH_CHAPTERS: Record<TradingPath, Chapter[]> = {
  scalping: [],
  'day-trading': [],
  'swing-trading': [],
};
for (const c of chapterFiles) {
  if (c.path in PATH_CHAPTERS) PATH_CHAPTERS[c.path as TradingPath].push(chapterOf(c));
}

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
  subtitle: `Test bench: all ${(demoLevel as unknown as Level).screens.length} screens back to back`,
  level: demoLevel as unknown as Level,
  testBench: true,
};

/** Every bonus side lesson of every wired chapter. */
export const BONUS_LESSONS: LessonEntry[] = [CHAPTER_ONE, ...Object.values(PATH_CHAPTERS).flat()]
  .flatMap((c) => c.bonus)
  .map((b) => b.entry);

/** Everything a deep link can open: every sub-level of every wired path, the bonus lessons, and the bench. */
export const LESSONS: LessonEntry[] = [
  ...levelsOf([CHAPTER_ONE, ...Object.values(PATH_CHAPTERS).flat()]).flatMap((level) => level.subs),
  ...BONUS_LESSONS,
  TEST_BENCH,
];

/** A bonus side lesson, by its lesson id. */
export function isBonus(entry: LessonEntry): boolean {
  return entry.level.category === 'bonus';
}

/** The node a lesson belongs to. */
export function nodeOf(entryIdToFind: string): PathLevel | undefined {
  return levelsOf([CHAPTER_ONE, ...Object.values(PATH_CHAPTERS).flat()]).find((l) =>
    l.subs.some((s) => s.id === entryIdToFind),
  );
}

/** A recap takeaway, as the level file writes it (docs/level-files/ `recap`). */
export type RecapPoint = { text: string; level?: string; card?: number };

/** A card a recap can open: a theory card, or an example (which has no title). */
export type SourceCard = { title?: string; body: string };

const STOP = new Set(
  "the and you your are was were for that this with has have had not but its it's from into than then them they what when where which who will would can one only just more most less".split(
    ' ',
  ),
);

/** The words that carry a sentence's meaning, folded so "selling" meets "sell". */
function meaningWords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => w.replace(/(ing|ed|es|s|e)$/, ''))
    .filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Which of a lesson's cards a takeaway came from (review M4). The point's own
 * `card:` -- a 1-based screen index -- wins when it names a card. Without it,
 * the card sharing the most words with the takeaway; a tie goes to the earlier
 * card. Before this it was always the first card, whatever the takeaway said.
 */
export function matchCard(screens: Screen[], point: RecapPoint): SourceCard | null {
  const isCard = (s: Screen | undefined): s is Screen & SourceCard =>
    !!s && (s.type === 'theory' || s.type === 'example');
  if (point.card !== undefined) {
    const named = screens[point.card - 1];
    if (isCard(named)) return { title: named.title, body: named.body };
  }
  const want = meaningWords(point.text);
  let best: SourceCard | null = null;
  let bestScore = -1;
  for (const s of screens) {
    if (!isCard(s)) continue;
    const have = meaningWords(`${s.title ?? ''} ${s.body}`);
    let score = 0;
    for (const w of want) if (have.has(w)) score += 1;
    if (score > bestScore) {
      best = { title: s.title, body: s.body };
      bestScore = score;
    }
  }
  return best;
}

/**
 * docs/ui/03-screen-types.md §3 `recap`: a takeaway re-opens the card it came from, in the
 * sub-level it names, found in the same chapter and path as the recap (a
 * recap names its sources by id, `3-1`).
 */
export function sourceCardOf(
  from: Level,
  point: RecapPoint,
): (SourceCard & { lesson: string }) | null {
  if (!point.level) return null;
  const entry = LESSONS.find(
    (e) =>
      !e.testBench &&
      e.level.id === point.level &&
      e.level.chapter === from.chapter &&
      e.level.path === from.path,
  );
  const card = entry ? matchCard(entry.level.screens, point) : null;
  return entry && card ? { ...card, lesson: entry.subtitle } : null;
}

/** Kept for anything that just wants the first lesson. */
export const level = LESSONS[0].level;

const profiles = profilesYaml as unknown as Record<string, MarketProfile>;

/** docs/ui/16-navigation.md §11.5 makes this a Settings choice; this player has no settings, so US. */
export const ACTIVE_PROFILE = 'US';
export const market: MarketProfile = profiles[ACTIVE_PROFILE];
