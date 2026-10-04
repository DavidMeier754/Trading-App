import { bookWalk, orderShares } from '../lesson/bookWalk';
import { LESSONS } from '../content';
import type { DepthLadderScreen } from '../types';

const BOOK: DepthLadderScreen = {
  type: 'depth-ladder',
  prompt: 'You market-buy 1,000 shares. Where does the last share fill?',
  data: {
    bids: [
      [20.0, 1200],
      [19.99, 800],
      [19.98, 3000],
    ],
    asks: [
      [20.02, 500],
      [20.03, 2200],
      [20.04, 900],
    ],
  },
  target: 'ask-2',
  explanation: '',
};

describe('the walk through the book (docs/ui/04-question-types.md §4.2)', () => {
  it('drains the levels before the target and the share of it the order takes', () => {
    expect(bookWalk(BOOK)).toEqual({ side: 'ask', levels: 2, last: 500 / 2200 });
  });

  it('prefers the file’s shares to the prompt', () => {
    expect(orderShares({ ...BOOK, shares: 700 })).toBe(700);
    expect(bookWalk({ ...BOOK, shares: 2700 })?.last).toBe(1);
  });

  it('reads "a 600-share buy" as well as "1,400 shares"', () => {
    expect(orderShares({ ...BOOK, prompt: 'Half size means a 600-share market buy.' })).toBe(600);
  });

  it('marks the target without a share when the size does not end there', () => {
    expect(bookWalk({ ...BOOK, shares: 4000 })).toEqual({ side: 'ask', levels: 2, last: null });
    expect(bookWalk({ ...BOOK, prompt: 'You send the 1,400 as a market order.' })?.last).toBeNull();
  });

  it('every ladder in the content walks to its target', () => {
    let sized = 0;
    let all = 0;
    for (const entry of LESSONS) {
      for (const s of entry.level.screens) {
        if (s.type !== 'depth-ladder') continue;
        all++;
        const walk = bookWalk(s);
        expect(walk).not.toBeNull();
        if (walk?.last !== null) sized++;
      }
    }
    expect(all).toBeGreaterThan(0);
    // Reading the prompt finds the size on all but a few; the rest are marked only.
    expect(sized / all).toBeGreaterThan(0.9);
  });
});
