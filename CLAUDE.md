# CLAUDE.md

Read `docs/rules/`, `docs/course/`, `docs/ui/` and `docs/level-files/` before changing content or code. `docs/README.md` maps every doc; each folder's README says which file holds which section.
Before changing content, also read `docs/content-todo/` (the content work from David's design review), and tick there what you did (`docs/content-todo/04-still-to-write-and-done-log.md`, Part 5).
Run `python3 tools/validate_content.py` before finishing any content step.

## How the work is organised

- The order of all work, from today to the finished app, is `docs/plan/`; the table of stages is `docs/plan/03-stages-at-a-glance.md`. One stage at a time: in each phase the app stages come first, then the content stages. `YOUR-TURN` stages are David's own changes (`docs/plan/22-your-turn.md`).
- A Claude Code session does exactly **one stage, or one session of a stage** (David starts a new session for each; `docs/plan/02-how-to-work.md` §1).

### "Next stage." — finding the work

David starts every session with the same prompt, **`Next stage.`**, sometimes with lines under it (his wishes for a `YOUR-TURN`, material a stage asks him to prepare, "skip YOUR-TURN-n", a bug list for the open PR). He pastes nothing from the plan. The session finds its work itself:

1. **The stage:** the first row in the tables of `docs/plan/03-stages-at-a-glance.md` §2, top to bottom, whose stage is not marked ✅. `docs/plan/README.md` says which file holds its section.
2. **The session:** a stage with several sessions marks each finished one in its row ("session 1 ✅"). Take the first session not marked. Its scope is the stage section's part for that session ("Session 2 – …"), or, where the section does not split it, a "**Left for session n:**" line an earlier session wrote there; with neither, the whole stage.
3. **The instructions:** the stage section's "Session instructions" block is your prompt; fill its placeholders yourself (`[1|2]` = the session found in step 2). Read `docs/plan/02-how-to-work.md` §1 and everything the block names.
4. **Plan mode:** where the stage's "Model · effort" says "plan mode", show David your plan first and build nothing until he says OK.
5. **What David must give:** a `YOUR-TURN` needs his wishes, some stages a "You prepare" item. If the prompt does not carry it, ask for it (for a `YOUR-TURN`, show the parked wishes first) and wait. "skip YOUR-TURN-n" marks that turn "✅ skipped" in a PR of its own and goes on to the next stage. A line "My turn:" with wishes asks for an extra `YOUR-TURN` before the next stage (`docs/plan/22-your-turn.md`): it gets a line in `docs/plan/05-done-so-far.md`, no mark in the table.
6. **Not on `main` yet:** if the previous stage's PR is still open (not merged), say so and ask whether to wait, before starting anything. Never stack a stage on an unmerged one unless David says so.

### Doing it

- Build that scope and nothing from a later stage. Note anything else you find in the report. A wish David voices beyond the stage goes under "Parked wishes" in `docs/plan/22-your-turn.md`.
- **The PR marks itself done.** The stage PR carries, from its first push, the ✅ for what it finishes: "session n ✅" in the stage's row, or ✅ on the stage itself when nothing of it is left (then its line in `docs/plan/05-done-so-far.md`, and the "Next" line of §3 in `docs/plan/03-stages-at-a-glance.md`). A stage that is not finished gets a "**Left for session n+1:**" line in its section. The mark reaches `main` exactly when the PR is merged — by Claude after David's OK, or by David on GitHub — and never before, so the next "Next stage." finds the right step.
- Stop at the stage's gate: the report, then nothing until David's "OK <STAGE>" (merge, then the session is done) or his list of problems (fix them in the same PR).
- Findings carry ids (M…, S…, K…, W…) from `docs/review-2026-09-25/`.
- Work on the session's branch and open a PR against `main`. Never push to `main` directly unless David says so explicitly.
- Merge a PR only when every CI check on its latest commit is green (`.github/workflows/ci.yml`). A red or pending check blocks the merge, even after David's OK; fix it first. (GitHub cannot enforce this on the private repository, so this rule does.)
- Everything is in English: code, content, docs, commits, PR texts and reports. English is the source language; the other app languages are generated from it in Phase 3 of the plan and never edited by hand.

## Before every report

- `python3 tools/validate_content.py` (0 errors), `python3 tools/test_validate.py`, `python3 tools/check_sizing.py --summary`.
- For app code: `npm run typecheck`. From stage CI on, also `npm run lint` and `npm test`; from stage WIRE on, `npm run smoke` (every screen renders).
- After content work, do the three hand checks in `docs/plan/02-how-to-work.md` §1: recompute one chart drill, check one callback, read one sub-level as a beginner.
- **Check what you built yourself** before asking David to: open the changed screens in a test build (screenshots at phone size, light and dark, the states that matter: before and after an answer, reduced motion), and look at them. What you have seen working does not go on David's list.

## The report

Write it for David, in this order:
1. **What was built.** Each item in a sentence or two, with **where to see it** if he wants to: a link (`<preview>/#level-09-2/3`; Settings → Testing → Open a screen takes the part after `#`) or the place in the app. Seeing it is optional.
2. **Check results.** The standard checks, and what you verified yourself (which screens, which states).
3. **Needs your review.** Only what really needs David: a choice only he can make (between versions, a design direction, a finding to decide), something only a real phone shows (haptics, sound, a gesture's feel) when the stage is about it, or something you could not verify yourself, saying why. Each with its link. If nothing does, write "Nothing needs your review. Merge when you like." Do not fill this list to be safe.
4. **Open questions.**
5. **Next:** the next stage (or session) and its model, effort and plan mode, from §2: "Next: `VISUALS` · `/model opus`, `/effort high`. Then send `Next stage.`"

Then stop and wait for "OK <STAGE>".

## Skills

The skills in `.claude/skills` are tools, not rules. Where a skill disagrees with `docs/`, `docs/` wins. That covers motion ("nothing moves unless the learner moved it"), typography, punctuation, layout and tone.
