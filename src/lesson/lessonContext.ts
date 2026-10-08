import { createContext, useContext } from 'react';

/**
 * Which lesson a screen is in, for the screens that care (DESIGN-REVIEW): the
 * R ruler shows once R has been taught before this lesson (skills.ts,
 * knowsR), and the term marker leaves alone the terms this lesson defines.
 * A lesson made in code -- the test bench, New designs, a practice round --
 * has no place on the path; `everything` says to show all of it.
 */
export type LessonInfo = { lessonId: string | null; everything: boolean };

export const LessonContext = createContext<LessonInfo>({ lessonId: null, everything: false });

export function useLessonInfo(): LessonInfo {
  return useContext(LessonContext);
}

/**
 * docs/ui/02-lesson-player-layout.md §2 [DESIGN-REVIEW] (David: "make sure the whole screen is
 * filled"): a chart decision reports where its chart ends once the call is
 * made, and its reveal fills the room from there down to the key.
 */
export const DecisionSpace = createContext<(bottom: number | null) => void>(() => {});

/**
 * docs/ui/08-quotes-and-charts.md §6.4a (David, 2026-10-08: with the verdict showing, the
 * "?" key's legend squeezed the chart): a chart decision whose "?" is pressed
 * after the call asks its verdict to step aside, and the legend takes its
 * place; pressed again, the verdict is back where it was.
 */
export const RevealAside = createContext<(aside: boolean) => void>(() => {});
