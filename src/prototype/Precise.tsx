import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import Icon from '../home/icons';
import { CHOICE, COMPLETE, MAP, MATCH, SCENARIO, THEORY, outcomeResult } from './data';
import {
  Appear,
  CandleChart,
  Enter,
  Press,
  Row,
  SOUND,
  T,
  useCountUp,
  usePlayback,
  useProto,
} from './kit';
import { Screen } from './layout';
import { decisionCopy, useChoice, useDecision, useMatch } from './logic';
import type { ScreenId } from './directions';

/**
 * Direction 3, "Precise": a trading desk. Hairline panels, small-caps labels,
 * numbers in a monospaced face, the chart at full width, answers as compact
 * keyed rows, and a reveal that is a log line opening under what it judges.
 */

const KEYS = ['A', 'B', 'C', 'D'];

function TopBar({ step, of = 12 }: { step: number; of?: number }) {
  const { p } = useProto();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6, gap: 6 }}>
      <Row gap={10} style={{ minHeight: 48 }}>
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
          <T v="prompt" color={p.muted}>
            ✕
          </T>
        </Press>
        <Row gap={3} style={{ flex: 1 }}>
          {Array.from({ length: of }, (_, i) => (
            <View
              key={i}
              style={{ flex: 1, height: 4, backgroundColor: i < step ? p.accent : p.line }}
            />
          ))}
        </Row>
        <T v="label" num color={p.muted}>{`${step}/${of}`}</T>
        <Row gap={3}>
          <Icon name="heart" size={14} color={p.down} filled />
          <T v="label" num color={p.text}>
            5
          </T>
        </Row>
      </Row>
    </View>
  );
}

function Cta({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { p, d } = useProto();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 18,
        borderTopWidth: 1,
        borderTopColor: p.line,
      }}
    >
      <Press
        onPress={onPress}
        disabled={disabled}
        sound={SOUND.advance}
        style={{
          height: 50,
          borderRadius: d.radius,
          backgroundColor: disabled ? p.surfaceAlt : p.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <T v="label" upper color={disabled ? p.muted : p.onAccent} style={{ fontSize: 15 }}>
          {label}
        </T>
      </Press>
    </View>
  );
}

/** A panel with a small-caps title, the direction's basic container. */
function Panel({
  title,
  right,
  children,
  style,
}: {
  title?: string;
  right?: string;
  children: React.ReactNode;
  style?: object;
}) {
  const { p, d } = useProto();
  return (
    <View
      style={[
        { borderWidth: 1, borderColor: p.line, backgroundColor: p.surface, borderRadius: d.radius },
        style,
      ]}
    >
      {title && (
        <Row
          style={{
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: p.line,
          }}
        >
          <T v="label" upper color={p.muted}>
            {title}
          </T>
          {right ? (
            <T v="label" num color={p.muted}>
              {right}
            </T>
          ) : null}
        </Row>
      )}
      <View style={{ padding: 10 }}>{children}</View>
    </View>
  );
}

/** The reveal: a log line that opens in place under what it judges. */
function LogLine({
  show,
  tone,
  tag,
  children,
}: {
  show: boolean;
  tone: string;
  tag: string;
  children: React.ReactNode;
}) {
  const { p } = useProto();
  return (
    <Appear show={show} from={4} duration={220}>
      <View
        style={{
          borderLeftWidth: 2,
          borderLeftColor: tone,
          backgroundColor: p.surface,
          paddingHorizontal: 10,
          paddingVertical: 8,
          gap: 4,
        }}
      >
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: tone,
            paddingHorizontal: 6,
            paddingVertical: 1,
            borderRadius: 3,
          }}
        >
          <T v="label" upper color={p.ground}>
            {tag}
          </T>
        </View>
        {children}
      </View>
    </Appear>
  );
}

function KV({ k, v, color }: { k: string; v: string; color?: string }) {
  const { p } = useProto();
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 3 }}>
      <T v="label" upper color={p.muted}>
        {k}
      </T>
      <T v="body" num color={color ?? p.text}>
        {v}
      </T>
    </Row>
  );
}

// ---------------------------------------------------------------------------

