import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  doneFeedback,
  landFeedback,
  pulseAt,
  rattleFeedback,
  unlockFeedback,
} from '../lesson/feedback';
import { EASE_IN_OUT, EASE_OUT, EASE_SINE, SPRING_POP, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, type, themed } from '../theme';
import { LevelType, levelIconOf, levelTypeOf } from '../content';
import { tint } from '../lesson/look';
import Icon, { IconName, isIconName } from './icons';
import type { LevelStatus, LevelView } from './pathState';
import { RING, TAG_TOP } from './mapSizes';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * The ring's box, the button inside it, and the ring's weight: 66 pt in an
 * 86 pt ring. David made them smaller in stage LOOK-BRIEF (58 in 76, from 72
 * in 96) and on 2026-09-30 "a little bigger" again.
 */
export { RING };
const NODE = 66;
const STROKE = 6;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/**
 * What each node last showed, kept across visits to the home screen. Coming
 * back from a lesson, a node starts from here and moves to where it is now:
 * the ring fills by the lesson just finished, and a level that just opened
 * pops its lock. The first time the path is drawn nothing moves -- there is no
 * "before" to move from.
 */
const shownFill = new Map<string, number>();
const shownStatus = new Map<string, LevelStatus>();

/** After a reset the path is drawn fresh, not drained ring by ring. */
export function forgetShownPath(): void {
  shownFill.clear();
  shownStatus.clear();
}

/**
 * Testing (Settings → Testing → Animations): the path remembers `done` as it
 * was one lesson before it was finished and `next` as still locked, so the
 * next time it is drawn it moves on (UNLOCK) as it does after a level's last
 * lesson. Progress itself is untouched.
 */
export function rewindUnlock(done: LevelView, next: LevelView): void {
  shownFill.set(done.level.key, Math.max(0, done.total - 1) / Math.max(1, done.total));
  shownStatus.set(done.level.key, 'current');
  shownFill.set(next.level.key, 0);
  shownStatus.set(next.level.key, 'locked');
}

/** The ring fills a beat after the path appears, so the eye is there for it. */
/** The symbol each kind of level wears on its button (docs/UI.md §7.1). */
const SYMBOL: Record<LevelType, IconName> = {
  new: 'bulb',
  practice: 'repeat',
  test: 'quiz',
  final: 'trophy',
  path: 'signpost',
};

export const FILL_DELAY = 420;
export const FILL_MS = 900;

/**
 * Moving on to the next level, as one sequence after the last lesson of a
 * level (LearnScreen plays the parts that are not the node's). David asked on
 * 2026-09-30 for it smoother, with haptics and sounds:
 *
 *   420   the finished level's ring fills the rest of the way, and it turns
 *         green, its symbol kept; its check lands with a pop
 *   1250  the path glides down to the next level, eased in and out...
 *   1300  ...while a spark runs down the dotted path between them, lighting
 *         each dot as it passes, to five notes climbing, each a light tap
 *   2050  the lock rattles on three swings, a click on each...
 *   2380  ...and bursts off: the button gathers itself and springs back, the
 *         lock flies off, the symbol pops in, rings and sparks go out from it,
 *         the unlock chime, and the banner names the new level
 *   2700  START drops in over it with a soft pop, and the halo starts
 */
export const UNLOCK = {
  scroll: 1250,
  scrollMs: 850,
  draw: 1300,
  drawMs: 700,
  shake: 2050,
  open: 2380,
  tag: 2700,
} as const;

/** What a level showed the last time the path was drawn, if it has been. */
export function shownStatusOf(key: string): LevelStatus | undefined {
  return shownStatus.get(key);
}

