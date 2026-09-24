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
import Svg, { Circle } from 'react-native-svg';

import { EASE_OUT, EASE_SINE, SPRING_POP, usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, type } from '../theme';
import Icon from './icons';
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
const shownFill = new Map<number, number>();
const shownStatus = new Map<number, LevelStatus>();

/** After a reset the path is drawn fresh, not drained ring by ring. */
export function forgetShownPath(): void {
  shownFill.clear();
  shownStatus.clear();
}

/** The ring fills a beat after the path appears, so the eye is there for it. */
const FILL_DELAY = 420;
const FILL_MS = 900;

export default function LevelNode({
  view,
  onPress,
}: {
  view: LevelView;
  onPress: () => void;
}) {
  const reduced = useReduceMotion();
  const n = view.level.number;
  const target = view.done / view.total;
  const before = shownFill.get(n);
  const beforeStatus = shownStatus.get(n);

  const fill = useSharedValue(reduced || before === undefined ? target : before);
  const pop = useSharedValue(
    !reduced && beforeStatus !== undefined && beforeStatus !== view.status ? 0.82 : 1
  );
  useEffect(() => {
    shownFill.set(n, target);
    shownStatus.set(n, view.status);
    if (fill.get() !== target) {
      fill.set(withDelay(FILL_DELAY, withTiming(target, { duration: FILL_MS, easing: EASE_OUT })));
    }
    // A level that has just finished or just opened settles into its new face
    // once the ring before it has filled.
    if (pop.get() !== 1) pop.set(withDelay(FILL_DELAY + FILL_MS * 0.6, withSpring(1, SPRING_POP)));
  }, [n, target, view.status, fill, pop]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - fill.get()) }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  const press = usePressFeedback(true, { cue: 'tick' });

  const current = view.status === 'current';
  const locked = view.status === 'locked';
  const complete = view.status === 'complete';
  const face = locked ? colors.surfaceAlt : complete ? colors.success : colors.accent;
  const ringColor = view.perfect ? GOLD : complete ? colors.success : colors.accent;

  return (
    <View style={styles.box}>
      {current ? <Halo /> : null}
      <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
        <Circle cx={RING / 2} cy={RING / 2} r={R} stroke={colors.surfaceAlt} strokeWidth={STROKE} fill="none" />
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
          accessibilityLabel={`Level ${n}: ${view.level.title}. ${
            locked ? 'Locked' : `${view.done} of ${view.total} lessons done`
          }`}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          onPress={onPress}
          hitSlop={8}
          style={[
            styles.node,
            { backgroundColor: face },
            locked && styles.nodeLocked,
          ]}
        >
          {locked ? (
            <Icon name="lock" size={26} color={colors.textFaint} />
          ) : complete ? (
            <Icon name="check" size={34} color="#FFFFFF" strokeWidth={3.2} />
          ) : (
            <Text style={styles.number}>{n}</Text>
          )}
        </Pressable>
      </Animated.View>
      {current ? <Bubble label={view.done === 0 ? 'START' : 'CONTINUE'} /> : null}
    </View>
  );
}

/**
 * The level waiting for the learner breathes: a ring of its own colour going
 * out from it and fading, every couple of seconds (docs/UI.md §7.1, "pulsing
 * halo"). Only the current level has it, so the eye finds it first.
 */
function Halo() {
  const reduced = useReduceMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.set(withRepeat(withTiming(1, { duration: 1900, easing: EASE_OUT }), -1, false));
  }, [reduced, t]);
  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : 0.5 * (1 - t.get()),
    transform: [{ scale: 1 + 0.34 * t.get() }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.halo, style]} />;
}

/** "START" over the current level, bobbing gently like a tag on a string. */
function Bubble({ label }: { label: string }) {
  const reduced = useReduceMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    y.set(
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 850, easing: EASE_SINE }),
          withTiming(0, { duration: 850, easing: EASE_SINE })
        ),
        -1,
        false
      )
    );
  }, [reduced, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
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
  number: { fontSize: 28, lineHeight: 32, fontWeight: '800', color: '#FFFFFF' },
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
