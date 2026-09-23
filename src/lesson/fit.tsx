import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useGridOrigin } from '../components/gridAlign';
import { CHART_GRID_STEP } from '../theme';
import { FitContext, fitScale, fitTop, useFit } from './fitState';
import { EASE_IN_OUT } from './motion';
import { useReduceMotion } from './useReduceMotion';

/**
 * docs/UI.md §2: a screen is one screenful and never scrolls.
 *
 * Content is authored to fit, and the charts -- the one part of a screen whose
 * size is free -- pick their height from the room they are given
 * (`useChartGaps`). What is left is the case no authoring can rule out: a short
 * window, a long reveal, type past 130% (§10). The old answer was a ScrollView,
 * which put the CTA and the bottom of the screen a drag away. Now the screen
 * steps back instead: it scales down about its top edge until it fits, eased,
 * the way a camera pulls back to get everything in frame.
 *
 * The backdrop grid pulls back with it (components/Backdrop.tsx), about the same
 * point, so a chart that sat on the grid still does. Both read the two values
 * below on the UI thread; nothing re-renders while the screen scales.
 */

/** Past this the words are too small to read; the screen clips instead. */
const MIN_SCALE = 0.6;
const FIT_MS = 420;
const OVERFLOW_SLACK = 12;

/**
 * The lesson's content area. Keeps the layout a ScrollView gives -- content at
 * least as tall as the area, so a screen can centre itself, and free to be
 * taller -- but never scrolls: anything taller is scaled to fit.
 */
export function FitScreen({
  children,
  contentStyle,
  bottomPad,
}: {
  children: React.ReactNode;
  contentStyle: StyleProp<ViewStyle>;
  /** The content style's bottom padding, which is not the screen's to use. */
  bottomPad: number;
}) {
  const reduced = useReduceMotion();
  const originY = useGridOrigin();
  const scroll = useRef<ScrollView | null>(null);
  const [view, setView] = useState(0);
  const [content, setContent] = useState(0);
  const [settled, setSettled] = useState(0);

  // An overflow smaller than the bottom padding only eats into the padding;
  // scaling a whole screen by 0.998 for it would just soften every edge.
  const target =
    view > 0 && content > view + Math.min(OVERFLOW_SLACK, bottomPad)
      ? Math.max(MIN_SCALE, view / content)
      : 1;

  useEffect(() => {
    const done = () => setSettled((n) => n + 1);
    fitScale.set(
      withTiming(target, { duration: reduced ? 0 : FIT_MS, easing: EASE_IN_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(done);
      })
    );
  }, [target, reduced]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      setView(e.nativeEvent.layout.height);
      // Where the area starts in the frame, for the backdrop to scale about.
      (scroll.current as unknown as View | null)?.measureInWindow?.((_x, y) => {
        if (Number.isFinite(y)) fitTop.set(y - originY);
      });
    },
    [originY]
  );

  const style = useAnimatedStyle(() => ({ transform: [{ scale: fitScale.get() }] }));

  return (
    <ScrollView
      ref={scroll}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      onLayout={onLayout}
      onContentSizeChange={(_w, h) => setContent(h)}
      // A focused field or a find-in-page can still move a scroll box that the
      // finger cannot; put it straight back.
      scrollEventThrottle={16}
      onScroll={(e) => {
        if (e.nativeEvent.contentOffset.y !== 0) {
          scroll.current?.scrollTo({ y: 0, animated: false });
        }
      }}
    >
      <Animated.View style={[{ flexGrow: 1, transformOrigin: 'top' }, contentStyle, style]}>
        <FitContext.Provider value={{ room: view > 0 ? view - bottomPad : undefined, settled }}>
          {children}
        </FitContext.Provider>
      </Animated.View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Charts take the room that is left.
// ---------------------------------------------------------------------------

/**
 * How many grid gaps a chart's price plot gets on this screen.
 *
 * A chart is the one element whose height is free, in whole backdrop steps
 * (components/Chart.tsx, PLOT_GAPS), so it is the one that gives: tall on a
 * tall phone, shorter on a short window, and never the reason a screen has to
 * scale. `growth` is what the screen will add after the learner answers -- the
 * reveal below it, the outcome card -- so the size chosen up front still fits
 * then and the chart never changes size under the learner.
 *
 * Spread `onLayout` onto a View holding the screen's content at its natural
 * height (not one that stretches to fill).
 */
export function useChartGaps({
  preferred,
  growth,
  locked,
}: {
  preferred: number;
  growth: number;
  /** Once the learner has acted the size holds; the scale covers the rest. */
  locked: boolean;
}): { gaps: number; onLayout: (e: LayoutChangeEvent) => void } {
  const { room } = useFit();
  const [gaps, setGaps] = useState(preferred);
  // The content's height, and the gap count it was measured at: the answer is
  // worked out from that pair, so a second call before the re-render lands on
  // the same number instead of stepping twice.
  const natural = useRef<{ height: number; gaps: number } | undefined>(undefined);
  const current = useRef(gaps);
  current.current = gaps;

  const decide = useCallback(() => {
    const at = natural.current;
    if (locked || room === undefined || at === undefined) return;
    // A little scale is invisible; a chart a step shorter is not. Let a few
    // percent through before giving up a gap.
    let spare = room - at.height - growth + room * 0.04;
    let next = at.gaps;
    while (spare < 0 && next > MIN_GAPS) {
      next -= 1;
      spare += CHART_GRID_STEP;
    }
    while (spare >= CHART_GRID_STEP && next < MAX_GAPS) {
      next += 1;
      spare -= CHART_GRID_STEP;
    }
    setGaps(next);
  }, [locked, room, growth]);

  useEffect(decide, [decide]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      natural.current = { height: e.nativeEvent.layout.height, gaps: current.current };
      decide();
    },
    [decide]
  );

  return { gaps, onLayout };
}

export const MIN_GAPS = 2;
export const MAX_GAPS = 5;

/** What a reveal adds below the content, give or take its length. */
export const REVEAL_GROWTH = 132;
