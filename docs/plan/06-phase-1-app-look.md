# Phase 1, app lane – charts and teaching graphics

_Part of the [build plan](README.md)_

The app lane is the first part of Phase 1; the content lane follows once it is done (`docs/plan/03-stages-at-a-glance.md`). It starts with the building blocks of every lesson, so the chapter fixes later place finished components and `VISUALS`' graphics. After `VISUALS` comes your first turn for your own changes (`YOUR-TURN-1`, `docs/plan/22-your-turn.md`).

### `LOOK-COMPONENTS` – the building blocks of every lesson

**Goal.** The building blocks that appear in every lesson look finished.

**Since `DESIGN-REVIEW`** (2026-10-03) some items are done or changed; each says so. What is left fits one session, two if the candles take long.

**Session 1 – charts and reveal**
1. **Axis** (S6):
   - Round prices (0.05 / 0.10 / 0.25 / 0.50 / 1) and the currency symbol from the market profile.
   - The axis does not jump between decision and reveal. **Done in `DESIGN-REVIEW`:** the frame holds still from the first frame, the visible bars in its middle (`docs/ui/08-quotes-and-charts.md` §6.4).
   - Prices in the number face of the mix (`docs/ui/15-theming-and-accessibility.md` §10).
   - **Built in session 1** (2026-10-06): round steps on the backdrop's grid, "$10.25" in the number face (`docs/ui/08-quotes-and-charts.md` §6.4).
2. **Decision buttons** (S7):
   - Equal in weight. **Done in `DESIGN-REVIEW`,** with a direction glyph on each key.
   - "What happened next" instead of "NEXT 5 BARS". **[CONTENT-REVIEW]** (C1-01, C2-01): on a line chart "What happens next", on a candle chart "Next 5 candles" — the course says candles, and "bars" are the volume bars.
   - A text alternative for screen readers, e.g. "Price climbed in steps from 9.80 to 10.05".
   - **Built in session 1:** the pill and the sentence (`src/components/chartWords.ts`).
3. **Stop and target lines** when a screen has `stop` or `target` (new, `docs/level-files/`), labelled with their prices, and the entry while the learner decides. **Done in `DESIGN-REVIEW`,** with one change: they appear with the choice, not while the learner decides (they would give the direction away); the R ruler, chart notes and the open marker came with them.
4. **State chips** easy to read. **Built in session 1:** name quiet, value bold in the number face, a day's R in its sign's colour.
5. **Candles that form** (your critique: the candle animations should move more realistically): a candle opens, runs to its high and low and settles at its close, with a live price tag on the axis, as in `#prototype/mix/chart` (`formingCandle` in `src/prototype/kit.tsx`; both at commit `a78e210`, `LOOK-SYSTEM` item 13). A tap still finishes the playback. **Built in session 1:** the candle already formed (since `LOOK-SYSTEM`); the live price tag on the axis is new.
6. **The trade log** in the chart's reveal, from Precise: the outcome, the result and R, lined up in the number face, a neutral block under the grade (`docs/ui/06-reveal-and-hearts.md` §5.1b). Since `DESIGN-REVIEW` it shares its row with the decision grid; keep the panel compact (§5.1b). **Built in session 1:** Outcome, Result and In R rows under the outcome sentence (`docs/ui/06-reveal-and-hearts.md` §5.1b).

**After session 1** (David, 2026-10-06, reviewing it: "the charts are way too small … a TradingView approach where the user can drag the y axis and the steps get bigger or smaller … zoom the x axis … the chart could take way more space on the screen"). Built in a follow-up PR of session 1: the decision chart fills the screen and eases smaller for the verdict; the axis lines fall on round prices inside the frame instead of the frame being stretched to round lines; drag the price axis, pinch in time, Reset (`docs/ui/08-quotes-and-charts.md` §6.4, `docs/ui/02-lesson-player-layout.md` §2).

**Session 2 – the rest**

