import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path as SvgPath } from 'react-native-svg';

import Icon, { type IconName } from '../home/icons';
import { EASE_OUT } from '../lesson/motion';
import { Deco, Gem, GEM, inkOf, PathLogo, type DecoKind } from './art';
import { HUD, PATH, type MapLevel } from './data';
import { Press, Row, SOUND, T, useProto } from './kit';
import { restStyle, SkinKey } from './skin';

/**
 * The mix's map: today's path (src/home/LearnScreen.tsx and LevelNode.tsx),
 * kept as it is, as David asked on 2026-09-29 ("keep the path design as it is
 * right now"), with his changes:
 * - the level buttons are smaller, and small scenes stand at the sides;
 * - a finished level drops its ring (its progress bar) and keeps its check;
 * - the top bar reads, left to right, the path's logo, the streak, the gems
 *   and the hearts, evenly spaced;
 * - every level wears its own symbol, as Chapter 1's do;
 * - fewer words: a level's label is its title, and nothing is cut off;
 * - a bonus side lesson beside the path (see Bonus.tsx).
 * Like the rest of the mix it wears the look's colours, surfaces and key.
 */

/** The ring's box and the button inside it: 76 and 58 where today has 96 and 72. */
const RING = 76;
const NODE = 58;
const STROKE = 6;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
/** Between two levels' centres; today's is 172. */
const STEP_Y = 148;
/** The path winds: centre, left, centre, right. */
const WIND = [0, -1, 0, 1];
/** The chapter's card, and the room under it for the tag over a first level. */
const HEAD_H = 84;
const NODES_TOP = 52;
const CARD_H = 210;
const BONUS_NODE = 48;
const PURPLE = '#8B5CF6';

/**
 * A scene at a level's free side, where its label is not: one beside every
 * level but the one the bonus stands beside. At its size where there is room,
 * smaller where there is less, and left out below `SCENE_MIN`.
 */
const SCENES: Partial<Record<number, { kind: DecoKind; size: number }>> = {
  0: { kind: 'candles', size: 68 },
  1: { kind: 'target', size: 60 },
  2: { kind: 'coins', size: 64 },
  3: { kind: 'gems', size: 60 },
  5: { kind: 'hourglass', size: 60 },
  6: { kind: 'summit', size: 68 },
  7: { kind: 'bell', size: 60 },
  8: { kind: 'chest', size: 64 },
};
const SCENE_MIN = 40;

type Placed = { l: MapLevel; i: number; x: number; y: number; side: 'left' | 'right' };

