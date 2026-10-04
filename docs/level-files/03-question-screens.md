# Question screens

_Part of the [level file format](README.md)_

### Question screens (v2, unchanged)

```yaml
- type: mc
  prompt: "…?"
  options:
    - {text: "…", correct: true}
    - {text: "…", why: "One line on why this exact choice is wrong."}   # [v4] optional, shown if picked
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
  sign: exact                 # [v4] optional: exact (default) | any — any accepts ±answer (docs/rules/07-variance-and-typed-numbers.md §3.12)
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
  state: ["Day: −2R", "Limit: 3R"]   # optional: session-state chips above the chart (docs/ui/08-quotes-and-charts.md 6.4)
  buttons: [buy, wait]        # Chapter 1 variant; default [long, short, no-trade]
  best: buy
  reasonable: [wait]          # answers marked amber, not red
  stop: 9.90                  # [v4] optional; required from Chapter 3 on when best is long/short
  target: 10.40               # [v4] optional, as stop; playback ends at the first one the bars touch
  outcome: "Price kept rising to 10.40 — +$40 on 100 shares."
  explanation: "…"
  notes:                      # [DESIGN-REVIEW] optional, 1–4: shown on the chart after the reveal (docs/ui/08-quotes-and-charts.md §6.4)
    - {bar: 9, text: "Higher low"}        # bar: 0-based index into chart.data; text at most 24 characters
    - {bar: 12, text: "Breaks the high", at: high}   # at: high (default) | low — the end of the bar the leader meets
  # [DESIGN-REVIEW] stop and target are drawn after the choice, with the entry; the R ruler joins them
  # from the lesson that introduces the term "R" on (docs/ui/08-quotes-and-charts.md §6.4). A stop sits below the entry for a long
  # and above it for a short, the target on the other side.
  # [v4] The outcome sentence must agree with the bars (and with stop/target when present): a
  # loss reads as a loss. How often a correct decision loses is a chapter-level rule (docs/rules/07-variance-and-typed-numbers.md §3.11).

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
  chart: {kind: candles, data: [[o,h,l,c], …], decision_index: 5}   # optional levels: [{price, label}] -- a stop, drawn and labelled
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
  shares: 1000                # [DESIGN-REVIEW] optional: the market order's size; it must fill to the target
  explanation: "…"
```
**[DESIGN-REVIEW]** After Check the order is walked through the book (docs/ui/04-question-types.md §4.2). The app needs its size for that: `shares` when the file gives it, otherwise the first "N shares" / "N-share" in the English prompt — a stopgap that breaks once prompts are translated, so every ladder gets `shares` (`docs/content-todo/`). The validator checks that it ends on the target.
