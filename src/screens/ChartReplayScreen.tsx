import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Chart from '../components/Chart';
import type { AnswerValue } from '../lesson/answers';
import { replayLabels } from '../lesson/answers';
import { commitHaptic, selectHaptic } from '../lesson/haptics';
import { colors, radius, space, TAP_TARGET, type } from '../theme';
import type { ChartReplayScreen as S } from '../types';
import { Prompt } from './common';

const LABEL_COLOR: Record<string, string> = {
  Textbook: colors.success,
  Passed: colors.success,
  Early: colors.warning,
  Late: colors.warning,
  Missed: colors.warning,
  Phantom: colors.warning,
};

/**
 * docs/UI.md §4.4 `chart-replay` — the spot-it engine.
 *
 * No autoplay and no clock: the learner taps "Next bar" and the chart never
 * advances on its own (§1.6). They may act at any bar, or end the replay with
 * "Nothing here". The post-mortem walks each marked moment and says which of
 * the setup card's fields were filled at that bar — so a Phantom reads as
 * "the card wants the third field", not "wrong".
 */
export default function ChartReplayScreen({
  screen,
  value,
  onChange,
  revealed,
  width,
}: {
  screen: S;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  width: number;
}) {
  const state =
    value.kind === 'replay' ? value : { kind: 'replay' as const, acted: [], ended: false };
  const total = screen.chart.data.length;
  const startBar = screen.start_bar ?? 4;
  const [bar, setBar] = React.useState(startBar);

  const height = screen.chart.volume ? 250 : 220;
  const atEnd = bar >= total;

  const act = (side: 'long' | 'short') => {
    commitHaptic();
    onChange({ ...state, acted: [...state.acted, { bar: bar - 1, side }] });
  };

  const end = () => {
    commitHaptic();
    onChange({ ...state, ended: true });
  };

  if (state.ended || revealed) {
    const labels = replayLabels(screen, state);
    const decoys = labels.filter((l) => l.moment?.kind === 'decoy');
    const passed = decoys.filter((l) => l.label === 'Passed').length;

    return (
      <View style={styles.wrap}>
        <Text style={styles.postTitle}>Post-mortem</Text>
        {labels.length === 0 ? (
          <Text style={styles.cleanRun}>
            Nothing formed and you took nothing. That is the run.
          </Text>
        ) : null}
        <View style={styles.momentList}>
          {labels.map((l, i) => (
            <View key={i} style={styles.moment}>
              <View style={styles.momentHead}>
                <Text style={[styles.momentLabel, { color: LABEL_COLOR[l.label] }]}>
                  {l.label}
                </Text>
                <Text style={styles.momentBar}>{`bar ${l.bar + 1}`}</Text>
              </View>
              <Text style={styles.momentNote}>
                {l.moment?.note ?? 'Nothing was marked here.'}
              </Text>
              {l.moment?.fields ? (
                <View style={styles.fieldRow}>
                  {l.moment.fields.map((f) => (
                    <View
                      key={f.label}
                      style={[
                        styles.fieldPip,
                        {
                          borderColor: f.filled ? colors.success : colors.borderStrong,
                          backgroundColor: f.filled ? colors.successTint : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.fieldText,
                          { color: f.filled ? colors.success : colors.textFaint },
                        ]}
                      >
                        {f.label}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
        {decoys.length > 0 ? (
          <Text style={styles.discipline}>
            {`Discipline: ${passed} of ${decoys.length} decoys passed.`}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Prompt>{screen.prompt}</Prompt>

      <Chart
        spec={{ ...screen.chart, decision_index: -1 }}
        visibleCount={bar}
        width={width}
        height={height}
        showDecisionMarker={false}
      />

      <Text style={styles.barCount}>
        {`Bar ${Math.min(bar, total)} of ${total}${state.acted.length ? ` · ${state.acted.length} taken` : ''}`}
      </Text>

      <View style={styles.actions}>
        <Pressable onPress={() => act('long')} style={[styles.action, { borderColor: colors.up }]}>
          <Text style={styles.actionText}>Long</Text>
        </Pressable>
        <Pressable onPress={() => act('short')} style={[styles.action, { borderColor: colors.down }]}>
          <Text style={styles.actionText}>Short</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          disabled={atEnd}
          onPress={() => {
            selectHaptic();
            setBar((b) => Math.min(b + 1, total));
          }}
          style={[styles.action, styles.next, atEnd && styles.actionOff]}
        >
          <Text style={styles.actionText}>{atEnd ? 'End of session' : 'Next bar'}</Text>
        </Pressable>
        <Pressable onPress={end} style={styles.action}>
          <Text style={styles.actionText}>Nothing here</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.sm },
  barCount: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: space.sm },
  action: {
    flex: 1,
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  next: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  actionOff: { opacity: 0.45 },
  actionText: { ...type.answer, color: colors.text },
  postTitle: { ...type.title, color: colors.text },
  cleanRun: { ...type.body, color: colors.success },
  momentList: { gap: space.md },
  moment: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  momentHead: { flexDirection: 'row', justifyContent: 'space-between' },
  momentLabel: { ...type.answer, fontWeight: '700' },
  momentBar: { ...type.small, color: colors.textFaint },
  momentNote: { ...type.small, color: colors.text },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.xs },
  fieldPip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  fieldText: { ...type.small, fontSize: 10 },
  discipline: { ...type.small, color: colors.textMuted },
});
