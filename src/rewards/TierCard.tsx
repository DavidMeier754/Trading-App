import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useDisplayFace } from '../fonts';
import { EASE_IN_OUT } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, radius, space, type, themed } from '../theme';
import { type Material, type Tier, TIERS } from './tiers';

/** A card's proportions: a bank card's. */
export const CARD_RATIO = 1.586;

/**
 * How each material is printed. Fixed colours, the same in light and dark:
 * paper, bronze, silver and graphite are things, not theme surfaces. Each
 * pairing keeps its text at 4.5:1 or better.
 */
const MATERIALS: Record<
  Exclude<Material, 'blank'>,
  { stops: string[]; edge: string; text: string; muted: string; accent: string }
> = {
  paper: {
    stops: ['#FBF8EF', '#F1E9D6', '#E7DCC2'],
    edge: '#D6C9AB',
    text: '#2A2317',
    muted: '#5E5340',
    accent: '#2A2317',
  },
  bronze: {
    stops: ['#9A5D2C', '#7E4B22', '#5C3516'],
    edge: '#4A2B12',
    text: '#FFF6EA',
    muted: '#FCEEDD',
    accent: '#FFE2B8',
  },
  silver: {
    stops: ['#F5F7FA', '#D3D8E0', '#AEB6C2'],
    edge: '#9AA3B0',
    text: '#1C2129',
    muted: '#3F4754',
    accent: '#1C2129',
  },
  graphite: {
    stops: ['#3B4049', '#252930', '#16191D'],
    edge: '#C9A447',
    text: '#F2D27A',
    muted: '#CDBB8E',
    accent: '#E8C25A',
  },
};

/** The material's name, as the row of four reads it. */
export const MATERIAL_NAME: Record<Exclude<Material, 'blank'>, string> = {
  paper: 'Paper',
  bronze: 'Bronze',
  silver: 'Silver',
  graphite: 'Graphite and gold',
};

/**
 * docs/UI.md §5.5 / §7.4 [DESIGN-REVIEW]: the tier card, printed in the tier's
 * material -- the tier's name, "Tier 2 of 4", four pips and what the tier
 * means. Before the first tier it is a blank card with a dashed edge. It heads
 * the Account page and turns over on the tier-up screen (TierFlip).
 */
