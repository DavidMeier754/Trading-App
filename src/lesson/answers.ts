import type {
  ChartReplayScreen,
  DecisionButton,
  QuestionScreen,
  ReplayMoment,
  Screen,
  ScreenType,
} from '../types';

/**
 * Which question types commit on the tap itself instead of waiting for Check.
 *
 * docs/UI.md §4 gave every question a Check step and §4.1 exempted `tf`.
 * Play-testing reversed both: picking one of four answer cards and then
 * confirming is two taps for one decision, while `tf`'s two big thumb-sized
 * buttons are easy to hit by accident and want the confirm. `match` locks each
 * pair as it is made, so by the time every pair is green there is nothing left
 * for Check to do. See the docs/UI.md §4 patch in the build report.
 */
export const COMMITS_ON_TAP: ScreenType[] = [
  'mc',
  'numeric-mc',
  'match',
  'chart-decision',
];

export function commitsOnTap(screen: Screen): boolean {
  return COMMITS_ON_TAP.includes(screen.type);
}

/** docs/UI.md §5.1 knows three outcomes: green, red, and amber. */
export type Grade = 'correct' | 'amber' | 'wrong';

/** One value shape per question type. `null` means "nothing chosen yet". */
export type AnswerValue =
  | { kind: 'option'; index: number | null } // mc, numeric-mc, fill-choice
  | { kind: 'bool'; value: boolean | null } // tf
  | { kind: 'tiles'; placed: number[] } // fill-tiles: indices into the tile pool
  | { kind: 'match'; linked: Record<number, number>; misses: number } // match
  | { kind: 'numeric'; text: string } // numeric-input
  | { kind: 'decision'; choice: DecisionButton | null } // chart-decision
  | { kind: 'target'; id: string | null } // hotspot, scanner-pick, compare, depth-ladder
  | { kind: 'index'; index: number | null } // chart-tap, spot-mistake
  | { kind: 'slider'; value: number | null } // slider, chart-annotate
  | { kind: 'buckets'; placed: Record<number, string> } // sort
  | { kind: 'sequence'; order: number[] } // order
  | { kind: 'slots'; filled: Record<string, string> } // order-build, journal-row
  | { kind: 'deck'; picks: ('take' | 'pass')[] } // swipe-deck
  | { kind: 'branch'; picks: number[] } // branch
  | { kind: 'replay'; acted: { bar: number; side: string }[]; ended: boolean }; // chart-replay

export function emptyValue(screen: Screen): AnswerValue | null {
  switch (screen.type) {
    case 'mc':
    case 'numeric-mc':
    case 'fill-choice':
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
    case 'hotspot':
    case 'scanner-pick':
    case 'compare':
    case 'depth-ladder':
      return { kind: 'target', id: null };
    case 'chart-tap':
    case 'spot-mistake':
      return { kind: 'index', index: null };
    case 'slider':
    case 'chart-annotate':
      return { kind: 'slider', value: null };
    case 'sort':
      return { kind: 'buckets', placed: {} };
    case 'order':
      return { kind: 'sequence', order: [] };
    case 'order-build':
    case 'journal-row':
      return { kind: 'slots', filled: {} };
    case 'swipe-deck':
      return { kind: 'deck', picks: [] };
    case 'branch':
      return { kind: 'branch', picks: [] };
    case 'chart-replay':
      return { kind: 'replay', acted: [], ended: false };
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
    case 'target':
      return value.id !== null;
    case 'index':
      return value.index !== null;
    case 'slider':
      return value.value !== null;
    case 'buckets':
      return (
        screen.type === 'sort' &&
        Object.keys(value.placed).length === screen.items.length
      );
    case 'sequence':
      return screen.type === 'order' && value.order.length === screen.items.length;
    case 'slots':
      return (
        (screen.type === 'order-build' || screen.type === 'journal-row') &&
        screen.slots.every((slot) => value.filled[slot] !== undefined)
      );
    case 'deck':
      return screen.type === 'swipe-deck' && value.picks.length === screen.cards.length;
    case 'branch':
      return screen.type === 'branch' && value.picks.length === screen.steps.length;
    case 'replay':
      return value.ended;
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
    case 'fill-choice': {
      if (value.kind !== 'option' || value.index === null) return 'wrong';
      return screen.options[value.index] === screen.answer ? 'correct' : 'wrong';
    }
    case 'tf': {
      if (value.kind !== 'bool' || value.value === null) return 'wrong';
      return value.value === screen.answer ? 'correct' : 'wrong';
    }
    case 'numeric-input': {
      if (value.kind !== 'numeric') return 'wrong';
      const n = parseNumeric(value.text);
      if (n === null) return 'wrong';
      return Math.abs(n - screen.answer) <= (screen.tolerance ?? 0)
        ? 'correct'
        : 'wrong';
    }
    case 'fill-tiles': {
      if (value.kind !== 'tiles') return 'wrong';
      const pool = tilePool(screen.answer);
      const word = value.placed.map((i) => pool[i]).join('');
      return word === screen.answer.toUpperCase() ? 'correct' : 'wrong';
    }
    case 'match': {
      // `match` locks correct pairs as they are made and bounces wrong ones
      // (docs/UI.md §4.1), so by the time the screen resolves every pair is
      // right. The score is whether the learner got there without a wrong tap.
      if (value.kind !== 'match') return 'wrong';
      return value.misses === 0 ? 'correct' : 'wrong';
    }
    case 'chart-decision': {
      if (value.kind !== 'decision' || value.choice === null) return 'wrong';
      return gradeDecision(screen, value.choice);
    }
    case 'sort': {
      if (value.kind !== 'buckets') return 'wrong';
      return screen.items.every((item, i) => value.placed[i] === item.bucket)
        ? 'correct'
        : 'wrong';
    }
    case 'order': {
      if (value.kind !== 'sequence') return 'wrong';
      return value.order.every((itemIndex, position) => itemIndex === position)
        ? 'correct'
        : 'wrong';
    }
    case 'hotspot': {
      if (value.kind !== 'target' || value.id === null) return 'wrong';
      const targets = screen.targets ?? (screen.target ? [screen.target] : []);
      return targets.includes(value.id) ? 'correct' : 'wrong';
    }
    case 'slider':
    case 'chart-annotate': {
      if (value.kind !== 'slider' || value.value === null) return 'wrong';
      return Math.abs(value.value - screen.answer) <= (screen.tolerance ?? 0)
        ? 'correct'
        : 'wrong';
    }
    case 'chart-tap': {
      if (value.kind !== 'index' || value.index === null) return 'wrong';
      return value.index === screen.target ? 'correct' : 'wrong';
    }
    case 'spot-mistake': {
      if (value.kind !== 'index' || value.index === null) return 'wrong';
      return screen.segments[value.index]?.wrong === true ? 'correct' : 'wrong';
    }
    case 'swipe-deck': {
      if (value.kind !== 'deck') return 'wrong';
      const hits = screen.cards.filter((c, i) => value.picks[i] === c.answer).length;
      if (hits === screen.cards.length) return 'correct';
      // A deck is a run, not a single call: most of it right is not a failure.
      return hits >= Math.ceil(screen.cards.length * 0.7) ? 'amber' : 'wrong';
    }
    case 'order-build':
    case 'journal-row': {
      if (value.kind !== 'slots') return 'wrong';
      return screen.slots.every((slot) => value.filled[slot] === screen.answer[slot])
        ? 'correct'
        : 'wrong';
    }
    case 'scanner-pick': {
      if (value.kind !== 'target' || value.id === null) return 'wrong';
      return value.id === screen.target ? 'correct' : 'wrong';
    }
    case 'compare': {
      if (value.kind !== 'target' || value.id === null) return 'wrong';
      return value.id === screen.answer ? 'correct' : 'wrong';
    }
    case 'depth-ladder': {
      if (value.kind !== 'target' || value.id === null) return 'wrong';
      return value.id === screen.target ? 'correct' : 'wrong';
    }
    case 'branch': {
      if (value.kind !== 'branch') return 'wrong';
      const right = screen.steps.filter(
        (step, i) => step.options[value.picks[i]]?.correct === true
      ).length;
      if (right === screen.steps.length) return 'correct';
      // Managing a trade is a sequence; one wrong turn is not the whole run.
      return right >= screen.steps.length - 1 ? 'amber' : 'wrong';
    }
    case 'chart-replay':
      return gradeReplay(screen, value);
  }
}

