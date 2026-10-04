# ContentToDo.md — content work from the design review

Status: 2026-10-04. Written in stage `DESIGN-REVIEW` (`docs/build-plan.md`) from David's verdicts on the 50 design ideas of that stage (the artifact "Nutrade design review"). The app side of every approved idea is built in that stage. **No content file was changed there** — David, 2026-10-03: "Don't rewrite any .yaml". Everything the level files need is listed here instead, for the content sessions that follow.

Read this file together with `docs/agent.md`, `docs/schema.md`, `docs/UI.md` and `docs/curriculum.md`. Where this file and those disagree, those win, and this file gets corrected in the same PR.

---

## How to use this file

- **Who reads it.** Every session that writes or changes content: `CONTENT-DESIGN`, `VARIANCE`, `GLOSSARY`, `OFFER`, `CONTENT-FIX-1` … `-8`, `FUN-PASS` (bonus lessons), `REPLAY-PILOT` / `REPLAY-BANK`, `DRILLS`, `SWING-n` and `DAY-n`. Their prompts in `docs/build-plan.md` name it.
- **What it holds.**
  - Part 1: rules from David's verdicts that hold for every content change.
  - Part 2: the new optional fields the app renders since `DESIGN-REVIEW`, with examples and limits.
  - Part 3: the work per chapter, done by `CONTENT-FIX-N` while it touches the chapter anyway, so no file is rewritten twice.
  - Part 4: content that is still to be written, with its stage.
  - Part 5: the log of what is done.
- **How to tick.** A session that finishes an item ticks it (`[x]`) and adds a line to Part 5 with its PR number. Nothing is deleted; an item that turns out wrong is struck through with the reason.
- **The usual gates hold.** `python3 tools/validate_content.py` at 0 errors, `tools/test_validate.py`, `tools/check_sizing.py --summary`, the render test, and the three hand checks in `docs/build-plan.md` §1.

---

## Part 1 — Rules from David's verdicts

These hold for every content change from now on. `docs/agent.md` carries the same rules; they are repeated here because every item below depends on them.

### 1.1 No reliable-looking odds

David, 2026-10-03, on the variance simulator: "this would imply the number given (like 6/10 are right) are reliable and I don't want this. The user should do his own research on how often strats work for him."

- Never state how often a setup, a strategy or a decision wins as if it were a fact: not "about 4 in 10", not "6 of 10 work", not a win rate per setup, not "this setup loses a third of the time".
- A number in an example is there for the arithmetic, and the screen says so ("Say a method wins 4 trades in 10 …"). It is never presented as the real rate of anything the course teaches.
- How often a method works is something each learner finds out for themselves: from their own journal and their own simulator sample, over enough trades (Chapter 6 teaches how many, Chapter 8 Level 11 how to read them). Say that instead of giving a rate.
- The right-but-lost reveal says it without a number. The app's line (`src/lesson/decisionReveal.ts`): "Right call — this trade lost anyway. One trade says little; judge the decision, not the result."
- Unchanged: the share of correct decisions that lose inside the content (`docs/agent.md` §3.11, 30–40 % from Chapter 2 on). That is how realistic the charts are, not a claim the learner reads.

### 1.2 Charts start simple and grow

David, 2026-10-03, on the R ruler: "keep the charts in the beginning as simple as possible and then after some time crank up the infos, but also explain the user what everything means."

- An element appears on a chart only from the lesson that explains it on. Before that lesson, no chart shows it.
- The first chart that shows an element is explained: a theory or example card right before it, or a chart note (Part 2.2) on that first chart.
- The ramp for the scalping path (the swing and day-trading chapters follow the same idea with their own lessons):

