# Appendix E.0–E.2: Prompt frame, offer, replays

_Part of the [build plan](README.md) · §17_

### E. Prompt frame and content prompts

**E.0 – The frame of every prompt** (the stages above fill it in; paste it into a new session)
```
Stage <NAME> from docs/plan/.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "<NAME>" section in docs/plan/ in full; read the places in docs/ it names.
<Content stages: docs/content-todo/ as well.>
Build exactly that scope — nothing from later stages.

<Especially important: …>

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

The following detailed prompts come from the previous plan and have proven themselves. Updated:
- Decisions A–C are now made.
- A PR instead of a push to `main`.
- The new [v4] rules apply.
- **[DESIGN-REVIEW]** The rules of `docs/content-todo/01-rules-from-the-design-review.md` Part 1 apply: no odds, the chart ramp, don't overdo, terms used well, standalone questions.

**E.1 – OFFER (Chapter 8 Level 15 and its renumber)**
```
Read CLAUDE.md, then docs/rules/01-what-we-build.md §1, docs/rules/04-numbers-and-realism.md §3.6, docs/rules/07-variance-and-typed-numbers.md §3.11, §3.12 and docs/rules/10-legal-and-safety.md §7, docs/level-files/ and
docs/ui/ in full, then the Chapter 8 section of docs/course/ - find it with
`grep -n 'Chapter 8 —' docs/course/` and read that range; the first match is the
scalping one.

