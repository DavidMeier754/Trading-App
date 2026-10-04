import { CHAPTER_ONE, LESSONS, LessonEntry, nodeOf, PATH_CHAPTERS } from './content';
import { SKILL_LIST } from './content.generated';
import type { Level, Screen } from './types';

/**
 * Skills (docs/ui/07-lesson-chapter-and-tier-complete.md §5.3, docs/ui/12-practice-and-stats.md §7.3; docs/level-files/06-skills-bonus-lessons-market-profiles.md "Skills").
 *
 * Every skill is an entry of content/skills.yaml: a word (a term the course
 * defines) or a technique (something the learner can now do), with a one-line
 * info. A lesson lists the names of the skills it teaches in its `skills`.
 * After the lesson the learner sees the new ones; the Practice tab keeps them
 * by chapter; each opens the card that taught it. The words are what the
 * lesson player marks in later lessons (docs/ui/14-glossary-and-copy.md §8).
 */
export type Skill = {
  /** `term:spread` or `skill:<folded name>`. A word is one skill, however many paths teach it. */
  id: string;
  name: string;
  kind: 'term' | 'technique';
  /** Its one line from content/skills.yaml: a word's meaning, what a technique lets you do. */
  info: string | null;
  lessonId: string;
  chapter: number;
  path: string;
  /** Where it was taught, as the learner reads it: "Level 4 · The Quote Card". */
  where: string;
  /** The 0-based screen index of the card that teaches it, or null if none is found. */
  card: number | null;
};

/** The screens a skill's card can be. */
const CARD_TYPES = new Set<Screen['type']>([
  'theory',
  'example',
  'carousel',
  'walkthrough',
  'visual',
]);
/** The screens a term is looked for in: where a lesson defines its words. */
const TERM_CARD_TYPES = new Set<Screen['type']>(['theory', 'example', 'carousel']);

/** A term folded for comparing: "Stop order" and "stop  order" are one. */
export function normTerm(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** An entry of content/skills.yaml (docs/level-files/06-skills-bonus-lessons-market-profiles.md "Skills"). */
type SkillEntry = { name: string; kind: 'word' | 'technique'; info: string; aliases?: string[] };

const ENTRIES = (Array.isArray(SKILL_LIST) ? SKILL_LIST : []) as SkillEntry[];

/** Every entry by its folded name. */
const ENTRY_BY_NAME = new Map(ENTRIES.map((e) => [normTerm(e.name), e]));

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Where a term stands in a text: as a whole word, in any case, plain or with
 * an "s" ("spread", "Spreads"). Null when it does not. A term of one or two
 * letters ("R") is matched in its own case, so it is never a stray letter.
 */
export function findTerm(text: string, term: string): { index: number; length: number } | null {
  const word = term.trim();
  const re = new RegExp(
    `(^|[^A-Za-z0-9])(${escapeRe(word)}(?:e?s)?)(?=$|[^A-Za-z0-9])`,
    word.length <= 2 ? '' : 'i',
  );
  const m = re.exec(text);
  if (!m) return null;
  return { index: m.index + m[1].length, length: m[2].length };
}

/** The words of a card, for finding a term in it. */
export function cardText(screen: Screen): string {
  switch (screen.type) {
    case 'theory':
      return `${screen.title} ${screen.body}`;
    case 'example':
      return screen.body;
    case 'carousel':
      return screen.cards.map((c) => `${c.label} ${c.text}`).join(' ');
    case 'walkthrough':
      return screen.steps.map((s) => s.text).join(' ');
    case 'visual':
      return screen.caption ?? '';
    default:
      return '';
  }
}

/** The card of a lesson that teaches a term: the first that names it. */
export function termCard(level: Level, term: string): number | null {
  const i = level.screens.findIndex(
    (s) => TERM_CARD_TYPES.has(s.type) && findTerm(cardText(s), term) !== null,
  );
  return i === -1 ? null : i;
}

/** The card a technique opens: its lesson's first teaching card. */
export function techniqueCard(level: Level): number | null {
  const i = level.screens.findIndex((s) => CARD_TYPES.has(s.type));
  return i === -1 ? null : i;
}

function whereOf(entry: LessonEntry): string {
  const node = nodeOf(entry.id);
  if (!node) return entry.title;
  return node.number === null ? node.title : `Level ${node.number} · ${node.title}`;
}

/**
 * A lesson's skills, words first, each in the order the file gives them. A
 * lesson without a `skills` list (the test bench, a design sample) teaches
 * its `terms_introduced`. A name with no entry in content/skills.yaml (the
 * validator refuses one) is a word if the lesson introduces it.
 */
export function skillsOf(entry: LessonEntry): Skill[] {
  const { level } = entry;
  const base = {
    lessonId: entry.id,
    chapter: level.chapter,
    path: level.path,
    where: whereOf(entry),
  };
  const introduced = new Set((level.terms_introduced ?? []).map(normTerm));
  const skills: Skill[] = (level.skills ?? level.terms_introduced ?? []).map((name) => {
    const key = normTerm(name);
    const known = ENTRY_BY_NAME.get(key);
    const info = known?.info ?? null;
    return (known ? known.kind === 'word' : introduced.has(key))
      ? { ...base, id: `term:${key}`, name, kind: 'term', info, card: termCard(level, name) }
      : { ...base, id: `skill:${key}`, name, kind: 'technique', info, card: techniqueCard(level) };
  });
  return [
    ...skills.filter((s) => s.kind === 'term'),
    ...skills.filter((s) => s.kind === 'technique'),
  ];
}

/** Every lesson on a path, in the order a learner meets them (bonus lessons and the bench aside). */
const PATH_LESSONS = LESSONS.filter((e) => !e.testBench && e.level.category !== 'bonus');

/** A lesson's place in path order. Chapter 1 comes before every path's chapters. */
const ORDER = new Map(PATH_LESSONS.map((e, i) => [e.id, i]));

/** Every skill, each once, taught where it is first introduced. */
export const SKILLS: Skill[] = (() => {
  const seen = new Set<string>();
  const out: Skill[] = [];
  for (const entry of PATH_LESSONS) {
    for (const skill of skillsOf(entry)) {
      if (seen.has(skill.id)) continue;
      seen.add(skill.id);
      out.push(skill);
    }
  }
  return out;
})();

export const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));

