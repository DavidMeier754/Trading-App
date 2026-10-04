import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, MONO_FONT, space, themed, type } from '../../theme';
import { detentFeedback } from '../feedback';
import { shade, surfaceStyle, useLookSpec } from '../look';
import { SPRING_POP } from '../motion';
import { useReduceMotion } from '../useReduceMotion';
import type { WinData } from './data';

const TILE_W = 28;
const TILE_H = 40;
/** A flap falling, and one character to the next. */
const FLAP_MS = 70;
const FLAP_STEP = 86;
/** Every tile turns over this many times on its way to its character. */
const FLAPS = 6;
/** The drum each tile turns: the digits, then the signs. */
const DRUM = '0123456789+%/';
/** When the first row starts, the gap to each next row, and to each next tile along. */
const BOARD_AT = 240;
const ROW_GAP = 380;
const TILE_GAP = 95;

/** What a tile shows on its way to `target`: blank, then up the drum to it. */
function flapsTo(target: string): string[] {
  const at = DRUM.indexOf(target);
  if (at < 0) return [' ', target];
  return [
    ' ',
    ...Array.from(
      { length: FLAPS },
      (_, j) => DRUM[(at - FLAPS + 1 + j + DRUM.length) % DRUM.length],
    ),
  ];
}

/** The board's rows: a label and a value of digits and signs. */
function boardRows(d: WinData): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (!d.practice) rows.push({ label: 'XP', value: `+${d.earned}` });
  if (d.bonus > 0 && !d.practice) rows.push({ label: 'BONUS', value: `+${d.bonus}` });
  rows.push({ label: 'RIGHT', value: `${d.clean}/${d.total}` });
  if (d.gems > 0) rows.push({ label: 'GEMS', value: `+${d.gems}` });
  if (d.hearts !== null) rows.push({ label: 'HEARTS', value: `${d.hearts}/${d.maxHearts}` });
  if (d.streak !== null) rows.push({ label: 'STREAK', value: `${d.streak}` });
  return rows;
}

/** When a row of `tiles` tiles that starts at `at` is complete. */
function rowDone(at: number, tiles: number): number {
  return at + (tiles - 1) * TILE_GAP + (FLAPS - 1) * FLAP_STEP + FLAP_MS;
}

/**
 * docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 [DESIGN-REVIEW] win screen "A split-flap board" (David's
 * pick of 2026-10-04): the results on a board, as at a station. Each tile
 * turns over through its drum to its character, left to right and row by row,
 * with a soft click as each one lands, and a row's lamp lights once it is
 * complete. The last lamp is the landing.
 */
export default function BoardWin({ data, onLand }: { data: WinData; onLand: () => void }) {
  const spec = useLookSpec();
  const reduced = useReduceMotion();
  const rows = boardRows(data);
  const last = useRef(0);
  // A click as each tile lands, never two closer together than 60 ms.
  const onTile = useCallback(() => {
    const now = Date.now();
    if (now - last.current < 60) return;
    last.current = now;
    detentFeedback();
  }, []);
  const end = rows.reduce(
    (m, row, r) => Math.max(m, rowDone(BOARD_AT + r * ROW_GAP, row.value.length)),
    0,
  );
  useEffect(() => {
    if (reduced) {
      onLand();
      return;
    }
    const t = setTimeout(onLand, end + 120);
    return () => clearTimeout(t);
    // Once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={[surfaceStyle(spec), styles.board]}
      accessible
      accessibilityLabel={`Results: ${rows.map((r) => `${r.label.toLowerCase()} ${r.value}`).join(', ')}.`}
    >
      <View style={styles.head}>
        <Text style={styles.title}>RESULTS</Text>
        {data.ref ? <Text style={styles.sub}>{`LESSON ${data.ref}`}</Text> : null}
      </View>
      {rows.map((row, r) => (
        <BoardRow
          key={row.label}
          label={row.label}
          tiles={row.value.split('').map(flapsTo)}
          at={BOARD_AT + r * ROW_GAP}
          reduced={reduced}
          onTile={onTile}
        />
      ))}
    </View>
  );
}

function BoardRow({
  label,
  tiles,
  at,
  reduced,
  onTile,
}: {
  label: string;
  tiles: string[][];
  at: number;
  reduced: boolean;
  onTile: () => void;
}) {
  const done = rowDone(at, tiles.length);
  const lamp = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) lamp.set(withDelay(done, withSpring(1, SPRING_POP)));
  }, [reduced, done, lamp]);
  const lit = useAnimatedStyle(() => ({
    opacity: Math.min(1, lamp.get() * 3),
    transform: [{ scale: lamp.get() }],
  }));
  return (
    <View style={styles.row}>
      <View style={styles.lamp}>
        <Animated.View style={[styles.lampOn, lit]} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.tiles}>
        {tiles.map((seq, i) => (
          <FlapTile key={i} seq={seq} at={at + i * TILE_GAP} reduced={reduced} onTile={onTile} />
        ))}
      </View>
    </View>
  );
}

