// Reanimated and worklets need their native modules; under Jest their mocks stand in.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import React from 'react';
import { PixelRatio, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { Kicker, unbroken } from '../home/LearnScreen';
import Cta from '../lesson/Cta';

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((t) => [t.props.children].flat().join(''));

describe('the map draws each label once (stage LOOK-BRIEF, David: stray "LE", "LEVE")', () => {
  it('sets the kicker on one line, and on two whole lines once that wraps', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<Kicker parts={['Level 7', 'New ideas']} right={false} />);
    });
    // A line of the kicker is 16 pt, times the phone's text size.
    const line = 16 * PixelRatio.getFontScale();
    const layout = (width: number, lines: number) =>
      act(() =>
        tree.root.findByType(Text).props.onLayout({
          nativeEvent: { layout: { x: 0, y: 0, width, height: line * lines } },
        }),
      );
    // One text, and no hidden copy beside it.
    expect(texts(tree)).toEqual(['Level 7 · New ideas']);
    layout(123, 1);
    expect(texts(tree)).toEqual(['Level 7 · New ideas']);
    // Wrapped: "Level 7" and "New ideas" on a line each, still one text.
    layout(96, 2);
    expect(texts(tree)).toEqual(['Level 7\nNew ideas']);
    layout(96, 2);
    expect(texts(tree)).toEqual(['Level 7\nNew ideas']);
    // A wider label tries one line again.
    layout(170, 2);
    expect(texts(tree)).toEqual(['Level 7 · New ideas']);
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
