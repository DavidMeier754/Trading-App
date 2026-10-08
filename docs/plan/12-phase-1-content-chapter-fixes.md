# Phase 1, content lane – the chapter fixes

_Part of the [build plan](README.md)_

One pass per chapter, so every file is touched once. Chapters 2–7 one after the other, then Chapters 1 and 8.

### `CONTENT-FIX-1` … `CONTENT-FIX-8` – one pass per chapter

**Goal.** Every chapter meets every rule. One pass per chapter, so every file is touched only once.

**Order (David, 2026-10-06):** `CONTENT-FIX-2` … `-7` run one after the other, after `RULES` and `CONTENT-DESIGN`; the app lane, with `VISUALS`' graphics, is done by then. `CONTENT-FIX-1` comes after `VARIANCE`, `CONTENT-FIX-8` after `OFFER`. Then `YOUR-TURN-4`.

**[CONTENT-REVIEW] One chapter per pass.** The content review's cross-chapter edits are done (`docs/content-todo/05-content-review.md`, stage `CONTENT-REVIEW`): the spread sweep and the terms taught where they are first used. So no pass needs another chapter's files any more. Each pass has its own session and PR, merged with every check green before the next pass starts. All of them start after `RULES`, which builds the worklist every pass reads (`tools/content_report.py`). Chapter 1 waits for `VARIANCE` and Chapter 8 for `OFFER`. Chapters 4 and 5 are small enough to share one session. If a fix turns out to need another chapter's file after all, the pass leaves it, names it in the report, and that chapter's pass does it (or, for a chapter already fixed, the next `YOUR-TURN`).

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
  - 3·10 confirms the plan revision. **[CONTENT-REVIEW]** 3·10-3 teaches the account ceiling with the plan's limit — "95 % of the account (your plan's limit) ÷ price" — so that Chapters 6 and 8 agree with Chapter 3 (C6-01, corrected; David confirmed on 2026-10-05), and says how share counts are rounded (C7-12).
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
  - **[CONTENT-REVIEW]** A ninth card for breaks of a marked price (C8-01), because Chapter 8's if-then lines trade exactly that and no card describes it: "Setup I — Level Break" (a close through a price drawn before the open, on volume, stop back on the other side), as Level 13. Decided on 2026-10-05 (David took the recommendation): it replaces Mixed Drill II, whose charts, now across nine cards, move into the Chapter Review (Level 18), so the chapter keeps 19 levels (§3.1). This is the one level-structure change a `CONTENT-FIX` makes; Levels 14–19 keep their numbers, and the Chapter Review, Capstone and Final Exam count nine cards. The rows in Chapter 8 that file level breaks under other cards are `CONTENT-FIX-8`'s.
- **Chapter 8:**
  - "Hearts are on." in 5-1 and 10-1.
  - An honest ending: "ready to practice, not ready to profit".
  - References to Level 15.
  - **[CONTENT-REVIEW]** The journal rows that file a level break under another card (C8-01) name the new card I.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per chapter

**Session instructions** (`[N]` = chapter number; the session takes them as its prompt when `Next stage.` reaches a `CONTENT-FIX` stage and puts in its chapter number itself)
```
Stage CONTENT-FIX-[N] from docs/plan/.

Read CLAUDE.md, docs/rules/, docs/level-files/ and docs/ui/ in full, the section on Chapter [N] in docs/course/, docs/content-todo/ (Parts 1–3, and your chapter's section of Part 6), docs/plan/01-goal-and-guardrails.md §0 ("Variance"), docs/plan/02-how-to-work.md §1 and the "CONTENT-FIX" section in docs/plan/12-phase-1-content-chapter-fixes.md, and the reference files from docs/rules/05-tests-consistency-and-copy.md §3.8.
Then run `python3 tools/content_report.py --chapter [N]` — that is your worklist, together with the chapter-specific items in the plan.

Work in blocks of 4–6 levels. After every block: validate_content.py, check_sizing.py; 0 errors, no warning about a file you touched.
Recompute every changed chart question completely (entry, stop, size, result in $ and R, outcome sentence).
Change no learning goals, no level structure, no ids (the one exception: Chapter 7's Level 13, as the plan says).

At the end: the render test for the chapter, a contact sheet of the changed screens, the three hand checks from §1, and Chapter [N]'s ticks in docs/content-todo/.
Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · before/after numbers from the worklist · deviations with their reason · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** nothing, as a rule — Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each), per chapter:
- Two lessons and the checkpoint.
- The before/after numbers in the report.
- Three changed decisions, one of them "right, but lost".
- One lesson, read as a beginner would.
