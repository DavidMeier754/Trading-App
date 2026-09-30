import { boxOf, overlaps, scatter, seeded } from '../home/backdrop';
import { SCENES } from '../home/scenes';

describe('the drawings in the background of the map (docs/UI.md §7.1)', () => {
  it('scatters the drawings faintly through the background (David, 2026-09-30)', () => {
    // A chapter's stretch of path: levels winding down the middle, labels beside.
    const width = 390;
    const keepClear = [0, 1, 2, 3, 4, 5].flatMap((i) => {
      const x = width / 2 + [0, -64, 0, 64][i % 4];
      const y = 120 + i * 148;
      return [
        { left: x - 47, right: x + 47, top: y - 47, bottom: y + 47 },
        i % 4 === 3
          ? { left: x - 225, right: x - 55, top: y - 20, bottom: y + 20 }
          : { left: x + 55, right: x + 225, top: y - 20, bottom: y + 20 },
      ];
    });
    const args = { top: 40, bottom: 900, width, keepClear, seed: 7, kinds: SCENES };
    const placed = scatter(args);
    expect(placed.length).toBeGreaterThanOrEqual(5);
    // Never over a level or a label, and never over each other.
    for (const [i, p] of placed.entries()) {
      for (const box of keepClear) expect(overlaps(box, boxOf(p))).toBe(false);
      for (const q of placed.slice(i + 1)) expect(overlaps(boxOf(p), boxOf(q))).toBe(false);
    }
    // Several sizes, both sides, the biggest partly off the screen and the faintest.
    const sizes = placed.map((p) => p.size);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeGreaterThan(30);
    expect(placed.some((p) => p.x < width / 2) && placed.some((p) => p.x > width / 2)).toBe(true);
    for (const p of placed) {
      if (p.size >= 120) expect(p.x - p.size / 2 < 0 || p.x + p.size / 2 > width).toBe(true);
      expect(p.fade).toBeLessThanOrEqual(0.85);
    }
    // The same map, the same background.
    expect(scatter(args)).toEqual(placed);
    expect(seeded(1)()).toBe(seeded(1)());
  });
});
