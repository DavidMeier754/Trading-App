import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { fitScale, fitTop, useFit } from '../lesson/fitState';

/**
 * Snapping a chart's price gridlines onto the backdrop's grid (Backdrop.tsx).
 *
 * The backdrop draws a line every GRID points from the top of the *frame*, so a
 * chart can only line up with it if it knows how far down the frame it sits.
 * That distance is not knowable statically — every screen centres its content,
 * so the chart's y depends on how tall the copy above it happens to be — which
 * is why it is measured.
 *
 * Two things this gets right that the first version did not:
 *
 * 1. **The origin is the frame, not the window.** `measureInWindow` answers in
 *    window coordinates. Those only equal frame coordinates while the frame
 *    happens to start at the top of the window, which is true today and is not
 *    a property anyone declared. The frame publishes its own y here and every
 *    chart subtracts it.
 * 2. **Height counts as a resize.** The old measure re-ran on width and on the
 *    decision phase. A window that only got shorter moved every centred screen
 *    vertically without either changing, so the anchor went stale and the chart
 *    drifted off the grid until something else happened to re-measure.
 */
const GridOriginContext = createContext(0);

export function GridOriginProvider({
  originY,
  children,
}: {
  originY: number;
  children: React.ReactNode;
}) {
  return <GridOriginContext.Provider value={originY}>{children}</GridOriginContext.Provider>;
}

export function useGridOrigin(): number {
  return useContext(GridOriginContext);
}

/**
 * Spread the result onto the `View` that wraps a chart:
 *
 *   const grid = useGridAnchor(phase);
 *   <View ref={grid.ref} onLayout={grid.onLayout}>
 *     <Chart gridAnchor={grid.gridAnchor} … />
 *
 * `token` is anything that moves the chart without resizing the window — a
 * `chart-decision` growing its outcome card, a replay counting up its bar.
 */
export function useGridAnchor(token?: unknown): {
  ref: React.RefObject<View | null>;
  onLayout: () => void;
  gridAnchor: number | undefined;
  /** The same measurement in window coordinates, for turning a touch's `pageY`
   *  into a position inside the chart (`toLocalY`). */
  windowY: number | undefined;
  /** A touch's `pageY` as a y inside the chart, scale undone. */
  toLocalY: (pageY: number) => number | undefined;
} {
  const originY = useGridOrigin();
  const { settled } = useFit();
  const { width, height } = useWindowDimensions();
  const ref = useRef<View | null>(null);
  const [windowY, setWindowY] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((_x, measured) => {
      if (!Number.isFinite(measured)) return;
      // A screen too tall for its window is drawn scaled down about the top of
      // the content area (lesson/fit.tsx), and a measurement sees the scaled
      // position. The grid is scaled about the same point, so the snap is
      // worked out where both are unscaled: undo the scale, snap there.
      const s = fitScale.get();
      const top = originY + fitTop.get();
      const unscaled = s === 1 ? measured : top + (measured - top) / s;
      // Readings at rest agree to the hundredth, so anything past that is a
      // real move. The old half-point dead band let a first reading taken
      // mid-transition (a third of a point off) stand for good.
      setWindowY((prev) =>
        prev !== undefined && Math.abs(prev - unscaled) < 0.05 ? prev : unscaled,
      );
      setScale((prev) => (Math.abs(prev - s) < 1e-3 ? prev : s));
    });
  }, [originY]);

  useEffect(() => {
    measure();
    // Panels below the chart — the inline reveal, the outcome card — mount in
    // response to the same change and shift it once more, so take a second
    // reading once the layout has settled.
    const settle = setTimeout(measure, 160);
    // And once more after the screen transition has finished moving: the new
    // look brings a screen up from 96.5% scale, and a reading taken while it
    // is still scaled lands the chart a fraction of a point off the grid.
    const rest = setTimeout(measure, 720);
    // That arrival is a spring, and a spring's `duration` is how long it looks
    // like it takes, not how long it runs: its last fraction of a percent is
    // still moving at 720 ms, a quarter of a point on a chart near the bottom.
    const still = setTimeout(measure, 1400);
    return () => {
      clearTimeout(settle);
      clearTimeout(rest);
      clearTimeout(still);
    };
  }, [measure, width, height, token, settled]);

  const toLocalY = useCallback(
    (pageY: number) => {
      if (windowY === undefined || !Number.isFinite(pageY)) return undefined;
      // `windowY` is unscaled; the touch is where the scaled chart was drawn.
      const top = originY + fitTop.get();
      const drawnAt = top + (windowY - top) * scale;
      return (pageY - drawnAt) / scale;
    },
    [windowY, originY, scale],
  );

  return {
    ref,
    onLayout: measure,
    gridAnchor: windowY === undefined ? undefined : windowY - originY,
    windowY,
    toLocalY,
  };
}
