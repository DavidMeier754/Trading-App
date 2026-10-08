import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import type { Screen } from '../types';
import type { Grade } from './answers';
import { earnedXp, getProgress, MAX_HEARTS, streakDays, useHearts, useProgress } from '../progress';
import Confetti from './Confetti';
import { celebrateFeedback, tapFeedback } from './feedback';
import { emitMood } from './look';
import { SPRING_POP, useMotion } from './motion';
import { useDisplayFace } from '../fonts';
import { pickWin, refOf, type WinData, type WinDesign } from './wins/data';
import { useRise } from './wins/parts';
import BoardWin from './wins/Board';
import CandleWin from './wins/Candle';
import CurveWin from './wins/Curve';
import QuoteWin from './wins/Quote';
import ReceiptWin from './wins/Receipt';
import RingWin from './wins/Ring';

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 — sub-level complete. Rare tier, so this is where the delight
 * budget goes, and it is choreographed rather than thrown on screen at once:
 * the title arrives, the design plays its piece and lands -- a chord and a
 * heavy pulse, from the same cue table as the rest of the app -- and the
 * breakdown settles in, silently.
 *
 * [DESIGN-REVIEW] "Win screens" (David, 2026-10-04: "i want those win screens
 * to change so there are like 5+ different designs"): six designs take turns,
 * one a finished lesson, so two lessons in a row never end alike: the accuracy
 * ring, a trade receipt, a split-flap board, a candle, an equity curve and a
 * ticker quote (lesson/wins/). Each shows the same numbers and rows. Only a
 * perfect run throws confetti -- candles and coins -- behind the design.
 */
export default function LessonComplete({
  grades,
  levelTitle,
  xp,
  daily = false,
  practice = false,
  gems = 0,
  lessonId = null,
  design,
  subtitle,
  missed = [],
  onPractice,
}: {
  screens: Screen[];
  grades: (Grade | null)[];
  levelTitle: string;
  /** [v4] The lesson's own name (`subtitle`), or where it sits on the path until it has one. */
  subtitle?: string;
  /** [v4] One line for each question missed in the lesson. */
  missed?: string[];
  /** [v4] "Practice these": a round of the missed questions. */
  onPractice?: () => void;
  xp: number;
  /** The lesson counts for the streak: the summary shows where it stands. */
  daily?: boolean;
  /**
   * A practice round (docs/ui/12-practice-and-stats.md §7.3): no XP; the headline holds the answers
   * right, and a row says where the hearts stand -- a finished round gives one back.
   */
  practice?: boolean;
  /** Gems this lesson paid: a bonus lesson's, a chest's (docs/ui/10-path-map.md §7.1, docs/ui/07-lesson-chapter-and-tier-complete.md §5.3). */
  gems?: number;
  lessonId?: string | null;
  /** One design rather than the next in turn: the previews and the Animations page. */
  design?: WinDesign;
}) {
  const hearts = useHearts().hearts;
  const display = useDisplayFace();
  const m = useMotion();
  // docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 (David, 2026-10-04): one lesson a day keeps the streak,
  // so the summary shows the streak, not a count towards a goal.
  const streak = streakDays(useProgress());
  const { width } = useWindowDimensions();
  // The design is settled once, when the summary arrives: the lessons finished
  // so far, replays included, say whose turn it is.
  const [chosen] = useState<WinDesign>(
    () =>
      design ?? pickWin(Object.values(getProgress().plays).reduce((sum, n) => sum + (n ?? 0), 0)),
  );

  const answered = grades.filter((g) => g !== null && g !== undefined) as Grade[];
  const clean = answered.filter((g) => g === 'correct' || g === 'amber').length;
  const total = answered.length;
  const accuracy = total === 0 ? 1 : clean / total;
  const perfect = total > 0 && answered.every((g) => g === 'correct');
  const earned = earnedXp(xp, perfect);

  const data: WinData = {
    title: levelTitle,
    ref: refOf(lessonId),
    practice,
    perfect,
    earned,
    base: xp,
    bonus: earned - xp,
    clean,
    total,
    accuracy,
    gems,
    streak: daily ? streak : null,
    hearts: practice ? hearts : null,
    maxHearts: MAX_HEARTS,
    grades: answered,
  };

  const title = useSharedValue(m.reduced ? 1 : 0);
  const [landed, setLanded] = useState(false);
  // Where the design sits, so the confetti is thrown from it. (Measured, not
  // the window: on a wide screen the app is a phone-width column.)
  const [wrap, setWrap] = useState({ w: 0, h: 0 });
  const [stage, setStage] = useState({ y: 0, h: 0 });

  useEffect(() => {
    if (!m.reduced) title.set(withSpring(1, SPRING_POP));
  }, [m.reduced, title]);

  const land = useCallback(() => {
    celebrateFeedback(perfect);
    emitMood('complete');
    setLanded(true);
  }, [perfect]);

  const titleStyle = useRise(title, m.travel(18));
  // The missed questions are laid out from the start, so nothing moves when
  // they show: they come up once the design has landed.
  const after = useSharedValue(m.reduced ? 1 : 0);
  useEffect(() => {
    if (landed && !m.reduced) after.set(withTiming(1, { duration: 280 }));
  }, [landed, m.reduced, after]);
  const afterStyle = useAnimatedStyle(() => ({ opacity: after.get() }));
  const shownMissed = missed.slice(0, MISSED_ROWS);
  const tone = perfect ? colors.warning : colors.success;
  const props = { data, width: wrap.w || Math.min(width, 440), onLand: land };

  return (
    <View
      style={styles.wrap}
      onLayout={(e: LayoutChangeEvent) =>
        setWrap({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      {/* Behind everything, in the design's band: never across the words. */}
      {landed && !m.reduced && perfect && !practice ? (
        <View pointerEvents="none" style={[styles.confettiBand, { top: stage.y, height: stage.h }]}>
          <Confetti width={wrap.w || width} height={stage.h} pieces={56} gold originY={0.35} />
        </View>
      ) : null}

      <Animated.View style={[styles.textBlock, titleStyle]}>
        <Text style={[styles.kicker, { color: tone }]}>
          {practice ? 'Round complete' : perfect ? 'Perfect run' : 'Lesson done'}
        </Text>
        <Text style={[styles.title, display]}>{levelTitle}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Animated.View>

      <View
        style={styles.stage}
        onLayout={(e: LayoutChangeEvent) =>
          setStage({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })
        }
      >
        {chosen === 'receipt' ? (
          <ReceiptWin {...props} />
        ) : chosen === 'board' ? (
          <BoardWin {...props} />
        ) : chosen === 'candle' ? (
          <CandleWin {...props} />
        ) : chosen === 'curve' ? (
          <CurveWin {...props} />
        ) : chosen === 'quote' ? (
          <QuoteWin {...props} />
        ) : (
          <RingWin {...props} />
        )}
      </View>

      {missed.length > 0 ? (
        <Animated.View style={[styles.missed, afterStyle]}>
          <Text style={styles.missedHead}>
            {`Missed ${missed.length === 1 ? '1 question' : `${missed.length} questions`}`}
          </Text>
          {shownMissed.map((line, i) => (
            <View key={i} style={styles.missedRow}>
              <View style={styles.missedDot} />
              <Text style={styles.missedLine} numberOfLines={1}>
                {line}
              </Text>
            </View>
          ))}
          {missed.length > shownMissed.length ? (
            <Text
              style={styles.missedMore}
            >{`and ${missed.length - shownMissed.length} more`}</Text>
          ) : null}
          {onPractice ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                tapFeedback();
                onPractice();
              }}
              style={({ pressed }) => [styles.practice, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.practiceText}>Practice these</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

/** A long list of misses shows its first rows and a count. */
const MISSED_ROWS = 3;

const styles = themed(() => ({
  wrap: { alignItems: 'center', gap: space.xl, alignSelf: 'stretch' },
  confettiBand: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  textBlock: { alignItems: 'center', gap: space.xs },
  kicker: { ...type.label, textTransform: 'uppercase', letterSpacing: 1.6 },
  title: { ...type.title, color: colors.text, textAlign: 'center' },
  stage: { alignSelf: 'stretch', alignItems: 'center' },
  subtitle: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  missed: {
    alignSelf: 'stretch',
    gap: 6,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  missedHead: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  missedRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  missedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.down },
  missedLine: { ...type.small, color: colors.text, flex: 1 },
  missedMore: { ...type.small, color: colors.textMuted, marginLeft: 16 },
  practice: {
    minHeight: TAP_TARGET,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    marginTop: 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  practiceText: { ...type.answer, color: colors.accent, fontWeight: '700' },
}));
