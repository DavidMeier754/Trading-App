# schema.md — Level file format

Every sub-level is one YAML file: `content/<scope>/chapter-NN-<slug>/level-LL-S.yaml`
(`LL` = zero-padded level, `S` = sub). Validate with `python3 tools/validate_content.py`.

## Header

```yaml
id: "3-2"                 # "<level>-<sub>", must match the filename
title: "Market or Limit?" # shown on the path map (level title; subs share the level title)
chapter: 3
chapter_title: "Orders, Costs & Position Size"
path: scalping            # all | scalping | day-trading | swing-trading
category: new-theory      # new-theory | repetition | test | final-exam
tags: [orders, execution] # free tags, used for stats and practice
learning_goal: "User can choose between a market and a limit order for a given situation."
purpose: "One sentence on why this matters in real trading."
terms_introduced: ["Market order", "Limit order"]   # new glossary terms defined in this sub
prerequisite: "3-1"       # or null for the first sub of a chapter
xp: 20
difficulty: 1             # 1 easy, 2 medium, 3 hard
path_position: main       # main | fan-out:<strand-name> | merge   (optional, default main)
sources: [consensus]      # Chapters 1–3: [consensus]; Chapter 4+: ≥2 named sources
notes: "Author notes, optional."
screens: [...]
```

## Screens

Common: every screen has `type`. Question screens have `explanation` (one sentence shown in the reveal).
`visual`/`component` values are component ids from UI.md §6: `ownership-pie`, `quote-card`, `quote-panel`,
`chart-line`, `chart-candles`, `bar-chart`, `session-ribbon`, `cost-stack`, `order-book`, `order-ticket`.

### Non-question screens

```yaml
- type: intro
  text: "Before we trade, let's see what a trade even is."
  counter: 10                 # tests/exams only = number of question screens

- type: theory
  title: "What moves a price?"
  body: "Max ~3 lines."
  visual: chart-line          # optional
  visual_data: {...}          # optional, component-specific

- type: example
  body: "Concrete number or mini story."
  visual: cost-stack
  visual_data: {...}

- type: carousel               # counts as one screen per card
  cards:
    - {label: "Retail trader", text: "Individuals trading their own money.", icon: retail-trader}

- type: walkthrough            # counts as one screen per step
  component: quote-card
  data: {ticker: XYZ, name: Example Corp, price: 142.50, change: 2.10, change_pct: 1.5}
  steps:
    - {spotlight: price, text: "This is the current price."}

- type: visual
  component: bar-chart
  data: {...}
  caption: "One line."

- type: checklist-reveal
  title: "Before every scalp"
  items: ["Is the spread tight for the move I expect?", "..."]

- type: story
  character: retail-trader     # retail-trader | market-maker | institution | bull | bear | mascot
  text: "9:31. You're watching XYZ."

- type: summary                 # tests/exams
  total: 10

- type: badge                   # final exams
  name: "Market Basics — Complete"
  unlocks: "Chapter 2"

- type: path-choice             # once, end of Chapter 1
```

### Question screens

```yaml
- type: mc
  prompt: "…?"
  options:
    - {text: "…", correct: true}
    - {text: "…"}
    - {text: "…"}
  explanation: "…"

- type: tf
  statement: "…"
  answer: false
  explanation: "…"

- type: numeric-mc
  prompt: "…?"
  options: [{text: "$0.04", correct: true}, {text: "$0.40"}, {text: "$45.20"}]
  working: "45.24 − 45.20 = 0.04"
  explanation: "…"

- type: numeric-input
  prompt: "…?"
  answer: 0.04
  tolerance: 0.001            # optional, default 0
  unit: "$"                   # optional: "$", "%", "shares"
  working: "…"
  explanation: "…"

- type: fill-tiles
  sentence: "Buying at the ask and selling at the bid costs you the ___."
  answer: "spread"            # exactly one word, letters only
  explanation: "…"

- type: fill-choice
  sentence: "A ___ order waits for your price."
  options: ["limit", "market", "stop"]
  answer: "limit"
  explanation: "…"

- type: match
  prompt: "Match each term to its meaning."
  pairs:
    - ["Bid", "Highest price a buyer will pay right now"]
    - ["Ask", "Lowest price a seller will accept right now"]
  explanation: "…"

- type: sort
  prompt: "Sort each item."
  buckets: ["Costs you", "Doesn't cost you"]
  items:
    - {text: "Spread", bucket: "Costs you"}
  explanation: "…"

- type: order
  prompt: "Put the day in order."
  items: ["Pre-market", "Regular session", "After-hours"]   # correct order
  explanation: "…"

- type: hotspot
  component: quote-panel
  prompt: "Tap the ask."
  data: {bid: 45.20, ask: 45.24, last: 45.22}
  target: ask                 # or targets: [bid, ask]
  explanation: "…"

- type: slider
  prompt: "How much of the target does the spread eat?"
  min: 0
  max: 100
  step: 5
  unit: "%"
  answer: 40
  tolerance: 10
  explanation: "…"

- type: chart-tap
  prompt: "Tap the candle where the price was highest."
  chart: {kind: candles, data: [[o,h,l,c], ...]}
  target: 7                   # index
  explanation: "…"

- type: chart-decision
  scenario: "XYZ has been climbing all morning on strong volume…"
  shares: 100                 # position size used for the P/L strip
  chart:
    kind: line                # line (Chapter 1) | candles
    data: [10.00, 10.05, …]   # line: closes; candles: [o,h,l,c] per bar
    decision_index: 12        # bar at which the chart pauses
  state: ["Day: −2R", "Limit: 3R"]   # optional: session-state chips above the chart (UI.md 6.4)
  buttons: [buy, wait]        # Chapter 1 variant; default [long, short, no-trade]
  best: buy
  reasonable: [wait]          # optional: answers marked amber, not red
  outcome: "Price kept rising to 10.40 — +$40 on 100 shares."
  explanation: "…"

- type: spot-mistake
  prompt: "Tap the mistake."
  segments:
    - {text: "A market sell order"}
    - {text: "fills at the ask.", wrong: true}
  explanation: "…"
```

