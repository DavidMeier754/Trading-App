import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useWindowDimensions, View } from 'react-native';

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
  return (
    <GridOriginContext.Provider value={originY}>{children}</GridOriginContext.Provider>
  );
}

export function useGridOrigin(): number {
  return useContext(GridOriginContext);
}

/**
 * Ask every mounted chart to re-measure.
 *
 * For the movements no dependency can see: a screen that overflows and is
 * scrolled (docs/UI.md §10's fallback), where the chart travels under a
 * backdrop that stays put. Called on scroll end rather than per frame — a
 * measurement every frame is 60 state updates a second to chase something the
 * learner is actively dragging.
 */
const nudgeListeners = new Set<() => void>();

export function nudgeGrid(): void {
  nudgeListeners.forEach((listener) => listener());
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
   *  into a position inside the chart. */
  windowY: number | undefined;
} {
  const originY = useGridOrigin();
  const { width, height } = useWindowDimensions();
  const ref = useRef<View | null>(null);
  const [windowY, setWindowY] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((_x, measured) => {
      if (!Number.isFinite(measured)) return;
      setWindowY((prev) =>
        prev !== undefined && Math.abs(prev - measured) < 0.5 ? prev : measured
      );
    });
  }, []);

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
    return () => {
      clearTimeout(settle);
      clearTimeout(rest);
    };
  }, [measure, width, height, token]);

  useEffect(() => {
    nudgeListeners.add(measure);
    return () => {
      nudgeListeners.delete(measure);
    };
  }, [measure]);

  return {
    ref,
    onLayout: measure,
    gridAnchor: windowY === undefined ? undefined : windowY - originY,
    windowY,
  };
}
