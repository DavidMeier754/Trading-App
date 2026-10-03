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
**[DESIGN-REVIEW] (2026-10-03)** — David's verdicts on 50 design ideas (stage `DESIGN-REVIEW` in
`docs/build-plan.md`): the decision grid in the chart reveal, a fixed chart frame, the R ruler, chart
notes, the open on the chart, keys with a direction, matches without colours, the mistakes deck, the
checkpoint briefing, skills collected after each lesson, a Practice tab with Daily mix, Skills and
Mistakes, hearts that all come back after five hours, chapter emblems, tier materials, the Account
page, the sine-shaped map with side stops, and two rules of his own: don't overdo it, and the bigger
the accomplishment, the bigger the moment. The variance simulator is dropped: the app never states
how often something works (`docs/agent.md` §3.11). Marked **[DESIGN-REVIEW]**. The content these
need is listed in `docs/ContentToDo.md`.

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
11. **[DESIGN-REVIEW] Don't overdo it.** David, 2026-10-03: a slider with ticks, a value bubble and a haptic at every tick is "too much for such a simple question"; a plan document must not "bring too much content on one page"; an order eating the book had "too much going on". A simple question gets a simple screen: no extra marks, bubbles, sounds or haptics where a plain control does the job, and one page carries one block of content. A design that needs a paragraph to explain itself is too much. When in doubt, leave it out.
12. **[DESIGN-REVIEW] The bigger the accomplishment, the bigger the moment.** David, 2026-10-03: "great accomplishments should get better animations, haptics, UI and so on." The celebration grows with what was achieved, so the rare ones stay special: a right answer gets its chime; a finished lesson its ring and count-up, calm; a perfect lesson the gold ring and the only confetti in a lesson (§5.3); a finished chapter its own emblem medal, a heavier haptic sequence and a longer sound (§5.4); a new tier the card turning over to its new material (§5.5). Rare moments may move more than anything else in the app — still calm (decision H), still skippable with a tap, and still never over text.

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
- **[DESIGN-REVIEW] The reveal sits right on the key.** David, 2026-10-03: every "Good call" panel goes "just above the button, else the gap looks weird". The reveal's strip is at the very bottom of the content area, its lower edge on the footer's line, with no gap between it and the key, on every question type. On `chart-decision` the chart takes all the height the screen has above the decision keys, and after the choice the reveal panel is compact (§5.1b), so the chart stays as large as it can be: "make sure the whole screen is filled … make the chart bigger and the box a little smaller".
- Portrait only; charts may offer an expand button (section 6.4).

---

## 3. Screen archetypes

`type` values used in level files. Non-question screens:

| type | Name | What it is |
|---|---|---|
| `intro` | Intro card | Big headline (one sentence), optional subline. First screen of every sub-level. For tests/exams it shows the scored-question counter ("0/10"). **[DESIGN-REVIEW]** For a Checkpoint or Final Exam it is a **briefing card**: the kind as the kicker ("Checkpoint"), the chapter's name as the title, the intro text as one line, a row of empty pips (one per question), one row "10 questions · 70 % to pass · 5 hearts", and the file's `facts` (the account numbers) as chips. |
| `theory` | Theory card | Title + body (max 3 lines) + optional visual component. The main teaching screen. |
| `example` | Example card | A concrete number or mini story + visual, often animated. Follows a theory card. |
| `carousel` | Concept carousel | 2–4 sibling cards shown one after another, dots under them for where you are and a `Next` button until the last card. Every card takes the height of the tallest, so nothing around it moves. Each card = icon + label + 1–2 sentences. Counts as one screen per card. |
| `walkthrough` | UI walkthrough | A mock UI component with one field spotlighted per step: the field lit in the accent, the rest of the component dimmed, the step's line under it. Counts as one screen per step. |
| `visual` | Info visual | A chart/diagram component with a one-line caption. |
| `checklist-reveal` | Checklist reveal | Checkbox items are ticked one per tap — the button or the list itself — forming a checklist the user later applies. An item not yet ticked is a bar where its words will be, so the list keeps its size and does not give the next item away. |
| `story` | Story frame | Short narrative ("9:31. You're watching XYZ…"). The speaker is named in the copy, not drawn — there is no character cast (§6.9). Used before decisions. Marked "The scene", with an accent edge, so it does not read as a statement to judge. **[v4]** With `label: takeaway` it closes a lesson instead and is marked "Takeaway". **[DESIGN-REVIEW]** A scene with `alert` reads as a market alert: a bell, the ticker and the time in its head row, the sentence, a small sparkline of the move so far, and up to three facts as chips (the gap, the relative volume). |
| `recap` **[v3]** | Level recap | End-of-level card: 2–4 one-line takeaways from the level's sub-levels, each tappable to re-open that card. Cheap, and it is what makes a 19-level chapter feel navigable. **[v4]** Each point names its card (`card:`, `docs/schema.md`), and a tap opens exactly that card. |
| `plan-card` **[v3]** | Your plan | A card the **user fills in and keeps**: their daily loss limit, their share size, their playbook card. Persists to the profile, re-appears (pre-filled, editable) in later chapters, and is exportable. Every card writes keys from the one plan namespace in `docs/schema.md` ("The plan"), which is what makes the re-appearing real: revisiting a key opens the field on the learner's current value and overwrites it, keeping the old one in a dated history. The single strongest engagement device in the app — the user is building their own document, not just answering. A number line steps with − / + or takes its suggestion in one tap (the suggestion shows, faint, while the line is empty); a text line is typed. The button waits until every line is filled, a number above zero. **[v4]** A line can be a choice (`kind: choice`) and a number can have a range; an answer that makes no sense is refused with a one-line reason. The plan shows each key's history and can be shared as an image or as text. |
| `summary` | Score summary | "X/N correct", progress ring, per-question list with green/red dots (tap → one-line reminder + link to source level). Pass mark 70 %: pass → "Continue"; below → "Almost — review these", "Retry", and "Back to path" under it. **[v4]** A red row shows the correct answer too, and its link opens the card that taught it; "Review these" starts a practice round of exactly those questions. |
| `badge` | Chapter complete | Badge unlock animation, chapter name, XP bonus, "Chapter N unlocked". **[DESIGN-REVIEW]** The chapter's own emblem in a cut gold medal (§5.4). |
| `tier-up` **[v3]** | Tier unlocked | Fires at the tier boundaries in §7.5. Bigger than a badge: the tier name, what it means, what unlocks. **[DESIGN-REVIEW]** The tier card turns over from its old material to its new one (§5.5). |
| ~~`variance-sim`~~ **[v4], dropped [DESIGN-REVIEW]** | ~~Variance simulator~~ | Dropped on 2026-10-03 before it was built. Its fixed win rate would read as a reliable fact, and the app never says how often something works (`docs/agent.md` §3.11). Lesson 1·2-4 teaches variance with the learner's own decisions and the `decision-grid` visual instead (§6.10). |
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
| `match` | Terms left, definitions right, every card as tall as the tallest so the rows line up; tap either side first, then its partner (every tap sounds), or drag; correct pairs lock green; wrong pairs flash red and reset. `Check` once every pair is made. | Max 5 pairs; every target unique. Prompt must be specific to the content, never a generic "Match each word to its meaning." Scored on whether the learner got there without a wrong tap. **[v4]** No wrong tap: green. Exactly one: amber — counts as correct, costs no heart. Two or more: red. ~~Matched pairs keep a colour of their own, so the finished board shows what belongs to what.~~ **[DESIGN-REVIEW]** No colour per pair and no threads (David, 2026-10-03: "remove the different colours and just make it fun via the animations and the haptic feedback"). Every matched pair locks in the one success colour. The fun is in the feel: the two cards snap towards each other and pop, a ring goes out, and each pair lands one note higher with its own light tap; a locked pair then steps back a little so the open ones stand out; the last pair sets off a short wave across the whole board with a firmer haptic. |
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
| `order-build` | Assemble a complete ticket from chips: side, order type, quantity, limit price, stop price. Wrong parts shake; the reveal shows the finished ticket. **[DESIGN-REVIEW]** It looks like a broker's ticket (§6.7): a Buy / Sell switch that turns green or red, the order types as one segmented row, quantity and prices as rows of their own with their options, and the estimated cost at the bottom once quantity and price are set. | Turns "which order type?" into "place the actual order", which is what Chapter 3 and 8 need. |
| `scanner-pick` | A mock scanner/watchlist table (ticker, % change, relative volume, float, spread, catalyst). Tap the row that meets the stated criteria. 1–2 correct rows. **[DESIGN-REVIEW]** Each row carries a small sparkline of its day and its relative volume as a short bar beside the number (§6.8). | Chapter 5 has no other honest way to teach selection. |
| `compare` | Two or three charts side by side; pick the one that matches the card (or "neither"). | Discrimination is a different skill from recognition, and it is where playbook chapters go wrong. |
| `branch` | A multi-step scenario: choose, see the consequence, choose again, 2–4 steps deep. Each step carries its own reveal; the final screen shows the path taken. Counts as one screen per step. | The only way to teach *management* — trade goes against you, now what? — rather than entry alone. |
| `journal-row` | Fill the fields of one journal row for a finished trade (setup, entry, stop, exit, R, grade) from chips and a keypad. | Makes Chapter 6's journal a thing the user does, not reads about. |
| `depth-ladder` | An interactive Level 2 ladder: answer where a given order fills, or which side is stacked. **[DESIGN-REVIEW]** After Check, a market order is walked through the book: level by level from the best price, each level's size bar drains as it fills, and the level where the last share fills is marked. Nothing else — no running counter, no extra panel (David: "keep it simpler"). | Chapter 4's tape strand needs a native interaction, not a hotspot on a static image. |
| `chart-replay` | A chart the learner advances bar by bar, watching for a setup to form and acting when it triggers. Full spec in 4.4. Counts as one screen per marked moment (setup or decoy), minimum 4. | The only type that tests *timing* and *restraint*. Every other type shows a frozen moment; this one asks "is it now?" — and can measure the trade you took that was never there. |

