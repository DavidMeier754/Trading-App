# Appendix A–C: Templates

_Part of the [build plan](README.md)_

### A. Template: bug report

```
Stage:
Link: <preview>/#level-09-2/3
Device: (e.g. iPhone 13, light)
What I did:
What happened:
What I expected:
How bad: blocking / annoying / minor
(attach a screenshot if possible)
```

For several items, just write them one below the other. Claude sorts them.

### B. Template: accepting a stage

```
OK <STAGE> – merge
```

That is all it takes. Optionally, under it:
```
Needs your review: 1 ✓ 2 ✗ (see below)
What I noticed (small things too, and things for later stages):
Wishes for my next turn (parked in docs/plan/22-your-turn.md):
```

If an item you were asked to review is ✗, do not answer "OK" but send the bug report. The PR already carries the stage's ✅ (`02-how-to-work.md` §1), so after the merge the next session starts with `Next stage.`

### C. Newcomer test (optional, for `FUN-PASS` and `VARIANCE`)

Only if you have someone to ask (David, 2026-10-05); Claude's own play-through in `FUN-PASS` runs either way.

1. **The person:** no trading knowledge, if possible not from your closest circle.
2. **Introduction:** only say "This is a learning app for trading, try it out". No further explanation.
3. **Observe:** let them think aloud, watch, and do not help.
4. **Take notes:** every hesitation, every "huh?", every smile. With the screen link.
5. **Ask afterwards:**
   - What was fun? What was annoying?
   - Explain to me in one sentence what a spread is. (Or the lesson's own term.)
   - You decided right and still lost – what does that mean? (after 1·2-4)
   - Would you carry on tomorrow? Why (not)?
6. **Result:** give your notes to Claude unedited.
