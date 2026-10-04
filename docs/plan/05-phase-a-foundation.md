# Phase A: Foundation

_Part of the [build plan](README.md) · §5_

## 5. Phase A – Foundation

### `MERGE` ✅ – PR #13 into `main`

Merged on 2026-09-25 (merge commit `52f0811`). Since then `main` holds the app and the current state of all docs.

### `DOCS` ✅ – plan and docs

Also done on 2026-09-25:
- this plan;
- the review report as `docs/review-2026-09-25/`;
- all decisions from section 4.1 written into `docs/rules/`, `docs/ui/`, `docs/level-files/`, `docs/course/`, `README.md`, `README-app.md` and `CLAUDE.md`;
- the skills cleaned up (W18);
- the whole project in English.

### `CI` – automatic checks and preview

Done on 2026-09-26 (PR #15). Checks run on every PR, the Cloudflare Pages preview is connected. Part B (Expo Go) is not set up yet: it moved to `LOOK-SYSTEM` (item 9 there). Branch rules are replaced by the merge rule in `CLAUDE.md`, because GitHub Free does not enforce them on private repositories.

**Goal.**
- No error reaches `main` unnoticed any more.
- You can test every PR on your phone.

**Scope**
1. **GitHub Actions `ci.yml`** on every PR and every push to `main`:
   - Python: `validate_content.py` (0 errors), `test_validate.py`, `check_sizing.py --summary` (0 breaches), `build_drill_batch.py --check`.
   - Node 22: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, web build (`npx expo export --platform web`).
   - Under 10 minutes, with caches. Background: private repositories get 2,000 Actions minutes per month on GitHub Free.
2. **ESLint** (Expo configuration) and **Prettier**. Prettier only checks; formatting the existing code once is a commit of its own.
3. **Jest** (`jest-expo`) with first unit tests for the most delicate places:
   - `src/lesson/answers.ts`: every question type right, wrong, amber.
   - `parseNumeric`: multiplication before addition, minus, decimals.
   - `src/progress.ts`: a heart exactly after 4 h, the streak across day boundaries and time zones, XP with the perfect bonus.
4. **Testing tools only in test builds** (S41):
   - `EXPO_PUBLIC_TEST_TOOLS=1` enables Skip ahead, Refill hearts and the test bench. Release builds do not show them (`docs/ui/16-navigation.md` §11.5).
   - `skipTo` no longer awards XP (W11).
5. **Preview per PR, part A (required):** Cloudflare Pages.
   - Free, works with private repositories, builds every PR automatically and posts the link on the PR.
   - Build command: `npx expo export --platform web --output-dir dist`.
   - Output directory: `dist`.
   - Environment variables: `NODE_VERSION=22`, `EXPO_PUBLIC_TEST_TOOLS=1`.
6. **Preview in Expo Go, part B** (recommended, at the latest before `LOOK-SYSTEM`):
   - EAS Update per PR with a QR-code comment (`expo/expo-github-action`). That way you feel real haptics and hear real sounds.
   - If Expo Go does not load the SDK version: an Android preview build (`eas build --profile preview`). iOS then comes with `STORE-SETUP` via TestFlight.
7. **Upkeep:**
   - `.github/pull_request_template.md` with the fields stage, what, checks, test checklist (S53).
   - In `package.json`: `"private": true` and `"license": "UNLICENSED"` instead of ISC (S44).

**You prepare.** Claude writes the exact click-by-click guide into the report.
- Create a Cloudflare account and connect the Pages project to the GitHub repository (about 10 minutes).
- Optional for part B: create an Expo account, generate an access token and store it as the GitHub secret `EXPO_TOKEN`.
- Recommended: GitHub → Settings → Branches → rule for `main` → "Require status checks to pass".

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage CI from docs/plan/05-phase-a-foundation.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "CI" section in docs/plan/05-phase-a-foundation.md in full.
Build exactly that scope — nothing from later stages.

Especially important:
- The Actions stay under 10 minutes (caches); the repository is private.
- Format existing code with Prettier only in a commit of its own.
- The unit tests test edge cases (minus, day change, a heart exactly after 4 h), not only the normal case.
- Once, deliberately introduce a validator error, show that CI turns red, and remove it again.
- Write me a step-by-step guide for Cloudflare Pages (and for Expo, if you get part B done).

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · what I have to set up · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- CI green on the PR.
- At least 30 unit tests.
- The web build succeeds.

**You test (~15 min)**
1. On the PR on GitHub, under "Checks": everything green (Python, TypeScript, lint, tests, build).
2. Open the preview link on your phone: the app starts, lesson 1-1 is playable.
3. In the preview: Account → Settings → "Testing" is there, "Skip ahead" works.
4. (Part B) Scan the QR code with Expo Go: the app runs, haptics can be felt.
5. In the report: the deliberately red run is visible.

**Done when** every PR has green checks and a preview link, and you have opened the link on your phone.

### `WIRE` ✅ – wire everything in, test every screen

Done on 2026-09-27 (PR #16). All 388 written lessons are on the map; `npm run smoke` opens all 5,158 screens and the CI job "Render" reports on every PR (not blocking until `STABLE-DATA`). Found beyond the known 40 crashes and price-line `NaN`s: 5 `cost-stack` screens that print `NaN` (→ `STABLE-DATA`). For `OFFER`: renumbering Chapter 8 Levels 15–17 changes their entry ids, so saved progress on them needs mapping.

**Goal.**
- Everything that is written is playable.
- A test opens every single screen.

**Scope**
1. **A generated content index instead of 58 hand-written imports** (M13, S38):
   - `npm run gen:content` builds the index of all lessons, chapters and entries from `content/**`.
   - `src/content.ts` uses it.
   - CI checks that the index is up to date.
2. **All Scalping Chapters 2–8 on the map.** Chapter 8 Level 15 comes with `OFFER`.
3. **Make the path choice honest** (S27): Day and Swing still show "Being written", now with one honest sentence. Both come before the release (decision E).
   - Scalping needs time at the market open.
   - Whoever does not have that time can flag interest in Swing. That is a local flag; the reminder comes with `LOOP-DAILY`.
4. **Design the end of the content** (S26): no "soon" without context, but an honest sentence and, later, the way to practice.
5. **Render test `npm run smoke`** (Playwright, Chromium):
   - Builds the web export with the testing tools and opens **every** screen by deep link.
   - Reports crashes (the error page), console errors (e.g. `NaN`) and blank screens.
   - Writes `smoke-report.json` and a contact sheet per chapter as CI artifacts.
   - `?test=1` switches animations off. Target: all screens in under 10 minutes.
6. **CI job "render":**
   - Runs on changes in `src/`, `content/` and `demo/`; on content-only PRs only for the affected chapters.
   - **Not blocking** until `STABLE-DATA` (the 40 known crashes), mandatory afterwards.
7. **Correct the test-bench subtitle** ("all 36 archetypes") to the real count (S51).

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage WIRE from docs/plan/05-phase-a-foundation.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "WIRE" section in docs/plan/05-phase-a-foundation.md in full, plus docs/ui/10-path-map.md §7.1 and docs/ui/16-navigation.md §11.4.
Build exactly that scope — nothing from later stages.

Especially important:
- Existing players must not lose progress: the entry ids of lessons already wired in stay the same.
- The render test must open every screen of every lesson — count them and compare with `python3 tools/validate_content.py --status`.
- Until STABLE-DATA the render job is not blocking; its report still appears on the PR.

Open a PR against main and get every check green.
Report: what you built · check results (including the render numbers) · my test checklist with real links · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- `npm run smoke` reports exactly the known problems (40 crashes, 15 `NaN`) and nothing new.

**You test (~20 min)**
1. Map: Chapters 1–8 are there; later chapters are locked as usual.
2. Settings → Testing → Skip ahead → Chapter 5 Level 3: play one lesson.
3. Open Chapter 3 Level 15: the error page is **still expected** here and gets fixed in `STABLE-DATA`.
4. On the PR: the "render" job shows the numbers, and the contact sheets are attached as artifacts.
5. App start on your phone: does it feel like under 3 seconds?

**Done when** every written lesson can be reached through the map and the render test reports in CI.