function Theory() {
  const { p, d, width, next } = useProto();
  const w = width - 32 - 22;
  const c = { o: 9.7, h: 9.9, l: 9.62, c: 9.84 };
  const y = (v: number) => 12 + ((9.94 - v) / 0.36) * 150;
  const cx = w * 0.42;
  const tick = (v: number, label: string) => (
    <>
      <Line
        x1={cx + 20}
        x2={w - 58}
        y1={y(v)}
        y2={y(v)}
        stroke={p.lineStrong}
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <SvgText
        x={w - 2}
        y={y(v) + 4.5}
        fontSize={13}
        textAnchor="end"
        fill={p.muted}
        fontFamily={d.numberFont}
      >
        {`${label} ${v.toFixed(2)}`}
      </SvgText>
    </>
  );
  return (
    <Screen
      pad={16}
      header={<TopBar step={2} />}
      top={
        <>
          <Enter i={0} style={{ marginTop: 6, gap: 4 }}>
            <T v="label" upper color={p.accent}>
              {THEORY.eyebrow}
            </T>
            <T v="display">{THEORY.title}</T>
          </Enter>
          <Enter i={1} style={{ marginTop: 14 }}>
            <Panel title="XYZ · 1 min · 09:41" right="1 candle">
              <Svg width={w} height={174}>
                <Line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={p.up} strokeWidth={1.5} />
                <Rect
                  x={cx - 14}
                  y={y(c.c)}
                  width={28}
                  height={y(c.o) - y(c.c)}
                  fill={p.ground}
                  stroke={p.up}
                  strokeWidth={1.5}
                />
                {tick(c.h, 'H')}
                {tick(c.c, 'C')}
                {tick(c.o, 'O')}
                {tick(c.l, 'L')}
                <SvgText
                  x={cx - 22}
                  y={(y(c.c) + y(c.o)) / 2 + 4}
                  fontSize={13}
                  textAnchor="end"
                  fill={p.muted}
                >
                  body
                </SvgText>
                <SvgText x={cx - 8} y={y(c.h) + 12} fontSize={13} textAnchor="end" fill={p.muted}>
                  wick
                </SvgText>
              </Svg>
            </Panel>
          </Enter>
          <Enter i={2} style={{ marginTop: 14 }}>
            <T v="body">{THEORY.body}</T>
          </Enter>
          <Enter i={3} style={{ marginTop: 12 }}>
            <Row gap={0} style={{ borderWidth: 1, borderColor: p.line, borderRadius: d.radius }}>
              {(
                [
                  ['Open', c.o],
                  ['High', c.h],
                  ['Low', c.l],
                  ['Close', c.c],
                ] as const
              ).map(([k, v], i) => (
                <View
                  key={k}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    alignItems: 'center',
                    borderLeftWidth: i ? 1 : 0,
                    borderLeftColor: p.line,
                  }}
                >
                  <T v="label" upper color={p.muted}>
                    {k}
                  </T>
                  <T v="body" num>
                    {v.toFixed(2)}
                  </T>
                </View>
              ))}
            </Row>
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
      pad={16}
      header={<TopBar step={4} />}
      top={
        <Enter i={0}>
          <T v="prompt" style={{ marginTop: 12 }}>
            {CHOICE.prompt}
          </T>
        </Enter>
      }
      answers={
        <Enter i={1} style={{ gap: 6 }}>
          {CHOICE.options.map((o, i) => {
            const chosen = q.sel === i;
            const right = q.checked && i === CHOICE.correct;
            const wrong = q.checked && chosen && i !== CHOICE.correct;
            const tone = right ? p.up : wrong ? p.down : chosen ? p.accent : p.line;
            return (
              <Press
                key={o}
                role="radio"
                label={o}
                onPress={() => q.choose(i)}
                style={{
                  minHeight: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 10,
                  borderRadius: d.radius,
                  borderWidth: 1,
                  borderColor: tone,
                  backgroundColor: right
                    ? p.upTint
                    : wrong
                      ? p.downTint
                      : chosen
                        ? p.accentTint
                        : p.surface,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: tone === p.line ? p.lineStrong : tone,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <T v="label" num color={tone === p.line ? p.muted : tone}>
                    {KEYS[i]}
                  </T>
                </View>
                <T v="answer" num style={{ flex: 1, fontSize: 17 }}>
                  {o}
                </T>
                {right && (
                  <T v="label" upper color={p.up}>
                    Correct
                  </T>
                )}
                {wrong && (
                  <T v="label" upper color={p.down}>
                    Yours
                  </T>
                )}
              </Press>
            );
          })}
        </Enter>
      }
      reserve={96}
      reveal={
        <LogLine
          show={q.checked}
          tone={q.grade === 'correct' ? p.up : p.down}
          tag={q.grade === 'correct' ? 'Correct' : 'Not quite'}
        >
          <T v="body" num>
            1.50 ÷ 50.00 = 0.03 = 3 %
          </T>
          <T v="caption" color={p.muted}>
            {q.grade === 'wrong' && q.sel !== null && CHOICE.why[q.sel]
              ? CHOICE.why[q.sel]
              : 'Dollar change divided by the previous close.'}
          </T>
        </LogLine>
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
  const play = usePlayback(SCENARIO.outcome.length, 420, m.phase === 'playing', m.ended);
  const shown = n0 + (m.phase === 'decide' ? 0 : play.pos);
  const copy = m.side ? decisionCopy(m.side) : null;
  const res = m.side && m.side !== 'none' ? outcomeResult(m.side) : null;
  const tone = copy?.grade === 'correct' ? p.up : copy?.grade === 'amber' ? p.amber : p.down;
  return (
    <Screen
      pad={16}
      header={<TopBar step={6} />}
      top={
        <>
          <Enter i={0} style={{ marginTop: 4, gap: 4 }}>
            <T v="caption" color={p.muted}>
              {SCENARIO.story}
            </T>
            <T v="prompt">{SCENARIO.prompt}</T>
          </Enter>
          <Enter i={1} style={{ marginTop: 10 }}>
            <Row gap={0} style={{ borderWidth: 1, borderColor: p.line, borderRadius: d.radius }}>
              {SCENARIO.state.map((s, i) => (
                <View
                  key={s}
                  style={{
                    flex: 1,
                    paddingVertical: 5,
                    alignItems: 'center',
                    borderLeftWidth: i ? 1 : 0,
                    borderLeftColor: p.line,
                  }}
                >
                  <T v="label" num upper color={p.text}>
                    {s}
                  </T>
                </View>
              ))}
            </Row>
          </Enter>
          <Enter i={2} style={{ marginTop: 8, marginHorizontal: -16 }}>
            <Press sound={null} onPress={play.skip} label="Chart. Tap to finish the playback.">
              <CandleChart
                candles={all}
                shown={shown}
                width={width}
                height={210}
                kind="precise"
                splitAt={n0}
                hideAfterSplit={m.phase === 'decide'}
                extent={[SCENARIO.stop, SCENARIO.target]}
                lines={[
                  {
                    price: SCENARIO.entry,
                    label: `ENTRY ${SCENARIO.entry.toFixed(2)}`,
                    color: p.muted,
                    dash: true,
                  },
                  ...(m.phase === 'decide'
                    ? []
                    : [
                        {
                          price: SCENARIO.target,
                          label: `TARGET ${SCENARIO.target.toFixed(2)}`,
                          color: p.up,
                        },
                        {
                          price: SCENARIO.stop,
                          label: `STOP ${SCENARIO.stop.toFixed(2)}`,
                          color: p.down,
                        },
                      ]),
                ]}
              />
            </Press>
          </Enter>
        </>
      }
      reveal={
        copy && m.phase === 'reveal' ? (
          <LogLine show tone={tone} tag={copy.chip}>
            <T v="body">{copy.first}</T>
            <View
              style={{ borderTopWidth: 1, borderTopColor: p.line, marginTop: 4, paddingTop: 4 }}
            >
              <KV k="Outcome" v={res ? 'Stopped out' : 'Stood aside'} />
              {res ? (
                <>
                  <KV
                    k="Result"
                    v={`${res.total < 0 ? '−' : '+'}$${Math.abs(res.total).toFixed(2)} · ${SCENARIO.shares} sh`}
                    color={res.total < 0 ? p.down : p.up}
                  />
                  <KV
                    k="In R"
                    v={`${res.r < 0 ? '−' : '+'}${Math.abs(res.r).toFixed(1)}R`}
                    color={res.total < 0 ? p.down : p.up}
                  />
                </>
              ) : (
                <KV k="Had you bought" v="−0.12 / sh" color={p.muted} />
              )}
            </View>
            {m.side === 'long' && (
              <T v="caption" color={p.text}>
                Right call, losing trade. This setup loses about 4 in 10. Judge the decision.{' '}
                <T v="caption" color={p.accent}>
                  Why?
                </T>
              </T>
            )}
            {m.side === 'short' && (
              <T v="caption" color={p.text}>
                Wrong call, winning trade. The result is noise; the decision is the signal.
              </T>
            )}
            <T v="caption" color={p.muted}>
              Practice only. Real trading can lose money.
            </T>
          </LogLine>
        ) : null
      }
      footer={
        m.phase === 'reveal' ? (
          <Cta label="Continue" onPress={next} />
        ) : (
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 18,
              borderTopWidth: 1,
              borderTopColor: p.line,
            }}
          >
            <Row
              gap={0}
              style={{
                borderWidth: 1,
                borderColor: p.lineStrong,
                borderRadius: d.radius,
                overflow: 'hidden',
              }}
            >
              {(
                [
                  ['long', 'Long'],
                  ['short', 'Short'],
                  ['none', 'No trade'],
                ] as const
              ).map(([s, label], i) => (
                <View
                  key={s}
                  style={{ flex: 1, borderLeftWidth: i ? 1 : 0, borderLeftColor: p.lineStrong }}
                >
                  <Press
                    sound={null}
                    disabled={m.phase !== 'decide'}
                    onPress={() => m.choose(s)}
                    style={{
                      height: 50,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: m.side === s ? p.accentTint : p.surface,
                    }}
                  >
                    <T
                      v="label"
                      upper
                      color={m.side === s ? p.accent : p.text}
                      style={{ fontSize: 15 }}
                    >
                      {label}
                    </T>
                  </Press>
                </View>
              ))}
            </Row>
          </View>
        )
      }
    />
  );
}

function Match() {
  const { p, d, next } = useProto();
  const mt = useMatch();
  const row = (
    key: string,
    badge: string,
    text: string,
    s: { sel: boolean; slot?: number; miss: boolean },
    onPress: () => void,
  ) => {
    const pair = s.slot !== undefined ? p.pairs[s.slot] : undefined;
    return (
      <Press
        key={key}
        sound={null}
        onPress={onPress}
        style={{
          minHeight: 60,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 8,
          borderRadius: d.radius,
          borderWidth: 1,
          borderLeftWidth: pair ? 4 : 1,
          borderColor: s.miss ? p.down : (pair ?? (s.sel ? p.accent : p.line)),
          backgroundColor: s.miss ? p.downTint : s.sel ? p.accentTint : p.surface,
        }}
      >
        <T v="label" num color={pair ?? p.muted}>
          {badge}
        </T>
        <T
          v="label"
          color={p.text}
          style={{ flex: 1, textTransform: 'none', letterSpacing: 0, fontWeight: '500' }}
        >
          {text}
        </T>
      </Press>
    );
  };
  return (
    <Screen
      pad={16}
      header={<TopBar step={8} />}
      top={
        <Enter i={0}>
          <T v="prompt" style={{ marginTop: 12 }}>
            {MATCH.prompt}
          </T>
        </Enter>
      }
      answers={
        <Enter i={1} style={{ gap: 6 }}>
          {MATCH.pairs.map((pr, i) => (
            <Row key={pr.term} gap={6} center={false}>
              <View style={{ width: '33%' }}>
                {row(
                  `l${i}`,
                  KEYS[i],
                  pr.term,
                  { sel: mt.left === i, slot: mt.pairs[i], miss: mt.miss?.l === i },
                  () => mt.tapLeft(i),
                )}
              </View>
              <View style={{ flex: 1 }}>
                {row(
                  `r${i}`,
                  mt.slotOfRight(i) !== undefined ? KEYS[MATCH.order[i]] : String(i + 1),
                  MATCH.pairs[MATCH.order[i]].meaning,
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
        <LogLine
          show={mt.checked}
          tone={mt.grade === 'correct' ? p.up : mt.grade === 'amber' ? p.amber : p.down}
          tag={
            mt.grade === 'correct'
              ? '4/4 · no slips'
              : mt.grade === 'amber'
                ? '4/4 · 1 slip'
                : `4/4 · ${mt.wrongTaps} slips`
          }
        >
          <T v="body">Market is speed, limit is price, stop is a trigger, bracket is all three.</T>
        </LogLine>
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
  const { p, d, next } = useProto();
  const right = useCountUp(COMPLETE.decisions.right, 600, 150);
  const xp = useCountUp(COMPLETE.xp, 600, 250);
  const won = useCountUp(COMPLETE.results.won, 600, 350);
  const lost = useCountUp(COMPLETE.results.lost, 600, 350);
  return (
    <Screen
      pad={16}
      top={
        <View style={{ gap: 12, paddingTop: 24 }}>
          <Enter i={0}>
            <T v="label" upper color={p.accent}>
              Nutrade · Session report
            </T>
            <T v="display">Lesson complete</T>
            <T v="body" color={p.muted}>
              {COMPLETE.lesson}
            </T>
          </Enter>
          <Enter i={1}>
            <Row gap={8}>
              {[
                ['Decisions', `${right}/${COMPLETE.decisions.total}`, p.up],
                ['XP', `+${xp}`, p.accent],
                ['Streak', `${COMPLETE.streak} d`, p.amber],
              ].map(([k, v, c]) => (
                <View
                  key={k}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: p.line,
                    backgroundColor: p.surface,
                    borderRadius: d.radius,
                    padding: 10,
                  }}
                >
                  <T v="label" upper color={p.muted}>
                    {k}
                  </T>
                  <T v="display" num color={c}>
                    {v}
                  </T>
                </View>
              ))}
            </Row>
          </Enter>
          <Enter i={2}>
            <Panel title="Decision vs outcome">
              <KV
                k="Decisions right"
                v={`${COMPLETE.decisions.right} of ${COMPLETE.decisions.total}`}
              />
              <KV k="Results" v={`${won} won · ${lost} lost`} />
              <Row gap={2} style={{ marginTop: 6 }}>
                {Array.from({ length: COMPLETE.decisions.total }, (_, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: 8,
                      backgroundColor: i < COMPLETE.decisions.right ? p.up : p.down,
                      opacity: i < COMPLETE.decisions.right ? 1 : 0.8,
                    }}
                  />
                ))}
              </Row>
              <T v="caption" color={p.muted} style={{ marginTop: 6 }}>
                Judged by decisions. A right call can still lose money; that is variance, not a
                mistake.
              </T>
            </Panel>
          </Enter>
          <Enter i={3}>
            <Panel title="Review" right={`Today ${COMPLETE.goal.done}/${COMPLETE.goal.of} ✓`}>
              <T v="body">{COMPLETE.missed}</T>
              <T v="label" upper color={p.accent} style={{ marginTop: 6 }}>
                Practice this ›
              </T>
            </Panel>
          </Enter>
        </View>
      }
      footer={<Cta label="Continue" onPress={next} />}
    />
  );
}

function Map() {
  const { p, d, next } = useProto();
  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
      <Row
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 10,
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: p.line,
        }}
      >
        <T v="label" upper color={p.text}>
          Nutrade
        </T>
        <Row gap={12}>
          <T v="label" num color={p.amber}>{`${MAP.hud.streak} days`}</T>
          <T v="label" num color={p.accent}>{`Today ${MAP.hud.today}/${MAP.hud.goal}`}</T>
          <T v="label" num color={p.muted}>{`${MAP.hud.xp} XP`}</T>
          <T v="label" num color={p.down}>{`♥ ${MAP.hud.hearts}`}</T>
        </Row>
      </Row>
      <Screen
        pad={16}
        top={
          <View style={{ gap: 10, marginTop: 12 }}>
            <Enter i={0}>
              <Row style={{ justifyContent: 'space-between' }}>
                <T v="label" upper color={p.muted}>
                  {MAP.chapter}
                </T>
                <T v="label" num color={p.muted}>
                  5/19 levels
                </T>
              </Row>
            </Enter>
            <Enter
              i={1}
              style={{
                borderWidth: 1,
                borderColor: p.line,
                borderRadius: d.radius,
                backgroundColor: p.surface,
              }}
            >
              {MAP.levels.map((l, i) => {
                const cur = l.state === 'current';
                const locked = l.state === 'locked';
                return (
                  <Row
                    key={l.n}
                    gap={10}
                    style={{
                      minHeight: 58,
                      paddingHorizontal: 10,
                      borderTopWidth: i ? 1 : 0,
                      borderTopColor: p.line,
                      backgroundColor: cur ? p.accentTint : 'transparent',
                      borderLeftWidth: cur ? 3 : 0,
                      borderLeftColor: p.accent,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: cur ? p.accent : p.line,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        name={l.icon}
                        size={20}
                        color={locked ? p.muted : cur ? p.accent : p.text}
                        strokeWidth={1.5}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <T v="caption" num color={p.muted}>{`L${l.n} · ${l.kind}`}</T>
                      <T v="answer" color={locked ? p.muted : p.text} lines={1}>
                        {l.title}
                      </T>
                      <Row gap={2}>
                        {Array.from({ length: l.lessons }, (_, k) => (
                          <View
                            key={k}
                            style={{
                              width: 18,
                              height: 3,
                              backgroundColor:
                                k < l.done ? (l.state === 'perfect' ? p.amber : p.up) : p.line,
                            }}
                          />
                        ))}
                      </Row>
                    </View>
                    {cur ? (
                      <Press
                        onPress={next}
                        sound={SOUND.advance}
                        style={{
                          height: 36,
                          paddingHorizontal: 10,
                          borderRadius: d.radius,
                          backgroundColor: p.accent,
                          justifyContent: 'center',
                        }}
                      >
                        <T v="label" upper color={p.onAccent}>
                          Continue
                        </T>
                      </Press>
                    ) : (
                      <T
                        v="label"
                        upper
                        color={
                          l.state === 'perfect' ? p.amber : l.state === 'done' ? p.up : p.muted
                        }
                      >
                        {l.state === 'perfect' ? 'Perfect' : l.state === 'done' ? 'Done' : 'Locked'}
                      </T>
                    )}
                  </Row>
                );
              })}
            </Enter>
            <Enter i={2} style={{ gap: 6 }}>
              {['Chapter 5 · Finding the trade', 'Chapter 6 · Risk and the journal'].map((c) => (
                <Row
                  key={c}
                  style={{
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: p.line,
                    borderRadius: d.radius,
                    paddingHorizontal: 10,
                    minHeight: 44,
                  }}
                >
                  <T v="label" upper color={p.muted}>
                    {c}
                  </T>
                  <Icon name="lock" size={14} color={p.muted} />
                </Row>
              ))}
            </Enter>
          </View>
        }
        footer={
          <Row
            style={{
              justifyContent: 'space-around',
              borderTopWidth: 1,
              borderTopColor: p.line,
              paddingTop: 6,
              paddingBottom: 16,
            }}
          >
            {(['Learn', 'Practice', 'Account'] as const).map((t, i) => (
              <View
                key={t}
                style={{
                  minWidth: 72,
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderTopWidth: 2,
                  borderTopColor: i === 0 ? p.accent : 'transparent',
                }}
              >
                <T v="label" upper color={i === 0 ? p.accent : p.muted}>
                  {t}
                </T>
              </View>
            ))}
          </Row>
        }
      />
    </View>
  );
}

export const PRECISE: Partial<Record<ScreenId, () => React.ReactElement>> = {
  theory: Theory,
  choice: Choice,
  chart: Chart,
  match: Match,
  complete: Complete,
  map: Map,
};