**Selection rules.** ≥3 different question types per sub-level; ≥10 different types per chapter; every type used at least twice per chapter; max 2 `mc` in a row; every Chapter ≥2 sub-level has at least one visual/interactive screen. `tf` never asks what the prompt gives away.

### 4.3 `chart-decision` — the scenario engine

The chart plays to a decision point and pauses. Three buttons: **Long**, **Short**, **No trade** (Chapter 1 uses a simplified **Buy / Wait** variant). After choosing, the chart continues candle by candle (~120 ms each, tap to skip) and shows the outcome strip and a one-line rationale.

- Scored on reasoning; "No trade" can be best; other answers can be "reasonable" and are marked amber.
- **"No trade" is never red when the best answer is directional.** Standing aside is at worst amber, in lessons and in exams. The app promises this in Chapter 1 and must keep it for 385 sub-levels.
- Session state (day in R, limit, trades taken, size) shows as chips above the chart (6.4).
- The outcome strip reports the move in points and %, with the share count from the scenario. Never as a prediction.
- **[DESIGN-REVIEW] Keys with a direction.** Long, Short and No trade (Buy and Wait in Chapter 1) each carry a small glyph: an arrow up and to the right, an arrow down and to the right, a flat line. The keys stay equal in weight and colour (§6.4); only the glyph carries the direction, and it nudges that way when the key is pressed. It reads faster than the word and does not depend on colour.
- **[DESIGN-REVIEW] After the choice** the chart draws what the file gives it: the entry, `stop` and `target` as labelled lines, playback ending at the first one touched (§6.4); the R ruler from the lesson that teaches R on; and once everything has played out, the file's `notes` on the bars they name.

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

**[DESIGN-REVIEW] The deck.** The round opens on a screen of its own: the missed questions as a small fanned deck, each card with the question's first words and what the learner answered ("You said: Short"), and the count ("2 to fix"). **Start the round** gathers the deck, shuffles it once and deals the first card; then the questions follow as ordinary screens, the progress bar continuing from where the lesson ended. The deck makes the round concrete and small, so it reads as a second chance, not a punishment (David approved it on 2026-10-03). Under reduced motion the deck is drawn still. **Built** as a pile rather than a fan: opaque cards, each one behind peeking out above the next with its question's first line readable, the front card showing its question and "You said: …", and "+2 more" past four cards (a fan of see-through cards overlapped the words into a blur). The top bar reads "Fix 2/6" during the round.

**[DESIGN-REVIEW] Questions stand alone.** A question can come back outside its lesson: in this round, in a mistakes review on the map (§7.1) and in Practice (§7.3). One that follows a `story` brings the scene with it; every other question must make sense on its own (`docs/ContentToDo.md` 1.5).

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

