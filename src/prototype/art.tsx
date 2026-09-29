import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { ThemeId } from './directions';

/**
 * The mix's drawings for David's answers of 2026-09-29: the gem of the new
 * currency, the flame of the streak screens, a logo for the path in the top
 * bar, and the small scenes that stand beside the path. The gem, the flame
 * and the logo have fixed colours, like stickers: they read on every ground,
 * dark or light, and never carry text. The scenes are the opposite: drawn in
 * the ground's own ink, so they belong to it (`Deco`).
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

export type DecoKind =
  'candles' | 'gems' | 'coins' | 'summit' | 'bell' | 'chest' | 'target' | 'hourglass';

/** '#0E1116' → [14, 17, 22]. */
function rgbOf(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/**
 * The ground's own ink: the colour and strength of its heavier grid line
 * ('rgba(255, 255, 255, 0.15)' on a dark ground), which the scenes are drawn
 * in, so they sit in the ground like the grid does.
 */
export function inkOf(grid: string): { ink: string; alpha: number } {
  const m = grid.match(/rgba?\(([^)]+)\)/);
  const [r, g, b, a = '1'] = (m ? m[1] : '255, 255, 255, 0.15').split(',').map((x) => x.trim());
  const hex = [r, g, b].map((x) => Number(x).toString(16).padStart(2, '0')).join('');
  return { ink: `#${hex}`, alpha: Number(a) };
}

/**
 * A small scene beside the path (David: "fit a little more decorations at the
 * sides of the path", and on 2026-09-29: they must fit the background and not
 * stand out from it). Each is drawn in the ground's own ink, as faint as its
 * grid (`inkOf`), as outlines over a wash of that ink, with no colour and no
 * shadow; none moves.
 *
 * Drawn opaque and faded as a whole: `wash` is the ink already mixed into the
 * ground, so a part in front hides what is behind it instead of letting its
 * lines show through, and the picture fades as one piece.
 */
export function Deco({
  kind,
  size = 64,
  ink,
  ground,
  alpha,
}: {
  kind: DecoKind;
  size?: number;
  ink: string;
  /** The ground's colour, '#RRGGBB'. */
  ground: string;
  /** How strongly the ink shows: the grid line's own strength. */
  alpha: number;
}) {
  const [ir, ig, ib] = rgbOf(ink);
  const [gr, gg, gb] = rgbOf(ground);
  const w = 0.3;
  const wash = `rgb(${Math.round(gr + (ir - gr) * w)}, ${Math.round(gg + (ig - gg) * w)}, ${Math.round(gb + (ib - gb) * w)})`;
  const line = {
    stroke: ink,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" style={{ opacity: alpha }}>
      {kind === 'candles' ? (
        <G>
          {/* Wicks, then the bodies over them: hollow is up, filled is down. */}
          <Path d="M17 14V54M32 8V44M47 4V40" fill="none" {...line} />
          <Rect x={12} y={24} width={10} height={22} rx={2} fill={wash} {...line} />
          <Rect x={27} y={16} width={10} height={18} rx={2} fill={ink} {...line} />
          <Rect x={42} y={10} width={10} height={22} rx={2} fill={wash} {...line} />
        </G>
      ) : kind === 'gems' ? (
        <G>
          <G transform="translate(3 13) scale(1.6)">
            <Path d="M6 3h12l4.5 6L12 21.5 1.5 9z" fill={wash} {...line} strokeWidth={1.25} />
            <Path
              d="M1.5 9h21M6 3l2.5 6L12 3l3.5 6L18 3M8.5 9 12 21.5 15.5 9"
              fill="none"
              {...line}
              strokeWidth={0.8}
            />
          </G>
          <G transform="translate(40 33) scale(0.95)">
            <Path d="M6 3h12l4.5 6L12 21.5 1.5 9z" fill={wash} {...line} strokeWidth={2.1} />
            <Path d="M1.5 9h21" fill="none" {...line} strokeWidth={1.4} />
          </G>
        </G>
      ) : kind === 'coins' ? (
        <G>
          {[0, 1, 2].map((i) => {
            const x = 30 + i * 2;
            const y = 48 - i * 10;
            return (
              <G key={i}>
                <Path d={`M${x - 17} ${y}v6a17 5.5 0 0 0 34 0v-6`} fill={wash} {...line} />
                <Ellipse cx={x} cy={y} rx={17} ry={5.5} fill={wash} {...line} />
                {i === 2 ? (
                  <Ellipse cx={x} cy={y} rx={9} ry={2.8} fill="none" {...line} strokeWidth={1.4} />
                ) : null}
              </G>
            );
          })}
        </G>
      ) : kind === 'summit' ? (
        <G>
          <Path d="M4 58 18 38l8 7 12-24 8 10 14-15v42z" fill={wash} />
          <Path d="M4 58 18 38l8 7 12-24 8 10 14-15" fill="none" {...line} />
          <Path d="M38 21V5" fill="none" {...line} />
          <Path d="M38 5h13l-4 4.5 4 4.5H38z" fill={ink} {...line} strokeWidth={1.5} />
        </G>
      ) : kind === 'bell' ? (
        <G>
          <Path d="M32 11V6" fill="none" {...line} />
          <Circle cx={32} cy={5} r={2.2} fill={ink} />
          <Path d="M27 46a5 5 0 0 0 10 0" fill={wash} {...line} />
          <Path
            d="M32 11c-9 0-14 7.5-14 17v10l-5 8h38l-5-8V28c0-9.5-5-17-14-17z"
            fill={wash}
            {...line}
          />
          <Path d="M9 20c-3 4-3 10 0 14M55 20c3 4 3 10 0 14" fill="none" {...line} />
        </G>
      ) : kind === 'chest' ? (
        <G>
          <Rect x={10} y={30} width={44} height={24} rx={3} fill={wash} {...line} />
          <Path d="M10 30v-5c0-8 6-12 22-12s22 4 22 12v5z" fill={wash} {...line} />
          <Path d="M21 14v40M43 14v40" fill="none" {...line} strokeWidth={1.5} />
          <Rect x={28} y={26} width={8} height={10} rx={2} fill={ink} {...line} strokeWidth={1.5} />
        </G>
      ) : kind === 'target' ? (
        <G>
          <Circle cx={28} cy={36} r={22} fill={wash} {...line} />
          <Circle cx={28} cy={36} r={14} fill="none" {...line} />
          <Circle cx={28} cy={36} r={5.5} fill={ink} />
          {/* The arrow in the middle, from the top right. */}
          <Path d="M28 36 55 9" fill="none" {...line} />
          <Path d="M55 9l1-6M55 9l6-1M50.5 13.5l1-6M50.5 13.5l6-1" fill="none" {...line} />
        </G>
      ) : (
        <G>
          <Path
            d="M21 8c0 12 9 16 9 24s-9 12-9 24h22c0-12-9-16-9-24s9-12 9-24z"
            fill={wash}
            {...line}
          />
          <Path d="M26 18h12c-1.6 3-4 5-6 6.5-2-1.5-4.4-3.5-6-6.5z" fill={ink} />
          <Path d="M32 34v12" fill="none" {...line} strokeWidth={1.4} />
          <Path d="M25 52c1.5-3.5 4.5-5.5 7-6.5 2.5 1 5.5 3 7 6.5z" fill={ink} />
          <Path d="M16 8h32M16 56h32" fill="none" {...line} strokeWidth={2.5} />
        </G>
      )}
    </Svg>
  );
}
