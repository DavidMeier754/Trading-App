# Quotes and charts

_Part of the [ui reference](README.md) · §6–6.4_

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

**[2026-10-05] The "?" key** (David, instead of tap-to-explain, item P-05 of `docs/content-todo/05-content-review.md`): a small "?" key on every chart screen labels every element the learner has already been taught — the VWAP line, each level's label, the "what happens next" pill, the volume bars, the state chips, a scanner's column headings, and with `stop`/`target` the plan's lines and the R ruler — each with its one line from `content/skills.yaml`; pressed again, the labels go. Untaught elements get no label. The labels never cover the decision keys or the reveal. Stage `LOOK-COMPONENTS` writes the details here and builds it.
- **Line chart** in Chapter 1 (one line, draw-on animation 800 ms).
- **Candlestick chart** from Chapter 2 on (green/red bodies, wicks, optional volume bars, time axis, price axis right).
- **Playback:** candles appear one by one (120 ms, play/pause, tap to skip). Used by `chart-decision`.
- **Annotations:** dashed levels, arrows, shaded zones, labels; animate in. **[v3]** also user-draggable lines for `chart-annotate`.
- **[DESIGN-REVIEW, picks 2026-10-04]** **Run a finger along the chart.** On a chart that is there to be read — a theory or `visual` chart, and a `chart-decision` once its outcome has played — a finger run sideways along it brings up a crosshair on the nearest bar, a dot on its close and a tag with its price and its change from the chart's first bar ("$53.40 ▲ +2.4 %"). Each bar it crosses clicks; it goes when the finger lifts. A tap is not a scrub, so a tap does what it did; charts that are answered on (`chart-tap`, `chart-annotate`) have none. `src/components/ChartScrub.tsx`.
- **State chips:** the level file's optional `state` strings render as small chips in a row above the chart (day result in R, the session limit, trades taken, current share size). They appear with the scenario and stay visible through playback. Absent when the decision rests on the chart alone.
- **Decision overlay:** at the pause point the three buttons rise from the bottom; after the choice the chart continues and a P/L strip shows the outcome, then the rationale.
- **[v3] Mini variant** for `swipe-deck` and `compare`: no axes, no volume, 8–10 bars, one optional level line — readable at a glance at half height.
- Expand → landscape fullscreen with pinch-zoom (later).
- **[v4] Price axis.** Round steps (0.05, 0.10, 0.25, 0.50, 1, …) with the currency symbol from the market profile. The domain is fixed from the first frame to the end of playback, so nothing jumps between the decision and the reveal.
- **[DESIGN-REVIEW] The frame holds still.** David, 2026-10-03 (on the frosted-glass idea, which he did not take): "make sure the line before it gets revealed already is at the middle of the chart so the chart's y-axis units don't get bigger or smaller." From the first frame the price range already covers every bar still to come, and it is centred on the bars the learner can see: their middle is the middle of the chart. When the future plays out, nothing rescales, nothing slides, and the axis labels never change. The hatched box over the hidden bars stays as it is.
- **[v4] Stop and target** from the level file (`stop`, `target`) draw as labelled lines, and playback ends at the first one touched. **[DESIGN-REVIEW]** Built: they appear with the choice, not before it (they would give the direction away), with the entry as a third, quieter line; their price tags sit on the axis in the number face.
- **[DESIGN-REVIEW] The R ruler.** On a decision with `stop` and `target`, from the lesson that teaches R on (Scalping 6·2-1; the app checks that the lesson introducing the term "R" is behind the learner), a slim ruler stands beside the price axis: −1R at the stop, 0 at the entry, +1R, +2R … up to the target. While the trade plays out a marker climbs or falls along it and stops on the result, labelled in R ("+1.6R"). It shows when the learner took the trade the file describes, faint when they stood aside, and not at all when they traded the other way. It teaches R by being there every time, without a sentence.
- **[DESIGN-REVIEW] Chart notes.** After the reveal, the file's `notes` (1–4) appear on the chart, each a few words on a small tag with a thin leader line to the top or the bottom of the bar it means ("Lower high", "Breaks the shelf"). They fade in one after another once playback has ended; they never cover the last bar's price tag, and they are part of the screen reader's description.
- **[DESIGN-REVIEW] Words on the chart stay readable.** Built: every label on a chart — a level's name and price, the entry, the stop, the target — is drawn over the bars on a thin rim of the page's colour, so no candle hides a price. A level's label sits at the left end of its line, just over it; it moves to the right end, or under the line, only where that clears a real part of a bar (not the tip of a wick), judged against every bar of the chart, those still to come included, so it never moves while the replay plays. The stop's and the target's labels take the other side of their line when the usual side would run into the "decision" tag at the top. A note steps further out from its bar when it would cover a label, another note or another bar, and takes the bar's other side when its own has no room; the outcome tag steps clear of the levels' labels. On a narrow chart a long label can still cross a candle; the rim keeps both legible. **[DESIGN-REVIEW, 2026-10-04]** Labels never cover each other or leave the plot: two levels a few cents apart (Ch 4 10-1: a round number and yesterday's close, two cents apart, at the top of the chart) take a row further from their line rather than one spot; a label stays inside the plot, off the price axis, and one too long for it with its price drops the price, which the axis shows; the "next 5 bars" pill in the hatched zone moves up or down to make way for a label. The mini chart of `swipe-deck` and `compare` places its labels the same way.
- **[DESIGN-REVIEW] The open.** A chart with `session_open` shades the bars before the open as pre-market, faintly, and draws a dashed line before the first regular bar with a small bell and "Open". Only on charts where the open matters (David: "only on charts where it is important … in levels testing setups"), and explained the first time (`docs/content-todo/01-rules-from-the-design-review.md` 1.2).
- **[DESIGN-REVIEW] Simple first.** Charts start with as little on them as possible and gain information as the path goes on: a line, then candles, volume, levels, the open, stop and target, VWAP, the R ruler. Nothing appears before the lesson that explains it, and the first chart that shows it explains it (the ramp: `docs/content-todo/01-rules-from-the-design-review.md` 1.2).
- **[v4] Decision buttons are equal in weight.** No option is pre-coloured. The label over the hidden bars reads "What happened next", never "Next 5 bars" — Chapter 1 has no bars yet. **[DESIGN-REVIEW]** Each key carries its direction glyph (§4.3).
- **[v4] Text alternative.** Every chart carries a one-sentence description for screen readers ("Price climbed in steps from 9.80 to 10.05").
