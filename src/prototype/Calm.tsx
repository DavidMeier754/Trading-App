import React from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import Icon from '../home/icons';
import { CHOICE, COMPLETE, MAP, MATCH, SCENARIO, THEORY, money, outcomeResult } from './data';
import {
  Appear,
  CandleChart,
  Enter,
  Press,
  Row,
  SOUND,
  T,
  usePlayback,
  useProgress,
  useProto,
} from './kit';
import { Ring, Screen } from './layout';
import { decisionCopy, useChoice, useDecision, useMatch } from './logic';
import type { ScreenId } from './directions';

/**
 * Direction 1, "Calm": quiet paper. Hairlines instead of shadows, one accent,
 * full-width answer rows, a reveal that fades up into a slot kept free for it.
 */

function TopBar({ step }: { step: number }) {
  const { p } = useProto();
  return (
    <Row
      gap={14}
      style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6, minHeight: 48 }}
    >
      <Press
        label="Close lesson"
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
      <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: p.line }}>
        <View
          style={{ width: `${step * 100}%`, height: 4, borderRadius: 2, backgroundColor: p.accent }}
        />
      </View>
      <Row gap={4}>
        <Icon name="heart" size={18} color={p.down} filled />
        <T v="label" num color={p.muted}>
          5
        </T>
      </Row>
    </Row>
  );
}

function Cta({
  label,
  onPress,
  disabled,
  tone,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: string;
}) {
  const { p, d } = useProto();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
      <Press
        onPress={onPress}
        disabled={disabled}
        sound={SOUND.advance}
        style={{
          height: 54,
          borderRadius: d.radius,
          backgroundColor: disabled ? p.surfaceAlt : (tone ?? p.accent),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <T v="answer" color={disabled ? p.muted : p.onAccent}>
          {label}
        </T>
      </Press>
    </View>
  );
}

/** The reveal: a quiet card with a coloured edge, fading up into its slot. */
function RevealCard({
  show,
  tone,
  tint,
  title,
  children,
}: {
  show: boolean;
  tone: string;
  tint: string;
  title: string;
  children: React.ReactNode;
}) {
  const { d } = useProto();
  return (
    <Appear show={show} from={8} duration={280}>
      <View
        style={{
          borderRadius: d.radius,
          backgroundColor: tint,
          borderLeftWidth: 3,
          borderLeftColor: tone,
          padding: 14,
          gap: 6,
        }}
      >
        <T v="label" color={tone}>
          {title}
        </T>
        {children}
      </View>
    </Appear>
  );
}

// ---------------------------------------------------------------------------

function Theory() {
  const { p, next, width } = useProto();
  const w = width - 40;
  const cx = w / 2;
  // One big candle: open 9.70, close 9.84, high 9.90, low 9.62, labelled by
  // hairline leaders. The picture is the idea; the text only names it.
  const y = (v: number) => 16 + ((9.92 - v) / 0.32) * 188;
  const label = (text: string, v: number, left: boolean) => (
    <G>
      <Line
        x1={left ? cx - 22 : cx + 22}
        x2={left ? cx - 70 : cx + 70}
        y1={y(v)}
        y2={y(v)}
        stroke={p.lineStrong}
        strokeWidth={1}
      />
      <SvgText
        x={left ? cx - 76 : cx + 76}
        y={y(v) + 5}
        fontSize={14}
        fill={p.muted}
        textAnchor={left ? 'end' : 'start'}
      >
        {text}
      </SvgText>
    </G>
  );
  return (
    <Screen
      header={<TopBar step={0.15} />}
      top={
        <>
          <Enter>
            <View style={{ height: 220, alignItems: 'center', marginTop: 12 }}>
              <Svg width={w} height={220}>
                <Line x1={cx} x2={cx} y1={y(9.9)} y2={y(9.62)} stroke={p.up} strokeWidth={2} />
                <Rect
                  x={cx - 18}
                  y={y(9.84)}
                  width={36}
                  height={y(9.7) - y(9.84)}
                  fill={p.up}
                  rx={3}
                />
                {label('High', 9.9, false)}
                {label('Close', 9.84, true)}
                {label('Open', 9.7, true)}
                {label('Low', 9.62, false)}
              </Svg>
            </View>
          </Enter>
          <Enter i={1} style={{ gap: 10, marginTop: 20 }}>
            <T v="label" color={p.muted}>
              {THEORY.eyebrow}
            </T>
            <T v="title">{THEORY.title}</T>
            <T v="body" color={p.text}>
              {THEORY.body}
            </T>
          </Enter>
        </>
      }
      footer={<Cta label="Continue" onPress={next} />}
    />
  );
}

function Choice() {
  const { p, d, next } = useProto();
  const q = useChoice();
  return (
    <Screen
      header={<TopBar step={0.3} />}
      top={
        <Enter>
          <T v="prompt" style={{ marginTop: 16 }}>
            {CHOICE.prompt}
          </T>
        </Enter>
      }
      answers={
        <Enter i={1} style={{ gap: 10 }}>
          {CHOICE.options.map((o, i) => {
            const chosen = q.sel === i;
            const right = q.checked && i === CHOICE.correct;
            const wrong = q.checked && chosen && i !== CHOICE.correct;
            const edge = right ? p.up : wrong ? p.down : chosen ? p.accent : p.line;
            return (
              <Press
                key={o}
                role="radio"
                label={o}
                onPress={() => q.choose(i)}
                style={{
                  minHeight: 56,
                  borderRadius: d.radius,
                  borderWidth: chosen || right ? 1.5 : 1,
                  borderColor: edge,
                  backgroundColor: right
                    ? p.upTint
                    : wrong
                      ? p.downTint
                      : chosen
                        ? p.accentTint
                        : p.surface,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: edge === p.line ? p.lineStrong : edge,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(chosen || right) && (
                    <View
                      style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: edge }}
                    />
                  )}
                </View>
                <T v="answer" num style={{ flex: 1 }}>
                  {o}
                </T>
                {right && <T color={p.up}>✓</T>}
                {wrong && <T color={p.down}>✕</T>}
              </Press>
            );
          })}
        </Enter>
      }
      reserve={118}
      reveal={
        <RevealCard
          show={q.checked}
          tone={q.grade === 'correct' ? p.up : p.down}
          tint={q.grade === 'correct' ? p.upTint : p.downTint}
          title={q.grade === 'correct' ? 'Correct' : 'Not quite'}
        >
          <T v="body">{CHOICE.explanation}</T>
          {q.grade === 'wrong' && q.sel !== null && CHOICE.why[q.sel] ? (
            <T v="caption" color={p.muted}>
              {CHOICE.why[q.sel]}
            </T>
          ) : null}
        </RevealCard>
      }
      footer={
        q.checked ? (
          <Cta label="Continue" onPress={next} />
        ) : (
          <Cta label="Check" disabled={q.sel === null} onPress={q.check} />
        )
      }
    />
  );
}

