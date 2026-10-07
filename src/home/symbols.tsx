/**
 * [LOOK-COMPONENTS] The mapping table: every icon name the content may use
 * beyond the ones drawn by hand in icons.tsx, and the symbol it stands for.
 * A carousel card's `icon` and a level's `icon` (docs/level-files/01-header.md) are looked up here;
 * tools/validate_content.py reads the three lists (ICON_NAMES in icons.tsx,
 * ALIASES and SYMBOLS below) and rejects any other name.
 *
 * The symbols come from Lucide (lucide-react-native, ISC licence): drawn on
 * the same 24-point grid with round 2-point strokes as the app's own icons,
 * so the two sit side by side. Each is imported on its own, so only these
 * end up in the app. One entry a line: the validator reads the names.
 */
import type { LucideIcon } from 'lucide-react-native';
import Activity from 'lucide-react-native/icons/activity';
import ArrowBigUpDash from 'lucide-react-native/icons/arrow-big-up-dash';
import ArrowDownFromLine from 'lucide-react-native/icons/arrow-down-from-line';
import ArrowDownToLine from 'lucide-react-native/icons/arrow-down-to-line';
import ArrowRightLeft from 'lucide-react-native/icons/arrow-right-left';
import ArrowRightToLine from 'lucide-react-native/icons/arrow-right-to-line';
import ArrowUpFromLine from 'lucide-react-native/icons/arrow-up-from-line';
import ArrowUpToLine from 'lucide-react-native/icons/arrow-up-to-line';
import Ban from 'lucide-react-native/icons/ban';
import Calculator from 'lucide-react-native/icons/calculator';
import CalendarCheck from 'lucide-react-native/icons/calendar-check';
import CalendarRange from 'lucide-react-native/icons/calendar-range';
import ChartCandlestick from 'lucide-react-native/icons/chart-candlestick';
import ChartColumn from 'lucide-react-native/icons/chart-column';
import ChartColumnIncreasing from 'lucide-react-native/icons/chart-column-increasing';
import ChartGantt from 'lucide-react-native/icons/chart-gantt';
import ChartLine from 'lucide-react-native/icons/chart-line';
import ChartNoAxesColumn from 'lucide-react-native/icons/chart-no-axes-column';
import ChartPie from 'lucide-react-native/icons/chart-pie';
import ChartSpline from 'lucide-react-native/icons/chart-spline';
import ChevronsUp from 'lucide-react-native/icons/chevrons-up';
import Coins from 'lucide-react-native/icons/coins';
import Compass from 'lucide-react-native/icons/compass';
import Crosshair from 'lucide-react-native/icons/crosshair';
import Dices from 'lucide-react-native/icons/dices';
import DropletOff from 'lucide-react-native/icons/droplet-off';
import Eye from 'lucide-react-native/icons/eye';
import FastForward from 'lucide-react-native/icons/fast-forward';
import FileChartColumnIncreasing from 'lucide-react-native/icons/file-chart-column-increasing';
import FileText from 'lucide-react-native/icons/file-text';
import Funnel from 'lucide-react-native/icons/funnel';
import GitCommitHorizontal from 'lucide-react-native/icons/git-commit-horizontal';
import GitMerge from 'lucide-react-native/icons/git-merge';
import Keyboard from 'lucide-react-native/icons/keyboard';
import Layers from 'lucide-react-native/icons/layers';
import ListChecks from 'lucide-react-native/icons/list-checks';
import Magnet from 'lucide-react-native/icons/magnet';
import MapIcon from 'lucide-react-native/icons/map';
import Minus from 'lucide-react-native/icons/minus';
import Mountain from 'lucide-react-native/icons/mountain';
import MouseClick from 'lucide-react-native/icons/mouse-pointer-click';
import MoveHorizontal from 'lucide-react-native/icons/move-horizontal';
import MoveVertical from 'lucide-react-native/icons/move-vertical';
import NotebookPen from 'lucide-react-native/icons/notebook-pen';
import NotebookTabs from 'lucide-react-native/icons/notebook-tabs';
import OctagonAlert from 'lucide-react-native/icons/octagon-alert';
import OctagonPause from 'lucide-react-native/icons/octagon-pause';
import PlaneTakeoff from 'lucide-react-native/icons/plane-takeoff';
import Radar from 'lucide-react-native/icons/radar';
import Receipt from 'lucide-react-native/icons/receipt';
import Redo2 from 'lucide-react-native/icons/redo-2';
import Rocket from 'lucide-react-native/icons/rocket';
import Ruler from 'lucide-react-native/icons/ruler';
import ScrollText from 'lucide-react-native/icons/scroll-text';
import SearchCheck from 'lucide-react-native/icons/search-check';
import SeparatorHorizontal from 'lucide-react-native/icons/separator-horizontal';
import ShieldAlert from 'lucide-react-native/icons/shield-alert';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import Shuffle from 'lucide-react-native/icons/shuffle';
import SignalHigh from 'lucide-react-native/icons/signal-high';
import SignalLow from 'lucide-react-native/icons/signal-low';
import SignalMedium from 'lucide-react-native/icons/signal-medium';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
import Split from 'lucide-react-native/icons/split';
import SquareDashed from 'lucide-react-native/icons/square-dashed';
import SquareSplitHorizontal from 'lucide-react-native/icons/square-split-horizontal';
import SquareStack from 'lucide-react-native/icons/square-stack';
import Sigma from 'lucide-react-native/icons/sigma';
import Sun from 'lucide-react-native/icons/sun';
import Sunrise from 'lucide-react-native/icons/sunrise';
import Sunset from 'lucide-react-native/icons/sunset';
import Tag from 'lucide-react-native/icons/tag';
import Thermometer from 'lucide-react-native/icons/thermometer';
import Timer from 'lucide-react-native/icons/timer';
import Tornado from 'lucide-react-native/icons/tornado';
import TrendingDown from 'lucide-react-native/icons/trending-down';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import TrendingUpDown from 'lucide-react-native/icons/trending-up-down';
import Umbrella from 'lucide-react-native/icons/umbrella';
import Undo2 from 'lucide-react-native/icons/undo-2';
import UserRound from 'lucide-react-native/icons/user-round';

