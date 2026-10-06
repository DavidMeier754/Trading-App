# Appendix F: Where each review item lands

_Part of the [build plan](README.md)_

### F. Where each review item lands

Ids from `docs/review-2026-09-25/`.

| Item | Stage |
|---|---|
| M1 plan overview | `STABLE-APP` ✅ |
| M2 depth-ladder | `STABLE-DATA` ✅ |
| M3 `levels` NaN | `STABLE-DATA` ✅ |
| M4 recap | `STABLE-APP` ✅ (renderer), `CONTENT-FIX` (`card:`) |
| M5 amber sentence | `STABLE-APP` ✅ |
| M6 screen-reader leak | `STABLE-APP` ✅ |
| M7 reveal | `STABLE-APP` ✅ |
| M8 risk note, legal, onboarding | `ONBOARDING` (the risk note, an empty Legal page); the legal texts are outside this plan |
| M9 outcome bias | `RULES`, `VARIANCE`, `CONTENT-FIX-1…8` |
| M10 signs | `RULES`, `CONTENT-FIX` |
| M11 hearts dead end | `LOOP-HEARTS`, `PRACTICE` |
| M12 PR #13 | `MERGE` ✅ |
| M13 wire in the content | `WIRE` ✅ |
| M14 CI | `CI` ✅, `WIRE` ✅, `STABLE-DATA` ✅ |
| M15 50 % vs. exercises | `RULES` (plan-aware cap), `CONTENT-FIX-2` |
| M16 decisions A–C | `DOCS` ✅, `OFFER` |
| M17 market profiles | `OFFER` |
| S1 visuals | `VISUALS`, `CONTENT-FIX` |
| S2–S5 type, small displays, thumb zone, pace | `LOOK-BRIEF` ✅, `LOOK-SYSTEM` ✅ |
| S6–S8 charts, buttons, match | `LOOK-COMPONENTS` |
| S9 HUD | `LOOK-SYSTEM` ✅ |
| S10 streak | `LOOP-DAILY` |
| S11 lesson complete | `LOOK-COMPONENTS`, `LOOP-HEARTS`, `VARIANCE` |
| S12–S13 quit dialog, tap targets | `LOOK-SYSTEM` ✅ |
| S14–S15 test summary, reviewing | `LOOP-HEARTS` |
| S16 glossary | `GLOSSARY` |
| S17–S18 light theme, color-blind palette | `LOOK-SYSTEM` ✅ |
| S19 practice tab | `PRACTICE` |
| S20 statistics | `TABS` (`STATS` folded in, 2026-10-05) |
| S21 badge | `LOOK-COMPONENTS` |
| S22 plan card | `ONBOARDING` |
| S23 error page | `STABLE-APP` ✅ |
| S24 visual details | `LOOK-COMPONENTS` |
| S25 market profile | `ONBOARDING`, `MARKETS` |
| S26–S27 end of content, path choice | `WIRE` ✅ |
| S28–S37 content | `RULES`, `CONTENT-FIX` |
| S38 content index | `WIRE` ✅, `TECH` (loading on demand) |
| S39 one source for the format | `STABLE-DATA` ✅, optionally `TECH` |
| S40–S41 tests, dev flag | `CI` ✅ |
| S42 backend | `BACKEND` |
| S43 store | outside this plan (2026-10-05) |
| S44 license | `CI` ✅ |
| S45 XP | `LOOP-HEARTS` |
| S46 web build | `LOOK-SYSTEM` ✅ |
| S47 analytics | `ANALYTICS` |
| S48–S52 docs, skills | `DOCS` ✅ (bench subtitle: `WIRE` ✅; `first_minutes`: `OFFER`) |
| S53 using GitHub | `CI` ✅ (PR template) |
| S54 phone tests | `CI` ✅ |
| K1 German | `ONBOARDING` (i18n keys), `I18N-PIPELINE` (German is the pilot) |
| K2–K3 mistakes round, "See the card again" | `LOOP-HEARTS` |
| K4 leaderboard | not in the app (W7) |
| K5 Trader Card | `TABS` (the tier card as an image) |
| K6 achievements | `FUN-PASS` |
| K7 simulator | `SIM-ACCOUNT` |
| K8 "Report a problem" | `ANALYTICS` |
| K9 AI explainer | outside this plan |
| K10 weekly review, widget | `LOOP-DAILY` (the weekly challenge); a widget is outside this plan |
| K11 font size, tablet | `LOOK-SYSTEM` ✅, `A11Y-PERF`; tablet layouts are outside this plan |
| K12 match | `LOOP-HEARTS` |
| K13 mascot | not done (W20) |
| K14 technical upkeep | `TECH` |
| W1–W25 | see §4.1; the implementation is listed with each stage |

Stages marked ✅ are done (`docs/plan/05-done-so-far.md`). Stages that left the plan on 2026-10-05 (`BRAND`, `LEGAL-*`, `STORE-*`, `BETA-*`, `RELEASE`, `EXPERT`, `LANG-REVIEW`, `UPDATES`) no longer appear here; `STATS` is part of `TABS`.
