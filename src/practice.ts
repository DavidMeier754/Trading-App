import { Chapter, LESSONS, LessonEntry } from './content';
import { dayOf, parseQuestionKey, Progress, questionKey } from './progress';
import { isQuestion, Level, Screen } from './types';

/**
 * Practice (docs/ui/12-practice-and-stats.md §7.3, built in DESIGN-REVIEW): what a round holds and
 * why. Everything is chosen from the learner's own record (progress.ts) and
 * the lessons they have finished -- a question from a lesson not yet played is
 * never drawn, and no question comes twice in one round. Pure, so the choice
 * can be tested and explained (src/__tests__/practice.test.ts).
 */

/** A round's length: about three minutes. */
export const ROUND_SIZE = 8;

/** Why a question is in a round, in the order they are filled. */
export type PickReason = 'due' | 'mistake' | 'new' | 'oldest';

export type PlayedQuestion = { key: string; entry: LessonEntry; screen: number };

/** The lessons practice draws from: every lesson on a path, finished. */
const PRACTICE_LESSONS = LESSONS.filter((e) => !e.testBench && e.level.category !== 'bonus');
const BY_ID = new Map(PRACTICE_LESSONS.map((e) => [e.id, e]));

/** Every question of every finished lesson. */
export function playedQuestions(p: Progress): PlayedQuestion[] {
  const out: PlayedQuestion[] = [];
  for (const entry of PRACTICE_LESSONS) {
    if (!p.done[entry.id]) continue;
    entry.level.screens.forEach((s, i) => {
      if (isQuestion(s)) out.push({ key: questionKey(entry.id, i), entry, screen: i });
    });
  }
  return out;
}

/** A question in the record, back to its lesson and screen; null if the content moved on. */
export function resolveKey(key: string): PlayedQuestion | null {
  const at = parseQuestionKey(key);
  if (!at) return null;
  const entry = BY_ID.get(at.lesson);
  const screen = entry?.level.screens[at.screen];
  if (!entry || !screen || !isQuestion(screen)) return null;
  return { key, entry, screen: at.screen };
}

/** A small, steady shuffle: the same day deals the same round. */
function seeded<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let x = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const j = x % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function daySeed(day: string): number {
  return day.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 99991, 7);
}

/**
 * The daily mix: due questions first (the oldest due date first), then open
 * mistakes, then questions never answered, then the ones answered longest
 * ago. Each pick says why it was picked.
 */
export function dailyMix(
  p: Progress,
  now = Date.now(),
  size = ROUND_SIZE,
): { picks: (PlayedQuestion & { reason: PickReason })[] } {
  const today = dayOf(new Date(now));
  const played = playedQuestions(p);
  const ranked = played.map((q) => {
    const rec = p.questions[q.key];
    if (rec && rec.due <= today) return { q, reason: 'due' as const, order: [0, rec.due, rec.at] };
    if (p.mistakes[q.key])
      return { q, reason: 'mistake' as const, order: [1, '', p.mistakes[q.key].at] };
    if (!rec) return { q, reason: 'new' as const, order: [2, '', 0] };
    return { q, reason: 'oldest' as const, order: [3, '', rec.at] };
  });
  ranked.sort((a, b) => {
    for (let k = 0; k < 3; k++) {
      const x = a.order[k];
      const y = b.order[k];
      if (x < y) return -1;
      if (x > y) return 1;
    }
    return 0;
  });
  // Within one kind the new ones are shuffled by the day, so a learner with a
  // fresh record does not get the first questions of Chapter 1 every time.
  const head = ranked.filter((r) => r.reason !== 'new');
  const fresh = seeded(
    ranked.filter((r) => r.reason === 'new'),
    daySeed(today),
  );
  const picks = [...head, ...fresh].slice(0, size).map((r) => ({ ...r.q, reason: r.reason }));
  return { picks: seeded(picks, daySeed(today) + 1) };
}

