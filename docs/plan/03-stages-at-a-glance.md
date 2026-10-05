# All stages at a glance

_Part of the [build plan](README.md) · §2–3_

## 2. All stages at a glance

The plan as David approved it on 2026-10-05: three phases, and in Phases 1 and 2 two lanes that run at the same time (`02-how-to-work.md` §1, "Two lanes"). Within a lane, the stages run top to bottom; **the next stage of a lane is its first one without ✅**. A "⇄" row is where a lane waits for the other.

Column "Test" = your time for the acceptance test. Session counts are estimates; each session is one Claude Code session with its own PR. The finished stages are in `05-done-so-far.md`.

### Phase 1 – Scalping, finished

**App lane**

| Stage | What | Model · effort | Sessions | Test | File |
|---|---|---|---|---|---|
| `LOOK-COMPONENTS` | Charts and the reveal: round prices, "Next 5 candles", candles that form, the trade log, the "?" key, an icon for every level | Opus 5.5 · high | 1–2 | 30 min | `06` |
| `VISUALS` | Candle anatomy and the trade plan as components | Opus 5.5 · high | 1 | 15 min | `06` |
| ⇄ | The content lane's chapter fixes start once `VISUALS` is merged. | | | | |
| `LOOP-HEARTS` | Review cards, the test summary, out of hearts, XP rules, the one switch for Plus | Opus 5.5 · high, plan mode | 1 | 30 min | `07` |
| `LOOP-DAILY` | The streak rule, streak freezes, the weekly challenge, reminders, gems and what they buy | Opus 5.5 · high | 1–2 | 20 min + 3 days | `07` |
| `PRACTICE` | Practice levels with a Skip, fading skills, shining medals, the selection explained | Opus 5.5 · xhigh, plan mode | 2 | 30 min + 1 week | `07` |
| `GLOSSARY` | The words' lines proofread, the list with search in You | Opus 5.5 · high | 1–2 | 15 min | `08` |
| `TABS` | Learn · Practice · Arena · You, with your numbers on You (`STATS` folded in) | Opus 5.5 · high | 1 | 15 min | `08` |
| `ONBOARDING` | The short first run, the risk note, the plan card, an empty Legal page, every text through keys | Opus 5.5 · high | 1–2 | 20 min | `08` |
| `ICON` | The app icon, the splash and the three path logos | Opus 5.5 · xhigh | 1 | 15 min + choice | `08` |
| `ARENA-DESIGN` | The arena, today's chart, the chart calendar and the paywall: docs and clickable screens | Fable 5.1 · high (else Opus 5.5 · xhigh), plan mode | 1 | 30 min + choice | `09` |
| `REPLAY-PILOT` | One replay by hand + validator rules | Opus 5.5 · high | 1 | 10 min | `09` |
| `CHART-GEN` | The chart generator: sessions and setups from seeds, checked by code | Opus 5.5 · xhigh, plan mode | 2–3 | 20 min | `09` |
| ⇄ | `REPLAY-BANK` and Chapter 9 in the content lane wait for `CHART-GEN`. | | | | |
| `ARENA-TAB` | The arena tab, today's chart, the chart calendar, bonus side stops from the generator | Opus 5.5 · high | 1–2 | 20 min + 1 week | `10` |
| `SIM-ACCOUNT` | The practice account, and Test my card | Opus 5.5 · high, plan mode | 2 | 30 min | `10` |
| `DRILLS` | The packs `selection` and `risk-calls`, and generated setup drills | Opus 5.5 · high | 1–2 | 15 min | `10` |
| `FUN-PASS` | Claude's fun audit, then polish; bonus side lessons; "The four sums"; a newcomer test if you have someone | Fable 5.1 · high (else Opus 5.5 · xhigh) | 1–2 | 45 min | `10` |

**Content lane**

| Stage | What | Model · effort | Sessions | Test | File |
|---|---|---|---|---|---|
| `RULES` | New validator rules (no quotas among them), a worklist per chapter, a chapter as readable text | Opus 5.5 · high | 1–2 | 10 min | `11` |
| `CONTENT-DESIGN` | The test bench learns the new content fields | Opus 5.5 · high | 1 | 10 min | `11` |
| `CONTENT-FIX-2` … `-7` | Chapters 2–7, at the same time, each with its part of the content review (Chapter 7 gets Setup I) | Opus 5.5 · high | 1–2 each | 20 min each | `12` |
| `VARIANCE` | Lesson 1·2-4 without a simulator and without odds, the first losers in Chapter 1 | Opus 5.5 · xhigh | 1–2 | 30 min | `11` |
| `OFFER` | Chapter 8 Level 15 (account types, margin, PDT, settlement, a tax note) + market profiles | Opus 5.5 · xhigh | 1–2 | 20 min | `11` |
| `CONTENT-FIX-1` · `-8` | Chapters 1 and 8, after `VARIANCE` and `OFFER` | Opus 5.5 · high | 1–2 each | 20 min each | `12` |
| `KNOWLEDGE` | The knowledge audit against the graduate profile | Fable 5.1 · max (else Opus 5.5 · max) | 1 | decide findings | `13` |
| `KNOWLEDGE-FIX` | The missing knowledge added | Opus 5.5 · high | 1–3 | 20 min | `13` |
| `REVIEW-A` | Claude's teaching review of the whole path, then corrections | Fable 5.1 · high (else Opus 5.5 · max) | 1 + 1–3 | decide findings | `13` |
| `REPLAY-BANK` | The Scalping replays, from generator candidates, annotated by hand | Opus 5.5 · high | ~4 | 10 min each | `13` |
| `OWN-STRATEGY-OUTLINE` | Chapter 9's level plan for your OK | Opus 5.5 · xhigh, plan mode | 1 | 20 min | `13` |
| `OWN-STRATEGY` | Chapter 9 written, on the map after Chapter 8 | Opus 5.5 · xhigh | 1–2 | 30 min | `13` |

