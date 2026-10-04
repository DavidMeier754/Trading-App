import React, { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, radius, space, themed, type } from '../../theme';
import { coinFeedback } from '../feedback';
import { surfaceStyle, useLookSpec } from '../look';
import type { WinRow } from './data';

/** Coins no closer together than this, however fast a number runs. */
const COIN_GAP_MS = 55;

/** A block arriving: fades up from a little below. */
export function useRise(v: SharedValue<number>, travel: number) {
  return useAnimatedStyle(() => ({
    opacity: Math.min(1, v.get()),
    transform: [{ translateY: (1 - Math.min(1, v.get())) * travel }],
  }));
}

/**
 * A number counting up to `to` on its own curve (`t`, 0 to 1). It crosses to
 * React only when the shown integer changes -- a few dozen times, never every
 * frame -- and each step is a coin you hear, no closer together than 55 ms.
 */
export function useCount(t: SharedValue<number>, to: number, start: number, coins = true): number {
  const [shown, setShown] = useState(start);
  const last = useRef(0);
  const onValue = useCallback(
    (value: number) => {
      setShown(value);
      const now = Date.now();
      if (coins && value > 0 && now - last.current >= COIN_GAP_MS) {
        last.current = now;
        coinFeedback();
      }
    },
    [coins],
  );
  useAnimatedReaction(
    () => Math.round(to * Math.min(1, t.get())),
    (value, previous) => {
      if (value !== previous) scheduleOnRN(onValue, value);
    },
    [to, onValue],
  );
  return shown;
}

/** The breakdown under a design: the rows on a card of the look's surface. */
export function RowsCard({ rows, style }: { rows: WinRow[]; style?: object }) {
  const spec = useLookSpec();
  return (
    <Animated.View style={[styles.rows, surfaceStyle(spec), style]}>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Text style={[styles.rowValue, row.accent && { color: colors.warning }]}>
            {row.value}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = themed(() => ({
  rows: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  rowLabel: { ...type.answer, color: colors.textMuted },
  rowValue: { ...type.answer, color: colors.text },
}));
