import { readdirSync } from 'fs';
import { join } from 'path';

import { CHAPTER_ONE, chaptersFor, LESSONS, PATH_CHAPTERS, TEST_BENCH } from '../content';

/**
 * Every lesson id the app shipped before stage WIRE. Progress is saved under
 * these ids, so a player who finished them must still find them finished.
 */
const SHIPPED_IDS = [
  'level-01-1',
  'level-01-2',
  'level-01-3',
  'level-01-4',
  'level-02-1',
  'level-02-2',
  'level-02-3',
  'level-03-1',
  'level-03-2',
  'level-03-3',
  'level-04-1',
  'level-04-2',
  'level-04-3',
  'level-04-4',
  'level-05-1',
  'level-06-1',
  'level-06-2',
  'level-06-3',
  'level-07-1',
  'level-07-2',
  'level-07-3',
  'level-07-4',
  'level-08-1',
  'level-08-2',
  'level-08-3',
  'level-09-1',
  'level-09-2',
  'level-10-1',
  'level-10-2',
  'level-10-3',
  'level-11-1',
  'level-12-1',
  'level-12-2',
  'level-12-3',
  'level-13-1',
  'level-13-2',
  'level-13-3',
  'level-13-4',
  'level-14-1',
  'level-14-2',
  'level-14-3',
  'level-15-1',
  'level-15-2',
  'level-15-3',
  'level-16-1',
  'level-16-2',
  'level-17-1',
  'path-choice',
  'scalping-ch2-level-01-1',
  'scalping-ch2-level-01-2',
  'scalping-ch2-level-01-3',
  'scalping-ch2-level-01-4',
  'scalping-ch2-level-02-1',
  'scalping-ch2-level-02-2',
  'scalping-ch2-level-02-3',
  'scalping-ch2-level-03-1',
  'scalping-ch2-level-03-2',
  'scalping-ch2-level-03-3',
  'all-screens',
];

/** The sub-level files under content/, counted straight from the folders. */
function filesOnDisk(): number {
  const root = join(__dirname, '..', '..', 'content');
  const count = (dir: string) =>
    readdirSync(dir).filter((f) => /^level-\d+-\d+\.yaml$/.test(f)).length;
  const shared = readdirSync(join(root, 'shared')).map((c) => join(root, 'shared', c));
  const paths = readdirSync(join(root, 'paths')).flatMap((p) =>
    readdirSync(join(root, 'paths', p)).map((c) => join(root, 'paths', p, c)),
  );
  return [...shared, ...paths]
    .filter((d) => d.split(/[\\/]/).pop()!.startsWith('chapter-'))
    .reduce((n, d) => n + count(d), 0);
}

describe('content index', () => {
  it('wires in every sub-level file under content/', () => {
    const lessons = LESSONS.filter((l) => !l.testBench);
    expect(lessons).toHaveLength(filesOnDisk());
  });

  it('keeps every lesson id that shipped before, so saved progress survives', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    expect(SHIPPED_IDS.filter((id) => !ids.has(id))).toEqual([]);
  });

  it('gives every lesson its own id', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('puts Scalping Chapters 2 to 8 on the map, in order', () => {
    expect(PATH_CHAPTERS.scalping.map((c) => c.number)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(chaptersFor('scalping').map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('orders the levels of a chapter by number and ends each on its Final Exam', () => {
    for (const chapter of PATH_CHAPTERS.scalping) {
      expect(chapter.levels.map((l) => l.number)).toEqual(chapter.levels.map((_, i) => i + 1));
      expect(chapter.levels[chapter.levels.length - 1].kind).toBe('final');
    }
  });

  it('closes Chapter 1 with the path choice', () => {
    expect(CHAPTER_ONE.levels[CHAPTER_ONE.levels.length - 1].kind).toBe('path');
  });

  it('names the real screen count on the test bench', () => {
    expect(TEST_BENCH.subtitle).toContain(`${TEST_BENCH.level.screens.length} screens`);
  });
});
