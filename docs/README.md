# Docs

Every doc of the project, by what it is for. Each folder has a README that lists its files and which sections each one holds.

## What to read

| Folder | What is in it | Who reads it |
| --- | --- | --- |
| [`rules/`](rules/README.md) | The binding rules for content and code: what we build, content rules, numbers, variance, sources, legal. | Every session, first. |
| [`course/`](course/README.md) | What is taught in which chapter and level, per path. | Every content session; code that depends on the course. |
| [`ui/`](ui/README.md) | How every screen looks, moves and reacts. | Every code session; content sessions for the screen types. |
| [`level-files/`](level-files/README.md) | The YAML format of a level file, and what the validator checks. | Every content session; code that reads level files. |
| [`content-todo/`](content-todo/README.md) | The content work left from David's design review and from the content review of 2026-10-04 (Part 6). | Every content session; it ticks what it did. |
| [`plan/`](plan/README.md) | The order of all work to the release: one stage per session, each with its prompt and David's test. | Every session: `plan/02-how-to-work.md` and its own stage. |
| [`review-2026-09-25/`](review-2026-09-25/README.md) | The review the plan is built on (finding ids M…, S…, K…, W…). A record of that day. | When a stage names a finding. |
| [`setup-preview.md`](setup-preview.md) | How the web preview is set up. | When the preview needs changing. |

## Section numbers

The long docs were split into these folders on 2026-10-04. Only the references were changed, and every section kept its number, so "§7.1" or "3.6" means the same text as before. References in the code and docs name the file that holds the section, for example `docs/ui/10-path-map.md` §7.1.

| Former file | Now |
| --- | --- |
| `docs/agent.md` | [`docs/rules/`](rules/README.md) |
| `docs/curriculum.md` | [`docs/course/`](course/README.md) |
| `docs/UI.md` | [`docs/ui/`](ui/README.md) |
| `docs/schema.md` | [`docs/level-files/`](level-files/README.md) |
| `docs/ContentToDo.md` | [`docs/content-todo/`](content-todo/README.md) |
| `docs/build-plan.md` | [`docs/plan/`](plan/README.md) |
| `docs/review-2026-09-25.md` | [`docs/review-2026-09-25/`](review-2026-09-25/README.md) |
