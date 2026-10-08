import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import Icon, { type IconName } from './icons';

/**
 * The map's drawings (docs/ui/11-top-bar.md §7.2), from David's answers in stage
 * LOOK-BRIEF: a logo for the path in the top bar, the gem of the currency and
 * the streak's flame for the streak screens. They are like stickers and never
 * carry text. (The drawings in the path's background went on 2026-10-01:
 * "Remove the background decoration".)
 */

/**
 * The path's logo in the top bar: which of the three paths this map is. A
 * stand-in until stage BRAND draws the real ones: the path's own icon from the
 * path choice (a bolt for Scalping, a clock for Day Trading, a calendar for
 * Swing Trading) on the key's colours, and before a path is chosen a fast
 * zigzag of price.
 */
export function PathLogo({
  size = 30,
  face,
  mark,
  icon,
}: {
  size?: number;
  face: string;
  mark: string;
  /** The chosen path's icon; none before a path is chosen. */
  icon?: IconName;
}) {
  if (icon) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: (size * 8) / 30,
          backgroundColor: face,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={Math.round(size * 0.64)} color={mark} filled strokeWidth={2.4} />
      </View>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      <Rect x={0} y={0} width={30} height={30} rx={8} fill={face} />
      <Path
        d="M6 19l4.5-5 3.5 3.5L19.5 9l4.5 4.5"
        fill="none"
        stroke={mark}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={24} cy={13.5} r={2.2} fill={mark} />
    </Svg>
  );
}

