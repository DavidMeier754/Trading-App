import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '../theme';
import type { ChartSpec, ComponentId } from '../types';
import Chart from './Chart';
import DrawOnChart from './DrawOnChart';
import QuoteCard from './QuoteCard';

/**
 * Renders a `visual` / `component` id from docs/UI.md §6 with its `visual_data`.
 * This player implements only the two ids level-01-1 uses; anything else says so
 * rather than pretending.
 */
export default function Visual({
  component,
  data,
  width,
}: {
  component: ComponentId;
  data: Record<string, any> | undefined;
  width: number;
}) {
  if (!data) return null;

  switch (component) {
    case 'quote-card':
      return <QuoteCard data={data as any} />;
    case 'chart-line':
    case 'chart-candles': {
      const spec: ChartSpec = {
        kind: component === 'chart-line' ? 'line' : 'candles',
        data: data.data,
        decision_index: data.decision_index ?? -1,
        volume: data.volume,
        levels: data.levels,
        vwap: data.vwap,
      };
      const bars = Array.isArray(spec.data) ? spec.data.length : 0;
      return (
        <DrawOnChart bars={bars}>
          {(visibleCount) => (
            <Chart
              spec={spec}
              visibleCount={visibleCount}
              width={width}
              height={200}
              showDecisionMarker={false}
            />
          )}
        </DrawOnChart>
      );
    }
    default:
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {`Component "${component}" is not part of this slice.`}
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  placeholder: {
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: space.lg,
  },
  placeholderText: { ...type.small, color: colors.textFaint },
});
