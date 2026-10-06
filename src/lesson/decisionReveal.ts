import { count, price, signedPrice } from '../format';
import type { ChartDecisionScreen, ChartSpec, DecisionButton } from '../types';
import type { Grade } from './answers';
import { decisionButtons, gradeDecision } from './answers';
import { formatR, tradePlanOf } from './tradePlan';

/**
 * docs/ui/06-reveal-and-hearts.md §5.1b: the reveal of a `chart-decision` grades the decision and
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

/** The chip over the reveal (docs/ui/06-reveal-and-hearts.md §5.1b). */
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

/**
 * docs/ui/06-reveal-and-hearts.md §5.1b, "Right call, losing trade". No rate (David, 2026-10-03):
 * the app never says how often a setup wins or loses (docs/rules/07-variance-and-typed-numbers.md §3.11).
 * The "Why?" link follows in stage VARIANCE.
 */
export const VARIANCE_LINE =
  'Right call — this trade lost anyway. One trade says little; judge the decision, not the result.';

/**
 * Where a reveal's dot lands on the decision grid (docs/ui/06-reveal-and-hearts.md §5.1b): the
 * decision's row, the result's column. An amber call sits on the line between
 * the rows, an even result on the line between the columns, and standing
 * aside draws the dot hollow, in the cell of what would have happened.
 */
export type GridCell = {
  row: 'right' | 'wrong' | 'between';
  col: 'won' | 'lost' | 'between';
  hollow: boolean;
};

export type ResultTone = 'up' | 'down' | 'flat' | 'hypothetical';

/**
 * One row of the trade log (docs/ui/06-reveal-and-hearts.md §5.1b, Precise's log from LOOK-BRIEF):
 * a name on the left, its value on the right in the number face.
 */
export type LogRow = { label: string; value: string; tone: ResultTone | 'plain' };

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
  /** The result in R, when the file has a plan and the trade is its trade (tradePlan.ts). */
  r?: number;
  /** The dot on the decision grid. */
  cell: GridCell;
  /** The trade log under the outcome sentence: how it ended, the result, and R once taught. */
  log: LogRow[];
};

function close(spec: ChartSpec, index: number): number {
  const data = spec.data as (number | number[])[];
  const bar = data[Math.max(0, Math.min(index, data.length - 1))];
  return Array.isArray(bar) ? bar[3] : bar;
}

/**
 * How far the price went from the decision to where the trade ended: the
 * first of stop or target the bars touched when the file has both
 * (docs/ui/08-quotes-and-charts.md §6.4), else the last bar.
 */
export function decisionMove(screen: ChartDecisionScreen): number {
  const plan = tradePlanOf(screen);
  if (plan) return plan.exit.price - plan.entry;
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
  {
    showR = false,
  }: {
    /** The learner has been taught R (skills.ts, knowsR): the result line says it in R too. */
    showR?: boolean;
  } = {},
): DecisionReveal {
  const move = decisionMove(screen);
  const plan = tradePlanOf(screen);
  const direction = DIRECTION[choice];
  const stoodAside = direction === 0;
  const best = DECISION_LABEL[screen.best] ?? screen.best;

  // The first line always speaks to the option pressed (docs/ui/06-reveal-and-hearts.md §5.1b):
  // "… costs nothing" only ever to someone who stood aside. Short enough for
  // one line on most phones (DESIGN-REVIEW), so the chart keeps the room.
  let lead: string;
  if (grade === 'correct') lead = `${DOING[choice]} was the right call.`;
  else if (grade === 'amber')
    lead = stoodAside
      ? `${DOING[choice]} costs nothing. ${best} was better.`
      : `${DOING[choice]} was fair. ${best} was better.`;
  else lead = `${DOING[choice]} was not the call. ${best} was better.`;

  let pnl: number;
  let result: string;
  let tone: ResultTone;
  let r: number | undefined;
  let resultLabel = 'Result';
  let resultValue: string;
  if (!stoodAside) {
    pnl = cents(direction * move * screen.shares);
    // The R of the file's plan is this trade's only if it faced the same way.
    r = plan && plan.dir === direction ? plan.exit.r : undefined;
    result = `${signedPrice(pnl)} on ${shares(screen.shares)}`;
    resultValue = result;
    tone = pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'flat';
  } else {
    const other = tradeNotTaken(screen);
    pnl = other ? cents(DIRECTION[other] * move * screen.shares) : 0;
    r = plan && other && DIRECTION[other] === plan.dir ? plan.exit.r : undefined;
    result = other
      ? `${HAD_YOU[other]}: ${signedPrice(pnl)} on ${shares(screen.shares)}`
      : `The price moved ${signedPrice(cents(move))} per share`;
    resultLabel = other ? HAD_YOU[other] : 'The price moved';
    resultValue = other
      ? `${signedPrice(pnl)} on ${shares(screen.shares)}`
      : `${signedPrice(cents(move))} per share`;
    tone = 'hypothetical';
  }
  if (showR && r !== undefined) result = `${result} · ${formatR(r)}`;

  // The log: how the trade ended, what it made, and in R once R is taught.
  const log: LogRow[] = [];
  const exitPrice = plan ? plan.exit.price : close(screen.chart, screen.chart.data.length - 1);
  let ended: string;
  if (stoodAside) ended = 'Stood aside';
  else if (plan && plan.dir === direction && plan.exit.reason === 'target')
    ended = `Target hit at ${price(exitPrice)}`;
  else if (plan && plan.dir === direction && plan.exit.reason === 'stop')
    ended = `Stopped out at ${price(exitPrice)}`;
  else ended = `Closed at ${price(exitPrice)}`;
  log.push({ label: 'Outcome', value: ended, tone: 'plain' });
  log.push({ label: resultLabel, value: resultValue, tone });
  if (showR && r !== undefined) {
    log.push({
      label: 'In R',
      value: formatR(r),
      tone: stoodAside ? 'hypothetical' : r > 0 ? 'up' : r < 0 ? 'down' : 'flat',
    });
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
    r,
    cell: {
      row: grade === 'correct' ? 'right' : grade === 'wrong' ? 'wrong' : 'between',
      col: pnl > 0 ? 'won' : pnl < 0 ? 'lost' : 'between',
      hollow: stoodAside,
    },
    log,
  };
}

/** What a screen reader hears, in docs/ui/06-reveal-and-hearts.md §5.1b's order: the grade, the outcome sentence, the result line. */
export function decisionRevealLabel(r: DecisionReveal, explanation: string): string {
  return [`${r.chip}.`, r.lead, r.outcome, `${r.result}.`, r.variance, explanation]
    .filter(Boolean)
    .join(' ');
}

/**
 * The tallest reveal this screen can get, whichever button is pressed: what
 * the screen keeps room for before the answer (Reveal.tsx, RevealProbe).
 */
export function longestDecisionReveal(
  screen: ChartDecisionScreen,
  opts: { showR?: boolean } = {},
): DecisionReveal {
  // A log row is a line of its own, worth about a line of lead.
  const size = (r: DecisionReveal) => r.lead.length + r.log.length * 60 + (r.variance?.length ?? 0);
  return decisionButtons(screen)
    .map((b) => decisionReveal(screen, b, undefined, opts))
    .reduce((a, b) => (size(b) > size(a) ? b : a));
}

/** The chart's outcome tag says what was held, never what it made: that is the reveal's line. */
export function positionTag(screen: ChartDecisionScreen, choice: DecisionButton | null): string {
  if (!choice || DIRECTION[choice] === 0) return 'no position';
  return `${DIRECTION[choice] > 0 ? 'long' : 'short'} ${shares(screen.shares)}`;
}