/**
 * One tile: behind its flap, the top half of the character coming and the
 * bottom half of the one going. At each step the flap is drawn afresh (it is
 * keyed on the step), so the characters and the flap's start change in the
 * same frame and nothing flickers between them.
 */
function FlapTile({
  seq,
  at,
  reduced,
  onTile,
}: {
  seq: string[];
  at: number;
  reduced: boolean;
  onTile: () => void;
}) {
  const end = seq.length - 1;
  const [step, setStep] = useState(reduced ? end : 0);
  useEffect(() => {
    if (reduced) return;
    const timers = Array.from({ length: end }, (_, i) =>
      setTimeout(() => setStep(i + 1), at + i * FLAP_STEP),
    );
    timers.push(setTimeout(onTile, at + (end - 1) * FLAP_STEP + FLAP_MS));
    return () => timers.forEach(clearTimeout);
  }, [reduced, end, at, onTile]);
  const turning = !reduced && step > 0;
  const to = seq[step];
  const from = turning ? seq[step - 1] : to;
  return (
    <View style={styles.tile}>
      <Half char={to} top />
      <Half char={from} />
      {turning ? <Flap key={step} from={from} to={to} /> : null}
      <View style={styles.hinge} />
    </View>
  );
}

/** Half a tile, cut from a whole character: its top half, or its bottom. */
function Half({ char, top = false }: { char: string; top?: boolean }) {
  return (
    <View style={[styles.half, top ? styles.halfTop : styles.halfLow]}>
      <View style={[styles.face, !top && styles.faceLow]}>
        <Text style={styles.char}>{char}</Text>
      </View>
    </View>
  );
}

/** The flap: the old character's top half folds down, then the new one's bottom half lands. */
function Flap({ from, to }: { from: string; to: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    // It falls, so it gathers speed.
    p.set(withTiming(1, { duration: FLAP_MS, easing: Easing.in(Easing.quad) }));
  }, [p]);
  const upper = useAnimatedStyle(() => ({
    opacity: p.get() < 0.5 ? 1 : 0,
    transform: [{ perspective: 400 }, { rotateX: `${-180 * Math.min(0.5, p.get())}deg` }],
  }));
  const lower = useAnimatedStyle(() => ({
    opacity: p.get() < 0.5 ? 0 : 1,
    transform: [{ perspective: 400 }, { rotateX: `${180 * (1 - Math.max(0.5, p.get()))}deg` }],
  }));
  return (
    <>
      <Animated.View style={[styles.half, styles.halfTop, styles.flapUpper, upper]}>
        <View style={styles.face}>
          <Text style={styles.char}>{from}</Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.half, styles.halfLow, styles.flapLower, lower]}>
        <View style={[styles.face, styles.faceLow]}>
          <Text style={styles.char}>{to}</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = themed(() => ({
  board: { alignSelf: 'stretch', padding: space.lg, gap: space.md },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...type.label, color: colors.textMuted, letterSpacing: 1.5 },
  sub: { ...type.small, fontFamily: MONO_FONT, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  lamp: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  lampOn: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  label: { ...type.label, flex: 1, color: colors.text, letterSpacing: 1 },
  tiles: { flexDirection: 'row', gap: 3 },
  tile: { width: TILE_W, height: TILE_H },
  half: { position: 'absolute', left: 0, right: 0, height: TILE_H / 2, overflow: 'hidden' },
  halfTop: {
    top: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: colors.surfaceAlt,
  },
  // A shade darker: the light comes from above.
  halfLow: {
    top: TILE_H / 2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: shade(colors.surfaceAlt, 0.06),
  },
  flapUpper: { transformOrigin: 'bottom' },
  flapLower: { transformOrigin: 'top' },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TILE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceLow: { top: -TILE_H / 2 },
  char: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: MONO_FONT,
    color: colors.text,
    includeFontPadding: false,
  },
  hinge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: TILE_H / 2 - 1,
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
}));
