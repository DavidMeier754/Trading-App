# Build plan — v2 content → v3 curriculum

How to get from what is in `content/` today (101 sub-levels, 6 chapters, one path)
to what `docs/curriculum.md` describes (387 sub-levels, 8 chapters, three paths).

Read this with `docs/curriculum.md` open. That file is the *what*; this file is the
*how, in what order, with which model*.

## The gap

| | Now | Target (Scalping) | To write |
|---|---|---|---|
| Chapters | 6 | 8 | +2 new (Ch5 Finding the Trade, Ch8 The Trading Day) |
| Levels | 62 | 144 | +82 |
| Sub-levels | 101 | ~387 | ~286 new, ~101 to retrofit |
| Screens | ~1,400 | ~5,800 | ~4,400 new |
| Drill screens | 0 | ~350 | all |

At ~5.6 KB per sub-level file that is roughly **1.6 MB of new YAML**. It is not one
session's work and must not be attempted as one. The unit of work is a **block of
4–6 levels** (`docs/agent.md` §6): write, validate, commit, push, stop.

---

> The path these stages build is now written. What the control pass found in it afterwards —
> and the six stages that repair it — live in `docs/remediation-prompts.md`. Those stages are
> numbered separately and are not the stages below.

## Stage order

**Stages 0–2 are done** (see git history; the four defects the Stage 1–2 pass left behind were fixed in a follow-up). Stage 3 is next, starting with Scalping Chapter 2.

Stages 0–2 are prerequisites and are cheap. Do not start Stage 3 until 0–2 are done
and the validator is clean, because Stage 3 produces 286 files that would all inherit
any mistake.

| Stage | What | Model | Surface | Rough size |
|---|---|---|---|---|
| 0 ✅ | Teach the validator the v3 rules | `claude-opus-5` | Claude Code | 1 session |
| 1 ✅ | Renumber chapter folders 5→6, 6→7 | `claude-haiku-4-5` | Claude Code | 20 min |
| 2 ✅ | Retrofit the 101 existing subs (`reinforces:`, level remap) | `claude-sonnet-5` | Claude Code | 2–3 sessions |
| 3 | Author the new content, chapter by chapter | `claude-opus-5` / `claude-sonnet-5` | Claude Code | ~20 sessions |
| 4 | Drill packs | `claude-sonnet-5` | **Batch API** | 1 script run |
| 5 | Day Trading + Swing paths | `claude-sonnet-5` | Claude Code | ~30 sessions |
| 6 | Zero-knowledge review pass per path | `claude-opus-5` | Claude Code | 1 session/path |

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

Every block's copy is pre-filled in **`docs/stage-3-prompts.md`** — 29 ready-to-run prompts in writing order, each with its recommended model. Copy the next un-done block instead of filling the template by hand.

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

## Stage 4 — Drill packs

~350 drill screens per path, in `content/drills/`, in the format at the end of
`docs/schema.md`. Drills are independent of one another, have no lesson structure and
no cross-file consistency requirement beyond a concept list — which makes them the one
part of this build that suits bulk generation.

**Model: `claude-sonnet-5` via the Batch API** (50% of list price; results return in
any order, keyed by `custom_id`). One request per pack, ~14 packs per path.

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

## Stage 5 — Day Trading and Swing Trading

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

The same review that produced the Phase-2 findings, run once per completed path:
terms before definition, callbacks to things not yet taught, difficulty curve, repeated
prompts, distractors that give it away, chart answers that do not follow, worked numbers,
playbook setups against the sources in `docs/agent.md` §4, `{{market.*}}` tokens, and
whether a beginner would be bored, patronised or confused.

**Model: `claude-opus-5`, high effort.** This pass found 28 real problems in 101 files;
across 387 it is the difference between a course and a pile of lessons. Run it as a
findings list first, approve, then fix — never as one combined pass.

---

## What "done" means

Per `docs/agent.md` §1.1, the graduate can pick stocks, read context, recognise setups,
size from risk *and* account, place entry, stop and target, follow their limits, journal,
and judge themselves by expectancy. They are **not** a profitable trader — Chapter 8
ends with a 30-day simulator plan, not a certificate. Any screen that promises otherwise
is a bug, and it is the one bug the validator will never catch.
