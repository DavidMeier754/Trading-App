# Phase G: The arena, idea and design

_Part of the [build plan](README.md) · §11_

## 11. Phase G – The practice arena (Nutrade Plus)

**Why this phase exists.** The course promises that afterwards only practice is missing. The arena is where that practice starts, inside the app: charts you trade bar by bar, drills without end, and a practice account whose numbers behave like a trader's. It is also what Nutrade Plus sells (decision I), so it has to be worth paying for.

### The idea

David asked for the concept; `ARENA-DESIGN` turns it into the docs and the screens.

**Free for everyone**
- Every lesson of every path, the checkpoints and the final exams.
- The Practice tab: mistakes, weak concepts, scheduled review, the daily mix.
- Glossary, statistics and the streak (one lesson a day).
- 5 hearts in lessons and tests: all back five hours after the first is lost, or one per finished practice round.
- **The Daily Chart:** one chart a day, the same for everyone on the same path, played bar by bar. You pick your moment or stand aside, set stop and target, then see what happened. The result can be shared as a small grid that shows your decisions, never money. It is a reason to open the app every day, and the arena's shop window.
- **A taste of the arena**, e.g. one replay and ten drills, so you know what Plus contains.
- **Bonus side lessons** on the path (from `FUN-PASS`): short charts to spot the setup, or see that there is none. They pay gems.
- Ads between lessons (`ADS`).

**Nutrade Plus (subscription)**
- **Unlimited hearts.** A test still needs its pass mark.
- **No ads.**
- **The full arena:**
  1. **Replays.** Whole sessions, bar by bar, at your own pace: a scalping morning in 1-minute bars, a day-trading session in 5-minute bars, a swing month in daily bars with one decision each evening. You choose the stock from a small watchlist with context (gap, news, relative volume) and write your plan (entry, stop, target, size) before the trigger. Then you manage the trade, or pass.
  2. **Setup drills.** Short, unlimited reps from your path's playbook cards: a valid setup or not? Where does the stop go? How many shares for 1 %? Trade or pass? Your weak spots from the Practice tab come first.
  3. **The practice account.** A paper account per path that carries across the arena:
     - every trade posts to it with spread, fees and slippage;
     - the journal fills itself;
     - the statistics are the ones Chapter 6 teaches: expectancy, win rate against average R, the R distribution, rule breaks, results by setup and time of day;
     - your plan's daily loss limit ends the session when it is hit;
     - a reset starts a new season, and old seasons stay readable.
  4. **Scenario packs.** Themed sets beyond the paths, e.g. gap days, choppy days, trend days, news spikes, fake breakouts, the last hour, earnings weeks, a losing streak.

**Rules that carry over from the docs**
- **No timer and no autoplay:** the chart moves only when you tap (`docs/ui/01-design-principles.md` §1, docs/ui/05-chart-questions-and-mistakes-round.md §4.4).
- **The decision is graded, the result is shown apart** (§5.1b). Standing aside is never punished.
- **The arena never costs hearts.**
- **Only synthetic charts**, labeled as practice. No real tickers.
- **Money in the arena is practice money**, never framed as income. The statistics screen carries the risk note.
- **Honest odds.**
  - The generator gives clean setups a small positive edge and poor ones a negative edge, with realistic variance: 30–40 % of right calls still lose.
  - Over 50 trades the practice account then shows what Chapter 6 teaches: the process decides the curve.
  - The app says plainly that real markets guarantee no edge. The arena's odds are a training model.
  - **No odds on screen** (David, 2026-10-03, `docs/rules/07-variance-and-typed-numbers.md` §3.11): the model's rates stay inside the generator. The arena shows the learner their own results — their journal, their sample — and never a setup's modeled win rate as if it were how often it works.
- **The arena does not replace paper trading on real-time data** before real money (graduate profile, point 15). The copy never implies otherwise.
- **Lessons never advertise Plus.** The paywall appears only at natural points: when the free part of the arena is used up, when hearts run out in a test (next to the free ways: wait, or practice for a heart), and in Account and Settings (`MONEY`).

