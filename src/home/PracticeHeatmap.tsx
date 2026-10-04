import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { addDays, dayOf } from '../progress';
import { colors, MONO_FONT, space, themed, type } from '../theme';

const WEEKS = 18;
const GAP = 3;
/** Room round the grid for today's ring. */
const PAD = 2;
const DAY_W = 32;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Mon', '', 'Wed', '', 'Fri', '', ''];

/** `a` laid over `b` at `t` (0..1), both `#rrggbb`. */
function blend(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1, 7), 16);
  const y = parseInt(b.slice(1, 7), 16);
  const ch = (shift: number) =>
    Math.round(((x >> shift) & 255) * t + ((y >> shift) & 255) * (1 - t));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

/**
 * docs/ui/12-practice-and-stats.md §7.4 [DESIGN-REVIEW] "Practice as a heat map" (David's pick of
 * 2026-10-04): the last eighteen weeks on Account, a square a day, Monday to
 * Sunday down each column, darker the more lessons that day (progress.ts,
 * `days`), today ringed. Over it, the days learned and the longest run of
 * them. It counts days, never judges them (docs/rules/07-variance-and-typed-numbers.md §3.11).
 */
export default function PracticeHeatmap({
  days,
  now = new Date(),
}: {
  days: Record<string, number>;
  now?: Date;
}) {
  const [width, setWidth] = useState(300);
  // The last column runs up to today.
  const weekday = (now.getDay() + 6) % 7;
  const shown = (WEEKS - 1) * 7 + weekday + 1;
  const today = dayOf(now);
  const first = addDays(today, -(shown - 1));
  const counts = Array.from({ length: shown }, (_, i) => days[addDays(first, i)] ?? 0);
  let learned = 0;
  let longest = 0;
  let run = 0;
  for (const d of counts) {
    run = d > 0 ? run + 1 : 0;
    learned += d > 0 ? 1 : 0;
    longest = Math.max(longest, run);
  }

  const cell = Math.max(
    9,
    Math.min(16, Math.floor((width - DAY_W - PAD * 2 - (WEEKS - 1) * GAP) / WEEKS)),
  );
  const pitch = cell + GAP;
  const gridW = WEEKS * pitch - GAP + PAD * 2;
  const gridH = 7 * pitch - GAP + PAD * 2;
  // An empty day still shows as a square, on either theme.
  const base = colors.border;
  const shades = [
    base,
    blend(colors.success, base, 0.3),
    blend(colors.success, base, 0.52),
    blend(colors.success, base, 0.76),
    colors.success,
  ];

  // A month's name over the first week that starts in it.
  const [fy, fm, fd] = first.split('-').map(Number);
  const months: { col: number; name: string }[] = [];
  let month = -1;
  for (let col = 0; col < WEEKS; col++) {
    const m = new Date(fy, fm - 1, fd + col * 7).getMonth();
    if (m !== month) months.push({ col, name: MONTHS[m] });
    month = m;
  }
  // The first column's month gives way when the next one would touch it.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();
  const last = shown - 1;

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={[styles.block, { width: DAY_W + gridW }]}>
        <View style={styles.stats}>
          <View>
            <Text style={styles.statNum}>{learned}</Text>
            <Text style={styles.muted}>{learned === 1 ? 'day learned' : 'days learned'}</Text>
          </View>
          <View>
            <Text style={[styles.statNum, { color: colors.success }]}>{longest}</Text>
            <Text style={styles.muted}>longest run</Text>
          </View>
        </View>
        <View>
          <View style={[styles.monthRow, { marginLeft: DAY_W + PAD }]}>
            {months.map((m) => (
              <Text key={m.col} style={[styles.label, styles.month, { left: m.col * pitch }]}>
                {m.name}
              </Text>
            ))}
          </View>
          <View style={styles.row}>
            <View style={{ width: DAY_W, height: gridH }}>
              {DAY_NAMES.map((name, r) =>
                name ? (
                  <Text
                    key={r}
                    style={[styles.label, styles.dayName, { top: PAD + r * pitch + cell / 2 - 9 }]}
                  >
                    {name}
                  </Text>
                ) : null,
              )}
            </View>
            <View
              accessible
              accessibilityRole="image"
              accessibilityLabel={`${learned} days learned in the last ${WEEKS} weeks, longest run ${longest} days`}
            >
              <Svg width={gridW} height={gridH}>
                {counts.map((d, i) => (
                  <Rect
                    key={i}
                    x={PAD + Math.floor(i / 7) * pitch}
                    y={PAD + (i % 7) * pitch}
                    width={cell}
                    height={cell}
                    rx={2.5}
                    fill={shades[Math.min(4, d)]}
                  />
                ))}
                <Rect
                  x={PAD + Math.floor(last / 7) * pitch - 2}
                  y={PAD + (last % 7) * pitch - 2}
                  width={cell + 4}
                  height={cell + 4}
                  rx={4}
                  fill="none"
                  stroke={colors.text}
                  strokeWidth={1.5}
                />
              </Svg>
            </View>
          </View>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendPart}>
            <Text style={styles.label}>Less</Text>
            {shades.map((shade, i) => (
              <View key={i} style={[styles.swatch, { backgroundColor: shade }]} />
            ))}
            <Text style={styles.label}>More</Text>
          </View>
          <View style={styles.legendPart}>
            <View style={[styles.swatch, styles.swatchToday]} />
            <Text style={styles.label}>Today</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { alignSelf: 'stretch', alignItems: 'center' },
  block: { gap: space.lg },
  stats: { flexDirection: 'row', gap: space.xxl },
  statNum: { ...type.title, fontFamily: MONO_FONT, color: colors.text },
  muted: { ...type.small, color: colors.textMuted },
  monthRow: { height: 20 },
  month: { position: 'absolute', top: 0 },
  row: { flexDirection: 'row' },
  label: { ...type.small, color: colors.textMuted },
  dayName: { position: 'absolute', left: 0 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendPart: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swatch: { width: 11, height: 11, borderRadius: 2.5 },
  swatchToday: { borderWidth: 1.5, borderColor: colors.text, marginRight: 2 },
}));
