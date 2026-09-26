import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
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

import { unlockFeedback } from '../lesson/feedback';
import { EASE_OUT, EASE_SINE, SPRING_POP, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, type } from '../theme';
import { LEVEL_TYPE_NAME, LevelType, levelIconOf, levelTypeOf } from '../content';
import Icon, { IconName, isIconName } from './icons';
import type { LevelStatus, LevelView } from './pathState';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** The ring's box, the button inside it, and the ring's weight. */
export const RING = 96;
const NODE = 72;
const STROKE = 7;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

const GOLD = colors.warning;

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
 * level (LearnScreen plays the parts that are not the node's):
 *
 *   420   the finished level's ring fills the rest of the way, and it turns
 *         green, its symbol kept, a check pinned to it
 *   1250  the path scrolls down to the next level
 *   1300  the dotted path between them lights up, top to bottom
 *   1900  the lock shakes loose...
 *   2220  ...and bursts off: the level's symbol pops in, rings go out from it,
 *         the unlock chime, and the banner names the new level
 *   2500  START drops in over it and the halo starts to breathe
 */
export const UNLOCK = {
  scroll: 1250,
  draw: 1300,
  drawMs: 600,
  shake: 1900,
  open: 2220,
  tag: 2500,
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

  const fill = useSharedValue(reduced || before === undefined ? target : before);
  const pop = useSharedValue(
    !reduced && !unlocking && beforeStatus !== undefined && beforeStatus !== view.status ? 0.82 : 1,
  );
  // The unlock: the lock's cover over the open face, the lock's wobble, the
  // symbol's pop and the rings that go out as it opens.
  const cover = useSharedValue(unlocking ? 1 : 0);
  const wobble = useSharedValue(0);
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
    if (view.status === 'complete' && badge.get() !== 1) {
      badge.set(withDelay(FILL_DELAY + FILL_MS * 0.7, withSpring(1, SPRING_POP)));
    }
  }, [n, target, view.status, fill, pop, badge]);

  useEffect(() => {
    if (!unlocking) return;
    const at = reduced ? 400 : UNLOCK.open;
    if (reduced) {
      cover.set(withDelay(at, withTiming(0, { duration: 200 })));
    } else {
      wobble.set(
        withDelay(
          UNLOCK.shake,
          withSequence(
            withTiming(-1, { duration: 60 }),
            withTiming(1, { duration: 80 }),
            withTiming(-0.8, { duration: 80 }),
            withTiming(0.5, { duration: 60 }),
            withTiming(0, { duration: 40 }),
          ),
        ),
      );
      cover.set(withDelay(at, withTiming(0, { duration: 260, easing: EASE_OUT })));
      digit.set(withDelay(at, withSpring(1, SPRING_POP)));
      burst.set(withDelay(at, withTiming(1, { duration: 900, easing: EASE_OUT })));
    }
    const t = setTimeout(unlockFeedback, at);
    return () => clearTimeout(t);
  }, [unlocking, reduced, cover, wobble, digit, burst]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - fill.get()) }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  const coverStyle = useAnimatedStyle(() => ({
    opacity: cover.get(),
    transform: [{ scale: 1 + 0.25 * (1 - cover.get()) }],
  }));
  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${16 * wobble.get()}deg` }],
  }));
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

  const press = usePressFeedback(true, { cue: 'tick' });

  const current = view.status === 'current';
  const locked = view.status === 'locked';
  const complete = view.status === 'complete';
  const face = locked ? colors.surfaceAlt : complete ? colors.success : colors.accent;
  const ringColor = view.perfect ? GOLD : complete ? colors.success : colors.accent;
  // docs/UI.md §7.1: Checkpoints are shields and the Final Exam a trophy, so a
  // scored level reads as one from across the map; the path choice is a
  // signpost. Ordinary levels are round.
  const round = kind !== 'test';
  const what =
    kind === 'test'
      ? 'Checkpoint'
      : kind === 'final'
        ? 'Final Exam'
        : kind === 'path'
          ? 'Path choice'
          : 'Level';
  // docs/UI.md §7.1: a lesson level's button shows what it teaches or
  // practises -- a candle, a bell for the open -- from its files' `icon`; a
  // Checkpoint shows a ticked clipboard, the Final Exam a trophy, the path
  // choice a signpost. Locked or not. The number and kind are in the label.
  const type = levelTypeOf(view.level);
  const topic = type === 'new' || type === 'practice' ? levelIconOf(view.level) : undefined;
  const name = topic && isIconName(topic) ? topic : SYMBOL[type];
  const symbol = (color: string) => (
    <Icon name={name} size={type === 'test' ? 28 : 32} color={color} strokeWidth={2.4} />
  );

  const tagDelay = unlocking ? (reduced ? 400 : UNLOCK.tag) : 0;
  return (
    <View style={styles.box}>
      {current ? <Halo delay={tagDelay} /> : null}
      {unlocking ? (
        <>
          <Animated.View pointerEvents="none" style={[styles.burst, ring1]} />
          <Animated.View pointerEvents="none" style={[styles.burst, ring2]} />
        </>
      ) : null}
      <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
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
            strokeDashoffset={CIRC * (1 - fill.get())}
            rotation={-90}
            origin={`${RING / 2}, ${RING / 2}`}
            animatedProps={ringProps}
          />
        )}
      </Svg>
      <Animated.View style={[styles.nodeWrap, press.style, popStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${what}${view.level.number ? ` ${view.level.number}` : ''}, ${LEVEL_TYPE_NAME[type]}: ${view.level.title}. ${
            locked
              ? 'Locked'
              : complete
                ? 'Done'
                : kind === 'lesson'
                  ? `${view.done} of ${view.total} lessons done`
                  : 'Open'
          }`}
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
            <View style={[styles.glyph, !round && styles.glyphShield]}>
              {symbol(colors.textFaint)}
            </View>
          ) : (
            <Animated.View style={[styles.glyph, !round && styles.glyphShield, digitStyle]}>
              {symbol('#FFFFFF')}
            </Animated.View>
          )}
          {unlocking ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.cover, !round && styles.coverShield, coverStyle]}
            >
              {round ? null : <ShieldFace color={colors.surfaceAlt} locked />}
              <View style={[styles.glyph, !round && styles.glyphShield]}>
                {symbol(colors.textFaint)}
              </View>
            </Animated.View>
          ) : null}
        </Pressable>
        {complete ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.badge,
              { backgroundColor: view.perfect ? GOLD : colors.success },
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
            style={[styles.badge, styles.lockBadge, unlocking && coverStyle]}
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

/** A Checkpoint's face: a shield filling the button, drawn so it keeps its outline at any size. */
function ShieldFace({ color, locked }: { color: string; locked: boolean }) {
  return (
    <Svg width={NODE} height={NODE} viewBox="0 0 72 72" style={StyleSheet.absoluteFill}>
      <Path
        d="M36 3 8 13v20c0 17 11.5 30.5 28 36 16.5-5.5 28-19 28-36V13z"
        fill={color}
        stroke={locked ? '#3A4553' : 'none'}
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

/** "START" over the current level, bobbing gently like a tag on a string. */
function Bubble({ label, delay = 0 }: { label: string; delay?: number }) {
  const reduced = useReduceMotion();
  const y = useSharedValue(0);
  // After an unlock the tag drops in over the new level before it bobs.
  const drop = useSharedValue(delay > 0 ? 0 : 1);
  useEffect(() => {
    if (delay > 0) {
      drop.set(
        withDelay(delay, reduced ? withTiming(1, { duration: 200 }) : withSpring(1, SPRING_POP)),
      );
    }
    if (reduced) return;
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
  }, [reduced, y, drop, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, drop.get() * 1.5),
    transform: [{ translateY: y.get() - (reduced ? 0 : 14 * (1 - drop.get())) }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.bubbleWrap, style]}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{label}</Text>
      </View>
      <View style={styles.pointer} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  nodeWrap: { width: NODE, height: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLocked: { borderWidth: 1.5, borderColor: '#3A4553' },
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
    borderColor: '#3A4553',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
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
  glyph: { zIndex: 1 },
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
  bubbleWrap: { position: 'absolute', top: -44, alignItems: 'center' },
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
});
