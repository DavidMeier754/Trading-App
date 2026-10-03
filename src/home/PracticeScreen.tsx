import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonEntry, nodeOf } from '../content';
import { questionLine } from '../lesson/answerSummary';
import Cta from '../lesson/Cta';
import { tapFeedback } from '../lesson/feedback';
import { TermSheet } from '../lesson/terms';
import { dailyMix, openMistakes, PlayedQuestion, roundLevel, weakSpots } from '../practice';
import { markSkillsSeen, Progress, useProgress } from '../progress';
import { skillChapters, type Skill } from '../skills';
import { colors, radius, space, type, themed } from '../theme';
import Icon from './icons';

type Section = 'mix' | 'skills' | 'mistakes';

/** A round's most questions at once. */
const ROUND_MAX = 8;

/** A lesson's topic as a person reads it: `profit-loss` → "Profit and loss". */
function topicName(tag: string): string {
  const words = tag.replace(/-/g, ' ').replace(/\bloss\b/, 'and loss');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "Level 4 · The Quote Card" for a played question. */
function whereOf(q: PlayedQuestion): string {
  const node = nodeOf(q.entry.id);
  if (!node) return q.entry.title;
  return node.number === null ? node.title : `Level ${node.number} · ${node.title}`;
}

/** A round as a lesson the player can start (src/practice.ts). */
function roundEntry(
  id: string,
  title: string,
  intro: string,
  picks: PlayedQuestion[],
): LessonEntry {
  const { level, keys } = roundLevel(picks, { title, intro });
  return { id, title, subtitle: title, level, practice: { keys } };
}

/**
 * docs/UI.md §7.3 [DESIGN-REVIEW] (David: "a tab to revisit all the skills …
 * and maybe revisit mistakes the user did (make two separate tabs for
 * that)"): Practice has three tabs along its top -- the Daily mix, the Skills
 * collected, and the Mistakes still open. Everything comes from the
 * learner's own record (progress.ts) and the lessons they have finished.
 * Practice never costs a heart; a finished round gives one back.
 */
export default function PracticeScreen({ onStart }: { onStart: (entry: LessonEntry) => void }) {
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const [section, setSection] = useState<Section>('mix');
  const mistakes = useMemo(() => openMistakes(progress), [progress]);
  const anyPlayed = Object.keys(progress.done).length > 0;
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + space.lg }]}>
      <Text style={styles.title} accessibilityRole="header">
        Practice
      </Text>
      <Segments value={section} onChange={setSection} mistakes={mistakes.length} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {section === 'mix' ? (
          <DailyMix progress={progress} played={anyPlayed} onStart={onStart} />
        ) : section === 'skills' ? (
          <Skills progress={progress} />
        ) : (
          <Mistakes list={mistakes} onStart={onStart} />
        )}
      </ScrollView>
    </View>
  );
}

