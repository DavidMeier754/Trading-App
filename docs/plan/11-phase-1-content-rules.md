# Phase 1, content lane – rules and the new building blocks

_Part of the [build plan](README.md)_

The content lane is the second part of Phase 1: it starts once the app lane and `YOUR-TURN-3` are done (`docs/plan/03-stages-at-a-glance.md`). Its order is deliberate:
1. First the validator learns the new rules, and every chapter gets its worklist (`RULES`).
2. Then the new building blocks are made (`CONTENT-DESIGN`, `VARIANCE`, `OFFER`).
3. Then every chapter is touched **once** (`CONTENT-FIX`, `docs/plan/12-phase-1-content-chapter-fixes.md`). Chapters 2–7 one after the other, then Chapters 1 and 8.
4. Only then come the reviews (`docs/plan/13-phase-1-content-reviews-and-chapter-9.md`).

That way no file is rewritten twice. Your critique of the lessons is collected in `docs/content-todo/05-content-review.md` (the content review of 2026-10-05); `RULES` adds only what you find on top.

### `RULES` – new rules and worklists

**Goal.**
- Your own critique of the lessons is captured, so every chapter pass works on it.
- The new content rules are checked automatically.
- Every content session gets a ready-made worklist.

**You prepare (~30 min).** Play a few lessons from Chapter 1 and Scalping Chapters 2–3, then write down what bothers you, like the look critique in `LOOK-BRIEF`. Send it as lines under `Next stage.`:
```
What bothers me in the lessons (screen link + one sentence):
- …
Too long / too short / too easy / too hard:
What I miss:
Lessons I liked, and why:
```

**Scope** (the rules are in `docs/rules/` and `docs/level-files/`, marked [v4] there)
0. **`docs/content-todo/`** is read with the critique: its Part 3 is part of every chapter's worklist.
1. **Your critique** — **[CONTENT-REVIEW]** largely collected already: the beginner's read of every chapter, approved by you on 2026-10-05, is `docs/content-todo/05-content-review.md` Part 6, and every `CONTENT-FIX-N` reads it. Add only what you find on top. It goes into this plan, into the chapter-specific items of `CONTENT-FIX`: a part for every chapter, plus the chapter it names. So every chapter pass reads it. Two points are already in, from `LOOK-BRIEF`: more hands-on lessons where you don't know where, or whether, there is an entry; and fewer words on every screen, for which `RULES` proposes a tighter limit than W10's 150 characters, per screen type (you decide).
2. **Validator rules:** warnings first, errors under `--strict`.
   - **Variance** (§3.11):
     - the share per chapter;
     - in Chapter 1, never two "right, but lost" in a row;
     - `stop` and `target` from Chapter 3 on for directional decisions;
     - the `outcome` sentence matches the chart (win or loss).
   - **Signs** (§3.12): amount questions have `sign: any` or a direction word in the prompt.
   - **No odds** (§3.11, `DESIGN-REVIEW`): a sentence that states how often something wins or loses ("4 in 10", "x % of the time", "most of the time it works") outside a screen that labels its numbers as an example.
   - **Standalone questions** (§3.4, `DESIGN-REVIEW`): a question whose prompt points back ("the chart above", "this quote") without a `story` right before it.
   - **References and labels:** recap points with `card:`; a `story` screen at the end of a lesson with `label: takeaway`.
   - **Language:**
     - body text ≤ 150 characters;
     - US spelling (a list of British forms);
     - no gesture words in prompts ("drag", "tap", "swipe") and no mechanics hints like "Hearts are on."
   - **Tells** (§3.5): the length tell downwards as well (< ~15 %); the punctuation tell in chapters too, not only in packs.
   - **[CONTENT-REVIEW] Words** (§3.4a, item P-07 of `docs/content-todo/05-content-review.md`):
     - a word of the one-meaning table used in its other meaning where that is detectable ("gap" next to bid, ask, quote or spread; "flat" next to R or break-even);
     - a word of the plain-words table outside the lessons that explain it;
     - a taught term used in a lesson before the one that introduces it, in this chapter or an earlier one (today the check only reads question screens of one chapter).
   - **[CONTENT-REVIEW] Level labels:** a level labelled high, ceiling, top or box high that sits under most closes before the decision (or the reverse), and two lines with the same label on one chart. Flips that a scenario explains ("yesterday's low, now overhead") are allowed by label family. This is how C7-01 and C7-02 were found.
   - **[2026-10-05] No quotas:** a sentence that tells the learner how many lessons to do or that they must practice ("one lesson a day", "do three lessons", "practice daily"). The app and the course set no quota (David).
   - **Visual quota:** ≥ 40 % of a chapter's `theory` and `example` screens have a visual (W23).
   - **Plan-aware cap:** after a `plan-card` that writes `setup_max_account_pct`, positions stay under the suggested value until the next revision.
   - **Per-trade risk and total exposure** (`docs/rules/04-numbers-and-realism.md` §3.6):
     - risk per trade between 0.5 and 2 %;
     - with several positions at once: the sum of position values and the sum of the risks against the account;
     - required before the swing and day-trading paths.
