import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { CueName } from '../../lesson/cues.generated';
import { cue as fireCue, revealFeedback } from '../../lesson/feedback';
import { EASE_OUT, EASE_SINE, SPRING_POP, usePressFeedback } from '../../lesson/motion';
import Shake from '../../lesson/Shake';
import { useReduceMotion } from '../../lesson/useReduceMotion';
import { MONO_FONT } from '../../theme';
import Icon from '../icons';
import { MiniScreen, type Suggestion } from './kit';

/**
 * Whole new looks for the lesson: the same question in four styles, each with
 * its own colours (the same in light and dark), its own face, answers and key.
 * Pick an answer and Check it to see how the look gives its verdict; "Start
 * again" puts the question back.
 */
export const LOOKS: Suggestion[] = [
  {
    id: 'look-terminal',
    section: 'looks',
    icon: 'monitor',
    title: 'Terminal look',
    line: 'Green on black, a mono face and bracket keys, like a trading terminal.',
    again: 'Start again',
    Preview: TerminalLook,
  },
  {
    id: 'look-paper',
    section: 'looks',
    icon: 'news',
    title: 'Newsprint look',
    line: 'Cream paper, a serif headline and inked rules, like a financial newspaper.',
    again: 'Start again',
    Preview: PaperLook,
  },
  {
    id: 'look-glass',
    section: 'looks',
    icon: 'drop',
    title: 'Glass look',
    line: 'Frosted panels over soft colour, light and airy.',
    again: 'Start again',
    Preview: GlassLook,
  },
  {
    id: 'look-arcade',
    section: 'looks',
    icon: 'quiz',
    title: 'Arcade look',
    line: 'Chunky pixel borders, bright colours and a bouncy key, like a handheld game.',
    again: 'Start again',
    Preview: ArcadeLook,
  },
];

// ---------------------------------------------------------------------------
// The question every look is drawn on
// ---------------------------------------------------------------------------

const QUESTION = 'A share costs $50 and rises to $53. What is your profit per share?';
const OPTIONS = ['$3', '$53', '6 %', '$0.30'];
const LETTERS = 'ABCD';
const RIGHT = 0;
const STEP = 4;
const STEPS = 12;
const HEARTS = 5;
/** The working behind the right answer, for a look that prints it. */
const WORKING = '$53 - $50 = $3';
/** Each look's phone: the screen at real size, and short enough for a small phone's page. */
const SCREEN_H = 448;

const FILL = { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 } as const;

/** An answer before Check (picked or not), and after it: the right one, the wrong pick, the rest. */
type Mark = 'idle' | 'picked' | 'right' | 'wrong' | 'rest';

const isLive = (mark: Mark) => mark === 'idle' || mark === 'picked';

/**
 * The question as the lesson plays it (screens/McScreen.tsx): a tap picks an
 * answer and a second tap takes it back, Check gives the verdict and its cue,
 * and from then on nothing changes until "Start again".
 */
function useQuiz() {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  return {
    picked,
    checked,
    /** Right, and told so: only then does an answer get a flourish. */
    earned: checked && picked === RIGHT,
    markOf: (i: number): Mark => {
      if (!checked) return picked === i ? 'picked' : 'idle';
      if (i === RIGHT) return 'right';
      return picked === i ? 'wrong' : 'rest';
    },
    pick: (i: number) => {
      if (!checked) setPicked((p) => (p === i ? null : i));
    },
    check: () => {
      if (checked || picked === null) return;
      setChecked(true);
      revealFeedback(picked === RIGHT ? 'correct' : 'wrong');
    },
  };
}

type Quiz = ReturnType<typeof useQuiz>;

/**
 * The key under the answers. Check is off until an answer is picked and judges
 * it on release, so it plays no cue on the way down; Continue has nowhere to
 * go in a preview and only ticks.
 */
function keyOf(quiz: Quiz): {
  label: string;
  off: boolean;
  cue: CueName | null;
  onPress: () => void;
} {
  if (quiz.checked) return { label: 'Continue', off: false, cue: 'tick', onPress: () => {} };
  return { label: 'Check', off: quiz.picked === null, cue: null, onPress: quiz.check };
}

/** What a screen reader hears for an answer: its value, then its verdict once there is one. */
function answerA11y(i: number, mark: Mark) {
  const verdict = mark === 'right' ? ', right' : mark === 'wrong' ? ', wrong' : '';
  return {
    accessibilityRole: 'button' as const,
    accessibilityLabel: `${OPTIONS[i]}${verdict}`,
    accessibilityState: { selected: mark === 'picked', disabled: !isLive(mark) },
  };
}

/**
 * A part of a screen arriving, a beat after the one before it: fading up a few
 * points (`rise`) or popping into place (`pop`). Under reduced motion it is
 * simply there.
 */
function Arrive({
  index,
  kind,
  style,
  children,
}: {
  index: number;
  kind: 'rise' | 'pop';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const reduced = useReduceMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      t.set(1);
      return;
    }
    const to =
      kind === 'pop'
        ? withSpring(1, SPRING_POP)
        : withTiming(1, { duration: 420, easing: EASE_OUT });
    t.set(withDelay(80 + index * 60, to));
  }, [index, kind, reduced, t]);
  const pop = kind === 'pop';
  const arrive = useAnimatedStyle(() => {
    const v = t.get();
    return pop
      ? { opacity: Math.min(1, v * 2), transform: [{ scale: 0.9 + 0.1 * v }] }
      : { opacity: v, transform: [{ translateY: 10 * (1 - v) }] };
  });
  return <Animated.View style={[style, arrive]}>{children}</Animated.View>;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** A pen line drawing itself from where it starts; under reduced motion it is there at once. */
