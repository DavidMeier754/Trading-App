# Trading-App

A "Duolingo for traders": short daily lessons (3–4 min), interactive chart scenarios (Long / Short / No trade), XP, streaks, hearts and spaced repetition. Three paths — Scalping, Day Trading, Swing Trading — six chapters each; Chapter 1 is shared.

## Start here

| File | What it is |
|---|---|
| `docs/agent.md` | Rules for anyone (human or AI) writing content or code. Read first. |
| `docs/curriculum.md` | What is taught in which chapter and level, per path. |
| `docs/UI.md` | Every screen archetype, interaction, animation, layout and gamification element. |
| `docs/schema.md` | The YAML format of a lesson file and what the validator checks. |
| `content/market_profiles.yaml` | Market-specific values (session times, currency, index, regulation notes) for `US` and `EU-DE`. |
| `content/shared/` | Chapter 1 (all paths). |
| `content/paths/<path>/` | Chapters 2–6 per path. |
| `tools/validate_content.py` | Validates all lesson files; `--status` prints chapter statistics. |

## Validate content

```
python3 tools/validate_content.py            # errors and warnings
python3 tools/validate_content.py --status   # levels, screens, minutes per chapter
```

Requires Python 3 and PyYAML (`pip install pyyaml`).

## Status

- Chapter 1 (shared) — written, reviewed
- Scalping Chapter 3 "Orders, Costs & Position Size" — written, reviewed
- Scalping Chapter 2 "Charts 101" — written
- Scalping Chapter 4 "Reading Fast Markets" — written
- Everything else — outlined level by level in `docs/curriculum.md`
