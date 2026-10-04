# Should (S): content, tech and docs

_Part of the [review of 2026-09-25](README.md) · §4.2–4.4_

### 4.2 Content

**S28 – Scenarios that already give the answer away** (breaks docs/rules/03-content-rules.md §3.4 "Scenarios describe, they do not conclude")
- In `1·13-2` and `1·16-1`: "buyers are clearly in charge", "every small bounce gets sold", "Sellers in charge".
- Some lack a price and an account ("100 shares").

**S29 – Contradictory teaching on rumors**
- `1·13-2 S9`: a rumor spike → "No trade" (unpredictable, wait for structure).
- `1·16-1 S11`: a rumor crash → "Short".
- One of the two lessons has to change, or the difference has to be explained.

**S30 – Leftover rules and UI instructions in the content**
- "Hearts are on." appears in 5 checkpoint intros (`1·5-1`, `1·11-1`, `3·12-1`, `8·5-1`, `8·10-1`). That is a leftover of the old heart rule, and UI mechanics in the content.
- "Drag these …" appears in 3 order prompts (`1·3-3`, `1·8-3`, `1·10-1`), but the interaction is tapping.
- docs/rules/03-content-rules.md §3.4: level files contain only content, "never button labels, colors, animation or layout". How something is operated is up to the UI.

**S31 – "THE SCENE" above closing takeaways**
- The story screens at the end of a lesson (`1·1-2 S12`, `1·1-3 S13`, `1·2-3 S13` …) are not a scene but a conclusion.
- *Proposal:* a label of their own, "Takeaway" (🔶 W17).

**S32 – Fix individual questions**
- `1·14-2 S7` "Which style is realistic?": Day Trading counts as correct, but the explanation says all three fit. That is unfair.
- `1·14-2 S13` "… plus nerves of steel → scalp": an ego trigger that steers toward scalping and does not fit the sober tone.
- `1·2-3 S4` "A factory burns down at night; why does the price only fall in the morning?": the answer ignores pre- and after-hours trading, which level 10 teaches later.
- `1·1-4 S9` (spot-mistake) is ambiguous. The mistake is taken to be "with the $5,000 you have", but in substance it is rather "500 shares at $14.00" (the size).
- `1·3-1 S13` (fill-tiles) repeats a match pair from two screens earlier word for word and answers itself.
- `1·16-1 S2`: the token sentence renders as "04:00–09:30 ET trading shows +7 %" and reads awkwardly.
- `1·1-1 S11`: for "Buy" in a falling market the explanation only says "Waiting is a decision too", but not why buying was bad here.
- `1·17-1 S5` "clearest reason a beginner has to buy" (see M9).
- `2·1-4 S7` introduces a new account (see M15).

**S33 – An explanation for each wrong option** 🔶 W21
- Today there is one explanation for all options.
- "Why exactly this answer is wrong" teaches much more, above all for common misconceptions.

**S34 – Answer tells**
- *Length tell:* the correct option is the longest one in 41 % (ch. 1) and 37 % (ch. 3) of questions, just below the 45 % limit.
  - In ch. 8 it is only 2 %, in ch. 2 only 10 %.
  - That is a reverse tell: "the longest is never right".
  - *Proposal:* a lower limit of ~15 % (🔶 W22).
- *Dash tell:* the only option with a "—" is the correct one in 5–6 % of questions (ch. 1, 4, 6, 7).
  - docs/rules/03-content-rules.md §3.5 forbids this and says "checked by the validator", but the validator only checks it in drill packs.
  - Bring the validator up to date; that is not a doc conflict.

**S35 – One spelling** 🔶 W16
- British and American spelling are mixed: rumour 8× / rumor 6×, favour 3× / favor 4×.

**S36 – Consistent terms**
- "Level", "lesson" and "sub-level" are mixed up.
- Examples:
  - The recap tag "Level 1-1" means a lesson.
  - The map says "Lesson 1 of 4".
  - The banner says "1/4 lesson".
  - The dialog says "sub-level".
- *Proposal:* in the UI only "Level 3 · Lesson 1".

**S37 – Text length** 🔶 W10
- "max. 3 lines ≈ 220 characters" makes 4–5 lines on a phone (16 px on 358 px ≈ 45–50 characters per line).
- Several screens have 4 lines (`1·1-1 S3`, `1·1-3 S6`).

### 4.3 Tech

