// Types for the subset of docs/level-files/ this player renders.
// Ten screen types plus the header fields the shell needs.

export type ScreenType =
  // docs/ui/03-screen-types.md §3 — non-question screens
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
  // docs/ui/04-question-types.md §4.1 — question screens
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
  // docs/ui/04-question-types.md §4.2 — question screens [v3]
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

export type IntroScreen = {
  type: 'intro';
  text: string;
  counter?: number;
  /** docs/level-files/ [DESIGN-REVIEW]: a test's briefing chips, the account numbers. */
  facts?: string[];
};

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
  /**
   * Not authored: a price range the frame must at least cover. The renderer
   * sets it so the lines of a `series` share one scale and a calm line stays
   * flat next to a volatile one.
   */
  range?: [number, number];
  /**
   * docs/level-files/ [DESIGN-REVIEW]: the first bar of the regular session. The
   * bars before it are shaded as pre-market and a bell line marks the open.
   */
  session_open?: number;
};

/** docs/level-files/ [DESIGN-REVIEW]: a short note on a bar, shown after the reveal. */
export type ChartNote = { bar: number; text: string; at?: 'high' | 'low' };

export type DecisionButton = 'long' | 'short' | 'no-trade' | 'buy' | 'wait';

export type ChartDecisionScreen = {
  type: 'chart-decision';
  scenario: string;
  shares: number;
  chart: ChartSpec;
  state?: string[];
  /** default [long, short, no-trade] per docs/level-files/ */
  buttons?: DecisionButton[];
  best: DecisionButton;
  reasonable?: DecisionButton[];
  /** docs/level-files/ [v4]: the plan's exit lines, drawn after the choice (DESIGN-REVIEW). */
  stop?: number;
  target?: number;
  outcome: string;
  explanation: string;
  /** docs/level-files/ [DESIGN-REVIEW]: notes on the chart after the reveal. */
  notes?: ChartNote[];
};

// --- docs/ui/03-screen-types.md §3, the rest of the non-question archetypes ---

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

/** docs/level-files/ [DESIGN-REVIEW]: a scene as a market alert. */
export type StoryAlert = {
  ticker: string;
  time?: string;
  facts?: string[];
  spark?: number[];
};

export type StoryScreen = {
  type: 'story';
  text: string;
  label?: 'scene' | 'takeaway';
  alert?: StoryAlert;
};

export type RecapScreen = {
  type: 'recap';
  title: string;
  /** `card`: the 1-based screen index, in that sub-level, of the card the point opens. */
  points: { text: string; level?: string; card?: number }[];
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

// --- docs/ui/04-question-types.md §4.1, the rest of the v2 question types ---

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
  /**
   * The order the cards are dealt in to pick from, as indices into `items`.
   * Not authored: the player deals it each run (lesson/shuffle.ts).
   */
  deal?: number[];
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

// --- docs/ui/04-question-types.md §4.2, the v3 question types ---

export type MiniChart = {
  label?: string;
  kind?: 'line' | 'candles';
  data: any[];
  levels?: ChartLevel[];
  /** Not authored: see ChartSpec.range. */
  range?: [number, number];
};

export type SwipeDeckScreen = {
  type: 'swipe-deck';
  prompt: string;
  /** docs/level-files/: `note` is the card's one-line verdict as it flies off. */
  cards: { chart: MiniChart; answer: 'take' | 'pass'; note: string }[];
  explanation: string;
};

export type ChartAnnotateScreen = {
  type: 'chart-annotate';
  prompt: string;
  chart: ChartSpec;
  answer: number;
  tolerance: number;
  /** What the placed line is called in the reveal: "Resistance", "The stop". */
  label?: string;
  explanation: string;
};

export type OrderBuildScreen = {
  type: 'order-build';
  prompt: string;
  ticker?: string;
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
  /** docs/level-files/ [DESIGN-REVIEW]: the day so far, for the row's sparkline. */
  spark?: number[];
};

export type ScannerPickScreen = {
  type: 'scanner-pick';
  prompt: string;
  /** docs/level-files/: the rows sit under `data`, like a visual's. */
  data?: { rows: ScannerRow[] };
  /** The older, flat form (the test bench). */
  rows?: ScannerRow[];
  target?: string;
  /** docs/level-files/03-question-screens.md: "or targets: [XYZ, DEF]" -- any one of them is right. */
  targets?: string[];
  explanation: string;
};

export function scannerRowsOf(screen: ScannerPickScreen): ScannerRow[] {
  return screen.data?.rows ?? screen.rows ?? [];
}

export function scannerTargetsOf(screen: ScannerPickScreen): string[] {
  return screen.targets ?? (screen.target ? [screen.target] : []);
}

export type CompareScreen = {
  type: 'compare';
  prompt: string;
  charts: MiniChart[];
  answer: string;
  allow_neither?: boolean;
  explanation: string;
};

/**
 * docs/level-files/ `branch`: a scenario, its chart, and 2-4 steps. An option's
 * `next` is the step it leads to; an option without one ends the path. Each
 * step carries its own explanation -- its reveal -- so the screen has none of
 * its own.
 */
export type BranchScreen = {
  type: 'branch';
  scenario: string;
  shares?: number;
  chart?: MiniChart & { decision_index?: number };
  steps: {
    prompt: string;
    options: { text: string; correct?: boolean; next?: number }[];
    explanation: string;
  }[];
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
  /** docs/level-files/: the book sits under `data`, best price first on each side. */
  data: { bids: [number, number][]; asks: [number, number][] };
  /** docs/level-files/ [DESIGN-REVIEW]: the market order's size, for the walk after Check. */
  shares?: number;
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
  /** docs/level-files/ [v4]: this sub-level's own short name. */
  subtitle?: string;
  chapter: number;
  chapter_title: string;
  path: string;
  category: string;
  tags: string[];
  /** The node's symbol: what the level teaches (docs/level-files/, src/home/icons.tsx). */
  icon?: string;
  learning_goal: string;
  purpose: string;
  terms_introduced?: string[];
  /**
   * docs/level-files/06-skills-bonus-lessons-market-profiles.md "Skills": the names of the skills this lesson teaches, its
   * words first, each with its entry in content/skills.yaml.
   */
  skills?: string[];
  /** A bonus side lesson (`category: bonus`): the level it follows, and the gems it pays once. */
  after?: number;
  gems?: number;
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
