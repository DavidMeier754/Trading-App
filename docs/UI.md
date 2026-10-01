# UI.md — Trading Learning App

Generalized UI reference for every screen, interaction, animation and layout idea in the app.
Level files (`content/**/level-XX-Y.yaml`) do NOT describe UI. They reference the archetype IDs
defined here via `type:` plus the actual content (text, options, correct answer, explanation).
Everything about *how* a screen looks, moves and reacts lives in this file.

Status: **v3** — expanded for the eight-chapter curriculum. New interaction types, components and
long-path gamification are marked **[v3]**. Everything unmarked is unchanged from v2.
**[v4] (2026-09-25)** — the release plan's decisions (`docs/build-plan.md` §4.1): hearts only in
tests, the mistakes round, the reveal that grades a decision apart from its outcome, answers in the
thumb zone, a scroll fallback instead of illegible shrinking, at most three looks plus light and dark,
no leaderboard in v1.0. Marked **[v4]**.
**[v4.1] (2026-09-25)** — David's answers to the open decisions: calm, high-quality motion (H), the
practice arena and Nutrade Plus with ads in the free tier (I), accounts (K), every launch language
(M). Marked **[v4.1]**.

---

## 1. Design principles

1. **One idea per screen.** A screen teaches one thing or asks one thing, never both.
2. **10–15 seconds per screen.** Theory cards are read in ~10 s, questions answered in ~15 s. A sub-level is 12–18 screens and takes 3–4 minutes. If a card needs longer, split it.
3. **Thumb-first.** Primary action always at the bottom, full-width, reachable one-handed. Answers are big tap targets (min 48 pt). **[v4]** Answers sit in the lower half, directly above the CTA; the question and its visual sit above them.
4. **Instant feedback, never a dead end.** Every answer reveals right/wrong in place within 100 ms. No separate feedback screen. The user always sees the correct answer before moving on.
5. **Show, then ask.** A concept is shown (card, visual, animation) before it is asked. Every defined term is tappable (Glossary popover, section 8).
6. **No pressure.** No timers, countdowns or quick-fire rounds anywhere — **including the new rapid types in §4**. **[v4]** Hearts are spent only in Tests and Final Exams; lessons and practice never cost one (§5.2).
7. **Motion has a purpose.** Animations explain (a slice filling, a spread widening) or reward (badge unlock). Respect the OS "reduce motion" setting. **[v4.1]** Motion is calm and high quality (decision H): unhurried, smooth at the display's frame rate on cheap phones too, and never in the way — the response to a tap starts at once, and a tap finishes or skips any running motion.
8. **Numbers are real.** Prices, spreads and costs use one format everywhere (section 9). Cost math always shows a share count.
9. **Confident tone, tiny caveats.** The card says the simple true thing in one sentence; nuance goes into the reveal note or glossary.
10. **[v3] Variety is a feature, not a decoration.** The path is ~385 sub-levels. A learner meets the same archetype hundreds of times, so every archetype must be worth meeting again, and no chapter may lean on three of them.

---

## 2. Global layout (lesson player)

