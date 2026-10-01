import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import Icon, { type IconName } from './icons';

/**
 * The map's drawings (docs/UI.md §7.2), from David's answers in stage
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
 * The streak's flame, big: an outer and an inner tongue. `lit` false is the
 * flame gone cold, for the screen of a lost streak (lesson/StreakScreens.tsx).
 */
export function Flame({
  size = 120,
  lit = true,
  id,
}: {
  size?: number;
  lit?: boolean;
  id: string;
}) {
  const outer = lit ? ['#FF6A1A', '#FFB02E'] : ['#56606D', '#7C8795'];
  const inner = lit ? ['#FFD23F', '#FFF4C2'] : ['#8A95A3', '#B7C0CB'];
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
      <Defs>
        <LinearGradient id={`${id}o`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={outer[0]} />
          <Stop offset="1" stopColor={outer[1]} />
        </LinearGradient>
        <LinearGradient id={`${id}i`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={inner[0]} />
          <Stop offset="1" stopColor={inner[1]} />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 4c7 21 32 36 32 68 0 26-15 44-32 44S18 98 18 72c0-16 8-27 16-35 0 14 5 22 12 25-4-18-2-39 4-58z"
        fill={`url(#${id}o)`}
      />
      <Path
        d="M51 50c5 14 18 21 18 38 0 14-8 22-19 22s-18-8-18-22c0-9 5-15 10-19 0 7 3 11 7 12-2-8-1-20 2-31z"
        fill={`url(#${id}i)`}
      />
    </Svg>
  );
}
