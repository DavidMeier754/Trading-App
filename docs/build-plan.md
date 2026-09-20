# Build plan — v2 content → v3 curriculum

How the Scalping path got from 101 sub-levels in 6 chapters to the 387 in 8 that
`docs/curriculum.md` describes — and what the same stages still have to do for Day
Trading and Swing Trading.

**Stages 0–3 are done; Stage V is next.** The Scalping path is written — 8 chapters,
387 sub-levels, 5,095 screens, 0 validator errors — and **not one of those screens has
ever been rendered.** Stage V fixes that before anything else is written, because the
schema is the only part of this project that is expensive to change, and rendering is
the only way to test it. Stage 4 is **narrowed to three packs** and Stage 7 is new — the
replay bank (`chart-replay`) supersedes the twelve chart-recognition drill packs, so
those are on hold rather than commissioned. Stage 5 is last and gated. The gap table
below is the job as it stood before Stage 3 — kept because the per-stage prompts still
read against it, and because Stages 5 and 6 face the same shape twice more.

Read this with `docs/curriculum.md` open. That file is the *what*; this file is the
*how, in what order, with which model*.

## The gap Stage 3 closed

| | Before Stage 3 | Target | Now |
|---|---|---|---|
| Chapters | 6 | 8 | **8** ✅ |
| Levels | 62 | 144 | **144** ✅ |
| Sub-levels | 101 | ~387 | **387** ✅ |
| Screens | ~1,400 | ~5,800 | **5,589** ✅ |
| Drill screens | 0 | ~370 | 20 (1 of 15 packs) |

At ~5.6 KB per sub-level file that is roughly **1.6 MB of new YAML**. It is not one
session's work and must not be attempted as one. The unit of work is a **block of
4–6 levels** (`docs/agent.md` §6): write, validate, commit, push, stop.

---

> The path these stages build is now written. What the control pass found in it afterwards —
> and the six stages that repair it — live in `docs/remediation-prompts.md`. Those stages are
> numbered separately and are not the stages below.

## Stage order

**Stages 0–3 are done for Scalping. Stage 4 is next**, and its manifest and tooling
already exist — `content/drills/packs.yaml`, `tools/build_drill_batch.py`, and one
hand-written pack as the proof the format and the validator agree.

Stages 0–2 are prerequisites and are cheap. They run once per *path*, not once per
project: Stage 5 repeats Stage 3's shape for Day Trading and Swing Trading, so the
ordering rule below still binds there — do not start authoring until the validator is
clean, because a stage that produces hundreds of files spreads any mistake into all
of them.

**The numbers are identifiers, not an order.** They were assigned as the stages were written
and they no longer sort. This table is the order. Read it top to bottom; never infer "next"
from a number.

| Run | ID | What | Model | Surface | Rough size |
|---|---|---|---|---|---|
| ✅ | 0 | Teach the validator the v3 rules | `claude-opus-5` | Claude Code | 1 session |
| ✅ | 1 | Renumber chapter folders 5→6, 6→7 | `claude-haiku-4-5` | Claude Code | 20 min |
| ✅ | 2 | Retrofit the 101 existing subs (`reinforces:`, level remap) | `claude-sonnet-5` | Claude Code | 2–3 sessions |
| ✅ | 3 | Author the new content, chapter by chapter | `claude-opus-5` / `claude-sonnet-5` | Claude Code | ~20 sessions |
| **NEXT** | **V** | **The vertical slice — render lesson one on a phone** | `claude-opus-5` | Claude Code | 1–2 sessions |
| then | 8 | Chapter 8 Level 15 + its renumber | `claude-opus-5` | Claude Code | 1 session |
| then | 3′,4′ | The content repairs (README items 3 and 4) | `claude-sonnet-5` | Claude Code | 2–3 sessions |
| then | 7a | Replay pilot — one hand-authored replay + validator rules | `claude-opus-5` | Claude Code | 1 session |
| then | 4 ◐ | Drill packs — **3 of 15 only** (`cost-check` ✅, `selection`, `risk-calls`) | `claude-sonnet-5` | **Batch API** | 1 script run |
| then | 7b | Replay bank — 22 replays per path | `claude-opus-5` | Claude Code | ~8 sessions |
| then | 6 | Zero-knowledge review, both passes | `claude-opus-5` | Claude Code | 2 sessions/path |
| **last** | 5 | Day Trading + Swing paths | `claude-sonnet-5` | Claude Code | ~30 sessions |

