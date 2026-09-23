import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

import { colors } from '../theme';
import { LookSpec, tint, useLookSpec } from './look';
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
 * - `line` (Classic): one thin continuous bar, as it first shipped.
 * - `blocks` (Terminal): a block readout, ▮▮▮▯▯, with a blinking cursor where
 *   the next screen goes.
 * - `ruler` (Blueprint): a drafting rule with a tick per screen and a caret
 *   that slides along it.
 * - `chunky` (Arcade): the fat glossy bar that springs and gets a highlight
 *   sweep on every advance -- the Duolingo bar, where it belongs.
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
    case 'tape':
      return <Tape target={target} steps={n} hot={hot} spec={spec} />;
    case 'blocks':
      return <Blocks target={target} steps={n} spec={spec} />;
    case 'ruler':
      return <Ruler target={target} steps={n} spec={spec} />;
    case 'chunky':
      return <Chunky target={target} hot={hot} spec={spec} />;
    default:
      return <Plain target={target} hot={hot} spec={spec} />;
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

function Tape({ target, steps, hot, spec }: { target: number; steps: number; hot: boolean; spec: LookSpec }) {
  const p = useFill(target);
  const warm = useWarm(hot);
  const { w, onLayout } = useTrackWidth();
  // Very long lessons would make cells thinner than their gaps; past that the
  // tape is one run, like the classic bar.
  const cells = steps <= 40 ? steps : 1;

  const clip = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  const cellColor = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(warm.get(), [0, 1], [spec.accent, colors.warning]),
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
          <View key={i} style={[styles.tapeCell, styles.tapeEmpty]} />
        )
      )}
    </View>
  );

  return (
    <View style={styles.tapeTrack} onLayout={onLayout} accessibilityRole="progressbar">
      {w > 0 ? row(false) : null}
      <Animated.View style={[styles.tapeClip, clip]}>{w > 0 ? row(true) : null}</Animated.View>
      {/* The leading edge, lit: where the lesson is right now. */}
      <Animated.View pointerEvents="none" style={[styles.tapeCap, cap]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Classic: one thin bar
// ---------------------------------------------------------------------------

function Plain({ target, hot, spec }: { target: number; hot: boolean; spec: LookSpec }) {
  const p = useFill(target, 420);
  const warm = useWarm(hot);
  const fill = useAnimatedStyle(() => ({
    width: `${p.get() * 100}%`,
    backgroundColor: interpolateColor(warm.get(), [0, 1], [spec.accent, colors.warning]),
  }));
  return (
    <View style={styles.plainTrack} accessibilityRole="progressbar">
      <Animated.View style={[styles.plainFill, fill]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Terminal: a block readout with a cursor
// ---------------------------------------------------------------------------

function Blocks({ target, steps, spec }: { target: number; steps: number; spec: LookSpec }) {
  const m = useMotion();
  const cells = Math.min(steps, 30);
  const filled = Math.min(cells, Math.floor(target * cells + 1e-6));
  const blink = useSharedValue(1);

  useEffect(() => {
    if (m.reduced) {
      blink.set(1);
      return;
    }
    // A hard blink, like a text cursor: on, off, no fade between.
    blink.set(withRepeat(withTiming(0, { duration: 1060, easing: Easing.steps(2, true) }), -1, false));
  }, [m.reduced, blink]);

  const cursor = useAnimatedStyle(() => ({ opacity: blink.get() > 0.5 ? 1 : 0.15 }));

  return (
    <View style={styles.blockRow} accessibilityRole="progressbar">
      {Array.from({ length: cells }, (_, i) => {
        if (i < filled) {
          // The newest block lands with a flash of white.
          return i === filled - 1 ? (
            <Flash key={`${i}-${filled}`} color={spec.accent} />
          ) : (
            <View key={i} style={[styles.block, { backgroundColor: spec.accent }]} />
          );
        }
        if (i === filled) {
          return (
            <Animated.View
              key={i}
              style={[styles.block, { backgroundColor: tint(spec.accent, 0.55) }, cursor]}
            />
          );
        }
        return <View key={i} style={[styles.block, styles.blockEmpty, { borderColor: tint(spec.accent, 0.3) }]} />;
      })}
    </View>
  );
}

function Flash({ color }: { color: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withTiming(1, { duration: 360, easing: Easing.steps(3, true) }));
  }, [v]);
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.get(), [0, 1], ['#FFFFFF', color]),
  }));
  return <Animated.View style={[styles.block, style]} />;
}

// ---------------------------------------------------------------------------
// Blueprint: a ruler with a caret
// ---------------------------------------------------------------------------

const RULER_H = 18;
const INK = 'rgba(205, 225, 255, 0.55)';

