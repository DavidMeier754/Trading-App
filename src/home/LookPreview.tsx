import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { Look, LOOKS, LookSpec, surfaceStyle, tint } from '../lesson/look';
import { colors, themed } from '../theme';

/**
 * One look (lesson/look.ts) drawn as a lesson screen in miniature: its ground,
 * its progress bar, a question with one answer picked, a chart line and the
 * key. Static -- it is a swatch to swipe past, not a lesson -- and drawn from
 * the same spec the player reads, so what it shows is what a lesson will be.
 */
function LookPreview({ id, width }: { id: Look; width: number }) {
  const spec = LOOKS[id];
  const height = Math.round(width * 1.62);
  const pad = Math.round(width * 0.07);
  const inner = width - pad * 2;
  const s = width / 210;

  return (
    // A picture of a lesson, not one: its name is on the card under it.
    <View
      aria-hidden
      style={[
        styles.frame,
        { width, height, backgroundColor: spec.ground.color, borderRadius: 18 * s },
      ]}
    >
      <Ground spec={spec} width={width} height={height} />
      <View style={[styles.body, { padding: pad, gap: 9 * s }]}>
        <View style={[styles.top, { gap: 7 * s }]}>
          <Text style={[styles.close, { fontSize: 13 * s }]}>✕</Text>
          <MiniProgress spec={spec} width={inner - 20 * s} scale={s} />
        </View>
        <Text style={[styles.prompt, { fontSize: 13 * s, lineHeight: 17 * s, marginTop: 4 * s }]}>
          Which price is the ask?
        </Text>
        <Answer spec={spec} scale={s} text="$10.02" selected />
        <Answer spec={spec} scale={s} text="$10.00" />
        <MiniChart spec={spec} width={inner} height={46 * s} />
        <View style={styles.spacer} />
        <Key spec={spec} scale={s} />
      </View>
    </View>
  );
}

export default React.memo(LookPreview);

function Answer({
  spec,
  scale,
  text,
  selected = false,
}: {
  spec: LookSpec;
  scale: number;
  text: string;
  selected?: boolean;
}) {
  const surface = surfaceStyle(spec);
  return (
    <View
      style={[
        surface,
        {
          borderRadius: spec.surface.radius * scale,
          height: 30 * scale,
          justifyContent: 'center',
          paddingHorizontal: 10 * scale,
        },
        selected && { borderColor: spec.accent, backgroundColor: tint(spec.accent, 0.16) },
      ]}
    >
      {/* ui-check: picture -- a miniature, drawn to scale */}
      <Text style={[styles.answer, { fontSize: 12 * scale }]}>{text}</Text>
    </View>
  );
}

function Key({ spec, scale }: { spec: LookSpec; scale: number }) {
  const edge = spec.cta.edge * 0.8 * scale;
  return (
    <View style={{ paddingBottom: edge }}>
      {edge > 0 ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { top: edge, backgroundColor: spec.cta.rim, borderRadius: spec.cta.radius * scale },
          ]}
        />
      ) : null}
      <View
        style={{
          height: 32 * scale,
          borderRadius: spec.cta.radius * scale,
          backgroundColor: spec.cta.face,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={[styles.keyText, { color: spec.cta.text, fontSize: 13 * scale }]}>Check</Text>
      </View>
    </View>
  );
}

