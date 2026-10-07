import React, { useMemo } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { tapFeedback } from '../lesson/feedback';
import { inkOn, useLookSpec } from '../lesson/look';
import { colors, radius, space, type, themed } from '../theme';
import { useLessonInfo } from '../lesson/lessonContext';
import { useProgress } from '../progress';
import type { ChartSpec } from '../types';
import { chartExplain, knowsFor, type ExplainItem } from './explain';

/**
 * docs/ui/08-quotes-and-charts.md §6.4a — the "?" key and what it shows: a number on each
 * element the learner has been taught, and a legend with each one's name and
 * line. A second press takes them away. Nothing appears or moves until the
 * learner presses it (docs/ui/02-lesson-player-layout.md §2).
 */

/**
 * The key itself: a small round "?" in a 48-point target. A tap gesture
 * rather than a Pressable, as the chart's Reset: it sits inside the chart's
 * own gestures, which a Pressable's press does not get through on the web.
 */
export function ExplainKeyButton({
  on,
  onToggle,
  style,
}: {
  on: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}) {
  const accent = useLookSpec().accent;
  const press = () => {
    tapFeedback();
    onToggle();
  };
  const tap = Gesture.Tap().onEnd(() => {
    scheduleOnRN(press);
  });
  return (
    <GestureDetector gesture={tap}>
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={on ? 'Hide the labels' : 'Label what is on this chart'}
        accessibilityState={{ expanded: on }}
        onAccessibilityTap={press}
        style={[styles.hit, style]}
      >
        <View
          style={[
            styles.key,
            on
              ? { backgroundColor: accent, borderColor: accent }
              : { backgroundColor: colors.surface, borderColor: colors.borderStrong },
          ]}
        >
          <Text style={[styles.keyText, { color: on ? inkOn(accent) : colors.text }]}>?</Text>
        </View>
      </View>
    </GestureDetector>
  );
}

/** An element's number, on the chart where the element is. */
export function ExplainBadge({ n, style }: { n: number; style?: ViewStyle | ViewStyle[] }) {
  const accent = useLookSpec().accent;
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[styles.badge, { backgroundColor: accent }, style]}
    >
      <Text style={[styles.badgeText, { color: inkOn(accent) }]}>{n}</Text>
    </View>
  );
}

export const BADGE = 22;

/** The legend: each number with its name and its one line. */
export function ExplainLegend({
  items,
  style,
  onHeight,
}: {
  items: ExplainItem[];
  style?: ViewStyle;
  /** Its height once laid out: for the copy that measures the room it will take. */
  onHeight?: (h: number) => void;
}) {
  const accent = useLookSpec().accent;
  return (
    <View
      style={[styles.legend, style]}
      pointerEvents="none"
      onLayout={onHeight ? (e) => onHeight(e.nativeEvent.layout.height) : undefined}
    >
      {items.map((it, i) => (
        <View
          key={it.key}
          style={styles.row}
          accessible
          accessibilityLabel={`${i + 1}. ${it.name}: ${it.line}`}
        >
          <View style={[styles.badge, styles.rowBadge, { backgroundColor: accent }]}>
            <Text style={[styles.badgeText, { color: inkOn(accent) }]}>{i + 1}</Text>
          </View>
          <Text style={styles.rowText}>
            <Text style={styles.rowName}>{it.name}</Text>
            {`  ${it.line}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = themed(() => ({
  hit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  key: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { ...type.label, fontSize: 16, fontWeight: '800', lineHeight: 20 },
  badge: {
    position: 'absolute',
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: { ...type.small, fontSize: 13, lineHeight: 15, fontWeight: '800' },
  legend: {
    gap: 6,
    padding: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  rowBadge: { position: 'relative', marginTop: 0 },
  rowText: { ...type.small, fontSize: 13, lineHeight: 18, color: colors.textMuted, flex: 1 },
  rowName: { fontWeight: '700', color: colors.text },
}));

/**
 * What a chart that is read, not decided on, can label (a theory card's chart,
 * `chart-tap`, `chart-annotate`): its VWAP, its levels and its volume bars,
 * as far as the learner has been taught them.
 */
export function useChartExplain(spec: ChartSpec, shown: number): ExplainItem[] {
  const { lessonId, everything } = useLessonInfo();
  const { done } = useProgress();
  return useMemo(() => {
    const data = Array.isArray(spec.data) ? spec.data : [];
    const at = data[Math.max(0, Math.min(shown, data.length) - 1)] as unknown;
    const last = Array.isArray(at) ? Number(at[3]) : Number(at ?? 0);
    return chartExplain(
      {
        vwap: !!spec.vwap,
        levels: spec.levels ?? [],
        last,
        volume: Array.isArray(spec.volume) && spec.volume.length > 0,
      },
      knowsFor(lessonId, done, everything),
    );
  }, [spec, shown, lessonId, done, everything]);
}
