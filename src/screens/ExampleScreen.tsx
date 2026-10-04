import React from 'react';
import { View } from 'react-native';

import Visual from '../components/Visual';
import { colors, space, type, themed } from '../theme';
import type { ExampleScreen as S } from '../types';
import { TermText } from '../lesson/termText';

/** docs/ui/03-screen-types.md §3 `example`: a concrete number or mini story + visual. */
export default function ExampleScreen({ screen, width }: { screen: S; width: number }) {
  return (
    <View style={styles.wrap}>
      {screen.visual ? (
        <Visual component={screen.visual} data={screen.visual_data} width={width} />
      ) : null}
      {/* The example is the point of the screen, not a caption to it: body
          size, in the text colour, not the muted grey a theory card uses
          under its title. */}
      <TermText text={screen.body} style={styles.body} />
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.xl },
  body: { ...type.body, color: colors.text },
}));
