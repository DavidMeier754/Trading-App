import React, { useEffect } from 'react';
import { BackHandler, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, themed } from '../theme';
import Cta from './Cta';
import { emitMood } from './look';
import { StreakLost, StreakUp } from './StreakScreens';

export type StreakChange =
  { kind: 'up'; from: number; to: number } | { kind: 'lost'; lost: number };

/**
 * docs/UI.md §7.2: every change of the streak gets a screen of its own, in the
 * app's own flow (David, 2026-10-04: "right now there is no animation when i
 * extend the streak"). Up: after the day's first finished lesson, between the
 * lesson and the map. Lost: as the app opens on a streak that broke. It plays
 * once; Continue ends it, and so does the back button.
 */
export default function StreakMoment({
  change,
  onDone,
}: {
  change: StreakChange;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    emitMood('calm');
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onDone();
      return true;
    });
    return () => sub.remove();
  }, [onDone]);
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.stage}>
        {change.kind === 'up' ? (
          <StreakUp from={change.from} to={change.to} />
        ) : (
          <StreakLost lost={change.lost} />
        )}
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        <Cta label="Continue" cue="advance" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = themed(() => ({
  // On the app's own ground (Backdrop), as every screen is.
  wrap: { flex: 1 },
  stage: { flex: 1, justifyContent: 'center', paddingHorizontal: space.lg },
  footer: { paddingHorizontal: space.lg, paddingTop: space.md },
}));
