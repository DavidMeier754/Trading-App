# Level file format

The YAML format of a level file, and what the validator checks.

## Files

| File | What is in it |
| --- | --- |
| [01-header.md](01-header.md) | The fields at the top of every level file. |
| [02-non-question-screens.md](02-non-question-screens.md) | `intro`, `theory`, `story`, `recap`, `plan-card`, `summary`, `badge` and the other screens without an answer. |
| [03-question-screens.md](03-question-screens.md) | Every question screen type and its fields. |
| [04-components-and-data.md](04-components-and-data.md) | Chart, quote and other component data, and hotspot targets. |
| [05-the-plan.md](05-the-plan.md) | The one key schema for the learner's trading plan across the whole path. |
| [06-skills-bonus-lessons-market-profiles.md](06-skills-bonus-lessons-market-profiles.md) | The `skills` list and `content/skills.yaml`, bonus side lessons, market profiles. |
| [07-drill-packs-and-replays.md](07-drill-packs-and-replays.md) | The format of drill packs, their manifest and checks, and of replays. |
| [08-validator-rules.md](08-validator-rules.md) | Everything `tools/validate_content.py` checks. |

## About the format

Every sub-level is one YAML file: `content/<scope>/chapter-NN-<slug>/level-LL-S.yaml`
(`LL` = zero-padded level, `S` = sub). Validate with `python3 tools/validate_content.py`.

Status: **v3** — fields, screen types and validator rules for the eight-chapter curriculum. New items are marked **[v3]**. Everything unmarked is unchanged from v2 and existing content stays valid.
**[v4] (2026-09-25)** — new optional fields and types for the release plan (`docs/plan/`). Every one of them is optional or new, so existing files stay valid; the validator rules that use them arrive in stage RULES and start as warnings.
**[DESIGN-REVIEW] (2026-10-03)** — optional fields for David's approved designs: chart `notes`, the open on a chart (`session_open`), a scene's market `alert`, a test briefing's `facts`, a lesson's `skills`, and bonus side lessons as files of their own (`category: bonus`). `variance-sim` is dropped and `decision-grid` added. The app renders all of them and the validator checks their shape; no content file uses them yet — that work is listed in `docs/content-todo/`.
**[Skills] (2026-10-04)** — David: "opening a new .yaml file which contains all the skills and infos, and … add every skill name to a new tab in the already existing level .yaml files". `content/skills.yaml` holds every skill with its kind and one line of info, replacing the planned `content/glossary.yaml`; `skills` in every level file is now a required list of names (see "Skills" below). Every level file has it.
