# UI.md — Trading Learning App

Generalized UI reference for every screen, interaction, animation and layout idea in the app.
Level files (`LevelX-Y.txt`) must NOT describe UI anymore. They only reference the archetype IDs
defined here (e.g. `[theory]`, `[mc]`, `[hotspot]`) plus the actual content (text, options, correct
answer, explanation). Everything about *how* a screen looks, moves and reacts lives in this file.

Status: DRAFT v1 — to be refined together with the content audit.

---

## 1. Design principles

1. **One idea per screen.** A screen teaches one thing or asks one thing. Never both.
2. **Thumb-first.** Primary action always at the bottom, full-width, reachable one-handed. Answers are big tap targets (min 48 pt height).
3. **Instant feedback, never a dead end.** Every answer reveals right/wrong in place within 100 ms. There is no separate feedback screen. The user always sees the correct answer before moving on.
4. **Show, then ask.** A concept is always shown (card, visual, animation) before it is asked. A term never appears in a question before it appeared on a theory card. Every new term is tappable (see Glossary popover, section 8).
5. **Short sessions.** Target 5–8 minutes per sub-level, ~30 seconds per screen. Progress must be visible at all times.
6. **Motion has a purpose.** Animations explain (a slice filling, a spread widening) or reward (badge unlock). No decoration-only motion. Respect the OS "reduce motion" setting.
7. **Numbers are real.** Prices, spreads and costs are shown in the same format everywhere (see section 9). Wherever cost math is shown, a share count is shown too, so amounts feel real.
8. **Confident tone, tiny caveats.** Copy says the simple true thing in one sentence; nuance goes into the reveal note or a glossary popover, not into the headline.

---

## 2. Global layout (lesson player)

