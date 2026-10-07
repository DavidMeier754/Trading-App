# Validator rules

_Part of the [level file format](README.md)_

## Validator rules (tools/validate_content.py)

Errors (must fix):
- Required header fields present; `id` matches filename; `category`, `path`, `type` values valid.
- 12–18 screens per lesson (carousel cards, walkthrough steps, **[v3]** swipe-deck cards and branch steps count individually); tests 10–16; **[v3]** final exams 12–18.
- First screen is `intro`; tests/exams end with `summary` (+ `badge` for final exams); `intro.counter` = `summary.total` = number of question screens.
- ≥3 distinct question types (lessons); no more than 2 `mc`/`numeric-mc` in a row.
- `mc`/`numeric-mc`: 2–4 options, exactly one `correct`, unique texts. `tf.answer` boolean. `fill-tiles.answer` one word. `match`: 2–5 pairs, unique left and right. `sort`: every item's bucket exists. `chart-decision.best` in its buttons.
- Every question screen has an `explanation`.
- **[LOOK-COMPONENTS]** A header's `icon` and every carousel card's `icon` is a name the app draws (`src/home/icons.tsx`, the mapping table in `src/home/symbols.tsx`); the lessons of one level name one icon at most.
- `prerequisite` exists in the same chapter.
- **[v3]** `reinforces` is a list of integers, each lower than this file's `chapter`.
- **[v3]** On any `chart-decision` with `best` of `long` or `short`, `reasonable` contains `no-trade`.
- **[v3]** Every key a `plan-sheet` renders is a key some `plan-card` writes (see "The plan" above), and a **learner line** — a field with no literal `value` — is written *before* it is displayed: by an earlier sub-level, or by an earlier screen of the same sub-level. Computed across a whole path, with the shared chapter (`path: all`) counting for every path, so a sheet can never show a line the learner has not yet filled in. `slot:` on a card or a sheet scopes its short field keys to `card.<slot>.<field>`.
- **[v4, STABLE-DATA]** Component data matches the table in "Components, data and hotspot targets": a known component id, its required fields, no field the renderer does not read, and the shapes the renderer draws: `levels` as `{price, label}` objects (`label` optional), an `order-book` or `depth-ladder` book as non-empty `bids`/`asks` of `[price, size]` (a `depth-ladder` keeps it under `data:`), candles as `[open, high, low, close]`, line data as numbers, `volume`/`vwap` one number per bar, `cost-stack` in one of its three shapes, `bar-chart` bars with a numeric `value`. It covers `visual_data`, `data`, every question's `chart`, swipe-deck cards and compare charts, in lessons and drill packs.
- **[v4, STABLE-DATA]** The test bench `demo/all-screens.yaml` is checked screen by screen (known type, question shape, component data), without the lesson rules (screen count, question mix, `mc` runs).
- **[v3]** New types validate their own shape: `swipe-deck` 4–8 cards each with `answer` in {take, pass}; `chart-annotate` numeric `answer` + `tolerance`; `order-build` `answer` keys match `slots` and every answer value appears in `chips`; `scanner-pick` `target` is a `ticker` present in `rows`; `compare` `answer` is a chart `label` or "neither" when `allow_neither`; `branch` 2–4 steps, each with exactly one `correct`; `journal-row` `answer` keys match `slots`; `depth-ladder` `target` exists in the book.

Warnings (review):
- Estimated time outside 160–260 s (theory-type 10 s, carousel/walkthrough 10 s per card/step, question 15 s, match/sort/order 18 s, chart-decision 20 s, **[v3]** swipe-deck 8 s per card, branch 18 s per step, chart-annotate/order-build/scanner-pick/compare/journal-row/depth-ladder 15 s, recap 10 s, plan-card 20 s).
- A glossary term used in a question before the sub-level that introduces it. Known terms = Chapter 1 terms plus terms from lower-numbered chapters of the same path.
- A term re-introduced that a lower chapter already introduced.
- Folder chapter number differs from the `chapter` field.
- **[LOOK-COMPONENTS]** A level of `new-theory` or `repetition` lessons none of which names an `icon`: its node would show only the bulb or the round arrows.
- Identical prompt text in two different files of the same chapter (prompt *and* answer content; a shared prompt over different content is caught by the chapter-level rule below).
- Level without a visual/interactive screen in Chapter ≥2.
- More than 5 `repetition` sub-levels in a row. A `test` or `final-exam` sub neither extends the run nor resets it; only a `new-theory` sub resets it (`docs/rules/03-content-rules.md` §3.2).
- **[v3]** `prerequisite` skips a sub-level — it must name the sub immediately before this one, so the path map cannot unlock a level over content the learner never saw. The first sub of a `fan-out:` strand is exempt: it reaches back to the last sub before the fan-out.
- **[v3]** The same `tier-up` tier awarded twice to one learner. Two paths may share a tier name; the shared chapter (`path: all`) collides with every path.

