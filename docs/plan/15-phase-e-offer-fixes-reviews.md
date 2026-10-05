# Phase E: Offer, fixes, reviews

_Part of the [build plan](README.md) · §9_

### `OFFER` – Chapter 8 Level 15, account types and rules

**Goal.** Chapter 8 Level 15 "What You'll Actually Be Offered" teaches the knowledge for the step into a real account (decisions A, B, C).

**Scope**
1. **Part 1 – renumbering** as a commit of its own:
   - Chapter 8 Levels 15–17 become 16–18.
   - The prerequisite chain and every reference move with them.
2. **Part 2 – Level 15 with four lessons** following `docs/course/`. Decisions A–C are made now; nothing is left open.
   - Account types and what each allows. Short selling needs a margin-enabled account.
   - What leverage does to numbers the learner already knows: the ruin arithmetic.
   - The rules against your own plan:
     - the PDT rule against six trades per session;
     - settlement;
     - taxes as a question for an adviser.
   - Practice: the account that fits your own plan.
3. **`content/market_profiles.yaml`** (M17):
   - EU-DE `fee_note` without prices.
   - EU-DE `regulation_note` precise: the negative-balance protection covers CFDs.
   - The US PDT rule at its current state. Research with a source, because the FINRA reform is under way.
   - A new field `checked: <date>`.
   - `timezone` "German time" instead of "CET".
   - `first_minutes` in the same format as `premarket`.
4. **Not here:** the one-sentence additions in Chapter 1 (1·12, 1·13) and in 6·9 are done by `CONTENT-FIX-1` and `CONTENT-FIX-6`.

Detailed prompt: **Appendix E.1**.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1–2

**Prompt**
```
Stage OFFER from docs/plan/15-phase-e-offer-fixes-reviews.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decisions A, B, C) and the "OFFER" section in docs/plan/15-phase-e-offer-fixes-reviews.md in full, and docs/content-todo/ (Parts 1–3: the new level is written with skills and the new fields from the start). Then follow the detailed prompt in Appendix E.1 exactly.
For the rule texts in content/market_profiles.yaml: research the current state on the web, name every source with its date in the report, and flag everything a lawyer has to check.

Open a PR against main and get every check green.
Report: what you built · check results · sources · sentences you are unsure about (for EXPERT/the lawyer) · my test checklist with real links. Then stop.
```

**You test (~20 min)**
1. Skip ahead to Chapter 8 Level 15 and play all four lessons, once with the US profile and once with Germany.
2. Check: informative, no recommendation, no product name, understandable.
3. Collect every place where Claude was unsure, for `EXPERT` or the lawyer.

### `CONTENT-FIX-1` … `CONTENT-FIX-8` – one pass per chapter

**Goal.** Every chapter meets every rule. One pass per chapter, so every file is touched only once.

**Order:** 1 → 2 → 3 → … → 8. Chapter 8 comes after `OFFER`.

**[CONTENT-REVIEW] Parallel since 2026-10-05.** The content review's cross-chapter edits are done (`docs/content-todo/05-content-review.md`, stage `CONTENT-REVIEW`): the spread sweep and the terms taught where they are first used. So no pass needs another chapter's files any more, and the passes may run at the same time, each in its own session and PR, merged one at a time with every check green. Chapter 1 still waits for `VARIANCE` and Chapter 8 for `OFFER`. Chapters 4 and 5 are small enough to share one session. If a fix turns out to need another chapter's file after all, the pass leaves it, names it in the report, and that chapter's pass does it.

**Scope per chapter**
1. **Work through the worklist** (`python3 tools/content_report.py --chapter N`):
   - The variance share, with new chart paths and `stop`/`target`.
   - Signs.
   - Recap `card:`.
   - Takeaway labels.
   - Text length, spelling, gesture words.
   - Tells.
   - The visual quota, with `candle-anatomy`, `trade-plan` and the existing components.
   - A `subtitle` for every lesson.
   - `why` for the most important wrong options (typical misconceptions).
2. **The chapter-specific items** in the list below.
   - Plus **`docs/content-todo/03-work-per-chapter.md` Part 3** for the chapter: skills, the chart ramp, notes, the open, alerts, briefings, no odds, standalone questions. Tick them there.
   - Plus **`docs/content-todo/05-content-review.md` Part 6** for the chapter (**[CONTENT-REVIEW]**): what a beginner meets before it is explained, words with two meanings (`docs/rules/03-content-rules.md` §3.4a), contradictions, odds, inconsistencies. Tick them there.