**Stage 5 is last, and it is gated.** Writing 770 more sub-levels against a contract nothing has
ever rendered is the most expensive mistake available on this project: a schema change after
Stage 5 costs three times what it costs today. Do not start it until Stage V has run and the
schema survived. This is also why Stage 7a comes before 7b, and why the twelve held drill packs
wait on 7a's outcome.

---

## Model choices, and why

| Model | Context | $/MTok in / out | Use it for |
|---|---|---|---|
| `claude-opus-5` | 1M | $5 / $25 | The validator, the two brand-new chapters, the first block of every chapter, all review passes |
| `claude-sonnet-5` | 1M | $2 / $10 | Blocks 2+ of a chapter whose voice is already set, the mechanical retrofit, the mirrored paths |
| `claude-haiku-4-5` | 200K | $1 / $5 | Renames, sed passes, counting, anything with a right answer you can check by eye |
| `claude-fable-5-1` | 1M | $10 / $50 | Optional. The most capable widely released model — worth it only for Ch5 and Ch8, which have no v2 content to imitate |

The split that matters is **first block vs. later blocks**. The first block of a
chapter decides voice, difficulty ramp, screen mix and how the callbacks are phrased;
every later block copies it. Pay Opus prices for the block that sets the pattern and
Sonnet prices for the blocks that follow it. Getting this backwards is the expensive
mistake — a cheap first block makes twelve expensive ones wrong.

**Do not use Haiku for anything with a `chart-decision` in it.** The Phase-2 review
found 147 chart drills whose arithmetic had to be right to the cent and whose "best"
answer had to follow from the lesson. That is not a Haiku task.

**Effort and thinking.** Always `thinking: {type: "adaptive"}`; never pass
`budget_tokens` — it returns a 400 on current models. Use
`output_config: {effort: "high"}` for Stage 0, Stage 6, and every **Opus** block in
Stage 3 — those are the blocks that set a chapter's voice, invent Ch5/Ch8 from
nothing, or carry a Callback or Final Exam, and they are where deliberation buys
fewer arithmetic and answer-key errors. `effort: "medium"` is enough for the
**Sonnet** blocks, which mostly expand existing subs against a voice already set.
Higher than `high` is not worth it here: this is careful writing plus cent-level
arithmetic, not deep problem-solving.

**Prompt caching.** Every authoring prompt starts with the same ~18K tokens of
`docs/agent.md` + `docs/schema.md` + `docs/UI.md`. Keep that block byte-identical and
first in the prompt so it caches; cached input reads at 10% of list price. Check
`usage.cache_read_input_tokens` on the second call of a session — if it is 0, something
above the docs block is varying and you are paying full price on every call.

**Batch API for Stage 4 only.** Drill screens are independent, order does not matter,
and nothing downstream blocks on them — exactly the shape the Batch API is for, at 50%
of list price. Everything else needs to read files, run the validator and react, so it
belongs in an interactive session.

**Cost.** The whole Scalping expansion (Stages 0–4) lands in the low tens of dollars
of API spend at these prices — the constraint is review attention, not tokens. Do not
economise on model choice here; economise on how many blocks you accept without reading.

---

## Stage V — The vertical slice

**Run this next.** 387 sub-levels and 5,095 screens exist, and nobody has ever seen one. Every
quality signal so far comes from a validator that checks structure and arithmetic, and from
reading the YAML. Neither can tell you whether a lesson is legible on a phone or whether it is
any fun.

**What it is.** An Expo app that plays **one real sub-level end to end on a real device**:
`content/shared/chapter-01-market-basics/level-01-1.yaml`, "Your First Trade" — the first
lesson any learner will ever see. Nothing else. No Supabase, no RevenueCat, no path map, no
hearts economy, no streaks, no login.

**Why that file.** It needs **10 screen types** — `intro`, `theory`, `example`, `mc`, `tf`,
`fill-tiles`, `match`, `numeric-input`, `numeric-mc`, `chart-decision` — which is the cheapest
complete lesson in the corpus, and it still exercises `chart-decision`, the type that appears
in 327 of 387 files. Measured across the corpus, a renderer needs ~12 types before *any*
sub-level plays at all and ~20 before a fifth of them do; the content is type-dense by design
(`docs/agent.md` §3.4). So a smaller slice than this does not exist.

