import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { price as fmtPrice, signedPercent } from '../format';
import { detentFeedback } from '../lesson/feedback';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, MONO_FONT, space, themed, type } from '../theme';

/** The readout over the crosshair: its height, and the room kept round it. */
const TAG_H = 24;
const DOT = 12;

/**
 * docs/ui/08-quotes-and-charts.md §6.4 [DESIGN-REVIEW] "Run a finger along the chart" (David's pick
 * of 2026-10-04): on a chart that is there to be read -- a theory visual, a
 * chart decision once its outcome has played -- a finger run along it brings
 * up a crosshair on the nearest bar, a dot on its close and a tag with the
 * price and how far it is from where the chart starts. Each bar it crosses
 * clicks. It goes when the finger lifts. A tap is not a scrub, so a tap on the
 * chart still does what it did.
 *
 * Drawn over the chart from the chart's own layout (Chart.tsx), so the
 * crosshair cannot sit anywhere but on a bar.
 */
export default function ChartScrub({
  width,
  height,
  xs,
  ys,
  closes,
  top,
  bottom,
  right,
}: {
  width: number;
  height: number;
  /** Each bar's centre, left to right. */
  xs: number[];
  /** Each bar's close, as drawn. */
  ys: number[];
  closes: number[];
  /** The plot's top and bottom, and its right edge (where the axis begins). */
  top: number;
  bottom: number;
  right: number;
}) {
  const reduced = useReduceMotion();
  const [at, setAt] = useState<number | null>(null);
  const [tagW, setTagW] = useState(0);
  const shown = useSharedValue(0);
  const index = useSharedValue(-1);
  const n = xs.length;
  const first = xs[0] ?? 0;
  const slot = n > 1 ? (xs[n - 1] - first) / (n - 1) : 1;

  const onIndex = useCallback((i: number) => {
    setAt(i);
    detentFeedback();
  }, []);
  const onEnd = useCallback(() => setAt(null), []);

  // Read off the touch and the overlay as drawn, then back into the chart's
  // own points: a screen scaled to fit (lesson/fit.tsx) needs no correction.
  const hit = useAnimatedRef<View>();
  const pick = (absoluteX: number) => {
    'worklet';
    const box = measure(hit);
    if (!box || box.width <= 0) return;
    const x = ((absoluteX - box.pageX) / box.width) * width;
    const i = Math.max(0, Math.min(n - 1, Math.round((x - first) / slot)));
    if (i !== index.get()) {
      index.set(i);
      scheduleOnRN(onIndex, i);
    }
  };
  const pan = Gesture.Pan()
    // One finger: two are a pinch, the chart's zoom (Chart.tsx).
    .maxPointers(1)
    .enabled(n > 1)
    // Sideways: a tap, or a page scrolled up and down, is not a scrub.
    .activeOffsetX([-6, 6])
    .failOffsetY([-14, 14])
    .onStart((e) => {
      shown.set(reduced ? 1 : withTiming(1, { duration: 120 }));
      pick(e.absoluteX);
    })
    .onUpdate((e) => {
      pick(e.absoluteX);
    })
    .onFinalize(() => {
      index.set(-1);
      shown.set(reduced ? 0 : withTiming(0, { duration: 220 }));
      scheduleOnRN(onEnd);
    });

  const i = at ?? 0;
  const x = xs[i] ?? 0;
  const hair = useAnimatedStyle(() => ({ opacity: shown.get() }));
  const change = closes.length ? ((closes[i] - closes[0]) / closes[0]) * 100 : 0;
  const tone = change > 1e-9 ? colors.up : change < -1e-9 ? colors.down : colors.textMuted;
  const tagLeft = Math.max(0, Math.min(right - tagW, x - tagW / 2));

  return (
    <GestureDetector gesture={pan}>
      <View
        ref={hit}
        collapsable={false}
        style={[StyleSheet.absoluteFill, { width, height }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {at !== null ? (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, hair]}>
            <View
              style={[
                styles.hair,
                {
                  left: x - 0.75,
                  top: top + TAG_H + space.xs,
                  height: Math.max(0, bottom - top - TAG_H - space.xs),
                },
              ]}
            />
            <View
              style={[
                styles.dot,
                { left: x - DOT / 2, top: (ys[i] ?? 0) - DOT / 2, borderColor: colors.text },
              ]}
            />
            <View
              style={[styles.tag, { left: tagLeft, top }]}
              onLayout={(e) => setTagW(e.nativeEvent.layout.width)}
            >
              <Text style={styles.tagPrice}>{fmtPrice(closes[i])}</Text>
              <Text style={[styles.tagChange, { color: tone }]}>
                {`${change > 1e-9 ? '▲' : change < -1e-9 ? '▼' : '·'} ${signedPercent(change)}`}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = themed(() => ({
  hair: { position: 'absolute', width: 1.5, backgroundColor: colors.textMuted },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2.5,
    backgroundColor: colors.background,
  },
  tag: {
    position: 'absolute',
    height: TAG_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  tagPrice: { ...type.small, fontFamily: MONO_FONT, fontWeight: '700', color: colors.text },
  tagChange: { ...type.small, fontFamily: MONO_FONT, fontWeight: '700' },
}));
