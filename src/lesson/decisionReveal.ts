import { count, signedPrice } from '../format';
import type { ChartDecisionScreen, ChartSpec, DecisionButton } from '../types';
import type { Grade } from './answers';
import { decisionButtons, gradeDecision } from './answers';

/**
 * docs/UI.md §5.1b: the reveal of a `chart-decision` grades the decision and
 * reports the outcome separately. Everything it says is worked out here, from
 * the screen, the button pressed and its grade, so every combination of
 * grade × result × traded-or-stood-aside can be tested without drawing it
 * (src/__tests__/decisionReveal.test.ts).
 */

export const DECISION_LABEL: Record<DecisionButton, string> = {
  long: 'Long',
  short: 'Short',
  'no-trade': 'No trade',
  buy: 'Buy',
  wait: 'Wait',
};

/** Which way a choice faces: +1 gains when price rises, 0 stands aside. */
export const DIRECTION: Record<DecisionButton, 1 | -1 | 0> = {
  long: 1,
  buy: 1,
  short: -1,
  'no-trade': 0,
  wait: 0,
};

/** The chip over the reveal (docs/UI.md §5.1b). */
export const DECISION_CHIP: Record<Grade, string> = {
  correct: 'Good call',
  amber: 'Reasonable',
  wrong: 'Not this time',
};

/** What a choice is called at the start of a sentence: "Buying was …". */
const DOING: Record<DecisionButton, string> = {
  buy: 'Buying',
  long: 'Going long',
  short: 'Going short',
  wait: 'Waiting',
  'no-trade': 'Staying out',
};

/** The hypothetical for someone who stood aside: "Had you bought: …". */
const HAD_YOU: Record<DecisionButton, string> = {
  buy: 'Had you bought',
  long: 'Had you gone long',
  short: 'Had you gone short',
  wait: 'Had you waited',
  'no-trade': 'Had you stayed out',
};

/** docs/UI.md §5.1b, "Right call, losing trade". The "Why?" link follows in stage VARIANCE. */
export const VARIANCE_LINE =
  'Right call — this trade lost anyway. This setup loses about 4 in 10 times; judge the decision, not the result.';

export type ResultTone = 'up' | 'down' | 'flat' | 'hypothetical';

export type DecisionReveal = {
  grade: Grade;
  /** The chip: Good call, Reasonable, Not this time. */
  chip: string;
  /** The first line, spoken to the option actually chosen. */
  lead: string;
  /** The level file's `outcome` sentence. */
  outcome: string;
  /** "+$45.00 on 250 shares", or for standing aside "Had you bought: +$45.00 on 250 shares". */
  result: string;
  /** Coloured by sign when a trade was taken; grey when it is only a "would have". */
  tone: ResultTone;
  /** Only for a right call whose trade lost. */
  variance?: string;
  stoodAside: boolean;
  /** Dollars made or lost this time; for standing aside, what the hypothetical made. */
  pnl: number;
};

function close(spec: ChartSpec, index: number): number {
  const data = spec.data as (number | number[])[];
  const bar = data[Math.max(0, Math.min(index, data.length - 1))];
  return Array.isArray(bar) ? bar[3] : bar;
}

/** How far the price went from the decision to the last bar. */
export function decisionMove(screen: Pick<ChartDecisionScreen, 'chart'>): number {
  const bars = Array.isArray(screen.chart.data) ? screen.chart.data.length : 0;
  return close(screen.chart, bars - 1) - close(screen.chart, screen.chart.decision_index);
}

/**
 * The trade the hypothetical is about, for someone who stood aside: the best
 * call if that was a trade, else a trade marked reasonable, else the first
 * trade on offer.
 */
function tradeNotTaken(screen: ChartDecisionScreen): DecisionButton | null {
  if (DIRECTION[screen.best] !== 0) return screen.best;
  const reasonable = (screen.reasonable ?? []).find((b) => DIRECTION[b] !== 0);
  if (reasonable) return reasonable;
  return decisionButtons(screen).find((b) => DIRECTION[b] !== 0) ?? null;
}

/** Cents, so a float's dust never turns an even trade into a loss. */
const cents = (v: number) => Math.round(v * 100) / 100;

function shares(n: number): string {
  return `${count(n)} ${n === 1 ? 'share' : 'shares'}`;
}

export function decisionReveal(
  screen: ChartDecisionScreen,
  choice: DecisionButton,
  grade: Grade = gradeDecision(screen, choice),
): DecisionReveal {
  const move = decisionMove(screen);
  const direction = DIRECTION[choice];
  const stoodAside = direction === 0;
  const best = DECISION_LABEL[screen.best] ?? screen.best;

  // The first line always speaks to the option pressed (docs/UI.md §5.1b):
  // "Standing aside costs nothing here" only ever to someone who stood aside.
  let lead: string;
  if (grade === 'correct') lead = `${DOING[choice]} was the right call here.`;
  else if (grade === 'amber')
    lead = stoodAside
      ? `Standing aside costs nothing here. The better call was ${best}.`
      : `${DOING[choice]} here was a fair call, but the better one was ${best}.`;
  else lead = `${DOING[choice]} was not the call here. The better one was ${best}.`;

  let pnl: number;
  let result: string;
  let tone: ResultTone;
  if (!stoodAside) {
    pnl = cents(direction * move * screen.shares);
    result = `${signedPrice(pnl)} on ${shares(screen.shares)}`;
    tone = pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'flat';
  } else {
    const other = tradeNotTaken(screen);
    pnl = other ? cents(DIRECTION[other] * move * screen.shares) : 0;
    result = other
      ? `${HAD_YOU[other]}: ${signedPrice(pnl)} on ${shares(screen.shares)}`
      : `The price moved ${signedPrice(cents(move))} per share`;
    tone = 'hypothetical';
  }

  return {
    grade,
    chip: DECISION_CHIP[grade],
    lead,
    outcome: screen.outcome,
    result,
    tone,
    variance: grade === 'correct' && !stoodAside && pnl < 0 ? VARIANCE_LINE : undefined,
    stoodAside,
    pnl,
  };
}

/** What a screen reader hears, in docs/UI.md §5.1b's order: the grade, the outcome sentence, the result line. */
export function decisionRevealLabel(r: DecisionReveal, explanation: string): string {
  return [`${r.chip}.`, r.lead, r.outcome, `${r.result}.`, r.variance, explanation]
    .filter(Boolean)
    .join(' ');
}

/**
 * The tallest reveal this screen can get, whichever button is pressed: what
 * the screen keeps room for before the answer (Reveal.tsx, RevealProbe).
 */
export function longestDecisionReveal(screen: ChartDecisionScreen): DecisionReveal {
  const size = (r: DecisionReveal) => r.lead.length + r.result.length + (r.variance?.length ?? 0);
  return decisionButtons(screen)
    .map((b) => decisionReveal(screen, b))
    .reduce((a, b) => (size(b) > size(a) ? b : a));
}

/** The chart's outcome tag says what was held, never what it made: that is the reveal's line. */
export function positionTag(screen: ChartDecisionScreen, choice: DecisionButton | null): string {
  if (!choice || DIRECTION[choice] === 0) return 'no position';
  return `${DIRECTION[choice] > 0 ? 'long' : 'short'} ${shares(screen.shares)}`;
}
