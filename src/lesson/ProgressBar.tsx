import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';
import { LookSpec, useLookSpec } from './look';
import { EASE_IN_OUT, EASE_OUT, useMotion } from './motion';

/**
 * docs/UI.md §2 — screens completed in this sub-level.
 *
 * The bar belongs to the look it sits in (lesson/look.ts), because it is the
 * one piece of chrome on every screen:
 *
 * - `tape` (Neo): the app's own language -- a thin segmented tape, one cell per
 *   screen like the grid's cells and the chart's bars, square-cornered, with a
 *   lit leading edge. It fills on a clean ease-out; a data readout does not
 *   bounce. A run of three turns it gold.
 * - `bead` (Neo Mono): a hairline with a bead of light at its head, which
 *   breathes while it waits and flares on every advance.
 * - `bold` (Classic Contrast): a tall outlined bar notched per screen.
 *
 * Every variant animates a width, an offset or an opacity on the UI thread;
 * the widths are on absolutely positioned elements that lay out nothing else.
 */
export default function ProgressBar({
  progress,
  steps,
  hot = false,
}: {
  progress: number;
  /** Screens in the lesson: the segmented variants draw one cell each. */
  steps: number;
  hot?: boolean;
}) {
  const spec = useLookSpec();
  const target = Math.max(0, Math.min(1, progress));
  const n = Math.max(1, steps);
  switch (spec.progress) {
    case 'bead':
      return <Bead target={target} hot={hot} spec={spec} />;
    case 'bold':
      return <Bold target={target} steps={n} hot={hot} spec={spec} />;
    default:
      return <Tape target={target} steps={n} hot={hot} spec={spec} />;
  }
}

/** A fill fraction that eases to each new value. */
function useFill(target: number, duration = 560) {
  const m = useMotion();
  const p = useSharedValue(target);
  useEffect(() => {
    p.set(withTiming(target, { duration: m.reduced ? 140 : duration, easing: EASE_OUT }));
  }, [target, m.reduced, duration, p]);
  return p;
}

function useWarm(hot: boolean) {
  const warm = useSharedValue(hot ? 1 : 0);
  useEffect(() => {
    warm.set(withTiming(hot ? 1 : 0, { duration: 520, easing: EASE_OUT }));
  }, [hot, warm]);
  return warm;
}

function useTrackWidth() {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  return { w, onLayout };
}

// ---------------------------------------------------------------------------
// Neo: the segmented tape
// ---------------------------------------------------------------------------

const TAPE_H = 6;
const TAPE_GAP = 2;

