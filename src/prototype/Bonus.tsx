import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { cue, revealFeedback } from '../lesson/feedback';
import { emitMood } from '../lesson/look';
import { Gem, GEM } from './art';
import { Cta, RevealCard } from './Calm';
import { BONUS, type BonusRound } from './data';
import { CandleChart, Enter, Press, Row, SOUND, T, usePlayback, useProto } from './kit';
import { Screen } from './layout';
import { restStyle, SkinKey } from './skin';

/**
 * The bonus side lesson, off the path (David, 2026-09-29: "small fun optional
 * side lessons ... fun practical trading exercises where you don't know where
 * or if there is a setup"). It is the spot-it replay of docs/UI.md §4.4 in
 * miniature: a chart that moves only when the learner taps Next bar, a Buy
 * at any bar, and a grade from the bar index. Two charts: one with a setup,
 * one with none. It costs nothing and pays gems.
 */

type Grade = 'textbook' | 'early' | 'late' | 'missed' | 'phantom' | 'passed';

/** docs/UI.md §4.4: the label comes from arithmetic on the bar index. */
export function gradeReplay(trigger: number | null, bought: number | null): Grade {
  if (trigger === null) return bought === null ? 'passed' : 'phantom';
  if (bought === null) return 'missed';
  if (Math.abs(bought - trigger) <= 1) return 'textbook';
  return bought < trigger ? 'early' : 'late';
}

const COPY: Record<Grade, { title: string; line: string }> = {
  textbook: { title: 'Textbook', line: 'You bought the first candle that turned up off support.' },
  early: { title: 'Early', line: 'Price was still falling. Wait for a candle that turns up.' },
  late: { title: 'Late', line: 'The move had already left. The setup came a few bars earlier.' },
  missed: { title: 'Missed', line: 'The setup was here: the pullback that turned up.' },
  phantom: { title: 'No setup here', line: 'Price only swung inside its range.' },
  passed: { title: 'Passed', line: 'No setup on this chart. Passing was right.' },
};

/** How long "Next bar" takes to form its candle: short, and a tap finishes it. */
const FORM_MS = 260;

export default function Bonus() {
  const { next } = useProto();
  const [round, setRound] = useState(0);
  return (
    <Round
      key={round}
      index={round}
      onDone={() => (round + 1 < BONUS.rounds.length ? setRound(round + 1) : next())}
    />
  );
}

