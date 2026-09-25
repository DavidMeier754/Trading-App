import type { Screen } from '../types';
import { scannerRowsOf } from '../types';

/**
 * Where an answer sits must never be the answer. Authors tend to write the
 * right option first, a sort's items bucket by bucket and an order's cards in
 * their order -- so every screen whose choices are a list is dealt in a fresh
 * order each run. The dealt screen is the one the player shows *and* grades,
 * so an index into it always means the option at that place on screen.
 *
 * Lists whose order is the content stay as written: a sentence split for
 * `spot-mistake`, a price ladder, compare's labelled A and B (the explanation
 * names them), a deck's cards (each is its own question).
 */
export function dealScreen(screen: Screen, seed: number): Screen {
  const rand = mulberry32(seed);
  switch (screen.type) {
    case 'mc':
    case 'numeric-mc':
      return { ...screen, options: shuffle(screen.options, rand) };
    case 'fill-choice':
      // The answer is the option's text, so the options can move freely.
      return { ...screen, options: shuffle(screen.options, rand) };
    case 'match':
      return { ...screen, pairs: shuffle(screen.pairs, rand) };
    case 'sort':
      return { ...screen, items: shuffle(screen.items, rand) };
    case 'order':
      // `items` is the answer key, in order; only the deal of the cards to
      // pick from changes. Never dealt in the right order, or it is a freebie.
      return { ...screen, deal: derange(screen.items.length, rand) };
    case 'branch':
      return {
        ...screen,
        steps: screen.steps.map((step) => ({ ...step, options: shuffle(step.options, rand) })),
      };
    case 'order-build':
    case 'journal-row': {
      const chips: Record<string, string[]> = {};
      for (const [slot, list] of Object.entries(screen.chips)) chips[slot] = shuffle(list, rand);
      return { ...screen, chips };
    }
    case 'scanner-pick': {
      const rows = shuffle(scannerRowsOf(screen), rand);
      return screen.data ? { ...screen, data: { ...screen.data, rows } } : { ...screen, rows };
    }
    default:
      return screen;
  }
}

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A shuffle of 0..n-1 that is not the identity (for n > 1). */
function derange(n: number, rand: () => number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return idx;
  for (let tries = 0; tries < 20; tries++) {
    const out = shuffle(idx, rand);
    if (out.some((v, i) => v !== i)) return out;
  }
  return idx.slice(1).concat(idx[0]);
}

/** A small seeded generator, so a run's deal is stable across re-renders. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
