import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, MONO_FONT, space, themed, type } from '../../theme';
import { detentFeedback, noteFeedback } from '../feedback';
import { EASE_OUT, SPRING_POP, useMotion } from '../motion';
import { headline, rowsOf, type WinData } from './data';
import { RowsCard, useCount, useRise } from './parts';

const AREA_H = 176;
const BODY_W = 46;
const WICK_W = 4;
/** One answer's move, in ms. */
const STEP_MS = 190;

/** How far each answer moves the price: up for a right one, down for a miss. */
function moveOf(g: string): number {
  return g === 'correct' ? 1 : g === 'amber' ? 0.5 : -1;
}

/**
 * docs/UI.md §5.3 [DESIGN-REVIEW] win screen "Your lesson as a candle" (made
 * for David's set of five or more, 2026-10-04): the lesson is one big candle.
 * It opens at the dashed line, and the answers move its price one by one, a
 * rising note for each right one and a dull tick for a miss: the body grows up
 * from the open, a miss pulls it back and leaves a wick where it had been. It
 * closes on the landing, and the XP comes up on the price tag at its close.
 */
export default function CandleWin({
  data,
  width,
  onLand,
}: {
  data: WinData;
  width: number;
  onLand: () => void;
}) {
  const m = useMotion();
  const head = headline(data);
  const grades: WinData['grades'] = useMemo(
    () => (data.grades.length ? data.grades : ['correct']),
    [data.grades],
  );
  const n = grades.length;
  // The price after each answer, from the open at 0.
  const path = useMemo(() => {
    const p = [0];
    grades.forEach((g) => p.push(p[p.length - 1] + moveOf(g)));
    return p;
  }, [grades]);
  const hi = Math.max(...path, 1);
  const lo = Math.min(...path, 0);
  const pad = 14;
  const yOf = (p: number) => pad + ((hi - p) / (hi - lo)) * (AREA_H - pad * 2);
  const ys = path.map(yOf);
  const openY = yOf(0);
  const closeY = ys[n];
  const up = path[n] >= 0;

  const areaW = Math.min(width, 300);
  const cx = areaW / 2 - 24;

  const t = useSharedValue(m.reduced ? n : 0);
  const tag = useSharedValue(m.reduced ? 1 : 0);
  const rows = useSharedValue(m.reduced ? 1 : 0);
  const swell = useSharedValue(1);
  const shown = useCount(tag, head.value, m.reduced ? head.value : 0, !data.practice);

  const land = useCallback(() => onLand(), [onLand]);
  const onStep = useCallback(
    (k: number, ups: number) => {
      if (moveOf(grades[k]) > 0) noteFeedback(Math.min(7, ups));
      else detentFeedback();
    },
    [grades],
  );

  useEffect(() => {
    if (m.reduced) {
      land();
      return;
    }
    t.set(
      withDelay(
        360,
        withTiming(n, { duration: n * STEP_MS, easing: Easing.linear }, (finished) => {
          'worklet';
          if (!finished) return;
          scheduleOnRN(land);
          swell.set(
            withSequence(
              withTiming(1.06, { duration: 110, easing: EASE_OUT }),
              withSpring(1, SPRING_POP),
            ),
          );
          tag.set(withDelay(160, withTiming(1, { duration: 900, easing: EASE_OUT })));
          rows.set(withDelay(900, withSpring(1, SPRING_POP)));
        }),
      ),
    );
    // Once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A note or a tick as each answer lands on the candle.
  useAnimatedReaction(
    () => (m.reduced ? -1 : Math.floor(t.get() + 1e-6)),
    (k, previous) => {
      if (previous === null || k <= previous || k < 1 || k > n) return;
      let ups = 0;
      for (let i = 0; i < k; i++) if (grades[i] === 'correct') ups += 1;
      scheduleOnRN(onStep, k - 1, ups);
    },
    [m.reduced, n, grades, onStep],
  );

  // Read here, in render: the styles below are worklets.
  const upColor = colors.up;
  const downColor = colors.down;
  const body = useAnimatedStyle(() => {
    const v = t.get();
    const k = Math.min(n - 1, Math.floor(v));
    const f = v - k;
    const y = v >= n ? ys[n] : ys[k] + (ys[k + 1] - ys[k]) * f;
    const top = Math.min(openY, y);
    return {
      top,
      height: Math.max(3, Math.abs(openY - y)),
      backgroundColor: y <= openY ? upColor : downColor,
      transform: [{ scaleX: swell.get() }],
    };
  });
  const wick = useAnimatedStyle(() => {
    const v = t.get();
    const k = Math.min(n, Math.floor(v));
    let top = openY;
    let bottom = openY;
    for (let i = 0; i <= k; i++) {
      top = Math.min(top, ys[i]);
      bottom = Math.max(bottom, ys[i]);
    }
    if (v < n) {
      const f = v - Math.floor(v);
      const y = ys[k] + (ys[Math.min(n, k + 1)] - ys[k]) * f;
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
    return { top, height: Math.max(1, bottom - top), backgroundColor: up ? upColor : downColor };
  });
  const tagStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, tag.get() * 3),
    transform: [{ translateX: 8 * (1 - Math.min(1, tag.get() * 2)) }],
  }));
  const rowsStyle = useRise(rows, m.travel(18));

  return (
    <View style={styles.wrap}>
      <View
        style={{ width: areaW, height: AREA_H }}
        accessible
        accessibilityLabel={`Your lesson as a candle: ${data.clean} of ${data.total} right, ${head.text(head.value)} ${head.unit}.`}
      >
        {/* The open, a dashed line across with its name. */}
        <View style={[styles.openLine, { top: openY, left: 0, width: areaW }]} />
        <Text style={[styles.openText, { top: Math.max(0, openY - 18) }]}>OPEN</Text>
        <Animated.View style={[styles.wick, { left: cx - WICK_W / 2 }, wick]} />
        <Animated.View style={[styles.body, { left: cx - BODY_W / 2 }, body]} />
        <Animated.View
          style={[
            styles.tag,
            {
              left: cx + BODY_W / 2 + space.md,
              top: Math.max(0, Math.min(AREA_H - 32, closeY - 16)),
              borderColor: up ? upColor : downColor,
            },
            tagStyle,
          ]}
        >
          <Text style={styles.tagValue}>{head.text(shown)}</Text>
          <Text style={styles.tagUnit}>{head.unit}</Text>
        </Animated.View>
      </View>
      <RowsCard rows={rowsOf(data)} style={rowsStyle} />
    </View>
  );
}

const styles = themed(() => ({
  wrap: { alignItems: 'center', gap: space.xl, alignSelf: 'stretch' },
  openLine: {
    position: 'absolute',
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  openText: {
    ...type.small,
    position: 'absolute',
    left: 0,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  wick: { position: 'absolute', width: WICK_W, borderRadius: 2 },
  body: { position: 'absolute', width: BODY_W, borderRadius: 4 },
  tag: {
    position: 'absolute',
    height: 32,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: space.sm,
    paddingTop: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  tagValue: {
    fontFamily: MONO_FONT,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: colors.text,
  },
  tagUnit: { ...type.small, color: colors.textMuted },
}));