function Round({ index, onDone }: { index: number; onDone: () => void }) {
  const proto = useProto();
  const { p, width, height, skin, reduced, goto } = proto;
  const r: BonusRound = BONUS.rounds[index];
  const total = r.candles.length;
  const last = index === BONUS.rounds.length - 1;

  // `pos`: bars on screen, the last possibly still forming (a fraction).
  const [pos, setPos] = useState(r.start);
  const [bought, setBought] = useState<number | null>(null);
  const [phase, setPhase] = useState<'watch' | 'playing' | 'reveal'>('watch');
  const raf = useRef(0);
  const target = useRef(r.start);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const reveal = useCallback(
    (buy: number | null) => {
      setPhase('reveal');
      const g = gradeReplay(r.trigger, buy);
      const good = g === 'textbook' || g === 'passed';
      revealFeedback(good ? 'correct' : 'amber');
      emitMood(good ? 'correct' : 'amber');
    },
    [r.trigger],
  );

  // Next bar: the next candle forms, quickly. A second tap finishes the one
  // forming and starts the next; the end of the chart without a Buy ends it.
  const step = () => {
    if (phase !== 'watch') return;
    cancelAnimationFrame(raf.current);
    const from = target.current;
    const to = Math.min(total, from + 1);
    target.current = to;
    if (reduced) {
      setPos(to);
      if (to === total) reveal(null);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const u = Math.min(1, (Date.now() - start) / FORM_MS);
      setPos(from + u);
      if (u < 1) raf.current = requestAnimationFrame(tick);
      else if (to === total) reveal(null);
    };
    setPos(from);
    raf.current = requestAnimationFrame(tick);
  };

  const buy = () => {
    if (phase !== 'watch') return;
    cancelAnimationFrame(raf.current);
    const at = target.current - 1;
    setPos(target.current);
    setBought(at);
    cue(SOUND.commit);
    emitMood('commit');
    setPhase('playing');
  };

  // After a Buy, the rest of the chart plays out: what happened next.
  const onScreen = bought !== null ? bought + 1 : total;
  const rest = total - onScreen;
  const ended = useCallback(() => reveal(bought), [reveal, bought]);
  const play = usePlayback(Math.max(1, rest), 200, phase === 'playing', ended);
  const shown =
    bought !== null ? Math.min(total, onScreen + (phase === 'reveal' ? rest : play.pos)) : pos;

  const grade = phase === 'reveal' ? gradeReplay(r.trigger, bought) : null;
  const good = grade === 'textbook' || grade === 'passed';
  const marks: { at: number; color: string; label?: string }[] = [];
  if (grade) {
    if (r.trigger !== null) marks.push({ at: r.trigger, color: p.up, label: 'Setup' });
    if (bought !== null && bought !== r.trigger)
      marks.push({ at: bought, color: good ? p.up : p.amber, label: 'You' });
  }
  const entry = bought !== null ? r.candles[bought].c : null;
  const chartW = width - 40 - 6 - 2 * (skin?.surface.borderWidth ?? 1);
  // The chart takes the room the screen has; the keys stay in the thumb zone.
  const chartH = Math.round(Math.max(220, Math.min(340, height * 0.36)));

  return (
    <Screen
      header={
        <Row
          gap={10}
          style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6, minHeight: 48 }}
        >
          <Press
            label="Close the bonus"
            onPress={() => goto('map')}
            style={{
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -12,
            }}
          >
            <T v="title" color={p.muted}>
              ✕
            </T>
          </Press>
          <View
            style={{
              backgroundColor: '#8B5CF6',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <T v="caption" upper color="#FFFFFF" style={{ fontWeight: '700', letterSpacing: 1 }}>
              Bonus
            </T>
          </View>
          <T v="label" color={p.text} style={{ flex: 1 }} lines={1}>
            Spot the setup
          </T>
          <T v="label" num color={p.muted}>{`${index + 1}/${BONUS.rounds.length}`}</T>
        </Row>
      }
      top={
        <>
          <Enter style={{ marginTop: 8 }}>
            <T v="prompt">Buy when you see a setup. There may be none.</T>
          </Enter>
          <Enter i={1} style={{ marginTop: 12 }}>
            <Press sound={null} onPress={phase === 'playing' ? play.skip : undefined} label="Chart">
              <View style={[restStyle(proto), { paddingVertical: 6, paddingLeft: 6 }]}>
                <CandleChart
                  candles={r.candles}
                  shown={shown}
                  width={chartW}
                  height={chartH}
                  kind="mix"
                  domain={Math.max(1, Math.ceil(shown))}
                  marks={marks}
                  lines={
                    entry !== null
                      ? [
                          {
                            price: entry,
                            label: `Buy ${entry.toFixed(2)}`,
                            color: p.muted,
                            dash: true,
                          },
                        ]
                      : []
                  }
                />
              </View>
            </Press>
          </Enter>
          {phase === 'watch' ? (
            <T v="caption" num color={p.muted} style={{ marginTop: 8 }}>
              {`Bar ${Math.ceil(pos)} of ${total}`}
            </T>
          ) : null}
        </>
      }
      reserve={96}
      reveal={
        grade ? (
          <RevealCard
            show
            tone={good ? p.up : p.amber}
            tint={good ? p.upTint : p.amberTint}
            title={COPY[grade].title}
          >
            <T v="body">{COPY[grade].line}</T>
            {last ? (
              <Row gap={6}>
                <Gem size={18} color={GEM[proto.theme]} />
                <T v="label" num color={p.text}>{`+${BONUS.reward} gems`}</T>
              </Row>
            ) : null}
          </RevealCard>
        ) : null
      }
      footer={
        phase === 'reveal' ? (
          <Cta label={last ? 'Continue' : 'Next chart'} onPress={onDone} />
        ) : (
          <Row gap={10} style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Press
                sound={null}
                disabled={phase !== 'watch'}
                onPress={buy}
                style={[
                  restStyle(proto),
                  {
                    height: 54,
                    borderColor: p.up,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <T v="answer" color={p.up} lines={1}>
                  Buy
                </T>
              </Press>
            </View>
            <View style={{ flex: 1.4 }}>
              {skin ? (
                <SkinKey
                  skin={skin}
                  label="Next bar"
                  disabled={phase !== 'watch'}
                  sound={SOUND.small}
                  onPress={step}
                />
              ) : null}
            </View>
          </Row>
        )
      }
    />
  );
}