## Components, data and hotspot targets

Use only these component ids and target ids (UI.md §6 defines how they look).

| Component | `data` / `visual_data` fields | Hotspot / spotlight targets |
|---|---|---|
| `quote-card` | `ticker`, `name`, `price`, `change`, `change_pct`, `volume` (string like "3.2M"), `prev_close` | `ticker`, `name`, `price`, `change`, `volume`, `prev_close` |
| `quote-panel` | `bid`, `ask`, `last`; optional `animate_to: {bid, ask}` | `bid`, `ask`, `last`, `spread` |
| `order-ticket` | `ticker`, `side` (buy/sell), `qty`, `type` (market/limit/stop/stop-limit), `price`, `stop_price` | `side`, `qty`, `type`, `price`, `stop_price`, `submit` |
| `order-book` | `bids: [[price, size], …]`, `asks: [[price, size], …]` (best first) | `best`, `depth`, `size`, `bid-1`…`bid-3`, `ask-1`…`ask-3` |
| `chart-line` | `data: [close, …]` or `series: [{label, data}]`; optional `markers: [{index, label}]`, `levels: [{price, label}]` | (use `chart-tap` with a bar index) |
| `chart-candles` | `data: [[open, high, low, close], …]`; optional `volume: [n, …]`, `levels`, `markers`, `vwap: [v, …]` | (use `chart-tap` with a bar index) |
| `bar-chart` | `bars: [{label, value}]`, optional `unit` | — |
| `session-ribbon` | `premarket`, `regular`, `afterhours`, `timezone` (tokens) | — |
| `cost-stack` | `shares`, `spread`, `slippage`, `fees`, `target` (per share) or `rows: [{label, value}]`, `targets: [{label, value}]` | — |
| `ownership-pie` | `total`, `owned` | — |

`state` holds 1–3 short strings; use it whenever the right answer depends on where the trader stands (day result in R, the limit, the trade count, the current size) rather than on the chart alone.

Chart conventions: 8–12 bars; `decision_index` between 4 and 7; prices with two decimals; candle `high` ≥ max(open, close) and `low` ≤ min(open, close); outcome visible in the bars after the decision. Chapter 1 uses `chart-line`; path chapters use `chart-candles`.

## Validator rules (tools/validate_content.py)

Errors (must fix):
- Required header fields present; `id` matches filename; `category`, `path`, `type` values valid.
- 12–18 screens per lesson (carousel cards and walkthrough steps count individually); tests/exams 10–16.
- First screen is `intro`; tests/exams end with `summary` (+ `badge` for final exams); `intro.counter` = `summary.total` = number of question screens.
- ≥3 distinct question types (lessons); no more than 2 `mc`/`numeric-mc` in a row.
- `mc`/`numeric-mc`: 2–4 options, exactly one `correct`, unique texts. `tf.answer` boolean. `fill-tiles.answer` one word. `match`: 2–5 pairs, unique left and right. `sort`: every item's bucket exists. `chart-decision.best` in its buttons.
- Every question screen has an `explanation`.
- `prerequisite` exists in the same chapter.

Warnings (review):
- Estimated time outside 160–260 s (theory-type 10 s, carousel/walkthrough 10 s per card/step, question 15 s, match/sort/order 18 s, chart-decision 20 s, summary/badge 10 s).
- A glossary term used in a question before the sub-level that introduces it. Known terms = Chapter 1 terms plus terms from lower-numbered chapters of the same path; anything else must be introduced in the chapter before use.
- A term re-introduced that a lower chapter already introduced.
- Folder chapter number differs from the `chapter` field.
- Identical prompt text in two different files of the same chapter.
- Level without a visual/interactive screen in Chapter ≥2.
