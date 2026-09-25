# UI.md — Trading Learning App

Generalized UI reference for every screen, interaction, animation and layout idea in the app.
Level files (`content/**/level-XX-Y.yaml`) do NOT describe UI. They reference the archetype IDs
defined here via `type:` plus the actual content (text, options, correct answer, explanation).
Everything about *how* a screen looks, moves and reacts lives in this file.

Status: **v3** — expanded for the eight-chapter curriculum. New interaction types, components and
long-path gamification are marked **[v3]**. Everything unmarked is unchanged from v2.

---

## 1. Design principles

1. **One idea per screen.** A screen teaches one thing or asks one thing, never both.
2. **10–15 seconds per screen.** Theory cards are read in ~10 s, questions answered in ~15 s. A sub-level is 12–18 screens and takes 3–4 minutes. If a card needs longer, split it.
3. **Thumb-first.** Primary action always at the bottom, full-width, reachable one-handed. Answers are big tap targets (min 48 pt).
4. **Instant feedback, never a dead end.** Every answer reveals right/wrong in place within 100 ms. No separate feedback screen. The user always sees the correct answer before moving on.
5. **Show, then ask.** A concept is shown (card, visual, animation) before it is asked. Every defined term is tappable (Glossary popover, section 8).
6. **No pressure.** No timers, countdowns or quick-fire rounds anywhere — **including the new rapid types in §4**. Hearts are spent in lessons, Tests and Final Exams; practice never costs one.
7. **Motion has a purpose.** Animations explain (a slice filling, a spread widening) or reward (badge unlock). Respect the OS "reduce motion" setting.
8. **Numbers are real.** Prices, spreads and costs use one format everywhere (section 9). Cost math always shows a share count.
9. **Confident tone, tiny caveats.** The card says the simple true thing in one sentence; nuance goes into the reveal note or glossary.
10. **[v3] Variety is a feature, not a decoration.** The path is ~385 sub-levels. A learner meets the same archetype hundreds of times, so every archetype must be worth meeting again, and no chapter may lean on three of them.

---

## 2. Global layout (lesson player)

