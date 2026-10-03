import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import Cta from '../lesson/Cta';
import { tapFeedback } from '../lesson/feedback';
import { usePressFeedback } from '../lesson/motion';
import { colors, radius, space, type, themed } from '../theme';
import Icon, { type IconName } from './icons';

/** A side stop is a size smaller than a level (LevelNode: 66 in an 86 ring). */
export const STOP_RING = 64;
const STOP_NODE = 48;

export type SideStopState = 'locked' | 'open' | 'done';

/**
 * docs/UI.md §7.1 "Side stops" [DESIGN-REVIEW]: an optional stop beside the
 * path, off its line, in the room the curve leaves free between two levels.
 * The path's own family -- the same faces and colours as its levels -- a size
 * smaller and in a dashed ring, so it reads as part of the map and plainly as
 * optional. It never blocks the path, costs no hearts and is never timed.
 */
export function SideStopNode({
  icon,
  state,
  label,
  onPress,
}: {
  icon: IconName;
  state: SideStopState;
  label: string;
  onPress: () => void;
}) {
  const press = usePressFeedback(true, { cue: null });
  const face =
    state === 'locked' ? colors.surfaceAlt : state === 'done' ? colors.success : colors.accent;
  // Locked, it keeps its symbol's colour at low strength, as a locked level does.
  const ink = state === 'locked' ? colors.accent : colors.background;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, optional${state === 'locked' ? ', locked' : state === 'done' ? ', done' : ''}`}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={6}
    >
      <Animated.View style={[styles.box, press.style]}>
        <Svg width={STOP_RING} height={STOP_RING} style={styles.ring}>
          <SvgCircle
            cx={STOP_RING / 2}
            cy={STOP_RING / 2}
            r={STOP_RING / 2 - 2}
            fill="none"
            stroke={state === 'locked' ? colors.borderStrong : face}
            strokeWidth={2}
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
        </Svg>
        <View
          style={[styles.node, { backgroundColor: face }, state === 'locked' && styles.nodeLocked]}
        >
          <View style={state === 'locked' ? styles.inkLocked : null}>
            <Icon name={icon} size={22} color={ink} />
          </View>
        </View>
        {state !== 'open' ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: state === 'done' ? colors.success : colors.surfaceAlt },
            ]}
          >
            <Icon
              name={state === 'done' ? 'check' : 'lock'}
              size={12}
              color={state === 'done' ? colors.background : colors.textMuted}
            />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

/** The dotted spur from the path to the stop, a few dots, the path's own. */
export function SideStopSpur({
  from,
  to,
  lit,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  lit: boolean;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const clearEnd = STOP_RING / 2 + 6;
  const dots: { x: number; y: number }[] = [];
  for (let d = 10; d < len - clearEnd; d += 12)
    dots.push({ x: from.x + (dx * d) / len, y: from.y + (dy * d) / len });
  const left = Math.min(from.x, to.x) - 6;
  const top = Math.min(from.y, to.y) - 6;
  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', left, top }}
      width={Math.abs(dx) + 12}
      height={Math.abs(dy) + 12}
    >
      {dots.map((p, k) => (
        <SvgCircle
          key={k}
          cx={p.x - left}
          cy={p.y - top}
          r={2.6}
          fill={lit ? colors.accent : colors.borderStrong}
          opacity={lit ? 0.6 : 0.8}
        />
      ))}
    </Svg>
  );
}

/**
 * The card a side stop opens, under it: what it is, what it holds, and its
 * key -- like a level's card, smaller.
 */
export function SideStopCard({
  top,
  arrowX,
  width,
  kicker,
  title,
  line,
  action,
  onAction,
}: {
  top: number;
  arrowX: number;
  width: number;
  kicker: string;
  title: string;
  line: string;
  /** The key, or null when there is nothing to start. */
  action: string | null;
  onAction: () => void;
}) {
  const cardW = Math.min(300, width - space.lg * 2);
  const left = Math.max(space.lg, Math.min(width - space.lg - cardW, arrowX - cardW / 2));
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[styles.card, { top, left, width: cardW }]}
    >
      <View style={[styles.arrow, { left: arrowX - left - 8 }]} />
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.line}>{line}</Text>
      {action ? <Cta label={action} onPress={onAction} /> : null}
    </Animated.View>
  );
}

const styles = themed(() => ({
  box: { width: STOP_RING, height: STOP_RING, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', left: 0, top: 0 },
  node: {
    width: STOP_NODE,
    height: STOP_NODE,
    borderRadius: STOP_NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLocked: { borderWidth: 1.5, borderColor: colors.borderStrong },
  inkLocked: { opacity: 0.55 },
  badge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    zIndex: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.xs,
  },
  arrow: {
    position: 'absolute',
    top: -8,
    width: 16,
    height: 16,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
  kicker: { ...type.label, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...type.title, color: colors.text },
  line: { ...type.body, color: colors.textMuted, marginBottom: space.xs },
}));