/** The open mistakes that still point at a question, oldest first. */
export function openMistakes(p: Progress): (PlayedQuestion & { answer: string; at: number })[] {
  return Object.entries(p.mistakes)
    .map(([key, m]) => {
      const q = resolveKey(key);
      return q ? { ...q, answer: m.answer, at: m.at } : null;
    })
    .filter((q): q is PlayedQuestion & { answer: string; at: number } => q !== null)
    .sort((a, b) => a.at - b.at);
}

/**
 * A round as a lesson the player can play: an intro, then each question,
 * brought along with the scene before it when it follows one (docs/ui/
 * §4.5). `keys` lines up with the screens: the record's key for a question,
 * null for the intro and a scene.
 */
export function roundLevel(
  picks: PlayedQuestion[],
  { title, intro }: { title: string; intro: string },
): { level: Level; keys: (string | null)[] } {
  const screens: Screen[] = [{ type: 'intro', text: intro }];
  const keys: (string | null)[] = [null];
  for (const q of picks) {
    const before = q.entry.level.screens[q.screen - 1];
    if (before?.type === 'story' && (before as { label?: string }).label !== 'takeaway') {
      screens.push(before);
      keys.push(null);
    }
    screens.push(q.entry.level.screens[q.screen]);
    keys.push(q.key);
  }
  const level: Level = {
    id: 'practice',
    title,
    chapter: 0,
    chapter_title: 'Practice',
    path: 'all',
    category: 'repetition',
    tags: [],
    learning_goal: '',
    purpose: '',
    prerequisite: null,
    xp: 0,
    difficulty: 1,
    screens,
  };
  return { level, keys };
}

/**
 * docs/ui/10-path-map.md §7.1 "Side stops": a chapter's mistakes reviews, one before each
 * Checkpoint and one before the Final Exam. Each holds the lessons since the
 * test before it; it sits beside the path after the level before its test.
 */
export type ReviewStop = {
  /** Unique on the map: `2-review-6` sits before Level 6. */
  key: string;
  /** The level it sits after, by its index in the chapter. */
  afterIndex: number;
  /** The test it comes before. */
  testNumber: number | null;
  lessonIds: Set<string>;
};

export function reviewStops(chapter: Chapter): ReviewStop[] {
  const stops: ReviewStop[] = [];
  let since = 0;
  chapter.levels.forEach((level, i) => {
    if (level.kind !== 'test' && level.kind !== 'final') return;
    const lessons = chapter.levels
      .slice(since, i)
      .filter((l) => l.kind === 'lesson')
      .flatMap((l) => l.subs.map((s) => s.id));
    if (i > 0 && lessons.length) {
      stops.push({
        key: `${chapter.number}-review-${level.number}`,
        afterIndex: i - 1,
        testNumber: level.number,
        lessonIds: new Set(lessons),
      });
    }
    since = i + 1;
  });
  return stops;
}

/** The open mistakes a review stop holds. */
export function stopMistakes(p: Progress, stop: ReviewStop): PlayedQuestion[] {
  return openMistakes(p).filter((m) => stop.lessonIds.has(m.entry.id));
}

/**
 * Weak spots (docs/ui/12-practice-and-stats.md §7.3): the topics -- a lesson's `tags` -- the learner
 * misses most, from at least three answers each. Strength is the share right.
 */
export function weakSpots(
  p: Progress,
  most = 3,
): { tag: string; strength: number; answers: number }[] {
  const tally = new Map<string, { right: number; wrong: number }>();
  for (const [key, rec] of Object.entries(p.questions)) {
    const q = resolveKey(key);
    if (!q) continue;
    for (const tag of q.entry.level.tags ?? []) {
      const t = tally.get(tag) ?? { right: 0, wrong: 0 };
      t.right += rec.right;
      t.wrong += rec.wrong;
      tally.set(tag, t);
    }
  }
  return [...tally.entries()]
    .map(([tag, t]) => ({
      tag,
      answers: t.right + t.wrong,
      strength: t.right / Math.max(1, t.right + t.wrong),
    }))
    .filter((t) => t.answers >= 3 && t.strength < 1)
    .sort((a, b) => a.strength - b.strength || b.answers - a.answers)
    .slice(0, most);
}
