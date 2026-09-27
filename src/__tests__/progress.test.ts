import { CHAPTER_ONE, levelsOf } from '../content';
import {
  completeLesson,
  dayOf,
  doneToday,
  earnedXp,
  getProgress,
  HEART_REFILL_MS,
  heartsNow,
  loseHeart,
  MAX_HEARTS,
  Progress,
  refillHearts,
  resetProgress,
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

describe('hearts', () => {
  const lost = (hearts: number, at: number): Progress => ({
    ...getProgress(),
    hearts,
    heartsAt: at,
  });

  it('a heart comes back exactly after four hours, not a millisecond sooner', () => {
    expect(HEART_REFILL_MS).toBe(4 * HOUR);
    const p = lost(4, 0);
    expect(heartsNow(p, 4 * HOUR - 1)).toEqual({ hearts: 4, nextAt: 4 * HOUR, clock: 0 });
    expect(heartsNow(p, 4 * HOUR)).toEqual({ hearts: 5, nextAt: null, clock: null });
  });

  it('several come back one per four hours, and never above the maximum', () => {
    const p = lost(1, 0);
    expect(heartsNow(p, 8 * HOUR).hearts).toBe(3);
    expect(heartsNow(p, 8 * HOUR).nextAt).toBe(12 * HOUR);
    expect(heartsNow(p, 100 * HOUR).hearts).toBe(MAX_HEARTS);
  });

  it('full hearts have no clock', () => {
    expect(heartsNow(getProgress(), 0)).toEqual({ hearts: 5, nextAt: null, clock: null });
  });

  it('a lost heart starts the clock; a second one keeps the first in the queue', () => {
    jest.setSystemTime(1_000_000);
    loseHeart();
    expect(getProgress()).toMatchObject({ hearts: 4, heartsAt: 1_000_000 });
    jest.setSystemTime(1_000_000 + HOUR);
    loseHeart();
    expect(getProgress()).toMatchObject({ hearts: 3, heartsAt: 1_000_000 });
    expect(heartsNow(getProgress(), 1_000_000 + 4 * HOUR).hearts).toBe(4);
  });

  it('with no hearts left, losing one more does nothing', () => {
    jest.setSystemTime(0);
    for (let i = 0; i < 7; i += 1) loseHeart();
    expect(getProgress().hearts).toBe(0);
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
