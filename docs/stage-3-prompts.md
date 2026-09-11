# Stage 3 — ready-to-run authoring prompts
One filled-in prompt per level block, in the writing order from `docs/curriculum.md`. Copy the next un-done block's prompt verbatim into a fresh session and run it. The prompt body is byte-identical to the template in `docs/build-plan.md`; only the five variables are filled.
**Before you paste, check two things:**
1. **Push target.** Every prompt commits and pushes straight to `main`, so you do not have to move anything by hand. Each block is validated before it is pushed; if you would rather review a block first, change `push to main` to your branch name in that one prompt.
2. **Model.** Each block names the model to run it under (from `docs/build-plan.md`): the first block of a chapter, the two brand-new chapters (5 and 8), and any block holding a Callback or Final Exam get `claude-opus-5`; the rest get `claude-sonnet-5`. The model is not part of the prompt — set it in the session before pasting. Treat it as a floor, not a ceiling: bump a Sonnet block to `claude-opus-5` if it leans heavy — dense setup teaching, tricky sizing math, a lot of new chart-decisions.
Work top to bottom: a block's callbacks reach into earlier chapters, which must already be written. Tick each block as you finish it.

---

## 1. Chapter 2 — Charts 101
Folder `content/paths/scalping/chapter-02-charts-101` · 18 levels · ~49 sub-levels · 3 blocks

### ☐ Block 1 — levels 1–6
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice_  
**New:** 6 (Checkpoint).  
**Expand:** 1, 2, 3, 4, 5.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 2 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 2 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–6 of Chapter 2 (Charts 101) in
content/paths/scalping/chapter-02-charts-101/, following the v3 level table exactly: the level titles, the
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
"content: chapter 2 levels 1–6" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 7–12
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**Expand:** 7, 8, 9, 10, 11.  
**Revise to v3** (already 1 sub from retrofit): 12 (Checkpoint).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 2 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 2 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 7–12 of Chapter 2 (Charts 101) in
content/paths/scalping/chapter-02-charts-101/, following the v3 level table exactly: the level titles, the
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
"content: chapter 2 levels 7–12" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 13–18
Model: `claude-opus-5` · _Opus — holds a Callback level; holds the Final Exam_  
**New:** 15 (Chapter 1 Callback).  
**Expand:** 13, 14, 16, 17.  
**Revise to v3** (already 1 sub from retrofit): 18 (Final Exam).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 2 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 2 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 13–18 of Chapter 2 (Charts 101) in
content/paths/scalping/chapter-02-charts-101/, following the v3 level table exactly: the level titles, the
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
"content: chapter 2 levels 13–18" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

## 2. Chapter 3 — Orders, Costs & Position Size
Folder `content/paths/scalping/chapter-03-orders-costs-position-size` · 19 levels · ~50 sub-levels · 4 blocks

### ☐ Block 1 — levels 1–5
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice_  
**New:** 5 (Checkpoint).  
**Expand:** 1, 2, 3, 4.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 3 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 3 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–5 of Chapter 3 (Orders, Costs & Position Size) in
content/paths/scalping/chapter-03-orders-costs-position-size/, following the v3 level table exactly: the level titles, the
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
"content: chapter 3 levels 1–5" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 6–10
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**Expand:** 6, 7, 8, 9, 10.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 3 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 3 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 6–10 of Chapter 3 (Orders, Costs & Position Size) in
content/paths/scalping/chapter-03-orders-costs-position-size/, following the v3 level table exactly: the level titles, the
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
"content: chapter 3 levels 6–10" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 11–15
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**New:** 11 (Sizing Practice).  
**Expand:** 13, 14, 15.  
**Revise to v3** (already 1 sub from retrofit): 12 (Checkpoint).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 3 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 3 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 11–15 of Chapter 3 (Orders, Costs & Position Size) in
content/paths/scalping/chapter-03-orders-costs-position-size/, following the v3 level table exactly: the level titles, the
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
"content: chapter 3 levels 11–15" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 4 — levels 16–19
Model: `claude-opus-5` · _Opus — holds a Callback level; holds the Final Exam_  
**New:** 16 (Chapters 1–2 Callback).  
**Expand:** 17, 18.  
**Revise to v3** (already 1 sub from retrofit): 19 (Final Exam).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 3 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 3 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 16–19 of Chapter 3 (Orders, Costs & Position Size) in
content/paths/scalping/chapter-03-orders-costs-position-size/, following the v3 level table exactly: the level titles, the
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
"content: chapter 3 levels 16–19" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