```
┌──────────────────────────────────────┐
│ ✕   ▓▓▓▓▓▓▓▓░░░░░░░░░░  4/12   ♥ 5   │  top bar: close, progress, step count, hearts
├──────────────────────────────────────┤
│                                      │
│  question, card or visual            │  in the middle of the area; body text max ~3 lines
│  [ answer                         ]  │  the answers right under it
│  [ answer                         ]  │
│                                      │
│  ( strip kept free for the reveal )  │  the reveal rises into it after Check (calm, §5.1)
│  ┌──────────────────────────────┐    │
│  │        CONTINUE / CHECK      │    │  single primary CTA, full width, bottom safe-area
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

- **Progress bar** = screens completed in this sub-level; fills with a 300 ms ease-out per advance.
- **Step count** **[LOOK-SYSTEM]**: "4/12" beside the bar in every lesson, in the number face (Precise, §10), so the bar keeps its length from "9/12" to "10/12"; screen readers hear "Step 4 of 12".
- **Close ✕** → sheet "Quit this lesson? Your progress in it is lost." **[v4]** The sheet's primary button is **Keep learning**; **Quit** is the secondary action under it. UI copy says "lesson", never "sub-level".
- No back button inside a lesson; theory cards can be re-read from the level sheet ("Review cards") afterwards. **[v4]** On a question screen, **See the card again** opens the lesson's last theory card as an overlay; closing it returns to the question exactly as it was. The lesson itself never goes back.
- **CTA states:** `Continue` (theory), `Check` (question, disabled until an answer is selected), `Got it` (after reveal), `Finish` (last screen).
- **One screen, one screenful.** A screen never scrolls. Section 1's "one idea per screen" is a layout rule as much as a content one: if a screen does not fit, it is two screens. This is what keeps the CTA in the same place under the thumb on every screen of a 385-sub-level path. The exception is dynamic type (section 10). **[v4]** And small phones: the fitter may shrink a screen to **85 %** at most. Below that the content scrolls above a fixed CTA instead of shrinking further — at 60 % body text was 9–10 px on a 320 pt phone, and an illegible screen that holds still is worse than a legible one that scrolls. A screen that needs the scroll at 390 pt is a content bug (split it); at 320 pt or with large type the scroll is the fallback. **[LOOK-SYSTEM]** On a screen that scrolls, the strip kept for the reveal is the end of the scroll, and the screen scrolls to it when the reveal arrives (at once under reduce motion), so the key never covers the result (`src/lesson/fit.tsx`).
- **`Check` on every question but one.** Every question type is graded on `Check`, disabled until an answer exists, then `Got it`: a mis-tap stays a tap the learner can take back, and every screen resolves the same way. `chart-decision` is the exception — its Long / Short / No trade buttons rise into the CTA slot, and choosing one commits it. (Until v3.1, `mc`, `numeric-mc` and `match` committed on the tap; play-testing found the mis-taps cost more than the extra tap.)
- **Nothing moves unless the learner moved it.** A screen arrives laid out — its question and visual at the top of its area, its answers anchored above the room its reveal will take (**[v4]**, built in LOOK-SYSTEM as `ThumbZone` in `src/screens/common.tsx`; until then it arrived centred; `chart-decision` keeps its chart on the backdrop grid; **[LOOK-SYSTEM]** David, 2026-09-30: content at the top or the bottom "looks weird", so a screen's content sits in the middle of its area again, higher only as far as it must be to stay clear of the room for its reveal, which is kept at the bottom of that area, right above the key, and `ThumbZone` is gone; `src/lesson/fit.tsx`) — and from then on holds still. The reveal rises into space that was already free; content moves only when what is below it would otherwise run under the footer, and then by exactly that much, eased. A block that changes as the learner steps through it takes the height of its tallest version (a carousel's cards, a walkthrough's lines, a swipe-deck's verdicts); a line that comes and goes keeps its place (a hint, a wrong answer's correct value); a chip that is placed leaves its outline behind (`sort`, `order`).
- Portrait only; charts may offer an expand button (section 6.4).

---

## 3. Screen archetypes

`type` values used in level files. Non-question screens:

| type | Name | What it is |
|---|---|---|
| `intro` | Intro card | Big headline (one sentence), optional subline. First screen of every sub-level. For tests/exams it shows the scored-question counter ("0/10"). |
| `theory` | Theory card | Title + body (max 3 lines) + optional visual component. The main teaching screen. |
| `example` | Example card | A concrete number or mini story + visual, often animated. Follows a theory card. |
| `carousel` | Concept carousel | 2–4 sibling cards shown one after another, dots under them for where you are and a `Next` button until the last card. Every card takes the height of the tallest, so nothing around it moves. Each card = icon + label + 1–2 sentences. Counts as one screen per card. |
| `walkthrough` | UI walkthrough | A mock UI component with one field spotlighted per step: the field lit in the accent, the rest of the component dimmed, the step's line under it. Counts as one screen per step. |
| `visual` | Info visual | A chart/diagram component with a one-line caption. |
| `checklist-reveal` | Checklist reveal | Checkbox items are ticked one per tap — the button or the list itself — forming a checklist the user later applies. An item not yet ticked is a bar where its words will be, so the list keeps its size and does not give the next item away. |
| `story` | Story frame | Short narrative ("9:31. You're watching XYZ…"). The speaker is named in the copy, not drawn — there is no character cast (§6.9). Used before decisions. Marked "The scene", with an accent edge, so it does not read as a statement to judge. **[v4]** With `label: takeaway` it closes a lesson instead and is marked "Takeaway". |
| `recap` **[v3]** | Level recap | End-of-level card: 2–4 one-line takeaways from the level's sub-levels, each tappable to re-open that card. Cheap, and it is what makes a 19-level chapter feel navigable. **[v4]** Each point names its card (`card:`, `docs/schema.md`), and a tap opens exactly that card. |
| `plan-card` **[v3]** | Your plan | A card the **user fills in and keeps**: their daily loss limit, their share size, their playbook card. Persists to the profile, re-appears (pre-filled, editable) in later chapters, and is exportable. Every card writes keys from the one plan namespace in `docs/schema.md` ("The plan"), which is what makes the re-appearing real: revisiting a key opens the field on the learner's current value and overwrites it, keeping the old one in a dated history. The single strongest engagement device in the app — the user is building their own document, not just answering. A number line steps with − / + or takes its suggestion in one tap (the suggestion shows, faint, while the line is empty); a text line is typed. The button waits until every line is filled, a number above zero. **[v4]** A line can be a choice (`kind: choice`) and a number can have a range; an answer that makes no sense is refused with a one-line reason. The plan shows each key's history and can be shared as an image or as text. |
| `summary` | Score summary | "X/N correct", progress ring, per-question list with green/red dots (tap → one-line reminder + link to source level). Pass mark 70 %: pass → "Continue"; below → "Almost — review these", "Retry", and "Back to path" under it. **[v4]** A red row shows the correct answer too, and its link opens the card that taught it; "Review these" starts a practice round of exactly those questions. |
| `badge` | Chapter complete | Badge unlock animation, chapter name, XP bonus, "Chapter N unlocked". |
| `tier-up` **[v3]** | Tier unlocked | Fires at the tier boundaries in §7.5. Bigger than a badge: the tier name, what it means, what unlocks. |
| `variance-sim` **[v4]** | Variance simulator | Ten trades of one good setup, run on a tap: winners and losers in a row, the running total in R. Run it again and the order changes; a second button runs a hundred. Ungraded, counts as one screen. Full description in §6.10. |
| `path-choice` | Path choice | The last screen of the path-choice lesson, Chapter 1 Level 17-2 (`docs/curriculum.md`), which first lays the three paths side by side. Three path cards (Scalping / Day Trading / Swing Trading) with holding period, screen time, one-line feel; "You can change this any time in Settings". A path whose chapters are not written yet reads "Being written" and cannot be picked. The lesson is its own node on the map after the Final Exam (§7.1); replaying it changes the path, and it costs no hearts. |

---

## 4. Question interaction types

Shared behaviour: prompt on top, answer area in the middle, then **inline reveal** (5.1). Chosen wrong answer turns red in place, the correct one turns green, the explanation slides in.

Between the answer and the reveal sits a `Check` step on every type but `chart-decision` (§2): disabled until an answer exists, then `Got it`. A single tap is still only a choice until it is checked — two thumb-sized buttons are the easiest thing in the app to hit by accident, and an unconfirmed mis-tap would be a wrong answer the learner never gave.

### 4.1 Core types (v2, unchanged)

| type | Interaction | Rules |
|---|---|---|
| `mc` | 2–4 tappable answer cards, single select. | Distractors must be plausible. Max 2 in a row. **[v4]** An option may carry `why`; picked, it shows under the explanation. |
| `tf` | Two large side-by-side buttons; the choice is confirmed with `Check`. | For misconceptions and single facts. The confirm step is deliberate: the buttons are large and close to the thumb. |
| `numeric-mc` | Like `mc` with number options; reveal shows the working. | |
| `numeric-input` | Custom calculator keypad (digits, `.`, `÷ × − +`, `=`) with a backspace in the field. The field takes a number or a sum (× and ÷ before + and −); a sum's value shows under the field as it is typed, and that value is what is graded; `=` folds the sum into its value. A minus leads the currency (−$0.40); tolerance configurable; reveal shows the working. | Preferred once a calculation has been practiced once. The keypad does the arithmetic, so the question tests knowing which numbers to put together. **[v4]** `sign: any` accepts either sign (`docs/agent.md` §3.12). |
| `fill-tiles` | Sentence with a blank; letter tiles below (with 2–4 distractor letters); tap tiles into the blank. | Exactly one accepted word. |
| `fill-choice` | Sentence with a blank; 3–4 word chips. | Use when synonyms exist or the word is long. |
| `match` | Terms left, definitions right, every card as tall as the tallest so the rows line up; tap either side first, then its partner (every tap sounds), or drag; correct pairs lock green; wrong pairs flash red and reset. `Check` once every pair is made. | Max 5 pairs; every target unique. Prompt must be specific to the content, never a generic "Match each word to its meaning." Scored on whether the learner got there without a wrong tap. **[v4]** No wrong tap: green. Exactly one: amber — counts as correct, costs no heart. Two or more: red. Matched pairs keep a colour of their own, so the finished board shows what belongs to what. |
| `sort` | 2–3 labeled buckets; chips are dragged (or tap chip, tap bucket). A sorted chip leaves its outline in the pile, so nothing around it moves. | |
| `order` | Tap cards into the sequence. Every place in it is drawn from the start, and a placed card leaves its outline in the pile. | 3–5 items. |
| `hotspot` | A mock component (quote card, quote panel, order ticket, chart); tap the right region. | 1–2 targets. |
| `slider` | Set a value on a slider; reveal shows exact value with a tolerance band. | For proportional intuition. |
| `chart-tap` | Tap a candle/point/level on a chart. | Prompt must be unambiguous — if two candles could qualify, constrain it ("the first candle *after your entry*"). |
| `chart-decision` | The scenario engine. See §4.3. | At least one per level from Chapter 2 on. |
| `spot-mistake` | A short statement or ticket with one wrong part; the parts run on as one sentence, each tappable; tap the wrong one. | Removing the wrong segment must leave a sentence that reads correctly. |

### 4.2 New types **[v3]**

Nine additions. They exist to carry the rep volume of the expanded path without the app feeling like a quiz.

| type | Interaction | Why it earns a slot |
|---|---|---|
| `swipe-deck` | A deck of 4–8 mini-charts, one at a time, full-bleed. Swipe right = **Take it**, left = **Pass** (buttons underneath for the tap-only path). Each card reveals a one-line verdict as it flies off; a summary strip at the end shows the run. **Never timed.** | The highest-rep-per-minute screen in the app. This is how "sees the setup in half a second" gets built. Counts as one screen per card. |
| `chart-annotate` | Drag a horizontal line onto a chart to mark a level (support, the stop, VWAP, the opening-range high). Snaps to cents; reveal shows the intended line and a tolerance band. | Marking levels is a physical skill; tapping a multiple-choice answer about levels is not. |
| `order-build` | Assemble a complete ticket from chips: side, order type, quantity, limit price, stop price. Wrong parts shake; the reveal shows the finished ticket. | Turns "which order type?" into "place the actual order", which is what Chapter 3 and 8 need. |
| `scanner-pick` | A mock scanner/watchlist table (ticker, % change, relative volume, float, spread, catalyst). Tap the row that meets the stated criteria. 1–2 correct rows. | Chapter 5 has no other honest way to teach selection. |
| `compare` | Two or three charts side by side; pick the one that matches the card (or "neither"). | Discrimination is a different skill from recognition, and it is where playbook chapters go wrong. |
| `branch` | A multi-step scenario: choose, see the consequence, choose again, 2–4 steps deep. Each step carries its own reveal; the final screen shows the path taken. Counts as one screen per step. | The only way to teach *management* — trade goes against you, now what? — rather than entry alone. |
| `journal-row` | Fill the fields of one journal row for a finished trade (setup, entry, stop, exit, R, grade) from chips and a keypad. | Makes Chapter 6's journal a thing the user does, not reads about. |
| `depth-ladder` | An interactive Level 2 ladder: answer where a given order fills, or which side is stacked. | Chapter 4's tape strand needs a native interaction, not a hotspot on a static image. |
| `chart-replay` | A chart the learner advances bar by bar, watching for a setup to form and acting when it triggers. Full spec in 4.4. Counts as one screen per marked moment (setup or decoy), minimum 4. | The only type that tests *timing* and *restraint*. Every other type shows a frozen moment; this one asks "is it now?" — and can measure the trade you took that was never there. |

**Selection rules.** ≥3 different question types per sub-level; ≥10 different types per chapter; every type used at least twice per chapter; max 2 `mc` in a row; every Chapter ≥2 sub-level has at least one visual/interactive screen. `tf` never asks what the prompt gives away.

### 4.3 `chart-decision` — the scenario engine

The chart plays to a decision point and pauses. Three buttons: **Long**, **Short**, **No trade** (Chapter 1 uses a simplified **Buy / Wait** variant). After choosing, the chart continues candle by candle (~120 ms each, tap to skip) and shows the outcome strip and a one-line rationale.

- Scored on reasoning; "No trade" can be best; other answers can be "reasonable" and are marked amber.
- **"No trade" is never red when the best answer is directional.** Standing aside is at worst amber, in lessons and in exams. The app promises this in Chapter 1 and must keep it for 385 sub-levels.
- Session state (day in R, limit, trades taken, size) shows as chips above the chart (6.4).
- The outcome strip reports the move in points and %, with the share count from the scenario. Never as a prediction.

### 4.4 `chart-replay` — the spot-it engine **[v3]**

Every other interaction shows a frozen chart. Real scalping is recognising a setup *while it forms* and acting within a bar or two of its trigger — and, far more often, not acting at all. `chart-replay` is the only type that can test either.

**The interaction.** A chart opens showing the first few bars of a session and nothing else. The learner taps **Next bar** to advance one candle at a time. At any bar they may act — **Long**, **Short**, or keep advancing. They may also mark **Nothing here** and end the replay early. When the replay ends, a post-mortem walks the marked moments and grades what the learner did at each.

**No autoplay, no clock.** The learner controls the pace completely: there is no timer, no countdown, and the chart never advances on its own. This is not a compromise, it is section 1's fixed rule — *no timers, no quick-fire, no countdowns anywhere* — and it applies here like everywhere else. Nothing of value is lost: you still decide at bar N without seeing bar N+1, which is the whole skill. What is deliberately absent is adrenaline. Chapter 6 teaches not trading under pressure; manufacturing pressure to practise would teach the state the curriculum tells you to avoid.

**Playback is not new.** 4.3 already runs the chart candle by candle to show the outcome. `chart-replay` is the same playback engine placed *before* the decision instead of after it, with the tap under the learner's thumb.

**Grades.** Each marked moment resolves to exactly one label, and the label comes from arithmetic on the bar index, never from an opinion:

| Label | Means | Shown as |
|---|---|---|
| **Textbook** | Acted on the trigger bar, ±1 | green |
| **Early** | Acted before the card's last field filled | amber |
| **Late** | Acted more than one bar after the trigger | amber |
| **Missed** | The setup formed and triggered; no action | amber |
| **Phantom** | Acted at a decoy, or where nothing was marked | amber |
| **Passed** | Correctly took nothing at a decoy | green |

**Nothing here is red.** As with `chart-decision`, restraint is never punished: `Missed` and `Phantom` are amber, and a replay whose honest answer is "no setup all session" scores green for advancing to the end without acting. A learner who always passes scores badly on `Missed`, never on discipline.

**The post-mortem is the lesson.** Each moment reveals which of the setup card's five fields were filled at that bar and which were not — so `Phantom` reads *"the card wants the third field; at this bar only the first two were filled"*, not *"wrong"*. The learner leaves knowing which field they stopped checking.

**Difficulty is a property, not a claim.** How hard a replay is to *read* is separate from `difficulty` (which grades arithmetic). It is derived from the file: how many decoys it carries, how many card fields are marked `marginal`, whether the setup is named to the learner, and whether "no setup at all" is a possible answer. `docs/schema.md` fixes the thresholds and the validator checks that a replay labelled hard has the properties of a hard one. The ramp the curriculum uses:

| Reading level | Card shown | Setup named | Decoys |
|---|---|---|---|
| 1 | yes, all five fields beside the chart | yes | 0–1 |
| 2 | no | yes | 1–2 |
| 3 | no | no — any of the eight, or none | 2–4 |

### 4.5 The mistakes round **[v4]**

Lessons do not cost hearts (§5.2); a wrong answer in a lesson costs a repeat instead. Every question answered wrong comes back once after the lesson's last screen, in a new order and with its options reshuffled. Answering it right clears it; answering it wrong again shows the reveal and moves on — there is no third round. A lesson with a mistakes round is finished, but not perfect. Tests and Final Exams have no mistakes round: they are scored once.

---

## 5. Feedback, reveal and reward

### 5.1 Inline reveal (every question)
- Correct: element turns green (200 ms), soft "ding", light haptic, explanation slides up.
- Wrong: element shakes (3 × 4 px, 250 ms) and turns red; the correct element turns green; explanation slides up; medium haptic. The explanation always states the correct idea.
- Amber (reasonable answer on a `chart-decision`): element turns amber, no shake, no heart lost, and the reveal opens with what was right about the choice before what was better.
- "Show working" toggle on numeric reveals: expands a 1–3 line calculation.
- A run of right answers climbs three sounds, each a step higher: the first right answer, the second, and from the third on the streak sound (a three-note chord roll, the same for the rest of the run). A wrong answer starts the climb again.
- A chart that moves (builds in, draws on, plays out) gives one light haptic as it starts and one firm haptic as it comes to rest, and nothing in between.
- **[v4.1] Timing (decision H).** Calm and high quality: the reveal and screen changes are slower and more deliberate than the quick 200–300 ms v4 proposed — at least the pace the app has today. How calm: David chose Calm's pace in stage LOOK-BRIEF (§10) — a screen cross-fades with a 6 pt rise in 320 ms, the reveal fades up 8 pt in 280 ms; stage LOOK-SYSTEM tunes the durations and curves on real phones and records them in §10. The millisecond values elsewhere in this file are starting points. The response to a tap starts within 100 ms, and a tap during a motion finishes or skips it, so no one ever waits for an animation.

### 5.1b Decision and outcome on `chart-decision` **[v4]**

The reveal grades the **decision** and reports the **outcome** separately (`docs/agent.md` §3.11).

- **The grade first.** A chip names the decision: green **Good call**, amber **Reasonable**, red **Not this time**. The first line speaks to the option the learner actually chose. After Buy, Long or Short it talks about the trade taken; after Wait or No trade it talks about standing aside. "Standing aside costs nothing here" is only ever said to someone who stood aside.
- **Then the outcome, smaller.** The level file's `outcome` sentence, then one result line with the share count: "+$45.00 on 250 shares", "−$84.00 on 600 shares · −1R". The line is coloured by its sign but sits in a neutral container under the grade, so it never reads as the verdict. Standing aside shows the hypothetical in grey: "Had you bought: +$0.02 per share."
- **Right call, losing trade.** Green grade, losing result: one line joins them. "Right call — this trade lost anyway. This setup loses about 4 in 10 times; judge the decision, not the result." **Why?** opens the card from Chapter 1 Level 2-4.
- **The risk note** (`docs/agent.md` §7) sits under every scenario result in the smallest legible type.
- Screen readers hear the grade, the outcome sentence and the result line, in that order — and nothing of the reveal before the answer is given.

### 5.2 Hearts
- 5 hearts, always shown at the right end of the top bar (section 2) and on the home HUD (7.2). **[v4]** A wrong answer in a Test or a Final Exam removes one (the heart breaks, shrinks and greys out, 300 ms). Lessons never cost a heart — their wrong answers come back in the mistakes round (§4.5). Amber answers never cost a heart, and neither does practice (7.3, 7.7).
- Each lost heart returns after 4 hours; the time until the next one is shown beside the hearts on the path map.
- **[v4]** Finishing a practice session returns one heart.
- **[v4.1] Nutrade Plus** removes the limit: the hearts show ∞ and a Test never stops for them, but the pass mark stays. For a free learner, the Out-of-hearts screen lists the free ways first (Review the cards, Practice for a heart, wait) and Plus after them (§7.8).
- Losing the last heart stops the Test on an "Out of hearts" screen; the Test does not count as passed. **[v4]** The screen is not a dead end: it offers **Review the cards** (the tested levels' theory cards) and **Practice for a heart**, with **Back to path** under them. A Test cannot be started again until a heart is back; lessons always can.

### 5.3 Sub-level complete
- XP counts up from 0 (600 ms); the path-map XP bar fills on return.
- The XP total (on the home HUD until LOOK-SYSTEM, which took the goal ring out of the top bar; Account's stats show it from §7.4 on) is the sum of what the summaries showed: the lesson's XP plus the perfect bonus, replayed sub-levels included. **[v4]** A replayed sub-level earns a quarter of its XP and no bonus; the perfect bonus is paid once, on the first perfect run; testing tools earn nothing.
- Accuracy ring animates. Perfect run → gold ring + confetti (1 s, respects reduce-motion). **[v4]** Only a perfect run, and never over text.
- **[v4]** The summary names the lesson (`subtitle`). On lessons with chart decisions it counts decisions and results apart: "Decisions 7/8 · Results: 4 won, 3 lost". It lists the questions missed, with **Practice these**, and shows today's goal ("1 of 2 today"; **[LOOK-SYSTEM]** a "Today 1/2" row, in the accent once the goal is met).
- Streak flame shows the day count; when today's goal is just met, the flame ignites (scale + glow). No streak-loss warnings inside lessons.
- **[v4] The daily goal is the learner's choice** of 1, 2 or 3 sub-levels (default 2 ≈ 10 min). The ring on the home screen fills in that many parts (**[LOOK-SYSTEM]** "Today 1/2" in place of the ring, §7.2), and the streak counts the days on which the goal was met.

### 5.4 Chapter complete (`badge`)
- Badge drops in with a spring, ring of light expands, chapter name types in, XP bonus counts up, "Chapter N unlocked" fades in, CTA last. After Chapter 1 the path-choice lesson opens on the map as its own node (§7.1).

### 5.5 Tier complete (`tier-up`) **[v3]**
Rarer and louder than a badge: full-screen, the tier name and what it means, the Trader Card updating in place, and one line on what the next tier covers. Four per path (§7.5).

---

## 6. Visual & data components

All components are theme-aware (section 10). **Up = green, down = red**, always paired with an arrow or sign.

### 6.1 Ownership pie
Circle of N equal slices; owned slices fill one by one (80 ms each). Caption "5 of 50 = 10 %". **[v4]** Above 20 parts it is a 10 × 10 grid of squares instead (1,000 parts: a grid of hundreds), because a circle of 100 slices reads as a dark disc.

### 6.2 Quote card
```
 ┌──────────────────────┐
 │ XYZ   Example Corp   │   ticker + name
 │ 142.50               │   current price (large)
 │ ▲ +2.10 (+1.5 %)     │   change vs previous close, colored, with arrow
 │ Vol 3.2 M            │   optional
 └──────────────────────┘
