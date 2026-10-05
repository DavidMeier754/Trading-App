# Phase 2, content lane – Swing and Day Trading

_Part of the [build plan](README.md)_

All three paths are part of the finished app. They start once Scalping is finished in every layer (the end of Phase 1). Swing comes first, because Chapter 1 sends people with a full-time job there; Day Trading follows. Each path gets its chapters, its reviews, then its arena content.

**Prerequisites**
- `RULES` has the rules "per-trade risk" and "total exposure" (required, `docs/rules/04-numbers-and-realism.md` §3.6).
- `REPLAY-PILOT` has fixed the replay format; Chapters 7 and 8 of every path contain replay screens.
- Every rule from Phase 1 applies from the start:
  - variance from Chapter 2;
  - `stop`/`target` from Chapter 3;
  - signs, text length, visual quota.

**Swing is different from scalping**
- Several positions at the same time.
- The risk budget binds, not the account cap.
- Overnight and weekend risk.
- 90 days on the simulator instead of 30.

**Day trading is different from scalping**
- 5- and 15-minute charts, with the daily chart as context.
- 5–10 trades a day, flat by the close.
- Wider stops: the 1 % risk budget usually decides the size, and the account ceiling is the check that still runs. Positions are typically 50–95 % of the account (`docs/rules/04-numbers-and-realism.md` §3.6).
- The pattern-day-trader rule bites a day trader hardest. Chapter 6 Level 9 (the daily limits, where the trade cap is taught) and Chapter 8 Level 15 say it plainly, with the current wording from the market profile (decisions B and C).
- 30 days on the simulator, as for scalping.

In each path's Chapter 3, the plan card revises `setup_max_account_pct` with that path's reason.

**For EU-DE** the swing path points out: swing with cash stocks works without the PDT rule and without leverage. That is exactly the audience Chapter 1 sends to swing.

### `SWING-2` … `SWING-8`

**Goal.** Swing Chapters 2–8 following `docs/course/`.

**Scope:** one chapter per stage, in blocks of 4–6 levels, following every rule from Phase 1.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per chapter

**Prompt** (`[N]` = chapter)
```
Stage SWING-[N] from docs/plan/.

Read CLAUDE.md, docs/rules/, docs/level-files/ and docs/ui/ in full, the swing section for Chapter [N] in docs/course/ (find it with grep), docs/content-todo/ (Parts 1–3: write the chapter with skills, the chart ramp and the new fields from the start), §0 ("Variance"), §1 and §12 of docs/plan/14-phase-2-swing-and-day.md, and the reference files from docs/rules/05-tests-consistency-and-copy.md §3.8.
Also follow the clause in Appendix E.7.
Write in blocks of 4–6 levels; after every block validate_content.py (0 errors, no warning about your files) and check_sizing.py. At the end --strict for the chapter, the render test, the three hand checks.
Open a PR against main. Report: --status table · deviations from the outline with their reason · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min per chapter)**
1. Play two lessons and the checkpoint.
2. Read one lesson as a beginner would.

**After `SWING-8`:** the path choice unlocks Swing; "Being written" goes away.

### `SWING-REVIEW`

**Goal.** Both reviews for swing: Appendix E.5 (pass A) and E.6 (pass B, with the graduate profile).

**Scope**
- Findings first, then you decide, then the corrections follow.
- Chapter 9 read against Swing's Chapter 8: its examples and references still work after this path (`docs/course/08-chapter-9-your-own-strategy.md`).

**Model · effort · sessions:**
- Reviews: Fable 5.1 · high (pass A) and max (pass B).
- Corrections: Opus 5.5 · high.
- 2–4 sessions in total.

**Prompt (reviews)**
```
Stage SWING-REVIEW (reviews) from docs/plan/14-phase-2-swing-and-day.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 (graduate profile) and the "SWING-REVIEW" section in docs/plan/14-phase-2-swing-and-day.md, then follow the detailed prompts in Appendix E.5 (pass A) and E.6 (pass B, with the graduate profile as a fifth question) for the swing path.
Also read Chapter 9 (docs/course/08-chapter-9-your-own-strategy.md and its lessons) against Swing's Chapter 8: name every example or reference that does not work after this path.
Change nothing.

