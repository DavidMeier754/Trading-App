import React from 'react';
import { StyleSheet, View } from 'react-native';

import Visual from '../components/Visual';
import { space } from '../theme';
import type { ExampleScreen as S } from '../types';
import { Body } from './common';

/** docs/UI.md §3 `example`: a concrete number or mini story + visual. */
export default function ExampleScreen({ screen, width }: { screen: S; width: number }) {
  return (
    <View style={styles.wrap}>
      {screen.visual ? (
        <Visual component={screen.visual} data={screen.visual_data} width={width} />
      ) : null}
      <Body>{screen.body}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: space.xl },
});
