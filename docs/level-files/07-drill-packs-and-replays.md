# Drill packs and replays

_Part of the [level file format](README.md)_

## Drill packs **[v3]**

The Practice hub is fed by drill packs, not by lesson files: `content/drills/<path>/<slug>.yaml`.
A pack is a flat bank of scored screens with no lesson structure — no intro, no theory, no ordering.

```yaml
id: "scalping-setup-a-vwap-bounce"   # <path>-<slug>; the file is <slug>.yaml
path: scalping                       # one real path — never `all` (see below)
title: "VWAP bounce drills"
unlocked_by: "2-4"            # the sub-level that must be completed first
unlocked_by_chapter: 7        # the chapter that sub-level lives in
tags: [vwap, setup-a]
concepts: ["VWAP bounce", "Reclaim", "First touch"]   # what wrong answers mark weak
screens:                      # any question type; chart-decision / swipe-deck / compare preferred
  - type: chart-decision
    ...
```

**`unlocked_by` takes two fields.** A sub-level id is `<level>-<sub>` and is only unique
*inside a chapter* — every chapter has a `2-4`. So a pack names the chapter as well, and the
pair resolves to one file: `content/<scope>/chapter-NN-*/level-LL-S.yaml` in the pack's own
path, or in the shared chapter when `unlocked_by_chapter` is 1.

**A pack belongs to one path.** Chapters 2–8 differ per path, so the same pack shape is
written once per path with that path's charts, prices and setups; `path: all` is not
allowed on a pack, whatever the table in `docs/course/` says in its Path column.

Rules: every screen is a question screen (no `intro`, `theory`, `summary`, `recap` or any
other lesson archetype); 10–40 screens per pack; `id` is `<path>-<slug>` and the file is
`content/drills/<path>/<slug>.yaml`; `unlocked_by` + `unlocked_by_chapter` must name an
existing sub-level; `tags` and `concepts` are non-empty; packs never cost hearts and are never
timed. Packs are drawn from by the daily mix and by setup drills, weighted by the learner's
weak concepts.

Each screen carries the same shape rules as it does inside a lesson (options, answers, chart
conventions, and `no-trade` in `reasonable` whenever `best` is directional). The rules that
belong to a *lesson* do not apply: there is no screen budget, no time estimate, no first or
last screen, and no "2 `mc` in a row" — the Practice hub draws in its own order.

### The manifest — `content/drills/packs.yaml`

One entry per pack in the drill table of `docs/course/`, and the thing the batch run
(`tools/build_drill_batch.py`, stage DRILLS in `docs/plan/18-phase-g-arena-build.md`) is built from. An entry carries
the pack's header fields plus `slug`, `file`, the commissioned `screens` count, and three
`exemplars` — screens from the linear chapter the pack unlocks from, by file and 1-based
screen index, one `straightforward`, one `near-miss` whose answer is pass or no trade, one
`arithmetic`. A pack on disk must have an entry, and must agree with it.

### Validator rules for packs

Errors: the header fields above; `id`/`path`/folder agreement; 10–40 question screens with no
lesson archetype among them; every screen's own shape; `unlocked_by` resolving to a real
sub-level; a pack with no manifest entry, or one contradicting its entry's `path` or unlock.
Manifest errors: a duplicate id, a commissioned size outside 10–40, an unlock that does not
resolve, an exemplar whose file, screen index or screen type does not exist.

Pack-level warnings (errors under `--strict`, like the chapter-level ones — batch output is
not exempt): answer-key hygiene from `docs/rules/03-content-rules.md` §3.5 computed over the whole pack
(correct-option position, the length tell, the 40–60 % true/false split, the punctuation tell,
the 2:1 long/short ratio from eight directional decisions up), the §3.6 ceilings (a position
over the account behind it, or over 95 % of it — a screen that names no account is measured
against the smallest account the pack names), bar volume outside 4,000–500,000, fewer than
four question types in a pack, a pack whose size differs from the commissioned one, and a pack
of eight or more `chart-decision` screens with no `no-trade` among them.

## Replays **[v3]**

The Spot-it tab (`docs/ui/13-tiers-replays-and-plus.md` §7.7) and the `chart-replay` screen type (§4.4) are fed from
`content/replays/<path>/<slug>.yaml`. One file is one replay: a run of bars the learner
advances by hand, with every moment that matters marked in the file.

