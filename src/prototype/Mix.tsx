import React from 'react';
import { View } from 'react-native';

import Bonus from './Bonus';
import { CALM, Cta } from './Calm';
import { COMPLETE } from './data';
import type { ScreenId } from './directions';
import { Enter, Press, Row, T, useCountUp, useProgress, useProto } from './kit';
import { Ring, Screen } from './layout';
import PathMap from './Path';
import { restStyle } from './skin';
import { StreakLost, StreakUp } from './Streak';
import Suggestions from './Suggestions';

/**
 * The mix's screens: Calm's lesson screens in the skin of today's designs
 * (Calm.tsx, skin.tsx), and what David asked for on 2026-09-29 -- a lesson
 * end whose numbers count up, the streak full screen, today's path with his
 * changes, the bonus side lesson and the page of design suggestions.
 */

/**
 * Lesson complete, with fewer words: the ring and its count, three numbers
 * that count up (from Precise), and the one question to practise. The streak
 * has its own screen next.
 */
function Complete() {
  const proto = useProto();
  const { p, next } = proto;
  const t = useProgress(900, 200);
  const right = useCountUp(COMPLETE.decisions.right, 900, 200);
  const xp = useCountUp(COMPLETE.xp, 700, 600);
  const won = useCountUp(COMPLETE.results.won, 700, 600);
  const lost = useCountUp(COMPLETE.results.lost, 700, 600);
  const acc = COMPLETE.decisions.right / COMPLETE.decisions.total;
  const tiles: [string, string, string][] = [
    ['XP', `+${xp}`, p.accent],
    ['Won · lost', `${won} · ${lost}`, p.text],
    ['Today', `${COMPLETE.goal.done}/${COMPLETE.goal.of}`, p.up],
  ];
  return (
    <Screen
      top={
        <View style={{ alignItems: 'center', gap: 6, paddingTop: 36 }}>
          <Enter>
            <T v="title" center>
              Lesson done
            </T>
            <T v="caption" color={p.muted} center>
              {COMPLETE.lesson}
            </T>
          </Enter>
          <View style={{ marginVertical: 22 }}>
            <Ring size={168} stroke={6} value={acc} t={t} color={p.accent} track={p.line}>
              <T v="display" num>{`${right}/${COMPLETE.decisions.total}`}</T>
              <T v="caption" color={p.muted}>
                decisions right
              </T>
            </Ring>
          </View>
          <Enter i={2} style={{ alignSelf: 'stretch', gap: 16 }}>
            <Row gap={10}>
              {tiles.map(([k, v, color]) => (
                <View
                  key={k}
                  style={[
                    restStyle(proto),
                    { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
                  ]}
                >
                  <T v="prompt" num color={color} style={{ fontWeight: '700' }} lines={1}>
                    {v}
                  </T>
                  <T v="caption" color={p.muted} lines={1}>
                    {k}
                  </T>
                </View>
              ))}
            </Row>
            <Press label="Practice the one you missed" style={{ alignSelf: 'center', padding: 8 }}>
              <T v="label" color={p.accent}>
                Practice the one you missed ›
              </T>
            </Press>
          </Enter>
        </View>
      }
      footer={<Cta label="Continue" onPress={next} />}
    />
  );
}

export const MIX: Partial<Record<ScreenId, () => React.ReactElement>> = {
  ...CALM,
  complete: Complete,
  streak: StreakUp,
  lost: StreakLost,
  map: PathMap,
  bonus: Bonus,
  suggestions: Suggestions,
};
