import { CHAPTER_ONE, LESSONS, PATH_CHAPTERS } from '../content';
import {
  dailyMix,
  openMistakes,
  playedQuestions,
  reviewStops,
  ROUND_SIZE,
  roundLevel,
  stopMistakes,
  weakSpots,
} from '../practice';
import { getProgress, Progress, questionKey, resetProgress } from '../progress';
import { isQuestion } from '../types';

const NOW = new Date(2026, 9, 3, 12).getTime();

const lesson = (id: string) => LESSONS.find((e) => e.id === id)!;

/** A record where the learner has finished `ids`. */
function played(ids: string[], extra: Partial<Progress> = {}): Progress {
  resetProgress();
  const done = Object.fromEntries(ids.map((id) => [id, { perfect: false }]));
  return { ...getProgress(), done, ...extra };
}

const firstQuestion = (id: string) => lesson(id).level.screens.findIndex((s) => isQuestion(s));

describe('the daily mix (docs/ui/12-practice-and-stats.md §7.3)', () => {
  it('draws only from finished lessons, and never the same question twice', () => {
    const p = played(['level-01-1', 'level-01-2']);
    const { picks } = dailyMix(p, NOW);
    expect(picks).toHaveLength(ROUND_SIZE);
    expect(new Set(picks.map((q) => q.key)).size).toBe(picks.length);
    for (const q of picks) expect(['level-01-1', 'level-01-2']).toContain(q.entry.id);
  });

  it('is empty before the first lesson', () => {
    expect(dailyMix(played([]), NOW).picks).toEqual([]);
  });

  it('puts due questions first, then open mistakes, and says why', () => {
    const i = firstQuestion('level-01-2');
    const due = questionKey('level-01-2', i);
    const missed = questionKey('level-01-1', firstQuestion('level-01-1'));
    const p = played(['level-01-1', 'level-01-2'], {
      questions: {
        [due]: { right: 1, wrong: 0, last: 'right', at: 0, box: 1, due: '2026-10-02' },
        [missed]: { right: 0, wrong: 1, last: 'wrong', at: 0, box: 1, due: '2026-10-09' },
      },
      mistakes: { [missed]: { answer: 'Sell', at: 5 } },
    });
    const { picks } = dailyMix(p, NOW);
    const reasons = Object.fromEntries(picks.map((q) => [q.key, q.reason]));
    expect(reasons[due]).toBe('due');
    expect(reasons[missed]).toBe('mistake');
  });

  it('deals the same round all day', () => {
    const p = played(['level-01-1', 'level-01-2', 'level-01-3']);
    expect(dailyMix(p, NOW).picks.map((q) => q.key)).toEqual(
      dailyMix(p, NOW + 60_000).picks.map((q) => q.key),
    );
  });

  it('plays as a lesson: an intro, each question with the scene before it', () => {
    const p = played(['level-01-1']);
    const { level, keys } = roundLevel(dailyMix(p, NOW).picks, { title: 'Daily mix', intro: 'x' });
    expect(level.screens[0].type).toBe('intro');
    expect(keys).toHaveLength(level.screens.length);
    level.screens.forEach((s, k) => {
      if (isQuestion(s)) expect(keys[k]).not.toBeNull();
      else expect(keys[k]).toBeNull();
    });
  });

  it('counts every question of a finished lesson', () => {
    const p = played(['level-01-1']);
    const n = lesson('level-01-1').level.screens.filter((s) => isQuestion(s)).length;
    expect(playedQuestions(p)).toHaveLength(n);
  });
});

describe('mistakes (docs/ui/12-practice-and-stats.md §7.3)', () => {
  it('lists the open ones that still point at a question, oldest first', () => {
    const a = questionKey('level-01-1', firstQuestion('level-01-1'));
    const b = questionKey('level-01-2', firstQuestion('level-01-2'));
    const p = played(['level-01-1', 'level-01-2'], {
      mistakes: {
        [b]: { answer: 'x', at: 20 },
        [a]: { answer: 'y', at: 10 },
        'gone#999': { answer: 'z', at: 1 },
      },
    });
    expect(openMistakes(p).map((m) => m.key)).toEqual([a, b]);
  });
});

describe('mistakes reviews on the map (docs/ui/10-path-map.md §7.1)', () => {
  it('one before each Checkpoint and the Final Exam, holding the lessons since the last test', () => {
    const stops = reviewStops(CHAPTER_ONE);
    const tests = CHAPTER_ONE.levels.filter((l) => l.kind === 'test' || l.kind === 'final');
    expect(stops).toHaveLength(tests.length);
    const first = stops[0];
    expect(CHAPTER_ONE.levels[first.afterIndex + 1].kind).toBe('test');
    expect(first.lessonIds.has('level-01-1')).toBe(true);
    expect(stops[1].lessonIds.has('level-01-1')).toBe(false);
  });

  it('every written chapter gets two or three', () => {
    for (const chapter of PATH_CHAPTERS.scalping) {
      const n = reviewStops(chapter).length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  it("holds that section's open mistakes only", () => {
    const stops = reviewStops(CHAPTER_ONE);
    const early = questionKey('level-01-1', firstQuestion('level-01-1'));
    const late = questionKey('level-06-1', firstQuestion('level-06-1'));
    const p = played(['level-01-1', 'level-06-1'], {
      mistakes: { [early]: { answer: '', at: 1 }, [late]: { answer: '', at: 2 } },
    });
    expect(stopMistakes(p, stops[0]).map((m) => m.key)).toEqual([early]);
    expect(stopMistakes(p, stops[1]).map((m) => m.key)).toEqual([late]);
  });
});

describe('weak spots', () => {
  it('the topics missed most, from three answers up', () => {
    const entry = lesson('level-01-1');
    const tag = entry.level.tags[0];
    const qs = entry.level.screens.map((s, i) => (isQuestion(s) ? i : -1)).filter((i) => i >= 0);
    const questions = Object.fromEntries(
      qs
        .slice(0, 2)
        .map((i) => [
          questionKey(entry.id, i),
          { right: 1, wrong: 2, last: 'wrong' as const, at: 0, box: 1, due: '2026-10-04' },
        ]),
    );
    const spots = weakSpots(played([entry.id], { questions }));
    expect(spots[0]).toMatchObject({ tag, answers: 6 });
    expect(spots[0].strength).toBeCloseTo(1 / 3);
  });
});
