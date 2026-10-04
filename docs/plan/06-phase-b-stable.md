# Phase B: Stable

_Part of the [build plan](README.md) · §6_

## 6. Phase B – Stable

### `STABLE-APP` ✅ – the visible bugs

**Goal.**
- The bugs from the review are gone.
- The reveal separates decision and outcome. That is the basis for teaching variance.

**Scope**
1. **Plan overview** shows the saved plan (M1).
2. **The recap opens the right card** (M4):
   - The renderer uses `points[].card` (new field, `docs/level-files/`).
   - Without it, it takes the lesson's card whose text matches best.
   - `CONTENT-FIX` adds the `card:` values to the content.
3. **Reveal as in `docs/ui/06-reveal-and-hearts.md` §5.1b** (M5, M7):
   - At the top, the grade of the decision (green, amber, red).
   - The opening sentence fits the *chosen* option: never "Standing aside costs nothing" after a buy.
   - The `outcome` sentence from the YAML is shown.
   - The outcome "this time" sits small underneath, with the share count ("+$45.00 on 250 shares").
   - If you stood aside, it is gray and hypothetical ("Had you bought: …").
   - A new state "right, but lost" with the variance sentence from §5.1b. The "Why?" link follows in `VARIANCE`.
   - The only content change in this stage: the explanation in 1·1-1 S6 will fit both choices.
4. **Web accessibility** (M6):
   - Screen readers no longer read the solution in advance (the measuring copy gets `aria-hidden` or leaves the tree).
   - The answer word of `fill-tiles` is no longer in the DOM.
5. **An error page instead of a dead end** (S23):
   - A friendly text and "Back to the map".
   - Technical details only in test builds.
   - A hook for error reports (wired up in `ANALYTICS`).
   - A test route `#debug-crash`, only in test builds.
6. **Unit tests** for the reveal logic: every combination of choice, grade and outcome.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage STABLE-APP from docs/plan/06-phase-b-stable.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/01-goal-and-guardrails.md §0 "Variance" and the "STABLE-APP" section in docs/plan/06-phase-b-stable.md in full, plus docs/ui/06-reveal-and-hearts.md §5.1 and §5.1b and items M1, M4–M7 and S23 in docs/review-2026-09-25/.
Build exactly that scope — nothing from later stages.

Especially important:
- The reveal must be right for every combination: right/amber/wrong × win/loss × traded/stood aside. Put that table into the tests.
- The only content change: level-01-1 screen 6. No other content.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- The new unit tests.
- The render test without new problems.

**You test (~20 min)**
1. `#level-09-2/3` → **Buy**. Expected:
   - Grade amber ("Reasonable").
   - The first sentence talks about the purchase.
   - The sentence about the three price steps when selling is there.
   - "+$45.00 on 250 shares" sits small underneath.
2. `#level-09-2/3` → **Wait**: green; the outcome is gray, as a "would have".
3. `#level-01-1/6` → **Wait**: no "you just made your first trade" any more.
4. Skip ahead to Level 16, play lesson 16-2 to the end and fill in the plan: the overview shows your entries.
5. Play lesson 1-4 up to the recap and tap the first point: the matching card opens.
6. `#debug-crash`: a friendly error page; "Back to the map" works.
7. (Optional, iPhone) Turn VoiceOver on and answer one question in the web preview: no explanation is read out before answering.

**Done when** all seven points hold.

### `STABLE-DATA` ✅ – schema, renderer and validator say the same thing

**Goal.** Every one of the 5,109 screens renders, and it stays that way.

**Scope**
1. **`depth-ladder`** (M2):
   - The renderer reads `data.bids` and `data.asks` as in `docs/level-files/`.
   - The test bench (`demo/all-screens.yaml`) moves onto the schema; it had hidden the bug.
2. **`levels`** (M3):
   - The renderer expects `{price, label}`.
   - The 29 bare numbers in 13 files are rewritten, purely mechanically.
3. **Validator** (S39):
   - Checks the data shape of every component against the table in `docs/level-files/`, at least `levels`, `depth-ladder`, `order-book` and the charts.
   - Checks `demo/all-screens.yaml` as well.
   - Every new check gets a case in `tools/test_validate.py`.
4. **The render test becomes mandatory:** 0 crashes, 0 console errors, 0 blank screens.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage STABLE-DATA from docs/plan/06-phase-b-stable.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "STABLE-DATA" section in docs/plan/06-phase-b-stable.md in full, plus docs/level-files/ in full.
Build exactly that scope — nothing from later stages.

Especially important:
- Where schema and renderer disagree, the schema wins — unless the schema is demonstrably wrong; then change the schema first and justify it in the report.
- The content changes are purely mechanical (the shape of the data): no numbers, no text.
- At the end the render job is blocking and green.

Open a PR against main and get every check green.
Report: what you built · check results (render numbers before/after) · my test checklist with real links · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- The render test with 0 problems.
- The new validator cases fire.

**You test (~15 min)**
1. Skip ahead → Chapter 3 Level 15 → lesson 15-2: the depth ladder can be used.
2. Play the final exam of Chapter 3 (Level 19) through: no error page.
3. `#scalping-ch5-level-07-2/9`: the marked price lines are visible.
4. On the PR: the "render" job is green and reports 0 crashes.

**Done when** the render test is blocking and green.
