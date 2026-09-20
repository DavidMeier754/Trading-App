import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useReduceMotion } from '../lesson/useReduceMotion';
import {
  MASCOT_ART,
  MASCOT_ASPECT,
  MASCOT_SPARKLES,
  MASCOT_VIEWBOX,
} from '../mascots/art';
import { artFor, Character, Pose } from '../mascots/registry';

export type { Character, Pose };

/**
 * docs/UI.md §6.9 — the mascot and the recurring characters.
 *
 * Each character is three SVG layers (tail, body, head) sharing one viewBox and
 * stacked absolutely, so they register exactly and each can move on its own.
 * That is the whole reason the art is vector rather than a flat PNG: a single
 * image can only be slid around, while this can breathe, sway and nod.
 *
 * `src/mascots/registry.ts` overrides any character/pose with real artwork; when
 * it does, the image replaces the whole stack and only the outer bob applies.
 */

type Spec = {
  /** Degrees the tail swings, and how long one sway takes. */
  tail: [number, number];
  /** Pixels the body squashes, and the breathing period. */
  breathe: [number, number];
  /** Head: [dip px, tilt deg, period ms] */
  head: [number, number, number];
  /** Whole-body lift and scale, played once on arrival. */
  pop: [number, number];
  sparkles: boolean;
};

const POSE: Record<Pose, Spec> = {
  // Alive but not busy: a slow breath and a lazy tail.
  idle: { tail: [5, 2600], breathe: [1.5, 2800], head: [0.8, 0, 3200], pop: [0, 1], sparkles: false },
  // Correct: a quick double dip, the way a person actually nods.
  nod: { tail: [11, 620], breathe: [2, 900], head: [5, 0, 560], pop: [3, 1.03], sparkles: false },
  // Wrong: a slow head tilt. Puzzled, not scolding.
  hm: { tail: [3, 3000], breathe: [1, 2600], head: [0, 7, 1500], pop: [0, 1], sparkles: false },
  // Perfect run: a bounce and a fast tail.
  cheer: { tail: [16, 420], breathe: [3, 700], head: [3, 0, 700], pop: [12, 1.06], sparkles: true },
  // Walkthrough: leaning in at whatever is spotlighted.
  point: { tail: [7, 2000], breathe: [1.5, 2400], head: [0, -5, 2400], pop: [2, 1.02], sparkles: false },
  sleep: { tail: [2, 4200], breathe: [2.5, 3800], head: [2, 9, 4200], pop: [0, 1], sparkles: false },
};

/** A 0 -> 1 -> 0 loop, the base for every sway and breath. */
function useLoop(period: number, enabled: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) {
      v.setValue(0);
      return;
    }
    v.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: period / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: period / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [period, enabled, v]);
  return v;
}

export default function Mascot({
  character = 'foxy',
  pose = 'idle',
  size = 44,
  animate = true,
}: {
  character?: Character;
  pose?: Pose;
  /** Height in points; width follows the 200x240 viewBox. */
  size?: number;
  animate?: boolean;
}) {
  const reduced = useReduceMotion();
  const moving = animate && !reduced;
  const spec = POSE[pose] ?? POSE.idle;
  const art = MASCOT_ART[character] ?? MASCOT_ART.foxy;
  const override = artFor(character, pose);

  const width = size * MASCOT_ASPECT;
  const wrap = (body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MASCOT_VIEWBOX}">${body}</svg>`;

  const tail = useLoop(spec.tail[1], moving && art.back.length > 0);
  const breath = useLoop(spec.breathe[1], moving);
  const headLoop = useLoop(spec.head[2], moving);

  // The arrival pop: played once whenever the pose changes.
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!moving) {
      pop.setValue(0);
      return;
    }
    pop.setValue(0);
    const run = Animated.sequence([
      Animated.timing(pop, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(2.4)),
        useNativeDriver: true,
      }),
      Animated.timing(pop, {
        toValue: 0,
        duration: 260,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    run.start();
    return () => run.stop();
  }, [pose, character, moving, pop]);

  // Build both endpoints numerically: a negative amount used to render "--5deg".
  const deg = (v: Animated.Value, amount: number) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [`${-amount}deg`, `${amount}deg`] });
  const px = (v: Animated.Value, amount: number) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [0, amount] });

  const outer = {
    transform: [
      { translateY: px(pop, -spec.pop[0]) },
      { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, spec.pop[1]] }) },
    ],
  };

  const box = { position: 'absolute' as const, width: '100%' as const, height: '100%' as const };

  if (override) {
    return (
      <Animated.View style={[{ width, height: size }, outer]}>
        <Image source={override} style={styles.art} resizeMode="contain" />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ width, height: size }, outer]}>
      {/* shadow: still, so the character moves against something */}
      <View style={box}>
        <SvgXml xml={wrap(art.shadow)} width="100%" height="100%" />
      </View>

      {/* tail, swinging from where it meets the hip */}
      {art.back ? (
        <Animated.View
          style={[
            box,
            { transformOrigin: '62% 85%', transform: [{ rotate: deg(tail, spec.tail[0]) }] },
          ]}
        >
          <SvgXml xml={wrap(art.back)} width="100%" height="100%" />
        </Animated.View>
      ) : null}

      {/* body, breathing from the feet up */}
      <Animated.View
        style={[
          box,
          {
            transformOrigin: '50% 100%',
            transform: [{ translateY: px(breath, spec.breathe[0] * (size / 240)) }],
          },
        ]}
      >
        <SvgXml xml={wrap(art.body)} width="100%" height="100%" />
      </Animated.View>

      {/* head, dipping and tilting on the neck */}
      <Animated.View
        style={[
          box,
          {
            transformOrigin: '50% 52%',
            transform: [
              { translateY: px(headLoop, spec.head[0] * (size / 240)) },
              { rotate: deg(headLoop, spec.head[1]) },
            ],
          },
        ]}
      >
        <SvgXml xml={wrap(art.head)} width="100%" height="100%" />
      </Animated.View>

      {spec.sparkles ? (
        <Animated.View style={[box, { opacity: pop }]}>
          <SvgXml xml={wrap(MASCOT_SPARKLES)} width="100%" height="100%" />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/** The pose that matches a verdict (docs/UI.md §5.1). */
export function poseForGrade(grade: 'correct' | 'amber' | 'wrong'): Pose {
  if (grade === 'correct') return 'nod';
  if (grade === 'amber') return 'idle';
  return 'hm';
}

const styles = StyleSheet.create({
  art: { width: '100%', height: '100%' },
});
