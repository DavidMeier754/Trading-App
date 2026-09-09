# UI.md — Trading Learning App

Generalized UI reference for every screen, interaction, animation and layout idea in the app.
Level files (`content/**/level-XX-Y.yaml`) do NOT describe UI. They reference the archetype IDs
defined here via `type:` plus the actual content (text, options, correct answer, explanation).
Everything about *how* a screen looks, moves and reacts lives in this file.

Status: v2 — decisions from the first review applied (timing, hearts, mascot, no timers, path choice after Chapter 1).

---

## 1. Design principles

1. **One idea per screen.** A screen teaches one thing or asks one thing, never both.
2. **10–15 seconds per screen.** Theory cards are read in ~10 s, questions answered in ~15 s. A sub-level is 12–18 screens and takes 3–4 minutes. If a card needs longer, split it.
3. **Thumb-first.** Primary action always at the bottom, full-width, reachable one-handed. Answers are big tap targets (min 48 pt).
4. **Instant feedback, never a dead end.** Every answer reveals right/wrong in place within 100 ms. No separate feedback screen. The user always sees the correct answer before moving on.
5. **Show, then ask.** A concept is shown (card, visual, animation) before it is asked. Every defined term is tappable (Glossary popover, section 8).
6. **No pressure.** No timers, countdowns or quick-fire rounds anywhere. Hearts exist only in Tests and Final Exams. Wrong answers in lessons cost nothing but a second look.
7. **Motion has a purpose.** Animations explain (a slice filling, a spread widening) or reward (badge unlock). Respect the OS "reduce motion" setting.
8. **Numbers are real.** Prices, spreads and costs use one format everywhere (section 9). Cost math always shows a share count.
9. **Confident tone, tiny caveats.** The card says the simple true thing in one sentence; nuance goes into the reveal note or glossary.

---

## 2. Global layout (lesson player)

