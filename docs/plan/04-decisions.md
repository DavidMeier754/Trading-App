# Decisions

_Part of the [build plan](README.md) · §4–4.2_

## 4. Decisions

### 4.1 Made

| # | Decision | Where recorded |
|---|---|---|
| A | **The course ends with a person who can start, not just with a paper process.** From your goal "after the course only practical experience is missing": the course teaches all knowledge up to the first real trade (graduate profile, points 11–16). Still: no product names, no recommendation, no profit promises, the simulator comes first. | `docs/rules/01-what-we-build.md` §1.1 |
| B | **123 shorts, option (a):** we name the account and keep the content. Short selling needs a margin-enabled account; 1·12, 1·13 and 8·15 say so. | `docs/rules/04-numbers-and-realism.md` §3.6 |
| C | **Six trades per session, option (b): we say it plainly.** Several day trades per session need a margin account, and in the US the pattern-day-trader rule applies below $25,000 (`OFFER` checks the current state, the rule is being reformed). EU-DE has no PDT rule, but broker rules differ. Said in 6·9 and 8·15. | `docs/rules/04-numbers-and-realism.md` §3.6 |
| E | **All three paths in the finished app:** Scalping, Swing Trading and Day Trading (David). Swing is written first, then Day Trading (Phase 2). Every path gets the same reviews and its own arena content. | docs/rules/01-what-we-build.md §1, docs/course/ |
| H | **Motion: calm and high quality** (David). Slower than a typical game, smooth on cheap phones, and never in the way: feedback starts at once, and a tap finishes or skips any motion. How calm: Calm's pace, chosen in `LOOK-BRIEF`; the exact durations and curves come from `LOOK-SYSTEM`. | docs/ui/01-design-principles.md §1, docs/ui/06-reveal-and-hearts.md §5.1, docs/ui/15-theming-and-accessibility.md §10 |
| I | **Money: Nutrade Plus** (David), a subscription with unlimited hearts, no ads and the practice arena: hands-on charts beyond the paths (the concept is in `09-phase-1-app-arena-design-and-generator.md`). Free: every lesson of every path, the Practice tab, glossary, statistics, the Daily Chart and a taste of the arena, with ads between lessons and 5 hearts in tests. Guardrails: nothing is sold one at a time (no hearts, no streak freezes), no pay-to-pass, no fake urgency. | docs/rules/01-what-we-build.md §1, docs/ui/13-tiers-replays-and-plus.md §7.7, §7.8 |
| K | **Accounts in the finished app** (David): sign-in with Apple, Google or email, sync across devices, account deletion and data export inside the app. The app works before sign-in, and a purchase never needs an account. | docs/rules/01-what-we-build.md §1, `BACKEND` |
| L | **The name is Nutrade** (David, 2026-09-26): short, built from "trade", for new traders. The trademark and the web address are outside this plan (2026-10-05); `ICON` gives the app its face. | docs/rules/01-what-we-build.md §1, `ICON` |
| M | **Every launch language in the finished app** (David): built in English first, then translated by a checked AI pipeline (Phase 3); a native speakers' review is outside this plan (Y1). More languages, more markets. The language never decides the market (`MARKETS`). | docs/rules/01-what-we-build.md §1, docs/ui/14-glossary-and-copy.md §9 |
| W1 | ~~**Hearts only in checkpoints and final exams.** Lessons are for practicing: wrong answers come back in the mistakes round at the end (W25).~~ **Reversed by David, 2026-10-04:** "I want the hearts to go away even if it isn't a checkpoint level." Hearts are spent in every lesson and test; practice is free and gives one back. | docs/rules/, docs/ui/06-reveal-and-hearts.md §5.2 |
| W2 | **This order:** the app stable and good-looking before new content. ~~W2b~~. **Since 2026-10-05:** Scalping finished in every layer before Swing starts; **since 2026-10-06** one stage at a time, the app before the content in each phase (Y13); the arena engine is built in Phase 1, so each new path gets its arena content right after its chapters. | this plan |
| W3 | **The 50 % plan value, option (a):** Chapter 1 stays at 50. The scalping path revises the value to 95 in **2·1-4**, with the reason (the revision was meant for Chapter 3, but never existed in the content). | docs/rules/04-numbers-and-realism.md §3.6, docs/course/ |
| W4–W6 | **Layout and looks:** answers in the thumb zone. A minimum type size, scrolling if needed. At most 3 looks plus light/dark/system. **The look** (David, `LOOK-BRIEF`, 2026-09-29): Calm on today's designs Neo, Neo Mono and Classic Contrast, with Precise's number face, chart, trade log, count-up numbers and step count; today's path map with his changes; fewer words on every screen; sounds play on silent. | docs/ui/02-lesson-player-layout.md §2, docs/ui/10-path-map.md §7.1, docs/ui/11-top-bar.md §7.2, docs/ui/15-theming-and-accessibility.md §10 |
| W7 | **No leaderboard.** An opt-in friends league is outside this plan. | docs/ui/11-top-bar.md §7.2, docs/ui/16-navigation.md §11 |
| W8 | **"See the card again"** as an overlay in lessons. | docs/ui/02-lesson-player-layout.md §2 |
| W9 | ~~**A choosable daily goal** (1/2/3 lessons, default 2). The streak counts when your own goal is met.~~ **Replaced by David, 2026-10-04:** one lesson a day keeps the streak; no goal to choose. | docs/rules/, docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 |
| W10 | **Body text ≤ 150 characters** per screen. | docs/rules/05-tests-consistency-and-copy.md §3.9, docs/ui/14-glossary-and-copy.md §9 |
| W11 | **Replays earn ¼ XP**, "Skip ahead" earns no XP. | docs/ui/07-lesson-chapter-and-tier-complete.md §5.3 |
| W12–W14 | **Variance rule, sign rule, recap reference.** | docs/rules/07-variance-and-typed-numbers.md §3.11/§3.12, docs/level-files/ |
| W15 | **Match:** one wrong tap gives amber (counts as correct), two or more are wrong. | docs/ui/04-question-types.md §4.1 |
| W16–W18 | **US English.** The label "Takeaway" for closing screens. Skills cleaned up; `docs/` win over skills. | docs/rules/, docs/level-files/, CLAUDE.md |
| W19 | **Every UI string through i18n keys** (from `ONBOARDING`); every launch language in Phase 3 (decision M). | docs/rules/01-what-we-build.md §1, docs/ui/14-glossary-and-copy.md §9 |
| W20 | **The mascot stays dropped.** Not recommended; can be decided again at any time. | docs/rules/01-what-we-build.md §1 |
| W21–W25 | **Content and checks:** an explanation per wrong option. New validator rules (tells, formats). A visual quota. App checks in CLAUDE.md. The mistakes round. | docs/level-files/, docs/rules/, CLAUDE.md, docs/ui/05-chart-questions-and-mistakes-round.md §4.5 |
| **2026-10-05** | **David's picks for the finished app** (the artifacts "Nutrade App Vision" and "Nutrade Build Plan"): | |
| Y1 | **The plan ends at the finished app.** Trademark, legal texts, store accounts and listings, testers, betas, the release, the expert review, a native speakers' review and update channels are outside it, deleted rather than moved to a later list. In: accounts and sync, Nutrade Plus, ads, analytics, every language, the app icon. | `01-goal-and-guardrails.md` §0, this plan |
| Y2 | **No quotas.** As many lessons as the learner likes; practice and today's chart are optional; nothing says how much to do. | `01-goal-and-guardrails.md` §0 ("Fun"), `RULES`, docs/rules/03-content-rules.md |
| Y3 | **The streak grows only on a day a lesson on the path is finished,** practice levels included; opening the app, a skip, a practice round or today's chart never count. | `LOOP-DAILY`, docs/ui/11-top-bar.md §7.2 |
| Y4 | **What draws a learner back,** all six: fading skills, the chart calendar, gems for practice and today's chart, shining medals, the weekly challenge, a "today's chart is ready" reminder. Fading skills get a clearer design first (David's note). | `PRACTICE`, `ARENA-TAB`, `LOOP-DAILY`, docs/ui/12-practice-and-stats.md §7.3 |
| Y5 | **Tabs: Learn · Practice · Arena · You** (answers V). Your numbers open the You tab; `STATS` folds into `TABS`. | `TABS`, docs/ui/16-navigation.md §11.2 |
| Y6 | **The practice levels stay on the path, with a Skip,** drawn as a smaller node that looks different from a normal level (answers X). The path keeps today's design. | `PRACTICE`, docs/ui/10-path-map.md §7.1 |
| Y7 | **A "?" key on charts** labels everything taught on that chart, instead of tap-to-explain (P-05). | `LOOK-COMPONENTS`, docs/ui/08-quotes-and-charts.md |
| Y8 | **The Practice tab keeps Daily mix · Skills · Mistakes.** Hearts stay as decided on 2026-10-04. | `PRACTICE`, `LOOP-HEARTS` |
| Y9 | **The arena is its own tab, with one practice account per path.** Chapter 9 sits on the same map after Chapter 8; its card is tested in the arena. | `ARENA-TAB`, `SIM-ACCOUNT`, `OWN-STRATEGY` |
| Y10 | **The short first run:** the first trade, the risk note, lesson 1; reminders after the first lesson, the market when it matters. Settings keeps an empty Legal page. | `ONBOARDING`, docs/ui/16-navigation.md §11.1 |
| Y11 | **Gems buy streak freezes and looks** (map scenes, tier-card finishes); earned, never sold (answers U). | `LOOP-DAILY` |
| Y12 | **Two newcomer tests become optional** (`FUN-PASS`, `VARIANCE`); `UPDATES`' app parts move into `TECH`. | those stages |
| **2026-10-06** | **David's changes to the order:** | |
| Y13 | **One lane after the other.** In Phases 1 and 2 all app stages first, then all content stages; one session at a time, the chapter fixes one after the other too. Replaces the two lanes side by side of 2026-10-05. | `02-how-to-work.md` §1, `03-stages-at-a-glance.md` |
| Y14 | **Your turn.** After every block of stages a `YOUR-TURN` stage for David's own changes, the design or anything else; an extra one fits between any two stages, and one may be skipped. Wishes from other stages' tests wait under "Parked wishes". | `22-your-turn.md` |

### 4.2 Open – with the stage that waits for them

| # | Question | My recommendation | Latest before |
|---|---|---|---|
| R | Prices for Nutrade Plus: monthly, yearly, trial | `MONEY` proposes prices per region; you decide. | `MONEY` |
| S | Personalized ads? | **No:** no tracking prompt and a simpler consent. | `ADS` |
| T | The list of launch languages | `I18N-PIPELINE` proposes it (markets, effort, script); you decide. | `I18N-PIPELINE` |

Answered on 2026-10-05: U (Y11), V (Y5), X (Y6). Dropped with the parts of the plan they belonged to: N (who reviews), Q (the business's legal form).

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
