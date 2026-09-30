import { useEffect, useRef } from 'react';

import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme';
import { LOOKS, LookSpec, tint, useLookSpec } from './look';
import { DURATION, EASE_OUT } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** How an answer surface currently reads. */
export type Tone = 'idle' | 'selected' | 'correct' | 'wrong' | 'amber' | 'dimmed';

const REVEAL_TONES: Tone[] = ['correct', 'wrong', 'amber', 'dimmed'];

export function isRevealTone(tone: Tone): boolean {
  return REVEAL_TONES.includes(tone);
}

export function tonePalette(
  tone: Tone,
  spec: LookSpec = LOOKS.neo,
): {
  border: string;
  background: string;
  opacity: number;
} {
  // Rest and selection belong to the look (lesson/look.ts); the verdicts are
  // the same in every look, because green, red and amber are the content.
  switch (tone) {
    case 'idle':
      return { border: spec.surface.border, background: spec.surface.background, opacity: 1 };
    case 'selected':
      return { border: spec.accent, background: tint(spec.accent, 0.14), opacity: 1 };
    case 'correct':
      return { border: colors.success, background: colors.successTint, opacity: 1 };
    case 'wrong':
      return { border: colors.down, background: colors.downTint, opacity: 1 };
    case 'amber':
      return { border: colors.warning, background: colors.warningTint, opacity: 1 };
    case 'dimmed':
      return { border: spec.surface.border, background: spec.surface.background, opacity: 0.45 };
    default:
      return { border: spec.surface.border, background: spec.surface.background, opacity: 1 };
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
  const reduced = useReduceMotion();
  const spec = useLookSpec();
  const progress = useSharedValue(isRevealTone(tone) ? 1 : 0);
  // The endpoints are shared values, not refs. A worklet captures a plain
  // object by copying it into the UI runtime, so a ref mutated later on the
  // React side never reaches the running animation: the colours would be one
  // render stale. On web that goes unnoticed, because there the worklet closes
  // over the very same object.
  const from = useSharedValue(tonePalette(tone, spec));
  const to = useSharedValue(tonePalette(tone, spec));
  const previous = useRef<Tone>(tone);

  useEffect(() => {
    const wasReveal = isRevealTone(previous.current);
    const isReveal = isRevealTone(tone);

    if (isReveal && !wasReveal) {
      from.set(tonePalette(previous.current, spec));
      to.set(tonePalette(tone, spec));
      progress.set(0);
      progress.set(
        withTiming(1, {
          // A colour ramp is a state change, not movement, so reduced motion
          // shortens it rather than removing it.
          duration: reduced ? 140 : DURATION.reveal,
          easing: EASE_OUT,
        }),
      );
    } else {
      from.set(tonePalette(tone, spec));
      to.set(tonePalette(tone, spec));
      progress.set(0);
    }
    previous.current = tone;
  }, [tone, reduced, spec, progress, from, to]);

  return useAnimatedStyle(() => {
    const t = progress.get();
    const a = from.get();
    const b = to.get();
    return {
      borderColor: interpolateColor(t, [0, 1], [a.border, b.border]),
      backgroundColor: interpolateColor(t, [0, 1], [a.background, b.background]),
      opacity: a.opacity + (b.opacity - a.opacity) * t,
    };
  });
}

/** The same ramp for a surface that only changes one colour (a border). */
export function useBorderTransition(target: string, active: boolean) {
  const reduced = useReduceMotion();
  const progress = useSharedValue(active ? 1 : 0);
  // Shared values for the same reason as above.
  const from = useSharedValue(target);
  const to = useSharedValue(target);
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) {
      to.set(target);
      progress.set(0);
      progress.set(withTiming(1, { duration: reduced ? 140 : DURATION.reveal, easing: EASE_OUT }));
    } else if (!active) {
      from.set(target);
      to.set(target);
      progress.set(0);
    }
    wasActive.current = active;
  }, [active, reduced, progress, target, from, to]);

  return useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [from.get(), to.get()]),
  }));
}
