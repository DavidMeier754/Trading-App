# Phase G: The arena, build

_Part of the [build plan](README.md) · §11_

### `CHART-GEN` – the chart generator

**Goal.** An endless supply of realistic, checked practice charts.

**Scope**
1. **The market model** from `ARENA-DESIGN`:
   - bars from a seed, per timeframe (1-minute, 5-minute, daily);
   - trend and range phases, volatility clusters, the intraday volume curve, gaps, a wider spread at the open;
   - realistic ticks and volumes (`docs/rules/04-numbers-and-realism.md` §3.6: price bands, volume magnitudes).
2. **Setup templates** for the scalping playbook cards (Chapter 7), each in three qualities (clean, marginal, failed), plus sessions without a setup. Swing and Day Trading templates follow in `ARENA-PATHS`.
3. **Outcomes with honest odds:** the edge per quality is a parameter. Over large samples, the share of right calls that lose stays within 30–40 % (§3.11).
4. **Checks by code:**
   - valid candles, ticks and volumes;
   - a detector confirms the planted setup, and finds nothing in a session without one;
   - the correct answers (entry, stop, size for 1 %, R) are computed, never set by hand;
   - property tests over at least 10,000 seeds, with the odds measured over the sample;
   - a render test over a sample of seeds.
5. **Deterministic:** the same seed gives the same chart on every device. The model carries a version number, so old seeds (a shared Daily Chart, a bug report) still open the same chart.
6. **Fast:** a session is generated on the phone in well under a second, on a cheap Android device too.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2–3

**Prompt**
```
Stage CHART-GEN from docs/plan/18-phase-g-arena-build.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/17-phase-g-arena-idea-and-design.md (Phase G) and the "CHART-GEN" section in docs/plan/18-phase-g-arena-build.md in full, plus the generator spec from ARENA-DESIGN (docs/ui/, docs/level-files/), docs/rules/04-numbers-and-realism.md §3.6 and docs/rules/07-variance-and-typed-numbers.md §3.11, and the scalping Chapter 7 cards in docs/course/.
Show me your plan first (model, templates, checks) and wait for my approval.

Especially important:
- Every correct answer is computed by code, never written by hand.
- Measure the odds over at least 10,000 seeds and put the table in the report.
- The same seed gives the same chart everywhere; test it.

Open a PR against main and get every check green.
Report: what you built · the odds table · 12 sample charts (links: clean, marginal, failed, none) · the timing on a cheap device · my test checklist · open questions. Then stop.
```

**You test (~20 min)**
1. Look at the 12 sample charts: do they look like real charts, or like computer charts?
2. Can you see the setup in the clean ones? Is the marginal one really borderline?
3. Is there really nothing worth trading in the sessions without a setup?

### `ARENA-TAB` – the arena tab and the Daily Chart

**Goal.** The arena is in the app, and everyone gets one chart a day.

**Scope**
1. **The tab** as designed in `ARENA-DESIGN`. It replaces "Spot it" (`docs/ui/13-tiers-replays-and-plus.md` §7.7):
   - replays chosen by weak concepts;
   - tier-gated by reading level;
   - the strip at the end of a session.
2. **The Daily Chart:**
   - one chart per day and path, from a date seed, the same on every device;
   - the result grid;
   - sharing as an image or as text.
3. **The Plus gate:** every arena part asks one function whether it is unlocked. Until `MONEY`, test builds unlock everything.
4. **Never costs hearts, never timed.**
5. **Bonus side lessons** (`FUN-PASS`): from here on the generator fills them, with a new chart each time.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage ARENA-TAB from docs/plan/18-phase-g-arena-build.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "ARENA-TAB" section in docs/plan/18-phase-g-arena-build.md in full, plus the arena section of docs/ui/05-chart-questions-and-mistakes-round.md, §4.4, and docs/level-files/07-drill-packs-and-replays.md § Replays.
Build exactly that scope.

Especially important:
- The Daily Chart is the same chart for everyone on the same path and day, and the same on every device (date seed).
- The share card shows decisions, never money or profit.
- Every Plus gate goes through one function; until MONEY, test builds unlock everything.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min + 1 week)**
1. Open the arena tab and play two replays: is the strip at the end right?
2. Play the Daily Chart on two devices on the same day: it is the same chart.
3. Share your result: does the card look good, and does it show no money?
4. Play the Daily Chart every day for a week: would you come back for it?

### `SIM-ACCOUNT` – the practice account

**Goal.** A practice account whose numbers behave like a trader's. This is where Chapter 6 becomes your own statistics.

**Scope**
1. **One paper account per path.** The starting balance comes from your plan card.
2. **Orders as the course teaches them:**
   - market, limit, stop, bracket (entry, stop and target at once);
   - fills with spread, slippage and fees as categories, never a real broker's price list.
