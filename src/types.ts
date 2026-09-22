// Types for the subset of docs/schema.md this player renders.
// Ten screen types plus the header fields the shell needs.

export type ScreenType =
  // docs/UI.md §3 — non-question screens
  | 'intro'
  | 'theory'
  | 'example'
  | 'carousel'
  | 'walkthrough'
  | 'visual'
  | 'checklist-reveal'
  | 'story'
  | 'recap'
  | 'plan-card'
  | 'summary'
  | 'badge'
  | 'tier-up'
  | 'path-choice'
  // docs/UI.md §4.1 — question screens
  | 'mc'
  | 'tf'
  | 'numeric-mc'
  | 'numeric-input'
  | 'fill-tiles'
  | 'fill-choice'
  | 'match'
  | 'sort'
  | 'order'
  | 'hotspot'
  | 'slider'
  | 'chart-tap'
  | 'chart-decision'
  | 'spot-mistake'
  // docs/UI.md §4.2 — question screens [v3]
  | 'swipe-deck'
  | 'chart-annotate'
  | 'order-build'
  | 'scanner-pick'
  | 'compare'
  | 'branch'
  | 'journal-row'
  | 'depth-ladder'
  | 'chart-replay';

export type ComponentId =
  | 'chart-line'
  | 'chart-candles'
  | 'quote-card'
  | 'quote-panel'
  | 'ownership-pie'
  | 'bar-chart'
  | 'session-ribbon'
  | 'cost-stack'
  | 'order-book'
  | 'order-ticket'
  | (string & {});

export type McOption = { text: string; correct?: boolean };

export type IntroScreen = { type: 'intro'; text: string; counter?: number };

export type TheoryScreen = {
  type: 'theory';
  title: string;
  body: string;
  visual?: ComponentId;
  visual_data?: Record<string, any>;
};

export type ExampleScreen = {
  type: 'example';
  body: string;
  visual?: ComponentId;
  visual_data?: Record<string, any>;
};

export type McScreen = {
  type: 'mc';
  prompt: string;
  options: McOption[];
  explanation: string;
};

export type NumericMcScreen = {
  type: 'numeric-mc';
  prompt: string;
  options: McOption[];
  working?: string;
  explanation: string;
};

export type TfScreen = {
  type: 'tf';
  statement: string;
  answer: boolean;
  explanation: string;
};

export type NumericInputScreen = {
  type: 'numeric-input';
  prompt: string;
  answer: number;
  tolerance?: number;
  unit?: string;
  working?: string;
  explanation: string;
};

export type FillTilesScreen = {
  type: 'fill-tiles';
  sentence: string;
  answer: string;
  explanation: string;
};

export type MatchScreen = {
  type: 'match';
  prompt: string;
  pairs: [string, string][];
  explanation: string;
};

export type ChartLevel = { price: number; label?: string };

export type ChartSpec = {
  kind: 'line' | 'candles';
  /** line: closes. candles: [open, high, low, close] per bar. */
  data: number[] | [number, number, number, number][];
  decision_index: number;
  volume?: number[];
  levels?: ChartLevel[];
  vwap?: number[];
};

export type DecisionButton = 'long' | 'short' | 'no-trade' | 'buy' | 'wait';

export type ChartDecisionScreen = {
  type: 'chart-decision';
  scenario: string;
  shares: number;
  chart: ChartSpec;
  state?: string[];
  /** default [long, short, no-trade] per docs/schema.md */
  buttons?: DecisionButton[];
  best: DecisionButton;
  reasonable?: DecisionButton[];
  outcome: string;
  explanation: string;
};

// --- docs/UI.md §3, the rest of the non-question archetypes ---

export type CarouselScreen = {
  type: 'carousel';
  cards: { label: string; text: string; icon?: string }[];
};

export type WalkthroughScreen = {
  type: 'walkthrough';
  component: ComponentId;
  data: Record<string, any>;
  steps: { spotlight: string; text: string }[];
};

export type VisualScreen = {
  type: 'visual';
  component: ComponentId;
  data: Record<string, any>;
  caption?: string;
};

export type ChecklistRevealScreen = {
  type: 'checklist-reveal';
  title: string;
  items: string[];
};

export type StoryScreen = {
  type: 'story';
  text: string;
};

export type RecapScreen = {
  type: 'recap';
  title: string;
  points: { text: string; level?: string }[];
};

export type PlanField = {
  key: string;
  label: string;
  kind?: 'number' | 'text';
  suggest?: string | number;
};

export type PlanCardScreen = {
  type: 'plan-card';
  title: string;
  intro?: string;
  slot?: string;
  fields: PlanField[];
  note?: string;
};

export type SummaryScreen = { type: 'summary'; total: number };

export type BadgeScreen = { type: 'badge'; name: string; unlocks?: string };

export type TierUpScreen = { type: 'tier-up'; tier: string; means: string };

export type PathChoiceScreen = { type: 'path-choice' };

// --- docs/UI.md §4.1, the rest of the v2 question types ---

