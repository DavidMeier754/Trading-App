# Side stops and writing order

_Part of the [course outline](README.md)_

## Side stops **[DESIGN-REVIEW]**

Beside the path of every chapter, off its line (`docs/ui/10-path-map.md` §7.1). Optional: they never block a level, cost no hearts and are never timed.

| Side stop | Where | Content |
|---|---|---|
| **Your mistakes** (mistakes review) | Before each Checkpoint and before the Final Exam: two or three per chapter | None to write. The app builds it from the questions the learner missed since the previous test and has not answered right since. Every question must stand on its own (`docs/rules/03-content-rules.md` §3.4). |
| **Spot it** (bonus side lesson) | After a level of the content's choosing, 2–3 per chapter from Chapter 2 on; never before a test | A file of its own, `level-LL-bonus.yaml` (`docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Bonus side lessons"): an intro and 2–3 `chart-replay` screens at reading level 1–2, on what the chapter has taught so far. Hand-written in `FUN-PASS`; from `ARENA-TAB` on, the chart generator proposes them. |

Suggested places for **Spot it** on the scalping path, never right before a test (that place is the mistakes review's): Chapter 2 after Levels 4 (volume bars), 10 (bounce or break) and 13 (the opening minutes); Chapter 3 after Levels 10 (sizing) and 17 (the all-in check); Chapter 4 after Levels 3 (intraday levels) and 13 (map drills); Chapter 5 after Levels 8 and 13; Chapter 6 after Level 8; Chapter 7 after Levels 3, 7 and 13; Chapter 8 after Levels 3 and 8. `FUN-PASS` decides the final list with David.

## Writing order

1. ✅ Scalping Chapters 2 → 3 → 4 (expand v2 content to the v3 level plan)
2. ✅ Chapter 1 (expand — done after Scalping 2–4 so the callbacks are known)
3. ✅ Scalping Chapters 5 → 6 → 7 → 8 (5 and 8 are new)
4. ◐ Scalping drill packs — manifest and tooling done, 1 of 15 packs written
5. **[v4]** Chapter 1 Level 2-4 and Scalping Chapter 8 Level 15, then one correction pass per chapter (`docs/plan/12-phase-1-content-chapter-fixes.md`)
6. **[v4]** Swing Trading Chapters 2 → 8 — before Day Trading (decision W2: Chapter 1 sends working people to swing, and EU retail traders can hardly scalp cash stocks)
7. **[v4.1]** Day Trading Chapters 2 → 8 — after Swing, in Phase 2 of the plan (decision E)
8. **[DESIGN-REVIEW]** Alongside all of the above: `docs/content-todo/` — skills per lesson, the chart ramp, notes, alerts, briefings and the bonus lessons, done chapter by chapter in the pass that touches the chapter anyway

One chapter per session, written in blocks of 4–6 levels (`docs/rules/09-working-and-process.md` §6). After each: validator clean, commit, open a PR, short report, stop.

The order of all work — app and content — with a prompt, model and effort per stage: `docs/plan/`.