3. **Way of working:**
   - Blocks of 4–6 levels; after every block the validator and sizing.
   - At the end, the render test for the chapter and a contact sheet of the changed screens.
4. **Do not change:**
   - Learning goals, level structure and ids.
   - Share counts only with the arithmetic redone (`docs/rules/04-numbers-and-realism.md` §3.6).

**Chapter-specific items** (from `docs/review-2026-09-25/`, and from your critique once `RULES` has added it)

- **Every chapter:** your critique's general points (added by `RULES`). From `LOOK-BRIEF`: more hands-on decisions where the learner has to find the entry, or see that there is none and stand aside. And fewer words: every screen within the limit from `RULES`.
- **Chapter 1:**
  - Scenarios that already draw the conclusion: 13-2, 16-1.
  - A contradiction about rumors: 13-2 S9 ↔ 16-1 S11.
  - "Hearts are on." in 5-1 and 11-1.
  - "Drag …" in 3-3, 8-3, 10-1.
  - Single questions: 14-2 S7, 14-2 S13, 2-3 S4, 1-4 S9, 3-1 S13, 16-1 S2, 1-1 S11, 17-1 S5.
  - Signs: 1-1 S10, 1-3 S10, 5-1 S8, 13-1 S6, 13-3 S4, 15-2 S10.
  - In 1·12 one sentence on cash vs. margin accounts; in 1·13 one sentence that short selling needs a margin-enabled account (decision B).
  - In 16-2 one sentence on why your plan value (50 %) sits below the examples so far.
  - The ownership graphic in 3-1 as a grid.
  - Two questions that read alike (your critique in `LOOK-BRIEF`: the same question twice, with different right answers): 14-1 S11 "Which style fits that life best?" (swing trading) and 17-2 S13 "Which style fits that day best?" (scalping). Each question names its story.
- **Chapter 2:**
  - In 2·1-4, after the bridge screen, a `plan-card` revision of `setup_max_account_pct`, 50 → 95, with the reason (W3).
  - `candle-anatomy` in 2·1-1.
- **Chapter 3:**
  - State chips following Appendix E.3 (37 % today).
  - `stop`/`target` apply from here on.
  - 3·10 confirms the plan revision. **[CONTENT-REVIEW]** 3·10-3 teaches the account ceiling with the plan's limit — "95 % of the account (your plan's limit) ÷ price" — so that Chapters 6 and 8 agree with Chapter 3 (C6-01, corrected), and says how share counts are rounded (C7-12).
  - 3·14-1 consistent with decision B.
  - "Hearts are on." in 12-1.
- **Chapters 4 and 5:** the worklist and their part of Part 6.
- **Chapter 6:**
  - State chips (38 %).
  - ~~`variance-sim` in 6·6 and 6·13.~~ 6·6 and 6·13 without a simulator: example numbers labelled as examples, and "your own sample decides" (`docs/course/`, `DESIGN-REVIEW`).
  - In 6·9 say plainly: six trades per session need a margin account, plus PDT and settlement (decision C).
- **Chapter 7:**
  - State chips first, only 16 % today.
  - Realistic variance per setup.
  - **[CONTENT-REVIEW]** A ninth card for breaks of a marked price (C8-01), because Chapter 8's if-then lines trade exactly that and no card describes it: "Setup I — Level Break" (a close through a price drawn before the open, on volume, stop back on the other side), as its own level after Level 12. That makes 20 levels, one over §3.1's 19; ask David first whether to accept it or to fold Mixed Drill II into the Chapter Review. The rows in Chapter 8 that file level breaks under other cards are `CONTENT-FIX-8`'s.
- **Chapter 8:**
  - "Hearts are on." in 5-1 and 10-1.
  - An honest ending: "ready to practice, not ready to profit".
  - References to Level 15.
  - **[CONTENT-REVIEW]** The journal rows that file a level break under another card (C8-01) name the new card I.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per chapter

