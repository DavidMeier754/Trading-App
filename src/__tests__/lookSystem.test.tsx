// Reanimated and worklets need their native modules; under Jest their mocks stand in.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  // The lesson's fit (lesson/fitState.ts) keeps two mutables, read with get()
  // and written with set(); the stock mock hands back the bare value.
  const makeMutable = (initial: unknown) => {
    let value = initial;
    return {
      get: () => value,
      set: (next: unknown) => {
        value = next;
      },
    };
  };
  return { ...mock, makeMutable };
});

import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import renderer, { act } from 'react-test-renderer';

import ChangeDesign from '../home/ChangeDesign';
import SettingsScreen from '../home/SettingsScreen';
import { SUGGESTIONS } from '../home/ideas';
import { getLook, LOOK_ORDER, LOOKS, setLook, useLook } from '../lesson/look';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mounted: renderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<SafeAreaProvider initialMetrics={METRICS}>{node}</SafeAreaProvider>);
  });
  mounted.push(tree);
  return tree;
}

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((t) => [t.props.children].flat().join(''));

/** The button a finger finds by its words or its screen-reader label. */
function button(tree: renderer.ReactTestRenderer, name: string) {
  const found = tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function' &&
      (n.props.accessibilityLabel === name ||
        n.findAllByType(Text).some((t) => t.props.children === name)),
  );
  if (!found.length) throw new Error(`No button "${name}"`);
  return found[0];
}

/** What the screen wears right now, previews included. */
const seen = { look: '' };
function Shown() {
  const look = useLook();
  useEffect(() => {
    seen.look = look;
  });
  return null;
}

beforeEach(() => {
  jest.useFakeTimers();
  act(() => setLook('neo'));
});

afterEach(() => {
  act(() => mounted.splice(0).forEach((t) => t.unmount()));
  jest.useRealTimers();
});

describe('Settings → Change design (docs/UI.md §11.5)', () => {
  it('shows each look full screen without choosing it, and chooses the one on screen', () => {
    const tree = render(
      <>
        <Shown />
        <ChangeDesign width={390} onBack={() => {}} />
      </>,
    );
    expect(texts(tree)).toContain(LOOKS.neo.name);
    expect(texts(tree)).toContain('In use');

    act(() => button(tree, 'Next design').props.onPress());
    // The screen wears Neo Mono; Neo is still the one chosen (and saved).
    expect(seen.look).toBe(LOOK_ORDER[1]);
    expect(getLook()).toBe('neo');
    expect(texts(tree)).toContain(LOOKS[LOOK_ORDER[1]].name);

    act(() => button(tree, 'Use this design').props.onPress());
    expect(getLook()).toBe(LOOK_ORDER[1]);
    expect(texts(tree)).toContain('In use');
  });

  it('puts the chosen look back on screen when it is left without choosing', () => {
    const tree = render(
      <>
        <Shown />
        <ChangeDesign width={390} onBack={() => {}} />
      </>,
    );
    act(() => button(tree, 'Next design').props.onPress());
    act(() => button(tree, 'Next design').props.onPress());
    expect(seen.look).toBe(LOOK_ORDER[2]);
    act(() => tree.unmount());
    mounted.splice(mounted.indexOf(tree), 1);
    const again = render(<Shown />);
    expect(again).toBeTruthy();
    expect(seen.look).toBe('neo');
    expect(getLook()).toBe('neo');
  });

  it('is one row in Settings, with the design in use, above the testing tools', () => {
    const onOpenDesign = jest.fn();
    const onOpenBench = jest.fn();
    const onOpenAnimations = jest.fn();
    const onOpenSuggestions = jest.fn();
    const tree = render(
      <SettingsScreen
        onBack={() => {}}
        onOpenDesign={onOpenDesign}
        onOpenBench={onOpenBench}
        onOpenLesson={() => {}}
        onOpenAnimations={onOpenAnimations}
        onOpenSuggestions={onOpenSuggestions}
      />,
    );
    expect(texts(tree)).toContain(LOOKS.neo.name);
    act(() => button(tree, 'Change design').props.onPress());
    expect(onOpenDesign).toHaveBeenCalledTimes(1);
  });

  it('holds the testing tools itself (David, 2026-09-30)', () => {
    const onOpenBench = jest.fn();
    const onOpenAnimations = jest.fn();
    const onOpenSuggestions = jest.fn();
    const tree = render(
      <SettingsScreen
        onBack={() => {}}
        onOpenDesign={() => {}}
        onOpenBench={onOpenBench}
        onOpenLesson={() => {}}
        onOpenAnimations={onOpenAnimations}
        onOpenSuggestions={onOpenSuggestions}
      />,
    );
    const shown = texts(tree);
    for (const title of ['Testing', 'Refill hearts', 'Skip ahead']) expect(shown).toContain(title);
    act(() => button(tree, 'Every screen type').props.onPress());
    act(() => button(tree, 'Animations').props.onPress());
    act(() => button(tree, 'Design suggestions').props.onPress());
    expect(onOpenBench).toHaveBeenCalledTimes(1);
    expect(onOpenAnimations).toHaveBeenCalledTimes(1);
    expect(onOpenSuggestions).toHaveBeenCalledTimes(1);
  });
});

describe('the Design suggestions (stage LOOK-BRIEF, David)', () => {
  it('keeps the five ideas David was asked about, with the three now in the app marked so', () => {
    // LOOK-BRIEF put two in the mix; DESIGN-REVIEW (David's picks of
    // 2026-10-04) added the answers keyed A to D.
    const asked = SUGGESTIONS.filter((s) => s.section === 'mix');
    expect(asked).toHaveLength(5);
    expect(asked.filter((s) => s.tag === 'app').map((s) => s.id)).toEqual([
      'countup',
      'steps',
      'keys',
    ]);
    expect(asked.filter((s) => s.tag === 'out').map((s) => s.id)).toEqual(['smallcaps', 'board']);
  });

  it('has a group of win screens, each a design the app plays (David, 2026-10-04)', () => {
    const wins = SUGGESTIONS.filter((s) => s.section === 'wins');
    expect(wins.length).toBeGreaterThanOrEqual(5);
    expect(wins.every((s) => s.tag === 'app')).toBe(true);
  });
});
