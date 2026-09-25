import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { copy } from '../format';
import { colors, radius, space, type } from '../theme';

/** docs/UI.md §6.4 — the level file's `state` strings as chips above the chart. */
export default function StateChips({ state }: { state: string[] }) {
  return (
    <View style={styles.row}>
      {state.map((chip) => (
        <View key={chip} style={styles.chip}>
          <Text style={styles.text}>{copy(chip)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 5,
  },
  text: { ...type.small, color: colors.textMuted },
});
