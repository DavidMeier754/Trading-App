# Content to do

The content work David's design review left for the content sessions. Every content session reads it and ticks here what it did.

## Files

Section numbers are the same as before the docs were split into these files.

| File | Sections | What is in it |
| --- | --- | --- |
| [01-rules-from-the-design-review.md](01-rules-from-the-design-review.md) | §1–1.5 | Part 1: no reliable-looking odds, charts that grow, terms, questions that stand alone. |
| [02-new-fields.md](02-new-fields.md) | §2–2.7 | Part 2: the optional fields the app already renders and how to fill them. |
| [03-work-per-chapter.md](03-work-per-chapter.md) | §3–3.2 | Part 3: the checklist for every chapter, and the state chapter by chapter. |
| [04-still-to-write-and-done-log.md](04-still-to-write-and-done-log.md) | §4–5 | Part 4: lessons still to be written. Part 5: what is done. |

## About this list

Status: 2026-10-04. Written in stage `DESIGN-REVIEW` (`docs/plan/`) from David's verdicts on the 50 design ideas of that stage (the artifact "Nutrade design review"). The app side of every approved idea is built in that stage. **No content file was changed there** — David, 2026-10-03: "Don't rewrite any .yaml". Everything the level files need is listed here instead, for the content sessions that follow.

Read these files together with `docs/rules/`, `docs/level-files/`, `docs/ui/` and `docs/course/`. Where these files and those disagree, those win, and these files get corrected in the same PR.


## How to use these files

- **Who reads it.** Every session that writes or changes content: `CONTENT-DESIGN`, `VARIANCE`, `GLOSSARY`, `OFFER`, `CONTENT-FIX-1` … `-8`, `FUN-PASS` (bonus lessons), `REPLAY-PILOT` / `REPLAY-BANK`, `DRILLS`, `SWING-n` and `DAY-n`. Their prompts in `docs/plan/` name it.
- **What it holds.**
  - Part 1: rules from David's verdicts that hold for every content change.
  - Part 2: the new optional fields the app renders since `DESIGN-REVIEW`, with examples and limits.
  - Part 3: the work per chapter, done by `CONTENT-FIX-N` while it touches the chapter anyway, so no file is rewritten twice.
  - Part 4: content that is still to be written, with its stage.
  - Part 5: the log of what is done.
- **How to tick.** A session that finishes an item ticks it (`[x]`) and adds a line to Part 5 with its PR number. Nothing is deleted; an item that turns out wrong is struck through with the reason.
- **The usual gates hold.** `python3 tools/validate_content.py` at 0 errors, `tools/test_validate.py`, `tools/check_sizing.py --summary`, the render test, and the three hand checks in `docs/plan/02-how-to-work.md` §1.
