import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Visual from '../components/Visual';
import { copy } from '../format';
import { Arrive } from '../lesson/Celebrate';
import { NOTE_STEPS, noteFeedback, tapFeedback } from '../lesson/feedback';
import { surfaceStyle, tint, useLookSpec } from '../lesson/look';
import { SPRING_POP, useMotion } from '../lesson/motion';
import { colors, radius, space, TAP_TARGET, type, themed } from '../theme';
import type {
  CarouselScreen as Carousel,
  ChecklistRevealScreen as Checklist,
  PathChoiceScreen as PathChoice,
  RecapScreen as Recap,
  StoryScreen as Story,
  VisualScreen as VisualS,
  WalkthroughScreen as Walkthrough,
} from '../types';
import Icon, { IconName, isIconName } from '../home/icons';
import { market, PATHS, TradingPath } from '../content';
import { toggleWanted, useProgress } from '../progress';
import { Body, Card, ScreenTitle, Stack } from './common';
import { TermText } from '../lesson/termText';
import Sparkline from '../components/Sparkline';

/**
 * A carousel card's `icon` (docs/level-files/): every name the content uses is in
 * the mapping table (home/symbols.tsx), and the validator rejects any other.
 * A card without one shows its label's first letter.
 */
function cardIcon(name: string | undefined): IconName | null {
  return name && isIconName(name) ? name : null;
}

/**
 * The non-question archetypes from docs/ui/03-screen-types.md §3 that are not intro / theory /
 * example. `carousel`, `walkthrough` and `branch` count as one screen per card,
 * step or step, so they carry their own internal cursor and only hand the
 * player back control when the last one is done.
 */

