import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

import { shade } from '../lesson/look';
import { colors } from '../theme';

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.4 [DESIGN-REVIEW]: every chapter ends with a medal of its
 * own -- a cut, faceted gold medal on two ribbons with the chapter's emblem
 * pressed into it. The same eight emblems for every path, by chapter number.
 */
export const EMBLEM_NAMES = [
  'coin', // 1 Market Basics
  'candle', // 2 Charts 101
  'ticket', // 3 Orders & Costs
  'layers', // 4 Reading the Market
  'scanner', // 5 Finding the Trade
  'shield', // 6 Risk & Psychology
  'cards', // 7 The Playbook
  'bell', // 8 The Trading Day
] as const;

export type EmblemName = (typeof EMBLEM_NAMES)[number];

/** The chapter's emblem; a chapter past eight takes the last one. */
export function emblemOf(chapter: number): EmblemName {
  return EMBLEM_NAMES[Math.max(0, Math.min(EMBLEM_NAMES.length - 1, chapter - 1))];
}

/** Each emblem as stroked paths on a 24 × 24 box. */
const EMBLEM_PATHS: Record<EmblemName, string[]> = {
  coin: [
    'M12 3.5a8.5 8.5 0 1 0 0.01 0',
    'M14.6 9.3c-.5-.8-1.4-1.3-2.6-1.3-1.5 0-2.6.8-2.6 1.9 0 2.6 5.3 1.4 5.3 4.2 0 1.2-1.1 1.9-2.7 1.9-1.2 0-2.2-.5-2.7-1.4',
    'M12 6.6v10.8',
  ],
  candle: ['M9 7.5h6v9H9z', 'M12 3v4.5', 'M12 16.5V21'],
  ticket: [
    'M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z',
    'M14.5 8v1.5M14.5 11.25v1.5M14.5 14.5V16',
  ],
  layers: ['M12 4l8 4-8 4-8-4z', 'M4 12l8 4 8-4', 'M4 16l8 4 8-4'],
  scanner: ['M4 8.5V5h3.5', 'M16.5 5H20v3.5', 'M20 15.5V19h-3.5', 'M7.5 19H4v-3.5', 'M7.5 12h9'],
  shield: ['M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6z', 'M9 12l2 2 4-4.5'],
  cards: [
    'M10 3.5h8a1.5 1.5 0 0 1 1.5 1.5v11',
    'M6.5 6.5h8a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 19V8a1.5 1.5 0 0 1 1.5-1.5z',
  ],
  bell: ['M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z', 'M10 20.5a2 2 0 0 0 4 0'],
};

/** Gold, the same in light and dark: a medal is a thing, not a surface. */
const GOLD = {
  light: '#F8DD86',
  mid: '#E2B33E',
  dark: '#B07F1A',
  deep: '#6E4C0E',
  shine: '#FFF4CC',
};

