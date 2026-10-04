import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { copy } from '../format';
import { Celebrate, PopIn } from '../lesson/Celebrate';
import Shake from '../lesson/Shake';
import { TermText } from '../lesson/termText';
import { EASE_IN_OUT, EASE_OUT, usePressFeedback } from '../lesson/motion';
import { Tone, useToneTransition } from '../lesson/toneTransition';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { useVerdict } from '../lesson/verdict';
import { colors, MONO_FONT, radius, space, TAP_TARGET, type, themed } from '../theme';
import { LOOKS, LookSpec, shade, surfaceStyle, useLookSpec } from '../lesson/look';

export function Prompt({ children }: { children: string }) {
  return <TermText text={children} style={styles.prompt} />;
}

export function ScreenTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{copy(children)}</Text>;
}

export function Body({ children }: { children: string }) {
  return <TermText text={children} style={styles.body} />;
}

/** docs/ui/06-reveal-and-hearts.md §5.1 [DESIGN-REVIEW] "Answers with depth": how far an answer stands on its edge. */
export const ANSWER_EDGE = 4;

/** A colour pushed towards black, for the side of a raised surface; a non-hex colour stays. */
function deepen(c: string): string {
  return /^#[0-9a-f]{6}$/i.test(c) ? shade(c, 0.32) : c;
}

/** The edge under an answer, by tone: the verdict's colour, a shade deeper. */
function edgePalette(tone: Tone, spec: LookSpec = LOOKS.neo) {
  const plain = { border: colors.borderStrong, background: 'transparent', opacity: 1 };
  switch (tone) {
    case 'selected':
      return { ...plain, border: deepen(spec.accent) };
    case 'correct':
      return { ...plain, border: deepen(colors.success) };
    case 'wrong':
      return { ...plain, border: deepen(colors.down) };
    case 'amber':
      return { ...plain, border: deepen(colors.warning) };
    case 'dimmed':
      return { ...plain, opacity: 0.45 };
    default:
      return plain;
  }
}

/**
 * A tappable answer surface: ticks on press-in, ramps to its verdict colour
 * (docs/ui/06-reveal-and-hearts.md §5.1), wobbles when the verdict is wrong, and rings out when the
 * learner got it right -- only then: after a wrong pick the right option turns
 * green too, and it does not get the celebration the learner did not earn.
 *
 * `deep` (docs/ui/06-reveal-and-hearts.md §5.1 [DESIGN-REVIEW], "Answers with depth", David's pick
 * of 2026-10-04): the surface stands on an edge, as the key does, sinks into
 * it while pressed, and the answer the learner chose stays down. The edge is
 * a rounded rim drawn only below the face, so a see-through face never shows
 * it through; its colour ramps with the verdict.
 */
