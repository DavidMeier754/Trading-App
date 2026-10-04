import { CHAPTER_ONE, PATH_CHAPTERS } from '../content';
import {
  boxDistance,
  labelBox,
  labelLines,
  labelRoom,
  labelSide,
  labelWidth,
  nodeX,
  placeSideStop,
  sideStopAt,
  STEP_Y,
  tagBox,
  waveAmp,
} from '../home/mapLayout';
import { RING, STOP_RING } from '../home/mapSizes';

/**
 * docs/ui/10-path-map.md §7.1 (David, 2026-10-04: "the Start Box over the level overlaps
 * the optional side levels"): a side stop touches nothing on the map -- not a
 * level, not a level's title, not the START tag any level can wear, not the
 * trail, and it stays on the screen. Checked for every gap between two levels
 * of every chapter, since a bonus stop can follow any level, at every phone
 * width up to the app's 480.
 */
const WIDTHS = [320, 340, 360, 375, 390, 414, 430, 480];
const CHAPTERS = [CHAPTER_ONE, ...Object.values(PATH_CHAPTERS).flat()];
const R = STOP_RING / 2;

describe('side stops on the map', () => {
  it('has chapters to check', () => {
    expect(CHAPTERS.length).toBeGreaterThan(7);
  });

  for (const width of WIDTHS) {
    it(`every gap at ${width} pt holds a stop that touches nothing`, () => {
      const problems: string[] = [];
      for (const chapter of CHAPTERS) {
        const titles = chapter.levels.map((l) => l.title);
        for (let li = 0; li < chapter.levels.length - 1; li++) {
          const top = 1000;
          const stop = sideStopAt({ li, titles, top, width });
          const where = `Ch ${chapter.number} after ${titles[li]}`;
          const a = { x: nodeX(li, width), y: top + li * STEP_Y };
          const b = { x: nodeX(li + 1, width), y: a.y + STEP_Y };
          const boxes = [li, li + 1].map((k, i) => {
            const node = i === 0 ? a : b;
            const w = labelWidth(labelRoom(k, width));
            return labelBox(node, labelSide(k), w, labelLines(titles[k], w));
          });
          if (stop.x - R < 0 || stop.x + R > width) problems.push(`${where}: off the screen`);
          for (const n of [a, b])
            if (Math.hypot(stop.x - n.x, stop.y - n.y) < RING / 2 + R) {
              problems.push(`${where}: on a level`);
            }
          if (boxDistance(stop, tagBox(b)) < R) problems.push(`${where}: under the START tag`);
          for (const box of boxes)
            if (boxDistance(stop, box) < R) problems.push(`${where}: on a title`);
        }
      }
      expect(problems).toEqual([]);
    });
  }

  it('keeps a stop off the tag that put it in question (2·10 → 2·11 at 320 pt)', () => {
    const width = 320;
    const a = { x: nodeX(9, width), y: 1000 };
    const b = { x: nodeX(10, width), y: 1000 + STEP_Y };
    const stop = placeSideStop({
      phase: 9,
      a,
      b,
      cx: width / 2,
      amp: waveAmp(width),
      width,
      avoid: [tagBox(b)],
    });
    expect(stop).not.toBeNull();
    expect(boxDistance(stop!, tagBox(b))).toBeGreaterThanOrEqual(R);
    // and its spur leaves the path between the two levels
    expect(stop!.from.y).toBeGreaterThan(a.y);
    expect(stop!.from.y).toBeLessThan(b.y);
  });

  it('counts a title in lines as it wraps', () => {
    expect(labelLines('Checkpoint', 170)).toBe(1);
    expect(labelLines("What You're Actually Buying", 120)).toBe(3);
    expect(labelLines('A', 90)).toBe(1);
  });
});