**Milestone – Scalping is finished:** both lanes done. Only now does Swing start.

### Phase 2 – Swing, Day and the platform

**Content lane**

| Stage | What | Model · effort | Sessions | Test | File |
|---|---|---|---|---|---|
| `SWING-2` … `SWING-8` | Swing Chapters 2–8 | Opus 5.5 · high | 7–14 | 20 min each | `14` |
| `SWING-REVIEW` | Both reviews for Swing, then corrections; Chapter 9 read against Swing's Chapter 8 | Fable 5.1 · high/max | 2–4 | decide findings | `14` |
| `ARENA-PATHS` · Swing | Swing's arena: templates, drills, replays, today's chart | Opus 5.5 · high | 2–3 | 20 min | `14` |
| `DAY-2` … `DAY-8` | Day Trading Chapters 2–8 | Opus 5.5 · high | 7–14 | 20 min each | `14` |
| `DAY-REVIEW` | Both reviews for Day Trading, then corrections | Fable 5.1 · high/max | 2–4 | decide findings | `14` |
| `ARENA-PATHS` · Day | Day Trading's arena | Opus 5.5 · high | 2–3 | 20 min | `14` |

**App lane** (built and tested with test keys; going live needs the store accounts, outside this plan)

| Stage | What | Model · effort | Sessions | Test | File |
|---|---|---|---|---|---|
| `BACKEND` | Accounts and sync: Google, email, Apple behind a switch; deletion and export inside the app | Opus 5.5 · xhigh, plan mode | 2–3 | 30 min | `15` |
| `MONEY` | Nutrade Plus: unlimited hearts, no ads, the full arena; the paywall | Opus 5.5 · high, plan mode | 1–2 | 20 min | `15` |
| `ADS` | Ads in the free app: placement, consent, blocked categories | Opus 5.5 · high | 1 | 20 min | `15` |
| `ANALYTICS` | Crash reports and learning analytics, with consent; "Report a problem" | Opus 5.5 · high | 1 | 10 min | `16` |
| `TECH` | Measured clean-up; loading on demand and the progress migration (from the old `UPDATES`) | Opus 5.5 · high | 1–2 | 10 min | `16` |
| `I18N-PIPELINE` | Language switch, locale formats, the translation pipeline; the German pilot | Opus 5.5 · xhigh, plan mode | 2 | 45 min | `16` |

### Phase 3 – Every language, then the last check

Starts when the English course is final (after `DAY-REVIEW`).

| Stage | What | Model · effort | Sessions | Test | File |
|---|---|---|---|---|---|
| `MARKETS` | Market profiles for the launch markets | Opus 5.5 · high | 1 | 15 min | `17` |
| `TRANSLATE-1` … `-n` | The launch languages, one batch per stage | Opus 5.5 · high | 3–8 | 15 min per batch | `17` |
| `RTL` | Right-to-left layout, if Arabic or Hebrew are on the list | Opus 5.5 · high | 1 | 15 min | `17` |
| `A11Y-PERF` | Accessibility and speed on real devices, in every language | Opus 5.5 · high | 1 | 30 min | `17` |

**The finished app:** every point of `01-goal-and-guardrails.md` §0 "The finished app" holds.

**Outside this plan** (David, 2026-10-05): the trademark and web address, legal texts and the lawyer, store accounts and listings, testers and betas, the release, the expert review, a native speakers' review, update channels, and the after-release ideas. They were deleted from the plan, not moved to a later list.

---

## 3. Where things stand today (2026-10-05)

| | |
|---|---|
| Content | Chapter 1 (48 lessons, including the path choice) + Scalping Chapters 2–8 (340) = **388 lessons**. The content review's cross-chapter fixes are in (`CONTENT-REVIEW`, PR #24); every other approved item waits in `docs/content-todo/05-content-review.md` for its `CONTENT-FIX`. Swing and Day Trading: outlined only (`docs/course/`). Chapter 9: outlined (`docs/course/08-chapter-9-your-own-strategy.md`). |
| Gaps in the content | Chapter 8 Level 15 (`OFFER`), lesson 1·2-4 (`VARIANCE`), Chapter 7's Setup I (`CONTENT-FIX-7`), Chapter 9 (`OWN-STRATEGY`). |
| App | Plays every written lesson; the render test opens every screen with 0 crashes. The look, the map, the reveal, hearts, the mistakes round, the Practice tab, Account and the first trade are built (`DESIGN-REVIEW`). The Expo Go QR code works on every PR. |
| Tools | Validator: 0 errors, 12 warnings. Self-test 224/224. Sizing: 0 positions over the cap. |
| Next | App lane: `LOOK-COMPONENTS`. Content lane: `RULES`. Both can start now. |