function PenStroke({
  d,
  length,
  color,
  width,
  delay,
  duration,
}: {
  d: string;
  length: number;
  color: string;
  width: number;
  delay: number;
  duration: number;
}) {
  const reduced = useReduceMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) t.set(1);
    else t.set(withDelay(delay, withTiming(1, { duration, easing: EASE_SINE })));
  }, [delay, duration, reduced, t]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - t.get()) }));
  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`${length} ${length}`}
      animatedProps={props}
    />
  );
}

/** A path through the points, and how long it is (for a line that draws itself). */
function polyline(points: [number, number][]): { d: string; length: number } {
  let length = 0;
  const d = points
    .map(([x, y], i) => {
      if (i > 0) length += Math.hypot(x - points[i - 1][0], y - points[i - 1][1]);
      return `${i > 0 ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return { d, length: Math.ceil(length) };
}

/** The lesson's ✕, in a look's own ink and weight (the app's icons have none). */
function CloseMark({ size, color, weight }: { size: number; color: string; weight: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path
        d="M2.5 2.5l9 9M11.5 2.5l-9 9"
        stroke={color}
        strokeWidth={weight}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Terminal look
// ---------------------------------------------------------------------------

const TERM = {
  ground: '#030A05',
  green: '#41FF7A',
  dim: '#3CC56C',
  amber: '#FFB627',
  red: '#FF7A6B',
  rule: '#1E6B3A',
  ruleFaint: '#123D22',
  blockOff: '#12391F',
  pickedWash: 'rgba(255, 182, 39, 0.12)',
  wrongWash: 'rgba(255, 122, 107, 0.08)',
  pressWash: 'rgba(65, 255, 122, 0.14)',
  scan: 'rgba(0, 0, 0, 0.16)',
};
/** It prints in eight lines: the bar, the question, four answers, the status line, the key. */
const TERM_LINES = 8;
/** A dark hairline every third point, the rows of a tube. */
const SCAN_ROWS = Array.from({ length: Math.ceil(SCREEN_H / 3) }, (_, i) => i * 3 + 1);

/**
 * A trading terminal: phosphor green on black, the mono face throughout with
 * capitals on its labels, the answers as bracketed lines with a caret on the
 * one picked, a block bar, a status line that answers back and faint scanlines
 * over all of it. It prints itself a line at a time on arrival; a wrong pick
 * tears sideways.
 */
function TerminalLook() {
  const quiz = useQuiz();
  const reduced = useReduceMotion();
  const [printed, setPrinted] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timers = Array.from({ length: TERM_LINES }, (_, i) =>
      setTimeout(() => setPrinted((n) => Math.max(n, i + 1)), 120 + i * 70),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduced]);
  const shown = reduced ? TERM_LINES : printed;
  const line = (n: number) => (n < shown ? null : term.unprinted);
  // A tap prints the rest at once: nobody waits for an entrance.
  const pick = (i: number) => {
    setPrinted(TERM_LINES);
    quiz.pick(i);
  };

  const status = quiz.checked
    ? `${quiz.earned ? 'CORRECT' : 'NOT QUITE'}: ${WORKING}`
    : quiz.picked === null
      ? 'AWAITING INPUT'
      : `[${LETTERS[quiz.picked]}] SELECTED. PRESS CHECK`;
  const statusInk = !quiz.checked ? TERM.dim : quiz.earned ? TERM.green : TERM.amber;

  return (
    <MiniScreen background={TERM.ground} height={SCREEN_H}>
      <Phosphor />
      <View style={term.screen}>
        <View style={[term.bar, line(0)]}>
          <Text style={term.label}>[X]</Text>
          <View
            style={term.blocks}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${STEP} of ${STEPS}`}
          >
            <Text style={term.label}>[</Text>
            {Array.from({ length: STEPS }, (_, i) => (
              <View key={i} style={[term.block, i < STEP && term.blockOn]} />
            ))}
            <Text style={term.label}>]</Text>
          </View>
          <Text style={term.count}>{`${STEP}/${STEPS}`}</Text>
          <View style={term.hearts}>
            <Icon name="heart" size={13} color={TERM.amber} filled />
            <Text style={term.heartCount}>{HEARTS}</Text>
          </View>
        </View>
        <View style={term.middle}>
          <Text style={[term.question, line(1)]}>
            <Text style={term.prompt}>{`Q${STEP}> `}</Text>
            {QUESTION}
          </Text>
          <View style={term.answers}>
            {OPTIONS.map((option, i) => (
              <View key={option} style={line(2 + i)}>
                <TermRow
                  index={i}
                  mark={quiz.markOf(i)}
                  chosen={quiz.picked === i}
                  onPress={() => pick(i)}
                />
              </View>
            ))}
          </View>
        </View>
        <Text style={[term.status, { color: statusInk }, line(6)]} numberOfLines={1}>
          {`> ${status}`}
          <Text style={term.cursor}>_</Text>
        </Text>
        <View style={line(7)}>
          <TermKey quiz={quiz} />
        </View>
      </View>
      <Scanlines />
    </MiniScreen>
  );
}

