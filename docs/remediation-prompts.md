# Remediation — ready-to-run prompts

Six stages that finish the written Scalping path. One filled-in prompt per stage or
block; copy the next un-done one verbatim into a session and run it.

**These are not `docs/build-plan.md`'s stages.** That file's Stage 0–6 *built* the path
and are done. These stages *repair* what the control pass found in the built path. The
numbering continues the control pass's own list: Stage 1 (hard errors, validator rules,
docs) is already committed.

**Before you paste, check four things:**

1. **Push target.** Every prompt commits and pushes straight to `main`, so you do not have
   to move anything by hand. Each stage is validated before it is pushed; if you would
   rather review a stage first, change `push to main` to your branch name in that one
   prompt.
2. **Model and effort.** Named per stage below, with the reason. Set them in the session
   before pasting — they are not part of the prompt body. Treat the model as a floor:
   bump a Sonnet stage to `claude-opus-5` if it fights you.
3. **New session.** Stated per stage. The default is yes: these stages touch different
   parts of the corpus and a fresh context is cheaper than a polluted one.
4. **The docs prefix caches.** Every prompt opens with the same reading instruction.
   Keep it byte-identical and first so the ~18K tokens of `agent.md` + `schema.md` +
   `UI.md` read at 10% of list price on the second call onward.

Work top to bottom. Stage 4 depends on Stage 2's category labels being settled and
Stage 3's plan-sheet keys being fixed; Stage 7 depends on everything else being final.

**Rough size:** ~17 sessions. Stage 4 is nine of them and the bulk of the spend. The
cheap wins are Stages 2, 5 and 6 — do those first if you want the path readable before
you commit to the expensive one.

---

## ☑ Stage 2 — The category labels, and the rule that forced them — **done**

**Model: `claude-opus-5` · effort `high` · new session · ~1 session**

Opus because the rule it writes is inherited by Day Trading and Swing Trading, which are
~680 unwritten sub-levels. Getting it wrong here is the expensive mistake. The session
itself is short — this is the cheapest stage in the list.

**What it fixes.** 19 levels that `docs/curriculum.md` marks `R` carry
`category: new-theory` on their first sub. The notes say why, openly: otherwise the
validator warns "more than 2 review-type sub-levels in a row". The rule and the
curriculum are mutually unsatisfiable — measured across all three path tables, the
curriculum's own layout demands runs of up to **6** consecutive review sub-levels
(Scalping Ch7: L17 Capstone 3R + L18 Chapter Review 2R + L19 Final Exam 1F). The rule
allows 2. Consequence: repetition runs at 10–23 % of sub-levels against `agent.md`
§3.2's ~30 % target, and any drill tagged `new-theory` is weighted wrong by the Practice
hub and the spaced-repetition engine (`docs/UI.md` §7.3).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full.

You are fixing a rule conflict, not content. docs/agent.md §3.2 says "never more than
2 review-type subs in a row (repetition / test / final-exam)". docs/curriculum.md
places a 2-sub practice level directly before a 1-sub Checkpoint in almost every
chapter, and ends chapters with Capstone (3R) + Chapter Review (2R) + Final Exam (1F).
Those are 3 and 6 review subs in a row. The rule cannot be satisfied by any content
that follows the curriculum.

The content currently evades it: 19 levels the curriculum marks R have
category: new-theory on their first sub. Find them all with a script rather than by
hand — compare each level's curriculum marking against the categories of its sub-levels.

Step 1. Measure, before you decide anything. For each of the three path tables in
docs/curriculum.md, compute the longest run of consecutive review sub-levels the table
demands, and where it occurs. Report the numbers.

Step 2. Decide the rule. The rule exists so a learner does not go a long stretch with
no new material; a Checkpoint is a distinct event, not more of the same. Whatever you
choose must be satisfiable by the curriculum exactly as written for all three paths —
or, if you conclude the curriculum is what is wrong, change the curriculum instead and
say so. Do not pick a threshold that merely clears today's content; derive it from the
curriculum's own worst case and leave no headroom you cannot justify. Write one
paragraph in docs/agent.md §3.2 explaining the rule and why that number.

