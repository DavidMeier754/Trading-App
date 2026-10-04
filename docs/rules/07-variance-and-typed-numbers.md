# Variance and typed numbers

_Part of the [rules for content and code](README.md) · §3.11–3.12_

### 3.11 Decisions and outcomes (variance) **[v4 — new section]**

A correct decision can lose, and the course has to teach that before it happens — not let the learner discover it as a contradiction. Until 2026-09-25, only 12 of the 338 correct directional decisions in the scalping path ended in a loss, and Chapters 1–4 had none at all. That teaches "right = profit", the most dangerous belief a trading course can leave behind, and it contradicts Chapter 6, where a 40 % win rate can pay.

- **Teach it first.** Chapter 1 Level 2-4 ("Good Call, Bad Luck") introduces variance ~~with the `variance-sim` screen (`docs/ui/09-order-tools-and-other-visuals.md` §6.10)~~ before any correct decision in the course loses. **[DESIGN-REVIEW]** Without a simulator: with the learner's own first right call that loses, and the `decision-grid` visual (`docs/ui/09-order-tools-and-other-visuals.md` §6.10; a screen sequence is in `docs/content-todo/04-still-to-write-and-done-log.md` 4.1).
- **Then show it at a realistic rate.** Among a chapter's `chart-decision` screens whose `best` is `long`, `short` or `buy`, the share that ends in a loss is:

  | Where | Correct decisions that lose |
  |---|---|
  | Chapter 1 before Level 2-4 | 0 % |
  | Chapter 1 from Level 2-4 on | 20–30 %, never two in a row |
  | Chapters 2–8 of every path, every drill pack | 30–40 % |

  The validator checks it from eight such decisions up.
- **Grade the decision, report the outcome.** The reveal grades the decision (green, amber, red) and reports the outcome underneath, smaller (`docs/ui/06-reveal-and-hearts.md` §5.1b). A correct decision that loses is green, earns full XP and keeps a perfect run; its reveal says in one line that it was the right call, the trade lost anyway, ~~and roughly how often that happens for this setup~~ **[DESIGN-REVIEW]** and that one trade says little — with no rate. A reasonable (amber) decision that happened to win is still amber, and says why.
- **Make the exit visible.** From Chapter 3 on, every directional decision carries `stop` and `target` (`docs/level-files/`); playback ends at the first one the bars touch, so "stopped out" is something the learner watches happen.
- **The outcome sentence matches the chart,** in plain terms: "It dipped through $18.02 and the stop took you out: −$84 on 600 shares, −1R." Never "unlucky", never an excuse, never a hint that the decision was wrong when it was not.
- **Variance is never an alibi.** A wrong decision that happened to win is graded wrong, and its reveal says what was wrong with it.
- **Reinforce it.** Lesson summaries count decisions and results separately (`docs/ui/07-lesson-chapter-and-tier-complete.md` §5.3); the stats screen measures decision quality, never profit (`docs/ui/12-practice-and-stats.md` §7.4); ~~Chapter 6 Levels 6 and 13 run the simulator again with the learner's own numbers~~ **[DESIGN-REVIEW]** Chapter 6 Levels 6 and 13 teach how to measure a method from one's own sample (the journal, the simulator) and why a few trades say little; Chapter 8 Level 11 does it with the learner's own numbers.
- **[DESIGN-REVIEW] No reliable-looking odds.** David, 2026-10-03: "this would imply the number given (like 6/10 are right) are reliable and I don't want this. The user should do his own research on how often strats work for him." So:
  - No screen, reveal, card, alert, notification or store text states how often a setup, a strategy or a decision wins or loses as a fact — not "about 4 in 10", not "this setup works 6 times in 10", not a win rate per setup.
  - A number in an example is there for the arithmetic, and the screen says so ("Say a method wins 4 trades in 10 …"). Chapter 6's expectancy lessons keep their example numbers on those terms.
  - How often a method works is the learner's to find out, from their own journal and simulator sample over enough trades. The content says that instead of giving a rate.
  - The share of correct decisions that lose inside the content (the table above) is unchanged: it is how realistic the charts are, never a number shown to the learner.
  - The learner's own counts are fine and wanted: "Your right calls: 31 won, 17 lost" (`docs/ui/12-practice-and-stats.md` §7.4) is their record, not a promise. Nothing calls a split good, normal or expected.

### 3.12 Numbers the learner types **[v4 — new section]**

A learner who understood the lesson must never lose a point to a sign. Until 2026-09-25 the same kind of question expected −0.40 in one lesson and +30 in the next (review M10).

- A `numeric-input` whose answer is a loss or a fall does one of three things: asks for the amount ("How much did you lose?" — the answer is positive); asks for the signed result and says so ("the result with its sign, e.g. −0.40"); or sets `sign: any`, so both are accepted.
- Ask for a signed answer only where the lesson has just taught the sign — a P/L, an R-multiple — and then the same way across the whole chapter.
- The `working` line shows the sign the answer expects.