Report: a numbered list of findings, most important first, with file and screen · items that need outside knowledge, for me to judge · open questions. Then stop.
```

**Prompt (corrections)**
```
Stage SWING-REVIEW (corrections) from docs/plan/14-phase-2-swing-and-day.md. Read CLAUDE.md, docs/rules/, docs/level-files/, docs/ui/, docs/content-todo/01-rules-from-the-design-review.md (Part 1) and §1 of docs/plan/02-how-to-work.md. Implement these approved findings: [list]. PR, every check green, report with a test checklist. Then stop.
```

**You:** read the findings and decide each one: yes, no or later. Then play two corrected lessons (links in the report).

### `DAY-2` … `DAY-8`

**Goal.** Day Trading Chapters 2–8 following `docs/course/`.

**Scope:** one chapter per stage, in blocks of 4–6 levels, following every rule from Phase 1.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per chapter

**Prompt** (`[N]` = chapter)
```
Stage DAY-[N] from docs/plan/.

Read CLAUDE.md, docs/rules/, docs/level-files/ and docs/ui/ in full, the day-trading section for Chapter [N] in docs/course/ (find it with grep), docs/content-todo/ (Parts 1–3: write the chapter with skills, the chart ramp and the new fields from the start), §0 ("Variance"), §1 and §12 of docs/plan/14-phase-2-swing-and-day.md, and the reference files from docs/rules/05-tests-consistency-and-copy.md §3.8.
Also follow the clause in Appendix E.7.
Write in blocks of 4–6 levels; after every block validate_content.py (0 errors, no warning about your files) and check_sizing.py. At the end --strict for the chapter, the render test, the three hand checks.
Open a PR against main. Report: --status table · deviations from the outline with their reason · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min per chapter)**
1. Play two lessons and the checkpoint.
2. Read one lesson as a beginner would.

**After `DAY-8`:** the path choice unlocks Day Trading; no path says "Being written" any more.

### `DAY-REVIEW`

**Goal.** Both reviews for Day Trading, as in `SWING-REVIEW`.

**Scope**
- Findings first, then you decide, then the corrections follow.
- Special attention: the pattern-day-trader rule and the margin account in Chapter 6 Level 9 and Chapter 8 Level 15 (decisions B and C).
- Chapter 9 read against Day Trading's Chapter 8, as for Swing.

**Model · effort · sessions:** as in `SWING-REVIEW` · 2–4 in total.

**Prompt (reviews)**
```
Stage DAY-REVIEW (reviews) from docs/plan/14-phase-2-swing-and-day.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 (graduate profile) and the "DAY-REVIEW" section in docs/plan/14-phase-2-swing-and-day.md, then follow the detailed prompts in Appendix E.5 (pass A) and E.6 (pass B, with the graduate profile as a fifth question) for the day-trading path.
Special attention: the pattern-day-trader rule and the margin account in Chapter 6 Level 9 and Chapter 8 Level 15 (decisions B and C). Also read Chapter 9 against Day Trading's Chapter 8.
Change nothing.

Report: a numbered list of findings, most important first, with file and screen · items that need outside knowledge, for me to judge · open questions. Then stop.
```

**Prompt (corrections)**
```
Stage DAY-REVIEW (corrections) from docs/plan/14-phase-2-swing-and-day.md. Read CLAUDE.md, docs/rules/, docs/level-files/, docs/ui/, docs/content-todo/01-rules-from-the-design-review.md (Part 1) and §1 of docs/plan/02-how-to-work.md. Implement these approved findings: [list]. PR, every check green, report with a test checklist. Then stop.
```

**You:** read the findings and decide each one: yes, no or later. Then play two corrected lessons (links in the report).

### `ARENA-PATHS` – the arena for Swing and Day Trading

**Goal.** In the finished app, the arena serves all three paths.

**Scope** (per path, after its review)
1. **Generator templates** for the path's Chapter 7 playbook cards, three qualities each, on the path's timeframe: daily bars and evening decisions for swing, 5-minute bars for Day Trading.
2. **Generated setup drills** for these cards.
3. **The replay bank:** 22 replays per path, made as in `REPLAY-BANK`.
4. **Scenario packs** for the path, e.g. earnings weeks for swing, gap days for Day Trading.
5. **The Daily Chart** for the path.

**Model · effort · sessions:** Opus 5.5 · high · per path 2–3 (templates and drills, then replays)

**Prompt** (per session)
```
Stage ARENA-PATHS, path [swing|day-trading], session [templates|replays], from docs/plan/.
Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/09-phase-1-app-arena-design-and-generator.md ("The Arena idea") and the "ARENA-PATHS" section in docs/plan/14-phase-2-swing-and-day.md, the arena section of docs/ui/, the path's Chapter 7 in docs/course/, docs/content-todo/01-rules-from-the-design-review.md (Part 1) and Appendix E.2.
PR, every check green, report with 12 sample charts (templates session) or the replay list (replays session) and a test checklist. Then stop.
```

**You test.** Per path: the 12 sample charts, five drills and two replays.
