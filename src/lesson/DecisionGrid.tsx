import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { colors, radius, space, type, themed } from '../theme';
import type { GridCell } from './decisionReveal';
import { SPRING_POP } from './motion';
import { useReduceMotion } from './useReduceMotion';

/**
 * The decision grid (docs/UI.md §5.1b, §6.8; David approved it on 2026-10-03):
 * the decision against the result, four cells. "Right call, lost anyway"
 * becomes a place on the grid instead of only a sentence.
 *
 * `small` is the reveal's: four cells with their row and column names, and a
 * dot that lands in this trade's cell. The large one is a teaching card's
 * visual (`decision-grid`), each cell named.
 */
export type DecisionCellName = 'right-won' | 'right-lost' | 'wrong-won' | 'wrong-lost';

const CELL_WORDS: Record<DecisionCellName, string> = {
  'right-won': 'Earned it',
  'right-lost': 'Right call, lost anyway',
  'wrong-won': 'Lucky',
  'wrong-lost': 'A lesson',
};

/** On the large grid, how far the dot sits below its cell's top edge. */
const DOT_INSET = 9;

export function cellOf(name: DecisionCellName): GridCell {
  const [row, col] = name.split('-') as ['right' | 'wrong', 'won' | 'lost'];
  return { row, col, hollow: false };
}

export default function DecisionGrid({
  cell,
  size = 'small',
  delay = 260,
}: {
  cell?: GridCell;
  size?: 'small' | 'large';
  /** When the dot lands, after the panel has arrived. */
  delay?: number;
}) {
  const reduced = useReduceMotion();
  const land = useSharedValue(reduced || !cell ? 1 : 0);
  useEffect(() => {
    if (reduced || !cell) return;
    land.set(withDelay(delay, withSpring(1, SPRING_POP)));
  }, [reduced, cell, delay, land]);
  const dot = useAnimatedStyle(() => ({
    opacity: Math.min(1, land.get() * 2),
    transform: [{ scale: 0.4 + 0.6 * land.get() }],
  }));

  const large = size === 'large';
  const cellW = large ? 112 : 34;
  // The large cell holds its name and, above it, room for the dot.
  const cellH = large ? 76 : 24;
  const gap = large ? 6 : 4;
  const rowLabelW = large ? 92 : 44;
  const lit = (row: 'right' | 'wrong', col: 'won' | 'lost') =>
    !!cell && cell.row === row && cell.col === col;

  const d = large ? 16 : 12;
  // The dot's centre in the grid's own box: a row's middle, or the line
  // between the rows for an amber call; the same across the columns. On the
  // large grid it sits at the top of its cell, above the cell's name.
  const top0 = large ? 22 : 18;
  const inCell = large ? DOT_INSET + d / 2 : cellH / 2;
  const rowY = (r: GridCell['row']) =>
    top0 + (r === 'right' ? inCell : r === 'wrong' ? cellH + gap + inCell : cellH + gap / 2);
  const colX = (c: GridCell['col']) =>
    rowLabelW +
    gap +
    (c === 'won' ? cellW / 2 : c === 'lost' ? cellW + gap + cellW / 2 : cellW + gap / 2);

  return (
    <View
      style={{ width: rowLabelW + gap + cellW * 2 + gap }}
      accessible
      accessibilityLabel={
        cell
          ? `Decision grid: ${cell.row === 'between' ? 'a fair call' : cell.row === 'right' ? 'right call' : 'not this time'}, ${
              cell.col === 'between' ? 'even' : cell.col
            }${cell.hollow ? ', had you traded' : ''}.`
          : 'Decision grid: right call or not, won or lost.'
      }
    >
      <View style={[styles.head, { paddingLeft: rowLabelW + gap, gap }]}>
        <Text style={[styles.colName, { width: cellW }]}>Won</Text>
        <Text style={[styles.colName, { width: cellW }]}>Lost</Text>
      </View>
      {(['right', 'wrong'] as const).map((row) => (
        <View key={row} style={[styles.row, { gap, marginTop: row === 'wrong' ? gap : 0 }]}>
          <Text style={[styles.rowName, { width: rowLabelW }]} numberOfLines={1}>
            {large
              ? row === 'right'
                ? 'Good call'
                : 'Not this time'
              : row === 'right'
                ? 'Right'
                : 'Wrong'}
          </Text>
          {(['won', 'lost'] as const).map((col) => (
            <View
              key={col}
              style={[
                styles.cell,
                { width: cellW, height: cellH },
                large && { paddingTop: DOT_INSET + d },
                lit(row, col) && (row === 'right' ? styles.cellRight : styles.cellWrong),
              ]}
            >
              {large ? (
                <Text style={[styles.cellText, lit(row, col) && styles.cellTextOn]}>
                  {CELL_WORDS[`${row}-${col}` as DecisionCellName]}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ))}
      {cell ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dot,
            {
              width: d,
              height: d,
              borderRadius: d / 2,
              left: colX(cell.col) - d / 2,
              top: rowY(cell.row) - d / 2,
            },
            cell.hollow ? styles.dotHollow : null,
            dot,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = themed(() => ({
  head: { flexDirection: 'row', height: 18, alignItems: 'flex-end', marginBottom: 2 },
  colName: {
    ...type.small,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowName: { ...type.small, fontSize: 13, lineHeight: 16, color: colors.textMuted },
  cell: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  cellRight: {
    borderStyle: 'solid',
    borderColor: colors.success,
    backgroundColor: colors.successTint,
  },
  cellWrong: { borderStyle: 'solid', borderColor: colors.down, backgroundColor: colors.downTint },
  cellText: {
    ...type.small,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  cellTextOn: { color: colors.text, fontWeight: '700' },
  dot: {
    position: 'absolute',
    backgroundColor: colors.text,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  dotHollow: { backgroundColor: colors.surface, borderColor: colors.text },
}));
