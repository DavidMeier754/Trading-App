import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { CueName } from '../../lesson/cues.generated';
import { detentFeedback, igniteFeedback } from '../../lesson/feedback';
import { useLookSpec } from '../../lesson/look';
import { EASE_IN_OUT, EASE_OUT, usePressFeedback } from '../../lesson/motion';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { colors, MONO_FONT, radius, space, themed, type } from '../../theme';
import Icon, { type IconName } from '../icons';
import { Gem, PathLogo } from '../scenes';
import { MiniScreen, Suggestion } from './kit';
import { LevelButton, RING, StartTag } from './map';

/** Ideas for the bars round the screen: the tab bar along the bottom, the top bar and what it holds. */
export const BARS: Suggestion[] = [
  {
    id: 'tab-pill',
    section: 'bars',
    icon: 'learn',
    title: 'Tabs with a sliding pill',
    line: 'The open tab sits in a pill that slides to the one you tap, and its icon gives a hop.',
    tag: 'rule',
    note: 'Tabs switch at once today, never with a slide (docs/UI.md §11.2).',
    Preview: TabPill,
  },
  {
    id: 'flame-tiers',
    section: 'bars',
    icon: 'flame',
    title: 'The flame grows with the streak',
    line: 'A spark for a day or two, a flame from three days, a blaze from a week, a blue flame from a month.',
    Preview: FlameTiers,
  },
  {
    id: 'tab-columns',
    section: 'bars',
    icon: 'gauge',
    title: 'Top bar on the tab columns',
    line: "The top bar's four items stand right over the four tabs, so the screen has one set of columns.",
    note: "The app's top bar lines up with the banner's edges instead.",
    Preview: TabColumns,
  },
  {
    id: 'ticker',
    section: 'bars',
    icon: 'news',
    title: 'A ticker under the top bar',
    line: 'Your numbers run past like a stock ticker: XP, accuracy, streak, gems.',
    tag: 'moves',
    note: 'Moves without a tap, against docs/UI.md §1: "Nothing moves unless the learner moved it".',
    Preview: Ticker,
  },
];

/** Clamped to 0..1. */
function unit(v: number): number {
  'worklet';
  return Math.min(1, Math.max(0, v));
}

// ---------------------------------------------------------------------------
// The bars, drawn: the top bar, the banner and the tab bar as the map has them
// ---------------------------------------------------------------------------

type Tab = { id: string; label: string; icon: IconName; line: string };

/** The tab bar's tabs (home/TabBar.tsx), with a line for the screen each opens. */
const TABS: Tab[] = [
  { id: 'learn', label: 'Learn', icon: 'learn', line: 'Your path, level by level.' },
  { id: 'practice', label: 'Practice', icon: 'practice', line: 'Drills on what you know.' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard', line: "This week's league." },
  { id: 'account', label: 'Account', icon: 'account', line: 'You and your settings.' },
];

/** The top bar's four items, left to right (LearnScreen's Hud). */
const HUD = ['logo', 'streak', 'gems', 'hearts'] as const;
type HudKind = (typeof HUD)[number];
const HUD_SAYS = 'Top bar: the path, a 4 day streak, 120 gems, 5 hearts.';

/** One item of the top bar as the map draws it, still: the path's logo, the streak, the gems, the hearts. */
function HudMark({ kind }: { kind: HudKind }) {
  const spec = useLookSpec();
  if (kind === 'logo') return <PathLogo size={30} face={spec.cta.face} mark={spec.cta.text} />;
  const color = kind === 'streak' ? colors.warning : kind === 'gems' ? colors.gem : colors.down;
  return (
    <View style={styles.hudItem}>
      {kind === 'gems' ? (
        <Gem size={22} color={color} />
      ) : (
        <Icon name={kind === 'streak' ? 'flame' : 'heart'} size={22} color={color} filled />
      )}
      <Text style={[styles.hudValue, { color }]}>
        {kind === 'streak' ? '4' : kind === 'gems' ? '120' : '5'}
      </Text>
    </View>
  );
}

/** The banner at the top of the map, naming the level being played. */
function MiniBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerKicker}>Lesson 2 of 3</Text>
      <Text style={styles.bannerTitle}>The Candle</Text>
    </View>
  );
}

/** The level being played, as the map draws it, with its tag over it. */
function MiniLevel() {
  return (
    <View style={styles.miniLevel}>
      <LevelButton status="current" icon="candle" fill={1 / 3} />
      <StartTag label="CONTINUE" />
    </View>
  );
}

