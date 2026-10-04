import { CHAPTER_ONE } from '../content';
import { chapterScores, chapterViews } from '../home/pathState';
import { flameTier } from '../home/scenes';
import { pickWin, refOf, rowsOf, SAMPLE_WIN, WIN_DESIGNS } from '../lesson/wins/data';
import {
  completeLesson,
  dayOf,
  getProgress,
  questionKey,
  recordAnswer,
  resetProgress,
} from '../progress';

/**
 * David's design picks of 2026-10-04 (docs/ui/, [DESIGN-REVIEW]): the parts
 * of them that are plain logic.
 */
beforeEach(() => {
  resetProgress();
});

describe('win screens (docs/ui/07-lesson-chapter-and-tier-complete.md §5.3)', () => {
  it('has five or more designs, taking turns so two lessons in a row differ', () => {
    expect(WIN_DESIGNS.length).toBeGreaterThanOrEqual(5);
    for (let n = 0; n < 20; n++) expect(pickWin(n)).not.toBe(pickWin(n + 1));
    // Every design comes round.
    const seen = new Set(Array.from({ length: WIN_DESIGNS.length }, (_, n) => pickWin(n)));
    expect(seen.size).toBe(WIN_DESIGNS.length);
  });

  it('gives every design the same rows', () => {
    expect(rowsOf(SAMPLE_WIN).map((r) => r.label)).toEqual(['Lesson', 'Answers', 'Streak']);
    expect(
      rowsOf({ ...SAMPLE_WIN, practice: true, hearts: 4, streak: null }).map((r) => r.label),
    ).toEqual(['Answers', 'Hearts']);
  });

  it('reads a lesson id as its short reference', () => {
    expect(refOf('level-06-2')).toBe('6-2');
    expect(refOf(null)).toBeNull();
  });
});

describe('the flame grows with the streak (docs/ui/11-top-bar.md §7.2)', () => {
  it('burns as a spark, a flame, a blaze and a blue flame', () => {
    expect(flameTier(1).name).toBe('Spark');
    expect(flameTier(2).name).toBe('Spark');
    expect(flameTier(3).name).toBe('Flame');
    expect(flameTier(7).name).toBe('Blaze');
    expect(flameTier(29).name).toBe('Blaze');
    expect(flameTier(30).name).toBe('Blue flame');
  });
});

describe('chapter sparklines (docs/ui/10-path-map.md §7.1)', () => {
  it('scores each level played by its right answers, in order', () => {
    const [l1, l2] = CHAPTER_ONE.levels;
    const a = l1.subs[0].id;
    recordAnswer(questionKey(a, 1), 'correct', 'x');
    recordAnswer(questionKey(a, 2), 'correct', 'x');
    recordAnswer(questionKey(a, 3), 'wrong', 'x');
    recordAnswer(questionKey(a, 4), 'correct', 'x');
    const view = chapterViews(getProgress())[0];
    expect(chapterScores(getProgress(), view)).toEqual([75]);
    // A level with nothing in the record ends the line.
    expect(l2.subs.length).toBeGreaterThan(0);
  });
});

describe('the days on Account (docs/ui/12-practice-and-stats.md §7.4)', () => {
  it('counts the lessons finished on each day', () => {
    completeLesson(CHAPTER_ONE.levels[0].subs[0].id, { perfect: true, xp: 10 });
    completeLesson(CHAPTER_ONE.levels[0].subs[1].id, { perfect: false, xp: 10 });
    expect(getProgress().days[dayOf(new Date())]).toBe(2);
  });
});
