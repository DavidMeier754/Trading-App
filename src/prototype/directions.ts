import { Platform } from 'react-native';

/**
 * Stage LOOK-BRIEF (docs/build-plan.md): three design directions. They share
 * the screens and the copy (data.ts) and nothing else -- ground, type, shape,
 * layout of the answers, where the reveal lives and how things move are each
 * direction's own. Nothing outside src/prototype reads this file.
 */

export type DirectionId = 'calm' | 'playful' | 'precise';
export type ThemeId = 'light' | 'dark';
export type LayoutId = 'thumb' | 'today';

export type Palette = {
  ground: string;
  surface: string;
  surfaceAlt: string;
  line: string;
  lineStrong: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  up: string;
  down: string;
  amber: string;
  upTint: string;
  downTint: string;
  amberTint: string;
  accentTint: string;
  /** Four pair colours for match, told apart by more than hue (a number badge too). */
  pairs: [string, string, string, string];
};

export type TypeStep = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
};

export type Direction = {
  id: DirectionId;
  name: string;
  /** The axis it takes a position on, in a phrase. */
  axis: string;
  /** Three sentences, as in the report. */
  pitch: string[];
  palettes: Record<ThemeId, Palette>;
  font?: string;
  numberFont?: string;
  type: {
    display: TypeStep;
    title: TypeStep;
    prompt: TypeStep;
    body: TypeStep;
    answer: TypeStep;
    label: TypeStep;
    /** The smallest text anything depends on. Never below 13 (docs/UI.md §10). */
    caption: TypeStep;
  };
  radius: number;
  /** Motion, in words and numbers, as the type screen lists it. */
  motion: { screen: string; reveal: string; chart: string; complete: string };
};

const rounded = Platform.select({
  web: 'ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif',
  default: undefined,
});
const mono = Platform.select({
  web: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  ios: 'Menlo',
  android: 'monospace',
  default: undefined,
});