/**
 * docs/UI.md §4.4 — every marked moment resolves to exactly one label, from
 * arithmetic on the bar index. Restraint is never punished: Missed and Phantom
 * are amber, and a clean run of decoys is green.
 */
export type ReplayLabel =
  | 'Textbook'
  | 'Early'
  | 'Late'
  | 'Missed'
  | 'Phantom'
  | 'Passed';

export function replayLabels(
  screen: ChartReplayScreen,
  value: Extract<AnswerValue, { kind: 'replay' }>
): { moment: ReplayMoment | null; label: ReplayLabel; bar: number }[] {
  const out: { moment: ReplayMoment | null; label: ReplayLabel; bar: number }[] = [];
  const used = new Set<number>();

  for (const moment of screen.moments) {
    const hit = value.acted.find(
      (a, i) => !used.has(i) && Math.abs(a.bar - moment.bar) <= 2
    );
    const hitIndex = hit ? value.acted.indexOf(hit) : -1;
    if (hitIndex >= 0) used.add(hitIndex);

    if (moment.kind === 'decoy') {
      out.push({
        moment,
        label: hit ? 'Phantom' : 'Passed',
        bar: hit ? hit.bar : moment.bar,
      });
      continue;
    }
    if (!hit) {
      out.push({ moment, label: 'Missed', bar: moment.bar });
      continue;
    }
    const delta = hit.bar - moment.bar;
    out.push({
      moment,
      label: Math.abs(delta) <= 1 ? 'Textbook' : delta < 0 ? 'Early' : 'Late',
      bar: hit.bar,
    });
  }

  // Anything acted on where nothing was marked is a Phantom too.
  value.acted.forEach((a, i) => {
    if (!used.has(i)) out.push({ moment: null, label: 'Phantom', bar: a.bar });
  });

  return out.sort((a, b) => a.bar - b.bar);
}

function gradeReplay(
  screen: ChartReplayScreen,
  value: AnswerValue
): Grade {
  if (value.kind !== 'replay') return 'wrong';
  const labels = replayLabels(screen, value);
  if (labels.length === 0) return 'correct';
  const green = labels.filter(
    (l) => l.label === 'Textbook' || l.label === 'Passed'
  ).length;
  if (green === labels.length) return 'correct';
  // §4.4: Missed and Phantom are amber, never red. Only a run that is mostly
  // mistimed drops out of amber.
  return green >= Math.ceil(labels.length / 2) ? 'amber' : 'wrong';
}
