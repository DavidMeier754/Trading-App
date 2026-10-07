# Question types

_Part of the [ui reference](README.md) · §4–4.2_

## 4. Question interaction types

Shared behaviour: prompt on top, answer area in the middle, then **inline reveal** (5.1). Chosen wrong answer turns red in place, the correct one turns green, the explanation slides in.

Between the answer and the reveal sits a `Check` step on every type but `chart-decision` (§2): disabled until an answer exists, then `Got it`. A single tap is still only a choice until it is checked — two thumb-sized buttons are the easiest thing in the app to hit by accident, and an unconfirmed mis-tap would be a wrong answer the learner never gave.

### 4.1 Core types (v2, unchanged)

| type | Interaction | Rules |
|---|---|---|
| `mc` | 2–4 tappable answer cards, single select. **[DESIGN-REVIEW, picks 2026-10-04]** Each card wears its letter, A to D, and stands on an edge as the key does: it sinks while pressed and the one chosen stays down ("Answers keyed A to D", "Answers with depth"). | Distractors must be plausible. Max 2 in a row. **[v4]** An option may carry `why`; picked, it shows under the explanation. |
| `tf` | Two large side-by-side buttons; the choice is confirmed with `Check`. **[DESIGN-REVIEW, picks 2026-10-04]** They stand on an edge, as `mc`'s cards do. | For misconceptions and single facts. The confirm step is deliberate: the buttons are large and close to the thumb. |
| `numeric-mc` | Like `mc` with number options; reveal shows the working. | |
| `numeric-input` | Custom calculator keypad (digits, `.`, `÷ × − +`, `=`) with a backspace in the field. The field takes a number or a sum (× and ÷ before + and −); a sum's value shows under the field as it is typed, and that value is what is graded; `=` folds the sum into its value. A minus leads the currency (−$0.40); tolerance configurable; reveal shows the working. | Preferred once a calculation has been practiced once. The keypad does the arithmetic, so the question tests knowing which numbers to put together. **[v4]** `sign: any` accepts either sign (`docs/rules/07-variance-and-typed-numbers.md` §3.12). |
| `fill-tiles` | Sentence with a blank; letter tiles below (with 2–4 distractor letters); tap tiles into the blank. | Exactly one accepted word. |
| `fill-choice` | Sentence with a blank; 3–4 word chips. | Use when synonyms exist or the word is long. |
| `match` | Terms left, definitions right, every card as tall as the tallest so the rows line up; tap either side first, then its partner (every tap sounds), or drag; correct pairs lock green; wrong pairs flash red and reset. `Check` once every pair is made. | Max 5 pairs; every target unique. Prompt must be specific to the content, never a generic "Match each word to its meaning." Scored on whether the learner got there without a wrong tap. **[v4]** No wrong tap: green. Exactly one: amber — counts as correct, costs no heart. Two or more: red. ~~Matched pairs keep a colour of their own, so the finished board shows what belongs to what.~~ **[DESIGN-REVIEW]** No colour per pair and no threads (David, 2026-10-03: "remove the different colours and just make it fun via the animations and the haptic feedback"). Every matched pair locks in the one success colour. The fun is in the feel: the two cards snap towards each other and pop, a ring goes out, and each pair lands one note higher with its own light tap; a locked pair then steps back a little so the open ones stand out; the last pair sets off a short wave across the whole board with a firmer haptic. |
| `sort` | 2–3 labeled buckets; chips are dragged (or tap chip, tap bucket). A sorted chip leaves its outline in the pile, so nothing around it moves. | |
| `order` | Tap cards into the sequence. Every place in it is drawn from the start, and a placed card leaves its outline in the pile. | 3–5 items. |
| `hotspot` | A mock component (quote card, quote panel, order ticket, chart); tap the right region. | 1–2 targets. |
| `slider` | Set a value on a slider; reveal shows exact value with a tolerance band. **[DESIGN-REVIEW, picks 2026-10-04]** Set on a **dial** ("Numbers on a dial"): twisted anywhere it turns with the finger, clicks at every step, stops at the scale's ends and settles into the nearest step; − and + beside it turn it a step, and so do a screen reader's swipes. The value sits in the knob; after the check the intended band lights on the scale. `src/screens/Dial.tsx`. | For proportional intuition. |
| `chart-tap` | Tap a candle/point/level on a chart. | Prompt must be unambiguous — if two candles could qualify, constrain it ("the first candle *after your entry*"). |
| `chart-decision` | The scenario engine. See §4.3. | At least one per level from Chapter 2 on. |
| `spot-mistake` | A short statement or ticket with one wrong part; the parts run on as one sentence, each tappable; tap the wrong one. **[LOOK-COMPONENTS] Built:** the parts are the words of one paragraph, each on a soft ground of its own with a dotted underline, so where one ends and the next begins shows; the one picked is lit in the accent, and after Check the wrong part turns green and a wrong pick red, in place. Lines are 40 pt, so parts on two lines stay apart. | Removing the wrong segment must leave a sentence that reads correctly. |

