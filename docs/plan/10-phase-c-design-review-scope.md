# Phase C: Design review, scope and status

_Part of the [build plan](README.md) · §7_

**Scope** (all built in this stage's PR)
1. **The chart decision** (`docs/ui/05-chart-questions-and-mistakes-round.md` §4.3, docs/ui/06-reveal-and-hearts.md §5.1b, docs/ui/08-quotes-and-charts.md §6.4): the frame that holds still; keys with a direction glyph; after the choice the entry, stop and target lines, playback ending at the first one touched; the R ruler from the lesson that teaches R; the chart notes; the open marker; the compact reveal with the decision grid and the result line without a rate; the chart as large as the screen allows; every reveal right above the key.
2. **The lesson flow:** ~~hearts only in Checkpoints and Final Exams (W1)~~ hearts in every lesson and test (David's change after his test, 2026-10-04); the mistakes round with its deck (W25); "What you learned" with the lesson's skills; confetti only for a perfect run; back home, the skills fly into the Practice tab.
3. **Screens:** match without colours, with the snap, the rising notes and the closing wave; the depth ladder's walk through the book; the order ticket like a broker's; scanner rows with sparkline and volume bar; the scene as a market alert; the checkpoint briefing; the plan sheet as a document; the term marker and its sheet; the `decision-grid` visual.
4. **Rewards:** a medal with its own emblem for every chapter, as a bigger moment; the tier card in its material, turning over.
5. **Home:** the map as a sine curve; side stops (mistakes reviews now, bonus lessons as soon as their files exist); the docking chapter bar; chapter gates; two-tone symbols; the title face; the heart ring with all hearts back after five hours; the Practice tab (Daily mix with spaced repetition and weak spots, Skills, Mistakes; a finished round gives a heart back); the Account page (tier card, medal shelf, All stats with the variance view, Your plan).
6. **First run:** the first trade, once, before anything else.
7. **The record behind it** (`docs/ui/12-practice-and-stats.md` §7.3): every graded question, mistakes, chart decisions, skills, the plan's dates, the longest streak — kept with the progress, `progress.v1` migrated.
8. **Tools:** validator rules and self-test cases for every new field (`docs/level-files/`); bonus files in the content index; Settings → Testing → **New designs** and **Show the first trade**; new rows on the Animations page.
9. **Docs:** `docs/ui/`, `docs/rules/`, `docs/level-files/`, `docs/course/`, the new `docs/content-todo/`, this plan, `CLAUDE.md` and `README.md`.
10. **Not in the app:** the tabs concept (ideas 31 and 38) as an artifact for David's choice (decision V).

11. **After David's test (2026-10-04):** hearts in every lesson; one lesson a day keeps the streak; the path as a true sine; the streak moments in the flow and the flame catching; the medal landing on the shelf; Settings → Testing → **Reset streak**; and the skills: `content/skills.yaml` with every skill and its info, a `skills` line in every level file, `tools/skills.py`, the validator's rules (`docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills").
12. **Nothing on top of anything** (David, after his test: "the Start Box over the level overlaps the optional side levels. Find every instance where something like this happens in the app and fix it"): side stops placed by search (`src/home/mapLayout.ts`), chart labels that never cover each other, the axis or the zone's pill, the scanner in two lines on the smallest phones, the plan card's suggestion key under its line, the lesson bar's targets apart; and the check that keeps it so: `overlap` and `offscreen` in the UI check and in `npm run smoke` (`docs/ui/15-theming-and-accessibility.md` §10).

13. **David's design picks** (2026-10-04: "implement all that don't contradict the already written features"). Another session had made 37 more ideas into an artifact, "Nutrade design picks"; David marked each Add or Leave out. Every Add is built (the typed theory taken out again at his word) and every idea now carries its verdict in Settings → Testing → Design suggestions ("In the app" or "Not in your mix"). The record:

    | Group | Idea | Verdict | Built as (`docs/ui/`) |
    |---|---|---|---|
    | Answering | Swipe to make the call | Add | A swipe across the decision chart makes the call, Long right, Short (or Wait) left; the keys stay (§4.3). |
    | Answering | The answer turns over | Add, "not on every answer" | The chosen answer turns over to its verdict on the lesson's last question only (§5.1). |
    | Answering | Answers with depth | Add | Answer rows and True / False stand on an edge, sink when pressed and the chosen one stays down (§4.1). |
    | Answering | Slide to place the trade | Add | An order ticket is placed with a slide in the key's place; a tap slides it home (§6.7). |
    | Answering | Run a finger along the chart | Add | Theory charts and a chart decision once played: crosshair, dot and price tag (§6.4). |
    | Answering | Theory typed out like a terminal | Add, then taken out ("Remove the terminal typing", the same day) | Built, then removed: the body shows at once (§3). The preview stays, marked "Not in your mix". |
    | Rewards | Lesson complete as a trade receipt | Add, "5+ different designs", "another suggestion tab just for such designs" | Six win screens that take turns — ring, receipt, split-flap board, candle, equity curve, ticker quote — and a **Win screens** group in Design suggestions (§5.3). |
    | Rewards | Split-flap numbers | Add | One of the six (§5.3). |
    | Rewards | Gems fly to the counter | Add | From the chest into a gem counter that counts them in (§5.3). |
    | Rewards | A badge you can tilt | Add | The chapter medal leans to the finger, foil light and rainbow follow; a tap wobbles it (§5.4). |
    | Rewards | Confetti of candles and coins | Add | Every confetti burst (§5.3). |
    | Rewards | A chest for a perfect lesson | Add | The first perfect run of a lesson: a chest before the summary, three taps or the key open it, five gems (§5.3). |
    | Map | The level card grows out of its button | Add | §7.1. |
    | Map | Chapter cards with a sparkline | Add | Right answers per level played, in place of the bar (§7.1). |
    | Map | All eight chapters at a glance | Add | A tap on the banner: the mountain of chapters; a tap on one goes to it (§7.1). |
    | Bars | Tabs with a sliding pill | Add (breaks §11.2's "never a slide", David's choice) | The pill slides; the screen still switches at once (§11.2). |
    | Bars | The flame grows with the streak | Add | Spark, flame, blaze, blue flame, in the top bar and on the streak screens (§7.2). |
    | Bars | Top bar on the tab columns | Add | §7.2. |
    | Numbers | Numbers on a dial | Add | The `slider` question's track is a dial, − and + beside it (§4.1). |
    | Numbers | A combo counter | Add | "×3" and up beside the lesson's bar, in place of the run's flame (§2). |
    | Numbers | Practice as a heat map | Add | Account → Your days, eighteen weeks (§7.4); the progress keeps lessons per day. |
    | LOOK-BRIEF | Answers keyed A to D | Add (was not taken in `LOOK-BRIEF`) | §4.1, §10. |
    | LOOK-BRIEF | Numbers that count up · The step count | Add | Already in the app. |
    | Left out | Progress bar of candles; right answer breaks out; finished levels turn into coins; path as a price line; ticker under the top bar; sloshing progress bar; a heart that breaks; the Terminal, Newsprint, Glass and Arcade looks; small caps; board-style map | Leave out | Kept as previews, marked "Not in your mix". |

**Not in this stage:** any other change to a level file or the test bench (David: "Don't rewrite any .yaml" — the `skills` line is the exception he asked for on 2026-10-04); the tab set (decision V); sharing the plan or a card as an image (`ONBOARDING`, `STATS`).

**Status** (2026-10-04): built, waiting for David's test. The PR is stacked on PR #21 (`LOOK-SYSTEM`, session 2), whose branch it starts from; it merges after #20 and #21. The tabs concept is published: ["Nutrade tabs concept"](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD).

**Also done on the way** (found while checking the built screens):
- The words on a chart stay readable: labels sit over the bars on a rim of the page's colour, a level's label takes the end of its line that covers the fewest bars, the stop's and target's labels clear the "decision" tag, and notes and the outcome tag keep off every label (`docs/ui/08-quotes-and-charts.md` §6.4).
- The docked chapter bar names the chapter whose card it covers, not the one before it, and that card no longer shows past the bar's corners (§7.1).
- A test build opened on any deep link skips the first trade (§11.1).
- Animations has a **Mistakes round** row (§11.5).

**Left for later stages** (each is in its stage's scope):
- ~~The medal just won shining once on the shelf → `STATS`.~~ Built after David's test (2026-10-04).
- ~~The one-line meaning on each skill chip of "What you learned" → `GLOSSARY` (it needs `content/glossary.yaml`).~~ Built after David's test (2026-10-04), from `content/skills.yaml`.
- "What happened next" instead of "NEXT 5 BARS" over the hidden bars, the first trade included → `LOOK-COMPONENTS`.
- The new fields in the level files (`stop`, `target`, `notes`, `session_open`, `alert`, `facts`, scanner `spark`, ladder `shares`, the bonus lessons and the spot-it levels) → the content sessions, from `docs/content-todo/`. (`skills` is written: 2026-10-04.)
- The tab set → `TABS`, from decision V.

**Model · effort · sessions:** Opus 5.5 · high · 1, plus a session for fixes if the test finds any.

**Prompt** (for a follow-up session, e.g. fixes after the test)
```
Stage DESIGN-REVIEW (fixes) from docs/plan/09-phase-c-design-review.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "DESIGN-REVIEW" section in docs/plan/09-phase-c-design-review.md and docs/plan/10-phase-c-design-review-scope.md in full, docs/ui/ in full and docs/content-todo/.
Fix exactly these findings from my test: [list]. Change no level file and not the test bench.

Get every check green on the stage's PR.
Report: what you changed · check results · my test checklist for the fixes with real links · open questions. Then stop.
```

**You test (~45 min)** — Claude puts the exact links in the report.
1. A chart decision in Chapter 1 and one in Scalping Chapter 2: the chart fills the screen, the axis never changes while it plays out, the keys carry their arrows, and the reveal is a small panel right on the key with the grid and its dot.
2. Settings → Testing → New designs: the market alert; stop and target with the R ruler, two chart notes and the open; the same setup stopped out (right call, lost); the decision grid card; scanner rows with their day; the ladder's walk; the order ticket; the match.
3. A lesson with two deliberate mistakes: no heart lost, the deck, the round, then "What you learned", lesson complete without confetti, and back home the cards fly into Practice.
4. A perfect lesson: the gold ring and confetti behind it.
5. A checkpoint: the briefing card, hearts lost on mistakes; all hearts back after five hours (Settings → Testing → Refill hearts resets it).
6. The map: the sine curve, a mistakes review beside the path before the checkpoint, the chapter bar docking under the banner, the chapter gate, two-tone symbols, the heart ring and its tap.
7. Practice: Daily mix, Skills (tap one), Mistakes (play them).
8. Account: the tier card, the medal shelf, All stats with the variance view, Your plan.
9. Animations: Chapter complete (the medal), New tier (the card turning over), Skills into Practice and Mistakes round. Is the medal a big enough moment?
10. A fresh start (Settings → Reset, or a private window): the first trade comes first.
11. The [tabs concept](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD): choose (decision V) and copy the line for `TABS`.

**Done when** David has tested and the PR is merged after #20 and #21.
