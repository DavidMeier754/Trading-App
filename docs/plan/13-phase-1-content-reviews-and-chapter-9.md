# Phase 1, content lane – the reviews, the replays and Chapter 9

_Part of the [build plan](README.md)_

After every chapter is fixed, Claude checks the whole Scalping course twice: for knowledge against the graduate profile (`docs/plan/01-goal-and-guardrails.md` §0) and for teaching quality. The plan has no outside expert (David, 2026-10-05): where a finding needs outside knowledge, it goes to you. Then the replay bank and Chapter 9, both of which use the app lane's `CHART-GEN`, finished by then.

### `KNOWLEDGE` – is the knowledge enough for practice?

**Goal.** Answer two questions:
- After the course, is really only practice missing? Checked against the graduate profile in §0.
- Does everything that is taught work like that in reality? That is review B.

**Scope:** a list of findings, no changes. Detailed prompt: **Appendix E.6**. The graduate profile is added as a fifth question.

**Model · effort · sessions:** Fable 5.1 · max (else Opus 5.5 · max) · 1

**Prompt**
```
Stage KNOWLEDGE from docs/plan/13-phase-1-content-reviews-and-chapter-9.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 (graduate profile) and the "KNOWLEDGE" section in docs/plan/13-phase-1-content-reviews-and-chapter-9.md, then follow the detailed prompt in Appendix E.6 for the scalping path.
An additional fifth question: go through the graduate profile point by point and name, for every point, where it is taught (file, screen) — or that it is missing, and where it would belong.
Change nothing.

Report: a numbered list of findings, most important first, with file and screen · items that need outside knowledge (law, broker practice), for me to judge · open questions. Then stop.
```

**You:** read the findings and decide each one: yes, no or later. The yes-findings go to `KNOWLEDGE-FIX`. Items that need outside knowledge (law, broker practice) are listed for you; the plan has no outside expert (David, 2026-10-05).

### `KNOWLEDGE-FIX`

Implements the approved findings: new screens or lessons, following every rule.

**Model · effort · sessions:** Opus 5.5 · high · 1–3

**Prompt**
```
Stage KNOWLEDGE-FIX from docs/plan/13-phase-1-content-reviews-and-chapter-9.md.

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
Stage REVIEW-A from docs/plan/13-phase-1-content-reviews-and-chapter-9.md. Read CLAUDE.md and follow the detailed prompt in Appendix E.5 for the scalping path. Change nothing. Then stop.
```

**Prompt (corrections)**
```
Stage REVIEW-A (corrections) from docs/plan/13-phase-1-content-reviews-and-chapter-9.md. Read CLAUDE.md, docs/rules/, docs/level-files/, docs/ui/ and §1 of docs/plan/02-how-to-work.md. Implement these approved findings: [list]. PR, every check green, report with a test checklist. Then stop.
```

### `REPLAY-BANK` – 22 replays for scalping

**When.** After `CHART-GEN` (app lane).

**Goal.** The 22 replays per path that `docs/course/` (§ Replays) plans, here for scalping. Only if `REPLAY-PILOT` has shown that the format carries.

**Scope**
- The generator proposes candidate sessions for each setup card and reading level.
- Claude picks them, annotates them (the moments, the decoys, the explanation for each decision) and checks them against Appendix E.2.
- A replay is written from scratch only where the generator cannot produce the case.

**Model · effort · sessions:** Opus 5.5 · high · ~4 (about six replays per session)

**Prompt** (per session)
```
Stage REPLAY-BANK from docs/plan/13-phase-1-content-reviews-and-chapter-9.md. Read CLAUDE.md, docs/plan/02-how-to-work.md §1 and the "REPLAY-BANK" section in docs/plan/13-phase-1-content-reviews-and-chapter-9.md and docs/content-todo/01-rules-from-the-design-review.md (Part 1), then follow Appendix E.2 (bank) for the cards [cards] at reading level [1/2/3], starting from CHART-GEN candidates. PR, report with a test checklist. Then stop.
```

**You test.** Play two replays per session in the arena.

### `OWN-STRATEGY-OUTLINE` – Chapter 9's level plan **[CONTENT-REVIEW]**

**Goal.** Chapter 9 "Your Own Strategy" (`docs/course/08-chapter-9-your-own-strategy.md`, item P-01 of the content review) has a level plan David has approved: every sub-level with its learning goal, its screens in a line, its terms and skills.

**When.** After `CONTENT-FIX-8`, because the chapter builds on Chapters 6–8 as they will read then, and after `CHART-GEN`. It sits on the same map, after the path's Chapter 8 (David, 2026-10-05); the card written in it is tested in the arena afterwards (`SIM-ACCOUNT`, "Test my card").

**Scope**
1. The level plan in `docs/course/08-chapter-9-your-own-strategy.md`: about six levels and 16 sub-levels, as outlined.
2. The open points in that file were decided on 2026-10-05 (one set of examples, `chart-replay` then `journal-row`, no Checkpoint); the outline builds on them and puts any new question to David.
3. The new plan-sheet slot for the learner's own card (`docs/level-files/05-the-plan.md`).
4. What the app needs, if anything (a chapter that belongs to every path after its Chapter 8; the map's ninth chapter): written as a short list for the stage that builds it.
5. No content files yet.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 1

**Prompt**
```
Stage OWN-STRATEGY-OUTLINE from docs/plan/13-phase-1-content-reviews-and-chapter-9.md.

Read CLAUDE.md, docs/plan/02-how-to-work.md §1, the "OWN-STRATEGY-OUTLINE" section in docs/plan/13-phase-1-content-reviews-and-chapter-9.md, docs/course/08-chapter-9-your-own-strategy.md, docs/rules/ and docs/level-files/ in full, and the Chapter 6–8 sections of docs/course/.
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
Stage OWN-STRATEGY from docs/plan/13-phase-1-content-reviews-and-chapter-9.md.

Read CLAUDE.md, docs/rules/, docs/level-files/ and docs/ui/ in full, docs/content-todo/ (Parts 1–3 and 6), docs/plan/02-how-to-work.md §1, the "OWN-STRATEGY" section in docs/plan/13-phase-1-content-reviews-and-chapter-9.md and the approved level plan in docs/course/08-chapter-9-your-own-strategy.md.
Write Chapter 9 as planned. Work in blocks of two levels; after every block validate_content.py and check_sizing.py.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min).** Play the chapter from the first lesson to the capstone, once as a beginner would.

### Milestone – Scalping is finished

Phase 1 ends when both lanes are done, and with `YOUR-TURN-5`: Chapter 1 and Scalping Chapters 2–9 fixed and reviewed, the learning loop complete, the arena and its practice account working for Scalping. Only then does Swing start (Phase 2). That is the rule from David's pick of 2026-10-05: one path finished in every layer before the next begins, so Swing and Day Trading become content work on screens that already exist.
