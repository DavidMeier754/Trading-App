import { useEffect, useRef } from 'react';
import {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';
import { DURATION, EASE_OUT } from './motion';

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
 * docs/UI.md §5.1: "the element turns green (200 ms)", ramping from whatever it
 * looked like the instant before.
 *
 * On Reanimated this runs on the UI thread. Core `Animated` cannot drive colour
 * natively, so this used to be the one animation stuck on the JS thread — and
 * it fires at the same moment as the shake, which was native. Two halves of one
 * piece of feedback, on two threads.
 */
export function useToneTransition(tone: Tone) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(isRevealTone(tone) ? 1 : 0);
  const from = useRef(tonePalette(tone));
  const to = useRef(tonePalette(tone));
  const previous = useRef<Tone>(tone);

  useEffect(() => {
    const wasReveal = isRevealTone(previous.current);
    const isReveal = isRevealTone(tone);

    if (isReveal && !wasReveal) {
      from.current = tonePalette(previous.current);
      to.current = tonePalette(tone);
      progress.set(0);
      progress.set(
        withTiming(1, {
          // A colour ramp is a state change, not movement, so reduced motion
          // shortens it rather than removing it.
          duration: reduced ? 140 : DURATION.reveal,
          easing: EASE_OUT,
        })
      );
    } else {
      from.current = tonePalette(tone);
      to.current = tonePalette(tone);
      progress.set(0);
    }
    previous.current = tone;
  }, [tone, reduced, progress]);

  return useAnimatedStyle(() => {
    const t = progress.get();
    return {
      borderColor: interpolateColor(t, [0, 1], [from.current.border, to.current.border]),
      backgroundColor: interpolateColor(
        t,
        [0, 1],
        [from.current.background, to.current.background]
      ),
      opacity: from.current.opacity + (to.current.opacity - from.current.opacity) * t,
    };
  });
}

/** The same ramp for a surface that only changes one colour (a border). */
export function useBorderTransition(target: string, active: boolean) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(active ? 1 : 0);
  const from = useRef(target);
  const to = useRef(target);
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) {
      to.current = target;
      progress.set(0);
      progress.set(
        withTiming(1, { duration: reduced ? 140 : DURATION.reveal, easing: EASE_OUT })
      );
    } else if (!active) {
      from.current = target;
      to.current = target;
      progress.set(0);
    }
    wasActive.current = active;
  }, [active, reduced, progress, target]);

  return useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [from.current, to.current]),
  }));
}
