import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useGridOrigin } from '../components/gridAlign';
import { CHART_GRID_STEP } from '../theme';
import { FitContext, fitScale, fitTop, useFit } from './fitState';
import { EASE_IN_OUT, EASE_OUT } from './motion';
import { useReduceMotion } from './useReduceMotion';

/**
 * docs/UI.md §2: one screen, one screenful -- and on a small phone, a scroll
 * rather than illegible type.
 *
 * Content is authored to fit, and the charts -- the one part of a screen whose
 * size is free -- pick their height from the room they are given
 * (`useChartGaps`). What is left is the case no authoring can rule out: a short
 * window, a long reveal, type past 130% (§10). The screen first steps back, the
 * way a camera pulls back to get everything in frame: it scales down about its
 * top edge, eased, but only to 85 % (MIN_SCALE). Below that the words got too
 * small to read (at 60 % body text was 9-10 px on a 320 pt phone), so a screen
 * that still does not fit keeps that scale and scrolls above the fixed key.
 *
 * A screen sits in the middle of the area (David, 2026-09-30: "the page
 * content in the middle of the screen, not at the top or bottom"), and higher
 * only where it must be to stay clear of the strip kept free for the reveal at
 * the bottom of the area, with the key under that (`Centre` below). The strip
 * is kept from the first frame, so the reveal rises into space that was
 * already free and never covers what it grades; on a screen that scrolls, the
 * strip is the end of the scroll, and the screen scrolls to it when the reveal
 * arrives.
 *
 * The backdrop grid pulls back with the screen (components/Backdrop.tsx), about
 * the same point, so a chart that sat on the grid still does. Both read the two
 * values in fitState.ts on the UI thread; nothing re-renders while it scales.
 */

/** The smallest a screen is drawn; past this it scrolls instead. */
export const MIN_SCALE = 0.85;
const FIT_MS = 420;
const OVERFLOW_SLACK = 12;
/** After this long a screen's layout has settled and its scale only gives. */
const LOCK_MS = 600;

/**
 * The lesson's content area.
 *
 * `center` (every screen but one): the screen is centred in the area and kept
 * clear of the reveal's strip (`Centre`). `fill`: the screen takes the whole
 * area and places its own content (chart-decision, which holds its chart on the
 * backdrop grid).
 */