export function ToneSurface({
  tone,
  onPress,
  disabled,
  style,
  accessibilityLabel,
  deep = false,
  children,
}: {
  tone: Tone;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  deep?: boolean;
  children: React.ReactNode;
}) {
  const animated = useToneTransition(tone);
  const edgeTone = useToneTransition(tone, edgePalette);
  const press = usePressFeedback(!disabled);
  const verdict = useVerdict();
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const shape = {
    borderRadius: spec.surface.radius,
    borderWidth: spec.surface.borderWidth,
    ...(spec.surface.borderTop && tone === 'idle'
      ? { borderTopColor: spec.surface.borderTop }
      : null),
  };
  // The chosen answer stays pressed in: picked, and after the check if it was
  // the learner's (the right answer shown after a wrong pick stands up).
  const held =
    deep &&
    (tone === 'selected' ||
      tone === 'wrong' ||
      tone === 'amber' ||
      (tone === 'correct' && verdict?.grade === 'correct'));
  const down = useSharedValue(held ? 1 : 0);
  useEffect(() => {
    if (reduced) down.set(held ? 1 : 0);
    else down.set(withTiming(held ? 1 : 0, { duration: 90, easing: EASE_OUT }));
  }, [held, reduced, down]);
  const sink = useAnimatedStyle(() => ({
    transform: [{ translateY: ANSWER_EDGE * Math.max(down.get(), press.pressed.get()) }],
  }));

  const surface = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, selected: tone === 'selected' }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      pressRetentionOffset={16}
      // The Pressable is what sits in a row of chips: capped at the row, so a
      // long label wraps rather than widening the screen.
      style={[styles.cap, deep && { paddingBottom: ANSWER_EDGE }]}
    >
      {deep ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.edge,
            {
              top: ANSWER_EDGE,
              borderRadius: spec.surface.radius,
              borderLeftWidth: spec.surface.borderWidth,
              borderRightWidth: spec.surface.borderWidth,
              borderBottomWidth: ANSWER_EDGE + spec.surface.borderWidth,
            },
            edgeTone,
          ]}
        />
      ) : null}
      <Animated.View style={[styles.surface, shape, style, animated, deep ? sink : press.style]}>
        {children}
      </Animated.View>
    </Pressable>
  );

  if (tone === 'wrong') return <Shake>{surface}</Shake>;
  if (tone === 'correct' && verdict?.grade === 'correct') {
    return <Celebrate radius={spec.surface.radius}>{surface}</Celebrate>;
  }
  return surface;
}

/** How long the answer takes to turn over (docs/ui/06-reveal-and-hearts.md §5.1 [DESIGN-REVIEW]). */
const FLIP_MS = 560;

/**
 * A single answer card (docs/ui/04-question-types.md §4.1 `mc` / `numeric-mc`).
 *
 * [DESIGN-REVIEW] (David's picks of 2026-10-04): it wears its letter, A to
 * D, and stands on an edge (`ToneSurface` `deep`). On the lesson's last
 * question (`useVerdict().big`) the answer the learner chose turns over: it
 * turns away showing the choice and comes round showing the verdict, which
 * lands as it faces the learner again. Not on every answer (David).
 */
export function AnswerCard({
  label,
  tone,
  onPress,
  disabled,
  letter,
}: {
  label: string;
  tone: Tone;
  onPress: () => void;
  disabled?: boolean;
  /** A, B, C, D: the answer's place, on its key. */
  letter?: string;
}) {
  const verdict = useVerdict();
  const reduced = useReduceMotion();
  const chosen = tone === 'wrong' || (tone === 'correct' && verdict?.grade === 'correct');
  const flips = !!verdict?.big && chosen && !reduced;
  // Turned away, the card still shows the choice; the verdict's colours come
  // with its far side.
  const [turned, setTurned] = useState(false);
  const [wasFlipping, setWasFlipping] = useState(flips);
  if (flips !== wasFlipping) {
    setWasFlipping(flips);
    setTurned(false);
  }
  const turn = useSharedValue(0);
  useEffect(() => {
    if (!flips) return;
    turn.set(0);
    turn.set(withTiming(1, { duration: FLIP_MS, easing: EASE_IN_OUT }));
    const t = setTimeout(() => setTurned(true), FLIP_MS / 2);
    return () => clearTimeout(t);
  }, [flips, turn]);
  const flip = useAnimatedStyle(() => {
    const t = turn.get();
    // Away to edge-on, then back from the other edge: the far side never
    // shows mirrored.
    const angle = t < 0.5 ? t * 180 : (t - 1) * 180;
    return { transform: [{ perspective: 900 }, { rotateY: `${angle}deg` }] };
  });
  const shown: Tone = flips && !turned ? 'selected' : tone;

  const card = (
    <ToneSurface tone={shown} onPress={onPress} disabled={disabled} style={styles.answerCard} deep>
      {letter ? <Letter letter={letter} tone={shown} /> : null}
      <Text style={styles.answerText}>{copy(label)}</Text>
      {/* The mark's room is kept on every card from the start, so a long
          answer is wrapped the same before and after the check: a mark that
          took its room only when it arrived would push the words onto a new
          line, and every card below down with them. */}
      <View style={styles.markSlot}>
        {shown === 'correct' ? (
          <PopIn delay={60}>
            <Text style={styles.markCorrect}>{'✓'}</Text>
          </PopIn>
        ) : null}
        {shown === 'wrong' ? (
          <PopIn>
            <Text style={styles.markWrong}>{'✕'}</Text>
          </PopIn>
        ) : null}
      </View>
    </ToneSurface>
  );
  // Always in the turning wrapper, so the card is never remounted as the
  // verdict arrives.
  return <Animated.View style={flip}>{card}</Animated.View>;
}

