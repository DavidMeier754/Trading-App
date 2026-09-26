import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

/**
 * The home screen's icons, drawn rather than pulled from an icon font: the app
 * has no icon dependency, and a dozen 24-point glyphs are cheaper than one.
 * Filled icons for the HUD and the nodes; outlines for the tab bar at rest,
 * filled for the tab that is open.
 */
export const ICON_NAMES = [
  'flame',
  'bolt',
  'heart',
  'lock',
  'check',
  'star',
  'gear',
  'back',
  'next',
  'learn',
  'practice',
  'leaderboard',
  'account',
  'play',
  'flask',
  'reset',
  'news',
  'globe',
  'bank',
  'trophy',
  'signpost',
  'shield',
  'chevron-down',
  'target',
  'clock',
  'calendar',
  'bulb',
  'repeat',
  'quiz',
  // What a level teaches, on its node (content/*: the header's `icon`).
  'coin',
  'scale',
  'pie',
  'ticket',
  'people',
  'drop',
  'zigzag',
  'gauge',
  'key',
  'updown',
  'hourglass',
  'book',
  'candle',
  'candles',
  'zoom',
  'volume',
  'candlevol',
  'trend',
  'pullback',
  'levels',
  'breakout',
  'bell',
  'battery',
  'rewind',
  'monitor',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export function isIconName(name: string): name is IconName {
  return (ICON_NAMES as readonly string[]).includes(name);
}

export default function Icon({
  name,
  size = 24,
  color,
  filled = false,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const fill = filled ? color : 'none';
  let body: React.ReactNode = null;
  switch (name) {
    case 'flame':
      body = (
        <Path
          d="M12 2.5c1.2 3.1 4.8 5.2 4.8 10.1a4.8 4.8 0 0 1-9.6 0c0-2.6 1.3-4.2 2.5-5.6.1 2.3 1 3.4 2.2 3.9.3-3-1-5.6.1-8.4z"
          fill={color}
        />
      );
      break;
    case 'bolt':
      body = <Path d="M13.5 2 5 13.5h6.2L10.3 22 19 10.2h-6.3z" fill={color} />;
      break;
    case 'heart':
      body = (
        <Path
          d="M12 20.5s-8.5-5.2-8.5-11.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.7c0 6-8.5 11.2-8.5 11.2z"
          fill={color}
        />
      );
      break;
    case 'lock':
      body = (
        <>
          <Rect x={5} y={10.5} width={14} height={10} rx={2.5} fill={color} />
          <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" {...stroke} />
        </>
      );
      break;
    case 'check':
      body = <Path d="M5 12.5l4.5 4.5L19 7.5" fill="none" {...stroke} />;
      break;
    case 'star':
      body = (
        <Polygon
          points="12,2.8 14.7,8.6 21,9.3 16.3,13.6 17.6,19.9 12,16.7 6.4,19.9 7.7,13.6 3,9.3 9.3,8.6"
          fill={color}
        />
      );
      break;
    case 'gear': {
      // Eight teeth round a ring, worked out rather than traced.
      const teeth: string[] = [];
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const at = (r: number, da: number) =>
          `${(12 + r * Math.cos(a + da)).toFixed(2)},${(12 + r * Math.sin(a + da)).toFixed(2)}`;
        teeth.push(`M${at(6.5, -0.28)} L${at(9.6, -0.2)} L${at(9.6, 0.2)} L${at(6.5, 0.28)}`);
      }
      body = (
        <>
          <Path
            d={teeth.join(' ')}
            fill={color}
            stroke={color}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <Circle cx={12} cy={12} r={6.6} fill="none" {...stroke} />
          <Circle cx={12} cy={12} r={2.4} fill="none" {...stroke} />
        </>
      );
      break;
    }
    case 'back':
      body = <Path d="M15 5l-7 7 7 7" fill="none" {...stroke} />;
      break;
    case 'trophy':
      body = (
        <>
          <Path
            d="M7.5 3.5h9v5.5a4.5 4.5 0 0 1-9 0z"
            fill={color}
            stroke={color}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <Path
            d="M7.5 5.5H4.5V7a3 3 0 0 0 3 3M16.5 5.5h3V7a3 3 0 0 1-3 3"
            fill="none"
            {...stroke}
          />
          <Path d="M12 13.5v4M8 20.5h8" fill="none" {...stroke} />
        </>
      );
      break;
    case 'signpost':
      // Two boards pointing different ways from one post: a choice of road.
      body = (
        <>
          <Path d="M12 3v18" fill="none" {...stroke} />
          <Path
            d="M12 5h6.5l2 2-2 2H12z"
            fill={color}
            stroke={color}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <Path
            d="M12 11H5.5l-2 2 2 2H12z"
            fill={color}
            stroke={color}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case 'shield':
      body = (
        <Path
          d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z"
          fill={fill}
          {...stroke}
        />
      );
      break;
    case 'chevron-down':
      body = <Path d="M6 9.5l6 6 6-6" fill="none" {...stroke} />;
      break;
    case 'clock':
      body = (
        <>
          <Circle cx={12} cy={12} r={8.5} fill="none" {...stroke} />
          <Path d="M12 7.5V12l3 2" fill="none" {...stroke} />
        </>
      );
      break;
    case 'calendar':
      body = (
        <>
          <Rect x={4} y={5.5} width={16} height={14.5} rx={2.5} fill="none" {...stroke} />
          <Path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" fill="none" {...stroke} />
        </>
      );
      break;
    case 'bulb':
      // A lit bulb: a level that teaches something new.
      body = (
        <>
          <Path
            d="M12 2.8a6.3 6.3 0 0 0-3.7 11.4c.8.6 1.2 1.4 1.2 2.3v.6h5v-.6c0-.9.4-1.7 1.2-2.3A6.3 6.3 0 0 0 12 2.8z"
            fill={color}
            stroke={color}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <Path d="M9.8 19.3h4.4M10.6 21.6h2.8" fill="none" {...stroke} />
        </>
      );
      break;
    case 'repeat':
      // Round again: a practice level, what was taught used once more.
      body = (
        <>
          <Path d="M4.5 11V9.8a4.3 4.3 0 0 1 4.3-4.3h10.7" fill="none" {...stroke} />
          <Path d="M16.3 2.5l3.2 3-3.2 3" fill="none" {...stroke} />
          <Path d="M19.5 13v1.2a4.3 4.3 0 0 1-4.3 4.3H4.5" fill="none" {...stroke} />
          <Path d="M7.7 21.5l-3.2-3 3.2-3" fill="none" {...stroke} />
        </>
      );
      break;
    case 'quiz':
      // A clipboard with a tick: a Checkpoint, scored.
      body = (
        <>
          <Rect x={5} y={4.5} width={14} height={16.5} rx={2.2} fill="none" {...stroke} />
          <Path d="M9 4.5V3.2h6v1.3" fill="none" {...stroke} />
          <Path d="M8.6 12.8l2.4 2.4 4.4-4.8" fill="none" {...stroke} />
        </>
      );
      break;
    case 'target':
      body = (
        <>
          <Circle cx={12} cy={12} r={8.5} fill="none" {...stroke} />
          <Circle cx={12} cy={12} r={4.5} fill="none" {...stroke} />
          <Circle cx={12} cy={12} r={1.4} fill={color} />
        </>
      );
      break;
    case 'news':
      // A folded newspaper.
      body = (
        <>
          <Rect x={3} y={5} width={14.5} height={14} rx={2} fill={fill} {...stroke} />
          <Path d="M17.5 8.5H21v8.5a2 2 0 0 1-2 2h-1.5" fill="none" {...stroke} />
          <Path d="M6.5 9.5h7.5M6.5 12.5h7.5M6.5 15.5h4.5" fill="none" {...stroke} />
        </>
      );
      break;
    case 'globe':
      body = (
        <>
          <Circle cx={12} cy={12} r={8.5} fill={fill} {...stroke} />
          <Path
            d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.2 6.1-3.8 8.5M12 3.5C9.4 5.9 8.2 8.8 8.2 12s1.2 6.1 3.8 8.5"
            fill="none"
            {...stroke}
          />
        </>
      );
      break;
    case 'bank':
      // A roof, four columns and a step: an institution.
      body = (
        <>
          <Path d="M3.5 9.5 12 4.5l8.5 5z" fill={fill} {...stroke} />
          <Path
            d="M6.5 12v5.5M10.2 12v5.5M13.8 12v5.5M17.5 12v5.5M4 20h16"
            fill="none"
            {...stroke}
          />
        </>
      );
      break;
    case 'reset':
      // Round and back to the start.
      body = (
        <>
          <Path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" fill="none" {...stroke} />
          <Path d="M5 3.5v4h4" fill="none" {...stroke} />
        </>
      );
      break;
    case 'next':
      body = <Path d="M9 5l7 7-7 7" fill="none" {...stroke} />;
      break;
    case 'learn':
      // A winding path with a flag at its end: the path map.
      body = (
        <>
          <Path d="M6 21c0-4 12-3 12-8S6 9 6 5" fill="none" {...stroke} />
          <Path
            d="M6 5V2.5l4 1.3-4 1.4"
            fill={color}
            stroke={color}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          {filled ? <Circle cx={6} cy={21} r={1.8} fill={color} /> : null}
        </>
      );
      break;
    case 'practice':
      body = (
        <>
          <Rect x={2.5} y={9} width={3} height={6} rx={1} fill={fill} {...stroke} />
          <Rect x={5.5} y={6.5} width={3.5} height={11} rx={1.2} fill={fill} {...stroke} />
          <Path d="M9 12h6" fill="none" {...stroke} />
          <Rect x={15} y={6.5} width={3.5} height={11} rx={1.2} fill={fill} {...stroke} />
          <Rect x={18.5} y={9} width={3} height={6} rx={1} fill={fill} {...stroke} />
        </>
      );
      break;
    case 'leaderboard':
      body = (
        <>
          <Path d="M7.5 3.5h9V9a4.5 4.5 0 0 1-9 0z" fill={fill} {...stroke} />
          <Path
            d="M7.5 5.5H4.5v1.5a3 3 0 0 0 3 3M16.5 5.5h3v1.5a3 3 0 0 1-3 3"
            fill="none"
            {...stroke}
          />
          <Path d="M12 13.5v4M8 20.5h8" fill="none" {...stroke} />
        </>
      );
      break;
    case 'account':
      body = (
        <>
          <Circle cx={12} cy={8} r={4} fill={fill} {...stroke} />
          <Path d="M4 20.5a8 8 0 0 1 16 0" fill={fill} {...stroke} />
        </>
      );
      break;
    case 'play':
      body = (
        <Path
          d="M8 5.5v13l10.5-6.5z"
          fill={color}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
      break;
    case 'flask':
      body = (
        <>
          <Path
            d="M9.5 3h5M10.5 3v6L5.2 18.2A1.8 1.8 0 0 0 6.8 21h10.4a1.8 1.8 0 0 0 1.6-2.8L13.5 9V3"
            fill="none"
            {...stroke}
          />
          <Path d="M7.7 15h8.6" fill="none" {...stroke} />
        </>
      );
      break;
    case 'coin':
      body = (
        <>
          <Circle cx={12} cy={12} r={8.5} fill="none" {...stroke} />
          <Path
            d="M14.6 9c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.6.8-2.6 2s1.1 1.7 2.6 2.1 2.8.8 2.8 2.2-1.2 2.1-2.8 2.1c-1.2 0-2.3-.5-2.8-1.4M12 6v1.7M12 16.3V18"
            fill="none"
            {...stroke}
          />
        </>
      );
      break;
    case 'scale':
      body = (
        <>
          <Path d="M12 5v15M8 20.5h8M4 7.5h16" fill="none" {...stroke} />
          <Circle cx={12} cy={4.2} r={1.4} fill={color} />
          <Path
            d="M6.5 7.5 3.8 13M6.5 7.5 9.2 13M17.5 7.5 14.8 13M17.5 7.5l2.7 5.5"
            fill="none"
            {...stroke}
          />
          <Path
            d="M3.3 13h6.4a3.2 3.2 0 0 1-6.4 0zM14.3 13h6.4a3.2 3.2 0 0 1-6.4 0z"
            fill={color}
            stroke={color}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case 'pie':
      body = (
        <>
          <Circle cx={12} cy={12} r={8.5} fill="none" {...stroke} />
          <Path d="M12 12V3.5A8.5 8.5 0 0 1 20.5 12z" fill={color} {...stroke} />
        </>
      );
      break;
    case 'ticket':
      body = (
        <>
          <Rect x={3.5} y={5.5} width={17} height={13} rx={2.5} fill="none" {...stroke} />
          <Path d="M12 5.5v13M6.3 10h3.2M14.5 10h3.2M6.3 14h2M14.5 14h2" fill="none" {...stroke} />
        </>
      );
      break;
    case 'people':
      body = (
        <>
          <Circle cx={9} cy={8.5} r={3.2} fill={color} />
          <Path d="M3.2 20a5.8 5.8 0 0 1 11.6 0z" fill={color} />
          <Circle cx={16.8} cy={9.3} r={2.6} fill="none" {...stroke} />
          <Path d="M16.3 14.4A5 5 0 0 1 21.3 19.5" fill="none" {...stroke} />
        </>
      );
      break;
    case 'drop':
      body = (
        <>
          <Path
            d="M12 3c3.2 4.2 6.2 7.3 6.2 11a6.2 6.2 0 0 1-12.4 0c0-3.7 3-6.8 6.2-11z"
            fill={color}
            stroke={color}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case 'zigzag':
      body = <Path d="M2.8 14.5 6.6 8l3.6 9.5 4-13 3.2 9 3.8-4.5" fill="none" {...stroke} />;
      break;
    case 'gauge':
      body = (
        <>
          <Path d="M3.5 16.5a8.5 8.5 0 0 1 17 0" fill="none" {...stroke} />
          <Path
            d="M6.4 10.3l1.3 1.1M12 7.2v1.8M17.6 10.3l-1.3 1.1M12 16.5l4.2-5"
            fill="none"
            {...stroke}
          />
          <Circle cx={12} cy={16.5} r={2} fill={color} />
        </>
      );
      break;
    case 'key':
      body = (
        <>
          <Circle cx={7.8} cy={12} r={4.3} fill="none" {...stroke} />
          <Path d="M12.1 12h8.6M17.2 12v3.2M20.5 12v2.6" fill="none" {...stroke} />
        </>
      );
      break;
    case 'updown':
      body = (
        <>
          <Path d="M8 20V4.5M4.3 8.2 8 4.5l3.7 3.7" fill="none" {...stroke} />
          <Path d="M16 4v15.5M12.3 15.8l3.7 3.7 3.7-3.7" fill="none" {...stroke} />
        </>
      );
      break;
    case 'hourglass':
      body = (
        <>
          <Path
            d="M6 3.5h12M6 20.5h12M7.5 3.5c0 4.6 4.5 5.4 4.5 8.5s-4.5 3.9-4.5 8.5M16.5 3.5c0 4.6-4.5 5.4-4.5 8.5s4.5 3.9 4.5 8.5"
            fill="none"
            {...stroke}
          />
          <Path d="M9 20.2 12 16.5l3 3.7z" fill={color} />
        </>
      );
      break;
    case 'book':
      body = (
        <Path
          d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20"
          fill="none"
          {...stroke}
        />
      );
      break;
    case 'candle':
      body = (
        <>
          <Path d="M12 2.5v4.5M12 17v4.5" fill="none" {...stroke} />
          <Rect
            x={8.2}
            y={7}
            width={7.6}
            height={10}
            rx={1.2}
            fill={color}
            stroke={color}
            strokeWidth={1.2}
          />
        </>
      );
      break;
    case 'candles':
      body = (
        <>
          <Path d="M7 4v4M7 16v4M17 2.5v4M17 14.5v6" fill="none" {...stroke} />
          <Rect
            x={4.3}
            y={8}
            width={5.4}
            height={8}
            rx={1}
            fill={color}
            stroke={color}
            strokeWidth={1.2}
          />
          <Rect x={14.3} y={6.5} width={5.4} height={8} rx={1} fill="none" {...stroke} />
        </>
      );
      break;
    case 'zoom':
      body = (
        <>
          <Circle cx={10.5} cy={10.5} r={6.5} fill="none" {...stroke} />
          <Path d="M15.3 15.3 20.5 20.5M10.5 6.8v7.4" fill="none" {...stroke} />
          <Rect x={9} y={8.6} width={3} height={3.8} rx={0.6} fill={color} />
        </>
      );
      break;
    case 'volume':
      body = (
        <>
          <Rect x={3.8} y={12} width={4.2} height={8.5} rx={1} fill={color} />
          <Rect x={9.9} y={5} width={4.2} height={15.5} rx={1} fill={color} />
          <Rect x={16} y={9} width={4.2} height={11.5} rx={1} fill={color} />
        </>
      );
      break;
    case 'candlevol':
      body = (
        <>
          <Path d="M8.5 2.5v2M8.5 11v2M15.5 4v2M15.5 11.5v2" fill="none" {...stroke} />
          <Rect x={6.3} y={4.5} width={4.4} height={6.5} rx={0.8} fill={color} />
          <Rect x={13.3} y={6} width={4.4} height={5.5} rx={0.8} fill="none" {...stroke} />
          <Rect x={6.3} y={16} width={4.4} height={5} rx={0.8} fill={color} />
          <Rect x={13.3} y={18} width={4.4} height={3} rx={0.8} fill={color} />
        </>
      );
      break;
    case 'trend':
      body = <Path d="M3.5 17.5l5-5 3.5 3 7.5-8M14.5 7.5h5v5" fill="none" {...stroke} />;
      break;
    case 'pullback':
      body = (
        <>
          <Path d="M3 18.5 9 9l4 6 7.5-10.5M15.8 4.5h4.7v4.7" fill="none" {...stroke} />
          <Circle cx={13} cy={15} r={2} fill={color} />
        </>
      );
      break;
    case 'levels':
      body = (
        <>
          <Path d="M3 5.5h18M3 18.5h18" fill="none" {...stroke} />
          <Path
            d="M5 18.5 8.5 5.5l3.5 13 3.5-13 3.5 8"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case 'breakout':
      body = (
        <>
          <Path
            d="M3 11h18"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeDasharray="2.5 3"
          />
          <Path d="M4 19l4.5-4 3 2.5 7-12.5M14.8 5h4.5v4.5" fill="none" {...stroke} />
        </>
      );
      break;
    case 'bell':
      body = (
        <>
          <Path
            d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 2.2H4.2z"
            fill={color}
            stroke={color}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <Path d="M10 21a2 2 0 0 0 4 0M12 3v2" fill="none" {...stroke} />
        </>
      );
      break;
    case 'battery':
      body = (
        <>
          <Rect x={2.8} y={7.5} width={16} height={9} rx={2} fill="none" {...stroke} />
          <Path d="M21.2 10.5v3" fill="none" {...stroke} />
          <Rect x={5.3} y={10} width={3.6} height={4} rx={0.6} fill={color} />
        </>
      );
      break;
    case 'rewind':
      body = (
        <>
          <Path
            d="M11.5 6.5v11L4 12z"
            fill={color}
            stroke={color}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <Path
            d="M20 6.5v11L12.5 12z"
            fill={color}
            stroke={color}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case 'monitor':
      body = (
        <>
          <Rect x={3} y={4.5} width={18} height={12} rx={2} fill="none" {...stroke} />
          <Path d="M9 20.5h6M12 16.5v4M6.5 13l3-3 2.5 2 3.5-4 2.5 2" fill="none" {...stroke} />
        </>
      );
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}
