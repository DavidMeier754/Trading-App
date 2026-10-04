import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';

import type { CueName } from '../../lesson/cues.generated';
import { usePressFeedback } from '../../lesson/motion';
import { colors, radius, space, TAP_TARGET, type, themed } from '../../theme';
import type { IconName } from '../icons';

/**
 * What every design suggestion is made of (Settings → Testing → Design
 * suggestions, docs/ui/15-theming-and-accessibility.md §10): its row on the list, and the preview that
 * plays when the row is tapped, as the Animations page does it (David,
 * 2026-10-01: "do it like the test animations tab so I can click on the
 * suggestion and then I get a preview").
 *
 * A preview is drawn with the theme in use and the look in use, plays on
 * arrival or on a tap, and keeps the app's rules: text at 13 pt or more, keys
 * of 48 pt, a tap for every drag, and under reduced motion the end state at
 * once. "Play again" remounts it.
 */

export type Section = 'answers' | 'rewards' | 'wins' | 'map' | 'bars' | 'numbers' | 'looks' | 'mix';

export type Suggestion = {
  id: string;
  section: Section;
  icon: IconName;
  title: string;
  /** What it is, in a line: under the title on the list and under the preview. */
  line: string;
  /**
   * The row's tag: in the app (David's picks of 2026-10-04, built in
   * DESIGN-REVIEW), in the mix or left out of it (David's answers of
   * 2026-09-29 and 2026-10-04), moving on its own (against docs/ui/01-design-principles.md §1,
   * "Nothing moves unless the learner moved it"), or against another rule of
   * docs/ui/.
   */
  tag?: 'app' | 'in' | 'out' | 'moves' | 'rule';
  /** A line under the preview: which rule it breaks, or what it would replace. */
  note?: string;
  /** The key under the preview: plays it again, or puts back what was tried. None for a still. */
  again?: 'Play again' | 'Start again';
  Preview: React.ComponentType;
};

export const TAG_TEXT: Record<NonNullable<Suggestion['tag']>, string> = {
  app: 'In the app',
  in: 'In your mix',
  out: 'Not in your mix',
  moves: 'Moves on its own',
  rule: 'Breaks a rule',
};

/**
 * A key under a preview that stands in for an answer: "Right", "Wrong",
 * "Next". It plays no cue of its own unless asked: the moment it starts has
 * its own.
 */
export function DemoKey({
  label,
  onPress,
  tone = 'plain',
  cue = null,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone?: 'plain' | 'right' | 'wrong' | 'accent';
  cue?: CueName | null;
  disabled?: boolean;
}) {
  const press = usePressFeedback(!disabled, { cue });
  const face =
    tone === 'right'
      ? colors.successFill
      : tone === 'wrong'
        ? colors.dangerFill
        : tone === 'accent'
          ? colors.accentFill
          : colors.surfaceAlt;
  const ink =
    tone === 'right' ? colors.successText : tone === 'plain' ? colors.text : colors.accentText;
  return (
    <Animated.View style={[kit.keyWrap, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={[
          kit.key,
          { backgroundColor: face },
          tone === 'plain' && kit.keyPlain,
          disabled && kit.keyOff,
        ]}
      >
        <Text style={[kit.keyText, { color: ink }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** Keys side by side, under a preview. */
export function KeyRow({ children }: { children: React.ReactNode }) {
  return <View style={kit.keyRow}>{children}</View>;
}

/**
 * A phone, drawn small: for the suggestions that change a whole screen (a
 * look, the top bar's columns). Its content is laid out at its own size and
 * never scales, so text in it stays at 13 pt or more.
 */
export function MiniScreen({
  children,
  background,
  height = 440,
  style,
}: {
  children: React.ReactNode;
  background?: string;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[kit.phone, { height, backgroundColor: background ?? colors.background }, style]}>
      {children}
    </View>
  );
}

export type Ohlc = { o: number; h: number; l: number; c: number };

/** A short run of prices that rises with a pullback, the same every time. */
export const SAMPLE_CANDLES: Ohlc[] = [
  { o: 50, h: 51.2, l: 49.4, c: 50.8 },
  { o: 50.8, h: 51.6, l: 50.2, c: 50.4 },
  { o: 50.4, h: 52.1, l: 50.1, c: 51.9 },
  { o: 51.9, h: 52.8, l: 51.5, c: 52.5 },
  { o: 52.5, h: 52.7, l: 51.6, c: 51.8 },
  { o: 51.8, h: 52.2, l: 51.0, c: 51.3 },
  { o: 51.3, h: 52.6, l: 51.2, c: 52.4 },
  { o: 52.4, h: 53.6, l: 52.2, c: 53.4 },
  { o: 53.4, h: 54.1, l: 53.0, c: 53.2 },
  { o: 53.2, h: 54.6, l: 53.1, c: 54.4 },
];

/**
 * Candles, drawn still: up candles hollow in the up colour, down ones filled
 * in the down colour, as the lesson charts draw them.
 */
export function MiniChart({
  width,
  height,
  candles = SAMPLE_CANDLES,
  pad = 6,
}: {
  width: number;
  height: number;
  candles?: Ohlc[];
  pad?: number;
}) {
  const lo = Math.min(...candles.map((k) => k.l));
  const hi = Math.max(...candles.map((k) => k.h));
  const y = (v: number) => pad + ((hi - v) / Math.max(0.0001, hi - lo)) * (height - pad * 2);
  const step = (width - pad * 2) / candles.length;
  const body = Math.max(3, step * 0.56);
  return (
    <Svg width={width} height={height}>
      {candles.map((k, i) => {
        const x = pad + step * i + step / 2;
        const up = k.c >= k.o;
        const tone = up ? colors.up : colors.down;
        const top = y(Math.max(k.o, k.c));
        const h = Math.max(1.5, Math.abs(y(k.o) - y(k.c)));
        return (
          <React.Fragment key={i}>
            <Line x1={x} x2={x} y1={y(k.h)} y2={y(k.l)} stroke={tone} strokeWidth={1.5} />
            <Rect
              x={x - body / 2}
              y={top}
              width={body}
              height={h}
              rx={1}
              fill={up ? colors.surface : tone}
              stroke={tone}
              strokeWidth={1.5}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export const kit = themed(() => ({
  keyRow: { flexDirection: 'row', gap: space.md, alignSelf: 'stretch' },
  keyWrap: { flex: 1 },
  key: {
    minHeight: TAP_TARGET + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  keyPlain: { borderWidth: 1.5, borderColor: colors.borderStrong },
  keyOff: { opacity: 0.5 },
  keyText: { ...type.prompt, fontSize: 17 },
  phone: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
    borderRadius: 28,
    borderWidth: 6,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  // Text styles the previews share.
  title: { ...type.title, color: colors.text },
  prompt: { ...type.prompt, color: colors.text },
  body: { ...type.body, color: colors.text },
  label: { ...type.label, color: colors.text },
  muted: { ...type.small, color: colors.textMuted },
  center: { alignItems: 'center', justifyContent: 'center' },
  column: { alignSelf: 'stretch', gap: space.lg },
}));
