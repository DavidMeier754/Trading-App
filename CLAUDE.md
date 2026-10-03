# CLAUDE.md

Read `docs/agent.md`, `docs/curriculum.md`, `docs/UI.md` and `docs/schema.md` before changing content or code.
Before changing content, also read `docs/ContentToDo.md` (the content work from David's design review), and tick there what you did.
Run `python3 tools/validate_content.py` before finishing any content step.

## How the work is organised

- The order of all work, from today to the store release, is `docs/build-plan.md`.
- A Claude Code session does exactly **one stage** (David starts a new session for every stage; `docs/build-plan.md` §1):
  - Read the plan's §1 ("How to work with this plan") and the stage's own section.
  - Build that scope and nothing from a later stage. Note anything else you find in the report.
  - Stop at the stage's gate.
- Findings carry ids (M…, S…, K…, W…) from `docs/review-2026-09-25.md`.
- Work on the session's branch and open a PR against `main`. Never push to `main` directly unless David says so explicitly.
- Merge a PR only when every CI check on its latest commit is green (`.github/workflows/ci.yml`). A red or pending check blocks the merge, even after David's OK; fix it first. (GitHub cannot enforce this on the private repository, so this rule does.)
- Everything is in English: code, content, docs, commits, PR texts and reports. English is the source language; the other app languages are generated from it in Phase J of the plan and never edited by hand.

## Before every report

- `python3 tools/validate_content.py` (0 errors), `python3 tools/test_validate.py`, `python3 tools/check_sizing.py --summary`.
- For app code: `npm run typecheck`. From stage CI on, also `npm run lint` and `npm test`; from stage WIRE on, `npm run smoke` (every screen renders).
- After content work, do the three hand checks in `docs/build-plan.md` §1: recompute one chart drill, check one callback, read one sub-level as a beginner.

## The report

Write it for David:
1. What was built.
2. Check results.
3. His test checklist, with real preview links.
4. Open questions.

Then stop and wait for "OK <STAGE>".

## Skills

The skills in `.claude/skills` are tools, not rules. Where a skill disagrees with `docs/`, `docs/` wins. That covers motion ("nothing moves unless the learner moved it"), typography, punctuation, layout and tone.