7. ~~**Match:** every pair with its own color or connection (S8).~~ **Done differently in `DESIGN-REVIEW`:** David did not want colours or threads; matched pairs snap together with rising notes and haptics and the board ends on a wave (`docs/ui/04-question-types.md` §4.1).
8. **Lesson complete** (S11). **Since `DESIGN-REVIEW` (David's picks of 2026-10-04)** it has six designs that take turns (`docs/ui/07-lesson-chapter-and-tier-complete.md` §5.3, `src/lesson/wins/`); what is left here applies to each:
   - Confetti only for a perfect run and never over text. **Done in `DESIGN-REVIEW`,** as candles and coins.
   - The lesson's name (`subtitle`) is shown.
   - The mistakes are listed, with "Practice these" (linked from `PRACTICE` on).
   - ~~Progress toward the daily goal is visible.~~ The streak is shown (one lesson a day keeps it). **Done in `DESIGN-REVIEW`.**
   - Its numbers count up to their value, together with the ring (from Precise, your choice in `LOOK-BRIEF`; `#prototype/mix/complete` at `a78e210`). Reduced motion shows them at once. **Done in `DESIGN-REVIEW`** in every design.
   - **Built in session 2** (2026-10-07): the subtitle under the title (the lesson's place until the files have one), the missed questions in a box under the design, and **Practice these**, which already plays them as a practice round (`docs/ui/07-lesson-chapter-and-tier-complete.md` §5.3).
9. **Chapter badge** as in `docs/ui/07-lesson-chapter-and-tier-complete.md` §5.4: the XP bonus counts up, "Chapter N unlocked" (S21). **Done in `DESIGN-REVIEW`,** as the chapter's own emblem medal with the next chapter named.
10. **Visuals** (S24, W17):
    - The ownership graphic as a 10×10 grid from 20 parts upward.
    - Real icons for all 51 carousel icon names (e.g. the `lucide-react-native` library, MIT license, plus a mapping table).
    - The session ribbon to scale and with a "now" marker.
    - `spot-mistake` as one sentence.
    - The swipe gesture in `swipe-deck`.
    - The label "Takeaway" for a `story` with `label: takeaway`.
    - **Built in session 2:** the grid (`docs/ui/08-quotes-and-charts.md` §6.1); a mapping table for all 51 carousel icon names (`src/home/symbols.tsx`: 38 Lucide symbols, ISC licence; 6 names drawn as the app's own icons; 3 of its own icons by name; 4 candles newly drawn by hand), which the validator checks; the ribbon to scale with "now" (§6.5); `spot-mistake` as one sentence and the swipe in `swipe-deck` (`docs/ui/04-question-types.md`). "Takeaway" was already built in `DESIGN-REVIEW`.
11. **Level icons on the map** (your critique; you like Chapters 1 and 2's): a level's symbol is the first `icon:` among its lessons (`levelIconOf` in `src/content.ts`). Chapters 1 and 2 set one in 44 of 48 and 46 of 49 lesson files, Chapters 3–8 in none of their 291, so every level there shows the same symbol for its type. Every level of every chapter gets its own symbol for what it teaches, and the validator warns when a level has none. **Built in session 2:** an `icon` in all 273 lesson files of Chapters 3–8, most from the mapping table (`docs/level-files/01-header.md`), and the warning.
12. **The "?" key** (item P-05 of `docs/content-todo/05-content-review.md`; David chose the key over tap-to-explain on 2026-10-05): a small "?" key on every chart screen. Pressed, it labels every element on that chart the learner has already been taught — the VWAP line, each level's label, the "what happens next" pill, the volume bars, the state chips, a scanner's column headings, and with `stop`/`target` the plan's lines and the R ruler — each with its one line (the skill's `info` from `content/skills.yaml`); pressed again, the labels go. An element not yet taught gets no label, the same rule as the term marker (`docs/ui/14-glossary-and-copy.md` §8). The labels never cover the decision keys or the reveal. A short section in `docs/ui/08-quotes-and-charts.md` first. **Built in session 2:** numbers on the elements and a legend under the chart, which gives up the legend's room (`docs/ui/08-quotes-and-charts.md` §6.4a).

**Model · effort · sessions:** Opus 5.5 · high · 2

**Prompt** (for each of the two sessions; insert `[1]` or `[2]`)
```
Stage LOOK-COMPONENTS, session [1|2], from docs/plan/.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "LOOK-COMPONENTS" section in docs/plan/06-phase-1-app-look.md in full, plus docs/ui/04-question-types.md §4–§6 and docs/level-files/04-components-and-data.md (components).
Build only the items of the named session.

Especially important:
- Nothing moves that the learner did not move (docs/ui/02-lesson-player-layout.md §2).
- Icons: a mapping table icon name → symbol for every name the content uses; the validator rejects unknown names.

Open a PR against main and get every check green.
Report: what you built · check results · contact sheets · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min)**
1. `#level-01-1/6`: the axis shows round prices with $, and nothing jumps after the decision.
2. ~~A match in the test bench: the pairs are colored.~~ (tested in `DESIGN-REVIEW`)
3. Finish one lesson perfectly and one with mistakes: confetti only for the perfect one, the list of mistakes is visible.
4. The carousel in lesson 1·6-1: real icons instead of letters.
5. The session ribbon in lesson 1·10-1: the proportions are right, "now" is visible.
6. Swipe a `swipe-deck` with your finger.
7. The Chapter 1 badge (skip ahead to the final exam 17-1).
8. A chart decision (e.g. `#level-01-1/6`): the candles form as they play out, a price tag follows the forming one, and the reveal lists outcome, result and R.
9. The map: the levels of every chapter, Chapters 3–8 too, have their own icons.
10. Lesson complete: the numbers count up with the ring.
11. A chart in Chapter 4 (link in the report): press "?" — every element you were taught is labelled, and nothing covers the keys; press it again — the labels go.

### `VISUALS` – new teaching graphics

**Goal.** The most important concepts are shown, not just described (S1, `docs/ui/01-design-principles.md` §1 principle 5).

**Scope**
1. **Two new components** as in `docs/ui/09-order-tools-and-other-visuals.md` §6.8:
   - `candle-anatomy`: one candle with open, high, low, close, body and wicks labeled; the labels appear one after another.
   - `trade-plan`: entry, stop and target as lines with their distances, plus R and a risk/reward bar.
2. **Both** in the test bench, in `docs/level-files/` (component table) and in the validator.
3. **Not built into lessons yet.** `VARIANCE` and `CONTENT-FIX` do that; the visual quota from `RULES` applies there.
4. **`decision-grid`** (`docs/ui/09-order-tools-and-other-visuals.md` §6.8) is already built, in `DESIGN-REVIEW`: lesson 1·2-4 uses it.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage VISUALS from docs/plan/06-phase-1-app-look.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "VISUALS" section in docs/plan/06-phase-1-app-look.md in full, plus docs/ui/08-quotes-and-charts.md §6 and docs/level-files/04-components-and-data.md (components).
Build exactly that scope; no content except the entries in demo/all-screens.yaml.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min).** Both components in the test bench on your phone:
- Are they understandable without explanation?
- Are light and dark both right?