- **The grade first.** A chip names the decision: green **Good call**, amber **Reasonable**, red **Not this time**. The first line speaks to the option the learner actually chose. After Buy, Long or Short it talks about the trade taken; after Wait or No trade it talks about standing aside. "Waiting costs nothing" (or "Staying out costs nothing") is only ever said to someone who stood aside. **[DESIGN-REVIEW]** The lines are short, one line on most phones, so the chart keeps the room: "Buying was the right call." · "Buying was fair. Wait was better." · "Waiting costs nothing. Buy was better." · "Buying was not the call. Wait was better."
- **Then the outcome, smaller.** The level file's `outcome` sentence, then one result line with the share count: "+$45.00 on 250 shares", "−$84.00 on 600 shares · −1R". The line is coloured by its sign but sits in a neutral container under the grade, so it never reads as the verdict. Standing aside shows the hypothetical in grey: "Had you bought: +$0.02 per share."
- **Right call, losing trade.** Green grade, losing result: one line joins them. ~~"Right call — this trade lost anyway. This setup loses about 4 in 10 times; judge the decision, not the result."~~ **[DESIGN-REVIEW]** "Right call — this trade lost anyway. One trade says little; judge the decision, not the result." No rate: the app never says how often a setup wins or loses (`docs/agent.md` §3.11). **Why?** opens the card from Chapter 1 Level 2-4.
- **[DESIGN-REVIEW] The decision grid.** Beside the grade and its line sits a small 2 × 2 grid: the rows are the decision (right call, not this time), the columns the result (won, lost). A dot lands in this trade's cell as the result arrives, so "right call, lost anyway" is a place on the grid and not only a sentence. An amber decision sits on the line between the rows; standing aside puts a hollow dot in the cell of what would have happened. The grid replaces the old line's length, not the grade: the grade stays first.
- **[DESIGN-REVIEW] Compact.** On `chart-decision` the panel is as small as it can be — the chip and the lead on the left with the grid beside them, then the explanation, then the outcome box across the full width (the outcome sentence, then the result line) — so the chart above it keeps the screen (§2). Built so; on a 390 × 844 phone, lesson 1-1's first decision gets a chart one grid step taller than before.
- **The risk note** (`docs/agent.md` §7) sits under every scenario result in the smallest legible type.
- Screen readers hear the grade, the outcome sentence and the result line, in that order — and nothing of the reveal before the answer is given.

