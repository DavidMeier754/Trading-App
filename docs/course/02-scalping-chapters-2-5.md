# Scalping, Chapters 2–5

_Part of the [course outline](README.md)_

## Scalping

Folder base: `content/paths/scalping/`. Timeframes: 1-minute with 5-minute context. Numbers: 500–2,000 shares, $0.05–$0.30 targets, $5,000–$30,000 accounts, drill prices $10–$30.

**[v3.1] The three bands are not independent.** One position at a time, and `shares × price ≤ 0.95 × the account named in the file` (`docs/rules/04-numbers-and-realism.md` §3.6, checked by `tools/validate_content.py` and reported by `tools/check_sizing.py`). A scalp on this path is meant to sit near that ceiling — 1 % of the account divided by a stop of well under 1 % of the price buys nearly all the cash — so the size is large and the risk is small, and the two are taught as different numbers. Write the account last: it is whatever carries the size, not a figure chosen first. The full 500–2,000 range only fits at the cheap end of the price band — a $30,000 account carries 2,850 shares at $10, 1,425 at $20 and 950 at $30 — so drills on dearer names size down rather than name an account the path does not have.

### Chapter 2 — Charts 101 — written

Folder: `chapter-02-charts-101` · 18 levels, 49 subs
First candlestick charts of the app. Every level from 3 on has at least one `chart-decision`.

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | The Candle | 4 | Open, high, low, close; body and wick; green and red; reading one candle with `hotspot` and `chart-tap`; measuring a body. **[v4]** 1-1 shows the labelled `candle-anatomy`; 1-4, after the screen that introduces the $20,000 practice account: the **plan revision** — `setup_max_account_pct` from 50 to 95, with the short reason (a scalp's move is cents, so the size is large and the stop small; Chapter 3 Level 10 proves it) (`docs/rules/04-numbers-and-realism.md` §3.6) | — |
| 2 | What a Candle Says | 3 | Long body = conviction, long wick = refusal, tiny body = indecision; shape-only decisions | — |
| 3 | Timeframes | 3 | A candle is a time slice; building one 5-minute candle from five 1-minute candles; act on the 1-min, read context on the 5-min | — |
| 4 | Volume Bars | 4 | One bar per candle; volume confirms, thin bars are drift; relative to this stock's own minutes; climax volume; `chart-annotate` on the heaviest bar | 1 |
| 5 | Candles and Volume Practice | 2 R | Mixed drill: shape plus weight, four decisions and a `swipe-deck` | 1 |
| 6 | Checkpoint | 1 T | 10 questions on Levels 1–5 | 1 |
| 7 | Trend and Range | 4 | Higher highs / higher lows, lower highs / lower lows, sideways range; naming the shape; why ranges kill scalps; practice | 1 |
| 8 | The Pullback | 3 | The dip inside a trend; shrinking volume into it; joining on the first candle back | — |
| 9 | Support and Resistance | 4 | Levels as memory; round numbers; yesterday's high and low; the pre-market high and low; marking them with `chart-annotate` | 1 |
| 10 | Bounce or Break | 3 | The two answers at a level; wick versus close; waiting for the candle to finish | — |
| 11 | Levels Practice | 2 R | Four decisions at levels plus a `compare` between a bounce and a break | 1 |
| 12 | Checkpoint | 1 T | 10 questions on Levels 7–11 | 1 |
| 13 | The Opening Minutes | 4 | The first 30 minutes from `{{market.first_minutes}}`; gaps up and down; the opening range; why the first five minutes are for watching | 1 |
| 14 | Momentum vs Exhaustion | 3 | Expanding bodies on rising volume; climax volume with a long wick; not chasing the third leg | 1 |
| 15 | Chapter 1 Callback | 2 R | Liquidity, volatility and sessions re-tested *on charts*: which chart is the illiquid one, which move is the thin-session one | 1 |
| 16 | The Scalper's Screen | 3 | 1-min chart, 5-min context, volume, quote panel; which stock gets on the screen at all; marking levels before the open | 1 |
| 17 | Chapter Review | 2 R | One full morning: open, break, pullback, climax, refusal, chop — six decisions in order | 1 |
| 18 | Final Exam | 1 F | 13 questions → badge → `tier-up` (Observer) | 1 |

**New terms:** Candle, Open, High, Low, Close, Body, Wick, Timeframe, Volume bar, Climax volume, Uptrend, Downtrend, Range, Higher high, Higher low, Lower high, Lower low, Pullback, Support, Resistance, Breakout, Bounce, Gap, Opening range, Momentum, Exhaustion.

### Chapter 3 — Orders, Costs & Position Size — written

Folder: `chapter-03-orders-costs-position-size` · 19 levels, 50 subs

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Bid, Ask, Spread | 4 | Bid, ask, last, spread on the quote panel; who pays which; reading a panel with `hotspot`; the spread as the market maker's income | 1 |
| 2 | The Spread as a Cost | 3 | The round trip; you are down the spread the instant you enter; spread × share count | 1 |
| 3 | Judging a Spread | 3 | Spread against the *expected move*, never against the share price; liquidity makes spreads tight; spreads widen on news and at the open | 1, 2 |
| 4 | Spread Practice | 2 R | Six quotes judged in three seconds each, `swipe-deck` style; a cost-aware decision | 1 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 1 |
| 6 | Market and Limit Orders | 4 | Market fills now at the ask/bid; limit waits for your price and may never fill; the fill; `order-build` on a real ticket | — |
| 7 | The Marketable Limit | 3 | A limit at or above the ask: speed with a ceiling; unfilled risk; limit exits at the target | — |
| 8 | Ticket Practice | 2 R | Choosing the right order for six situations, on tickets | 2 |
| 9 | The Stop Order | 4 | Stop-loss, stop-market vs stop-limit, which side of the entry, stop distance; where a stop belongs on the chart | 2 |
| 10 | How Many Shares? | 4 | Position value, risk per trade, the 1 % rule, **and the account ceiling** — shares = min(risk ÷ stop, account ÷ price); spread versus stop. **[v4]** Proves the learner's revised plan ceiling (Chapter 2 Level 1-4) with the arithmetic | 1 |
| 11 | Sizing Practice | 2 R | Five setups sized from both ceilings; the one where the account binds | 1 |
| 12 | Checkpoint | 1 T | 10 questions on Levels 6–11 | 1, 2 |
| 13 | Slippage and Speed | 3 | The gap between the price you saw and the fill; execution speed; capping slippage with a marketable limit | 2 |
| 14 | Fees at Frequency | 3 | Per-order and per-share fees; the monthly number at scalping frequency; `{{market.fee_note}}`, `{{market.scalping_note}}`; fewer, better trades | 1 |
| 15 | Inside the Quote | 3 | Level 2, the order book, displayed size, time and sales; `depth-ladder` — where a 1,000-share order actually fills | 1 |
| 16 | Chapters 1–2 Callback | 2 R | Liquidity → spread → the size you can actually trade; chart levels → where the stop goes. Old ideas, priced | 1, 2 |
| 17 | The All-In Check | 3 | Spread + slippage + fees per share against the target; the fallback plan; the four-question pre-trade checklist; a `plan-card` for the user's own limits | 2 |
| 18 | Chapter Review | 2 R | Three setups run end to end: check the cost, size it, place it, decide | 1, 2 |
| 19 | Final Exam | 1 F | 13 questions → badge | 1, 2 |

**New terms:** Bid, Ask, Last, Quote panel, Round trip, Target, Expected move, Market order, Limit order, Fill, Marketable limit order, Unfilled, Stop order, Stop-loss, Stop-market, Stop-limit, Stop distance, Position size, Position value, Risk per trade, 1 % rule, Account ceiling, Slippage, Execution speed, Commission, Per-share fee, Level 2, Order book, Displayed size, Time and sales, Tape, All-in cost, Fallback plan.

### Chapter 4 — Reading Fast Markets — written

Folder: `chapter-04-reading-fast-markets` · 18 levels, 48 subs
Contains the path's one fan-out (Levels 9–11 → merge at 12). Sources: Aziz, Bellafiore, Volman, Murphy, Nison, Carter.

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | VWAP | 4 | Volume-weighted average price; computing a simple one; why institutions are graded against it; above and below the line | 1 |
| 2 | Trading the Line | 3 | Bounce, rejection, reclaim; a poke is not a reclaim; the close is what counts | 2 |
| 3 | Intraday Levels | 4 | Yesterday's high, low and close; the pre-market extremes; the opening price; round numbers; levels are zones; drawing the map with `chart-annotate` | 2 |
| 4 | Map Practice | 2 R | Three decisions using VWAP plus one marked level, each priced before it is taken | 3 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 2, 3 |
| 6 | Candle Signals on the 1-Minute | 4 | Momentum candle, doji, rejection candle, engulfing candle; context beats shape; `compare` between a signal and noise | 2 |
| 7 | Confluence | 3 | Two or more independent reasons at one price; the four-part filter; one reason is a coin flip with costs | 2, 3 |
| 8 | Checkpoint | 1 T | 10 questions on Levels 6–7 plus the map | 2, 3 |
| 9 | Fan-out A — Tape Reading | 3 | `fan-out:tape`. Time and sales, prints, speed and size, prints at the ask vs the bid; stacking and pulling; what pulling does to your stop | 3 |
| 10 | Fan-out B — VWAP & Levels in Action | 3 | `fan-out:levels`. Confluence at one price; first touch vs third touch; the failed test and why it moves fast | 2 |
| 11 | Fan-out C — The Opening Drive | 3 | `fan-out:open`. The first five minutes; the opening-range break and the break that fails; wide spreads at the open | 2, 3 |
| 12 | The Scalper's Map | 4 | `merge`. Level → VWAP → candle → tape, in that order, every time; what each input contributes; running the read in three seconds | 2, 3 |
| 13 | Map Drills | 2 R | Six reads on unseen charts, three of which are passes | 2, 3 |
| 14 | Two Timeframes | 3 | The 5-minute decides direction, the 1-minute decides the moment; never fight the slower chart | 2 |
| 15 | Halts and Standing Aside | 3 | What a halt does to an open position and to a stop; the conditions that make a morning untradeable | 3 |
| 16 | Chapters 2–3 Callback | 2 R | Structure and cost re-tested inside a live read: is this level worth the spread, does the 5-min agree, what size does the stop allow | 2, 3 |
| 17 | Chapter Review | 2 R | Two mornings read end to end, with the four-part read written out each time | 2, 3 |
| 18 | Final Exam | 1 F | 13 questions → badge → `tier-up` (Student) | 1, 2, 3 |

**New terms:** VWAP, Rejection, Reclaim, Confluence, Doji, Engulfing candle, Print, Stacking, Pulling, Failed test, Opening drive, Halt.

### Chapter 5 — Finding the Trade — written

Folder: `chapter-05-finding-the-trade` · 17 levels, 45 subs
The chapter the v2 path was missing entirely: which stock, and what kind of day. Sources: Aziz (scanning, watchlist), Bellafiore, Carter (internals), Raschke & Connors.

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Not Every Stock | 4 | What makes a stock scalpable at all: enough volume, a spread you can pay, a range worth trading, a price your account can hold; the ones to leave alone | 1, 3 |
| 2 | Relative Volume | 4 | Today's volume against this stock's own normal day; why 4× normal matters more than the absolute number; where it is read; the first filter of the morning | 1, 2 |
| 3 | The Catalyst | 3 | Why a stock is in play — earnings, news, a gap; a mover with no reason versus one with a reason; never trading news you have not read | 1 |
| 4 | Selection Practice | 2 R | Six `scanner-pick` rounds: which of these is worth the screen today | 1, 3 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 1, 3 |
| 6 | Reading a Scanner | 4 | The columns that matter, gappers and top movers, sorting by relative volume, filtering out the untradeable; building the shortlist | 1, 3 |
| 7 | Building the Watchlist | 3 | Three to five names, not twenty; why more names means worse decisions; writing the levels for each before the open | 2 |
| 8 | Float and Share Structure | 3 | Float in plain words; why a small float moves faster and slips more; matching size to the name | 1, 3 |
| 9 | Watchlist Practice | 2 R | Build a watchlist from a scanner, then defend two cuts | 1, 3 |
| 10 | Checkpoint | 1 T | 10 questions on Levels 6–9 | 1, 3 |
| 11 | The Market Behind the Stock | 3 | The index as weather, the sector as the street; a strong stock in a falling market; `{{market.index_example}}` | 1 |
| 12 | Market Internals | 3 | Breadth in plain words, risk-on and risk-off, the `internals-panel`; when the whole tape turns at once | 1 |
| 13 | Trend Day or Range Day | 4 | Reading the day type in the first half hour; what each type offers and refuses; the day type as a filter on everything later | 2, 4 |
| 14 | Chapters 1 & 4 Callback | 2 R | Liquidity and volatility re-tested as selection criteria; the four-part read applied to *choosing* rather than entering | 1, 4 |
| 15 | The Pre-Market Routine | 3 | The ritual end to end: scan, shortlist, levels, market check, day-type guess, plan; a `plan-card` for the user's own routine | 2, 3, 4 |
| 16 | Chapter Review | 2 R | One full pre-market, from an empty screen to three names with levels drawn | 1, 2, 3, 4 |
| 17 | Final Exam | 1 F | 13 questions → badge | 1, 2, 3, 4 |

**New terms:** Relative volume, Catalyst, In play, Scanner, Gapper, Watchlist, Float, Small float, Index, Sector, Breadth, Risk-on, Risk-off, Trend day, Range day, Pre-market routine.
