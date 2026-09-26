import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  SharedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { detentFeedback, tapFeedback } from '../lesson/feedback';
import { HapticsSetting, setHapticsSetting, useHapticsSetting } from '../lesson/haptics';
import { Look, LOOKS, setLook, useLook } from '../lesson/look';
import { EASE_OUT, SPRING_POP, usePressFeedback } from '../lesson/motion';
import { setSoundEnabled, useSoundEnabled } from '../lesson/sound';
import {
  MotionSetting,
  setMotionSetting,
  useMotionSetting,
  useReduceMotion,
} from '../lesson/useReduceMotion';
import { chaptersFor, PathLevel, PATHS } from '../content';
import {
  choosePath,
  doneToday,
  heartsNow,
  MAX_HEARTS,
  refillHearts,
  resetProgress,
  skipTo,
  streakDays,
  useHearts,
  useProgress,
  waitText,
} from '../progress';
import { colors, radius, space, type } from '../theme';
import Icon from './icons';
import { forgetShownPath } from './LevelNode';
import LookPreview from './LookPreview';
import { pathView, totalXp } from './pathState';

const ORDER = Object.keys(LOOKS) as Look[];
const IS_WEB = Platform.OS === 'web';

/**
 * Settings (docs/UI.md §11.5), opened from Account. The lesson's design is
 * picked by swiping through previews of each one; the rest are the toggles the
 * lesson already reads -- haptics, sound, motion -- starting over, and the
 * test bench.
 */
