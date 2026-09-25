# The app (Expo + React Native + TypeScript)

The app plays the lesson YAML in `content/` exactly as written, on phones and in the browser. It is on `main` since PR #13 (2026-09-25).

What comes next, stage by stage, is in `docs/build-plan.md`. Its known issues are in `docs/review-2026-09-25.md`, items M1–M7; stages STABIL-APP and STABIL-DATA fix them.

## What it does today

- **Lesson player:**
  - every screen type in `docs/UI.md` §3–4, with a 49-screen test bench;
  - `Check` → inline reveal → `Got it`;
  - the chart engine: line and candles, volume, levels, VWAP, playback;
  - sounds, haptics, reduce motion, nine lesson looks.
- **Home:**
  - the path map: all of Chapter 1, the path-choice node, Scalping Chapter 2 Levels 1–3;
  - the HUD: streak, daily ring, hearts;
  - tabs: Learn, plus Practice, Leaderboard and Account as placeholders;
  - Settings.
- **Progress on the device** (AsyncStorage): lessons played, hearts (5, one back every 4 h), XP (+50 % for a perfect run), streak, and the learner's plan. There is no backend.
- **Not yet wired:** Scalping Chapter 2 Levels 4–18 and Chapters 3–8 are written but not imported. Stage WIRE does that.

## Run it

```bash
npm install
npm run web          # browser preview
npm start            # then press i / a, or scan the QR code with Expo Go
npm run typecheck
npm run build:web    # static site in dist/
```

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

From stage CI on these exist only in test builds (`EXPO_PUBLIC_TEST_TOOLS=1`) and earn no XP.

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

The 58 hand-written imports in `src/content.ts` become a generated index in stage WIRE.

## Layout

```
src/
  App.tsx               deep links and the page shell
  content.ts            the playable lessons and the market profile, read at build time
  progress.ts           progress, hearts, XP, streak, plan and settings (AsyncStorage)
  format.ts             docs/UI.md §9: number and {{market.*}} formatting
  theme.ts              docs/UI.md §10: colour and type tokens
  home/                 path map, HUD, tabs, settings
  lesson/               the player: progress bar, CTA, reveal, grading, summary, hearts, sounds, haptics
  screens/              one file per screen archetype
  components/           Chart.tsx (line + candles, volume, levels, VWAP, playback) and the visual components
demo/all-screens.yaml   the test bench
metro/                  the YAML transformer
```
