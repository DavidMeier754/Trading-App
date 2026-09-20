import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, TAP_TARGET, type } from '../theme';

/** docs/UI.md §2: close ✕ opens "Quit lesson? Progress in this sub-level is lost." */
export default function QuitSheet({
  visible,
  onCancel,
  onQuit,
}: {
  visible: boolean;
  onCancel: () => void;
  onQuit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Quit lesson?</Text>
        <Text style={styles.body}>Progress in this sub-level is lost.</Text>
        <Pressable accessibilityRole="button" onPress={onQuit} style={styles.quit}>
          <Text style={styles.quitText}>Quit</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.stay}>
          <Text style={styles.stayText}>Keep learning</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: space.xl,
    paddingBottom: space.xxl,
    gap: space.md,
  },
  title: { ...type.title, color: colors.text },
  body: { ...type.body, color: colors.textMuted },
  quit: {
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    backgroundColor: colors.down,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitText: { ...type.answer, color: colors.text },
  stay: {
    minHeight: TAP_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayText: { ...type.answer, color: colors.accent },
});
