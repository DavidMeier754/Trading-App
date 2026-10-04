# Components and data

_Part of the [level file format](README.md)_

## Components, data and hotspot targets

Use only these component ids and target ids (docs/ui/08-quotes-and-charts.md §6 defines how they look).

| Component | `data` / `visual_data` fields | Hotspot / spotlight targets |
|---|---|---|
| `quote-card` | `ticker`, `name`, `price`, `change`, `change_pct`, `volume` (string like "3.2M"), `prev_close` | `ticker`, `name`, `price`, `change`, `volume`, `prev_close` |
| `quote-panel` | `bid`, `ask`, `last`; optional `animate_to: {bid, ask}` | `bid`, `ask`, `last`, `spread` |
| `order-ticket` | `ticker`, `side` (buy/sell), `qty`, `type` (market/limit/stop/stop-limit), `price`, `stop_price` | `side`, `qty`, `type`, `price`, `stop_price`, `submit` |
| `order-book` | `bids: [[price, size], …]`, `asks: [[price, size], …]` (best first) | `best`, `depth`, `size`, `bid-1`…`bid-3`, `ask-1`…`ask-3` |
| `chart-line` | `data: [close, …]` or `series: [{label, data}]`; optional `markers`, `levels` | (use `chart-tap` with a bar index) |
| `chart-candles` | `data: [[open, high, low, close], …]`; optional `volume: [n, …]`, `levels`, `markers`, `vwap: [v, …]` | (use `chart-tap` with a bar index) |
| `candle-anatomy` **[v4]** | `candle: [open, high, low, close]`; optional `labels: [open, high, low, close, body, upper-wick, lower-wick]` (default all) | a label name |
| `trade-plan` **[v4]** | `entry`, `stop`, `target`, `shares`; optional `chart: [[o,h,l,c], …]` drawn behind the lines | `entry`, `stop`, `target` |
| `bar-chart` | `bars: [{label, value}]`, optional `unit` | — |
| `session-ribbon` | `premarket`, `regular`, `afterhours`, `timezone` (tokens) | — |
| `cost-stack` | one of three shapes: per share, `shares`, `target` and at least one of `spread`, `slippage`, `fees`; one cost against several moves, `targets: [{label, value}]` with at least one of `spread`, `slippage`, `fees`; or cost totals side by side, `rows: [{label, value}]`, optional `unit` ("$ per day") | — |
| `ownership-pie` | `total`, `owned` | — |
| `scanner-table` **[v3]** | `rows: [{ticker, price, change_pct, rvol, float, spread, catalyst}]`; **[DESIGN-REVIEW]** optional `spark: [price, …]` per row (5–30 prices, the day so far) | a `ticker` value |
| `journal-table` **[v3]** | `columns: [...]`, `rows: [{...}]`; a column keyed `""` is a row label | a column key |
| `internals-panel` **[v3]** | `index: {label, data}`, `breadth`, `sectors: [{label, value}]`, `tone` (risk-on/risk-off) | `index`, `breadth`, `sectors`, `tone` |
| `hotkey-pad` **[v3]** | `keys: [{label, action}]`, optional `sequence: [...]` | a key `label` |
| `stats-card` **[v3]** | `rows: [{label, value}]` | a row `label` |
| `r-tracker` **[v3]** | `trades: [r, …]`, `limit` | — |
| `plan-sheet` **[v3]** | `fields: [{key, label, value?}]`, optional `slot`; keys come from "The plan" below. A field with `value` is a specimen line; without it the renderer fills it from the learner's own plan | a field `key` |
| `decision-grid` **[DESIGN-REVIEW]** | optional `cell`: `right-won`, `right-lost`, `wrong-won` or `wrong-lost` — the cell that gets the dot; without it the four cells are shown, labelled | a cell name |

`state` holds 1–3 short strings; use it whenever the right answer depends on where the trader stands (day result in R, the limit, the trade count, the current size) rather than on the chart alone.

**[v4] Two shapes that went wrong in the render test (2026-09-25).** `levels` is always a list of objects, `[{price: 24.40, label: "High of day"}]` — never bare numbers, which rendered as missing lines on 15 screens. A `depth-ladder`'s book sits under `data:` exactly as the example above shows; the renderer read it from the top level and all 40 screens crashed. Stage STABLE-DATA fixed both, and the validator now checks every component's data against this table (see "Validator rules").

**[DESIGN-REVIEW] The open on a chart.** Any chart spec (`chart` on `chart-decision`, `chart-tap`, `chart-annotate`, `branch`, and `chart-candles` data) may carry `session_open: <bar>` — the 0-based index of the first bar of the regular session, at least 1 and below the bar count. The bars before it are shaded as pre-market and a dashed line with a bell marks the open (docs/ui/08-quotes-and-charts.md §6.4). Only where the open matters (`docs/content-todo/02-new-fields.md` 2.3).

Chart conventions: 8–12 bars; `decision_index` between 4 and 7; prices with two decimals; candle `high` ≥ max(open, close) and `low` ≤ min(open, close); outcome visible in the bars after the decision. Chapter 1 uses `chart-line`; path chapters use `chart-candles`. **[v3]** `swipe-deck` and `compare` mini-charts may use 8–10 bars and omit volume.
