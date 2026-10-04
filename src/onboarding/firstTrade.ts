import type { LessonEntry } from '../content';
import type { Level } from '../types';

/**
 * docs/ui/16-navigation.md §11.1 [DESIGN-REVIEW] "The first decision comes first": the
 * very first screen of a fresh install is a chart and two keys, Buy and Wait,
 * with one line. The learner chooses, the price plays out as on any chart
 * decision, and the app says "That was your first decision." with one
 * sentence on what the app is. Shown once; not graded, it earns nothing and
 * costs nothing (LessonPlayer, kind `first`). The welcome steps follow once
 * stage ONBOARDING builds them; until then it goes straight to the map.
 */
export const FIRST_TRADE_LINE =
  'This app teaches you to make calls like that one, a lesson at a time, and to judge each by the decision, not by how one trade turned out.';

const level: Level = {
  id: 'first-trade',
  title: 'Your first decision',
  chapter: 0,
  chapter_title: 'Welcome',
  path: 'all',
  category: 'new-theory',
  tags: [],
  learning_goal: '',
  purpose: '',
  prerequisite: null,
  xp: 0,
  difficulty: 1,
  screens: [
    {
      type: 'chart-decision',
      scenario: 'XYZ has been climbing. Buy, or wait?',
      shares: 100,
      chart: {
        kind: 'line',
        data: [19.62, 19.7, 19.66, 19.78, 19.84, 19.9, 19.96, 20.04, 20.1, 20.06, 20.18],
        decision_index: 5,
      },
      buttons: ['buy', 'wait'],
      best: 'buy',
      reasonable: ['wait'],
      outcome: 'It kept climbing, to $20.18.',
      explanation: FIRST_TRADE_LINE,
    },
  ],
};

export const FIRST_TRADE: LessonEntry = {
  id: 'first-trade',
  title: 'Your first decision',
  subtitle: 'Your first decision',
  level,
};