/** The tab bar as the app draws it, Learn open, still. */
function MiniTabBar() {
  return (
    <View style={styles.tabBar}>
      {TABS.map((t, i) => {
        const on = i === 0;
        const color = on ? colors.accent : colors.textFaint;
        return (
          <View key={t.id} style={styles.tabItem}>
            <View style={[styles.tabMark, on && { backgroundColor: colors.accent }]} />
            <Icon name={t.icon} size={24} color={color} filled={on} />
            <Text style={[styles.tabLabel, { color }]}>{t.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

type SegOption = { label: string; num?: string };
const SEG_PAD = 4;

/** A switch of two to four options, a thumb sliding under the one picked. Each option is a 48 pt key. */
function Segmented({
  options,
  value,
  onChange,
  label,
  cue = 'tick',
}: {
  options: SegOption[];
  value: number;
  onChange: (index: number) => void;
  /** What the options choose, for a screen reader. */
  label: string;
  cue?: CueName | null;
}) {
  const reduced = useReduceMotion();
  const [width, setWidth] = useState(0);
  const x = useSharedValue(value);
  useEffect(() => {
    x.set(reduced ? value : withTiming(value, { duration: 280, easing: EASE_OUT }));
  }, [value, reduced, x]);
  const seg = width > 0 ? (width - SEG_PAD * 2) / options.length : 0;
  const thumb = useAnimatedStyle(() => ({
    width: seg,
    opacity: seg > 0 ? 1 : 0,
    transform: [{ translateX: seg * x.get() }],
  }));
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={styles.seg}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View pointerEvents="none" style={[styles.segThumb, thumb]} />
      {options.map((o, i) => (
        <SegKey
          key={`${o.num ?? ''}${o.label}`}
          option={o}
          on={i === value}
          cue={cue}
          onPress={() => onChange(i)}
        />
      ))}
    </View>
  );
}

function SegKey({
  option,
  on,
  cue,
  onPress,
}: {
  option: SegOption;
  on: boolean;
  cue: CueName | null;
  onPress: () => void;
}) {
  const press = usePressFeedback(true, { cue });
  return (
    <Animated.View style={[styles.segKeyWrap, press.style]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={option.num ? `${option.num} ${option.label}` : option.label}
        accessibilityState={{ checked: on }}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={styles.segKey}
      >
        <Text style={[styles.segText, on && styles.segTextOn]} numberOfLines={1}>
          {option.num ? <Text style={styles.segNum}>{option.num}</Text> : null}
          {option.num ? ` ${option.label}` : option.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Tabs with a sliding pill
// ---------------------------------------------------------------------------

const PILL_W = 56;
const PILL_H = 32;
/** The pill's front end gets there first and its back end catches up, so it stretches on the way. */
const PILL_FRONT = { duration: 240, easing: EASE_OUT };
const PILL_BACK = { duration: 380, easing: EASE_OUT };

/**
 * The app's tab bar with a pill behind the open tab's icon. A tap sends the
 * pill to the tab tapped, its front end ahead of its back so it stretches on
 * the way and draws up as it lands; the icon it lands on hops and fills in,
 * and its name takes the accent. The screen above switches at once, as tabs
 * do.
 */
function TabPill() {
  const reduced = useReduceMotion();
  const [tab, setTab] = useState(0);
  // Each tab is at least as wide as its name, and the rest is shared out, so
  // "Leaderboard" fits on a narrow phone too: the pill goes by the tabs'
  // measured centres, not by equal columns.
  const centres = useSharedValue<number[]>([]);
  const placed = useRef<number[]>([]);
  // The pill's two ends, in tabs from the left.
  const from = useSharedValue(0);
  const to = useSharedValue(0);

  const pick = (i: number) => {
    if (i === tab) return;
    setTab(i);
    if (reduced) {
      from.set(i);
      to.set(i);
      return;
    }
    const right = i > tab;
    from.set(withTiming(i, right ? PILL_BACK : PILL_FRONT));
    to.set(withTiming(i, right ? PILL_FRONT : PILL_BACK));
  };

  const pill = useAnimatedStyle(() => {
    const c = centres.get();
    if (c.length < TABS.length) return { opacity: 0 };
    // Where a tab position between two tabs lies, by their centres.
    const at = (t: number) => {
      const i = Math.min(Math.floor(t), c.length - 2);
      return c[i] + (c[i + 1] - c[i]) * (t - i);
    };
    const a = at(Math.min(from.get(), to.get()));
    const b = at(Math.max(from.get(), to.get()));
    return { opacity: 1, left: a - PILL_W / 2, width: PILL_W + (b - a) };
  });

  const open = TABS[tab];
  return (
    <MiniScreen height={300}>
      <View style={styles.pillHero}>
        <View style={styles.pillHeroMark}>
          <Icon name={open.icon} size={36} color={colors.accent} filled />
        </View>
        <Text style={styles.pillHeroTitle}>{open.label}</Text>
        <Text style={styles.pillHeroLine}>{open.line}</Text>
      </View>
      <View accessibilityRole="tablist" style={styles.pillBar}>
        <Animated.View pointerEvents="none" style={[styles.pill, pill]} />
        {TABS.map((t, i) => (
          <PillTab
            key={t.id}
            tab={t}
            on={i === tab}
            reduced={reduced}
            onPress={() => pick(i)}
            onCentre={(x) => {
              placed.current[i] = x;
              if (placed.current.filter((v) => v !== undefined).length === TABS.length) {
                centres.set([...placed.current]);
              }
            }}
          />
        ))}
      </View>
    </MiniScreen>
  );
}

function PillTab({
  tab,
  on,
  reduced,
  onPress,
  onCentre,
}: {
  tab: Tab;
  on: boolean;
  reduced: boolean;
  onPress: () => void;
  /** Where the tab's middle lies across the bar, once it is laid out. */
  onCentre: (x: number) => void;
}) {
  const lit = useSharedValue(on ? 1 : 0);
  const hop = useSharedValue(0);
  const was = useRef(on);
  useEffect(() => {
    if (was.current === on) return;
    was.current = on;
    if (reduced) {
      lit.set(on ? 1 : 0);
      return;
    }
    lit.set(withTiming(on ? 1 : 0, { duration: on ? 240 : 160, easing: EASE_OUT }));
    if (!on) return;
    // Up as the pill gets there, and down onto it with a spring that settles.
    hop.set(
      withDelay(
        40,
        withSequence(
          withTiming(-9, { duration: 150, easing: Easing.out(Easing.quad) }),
          withSpring(0, { duration: 560, dampingRatio: 0.42 }),
        ),
      ),
    );
  }, [on, reduced, lit, hop]);

  // Read here, in render: the styles below are worklets.
  const faint = colors.textFaint;
  const accent = colors.accent;
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hop.get() }, { scale: 1 - 0.014 * hop.get() }],
  }));
  const offStyle = useAnimatedStyle(() => ({ opacity: 1 - lit.get() }));
  const onStyle = useAnimatedStyle(() => ({ opacity: lit.get() }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(lit.get(), [0, 1], [faint, accent]),
  }));
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      accessibilityLabel={tab.label}
      onPressIn={on ? undefined : detentFeedback}
      onPress={onPress}
      onLayout={(e) => onCentre(e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2)}
      // At least as wide as its name (13 pt, about 7 pt a letter), the rest shared.
      style={[styles.pillTab, { minWidth: tab.label.length * 7 + 8 }]}
    >
      <Animated.View style={[styles.pillIcon, iconStyle]}>
        <Animated.View style={[styles.pillIconLayer, offStyle]}>
          <Icon name={tab.icon} size={24} color={faint} />
        </Animated.View>
        <Animated.View style={[styles.pillIconLayer, onStyle]}>
          <Icon name={tab.icon} size={24} color={accent} filled />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.pillLabel, { color: on ? accent : faint }, labelStyle]}>
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// The flame grows with the streak
// ---------------------------------------------------------------------------

type FlameTier = {
  days: number;
  name: string;
  /** The drawing's width; it is 1.2 times as tall. */
  size: number;
  shape: 'spark' | 'flame' | 'blaze';
  outer: [string, string];
  inner: [string, string];
  /** The blaze's side tongues. */
  tongue?: [string, string];
  glow: string;
  ember: string;
};

/** The four flames, bottom colour first: an orange spark, the streak's flame, a red blaze, a blue one. */
const FLAME_TIERS: FlameTier[] = [
  {
    days: 1,
    name: 'Spark',
    size: 104,
    shape: 'spark',
    outer: ['#FF7A1A', '#FFB648'],
    inner: ['#FFD54A', '#FFF6D6'],
    glow: '#FF9F1C',
    ember: '#FFC24A',
  },
  {
    days: 3,
    name: 'Flame',
    size: 124,
    shape: 'flame',
    outer: ['#FF6A1A', '#FFB02E'],
    inner: ['#FFD23F', '#FFF4C2'],
    glow: '#FF8A1F',
    ember: '#FFB02E',
  },
  {
    days: 7,
    name: 'Blaze',
    size: 148,
    shape: 'blaze',
    outer: ['#F0441C', '#FFA02E'],
    inner: ['#FFC93F', '#FFF4C2'],
    tongue: ['#E5301B', '#FF8A2A'],
    glow: '#FF5A1F',
    ember: '#FF9A2E',
  },
  {
    days: 30,
    name: 'Blue flame',
    size: 160,
    shape: 'blaze',
    outer: ['#2A6BFF', '#6CCBFF'],
    inner: ['#BDEEFF', '#FFFFFF'],
    tongue: ['#1B4FE0', '#43A6FF'],
    glow: '#3FA8FF',
    ember: '#A8E4FF',
  },
];

const STAGE_W = 240;
const STAGE_H = 200;
/** How far above the stage's foot the flames stand. */
const FLAME_BASE = 8;
/** Where the drawings' feet are, as a share of their height. */
const FLAME_FOOT = 116 / 120;
const FLAME_SPRING = { duration: 700, dampingRatio: 0.5 } as const;
/** How far past the stage a flame's glow may reach. */
const GLOW_PAD = 30;

// The drawings, on a 100 × 120 grid. The flame's tongues are the streak's own (home/scenes.tsx).
const FLAME_OUTER =
  'M50 4c7 21 32 36 32 68 0 26-15 44-32 44S18 98 18 72c0-16 8-27 16-35 0 14 5 22 12 25-4-18-2-39 4-58z';
const FLAME_INNER =
  'M51 50c5 14 18 21 18 38 0 14-8 22-19 22s-18-8-18-22c0-9 5-15 10-19 0 7 3 11 7 12-2-8-1-20 2-31z';
const SPARK_OUTER = 'M50 34c7 17 22 29 22 52 0 18-10 30-22 30S28 104 28 86c0-23 15-35 22-52z';
const SPARK_INNER = 'M50 68c4 9 11 14 11 24 0 9-5 15-11 15s-11-6-11-15c0-10 7-15 11-24z';
const TONGUE_L =
  'M24 30C30 50 40 62 40 84C40 100 32 112 24 114C14 110 8 100 8 86C8 66 20 56 24 30Z';
const TONGUE_R =
  'M76 30C70 50 60 62 60 84C60 100 68 112 76 114C86 110 92 100 92 86C92 66 80 56 76 30Z';
const FLAME_CORE = 'M50 80c3 7 8 10 8 17 0 6-4 10-8 10s-8-4-8-10c0-7 5-10 8-17z';

/** The embers a flame throws as it lights: where from its middle, how high, how far aside, how big, and when. */
const EMBERS = [
  { x: -26, rise: 92, drift: -22, size: 5, at: 0 },
  { x: -10, rise: 118, drift: -8, size: 4, at: 0.06 },
  { x: 4, rise: 104, drift: 8, size: 6, at: 0.02 },
  { x: 18, rise: 126, drift: 18, size: 4, at: 0.12 },
  { x: 30, rise: 84, drift: 26, size: 5, at: 0.08 },
  { x: -36, rise: 72, drift: -28, size: 3, at: 0.16 },
  { x: 12, rise: 140, drift: -2, size: 3, at: 0.2 },
];

/** A curved four-point star of radius `r` at (cx, cy): the sparks round the smallest flame. */
function twinkle(cx: number, cy: number, r: number): string {
  const p = (dx: number, dy: number) => `${(cx + dx * r).toFixed(1)} ${(cy + dy * r).toFixed(1)}`;
  return (
    `M${p(0, -1)}C${p(0.1, -0.4)} ${p(0.4, -0.1)} ${p(1, 0)}` +
    `C${p(0.4, 0.1)} ${p(0.1, 0.4)} ${p(0, 1)}` +
    `C${p(-0.1, 0.4)} ${p(-0.4, 0.1)} ${p(-1, 0)}` +
    `C${p(-0.4, -0.1)} ${p(-0.1, -0.4)} ${p(0, -1)}Z`
  );
}

/** Where a tier's flame stands on the stage, its height, and the middle its glow and embers come from. */
function flamePlace(tier: FlameTier) {
  const h = tier.size * 1.2;
  const top = STAGE_H - FLAME_BASE - h * FLAME_FOOT;
  const spark = tier.shape === 'spark';
  return {
    h,
    top,
    left: (STAGE_W - tier.size) / 2,
    middle: top + h * (spark ? 0.66 : 0.56),
    glow: tier.size * (spark ? 0.46 : 0.62),
  };
}

/**
 * The streak's flame in four sizes, one for each stretch of days: a small
 * orange spark, the streak's flame, a red blaze with more tongues, and a blue
 * and white flame from a month on. A pick lights the new one: it springs up
 * out of its base as the old one rises away, embers fly, and the day count
 * gives a bump. Picking the same one again stokes it.
 */
function FlameTiers() {
  const reduced = useReduceMotion();
  const [pick, setPick] = useState(0);
  // Every pick, the same one again too: each lights the flame.
  const [take, setTake] = useState(0);
  const burst = useSharedValue(0);
  const bump = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(igniteFeedback, 30);
    if (!reduced) {
      burst.set(0);
      burst.set(withTiming(1, { duration: 1100, easing: Easing.linear }));
      bump.set(
        withSequence(
          withTiming(1, { duration: 110, easing: EASE_OUT }),
          withSpring(0, { duration: 520, dampingRatio: 0.5 }),
        ),
      );
    }
    return () => clearTimeout(timer);
  }, [pick, take, reduced, burst, bump]);

  const tier = FLAME_TIERS[pick];
  const place = flamePlace(tier);
  // The blue flame's count in the gem's blue; the others in the streak's gold.
  const tone = tier.days >= 30 ? colors.gem : colors.warning;
  const bumpStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.2 * bump.get() }] }));

  return (
    <View style={styles.flameColumn}>
      <View
        style={styles.flameStage}
        accessible
        accessibilityLabel={`${tier.name}, the flame for a streak of ${tier.days} ${
          tier.days === 1 ? 'day' : 'days'
        }`}
      >
        {FLAME_TIERS.map((t, i) => (
          <FlameLayer
            key={t.days}
            tier={t}
            index={i}
            on={i === pick}
            take={take}
            reduced={reduced}
          />
        ))}
        {reduced
          ? null
          : EMBERS.map((e, i) => (
              <Ember key={i} spec={e} burst={burst} y={place.middle} color={tier.ember} />
            ))}
      </View>
      <View style={styles.flameCount}>
        <Animated.Text style={[styles.flameDays, { color: tone }, bumpStyle]}>
          {tier.days}
        </Animated.Text>
        <View style={styles.flameWords}>
          <Text style={[styles.flameName, { color: tone }]}>{tier.name}</Text>
          <Text style={styles.flameUnit}>day streak</Text>
        </View>
      </View>
      <Segmented
        label="Days in the streak"
        cue={null}
        value={pick}
        onChange={(i) => {
          setPick(i);
          setTake((n) => n + 1);
        }}
        options={FLAME_TIERS.map((t) => ({
          num: String(t.days),
          label: t.days === 1 ? 'day' : 'days',
        }))}
      />
    </View>
  );
}

