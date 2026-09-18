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
| `content/drills/packs.yaml` | The drill-pack manifest: one entry per Practice-hub pack, with its unlock, size, concepts and the three exemplars the batch run is built from. |
| `content/drills/<path>/` | The drill packs themselves — flat banks of question screens, no lesson structure. |
| `tools/validate_content.py` | Validates all lesson files and drill packs; `--status` prints chapter and pack statistics. |
| `tools/build_drill_batch.py` | Stage 4: builds one Batch API request per drill pack from the manifest, and writes the results back into `content/drills/`. |
| `tools/test_validate.py` | Self-test for the validator. Run it after changing `validate_content.py`. |
| `tools/check_sizing.py` | Every simulated position against the 95 % concentration rule, with every other line in the file that names the same share count. |

## Validate content

```
python3 tools/validate_content.py            # errors and warnings
python3 tools/validate_content.py --status   # levels, screens, minutes per chapter
python3 tools/validate_content.py --strict   # chapter-level warnings become errors
python3 tools/test_validate.py               # self-test: every validator rule still fires
python3 tools/check_sizing.py --summary       # concentration by chapter
python3 tools/check_sizing.py --chapter 2    # every position in one chapter, with its mentions
python3 tools/build_drill_batch.py --check   # the drill manifest and its exemplars resolve
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
3. **Position sizes** — **mostly done; Chapters 1 and 2 left.** The rule is settled
   (`docs/agent.md` §3.6): one position at a time, and
   `shares × price ≤ 0.95 × the account named in the file`. The concentration stays and gets taught —
   1 % of the account divided by a scalper's sub-1 % stop buys nearly all the cash whatever the
   account is, so the size is large and the risk is small, and they are different numbers.
   Chapter 3 Level 10 now teaches both ceilings and takes the lower one (10-3, 10-4), and
   Chapters 3–8 are clean against the cap. What is left:
   **66 of 572 priced positions still breach it** — 60 in Chapter 2, 6 in Chapter 1, and one
   Chapter 1 position that is more stock than the stated account can pay for:
   `chapter-01-market-basics/level-09-2.yaml` screen 4, 500 shares × $12.80 = $6,400 against a
   $6,000 account (106.7 %). That one is the hard error in the set and should go first. Chapter 1's plan card
   (`level-16-2.yaml`) also still suggests `setup_max_account_pct: 50`, which contradicts the rule
   it is meant to record — it should suggest **95**.
   `python3 tools/check_sizing.py --chapter N` lists the breaches with every line that names the
   same share count (3,332 corpus-wide). Medians now: ch1 90 %, ch2 97 %, ch3 87 %, ch4 90 %,
   ch5 88 %, ch6 89 %, ch7 87 %, ch8 86 %. A further 100 positions name no account at all, so no
   rule can see them — unchecked, not exempt.
4. **Scenario phrasing** — **the three named chapters are done; four others sit lower.**
   Session state belongs in `state` chips (`docs/UI.md` §6.4), not in a sentence tacked onto the
   scenario. Chapters 2, 4 and 5 were the complaint and are now at **100 %** of their
   `chart-decision` screens. The spread across the path: ch1 0 %, ch2 100 %, ch3 37 %, ch4 100 %,
   ch5 100 %, ch6 38 %, ch7 16 %, ch8 74 %. Chapter 7 is the one worth doing next — 102 decisions,
   the most of any chapter, at 16 %. Chapter 1's 0 % may be correct rather than a gap: it runs line
   charts and buy/wait decisions with no session state to put in a chip, so check before changing it.
5. ~~**Exams.**~~ **Done.** Every test and final exam now carries at least one chart question —
   Chapter 1's final exam has three, Chapter 3's second checkpoint three. Interactivity is at
   parity with the lessons: **50 %** of exam question screens are interactive against **49 %** in
   the lessons (the old "35 % against 64–68 %" compared two different denominators and overstated
   the gap).
6. **Long/short balance** — **done.** The path runs 199 long against 123 short; no chapter is
   worse than 1.85:1 among its directional decisions (Chapter 2, the closest to the line).
   Sixteen charts were rewritten as shorts in Chapters 3, 5 and 8, and
   `tools/validate_content.py` now checks the ratio per chapter, from eight directional
   decisions up.
7. **Drill bank** (`content/drills/`) — **designed, 1 of 15 packs written.** `content/drills/packs.yaml`
   is the manifest: fifteen packs, 370 screens, each with its unlock sub-level, concept list and the
   three exemplars its batch request carries. `tools/build_drill_batch.py` builds the Stage 4 batch
   from it and `tools/validate_content.py` now validates packs (question screens only, 10–40 per
   pack, a real `unlocked_by`, answer-key hygiene and the §3.6 ceilings over the whole pack).
   `content/drills/scalping/cost-check.yaml` is hand-written and clean, as the proof the format and
   the validator agree; the other fourteen are the batch run.

8. **Sub-level distribution** — **a rule/plan disagreement, not a content defect.** Chapters 3, 5
   and 7 sit at 58–59 % of levels with three or more sub-levels, against the ≥60 % in
   `docs/agent.md` §3.1, so the validator warns on all three. Each is one level short, and each
   matches its `docs/curriculum.md` table exactly — the plan itself does not reach 60 % in those
   chapters. Decide once which side moves: relax the rule to 55 %, or add a sub-level to one level
   in each of the three chapters. Do not "fix" it by drifting from the curriculum.

`python3 tools/validate_content.py` reports the phrasing items above as warnings. The rest are
tracked here because no rule can see them. Each item has a filled-in prompt, a model and an
effort setting in `docs/remediation-prompts.md` — work them in the order given there.
