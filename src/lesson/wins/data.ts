import type { Grade } from '../answers';

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW] "Win screens" (David's pick of 2026-10-04:
 * "i want those win screens to change so there are like 5+ different
 * designs"): what every design of the lesson-complete screen is given, and
 * which design a finished lesson gets.
 */
export type WinData = {
  title: string;
  /** "6-2", for the designs that print a reference. Null for a lesson made in code. */
  ref: string | null;
  practice: boolean;
  perfect: boolean;
  /** XP handed out, the perfect bonus included; the lesson's own XP; the bonus. */
  earned: number;
  base: number;
  bonus: number;
  /** Answers right (amber counts) of those answered, and the share. */
  clean: number;
  total: number;
  accuracy: number;
  gems: number;
  /** Days in a row, when the lesson counts for the streak. */
  streak: number | null;
  /** Hearts now, after a practice round. */
  hearts: number | null;
  maxHearts: number;
  /** The lesson's answers in order, for the designs that draw the run. */
  grades: Grade[];
};

export type WinRow = { label: string; value: string; accent?: boolean };

/** The breakdown every design shows, in its own way: the same rows, in the same order. */
export function rowsOf(d: WinData): WinRow[] {
  const rows: WinRow[] = [];
  if (!d.practice) rows.push({ label: 'Lesson', value: `+${d.base} XP` });
  if (d.bonus > 0 && !d.practice)
    rows.push({ label: 'Perfect bonus', value: `+${d.bonus} XP`, accent: true });
  rows.push({ label: 'Answers', value: `${d.clean} of ${d.total}`, accent: d.accuracy === 1 });
  if (d.gems > 0) rows.push({ label: 'Gems', value: `+${d.gems}` });
  if (d.hearts !== null) rows.push({ label: 'Hearts', value: `${d.hearts}/${d.maxHearts}` });
  if (d.streak !== null) {
    rows.push({
      label: 'Streak',
      value: `${d.streak} ${d.streak === 1 ? 'day' : 'days'}`,
      accent: true,
    });
  }
  return rows;
}

/** The headline number: XP earned, or after a practice round, the answers right. */
export function headline(d: WinData): { value: number; text: (n: number) => string; unit: string } {
  return d.practice
    ? { value: d.clean, text: (n) => `${n}/${d.total}`, unit: 'RIGHT' }
    : { value: d.earned, text: (n) => `+${n}`, unit: 'XP' };
}

/**
 * The designs, in the order they take turns. Ring is the one the app had; the
 * receipt and the split-flap board are David's picks from Design suggestions;
 * the candle, the equity curve and the quote were made for the set.
 */
export const WIN_DESIGNS = ['ring', 'receipt', 'board', 'candle', 'curve', 'quote'] as const;
export type WinDesign = (typeof WIN_DESIGNS)[number];

export const WIN_INFO: Record<WinDesign, { title: string; line: string }> = {
  ring: {
    title: 'The accuracy ring',
    line: 'A ring sweeps round to your accuracy, a note at every eighth, and the XP counts up out of it.',
  },
  receipt: {
    title: 'A trade receipt',
    line: 'The summary prints out like an order confirmation, and a FILLED stamp lands on it.',
  },
  board: {
    title: 'A split-flap board',
    line: 'Your results flip in digit by digit, like a departure board, and each row lights its lamp.',
  },
  candle: {
    title: 'Your lesson as a candle',
    line: 'One big candle forms from the open: every right answer pushes it up, a miss leaves a wick.',
  },
  curve: {
    title: 'An equity curve',
    line: 'Your answers draw a P&L line, a step up for each right one, ending on your XP.',
  },
  quote: {
    title: 'A ticker quote',
    line: 'The lesson gets a quote card like a stock: its symbol, its XP as the price, its run as a chart.',
  },
};

/**
 * Which design a finished lesson gets: they take turns, so two lessons in a
 * row never look alike. `plays` is how many lessons have been finished,
 * replays included.
 */
export function pickWin(plays: number): WinDesign {
  return WIN_DESIGNS[((plays % WIN_DESIGNS.length) + WIN_DESIGNS.length) % WIN_DESIGNS.length];
}

/** A lesson id's short reference: `level-06-2` -> "6-2". */
export function refOf(lessonId: string | null | undefined): string | null {
  const m = /(\d+)-(\d+)$/.exec(lessonId ?? '');
  return m ? `${Number(m[1])}-${Number(m[2])}` : null;
}

/** A sample lesson for the previews (Design suggestions → Win screens). */
export const SAMPLE_WIN: WinData = {
  title: 'Candle signals',
  ref: '6-2',
  practice: false,
  perfect: false,
  earned: 40,
  base: 40,
  bonus: 0,
  clean: 7,
  total: 8,
  accuracy: 7 / 8,
  gems: 0,
  streak: 4,
  hearts: null,
  maxHearts: 5,
  grades: ['correct', 'correct', 'wrong', 'correct', 'correct', 'correct', 'correct', 'correct'],
};