/** The emblem's strokes, pressed in: a dark line over a light one a hair lower. */
function Emblem({
  name,
  x,
  y,
  size,
  color,
  emboss,
}: {
  name: EmblemName;
  x: number;
  y: number;
  size: number;
  color: string;
  emboss?: string;
}) {
  const k = size / 24;
  const paths = EMBLEM_PATHS[name];
  const stroke = 2.1 / Math.max(0.6, k * 0.9);
  return (
    <G transform={`translate(${x - size / 2} ${y - size / 2}) scale(${k})`}>
      {emboss
        ? paths.map((d, i) => (
            <Path
              key={`e${i}`}
              d={d}
              transform="translate(0.45 0.55)"
              stroke={emboss}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))
        : null}
      {paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </G>
  );
}

/** The cut edge: a twelve-sided rim, its facets alternating light and dark. */
function facets(cx: number, cy: number, r: number): { d: string; light: boolean }[] {
  const n = 12;
  const pt = (k: number) => {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  return Array.from({ length: n }, (_, k) => {
    const [x1, y1] = pt(k);
    const [x2, y2] = pt(k + 1);
    return {
      d: `M${cx} ${cy}L${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}Z`,
      light: k % 2 === 0,
    };
  });
}

/**
 * The full medal on its ribbons (the chapter-complete screen), `size` wide;
 * it is 1.3 times as tall. `id` keeps the gradients of two medals on one
 * screen apart.
 */
export function Medal({
  chapter,
  size,
  ribbon = colors.accent,
  id = 'medal',
}: {
  chapter: number;
  size: number;
  ribbon?: string;
  id?: string;
}) {
  const W = 100;
  const H = 130;
  const cx = 50;
  const cy = 82;
  const R = 42;
  const ribbonDark = shade(ribbon, 0.32);
  return (
    <View
      style={{ width: size, height: (size * H) / W }}
      accessible
      accessibilityLabel={`Chapter ${chapter} medal`}
    >
      <Svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GOLD.light} />
            <Stop offset="0.55" stopColor={GOLD.mid} />
            <Stop offset="1" stopColor={GOLD.dark} />
          </LinearGradient>
          <LinearGradient id={`${id}-rim`} x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GOLD.mid} />
            <Stop offset="1" stopColor={GOLD.deep} />
          </LinearGradient>
        </Defs>
        {/* Two ribbons crossing into a V behind the medal. */}
        <Polygon points="16,0 38,0 60,52 44,58" fill={ribbonDark} />
        <Polygon points="62,0 84,0 56,58 40,52" fill={ribbon} />
        <Polygon points="69,0 75,0 51,56 47,54" fill={colors.surface} opacity={0.55} />
        {/* The cut rim, then the face, then the emblem pressed into it. */}
        <Circle cx={cx} cy={cy} r={R + 1.5} fill={GOLD.deep} />
        {facets(cx, cy, R).map((f, i) => (
          <Path key={i} d={f.d} fill={f.light ? GOLD.light : `url(#${id}-rim)`} />
        ))}
        <Circle cx={cx} cy={cy} r={R * 0.7} fill={`url(#${id}-face)`} />
        <Circle
          cx={cx}
          cy={cy}
          r={R * 0.7}
          fill="none"
          stroke={GOLD.deep}
          strokeOpacity={0.45}
          strokeWidth={1.2}
        />
        <Emblem
          name={emblemOf(chapter)}
          x={cx}
          y={cy}
          size={R * 0.92}
          color={GOLD.deep}
          emboss={GOLD.shine}
        />
      </Svg>
    </View>
  );
}

/** Where the face of the medal sits in its box, for an overlay (the light run). */
export function medalFace(size: number): { cx: number; cy: number; r: number } {
  const k = size / 100;
  return { cx: 50 * k, cy: 82 * k, r: 42 * k };
}

/**
 * A small coin of a chapter's medal, without ribbons: the shelf on Account and
 * the row on the chapter-complete screen. `earned` is gold; a chapter still
 * ahead is an outline with its emblem faint, so the path ahead shows its shape.
 */
export function MedalCoin({
  chapter,
  size,
  earned,
  id = `coin-${chapter}`,
}: {
  chapter: number;
  size: number;
  earned: boolean;
  id?: string;
}) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {earned ? (
        <>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={GOLD.light} />
              <Stop offset="1" stopColor={GOLD.dark} />
            </LinearGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c - 0.5} fill={GOLD.deep} />
          <Circle cx={c} cy={c} r={c - 2} fill={`url(#${id})`} />
          <Emblem
            name={emblemOf(chapter)}
            x={c}
            y={c}
            size={size * 0.6}
            color={GOLD.deep}
            emboss={GOLD.shine}
          />
        </>
      ) : (
        <>
          <Circle
            cx={c}
            cy={c}
            r={c - 1.5}
            fill="none"
            stroke={colors.borderStrong}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <Emblem
            name={emblemOf(chapter)}
            x={c}
            y={c}
            size={size * 0.56}
            color={colors.textFaint}
          />
        </>
      )}
    </Svg>
  );
}
