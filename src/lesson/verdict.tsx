import React, { useContext } from 'react';

import type { Grade } from './answers';

/**
 * The verdict on the screen being shown, for the surfaces that react to it.
 *
 * An answer surface knows its own tone -- green, red -- but not whether the
 * learner *got* it: after a wrong pick the right option turns green as well,
 * and ringing a celebration around that one would congratulate the learner for
 * the answer they did not give. The screen's grade settles it, and it lives in
 * the player, so it is handed down rather than threaded through thirty screens.
 */
export type Verdict = {
  grade: Grade;
  streak: number;
  /**
   * docs/UI.md §5.1 [DESIGN-REVIEW] "The answer turns over": the lesson's
   * last question, where the chosen answer turns over to its verdict. Not on
   * every answer (David).
   */
  big?: boolean;
} | null;

const VerdictContext = React.createContext<Verdict>(null);

export const VerdictProvider = VerdictContext.Provider;

export function useVerdict(): Verdict {
  return useContext(VerdictContext);
}
