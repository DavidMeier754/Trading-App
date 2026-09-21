import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Visual from '../components/Visual';
import { copy } from '../format';
import { selectHaptic } from '../lesson/haptics';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type {
  BadgeScreen as Badge,
  CarouselScreen as Carousel,
  ChecklistRevealScreen as Checklist,
  PathChoiceScreen as PathChoice,
  RecapScreen as Recap,
  StoryScreen as Story,
  TierUpScreen as TierUp,
  VisualScreen as VisualS,
  WalkthroughScreen as Walkthrough,
} from '../types';
import { Body, Card, ScreenTitle } from './common';

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
      <Card style={styles.carouselCard}>
        <View style={styles.iconBubble}>
          <Text style={styles.iconText}>{(card.label ?? '?').slice(0, 1)}</Text>
        </View>
        <ScreenTitle>{card.label}</ScreenTitle>
        <Body>{card.text}</Body>
      </Card>
      <View style={styles.dots}>
        {screen.cards.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => {
              selectHaptic();
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
          <View
            key={item}
            style={[styles.checkRow, i >= shown && styles.checkRowHidden]}
          >
            <View style={styles.checkBox}>
              <Text style={styles.checkMark}>{'✓'}</Text>
            </View>
            <Text style={styles.checkText}>{copy(item)}</Text>
          </View>
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

/** docs/UI.md §3 `story` — a short narrative with a character avatar. */
export function StoryScreen({ screen }: { screen: Story }) {
  const character = screen.character === 'mascot' ? 'foxy' : screen.character;
  return (
    <View style={styles.centered}>
      {/* The character avatar docs/UI.md §3 asks for went with the mascot; the
          story now carries its speaker in the copy alone. */}
      <Card style={styles.storyCard}>
        <Text style={styles.storyText}>{copy(screen.text)}</Text>
      </Card>
    </View>
  );
}

/** docs/UI.md §3 `recap` — 2-4 one-line takeaways. */
export function RecapScreen({ screen }: { screen: Recap }) {
  return (
    <View style={styles.centered}>
      <ScreenTitle>{screen.title}</ScreenTitle>
      <View style={styles.recapList}>
        {screen.points.map((p) => (
          <View key={p.text} style={styles.recapRow}>
            <View style={styles.recapBullet} />
            <Text style={styles.recapText}>{copy(p.text)}</Text>
            {p.level ? <Text style={styles.recapLevel}>{p.level}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** docs/UI.md §3 `badge` — chapter complete. */
export function BadgeScreen({ screen }: { screen: Badge }) {
  return (
    <View style={styles.centered}>
      <View style={styles.badgeRing}>
        <Text style={styles.badgeMark}>{'\u2605'}</Text>
      </View>
      <Text style={styles.bigTitle}>{copy(screen.name)}</Text>
      {screen.unlocks ? (
        <Text style={styles.unlocks}>{`${copy(screen.unlocks)} unlocked`}</Text>
      ) : null}
    </View>
  );
}

/** docs/UI.md §3 `tier-up` — rarer and louder than a badge. */
export function TierUpScreen({ screen }: { screen: TierUp }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.tierKicker}>Tier unlocked</Text>
      <Text style={styles.tierName}>{copy(screen.tier)}</Text>
      <Text style={styles.tierMeans}>{copy(screen.means)}</Text>
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
            key={p.id}
            onPress={() => {
              selectHaptic();
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
  checkRowHidden: { opacity: 0.18 },
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
  recapList: { gap: space.md },
  recapRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  recapBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  recapText: { ...type.body, color: colors.text, flex: 1 },
  recapLevel: { ...type.small, color: colors.textFaint },
  badgeRing: {
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 3,
    borderColor: colors.warning,
    backgroundColor: colors.warningTint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  badgeMark: { fontSize: 56, color: colors.warning },
  bigTitle: { ...type.display, color: colors.text, textAlign: 'center' },
  unlocks: { ...type.body, color: colors.warning, textAlign: 'center' },
  tierKicker: {
    ...type.label,
    color: colors.warning,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  tierName: { ...type.display, fontSize: 34, color: colors.text, textAlign: 'center' },
  tierMeans: { ...type.body, color: colors.textMuted, textAlign: 'center' },
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