**S38 – Generate the content index and load content on demand instead of bundling everything**
- Today there are 58 hand-written imports in `src/content.ts`, and all content sits in the JS bundle: 2.4 MB, 4.6 MB with all chapters, roughly three times that with Day and Swing.
- *Proposal:*
  - A script generates the index.
  - Chapters are loaded as JSON assets, one per chapter.
  - Content updates via `expo-updates`, without a store release.

**S39 – One source of truth for the data format**
- docs/level-files/, the TypeScript types, the validator and the test bench drift apart; M2 and M3 are the result.
- *Proposal:* a JSON Schema (or Zod) from which the validator and the TS types are derived. The bench is validated too.

**S40 – Tests and linting for the app**
- There are no unit tests for scoring (`answers.ts`), the number parser (`parseNumeric`) or hearts/streak/XP (`progress.ts`), and no ESLint or Prettier.
- A few dozen Jest tests would safeguard a lot here.

**S41 – Test tools behind a dev flag** (docs/ui/16-navigation.md §11.5: "go before release")
- "Skip ahead" awards XP for lessons not played; in my test that was 1,255 XP.
- "Refill hearts" and the bench also belong only in test builds.

**S42 – Backend, account, sync** (docs/rules/ names Supabase and RevenueCat)
- None of it is built, and there is no plan for when.
- Progress is only stored locally: a new phone or deleting the app means everything is gone.
- To decide: when login comes, what is synced, GDPR.

**S43 – Store readiness**
- Missing: app icon, splash screen, `bundleIdentifier`/`package` and `eas.json`.
- `app.json` is called "Lesson Player".
- Version 0.1.0 (app.json) does not match 1.0.0 (package.json).

**S44 – License**
- `package.json` says `"license": "ISC"`, a permissive open-source license, and there is no LICENSE file; `author` is empty.
- For a proprietary course, `"UNLICENSED"`, `"private": true` and a copyright notice are better.

**S45 – XP rules** 🔶 W11
- Replays give full XP. That invites farming and matters as soon as there is a leaderboard.

**S46 – Clean up the web build**
- The title is "Lesson Player".
- No `viewport-fit=cover`, no `theme-color`, no manifest, no favicon.

**S47 – Error and learning analytics (privacy-friendly)**
- There is no crash reporting and no analysis of which questions are often answered wrongly or where people quit.
- For a learning app that is the most important tool for improving the content.
- Build it as an opt-in, hosted in the EU.

### 4.4 Docs & process

**S48 – README.md on `main`**
- `docs/plan/` appears twice in the table.
- `content/replays/` is listed but does not exist.
- "none of them has ever been rendered" is outdated.

**S49 – README-app.md is outdated**
- It says "Plays exactly one sub-level … no path map, no hearts, no XP".

**S50 – Update docs/plan/**
- SIZING is still in the order, although its section says "done".
- "Rendered 783 of 5,109" is outdated after my test; it only becomes reliable with M14.
- App work is missing as a stage (🔶 W2).

**S51 – Small things in the docs**
- The bench subtitle says "all 36 archetypes", but the bench has 49 screens.
- `market_profiles.yaml`: `premarket: "04:00–09:30"`, but `first_minutes: "9:30–10:00"` (once with a leading zero and once without).
- docs/rules/01-what-we-build.md §1 points to `docs/Trading_Learning_App_Konzept.pdf`, which is not in the repo. Either upload it or delete the sentence.

**S52 – Clean up the skills** 🔶 W18
- Scope: 34 third-party skill files with 11,098 lines.
- They are loaded automatically into every Claude session via `.claude/skills`.
- Several contradict docs/ui/ and docs/rules/:
  - `stitch-design-taste`: constant micro-animations vs. "Nothing moves unless the learner moved it".
  - `gpt-taste`: "Static interfaces forbidden", GSAP.
  - `design-taste-frontend`:
    - It forbids dashes, but chapter 1 alone has 133.
    - It says itself "NOT for native mobile".
    - v1 is a duplicate of v2.
  - `write-swift` is irrelevant; there is no Swift here.
- I would keep `animate-expo`, `apple-design`, `emil-design-eng` and `review`/`improve-animations`.

**S53 – Use GitHub as a tool**
- Open items as issues instead of a README list "Open work", with labels, milestones and a PR template.
- Small PRs instead of one PR with 425 files.

**S54 – Make real phone tests possible**
- Deploy the web build automatically (e.g. GitHub Pages or Netlify) and/or use TestFlight or an Expo development build.
- Then you and testers can play on your own phones.
