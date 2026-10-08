import { findTerm, knowsTerm, normTerm, TERMS } from '../skills';
import type { Skill } from '../skills';

/**
 * docs/ui/08-quotes-and-charts.md §6.4a — the "?" key (David, 2026-10-05, item P-05 of
 * docs/content-todo/05-content-review.md): what a chart screen can label, and with which words.
 *
 * Each element on the chart that the learner has been taught gets a number
 * on the chart and a row in the key's legend: the skill's name and its one
 * line from content/skills.yaml. Nothing new is written for it, so nothing
 * extra is translated. The one exception is the "what happens next" pill,
 * which is the app's own and is explained on every decision chart.
 */
export type ExplainItem = {
  /** What it points at: `chip:0`, `pill`, `vwap`, `level:1`, `volume`, `stop`, `target`, `ruler`, `col:rvol`. */
  key: string;
  /** The skill's name ("Support"), or the pill's own words. */
  name: string;
  line: string;
};

/** The pill's own line: the app's, not a skill's. */
export const PILL_LINE =
  'Hidden until you make your call. Then these candles play out, and you see what happened.';

/**
 * A state chip's two parts: "Day: −2R" is the name "Day" and the value "−2R".
 * A chip with no name ("1R of room left") is all value.
 */
export function chipParts(chip: string): { name: string | null; value: string } {
  const at = chip.indexOf(': ');
  if (at <= 0) return { name: null, value: chip };
  return { name: chip.slice(0, at), value: chip.slice(at + 2) };
}

/** Whether a term is taught here: its skill when it is, else null. */
export type Knows = (term: string) => Skill | null;

/** The rule the "?" key and the R ruler share: taught before this lesson, or everything on a bench. */
export function knowsFor(
  lessonId: string | null,
  done: Record<string, unknown>,
  everything: boolean,
): Knows {
  return (term) => {
    if (everything) return TERMS.get(normTerm(term)) ?? null;
    return knowsTerm(term, lessonId, done);
  };
}

/** The term a text names: the longest one found in it. */
function termIn(text: string): string | null {
  let best: string | null = null;
  for (const t of TERMS.values()) {
    // One- and two-letter terms ("R") only as the whole text: "R" in "R:R" is not the unit.
    if (t.name.length <= 2 && text.trim() !== t.name) continue;
    if (findTerm(text, t.name) && (!best || t.name.length > best.length)) best = t.name;
  }
  return best;
}

/**
 * A level's term: the one its label names ("Pre-market high" → Pre-market,
 * "VWAP" → VWAP), else Support or Resistance by which side of the price it
 * is on ("Floor", "Ceiling", "Round number").
 */
export function levelTerm(label: string | undefined, price: number, last: number): string {
  const named = label ? termIn(label) : null;
  if (named) return named;
  return price <= last ? 'Support' : 'Resistance';
}

/** What a state chip's name stands for, where the name is not a term itself. */
const CHIP_TERMS: Record<string, string> = {
  day: 'R',
  limit: 'Daily loss limit',
  size: 'Position size',
  trades: 'Trade',
  trade: 'Trade',
  stop: 'Stop-loss',
  costs: 'Commission',
  cost: 'Commission',
};

/** A state chip's term: by its name ("Size" → Position size), else one its words name. */
export function chipTerm(chip: string): string | null {
  const { name, value } = chipParts(chip);
  if (name) {
    const mapped = CHIP_TERMS[name.trim().toLowerCase()];
    if (mapped) return mapped;
  }
  return termIn(name ?? value);
}

/** The scanner's columns and the terms they stand for (ScannerTable's headings). */
export const SCANNER_TERMS: Record<string, string> = {
  ticker: 'Ticker',
  price: 'Price',
  change_pct: 'Daily change',
  rvol: 'Relative volume',
  float: 'Float',
  spread: 'Spread',
  catalyst: 'Catalyst',
};

function item(key: string, term: string | null, knows: Knows): ExplainItem | null {
  if (!term) return null;
  const skill = knows(term);
  if (!skill || !skill.info) return null;
  return { key, name: skill.name, line: skill.info };
}

/**
 * Everything a chart screen can label, in reading order: the state chips
 * above the chart, the pill, then the chart's own lines from the top of the
 * legend's list down -- VWAP, the levels, the volume bars, the plan's stop and
 * target and the R ruler. Only what is on screen and taught.
 */
export function chartExplain(
  {
    chips = [],
    pill = null,
    vwap = false,
    levels = [],
    last,
    volume = false,
    plan = false,
    ruler = false,
  }: {
    chips?: string[];
    /** The pill's words while it shows ("Next 5 candles"), else null. */
    pill?: string | null;
    vwap?: boolean;
    levels?: { price: number; label?: string }[];
    /** The last close the learner can see: which side a level is on. */
    last: number;
    volume?: boolean;
    /** The plan's stop and target lines are on the chart. */
    plan?: boolean;
    ruler?: boolean;
  },
  knows: Knows,
): ExplainItem[] {
  const out: (ExplainItem | null)[] = [
    ...chips.map((chip, i) => item(`chip:${i}`, chipTerm(chip), knows)),
    pill ? { key: 'pill', name: pill, line: PILL_LINE } : null,
    vwap ? item('vwap', 'VWAP', knows) : null,
    ...levels.map((l, i) => item(`level:${i}`, levelTerm(l.label, l.price, last), knows)),
    volume ? item('volume', 'Volume bar', knows) : null,
    plan ? item('stop', 'Stop-loss', knows) : null,
    plan ? item('target', 'Target', knows) : null,
    ruler ? item('ruler', 'R', knows) : null,
  ];
  // A level that is VWAP is already in the list as the line.
  const items = out.filter((x): x is ExplainItem => x !== null);
  return items.filter(
    (x, i) =>
      !(
        x.key.startsWith('level:') &&
        x.name === 'VWAP' &&
        items.some((y, j) => j < i && y.key === 'vwap')
      ),
  );
}

/** A scanner's column headings that are taught, in table order. */
export function scannerExplain(columns: string[], knows: Knows): ExplainItem[] {
  return columns
    .map((c) => item(`col:${c}`, SCANNER_TERMS[c] ?? null, knows))
    .filter((x): x is ExplainItem => x !== null);
}
