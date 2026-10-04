import { LESSONS, PATH_CHOICE_ID } from '../content';
import {
  definitionOf,
  findTerm,
  knowsR,
  markableTerms,
  markPlan,
  normTerm,
  SKILL_BY_ID,
  SKILLS,
  skillsOf,
  termCard,
  TERMS,
  TERMS_PER_SCREEN,
} from '../skills';
import type { Level, Screen } from '../types';

const lesson = (id: string) => {
  const entry = LESSONS.find((e) => e.id === id);
  if (!entry) throw new Error(`no lesson ${id}`);
  return entry;
};

describe('finding a term in a text', () => {
  it('matches a whole word in any case, with or without an s', () => {
    expect(findTerm('The spread is wide.', 'Spread')).toEqual({ index: 4, length: 6 });
    expect(findTerm('Spreads widen at the open.', 'spread')).toEqual({ index: 0, length: 7 });
    expect(findTerm('A widespread move.', 'spread')).toBeNull();
  });

  it('matches a one-letter term only in its own case', () => {
    expect(findTerm('Your result is 2 R.', 'R')).not.toBeNull();
    expect(findTerm('a r b', 'R')).toBeNull();
    expect(findTerm('Results in 1R', 'R')).toBeNull();
  });
});

describe('skills (docs/UI.md §5.3, docs/schema.md "Skills")', () => {
  it("a lesson's terms are its skills, each with the card that defines it", () => {
    const entry = lesson('level-06-2');
    const skills = skillsOf(entry);
    expect(skills.map((s) => s.name)).toEqual(['Spread']);
    const card = skills[0].card;
    expect(card).not.toBeNull();
    expect(['theory', 'example', 'carousel']).toContain(entry.level.screens[card as number].type);
    expect(skills[0]).toMatchObject({ id: 'term:spread', kind: 'term', chapter: 1 });
    expect(skills[0].where).toMatch(/^Level 6 · /);
    expect(skills[0].info).toBe(definitionOf('spread'));
    expect(skills[0].info).toMatch(/^The gap between/);
  });

  it("a technique is named in the lesson's `skills`, with its info from content/skills.yaml", () => {
    const entry = lesson('scalping-ch2-level-05-1');
    const [skill] = skillsOf(entry);
    expect(skill).toMatchObject({
      id: 'skill:the three-question read',
      name: 'The three-question read',
      kind: 'technique',
    });
    expect(skill.info).toBeTruthy();
    // It opens the lesson's first teaching card.
    expect(['theory', 'example', 'carousel', 'walkthrough', 'visual']).toContain(
      entry.level.screens[skill.card as number].type,
    );
  });

  it('words come first, and a lesson without a list teaches its terms', () => {
    const base = lesson('level-06-2');
    const listed: Level = { ...base.level, skills: ['The three-question read', 'Spread'] };
    expect(skillsOf({ ...base, level: listed }).map((s) => s.kind)).toEqual(['term', 'technique']);
    const unlisted: Level = { ...base.level, skills: undefined };
    expect(skillsOf({ ...base, level: unlisted }).map((s) => s.id)).toEqual(['term:spread']);
  });

  it('every lesson of the path that is not a test teaches something, every skill has its info', () => {
    const lessons = LESSONS.filter(
      (e) => !e.testBench && e.level.category === 'new-theory' && e.level.path !== 'all-screens',
    );
    expect(lessons.length).toBeGreaterThan(200);
    for (const e of lessons) expect(skillsOf(e).length).toBeGreaterThan(0);
    expect(SKILLS.every((s) => !!s.info)).toBe(true);
    expect(SKILL_BY_ID.get('skill:choosing your path')?.lessonId).toBe(PATH_CHOICE_ID);
  });

  it('every term is one skill, taught where it is first introduced', () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SKILL_BY_ID.get('term:spread')?.lessonId).toBe('level-06-2');
    expect(TERMS.get(normTerm('Stop order'))).toBeDefined();
  });

  it('finds a card for most terms (the rest are content work, docs/ContentToDo.md 1.4)', () => {
    const terms = SKILLS.filter((s) => s.kind === 'term');
    const found = terms.filter((s) => s.card !== null).length;
    expect(found / terms.length).toBeGreaterThan(0.8);
  });

  it('termCard looks only at cards', () => {
    const screens: Screen[] = [
      { type: 'intro', text: 'The spread.' },
      { type: 'tf', statement: 'The spread is free.', answer: false, explanation: '' },
      { type: 'theory', title: 'Two prices', body: 'The gap between them is the spread.' },
    ];
    expect(termCard({ screens } as Level, 'Spread')).toBe(2);
  });
});

describe('marking terms (docs/UI.md §8: neither too many nor too few)', () => {
  const spread = TERMS.get('spread')!;
  const liquidity = TERMS.get('liquidity')!;
  const volatility = TERMS.get('volatility')!;

  it('only terms of lessons played, never the lesson that defines them', () => {
    const done = { [spread.lessonId]: { perfect: true } };
    expect(markableTerms(null, done).map((s) => s.id)).toEqual(['term:spread']);
    expect(markableTerms(spread.lessonId, done)).toEqual([]);
    expect(markableTerms(null, {})).toEqual([]);
  });

  it("never the course's first words", () => {
    const done = { 'level-01-1': { perfect: true }, 'level-02-1': { perfect: true } };
    expect(markableTerms(null, done)).toEqual([]);
  });

  it('marks a term once per lesson, and at most two on a screen', () => {
    const screens: Screen[] = [
      {
        type: 'theory',
        title: 'x',
        body: 'Spread, liquidity and volatility, all at once.',
      },
      { type: 'theory', title: 'y', body: 'The spread again, and volatility.' },
    ];
    const plan = markPlan(screens, [spread, liquidity, volatility]);
    expect(plan[0]).toHaveLength(TERMS_PER_SCREEN);
    expect(plan[0]).toEqual(['term:spread', 'term:liquidity']);
    expect(plan[1]).toEqual(['term:volatility']);
  });
});

describe('the R ruler appears once R is taught (docs/UI.md §6.4)', () => {
  const r = TERMS.get('r');

  it('the path teaches R', () => {
    expect(r).toBeDefined();
  });

  it('not before that lesson; after it, or once it is played', () => {
    expect(knowsR('level-01-1', {})).toBe(false);
    expect(knowsR(r!.lessonId, {})).toBe(false);
    const later = LESSONS.find((e) => e.level.chapter === 7 && e.level.path === 'scalping')!;
    expect(knowsR(later.id, {})).toBe(true);
    expect(knowsR(null, { [r!.lessonId]: { perfect: false } })).toBe(true);
  });
});