```
┌──────────────────────────────────────┐
│ ✕   ▓▓▓▓▓▓▓▓░░░░░░░░░░░   ♥ 5        │  top bar: close, sub-level progress, hearts
├──────────────────────────────────────┤
│                                      │
│           CONTENT AREA               │  visual above text; body text max ~3 lines; never scrolls
│      (card / visual / question)      │
│                                      │
├──────────────────────────────────────┤
│  [ inline reveal / explanation ]     │  slides up in place after answering (200 ms)
│  ┌──────────────────────────────┐    │
│  │        CONTINUE / CHECK      │    │  single primary CTA, full width, bottom safe-area
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

- **Progress bar** = screens completed in this sub-level; fills with a 300 ms ease-out per advance.
- **Close ✕** → sheet "Quit lesson? Progress in this sub-level is lost."
- No back button inside a lesson; theory cards can be re-read from the level sheet ("Review cards") afterwards.
- **CTA states:** `Continue` (theory), `Check` (question, disabled until an answer is selected), `Got it` (after reveal), `Finish` (last screen).
- **One screen, one screenful.** A screen never scrolls. Section 1's "one idea per screen" is a layout rule as much as a content one: if a screen does not fit, it is two screens. This is what keeps the CTA in the same place under the thumb on every screen of a 385-sub-level path. The exception is dynamic type (section 10).
- **`Check` on every question but one.** Every question type is graded on `Check`, disabled until an answer exists, then `Got it`: a mis-tap stays a tap the learner can take back, and every screen resolves the same way. `chart-decision` is the exception — its Long / Short / No trade buttons rise into the CTA slot, and choosing one commits it. (Until v3.1, `mc`, `numeric-mc` and `match` committed on the tap; play-testing found the mis-taps cost more than the extra tap.)
- **Nothing moves unless the learner moved it.** A screen arrives centred in its area — a question screen in its area less the room its reveal will take — and from then on holds still. The reveal rises into space that was already free; content moves only when what is below it would otherwise run under the footer, and then by exactly that much, eased. A block that changes as the learner steps through it takes the height of its tallest version (a carousel's cards, a walkthrough's lines, a swipe-deck's verdicts); a line that comes and goes keeps its place (a hint, a wrong answer's correct value); a chip that is placed leaves its outline behind (`sort`, `order`).
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
| `story` | Story frame | Short narrative ("9:31. You're watching XYZ…"). The speaker is named in the copy, not drawn — there is no character cast (§6.9). Used before decisions. Marked "The scene", with an accent edge, so it does not read as a statement to judge. |
| `recap` **[v3]** | Level recap | End-of-level card: 2–4 one-line takeaways from the level's sub-levels, each tappable to re-open that card. Cheap, and it is what makes a 19-level chapter feel navigable. |
| `plan-card` **[v3]** | Your plan | A card the **user fills in and keeps**: their daily loss limit, their share size, their playbook card. Persists to the profile, re-appears (pre-filled, editable) in later chapters, and is exportable. Every card writes keys from the one plan namespace in `docs/schema.md` ("The plan"), which is what makes the re-appearing real: revisiting a key opens the field on the learner's current value and overwrites it, keeping the old one in a dated history. The single strongest engagement device in the app — the user is building their own document, not just answering. A number line steps with − / + or takes its suggestion in one tap (the suggestion shows, faint, while the line is empty); a text line is typed. The button waits until every line is filled, a number above zero. |
| `summary` | Score summary | "X/N correct", progress ring, per-question list with green/red dots (tap → one-line reminder + link to source level). Pass mark 70 %: pass → "Continue"; below → "Almost — review these", "Retry", and "Back to path" under it. |
| `badge` | Chapter complete | Badge unlock animation, chapter name, XP bonus, "Chapter N unlocked". |
| `tier-up` **[v3]** | Tier unlocked | Fires at the tier boundaries in §7.5. Bigger than a badge: the tier name, what it means, what unlocks. |
| `path-choice` | Path choice | The last screen of the path-choice lesson, Chapter 1 Level 17-2 (`docs/curriculum.md`), which first lays the three paths side by side. Three path cards (Scalping / Day Trading / Swing Trading) with holding period, screen time, one-line feel; "You can change this any time in Settings". A path whose chapters are not written yet reads "Being written" and cannot be picked. The lesson is its own node on the map after the Final Exam (§7.1); replaying it changes the path, and it costs no hearts. |

---

## 4. Question interaction types

Shared behaviour: prompt on top, answer area in the middle, then **inline reveal** (5.1). Chosen wrong answer turns red in place, the correct one turns green, the explanation slides in.

Between the answer and the reveal sits a `Check` step on every type but `chart-decision` (§2): disabled until an answer exists, then `Got it`. A single tap is still only a choice until it is checked — two thumb-sized buttons are the easiest thing in the app to hit by accident, and an unconfirmed mis-tap would be a wrong answer the learner never gave.

### 4.1 Core types (v2, unchanged)

| type | Interaction | Rules |
|---|---|---|
| `mc` | 2–4 tappable answer cards, single select. | Distractors must be plausible. Max 2 in a row. |
| `tf` | Two large side-by-side buttons; the choice is confirmed with `Check`. | For misconceptions and single facts. The confirm step is deliberate: the buttons are large and close to the thumb. |
| `numeric-mc` | Like `mc` with number options; reveal shows the working. | |
| `numeric-input` | Custom calculator keypad (digits, `.`, `÷ × − +`, `=`) with a backspace in the field. The field takes a number or a sum (× and ÷ before + and −); a sum's value shows under the field as it is typed, and that value is what is graded; `=` folds the sum into its value. A minus leads the currency (−$0.40); tolerance configurable; reveal shows the working. | Preferred once a calculation has been practiced once. The keypad does the arithmetic, so the question tests knowing which numbers to put together. |
| `fill-tiles` | Sentence with a blank; letter tiles below (with 2–4 distractor letters); tap tiles into the blank. | Exactly one accepted word. |
| `fill-choice` | Sentence with a blank; 3–4 word chips. | Use when synonyms exist or the word is long. |
| `match` | Terms left, definitions right, every card as tall as the tallest so the rows line up; tap either side first, then its partner (every tap sounds), or drag; correct pairs lock green; wrong pairs flash red and reset. `Check` once every pair is made. | Max 5 pairs; every target unique. Prompt must be specific to the content, never a generic "Match each word to its meaning." Scored on whether the learner got there without a wrong tap. |
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

---

## 5. Feedback, reveal and reward

### 5.1 Inline reveal (every question)
- Correct: element turns green (200 ms), soft "ding", light haptic, explanation slides up.
- Wrong: element shakes (3 × 4 px, 250 ms) and turns red; the correct element turns green; explanation slides up; medium haptic. The explanation always states the correct idea.
- Amber (reasonable answer on a `chart-decision`): element turns amber, no shake, no heart lost, and the reveal opens with what was right about the choice before what was better.
- "Show working" toggle on numeric reveals: expands a 1–3 line calculation.
- A run of right answers climbs three sounds, each a step higher: the first right answer, the second, and from the third on the streak sound (a three-note chord roll, the same for the rest of the run). A wrong answer starts the climb again.
- A chart that moves (builds in, draws on, plays out) gives one light haptic as it starts and one firm haptic as it comes to rest, and nothing in between.

### 5.2 Hearts
- 5 hearts, always shown at the right end of the top bar (section 2) and on the home HUD (7.2). A wrong answer in a lesson, a Test or a Final Exam removes one (the heart breaks, shrinks and greys out, 300 ms). Amber answers never cost a heart, and neither does practice (7.3, 7.7).
- Each lost heart returns after 4 hours; the time until the next one is shown beside the hearts on the path map.
- Losing the last heart stops the sub-level on an "Out of hearts" screen that leads back to the path; the sub-level does not count as finished. A lesson or test cannot be started again until a heart is back.
- Optional later: refill by completing a practice session.

### 5.3 Sub-level complete
- XP counts up from 0 (600 ms); the path-map XP bar fills on return.
- The XP total on the home HUD is the sum of what the summaries showed: the lesson's XP plus the perfect bonus, replayed sub-levels included.
- Accuracy ring animates. Perfect run → gold ring + confetti (1 s, respects reduce-motion).
- Streak flame shows the day count; when today's goal is just met, the flame ignites (scale + glow). No streak-loss warnings inside lessons.
- **[v3] Daily goal is two sub-levels (~10 min).** The ring on the home screen fills in halves, so finishing one lesson visibly leaves the day half-done.

### 5.4 Chapter complete (`badge`)
- Badge drops in with a spring, ring of light expands, chapter name types in, XP bonus counts up, "Chapter N unlocked" fades in, CTA last. After Chapter 1 the path-choice lesson opens on the map as its own node (§7.1).

### 5.5 Tier complete (`tier-up`) **[v3]**
Rarer and louder than a badge: full-screen, the tier name and what it means, the Trader Card updating in place, and one line on what the next tier covers. Four per path (§7.5).

---

## 6. Visual & data components

All components are theme-aware (section 10). **Up = green, down = red**, always paired with an arrow or sign.

### 6.1 Ownership pie
Circle of N equal slices; owned slices fill one by one (80 ms each). Caption "5 of 50 = 10 %".

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

### 6.5 Bars, timelines, stacks
- Horizontal bar chart: bars grow from 0 (400 ms, staggered 80 ms).
- Session ribbon: horizontal ribbon with three colored segments (pre-market, regular, after-hours) and a "now" marker; times from the market profile.
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

---

## 7. Progress & gamification UI

### 7.1 Path map (home)
- Vertical scrollable path of level nodes, gently winding. Chapters are sections with a header card: chapter number and name, a progress bar and "7/17 levels" (or "Chapter complete"). Tapping the card folds the chapter away or opens it. Before a path is chosen, the next chapter is a closed card, "Your path starts here".
- Node states: locked (grey face, its symbol greyed, a lock badge where the check will go), available (accent, pulsing halo), in progress (ring partly filled = subs done), completed (filled, keeps its symbol, with a check badge), perfect (gold ring and a gold check badge).
- **Every button shows a symbol rather than a number.** A lesson level shows what it teaches, or for a practice level what it practises, from its files' `icon` (docs/schema.md): a candle for The Candle, a bell for The Opening Minutes, a zigzag for Volatility. Without an `icon` it falls back to a bulb for new ideas (a level with any `new-theory` lesson in it) or round arrows for practice (`repetition` only). A Checkpoint shows a ticked clipboard on a shield, the Final Exam a trophy, the path choice a signpost. The number and the kind in words sit in the label beside it ("Level 4 · New ideas"), on one line where it fits and as two whole lines where it does not.
- A banner at the top names the chapter, the level the learner is on and its title, with the sub-level they are up to ("2/4 lesson"). The map opens scrolled to that level.
- Each level is one round button inside a ring that fills one sub-level at a time. The level number and kind, title and sub-level count sit beside it. The available node carries a START / CONTINUE tag.
- Coming back from a sub-level, the ring fills by the part just finished. The first draw of the map moves nothing.
- **Moving on to the next level** is one sequence, about 2.5 s, after the last sub-level of a level: the finished level's ring completes and its check badge pops on; the map scrolls down to the next level; the dotted path between them lights up top to bottom; the lock badge shakes and bursts off with rings and the unlock sound, and the level's symbol pops in white; the banner names the new level; the START tag drops in and the halo begins. Under reduced motion the steps swap in place without movement.
- Tapping a node opens a card under it, pointing at it (not a bottom sheet): level title, the sub-levels as segments with their states, the next lesson with its XP and "about 3 min", and "Start" / "Continue" / "Review" (later also "Review cards" / "Practice"). A locked level's card says which level opens it.
- Fan-outs: the path splits into up to 3 side-by-side strands and merges into one node; all strands must be completed, any order.
- Checkpoints are shields and read "10 questions · 70 % to pass" beside them; the Final Exam wears the trophy.
- **[v3] The map must survive 8 chapters.** Collapsed chapter sections by default, with the current one expanded; a sticky chapter header while scrolling; a "jump to current" button; and a zoomed-out overview showing all eight chapters as tiers. Built so far: the folding sections and the "Jump to" button, which shows while the current level is off screen. Not yet: the sticky header and the overview.

### 7.2 Persistent HUD
Streak flame with day count and the XP total inside the daily goal ring (two sub-levels = full) on the left; hearts on the right. No league or rank inside lessons: ranking lives on its own Leaderboard tab (§11).

### 7.3 Practice hub **[v3 — expanded]**
Lists weak concepts (from wrong answers) and offers an untimed 3-minute review mix. Never costs hearts.
- Draws from **the drill bank** (`content/drills/`, see `docs/schema.md`) as well as from questions already seen, so practice does not become re-reading.
- Spaced repetition schedules terms and setups automatically; a concept the learner keeps missing surfaces sooner.
- **Setup drills:** pick one playbook setup and get a `swipe-deck` of fresh charts for it.
- **Daily mix:** one tap, ~3 minutes, mixed across everything unlocked.
- **[v3] Spot it** (7.7) is the second practice surface and feeds the same weak-concept list: a `Phantom` at a decoy that fails on volume marks *volume* weak, exactly as a wrong answer would.

### 7.4 Stats / profile
Total XP, chapters completed, accuracy per tag, scenario record (Long/Short/No-trade decisions and "good decision" rate — never "profit").
**[v3]** Adds the **Trader Card**: the user's best setup, their decision accuracy by day type, their current tier, their saved plan, and the number of scenarios traded. It is the thing a learner screenshots.

### 7.5 Tiers **[v3]**
Four tiers per path, unlocked by chapter, shown on the Trader Card and the path overview. They give a 6-month path visible mid-term goals that badges alone do not.

| Tier | Unlocked after | Means |
|---|---|---|
| Observer | Chapter 2 | Can read a chart |
| Student | Chapter 4 | Can read the market in motion |
| Planner | Chapter 6 | Has a risk process and a journal |
| Sim Trader | Chapter 8 | Has a playbook and a 30-day simulator plan |

### 7.6 Weekly challenge **[v3]**
One untimed, optional mixed set per week (8–12 questions drawn from everything unlocked), worth bonus XP and a streak freeze. Not ranked on its own; the Leaderboard tab (§11) is where learners compare. Exists to give lapsed users a low-friction way back in.

### 7.7 Spot it — the replay tab **[v3]**

The second practice surface, beside the Practice hub (7.3), and the home of `chart-replay` (4.4). One tap opens a replay the learner has not seen, drawn from the bank in `content/replays/` and filtered by what they have unlocked.

- **What it is for.** The linear path teaches recognition one frozen chart at a time. This is where the learner finds out whether they can spot a setup with the outcome still hidden — and whether they can sit through a session that offers them nothing.
- **Picked, not random.** The next replay is chosen by the weak-concept list, the same one the Practice hub reads: two `Phantom`s on volume and the tab starts serving replays whose decoys fail on volume.
- **Tier-gated by reading level.** Level 1 replays open at **Observer**, level 2 at **Student**, level 3 at **Planner** (7.5). A level-3 replay in front of a learner who has not finished Chapter 6 is a coin flip, not a lesson.
- **Session view.** A run of replays ends on a strip: how many Textbook, how many Missed, how many Phantom, and the **discipline line** — moments correctly passed as a share of decoys met. That number, not a win rate, is what the tab is scored on.
- **Never costs hearts, never timed.** Same as every practice surface.
- **What it does not do.** It does not replace the simulator plan Chapter 8 ends on. A replay you can pause teaches recognition; it does not teach a live market, and the copy must not imply otherwise.

---

## 8. Glossary popover

Every defined term is rendered with a subtle dotted underline. Tap → bottom sheet: term, one-sentence definition, "Taught in Level X-Y" link. Terms enter the glossary from `terms_introduced` in level files.
**[v3]** The glossary is browsable from the profile as well, grouped by chapter, with a "terms you have missed recently" section fed by the practice engine.

---

## 9. Copy, numbers & localization

- Second person, present tense, short sentences, body max 3 lines.
- One caveat per screen at most; hedges live in reveal notes.
- Prices two decimals, thin-space thousands, currency symbol from the market profile (`$` in content is replaced). Percentages one decimal. Per-share values always say "per share"; totals always show the share count.
- Session times, index examples and regulation notes come from `content/market_profiles.yaml` via `{{market.*}}` tokens. **[v3]** Clock times are never written literally, even inside a story.

---

## 10. Theming & accessibility

- **Dark mode default**; full light theme. Tokens: background, surface, text, accent, up-green, down-red, warning, success.
- **Lesson designs.** A lesson wears one of nine designs, picked in Settings (§11): **Neo** (the default), **Neo Mono**, **Neo Violet**, **Classic**, **Classic Soft**, **Classic Contrast**, **Terminal**, **Blueprint** and **Arcade**. A design changes the ground, the surfaces, the progress bar, the key, the ink of a chart line and the right-answer flourish. It never changes text colours that carry meaning or the up/down colours of chart data. The home screen's panels stay Classic; the ground under them is the picked design's, so a new design shows there the moment it is chosen.
- Color-blind safe: up/down always with arrow/sign; alternative palette (blue/orange) toggle applies to charts too.
- Dynamic type to 130 % without truncation. Screens do not scroll (section 2), so a screen must be authored to fit at 130 %: shorter body, or split in two. Scrolling is the fallback only past 130 %, where nothing else will do.
- Haptics and sounds each have a toggle. Reduce-motion removes confetti, flicker and auto-playback (candles then appear on tap).
- Min tap target 48 × 48 pt; drag interactions all have tap-tap alternatives. **[v3]** This includes `swipe-deck` (buttons underneath), `chart-annotate` (tap-to-place then nudge) and `order-build` (tap chip, tap slot).

---

## 11. Navigation & app flow

1. **Onboarding:** 3 screens (what the app is, one-line risk note, notification opt-in) → straight into Chapter 1, Level 1. No path question.
2. **Home** = a tab bar along the bottom: **Learn** (the path map, 7.1), **Practice** (7.3), **Leaderboard** and **Account** (stats and profile, 7.4). Tabs are peers: switching is instant, never a slide.
3. **Lesson player** (section 2).
4. **Path choice** is a lesson of its own after the Chapter 1 Final Exam (Level 17-2), played from its own node on the map. The path can be changed in Settings (Your path) or by playing the node again. A path whose chapters are not written yet reads "Being written" and cannot be picked.
5. **Settings** opens from a button on Account: lesson design (swipe left and right through a live preview of each design; one press applies it, §10), market profile, theme, sounds/haptics, reduce motion, your path, reset progress (asks once more; the settings stay), legal, and a button that opens the all-screens test bench. While the app is being tested, Settings also refills the hearts and skips ahead to any level (everything before it counts as played); both go before release.
6. The one-line risk note appears on first launch, on every scenario result and on the stats screen; the full disclaimer lives in Settings → Legal.

---

## 12. How level files reference this document

Level files use the archetype `type` and component ids from sections 3, 4 and 6; the exact fields per type are defined in `docs/schema.md`. Anything not stated in the level file (labels, animation, colors, layout) is defined here and must not be repeated there.