```
┌──────────────────────────────────────┐
│ ✕   ▓▓▓▓▓▓▓▓░░░░░░░░░░░  ♥♥♥  🔥12   │  top bar: close, sub-level progress, hearts (optional), streak
├──────────────────────────────────────┤
│                                      │
│           CONTENT AREA               │  scrollable if needed; visuals above text; text max ~3 lines
│      (card / visual / question)      │
│                                      │
├──────────────────────────────────────┤
│  [ inline reveal / explanation ]     │  appears in place after answering (slides up, 200 ms)
│  ┌──────────────────────────────┐    │
│  │        CONTINUE / CHECK      │    │  single primary CTA, full width, bottom safe-area
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

- **Progress bar** = screens completed in this sub-level. Fills with a 300 ms ease-out on every advance.
- **Close ✕** asks "Quit lesson? Progress in this sub-level is lost." (two-button sheet).
- **Back** is not available inside a lesson (like Duolingo); theory cards can be re-read via the "Review" tab afterwards.
- **Primary CTA states:** `Continue` (theory), `Check` (question, disabled until an answer is selected), `Got it` (after reveal), `Finish` (last screen).
- Portrait only for the lesson player. Charts may offer a landscape "expand" button (section 6.4).

---

## 3. Screen archetypes

Each archetype has an ID used by level files. Optional slots in brackets.

| ID | Name | What it is |
|---|---|---|
| `intro` | Intro / welcome card | Big headline, optional one-line subtext, optional icon. Used as the first screen of a sub-level. CTA: "Let's go" / "Start review" / "Start test". For tests/exams the card shows the scored-question counter ("0/8 answered"). |
| `theory` | Theory card | Title + body (max 3 lines) + illustration slot. The main teaching screen. |
| `example` | Example card | Body text with a concrete number/story + visual. Often animated (section 5). Follows a theory card. |
| `carousel` | Concept carousel | A set of 2–4 sibling cards shown one after another with a "1/3" indicator and a "Next" arrow. Each card = icon + label + 1–2 sentences. Used for "meet the three styles", "three market phases", "three participants". Swiping horizontally also works. |
| `walkthrough` | UI walkthrough / spotlight | A mock UI element (quote card, quote panel, order ticket, chart) with one field spotlighted (dimmed background, highlighted box, small arrow, label). Series of 2–4 screens, each spotlighting the next field. |
| `visual` | Info visual | Non-question screen whose main content is a chart/diagram component (section 6) with a one-line caption. |
| `checklist-reveal` | Checklist reveal | Checkbox items appear one per screen (or one per tap), forming a checklist the user later applies. |
| `question:*` | Question screens | See section 4. |
| `summary` | Score summary | "X/N correct" + progress ring + per-question list with green/red dots; each row tappable → one-line reminder + link to the source level. Gentle tone at every score. |
| `complete` | Sub-level complete | XP earned (counts up), streak status, accuracy, optional "perfect!" state. CTA: "Continue". |
| `badge` | Chapter complete | Badge unlock animation, chapter name, XP bonus, "Chapter N unlocked" line, CTA "Continue to Chapter N". |
| `story` | Story / scenario intro | A short narrative frame ("It's 9:31. You're watching XYZ…") with a character avatar. Used before chart-decision screens. |

---

## 4. Question interaction types

All questions share: prompt at top, answer area in the middle, `Check` CTA (disabled until an answer is chosen), then **inline reveal** (section 5.1). The chosen wrong answer turns red in place, the correct one turns green, an explanation line slides in below. `Check` becomes `Got it`.

| ID | Type | Interaction | Notes |
|---|---|---|---|
| `mc` | Multiple choice | 2–4 tappable answer cards, single select. | Distractors must be genuinely plausible; the reveal explains why the correct one is right in one line. 3 options is fine when only 3 plausible ones exist. |
| `tf` | True / False | Two large side-by-side buttons. Reveal instant on tap (no `Check` step). | For single-fact checks and misconceptions. |
| `numeric-mc` | Numeric multiple choice | Like `mc` but options are numbers; reveal shows the calculation. | |
| `numeric-input` | Numeric input | Custom keypad (digits, `.`, `-`), tolerance configurable (e.g. ±0.005). Reveal shows the worked calculation. | Prefer over `numeric-mc` once a calculation has been practiced once. |
| `fill-tiles` | Fill-in-the-blank (tiles) | Sentence with a blank; letter tiles below (with 2–4 distractor letters); tap or drag tiles into the blank. Instant green/red when the word is complete. | Exactly ONE accepted word per blank. If synonyms are possible, use `fill-choice` instead. |
| `fill-choice` | Fill-in-the-blank (word bank) | Sentence with a blank; 3–4 word chips to choose from. | Use when synonyms exist or the word is long. |
| `match` | Matching | Left column of terms, right column of definitions; tap a term then a definition (they connect with a line), or drag. Correct pairs lock green; wrong pairs flash red and reset. | Every target must be unique — no two identical definitions. Max 5 pairs. |
| `match-multi` | Multi-attribute matching | Each term must be matched to two attributes (e.g. holding period AND screen time). Rendered as a small grid: rows = terms, columns = attributes, chips dragged into cells. | Use sparingly (max once per chapter). |
| `sort` | Category sort | 2–3 labeled buckets at the bottom; chips at the top are dragged (or tapped then bucket tapped) into buckets. | |
| `order` | Sequence ordering | Drag cards into the correct order (e.g. market phases through the day, steps of placing an order). | |
| `hotspot` | Tap-to-identify | A mock UI element or chart; user taps the correct region. Correct region pulses green; a wrong tap shows a red ripple and the correct region highlights. Can require 1–2 taps. | Used for quote cards, quote panels, order tickets, chart features. |
| `slider` | Slider estimate | A slider with a range; user sets a value (e.g. "how much of the target does this spread eat?"). Reveal shows the exact value and a tolerance band. | Good for proportional intuition. |
| `chart-tap` | Chart tap | A chart component (section 6.4); user taps a candle/point/level ("tap the highest price", "tap where the spread was widest"). | |
| `chart-decision` | Long / Short / No Trade | The core scenario engine. A chart plays up to a decision point and pauses; three buttons: **Long**, **Short**, **No trade**. After choosing, the chart continues playing (candle by candle, ~120 ms per candle, skippable) and shows the outcome with a P/L strip and a one-line rationale. There is no single "correct" answer for every scenario — a "No trade" can be the best answer. Scored on reasoning, explained in the reveal. | Use from Chapter 2 onward at least once per level so the user "trades" early and often. |
| `quickfire` | Quick-fire round | 5–8 very short `tf`/`mc` questions with a 10-second ring timer each, one after another, no `Check` step. Combo counter for consecutive correct answers. | Use for Repetition sub-levels to make review feel like a game rather than a re-read. |
| `spot-mistake` | Spot the mistake | A short trader statement or order ticket with one error; user taps the wrong part. | Great for misconceptions (e.g. "market sell fills at the ask"). |

**Selection rules**
- A sub-level uses at least 3 different interaction types.
- No more than 2 `mc` in a row.
- Every Repetition sub-level contains at least one `quickfire`, `chart-decision` or `hotspot`.
- `tf` is for misconceptions or single facts, not for content the prompt already gives away.

---

## 5. Feedback, reveal and reward patterns

### 5.1 Inline reveal (every question)
- Correct: chosen element turns green (200 ms), soft "ding", light haptic, explanation line slides up.
- Wrong: chosen element shakes horizontally (3 × 4 px, 250 ms) and turns red; the correct element turns green; explanation line slides up; medium haptic. The explanation always states the correct idea, never just "wrong".
- "Show math" toggle on numeric reveals: expands a 1–3 line worked calculation.
- Reveal notes are max 1 sentence (2 for numeric).

### 5.2 Combo / streak inside a lesson
- 3 correct in a row → small "×3" chip pulses next to the progress bar. Resets on a wrong answer. Feeds the XP multiplier on the `complete` screen.

### 5.3 Hearts (optional, decide later)
- 5 hearts; a wrong answer in a Test/Final Exam costs one; theory sub-levels never cost hearts. Hearts refill over time or via practice. If hearts are not wanted, hide the slot in the top bar — everything else works without them.

### 5.4 Sub-level complete (`complete`)
- XP number counts up from 0 (600 ms), then the XP bar on the path map fills when returning.
- Accuracy ring animates. Perfect run → gold ring + confetti burst (1 s, respects reduce-motion).
- Streak flame: shows current streak; if today's goal was just met, the flame "ignites" (scale + glow).

### 5.5 Chapter complete (`badge`)
- Badge drops in with a spring, ring of light expands, chapter name types in, XP bonus counts up, "Chapter N unlocked" fades in, CTA appears last.

---

## 6. Visual & data components

All components are theme-aware (section 10) and use the same up/down colors: **up = green, down = red**, always paired with an arrow or sign so color is never the only signal.

### 6.1 Ownership pie
Circle of N equal slices; owned slices fill with the accent color one by one (80 ms each). Caption shows "5 of 50 = 10 %".

### 6.2 Quote card
```
 ┌──────────────────────┐
 │ XYZ   Example Corp   │   ticker + name
 │ 142.50               │   current price (large)
 │ ▲ +2.10 (+1.5 %)     │   change vs previous close, colored, with arrow
 │ Vol 3.2 M            │   optional
 └──────────────────────┘
