# Phase 1, app lane – hearts, the streak and practice

_Part of the [build plan](README.md)_

The learning loop, under David's rules of 2026-10-05: as many lessons as the learner likes, practice and today's chart optional, no quota anywhere, and the streak grows only on a day a lesson is finished. What draws a learner back is a pull, never a duty.

### `LOOP-HEARTS` – hearts, practice and the review cards

**Goal.** Learning without fear: mistakes in lessons come back instead of locking you out. ~~Hearts exist only in tests.~~ Since 2026-10-04 hearts are spent in every lesson and test (David); what keeps learning open is practice, which is free and gives a heart back, and the review cards.

**Since `DESIGN-REVIEW`** (2026-10-03) items 1 and 2 are built, with David's deck and his heart rule (all hearts back five hours after the first is lost); the stage keeps the rest. Decision X is answered (Y6, 2026-10-05): the mistakes reviews are practice levels on the path, with a Skip (`PRACTICE`).

**Scope**
1. ~~**Hearts only in checkpoints and final exams** (W1, `docs/ui/06-reveal-and-hearts.md` §5.2).~~ **Done in `DESIGN-REVIEW`,** then reversed by David on 2026-10-04: hearts in every lesson and test.
2. ~~**Mistakes round** (W25, `docs/ui/05-chart-questions-and-mistakes-round.md` §4.5): wrongly answered questions come back once at the end of the lesson, reshuffled; the lesson is finished once they are answered; a lesson with a mistakes round does not count as perfect.~~ **Done in `DESIGN-REVIEW`,** opened by the deck.
3. **Review cards** (S15, W8):
   - Via the level card → "Review cards", a level's theory cards can be browsed without questions.
   - In every question, "See the card again" opens the last theory card as an overlay.
4. **Level card:** every lesson can be chosen individually, and perfect lessons are marked.
5. **Test summary** (S14):
   - For every wrong question: the correct answer and "Go to the lesson" (opens the source's review card).
   - "Review these" opens a practice round with exactly those questions. Complete from `PRACTICE` on.
6. **Out of hearts without a dead end:** instead of just "back", the actions "Review the cards" and "Practice → +1 heart" (the Practice tab gives a heart back since `DESIGN-REVIEW`).
7. **XP** (W11):
   - Replays earn ¼ XP.
   - The perfect bonus is paid only on the first perfect run.
8. **Match** (W15):
   - One wrong tap gives amber: counts as correct, costs no heart.
   - From two wrong taps on, the task is wrong.
9. **An explanation per wrong option** (`why`, W21) is shown where the content has one.
10. **One switch for unlimited hearts,** read from a single place, for Nutrade Plus (`MONEY`, decision I).
11. **Unit tests** for every rule.

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 1–2

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage LOOP-HEARTS from docs/plan/07-phase-1-app-hearts-streak-practice.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "LOOP-HEARTS" section in docs/plan/07-phase-1-app-hearts-streak-practice.md in full, plus docs/ui/02-lesson-player-layout.md §2, docs/ui/03-screen-types.md §3, docs/ui/04-question-types.md §4.1, docs/ui/05-chart-questions-and-mistakes-round.md §4.5, docs/ui/06-reveal-and-hearts.md §5 and docs/ui/10-path-map.md §7.1, and docs/rules/01-what-we-build.md §1 (Hearts) and §3.7.
Show me your plan first and wait for my approval.

Especially important:
- Existing progress is kept (migrate progress.v1 if necessary).
- Every rule has a unit test that would be red without the rule.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** the fun question (1–5): do mistakes feel fair now? Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each):
- A checkpoint with two mistakes: hearts are lost, the summary shows the correct answers, and "Go to the lesson" opens the matching card.
- A finished level with lesson 3 replayed on its own: it earns only a few XP.
- The checkpoint with all hearts lost: "Review the cards" works.
- A match with one wrong tap: amber, counts as correct.

### `LOOP-DAILY` – the streak and coming back, without pressure

**Goal.** Reasons to come back that never become a duty: no quota, no guilt, nothing that locks.

