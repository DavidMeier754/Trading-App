import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Visual from '../components/Visual';
import { copy } from '../format';
import { Arrive } from '../lesson/Celebrate';
import { NOTE_STEPS, noteFeedback, tapFeedback } from '../lesson/feedback';
import { surfaceStyle, tint, useLookSpec } from '../lesson/look';
import { SPRING_POP, useMotion } from '../lesson/motion';
import { colors, radius, space, type } from '../theme';
import type {
  CarouselScreen as Carousel,
  ChecklistRevealScreen as Checklist,
  PathChoiceScreen as PathChoice,
  RecapScreen as Recap,
  StoryScreen as Story,
  VisualScreen as VisualS,
  WalkthroughScreen as Walkthrough,
} from '../types';
import Icon, { IconName } from '../home/icons';
import { Body, Card, ScreenTitle } from './common';

/**
 * A carousel card's `icon` (docs/schema.md), drawn where there is a drawing.
 * The rest still show their label's first letter -- three cards in a row whose
 * labels all began with N all read "N", which is why these came first.
 */
const CARD_ICON: Record<string, IconName> = {
  news: 'news',
  'market-wide': 'globe',
  institution: 'bank',
};

/**
 * The non-question archetypes from docs/UI.md §3 that are not intro / theory /
 * example. `carousel`, `walkthrough` and `branch` count as one screen per card,
 * step or step, so they carry their own internal cursor and only hand the
 * player back control when the last one is done.
 */

/** docs/UI.md §3 `carousel` — 2-4 sibling cards with a "1/3" indicator. */
export function CarouselScreen({
  screen,
  cursor,
  onCursor,
}: {
  screen: Carousel;
  cursor: number;
  onCursor: (n: number) => void;
}) {
  const card = screen.cards[Math.min(cursor, screen.cards.length - 1)];
  return (
    <View style={styles.centered}>
      <Text style={styles.counter}>{`${cursor + 1}/${screen.cards.length}`}</Text>
      {/* Keyed by the cursor: each card slides in from the right as the one
          before it is done, the direction the reading goes. */}
      <Arrive key={cursor} from="right">
        <Card style={styles.carouselCard}>
          <View style={styles.iconBubble}>
            {CARD_ICON[card.icon ?? ''] ? (
              <Icon name={CARD_ICON[card.icon ?? '']} size={22} color={colors.accent} />
            ) : (
              <Text style={styles.iconText}>{(card.label ?? '?').slice(0, 1)}</Text>
            )}
          </View>
          <ScreenTitle>{card.label}</ScreenTitle>
          <Body>{card.text}</Body>
        </Card>
      </Arrive>
      <View style={styles.dots}>
        {screen.cards.map((_, i) => (
          <Pressable
            accessibilityRole="button"
            key={i}
            onPress={() => {
              tapFeedback();
              onCursor(i);
            }}
            hitSlop={8}
            style={[styles.dot, i === cursor && styles.dotOn]}
          />
        ))}
      </View>
    </View>
  );
}

/** docs/UI.md §3 `walkthrough` — one field spotlighted per step. */
export function WalkthroughScreen({
  screen,
  cursor,
  width,
}: {
  screen: Walkthrough;
  cursor: number;
  width: number;
}) {
  const step = screen.steps[Math.min(cursor, screen.steps.length - 1)];
  return (
    <View style={styles.centered}>
      <Text style={styles.counter}>{`${cursor + 1}/${screen.steps.length}`}</Text>
      <Visual
        component={screen.component}
        data={screen.data}
        width={width}
        highlight={{ [step.spotlight]: colors.accent }}
      />
      <View style={styles.spotlightRow}>
        <Text style={styles.spotlightText}>{copy(step.text)}</Text>
      </View>
    </View>
  );
}

/** docs/UI.md §3 `visual` — a component with a one-line caption. */
export function VisualScreen({ screen, width }: { screen: VisualS; width: number }) {
  return (
    <View style={styles.centered}>
      <Visual component={screen.component} data={screen.data} width={width} />
      {screen.caption ? <Text style={styles.caption}>{copy(screen.caption)}</Text> : null}
    </View>
  );
}

/** docs/UI.md §3 `checklist-reveal` — items appear one per tap. */
export function ChecklistRevealScreen({
  screen,
  cursor,
}: {
  screen: Checklist;
  cursor: number;
}) {
  const shown = Math.min(cursor, screen.items.length);
  const done = shown >= screen.items.length;
  return (
    <View style={styles.centered}>
      <ScreenTitle>{screen.title}</ScreenTitle>
      <View style={styles.checklist}>
        {screen.items.map((item, i) => (
          <ChecklistRow key={item} text={item} index={i} shown={i < shown} />
        ))}
      </View>
      {!done ? (
        <Text style={styles.checkHint}>
          {`${shown} of ${screen.items.length} — keep going`}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * One item of a checklist. It is checked off with a pop and a note, and the notes
 * climb the scale item by item, so a list being completed sounds like it.
 */
function ChecklistRow({ text, index, shown }: { text: string; index: number; shown: boolean }) {
  const m = useMotion();
  const v = useSharedValue(shown ? 1 : 0);
  const was = useRef(shown);

  useEffect(() => {
    if (shown && !was.current) {
      noteFeedback(Math.min(NOTE_STEPS - 1, 2 + index));
      v.set(m.reduced ? withTiming(1, { duration: 140 }) : withSpring(1, SPRING_POP));
    } else if (!shown) {
      v.set(0);
    }
    was.current = shown;
  }, [shown, index, m.reduced, v]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + 0.82 * Math.min(1, v.get()),
    transform: [{ translateX: m.reduced ? 0 : -8 * (1 - Math.min(1, v.get())) }],
  }));
  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.55 + 0.45 * v.get() }] }));
  const markStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, v.get() * 1.6) }));

  return (
    <Animated.View style={[styles.checkRow, rowStyle]}>
      <Animated.View style={[styles.checkBox, boxStyle]}>
        <Animated.Text style={[styles.checkMark, markStyle]}>{'✓'}</Animated.Text>
      </Animated.View>
      <Text style={styles.checkText}>{copy(text)}</Text>
    </Animated.View>
  );
}

