import { LESSONS } from '../content';
import { decisionButtons, gradeDecision } from '../lesson/answers';
import {
  decisionReveal,
  decisionRevealLabel,
  longestDecisionReveal,
  positionTag,
  VARIANCE_LINE,
} from '../lesson/decisionReveal';
import type { ChartDecisionScreen, DecisionButton } from '../types';

/**
 * docs/UI.md §5.1b, review M5 and M7: the reveal of a chart decision, for every
 * combination of grade × result × traded-or-stood-aside. The decision is made
 * at the second bar (10.10); the chart then ends 20 cents higher or lower, so
 * 100 shares make or lose $20.00.
 */
const RISES = [10.0, 10.1, 10.2, 10.3];
const FALLS = [10.0, 10.1, 10.0, 9.9];

function scenario(
  best: DecisionButton,
  reasonable: DecisionButton[],
  data: number[],
  buttons: DecisionButton[] = ['buy', 'wait'],
): ChartDecisionScreen {
  return {
    type: 'chart-decision',
    scenario: 'XYZ.',
    shares: 100,
    chart: { kind: 'line', data, decision_index: 1 },
    buttons,
    best,
    reasonable,
    outcome: 'The outcome sentence from the level file.',
    explanation: 'The explanation.',
  };
}

type Row = [
  grade: 'correct' | 'amber' | 'wrong',
  result: 'win' | 'loss',
  action: 'traded' | 'stood aside',
  best: DecisionButton,
  reasonable: DecisionButton[],
  choice: DecisionButton,
  chip: string,
  lead: string,
  line: string,
  tone: 'up' | 'down' | 'hypothetical',
  variance: boolean,
];

// For standing aside, "win" and "loss" are what the trade not taken would have done.
const TABLE: Row[] = [
  [
    'correct',
    'win',
    'traded',
    'buy',
    [],
    'buy',
    'Good call',
    'Buying was the right call here.',
    '+$20.00 on 100 shares',
    'up',
    false,
  ],
  [
    'correct',
    'loss',
    'traded',
    'buy',
    [],
    'buy',
    'Good call',
    'Buying was the right call here.',
    '−$20.00 on 100 shares',
    'down',
    true,
  ],
  [
    'correct',
    'win',
    'stood aside',
    'wait',
    [],
    'wait',
    'Good call',
    'Waiting was the right call here.',
    'Had you bought: +$20.00 on 100 shares',
    'hypothetical',
    false,
  ],
  [
    'correct',
    'loss',
    'stood aside',
    'wait',
    [],
    'wait',
    'Good call',
    'Waiting was the right call here.',
    'Had you bought: −$20.00 on 100 shares',
    'hypothetical',
    false,
  ],
  [
    'amber',
    'win',
    'traded',
    'wait',
    ['buy'],
    'buy',
    'Reasonable',
    'Buying here was a fair call, but the better one was Wait.',
    '+$20.00 on 100 shares',
    'up',
    false,
  ],
  [
    'amber',
    'loss',
    'traded',
    'wait',
    ['buy'],
    'buy',
    'Reasonable',
    'Buying here was a fair call, but the better one was Wait.',
    '−$20.00 on 100 shares',
    'down',
    false,
  ],
  [
    'amber',
    'win',
    'stood aside',
    'buy',
    ['wait'],
    'wait',
    'Reasonable',
    'Standing aside costs nothing here. The better call was Buy.',
    'Had you bought: +$20.00 on 100 shares',
    'hypothetical',
    false,
  ],
  [
    'amber',
    'loss',
    'stood aside',
    'buy',
    ['wait'],
    'wait',
    'Reasonable',
    'Standing aside costs nothing here. The better call was Buy.',
    'Had you bought: −$20.00 on 100 shares',
    'hypothetical',
    false,
  ],
  [
    'wrong',
    'win',
    'traded',
    'wait',
    [],
    'buy',
    'Not this time',
    'Buying was not the call here. The better one was Wait.',
    '+$20.00 on 100 shares',
    'up',
    false,
  ],
  [
    'wrong',
    'loss',
    'traded',
    'wait',
    [],
    'buy',
    'Not this time',
    'Buying was not the call here. The better one was Wait.',
    '−$20.00 on 100 shares',
    'down',
    false,
  ],
  [
    'wrong',
    'win',
    'stood aside',
    'buy',
    [],
    'wait',
    'Not this time',
    'Waiting was not the call here. The better one was Buy.',
    'Had you bought: +$20.00 on 100 shares',
    'hypothetical',
    false,
  ],
  [
    'wrong',
    'loss',
    'stood aside',
    'buy',
    [],
    'wait',
    'Not this time',
    'Waiting was not the call here. The better one was Buy.',
    'Had you bought: −$20.00 on 100 shares',
    'hypothetical',
    false,
  ],
];

