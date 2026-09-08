# agent.md — Trading Learning App

**Every AI agent (Claude, Copilot, …) must read this file, `docs/UI.md`, `docs/schema.md` and `docs/curriculum.md` before creating or changing any content or code, and must follow them.**
If a rule here conflicts with what seems better for the learner, say so and ask — do not silently deviate.

---

## 1. What we are building

A "Duolingo for traders" mobile app. Users learn to trade through short daily lessons (3–4 minutes each), interactive chart scenarios (Long / Short / No trade on historical charts), gamification (XP, streak, hearts, levels, badges) and spaced repetition. No video course, no PDF. Theory and practice are tightly interleaved: the user "trades" (simulated) within the first five minutes of the app.

Tech stack: React Native + Expo + TypeScript, Supabase (auth + DB), RevenueCat (subscriptions). Content is data (YAML, see `docs/schema.md`), never hard-coded.

Concept document: `docs/Trading_Learning_App_Konzept.pdf` is the original vision document (gamification, monetization). Add it to `docs/` if available; until then this file is the source of truth.

### Product decisions (fixed)

| Topic | Decision |
|---|---|
| Content language | English. (i18n later via keys; never mix languages inside content.) |
| Asset class | Stocks are the teaching vehicle. Where a path is typically traded in other instruments in Europe (scalping → futures/CFDs), one lesson says so explicitly; no CFD/forex content is taught. |
| Markets | Two market profiles at launch: `US` and `EU-DE` (`content/market_profiles.yaml`). Session times, currency symbol, index examples and regulation notes are tokens rendered per profile. |
| Path choice | After Chapter 1 (Chapter 1 is shared by all paths). Onboarding does not ask for a path. |
| Hearts | 5 hearts. A wrong answer in a Test or Final Exam costs one heart; theory and repetition lessons never cost hearts. Each lost heart refills after 4 hours. |
| Pressure | No timers, no quick-fire, no countdowns anywhere. Repetition is untimed. |
| Mascot | Yes — one recurring mascot (artwork provided later). Plus recurring characters (retail trader, market maker, institution, bull, bear). |
| Theme | Dark mode default, full light theme available. |
| Chart decisions | Scored on reasoning; "No trade" can be the best answer. Never framed as prediction or profit. |
| Guarantees | No profitability or success claims anywhere. |

---

## 2. Paths and chapters

Three paths, organized by trading style (holding period), not by asset class:

| Path | Folder | Holding period |
|---|---|---|
| Day Trading | `content/paths/day-trading/` | minutes to hours, closed same day |
| Swing Trading | `content/paths/swing-trading/` | days to weeks |
| Scalping | `content/paths/scalping/` | seconds to minutes |

Every path has **6 chapters**. Chapter 1 is shared (`content/shared/chapter-01-market-basics/`) and is followed by the path choice. Chapters 2–6 live in the path folder. The full outline, per path, is in `docs/curriculum.md` — that file is the curriculum authority; this file holds the rules.

Chapter skeleton (same for all paths, content differs):

1. Market Basics (shared)
2. Charts 101
3. Orders, Costs & Position Size
4. Chart Reading II
5. Risk & Psychology
6. Strategies & Playbook

Path structure is **linear with rare fan-outs** (max 1–2 per path, never per chapter): at a deliberately chosen point the path may split into up to 3 short parallel strands (1–2 levels each, all mandatory, any order) that merge again. Current decisions: Day Trading — one fan-out in Chapter 4 (candles / support-resistance / volume → merge at VWAP). Swing Trading — one fan-out in Chapter 4 (VCP / cup-and-handle / flat base → merge at moving averages). Scalping — one fan-out in Chapter 4 (tape reading / VWAP & levels / opening drive → merge at "the scalper's map"). Fan-outs are marked with `path_position` in the level file.

---

## 3. Content rules (binding)

### 3.1 Units

- A **level** is a node on the path (e.g. Level 3). A **sub-level** is one lesson file (e.g. `level-03-2.yaml`, "3-2"). Test and Final Exam levels have exactly one sub.
- A sub-level takes **3–4 minutes**: **12–18 screens** at **10–15 seconds each**. Theory-type screens ≈10 s, question screens ≈15 s, chart decisions ≈20 s. `tools/validate_content.py` computes the estimate; stay inside 160–260 s.
- Chapter length is **content-driven**: as many levels as the material needs, typically 8–14 (Chapter 1: 12). Never pad to reach a number; never compress at the cost of clarity. Split a chapter rather than inflate it.
- Sub-levels per level: 1–4, driven by material. Short one-sub levels are welcome as quick wins between longer ones.
- Every level has a **title** the user sees on the path map ("Your First Trade", "The Spread Trap").

### 3.2 Categories and rhythm

