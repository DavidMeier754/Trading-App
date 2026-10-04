import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

import Visual from '../components/Visual';
import type { LessonEntry } from '../content';
import { copy } from '../format';
import ExampleScreen from '../screens/ExampleScreen';
import TheoryScreen from '../screens/TheoryScreen';
import { findTerm, type Skill } from '../skills';
import { colors, radius, space, type, themed } from '../theme';
import { surfaceStyle, useLookSpec } from './look';

/** The widest a card is drawn, as in a lesson on a phone. */
const MAX_W = 420;

/**
 * A skill's info card (docs/ui/12-practice-and-stats.md §7.3, docs/ui/14-glossary-and-copy.md §8): the card of its lesson that
 * taught it, drawn as the lesson drew it. A carousel shows the one card of
 * it that names the term; a walkthrough its component and first line.
 */
export default function SkillCardView({
  skill,
  entry,
}: {
  skill: Skill;
  entry: LessonEntry | undefined;
}) {
  const spec = useLookSpec();
  const { width: windowW } = useWindowDimensions();
  const width = Math.min(windowW, MAX_W) - space.lg * 4;
  const screen = entry && skill.card !== null ? entry.level.screens[skill.card] : undefined;
  if (!screen) {
    return (
      <View style={[styles.card, surfaceStyle(spec)]}>
        <Text style={styles.missing}>
          The card for this one is still being written. Its lesson is {skill.where}.
        </Text>
      </View>
    );
  }
  let body: React.ReactNode;
  switch (screen.type) {
    case 'theory':
      body = <TheoryScreen screen={screen} width={width} />;
      break;
    case 'example':
      body = <ExampleScreen screen={screen} width={width} />;
      break;
    case 'carousel': {
      const card =
        screen.cards.find((c) => findTerm(`${c.label} ${c.text}`, skill.name) !== null) ??
        screen.cards[0];
      body = (
        <View style={styles.gap}>
          <Text style={styles.label}>{copy(card.label)}</Text>
          <Text style={styles.text}>{copy(card.text)}</Text>
        </View>
      );
      break;
    }
    case 'walkthrough':
      body = (
        <View style={styles.gap}>
          <Visual component={screen.component} data={screen.data} width={width} />
          {screen.steps[0] ? <Text style={styles.text}>{copy(screen.steps[0].text)}</Text> : null}
        </View>
      );
      break;
    case 'visual':
      body = (
        <View style={styles.gap}>
          <Visual component={screen.component} data={screen.data} width={width} />
          {screen.caption ? <Text style={styles.text}>{copy(screen.caption)}</Text> : null}
        </View>
      );
      break;
    default:
      body = null;
  }
  return <View style={[styles.card, surfaceStyle(spec)]}>{body}</View>;
}

const styles = themed(() => ({
  card: {
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  gap: { gap: space.sm },
  label: { ...type.title, color: colors.text },
  text: { ...type.body, color: colors.textMuted },
  missing: { ...type.body, color: colors.textMuted },
}));
