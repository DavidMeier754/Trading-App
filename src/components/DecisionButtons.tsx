import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { EASE_OUT, SPRING_POP, usePressFeedback } from '../lesson/motion';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import { useLookSpec } from '../lesson/look';
import type { DecisionButton } from '../types';
import { DECISION_LABEL } from '../lesson/decisionReveal';

export { DECISION_LABEL };

/**
 * docs/ui/08-quotes-and-charts.md §6.4 "decision overlay": at the pause point the buttons rise from the
 * bottom. They sit in the CTA slot, which is why the player hides the CTA while a
 * chart-decision is still open.
 *
 * DESIGN-REVIEW (docs/ui/05-chart-questions-and-mistakes-round.md §4.3): the keys are equal in weight and colour --
 * no green Long and red Short -- and each carries a glyph for its direction,
 * up and to the right, down and to the right, or flat, which nudges that way
 * when pressed. It reads faster than the word and needs no colour.
 */
export default function DecisionButtons({
  buttons,
  chosen = null,
  onChoose,
}: {
  buttons: DecisionButton[];
  /** The call already made: it stays lit, the others step back, none can be pressed. */
  chosen?: DecisionButton | null;
  onChoose: (button: DecisionButton) => void;
}) {
  return (
    <View style={styles.row}>
      {buttons.map((button) => (
        <Choice key={button} button={button} chosen={chosen} onChoose={onChoose} />
      ))}
    </View>
  );
}

function Choice({
  button,
  chosen,
  onChoose,
}: {
  button: DecisionButton;
  chosen: DecisionButton | null;
  onChoose: (button: DecisionButton) => void;
}) {
  const locked = chosen !== null;
  // Nothing on the way down: the call commits on release, with its own cue.
  const press = usePressFeedback(!locked, { cue: null });
  const dim = useSharedValue(0);
  const lit = useSharedValue(0);
  // The glyph leans the way it points while the key is down.
  const nudge = useSharedValue(0);
  const way = GLYPH_WAY[button];
  const glyph = useAnimatedStyle(() => ({
    transform: [{ translateX: way.x * 3 * nudge.get() }, { translateY: way.y * 3 * nudge.get() }],
  }));

  useEffect(() => {
    dim.set(withTiming(locked && chosen !== button ? 1 : 0, { duration: 320, easing: EASE_OUT }));
    lit.set(withTiming(chosen === button ? 1 : 0, { duration: 220, easing: EASE_OUT }));
  }, [locked, chosen, button, dim, lit]);

  const spec = useLookSpec();
  const tone = spec.accent;
  const rest = spec.surface.background;
  const border = colors.borderStrong;
  const state = useAnimatedStyle(() => ({
    opacity: 1 - 0.7 * dim.get(),
    backgroundColor: interpolateColor(lit.get(), [0, 1], [rest, `${tone}33`]),
    borderColor: interpolateColor(lit.get(), [0, 1], [border, tone]),
  }));

  return (
    <Pressable
      testID="key"
      accessibilityRole="button"
      accessibilityState={{ disabled: locked, selected: chosen === button }}
      disabled={locked}
      onPress={() => onChoose(button)}
      onPressIn={() => {
        press.onPressIn();
        nudge.set(withTiming(1, { duration: 120, easing: EASE_OUT }));
      }}
      onPressOut={() => {
        press.onPressOut();
        nudge.set(withSpring(0, SPRING_POP));
      }}
      pressRetentionOffset={16}
      style={styles.flex}
    >
      <Animated.View
        style={[
          styles.button,
          {
            borderRadius: spec.surface.radius,
            borderWidth: Math.max(1.5, spec.surface.borderWidth),
          },
          state,
          press.style,
        ]}
      >
        <View style={styles.inner}>
          <Animated.View style={glyph} accessibilityElementsHidden importantForAccessibility="no">
            <Glyph button={button} />
          </Animated.View>
          {/* docs/ui/15-theming-and-accessibility.md §10: a key's label stays on one line and shrinks to fit. */}
          <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {DECISION_LABEL[button]}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Which way each glyph leans when its key is pressed. */
const GLYPH_WAY: Record<DecisionButton, { x: number; y: number }> = {
  long: { x: 0.7, y: -0.7 },
  buy: { x: 0.7, y: -0.7 },
  short: { x: 0.7, y: 0.7 },
  'no-trade': { x: 1, y: 0 },
  wait: { x: 1, y: 0 },
};

/** Up and to the right, down and to the right, or flat: the direction without colour. */
function Glyph({ button }: { button: DecisionButton }) {
  const d =
    button === 'long' || button === 'buy'
      ? 'M5 15 15 5M8 5h7v7'
      : button === 'short'
        ? 'M5 5l10 10M15 8v7H8'
        : 'M4 10h12';
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path
        d={d}
        stroke={colors.text}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = themed(() => ({
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  button: {
    flex: 1,
    minHeight: TAP_TARGET + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  text: { ...type.answer, color: colors.text, flexShrink: 1 },
}));
