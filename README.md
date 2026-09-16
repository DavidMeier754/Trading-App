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
| `docs/remediation-prompts.md` | The six stages that finish the written path: one ready-to-run prompt each, with model, effort and session. |
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

The scalping path is complete: all eight chapters written, 387 sub-levels, 0 validator errors.
Chapter 1 is shared, so a learner sees 47 + 340 = 387 sub-levels — about 20 hours, or six
months at two a day. Day Trading and Swing Trading are outlined level by level in
`docs/curriculum.md`; no content written.

| Chapter | Levels | Subs | v3 target |
|---|---|---|---|
| 1 Market Basics (shared) | 17 | 47 | 17 / 47 |
| Scalping 2 Charts 101 | 18 | 49 | 18 / 49 |
| Scalping 3 Orders, Costs & Position Size | 19 | 50 | 19 / 50 |
| Scalping 4 Reading Fast Markets | 18 | 48 | 18 / 48 |
| Scalping 5 Finding the Trade | 17 | 45 | 17 / 45 |
| Scalping 6 Risk & Psychology | 19 | 51 | 19 / 51 |
| Scalping 7 Scalping Playbook | 19 | 50 | 19 / 50 |
| Scalping 8 The Trading Day | 17 | 47 | 17 / 47 |

Level titles, sub counts, `reinforces` values and glossary terms match `docs/curriculum.md` exactly.

### Open work, in the order it should be done

1. ~~**Category labels.**~~ **Done.** The review-run rule in `docs/agent.md` §3.2 now caps
   consecutive `repetition` subs at five — the worst case the curriculum demands of any path
   (Chapter 7's Capstone straight into the Chapter Review) — and a Checkpoint no longer counts as
   more of the same. The 19 levels the curriculum marks `R` carry `category: repetition` again.
   Repetition runs at 16–44 % of subs, against a ~30 % guide.
2. ~~**Plan sheet.**~~ **Done.** `docs/schema.md` ("The plan") now holds one key namespace for the
   whole path, grouped into practice setup, cost limits, the read, session limits, playbook cards
   and the simulator/live plan, with revisiting a field defined as pre-filled and editable over one
   live value. All 16 `plan-card` screens are re-keyed to it, the eight setup levels of Chapter 7
   each write their own card, and a validator rule fails any `plan-sheet` line whose key no earlier
   `plan-card` wrote.
3. **Position sizes.** Simulated positions sit at 90–97 % of the stated account (all 89 of
   Chapter 2's decisions are over 50 %), which contradicts the 50 % cap the learner writes on their
   own plan card in Chapter 1 and makes Chapter 3's "account ceiling" the norm rather than the
   exception it is taught as.
4. **Scenario phrasing.** Chapters 2, 4 and 5 end 89–100 % of their `chart-decision` scenarios on
   one sentence shape. Session state belongs in `state` chips (`docs/UI.md` §6.4), which Chapter 8
   already uses for 74 % of its decisions and Chapters 1–2 for none.
5. **Exams.** Tests and final exams run 35 % interactive screens against 64–68 % in the lessons.
   Chapter 1's final exam has no `chart-decision` at all; Chapter 3's second checkpoint has no
   chart interaction of any kind.
6. **Long/short balance.** 214 long against 105 short across the path (Chapter 8 is 25:3).
7. **Drill bank** (`content/drills/`) — not started. `docs/curriculum.md` and `docs/UI.md` §7.3 size
   it at ~350 screens; without it the Practice hub, daily mix, setup drills, weekly challenge and
   spaced repetition have no content.

`python3 tools/validate_content.py` reports the phrasing items above as warnings. The rest are
tracked here because no rule can see them. Each item has a filled-in prompt, a model and an
effort setting in `docs/remediation-prompts.md` — work them in the order given there.
