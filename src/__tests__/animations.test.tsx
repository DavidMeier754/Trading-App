// Reanimated and worklets need their native modules; under Jest their mocks stand in.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import renderer, { act } from 'react-test-renderer';

import { CHAPTER_ONE, levelsOf } from '../content';
import AnimationsScreen from '../home/AnimationsScreen';
import { forgetShownPath, shownStatusOf } from '../home/LevelNode';
import { resetProgress, skipTo } from '../progress';
import { TEST_TOOLS } from '../testTools';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mounted: renderer.ReactTestRenderer[] = [];

function renderPage(onShowMap = jest.fn()) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <AnimationsScreen onBack={() => {}} onShowMap={onShowMap} />
      </SafeAreaProvider>,
    );
  });
  mounted.push(tree);
  return tree;
}

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((t) => [t.props.children].flat().join(''));

/** The button that carries `title`, as a finger finds it. */
function button(tree: renderer.ReactTestRenderer, title: string) {
  const found = tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function' &&
      n.findAllByType(Text).some((t) => t.props.children === title),
  );
  if (!found.length) throw new Error(`No button "${title}"`);
  return found[0];
}

beforeEach(() => {
  jest.useFakeTimers();
  resetProgress();
  forgetShownPath();
});

afterEach(() => {
  // A page left mounted would hear the next test's reset.
  act(() => mounted.splice(0).forEach((t) => t.unmount()));
  jest.useRealTimers();
});

describe('the testing tools (docs/UI.md §11.5)', () => {
  it('are on in a development run, which is what Expo Go opens', () => {
    // Jest runs as development (__DEV__), with no EXPO_PUBLIC_TEST_TOOLS needed.
    expect(TEST_TOOLS).toBe(true);
  });
});

describe('Settings → Testing → Animations (David, 2026-09-29)', () => {
  it('plays a level opening on the map, once a level before it is finished', () => {
    const onShowMap = jest.fn();
    const tree = renderPage(onShowMap);
    // Nothing finished yet: there is no level to move on from.
    expect(button(tree, 'Level opens').props.accessibilityState).toEqual({ disabled: true });

    const [first, second] = levelsOf([CHAPTER_ONE]);
    act(() => skipTo(second.key));
    act(() => button(tree, 'Level opens').props.onPress());

    expect(onShowMap).toHaveBeenCalledTimes(1);
    // The map remembers Level 1 as unfinished and Level 2 as locked, so it
    // moves on from one to the other when it is drawn.
    expect(shownStatusOf(first.key)).toBe('current');
    expect(shownStatusOf(second.key)).toBe('locked');
  });

  it.each([
    'Lesson complete',
    'Perfect run',
    'Streak goes up',
    'Streak lost',
    'Chapter complete',
    'New tier',
    'Out of hearts',
  ])('plays "%s" on its own page, and again on Play again', (title) => {
    const tree = renderPage();
    act(() => button(tree, title).props.onPress());
    expect(texts(tree)).toContain(title);
    act(() => button(tree, 'Play again').props.onPress());
    act(() => jest.runOnlyPendingTimers());
    expect(texts(tree)).toContain(title);
  });

  it('plays the streak screens from the streak as it stands (David, 2026-09-30)', () => {
    const tree = renderPage();
    act(() => button(tree, 'Streak goes up').props.onPress());
    // No streak yet: it goes from 0 to 1 day, and the week shows its seven days.
    expect(texts(tree)).toEqual(expect.arrayContaining(['0', '1', 'day streak', 'M', 'S']));
    act(() => jest.runOnlyPendingTimers());
    act(() => button(tree, 'Play again').props.onPress());
    expect(texts(tree)).toContain('day streak');
    act(() => tree.root.findByProps({ accessibilityLabel: 'Back' }).props.onPress());
    act(() => button(tree, 'Streak lost').props.onPress());
    // Nothing to lose yet: a streak of 12 rolls to 0, and the words are kind.
    expect(texts(tree)).toEqual(
      expect.arrayContaining(['12', '0', 'Streak lost', 'A new one starts today.']),
    );
  });

  it('counts right answers in a row and takes a heart for a wrong one', () => {
    const tree = renderPage();
    act(() => button(tree, 'Heart lost').props.onPress());
    expect(texts(tree)).toContain('0 in a row');
    act(() => button(tree, 'Right').props.onPress());
    act(() => button(tree, 'Right').props.onPress());
    act(() => button(tree, 'Right').props.onPress());
    expect(texts(tree)).toContain('3 in a row');
    expect(texts(tree)).toContain('5');
    act(() => button(tree, 'Wrong').props.onPress());
    expect(texts(tree)).toContain('0 in a row');
    expect(texts(tree)).toContain('4');
    act(() => button(tree, 'Start again').props.onPress());
    expect(texts(tree)).toContain('5');
  });
});