export default function PathMap() {
  const proto = useProto();
  const { width, goto, p, skin } = proto;
  // The scenes are drawn in the ground's ink, as faint as its heavier grid line.
  const { ink, alpha } = inkOf(skin!.ground.grid[1]);
  const amp = Math.min(64, width * 0.17);
  const cx = width / 2;
  const placed: Placed[] = useMemo(
    () =>
      PATH.levels.map((l, i) => ({
        l,
        i,
        x: cx + WIND[i % WIND.length] * amp,
        y: HEAD_H + NODES_TOP + RING / 2 + i * STEP_Y,
        side: WIND[i % WIND.length] > 0 ? 'left' : 'right',
      })),
    [cx, amp],
  );
  const current = placed.find((n) => n.l.state === 'current')!;
  const after = placed[PATH.bonusAfter - 1];
  // The bonus sits in the free space beside the level that opens it.
  const bonus = { x: (16 + after.x - RING / 2 - 8) / 2, y: after.y };
  const contentH = placed[placed.length - 1].y + RING / 2 + CARD_H + 24;

  const [open, setOpen] = useState<number | null>(null);
  const scroll = useRef<ScrollView | null>(null);
  const focused = useRef(false);

  return (
    <View style={{ flex: 1 }}>
      <Hud />
      <Banner level={current.l} />
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ height: contentH }}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          // The map opens on the level the learner is on, as today's does.
          if (focused.current) return;
          focused.current = true;
          const y = Math.max(0, current.y - e.nativeEvent.layout.height * 0.5);
          scroll.current?.scrollTo({ y, animated: false });
        }}
      >
        <ChapterCard />
        <Dots placed={placed} bonus={bonus} width={width} height={contentH} />
        {placed.map((n) => {
          const scene = SCENES[n.i];
          if (!scene || n.i === PATH.bonusAfter - 1) return null;
          // The scene stands on the side away from the label, centred in what is left.
          const edge = n.side === 'right' ? 16 : width - 16;
          const near = n.side === 'right' ? n.x - RING / 2 - 8 : n.x + RING / 2 + 8;
          const size = Math.min(scene.size, Math.abs(near - edge));
          if (size < SCENE_MIN) return null;
          const at = (edge + near) / 2;
          return (
            <View
              key={`scene${n.i}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: at - size / 2,
                top: n.y - size / 2,
              }}
            >
              <Deco kind={scene.kind} size={size} ink={ink} ground={p.ground} alpha={alpha} />
            </View>
          );
        })}
        <BonusNode x={bonus.x} y={bonus.y} onPress={() => goto('bonus')} />
        {placed.map((n) => (
          <View
            key={n.l.n}
            style={{
              position: 'absolute',
              left: n.x - RING / 2,
              top: n.y - RING / 2,
              width: RING,
              height: RING,
            }}
          >
            <PathNode l={n.l} onPress={() => setOpen((o) => (o === n.i ? null : n.i))} />
            <Label n={n} width={width} />
          </View>
        ))}
        {open !== null ? (
          <>
            <Pressable
              accessibilityLabel="Close the level card"
              style={StyleSheet.absoluteFill}
              onPress={() => setOpen(null)}
            />
            <LevelCard n={placed[open]} width={width} onStart={() => goto('theory')} />
          </>
        ) : null}
      </ScrollView>
      <TabBar />
    </View>
  );
}

/**
 * The top bar, as David ordered it: which path (its logo), the streak, the
 * gems and the hearts, left to right and evenly spaced. Each says what it is
 * to a screen reader; the icons say it to the eye.
 */
function Hud() {
  const { p, skin, theme } = useProto();
  const key = skin!.key;
  const item = (label: string, icon: React.ReactNode, value: string, color: string) => (
    <Row gap={6} style={{ minHeight: 44 }}>
      <View accessible accessibilityLabel={label} style={{ flexDirection: 'row', gap: 6 }}>
        {icon}
        <T v="answer" num color={color} style={{ fontWeight: '700' }}>
          {value}
        </T>
      </View>
    </Row>
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingHorizontal: 8,
        paddingTop: 4,
        paddingBottom: 6,
      }}
    >
      <View
        accessible
        accessibilityLabel={`Path: ${HUD.path}`}
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        <PathLogo size={30} face={key.face} mark={key.text} />
      </View>
      {item(
        `${HUD.streak} day streak`,
        <Icon name="flame" size={22} color={p.amber} filled />,
        String(HUD.streak),
        p.amber,
      )}
      {item(`${HUD.gems} gems`, <Gem size={22} color={GEM[theme]} />, String(HUD.gems), GEM[theme])}
      {item(
        `${HUD.hearts} hearts`,
        <Icon name="heart" size={22} color={p.down} filled />,
        String(HUD.hearts),
        p.down,
      )}
    </View>
  );
}

/** The level the learner is on, named at the top in the key's colour, as today. */
function Banner({ level }: { level: MapLevel }) {
  const { skin } = useProto();
  const key = skin!.key;
  const light = key.text.toUpperCase() === '#FFFFFF';
  return (
    <View
      accessibilityRole="header"
      style={{
        marginHorizontal: 16,
        marginBottom: 4,
        borderRadius: Math.min(16, key.radius + 2),
        backgroundColor: key.face,
        paddingVertical: 12,
        paddingLeft: 16,
        paddingRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <T v="caption" color={key.text} style={{ opacity: 0.8, letterSpacing: 1 }} upper>
          {`Chapter ${PATH.chapter} · Level ${level.n}`}
        </T>
        <T v="title" color={key.text} style={{ fontWeight: '700' }}>
          {level.title}
        </T>
      </View>
      <View
        style={{
          minWidth: 52,
          height: 52,
          borderRadius: 12,
          paddingHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: light ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        }}
      >
        <T v="answer" num color={key.text} style={{ fontWeight: '700' }}>
          {`${level.done + 1}/${level.lessons}`}
        </T>
        <T v="caption" color={key.text} style={{ opacity: 0.8 }}>
          lesson
        </T>
      </View>
    </View>
  );
}

/** The chapter's header card: its number and name, and its levels done. */
function ChapterCard() {
  const proto = useProto();
  const { p, width } = proto;
  return (
    <View
      style={[
        restStyle(proto),
        {
          position: 'absolute',
          top: 8,
          left: 16,
          width: width - 32,
          height: HEAD_H - 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 12,
        },
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: p.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="trophy" size={22} color={p.amber} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T v="caption" color={p.muted} upper style={{ letterSpacing: 1 }}>
          {`Chapter ${PATH.chapter}`}
        </T>
        <T v="answer" style={{ fontWeight: '700' }}>
          {PATH.title}
        </T>
        <Row gap={8}>
          <View
            style={{
              width: 56,
              height: 5,
              borderRadius: 3,
              backgroundColor: p.surfaceAlt,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${(PATH.done / PATH.of) * 100}%`,
                height: 5,
                borderRadius: 3,
                backgroundColor: p.accent,
              }}
            />
          </View>
          <T v="caption" num color={p.muted}>{`${PATH.done}/${PATH.of} levels`}</T>
        </Row>
      </View>
      <View style={{ transform: [{ rotate: '180deg' }] }}>
        <Icon name="chevron-down" size={20} color={p.muted} strokeWidth={2.4} />
      </View>
    </View>
  );
}

/**
 * Dots from each level to the next, lit as far as the learner has got, and a
 * short lit branch out to the bonus.
 */
function Dots({
  placed,
  bonus,
  width,
  height,
}: {
  placed: Placed[];
  bonus: { x: number; y: number };
  width: number;
  height: number;
}) {
  const { p } = useProto();
  const dots: { x: number; y: number; lit: boolean }[] = [];
  const segment = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    lit: boolean,
    clearA: number,
    clearB: number,
  ) => {
    const steps = Math.max(6, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 12));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      // A soft S between the two: out of one straight down, into the next.
      const e = t * t * (3 - 2 * t);
      const x = a.x + (b.x - a.x) * (a.y === b.y ? t : e);
      const y = a.y + (b.y - a.y) * t;
      if (Math.hypot(x - a.x, y - a.y) < clearA || Math.hypot(x - b.x, y - b.y) < clearB) continue;
      dots.push({ x, y, lit });
    }
  };
  for (let i = 0; i < placed.length - 1; i++)
    segment(
      placed[i],
      placed[i + 1],
      placed[i + 1].l.state !== 'locked',
      RING / 2 + 6,
      RING / 2 + 6,
    );
  const from = placed[PATH.bonusAfter - 1];
  segment(from, bonus, true, RING / 2 + 4, BONUS_NODE / 2 + 6);
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((d, k) => (
        <Circle
          key={k}
          cx={d.x}
          cy={d.y}
          r={3.2}
          fill={d.lit ? p.accent : p.surfaceAlt}
          opacity={d.lit ? 0.7 : 1}
        />
      ))}
    </Svg>
  );
}