3. **`tools/test_validate.py`:** one case per new rule.
4. **`tools/content_report.py --chapter N`:** a worklist per chapter (Markdown) with every finding, each with file and screen — including the counts behind `docs/content-todo/03-work-per-chapter.md` Part 3 (lessons without skills, scenes with a ticker and no alert, test intros without `facts`).
5. **`tools/export_readable.py --chapter N`:** a chapter as readable text, for you and for the reviews.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage, and takes the critique from your lines under `Next stage.`)
```
Stage RULES from docs/plan/11-phase-1-content-rules.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "RULES" section in docs/plan/11-phase-1-content-rules.md in full, plus docs/rules/ and docs/level-files/ in full (every rule marked [v4]).
New rules start as warnings; a plain `validate_content.py` stays at 0 errors. No content changes in this stage.

My critique of the lessons, from my lines under "Next stage." (ask me for it if it is missing):
[paste your template here]

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the worklists and a chapter export yourself.
Report: what was built (with where to see it) · check results · new rules · warnings per chapter (table) · link to the worklists · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** the tighter word limit per screen type that `RULES` proposes (scope item 1): you decide it. Claude checks the worklists, the export and where your critique landed itself, and lists them under what was built.

**Where to look** (optional; the report links each):
- The worklists for Chapters 1 and 7: are the numbers plausible? The variance share today is e.g. 0 %.
- A chapter export: is it easy to read?
- Your critique in the `CONTENT-FIX` section: is every point there, in the right chapter?

### `CONTENT-DESIGN` – the test bench learns the new fields

**Goal.** Every content field the app renders since `DESIGN-REVIEW` has an example in the test bench, so every later content stage can see what it writes.

**Scope** (`docs/content-todo/04-still-to-write-and-done-log.md` 4.9)
1. In `demo/all-screens.yaml`: a chart decision with `stop`, `target` and `notes`; a chart with `session_open`; a story with an `alert`; a test-style intro with `facts`; `skills` in the header.
2. One bonus file in `demo/` that the bench can open.
3. The render test and the contact sheets cover them.
4. Tick 4.9 in `docs/content-todo/`.

**Not in this stage:** any file in `content/`.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage CONTENT-DESIGN from docs/plan/11-phase-1-content-rules.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "CONTENT-DESIGN" section in docs/plan/11-phase-1-content-rules.md in full, plus docs/content-todo/, docs/level-files/ (every [DESIGN-REVIEW] field) and docs/ui/03-screen-types.md §3, docs/ui/06-reveal-and-hearts.md §5.1b, docs/ui/08-quotes-and-charts.md §6.4.
Change only the test bench; no file in content/.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** nothing, as a rule — Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each):
- The new bench screens (Settings → Testing → Every screen type; the `#all-screens/…` links in the report).

### `VARIANCE` – decided right, lost anyway

**Goal.** The learner understands that correct decisions can lose, before it happens to them (§0, "Variance"). You asked for the same in `LOOK-BRIEF`: a right decision can still lose, and the app should say so.

**Changed on 2026-10-03 (`DESIGN-REVIEW`):** the variance simulator is dropped — a fixed win rate on a screen would read as reliable, and the learner should find out for themselves how often a method works (`docs/rules/07-variance-and-typed-numbers.md` §3.11). The reveal line without a rate and the decision grid are already built; this stage writes the content.

**Scope**
1. ~~**New screen type `variance-sim`**~~ — dropped. The `decision-grid` visual (`docs/ui/09-order-tools-and-other-visuals.md` §6.8) is built and is what 2-4 uses.
2. **New lesson 1·2-4 "Good Call, Bad Luck":**
   - In English, 12–16 screens, following `docs/course/` and the sequence in `docs/content-todo/04-still-to-write-and-done-log.md` 4.1: a scene, the first correct decision that loses (with the reveal and its grid), the grid as a card, why a good read can lose, `tf` "A trade that lost was a bad decision" (false), a sort into the grid, a right "wait" that would have won, a mini calculation, "how often it works, your own record says", the takeaway.
   - No rate anywhere, no simulator.
   - The prerequisite chain: 3-1 now follows 2-4.
