import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Cta from '../lesson/Cta';
import { emitMood } from '../lesson/look';
import { usePressFeedback } from '../lesson/motion';
import { useReduceMotion } from '../lesson/useReduceMotion';
import { colors, radius, space, themed, type } from '../theme';
import Icon from './icons';
import { PageHeader, pageStyles, rowStyles, useSlideIn } from './pageParts';
import { SECTIONS, Suggestion, suggestionById, SUGGESTIONS, TAG_TEXT } from './ideas';

/**
 * Settings → Testing → Design suggestions (David, stage LOOK-BRIEF: "add
 * another development page where you show design suggestions like the ones
 * you asked me about"; 2026-10-01: "way more ... be experimental and make them
 * cool ... like the test animations tab so I can click on the suggestion and
 * then I get a preview"). Each idea is a row, grouped by where in the app it
 * would go; a tap plays its preview on a page of its own, drawn with the theme
 * and the design in use. The ideas David was asked about keep their place in
 * or out of the mix, and an idea that moves on its own or breaks another rule
 * of docs/UI.md says so. New ideas are shown here before they go in.
 */

/** Test builds: `#home/suggestions/<id>` opens that preview (Home.openHomeAt). */
let pending: string | null = null;
export function openSuggestionAt(id: string): boolean {
  if (!suggestionById(id)) return false;
  pending = id;
  return true;
}

export default function Suggestions({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const enter = useSlideIn();
  const [shown, setShown] = useState<string | null>(() => {
    const id = pending;
    pending = null;
    return id;
  });

  // Android's back button steps back, as the arrow does.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (shown) setShown(null);
      else onBack();
      return true;
    });
    return () => sub.remove();
  }, [shown, onBack]);

  const suggestion = shown ? suggestionById(shown) : undefined;
  if (suggestion) return <Stage suggestion={suggestion} onClose={() => setShown(null)} />;

  return (
    <Animated.View style={[pageStyles.wrap, enter]}>
      <PageHeader title="Design suggestions" top={insets.top} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[pageStyles.content, { paddingBottom: insets.bottom + space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          {`${SUGGESTIONS.length} ideas for the look. Tap one to see it.`}
        </Text>
        {reduced ? (
          <Text style={styles.intro}>
            Motion is set to Reduced (Settings → Feel), so each one shows where it ends.
          </Text>
        ) : null}
        {SECTIONS.map((section) => {
          const rows = SUGGESTIONS.filter((s) => s.section === section.id);
          return rows.length ? (
            <React.Fragment key={section.id}>
              <Text style={pageStyles.section}>{section.title}</Text>
              {rows.map((s) => (
                <Row key={s.id} suggestion={s} onPress={() => setShown(s.id)} />
              ))}
            </React.Fragment>
          ) : null;
        })}
      </ScrollView>
    </Animated.View>
  );
}

/** One suggestion's row: its icon, title, line and tag, and the play mark. */
function Row({ suggestion, onPress }: { suggestion: Suggestion; onPress: () => void }) {
  const press = usePressFeedback(true, { cue: 'tick' });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${suggestion.title}. ${suggestion.line}${
          suggestion.tag ? ` ${TAG_TEXT[suggestion.tag]}.` : ''
        }`}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={rowStyles.row}
      >
        <View style={rowStyles.rowIcon}>
          <Icon name={suggestion.icon} size={20} color={colors.accent} />
        </View>
        <View style={rowStyles.rowText}>
          <Text style={rowStyles.rowTitle}>{suggestion.title}</Text>
          <Text style={rowStyles.rowSub}>{suggestion.line}</Text>
          {suggestion.tag ? <Tag tag={suggestion.tag} /> : null}
        </View>
        <Icon name="play" size={18} color={colors.textFaint} />
      </Pressable>
    </Animated.View>
  );
}

function Tag({ tag }: { tag: NonNullable<Suggestion['tag']> }) {
  return (
    <View
      style={[
        styles.tag,
        tag === 'in' ? styles.tagIn : tag === 'out' ? styles.tagOut : styles.tagWarn,
      ]}
    >
      <Text
        style={
          tag === 'in' ? styles.tagInText : tag === 'out' ? styles.tagOutText : styles.tagWarnText
        }
        numberOfLines={1}
      >
        {TAG_TEXT[tag]}
      </Text>
    </View>
  );
}

/**
 * One suggestion, full page: its preview in the middle, what it is under it,
 * and a key that plays it again (or puts back what was tried). Every take
 * starts in a quiet room, and leaving leaves it quiet.
 */
function Stage({ suggestion, onClose }: { suggestion: Suggestion; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [take, setTake] = useState(0);
  useEffect(() => {
    emitMood('calm');
  }, [take]);
  useEffect(() => () => emitMood('calm'), []);
  // A preview taller than the room left on a small phone is drawn smaller to
  // fit, rather than cut off.
  const [room, setRoom] = useState(0);
  const [natural, setNatural] = useState(0);
  const scale = room > 0 && natural > room ? room / natural : 1;
  const { Preview } = suggestion;
  return (
    <View style={pageStyles.wrap}>
      <PageHeader title={suggestion.title} top={insets.top} onBack={onClose} lines={2} />
      <View
        key={take}
        style={styles.stage}
        onLayout={(e) => setRoom(e.nativeEvent.layout.height - space.md)}
      >
        <View
          style={[styles.fit, scale < 1 && { transform: [{ scale }] }]}
          onLayout={(e) => setNatural(e.nativeEvent.layout.height)}
        >
          <Preview />
        </View>
      </View>
      <View
        style={[
          styles.about,
          { paddingBottom: suggestion.again ? space.md : insets.bottom + space.lg },
        ]}
      >
        <Text style={styles.aboutLine}>{suggestion.line}</Text>
        {suggestion.note ? <Text style={styles.aboutNote}>{suggestion.note}</Text> : null}
        {suggestion.tag ? <Tag tag={suggestion.tag} /> : null}
      </View>
      {suggestion.again ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
          <Cta label={suggestion.again} cue="tick" onPress={() => setTake((n) => n + 1)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = themed(() => ({
  intro: { ...type.small, color: colors.textMuted },
  tag: {
    alignSelf: 'flex-start',
    marginTop: space.xs,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  tagIn: { backgroundColor: colors.successFill },
  tagInText: { ...type.small, color: colors.successText, fontWeight: '700' },
  tagOut: { borderWidth: 1, borderColor: colors.borderStrong },
  tagOutText: { ...type.small, color: colors.textMuted },
  tagWarn: { backgroundColor: colors.warningTint },
  tagWarnText: { ...type.small, color: colors.warning, fontWeight: '700' },

  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    overflow: 'hidden',
  },
  fit: { alignSelf: 'stretch', alignItems: 'center' },
  about: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.xs },
  aboutLine: { ...type.body, color: colors.text },
  aboutNote: { ...type.small, color: colors.textMuted },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm },
}));
