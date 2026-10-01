// Reanimated and worklets need their native modules; under Jest their mocks stand in.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { NodeLabel, unbroken } from '../home/LearnScreen';
import { nodeLabel } from '../home/LevelNode';
import { chapterViews } from '../home/pathState';
import { getProgress } from '../progress';
import Cta from '../lesson/Cta';

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((t) => [t.props.children].flat().join(''));

describe('the map draws each label once (stage LOOK-BRIEF, David: stray "LE", "LEVE")', () => {
  const views = chapterViews(getProgress()).flatMap((c) => c.levels);

  it('labels a level with its title alone, in one text (docs/UI.md §7.1)', () => {
    const view = views[0];
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<NodeLabel view={view} side="right" room={170} />);
    });
    expect(texts(tree)).toEqual([unbroken(view.level.title)]);
  });

  it('names a level once to a screen reader (review S9)', () => {
    const first = views[0];
    expect(nodeLabel(first)).toBe(
      `Level ${first.level.number}: ${first.level.title}. 0 of ${first.total} lessons done`,
    );
    const checkpoint = views.find((v) => v.level.kind === 'test');
    expect(checkpoint).toBeDefined();
    const label = nodeLabel(checkpoint!);
    expect(label.match(/Checkpoint/g)).toHaveLength(1);
    expect(label).toMatch(/\. Locked$/);
  });

  it('never breaks a title at its hyphen', () => {
    expect(unbroken('Candle Signals on the 1-Minute')).toBe('Candle Signals on the 1‑Minute');
    expect(unbroken('Setup F — Gap-and-Go Continuation')).not.toContain('-');
    expect(unbroken('Confluence')).toBe('Confluence');
  });
});

describe("a key's label stays on one line (docs/UI.md §10)", () => {
  it('the lesson key sets its label on one line and shrinks a long one to fit', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Cta label="Continue" onPress={() => {}} />);
    });
    const label = tree.root.findByType(Text);
    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.adjustsFontSizeToFit).toBe(true);
  });
});