/** One answer as a terminal line: "[A] $3", a caret on the one picked, OK or ERR once checked. */
function TermRow({
  index,
  mark,
  chosen,
  onPress,
}: {
  index: number;
  mark: Mark;
  chosen: boolean;
  onPress: () => void;
}) {
  const live = isLive(mark);
  const reduced = useReduceMotion();
  const press = usePressFeedback(live);
  // A wrong pick tears: three jumps sideways and back, with nothing in between.
  const x = useSharedValue(0);
  useEffect(() => {
    if (mark !== 'wrong' || reduced) return;
    const jump = { duration: 0 };
    x.set(
      withSequence(
        withTiming(-6, jump),
        withDelay(50, withTiming(4, jump)),
        withDelay(50, withTiming(-2, jump)),
        withDelay(50, withTiming(0, jump)),
      ),
    );
  }, [mark, reduced, x]);
  const tear = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  // Held, the line lights up under the finger, as a terminal lights the line under its cursor.
  const lit = useAnimatedStyle(() => ({ opacity: press.pressed.get() }));
  const ink =
    mark === 'right'
      ? TERM.ground
      : mark === 'picked'
        ? TERM.amber
        : mark === 'wrong'
          ? TERM.red
          : mark === 'rest'
            ? TERM.dim
            : TERM.green;
  return (
    <Animated.View style={tear}>
      <Pressable
        {...answerA11y(index, mark)}
        disabled={!live}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        pressRetentionOffset={16}
        style={[term.row, termRow[mark]]}
      >
        <Animated.View pointerEvents="none" style={[term.wash, lit]} />
        <Text style={[term.answer, { color: ink }]}>
          <Text style={{ color: mark === 'right' ? TERM.ground : TERM.amber }}>
            {chosen ? '> ' : '  '}
          </Text>
          {`[${LETTERS[index]}] ${OPTIONS[index]}`}
        </Text>
        {mark === 'right' ? <Text style={[term.tag, { color: TERM.ground }]}>OK</Text> : null}
        {mark === 'wrong' ? <Text style={[term.tag, { color: TERM.red }]}>ERR</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

/** "[ CHECK ]" in reverse video; held, it goes amber. */
function TermKey({ quiz }: { quiz: Quiz }) {
  const key = keyOf(quiz);
  const press = usePressFeedback(!key.off, { cue: key.cue });
  const lit = useAnimatedStyle(() => ({ opacity: press.pressed.get() }));
  return (
    <Pressable
      testID="key"
      accessibilityRole="button"
      accessibilityLabel={key.label}
      accessibilityState={{ disabled: key.off }}
      disabled={key.off}
      onPress={key.onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      pressRetentionOffset={16}
      style={[term.key, key.off ? term.keyOff : term.keyOn]}
    >
      <Animated.View pointerEvents="none" style={[term.keyLit, lit]} />
      <Text style={[term.keyText, { color: key.off ? TERM.dim : TERM.ground }]} numberOfLines={1}>
        {`[ ${key.label.toUpperCase()} ]`}
      </Text>
    </Pressable>
  );
}

/** The tube: a faint green glow in the middle, falling off into black at the corners. */
const Phosphor = React.memo(function Phosphor() {
  return (
    <View pointerEvents="none" style={FILL}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="lookTermGlow" cx="50%" cy="45%" r="75%">
            <Stop offset="0" stopColor={TERM.green} stopOpacity={0.07} />
            <Stop offset="0.6" stopColor={TERM.green} stopOpacity={0.03} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.5} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#lookTermGlow)" />
      </Svg>
    </View>
  );
});

/** Scanlines over everything, drawn once. */
const Scanlines = React.memo(function Scanlines() {
  return (
    <View pointerEvents="none" style={FILL}>
      <Svg width="100%" height="100%">
        {SCAN_ROWS.map((y) => (
          <Rect key={y} x={0} y={y} width="100%" height={1} fill={TERM.scan} />
        ))}
      </Svg>
    </View>
  );
});

const termRow = StyleSheet.create({
  idle: { borderColor: TERM.rule },
  picked: { borderColor: TERM.amber, backgroundColor: TERM.pickedWash },
  right: { borderColor: TERM.green, backgroundColor: TERM.green },
  wrong: { borderColor: TERM.red, backgroundColor: TERM.wrongWash },
  rest: { borderColor: TERM.ruleFaint },
});

const term = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 20 },
  label: { fontFamily: MONO_FONT, fontSize: 13, lineHeight: 18, color: TERM.dim },
  blocks: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 },
  block: { flex: 1, height: 11, backgroundColor: TERM.blockOff },
  blockOn: { backgroundColor: TERM.green },
  count: { fontFamily: MONO_FONT, fontSize: 13, lineHeight: 18, color: TERM.green },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heartCount: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: TERM.amber,
  },
  middle: { flex: 1, justifyContent: 'center', gap: 14 },
  question: { fontFamily: MONO_FONT, fontSize: 15, lineHeight: 20, color: TERM.green },
  prompt: { fontWeight: '700', color: TERM.amber },
  answers: { gap: 6 },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  wash: { ...FILL, backgroundColor: TERM.pressWash },
  answer: { flex: 1, fontFamily: MONO_FONT, fontSize: 17, lineHeight: 22, fontWeight: '700' },
  tag: { fontFamily: MONO_FONT, fontSize: 14, lineHeight: 19, fontWeight: '700', letterSpacing: 1 },
  status: { fontFamily: MONO_FONT, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cursor: { color: TERM.amber },
  key: {
    minHeight: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  keyOn: { backgroundColor: TERM.green, borderColor: TERM.green },
  keyOff: { borderColor: TERM.rule, borderStyle: 'dashed' },
  keyLit: { ...FILL, backgroundColor: TERM.amber },
  keyText: {
    fontFamily: MONO_FONT,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  unprinted: { opacity: 0 },
});

// ---------------------------------------------------------------------------
// Newsprint look
// ---------------------------------------------------------------------------

const PAPER = {
  paper: '#F3ECDA',
  ink: '#1C1A17',
  soft: '#5A5246',
  kicker: '#A6261D',
  faint: 'rgba(28, 26, 23, 0.32)',
  green: '#17683F',
  red: '#B3261E',
};
const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Georgia, "Times New Roman", serif',
  default: 'serif',
});
const RING_W = 58;
const RING_H = 40;
/**
 * A ring drawn by hand round the right answer: once round and on past where
 * it began, a little tilted, widening as it goes so it never quite closes.
 */
