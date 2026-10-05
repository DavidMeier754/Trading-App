# All stages at a glance

_Part of the [build plan](README.md) · §2–3_

## 2. All stages at a glance

Column "Test" = your time for the acceptance test. Session counts are estimates; each session is one Claude Code session with its own PR.

| Phase | Stage | What | Model · effort | Sessions | Test |
|---|---|---|---|---|---|
| A Foundation | `MERGE` ✅ | PR #13 (the app) merged into `main` | – | – | – |
| | `DOCS` ✅ | This plan, the review report, all docs brought onto the decisions | – | – | Read |
| | `CI` ✅ | Automatic checks, lint, unit tests, testing tools only in test builds, preview link per PR | Opus 5.5 · high | 1 | 15 min |
| | `WIRE` ✅ | Content index instead of hand-written imports, all written chapters playable, render test of every screen | Opus 5.5 · high | 1 | 20 min |
| B Stable | `STABLE-APP` ✅ | Plan overview, recap, reveal (decision vs. outcome), screen-reader leak, error page | Opus 5.5 · high | 1 | 20 min |
| | `STABLE-DATA` ✅ | Depth ladder, price lines, validator and test bench following the schema; the render test becomes mandatory | Opus 5.5 · high | 1 | 15 min |
| C Look & feel | `LOOK-BRIEF` ✅ | Your critique + three design directions as clickable prototypes, with calm, high-quality motion | Fable 5.1 · high (else Opus 5.5 · xhigh) | 1–2 | 30 min + choice |
| | `LOOK-SYSTEM` | The chosen mix as a system: colors, type, light/dark, the 3 looks, thumb zone, minimum type size, motion, sounds, tap targets, fewer words, the path map and the top bar | Opus 5.5 · high, plan mode | 1–2 | 30 min |
| | `DESIGN-REVIEW` | 50 design ideas for David's verdict; the approved ones built (chart reveal, map, hearts, mistakes round, skills, Practice, Account, rewards, first trade); every doc and this plan brought up to date; `docs/content-todo/` | Opus 5.5 · high | 1 (+ fixes) | 45 min |
| | `LOOK-COMPONENTS` | Charts (candles that form, the trade log), lesson-complete screen, icons, visuals — what `DESIGN-REVIEW` left | Opus 5.5 · high | 1–2 | 30 min |
| | `VISUALS` | New teaching graphics: candle anatomy, trade plan | Opus 5.5 · high | 1 | 15 min |
| D Learning loop | `LOOP-HEARTS` | Review cards, test summary, out of hearts, XP rules, the level card — hearts in tests only and the mistakes round came in `DESIGN-REVIEW` | Opus 5.5 · high, plan mode | 1 | 30 min |
| | `LOOP-DAILY` | ~~Choosable daily goal,~~ streak with states and full-screen moments, freeze, weekly challenge, reminders, gems | Opus 5.5 · high | 1–2 | 20 min + 3 days |
| | `ONBOARDING` | First run, risk note, legal scaffold, market profile + number format, plan card, i18n keys | Opus 5.5 · high | 1–2 | 20 min |
| | `PRACTICE` | Practice tab, the rest: drill packs, weak concepts by term, the links into it, "+1 day" tests — the tab with Daily mix, Skills and Mistakes came in `DESIGN-REVIEW` | Opus 5.5 · xhigh, plan mode | 1–2 | 30 min + 1 week |
| | `GLOSSARY` | Proofread the words' lines and add aliases, the list with search — the definitions, the marker and the sheet came in `DESIGN-REVIEW` | Opus 5.5 · high | 1–2 | 15 min |
| | `STATS` | Accuracy per topic, sharing — the Account page with the tier card, medals, all stats and the variance view came in `DESIGN-REVIEW` | Opus 5.5 · high | 1 | 15 min |
| | `TABS` | The tab set David chooses from the concept (Analytics instead of Leaderboard; Arena) | Opus 5.5 · high | 1 | 15 min |
| | `FUN-PASS` | Fun audit with a newcomer test, then polish; the first bonus side lessons (the map draws them since `DESIGN-REVIEW`) | Fable 5.1 · high (else Opus 5.5 · xhigh) | 1–2 | 45 min |
| E Scalping content | `CONTENT-DESIGN` | The test bench learns the new content fields (`docs/content-todo/04-still-to-write-and-done-log.md` 4.9) | Opus 5.5 · high | 1 | 10 min |
| | `CONTENT-REVIEW` ✅ | The beginner's read of every chapter: 88 changes approved (`docs/content-todo/05-content-review.md`); the cross-chapter fixes (spread sweep, terms taught where first used, two chart labels); the word rules; Chapter 9's outline | Opus 5.5 · high | 1 | 30 min |
| | `RULES` | Your content critique (most of it collected in `CONTENT-REVIEW`), new validator rules, a worklist per chapter | Opus 5.5 · high | 1–2 | 30 min critique + 10 min |
| | `VARIANCE` | Lesson 1·2-4 without a simulator and without odds, the decision-vs-outcome summary, the first losers in Chapter 1 | Opus 5.5 · xhigh | 1–2 | 30 min + newcomer test |
| | `OFFER` | Chapter 8 Level 15 (account types, margin, PDT, settlement, tax note) + renumbering + market profiles | Opus 5.5 · xhigh | 1–2 | 20 min |
| | `CONTENT-FIX-1` … `-8` | All content corrections, one chapter per stage, now with the content review's items; may run in parallel since `CONTENT-REVIEW` | Opus 5.5 · high | 8–12 | 20 min each |
| | `OWN-STRATEGY-OUTLINE` | Chapter 9 "Your Own Strategy" (shared by every path): the level plan for your OK | Opus 5.5 · xhigh, plan mode | 1 | 20 min |
| | `OWN-STRATEGY` | Chapter 9, written and playable after any path's Final Exam | Opus 5.5 · xhigh | 1–2 | 30 min |
| | `KNOWLEDGE` | Knowledge audit against the graduate profile (review B) | Fable 5.1 · max (else Opus 5.5 · max) | 1 | decide findings |
| | `KNOWLEDGE-FIX` | Add the missing knowledge | Opus 5.5 · high | 1–3 | 20 min |
| | `REVIEW-A` | Didactic review of the whole path, then corrections | Fable 5.1 · high (else Opus 5.5 · max) | 1 + 1–3 | decide findings |
| | `EXPERT` | Expert review by an experienced trader (a human) | – | – | organize |
| F Beta 1 | `BRAND` | "Nutrade": trademark check and filing, web address, logo, icon draft, store title, tone of voice | Opus 5.5 · xhigh | 1 | 20 min + choice |
| | `LEGAL-DRAFT` | Drafts in English and German: the business's imprint, privacy policy, terms of use, disclaimer + a web page | Opus 5.5 · high | 1 | read + details |
| | `STORE-SETUP` | Developer accounts in the business's name, EAS builds, TestFlight, Play internal testing | Sonnet 5 · high | 1 | 30 min setup |
| | `ANALYTICS` | Crash reports, data-minimal learning analytics (opt-in), "Report a problem" | Opus 5.5 · high | 1 | 10 min |
| | `BETA-1` | Your testers, 2–4 weeks, weekly evaluation and fixes | Opus 5.5 · high per round | 2–4 | look after testers |
| G Practice arena | `ARENA-DESIGN` | How the arena, the Daily Chart and Nutrade Plus work: docs and clickable screens | Fable 5.1 · high (else Opus 5.5 · xhigh), plan mode | 1 | 30 min + choice |
| | `REPLAY-PILOT` | One replay by hand + validator rules | Opus 5.5 · high | 1 | 10 min |
| | `CHART-GEN` | The chart generator: sessions and setups from seeds, checked by code | Opus 5.5 · xhigh, plan mode | 2–3 | 20 min |
| | `ARENA-TAB` | The arena tab and the Daily Chart; generated charts for the bonus side lessons | Opus 5.5 · high | 1–2 | 20 min + 1 week |
| | `SIM-ACCOUNT` | The practice account: orders, costs, journal, statistics, daily limit | Opus 5.5 · high, plan mode | 2 | 30 min |
| | `DRILLS` | The packs `selection` and `risk-calls`, plus generated setup drills | Opus 5.5 · high | 1–2 | 15 min |
| | `REPLAY-BANK` | 22 replays for scalping, from generator candidates, annotated by hand | Opus 5.5 · high | ~4 | 10 min each |
| H Swing + Day | `SWING-2` … `SWING-8` | Swing Chapters 2–8 | Opus 5.5 · high | 7–14 | 20 min each |
| | `SWING-REVIEW` | Reviews A + B for swing, then corrections | Fable 5.1 · high/max | 2–4 | decide findings |
| | `DAY-2` … `DAY-8` | Day Trading Chapters 2–8 | Opus 5.5 · high | 7–14 | 20 min each |
| | `DAY-REVIEW` | Reviews A + B for Day Trading, then corrections | Fable 5.1 · high/max | 2–4 | decide findings |
| | `ARENA-PATHS` | Arena content for swing and Day Trading: templates, drills, replays | Opus 5.5 · high | 4–6 | 20 min per path |
| I Platform | `BACKEND` | Accounts and sync: Apple, Google, email; deletion and export (decision K) | Opus 5.5 · xhigh, plan mode | 2–3 | 30 min |
| | `MONEY` | Nutrade Plus: subscription, paywall, unlimited hearts, arena access (decision I) | Opus 5.5 · high, plan mode | 1–2 | 20 min |
| | `ADS` | Ads in the free tier: placement, consent, blocked categories | Opus 5.5 · high | 1 | 20 min |
| | `UPDATES` | Content without store updates, progress migration, lazy loading | Opus 5.5 · high | 1 | 15 min |
| | `TECH` | Clean-up backed by measurements: bundle, start time, Chart.tsx | Opus 5.5 · high | 1–2 | 10 min |
| J Languages | `I18N-PIPELINE` | Language switch, locale formats, the translation pipeline and its checks; the German pilot | Opus 5.5 · xhigh, plan mode | 2 | 45 min |
| | `MARKETS` | Market profiles for the launch markets | Opus 5.5 · high | 1 | 15 min |
| | `TRANSLATE-1` … `-n` | The launch languages, one batch per stage | Opus 5.5 · high | 3–8 | 15 min per batch |
| | `RTL` | Right-to-left layout, if Arabic or Hebrew are on the list | Opus 5.5 · high | 1 | 15 min |
| | `LANG-REVIEW` | Native speakers check the key texts; the findings flow back | Opus 5.5 · high | 1–2 | organize |
| K Release | `A11Y-PERF` | Accessibility and speed on real devices | Opus 5.5 · high | 1 | 30 min |
| | `LEGAL-FINAL` | Review by a lawyer, final texts | – (a human) | – | organize |
| | `STORE-LISTING` | Screenshots and texts in every launch language, privacy details, age rating | Sonnet 5 · high | 1–2 | 30 min |
| | `BETA-2` | The release candidate with everything in; Google's closed test where required | Opus 5.5 · high per round | 1–3 | 2–4 weeks |
| | `RELEASE` | Submission, review, launch, watching the first week | Opus 5.5 · high | 1–2 | launch |
| L After | `FRIENDS`, `AI-EXPLAINER`, … | See Phase L | – | – | – |

