import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from './theme';

type Props = { children: React.ReactNode };
type State = { error: Error | null; stack: string | null };

/**
 * Catches a render-time throw and puts it on screen.
 *
 * Without this, a throw anywhere below tears the tree down to a blank screen,
 * which from the outside is indistinguishable from the app dying -- and leaves
 * nothing to report. This turns that into a message that can be read, or
 * photographed and sent on.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, stack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    this.setState({ stack: info?.componentStack ?? null });
    // Also to the Metro console, where the whole stack survives.
    console.error('[LessonPlayer] render failed:', error, info?.componentStack);
  }

  render() {
    const { error, stack } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Something broke</Text>
        <Text style={styles.message}>{error.message || String(error)}</Text>
        <ScrollView style={styles.scroll}>
          <Text style={styles.stack}>{stack ?? error.stack ?? 'no stack'}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
    padding: space.lg,
    paddingTop: space.xxl * 2,
    gap: space.md,
  },
  title: { ...type.title, color: colors.down },
  message: { ...type.body, color: colors.text },
  scroll: { flex: 1 },
  stack: { ...type.small, color: colors.textMuted, fontFamily: 'monospace' },
});