export function FitScreen({
  children,
  contentStyle,
  bottomPad,
  anchor = 'center',
  reserve = 0,
  revealed = false,
}: {
  children: React.ReactNode;
  contentStyle: StyleProp<ViewStyle>;
  /** The content style's bottom padding, which is not the screen's to use. */
  bottomPad: number;
  anchor?: 'center' | 'fill';
  /** Room kept free under the content for what arrives there later: a reveal. */
  reserve?: number;
  /** The reveal is up: a screen that scrolls brings its strip into view. */
  revealed?: boolean;
}) {
  const reduced = useReduceMotion();
  const originY = useGridOrigin();
  const scroll = useRef<ScrollView | null>(null);
  const [view, setView] = useState(0);
  // The content's own height as laid out (before the scale): the screen and
  // the content style's bottom padding.
  const [laid, setLaid] = useState(0);
  const [settled, setSettled] = useState(0);

  // An overflow smaller than the bottom padding only eats into the padding;
  // scaling a whole screen by 0.998 for it would just soften every edge.
  const slack = Math.min(OVERFLOW_SLACK, bottomPad);
  const room = view > 0 ? view - bottomPad : undefined;
  // What the screen itself may take: the area less the reveal's strip.
  const space = room === undefined ? 0 : room - (anchor === 'center' ? reserve : 0);
  const natural = anchor === 'center' ? laid - bottomPad : laid;
  const limit = anchor === 'center' ? space : view;

  let target = 1;
  if (view > 0 && natural > 0 && natural > limit + slack) {
    target = Math.max(MIN_SCALE, Math.min(1, (limit + slack) / natural));
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

  // Past the smallest scale the screen is still too tall: it scrolls.
  const scrolls = view > 0 && natural * target > limit + slack + 0.5;

  useEffect(() => {
    const done = () => setSettled((n) => n + 1);
    fitScale.set(
      withTiming(target, { duration: reduced ? 0 : FIT_MS, easing: EASE_IN_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(done);
      }),
    );
  }, [target, reduced]);

  // docs/UI.md §2: the reveal gets its slot before it appears, and a screen
  // that scrolls is brought to it, so the key never covers the result.
  useEffect(() => {
    if (!revealed || !scrolls) return;
    const id = setTimeout(() => scroll.current?.scrollToEnd({ animated: !reduced }), 60);
    return () => clearTimeout(id);
  }, [revealed, scrolls, reduced]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      setView(e.nativeEvent.layout.height);
      // Where the area starts in the frame, for the backdrop to scale about.
      (scroll.current as unknown as View | null)?.measureInWindow?.((_x, y) => {
        if (Number.isFinite(y)) fitTop.set(y - originY);
      });
    },
    [originY],
  );

  const style = useAnimatedStyle(() => ({ transform: [{ scale: fitScale.get() }] }));
  // A scale leaves the layout box at full size; take back what it no longer
  // draws, so a scaled screen ends where it is drawn and the scroll, if any,
  // ends at the reveal's strip instead of in empty space.
  const giveBack = laid > 0 ? -(1 - target) * laid : 0;
  // Held steady across content size changes, which can come every frame while
  // something folds; the screens reading it only care about room and settling.
  const fitValue = useMemo(() => ({ room, settled }), [room, settled]);
  // Charts snap to the backdrop grid by measuring where they are (gridAlign);
  // a scroll moves them, so it is a reason to measure again.
  const onScrollEnd = useCallback(() => setSettled((n) => n + 1), []);
  // And so is a move the content made to keep clear of the strip (Centre).
  const onMoved = onScrollEnd;

  return (
    <ScrollView
      ref={scroll}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEnabled={scrolls}
      showsVerticalScrollIndicator={scrolls}
      bounces={false}
      onLayout={onLayout}
      scrollEventThrottle={16}
      onScroll={(e) => {
        // A focused field or a find-in-page can still move a scroll box that
        // the finger cannot; put it straight back.
        if (!scrolls && e.nativeEvent.contentOffset.y !== 0) {
          scroll.current?.scrollTo({ y: 0, animated: false });
        }
      }}
      onMomentumScrollEnd={onScrollEnd}
      onScrollEndDrag={onScrollEnd}
    >
      <Animated.View
        style={[
          anchor === 'fill' ? styles.grow : null,
          styles.origin,
          contentStyle,
          { marginBottom: giveBack },
          style,
        ]}
        onLayout={(e) => setLaid(e.nativeEvent.layout.height)}
      >
        <FitContext.Provider value={fitValue}>
          {anchor === 'fill' ? (
            children
          ) : (
            // Centred in the whole area, clear of the strip, at the scale drawn.
            <Centre
              area={space > 0 ? space / target : 0}
              strip={reserve / target}
              onMoved={onMoved}
            >
              {children}
            </Centre>
          )}
        </FitContext.Provider>
      </Animated.View>
      {anchor === 'center' && reserve > 0 ? <View style={{ height: reserve }} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
  origin: { transformOrigin: 'top' },
});

/** How long a forced move of settled content takes to glide into place. */
const SHIFT_MS = 280;

/**
 * docs/UI.md §2: a screen arrives in the middle of its area, and then holds
 * still -- nothing on a screen moves unless the learner moved it.
 *
 * The middle is the whole area's, the reveal's strip included, so a screen
 * with room to spare sits where the eye expects it. Content that would reach
 * the strip from there rests on it instead, ending where the strip begins.
 * Both are plain flexbox (centred, or at the end above a padding as tall as
 * the strip), which Yoga and the web lay out alike; only the choice between
 * them is made here, from the content's height.
 *
 * Centring is what makes things jump: a carousel card a line longer than the
 * one before, a hint that goes away, and centred content answers every change
 * in height by sliding half of it. So the centring lasts until the screen has
 * settled (LOCK_MS); from then on the content keeps the top it had. It moves
 * again only when what is below it would otherwise run into the reveal's strip,
 * and then by exactly that much, laid out at once (so the charts measure the new
 * place) and drawn gliding from the old place (FLIP).
 */
function Centre({
  area,
  strip,
  onMoved,
  children,
}: {
  /** The room the content may take: the area less the reveal's strip, as laid out. */
  area: number;
  /** The reveal's strip under that room, as laid out. */
  strip: number;
  /** A settled screen moved; charts measure again (gridAlign). */
  onMoved: () => void;
  children: React.ReactNode;
}) {
  const reduced = useReduceMotion();
  // Where the content sat when it locked; null while it is still centring.
  const [lockedTop, setLockedTop] = useState<number | null>(null);
  const [own, setOwn] = useState(0);
  // The two heights as last laid out, and the strip, for the lock to work out
  // where the content sits. Not the content's own y: on the web a layout event
  // only comes with a change of size, so a y can be stale.
  const heights = useRef({ box: 0, own: 0, strip: 0 });
  useEffect(() => {
    heights.current.strip = strip;
  }, [strip]);
  useEffect(() => {
    const t = setTimeout(
      () =>
        setLockedTop((prev) => {
          if (prev !== null) return prev;
          const { box, own: height, strip: under } = heights.current;
          return Math.max(0, Math.min((box - height) / 2, box - under - height));
        }),
      LOCK_MS,
    );
    return () => clearTimeout(t);
  }, []);
  const top = lockedTop === null ? null : Math.max(0, Math.min(lockedTop, area - own));
  // The content rests on the strip when, centred, it would reach into it.
  const rests = own > area - strip;

  const shift = useSharedValue(0);
  const drawnTop = useRef<number | null>(null);
  useLayoutEffect(() => {
    const before = drawnTop.current;
    drawnTop.current = top;
    if (top === null || before === null || before === top) return;
    if (reduced) {
      onMoved();
      return;
    }
    shift.set(before - top);
    shift.set(
      withTiming(0, { duration: SHIFT_MS, easing: EASE_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(onMoved);
      }),
    );
  }, [top, reduced, shift, onMoved]);
  const shiftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: shift.get() }] }));

  return (
    // The same two views before and after the lock, only restyled: swapping the
    // tree would remount the screen under the tap that caused the change. The
    // box reaches down over the strip, which its negative margin gives back, so
    // it lays out no taller than the area or the content, whichever is taller.
    <View
      style={[
        { minHeight: area + strip, marginBottom: -strip },
        top !== null
          ? { justifyContent: 'flex-start', paddingBottom: strip }
          : rests
            ? { justifyContent: 'flex-end', paddingBottom: strip }
            : { justifyContent: 'center', paddingVertical: strip / 2 },
      ]}
      onLayout={(e) => {
        heights.current.box = e.nativeEvent.layout.height;
      }}
    >
      <Animated.View
        style={[top === null ? null : { marginTop: top }, shiftStyle]}
        onLayout={(e) => {
          heights.current.own = e.nativeEvent.layout.height;
          setOwn(e.nativeEvent.layout.height);
        }}
      >
        {children}
      </Animated.View>
    </View>
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
    [decide],
  );

  return { gaps, onLayout };
}

export const MIN_GAPS = 2;
export const MAX_GAPS = 5;

/** What a reveal adds below the content, give or take its length. */
export const REVEAL_GROWTH = 132;