**What it must answer.** These are the questions no amount of YAML review can settle:

- Is a `chart-decision` readable at phone width with 8–12 candles and a volume strip?
- Is 12–18 screens the right length for one sitting, or a slog?
- Does the reveal rhythm (§5 of `docs/UI.md`) carry, or does it get in the way?
- Are two sub-levels really ten minutes?
- **Is lesson one fun?** If the answer is no, that outranks every open item in `README.md`.
- And the structural one: does any screen type need a field the schema does not have?

### Why this comes before the other two paths

Content is data and stays changeable forever — that is what `CLAUDE.md` means by content never
being hard-coded, and this repo has proved it: chapters have been renumbered, positions
re-sized corpus-wide, levels inserted, scenarios rewritten, all with the validator as the net.
But the cost is not uniform, and the asymmetry is the whole argument:

| Change | Files touched |
|---|---|
| A sentence, a number, a chart | **1** |
| Screens added, removed or reordered | 1 |
| A whole level or chapter | ~4 |
| **A screen type's schema** — `chart-decision` | **327** (84 %) |
| **A screen type's schema** — `intro` | **387** (100 %) |

Prose is cheap forever. The schema is not. The way to avoid rewriting the corpus is therefore
not to perfect the prose first — it is to freeze the schema early, and a schema can only be
tested by rendering it. Stage V does not lock the content down; it validates the one thing that
would be expensive to get wrong. After Stage 5 the same mistake costs three times as much.

There is already a worked example of the failure mode: the `state` chips. Session state was
written into scenario sentences, and Chapters 2, 4 and 5 had to be rewritten once it became a
field instead. That is a small schema question that cost three chapters — and nobody saw it,
because nobody had seen a screen.

### Prompt

```
Read CLAUDE.md, then docs/UI.md in full and the header and screen sections of
docs/schema.md. Then read content/shared/chapter-01-market-basics/level-01-1.yaml,
which is the one file this slice has to play.

Build an Expo + TypeScript app at the repo root that plays that sub-level end to end on
a phone, and nothing else. Ten screen types: intro, theory, example, mc, tf, fill-tiles,
match, numeric-input, numeric-mc, chart-decision. Plus the lesson shell around them -
progress, the Check button, the inline reveal from docs/UI.md 5.1, and the summary at
the end.

Scope, held hard:
- No backend, no auth, no Supabase, no RevenueCat, no analytics.
- No path map, no hearts, no streaks, no XP animation. A lesson player, nothing more.
- Read the YAML from the repo at build time. Do not transform the content, do not
  create a second copy of it, and do not edit any file under content/.
- Theme per docs/UI.md 10: dark default. Do not invent visual language the doc does not
  have - where the doc is silent, choose the plainest thing and list it in your report.

The chart is the risky part. chart-decision appears in 327 of 387 files, so its
renderer decides the schema for most of the corpus: 8-12 candles, a volume strip, the
decision index, the level and VWAP overlays, and the outcome played candle by candle
after the choice. Build that one properly; the rest can be plain.

Then run it, on a real device or a simulator, and play the lesson through twice.

Report - and this is the deliverable, more than the code:
1. Every place the schema did not carry: a field a screen needed and did not have, a
   field that turned out ambiguous, anything you had to guess. This is what the slice
   is for. Be specific enough that docs/schema.md could be changed from your report.
2. Screenshots or a recording of the chart-decision screen and two others.
3. Your honest read on length: does 14 screens feel right, short, or long?
4. Anything in docs/UI.md that could not be built as written.
Do not change docs/ or content/ in this session - report first, decide after.
```

**Model: `claude-opus-5`, effort `high`.** Not because the app is hard, but because the
report is the point and it takes judgement to notice a schema that *almost* fits.

---

## Stage 0 — Teach the validator the v3 rules

`tools/validate_content.py` currently enforces the v2 schema and reports 0/0 on the
existing content. It knows nothing about `reinforces:`, the 8 new question types, the
new archetypes, the level-count floors, or the answer-key hygiene rules that the
Phase-2 review had to enforce by hand. Until it does, every rule in the rewritten docs
is a suggestion, and 286 new files will drift.

**Model: `claude-opus-5`, high effort.** This is the file that catches everyone else's
mistakes; it is worth one careful session.

### Prompt

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full.
These were rewritten to v3 and tools/validate_content.py has not caught up.