export type FillChoiceScreen = {
  type: 'fill-choice';
  sentence: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type SortScreen = {
  type: 'sort';
  prompt: string;
  buckets: string[];
  items: { text: string; bucket: string }[];
  explanation: string;
};

export type OrderScreen = {
  type: 'order';
  prompt: string;
  /** In the correct order. */
  items: string[];
  explanation: string;
};

export type HotspotScreen = {
  type: 'hotspot';
  component: ComponentId;
  prompt: string;
  data: Record<string, any>;
  target?: string;
  targets?: string[];
  explanation: string;
};

export type SliderScreen = {
  type: 'slider';
  prompt: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  answer: number;
  tolerance?: number;
  explanation: string;
};

export type ChartTapScreen = {
  type: 'chart-tap';
  prompt: string;
  chart: { kind: 'line' | 'candles'; data: any[] };
  target: number;
  explanation: string;
};

export type SpotMistakeScreen = {
  type: 'spot-mistake';
  prompt: string;
  segments: { text: string; wrong?: boolean }[];
  explanation: string;
};

// --- docs/UI.md §4.2, the v3 question types ---

export type MiniChart = {
  label?: string;
  kind?: 'line' | 'candles';
  data: any[];
  levels?: ChartLevel[];
};

export type SwipeDeckScreen = {
  type: 'swipe-deck';
  prompt: string;
  cards: { chart: MiniChart; answer: 'take' | 'pass'; verdict: string }[];
  explanation: string;
};

export type ChartAnnotateScreen = {
  type: 'chart-annotate';
  prompt: string;
  chart: ChartSpec;
  answer: number;
  tolerance: number;
  explanation: string;
};

export type OrderBuildScreen = {
  type: 'order-build';
  prompt: string;
  slots: string[];
  chips: Record<string, string[]>;
  answer: Record<string, string>;
  explanation: string;
};

export type ScannerRow = {
  ticker: string;
  price?: number;
  change_pct?: number;
  rvol?: number;
  float?: string;
  spread?: number;
  catalyst?: string;
};

export type ScannerPickScreen = {
  type: 'scanner-pick';
  prompt: string;
  rows: ScannerRow[];
  target: string;
  explanation: string;
};

export type CompareScreen = {
  type: 'compare';
  prompt: string;
  charts: MiniChart[];
  answer: string;
  allow_neither?: boolean;
  explanation: string;
};

export type BranchScreen = {
  type: 'branch';
  prompt: string;
  steps: {
    text: string;
    options: { text: string; correct?: boolean; consequence: string }[];
  }[];
  explanation: string;
};

export type JournalRowScreen = {
  type: 'journal-row';
  prompt: string;
  slots: string[];
  chips: Record<string, string[]>;
  answer: Record<string, string>;
  explanation: string;
};

export type DepthLadderScreen = {
  type: 'depth-ladder';
  prompt: string;
  bids: [number, number][];
  asks: [number, number][];
  target: string;
  explanation: string;
};

export type ReplayMoment = {
  bar: number;
  kind: 'setup' | 'decoy';
  /** The five setup-card fields and whether they were filled at this bar. */
  fields?: { label: string; filled: boolean }[];
  note: string;
};

export type ChartReplayScreen = {
  type: 'chart-replay';
  prompt: string;
  chart: { kind: 'candles'; data: [number, number, number, number][]; volume?: number[] };
  start_bar?: number;
  moments: ReplayMoment[];
  explanation: string;
};

export type Screen =
  | IntroScreen
  | TheoryScreen
  | ExampleScreen
  | McScreen
  | NumericMcScreen
  | TfScreen
  | NumericInputScreen
  | FillTilesScreen
  | MatchScreen
  | ChartDecisionScreen
  | CarouselScreen
  | WalkthroughScreen
  | VisualScreen
  | ChecklistRevealScreen
  | StoryScreen
  | RecapScreen
  | PlanCardScreen
  | SummaryScreen
  | BadgeScreen
  | TierUpScreen
  | PathChoiceScreen
  | FillChoiceScreen
  | SortScreen
  | OrderScreen
  | HotspotScreen
  | SliderScreen
  | ChartTapScreen
  | SpotMistakeScreen
  | SwipeDeckScreen
  | ChartAnnotateScreen
  | OrderBuildScreen
  | ScannerPickScreen
  | CompareScreen
  | BranchScreen
  | JournalRowScreen
  | DepthLadderScreen
  | ChartReplayScreen;

export type QuestionScreen =
  | McScreen
  | NumericMcScreen
  | TfScreen
  | NumericInputScreen
  | FillTilesScreen
  | MatchScreen
  | ChartDecisionScreen
  | FillChoiceScreen
  | SortScreen
  | OrderScreen
  | HotspotScreen
  | SliderScreen
  | ChartTapScreen
  | SpotMistakeScreen
  | SwipeDeckScreen
  | ChartAnnotateScreen
  | OrderBuildScreen
  | ScannerPickScreen
  | CompareScreen
  | BranchScreen
  | JournalRowScreen
  | DepthLadderScreen
  | ChartReplayScreen;

export type Level = {
  id: string;
  title: string;
  chapter: number;
  chapter_title: string;
  path: string;
  category: string;
  tags: string[];
  learning_goal: string;
  purpose: string;
  terms_introduced?: string[];
  prerequisite: string | null;
  xp: number;
  difficulty: number;
  sources?: string[];
  notes?: string;
  screens: Screen[];
};

export type MarketProfile = {
  name: string;
  currency_symbol: string;
  currency_code: string;
  index_example: string;
  timezone: string;
  [key: string]: string;
};

export const QUESTION_TYPES: ScreenType[] = [
  'mc',
  'tf',
  'numeric-mc',
  'numeric-input',
  'fill-tiles',
  'fill-choice',
  'match',
  'sort',
  'order',
  'hotspot',
  'slider',
  'chart-tap',
  'chart-decision',
  'spot-mistake',
  'swipe-deck',
  'chart-annotate',
  'order-build',
  'scanner-pick',
  'compare',
  'branch',
  'journal-row',
  'depth-ladder',
  'chart-replay',
];

export function isQuestion(screen: Screen): screen is QuestionScreen {
  return QUESTION_TYPES.includes(screen.type);
}