describe('decisionReveal: grade × result × traded or stood aside', () => {
  it.each(TABLE)(
    '%s, %s, %s',
    (grade, result, action, best, reasonable, choice, chip, lead, line, tone, variance) => {
      const screen = scenario(best, reasonable, result === 'win' ? RISES : FALLS);
      expect(gradeDecision(screen, choice)).toBe(grade);
      const r = decisionReveal(screen, choice);
      expect(r.grade).toBe(grade);
      expect(r.chip).toBe(chip);
      expect(r.lead).toBe(lead);
      expect(r.outcome).toBe(screen.outcome);
      expect(r.result).toBe(line);
      expect(r.tone).toBe(tone);
      expect(r.stoodAside).toBe(action === 'stood aside');
      expect(r.variance).toBe(variance ? VARIANCE_LINE : undefined);
    },
  );

  it('covers all twelve combinations once', () => {
    const keys = new Set(TABLE.map(([g, r, a]) => `${g}|${r}|${a}`));
    expect(keys.size).toBe(12);
  });
});

describe('decisionReveal: the rules behind the table', () => {
  const combos = (['buy', 'wait'] as DecisionButton[]).flatMap((best) =>
    [[], ['buy'], ['wait']].flatMap((reasonable) =>
      [RISES, FALLS].flatMap((data) =>
        (['buy', 'wait'] as DecisionButton[]).map((choice) => ({
          screen: scenario(best, reasonable as DecisionButton[], data),
          choice,
        })),
      ),
    ),
  );

  it('"Standing aside costs nothing" is only said to someone who stood aside', () => {
    for (const { screen, choice } of combos) {
      const r = decisionReveal(screen, choice);
      if (!r.stoodAside) expect(r.lead).not.toMatch(/standing aside/i);
    }
  });

  it('the variance line only joins a right call to a losing trade', () => {
    for (const { screen, choice } of combos) {
      const r = decisionReveal(screen, choice);
      const expected = r.grade === 'correct' && !r.stoodAside && r.pnl < 0;
      expect(!!r.variance).toBe(expected);
    }
  });

  it('the outcome never changes the grade', () => {
    for (const { screen, choice } of combos) {
      const flipped = { ...screen, chart: { ...screen.chart, data: [...FALLS] } };
      expect(decisionReveal(flipped, choice).grade).toBe(decisionReveal(screen, choice).grade);
    }
  });

  it('a screen reader hears the grade, then the outcome sentence, then the result line', () => {
    const r = decisionReveal(scenario('buy', [], FALLS), 'buy');
    const label = decisionRevealLabel(r, 'The explanation.');
    const at = (s: string) => label.indexOf(s);
    expect(at('Good call')).toBe(0);
    expect(at(r.outcome)).toBeGreaterThan(at('Good call'));
    expect(at(r.result)).toBeGreaterThan(at(r.outcome));
  });
});