function Tape({
  target,
  steps,
  hot,
  spec,
}: {
  target: number;
  steps: number;
  hot: boolean;
  spec: LookSpec;
}) {
  const p = useFill(target);
  const warm = useWarm(hot);
  // Read here, not in a worklet: on a phone a worklet keeps the copy of
  // `colors` it got first, and a change of theme would never reach it.
  const warning = colors.warning;
  const { w, onLayout } = useTrackWidth();
  // Very long lessons would make cells thinner than their gaps; past that the
  // tape is one run, like the classic bar.
  const cells = steps <= 40 ? steps : 1;

  const clip = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  const cellColor = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(warm.get(), [0, 1], [spec.accent, warning]),
  }));
  const cap = useAnimatedStyle(() => ({
    opacity: p.get() > 0.001 && p.get() < 0.999 ? 1 : 0,
    transform: [{ translateX: w * p.get() - 1.5 }],
  }));

  const row = (lit: boolean) => (
    <View style={[styles.tapeRow, { width: w }]}>
      {Array.from({ length: cells }, (_, i) =>
        lit ? (
          <Animated.View key={i} style={[styles.tapeCell, cellColor]} />
        ) : (
          <View key={i} style={[styles.tapeCell, { backgroundColor: spec.track }]} />
        ),
      )}
    </View>
  );

  return (
    <View style={styles.tapeTrack} onLayout={onLayout} accessibilityRole="progressbar">
      {w > 0 ? row(false) : null}
      <Animated.View style={[styles.tapeClip, clip]}>{w > 0 ? row(true) : null}</Animated.View>
      {/* The leading edge, lit: where the lesson is right now. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.tapeCap, { backgroundColor: spec.spark, shadowColor: spec.spark }, cap]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Neo Mono: a hairline with a bead of light
// ---------------------------------------------------------------------------

const BEAD = 8;

function Bead({ target, hot, spec }: { target: number; hot: boolean; spec: LookSpec }) {
  const m = useMotion();
  const p = useFill(target, 620);
  const warm = useWarm(hot);
  const warning = colors.warning; // read here, as in Tape
  const breathe = useSharedValue(0);
  const flare = useSharedValue(0);
  const last = useRef(target);
  const { w, onLayout } = useTrackWidth();

  useEffect(() => {
    if (m.reduced) {
      breathe.set(0);
      return;
    }
    breathe.set(withRepeat(withTiming(1, { duration: 1400, easing: EASE_IN_OUT }), -1, true));
  }, [m.reduced, breathe]);

  useEffect(() => {
    if (!m.reduced && target > last.current + 1e-6) {
      flare.set(1);
      flare.set(withTiming(0, { duration: 700, easing: EASE_OUT }));
    }
    last.current = target;
  }, [target, m.reduced, flare]);

  const lit = useAnimatedStyle(() => ({
    width: `${p.get() * 100}%`,
    backgroundColor: interpolateColor(warm.get(), [0, 1], [spec.accent, warning]),
  }));
  const bead = useAnimatedStyle(() => {
    const k = 1 + 0.18 * breathe.get() + 0.7 * flare.get();
    return {
      opacity: p.get() > 0.001 ? 1 : 0,
      backgroundColor: interpolateColor(warm.get(), [0, 1], [spec.spark, warning]),
      shadowOpacity: 0.55 + 0.35 * breathe.get() + 0.4 * flare.get(),
      transform: [{ translateX: w * p.get() - BEAD / 2 }, { scale: k }],
    };
  });

  return (
    <View style={styles.beadTrack} onLayout={onLayout} accessibilityRole="progressbar">
      <View style={[styles.beadLine, { backgroundColor: spec.track }]} />
      <Animated.View style={[styles.beadLit, lit]} />
      <Animated.View
        pointerEvents="none"
        style={[styles.beadDot, { shadowColor: spec.spark }, bead]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Classic Contrast: a bold, notched bar
// ---------------------------------------------------------------------------

const BOLD_H = 12;

function Bold({
  target,
  steps,
  hot,
  spec,
}: {
  target: number;
  steps: number;
  hot: boolean;
  spec: LookSpec;
}) {
  const p = useFill(target, 420);
  const { w, onLayout } = useTrackWidth();
  const fill = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  const notches = steps <= 40 && w > 0 ? steps - 1 : 0;
  return (
    <View
      style={[styles.boldTrack, { borderColor: spec.surface.border, backgroundColor: spec.track }]}
      onLayout={onLayout}
      accessibilityRole="progressbar"
    >
      <Animated.View
        style={[styles.boldFill, { backgroundColor: hot ? colors.warning : spec.accent }, fill]}
      />
      {Array.from({ length: notches }, (_, i) => (
        <View
          key={i}
          style={[
            styles.boldNotch,
            { left: ((i + 1) / steps) * (w - 3), backgroundColor: spec.ground.color },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // tape
  tapeTrack: { flex: 1, height: TAPE_H, justifyContent: 'center' },
  tapeRow: { flexDirection: 'row', gap: TAPE_GAP, height: TAPE_H },
  tapeCell: { flex: 1, height: TAPE_H, borderRadius: 1 },
  tapeClip: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  tapeCap: {
    position: 'absolute',
    left: 0,
    top: -3,
    width: 3,
    height: TAPE_H + 6,
    borderRadius: 1.5,
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  // bead
  beadTrack: { flex: 1, height: BEAD + 8, justifyContent: 'center' },
  beadLine: { height: 2, borderRadius: 1 },
  beadLit: { position: 'absolute', left: 0, height: 2, borderRadius: 1 },
  beadDot: {
    position: 'absolute',
    left: 0,
    width: BEAD,
    height: BEAD,
    borderRadius: BEAD / 2,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  // bold
  boldTrack: {
    flex: 1,
    height: BOLD_H,
    borderRadius: 3,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  boldFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  boldNotch: { position: 'absolute', top: 0, bottom: 0, width: 1.5 },
});
