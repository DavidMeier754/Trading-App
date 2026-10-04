# Trading-App

A "Duolingo for traders": short daily lessons (3–4 min), interactive chart scenarios (Long / Short / No trade), XP, streaks, hearts and spaced repetition.

The course has three paths — Scalping, Day Trading and Swing Trading — with eight chapters each; Chapter 1 is shared. A finished path is ~145 levels and ~390 sub-levels: about 22 hours, or six months at two sub-levels a day. The goal for the course is that learners enjoy it, and that afterwards only practice is missing. What a graduate can do, and what the app never claims, is defined in `docs/agent.md` §1.1.

The app is called **Nutrade** (decision L in `docs/build-plan.md` §4.1; stage BRAND files the trademark and settles the web address). Version 1.0 ships all three paths, a practice arena with the subscription Nutrade Plus, accounts, and every launch language.

## Where things stand (2026-09-25)

- **Content:** Chapter 1 and the whole Scalping path are written: 388 sub-levels, 5,109 screens, 0 validator errors. Two pieces are planned: Chapter 1 Level 2-4 (variance) and Chapter 8 Level 15 (accounts and rules). Swing Trading and Day Trading are outlined level by level; both are written before the release.
- **App:** an Expo app at the repo root (`README-app.md`). It plays every written lesson: Chapter 1 and Scalping Chapters 2–8.
- **The plan to release:** `docs/build-plan.md`. About 60 named stages. Each one has a copy-ready prompt, a model and effort, automatic checks, and the test David runs before the next stage starts.
- **The review it is built on:** `docs/review-2026-09-25.md`: a full play-through, a render of every screen, and every doc read. Each finding is assigned to a stage in appendix F of the plan.

## Start here

| File | What it is |
|---|---|
| `CLAUDE.md` | What every AI session reads first: one stage per session, the checks, the report. |
| `docs/build-plan.md` | The order of all work to release, with a prompt, model and effort per stage and David's test after each. |
| `docs/review-2026-09-25.md` | The review behind the plan: 17 must-fix, 54 should, 14 could, 25 doc changes. |
| `docs/agent.md` | Rules for anyone (human or AI) writing content or code. Read first. |
| `docs/curriculum.md` | What is taught in which chapter and level, per path. |
| `docs/UI.md` | Every screen archetype, interaction, animation, layout and gamification element. |
| `docs/schema.md` | The YAML format of a lesson file and what the validator checks. |
| `docs/ContentToDo.md` | The content work David's design review left: new fields, skills, the chart ramp, lessons still to write. Every content session reads it. |
| `README-app.md` | The app: how to run it, deep links, testing tools, code layout. |
| `content/market_profiles.yaml` | Market-specific values (session times, currency, index, regulation notes) for `US` and `EU-DE`. |
| `content/shared/` | Chapter 1 (all paths). |
| `content/paths/<path>/` | Chapters 2–8 per path; only `scalping` is written. |
| `content/drills/` | The drill-pack manifest (`packs.yaml`) and the packs; 1 of 15 written. |
| `demo/all-screens.yaml` | The test bench: one example of every screen type. |
| `tools/validate_content.py` | Validates all lesson files and drill packs; `--status` prints chapter and pack statistics. |
| `tools/test_validate.py` | Self-test for the validator. Run it after changing `validate_content.py`. |
| `tools/skills.py` | Every lesson's skills with their info from `content/skills.yaml`; `--sync` adds a lesson's terms to its `skills` line and stub entries for new names. |
| `tools/check_sizing.py` | Every simulated position against the 95 % concentration rule, with every other line in the file that names the same share count. |
| `tools/build_drill_batch.py` | Builds Batch API requests for drill packs from the manifest (optional; stage DRILLS writes packs in-session). |

The replay bank (`content/replays/<path>/`) is specified in `docs/schema.md` § Replays and does not exist yet (stage REPLAY-PILOT).

## Run the app

```bash
npm install
npm run web          # browser preview
npm start            # Expo Go on a phone
npm run typecheck
npm run lint && npm test
npm run smoke        # every screen renders
```

More in `README-app.md`.

## Validate content

```bash
python3 tools/validate_content.py            # errors and warnings
python3 tools/validate_content.py --status   # levels, screens, minutes per chapter
python3 tools/validate_content.py --strict   # chapter-level warnings become errors
python3 tools/test_validate.py               # self-test: every validator rule still fires
python3 tools/skills.py --chapter 2          # one chapter's skills with their info
python3 tools/check_sizing.py --summary      # concentration by chapter
python3 tools/check_sizing.py --chapter 2    # every position in one chapter, with its mentions
python3 tools/build_drill_batch.py --check   # the drill manifest and its exemplars resolve
```

Requires Python 3 and PyYAML (`pip install pyyaml`).

`--strict` gates the structural rules: level count, sub distribution, type variety, callback quota, answer-key hygiene. A chapter that is still being written will fail it; that is the point. Plain runs must stay at 0 errors at all times.

## How work happens

1. Pick the next stage in `docs/build-plan.md`: the first one without ✅.
2. Open a Claude Code session and set the model and effort the stage names.
3. Paste its prompt.
4. The session works on its own branch, opens a PR, gets the checks green and reports with a test checklist.
5. David tests the preview on his phone and answers `OK <STAGE> – merge`, or lists what is wrong.

Nothing is pushed to `main` directly.
