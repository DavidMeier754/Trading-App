# Tests, consistency and copy

_Part of the [rules for content and code](README.md) · §3.7–3.9_

### 3.7 Tests and exams

- Test (there are two per chapter) 8–10 scored questions; Final Exam 12–15. `intro.counter` and `summary.total` must equal the number of question screens (validator-enforced).
- Every concept named in the Learning Goal is tested by at least one question.
- **[v3]** Tests and Final Exams reach back into earlier chapters per §3.3.
- Pass mark 70 %. Below that: "Almost — review these levels" with the per-question list and links; the user can retry immediately (hearts apply). **[v4]** The list shows each missed question's correct answer and links to the card that taught it.
- **[v4]** Hearts are lost only in Tests and Final Exams — never in lessons, never in practice.

### 3.8 Consistency across sessions

Chapters are written by different sessions and models. To keep them indistinguishable:

- **Reference files.** Before writing, read `content/shared/chapter-01-market-basics/level-01-1.yaml`, `content/paths/scalping/chapter-03-orders-costs-position-size/level-05-1.yaml` and `content/paths/scalping/chapter-07-scalping-playbook/level-02-2.yaml`. Match their tone (short, direct, second person), difficulty curve and screen rhythm exactly.
- **Outline is binding.** Write the chapter as laid out in `docs/course/` (levels, titles, subs, what each sub teaches, new terms, what it reinforces). If the material truly needs a different split, do it and list the deviation in the session report.
- **Terms.** A chapter may use terms introduced in Chapter 1 and in lower-numbered chapters of the same path (listed in `docs/course/`); the validator warns about anything else and about re-introducing a known term. New terms go into `terms_introduced` of the sub that defines them, defined in plain words on a theory/example/carousel screen first.
- **Charts.** `chart-decision` and `chart-tap` use synthetic data: 8–12 bars, `[open, high, low, close]` per candle, realistic tick sizes, `decision_index` between bar 4 and bar 7, the outcome visible in the remaining bars. Chapter 1 uses `kind: line`; every path chapter uses `kind: candles`. State the share count in the scenario and the P/L in the outcome. **[v4]** From Chapter 3 on, every decision whose `best` is `long` or `short` carries `stop` and `target`, and the outcome follows the first one the bars touch (§3.11).
- **[DESIGN-REVIEW] Charts start simple and grow.** David, 2026-10-03: "keep the charts in the beginning as simple as possible and then after some time crank up the infos, but also explain the user what everything means." An element — volume, levels, the open, stop and target, VWAP, the R ruler, state chips — appears on a chart only from the lesson that explains it on, and the first chart that shows it explains it (a card right before it, or a chart note on it). The ramp per chapter is in `docs/content-todo/01-rules-from-the-design-review.md` 1.2. The R ruler is the app's: it appears by itself on decisions with `stop` and `target` once the lesson that introduces "R" is behind the learner.
- **[v3] Outcome variety.** Within a chapter, the per-share move quoted in `chart-decision` outcomes must span a real range. No single value may account for more than a quarter of them, and the outcome sentence must not use one template every time.
- **Component ids and hotspot targets** are fixed in `docs/level-files/`; never invent new ones — if a screen needs a component that doesn't exist, use the closest existing one and note it in the report.
- **Tokens.** Session times, currency notes, index names and regulation notes always come from `{{market.*}}`; never write "9:30 ET" or "the S&P 500" literally in a path chapter.
- **Difficulty curve.** `difficulty` runs 1–3 and must move. No more than **five consecutive sub-levels** may share the same difficulty; every chapter starts at 1 or 2 and ends at 3.

### 3.9 Copy

- Second person, present tense, one idea per screen. **[v4]** Body text at most **150 characters** — three lines at phone width. (It said ≈220 until 2026-09-25; at 16 pt on a 358 pt column a line holds 45–50 characters, so 220 rendered as four or five lines.)
- **[v4] US English** throughout (color, favor, rumor, practice as noun and verb). The validator lists the British forms it rejects.
- **[v4] One practice account at a time.** When the account a lesson names changes, that lesson says why in one sentence.
- Confident simple statements; nuance in the reveal note.
- Define every new term in plain words on its first appearance and add it to `terms_introduced` (feeds the glossary popover).
- No profitability or success language ("you'll make money", "this works"). Use "improves the odds", "a well-structured trade".
