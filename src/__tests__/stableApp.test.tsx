// Reanimated and worklets need their native modules; under Jest their mocks stand in.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import React from 'react';
import renderer, { act } from 'react-test-renderer';

import Visual, { PlanValues } from '../components/Visual';
import { LESSONS, matchCard, sourceCardOf } from '../content';
import { sizerText } from '../screens/FillTilesScreen';
import type { Screen } from '../types';

const levelOf = (id: string) => LESSONS.find((e) => e.id === id)!.level;

describe('the recap opens the card a takeaway came from (review M4)', () => {
  const recapOf = (id: string) =>
    levelOf(id).screens.find((s) => s.type === 'recap') as Extract<Screen, { type: 'recap' }>;

  it('1-4: "only a closed trade has a result" opens the card about positions', () => {
    const point = recapOf('level-01-4').points[0];
    expect(sourceCardOf(levelOf('level-01-4'), point)?.title).toBe(
      'While you hold it, you have a position',
    );
  });

  it("a point's own `card:` wins over the text", () => {
    const point = { text: 'Buying opens a position.', level: '1-1', card: 2 };
    expect(sourceCardOf(levelOf('level-01-4'), point)?.title).toBe('This is a price chart');
  });

  it('a `card:` that names no card falls back to the text', () => {
    const screens = levelOf('level-01-1').screens;
    const point = { text: 'Buying opens a position, selling closes it.', card: 1 };
    expect(matchCard(screens, point)?.title).toBe('While you hold it, you have a position');
  });

  it('an example card, which has no title, can be the one', () => {
    const screens: Screen[] = [
      { type: 'theory', title: 'Charts', body: 'Time runs left to right.' },
      { type: 'example', body: 'XYZ moves 25 cents on 300 shares: $75.' },
    ];
    expect(matchCard(screens, { text: 'Move times shares: 25 cents on 300 shares.' })).toEqual({
      title: undefined,
      body: 'XYZ moves 25 cents on 300 shares: $75.',
    });
  });

  it('a lesson without a card opens nothing', () => {
    expect(matchCard([{ type: 'intro', text: 'Hi' }], { text: 'Anything.' })).toBeNull();
  });
});

describe('fill-tiles keeps the answer out of the page (review M6)', () => {
  it('the blank is sized by placeholders, not the word', () => {
    expect(sizerText('plan')).toBe('MMMM');
    expect(sizerText('plan')).not.toMatch(/plan/i);
  });
});

describe('the plan sheet shows the saved plan (review M1)', () => {
  const data = {
    fields: [
      { key: 'setup_name', label: 'The name you will watch' },
      { key: 'setup_style', label: 'Holding period' },
    ],
  };
  const texts = (tree: renderer.ReactTestRenderer) =>
    tree.root
      .findAll((n) => typeof n.type === 'string' && n.children.every((c) => typeof c === 'string'))
      .map((n) => n.children.join(''));

  // DESIGN-REVIEW: an empty line shows a faint dash (docs/UI.md §6.8, the plan as a document).
  it('rows show what the learner wrote, and a dash only for what they did not', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PlanValues.Provider value={{ setup_name: 'LUMA' }}>
          <Visual component="plan-sheet" data={data} width={320} />
        </PlanValues.Provider>,
      );
    });
    const shown = texts(tree);
    expect(shown).toContain('LUMA');
    expect(shown.filter((t) => t === '—')).toHaveLength(1);
    act(() => tree.unmount());
  });
});
