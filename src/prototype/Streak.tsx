import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import Icon from '../home/icons';
import { cue } from '../lesson/feedback';
import { EASE_OUT } from '../lesson/motion';
import { Flame } from './art';
import { Cta } from './Calm';
import { STREAK } from './data';
import { Row, T, useProto } from './kit';

/**
 * The streak, full screen (David, 2026-09-29: "an animation for every time
 * the streak is lost or advances ... full screen"). It comes after the lesson
 * that met the day's goal, or when the app opens on a lost streak -- always
 * after something the learner did -- and a tap on Continue ends it. Reduced
 * motion shows where it ends.
 */

const NUMBER = { fontSize: 72, lineHeight: 84, fontWeight: '700' as const };

/** A number that rolls to its next value: the old one leaves, the new one comes in. */
function Roll({
  from,
  to,
  at,
  down,
  color,
}: {
  from: number;
  to: number;
  at: number;
  down?: boolean;
  color: string;
}) {
  const { reduced } = useProto();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withDelay(at, withTiming(1, { duration: 420, easing: EASE_OUT })));
  }, [reduced, at, t]);
  const dir = down ? 1 : -1;
  const out = useAnimatedStyle(() => ({
    opacity: 1 - t.get(),
    transform: [{ translateY: dir * NUMBER.lineHeight * 0.7 * t.get() }],
  }));
  const into = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: -dir * NUMBER.lineHeight * 0.7 * (1 - t.get()) }],
  }));
  return (
    <View style={{ height: NUMBER.lineHeight, alignSelf: 'stretch', alignItems: 'center' }}>
      <Animated.View style={[{ position: 'absolute' }, out]}>
        <T v="display" num color={color} style={NUMBER}>
          {String(from)}
        </T>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute' }, into]}>
        <T v="display" num color={color} style={NUMBER}>
          {String(to)}
        </T>
      </Animated.View>
    </View>
  );
}

/** A warm light behind the flame, still. */
function Glow({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        <RadialGradient id="streakGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity="0.32" />
          <Stop offset="0.6" stopColor={color} stopOpacity="0.08" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={size} height={size} fill="url(#streakGlow)" />
    </Svg>
  );
}

/** The streak goes up by a day: the flame lights, the number rolls on, today fills in. */
export function StreakUp() {
  const { p, next, reduced } = useProto();
  const flame = useSharedValue(reduced ? 1 : 0);
  const burst = useSharedValue(reduced ? 1 : 0);
  const today = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    flame.set(withSpring(1, { duration: 700, dampingRatio: 0.55 }));
    burst.set(withDelay(120, withTiming(1, { duration: 900, easing: EASE_OUT })));
    today.set(withDelay(820, withSpring(1, { duration: 450, dampingRatio: 0.6 })));
    const t = setTimeout(() => cue('streak'), 560);
    return () => clearTimeout(t);
  }, [reduced, flame, burst, today]);
  const flameStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, flame.get() * 2),
    transform: [{ scale: 0.4 + 0.6 * flame.get() }, { translateY: 18 * (1 - flame.get()) }],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: burst.get() > 0 && burst.get() < 1 ? 0.6 * (1 - burst.get()) : 0,
    transform: [{ scale: 0.6 + 0.9 * burst.get() }],
  }));
  const todayStyle = useAnimatedStyle(() => ({ transform: [{ scale: today.get() }] }));
  return (
    <View style={{ flex: 1 }}>
      <View
        accessible
        accessibilityLabel={`${STREAK.to} day streak`}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <View style={{ width: 240, height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Glow color="#FF9F1C" size={240} />
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 170,
                height: 170,
                borderRadius: 85,
                borderWidth: 3,
                borderColor: '#FFB02E',
              },
              ring,
            ]}
          />
          <Animated.View style={flameStyle}>
            <Flame size={124} id="up" />
          </Animated.View>
        </View>
        <Roll from={STREAK.from} to={STREAK.to} at={560} color={p.amber} />
        <T v="title">day streak</T>
        <Row gap={10} style={{ marginTop: 22 }}>
          {STREAK.days.map((day, i) => {
            const done = i < STREAK.today;
            const isToday = i === STREAK.today;
            return (
              <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                <T v="caption" color={isToday ? p.text : p.muted}>
                  {day}
                </T>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    borderWidth: done || isToday ? 0 : 1.5,
                    borderColor: p.lineStrong,
                    backgroundColor: done || isToday ? p.surfaceAlt : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done || isToday ? (
                    <Animated.View
                      style={[
                        {
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: '#FF9F1C',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        isToday ? todayStyle : null,
                      ]}
                    >
                      <Icon name="check" size={15} color="#FFFFFF" strokeWidth={3.4} />
                    </Animated.View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Row>
      </View>
      <Cta label="Continue" onPress={next} />
    </View>
  );
}

/**
 * The streak is lost: the flame goes cold and the count drops to nought. A
 * friendly screen, never a guilty one (docs/UI.md §7.2): a new streak starts
 * today.
 */
export function StreakLost() {
  const { p, next, reduced } = useProto();
  const cold = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) cold.set(withDelay(300, withTiming(1, { duration: 700, easing: EASE_OUT })));
  }, [reduced, cold]);
  const lit = useAnimatedStyle(() => ({ opacity: 1 - cold.get() }));
  const out = useAnimatedStyle(() => ({ opacity: cold.get() }));
  const sink = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.14 * cold.get() }, { translateY: 10 * cold.get() }],
  }));
  return (
    <View style={{ flex: 1 }}>
      <View
        accessible
        accessibilityLabel="Streak lost. A new one starts today."
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <View style={{ width: 240, height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, sink]}>
            <Animated.View style={lit}>
              <Flame size={124} id="was" />
            </Animated.View>
            <Animated.View style={[{ position: 'absolute' }, out]}>
              <Flame size={124} lit={false} id="cold" />
            </Animated.View>
          </Animated.View>
        </View>
        <Roll from={STREAK.lost} to={0} at={500} down color={p.muted} />
        <T v="title">Streak lost</T>
        <T v="body" color={p.muted} center>
          A new one starts today.
        </T>
      </View>
      <Cta label="Continue" onPress={next} />
    </View>
  );
}
