# schema.md — Level file format

Every sub-level is one YAML file: `content/<scope>/chapter-NN-<slug>/level-LL-S.yaml`
(`LL` = zero-padded level, `S` = sub). Validate with `python3 tools/validate_content.py`.

Status: **v3** — fields, screen types and validator rules for the eight-chapter curriculum. New items are marked **[v3]**. Everything unmarked is unchanged from v2 and existing content stays valid.

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
reinforces: [1, 2]        # [v3] earlier chapters this sub deliberately re-tests; [] for pure new theory
prerequisite: "3-1"       # or null for the first sub of a chapter
xp: 20
difficulty: 1             # 1 easy, 2 medium, 3 hard
path_position: main       # main | fan-out:<strand-name> | merge   (optional, default main)
sources: [consensus]      # Chapters 1–3: [consensus]; Chapter 4+: ≥2 named sources
notes: "Author notes, optional."
screens: [...]
```

**`reinforces` [v3].** A list of chapter numbers (not level ids). It is a claim that this sub-level re-tests that chapter's material *in this chapter's context*. The validator uses it for the reinforcement quotas in `docs/agent.md` §3.3, so do not declare it decoratively — a sub with `reinforces: [1]` must contain at least one question that genuinely needs Chapter 1 knowledge.

## Screens

Common: every screen has `type`. Question screens have `explanation` (one sentence shown in the reveal).
`visual`/`component` values are component ids from UI.md §6: `ownership-pie`, `quote-card`, `quote-panel`,
`chart-line`, `chart-candles`, `bar-chart`, `session-ribbon`, `cost-stack`, `order-book`, `order-ticket`,
and **[v3]** `scanner-table`, `journal-table`, `internals-panel`, `hotkey-pad`, `stats-card`, `r-tracker`, `plan-sheet`.

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

- type: recap                  # [v3] end-of-level takeaways
  title: "Level 4 in three lines"
  points:
    - {text: "Volume confirms a move; thin bars are drift.", level: "4-1"}
    - {text: "Climax volume marks the end of a run more often than the start.", level: "4-2"}

- type: plan-card              # [v3] the user writes and keeps this
  title: "Your session limits"
  intro: "Write the two numbers you will trade by."
  fields:
    - {key: daily_loss_limit, label: "Daily loss limit (in R)", kind: number, suggest: 3}
    - {key: trade_cap, label: "Maximum trades a day", kind: number, suggest: 6}
  note: "You can change these later in your plan."

- type: summary                 # tests/exams
  total: 10

- type: badge                   # final exams
  name: "Market Basics — Complete"
  unlocks: "Chapter 2"

- type: tier-up                 # [v3] at tier boundaries (UI.md 7.5)
  tier: "Observer"
  means: "You can read a chart."

- type: path-choice             # once, end of Chapter 1
```

### Question screens (v2, unchanged)

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
  prompt: "Four numbers on every quote panel. Which is which?"   # must be content-specific
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
  reasonable: [wait]          # answers marked amber, not red
  outcome: "Price kept rising to 10.40 — +$40 on 100 shares."
  explanation: "…"

- type: spot-mistake
  prompt: "Tap the mistake."
  segments:
    - {text: "A market sell order"}
    - {text: "fills at the ask.", wrong: true}
  explanation: "…"
```

### New question screens **[v3]**

```yaml
- type: swipe-deck            # counts as one screen per card; never timed
  prompt: "Your card is the VWAP bounce. Take it or pass?"
  cards:
    - chart: {kind: candles, data: [[o,h,l,c], …], vwap: [...], levels: [...]}
      answer: take            # take | pass
      note: "Above the line all session, first touch, heavy reclaim."
    - chart: {kind: candles, data: [[o,h,l,c], …], vwap: [...]}
      answer: pass
      note: "Under VWAP since the open — that is the mirror image, not this card."
  explanation: "…"            # shown on the run summary at the end

- type: chart-annotate
  prompt: "Drag the line to the level that stopped the last two pushes."
  chart: {kind: candles, data: [[o,h,l,c], …]}
  answer: 26.40               # price the line should land on
  tolerance: 0.04             # cents of slack
  label: "Resistance"         # what the placed line is called in the reveal
  explanation: "…"

- type: order-build
  prompt: "Build the entry for a 1,500-share long, capped three cents over the ask of $18.20."
  ticker: XYZ
  slots: [side, type, qty, price]        # which parts the learner fills
  chips:                                  # offered options per slot
    side: [buy, sell]
    type: [market, limit, stop]
    qty: [500, 1000, 1500]
    price: [18.17, 18.20, 18.23]
  answer: {side: buy, type: limit, qty: 1500, price: 18.23}
  explanation: "…"

