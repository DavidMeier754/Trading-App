import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, GRID } from '../theme';

/** Every fourth cell line is the heavier one. */
const MAJOR_EVERY = 4;

/**
 * The ground the lesson sits on: a hairline grid plus a glow at the top edge.
 *
 * docs/UI.md §10 names a `background` token but not what fills it, and a flat
 * fill left every screen reading as empty. The grid gives the empty space a
 * scale and the glow gives it a top. Both sit far below text contrast on
 * purpose -- this is a surface, not content.
 *
 * Drawn as plain `Line`s rather than an SVG `Pattern`. A pattern is the tidier
 * description, but it is one of the less-travelled corners of react-native-svg,
 * and a phone-sized grid is only ~45 lines. Lines and gradients are the parts
 * every renderer has always supported.
 *
 * One static SVG behind everything, `pointerEvents="none"`: one draw, and it
 * never takes a touch.
 */
export default function Backdrop({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const lines = useMemo(() => {
    const out: {
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      major: boolean;
    }[] = [];
    for (let i = 1, x = GRID; x < width; i++, x += GRID) {
      out.push({ key: `v${i}`, x1: x, y1: 0, x2: x, y2: height, major: i % MAJOR_EVERY === 0 });
    }
    for (let i = 1, y = GRID; y < height; i++, y += GRID) {
      out.push({ key: `h${i}`, x1: 0, y1: y, x2: width, y2: y, major: i % MAJOR_EVERY === 0 });
    }
    return out;
  }, [width, height]);

  return (
    <View style={styles.fill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="backdropGlow" cx="50%" cy="0%" r="80%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.16" />
            <Stop offset="0.45" stopColor={colors.accent} stopOpacity="0.05" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill={colors.background} />

        {lines.map((l) => (
          <Line
            key={l.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={l.major ? colors.gridLineMajor : colors.gridLine}
            strokeWidth={1}
          />
        ))}

        <Rect x={0} y={0} width={width} height={height} fill="url(#backdropGlow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