### 5.2 Hearts
- 5 hearts, always shown at the right end of the top bar (section 2) and on the home HUD (7.2). **[v4]** A wrong answer in a Test or a Final Exam removes one (the heart breaks, shrinks and greys out, 300 ms). Lessons never cost a heart — their wrong answers come back in the mistakes round (§4.5). Amber answers never cost a heart, and neither does practice (7.3, 7.7).
- ~~Each lost heart returns after 4 hours; the time until the next one is shown beside the hearts on the path map.~~ **[DESIGN-REVIEW]** David, 2026-10-03: "all 5 hours ALL hearts get added back". The first heart lost starts a five-hour clock; when it runs out, every heart is back at once. Hearts lost while the clock runs do not restart it. On the path map a thin ring round the heart fills over those five hours; it encloses the heart alone and never covers the count beside it. A tap on the hearts drops "All hearts back in 3h 12m" under them for a moment, as the flame's "Today 1/2" does; a screen reader hears "3 hearts, all back in 3 hours 12 minutes".
- **[v4]** Finishing a practice session returns one heart.
- **[v4.1] Nutrade Plus** removes the limit: the hearts show ∞ and a Test never stops for them, but the pass mark stays. For a free learner, the Out-of-hearts screen lists the free ways first (Review the cards, Practice for a heart, wait) and Plus after them (§7.8).
- Losing the last heart stops the Test on an "Out of hearts" screen; the Test does not count as passed. **[v4]** The screen is not a dead end: it offers **Review the cards** (the tested levels' theory cards) and **Practice for a heart**, with **Back to path** under them. A Test cannot be started again until a heart is back; lessons always can.

### 5.3 Sub-level complete
- XP counts up from 0 (600 ms); the path-map XP bar fills on return.
- The XP total (on the home HUD until LOOK-SYSTEM, which took the goal ring out of the top bar; Account's stats show it from §7.4 on) is the sum of what the summaries showed: the lesson's XP plus the perfect bonus, replayed sub-levels included. **[v4]** A replayed sub-level earns a quarter of its XP and no bonus; the perfect bonus is paid once, on the first perfect run; testing tools earn nothing.
- Accuracy ring animates. Perfect run → gold ring + confetti (1 s, respects reduce-motion). **[v4]** Only a perfect run, and never over text. **[DESIGN-REVIEW]** Built so: a normal finish is calm (the ring, the count-up, no confetti); a perfect one turns the ring gold and is the only time confetti falls in a lesson, from behind the ring and never across the numbers.
- **[DESIGN-REVIEW] Skills learned.** David, 2026-10-03: "After every lesson the user does where he learns a new word, technique, and so on there is a small overview of what he has learned, then there is the result screen with all the XP … and when the user then exits out to the home screen there is an animation where those cards/skills get transferred to the Practice tab." So a lesson that teaches something new ends in three beats:
  1. **What you learned:** the lesson's new skills, one per term (`terms_introduced`) and per technique (`skills`, `docs/schema.md`), dealt in one after another, with "Continue". Only skills not collected before: a replay of a lesson already finished skips this screen. **Built** as chips — a book for a word, a bulb for a technique — with a count line ("10 new words. Tap one to see its card again."), so even lesson 1-1's ten new words fit on one screen without a "+4 more"; a tap opens the skill's sheet, the same one a marked term opens (§8). Names only until the glossary exists (stage `GLOSSARY`): a lesson card's sentence torn out of its place ("That's a profit.") explains nothing, so the one-line meaning per chip waits for `content/glossary.yaml`.
  2. **Lesson complete** (this section).
  3. **Into Practice:** back on the home screen, the cards fly from the middle of the screen into the Practice tab's icon, one after another; the icon swells as each lands, with a light tap, and keeps a small dot until Practice is opened. Under reduced motion the dot alone appears. **Built** (`src/home/SkillFlight.tsx`): at most five cards, 0.62 s each on an arc, 0.14 s apart, starting 0.38 s after the home screen shows; Settings → Testing → Animations has a row that plays it.
  A skill opens its card again from Practice → Skills (§7.3).
- **[v4]** The summary names the lesson (`subtitle`). On lessons with chart decisions it counts decisions and results apart: "Decisions 7/8 · Results: 4 won, 3 lost". It lists the questions missed, with **Practice these**, and shows today's goal ("1 of 2 today"; **[LOOK-SYSTEM]** a "Today 1/2" row, in the accent once the goal is met).
- Streak flame shows the day count; when today's goal is just met, the flame ignites (scale + glow). No streak-loss warnings inside lessons.
- **[v4] The daily goal is the learner's choice** of 1, 2 or 3 sub-levels (default 2 ≈ 10 min). The ring on the home screen fills in that many parts (**[LOOK-SYSTEM]** "Today 1/2" in place of the ring, §7.2), and the streak counts the days on which the goal was met.

### 5.4 Chapter complete (`badge`)
- Badge drops in with a spring, ring of light expands, chapter name types in, XP bonus counts up, "Chapter N unlocked" fades in, CTA last. After Chapter 1 the path-choice lesson opens on the map as its own node (§7.1).
- **[DESIGN-REVIEW] An emblem for every chapter.** Every chapter ends with a medal of its own instead of the same star: a cut, faceted gold medal on two ribbons, with the chapter's emblem pressed into it — a coin for Market Basics, a candle for Charts 101, a ticket for Orders & Costs, layers for Reading the Market, a scanner for Finding the Trade, a shield for Risk & Psychology, cards for the Playbook, a bell for the Trading Day (the same eight for every path). It is a great accomplishment, so it gets a bigger moment (§1, principle 12): the medal drops from above and lands with a heavy haptic, a glow blooms behind it, light runs across its face, the name types in, the XP counts up, then a row of the eight emblems shows how far the path has come, this chapter's taking its place, and the next chapter is named ("Chapter 3 is open: Orders, Costs & Position Size"). The key comes last. The medal then stands on the Account page's shelf (§7.4). **Built:** the medal is drawn (`src/rewards/Medal.tsx`): a twelve-faceted gold rim, a gold face with the emblem pressed in, two ribbons in the accent; gold is fixed, the same in light and dark. It lands with a new `medal` cue — heavier and longer than the badge's (a low thud, a rising fifth over a warm chord, a long shimmer). The kicker reads "Chapter 2 complete" over the chapter's name (the file's "— Complete" is dropped from the title). The next chapter is named when the file's `unlocks` is "Chapter N" ("Chapter 3 is open: Orders, Costs & Position Size"); other `unlocks` keep their words ("Your path unlocked"). There is no XP count on this screen: a `badge` carries no XP of its own, and the lesson's XP is already counted on lesson complete.

### 5.5 Tier complete (`tier-up`) **[v3]**
Rarer and louder than a badge: full-screen, the tier name and what it means, the tier card (**[DESIGN-REVIEW]**: in place of the Trader Card) updating in place, and one line on what the next tier covers. Four per path (§7.5).
**[DESIGN-REVIEW] Tiers as materials.** The tier card is printed in the tier's material: **Observer** paper, **Student** bronze, **Planner** silver, **Sim Trader** graphite and gold. A new tier turns the card over in place, from the old material to the new one, with the tier's name, "Tier 2 of 4", four pips and what the tier means; a row of the four materials marks where the learner stands, and one line names the next tier and when it comes. The same card heads the Account page (§7.4). (The Trader Card idea with stats on it was not taken; the tier card is what Account shows.) **Built** (`src/rewards/TierCard.tsx`): the old card is seen for half a second, then turns over in 0.64 s; the `tier` cue starts so its chord lands as the turn ends, with the gold confetti. Under the card: the file's sentence (`means`), the row of the four materials with the learner's place marked, and "Next: Student, at the end of Chapter 4." ("The last tier of the path." after Sim Trader). The card itself carries §7.5's short line. Before Observer the card is blank, with a dashed edge. The materials keep their text at 4.5:1 or better.

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
- **[DESIGN-REVIEW] The frame holds still.** David, 2026-10-03 (on the frosted-glass idea, which he did not take): "make sure the line before it gets revealed already is at the middle of the chart so the chart's y-axis units don't get bigger or smaller." From the first frame the price range already covers every bar still to come, and it is centred on the bars the learner can see: their middle is the middle of the chart. When the future plays out, nothing rescales, nothing slides, and the axis labels never change. The hatched box over the hidden bars stays as it is.
- **[v4] Stop and target** from the level file (`stop`, `target`) draw as labelled lines, and playback ends at the first one touched. **[DESIGN-REVIEW]** Built: they appear with the choice, not before it (they would give the direction away), with the entry as a third, quieter line; their price tags sit on the axis in the number face.
- **[DESIGN-REVIEW] The R ruler.** On a decision with `stop` and `target`, from the lesson that teaches R on (Scalping 6·2-1; the app checks that the lesson introducing the term "R" is behind the learner), a slim ruler stands beside the price axis: −1R at the stop, 0 at the entry, +1R, +2R … up to the target. While the trade plays out a marker climbs or falls along it and stops on the result, labelled in R ("+1.6R"). It shows when the learner took the trade the file describes, faint when they stood aside, and not at all when they traded the other way. It teaches R by being there every time, without a sentence.
- **[DESIGN-REVIEW] Chart notes.** After the reveal, the file's `notes` (1–4) appear on the chart, each a few words on a small tag with a thin leader line to the top or the bottom of the bar it means ("Lower high", "Breaks the shelf"). They fade in one after another once playback has ended; they never cover the last bar's price tag, and they are part of the screen reader's description.
- **[DESIGN-REVIEW] Words on the chart stay readable.** Built: every label on a chart — a level's name and price, the entry, the stop, the target — is drawn over the bars on a thin rim of the page's colour, so no candle hides a price. A level's label sits at the left end of its line, just over it; it moves to the right end, or under the line, only where that clears a real part of a bar (not the tip of a wick), judged against every bar of the chart, those still to come included, so it never moves while the replay plays. The stop's and the target's labels take the other side of their line when the usual side would run into the "decision" tag at the top. A note steps further out from its bar when it would cover a label, another note or another bar, and takes the bar's other side when its own has no room; the outcome tag steps clear of the levels' labels. On a narrow chart a long label can still cross a candle; the rim keeps both legible.
- **[DESIGN-REVIEW] The open.** A chart with `session_open` shades the bars before the open as pre-market, faintly, and draws a dashed line before the first regular bar with a small bell and "Open". Only on charts where the open matters (David: "only on charts where it is important … in levels testing setups"), and explained the first time (`docs/ContentToDo.md` 1.2).
- **[DESIGN-REVIEW] Simple first.** Charts start with as little on them as possible and gain information as the path goes on: a line, then candles, volume, levels, the open, stop and target, VWAP, the R ruler. Nothing appears before the lesson that explains it, and the first chart that shows it explains it (the ramp: `docs/ContentToDo.md` 1.2).
- **[v4] Decision buttons are equal in weight.** No option is pre-coloured. The label over the hidden bars reads "What happened next", never "Next 5 bars" — Chapter 1 has no bars yet. **[DESIGN-REVIEW]** Each key carries its direction glyph (§4.3).
- **[v4] Text alternative.** Every chart carries a one-sentence description for screen readers ("Price climbed in steps from 9.80 to 10.05").

### 6.5 Bars, timelines, stacks
- Horizontal bar chart: bars grow from 0 (400 ms, staggered 80 ms).
- Session ribbon: horizontal ribbon with three colored segments (pre-market, regular, after-hours) and a "now" marker; times from the market profile. **[v4]** Drawn to scale in hours, with "now" in the learner's own time zone.
- Cost stack: stacked bar (spread + slippage + fees) against a target-profit bar with the consumed percentage. Always labeled with the share count.

### 6.6 Order book ladder (Chapter 3+)
Two columns of price levels with size bars; best bid/ask rows highlighted; animates as orders arrive. **[v3]** interactive in `depth-ladder`: rows are tappable and an order can be "walked" down the book to show the fill. **[DESIGN-REVIEW]** Built for `depth-ladder` (§4.2): after Check the order walks the book one level at a time, each size bar draining as it fills, and the last fill is marked. One movement, nothing beside it.

### 6.7 Order ticket mock
Side toggle (Buy/Sell), order-type chips (Market / Limit / Stop), quantity, price field, submit. Used by `walkthrough`, `hotspot`, `spot-mistake`, **[v3]** `order-build`, and hands-on practice.
**[DESIGN-REVIEW] Like a broker's ticket** in `order-build`: the ticker in the head, a Buy / Sell switch whose chosen half turns green (buy) or red (sell), the order types as a segmented row, then quantity, limit and stop each as a labelled row with its options as a segmented choice, and at the bottom the estimated cost ("≈ $27,345 for 1,500 shares") once quantity and a price are chosen. Practising on something that looks like a real ticket makes the first real one familiar (Chapter 8). The look changes; the slots, chips and grading stay as `docs/schema.md` has them. **Built:** every field's options sit in its row, so a tap fills it directly (the chip tray below the fields is gone for `order-build`; `journal-row` keeps it) and a tap on the chosen segment empties it; the price row is called "Limit price" or "Stop price" after the order type chosen; the estimate only appears on tickets with both a share count and a price. After Check each row is graded on its own: the chosen segment green or red, and in a wrong row the intended one outlined with a dashed line.

### 6.8 New components **[v3]**

| id | What it is | Used by |
|---|---|---|
| `scanner-table` | 4–8 rows: ticker, price, % change, relative volume, float, spread, catalyst tag — a table shows only the columns its rows carry. Sortable in demo mode; rows tappable, and a `scanner-pick` keeps its answer-card look after the reveal. **[DESIGN-REVIEW]** Each row shows a small sparkline of its day beside the ticker (the row's `spark` when the file gives one; otherwise a plain line from the previous close to today's change, never invented wiggles), relative volume as a short bar under "4.1×", and the catalyst as a tag. The ticker and today's change sit close together (David: "not so much space between the Stock and Today"). | `scanner-pick`, Chapter 5 theory |
| `journal-table` | A journal with columns for setup, entry, stop, exit, R, grade, note. Rows fill in one at a time; signed numbers in their sign's colour. A first column keyed `""` is a row label, so the same table carries a small comparison grid (Chapter 1 Level 17-2). | `journal-row`, Chapter 6 |
| `internals-panel` | The index chart, sector strength, breadth reading and a risk-on/risk-off tag, as one compact panel. | Chapter 5 market-context levels |
| `hotkey-pad` | A stylised key grid (buy, sell, size, cancel, flatten) that lights up as a sequence plays. | Chapter 8 execution levels |
| `stats-card` | The learner's own numbers: decision accuracy by setup, best day type, weak concepts. | Stats screen, Chapter 8 |
| `r-tracker` | A running R strip for a simulated session: each trade as +/− bars against the day's limit. | Chapters 6 and 8 capstones |
| `plan-sheet` | The user's own saved plan (limits, size, playbook cards), editable. A line with a literal value in the level file is a specimen; a line without one renders what the learner wrote, and may only name a key an earlier `plan-card` has already asked for. **[DESIGN-REVIEW]** Drawn as a page of a document: a small heading, then one line per field — the label, a dotted leader, the value in the number face. No boxes, no colours, nothing else on it (David: "don't overdo"). A line the learner has not filled yet shows a faint dash ("not set yet" to a screen reader). The whole plan reads back the same way from Account → Your plan (§7.4). | `plan-card` |
| `decision-grid` **[DESIGN-REVIEW]** | The 2 × 2 grid of decision against result (right call / not this time × won / lost), each cell labelled. Optional `cell` (`right-won`, `right-lost`, `wrong-won`, `wrong-lost`) marks one with the dot the reveal uses (§5.1b). | Chapter 1 Level 2-4, glossary |
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

### 6.10 ~~Variance simulator (`variance-sim`)~~ **[v4], dropped [DESIGN-REVIEW]** — the decision grid instead

The simulator was to teach `docs/agent.md` §3.11 with ten trades of one good setup at a stated win
rate. David dropped it on 2026-10-03, before it was built: "this would imply the number given (like
6/10 are right) are reliable and I don't want this. The user should do his own research on how often
strats work for him." Any fixed rate on a screen reads as a fact about the market, and the app never
says how often a setup or a strategy works (`docs/agent.md` §3.11).

