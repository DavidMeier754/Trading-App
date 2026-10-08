# Header

_Part of the [level file format](README.md)_

## Header

```yaml
id: "3-2"                 # "<level>-<sub>", must match the filename
title: "Market or Limit?" # shown on the path map (level title; subs share the level title)
subtitle: "When Speed Wins" # [v4] this sub-level's own short name: lesson-complete screen, level card
chapter: 3
chapter_title: "Orders, Costs & Position Size"
path: scalping            # all | scalping | day-trading | swing-trading
category: new-theory      # new-theory | repetition | test | final-exam
tags: [orders, execution] # free tags, used for stats and practice
icon: ticket              # optional: the level's symbol on the map, what it teaches (see below)
learning_goal: "User can choose between a market and a limit order for a given situation."
purpose: "One sentence on why this matters in real trading."
terms_introduced: ["Market order", "Limit order"]   # new glossary terms defined in this sub
skills: ["Market order", "Limit order", "Choosing market or limit"]   # [Skills] what this sub teaches (see below)
reinforces: [1, 2]        # [v3] earlier chapters this sub deliberately re-tests; [] for pure new theory
prerequisite: "3-1"       # or null for the first sub of a chapter
xp: 20
difficulty: 1             # 1 easy, 2 medium, 3 hard
path_position: main       # main | fan-out:<strand-name> | merge   (optional, default main)
sources: [consensus]      # Chapters 1–3: [consensus]; Chapter 4+: ≥2 named sources
notes: "Author notes, optional."
screens: [...]
```

**`icon`.** Optional. The symbol on the level's map node, standing for what the level teaches or, for a practice level, what it practises: `candle`, `bell` for the open, `levels` for support and resistance. Every lesson of one level names the same icon, or leaves it out; the first one named is used. The names are the ones the app draws: the hand-drawn icons of `src/home/icons.tsx` (its `ICON_NAMES`) and the mapping table of `src/home/symbols.tsx` (`ALIASES`, a content name drawn as a hand-drawn icon; `SYMBOLS`, a name drawn by a Lucide symbol, ISC licence). The validator rejects any other, and a carousel card's `icon` is checked against the same names. **[LOOK-COMPONENTS]** Every level of lessons names one — Chapters 3–8 got theirs in that stage — and the validator warns when a level of `new-theory` or `repetition` lessons has none. A practice level takes the symbol of what it practises, a callback the round arrow back (`rewind`), a chapter review the book. Checkpoints, the Final Exam and the path choice ignore it and keep their own symbols (docs/ui/10-path-map.md §7.1). A level without one shows a bulb (new ideas) or round arrows (practice).

**`skills` [Skills].** Required, on one line. The names of the skills this sub-level teaches, each an entry of `content/skills.yaml` (see "Skills" below): its words first, which are exactly its `terms_introduced`, then its techniques. They are shown after the lesson, collected in Practice → Skills, and each opens the card that taught it (`docs/ui/07-lesson-chapter-and-tier-complete.md` §5.3, docs/ui/12-practice-and-stats.md §7.3): a word the first `theory`, `example` or `carousel` screen whose text contains it, a technique the lesson's first `theory`, `example`, `carousel`, `walkthrough` or `visual` screen. Every `new-theory` sub-level teaches at least one skill; a `repetition` sub-level may teach one (a practice level's technique) or none; tests and final exams have `skills: []`. `python3 tools/skills.py --sync` writes the line and keeps the words in step with `terms_introduced`.

**`reinforces` [v3].** A list of chapter numbers (not level ids). It is a claim that this sub-level re-tests that chapter's material *in this chapter's context*. The validator uses it for the reinforcement quotas in `docs/rules/03-content-rules.md` §3.3, so do not declare it decoratively — a sub with `reinforces: [1]` must contain at least one question that genuinely needs Chapter 1 knowledge.
