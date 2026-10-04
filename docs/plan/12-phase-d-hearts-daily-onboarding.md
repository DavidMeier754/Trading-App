# Phase D: Hearts, daily, onboarding

_Part of the [build plan](README.md) · §8_

## 8. Phase D – Learning loop and fun

### `LOOP-HEARTS` – hearts, practice and the review cards

**Goal.** Learning without fear: mistakes in lessons come back instead of locking you out. ~~Hearts exist only in tests.~~ Since 2026-10-04 hearts are spent in every lesson and test (David); what keeps learning open is practice, which is free and gives a heart back, and the review cards.

**Since `DESIGN-REVIEW`** (2026-10-03) items 1 and 2 are built, with David's deck and his heart rule (all hearts back five hours after the first is lost); the stage keeps the rest. Decision X (mistakes reviews) is answered here at the latest.

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

**Prompt**
```
Stage LOOP-HEARTS from docs/plan/12-phase-d-hearts-daily-onboarding.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "LOOP-HEARTS" section in docs/plan/12-phase-d-hearts-daily-onboarding.md in full, plus docs/ui/02-lesson-player-layout.md §2, docs/ui/03-screen-types.md §3, docs/ui/04-question-types.md §4.1, docs/ui/05-chart-questions-and-mistakes-round.md §4.5, docs/ui/06-reveal-and-hearts.md §5 and docs/ui/10-path-map.md §7.1, and docs/rules/01-what-we-build.md §1 (Hearts) and §3.7.
Show me your plan first and wait for my approval.

Especially important:
- Existing progress is kept (migrate progress.v1 if necessary).
- Every rule has a unit test that would be red without the rule.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min)**
1. ~~Play a lesson with three deliberate mistakes: you lose no heart; the three questions come back at the end.~~ (tested in `DESIGN-REVIEW`)
2. Play a checkpoint with two mistakes:
   - Now hearts are lost.
   - The summary shows the correct answers.
   - "Go to the lesson" opens the matching card.
3. On a finished level, replay lesson 3 on its own: it earns only a few XP.
4. Lose all hearts in the checkpoint: "Review the cards" works.
5. A match with one wrong tap: amber, counts as correct.
6. Fun question (1–5): do mistakes feel fair now?

### `LOOP-DAILY` – coming back every day, without pressure

**Goal.** A reason to come back every day, without pressure and without guilt.

**Scope**
1. ~~**Daily goal** (W9):~~ Dropped by David on 2026-10-04: one lesson a day keeps the streak, there is nothing to choose.
   - ~~Choosable: 1, 2 or 3 lessons, default 2. In Settings; from `ONBOARDING` on also in the first run.~~
   - ~~"Today 1/2" shows on lesson complete and when you tap the flame; the goal left the top bar in `LOOK-SYSTEM`.~~ **Done in `DESIGN-REVIEW`:** lesson complete shows the streak, the flame's tap says whether today's lesson is done.
2. **Streak** (S10):
   - It counts the days with at least one finished lesson.
   - States:
     - **open:** no lesson yet today.
     - **done:** the flame lights up. **Done in `DESIGN-REVIEW`,** with the full-screen "streak goes up" moment after the day's first lesson.
     - **at risk:** in the evening, if there is no lesson yet.
     - **lost:** a friendly screen, "A new streak starts today". **Done in `DESIGN-REVIEW`** (2026-10-04), shown once as the app opens on a lost streak.
   - **Full screen** (your wish in `LOOK-BRIEF`, `#prototype/mix/streak` and `#prototype/mix/lost` at `a78e210`): every change of the streak gets its own screen. Up by a day, the flame lights and the count rolls on; lost, the flame goes cold and the count rolls to 0. About a second, only after something you did; Continue ends it (`docs/ui/11-top-bar.md` §7.2). **Built in `LOOK-SYSTEM`** at your request (`src/lesson/StreakScreens.tsx`, played on Settings → Testing → Animations): ~~this stage shows them in the flow, after the lesson that meets the goal and when the app opens on a lost streak.~~ **In the flow since `DESIGN-REVIEW`** (David's test, 2026-10-04): after the day's first lesson, and when the app opens on a lost streak (`src/lesson/StreakMoment.tsx`).
3. **Streak freeze:**
   - At most two in store.
   - Used automatically, with the message "Freeze used".
   - Earned through the **weekly challenge** (`docs/ui/13-tiers-replays-and-plus.md` §7.6): 8–12 questions from everything unlocked, bonus XP plus a freeze.
4. **Reminders** (`expo-notifications`, local only):
   - A daily time of your choosing.
   - In the evening, at most one "streak at risk" reminder, and only if there is no lesson yet today.
   - Never guilt-trip texts; everything can be switched off.