/** A Checkpoint's face: a shield filling the button, as today's LevelNode draws it. */
function ShieldFace({ color, line }: { color: string; line?: string }) {
  return (
    <Svg width={NODE} height={NODE} viewBox="0 0 72 72" style={StyleSheet.absoluteFill}>
      <SvgPath
        d="M36 3 8 13v20c0 17 11.5 30.5 28 36 16.5-5.5 28-19 28-36V13z"
        fill={color}
        stroke={line ?? 'none'}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

/**
 * One level. Today's node, smaller: its symbol on a round button (a shield
 * for a Checkpoint), a ring that fills a lesson at a time while the level is
 * open, a check once it is finished -- and then no ring (David). The level
 * waiting for the learner breathes and wears the Continue tag.
 */
function PathNode({ l, onPress }: { l: MapLevel; onPress: () => void }) {
  const { p, skin } = useProto();
  const key = skin!.key;
  const locked = l.state === 'locked';
  const current = l.state === 'current';
  const finished = l.state === 'done' || l.state === 'perfect';
  const shield = l.kind === 'Checkpoint';
  const face = locked ? p.surfaceAlt : finished ? p.up : key.face;
  const glyph = locked ? p.muted : finished ? '#FFFFFF' : key.text;
  const symbol: IconName = shield ? 'quiz' : l.icon;
  const inset = (RING - NODE) / 2;
  return (
    <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
      {current ? <Halo color={p.accent} /> : null}
      {finished ? null : (
        <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={p.surfaceAlt}
            strokeWidth={STROKE}
            fill="none"
          />
          {current ? (
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={p.accent}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={CIRC * (1 - l.done / l.lessons)}
              rotation={-90}
              origin={`${RING / 2}, ${RING / 2}`}
            />
          ) : null}
        </Svg>
      )}
      <Press
        onPress={onPress}
        sound={SOUND.choose}
        label={`Level ${l.n}: ${l.title}. ${
          locked
            ? 'Locked'
            : finished
              ? l.state === 'perfect'
                ? 'Perfect'
                : 'Done'
              : `${l.done} of ${l.lessons} lessons done`
        }`}
        style={{
          width: NODE,
          height: NODE,
          borderRadius: NODE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: shield ? 'transparent' : face,
          borderWidth: locked && !shield ? 1.5 : 0,
          borderColor: p.lineStrong,
        }}
      >
        {shield ? <ShieldFace color={face} line={locked ? p.lineStrong : undefined} /> : null}
        <View style={shield ? { marginTop: -5 } : null}>
          <Icon name={symbol} size={shield ? 24 : 27} color={glyph} strokeWidth={2.4} />
        </View>
      </Press>
      {finished || locked ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: inset - 5,
            bottom: inset - 5,
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2.5,
            borderColor: p.ground,
            backgroundColor: locked ? p.surfaceAlt : l.state === 'perfect' ? p.amber : p.up,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={locked ? 'lock' : 'check'}
            size={locked ? 12 : 13}
            color={locked ? p.muted : '#FFFFFF'}
            strokeWidth={3.4}
          />
        </View>
      ) : null}
      {current ? <Tag label={l.done === 0 ? 'Start' : 'Continue'} /> : null}
    </View>
  );
}

/** The level waiting for the learner breathes: a ring going out from it (docs/UI.md §7.1). */
function Halo({ color }: { color: string }) {
  const { reduced } = useProto();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.set(withRepeat(withTiming(1, { duration: 1900, easing: EASE_OUT }), -1, false));
  }, [reduced, t]);
  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : 0.5 * (1 - t.get()),
    transform: [{ scale: 1 + 0.34 * t.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: NODE,
          height: NODE,
          borderRadius: NODE / 2,
          borderWidth: 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

/** "Continue" over the level the learner is on, on one line. */
function Tag({ label }: { label: string }) {
  const { p, theme } = useProto();
  const bg = theme === 'dark' ? p.surfaceAlt : '#FFFFFF';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -38, alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: bg,
          borderColor: p.accent,
          borderWidth: 1.5,
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 3,
        }}
      >
        <T
          v="label"
          upper
          lines={1}
          color={p.accent}
          style={{ letterSpacing: 1.2, fontWeight: '700' }}
        >
          {label}
        </T>
      </View>
      <View
        style={{
          width: 10,
          height: 10,
          marginTop: -6,
          backgroundColor: bg,
          borderRightWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: p.accent,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/**
 * A level's title beside it, on the side the path leaves open. Just the title
 * (fewer words), in whole lines: it wraps, it is never cut off, and it is laid
 * out once, so nothing is drawn twice or out of place.
 */
function Label({ n, width }: { n: Placed; width: number }) {
  const { p } = useProto();
  const room = n.side === 'right' ? width - (n.x + RING / 2 + 8) - 16 : n.x - RING / 2 - 8 - 16;
  const w = Math.max(96, Math.min(170, room));
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        height: RING,
        width: w,
        justifyContent: 'center',
        ...(n.side === 'right' ? { left: RING + 8 } : { right: RING + 8 }),
      }}
    >
      <T
        v="label"
        color={n.l.state === 'locked' ? p.muted : p.text}
        style={{
          fontSize: 15,
          lineHeight: 19,
          fontWeight: '700',
          textAlign: n.side === 'left' ? 'right' : 'left',
        }}
      >
        {n.l.title}
      </T>
    </View>
  );
}