What teaches variance instead:
- **The learner's own decisions.** Lesson 1·2-4 lets them make a right call that loses, and the reveal
  shows it (§5.1b).
- **The `decision-grid` visual** (§6.8): decision against result, four cells. The reveal of every chart
  decision puts a dot in it, so the idea comes back hundreds of times.
- **Their own numbers.** The lesson summary counts decisions and results apart (§5.3), the variance view
  in Account shows how many of the learner's right calls won and how many lost (§7.4), and Chapters 6
  and 8 teach how to measure a method from one's own journal and simulator sample.

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
- **[v3] The map must survive 8 chapters.** Collapsed chapter sections by default, with the current one expanded; a sticky chapter header while scrolling; a "jump to current" button; and a zoomed-out overview showing all eight chapters as tiers. Built so far: the folding sections and the "Jump to" button, which shows while the current level is off screen. Not yet: the sticky header and the overview. **[DESIGN-REVIEW]** The sticky header is built (below); the overview is not.
- **[DESIGN-REVIEW] A path like a sine wave.** David, 2026-10-03: "not put all the levels in the path into one straight line but instead in a curvy path like a sin function. Also keep the distance/size of the level buttons." The levels sit on one continuous sine curve down the screen — centre, out to one side, back through the centre, out to the other — and the dotted trail between them follows that same curve, so the path flows instead of stepping. The buttons keep their size (66 pt in an 86 pt ring) and their spacing (148 pt from centre to centre); the curve swings about a fifth of the screen's width to each side, and every label still sits whole on the side the curve leaves open. **Built:** a full swing every four levels (−sin of the level's place × π/2), at most 80 pt to a side; the dots between two levels, and the spark that runs down them when a level opens, follow the same sine. The way ahead is drawn in the border colour, quieter than the lit way behind (it was nearly invisible before).
- **[DESIGN-REVIEW] Side stops.** Optional stops sit beside the path, off its line, on the side the curve leaves free between two levels, joined to it by a short dotted spur. They belong to the path's family — the same faces, colours and ring as its levels, a size smaller and with a dashed ring — so they read as part of the map and clearly as optional (David: "make those levels fit the path's vibe/design … just search for space to put this in"). A side stop opens when the level before it is done, never blocks the path, costs no hearts and is never timed. Two kinds:
  - **Your mistakes** — a mistakes review, two or three per chapter: one before each Checkpoint and one before the Final Exam (David: "you would also have to add a previous mistakes level 2 or 3 times per level"). It holds the questions the learner missed since the previous test and has not answered right since, up to eight, played like a lesson with no hearts. Answered right, a question leaves the list; the stop shows a check when nothing is left. With no mistakes it says so ("Nothing to fix here") and shows its check. The questions come from the app's own record (§7.3), not from a level file.
  - **Spot it** — the bonus side lessons (above, `docs/ContentToDo.md` 2.7): a target symbol, two or three charts bar by bar, gems on the first finish. The map draws one for every bonus file a chapter has.
  **Built** (`src/home/SideStop.tsx`): a 48 pt face in a 64 pt dashed ring, a short spur of three or four dots to the path, just outside the curve's swing halfway between the two levels and nudged away from the level on that side. No caption: wherever it went it met a level's label, so the dashed ring and the symbol (two arrows for mistakes, a target for Spot it) mark it, a screen reader hears its name, and a tap opens a small card that names it — "Your mistakes", how many questions it holds ("No hearts, no timer."), **Practise them**; locked, "Opens when Level 10 is done. It never blocks the path." The mistakes play as a practice round of up to eight (`src/practice.ts`), and an answer right takes a question off the list.