export default function LevelNode({
  view,
  onPress,
  unlocking = false,
}: {
  view: LevelView;
  onPress: () => void;
  /** This level opened with the lesson just finished: play its unlock (UNLOCK). */
  unlocking?: boolean;
}) {
  const reduced = useReduceMotion();
  const n = view.level.key;
  const kind = view.level.kind;
  const target = view.done / view.total;
  const before = shownFill.get(n);
  const beforeStatus = shownStatus.get(n);

  // Where the ring starts, kept from the first render: the static prop below
  // must not read the shared value while React renders (Reanimated warns on
  // every re-render), and must not change under the animation either.
  const [startFill] = useState(reduced || before === undefined ? target : before);
  const fill = useSharedValue(startFill);
  // docs/UI.md §7.1: only a level still open shows its ring. A finished level
  // keeps its check and drops the ring -- once the ring has filled, when the
  // lesson just played finished it.
  const finishing =
    view.status === 'complete' && !reduced && before !== undefined && before < target;
  const ringOn = useSharedValue(view.status === 'complete' && !finishing ? 0 : 1);
  const pop = useSharedValue(
    !reduced && !unlocking && beforeStatus !== undefined && beforeStatus !== view.status ? 0.82 : 1,
  );
  // The unlock: the lock's cover over the open face, the lock's wobble and its
  // flight off, the button's squash and spring, the symbol's pop, and the
  // rings and sparks that go out as it opens.
  const cover = useSharedValue(unlocking ? 1 : 0);
  const wobble = useSharedValue(0);
  const fly = useSharedValue(0);
  const bounce = useSharedValue(1);
  const digit = useSharedValue(unlocking && !reduced ? 0.4 : 1);
  const burst = useSharedValue(0);
  // A check pinned to a finished level; it arrives with the level's pop.
  const badge = useSharedValue(
    view.status === 'complete'
      ? !reduced && beforeStatus !== undefined && beforeStatus !== 'complete'
        ? 0
        : 1
      : 0,
  );
  useEffect(() => {
    shownFill.set(n, target);
    shownStatus.set(n, view.status);
    if (fill.get() !== target) {
      fill.set(withDelay(FILL_DELAY, withTiming(target, { duration: FILL_MS, easing: EASE_OUT })));
    }
    // A level that has just finished settles into its new face once its
    // ring has filled, and takes its check.
    if (pop.get() !== 1) pop.set(withDelay(FILL_DELAY + FILL_MS * 0.6, withSpring(1, SPRING_POP)));
    let landed: ReturnType<typeof setTimeout> | undefined;
    if (view.status === 'complete' && badge.get() !== 1) {
      badge.set(withDelay(FILL_DELAY + FILL_MS * 0.7, withSpring(1, SPRING_POP)));
      landed = setTimeout(doneFeedback, FILL_DELAY + FILL_MS * 0.7);
    }
    if (view.status === 'complete' && ringOn.get() !== 0) {
      ringOn.set(
        withDelay(FILL_DELAY + FILL_MS, withTiming(0, { duration: 320, easing: EASE_OUT })),
      );
    }
    return () => clearTimeout(landed);
  }, [n, target, view.status, fill, pop, badge, ringOn]);

  useEffect(() => {
    if (!unlocking) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    if (reduced) {
      cover.set(withDelay(400, withTiming(0, { duration: 200 })));
      at(400, unlockFeedback);
    } else {
      // Three swings, each ending on a click of the rattle: the clicks land
      // where the cue's pulses are, so the hand feels each swing stop.
      const first = 45;
      const second = pulseAt('rattle', 1);
      const third = pulseAt('rattle', 2);
      wobble.set(
        withDelay(
          UNLOCK.shake,
          withSequence(
            withTiming(-1, { duration: first, easing: EASE_OUT }),
            withTiming(1, { duration: second, easing: EASE_IN_OUT }),
            withTiming(-0.7, { duration: third - second, easing: EASE_IN_OUT }),
            withTiming(0.35, { duration: 65 }),
            withTiming(0, { duration: UNLOCK.open - UNLOCK.shake - first - third - 65 }),
          ),
        ),
      );
      at(UNLOCK.shake + first, rattleFeedback);
      // The button gathers itself as the lock gives, and springs back open.
      bounce.set(
        withDelay(
          UNLOCK.open - 110,
          withSequence(
            withTiming(0.9, { duration: 110, easing: EASE_OUT }),
            withSpring(1, SPRING_POP),
          ),
        ),
      );
      cover.set(withDelay(UNLOCK.open, withTiming(0, { duration: 260, easing: EASE_OUT })));
      fly.set(withDelay(UNLOCK.open, withTiming(1, { duration: 480, easing: EASE_OUT })));
      digit.set(withDelay(UNLOCK.open, withSpring(1, SPRING_POP)));
      burst.set(withDelay(UNLOCK.open, withTiming(1, { duration: 950, easing: EASE_OUT })));
      at(UNLOCK.open, unlockFeedback);
    }
    return () => timers.forEach(clearTimeout);
  }, [unlocking, reduced, cover, wobble, fly, bounce, digit, burst]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - fill.get()) }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOn.get() }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() * bounce.get() }] }));
  const coverStyle = useAnimatedStyle(() => ({
    opacity: cover.get(),
    transform: [{ scale: 1 + 0.25 * (1 - cover.get()) }],
  }));
  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${16 * wobble.get()}deg` }],
  }));
  // The lock, sprung: up and away to the side, turning, and gone.
  const flyStyle = useAnimatedStyle(() => {
    const f = fly.get();
    return {
      opacity: f < 0.25 ? 1 : Math.max(0, 1 - (f - 0.25) / 0.75),
      transform: [
        { translateX: 16 * f },
        { translateY: -34 * f },
        { rotate: `${40 * f}deg` },
        { scale: 1 + 0.3 * f },
      ],
    };
  });
  const digitStyle = useAnimatedStyle(() => ({ transform: [{ scale: digit.get() }] }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge.get() > 0.01 ? 1 : 0,
    transform: [{ scale: badge.get() }],
  }));
  const ring1 = useAnimatedStyle(() => ({
    opacity: burst.get() > 0 && burst.get() < 1 ? 0.7 * (1 - burst.get()) : 0,
    transform: [{ scale: 1 + 0.9 * burst.get() }],
  }));
  const ring2 = useAnimatedStyle(() => {
    const t = Math.max(0, (burst.get() - 0.18) / 0.82);
    return {
      opacity: t > 0 && t < 1 ? 0.5 * (1 - t) : 0,
      transform: [{ scale: 1 + 1.4 * t }],
    };
  });
  // A flash of the level's colour behind it as it opens.
  const flash = useAnimatedStyle(() => {
    const t = burst.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : t < 0.12 ? (0.32 * t) / 0.12 : 0.32 * (1 - (t - 0.12) / 0.88),
      transform: [{ scale: 1 + 0.9 * t }],
    };
  });

  const press = usePressFeedback(true, { cue: 'tick' });

  const current = view.status === 'current';
  const locked = view.status === 'locked';
  const complete = view.status === 'complete';
  const face = locked ? colors.surfaceAlt : complete ? colors.success : colors.accent;
  const ringColor = view.perfect ? colors.warning : complete ? colors.success : colors.accent;
  // docs/UI.md §7.1: Checkpoints are shields and the Final Exam a trophy, so a
  // scored level reads as one from across the map; the path choice is a
  // signpost. Ordinary levels are round.
  const round = kind !== 'test';
  // docs/UI.md §7.1: a lesson level's button shows what it teaches or
  // practises -- a candle, a bell for the open -- from its files' `icon`; a
  // Checkpoint shows a ticked clipboard, the Final Exam a trophy, the path
  // choice a signpost. Locked or not. The number and kind are in the label.
  const type = levelTypeOf(view.level);
  const topic = type === 'new' || type === 'practice' ? levelIconOf(view.level) : undefined;
  const name = topic && isIconName(topic) ? topic : SYMBOL[type];
  // docs/UI.md §7.1 [DESIGN-REVIEW] two-tone symbols: under the line, the same
  // strokes wider and soft, so the symbol has a body as well as an outline.
  const size = type === 'test' ? 27 : 30;
  const symbol = (color: string, tone: string = color) => (
    <View style={{ width: size, height: size }}>
      <View style={styles.tone}>
        <Icon name={name} size={size} color={tone} strokeWidth={6.5} filled />
      </View>
      <Icon name={name} size={size} color={color} strokeWidth={2.4} />
    </View>
  );

  const tagDelay = unlocking ? (reduced ? 400 : UNLOCK.tag) : 0;
  return (
    <View style={styles.box}>
      {current ? <Halo delay={tagDelay} /> : null}
      {unlocking ? (
        <>
          <Animated.View pointerEvents="none" style={[styles.flash, flash]} />
          <Animated.View pointerEvents="none" style={[styles.burst, ring1]} />
          <Animated.View pointerEvents="none" style={[styles.burst, ring2]} />
          {SPARKS.map((spark, i) => (
            <Spark key={i} spark={spark} burst={burst} />
          ))}
        </>
      ) : null}
      {complete && !finishing ? null : (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, ringStyle]}>
          <Svg width={RING} height={RING}>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={colors.surfaceAlt}
              strokeWidth={STROKE}
              fill="none"
            />
            {locked ? null : (
              <AnimatedCircle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                stroke={ringColor}
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${CIRC} ${CIRC}`}
                strokeDashoffset={CIRC * (1 - startFill)}
                rotation={-90}
                origin={`${RING / 2}, ${RING / 2}`}
                animatedProps={ringProps}
              />
            )}
          </Svg>
        </Animated.View>
      )}
      <Animated.View style={[styles.nodeWrap, press.style, popStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={nodeLabel(view)}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          onPress={onPress}
          hitSlop={8}
          style={[
            styles.node,
            round && { backgroundColor: face },
            round && locked && styles.nodeLocked,
          ]}
        >
          {round ? null : <ShieldFace color={face} locked={locked} />}
          {/* The level keeps its symbol for good: greyed while locked, white
              once open, and a finished one wears a check beside it rather than
              in place of it. Above the shield, which is drawn absolutely and
              would otherwise cover it. */}
          {locked ? (
            // A locked level keeps its symbol's own colour at low strength, so
            // the map ahead has character; the lock badge says it is shut.
            <View style={[styles.glyph, !round && styles.glyphShield, styles.glyphLocked]}>
              {symbol(colors.accent, tint(colors.accent, 0.5))}
            </View>
          ) : (
            <Animated.View style={[styles.glyph, !round && styles.glyphShield, digitStyle]}>
              {symbol('#FFFFFF', 'rgba(255,255,255,0.3)')}
            </Animated.View>
          )}
          {unlocking ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.cover, !round && styles.coverShield, coverStyle]}
            >
              {round ? null : <ShieldFace color={colors.surfaceAlt} locked />}
              <View style={[styles.glyph, !round && styles.glyphShield, styles.glyphLocked]}>
                {symbol(colors.accent, tint(colors.accent, 0.5))}
              </View>
            </Animated.View>
          ) : null}
        </Pressable>
        {complete ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.badge,
              { backgroundColor: view.perfect ? colors.warning : colors.success },
              badgeStyle,
            ]}
          >
            <Icon name="check" size={14} color="#FFFFFF" strokeWidth={3.4} />
          </Animated.View>
        ) : null}
        {/* A locked level wears its lock where a finished one wears its check,
            so the symbol stays readable; opening it shakes the lock loose. */}
        {locked || unlocking ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.badge, styles.lockBadge, unlocking && flyStyle]}
          >
            <Animated.View style={lockStyle}>
              <Icon name="lock" size={13} color={colors.textMuted} />
            </Animated.View>
          </Animated.View>
        ) : null}
      </Animated.View>
      {current ? <Bubble label={view.done === 0 ? 'START' : 'CONTINUE'} delay={tagDelay} /> : null}
    </View>
  );
}