/** A cut gem, the currency in the top bar (David, 2026-09-30): the prototype's, in `colors.gem`. */
export function Gem({ size = 22, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 3h12l4.5 6L12 21.5 1.5 9z" fill={color} />
      <Path d="M6 3h12l4.5 6h-21z" fill="#FFFFFF" opacity={0.3} />
      <Path d="M8.5 9 12 21.5 15.5 9z" fill="#FFFFFF" opacity={0.2} />
      <Path
        d="M6 3l2.5 6L12 3l3.5 6L18 3"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={0.55}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * docs/ui/11-top-bar.md §7.2 [DESIGN-REVIEW] "The flame grows with the streak" (David's
 * pick of 2026-10-04): the streak's flame in four tiers, one for each stretch
 * of days -- a small orange spark, the streak's flame from 3 days, a red blaze
 * with more tongues from a week, and a blue and white flame from a month.
 */
export type FlameTier = {
  days: number;
  name: string;
  shape: 'spark' | 'flame' | 'blaze';
  outer: [string, string];
  inner: [string, string];
  /** The blaze's side tongues. */
  tongue?: [string, string];
  /** Its sparks, round the smallest. */
  ember: string;
};

export const FLAME_TIERS: FlameTier[] = [
  {
    days: 1,
    name: 'Spark',
    shape: 'spark',
    outer: ['#FF7A1A', '#FFB648'],
    inner: ['#FFD54A', '#FFF6D6'],
    ember: '#FFC24A',
  },
  {
    days: 3,
    name: 'Flame',
    shape: 'flame',
    outer: ['#FF6A1A', '#FFB02E'],
    inner: ['#FFD23F', '#FFF4C2'],
    ember: '#FFB02E',
  },
  {
    days: 7,
    name: 'Blaze',
    shape: 'blaze',
    outer: ['#F0441C', '#FFA02E'],
    inner: ['#FFC93F', '#FFF4C2'],
    tongue: ['#E5301B', '#FF8A2A'],
    ember: '#FF9A2E',
  },
  {
    days: 30,
    name: 'Blue flame',
    shape: 'blaze',
    outer: ['#2A6BFF', '#6CCBFF'],
    inner: ['#BDEEFF', '#FFFFFF'],
    tongue: ['#1B4FE0', '#43A6FF'],
    ember: '#A8E4FF',
  },
];

/** The tier a streak of `days` days burns at. */
export function flameTier(days: number): FlameTier {
  let tier = FLAME_TIERS[0];
  for (const t of FLAME_TIERS) if (days >= t.days) tier = t;
  return tier;
}

// The drawings, on a 100 x 120 grid.
const FLAME_OUTER =
  'M50 4c7 21 32 36 32 68 0 26-15 44-32 44S18 98 18 72c0-16 8-27 16-35 0 14 5 22 12 25-4-18-2-39 4-58z';
const FLAME_INNER =
  'M51 50c5 14 18 21 18 38 0 14-8 22-19 22s-18-8-18-22c0-9 5-15 10-19 0 7 3 11 7 12-2-8-1-20 2-31z';
const SPARK_OUTER = 'M50 34c7 17 22 29 22 52 0 18-10 30-22 30S28 104 28 86c0-23 15-35 22-52z';
const SPARK_INNER = 'M50 68c4 9 11 14 11 24 0 9-5 15-11 15s-11-6-11-15c0-10 7-15 11-24z';
const TONGUE_L =
  'M24 30C30 50 40 62 40 84C40 100 32 112 24 114C14 110 8 100 8 86C8 66 20 56 24 30Z';
const TONGUE_R =
  'M76 30C70 50 60 62 60 84C60 100 68 112 76 114C86 110 92 100 92 86C92 66 80 56 76 30Z';
const FLAME_CORE = 'M50 80c3 7 8 10 8 17 0 6-4 10-8 10s-8-4-8-10c0-7 5-10 8-17z';

/** A curved four-point star of radius `r` at (cx, cy): the sparks round the smallest flame. */
function twinkle(cx: number, cy: number, r: number): string {
  const p = (dx: number, dy: number) => `${(cx + dx * r).toFixed(1)} ${(cy + dy * r).toFixed(1)}`;
  return (
    `M${p(0, -1)}C${p(0.1, -0.4)} ${p(0.4, -0.1)} ${p(1, 0)}` +
    `C${p(0.4, 0.1)} ${p(0.1, 0.4)} ${p(0, 1)}` +
    `C${p(-0.1, 0.4)} ${p(-0.4, 0.1)} ${p(-1, 0)}` +
    `C${p(-0.4, -0.1)} ${p(-0.1, -0.4)} ${p(0, -1)}Z`
  );
}

/**
 * How far down its 120-unit frame each shape's ink reaches, top and bottom:
 * the spark is drawn in the lower two thirds, the flames from near the top.
 */
const INK_Y: Record<FlameTier['shape'], [number, number]> = {
  spark: [34, 116],
  flame: [4, 116],
  blaze: [4, 116],
};

/**
 * The streak's flame: an outer and an inner tongue, in the tier of `days`
 * (FLAME_TIERS). `lit` false is the flame gone cold, for the screen of a lost
 * streak (lesson/StreakScreens.tsx): the streak's own shape, in grey.
 */
export function Flame({
  size = 120,
  lit = true,
  days = 3,
  id,
  centred = false,
}: {
  size?: number;
  lit?: boolean;
  /** The streak it burns for: its tier. */
  days?: number;
  id: string;
  /**
   * The ink in the middle of the frame, at the same size: for the top bar,
   * where the flame sits beside the streak's number and has to line up with
   * it. Unset, every tier stands on the frame's floor, as on the streak
   * screens, where the flame grows from the same base.
   */
  centred?: boolean;
}) {
  const tier = lit ? flameTier(days) : FLAME_TIERS[1];
  const [inkTop, inkBottom] = INK_Y[tier.shape];
  const shift = centred ? (inkTop + inkBottom) / 2 - 60 : 0;
  const outer = lit ? tier.outer : ['#56606D', '#7C8795'];
  const inner = lit ? tier.inner : ['#8A95A3', '#B7C0CB'];
  const spark = tier.shape === 'spark';
  return (
    <Svg width={size} height={size * 1.2} viewBox={`0 ${shift} 100 120`}>
      <Defs>
        <LinearGradient id={`${id}o`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={outer[0]} />
          <Stop offset="1" stopColor={outer[1]} />
        </LinearGradient>
        <LinearGradient id={`${id}i`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={inner[0]} />
          <Stop offset="1" stopColor={inner[1]} />
        </LinearGradient>
        {tier.tongue ? (
          <LinearGradient id={`${id}t`} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={tier.tongue[0]} />
            <Stop offset="1" stopColor={tier.tongue[1]} />
          </LinearGradient>
        ) : null}
      </Defs>
      {tier.tongue ? <Path d={TONGUE_L} fill={`url(#${id}t)`} /> : null}
      {tier.tongue ? <Path d={TONGUE_R} fill={`url(#${id}t)`} /> : null}
      <Path d={spark ? SPARK_OUTER : FLAME_OUTER} fill={`url(#${id}o)`} />
      <Path d={spark ? SPARK_INNER : FLAME_INNER} fill={`url(#${id}i)`} />
      {tier.shape === 'blaze' ? <Path d={FLAME_CORE} fill="#FFFFFF" opacity={0.85} /> : null}
      {spark && lit ? <Path d={twinkle(20, 50, 6)} fill={tier.ember} /> : null}
      {spark && lit ? <Path d={twinkle(78, 36, 4.5)} fill={tier.ember} /> : null}
    </Svg>
  );
}
