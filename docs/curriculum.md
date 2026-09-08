# curriculum.md — Chapter and level plan

Authority for *what* is taught where. Rules live in `docs/agent.md`, UI in `docs/UI.md`, format in `docs/schema.md`.
Every path has 6 chapters. Chapter 1 is shared and ends with the path choice.

Legend: `T` = test, `F` = final exam, `R` = repetition sub, numbers in brackets = sub-levels.

---

## Chapter 1 — Market Basics (shared, `content/shared/chapter-01-market-basics/`) — status: written

Goal: the user makes a simulated trade in the first five minutes, then learns just enough about markets to choose a path.

| Level | Title | Subs | Teaches |
|---|---|---|---|
| 1 | Your First Trade | 1-1, 1-2, 1-3 R | Buy low / sell high on a line chart, price, position, profit & loss, buy/wait decisions; what moves price (buyers vs sellers); mixed practice with a second simulated trade |
| 2 | What You're Actually Buying | 2-1, 2-2 | Stock = share of a company, ticker, exchange; reading a quote card (price, change vs previous close, %), volume |
| 3 | Who's On the Other Side | 3-1 | Retail traders, institutions, market makers (they quote two prices and keep the gap) |
| 4 | Volume, Liquidity, Volatility | 4-1, 4-2, 4-3 R | Volume as activity, liquidity as ease of getting in/out; volatility as size/speed of moves and why it is not liquidity; mixed practice |
| 5 | When the Market Is Open | 5-1 | Sessions (pre-market, regular, after-hours) per market profile; thin sessions = jumpy prices |
| 6 | Checkpoint | 6-1 T | 10 questions on Levels 1–5 |
| 7 | Getting Access | 7-1 | Broker, brokerage account, paper trading, fees exist, no guarantees; market-profile regulation note |
| 8 | Long and Short | 8-1, 8-2 | Long = profit when price rises; short = borrow, sell, buy back, profit when price falls; risk asymmetry; first true Long / Short / No-trade decisions |
| 9 | Three Ways to Trade | 9-1, 9-2 R | Holding period defines style; scalping / day / swing (time, screen time, temperament); trading vs investing; mixed practice |
| 10 | The Big Picture | 10-1 | Bull/bear markets as context, trend vs single-day moves, news as the trigger of sudden supply/demand shifts |
| 11 | Chapter Review | 11-1 R | Story-driven review across the chapter |
| 12 | Final Exam | 12-1 F | 12 questions → badge → path choice |

12 levels, 19 sub-levels.

---

## Path chapters — shared skeleton

| Chapter | Title | Core content (all paths) | Path-specific flavor |
|---|---|---|---|
| 2 | Charts 101 | Candlesticks (open/high/low/close, body/wick), timeframes, volume bars, trend up/down/sideways, support & resistance first look, first `chart-decision` levels | Scalping: 1-min / 5-min charts, opening minutes. Day: 5-min / 15-min, intraday structure. Swing: daily / weekly, gaps and earnings |
| 3 | Orders, Costs & Position Size | Bid/ask/spread, market/limit/marketable-limit/stop orders, slippage, fees, position size, risk per trade, order ticket practice | Scalping: spread vs target, execution speed, Level 2 intro, realistic frequency costs (EU note). Day: stop placement, PDT note. Swing: gap risk, overnight, limit entries |
| 4 | Chart Reading II | Support/resistance, trend lines, moving averages, VWAP (intraday paths), volume confirmation, key candle patterns, multiple timeframes; **fan-out lives here** | Scalping: tape/Level 2, VWAP & levels, opening drive. Day: candles / S-R / volume → VWAP. Swing: VCP / cup-and-handle / flat base → moving averages |
| 5 | Risk & Psychology | Stop-loss discipline, R-multiples, expectancy, position sizing rules, journaling, tilt, rules-based trading, when to stop for the day | Scalping: loss limits per session, overtrading. Day: daily max loss, revenge trading. Swing: holding through noise, earnings risk |
| 6 | Strategies & Playbook | 4–6 complete setups taught as playbook cards (context, entry, stop, target, invalidation) with many `chart-decision` drills, then a capstone scenario series | Scalping: VWAP bounce, opening-range scalp, momentum continuation, mean reversion at levels. Day: ORB, ABCD, VWAP reclaim, bull flag, reversal. Swing: VCP breakout, pullback to MA, base breakout, gap-and-go |

Each path chapter: 8–14 levels, one Test mid-chapter, one Final Exam. Every level from Chapter 2 on has at least one visual/interactive screen.

---

## Scalping — Chapter 3: Orders, Costs & Position Size (`content/paths/scalping/chapter-03-orders-costs-position-size/`) — status: written

Replaces the old "Chapter 2 — Order Execution and Spread" (17 levels → 10 levels, adds stop orders, position size, marketable limit orders, Level 2 intro, realistic cost scale).

| Level | Title | Subs | Teaches |
|---|---|---|---|
| 1 | Bid, Ask, Spread | 1-1, 1-2 | Bid/ask/spread on the quote panel, market makers earn it; the spread as a round-trip cost with share counts |
| 2 | The Scalper's Enemy | 2-1, 2-2 R | Spread vs target size, spread vs expected move, liquidity → tight spreads, spreads move; practice |
| 3 | Market, Limit, Marketable Limit | 3-1, 3-2, 3-3 R | Market fills at ask/bid; limit waits; marketable limit = speed with a cap (the scalper's entry); limit exits and unfilled risk; order-ticket practice and spot-the-mistake |
| 4 | The Stop Order | 4-1 | Stop-loss, stop-market vs stop-limit, where the stop lives relative to entry |
| 5 | How Many Shares? | 5-1, 5-2 | Position value, risk per trade = shares × stop distance, the 1 % rule, working backwards from risk to shares |
| 6 | Checkpoint | 6-1 T | 10 questions on Levels 1–5 |
| 7 | Slippage, Speed & Fees | 7-1, 7-2 | Slippage in both directions, execution speed as time, fees per trade/share, frequency at realistic scale, EU/US note |
| 8 | Inside the Quote | 8-1 | Level 2 / order book and time & sales at a glance (deeper in Chapter 4) |
| 9 | The All-In Check | 9-1, 9-2 R | Cost stack vs target with share counts, reliability and fallback, the pre-trade checklist; worked examples and cost-aware decisions |
| 10 | Final Exam | 10-1 F | 12 questions → badge |

10 levels, 17 sub-levels.

---

## Scalping — Chapters 2, 4, 5, 6 — status: planned (after review)

**Chapter 2 — Charts 101 (Scalping):** candle anatomy; 1-min vs 5-min; volume bars; trend and range; first support/resistance; opening minutes; 8–10 levels with a `chart-decision` in every level.

**Chapter 4 — Reading Fast Markets:** VWAP, intraday levels, momentum vs exhaustion candles, tape reading basics, opening drive; fan-out: tape reading / VWAP & levels / opening drive → merge "the scalper's map".

**Chapter 5 — Risk & Psychology for Scalpers:** per-trade and per-session loss limits, R-multiples, expectancy at high frequency, overtrading, tilt, journaling, review routine.

**Chapter 6 — Scalping Playbook:** VWAP bounce, opening-range scalp, momentum continuation, mean reversion at a level, failed-breakout fade; capstone scenario series.

## Day Trading — Chapters 2–6 — status: planned
## Swing Trading — Chapters 2–6 — status: planned
