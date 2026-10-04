/**
 * The three lesson designs that ship (docs/ui/15-theming-and-accessibility.md §10: Neo, Neo Mono and
 * Classic Contrast, David's choice in stage LOOK-BRIEF), each in dark and
 * light, as plain data. The other six designs went in stage LOOK-SYSTEM.
 *
 * No imports: tools/check_ui.mjs reads this file as it is and measures the
 * key's label on its face and every text colour on each design's ground and
 * resting surface.
 *
 * - `neo`: the default. A grained, lit ground whose bottom edge answers the
 *   lesson's mood, glass surfaces, a key that sinks when pressed, sparks off a
 *   right answer, a streak flame. The progress bar is a segmented tape.
 * - `neoMono`: Neo in black and white. A pill key and a hairline with a bead of
 *   light for progress.
 * - `classicContrast`: flat and at full contrast. Pure black (or white), strong
 *   outlines, a bold notched bar, rings on a right answer and nothing else.
 *
 * A design changes the ground, the surfaces, the key, the progress bar, the ink
 * of a chart line and the right-answer flourish -- never the layout, the motion
 * or a text colour that carries meaning.
 */

export type Look = 'neo' | 'neoMono' | 'classicContrast';
export type LookScheme = 'light' | 'dark';

export const LOOK_ORDER: Look[] = ['neo', 'neoMono', 'classicContrast'];

export type LookSpec = {
  id: Look;
  name: string;
  /** Its chip in the picker. */
  chip: string;
  /** One line for the picker. */
  blurb: string;
  ground: {
    color: string;
    grain: boolean;
    /** The hairline grid's two weights: a cell line and every fourth, heavier one. */
    grid: [string, string];
    /** The soft light at the top edge. */
    topGlow: boolean;
    vignette: boolean;
    /** The mood light at the bottom edge (components/Atmosphere.tsx). */
    edgeLight: boolean;
  };
  /** Answer surfaces and cards at rest. */
  surface: {
    background: string;
    border: string;
    /** A lighter top border: glass catching the light. */
    borderTop?: string;
    radius: number;
    borderWidth: number;
  };
  /** Selection, the progress fill. */
  accent: string;
  /** Text on `accent`. */
  accentText: string;
  /** The key: its face, the edge it sinks into, its label. */
  cta: { face: string; rim: string; text: string; radius: number; edge: number };
  progress: 'tape' | 'bead' | 'bold';
  /** The empty part of the progress bar. */
  track: string;
  /** The progress bar's bright leading edge (tape, bead). */
  spark: string;
  /** The chart's price line. */
  chartLine: string;
  celebrate: 'sparks' | 'rings';
  chartGlow: boolean;
  streak: 'flame' | 'none';
};

const DARK_GRID: [string, string] = ['rgba(255, 255, 255, 0.075)', 'rgba(255, 255, 255, 0.15)'];

