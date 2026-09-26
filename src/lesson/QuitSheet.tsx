import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, radius, space, TAP_TARGET, type } from '../theme';
import { tapFeedback } from './feedback';
import { EASE_OUT, SPRING_POP, usePressFeedback } from './motion';
import { useReduceMotion } from './useReduceMotion';

/** Programmatic open: settles without overshoot, since no finger threw it. */
const SPRING_OPEN = { duration: 360, dampingRatio: 1 } as const;
const CLOSE_MS = 240;
/** A flick this fast (pt/s) dismisses however little it travelled. */
const FLICK = 600;

/**
 * The close ✕ in the lesson's top bar. It answers the thumb on press-in -- it
 * dips -- and turns a quarter while the sheet it opened is up, turning back
 * when the learner stays. The glyph is drawn, not typed, so it turns about its
 * true centre in every font.
 */
export function QuitButton({ open, onPress }: { open: boolean; onPress: () => void }) {
  const reduced = useReduceMotion();
  const turn = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    if (reduced) turn.set(0);
    else turn.set(withTiming(open ? 1 : 0, { duration: 340, easing: EASE_OUT }));
  }, [open, reduced, turn]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${90 * turn.get()}deg` }, { scale: 1 - 0.2 * pressed.get() }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close lesson"
      onPressIn={() => {
        tapFeedback();
        if (!reduced) pressed.set(withTiming(1, { duration: 100, easing: EASE_OUT }));
      }}
      onPressOut={() => {
        if (!reduced) pressed.set(withSpring(0, SPRING_POP));
      }}
      onPress={onPress}
      hitSlop={12}
      style={styles.close}
    >
      <Animated.View style={style}>
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Path
            d="M3.5 3.5l11 11M14.5 3.5l-11 11"
            stroke={colors.textMuted}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

/**
 * docs/UI.md §2: close ✕ opens "Quit lesson? Progress in this sub-level is lost."
 *
 * A sheet inside the lesson's own frame rather than a system modal: it rises
 * from the bottom edge over a scrim that darkens as it comes, and goes back the
 * way it came. It can be pulled down to stay, and a flick is enough -- velocity
 * or distance, whichever comes first. Pulled up, it resists. Under reduced
 * motion it fades in and out in place.
 */
export default function QuitSheet({
  visible,
  onCancel,
  onQuit,
}: {
  visible: boolean;
  onCancel: () => void;
  onQuit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const [mounted, setMounted] = useState(visible);
  // 0 hidden, 1 shown: the scrim, and the whole sheet under reduced motion.
  const alpha = useSharedValue(0);
  // How far the sheet sits below its open position, in points.
  const y = useSharedValue(0);
  const h = useSharedValue(340);

  const unmount = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (reduced) {
        y.set(0);
      } else {
        y.set(h.get());
        y.set(withSpring(0, SPRING_OPEN));
      }
      alpha.set(withTiming(1, { duration: 220, easing: EASE_OUT }));
      return;
    }
    // Back the way it came, in the time the distance left needs: a sheet
    // already pulled most of the way down does not crawl the rest.
    const left = reduced ? 1 : Math.max(0, 1 - y.get() / h.get());
    if (!reduced) y.set(withTiming(h.get(), { duration: 80 + CLOSE_MS * left, easing: EASE_OUT }));
    alpha.set(
      withTiming(0, { duration: 80 + CLOSE_MS * left, easing: EASE_OUT }, (done) => {
        if (done) scheduleOnRN(unmount);
      }),
    );
  }, [visible, reduced, alpha, y, h, unmount]);

  const onLayout = (e: LayoutChangeEvent) => h.set(e.nativeEvent.layout.height);

  const pan = Gesture.Pan()
    .enabled(visible && !reduced)
    .onUpdate((e) => {
      // Down follows the finger; up gives a little and then holds.
      const dy = e.translationY;
      y.set(dy >= 0 ? dy : -Math.sqrt(-dy) * 2);
    })
    .onEnd((e) => {
      if (e.velocityY > FLICK || y.get() > h.get() * 0.35) {
        scheduleOnRN(onCancel);
      } else {
        y.set(withSpring(0, { duration: 400, dampingRatio: 0.8, velocity: e.velocityY }));
      }
    });

  const scrim = useAnimatedStyle(() => ({
    opacity: alpha.get() * Math.min(1, Math.max(0, 1 - y.get() / h.get())),
  }));
  const sheet = useAnimatedStyle(() => ({
    opacity: reduced ? alpha.get() : 1,
    transform: [{ translateY: y.get() }],
  }));

  const quit = usePressFeedback(visible, { cue: 'tick' });
  const stay = usePressFeedback(visible, { cue: 'tick' });

  if (!mounted) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrim]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Keep learning"
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
        />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View
          onLayout={onLayout}
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }, sheet]}
        >
          <View style={styles.grabber} />
          <Text style={styles.title} accessibilityRole="header">
            Quit lesson?
          </Text>
          <Text style={styles.body}>Progress in this sub-level is lost.</Text>
          <Animated.View style={quit.style}>
            <Pressable
              accessibilityRole="button"
              onPressIn={quit.onPressIn}
              onPressOut={quit.onPressOut}
              onPress={onQuit}
              style={styles.quit}
            >
              <Text style={styles.quitText}>Quit</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={stay.style}>
            <Pressable
              accessibilityRole="button"
              onPressIn={stay.onPressIn}
              onPressOut={stay.onPressOut}
              onPress={onCancel}
              style={styles.stay}
            >
              <Text style={styles.stayText}>Keep learning</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  scrim: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    gap: space.md,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
    marginBottom: space.sm,
  },
  title: { ...type.title, color: colors.text },
  body: { ...type.body, color: colors.textMuted },
  quit: {
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    backgroundColor: colors.down,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitText: { ...type.answer, color: colors.text },
  stay: {
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayText: { ...type.answer, color: colors.accent },
});