function Ruler({ target, steps, spec }: { target: number; steps: number; spec: LookSpec }) {
  const m = useMotion();
  const { w, onLayout } = useTrackWidth();
  const p = useSharedValue(target);
  useEffect(() => {
    p.set(
      m.reduced
        ? withTiming(target, { duration: 140 })
        : withSpring(target, { duration: 700, dampingRatio: 0.85 })
    );
  }, [target, m.reduced, p]);

  const drawn = useAnimatedStyle(() => ({ width: w * Math.max(0, Math.min(1, p.get())) }));
  const caret = useAnimatedStyle(() => ({
    transform: [{ translateX: w * Math.max(0, Math.min(1, p.get())) - 5 }],
  }));

  const base = RULER_H - 3;
  return (
    <View style={styles.ruler} onLayout={onLayout} accessibilityRole="progressbar">
      {w > 0 ? (
        <Svg width={w} height={RULER_H} style={StyleSheet.absoluteFill}>
          <Line x1={0} x2={w} y1={base} y2={base} stroke={INK} strokeWidth={1} />
          {Array.from({ length: steps + 1 }, (_, i) => {
            const x = Math.min(w - 0.5, Math.max(0.5, (i / steps) * w));
            const tall = i === 0 || i === steps || i % 5 === 0;
            return (
              <Line
                key={i}
                x1={x}
                x2={x}
                y1={base}
                y2={base - (tall ? 8 : 4)}
                stroke={INK}
                strokeWidth={1}
              />
            );
          })}
        </Svg>
      ) : null}
      {/* The measured part, inked over. */}
      <Animated.View style={[styles.rulerInk, { top: base - 1, backgroundColor: spec.accent }, drawn]} />
      <Animated.View style={[styles.caret, caret]}>
        <Svg width={10} height={7}>
          <Path d="M0 0 L10 0 L5 7 Z" fill={spec.accent} />
        </Svg>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Arcade: the fat glossy bar
// ---------------------------------------------------------------------------

const CHUNKY_H = 16;
const SPRING_FILL = { duration: 760, dampingRatio: 0.62 } as const;

function Chunky({ target, hot, spec }: { target: number; hot: boolean; spec: LookSpec }) {
  const m = useMotion();
  const p = useSharedValue(target);
  const warm = useWarm(hot);
  const sweep = useSharedValue(1);
  const trackW = useSharedValue(0);
  const last = useRef(target);

  useEffect(() => {
    if (m.reduced) {
      p.set(withTiming(target, { duration: 140, easing: EASE_OUT }));
    } else {
      p.set(withSpring(target, SPRING_FILL));
      if (target > last.current + 1e-6) {
        sweep.set(0);
        sweep.set(withDelay(160, withTiming(1, { duration: 900, easing: EASE_IN_OUT })));
      }
    }
    last.current = target;
  }, [target, m.reduced, p, sweep]);

  const fill = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, p.get())) * 100}%`,
    backgroundColor: interpolateColor(warm.get(), [0, 1], [spec.accent, '#FF7A2F']),
  }));
  const shine = useAnimatedStyle(() => {
    const filled = trackW.get() * Math.max(0, Math.min(1, p.get()));
    const s = sweep.get();
    return {
      opacity: s >= 1 ? 0 : 0.6 * Math.sin(Math.PI * s),
      transform: [{ translateX: -24 + (filled + 24) * s }, { skewX: '-24deg' }],
    };
  });

  return (
    <View style={styles.chunkyWrap} accessibilityRole="progressbar">
      <View
        style={styles.chunkyTrack}
        onLayout={(e: LayoutChangeEvent) => trackW.set(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.chunkyFill, fill]}>
          <View pointerEvents="none" style={styles.gloss} />
          <Animated.View pointerEvents="none" style={[styles.shine, shine]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // tape
  tapeTrack: { flex: 1, height: TAPE_H, justifyContent: 'center' },
  tapeRow: { flexDirection: 'row', gap: TAPE_GAP, height: TAPE_H },
  tapeCell: { flex: 1, height: TAPE_H, borderRadius: 1 },
  tapeEmpty: { backgroundColor: 'rgba(255, 255, 255, 0.09)' },
  tapeClip: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  tapeCap: {
    position: 'absolute',
    left: 0,
    top: -3,
    width: 3,
    height: TAPE_H + 6,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  // line
  plainTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  plainFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  // blocks
  blockRow: { flex: 1, flexDirection: 'row', gap: 3, height: 10, alignItems: 'center' },
  block: { flex: 1, height: 10 },
  blockEmpty: { borderWidth: 1 },
  // ruler
  ruler: { flex: 1, height: RULER_H },
  rulerInk: { position: 'absolute', left: 0, height: 2.5 },
  caret: { position: 'absolute', left: 0, top: 0 },
  // chunky
  chunkyWrap: { flex: 1, paddingBottom: 3 },
  chunkyTrack: {
    height: CHUNKY_H,
    borderRadius: CHUNKY_H / 2,
    backgroundColor: '#2A2838',
    borderBottomWidth: 3,
    borderBottomColor: '#1A1924',
    overflow: 'hidden',
  },
  chunkyFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: CHUNKY_H / 2,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 3,
    left: 7,
    right: 7,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  shine: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    left: 0,
    width: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
