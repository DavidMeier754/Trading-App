# Could (K) and doc changes (W)

_Part of the [review of 2026-09-25](README.md) · §5–6.2_

## 5. COULD

- **K1 – A German interface, German content later** 🔶 W19
  - You and probably many users are in the DACH region. UI texts are hard-coded today.
  - Introducing i18n keys now is cheap; later it is expensive.
- **K2 – A mistakes round at the end of a lesson** 🔶 W25
  - Questions answered wrongly come back once more at the end, as in Duolingo. That is one of the most effective learning mechanisms.
- **K3 – "See the card again" on question screens** 🔶 W8
  - The previous theory card as an overlay, without real back navigation.
- **K4 – The leaderboard as a friends league or opt-in** instead of a mandatory global tab 🔶 W7
- **K5 – Share the Trader Card and badges**
  - The Account placeholder already announces the Trader Card: plan, streak, chapter, hit rate when standing aside …
- **K6 – Achievements that reward discipline instead of speed**
  - For example "Stood aside correctly 10×", "Kept to the plan for 7 days", "Checkpoint without a mistake".
- **K7 – A paper-trading mini simulator with the planned replays as the finale**
  - Chapter 8 ends with a simulator plan anyway.
- **K8 – A "Report a problem" button on every screen**
  - It sends the screen id and a description. In a beta that is the best tool against content errors.
- **K9 – "Explain it differently"** by AI (Claude API) after a wrong answer
  - Only with hard guardrails: no signals, no investment advice, only the lesson's teaching content.
- **K10 – A weekly review** ("9 lessons, 82 % correct, strongest topic: spread"), plus a streak widget (iOS/Android).
- **K11 – An in-app font size setting** in addition to Dynamic Type; landscape and tablet layouts for charts (today max. 480 px wide).
- **K12 – Match: one wrong tap does not cost the whole task right away** 🔶 W15
- **K13 – A mascot or a subtle guide** 🔶 W20
  - Only as an idea. You dropped it deliberately, and I do not urgently recommend it.
- **K14 – Technical upkeep**
  - `expo-router` for the native back gesture and deep links.
  - Split up `Chart.tsx` (1,818 lines).
  - Sounds as AAC/Opus instead of 30 WAV files (736 KB).
  - The web build as an installable PWA.

---

## 6. Proposals that contradict or extend a .md file – asking for your permission

I will not change any of these files before you agree.
- For each item I would adapt the named .md passage and then build the improvement.
- Where there is a way without a doc change, it is noted.

### 6.1 Real contradictions (they change an existing rule)

**W1 – Hearts only in tests and final exams; lessons are for practice** (→ M11)
- *Contradicts:*
  - docs/rules/, Product decisions → Hearts: "A wrong answer in any lesson, Test or Final Exam costs one heart".
  - docs/ui/01-design-principles.md §1 no. 6: "Hearts are spent in lessons, Tests and Final Exams".
  - docs/ui/06-reveal-and-hearts.md §5.2.
- *Why:*
  - The hearts punish exactly what a lesson is for (trying out something new).
  - Whoever fails while learning is stuck for up to 20 h and loses the progress in the lesson.
  - On `main` this was still the rule.
- *Without a doc change:* "Review cards" and a heart refill through Practice. The docs already plan both. I would build both in addition.

