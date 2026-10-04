# Order tools and other visuals

_Part of the [ui reference](README.md) · §6.5–6.10_

### 6.5 Bars, timelines, stacks
- Horizontal bar chart: bars grow from 0 (400 ms, staggered 80 ms).
- Session ribbon: horizontal ribbon with three colored segments (pre-market, regular, after-hours) and a "now" marker; times from the market profile. **[v4]** Drawn to scale in hours, with "now" in the learner's own time zone.
- Cost stack: stacked bar (spread + slippage + fees) against a target-profit bar with the consumed percentage. Always labeled with the share count.

### 6.6 Order book ladder (Chapter 3+)
Two columns of price levels with size bars; best bid/ask rows highlighted; animates as orders arrive. **[v3]** interactive in `depth-ladder`: rows are tappable and an order can be "walked" down the book to show the fill. **[DESIGN-REVIEW]** Built for `depth-ladder` (§4.2): after Check the order walks the book one level at a time, each size bar draining as it fills, and the last fill is marked. One movement, nothing beside it.

### 6.7 Order ticket mock
Side toggle (Buy/Sell), order-type chips (Market / Limit / Stop), quantity, price field, submit. Used by `walkthrough`, `hotspot`, `spot-mistake`, **[v3]** `order-build`, and hands-on practice.
**[DESIGN-REVIEW] Like a broker's ticket** in `order-build`: the ticker in the head, a Buy / Sell switch whose chosen half turns green (buy) or red (sell), the order types as a segmented row, then quantity, limit and stop each as a labelled row with its options as a segmented choice, and at the bottom the estimated cost ("≈ $27,345 for 1,500 shares") once quantity and a price are chosen. Practising on something that looks like a real ticket makes the first real one familiar (Chapter 8). The look changes; the slots, chips and grading stay as `docs/level-files/` has them. **Built:** every field's options sit in its row, so a tap fills it directly (the chip tray below the fields is gone for `order-build`; `journal-row` keeps it) and a tap on the chosen segment empties it; the price row is called "Limit price" or "Stop price" after the order type chosen; the estimate only appears on tickets with both a share count and a price. After Check each row is graded on its own: the chosen segment green or red, and in a wrong row the intended one outlined with a dashed line.
**[DESIGN-REVIEW, picks 2026-10-04]** **Slide to place the trade.** The key under an order ticket is a track: the learner slides a knob along it, as a broker's app asks before an order goes in. It clicks at every quarter; let go past most of the way, the order is placed (the check); short of that it slides back. A tap anywhere on it slides it home on its own, and a screen reader's activation does too. It is the key's height exactly, so nothing moves when it gives way to "Got it". `src/lesson/SlideKey.tsx`.

### 6.8 New components **[v3]**

