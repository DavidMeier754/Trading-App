import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Icon from '../home/icons';
import { MAX_HEARTS, useProgress } from '../progress';
import { colors, type } from '../theme';
import { useLookSpec } from './look';

/**
 * The learner's hearts, at the right end of the lesson's top bar -- the same
 * count the home screen shows, so what a test will cost is never a surprise.
 *
 * docs/UI.md §5.2: only tests and exams spend a heart. In a lesson the count
 * just sits there; a wrong answer never touches it (§1.6).
 */
export default function HeartMeter() {
  const { hearts } = useProgress();
  const spec = useLookSpec();
  const big = spec.id === 'arcade';
  const mono = spec.streak === 'count';
  const tint = hearts > 0 ? colors.down : colors.textFaint;
  return (
    <View
      style={styles.wrap}
      accessibilityRole="text"
      accessibilityLabel={`${hearts} of ${MAX_HEARTS} hearts`}
    >
      <Icon name="heart" size={big ? 24 : 20} color={tint} />
      <Text style={[styles.count, big && styles.countBig, mono && styles.mono, { color: tint }]}>
        {hearts}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  count: { ...type.label, fontSize: 16, lineHeight: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  countBig: { fontSize: 18, lineHeight: 22 },
  // Terminal: a readout, like its streak count.
  mono: { ...type.mono, fontSize: 15, fontFamily: 'monospace', fontWeight: '700' },
});