Update tools/validate_content.py to enforce the v3 schema. Specifically:

1. Header: accept and validate the new optional `reinforces:` field (list of ints,
   each a chapter number lower than this file's own `chapter`, no duplicates).
2. Screen types: add the 8 new question types (swipe-deck, chart-annotate,
   order-build, scanner-pick, compare, branch, journal-row, depth-ladder) and the
   3 new archetypes (recap, plan-card, tier-up) to the type tables, with per-type
   required-field validation exactly as specified in docs/schema.md, and per-type
   entries in the SECONDS estimate table.
3. Add the chapter-level warnings block specified at the end of docs/schema.md:
   level count, sub-level distribution, screen-type variety, callback quota,
   correct-option position skew, true/false split, longest-option-is-correct tell,
   percentage of subs ending on a theory screen, outcome-value clustering,
   difficulty runs, position value vs. account size, and volume magnitude.
4. Add a --strict flag that promotes the chapter-level warnings to errors, so CI
   can gate on them while a chapter is still being written.

Rules:
- Warnings must name the file and, where a screen is at fault, its index.
- Do not change any content file. If a new check fires on existing v2 content,
  report it in your summary rather than editing content to silence it.
- Keep the existing v2 checks working; this is an extension, not a rewrite.

Then run `python3 tools/validate_content.py` and `--strict`, and give me:
the new check list, the counts each one fires on today's content, and which of
those are real problems versus expected v2-vs-v3 gaps.
Do not commit until I have read that summary.
```

Expect this run to light up: 0 files have `reinforces:`, every chapter is below the
15-level floor, and no chapter has a Callback level. Those are Stages 2 and 3, not
bugs. What you are looking for in the summary is anything *else*.

---

## Stage 1 — Renumber the chapter folders

Chapter 5 (Finding the Trade) is inserted before the existing Risk chapter, so two
folders shift up. Chapters 1–4 keep their numbers. This is documented in
`docs/curriculum.md` under the migration note; doing it before any authoring means new
files are written into their final home.

```
content/paths/scalping/chapter-05-risk-and-psychology  → chapter-06-risk-and-psychology
content/paths/scalping/chapter-06-scalping-playbook    → chapter-07-scalping-playbook
```

**Model: `claude-haiku-4-5`.** Pure mechanics with a checkable result.

### Prompt

```
In content/paths/scalping/, rename two chapter folders with `git mv`:
  chapter-05-risk-and-psychology → chapter-06-risk-and-psychology
  chapter-06-scalping-playbook   → chapter-07-scalping-playbook
Do the playbook one first so nothing collides.

Then in every level-*.yaml inside those two folders, update the header `chapter:`
field (5→6 in the risk folder, 6→7 in the playbook folder) and any `chapter_title:`
that names a number. Leave `id:` values alone — ids are level-scoped, not chapter-
scoped; confirm that is true before you rely on it.

Then grep the whole repo (content/, src/, tools/, docs/) for any other reference to
the old folder names or to "chapter 5"/"chapter 6" meaning risk/playbook, and fix
the ones that are now wrong. Report anything ambiguous instead of guessing.

Run `python3 tools/validate_content.py`. It must be 0 errors. Then create the two
new empty folders chapter-05-finding-the-trade and chapter-08-the-trading-day.
Commit as "content: renumber scalping chapters for v3 (insert Ch5, append Ch8)".
```

Verify by eye afterwards: `ls content/paths/scalping/` should show eight folders
numbered 02–08 with no gaps and no duplicates.

---

## Stage 2 — Retrofit the 101 existing sub-levels

The existing content is good — it survived a 28-finding review — but it was written
against v2. Before it can sit next to v3 content it needs:

- a `reinforces:` header wherever the sub-level genuinely reaches back,
- its level/sub numbering remapped onto the v3 level tables in `docs/curriculum.md`,
- nothing else. **This stage does not rewrite lessons.**

The remap is the fiddly part: v2 Chapter 2 has 10 levels and v3 Chapter 2 has 18, so
existing files move (v2 `level-07-1` may become v3 `level-11-1`), and `prerequisite:`
fields move with them. Get it wrong and every cross-reference in the chapter breaks.

**Model: `claude-sonnet-5`.** Mechanical, but it needs the whole chapter in context at
once — 50 files is ~80K tokens, comfortable in a 1M window. One session per chapter.

### Prompt (run once per chapter, 1–4 and 6–7)

```
Read CLAUDE.md, docs/agent.md, docs/schema.md, and the Chapter N table in
docs/curriculum.md.

Retrofit content/<path>/chapter-NN-<slug>/ onto the v3 level plan. Two jobs only:

1. RENUMBER. The v3 table in docs/curriculum.md gives this chapter's final level
   list. Map each existing sub-level onto the v3 level whose "Teaches" column it
   already covers. Rename files with `git mv` to their v3 level-LL-S.yaml name,
   update each file's `id:` and `prerequisite:` to match, and keep the within-level
   sub order. Levels in the v3 table with no existing file stay empty for now —
   Stage 3 fills them. Print the full old→new mapping table before you touch
   anything and stop for my go.

2. REINFORCES. Add the `reinforces:` header field to every sub-level that actually
   reaches back to an earlier chapter — judged by what the screens do, not by what
   would be nice. Do not add screens, do not reword anything, do not add the field
   to files that do not earn it.

Do not change screen content in this stage at all. `git diff --stat` should show
only header lines changing, plus renames.

Run `python3 tools/validate_content.py --strict` and report which chapter-level
warnings remain (level count and callback-quota warnings are expected — Stage 3
fixes those). Commit as "content: retrofit chapter N onto v3 level plan".
```

The "print the mapping and stop" instruction is load-bearing. A wrong remap is much
cheaper to catch in a table than after 17 renames.

---

## Stage 3 — Author the new content

~286 new sub-levels for the Scalping path. This is the bulk of the work and the only
stage where quality is at risk from going fast.

### Order

Follow the writing order at the end of `docs/curriculum.md`:

1. Scalping Ch2 → Ch3 → Ch4 (expand around retrofitted v2 content)
2. Chapter 1 (expanded last of the early chapters, so its callbacks are known)
3. Scalping Ch5 → Ch6 → Ch7 → Ch8 (5 and 8 are new from nothing)

Ch2 first, not Ch1, on purpose: Ch2 is the chapter with the most existing content to
pattern-match against, so it is where the v3 voice gets established most cheaply.

### Blocks

One session per block of 4–6 levels — 15–20 sub-levels, ~250 KB of YAML. Roughly four
blocks per chapter, ~20 sessions for the path. Never run two blocks in one session:
the second one drifts, and the validator only catches the mechanical half of drift.

### Model per block

| Block | Model |
|---|---|
| Chapter's first block | `claude-opus-5` |
| Chapter's later blocks | `claude-sonnet-5` |
| Any block in Ch5 or Ch8 | `claude-opus-5` (or `claude-fable-5-1`) |
| Any block containing a Callback level or the Final Exam | `claude-opus-5` |

Ch5 and Ch8 get Opus throughout because there is no v2 content underneath them — every
screen is invented rather than expanded, which is where a cheaper model shows.

### The authoring prompt

Stage 3 ran as 29 pre-filled blocks, three to four per chapter, in the writing order from
`docs/curriculum.md`. That prompt file has been deleted now the stage is finished — the template
below is the thing to refill, and Stage 5 refills it twice more (Day Trading, then Swing
Trading) against those paths' own curriculum tables and folders.

This is the one you will run twenty times. Keep the first paragraph byte-identical
every time so the docs cache; change only the bracketed parts.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter [N] section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter [N] —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels [7–11] of Chapter [N] ([chapter title]) in
content/[folder]/, following the v3 level table exactly: the level titles, the
sub-level counts, the "Teaches" column and the "Reinforces" column are all fixed.

Before writing, read three things and stop there. One: the existing sub-levels of the
levels in this block — you are adding siblings to them, so they fix the level's terms,
numbers and voice. Two: the most recently written block, in this chapter if it has one
and otherwise the previous chapter's last, so voice, difficulty and screen mix continue
rather than restart. Three: three or four further sub-levels sampled across the
chapter's range. Do not read every sub-level in the chapter — by the later blocks that
is tens of thousands of tokens for no added signal.

For the Reinforces column, do not read those chapters end to end either. Look up in
docs/curriculum.md which level teaches the concept you are calling back to, and read
only those sub-levels. The callback has to match what was actually taught there, and a
handful of files decides that, not a whole chapter.

Then write each sub-level as its own level-LL-S.yaml. Non-negotiable:
- 12–18 screens, 160–260 estimated seconds, per docs/agent.md §3.1.
- The answer-key hygiene rules in docs/agent.md §3.5. Correct options spread evenly
  across positions, true/false near 50/50, correct option not systematically the
  longest, no em-dash tell, no "no trade" scored red when the best answer is
  directional.
- The two sizing ceilings and the price/volume bands in docs/agent.md §3.6. Every
  worked position must fit the account in the file. Never write a clock time
  literally — use the {{market.*}} tokens.
- Reinforce in context, never verbatim: a callback re-uses the concept inside a new
  situation, it never re-uses the earlier screen's wording or numbers.
- Every chart-decision must be arithmetically checkable and its best answer must
  follow from the lesson the learner has just had, not from hindsight.
- Screen-type variety: no sub-level may be more than half one question type, and the
  new interaction types in docs/UI.md exist to be used — this chapter should not read
  as multiple-choice with occasional charts.

Set `reinforces:` on every file per the curriculum table.

After each sub-level, check your own arithmetic: recompute every stop distance,
R-multiple, share count and dollar total from the numbers as written in the file.
Fix rather than report.

Run `python3 tools/validate_content.py` and get to 0 errors, with no warning
naming any file you wrote or touched. Then run it with `--strict` and confirm every
remaining finding names a level outside this block — those are the chapter-wide
counts, and they clear only when the whole chapter is written, so do not try to
force them to zero and never edit content outside this block to silence them.
Then commit as
"content: chapter [N] levels [7–11]" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### After every block, spot-check three things by hand

The validator cannot see these, and they are exactly where the Phase-2 review found
real damage:

1. **One chart drill's arithmetic**, fully, on paper. Entry, stop, distance, shares,
   risk, target, R. If it is right, the rest of the block probably is.
2. **One callback**, against the lesson it claims to reinforce. Does the earlier
   chapter actually teach that, in those words?
3. **Read one sub-level as a beginner.** Not skim — read. If you are bored, so is the
   learner, and boredom does not raise a validator warning.

---

## Stage 4 — Drill packs (three of fifteen)

**Narrowed.** `chart-replay` (Stage 7) does the chart-recognition job better than a frozen
drill screen, and twelve of the fifteen packs are exactly that job — `charts-structure`,
`levels-and-breaks`, `the-read`, `mixed-daily` and the eight setup packs, 300 of the 370
commissioned screens. Those are **on hold**: authoring them now would build what Stage 7
replaces.

Three packs are unaffected, because no replay reaches them — all-in cost arithmetic, scanner
reading and trade management are not chart timing:

| Pack | Screens | Status |
|---|---|---|
| `scalping-cost-check` | 20 | ✅ hand-written, clean |
| `scalping-selection` | 25 | commission now |
| `scalping-risk-calls` | 25 | commission now |

So Stage 4 is now **two batch requests**, not fourteen. Everything below still applies to them;
the format is at `docs/schema.md` § Drill packs. Drills are independent of one another, have no
lesson structure and no cross-file consistency requirement beyond a concept list — which makes
them the one part of this build that suits bulk generation.

**Model: `claude-sonnet-5` via the Batch API** (50% of list price; results return in
any order, keyed by `custom_id`). One request per pack.

Write a small script that, for each pack in the drill table in `docs/curriculum.md`,
sends: the docs prefix, the pack's concept list, three exemplar screens pulled from
the linear chapter it unlocks from, and the instruction below. Key each request by
`custom_id = pack id`. Then validate everything that comes back before it is committed
— batch output is not exempt from `--strict`.

### Per-request instruction

```
Write [25] drill screens for the pack "[pack id]", covering these concepts:
[concept list]. Format per the drill-pack spec in docs/schema.md.

These are drills, not a lesson: no intro, no theory, no summary — question screens
only, each one standing alone. The learner has already been taught this material in
[chapter/level]; assume it and test it.

Vary the interaction across the pack (swipe-deck, chart-decision, numeric-input,
compare, branch) and vary the difficulty: about a third should be near-misses where
the right answer is "pass" or "no trade". Answer-key hygiene per docs/agent.md §3.5
applies to the pack as a whole — check the distribution across all 25 before you
finish. Price and volume bands per §3.6. Every number must be arithmetically sound.
```

Do this stage **after** the linear chapters, not alongside them: the drills quote the
lessons, so the lessons have to exist and be final first.

---

## Stage 7 — The replay bank

The Spot-it tab (`docs/UI.md` §7.7). Format in `docs/schema.md` § Replays, authoring rules in
`docs/agent.md` §3.10, placement in `docs/curriculum.md` § Replays. **Runs before Stage 5** —
two more paths must not be written against an unproven format.

**Model: `claude-opus-5`, effort `high`, throughout.** This is the most arithmetic-dense content
in the project: 40–80 candles, a volume series, a VWAP series and several stated positions per
file, with §3.6's ceilings applying to all of it. And **never in a batch** — one replay per
request, each verified. A drill is 8–12 bars with one answer; a replay is not that shape, and
the Phase-2 review found its errors in exactly this kind of spread-out arithmetic.

### 7a — the pilot (one session, do this first)

One replay, hand-authored, plus the validator rules that check it. Nothing scales until this
proves the format carries and the arithmetic holds over 60 bars. Same lesson as
`cost-check.yaml`: one written exemplar before any volume.

```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4
and §7.7 in full. Then read content/paths/scalping/chapter-07-scalping-playbook/
level-02-1.yaml and level-02-2.yaml — the VWAP bounce card and its five fields are the
thing this replay is an instance of.

Write one replay to content/replays/scalping/vwap-bounce-01.yaml:
reading level 2 (setup named, card hidden), ~60 bars, one clean VWAP bounce and two
decoys that each fail exactly one named field of the same card.

Then extend tools/validate_content.py with the replay rules from docs/schema.md
§ Replays — every error and warning listed there — and add cases to
tools/test_validate.py proving each one fires, in the style already there.

Non-negotiable, and check each by hand before you report:
- trigger_bar equals the highest filled_at of that setup's own fields. If it does not,
  the replay is ungradeable.
- Each decoy's `fails` names a field of its card, and that field either never fills or
  fills after the decoy's bar.
- Every stated shares × price is inside the 95% account ceiling (docs/agent.md §3.6),
  and tools/check_sizing.py sees the file.
- Candle high ≥ max(open, close) and low ≤ min(open, close) on all ~60 bars.
- Prices in the scalping band ($10–$30) and the median bar volume in 4,000–500,000.
- At most two fields marked `marginal`.

Run `python3 tools/validate_content.py`, `--strict`, `python3 tools/test_validate.py`
and `python3 tools/check_sizing.py`. Commit as "replays: pilot VWAP bounce plus
validator rules" and push to main.

Then report: the bar series with each marked moment and what fills at it, the three
grades a learner would get for acting at bars trigger-1, trigger and trigger+2, and
your honest read on whether 60 hand-authored bars is sustainable 22 times per path.
```

### 7b — the bank (~8 sessions)

22 replays per path, per the table in `docs/curriculum.md` § Replays: two per Chapter 7 setup
card (16), four mixed level-3, two `allow_none` sessions. Three replays per session, grouped by
card so the five fields stay in mind.

```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4.
Read content/replays/scalping/vwap-bounce-01.yaml — the pilot — and the last replays you
wrote, so the bar rhythm and decoy style continue rather than restart. Read the Chapter 7
level that teaches [card], for the five fields.

Write [3] replays for [card] to content/replays/scalping/, at reading level [1/2/3] per
the table in docs/curriculum.md § Replays.

Every rule in docs/agent.md §3.10 binds. The two that go wrong silently:
- A decoy you cannot explain is noise, not difficulty. Each one fails exactly one named
  field, and the note says which. If you cannot name it, cut the decoy.
- The arithmetic spreads across 60 bars and no single screen shows it all. Recompute
  every stop distance, share count, R-multiple and filled_at from the bars as written.

After each file, verify it alone before writing the next. Run
`python3 tools/validate_content.py --strict`, `tools/test_validate.py` and
`tools/check_sizing.py`; get to 0 errors with no warning naming a file you wrote.
Commit as "replays: [card] levels [n]" and push to main.

Report: per replay, the marked moments and their labels, which field each decoy fails,
and anything in the placement table you could not honour and why.
```

### After 7a, decide the twelve held packs

If the pilot shows replays carry recognition as well as the design claims, the twelve chart
drill packs stay cancelled and the 300 screens are never written. If it shows the format is too
expensive to author at volume, commission them as originally planned — the manifest and
`tools/build_drill_batch.py` are still there and still work. Do not decide this before 7a.

---

## Stage 5 — Day Trading and Swing Trading

> **Gated. Do not start this until Stage V has run and the schema has survived it.** This
> stage triples the corpus — ~770 further sub-levels — and every one of them is written
> against a screen contract nothing has ever rendered. A schema fix costs 327 files today
> and roughly 980 afterwards. Nothing in this stage becomes cheaper by being started early,
> and one thing becomes three times dearer.

Chapters 2–8 of each, following the tables already in `docs/curriculum.md`. Structurally
these mirror Scalping, which makes them tempting to generate mechanically. Resist it:
the timeframes, the holding periods, the price bands and the entire psychology chapter
differ, and a swing lesson that reads like a scalping lesson with the word "swing"
substituted is worse than no lesson.

**Model: `claude-sonnet-5`**, same block prompt as Stage 3 with one clause added:

```
The Scalping path's Chapter [N] covers the same ground for a different holding
period. Read it for structure, pacing and screen mix — and then write for this path's
timeframe from scratch. Do not port examples across. Where the honest answer is that
this path does the same thing scalping does, say so in one screen and move on rather
than padding the level.
```

---

## Stage 6 — Zero-knowledge review, per path

Two passes, not one. The first is pedagogical, the second is the one this plan was
missing.

**Pass A — does it teach?** The review that produced the Phase-2 findings, run once per
completed path: terms before definition, callbacks to things not yet taught, difficulty
curve, repeated prompts, distractors that give it away, chart answers that do not follow,
worked numbers, playbook setups against the sources in `docs/agent.md` §4, `{{market.*}}`
tokens, and whether a beginner would be bored, patronised or confused.

**Pass B — does it survive contact with reality? [v3.1]** Everything above checks the
course against *itself*. Four findings on the written scalping path were of a different
kind entirely — the leverage lesson §1 promised and the path never had, 123 shorts that
the account the app describes cannot place, the pattern-day-trader rule that ends a
six-trade session, settlement against 95 %-of-cash positions — and **not one of Pass A's
items would have surfaced any of them.** All four came from a human asking "but could
someone actually do that?". Pass B is that question, made systematic:

- **Every fixed decision in §1 and every rule in §7, checked against the corpus.** Not
  "is it stated" — "is it delivered, in the right place, at the right weight".
- **Every trade the content teaches, against the account the content describes.** Can the
  learner place it? With what type of account, how much capital, which permissions?
- **Every rule the content teaches, against the rules that actually bind** in each market
  profile — position limits, trade limits, settlement, borrow, and what the app promises
  in `{{market.regulation_note}}`.
- **The handover.** At the last screen, what does the graduate still not know that stands
  between them and the first thing the path tells them to do?

Two method notes, learned the hard way and worth more than the list:

1. **Match counts lie; read the hits.** A scan reported `margin` and `settle` as covered
   across the corpus. Every match was the English word *marginal* and the verb *settles*
   ("the candle settles the argument"). Financial margin and settlement appear zero times.
   A grep result is a place to look, never an answer.
2. **Grep the concept, not the word.** The same scan reported the instruments lesson as
   absent; it exists, inside `{{market.scalping_note}}`, which contains neither "leverage"
   nor "CFD" in the search that was run. Before concluding something is missing, ask what
   it would be *called* in this corpus — tokens, synonyms, the curriculum's own vocabulary.

**Model: `claude-opus-5`, high effort, one pass per session.** Pass A found 28 real
problems in 101 files; across 387 it is the difference between a course and a pile of
lessons. Pass B found four in a single afternoon of someone asking awkward questions.
Run each as a findings list first, approve, then fix — never as one combined pass.

**Pass B is also the one a model is worst at**, because it requires knowing what happens
outside the repository. Treat its output as a shortlist for a human who has actually
placed these trades, not as a verdict. Where it cannot decide, it should say so and name
the decision — as `docs/agent.md` §3.6 does for the margin and settlement conflicts.

---

## What "done" means

Per `docs/agent.md` §1.1, the graduate can pick stocks, read context, recognise setups,
size from risk *and* account, place entry, stop and target, follow their limits, journal,
and judge themselves by expectancy. They are **not** a profitable trader — Chapter 8
ends with a 30-day simulator plan, not a certificate. Any screen that promises otherwise
is a bug, and it is the one bug the validator will never catch.