Step 3. Implement it in tools/validate_content.py, and add a self-test to
tools/test_validate.py that fails if the rule stops firing — one case that trips it and
one that must not.

Step 4. Put the 19 categories back to what docs/curriculum.md says. Change nothing else
in those files: the category field only, not a screen, not a word of copy.

Step 5. Two warnings are currently open that this should close:
chapter-03 level-12-1 and chapter-08 level-10-1. Confirm they are gone.

Then run `python3 tools/validate_content.py` and `python3 tools/test_validate.py`.
0 errors, all self-tests pass, and the only remaining warnings are the four
scenario-phrasing ones that Stage 5 owns. Commit as
"fix: make the review-run rule satisfiable, restore the 19 practice categories"
and push to main.

Report: the measured worst case per path, the rule you chose and why that number, the
19 files, and the repetition share per chapter before and after.
```

---

## ☐ Stage 3 — The plan sheet, as one document

**Model: `claude-opus-5` · effort `high` · new session · ~1–2 sessions**

Opus because this is a design decision spanning eight chapters, and because
`docs/UI.md` §3 calls the plan sheet "the single strongest engagement device in the
app" — the thing a six-month learner is supposed to be building. It is currently 16
unrelated forms.

**What it fixes.** 16 `plan-card` screens use 47 distinct field keys; only 8 keys appear
more than once. Nothing the learner writes in Chapters 1–4 is ever shown back. Three
concrete breakages: `chapter-07/level-01-3.yaml` renders a `plan-sheet` keyed
`name/context/entry/stop/target/invalidation` while its own `plan-card` writes
`card_name/card_context/…`, so the sheet can never display what was just typed;
`chapter-08/level-17-1.yaml` — the graduation screen, which `curriculum.md` specifies as
"the user's finished `plan-sheet`" — shows hard-coded example values; and Chapter 7 has
the learner write **one** playbook card while Chapter 8 Level 14 asks them to pick
"two of your eight cards".

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
every plan-card and every plan-sheet screen in content/ — find them with
`grep -rln "plan-card\|plan-sheet" content/`. There are 16 of them; read all 16, they
are the whole subject of this task.

docs/UI.md §3 says a plan-card "persists to the profile, re-appears (pre-filled,
editable) in later chapters, and is exportable". Today that is false: the 16 cards use
47 different field keys and only 8 keys are ever written twice, so almost nothing the
learner types is shown back to them.

Step 1. Design one key schema for the whole path and write it into docs/schema.md as
part of the plan-card spec. Group the keys by what they describe (the learner's
practice setup, their cost limits, their read, their session limits, their playbook
cards, their simulator and live plan). Every key a later chapter displays must be a key
an earlier chapter wrote. Decide explicitly what happens when a chapter revisits a
field the learner already filled — pre-filled and editable, or a second dated value —
and write that down too.

Step 2. Re-key all 16 screens to that schema. You may rename keys freely; you may not
change what a card asks the learner for, or its copy, unless the schema forces it.

Step 3. Fix the three breakages:
- chapter-07 level-01-3: the plan-sheet walkthrough and the plan-card must use the
  same keys.
- Chapter 7 writes one card but Chapter 8 level-14-1 asks the learner to choose two of
  eight. Make that true. The eight setup levels are 2, 3, 4, 6, 7, 10, 11 and 12 —
  decide where the remaining cards get written and add them, keeping each sub-level
  inside 12–18 screens and 160–260 seconds. If adding seven more plan-cards would
  bloat the chapter, say so and propose the smaller thing that still makes Chapter 8's
  sentence honest.
- chapter-08 level-17-1: the graduation plan-sheet must render the learner's own keys,
  not example values.

Step 4. Add a validator rule: every key a plan-sheet component renders must be written
by some plan-card in the same path at an earlier level. Add a self-test for it.

Non-negotiable throughout: 12–18 screens and 160–260 seconds per sub-level, answer-key
hygiene per docs/agent.md §3.5, and no clock times written literally.

Run `python3 tools/validate_content.py` and `python3 tools/test_validate.py`. 0 errors,
self-tests pass, and no new warning names a file you touched. Commit as
"fix: one plan sheet across all eight chapters" and push to main.

Report: the key schema as a table, which chapter writes and which re-reads each key,
what you did about Chapter 7's eight cards, and anything you could not reconcile.
```

