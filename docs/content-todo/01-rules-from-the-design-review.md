# Rules from the design review

_Part of the [content to do](README.md) · §1–1.5_

## Part 1 — Rules from David's verdicts

These hold for every content change from now on. `docs/rules/` carries the same rules; they are repeated here because every item below depends on them.

### 1.1 No reliable-looking odds

David, 2026-10-03, on the variance simulator: "this would imply the number given (like 6/10 are right) are reliable and I don't want this. The user should do his own research on how often strats work for him."

- Never state how often a setup, a strategy or a decision wins as if it were a fact: not "about 4 in 10", not "6 of 10 work", not a win rate per setup, not "this setup loses a third of the time".
- A number in an example is there for the arithmetic, and the screen says so ("Say a method wins 4 trades in 10 …"). It is never presented as the real rate of anything the course teaches.
- How often a method works is something each learner finds out for themselves: from their own journal and their own simulator sample, over enough trades (Chapter 6 teaches how many, Chapter 8 Level 11 how to read them). Say that instead of giving a rate.
- The right-but-lost reveal says it without a number. The app's line (`src/lesson/decisionReveal.ts`): "Right call — this trade lost anyway. One trade says little; judge the decision, not the result."
- Unchanged: the share of correct decisions that lose inside the content (`docs/rules/07-variance-and-typed-numbers.md` §3.11, 30–40 % from Chapter 2 on). That is how realistic the charts are, not a claim the learner reads.

### 1.2 Charts start simple and grow

David, 2026-10-03, on the R ruler: "keep the charts in the beginning as simple as possible and then after some time crank up the infos, but also explain the user what everything means."

- An element appears on a chart only from the lesson that explains it on. Before that lesson, no chart shows it.
- The first chart that shows an element is explained: a theory or example card right before it, or a chart note (Part 2.2) on that first chart.
- The ramp for the scalping path (the swing and day-trading chapters follow the same idea with their own lessons):

| From | Element on the chart | Explained in |
|---|---|---|
| Ch 1 | One line, the price axis, the box over what happened next | 1·1-1 |
| Ch 2 · L1 | Candles | 2·1-1 (`candle-anatomy`) |
| Ch 2 · L4 | Volume bars | 2·4-1 |
| Ch 2 · L9 | Level lines (support, resistance, yesterday's high and low) | 2·9-1 |
| Ch 2 · L13 | The open: pre-market shade and the bell line (`session_open`), only where the open matters | 2·13-1 |
| Ch 3 · L9 | The stop and target lines on directional decisions (`stop`, `target`) | 3·3-1 (target), 3·9-1 (stop) |
| Ch 4 · L1 | The VWAP line | 4·1-1 |
| Ch 5 | Context in the story: the market alert (`alert`) | 5·1 |
| Ch 6 · L2 | The R ruler beside the price axis (the app shows it by itself once the lesson that introduces "R" is behind the learner) | 6·2-1 |
| Ch 6 | Session state chips (day in R, limit, trades taken) | 6·9 |
| Ch 7–8 | Whatever the setup card needs, and nothing it does not | each setup's theory sub |

### 1.3 Do not overdo it

David, 2026-10-03: "This is an example of not to overdo it. This is too much for such a simple question" (the slider with ticks), "make the design better and again DON'T OVERDO / BRING TOO MUCH CONTENT ON ONE PAGE" (the plan document), "in the example there is too much going on. Keep it simpler" (the order eating the book).

- A simple question stays simple: one chart or one visual, one question, few words.
- A new field (notes, an alert, facts, the open marker) goes on a screen only where it teaches something on that screen. When in doubt, leave it out.
- The limits in Part 2 are maximums, not targets.

### 1.4 Terms: neither too many nor too few

David, 2026-10-03, on the term marker: "Don't over or underuse them."

The app marks terms by itself (`docs/ui/14-glossary-and-copy.md` §8): only terms taught in an earlier lesson, only their first appearance in a lesson, and at most two on one screen. What content owes it:
- Every term a lesson defines is in that lesson's `terms_introduced`, spelled as the body text spells it (case does not matter; the plural with an "s" is found too).
- A term is defined on a `theory`, `example` or `carousel` screen of that lesson before any question uses it (`docs/rules/03-content-rules.md` §3.4). That card is what the learner gets back when they open the term or the skill later.
- No term is introduced twice.
- Today (2026-10-03) the validator warns about 9 terms that no card of their lesson names, so their skill has no card to open: 1·1-1 "Trade"; 1·4-1 "Quote", "Previous close", "Daily change" (taught on a walkthrough, which the term search does not read); 1·13-1 "Cover"; 3·1-1 "Quote panel"; 3·14-1 "Per-share fee"; 7·1-1 "Playbook card"; 7·3-1 "Opening-range scalp". Name each on a theory, example or carousel card of its lesson (`CONTENT-FIX-1`, `-3`, `-7`).

### 1.5 Every question stands on its own

New since `DESIGN-REVIEW`: the app replays questions outside their lesson — in the mistakes round, in the mistakes reviews on the map (`docs/ui/10-path-map.md` §7.1), in the Practice tab's daily mix and mistakes list (§7.3). A question that leans on the screen before it breaks there.
- A question names what it needs ("XYZ's chart", "the quote above" is fine only when the quote is on the same screen).
- The one exception: a question right after a `story` scene. The app brings the scene along, so "What do you do now?" after a scene still works.
- `CONTENT-FIX-N` checks every question of its chapter for this.