```yaml
id: "scalping-vwap-bounce-01"     # <path>-<slug>; the file is <slug>.yaml
path: scalping                    # one real path, never `all` — same rule as a drill pack
title: "A morning that offers two bounces"
unlocked_by: "2-4"                # sub-level that must be completed first
unlocked_by_chapter: 7            # the chapter that sub-level lives in
tags: [vwap, setup-a, discipline]
concepts: ["VWAP bounce", "First touch", "Reclaim"]   # what a Phantom or Missed marks weak

# --- what the learner is told ---
names_setup: true                 # is the setup named up front?
shows_card: false                 # are the card's five fields shown beside the chart?
allow_none: false                 # is "Nothing here" a complete, correct answer?
reading_level: 2                  # 1-3, and derivable from the three flags + decoy count

# --- the chart ---
account: 20000                    # the account every stated size is measured against
bars:                             # 40-80 candles, [open, high, low, close]
  - [22.14, 22.20, 22.10, 22.18]
  - ...
volume: [86000, 74000, ...]       # same length as bars
vwap:   [22.16, 22.17, ...]       # optional, same length
levels: [{price: 22.40, label: "High of day"}]   # optional

# --- the moments ---
setups:
  - card: setup-a-vwap-bounce     # the Chapter 7 card this is an instance of
    direction: long
    fields:                       # the card's five fields, and the bar each one fills at
      - {name: context,     filled_at: 6}
      - {name: first_touch, filled_at: 23}
      - {name: reclaim,     filled_at: 27, marginal: true}
      - {name: volume,      filled_at: 27}
      - {name: room,        filled_at: 27}
    trigger_bar: 27               # must equal the highest filled_at — see below
    stop: 22.02
    target: 22.46
    shares: 900

decoys:
  - card: setup-a-vwap-bounce     # looks like the same setup and is not
    bar: 15
    fails: reclaim                # the one field that never filled
    note: "Price tagged VWAP and turned, but the candle closed back under it."
  - card: setup-a-vwap-bounce
    bar: 34
    fails: first_touch
    note: "Third touch, not the first — the card takes the first."
```

**The trigger bar is not a free choice.** A setup triggers at the bar its **last** card field
fills, so `trigger_bar` must equal the highest `filled_at` in `fields`. That single rule is
what makes the grades arithmetic rather than opinion: **Early** is any action before
`trigger_bar`, **Textbook** is `trigger_bar ± 1`, **Late** is anything after. An author who
writes a trigger two bars later than the fields support has written an ungradeable replay, and
the validator says so.

**Every decoy must name the field it fails.** `fails` is the field of its `card` that never
filled at that bar, and the post-mortem shows it. This is the rule that keeps difficulty
honest: a near-miss you cannot explain is not a decoy, it is noise, and a scored coin flip
teaches superstition instead of expectancy (`docs/rules/06-replays.md` §3.10).

**Reading level is derived, not declared.** `reading_level` is written in the file for the
tier gate, and the validator recomputes it and fails a mismatch:

| Level | `shows_card` | `names_setup` | decoys |
|---|---|---|---|
| 1 | true | true | 0–1 |
| 2 | false | true | 1–2 |
| 3 | false | false | 2–4 |

A replay with `allow_none: true` carries no `setups` at all — the whole session is decoys, and
advancing to the last bar without acting is the correct answer. It is always level 3.

Errors: the header fields above; `id`/`path`/folder agreement; `unlocked_by` +
`unlocked_by_chapter` naming an existing sub-level; 40–80 bars; `volume` (and `vwap`, if
present) the same length as `bars`; candle `high` ≥ max(open, close) and `low` ≤ min(open,
close); at least **four** marked moments (`setups` + `decoys`); every `trigger_bar` equal to
the highest `filled_at` of its own fields and at least 3 bars before the end; every
`filled_at` and `bar` inside the chart; no setup and decoy on the same bar; every decoy's
`fails` naming a field of its card, with that field either absent from the setup instance or
filling after the decoy's bar; `reading_level` matching the table above; `setups` empty
whenever `allow_none` is true; and every stated `shares × price` inside the §3.6 ceiling
against `account`.

Warnings: fewer than 2 decoys in a level-2 or level-3 replay; a setup whose fields all fill in
the first quarter of the chart (nothing to sit through); more than half the bars after the last
marked moment; prices outside the path's band (§3.6); a `marginal` flag on more than two of the
five fields (that is noise, not a marginal read).
