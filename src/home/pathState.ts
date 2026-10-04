import { Chapter, chaptersFor, LessonEntry, PathLevel } from '../content';
import type { Progress } from '../progress';

/**
 * The path map's nodes as the learner's progress leaves them (docs/UI.md §7.1).
 *
 * A level opens once every level before it is finished -- the files chain each
 * sub-level to the one before through `prerequisite`, so this is the same
 * order, read a level at a time, across chapters: Chapter 1, the path choice
 * that closes it, then the chosen path's chapters. Within a level, Start opens
 * the first lesson not yet done; a finished level offers its first lesson
 * again for review.
 */
export type LevelStatus = 'locked' | 'current' | 'complete';

export type LevelView = {
  level: PathLevel;
  status: LevelStatus;
  /** Lessons done, of `total`, and which. */
  done: number;
  doneFlags: boolean[];
  total: number;
  /** Finished, and every lesson in it answered without a miss: the gold ring. */
  perfect: boolean;
  /** What Start opens. */
  next: LessonEntry;
  /** Its index in `next`'s level, for "Lesson 2 of 4". */
  nextIndex: number;
};

export type ChapterView = {
  chapter: Chapter;
  levels: LevelView[];
  /** Levels finished, of all of them: the header's "7/17". */
  done: number;
  total: number;
  status: LevelStatus;
};

/** The map for this learner: Chapter 1, and their path's chapters once one is chosen. */
export function chapterViews(progress: Progress): ChapterView[] {
  let open = true;
  return chaptersFor(progress.path).map((chapter) => {
    const levels = chapter.levels.map((level) => {
      const view = levelView(progress, level, open);
      if (view.status !== 'complete') open = false;
      return view;
    });
    // Counted in levels as docs/curriculum.md numbers them: the path choice is
    // a step of its own, not one of Chapter 1's 17.
    const counted = levels.filter((v) => v.level.kind !== 'path');
    const done = counted.filter((v) => v.status === 'complete').length;
    return {
      chapter,
      levels,
      done,
      total: Math.max(chapter.planned, counted.length),
      status: levels.every((v) => v.status === 'complete')
        ? 'complete'
        : levels.some((v) => v.status !== 'locked')
          ? 'current'
          : 'locked',
    };
  });
}

/** Every node of the map, in order. */
export function pathView(progress: Progress): LevelView[] {
  return chapterViews(progress).flatMap((c) => c.levels);
}

function levelView(progress: Progress, level: PathLevel, open: boolean): LevelView {
  const doneFlags = level.subs.map((entry) => !!progress.done[entry.id]);
  const done = doneFlags.filter(Boolean).length;
  const total = level.subs.length;
  const complete = done === total;
  const status: LevelStatus = complete ? 'complete' : open ? 'current' : 'locked';
  const firstOpen = doneFlags.indexOf(false);
  const nextIndex = firstOpen === -1 ? 0 : firstOpen;
  return {
    level,
    status,
    done,
    doneFlags,
    total,
    perfect:
      complete &&
      level.kind !== 'path' &&
      level.subs.every((entry) => progress.done[entry.id]?.perfect),
    next: level.subs[nextIndex],
    nextIndex,
  };
}

/** The level the learner is on: the first not finished, or the last when all are. */
export function currentLevel(views: LevelView[]): LevelView {
  return views.find((v) => v.status === 'current') ?? views[views.length - 1];
}

/** XP earned on the path: each finished lesson's `xp`. */
/** The XP total: what the summaries handed out (progress.ts, completeLesson). */
export function totalXp(progress: Progress): number {
  return progress.xp;
}

/**
 * docs/UI.md §7.1 [DESIGN-REVIEW] "Chapter cards with a sparkline" (David's
 * pick of 2026-10-04): how each level of a chapter went, as the share of its
 * questions answered right (the record, docs/UI.md §7.3), in per cent, for
 * the levels played so far, in order. A level with nothing in the record yet
 * ends the line: the chapter is played in order.
 */
export function chapterScores(progress: Progress, view: ChapterView): number[] {
  const tally = new Map<string, { right: number; wrong: number }>();
  for (const [key, rec] of Object.entries(progress.questions)) {
    const lesson = key.slice(0, key.indexOf('#'));
    const t = tally.get(lesson) ?? { right: 0, wrong: 0 };
    t.right += rec.right;
    t.wrong += rec.wrong;
    tally.set(lesson, t);
  }
  const scores: number[] = [];
  for (const lv of view.levels) {
    if (lv.level.kind === 'path') continue;
    let right = 0;
    let wrong = 0;
    for (const entry of lv.level.subs) {
      const t = tally.get(entry.id);
      if (t) {
        right += t.right;
        wrong += t.wrong;
      }
    }
    if (right + wrong === 0) break;
    scores.push(Math.round((100 * right) / (right + wrong)));
  }
  return scores;
}