- type: scanner-pick
  prompt: "Which name is worth watching at the open?"
  data:
    rows:
      - {ticker: XYZ, price: 18.40, change_pct: 6.2, rvol: 4.8, float: "12M", spread: 0.02, catalyst: "Earnings"}
      - {ticker: ABC, price: 240.10, change_pct: 0.3, rvol: 0.9, float: "800M", spread: 0.12, catalyst: "—"}
  target: XYZ                 # or targets: [XYZ, DEF]
  explanation: "…"

- type: compare
  prompt: "Which chart is the momentum continuation?"
  charts:
    - {kind: candles, data: [[o,h,l,c], …], label: "A"}
    - {kind: candles, data: [[o,h,l,c], …], label: "B"}
  answer: "A"                 # or "neither"
  allow_neither: true         # optional
  explanation: "…"

- type: branch                # counts as one screen per step
  scenario: "You are long 1,500 shares from $18.16 with the stop at $18.02."
  shares: 1500
  chart: {kind: candles, data: [[o,h,l,c], …], decision_index: 5}
  steps:
    - prompt: "Price stalls two cents under your target. What now?"
      options:
        - {text: "Hold — the target is on the card", correct: true, next: 1}
        - {text: "Move the target closer", next: 1}
      explanation: "…"
    - prompt: "It reverses to your entry. What now?"
      options:
        - {text: "Let the stop do its job", correct: true}
        - {text: "Widen the stop for room"}
      explanation: "…"

- type: journal-row
  prompt: "Fill the row for the trade you just took."
  trade: {setup: "VWAP bounce", entry: 18.16, stop: 18.02, exit: 18.44, shares: 1500}
  slots: [r_risked, r_made, grade]
  chips:
    r_risked: ["$140", "$210", "$420"]
    r_made: ["+1R", "+2R", "+3R"]
    grade: ["A", "B", "C"]
  answer: {r_risked: "$210", r_made: "+2R", grade: "A"}
  explanation: "…"

- type: depth-ladder
  prompt: "You market-buy 1,000 shares. Where does the last share fill?"
  data:
    bids: [[20.00, 1200], [19.99, 800], [19.98, 3000]]
    asks: [[20.02, 500], [20.03, 2200], [20.04, 900]]
  target: ask-2               # ask-1…ask-3 | bid-1…bid-3
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
| `chart-line` | `data: [close, …]` or `series: [{label, data}]`; optional `markers`, `levels` | (use `chart-tap` with a bar index) |
| `chart-candles` | `data: [[open, high, low, close], …]`; optional `volume: [n, …]`, `levels`, `markers`, `vwap: [v, …]` | (use `chart-tap` with a bar index) |
| `bar-chart` | `bars: [{label, value}]`, optional `unit` | — |
| `session-ribbon` | `premarket`, `regular`, `afterhours`, `timezone` (tokens) | — |
| `cost-stack` | `shares`, `spread`, `slippage`, `fees`, `target` (per share) or `rows`, `targets` | — |
| `ownership-pie` | `total`, `owned` | — |
| `scanner-table` **[v3]** | `rows: [{ticker, price, change_pct, rvol, float, spread, catalyst}]` | a `ticker` value |
| `journal-table` **[v3]** | `columns: [...]`, `rows: [{...}]` | a column key |
| `internals-panel` **[v3]** | `index: {label, data}`, `breadth`, `sectors: [{label, value}]`, `tone` (risk-on/risk-off) | `index`, `breadth`, `sectors`, `tone` |
| `hotkey-pad` **[v3]** | `keys: [{label, action}]`, optional `sequence: [...]` | a key `label` |
| `stats-card` **[v3]** | `rows: [{label, value}]` | a row `label` |
| `r-tracker` **[v3]** | `trades: [r, …]`, `limit` | — |
| `plan-sheet` **[v3]** | `fields: [{key, label, value}]` | a field `key` |

`state` holds 1–3 short strings; use it whenever the right answer depends on where the trader stands (day result in R, the limit, the trade count, the current size) rather than on the chart alone.

Chart conventions: 8–12 bars; `decision_index` between 4 and 7; prices with two decimals; candle `high` ≥ max(open, close) and `low` ≤ min(open, close); outcome visible in the bars after the decision. Chapter 1 uses `chart-line`; path chapters use `chart-candles`. **[v3]** `swipe-deck` and `compare` mini-charts may use 8–10 bars and omit volume.