export function TierCard({ tier, width, path }: { tier: Tier; width: number; path?: string }) {
  const display = useDisplayFace();
  const height = width / CARD_RATIO;
  const id = `tier-${tier.material}`;
  if (tier.material === 'blank') {
    return (
      <View
        style={[styles.card, styles.blank, { width, height }]}
        accessible
        accessibilityLabel={`Tier card: no tier yet. ${tier.means}`}
      >
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Tier card</Text>
        <View style={styles.fill} />
        <Text style={[styles.name, display, { color: colors.textMuted }]}>{tier.name}</Text>
        <Pips rank={0} color={colors.borderStrong} />
        <Text style={[styles.means, { color: colors.textMuted }]}>{tier.means}</Text>
      </View>
    );
  }
  const m = MATERIALS[tier.material];
  return (
    <View
      style={[styles.card, { width, height, borderColor: m.edge }]}
      accessible
      accessibilityLabel={`Tier card: ${tier.name}, tier ${tier.rank} of ${TIERS.length}. ${tier.means}`}
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            {m.stops.map((c, i) => (
              <Stop key={c} offset={i / (m.stops.length - 1)} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />
        {tier.material === 'paper' ? (
          // A few fibres, faint: paper, not a texture to look at.
          [0.22, 0.47, 0.71].map((t, i) => (
            <Line
              key={i}
              x1={width * (0.08 + 0.1 * i)}
              y1={height * t}
              x2={width * (0.5 + 0.12 * i)}
              y2={height * (t + 0.03)}
              stroke="#CDBF9F"
              strokeOpacity={0.35}
              strokeWidth={0.8}
            />
          ))
        ) : (
          // A band of light across metal.
          <Rect
            x={-width * 0.2}
            y={height * 0.18}
            width={width * 1.4}
            height={height * 0.12}
            fill="#FFFFFF"
            opacity={tier.material === 'graphite' ? 0.05 : 0.14}
            transform={`rotate(-12 ${width / 2} ${height / 2})`}
          />
        )}
        {tier.material === 'graphite' ? (
          <Rect
            x={6}
            y={6}
            width={width - 12}
            height={height - 12}
            rx={radius.lg - 4}
            fill="none"
            stroke={m.edge}
            strokeOpacity={0.6}
            strokeWidth={1}
          />
        ) : null}
      </Svg>
      <View style={styles.head}>
        <Text style={[styles.kicker, { color: m.muted }]}>
          {`Tier ${tier.rank} of ${TIERS.length}`}
        </Text>
        {path ? <Text style={[styles.kicker, { color: m.muted }]}>{path}</Text> : null}
      </View>
      <View style={styles.fill} />
      <Text style={[styles.name, display, { color: m.text }]}>{tier.name}</Text>
      <Pips rank={tier.rank} color={m.accent} />
      <Text style={[styles.means, { color: m.muted }]}>{tier.means}</Text>
    </View>
  );
}

function Pips({ rank, color }: { rank: number; color: string }) {
  return (
    <View style={styles.pips}>
      {TIERS.map((t) => (
        <View
          key={t.rank}
          style={[
            styles.pip,
            { borderColor: color },
            t.rank <= rank ? { backgroundColor: color } : null,
          ]}
        />
      ))}
    </View>
  );
}

/**
 * docs/UI.md §5.5 [DESIGN-REVIEW]: a new tier turns the card over in place,
 * from the old material to the new. The turn lands at `ms`, on the tier cue's
 * heavy pulse (RewardScreens.tsx). Reduced motion shows the new card at once.
 */
export function TierFlip({
  from,
  to,
  width,
  path,
  delay = 0,
  ms = 520,
}: {
  from: Tier;
  to: Tier;
  width: number;
  path?: string;
  delay?: number;
  ms?: number;
}) {
  const reduced = useReduceMotion();
  const turn = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    turn.set(withDelay(delay, withTiming(1, { duration: ms, easing: EASE_IN_OUT })));
  }, [reduced, delay, ms, turn]);
  const front = useAnimatedStyle(() => {
    const a = turn.get() * 180;
    return {
      opacity: a < 90 ? 1 : 0,
      transform: [
        { perspective: 1000 },
        { rotateY: `${a}deg` },
        { scale: 1 + 0.06 * Math.sin(turn.get() * Math.PI) },
      ],
    };
  });
  const back = useAnimatedStyle(() => {
    const a = turn.get() * 180;
    return {
      opacity: a >= 90 ? 1 : 0,
      transform: [
        { perspective: 1000 },
        { rotateY: `${a - 180}deg` },
        { scale: 1 + 0.06 * Math.sin(turn.get() * Math.PI) },
      ],
    };
  });
  return (
    <View style={{ width, height: width / CARD_RATIO }}>
      <Animated.View style={[StyleSheet.absoluteFill, front]} aria-hidden>
        <TierCard tier={from} width={width} path={path} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, back]}>
        <TierCard tier={to} width={width} path={path} />
      </Animated.View>
    </View>
  );
}

/** The four materials in a row, the learner's place marked (§5.5). */
export function MaterialRow({ rank }: { rank: number }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`Tier ${rank} of ${TIERS.length}`}>
      {TIERS.map((t) => {
        const m = MATERIALS[t.material as Exclude<Material, 'blank'>];
        const here = t.rank === rank;
        return (
          <View key={t.rank} style={styles.swatchCol}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: m.stops[1], borderColor: m.edge },
                t.rank > rank && styles.swatchAhead,
                here && styles.swatchHere,
              ]}
            />
            <Text style={[styles.swatchName, here && styles.swatchNameHere]} numberOfLines={1}>
              {t.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = themed(() => ({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: space.lg,
    gap: space.xs,
  },
  blank: {
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: 'transparent',
  },
  fill: { flex: 1 },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  kicker: { ...type.label, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.2 },
  name: { ...type.display, fontSize: 30, lineHeight: 36 },
  means: { ...type.small, fontSize: 14, lineHeight: 19 },
  pips: { flexDirection: 'row', gap: 6, marginVertical: 2 },
  pip: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.md },
  swatchCol: { alignItems: 'center', gap: 4, width: 64 },
  swatch: { width: 34, height: 22, borderRadius: 5, borderWidth: 1 },
  swatchAhead: { opacity: 0.35 },
  swatchHere: { borderWidth: 2, borderColor: colors.text, transform: [{ scale: 1.12 }] },
  swatchName: { ...type.small, fontSize: 13, color: colors.textMuted },
  swatchNameHere: { color: colors.text, fontWeight: '700' },
}));
