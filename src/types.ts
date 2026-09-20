// Types for the subset of docs/schema.md this player renders.
// Ten screen types plus the header fields the shell needs.

export type ScreenType =
  | 'intro'
  | 'theory'
  | 'example'
  | 'mc'
  | 'tf'
  | 'fill-tiles'
  | 'match'
  | 'numeric-input'
  | 'numeric-mc'
  | 'chart-decision';

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
  | ChartDecisionScreen;

export type QuestionScreen =
  | McScreen
  | NumericMcScreen
  | TfScreen
  | NumericInputScreen
  | FillTilesScreen
  | MatchScreen
  | ChartDecisionScreen;

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
  'fill-tiles',
  'match',
  'numeric-input',
  'numeric-mc',
  'chart-decision',
];

export function isQuestion(screen: Screen): screen is QuestionScreen {
  return QUESTION_TYPES.includes(screen.type);
}
