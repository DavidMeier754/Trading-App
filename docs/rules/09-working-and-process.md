# Working principles and process

_Part of the [rules for content and code](README.md) · §5–6_

## 5. Working principles

1. Quality over speed. Think about the learning curve before writing; rewrite until a zero-knowledge reader would understand and enjoy it.
2. Combine sources; never treat one book as the truth.
3. No copyright violation — paraphrase, never quote.
4. Hook first. Every chapter's first level does something, not just explains something.
5. Simple first exposure, depth through repetition and scenarios.
6. **[v3]** Reps beat prose. When a choice exists between one more explanation and one more drill, write the drill.
7. Stop after each step and wait for explicit approval before the next (section 6). **[v4]** In the release plan every stage ends at a gate: a report with David's test checklist, then nothing until his "OK" (`docs/plan/02-how-to-work.md` §1).
8. Run `python3 tools/validate_content.py` and fix every error and warning before declaring a step done, then do a zero-knowledge read-through of the whole chapter (typos, jargon before definition, absolute claims, coverage gaps, boredom).

---

## 6. Process and status

### Session workflow (one chapter per session)

A v3 chapter is 45–52 sub-levels — too much for one clean pass. Write it in **level blocks**: 4–6 levels per pass, validating after each block, and keep the whole chapter in one session so the voice holds. `docs/plan/` gives the stage order, the per-stage prompts and the model to use for each.

1. Read `CLAUDE.md`, this file, `docs/course/`, `docs/ui/`, `docs/level-files/`, and the three reference files in section 3.8. Do not read other content files unless a term or callback requires it.
2. Write the chapter's lesson files in level order, into the folder named in `docs/course/`, in blocks.
3. Run `python3 tools/validate_content.py` after every block. Fix every error and every warning before moving on.
4. Do the zero-knowledge read-through (section 5, item 8) on the whole chapter and fix what you find.
5. Tick the chapter's status in `docs/course/` and in the step list below. Update the status lines in `README.md`.
6. Commit with a message that names the chapter and its level/sub counts; open a PR against `main` (**[v4]**: never push to `main` directly).
7. Report back **only**: the `--status` table, deviations from the outline (with reasons), and questions that need a human decision. Then stop — the next chapter is a new session.

### Steps

1. Structure, rules, schema, validator, UI reference — **done**.
2. Chapter 1 (shared) — **done: 17 levels / 48 subs** (path choice included). **[v4]** Level 2-4 (variance) planned, stage VARIANCE.
3. Scalping Chapters 2–8 — **done: 18/19/18/17/19/19/17 levels, 340 subs**. Chapter 8 Level 15 planned, stage OFFER.
4. Position sizes — **done**: 0 of 572 priced positions over the §3.6 cap.
5. The app — **on `main` since 2026-09-25** (PR #13): Chapter 1 and Scalping Chapter 2 Levels 1–3 playable.
6. **[v4] Everything else** — the order is `docs/plan/`, the findings behind it `docs/review-2026-09-25/`. **[DESIGN-REVIEW]** The content work from the design review is `docs/content-todo/`. Drill bank: 1 of 15 packs written. **[v4.1]** Swing Trading Chapters 2–8, then Day Trading Chapters 2–8, both before the release (decision E).

Live status (levels, screens, minutes per chapter) is generated, not hand-written:

```
python3 tools/validate_content.py --status
```

**[v4] After release, ids are stable.** A sub-level id that learners have progress on is never renumbered without a migration entry (stage UPDATES). Inserting a level before release — as Chapter 8 Level 15 does — renumbers freely; after release, new levels are appended or carried by a migration.
