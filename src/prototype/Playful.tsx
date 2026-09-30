import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';

import Icon, { type IconName } from '../home/icons';
import { CHOICE, COMPLETE, MAP, MATCH, SCENARIO, THEORY, money, outcomeResult } from './data';
import {
  CandleChart,
  Enter,
  Press,
  Row,
  SOUND,
  T,
  useCountUp,
  usePlayback,
  useProgress,
  useProto,
} from './kit';
import { Ring, Screen } from './layout';
import { decisionCopy, useChoice, useDecision, useMatch } from './logic';
import type { ScreenId } from './directions';
import type { Grade } from '../lesson/answers';

/**
 * Direction 2, "Playful": chunky and warm. Buttons with a real bottom edge
 * that sink when pressed, answers as big tiles, and a reveal that is a band
 * along the bottom carrying its own button.
 */

/** A darker shade of a hex colour, for a chunky button's edge. */
function shade(hex: string, k = 0.22): string {
  const m = /^#([0-9a-f]{6})/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (s: number) => Math.max(0, Math.round(((n >> s) & 255) * (1 - k)));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

const EDGE = 4;

/** A chunky button: a face on top of its own edge; pressing sinks the face. */
function Chunky({
  onPress,
  color,
  edge,
  children,
  disabled,
  height = 56,
  sound = SOUND.choose,
  style,
  label,
  role,
}: {
  onPress?: () => void;
  color: string;
  edge?: string;
  children: React.ReactNode;
  disabled?: boolean;
  height?: number;
  sound?: typeof SOUND.choose | null;
  style?: object;
  label?: string;
  role?: 'button' | 'radio';
}) {
  const { d } = useProto();
  return (
    <View
      style={[
        { borderRadius: d.radius, backgroundColor: edge ?? shade(color), paddingBottom: EDGE },
        style,
      ]}
    >
      <Press
        onPress={onPress}
        disabled={disabled}
        sink={EDGE}
        sound={sound}
        label={label}
        role={role}
        style={{
          minHeight: height,
          borderRadius: d.radius,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 14,
        }}
      >
        {children}
      </Press>
    </View>
  );
}

function TopBar({ step }: { step: number }) {
  const { p } = useProto();
  return (
    <Row
      gap={12}
      style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6, minHeight: 48 }}
    >
      <Press
        label="Close lesson"
        style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: -10,
        }}
      >
        <T v="title" color={p.muted}>
          ✕
        </T>
      </Press>
      <View
        style={{
          flex: 1,
          height: 16,
          borderRadius: 8,
          backgroundColor: p.line,
          overflow: 'hidden',
        }}
      >
        <View
          style={{ width: `${step * 100}%`, height: 16, borderRadius: 8, backgroundColor: p.up }}
        >
          <View
            style={{
              position: 'absolute',
              top: 4,
              left: 8,
              right: 8,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.35)',
            }}
          />
        </View>
      </View>
      <Row gap={4}>
        <Icon name="heart" size={24} color={p.down} filled />
        <T v="answer" num color={p.down}>
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
  color,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  color?: string;
}) {
  const { p } = useProto();
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 20 }}>
      <Chunky
        onPress={onPress}
        disabled={disabled}
        color={disabled ? p.line : (color ?? p.accent)}
        edge={disabled ? p.lineStrong : undefined}
        sound={SOUND.advance}
      >
        <T v="answer" upper color={disabled ? p.muted : p.onAccent} style={{ letterSpacing: 0.8 }}>
          {label}
        </T>
      </Chunky>
    </View>
  );
}

const BAND_FOOTER = 88;

/**
 * The reveal band: rises from the bottom edge over the button it replaces and
 * carries the next button itself, so the verdict and the way on are one thing
 * and nothing can cover the verdict. It reports its height, and the screen
 * keeps that much free above the footer (layout.tsx).
 */