describe('decisionReveal: long, short and no trade', () => {
  const LSN: DecisionButton[] = ['long', 'short', 'no-trade'];

  it('a short gains when the price falls', () => {
    const r = decisionReveal(scenario('short', ['no-trade'], FALLS, LSN), 'short');
    expect(r.result).toBe('+$20.00 on 100 shares');
    expect(r.tone).toBe('up');
    expect(r.lead).toBe('Going short was the right call here.');
  });

  it('a right short that loses gets the variance line', () => {
    const r = decisionReveal(scenario('short', ['no-trade'], RISES, LSN), 'short');
    expect(r.result).toBe('−$20.00 on 100 shares');
    expect(r.variance).toBe(VARIANCE_LINE);
  });

  it('no trade shows the best trade as the "would have", in grey', () => {
    const r = decisionReveal(scenario('short', ['no-trade'], FALLS, LSN), 'no-trade');
    expect(r.lead).toBe('Standing aside costs nothing here. The better call was Short.');
    expect(r.result).toBe('Had you gone short: +$20.00 on 100 shares');
    expect(r.tone).toBe('hypothetical');
  });

  it('when no trade was best, the "would have" is the first trade on offer', () => {
    const r = decisionReveal(scenario('no-trade', [], FALLS, LSN), 'no-trade');
    expect(r.lead).toBe('Staying out was the right call here.');
    expect(r.result).toBe('Had you gone long: −$20.00 on 100 shares');
  });

  it('a flat trade is neither a win nor a loss', () => {
    const r = decisionReveal(scenario('long', [], [10, 10.1, 10.2, 10.1], LSN), 'long');
    expect(r.result).toBe('$0.00 on 100 shares');
    expect(r.tone).toBe('flat');
    expect(r.variance).toBeUndefined();
  });

  it('candles are read by their close', () => {
    const screen: ChartDecisionScreen = {
      ...scenario('long', [], [], LSN),
      chart: {
        kind: 'candles',
        data: [
          [10, 10.2, 9.9, 10.1],
          [10.1, 10.3, 10.0, 10.2],
          [10.2, 10.5, 10.1, 10.45],
        ],
        decision_index: 1,
      },
    };
    expect(decisionReveal(screen, 'long').result).toBe('+$25.00 on 100 shares');
  });
});

describe('the chart tag and the room kept for the reveal', () => {
  it('the tag names the position, never a coloured P/L', () => {
    const screen = scenario('buy', [], RISES);
    expect(positionTag(screen, 'buy')).toBe('long 100 shares');
    expect(positionTag(screen, 'wait')).toBe('no position');
    expect(positionTag(screen, 'buy')).not.toMatch(/\$/);
  });

  it('the probe measures the tallest reveal any button can give', () => {
    const screen = scenario('buy', ['wait'], FALLS);
    const longest = longestDecisionReveal(screen);
    const size = (b: DecisionButton) => {
      const r = decisionReveal(screen, b);
      return r.lead.length + r.result.length + (r.variance?.length ?? 0);
    };
    for (const b of decisionButtons(screen)) {
      expect(
        longest.lead.length + longest.result.length + (longest.variance?.length ?? 0),
      ).toBeGreaterThanOrEqual(size(b));
    }
  });
});

describe('the real screens from the test checklist', () => {
  const screenOf = (id: string, n: number) =>
    LESSONS.find((e) => e.id === id)!.level.screens[n - 1] as ChartDecisionScreen;

  it('level-09-2 screen 3, Buy: amber, about the purchase, +$45.00 on 250 shares', () => {
    const r = decisionReveal(screenOf('level-09-2', 3), 'buy');
    expect(r.chip).toBe('Reasonable');
    expect(r.lead).toMatch(/^Buying/);
    expect(r.outcome).toMatch(/three prices to sell/);
    expect(r.result).toBe('+$45.00 on 250 shares');
  });

  it('level-09-2 screen 3, Wait: green, the result a grey "would have"', () => {
    const r = decisionReveal(screenOf('level-09-2', 3), 'wait');
    expect(r.chip).toBe('Good call');
    expect(r.tone).toBe('hypothetical');
    expect(r.result).toBe('Had you bought: +$45.00 on 250 shares');
  });

  it('level-01-1 screen 6 fits both choices', () => {
    const screen = screenOf('level-01-1', 6);
    expect(screen.explanation).not.toMatch(/you just made your first trade/i);
  });

  it('no real chart decision tells a trader they stood aside', () => {
    for (const entry of LESSONS) {
      for (const s of entry.level.screens) {
        if (s.type !== 'chart-decision') continue;
        for (const b of decisionButtons(s)) {
          const r = decisionReveal(s, b);
          if (!r.stoodAside) expect(r.lead).not.toMatch(/standing aside/i);
          expect(r.result).not.toMatch(/NaN/);
        }
      }
    }
  });
});