**Milestones**
- After Phase E: a complete, honest scalping course.
- After `BETA-1`: real feedback from strangers.
- After Phase G: the arena works, for scalping.
- After Phase H: all three paths, each with its arena content.
- After Phase J: every launch language.
- After `RELEASE`: v1.0 in the stores.

Roughly 90–150 sessions in total. Most of them are content: the scalping pass (Phase E), the two new paths (Phase H) and the translations (Phase J).

---

## 3. Where things stand today (2026-09-25, measured)

| | |
|---|---|
| Content | Chapter 1 (48 lessons, including the path choice) + Scalping Chapters 2–8 (340) = **388 lessons, 5,109 screens**. Day Trading and Swing: outlined only (`docs/course/`). |
| Gaps in the content | Chapter 8 Level 15 is missing (4 lessons, stage `OFFER`). Lesson 1·2-4 (variance) is newly planned (stage `VARIANCE`). |
| App | On `main` since PR #13 was merged (2026-09-25). Plays every written lesson since stage `WIRE` (388 lessons, 5,109 screens); the render test finds 40 known crashes, fixed in `STABLE-DATA`. |
| Render test of all 5,109 screens | **40 crashes** (all `depth-ladder`, in 38 lessons, three of them final exams) and **15 screens with a missing price line** (`NaN`). Both are fixed in `STABLE-DATA`. |
| Tools | Validator: 0 errors, 3 warnings. Self-test 110/110. Sizing: 0 of 572 positions over the cap. |
| Missing entirely | CI, app tests, onboarding, risk note, legal texts, glossary, practice tab, statistics, backend, store setup, branding |
| Review | `docs/review-2026-09-25/`: 17 must-fix, 54 should-fix, 14 could-do items, 25 doc items (W). Appendix F assigns every item to a stage. |
| Decisions | A–C, E, H, I, K, L, M, O and P are made; N and Q–T are open (§4). |
| **Update 2026-10-03** | `LOOK-SYSTEM` is built (PRs #20 and #21 open, waiting for `EXPO_TOKEN` for item 9). `DESIGN-REVIEW` built David's approved designs on top of it (PR stacked on #21). Content unchanged since 2026-09-25: still 388 lessons, 0 validator errors. Open decisions: N, Q–V and X (§4.2). |
| **Update 2026-10-05** | `CONTENT-REVIEW`: every lesson read as a beginner would; David approved all 88 changes (`docs/content-todo/05-content-review.md`). The cross-chapter ones are done (245 texts say "spread" instead of "gap"; Print, Fill, Gap and Setup taught in Chapter 1, Leg in Chapter 2, Grade-A trade in 6·15-1; the 7·3-2 labels). The rest is each `CONTENT-FIX-N`'s, and the passes may now run in parallel. New: Chapter 9 "Your Own Strategy" (`OWN-STRATEGY-OUTLINE`, `OWN-STRATEGY`), tap to explain (`LOOK-COMPONENTS`), test my card (`SIM-ACCOUNT`), the four sums (`FUN-PASS`). |