## 3. Chapter 4 — Reading Fast Markets
Folder `content/paths/scalping/chapter-04-reading-fast-markets` · 18 levels · ~48 sub-levels · 3 blocks

### ☐ Block 1 — levels 1–6
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice_  
**New:** 5 (Checkpoint).  
**Expand:** 1, 2, 3, 4, 6.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 4 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 4 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–6 of Chapter 4 (Reading Fast Markets) in
content/paths/scalping/chapter-04-reading-fast-markets/, following the v3 level table exactly: the level titles, the
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
"content: chapter 4 levels 1–6" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 7–12
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**Expand:** 7, 9, 10, 11, 12.  
**Revise to v3** (already 1 sub from retrofit): 8 (Checkpoint).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 4 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 4 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 7–12 of Chapter 4 (Reading Fast Markets) in
content/paths/scalping/chapter-04-reading-fast-markets/, following the v3 level table exactly: the level titles, the
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
"content: chapter 4 levels 7–12" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 13–18
Model: `claude-opus-5` · _Opus — holds a Callback level; holds the Final Exam_  
**New:** 16 (Chapters 2–3 Callback), 17 (Chapter Review).  
**Expand:** 13, 14, 15.  
**Revise to v3** (already 1 sub from retrofit): 18 (Final Exam).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 4 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 4 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 13–18 of Chapter 4 (Reading Fast Markets) in
content/paths/scalping/chapter-04-reading-fast-markets/, following the v3 level table exactly: the level titles, the
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
"content: chapter 4 levels 13–18" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

## 4. Chapter 1 — Market Basics (shared)
Folder `content/shared/chapter-01-market-basics` · 17 levels · ~47 sub-levels · 3 blocks

### ☐ Block 1 — levels 1–5
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice_  
**New:** 5 (Checkpoint).  
**Expand:** 1, 2, 3, 4.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 1 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 1 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–5 of Chapter 1 (Market Basics (shared)) in
content/shared/chapter-01-market-basics/, following the v3 level table exactly: the level titles, the
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
"content: chapter 1 levels 1–5" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 6–11
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**Expand:** 6, 7, 8, 9, 10.  
**Revise to v3** (already 1 sub from retrofit): 11 (Checkpoint).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 1 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 1 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 6–11 of Chapter 1 (Market Basics (shared)) in
content/shared/chapter-01-market-basics/, following the v3 level table exactly: the level titles, the
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
"content: chapter 1 levels 6–11" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 12–17
Model: `claude-opus-5` · _Opus — holds the Final Exam_  
**Expand:** 12, 13, 14, 15, 16.  
**Revise to v3** (already 1 sub from retrofit): 17 (Final Exam).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 1 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 1 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 12–17 of Chapter 1 (Market Basics (shared)) in
content/shared/chapter-01-market-basics/, following the v3 level table exactly: the level titles, the
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
"content: chapter 1 levels 12–17" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

## 5. Chapter 5 — Finding the Trade
Folder `content/paths/scalping/chapter-05-finding-the-trade` · 17 levels · ~45 sub-levels · 4 blocks

