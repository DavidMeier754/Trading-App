# Trading-App

A "Duolingo for traders": short daily lessons (3–4 min), interactive chart scenarios (Long / Short / No trade), XP, streaks, hearts and spaced repetition. Three paths — Scalping, Day Trading, Swing Trading — eight chapters each; Chapter 1 is shared.

A finished path is ~144 levels and ~387 sub-levels: about 22 hours, or six months at two sub-levels a day. What a graduate can do — and what they still cannot — is defined in `docs/agent.md` §1.1.

## Start here

| File | What it is |
|---|---|
| `docs/agent.md` | Rules for anyone (human or AI) writing content or code. Read first. |
| `docs/curriculum.md` | What is taught in which chapter and level, per path. |
| `docs/UI.md` | Every screen archetype, interaction, animation, layout and gamification element. |
| `docs/schema.md` | The YAML format of a lesson file and what the validator checks. |
| `docs/build-plan.md` | How the v3 curriculum gets built: stage order, prompts, model per stage. |
| `content/market_profiles.yaml` | Market-specific values (session times, currency, index, regulation notes) for `US` and `EU-DE`. |
| `content/shared/` | Chapter 1 (all paths). |
| `content/paths/<path>/` | Chapters 2–8 per path. |
| `tools/validate_content.py` | Validates all lesson files; `--status` prints chapter statistics. |
| `tools/test_validate.py` | Self-test for the validator. Run it after changing `validate_content.py`. |

## Validate content

```
python3 tools/validate_content.py            # errors and warnings
python3 tools/validate_content.py --status   # levels, screens, minutes per chapter
python3 tools/validate_content.py --strict   # chapter-level warnings become errors
python3 tools/test_validate.py               # self-test: every validator rule still fires
```

Requires Python 3 and PyYAML (`pip install pyyaml`).

`--strict` gates the structural rules — level count, sub distribution, type variety,
callback quota, answer-key hygiene. A chapter that is still being written will fail it;
that is the point. Plain runs must stay at 0 errors at all times.

## Status

The v2 content (six chapters, one path) has been retrofitted onto the v3 eight-chapter
plan: files sit in their final level slots and the chapter folders are renumbered, but
the levels the v3 plan adds are being written chapter by chapter. Chapter 5 (Finding
the Trade) is complete; Chapter 8 (The Trading Day) does not exist yet.

| Chapter | Levels | Subs | v3 target |
|---|---|---|---|
| 1 Market Basics (shared) | 17 | 29 | 17 / 47 |
| Scalping 2 Charts 101 | 16 | 17 | 18 / 49 |
| Scalping 3 Orders, Costs & Position Size | 16 | 17 | 19 / 50 |
| Scalping 4 Reading Fast Markets | 18 | 48 | 18 / 48 |
| Scalping 5 Finding the Trade | 17 | 45 | 17 / 45 |
| Scalping 6 Risk & Psychology | 14 | 15 | 19 / 51 |
| Scalping 7 Scalping Playbook | 10 | 16 | 19 / 50 |
| Scalping 8 The Trading Day | — | — | 17 / 47 |

- Everything written has been reviewed end to end as one piece (see the review pass in git history).
- Day Trading and Swing Trading are outlined level by level in `docs/curriculum.md`; no content written.
- Next step and how to run it: `docs/build-plan.md`.