- Categories: `new-theory`, `repetition`, `test`, `final-exam`.
- Rough mix per chapter: ~65 % new theory, ~25 % repetition, one Test near the middle, one Final Exam at the end. Soft guide, not a quota.
- **Interleaving:** every new-theory sub-level after the first two contains at least one question that reuses an earlier concept. Standalone repetition subs exist, but never more than **2 review-type subs in a row** (repetition / test / final-exam).
- Every sub-level's first screen is an `intro`; every Test/Final Exam ends with a `summary` and every Final Exam with a `badge`.

### 3.3 Screens and interactions

- Screen archetypes and interaction types are defined in `docs/UI.md` and referenced by `type` in the YAML. Level files contain content only — never button labels, colors, animation or layout.
- Each sub-level uses **at least 3 different question types**; no more than **2 `mc` screens in a row**; every Chapter ≥2 sub-level contains at least one visual/interactive screen (`hotspot`, `chart-tap`, `chart-decision`, `walkthrough`, `visual`, `spot-mistake`, `slider`, `order`, `sort`).
- **Show, then ask.** A term appears on a theory/example/carousel screen before any question uses it. New terms are listed in `terms_introduced`; the validator checks use-before-definition across the chapter.
- **No self-explanatory questions.** Never ask something answerable from the wording of the prompt alone, or one screen after the exact sentence was shown.
- **Plausible distractors only.** Every wrong option must be something a half-informed beginner could believe. If only one tempting alternative exists, use `tf`, `fill-*` or `numeric-input` instead of `mc`. Three options are fine.
- **No verbatim reuse.** A question may not appear with the same wording in a lesson, a Test and a Final Exam. Re-test the concept with a new situation or new numbers.
- Reveal notes: one sentence (two for numeric working). Say the correct idea, never just "wrong".
- Hedges ("generally", "though it varies") go into reveal notes, never into headlines or answer options.

### 3.4 Numbers and realism

- Every cost calculation shows a **share count** and a position value ("500 shares × $0.04 = $20"). Per-share and per-trade amounts are never added without converting.
- Prices are written with `$`; the renderer swaps the symbol per market profile. Session times, index names and regulation notes use `{{market.*}}` tokens from `content/market_profiles.yaml`.
- Examples use realistic scale for a retail beginner (accounts of $1,000–$25,000, 20–500 shares).
- Scenarios use synthetic or anonymized historical data. Never imply prediction.

### 3.5 Tests and exams

- Test (mid-chapter) 8–10 scored questions; Final Exam 10–12. `intro.counter` and `summary.total` must equal the number of question screens (validator-enforced).
- Every concept named in the Learning Goal is tested by at least one question.
- Pass mark 70 %. Below that: "Almost — review these levels" with the per-question list and links; the user can retry immediately (hearts apply).
- Hearts are lost only in Tests and Final Exams.

### 3.6 Consistency across sessions

Chapters are written by different sessions and models. To keep them indistinguishable:

- **Reference files.** Before writing, read `content/shared/chapter-01-market-basics/level-01-1.yaml`, `content/shared/chapter-01-market-basics/level-08-2.yaml` and `content/paths/scalping/chapter-03-orders-costs-position-size/level-03-2.yaml`. Match their tone (short, direct, second person), difficulty curve and screen rhythm exactly.
- **Outline is binding.** Write the chapter as laid out in `docs/curriculum.md` (levels, titles, subs, what each sub teaches, new terms). If the material truly needs a different split, do it and list the deviation in the session report.
- **Terms.** A chapter may use terms introduced in Chapter 1 and in lower-numbered chapters of the same path (listed in `docs/curriculum.md`); the validator warns about anything else and about re-introducing a known term. New terms go into `terms_introduced` of the sub that defines them, defined in plain words on a theory/example/carousel screen first.
- **Charts.** `chart-decision` and `chart-tap` use synthetic data: 8–12 bars, `[open, high, low, close]` per candle, realistic tick sizes (cents on a $10–$200 stock), `decision_index` between bar 4 and bar 7, the outcome visible in the remaining bars. Chapter 1 uses `kind: line`; every path chapter uses `kind: candles`. State the share count in the scenario and the P/L in the outcome.
- **Component ids and hotspot targets** are fixed in `docs/schema.md`; never invent new ones — if a screen needs a component that doesn't exist, use the closest existing one and note it in the report.
- **Tokens.** Session times, currency notes, index names and regulation notes always come from `{{market.*}}`; never write "9:30 ET" or "the S&P 500" literally in a path chapter.
- **Numbers.** Scalping: 500–2,000 shares, $0.05–$0.30 targets, $5,000–$30,000 accounts. Day trading: 100–1,000 shares, $0.30–$2 targets. Swing: 20–300 shares, $2–$20 targets, $5,000–$50,000 accounts.
- **Question variety.** Across a chapter, use every question type in `docs/UI.md` §4 at least twice; no sub-level repeats the same sequence of types as the previous one.
- **Do not edit `docs/`** beyond ticking the status of the chapter you wrote (in `docs/curriculum.md` and section 6 below). If a rule blocks good content, write the content the best way you can, then raise it in the report — never silently change a rule.

