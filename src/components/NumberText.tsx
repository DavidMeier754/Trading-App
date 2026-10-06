import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { MONO_FONT } from '../theme';

/** A number as it is read: its sign, its currency, its digits and an R after it. */
const NUMBER = /[+−-]?[$€£]?\d[\d,.]*\d(?:R\b)?|[+−-]?[$€£]?\d(?:R\b)?/g;

/** A line cut into its words and its numbers, in order. */
export function numberRuns(text: string): { text: string; number: boolean }[] {
  const runs: { text: string; number: boolean }[] = [];
  let at = 0;
  for (const m of text.matchAll(NUMBER)) {
    const i = m.index ?? 0;
    if (i > at) runs.push({ text: text.slice(at, i), number: false });
    runs.push({ text: m[0], number: true });
    at = i + m[0].length;
  }
  if (at < text.length) runs.push({ text: text.slice(at), number: false });
  return runs;
}

/**
 * docs/ui/15-theming-and-accessibility.md §10 (Precise, LOOK-BRIEF): numbers in the monospaced
 * face while the words around them keep the text face -- "+$184.00 on 800
 * shares" sets "+$184.00" and "800" in the number face and "on" and "shares"
 * in the text face.
 */
export default function NumberText({
  children,
  style,
  numberOfLines,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {numberRuns(children).map((run, i) =>
        run.number ? (
          <Text key={i} style={{ fontFamily: MONO_FONT }}>
            {run.text}
          </Text>
        ) : (
          run.text
        ),
      )}
    </Text>
  );
}
