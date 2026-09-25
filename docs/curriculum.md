# curriculum.md — Chapter and level plan

Authority for *what* is taught where. Rules live in `docs/agent.md`, UI in `docs/UI.md`, format in `docs/schema.md`.
Every path has **8 chapters**. Chapter 1 is shared and ends with the path choice.

Status: **v3**. The path is sized so a learner doing two sub-levels a day (~10 minutes) finishes in about six months and comes out able to run a plan: pick the stock, read the day, recognise the setup, size it, manage it, and review it. See `docs/agent.md` §1.1 for what "finished" is allowed to claim.
**[v4] (2026-09-25):** one new sub-level in Chapter 1 (2-4, variance), the scalping plan revision moved to Chapter 2 Level 1-4, the account facts that decisions B and C require, and Swing written before Day Trading. The order of all work is `docs/build-plan.md`.

**[v4.1] (2026-09-25):** all three paths ship in v1.0 (decision E), so Day Trading is written before the release too, right after Swing. The practice arena (`docs/build-plan.md` Phase G) adds hands-on charts beyond the paths; it does not change this outline.

Legend: `T` = test, `F` = final exam, `R` = repetition sub. Subs listed as a count; files are `level-LL-S.yaml`.
The **Reinforces** column lists earlier chapters the level deliberately re-tests — it becomes the `reinforces:` header field (`docs/schema.md`). Every chapter from 3 on has one explicit **Callback** level.

Write each chapter exactly as outlined; if the material genuinely needs a different split, note the deviation in the session report.

Chapter status: **written** = in the repo and validated · **expand** = v2 content exists, needs the v3 level plan · **new** = does not exist yet · **planned** = outlined only.

### Shape at a glance

| Path | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | Ch7 | Ch8 | Levels | Subs |
|---|---|---|---|---|---|---|---|---|---|---|
| Scalping | 17 | 18 | 19 | 18 | 17 | 19 | 19 | **18** | **145** | **~393** |
| Day Trading | 17 | 18 | 19 | 18 | 17 | 19 | 19 | **18** | **145** | **~389** |
| Swing Trading | 17 | 18 | 18 | 18 | 17 | 19 | 19 | **18** | **144** | **~386** |

(Chapter 1 is shared, so a learner sees Chapter 1 once plus one path's Chapters 2–8. ~393 sub-levels ≈ 22 hours ≈ six months at two a day. **[v4]** 388 scalping sub-levels are written (Chapter 1's 48 with the path choice, plus 340); five are planned: Chapter 8 Level 15 (four, stage OFFER) and Chapter 1 Level 2-4 (one, stage VARIANCE).)

### Migration note — v2 chapters are renumbered — **done**

v3 inserted **Finding the Trade** at Chapter 5, which pushed the two chapters after it down by one.
The scalping folders were renamed and their `chapter:` fields updated; the mapping was
`chapter-05-risk-and-psychology` → `chapter-06-risk-and-psychology`, `chapter-06-scalping-playbook` →
`chapter-07-scalping-playbook`, with `chapter-05-finding-the-trade` and `chapter-08-the-trading-day`
written new. Nothing here is outstanding — it is kept so cross-chapter references in older prose
can be traced.

---

## Chapter 1 — Market Basics (shared) — written

Folder: `content/shared/chapter-01-market-basics/` · 17 levels, 48 subs written · **[v4]** 49 with Level 2-4

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Your First Trade | 4 | Line chart, price, buy/sell, position, profit and loss; the first buy/wait decisions; move × shares; mixed practice | — |
| 2 | Why Prices Move | **4** | Buyers vs sellers, demand and supply, the imbalance rule; news as the trigger that flips it. **[v4] 2-4 Good Call, Bad Luck (new):** a good read can still lose — the next buyer, seller or headline cannot be known; the `variance-sim` screen (ten trades of one good setup, run again and again, then a hundred); the first correct decision in the course that loses, with its reveal; judge the decision, not the result (`docs/agent.md` §3.11) | — |
| 3 | What You're Actually Buying | 3 | Share = a fraction of a company, shareholder, ticker, exchange; why companies sell shares; your money goes to the seller | — |
| 4 | The Quote Card | 4 | Price, previous close, daily change in $ and %, volume; reading a quote in two seconds; red days mean nothing alone; practice | — |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | — |
| 6 | Who's On the Other Side | 3 | Retail traders, institutions, market makers; the two-sided quote and the spread as their income; reading footprints from volume | — |
| 7 | Volume and Liquidity | 4 | Volume as activity; liquidity as ease of exit; volume as the liquidity clue; what a big order does in a thin stock; practice | — |
| 8 | Volatility | 3 | Size and speed of moves; volatility is not liquidity; the two dials; picking a stock to learn on | — |
| 9 | Two Dials Practice | 2 R | Classifying real-looking quotes on both dials; a buy/wait decision that turns on liquidity | — |
| 10 | When the Market Is Open | 3 | Pre-market, regular session, after-hours from `{{market.*}}`; thin sessions are jumpy; where beginners practise | — |
| 11 | Checkpoint | 1 T | 10 questions on Levels 6–10 | — |
| 12 | Getting Access | 3 | Broker, brokerage account, order, paper trading, fees as a category, `{{market.regulation_note}}`; the order ticket. **[v4]** One sentence: there are cash accounts and margin accounts, and they allow different things (decision B) | — |
| 13 | Long and Short | 4 | Long, short, borrow, cover; computing each result; the risk asymmetry; first long / short / no-trade decisions. **[v4]** One sentence: a short needs a margin-enabled account (decision B) | — |
| 14 | Three Ways to Trade | 3 | Holding period; scalping / day / swing; trading vs investing; matching a style to a real life | — |
| 15 | The Big Picture | 3 | Trend, bull and bear markets as context not signal; news versus expectations; where sudden volatility comes from | — |
| 16 | Chapter Review | 2 R | One narrated trading day using every Chapter 1 idea; a `plan-card` where the user writes what kind of trader they want to be. **[v4]** One sentence on why the plan's position ceiling (50 %) sits below the examples so far | — |
| 17 | Final Exam | 1 F + 1 | 17-1: 12 questions → badge. No tier here — Observer unlocks after Chapter 2 (`docs/UI.md` §7.5). 17-2, **Choose Your Path**: the three paths side by side — chart, holding period, target per share, how far away the exit sits, positions open at once, overnight exposure, screen time — the costs each target carries, and which day fits which path; ends on the `path-choice` screen. It is its own node on the map after the exam (`docs/UI.md` §7.1), replayable to change path, and costs no hearts | — |