---

## ☐ Stage 4 — Position sizes

**Model: session A `claude-opus-5` effort `high`; sessions B–I `claude-sonnet-5` effort `high`**
**· new session each · 1 + 8 sessions**

This is the expensive stage and the only one that touches arithmetic at scale. Session A
makes one decision and writes one script; sessions B–I apply it per chapter. Sonnet is
enough for B–I **only because** the script computes every number and the model rewrites
prose around fixed values — if you skip the script, run them on Opus.

**What it fixes.** Simulated positions sit at 89–97 % of the stated account (median per
chapter). In Chapter 2 all 89 chart-decisions exceed 50 % and 84 exceed 90 %; the
largest is 1,700 × $11.72 = $19,924 against a $20,000 account. That contradicts the
50 % cap the learner writes on their own plan card in Chapter 1 Level 16, and makes
Chapter 3's "account ceiling" the normal case rather than the exception it is taught as.

**Read this before session A.** The tension is in the specs, not just the content.
`docs/curriculum.md` gives Scalping "500–2,000 shares, drill prices $10–$30, accounts
$5,000–$30,000". Across that grid only **16 %** of (shares × price × account)
combinations keep a position at or under 50 % of the account. The numbers as specified
force high concentration. There is no edit to the content alone that fixes this.

**Session A is done — the rule is settled.** `docs/agent.md` §3.6 and the Scalping
"Numbers:" line now read: **one position at a time, and `shares × price ≤ 0.95 × the
account named in the file`.** Option (c): the concentration stays and gets taught.
Position value ÷ account = risk-budget % × price ÷ stop distance, so 1 % of the account
against a stop of well under 1 % of the price lands at 70–100 % whatever the account is —
a bigger account cannot fix it, and a smaller position means abandoning either the 1 %
rule or the tight stop that makes a scalp a scalp. What a scalp risks is the stop times
the share count, not the position value, and the fact that one position uses nearly all
the cash is exactly why only one is open at a time. The 5 % left unspent is the buffer
the fill needs at the ask.

Two content consequences sessions B–I must carry, on top of the re-sizing.

**Chapter 1 Level 16-2 stays at 50 — corrected.** An earlier version of this file told
sessions B–I to re-work that plan card to 95 %. That was wrong, and doing it would have
been a defect: Chapter 1 is shared by all three paths and `path-choice` fires *after* its
badge, so Level 16-2 sits two sub-levels before the learner has a path. A scalper's 95 %
handed to a future swing trader is a rule that risks about 7.6 % of the account per trade,
eight times the 1 % Chapter 3 teaches (`docs/agent.md` §3.6, the per-path table). So the
card keeps its conservative, path-neutral 50, **the file needs no re-work at all**, and the
189-share arithmetic built on it stays correct. The scalping path's own Chapter 3 raises the
field to 95 with the reason — revisiting a plan field is already defined as pre-filled and
editable, and a learner watching their own ceiling move *because they now understand why a
scalp is different* is the lesson.

**Chapter 3 Level 10 (scalping)** teaches the account ceiling as the usual answer rather
than the exception — 10-3's "Two ceilings, take the lower" stays, but the "binds only on a
dear name with a tight stop" framing goes — and says what a halt or a gap does to a
position worth nearly the account, because a stop is an order, not a guarantee. That is
session D, and it is the file that now carries the 50 → 95 revision. Do not leave it to a
later pass.

