# Phase D: Practice to fun pass

_Part of the [build plan](README.md) · §8_

### `PRACTICE` – the practice tab

**Goal.** A place where knowledge sticks: three minutes a day, never punishing.

**Since `DESIGN-REVIEW`** (2026-10-03) the tab exists (`docs/ui/12-practice-and-stats.md` §7.3): **Daily mix** (eight questions from played lessons, never twice in a round, the Leitner boxes 1 → 3 → 7 → 16 → 35 days, weak spots by tag), **Skills** (by chapter, each with its info card) and **Mistakes** (open mistakes, played as a round); a finished round gives a heart back; the record behind it is kept with the progress. This stage reviews that selection, makes it explainable, and adds what is missing: drill packs as a source, weak concepts by glossary term, the links from the test summary and lesson complete, and the "+1 day" testing tool. Keep the three tabs David asked for.

**Scope** (`docs/ui/12-practice-and-stats.md` §7.3)
1. **Practice tab** with three areas:
   - **Daily mix:** ~3 minutes, 8–10 questions.
   - **Weak concepts:** from wrong answers, via `tags` and `terms_introduced`.
   - **Scheduled review:** a Leitner system with 1 → 3 → 7 → 16 → 35 days.
2. **Where the questions come from:**
   - Questions from finished lessons, in a different order and never the same question twice in one round.
   - Plus drill packs, once they exist.
3. **Rules:**
   - Never hearts, never time pressure.
   - A finished practice round returns **1 heart** (`docs/ui/06-reveal-and-hearts.md` §5.2).
4. **Links:**
   - "Review these" from the test summary;
   - "Practice these" from the lesson-complete screen;
   - out of hearts.
5. **Unit tests** for the scheduling: due dates across days; a wrong answer sends a question back to box 1.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2

**Prompt**
```
Stage PRACTICE from docs/plan/13-phase-d-practice-to-fun-pass.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "PRACTICE" section in docs/plan/13-phase-d-practice-to-fun-pass.md in full, plus docs/ui/06-reveal-and-hearts.md §5.2, docs/ui/12-practice-and-stats.md §7.3 and docs/rules/03-content-rules.md §3.3.
Show me your plan first (data model, selection logic, screens) and wait for my approval.

Especially important:
- The selection must be explainable: why does this question come today? (for the tests and for me)
- No question twice in one round; no question whose lesson has not been played yet.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min + 1 week)**
1. Play five lessons with a few mistakes: the tab shows exactly those concepts.
2. Play the daily mix.
3. Lose a heart in the checkpoint, then play a practice round: the heart is back.
4. Testing → "+1 day" and "+3 days": the due questions appear.
5. Use it for 10 minutes a day for a week: does practicing feel useful, or like chewing the same thing over?

### `GLOSSARY` – every term one tap away

**Goal.** Every technical term is explained one tap away (`docs/ui/14-glossary-and-copy.md` §8, S16).

**Scope**
1. ~~**`content/glossary.yaml`** (format in `docs/level-files/`): every term from all `terms_introduced`, one sentence of definition each, plus `taught_in` and `aliases`.~~ **The definitions are written** (`DESIGN-REVIEW`, after David's test on 2026-10-04): every word is an entry of `content/skills.yaml` with its `info` line, and where it is taught comes from the level file that lists it (`docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills"). Left for this stage: **proofread** every word's line against the card that defines it (194 words; no line may contradict its lesson), and add **`aliases`** where the body spells a term differently ("bid-ask spread"), so the marker catches them.
2. ~~**Validator:** every introduced term has an entry, and no definition is too long.~~ Done with `content/skills.yaml` (`docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills", rules of 2026-10-04).
3. **UI:**
   - ~~Terms in body text get a dotted underline (first occurrence per screen). A tap opens a sheet with the definition and "Taught in Level X-Y"; that opens the review card.~~ **Built in `DESIGN-REVIEW`** with David's marker (highlighter and underline, `docs/ui/14-glossary-and-copy.md` §8) and his rule "don't over or underuse them"; the sheet shows "Taught in" and the card already. This stage adds the definition line from `content/glossary.yaml`, and the aliases.
   - ~~The one-line meaning on each skill chip of "What you learned" and on its sheet (`docs/ui/07-lesson-chapter-and-tier-complete.md` §5.3).~~ Built in `DESIGN-REVIEW` (2026-10-04).
   - A glossary list with search in Account.
   - A "recently missed" area, fed by `PRACTICE`.
4. **`docs/content-todo/01-rules-from-the-design-review.md` 1.4:** every term in its lesson's `terms_introduced`, spelled as the body spells it, defined on a card of that lesson.

**Model · effort · sessions:** Opus 5.5 · high · 1–2. The definitions must be exact, so not with Sonnet or Haiku.

**Prompt**
```
Stage GLOSSARY from docs/plan/13-phase-d-practice-to-fun-pass.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "GLOSSARY" section in docs/plan/13-phase-d-practice-to-fun-pass.md in full, plus docs/ui/14-glossary-and-copy.md §8, docs/level-files/06-skills-bonus-lessons-market-profiles.md (Skills), docs/rules/05-tests-consistency-and-copy.md §3.9 and docs/rules/08-sources.md §4, and docs/content-todo/01-rules-from-the-design-review.md (Part 1).
Proofread every word's info line in content/skills.yaml against the lesson that introduces the term — read the screen that defines it. No line may contradict its lesson.

Open a PR against main and get every check green.
Report: what you built · number of terms and of lines changed · 15 random definitions to proofread · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min)**
1. Tap underlined terms in three lessons.
2. Search the glossary for "VWAP", "Spread" and "R".
3. Read the 15 definitions from the report: correct and understandable?

