# Decisions, measurements and order

_Part of the [review of 2026-09-25](README.md) · §7–10_

## 7. Open decisions only you can make

The first three are stated as such in docs/plan/ and docs/rules/, and they block OFFER. My recommendation is given with each one.

- **A – Does the path end at "a process you can paper-trade with" or at "a person who can start"?**
  - *Recommendation:* at the process, as docs/rules/01-what-we-build.md §1.1 promises, plus an honest orientation lesson.
  - What that lesson covers: what lies between paper and real money (account types, real-time data, taxes → an advisor), generic and without instructions.
- **B – 123 shorts need a margin account.**
  - *Recommendation:* option (a), name the account and keep the content. That is the cheapest option, and all the drills stay.
- **C – The session with six trades does not fit a cash account under T+1.**
  - *Recommendation:* option (b), say it plainly.
  - (a) breaks the sizing lessons, and (c) hides that in the US neither works under $25,000.
  - Check again after FINRA's reform of the PDT rule.
- **D – Hearts in lessons?** (W1)
- **E – Which path next, and when?** (W2b)
- **F – Leaderboard: yes, no or opt-in?** (W7)
- **G – Keep nine looks or reduce them, and a light theme?** (W6)
- **H – Animation pace:** should the docs (200 ms) or the current, slower code apply? (S5)
- **I – Monetization** (docs/rules/ names RevenueCat): what costs money?
  - *Recommendation:* never sell hearts or streak repairs. In a trading app that looks like a gambling mechanic.
  - Premium rather through more paths, replays and drills.
- **J – Language:** English only, or German as a second language? (W19)
- **K – When do the backend and login come?** (S42)

---

## 8. Measurements

**Scope and rendering**

| What | Value |
|---|---|
| Playable in the app | 58 lessons, 783 screens (ch. 1 + ch. 2 L1–3), ~3.5 h |
| Written, not wired in | 330 lessons, 4,326 screens |
| Played through (by hand + script) | 58/58 lessons, 0 crashes |
| Render test ch. 2–8 | 4,464 screens: 40 crashes (all `depth-ladder`, 38 lessons), 15 with a missing price line (NaN), 0 empty screens |

**Tools**

| What | Value |
|---|---|
| Validator (PR) | 0 errors, 3 warnings (`--strict`: 3 errors) |
| Validator (`main`) | 1 hard error, 66 sizing breaches |
| Self-test / sizing / tsc | 110/110 · 0 breaches · clean |

**Content**

| What | Value |
|---|---|
| Correct long/short decisions that end in a loss | 12 of 338 (3.5 %), ch. 1–4: 0 |
| Theory and example screens with a visual | 86 of 759 (11 %) |
| Carousel cards with a real icon | 16 of 120 |
| Length tell (correct = longest option) | ch. 1 41 %, ch. 3 37 %, ch. 2 10 %, ch. 8 2 % |
| Dash tell | 5–6 % in ch. 1, 4, 6, 7 |
| Inconsistent signs in number inputs | 6 places in ch. 1 |
| `levels` as a bare number (NaN) | 29 in 13 files |
| Position size ch. 1 / ch. 2 (median) | 84–94 % / 90 % of the account (plan: 50 %) |

**App and tech**

| What | Value |
|---|---|
| Hearts | 5; a full refill takes up to 20 h |
| Timings (code) | reveal 380 ms, panel 620 ms, screen 420 + 640 ms (docs/ui/: 200 ms) |
| JS bundle | 2.4 MB, 4.6 MB with all chapters |
| Contrast of `textFaint` | ~3.8:1 (target ≥ 4.5:1) |
| Smallest display, 320×568 | text shrunk down to ~8 px |

---

## 9. What is really good (please keep it)

- **The content** of chapter 1 and chapter 2 L1–3 is clear, precise and well paced. The numbers are realistic, and "No trade is never punished" is applied consistently.
- **The docs** are exceptionally thorough: decisions come with reasons, and open conflicts are noted honestly instead of being covered up.
- **Quality assurance** is taken seriously: a validator with a self-test, a sizing check, 0 errors.
- **The app** is stable: 0 crashes in all 783 playable screens.
  - The architecture is clean (YAML → renderer).
  - Deep links and the test bench make testing easy.
- **Details that are fun:**
  - The calculator with a live result in number tasks.
  - Rising tones for streaks.
  - The calm out-of-hearts page.
  - A clear path choice.
- **The accessibility basics** are there: a visible keyboard focus, "Reduce motion" is respected, candles have labels.

---

## 10. My proposal for the order

1. **Quick bug fixes (1 PR):** M1–M7. Most of them are small and clear-cut in the code.
2. **CI and a render test:** M14. After that, none of this can come back unnoticed.
3. **Describe and merge PR #13:** M12.
4. **Content corrections:** M9, M10, M15, M17 and S28–S37. They need W3, W12, W13 and decisions A–C.
5. **Required before any release:** M8 (risk note, legal, onboarding) and S41–S44.
6. **Wire in the rest of the content:** M13 with S38.
7. **A UX package:** Practice + heart refill, review cards, glossary, streak and notifications, the completion screen, typography (S2, S9–S16, S19).
8. **After that:** the Swing path (W2b), the backend, the store release.