export default function SettingsScreen({
  width,
  onBack,
  onOpenBench,
}: {
  width: number;
  onBack: () => void;
  onOpenBench: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const haptics = useHapticsSetting();
  const sound = useSoundEnabled();
  const motion = useMotionSetting();

  // Android's back button leaves Settings, as the arrow does, rather than the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // Pushed in from the right, the way a settings page arrives.
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withTiming(1, { duration: 260, easing: EASE_OUT }));
  }, [reduced, t]);
  const enter = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateX: (1 - t.get()) * 28 }],
  }));

  return (
    <Animated.View style={[styles.wrap, enter]}>
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPressIn={tapFeedback}
          onPress={onBack}
          hitSlop={10}
          style={styles.back}
        >
          <Icon name="back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Lesson design</Text>
        <DesignPicker width={width} />

        <Text style={styles.section}>Feel</Text>
        <View style={styles.panel}>
          <Segmented<HapticsSetting>
            label="Haptics"
            value={haptics}
            onChange={setHapticsSetting}
            options={[
              { id: 'strong', text: 'Strong' },
              { id: 'classic', text: 'Classic' },
              { id: 'off', text: 'Off' },
            ]}
          />
          <Segmented<boolean>
            label="Sound"
            value={sound}
            onChange={setSoundEnabled}
            options={[
              { id: true, text: 'On' },
              { id: false, text: 'Off' },
            ]}
          />
          <Segmented<MotionSetting>
            label="Motion"
            value={motion}
            onChange={setMotionSetting}
            options={[
              { id: 'system', text: 'System' },
              { id: 'full', text: 'Full' },
              { id: 'reduced', text: 'Reduced' },
            ]}
          />
        </View>

        <Text style={styles.section}>Your path</Text>
        <PathRow />

        <Text style={styles.section}>Progress</Text>
        <ResetRow />

        <Text style={styles.section}>Testing</Text>
        <HeartsRow />
        <SkipRow />
        <RowButton
          icon="flask"
          title="Every screen type"
          sub="Open the all-screens test level"
          onPress={onOpenBench}
        />
      </ScrollView>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// The design picker
// ---------------------------------------------------------------------------

/**
 * Every look as a lesson in miniature, side by side: swipe left and right to
 * see them, and the one in the middle is named underneath. Picking is a
 * separate press, so a swipe past a design never changes it by accident.
 * docs/UI.md §10 wants a tap alternative to every drag: the arrows either side
 * of the dots step through them too.
 */
function DesignPicker({ width }: { width: number }) {
  const active = useLook();
  const cardW = Math.round(Math.min(210, width * 0.56));
  const gap = space.lg;
  const step = cardW + gap;
  const side = (width - cardW) / 2;

  const scroll = useRef<Animated.ScrollView | null>(null);
  const x = useSharedValue(ORDER.indexOf(active) * step);
  const [focus, setFocus] = useState(ORDER.indexOf(active));

  const scrollTo = useCallback(
    (i: number, animated = true) => {
      const k = Math.max(0, Math.min(ORDER.length - 1, i));
      (scroll.current as unknown as ScrollView | null)?.scrollTo({ x: k * step, animated });
    },
    [step],
  );

  // Open on the look in use.
  const placed = useRef(false);
  const onLayout = () => {
    if (placed.current) return;
    placed.current = true;
    scrollTo(ORDER.indexOf(active), false);
  };

  // Native scroll views snap on their own. A browser's reports no end to a
  // swipe, so there every scroll re-arms a short timer and the row is nudged
  // onto the nearest card once it has been still for a moment.
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleWeb = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      const i = Math.round(x.get() / step);
      if (Math.abs(x.get() - i * step) > 1) scrollTo(i);
    }, 140);
  }, [x, step, scrollTo]);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.set(e.contentOffset.x);
    if (IS_WEB) scheduleOnRN(settleWeb);
  });

  // The name underneath follows the card in the middle as it passes, and the
  // hand feels each one settle into place.
  const onFocus = useCallback((i: number) => {
    setFocus(i);
    detentFeedback();
  }, []);
  useAnimatedReaction(
    () => Math.max(0, Math.min(ORDER.length - 1, Math.round(x.get() / step))),
    (i, prev) => {
      if (prev !== null && i !== prev) scheduleOnRN(onFocus, i);
    },
    [step, onFocus],
  );

  const spec = LOOKS[ORDER[focus]];
  const inUse = ORDER[focus] === active;
  const use = usePressFeedback(!inUse, { cue: 'tick' });

  return (
    <View style={styles.picker}>
      <Animated.ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={onLayout}
        style={{ marginHorizontal: -space.lg }}
        contentContainerStyle={{ paddingHorizontal: side, paddingTop: 12, gap }}
      >
        {ORDER.map((id, i) => (
          <Slot key={id} index={i} x={x} step={step}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${LOOKS[id].name} preview`}
              onPress={() => scrollTo(i)}
            >
              <LookPreview id={id} width={cardW} />
              {id === active ? (
                <View style={styles.inUseTag}>
                  <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />
                  <Text style={styles.inUseText}>In use</Text>
                </View>
              ) : null}
            </Pressable>
          </Slot>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous design"
          onPress={() => scrollTo(focus - 1)}
          hitSlop={10}
          style={[styles.arrow, focus === 0 && styles.arrowOff]}
        >
          <Icon name="back" size={18} color={colors.textMuted} />
        </Pressable>
        <View style={styles.dots}>
          {ORDER.map((id, i) => (
            <View key={id} style={[styles.dot, i === focus && styles.dotOn]} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next design"
          onPress={() => scrollTo(focus + 1)}
          hitSlop={10}
          style={[styles.arrow, focus === ORDER.length - 1 && styles.arrowOff]}
        >
          <Icon name="next" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.lookText}>
        <Text style={styles.lookName}>{spec.name}</Text>
        <Text style={styles.lookBlurb}>{spec.blurb}</Text>
      </View>

      <Animated.View style={use.style}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: inUse }}
          disabled={inUse}
          onPressIn={use.onPressIn}
          onPressOut={use.onPressOut}
          onPress={() => setLook(ORDER[focus])}
          style={[styles.useButton, inUse && styles.useButtonOff]}
        >
          {inUse ? <Icon name="check" size={18} color={colors.success} strokeWidth={3} /> : null}
          <Text style={[styles.useText, inUse && { color: colors.success }]}>
            {inUse ? 'This design is in use' : 'Use this design'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/** A card in the row: full size in the middle, stepping back as it moves aside. */
function Slot({
  index,
  x,
  step,
  children,
}: {
  index: number;
  x: SharedValue<number>;
  step: number;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(x.get() / step - index));
    return { opacity: 1 - 0.5 * d, transform: [{ scale: 1 - 0.09 * d }] };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

function Segmented<T>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; text: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.segRow}>
      <Text style={styles.segLabel}>{label}</Text>
      <View style={styles.seg} accessibilityRole="radiogroup">
        {options.map((option) => {
          const on = option.id === value;
          return (
            <Pressable
              key={option.text}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPressIn={on ? undefined : tapFeedback}
              onPress={() => onChange(option.id)}
              style={[styles.segItem, on && styles.segItemOn]}
            >
              <Text style={[styles.segText, on && styles.segTextOn]}>{option.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function RowButton({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: 'flask';
  title: string;
  sub: string;
  onPress: () => void;
}) {
  const press = usePressFeedback(true, { cue: 'tick' });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={onPress}
        style={styles.row}
      >
        <View style={styles.rowIcon}>
          <Icon name={icon} size={22} color={colors.accent} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSub}>{sub}</Text>
        </View>
        <Icon name="next" size={20} color={colors.textFaint} />
      </Pressable>
    </Animated.View>
  );
}

/**
 * docs/UI.md §11.4: the path chosen after Chapter 1, changeable here. Before
 * Chapter 1 is finished there is nothing to change yet, and it says so.
 */
function PathRow() {
  const progress = useProgress();
  const chosen = progress.path;
  return (
    <View style={styles.panel}>
      {chosen ? (
        <View style={styles.seg} accessibilityRole="radiogroup">
          {PATHS.map((p) => {
            const on = p.id === chosen;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on, disabled: !p.written }}
                disabled={!p.written}
                onPressIn={on ? undefined : tapFeedback}
                onPress={() => choosePath(p.id)}
                style={[styles.segItem, on && styles.segItemOn, !p.written && { opacity: 0.45 }]}
              >
                <Text style={[styles.segText, on && styles.segTextOn]} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <Text style={styles.rowSub}>
        {chosen
          ? 'Day Trading and Swing Trading are being written. What you finish on one path stays when you switch.'
          : 'You choose your path at the end of Chapter 1. It can be changed here after that.'}
      </Text>
    </View>
  );
}

/**
 * Temporary, for testing: jump ahead to any level. Everything before it counts
 * as done, with its XP; the level itself and what comes after are left as they
 * are. Past Chapter 1 the path is set to Scalping, the one that is written.
 */
function SkipRow() {
  const progress = useProgress();
  const [open, setOpen] = useState(false);
  const [landed, setLanded] = useState<string | null>(null);
  const chapters = chaptersFor(progress.path ?? 'scalping');
  const press = usePressFeedback(true, { cue: 'tick' });
  const views = pathView(progress);
  const here = views.find((v) => v.status === 'current');
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.set(withTiming(open ? 1 : 0, { duration: 200, easing: EASE_OUT }));
  }, [open, turn]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${180 * turn.get()}deg` }] }));

  return (
    <View style={styles.skipCard}>
      <Animated.View style={press.style}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          onPress={() => setOpen((o) => !o)}
          style={styles.resetHead}
        >
          <View style={styles.rowIcon}>
            <Icon name="next" size={22} color={colors.accent} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Skip ahead</Text>
            <Text style={styles.rowSub}>
              {landed ??
                (here
                  ? `You are on ${labelOf(here.level)}. Pick a level to jump to.`
                  : 'Pick a level to jump to.')}
            </Text>
          </View>
          <Animated.View style={chevron}>
            <Icon name="chevron-down" size={20} color={colors.textMuted} strokeWidth={2.4} />
          </Animated.View>
        </Pressable>
      </Animated.View>
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.skipList}>
          {chapters.map((chapter) => (
            <View key={chapter.number} style={styles.skipChapter}>
              <Text
                style={styles.skipChapterTitle}
              >{`Chapter ${chapter.number} · ${chapter.title}`}</Text>
              {chapter.levels.map((level) => {
                const view = views.find((v) => v.level.key === level.key);
                const status = view?.status ?? 'locked';
                return (
                  <Pressable
                    key={level.key}
                    accessibilityRole="button"
                    accessibilityLabel={`Skip to ${labelOf(level)}: ${level.title}`}
                    onPressIn={tapFeedback}
                    onPress={() => {
                      skipTo(level.key);
                      forgetShownPath();
                      setLanded(
                        `Jumped to ${labelOf(level)}. Everything before it counts as done.`,
                      );
                      setOpen(false);
                    }}
                    style={({ pressed }) => [styles.skipItem, pressed && styles.skipItemPressed]}
                  >
                    <Text style={styles.skipNum}>
                      {level.kind === 'path' ? '→' : String(level.number)}
                    </Text>
                    <Text style={styles.skipTitle} numberOfLines={1}>
                      {level.title}
                    </Text>
                    <Text
                      style={[
                        styles.skipState,
                        status === 'complete' && { color: colors.success },
                        status === 'current' && { color: colors.accent },
                      ]}
                    >
                      {status === 'complete' ? 'Done' : status === 'current' ? 'Here' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

/** "Level 4", "Checkpoint 5", "the path choice" -- a level named in a sentence. */
function labelOf(level: PathLevel): string {
  if (level.kind === 'path') return 'the path choice';
  const where = level.chapter > 1 ? `Chapter ${level.chapter}, ` : '';
  return `${where}Level ${level.number}`;
}

/**
 * Temporary, while hearts are being tried out: every heart back in one tap,
 * without waiting out the four hours. Goes when the refill rules settle.
 */
function HeartsRow() {
  const { hearts, nextAt } = useHearts();
  const full = hearts >= MAX_HEARTS;
  const press = usePressFeedback(!full, { cue: 'tick' });
  const pop = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: full }}
        disabled={full}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={() => {
          refillHearts();
          pop.set(
            withSequence(
              withTiming(1.3, { duration: 120, easing: EASE_OUT }),
              withSpring(1, SPRING_POP),
            ),
          );
        }}
        style={styles.row}
      >
        <Animated.View style={[styles.rowIcon, { backgroundColor: colors.downTint }, popStyle]}>
          <Icon name="heart" size={22} color={colors.down} />
        </Animated.View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, full && { color: colors.textMuted }]}>Refill hearts</Text>
          <Text style={styles.rowSub}>
            {full
              ? `All ${MAX_HEARTS} hearts are here. Temporary, for testing.`
              : `${hearts} of ${MAX_HEARTS}${nextAt ? ` · next one in ${waitText(nextAt)}` : ''}. Tap to fill them now.`}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Starting over. The row says what there is to lose; a press asks once more,
 * in words, with the way out beside the way through -- so a stray tap never
 * wipes the path. The settings on this page are not progress and stay.
 */
function ResetRow() {
  const progress = useProgress();
  const lessons = Object.keys(progress.done).length;
  const xp = totalXp(progress);
  const streak = streakDays(progress);
  const hearts = heartsNow(progress).hearts;
  const empty = lessons === 0 && streak === 0 && doneToday(progress) === 0 && hearts === MAX_HEARTS;
  const [stage, setStage] = useState<'idle' | 'confirm' | 'done'>('idle');
  const press = usePressFeedback(!empty && stage === 'idle', { cue: 'tick' });

  const had = [
    `${lessons} ${lessons === 1 ? 'lesson' : 'lessons'} done`,
    `${xp} XP`,
    streak > 0 ? `${streak}-day streak` : null,
    hearts < MAX_HEARTS ? `${hearts} of ${MAX_HEARTS} hearts` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const cleared = [
    lessons > 0 ? `${lessons} finished ${lessons === 1 ? 'lesson' : 'lessons'}` : null,
    xp > 0 ? `${xp} XP` : null,
    streak > 0 ? `your ${streak}-day streak` : null,
  ]
    .filter(Boolean)
    .join(', ')
    .replace(/, ([^,]*)$/, ' and $1');
  const refill = hearts < MAX_HEARTS ? 'refills your hearts' : null;
  const lost = cleared
    ? `This clears ${cleared}${refill ? ` and ${refill}` : ''}.`
    : `This ${refill ?? 'starts the path again'}.`;

  const reset = () => {
    resetProgress();
    forgetShownPath();
    setStage('done');
  };

  const confirming = stage === 'confirm';
  return (
    <Animated.View style={[styles.resetCard, confirming && styles.resetCardArmed, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: empty || confirming }}
        disabled={empty || confirming}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={() => setStage('confirm')}
        style={styles.resetHead}
      >
        <View
          style={[styles.rowIcon, { backgroundColor: empty ? colors.surfaceAlt : colors.downTint }]}
        >
          <Icon name="reset" size={22} color={empty ? colors.textFaint : colors.down} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: empty ? colors.textMuted : colors.down }]}>
            {confirming ? 'Start over from Level 1?' : 'Reset progress'}
          </Text>
          <Text style={styles.rowSub}>
            {confirming
              ? `${lost} Your settings stay.`
              : stage === 'done'
                ? 'Progress reset. The path starts again at Level 1.'
                : empty
                  ? 'Nothing to reset yet.'
                  : had}
          </Text>
        </View>
      </Pressable>
      {confirming ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.confirmRow}>
          <Pressable
            accessibilityRole="button"
            onPressIn={tapFeedback}
            onPress={() => setStage('idle')}
            style={[styles.confirmButton, styles.keepButton]}
          >
            <Text style={styles.keepText}>Keep progress</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPressIn={tapFeedback}
            onPress={reset}
            style={[styles.confirmButton, styles.resetButton]}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -space.sm,
  },
  title: { ...type.title, color: colors.text },
  content: { paddingHorizontal: space.lg, gap: space.md },
  section: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: space.md,
  },

  picker: { gap: space.md },
  // On the card's top edge, over its border, clear of the preview inside.
  inUseTag: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  inUseText: { ...type.small, fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  pagerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrowOff: { opacity: 0.35 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt },
  dotOn: { width: 16, backgroundColor: colors.accent },
  lookText: { alignItems: 'center', gap: 2, minHeight: 46 },
  lookName: { ...type.prompt, color: colors.text },
  lookBlurb: { ...type.small, color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
  useButton: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  useButtonOff: {
    backgroundColor: colors.successTint,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  useText: { ...type.prompt, fontSize: 17, color: '#FFFFFF' },

  panel: {
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  segRow: { gap: 6 },
  segLabel: { ...type.label, color: colors.textMuted },
  seg: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  segItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segItemOn: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.accent },
  segText: { ...type.label, color: colors.textMuted },
  segTextOn: { color: colors.text },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },

  skipCard: {
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  skipList: { paddingHorizontal: space.md, paddingBottom: space.md, gap: space.md },
  skipChapter: { gap: 2 },
  skipChapterTitle: {
    ...type.small,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.xs,
    marginLeft: space.sm,
  },
  skipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 44,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  skipItemPressed: { backgroundColor: colors.surfaceAlt },
  skipNum: {
    ...type.label,
    color: colors.textFaint,
    width: 22,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  skipTitle: { ...type.answer, color: colors.text, flex: 1 },
  skipState: { ...type.small, color: colors.textFaint, width: 40, textAlign: 'right' },
  resetCard: {
    backgroundColor: colors.surface,
    borderColor: '#3A4553',
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  resetCardArmed: { borderColor: colors.down },
  resetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 60,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  confirmButton: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButton: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: '#3A4553' },
  keepText: { ...type.prompt, fontSize: 16, color: colors.text },
  resetButton: { backgroundColor: colors.down },
  resetText: { ...type.prompt, fontSize: 16, color: '#FFFFFF' },
  rowTitle: { ...type.answer, color: colors.text, fontWeight: '700' },
  rowSub: { ...type.small, color: colors.textMuted },
});
