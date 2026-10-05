# Still to write, and the done log

_Part of the [content to do](README.md) · §4–5_

## Part 4 — Content still to be written

| # | What | Size | Stage | Status |
|---|---|---|---|---|
| 4.1 | Chapter 1 Level 2-4 "Good Call, Bad Luck", **without the variance simulator** (below) | 1 lesson, 12–16 screens | `VARIANCE` | [ ] |
| 4.2 | Scalping Chapter 8 Level 15 "What You'll Actually Be Offered" + renumbering | 4 lessons | `OFFER` | [ ] |
| 4.3 | ~~`content/glossary.yaml`~~: one sentence per term of every `terms_introduced` — now the words' `info` in `content/skills.yaml`; `GLOSSARY` adds the aliases | 194 words | `DESIGN-REVIEW` | [x] |
| 4.4 | Bonus side lessons "Spot it" (2.7) | 2–3 per chapter from Chapter 2 on, 2–3 replays each | `FUN-PASS` (hand-written), `ARENA-TAB` (generated) | [ ] |
| 4.5 | The replay bank | 22 replays per path | `REPLAY-PILOT`, `REPLAY-BANK`, `ARENA-PATHS` | [ ] |
| 4.6 | Drill packs `selection` and `risk-calls` | 2 packs | `DRILLS` | [ ] |
| 4.7 | Swing Trading Chapters 2–8, then Day Trading Chapters 2–8 — written with Parts 1–3 from the start | 14 chapters | `SWING-n`, `DAY-n` | [ ] |
| 4.8 | ~~Skills (2.6)~~ (done in `DESIGN-REVIEW`) and term fixes (1.4) for all written chapters | 388 lessons | `CONTENT-FIX-1` … `-8` | [ ] |
| 4.9 | Test bench entries for every new field: a decision with `stop`, `target` and `notes`; a chart with `session_open`; a story with an `alert`; a test intro with `facts`; a header with `skills`; one bonus file | `demo/all-screens.yaml` + one bonus file in `demo/` | `CONTENT-DESIGN` | [ ] |
| 4.10 | The first trade (onboarding): today a fixed chart in `src/onboarding/firstTrade.ts`. Move it to content if the content sessions want to own it (`content/onboarding.yaml`); otherwise it stays | 1 chart | `ONBOARDING` | [ ] |

### 4.1 Lesson 1·2-4 without the simulator

The variance simulator (`variance-sim`) is dropped (David, 2026-10-03, rule 1.1). The lesson teaches the same idea — a good decision can lose, and one trade says little — with the learner's own decisions and the decision grid, and without a single rate. A sequence that fits `docs/course/`:

1. `intro` — "A good call can still lose."
2. `story` — a clean read on XYZ at a level; the learner is about to buy.
3. `chart-decision` (buy / wait), best `buy`, and it loses: the first correct decision in the course that loses. The reveal grades it green and puts the dot in "Right call · Lost".
4. `theory` with the `decision-grid` visual — decision and result are two different things: four cells, right or wrong, won or lost.
5. `theory` — why a good read can lose: the next buyer, seller or headline cannot be known.
6. `tf` — "A trade that lost was a bad decision." (false)
7. `sort` — four short trades into the grid's cells.
8. `chart-decision`, best `wait`, where buying would have won: standing aside was still right (the grey "had you bought" line).
9. `numeric-input` — "Eight decisions, six of them right. Two of the right ones lost. How many right calls won?" (4)
10. `theory` — "How often does it work? Your records say." Nobody can promise how often a setup works for you; you find out by keeping score, and Chapter 6 shows how.
11. `mc` — which cell a described trade belongs in.
12. `story`, `label: takeaway` — "Judge the decision, not the result."

The `decision-grid` visual is built (`docs/ui/09-order-tools-and-other-visuals.md` §6.10, `docs/level-files/`). The reveal's **Why?** opens card 4.

---

## Part 5 — Done log

| Date | Item | Stage | PR |
|---|---|---|---|
| 2026-10-04 | 2.6 Skills: `content/skills.yaml` (402 skills with their info) and a `skills` line in all 388 level files; 3.1 Skills; 4.3 (definitions); `tools/skills.py` | `DESIGN-REVIEW` | #22 |
| 2026-10-05 | 6 (Part 6, the content review): the spread sweep in all chapters (C1-14, C2-05, C3-01, C6-14); Print, Fill, Gap and Setup taught in Chapter 1, Leg in Chapter 2, Grade-A trade in 6·15-1 (C1-08, C1-09, C2-06, C6-17, C6-18); the 7·3-2 box labels (C7-01, C7-02); the word rules (`docs/rules/03-content-rules.md` §3.4a) | `CONTENT-REVIEW` | #24 |
