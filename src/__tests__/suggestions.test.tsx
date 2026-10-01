// Reanimated, worklets and Gesture Handler need their native modules; under
// Jest their mocks stand in.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import 'react-native-gesture-handler/jestSetup';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import renderer, { act } from 'react-test-renderer';

import { SECTIONS, SUGGESTIONS } from '../home/ideas';
import Suggestions, { openSuggestionAt } from '../home/Suggestions';
import { setLook } from '../lesson/look';
import { setThemeMode } from '../theme';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((t) => [t.props.children].flat().join(''));

function render(node: React.ReactElement) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<SafeAreaProvider initialMetrics={METRICS}>{node}</SafeAreaProvider>);
  });
  return tree;
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Settings → Testing → Design suggestions (David, 2026-10-01: "way more")', () => {
  it('lists every idea once, in a group of its own', () => {
    const ids = SUGGESTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(SUGGESTIONS.map((s) => s.title)).size).toBe(ids.length);
    for (const section of SECTIONS) {
      expect(SUGGESTIONS.some((s) => s.section === section.id)).toBe(true);
    }
    expect(SUGGESTIONS.length).toBeGreaterThanOrEqual(30);
  });

  it('says each idea in one short line (fewer words, docs/UI.md §10)', () => {
    for (const s of SUGGESTIONS) {
      expect(s.line.length).toBeLessThanOrEqual(110);
      expect(s.title.length).toBeLessThanOrEqual(40);
    }
  });

  it('opens a preview from its row, as the Animations page does', () => {
    const tree = render(<Suggestions onBack={() => {}} />);
    const first = SUGGESTIONS[0];
    const row = tree.root.find(
      (n) =>
        n.props.accessibilityRole === 'button' &&
        typeof n.props.onPress === 'function' &&
        String(n.props.accessibilityLabel ?? '').startsWith(`${first.title}.`),
    );
    act(() => row.props.onPress());
    expect(texts(tree)).toContain(first.title);
    expect(texts(tree)).toContain(first.line);
    act(() => tree.unmount());
  });

  it.each(SUGGESTIONS.map((s) => [s.id]))('plays %s without breaking', (id) => {
    for (const [look, theme] of [
      ['neo', 'dark'],
      ['classicContrast', 'light'],
    ] as const) {
      act(() => {
        setLook(look);
        setThemeMode(theme);
      });
      expect(openSuggestionAt(id)).toBe(true);
      const tree = render(<Suggestions onBack={() => {}} />);
      act(() => {
        jest.advanceTimersByTime(8000);
      });
      const again = tree.root.findAll(
        (n) =>
          n.props.accessibilityRole === 'button' &&
          typeof n.props.onPress === 'function' &&
          n.findAllByType(Text).some((t) => /^(Play|Start) again$/.test(t.props.children)),
      );
      if (again.length) {
        act(() => again[0].props.onPress());
        act(() => {
          jest.advanceTimersByTime(8000);
        });
      }
      act(() => tree.unmount());
    }
    act(() => {
      setLook('neo');
      setThemeMode('system');
    });
  });
});