3. **Your plan applies:**
   - risk per trade, the trade cap, and the daily loss limit, which ends the arena session when hit;
   - a rule break is recorded, never silently blocked.
4. **The journal fills itself:** setup, entry, stop, exit, R, grade, your note.
5. **Statistics** as in Chapter 6:
   - expectancy, win rate against average R, the R distribution, rule breaks;
   - results by setup and by time of day, the equity curve in R;
   - every number shows its sample size ("after 12 trades this says little").
6. **Seasons:** a reset starts a new season; old seasons stay readable.
7. **Stored locally;** `BACKEND` syncs it.
8. **Unit tests** for fills, P/L, R and every statistic, using the course's own worked examples.
9. **[CONTENT-REVIEW] Test my card** (item P-02 of `docs/content-todo/05-content-review.md`): pick one of your playbook cards, or the one you wrote in Chapter 9, and play replays bar by bar; mark the minute your card fires, set the stop and target, watch it play out. Every attempt is a row in that card's own sheet, with a cost you set; the sheet shows the count, the average trade in R and how many rows are still missing before it says anything. The app never says whether the card is good — the rows do.

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 2

**Prompt**
```
Stage SIM-ACCOUNT from docs/plan/18-phase-g-arena-build.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/17-phase-g-arena-idea-and-design.md (Phase G) and the "SIM-ACCOUNT" section in docs/plan/18-phase-g-arena-build.md in full, plus the arena section of docs/ui/, docs/rules/04-numbers-and-realism.md §3.6, docs/rules/07-variance-and-typed-numbers.md §3.11 and docs/rules/10-legal-and-safety.md §7, and the scalping Chapter 6 outline in docs/course/.
Show me your plan first and wait for my approval.

Especially important:
- Every number is computed the way the course teaches it; the unit tests use the course's own worked examples.
- Every statistic shows its sample size, and nothing reads as a promise.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min)**
1. Trade ten arena replays: does the journal fill itself correctly?
2. Break your own daily loss limit on purpose: the session ends, and the break is recorded.
3. Check two results by hand, in $ and in R.
4. Look at the statistics: are they understandable, and does the sample-size note show?

### `DRILLS` – two packs and generated drills

**Goal.**
- The two packs `selection` and `risk-calls`, which no replay replaces.
- The arena's unlimited setup drills for scalping.

**Scope**
1. Both packs are written in the session, following Appendix E.4. The Batch API is not needed for this.
2. Generated setup drills for the scalping cards, from the `CHART-GEN` templates:
   - valid setup or not, the stop, the size, trade or pass;
   - charts with no valid entry at all, where passing is the answer (your critique in `LOOK-BRIEF`);
   - weak concepts first.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage DRILLS from docs/plan/18-phase-g-arena-build.md. Read CLAUDE.md, docs/level-files/07-drill-packs-and-replays.md § Drill packs, the arena section of docs/ui/, docs/content-todo/01-rules-from-the-design-review.md (Part 1) and docs/plan/02-how-to-work.md §1 and the "DRILLS" section in docs/plan/18-phase-g-arena-build.md. Write scalping-selection (25) and scalping-risk-calls (25) following Appendix E.4, validated under --strict, and build the generated setup drills for the scalping cards from the CHART-GEN templates. PR, report with a test checklist. Then stop.
```

**You test.**
1. In the Practice tab, play five questions from each pack.
2. In the arena, play twenty generated drills: are they fair, and do they vary?

### `REPLAY-BANK` – 22 replays for scalping

**Goal.** The 22 replays per path that `docs/course/` (§ Replays) plans, here for scalping. Only if `REPLAY-PILOT` has shown that the format carries.

**Scope**
- The generator proposes candidate sessions for each setup card and reading level.
- Claude picks them, annotates them (the moments, the decoys, the explanation for each decision) and checks them against Appendix E.2.
- A replay is written from scratch only where the generator cannot produce the case.

**Model · effort · sessions:** Opus 5.5 · high · ~4 (about six replays per session)

**Prompt** (per session)
```
Stage REPLAY-BANK from docs/plan/18-phase-g-arena-build.md. Read CLAUDE.md, docs/plan/02-how-to-work.md §1 and the "REPLAY-BANK" section in docs/plan/18-phase-g-arena-build.md and docs/content-todo/01-rules-from-the-design-review.md (Part 1), then follow Appendix E.2 (bank) for the cards [cards] at reading level [1/2/3], starting from CHART-GEN candidates. PR, report with a test checklist. Then stop.
```

**You test.** Play two replays per session in the arena.
