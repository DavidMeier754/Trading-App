import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';

import { fitScale, fitTop } from '../lesson/fitState';
import { Look, LOOKS, useLookSpec } from '../lesson/look';
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
 * and a phone-sized grid is only ~130 lines even drawn past the frame. Lines
 * and gradients are the parts every renderer has always supported.
 *
 * Static SVGs behind everything, `pointerEvents="none"`: one draw each, and
 * they never take a touch. The grid layer's only movement is a transform.
 */
export default function Backdrop({
  width,
  height,
  look,
}: {
  width: number;
  height: number;
  /** Draw this look's ground instead of the picked one (the home is always Classic). */
  look?: Look;
}) {
  // The grid is drawn past the frame on every side: when a screen too tall for
  // the window is scaled down to fit (lesson/fit.tsx), the grid is scaled with
  // it about the same point, and has to still reach the edges when it is.
  const extX = width / 2;
  const extY = height;
  const lines = useMemo(() => {
    const out: {
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      major: boolean;
    }[] = [];
    // Frame coordinates, shifted into the oversized layer. Line k sits where
    // it always did; the extension only adds lines beyond the frame.
    const w = width + 2 * extX;
    const h = height + 2 * extY;
    const first = (ext: number) => -Math.floor(ext / GRID);
    for (let i = first(extX); i * GRID < width + extX; i++) {
      if (i === 0) continue;
      const x = i * GRID + extX;
      out.push({ key: `v${i}`, x1: x, y1: 0, x2: x, y2: h, major: i % MAJOR_EVERY === 0 });
    }
    for (let i = first(extY); i * GRID < height + extY; i++) {
      if (i === 0) continue;
      const y = i * GRID + extY;
      out.push({ key: `h${i}`, x1: 0, y1: y, x2: w, y2: y, major: i % MAJOR_EVERY === 0 });
    }
    return out;
  }, [width, height, extX, extY]);

  // Scale about (width / 2, fitTop) in frame coordinates. The layer's own
  // centre is the frame's centre, so only the vertical offset needs undoing.
  const pullBack = useAnimatedStyle(() => {
    const s = fitScale.get();
    return { transform: [{ translateY: (fitTop.get() - height / 2) * (1 - s) }, { scale: s }] };
  });

  const picked = useLookSpec();
  const spec = look ? LOOKS[look] : picked;
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
      {g.grid !== 'none' ? (
        <Animated.View
          style={[
            styles.gridLayer,
            { left: -extX, top: -extY, width: width + 2 * extX, height: height + 2 * extY },
            pullBack,
          ]}
        >
          <Svg width={width + 2 * extX} height={height + 2 * extY}>
            {lines.map((l) => (
              <Line
                key={l.key}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={lineColor(l.major)}
                strokeWidth={1}
              />
            ))}
          </Svg>
        </Animated.View>
      ) : null}
      <Svg width={width} height={height} style={styles.fill}>
        <Defs>
          <RadialGradient id="backdropGlow" cx="50%" cy="0%" r="80%">
            <Stop offset="0" stopColor={spec.accent} stopOpacity="0.16" />
            <Stop offset="0.45" stopColor={spec.accent} stopOpacity="0.05" />
            <Stop offset="1" stopColor={spec.accent} stopOpacity="0" />
          </RadialGradient>
          {/* A lens: the edges fall off into the dark, so the eye lands in the
              middle where the lesson is. */}
          <RadialGradient id="backdropVignette" cx="50%" cy="45%" r="75%">
            <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.4" />
          </RadialGradient>
        </Defs>

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
  gridLayer: { position: 'absolute' },
});
