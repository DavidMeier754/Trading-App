# Build plan

The order of all work, from today to the store release. A Claude Code session does one stage: it reads `02-how-to-work.md` and its stage's file.

## Files

Section numbers are the same as before the docs were split into these files.

| File | Sections | What is in it |
| --- | --- | --- |
| [01-goal-and-guardrails.md](01-goal-and-guardrails.md) | §0 | The goal, the graduate profile, variance, fun, the definition of done. |
| [02-how-to-work.md](02-how-to-work.md) | §1 | How a stage runs, models and effort, the rules, the checks, how David tests. |
| [03-stages-at-a-glance.md](03-stages-at-a-glance.md) | §2–3 | The table of every stage in order, and where things stood on 2026-09-25. |
| [04-decisions.md](04-decisions.md) | §4–4.2 | The decisions made and open, and how each stage is described. |
| [05-phase-a-foundation.md](05-phase-a-foundation.md) | §5 | `MERGE`, `DOCS`, `CI`, `WIRE`. |
| [06-phase-b-stable.md](06-phase-b-stable.md) | §6 | `STABLE-APP`, `STABLE-DATA`. |
| [07-phase-c-look-brief.md](07-phase-c-look-brief.md) | §7 | `LOOK-BRIEF`. |
| [08-phase-c-look-system.md](08-phase-c-look-system.md) | §7 | `LOOK-SYSTEM`. |
| [09-phase-c-design-review.md](09-phase-c-design-review.md) | §7 | `DESIGN-REVIEW`: goal, what happened, David's verdicts. |
| [10-phase-c-design-review-scope.md](10-phase-c-design-review-scope.md) | §7 | `DESIGN-REVIEW`: scope, status, what is left, prompt and test. |
| [11-phase-c-components-and-visuals.md](11-phase-c-components-and-visuals.md) | §7 | `LOOK-COMPONENTS`, `VISUALS`. |
| [12-phase-d-hearts-daily-onboarding.md](12-phase-d-hearts-daily-onboarding.md) | §8 | `LOOP-HEARTS`, `LOOP-DAILY`, `ONBOARDING`. |
| [13-phase-d-practice-to-fun-pass.md](13-phase-d-practice-to-fun-pass.md) | §8 | `PRACTICE`, `GLOSSARY`, `STATS`, `TABS`, `FUN-PASS`. |
| [14-phase-e-design-rules-variance.md](14-phase-e-design-rules-variance.md) | §9 | `CONTENT-DESIGN`, `CONTENT-REVIEW` ✅, `RULES`, `VARIANCE`. |
| [15-phase-e-offer-fixes-reviews.md](15-phase-e-offer-fixes-reviews.md) | §9 | `OFFER`, `CONTENT-FIX-1` … `-8`, `OWN-STRATEGY-OUTLINE`, `OWN-STRATEGY`, `KNOWLEDGE`, `KNOWLEDGE-FIX`, `REVIEW-A`, `EXPERT`. |
| [16-phase-f-beta-1.md](16-phase-f-beta-1.md) | §10 | `BRAND`, `LEGAL-DRAFT`, `STORE-SETUP`, `ANALYTICS`, `BETA-1`. |
| [17-phase-g-arena-idea-and-design.md](17-phase-g-arena-idea-and-design.md) | §11 | The idea, `ARENA-DESIGN`, `REPLAY-PILOT`. |
| [18-phase-g-arena-build.md](18-phase-g-arena-build.md) | §11 | `CHART-GEN`, `ARENA-TAB`, `SIM-ACCOUNT`, `DRILLS`, `REPLAY-BANK`. |
| [19-phase-h-swing-and-day.md](19-phase-h-swing-and-day.md) | §12 | `SWING-2` … `-8`, `SWING-REVIEW`, `DAY-2` … `-8`, `DAY-REVIEW`, `ARENA-PATHS`. |
| [20-phase-i-platform.md](20-phase-i-platform.md) | §13 | `BACKEND`, `MONEY`, `ADS`, `UPDATES`, `TECH`. |
| [21-phase-j-languages.md](21-phase-j-languages.md) | §14 | `I18N-PIPELINE`, `MARKETS`, `TRANSLATE-1` … `-n`, `RTL`, `LANG-REVIEW`. |
| [22-phase-k-release-and-after.md](22-phase-k-release-and-after.md) | §15–16 | `A11Y-PERF`, `LEGAL-FINAL`, `STORE-LISTING`, `BETA-2`, `RELEASE`; Phase L, the outlook. |
| [23-appendix-templates.md](23-appendix-templates.md) | §17 | Bug report, accepting a stage, the newcomer test, the beta questionnaire. |
| [24-appendix-e-prompt-frame.md](24-appendix-e-prompt-frame.md) | §17 | The frame of every prompt, and the prompts for `OFFER` and the replays. |
| [25-appendix-e-content-prompts.md](25-appendix-e-content-prompts.md) | §17 | State chips, drills, review passes A and B, new paths, sizing. |
| [26-appendix-f-review-map.md](26-appendix-f-review-map.md) | §17 | Every review item and the stage that handles it. |

## About this plan

Status: 2026-09-25. This plan replaces the previous build plan, which ordered only the content work. Its proven content prompts are kept in **Appendix E**, unchanged or updated.

Updated the same day with David's answers to the open decisions (§4.1): all three paths, calm motion, the practice arena with Nutrade Plus, accounts, every launch language, and a German business as the provider.

**Updated 2026-10-03** (stage `DESIGN-REVIEW`): David's verdicts on 50 design ideas. The approved ones are built in that stage, which is new in this plan (Phase C, after `LOOK-SYSTEM`), and every later stage now says what it no longer needs to build and what it still owns. The variance simulator is dropped and the app never states how often something works (§0 "Variance"). The content these designs need is in the new `docs/content-todo/`, which every content stage reads. And the work runs in **Claude Code sessions** again, one per stage, instead of threads in the Claude project (§1).

**Updated 2026-10-05** (stage `CONTENT-REVIEW`): the beginner's read of every chapter, all 88 changes approved by David (`docs/content-todo/05-content-review.md`). The cross-chapter fixes are done; the `CONTENT-FIX` passes carry the rest and may run in parallel; Chapter 9 "Your Own Strategy" has two new stages.

**One rule first: this plan's order is the order.**
- Stages have names (`CI`, `STABLE-APP`, …), not numbers, because numbers drifted apart before.
- To find what comes next, read the table in section 2 (`03-stages-at-a-glance.md`) from top to bottom. The first stage without ✅ is the next one.