function Segments({
  value,
  onChange,
  mistakes,
}: {
  value: Section;
  onChange: (s: Section) => void;
  mistakes: number;
}) {
  const items: { id: Section; label: string }[] = [
    { id: 'mix', label: 'Daily mix' },
    { id: 'skills', label: 'Skills' },
    { id: 'mistakes', label: mistakes ? `Mistakes · ${mistakes}` : 'Mistakes' },
  ];
  return (
    <View style={styles.segments} accessibilityRole="tablist">
      {items.map((it) => {
        const on = it.id === value;
        return (
          <Pressable
            key={it.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (!on) tapFeedback();
              onChange(it.id);
            }}
            style={[styles.segment, on && styles.segmentOn]}
          >
            <Text style={[styles.segmentText, on && styles.segmentTextOn]} numberOfLines={1}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Nothing to show yet, said plainly, with where it starts. */
function Empty({ icon, line }: { icon: 'practice' | 'book' | 'check'; line: string }) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={32} color={colors.textFaint} />
      <Text style={styles.emptyText}>{line}</Text>
    </View>
  );
}

function DailyMix({
  progress,
  played,
  onStart,
}: {
  progress: Progress;
  played: boolean;
  onStart: (entry: LessonEntry) => void;
}) {
  const { picks } = useMemo(() => dailyMix(progress), [progress]);
  const spots = useMemo(() => weakSpots(progress), [progress]);
  if (!played || picks.length === 0) {
    return (
      <Empty
        icon="practice"
        line="Practice starts after your first lesson: its questions come back here."
      />
    );
  }
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.kicker}>Daily mix</Text>
        <Text
          style={styles.cardTitle}
        >{`${picks.length} questions from what you have played`}</Text>
        <Text style={styles.cardLine}>
          The ones due again first, then your mistakes, then the ones you have not seen for longest.
        </Text>
        <Cta
          label="Start · about 3 min"
          onPress={() =>
            onStart(
              roundEntry(
                'practice-mix',
                'Daily mix',
                'Questions from the lessons you have played. A finished round gives back a heart.',
                picks,
              ),
            )
          }
        />
        <View style={styles.heartLine}>
          <Icon name="heart" size={16} color={colors.down} />
          <Text style={styles.small}>A finished round gives back a heart.</Text>
        </View>
      </View>
      <Text style={styles.section}>Weak spots</Text>
      {spots.length ? (
        spots.map((sp) => (
          <View
            key={sp.tag}
            style={styles.spot}
            accessible
            accessibilityLabel={`${topicName(sp.tag)}: you get it right about ${Math.round(sp.strength * 10)} times in 10`}
          >
            <Text style={styles.spotName}>{topicName(sp.tag)}</Text>
            <View style={styles.spotTrack}>
              <View style={[styles.spotFill, { width: `${Math.max(6, sp.strength * 100)}%` }]} />
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.small}>
          None yet. A topic shows here once you have answered it a few times and missed some.
        </Text>
      )}
    </>
  );
}

function Skills({ progress }: { progress: Progress }) {
  const groups = useMemo(() => skillChapters(progress.path), [progress.path]);
  const [open, setOpen] = useState<string | null>(null);
  // "New" until seen: the marks shown on opening the tab stay for this visit,
  // and leaving the tab counts them as seen.
  const [fresh] = useState(
    () =>
      new Set(
        Object.entries(progress.skills)
          .filter(([, s]) => !s.seen)
          .map(([id]) => id),
      ),
  );
  useEffect(() => () => markSkillsSeen([...fresh]), [fresh]);
  const collected = (sk: Skill) => !!progress.skills[sk.id];
  const any = groups.some((g) => g.skills.some(collected));
  if (!any) {
    return (
      <Empty
        icon="book"
        line="Every word and technique a lesson teaches collects here, by chapter."
      />
    );
  }
  return (
    <>
      {groups.map(({ chapter, skills }) => {
        const have = skills.filter(collected);
        const head = `Chapter ${chapter.number} · ${chapter.title}`;
        if (have.length === 0) {
          return (
            <View key={chapter.number} style={styles.lockedRow}>
              <Icon name="lock" size={16} color={colors.textFaint} />
              <Text style={styles.lockedText} numberOfLines={1}>
                {head}
              </Text>
              <Text style={styles.small}>{`${skills.length} skills`}</Text>
            </View>
          );
        }
        return (
          <View key={chapter.number} style={styles.group}>
            <View style={styles.groupHead}>
              <Text style={styles.section} numberOfLines={1}>
                {head}
              </Text>
              <Text style={styles.small}>{`${have.length}/${skills.length}`}</Text>
            </View>
            <View style={styles.chips}>
              {have.map((sk) => (
                <Pressable
                  key={sk.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${sk.kind === 'term' ? 'Word' : 'Technique'}: ${sk.name}${fresh.has(sk.id) ? ', new' : ''}. ${sk.where}`}
                  onPress={() => {
                    tapFeedback();
                    setOpen(sk.id);
                  }}
                  style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                >
                  <Icon
                    name={sk.kind === 'term' ? 'book' : 'bulb'}
                    size={15}
                    color={colors.accent}
                  />
                  <Text style={styles.chipText} numberOfLines={1}>
                    {sk.name}
                  </Text>
                  {fresh.has(sk.id) ? <View style={styles.newDot} /> : null}
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
      <TermSheet skillId={open} onClose={() => setOpen(null)} closeLabel="Close" />
    </>
  );
}

function Mistakes({
  list,
  onStart,
}: {
  list: (PlayedQuestion & { answer: string })[];
  onStart: (entry: LessonEntry) => void;
}) {
  if (list.length === 0) {
    return (
      <Empty
        icon="check"
        line="No mistakes waiting. A question you miss shows here until you answer it right."
      />
    );
  }
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {`${list.length} ${list.length === 1 ? 'question' : 'questions'} to fix`}
        </Text>
        <Text style={styles.cardLine}>
          {`Answered right in practice, one leaves the list.${list.length > ROUND_MAX ? ` Eight at a time.` : ''}`}
        </Text>
        <Cta
          label="Practice these"
          onPress={() =>
            onStart(
              roundEntry(
                'practice-mistakes',
                'Your mistakes',
                'The questions you missed. No hearts, no timer.',
                list.slice(0, ROUND_MAX),
              ),
            )
          }
        />
      </View>
      {list.map((m) => (
        <View key={m.key} style={styles.mistake}>
          <Text style={styles.where}>{whereOf(m)}</Text>
          <Text style={styles.mistakeLine}>
            {questionLine(m.entry.level.screens[m.screen], 90)}
          </Text>
          {m.answer ? <Text style={styles.said}>{`You said: ${m.answer}`}</Text> : null}
        </View>
      ))}
    </>
  );
}

const styles = themed(() => ({
  wrap: { flex: 1, paddingHorizontal: space.lg, gap: space.md },
  title: { ...type.display, color: colors.text },
  segments: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: space.xs,
  },
  segmentOn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  segmentText: { ...type.label, color: colors.textMuted },
  segmentTextOn: { color: colors.text, fontWeight: '700' },
  body: { gap: space.md, paddingBottom: space.xl * 2 },
  card: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  kicker: { ...type.label, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { ...type.title, color: colors.text },
  cardLine: { ...type.body, color: colors.textMuted, marginBottom: space.xs },
  heartLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    justifyContent: 'center',
  },
  small: { ...type.small, fontSize: 13, color: colors.textMuted },
  section: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flexShrink: 1,
  },
  spot: { gap: 6 },
  spotName: { ...type.body, color: colors.text },
  spotTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  spotFill: { height: 8, borderRadius: 4, backgroundColor: colors.warning },
  empty: {
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.xl * 2,
    paddingHorizontal: space.lg,
  },
  emptyText: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  group: { gap: space.sm },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipPressed: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  chipText: { ...type.body, color: colors.text },
  newDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.down },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  lockedText: { ...type.body, color: colors.textMuted, flex: 1 },
  mistake: {
    gap: 2,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  where: { ...type.small, fontSize: 13, color: colors.textMuted },
  mistakeLine: { ...type.body, color: colors.text },
  said: { ...type.small, fontSize: 13, color: colors.down, fontWeight: '700' },
}));