### `STATS` – progress, measured by decisions

**Goal.** Progress you can be proud of. Measured by decisions, never by profit.

**Since `DESIGN-REVIEW`** (2026-10-03) the Account page has the tier card in its material, the medal shelf, All stats with the variance view and the risk note, and Your plan (`docs/ui/12-practice-and-stats.md` §7.4). David did not take the Trader Card with stats ("the tier card design … could be shown here"), and the learning chart goes to the tab decided in `TABS`. Left for this stage:

**Scope** (`docs/ui/12-practice-and-stats.md` §7.4)
1. **Account and statistics:**
   - Accuracy per topic (a lesson's `tags`) and per setup, from the record `DESIGN-REVIEW` keeps.
   - Decision record: long, short, no trade. ~~The share of "good decisions".~~ Counts, not rates called good.
   - ~~A **variance view**, e.g. "Your correct decisions: 64 % winners, 36 % losers – that is what a good process looks like."~~ Built, as counts and without calling any split good (`docs/rules/07-variance-and-typed-numbers.md` §3.11).
2. ~~**Trader Card v1:** best setup, a summary of the saved plan, tier. Shareable as an image.~~ **The tier card, shareable as an image,** and the plan as an image if `ONBOARDING` has not done it.
3. ~~**The risk-note line** on the statistics screen (`docs/rules/10-legal-and-safety.md` §7).~~ Built.
4. ~~**The medal just won shines once on the shelf** (`docs/ui/12-practice-and-stats.md` §7.4, left from `DESIGN-REVIEW`): the app remembers which medals the shelf has shown, and a new one gets one pass of light the first time Account opens after it.~~ **Done in `DESIGN-REVIEW`** (David's test, 2026-10-04).

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage STATS from docs/plan/13-phase-d-practice-to-fun-pass.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 ("Variance"), docs/plan/02-how-to-work.md §1 and the "STATS" section in docs/plan/13-phase-d-practice-to-fun-pass.md in full, plus docs/ui/12-practice-and-stats.md §7.4–§7.5 and docs/rules/10-legal-and-safety.md §7.
Never show profit or money as a measure of performance — only decisions.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min)**
1. Spot-check the numbers against what you played.
2. Share the tier card and look at the image.

### `TABS` – the tab set David chooses

**Goal.** The bar along the bottom holds the tabs David chose from the concept artifact (ideas 31 and 38 of `DESIGN-REVIEW`, decision V).

**You prepare.** Your choice from the artifact ["Nutrade tabs concept"](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD): its "Copy the line" button gives the line for the prompt, e.g. "Option A: Learn, Practice, Analytics, Account now; the Arena joins as a fifth tab once the arena exists."

**Scope**
1. The tab bar as chosen; the Leaderboard placeholder goes (W7 already says there is none in v1.0).
2. **Analytics**, if chosen (David on idea 31: "change the Leaderboard tab to an analytics"): your learning as a weekly XP candle chart with its all-time high, the decision record, the variance view and accuracy by topic — moved from Account → All stats, which then keeps only what belongs to the profile. Measured in decisions and effort, never money.
3. **Arena**, if chosen: the tab with a lock until `ARENA-TAB` fills it.
4. `docs/ui/16-navigation.md` §11.2 and docs/ui/12-practice-and-stats.md §7.4 record the choice.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage TABS from docs/plan/13-phase-d-practice-to-fun-pass.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "TABS" section in docs/plan/13-phase-d-practice-to-fun-pass.md in full, plus docs/ui/12-practice-and-stats.md §7.3, §7.4, docs/ui/13-tiers-replays-and-plus.md §7.7 and docs/ui/16-navigation.md §11.
My choice from the tabs concept: [paste]

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min).** Every tab on your phone; the analytics against what you played.