/** docs/ui/03-screen-types.md §3 `carousel` — 2-4 sibling cards with a "1/3" indicator. */
export function CarouselScreen({
  screen,
  cursor,
  onCursor,
}: {
  screen: Carousel;
  cursor: number;
  onCursor: (n: number) => void;
}) {
  const at = Math.min(cursor, screen.cards.length - 1);
  const face = (card: Carousel['cards'][number]) => (
    <Card style={styles.carouselCard}>
      <View style={styles.iconBubble}>
        {cardIcon(card.icon) ? (
          <Icon name={cardIcon(card.icon)!} size={22} color={colors.accent} />
        ) : (
          <Text style={styles.iconText}>{(card.label ?? '?').slice(0, 1)}</Text>
        )}
      </View>
      <ScreenTitle>{card.label}</ScreenTitle>
      <Body>{card.text}</Body>
    </Card>
  );
  return (
    <View style={styles.centered}>
      {/* The dots below say where you are; a "1/3" above said it twice. Every
          card takes the height of the tallest, so the dots and everything
          else hold still as the cards change. Keyed by the cursor: each card
          slides in from the right, the direction the reading goes. */}
      <Stack
        current={at}
        items={screen.cards.map((card) => face(card))}
        shown={
          <Arrive key={at} from="right">
            {face(screen.cards[at])}
          </Arrive>
        }
      />
      <View style={styles.dots}>
        {/* Each dot has a slot as wide as the lit one, so lighting the next
            dot does not slide the others sideways. */}
        {screen.cards.map((_, i) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Card ${i + 1} of ${screen.cards.length}`}
            key={i}
            onPress={() => {
              tapFeedback();
              onCursor(i);
            }}
            style={styles.dotSlot}
          >
            <View style={[styles.dot, i === cursor && styles.dotOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** docs/ui/03-screen-types.md §3 `walkthrough` — one field spotlighted per step. */
export function WalkthroughScreen({
  screen,
  cursor,
  width,
}: {
  screen: Walkthrough;
  cursor: number;
  width: number;
}) {
  const at = Math.min(cursor, screen.steps.length - 1);
  const step = screen.steps[at];
  const line = (text: string) => (
    <View style={styles.spotlightRow}>
      <Text style={styles.spotlightText}>{copy(text)}</Text>
    </View>
  );
  return (
    <View style={styles.centered}>
      <Text style={styles.counter}>{`${at + 1}/${screen.steps.length}`}</Text>
      {/* docs/ui/03-screen-types.md §3: the spotlighted field is lit and the rest of the
          component steps back, so the eye goes straight to it. */}
      <Visual
        component={screen.component}
        data={screen.data}
        width={width}
        highlight={{ [step.spotlight]: colors.accent }}
        focus={step.spotlight}
      />
      {/* As tall as the longest step's text, so the next step's shorter or
          longer line moves nothing. */}
      <Stack current={at} items={screen.steps.map((s) => line(s.text))} />
    </View>
  );
}

/** docs/ui/03-screen-types.md §3 `visual` — a component with a one-line caption. */
export function VisualScreen({ screen, width }: { screen: VisualS; width: number }) {
  return (
    <View style={styles.centered}>
      <Visual component={screen.component} data={screen.data} width={width} />
      {screen.caption ? <Text style={styles.caption}>{copy(screen.caption)}</Text> : null}
    </View>
  );
}

/** docs/ui/03-screen-types.md §3 `checklist-reveal` — items appear one per tap. */
export function ChecklistRevealScreen({
  screen,
  cursor,
  onNext,
}: {
  screen: Checklist;
  cursor: number;
  /** Ticks the next item, as the button does: the list itself is tappable. */
  onNext: () => void;
}) {
  const shown = Math.min(cursor, screen.items.length);
  const done = shown >= screen.items.length;
  return (
    <View style={styles.centered}>
      <ScreenTitle>{screen.title}</ScreenTitle>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={done ? undefined : 'Tick the next item'}
        disabled={done}
        onPress={onNext}
        style={styles.checklist}
      >
        {screen.items.map((item, i) => (
          <ChecklistRow key={item} text={item} index={i} shown={i < shown} />
        ))}
      </Pressable>
      {/* Kept in the layout once the list is done, only emptied, so the last
          tick does not pull anything up. */}
      <Text style={styles.checkHint}>
        {done ? ' ' : `${shown} of ${screen.items.length} — tap the list or the button`}
      </Text>
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

  // The row brightens in place; it used to slide in from the left, and a line
  // that moves as it is revealed is one more thing moving on the screen.
  const rowStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + 0.55 * Math.min(1, v.get()),
  }));
  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.55 + 0.45 * v.get() }] }));
  const markStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, v.get() * 1.6) }));

  return (
    <Animated.View style={[styles.checkRow, rowStyle]}>
      <Animated.View style={[styles.checkBox, boxStyle]}>
        <Animated.Text style={[styles.checkMark, markStyle]}>{'✓'}</Animated.Text>
      </Animated.View>
      {/* Not yet ticked, the item is a bar where its words will be: the same
          text laid out in the same space, only not readable yet -- so the list
          keeps its height and the next item is not given away early. */}
      <Text aria-hidden={!shown} style={[styles.checkText, !shown && styles.checkTextHidden]}>
        {copy(text)}
      </Text>
    </Animated.View>
  );
}

/**
 * docs/ui/03-screen-types.md §3 `story` — a short narrative. It carries its speaker in the copy;
 * there is no character cast to draw (§6.9). A lesson's closing story
 * (`label: takeaway`) is marked as the takeaway; a scene with `alert` reads as
 * a market alert (StoryAlertCard).
 */
export function StoryScreen({ screen }: { screen: Story }) {
  const look = useLookSpec();
  if (screen.alert && screen.label !== 'takeaway') {
    return (
      <View style={styles.centered}>
        <StoryAlertCard screen={screen} alert={screen.alert} />
      </View>
    );
  }
  const takeaway = screen.label === 'takeaway';
  // A scene, not a statement to judge: a kicker and an accent edge set it apart
  // from the true/false card it would otherwise look exactly like.
  return (
    <View style={styles.centered}>
      <Card style={StyleSheet.flatten([styles.storyCard, { borderLeftColor: look.accent }])}>
        <View style={styles.storyKick}>
          <Icon name={takeaway ? 'bulb' : 'clock'} size={14} color={look.accent} />
          <Text style={[styles.storyKickText, { color: look.accent }]}>
            {takeaway ? 'Takeaway' : 'The scene'}
          </Text>
        </View>
        <TermText text={screen.text} style={styles.storyText} />
      </Card>
    </View>
  );
}

/**
 * docs/ui/03-screen-types.md §3 `story` [DESIGN-REVIEW] (David approved the alert on
 * 2026-10-03): a scene that arrives the way a trader meets it, as a market
 * alert -- a bell, the ticker and the time in the head row, the sentence, a
 * small sparkline of the move so far, and up to three facts as chips. Nothing
 * on it moves but the bell, once, as the card arrives.
 */
function StoryAlertCard({ screen, alert }: { screen: Story; alert: NonNullable<Story['alert']> }) {
  const look = useLookSpec();
  const [w, setW] = useState(0);
  return (
    <Card style={StyleSheet.flatten([styles.storyCard, { borderLeftColor: look.accent }])}>
      <View
        style={styles.alertHead}
        accessible
        accessibilityLabel={`Alert: ${alert.ticker}${alert.time ? `, ${copy(alert.time)}` : ''}`}
      >
        <BellRing color={look.accent} />
        <Text style={styles.alertTicker}>{alert.ticker}</Text>
        {alert.time ? <Text style={styles.alertTime}>{copy(alert.time)}</Text> : null}
      </View>
      <TermText text={screen.text} style={styles.storyText} />
      {alert.spark?.length ? (
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={styles.alertSpark}>
          {w > 0 ? <Sparkline values={alert.spark} width={w} height={44} /> : null}
        </View>
      ) : null}
      {alert.facts?.length ? (
        <View style={styles.alertFacts}>
          {alert.facts.map((f) => (
            <View key={f} style={styles.alertFact}>
              <Text style={styles.alertFactText}>{copy(f)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

/** The alert's bell: it swings once as the card arrives, and is still after. */
function BellRing({ color }: { color: string }) {
  const m = useMotion();
  const swing = useSharedValue(0);
  useEffect(() => {
    if (m.reduced) return;
    swing.set(
      withDelay(
        220,
        withSequence(
          withTiming(1, { duration: 90 }),
          withTiming(-0.7, { duration: 120 }),
          withTiming(0.35, { duration: 110 }),
          withSpring(0, SPRING_POP),
        ),
      ),
    );
  }, [m.reduced, swing]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swing.get() * 16}deg` }],
  }));
  return (
    <Animated.View style={style}>
      <Icon name="bell" size={16} color={color} />
    </Animated.View>
  );
}