### ☐ Block 1 — levels 1–4
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice; new chapter, no v2 base to expand_  
**New:** 1 (Not Every Stock), 2 (Relative Volume), 3 (The Catalyst), 4 (Selection Practice).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 5 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 5 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–4 of Chapter 5 (Finding the Trade) in
content/paths/scalping/chapter-05-finding-the-trade/, following the v3 level table exactly: the level titles, the
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
"content: chapter 5 levels 1–4" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 5–9
Model: `claude-opus-5` · _Opus — new chapter, no v2 base to expand_  
**New:** 5 (Checkpoint), 6 (Reading a Scanner), 7 (Building the Watchlist), 8 (Float and Share Structure), 9 (Watchlist Practice).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 5 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 5 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 5–9 of Chapter 5 (Finding the Trade) in
content/paths/scalping/chapter-05-finding-the-trade/, following the v3 level table exactly: the level titles, the
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
"content: chapter 5 levels 5–9" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 10–13
Model: `claude-opus-5` · _Opus — new chapter, no v2 base to expand_  
**New:** 10 (Checkpoint), 11 (The Market Behind the Stock), 12 (Market Internals), 13 (Trend Day or Range Day).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 5 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 5 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 10–13 of Chapter 5 (Finding the Trade) in
content/paths/scalping/chapter-05-finding-the-trade/, following the v3 level table exactly: the level titles, the
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
"content: chapter 5 levels 10–13" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 4 — levels 14–17
Model: `claude-opus-5` · _Opus — new chapter, no v2 base to expand; holds a Callback level; holds the Final Exam_  
**New:** 14 (Chapters 1 & 4 Callback), 15 (The Pre-Market Routine), 16 (Chapter Review), 17 (Final Exam).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 5 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 5 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 14–17 of Chapter 5 (Finding the Trade) in
content/paths/scalping/chapter-05-finding-the-trade/, following the v3 level table exactly: the level titles, the
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
"content: chapter 5 levels 14–17" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

## 6. Chapter 6 — Risk & Psychology
Folder `content/paths/scalping/chapter-06-risk-and-psychology` · 19 levels · ~51 sub-levels · 4 blocks

### ☐ Block 1 — levels 1–5
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice_  
**New:** 3 (Managing the Trade), 4 (Stops and R Practice), 5 (Checkpoint).  
**Expand:** 1, 2.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 6 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 6 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–5 of Chapter 6 (Risk & Psychology) in
content/paths/scalping/chapter-06-risk-and-psychology/, following the v3 level table exactly: the level titles, the
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
"content: chapter 6 levels 1–5" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 6–10
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**New:** 7 (Costs Inside Expectancy).  
**Expand:** 6, 8, 9.  
**Revise to v3** (already 1 sub from retrofit): 10 (Checkpoint).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 6 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 6 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 6–10 of Chapter 6 (Risk & Psychology) in
content/paths/scalping/chapter-06-risk-and-psychology/, following the v3 level table exactly: the level titles, the
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
"content: chapter 6 levels 6–10" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 11–15
Model: `claude-opus-5` · _Opus — holds a Callback level_  
**New:** 14 (Chapter 3 Callback).  
**Expand:** 11, 12, 13, 15.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 6 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 6 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 11–15 of Chapter 6 (Risk & Psychology) in
content/paths/scalping/chapter-06-risk-and-psychology/, following the v3 level table exactly: the level titles, the
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
"content: chapter 6 levels 11–15" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 4 — levels 16–19
Model: `claude-opus-5` · _Opus — holds the Final Exam_  
**Expand:** 16, 17, 18.  
**Revise to v3** (already 1 sub from retrofit): 19 (Final Exam).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 6 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 6 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 16–19 of Chapter 6 (Risk & Psychology) in
content/paths/scalping/chapter-06-risk-and-psychology/, following the v3 level table exactly: the level titles, the
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
"content: chapter 6 levels 16–19" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

## 7. Chapter 7 — The Scalping Playbook
Folder `content/paths/scalping/chapter-07-scalping-playbook` · 19 levels · ~50 sub-levels · 4 blocks

