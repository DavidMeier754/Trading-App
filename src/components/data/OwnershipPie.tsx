import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, space, type } from '../../theme';

/** docs/UI.md §6.1 — a circle of N equal slices, `owned` of them filled. */
export default function OwnershipPie({
  data,
  size = 150,
}: {
  data: { total: number; owned: number };
  size?: number;
}) {
  const { total, owned } = data;
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const slice = (i: number) => {
    const a0 = (i / total) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`;
  };

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        {Array.from({ length: total }, (_, i) => (
          <Path
            key={i}
            d={slice(i)}
            fill={i < owned ? colors.accent : colors.surfaceAlt}
            stroke={colors.background}
            strokeWidth={1}
          />
        ))}
      </Svg>
      <Text style={styles.caption}>
        {`${owned} of ${total} = ${((owned / total) * 100).toFixed(0)} %`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm },
  caption: { ...type.body, color: colors.textMuted },
});