/** The lesson a skill comes from. */
export function lessonOf(skill: Skill): LessonEntry | undefined {
  return LESSONS.find((e) => e.id === skill.lessonId);
}

/** Every term's skill, by its folded name. */
export const TERMS = new Map(
  SKILLS.filter((s) => s.kind === 'term').map((s) => [normTerm(s.name), s]),
);

/**
 * The course's first words (Chapter 1, Levels 1 and 2: price, chart, buy, sell,
 * market …) are on nearly every screen; marking them would be noise.
 */
function everyday(skill: Skill): boolean {
  const node = nodeOf(skill.lessonId);
  return !!node && node.chapter === 1 && node.number !== null && node.number <= 2;
}

/**
 * docs/ui/14-glossary-and-copy.md §8 (David: "don't over or underuse them"): the terms a lesson may
 * mark -- taught in another lesson the learner has played, and not one of the
 * course's first words. The lesson that defines a term is busy defining it.
 */
export function markableTerms(lessonId: string | null, done: Record<string, unknown>): Skill[] {
  return [...TERMS.values()].filter(
    (s) => s.lessonId !== lessonId && !!done[s.lessonId] && !everyday(s),
  );
}

/** How many terms one screen marks at most. */
export const TERMS_PER_SCREEN = 2;

/** The words of a screen the marker reads: its body, its scene or its question. */
export function markText(screen: Screen): string {
  switch (screen.type) {
    case 'theory':
    case 'example':
      return screen.body;
    case 'story':
      return screen.text;
    case 'tf':
      return screen.statement;
    case 'chart-decision':
      return screen.scenario;
    default: {
      const prompt = (screen as { prompt?: unknown }).prompt;
      return typeof prompt === 'string' ? prompt : '';
    }
  }
}

/**
 * Which terms each screen of a run marks: a term's first appearance in the
 * lesson only, and at most `TERMS_PER_SCREEN` on one screen, the first in
 * reading order. Worked out once for the run, so a screen marks the same
 * words however often it is drawn.
 */
export function markPlan(screens: Screen[], terms: Skill[]): string[][] {
  const used = new Set<string>();
  return screens.map((screen) => {
    const text = markText(screen);
    if (!text) return [];
    const hits = terms
      .map((t) => ({ t, at: findTerm(text, t.name) }))
      .filter((h): h is { t: Skill; at: { index: number; length: number } } => h.at !== null)
      .filter((h) => !used.has(h.t.id))
      .sort((a, b) => a.at.index - b.at.index || b.at.length - a.at.length);
    const picked: Skill[] = [];
    for (const h of hits) {
      if (picked.length >= TERMS_PER_SCREEN) break;
      // Two terms on overlapping words ("Stop" in "Stop order"): the longer, earlier one wins.
      if (picked.some((p) => overlaps(text, p.name, h.t.name))) continue;
      picked.push(h.t);
    }
    picked.forEach((p) => used.add(p.id));
    return picked.map((p) => p.id);
  });
}

function overlaps(text: string, a: string, b: string): boolean {
  const x = findTerm(text, a);
  const y = findTerm(text, b);
  if (!x || !y) return false;
  return x.index < y.index + y.length && y.index < x.index + x.length;
}

/**
 * docs/ui/08-quotes-and-charts.md §6.4: the R ruler appears once R has been taught -- the lesson
 * that introduces the term "R" is played, or this lesson comes after it.
 */
export function knowsR(lessonId: string | null, done: Record<string, unknown>): boolean {
  const r = TERMS.get('r');
  if (!r) return false;
  if (done[r.lessonId]) return true;
  if (lessonId === null) return false;
  const here = ORDER.get(lessonId);
  const there = ORDER.get(r.lessonId);
  return here !== undefined && there !== undefined && here > there;
}

const DEFINITION_BY_TERM = new Map<string, string>(
  ENTRIES.filter((e) => e.kind === 'word').flatMap((e) => [
    [normTerm(e.name), e.info] as [string, string],
    ...(e.aliases ?? []).map((a) => [normTerm(a), e.info] as [string, string]),
  ]),
);

/** A word's meaning: its info line in content/skills.yaml, found by its name or an alias. */
export function definitionOf(term: string): string | null {
  return DEFINITION_BY_TERM.get(normTerm(term)) ?? null;
}

/** The chapters a learner's skills are grouped by: Chapter 1, then their path's. */
export function skillChapters(path: string | null) {
  const chapters = [
    CHAPTER_ONE,
    ...(path ? PATH_CHAPTERS[path as keyof typeof PATH_CHAPTERS] : []),
  ];
  return chapters.map((chapter) => {
    const ids = new Set(chapter.levels.flatMap((l) => l.subs.map((s) => s.id)));
    return { chapter, skills: SKILLS.filter((s) => ids.has(s.lessonId)) };
  });
}