**W2 – The work order in docs/plan/** (→ M13, S27, S50)
- *Contradicts:* docs/plan/ "One rule: this file's order is the order", NEXT = OFFER, "PATHS is last and gated".
- **W2a:** A new stage **APP-FIX** before OFFER.
  - Content: M1–M7, M14, then M13 (wire in the content), followed by a stage **RELEASE-READY** (M8, M17, S41–S44).
  - Reason: the app is the product, and its bugs affect every screen already written. OFFER waits for decisions A–C anyway.
- **W2b:** Write the **Swing path** before REPLAY-BANK and DRILLS.
  - Before that, the two missing validator rules (risk per trade, total exposure) that docs/plan/ itself names as a prerequisite.
  - Reason: according to your own chapter 1, Swing is the path for people with a job, and according to docs/rules/10-legal-and-safety.md §7, scalping cash stocks is practically not possible for EU users.
  - The schema risk that docs/plan/ gives as the reason for "last" drops sharply as soon as M14 renders every screen.

**W3 – The 50 % plan value against the exercises** (→ M15)
- *Contradicts:* docs/rules/04-numbers-and-realism.md §3.6: "Chapter 1 keeps a conservative, path-neutral number (50 …) and the path's own Chapter 3 revises it".
- *Options:*
  - **(a)** The Scalping path revises the plan already in **chapter 2 level 1**, with a reason, i.e. where the $20,000 account appears today, instead of in chapter 3. *My recommendation.*
  - **(b)** Recalculate the exercises in chapter 1 to ≤ 50 %. That affects many files and changes every chapter-1 trade.
  - **(c)** The plan card in chapter 1 does not ask for a position limit yet; only the path does.
- *In any case, in addition:* a practice account that runs through the story (chapter 1 $6,000 → chapter 2 $20,000 is explained, not just set).

**W4 – Answers at the bottom, in the thumb zone** (→ S4)
- *Contradicts:* docs/ui/02-lesson-player-layout.md §2 "A screen arrives centred in its area".
- *Proposal:* the question and visual at the top, the answer options at the bottom edge above the CTA.

**W5 – A minimum type size instead of shrinking, scrolling as the fallback** (→ S3)
- *Contradicts:* docs/ui/02-lesson-player-layout.md §2 "A screen never scrolls" and §10 "Scrolling is the fallback only past 130 %".
- *Proposal:* scale down to 85 % at most, scroll below that. In parallel, shorten screens, which works without a doc change.

**W6 – Two or three looks plus a real light and dark mode instead of nine dark looks** (→ S17)
- *Contradicts:* docs/ui/15-theming-and-accessibility.md §10 "A lesson wears one of nine designs" and §11.5 (a look preview to swipe through).
- *Why:*
  - Every component has to be maintained and tested nine times.
  - Meanwhile the promised light theme (docs/rules/) is missing entirely.

**W7 – The leaderboard only as an opt-in or a friends league; drop it until then**
- *Contradicts:* docs/ui/11-top-bar.md §7.2 and docs/ui/16-navigation.md §11.2 (the leaderboard as a tab of its own). On `main` it still said "No league/rank at launch".
- *Why:*
  - XP competition in a trading app rewards speed instead of care.
  - Today XP can also be farmed (W11).
  - The project's own principle "No pressure" speaks against it.

**W8 – "See the card again" inside a lesson** (→ K3)
- *Contradicts:* docs/ui/02-lesson-player-layout.md §2 "No back button inside a lesson".
- *Proposal:* no real back, only an overlay with the last theory card.

**W9 – A selectable daily goal (1/2/3 lessons, default 2); the streak only counts once the goal is reached** (→ S10)
- *Contradicts:* docs/rules/ "Daily target: Two sub-levels" and docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 "Daily goal is two sub-levels".
- *Why:* today the streak counts from one lesson and the goal is two; someone who only has 5 minutes a day misses the goal every day.

**W10 – Text length: ≈ 150 characters instead of ≈ 220** (→ S37)
- *Contradicts:* docs/rules/05-tests-consistency-and-copy.md §3.9 "body text max 3 lines (≈220 characters)" and docs/ui/14-glossary-and-copy.md §9.
- *Measured:* 220 characters are 4–5 lines on a phone.
- *Alternative:* keep the number and correct "3 lines" to "5 lines".
- Plus a validator warning; today no tool checks the length.

**W11 – No full XP for replays** (e.g. ¼, or only for an improvement) **and no XP for "Skip ahead"** (→ S45)
- *Contradicts:* docs/ui/07-lesson-chapter-and-tier-complete.md §5.3: "… the lesson's XP plus the perfect bonus, replayed sub-levels included".

**W15 – Match: a single wrong tap does not make the whole task wrong** (→ K12)
- *Contradicts:* docs/ui/04-question-types.md §4 `match`: "Scored on whether the learner got there without a wrong tap".
- Also, amber is currently only defined for chart-decision.

**W19 – German earlier:** i18n keys right away, a German interface before the release, content later (→ K1)
- *Touches:* docs/rules/ "Content language: English (i18n later via keys)". It is not a hard contradiction, but it moves a product decision.

**W20 – (optional) A guide character** (→ K13)
- *Contradicts:* docs/rules/ "Mascot: No [v3.1 — reversed]" and docs/ui/ (no characters).

### 6.2 Additions (a new rule or a new field in a .md)

**W12 – An outcome rule** (→ M9)
- A new point in docs/rules/03-content-rules.md §3.5/§3.6: about 30–40 % of correct long/short decisions end at the stop.
- The reveal separates the decision from the outcome.
- A validator warning, plus an early lesson "good decision ≠ good outcome".

**W13 – A sign rule** (→ M10)
- In docs/level-files/, a field `sign: any` for `numeric-input` (the absolute value counts), or a duty to state the sign in the prompt. Plus a validator rule.

**W14 – A recap reference** (→ M4)
- In docs/level-files/, a field `card:` for each recap item that points to the matching theory card.

**W16 – One variety of English** (proposal: US, to match the US default profile) in docs/rules/05-tests-consistency-and-copy.md §3.9, plus a validator list (→ S35).

**W17 – The label "Takeaway"** for closing conclusions instead of "THE SCENE" (docs/level-files/, `story`) (→ S31).

**W18 – Clean up the skills**, and one sentence in `CLAUDE.md`: "Where a skill disagrees with `docs/`, `docs/` wins." (→ S52)

**W21 – An optional explanation for each wrong option** in docs/level-files/ (e.g. `why:` on each option) (→ S33).

**W22 – More validator rules** (the docs/level-files/ description and docs/rules/03-content-rules.md §3.5)
- A lower limit for the length tell.
- The punctuation tell in the chapters too (docs/rules/ already requires that).
- The `levels` format.
- The `depth-ladder` data shape.
- Checking the test bench as well.

**W23 – A visual share**
- A validator warning when fewer than ~40 % of a chapter's theory screens have a visual (→ S1).

**W24 – Add the app checks to CLAUDE.md**
- `npm run typecheck` and the render smoke test before every app PR (→ M14).

**W25 – A mistakes round at the end of a lesson** (add the flow to docs/ui/02-lesson-player-layout.md §2/§5) (→ K2).
