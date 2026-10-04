# Skills, bonus lessons, market profiles

_Part of the [level file format](README.md)_

## Skills **[Skills]**

`content/skills.yaml` holds every skill of the course, one entry each, grouped by chapter and level under comments. It replaces the glossary file planned in v4 (`content/glossary.yaml`): a word's `info` is its definition, and the term sheet (`docs/ui/14-glossary-and-copy.md` §8), "What you learned" (§5.3) and Practice → Skills (§7.3) all read from it.

```yaml
- name: "Spread"            # 1–40 characters; how lessons list it and the learner reads it
  kind: word                # word: a term the course defines · technique: something the learner can now do
  info: "The gap between the price you can sell at and the price you can buy at; buy and sell straight back and you have paid it once."
  aliases: ["bid-ask spread"]   # optional, words only: other spellings the marker should catch (stage GLOSSARY)
- name: "Spread before size"
  kind: technique
  info: "Holding the spread against the stop distance before sizing, and taking the lower of the two ceilings on the trades that pass."
```

- **A word** is a term a lesson defines: it is in that lesson's `terms_introduced` and its `skills`. Its `info` is one plain sentence that agrees with the card that defines it. A word is one skill however many paths teach it; each path introduces it once, and a Chapter 1 word counts on every path.
- **A technique** names what the learner can now *do*, not a topic: "Reading a quote in two seconds", not "Quotes". Its `info` says what doing it means. Exactly one lesson lists it.
- `info` is one line of at most 160 characters, ending with a full stop.
- Where a skill is taught is never written here: the level file that lists it says so, and the app reads it from there.

**Adding a skill:** put its name in the level file's `skills` line, run `python3 tools/skills.py --sync` (it appends an entry with empty `info`), write the `info`, move the entry under its chapter's comment, and run the validator. `python3 tools/skills.py` lists every lesson's skills with their info; `--chapter N` lists one chapter.

## Bonus side lessons **[DESIGN-REVIEW]**

The optional side stops beside the path (`docs/ui/10-path-map.md` §7.1) come from files of their own, in the chapter's folder, named after the level they follow: `level-04-bonus.yaml` sits beside the path after Level 4.

```yaml
id: "4-bonus"             # "<level it follows>-bonus", must match the filename
title: "Spot it"
subtitle: "Three charts, bar by bar"
chapter: 2
chapter_title: "Charts 101"
path: scalping
category: bonus           # optional for the learner: never blocks the path, never timed, never a heart
after: 4                  # the level that opens it: a level of this chapter, not a test, and not the
                          # level right before a test (that place is the mistakes review's, docs/ui/10-path-map.md §7.1)
gems: 10                  # paid once, on the first finish
xp: 10
tags: [structure]
learning_goal: "Learner spots a setup forming, or sees there is none, bar by bar."
purpose: "Recognition with the outcome still hidden."
prerequisite: null        # always null: a side stop opens with its level, not with a sub
difficulty: 2
sources: [consensus]
screens: [...]            # an intro, then 2–3 chart-replay screens; no summary, no badge
```

The validator checks the category, that `after` names a level of the chapter that is neither a test nor the level right before one, the screen shape (an `intro` and 2–3 `chart-replay` screens) and the replay rules (§ Replays). A bonus file is not counted in the chapter's levels, sub-levels or question quotas.

## Market profiles **[v4]**

`content/market_profiles.yaml` carries, per profile, the `{{market.*}}` values (session times, currency, index, notes). **[v4]** Every profile has `checked: YYYY-MM-DD` — the date its regulation, fee and scalping notes were last verified against the rules in force — and the notes follow `docs/rules/10-legal-and-safety.md` §7: fee notes name categories, never prices; regulation notes say precisely what a rule covers.
