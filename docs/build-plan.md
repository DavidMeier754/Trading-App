# Build plan

The order of work, and a ready prompt for every piece of it.

**One rule: this file's order is the order.** Stages have names, not numbers, because numbers
drifted before — two files each had a "Stage 4" meaning different things, and a reader who
inferred "next" from an integer was sent to the most expensive task on the list. Read the table
top to bottom.

---

## Where the project stands

Measured, not remembered — re-run the commands and the numbers should match.

| | |
|---|---|
| Scalping path | 8 chapters, 144 levels, **388 sub-levels** (Chapter 1's shared 48 included), 5,109 screens |
| Validator | 0 errors, 3 warnings (`python3 tools/validate_content.py`) |
| Self-test | 110/110 (`python3 tools/test_validate.py`) |
| Sizing | 0 of 572 priced positions over the §3.6 cap (`python3 tools/check_sizing.py`) |
| Drill bank | 1 of 15 packs written; 12 of the other 14 on hold |
| Replay bank | specified, nothing written |
| Day Trading, Swing | outlined level by level, no content |
| Application code | Expo app (SLICE + HOME, below): plays all of Chapter 1 — 17 levels, 48 sub-levels with the path-choice lesson — and Scalping Chapter 2 Levels 1–3 (10 sub-levels): 783 screens, every one played end to end in the browser; plus the 49-screen test bench in `demo/all-screens.yaml` |
| Rendered | 783 of 5,109 screens; the other 4,326 have never been drawn |

The last row is why no stage below grows the corpus before its screen types have been seen.

---

## The order of work

| Run | Stage | What | Model | Sessions |
|---|---|---|---|---|
| **NEXT** | **OFFER** | Chapter 8 Level 15 + its renumber | `claude-opus-5` | 1 |
| then | SIZING | The 66 positions over the cap | `claude-sonnet-5` | 2 |
| then | PHRASING | `state` chips in Chapters 3, 6, 7 | `claude-sonnet-5` | 1–2 |
| then | REPLAY-PILOT | One hand-authored replay + validator rules | `claude-opus-5` | 1 |
| then | DRILLS | The 2 remaining unaffected packs | `claude-sonnet-5` | 1 batch run |
| then | REPLAY-BANK | 22 replays | `claude-opus-5` | ~8 |
| then | REVIEW | Both review passes | `claude-opus-5` | 2 |
| **last** | PATHS | Day Trading + Swing Trading | `claude-sonnet-5` | ~30 |

**PATHS is last and gated.** It triples the corpus. A screen-type schema change costs 327 files
today and roughly 980 after it — so nothing in that stage gets cheaper by starting early, and
one thing gets three times dearer. SLICE has run; do not start PATHS until the schema has also
survived a render of every screen type it uses.

### Already done

Their prompts are dead instructions now; the work is in git history and the rules they produced
are in `docs/agent.md` and `docs/schema.md`.

- **The v2 → v3 migration** — validator taught the v3 rules, chapter folders renumbered, the 101
  v2 sub-levels retrofitted onto the v3 level plan.
- **Authoring** — all eight Scalping chapters, 29 blocks, 387 sub-levels.
- **Repairs** — category labels; the plan sheet as one key namespace (24 `plan-card` screens,
  50 keys, all in `docs/schema.md`, with validator rules); exam interactivity; the long/short
  balance.
- **SLICE** (section kept below for its reasoning) — an Expo SDK 57 app at the repo root that
  plays lessons from the YAML as written. It went past one lesson: every screen type on the
  test bench, the looks in `docs/UI.md` §10, sounds and haptics. Where a renderer disagreed with
  `docs/schema.md` (`swipe-deck` cards, `branch` steps, `chart-annotate` labels), the renderer
  was changed, not the schema.
- **HOME** — the home screen of `docs/UI.md` §7.1, §7.2 and §11: the path for Chapter 1 Levels
  1–3 with one ring node per level, the level banner, the HUD (streak, daily XP ring, hearts),
  the tab bar (Learn, Practice, Leaderboard, Account; the last three are placeholders), and
  Settings behind Account with the design picker and the test bench. Progress, streak, hearts
  and settings are kept on the device with AsyncStorage; there is still no backend.
- **PATH** — the map for everything written that plays: all of Chapter 1, the path-choice
  lesson (Level 17-2) as its own node, and Scalping Chapter 2 Levels 1–3. Chapters are folding
  sections with a "Jump to" button; each node shows a symbol for its kind of level; Checkpoints and
  the Final Exam are scored (70 %, Retry / Back to path). Settings has the path row and, for
  testing only, refill hearts and skip ahead. The lesson player holds its content still: a
  screen is centred once and then only moves when the reveal would otherwise cover it
  (`docs/UI.md` §2).

---

## How to run a stage

**Models.** `claude-opus-5` where judgement decides the outcome — a schema, a chapter's voice,
anything invented rather than expanded, any review. `claude-sonnet-5` for work that follows an
established pattern. `claude-haiku-4-5` only for mechanical passes with a checkable result, and
never near a `chart-decision`: 327 files carry one and their arithmetic has to be right to the
cent.

**Effort.** `high` for Opus stages, `medium` for Sonnet ones. Always
`thinking: {type: "adaptive"}`. Never pass `budget_tokens` — it returns a 400 on current models.
Above `high` is not worth it here: this is careful writing plus cent-level arithmetic, not deep
problem-solving.

**Reading, and what it costs.** Every stage is a fresh session that pays for everything it
reads. Keep the rule docs (`agent.md`, `schema.md`, `UI.md`) — those are the rules — and scope
the rest: the chapter's own section of `curriculum.md` found with `grep`, not the whole file;
the block you last wrote plus a few samples, not every sub-level in the chapter; the sub-levels
that teach a called-back concept, not the chapters containing them. Unscoped, a late session
reads ~380K tokens to write ~28K.

**Validation, honestly.** Plain `validate_content.py` must reach 0 errors with no warning naming
a file you touched. `--strict` will still report chapter-wide counts for levels outside your
block; those clear when the chapter is finished. Never edit content outside your scope to
silence a warning.

**After every content stage, check three things by hand.** The validator cannot see any of
them, and they are where real damage has been found: recompute one chart drill's arithmetic end
to end; check one callback against the lesson it claims to reinforce; and read one sub-level as
a beginner. Boredom does not raise a warning.

---

## SLICE — render lesson one on a phone

> **Done** — see *Already done*. Its scope line "No path map, no hearts, no streaks, no XP
> animation" is superseded by HOME. The reasoning below still holds and is why the app exists.

387 sub-levels and 5,095 screens exist, and **not one has ever been rendered.** Every quality
signal on this project comes from a validator that checks structure and arithmetic, and from
reading YAML. Neither can say whether a lesson is legible at phone width or whether it is fun.

**Scope: one file.** `content/shared/chapter-01-market-basics/level-01-1.yaml`, "Your First
Trade" — the first lesson any learner will ever see. It needs **10 screen types** and is the
cheapest complete lesson in the corpus. That floor is measured, not guessed: a renderer needs
~12 types before *any* sub-level plays through, and ~20 before a fifth of them do, because the
content is type-dense by design (`docs/agent.md` §3.4 requires ≥3 types per sub-level). A
smaller slice does not exist.

**Why before everything else.** Content is data and stays changeable forever — this repo has
renumbered chapters, re-sized positions corpus-wide and inserted levels, all with the validator
as the net. But the cost is not uniform:

| Change | Files touched |
|---|---|
| A sentence, a number, a chart | **1** |
| Screens added, removed, reordered | 1 |
| A whole level or chapter | ~4 |
| A screen type's schema — `chart-decision` | **327** (84 %) |
| A screen type's schema — `intro` | **387** (100 %) |

Prose is cheap forever; the schema is not. So the way to avoid rewriting the corpus is not to
perfect the prose first — it is to freeze the schema early, and a schema can only be tested by
rendering it. There is already a worked example of the failure: session state was written into
scenario sentences, and Chapters 2, 4 and 5 had to be rewritten once it became a `state` field.
A small schema question that cost three chapters, and nobody saw it because nobody had seen a
screen.

### Prompt

```
Read CLAUDE.md, then docs/UI.md in full and the header and screen sections of
docs/schema.md. Then read content/shared/chapter-01-market-basics/level-01-1.yaml,
which is the one file this slice has to play.

Build an Expo + TypeScript app at the repo root that plays that sub-level end to end on
a phone, and nothing else. Ten screen types: intro, theory, example, mc, tf, fill-tiles,
match, numeric-input, numeric-mc, chart-decision. Plus the lesson shell around them -
progress, the Check button, the inline reveal from docs/UI.md 5.1, and the summary.

Scope, held hard:
- No backend, no auth, no Supabase, no RevenueCat, no analytics.
- No path map, no hearts, no streaks, no XP animation. A lesson player, nothing more.
- Read the YAML from the repo at build time. Do not transform the content, do not make
  a second copy of it, and do not edit any file under content/.
- Theme per docs/UI.md 10: dark default. Do not invent visual language the doc does not
  have - where it is silent, choose the plainest thing and list it in your report.

The chart is the risky part. chart-decision appears in 327 of 387 files, so its renderer
decides the schema for most of the corpus: 8-12 candles, a volume strip, the decision
index, the level and VWAP overlays, and the outcome played candle by candle after the
choice. Build that one properly; the rest can be plain.

Then run it and play the lesson through twice.

Report - this is the deliverable, more than the code:
1. Every place the schema did not carry: a field a screen needed and did not have, a
   field that turned out ambiguous, anything you had to guess. Be specific enough that
   docs/schema.md could be edited from your report.
2. Screenshots of the chart-decision screen and two others.
3. Your honest read on length: does 14 screens feel right, short, or long?
4. Anything in docs/UI.md that could not be built as written.
Do not change docs/ or content/ in this session. Report first, decide after.
```

**What to do with the report.** Schema changes go into `docs/schema.md` and `docs/UI.md` before
any further content is written — that is the entire point of running this first.

---

## OFFER — Chapter 8 Level 15, and the renumber it forces

The lesson `docs/agent.md` §1 and §7 have referred to since v3 and the path has never had.
Specified in `docs/curriculum.md` for all three paths, 4 sub-levels, not written.

**What is missing, precisely.** One piece exists and must not be duplicated:
`{{market.scalping_note}}` says where retail scalping is really done and why this path chose
stocks — but it is a single theory screen inside a fees lesson (Chapter 3 Level 14-1, screen
12), six levels before anyone opens an account. Everything around it is absent: financial
"margin" appears **zero** times across the 387 written sub-levels, and so do the
pattern-day-trader rule, settlement, tax, starting capital, data access and broker choice. The
whole regulatory reality is two `{{market.regulation_note}}` tokens used in Chapter 1 Level 12,
before the learner has picked a path.

**The line it must not cross.** Orientation, never instruction. It names what a broker offers
and what leverage does to arithmetic the learner already owns; it teaches no CFD, forex or
margin *mechanics*, names no product, compares no provider and recommends nothing (§7). If a
screen would help someone *use* leverage rather than *recognise* it, it is out of scope.

**Two open decisions sit inside this stage** — see "Decisions that gate work" below. The prompt
is written so the content holds under either answer.

### Prompt

```
Read CLAUDE.md, then docs/agent.md §1, §3.6 and §7, docs/schema.md and docs/UI.md in
full, then the Chapter 8 section of docs/curriculum.md - find it with
`grep -n 'Chapter 8 —' docs/curriculum.md` and read that range; the first match is the
scalping one.

Part 1 - the renumber, committed on its own.
In content/paths/scalping/chapter-08-the-trading-day/, Levels 15-17 become 16-18:
git mv each level-15-*.yaml to level-16-*.yaml, 16 to 17, 17 to 18. Highest first so
nothing collides. Update each file's `id`, and repair the `prerequisite` chain so it
reads straight through with Level 15 absent for now (14's last sub -> 16-1). Grep the
repo for anything naming those ids or the old titles and fix it. Run
`python3 tools/validate_content.py`; 0 errors. Commit as "content: renumber chapter 8
levels 15-17 to 16-18" and push to main.

Part 2 - write Level 15, "What You'll Actually Be Offered", 4 sub-levels, per the
curriculum table. Read first, and do not contradict: Chapter 3 Level 10 (the two
ceilings), Chapter 6 Levels 1-2 (the stop, R), Chapter 3 Level 14-1 (borrow
availability, and screen 12's {{market.scalping_note}} - build on it, never repeat it),
and Chapter 1 Level 12 (what it currently says a brokerage account is).

  15-1  The two account types and what each allows. The one that matters: a cash
        account cannot borrow, so it cannot short at all - and 38% of this path's
        decisions are shorts. In Europe, the leveraged wrappers this path did not teach.
  15-2  What leverage does to numbers they already own. R is unchanged - the stop is
        still the stop. The ruin arithmetic is not: a deposit that survives six
        stop-outs on cash does not survive six at 5:1. Use Chapter 3's account sizes.
  15-3  What the rules do to the plan they wrote. {{market.regulation_note}} in place;
        the pattern-day-trader threshold against the six-trade session Chapters 6 and 8
        teach; settled funds against the same. Tax gets exactly one screen: profits are
        taxed, treatment differs by country and holding period, ask an adviser - no
        rate, no jurisdiction rule, no worked example (§7).
  15-4  Practice: choosing the account that fits their own plan sheet.

Non-negotiable:
- No product, platform or provider named. No mechanics for opening or using a
  leveraged account. Nothing phrased as a recommendation. §7 governs every screen.
- Every number obeys docs/agent.md §3.6, including both ceilings and the account cap.
- {{market.*}} tokens for every session time, index and regulation note - never a
  literal clock time, never a jurisdiction claim written in prose.
- Set `reinforces: [3, 6]` per the curriculum table.

Two open product decisions sit inside this level and NEITHER is yours to settle: the
six-trade session against a cash account under T+1, and the 123 shorts a cash account
cannot place. Both have their options written out in docs/agent.md §3.6. Write 15-1 and
15-3 so they hold under any of those options - describe what each account type allows
and what each rule does, without asserting which this path assumes - and list in your
report every screen that would need a second pass once the decisions are made. If you
need the answer to write a sentence, that sentence belongs in the report, not the
content.

Run `python3 tools/validate_content.py --strict`, `tools/test_validate.py` and
`tools/check_sizing.py`; 0 errors, no warning naming a file you wrote. Commit as
"content: chapter 8 level 15" and push to main.

Report: the four subs with their screen mix, every place you used a {{market.*}} token
instead of a jurisdiction claim, and any sentence you were unsure sits on the right side
of the §7 line - flag those rather than deciding them.
```

---

## SIZING — done

`docs/agent.md` §3.6 caps one position at 95 % of the account named in its own file. **All 572
priced positions are within it.** Chapter 1 and Scalping Chapter 2 Levels 1–3 were re-sized when
they were wired into the app (the hard error in `chapter-01-market-basics/level-09-2.yaml` —
500 shares × $12.80 against a $6,000 account — went with them). Scalping Chapter 2 Levels 4–18
took the re-sizing written on the `chapter-2-position-sizing` branch (commit 268ddb4), carried
over onto the state chips the scenarios have used since: every share count lowered, and every
outcome total, numeric question, working line and size-relative sentence that quoted it moved
with it. Chapter 2 now sits at a median of 90.5 % and a maximum of 94.8 % of the account.

The prompt below stays for any chapter written later: run it whenever `check_sizing.py` lists a
breach.

`python3 tools/check_sizing.py --chapter N` lists every breach with each line elsewhere in the
file that names the same share count — 3,332 corpus-wide, which is why this is a script and not
a reading task.

### Prompt (for a chapter that breaches)

```
Read CLAUDE.md and docs/agent.md §3.6 in full - the two ceilings, the account cap, the
per-path table and the price bands.

Run `python3 tools/check_sizing.py --chapter N` and re-size every position it lists so
that shares × decision price <= 0.95 × the account named in that file.

How to re-size, in this order of preference:
1. Lower the share count. Check what the new count does to every other line in the same
   file - check_sizing.py prints them, and a stale share count in a follow-up question
   is the failure mode this tool exists to catch.
2. Shift the whole screen's prices by a constant. Subtracting the same amount from every
   price in a chart preserves every cent-level distance, so stop distances, R-multiples
   and dollar totals stay exactly correct while the position value falls. Keep the
   result inside the path's price band (§3.6).
3. Raise the account named in the file, but only within $5,000-30,000 (§3.6) and only if
   the file's own narrative allows it.

Never change a stop distance to make the arithmetic work - that changes what the lesson
teaches.

After each file, recompute by hand: stop distance, share count, risk in dollars,
R-multiple, and every total the screens quote. Then run
`python3 tools/validate_content.py`, `tools/check_sizing.py --chapter N` and
`tools/test_validate.py`. 0 errors, 0 breaches in your chapter, no warning naming a file
you touched.

Commit as "content: chapter N position sizes" and push to main.

Report: the breach count before and after, which of the three methods you used where,
and every place a share count appeared in prose that you had to update with it.
```

---

## PHRASING — `state` chips in Chapters 3, 6 and 7

Session state belongs in `state` chips (`docs/UI.md` §6.4), not in a sentence bolted onto the
scenario. Chapters 2, 4 and 5 were the original complaint and are now at 100 %. The spread now:

| ch1 | ch2 | ch3 | ch4 | ch5 | ch6 | ch7 | ch8 |
|---|---|---|---|---|---|---|---|
| 0 % | 100 % | 37 % | 100 % | 100 % | 38 % | **16 %** | 74 % |

**Chapter 7 first** — 102 chart decisions, the most of any chapter, at 16 %. Then 6, then 3.
Chapter 1's 0 % is probably correct rather than a gap: it runs line charts and buy/wait
decisions with no session state to put in a chip. Check before changing it.

### Prompt (run once per chapter: 7, then 6, then 3)

```
Read CLAUDE.md, docs/UI.md §6.4 and §4.3, and docs/agent.md §3.4.

In content/paths/scalping/chapter-NN-*/, move session state out of chart-decision
scenario prose and into the screen's `state` chips: day in R, the limit, trades taken,
size, account. Chapters 2, 4 and 5 are already at 100% - read one of their files first
and match how they phrase what is left behind.

What stays in the scenario: what the chart shows and what the learner is looking at.
What moves to chips: the numbers describing the learner's own session.

Two rules from §3.4 that this work exists to serve, and that it is easy to break:
- A scenario describes, it does not conclude. Do not let the shortened sentence become
  three verdict words that answer the question before the chart is read.
- No two consecutive sub-levels may end up with the same sentence shape. Moving state
  out makes scenarios shorter and more alike; vary what remains.

Do not change any chart, price, share count or answer. `git diff` should touch scenario
text and add `state` blocks, nothing else.

Run `python3 tools/validate_content.py` and `tools/check_sizing.py`; 0 errors and no
warning naming a file you touched. Commit as "content: chapter NN scenarios move session
state into chips" and push to main.

Report: the percentage before and after, and any scenario where the state genuinely
belonged in the sentence - those are legitimate and should be listed, not forced.
```

---

## REPLAY-PILOT — one replay, by hand, with its validator rules

The Spot-it tab (`docs/UI.md` §7.7) and the `chart-replay` type (§4.4) are specified; nothing
is written. Format in `docs/schema.md` § Replays, authoring rules in `docs/agent.md` §3.10.

**One replay first, and nothing scales until it holds.** A replay is 40–80 candles, a volume
series, a VWAP series and several stated positions per file — five to eight times the numbers of
a `chart-decision`, with every §3.6 rule still applying to all of them. That is where errors
hide, because no single screen shows them all. Same lesson as `cost-check.yaml`: one written
exemplar before any volume. **Never in a batch.**

### Prompt

```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4
and §7.7 in full. Then read content/paths/scalping/chapter-07-scalping-playbook/
level-02-1.yaml and level-02-2.yaml - the VWAP bounce card and its five fields are the
thing this replay is an instance of.

Write one replay to content/replays/scalping/vwap-bounce-01.yaml: reading level 2
(setup named, card hidden), ~60 bars, one clean VWAP bounce and two decoys that each
fail exactly one named field of the same card.

Then extend tools/validate_content.py with the replay rules from docs/schema.md
§ Replays - every error and warning listed there - and add cases to
tools/test_validate.py proving each one fires, in the style already there.

Non-negotiable, and check each by hand before you report:
- trigger_bar equals the highest filled_at of that setup's own fields. If it does not,
  the replay is ungradeable.
- Each decoy's `fails` names a field of its card, and that field either never fills or
  fills after the decoy's bar.
- Every stated shares × price is inside the 95% account ceiling, and
  tools/check_sizing.py sees the file.
- Candle high >= max(open, close) and low <= min(open, close) on all ~60 bars.
- Prices in the scalping band ($10-$30), median bar volume in 4,000-500,000.
- At most two fields marked `marginal`.

Run `python3 tools/validate_content.py`, `--strict`, `tools/test_validate.py` and
`tools/check_sizing.py`. Commit as "replays: pilot VWAP bounce plus validator rules"
and push to main.

Report: the bar series with each marked moment and what fills at it, the three grades a
learner would get for acting at bars trigger-1, trigger and trigger+2, and your honest
read on whether 60 hand-authored bars is sustainable 22 times per path.
```

**That last question decides the next two stages.** If the format carries, the twelve held drill
packs stay cancelled and REPLAY-BANK proceeds. If authoring proves too expensive at volume,
commission the twelve packs instead — the manifest and `tools/build_drill_batch.py` still work.

---

## DRILLS — the two packs nothing supersedes

Twelve of the fifteen packs are chart recognition — `charts-structure`, `levels-and-breaks`,
`the-read`, `mixed-daily` and the eight setup packs, **300 of the 370 screens** — and
`chart-replay` does that job better than a frozen drill screen. They are on hold, decided by
REPLAY-PILOT's outcome.

Three are unaffected, because no replay reaches them: all-in cost arithmetic, scanner reading
and trade management are not chart timing.

| Pack | Screens | Status |
|---|---|---|
| `scalping-cost-check` | 20 | ✅ hand-written, clean |
| `scalping-selection` | 25 | commission |
| `scalping-risk-calls` | 25 | commission |

So this is **two Batch API requests**, not fourteen. Drills are independent, order-free and have
no cross-file consistency requirement beyond a concept list — the one part of this build that
suits bulk generation, at 50 % of list price. Build the requests from
`content/drills/packs.yaml` with `tools/build_drill_batch.py`, and validate everything that
comes back: batch output is not exempt from `--strict`.

### Per-request instruction

```
Write [25] drill screens for the pack "[pack id]", covering these concepts:
[concept list]. Format per the drill-pack spec in docs/schema.md.

These are drills, not a lesson: no intro, no theory, no summary - question screens only,
each standing alone. The learner has already been taught this in [chapter/level];
assume it and test it.

Vary the interaction across the pack and vary the difficulty: about a third should be
near-misses where the right answer is "pass" or "no trade". Answer-key hygiene per
docs/agent.md §3.5 applies to the pack as a whole - check the distribution across all 25
before you finish. Price and volume bands per §3.6. Every number arithmetically sound.
```

---

## REPLAY-BANK — 22 replays

Per the table in `docs/curriculum.md` § Replays: two per Chapter 7 setup card (16), four mixed
level-3, two `allow_none` sessions. Three per session, grouped by card so the five fields stay
in mind. **Only after REPLAY-PILOT says the format carries.**

### Prompt

```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4.
Read content/replays/scalping/vwap-bounce-01.yaml - the pilot - and the last replays you
wrote, so bar rhythm and decoy style continue rather than restart. Read the Chapter 7
level that teaches [card], for the five fields.

Write [3] replays for [card] to content/replays/scalping/, at reading level [1/2/3] per
the table in docs/curriculum.md § Replays.

Every rule in docs/agent.md §3.10 binds. The two that go wrong silently:
- A decoy you cannot explain is noise, not difficulty. Each fails exactly one named
  field, and the note says which. If you cannot name it, cut the decoy.
- The arithmetic spreads across 60 bars and no single screen shows it all. Recompute
  every stop distance, share count, R-multiple and filled_at from the bars as written.

Verify each file alone before writing the next. Run `validate_content.py --strict`,
`test_validate.py` and `check_sizing.py`; 0 errors, no warning naming a file you wrote.
Commit as "replays: [card] levels [n]" and push to main.

Report: per replay, the marked moments and their labels, which field each decoy fails,
and anything in the placement table you could not honour and why.
```

---

## REVIEW — two passes, per path

**Pass A — does it teach?** The review that produced the original 28 findings: terms before
definition, callbacks to things not yet taught, difficulty curve, repeated prompts, distractors
that give it away, chart answers that do not follow, worked numbers, playbook setups against the
sources in `docs/agent.md` §4, `{{market.*}}` tokens, and whether a beginner would be bored,
patronised or confused.

**Pass B — does it survive contact with reality?** Everything in Pass A checks the course
against *itself*. Four findings on this path were of a different kind — the leverage lesson §1
promised, 123 shorts the described account cannot place, the pattern-day-trader rule against a
six-trade session, settlement against 95 %-of-cash positions — and **not one Pass A item would
have surfaced any of them.** All four came from a human asking "but could someone actually do
that?". Pass B is that question, made systematic:

- Every fixed decision in §1 and rule in §7, checked against the corpus. Not "is it stated" —
  "is it delivered, in the right place, at the right weight".
- Every trade the content teaches, against the account the content describes. Can the learner
  place it? With which account, how much capital, which permissions?
- Every rule taught, against the rules that actually bind in each market profile.
- The handover: at the last screen, what does the graduate still not know that stands between
  them and the first thing the path tells them to do?

Two method notes, learned by getting them wrong:

1. **Match counts lie; read the hits.** A scan reported `margin` and `settle` as covered. Every
   match was the word *marginal* and the verb *settles* ("the candle settles the argument").
   Both appear zero times in the financial sense. A grep result is a place to look, never an
   answer.
2. **Grep the concept, not the word.** The same scan reported the instruments lesson absent; it
   exists inside `{{market.scalping_note}}`, which contains neither "leverage" nor "CFD". Before
   concluding something is missing, ask what it would be *called* in this corpus.

**Run each pass as a findings list first, approve, then fix — never as one combined pass.** And
Pass B is the one a model is worst at, because it needs knowledge from outside the repository:
treat its output as a shortlist for someone who has actually placed these trades, not a verdict.
Where it cannot decide, it should name the decision, as `docs/agent.md` §3.6 does.

### Prompt — Pass A

```
Read CLAUDE.md and the docs it names. Then read the complete [path] path in path order:
content/shared/chapter-01-market-basics/, then content/paths/[path]/ chapters 2-8, every
sub-level, as a learner with zero prior knowledge.

Check: terms used before definition across chapters; callbacks to things not yet taught;
the difficulty curve, and whether any level jumps or stalls; question types and prompts
repeated across chapters; distractors that give the answer away; chart-decision "best"
answers that do not follow from the lesson just given; worked numbers; the Chapter 7
playbook setups against the sources named in docs/agent.md §4; {{market.*}} tokens used
where required; anything a beginner would find boring, patronising or confusing; whether
anything is repeated enough to stick; and whether the questions are answerable by someone
who genuinely understood the lesson and nothing more.

Run `python3 tools/validate_content.py`, `--strict`, `tools/check_sizing.py` and
`tools/test_validate.py` first, so you do not re-report what a tool already catches.

Then give a numbered findings list, most important first, naming the file and screen for
each. Change nothing. Wait for approval before any fix.
```

### Prompt — Pass B

```
Read CLAUDE.md, then docs/agent.md §1, §3.6 and §7 in full, and content/market_profiles.yaml.

This pass does not check whether the course teaches well - Pass A does that. It checks
whether the course survives contact with reality. Work these four questions across the
whole [path] path:

1. Every fixed product decision in §1 and every rule in §7: is it *delivered* - in the
   right place, at the right weight - not merely stated in the docs? Name the file and
   screen where each is delivered, or report it as unmet.
2. Every trade the content teaches, against the account the content describes. Can a
   learner actually place it? With which account type, how much capital, which
   permissions? Name any trade the described account cannot execute.
3. Every rule the content teaches, against the rules that actually bind in each market
   profile: position limits, trade limits, settlement, borrow, and whatever
   {{market.regulation_note}} promises.
4. The handover. At the last screen of the path, what does the graduate still not know
   that stands between them and the first thing the path tells them to do?

Two method rules, and ignoring them is how this pass fails:
- Match counts lie. Read the hits. A previous scan reported `margin` and `settle` as
  covered; every match was the word "marginal" and the verb "settles". Both appear zero
  times in the financial sense. A grep result is a place to look, never an answer.
- Grep the concept, not the word. The same scan reported the instruments lesson absent;
  it exists inside {{market.scalping_note}}, which contains neither "leverage" nor
  "CFD". Before concluding something is missing, ask what it would be called here -
  tokens, synonyms, the curriculum's own vocabulary.

You are worst at this pass, because it needs knowledge from outside this repository.
Where you cannot decide, say so and name the decision rather than guessing - the way
docs/agent.md §3.6 records the margin and settlement conflicts.

Numbered findings list, most important first, file and screen for each. Change nothing.
```

---

## PATHS — Day Trading and Swing Trading

> **Gated. Do not start until the schema has survived a render of every screen type it uses.**
> SLICE has run; Chapter 1 and Scalping Chapter 2 Levels 1–3 play in the app so far. This stage triples the
> corpus — ~770 further sub-levels — written against a screen contract mostly never rendered. A schema fix costs 327 files today and roughly 980 afterwards.

Chapters 2–8 of each, following the tables in `docs/curriculum.md`. Structurally they mirror
Scalping, which makes mechanical generation tempting. Resist it: the timeframes, holding
periods, price bands and the entire psychology chapter differ, and a swing lesson that reads
like a scalping lesson with the word swapped is worse than no lesson.

Run it as SLICE-validated blocks of 4–6 levels, one session each, same shape the Scalping path
used. Add this clause to every block prompt:

```
The Scalping path's Chapter [N] covers the same ground for a different holding period.
Read it for structure, pacing and screen mix - then write for this path's timeframe from
scratch. Do not port examples across. Where the honest answer is that this path does the
same thing scalping does, say so in one screen and move on rather than padding the level.
```

**One rule changes for these paths.** §3.6's concentration teaching is scalping's: on swing the
risk budget binds, not the account ceiling, positions run 10–50 % of the account, and **several
are open at once** — so total exposure and total open risk are what matter, and a per-position
cap barely binds. Neither is checked by any tool yet; see the decisions below.

---

## Decisions that gate work

These are product and compliance calls, not authoring ones. Each is recorded in full in
`docs/agent.md` §3.6 or §7 with its options; none can be settled by a content session, and
OFFER cannot be finished while the first two are open.

| # | Decision | Blocks |
|---|---|---|
| A | **Does the path finish at a process, or at a person who can start?** §1.1 promises "ready to paper-trade with a real process" and delivers it; account setup, platform settings and data access appear zero times, consistent with that promise. Answer this and B, C and OFFER become one piece of work. | OFFER, and README items 10, 12, 13 |
| B | **123 shorts need a margin-enabled account and the path never says so.** A cash account cannot borrow. Three options in §3.6; the cheapest keeps every drill and costs §3.6 its no-margin claim. | OFFER 15-1 |
| C | **The six-trade session does not reconcile with a cash account under T+1.** Three options in §3.6, none free. | OFFER 15-3 |

One constraint binds today under every answer: **the app must never imply it prepared the
learner for a step it did not cover.**

### Two validator rules that do not exist yet

`validate_content.py` and `check_sizing.py` check the single-position ceiling only. That is the
binding constraint on scalping, so the check has teeth there. On day trading and swing it is
not, and nothing checks what does. **Both must exist before PATHS:**

1. **Per-trade risk** — `shares × stop distance ÷ account` within roughly 0.5–2 % wherever a
   file names an account and a stop. A swing drill risking 8 % per trade passes today.
2. **Total open exposure and risk** — for any file showing more than one position at once, the
   sums against the account. Swing runs several holdings by design; four at 25 % each breaches
   nothing while deploying the whole account.

---

## What "done" means

Per `docs/agent.md` §1.1, the graduate can pick stocks, read context, recognise setups, size
from risk *and* account, place entry, stop and target, follow their limits, journal, and judge
themselves by expectancy. They are **not** a profitable trader — Chapter 8 ends with a 30-day
simulator plan, not a certificate. Any screen that promises otherwise is a bug, and it is the
one bug the validator will never catch.

Where the promise stops is decision A above, and until it is answered the honest statement of
scope is: *a process you can paper-trade with*, not *a person ready to open an account*.

---

## Cost, honestly

The whole remaining content programme is in the low tens of dollars of API spend at the model
prices above. Nothing here is worth downgrading a model over, and SLICE is the only stage whose
cost is mostly *your* time rather than tokens.

The real budget is review attention, and the stages differ sharply in how much they need:

- **Readable end to end:** PHRASING, DRILLS, OFFER. Diffs you can check by eye.
- **Not readable end to end:** SIZING changes hundreds of numbers across two chapters, and the
  only honest check is `tools/check_sizing.py` plus spot-reading. REPLAY-BANK spreads
  arithmetic over 60 bars per file, which is why REPLAY-PILOT exists before it.
- **Cheapest visible improvement:** PHRASING. One or two sessions, no arithmetic risk, and it
  fixes something a learner actually notices. SIZING fixes something they would notice only by
  doing the sums.

If the budget is attention rather than money, the order in the table is already sorted for it —
with one exception you made knowingly: SLICE ran first because of what it *de-risks*, not
because it was cheap.
