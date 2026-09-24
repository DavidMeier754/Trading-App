import { LessonEntry, PATH, PathLevel } from '../content';
import type { Progress } from '../progress';

/**
 * The path map's nodes as the learner's progress leaves them (docs/UI.md §7.1).
 *
 * A level opens once every level before it is finished -- the files chain each
 * sub-level to the one before through `prerequisite`, so this is the same
 * order, read a level at a time. Within a level, Start opens the first lesson
 * not yet done; a finished level offers its first lesson again for review.
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

export function pathView(progress: Progress, path: PathLevel[] = PATH): LevelView[] {
  let open = true;
  return path.map((level) => {
    const doneFlags = level.subs.map((entry) => !!progress.done[entry.id]);
    const done = doneFlags.filter(Boolean).length;
    const total = level.subs.length;
    const complete = done === total;
    const status: LevelStatus = complete ? 'complete' : open ? 'current' : 'locked';
    if (!complete) open = false;
    const firstOpen = doneFlags.indexOf(false);
    const nextIndex = firstOpen === -1 ? 0 : firstOpen;
    return {
      level,
      status,
      done,
      doneFlags,
      total,
      perfect: complete && level.subs.every((entry) => progress.done[entry.id]?.perfect),
      next: level.subs[nextIndex],
      nextIndex,
    };
  });
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