/** An answer's letter on its own small key, in the answer's tone. */
function Letter({ letter, tone }: { letter: string; tone: Tone }) {
  const spec = useLookSpec();
  const fill =
    tone === 'selected'
      ? { backgroundColor: spec.accent, borderColor: spec.accent, color: spec.accentText }
      : tone === 'correct'
        ? {
            backgroundColor: colors.successFill,
            borderColor: colors.successFill,
            color: colors.successText,
          }
        : tone === 'wrong'
          ? { backgroundColor: colors.dangerFill, borderColor: colors.dangerFill, color: '#FFFFFF' }
          : tone === 'amber'
            ? {
                backgroundColor: colors.warning,
                borderColor: colors.warning,
                color: colors.background,
              }
            : {
                backgroundColor: 'transparent',
                borderColor: colors.borderStrong,
                color: colors.textMuted,
              };
  return (
    <View
      style={[styles.letter, { borderRadius: Math.min(8, spec.surface.radius), ...fill }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.letterText, { color: fill.color }]}>{letter}</Text>
    </View>
  );
}

/**
 * Several versions of one block -- a carousel's cards, a walkthrough's steps --
 * laid out in the same place, so the block is as tall as the tallest of them.
 * Moving to the next one changes what is drawn, never how much room it takes,
 * and nothing below it moves (docs/ui/02-lesson-player-layout.md §2). The versions not showing are
 * still laid out, invisibly and out of reach, only to be measured.
 */
export function Stack({
  current,
  items,
  shown,
}: {
  current: number;
  /** Every version, plain, for measuring. */
  items: React.ReactNode[];
  /** The one on screen; defaults to `items[current]`. It can carry an entrance. */
  shown?: React.ReactNode;
}) {
  const [heights, setHeights] = useState<number[]>([]);
  const onItem = useCallback((i: number, h: number) => {
    setHeights((prev) => {
      if (Math.abs((prev[i] ?? -1) - h) < 0.5) return prev;
      const next = prev.slice();
      next[i] = h;
      return next;
    });
  }, []);
  const tallest = heights.reduce((m, h) => Math.max(m, h ?? 0), 0);
  return (
    <View style={{ minHeight: tallest }}>
      {items.map((item, i) => (
        <View
          key={i}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          style={styles.stackGhost}
          onLayout={(e) => onItem(i, e.nativeEvent.layout.height)}
        >
          {item}
        </View>
      ))}
      {shown ?? items[current]}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const spec = useLookSpec();
  return <View style={[styles.card, surfaceStyle(spec), style]}>{children}</View>;
}

const styles = themed(() => ({
  stackGhost: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
  cap: { maxWidth: '100%' },
  prompt: { ...type.prompt, color: colors.text },
  title: { ...type.title, color: colors.text },
  body: { ...type.body, color: colors.textMuted },
  surface: { borderWidth: 1.5, borderRadius: radius.md },
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 0 },
  answerCard: {
    minHeight: TAP_TARGET,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  answerText: { ...type.answer, color: colors.text, flexShrink: 1, flexGrow: 1 },
  letter: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { fontFamily: MONO_FONT, fontSize: 14, lineHeight: 18, fontWeight: '800' },
  markSlot: { width: 18, alignItems: 'center' },
  markCorrect: { ...type.answer, color: colors.success },
  markWrong: { ...type.answer, color: colors.down },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
  },
}));
