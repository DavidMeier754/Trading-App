# Non-question screens

_Part of the [level file format](README.md)_

## Screens

Common: every screen has `type`. Question screens have `explanation` (one sentence shown in the reveal).
`visual`/`component` values are component ids from docs/ui/08-quotes-and-charts.md §6: `ownership-pie`, `quote-card`, `quote-panel`,
`chart-line`, `chart-candles`, `bar-chart`, `session-ribbon`, `cost-stack`, `order-book`, `order-ticket`,
**[v3]** `scanner-table`, `journal-table`, `internals-panel`, `hotkey-pad`, `stats-card`, `r-tracker`, `plan-sheet`,
and **[v4]** `candle-anatomy`, `trade-plan` (built in stage VISUALS).

### Non-question screens

```yaml
- type: intro
  text: "Before we trade, let's see what a trade even is."
  counter: 10                 # tests/exams only = number of question screens
  facts: ["Account $22,000", "Risk 1 % a trade"]   # [DESIGN-REVIEW] optional, tests/exams only: 1–3 chips
                              # of at most 20 characters on the briefing card (docs/ui/03-screen-types.md §3 intro)

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
  # `icon` is a free-form hint at what the card is about, for whoever draws it.
  # It is not a character reference — there is no character cast (docs/ui/09-order-tools-and-other-visuals.md §6.9).

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

- type: story                  # no `character`: there is no character cast (docs/ui/09-order-tools-and-other-visuals.md §6.9)
  text: "9:31. You're watching XYZ."
  label: scene                 # [v4] optional: scene (default) | takeaway — a closing summary is a takeaway
  alert:                       # [DESIGN-REVIEW] optional, scenes only: the scene as a market alert (docs/ui/03-screen-types.md §3 story)
    ticker: XYZ                # 1–5 capital letters
    time: "1 min after the open"   # at most 24 characters; no literal clock time (docs/rules/04-numbers-and-realism.md §3.6), tokens allowed
    facts: ["Gap +6.2 %", "RVOL 4.8×"]   # optional, 1–3 chips of at most 16 characters
    spark: [17.40, 17.62, 17.55, 17.90, 18.10]   # optional, 5–30 prices: the move so far

- type: recap                  # [v3] end-of-level takeaways
  title: "Level 4 in three lines"
  points:
    - {text: "Volume confirms a move; thin bars are drift.", level: "4-1", card: 3}
    - {text: "Climax volume marks the end of a run more often than the start.", level: "4-2", card: 5}
  # [v4] card: the 1-based screen index, in that sub-level, of the theory/example card the point
  # opens. Without it the app has to guess, and until 2026-09-25 it always opened the first card.

# - type: variance-sim         # [v4] dropped [DESIGN-REVIEW], never built: a fixed win rate on a screen
#                               reads as a fact about the market (docs/rules/07-variance-and-typed-numbers.md §3.11). Lesson 1·2-4 uses the
#                               `decision-grid` visual instead (Components, below).

- type: plan-card              # [v3] the user writes and keeps this
  title: "Your session limits"
  intro: "Write the two numbers you will trade by."
  slot: a                     # optional: this card fills one playbook row (see "The plan")
  fields:
    - {key: session_daily_loss_limit, label: "Daily loss limit (in R)", kind: number, suggest: 3}
    - {key: session_trade_cap, label: "Maximum trades a day", kind: number, suggest: 6, min: 1, max: 20}
    # [v4] a number may carry min/max; kind: choice takes options, e.g.
    # {key: setup_style, label: "Your style", kind: choice, options: ["Scalping", "Day trading", "Swing trading"]}
  note: "You can change these later in your plan."
  # keys come from the one namespace in "The plan" below; never invent one

- type: summary                 # tests/exams
  total: 10

- type: badge                   # final exams
  name: "Market Basics — Complete"
  unlocks: "Chapter 2"

- type: tier-up                 # [v3] at tier boundaries (docs/ui/13-tiers-replays-and-plus.md 7.5)
  tier: "Observer"
  means: "You can read a chart."

- type: path-choice             # once: the last screen of the path-choice lesson, Chapter 1 Level 17-2
```