```
Price digits "flicker" (100 ms) when updated in live-demo mode. Each field can be a `hotspot` target or a `walkthrough` spotlight.

### 6.3 Quote panel (Bid / Ask / Last / Spread)
```
   BID        SPREAD        ASK
  45.20 ──── 0.04 ────►   45.24
          LAST 45.22
```
- Bid on the left in green tint, Ask on the right in red tint, spread as a gap with a bracket and its value.
- **Spread animation:** the gap physically widens/narrows (300 ms) when the values change; used to teach "the spread moves".
- Optional depth bars below Bid/Ask (order book ladder, section 6.6).

### 6.4 Chart component
- **Line chart** for Chapter 1 (price over time, one line, draw-on animation left→right, 800 ms).
- **Candlestick chart** from Chapter 2 on. Green/red bodies, wicks, optional volume bars below, time axis, price axis on the right.
- **Playback:** candles appear one by one (default 120 ms; play/pause; tap to skip to the end). Used by `chart-decision`.
- **Annotations:** horizontal levels (dashed), arrows, shaded zones, labels; can animate in.
- **Expand** button → landscape fullscreen with pinch-zoom (optional, later).
- All chart data in scenarios is either real historical data (anonymized ticker allowed) or clearly synthetic. Never imply a prediction.

### 6.5 Bars & timelines
- Horizontal bar chart (e.g. screen time per style): bars grow from 0 (400 ms, staggered 80 ms).
- Day timeline / clock ribbon for market phases: a horizontal ribbon with three colored segments (pre-market, regular, after-hours) and a moving "now" marker; times localized to the user's market (section 9).
- Cost stack: stacked horizontal bar showing spread + slippage + fees against a target-profit bar, with the consumed percentage labeled. Segments grow in one after another.

### 6.6 Order book ladder (later chapters)
Two columns of price levels with size bars; the best bid/ask rows highlighted; animates as orders arrive. Introduced only when Level 2 / depth is taught.

### 6.7 Order ticket mock
Simplified buy/sell ticket: side toggle (Buy/Sell), order type chips (Market/Limit/Stop), quantity, price field, submit button. Used for `walkthrough`, `hotspot`, `spot-mistake` and later for hands-on practice ("place a limit buy at 59.90").

### 6.8 Illustrations & characters
- Flat, friendly icon style, single accent color + neutrals; no stock-photo realism.
- Recurring characters: the **Retail trader** (the user's stand-in), the **Market maker** (two-faced buy/sell figure), the **Institution** (large, calm), the **Bull** and the **Bear**. Reused across chapters so concepts get a face.
- Optional mascot that reacts to answers (small, corner of the reveal area). Decide once branding exists.

---

## 7. Progress & gamification UI (outside the lesson player)

### 7.1 Path map (home)
- Vertical, scrollable path of level nodes, winding slightly left/right (Duolingo-like). Chapters are sections with a header card (name, progress "7/12", badge slot).
- **Node states:** locked (grey, lock icon), available (accent, pulsing halo), in progress (ring partially filled = subs done), completed (filled, check), perfect (gold ring).
- Tapping a node opens a bottom sheet: level title, sub-level dots (1-1, 1-2, 1-3 with states), XP, estimated minutes, "Start" / "Practice".
- **Fan-outs** (rare, see agent.md 4b): the path splits into up to 3 parallel strands drawn side by side, each 1–2 nodes long, then merges into one node. All strands must be completed before the merge node unlocks; any order.
- Test and Final Exam nodes use a distinct shape (shield / trophy).

### 7.2 Persistent HUD
- Streak flame with day count, daily XP goal ring, hearts (optional), league/rank chip (optional, later).

### 7.3 Review / practice hub
- "Practice" tab lists weak concepts (from wrong answers) and offers a 3-minute `quickfire` mix. Spaced-repetition scheduling brings old terms back automatically; this is where interleaved repetition lives, in addition to Repetition sub-levels.

### 7.4 Stats / profile
- Total XP, chapters completed, accuracy per subcategory (radar or bars), scenario record (Long/Short/No-trade decisions, "good decision" rate — never "profit").

---

## 8. Glossary popover

Every defined term (Bid, Ask, Spread, Liquidity, Position, Long, Short, …) is rendered with a subtle dotted underline. Tapping opens a bottom-sheet popover: term, one-sentence definition, "Taught in Level X-Y" link. Terms are added to the glossary the first time they appear on a theory card. This is how the app avoids "jargon before definition" for a beginner.

---

## 9. Copy, numbers & localization

- Second person, present tense, short sentences. Max 3 lines per card body.
- One caveat per screen at most; put hedging in the reveal note, not the headline.
- Prices: two decimals, thin-space thousands separator, currency symbol from the user's market setting (`$` / `€`). Percentages with one decimal. Spread/slippage always "per share"; totals always with the share count visible ("$0.04 × 500 shares = $20").
- Market-specific facts (session times, index examples, day-trading regulations) come from a **market profile** (US / EU-DE by default) so the same level can render "9:30–16:00 ET" or "9:00–17:30 MEZ".
- Time-of-day examples use the user's market profile too.

---

## 10. Theming & accessibility

- **Dark mode is the default** (trading-app feel); a full light theme exists. Tokens: background, surface, text, accent, up-green, down-red, warning, success.
- Color-blind safe: up/down always with arrow/sign; an alternative palette (blue/orange) can be toggled in settings and applies to charts too.
- Dynamic type up to 130 % without truncating card bodies (cards scroll instead).
- Haptics and sounds each have a toggle. "Reduce motion" removes confetti, flicker and playback auto-advance (candles then appear on tap).
- Minimum tap target 48 × 48 pt; matching lines and tiles are keyboard/switch-accessible via tap-tap alternatives to drag.

---

## 11. Navigation & app flow

1. **Onboarding:** 3 screens (what the app is, no-guarantee note, notification opt-in) → **path recommendation quiz** (daily time available, patience vs. adrenaline, capital comfort) → recommended path with the option to change any time. Path choice is editable in settings and only affects content after Chapter 1.
2. **Home** = path map (7.1).
3. **Lesson player** (section 2).
4. **Practice** hub (7.3), **Stats** (7.4), **Settings** (market profile, theme, sounds/haptics, hearts on/off, reduce motion).
5. Every screen with a disclaimer need (first launch, scenario results, stats) shows the same one-line risk note; the full disclaimer lives in Settings → Legal.

---

## 12. How level files reference this document

A level file lists screens as `N. [archetype] content…`. Example:

```
1. [intro] "Before we trade, let's understand what we're actually trading."
2. [theory] Title: "What is a stock?" Body: "…" Visual: ownership-pie
3. [mc] Prompt: "…" (A) … [correct] (B) … (C) … Reveal: "…"
4. [hotspot: quote-card] Prompt: "Tap the daily change." Target: change-field
5. [chart-decision] Scenario: … Data: … Best answer: No trade. Reveal: "…"
```

Anything not stated in the level file (button labels, animation, colors, layout) is defined here and must not be repeated there.
