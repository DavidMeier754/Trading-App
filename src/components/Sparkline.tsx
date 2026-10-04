import React from 'react';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { colors } from '../theme';

/**
 * A small line of a price's move, with no axis and no numbers: a scene's
 * market alert (docs/ui/03-screen-types.md §3 `story`) and a scanner row (§6.8). It takes the
 * colour of its direction, first value to last, and marks where it ends.
 * `base` draws a faint level line, for a row whose day is measured from the
 * previous close.
 */
export default function Sparkline({
  values,
  width,
  height,
  base,
  range,
  strokeWidth = 1.75,
}: {
  values: number[];
  width: number;
  height: number;
  /** A level to draw faintly across the line, e.g. the previous close. */
  base?: number;
  /** A scale shared with other lines, so their moves compare; else its own. */
  range?: [number, number];
  strokeWidth?: number;
}) {
  if (values.length < 2) return null;
  const all = base === undefined ? values : [...values, base];
  const lo = range ? range[0] : Math.min(...all);
  const hi = range ? range[1] : Math.max(...all);
  const span = hi - lo || 1;
  const pad = strokeWidth + 2;
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / span) * (height - pad * 2);
  const first = values[0];
  const last = values[values.length - 1];
  const color = last > first ? colors.up : last < first ? colors.down : colors.textMuted;
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <Svg width={width} height={height} accessibilityElementsHidden importantForAccessibility="no">
      {base !== undefined ? (
        <Line
          x1={pad}
          x2={width - pad}
          y1={y(base)}
          y2={y(base)}
          stroke={colors.borderStrong}
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      ) : null}
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={x(values.length - 1)} cy={y(last)} r={strokeWidth + 0.75} fill={color} />
    </Svg>
  );
}