**Already built** (`LOOK-SYSTEM`, `DESIGN-REVIEW`): the streak with its full-screen moments (up after the day's first finished lesson, lost when the app opens on a broken one, `src/lesson/StreakMoment.tsx`), the flame's tap saying whether today's lesson is done, the gems in the top bar (still at 0), and Settings → Testing → Reset streak.

**Scope**
1. **The streak rule** (David, 2026-10-05), written into `docs/ui/11-top-bar.md` §7.2 and covered by tests:
   - the streak grows on a day the learner finishes a lesson on the path; the practice levels on the path are lessons and count too;
   - skipping a practice level does not count, and neither do opening the app, a round in the Practice tab or today's chart;
   - states: **open** (no lesson yet today), **done**, **at risk** (in the evening, no lesson yet), **lost** ("A new streak starts today").
2. **Streak freezes:** used automatically on a missed day, with the message "Freeze used". Bought with gems (item 5) or earned through the weekly challenge (item 3). How many can be kept is this stage's proposal, in the report.
3. **The weekly challenge** (`docs/ui/13-tiers-replays-and-plus.md` §7.6): questions from everything unlocked, with bonus XP and a streak freeze. Optional, like everything outside the path.
4. **Reminders** (`expo-notifications`, local only):
   - off until the learner turns them on; `ONBOARDING` asks after the first finished lesson;
   - a time of their choosing, and in the evening a "streak at risk" note only if there is no lesson yet that day;
   - never guilt; everything can be switched off. `ARENA-TAB` adds "today's chart is ready" as its own switch.
5. **Gems** (decision U, answered 2026-10-05): earned in lessons (more for a perfect one) and in practice rounds; from `FUN-PASS` and `ARENA-TAB` on also in bonus side stops and today's chart. They buy streak freezes and looks: map scenes beside the path, tier-card finishes. Never sold (decision I). The prices are this stage's proposal; you decide.
6. **No quotas** (David, 2026-10-05): nothing in the app says how many lessons or how much practice to do, and there is no daily goal.
7. **Testing tool** "Advance a day" (+1 day, +2 days).

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage LOOP-DAILY from docs/plan/07-phase-1-app-hearts-streak-practice.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "LOOP-DAILY" section in docs/plan/07-phase-1-app-hearts-streak-practice.md in full, plus docs/ui/07-lesson-chapter-and-tier-complete.md §5.3, docs/ui/11-top-bar.md §7.2, docs/ui/13-tiers-replays-and-plus.md §7.6 and docs/rules/01-what-we-build.md §1 (Daily target).
Build exactly this scope.

Especially important:
- Day boundaries follow the device's local time; test daylight-saving changes and midnight.
- Reminder texts: friendly, never threatening, never guilt. Show me every text in the report.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · every reminder text · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:**
- The stage's proposals: how many streak freezes can be kept, and the gem prices (you decide).
- A reminder set for 2 minutes from now arrives on the real device (Claude cannot see a real notification).
- Use the app normally for three days, with real reminders: does anything feel like a duty?

**Where to look** (optional; the report links each; Claude runs the days with "Advance a day"):
- Settings → Testing → Reset streak, then the day's first lesson: the streak screen plays full screen and the flame lights up. (Built in `DESIGN-REVIEW`.)
- Testing → "+1 day": the streak is "open"; still open after a skipped practice level and a Practice round; done after a practice level finished on the path.
- "+2 days" without a freeze: the "new streak" screen; with a freeze: "Freeze used".
- The weekly challenge: it gives a freeze.
- A lesson and a practice round: the gems go up; some spent on a streak freeze and a map scene.

### `PRACTICE` – practice that pulls, never pushes

**Goal.** Knowledge sticks because the learner wants to come back to it. Practice is optional everywhere; the app gives it a pull instead of a quota.

**Already built** (`DESIGN-REVIEW`, `docs/ui/12-practice-and-stats.md` §7.3): the Practice tab with **Daily mix** (questions from played lessons, never twice in a round, the Leitner boxes 1 → 3 → 7 → 16 → 35 days, weak spots by tag), **Skills** (by chapter, each with its info card) and **Mistakes** (open mistakes, played as a round); a finished round gives a heart back. The three tabs stay (David, 2026-10-05).

**Scope**
1. **The selection, explainable:** why a question comes today, for the tests and for David; weak concepts by glossary term (`tags` and `terms_introduced`); drill packs as a source once they exist.
2. **The links into it:** "Review these" from the test summary, "Practice these" from lesson complete, and out of hearts (`LOOP-HEARTS`).
3. **Practice levels on the path** (David, 2026-10-05): the levels that practice rather than teach — Levels Practice, the Mixed Drills, the Chapter Reviews, the callbacks and the mistakes reviews — stay on the path, drawn as a smaller node that looks different from a normal level, with a **Skip** that opens the next level. A finished practice level counts for the streak; a skipped one does not. Checkpoints and Final Exams are tests, not practice levels, and cannot be skipped. `docs/ui/10-path-map.md` §7.1 first.
4. **Fading skills** (David, 2026-10-05): a skill not practiced for a while fades on the Skills tab, and practicing it brings it back. Nothing is lost and nothing locks. David found the first sketch not obvious enough, so the stage first shows him a few clearer designs as prototypes and builds the one he picks.
5. **Shining medals:** a chapter's medal goes from bronze to silver to gold through that chapter's practice levels; the medal shelf in You shows it.
6. **Rules:** never a timer, never a quota; a finished round gives back a heart (`docs/ui/06-reveal-and-hearts.md` §5.2).
7. **Unit tests** for the scheduling (due dates across days; a wrong answer sends a question back to box 1), the Skip, the fading and the medal steps.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage PRACTICE from docs/plan/07-phase-1-app-hearts-streak-practice.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "PRACTICE" section in docs/plan/07-phase-1-app-hearts-streak-practice.md in full, plus docs/ui/06-reveal-and-hearts.md §5.2, docs/ui/10-path-map.md §7.1, docs/ui/12-practice-and-stats.md §7.3 and docs/rules/03-content-rules.md §3.3.
Show me your plan first (data model, selection logic, the practice node and its Skip, the medal steps) and the fading-skill designs as prototypes, and wait for my approval.

Especially important:
- The selection must be explainable: why does this question come today? (for the tests and for me)
- No question twice in one round; no question whose lesson has not been played yet.
- Nothing in Practice is required, and nothing tells me how much to do.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:**
- Your pick of the fading-skill designs (prototypes, shown with the plan).
- Use it for a week: does it pull you back without feeling like a duty?

**Where to look** (optional; the report links each; Claude runs the days with "Advance a day"):
- The Practice tab after a few lessons with mistakes: it shows exactly those concepts.
- A practice level on the path: it looks different and smaller; skipped, the next level opens.
- A practice round after a lost heart: the heart is back.
- Testing → "+1 day" and "+3 days": the due questions appear, and a skill not practiced fades; practicing it brings it back.
- A chapter's practice levels, played: its medal shines up a step.
