import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';

import Atmosphere, { Texture } from '../components/Atmosphere';
import { GRID } from '../theme';
import type { Skin } from './directions';
import { Press, SOUND, T, useProto, type Proto } from './kit';

/**
 * The mix's skin: the parts of today's designs (src/lesson/look.ts) that Calm's
 * screens wear in the mix -- the ground, the resting surface, the key and the
 * progress bar. Drawn here from the skin's own values rather than by the real
 * components, which read the look picked in Settings and only know dark.
 */

/** Every fourth cell line is the heavier one, as on today's ground. */
const MAJOR_EVERY = 4;

/**
 * Today's ground, as components/Backdrop.tsx draws it: the colour, the light at
 * the top edge, the hairline grid, a lens at the edges, the grain over all of
 * it, and the light from the bottom edge that answers a right or wrong answer.
 */
export function MixGround({
  skin,
  color,
  width,
  height,
}: {
  skin: Skin;
  color: string;
  width: number;
  height: number;
}) {
  const g = skin.ground;
  const lines = useMemo(() => {
    const out: { key: string; x1: number; y1: number; x2: number; y2: number; major: boolean }[] =
      [];
    for (let i = 1; i * GRID < width; i++)
      out.push({
        key: `v${i}`,
        x1: i * GRID,
        y1: 0,
        x2: i * GRID,
        y2: height,
        major: i % MAJOR_EVERY === 0,
      });
    for (let i = 1; i * GRID < height; i++)
      out.push({
        key: `h${i}`,
        x1: 0,
        y1: i * GRID,
        x2: width,
        y2: i * GRID,
        major: i % MAJOR_EVERY === 0,
      });
    return out;
  }, [width, height]);
  return (
    <View style={styles.fill} pointerEvents="none">
      <View style={[styles.fill, { backgroundColor: color }]} />
      {g.edgeLight ? <Atmosphere width={width} height={height} /> : null}
      <Svg width={width} height={height} style={styles.fill}>
        <Defs>
          {g.glow ? (
            <RadialGradient id="mixGlow" cx="50%" cy="0%" r="80%">
              <Stop offset="0" stopColor={g.glow} stopOpacity="0.16" />
              <Stop offset="0.45" stopColor={g.glow} stopOpacity="0.05" />
              <Stop offset="1" stopColor={g.glow} stopOpacity="0" />
            </RadialGradient>
          ) : null}
          <RadialGradient id="mixVignette" cx="50%" cy="45%" r="75%">
            <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.4" />
          </RadialGradient>
        </Defs>
        {g.glow ? <Rect x={0} y={0} width={width} height={height} fill="url(#mixGlow)" /> : null}
        {lines.map((l) => (
          <Line
            key={l.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={g.grid[l.major ? 1 : 0]}
            strokeWidth={1}
          />
        ))}
        {g.vignette ? (
          <Rect x={0} y={0} width={width} height={height} fill="url(#mixVignette)" />
        ) : null}
      </Svg>
      {g.grain ? <Texture kind="grain" /> : null}
    </View>
  );
}

/** A surface at rest: an answer, a card, a panel. Calm's own when there is no skin. */
export function restStyle({ p, d, skin }: Proto): ViewStyle {
  if (!skin)
    return {
      backgroundColor: p.surface,
      borderColor: p.line,
      borderWidth: 1,
      borderRadius: d.radius,
    };
  const s = skin.surface;
  return {
    backgroundColor: s.background,
    borderColor: s.border,
    ...(s.borderTop ? { borderTopColor: s.borderTop } : null),
    borderWidth: s.borderWidth,
    borderRadius: s.radius,
  };
}

/** The design's progress bar, standing still at `step` (0..1): tape, bead or bold. */
export function SkinProgress({ skin, step }: { skin: Skin; step: number }) {
  const { p, theme } = useProto();
  const cells = 12;
  if (skin.progress === 'tape') {
    const lit = Math.round(step * cells);
    return (
      <View
        style={{ flex: 1, height: 12, justifyContent: 'center' }}
        accessibilityRole="progressbar"
      >
        <View style={{ flexDirection: 'row', gap: 2, height: 6 }}>
          {Array.from({ length: cells }, (_, i) => (
            <View
              key={i}
              style={{ flex: 1, borderRadius: 1, backgroundColor: i < lit ? p.accent : skin.track }}
            />
          ))}
        </View>
        {/* The leading edge, lit: where the lesson is right now. */}
        <View
          style={{
            position: 'absolute',
            left: `${(lit / cells) * 100}%`,
            top: 0,
            width: 3,
            height: 12,
            marginLeft: -2.5,
            borderRadius: 1.5,
            backgroundColor: theme === 'dark' ? '#FFFFFF' : p.accent,
            shadowColor: theme === 'dark' ? '#FFFFFF' : p.accent,
            shadowOpacity: 0.9,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      </View>
    );
  }
  if (skin.progress === 'bead') {
    const bead = theme === 'dark' ? '#FFFFFF' : p.accent;
    return (
      <View
        style={{ flex: 1, height: 16, justifyContent: 'center' }}
        accessibilityRole="progressbar"
      >
        <View style={{ height: 2, borderRadius: 1, backgroundColor: skin.track }} />
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: `${step * 100}%`,
            height: 2,
            borderRadius: 1,
            backgroundColor: p.accent,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: `${step * 100}%`,
            marginLeft: -4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: bead,
            shadowColor: bead,
            shadowOpacity: 0.9,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      </View>
    );
  }
  // Bold: a thick bar with a notch at every screen.
  return (
    <View
      accessibilityRole="progressbar"
      style={{
        flex: 1,
        height: 12,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
        backgroundColor: skin.track,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${step * 100}%`,
          backgroundColor: p.accent,
        }}
      />
      {Array.from({ length: cells - 1 }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${((i + 1) / cells) * 100}%`,
            width: 1.5,
            backgroundColor: p.ground,
          }}
        />
      ))}
    </View>
  );
}

/**
 * The design's key: its face, corners and label colour, and for Neo a rim the
 * face sinks into when pressed. Disabled, it goes flat and grey like Calm's.
 */
export function SkinKey({
  skin,
  label,
  onPress,
  disabled,
  height = 54,
}: {
  skin: Skin;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  height?: number;
}) {
  const { p } = useProto();
  const k = skin.key;
  const edge = disabled ? 0 : k.edge;
  return (
    <View
      style={{
        borderRadius: k.radius,
        backgroundColor: edge ? k.rim : 'transparent',
        paddingBottom: edge,
      }}
    >
      <Press
        onPress={onPress}
        disabled={disabled}
        sound={SOUND.advance}
        sink={edge}
        style={{
          height,
          borderRadius: k.radius,
          backgroundColor: disabled ? p.surfaceAlt : k.face,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <T v="answer" color={disabled ? p.muted : k.text}>
          {label}
        </T>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' },
});