| id | What it is | Used by |
|---|---|---|
| `scanner-table` | 4–8 rows: ticker, price, % change, relative volume, float, spread, catalyst tag — a table shows only the columns its rows carry. Sortable in demo mode; rows tappable, and a `scanner-pick` keeps its answer-card look after the reveal. **[DESIGN-REVIEW]** Each row shows a small sparkline of its day beside the ticker (the row's `spark` when the file gives one; otherwise a plain line from the previous close to today's change, never invented wiggles), relative volume as a short bar under "4.1×", and the catalyst as a tag. The ticker and today's change sit close together (David: "not so much space between the Stock and Today"). **[DESIGN-REVIEW, 2026-10-04]** The table measures itself: every column fits in one row on most phones; with less room the sparkline goes first (the percentage stays); on the narrowest screens (a 320 pt phone with five columns) each row takes two lines -- the stock and its move, then "RVol 4.9×  Spread 0.03  Float 740M" -- rather than squeezing numbers into each other. | `scanner-pick`, Chapter 5 theory |
| `journal-table` | A journal with columns for setup, entry, stop, exit, R, grade, note. Rows fill in one at a time; signed numbers in their sign's colour. A first column keyed `""` is a row label, so the same table carries a small comparison grid (Chapter 1 Level 17-2). | `journal-row`, Chapter 6 |
| `internals-panel` | The index chart, sector strength, breadth reading and a risk-on/risk-off tag, as one compact panel. | Chapter 5 market-context levels |
| `hotkey-pad` | A stylised key grid (buy, sell, size, cancel, flatten) that lights up as a sequence plays. | Chapter 8 execution levels |
| `stats-card` | The learner's own numbers: decision accuracy by setup, best day type, weak concepts. | Stats screen, Chapter 8 |
| `r-tracker` | A running R strip for a simulated session: each trade as +/− bars against the day's limit. | Chapters 6 and 8 capstones |
| `plan-sheet` | The user's own saved plan (limits, size, playbook cards), editable. A line with a literal value in the level file is a specimen; a line without one renders what the learner wrote, and may only name a key an earlier `plan-card` has already asked for. **[DESIGN-REVIEW]** Drawn as a page of a document: a small heading, then one line per field — the label, a dotted leader, the value in the number face. No boxes, no colours, nothing else on it (David: "don't overdo"). A line the learner has not filled yet shows a faint dash ("not set yet" to a screen reader). The whole plan reads back the same way from Account → Your plan (§7.4). | `plan-card` |
| `decision-grid` **[DESIGN-REVIEW]** | The 2 × 2 grid of decision against result (right call / not this time × won / lost), each cell labelled. Optional `cell` (`right-won`, `right-lost`, `wrong-won`, `wrong-lost`) marks one with the dot the reveal uses (§5.1b). | Chapter 1 Level 2-4, glossary |
| `candle-anatomy` **[v4]** | One large candle with open, high, low, close, body and both wicks labelled; the labels arrive one at a time on entry (all at once under reduce-motion). | Chapter 2 Level 1, glossary |
| `trade-plan` **[v4]** | Entry, stop and target as labelled lines over a small chart, with the distances in cents, the R-multiple of the target and a risk/reward bar. | Chapters 3, 6, 7 |

### 6.9 Illustration
**There is no mascot and no character cast.** v2 and v3 up to this point specified one
recurring mascot with six poses, plus five recurring characters — retail trader, market
maker, institution, bull, bear — that gave concepts a face across chapters. That is
withdrawn, and with it the `story` screen's `character` field, which was the only place the
cast was ever named (198 sub-levels carried it; none of them do now). Nothing in the app
renders a character, and no new screen type should introduce one without reopening the
decision in `docs/rules/01-what-we-build.md` §1.

What a screen has instead: its own copy, its data component (§6) and the verdict colour of
the reveal (§5.1). A `story` frame carries its speaker in the sentence — *"9:31. You're
watching XYZ"* needs no avatar to say who is watching.

- Illustration style, where a screen does illustrate something: flat, friendly, one accent
  color + neutrals.

### 6.10 ~~Variance simulator (`variance-sim`)~~ **[v4], dropped [DESIGN-REVIEW]** — the decision grid instead

The simulator was to teach `docs/rules/07-variance-and-typed-numbers.md` §3.11 with ten trades of one good setup at a stated win
rate. David dropped it on 2026-10-03, before it was built: "this would imply the number given (like
6/10 are right) are reliable and I don't want this. The user should do his own research on how often
strats work for him." Any fixed rate on a screen reads as a fact about the market, and the app never
says how often a setup or a strategy works (`docs/rules/07-variance-and-typed-numbers.md` §3.11).

What teaches variance instead:
- **The learner's own decisions.** Lesson 1·2-4 lets them make a right call that loses, and the reveal
  shows it (§5.1b).
- **The `decision-grid` visual** (§6.8): decision against result, four cells. The reveal of every chart
  decision puts a dot in it, so the idea comes back hundreds of times.
- **Their own numbers.** The lesson summary counts decisions and results apart (§5.3), the variance view
  in Account shows how many of the learner's right calls won and how many lost (§7.4), and Chapters 6
  and 8 teach how to measure a method from one's own journal and simulator sample.
