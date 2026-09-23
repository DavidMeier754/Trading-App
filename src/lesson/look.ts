import { useSyncExternalStore } from 'react';

/**
 * Which visual layer the lesson wears. Picked in the lesson picker before a
 * lesson; every look is a whole design, not a colour swap.
 *
 * - `neo`: the default. A grained, lit ground whose bottom edge answers the
 *   lesson's mood, glass surfaces, glowing chart lines, sparks off a right
 *   answer, a streak flame. The progress bar is a segmented tape.
 * - `classic`: the lesson as it first shipped. Flat panels on the grid, a plain
 *   bar, rings on a right answer and nothing else.
 * - `terminal`: a trading terminal at night. Black, scanlines instead of a
 *   grid, square corners, one cyan phosphor colour, uppercase keys, a block
 *   progress readout, and a right answer boxed by a stepping outline.
 * - `blueprint`: a drafting sheet. Navy paper with a blueprint grid, outlined
 *   surfaces, a ruler with a caret for progress, and a right answer circled
 *   by hand in pencil.
 * - `arcade`: the loud one. Chunky cards with a 3D edge, a fat yellow key, a
 *   glossy progress bar, a dot grid, and a burst of stars on a right answer.
 *
 * Everything a look adds is decoration, so under reduced motion it keeps its
 * colour and loses its movement, like the rest of the app. Text colours and the
 * chart's data colours are the same in every look -- they are the content.
 */
export type Look = 'neo' | 'classic' | 'terminal' | 'blueprint' | 'arcade';

export type LookSpec = {
  id: Look;
  name: string;
  /** One line for the picker. */
  blurb: string;
  ground: {
    color: string;
    texture: 'grain' | 'scanlines' | 'dots' | 'none';
    grid: 'hairline' | 'blueprint' | 'none';
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
    /** A thicker bottom border: a chunky, pressable-looking card. */
    edge?: number;
  };
  /** Selection, the CTA, the progress fill. */
  accent: string;
  accentText: string;
  cta: {
    face: string;
    rim: string;
    radius: number;
    /** How far the key sinks when pressed; 0 is a flat button. */
    edge: number;
    uppercase: boolean;
  };
  progress: 'tape' | 'line' | 'blocks' | 'ruler' | 'chunky';
  /** The chart's price line: blue ink, phosphor, pencil, marker. */
  chartLine: string;
  celebrate: 'sparks' | 'rings' | 'box' | 'pencil' | 'stars';
  chartGlow: boolean;
  streak: 'flame' | 'count' | 'none';
  /** The new screen arrives from slightly further back as well as the side. */
  depth: boolean;
};

