# Phase C: Look system

_Part of the [build plan](README.md) · §7_

### `LOOK-SYSTEM` – the chosen direction as a system

**Goal.** Every screen benefits without touching every screen one by one.

**The direction** is your mix from `LOOK-BRIEF` (`docs/ui/15-theming-and-accessibility.md` §10): Calm's layout, type and motion on today's designs Neo, Neo Mono and Classic Contrast, with Precise's number face and the step count beside the progress bar. The home screen wears it too, and the path map keeps today's design with your changes (item 12). Its reference is the prototype `#prototype/mix/<screen>` in a test build. The chart, the trade log and the numbers that count up come in `LOOK-COMPONENTS`; the streak screens and the gems in `LOOP-DAILY`.

**Scope**
1. **Colors** ✅ (S17, S18, W6):
   - Light, dark and system.
   - **Contrast ≥ 4.5 : 1** for every text; a check script runs in CI.
   - **The three looks** Neo, Neo Mono and Classic Contrast, each with a light version (today they only come in dark; the prototype's light versions are the starting point, and you found them good as a start). The other six designs and their code go.
   - A color-blind palette in blue/orange.
   - In `app.json`: `userInterfaceStyle: automatic`.
2. **Type scale** ✅ (S2): body text 16–17, labels ≥ 13. Nothing a decision depends on goes below 13, not even the state chips. Calm's scale from the prototype, and numbers in a monospaced face while the words around them keep the text face.
3. **Layout** ✅ (W4, W5):
   - Answers in the thumb zone. On 2026-09-30 you changed it: a screen's content sits in the middle of its area ("It looks weird" at the top or the bottom), and the result box has its place at the bottom of that area, right above Continue, so it no longer covers the key.
   - `FitScreen` shrinks to 85 % at most; if it still does not fit, the screen scrolls. Your critique: a screen with too much content got squished, and that looks bad.
   - Content no longer sticks to the top.
   - The reveal gets its slot above the key before it appears, and the screen scrolls to it, so the key never covers the result box (your critique; the prototype's `Screen` in `src/prototype/layout.tsx` shows how).
4. **Motion system** ✅ (decision H, S5):
   - Calm, high-quality motion tokens: durations, easing curves and springs, tuned on real phones and recorded in `docs/ui/15-theming-and-accessibility.md` §10. Calm's pace from `LOOK-BRIEF` is the starting point.
   - A tap never waits for motion: it finishes or skips the running animation.
   - Everything runs on the UI thread (Reanimated) at the display's frame rate, also on a cheap Android phone.
   - Reduce motion replaces movement with short fades.
5. **Controls** ✅ (S13, S12):
   - Tap targets ≥ 48 pt.
   - Quit dialog: "Keep learning" is the main button, and the text says "lesson" instead of "sub-level".
   - A key's label stays on one line and never breaks (your critique: Continue sometimes did). Done in `LOOK-BRIEF` for today's keys (you chose to fix it there): the level card's "Continue: lesson 3" (`src/home/LearnScreen.tsx`) became "Continue", and the lesson key and the level card's key shrink a label that would not fit instead of breaking it. The new keys keep that rule.
6. **Top bar and wording** ✅ (S9, S36):
   - The top bar in your order, evenly spaced: the path's logo, the streak, the gems and the hearts, each an icon with its number (`docs/ui/11-top-bar.md` §7.2, `#prototype/mix/map`). The daily goal leaves the bar: the flame lights when today's goal is met, and "Today 1/2" shows on lesson complete and when you tap the flame. The path logos are stand-ins until `BRAND`. The gems were planned for `LOOP-DAILY`; on 2026-09-30 you asked for them now, so they show third in the bar with their count (0 until they are earned; Settings → Testing adds 50 a tap). Earning them stays in `LOOP-DAILY`, what they buy is decision U. On 2026-10-01 you asked for the bar lined up with what is under it and for the logo to choose the path: the logo now sits on the banner's left edge and the hearts on its right edge, and a tap on the logo opens the three paths, the one in use ticked and the ones still being written shut (`docs/ui/11-top-bar.md` §7.2). The logo shows the chosen path's icon.
   - In a lesson, the step count beside the progress bar ("4/12").
   - Banner "Lesson 1 of 4".
   - Clean accessibility labels: "3 day streak", "5 hearts".
   - Titles on the map that were cut off, or covered by stray text out of place (your screenshots, e.g. "LE", "LEVE"): fixed in `LOOK-BRIEF` (you chose to fix it there). The stray text came from a hidden copy of each level's label, laid out to measure it, which the iPhone drew anyway; the map no longer has one (`src/home/LearnScreen.tsx`). A level's title shows whole (it stopped after three lines), a long chapter name shrinks to fit its one line, and no title breaks at a hyphen ("1-" / "Minute"). The new map keeps this.
   - **Fewer words** (your critique: "way too much text on every screen, keep it simple"): the app's own texts get shorter everywhere, on the map, the level card, lesson complete, the dialogs and Settings, as the prototype shows. The lessons' texts get shorter in `CONTENT-FIX`, under the limit from `RULES`.
7. **Web** ✅ (S46): title = app name, `theme-color`, `viewport-fit=cover`, favicon.
8. **Visual comparison** ✅: contact sheets of all bench screens at three sizes (390, 375, 320 pt), each in light and dark, as a CI artifact.
9. **Expo Go preview** (`CI` part B, moved here): you create an Expo account and the GitHub secret `EXPO_TOKEN` (guide: `docs/setup-preview.md` §2); Claude runs `eas init` and `eas update:configure`. From then on every PR gets a QR code, so motion is tuned on a real phone. **Open:** the secret is not set yet, so the CI job skips; until then you test by running the branch in Expo Go yourself.
10. **Sounds** ✅ (your critique in `LOOK-BRIEF`):
    - Sounds play with the phone on silent (your choice): the audio mode plays in silent mode, and the app's Sound toggle stays the one switch that mutes them.
    - Fast taps lose sounds: each sound has one player, and a second tap rewinds it before the first has played (`src/lesson/sound.ts`). Two or three players per sound, taking turns.
    - Continue plays the soft tap of the lesson's ✕ (`tick`) instead of its own "advance" sound.
    - Letter tiles and number keys play the barely-there `detent`, not the answer tap.
11. **Settings** ✅ (your critique):
    - **Change design:** a button that shows each of the three looks full screen on a real lesson screen, with "Use this design" (today they are small cards to swipe past).
    - The testing tools stay in Settings under **Testing** (a Development screen was built first; on 2026-09-30 you asked for them straight in Settings), still in test builds only, with the **Design suggestions** page (today Settings → Testing → Design suggestions): ideas for the look, drawn live, each marked in the mix or not (your wish in `LOOK-BRIEF`), and the **Animations** page (today Settings → Testing → Animations). Every new animation of a rare moment gets a row there. The streak screens were planned for `LOOP-DAILY`; on 2026-09-30 you missed them there and asked for them "real nice fancy", so they are built now (`src/lesson/StreakScreens.tsx`) and play there as "Streak goes up" and "Streak lost". `LOOP-DAILY` shows them in the app's own flow. On 2026-10-01 you asked for "way more" design suggestions, experimental and cool, and built like the Animations page: the page is now a list of ideas in groups, each a row that plays its preview on a page of its own (`docs/ui/15-theming-and-accessibility.md` §10, `src/home/ideas/`).
12. **The path map** ✅ (your answers in `LOOK-BRIEF`, `#prototype/mix/map`):
    - Today's design stays, in the chosen look (you: the list-style maps look too professional and not fun).
    - Smaller level buttons, 58 pt in a 76 pt ring instead of 72 in 96, so small scenes fit at the sides of the path. The scenes are drawn in the ground's own ink, as faint as its grid and with no colour, so they fit the background instead of standing out (your note of 2026-09-29). On 2026-09-30 you asked for the buttons "a little bigger" (now 66 pt in an 86 pt ring) and the drawings faintly in the background rather than next to each level, in several sizes: they are scattered down each chapter, the biggest partly off the screen. On 2026-10-01 you asked to remove the background decoration, so the drawings are gone.
    - Moving on to the next level, smoother and with haptics and sounds (your wish of 2026-09-30): the map glides down while a spark runs the path to climbing notes, the lock rattles and bursts off with sparks and the unlock chime, and START lands with a pop (`docs/ui/10-path-map.md` §7.1).
    - A finished level drops its progress ring and keeps its check; only the level you are on shows a ring.
    - The label beside a level is its title alone, in whole lines (`docs/ui/10-path-map.md` §7.1).
13. **Clean-up** ✅: once the mix is built, `src/prototype/` goes, with its route and its Settings row. The Design suggestions page stays under Settings → Testing (item 11).
    - **The prototype after it is gone.** Where a later stage points to `#prototype/mix/<screen>` or a file in `src/prototype/` (the forming candle and the count-up in `LOOK-COMPONENTS`, the streak screens in `LOOP-DAILY`, the bonus side lesson in `FUN-PASS`), it reads it at commit `a78e210`, the last one that has it: `git show a78e210:src/prototype/kit.tsx`, or `git checkout a78e210` and open `#prototype/mix/<screen>` in a test build.

**Two sessions** (David, 2026-09-30), each its own PR:
- **Session 1, the system:** items 1, 2, 4, 5 (tap targets and the quit dialog), 7, 8, 9 and 10, plus the check scripts (`npm run check:ui`, `npm run sheets`).
- **Session 2, the screens:** items 3, 5 (the key's label), 6, 11, 12 and 13, and the docs that go with them. Its test checklist is items 2, 3 and 7–10 of "You test" below; session 1's is items 1 and 4–6.

**Status** (2026-09-30, checked 2026-10-03): both sessions are built and are tested and merged together: PR #20 holds session 1, and PR #21 (session 2) goes into its branch. On 2026-10-03 both were still open; `DESIGN-REVIEW` is stacked on #21. Items 1–8 and 10–13 are done; item 9 waits for your `EXPO_TOKEN`. Your ten improvements of 2026-09-30 are in PR #21 too, among them two things pulled forward from `LOOP-DAILY` at your request: the gems in the top bar and the streak screens (built, and played on the Animations page). So are the fix for the crash on Animations → Chapter complete and your changes of 2026-10-01: the top bar lined up with the screen under it, the path picker on its logo, no background drawings, and the bigger Design suggestions page. The stage gets its ✅ in section 2 with "OK LOOK-SYSTEM – merge".

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 1–2

**Prompt**
```
Stage LOOK-SYSTEM from docs/plan/08-phase-c-look-system.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "LOOK-SYSTEM" section in docs/plan/08-phase-c-look-system.md in full, plus docs/ui/ in full (the chosen direction is in §10).
Show me your plan first (which files, in which order) and wait for my approval.
Then build exactly this scope — no new features.

Especially important:
- Contrast and minimum sizes are checked by a script, not by feel.
- The contact sheets before/after belong in the report.

Open a PR against main and get every check green.
Report: what you built · check results · contact sheets before/after · my test checklist with real links · open questions. Then stop.
```

**Claude checks automatically.** All standard checks, the contrast script, the contact sheets.

**You test (~30 min)**
1. Play lesson 1-1, lesson 9-2 and a checkpoint, once in light and once in dark.
2. Play one-handed: can you reach every answer with your thumb?
3. Simulate a small display: Chrome on your computer → developer tools → "iPhone SE" and 320 px width. Expected: nothing below ~13 px, nothing cut off.
4. Switch the look in Settings and turn on the color-blind palette.
5. Fun question (1–5): does the motion feel calm and polished, and never sluggish?
6. Sounds: with the phone on silent they still play, and when you tap fast every tap sounds. Continue sounds like the ✕.
7. Settings → Change design shows each of the three looks full screen.
8. The map: the buttons a little bigger, faint drawings in the background, no ring on a finished level, every title whole and nothing drawn twice.
9. The top bar: the path logo, the streak, the gems and the hearts, evenly spaced. No key breaks its label onto two lines.
10. Fewer words: does any screen still feel like reading?

**Done when** the contact sheets are right and you are happy.
