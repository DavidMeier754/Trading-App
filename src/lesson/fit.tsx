import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useGridOrigin } from '../components/gridAlign';
import { CHART_GRID_STEP } from '../theme';
import { FitContext, fitScale, fitTop, useFit } from './fitState';
import { EASE_IN_OUT, EASE_OUT } from './motion';
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
  anchor = 'center',
  reserve = 0,
}: {
  children: React.ReactNode;
  contentStyle: StyleProp<ViewStyle>;
  /** The content style's bottom padding, which is not the screen's to use. */
  bottomPad: number;
  /**
   * `center`: the screen is laid out at its natural height and placed by
   * `Anchor` below. `fill`: the screen takes the whole area and places its own
   * content (chart-decision, which holds its chart on the backdrop grid).
   */
  anchor?: 'center' | 'fill';
  /** Room kept free under the content for what arrives there later: a reveal. */
  reserve?: number;
}) {
  const reduced = useReduceMotion();
  const originY = useGridOrigin();
  const scroll = useRef<ScrollView | null>(null);
  const [view, setView] = useState(0);
  const [content, setContent] = useState(0);
  const [natural, setNatural] = useState(0);
  const [settled, setSettled] = useState(0);

  // An overflow smaller than the bottom padding only eats into the padding;
  // scaling a whole screen by 0.998 for it would just soften every edge.
  const slack = Math.min(OVERFLOW_SLACK, bottomPad);
  let target = 1;
  if (anchor === 'center') {
    // The screen's own height against the area less what is reserved under it
    // for the reveal: a question screen too tall for both is scaled once, as it
    // arrives, to the size it will still have once the reveal is up -- so
    // `Check` changes nothing about it.
    const area = view - bottomPad;
    if (view > 0 && natural > 0 && natural + reserve > area + slack) {
      target = Math.max(MIN_SCALE, Math.min(1, (area - reserve + slack) / natural));
    }
  } else if (view > 0 && content > view + slack) {
    target = Math.max(MIN_SCALE, view / content);
  }
  // Once the screen has settled its scale only ever gives: content that gets
  // shorter under a reveal (buttons swapped for a line) must not grow the whole
  // screen back, which moves every word on it.
  const [held, setHeld] = useState<number | null>(null);
  const current = useRef(target);
  current.current = target;
  useEffect(() => {
    const t = setTimeout(() => setHeld((h) => h ?? current.current), LOCK_MS);
    return () => clearTimeout(t);
  }, []);
  if (held !== null) target = Math.min(target, held);
  useEffect(() => {
    if (held !== null && target < held) setHeld(target);
  }, [held, target]);

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
  // Held steady across content size changes, which can come every frame while
  // something folds; the screens reading it only care about room and settling.
  const room = view > 0 ? view - bottomPad : undefined;
  const fitValue = useMemo(() => ({ room, settled }), [room, settled]);

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
        <FitContext.Provider value={fitValue}>
          {anchor === 'fill' ? (
            children
          ) : (
            <Anchor reserve={reserve} onHeight={setNatural}>
              {children}
            </Anchor>
          )}
        </FitContext.Provider>
      </Animated.View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Content stays where it was first drawn.
// ---------------------------------------------------------------------------

/** After this long a screen's layout has settled and its content holds still. */
const LOCK_MS = 600;
const SHIFT_MS = 280;

/**
 * docs/UI.md §2: nothing on a screen moves unless the learner moved it.
 *
 * A screen arrives centred in its area. Centring is what made things jump: the
 * area gets shorter when the reveal rises into the footer, a carousel card or a
 * walkthrough step is a line longer than the one before, a checklist's hint
 * goes away -- and centred content answers every one of those by sliding up or
 * down by half the difference. So the centring only lasts until the screen has
 * settled; from then on the content keeps the
 * top it had. It moves again only when it has to -- when what is below it would
 * otherwise run under the footer -- and then by exactly that much, eased.
 *
 * A question screen is centred in its area less the room its reveal will take
 * (`reserve`), so on most screens the reveal lands in space that was already
 * free and nothing above it moves at all. The reserve gives way first when the
 * content needs the height.
 */
function Anchor({
  children,
  reserve,
  onHeight,
}: {
  children: React.ReactNode;
  reserve: number;
  /** The content's own height, for the fit to scale by. */
  onHeight: (height: number) => void;
}) {
  const reduced = useReduceMotion();
  const parent = useFit();
  // Where the content sat when it locked; null while it is still centring.
  const [lockedTop, setLockedTop] = useState<number | null>(null);
  const [area, setArea] = useState(0);
  const [height, setHeight] = useState(0);
  const lastY = useRef<number | null>(null);
  const [shifts, setShifts] = useState(0);

  const lock = useCallback(() => {
    setLockedTop((prev) => (prev !== null || lastY.current === null ? prev : lastY.current));
  }, []);
  useEffect(() => {
    const t = setTimeout(lock, LOCK_MS);
    return () => clearTimeout(t);
  }, [lock]);

  // The reveal lies over the reserved strip at the bottom (LessonPlayer), so
  // the content keeps clear of it even after the lock.
  const top = lockedTop === null ? null : Math.max(0, Math.min(lockedTop, area - reserve - height));

  // A forced move is laid out at once -- so the fit and the charts measure the
  // new place -- and drawn from the old place to it (FLIP), so it glides.
  const shift = useSharedValue(0);
  const drawnTop = useRef<number | null>(null);
  const bump = useCallback(() => setShifts((n) => n + 1), []);
  useLayoutEffect(() => {
    const before = drawnTop.current;
    drawnTop.current = top;
    if (top === null || before === null || before === top) return;
    if (reduced) {
      bump();
      return;
    }
    shift.set(before - top);
    shift.set(
      withTiming(0, { duration: SHIFT_MS, easing: EASE_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(bump);
      })
    );
  }, [top, reduced, shift, bump]);
  const shiftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: shift.get() }] }));

  // Charts snap to the backdrop grid by measuring where they are; a move they
  // did not cause is a reason to measure again.
  const fitValue = useMemo(
    () => ({ room: parent.room, settled: parent.settled + shifts }),
    [parent.room, parent.settled, shifts]
  );

  const content = (
    <Animated.View
      style={[top === null ? null : { marginTop: top }, shiftStyle]}
      onLayout={(e) => {
        lastY.current = e.nativeEvent.layout.y;
        setHeight(e.nativeEvent.layout.height);
        onHeight(e.nativeEvent.layout.height);
      }}
    >
      {children}
    </Animated.View>
  );

  return (
    // No touch hook here: a responder-capture handler on this view swallowed
    // the first tap of some screens. The timer settles a screen well before a
    // learner has read it, and nothing the learner can do in that time moves it.
    <View style={{ flexGrow: 1 }} onLayout={(e) => setArea(e.nativeEvent.layout.height)}>
      <FitContext.Provider value={fitValue}>
        {/* The same four children before and after the lock, only resized:
            swapping the tree around the content would remount the screen, and
            the tap that caused the lock would land on a component that no
            longer exists. */}
        <View style={top === null ? styles.spacer : styles.spacerGone} />
        {content}
        <View style={top === null ? styles.spacer : styles.spacerGone} />
        <View style={top === null && reserve > 0 ? { height: reserve, flexShrink: 1 } : styles.spacerGone} />
      </FitContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  spacer: { flexGrow: 1 },
  spacerGone: { height: 0, flexGrow: 0 },
});

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
  max = MAX_GAPS,
  tolerance = 0.04,
}: {
  preferred: number;
  growth: number;
  /** Once the learner has acted the size holds; the scale covers the rest. */
  locked: boolean;
  /** The tallest plot this screen may take, in gaps. */
  max?: number;
  /** How far past the room, as a share of it, the screen may run and be scaled. */
  tolerance?: number;
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
    // percent through before giving up a gap -- and never less than the
    // overflow FitScreen lets run into the bottom padding without scaling at
    // all, which is all a screen that must not scale gets.
    let spare = room - at.height - growth + Math.max(room * tolerance, OVERFLOW_SLACK);
    let next = at.gaps;
    while (spare < 0 && next > MIN_GAPS) {
      next -= 1;
      spare += CHART_GRID_STEP;
    }
    while (spare >= CHART_GRID_STEP && next < max) {
      next += 1;
      spare -= CHART_GRID_STEP;
    }
    setGaps(next);
  }, [locked, room, growth, max, tolerance]);

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
