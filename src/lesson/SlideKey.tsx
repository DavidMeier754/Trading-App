import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Path } from 'react-native-svg';

import { colors, space, TAP_TARGET, themed, type } from '../theme';
import { detentFeedback } from './feedback';
import { tint, useLookSpec } from './look';
import { EASE_OUT } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** Room between the knob and the track's edge, and the track's border. */
const PAD = 4;
const BORDER = 1.5;
/** How long a tap's slide home takes, and the trade is placed as it lands. */
const SLIDE_MS = 360;

/**
 * docs/ui/02-lesson-player-layout.md §2 and docs/ui/09-order-tools-and-other-visuals.md §6.7 [DESIGN-REVIEW] "Slide to place the trade" (David's
 * pick of 2026-10-04): on an order ticket (`order-build`) the key that checks
 * it is a track the learner slides a knob along, as a broker's app asks
 * before an order goes in. It clicks at every quarter of the way, and let go
 * past most of it the trade is placed; short of that it slides back and
 * nothing happens. A tap slides it home on its own (§10: every drag has a tap
 * alternative), and so does a screen reader's activation.
 *
 * It takes the key's place and exactly the key's height (Cta), so the screen
 * above does not move when it gives way to "Got it".
 */
export default function SlideKey({
  label,
  disabled,
  onPlace,
}: {
  label: string;
  disabled: boolean;
  onPlace: () => void;
}) {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const height = TAP_TARGET + 4 + spec.cta.edge;
  // Inside the track's border.
  const inner = height - BORDER * 2;
  const knob = inner - PAD * 2;
  const [width, setWidth] = useState(0);
  const [placing, setPlacing] = useState(false);
  const max = Math.max(0, width - BORDER * 2 - knob - PAD * 2);
  const x = useSharedValue(0);
  const start = useSharedValue(0);
  const notch = useSharedValue(0);
  const face = spec.cta.face;
  const off = disabled || placing;

  // Placed once, however it got there.
  const placed = useSharedValue(0);
  const place = useCallback(() => {
    if (placed.get()) return;
    placed.set(1);
    setPlacing(true);
    onPlace();
  }, [onPlace, placed]);

  // A key that was checked and is shown again (a screen come back to) starts at rest.
  useEffect(() => {
    if (!disabled) return;
    x.set(0);
  }, [disabled, x]);

  const slideHome = useCallback(() => {
    if (off || max <= 0) return;
    if (reduced) {
      x.set(max);
      place();
      return;
    }
    detentFeedback();
    x.set(
      withTiming(max, { duration: SLIDE_MS, easing: EASE_OUT }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(place);
      }),
    );
  }, [off, max, reduced, x, place]);

  const pan = Gesture.Pan()
    .enabled(!off && max > 0)
    .activeOffsetX([-6, 6])
    .onBegin(() => {
      start.set(x.get());
      notch.set(0);
    })
    .onUpdate((e) => {
      const next = Math.min(max, Math.max(0, start.get() + e.translationX));
      x.set(next);
      // A click at every quarter of the way.
      const at = Math.floor((next / max) * 4);
      if (at !== notch.get()) {
        notch.set(at);
        scheduleOnRN(detentFeedback);
      }
    })
    .onEnd(() => {
      if (x.get() > max * 0.85) {
        x.set(withTiming(max, { duration: 140 }));
        scheduleOnRN(place);
      } else {
        x.set(reduced ? 0 : withSpring(0, { duration: 380, dampingRatio: 0.75 }));
      }
    });
  const tap = Gesture.Tap()
    .enabled(!off)
    .onEnd(() => {
      scheduleOnRN(slideHome);
    });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const trail = useAnimatedStyle(() => ({ width: x.get() + knob + PAD }));
  const hint = useAnimatedStyle(() => ({
    opacity: max > 0 ? 1 - Math.min(1, x.get() / (max * 0.6)) : 1,
  }));

  // The whole track takes a tap; the knob takes the drag.
  return (
    <GestureDetector gesture={tap}>
      <View
        testID="key"
        // The whole track is the button: a tap anywhere slides it home, and
        // its target is the key's full size.
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Slide to the end, or tap"
        accessibilityState={{ disabled: off }}
        onAccessibilityTap={slideHome}
        style={[
          styles.track,
          { height, borderRadius: spec.cta.radius + PAD / 2 },
          disabled && styles.trackOff,
        ]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.trail,
            { borderRadius: spec.cta.radius, backgroundColor: tint(face, 0.22) },
            trail,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.labelWrap, { paddingLeft: knob + PAD }, hint]}
        >
          <Text
            style={[styles.label, disabled && styles.labelOff]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {label}
          </Text>
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.knob,
              {
                left: PAD,
                width: knob,
                height: knob,
                borderRadius: Math.max(4, spec.cta.radius - PAD / 2),
                backgroundColor: disabled ? colors.surfaceAlt : face,
              },
              knobStyle,
            ]}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M5 12h13M12 6l6 6-6 6"
                stroke={disabled ? colors.textFaint : spec.cta.text}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureDetector>
  );
}

const styles = themed(() => ({
  track: {
    borderWidth: BORDER,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackOff: { borderColor: colors.border },
  trail: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  labelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  label: { ...type.prompt, color: colors.text, letterSpacing: 0.2 },
  labelOff: { color: colors.textFaint },
  knob: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
}));