3. **"Why?" link** in the "right, but lost" reveal: opens the grid card from 1·2-4 as a review card.
4. **Lesson summary** (`docs/ui/07-lesson-chapter-and-tier-complete.md` §5.3), e.g. "Decisions 7/8 right · Results: 4 won, 3 lost".
5. **First losers in Chapter 1:** from Level 3 on, the first correct buy decisions that lose, at the share from §3.11, worded without odds. `CONTENT-FIX-1` does the rest.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1–2

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage VARIANCE from docs/plan/11-phase-1-content-rules.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 ("Variance"), docs/plan/02-how-to-work.md §1 and the "VARIANCE" section in docs/plan/11-phase-1-content-rules.md in full, plus docs/rules/07-variance-and-typed-numbers.md §3.11, docs/ui/03-screen-types.md §3, docs/ui/06-reveal-and-hearts.md §5.1b, docs/ui/07-lesson-chapter-and-tier-complete.md §5.3, docs/ui/09-order-tools-and-other-visuals.md §6.8, §6.10, docs/level-files/ (decision-grid), docs/content-todo/01-rules-from-the-design-review.md (Part 1 and 4.1) and the reference files from docs/rules/05-tests-consistency-and-copy.md §3.8.
Read content/shared/chapter-01-market-basics/level-02-1.yaml to level-02-3.yaml before you write 2-4 — tone and rhythm must match.

Especially important:
- The lesson must be understandable for someone with no prior knowledge at all, and variance must never read as an excuse for bad decisions.
- No profit promises and no rates: nothing may say how often a setup or a decision wins. Where a number is needed for arithmetic, it is labelled as an example.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · the full text of lesson 2-4 to proofread · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** only the **newcomer test, if you have someone to ask** (optional, as in `FUN-PASS`; Claude cannot play someone who has never seen the course):
- Someone without trading knowledge plays 2-3 and 2-4.
- Ask them afterwards: "You decided right and still lost – what does that mean?"
- Expected, in their own words: "One single trade says little; what counts is whether the decision was good."
- And: "How often does a setup work?" Expected: "I'd have to find out from my own trades."
- If they cannot say that, Claude revises the lesson.

**Where to look** (optional; the report links each):
- Lessons 1·2-3 and 2-4: does the grid make "right call, lost anyway" clear without any number?
- A Chapter 1 decision that was right and loses (link in the report): is it immediately clear that you were *right*?

### `OFFER` – Chapter 8 Level 15, account types and rules

**Goal.** Chapter 8 Level 15 "What You'll Actually Be Offered" teaches the knowledge for the step into a real account (decisions A, B, C).

**Scope**
1. **Part 1 – renumbering** as a commit of its own:
   - Chapter 8 Levels 15–17 become 16–18.
   - The prerequisite chain and every reference move with them.
2. **Part 2 – Level 15 with four lessons** following `docs/course/`. Decisions A–C are made now; nothing is left open.
   - Account types and what each allows. Short selling needs a margin-enabled account.
   - What leverage does to numbers the learner already knows: the ruin arithmetic.
   - The rules against your own plan:
     - the PDT rule against six trades per session;
     - settlement;
     - taxes as a question for an adviser.
   - Practice: the account that fits your own plan.
3. **`content/market_profiles.yaml`** (M17):
   - EU-DE `fee_note` without prices.
   - EU-DE `regulation_note` precise: the negative-balance protection covers CFDs.
   - The US PDT rule at its current state. Research with a source, because the FINRA reform is under way.
   - A new field `checked: <date>`.
   - `timezone` "German time" instead of "CET".
   - `first_minutes` in the same format as `premarket`.
4. **Not here:** the one-sentence additions in Chapter 1 (1·12, 1·13) and in 6·9 are done by `CONTENT-FIX-1` and `CONTENT-FIX-6`.

Detailed prompt: **Appendix E.1**.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1–2

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage OFFER from docs/plan/11-phase-1-content-rules.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decisions A, B, C) and the "OFFER" section in docs/plan/11-phase-1-content-rules.md in full, and docs/content-todo/ (Parts 1–3: the new level is written with skills and the new fields from the start). Then follow the detailed prompt in Appendix E.1 exactly.
For the rule texts in content/market_profiles.yaml: research the current state on the web, name every source with its date in the report, and flag every sentence you are unsure about.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · sources · sentences you are unsure about (for me to check) · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** every place where Claude was unsure (listed in the report with its sources); the plan has no outside reviewer, so you decide.

**Where to look** (optional; the report links each):
- Chapter 8 Level 15 (Settings → Testing → Skip ahead), all four lessons, once with the US profile and once with Germany: informative, no recommendation, no product name, understandable.