/** The look's progress bar, at 55%, reduced to its idea. */
function MiniProgress({ spec, width, scale }: { spec: LookSpec; width: number; scale: number }) {
  const p = 0.55;
  const h = 12 * scale;
  const a = spec.accent;
  const track = spec.track;
  const mid = h / 2;
  let body: React.ReactNode;
  switch (spec.progress) {
    case 'tape': {
      const n = 9;
      const gap = 2.5 * scale;
      const w = (width - gap * (n - 1)) / n;
      body = Array.from({ length: n }, (_, i) => (
        <Rect
          key={i}
          x={i * (w + gap)}
          y={mid - 3 * scale}
          width={w}
          height={6 * scale}
          rx={1.5 * scale}
          fill={i < n * p ? a : track}
        />
      ));
      break;
    }
    case 'bead':
      body = (
        <>
          <Line x1={0} x2={width} y1={mid} y2={mid} stroke={track} strokeWidth={1} />
          <Line x1={0} x2={width * p} y1={mid} y2={mid} stroke={a} strokeWidth={1.2} />
          <Circle cx={width * p} cy={mid} r={5 * scale} fill={a} opacity={0.25} />
          <Circle cx={width * p} cy={mid} r={2.6 * scale} fill={a} />
        </>
      );
      break;
    case 'bold':
      body = (
        <>
          <Rect x={0} y={mid - 4.5 * scale} width={width} height={9 * scale} fill={track} />
          <Rect x={0} y={mid - 4.5 * scale} width={width * p} height={9 * scale} fill={a} />
          {Array.from({ length: 7 }, (_, i) => (
            <Line
              key={i}
              x1={(width * (i + 1)) / 8}
              x2={(width * (i + 1)) / 8}
              y1={mid - 4.5 * scale}
              y2={mid + 4.5 * scale}
              stroke={spec.ground.color}
              strokeWidth={1.5}
            />
          ))}
        </>
      );
      break;
  }
  return (
    <Svg width={width} height={h}>
      {body}
    </Svg>
  );
}

const CHART = [0.62, 0.55, 0.66, 0.48, 0.52, 0.36, 0.42, 0.28, 0.33, 0.18];

function MiniChart({ spec, width, height }: { spec: LookSpec; width: number; height: number }) {
  const d = useMemo(
    () =>
      CHART.map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'}${((width * i) / (CHART.length - 1)).toFixed(1)},${(v * height).toFixed(1)}`,
      ).join(' '),
    [width, height],
  );
  return (
    <Svg width={width} height={height}>
      {spec.chartGlow ? (
        <Path
          d={d}
          stroke={spec.chartLine}
          strokeWidth={6}
          strokeOpacity={0.22}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
      <Path
        d={d}
        stroke={spec.chartLine}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** The look's ground: its grid or texture, and its lights. */
function Ground({ spec, width, height }: { spec: LookSpec; width: number; height: number }) {
  const g = spec.ground;
  const cell = 14;
  const lines: React.ReactNode[] = [];
  const color = (major: boolean) => g.grid[major ? 1 : 0];
  for (let x = cell, i = 1; x < width; x += cell, i++) {
    lines.push(
      <Line
        key={`v${i}`}
        x1={x}
        x2={x}
        y1={0}
        y2={height}
        stroke={color(i % 4 === 0)}
        strokeWidth={0.8}
      />,
    );
  }
  for (let y = cell, i = 1; y < height; y += cell, i++) {
    lines.push(
      <Line
        key={`h${i}`}
        x1={0}
        x2={width}
        y1={y}
        y2={y}
        stroke={color(i % 4 === 0)}
        strokeWidth={0.8}
      />,
    );
  }
  // Ids are page-wide on the web, so every preview names its own gradients.
  const glow = `lpGlow-${spec.id}`;
  const vignette = `lpVignette-${spec.id}`;
  const edge = `lpEdge-${spec.id}`;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={glow} cx="50%" cy="0%" r="80%">
          <Stop offset="0" stopColor={spec.accent} stopOpacity="0.2" />
          <Stop offset="1" stopColor={spec.accent} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={vignette} cx="50%" cy="45%" r="75%">
          <Stop offset="0.55" stopColor={colors.shade} stopOpacity="0" />
          <Stop offset="1" stopColor={colors.shade} stopOpacity="0.45" />
        </RadialGradient>
        <LinearGradient id={edge} x1="0" y1="1" x2="0" y2="0.7">
          <Stop offset="0" stopColor={spec.accent} stopOpacity="0.22" />
          <Stop offset="1" stopColor={spec.accent} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {g.topGlow ? <Rect x={0} y={0} width={width} height={height} fill={`url(#${glow})`} /> : null}
      {lines}
      {g.edgeLight ? (
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${edge})`} />
      ) : null}
      {g.vignette ? (
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${vignette})`} />
      ) : null}
    </Svg>
  );
}

const styles = themed(() => ({
  frame: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  body: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  close: { color: colors.textMuted, fontWeight: '700' },
  prompt: { color: colors.text, fontWeight: '600' },
  answer: { color: colors.text, fontWeight: '500' },
  spacer: { flex: 1 },
  keyText: { fontWeight: '700' },
}));
