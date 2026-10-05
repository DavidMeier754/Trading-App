# Content rules

_Part of the [rules for content and code](README.md) · §3–3.5_

## 3. Content rules (binding)

### 3.1 Units and sizing **[v3 — changed]**

- A **level** is a node on the path (e.g. Level 3). A **sub-level** is one lesson file (e.g. `level-03-2.yaml`, "3-2").
- A sub-level takes **3–4 minutes**: **12–18 screens** at **10–15 seconds each**. Theory-type screens ≈10 s, question screens ≈15 s, chart decisions ≈20 s. `tools/validate_content.py` computes the estimate; stay inside 160–260 s. *(Unchanged — the lesson is still the atom.)*
- **Chapter length: at least 15 levels, typically 16–19.** Never fewer than 15. Split a chapter rather than let a level sprawl.
- **Sub-levels per level: 3–4 for teaching levels.** One- and two-sub levels are now the exception, allowed only for:
  - Tests and Final Exams (exactly 1 sub),
  - short practice/callback levels (2 subs),
  - a deliberate quick win between two heavy levels (2 subs, at most twice per chapter).
  Across a chapter, **at least 60 % of levels must have 3 or more subs**, and at least four levels must have 4.
- **Chapter totals** land around **45–52 sub-levels**. A path (Chapter 1 + seven path chapters) lands around **385** — about 22 hours, or six months at two sub-levels a day.
- Every level has a **title** the user sees on the path map ("Your First Trade", "The Spread Trap").
- Never pad to reach a number, and never compress at the cost of clarity. If a chapter genuinely runs past 19 levels, split it and say so in the report.

### 3.2 Categories and rhythm **[v3 — extended]**

- Categories: `new-theory`, `repetition`, `test`, `final-exam`.
- Rough mix per chapter: ~60 % new theory, ~30 % repetition/practice, **two Tests** (one after roughly the first third, one after roughly the second) and one Final Exam at the end. Soft guide, not a quota.
- **Interleaving:** every new-theory sub-level after the first two contains at least one question that reuses an earlier concept. Standalone repetition subs exist, but never more than **5 `repetition` subs in a row** with no new material in between.

  **Why five, and why only `repetition` counts.** The rule exists so a learner never goes a long stretch with nothing new — not to ration review, and not to make the end of a chapter illegal. A Checkpoint or Final Exam is a distinct event (scored, hearts, its own node on the path map), so it is not "more of the same": it does not lengthen a run, and it does not clear one either — only a `new-theory` sub does. Five is the worst case `docs/course/` actually demands, and it demands it in all three paths: Chapter 7's Capstone (3 subs) runs straight into the Chapter Review (2 subs) before the Final Exam. Everything else the outline asks for is shorter — Chapter 4's Callback + Chapter Review tail is four, and the Practice-then-Checkpoint pattern that punctuates every chapter is two. So five is the smallest number the curriculum can satisfy as written; six would be headroom nothing in the outline needs. Because a test does not reset the counter, the old evasion is closed too: five repetition subs, a Checkpoint, then two more is a run of seven and warns. If a chapter genuinely needs a longer review block, the fix is to split it with new material, not to relabel a practice level as theory.
- Every sub-level's first screen is an `intro`; every Test/Final Exam ends with a `summary` and every Final Exam with a `badge`.
- **[v3]** Each chapter contains at least one **drill sub-level**: a repetition sub whose body is 4–6 chart decisions or swipe decks with almost no theory. These are where recognition is actually built.

### 3.3 Reinforcement across chapters **[v3 — new section]**

The single biggest risk of a 385-sub-level path is that Chapter 2 is forgotten by Chapter 6. Reinforcement is therefore a rule, not a nicety.

- **`reinforces:` header field.** A sub-level lists the earlier chapter numbers whose material it deliberately re-tests, e.g. `reinforces: [1, 3]`. Empty for pure new theory.
- **Callback levels.** Every chapter from 3 onward contains at least one **Callback level** (category `repetition`, 2 subs, titled "… Callback" or similar) that re-tests **two named earlier chapters** in the new chapter's context. Example: Chapter 3's callback re-tests Chapter 1's liquidity and Chapter 2's levels *through* spread and stop placement.
- **Question quota.** At least **15 %** of a chapter's question screens must sit in sub-levels that declare `reinforces`.
- **Exams reach back.** Every Test draws at least **20 %** of its questions from earlier chapters; every Final Exam at least **25 %**. These carry `reinforces` too.
- **Reinforce in context, never verbatim.** A callback question re-tests the old idea inside the new chapter's material. "What is the spread?" is not a callback; "your stop is 6 cents and the spread is 4 — what does that do to the trade?" is.
- Spaced repetition in the Practice hub (docs/ui/12-practice-and-stats.md §7.3) is additional, not a substitute.