Part 1 - the renumber, committed on its own.
In content/paths/scalping/chapter-08-the-trading-day/, Levels 15-17 become 16-18:
git mv each level-15-*.yaml to level-16-*.yaml, 16 to 17, 17 to 18. Highest first so
nothing collides. Update each file's `id`, and repair the `prerequisite` chain so it
reads straight through with Level 15 absent for now (14's last sub -> 16-1). Grep the
repo for anything naming those ids or the old titles and fix it (docs, the content
index, tests). Run `python3 tools/validate_content.py`; 0 errors. Commit as
"content: renumber chapter 8 levels 15-17 to 16-18".

Part 2 - write Level 15, "What You'll Actually Be Offered", 4 sub-levels, per the
curriculum table. Read first, and do not contradict: Chapter 3 Level 10 (the two
ceilings), Chapter 6 Levels 1-2 (the stop, R) and Level 9 (session limits), Chapter 3
Level 14-1 (borrow availability, and its {{market.scalping_note}} screen - build on it,
never repeat it), and Chapter 1 Levels 12-13 (what they say about accounts and shorting).

The product decisions are made (docs/plan/04-decisions.md §4.1, docs/rules/01-what-we-build.md §1.1 and docs/rules/04-numbers-and-realism.md §3.6):
(A) the path ends at a person who can start - this level gives the knowledge for the
first real account, and it is still orientation, not instruction; (B) a short needs a
margin-enabled account - say so plainly; (C) several same-day round trips need a margin
account, and in the US the pattern-day-trader rule applies below the equity threshold in
{{market.regulation_note}} - say so plainly, against the six-trade session this path
teaches.

  15-1  The two account types and what each allows. A cash account cannot borrow, so it
        cannot short at all - and 38% of this path's decisions are shorts. In Europe, the
        leveraged wrappers this path did not teach: recognize them, never use them here.
  15-2  What leverage does to numbers they already own. R is unchanged - the stop is
        still the stop. The ruin arithmetic is not: a deposit that survives six
        stop-outs on cash does not survive six at 5:1. Use Chapter 3's account sizes.
  15-3  What the rules do to the plan they wrote. {{market.regulation_note}} in place;
        the pattern-day-trader threshold against the six-trade session Chapters 6 and 8
        teach; settled funds against the same. Tax gets exactly one screen: profits are
        taxed, treatment differs by country and holding period, ask an adviser - no
        rate, no jurisdiction rule, no worked example (§7).
  15-4  Practice: choosing the account that fits their own plan sheet, and the checklist
        for judging a broker (regulation, deposit protection, cost structure, order
        types, borrow) - criteria only, never a name.

Also in this stage, content/market_profiles.yaml: EU-DE fee_note names no prices (§7);
EU-DE regulation_note says precisely what ESMA's negative-balance protection covers
(leveraged CFDs), not "losses are capped at the account"; the US pattern-day-trader
wording is checked against the current FINRA rule (the rule is under reform - search,
cite the source and date in the report); add a `checked:` date to every regulation
note; timezone "German time" instead of "CET"; first_minutes in the same format as
premarket.

Non-negotiable:
- No product, platform or provider named. No mechanics for opening or using a
  leveraged account. Nothing phrased as a recommendation. §7 governs every screen.
- Every number obeys docs/rules/04-numbers-and-realism.md §3.6, including both ceilings and the account cap;
  the [v4] rules in §3.11 and §3.12 apply to every decision and numeric screen.
- {{market.*}} tokens for every session time, index and regulation note - never a
  literal clock time, never a jurisdiction claim written in prose.
- Set `reinforces: [3, 6]` per the curriculum table.

Run `python3 tools/validate_content.py --strict`, `tools/test_validate.py` and
`tools/check_sizing.py`; 0 errors, no warning naming a file you wrote. Commit as
"content: chapter 8 level 15" and open the stage PR.

Report: the four subs with their screen mix, every place you used a {{market.*}} token
instead of a jurisdiction claim, your sources for the regulation notes with dates, and
any sentence you were unsure sits on the right side of the §7 line - flag those rather
than deciding them.
```

**E.2 – REPLAY-PILOT and REPLAY-BANK**

Pilot:
```
Read CLAUDE.md, then docs/rules/06-replays.md §3.10, docs/level-files/07-drill-packs-and-replays.md § Replays and docs/ui/05-chart-questions-and-mistakes-round.md §4.4
and docs/ui/13-tiers-replays-and-plus.md §7.7 in full. Then read content/paths/scalping/chapter-07-scalping-playbook/
level-02-1.yaml and level-02-2.yaml - the VWAP bounce card and its five fields are the
thing this replay is an instance of.

Write one replay to content/replays/scalping/vwap-bounce-01.yaml: reading level 2
(setup named, card hidden), ~60 bars, one clean VWAP bounce and two decoys that each
fail exactly one named field of the same card.

Then extend tools/validate_content.py with the replay rules from docs/level-files/07-drill-packs-and-replays.md
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
and open the stage PR.

Report: the bar series with each marked moment and what fills at it, the three grades a
learner would get for acting at bars trigger-1, trigger and trigger+2, and your honest
read on whether 60 hand-authored bars is sustainable 22 times per path.
```

Bank (per session, three replays):
```
Read CLAUDE.md, then docs/rules/06-replays.md §3.10, docs/level-files/07-drill-packs-and-replays.md § Replays and docs/ui/05-chart-questions-and-mistakes-round.md §4.4.
Read content/replays/scalping/vwap-bounce-01.yaml - the pilot - and the last replays you
wrote, so bar rhythm and decoy style continue rather than restart. Read the Chapter 7
level that teaches [card], for the five fields.

Write [3] replays for [card] to content/replays/scalping/, at reading level [1/2/3] per
the table in docs/course/06-drill-packs-and-replays.md § Replays.

Every rule in docs/rules/06-replays.md §3.10 binds. The two that go wrong silently:
- A decoy you cannot explain is noise, not difficulty. Each fails exactly one named
  field, and the note says which. If you cannot name it, cut the decoy.
- The arithmetic spreads across 60 bars and no single screen shows it all. Recompute
  every stop distance, share count, R-multiple and filled_at from the bars as written.

Verify each file alone before writing the next. Run `validate_content.py --strict`,
`test_validate.py` and `check_sizing.py`; 0 errors, no warning naming a file you wrote.
Commit as "replays: [card] levels [n]" and open the stage PR.

Report: per replay, the marked moments and their labels, which field each decoy fails,
and anything in the placement table you could not honor and why.
```
