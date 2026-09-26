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
import { colors } from '../theme';

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
    <View
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
        spec.surface.edge ? { borderBottomWidth: spec.surface.edge * scale } : null,
        selected && { borderColor: spec.accent, backgroundColor: tint(spec.accent, 0.16) },
      ]}
    >
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
        <Text
          style={[
            styles.keyText,
            { color: spec.accentText, fontSize: 13 * scale },
            spec.cta.uppercase && { textTransform: 'uppercase', letterSpacing: 1.2 },
          ]}
        >
          Check
        </Text>
      </View>
    </View>
  );
}

/** The look's progress bar, at 55%, reduced to its idea. */
function MiniProgress({ spec, width, scale }: { spec: LookSpec; width: number; scale: number }) {
  const p = 0.55;
  const h = 12 * scale;
  const a = spec.accent;
  const track = 'rgba(255, 255, 255, 0.13)';
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
    case 'blocks': {
      const n = 12;
      const gap = 2 * scale;
      const w = (width - gap * (n - 1)) / n;
      body = Array.from({ length: n }, (_, i) => (
        <Rect
          key={i}
          x={i * (w + gap)}
          y={mid - 4 * scale}
          width={w}
          height={8 * scale}
          fill={i < n * p ? a : 'none'}
          stroke={a}
          strokeOpacity={0.4}
          strokeWidth={1}
        />
      ));
      break;
    }
    case 'dots': {
      const n = 10;
      const step = width / n;
      body = Array.from({ length: n }, (_, i) => (
        <Circle key={i} cx={step * (i + 0.5)} cy={mid} r={3 * scale} fill={i < n * p ? a : track} />
      ));
      break;
    }
    case 'ruler':
      body = (
        <>
          <Line
            x1={0}
            x2={width}
            y1={mid + 2 * scale}
            y2={mid + 2 * scale}
            stroke={a}
            strokeOpacity={0.45}
            strokeWidth={1}
          />
          {Array.from({ length: 11 }, (_, i) => (
            <Line
              key={i}
              x1={(width * i) / 10}
              x2={(width * i) / 10}
              y1={mid + 2 * scale}
              y2={mid + (i % 5 === 0 ? -3 : 0) * scale}
              stroke={a}
              strokeOpacity={0.6}
              strokeWidth={1}
            />
          ))}
          <Path
            d={`M${width * p - 4 * scale} ${mid - 5 * scale} L${width * p + 4 * scale} ${mid - 5 * scale} L${width * p} ${mid + 1 * scale} Z`}
            fill={a}
          />
        </>
      );
      break;
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
    case 'beam':
      body = (
        <>
          <Rect
            x={0}
            y={mid - 1.5 * scale}
            width={width}
            height={3 * scale}
            rx={1.5 * scale}
            fill={track}
          />
          <Rect
            x={0}
            y={mid - 4 * scale}
            width={width * p}
            height={8 * scale}
            rx={4 * scale}
            fill={a}
            opacity={0.25}
          />
          <Rect
            x={0}
            y={mid - 1.5 * scale}
            width={width * p}
            height={3 * scale}
            rx={1.5 * scale}
            fill={a}
          />
        </>
      );
      break;
    case 'chunky':
      body = (
        <>
          <Rect
            x={0}
            y={mid - 5 * scale}
            width={width}
            height={10 * scale}
            rx={5 * scale}
            fill={track}
          />
          <Rect
            x={0}
            y={mid - 5 * scale}
            width={width * p}
            height={10 * scale}
            rx={5 * scale}
            fill={a}
          />
          <Rect
            x={3 * scale}
            y={mid - 3.5 * scale}
            width={width * p - 6 * scale}
            height={2.5 * scale}
            rx={1.2 * scale}
            fill="#FFFFFF"
            opacity={0.35}
          />
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
    default:
      body = (
        <>
          <Rect
            x={0}
            y={mid - 2 * scale}
            width={width}
            height={4 * scale}
            rx={2 * scale}
            fill={track}
          />
          <Rect
            x={0}
            y={mid - 2 * scale}
            width={width * p}
            height={4 * scale}
            rx={2 * scale}
            fill={a}
          />
        </>
      );
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
  if (g.grid !== 'none') {
    const blue = g.grid === 'blueprint';
    const color = (major: boolean) =>
      blue
        ? major
          ? 'rgba(170, 205, 255, 0.26)'
          : 'rgba(170, 205, 255, 0.11)'
        : major
          ? colors.gridLineMajor
          : colors.gridLine;
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
  }
  if (g.texture === 'scanlines') {
    for (let y = 0, i = 0; y < height; y += 3, i++) {
      lines.push(
        <Line
          key={`s${i}`}
          x1={0}
          x2={width}
          y1={y}
          y2={y}
          stroke="#FFFFFF"
          strokeOpacity={0.045}
          strokeWidth={1}
        />,
      );
    }
  }
  if (g.texture === 'dots') {
    for (let y = 8, j = 0; y < height; y += 12, j++) {
      for (let x = 8, i = 0; x < width; x += 12, i++) {
        lines.push(
          <Circle key={`d${i}-${j}`} cx={x} cy={y} r={0.9} fill="#FFFFFF" opacity={0.13} />,
        );
      }
    }
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
          <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.45" />
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

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },
  body: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  close: { color: colors.textMuted, fontWeight: '700' },
  prompt: { color: colors.text, fontWeight: '600' },
  answer: { color: colors.text, fontWeight: '500' },
  spacer: { flex: 1 },
  keyText: { fontWeight: '700' },
});
