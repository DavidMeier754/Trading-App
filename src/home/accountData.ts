import { LESSONS } from '../content';
import { openMistakes } from '../practice';
import { Progress, streakDays } from '../progress';
import { tierAfter, type Tier } from '../rewards/tiers';
import { chapterViews } from './pathState';

/** docs/agent.md §7: the one-line risk note, on every stats screen. */
export const RISK_NOTE = 'Trading involves risk of loss. This app teaches concepts, not signals.';

/** The chapters finished, by number, and the tier they give (docs/UI.md §7.5). */
export function standing(p: Progress): { finished: Set<number>; tier: Tier } {
  const finished = new Set(
    chapterViews(p)
      .filter((c) => c.status === 'complete')
      .map((c) => c.chapter.number),
  );
  // Tiers come in path order: the highest chapter with every one before it done.
  let upTo = 0;
  while (finished.has(upTo + 1)) upTo++;
  return { finished, tier: tierAfter(upTo) };
}

/** docs/UI.md §7.4 "All stats": the learner's own numbers, never money. */
export function allStats(p: Progress) {
  const done = Object.values(p.done);
  const decisions = p.decisions;
  const right = decisions.filter((d) => d.grade === 'correct');
  const traded = right.filter((d) => !d.aside);
  return {
    lessons: done.length,
    perfect: done.filter((d) => d.perfect).length,
    xp: p.xp,
    streak: streakDays(p),
    longest: Math.max(p.bestStreak, streakDays(p)),
    skills: Object.keys(p.skills).length,
    mistakes: openMistakes(p).length,
    decisions: {
      right: right.length,
      reasonable: decisions.filter((d) => d.grade === 'amber').length,
      wrong: decisions.filter((d) => d.grade === 'wrong').length,
    },
    // The variance view: of the right calls on a trade taken, how many won and lost.
    variance: {
      won: traded.filter((d) => d.result === 'won').length,
      lost: traded.filter((d) => d.result === 'lost').length,
    },
  };
}

/** A plan key's group, as its prefix names it (docs/schema.md, "The plan"). */
const GROUPS: [RegExp, string][] = [
  [/^setup_/, 'Setup'],
  [/^cost_/, 'Costs'],
  [/^read_/, 'Reading'],
  [/^session_/, 'Session'],
  [/^(card_|name$|context$|entry$|stop$|target$|invalidation$)/, 'Playbook'],
  [/^sim_/, 'Simulator'],
  [/^live_/, 'Going live'],
];

function groupOf(key: string): string {
  return GROUPS.find(([re]) => re.test(key))?.[1] ?? 'Other';
}

/** Every plan key a `plan-card` writes, with its label, in the order a learner meets them. */
export const PLAN_FIELDS: { key: string; label: string; group: string }[] = (() => {
  const seen = new Map<string, { key: string; label: string; group: string }>();
  for (const entry of LESSONS) {
    if (entry.testBench) continue;
    for (const s of entry.level.screens) {
      if (s.type !== 'plan-card') continue;
      for (const f of s.fields) {
        if (!seen.has(f.key))
          seen.set(f.key, { key: f.key, label: f.label, group: groupOf(f.key) });
      }
    }
  }
  return [...seen.values()];
})();

/** The plan as the document shows it: groups of written lines, and when it was first and last written. */
export function planDocument(p: Progress) {
  const lines = PLAN_FIELDS.filter((f) => (p.plan[f.key] ?? '').trim() !== '');
  const groups: { name: string; lines: { label: string; value: string }[] }[] = [];
  for (const f of lines) {
    let g = groups.find((x) => x.name === f.group);
    if (!g) groups.push((g = { name: f.group, lines: [] }));
    g.lines.push({ label: f.label, value: p.plan[f.key] });
  }
  const times = Object.values(p.planAt);
  return {
    groups,
    since: times.length ? Math.min(...times) : null,
    changed: times.length ? Math.max(...times) : null,
  };
}

/** "3 Oct 2026", for a date on the plan. */
export function dayText(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