```
Digits flicker (100 ms) on update in live-demo mode. Every field can be a `hotspot` target or `walkthrough` spotlight.

### 6.3 Quote panel (Bid / Ask / Last / Spread)
```
   BID        SPREAD        ASK
  45.20 ──── 0.04 ────►   45.24
          LAST 45.22
```
Bid green-tinted left, Ask red-tinted right, spread as a bracketed gap with its value. **Spread animation:** the gap physically widens/narrows (300 ms) when values change. Optional depth bars below (6.6).

### 6.4 Chart component
- **Line chart** in Chapter 1 (one line, draw-on animation 800 ms).
- **Candlestick chart** from Chapter 2 on (green/red bodies, wicks, optional volume bars, time axis, price axis right).
- **Playback:** candles appear one by one (120 ms, play/pause, tap to skip). Used by `chart-decision`.
- **Annotations:** dashed levels, arrows, shaded zones, labels; animate in. **[v3]** also user-draggable lines for `chart-annotate`.
- **State chips:** the level file's optional `state` strings render as small chips in a row above the chart (day result in R, the session limit, trades taken, current share size). They appear with the scenario and stay visible through playback. Absent when the decision rests on the chart alone.
- **Decision overlay:** at the pause point the three buttons rise from the bottom; after the choice the chart continues and a P/L strip shows the outcome, then the rationale.
- **[v3] Mini variant** for `swipe-deck` and `compare`: no axes, no volume, 8–10 bars, one optional level line — readable at a glance at half height.
- Expand → landscape fullscreen with pinch-zoom (later).
- **[v4] Price axis.** Round steps (0.05, 0.10, 0.25, 0.50, 1, …) with the currency symbol from the market profile. The domain is fixed from the first frame to the end of playback, so nothing jumps between the decision and the reveal.
- **[v4] Stop and target** from the level file (`stop`, `target`) draw as labelled lines, and playback ends at the first one touched.
- **[v4] Decision buttons are equal in weight.** No option is pre-coloured. The label over the hidden bars reads "What happened next", never "Next 5 bars" — Chapter 1 has no bars yet.
- **[v4] Text alternative.** Every chart carries a one-sentence description for screen readers ("Price climbed in steps from 9.80 to 10.05").

### 6.5 Bars, timelines, stacks
- Horizontal bar chart: bars grow from 0 (400 ms, staggered 80 ms).
- Session ribbon: horizontal ribbon with three colored segments (pre-market, regular, after-hours) and a "now" marker; times from the market profile. **[v4]** Drawn to scale in hours, with "now" in the learner's own time zone.
- Cost stack: stacked bar (spread + slippage + fees) against a target-profit bar with the consumed percentage. Always labeled with the share count.

### 6.6 Order book ladder (Chapter 3+)
Two columns of price levels with size bars; best bid/ask rows highlighted; animates as orders arrive. **[v3]** interactive in `depth-ladder`: rows are tappable and an order can be "walked" down the book to show the fill.

### 6.7 Order ticket mock
Side toggle (Buy/Sell), order-type chips (Market / Limit / Stop), quantity, price field, submit. Used by `walkthrough`, `hotspot`, `spot-mistake`, **[v3]** `order-build`, and hands-on practice.

### 6.8 New components **[v3]**

| id | What it is | Used by |
|---|---|---|
| `scanner-table` | 4–8 rows: ticker, price, % change, relative volume, float, spread, catalyst tag — a table shows only the columns its rows carry. Sortable in demo mode; rows tappable, and a `scanner-pick` keeps its answer-card look after the reveal. | `scanner-pick`, Chapter 5 theory |
| `journal-table` | A journal with columns for setup, entry, stop, exit, R, grade, note. Rows fill in one at a time; signed numbers in their sign's colour. A first column keyed `""` is a row label, so the same table carries a small comparison grid (Chapter 1 Level 17-2). | `journal-row`, Chapter 6 |
| `internals-panel` | The index chart, sector strength, breadth reading and a risk-on/risk-off tag, as one compact panel. | Chapter 5 market-context levels |
| `hotkey-pad` | A stylised key grid (buy, sell, size, cancel, flatten) that lights up as a sequence plays. | Chapter 8 execution levels |
| `stats-card` | The learner's own numbers: decision accuracy by setup, best day type, weak concepts. | Stats screen, Chapter 8 |
| `r-tracker` | A running R strip for a simulated session: each trade as +/− bars against the day's limit. | Chapters 6 and 8 capstones |
| `plan-sheet` | The user's own saved plan (limits, size, playbook cards), editable. A line with a literal value in the level file is a specimen; a line without one renders what the learner wrote, and may only name a key an earlier `plan-card` has already asked for. | `plan-card` |
| `candle-anatomy` **[v4]** | One large candle with open, high, low, close, body and both wicks labelled; the labels arrive one at a time on entry (all at once under reduce-motion). | Chapter 2 Level 1, glossary |
| `trade-plan` **[v4]** | Entry, stop and target as labelled lines over a small chart, with the distances in cents, the R-multiple of the target and a risk/reward bar. | Chapters 3, 6, 7 |

### 6.9 Illustration
**There is no mascot and no character cast.** v2 and v3 up to this point specified one
recurring mascot with six poses, plus five recurring characters — retail trader, market
maker, institution, bull, bear — that gave concepts a face across chapters. That is
withdrawn, and with it the `story` screen's `character` field, which was the only place the
cast was ever named (198 sub-levels carried it; none of them do now). Nothing in the app
renders a character, and no new screen type should introduce one without reopening the
decision in `docs/agent.md` §1.

What a screen has instead: its own copy, its data component (§6) and the verdict colour of
the reveal (§5.1). A `story` frame carries its speaker in the sentence — *"9:31. You're
watching XYZ"* needs no avatar to say who is watching.

- Illustration style, where a screen does illustrate something: flat, friendly, one accent
  color + neutrals.

### 6.10 Variance simulator (`variance-sim`) **[v4]**

The screen that teaches `docs/agent.md` §3.11 before the course ever shows a correct decision
losing. It is ungraded and has no timer.

- **One good setup, stated.** The screen names the example's numbers — win rate, what a winner
  pays, what a loser costs — as an example, never as a claim about real markets.
- **Ten trades on a tap.** **Run 10 trades** deals ten outcomes into a row of chips (won / lost,
  with R), one by one, and draws the running total in R beside them. Reduce-motion deals them at
  once.
- **Again, and different.** Running it again gives a different order and often a different total —
  a run of four losers in a row happens, and so does a losing ten. That difference is the lesson.
- **Then a hundred.** **Run 100** shows the total settling towards the expected value, so the
  learner sees both halves: short runs are noise, long runs are the setup.
- **Reproducible in tests.** The file's `seed` fixes the sequence of runs, so a test sees the same
  rows every time; a learner still sees a new row on every tap.

---

## 7. Progress & gamification UI

### 7.1 Path map (home)
- Vertical scrollable path of level nodes, gently winding. Chapters are sections with a header card: chapter number and name, a progress bar and "7/17 levels" (or "Chapter complete"). Tapping the card folds the chapter away or opens it. Before a path is chosen, the next chapter is a closed card, "Your path starts here".
- Node states: locked (grey face, its symbol greyed, a lock badge where the check will go), available (accent, pulsing halo), in progress (ring partly filled = subs done), completed (filled, keeps its symbol, with a check badge; **[LOOK-SYSTEM]** no ring), perfect (a gold check badge).
- **Every button shows a symbol rather than a number.** A lesson level shows what it teaches, or for a practice level what it practises, from its files' `icon` (docs/schema.md): a candle for The Candle, a bell for The Opening Minutes, a zigzag for Volatility. Without an `icon` it falls back to a bulb for new ideas (a level with any `new-theory` lesson in it) or round arrows for practice (`repetition` only). A Checkpoint shows a ticked clipboard on a shield, the Final Exam a trophy, the path choice a signpost. **[LOOK-SYSTEM]** The label beside it is the level's title alone, in whole lines. The number is on the level card ("Level 4") and in the banner, and a screen reader hears the number, the kind where the title does not say it, the title and the state ("Level 4: The Quote Card. Locked", "Level 1: Your First Trade. 0 of 4 lessons done").
- A banner at the top names the level the learner is on and its title, with the sub-level they are up to: **[LOOK-SYSTEM]** "Level 6 · Lesson 1 of 3" over the title, in place of the "1/3 lesson" badge ("Level 5 · Checkpoint" and "Level 17 · Final Exam" only where the title does not already say it; the path choice reads "Chapter 1 · Your path"). The chapter is on the chapter card under it. The map opens scrolled to that level.
- Each level is one round button (**[LOOK-SYSTEM]** 58 pt) inside a ring (76 pt) that fills one sub-level at a time, with its title beside it. The available node carries a START / CONTINUE tag. **[LOOK-BRIEF]** Every title on the map shows whole and once, and never breaks at a hyphen ("1-Minute" stays together); a chapter card's name that would not fit its one line shrinks to fit.
- Coming back from a sub-level, the ring fills by the part just finished. The first draw of the map moves nothing.
- **Moving on to the next level** is one sequence, about 2.5 s, after the last sub-level of a level: the finished level's ring completes and its check badge pops on, and the ring fades away (**[LOOK-SYSTEM]**: a finished level has none); the map scrolls down to the next level; the dotted path between them lights up top to bottom; the lock badge shakes and bursts off with rings and the unlock sound, and the level's symbol pops in white; the banner names the new level; the START tag drops in and the halo begins. Under reduced motion the steps swap in place without movement. **[LOOK-SYSTEM]** Smoother, with haptics and sounds (David, 2026-09-30), about 2.7 s (`UNLOCK` in `src/home/LevelNode.tsx`): the check lands with a soft pop; the map glides down, eased in and out on the UI thread, while a spark runs the dotted path and lights each dot as it passes, to five notes climbing the scale, each a light tap; the lock rattles on three swings, a click on each; the button gathers itself, the lock flies off, a flash, rings and sparks go out, the unlock chime; the START tag lands with a pop. A finger on the map stops the glide. The rattle, the unlock and the streak screens' cues are rendered with the rest by `tools/gen_sounds.py`.
- Tapping a node opens a card under it, pointing at it (not a bottom sheet): level title, the sub-levels as segments with their states, the next lesson and "about 3 min" (**[LOOK-SYSTEM]** "Lesson 2 of 4 · about 3 min", without the XP), and "Start" / "Continue" / "Review" ("Retake" for a passed Checkpoint or exam; later also "Review cards" / "Practice"). A locked level's card says which level opens it ("Finish Level 4 first."). **[v4]** Every lesson segment is tappable to replay that lesson, perfect lessons wear a gold tick, and the card offers **Review cards** — the level's theory cards without their questions.
- Fan-outs: the path splits into up to 3 side-by-side strands and merges into one node; all strands must be completed, any order.
- Checkpoints are shields, and their card reads "10 questions · 70 % to pass"; the Final Exam wears the trophy.
- **[LOOK-BRIEF] David's changes** (2026-09-29, the prototype's map; built in LOOK-SYSTEM): the buttons are smaller (58 pt in a 76 pt ring instead of 72 in 96), so small scenes fit at the sides of the path (candles, coins, gems, a bell), drawn in the ground's own ink and as faint as its grid, so they belong to the background and never stand out from it; a finished level drops its ring and keeps its check, so only a level being played shows one; the label beside a level is its title alone, in whole lines, never cut off and never drawn twice; and the banner and chapter card stay as they are. **[LOOK-SYSTEM]** The scenes are drawings in `src/home/scenes.tsx`: candles, a target, coins, gems, an hourglass, a summit, a bell and a chest. David, 2026-09-30: the buttons "a little bigger" again (66 pt in an 86 pt ring), and the drawings "part of the background ... not always next to the levels but rather faintly in the background", in several sizes. So they are scattered down each open chapter at uneven gaps, left and right (`src/home/backdrop.ts`): small ones in the room beside the path, bigger ones further out, the biggest a third or more off the edge of the screen; the bigger, the fainter, and none stronger than the ground's grid. None covers a level, its label, its START tag or a card; the dotted path may run over one. The scatter is seeded by the chapter, so the same map always has the same background. None moves. **[LOOK-SYSTEM]** David, 2026-10-01: "Remove the background decoration". The drawings are gone, and the map stands on the look's own ground with nothing drawn on it.
- **[LOOK-BRIEF] Bonus side lessons** (David: "small fun optional side lessons"): a small node beside the path, off its line, opened by the level before it. Each is a short `chart-replay` (§4.4) — charts played bar by bar where the learner does not know where, or whether, there is a setup. Optional, never timed, never a heart; it pays gems (§7.2).
- **[v3] The map must survive 8 chapters.** Collapsed chapter sections by default, with the current one expanded; a sticky chapter header while scrolling; a "jump to current" button; and a zoomed-out overview showing all eight chapters as tiers. Built so far: the folding sections and the "Jump to" button, which shows while the current level is off screen. Not yet: the sticky header and the overview.

### 7.2 Persistent HUD
**[LOOK-SYSTEM]** Left to right: the path's logo, the streak flame with its day count, the gems (David, 2026-09-30) and the hearts (below). David, 2026-10-01: the bar lines up with what is under it, so the logo sits on the banner's left edge, the hearts on its right edge, and the streak and the gems are spaced evenly between (until then the four were spaced evenly across the screen). A tap on the logo opens the paths: a card drops from the top bar with the three paths, each with its logo and how long its trades last, the one in use ticked and the ones still being written shut ("Being written"). Before Chapter 1 is done all three are shut and the card says "You choose it after Chapter 1.", as Settings does; the choice itself stays the lesson after the Final Exam (§11.4). A tap anywhere else or Android's back button closes it. Until LOOK-SYSTEM: the streak flame with its day count and the XP total inside the daily goal ring on the left, hearts on the right.

**[v4]**
- Nothing is a bare number: the flame reads "3 days", the ring "1 of 2 today" (the learner's own goal, §5.3), with XP beside it; hearts stay on the right. (Replaced in LOOK-BRIEF, below: each number stands with its icon, screen readers hear what it is, and the goal shows as "Today 1/2".)
- There is no league or rank anywhere in v1.0 (§11); v3's Leaderboard tab is gone.
- The streak shows its state: *open* (today's goal not met yet), *done* (flame lit), *at risk* (evening, goal still open), *frozen* (a streak freeze covered a missed day) and *lost* (a friendly screen: "A new streak starts today").
- The run of right answers inside a lesson uses a different symbol from the daily flame.

**[LOOK-BRIEF]** (David, 2026-09-29)
- **The top bar,** left to right and evenly spaced: the path's logo (which of the three paths), the streak, the gems and the hearts, each an icon with its number; screen readers hear what each is ("3 day streak"). The daily goal leaves the bar: the flame lights when today's goal is met, and "Today 1/2" shows on lesson complete and when the flame is tapped. The path logos come from `BRAND`. **[LOOK-SYSTEM]** The logo is a stand-in until `BRAND`: the chosen path's icon from the path choice (a bolt for Scalping, a clock for Day Trading, a calendar for Swing Trading) on the key's colours, and a zigzag of price before a path is chosen; the flame is grey until today's goal is met and then lit; a tap on it drops "Today 1/2" under it for a moment, whole and on one line (it read "T..." on a phone), and a screen reader hears "Today 1 of 2 lessons"; the gems are the prototype's cut gem in their own cyan (`colors.gem`, one shade deeper on the light ground so the count holds 4.5 : 1) with their count; the hearts show the wait while one is on its way back. Screen readers hear "3 day streak", "120 gems" and "5 hearts".
- **Gems,** a new in-game currency, earned in lessons and bonus side lessons (§7.1). What they buy is open (`docs/build-plan.md` §4.2, U); since decision I sells nothing one at a time, they are earned, never bought. **[LOOK-SYSTEM]** In the top bar since David asked on 2026-09-30 ("will get its function later on"): kept with the progress (`gems`), starting at 0. Nothing earns them yet; the testing tools add 50 a tap. Earning them comes in LOOP-DAILY, what they buy with decision U.
- **The streak, full screen:** every change of the streak gets a screen of its own. Up by a day: the flame lights, the count rolls on and today's dot fills in the week. Lost: the flame goes cold, the count rolls to 0, and "A new one starts today". Each comes after something the learner did (a lesson, opening the app), plays about a second, and Continue ends it; reduced motion shows the end at once. **[LOOK-SYSTEM]** Built at David's request (2026-09-30: "Make them real nice fancy") in `src/lesson/StreakScreens.tsx`, about two seconds each and then still. Up: the flame springs up out of its cold ember with a rush of air, a warm light blooms behind it, two rings and fourteen embers go out, the count turns over with a "+1", and today's dot springs in with a ring. Lost: the flame gutters in three dips, goes out with a soft breath of air as smoke curls up from it, stands cold and grey, and the count rolls down to 0 to a falling third; no red. They play on the Animations page (§11.5); LOOP-DAILY shows them in the app's own flow.

### 7.3 Practice hub **[v3 — expanded]**
Lists weak concepts (from wrong answers) and offers an untimed 3-minute review mix. Never costs hearts.
- Draws from **the drill bank** (`content/drills/`, see `docs/schema.md`) as well as from questions already seen, so practice does not become re-reading.
- Spaced repetition schedules terms and setups automatically; a concept the learner keeps missing surfaces sooner.
- **Setup drills:** pick one playbook setup and get a `swipe-deck` of fresh charts for it.
- **Daily mix:** one tap, ~3 minutes, mixed across everything unlocked.
- **[v3] Spot it** (7.7) is the second practice surface and feeds the same weak-concept list: a `Phantom` at a decoy that fails on volume marks *volume* weak, exactly as a wrong answer would.
- **[v4] Spaced repetition, concretely:** a question answered right moves to the next interval (1 → 3 → 7 → 16 → 35 days); a wrong answer sends it back to day 1. A question from a lesson not yet played is never drawn.
- **[v4]** Finishing a practice session returns one heart (§5.2).
- **[v4.1]** The Practice hub stays free for everyone. Unlimited generated charts, replays and the practice account are the arena (7.7), part of Nutrade Plus.

### 7.4 Stats / profile
Total XP, chapters completed, accuracy per tag, scenario record (Long/Short/No-trade decisions and "good decision" rate — never "profit").
**[v3]** Adds the **Trader Card**: the user's best setup, their decision accuracy by day type, their current tier, their saved plan, and the number of scenarios traded. It is the thing a learner screenshots.
**[v4]** Adds the **variance view**: of the learner's correct decisions, how many won and how many lost, with one line on why that split is what a good process looks like. The one-line risk note sits at the bottom (`docs/agent.md` §7).

### 7.5 Tiers **[v3]**
Four tiers per path, unlocked by chapter, shown on the Trader Card and the path overview. They give a 6-month path visible mid-term goals that badges alone do not.

| Tier | Unlocked after | Means |
|---|---|---|
| Observer | Chapter 2 | Can read a chart |
| Student | Chapter 4 | Can read the market in motion |
| Planner | Chapter 6 | Has a risk process and a journal |
| Sim Trader | Chapter 8 | Has a playbook and a 30-day simulator plan |

### 7.6 Weekly challenge **[v3]**
One untimed, optional mixed set per week (8–12 questions drawn from everything unlocked), worth bonus XP and a streak freeze. Not ranked. **[v4]** It is how streak freezes are earned; the learner holds at most two, and a missed day uses one automatically. Exists to give lapsed users a low-friction way back in.

### 7.7 Spot it — the replay tab **[v3]**

**[v4.1] This tab grows into the arena** (decision I, `docs/build-plan.md` Phase G). Stage ARENA-DESIGN rewrites this section; the rules below stay.
- **For everyone:** the **Daily Chart** — one chart a day, the same for everyone on a path, played bar by bar, with a share card that shows decisions and never money — and a taste of each arena part.
- **With Nutrade Plus:** replays of whole sessions, unlimited setup drills from the chart generator, the practice account with its journal and statistics, and scenario packs.
- **Synthetic charts only.** Their odds are a training model, and the app says so (`docs/agent.md` §7).

The second practice surface, beside the Practice hub (7.3), and the home of `chart-replay` (4.4). One tap opens a replay the learner has not seen, drawn from the bank in `content/replays/` and filtered by what they have unlocked.

- **What it is for.** The linear path teaches recognition one frozen chart at a time. This is where the learner finds out whether they can spot a setup with the outcome still hidden — and whether they can sit through a session that offers them nothing.
- **Picked, not random.** The next replay is chosen by the weak-concept list, the same one the Practice hub reads: two `Phantom`s on volume and the tab starts serving replays whose decoys fail on volume.
- **Tier-gated by reading level.** Level 1 replays open at **Observer**, level 2 at **Student**, level 3 at **Planner** (7.5). A level-3 replay in front of a learner who has not finished Chapter 6 is a coin flip, not a lesson.
- **Session view.** A run of replays ends on a strip: how many Textbook, how many Missed, how many Phantom, and the **discipline line** — moments correctly passed as a share of decoys met. That number, not a win rate, is what the tab is scored on.
- **Never costs hearts, never timed.** Same as every practice surface.
- **What it does not do.** It does not replace the simulator plan Chapter 8 ends on. A replay you can pause teaches recognition; it does not teach a live market, and the copy must not imply otherwise.

### 7.8 Nutrade Plus, the paywall and ads **[v4.1]**

Decision I (`docs/build-plan.md` §4.1). Stages ARENA-DESIGN, MONEY and ADS fill in the details and record them here.

- **Free:** every lesson of every path, the checkpoints and final exams, the Practice hub (7.3), the glossary, the statistics, the Daily Chart and a taste of the arena (7.7); 5 hearts in tests (§5.2); ads between lessons.
- **Nutrade Plus:** unlimited hearts (∞ in the HUD), no ads, the full arena.
- **The paywall** appears only at natural points: when the free part of the arena is used up, on the Out-of-hearts screen below the free ways, and in Account and Settings. Never inside a lesson, over a reveal or at app start. It states the price per period, how it renews and how to cancel; a trial names its end date. No countdowns, no pre-selected expensive option without its price.
- **Ads** come only after a finished lesson, once its result has been shown, and not after every lesson. Never inside a lesson, test, reveal, the arena or onboarding, and never on the first day. No ads for financial products, trading, crypto, gambling or get-rich-quick (`docs/agent.md` §7). Personalized ads only with consent.
- **Nothing is sold one at a time:** no hearts, no streak freezes, no passes.
---

## 8. Glossary popover

Every defined term is rendered with a subtle dotted underline. Tap → bottom sheet: term, one-sentence definition, "Taught in Level X-Y" link. Terms enter the glossary from `terms_introduced` in level files. **[v4]** Definitions live in `content/glossary.yaml` (one sentence each, format in `docs/schema.md`); every term in any `terms_introduced` must have one. The underline marks a term's first appearance on a screen, not every one.
**[v3]** The glossary is browsable from the profile as well, grouped by chapter, with a "terms you have missed recently" section fed by the practice engine.

---

## 9. Copy, numbers & localization

- Second person, present tense, short sentences, body max 3 lines. **[v4]** In characters: at most 150 (`docs/agent.md` §3.9).
- One caveat per screen at most; hedges live in reveal notes.
- Prices two decimals, thin-space thousands, currency symbol from the market profile (`$` in content is replaced). Percentages one decimal. Per-share values always say "per share"; totals always show the share count.
- Session times, index examples and regulation notes come from `content/market_profiles.yaml` via `{{market.*}}` tokens. **[v3]** Clock times are never written literally, even inside a story.
- **[v4] Locale.** Numbers follow the market profile: "$1,234.50" for US, "1.234,50 €" for EU-DE. Clock times show in the learner's own time zone ("US market: 15:30–22:00 German time") — the market a learner trades and the time zone they live in are two settings.
- **[v4] UI strings go through i18n keys** (`en.json` first). Content stays English (`docs/agent.md` §1).
- **[v4.1] Languages (decision M).** The app is built in English and translated into every launch language before the release (`docs/build-plan.md` Phase J). The language follows the phone and can be changed in Settings. Number formats follow the language (a German reader sees "1.234,50 $" for a US stock); the currency follows the market. Translated content is generated from the English files and never edited by hand, and every screen must also fit in the longest launch language.

---

## 10. Theming & accessibility

- **Dark mode default**; full light theme. Tokens: background, surface, text, accent, up-green, down-red, warning, success. **[v4]** Light, dark and *system* (follows the phone). Every text meets **4.5 : 1** contrast against its ground (large text 3 : 1); a script checks the tokens.
- **[v4] Minimum type.** Body 16–17 pt. Labels at least 13 pt — and so is anything a decision depends on (state chips, the axis values a question asks about). Nothing essential goes below 13 pt at any screen size.
- **Lesson designs.** **[LOOK-SYSTEM]** A lesson wears one of three designs, picked in Settings (§11): **Neo** (the default), **Neo Mono** and **Classic Contrast** (David, `LOOK-BRIEF`, 2026-09-29), each in light and dark. A design changes the ground, the surfaces, the progress bar, the key, the ink of a chart line and the right-answer flourish; it never changes layout, motion, text colours that carry meaning or the up/down colours of chart data. The other six designs are gone; a saved one opens as Neo. The designs are data in `src/lesson/lookSpecs.ts`.
- **[LOOK-SYSTEM] Themes and tokens.** Settings → Appearance: Theme System (follows the phone), Light or Dark, and Colour-blind colours Off/On. The colours and the type scale are plain data in `src/themeTokens.ts`; `src/theme.ts` serves the palette in use, and a change of theme draws the app afresh. While a lesson is open, the phone switching between light and dark on its own waits until the lesson closes, so a lesson never changes colour mid-screen; a change made in Settings applies at once. On the web the browser bar takes the ground's colour.
- **[LOOK-SYSTEM] The UI check.** Contrast and sizes are checked by scripts, not by eye, and fail CI:
  - `npm run check:ui` (`tools/check_ui.mjs`) measures every text colour on every ground, surface and tint it is drawn on, and every label on its key or fill: in each design, light and dark, with and without the colour-blind palette. It also fails a type style or a written `fontSize` below 13. There is no exemption: **[LOOK-SYSTEM]** the design picker's miniatures are gone, and Change design shows a real screen (§11).
  - `npm run sheets` (`tools/contact_sheets.mjs`, the "Look" CI job) opens every test-bench screen and the home pages (the map, Account, Settings, Change design, Animations and Design suggestions) in the three designs, light and dark, at 390, 375 and 320 pt, measures every text as drawn (at least 13 px, at least 4.5 : 1 against what is behind it, 3 : 1 for large text), every button as laid out (at least 48 × 48) and **[LOOK-SYSTEM]** every key's label (a view marked `testID="key"`: the CTA, the decision buttons, the quit sheet's buttons and the level card's key) on one line and whole, and shoots the contact sheets (the `contact-sheets` artifact). Text in a key that cannot be pressed yet is exempt, as WCAG exempts inactive controls; so is the width of a candle on a chart-tap screen, which is as wide as its bar and as tall as the chart.
- **Chosen look (stage LOOK-BRIEF, 2026-09-29).** David chose a mix: Calm as the main direction, on today's designs ("background and so on"), with some elements of Precise still there. It replaces David's first answer of 2026-09-28, to keep today's look as it is. In detail:
  - **From Calm**, the stage's first direction: the layout of every screen — the question and its visual at the top, the answers as full-width rows right above the key (§1, principle 3; David chose this thumb zone over today's placement; **[LOOK-SYSTEM]** on 2026-09-30 he moved the content to the middle of its area instead, §1), and the reveal rising into a slot kept free for it, so the key never covers it; Calm's type scale (display 30, title 23, prompt 20, body 17, answer 17, label 14, caption 13 pt); and Calm's motion (§5.1).
  - **From today's designs:** the ground (grain, the hairline grid, the light at the top edge and the light from the bottom edge that answers), the surfaces, the key, the progress bar and the colours of Neo, Neo Mono and Classic Contrast. The three looks differ in these and never in layout or motion. Today's designs only come in dark; the prototype's light versions are the start (David, 2026-09-29: "good as a start"), and LOOK-SYSTEM tunes them on real phones. Neo's key is one shade deeper (#2F6FEB), so its white label holds 4.5 : 1.
  - **From Precise:** numbers in a monospaced face, while the words around them stay in the text face; numbers that count up to their value (lesson complete counts with its ring, the streak screen rolls its count); the step count beside the progress bar ("4/12"); the chart, with its axis in that face, candles that form from open to close, a live price tag on the forming candle, and entry, stop and target labelled with their prices; and the trade log in the chart's reveal (outcome, result, R), which stays a neutral block under the grade (§5.1b). Not taken (David, 2026-09-29): small-caps labels, answers keyed A–D and the board-style map.
  - **The path map keeps today's design** (David, 2026-09-29: the list-style maps "look too professional and not fun"), in the chosen look and with his changes (§7.1, §7.2): smaller level buttons with small scenes at the sides of the path (**[LOOK-SYSTEM]** the scenes went again on 2026-10-01, §7.1), no ring on a finished level, every level's own symbol in every chapter, its title alone as its label, the top bar in his order, and bonus side lessons beside the path.
  - **Fewer words on every screen** (David, 2026-09-29: "way too much text on every screen, keep it simple"). The mix in the prototype shows the target: a theory card is a title and one sentence, a question one line, a reveal one line and its trade log.
  - **Keys keep their label on one line** and never break (David); a label that would not fit gets shorter ("Continue", not "Continue: lesson 3"). **[LOOK-SYSTEM]** A key shrinks its label a little before it would wrap, and `npm run sheets` fails a key label on two lines or cut off (above).
  - **The reference** was the prototype (`#prototype/mix/<screen>` in a test build): the six screens of the stage, the streak up and lost, the map, the bonus side lesson and the type sheet. **[LOOK-SYSTEM]** The mix is built into the app, and `src/prototype/` is gone. What later stages still take from it — the chart's forming candle and axis (LOOK-COMPONENTS), the streak screens (LOOP-DAILY), the bonus side lesson (FUN-PASS) — they read at commit `a78e210` (`git show a78e210:src/prototype/Mix.tsx`, or check that commit out and open `#prototype/mix/<screen>`).
  - **Design suggestions** (test builds, **[LOOK-SYSTEM]** Settings → Testing → Design suggestions): ideas for the look, drawn on the real theme in the design in use, each marked in the mix or not. New ideas are shown there before they go in. **[LOOK-SYSTEM]** David, 2026-10-01: "way more", "experimental" and "cool", and built like the Animations page. So it is a list of ideas in groups (Answering, Rewards, The map, Top bar and tabs, Numbers and feedback, Whole looks, and the five asked in LOOK-BRIEF), each a row that opens a page of its own playing its preview, with "Play again" or "Start again" under it. A preview can be an animation, something to try with a tap or a drag, or a still design. An idea that moves without a tap says so ("Moves on its own", against §1), and so does one that breaks another rule ("Breaks a rule"). None of them is in the app; one goes in only when David picks it. The ideas are data in `src/home/ideas/`, and `#home/suggestions/<id>` opens one in a test build.
  - David's ratings, 1–5 for fun, readability, trust and "I would open this every day": Calm 4 on each, Precise 3, Playful 1.