/**
 * A level as a screen reader says it: its number and title once, then where it
 * stands -- "Level 4: The Quote Card. 1 of 3 lessons done", "Level 5:
 * Checkpoint. Locked" (review S9: not "Checkpoint 5, Checkpoint: Checkpoint").
 * A scored level whose title does not say what it is gets the word.
 */
export function nodeLabel(view: LevelView): string {
  const { kind, number, title } = view.level;
  const what =
    kind === 'test' && !/checkpoint/i.test(title)
      ? ', Checkpoint'
      : kind === 'final' && !/final/i.test(title)
        ? ', Final Exam'
        : '';
  const name = kind === 'path' ? title : `Level ${number}${what}: ${title}`;
  const state =
    view.status === 'locked'
      ? 'Locked'
      : view.status === 'complete'
        ? view.perfect
          ? 'Perfect'
          : kind === 'lesson' || kind === 'path'
            ? 'Done'
            : 'Passed'
        : kind === 'lesson'
          ? `${view.done} of ${view.total} lessons done`
          : 'Open';
  return `${name}. ${state}`;
}

/** A Checkpoint's face: a shield filling the button, drawn so it keeps its outline at any size. */
function ShieldFace({ color, locked }: { color: string; locked: boolean }) {
  return (
    <Svg width={NODE} height={NODE} viewBox="0 0 72 72" style={StyleSheet.absoluteFill}>
      <Path
        d="M36 3 8 13v20c0 17 11.5 30.5 28 36 16.5-5.5 28-19 28-36V13z"
        fill={color}
        stroke={locked ? colors.borderStrong : 'none'}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

/**
 * The level waiting for the learner breathes: a ring of its own colour going
 * out from it and fading, every couple of seconds (docs/UI.md §7.1, "pulsing
 * halo"). Only the current level has it, so the eye finds it first.
 */
function Halo({ delay = 0 }: { delay?: number }) {
  const reduced = useReduceMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.set(
      withDelay(delay, withRepeat(withTiming(1, { duration: 1900, easing: EASE_OUT }), -1, false)),
    );
  }, [reduced, t, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : 0.5 * (1 - t.get()),
    transform: [{ scale: 1 + 0.34 * t.get() }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.halo, style]} />;
}

/**
 * The sparks that fly out of a level as it opens: evenly round it, each a
 * little off its line and its own distance out, in the level's colour and
 * gold, a small diamond turning as it flies and fades.
 */
type SparkSpec = { angle: number; dist: number; size: number; gold: boolean };
const SPARKS: SparkSpec[] = [0, 9, -6, 12, -10, 5, -3, 8, -12, 4].map((jitter, i) => ({
  angle: ((i * 36 + jitter - 90) * Math.PI) / 180,
  dist: NODE * 0.85 + (i % 3) * 9,
  size: i % 2 ? 6 : 8,
  gold: i % 3 === 1,
}));

function Spark({ spark, burst }: { spark: SparkSpec; burst: SharedValue<number> }) {
  const { angle, dist, size } = spark;
  const style = useAnimatedStyle(() => {
    const t = burst.get();
    return {
      opacity: t <= 0 || t >= 1 ? 0 : t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9,
      transform: [
        { translateX: Math.cos(angle) * dist * t },
        { translateY: Math.sin(angle) * dist * t },
        { rotate: `${45 + 120 * t}deg` },
        { scale: 1 - 0.55 * t },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.spark,
        {
          width: size,
          height: size,
          left: RING / 2 - size / 2,
          top: RING / 2 - size / 2,
          backgroundColor: spark.gold ? colors.warning : colors.accent,
        },
        style,
      ]}
    />
  );
}

/**
 * "START" over the current level, bobbing gently like a tag on a string. One
 * line, always (David, 2026-09-30): it has the width of the row it sits in,
 * not of the level under it, so it never wraps.
 */
function Bubble({ label, delay = 0 }: { label: string; delay?: number }) {
  const reduced = useReduceMotion();
  const y = useSharedValue(0);
  // After an unlock the tag drops in over the new level before it bobs.
  const drop = useSharedValue(delay > 0 ? 0 : 1);
  useEffect(() => {
    let landed: ReturnType<typeof setTimeout> | undefined;
    if (delay > 0) {
      drop.set(
        withDelay(delay, reduced ? withTiming(1, { duration: 200 }) : withSpring(1, SPRING_POP)),
      );
      // It lands with a soft pop; under reduced motion the unlock's own sound says it.
      if (!reduced) landed = setTimeout(landFeedback, delay + 120);
    }
    if (reduced) return () => clearTimeout(landed);
    y.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-5, { duration: 850, easing: EASE_SINE }),
            withTiming(0, { duration: 850, easing: EASE_SINE }),
          ),
          -1,
          false,
        ),
      ),
    );
    return () => clearTimeout(landed);
  }, [reduced, y, drop, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, drop.get() * 1.5),
    transform: [{ translateY: y.get() - (reduced ? 0 : 14 * (1 - drop.get())) }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.bubbleWrap, style]}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.pointer} />
    </Animated.View>
  );
}