/**
 * The bonus side lesson, off the path beside the level that opened it
 * (David: "small fun optional side lessons ... where you don't know where or
 * if there is a setup"). Optional, so it is off the line, and it pays gems.
 */
function BonusNode({ x, y, onPress }: { x: number; y: number; onPress: () => void }) {
  const { p, theme } = useProto();
  return (
    <View
      style={{
        position: 'absolute',
        left: x - BONUS_NODE / 2,
        top: y - BONUS_NODE / 2,
        width: BONUS_NODE,
        height: BONUS_NODE,
        alignItems: 'center',
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: -30, alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: PURPLE,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <T
            v="caption"
            upper
            lines={1}
            color="#FFFFFF"
            style={{ fontWeight: '700', letterSpacing: 1 }}
          >
            Bonus
          </T>
        </View>
      </View>
      <Press
        onPress={onPress}
        sound={SOUND.choose}
        label="Bonus: spot the setup. Optional, pays gems."
        style={{
          width: BONUS_NODE,
          height: BONUS_NODE,
          borderRadius: BONUS_NODE / 2,
          backgroundColor: PURPLE,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Icon name="target" size={22} color="#FFFFFF" strokeWidth={2.4} />
      </Press>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -6,
          bottom: -6,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: p.ground,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Gem size={16} color={GEM[theme]} />
      </View>
    </View>
  );
}

/** Tapping a level opens its card under it, pointing at it, as today. */
function LevelCard({ n, width, onStart }: { n: Placed; width: number; onStart: () => void }) {
  const proto = useProto();
  const { p, skin } = proto;
  const l = n.l;
  const locked = l.state === 'locked';
  const finished = l.state === 'done' || l.state === 'perfect';
  const label = finished ? 'Review' : l.done === 0 ? 'Start' : 'Continue';
  const meta = locked
    ? `Finish Level ${l.n - 1} to open this.`
    : finished
      ? `All ${l.lessons} lessons done.`
      : `Lesson ${l.done + 1} of ${l.lessons} · about 3 min`;
  const top = n.y + RING / 2 + 14;
  return (
    <View
      style={[
        restStyle(proto),
        {
          position: 'absolute',
          top,
          left: 16,
          width: width - 32,
          padding: 16,
          gap: 8,
          backgroundColor: proto.theme === 'dark' ? p.surfaceAlt : '#FFFFFF',
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: -8,
          left: n.x - 16 - 7,
          width: 14,
          height: 14,
          backgroundColor: proto.theme === 'dark' ? p.surfaceAlt : '#FFFFFF',
          borderLeftWidth: skin!.surface.borderWidth,
          borderTopWidth: skin!.surface.borderWidth,
          borderColor: skin!.surface.border,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <T
        v="caption"
        upper
        color={locked ? p.muted : finished ? p.up : p.accent}
        style={{ letterSpacing: 1 }}
      >
        {`Level ${l.n}`}
      </T>
      <T v="title">{l.title}</T>
      <Row gap={6}>
        {Array.from({ length: l.lessons }, (_, k) => (
          <View
            key={k}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: k < l.done ? p.up : p.line,
              borderWidth: !locked && !finished && k === l.done ? 1.5 : 0,
              borderColor: p.accent,
            }}
          />
        ))}
      </Row>
      <T v="caption" num color={p.muted}>
        {meta}
      </T>
      {locked ? null : (
        <View style={{ marginTop: 4 }}>
          <SkinKey skin={skin!} label={label} onPress={onStart} height={50} />
        </View>
      )}
    </View>
  );
}

/** Today's tab bar: a mark over the open tab. */
function TabBar() {
  const { p } = useProto();
  const tabs: [IconName, string][] = [
    ['learn', 'Learn'],
    ['practice', 'Practice'],
    ['account', 'Account'],
  ];
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: p.lineStrong,
        paddingBottom: 12,
      }}
    >
      {tabs.map(([icon, label], i) => {
        const on = i === 0;
        const color = on ? p.accent : p.muted;
        return (
          <View
            key={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, alignItems: 'center', paddingTop: 6, gap: 2, minHeight: 52 }}
          >
            <View
              style={{
                width: 28,
                height: 3,
                borderRadius: 2,
                marginTop: -6,
                marginBottom: 5,
                backgroundColor: on ? p.accent : 'transparent',
              }}
            />
            <Icon name={icon} size={24} color={color} filled={on} />
            <T v="caption" color={color}>
              {label}
            </T>
          </View>
        );
      })}
    </View>
  );
}
