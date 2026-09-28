import { useCallback, useState } from 'react';

import type { Grade } from '../lesson/answers';
import { cue, matchHitFeedback, matchMissFeedback, revealFeedback } from '../lesson/feedback';
import { CHOICE, MATCH, SCENARIO } from './data';
import { SOUND } from './kit';

/**
 * The behaviour of the prototype's question screens, shared by all three
 * directions so they differ only in how they look and move. Kept deliberately
 * small: enough to click through, not a second lesson player.
 */

export function useChoice() {
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const grade: Grade | null = checked ? (sel === CHOICE.correct ? 'correct' : 'wrong') : null;
  const choose = useCallback(
    (i: number) => {
      if (!checked) setSel(i);
    },
    [checked],
  );
  const check = useCallback(() => {
    if (sel === null) return;
    setChecked(true);
    revealFeedback(sel === CHOICE.correct ? 'correct' : 'wrong');
  }, [sel]);
  return { sel, choose, checked, check, grade };
}

export function useMatch() {
  // Left index → the pair colour slot it was matched with (in order found).
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [miss, setMiss] = useState<{ l: number; r: number } | null>(null);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [checked, setChecked] = useState(false);

  const matchedRight = new Set(Object.keys(pairs).map((k) => Number(k)));
  const done = Object.keys(pairs).length === MATCH.pairs.length;

  const attempt = (l: number, r: number) => {
    // r is a position in the shuffled column; MATCH.order maps it to a pair.
    if (MATCH.order[r] === l) {
      const slot = Object.keys(pairs).length;
      setPairs((prev) => ({ ...prev, [l]: slot }));
      matchHitFeedback(slot);
    } else {
      setMiss({ l, r });
      setWrongTaps((w) => w + 1);
      matchMissFeedback();
      setTimeout(() => setMiss(null), 420);
    }
    setLeft(null);
    setRight(null);
  };

  const tapLeft = (i: number) => {
    if (pairs[i] !== undefined || checked) return;
    cue(SOUND.choose);
    if (right !== null) attempt(i, right);
    else setLeft(left === i ? null : i);
  };
  const tapRight = (j: number) => {
    if (matchedRight.has(MATCH.order[j]) || checked) return;
    cue(SOUND.choose);
    if (left !== null) attempt(left, j);
    else setRight(right === j ? null : j);
  };
  const grade: Grade | null = checked
    ? wrongTaps === 0
      ? 'correct'
      : wrongTaps === 1
        ? 'amber'
        : 'wrong'
    : null;
  const check = () => {
    setChecked(true);
    revealFeedback(wrongTaps === 0 ? 'correct' : wrongTaps === 1 ? 'amber' : 'wrong');
  };
  /** The pair slot a right-hand card belongs to, once matched. */
  const slotOfRight = (j: number): number | undefined => pairs[MATCH.order[j]];
  return {
    pairs,
    left,
    right,
    miss,
    tapLeft,
    tapRight,
    done,
    check,
    checked,
    grade,
    slotOfRight,
    wrongTaps,
  };
}

export type Side = 'long' | 'short' | 'none';

export function gradeOf(side: Side): Grade {
  if (side === SCENARIO.best) return 'correct';
  if (side === 'none') return 'amber';
  return 'wrong';
}

export function useDecision() {
  const [side, setSide] = useState<Side | null>(null);
  const [phase, setPhase] = useState<'decide' | 'playing' | 'reveal'>('decide');
  const choose = (s: Side) => {
    if (phase !== 'decide') return;
    setSide(s);
    setPhase('playing');
    cue(SOUND.commit);
  };
  const ended = useCallback(() => {
    setPhase('reveal');
    // The verdict sound belongs to the decision, and it comes once the chart
    // has come to rest, not over its movement.
    setSide((s) => {
      if (s) revealFeedback(gradeOf(s));
      return s;
    });
  }, []);
  return { side, phase, choose, ended };
}

/** The reveal copy of a decision, graded apart from its outcome (docs/UI.md §5.1b). */
export function decisionCopy(side: Side) {
  const grade = gradeOf(side);
  const chip =
    grade === 'correct' ? 'Good call' : grade === 'amber' ? 'Reasonable' : 'Not this time';
  const first =
    side === 'long'
      ? 'Buying the pullback to support, with the stop under it, is the textbook play here.'
      : side === 'short'
        ? 'Shorting into support in an uptrend fights both the trend and the level.'
        : 'Standing aside costs nothing. The pullback to support was the cleaner trade, though.';
  const outcome = 'Price bounced, stalled under the high and came back through the stop.';
  return { grade, chip, first, outcome };
}
