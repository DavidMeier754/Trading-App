# Lesson player (Expo + TypeScript)

Plays exactly one sub-level — `content/shared/chapter-01-market-basics/level-01-1.yaml` —
end to end on a phone. No backend, no auth, no path map, no hearts, no XP.

## Run it

```bash
npm install
npm start          # then press i / a, or scan the QR with Expo Go
npm run web        # browser preview
npm run typecheck
```

## Put it on the web

`npm run build:web` writes a plain static site to `dist/` — `index.html` plus one JS
bundle, no server of its own. Upload that folder to any static host (Netlify drop,
Vercel, Cloudflare Pages, GitHub Pages) and the lesson player opens in a phone browser
with no Expo Go install.

Two things the web build cannot show you: haptics (no browser API worth using, so every
`expo-haptics` call is a silent no-op) and native-driver animation smoothness. Those
still need Expo Go on a real device.

## How the content is read

`metro/yaml-transformer.js` parses `.yaml` at bundle time and re-emits it as a plain JS
module, so `src/content.ts` imports the repo's level file directly:

```ts
import levelYaml from '../content/shared/chapter-01-market-basics/level-01-1.yaml';
```

Nothing under `content/` is copied, rewritten or generated from. Expo's default config
lists `yaml` in `assetExts` (which would hand the app a URL instead of the data), so
`metro.config.js` moves it to `sourceExts` first.

## Layout

```
src/
  content.ts              the level + market profile, read at build time
  format.ts               docs/UI.md §9 number and {{market.*}} formatting
  theme.ts                docs/UI.md §10 tokens (dark)
  lesson/                 the shell: progress, CTA, inline reveal, grading, summary
  screens/                one file per screen archetype
  components/Chart.tsx    line + candlestick, volume, levels, VWAP, playback
```

What is and is not built, and every place the schema did not carry, is in the build
report that accompanies this branch.