function Chart() {
  const { p, d, width, next } = useProto();
  const m = useDecision();
  const all = [...SCENARIO.history, ...SCENARIO.outcome];
  const n0 = SCENARIO.history.length;
  const play = usePlayback(SCENARIO.outcome.length, 360, m.phase === 'playing', m.ended);
  const shown = n0 + (m.phase === 'decide' ? 0 : play.pos);
  const copy = m.side ? decisionCopy(m.side) : null;
  const res = m.side && m.side !== 'none' ? outcomeResult(m.side) : null;
  const tone = copy?.grade === 'correct' ? p.up : copy?.grade === 'amber' ? p.amber : p.down;
  const tint =
    copy?.grade === 'correct' ? p.upTint : copy?.grade === 'amber' ? p.amberTint : p.downTint;
  return (
    <Screen
      header={<TopBar step={0.5} />}
      top={
        <>
          <Enter style={{ gap: 6, marginTop: 8 }}>
            <T v="caption" color={p.muted}>
              {SCENARIO.story}
            </T>
            <T v="prompt">{SCENARIO.prompt}</T>
            <Row gap={16} style={{ marginTop: 2 }}>
              {SCENARIO.state.map((s) => (
                <T key={s} v="caption" num color={p.muted}>
                  {s}
                </T>
              ))}
            </Row>
          </Enter>
          <Enter i={1} style={{ marginTop: 12 }}>
            <Press sound={null} onPress={play.skip} label="Chart. Tap to finish the playback.">
              <CandleChart
                candles={all}
                shown={shown}
                width={width - 40}
                height={196}
                kind="calm"
                splitAt={n0}
                hideAfterSplit={m.phase === 'decide'}
                extent={[SCENARIO.stop, SCENARIO.target]}
                lines={
                  m.phase === 'decide'
                    ? []
                    : [
                        { price: SCENARIO.target, label: 'Target', color: p.up, dash: true },
                        { price: SCENARIO.stop, label: 'Stop', color: p.down, dash: true },
                      ]
                }
              />
            </Press>
          </Enter>
        </>
      }
      reveal={
        copy && m.phase === 'reveal' ? (
          <RevealCard show tone={tone} tint={tint} title={copy.chip}>
            <T v="body">{copy.first}</T>
            <View
              style={{
                borderRadius: 8,
                backgroundColor: p.surface,
                padding: 10,
                gap: 2,
                marginTop: 4,
              }}
            >
              <T v="caption" color={p.muted}>
                {copy.outcome}
              </T>
              {res ? (
                <T v="label" num color={res.total < 0 ? p.down : p.up}>
                  {`${money(res.total)} on ${SCENARIO.shares} shares · ${res.r < 0 ? '−' : '+'}${Math.abs(res.r).toFixed(1)}R`}
                </T>
              ) : (
                <T v="label" num color={p.muted}>
                  Had you bought: −$0.12 per share
                </T>
              )}
            </View>
            {m.side === 'long' && (
              <T v="caption" color={p.text}>
                Right call — this trade lost anyway. This setup loses about 4 in 10 times.{' '}
                <T v="caption" color={p.accent}>
                  Why?
                </T>
              </T>
            )}
            {m.side === 'short' && (
              <T v="caption" color={p.text}>
                This one happened to win. A win on the wrong call is luck, not a plan.
              </T>
            )}
            <T v="caption" color={p.muted}>
              Practice only. Real trading can lose money.
            </T>
          </RevealCard>
        ) : null
      }
      footer={
        m.phase === 'reveal' ? (
          <Cta label="Continue" onPress={next} />
        ) : (
          <Row gap={10} style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
            {(
              [
                ['long', 'Long'],
                ['short', 'Short'],
                ['none', 'No trade'],
              ] as const
            ).map(([s, label]) => (
              <View key={s} style={{ flex: 1 }}>
                <Press
                  sound={null}
                  disabled={m.phase !== 'decide'}
                  onPress={() => m.choose(s)}
                  style={{
                    height: 54,
                    borderRadius: d.radius,
                    borderWidth: 1,
                    borderColor: m.side === s ? p.accent : p.lineStrong,
                    backgroundColor: m.side === s ? p.accentTint : p.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <T v="answer">{label}</T>
                </Press>
              </View>
            ))}
          </Row>
        )
      }
    />
  );
}

function Match() {
  const { p, d, next } = useProto();
  const mt = useMatch();
  const card = (
    text: string,
    key: string,
    state: { sel: boolean; slot?: number; miss: boolean },
    onPress: () => void,
  ) => {
    const pair = state.slot !== undefined ? p.pairs[state.slot] : undefined;
    return (
      <Press
        key={key}
        onPress={onPress}
        sound={null}
        style={{
          flex: 1,
          minHeight: 68,
          borderRadius: d.radius,
          borderWidth: state.sel || pair || state.miss ? 1.5 : 1,
          borderColor: state.miss ? p.down : (pair ?? (state.sel ? p.accent : p.line)),
          backgroundColor: state.miss ? p.downTint : state.sel ? p.accentTint : p.surface,
          padding: 10,
          justifyContent: 'center',
        }}
      >
        <T v="label" color={p.text}>
          {text}
        </T>
        {pair && (
          <View
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: pair,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T v="caption" color={p.onAccent} style={{ fontSize: 13, lineHeight: 16 }}>
              {String((state.slot ?? 0) + 1)}
            </T>
          </View>
        )}
      </Press>
    );
  };
  return (
    <Screen
      header={<TopBar step={0.7} />}
      top={
        <Enter>
          <T v="prompt" style={{ marginTop: 16 }}>
            {MATCH.prompt}
          </T>
        </Enter>
      }
      answers={
        <Enter i={1} style={{ gap: 10 }}>
          {MATCH.pairs.map((pr, i) => (
            <Row key={pr.term} gap={10} center={false}>
              <View style={{ width: '34%' }}>
                {card(
                  pr.term,
                  `l${i}`,
                  { sel: mt.left === i, slot: mt.pairs[i], miss: mt.miss?.l === i },
                  () => mt.tapLeft(i),
                )}
              </View>
              <View style={{ flex: 1 }}>
                {card(
                  MATCH.pairs[MATCH.order[i]].meaning,
                  `r${i}`,
                  { sel: mt.right === i, slot: mt.slotOfRight(i), miss: mt.miss?.r === i },
                  () => mt.tapRight(i),
                )}
              </View>
            </Row>
          ))}
        </Enter>
      }
      reserve={70}
      reveal={
        <RevealCard
          show={mt.checked}
          tone={mt.grade === 'correct' ? p.up : mt.grade === 'amber' ? p.amber : p.down}
          tint={mt.grade === 'correct' ? p.upTint : mt.grade === 'amber' ? p.amberTint : p.downTint}
          title={
            mt.grade === 'correct'
              ? 'All four, first try'
              : mt.grade === 'amber'
                ? 'One slip, still right'
                : 'Two slips'
          }
        >
          <T v="body">Market is speed, limit is price, stop is a trigger, bracket is all three.</T>
        </RevealCard>
      }
      footer={
        mt.checked ? (
          <Cta label="Continue" onPress={next} />
        ) : (
          <Cta label="Check" disabled={!mt.done} onPress={mt.check} />
        )
      }
    />
  );
}

function Complete() {
  const { p, next } = useProto();
  const t = useProgress(900, 200);
  const acc = COMPLETE.decisions.right / COMPLETE.decisions.total;
  return (
    <Screen
      top={
        <View style={{ alignItems: 'center', gap: 6, paddingTop: 40 }}>
          <Enter>
            <T v="label" color={p.muted} center>
              Nutrade
            </T>
          </Enter>
          <Enter i={1}>
            <T v="title" center>
              Lesson done
            </T>
            <T v="body" color={p.muted} center>
              {COMPLETE.lesson}
            </T>
          </Enter>
          <View style={{ marginVertical: 24 }}>
            <Ring size={168} stroke={6} value={acc} t={t} color={p.accent} track={p.line}>
              <T v="display" num>{`${COMPLETE.decisions.right}/${COMPLETE.decisions.total}`}</T>
              <T v="caption" color={p.muted}>
                decisions right
              </T>
            </Ring>
          </View>
          <Enter i={2} style={{ alignSelf: 'stretch', gap: 0 }}>
            {[
              ['Results this time', `${COMPLETE.results.won} won, ${COMPLETE.results.lost} lost`],
              ['Today', `${COMPLETE.goal.done} of ${COMPLETE.goal.of} lessons · goal met`],
              ['Streak', `${COMPLETE.streak} days`],
              ['XP', `+${COMPLETE.xp}`],
            ].map(([k, v]) => (
              <Row
                key={k}
                style={{
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: p.line,
                }}
              >
                <T v="body" color={p.muted}>
                  {k}
                </T>
                <T v="body" num>
                  {v}
                </T>
              </Row>
            ))}
            <View style={{ paddingVertical: 14, gap: 4 }}>
              <T v="caption" color={p.muted}>
                You missed one
              </T>
              <T v="body">{COMPLETE.missed}</T>
              <T v="label" color={p.accent}>
                Practice it
              </T>
            </View>
          </Enter>
        </View>
      }
      footer={<Cta label="Continue" onPress={next} />}
    />
  );
}

function Map() {
  const { p, d, next } = useProto();
  const current = MAP.levels.find((l) => l.state === 'current')!;
  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
      <Row style={{ paddingHorizontal: 20, paddingTop: 14, justifyContent: 'space-between' }}>
        <T v="label" color={p.text}>
          Nutrade
        </T>
        <Row gap={14}>
          <Row gap={4}>
            <Icon name="flame" size={16} color={p.amber} filled />
            <T v="caption" num>{`${MAP.hud.streak} days`}</T>
          </Row>
          <T v="caption" num>{`Today ${MAP.hud.today}/${MAP.hud.goal}`}</T>
          <Row gap={4}>
            <Icon name="heart" size={15} color={p.down} filled />
            <T v="caption" num>
              {String(MAP.hud.hearts)}
            </T>
          </Row>
        </Row>
      </Row>
      <Screen
        pad={20}
        top={
          <Enter style={{ marginTop: 18 }}>
            <T v="caption" color={p.muted}>
              {MAP.chapter}
            </T>
            <View style={{ marginTop: 12 }}>
              {MAP.levels.map((l, i) => {
                const done = l.state === 'done' || l.state === 'perfect';
                const col =
                  l.state === 'locked' ? p.muted : l.state === 'current' ? p.accent : p.text;
                return (
                  <Row key={l.n} gap={14} style={{ minHeight: 56 }}>
                    <View style={{ width: 40, alignItems: 'center', alignSelf: 'stretch' }}>
                      {i > 0 && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 0,
                            height: '50%',
                            width: 1,
                            backgroundColor: p.line,
                          }}
                        />
                      )}
                      {i < MAP.levels.length - 1 && (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            height: '50%',
                            width: 1,
                            backgroundColor: p.line,
                          }}
                        />
                      )}
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: l.state === 'current' ? p.accent : p.surface,
                            borderWidth: 1,
                            borderColor:
                              l.state === 'perfect'
                                ? p.amber
                                : l.state === 'current'
                                  ? p.accent
                                  : p.line,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon
                            name={l.icon}
                            size={20}
                            color={l.state === 'current' ? p.onAccent : col}
                            strokeWidth={1.75}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="caption" color={p.muted}>{`Level ${l.n} · ${l.kind}`}</T>
                      <T v="answer" color={l.state === 'locked' ? p.muted : p.text} lines={1}>
                        {l.title}
                      </T>
                    </View>
                    <T
                      v="caption"
                      num
                      color={done ? (l.state === 'perfect' ? p.amber : p.up) : p.muted}
                    >
                      {done
                        ? l.state === 'perfect'
                          ? 'Perfect'
                          : 'Done'
                        : `${l.done}/${l.lessons}`}
                    </T>
                  </Row>
                );
              })}
            </View>
          </Enter>
        }
        answers={
          <Enter i={1}>
            <View
              style={{
                borderRadius: d.radius,
                borderWidth: 1,
                borderColor: p.line,
                backgroundColor: p.surface,
                padding: 16,
                gap: 4,
              }}
            >
              <T v="caption" color={p.muted}>
                Up next
              </T>
              <T v="prompt">{current.title}</T>
              <T
                v="body"
                color={p.muted}
              >{`Lesson ${current.done + 1} of ${current.lessons} · about 3 min`}</T>
              <Press
                onPress={next}
                sound={SOUND.advance}
                style={{
                  marginTop: 12,
                  height: 52,
                  borderRadius: d.radius,
                  backgroundColor: p.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T v="answer" color={p.onAccent}>
                  Continue
                </T>
              </Press>
            </View>
          </Enter>
        }
        footer={<Tabs />}
      />
    </View>
  );
}

function Tabs() {
  const { p } = useProto();
  return (
    <Row
      style={{
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: p.line,
        paddingTop: 8,
        paddingBottom: 18,
        marginTop: 12,
      }}
    >
      {(
        [
          ['learn', 'Learn'],
          ['practice', 'Practice'],
          ['account', 'Account'],
        ] as const
      ).map(([icon, label], i) => (
        <View key={label} style={{ alignItems: 'center', gap: 2, minWidth: 64 }}>
          <Icon name={icon} size={22} color={i === 0 ? p.accent : p.muted} strokeWidth={1.75} />
          <T v="caption" color={i === 0 ? p.accent : p.muted}>
            {label}
          </T>
        </View>
      ))}
    </Row>
  );
}

export const CALM: Partial<Record<ScreenId, () => React.ReactElement>> = {
  theory: Theory,
  choice: Choice,
  chart: Chart,
  match: Match,
  complete: Complete,
  map: Map,
};
