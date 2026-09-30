import React, { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useProto } from './kit';

/**
 * The frame every prototype screen stands in, whatever the direction.
 *
 * Two of David's critique points are layout rules, and they are kept here so
 * no direction can break them:
 * - "the result box gets overlapped by the Continue button": the reveal has a
 *   slot of its own above the footer, reserved from the first frame, so it
 *   rises into space that was already free and never runs under the button.
 * - "the UI gets squished when there is too much content": nothing is scaled
 *   down. The body is a scroll view that only scrolls when the content really
 *   does not fit (docs/UI.md §2 [v4], W5); the footer stays put under it.
 *
 * `layout` is the thumb-zone comparison of the stage: `thumb` anchors the
 * answers at the bottom of the body, right above the reveal slot and the
 * button (W4); `today` puts them straight under the question, as the app does
 * now.
 */
export function Screen({
  header,
  top,
  answers,
  reveal,
  reserve = 0,
  footer,
  overlay,
  pad = 20,
}: {
  header?: React.ReactNode;
  top?: React.ReactNode;
  answers?: React.ReactNode;
  reveal?: React.ReactNode;
  /** The reveal slot's height, held empty until the reveal arrives. */
  reserve?: number;
  footer?: React.ReactNode;
  /** Something drawn over the bottom edge (Playful's reveal band). */
  overlay?: React.ReactNode;
  pad?: number;
}) {
  const { layout, p, reduced, skin } = useProto();
  // When the reveal arrives and does not fit, the body scrolls by exactly the
  // part that would run under the footer, eased (docs/UI.md §2).
  const scroll = useRef<ScrollView | null>(null);
  const hasReveal = !!reveal || !!overlay;
  useEffect(() => {
    if (!hasReveal) return;
    const id = setTimeout(() => scroll.current?.scrollToEnd({ animated: !reduced }), 60);
    return () => clearTimeout(id);
  }, [hasReveal, reserve, reduced]);
  const spacer = <View style={{ flexGrow: 1, minHeight: 12 }} />;
  return (
    // The mix stands on today's ground (skin.tsx), drawn under the screen.
    <View style={{ flex: 1, backgroundColor: skin ? 'transparent' : p.ground }}>
      {header}
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: pad, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {top}
        {layout === 'thumb' ? spacer : <View style={{ height: 20 }} />}
        {answers}
        {layout === 'today' ? spacer : null}
        <View
          style={{ minHeight: reserve, justifyContent: 'flex-end', marginTop: reserve ? 12 : 0 }}
        >
          {reveal}
        </View>
      </ScrollView>
      {footer}
      {overlay}
    </View>
  );
}

const ACircle = Animated.createAnimatedComponent(Circle);

/** A progress ring whose fill runs on the UI thread (`t` 0..1 × `value`). */
export function Ring({
  size,
  stroke,
  value,
  t,
  color,
  track,
  children,
}: {
  size: number;
  stroke: number;
  value: number;
  t: SharedValue<number>;
  color: string;
  track: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const props = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - value * t.get()),
  }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <ACircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${len} ${len}`}
          strokeLinecap="round"
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}