> Chapter 1's `reinforces` is empty in every file and the column reads `—` throughout: the field takes *earlier chapter* numbers (`docs/schema.md`) and Chapter 1 has none. Interleaving inside the chapter is still required — it is covered by the rule in `docs/agent.md` §3.2, not by this field.

**Terms Chapter 1 introduces** (available to every later chapter): Price, Chart, Stock, Share, Buy, Sell, Position, Profit, Loss, Trade, Market, Buyer, Seller, Demand, Supply, **[v4]** Variance, Shareholder, Ticker, Exchange, Quote, Previous close, Daily change, Volume, Retail trader, Institution, Market maker, Spread, Liquidity, Liquid, Illiquid, Volatility, Volatile, Session, Pre-market, Regular session, After-hours, Broker, Brokerage account, Order, Paper trading, Fee, Long, Short, Borrow, Cover, No trade, Holding period, Scalping, Day trading, Swing trading, Investing, Trend, Bull market, Bear market.

---

## Scalping

Folder base: `content/paths/scalping/`. Timeframes: 1-minute with 5-minute context. Numbers: 500–2,000 shares, $0.05–$0.30 targets, $5,000–$30,000 accounts, drill prices $10–$30.

**[v3.1] The three bands are not independent.** One position at a time, and `shares × price ≤ 0.95 × the account named in the file` (`docs/agent.md` §3.6, checked by `tools/validate_content.py` and reported by `tools/check_sizing.py`). A scalp on this path is meant to sit near that ceiling — 1 % of the account divided by a stop of well under 1 % of the price buys nearly all the cash — so the size is large and the risk is small, and the two are taught as different numbers. Write the account last: it is whatever carries the size, not a figure chosen first. The full 500–2,000 range only fits at the cheap end of the price band — a $30,000 account carries 2,850 shares at $10, 1,425 at $20 and 950 at $30 — so drills on dearer names size down rather than name an account the path does not have.

### Chapter 2 — Charts 101 — written

