/**
 * docs/ui/13-tiers-replays-and-plus.md §7.5: four tiers per path, each unlocked by finishing a chapter,
 * the same four for every path. [DESIGN-REVIEW] Each is printed in a
 * material of its own (§5.5): paper, bronze, silver, graphite and gold.
 */
export type Material = 'blank' | 'paper' | 'bronze' | 'silver' | 'graphite';

export type Tier = {
  /** 1–4; 0 is the blank card before the first. */
  rank: number;
  name: string;
  /** The chapter whose end unlocks it. */
  after: number;
  material: Material;
  /** docs/ui/13-tiers-replays-and-plus.md §7.5's line, for the card. */
  means: string;
};

export const TIERS: Tier[] = [
  { rank: 1, name: 'Observer', after: 2, material: 'paper', means: 'Can read a chart.' },
  {
    rank: 2,
    name: 'Student',
    after: 4,
    material: 'bronze',
    means: 'Can read the market in motion.',
  },
  {
    rank: 3,
    name: 'Planner',
    after: 6,
    material: 'silver',
    means: 'Has a risk process and a journal.',
  },
  {
    rank: 4,
    name: 'Sim Trader',
    after: 8,
    material: 'graphite',
    means: 'Has a playbook and a 30-day simulator plan.',
  },
];

/** Before the first tier: a blank card. */
export const NO_TIER: Tier = {
  rank: 0,
  name: 'No tier yet',
  after: 0,
  material: 'blank',
  means: 'Your first tier comes with the end of Chapter 2.',
};

/** The tier a learner holds once chapters up to `chapter` are finished. */
export function tierAfter(chapter: number): Tier {
  return [...TIERS].reverse().find((t) => chapter >= t.after) ?? NO_TIER;
}

/** A tier by the name a level file gives it (`tier-up`). */
export function tierNamed(name: string): Tier | undefined {
  const key = name.trim().toLowerCase();
  return TIERS.find((t) => t.name.toLowerCase() === key);
}

/** The tier after this one, or null at the top. */
export function nextTier(tier: Tier): Tier | null {
  return TIERS.find((t) => t.rank === tier.rank + 1) ?? null;
}
