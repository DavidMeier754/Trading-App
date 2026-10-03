import React from 'react';
import { Text, View } from 'react-native';

import Icon from '../home/icons';
import type { Skill } from '../skills';
import { colors, radius, space, type, themed } from '../theme';
import { Arrive } from './Celebrate';
import { surfaceStyle, useLookSpec } from './look';

/** At most this many cards on the screen; the rest are counted. */
const SHOWN = 6;

/**
 * docs/UI.md §5.3 [DESIGN-REVIEW] (David, 2026-10-03): after a lesson that
 * taught something new, "a small overview of what he has learned" -- its new
 * skills as cards, dealt in one after another -- before lesson complete. Back
 * home they fly into the Practice tab, where each opens its card again.
 */
export default function SkillsLearned({ skills }: { skills: Skill[] }) {
  const spec = useLookSpec();
  const shown = skills.slice(0, SHOWN);
  const more = skills.length - shown.length;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.kicker}>New skills</Text>
        <Text style={styles.title} accessibilityRole="header">
          What you learned
        </Text>
      </View>
      <View style={styles.grid}>
        {shown.map((skill, i) => (
          <Arrive key={skill.id} delay={160 + i * 110} style={styles.cell}>
            <View
              style={[styles.card, surfaceStyle(spec)]}
              accessible
              accessibilityLabel={`${skill.kind === 'term' ? 'Term' : 'Skill'}: ${skill.name}`}
            >
              <View style={styles.badge}>
                <Icon
                  name={skill.kind === 'term' ? 'book' : 'bulb'}
                  size={18}
                  color={colors.accent}
                />
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {skill.name}
              </Text>
              <Text style={styles.kind}>{skill.kind === 'term' ? 'Term' : 'Skill'}</Text>
            </View>
          </Arrive>
        ))}
      </View>
      {more > 0 ? <Text style={styles.more}>{`+${more} more`}</Text> : null}
      <Text style={styles.note}>They go to Practice, where you can open each one again.</Text>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { gap: space.lg },
  head: { gap: space.xs },
  kicker: { ...type.label, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...type.display, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: { width: '48%', flexGrow: 1 },
  card: {
    minHeight: 104,
    padding: space.md,
    gap: space.xs,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...type.answer, color: colors.text },
  kind: { ...type.small, fontSize: 13, color: colors.textMuted },
  more: { ...type.small, fontSize: 13, color: colors.textMuted },
  note: { ...type.small, fontSize: 13, color: colors.textMuted },
}));