const RING = (() => {
  const rx = RING_W / 2 - 4;
  const ry = RING_H / 2 - 4;
  const tilt = -0.12;
  const points: [number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const a = Math.PI * 0.9 + t * Math.PI * 2.2;
    const grow = 0.92 + 0.12 * t;
    const x = rx * grow * Math.cos(a);
    const y = ry * grow * Math.sin(a);
    points.push([
      RING_W / 2 + x * Math.cos(tilt) - y * Math.sin(tilt),
      RING_H / 2 + x * Math.sin(tilt) + y * Math.cos(tilt),
    ]);
  }
  return polyline(points);
})();
/** A quick pen stroke through a wrong pick, a little wavy and rising, in a 100 × 14 box. */
const STRIKE = polyline(
  Array.from({ length: 13 }, (_, i): [number, number] => {
    const t = i / 12;
    return [2 + 96 * t, 9 - 3 * t + 1.2 * Math.sin(t * Math.PI * 2.4)];
  }),
);

/**
 * A financial newspaper: cream paper and black ink, a small-caps kicker under
 * a double rule, the question as a serif headline, the answers boxed in ink.
 * Check marks it up with a pen: the right answer ringed by hand, a wrong pick
 * struck through.
 */
function PaperLook() {
  const quiz = useQuiz();
  return (
    <MiniScreen background={PAPER.paper} height={SCREEN_H}>
      <View style={paper.screen}>
        <View style={paper.bar}>
          <CloseMark size={14} color={PAPER.ink} weight={1.8} />
          <View
            style={paper.track}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${STEP} of ${STEPS}`}
          >
            <View style={paper.done} />
            <View style={paper.todo} />
          </View>
          <Text style={paper.count}>{`${STEP}/${STEPS}`}</Text>
          <View style={paper.hearts}>
            <Icon name="heart" size={13} color={PAPER.ink} filled />
            <Text style={paper.heartCount}>{HEARTS}</Text>
          </View>
        </View>
        <View style={paper.rules}>
          <View style={paper.ruleThick} />
          <View style={paper.ruleThin} />
        </View>
        <View style={paper.middle}>
          <Text style={paper.kicker} numberOfLines={1}>
            Lesson 4 · Market basics
          </Text>
          <Text style={paper.headline}>{QUESTION}</Text>
          <View style={paper.answers}>
            {OPTIONS.map((option, i) => (
              <PaperRow
                key={option}
                index={i}
                mark={quiz.markOf(i)}
                // After a wrong pick the strike goes first, then the ring.
                ringAfter={quiz.earned ? 40 : 260}
                onPress={() => quiz.pick(i)}
              />
            ))}
          </View>
        </View>
        <PaperKey quiz={quiz} />
      </View>
    </MiniScreen>
  );
}

/** One answer boxed in ink: reversed out when picked, then ringed or struck through. */
function PaperRow({
  index,
  mark,
  ringAfter,
  onPress,
}: {
  index: number;
  mark: Mark;
  ringAfter: number;
  onPress: () => void;
}) {
  const live = isLive(mark);
  const press = usePressFeedback(live);
  return (
    <Animated.View style={press.style}>
      <Pressable
        {...answerA11y(index, mark)}
        disabled={!live}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        pressRetentionOffset={16}
        style={[paper.row, paperRow[mark]]}
      >
        <View style={paper.value}>
          <Text style={[paper.answer, paperInk[mark]]}>{OPTIONS[index]}</Text>
          {mark === 'right' ? (
            <View pointerEvents="none" style={paper.ring}>
              <Svg width={RING_W} height={RING_H}>
                <PenStroke
                  d={RING.d}
                  length={RING.length}
                  color={PAPER.green}
                  width={2.2}
                  delay={ringAfter}
                  duration={540}
                />
              </Svg>
            </View>
          ) : null}
          {mark === 'wrong' ? (
            <View pointerEvents="none" style={paper.strike}>
              <Svg width="100%" height="100%" viewBox="0 0 100 14" preserveAspectRatio="none">
                <PenStroke
                  d={STRIKE.d}
                  length={STRIKE.length}
                  color={PAPER.red}
                  width={2.4}
                  delay={0}
                  duration={240}
                />
              </Svg>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Solid black with cream capitals; until an answer is picked, a dashed coupon line. */
function PaperKey({ quiz }: { quiz: Quiz }) {
  const key = keyOf(quiz);
  const press = usePressFeedback(!key.off, { cue: key.cue });
  return (
    <Animated.View style={press.style}>
      <Pressable
        testID="key"
        accessibilityRole="button"
        accessibilityLabel={key.label}
        accessibilityState={{ disabled: key.off }}
        disabled={key.off}
        onPress={key.onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        pressRetentionOffset={16}
        style={[paper.key, key.off && paper.keyOff]}
      >
        <Text style={[paper.keyText, key.off && paper.keyTextOff]} numberOfLines={1}>
          {key.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const paperRow = StyleSheet.create({
  idle: { borderColor: PAPER.ink },
  picked: { borderColor: PAPER.ink, backgroundColor: PAPER.ink },
  right: { borderColor: PAPER.ink },
  wrong: { borderColor: PAPER.ink },
  rest: { borderColor: PAPER.faint },
});

const paperInk = StyleSheet.create({
  idle: { color: PAPER.ink },
  picked: { color: PAPER.paper },
  right: { color: PAPER.ink, fontWeight: '700' },
  wrong: { color: PAPER.ink },
  rest: { color: PAPER.soft },
});

const paper = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 20 },
  track: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  done: { flex: STEP, height: 4, backgroundColor: PAPER.ink },
  todo: { flex: STEPS - STEP, height: 1, backgroundColor: PAPER.ink },
  count: {
    fontFamily: SERIF,
    fontSize: 14,
    lineHeight: 19,
    fontStyle: 'italic',
    color: PAPER.soft,
  },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartCount: {
    fontFamily: SERIF,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: PAPER.ink,
  },
  rules: { marginTop: 8, gap: 2 },
  ruleThick: { height: 3, backgroundColor: PAPER.ink },
  ruleThin: { height: 1, backgroundColor: PAPER.ink },
  middle: { flex: 1, justifyContent: 'center' },
  kicker: {
    fontFamily: SERIF,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: PAPER.kicker,
  },
  headline: {
    fontFamily: SERIF,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: PAPER.ink,
    marginTop: 2,
  },
  answers: { gap: 6, marginTop: 12 },
  row: {
    minHeight: 48,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingLeft: 22,
    paddingRight: 14,
  },
  // As wide as its text, so the ring and the strike fit the answer, not the box.
  value: { alignSelf: 'flex-start' },
  answer: { fontFamily: SERIF, fontSize: 18, lineHeight: 23 },
  ring: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: RING_W,
    height: RING_H,
    marginLeft: -RING_W / 2,
    marginTop: -RING_H / 2,
  },
  strike: { position: 'absolute', left: -8, right: -8, top: '50%', height: 14, marginTop: -7 },
  key: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: PAPER.ink,
    backgroundColor: PAPER.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyOff: { borderColor: PAPER.soft, borderStyle: 'dashed', backgroundColor: 'transparent' },
  keyText: {
    fontFamily: SERIF,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: PAPER.paper,
  },
  keyTextOff: { color: PAPER.soft },
});

// ---------------------------------------------------------------------------
// Glass look
// ---------------------------------------------------------------------------

const GLASS = {
  navy: '#0A0E27',
  violet: '#8B5CF6',
  teal: '#2DD4BF',
  blue: '#3B82F6',
  white: '#FFFFFF',
  soft: 'rgba(255, 255, 255, 0.86)',
  panel: 'rgba(255, 255, 255, 0.11)',
  panelPicked: 'rgba(255, 255, 255, 0.18)',
  panelRest: 'rgba(255, 255, 255, 0.06)',
  edge: 'rgba(255, 255, 255, 0.25)',
  edgeTop: 'rgba(255, 255, 255, 0.42)',
  edgePicked: 'rgba(255, 255, 255, 0.78)',
  edgeRest: 'rgba(255, 255, 255, 0.14)',
  ring: 'rgba(255, 255, 255, 0.5)',
  ringRest: 'rgba(255, 255, 255, 0.22)',
  track: 'rgba(255, 255, 255, 0.14)',
  mint: '#7CF5E2',
  mintWash: 'rgba(45, 212, 191, 0.26)',
  rose: '#FF9DB0',
  roseWash: 'rgba(251, 113, 133, 0.26)',
  key: 'rgba(255, 255, 255, 0.94)',
  keyOff: 'rgba(255, 255, 255, 0.1)',
  keyOffText: 'rgba(255, 255, 255, 0.82)',
};
/**
 * The colour under the glass, kept apart so no two blobs pile up under the
 * text: white type holds 4.5 : 1 over the brightest of them, panel or not.
 */
const BLOBS = [
  { id: 'lookGlassViolet', color: GLASS.violet, peak: 0.5, cx: '86%', cy: '10%', r: 150 },
  { id: 'lookGlassTeal', color: GLASS.teal, peak: 0.34, cx: '4%', cy: '50%', r: 150 },
  { id: 'lookGlassBlue', color: GLASS.blue, peak: 0.48, cx: '94%', cy: '88%', r: 165 },
];

/**
 * Glass: frosted panels over soft colour on deep navy, white type and a
 * white pill key. The panels float up into place on arrival, and an answer
 * the learner got right glows.
 */
function GlassLook() {
  const quiz = useQuiz();
  return (
    <MiniScreen background={GLASS.navy} height={SCREEN_H}>
      <Blobs />
      <View style={glass.screen}>
        <Arrive index={0} kind="rise" style={glass.bar}>
          <View style={glass.close}>
            <CloseMark size={12} color={GLASS.white} weight={2} />
          </View>
          <View
            style={glass.track}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${STEP} of ${STEPS}`}
          >
            <View style={glass.done}>
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient id="lookGlassProgress" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={GLASS.violet} />
                    <Stop offset="1" stopColor={GLASS.mint} />
                  </LinearGradient>
                </Defs>
                <Rect x={0} y={0} width="100%" height="100%" fill="url(#lookGlassProgress)" />
              </Svg>
            </View>
            <View style={glass.todo} />
          </View>
          <Text style={glass.count}>{`${STEP}/${STEPS}`}</Text>
          <View style={glass.chip}>
            <Icon name="heart" size={14} color={GLASS.rose} filled />
            <Text style={glass.chipText}>{HEARTS}</Text>
          </View>
        </Arrive>
        <View style={glass.middle}>
          <Arrive index={1} kind="rise">
            <Text style={glass.question}>{QUESTION}</Text>
          </Arrive>
          <View style={glass.answers}>
            {OPTIONS.map((option, i) => (
              <Arrive key={option} index={2 + i} kind="rise">
                <GlassRow
                  index={i}
                  mark={quiz.markOf(i)}
                  earned={quiz.earned}
                  onPress={() => quiz.pick(i)}
                />
              </Arrive>
            ))}
          </View>
        </View>
        <Arrive index={6} kind="rise">
          <GlassKey quiz={quiz} />
        </Arrive>
      </View>
    </MiniScreen>
  );
}

