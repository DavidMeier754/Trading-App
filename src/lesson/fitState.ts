import { createContext, useContext } from 'react';
import { makeMutable } from 'react-native-reanimated';

/**
 * What the content area (lesson/fit.tsx) tells the rest of the app about the
 * screen in it. Kept apart from the component so the grid code can read it
 * without importing the player.
 */

/** How far the screen is drawn scaled down: 1 when it fits. */
export const fitScale = makeMutable(1);
/** The frame y the screen scales about: the top of the content area. */
export const fitTop = makeMutable(0);

export type Fit = {
  /** The height a screen's own content has, below the top bar and above the
   *  footer. Undefined until measured. */
  room: number | undefined;
  /** Bumped each time the scale comes to rest, for anything that measures. */
  settled: number;
};

export const FitContext = createContext<Fit>({ room: undefined, settled: 0 });

export function useFit(): Fit {
  return useContext(FitContext);
}