`tools/check_sizing.py` and a chapter-level validator warning now enforce the line.
**As measured now: 66 of 572 priced positions breach it** — 60 in Chapter 2, 6 in Chapter 1,
one of those over 100 % (`chapter-01/level-09-2.yaml` screen 4, $6,400 of stock against a
$6,000 account). Chapters 3–8 are clean. 100 more name no account at all, which makes them
unchecked rather than exempt — name the account when you re-size them.

Both tools check the **ceiling only**, which has teeth on scalping because that is the
binding constraint there. On day trading and swing the risk budget binds instead and
nothing checks it (`docs/agent.md` §3.6, last bullet) — that second check has to exist
before Stage 5 writes either path.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
content/shared/chapter-01-market-basics/level-16-2.yaml and
content/paths/scalping/chapter-03-orders-costs-position-size/level-10-1.yaml through
level-10-4.yaml. Those four files are what the drills have to stop contradicting.

Simulated positions across the path sit at 89-97% of the stated account. In Chapter 2
every one of the 89 chart-decisions is over 50% and 84 are over 90%. Chapter 1 has the
learner write "most of the account in one position: 50%" on their own plan card;
Chapter 3 teaches the account ceiling as the case that binds only on a dear name with a
tight stop. The drills model the opposite of both, about 400 times.

This is not only a content problem. docs/curriculum.md specifies 500-2,000 shares,
drill prices $10-30 and accounts $5,000-30,000; only about 16% of that grid keeps a
position at or under half the account. Verify that number yourself before you go on.

Step 1. Decide, and write the decision into docs/agent.md §3.6 and the Scalping
"Numbers:" line in docs/curriculum.md. The options, none of which is free:
  (a) smaller share counts — breaks the stated 500-2,000 range at the low end;
  (b) larger accounts — breaks the stated $5,000-30,000 range, and you must check it
      does not smuggle in margin, which docs/agent.md §7 forbids;
  (c) keep the concentration and teach it: a cash-account scalp uses most of the cash
      for sixty seconds, which is exactly why only one can be open at a time. This is
      defensible — a scalper's risk is the stop, not the position value — but it
      contradicts Chapter 1's plan card, so that card and Chapter 3's framing would
      have to change with it.
Pick one. Whatever you pick, Chapter 1's plan card, Chapter 3 Level 10's teaching and
every drill must end up saying the same thing. State the rule as a number a validator
can check.

Step 2. Write tools/check_sizing.py: for every chart-decision in the corpus it reports
the file, the share count, the decision price, the account named in that file, the
position as a percentage of it, and — this is the part that matters — every other place
in the same file that writes that share count out in prose. There are roughly 3,300
such places corpus-wide, which is why this is a script and not a reading task.

Step 3. Add the rule from step 1 to tools/validate_content.py as a chapter-level
warning, with a self-test. The existing rule only catches positions over 100%.

Do not change any content in this session. Commit the decision, the script and the
validator rule as "docs: settle the position-sizing rule, add the sizing checker" and
push to main.

Report: the rule you chose and the argument for it, the 16% figure as you measured it,
and a table of every chapter's current median concentration so the next sessions know
what they are aiming at.
```

Then, once per chapter, in a fresh session — substitute `<N>` and the folder:

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the position-sizing rule that was just added to docs/agent.md §3.6, and run
`python3 tools/check_sizing.py` filtered to chapter <N>.

Bring chapter <N> into line with that rule. For every chart-decision whose position
breaches it, choose a new share count and rewrite every number that depends on it:
the outcome's dollar total, any numeric question that prices the same position, any
story or example that names the size, and the file's notes line.

Rules for the new share count:
- Keep the per-share move and the chart exactly as they are. You are changing how many
  shares, never what the price did.
- Round to something a person would actually type: hundreds, or fifties below 500.
- Vary it. Do not give every decision in the chapter the same count — the corpus
  already leans on a handful of round numbers and this is a chance to spread them.
- The account named in the file stays unless the rule says otherwise.

After each file, recompute every figure in it from the numbers as written — stop
distances, R-multiples, dollar totals, percentages — and fix rather than report. The
arithmetic is the whole risk in this task: a wrong total in a drill is worse than the
concentration you are fixing.

Run `python3 tools/check_sizing.py` for this chapter and get it clean, then
`python3 tools/validate_content.py` for 0 errors with no new warning naming a file you
touched. Commit as "content: chapter <N> position sizes" and push to main.

Report: how many decisions you re-sized, the chapter's concentration before and after,
the spread of share counts you ended up with, and any file where the rule and the
lesson pulled against each other.
```

