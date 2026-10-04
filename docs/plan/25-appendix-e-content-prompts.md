# Appendix E.3–E.8: Content prompts

_Part of the [build plan](README.md) · §17_

**E.3 – State chips (part of `CONTENT-FIX-3`, `-6`, `-7`)**

Current share: Chapter 1 0 % · 2 100 % · 3 37 % · 4 100 % · 5 100 % · 6 38 % · 7 **16 %** · 8 74 %. The 0 % in Chapter 1 is probably right; check that first.
```
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

Report the percentage before and after, and any scenario where the state genuinely
belonged in the sentence - those are legitimate and should be listed, not forced.
```

**E.4 – DRILLS (per pack)**
```
Write [25] drill screens for the pack "[pack id]", covering these concepts:
[concept list]. Format per the drill-pack spec in docs/level-files/.

These are drills, not a lesson: no intro, no theory, no summary - question screens only,
each standing alone. The learner has already been taught this in [chapter/level];
assume it and test it.

Vary the interaction across the pack and vary the difficulty: about a third should be
near-misses where the right answer is "pass" or "no trade". Answer-key hygiene per
docs/rules/03-content-rules.md §3.5 applies to the pack as a whole - check the distribution across all 25
before you finish. The outcome rule in §3.11 and the sign rule in §3.12 apply too.
Price and volume bands per §3.6. Every number arithmetically sound.
```

**E.5 – Review pass A (does it teach?)**
```
Read CLAUDE.md and the docs it names. Then read the complete [path] path in path order:
content/shared/chapter-01-market-basics/, then content/paths/[path]/ chapters 2-8, every
sub-level, as a learner with zero prior knowledge. `python3 tools/export_readable.py`
gives you each chapter as readable text.

Check: terms used before definition across chapters; callbacks to things not yet taught;
the difficulty curve, and whether any level jumps or stalls; question types and prompts
repeated across chapters; distractors that give the answer away; chart-decision "best"
answers that do not follow from the lesson just given; whether variance is taught before
a correct decision first loses, and whether every such reveal reads as "right call,
losing trade" rather than as a mistake; worked numbers; the Chapter 7 playbook setups
against the sources named in docs/rules/08-sources.md §4; {{market.*}} tokens used where required;
anything a beginner would find boring, patronising or confusing; whether anything is
repeated enough to stick; and whether the questions are answerable by someone who
genuinely understood the lesson and nothing more.

Run `python3 tools/validate_content.py`, `--strict`, `tools/check_sizing.py` and
`tools/test_validate.py` first, so you do not re-report what a tool already catches.

Then give a numbered findings list, most important first, naming the file and screen for
each. Change nothing. Wait for approval before any fix.
```

**E.6 – Review pass B (does it survive reality?) + graduate profile**
```
Read CLAUDE.md, then docs/rules/01-what-we-build.md §1, docs/rules/04-numbers-and-realism.md §3.6 and docs/rules/10-legal-and-safety.md §7 in full, content/market_profiles.yaml,
and the graduate profile in docs/plan/01-goal-and-guardrails.md §0.

This pass does not check whether the course teaches well - Pass A does that. It checks
whether the course survives contact with reality. Work these five questions across the
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
5. The graduate profile, point by point: where is each point taught (file, screen), or
   is it missing - and where would it belong?

Two method rules, and ignoring them is how this pass fails:
- Match counts lie. Read the hits. A previous scan reported `margin` and `settle` as
  covered; every match was the word "marginal" and the verb "settles". A grep result is
  a place to look, never an answer.
- Grep the concept, not the word. The same scan reported the instruments lesson absent;
  it exists inside {{market.scalping_note}}, which contains neither "leverage" nor
  "CFD". Before concluding something is missing, ask what it would be called here.

You are worst at this pass, because it needs knowledge from outside this repository.
Where you cannot decide, say so and name the decision rather than guessing.

Numbered findings list, most important first, file and screen for each. Change nothing.
```

**E.7 – Clause for new paths (Swing, Day Trading)**
```
The Scalping path's Chapter [N] covers the same ground for a different holding period.
Read it for structure, pacing and screen mix - then write for this path's timeframe from
scratch. Do not port examples across. Where the honest answer is that this path does the
same thing scalping does, say so in one screen and move on rather than padding the level.

One rule changes for this path (docs/rules/04-numbers-and-realism.md §3.6): the concentration teaching is
scalping's. On swing the risk budget binds, not the account ceiling; positions run
10-50% of the account and several are open at once, so total exposure and total open
risk are what matter - the validator checks both. Chapter 3 revises the learner's
`setup_max_account_pct` with this path's reason. Overnight and weekend gaps are this
path's own risk; say what a gap does to a stop.

On day trading one position is open at a time, occasionally two, but the stop is wider
than a scalp's: the 1 % risk budget usually decides the size, and the account ceiling is
the check you still run (positions 50-95 % of the account). 5-10 trades a day, flat by
the close; the daily loss limit ends the day. Several same-day round trips need a margin
account, and in the US the pattern-day-trader rule applies below its equity threshold -
Chapter 6 Level 9 (the daily limits) and Chapter 8 Level 15 say so plainly (decisions B and C), with
{{market.regulation_note}} for the current wording. Chapter 3 revises
`setup_max_account_pct` with this path's reason.

Every [v4] rule applies from the first file: variance (§3.11) from Chapter 2, stop and
target on directional decisions from Chapter 3, signs (§3.12), text length, spelling,
visuals.
```

**E.8 – SIZING** (for any chapter in which `check_sizing.py` reports breaches)
```
Read CLAUDE.md and docs/rules/04-numbers-and-realism.md §3.6 in full - the two ceilings, the account cap, the
per-path table and the price bands.

Run `python3 tools/check_sizing.py --chapter N` and re-size every position it lists so
that shares × decision price <= 0.95 × the account named in that file (and, after the
learner's plan card, the plan's ceiling - docs/rules/04-numbers-and-realism.md §3.6).

How to re-size, in this order of preference:
1. Lower the share count. Check what the new count does to every other line in the same
   file - check_sizing.py prints them.
2. Shift the whole screen's prices by a constant. This preserves every cent-level
   distance, so stop distances, R-multiples and dollar totals stay exactly correct.
   Keep the result inside the path's price band (§3.6).
3. Raise the account named in the file, but only within $5,000-30,000 and only if the
   file's own narrative allows it.

Never change a stop distance to make the arithmetic work - that changes what the lesson
teaches. After each file, recompute by hand: stop distance, share count, risk in
dollars, R-multiple, and every total the screens quote. Then run validate_content.py,
check_sizing.py --chapter N and test_validate.py: 0 errors, 0 breaches in your chapter.
Open the stage PR. Report the breach count before and after and which method you used
where.
```
