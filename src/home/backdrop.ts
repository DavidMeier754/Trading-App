import type { DecoKind } from './scenes';

/**
 * The drawings in the path's background (docs/UI.md §7.1). David, 2026-09-30:
 * "make them so they are part of the background and that they are not always
 * next to the levels but rather faintly in the background. You can also play
 * with the sizes."
 *
 * So they are scattered down each open chapter at uneven gaps, now on the
 * left and now on the right, in three sizes: small ones in the free room
 * beside the path, bigger ones further out, and the biggest half off the edge
 * of the screen, as if the ground went on past it. The bigger a drawing, the
 * fainter, so the large ones sit furthest back. None covers a level, its
 * label, its START tag or a chapter's card; the dotted path may run over one.
 * The same map always gets the same background: the scatter is seeded by the
 * chapter, so opening another chapter never moves this one's drawings.
 */

/** A box on the map, in the scroll's coordinates. */
export type Box = { left: number; top: number; right: number; bottom: number };

export type Placed = {
  kind: DecoKind;
  /** The drawing's centre. */
  x: number;
  y: number;
  size: number;
  /** A small turn, in degrees; none for the drawings that stand on the ground. */
  tilt: number;
  /** How much of the ground's ink it takes: the big ones less. */
  fade: number;
};

/** The sizes a drawing comes in: [smallest, largest, fade]. */
const SIZES = {
  small: [44, 60, 0.8],
  medium: [70, 96, 0.65],
  large: [120, 176, 0.5],
} as const;

/** Drawings that stand on a ground line stay upright. */
const UPRIGHT: DecoKind[] = ['candles', 'summit'];

/** Room kept round everything a drawing must not cover. */
const PAD = 8;
/** How close a small or medium drawing comes to the screen's edge. */
const EDGE = 6;

/** mulberry32: small, fast and the same on every device. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function overlaps(a: Box, b: Box, pad = 0): boolean {
  return (
    a.left - pad < b.right &&
    b.left < a.right + pad &&
    a.top - pad < b.bottom &&
    b.top < a.bottom + pad
  );
}

/**
 * The part of a drawing that must stay clear: its square, less the margin
 * every drawing leaves inside it.
 */
export function boxOf(p: Pick<Placed, 'x' | 'y' | 'size'>): Box {
  const h = p.size * 0.42;
  return { left: p.x - h, right: p.x + h, top: p.y - h, bottom: p.y + h };
}

export function scatter({
  top,
  bottom,
  width,
  keepClear,
  seed,
  kinds,
}: {
  /** The stretch of the map to fill. */
  top: number;
  bottom: number;
  width: number;
  /** What no drawing may cover: the levels, their labels and tags, the cards. */
  keepClear: Box[];
  seed: number;
  kinds: readonly DecoKind[];
}): Placed[] {
  const rnd = seeded(seed);
  const out: Placed[] = [];
  const taken = [...keepClear];
  let k = Math.floor(rnd() * kinds.length);
  let side = rnd() < 0.5 ? -1 : 1;
  let y = top + 24 + rnd() * 60;
  while (y < bottom) {
    const r = rnd();
    const cls = r < 0.25 ? 'small' : r < 0.6 ? 'medium' : 'large';
    const [lo, hi, fade] = SIZES[cls];
    const size = Math.round(lo + rnd() * (hi - lo));
    const out1 = rnd();
    const kind = kinds[k % kinds.length];
    let placed: Placed | null = null;
    for (const s of [side, -side]) {
      // The biggest stand a third or more off the screen; the rest keep
      // inside it, nearer the edge or nearer the path.
      const x =
        cls === 'large'
          ? s < 0
            ? size * (0.04 + 0.16 * out1)
            : width - size * (0.04 + 0.16 * out1)
          : s < 0
            ? EDGE + size / 2 + out1 * 36
            : width - EDGE - size / 2 - out1 * 36;
      const candidate = { x, y, size };
      if (!taken.some((b) => overlaps(b, boxOf(candidate), PAD))) {
        const tilt = UPRIGHT.includes(kind) ? 0 : Math.round((rnd() - 0.5) * 20);
        placed = { kind, x, y, size, tilt, fade };
        break;
      }
    }
    if (!placed) {
      // No room at this height on either side: look a little further down.
      y += 20;
      continue;
    }
    out.push(placed);
    taken.push(boxOf(placed));
    k += 1;
    y += size * 0.45 + 48 + rnd() * 90;
    side = rnd() < 0.75 ? -side : side;
  }
  return out;
}