- **[DESIGN-REVIEW] The chapter docks while you scroll.** When a chapter's card scrolls up under the banner, a slim bar takes its place under the banner: the trophy, "Ch 1 · Market Basics", the chapter's bar and "5/17". It changes as the next chapter's card reaches it. A tap scrolls back to that chapter's card. It is part of the map, not an overlay: it does not cover a level card or the top bar. **Built:** a 40 pt bar at the top of the map, under the banner, fading in once the card has scrolled fully under it.
- **[DESIGN-REVIEW] Chapter gates.** From Chapter 2 on, the path enters each chapter through a gate: a dotted arch spanning the path above the chapter's card, the trail running from the last level of the chapter before, through the arch, to the first level. The card in the gate says only what is general (David: "only put general infos like name, which chapter, levels and so on. Remove the 'Finish to become …' and also the time"): "Chapter 2", "Charts 101", its levels done of all of them. No tier, no time estimate. Folded chapters keep their arch, so the gates still mark where one chapter ends and the next begins. **Built:** 40 pt of room over each card from Chapter 2 on (and over the closed door before a path is chosen); the arch is dotted like the path, lit once the chapter is open; the trail runs from the last level of the chapter before (or its folded card) under the card to the first level. The card itself already said only the general things.
- **[DESIGN-REVIEW] Two-tone symbols.** A level's symbol is drawn in two tones: a soft fill of its shapes under the line. A locked level keeps its symbol's own colour at low strength instead of turning grey, so the map ahead still has character; its lock badge still says it is shut. **Built:** most symbols are lines, so the second tone is the symbol's own strokes, wider and soft, under the line (closed shapes are filled too); a locked level's symbol is the accent at about half strength, a locked side stop's too.
- **[DESIGN-REVIEW] Titles in the display face** (§10): the banner's title and the chapter cards' names.

### 7.2 Persistent HUD
**[LOOK-SYSTEM]** Left to right: the path's logo, the streak flame with its day count, the gems (David, 2026-09-30) and the hearts (below). David, 2026-10-01: the bar lines up with what is under it, so the logo sits on the banner's left edge, the hearts on its right edge, and the streak and the gems are spaced evenly between (until then the four were spaced evenly across the screen). A tap on the logo opens the paths: a card drops from the top bar with the three paths, each with its logo and how long its trades last, the one in use ticked and the ones still being written shut ("Being written"). Before Chapter 1 is done all three are shut and the card says "You choose it after Chapter 1.", as Settings does; the choice itself stays the lesson after the Final Exam (§11.4). A tap anywhere else or Android's back button closes it. Until LOOK-SYSTEM: the streak flame with its day count and the XP total inside the daily goal ring on the left, hearts on the right. **[DESIGN-REVIEW]** While hearts are on their way back, a thin ring round the heart fills over the five hours until all of them are back (§5.2); the wait is no longer written beside them, a tap shows it. The ring encloses the heart alone and the count keeps its own space beside it (David: "make it so the circle doesn't overlay the number next to it"). **Built:** a 34 pt ring, the five hours as a thin arc in the hearts' red over a faint track; a tap shows "All hearts back in 3h 00m" under it for a few seconds.

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