### `FUN-PASS` – is it fun?

**Goal.** Before the content is reworked, find out: is the app fun, and where does it drag?

**Scope**
1. **Audit by Claude:**
   - Claude plays Chapter 1 and Scalping Chapter 2 through automatically (Playwright, screenshots, time per screen).
   - Measures lesson length and interaction density.
   - Finds boredom, repetition and weak rewards.
   - Checks the animations with the `review-animations` and `improve-animations` skills against `docs/ui/02-lesson-player-layout.md`: "Nothing moves unless the learner moved it", and decision H (calm, high quality, never in the way).
2. **Newcomer test by you:** 2–3 people without trading knowledge play Levels 1–4 (guide in Appendix C).
3. **Implementation:**
   - Audit and newcomer test become a prioritized list. You choose from it.
   - What gets built: e.g. sounds, haptics, micro-animations, achievements for discipline (K6), and whatever the newcomer test showed.
   - **Bonus side lessons** on the path (your wish in `LOOK-BRIEF`, `docs/ui/10-path-map.md` §7.1, `#prototype/mix/bonus` at `a78e210`): a small node beside the path after some levels, opened by the level before it, with two or three charts played bar by bar where you don't know where, or whether, there is a setup (the `chart-replay` of `docs/ui/05-chart-questions-and-mistakes-round.md` §4.4). Optional, never timed, never a heart; they pay gems. Hand-written charts first; from `ARENA-TAB` on, the generator fills them. **Since `DESIGN-REVIEW`** the map draws side stops in the path's own style and reads bonus files (`level-LL-bonus.yaml`, `docs/level-files/`); this stage writes the first ones, at the places in `docs/course/07-side-stops-and-writing-order.md` "Side stops", and pays their gems (`docs/content-todo/02-new-fields.md` 2.7, 4.4).
   - **[CONTENT-REVIEW] "The four sums"** (item P-06 of `docs/content-todo/05-content-review.md`): one optional side lesson beside Chapter 1 Level 3, about ten screens, no hearts, no timer — price difference × shares, a per cent of a number, a budget ÷ a distance, an average, and a percentage written as a decimal — each once with a worked example and two questions. Bonus files may only hold replays today, so first one line in `docs/level-files/06-skills-bonus-lessons-market-profiles.md` for a `refresher` kind and its validator rule.

**Model · effort · sessions:**
- Audit: Fable 5.1 · high (else Opus 5.5 · xhigh).
- Implementation: Opus 5.5 · high · 1–2.

**Prompt (audit)**
```
Stage FUN-PASS (audit) from docs/plan/13-phase-d-practice-to-fun-pass.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 ("Fun"), docs/plan/02-how-to-work.md §1 and the "FUN-PASS" section in docs/plan/13-phase-d-practice-to-fun-pass.md in full, plus docs/ui/ in full.
Play Chapter 1 and Scalping Chapter 2 in the web preview automatically (Playwright), measure the time per screen and per lesson, and assess them against the fun criteria in §0.
Change nothing.

Report: measurements · the 15 most important findings (screen link, what, why, proposal), sorted by impact · open questions. Then stop.
```

**Prompt (implementation)**
```
Stage FUN-PASS (implementation) from docs/plan/13-phase-d-practice-to-fun-pass.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "FUN-PASS" section in docs/plan/13-phase-d-practice-to-fun-pass.md. Implement these approved findings: [list], and the bonus side lessons (scope item 3).
Open a PR against main and get every check green. Report with a test checklist. Then stop.
```

**You test (~45 min).** The newcomer test from Appendix C, then play Levels 1–4 yourself after the implementation.
