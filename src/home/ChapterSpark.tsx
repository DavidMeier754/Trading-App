import React from 'react';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '../theme';

/** The line's floor, in per cent: what the card draws is the top of the range. */
const LO = 50;
const PAD = 4;

/**
 * docs/ui/10-path-map.md §7.1 [DESIGN-REVIEW] "Chapter cards with a sparkline" (David's
 * pick of 2026-10-04): in a chapter card, in place of its bar, a point per
 * level played, as high as its right answers, the last one ringed. A finished
 * chapter's line is gold; one under way draws as far as it has got and dashes
 * on, level, to the chapter's end.
 */
export default function ChapterSpark({
  id,
  scores,
  levels,
  width,
  height,
  tone,
}: {
  id: string;
  /** Right answers per level played, in per cent. */
  scores: number[];
  levels: number;
  width: number;
  height: number;
  tone: string;
}) {
  const x = (i: number) => PAD + (i * (width - PAD * 2)) / Math.max(1, levels - 1);
  const y = (v: number) => PAD + (1 - (Math.max(LO, v) - LO) / (100 - LO)) * (height - PAD * 2);
  const pts = scores.map((v, i) => ({ x: x(i), y: y(v) }));
  const end = pts[pts.length - 1];
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${end.x.toFixed(1)} ${height} L${pts[0].x.toFixed(1)} ${height} Z`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tone} stopOpacity={0.28} />
          <Stop offset="1" stopColor={tone} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {pts.length > 1 ? <Path d={area} fill={`url(#${id})`} /> : null}
      {scores.length < levels ? (
        <Line
          x1={end.x}
          y1={end.y}
          x2={x(levels - 1)}
          y2={end.y}
          stroke={colors.textFaint}
          strokeOpacity={0.7}
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
      ) : null}
      {pts.length > 1 ? (
        <Path
          d={line}
          stroke={tone}
          strokeWidth={2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
      <Circle cx={end.x} cy={end.y} r={5.5} fill={tone} opacity={0.2} />
      <Circle cx={end.x} cy={end.y} r={3} fill={tone} stroke={colors.surface} strokeWidth={1.5} />
    </Svg>
  );
}
