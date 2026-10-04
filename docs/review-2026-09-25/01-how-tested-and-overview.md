# How it was tested, and the overview

_Part of the [review of 2026-09-25](README.md) · §0–2_

## 0. How I tested

- **Built and played the app**
  - Expo web build of the PR branch in Chromium as an iPhone (390×844, touch).
  - Also on small displays: 375×667, 360×640, 320×568.
- **Played through to the end of the content:** all 58 playable lessons.
  - Chapter 1 in full (48 lessons, including the path choice) and Scalping chapter 2, levels 1–3.
  - 1-1 by hand, the other 57 with a script that answers every task correctly from the YAML.
  - Not a single crash in these 783 screens.
- **Made mistakes on purpose**
  - Lost hearts until "Out of hearts" came.
  - Failed checkpoint 5-1.
  - Quit a lesson.
  - Tested the streak over simulated days.
  - Tried the test tools in Settings (Skip ahead, Refill).
- **Rendered the rest of the content**
  - Chapters 2–8 are written, but apart from chapter 2 levels 1–3 they are not wired into the app (330 lessons).
  - I wired them into a copy and opened and photographed every one of their 4,464 screens by deep link (smoke test).
  - So for the first time every one of the 5,109 screens has been rendered once.
- **Read**
  - Every project .md on `main` and in the PR: README, README-app, CLAUDE.md, docs/rules/, docs/course/, docs/ui/, docs/level-files/, docs/plan/.
  - The 34 skill files under `.agents/skills`.
  - The tools, content samples and the complete app code.
- **Ran the tools**
  - `validate_content.py`: 0 errors, 3 warnings in the PR. On `main`: 1 hard error, 66 sizing breaches.
  - `test_validate.py`: 110/110.
  - `check_sizing.py`: 0 breaches in the PR.
  - `tsc`: clean.
- **My own analyses across all the content**
  - How often correct decisions win or lose.
  - Length and punctuation tells in the answers.
  - Signs in number inputs.
  - The share of screens with a visual.
  - Position sizes compared with the plan.

---

## 1. How the project works (short version)

**Idea.** "Duolingo for traders": short lessons, chart decisions, XP, streak and hearts.
- After the shared chapter 1 you choose a path: Scalping, Day Trading or Swing Trading.
- Only Scalping is written: with chapter 1 that is 8 chapters, 144 levels, 388 lessons, 5,109 screens.
- Day and Swing are only outlined.

**The content is data.**
- Every lesson is a YAML file with 12–18 screens from about 28 screen types.
  - Types: theory, mc, chart-decision, match, sort, numeric-input, plan-card, depth-ladder …
  - It lives in `content/shared` (chapter 1) and `content/paths/scalping` (chapters 2–8).
- Market-dependent parts such as times, rules and fees are tokens (`{{market.*}}`).
  - They are filled from `content/market_profiles.yaml` (US, EU-DE).
- `docs/level-files/` defines which fields each type has.

**The rules are in the docs.**
- `docs/rules/`: product decisions and binding content rules.
  - Examples: position-size cap 95 %, risk 1 %, no tells, never punish "No trade", legal.
- `docs/course/`: level by level.
- `docs/ui/`: how everything looks and moves.
- `docs/level-files/`: the data format.
- `docs/plan/`: the work order, with ready prompts for content sessions.
- `CLAUDE.md` obliges every agent to read these four docs and to run the validator.

**Quality assurance is Python tools.**
- `validate_content.py` checks structure, the time budget per lesson and answer tells.
- `check_sizing.py` checks position sizes.
- `test_validate.py` tests the validator itself.

**The app exists only in PR #13** (54 commits, 425 files, no description).
- Tech: Expo SDK 57, React Native 0.86, Reanimated 4, SVG charts; runs natively and as a web build.
- A Metro transformer loads the YAML straight into the JS bundle at build time.
  - Every lesson is imported one by one in `src/content.ts` (58 lines).
- `LessonPlayer.tsx` plays a lesson.
  - It shuffles the options, scores (`answers.ts`), takes hearts and shows the reveal.
- Progress, hearts (5, one back every 4 h), XP (+50 % for a perfect run), streak and plan values are stored locally in AsyncStorage (`progress.ts`).
  - No backend, no login.
- Home consists of the path map, Practice and Leaderboard (both placeholders) and Account (a placeholder with Settings).
  - Settings have 9 "Looks" (designs), haptics, sound, motion, path, reset and test tools.
- Deep links such as `#level-01-3/5?look=arcade` open any screen directly; `#all-screens` is the test bench with 49 screens.

**State according to `docs/plan/` on that day.**
- The next step is OFFER (chapter 8 level 15).
- After that come phrasing, replays, drills and review; the Day and Swing paths come last.
- Three open product decisions block OFFER (see section 7).

**`main` lags behind.**
- There, the README and docs say "nothing rendered yet".
- The content there has the hard validator error and the 66 sizing breaches that are only fixed in the PR.

---

## 2. The 12 most important items at a glance

1. **The depth table (`depth-ladder`) always crashes.** That is 40 screens in 38 lessons (chapters 3–8), including 3 final exams and 4 checkpoints. As soon as the content is wired in, nobody would get past chapter 3 level 15 (M2).
2. **The plan overview never shows your plan**, although it is saved (M1).
3. **No risk note, no legal page, no onboarding**, although `docs/rules/10-legal-and-safety.md` §7 requires them (M8).
4. **Correct decisions almost always win:** of 338 correct long/short/buy decisions only 12 end in a loss, and none at all in chapters 1–4. So the app unintentionally teaches "correct = profit" (M9).
5. **Hearts in lessons lead into a dead end.** Whoever fails while learning can do nothing for up to 20 h, not even reread cards (M11, W1).
6. **The reveal swallows the teaching sentence.** The outcome sentence from the YAML is never shown, and an "amber" answer gets a green "+$45" (M7).
7. **After 58 lessons (~3.5 h) it ends** with "Levels 4–18 of Chapter 2 soon", although 330 more lessons are finished (M13).
8. **The plan value of 50 % does not fit the exercises.** Right after the plan card, for a whole chapter every position is 84–94 % of the account (M15, W3).
9. **Signs in number inputs are inconsistent.** You lose hearts although you understood the idea (M10).
10. **Hardly any pictures.** Only 11 % of theory and example screens have a visual; there is no labeled candle diagram (S1).
11. **Small type and low contrast.** Many labels are 9–12 px, `textFaint` has 3.8:1; on small phones text shrinks down to 8 px (S2, S3, W5).
12. **No CI and no render test.** That is why item 1 and the NaN lines went unnoticed (M14).