export const LOOK_SPECS: Record<Look, Record<LookScheme, LookSpec>> = {
  neo: {
    dark: {
      id: 'neo',
      name: 'Neo',
      chip: 'Neo',
      blurb: 'Grain, glass and a blue key that sinks when pressed.',
      ground: {
        color: '#0E1116',
        grain: true,
        grid: DARK_GRID,
        topGlow: true,
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
      accent: '#5A96FF',
      accentText: '#0B1220',
      // One shade deeper than the accent, so its white label holds 4.5 : 1.
      cta: { face: '#2F6FEB', rim: '#2257C4', text: '#FFFFFF', radius: 12, edge: 4 },
      progress: 'tape',
      track: 'rgba(255, 255, 255, 0.09)',
      spark: '#FFFFFF',
      chartLine: '#5A96FF',
      celebrate: 'sparks',
      chartGlow: true,
      streak: 'flame',
    },
    light: {
      id: 'neo',
      name: 'Neo',
      chip: 'Neo',
      blurb: 'Grain, glass and a blue key that sinks when pressed.',
      ground: {
        color: '#EEF1F5',
        grain: true,
        grid: ['rgba(16, 24, 40, 0.06)', 'rgba(16, 24, 40, 0.11)'],
        topGlow: true,
        vignette: false,
        edgeLight: true,
      },
      surface: {
        background: 'rgba(255, 255, 255, 0.74)',
        border: 'rgba(16, 24, 40, 0.12)',
        radius: 10,
        borderWidth: 1.5,
      },
      accent: '#1F59CC',
      accentText: '#FFFFFF',
      cta: { face: '#2360D8', rim: '#1A48A6', text: '#FFFFFF', radius: 12, edge: 4 },
      progress: 'tape',
      track: 'rgba(16, 24, 40, 0.10)',
      spark: '#1F59CC',
      chartLine: '#1F59CC',
      celebrate: 'sparks',
      chartGlow: false,
      streak: 'flame',
    },
  },
  neoMono: {
    dark: {
      id: 'neoMono',
      name: 'Neo Mono',
      chip: 'Mono',
      blurb: 'Neo in black and white, with a pill key and a bead of light.',
      ground: {
        color: '#0B0C0E',
        grain: true,
        grid: DARK_GRID,
        topGlow: true,
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
      accent: '#E9ECF1',
      accentText: '#0B0C0E',
      cta: { face: '#F1F3F6', rim: '#8E96A3', text: '#0B0C0E', radius: 26, edge: 0 },
      progress: 'bead',
      track: 'rgba(255, 255, 255, 0.12)',
      spark: '#FFFFFF',
      chartLine: '#EEF1F5',
      celebrate: 'sparks',
      chartGlow: true,
      streak: 'flame',
    },
    light: {
      id: 'neoMono',
      name: 'Neo Mono',
      chip: 'Mono',
      blurb: 'Neo in black and white, with a pill key and a bead of light.',
      ground: {
        color: '#F1F2F4',
        grain: true,
        grid: ['rgba(0, 0, 0, 0.055)', 'rgba(0, 0, 0, 0.10)'],
        topGlow: false,
        vignette: false,
        edgeLight: true,
      },
      surface: {
        background: 'rgba(255, 255, 255, 0.8)',
        border: 'rgba(0, 0, 0, 0.09)',
        radius: 14,
        borderWidth: 1,
      },
      accent: '#15171B',
      accentText: '#FFFFFF',
      cta: { face: '#15171B', rim: '#000000', text: '#FFFFFF', radius: 26, edge: 0 },
      progress: 'bead',
      track: 'rgba(0, 0, 0, 0.12)',
      spark: '#15171B',
      chartLine: '#15171B',
      celebrate: 'sparks',
      chartGlow: false,
      streak: 'flame',
    },
  },
  classicContrast: {
    dark: {
      id: 'classicContrast',
      name: 'Classic Contrast',
      chip: 'Contrast',
      blurb: 'Pure black, strong outlines and a bold bar.',
      ground: {
        color: '#000000',
        grain: false,
        grid: DARK_GRID,
        topGlow: false,
        vignette: false,
        edgeLight: false,
      },
      surface: {
        background: '#000000',
        border: 'rgba(255, 255, 255, 0.62)',
        radius: 6,
        borderWidth: 2,
      },
      accent: '#4FA8FF',
      accentText: '#000000',
      cta: { face: '#FFFFFF', rim: '#B8C0CA', text: '#000000', radius: 6, edge: 0 },
      progress: 'bold',
      track: '#000000',
      spark: '#FFFFFF',
      chartLine: '#4FA8FF',
      celebrate: 'rings',
      chartGlow: false,
      streak: 'none',
    },
    light: {
      id: 'classicContrast',
      name: 'Classic Contrast',
      chip: 'Contrast',
      blurb: 'Pure white, strong outlines and a bold bar.',
      ground: {
        color: '#FFFFFF',
        grain: false,
        grid: ['rgba(0, 0, 0, 0.06)', 'rgba(0, 0, 0, 0.12)'],
        topGlow: false,
        vignette: false,
        edgeLight: false,
      },
      surface: {
        background: '#FFFFFF',
        border: 'rgba(0, 0, 0, 0.78)',
        radius: 6,
        borderWidth: 2,
      },
      accent: '#0A58CA',
      accentText: '#FFFFFF',
      cta: { face: '#000000', rim: '#000000', text: '#FFFFFF', radius: 6, edge: 0 },
      progress: 'bold',
      track: '#FFFFFF',
      spark: '#000000',
      chartLine: '#0A58CA',
      celebrate: 'rings',
      chartGlow: false,
      streak: 'none',
    },
  },
};
