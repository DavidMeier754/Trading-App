# Phase 1, app lane – the glossary, the tabs, the first run and the icon

_Part of the [build plan](README.md)_

The rest of the frame around the lessons: every word one tap away, the tab bar David chose, a first run that gets to lesson 1 fast, and the app's own face.

### `GLOSSARY` – every term one tap away

**Goal.** Every technical term is explained one tap away (`docs/ui/14-glossary-and-copy.md` §8, S16).

**Scope**
1. ~~**`content/glossary.yaml`** (format in `docs/level-files/`): every term from all `terms_introduced`, one sentence of definition each, plus `taught_in` and `aliases`.~~ **The definitions are written** (`DESIGN-REVIEW`, after David's test on 2026-10-04): every word is an entry of `content/skills.yaml` with its `info` line, and where it is taught comes from the level file that lists it (`docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills"). Left for this stage: **proofread** every word's line against the card that defines it (194 words; no line may contradict its lesson), and add **`aliases`** where the body spells a term differently ("bid-ask spread"), so the marker catches them.
2. ~~**Validator:** every introduced term has an entry, and no definition is too long.~~ Done with `content/skills.yaml` (`docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills", rules of 2026-10-04).
3. **UI:**
   - ~~Terms in body text get a dotted underline (first occurrence per screen). A tap opens a sheet with the definition and "Taught in Level X-Y"; that opens the review card.~~ **Built in `DESIGN-REVIEW`** with David's marker (highlighter and underline, `docs/ui/14-glossary-and-copy.md` §8) and his rule "don't over or underuse them"; the sheet shows "Taught in" and the card already. This stage adds the definition line from `content/glossary.yaml`, and the aliases.
   - ~~The one-line meaning on each skill chip of "What you learned" and on its sheet (`docs/ui/07-lesson-chapter-and-tier-complete.md` §5.3).~~ Built in `DESIGN-REVIEW` (2026-10-04).
   - A glossary list with search in You.
   - A "recently missed" area, fed by `PRACTICE`.
4. **`docs/content-todo/01-rules-from-the-design-review.md` 1.4:** every term in its lesson's `terms_introduced`, spelled as the body spells it, defined on a card of that lesson.

**Model · effort · sessions:** Opus 5.5 · high · 1–2. The definitions must be exact, so not with Sonnet or Haiku.

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage GLOSSARY from docs/plan/08-phase-1-app-tabs-first-run-icon.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "GLOSSARY" section in docs/plan/08-phase-1-app-tabs-first-run-icon.md in full, plus docs/ui/14-glossary-and-copy.md §8, docs/level-files/06-skills-bonus-lessons-market-profiles.md (Skills), docs/rules/05-tests-consistency-and-copy.md §3.9 and docs/rules/08-sources.md §4, and docs/content-todo/01-rules-from-the-design-review.md (Part 1).
Proofread every word's info line in content/skills.yaml against the lesson that introduces the term — read the screen that defines it. No line may contradict its lesson.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · number of terms and of lines changed · 15 random definitions to proofread · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** nothing, as a rule — Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each):
- Underlined terms in three lessons, tapped.
- The glossary in You, searched for "VWAP", "Spread" and "R".
- The 15 definitions in the report: correct and understandable?

### `TABS` – Learn · Practice · Arena · You

**Goal.** The tab bar David chose (2026-10-05, decision V), and a You tab that opens with your numbers. `STATS` is folded in here.

**Already built** (`DESIGN-REVIEW`): the Account page with the tier card in its material, the medal shelf, All stats with the variance view and the risk note, the heat map of your days, and Your plan (`docs/ui/12-practice-and-stats.md` §7.4).

**Scope**
1. **The tab bar:** Learn · Practice · Arena · You. The Leaderboard placeholder goes (W7). The Arena tab shows a lock until `ARENA-TAB` fills it.
2. **You** (today's Account) opens with **your numbers**, measured in decisions and effort, never in money: the weekly XP candle chart with its all-time high, the decision record (long, short, no trade, as counts), the variance view, and accuracy per topic (a lesson's `tags`) and per setup, from the record `DESIGN-REVIEW` keeps. Below them: the tier card, the medal shelf, the heat map, the glossary (`GLOSSARY`), Your plan and Settings.
3. **The tier card shareable as an image,** and the plan as an image if `ONBOARDING` has not done it.
4. `docs/ui/16-navigation.md` §11.2 and `docs/ui/12-practice-and-stats.md` §7.4 record it.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage TABS from docs/plan/08-phase-1-app-tabs-first-run-icon.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 ("Variance"), docs/plan/02-how-to-work.md §1 and the "TABS" section in docs/plan/08-phase-1-app-tabs-first-run-icon.md in full, plus docs/ui/12-practice-and-stats.md §7.3–§7.5, docs/ui/13-tiers-replays-and-plus.md §7.7, docs/ui/16-navigation.md §11 and docs/rules/10-legal-and-safety.md §7.
Never show profit or money as a measure of performance — only decisions and effort.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** nothing, as a rule — Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each):
- Every tab, on your phone: the Arena tab shows its lock.
- You: your numbers against what you played.
- The tier card, shared: the image.

### `ONBOARDING` – the short first run, the risk note, the plan and the language foundation

**Goal.** The first lesson comes fast, and everything the app has to ask is asked when it matters.

**Already built** (`DESIGN-REVIEW`): the first trade comes before everything (`docs/ui/16-navigation.md` §11.1, `src/onboarding/`).

**Scope**
1. **The short first run** (David, 2026-10-05): the first trade → the risk note in one sentence, with "More" → lesson 1-1. Nothing else comes before the first lesson.
2. **Asked when it matters:**
   - after the first finished lesson: reminders yes or no, and a time (`LOOP-DAILY`); from `ANALYTICS` on, its consent question too;
   - the market profile ("Where will you trade later?" US / Germany) the first time a lesson depends on it (market hours in 1·10 at the latest), and always in Settings. Until then numbers follow the phone's format.
3. **The risk note in every place** listed in `docs/rules/10-legal-and-safety.md` §7 (M8): at first launch, under every scenario result as a small line, and on the statistics.
4. **Settings → Legal:** an empty page for now, holding only the risk note (David, 2026-10-05). The legal texts themselves are outside this plan.
5. **Market profile in Settings** (S25):
   - EU number format ("10,00 €").
   - Clock times in local time, e.g. "US market: 15:30–22:00 German time".
   - "The market I trade" and "my time zone" are separate settings.
6. **Plan card** (S22):
   - Choice fields (`kind: choice`) and number ranges (`min`/`max`).
   - A dated plan history (`docs/level-files/05-the-plan.md`, "The plan").
   - Export as an image or as text.
7. **The language foundation** (W19, decision M): every UI string goes through keys (`t('…')`) with one `en.json` file, and numbers, currencies and dates are formatted through the locale (`Intl`), never by hand. The content stays English until `I18N-PIPELINE`.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage ONBOARDING from docs/plan/08-phase-1-app-tabs-first-run-icon.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "ONBOARDING" section in docs/plan/08-phase-1-app-tabs-first-run-icon.md in full, plus docs/ui/03-screen-types.md §3 (plan-card), docs/ui/14-glossary-and-copy.md §9, docs/ui/16-navigation.md §11, docs/rules/10-legal-and-safety.md §7, docs/level-files/05-the-plan.md ("The plan") and content/market_profiles.yaml.
Build exactly this scope.

Especially important:
- Nothing but the first trade and the risk note comes before lesson 1.
- The risk note is visible but unobtrusive; it must not cover the chart reveal.
- After the i18n switch, no UI string may be hard-coded any more (check script).

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** nothing, as a rule — Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each):
- A fresh install (Settings → Reset, or a private browser window): the first trade, the risk note, lesson 1 — nothing else.
- Lesson 1, finished: the reminder question comes now.
- The market profile "Germany": prices with € and a decimal comma, clock times in German time (lesson 1·10-1).
- A chart decision: the risk-note line after it is visible but unobtrusive.
- The plan card filled with nonsense: it is refused or queried; then the plan shared.
- Settings → Legal: an empty page with the risk note.

### `ICON` – the app's face

**Goal.** The app has its own icon, splash and three path logos instead of stand-ins. The name stays Nutrade (decision L). This is the part of the old `BRAND` stage that belongs to the app; the trademark and the web address are outside this plan.

**Scope**
1. **A few concepts** for the app icon and the splash, as SVG, in the look from `LOOK-BRIEF` (`docs/ui/15-theming-and-accessibility.md` §10). Optionally image concepts with the `brandkit` skill.
2. **A small logo for each path** (Scalping, Swing Trading, Day Trading) for the top bar (`docs/ui/11-top-bar.md` §7.2).
3. **After your choice:** the icon and splash in `app.json`, the web build's favicon, and the path logos in the top bar.

**You prepare.** Your choice from the concepts.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage ICON from docs/plan/08-phase-1-app-tabs-first-run-icon.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "ICON" section in docs/plan/08-phase-1-app-tabs-first-run-icon.md in full, plus docs/ui/11-top-bar.md §7.2 and docs/ui/15-theming-and-accessibility.md §10.
First show me the concepts as an artifact and wait for my choice; then build it in.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** your choice from the concepts (the session shows them first and waits). Claude checks the built-in icon, splash and logos itself and lists them under what was built.

**Where to look** (optional; the report links each):
- The favicon and splash in the web preview, in light and dark.
- The app icon in Expo Go's project list.
- The path logo in the top bar, in light and dark.
