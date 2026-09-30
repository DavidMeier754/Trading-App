import React, { useState } from 'react';
import { View } from 'react-native';

import Icon from '../home/icons';
import { Cta } from './Calm';
import { Enter, Press, Row, T, useCountUp, useProto } from './kit';
import { Screen } from './layout';
import { restStyle, SkinKey, SkinProgress } from './skin';

/**
 * Design suggestions: a development page, in test builds only (David,
 * 2026-09-29: "add another development page where you show design
 * suggestions like the ones you asked me about"). Each idea is drawn live in
 * the mix's look, with whether it is in the mix. New ideas land here first.
 */

type Idea = { id: string; title: string; line: string; inMix: boolean };

/** David's answers of 2026-09-29: count-up numbers and the step count are in. */
export const IDEAS: Idea[] = [
  {
    id: 'smallcaps',
    title: 'Labels in small caps',
    line: 'Small labels in spaced capitals.',
    inMix: false,
  },
  { id: 'keys', title: 'Answers keyed A to D', line: 'Each answer wears a letter.', inMix: false },
  {
    id: 'countup',
    title: 'Numbers that count up',
    line: 'Lesson complete counts its numbers up.',
    inMix: true,
  },
  {
    id: 'steps',
    title: 'Progress bar with a step count',
    line: 'The lesson bar says which screen of how many.',
    inMix: true,
  },
  {
    id: 'board',
    title: 'Board-style map',
    line: 'The levels as rows on a board instead of the path.',
    inMix: false,
  },
];

export default function Suggestions() {
  const { p, goto } = useProto();
  return (
    <Screen
      top={
        <View style={{ gap: 12, paddingTop: 12, paddingBottom: 16 }}>
          <Enter style={{ gap: 4 }}>
            <T v="title">Design suggestions</T>
            <T v="caption" color={p.muted}>
              Ideas for the look, tried here first. The ones in your mix are marked.
            </T>
          </Enter>
          {IDEAS.map((idea, i) => (
            <Enter key={idea.id} i={i + 1}>
              <Card idea={idea} />
            </Enter>
          ))}
        </View>
      }
      footer={<Cta label="Back to the start" onPress={() => goto('theory')} />}
    />
  );
}

function Card({ idea }: { idea: Idea }) {
  const proto = useProto();
  const { p } = proto;
  return (
    <View style={[restStyle(proto), { padding: 14, gap: 10 }]}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }} gap={10}>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="answer" style={{ fontWeight: '700' }}>
            {idea.title}
          </T>
          <T v="caption" color={p.muted}>
            {idea.line}
          </T>
        </View>
        <View
          style={{
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 3,
            backgroundColor: idea.inMix ? p.upTint : 'transparent',
            borderWidth: idea.inMix ? 0 : 1,
            borderColor: p.lineStrong,
          }}
        >
          <T v="caption" color={idea.inMix ? p.up : p.muted} lines={1}>
            {idea.inMix ? 'In your mix' : 'Not in your mix'}
          </T>
        </View>
      </Row>
      <Sample id={idea.id} />
    </View>
  );
}

function Sample({ id }: { id: string }) {
  if (id === 'smallcaps') return <SmallCaps />;
  if (id === 'keys') return <Keys />;
  if (id === 'countup') return <CountUp />;
  if (id === 'steps') return <Steps />;
  return <Board />;
}

function SmallCaps() {
  const { p } = useProto();
  return (
    <Row gap={12} center={false}>
      <View style={{ flex: 1, gap: 4 }}>
        <T v="caption" color={p.muted}>
          Now
        </T>
        <T v="label" color={p.text}>
          Lesson 2 of 4
        </T>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <T v="caption" color={p.muted}>
          Small caps
        </T>
        <T v="label" upper color={p.text} style={{ letterSpacing: 1.2 }}>
          Lesson 2 of 4
        </T>
      </View>
    </Row>
  );
}

function Keys() {
  const proto = useProto();
  const { p } = proto;
  return (
    <View style={{ gap: 8 }}>
      {['1.5 %', '3 %'].map((o, i) => (
        <Row key={o} gap={12} style={[restStyle(proto), { minHeight: 48, paddingHorizontal: 10 }]}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: p.lineStrong,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T v="label" color={p.muted}>
              {['A', 'B'][i]}
            </T>
          </View>
          <T v="answer" num>
            {o}
          </T>
        </Row>
      ))}
    </View>
  );
}

function CountUp() {
  const { p } = useProto();
  const [run, setRun] = useState(0);
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Counter key={run} />
      <Press label="Count again" onPress={() => setRun((r) => r + 1)} style={{ padding: 8 }}>
        <Row gap={6}>
          <Icon name="reset" size={16} color={p.accent} />
          <T v="label" color={p.accent}>
            Again
          </T>
        </Row>
      </Press>
    </Row>
  );
}

function Counter() {
  const { p } = useProto();
  const xp = useCountUp(40, 700, 150);
  return (
    <Row gap={8}>
      <T v="display" num color={p.accent}>{`+${xp}`}</T>
      <T v="label" color={p.muted}>
        XP
      </T>
    </Row>
  );
}

function Steps() {
  const { p, skin } = useProto();
  return (
    <Row gap={12}>
      <T v="title" color={p.muted}>
        ✕
      </T>
      {skin ? <SkinProgress skin={skin} step={4 / 12} /> : null}
      <T v="label" num color={p.muted}>
        4/12
      </T>
      <Row gap={4}>
        <Icon name="heart" size={16} color={p.down} filled />
        <T v="label" num color={p.muted}>
          5
        </T>
      </Row>
    </Row>
  );
}

function Board() {
  const proto = useProto();
  const { p, skin } = proto;
  const rows: { n: number; title: string; state: 'done' | 'current' | 'locked' }[] = [
    { n: 5, title: 'Practice: Volume', state: 'done' },
    { n: 6, title: 'Candle Signals', state: 'current' },
    { n: 7, title: 'Confluence', state: 'locked' },
  ];
  return (
    <View style={[restStyle(proto), { overflow: 'hidden' }]}>
      {rows.map((r, i) => (
        <Row
          key={r.n}
          gap={10}
          style={{
            minHeight: 52,
            paddingHorizontal: 10,
            borderTopWidth: i ? 1 : 0,
            borderTopColor: p.line,
            backgroundColor: r.state === 'current' ? p.accentTint : 'transparent',
          }}
        >
          <T v="caption" num color={p.muted}>{`L${r.n}`}</T>
          <T
            v="label"
            color={r.state === 'locked' ? p.muted : p.text}
            style={{ flex: 1 }}
            lines={1}
          >
            {r.title}
          </T>
          {r.state === 'current' && skin ? (
            <View style={{ width: 110 }}>
              <SkinKey skin={skin} label="Continue" height={36} />
            </View>
          ) : (
            <T v="caption" color={r.state === 'done' ? p.up : p.muted}>
              {r.state === 'done' ? 'Done' : 'Locked'}
            </T>
          )}
        </Row>
      ))}
    </View>
  );
}
