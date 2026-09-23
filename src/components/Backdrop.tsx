import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useLookSpec } from '../lesson/look';
import Atmosphere, { Texture } from './Atmosphere';

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

  const spec = useLookSpec();
  const g = spec.ground;
  const lineColor = (major: boolean) =>
    g.grid === 'blueprint'
      ? major
        ? 'rgba(170, 205, 255, 0.26)'
        : 'rgba(170, 205, 255, 0.11)'
      : major
        ? colors.gridLineMajor
        : colors.gridLine;

  return (
    <View style={styles.fill} pointerEvents="none">
      {/* The ground, then the light, then the grid over both: the light falls
          through the lines rather than washing them out. The texture goes on
          last, over all of it, the way grain sits in a print. Every layer is
          the look's choice (lesson/look.ts). */}
      <View style={[styles.fill, { backgroundColor: g.color }]} />
      {g.edgeLight ? <Atmosphere width={width} height={height} /> : null}
      <Svg width={width} height={height} style={styles.fill}>
        <Defs>
          <RadialGradient id="backdropGlow" cx="50%" cy="0%" r="80%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.16" />
            <Stop offset="0.45" stopColor={colors.accent} stopOpacity="0.05" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
          </RadialGradient>
          {/* A lens: the edges fall off into the dark, so the eye lands in the
              middle where the lesson is. */}
          <RadialGradient id="backdropVignette" cx="50%" cy="45%" r="75%">
            <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.4" />
          </RadialGradient>
        </Defs>

        {g.grid !== 'none'
          ? lines.map((l) => (
              <Line
                key={l.key}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={lineColor(l.major)}
                strokeWidth={1}
              />
            ))
          : null}

        {g.topGlow ? (
          <Rect x={0} y={0} width={width} height={height} fill="url(#backdropGlow)" />
        ) : null}
        {g.vignette ? (
          <Rect x={0} y={0} width={width} height={height} fill="url(#backdropVignette)" />
        ) : null}
      </Svg>
      {g.texture !== 'none' ? <Texture kind={g.texture} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