/** One answer on a pane of glass, with a round mark at its end. */
function GlassRow({
  index,
  mark,
  earned,
  onPress,
}: {
  index: number;
  mark: Mark;
  earned: boolean;
  onPress: () => void;
}) {
  const live = isLive(mark);
  const press = usePressFeedback(live);
  return (
    <Shake trigger={mark === 'wrong' ? 1 : 0} onMount={false}>
      <Animated.View style={press.style}>
        <Pressable
          {...answerA11y(index, mark)}
          disabled={!live}
          onPress={onPress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          pressRetentionOffset={16}
          style={[glass.row, glassRow[mark], mark === 'right' && earned && glass.glow]}
        >
          <Text style={[glass.answer, mark === 'rest' && glass.answerRest]}>{OPTIONS[index]}</Text>
          <View style={[glass.mark, glassMark[mark]]}>
            {mark === 'picked' ? <View style={glass.markCore} /> : null}
            {mark === 'right' ? (
              <Icon name="check" size={14} color={GLASS.navy} strokeWidth={3} />
            ) : null}
            {mark === 'wrong' ? <CloseMark size={10} color={GLASS.navy} weight={2.6} /> : null}
          </View>
        </Pressable>
      </Animated.View>
    </Shake>
  );
}

/** A white pill; off, a pane like the rest. */
function GlassKey({ quiz }: { quiz: Quiz }) {
  const key = keyOf(quiz);
  const press = usePressFeedback(!key.off, { cue: key.cue });
  return (
    <Animated.View style={press.style}>
      <Pressable
        testID="key"
        accessibilityRole="button"
        accessibilityLabel={key.label}
        accessibilityState={{ disabled: key.off }}
        disabled={key.off}
        onPress={key.onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        pressRetentionOffset={16}
        style={[glass.key, key.off ? glass.keyOff : glass.keyOn]}
      >
        <Text
          style={[glass.keyText, { color: key.off ? GLASS.keyOffText : GLASS.navy }]}
          numberOfLines={1}
        >
          {key.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** Three soft blobs of colour, drawn once under everything. */
const Blobs = React.memo(function Blobs() {
  return (
    <View pointerEvents="none" style={FILL}>
      <Svg width="100%" height="100%">
        <Defs>
          {BLOBS.map((b) => (
            <RadialGradient key={b.id} id={b.id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={b.color} stopOpacity={b.peak} />
              <Stop offset="0.55" stopColor={b.color} stopOpacity={b.peak * 0.45} />
              <Stop offset="1" stopColor={b.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {BLOBS.map((b) => (
          <Circle key={b.id} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#${b.id})`} />
        ))}
      </Svg>
    </View>
  );
});

const glassRow = StyleSheet.create({
  idle: { backgroundColor: GLASS.panel, borderColor: GLASS.edge, borderTopColor: GLASS.edgeTop },
  picked: {
    backgroundColor: GLASS.panelPicked,
    borderColor: GLASS.edgePicked,
    boxShadow: '0px 0px 16px rgba(255, 255, 255, 0.18)',
  },
  right: { backgroundColor: GLASS.mintWash, borderColor: GLASS.mint },
  wrong: { backgroundColor: GLASS.roseWash, borderColor: GLASS.rose },
  rest: { backgroundColor: GLASS.panelRest, borderColor: GLASS.edgeRest },
});

const glassMark = StyleSheet.create({
  idle: { borderColor: GLASS.ring },
  picked: { borderColor: GLASS.white, backgroundColor: GLASS.white },
  right: { borderColor: GLASS.mint, backgroundColor: GLASS.mint },
  wrong: { borderColor: GLASS.rose, backgroundColor: GLASS.rose },
  rest: { borderColor: GLASS.ringRest },
});

const glass = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 30 },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: GLASS.edge,
    backgroundColor: GLASS.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    flex: 1,
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    backgroundColor: GLASS.track,
    overflow: 'hidden',
  },
  done: { flex: STEP, borderRadius: 4, overflow: 'hidden' },
  todo: { flex: STEPS - STEP },
  count: {
    fontFamily: MONO_FONT,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: GLASS.soft,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: GLASS.edge,
    backgroundColor: GLASS.panel,
  },
  chipText: {
    fontFamily: MONO_FONT,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: GLASS.white,
  },
  middle: { flex: 1, justifyContent: 'center', gap: 14 },
  question: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: GLASS.white,
  },
  answers: { gap: 7 },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  glow: { boxShadow: '0px 0px 18px rgba(124, 245, 226, 0.5)' },
  answer: {
    flex: 1,
    fontFamily: MONO_FONT,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: GLASS.white,
  },
  answerRest: { color: GLASS.soft },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: GLASS.navy },
  key: {
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyOn: { backgroundColor: GLASS.key, borderColor: GLASS.white },
  keyOff: { backgroundColor: GLASS.keyOff, borderColor: GLASS.edge },
  keyText: { fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: 0.2 },
});

// ---------------------------------------------------------------------------
// Arcade look
// ---------------------------------------------------------------------------

const ARC = {
  sky: '#2B0F55',
  ground: '#1D0B3B',
  box: '#2C1258',
  boxPicked: '#3B1A70',
  dialog: '#120428',
  shadow: '#08021A',
  white: '#FFFFFF',
  yellow: '#FFD23F',
  pink: '#FF5FA2',
  cyan: '#3DF2FF',
  lime: '#8CFF5A',
  ink: '#1D0B3B',
  dim: '#CBB8F0',
  dimEdge: '#5B4A82',
  cell: '#3A2466',
  heart: '#FF4F7B',
  off: '#4A3A6E',
  offText: '#D9CCF5',
  lit: 'rgba(255, 255, 255, 0.3)',
};
/** How far the key sinks into its shadow. */
const ARC_EDGE = 4;

// Sprites, a row of text to a row of pixels: a letter is a colour, '.' is clear.
const HEART = ['.XX.XX.', 'XoXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
const ARROW = ['X...', 'XX..', 'XXX.', 'XXXX', 'XXX.', 'XX..', 'X...'];
const TICK = ['......X', '.....XX', 'X...XX.', 'XX.XX..', '.XXX...', '..X....'];
const CROSS = ['XX...XX', 'XXX.XXX', '.XXXXX.', '..XXX..', '.XXXXX.', 'XXX.XXX', 'XX...XX'];
const HEART_INK = { X: ARC.heart, o: ARC.white };
const WHITE_INK = { X: ARC.white };
const YELLOW_INK = { X: ARC.yellow };
const DARK_INK = { X: ARC.ink };

const ARC_ROW: Record<Mark, { face: string; edge: string; ink: string }> = {
  idle: { face: ARC.box, edge: ARC.cyan, ink: ARC.white },
  picked: { face: ARC.boxPicked, edge: ARC.yellow, ink: ARC.yellow },
  right: { face: ARC.lime, edge: ARC.white, ink: ARC.ink },
  wrong: { face: ARC.pink, edge: ARC.white, ink: ARC.ink },
  rest: { face: ARC.box, edge: ARC.dimEdge, ink: ARC.dim },
};

/** Still pixel stars, out in the margins where the boxes leave the sky showing. */
const STARS = [
  { x: '24%', y: 4, size: 2, color: ARC.cyan },
  { x: '52%', y: 6, size: 2, color: ARC.white },
  { x: '78%', y: 3, size: 2, color: ARC.pink },
  { x: '1.5%', y: 96, size: 3, color: ARC.white },
  { x: '97%', y: 150, size: 2, color: ARC.cyan },
  { x: '1.5%', y: 214, size: 2, color: ARC.pink },
  { x: '97.5%', y: 268, size: 3, color: ARC.yellow },
  { x: '2%', y: 330, size: 2, color: ARC.cyan },
  { x: '97%', y: 362, size: 2, color: ARC.white },
];

/**
 * A handheld game: dark purple with bright yellow, pink and cyan, the mono
 * face in bold capitals, pixel boxes on hard shadows, pixel hearts, and a
 * yellow key that sinks into its shadow while held and bounces back. The boxes
 * pop in on arrival, and a pixel arrow points at the answer picked.
 */
function ArcadeLook() {
  const quiz = useQuiz();
  return (
    <MiniScreen background={ARC.ground} height={SCREEN_H}>
      <ArcadeSky />
      <View style={arc.screen}>
        <View style={arc.bar}>
          <Sprite rows={CROSS} ink={WHITE_INK} />
          <View
            style={arc.meter}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${STEP} of ${STEPS}`}
          >
            {Array.from({ length: STEPS }, (_, i) => (
              <View key={i} style={[arc.cell, i < STEP && arc.cellOn]} />
            ))}
          </View>
          <Text style={arc.count}>{`${STEP}/${STEPS}`}</Text>
          <View style={arc.hearts} accessible accessibilityLabel={`${HEARTS} hearts`}>
            {Array.from({ length: HEARTS }, (_, i) => (
              <Sprite key={i} rows={HEART} ink={HEART_INK} />
            ))}
          </View>
        </View>
        <View style={arc.middle}>
          <Arrive index={0} kind="pop" style={[arc.boxWrap, arc.dialogWrap]}>
            <View style={arc.shadow} />
            <View style={arc.dialog}>
              <Text style={arc.question}>{QUESTION}</Text>
            </View>
            <View style={arc.tag}>
              <Text style={arc.tagText}>Level 4</Text>
            </View>
          </Arrive>
          <View style={arc.answers}>
            {OPTIONS.map((option, i) => (
              <Arrive key={option} index={1 + i} kind="pop">
                <ArcadeRow
                  index={i}
                  mark={quiz.markOf(i)}
                  chosen={quiz.picked === i}
                  earned={quiz.earned}
                  onPress={() => quiz.pick(i)}
                />
              </Arrive>
            ))}
          </View>
        </View>
        <ArcadeKey quiz={quiz} />
      </View>
    </MiniScreen>
  );
}

/** One answer in a pixel box on its shadow: pressed, it sinks towards the shadow. */
function ArcadeRow({
  index,
  mark,
  chosen,
  earned,
  onPress,
}: {
  index: number;
  mark: Mark;
  chosen: boolean;
  earned: boolean;
  onPress: () => void;
}) {
  const live = isLive(mark);
  const reduced = useReduceMotion();
  const press = usePressFeedback(live);
  // An answer the learner got right jumps, once.
  const joy = useSharedValue(1);
  useEffect(() => {
    if (mark !== 'right' || !earned || reduced) return;
    joy.set(
      withSequence(
        withTiming(1.06, { duration: 110, easing: EASE_OUT }),
        withSpring(1, SPRING_POP),
      ),
    );
  }, [mark, earned, reduced, joy]);
  const box = useAnimatedStyle(() => {
    const p = press.pressed.get();
    return { transform: [{ translateX: 2 * p }, { translateY: 2 * p }, { scale: joy.get() }] };
  });
  const tone = ARC_ROW[mark];
  return (
    <Shake trigger={mark === 'wrong' ? 1 : 0} onMount={false}>
      <View style={arc.boxWrap}>
        <View style={arc.shadow} />
        <Animated.View style={box}>
          <Pressable
            {...answerA11y(index, mark)}
            disabled={!live}
            onPress={onPress}
            onPressIn={press.onPressIn}
            onPressOut={press.onPressOut}
            pressRetentionOffset={16}
            style={[arc.row, { backgroundColor: tone.face, borderColor: tone.edge }]}
          >
            <View style={arc.pointer}>
              {chosen ? (
                <Sprite rows={ARROW} ink={mark === 'picked' ? YELLOW_INK : DARK_INK} />
              ) : null}
            </View>
            <Text style={[arc.answer, { color: tone.ink }]}>{OPTIONS[index]}</Text>
            {mark === 'right' ? <Sprite rows={TICK} ink={DARK_INK} /> : null}
            {mark === 'wrong' ? <Sprite rows={CROSS} ink={DARK_INK} /> : null}
          </Pressable>
        </Animated.View>
      </View>
    </Shake>
  );
}

/**
 * A yellow block on its shadow: it hops when an answer wakes it, sinks into
 * the shadow while held and springs back past its rest when let go. Under
 * reduced motion it stays put and lights up while held instead.
 */
function ArcadeKey({ quiz }: { quiz: Quiz }) {
  const key = keyOf(quiz);
  const reduced = useReduceMotion();
  const down = useSharedValue(0);
  const hop = useSharedValue(0);
  const wasOff = useRef(key.off);
  useEffect(() => {
    if (wasOff.current && !key.off && !reduced) {
      hop.set(
        withSequence(
          withTiming(-7, { duration: 110, easing: EASE_OUT }),
          withSpring(0, { duration: 480, dampingRatio: 0.42 }),
        ),
      );
    }
    wasOff.current = key.off;
  }, [key.off, reduced, hop]);
  const onPressIn = () => {
    if (key.cue) fireCue(key.cue);
    down.set(reduced ? 1 : withTiming(1, { duration: 70, easing: EASE_OUT }));
  };
  const onPressOut = () => {
    down.set(reduced ? 0 : withSpring(0, { duration: 420, dampingRatio: 0.35 }));
  };
  const travel = reduced ? 0 : ARC_EDGE;
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: hop.get() }] }));
  const sink = useAnimatedStyle(() => ({ transform: [{ translateY: travel * down.get() }] }));
  const lit = useAnimatedStyle(() => ({ opacity: reduced ? down.get() : 0 }));
  return (
    <Pressable
      testID="key"
      accessibilityRole="button"
      accessibilityLabel={key.label}
      accessibilityState={{ disabled: key.off }}
      disabled={key.off}
      onPress={key.onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      pressRetentionOffset={16}
    >
      <Animated.View style={[arc.keyWrap, lift]}>
        <View style={arc.keyShadow} />
        <Animated.View
          style={[arc.keyFace, { backgroundColor: key.off ? ARC.off : ARC.yellow }, sink]}
        >
          <Animated.View pointerEvents="none" style={[arc.keyLit, lit]} />
          <Text style={[arc.keyText, { color: key.off ? ARC.offText : ARC.ink }]} numberOfLines={1}>
            {key.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** A sprite, one path a colour so its squares never show seams between them. */
function Sprite({
  rows,
  ink,
  pixel = 2,
}: {
  rows: string[];
  ink: Record<string, string>;
  pixel?: number;
}) {
  const w = rows[0].length;
  const h = rows.length;
  return (
    <Svg width={w * pixel} height={h * pixel} viewBox={`0 0 ${w} ${h}`}>
      {Object.keys(ink).map((letter) => (
        <Path key={letter} d={spritePath(rows, letter)} fill={ink[letter]} />
      ))}
    </Svg>
  );
}

function spritePath(rows: string[], letter: string): string {
  let d = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === letter) d += `M${x} ${y}h1v1h-1z`;
    }
  });
  return d;
}

/** The sky: purple falling to a deeper purple, with a few still pixel stars. */
const ArcadeSky = React.memo(function ArcadeSky() {
  return (
    <View pointerEvents="none" style={FILL}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="lookArcadeSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={ARC.sky} />
            <Stop offset="1" stopColor={ARC.ground} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#lookArcadeSky)" />
        {STARS.map((s, i) => (
          <Rect key={i} x={s.x} y={s.y} width={s.size} height={s.size} fill={s.color} />
        ))}
      </Svg>
    </View>
  );
});

const arc = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 18 },
  meter: {
    flex: 1,
    height: 16,
    flexDirection: 'row',
    gap: 2,
    padding: 2,
    borderWidth: 2,
    borderColor: ARC.white,
    backgroundColor: ARC.dialog,
  },
  cell: { flex: 1, backgroundColor: ARC.cell },
  cellOn: { backgroundColor: ARC.yellow },
  count: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: ARC.cyan,
  },
  hearts: { flexDirection: 'row', gap: 2 },
  middle: { flex: 1, justifyContent: 'center', gap: 10 },
  // A box and its hard shadow, which sits 4 pt down and right inside the box's room.
  boxWrap: { paddingRight: 4, paddingBottom: 4 },
  shadow: {
    position: 'absolute',
    left: 4,
    top: 4,
    right: 0,
    bottom: 0,
    backgroundColor: ARC.shadow,
  },
  // Room above the dialog for its tag.
  dialogWrap: { marginTop: 8 },
  dialog: {
    borderWidth: 3,
    borderColor: ARC.white,
    backgroundColor: ARC.dialog,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 9,
  },
  question: {
    fontFamily: MONO_FONT,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: ARC.white,
  },
  tag: {
    position: 'absolute',
    left: 10,
    top: -10,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: ARC.shadow,
    backgroundColor: ARC.yellow,
  },
  tagText: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: ARC.ink,
  },
  answers: { gap: 4 },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 3,
  },
  pointer: { width: 8, alignItems: 'center' },
  answer: {
    flex: 1,
    fontFamily: MONO_FONT,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  // The key's hard shadow sits straight under it, so pressing down covers it.
  keyWrap: { paddingBottom: ARC_EDGE },
  keyShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ARC_EDGE,
    bottom: 0,
    backgroundColor: ARC.shadow,
  },
  keyFace: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: ARC.shadow,
    overflow: 'hidden',
  },
  keyLit: { ...FILL, backgroundColor: ARC.lit },
  keyText: {
    fontFamily: MONO_FONT,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
