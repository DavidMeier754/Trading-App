import React from 'react';
import { View } from 'react-native';

import { Enter, Press, Row, SOUND, T, useProto } from './kit';
import { Screen } from './layout';
import { SkinKey } from './skin';
import type { Direction, Palette } from './directions';

/**
 * The seventh screen of every direction: its type scale, its colours with
 * their measured contrast, and its motion in words. The stage asks for "a
 * proposal for the type scale"; this is it, one per direction, drawn in the
 * direction itself.
 */

function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const ch = (s: number) => {
    const c = ((n >> s) & 255) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(16) + 0.7152 * ch(8) + 0.0722 * ch(0);
}

/** WCAG contrast of two opaque hex colours. */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((u, v) => v - u);
  return (x + 0.05) / (y + 0.05);
}

const STEPS: { key: keyof Direction['type']; use: string }[] = [
  { key: 'display', use: 'Lesson complete, big numbers' },
  { key: 'title', use: 'Card titles' },
  { key: 'prompt', use: 'The question' },
  { key: 'body', use: 'Body text, explanations' },
  { key: 'answer', use: 'Answers and buttons' },
  { key: 'label', use: 'Labels, chips, the HUD' },
  { key: 'caption', use: 'The smallest text: axis, risk note' },
];

export default function TypeSheet() {
  const { d, p, next, skin } = useProto();
  const swatch = (name: string, fg: keyof Palette) => {
    const ratio = contrast(p[fg] as string, p.ground);
    return (
      <Row key={name} style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
        <Row gap={8}>
          <View
            style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: p[fg] as string }}
          />
          <T v="caption">{name}</T>
        </Row>
        <T v="caption" num color={ratio >= 4.5 ? p.muted : p.down}>{`${ratio.toFixed(1)} : 1`}</T>
      </Row>
    );
  };
  return (
    <Screen
      top={
        <View style={{ gap: 14, paddingTop: 16, paddingBottom: 12 }}>
          <Enter>
            <T
              v="label"
              color={p.accent}
            >{`${d.name}${skin ? ` · ${skin.name}` : ''} · type, colour and motion`}</T>
            <T v="caption" color={p.muted}>
              Sizes in points. Nothing a decision depends on goes below 13.
            </T>
          </Enter>
          <Enter i={1} style={{ gap: 8 }}>
            {STEPS.map(({ key, use }) => {
              const s = d.type[key];
              return (
                <View
                  key={key}
                  style={{ borderBottomWidth: 1, borderBottomColor: p.line, paddingBottom: 6 }}
                >
                  <T v={key} lines={1}>
                    Price holds above 9.70
                  </T>
                  <T
                    v="caption"
                    num
                    color={p.muted}
                  >{`${key} · ${s.fontSize}/${s.lineHeight} · ${s.fontWeight} · ${use}`}</T>
                </View>
              );
            })}
          </Enter>
          <Enter i={2}>
            <T v="label" color={p.muted}>
              Contrast against the ground
            </T>
            {swatch('Text', 'text')}
            {swatch('Muted text', 'muted')}
            {swatch('Accent', 'accent')}
            {swatch('Up', 'up')}
            {swatch('Down', 'down')}
            {swatch('Amber', 'amber')}
          </Enter>
          <Enter i={3} style={{ gap: 4 }}>
            <T v="label" color={p.muted}>
              Motion
            </T>
            {Object.entries(d.motion).map(([k, v]) => (
              <T key={k} v="caption">{`${k[0].toUpperCase()}${k.slice(1)}: ${v}`}</T>
            ))}
            <T v="caption" color={p.muted}>
              A tap finishes or skips any motion. Reduce motion turns movement into a short fade.
            </T>
          </Enter>
        </View>
      }
      footer={
        <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}>
          {skin ? (
            <SkinKey skin={skin} label="Back to the start" onPress={next} height={52} />
          ) : (
            <Press
              onPress={next}
              sound={SOUND.advance}
              style={{
                height: 52,
                borderRadius: d.radius,
                backgroundColor: p.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <T v="answer" color={p.onAccent}>
                Back to the start
              </T>
            </Press>
          )}
        </View>
      }
    />
  );
}