### ☐ Block 1 — levels 1–5
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice_  
**Expand:** 1, 2, 3, 4.  
**Revise to v3** (already 1 sub from retrofit): 5 (Checkpoint).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 7 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 7 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–5 of Chapter 7 (The Scalping Playbook) in
content/paths/scalping/chapter-07-scalping-playbook/, following the v3 level table exactly: the level titles, the
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
"content: chapter 7 levels 1–5" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 6–9
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**New:** 8 (Mixed Drill I), 9 (Checkpoint).  
**Expand:** 6, 7.

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 7 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 7 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 6–9 of Chapter 7 (The Scalping Playbook) in
content/paths/scalping/chapter-07-scalping-playbook/, following the v3 level table exactly: the level titles, the
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
"content: chapter 7 levels 6–9" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 10–13
Model: `claude-sonnet-5` · _Sonnet — not the first block, and no Callback or Final Exam here_  
**New:** 10 (Setup F — Gap-and-Go Continuation), 11 (Setup G — Range Rotation), 12 (Setup H — The Re-Entry), 13 (Mixed Drill II).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 7 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 7 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 10–13 of Chapter 7 (The Scalping Playbook) in
content/paths/scalping/chapter-07-scalping-playbook/, following the v3 level table exactly: the level titles, the
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
"content: chapter 7 levels 10–13" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 4 — levels 14–19
Model: `claude-opus-5` · _Opus — holds a Callback level; holds the Final Exam_  
**New:** 15 (Chapters 5 & 6 Callback), 16 (When Nothing Fits), 18 (Chapter Review).  
**Expand:** 14, 17.  
**Revise to v3** (already 1 sub from retrofit): 19 (Final Exam).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 7 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 7 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 14–19 of Chapter 7 (The Scalping Playbook) in
content/paths/scalping/chapter-07-scalping-playbook/, following the v3 level table exactly: the level titles, the
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
"content: chapter 7 levels 14–19" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

## 8. Chapter 8 — The Trading Day
Folder `content/paths/scalping/chapter-08-the-trading-day` · 17 levels · ~47 sub-levels · 4 blocks

### ☐ Block 1 — levels 1–4
Model: `claude-opus-5` · _Opus — first block, sets the chapter voice; new chapter, no v2 base to expand_  
**New:** 1 (The Platform), 2 (Hotkeys and Muscle Memory), 3 (Execution Drills), 4 (The Pre-Market Hour).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 8 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 8 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 1–4 of Chapter 8 (The Trading Day) in
content/paths/scalping/chapter-08-the-trading-day/, following the v3 level table exactly: the level titles, the
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
"content: chapter 8 levels 1–4" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 2 — levels 5–9
Model: `claude-opus-5` · _Opus — new chapter, no v2 base to expand_  
**New:** 5 (Checkpoint), 6 (The Open), 7 (Mid-Session), 8 (The Close and the Review), 9 (Full-Day Practice).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 8 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 8 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 5–9 of Chapter 8 (The Trading Day) in
content/paths/scalping/chapter-08-the-trading-day/, following the v3 level table exactly: the level titles, the
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
"content: chapter 8 levels 5–9" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 3 — levels 10–13
Model: `claude-opus-5` · _Opus — new chapter, no v2 base to expand; holds a Callback level_  
**New:** 10 (Checkpoint), 11 (Tracking Your Numbers), 12 (When to Increase Size), 13 (Chapters 6 & 7 Callback).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 8 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 8 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 10–13 of Chapter 8 (The Trading Day) in
content/paths/scalping/chapter-08-the-trading-day/, following the v3 level table exactly: the level titles, the
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
"content: chapter 8 levels 10–13" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

### ☐ Block 4 — levels 14–17
Model: `claude-opus-5` · _Opus — new chapter, no v2 base to expand; holds the Final Exam_  
**New:** 14 (Your First 30 Days on Sim), 15 (Going Live, Carefully), 16 (Capstone — A Full Week), 17 (Final Exam and Graduation).

```
Read CLAUDE.md, then docs/agent.md, docs/schema.md and docs/UI.md in full. Then read
the Chapter 8 section of docs/curriculum.md and only that section — find it with
`grep -n 'Chapter 8 —' docs/curriculum.md` and read that range; the first match is this
path's. Do not read the file whole: it carries all three paths and the rest is not
yours. These are the rules; where this prompt and those docs disagree, the docs win.

Write levels 14–17 of Chapter 8 (The Trading Day) in
content/paths/scalping/chapter-08-the-trading-day/, following the v3 level table exactly: the level titles, the
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
"content: chapter 8 levels 14–17" and push to main.

Finally, report: the levels written, sub-level and screen counts, the screen-type
mix as a table, which earlier chapters you reinforced and how, and anything in the
curriculum table you could not honour and why.
```

---

**29 blocks total** across the Scalping path. Day Trading and Swing Trading (Stage 5) reuse these prompts against their own curriculum tables and folders — see `docs/build-plan.md` Stage 5 for the one added clause.