```
┌──────────────────────────────────────┐
│ ✕   ▓▓▓▓▓▓▓▓░░░░░░░░░░░   ♥♥♥♥♥      │  top bar: close, sub-level progress, hearts (tests/exams only)
├──────────────────────────────────────┤
│                                      │
│           CONTENT AREA               │  visual above text; body text max ~3 lines; scroll only if needed
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
- Portrait only; charts may offer an expand button (section 6.4).
- Mascot slot: bottom-left of the reveal area, small; reacts to correct/wrong (section 6.8).

---

## 3. Screen archetypes

`type` values used in level files. Non-question screens:

| type | Name | What it is |
|---|---|---|
| `intro` | Intro card | Big headline (one sentence), optional subline, mascot. First screen of every sub-level. For tests/exams it shows the scored-question counter ("0/10"). |
| `theory` | Theory card | Title + body (max 3 lines) + optional visual component. The main teaching screen. |
| `example` | Example card | A concrete number or mini story + visual, often animated. Follows a theory card. |
| `carousel` | Concept carousel | 2–4 sibling cards shown one after another with a "1/3" indicator and a Next arrow (swipe also works). Each card = icon + label + 1–2 sentences. Counts as one screen per card. |
| `walkthrough` | UI walkthrough | A mock UI component with one field spotlighted per step (dimmed background, highlight box, arrow, label). Counts as one screen per step. |
| `visual` | Info visual | A chart/diagram component with a one-line caption. |
| `checklist-reveal` | Checklist reveal | Checkbox items appear one per tap, forming a checklist the user later applies. |
| `story` | Story frame | Short narrative ("9:31. You're watching XYZ…") with a character avatar. Used before decisions. |
| `summary` | Score summary | "X/N correct", progress ring, per-question list with green/red dots (tap → one-line reminder + link to source level). Pass mark 70 %: pass → "Continue"; below → "Almost — review these" + "Retry". |
| `badge` | Chapter complete | Badge unlock animation, chapter name, XP bonus, "Chapter N unlocked". |
| `path-choice` | Path choice | Three path cards (Scalping / Day Trading / Swing Trading) with holding period, screen time, one-line feel; "You can change this anytime in Settings". Shown once, after Chapter 1's badge. |

---

## 4. Question interaction types

Shared behaviour: prompt on top, answer area in the middle, `Check` CTA (disabled until an answer is chosen), then **inline reveal** (5.1). Chosen wrong answer turns red in place, the correct one turns green, the explanation slides in. `Check` becomes `Got it`.

| type | Interaction | Rules |
|---|---|---|
| `mc` | 2–4 tappable answer cards, single select. | Distractors must be plausible. Max 2 in a row. |
| `tf` | Two large side-by-side buttons; reveal instantly on tap. | For misconceptions and single facts. |
| `numeric-mc` | Like `mc` with number options; reveal shows the working. | |
| `numeric-input` | Custom keypad (digits, `.`, `−`); tolerance configurable; reveal shows the working. | Preferred once a calculation has been practiced once. |
| `fill-tiles` | Sentence with a blank; letter tiles below (with 2–4 distractor letters); tap tiles into the blank; instant green/red when complete. | Exactly one accepted word. |
| `fill-choice` | Sentence with a blank; 3–4 word chips. | Use when synonyms exist or the word is long. |
| `match` | Terms left, definitions right; tap term then definition (line connects) or drag; correct pairs lock green, wrong pairs flash red and reset. | Max 5 pairs; every target unique. |
| `sort` | 2–3 labeled buckets; chips are dragged (or tap chip, tap bucket). | |
| `order` | Drag cards into the right sequence. | 3–5 items. |
| `hotspot` | A mock component (quote card, quote panel, order ticket, chart); tap the right region. Correct region pulses green; wrong tap ripples red and the correct region highlights. | 1–2 targets. |
| `slider` | Set a value on a slider; reveal shows exact value with a tolerance band. | For proportional intuition. |
| `chart-tap` | Tap a candle/point/level on a chart. | |
| `chart-decision` | The scenario engine. The chart plays to a decision point and pauses. Three buttons: **Long**, **Short**, **No trade** (Chapter 1 uses a simplified **Buy / Wait** variant). After choosing, the chart continues candle by candle (~120 ms each, tap to skip) and shows the outcome strip and a one-line rationale. Scored on reasoning; "No trade" can be best; other answers can be "reasonable" and are marked amber. Session state (day in R, limit, trades taken, size) shows as chips above the chart (6.4). | At least one per level from Chapter 2 on. |
| `spot-mistake` | A short statement or ticket with one wrong part; tap the wrong segment. | For misconceptions. |

**Selection rules:** ≥3 different question types per sub-level; max 2 `mc` in a row; every Chapter ≥2 sub-level has at least one visual/interactive screen. `tf` never asks what the prompt gives away.

---

## 5. Feedback, reveal and reward

### 5.1 Inline reveal (every question)
- Correct: element turns green (200 ms), soft "ding", light haptic, explanation slides up, mascot nods.
- Wrong: element shakes (3 × 4 px, 250 ms) and turns red; the correct element turns green; explanation slides up; medium haptic; mascot "hm" pose. The explanation always states the correct idea.
- "Show working" toggle on numeric reveals: expands a 1–3 line calculation.

### 5.2 Hearts (Tests and Final Exams only)
- 5 hearts shown in the top bar only during tests/exams. A wrong answer removes one (heart shrinks and greys out, 300 ms).
- Each lost heart returns after 4 hours (timer shown on the heart icon on the path map). At 0 hearts the test cannot be started; lessons and repetition remain fully playable.
- Optional later: refill by completing a practice session.

### 5.3 Sub-level complete
- XP counts up from 0 (600 ms); the path-map XP bar fills on return.
- Accuracy ring animates. Perfect run → gold ring + confetti (1 s, respects reduce-motion).
- Streak flame shows the day count; when today's goal is just met, the flame ignites (scale + glow). No streak-loss warnings inside lessons.

### 5.4 Chapter complete (`badge`)
- Badge drops in with a spring, ring of light expands, chapter name types in, XP bonus counts up, "Chapter N unlocked" fades in, CTA last. After Chapter 1 the `path-choice` screen follows.

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
- **Annotations:** dashed levels, arrows, shaded zones, labels; animate in.
- **State chips:** the level file's optional `state` strings render as small chips in a row above the chart (day result in R, the session limit, trades taken, current share size). They appear with the scenario and stay visible through playback, so a situation the scenario only describes is also something the user can see. Absent when the decision rests on the chart alone.
- **Decision overlay:** at the pause point the three buttons rise from the bottom; after the choice the chart continues and a P/L strip shows the outcome in points and % (with the share count from the scenario), then the rationale.
- Expand → landscape fullscreen with pinch-zoom (later).

### 6.5 Bars, timelines, stacks
- Horizontal bar chart: bars grow from 0 (400 ms, staggered 80 ms).
- Session ribbon: horizontal ribbon with three colored segments (pre-market, regular, after-hours) and a "now" marker; times from the market profile.
- Cost stack: stacked bar (spread + slippage + fees) against a target-profit bar with the consumed percentage; segments grow one after another. Always labeled with the share count.

### 6.6 Order book ladder (Chapter 3+)
Two columns of price levels with size bars; best bid/ask rows highlighted; animates as orders arrive.

### 6.7 Order ticket mock
Side toggle (Buy/Sell), order-type chips (Market / Limit / Stop), quantity, price field, submit. Used by `walkthrough`, `hotspot`, `spot-mistake` and hands-on practice.

### 6.8 Mascot & characters
- **Mascot:** one recurring character (artwork to be provided). Poses needed: idle, nod (correct), hm (wrong), cheer (perfect / badge), point (spotlight on walkthroughs), sleep (streak reminder, outside lessons). Shown small in the reveal area and large on intro/complete screens. Never blocks content.
- **Characters:** Retail trader (the user's stand-in), Market maker (two-faced buy/sell figure), Institution (large, calm), Bull, Bear. Reused across chapters so concepts get a face.
- Illustration style: flat, friendly, one accent color + neutrals.

---

## 7. Progress & gamification UI

### 7.1 Path map (home)
- Vertical scrollable path of level nodes, gently winding. Chapters are sections with a header card (name, "7/12", badge slot).
- Node states: locked (grey, lock), available (accent, pulsing halo), in progress (ring partly filled = subs done), completed (filled, check), perfect (gold ring).
- Tapping a node opens a sheet: level title, sub-level dots with states, XP, "~3 min", "Start" / "Review cards" / "Practice".
- Fan-outs: the path splits into up to 3 side-by-side strands (1–2 nodes each) and merges into one node; all strands must be completed, any order.
- Test and Final Exam nodes use a distinct shape (shield / trophy) and show the heart requirement.

### 7.2 Persistent HUD
Streak flame with day count, daily XP goal ring, hearts. No league/rank at launch.

### 7.3 Practice hub
Lists weak concepts (from wrong answers) and offers an untimed 3-minute review mix drawn from earlier questions with fresh numbers. Spaced repetition schedules terms automatically. Never costs hearts.

### 7.4 Stats / profile
Total XP, chapters completed, accuracy per tag, scenario record (Long/Short/No-trade decisions and "good decision" rate — never "profit").

---

## 8. Glossary popover

Every defined term is rendered with a subtle dotted underline. Tap → bottom sheet: term, one-sentence definition, "Taught in Level X-Y" link. Terms enter the glossary from `terms_introduced` in level files.

---

## 9. Copy, numbers & localization

- Second person, present tense, short sentences, body max 3 lines.
- One caveat per screen at most; hedges live in reveal notes.
- Prices two decimals, thin-space thousands, currency symbol from the market profile (`$` in content is replaced). Percentages one decimal. Per-share values always say "per share"; totals always show the share count.
- Session times, index examples and regulation notes come from `content/market_profiles.yaml` via `{{market.*}}` tokens.

---

## 10. Theming & accessibility

- **Dark mode default**; full light theme. Tokens: background, surface, text, accent, up-green, down-red, warning, success.
- Color-blind safe: up/down always with arrow/sign; alternative palette (blue/orange) toggle applies to charts too.
- Dynamic type to 130 % without truncation (cards scroll instead).
- Haptics and sounds each have a toggle. Reduce-motion removes confetti, flicker and auto-playback (candles then appear on tap).
- Min tap target 48 × 48 pt; drag interactions all have tap-tap alternatives.

---

## 11. Navigation & app flow

1. **Onboarding:** 3 screens (what the app is, one-line risk note, notification opt-in) → straight into Chapter 1, Level 1. No path question.
2. **Home** = path map.
3. **Lesson player** (section 2).
4. **Path choice** appears once, after the Chapter 1 badge (`path-choice`), and is editable in Settings.
5. **Practice**, **Stats**, **Settings** (market profile, theme, sounds/haptics, reduce motion, legal).
6. The one-line risk note appears on first launch, on every scenario result and on the stats screen; the full disclaimer lives in Settings → Legal.

---

## 12. How level files reference this document

Level files use the archetype `type` and component ids from sections 3, 4 and 6; the exact fields per type are defined in `docs/schema.md`. Anything not stated in the level file (labels, animation, colors, layout) is defined here and must not be repeated there.