### 3.7 Copy

- Second person, present tense, one idea per screen, body text max 3 lines (≈220 characters).
- Confident simple statements; nuance in the reveal note.
- Define every new term in plain words on its first appearance and add it to `terms_introduced` (feeds the glossary popover).
- No profitability or success language ("you'll make money", "this works"). Use "improves the odds", "a well-structured trade".

---

## 4. Sources (binding)

Content is synthesized in our own words from these books. Nothing is quoted or copied. Where sources disagree, teach the consensus and mention the disagreement briefly.

**Citation rule:** Chapters 1–3 teach consensus basics and cite `consensus` (no page-level attribution — earlier decorative citations were often wrong). From Chapter 4 on, every strategy or rule claim names at least **two** sources from the path's list. Never cite a chapter you have not verified.

### Shared (all paths)
- John J. Murphy — *Technical Analysis of the Financial Markets* (chart reading, indicators, trend)
- Steve Nison — *Japanese Candlestick Charting Techniques* (candlesticks)
- Alexander Elder — *Trading for a Living* (psychology, risk, journal)
- Mark Douglas — *Trading in the Zone* (mindset, probabilities)
- Van K. Tharp — *Trade Your Way to Financial Freedom* (position sizing, R-multiples, expectancy)

### Day Trading
- Andrew Aziz — *How to Day Trade for a Living* (workflow, order types, risk)
- Al Brooks — *Trading Price Action* series (intraday price action)
- Mike Bellafiore — *One Good Trade*, *The PlayBook* (realistic intraday practice, playbooks)

### Swing Trading
- Mark Minervini — *Trade Like a Stock Market Wizard* (stock selection, VCP, sizing)
- Andrew Aziz & Brian Pezim — *How to Swing Trade* (mechanics, routines)
- Brian Shannon — *Technical Analysis Using Multiple Timeframes*

### Scalping
- Andrew Aziz — *How to Day Trade for a Living* (scalping chapter, hotkeys, Level 2)
- Bob Volman — *Understanding Price Action*, *Forex Price Action Scalping* (scalping principles; examples transposed to stocks)
- Mike Bellafiore — *One Good Trade*, *The PlayBook* (tape reading, intraday execution)
- John F. Carter — *Mastering the Trade* (volatility setups; secondary source only)

Never use influencers, YouTube or forum content as a source.

---

## 5. Working principles

1. Quality over speed. Think about the learning curve before writing; rewrite until a zero-knowledge reader would understand and enjoy it.
2. Combine sources; never treat one book as the truth.
3. No copyright violation — paraphrase, never quote.
4. Hook first. Every chapter's first level does something, not just explains something.
5. Simple first exposure, depth through repetition and scenarios.
6. Stop after each step and wait for explicit approval before the next (section 6).
7. Run `python3 tools/validate_content.py` and fix every error before declaring a step done, then do a zero-knowledge read-through of the whole chapter (typos, jargon before definition, absolute claims, coverage gaps, boredom).

---

## 6. Process and status

### Session workflow (one chapter per session)

1. Read `CLAUDE.md`, this file, `docs/curriculum.md`, `docs/UI.md`, `docs/schema.md`, and the three reference files in section 3.6. Do not read other content files unless a term or callback requires it.
2. Write **every** lesson file of the chapter in one pass, in level order, into the folder named in `docs/curriculum.md`.
3. Run `python3 tools/validate_content.py`. Fix every error and every warning. Run again until clean.
4. Do the zero-knowledge read-through (section 5, item 7) on the whole chapter and fix what you find.
5. Tick the chapter's status in `docs/curriculum.md` and in the step list below. Update the status lines in `README.md`.
6. Commit with a message that names the chapter and its level/sub counts; push to `main`.
7. Report back **only**: the `--status` table, deviations from the outline (with reasons), and questions that need a human decision. Then stop — the next chapter is a new session.

### Steps

1. Structure, rules, schema, validator, UI reference — **done**.
2. Chapter 1 (shared) — **done, reviewed**.
3. Scalping Chapter 3 "Orders, Costs & Position Size" — **done, reviewed**.
4. Scalping Chapter 2 "Charts 101" — **done**.
5. Scalping Chapter 4 "Reading Fast Markets" — **done**.
6. Scalping Chapters 5, 6 — planned.
7. Day Trading Chapters 2–6 — planned.
8. Swing Trading Chapters 2–6 — planned.

Live status (levels, screens, minutes per chapter) is generated, not hand-written:

```
python3 tools/validate_content.py --status
```

---

## 7. Legal and safety

- First launch, every scenario result and the stats screen show the one-line risk note ("Trading involves risk of loss. This app teaches concepts, not signals."). The full disclaimer lives in Settings → Legal (EU/BaFin-compliant wording to be provided).
- No broker, platform, device or provider recommendations. Fees are explained as a category, not as a price list.
- No content about leverage products beyond the one explanatory lesson noted in section 1.