- Color-blind safe: up/down always with arrow/sign; alternative palette (blue/orange) toggle applies to charts too. **[LOOK-SYSTEM]** The palette makes up and right answers blue, down and wrong answers orange, and amber a yellow that is neither; it changes those colours and nothing else (`src/themeTokens.ts`).
- Dynamic type to 130 % without truncation. Screens do not scroll (section 2), so a screen must be authored to fit at 130 %: shorter body, or split in two. Scrolling is the fallback only past 130 %, where nothing else will do. **[v4]** And wherever the fitter would have to shrink a screen below 85 % (§2).
- Haptics and sounds each have a toggle. **[LOOK-BRIEF]** Sounds play when the phone is on silent (David, 2026-09-29), so the app's own Sound toggle is the one switch that mutes them. **[LOOK-SYSTEM]** They mix with other apps' audio rather than stopping it. Each sound has three players that take turns, so fast taps all sound. Continue plays the soft `tick`; letter tiles and number keys the barely-there `detent`. Reduce-motion removes confetti, flicker and auto-playback (candles then appear on tap).
- **[v4.1] Motion tokens** (durations, easing curves, springs) for decision H are recorded here by stage LOOK-SYSTEM. Motion runs on the UI thread and holds the display's frame rate on a cheap Android phone; under reduce motion, movement becomes a short fade. **[LOOK-SYSTEM]** Calm's pace, in `src/lesson/motion.ts`, to be tuned on a phone:
  - **Screen to screen:** the new screen cross-fades in and rises 6 pt into place, 320 ms, strong ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`); going back, it settles down from above.
  - **Reveal:** the panel fades up 8 pt, 280 ms, same curve, with its words following 120 ms later; the answer takes its verdict colour at once and settles over 380 ms.
  - **Press:** scale to 0.97 in 140 ms, back in 190 ms.
  - **Taps never wait:** Continue and the answers work from the first frame of any motion, and the next screen restarts its own.
  - **Reduce motion:** no travel, no bounce; fades shorten to at most 140 ms.
  - The designs share one motion; none adds its own.
- Min tap target 48 × 48 pt (checked by `npm run sheets`, above); drag interactions all have tap-tap alternatives. **[v3]** This includes `swipe-deck` (buttons underneath), `chart-annotate` (tap-to-place then nudge) and `order-build` (tap chip, tap slot).

---

## 11. Navigation & app flow

1. **Onboarding [v4]:** five short steps — what the app is · the one-line risk note · the daily goal (1, 2 or 3) · reminders yes/no · the market profile ("Where will you trade later?") — then straight into Chapter 1, Level 1. No path question. (v3 had three screens: what the app is, the risk note, the notification opt-in.) **[v4.1]** The language comes from the phone. Where the law requires consent for analytics or ads, it is asked before the first lesson. Sign-in is not part of onboarding: it is offered after the first lessons, in Account and before a purchase, and never forced.
2. **Home [v4]** = a tab bar along the bottom: **Learn** (the path map, 7.1), **Practice** (7.3) and **Account** (stats and profile, 7.4); **Spot it** (7.7) joins when the replay bank exists. **[v4.1]** Spot it becomes the **Arena** tab (7.7): Learn, Practice, Arena, Account. Tabs are peers: switching is instant, never a slide. There is no Leaderboard in v1.0 (`docs/agent.md` §1) — v3 had one, and an opt-in friends league may follow the release.
3. **Lesson player** (section 2).
4. **Path choice** is a lesson of its own after the Chapter 1 Final Exam (Level 17-2), played from its own node on the map. The path can be changed in Settings (Your path), from the top bar's logo (**[LOOK-SYSTEM]**, §7.2) or by playing the node again. A path whose chapters are not written yet reads "Being written" and cannot be picked.
5. **Settings** opens from a button on Account: lesson design (swipe left and right through a live preview of each design; one press applies it, §10; **[LOOK-SYSTEM]** built as Design → **Change design**: a real lesson screen full screen, lesson 1-1's profit question with its top bar, answers and key, wearing the design shown; a swipe or the arrows move between Neo, Neo Mono and Classic Contrast without choosing, the answers can be tapped, "Use this design" chooses the one on screen, and leaving puts the chosen design back), market profile, theme, sounds/haptics, reduce motion, your path, reset progress (asks once more; the settings stay), legal, and a button that opens the all-screens test bench. While the app is being tested, Settings also refills the hearts and skips ahead to any level (everything before it counts as played); both go before release. **[v4]** Settings also holds the daily goal, reminders, the market profile and time zone, light/dark/system, the colour-blind palette and Legal. The testing tools exist only in test builds (every development run, which is what Expo Go opens, and exports with `EXPO_PUBLIC_TEST_TOOLS=1`) and never earn XP. **[LOOK-SYSTEM]** They sit in Settings itself, in a **Testing** section at the end: Refill hearts, Add 50 gems, Skip ahead, then Every screen type (the test bench), Animations and Design suggestions (§10), each of the last three a page of its own (David, 2026-09-30: all the developer options straight in Settings, not behind a Development page). **[LOOK-BRIEF]** Among them, **Animations** plays the animations of rare moments on a tap, as often as wanted and without earning or losing anything: a level opening on the map, lesson complete, a perfect run, a chapter's badge, a new tier, the flame of right answers in a row, a lost heart, out of hearts, and the mix's streak screens (**[LOOK-SYSTEM]** those two rows left with the prototype, and on 2026-09-30 David asked for them back: "Streak goes up" and "Streak lost" play the real streak screens, from the learner's own streak). **[LOOK-SYSTEM]** **Design suggestions** works the same way (David, 2026-10-01): a row per idea, and a tap plays its preview on a page of its own (§10). **[v4.1]** Settings also holds the language, the account (sign in, sign out, export your data, delete your account), Nutrade Plus (manage, restore purchases) and the privacy choices for analytics and ads.
6. The one-line risk note appears on first launch, on every scenario result and on the stats screen; the full disclaimer lives in Settings → Legal.

---

## 12. How level files reference this document

Level files use the archetype `type` and component ids from sections 3, 4 and 6; the exact fields per type are defined in `docs/schema.md`. Anything not stated in the level file (labels, animation, colors, layout) is defined here and must not be repeated there.
