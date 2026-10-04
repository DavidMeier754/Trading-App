import { CHAPTER_ONE, levelsOf } from '../content';
import {
  addGems,
  clearNewSkills,
  collectSkills,
  completeLesson,
  dayOf,
  DECISION_LOG_MAX,
  doneToday,
  earnedXp,
  finishFirstTrade,
  getProgress,
  giveHeart,
  HEART_REFILL_MS,
  heartsNow,
  loseHeart,
  markSkillsSeen,
  MAX_HEARTS,
  nextRecord,
  parseQuestionKey,
  Progress,
  questionKey,
  recordAnswer,
  recordDecision,
  refillHearts,
  refillShare,
  replayFirstTrade,
  resetProgress,
  savePlan,
  skipTo,
  streakDays,
  toggleWanted,
  waitText,
} from '../progress';

const HOUR = 60 * 60 * 1000;

beforeEach(() => {
  jest.useFakeTimers();
  resetProgress();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('hearts (docs/ui/06-reveal-and-hearts.md §5.2: all back five hours after the first is lost)', () => {
  const lost = (hearts: number, at: number): Progress => ({
    ...getProgress(),
    hearts,
    heartsAt: at,
  });

  it('every heart comes back at once, exactly five hours after the first was lost', () => {
    expect(HEART_REFILL_MS).toBe(5 * HOUR);
    const p = lost(1, 0);
    expect(heartsNow(p, 5 * HOUR - 1)).toEqual({ hearts: 1, fullAt: 5 * HOUR, clock: 0 });
    expect(heartsNow(p, 5 * HOUR)).toEqual({ hearts: MAX_HEARTS, fullAt: null, clock: null });
  });

  it('nothing comes back early: four hours in, the count is unchanged', () => {
    expect(heartsNow(lost(2, 0), 4 * HOUR).hearts).toBe(2);
    expect(heartsNow(lost(2, 0), 100 * HOUR).hearts).toBe(MAX_HEARTS);
  });

  it('full hearts have no clock', () => {
    expect(heartsNow(getProgress(), 0)).toEqual({ hearts: 5, fullAt: null, clock: null });
  });

  it('the first lost heart starts the clock; later ones do not restart it', () => {
    jest.setSystemTime(1_000_000);
    loseHeart();
    expect(getProgress()).toMatchObject({ hearts: 4, heartsAt: 1_000_000 });
    jest.setSystemTime(1_000_000 + 3 * HOUR);
    loseHeart();
    expect(getProgress()).toMatchObject({ hearts: 3, heartsAt: 1_000_000 });
    expect(heartsNow(getProgress(), 1_000_000 + 5 * HOUR).hearts).toBe(MAX_HEARTS);
  });

  it('a heart lost after a full refill starts a new clock', () => {
    jest.setSystemTime(0);
    loseHeart();
    jest.setSystemTime(6 * HOUR);
    loseHeart();
    expect(getProgress()).toMatchObject({ hearts: 4, heartsAt: 6 * HOUR });
  });

  it('the ring fills with the clock', () => {
    const h = heartsNow(lost(3, 0), 2.5 * HOUR);
    expect(refillShare(h, 2.5 * HOUR)).toBeCloseTo(0.5);
    expect(refillShare(heartsNow(getProgress(), 0), 0)).toBe(0);
  });

  it('with no hearts left, losing one more does nothing', () => {
    jest.setSystemTime(0);
    for (let i = 0; i < 7; i += 1) loseHeart();
    expect(getProgress().hearts).toBe(0);
  });

  it('a practice round gives one back and keeps the clock; the last one stops it', () => {
    jest.setSystemTime(0);
    loseHeart();
    loseHeart();
    expect(giveHeart()).toBe(true);
    expect(getProgress()).toMatchObject({ hearts: 4, heartsAt: 0 });
    expect(giveHeart()).toBe(true);
    expect(getProgress()).toMatchObject({ hearts: 5, heartsAt: null });
    expect(giveHeart()).toBe(false);
  });

  it('refill brings every heart back and stops the clock', () => {
    loseHeart();
    loseHeart();
    refillHearts();
    expect(getProgress()).toMatchObject({ hearts: MAX_HEARTS, heartsAt: null });
  });

  it('says how long the wait is', () => {
    expect(waitText(4 * HOUR, 0)).toBe('4h 00m');
    expect(waitText(4 * HOUR - 60_000, 0)).toBe('3h 59m');
    expect(waitText(12 * 60_000, 0)).toBe('12m');
    expect(waitText(30_000, 0)).toBe('under a minute');
  });
});

describe('the record (docs/ui/12-practice-and-stats.md §7.3)', () => {
  it('keys a question by its lesson and screen, and reads the key back', () => {
    expect(questionKey('level-01-1', 5)).toBe('level-01-1#5');
    expect(parseQuestionKey('scalping-ch2-level-04-1#12')).toEqual({
      lesson: 'scalping-ch2-level-04-1',
      screen: 12,
    });
    expect(parseQuestionKey('nonsense')).toBeNull();
  });

  it('a right answer moves a question up a box, 1 → 3 → 7 → 16 → 35 days, and stops there', () => {
    const now = new Date(2026, 9, 3, 12).getTime();
    let r = nextRecord(undefined, true, now);
    expect(r).toMatchObject({ box: 1, due: '2026-10-04', right: 1, wrong: 0, last: 'right' });
    r = nextRecord(r, true, now);
    expect(r).toMatchObject({ box: 2, due: '2026-10-06' });
    r = nextRecord(r, true, now);
    expect(r.due).toBe('2026-10-10');
    r = nextRecord(r, true, now);
    expect(r.due).toBe('2026-10-19');
    r = nextRecord(r, true, now);
    expect(r).toMatchObject({ box: 5, due: '2026-11-07' });
    r = nextRecord(r, true, now);
    expect(r.box).toBe(5);
  });

  it('a wrong answer sends it back to the first box, due tomorrow', () => {
    const now = new Date(2026, 9, 3, 12).getTime();
    const r = nextRecord({ ...nextRecord(undefined, true, now), box: 4 }, false, now);
    expect(r).toMatchObject({ box: 1, due: '2026-10-04', wrong: 1, last: 'wrong' });
  });

  it('a wrong answer opens a mistake; a right one later closes it', () => {
    recordAnswer('a#3', 'wrong', 'Short');
    expect(getProgress().mistakes['a#3']).toMatchObject({ answer: 'Short' });
    recordAnswer('a#3', 'correct', 'Long');
    expect(getProgress().mistakes['a#3']).toBeUndefined();
    expect(getProgress().questions['a#3']).toMatchObject({ right: 1, wrong: 1 });
  });

  it("the lesson's own mistakes round does not close a mistake", () => {
    recordAnswer('a#3', 'wrong', 'Short');
    recordAnswer('a#3', 'correct', 'Long', { keepMistake: true });
    expect(getProgress().mistakes['a#3']).toBeDefined();
  });

  it('amber counts as right', () => {
    recordAnswer('a#4', 'wrong', 'x');
    recordAnswer('a#4', 'amber', 'No trade');
    expect(getProgress().mistakes['a#4']).toBeUndefined();
  });

  it('logs chart decisions, keeping the newest when it is full', () => {
    for (let i = 0; i < DECISION_LOG_MAX + 3; i += 1) {
      recordDecision({
        q: `q#${i}`,
        choice: 'long',
        grade: 'correct',
        result: 'lost',
        aside: false,
      });
    }
    const log = getProgress().decisions;
    expect(log).toHaveLength(DECISION_LOG_MAX);
    expect(log[log.length - 1].q).toBe(`q#${DECISION_LOG_MAX + 2}`);
  });

  it('collects a skill once, counts the new ones for Practice, and clears the count', () => {
    expect(collectSkills(['term:spread', 'term:bid'])).toEqual(['term:spread', 'term:bid']);
    expect(collectSkills(['term:spread', 'term:ask'])).toEqual(['term:ask']);
    expect(getProgress().newSkills).toBe(3);
    clearNewSkills();
    expect(getProgress().newSkills).toBe(0);
    markSkillsSeen(['term:spread']);
    expect(getProgress().skills['term:spread'].seen).toBe(true);
    expect(getProgress().skills['term:bid'].seen).toBe(false);
  });

  it('dates every plan key it saves', () => {
    jest.setSystemTime(12345);
    savePlan({ session_trade_cap: '6' });
    expect(getProgress().planAt.session_trade_cap).toBe(12345);
  });

  it('keeps the longest streak and counts plays', () => {
    jest.setSystemTime(new Date(2026, 8, 24, 12));
    completeLesson('x', { perfect: false, xp: 1 });
    jest.setSystemTime(new Date(2026, 8, 25, 12));
    completeLesson('x', { perfect: false, xp: 1 });
    jest.setSystemTime(new Date(2026, 8, 28, 12));
    completeLesson('y', { perfect: false, xp: 1 });
    expect(getProgress()).toMatchObject({ bestStreak: 2, plays: { x: 2, y: 1 } });
  });

  it('the first trade is played once, and the testing tool brings it back', () => {
    expect(getProgress().firstTrade).toBe(false);
    finishFirstTrade();
    expect(getProgress().firstTrade).toBe(true);
    replayFirstTrade();
    expect(getProgress().firstTrade).toBe(false);
  });
});

describe('XP', () => {
  it('a perfect run earns half again, rounded', () => {
    expect(earnedXp(10, false)).toBe(10);
    expect(earnedXp(10, true)).toBe(15);
    expect(earnedXp(15, true)).toBe(23);
    expect(earnedXp(0, true)).toBe(0);
  });

  it('adds up every summary, replays included, and keeps a perfect run', () => {
    jest.setSystemTime(new Date(2026, 8, 24, 12));
    completeLesson('level-01-1', { perfect: true, xp: 10 });
    completeLesson('level-01-1', { perfect: false, xp: 10 });
    expect(getProgress().xp).toBe(25);
    expect(getProgress().done['level-01-1']).toEqual({ perfect: true });
  });

  it('Skip ahead marks earlier lessons done but earns no XP', () => {
    const levels = levelsOf([CHAPTER_ONE]);
    const target = levels[3];
    skipTo(target.key);
    const p = getProgress();
    expect(p.xp).toBe(0);
    for (const level of levels.slice(0, 3)) {
      for (const entry of level.subs) expect(p.done[entry.id]).toEqual({ perfect: false });
    }
    for (const entry of target.subs) expect(p.done[entry.id]).toBeUndefined();
  });

  it('Skip ahead keeps what was already played', () => {
    const levels = levelsOf([CHAPTER_ONE]);
    const first = levels[0].subs[0].id;
    jest.setSystemTime(new Date(2026, 8, 24, 12));
    completeLesson(first, { perfect: true, xp: 10 });
    skipTo(levels[3].key);
    expect(getProgress().done[first]).toEqual({ perfect: true });
    expect(getProgress().xp).toBe(15);
  });
});

// The streak counts the learner's calendar days. Jest cannot change the time
// zone from inside a test, so `npm test` runs this file again in zones either
// side of UTC, and in ones whose clocks change in March (jest/zones.js).
const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

describe(`streak in ${zone}`, () => {
  const at = (d: number, h: number, m = 0) => new Date(2026, 2, d, h, m);
  const play = (when: Date) => {
    jest.setSystemTime(when);
    completeLesson(`lesson-${when.getTime()}`, { perfect: false, xp: 1 });
  };

  it('uses the local day', () => {
    expect(dayOf(at(24, 23, 59))).toBe('2026-03-24');
    expect(dayOf(at(25, 0, 0))).toBe('2026-03-25');
  });

  it('grows across midnight, one minute apart', () => {
    play(at(24, 23, 59));
    play(at(25, 0, 0));
    expect(getProgress().streak).toEqual({ days: 2, last: '2026-03-25' });
  });

  it('two lessons on one day count once', () => {
    play(at(24, 8));
    play(at(24, 20));
    expect(getProgress().streak.days).toBe(1);
    expect(doneToday(getProgress(), at(24, 21))).toBe(2);
    expect(doneToday(getProgress(), at(25, 0, 1))).toBe(0);
  });

  it('survives the nights the clocks change', () => {
    // The US goes to summer time on 8 March 2026, Europe on 29 March.
    play(at(7, 22));
    play(at(8, 22));
    expect(getProgress().streak.days).toBe(2);
    resetProgress();
    play(at(28, 22));
    play(at(29, 22));
    play(at(30, 7));
    expect(getProgress().streak.days).toBe(3);
  });

  it('holds through yesterday, and is over after a missed day', () => {
    play(at(10, 12));
    expect(streakDays(getProgress(), at(11, 23, 59))).toBe(1);
    expect(streakDays(getProgress(), at(12, 0, 0))).toBe(0);
    play(at(12, 9));
    expect(getProgress().streak).toEqual({ days: 1, last: '2026-03-12' });
  });

  it('crosses a month end', () => {
    jest.setSystemTime(new Date(2026, 1, 28, 20));
    completeLesson('a', { perfect: false, xp: 1 });
    jest.setSystemTime(new Date(2026, 2, 1, 8));
    completeLesson('b', { perfect: false, xp: 1 });
    expect(getProgress().streak.days).toBe(2);
  });
});

describe('wanting a path that is not written yet', () => {
  it('flags Swing Trading and takes the flag back', () => {
    expect(getProgress().wanted).toEqual([]);
    toggleWanted('swing-trading');
    expect(getProgress().wanted).toEqual(['swing-trading']);
    toggleWanted('swing-trading');
    expect(getProgress().wanted).toEqual([]);
  });
});

describe('gems (docs/ui/11-top-bar.md §7.2, David 2026-09-30)', () => {
  it('start at none, and only the testing tools hand them out for now', () => {
    expect(getProgress().gems).toBe(0);
    completeLesson(levelsOf([CHAPTER_ONE])[0].subs[0].id, { perfect: true, xp: 10 });
    expect(getProgress().gems).toBe(0);
    addGems(50);
    addGems(50);
    expect(getProgress().gems).toBe(100);
    addGems(-500);
    expect(getProgress().gems).toBe(0);
  });
});