5. **Testing tool** "Advance a day" (+1 day, +2 days).
6. **Gems** (your wish in `LOOK-BRIEF`, `docs/ui/11-top-bar.md` §7.2): a new in-game currency in the top bar, earned in lessons (e.g. a few per lesson, more for a perfect one) and, from `FUN-PASS` on, in bonus side lessons. Never sold (decision I). What they buy is decision U. **In the top bar since `LOOK-SYSTEM`** (your wish of 2026-09-30), stored with the progress and still at 0: this stage makes them earned.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage LOOP-DAILY from docs/plan/12-phase-d-hearts-daily-onboarding.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "LOOP-DAILY" section in docs/plan/12-phase-d-hearts-daily-onboarding.md in full, plus docs/ui/07-lesson-chapter-and-tier-complete.md §5.3, docs/ui/11-top-bar.md §7.2, docs/ui/13-tiers-replays-and-plus.md §7.6 and docs/rules/01-what-we-build.md §1 (Daily target).
Build exactly this scope.

Especially important:
- Day boundaries follow the device's local time; test daylight-saving changes and midnight.
- Reminder texts: friendly, never threatening, never guilt. Show me every text in the report.

Open a PR against main and get every check green.
Report: what you built · check results · every reminder text · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min + 3 days)**
1. ~~Set the goal to 1 and play one lesson: the streak screen plays full screen, the flame lights up, and lesson complete shows "Today 1/1".~~ Play the day's first lesson (Settings → Testing → Reset streak first): the streak screen plays full screen, the flame lights up, and lesson complete shows the streak. (Built in `DESIGN-REVIEW`.)
2. Testing → "+1 day": the streak is "open".
3. "+2 days" without a freeze: the "new streak" screen. With a freeze: "Freeze used".
4. Play the weekly challenge: you receive a freeze.
5. Set a reminder for 2 minutes from now: it arrives on the real device.
6. Finish a lesson: the gems in the top bar go up.
7. Use the app normally for three days: does anything annoy you?

### `ONBOARDING` – first impression, legal and market profile

**Goal.** A good first impression, and everything legally and professionally required before the first screen.

**Since `DESIGN-REVIEW`** (2026-10-03): the first trade comes before everything (`docs/ui/16-navigation.md` §11.1, `src/onboarding/`), and the steps below follow it. ~~The daily goal as three paces (Easy, Steady, Serious) belongs to the registration screens, which David adds later himself; this stage keeps the plain choice of 1, 2 or 3.~~ There is no daily goal any more (David, 2026-10-04): one lesson a day keeps the streak, so the first run has no goal step.

**Scope**
1. **First run** (`docs/ui/16-navigation.md` §11.1), in this order, after the first trade:
   1. What the app is.
   2. The risk note in one sentence, with "More".
   3. ~~Daily goal.~~ (dropped, 2026-10-04)
   4. Reminders yes/no.
   5. Market profile ("Where will you trade later?" US / Germany).

   Then straight into lesson 1-1.
2. **The risk note in every place** listed in `docs/rules/10-legal-and-safety.md` §7 (M8):
   - at first launch;
   - under every scenario result, as a small line;
   - on the statistics screen.
3. **Settings → Legal:** a scaffold for imprint, privacy policy, terms of use and disclaimer. The texts come from `LEGAL-DRAFT`; placeholders until then.
4. **Market profile in Settings** (S25):
   - EU number format ("10,00 €").
   - Clock times in local time, e.g. "US market: 15:30–22:00 German time".
   - "The market I trade" and "my time zone" are separate settings.
5. **Plan card** (S22):
   - Choice fields (`kind: choice`) and number ranges (`min`/`max`).
   - A dated plan history (`docs/level-files/05-the-plan.md`, "The plan").
   - Export as an image or text to share.
6. **i18n foundation** (W19, decision M): every UI string goes through keys (`t('…')`) with one `en.json` file, and numbers, currencies and dates are formatted through the locale (`Intl`), never by hand. The content stays English until Phase J.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage ONBOARDING from docs/plan/12-phase-d-hearts-daily-onboarding.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "ONBOARDING" section in docs/plan/12-phase-d-hearts-daily-onboarding.md in full, plus docs/ui/03-screen-types.md §3 (plan-card), §9, §11, docs/rules/10-legal-and-safety.md §7, docs/level-files/05-the-plan.md ("The plan") and content/market_profiles.yaml.
Build exactly this scope; the legal texts stay placeholders.

Especially important:
- The risk note is visible but unobtrusive; it must not cover the chart reveal.
- After the i18n switch, no UI string may be hard-coded any more (check script).

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min)**
1. A fresh install (Settings → Reset, or a private browser window): go through the first run.
2. Choose the market profile "Germany": prices with € and a decimal comma, clock times in German time (lesson 1·10-1).
3. After a chart decision: the risk-note line is visible but unobtrusive.
4. Fill the plan card with nonsense: it is refused or queried. Then share the plan.
5. Settings → Legal opens.