function Band({
  grade,
  title,
  children,
  onContinue,
  onHeight,
}: {
  grade: Grade;
  title: string;
  children: React.ReactNode;
  onContinue: () => void;
  onHeight: (h: number) => void;
}) {
  const { p, reduced } = useProto();
  const tone = grade === 'correct' ? p.up : grade === 'amber' ? p.amber : p.down;
  const tint = grade === 'correct' ? p.upTint : grade === 'amber' ? p.amberTint : p.downTint;
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) t.set(withSpring(1, { duration: 380, dampingRatio: 0.82 }));
  }, [reduced, t]);
  const a = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - t.get()) * 240 }],
    opacity: reduced ? t.get() : 1,
  }));
  const pop = useSharedValue(reduced ? 1 : 0.4);
  useEffect(() => {
    if (!reduced) pop.set(withDelay(120, withSpring(1, { duration: 420, dampingRatio: 0.5 })));
  }, [reduced, pop]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  return (
    <Animated.View
      onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
      style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: p.ground }, a]}
    >
      <View
        style={{
          backgroundColor: tint,
          paddingHorizontal: 18,
          paddingTop: 16,
          gap: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <Row gap={10}>
          <Animated.View
            style={[
              {
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: tone,
                alignItems: 'center',
                justifyContent: 'center',
              },
              popStyle,
            ]}
          >
            <T v="answer" color={p.ground}>
              {grade === 'correct' ? '✓' : grade === 'amber' ? '~' : '✕'}
            </T>
          </Animated.View>
          <T v="title" color={tone}>
            {title}
          </T>
        </Row>
        {children}
        <View style={{ marginHorizontal: -18 }}>
          <Cta label="Continue" onPress={onContinue} color={tone} />
        </View>
      </View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------

function Theory() {
  const { p, d, next, width } = useProto();
  const w = width - 36;
  const candle = (x: number, up: boolean) => {
    const col = up ? p.up : p.down;
    return (
      <>
        <Line x1={x} x2={x} y1={22} y2={170} stroke={col} strokeWidth={5} strokeLinecap="round" />
        <Rect x={x - 26} y={up ? 52 : 52} width={52} height={86} rx={10} fill={col} />
      </>
    );
  };
  const pill = (text: string, x: number, y: number, color: string) => (
    <View
      key={text + x}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        backgroundColor: color,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 2,
      }}
    >
      <T v="caption" color={p.ground} style={{ fontWeight: '800' }}>
        {text}
      </T>
    </View>
  );
  return (
    <Screen
      pad={18}
      header={<TopBar step={0.15} />}
      top={
        <>
          <Enter>
            <View
              style={{
                marginTop: 8,
                borderRadius: d.radius,
                backgroundColor: p.accentTint,
                height: 200,
                overflow: 'hidden',
              }}
            >
              <Svg width={w} height={200}>
                {candle(w * 0.32, true)}
                {candle(w * 0.68, false)}
              </Svg>
              {pill('High', w * 0.32 + 12, 10, p.up)}
              {pill('Close', w * 0.32 - 98, 44, p.up)}
              {pill('Open', w * 0.32 - 96, 124, p.up)}
              {pill('Low', w * 0.32 + 12, 162, p.up)}
              {pill('Open', w * 0.68 + 34, 44, p.down)}
              {pill('Close', w * 0.68 + 34, 124, p.down)}
            </View>
          </Enter>
          <Enter i={1} style={{ gap: 8, marginTop: 18 }}>
            <T v="label" upper color={p.accent}>
              {THEORY.eyebrow}
            </T>
            <T v="display">{THEORY.title}</T>
            <T v="body" color={p.muted}>
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
  const { p, next } = useProto();
  const q = useChoice();
  const [bandH, setBandH] = useState(0);
  return (
    <Screen
      pad={18}
      header={<TopBar step={0.3} />}
      top={
        <Enter>
          <T v="prompt" style={{ marginTop: 12 }}>
            {CHOICE.prompt}
          </T>
        </Enter>
      }
      answers={
        <Enter i={1} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {CHOICE.options.map((o, i) => {
            const chosen = q.sel === i;
            const right = q.checked && i === CHOICE.correct;
            const wrong = q.checked && chosen && i !== CHOICE.correct;
            const face = right ? p.upTint : wrong ? p.downTint : chosen ? p.accentTint : p.surface;
            const edge = right ? p.up : wrong ? p.down : chosen ? p.accent : p.line;
            return (
              <View key={o} style={{ width: '48%', flexGrow: 1 }}>
                <Chunky
                  color={face}
                  edge={edge}
                  height={84}
                  onPress={() => q.choose(i)}
                  role="radio"
                  label={o}
                >
                  <T
                    v="title"
                    num
                    color={right ? p.up : wrong ? p.down : chosen ? p.accent : p.text}
                  >
                    {o}
                  </T>
                </Chunky>
              </View>
            );
          })}
        </Enter>
      }
      reserve={q.checked ? Math.max(0, bandH - BAND_FOOTER) : 0}
      footer={<Cta label="Check" disabled={q.sel === null} onPress={q.check} />}
      overlay={
        q.checked && q.grade ? (
          <Band
            grade={q.grade}
            title={q.grade === 'correct' ? 'Nice!' : 'Not quite'}
            onContinue={next}
            onHeight={setBandH}
          >
            <T v="body">{CHOICE.explanation}</T>
          </Band>
        ) : null
      }
    />
  );
}

function Chart() {
  const { p, d, width, next } = useProto();
  const m = useDecision();
  const [bandH, setBandH] = useState(0);
  const all = [...SCENARIO.history, ...SCENARIO.outcome];
  const n0 = SCENARIO.history.length;
  const play = usePlayback(SCENARIO.outcome.length, 520, m.phase === 'playing', m.ended);
  const shown = n0 + (m.phase === 'decide' ? 0 : play.pos);
  const copy = m.side ? decisionCopy(m.side) : null;
  const res = m.side && m.side !== 'none' ? outcomeResult(m.side) : null;
  return (
    <Screen
      pad={18}
      header={<TopBar step={0.5} />}
      top={
        <>
          <Enter style={{ gap: 8, marginTop: 4 }}>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: p.surface,
                borderRadius: 16,
                borderBottomLeftRadius: 4,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <T v="caption" color={p.muted}>
                {SCENARIO.story}
              </T>
            </View>
            <T v="prompt">{SCENARIO.prompt}</T>
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {SCENARIO.state.map((s) => (
                <View
                  key={s}
                  style={{
                    backgroundColor: p.surfaceAlt,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <T v="caption" num>
                    {s}
                  </T>
                </View>
              ))}
            </Row>
          </Enter>
          <Enter i={1} style={{ marginTop: 10 }}>
            <Press
              sound={null}
              onPress={play.skip}
              label="Chart. Tap to finish the playback."
              style={{ backgroundColor: p.surface, borderRadius: d.radius, padding: 10 }}
            >
              <CandleChart
                candles={all}
                shown={shown}
                width={width - 56}
                height={180}
                kind="playful"
                splitAt={n0}
                hideAfterSplit={m.phase === 'decide'}
                extent={[SCENARIO.stop, SCENARIO.target]}
                lines={
                  m.phase === 'decide'
                    ? []
                    : [
                        { price: SCENARIO.target, label: 'Target', color: p.up },
                        { price: SCENARIO.stop, label: 'Stop', color: p.down },
                      ]
                }
              />
            </Press>
          </Enter>
        </>
      }
      reserve={m.phase === 'reveal' ? Math.max(0, bandH - BAND_FOOTER) : 0}
      footer={
        <Row gap={10} style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 20 }}>
          {(
            [
              ['long', 'Long', 'updown'],
              ['short', 'Short', 'updown'],
              ['none', 'No trade', 'hourglass'],
            ] as ['long' | 'short' | 'none', string, IconName][]
          ).map(([s, label]) => (
            <View key={s} style={{ flex: 1 }}>
              <Chunky
                sound={null}
                disabled={m.phase !== 'decide'}
                color={m.side === s ? p.accentTint : p.surface}
                edge={m.side === s ? p.accent : p.line}
                onPress={() => m.choose(s)}
              >
                <T
                  v="answer"
                  lines={1}
                  color={m.side === s ? p.accent : p.text}
                  style={{ fontSize: 16 }}
                >
                  {label}
                </T>
              </Chunky>
            </View>
          ))}
        </Row>
      }
      overlay={
        copy && m.phase === 'reveal' ? (
          <Band grade={copy.grade} title={copy.chip} onContinue={next} onHeight={setBandH}>
            <T v="body">{copy.first}</T>
            <View style={{ backgroundColor: p.surface, borderRadius: 14, padding: 10, gap: 2 }}>
              <T v="caption" color={p.muted}>
                {copy.outcome}
              </T>
              <T v="answer" num color={res ? (res.total < 0 ? p.down : p.up) : p.muted}>
                {res
                  ? `${money(res.total)} on ${SCENARIO.shares} shares · ${res.r < 0 ? '−' : '+'}${Math.abs(res.r).toFixed(1)}R`
                  : 'Had you bought: −$0.12 per share'}
              </T>
            </View>
            {m.side === 'long' && (
              <T v="caption">
                Right call, lost anyway: this setup loses about 4 in 10.{' '}
                <T v="caption" color={p.accent} style={{ fontWeight: '800' }}>
                  Why?
                </T>
              </T>
            )}
            {m.side === 'short' && (
              <T v="caption">It won this time. A win on the wrong call is luck.</T>
            )}
            <T v="caption" color={p.muted}>
              Practice only. Real trading can lose money.
            </T>
          </Band>
        ) : null
      }
    />
  );
}

function Match() {
  const { p, next } = useProto();
  const mt = useMatch();
  const [bandH, setBandH] = useState(0);
  const tile = (
    text: string,
    key: string,
    s: { sel: boolean; slot?: number; miss: boolean },
    onPress: () => void,
  ) => {
    const pair = s.slot !== undefined ? p.pairs[s.slot] : undefined;
    const edge = s.miss ? p.down : (pair ?? (s.sel ? p.accent : p.line));
    return (
      <Chunky
        key={key}
        color={s.miss ? p.downTint : s.sel ? p.accentTint : p.surface}
        edge={edge}
        height={70}
        sound={null}
        onPress={onPress}
      >
        <Row gap={6}>
          {pair && (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: pair,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <T v="caption" color={p.ground} style={{ fontWeight: '800', lineHeight: 16 }}>
                {String((s.slot ?? 0) + 1)}
              </T>
            </View>
          )}
          <T v="label" color={pair ?? p.text} style={{ flexShrink: 1, textAlign: 'center' }}>
            {text}
          </T>
        </Row>
      </Chunky>
    );
  };
  return (
    <Screen
      pad={18}
      header={<TopBar step={0.7} />}
      top={
        <Enter>
          <T v="prompt" style={{ marginTop: 12 }}>
            {MATCH.prompt}
          </T>
        </Enter>
      }
      answers={
        <Enter i={1} style={{ gap: 10 }}>
          {MATCH.pairs.map((pr, i) => (
            <Row key={pr.term} gap={10} center={false}>
              <View style={{ width: '36%' }}>
                {tile(
                  pr.term,
                  `l${i}`,
                  { sel: mt.left === i, slot: mt.pairs[i], miss: mt.miss?.l === i },
                  () => mt.tapLeft(i),
                )}
              </View>
              <View style={{ flex: 1 }}>
                {tile(
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
      reserve={mt.checked ? Math.max(0, bandH - BAND_FOOTER) : 0}
      footer={<Cta label="Check" disabled={!mt.done} onPress={mt.check} />}
      overlay={
        mt.checked && mt.grade ? (
          <Band
            grade={mt.grade}
            title={
              mt.grade === 'correct'
                ? 'Perfect match!'
                : mt.grade === 'amber'
                  ? 'One slip, still right'
                  : 'Two slips'
            }
            onContinue={next}
            onHeight={setBandH}
          >
            <T v="body">
              Market is speed, limit is price, stop is a trigger, bracket is all three.
            </T>
          </Band>
        ) : null
      }
    />
  );
}

function Flame() {
  const { p, reduced } = useProto();
  const s = useSharedValue(reduced ? 1 : 0.6);
  useEffect(() => {
    if (!reduced)
      s.set(
        withDelay(
          1100,
          withSequence(
            withTiming(1.25, { duration: 180 }),
            withSpring(1, { duration: 400, dampingRatio: 0.5 }),
          ),
        ),
      );
  }, [reduced, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));
  return (
    <Animated.View style={a}>
      <Icon name="flame" size={30} color={p.amber} filled />
    </Animated.View>
  );
}

function Complete() {
  const { p, next } = useProto();
  const t = useProgress(1100, 150);
  const xp = useCountUp(COMPLETE.xp, 1000, 250);
  return (
    <Screen
      pad={18}
      top={
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 28 }}>
          <Enter>
            <T v="display" center>
              Lesson complete!
            </T>
            <T v="body" color={p.muted} center>
              {COMPLETE.lesson}
            </T>
          </Enter>
          <View style={{ marginVertical: 18 }}>
            <Ring
              size={190}
              stroke={16}
              value={COMPLETE.decisions.right / COMPLETE.decisions.total}
              t={t}
              color={p.up}
              track={p.line}
            >
              <T v="display" num color={p.accent}>{`+${xp}`}</T>
              <T v="label" upper color={p.muted}>
                XP
              </T>
            </Ring>
          </View>
          <Enter i={2} style={{ alignSelf: 'stretch', gap: 10 }}>
            <Row gap={10}>
              {[
                ['Decisions', `${COMPLETE.decisions.right}/${COMPLETE.decisions.total}`, p.up],
                ['Results', `${COMPLETE.results.won} won · ${COMPLETE.results.lost} lost`, p.text],
              ].map(([k, v, c]) => (
                <View
                  key={k}
                  style={{
                    flex: 1,
                    backgroundColor: p.surface,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: p.line,
                    padding: 12,
                    gap: 2,
                  }}
                >
                  <T v="label" upper color={p.muted}>
                    {k}
                  </T>
                  <T v="answer" num color={c}>
                    {v}
                  </T>
                </View>
              ))}
            </Row>
            <Row gap={10} style={{ backgroundColor: p.amberTint, borderRadius: 18, padding: 12 }}>
              <Flame />
              <View style={{ flex: 1 }}>
                <T v="answer">{`${COMPLETE.streak} days in a row`}</T>
                <T
                  v="caption"
                  color={p.muted}
                >{`Today's goal met: ${COMPLETE.goal.done} of ${COMPLETE.goal.of}`}</T>
              </View>
            </Row>
          </Enter>
        </View>
      }
      footer={<Cta label="Continue" onPress={next} />}
    />
  );
}

function Map() {
  const { p, width, next } = useProto();
  const xs = [0.28, 0.5, 0.72, 0.5, 0.28, 0.5];
  return (
    <View style={{ flex: 1, backgroundColor: p.ground }}>
      <Row style={{ paddingHorizontal: 18, paddingTop: 12, justifyContent: 'space-between' }}>
        {[
          ['flame', `${MAP.hud.streak} days`, p.amber],
          ['target', `Today ${MAP.hud.today}/${MAP.hud.goal}`, p.accent],
          ['heart', `${MAP.hud.hearts}`, p.down],
        ].map(([icon, text, c]) => (
          <Row
            key={text}
            gap={4}
            style={{
              backgroundColor: p.surface,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 2,
              borderColor: p.line,
            }}
          >
            <Icon name={icon as IconName} size={18} color={c} filled={icon !== 'target'} />
            <T v="label" num color={c}>
              {text}
            </T>
          </Row>
        ))}
      </Row>
      <Screen
        pad={18}
        top={
          <>
            <Enter style={{ marginTop: 12 }}>
              <View
                style={{
                  backgroundColor: p.accent,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: EDGE,
                  borderBottomColor: shade(p.accent),
                }}
              >
                <T v="label" upper color={p.onAccent} style={{ opacity: 0.85 }}>
                  {MAP.chapter}
                </T>
                <T v="title" color={p.onAccent}>
                  Level 6 · Lesson 2 of 4
                </T>
              </View>
            </Enter>
            <View style={{ marginTop: 6 }}>
              {MAP.levels.map((l, i) => {
                const x = xs[i % xs.length] * (width - 36);
                const locked = l.state === 'locked';
                const cur = l.state === 'current';
                const face = locked
                  ? p.surfaceAlt
                  : l.state === 'perfect'
                    ? p.amber
                    : cur
                      ? p.accent
                      : p.up;
                // The label sits on the side with room, never across the bubble.
                const labelRight = x <= (width - 36) / 2;
                return (
                  <View key={l.n} style={{ height: 104, justifyContent: 'center' }}>
                    <View style={{ position: 'absolute', left: x - 38, top: 14 }}>
                      {cur && (
                        <View
                          style={{
                            position: 'absolute',
                            left: -8,
                            top: -8,
                            width: 92,
                            height: 92,
                            borderRadius: 46,
                            borderWidth: 4,
                            borderColor: p.accentTint,
                          }}
                        />
                      )}
                      <Chunky
                        color={face}
                        edge={locked ? p.line : undefined}
                        height={72}
                        style={{ width: 76, borderRadius: 38 }}
                        onPress={cur ? next : undefined}
                        label={l.title}
                        sound={cur ? SOUND.advance : SOUND.choose}
                      >
                        <Icon
                          name={l.icon}
                          size={32}
                          color={locked ? p.muted : p.onAccent}
                          strokeWidth={2.5}
                        />
                      </Chunky>
                      {cur && (
                        <View
                          style={{
                            position: 'absolute',
                            top: -26,
                            left: -2,
                            backgroundColor: p.surface,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: p.accent,
                            paddingHorizontal: 8,
                            paddingVertical: 1,
                          }}
                        >
                          <T v="label" upper color={p.accent}>
                            Start
                          </T>
                        </View>
                      )}
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        top: 36,
                        ...(labelRight ? { left: x + 50, right: 0 } : { left: 0, width: x - 50 }),
                      }}
                    >
                      <T
                        v="caption"
                        color={p.muted}
                        lines={1}
                        style={{ textAlign: labelRight ? 'left' : 'right' }}
                      >{`Level ${l.n} · ${l.kind}`}</T>
                      <T
                        v="label"
                        color={locked ? p.muted : p.text}
                        lines={1}
                        style={{ textAlign: labelRight ? 'left' : 'right' }}
                      >
                        {l.title}
                      </T>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        }
        footer={
          <Row
            style={{
              justifyContent: 'space-around',
              paddingTop: 8,
              paddingBottom: 18,
              borderTopWidth: 2,
              borderTopColor: p.line,
            }}
          >
            {(['learn', 'practice', 'account'] as const).map((icon, i) => (
              <View
                key={icon}
                style={{
                  padding: 8,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: i === 0 ? p.accent : 'transparent',
                  backgroundColor: i === 0 ? p.accentTint : 'transparent',
                }}
              >
                <Icon
                  name={icon}
                  size={28}
                  color={i === 0 ? p.accent : p.muted}
                  strokeWidth={2.25}
                />
              </View>
            ))}
          </Row>
        }
      />
    </View>
  );
}

export const PLAYFUL: Partial<Record<ScreenId, () => React.ReactElement>> = {
  theory: Theory,
  choice: Choice,
  chart: Chart,
  match: Match,
  complete: Complete,
  map: Map,
};
