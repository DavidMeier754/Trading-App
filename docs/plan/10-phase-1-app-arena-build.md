# Phase 1, app lane – the Arena built, and the fun pass

_Part of the [build plan](README.md)_

The arena in the app, from the tab and today's chart to the practice account and the drills. `FUN-PASS` is the last stage of the app lane in Phase 1.

### `ARENA-TAB` – the arena tab and the Daily Chart

**Goal.** The arena is in the app, and today's chart is there for everyone: a new one every day.

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
6. **The chart calendar** (David, 2026-10-05): every Daily Chart played fills its day with the decision's grade (good call, reasonable, not this time, stood aside); a full month earns a medal of its own. In the arena, and its month on You.
7. **Today's chart pays gems** (`LOOP-DAILY`), and learners with reminders on can switch on "today's chart is ready" (off by default).
8. **No quotas:** replays, drills and scenario packs as many as the learner likes, within what the free part or Plus opens.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage ARENA-TAB from docs/plan/10-phase-1-app-arena-build.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "ARENA-TAB" section in docs/plan/10-phase-1-app-arena-build.md in full, plus the arena section of docs/ui/05-chart-questions-and-mistakes-round.md, §4.4, and docs/level-files/07-drill-packs-and-replays.md § Replays.
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
4. Play the Daily Chart on three days: the calendar fills and the gems go up.
5. Play it every day for a week: would you come back for it?

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
Stage SIM-ACCOUNT from docs/plan/10-phase-1-app-arena-build.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/09-phase-1-app-arena-design-and-generator.md ("The Arena idea") and the "SIM-ACCOUNT" section in docs/plan/10-phase-1-app-arena-build.md in full, plus the arena section of docs/ui/, docs/rules/04-numbers-and-realism.md §3.6, docs/rules/07-variance-and-typed-numbers.md §3.11 and docs/rules/10-legal-and-safety.md §7, and the scalping Chapter 6 outline in docs/course/.
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
Stage DRILLS from docs/plan/10-phase-1-app-arena-build.md. Read CLAUDE.md, docs/level-files/07-drill-packs-and-replays.md § Drill packs, the arena section of docs/ui/, docs/content-todo/01-rules-from-the-design-review.md (Part 1) and docs/plan/02-how-to-work.md §1 and the "DRILLS" section in docs/plan/10-phase-1-app-arena-build.md. Write scalping-selection (25) and scalping-risk-calls (25) following Appendix E.4, validated under --strict, and build the generated setup drills for the scalping cards from the CHART-GEN templates. PR, report with a test checklist. Then stop.
```

**You test.**
1. In the Practice tab, play five questions from each pack.
2. In the arena, play twenty generated drills: are they fair, and do they vary?

### `FUN-PASS` – is it fun?

**Goal.** Before the content is reworked, find out: is the app fun, and where does it drag?

**Scope**
1. **Audit by Claude:**
   - Claude plays Chapter 1 and Scalping Chapter 2 through automatically (Playwright, screenshots, time per screen).
   - Measures lesson length and interaction density.
   - Finds boredom, repetition and weak rewards.
   - Checks the animations with the `review-animations` and `improve-animations` skills against `docs/ui/02-lesson-player-layout.md`: "Nothing moves unless the learner moved it", and decision H (calm, high quality, never in the way).
2. **Newcomer test, optional** (David, 2026-10-05): only if you have someone to ask. A person without trading knowledge plays Levels 1–4 (guide in Appendix C).
3. **Implementation:**
   - The audit (and the newcomer test, if there was one) becomes a prioritized list. You choose from it.
   - What gets built: e.g. sounds, haptics, micro-animations, achievements for discipline (K6), and whatever the newcomer test showed.
   - **Bonus side lessons** on the path (your wish in `LOOK-BRIEF`, `docs/ui/10-path-map.md` §7.1, `#prototype/mix/bonus` at `a78e210`): a small node beside the path after some levels, opened by the level before it, with two or three charts played bar by bar where you don't know where, or whether, there is a setup (the `chart-replay` of `docs/ui/05-chart-questions-and-mistakes-round.md` §4.4). Optional, never timed, never a heart; they pay gems. Hand-written charts first; from `ARENA-TAB` on, the generator fills them. **Since `DESIGN-REVIEW`** the map draws side stops in the path's own style and reads bonus files (`level-LL-bonus.yaml`, `docs/level-files/`); this stage writes the first ones, at the places in `docs/course/07-side-stops-and-writing-order.md` "Side stops", and pays their gems (`docs/content-todo/02-new-fields.md` 2.7, 4.4).
   - **[CONTENT-REVIEW] "The four sums"** (item P-06 of `docs/content-todo/05-content-review.md`): one optional side lesson beside Chapter 1 Level 3, about ten screens, no hearts, no timer — price difference × shares, a per cent of a number, a budget ÷ a distance, an average, and a percentage written as a decimal — each once with a worked example and two questions. Bonus files may only hold replays today, so first one line in `docs/level-files/06-skills-bonus-lessons-market-profiles.md` for a `refresher` kind and its validator rule.

**Model · effort · sessions:**
- Audit: Fable 5.1 · high (else Opus 5.5 · xhigh).
- Implementation: Opus 5.5 · high · 1–2.

**Prompt (audit)**
```
Stage FUN-PASS (audit) from docs/plan/10-phase-1-app-arena-build.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 ("Fun"), docs/plan/02-how-to-work.md §1 and the "FUN-PASS" section in docs/plan/10-phase-1-app-arena-build.md in full, plus docs/ui/ in full.
Play Chapter 1 and Scalping Chapter 2 in the web preview automatically (Playwright), measure the time per screen and per lesson, and assess them against the fun criteria in §0.
Change nothing.

Report: measurements · the 15 most important findings (screen link, what, why, proposal), sorted by impact · open questions. Then stop.
```

**Prompt (implementation)**
```
Stage FUN-PASS (implementation) from docs/plan/10-phase-1-app-arena-build.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "FUN-PASS" section in docs/plan/10-phase-1-app-arena-build.md. Implement these approved findings: [list], and the bonus side lessons (scope item 3).
Open a PR against main and get every check green. Report with a test checklist. Then stop.
```

**You test (~45 min).** If you have someone: the newcomer test from Appendix C. Then play Levels 1–4 yourself after the implementation.
