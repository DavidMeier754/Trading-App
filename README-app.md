# The app (Expo + React Native + TypeScript)

The app plays the lesson YAML in `content/` exactly as written, on phones and in the browser. It is on `main` since PR #13 (2026-09-25).

What comes next, stage by stage, is in `docs/plan/`. Its known issues are in `docs/review-2026-09-25/`, items M1–M7; stages STABLE-APP and STABLE-DATA fix them.

## What it does today

- **Lesson player:**
  - every screen type in `docs/ui/` §3–4, with a 49-screen test bench;
  - `Check` → inline reveal → `Got it`;
  - the chart engine: line and candles, volume, levels, VWAP, playback;
  - sounds, haptics, reduce motion, nine lesson looks.
- **Home:**
  - the path map: Chapter 1, the path-choice node and Scalping Chapters 2–8, every written lesson;
  - the HUD: streak, daily ring, hearts;
  - tabs: Learn, plus Practice, Leaderboard and Account as placeholders;
  - Settings.
- **Progress on the device** (AsyncStorage): lessons played, hearts (5, one back every 4 h), XP (+50 % for a perfect run), streak, and the learner's plan. There is no backend.
- **Not yet written:** Scalping Chapter 8 Level 15 (stage OFFER), Day Trading and Swing Trading. The map ends on a note that says so.

## Run it

```bash
npm install
npm run web          # browser preview
npm start            # then press i / a, or scan the QR code with Expo Go
npm run typecheck
npm run lint         # ESLint
npm run format:check # Prettier (npm run format fixes it)
npm test             # Jest unit tests
npm run gen:content  # rebuild the content index after adding or removing a lesson file
npm run smoke        # render test: every screen of every lesson (Playwright)
npm run build:web    # static site in dist/
```

Every PR and every push to `main` runs these, and the content checks, in GitHub Actions (`.github/workflows/ci.yml`).

## Open any screen directly

Deep links work in the browser and in the web preview:

| Link | Opens |
|---|---|
| `#level-01-3/5` | Chapter 1, Level 1, sub-level 3, screen 5 |
| `#scalping-ch2-level-02-1/4` | Scalping Chapter 2, Level 2, sub-level 1, screen 4 |
| `#all-screens/12` | Screen 12 of the test bench (`demo/all-screens.yaml`) |

Append `?look=arcade` (or any other look) to switch the lesson design.

## Testing tools

Settings → Testing offers:
- **Every screen type** – opens the test bench.
- **Skip ahead** – jumps to any level; everything before it counts as played.
- **Refill hearts.**

They exist only in test builds and earn no XP. To see them locally, start with the flag set:

```bash
EXPO_PUBLIC_TEST_TOOLS=1 npm run web
```

The `#all-screens` deep link needs the flag too. The PR previews set it.

## Put it on the web

`npm run build:web` writes a plain static site to `dist/`: an `index.html` and one JS bundle, with no server of its own. Any static host serves it; the plan uses Cloudflare Pages with a preview link per PR (stage CI).

Two things the web build cannot show you:
- **Haptics.** There is no browser API worth using, so every `expo-haptics` call is a silent no-op.
- **Native-driver animation smoothness.**

Both need Expo Go or a real build on a device.

## How the content is read

`metro/yaml-transformer.js` parses `.yaml` at bundle time and re-emits it as a plain JS module. That is why `src/content.ts` can import the repo's level files directly:

```ts
import levelYaml from '../content/shared/chapter-01-market-basics/level-01-1.yaml';
```

Nothing under `content/` is copied, rewritten or generated from. Expo's default config lists `yaml` in `assetExts`, which would hand the app a URL instead of the data, so `metro.config.js` moves it to `sourceExts` first.

Which files there are comes from `src/content.generated.ts`, one import per sub-level file. `npm run gen:content` (`tools/gen_content.mjs`) writes it from `content/**`, and CI fails when it is out of date. A new lesson file therefore needs no hand edit in `src/`: add it, run `npm run gen:content`, commit both. Entry ids come from the file's own `id`, chapter and path (`level-01-2`, `scalping-ch3-level-15-2`), so saved progress survives a regenerated index.

## The render test

`npm run smoke` builds a test build, serves it locally and opens every screen of every lesson by deep link in headless Chromium, several pages in parallel (`--workers N`). `?test=1` in the URL turns animations off and lets each new hash open its screen without reloading the app. For every screen it records crashes (the error page), `NaN` in a drawn attribute or in the text, console errors and blank screens, and checks the app's screen count against `python3 tools/validate_content.py --status`, chapter by chapter.

It writes `smoke/smoke-report.json`, `smoke/summary.md` and one contact sheet per chapter (`smoke/contact-<chapter>.jpg`, problem screens framed red), and exits 1 when it found anything. `--only chapter-03-orders-costs-position-size,…` limits it to some chapters; `--no-build` reuses the last build. Locally, set `CHROMIUM_PATH` if Playwright's own Chromium is not installed.

In CI the "Render" job runs it on changes in `src/`, `content/` and `demo/` (only the touched chapters on a content-only PR), posts the numbers as a comment on the PR and attaches the report and the contact sheets as the `render-report` artifact. Since stage STABLE-DATA it is blocking: any crash, NaN, console error or blank screen fails it.

## Layout

```
src/
  App.tsx               deep links and the page shell
  content.ts            the map built from the lessons, and the market profile, read at build time
  content.generated.ts  one import per lesson file (npm run gen:content)
  progress.ts           progress, hearts, XP, streak, plan and settings (AsyncStorage)
  format.ts             docs/ui/14-glossary-and-copy.md §9: number and {{market.*}} formatting
  theme.ts              docs/ui/15-theming-and-accessibility.md §10: colour and type tokens
  home/                 path map, HUD, tabs, settings
  lesson/               the player: progress bar, CTA, reveal, grading, summary, hearts, sounds, haptics
  screens/              one file per screen archetype
  components/           Chart.tsx (line + candles, volume, levels, VWAP, playback) and the visual components
demo/all-screens.yaml   the test bench
metro/                  the YAML transformer
```
