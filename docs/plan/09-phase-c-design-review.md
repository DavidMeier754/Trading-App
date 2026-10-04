# Phase C: Design review, the verdicts

_Part of the [build plan](README.md) · §7_

### `DESIGN-REVIEW` – fifty ideas, David's verdicts, the approved ones built

**Goal.** Before the remaining look and learning-loop stages, David sees fifty concrete design ideas for the whole app, decides each one, and the approved ones are built — so every later stage starts from his choices instead of guessing them.

**What happened.**
1. Claude went through every branch, played the app and published an artifact with 50 ideas in six groups (in the lesson, charts and market tools, rewards, the map, home and tabs, first run and the look), each with today's screen, a mockup, a short explanation and an approve box (2026-10-02).
2. David decided all fifty and left notes on many (2026-10-03). The table below is the record.
3. This stage built every approved idea, in the form his notes asked for, wrote his notes into the docs, added `docs/content-todo/` for what the level files need (David: "Don't rewrite any .yaml"), brought this plan up to date and moved the work back to Claude Code sessions (§1).

**David's verdicts** (✅ approved and built here · ✗ not taken · 📄 decided, recorded in the docs, built later)

| # | Idea | Verdict | His note, and where it went |
|---|---|---|---|
| 1 | The decision grid in the chart reveal | ✅ | "Make sure the whole screen is filled … the chart bigger and the box a little smaller." Compact reveal with the 2 × 2 grid (`docs/ui/06-reveal-and-hearts.md` §5.1b, docs/ui/02-lesson-player-layout.md §2). |
| 2 | The future behind frosted glass | ✗ | Keep the hatched box, but the frame holds still: the visible line sits in the middle of the chart from the start and the axis never rescales (§6.4). Built. |
| 3 | An R ruler beside the chart | ✅ | Plus: charts start simple and grow, every element explained (`docs/rules/05-tests-consistency-and-copy.md` §3.8, `docs/content-todo/01-rules-from-the-design-review.md` 1.2); every "Good call" panel right above the key (§2). |
| 4 | Decision keys with a direction | ✅ | §4.3. |
| 5 | The reveal writes on the chart | ✅ | `notes` (§6.4, `docs/level-files/`). |
| 6 | A wrong option explains itself | ✗ | |
| 7 | Numbers that keep their units | ✗ | |
| 8 | Match pairs tied by a thread | ✗ | No colours per pair; make it fun with animation and haptics instead (§4.1). Built. |
| 9 | Pull the card in from the edge | ✗ | |
| 10 | Key terms with a marker | ✅ | "Don't over or underuse them." Marking rules in §8. |
| 11 | A glossary card with a picture | ✅ (changed) | Skills after every lesson → lesson complete → the cards fly into Practice → Skills by chapter with their info cards (§5.3, §7.3). |
| 12 | Scenes as market alerts | ✅ | `alert` (§3 `story`). |
| 13 | A quiet symbol on text-only cards | ✗ | |
| 14 | The mistakes round as a small deck | ✅ | Plus mistakes reviews, "2 or 3 times per level" (read as per chapter, open question X): side stops before each test (§4.5, §7.1). |
| 15 | A briefing card for checkpoints | ✅ | `facts` (§3 `intro`). |
| 16 | The intro shows what is ahead | ✗ | |
| 17 | The opening bell on the chart | ✅ | Only on charts where the open matters, explained (`session_open`, §6.4). |
| 18 | Turn the phone for a big chart | ✗ | |
| 19 | Watch the order eat the book | ✅ | "Too much going on. Keep it simpler." One movement (§4.2 `depth-ladder`). |
| 20 | A ticket that looks like a broker's | ✅ | §6.7. |
| 21 | Scanner rows with a sparkline | ✅ | Less space between Stock and Today (§6.8). |
| 22 | The tape beside the replay | ✗ | |
| 23 | A slider with ticks and detents | ✗ | "Too much for such a simple question." Became the rule "Don't overdo it" (§1, principle 11). |
| 24 | The lesson as a row of answers | ✗ | |
| 25 | The goal track lights the flame | ✗ | |
| 26 | Collect the takeaway | ✅ (as 11) | The skills of idea 11 instead of takeaways. |
| 27 | Confetti only for a perfect run | ✅ | §5.3. |
| 28 | A shelf of chapter medals | ✅ | Account (§7.4). |
| 29 | An emblem for every chapter | ✅ | Plus: great accomplishments get bigger moments (§1, principle 12; §5.4). |
| 30 | Tiers as materials | ✅ | §5.5, §7.5. |
| 31 | Your learning as a price chart | 📄 | Not in Account: "change the Leaderboard tab to an analytics". In the tabs concept (decision V, stage `TABS`). |
| 32 | The chapter card docks while you scroll | ✅ | §7.1. |
| 33 | Tier gates between chapters | ✅ | Only general info: chapter, name, levels; no tier sentence, no time (§7.1). |
| 34 | The level card lists its lessons | ✗ | |
| 35 | Bonus lessons as side stops | ✅ | In the path's own style; the path a sine curve; buttons and spacing kept (§7.1). |
| 36 | Today's goal on the START tag | ✗ | |
| 37 | The ground follows the market clock | ✗ | |
| 38 | The tabs the plan describes | 📄 | "First don't put this into the app. Give me an artifact where you explain the concept with screenshots." The artifact ["Nutrade tabs concept"](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD); decision V. |
| 39 | Hearts with a refill ring | ✅ | All hearts back after five hours; the ring never covers the count (§5.2, §7.2). |
| 40 | Pull down for Today | ✗ | |
| 41 | A Practice tab with something in it | ✅ | Plus a Skills tab and a Mistakes tab, and everything that must be recorded (§7.3). |
| 42 | The Trader Card | ✗ (changed) | The tier card instead, and All stats (§7.4). |
| 43 | Right calls that lost, in your stats | ✅ | All stats (§7.4). |
| 44 | The first decision before anything else | ✅ | §11.1. |
| 45 | The daily goal as three paces | ✗ (dropped) | ~~Goes into the registration screens; David adds it later (§11.1).~~ Dropped on 2026-10-04 with the daily goal: one lesson a day keeps the streak (§5.3). |
| 46 | A calm risk note | ✗ | |
| 47 | The variance simulator | ✗ | "This would imply the numbers given are reliable … the user should do his own research." No odds anywhere (`docs/rules/07-variance-and-typed-numbers.md` §3.11); the simulator is dropped. |
| 48 | Your plan as a real document | ✅ | "Make the design better and don't overdo." Account → Your plan, and the `plan-sheet` (§6.8, §7.4). |
| 49 | A face for titles | ✅ | "The title looks too stretched out": Archivo at its normal width (§10). |
| 50 | Two-tone level symbols | ✅ | §7.1. |