**How the charts are made.**
- A chart generator (`CHART-GEN`) produces sessions from a seed: trend and range phases, volatility clusters, the intraday volume curve, gaps, a wider spread at the open, realistic ticks and volumes (`docs/rules/04-numbers-and-realism.md` §3.6).
- The playbook's setups are planted as templates in three qualities: clean, marginal and failed. Some sessions contain nothing worth trading.
- Code checks every chart: valid candles, the planted setup is really there, the right answers can be computed.
- Hand-written replays stay for teaching; the generator makes the volume.
- Synthetic data avoids the license costs of real market data and cannot be mistaken for a signal. Real historical data can be looked at after the release (Phase L).

**Order in this phase:** the design → one replay by hand → the generator → the tab with the Daily Chart → the practice account → drills → the scalping replay bank. Swing and Day Trading get their arena content right after their chapters (`ARENA-PATHS`).

### `ARENA-DESIGN` – the arena on paper

**Goal.** The arena, the Daily Chart and the line between free and Plus are designed and written into the docs before anything is built.

**Scope**
1. **Docs:**
   - a new arena section in `docs/ui/`, replacing §7.7 "Spot it";
   - the formats in `docs/level-files/`: generator templates, seeds, arena sessions, practice-account records;
   - the honesty rules in `docs/rules/10-legal-and-safety.md` §7: synthetic data, the training model's odds.
2. **Screens as clickable prototypes** (skill `prototype`), in the look from `LOOK-SYSTEM`:
   - the arena home;
   - a replay in progress: plan, management, pass;
   - the end of a replay with the process grade;
   - the practice account: statistics and journal;
   - the Daily Chart and its share card;
   - the paywall.
3. **The generator's model on one page:** which properties and parameters per path, how "clean", "marginal" and "failed" are defined, how the odds are set, how a chart is checked.
4. **Free vs. Plus** in one table, with the paywall's places and its texts: a clear price, a clear renewal, a clear way to cancel.
5. **A short spec each** for what `CHART-GEN`, `ARENA-TAB` and `SIM-ACCOUNT` build.

**Not in this stage:** code outside the prototypes.

**Model · effort · sessions:** Fable 5.1 · high (else Opus 5.5 · xhigh) · plan mode · 1

**Prompt**
```
Stage ARENA-DESIGN from docs/plan/17-phase-g-arena-idea-and-design.md.

Read CLAUDE.md, then §0, §1, §4.1 (decision I) and all of Phase G of docs/plan/, docs/ui/ in full, docs/rules/01-what-we-build.md §1, docs/rules/04-numbers-and-realism.md §3.6, docs/rules/06-replays.md §3.10, docs/rules/07-variance-and-typed-numbers.md §3.11 and docs/rules/10-legal-and-safety.md §7, and docs/level-files/07-drill-packs-and-replays.md § Replays.
Show me your plan first and wait for my approval. Use the "prototype" skill for the screens.

Especially important:
- Nothing in the arena may read as a signal or a promise of profit; that the charts follow a training model is disclosed, and no setup's modeled rate is shown as its odds (docs/rules/07-variance-and-typed-numbers.md §3.11).
- No timer, no autoplay: the chart moves only when the learner taps.
- The free part stays genuinely useful, and the paywall never interrupts a lesson.

Open a PR against main.
Report: the design in ten sentences · links to every prototype screen · the free/Plus table · open questions. Then stop and wait for my choice.
```

**You test (~30 min)**
1. Click through the prototypes on your phone: would you pay for this? What is missing?
2. Is the free part still worth using without paying?
3. Read the free/Plus table and the paywall texts.

**Done when** you have approved the design and it is recorded in the docs.

### `REPLAY-PILOT` – one replay, by hand

**Goal.** One replay first, to test the format the arena and the lessons' replay screens are built on.
- If it shows that the format carries, the twelve postponed drill packs stay canceled.
- If not, those packs get written instead.

**Scope:** one replay by hand plus its validator rules.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage REPLAY-PILOT from docs/plan/17-phase-g-arena-idea-and-design.md. Read CLAUDE.md, §1 of docs/plan/02-how-to-work.md and docs/content-todo/01-rules-from-the-design-review.md (Part 1), then follow Appendix E.2 (pilot). A PR instead of a push to main. Report with a test checklist. Then stop.
```

**You test.** Play the replay in the test bench:
- Is the "is it now?" feeling there?
- Are the grades (textbook, early, late, phantom) fair?
