import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { ThemeId } from './directions';

/**
 * The mix's drawings for David's answers of 2026-09-29: the gem of the new
 * currency, the flame of the streak screens, a logo for the path in the top
 * bar, and the small scenes that stand beside the path. Colours are fixed
 * rather than the look's, like stickers: they read on every ground, dark or
 * light, and never carry text.
 */

/** The gem's colour on each ground. */
export const GEM: Record<ThemeId, string> = { dark: '#3CC6E8', light: '#0A87AD' };

/** A cut gem: the currency in the top bar. */
export function Gem({ size = 22, color = GEM.dark }: { size?: number; color?: string }) {
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
 * flame gone cold, for the lost screen.
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

/**
 * The path's logo in the top bar: which of the three paths this map is. A
 * stand-in until stage BRAND draws the real ones; Scalping's is a fast
 * zigzag of price.
 */
export function PathLogo({ size = 30, face, mark }: { size?: number; face: string; mark: string }) {
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

export type DecoKind = 'candles' | 'gems' | 'coins' | 'summit' | 'bell' | 'chest';

/**
 * A small scene beside the path (David: "fit a little more decorations at the
 * sides of the path"). Each stands on a soft shadow; none moves.
 */
export function Deco({
  kind,
  size = 64,
  theme,
}: {
  kind: DecoKind;
  size?: number;
  theme: ThemeId;
}) {
  const shadow = theme === 'dark' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(16, 24, 40, 0.1)';
  const up = theme === 'dark' ? '#26C281' : '#1E9E63';
  const down = theme === 'dark' ? '#F0574F' : '#D6423C';
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={58} rx={24} ry={4.5} fill={shadow} />
      {kind === 'candles' ? (
        <G>
          <Path d="M17 20v36M32 12v32M47 6v34" stroke="#8C98A8" strokeWidth={2} />
          <Rect x={12} y={28} width={10} height={20} rx={2.5} fill={up} />
          <Rect x={27} y={18} width={10} height={17} rx={2.5} fill={down} />
          <Rect x={42} y={12} width={10} height={20} rx={2.5} fill={up} />
          <Rect x={12} y={28} width={10} height={5} rx={2.5} fill="#FFFFFF" opacity={0.22} />
          <Rect x={42} y={12} width={10} height={5} rx={2.5} fill="#FFFFFF" opacity={0.22} />
        </G>
      ) : kind === 'gems' ? (
        <G>
          <G transform="translate(4 14) scale(1.55)">
            <Path d="M6 3h12l4.5 6L12 21.5 1.5 9z" fill={GEM[theme]} />
            <Path d="M6 3h12l4.5 6h-21z" fill="#FFFFFF" opacity={0.32} />
            <Path d="M8.5 9 12 21.5 15.5 9z" fill="#FFFFFF" opacity={0.2} />
          </G>
          <G transform="translate(38 32) scale(0.95)">
            <Path d="M6 3h12l4.5 6L12 21.5 1.5 9z" fill="#B18CFF" />
            <Path d="M6 3h12l4.5 6h-21z" fill="#FFFFFF" opacity={0.32} />
          </G>
        </G>
      ) : kind === 'coins' ? (
        <G>
          {[44, 36, 28].map((y, i) => (
            <G key={y}>
              <Rect x={14 + i * 2} y={y} width={34} height={8} fill="#B8741A" />
              <Ellipse cx={31 + i * 2} cy={y + 8} rx={17} ry={5.5} fill="#B8741A" />
              <Ellipse cx={31 + i * 2} cy={y} rx={17} ry={5.5} fill="#F2B544" />
              <Ellipse
                cx={31 + i * 2}
                cy={y}
                rx={10}
                ry={3}
                fill="none"
                stroke="#FFE08A"
                strokeWidth={1.5}
              />
            </G>
          ))}
        </G>
      ) : kind === 'summit' ? (
        <G>
          <Path d="M4 56 18 36l8 7 12-24 8 10 14-15v42H4z" fill={up} opacity={0.22} />
          <Path
            d="M4 56 18 36l8 7 12-24 8 10 14-15"
            fill="none"
            stroke={up}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path d="M38 19V4" stroke="#8C98A8" strokeWidth={2} strokeLinecap="round" />
          <Path d="M38 4h14l-4 4.5 4 4.5H38z" fill={down} />
        </G>
      ) : kind === 'bell' ? (
        <G>
          <Path d="M32 10c-10 0-15 8-15 18v10l-5 8h40l-5-8V28c0-10-5-18-15-18z" fill="#F2B544" />
          <Path d="M17 30c0-8 4-14 11-16" stroke="#FFE08A" strokeWidth={2.5} fill="none" />
          <Circle cx={32} cy={50} r={5} fill="#B8741A" />
          <Rect x={29} y={5} width={6} height={6} rx={2} fill="#B8741A" />
          <Path
            d="M8 20c-3 4-3 10 0 14M56 20c3 4 3 10 0 14"
            stroke="#8C98A8"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      ) : (
        <G>
          <Rect x={10} y={30} width={44} height={24} rx={3} fill="#8B5A2B" />
          <Path d="M10 30v-6c0-8 6-12 22-12s22 4 22 12v6z" fill="#A86B32" />
          <Rect x={10} y={29} width={44} height={4} fill="#6B4220" />
          <Rect x={19} y={12.5} width={4} height={41.5} fill="#6B4220" opacity={0.6} />
          <Rect x={41} y={12.5} width={4} height={41.5} fill="#6B4220" opacity={0.6} />
          <Rect x={28} y={27} width={8} height={11} rx={2} fill="#F2B544" />
          <Circle cx={32} cy={32} r={1.6} fill="#6B4220" />
        </G>
      )}
    </Svg>
  );
}
