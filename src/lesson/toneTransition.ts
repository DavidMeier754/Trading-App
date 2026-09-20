import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { colors } from '../theme';

/** How an answer surface currently reads. */
export type Tone = 'idle' | 'selected' | 'correct' | 'wrong' | 'amber' | 'dimmed';

const REVEAL_TONES: Tone[] = ['correct', 'wrong', 'amber', 'dimmed'];

export function isRevealTone(tone: Tone): boolean {
  return REVEAL_TONES.includes(tone);
}

export function tonePalette(tone: Tone): {
  border: string;
  background: string;
  opacity: number;
} {
  switch (tone) {
    case 'selected':
      return { border: colors.accent, background: colors.accentTint, opacity: 1 };
    case 'correct':
      return { border: colors.success, background: colors.successTint, opacity: 1 };
    case 'wrong':
      return { border: colors.down, background: colors.downTint, opacity: 1 };
    case 'amber':
      return { border: colors.warning, background: colors.warningTint, opacity: 1 };
    case 'dimmed':
      return { border: colors.border, background: colors.surface, opacity: 0.45 };
    default:
      return { border: colors.borderStrong, background: colors.surface, opacity: 1 };
  }
}

/**
 * docs/UI.md §5.1: "the element turns green (200 ms)". The colour is animated from
 * whatever the surface looked like the instant before Check — idle or selected —
 * to its verdict colour, so the reveal reads as a change of state rather than a
 * repaint. Selection changes before the reveal snap, as a tap should.
 */
export function useToneTransition(tone: Tone, reduced: boolean) {
  const anim = useRef(new Animated.Value(isRevealTone(tone) ? 1 : 0)).current;
  const from = useRef(tonePalette(tone));
  const previous = useRef<Tone>(tone);

  useEffect(() => {
    const wasReveal = isRevealTone(previous.current);
    const isReveal = isRevealTone(tone);

    if (isReveal && !wasReveal) {
      from.current = tonePalette(previous.current);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: reduced ? 0 : 200,
        useNativeDriver: false,
      }).start();
    } else if (!isReveal) {
      from.current = tonePalette(tone);
      anim.setValue(0);
    }
    previous.current = tone;
  }, [tone, reduced, anim]);

  const to = tonePalette(tone);
  const start = from.current;

  return {
    borderColor: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [start.border, to.border],
    }),
    backgroundColor: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [start.background, to.background],
    }),
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [start.opacity, to.opacity],
    }),
  };
}

/** The same 200 ms ramp for a surface that only changes one colour (a border). */
export function useBorderTransition(
  target: string,
  active: boolean,
  reduced: boolean
) {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const from = useRef(target);
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: reduced ? 0 : 200,
        useNativeDriver: false,
      }).start();
    } else if (!active) {
      from.current = target;
      anim.setValue(0);
    }
    wasActive.current = active;
  }, [active, reduced, anim, target]);

  return anim.interpolate({ inputRange: [0, 1], outputRange: [from.current, target] });
}
