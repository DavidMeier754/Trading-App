# Should (S): design and interaction

_Part of the [review of 2026-09-25](README.md) · §4–4.1_

## 4. SHOULD

### 4.1 Design & interaction

**S1 – More pictures, fewer text slides**
- Only 86 of 759 theory and example screens (11 %) have a visual; in the playable part it is 21 %.
- The upper half of the screen is often empty, and lessons feel like slides.
- docs/ui/ principle 5 itself says: "A concept is shown (card, visual, animation) before it is asked."
- Most urgent:
  - A labeled candle diagram (Open/High/Low/Close/Body/Wick). `2·1-1` explains this only in text, and the example candle has no labels.
  - The spread (bid/ask) as a picture.
  - A stop-loss/target diagram.
  - The order book as a graphic.
- Small but visible: `1·1-1` says "Each point is the price …", but the line shows no points.

**S2 – Font sizes and contrast**
- `textFaint` (#66717F on #0E1116) has about 3.8:1; WCAG AA requires 4.5:1. Axes, placeholders and labels are affected.
- Many texts are 9–12 px:
  - The state chips above charts (account/size), although they matter for the decision.
  - Visual captions.
  - Sort chips once they are placed.
  - Match definitions (~11–12 px).
  - Branch texts (~11 px).
  - `type.small` = 12.
- Theory body text is gray, example body text is white; that is inconsistent.
- *Proposal:* labels at least 13 px, body text 16 px, raise `textFaint` to ≥ 4.5:1 and unify the color roles.

**S3 – Small displays: shorten instead of shrinking** 🔶 W5
- `FitScreen` scales screens that are too large down to 60 %.
- On 320×568 that means:
  - Branch text at ~8 px.
  - Sort, the plan card and the journal table are tiny.
  - The content sticks to the top, with empty space below.
- Without a doc change: docs/ui/02-lesson-player-layout.md §2 says "if a screen does not fit, it is two screens". So shorten or split screens, and add a validator estimate "fits on 320 pt".
- With W5: below ~85 % scale, scroll rather than shrink.

**S4 – Answers in the thumb zone** 🔶 W4
- The answer options sit at y ≈ 257–485 of 844; at the bottom there is only the CTA.
- One-handed on large phones that is tiring; Duolingo and similar apps put the options in the lower half.

**S5 – Faster animations (or change the docs)**
- docs/ui/02-lesson-player-layout.md §2/§5.1 says: reveal 200 ms.
- The code has:
  - `DURATION.reveal` 380 ms.
  - A panel spring of 620 ms.
  - Screen changes of 420 ms + 640 ms "settle".
- With ~25 transitions per lesson this feels sluggish. The Emil skills in the repo recommend < 300 ms for frequent interactions.
- There is a commit "Make the reveal start and end much slower"; maybe that was deliberate. Then it belongs in docs/ui/; otherwise the code goes to ≤ 250 ms (decision H).

**S6 – Chart axes with round prices**
- The ticks are an even division (`Chart.tsx`). So the axis shows 9.78, 9.81, 10.23 … and no $.
- Chapter 2 teaches "round numbers are levels", yet the axis never shows one.
- *Fix:* "nice ticks" (0.05 / 0.10 / 0.25 / 0.50 / 1) and the currency sign from the market profile.
- Also, the axis jumps between the decision and the reveal (9.78–10.02 → 9.75–10.36). The domain should stay stable or animate smoothly.

**S7 – A neutral, understandable chart decision**
- "Buy" has a green outline, "Wait" a gray one. That is a visual nudge; all options should carry the same weight.
- "NEXT 5 BARS" already appears in chapter 1 (a line chart), although "bar" only comes in chapter 2. Better "What happened next".
- Screen readers get no text alternative for the price move, e.g. "Price rose in steps from 9.80 to 10.05".

**S8 – Match: show what belongs together**
- Matched pairs only turn green; you cannot see what belongs to what.
- *Proposal:* colored pairs or a connecting line.

**S9 – Make the HUD, the daily goal and the map understandable**
- The flame "0" and the bolt "0" have no labels; a screen reader reads "0 0 5".
- The daily goal (2 lessons) is only a thin ring around the XP icon and is not stated in words anywhere. Better e.g. "Today 1/2".
- The banner "1/4 lesson" should read "Lesson 1 of 4".
- a11y labels are duplicated ("Checkpoint 5, Checkpoint: Checkpoint").
- The in-lesson streak uses the same flame icon as the daily streak. The two get confused.
- Level labels on the map take one or two lines depending on the zigzag side; that looks restless.

**S10 – Bring the streak to life**
- A missed day silently resets it to "0". There is no "streak at risk", no "streak lost" and no freeze.
- docs/ui/13-tiers-replays-and-plus.md §7.6 describes a weekly challenge that gives a streak freeze; it is not built.
- docs/ui/16-navigation.md §11.1 plans an opt-in for notifications. There is no notifications package and there are no reminders, so the most important comeback mechanic of apps like this is missing.
- The streak counts from one lesson, the daily goal is two; so there are two yardsticks (see W9).

**S11 – A better lesson completion**
- Confetti comes at every completion, even at 5/8. docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 says: only on a perfect run.
- The confetti covers the titles ("PERFECT RUN", "TIER UNLOCKED").
- There is no list of mistakes, no "practice your mistakes" and no feedback on the daily goal or the streak.
- Lessons have no name of their own; all four are named after the level ("Your First Trade").

**S12 – Flip the quit dialog**
- "Quit" is the big red primary button, "Keep learning" only a small link. Continuing should be primary.
- The text "Progress in this sub-level is lost." shows the internal doc word "sub-level"; the UI should say "lesson".

**S13 – Tap targets ≥ 48 pt** (docs/ui/15-theming-and-accessibility.md §10)
- The close X is 32×32.
- "Show working" is 18 px tall.
- Letter tiles are ~36 px.

**S14 – A test summary with the answer and a link** (docs/ui/03-screen-types.md §3 `summary`)
- A red entry only shows a one-line explanation ("Move times shares."), not the correct answer.
- "Review these" leads nowhere; docs/ui/ requires a "link to source level".

**S15 – Replaying and rereading**
- A finished level only offers "Review lesson 1". That is the whole lesson again, with heart loss and full XP.
- Lessons 2–4 cannot be chosen one by one, and you cannot see which one was perfect.
- Build "Review cards" (docs/ui/02-lesson-player-layout.md §2 and docs/ui/10-path-map.md §7.1): leaf through a level's theory cards without questions.

**S16 – Glossary** (docs/ui/14-glossary-and-copy.md §8)
- There is no code for it.
- Underline technical terms with dots; a tap shows the definition and "Taught in Level X-Y"; plus a searchable glossary in the profile.

**S17 – A light theme** (docs/rules/01-what-we-build.md: "full light theme available")
- `app.json` sets `userInterfaceStyle: "dark"`, there is no switch, and a light system setting is ignored.
- For the looks, see W6.

**S18 – A color-blind palette** (docs/ui/15-theming-and-accessibility.md §10: a blue/orange switch that also applies to charts) is missing.

**S19 – Build the Practice tab** (docs/ui/12-practice-and-stats.md §7.3)
- Weak concepts from wrong answers, a 3-minute mix, never costs hearts.
- This also solves the hearts dead end (M11).

**S20 – Account and statistics** (docs/ui/12-practice-and-stats.md §7.4)
- Today a placeholder: "Stats and your Trader Card will live here."
- The risk note on the stats screen belongs to this (docs/rules/10-legal-and-safety.md §7).

**S21 – A chapter badge as in docs/ui/07-lesson-chapter-and-tier-complete.md §5.4**
- Today a plain star with "Your path unlocked".
- Missing: the XP bonus counting up, "Chapter N unlocked" fading in, a motif of its own for each chapter.

**S22 – A sturdier plan card**
- Inputs are not checked: "Mornings, one liquid stock" is accepted as a stock name and as a holding time.
- Session and style would work better as a choice than as free text.
- The "dated history" from docs/level-files/ is missing in `progress.ts`; `savePlan` simply overwrites.
- "is exportable" (docs/ui/) is not built.

**S23 – An error page instead of a dead end**
- `ErrorBoundary` shows end users "Something broke" with a stack trace and no back button.
- *Proposal:* a friendly text, "Back to the map" and an error report (see S47).

**S24 – Visual details**
- The ownership pie with 100 or 1,000 pieces (`1·3-1 S2/S3`) is a dark circle. A 10×10 grid or a bar would be better.
- Carousel icons: only 6 icon names have a drawing. So 104 of 120 carousel cards show only the initial letter (e.g. "R" and "M" in `1·6-1`, right next to the real bank symbol of "Institution"), although the content asks for 51 different icon names.
- The session bar is not to scale and has no "now" marker (docs/ui/09-order-tools-and-other-visuals.md §6.5).
- `spot-mistake`: the parts stand as three chips on top of each other. docs/ui/ says "the parts run on as one sentence".
- `swipe-deck`: the swipe gesture is missing; there are only buttons. docs/ui/ calls swiping the main interaction and the deck "the highest-rep-per-minute screen in the app".

**S25 – A selectable market profile and EU formatting** (docs/ui/16-navigation.md §11.5)
- `ACTIVE_PROFILE = 'US'` is hard-coded; EU-DE cannot be selected.
- `price()` gives "€10.00" instead of "10,00 €".
- EU learners realistically scalp US stocks. So the profile needs "the market I trade" and "my time zone" as separate settings (the US session = 15:30–22:00 German time).

**S26 – Design the end of the content**
- "Levels 4–18 of Chapter 2 soon" stands there without context.
- *Instead:* say what is coming, offer a notify button and Practice.

**S27 – Bring the path choice and the target group together honestly**
- The path choice correctly marks Day and Swing as "Being written".
- But chapter 1 itself teaches:
  - "Full-time job + charts in the evening → Swing" (`1·14-1 S11`).
  - In scalping, costs eat a large part of the target (`1·17-2`).
  - docs/rules/10-legal-and-safety.md §7: "a European retail scalper realistically cannot scalp cash stocks at all".
- So the app sends people with a job and EU users into exactly the path it describes itself as unsuitable for them.
- *Short term:* an honest sentence about this on the path choice. *Long term:* W2b.