Chapter-level warnings **[v3]** (computed across a whole chapter folder):
- Fewer than 15 levels.
- Fewer than 60 % of levels with ≥3 subs, or fewer than four levels with 4 subs.
- Fewer than 10 distinct question types used, or any type used fewer than twice.
- No Callback level, or fewer than 15 % of question screens in subs declaring `reinforces`.
- A Test with under 20 %, or a Final Exam with under 25 %, of questions in a `reinforces` sub.
- Correct-option position distribution skewed (any position holding >50 % of `mc`/`numeric-mc` answers).
- `tf` answers outside a 40–60 % true split.
- Correct option is the longest in more than 45 % of `mc`/`numeric-mc` screens.
- More than 70 % of sub-levels ending on a `theory` screen.
- Any single per-share outcome value used in more than 25 % of `chart-decision` outcomes.
- More than five consecutive sub-levels at the same `difficulty`.
- A `chart-decision` or `branch` whose `shares` × decision price exceeds the account named in the same file.
- **[v3.1]** The same position over **95 %** of that account: one position at a time, and 5 % of the cash stays unspent so the fill is payable at the ask (`docs/rules/04-numbers-and-realism.md` §3.6). `tools/check_sizing.py` reports every position in the corpus against this line, together with every other place in the file that names the same share count.
- The **typical** (median) bar of a chart's volume outside 4,000–500,000 (path chapters). Judged on the median, not every bar: an opening bar or a climax bar legitimately spikes above the band, and Chapter 2 teaches climax volume on purpose.
- **[v3.1]** A chapter's `chart-decision` answers leaning one way: among the screens whose `best` is `long` or `short`, one side outnumbering the other by more than **2:1** (`docs/rules/03-content-rules.md` §3.5). Judged from eight directional decisions up; `no-trade` is not counted, and Chapter 1's `buy`/`wait` variant is not either.
- **[v3]** A `chart-decision` `outcome` used verbatim anywhere else in the chapter.
- **[v3]** Fewer than 60 % distinct outcome sentence *shapes* across a chapter's `chart-decision` outcomes (numbers collapsed, so two sentences differing only in their figures count as one shape). Applies from 12 decisions up.
- **[v3]** More than 60 % of a chapter's `chart-decision` scenarios ending on the same sentence shape. Session state belongs in `state` chips (docs/ui/08-quotes-and-charts.md §6.4), not in a sentence repeated after every chart.
- **[v3]** One prompt used for more than 25 % of a question type's screens in a chapter (from 5 uses up).

**[v4] Rules added in stage RULES** (warnings first, errors under `--strict`; each with a case in `tools/test_validate.py`):
- Variance (`docs/rules/07-variance-and-typed-numbers.md` §3.11): the share of correct directional decisions that lose, per chapter (0 % in Chapter 1 before Level 2-4, 20–30 % after it with no two in a row, 30–40 % from Chapter 2 on and in drill packs), from eight such decisions up; `stop` and `target` present on directional decisions from Chapter 3 on; the `outcome` sentence agreeing with the bars (win or loss, and the stop or target touched first).
- Signs (§3.12): a `numeric-input` with a negative `answer` either sets `sign: any` or states the sign in its prompt.
- `recap` points carry `card:`, and it names a `theory`/`example` screen of that sub-level; a lesson's closing `story` carries `label: takeaway`.
- Copy (§3.9): body text over 150 characters; British spellings (listed in the validator); gesture words and mechanics in prompts ("drag", "tap", "swipe", "hearts are on").
- Answer keys (§3.5): the correct option the longest in fewer than ~15 % of `mc`/`numeric-mc` screens; the punctuation tell per chapter.
- Visual quota (§3.4): fewer than 40 % of a chapter's `theory`/`example` screens with a visual.
- The plan-aware cap (§3.6): a position above the `setup_max_account_pct` the learner has written by that point in the path (its latest `suggest`).
- Per-trade risk and total exposure (§3.6): `shares × stop distance ÷ account` outside 0.5–2 % where a file names an account and a stop; for several open positions, the sums of position value and of risk against the account.
- ~~`variance-sim` ranges and positive expectancy~~ (dropped, [DESIGN-REVIEW]); ~~`glossary.yaml` coverage and length~~ (now `content/skills.yaml`, checked since [Skills], below).

**[DESIGN-REVIEW] Rules added in stage DESIGN-REVIEW** (errors; each with a case in `tools/test_validate.py`):
- `notes`: 1–4 entries; each `bar` an integer inside `chart.data`, `text` 1–24 characters, `at` `high` or `low`.
- `session_open`: an integer from 1 to the bar count − 1.
- `alert` (on a `story` that is not a takeaway): `ticker` of 1–5 capital letters, `time` at most 24 characters with no clock time written as digits, `facts` 1–3 strings of at most 16 characters, `spark` 5–30 numbers.
- `facts` on an `intro`: only in tests and final exams, 1–3 strings of at most 20 characters.
- ~~`skills`: only in `new-theory` lessons, 0–3 entries, `name` 1–40 characters, `card` the 1-based index of a teaching screen~~ (replaced by the [Skills] rules below).
- `decision-grid` data: `cell` one of the four names.
- `scanner-table` and `scanner-pick` rows: `spark` 5–30 numbers; a warning when its last value is not the row's `price`, or when its move from the first value differs from `change_pct` by more than 0.15 points (the first value is the previous close).
- A bonus file (`category: bonus`): as in "Bonus side lessons" above.

Warnings:
- A term in `terms_introduced` that no `theory`, `example` or `carousel` screen of its lesson contains (the skill would have no card to open).
- ~~A chapter whose `new-theory` lessons include some with neither `terms_introduced` nor `skills`~~ (an error since [Skills], below). (Component data and the test bench are checked since stage STABLE-DATA, as errors: see above.)

**[Skills] Rules added 2026-10-04** (errors unless marked; each with a case in `tools/test_validate.py`):
- `content/skills.yaml` is a list; every entry has `name` (1–40 characters), `kind` (`word` or `technique`) and `info` (not empty, at most 160 characters, ending with a full stop), and nothing else but `aliases` (a list of names, words only). No two entries share a name or an alias, compared without case and extra spaces.
- Every level file has `skills`: a list of names, each 1–40 characters, none twice. A `new-theory` sub-level lists at least one; a test or final exam lists none.
- Every name has an entry in `content/skills.yaml`, spelled exactly as there.
- The words a lesson lists are exactly its `terms_introduced`, both ways.
- A word is introduced once per path (Chapter 1 counting on every path); a technique is listed by exactly one lesson.
- Warning: an entry no lesson lists.