| From | Element on the chart | Explained in |
|---|---|---|
| Ch 1 | One line, the price axis, the box over what happened next | 1·1-1 |
| Ch 2 · L1 | Candles | 2·1-1 (`candle-anatomy`) |
| Ch 2 · L4 | Volume bars | 2·4-1 |
| Ch 2 · L9 | Level lines (support, resistance, yesterday's high and low) | 2·9-1 |
| Ch 2 · L13 | The open: pre-market shade and the bell line (`session_open`), only where the open matters | 2·13-1 |
| Ch 3 · L9 | The stop and target lines on directional decisions (`stop`, `target`) | 3·3-1 (target), 3·9-1 (stop) |
| Ch 4 · L1 | The VWAP line | 4·1-1 |
| Ch 5 | Context in the story: the market alert (`alert`) | 5·1 |
| Ch 6 · L2 | The R ruler beside the price axis (the app shows it by itself once the lesson that introduces "R" is behind the learner) | 6·2-1 |
| Ch 6 | Session state chips (day in R, limit, trades taken) | 6·9 |
| Ch 7–8 | Whatever the setup card needs, and nothing it does not | each setup's theory sub |

### 1.3 Do not overdo it

David, 2026-10-03: "This is an example of not to overdo it. This is too much for such a simple question" (the slider with ticks), "make the design better and again DON'T OVERDO / BRING TOO MUCH CONTENT ON ONE PAGE" (the plan document), "in the example there is too much going on. Keep it simpler" (the order eating the book).

- A simple question stays simple: one chart or one visual, one question, few words.
- A new field (notes, an alert, facts, the open marker) goes on a screen only where it teaches something on that screen. When in doubt, leave it out.
- The limits in Part 2 are maximums, not targets.

### 1.4 Terms: neither too many nor too few

David, 2026-10-03, on the term marker: "Don't over or underuse them."

The app marks terms by itself (`docs/UI.md` §8): only terms taught in an earlier lesson, only their first appearance in a lesson, and at most two on one screen. What content owes it:
- Every term a lesson defines is in that lesson's `terms_introduced`, spelled as the body text spells it (case does not matter; the plural with an "s" is found too).
- A term is defined on a `theory`, `example` or `carousel` screen of that lesson before any question uses it (`docs/agent.md` §3.4). That card is what the learner gets back when they open the term or the skill later.
- No term is introduced twice.
- Today (2026-10-03) the validator warns about 9 terms that no card of their lesson names, so their skill has no card to open: 1·1-1 "Trade"; 1·4-1 "Quote", "Previous close", "Daily change" (taught on a walkthrough, which the term search does not read); 1·13-1 "Cover"; 3·1-1 "Quote panel"; 3·14-1 "Per-share fee"; 7·1-1 "Playbook card"; 7·3-1 "Opening-range scalp". Name each on a theory, example or carousel card of its lesson (`CONTENT-FIX-1`, `-3`, `-7`).

### 1.5 Every question stands on its own

New since `DESIGN-REVIEW`: the app replays questions outside their lesson — in the mistakes round, in the mistakes reviews on the map (`docs/UI.md` §7.1), in the Practice tab's daily mix and mistakes list (§7.3). A question that leans on the screen before it breaks there.
- A question names what it needs ("XYZ's chart", "the quote above" is fine only when the quote is on the same screen).
- The one exception: a question right after a `story` scene. The app brings the scene along, so "What do you do now?" after a scene still works.
- `CONTENT-FIX-N` checks every question of its chapter for this.

---

## Part 2 — New optional fields the app renders

All of them are optional, so every existing file stays valid. The formats are in `docs/schema.md`, marked **[DESIGN-REVIEW]**; the validator knows them; the test bench does not show them yet (item 4.9). Until content uses them, Settings → Testing → **New designs** in a test build plays a lesson that does (`src/home/newDesigns.ts`: the market alert; stop and target with two notes and the open; the same setup stopped out; the `decision-grid` card; scanner rows with `spark`; a ladder with `shares`; the order ticket; the match). Its objects show each field's shape, written in TypeScript instead of YAML.

### 2.1 Stop and target on `chart-decision` (`stop`, `target`)

Already in the schema since v4 and required from Chapter 3 on for long and short decisions (`docs/agent.md` §3.8). Since `DESIGN-REVIEW` the app draws them:
- While the learner decides: nothing (the lines would give the direction away).
- After the choice: the entry, the stop and the target as labelled lines with their prices; playback stops at the first bar that touches the stop or the target.
- From the lesson that teaches R (Scalping 6·2-1) on: the R ruler beside the price axis, −1R at the stop, 0 at the entry, +1R and up to the target; a marker runs along it with the playback and stops on the result in R. Shown when the learner took the trade the file describes, or stood aside (then faint, as what would have happened); not when they traded the other way.

```yaml
- type: chart-decision
  best: long
  reasonable: [no-trade]
  stop: 18.02        # below the entry for a long, above it for a short
  target: 18.44      # beyond the entry in the trade's direction
```

### 2.2 Chart notes (`notes`)

After the reveal, short notes appear on the chart itself, each with a thin leader line to the candle it means. They show the learner *where* the explanation's words are on the chart.

```yaml
- type: chart-decision
  explanation: "The lower high under the shelf said the buyers were done."
  notes:                                      # 1–4 notes; most screens need none
    - {bar: 5, text: "Lower high"}            # bar: 0-based index into chart.data
    - {bar: 7, text: "Breaks the shelf", at: low}   # at: high (default) or low
```
- Text at most 24 characters, no full stop. The words of the explanation, shortened, not new ideas.
- Only where the explanation points at a particular candle or level. At most one chart decision in three per lesson carries notes, so they stay a help and not a habit.
- The notes may point at bars after `decision_index`: they appear only once everything has played out.
- The app keeps a note's tag off the chart's other words (the levels' labels, the plan's labels, the "decision" tag) and, where it can, off the other bars; with no room on its side it takes the bar's other side (`docs/UI.md` §6.4). Short notes leave it the most room.

### 2.2a Level labels (the existing `levels[].label`) — a recommendation

Not a new field, but since `DESIGN-REVIEW` the app draws a level's label (the label and its price, "Pre-market high 16.60") over the bars on a rim of the page's colour, at the end of the line where it covers the fewest bars (`docs/UI.md` §6.4). On a narrow chart a long label still crosses candles, sometimes the decision candle.
- [ ] Keep a label at **20 characters or fewer** (the price is added after it). Today 33 of the 291 labelled levels run past 24 characters with their price; the longest is "The price that stopped the last two pushes" (Scalping 5·7-2). `CONTENT-FIX-N` shortens these while it touches the chapter ("Stopped two pushes", "Morning range top"), keeping the words the explanation uses.

### 2.3 The open on a chart (`session_open`)

On a chart that crosses the open, the bars before the open are shaded as pre-market, and a dashed line with a small bell marks the first bar of the regular session, labelled "Open".

```yaml
  chart:
    kind: candles
    data: [...]
    decision_index: 7
    session_open: 3      # the first bar of the regular session; bars 0–2 are pre-market
```
- Only on charts where the open matters to the question: levels that test setups at the open (Part 3 names them). Not on a chart that only tests whether the learner can read a structure — David: "Here this isn't needed".
- Explained the first time (2·13, "The Opening Minutes"): what the shade is, what the line is.

### 2.4 The scene as a market alert (`alert` on `story`)

A scene that names a stock at a moment can carry the alert a trader would see: the ticker, the time, one sentence (the story's `text`), a small sparkline and up to three facts.

```yaml
- type: story
  text: "XYZ gapped up on earnings and is holding above its pre-market high."
  alert:
    ticker: XYZ
    time: "1 min after the open"      # no clock time written literally (docs/agent.md §3.6); tokens are fine
    facts: ["Gap +6.2 %", "RVOL 4.8×"]   # 1–3 chips, at most 16 characters each
    spark: [17.40, 17.62, 17.55, 17.90, 18.10, 18.05]   # optional: 5–30 prices, the move so far
```
- The facts are not repeated in the text. Text stays within 150 characters, usually much less.
- Only scenes that are a moment in a session with one stock. A takeaway (`label: takeaway`) never has an alert.
- `spark` follows the realism rules of `docs/agent.md` §3.6 (the price band, ticks).

### 2.4a The day on a scanner row (`spark` on `scanner-table` / `scanner-pick` rows)

Every scanner row shows a small sparkline of its day beside the ticker (`docs/UI.md` §6.8). Without `spark` the app draws a plain line from the previous close to today's change, on one scale for the whole table — honest, but it says no more than the % column. A `spark` shows the shape of the day, which is what Chapter 5 teaches a trader to read at a glance (a steady climb against a spike that faded).

```yaml
rows:
  - {ticker: MARL, price: 14.80, change_pct: 8.6, rvol: 6.8, spread: 0.02, catalyst: "Results",
     spark: [13.63, 13.70, 14.10, 14.55, 14.40, 14.62, 14.80]}   # 5–30 prices, first = previous close
```
- The first value is the previous close and the last is `price`, so the line and the % column agree; the validator warns when they do not.
- Only where the shape matters to the question (a faded spike, a slow grind); a row with no `spark` keeps the plain line.

### 2.4b The order's size on a depth ladder (`shares` on `depth-ladder`)

After Check the app walks the market order through the book, level by level (`docs/UI.md` §4.2). It needs the order's size. Today it reads it from the English prompt ("You market-buy 1,400 shares"), which works for 39 of the 40 ladders and breaks once the prompts are translated (Phase J). So every `depth-ladder` gets `shares`:

```yaml
- type: depth-ladder
  prompt: "You market-buy 1,400 shares. Where does the last share fill?"
  data: {bids: [...], asks: [...]}
  target: ask-3
  shares: 1400
```
- Mechanical: the number the prompt already names. The validator checks that it fills to the target.
- The one ladder the app cannot read today: Scalping 8·12-2 screen 7 ("You send the 1,400 as a market order").

### 2.5 The checkpoint briefing (`facts` on `intro`)

The first screen of a Checkpoint or Final Exam is a briefing card: the level's kind as the kicker ("Checkpoint"), the chapter's name as the title, the intro's `text` as one line, a pip per question, the row "10 questions · 70 % to pass · 5 hearts", and the account facts as chips.

```yaml
- type: intro
  text: "Levels 1 to 4. Read each chart properly."
  counter: 10
  facts: ["Account $22,000", "Risk 1 % a trade"]   # tests and finals only; 1–3 chips, at most 20 characters each
```
- The text no longer says what the card shows: no "Ten questions", no "Hearts are on", no account numbers (they are chips now).

### 2.6 Skills (`skills` in the header)

David, 2026-10-03: "After every lesson the User does where he learns a new word, technique, and so on there is a small overview of what he has learned … those cards/skills get transferred to the practice tab … listed by chapter. Here he can get the info cards again for every individual skill."

A lesson's skills are its `terms_introduced` (words) plus its `skills` (techniques). After the lesson the learner sees them as cards; the Practice tab keeps them, by chapter; a tap opens the card that taught it.

```yaml
terms_introduced: ["Stop order", "Stop-loss"]
skills:
  - {name: "Placing a stop on the right side", card: 7}   # card: 1-based screen index of the card that teaches it
```
- A term's card is found by the app: the first `theory`, `example` or `carousel` screen of the lesson whose text contains the term. Rule 1.4 makes sure there is one.
- `skills` names what the learner can now *do*, not a topic: "Reading a quote in two seconds", not "Quotes". At most 40 characters. 0–3 per lesson, only in `new-theory` lessons.
- `card` points at a `theory`, `example`, `carousel`, `walkthrough` or `visual` screen.

### 2.7 Bonus side lessons (new files)

The map draws optional side stops beside the path (`docs/UI.md` §7.1). Since `DESIGN-REVIEW` they come from files of their own, in the chapter's folder:

```yaml
# content/paths/scalping/chapter-02-charts-101/level-04-bonus.yaml
id: "4-bonus"            # the level it follows, then "bonus"
title: "Spot it"
subtitle: "Three charts, bar by bar"
chapter: 2
chapter_title: "Charts 101"
path: scalping
category: bonus          # new category: optional, never timed, never a heart
after: 4                 # the level that opens it; it sits beside the path after that level
                         # (never a test, never the level right before a test)
gems: 10                 # paid on the first finish
xp: 10
tags: [structure]
learning_goal: "…"
purpose: "…"
prerequisite: null
difficulty: 2
sources: [consensus]
screens: [intro, 2–3 × chart-replay]
```
- 2–3 `chart-replay` screens (`docs/UI.md` §4.4), reading level 1 or 2, played bar by bar; the learner does not know where, or whether, there is a setup. One of them may have no setup at all (`allow_none`).
- No `summary`, no `badge`. The validator checks the category, `after` and that the level named exists.

---

## Part 3 — Work per chapter

`CONTENT-FIX-N` does these while it touches the chapter for its worklist anyway (`docs/build-plan.md` Phase E). The same list applies to every Swing and Day Trading chapter as it is written.

### 3.1 The checklist for every chapter

- [ ] **Skills (2.6).** Every `new-theory` lesson: `terms_introduced` complete — every term the lesson defines, and only those — and 1–3 `skills` with their cards. Today 288 of 388 lessons introduce no term at all, 176 of them `new-theory` (count of 2026-10-03), so most lessons need at least a skill.
- [ ] **The chart ramp (1.2).** Every chart checked against the ramp: an element before the lesson that explains it goes; the first chart with an element gets its explanation.
- [ ] **Chart notes (2.2)** where an explanation points at a candle or a level.
- [ ] **The open (2.3)** on the charts listed for the chapter below, and nowhere else.
- [ ] **Alerts (2.4)** on scenes that are a moment with one stock. Today 51 scene stories name a ticker (Ch 1: 13, Ch 2: 7, Ch 3: 10, Ch 4: 3, Ch 5: 1, Ch 6: 1, Ch 7: 15, Ch 8: 1); not every one of them needs an alert.
- [ ] **Ladder sizes (2.4b)** on every `depth-ladder` (Chapters 3–8: 40 screens).
- [ ] **Scanner sparks (2.4a)** on the rows of scanner questions where the shape of the day is part of the answer.
- [ ] **Briefings (2.5).** Every Checkpoint and Final Exam intro: `facts` for the account numbers, and the text shortened to what the card does not show.
- [ ] **No odds (1.1).** Every sentence that states how often something wins or loses, rewritten.
- [ ] **Standalone questions (1.5).**
- [ ] **Stop and target (2.1)** from Chapter 3 on, as `docs/agent.md` §3.8 already requires.

### 3.2 Chapter by chapter

- **Chapter 1 (shared).** The ramp's first step: line charts only, nothing else on them. Alerts for the Level 1 and 13 scenes that name XYZ at a moment. Briefings for 1·5, 1·11, 1·17-1. Level 2-4 is new (4.1). The first losers from Level 3 on (`docs/agent.md` §3.11, stage `VARIANCE`), worded without odds.
- **Chapter 2.** Candles from 1-1, volume from 4-1, levels from 9-1 — check that no earlier chart carries volume or levels. The open (2.3) is introduced in 13-1 ("The Opening Minutes") and used in 13 and 17 (the full morning). Notes on the structure decisions of 7, 10, 12 and 17 where the explanation names a higher low, a lower high or a break.
- **Chapter 3.** `stop` and `target` on every long and short decision (§3.8). The open on 3·3 (spreads at the open) where a chart shows it. Briefings for 5-1, 12-1, 19-1 — 12-1's "Hearts are on." goes.
- **Chapter 4.** VWAP from 1-1. The open on 3 ("Intraday Levels": the pre-market extremes and the opening price) and 11 ("The Opening Drive"). Notes for the tape and confluence decisions (10, 12, 13).
- **Chapter 5.** Alerts are this chapter's natural home: the scanner names, the gappers, the catalyst — scenes in 1–3 and 15–16. The open on the pre-market routine's charts (15, 16). Scanner sparks (2.4a) on the selection questions (4, 6, 9, 10, 16, 17, 19), where a faded spike against a steady climb is the point.
- **Chapter 6.** The R ruler arrives on its own from 2-1 (2.1); check that the reveals from there on name results in R where the ruler shows them. Levels 6 and 13 no longer run a simulator (4.1, `docs/curriculum.md`): their numbers are examples of the arithmetic, and the lessons end on "your own sample decides".
- **Chapter 7.** Every setup card's charts carry what the card needs: VWAP for A, the open and the opening range for B (3) and F (10), levels for D and G. Notes on the trigger bar of each setup's first decision. Alerts for the gap-and-go scenes.
- **Chapter 8.** The open on 6 ("The Open") and the full-day charts (9, 17). Alerts in 4 (the pre-market hour) and 9. 11 ("Tracking Your Numbers") is where "measure it yourself" (1.1) is taught in full; 14 (the 30 days on sim) repeats it.

---

## Part 4 — Content still to be written

| # | What | Size | Stage | Status |
|---|---|---|---|---|
| 4.1 | Chapter 1 Level 2-4 "Good Call, Bad Luck", **without the variance simulator** (below) | 1 lesson, 12–16 screens | `VARIANCE` | [ ] |
| 4.2 | Scalping Chapter 8 Level 15 "What You'll Actually Be Offered" + renumbering | 4 lessons | `OFFER` | [ ] |
| 4.3 | `content/glossary.yaml`: one sentence per term of every `terms_introduced` | ~300 terms | `GLOSSARY` | [ ] |
| 4.4 | Bonus side lessons "Spot it" (2.7) | 2–3 per chapter from Chapter 2 on, 2–3 replays each | `FUN-PASS` (hand-written), `ARENA-TAB` (generated) | [ ] |
| 4.5 | The replay bank | 22 replays per path | `REPLAY-PILOT`, `REPLAY-BANK`, `ARENA-PATHS` | [ ] |
| 4.6 | Drill packs `selection` and `risk-calls` | 2 packs | `DRILLS` | [ ] |
| 4.7 | Swing Trading Chapters 2–8, then Day Trading Chapters 2–8 — written with Parts 1–3 from the start | 14 chapters | `SWING-n`, `DAY-n` | [ ] |
| 4.8 | Skills (2.6) and term fixes for all written chapters | 388 lessons | `CONTENT-FIX-1` … `-8` | [ ] |
| 4.9 | Test bench entries for every new field: a decision with `stop`, `target` and `notes`; a chart with `session_open`; a story with an `alert`; a test intro with `facts`; a header with `skills`; one bonus file | `demo/all-screens.yaml` + one bonus file in `demo/` | `CONTENT-DESIGN` | [ ] |
| 4.10 | The first trade (onboarding): today a fixed chart in `src/onboarding/firstTrade.ts`. Move it to content if the content sessions want to own it (`content/onboarding.yaml`); otherwise it stays | 1 chart | `ONBOARDING` | [ ] |

### 4.1 Lesson 1·2-4 without the simulator

The variance simulator (`variance-sim`) is dropped (David, 2026-10-03, rule 1.1). The lesson teaches the same idea — a good decision can lose, and one trade says little — with the learner's own decisions and the decision grid, and without a single rate. A sequence that fits `docs/curriculum.md`:

1. `intro` — "A good call can still lose."
2. `story` — a clean read on XYZ at a level; the learner is about to buy.
3. `chart-decision` (buy / wait), best `buy`, and it loses: the first correct decision in the course that loses. The reveal grades it green and puts the dot in "Right call · Lost".
4. `theory` with the `decision-grid` visual — decision and result are two different things: four cells, right or wrong, won or lost.
5. `theory` — why a good read can lose: the next buyer, seller or headline cannot be known.
6. `tf` — "A trade that lost was a bad decision." (false)
7. `sort` — four short trades into the grid's cells.
8. `chart-decision`, best `wait`, where buying would have won: standing aside was still right (the grey "had you bought" line).
9. `numeric-input` — "Eight decisions, six of them right. Two of the right ones lost. How many right calls won?" (4)
10. `theory` — "How often does it work? Your records say." Nobody can promise how often a setup works for you; you find out by keeping score, and Chapter 6 shows how.
11. `mc` — which cell a described trade belongs in.
12. `story`, `label: takeaway` — "Judge the decision, not the result."

The `decision-grid` visual is built (`docs/UI.md` §6.10, `docs/schema.md`). The reveal's **Why?** opens card 4.

---

## Part 5 — Done log

| Date | Item | Stage | PR |
|---|---|---|---|
| | | | |
