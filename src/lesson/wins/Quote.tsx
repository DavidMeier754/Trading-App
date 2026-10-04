import React, { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Path } from 'react-native-svg';

import { colors, MONO_FONT, radius, space, themed, type } from '../../theme';
import { EASE_OUT, EASE_SINE, SPRING_POP, useMotion } from '../motion';
import { surfaceStyle, useLookSpec } from '../look';
import { headline, rowsOf, type WinData } from './data';
import { useCount, useRise } from './parts';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SPARK_H = 54;

function moveOf(g: string): number {
  return g === 'correct' ? 1 : g === 'amber' ? 0.5 : -1;
}

/**
 * docs/UI.md §5.3 [DESIGN-REVIEW] win screen "A ticker quote" (made for
 * David's set of five or more, 2026-10-04): the lesson gets a quote card, as a
 * stock does in a broker's app. Its symbol is the lesson, its price the XP,
 * ticking up to its value a coin a step; its change is the share of answers
 * right, and its run is drawn as the day's line. The breakdown sits in the
 * card's grid of figures, as Open, High and Low would. The price settling is
 * the landing.
 */
export default function QuoteWin({
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
  const rows = rowsOf(data);
  const card = useSharedValue(m.reduced ? 1 : 0);
  const count = useSharedValue(m.reduced ? 1 : 0);
  const draw = useSharedValue(m.reduced ? 1 : 0);
  const pop = useSharedValue(1);
  const grid = useSharedValue(m.reduced ? 1 : 0);
  const shown = useCount(count, head.value, m.reduced ? head.value : 0, !data.practice);
  const land = useCallback(() => onLand(), [onLand]);

  useEffect(() => {
    if (m.reduced) {
      land();
      return;
    }
    card.set(withSpring(1, SPRING_POP));
    draw.set(withDelay(260, withTiming(1, { duration: 1100, easing: EASE_SINE })));
    count.set(
      withDelay(
        320,
        withTiming(1, { duration: 1200, easing: EASE_OUT }, (finished) => {
          'worklet';
          if (!finished) return;
          scheduleOnRN(land);
          pop.set(
            withSequence(
              withTiming(1.12, { duration: 110, easing: EASE_OUT }),
              withSpring(1, SPRING_POP),
            ),
          );
          grid.set(withDelay(500, withSpring(1, SPRING_POP)));
        }),
      ),
    );
    // Once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The run as the day's line: up for each right answer, down for a miss.
  const grades: WinData['grades'] = data.grades.length ? data.grades : ['correct'];
  const cardW = Math.min(width, 340);
  const sparkW = cardW - space.lg * 2;
  const p = [0];
  grades.forEach((g) => p.push(p[p.length - 1] + moveOf(g)));
  const hi = Math.max(...p, 1);
  const lo = Math.min(...p, 0);
  const pts = p.map((v, i) => ({
    x: 2 + (i / (p.length - 1)) * (sparkW - 4),
    y: 4 + ((hi - v) / (hi - lo)) * (SPARK_H - 8),
  }));
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
  const length = pts.reduce(
    (sum, q, i) => (i ? sum + Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) : 0),
    0,
  );
  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - draw.get()) }));
  const upRun = p[p.length - 1] >= 0;
  const tone = upRun ? colors.up : colors.down;
  const pct = Math.round(data.accuracy * 100);

  const cardStyle = useRise(card, m.travel(20));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  const gridStyle = useRise(grid, m.travel(10));

  return (
    <Animated.View
      style={[styles.card, surfaceStyle(spec), { width: cardW }, cardStyle]}
      accessible
      accessibilityLabel={`Quote for ${data.title}: ${head.text(head.value)} ${head.unit}, ${pct} % right. ${rows
        .map((r) => `${r.label} ${r.value}`)
        .join(', ')}.`}
    >
      <View style={styles.head}>
        <Text style={styles.symbol}>{data.ref ? `NTR ${data.ref}` : 'NTR'}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {data.title}
        </Text>
      </View>
      <View style={styles.priceRow}>
        <Animated.Text style={[styles.price, popStyle]}>{head.text(shown)}</Animated.Text>
        <Text style={styles.unit}>{head.unit}</Text>
        <View style={[styles.change, { borderColor: tone }]}>
          <Text style={[styles.changeText, { color: tone }]}>
            {`${upRun ? '▲' : '▼'} ${pct} %`}
          </Text>
        </View>
      </View>
      <Svg width={sparkW} height={SPARK_H}>
        <AnimatedPath
          d={d}
          stroke={tone}
          strokeWidth={2.5}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${length} ${length}`}
          strokeDashoffset={m.reduced ? 0 : length}
          animatedProps={lineProps}
        />
      </Svg>
      <Animated.View style={[styles.grid, gridStyle]}>
        {rows.map((row) => (
          <View key={row.label} style={styles.cell}>
            <Text style={styles.cellLabel}>{row.label}</Text>
            <Text style={[styles.cellValue, row.accent && { color: colors.warning }]}>
              {row.value}
            </Text>
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = themed(() => ({
  card: {
    alignSelf: 'center',
    padding: space.lg,
    gap: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  symbol: { ...type.label, fontFamily: MONO_FONT, fontWeight: '800', color: colors.text },
  name: { ...type.small, color: colors.textMuted, flexShrink: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  price: {
    fontFamily: MONO_FONT,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: colors.text,
  },
  unit: { ...type.label, color: colors.textMuted },
  change: {
    marginLeft: 'auto',
    alignSelf: 'center',
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  changeText: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.md,
  },
  cell: { width: '50%', gap: 2 },
  cellLabel: { ...type.small, color: colors.textMuted },
  cellValue: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700', color: colors.text },
}));