/** One tier's flame with its glow, on the stage: it lights when picked and rises away when not. */
function FlameLayer({
  tier,
  index,
  on,
  take,
  reduced,
}: {
  tier: FlameTier;
  index: number;
  on: boolean;
  take: number;
  reduced: boolean;
}) {
  const v = useSharedValue(0);
  const pop = useSharedValue(1);
  const was = useRef(false);
  useEffect(() => {
    const again = was.current && on;
    was.current = on;
    if (reduced) {
      pop.set(1);
      v.set(withTiming(on ? 1 : 0, { duration: 140 }));
      return;
    }
    if (!on) {
      v.set(withTiming(0, { duration: 260, easing: EASE_OUT }));
      return;
    }
    v.set(withTiming(1, { duration: 160, easing: EASE_OUT }));
    if (again) {
      // Stoked: it ducks, and flares back up.
      pop.set(
        withSequence(
          withTiming(0.7, { duration: 90, easing: EASE_OUT }),
          withSpring(1, FLAME_SPRING),
        ),
      );
    } else {
      pop.set(0);
      pop.set(withSpring(1, FLAME_SPRING));
    }
  }, [on, take, reduced, v, pop]);

  // Going, it rises and swells as it fades, like smoke; from wherever its pop had got to.
  const style = useAnimatedStyle(() => {
    const out = on || reduced ? 0 : 1 - v.get();
    return {
      opacity: v.get(),
      transform: [{ translateY: -18 * out }, { scale: (0.4 + 0.6 * pop.get()) * (1 + 0.12 * out) }],
    };
  });

  const id = `flameTier${index}`;
  const place = flamePlace(tier);
  const spark = tier.shape === 'spark';
  return (
    <Animated.View pointerEvents="none" style={[styles.flameLayer, style]}>
      {/* Wider than the stage, so the glow fades out before any edge. */}
      <Svg width={STAGE_W + GLOW_PAD * 2} height={STAGE_H + GLOW_PAD * 2} style={styles.flameGlow}>
        <Defs>
          <RadialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={tier.glow} stopOpacity={0.45} />
            <Stop offset="1" stopColor={tier.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle
          cx={STAGE_W / 2 + GLOW_PAD}
          cy={place.middle + GLOW_PAD}
          r={place.glow}
          fill={`url(#${id}g)`}
        />
      </Svg>
      <View
        style={[
          styles.flameDrawing,
          { left: place.left, top: place.top, width: tier.size, height: place.h },
        ]}
      >
        <Svg width={tier.size} height={place.h} viewBox="0 0 100 120">
          <Defs>
            <LinearGradient id={`${id}o`} x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={tier.outer[0]} />
              <Stop offset="1" stopColor={tier.outer[1]} />
            </LinearGradient>
            <LinearGradient id={`${id}i`} x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={tier.inner[0]} />
              <Stop offset="1" stopColor={tier.inner[1]} />
            </LinearGradient>
            {tier.tongue ? (
              <LinearGradient id={`${id}t`} x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor={tier.tongue[0]} />
                <Stop offset="1" stopColor={tier.tongue[1]} />
              </LinearGradient>
            ) : null}
          </Defs>
          {tier.tongue ? <Path d={TONGUE_L} fill={`url(#${id}t)`} /> : null}
          {tier.tongue ? <Path d={TONGUE_R} fill={`url(#${id}t)`} /> : null}
          <Path d={spark ? SPARK_OUTER : FLAME_OUTER} fill={`url(#${id}o)`} />
          <Path d={spark ? SPARK_INNER : FLAME_INNER} fill={`url(#${id}i)`} />
          {tier.shape === 'blaze' ? <Path d={FLAME_CORE} fill="#FFFFFF" opacity={0.85} /> : null}
          {spark ? <Path d={twinkle(20, 50, 6)} fill={tier.ember} /> : null}
          {spark ? <Path d={twinkle(78, 36, 4.5)} fill={tier.ember} /> : null}
        </Svg>
      </View>
    </Animated.View>
  );
}

/** An ember thrown up from the flame's middle as it lights, drifting aside and burning out. */
function Ember({
  spec,
  burst,
  y,
  color,
}: {
  spec: (typeof EMBERS)[number];
  burst: SharedValue<number>;
  y: number;
  color: string;
}) {
  const { x, rise, drift, size, at } = spec;
  const style = useAnimatedStyle(() => {
    const k = unit((burst.get() - at) / 0.72);
    const up = 1 - (1 - k) * (1 - k);
    return {
      opacity: k > 0 && k < 1 ? 1 - k : 0,
      transform: [{ translateX: drift * k }, { translateY: -rise * up }, { scale: 1 - 0.6 * k }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ember,
        {
          left: STAGE_W / 2 + x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Top bar on the tab columns
// ---------------------------------------------------------------------------

/** The banner's side margin: in the map's layout the top bar's first and last items sit on it. */
const EDGE = space.lg;
/** The top bar items' widths until they are measured: the logo, the flame and 4, the gem and 120, the heart and 5. */
const HUD_GUESS = [30, 38, 59, 38];
const HUD_MOVE_MS = 520;
const HUD_STAGGER = 45;
const COLS_PHONE_H = 344;

/** Each item's left edge, the map's way: the first and last on the banner's edges, the others evenly between. */
function edgePlaces(widths: number[], w: number): number[] {
  const gap = (w - EDGE * 2 - widths.reduce((s, x) => s + x, 0)) / (widths.length - 1);
  const out: number[] = [];
  let at = EDGE;
  for (const x of widths) {
    out.push(at);
    at += x + gap;
  }
  return out;
}

/** Each item's left edge, this idea's way: centred over its tab. */
function columnPlaces(widths: number[], w: number): number[] {
  return widths.map((x, i) => ((i + 0.5) * w) / widths.length - x / 2);
}

/**
 * A phone with the map's top bar, banner and tab bar. The switch moves the
 * top bar's four items between the banner's edges, as the app has them, and
 * the tab bar's four columns, each item over its tab, one after the other
 * with a small swell; the guides show what they line up with.
 */
function TabColumns() {
  const reduced = useReduceMotion();
  const [mode, setMode] = useState(1);
  const [box, setBox] = useState({ w: 276, h: COLS_PHONE_H - 12 });
  const [widths, setWidths] = useState(HUD_GUESS);
  const switched = useRef(false);
  const guide = useSharedValue(1);

  useEffect(() => {
    guide.set(reduced ? mode : withTiming(mode, { duration: 360, easing: EASE_OUT }));
    if (reduced || !switched.current) return;
    // A soft click as each item lands in its place.
    const timers = HUD.map((_, i) =>
      setTimeout(detentFeedback, HUD_MOVE_MS - 60 + i * HUD_STAGGER),
    );
    return () => timers.forEach(clearTimeout);
  }, [mode, reduced, guide]);

  const choose = (i: number) => {
    if (i === mode) return;
    switched.current = true;
    setMode(i);
  };
  const measure = (i: number, width: number) =>
    setWidths((ws) =>
      Math.abs(ws[i] - width) < 0.5 ? ws : ws.map((w, j) => (j === i ? width : w)),
    );
  const edges = edgePlaces(widths, box.w);
  const cols = columnPlaces(widths, box.w);

  return (
    <View style={styles.colsColumn}>
      <MiniScreen height={COLS_PHONE_H}>
        <View
          style={styles.screen}
          accessible
          accessibilityLabel={
            mode
              ? "A phone: the top bar's four items stand over the four tabs."
              : "A phone: the top bar's first and last items sit on the banner's edges."
          }
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setBox((b) => (b.w === width && b.h === height ? b : { w: width, h: height }));
          }}
        >
          <View style={styles.hudBand}>
            {HUD.map((kind, i) => (
              <HudSlot
                key={kind}
                kind={kind}
                index={i}
                from={edges[i]}
                to={cols[i]}
                mode={mode}
                reduced={reduced}
                onWidth={measure}
              />
            ))}
          </View>
          <MiniBanner />
          <View style={styles.colsMap}>
            <MiniLevel />
          </View>
          <MiniTabBar />
          <Guides w={box.w} h={box.h} guide={guide} />
        </View>
      </MiniScreen>
      <Segmented
        label="Line the top bar up with"
        value={mode}
        onChange={choose}
        options={[{ label: 'Banner edges' }, { label: 'Tab columns' }]}
      />
    </View>
  );
}

/**
 * One item of the top bar, placed by its left edge: where the map has it
 * (`from`) or over its tab (`to`), travelling between the two with a swell.
 */
function HudSlot({
  kind,
  index,
  from,
  to,
  mode,
  reduced,
  onWidth,
}: {
  kind: HudKind;
  index: number;
  from: number;
  to: number;
  mode: number;
  reduced: boolean;
  onWidth: (index: number, width: number) => void;
}) {
  const p = useSharedValue(mode);
  useEffect(() => {
    if (reduced) {
      p.set(mode);
      return;
    }
    p.set(
      withDelay(
        index * HUD_STAGGER,
        withTiming(mode, { duration: HUD_MOVE_MS, easing: EASE_IN_OUT }),
      ),
    );
  }, [mode, reduced, index, p]);
  const style = useAnimatedStyle(() => {
    const k = p.get();
    return {
      transform: [
        { translateX: from + (to - from) * k },
        { scale: 1 + 0.1 * Math.sin(Math.PI * k) },
      ],
    };
  });
  return (
    <Animated.View
      style={[styles.hudSlot, style]}
      onLayout={(e) => onWidth(index, e.nativeEvent.layout.width)}
    >
      <HudMark kind={kind} />
    </Animated.View>
  );
}

/**
 * The guides over the phone: the tab columns, each with its centre line, and
 * the banner's two edges. `guide` 1 shows the columns, 0 the edges.
 */
function Guides({ w, h, guide }: { w: number; h: number; guide: SharedValue<number> }) {
  const accent = colors.accent;
  const col = w / TABS.length;
  const columns = useAnimatedStyle(() => ({ opacity: guide.get() }));
  const edges = useAnimatedStyle(() => ({ opacity: 1 - guide.get() }));
  return (
    <>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, columns]}>
        <Svg width={w} height={h}>
          {TABS.map((t, i) => (
            <React.Fragment key={t.id}>
              <Rect x={i * col + 3} y={0} width={col - 6} height={h} fill={accent} opacity={0.07} />
              <Line
                x1={(i + 0.5) * col}
                x2={(i + 0.5) * col}
                y1={4}
                y2={h - 4}
                stroke={accent}
                strokeOpacity={0.45}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            </React.Fragment>
          ))}
        </Svg>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, edges]}>
        <Svg width={w} height={h}>
          {[EDGE, w - EDGE].map((x) => (
            <Line
              key={x}
              x1={x}
              x2={x}
              y1={4}
              y2={h - 4}
              stroke={accent}
              strokeOpacity={0.6}
              strokeWidth={1}
              strokeDasharray="3 5"
            />
          ))}
        </Svg>
      </Animated.View>
    </>
  );
}

// ---------------------------------------------------------------------------
// A ticker under the top bar
// ---------------------------------------------------------------------------

type Tick = { label: string; value: string; unit?: string; gain?: string };

const TICKS: Tick[] = [
  { label: 'XP', value: '1,240', gain: '40' },
  { label: 'Accuracy', value: '88\u00a0%', gain: '3' },
  { label: 'Streak', value: '4', unit: 'days' },
  { label: 'Gems', value: '120', gain: '6' },
  { label: 'Today', value: '1/2' },
];
const TICK_SAYS =
  'Ticker: XP 1,240, up 40. Accuracy 88 %, up 3. Streak 4 days. Gems 120, up 6. Today 1 of 2.';
/** How fast the tape runs, in points a second. */
const TICK_SPEED = 36;
const TAPE_H = 36;
const TAPE_FADE = 28;
/** Room for both copies of the run side by side, so neither wraps. */
const TAPE_ROLL_W = 2400;

/**
 * A ticker strip under the top bar: the learner's numbers run past from right
 * to left like a stock ticker, what went up in the up colour with its gain,
 * the tape fading out at both ends. Two copies of the run follow each other,
 * so it loops without a seam. Under reduced motion it stands still.
 */
function Ticker() {
  const reduced = useReduceMotion();
  // The width of one run, measured: the tape moves by one run and starts over.
  const [run, setRun] = useState(0);
  const x = useSharedValue(0);
  useEffect(() => {
    x.set(0);
    if (reduced || run <= 0) return;
    x.set(
      withRepeat(
        withTiming(-run, { duration: (run / TICK_SPEED) * 1000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(x);
  }, [run, reduced, x]);
  const roll = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const ground = colors.surface;
  return (
    <MiniScreen height={340}>
      <View style={styles.hudFlat} accessible accessibilityLabel={HUD_SAYS}>
        {HUD.map((kind) => (
          <HudMark key={kind} kind={kind} />
        ))}
      </View>
      <View style={styles.tape} accessible accessibilityLabel={TICK_SAYS}>
        <Animated.View style={[styles.tapeRoll, roll]}>
          <View style={styles.tickRun} onLayout={(e) => setRun(e.nativeEvent.layout.width)}>
            {TICKS.map((t) => (
              <TickItem key={t.label} tick={t} />
            ))}
          </View>
          <View style={styles.tickRun}>
            {TICKS.map((t) => (
              <TickItem key={t.label} tick={t} />
            ))}
          </View>
        </Animated.View>
        <TapeFade side="left" color={ground} />
        <TapeFade side="right" color={ground} />
      </View>
      <View style={styles.tickerBody}>
        <MiniBanner />
        <View style={styles.tickerMap}>
          <MiniLevel />
        </View>
      </View>
    </MiniScreen>
  );
}

/** One number on the tape: its name, the number, and what it gained, with a dot after it. */
function TickItem({ tick }: { tick: Tick }) {
  const rising = tick.gain ? { color: colors.up } : null;
  return (
    <View style={styles.tick}>
      <Text style={styles.tickLabel}>{tick.label}</Text>
      <Text style={[styles.tickValue, rising]}>{tick.value}</Text>
      {tick.unit ? <Text style={styles.tickLabel}>{tick.unit}</Text> : null}
      {tick.gain ? <Text style={[styles.tickGain, rising]}>{`▲${tick.gain}`}</Text> : null}
      <View style={styles.tickDot} />
    </View>
  );
}

/** The tape fading into its ground at one end. */
function TapeFade({ side, color }: { side: 'left' | 'right'; color: string }) {
  const id = `tapeFade${side}`;
  const left = side === 'left';
  return (
    <Svg
      width={TAPE_FADE}
      height={TAPE_H}
      pointerEvents="none"
      style={[styles.tapeFade, left ? { left: 0 } : { right: 0 }]}
    >
      <Defs>
        <LinearGradient id={id} x1={left ? '0' : '1'} y1="0" x2={left ? '1' : '0'} y2="0">
          <Stop offset="0" stopColor={color} stopOpacity={1} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={TAPE_FADE} height={TAPE_H} fill={`url(#${id})`} />
    </Svg>
  );
}

const styles = themed(() => ({
  // The bars as the map draws them (LearnScreen, TabBar).
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hudValue: { fontSize: 17, lineHeight: 22, fontWeight: '800', fontFamily: MONO_FONT },
  banner: {
    marginHorizontal: space.lg,
    backgroundColor: colors.accentFill,
    borderRadius: 14,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    gap: 2,
  },
  bannerKicker: {
    ...type.label,
    color: colors.accentText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bannerTitle: { ...type.title, color: colors.accentText },
  miniLevel: { width: RING, height: RING, alignSelf: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: space.sm,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 6, gap: 2, minHeight: 52 },
  // A short bar over the open tab, flush with the top edge.
  tabMark: { width: 28, height: 3, borderRadius: 2, marginTop: -6, marginBottom: 5 },
  // "Leaderboard" is wider than its column on the narrowest phone: it may reach into its neighbours'.
  tabLabel: { ...type.small, marginHorizontal: -10 },

  // The switch under a preview.
  seg: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    padding: SEG_PAD,
    borderRadius: radius.md + SEG_PAD,
    backgroundColor: colors.surfaceAlt,
  },
  segThumb: {
    position: 'absolute',
    left: SEG_PAD,
    top: SEG_PAD,
    bottom: SEG_PAD,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  segKeyWrap: { flex: 1 },
  segKey: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  segText: { ...type.label, color: colors.textMuted },
  segTextOn: { color: colors.text, fontWeight: '700' },
  segNum: { fontFamily: MONO_FONT, fontWeight: '700' },

  // Tabs with a sliding pill
  pillHero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xs },
  pillHeroMark: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint,
  },
  pillHeroTitle: { ...type.title, color: colors.text },
  pillHeroLine: { ...type.small, color: colors.textMuted },
  pillBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: space.sm,
  },
  pill: {
    position: 'absolute',
    top: space.sm,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    backgroundColor: colors.accentTint,
  },
  pillTab: { flex: 1, alignItems: 'center', paddingTop: space.sm, gap: space.xs, minHeight: 64 },
  pillIcon: { width: PILL_W, height: PILL_H },
  pillIconLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: { ...type.small, marginHorizontal: -10 },

  // The flame grows with the streak
  flameColumn: { alignSelf: 'stretch', alignItems: 'center', gap: space.md },
  flameStage: { width: STAGE_W, height: STAGE_H },
  flameLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: STAGE_W,
    height: STAGE_H,
    transformOrigin: 'bottom',
  },
  flameGlow: { position: 'absolute', left: -GLOW_PAD, top: -GLOW_PAD },
  flameDrawing: { position: 'absolute' },
  ember: { position: 'absolute' },
  flameCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.sm,
  },
  // Both sides at least a set width, so nothing shifts as the count and the name change.
  flameDays: {
    minWidth: 64,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    fontFamily: MONO_FONT,
    textAlign: 'right',
  },
  flameWords: { minWidth: 124 },
  flameName: { ...type.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  flameUnit: { ...type.small, color: colors.textMuted },

  // Top bar on the tab columns
  colsColumn: { alignSelf: 'stretch', gap: space.md },
  screen: { flex: 1 },
  hudBand: { height: 56 },
  hudSlot: { position: 'absolute', left: 0, top: 0, height: 56, justifyContent: 'center' },
  colsMap: { flex: 1, justifyContent: 'flex-end', paddingBottom: space.sm },

  // A ticker under the top bar
  hudFlat: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  tape: {
    height: TAPE_H,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tapeRoll: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: TAPE_ROLL_W,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickRun: { flexDirection: 'row', alignItems: 'center' },
  tick: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: space.lg },
  tickLabel: {
    ...type.small,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tickValue: { ...type.label, fontFamily: MONO_FONT, fontWeight: '700', color: colors.text },
  tickGain: { ...type.small, fontFamily: MONO_FONT, fontWeight: '700' },
  tickDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: space.md,
    backgroundColor: colors.textFaint,
  },
  tapeFade: { position: 'absolute', top: 0 },
  tickerBody: { flex: 1, paddingTop: space.md },
  tickerMap: { flex: 1, justifyContent: 'flex-end', paddingBottom: space.lg },
}));
