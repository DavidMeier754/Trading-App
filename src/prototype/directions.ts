import { Platform } from 'react-native';

/**
 * Stage LOOK-BRIEF (docs/build-plan.md): three design directions. They share
 * the screens and the copy (data.ts) and nothing else -- ground, type, shape,
 * layout of the answers, where the reveal lives and how things move are each
 * direction's own. Nothing outside src/prototype reads this file.
 *
 * The fourth, `mix`, is David's answer (2026-09-29): Calm as the base, on the
 * ground, surfaces, key and progress bar of today's designs Neo, Neo Mono and
 * Classic Contrast, with a few parts of Precise. It is Calm's screens in a
 * skin (MIX_LOOKS below), not a fifth set of screens.
 */

export type DirectionId = 'mix' | 'calm' | 'playful' | 'precise';
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

/** Calm's type scale, which the mix keeps. */
const CALM_TYPE: Direction['type'] = {
  display: { fontSize: 30, lineHeight: 38, fontWeight: '600' },
  title: { fontSize: 23, lineHeight: 31, fontWeight: '600' },
  prompt: { fontSize: 20, lineHeight: 28, fontWeight: '500' },
  body: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  answer: { fontSize: 17, lineHeight: 24, fontWeight: '500' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
};

// ---------------------------------------------------------------------------
// The mix: Calm on today's designs
// ---------------------------------------------------------------------------

/** The three of today's nine designs that ship (docs/UI.md §10). */
export type MixLookId = 'neo' | 'neoMono' | 'classicContrast';
export const MIX_LOOK_ORDER: MixLookId[] = ['neo', 'neoMono', 'classicContrast'];

/**
 * What a design of today (src/lesson/look.ts) brings to the mix: the ground
 * under everything, the resting surface of an answer or a card, the key (the
 * main button) and the progress bar. The dark values are today's own; the
 * light ones are new, because today's designs only come in dark.
 */
export type Skin = {
  look: MixLookId;
  name: string;
  ground: {
    grain: boolean;
    /** The hairline grid: a cell line and every fourth, heavier one. */
    grid: [string, string];
    /** The soft light at the top edge, in this colour; null for none. */
    glow: string | null;
    vignette: boolean;
    /** Light from the bottom edge when an answer lands (components/Atmosphere.tsx). */
    edgeLight: boolean;
  };
  surface: {
    background: string;
    border: string;
    /** A lighter top border: glass catching the light. */
    borderTop?: string;
    radius: number;
    borderWidth: number;
  };
  key: { face: string; rim: string; text: string; radius: number; edge: number };
  progress: 'tape' | 'bead' | 'bold';
  /** The empty part of the progress bar. */
  track: string;
};

const DARK_TEXT = {
  text: '#E8ECF1',
  muted: '#93A0B1',
  up: '#26C281',
  down: '#F0574F',
  amber: '#E5A23C',
  upTint: 'rgba(38, 194, 129, 0.14)',
  downTint: 'rgba(240, 87, 79, 0.14)',
  amberTint: 'rgba(229, 162, 60, 0.14)',
};
const LIGHT_TEXT = {
  text: '#121821',
  muted: '#4E5967',
  up: '#157347',
  down: '#BF2F2A',
  amber: '#895800',
  upTint: 'rgba(21, 115, 71, 0.10)',
  downTint: 'rgba(191, 47, 42, 0.09)',
  amberTint: 'rgba(137, 88, 0, 0.10)',
};
const DARK_GRID: [string, string] = ['rgba(255, 255, 255, 0.075)', 'rgba(255, 255, 255, 0.15)'];
const DARK_PAIRS: Palette['pairs'] = ['#4C8DFF', '#26C281', '#B18CFF', '#E5A23C'];
const LIGHT_PAIRS: Palette['pairs'] = ['#2360D8', '#157347', '#7B4FD0', '#A9560F'];

export const MIX_LOOKS: Record<
  MixLookId,
  { name: string; blurb: string; theme: Record<ThemeId, { p: Palette; skin: Skin }> }
> = {
  neo: {
    name: 'Neo',
    blurb: 'Grain, glass and a blue key that sinks when pressed.',
    theme: {
      dark: {
        p: {
          ground: '#0E1116',
          surface: 'rgba(23, 28, 35, 0.62)',
          surfaceAlt: '#1F2630',
          line: 'rgba(255, 255, 255, 0.10)',
          lineStrong: 'rgba(255, 255, 255, 0.24)',
          ...DARK_TEXT,
          accent: '#4C8DFF',
          onAccent: '#0B1220',
          accentTint: 'rgba(76, 141, 255, 0.14)',
          pairs: DARK_PAIRS,
        },
        skin: {
          look: 'neo',
          name: 'Neo',
          ground: {
            grain: true,
            grid: DARK_GRID,
            glow: '#4C8DFF',
            vignette: true,
            edgeLight: true,
          },
          surface: {
            background: 'rgba(23, 28, 35, 0.62)',
            border: 'rgba(255, 255, 255, 0.13)',
            borderTop: 'rgba(255, 255, 255, 0.26)',
            radius: 10,
            borderWidth: 1.5,
          },
          // Today's blue (#4C8DFF) holds white text at 3.2 : 1; one shade
          // deeper it holds 4.6 : 1, which LOOK-SYSTEM's contrast rule asks for.
          key: { face: '#2F6FEB', rim: '#2257C4', text: '#FFFFFF', radius: 12, edge: 4 },
          progress: 'tape',
          track: 'rgba(255, 255, 255, 0.09)',
        },
      },
      light: {
        p: {
          ground: '#EEF1F5',
          surface: 'rgba(255, 255, 255, 0.74)',
          surfaceAlt: '#DEE3EA',
          line: 'rgba(16, 24, 40, 0.10)',
          lineStrong: 'rgba(16, 24, 40, 0.22)',
          ...LIGHT_TEXT,
          accent: '#2360D8',
          onAccent: '#FFFFFF',
          accentTint: 'rgba(35, 96, 216, 0.10)',
          pairs: LIGHT_PAIRS,
        },
        skin: {
          look: 'neo',
          name: 'Neo',
          ground: {
            grain: true,
            grid: ['rgba(16, 24, 40, 0.06)', 'rgba(16, 24, 40, 0.11)'],
            glow: '#2360D8',
            vignette: false,
            edgeLight: true,
          },
          surface: {
            background: 'rgba(255, 255, 255, 0.74)',
            border: 'rgba(16, 24, 40, 0.12)',
            radius: 10,
            borderWidth: 1.5,
          },
          key: { face: '#2360D8', rim: '#1A48A6', text: '#FFFFFF', radius: 12, edge: 4 },
          progress: 'tape',
          track: 'rgba(16, 24, 40, 0.10)',
        },
      },
    },
  },
  neoMono: {
    name: 'Neo Mono',
    blurb: 'Neo in black and white, with a pill key and a bead of light.',
    theme: {
      dark: {
        p: {
          ground: '#0B0C0E',
          surface: 'rgba(24, 26, 30, 0.6)',
          surfaceAlt: '#1C1E22',
          line: 'rgba(255, 255, 255, 0.09)',
          lineStrong: 'rgba(255, 255, 255, 0.28)',
          ...DARK_TEXT,
          accent: '#E9ECF1',
          onAccent: '#0B0C0E',
          accentTint: 'rgba(233, 236, 241, 0.10)',
          pairs: ['#E9ECF1', '#26C281', '#B18CFF', '#E5A23C'],
        },
        skin: {
          look: 'neoMono',
          name: 'Neo Mono',
          ground: {
            grain: true,
            grid: DARK_GRID,
            glow: '#E9ECF1',
            vignette: true,
            edgeLight: true,
          },
          surface: {
            background: 'rgba(24, 26, 30, 0.6)',
            border: 'rgba(255, 255, 255, 0.10)',
            borderTop: 'rgba(255, 255, 255, 0.30)',
            radius: 14,
            borderWidth: 1,
          },
          key: { face: '#F1F3F6', rim: '#8E96A3', text: '#0B0C0E', radius: 26, edge: 0 },
          progress: 'bead',
          track: 'rgba(255, 255, 255, 0.12)',
        },
      },
      light: {
        p: {
          ground: '#F1F2F4',
          surface: 'rgba(255, 255, 255, 0.8)',
          surfaceAlt: '#E2E4E8',
          line: 'rgba(0, 0, 0, 0.09)',
          lineStrong: 'rgba(0, 0, 0, 0.24)',
          ...LIGHT_TEXT,
          accent: '#15171B',
          onAccent: '#FFFFFF',
          accentTint: 'rgba(21, 23, 27, 0.07)',
          pairs: ['#15171B', '#157347', '#7B4FD0', '#A9560F'],
        },
        skin: {
          look: 'neoMono',
          name: 'Neo Mono',
          ground: {
            grain: true,
            grid: ['rgba(0, 0, 0, 0.055)', 'rgba(0, 0, 0, 0.10)'],
            glow: null,
            vignette: false,
            edgeLight: true,
          },
          surface: {
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'rgba(0, 0, 0, 0.09)',
            radius: 14,
            borderWidth: 1,
          },
          key: { face: '#15171B', rim: '#000000', text: '#FFFFFF', radius: 26, edge: 0 },
          progress: 'bead',
          track: 'rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  classicContrast: {
    name: 'Classic Contrast',
    blurb: 'Pure black or white, strong outlines and a bold bar.',
    theme: {
      dark: {
        p: {
          ground: '#000000',
          surface: '#000000',
          surfaceAlt: '#1A1A1A',
          line: 'rgba(255, 255, 255, 0.28)',
          lineStrong: 'rgba(255, 255, 255, 0.62)',
          ...DARK_TEXT,
          accent: '#4FA8FF',
          onAccent: '#000000',
          accentTint: 'rgba(79, 168, 255, 0.16)',
          pairs: ['#4FA8FF', '#26C281', '#B18CFF', '#E5A23C'],
        },
        skin: {
          look: 'classicContrast',
          name: 'Classic Contrast',
          ground: { grain: false, grid: DARK_GRID, glow: null, vignette: false, edgeLight: false },
          surface: {
            background: '#000000',
            border: 'rgba(255, 255, 255, 0.62)',
            radius: 6,
            borderWidth: 2,
          },
          key: { face: '#FFFFFF', rim: '#B8C0CA', text: '#000000', radius: 6, edge: 0 },
          progress: 'bold',
          track: '#000000',
        },
      },
      light: {
        p: {
          ground: '#FFFFFF',
          surface: '#FFFFFF',
          surfaceAlt: '#EDEDED',
          line: 'rgba(0, 0, 0, 0.22)',
          lineStrong: 'rgba(0, 0, 0, 0.7)',
          ...LIGHT_TEXT,
          accent: '#0A58CA',
          onAccent: '#FFFFFF',
          accentTint: 'rgba(10, 88, 202, 0.10)',
          pairs: LIGHT_PAIRS,
        },
        skin: {
          look: 'classicContrast',
          name: 'Classic Contrast',
          ground: {
            grain: false,
            grid: ['rgba(0, 0, 0, 0.06)', 'rgba(0, 0, 0, 0.12)'],
            glow: null,
            vignette: false,
            edgeLight: false,
          },
          surface: {
            background: '#FFFFFF',
            border: 'rgba(0, 0, 0, 0.78)',
            radius: 6,
            borderWidth: 2,
          },
          key: { face: '#000000', rim: '#000000', text: '#FFFFFF', radius: 6, edge: 0 },
          progress: 'bold',
          track: '#FFFFFF',
        },
      },
    },
  },
};

export function isMixLook(s: string | null | undefined): s is MixLookId {
  return !!s && s in MIX_LOOKS;
}

/** The mix as a direction, in one of its three looks. */
export function mixDirection(look: MixLookId): Direction {
  const l = MIX_LOOKS[look];
  return {
    id: 'mix',
    name: 'Mix',
    axis: "Calm on today's designs, with Precise's chart and numbers",
    pitch: [
      "Calm's screens on the ground of today's designs: Neo's grain, glass and blue key, Neo Mono in black and white, or Classic Contrast with its strong outlines.",
      'The question stays at the top and the answers sit right above the button, and the reveal rises into space that was already free, so nothing jumps and nothing overlaps.',
      'From Precise it takes the numbers in a monospaced face that count up, the step count on the progress bar and the chart: candles that form like real ones, a live price tag and labelled levels, and the trade log in the reveal.',
    ],
    palettes: { light: l.theme.light.p, dark: l.theme.dark.p },
    numberFont: mono,
    type: CALM_TYPE,
    radius: l.theme.dark.skin.surface.radius,
    motion: {
      screen: 'Cross-fade with a 6 pt rise, 320 ms, ease-out',
      reveal: 'Panel fades up 8 pt, 280 ms, no bounce',
      chart: 'Candles form with a live price tag, 360 ms each',
      complete: 'The ring fills once, 900 ms, and its numbers count up with it',
    },
  };
}

export const DIRECTIONS: Record<DirectionId, Direction> = {
  mix: mixDirection('neo'),
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
    type: CALM_TYPE,
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

export const DIRECTION_ORDER: DirectionId[] = ['mix', 'calm', 'playful', 'precise'];

export type ScreenId =
  | 'theory'
  | 'choice'
  | 'chart'
  | 'match'
  | 'complete'
  | 'streak'
  | 'lost'
  | 'map'
  | 'bonus'
  | 'suggestions'
  | 'type';

/**
 * The screens, in the picker's order. The three directions have the stage's
 * six and the type sheet; the mix also has what David asked for on
 * 2026-09-29: the streak screens, the bonus side lesson and the page of
 * design suggestions.
 */
export const SCREENS: { id: ScreenId; name: string; mixOnly?: boolean }[] = [
  { id: 'theory', name: 'Theory' },
  { id: 'choice', name: 'Choice' },
  { id: 'chart', name: 'Chart' },
  { id: 'match', name: 'Match' },
  { id: 'complete', name: 'Complete' },
  { id: 'streak', name: 'Streak', mixOnly: true },
  { id: 'lost', name: 'Streak lost', mixOnly: true },
  { id: 'map', name: 'Map' },
  { id: 'bonus', name: 'Bonus', mixOnly: true },
  { id: 'suggestions', name: 'Suggestions', mixOnly: true },
  { id: 'type', name: 'Type' },
];

/** The screens a direction has. */
export function screensOf(dir: DirectionId): { id: ScreenId; name: string }[] {
  return SCREENS.filter((s) => dir === 'mix' || !s.mixOnly);
}

export function isDirection(s: string | undefined): s is DirectionId {
  return !!s && s in DIRECTIONS;
}
export function isScreen(s: string | undefined): s is ScreenId {
  return !!s && SCREENS.some((x) => x.id === s);
}
/** Whether `dir` has the screen `s`. */
export function hasScreen(dir: DirectionId, s: string | undefined): s is ScreenId {
  return !!s && screensOf(dir).some((x) => x.id === s);
}