### 4.2 New types **[v3]**

Nine additions. They exist to carry the rep volume of the expanded path without the app feeling like a quiz.

| type | Interaction | Why it earns a slot |
|---|---|---|
| `swipe-deck` | A deck of 4–8 mini-charts, one at a time, full-bleed. Swipe right = **Take it**, left = **Pass** (buttons underneath for the tap-only path). Each card reveals a one-line verdict as it flies off; a summary strip at the end shows the run. **Never timed.** **[LOOK-COMPONENTS] Built:** the card follows the finger sideways and leans as it goes; "Take it" comes up on it to the right, "Pass" to the left. Let go past a third of its width, or flicked, it flies off that way and counts as that call; short of it, it springs back. | The highest-rep-per-minute screen in the app. This is how "sees the setup in half a second" gets built. Counts as one screen per card. |
| `chart-annotate` | Drag a horizontal line onto a chart to mark a level (support, the stop, VWAP, the opening-range high). Snaps to cents; reveal shows the intended line and a tolerance band. | Marking levels is a physical skill; tapping a multiple-choice answer about levels is not. |
| `order-build` | Assemble a complete ticket from chips: side, order type, quantity, limit price, stop price. Wrong parts shake; the reveal shows the finished ticket. **[DESIGN-REVIEW]** It looks like a broker's ticket (§6.7): a Buy / Sell switch that turns green or red, the order types as one segmented row, quantity and prices as rows of their own with their options, and the estimated cost at the bottom once quantity and price are set. | Turns "which order type?" into "place the actual order", which is what Chapter 3 and 8 need. |
| `scanner-pick` | A mock scanner/watchlist table (ticker, % change, relative volume, float, spread, catalyst). Tap the row that meets the stated criteria. 1–2 correct rows. **[DESIGN-REVIEW]** Each row carries a small sparkline of its day and its relative volume as a short bar beside the number (§6.8). | Chapter 5 has no other honest way to teach selection. |
| `compare` | Two or three charts side by side; pick the one that matches the card (or "neither"). | Discrimination is a different skill from recognition, and it is where playbook chapters go wrong. |
| `branch` | A multi-step scenario: choose, see the consequence, choose again, 2–4 steps deep. Each step carries its own reveal; the final screen shows the path taken. Counts as one screen per step. | The only way to teach *management* — trade goes against you, now what? — rather than entry alone. |
| `journal-row` | Fill the fields of one journal row for a finished trade (setup, entry, stop, exit, R, grade) from chips and a keypad. | Makes Chapter 6's journal a thing the user does, not reads about. |
| `depth-ladder` | An interactive Level 2 ladder: answer where a given order fills, or which side is stacked. **[DESIGN-REVIEW]** After Check, a market order is walked through the book: level by level from the best price, each level's size bar drains as it fills, and the level where the last share fills is marked. Nothing else — no running counter, no extra panel (David: "keep it simpler"). | Chapter 4's tape strand needs a native interaction, not a hotspot on a static image. |
| `chart-replay` | A chart the learner advances bar by bar, watching for a setup to form and acting when it triggers. Full spec in 4.4. Counts as one screen per marked moment (setup or decoy), minimum 4. | The only type that tests *timing* and *restraint*. Every other type shows a frozen moment; this one asks "is it now?" — and can measure the trade you took that was never there. |

**Selection rules.** ≥3 different question types per sub-level; ≥10 different types per chapter; every type used at least twice per chapter; max 2 `mc` in a row; every Chapter ≥2 sub-level has at least one visual/interactive screen. `tf` never asks what the prompt gives away.
