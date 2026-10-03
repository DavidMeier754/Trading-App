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
 * docs/UI.md §2 [DESIGN-REVIEW] (David: "make sure the whole screen is
 * filled"): a chart decision reports where its chart ends once the call is
 * made, and its reveal fills the room from there down to the key.
 */
export const DecisionSpace = createContext<(bottom: number | null) => void>(() => {});
