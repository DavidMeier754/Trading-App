import React from 'react';
import { StyleSheet, View } from 'react-native';

import Visual from '../components/Visual';
import { space } from '../theme';
import type { TheoryScreen as S } from '../types';
import { Body, ScreenTitle } from './common';

/** docs/UI.md §3 `theory`: title + body (max 3 lines) + optional visual. */
export default function TheoryScreen({ screen, width }: { screen: S; width: number }) {
  return (
    <View style={styles.wrap}>
      {screen.visual ? (
        <Visual component={screen.visual} data={screen.visual_data} width={width} />
      ) : null}
      <View style={styles.text}>
        <ScreenTitle>{screen.title}</ScreenTitle>
        <Body>{screen.body}</Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // docs/UI.md §2: visual above text.
  wrap: { gap: space.xl },
  text: { gap: space.md },
});
