# New fields

_Part of the [content to do](README.md) · §2–2.7_

## Part 2 — New optional fields the app renders

All of them are optional, so every existing file stays valid. The formats are in `docs/level-files/`, marked **[DESIGN-REVIEW]**; the validator knows them; the test bench does not show them yet (item 4.9). Until content uses them, Settings → Testing → **New designs** in a test build plays a lesson that does (`src/home/newDesigns.ts`: the market alert; stop and target with two notes and the open; the same setup stopped out; the `decision-grid` card; scanner rows with `spark`; a ladder with `shares`; the order ticket; the match). Its objects show each field's shape, written in TypeScript instead of YAML.

### 2.1 Stop and target on `chart-decision` (`stop`, `target`)

Already in the schema since v4 and required from Chapter 3 on for long and short decisions (`docs/rules/05-tests-consistency-and-copy.md` §3.8). Since `DESIGN-REVIEW` the app draws them:
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
- The app keeps a note's tag off the chart's other words (the levels' labels, the plan's labels, the "decision" tag) and, where it can, off the other bars; with no room on its side it takes the bar's other side (`docs/ui/08-quotes-and-charts.md` §6.4). Short notes leave it the most room.

### 2.2a Level labels (the existing `levels[].label`) — a recommendation

Not a new field, but since `DESIGN-REVIEW` the app draws a level's label (the label and its price, "Pre-market high 16.60") over the bars on a rim of the page's colour, at the end of the line where it covers the fewest bars (`docs/ui/08-quotes-and-charts.md` §6.4). On a narrow chart a long label still crosses candles, sometimes the decision candle.
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
    time: "1 min after the open"      # no clock time written literally (docs/rules/04-numbers-and-realism.md §3.6); tokens are fine
    facts: ["Gap +6.2 %", "RVOL 4.8×"]   # 1–3 chips, at most 16 characters each
    spark: [17.40, 17.62, 17.55, 17.90, 18.10, 18.05]   # optional: 5–30 prices, the move so far
```
- The facts are not repeated in the text. Text stays within 150 characters, usually much less.
- Only scenes that are a moment in a session with one stock. A takeaway (`label: takeaway`) never has an alert.
- `spark` follows the realism rules of `docs/rules/04-numbers-and-realism.md` §3.6 (the price band, ticks).

### 2.4a The day on a scanner row (`spark` on `scanner-table` / `scanner-pick` rows)

Every scanner row shows a small sparkline of its day beside the ticker (`docs/ui/09-order-tools-and-other-visuals.md` §6.8). Without `spark` the app draws a plain line from the previous close to today's change, on one scale for the whole table — honest, but it says no more than the % column. A `spark` shows the shape of the day, which is what Chapter 5 teaches a trader to read at a glance (a steady climb against a spike that faded).

```yaml
rows:
  - {ticker: MARL, price: 14.80, change_pct: 8.6, rvol: 6.8, spread: 0.02, catalyst: "Results",
     spark: [13.63, 13.70, 14.10, 14.55, 14.40, 14.62, 14.80]}   # 5–30 prices, first = previous close
```
- The first value is the previous close and the last is `price`, so the line and the % column agree; the validator warns when they do not.
- Only where the shape matters to the question (a faded spike, a slow grind); a row with no `spark` keeps the plain line.

### 2.4b The order's size on a depth ladder (`shares` on `depth-ladder`)

After Check the app walks the market order through the book, level by level (`docs/ui/04-question-types.md` §4.2). It needs the order's size. Today it reads it from the English prompt ("You market-buy 1,400 shares"), which works for 39 of the 40 ladders and breaks once the prompts are translated (Phase J). So every `depth-ladder` gets `shares`:

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

### 2.6 Skills (`skills` in the header, `content/skills.yaml`)

David, 2026-10-03: "After every lesson the User does where he learns a new word, technique, and so on there is a small overview of what he has learned … those cards/skills get transferred to the practice tab … listed by chapter. Here he can get the info cards again for every individual skill." And 2026-10-04: "opening a new .yaml file which contains all the skills and infos, and make sure to add every skill name to a new tab in the already existing level .yaml files so it becomes easier and automated."

**Done for all eight written chapters (2026-10-04).** `content/skills.yaml` holds 402 skills (194 words, 208 techniques), each with one line of `info`; every level file has its `skills` line. Format and rules: `docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills".

```yaml
# a level file
terms_introduced: ["Stop order", "Stop-loss"]
skills: ["Stop order", "Stop-loss", "Placing a stop on the right side"]   # words first, then techniques

# content/skills.yaml
- name: "Placing a stop on the right side"
  kind: technique
  info: "…one line of what doing it means, ending with a full stop."
```
- The words in `skills` are exactly the lesson's `terms_introduced`. A word's card is found by the app: the first `theory`, `example` or `carousel` screen of the lesson whose text contains it. Rule 1.4 makes sure there is one.
- A technique names what the learner can now *do*, not a topic: "Reading a quote in two seconds", not "Quotes". At most 40 characters. It opens its lesson's first teaching card. One lesson teaches it.
- Every `new-theory` lesson teaches at least one skill; a practice level teaches the technique it drills, on its first sub-level; tests and final exams teach none.
- For new chapters (Swing, Day Trading): write the names into each level file, run `python3 tools/skills.py --sync` (it adds the words from `terms_introduced` and appends entries with empty `info` to `content/skills.yaml`), write each `info`, move the entries under their chapter, run the validator. `python3 tools/skills.py --chapter N` reads one chapter's skills back for proofreading.

### 2.7 Bonus side lessons (new files)

The map draws optional side stops beside the path (`docs/ui/10-path-map.md` §7.1). Since `DESIGN-REVIEW` they come from files of their own, in the chapter's folder:

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
- 2–3 `chart-replay` screens (`docs/ui/05-chart-questions-and-mistakes-round.md` §4.4), reading level 1 or 2, played bar by bar; the learner does not know where, or whether, there is a setup. One of them may have no setup at all (`allow_none`).
- No `summary`, no `badge`. The validator checks the category, `after` and that the level named exists.
