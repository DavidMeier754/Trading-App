import type { DepthLadderScreen } from '../types';

/**
 * docs/ui/04-question-types.md §4.2 `depth-ladder` [DESIGN-REVIEW]: after Check a market order
 * is walked through the book, level by level from the best price; each
 * level's size drains as it fills, and the level where the last share fills
 * is marked. Pure, so the walk can be tested against every ladder in the
 * content.
 */
export type BookWalk = {
  side: 'bid' | 'ask';
  /** How many levels the order reaches, the target's included. */
  levels: number;
  /** The share of the last level the order takes, 0..1; null when the order size is unknown. */
  last: number | null;
};

/** "1,400 shares", "a 600-share buy": the first share count in the prompt. */
const SHARES = /(\d{1,3}(?:,\d{3})+|\d+)(?:-share|\s+shares?\b)/;

/**
 * The order's size: the file's `shares`, else read from the English prompt.
 * Reading the prompt is a stopgap until every ladder carries `shares`
 * (docs/content-todo/): it would break once the prompt is translated.
 */
export function orderShares(screen: DepthLadderScreen): number | null {
  if (typeof screen.shares === 'number' && screen.shares > 0) return screen.shares;
  const m = SHARES.exec(screen.prompt);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

/** The walk to the target level; null when the target is not a level of the book. */
export function bookWalk(screen: DepthLadderScreen): BookWalk | null {
  const m = /^(bid|ask)-(\d+)$/.exec(screen.target);
  if (!m) return null;
  const side = m[1] as 'bid' | 'ask';
  const levels = Number(m[2]);
  const book = side === 'bid' ? screen.data.bids : screen.data.asks;
  if (levels < 1 || levels > book.length) return null;
  const before = book.slice(0, levels - 1).reduce((sum, [, size]) => sum + size, 0);
  const at = book[levels - 1][1];
  const shares = orderShares(screen);
  // Only a size that ends on the target is drawn; anything else would show a
  // fill the answer contradicts, so the target is marked without its share.
  const fits = shares !== null && shares > before && shares <= before + at;
  return { side, levels, last: fits ? (shares - before) / at : null };
}