Folder: `chapter-02-charts-101` · 18 levels, 49 subs
First candlestick charts of the app. Every level from 3 on has at least one `chart-decision`.

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | The Candle | 4 | Open, high, low, close; body and wick; green and red; reading one candle with `hotspot` and `chart-tap`; measuring a body. **[v4]** 1-1 shows the labelled `candle-anatomy`; 1-4, after the screen that introduces the $20,000 practice account: the **plan revision** — `setup_max_account_pct` from 50 to 95, with the short reason (a scalp's move is cents, so the size is large and the stop small; Chapter 3 Level 10 proves it) (`docs/agent.md` §3.6) | — |
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

### Chapter 6 — Risk & Psychology — written

Folder: `chapter-06-risk-and-psychology` · 19 levels, 51 subs
The thinnest chapter in v2 and the one where retail traders actually fail, so it gets the largest expansion. Sources: Elder, Douglas, Tharp, Steenbarger, Bellafiore.

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | The Stop Is Not Optional | 4 | The stop is chosen before the entry; hard versus mental; never widening; where it belongs on the chart; what it costs to move it | 3, 4 |
| 2 | R — The Unit | 4 | 1R as entry minus stop times shares; results as R-multiples; why R beats dollars; rejecting a trade whose target is smaller than its stop | 3 |
| 3 | Managing the Trade | 4 | The break-even stop and what it really removes; partial exits and the trade they make; trailing a stop; the time stop when nothing happens | 3 |
| 4 | Stops and R Practice | 2 R | Five trades sized, stopped and graded in R; one `branch` where the trade goes against you | 3 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 3 |
| 6 | Win Rate and Expectancy | 4 | Win rate alone tells you nothing; average win and average loss; expectancy as the value of one average trade; a 40 % win rate that pays. **[v4]** The `variance-sim` again, with this chapter's numbers | 3 |
| 7 | Costs Inside Expectancy | 3 | Spread, slippage and fees inside the average; measuring expectancy after costs; what halving frequency does to it | 3 |
| 8 | Expectancy Practice | 2 R | Five sets of real-looking numbers; which method to keep and which to delete | 3 |
| 9 | Session Limits | 3 | The daily loss limit in R, the trade cap, the time cap; written before the open; a limit broken once is not a limit; a `plan-card`. **[v4]** One screen on what the trade cap needs from the account: several same-day round trips need a margin account, and `{{market.regulation_note}}` (the pattern-day-trader rule, settlement) — decision C | 5 |
| 10 | Checkpoint | 1 T | 10 questions on Levels 6–9 | 3 |
| 11 | Overtrading and Tilt | 3 | Revenge trading, FOMO, chasing; the signs of tilt in yourself; the trade right after the loss | 5 |
| 12 | The Reset Routine | 3 | Why a routine beats willpower; the written steps; coming back at half size and what that proves | — |
| 13 | Thinking in Probabilities | 3 | One trade is close to random; sample size; the two mistakes a losing run and a winning run each cause. **[v4]** A hundred runs of the `variance-sim`: what a losing streak inside a good method looks like | — |
| 14 | Chapter 3 Callback | 2 R | Sizing and costs re-tested as risk: the same trade at two share counts, the same method with two cost structures | 3 |
| 15 | The Journal | 3 | One row per trade; the execution grade, independent of the result; `journal-row` on a finished trade; writing it the same day | 5 |
| 16 | The Weekly Review | 3 | Sorting rows by setup and by hour; finding the column that bleeds; one rule for next week | 5 |
| 17 | Sizing Under Stress | 3 | Drawdown and its asymmetric math; cutting size on results, raising it only on evidence | 3 |
| 18 | A Losing Morning, Handled | 2 R | One narrated morning: a clean stop, a limit respected, a reset, a return at half size, finishing down 1R instead of 5 | 3, 5 |
| 19 | Final Exam | 1 F | 14 questions → badge → `tier-up` (Planner) | 3, 4, 5 |

**New terms:** Setup, Hard stop, Mental stop, R, R-multiple, Break-even stop, Partial exit, Trailing stop, Time stop, Win rate, Average win, Average loss, Expectancy, Edge, Daily loss limit, Trade limit, Overtrading, Revenge trade, FOMO, Chasing, Tilt, Reset routine, Sample size, Journal, Execution grade, Weekly review, Drawdown.

### Chapter 7 — The Scalping Playbook — written

Folder: `chapter-07-scalping-playbook` · 19 levels, 50 subs
Eight setups instead of five. Every setup is a playbook card: context, entry, stop, target, invalidation. Each gets a theory sub and drill subs. Two named sources per setup claim.

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | What a Playbook Is | 3 | The card and its five fields; invalidation versus the stop; why a short playbook beats a long one; the user starts their own `plan-sheet` | 6 |
| 2 | Setup A — VWAP Bounce | 4 | Above VWAP all session, first or second touch, entry on the reclaim close, stop under the candle, target the high of day; drills; a `compare` against the mirror image | 4, 6 |
| 3 | Setup B — Opening-Range Scalp | 4 | The first five minutes as a box, the close beyond it on volume, the stop back inside, 1R–2R; the failure mode; drills both directions | 2, 4 |
| 4 | Setup C — Momentum Continuation | 4 | The leg, the shallow quiet pause, the first close back in the direction; the measured move as a projection; drills | 2, 4 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 4, 6 |
| 6 | Setup D — Mean Reversion at a Level | 4 | The stretched run into a marked level, climax volume, the rejection close, the tight stop, VWAP as the target, and smaller size because it fights the move | 4, 6 |
| 7 | Setup E — Failed-Breakout Fade | 3 | The break nobody bought, the re-entry candle, trapped traders, the stop beyond the failed extreme | 4 |
| 8 | Mixed Drill I | 2 R | A `swipe-deck` across Setups A–E: which card is this, or none | 4 |
| 9 | Checkpoint | 1 T | 10 questions on Levels 6–8 | 4, 6 |
| 10 | Setup F — Gap-and-Go Continuation | 3 | The gap that holds, the first pullback, entry on the resumption; when a gap is too extended to join | 2, 5 |
| 11 | Setup G — Range Rotation | 3 | The range day's edges; fading the edge with the day type as permission; why this card is forbidden on a trend day | 5 |
| 12 | Setup H — The Re-Entry | 3 | Getting back into a trade that stopped you out: what has to be true, what makes it revenge instead, the size it deserves | 6 |
| 13 | Mixed Drill II | 2 R | Eight charts across all eight cards, half of them passes | 4, 5 |
| 14 | Choosing the Setup for the Day | 3 | Day type → which cards are on the table; trend days feed continuation, range days feed reversion; when none are | 5 |
| 15 | Chapters 5 & 6 Callback | 2 R | Selection and risk re-tested inside the playbook: right card, wrong stock; right card, wrong day; right card, no risk budget left | 5, 6 |
| 16 | When Nothing Fits | 2 | The discipline of the empty morning; what a playbook costs you in missed trades and why that is the price | 6 |
| 17 | Capstone — A Full Session | 3 R | One narrated morning: eight decisions across setups, with costs, limits and a losing trade taken correctly | 3, 5, 6 |
| 18 | Chapter Review | 2 R | The eight cards summarised by trigger, then a mixed `compare` set | 4, 5, 6 |
| 19 | Final Exam | 1 F | 14 questions → badge | 4, 5, 6 |

**New terms:** Playbook, Playbook card, Invalidation, VWAP bounce, High of day, Opening-range scalp, Momentum continuation, Leg, Measured move, Mean reversion, Fade, Re-entry candle, Trapped traders, Gap-and-go, Range rotation, Re-entry trade.

### Chapter 8 — The Trading Day — written

Folder: `chapter-08-the-trading-day` · 18 levels, 51 subs · **47 written; Level 15 is new (4 subs) and Levels 15–17 renumber to 16–18**
Execution, the full routine, and the honest handover to a simulator. Sources: Aziz (platform, hotkeys, routine), Bellafiore, Steenbarger, Elder.

> **[v4]** Decisions A, B and C are made (`docs/agent.md` §1.1, §3.6): the path ends at a person who can start, a short needs a margin-enabled account, and several same-day round trips need a margin account and meet the pattern-day-trader rule. Nothing in Level 15 waits on a decision any more; stage OFFER writes it.
>
> **Level 15 is the lesson `docs/agent.md` §1 and §7 have always promised and the path never had.** The fixed product decision says that where a path is traded in other instruments in Europe (scalping → futures/CFDs) *one lesson says so explicitly*; no such lesson exists in the 387 written sub-levels, where financial margin appears zero times. It goes here because this is where the learner is about to open an account. It is **orientation, not instruction**: it names what they will be offered and what it does to arithmetic they already own, and teaches no CFD, forex or leverage mechanics (§7 stands).
>
> **The renumber.** Inserting it pushes Going Live, Carefully 15→16, Capstone 16→17, Final Exam 17→18, with the sub-level ids and the `prerequisite` chain moving with them — the same migration Chapter 5's insertion needed, and the prompt for it is in `docs/build-plan.md` § OFFER.

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | The Platform | 4 | What an order-entry screen actually does; the ladder; why a scalper's platform differs from a broker app; what a simulator is and why it comes first. No products named | 3 |
| 2 | Hotkeys and Muscle Memory | 3 | Why speed is a risk control, not a thrill; a small key set (buy, sell, size, flatten, cancel); `hotkey-pad` sequences; practising them away from the market | 3 |
| 3 | Execution Drills | 2 R | `order-build` and `depth-ladder` rounds against the clock of the chart, not a timer | 3, 4 |
| 4 | The Pre-Market Hour | 4 | The full ritual: scan, shortlist, levels, market check, day-type guess, risk numbers, if-then plans written before the bell | 5, 6 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 3, 5 |
| 6 | The Open | 3 | The first thirty minutes: watch, mark, then act; what the opening range gives you; the trades to skip while spreads are wide | 2, 4 |
| 7 | Mid-Session | 3 | Thinning volume, widening spreads, the midday trap; when to reduce size and when to stop | 4, 6 |
| 8 | The Close and the Review | 3 | Flat before the bell; the post-market review while the charts are fresh; filling the journal the same day | 6 |
| 9 | Full-Day Practice | 3 R | One session start to finish with the routine applied, including two passes and one stop-out | 5, 6, 7 |
| 10 | Checkpoint | 1 T | 10 questions on Levels 6–9 | 6, 7 |
| 11 | Tracking Your Numbers | 4 | The handful of stats that matter; expectancy across a sample rather than a day; the `stats-card`; spotting the setup that quietly bleeds | 6 |
| 12 | When to Increase Size | 3 | Evidence-based scaling: a number of grade-A trades, not a good week; what to do after a drawdown | 6 |
| 13 | Chapters 6 & 7 Callback | 2 R | Risk and playbook re-tested inside a live session: the card fires but the limit is nearly gone; the setup is right but the size is wrong | 6, 7 |
| 14 | Your First 30 Days on Sim | 4 | A concrete simulator plan: which cards, how many trades, what to record, what "ready" would look like; the honest statement that the app cannot make you profitable | 6, 7 |
| **15** | **What You'll Actually Be Offered** | **4** | **[new]** 15-1 the two account types and what each one allows — **a cash account cannot short at all**, which is why 38 % of this path's decisions need the other one; in Europe, the leveraged wrappers this path deliberately did not teach, building on `{{market.scalping_note}}` rather than repeating it. 15-2 what leverage does to numbers the learner already owns: R is unchanged, the ruin arithmetic is not — a deposit that survives six stop-outs on cash does not survive six at 5:1. 15-3 what the rules do to the plan they wrote: `{{market.regulation_note}}` in place, the pattern-day-trader threshold against a six-trade session, settled funds against the same, and tax named once as a question for an adviser and never answered. 15-4 practice: choosing the account that fits their own plan sheet, **[v4]** and the criteria for judging a broker — regulation, deposit protection, cost structure, order types, borrow — never a name. **No product named, no mechanics taught, nothing here is a recommendation (§7)** | 3, 6 |
| 16 | Going Live, Carefully | 3 | The smallest size that is still real; what changes psychologically when money is live; the rules that must survive the switch. **[v4]** The warning signs a beginner meets first: signal groups, paid "gurus", pump-and-dump, guaranteed returns (`docs/agent.md` §7) | 6 |
| 17 | Capstone — A Full Week | 3 R | Five sessions compressed: a green day, a red day inside the limit, a day with no trades, a tilt caught early, a weekly review that produces one rule | 5, 6, 7 |
| 18 | Final Exam and Graduation | 1 F | 15 questions → badge → `tier-up` (Sim Trader) → the user's finished `plan-sheet` | 4, 5, 6, 7 |

**New terms:** Order-entry platform, Simulator, Hotkey, Flatten, Pre-market plan, If-then plan, Midday lull, Post-market review, Scaling up, Grade-A trade, Going live, **Cash account, Margin account, Settlement, Leverage, Day-trade limit**.

---

## Day Trading

Folder base: `content/paths/day-trading/`. Timeframes: 5-minute and 15-minute, with the daily chart as context. Numbers: 100–1,000 shares, $0.30–$2 targets, $5,000–$30,000 accounts, drill prices $10–$30. Sources: Aziz, Brooks, Bellafiore, Raschke & Connors, Murphy, Nison, Elder, Douglas, Tharp, Steenbarger.

### Chapter 2 — Charts 101 — planned (`chapter-02-charts-101`) · 18 levels, ~48 subs

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | The Candle | 4 | OHLC, body, wick, colour; reading one 5-minute candle; measuring a body | — |
| 2 | What a Candle Says | 3 | Conviction, refusal, indecision on the 5-min; first shape-only decisions | — |
| 3 | Timeframes | 3 | 5-min for trades, 15-min for structure, daily for context; the same day on three charts | — |
| 4 | Volume Bars | 4 | Volume confirms; relative volume against a normal day; climax bars; practice | 1 |
| 5 | Candles and Volume Practice | 2 R | Mixed shape-plus-weight drill | 1 |
| 6 | Checkpoint | 1 T | 10 questions on Levels 1–5 | 1 |
| 7 | The Shape of a Day | 4 | The volatile open, the midday lull, the last hour; where day trades live; the daily range | 1 |
| 8 | Gaps at the Open | 3 | Gap up and gap down; what a gap says about the day; gap fill versus gap and go | 1 |
| 9 | Trend and Range | 4 | Higher highs and lows on the 5-min; ranges; the pullback; trend days versus range days | 1 |
| 10 | Support and Resistance | 3 | Yesterday's high, low and close; pre-market levels; round numbers; levels as zones | 1 |
| 11 | Levels Practice | 2 R | Bounce versus break on the 5-min, with `compare` | 1 |
| 12 | Checkpoint | 1 T | 10 questions on Levels 7–11 | 1 |
| 13 | Momentum vs Exhaustion | 3 | Expanding candles and volume; climaxes; not chasing the third leg | 1 |
| 14 | Multiple Timeframes, First Look | 3 | Daily sets the bias, 15-min the structure, 5-min the trigger; alignment | — |
| 15 | Chapter 1 Callback | 2 R | Liquidity, volatility and sessions re-tested on 5-minute charts | 1 |
| 16 | The Day Trader's Screen | 3 | Daily context, 15-min structure, 5-min trigger, volume, quote; marking levels before the open | 1 |
| 17 | Chapter Review | 2 R | One full day read in six decisions | 1 |
| 18 | Final Exam | 1 F | 13 questions → badge → `tier-up` (Observer) | 1 |

### Chapter 3 — Orders, Costs & Position Size — planned (`chapter-03-orders-costs-position-size`) · 19 levels, ~49 subs

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Bid, Ask, Spread | 4 | The quote panel; the spread as a round-trip cost, lighter than scalping but never zero | 1 |
| 2 | Judging a Spread | 3 | Spread against a $0.30–$2 target; liquidity and tight spreads; when it widens | 1, 2 |
| 3 | Market, Limit, Marketable Limit | 4 | The order kit; when a day trader waits with a limit and when speed wins; `order-build` | — |
| 4 | Order Practice | 2 R | Six situations, right order each time | 2 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 1, 2 |
| 6 | The Stop Order | 4 | Stop-market versus stop-limit; the stop on 5-min structure, below the pullback low, not a round dollar | 2 |
| 7 | Bracket Orders | 3 | Entry + stop + target in one ticket; OCO; setting the bracket before the entry fills | — |
| 8 | Bracket Practice | 2 R | Building brackets on real setups | 2 |
| 9 | How Many Shares? | 4 | Position value, risk per trade, the 1 % rule with wider intraday stops, **and the account ceiling** | 1 |
| 10 | Sizing Practice | 2 R | Five setups sized from both ceilings | 1 |
| 11 | Checkpoint | 1 T | 10 questions on Levels 6–10 | 1, 2 |
| 12 | Slippage at the Open | 3 | Where slippage comes from; capping it; why the open is the worst of it | 2 |
| 13 | Fees and Account Rules | 3 | Fees at 5–10 trades a day; `{{market.fee_note}}`; `{{market.regulation_note}}`; cash versus margin basics | 1 |
| 14 | Inside the Quote | 3 | Level 2, displayed size, time and sales; `depth-ladder` | 1 |
| 15 | Scaling Out | 3 | Partial exits at 1R and 2R, moving the stop to break-even, what each does to expectancy | 2 |
| 16 | Chapters 1–2 Callback | 2 R | Liquidity → spread → size; 5-min structure → where the stop goes | 1, 2 |
| 17 | The Pre-Trade Check | 3 | Level, trigger, stop, size, bracket, cost; a `plan-card` for the user's own numbers | 2 |
| 18 | Chapter Review | 2 R | Three setups run end to end | 1, 2 |
| 19 | Final Exam | 1 F | 13 questions → badge | 1, 2 |

### Chapter 4 — Chart Reading II — planned (`chapter-04-chart-reading-ii`) · 18 levels, ~48 subs

Fan-out at Levels 9–11: candlestick patterns / support & resistance in depth / volume analysis → merge at VWAP (Level 12).

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Moving Averages | 4 | 9 and 20 EMA on the 5-min, 50 and 200 on the daily; slope as trend; price versus the average; MA as dynamic support | 2 |
| 2 | Trend Lines and Channels | 3 | Drawing them with `chart-annotate`; touches, breaks, and what a break is worth | 2 |
| 3 | Structure Practice | 2 R | Reading MAs and trend lines together on unseen days | 2 |
| 4 | The Opening Range | 3 | The first 15–30 minutes as the day's first structure; the break and the failure | 2 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 2, 3 |
| 6 | Relative Strength Intraday | 3 | The stock versus the index, minute by minute; why the strongest name leads | 2 |
| 7 | Confluence | 3 | Two or more independent reasons at one price; one reason is noise | 2, 3 |
| 8 | Checkpoint | 1 T | 10 questions on Levels 6–7 | 2, 3 |
| 9 | Fan-out A — Candlestick Patterns | 3 | `fan-out:candles`. Hammer, shooting star, engulfing, doji, inside bar (Nison); context first | 2 |
| 10 | Fan-out B — Support & Resistance II | 3 | `fan-out:levels`. Role reversal, multi-day levels, confluence, false breaks | 2 |
| 11 | Fan-out C — Volume Analysis | 3 | `fan-out:volume`. Volume at breakouts, climaxes, dry-ups, relative volume | 2 |
| 12 | VWAP | 4 | `merge`. VWAP as the day's fair price; reclaim and reject; combining the three strands with the line | 2, 3 |
| 13 | Map Drills | 2 R | Six reads on unseen days, three of them passes | 2, 3 |
| 14 | Multiple Timeframes | 3 | Daily → 15-min → 5-min; alignment; the higher timeframe wins | 2 |
| 15 | Halts and Standing Aside | 3 | Halts, wide spreads, news you have not read | 3 |
| 16 | Chapters 2–3 Callback | 2 R | Structure and cost re-tested inside a live read | 2, 3 |
| 17 | Chapter Review | 2 R | Two days read end to end | 2, 3 |
| 18 | Final Exam | 1 F | 13 questions → badge → `tier-up` (Student) | 1, 2, 3 |

### Chapter 5 — Finding the Trade — planned (`chapter-05-finding-the-trade`) · 17 levels, ~45 subs

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Not Every Stock | 4 | What makes a stock day-tradable: average range, volume, spread, price your account can hold | 1, 3 |
| 2 | Relative Volume | 4 | Today against this stock's own normal; the first filter of the morning | 1, 2 |
| 3 | The Catalyst | 3 | Earnings, news, a gap; a mover with a reason versus one without | 1 |
| 4 | Selection Practice | 2 R | Six `scanner-pick` rounds | 1, 3 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 1, 3 |
| 6 | Reading a Scanner | 4 | Gappers, top movers, sorting by relative volume, filtering the untradeable | 1, 3 |
| 7 | Building the Watchlist | 3 | Three to five names with levels drawn for each | 2 |
| 8 | Float and Share Structure | 3 | Float in plain words; why it changes how a name moves and slips | 1, 3 |
| 9 | Watchlist Practice | 2 R | Build one, then defend two cuts | 1, 3 |
| 10 | Checkpoint | 1 T | 10 questions on Levels 6–9 | 1, 3 |
| 11 | The Market Behind the Stock | 3 | The index as weather, the sector as the street; `{{market.index_example}}` | 1 |
| 12 | Market Internals | 3 | Breadth, risk-on and risk-off, the `internals-panel` | 1 |
| 13 | Trend Day or Range Day | 4 | Reading the day type in the first half hour; what each offers and refuses | 2, 4 |
| 14 | Chapters 1 & 4 Callback | 2 R | Liquidity and structure re-tested as selection criteria | 1, 4 |
| 15 | The Pre-Market Routine | 3 | Scan, shortlist, levels, market check, day type, plan; a `plan-card` | 2, 3, 4 |
| 16 | Chapter Review | 2 R | One full pre-market from empty screen to three names | 1, 2, 3, 4 |
| 17 | Final Exam | 1 F | 13 questions → badge | 1, 2, 3, 4 |

### Chapter 6 — Risk & Psychology — planned (`chapter-06-risk-and-psychology`) · 19 levels, ~50 subs

Same nineteen-level spine as scalping Chapter 6, with day-trading numbers (wider stops, fewer trades, overnight gap risk noted but not held). Levels: 1 The Stop Is Not Optional (4) · 2 R — The Unit (4) · 3 Managing the Trade (4) · 4 Stops and R Practice (2 R) · 5 Checkpoint (1 T) · 6 Win Rate and Expectancy (4) · 7 Costs Inside Expectancy (3) · 8 Expectancy Practice (2 R) · 9 The Daily Max Loss (3) · 10 Checkpoint (1 T) · 11 Revenge Trading and FOMO (3) · 12 The Reset Routine (3) · 13 Thinking in Probabilities (3) · 14 Chapter 3 Callback (2 R) · 15 The Journal (3) · 16 The Weekly Review (3) · 17 Sizing Under Stress (3) · 18 A Losing Day, Handled (2 R) · 19 Final Exam (1 F → `tier-up` Planner).

### Chapter 7 — Day Trading Playbook — planned (`chapter-07-day-trading-playbook`) · 19 levels, ~50 subs

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | What a Playbook Is | 3 | The card, its five fields, why few setups win; the user's `plan-sheet` starts | 6 |
| 2 | Setup A — Opening Range Breakout | 4 | Aziz ORB: the 5-min range, the break on volume, stop inside, target from the daily | 2, 4 |
| 3 | Setup B — Bull Flag | 4 | Strong move, tight pullback on falling volume, the break of the flag | 2, 4 |
| 4 | Setup C — VWAP Reclaim | 4 | Loss and recovery of VWAP with volume; the hold that confirms it | 4 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 4, 6 |
| 6 | Setup D — ABCD | 4 | Aziz ABCD: the leg, the pullback, entry above C | 2, 4 |
| 7 | Setup E — Reversal at the Extreme | 3 | Climax volume, rejection candle at a daily level, entry on confirmation, smaller size | 4, 6 |
| 8 | Mixed Drill I | 2 R | `swipe-deck` across Setups A–E | 4 |
| 9 | Checkpoint | 1 T | 10 questions on Levels 6–8 | 4, 6 |
| 10 | Setup F — The Gap Fill | 3 | The gap that fails to hold and works back toward yesterday's close | 2, 5 |
| 11 | Setup G — Range Rotation | 3 | The range day's edges; forbidden on a trend day | 5 |
| 12 | Setup H — The Re-Entry | 3 | Getting back in after a stop-out; what separates it from revenge | 6 |
| 13 | Mixed Drill II | 2 R | Eight charts across all eight cards, half passes | 4, 5 |
| 14 | Choosing the Setup for the Day | 3 | Day type → which cards are on the table; gap days versus quiet days | 5 |
| 15 | Chapters 5 & 6 Callback | 2 R | Right card, wrong stock; right card, wrong day; right card, no risk left | 5, 6 |
| 16 | When Nothing Fits | 2 | The empty day and what a playbook costs in missed trades | 6 |
| 17 | Capstone — A Full Day | 3 R | Pre-market plan through the close, eight decisions | 3, 5, 6 |
| 18 | Chapter Review | 2 R | Eight cards by trigger, then a mixed `compare` set | 4, 5, 6 |
| 19 | Final Exam | 1 F | 14 questions → badge | 4, 5, 6 |

### Chapter 8 — The Trading Day — planned (`chapter-08-the-trading-day`) · 18 levels, ~49 subs

Same seventeen-level spine as scalping Chapter 8, retuned for 5–10 trades a day: 1 The Platform (4) · 2 Order Entry and Brackets (3) · 3 Execution Drills (2 R) · 4 The Pre-Market Hour (4) · 5 Checkpoint (1 T) · 6 The Open (3) · 7 The Midday Lull (3) · 8 The Last Hour and the Close (3) · 9 Full-Day Practice (3 R) · 10 Checkpoint (1 T) · 11 Tracking Your Numbers (4) · 12 When to Increase Size (3) · 13 Chapters 6 & 7 Callback (2 R) · 14 Your First 30 Days on Sim (4) · **15 What You'll Actually Be Offered (3)** · 16 Going Live, Carefully (3) · 17 Capstone — A Full Week (3 R) · 18 Final Exam and Graduation (1 F → `tier-up` Sim Trader). Level 15 carries this path's own instruments and `{{market.regulation_note}}`; the PDT rule bites a day trader hardest, so it is named there rather than implied.

---

## Swing Trading

Folder base: `content/paths/swing-trading/`. Timeframes: daily with weekly context. Numbers: 20–300 shares, $2–$20 targets, $5,000–$50,000 accounts, drill prices $20–$80. Sources: Minervini, Aziz & Pezim, Shannon, Murphy, Nison, Elder, Douglas, Tharp, Steenbarger.

### Chapter 2 — Charts 101 — planned (`chapter-02-charts-101`) · 18 levels, ~48 subs

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | The Candle | 4 | OHLC on a daily candle; body and wick; what a whole day's candle says | — |
| 2 | What a Day Says | 3 | Wide range versus narrow; closing near the high or the low; the first daily decisions | — |
| 3 | Timeframes | 3 | Daily for trades, weekly for context; a month on both | — |
| 4 | Volume Bars | 4 | Daily volume, average volume, volume on up days versus down days; distribution days | 1 |
| 5 | Candles and Volume Practice | 2 R | Mixed daily drill | 1 |
| 6 | Checkpoint | 1 T | 10 questions on Levels 1–5 | 1 |
| 7 | Gaps | 4 | Overnight gaps, earnings gaps, why swing traders live with them; gap and go versus gap fill | 1 |
| 8 | Trend and Range | 4 | Higher highs and lows on the daily; ranges; the pullback; stage of a trend (early, mature, late) | 1 |
| 9 | Support and Resistance | 3 | Swing highs and lows, prior breakout levels, round numbers; judged on daily closes | 1 |
| 10 | Levels Practice | 2 R | Bounce versus break on daily closes, with `compare` | 1 |
| 11 | Checkpoint | 1 T | 10 questions on Levels 7–10 | 1 |
| 12 | Momentum vs Exhaustion | 3 | Expanding daily ranges and volume; climax days; not chasing an extended move | 1 |
| 13 | Bases and Consolidation | 3 | What a base looks like; tightness; why price going nowhere can be the best sign | — |
| 14 | Weekly Context | 3 | The weekly chart's job; when weekly and daily disagree | — |
| 15 | Chapter 1 Callback | 2 R | Liquidity, volatility and sessions re-tested on daily charts, including overnight risk | 1 |
| 16 | The Swing Trader's Screen | 3 | Weekly context, daily trigger, volume, the earnings date; the evening routine | 1 |
| 17 | Chapter Review | 2 R | Three charts read end to end | 1 |
| 18 | Final Exam | 1 F | 13 questions → badge → `tier-up` (Observer) | 1 |

### Chapter 3 — Orders, Costs & Position Size — planned (`chapter-03-orders-costs-position-size`) · 18 levels, ~47 subs

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Bid, Ask, Spread | 3 | The quote panel; why the spread matters little over days — and gaps matter a lot | 1 |
| 2 | Limit and Market Orders | 4 | Limit entries at your level, market when the breakout is happening; `order-build` | — |
| 3 | Order Practice | 2 R | Six situations, right order each time | 2 |
| 4 | The Stop Order and the Gap | 4 | Stop-market versus stop-limit; stops jumped overnight; why size, not the stop alone, protects you | 2 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 1, 2 |
| 6 | Bracket and Good-Till-Cancelled | 3 | Orders that live for days; entry + stop + target; reviewing them nightly | — |
| 7 | How Many Shares? | 4 | Position value, risk per trade with wider stops, the 1 % rule, **and the account ceiling**; several open positions at once. **[v4]** Revises the learner's `setup_max_account_pct` with this path's reason (the risk budget binds, not the account) | 1 |
| 8 | Sizing Practice | 2 R | Five setups sized from both ceilings | 1 |
| 9 | Checkpoint | 1 T | 10 questions on Levels 6–8 | 1, 2 |
| 10 | Costs Over Days | 3 | Fees are minor; slippage on the open; what actually costs a swing trader | 1 |
| 11 | Overnight and Weekend Risk | 3 | The gap through your stop; earnings risk; `{{market.regulation_note}}` | 1 |
| 12 | Scaling In and Out | 3 | Building a position in pieces; partial profits at targets; trailing the stop | 2 |
| 13 | Portfolio Basics | 3 | Several positions at once; total risk; why correlated names are one position | 1 |
| 14 | Chapters 1–2 Callback | 2 R | Liquidity and daily structure re-tested through sizing and stop placement | 1, 2 |
| 15 | The Pre-Trade Check | 3 | Trend, level, trigger, stop, size, earnings date, cost; a `plan-card` | 2 |
| 16 | Check Practice | 2 R | Three setups run end to end | 1, 2 |
| 17 | Chapter Review | 2 R | Two candidates accepted, two rejected, with reasons | 1, 2 |
| 18 | Final Exam | 1 F | 13 questions → badge | 1, 2 |

### Chapter 4 — Chart Reading II — planned (`chapter-04-chart-reading-ii`) · 18 levels, ~48 subs

Fan-out at Levels 9–11: VCP / cup-and-handle / flat base → merge at moving averages (Level 12).

| Level | Title | Subs | Teaches | Reinforces |
|---|---|---|---|---|
| 1 | Trend Lines | 3 | Drawing them on the daily with `chart-annotate`; touches and breaks | 2 |
| 2 | Stages of a Stock | 4 | Stage 1–4 taught as consensus (Minervini / Weinstein-style); which stage is buyable | 2 |
| 3 | Stage Practice | 2 R | Naming the stage on unseen charts | 2 |
| 4 | Volume Signatures | 4 | Dry-up in a base, expansion on the breakout, distribution days | 2 |
| 5 | Checkpoint | 1 T | 10 questions on Levels 1–4 | 2, 3 |
| 6 | Relative Strength | 3 | The stock versus the index over weeks; why leaders lead | 2 |
| 7 | Confluence | 3 | Stage, base, volume and relative strength agreeing at one price | 2, 3 |
| 8 | Checkpoint | 1 T | 10 questions on Levels 6–7 | 2, 3 |
| 9 | Fan-out A — Volatility Contraction | 3 | `fan-out:vcp`. Contracting pullbacks, the pivot, the breakout | 2 |
| 10 | Fan-out B — Cup and Handle | 3 | `fan-out:cup`. Shape, depth, the handle, the pivot | 2 |
| 11 | Fan-out C — Flat Base | 3 | `fan-out:base`. A tight range for weeks, then the breakout on volume | 2 |
| 12 | Moving Averages | 4 | `merge`. 10/21/50/200-day; alignment; MA as support; combining the three patterns with them | 2, 3 |
| 13 | Pattern Drills | 2 R | Six charts, three of them failures | 2, 3 |
| 14 | Multiple Timeframes | 3 | Weekly → daily alignment; when to believe the weekly | 2 |
| 15 | Failed Patterns | 3 | The breakout that does not hold; what it means and what it offers | 2, 3 |
| 16 | Chapters 2–3 Callback | 2 R | Daily structure and sizing re-tested inside a pattern read | 2, 3 |
| 17 | Chapter Review | 2 R | Three full reads | 2, 3 |
| 18 | Final Exam | 1 F | 13 questions → badge → `tier-up` (Student) | 1, 2, 3 |

### Chapter 5 — Finding the Trade — planned (`chapter-05-finding-the-trade`) · 17 levels, ~45 subs

Swing selection is a screen, not a scanner: 1 Not Every Stock (4) · 2 Screening for Candidates (4) · 3 The Fundamental Backdrop, Lightly (3) · 4 Selection Practice (2 R) · 5 Checkpoint (1 T) · 6 Reading a Screen Result (4) · 7 Building the Watchlist (3) · 8 Earnings Dates and the Calendar (3) · 9 Watchlist Practice (2 R) · 10 Checkpoint (1 T) · 11 The Market Behind the Stock (3) · 12 Market Stage and Breadth (3) · 13 Leading Sectors (4) · 14 Chapters 1 & 4 Callback (2 R) · 15 The Weekend Routine (3) · 16 Chapter Review (2 R) · 17 Final Exam (1 F).

### Chapter 6 — Risk & Psychology — planned (`chapter-06-risk-and-psychology`) · 19 levels, ~50 subs

Same spine, swing-specific: 1 The Stop Is Not Optional (4) · 2 R — The Unit (4) · 3 Managing the Trade (4: break-even, partials, trailing, time stop) · 4 Stops and R Practice (2 R) · 5 Checkpoint (1 T) · 6 Win Rate and Expectancy (4) · 7 Portfolio Heat (3: total open R, correlation, a cap) · 8 Expectancy Practice (2 R) · 9 Holding Through Noise (3) · 10 Checkpoint (1 T) · 11 Earnings and Events (3) · 12 The Reset Routine (3) · 13 Thinking in Probabilities (3) · 14 Chapter 3 Callback (2 R) · 15 The Journal (3) · 16 The Weekly Routine (3) · 17 Sizing Under Stress (3) · 18 A Losing Week, Handled (2 R) · 19 Final Exam (1 F → `tier-up` Planner).

### Chapter 7 — Swing Trading Playbook — planned (`chapter-07-swing-trading-playbook`) · 19 levels, ~50 subs

1 What a Playbook Is (3) · 2 Setup A — VCP Breakout (4) · 3 Setup B — Pullback to the Moving Average (4) · 4 Setup C — Base Breakout (4) · 5 Checkpoint (1 T) · 6 Setup D — Gap and Go on Earnings (4) · 7 Setup E — Failed Breakdown (3) · 8 Mixed Drill I (2 R) · 9 Checkpoint (1 T) · 10 Setup F — Pullback to Prior Breakout (3) · 11 Setup G — Range Rotation on the Daily (3) · 12 Setup H — The Re-Entry (3) · 13 Mixed Drill II (2 R) · 14 Choosing Setups for the Week (3) · 15 Chapters 5 & 6 Callback (2 R) · 16 When Nothing Fits (2) · 17 Capstone — A Full Month (3 R) · 18 Chapter Review (2 R) · 19 Final Exam (1 F).

### Chapter 8 — The Trading Week — planned (`chapter-08-the-trading-week`) · 18 levels, ~49 subs

1 The Platform (4) · 2 Orders That Live for Days (3) · 3 Execution Drills (2 R) · 4 The Weekend Plan (4) · 5 Checkpoint (1 T) · 6 The Trading Week (3) · 7 Managing Open Positions (3) · 8 The Nightly Review (3) · 9 Full-Week Practice (3 R) · 10 Checkpoint (1 T) · 11 Tracking Your Numbers (4) · 12 When to Increase Size (3) · 13 Chapters 6 & 7 Callback (2 R) · 14 Your First 90 Days on Sim (4) · **15 What You'll Actually Be Offered (3)** · 16 Going Live, Carefully (3) · 17 Capstone — A Full Quarter (3 R) · 18 Final Exam and Graduation (1 F → `tier-up` Sim Trader). Level 15 matters most on this path in Europe, where the leveraged wrappers are what a retail swing trader is actually shown — and where several positions open at once (Chapter 3 Level 7) makes total exposure, not one position, the number that can ruin an account.

---

## Drill packs

Folder: `content/drills/<path>/<slug>.yaml` · format in `docs/schema.md`. These feed the Practice hub (UI.md §7.3), not the path map. They are the rep volume that turns recognition into reflex, and they are written **after** the chapter they unlock from.

The table below is the plan; `content/drills/packs.yaml` is the manifest built from it, and it is what `tools/build_drill_batch.py` (**[v4]** stage DRILLS in `docs/build-plan.md`) and `tools/validate_content.py` both read. **Path `all` means every path gets a pack of this shape, not that one file serves three paths:** chapters 2–8 differ per path, so each pack is written once per path against that path's charts, prices and setups, and `unlocked_by` resolves inside that path. The "Unlocked by" column names a chapter's exam or a setup's level; the manifest turns each into the sub-level id that actually exists (a chapter's final exam, or the last sub of the setup's level — the one that writes its playbook card).

| Pack | Path | Unlocked by | Size | Contents |
|---|---|---|---|---|
| `charts-structure` | all | Ch2 exam | 30 | Trend / range / pullback naming, `swipe-deck` and `chart-tap` |
| `levels-and-breaks` | all | Ch2 exam | 30 | Bounce versus break, wick versus close |
| `cost-check` | all | Ch3 exam | 20 | Spread against target, sizing from both ceilings |
| `the-read` | all | Ch4 exam | 40 | The four-part read on unseen charts, a third of them passes |
| `selection` | all | Ch5 exam | 25 | `scanner-pick` and watchlist cuts |
| `risk-calls` | all | Ch6 exam | 25 | R, expectancy, limits and `branch` management decisions |
| `setup-a` … `setup-h` | all | each setup's level | 20 each | One `swipe-deck` bank per playbook card |
| `mixed-daily` | all | Ch7 exam | 40 | Everything, weighted by the learner's weak concepts |

Target at launch of a path: **~350 drill screens**, roughly the same volume again as the linear path's own questions. The sizes above add up to 370 across the fifteen packs; the manifest carries that figure.

**[v3] Twelve of the fifteen packs are on hold.** `chart-replay` (§ Replays) does the chart-recognition job better than a frozen drill screen can, and that is what `charts-structure`, `levels-and-breaks`, `the-read`, `mixed-daily` and the eight setup packs are — 300 of the 370 screens. Only `cost-check` (written), `selection` and `risk-calls` are unaffected: all-in cost arithmetic, scanner reading and trade management are not chart timing, and no replay reaches them. Decide the twelve after the replay pilot (stage REPLAY-PILOT), not before.

---

## Replays **[v3]**

The Spot-it tab (`docs/UI.md` §7.7) is fed from `content/replays/<path>/<slug>.yaml`, one
replay per file, format in `docs/schema.md` § Replays and authoring rules in `docs/agent.md`
§3.10. Replays are not a chapter: they are a bank the tab draws from, gated by reading level
against the tiers.

**Where they sit in the linear path.** A `chart-replay` screen also appears inside lessons, and
only where the learner has just been given the card it needs:

| Chapter | Level | Reading level | Why here |
|---|---|---|---|
| 7 | each setup level (2, 3, 4, 6, 7, 10, 11, 12) | 1 | The card is on the screen; the replay is the card applied once, in motion |
| 7 | 8 Mixed Drill I, 13 Mixed Drill II | 2 | Setup named, card from memory |
| 7 | 14 Choosing the Setup for the Day | 3 | Any of the eight — that is the level's whole question |
| 7 | 17 Capstone — A Full Session | 3 | One session, several moments, decoys included |
| 8 | 9 Full-Day Practice, 16 Capstone — A Full Week | 3 | Includes a session that offers nothing (`allow_none`) |

**The bank at launch.** Two replays per Chapter 7 setup card (16), four mixed level-3 replays,
and two `allow_none` sessions — **22 replays per path**, ~1,300 bars authored. That is a
smaller number of files than the drill bank and considerably more work per file; see
`docs/build-plan.md`, stages REPLAY-PILOT and REPLAY-BANK. **[v4.1]** All three paths get
their bank before the release (REPLAY-BANK, ARENA-PATHS); the chart generator proposes the
candidates, and each replay is picked and annotated by hand.

**Replays and drills are not the same job.** Drills build recognition at volume with spaced
repetition; a replay tests whether recognition survives when the outcome is hidden and the
learner has to choose a moment. Both feed the same weak-concept list: a `Phantom` whose decoy
fails on volume marks *volume* weak exactly as a wrong drill answer would.

## Writing order

1. ✅ Scalping Chapters 2 → 3 → 4 (expand v2 content to the v3 level plan)
2. ✅ Chapter 1 (expand — done after Scalping 2–4 so the callbacks are known)
3. ✅ Scalping Chapters 5 → 6 → 7 → 8 (5 and 8 are new)
4. ◐ Scalping drill packs — manifest and tooling done, 1 of 15 packs written
5. **[v4]** Chapter 1 Level 2-4 and Scalping Chapter 8 Level 15, then one correction pass per chapter (`docs/build-plan.md` Phase E)
6. **[v4]** Swing Trading Chapters 2 → 8 — before Day Trading (decision W2: Chapter 1 sends working people to swing, and EU retail traders can hardly scalp cash stocks)
7. **[v4.1]** Day Trading Chapters 2 → 8 — after Swing, before the release (decision E)

One chapter per session, written in blocks of 4–6 levels (`docs/agent.md` §6). After each: validator clean, commit, open a PR, short report, stop.

The order of all work — app, content and release — with a prompt, model and effort per stage: `docs/build-plan.md`.