/** docs/ui/03-screen-types.md §3 `recap` — 2-4 one-line takeaways. */
/**
 * docs/ui/03-screen-types.md §3 `recap` — the end of a level in two to four lines: what it
 * taught, each tagged with the sub-level it came from so it can be found
 * again. It is the closing card of a long level, the one that makes nineteen
 * of them in a chapter feel like a path rather than a pile.
 */
export function RecapScreen({
  screen,
  source,
}: {
  screen: Recap;
  /** The card a takeaway came from, to open under it (docs/ui/03-screen-types.md §3). */
  source?: (point: Recap['points'][number]) => { title?: string; body: string } | null;
}) {
  const look = useLookSpec();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View style={styles.centered}>
      <Arrive>
        <Text style={[styles.recapKicker, { color: look.accent }]}>Recap</Text>
        <ScreenTitle>{screen.title}</ScreenTitle>
      </Arrive>
      <View style={styles.recapList}>
        {screen.points.map((p, i) => (
          <Arrive key={p.text} delay={160 + i * 110}>
            {(() => {
              const card = p.level && source ? source(p) : null;
              const isOpen = open === i && !!card;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen, disabled: !card }}
                  disabled={!card}
                  onPress={() => {
                    tapFeedback();
                    setOpen(isOpen ? null : i);
                  }}
                  style={[
                    styles.recapRow,
                    surfaceStyle(look),
                    isOpen && { borderColor: look.accent },
                  ]}
                >
                  <View style={styles.recapHead}>
                    <View style={[styles.recapNum, { backgroundColor: tint(look.accent, 0.18) }]}>
                      <Text style={[styles.recapNumText, { color: look.accent }]}>{i + 1}</Text>
                    </View>
                    <Text style={styles.recapText}>{copy(p.text)}</Text>
                    {p.level ? <Text style={styles.recapLevel}>{`Level ${p.level}`}</Text> : null}
                  </View>
                  {/* The card it came from, re-opened under it. */}
                  {isOpen && card ? (
                    <View style={[styles.recapCard, { borderLeftColor: look.accent }]}>
                      {card.title ? (
                        <Text style={styles.recapCardTitle}>{copy(card.title)}</Text>
                      ) : null}
                      <Text style={styles.recapCardBody}>{copy(card.body)}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })()}
          </Arrive>
        ))}
      </View>
    </View>
  );
}

