import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

/**
 * The home screen's icons, drawn rather than pulled from an icon font: the app
 * has no icon dependency, and a dozen 24-point glyphs are cheaper than one.
 * Filled icons for the HUD and the nodes; outlines for the tab bar at rest,
 * filled for the tab that is open.
 */
export type IconName =
  | 'flame'
  | 'bolt'
  | 'heart'
  | 'lock'
  | 'check'
  | 'star'
  | 'gear'
  | 'back'
  | 'next'
  | 'learn'
  | 'practice'
  | 'leaderboard'
  | 'account'
  | 'play'
  | 'flask'
  | 'reset'
  | 'news'
  | 'globe'
  | 'bank'
  | 'trophy'
  | 'signpost'
  | 'shield'
  | 'chevron-down'
  | 'target'
  | 'clock'
  | 'calendar'
  | 'bulb'
  | 'repeat'
  | 'quiz';

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
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
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
          <Path d={teeth.join(' ')} fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
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
          <Path d="M7.5 3.5h9v5.5a4.5 4.5 0 0 1-9 0z" fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M7.5 5.5H4.5V7a3 3 0 0 0 3 3M16.5 5.5h3V7a3 3 0 0 1-3 3" fill="none" {...stroke} />
          <Path d="M12 13.5v4M8 20.5h8" fill="none" {...stroke} />
        </>
      );
      break;
    case 'signpost':
      // Two boards pointing different ways from one post: a choice of road.
      body = (
        <>
          <Path d="M12 3v18" fill="none" {...stroke} />
          <Path d="M12 5h6.5l2 2-2 2H12z" fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M12 11H5.5l-2 2 2 2H12z" fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
        </>
      );
      break;
    case 'shield':
      body = <Path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z" fill={fill} {...stroke} />;
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
          <Path d="M6.5 12v5.5M10.2 12v5.5M13.8 12v5.5M17.5 12v5.5M4 20h16" fill="none" {...stroke} />
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
          <Path d="M6 5V2.5l4 1.3-4 1.4" fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
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
          <Path d="M7.5 5.5H4.5v1.5a3 3 0 0 0 3 3M16.5 5.5h3v1.5a3 3 0 0 1-3 3" fill="none" {...stroke} />
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
      body = <Path d="M8 5.5v13l10.5-6.5z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />;
      break;
    case 'flask':
      body = (
        <>
          <Path d="M9.5 3h5M10.5 3v6L5.2 18.2A1.8 1.8 0 0 0 6.8 21h10.4a1.8 1.8 0 0 0 1.6-2.8L13.5 9V3" fill="none" {...stroke} />
          <Path d="M7.7 15h8.6" fill="none" {...stroke} />
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