**[DESIGN-REVIEW] The tab, built.** David approved the hub on 2026-10-03 and added: "a tab to revisit all the skills … and maybe revisit mistakes the user did (make two separate tabs for that)". So Practice has three tabs along its top, as a segmented control:
- **Daily mix** — one key, "Start · about 3 min": eight questions from lessons already played, never twice in one round, chosen by the schedule above (due questions first, then open mistakes, then the ones not seen for longest). Under it the **weak spots**: up to three topics (a lesson's `tags`) the learner misses most, each with a strength bar (right answers of the last ones, no number claimed beyond that), and one line: "A finished round gives back a heart." An empty state before the first lesson says where practice starts.
- **Skills** — every skill collected (§5.3), grouped by chapter in path order, each a small card with its name and the lesson it came from; the newest are marked until seen. A tap opens the skill's **info card**: the name, "Level 4 · The Quote Card", the glossary's sentence once `content/glossary.yaml` exists, and the card that taught it, drawn as the lesson drew it. A locked chapter shows how many skills it holds, nothing more.
- **Mistakes** — every question the learner missed and has not answered right since, by chapter and level: the question's first words and what they answered. **Practice these** plays them as a round (up to eight at a time). A question leaves the list when it is answered right in practice, in a mistakes review or in a replay of its lesson — not in the same lesson's mistakes round, which comes too soon after the reveal to prove anything.
- Practice never costs a heart; a finished round (daily mix, mistakes, a mistakes review) gives back one heart (§5.2).
- **Built** (`src/home/PracticeScreen.tsx`, `src/practice.ts`): the three tabs as a segmented control, the Mistakes one with its count ("Mistakes · 2"). Daily mix: a card with the key and the heart line, then the weak spots as a topic name over a bar (no number on screen; a screen reader hears "about 6 times in 10"). Skills: each chapter's collected skills as chips with a red dot while new; a chapter with none yet is a dashed row with its count ("Chapter 4 · Reading Fast Markets · 41 skills"); a chip opens the same sheet as a marked term, its key reading "Close". Leaving the tab marks the new ones as seen. Mistakes: a card with the count and **Practice these**, then each question with its level and "You said: …". Every section has an empty state that says where it fills from.

**[DESIGN-REVIEW] What the app records** (on the device, with the progress; synced once accounts exist, `BACKEND`). This is what the daily mix, the mistakes, the stats and any later analytics stand on. Nothing here is money or a profit:
- **Every graded question:** its id (the lesson's id and the screen's place in it), how often right and wrong, the last result and when, and its spaced-repetition box and due day (1 → 3 → 7 → 16 → 35 days). A question the learner has not reached is never drawn.
- **Mistakes:** the questions missed and not answered right since, with what was answered (for the deck and the Mistakes tab).
- **Chart decisions:** for each one answered, the choice, the grade (right, reasonable, wrong) and the result (won, lost, flat, or what standing aside would have given) — for the decision grid's counts and the variance view.
- **Skills:** each skill collected and when, and which ones the learner has opened.
- **Lessons:** finished, perfect, first-finished date, and how many times played; the longest streak.
- **The plan:** each key's value and when it was last written (the dated history comes in `ONBOARDING`).
- **Later, from the stages that need them:** time spent per lesson and per screen (only with the analytics consent, `ANALYTICS`), the daily-goal history (`LOOP-DAILY`), weak concepts per glossary term (`GLOSSARY`, `PRACTICE`), the arena's practice-account journal (`SIM-ACCOUNT`).

### 7.4 Stats / profile
Total XP, chapters completed, accuracy per tag, scenario record (Long/Short/No-trade decisions and "good decision" rate — never "profit").
**[v3]** Adds the **Trader Card**: the user's best setup, their decision accuracy by day type, their current tier, their saved plan, and the number of scenarios traded. It is the thing a learner screenshots. **[DESIGN-REVIEW]** Not taken in this form: the **tier card** (§5.5) is what Account shows, and the numbers go to All stats (below).
**[v4]** Adds the **variance view**: of the learner's correct decisions, how many won and how many lost, with one line on why that split is what a good process looks like. The one-line risk note sits at the bottom (`docs/agent.md` §7).

**[DESIGN-REVIEW] The Account page,** top to bottom (David, 2026-10-03):
- **The tier card** in its material (§5.5): the tier's name, "Tier 1 of 4", the pips and what it means. Before the first tier it is a blank card that says when the first one comes ("Observer · after Chapter 2"). It takes the place of the Trader Card with stats on it, which David did not take ("the tier card design you suggested could be shown here").
- **The medal shelf:** eight slots, one per chapter. A finished chapter is its gold medal with its emblem (§5.4); one not finished yet is an embossed outline with its number, so the shelf shows how far the path goes. The medal just won shines once the first time the page opens after it.
- **All stats** (David: "the all stats can be added"), a row that opens a page of its own: lessons finished and perfect, XP, the current and the longest streak, skills collected, mistakes open, chart decisions (right, reasonable, not this time), and the **variance view**: the learner's right calls as one bar, won against lost ("31 won · 17 lost"), with one line under it: "Right calls lose too. Judge the decision, not the result." No rate is called good or normal (`docs/agent.md` §3.11). The one-line risk note closes the page.
- **Your plan:** a row that opens the plan as a document (§6.8 `plan-sheet`): "My trading plan", the date it was last changed and since when it has been kept, then its lines with dotted leaders, grouped as the plan's keys are (setup, costs, reading, session, playbook). One page, nothing else on it. Before Chapter 1 Level 16 it says where the plan starts. Sharing it as an image comes with `ONBOARDING`.
- **Settings.**
- **Built** (`src/home/AccountScreen.tsx`, `StatsScreen.tsx`, `PlanScreen.tsx`): the tier card full width; the shelf as eight coins with their numbers under them (the gold coin of a finished chapter, a dashed outline with the emblem faint for one ahead); "All stats" and "Your plan" as rows that open pages of their own, and Settings. All stats shows the counts as tiles and the variance view as one green-and-red bar with "9 won · 5 lost" and the line. Your plan shows "Kept since 24 Sept 2026 · changed 3 Oct 2026" and the lines grouped by their keys (Setup, Costs, Reading, Session, Playbook, Simulator, Going live). **Not built yet:** the medal just won shining once on the shelf — it needs the app to remember which medals the shelf has shown (stage `STATS`).
- **[DESIGN-REVIEW] Not here: the learning chart.** David liked "your learning as a price chart" (weekly XP candles) but not in Account: "Instead change the Leaderboard tab to an analytics." That tab, and what moves into it, is decided with the tabs concept (§11.2).

### 7.5 Tiers **[v3]**
Four tiers per path, unlocked by chapter, shown on the tier card (**[DESIGN-REVIEW]**, §5.5) and the path overview. They give a 6-month path visible mid-term goals that badges alone do not.

| Tier | Unlocked after | Means |
|---|---|---|
| Observer | Chapter 2 | Can read a chart |
| Student | Chapter 4 | Can read the market in motion |
| Planner | Chapter 6 | Has a risk process and a journal |
| Sim Trader | Chapter 8 | Has a playbook and a 30-day simulator plan |

**[DESIGN-REVIEW]** Each tier has a material for its card (§5.5): Observer paper, Student bronze, Planner silver, Sim Trader graphite and gold.

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

**[DESIGN-REVIEW] The marker.** A marked term gets a soft highlighter stroke behind it as well as the dotted underline, so it reads as "this word matters" even to someone who never taps it. David, 2026-10-03: "Don't over or underuse them." So the app marks:
- only terms taught in an earlier lesson (the lesson that defines a term is busy defining it; marking it there would be noise), and only once the learner has played that lesson; never the course's first words (Chapter 1 Levels 1 and 2: price, chart, buy, sell, market …), which nearly every screen uses;
- only a term's first appearance in a lesson, not on every screen;
- at most two terms on one screen, the first two in reading order;
- in a theory card's body, an example, a scene and a question's prompt — never in answer options, chips or keys, where a tap must mean the answer.
A tap opens the sheet: the term, its sentence from `content/glossary.yaml` (once it exists), "Taught in Level 4 · The Quote Card", and **See the card**, which shows the card that taught it in the sheet itself (the same info card as Practice → Skills, §7.3). Closing the sheet returns to the screen exactly as it was.

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
- **[DESIGN-REVIEW] A face for titles.** David approved one display typeface for titles only: "I guess, but here the title looks too stretched out." So **Archivo** in its normal width, bold, for the banner's level title, the chapter cards' names, the lesson-complete headline, the badge's and tier's names and the page titles — never for body text, answers, keys or numbers, which keep the text face and the number face. It is loaded with the app (`@expo-google-fonts/archivo`); until it has loaded, titles show in the text face, so nothing waits for it. **Built** (`src/fonts.ts`, `useDisplayFace`): Archivo Bold on the page titles, the Account and Practice titles, the banner's level title and the chapter cards' names on the map, lesson complete's headline, the medal's chapter name and the tier card's name; with no letter-spacing (a tighter setting read cramped).
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

1. **Onboarding [v4]:** five short steps — what the app is · the one-line risk note · the daily goal (1, 2 or 3) · reminders yes/no · the market profile ("Where will you trade later?") — then straight into Chapter 1, Level 1. No path question. (v3 had three screens: what the app is, the risk note, the notification opt-in.) **[v4.1]** The language comes from the phone. Where the law requires consent for analytics or ads, it is asked before the first lesson. Sign-in is not part of onboarding: it is offered after the first lessons, in Account and before a purchase, and never forced. **[DESIGN-REVIEW] The first decision comes first.** The very first screen of a fresh install is a chart and two keys, Buy and Wait, with one line ("XYZ has been climbing. Buy, or wait?"). The learner chooses, the price plays out as on any chart decision, and the app says "That was your first decision." with one sentence on what the app is; then the welcome steps follow (today: straight to the map, until `ONBOARDING` builds the steps). It is shown once, it is not graded, it earns nothing, and it costs nothing (`docs/agent.md` §1: a trade within the first five minutes — here within ten seconds). **Built** (`src/onboarding/firstTrade.ts`): a line chart of eleven points, the decision at the sixth; after the choice the price plays out and, in place of a verdict, a plain note: "That was your first decision." and "This app teaches you to make calls like that one, a lesson at a time, and to judge each by the decision, not by how one trade turned out." The key reads "Continue" and goes to the map. A test build opened on a deep link of any kind (a lesson, a home page, a look) skips it, and so does the render test. **[DESIGN-REVIEW] The daily goal as paces** (Easy, Steady, Serious: one, two or three lessons a day, each with its minutes and when Chapter 1 would be done) goes into the registration screens; David adds those later himself.
2. **Home [v4]** = a tab bar along the bottom: **Learn** (the path map, 7.1), **Practice** (7.3) and **Account** (stats and profile, 7.4); **Spot it** (7.7) joins when the replay bank exists. **[v4.1]** Spot it becomes the **Arena** tab (7.7): Learn, Practice, Arena, Account. Tabs are peers: switching is instant, never a slide. There is no Leaderboard in v1.0 (`docs/agent.md` §1) — v3 had one, and an opt-in friends league may follow the release. **[DESIGN-REVIEW] Open: the tab set.** The app still shows Learn, Practice, Leaderboard (an empty "Coming soon") and Account. David, 2026-10-03, on idea 31: "change the Leaderboard tab to an analytics"; on idea 38 (Learn, Practice, Arena, Account): "first don't put this into the app. Instead give me an artifact where you explain the concept with screenshots." So the tabs stay as they are until he has chosen from the concept (the artifact "Nutrade tabs concept"); the stage that builds his choice records it here.
3. **Lesson player** (section 2).
4. **Path choice** is a lesson of its own after the Chapter 1 Final Exam (Level 17-2), played from its own node on the map. The path can be changed in Settings (Your path), from the top bar's logo (**[LOOK-SYSTEM]**, §7.2) or by playing the node again. A path whose chapters are not written yet reads "Being written" and cannot be picked.
5. **Settings** opens from a button on Account: lesson design (swipe left and right through a live preview of each design; one press applies it, §10; **[LOOK-SYSTEM]** built as Design → **Change design**: a real lesson screen full screen, lesson 1-1's profit question with its top bar, answers and key, wearing the design shown; a swipe or the arrows move between Neo, Neo Mono and Classic Contrast without choosing, the answers can be tapped, "Use this design" chooses the one on screen, and leaving puts the chosen design back), market profile, theme, sounds/haptics, reduce motion, your path, reset progress (asks once more; the settings stay), legal, and a button that opens the all-screens test bench. While the app is being tested, Settings also refills the hearts and skips ahead to any level (everything before it counts as played); both go before release. **[v4]** Settings also holds the daily goal, reminders, the market profile and time zone, light/dark/system, the colour-blind palette and Legal. The testing tools exist only in test builds (every development run, which is what Expo Go opens, and exports with `EXPO_PUBLIC_TEST_TOOLS=1`) and never earn XP. **[LOOK-SYSTEM]** They sit in Settings itself, in a **Testing** section at the end: Refill hearts, Add 50 gems, Skip ahead, then Every screen type (the test bench), Animations and Design suggestions (§10), each of the last three a page of its own (David, 2026-09-30: all the developer options straight in Settings, not behind a Development page). **[LOOK-BRIEF]** Among them, **Animations** plays the animations of rare moments on a tap, as often as wanted and without earning or losing anything: a level opening on the map, lesson complete, a perfect run, a chapter's badge, a new tier, the flame of right answers in a row, a lost heart, out of hearts, and the mix's streak screens (**[LOOK-SYSTEM]** those two rows left with the prototype, and on 2026-09-30 David asked for them back: "Streak goes up" and "Streak lost" play the real streak screens, from the learner's own streak). **[LOOK-SYSTEM]** **Design suggestions** works the same way (David, 2026-10-01): a row per idea, and a tap plays its preview on a page of its own (§10). **[DESIGN-REVIEW]** **New designs** plays a short lesson made in code that uses the content fields the level files do not use yet, so they can be tried before the content sessions add them (`docs/ContentToDo.md`). **Built** (`src/home/newDesigns.ts`), nine screens: a scene as a market alert; a candle decision with the open, stop and target, the R ruler and two notes, which runs to its target; the same setup stopped out — the right call that loses, with its line under the result; the decision grid as a teaching card; scanner rows with their day as a sparkline and a catalyst tag; a ladder with its order size, which walks the book; the order ticket with shares and a limit price; and the match. The checkpoint briefing and the skills come from the level files, so a real lesson shows them (Chapter 1's checkpoint; any lesson that teaches a word). **Show the first trade** opens the first-run decision again. The Animations page gains the new rare moments: **Chapter complete** lands the chapter's medal, **New tier** turns the tier card over, **Skills into Practice** flies four skills into the tab on the map, and **Mistakes round** fans the deck of missed questions and, a moment later, gathers and shuffles it. **[v4.1]** Settings also holds the language, the account (sign in, sign out, export your data, delete your account), Nutrade Plus (manage, restore purchases) and the privacy choices for analytics and ads.
6. The one-line risk note appears on first launch, on every scenario result and on the stats screen; the full disclaimer lives in Settings → Legal.

---

## 12. How level files reference this document

Level files use the archetype `type` and component ids from sections 3, 4 and 6; the exact fields per type are defined in `docs/schema.md`. Anything not stated in the level file (labels, animation, colors, layout) is defined here and must not be repeated there.