## Drill packs **[v3]**

The Practice hub is fed by drill packs, not by lesson files: `content/drills/<path>/<slug>.yaml`.
A pack is a flat bank of scored screens with no lesson structure — no intro, no theory, no ordering.

```yaml
id: "scalping-vwap-bounce"
path: scalping
title: "VWAP bounce drills"
unlocked_by: "7-2"            # the sub-level that must be completed first
tags: [vwap, setup-a]
concepts: ["VWAP bounce", "Reclaim", "First touch"]   # what wrong answers mark weak
screens:                      # any question type; chart-decision / swipe-deck / compare preferred
  - type: chart-decision
    ...
```

Rules: every screen is a question screen; 10–40 screens per pack; `unlocked_by` must name an existing sub-level; packs never cost hearts and are never timed. Packs are drawn from by the daily mix and by setup drills, weighted by the learner's weak concepts.

## Validator rules (tools/validate_content.py)

Errors (must fix):
- Required header fields present; `id` matches filename; `category`, `path`, `type` values valid.
- 12–18 screens per lesson (carousel cards, walkthrough steps, **[v3]** swipe-deck cards and branch steps count individually); tests 10–16; **[v3]** final exams 12–18.
- First screen is `intro`; tests/exams end with `summary` (+ `badge` for final exams); `intro.counter` = `summary.total` = number of question screens.
- ≥3 distinct question types (lessons); no more than 2 `mc`/`numeric-mc` in a row.
- `mc`/`numeric-mc`: 2–4 options, exactly one `correct`, unique texts. `tf.answer` boolean. `fill-tiles.answer` one word. `match`: 2–5 pairs, unique left and right. `sort`: every item's bucket exists. `chart-decision.best` in its buttons.
- Every question screen has an `explanation`.
- `prerequisite` exists in the same chapter.
- **[v3]** `reinforces` is a list of integers, each lower than this file's `chapter`.
- **[v3]** On any `chart-decision` with `best` of `long` or `short`, `reasonable` contains `no-trade`.
- **[v3]** New types validate their own shape: `swipe-deck` 4–8 cards each with `answer` in {take, pass}; `chart-annotate` numeric `answer` + `tolerance`; `order-build` `answer` keys match `slots` and every answer value appears in `chips`; `scanner-pick` `target` is a `ticker` present in `rows`; `compare` `answer` is a chart `label` or "neither" when `allow_neither`; `branch` 2–4 steps, each with exactly one `correct`; `journal-row` `answer` keys match `slots`; `depth-ladder` `target` exists in the book.

Warnings (review):
- Estimated time outside 160–260 s (theory-type 10 s, carousel/walkthrough 10 s per card/step, question 15 s, match/sort/order 18 s, chart-decision 20 s, **[v3]** swipe-deck 8 s per card, branch 18 s per step, chart-annotate/order-build/scanner-pick/compare/journal-row/depth-ladder 15 s, recap 10 s, plan-card 20 s).
- A glossary term used in a question before the sub-level that introduces it. Known terms = Chapter 1 terms plus terms from lower-numbered chapters of the same path.
- A term re-introduced that a lower chapter already introduced.
- Folder chapter number differs from the `chapter` field.
- Identical prompt text in two different files of the same chapter.
- Level without a visual/interactive screen in Chapter ≥2.
- More than 2 review-type sub-levels in a row.

Chapter-level warnings **[v3]** (computed across a whole chapter folder):
- Fewer than 15 levels.
- Fewer than 60 % of levels with ≥3 subs, or fewer than four levels with 4 subs.
- Fewer than 10 distinct question types used, or any type used fewer than twice.
- No Callback level, or fewer than 15 % of question screens in subs declaring `reinforces`.
- A Test with under 20 %, or a Final Exam with under 25 %, of questions in a `reinforces` sub.
- Correct-option position distribution skewed (any position holding >50 % of `mc`/`numeric-mc` answers).
- `tf` answers outside a 40–60 % true split.
- Correct option is the longest in more than 45 % of `mc`/`numeric-mc` screens.
- More than 70 % of sub-levels ending on a `theory` screen.
- Any single per-share outcome value used in more than 25 % of `chart-decision` outcomes.
- More than five consecutive sub-levels at the same `difficulty`.
- A `chart-decision` whose `shares` × decision price exceeds the account named in the same file.
- 1-minute chart volume outside 4,000–500,000 per bar (path chapters).
