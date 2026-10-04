import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors, MONO_FONT, space, themed, type } from '../../theme';
import { detentFeedback, noteFeedback } from '../feedback';
import { useLookSpec } from '../look';
import { EASE_OUT, SPRING_POP, useMotion } from '../motion';
import { headline, rowsOf, type WinData } from './data';
import { RowsCard, useCount, useRise } from './parts';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AREA_H = 168;
const PAD = 14;
const DOT = 10;
/** The line's walk from one answer to the next, in ms. */
const STEP_MS = 200;

function moveOf(g: string): number {
  return g === 'correct' ? 1 : g === 'amber' ? 0.5 : -1;
}

/**
 * docs/UI.md §5.3 [DESIGN-REVIEW] win screen "An equity curve" (made for
 * David's set of five or more, 2026-10-04): the lesson's answers draw a P&L
 * line, as a trading account's curve. It starts at zero on the left and steps
 * up for each right answer and down for a miss; a dot pops at each answer as
 * the line reaches it, with a rising note or a dull tick. It ends on the
 * landing, at a tag with the XP.
 */
export default function CurveWin({
  data,
  width,
  onLand,
}: {
  data: WinData;
  width: number;
  onLand: () => void;
}) {
  const m = useMotion();
  const spec = useLookSpec();
  const head = headline(data);
  const grades: WinData['grades'] = useMemo(
    () => (data.grades.length ? data.grades : ['correct']),
    [data.grades],
  );
  const n = grades.length;
  const areaW = Math.min(width, 320);
  // Room right of the line for the tag at its end.
  const plotW = areaW - 112;

  const pts = useMemo(() => {
    const p = [0];
    grades.forEach((g) => p.push(p[p.length - 1] + moveOf(g)));
    const hi = Math.max(...p, 1);
    const lo = Math.min(...p, 0);
    return p.map((v, i) => ({
      x: PAD + (i / n) * (plotW - PAD),
      y: PAD + ((hi - v) / (hi - lo)) * (AREA_H - PAD * 2),
    }));
  }, [grades, n, plotW]);
  const zeroY = useMemo(() => {
    const p = [0];
    grades.forEach((g) => p.push(p[p.length - 1] + moveOf(g)));
    const hi = Math.max(...p, 1);
    const lo = Math.min(...p, 0);
    return PAD + (hi / (hi - lo)) * (AREA_H - PAD * 2);
  }, [grades]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[n].x.toFixed(1)} ${AREA_H} L${pts[0].x.toFixed(1)} ${AREA_H} Z`;
  const length = pts.reduce(
    (sum, p, i) => (i ? sum + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0),
    0,
  );
  const end = pts[n];

  const t = useSharedValue(m.reduced ? n : 0);
  const tag = useSharedValue(m.reduced ? 1 : 0);
  const rows = useSharedValue(m.reduced ? 1 : 0);
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
          tag.set(withDelay(120, withTiming(1, { duration: 900, easing: EASE_OUT })));
          rows.set(withDelay(900, withSpring(1, SPRING_POP)));
        }),
      ),
    );
    // Once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // The line is drawn on by its dash: as far along as the answers it has reached.
  const seg = pts.map((p, i) => (i ? Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0));
  const lineProps = useAnimatedProps(() => {
    const v = t.get();
    let drawn = 0;
    for (let i = 1; i <= n; i++) {
      if (v >= i) drawn += seg[i];
      else {
        drawn += seg[i] * Math.max(0, v - (i - 1));
        break;
      }
    }
    return { strokeDashoffset: length - drawn };
  });
  const fill = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, t.get() - n + 1)) }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, tag.get() * 3),
    transform: [{ scale: 0.8 + 0.2 * Math.min(1, tag.get() * 2) }],
  }));
  const rowsStyle = useRise(rows, m.travel(18));
  const tone = path0(grades) >= 0 ? colors.up : colors.down;

  return (
    <View style={styles.wrap}>
      <View
        style={{ width: areaW, height: AREA_H }}
        accessible
        accessibilityLabel={`Your lesson as an equity curve: ${data.clean} of ${data.total} right, ${head.text(head.value)} ${head.unit}.`}
      >
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, fill]}>
          <Svg width={areaW} height={AREA_H}>
            <Defs>
              <LinearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={spec.chartLine} stopOpacity={0.26} />
                <Stop offset="1" stopColor={spec.chartLine} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={area} fill="url(#curveFill)" />
          </Svg>
        </Animated.View>
        <Svg width={areaW} height={AREA_H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Line
            x1={PAD}
            x2={plotW}
            y1={zeroY}
            y2={zeroY}
            stroke={colors.borderStrong}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <AnimatedPath
            d={line}
            stroke={spec.chartLine}
            strokeWidth={3}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={`${length} ${length}`}
            strokeDashoffset={m.reduced ? 0 : length}
            animatedProps={lineProps}
          />
        </Svg>
        {pts.slice(1).map((p, i) => (
          <Dot key={i} x={p.x} y={p.y} k={i + 1} t={t} right={moveOf(grades[i]) > 0} />
        ))}
        <Animated.View
          style={[
            styles.tag,
            {
              left: end.x + space.sm,
              top: Math.max(0, Math.min(AREA_H - 32, end.y - 16)),
              borderColor: tone,
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

/** Where the curve ends, in steps from zero. */
function path0(grades: WinData['grades']): number {
  return grades.reduce((sum, g) => sum + moveOf(g), 0);
}

/** An answer's dot: it pops as the line reaches it. */
function Dot({
  x,
  y,
  k,
  t,
  right,
}: {
  x: number;
  y: number;
  k: number;
  t: SharedValue<number>;
  right: boolean;
}) {
  const style = useAnimatedStyle(() => {
    const on = Math.min(1, Math.max(0, (t.get() - k + 0.15) / 0.3));
    return { opacity: on, transform: [{ scale: on < 1 ? 0.4 + 0.9 * on : 1 }] };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        { left: x - DOT / 2, top: y - DOT / 2, backgroundColor: right ? colors.up : colors.down },
        style,
      ]}
    />
  );
}

const styles = themed(() => ({
  wrap: { alignItems: 'center', gap: space.xl, alignSelf: 'stretch' },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: colors.background,
  },
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