export const DIRECTIONS: Record<DirectionId, Direction> = {
  calm: {
    id: 'calm',
    name: 'Calm',
    axis: 'Quiet paper: whitespace, hairlines, one accent',
    pitch: [
      'A page, not a game board: warm paper in light mode, soft graphite in dark, hairlines instead of shadows and one blue accent.',
      'Every screen keeps the question at the top and the answers as full-width rows right above the button, and the reveal rises into space that was already free, so nothing jumps and nothing overlaps.',
      'Motion is a slow breath: screens cross-fade with a 6 pt rise, candles fade in one by one, the lesson ring fills once; it suits a learner who wants to concentrate for ten minutes a day.',
    ],
    palettes: {
      light: {
        ground: '#F7F5F0',
        surface: '#FFFFFF',
        surfaceAlt: '#EFECE5',
        line: '#E3DFD6',
        lineStrong: '#C9C3B7',
        text: '#1C1E22',
        muted: '#595F69',
        accent: '#2B63D9',
        onAccent: '#FFFFFF',
        up: '#1B7F53',
        down: '#C0392F',
        amber: '#94620F',
        upTint: 'rgba(27,127,83,0.10)',
        downTint: 'rgba(192,57,47,0.09)',
        amberTint: 'rgba(148,98,15,0.10)',
        accentTint: 'rgba(43,99,217,0.09)',
        pairs: ['#2B63D9', '#1B7F53', '#8A4FBF', '#B25A12'],
      },
      dark: {
        ground: '#131517',
        surface: '#1B1E22',
        surfaceAlt: '#22262B',
        line: '#2B3036',
        lineStrong: '#3C434B',
        text: '#ECEDEF',
        muted: '#A3A9B2',
        accent: '#7EA8FF',
        onAccent: '#0D1420',
        up: '#46C28C',
        down: '#F2766B',
        amber: '#E7AE55',
        upTint: 'rgba(70,194,140,0.12)',
        downTint: 'rgba(242,118,107,0.12)',
        amberTint: 'rgba(231,174,85,0.12)',
        accentTint: 'rgba(126,168,255,0.12)',
        pairs: ['#7EA8FF', '#46C28C', '#C39BF0', '#E9A15F'],
      },
    },
    type: {
      display: { fontSize: 30, lineHeight: 38, fontWeight: '600' },
      title: { fontSize: 23, lineHeight: 31, fontWeight: '600' },
      prompt: { fontSize: 20, lineHeight: 28, fontWeight: '500' },
      body: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
      answer: { fontSize: 17, lineHeight: 24, fontWeight: '500' },
      label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
      caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
    },
    radius: 12,
    motion: {
      screen: 'Cross-fade with a 6 pt rise, 320 ms, ease-out',
      reveal: 'Panel fades up 8 pt, 280 ms, no bounce',
      chart: 'Candles fade in one by one, 180 ms each, a slow last one',
      complete: 'The ring fills once, 900 ms; numbers appear, they do not count',
    },
  },
  playful: {
    id: 'playful',
    name: 'Playful',
    axis: 'Chunky and warm: big tiles, springs, colour as reward',
    pitch: [
      'Warm cream or deep plum, rounded heavy type, and chunky buttons with a real bottom edge that sink when pressed.',
      'Answers are big 2×2 tiles in the thumb zone, and the reveal is a coloured band along the bottom that carries its own button, the pattern the big learning apps use, so the verdict and the next step are one thing.',
      'Motion has a small spring: screens slide in from the side, a right answer pops, candles form tick by tick with their wicks, and the lesson ring counts the XP up and lights the streak flame.',
    ],
    palettes: {
      light: {
        ground: '#FFF7EA',
        surface: '#FFFFFF',
        surfaceAlt: '#FBEBD3',
        line: '#EFDCC0',
        lineStrong: '#D9BF99',
        text: '#2B2118',
        muted: '#6A5A49',
        accent: '#5B3FE6',
        onAccent: '#FFFFFF',
        up: '#0F7A42',
        down: '#C4282E',
        amber: '#9A5B00',
        upTint: '#DDF5E6',
        downTint: '#FDE3E2',
        amberTint: '#FCEBCB',
        accentTint: '#ECE7FF',
        pairs: ['#5B3FE6', '#0F7A42', '#D0460E', '#B0287A'],
      },
      dark: {
        ground: '#1C1530',
        surface: '#271E42',
        surfaceAlt: '#31275A',
        line: '#3A2F5E',
        lineStrong: '#54467F',
        text: '#F7F3FF',
        muted: '#C4B8E0',
        accent: '#A48CFF',
        onAccent: '#180F33',
        up: '#4ED48A',
        down: '#FF7B7F',
        amber: '#FFC05C',
        upTint: 'rgba(78,212,138,0.16)',
        downTint: 'rgba(255,123,127,0.16)',
        amberTint: 'rgba(255,192,92,0.16)',
        accentTint: 'rgba(164,140,255,0.18)',
        pairs: ['#A48CFF', '#4ED48A', '#FF9A5C', '#FF7EC8'],
      },
    },
    font: rounded,
    type: {
      display: { fontSize: 32, lineHeight: 38, fontWeight: '800' },
      title: { fontSize: 25, lineHeight: 31, fontWeight: '800' },
      prompt: { fontSize: 21, lineHeight: 28, fontWeight: '700' },
      body: { fontSize: 17, lineHeight: 25, fontWeight: '500' },
      answer: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
      label: { fontSize: 14, lineHeight: 19, fontWeight: '800', letterSpacing: 0.4 },
      caption: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
    },
    radius: 20,
    motion: {
      screen: 'Slide in from the right, spring 420 ms, a hint of overshoot',
      reveal: 'Band springs up from the bottom edge, 380 ms',
      chart: 'Each candle forms tick by tick: open, wicks, close, 320 ms',
      complete: 'Ring fills, XP counts up, the flame lights, 1.4 s',
    },
  },
  precise: {
    id: 'precise',
    name: 'Precise',
    axis: 'Dense and exact: the chart first, numbers in mono, a trading desk',
    pitch: [
      'A desk, not a toy: ink-black or cool paper, hairline panels, labels in small caps and every number in a monospaced face that lines up.',
      'The chart takes the full width, the answers are compact rows with key letters, and the reveal is a trade-log line that opens under what it judges; the map is a board of levels, not a winding path.',
      'Motion is exact and short: blocks fade in top to bottom, a live price tag follows the forming candle, numbers tick to their value, and nothing bounces.',
    ],
    palettes: {
      light: {
        ground: '#F3F5F7',
        surface: '#FFFFFF',
        surfaceAlt: '#EAEEF2',
        line: '#DCE2E8',
        lineStrong: '#BAC4CE',
        text: '#0E1318',
        muted: '#4B5866',
        accent: '#07776D',
        onAccent: '#FFFFFF',
        up: '#0F7A4D',
        down: '#C2323A',
        amber: '#8C5A00',
        upTint: 'rgba(15,122,77,0.10)',
        downTint: 'rgba(194,50,58,0.09)',
        amberTint: 'rgba(140,90,0,0.10)',
        accentTint: 'rgba(7,119,109,0.10)',
        pairs: ['#07776D', '#3D5AFE', '#A0522D', '#8E24AA'],
      },
      dark: {
        ground: '#0A0D11',
        surface: '#10151B',
        surfaceAlt: '#161C24',
        line: '#1E2630',
        lineStrong: '#2D3845',
        text: '#E4E9EF',
        muted: '#98A5B4',
        accent: '#35D0BE',
        onAccent: '#04201C',
        up: '#2FC58C',
        down: '#F25A60',
        amber: '#E9A640',
        upTint: 'rgba(47,197,140,0.12)',
        downTint: 'rgba(242,90,96,0.12)',
        amberTint: 'rgba(233,166,64,0.12)',
        accentTint: 'rgba(53,208,190,0.12)',
        pairs: ['#35D0BE', '#7C9BFF', '#F0A060', '#D98CF0'],
      },
    },
    numberFont: mono,
    type: {
      display: { fontSize: 26, lineHeight: 32, fontWeight: '600' },
      title: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
      prompt: { fontSize: 18, lineHeight: 25, fontWeight: '600' },
      body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
      answer: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
      label: { fontSize: 13, lineHeight: 17, fontWeight: '600', letterSpacing: 0.8 },
      caption: { fontSize: 13, lineHeight: 17, fontWeight: '500' },
    },
    radius: 6,
    motion: {
      screen: 'Blocks fade in top to bottom, 200 ms, 40 ms apart',
      reveal: 'A log line opens in place, 220 ms, ease-out',
      chart: 'Candles form with a live price tag, 240 ms each',
      complete: 'Numbers tick to their value, 600 ms; no confetti',
    },
  },
};

export const DIRECTION_ORDER: DirectionId[] = ['calm', 'playful', 'precise'];

export type ScreenId = 'theory' | 'choice' | 'chart' | 'match' | 'complete' | 'map' | 'type';

export const SCREENS: { id: ScreenId; name: string }[] = [
  { id: 'theory', name: 'Theory' },
  { id: 'choice', name: 'Choice' },
  { id: 'chart', name: 'Chart' },
  { id: 'match', name: 'Match' },
  { id: 'complete', name: 'Complete' },
  { id: 'map', name: 'Map' },
  { id: 'type', name: 'Type' },
];

export function isDirection(s: string | undefined): s is DirectionId {
  return !!s && s in DIRECTIONS;
}
export function isScreen(s: string | undefined): s is ScreenId {
  return !!s && SCREENS.some((x) => x.id === s);
}