/**
 * docs/UI.md §3 `story` — a short narrative. It carries its speaker in the copy;
 * there is no character cast to draw (§6.9).
 */
export function StoryScreen({ screen }: { screen: Story }) {
  return (
    <View style={styles.centered}>
      <Card style={styles.storyCard}>
        <Text style={styles.storyText}>{copy(screen.text)}</Text>
      </Card>
    </View>
  );
}

/** docs/UI.md §3 `recap` — 2-4 one-line takeaways. */
/**
 * docs/UI.md §3 `recap` — the end of a level in two to four lines: what it
 * taught, each tagged with the sub-level it came from so it can be found
 * again. It is the closing card of a long level, the one that makes nineteen
 * of them in a chapter feel like a path rather than a pile.
 */
export function RecapScreen({ screen }: { screen: Recap }) {
  const look = useLookSpec();
  return (
    <View style={styles.centered}>
      <Arrive>
        <Text style={[styles.recapKicker, { color: look.accent }]}>Recap</Text>
        <ScreenTitle>{screen.title}</ScreenTitle>
      </Arrive>
      <View style={styles.recapList}>
        {screen.points.map((p, i) => (
          <Arrive key={p.text} delay={160 + i * 110}>
            <View style={[styles.recapRow, surfaceStyle(look)]}>
              <View style={[styles.recapNum, { backgroundColor: tint(look.accent, 0.18) }]}>
                <Text style={[styles.recapNumText, { color: look.accent }]}>{i + 1}</Text>
              </View>
              <Text style={styles.recapText}>{copy(p.text)}</Text>
              {p.level ? <Text style={styles.recapLevel}>{`Level ${p.level}`}</Text> : null}
            </View>
          </Arrive>
        ))}
      </View>
    </View>
  );
}

const PATHS = [
  { id: 'scalping', name: 'Scalping', hold: 'Seconds to minutes', feel: 'Fast, focused, few minutes at a time.' },
  { id: 'day-trading', name: 'Day Trading', hold: 'Minutes to hours', feel: 'One session, flat by the close.' },
  { id: 'swing-trading', name: 'Swing Trading', hold: 'Days to weeks', feel: 'Check in once a day.' },
];

/** docs/UI.md §3 `path-choice` — shown once, after Chapter 1's badge. */
export function PathChoiceScreen({
  value,
  onChange,
}: {
  screen: PathChoice;
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.centered}>
      <ScreenTitle>Pick how you want to trade</ScreenTitle>
      <View style={styles.pathList}>
        {PATHS.map((p) => (
          <Pressable
            accessibilityRole="button"
            key={p.id}
            onPress={() => {
              tapFeedback();
              onChange(p.id);
            }}
            style={[styles.pathCard, value === p.id && styles.pathCardOn]}
          >
            <Text style={styles.pathName}>{p.name}</Text>
            <Text style={styles.pathHold}>{p.hold}</Text>
            <Text style={styles.pathFeel}>{p.feel}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.caption}>You can change this anytime in Settings.</Text>
    </View>
  );
}

/** A local cursor for the screens that count as several. */
export function useCursor(): [number, (n: number) => void] {
  return useState(0);
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', gap: space.lg },
  counter: { ...type.label, color: colors.textMuted, alignSelf: 'center' },
  carouselCard: { gap: space.md, alignItems: 'flex-start' },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { ...type.title, color: colors.accent },
  dots: { flexDirection: 'row', gap: space.sm, alignSelf: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
  },
  dotOn: { backgroundColor: colors.accent, width: 20 },
  spotlightRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  spotlightText: { ...type.body, color: colors.text, flex: 1 },
  caption: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  checklist: { gap: space.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.success,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { ...type.small, color: colors.success },
  checkText: { ...type.body, color: colors.text, flex: 1 },
  checkHint: { ...type.small, color: colors.textFaint },
  storyCard: { gap: space.sm },
  storyText: { ...type.prompt, color: colors.text },
  recapKicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: space.xs },
  recapList: { gap: space.sm },
  recapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  recapNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  recapNumText: { ...type.label, fontWeight: '800' },
  recapText: { ...type.body, color: colors.text, flex: 1 },
  recapLevel: { ...type.small, fontSize: 11, color: colors.textFaint },
  pathList: { gap: space.md },
  pathCard: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.lg,
    gap: 2,
  },
  pathCardOn: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  pathName: { ...type.prompt, color: colors.text },
  pathHold: { ...type.small, color: colors.accent },
  pathFeel: { ...type.small, color: colors.textMuted },
});
