import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { reportError } from './errorReport';
import { TEST_TOOLS } from './testTools';
import { colors, radius, space, TAP_TARGET, type, themed } from './theme';

type Props = {
  children: React.ReactNode;
  /** "Back to the map": leave whatever broke and go home. */
  onBack: () => void;
};
type State = { error: Error | null; stack: string | null };

/**
 * Catches a render-time throw and puts a way out on screen (review S23).
 *
 * Without this, a throw anywhere below tears the tree down to a blank screen,
 * which from the outside is indistinguishable from the app dying. A learner
 * gets a friendly sentence and "Back to the map"; their progress is saved as
 * they go, so nothing is lost. The message and the stack are for testers, and
 * only a test build shows them. Every caught error goes to the error report
 * hook (errorReport.ts), which stage ANALYTICS wires to a crash reporter.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, stack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    const stack = info?.componentStack ?? null;
    this.setState({ stack });
    reportError({ error, componentStack: stack });
    // Also to the Metro console, where the whole stack survives.
    console.error('[LessonPlayer] render failed:', error, stack);
  }

  private back = () => {
    this.setState({ error: null, stack: null });
    this.props.onBack();
  };

  render() {
    const { error, stack } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.wrap} testID="error-page">
        <View style={styles.body}>
          <Text style={styles.title} accessibilityRole="header">
            This screen didn’t load
          </Text>
          <Text style={styles.text}>
            Something went wrong on our side, not yours. Your progress is saved.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={this.back}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Back to the map</Text>
          </Pressable>
        </View>
        {TEST_TOOLS ? (
          <View style={styles.details}>
            <Text style={styles.detailsHead}>For testers</Text>
            <Text style={styles.message} testID="error-message">
              {error.message || String(error)}
            </Text>
            <ScrollView style={styles.scroll}>
              <Text style={styles.stack}>{stack ?? error.stack ?? 'no stack'}</Text>
            </ScrollView>
          </View>
        ) : null}
      </View>
    );
  }
}

/** `#debug-crash` in a test build: a screen that throws, to see the page above. */
export function DebugCrash(): React.ReactNode {
  throw new Error('Test crash from #debug-crash');
}

const styles = themed(() => ({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
    padding: space.lg,
    paddingTop: space.xxl * 2,
    gap: space.xl,
  },
  body: { gap: space.md },
  title: { ...type.title, color: colors.text },
  text: { ...type.body, color: colors.textMuted },
  button: {
    marginTop: space.sm,
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    backgroundColor: colors.accentFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  pressed: { opacity: 0.8 },
  buttonText: { ...type.label, fontSize: 16, color: colors.accentText },
  details: {
    flex: 1,
    gap: space.sm,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space.md,
  },
  detailsHead: { ...type.label, color: colors.textFaint, textTransform: 'uppercase' },
  message: { ...type.label, color: colors.down },
  scroll: { flex: 1 },
  stack: { ...type.small, color: colors.textMuted, fontFamily: 'monospace' },
}));
