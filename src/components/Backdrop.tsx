import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  Line,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { colors, GRID } from '../theme';

/**
 * The ground the lesson sits on: a hairline grid plus a glow at the top edge.
 *
 * docs/UI.md §10 names a `background` token but not what fills it, and a flat
 * fill left every screen reading as empty. The grid gives the empty space a
 * scale, and the glow gives it a top. Both are far below text contrast on
 * purpose -- this is a surface, not content.
 *
 * It is one static SVG behind everything, with `pointerEvents="none"`, so it
 * costs one draw and never takes a touch.
 */
export default function Backdrop({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <View style={styles.fill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <Pattern
            id="grid"
            width={GRID}
            height={GRID}
            patternUnits="userSpaceOnUse"
          >
            {/* Drawn at the cell's far edge so the first line lands on y = GRID,
                which is what the chart snaps its price axis to. */}
            <Line
              x1={GRID}
              y1={0}
              x2={GRID}
              y2={GRID}
              stroke={colors.gridLine}
              strokeWidth={1}
            />
            <Line
              x1={0}
              y1={GRID}
              x2={GRID}
              y2={GRID}
              stroke={colors.gridLine}
              strokeWidth={1}
            />
          </Pattern>

          <RadialGradient id="glow" cx="50%" cy="0%" rx="115%" ry="52%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.15" />
            <Stop offset="0.45" stopColor={colors.accent} stopOpacity="0.04" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill={colors.background} />
        <Rect x={0} y={0} width={width} height={height} fill="url(#grid)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#glow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
