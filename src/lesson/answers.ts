import type { DecisionButton, QuestionScreen, Screen } from '../types';

/** docs/UI.md §5.1 knows three outcomes: green, red, and amber. */
export type Grade = 'correct' | 'amber' | 'wrong';

/** One value shape per question type. `null` means "nothing chosen yet". */
export type AnswerValue =
  | { kind: 'option'; index: number | null } // mc, numeric-mc
  | { kind: 'bool'; value: boolean | null } // tf
  | { kind: 'tiles'; placed: number[] } // fill-tiles: indices into the tile pool
  | { kind: 'match'; linked: Record<number, number>; misses: number } // match
  | { kind: 'numeric'; text: string } // numeric-input
  | { kind: 'decision'; choice: DecisionButton | null }; // chart-decision

export function emptyValue(screen: Screen): AnswerValue | null {
  switch (screen.type) {
    case 'mc':
    case 'numeric-mc':
      return { kind: 'option', index: null };
    case 'tf':
      return { kind: 'bool', value: null };
    case 'fill-tiles':
      return { kind: 'tiles', placed: [] };
    case 'match':
      return { kind: 'match', linked: {}, misses: 0 };
    case 'numeric-input':
      return { kind: 'numeric', text: '' };
    case 'chart-decision':
      return { kind: 'decision', choice: null };
    default:
      return null;
  }
}

/** docs/UI.md §4: `Check` stays disabled until an answer is chosen. */
export function canCheck(screen: QuestionScreen, value: AnswerValue): boolean {
  switch (value.kind) {
    case 'option':
      return value.index !== null;
    case 'bool':
      return value.value !== null;
    case 'tiles':
      return (
        screen.type === 'fill-tiles' && value.placed.length === screen.answer.length
      );
    case 'match':
      return (
        screen.type === 'match' &&
        Object.keys(value.linked).length === screen.pairs.length
      );
    case 'numeric':
      return parseNumeric(value.text) !== null;
    case 'decision':
      return value.choice !== null;
  }
}

export function parseNumeric(text: string): number | null {
  if (!text || text === '-' || text === '.' || text === '-.') return null;
  const n = Number(text.replace('−', '-'));
  return Number.isFinite(n) ? n : null;
}

export function tilePool(answer: string): string[] {
  // docs/UI.md §4.1: the sentence's letters plus 2-4 distractor letters.
  // The level file carries only the answer, so the distractors are generated here.
  const letters = answer.toUpperCase().split('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const distractorCount = 3;
  const seed = answer
    .split('')
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100003, 7);
  const pool = [...letters];
  let cursor = seed;
  while (pool.length < letters.length + distractorCount) {
    cursor = (cursor * 1103515245 + 12345) % 2147483648;
    const candidate = alphabet[cursor % 26];
    pool.push(candidate);
  }
  // Deterministic shuffle so the tiles do not reorder on re-render.
  for (let i = pool.length - 1; i > 0; i--) {
    cursor = (cursor * 1103515245 + 12345) % 2147483648;
    const j = cursor % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function correctOptionIndex(options: { correct?: boolean }[]): number {
  return options.findIndex((o) => o.correct === true);
}

export function decisionButtons(screen: {
  buttons?: DecisionButton[];
}): DecisionButton[] {
  // docs/schema.md: default [long, short, no-trade]; Chapter 1 uses [buy, wait].
  return screen.buttons ?? ['long', 'short', 'no-trade'];
}

export function gradeDecision(
  screen: { best: DecisionButton; reasonable?: DecisionButton[] },
  choice: DecisionButton
): Grade {
  if (choice === screen.best) return 'correct';
  if (screen.reasonable?.includes(choice)) return 'amber';
  return 'wrong';
}

export function grade(screen: QuestionScreen, value: AnswerValue): Grade {
  switch (screen.type) {
    case 'mc':
    case 'numeric-mc': {
      if (value.kind !== 'option' || value.index === null) return 'wrong';
      return value.index === correctOptionIndex(screen.options) ? 'correct' : 'wrong';
    }
    case 'tf': {
      if (value.kind !== 'bool' || value.value === null) return 'wrong';
      return value.value === screen.answer ? 'correct' : 'wrong';
    }
    case 'numeric-input': {
      if (value.kind !== 'numeric') return 'wrong';
      const n = parseNumeric(value.text);
      if (n === null) return 'wrong';
      const tolerance = screen.tolerance ?? 0;
      return Math.abs(n - screen.answer) <= tolerance ? 'correct' : 'wrong';
    }
    case 'fill-tiles': {
      if (value.kind !== 'tiles') return 'wrong';
      const pool = tilePool(screen.answer);
      const word = value.placed.map((i) => pool[i]).join('');
      return word === screen.answer.toUpperCase() ? 'correct' : 'wrong';
    }
    case 'match': {
      // `match` locks correct pairs as they are made and resets wrong ones
      // (docs/UI.md §4.1), so by Check time every pair is right. The score is
      // whether the learner got there without a wrong tap.
      if (value.kind !== 'match') return 'wrong';
      return value.misses === 0 ? 'correct' : 'wrong';
    }
    case 'chart-decision': {
      if (value.kind !== 'decision' || value.choice === null) return 'wrong';
      return gradeDecision(screen, value.choice);
    }
  }
}
