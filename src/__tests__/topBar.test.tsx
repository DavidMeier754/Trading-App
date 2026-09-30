import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import renderer, { act } from 'react-test-renderer';

import LearnScreen from '../home/LearnScreen';
import { addGems, resetProgress } from '../progress';

// Reanimated and worklets need their native modules; under Jest their mocks
// stand in. Jest lifts these above the imports.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((t) => [t.props.children].flat().join(''));

describe('the top bar (docs/UI.md §7.2)', () => {
  const METRICS = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 47, left: 0, right: 0, bottom: 34 },
  };
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(() => {
    jest.useFakeTimers();
    resetProgress();
  });
  afterEach(() => {
    act(() => tree?.unmount());
    tree = null;
    jest.useRealTimers();
  });
  const render = () =>
    act(() => {
      tree = renderer.create(
        <SafeAreaProvider initialMetrics={METRICS}>
          <LearnScreen width={390} onStart={() => {}} />
        </SafeAreaProvider>,
      );
    });

  it('shows the path, the streak, the gems third and the hearts (David, 2026-09-30)', () => {
    act(() => addGems(120));
    render();
    const labels = tree!.root
      .findAll((n) => typeof n.props.accessibilityLabel === 'string' && n.type !== Text)
      .map((n) => n.props.accessibilityLabel as string)
      .filter((l) => /^Path:|day streak$|gems$|hearts/.test(l));
    const order = [...new Set(labels)];
    expect(order).toEqual(['Path: not chosen yet', '0 day streak', '120 gems', '5 hearts']);
    expect(texts(tree!)).toContain('120');
  });

  it('says how far today has got, whole, when the flame is tapped (it read "T...")', () => {
    render();
    const flame = tree!.root.find(
      (n) => n.props.accessibilityLabel === '0 day streak' && typeof n.props.onPress === 'function',
    );
    act(() => flame.props.onPress());
    const today = tree!.root.findAllByType(Text).find((t) => t.props.children === 'Today 0/2');
    expect(today).toBeDefined();
    expect(today!.props.numberOfLines).toBe(1);
  });
});
