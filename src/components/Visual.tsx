import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '../theme';
import type { ChartSpec, ComponentId } from '../types';
import Chart, { chartHeightFor, chartWidthFor } from './Chart';
import { useGridAnchor } from './gridAlign';
import BarChart from './data/BarChart';
import CostStack from './data/CostStack';
import JournalTable from './data/JournalTable';
import {
  HotkeyPad,
  InternalsPanel,
  PlanSheet,
  RTracker,
  StatsCard,
} from './data/MiscPanels';
import OrderBook from './data/OrderBook';
import OrderTicket from './data/OrderTicket';
import OwnershipPie from './data/OwnershipPie';
import QuotePanel from './data/QuotePanel';
import ScannerTable from './data/ScannerTable';
import SessionRibbon from './data/SessionRibbon';
import DrawOnChart from './DrawOnChart';
import QuoteCard from './QuoteCard';

/**
 * Renders a component id from docs/UI.md §6 with its `data` / `visual_data`.
 *
 * `onTapTarget` and `highlight` are what make the same component serve a plain
 * `visual` screen, a `walkthrough` spotlight and a `hotspot` question without
 * three copies of it existing.
 */
export default function Visual({
  component,
  data,
  width,
  onTapTarget,
  highlight,
  planValues,
}: {
  component: ComponentId;
  data: Record<string, any> | undefined;
  width: number;
  onTapTarget?: (id: string) => void;
  highlight?: Record<string, string>;
  planValues?: Record<string, string>;
}) {
  // Hooks run before the early return. Every chart in the app snaps to the
  // backdrop, not just the one inside a `chart-decision` -- a theory card whose
  // chart ignored the grid was the most visible half of "sometimes aligned".
  const grid = useGridAnchor(component);

  if (!data) return null;

  switch (component) {
    case 'quote-card':
      return <QuoteCard data={data as any} highlight={highlight} onTapTarget={onTapTarget} />;
    case 'quote-panel':
      return <QuotePanel data={data as any} highlight={highlight} onTapTarget={onTapTarget} />;
    case 'order-ticket':
      return <OrderTicket data={data as any} highlight={highlight} onTapTarget={onTapTarget} />;
    case 'order-book':
      return (
        <OrderBook
          bids={data.bids ?? []}
          asks={data.asks ?? []}
          onTapRow={onTapTarget}
          resolved={highlight}
        />
      );
    case 'ownership-pie':
      return <OwnershipPie data={data as any} />;
    case 'bar-chart':
      return <BarChart data={data as any} />;
    case 'session-ribbon':
      return <SessionRibbon data={data as any} />;
    case 'cost-stack':
      return <CostStack data={data as any} />;
    case 'scanner-table':
      return (
        <ScannerTable rows={data.rows ?? []} onTapRow={onTapTarget} resolved={highlight} />
      );
    case 'journal-table':
      return <JournalTable columns={data.columns ?? []} rows={data.rows ?? []} />;
    case 'internals-panel':
      return <InternalsPanel data={data as any} />;
    case 'hotkey-pad':
      return <HotkeyPad data={data as any} />;
    case 'stats-card':
      return <StatsCard data={data as any} />;
    case 'r-tracker':
      return <RTracker data={data as any} />;
    case 'plan-sheet':
      return <PlanSheet data={data as any} values={planValues} />;
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
      const hasVolume = Array.isArray(spec.volume) && spec.volume.length > 0;
      const chartWidth = chartWidthFor(width, hasVolume);
      return (
        <View ref={grid.ref} onLayout={grid.onLayout} style={styles.chartBox}>
          <DrawOnChart bars={bars}>
            {(visibleCount, draw) => (
              <Chart
                spec={spec}
                visibleCount={visibleCount}
                width={chartWidth}
                height={chartHeightFor(hasVolume)}
                showDecisionMarker={false}
                draw={spec.kind === 'line' ? draw : undefined}
                gridAnchor={grid.gridAnchor}
              />
            )}
          </DrawOnChart>
        </View>
      );
    }
    default:
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {`No renderer for component "${component}".`}
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  chartBox: { alignSelf: 'center' },
  placeholder: {
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: space.lg,
  },
  placeholderText: { ...type.small, color: colors.textFaint },
});