---

## ☐ Stage 5 — Scenario phrasing, via state chips

**Model: Chapter 2 `claude-opus-5` effort `high`; Chapters 4 and 5 `claude-sonnet-5` effort `medium`**
**· new session each · 3 sessions**

Opus for Chapter 2 because it sets the chip convention the other two copy — the same
first-block logic `docs/build-plan.md` uses. Cheap stage overall.

**What it fixes.** Chapter 2 ends **all 89** chart-decision scenarios on the same
sentence shape ("Your account is $20,000 and you are sizing N shares."); Chapter 4 does
it in 78 of 88, Chapter 5 in 61 of 66. The mechanism for this already exists and is
already used well: `state` chips (`docs/UI.md` §6.4) carry session state above the chart.
Chapter 8 uses them on 74 % of its decisions, Chapter 6 on 38 %, Chapter 2 on none. The
validator now warns on exactly these three chapters.

Do this **after** Stage 4 if you are doing both, or you will rewrite the same sentences
twice.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
six chart-decision screens from
content/paths/scalping/chapter-08-the-trading-day/ — that chapter uses state chips on
74% of its decisions and is the model for this task. Read docs/UI.md §6.4 and the
`state` entry in docs/schema.md carefully before you write anything.

Chapter <N> ends almost every chart-decision scenario on the same sentence, naming the
account and the share count. Run `python3 tools/validate_content.py` and you will see
the warning with the exact count. The scenario prose is carrying information that
belongs in state chips.

Move it. For every chart-decision in the chapter:
- Put session state into `state`: the share count, the account when it matters, the
  day's result in R, the limit, the trade count, the quote width. 1-3 short chips,
  per the schema.
- Rewrite the scenario so it describes only what is on the chart and in the market.
  docs/agent.md §3.4: a scenario gives the observable facts and does not stack verdict
  words that answer the question before the chart is read.
- Then make the scenarios different from one another. This is the actual point of the
  task — not moving text into a field, but ending up with a chapter where the sentence
  before the decision is not the same sentence 89 times. Vary the length, the opening,
  what the sentence chooses to mention. Some decisions need no closing sentence at all
  once the chips carry the numbers.

Do not change any chart, any share count, any outcome figure or any best/reasonable
answer. This is phrasing and the state field only. If you find yourself wanting to
change a number, stop — that is Stage 4's job and it may already have run.

Run `python3 tools/validate_content.py`. The scenario-shape warning for this chapter
must be gone, 0 errors, and no new warning naming a file you touched. Commit as
"content: chapter <N> scenarios move session state into chips" and push to main.

