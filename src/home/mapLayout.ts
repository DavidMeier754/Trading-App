import { space } from '../theme';
import { RING, STOP_RING, TAG_HALF_W, TAG_TOP } from './mapSizes';

/**
 * Where things sit on the map (docs/ui/10-path-map.md §7.1), as plain numbers, so the
 * layout can be checked without drawing it: the sine the path follows, the
 * room a level's title and its START tag take, and where a side stop goes so
 * that it touches none of them.
 */

/** Vertical distance between two levels' centres. */
export const STEP_Y = 148;

/**
 * docs/ui/10-path-map.md §7.1 [DESIGN-REVIEW] (David: "a curvy path like a sin
 * function"; 2026-10-04: "still going in a zickzack movement instead of a sin
 * CURVE"): the levels sit on one sine curve and the trail follows the same
 * curve between them. A full swing takes eight levels, so no level sits at
 * every turn: between two of them the trail visibly bends, and the path reads
 * as one wave rather than straight stretches from side to side. (Four levels
 * a swing put a level on each turn and the centre, and the trail between
 * looked straight.) `phase` counts levels down the chapter.
 */
export const WAVE_LEVELS = 8;
export function windAt(phase: number): number {
  return -Math.sin((phase * 2 * Math.PI) / WAVE_LEVELS);
}

/** How far the path swings to each side: about a quarter of the screen, so the wave shows. */
export function waveAmp(width: number): number {
  return Math.min(96, width * 0.24);
}

/** Where a level sits across the screen, by its place in its chapter. */
export function nodeX(phase: number, width: number): number {
  return width / 2 + windAt(phase) * waveAmp(width);
}

/** A level's title goes on the side of its level with more room. */
export function labelSide(phase: number): 'left' | 'right' {
  return windAt(phase) > 0.05 ? 'left' : 'right';
}

/**
 * The room beside a level on its title's side, so a long title wraps
 * instead of running off the screen.
 */
export function labelRoom(phase: number, width: number): number {
  const x = nodeX(phase, width);
  return labelSide(phase) === 'left'
    ? x - RING / 2 - space.sm - space.lg
    : width - (x + RING / 2 + space.sm) - space.lg;
}

/** A level's title: as wide as the room beside it allows, within 90 and 170. */
export function labelWidth(room: number): number {
  return Math.max(90, Math.min(170, room));
}
/** The title's line height (NodeLabel). */
export const LABEL_LINE = 19;
/** About the widest a letter of the title's 15 pt bold face runs, for counting lines. */
const LABEL_CHAR_W = 8.8;

/** How many lines a title takes in a given width, broken at spaces as the text is. */
export function labelLines(title: string, width: number): number {
  const perLine = Math.max(1, Math.floor(width / LABEL_CHAR_W));
  let lines = 1;
  let used = 0;
  for (const word of title.split(/\s+/).filter(Boolean)) {
    const need = used === 0 ? word.length : used + 1 + word.length;
    if (need <= perLine) used = need;
    else {
      lines += Math.ceil(word.length / perLine);
      used = word.length % perLine || perLine;
    }
  }
  return lines;
}

export type Box = { l: number; t: number; r: number; b: number };
export type Point = { x: number; y: number };

/** Where a level's title is drawn: beside its ring, centred on it. */
export function labelBox(node: Point, side: 'left' | 'right', width: number, lines: number): Box {
  const h = lines * LABEL_LINE;
  const near = RING / 2 + space.sm;
  return side === 'right'
    ? { l: node.x + near, r: node.x + near + width, t: node.y - h / 2, b: node.y + h / 2 }
    : { l: node.x - near - width, r: node.x - near, t: node.y - h / 2, b: node.y + h / 2 };
}

/**
 * The room the START (or CONTINUE) tag takes over a level (LevelNode,
 * Bubble). Any level can be the one the learner is on, so the room is kept
 * free over every level, not only over today's.
 */
export function tagBox(node: Point): Box {
  return {
    l: node.x - TAG_HALF_W,
    r: node.x + TAG_HALF_W,
    t: node.y - RING / 2 - TAG_TOP,
    b: node.y - RING / 2 + 2,
  };
}

/** How far a point is from a box: 0 inside it. */
export function boxDistance(p: Point, b: Box): number {
  return Math.sqrt(boxDistance2(p, b));
}

function boxDistance2(p: Point, b: Box): number {
  const dx = Math.max(b.l - p.x, 0, p.x - b.r);
  const dy = Math.max(b.t - p.y, 0, p.y - b.b);
  return dx * dx + dy * dy;
}