/**
 * The three paths as the learner meets them (docs/ui/03-screen-types.md §3 `path-choice`):
 * holding period, screen time and the feel of it. The screen-time figures are
 * Level 14-1's own rough ones, so the choice repeats what was just taught.
 */
export const PATH_CARDS: {
  id: TradingPath;
  icon: IconName;
  hold: string;
  screen: string;
  feel: string;
}[] = [
  {
    id: 'scalping',
    icon: 'bolt',
    hold: 'Seconds to minutes',
    screen: '~90 min a day',
    feel: '1-minute charts. Many small, fast trades, all attention while it runs.',
  },
  {
    id: 'day-trading',
    icon: 'clock',
    hold: 'Minutes to hours',
    screen: '~60 min a day',
    feel: '5- and 15-minute charts. A few trades, flat by the close.',
  },
  {
    id: 'swing-trading',
    icon: 'calendar',
    hold: 'Days to weeks',
    screen: '~15 min a day',
    feel: 'Daily charts. Check in once a day, hold through the nights.',
  },
];

/**
 * docs/ui/03-screen-types.md §3 `path-choice`, played as its own level after Chapter 1. One
 * card per path; a path whose chapters are not written yet says so and cannot
 * be picked, rather than leading to an empty map.
 */
export function PathChoiceScreen({
  value,
  onChange,
}: {
  screen: PathChoice;
  value: string | null;
  onChange: (id: string) => void;
}) {
  const look = useLookSpec();
  return (
    <View style={styles.centered}>
      <View style={styles.pathHead}>
        <ScreenTitle>Choose your path</ScreenTitle>
        <Body>
          Chapter 1 was the same for everyone. From Chapter 2 on, the lessons follow how you want to
          trade.
        </Body>
      </View>
      <View style={styles.pathList}>
        {PATH_CARDS.map((card) => {
          const path = PATHS.find((p) => p.id === card.id);
          const open = !!path?.written;
          const on = value === card.id;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: on, disabled: !open }}
              accessibilityLabel={`${path?.name}. ${card.hold}, ${card.screen}. ${card.feel}${open ? '' : ' Being written.'}`}
              key={card.id}
              disabled={!open}
              onPress={() => {
                tapFeedback();
                onChange(card.id);
              }}
              style={[
                styles.pathCard,
                surfaceStyle(look),
                on && { borderColor: look.accent, backgroundColor: tint(look.accent, 0.12) },
                !open && styles.pathCardShut,
              ]}
            >
              <View
                style={[
                  styles.pathIcon,
                  { backgroundColor: tint(look.accent, open ? 0.16 : 0.06) },
                ]}
              >
                <Icon name={card.icon} size={20} color={open ? look.accent : colors.textFaint} />
              </View>
              <View style={styles.pathBody}>
                <View style={styles.pathTop}>
                  <Text style={[styles.pathName, !open && { color: colors.textMuted }]}>
                    {path?.name}
                  </Text>
                  {open ? (
                    on ? (
                      <Icon name="check" size={18} color={look.accent} strokeWidth={3} />
                    ) : null
                  ) : (
                    <Text style={styles.pathSoon}>Being written</Text>
                  )}
                </View>
                <Text style={[styles.pathHold, { color: open ? look.accent : colors.textFaint }]}>
                  {`${card.hold} · ${card.screen}`}
                </Text>
                <Text style={styles.pathFeel}>{card.feel}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <PathNote />
      <Text style={styles.caption}>You can change this any time in Settings.</Text>
    </View>
  );
}

/**
 * S27: Chapter 1 has just taught that a full-time job points to Swing Trading,
 * so the one path that is open says what it asks for, and whoever cannot give
 * it can say they want Swing instead. The flag stays on this device; the
 * reminder that uses it comes later (stage LOOP-DAILY).
 */
export function PathNote() {
  return (
    <View style={styles.pathNote}>
      <Text style={styles.pathNoteText}>
        {`Scalping needs you at the screen when the market opens, ${market.first_minutes} ${market.timezone} on weekdays. No time then? Swing Trading fits around a job. It is being written, like Day Trading, and both come before the app's release.`}
      </Text>
      <WantSwing />
    </View>
  );
}

/** "I want Swing Trading": a local flag (progress.wanted), here and in Settings. */
export function WantSwing() {
  const look = useLookSpec();
  const wanted = useProgress().wanted.includes('swing-trading');
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: wanted }}
      onPress={() => {
        tapFeedback();
        toggleWanted('swing-trading');
      }}
      style={[styles.wantRow, wanted && { borderColor: look.accent }]}
    >
      <Icon name={wanted ? 'check' : 'bell'} size={16} color={look.accent} strokeWidth={2.5} />
      <Text style={[styles.wantText, { color: look.accent }]}>
        {wanted ? 'Noted: you want Swing Trading' : 'I want Swing Trading when it is ready'}
      </Text>
    </Pressable>
  );
}