**Prompt** (`[N]` = chapter number)
```
Stage CONTENT-FIX-[N] from docs/plan/.

Read CLAUDE.md, docs/rules/, docs/level-files/ and docs/ui/ in full, the section on Chapter [N] in docs/course/, docs/content-todo/ (Parts 1–3, and your chapter's section of Part 6), docs/plan/01-goal-and-guardrails.md §0 ("Variance"), docs/plan/02-how-to-work.md §1 and the "CONTENT-FIX" section in docs/plan/15-phase-e-offer-fixes-reviews.md, and the reference files from docs/rules/05-tests-consistency-and-copy.md §3.8.
Then run `python3 tools/content_report.py --chapter [N]` — that is your worklist, together with the chapter-specific items in the plan.

Work in blocks of 4–6 levels. After every block: validate_content.py, check_sizing.py; 0 errors, no warning about a file you touched.
Recompute every changed chart question completely (entry, stop, size, result in $ and R, outcome sentence).
Change no learning goals, no level structure, no ids.

At the end: the render test for the chapter, a contact sheet of the changed screens, the three hand checks from §1, and Chapter [N]'s ticks in docs/content-todo/.
Open a PR against main and get every check green.
Report: before/after numbers from the worklist · deviations with their reason · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min per chapter)**
1. Play two lessons and the checkpoint (links in the report).
2. Read the before/after numbers.
3. Look at three changed decisions, one of them "right, but lost".
4. Read one lesson as a beginner would.

### `OWN-STRATEGY-OUTLINE` – Chapter 9's level plan **[CONTENT-REVIEW]**

**Goal.** Chapter 9 "Your Own Strategy" (`docs/course/08-chapter-9-your-own-strategy.md`, item P-01 of the content review) has a level plan David has approved: every sub-level with its learning goal, its screens in a line, its terms and skills.

**When.** After `CONTENT-FIX-8`, because the chapter builds on Chapters 6–8 as they will read then.

**Scope**
1. The level plan in `docs/course/08-chapter-9-your-own-strategy.md`: about six levels and 16 sub-levels, as outlined.
2. The open points in that file decided or put to David: examples per path, the replay step, whether there is a Checkpoint.
3. The new plan-sheet slot for the learner's own card (`docs/level-files/05-the-plan.md`).
4. What the app needs, if anything (a chapter that belongs to every path after its Chapter 8; the map's ninth chapter): written as a short list for the stage that builds it.
5. No content files yet.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 1

**Prompt**
```
Stage OWN-STRATEGY-OUTLINE from docs/plan/15-phase-e-offer-fixes-reviews.md.

Read CLAUDE.md, docs/plan/02-how-to-work.md §1, the "OWN-STRATEGY-OUTLINE" section in docs/plan/15-phase-e-offer-fixes-reviews.md, docs/course/08-chapter-9-your-own-strategy.md, docs/rules/ and docs/level-files/ in full, and the Chapter 6–8 sections of docs/course/.
Write Chapter 9's level plan into docs/course/08-chapter-9-your-own-strategy.md. No content files.

Open a PR against main and get every check green.
Report: the level plan · decisions I need to make · what the app needs. Then stop.
```

**You test (~20 min).** Read the level plan and decide the open points.

### `OWN-STRATEGY` – Chapter 9, written **[CONTENT-REVIEW]**

**Goal.** Chapter 9 is in the app and playable after any path's Final Exam.

**Scope**
1. The chapter as `OWN-STRATEGY-OUTLINE` planned it, with skills, the new fields where they teach something, and no odds (`docs/content-todo/01-rules-from-the-design-review.md` 1.1).
2. Whatever small app change the outline named (the map showing Chapter 9 after the path's Chapter 8).
3. `docs/course/` status set to written.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1–2

**Prompt**
```
Stage OWN-STRATEGY from docs/plan/15-phase-e-offer-fixes-reviews.md.

Read CLAUDE.md, docs/rules/, docs/level-files/ and docs/ui/ in full, docs/content-todo/ (Parts 1–3 and 6), docs/plan/02-how-to-work.md §1, the "OWN-STRATEGY" section in docs/plan/15-phase-e-offer-fixes-reviews.md and the approved level plan in docs/course/08-chapter-9-your-own-strategy.md.
Write Chapter 9 as planned. Work in blocks of two levels; after every block validate_content.py and check_sizing.py.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min).** Play the chapter from the first lesson to the capstone, once as a beginner would.

### `KNOWLEDGE` – is the knowledge enough for practice?

**Goal.** Answer two questions:
- After the course, is really only practice missing? Checked against the graduate profile in §0.
- Does everything that is taught work like that in reality? That is review B.