Report: the chip vocabulary you settled on, the distinct-closing-sentence count before
and after, and any decision where the chips could not carry what the scenario needed.
```

---

## ☑ Stage 6 — Exams, and the long/short balance — **done**

**Model: `claude-opus-5` · effort `high` · new session · 2 sessions**

Opus both times: this is authoring, not editing — new exam questions and new synthetic
charts, both of which have to be arithmetically sound and have a defensible best answer.

**What it fixes.** Tests and final exams run 35 % interactive screens against 64–68 % in
the lessons. Two outliers: Chapter 1's final exam has **no** `chart-decision` at all —
6 of its 12 questions are plain `mc` — in the chapter that taught buy/wait and
long/short/no-trade on charts, and it is the screen set that carries the badge and the
path choice. Chapter 3's second checkpoint (`level-12-1`) has no chart interaction of
any kind. Separately, the path is 214 long against 105 short (Chapter 8 is 25:3), so a
learner who always answers "long" on a directional chart is right about twice as often
as one who always answers "short".

**Session 1 — the two exams:**

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
content/shared/chapter-01-market-basics/level-17-1.yaml and
content/paths/scalping/chapter-03-orders-costs-position-size/level-12-1.yaml, and the
final exams of chapters 5 and 8, which are the two best in the corpus at 46% and 57%
interactive screens.

Across the path, tests and final exams run 35% interactive question types against
64-68% in the lessons. Two are outliers. Chapter 1's final exam has no chart-decision
at all and six of twelve questions are plain mc — in the chapter that taught buy/wait
and long/short/no-trade on charts, and immediately before the badge and the path
choice. Chapter 3's level-12-1 has no chart interaction of any kind.

Rewrite both so they test the same learning goals through the interactions the chapter
actually taught. Keep the question count (12 and 10), keep intro.counter and
summary.total equal to it, keep the pass mark and the hearts, keep the learning goals
in the header. Chapter 1's exam must end badge then path-choice, with no tier.

What to aim for: at least a third of the questions interactive, with at least two
chart-decisions in each, and no more than two mc in a row. Chapter 1 uses kind: line
charts and the Buy/Wait variant where that is what the level taught, and long/short/
no-trade where Level 13 taught it. Chapter 3's exam is about orders, costs and sizing,
so order-build, depth-ladder and chart-annotate are the natural fits.

Every new chart is synthetic and must satisfy docs/schema.md's chart conventions:
8-12 bars, decision_index between 4 and 7, high >= max(open, close), low <= min, the
outcome visible in the bars after the decision. Every number must be arithmetically
checkable from the file. Answer-key hygiene per docs/agent.md §3.5 applies to each exam
as a whole — check the correct-option positions and the true/false split across all the
questions before you finish.

Run `python3 tools/validate_content.py` for 0 errors with no new warning naming either
file. Commit as "content: make the Chapter 1 and Chapter 3 exams test what was taught"
and push to main.

Report: the type mix of each exam before and after, which learning goal each question
now covers, and the answer-key distribution.
```

**Session 2 — the long/short balance — done.** 199 long / 123 short, worst chapter 1.85:1;
the split is now a chapter-level validator rule (`MAX_DIRECTION_RATIO`, 2:1, from eight
directional decisions up). Prompt kept for the Day Trading and Swing Trading paths:

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full.

Across the path, chart-decisions resolve to 214 long, 105 short and 185 no-trade.
Chapter 8 is 25 long against 3 short; Chapter 5 is 34 against 10. A learner who always
answers "long" on a directional chart is right about twice as often as one who always
answers "short". docs/agent.md §3.5 forbids exactly this kind of answer-key tell in its
other forms — correct-option position, true/false split, length — and this is the same
failure in the one place it is not yet checked.

First measure it per chapter yourself, then decide which chapters need work. Do not
touch no-trade: at 28-47% per chapter it is correctly weighted and the promise that
standing aside is never punished is kept everywhere. This is about the long:short split
within the directional decisions only.

For each decision you flip, you are writing a new chart, not mirroring an existing one.
A short setup is not a long setup upside down: the failed push, the lower high, the
break that traps buyers all read differently. Use the setups the chapter actually
taught. Rewrite the scenario, the outcome and the explanation to match, and keep the
share count and account as they are.

Aim for no chapter worse than about 2:1 either way among its directional decisions, and
say what you targeted and why. Every new chart per docs/schema.md's conventions; every
number arithmetically checkable.

Add a chapter-level validator rule for the split, with a self-test, so this cannot
drift again in Day Trading and Swing Trading.

