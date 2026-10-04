# Decisions

_Part of the [build plan](README.md) · §4–4.2_

## 4. Decisions

### 4.1 Made

| # | Decision | Where recorded |
|---|---|---|
| A | **The course ends with a person who can start, not just with a paper process.** From your goal "after the course only practical experience is missing": the course teaches all knowledge up to the first real trade (graduate profile, points 11–16). Still: no product names, no recommendation, no profit promises, the simulator comes first. | `docs/rules/01-what-we-build.md` §1.1 |
| B | **123 shorts, option (a):** we name the account and keep the content. Short selling needs a margin-enabled account; 1·12, 1·13 and 8·15 say so. | `docs/rules/04-numbers-and-realism.md` §3.6 |
| C | **Six trades per session, option (b): we say it plainly.** Several day trades per session need a margin account, and in the US the pattern-day-trader rule applies below $25,000 (check before release, the rule is being reformed). EU-DE has no PDT rule, but broker rules differ. Said in 6·9 and 8·15. | `docs/rules/04-numbers-and-realism.md` §3.6 |
| E | **All three paths in v1.0:** Scalping, Swing Trading and Day Trading (David). Swing is written first, then Day Trading (Phase H). Every path gets the same reviews and its own arena content. | docs/rules/01-what-we-build.md §1, docs/course/ |
| H | **Motion: calm and high quality** (David). Slower than a typical game, smooth on cheap phones, and never in the way: feedback starts at once, and a tap finishes or skips any motion. How calm: Calm's pace, chosen in `LOOK-BRIEF`; the exact durations and curves come from `LOOK-SYSTEM`. | docs/ui/01-design-principles.md §1, docs/ui/06-reveal-and-hearts.md §5.1, docs/ui/15-theming-and-accessibility.md §10 |
| I | **Money: Nutrade Plus** (David), a subscription with unlimited hearts, no ads and the practice arena: hands-on charts beyond the paths (the concept is in Phase G). Free: every lesson of every path, the Practice tab, glossary, statistics, the Daily Chart and a taste of the arena, with ads between lessons and 5 hearts in tests. Guardrails: nothing is sold one at a time (no hearts, no streak freezes), no pay-to-pass, no fake urgency. | docs/rules/01-what-we-build.md §1, docs/ui/13-tiers-replays-and-plus.md §7.7, §7.8 |
| K | **Accounts in v1.0** (David): sign-in with Apple, Google or email, sync across devices, account deletion and data export inside the app. The app works before sign-in, and a purchase never needs an account. | docs/rules/01-what-we-build.md §1, `BACKEND` |
| L | **The name is Nutrade** (David, 2026-09-26): short, built from "trade", for new traders. Tradle was dropped: it is a registered EU trademark for apps and education (classes 9, 41, 42), and its US filing covers trading education. Checked for Nutrade on 2026-09-26: no app in the App Store or Google Play, and no live trademark for apps, education, finance or software (classes 9, 36, 41, 42) in the EU, Germany, the UK, the US or the international register. The name is in use elsewhere, though: a German maker of vitamin gummies holds NUTRADE for supplements and business services (classes 5 and 35; Germany, UK, international) and uses nutrade.de, and Syngenta holds NUTRADE in Mexico (including class 42). nutrade.com is parked with a domain seller, nutrade.app was registered in May 2026; nutradeapp.com, nutradeapp.app and nutradeapp.de were free. `BRAND` confirms this with the lawyer, files the mark and settles the web address. | docs/rules/01-what-we-build.md §1, `BRAND` |
| M | **Every launch language in v1.0** (David): built in English first, then translated before the release by a checked AI pipeline, with the key texts read by native speakers (Phase J). More languages, more markets. The language never decides the market (`MARKETS`). | docs/rules/01-what-we-build.md §1, docs/ui/14-glossary-and-copy.md §9 |
| O | **You find the testers** (David): at least 12 if your Google account is a personal one (Google's closed test), at least 3 without trading knowledge, and for `BETA-2` native speakers of the launch languages. | `BETA-1`, `BETA-2` |
| P | **The provider is a business registered in Germany** (David), before publishing. Recommended: register it **before `STORE-SETUP`**, so the developer accounts are opened once, in the business's name. The legal form (decision Q) decides how you enroll: a sole proprietorship enrolls with Apple as an individual and sells under your own name; a legal entity (e.g. UG or GmbH) enrolls as an organization and needs a D-U-N-S number (free, can take up to 30 days). A Google organization account needs one too, and is exempt from Google's 12-tester rule. | `LEGAL-DRAFT`, `STORE-SETUP` |
| W1 | ~~**Hearts only in checkpoints and final exams.** Lessons are for practicing: wrong answers come back in the mistakes round at the end (W25).~~ **Reversed by David, 2026-10-04:** "I want the hearts to go away even if it isn't a checkpoint level." Hearts are spent in every lesson and test; practice is free and gives one back. | docs/rules/, docs/ui/06-reveal-and-hearts.md §5.2 |
| W2 | **This order:** the app stable and good-looking before new content. W2b (Swing before replays and drills) no longer sets a priority: since decisions E and I, Swing, Day Trading and the arena all ship in v1.0. The arena engine comes first (Phase G), so each new path gets its arena content right after its chapters. | this plan |
| W3 | **The 50 % plan value, option (a):** Chapter 1 stays at 50. The scalping path revises the value to 95 in **2·1-4**, with the reason (the revision was meant for Chapter 3, but never existed in the content). | docs/rules/04-numbers-and-realism.md §3.6, docs/course/ |
| W4–W6 | **Layout and looks:** answers in the thumb zone. A minimum type size, scrolling if needed. At most 3 looks plus light/dark/system. **The look** (David, `LOOK-BRIEF`, 2026-09-29): Calm on today's designs Neo, Neo Mono and Classic Contrast, with Precise's number face, chart, trade log, count-up numbers and step count; today's path map with his changes; fewer words on every screen; sounds play on silent. | docs/ui/02-lesson-player-layout.md §2, docs/ui/10-path-map.md §7.1, docs/ui/11-top-bar.md §7.2, docs/ui/15-theming-and-accessibility.md §10 |
| W7 | **No leaderboard in v1.0.** Later at most an opt-in friends league. | docs/ui/11-top-bar.md §7.2, docs/ui/16-navigation.md §11 |
| W8 | **"See the card again"** as an overlay in lessons. | docs/ui/02-lesson-player-layout.md §2 |
| W9 | ~~**A choosable daily goal** (1/2/3 lessons, default 2). The streak counts when your own goal is met.~~ **Replaced by David, 2026-10-04:** one lesson a day keeps the streak; no goal to choose. | docs/rules/, docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 |
| W10 | **Body text ≤ 150 characters** per screen. | docs/rules/05-tests-consistency-and-copy.md §3.9, docs/ui/14-glossary-and-copy.md §9 |
| W11 | **Replays earn ¼ XP**, "Skip ahead" earns no XP. | docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 |
| W12–W14 | **Variance rule, sign rule, recap reference.** | docs/rules/07-variance-and-typed-numbers.md §3.11/§3.12, docs/level-files/ |
| W15 | **Match:** one wrong tap gives amber (counts as correct), two or more are wrong. | docs/ui/04-question-types.md §4.1 |
| W16–W18 | **US English.** The label "Takeaway" for closing screens. Skills cleaned up; `docs/` win over skills. | docs/rules/, docs/level-files/, CLAUDE.md |
| W19 | **Every UI string through i18n keys** (from `ONBOARDING`); every launch language before the release (decision M, Phase J). | docs/rules/01-what-we-build.md §1, docs/ui/14-glossary-and-copy.md §9 |
| W20 | **The mascot stays dropped.** Not recommended; can be decided again at any time. | docs/rules/01-what-we-build.md §1 |
| W21–W25 | **Content and checks:** an explanation per wrong option. New validator rules (tells, formats). A visual quota. App checks in CLAUDE.md. The mistakes round. | docs/level-files/, docs/rules/, CLAUDE.md, docs/ui/05-chart-questions-and-mistakes-round.md §4.5 |

### 4.2 Open – with the stage that waits for them

| # | Question | My recommendation | Latest before |
|---|---|---|---|
| N | Who does the expert review and the legal review? | Still open, as you said. Affordable ways to find and pay both are in `EXPERT` and `LEGAL-FINAL`. | `EXPERT`, `LEGAL-FINAL` |
| Q | The business's legal form (sole proprietorship, UG, GmbH) and taxes | A question for a tax advisor, not for Claude. It decides how you enroll with Apple and Google (decision P). | `STORE-SETUP` |
| R | Prices for Nutrade Plus: monthly, yearly, trial | `MONEY` proposes prices per region; you decide. | `MONEY` |
| S | Personalized ads? | **No** in v1.0: no tracking prompt at first launch and a simpler consent. Look again with real numbers. | `ADS` |
| T | The list of launch languages | `I18N-PIPELINE` proposes it (store markets, effort, script); you decide. | `I18N-PIPELINE` |
| U | What gems buy (your new currency from `LOOK-BRIEF`) | Earned only, never sold (decision I). They buy streak freezes and cosmetic extras, e.g. scenes beside the path; never hearts or a pass in a test, because tests count (W1). `LOOP-DAILY` proposes the list and the prices in gems; you decide. | `LOOP-DAILY` |
| V | The tab set (your notes on design ideas 31 and 38): Analytics instead of the Leaderboard placeholder, and where Arena goes | The artifact ["Nutrade tabs concept"](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD) lays out the options with screenshots and mockups, and gives the line to paste into the `TABS` prompt. Recommended there: Learn, Practice, Analytics, Account now, and Arena as a fifth tab once the arena exists. You choose; `TABS` builds it. | `TABS` |
| X | Mistakes reviews: your note "a previous mistakes level 2 or 3 times per level". Read as **per chapter**, built as **optional side stops before each Checkpoint and the Final Exam**. Should they instead be required levels on the path, or more frequent? | Keep them optional side stops: ~~mistakes cost nothing in this app (W1)~~ a mistake already costs a heart since 2026-10-04, and a required review would make it cost a level as well. If they get skipped too often, the beta will show it. | `LOOP-HEARTS` |

---

## How each stage is described

- **Goal:** what is different afterwards.
- **Scope:** what gets built, with review numbers (`M…`, `S…`, `K…`, `W…` from `docs/review-2026-09-25/`).
- **Not in this stage:** where needed.
- **You prepare:** if something is needed from you.
- **Model · effort · sessions.**
- **Prompt:** ready to copy.
- **Claude checks automatically.**
- **You test:** your checklist. Claude puts the exact links in the report.
- **Done when.**

Every prompt follows the same frame (Appendix E.0). That keeps them short: the details live in this file, and Claude reads them.