### 3.4 Screens and interactions

- Screen archetypes and interaction types are defined in `docs/ui/` and referenced by `type` in the YAML. Level files contain content only — never button labels, colors, animation or layout.
- Each sub-level uses **at least 3 different question types**; no more than **2 `mc` screens in a row**; every Chapter ≥2 sub-level contains at least one visual/interactive screen.
- **[v3] Variety at scale.** Across a chapter, use at least **10 different question types**, and every type in `docs/ui/04-question-types.md` §4 at least twice. No sub-level repeats the same sequence of types as the previous one. At 45 subs a chapter, sameness is the main enemy.
- **[v3] Closing screens vary.** No more than 70 % of a chapter's sub-levels may end on a `theory` card. Use `checklist-reveal`, `visual`, `story`, `example`, `recap` or `plan-card` for the rest.
- **Show, then ask.** A term appears on a theory/example/carousel screen before any question uses it. New terms are listed in `terms_introduced`; the validator checks use-before-definition across the chapter.
- **No self-explanatory questions.** Never ask something answerable from the wording of the prompt alone, or one screen after the exact sentence was shown.
- **Scenarios describe, they do not conclude. [v3]** A `chart-decision` scenario gives the observable facts (where price is, what the level is, what the share size is). It must not stack three verdict words ("thin, flat, nothing nearby") that answer the question before the chart is read. One or two observations, then let the chart carry the rest.
- **Plausible distractors only.** Every wrong option must be something a half-informed beginner could believe. If only one tempting alternative exists, use `tf`, `fill-*` or `numeric-input` instead of `mc`. Three options are fine.
- **No verbatim reuse.** A question may not appear with the same wording in a lesson, a Test and a Final Exam. Re-test the concept with a new situation or new numbers.
- Reveal notes: one sentence (two for numeric working). Say the correct idea, never just "wrong".
- **[v4] Why each wrong option is wrong.** An `mc` option may carry `why` (`docs/level-files/`): the one line shown when that exact option was picked. Write it for the misconceptions worth correcting, not for every option.
- **[v4] No gestures or mechanics in prompts.** "Drag", "tap", "swipe" and game mechanics ("Hearts are on") belong to the UI. A prompt names the task ("Put these in order"), never the gesture; hearts are for the UI to show.
- **[v4] Closing takeaways are labelled.** A `story` screen that sums a lesson up carries `label: takeaway`; "The scene" is for scenes.
- **[v4] Every sub-level has a `subtitle`**, its own short name, shown on the lesson-complete screen and the level card.
- **[v4] Visual quota.** At least 40 % of a chapter's `theory` and `example` screens carry a visual component — *show, then ask* (`docs/ui/01-design-principles.md` §1).
- **[DESIGN-REVIEW] Every question stands on its own.** The app replays questions outside their lesson: the mistakes round, the mistakes reviews on the map, the Practice tab's daily mix and mistakes list (`docs/ui/05-chart-questions-and-mistakes-round.md` §4.5, docs/ui/10-path-map.md §7.1, docs/ui/12-practice-and-stats.md §7.3). So a question names what it needs and never leans on the screen before it ("the chart above", "this quote" when the quote was on the last screen). The exception is a question right after a `story` scene: the app brings the scene along.
- **[DESIGN-REVIEW] Skills.** A `new-theory` lesson names what the learner takes away: every term it defines in `terms_introduced`, and its `skills` line, which lists those words and then the techniques it teaches (`docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills"). They are what the learner collects after the lesson and finds again in Practice → Skills. A technique is something the learner can now *do* ("Reading a quote in two seconds"), not a topic. **[Skills] (2026-10-04)** Every skill is an entry of `content/skills.yaml` with one line of `info`: for a word its definition, agreeing with the card that defines it; for a technique what doing it means. A new lesson adds its names to its `skills` line and its entries to that file (`python3 tools/skills.py --sync` writes the stubs); a practice level may teach one technique; tests teach none.
- **[DESIGN-REVIEW] Don't overdo it** (`docs/ui/01-design-principles.md` §1, principle 11). The new optional fields — chart notes, the open on a chart, a market alert, briefing facts — go only where they teach something on that screen. A simple question stays simple.
- Hedges ("generally", "though it varies") go into reveal notes, never into headlines or answer options.

### 3.4a Plain words, one meaning each **[CONTENT-REVIEW]**

From the content review of 2026-10-04 (`docs/content-todo/05-content-review.md`, items P-03 and P-04), approved by David on 2026-10-05. The learner is a complete beginner, and the app's term marker opens a taught word's card wherever the word appears (`docs/ui/14-glossary-and-copy.md` §8). So a word that means two things shows the wrong card, and an idiom a beginner cannot read is a screen they cannot answer.

**One word, one meaning.** These words mean exactly one thing in every lesson, test and pack. Where the other meaning is wanted, use the word on the right.

| Word | Means only | For the other meaning say |
|---|---|---|
| spread | the difference between the bid and the ask | — (never "gap" for the spread) |
| gap | a jump in price while trading was shut: overnight, or across a halt | "difference" (slippage, news against expectations), "jump" (inside a session), "distance" |
| flat | holding nothing | "break-even", "level" (a trade that made nothing) |
| leg | one push of a move (taught in 2·14-3) | "in and out", "each side" (the two halves of a round trip) |
| the open, the close | the start and the end of the regular session | "the bell" only after one card says it means either |
| ask | the lowest price a seller is asking | "offer" only after one card says it is the same thing |
| edge | positive expectancy (taught in 6·6-1) | before 6·6-1: "a reason to trade", "an advantage" |
| fill | your order trading (taught in 1·6-1) | — |
| print | one trade that happened: a price and a share count (taught in 1·6-3) | "show" for numbers on a screen |

**Plain words.** These idioms and slang words stay out of lessons, or appear only after a card has explained them. Use the plain words instead.

| Avoid | Say |
|---|---|
| house money | "the rest feels free" (and say why it is not) |
| under water, offside | down, losing |
| whipsawed, chop, chopping | jerked up and down, went nowhere |
| rallied, rolled over | climbed, turned back down |
| broke sharply lower | dropped hard |
| a bounce gets sold | every small rise is sold into |
| lifting the offer, taking every bid | paying the ask, selling at whatever buyers pay |
| in play (before 5·3) | a stock with a crowd in it today |
| the street (before 5·11) | its sector |
| nickel, dime | five cents, ten cents |
| tight candle | small candle |
| climax volume | the heaviest volume of the run |
| counter-trend | against the trend |
| swing low | the low of the last dip |
| haircut | the cut for costs |
| rebalancing | funds adjusting what they hold |
| money put on, taken off | big buyers adding, selling |
| "two cents through" (an order price) | two cents above the ask, below the bid |
| restricted (a stock) | say what is restricted: "new shorts are not allowed today" |

**Every term before its first use.** A taught word appears on a card of its lesson before any later lesson uses it, in this chapter or an earlier one; the validator warns about a word used before the lesson that introduces it (`RULES`). Words that are only plain English in an early lesson ("high", "close", "range") are not affected.

The Swing and Day Trading chapters are written with both tables from the start. Stage `RULES` adds the validator warnings (`docs/plan/14-phase-e-design-rules-variance.md`); each `CONTENT-FIX-N` fixes its chapter.

### 3.5 Answer-key hygiene **[v3 — new section]**

A learner must not be able to score well without knowing the material. These are checked by the validator.

- **Correct-option position rotates.** Across a chapter, the correct option must be roughly evenly spread over the available positions. Never author a run of screens whose answer is the first option.
- **True/false balance.** Between 40 % and 60 % of `tf` answers in a chapter are `true`. A learner who always answers "false" must fail.
- **No length tell.** The correct option must not be the longest option in more than ~45 % of a chapter's `mc`/`numeric-mc` screens. Put the justification in the `explanation`, not in the option text. Options are short claims; the reveal carries the reasoning. **[v4]** Nor in fewer than ~15 %: a correct option that is never the longest is a tell as well (Chapter 8 sat at 2 %).
- **No punctuation tell.** Do not make the correct option the only one containing an em-dash, a number, or a qualifier. **[v4]** Checked per chapter as well as per drill pack.
- **Both directions are taught. [v3.1]** Across a chapter's directional `chart-decision` screens — the ones whose `best` is `long` or `short` — neither side may outnumber the other by more than about **2:1**. A learner who always answers "long" must not out-score one who always answers "short", any more than one who always answers "false" may. Checked from eight directional decisions up, below which the ratio says nothing. `no-trade` is not part of the count: how often standing aside is right is a curriculum decision, and the rule below is what protects it. A flipped decision is a **new chart**, not a mirrored one — a short setup reads differently from a long one (the failed push, the lower high, the break that traps buyers), so the scenario, the outcome and the explanation are rewritten with the setups that chapter actually taught.
- **"No trade" is never punished.** On any `chart-decision` whose `best` is `long` or `short`, `no-trade` must appear in `reasonable`. Standing aside is amber at worst, in lessons and in exams alike. This is a promise Chapter 1 makes explicitly and every later chapter must keep.