Run `python3 tools/validate_content.py` and `python3 tools/test_validate.py`. Commit as
"content: balance the long/short split across the path" and push to main.

Report: the split per chapter before and after, how many charts you replaced, and the
threshold you put in the validator.
```

---

## ☐ Stage 7 — The drill bank

**Model: design `claude-opus-5` effort `high`; generation `claude-sonnet-5` effort `medium` via the Batch API**
**· new session · 1 design session + 1 script run**

`docs/build-plan.md` already specifies this stage in detail — read its "Stage 4 — Drill
packs" section, which has the per-request instruction and the Batch API reasoning. What
follows is the design session that must come first; the generation is that section's job
unchanged.

**What it fixes.** `content/drills/` does not exist. `docs/curriculum.md`'s drill table
and `docs/UI.md` §7.3 size it at ~370 screens across 14 packs. Without it the Practice
hub, the daily mix, the setup drills, the weekly challenge and the whole spaced-repetition
engine have no content — the app is a linear path and nothing else, which is the largest
single reason a six-month learner would stop coming back on a day with no new level.

Run this **last**. The drills quote the lessons, so the lessons must be final — which
means after Stages 2–6, not alongside them.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the "Drill packs" table in docs/curriculum.md, the drill-pack spec at the end of
docs/schema.md, and the "Stage 4 — Drill packs" section of docs/build-plan.md.

content/drills/ does not exist. You are not writing the drills in this session — you are
designing the bank so that a batch run can write them without supervision.

Step 1. Turn the curriculum's drill table into a manifest file, content/drills/
packs.yaml or similar: one entry per pack with its id, path, title, unlocked_by
sub-level, screen count, tags, and the concept list that wrong answers mark weak. The
unlocked_by values must name sub-levels that actually exist — check every one.

Step 2. For each pack, pick three exemplar screens from the linear chapter it unlocks
from, by file and screen index. These go into the batch request as the voice and
difficulty reference. Choose them for range, not for quality: one straightforward, one
near-miss where the answer is pass or no-trade, one that needs arithmetic.

Step 3. Write the batch script per docs/build-plan.md's Stage 4: one request per pack,
custom_id = pack id, the docs prefix first so it caches, then the pack's manifest entry,
its exemplars and that section's per-request instruction. Do not invent a new
instruction — that one is already written and reviewed.

Step 4. Extend tools/validate_content.py to validate drill packs: every screen is a
question screen, 10-40 screens per pack, unlocked_by names an existing sub-level, no
intro/theory/summary, and answer-key hygiene per docs/agent.md §3.5 across the pack as a
whole. Add self-tests. Batch output is not exempt from --strict and this is what will
check it.

Step 5. Write one pack by hand — the smallest one — end to end, and validate it. That
pack is the proof the format and the validator agree before you spend a batch run on
the other thirteen.

Commit as "drills: manifest, batch script, validator, and one hand-written pack" and
push to main.

Report: the manifest as a table, which exemplars you chose for each pack and why, the
hand-written pack's validation output, and anything in the curriculum's drill table
that did not survive contact with the existing sub-levels.
```

---

## Cost, honestly

The whole remediation is in the low tens of dollars of API spend at
`docs/build-plan.md`'s prices. Stage 4's nine sessions are most of it, and Stage 7's
batch run is discounted 50 %. Nothing here is worth downgrading a model over.

The real budget is your review attention. Stages 2, 5 and 6 produce diffs you can read
end to end. Stage 4 produces ~400 changed numbers across eight chapters, and the only
honest way to check it is `tools/check_sizing.py` plus spot-reading — which is why that
script is step 2 of its own first session and not an afterthought.

If you want the path readable for the least money: **Stage 2, then Stage 5, then
Stage 6.** Those three are four sessions, no arithmetic risk, and they fix everything a
learner would actually notice. Stage 4 fixes something a learner would notice only if
they did the sums, and Stage 3 and 7 are features more than repairs.
