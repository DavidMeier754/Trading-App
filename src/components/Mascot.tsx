import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

import { useReduceMotion } from '../lesson/useReduceMotion';
import { artFor, Character, Pose } from '../mascots/registry';
import { colors } from '../theme';

export type { Character, Pose };

/**
 * docs/UI.md §6.9 — the mascot slot.
 *
 * The drawings below are PLACEHOLDERS: flat, one accent colour plus neutrals,
 * enough to judge size, placement and pose switching. They are replaced by
 * dropping real artwork into `src/mascots/registry.ts`; no screen changes.
 */

type Palette = { fur: string; dark: string; light: string };

const PALETTE: Record<Character, Palette> = {
  foxy: { fur: '#E8763A', dark: '#B4551F', light: '#F7EFE6' },
  bull: { fur: colors.up, dark: '#189263', light: '#F7EFE6' },
  bear: { fur: colors.down, dark: '#B23B35', light: '#F7EFE6' },
  'retail-trader': { fur: colors.accent, dark: '#2E63C0', light: '#F7EFE6' },
  'market-maker': { fur: '#8C7BD8', dark: '#5F4FA8', light: '#F7EFE6' },
  institution: { fur: '#7C8899', dark: '#55606E', light: '#F7EFE6' },
};

/** Eyes and mouth carry the pose; the head shape carries the character. */
function Face({ pose, p }: { pose: Pose; p: Palette }) {
  const eye = (cxv: number) => {
    if (pose === 'nod' || pose === 'cheer') {
      // happy arcs
      return (
        <Path
          key={cxv}
          d={`M${cxv - 5},52 q5,-6 10,0`}
          stroke={p.dark}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    if (pose === 'sleep') {
      return (
        <Path
          key={cxv}
          d={`M${cxv - 5},52 q5,4 10,0`}
          stroke={p.dark}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    return <Circle key={cxv} cx={cxv} cy={51} r={4} fill={p.dark} />;
  };

  const mouth =
    pose === 'cheer' ? (
      <Path d="M42,66 q8,9 16,0" stroke={p.dark} strokeWidth={3} strokeLinecap="round" fill="none" />
    ) : pose === 'nod' ? (
      <Path d="M43,66 q7,6 14,0" stroke={p.dark} strokeWidth={3} strokeLinecap="round" fill="none" />
    ) : pose === 'hm' ? (
      <Path d="M43,68 q7,-5 14,0" stroke={p.dark} strokeWidth={3} strokeLinecap="round" fill="none" />
    ) : (
      <Path d="M44,67 h12" stroke={p.dark} strokeWidth={3} strokeLinecap="round" fill="none" />
    );

  return (
    <G>
      {[40, 60].map(eye)}
      {mouth}
      {pose === 'hm' ? (
        // a raised brow, so "not quite" reads as thinking rather than scolding
        <Path
          d="M34,41 q6,-4 12,-1"
          stroke={p.dark}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
    </G>
  );
}

function Body({ character, pose }: { character: Character; pose: Pose }) {
  const p = PALETTE[character];

  const ears = () => {
    switch (character) {
      case 'foxy':
        return (
          <G>
            <Polygon points="26,34 30,10 46,26" fill={p.fur} />
            <Polygon points="74,34 70,10 54,26" fill={p.fur} />
            <Polygon points="31,30 33,18 41,26" fill={p.dark} />
            <Polygon points="69,30 67,18 59,26" fill={p.dark} />
          </G>
        );
      case 'bull':
        return (
          <G>
            <Path d="M26,32 q-14,-10 -18,2 q10,2 14,10" fill={p.light} />
            <Path d="M74,32 q14,-10 18,2 q-10,2 -14,10" fill={p.light} />
          </G>
        );
      case 'bear':
        return (
          <G>
            <Circle cx={28} cy={24} r={11} fill={p.fur} />
            <Circle cx={72} cy={24} r={11} fill={p.fur} />
            <Circle cx={28} cy={24} r={5} fill={p.dark} />
            <Circle cx={72} cy={24} r={5} fill={p.dark} />
          </G>
        );
      case 'institution':
        // a roof, for the big calm one
        return <Polygon points="50,12 86,32 14,32" fill={p.dark} />;
      case 'market-maker':
        return (
          <G>
            <Rect x={22} y={18} width={56} height={8} rx={4} fill={p.dark} />
          </G>
        );
      default:
        return <Path d="M30,28 q20,-16 40,0" fill={p.dark} />;
    }
  };

  return (
    <G>
      {ears()}
      {/* head */}
      <Ellipse cx={50} cy={54} rx={30} ry={28} fill={p.fur} />
      {character === 'market-maker' ? (
        // two-faced: buy side and sell side (docs/UI.md §6.9)
        <Path d="M50,26 a30,28 0 0 1 0,56 z" fill={colors.down} opacity={0.75} />
      ) : null}
      {/* muzzle */}
      <Ellipse cx={50} cy={64} rx={15} ry={11} fill={p.light} />
      <Face pose={pose} p={p} />
      {pose === 'point' ? (
        <G>
          <Circle cx={84} cy={70} r={7} fill={p.fur} />
          <Path
            d="M84,64 v-14"
            stroke={p.fur}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </G>
      ) : null}
      {pose === 'cheer' ? (
        <G>
          <Path d="M16,36 l4,-9 4,9 9,4 -9,4 -4,9 -4,-9 -9,-4 z" fill={colors.warning} />
          <Path d="M84,30 l3,-7 3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 z" fill={colors.warning} />
        </G>
      ) : null}
    </G>
  );
}

export default function Mascot({
  character = 'foxy',
  pose = 'idle',
  size = 44,
  /** A small bob on mount, so the reveal slot has a heartbeat. */
  animate = true,
}: {
  character?: Character;
  pose?: Pose;
  size?: number;
  animate?: boolean;
}) {
  const reduced = useReduceMotion();
  const bob = useRef(new Animated.Value(0)).current;
  const art = artFor(character, pose);

  useEffect(() => {
    if (!animate || reduced) {
      bob.setValue(0);
      return;
    }
    bob.setValue(0);
    const run = Animated.sequence([
      Animated.timing(bob, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(bob, {
        toValue: 0,
        duration: 220,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    run.start();
    return () => run.stop();
  }, [pose, character, animate, reduced, bob]);

  const style = {
    transform: [
      { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
      { scale: bob.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
    ],
  };

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      {art ? (
        <Image source={art} style={styles.art} resizeMode="contain" />
      ) : (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Body character={character} pose={pose} />
        </Svg>
      )}
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

export const CHARACTER_VIEW = View;