/** A local cursor for the screens that count as several. */
export function useCursor(): [number, (n: number) => void] {
  return useState(0);
}

const styles = themed(() => ({
  centered: { gap: space.lg },
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
  dots: { flexDirection: 'row', alignSelf: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
  },
  dotOn: { backgroundColor: colors.accent, width: 20 },
  // A 48 pt target (docs/ui/15-theming-and-accessibility.md §10) around each dot, laid out as the 8 pt row it was.
  dotSlot: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    marginVertical: -(TAP_TARGET - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  checkTextHidden: {
    color: 'transparent',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  checkHint: { ...type.small, color: colors.textFaint },
  storyCard: { gap: space.sm, borderLeftWidth: 3 },
  storyKick: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyKickText: { ...type.label, textTransform: 'uppercase', letterSpacing: 1.2 },
  storyText: { ...type.prompt, color: colors.text },
  alertHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  alertTicker: { ...type.label, color: colors.text, fontWeight: '800', letterSpacing: 0.6 },
  alertTime: { ...type.small, fontSize: 13, color: colors.textMuted },
  alertSpark: { height: 44 },
  alertFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  alertFact: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  alertFactText: {
    ...type.small,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  recapKicker: {
    ...type.label,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: space.xs,
  },
  recapList: { gap: space.sm },
  recapRow: {
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  recapHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  recapCard: { borderLeftWidth: 2, paddingLeft: space.md, marginLeft: 40, gap: 2 },
  recapCardTitle: { ...type.small, fontWeight: '700', color: colors.text },
  recapCardBody: { ...type.small, color: colors.textMuted },
  recapNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recapNumText: { ...type.label, fontWeight: '800' },
  recapText: { ...type.body, color: colors.text, flex: 1 },
  recapLevel: { ...type.small, color: colors.textFaint },
  pathHead: { gap: space.sm },
  pathList: { gap: space.md },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    padding: space.md,
  },
  pathCardShut: { opacity: 0.6 },
  pathIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathBody: { flex: 1, gap: 2 },
  pathTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  pathName: { ...type.prompt, color: colors.text },
  pathSoon: {
    ...type.small,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pathHold: { ...type.small, fontWeight: '700' },
  pathNote: { gap: space.sm },
  pathNoteText: { ...type.small, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  wantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  wantText: { ...type.small, fontWeight: '700' },
  pathFeel: { ...type.small, fontSize: 13, lineHeight: 18, color: colors.textMuted },
}));