function dist2(p: Point, q: Point): number {
  return (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
}

/** Room kept between a side stop and anything it could touch. */
const STOP_GAP = 8;
/** Room kept between the trail's dots and a side stop. */
const TRAIL_GAP = 10;

/**
 * docs/ui/10-path-map.md §7.1 "Side stops": where a side stop goes between the level it
 * follows (`a`, at `phase` on the curve) and the next (`b`). It looks for the
 * spot nearest the path, about halfway down, that keeps clear of:
 *   - both levels' rings;
 *   - both levels' titles and the tag over the next level (`avoid`);
 *   - the trail between the two;
 *   - the screen's sides;
 * and joins it to the path with a spur that crosses none of them. `from` is
 * where the spur leaves the path. Null when nothing fits, which the map
 * check (src/__tests__/mapLayout.test.ts) keeps from happening at any phone
 * width.
 */
export function placeSideStop({
  phase,
  a,
  b,
  cx,
  amp,
  width,
  avoid,
}: {
  phase: number;
  a: Point;
  b: Point;
  cx: number;
  amp: number;
  width: number;
  avoid: Box[];
}): { x: number; y: number; from: Point } | null {
  const R = STOP_RING / 2;
  const trail: Point[] = [];
  for (let k = 0; k <= 40; k++) {
    const t = k / 40;
    trail.push({ x: cx + windAt(phase + t) * amp, y: a.y + (b.y - a.y) * t });
  }
  // Squared distances throughout: this runs for thousands of spots.
  const rings = [a, b];
  const clear = (p: Point, r: number) =>
    rings.every((n) => dist2(p, n) >= (RING / 2 + r) ** 2) &&
    avoid.every((box) => boxDistance2(p, box) >= r * r);
  // The spur: dots from the path to the stop's ring, clear of everything but
  // the path it leaves.
  const spurClear = (from: Point, to: Point) => {
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    for (let d = 8; d < len - R; d += 4) {
      const p = {
        x: from.x + ((to.x - from.x) * d) / len,
        y: from.y + ((to.y - from.y) * d) / len,
      };
      if (!clear(p, 4)) return false;
    }
    return true;
  };
  const mid = (a.y + b.y) / 2;
  // A spot's score is its spur's length plus half its distance from the
  // middle of the gap. Its spur is at least as long as the way to the nearest
  // point of the trail, so the spots are tried best-possible first, and the
  // search ends once none left could beat the best found.
  const spots: { p: Point; bound: number }[] = [];
  for (let y = a.y + 16; y <= b.y - 16; y += 4) {
    for (let x = space.md + R; x <= width - space.md - R; x += 4) {
      let near2 = Infinity;
      for (const q of trail) {
        const d2 = (q.x - x) ** 2 + (q.y - y) ** 2;
        if (d2 < near2) near2 = d2;
      }
      if (near2 < (R + TRAIL_GAP) ** 2) continue;
      const p = { x, y };
      if (!clear(p, R + STOP_GAP)) continue;
      spots.push({ p, bound: Math.sqrt(near2) + 0.5 * Math.abs(y - mid) });
    }
  }
  spots.sort((u, v) => u.bound - v.bound);
  // The spur leaves the path between the two rings, not at them.
  const exits = trail.slice(4, -4);
  let best: { x: number; y: number; from: Point; score: number } | null = null;
  for (const { p, bound } of spots) {
    if (best && bound >= best.score) break;
    const order = exits
      .map((q) => ({ q, d: Math.hypot(q.x - p.x, q.y - p.y) }))
      .sort((u, v) => u.d - v.d);
    // The nearest point of the path the spur can reach cleanly.
    const exit = order.find((o) => spurClear(o.q, p));
    if (!exit) continue;
    const score = exit.d + 0.5 * Math.abs(p.y - mid);
    if (!best || score < best.score) best = { x: p.x, y: p.y, from: exit.q, score };
  }
  return best && { x: best.x, y: best.y, from: best.from };
}

/**
 * The side stop after level `li` of a chapter whose first level's centre is at
 * `top`: placed by placeSideStop, clear of both levels' titles (`titles`, the
 * chapter's level titles in order) and of the tag over the next level. On a
 * screen narrower than any phone, where nothing fits, it falls back to the
 * spot beside the path halfway down.
 */
export function sideStopAt({
  li,
  titles,
  top,
  width,
}: {
  li: number;
  titles: string[];
  top: number;
  width: number;
}): { x: number; y: number; from: Point } {
  // The search takes a few milliseconds; the map draws again after every
  // lesson, so a stop's place is kept, relative to its level.
  const key = `${width}|${li}|${titles[li]}|${titles[li + 1]}`;
  const kept = placed.get(key);
  const base = top + li * STEP_Y;
  if (kept) {
    return {
      x: kept.x,
      y: base + kept.dy,
      from: { x: kept.from.x, y: base + kept.from.dy },
    };
  }
  const found = searchSideStop(li, titles, base, width);
  placed.set(key, {
    x: found.x,
    dy: found.y - base,
    from: { x: found.from.x, dy: found.from.y - base },
  });
  return found;
}

const placed = new Map<string, { x: number; dy: number; from: { x: number; dy: number } }>();

function searchSideStop(
  li: number,
  titles: string[],
  base: number,
  width: number,
): { x: number; y: number; from: Point } {
  const amp = waveAmp(width);
  const a = { x: nodeX(li, width), y: base };
  const b = { x: nodeX(li + 1, width), y: a.y + STEP_Y };
  const title = (k: number, node: Point) => {
    const w = labelWidth(labelRoom(k, width));
    return labelBox(node, labelSide(k), w, labelLines(titles[k] ?? '', w));
  };
  const found = placeSideStop({
    phase: li,
    a,
    b,
    cx: width / 2,
    amp,
    width,
    avoid: [title(li, a), title(li + 1, b), tagBox(b)],
  });
  if (found) return found;
  const at = (a.y + b.y) / 2;
  const swing = Math.sign(windAt(li + 0.5)) || 1;
  return {
    x: width / 2 + swing * (Math.abs(windAt(li + 0.5)) * amp + STOP_RING / 2 + 30),
    y: at,
    from: { x: width / 2 + windAt(li + 0.5) * amp, y: at },
  };
}