/**
 * Names the content uses for a symbol the app already draws by hand
 * (icons.tsx): the name on the left is drawn as the one on the right.
 */
export const ALIASES = {
  institution: 'bank',
  'market-wide': 'globe',
  'style-scalp': 'bolt',
  'style-day': 'clock',
  'style-swing': 'calendar',
  'level-break': 'breakout',
  'opening-range': 'bell',
  sim: 'flask',
  'full-day': 'clock',
} as const;

/** Names drawn by a Lucide symbol. */
export const SYMBOLS = {
  // Who is in the market.
  'retail-trader': UserRound,
  'market-maker': ArrowRightLeft,
  bull: TrendingUp,
  bear: TrendingDown,
  // Quotes, costs and orders.
  'quote-panel': SquareSplitHorizontal,
  spread: MoveHorizontal,
  'cost-spread': Coins,
  fee: Receipt,
  judge: SearchCheck,
  limit: Tag,
  stop: OctagonAlert,
  size: Calculator,
  slippage: Timer,
  depth: Layers,
  checklist: ListChecks,
  rules: ListChecks,
  paper: FileText,
  illiquid: DropletOff,
  halt: OctagonPause,
  // Charts and what is on them.
  'chart-line': ChartLine,
  'chart-candles': ChartCandlestick,
  'chart-empty': SquareDashed,
  'bar-chart': ChartColumn,
  'volume-bar': ChartNoAxesColumn,
  rvol: ChartColumnIncreasing,
  volatility: Activity,
  flat: Minus,
  gap: ArrowBigUpDash,
  vwap: ChartSpline,
  'vwap-side': ChartSpline,
  'vwap-trade': GitCommitHorizontal,
  'tape-prints': ScrollText,
  confluence: GitMerge,
  'in-action': Crosshair,
  'opening-drive': Rocket,
  map: MapIcon,
  'scalper-map': Compass,
  'two-frames': SquareStack,
  // Levels.
  'level-line': SeparatorHorizontal,
  'level-high': ArrowUpToLine,
  'level-low': ArrowDownToLine,
  'level-close': ArrowRightToLine,
  'level-bounce': ArrowUpFromLine,
  'level-reject': ArrowDownFromLine,
  'level-hold': ShieldCheck,
  'level-first': SignalLow,
  'level-second': SignalMedium,
  'level-third': SignalHigh,
  // The session.
  'session-pre': Sunrise,
  'session-regular': Sun,
  'session-after': Sunset,
  'session-ribbon': ChartGantt,
  // Finding the trade.
  earnings: FileChartColumnIncreasing,
  scanner: Radar,
  selection: Funnel,
  watchlist: Eye,
  float: ChartPie,
  internals: Thermometer,
  'day-type': TrendingUpDown,
  // Risk and the trader.
  'r-unit': Ruler,
  manage: SlidersHorizontal,
  expectancy: Sigma,
  'session-limit': ShieldAlert,
  tilt: Tornado,
  probability: Dices,
  journal: NotebookPen,
  weekly: CalendarCheck,
  'losing-morning': Umbrella,
  // The playbook.
  playbook: NotebookTabs,
  momentum: FastForward,
  'mean-reversion': Magnet,
  fade: Undo2,
  'range-rotation': MoveVertical,
  're-entry': Redo2,
  mixed: Shuffle,
  'choose-setup': Split,
  'nothing-fits': Ban,
  capstone: Mountain,
  // The trading day.
  hotkeys: Keyboard,
  drill: MouseClick,
  numbers: ChartLine,
  'size-up': ChevronsUp,
  'go-live': PlaneTakeoff,
  week: CalendarRange,
} satisfies Record<string, LucideIcon>;

export type AliasName = keyof typeof ALIASES;
export type SymbolName = keyof typeof SYMBOLS;