export const LOOKS: Record<Look, LookSpec> = {
  neo: {
    id: 'neo',
    name: 'Neo',
    blurb: 'Grain, glass and light that answers you.',
    ground: { color: '#0E1116', texture: 'grain', grid: 'hairline', topGlow: true, vignette: true, edgeLight: true },
    surface: {
      background: 'rgba(23, 28, 35, 0.62)',
      border: 'rgba(255, 255, 255, 0.13)',
      borderTop: 'rgba(255, 255, 255, 0.26)',
      radius: 10,
      borderWidth: 1.5,
    },
    accent: '#4C8DFF',
    accentText: '#FFFFFF',
    cta: { face: '#4C8DFF', rim: '#2E66CC', radius: 12, edge: 4, uppercase: false },
    progress: 'tape',
    chartLine: '#4C8DFF',
    celebrate: 'sparks',
    chartGlow: true,
    streak: 'flame',
    depth: true,
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    blurb: 'Flat panels on the grid. Nothing extra.',
    ground: { color: '#0E1116', texture: 'none', grid: 'hairline', topGlow: true, vignette: false, edgeLight: false },
    surface: { background: '#171C23', border: '#3A4553', radius: 10, borderWidth: 1.5 },
    accent: '#4C8DFF',
    accentText: '#FFFFFF',
    cta: { face: '#4C8DFF', rim: '#2E66CC', radius: 10, edge: 0, uppercase: false },
    progress: 'line',
    chartLine: '#4C8DFF',
    celebrate: 'rings',
    chartGlow: false,
    streak: 'none',
    depth: false,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    blurb: 'Black screen, scanlines, one phosphor colour.',
    ground: { color: '#040506', texture: 'scanlines', grid: 'none', topGlow: false, vignette: true, edgeLight: false },
    surface: { background: '#07090B', border: 'rgba(47, 227, 255, 0.32)', radius: 2, borderWidth: 1 },
    accent: '#2FE3FF',
    accentText: '#02181C',
    cta: { face: '#2FE3FF', rim: '#1497AB', radius: 2, edge: 0, uppercase: true },
    progress: 'blocks',
    chartLine: '#2FE3FF',
    celebrate: 'box',
    chartGlow: false,
    streak: 'count',
    depth: false,
  },
  blueprint: {
    id: 'blueprint',
    name: 'Blueprint',
    blurb: 'A drafting sheet. Circled in pencil when you are right.',
    ground: { color: '#0B2144', texture: 'grain', grid: 'blueprint', topGlow: false, vignette: false, edgeLight: false },
    surface: { background: 'rgba(11, 33, 68, 0.55)', border: 'rgba(205, 225, 255, 0.55)', radius: 4, borderWidth: 1 },
    accent: '#DCEAFF',
    accentText: '#0B2144',
    cta: { face: '#E6F0FF', rim: '#8FAAD6', radius: 6, edge: 3, uppercase: false },
    progress: 'ruler',
    chartLine: '#E6F0FF',
    celebrate: 'pencil',
    chartGlow: false,
    streak: 'none',
    depth: false,
  },
  arcade: {
    id: 'arcade',
    name: 'Arcade',
    blurb: 'Chunky, loud and bouncy. Stars when you score.',
    ground: { color: '#111016', texture: 'dots', grid: 'none', topGlow: false, vignette: true, edgeLight: true },
    surface: { background: '#1D1C26', border: '#34324A', radius: 16, borderWidth: 2, edge: 5 },
    accent: '#FFD23F',
    accentText: '#221A00',
    cta: { face: '#FFD23F', rim: '#C9971A', radius: 16, edge: 6, uppercase: true },
    progress: 'chunky',
    chartLine: '#FFD23F',
    celebrate: 'stars',
    chartGlow: false,
    streak: 'flame',
    depth: true,
  },
};

let look: Look = 'neo';
const listeners = new Set<() => void>();

export function setLook(next: Look): void {
  if (next === look) return;
  look = next;
  listeners.forEach((listener) => listener());
}

export function getLook(): Look {
  return look;
}

export function useLook(): Look {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getLook,
    getLook
  );
}

export function useLookSpec(): LookSpec {
  return LOOKS[useLook()];
}

/** A surface at rest in a look, as a style: background, border, corners, edge. */
export function surfaceStyle(spec: LookSpec) {
  const s = spec.surface;
  return {
    backgroundColor: s.background,
    borderColor: s.border,
    ...(s.borderTop ? { borderTopColor: s.borderTop } : null),
    borderRadius: s.radius,
    borderWidth: s.borderWidth,
    ...(s.edge ? { borderBottomWidth: s.edge } : null),
  };
}

/** A translucent wash of a colour, for selections and tints. */
export function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// ---------------------------------------------------------------------------
// Mood: what just happened, for the surfaces that react to it.
// ---------------------------------------------------------------------------

/**
 * The lesson's last beat, broadcast. The backdrop listens and lights the
 * bottom edge with it -- green on a right answer, a dull red dip on a wrong
 * one, warm gold while a run is on (components/Atmosphere.tsx). It is an event
 * bus rather than a prop because the backdrop sits in App, under the player,
 * and the player is the one that knows.
 */
export type Mood = 'correct' | 'amber' | 'wrong' | 'streak' | 'calm' | 'complete' | 'commit';

type MoodListener = (mood: Mood, run: number) => void;
const moodListeners = new Set<MoodListener>();

export function emitMood(mood: Mood, run = 0): void {
  moodListeners.forEach((listener) => listener(mood, run));
}

export function onMood(listener: MoodListener): () => void {
  moodListeners.add(listener);
  return () => {
    moodListeners.delete(listener);
  };
}
