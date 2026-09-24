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
  | 'reset';

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