**Scope:** a list of findings, no changes. Detailed prompt: **Appendix E.6**. The graduate profile is added as a fifth question.

**Model · effort · sessions:** Fable 5.1 · max (else Opus 5.5 · max) · 1

**Prompt**
```
Stage KNOWLEDGE from docs/plan/15-phase-e-offer-fixes-reviews.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 (graduate profile) and the "KNOWLEDGE" section in docs/plan/15-phase-e-offer-fixes-reviews.md, then follow the detailed prompt in Appendix E.6 for the scalping path.
An additional fifth question: go through the graduate profile point by point and name, for every point, where it is taught (file, screen) — or that it is missing, and where it would belong.
Change nothing.

Report: a numbered list of findings, most important first, with file and screen · items that need outside knowledge (for EXPERT) · open questions. Then stop.
```

**You:** read the findings and decide each one: yes, no or later. The yes-findings go to `KNOWLEDGE-FIX`. Items that need outside knowledge (law, broker practice) go to `EXPERT`.

### `KNOWLEDGE-FIX`

Implements the approved findings: new screens or lessons, following every rule.

**Model · effort · sessions:** Opus 5.5 · high · 1–3

**Prompt**
```
Stage KNOWLEDGE-FIX from docs/plan/15-phase-e-offer-fixes-reviews.md.

Read CLAUDE.md, docs/rules/, docs/level-files/, docs/ui/, docs/content-todo/01-rules-from-the-design-review.md (Part 1), and §1 of docs/plan/02-how-to-work.md. Implement these approved findings from KNOWLEDGE: [list]. New lessons follow docs/course/ (add them there) and every rule.
Open a PR against main and get every check green. Report with a test checklist. Then stop.
```

**You test:** play the new lessons.

### `REVIEW-A` – does the course teach well?

**Scope:** detailed prompt **Appendix E.5** (pass A). First a list of findings; you approve; then the corrections follow.

**Model · effort · sessions:**
- Review: Fable 5.1 · high (else Opus 5.5 · max) · 1.
- Corrections: Opus 5.5 · high · 1–3.

**Prompt (review)**
```
Stage REVIEW-A from docs/plan/15-phase-e-offer-fixes-reviews.md. Read CLAUDE.md and follow the detailed prompt in Appendix E.5 for the scalping path. Change nothing. Then stop.
```

**Prompt (corrections)**
```
Stage REVIEW-A (corrections) from docs/plan/15-phase-e-offer-fixes-reviews.md. Read CLAUDE.md, docs/rules/, docs/level-files/, docs/ui/ and §1 of docs/plan/02-how-to-work.md. Implement these approved findings: [list]. PR, every check green, report with a test checklist. Then stop.
```

### `EXPERT` – expert review by a human

**Goal.** A person who actually trades checks the professionally most delicate parts.

**Scope:**
- Chapter 3 (orders, costs, size).
- Chapter 6 (risk).
- Chapter 7 (playbook).
- Chapter 8 (the trading day and Level 15).
- The market profiles.

Claude provides the exports (`tools/export_readable.py`) and a list of the places where Claude was unsure.

**You:**
1. Find the person: an experienced trader, ideally with training or teaching experience. Decision N is still open; ways that do not cost much:
   - **Keep the job small.** Claude's own reviews (`KNOWLEDGE`, `REVIEW-A`) come first, so the expert only checks the risky parts above and Claude's list of doubts. That is hours, not weeks.
   - **Where to look:** student investment and trading clubs at universities; former professional traders on LinkedIn or XING; lecturers who teach investing at adult education centers (Volkshochschule) or business schools; experienced traders among your beta testers; freelance platforms (e.g. Malt, Upwork) with a fixed price per chapter.
   - **How to pay:** a fixed price per chapter instead of an hourly budget; or, instead of money, lifetime Nutrade Plus and a credit in the app (only with their consent, and never worded as an endorsement).
   - **If possible, two views:** a practitioner (does it work like that?) and a teacher (is it taught well?).
2. Agree on scope and fee in writing.
3. Bring the result back as a list.

The same person, if possible, checks the same risky parts of Swing and Day Trading later (`SWING-REVIEW`, `DAY-REVIEW`).

The corrections are made in a session of their own (Opus 5.5 · high, prompt as for the `REVIEW-A` corrections).