const styles = themed(() => ({
  box: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  nodeWrap: { width: NODE, height: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLocked: { borderWidth: 1.5, borderColor: colors.borderStrong },
  // The lock over a level that is about to open: the locked face, on top.
  cover: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: NODE / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  flash: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: colors.accent,
  },
  spark: { position: 'absolute', borderRadius: 1.5 },
  glyph: { zIndex: 1 },
  glyphLocked: { opacity: 0.55 },
  tone: { position: 'absolute', left: 0, top: 0, opacity: 0.9 },
  // A shield is narrower at the foot: its symbol sits a touch high.
  glyphShield: { marginTop: -6 },
  lockBadge: { backgroundColor: colors.surfaceAlt, borderColor: colors.background },
  coverShield: { backgroundColor: 'transparent', borderWidth: 0 },
  halo: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  // As wide as the row round the level, so the tag's word never wraps.
  bubbleWrap: { position: 'absolute', top: -TAG_TOP, left: -90, right: -90, alignItems: 'center' },
  bubble: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  bubbleText: { ...type.label, color: colors.accent, letterSpacing: 1.2 },
  pointer: {
    width: 10,
    height: 10,
    marginTop: -6,
    backgroundColor: colors.surface,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.accent,
    transform: [{ rotate: '45deg' }],
  },
}));
