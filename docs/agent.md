# agent.md — Trading Learning App

**Every AI agent (Claude, Copilot, …) must read this file, `docs/UI.md`, `docs/schema.md` and `docs/curriculum.md` before creating or changing any content or code, and must follow them.**
If a rule here conflicts with what seems better for the learner, say so and ask — do not silently deviate.

Status: **v3** — expanded curriculum. The path is now eight chapters and ~385 sub-levels per path, sized so a learner doing ~10 minutes a day (two sub-levels) finishes in roughly six months and comes out able to trade a plan, not just recognise vocabulary. v2 rules that still hold are unchanged; everything new is marked **[v3]**.

---

## 1. What we are building

A "Duolingo for traders" mobile app. Users learn to trade through short daily lessons (3–4 minutes each), interactive chart scenarios (Long / Short / No trade on historical charts), gamification (XP, streak, hearts, levels, badges, tiers) and spaced repetition. No video course, no PDF. Theory and practice are tightly interleaved: the user "trades" (simulated) within the first five minutes of the app.

Tech stack: React Native + Expo + TypeScript, Supabase (auth + DB), RevenueCat (subscriptions). Content is data (YAML, see `docs/schema.md`), never hard-coded.

Concept document: `docs/Trading_Learning_App_Konzept.pdf` is the original vision document (gamification, monetization). Add it to `docs/` if available; until then this file is the source of truth.

### 1.1 What "finished the path" has to mean **[v3]**

A graduate must be able to: pick which stocks are worth watching today, read the day's context, recognise every setup in their playbook on sight, size a position from risk **and** from what the account can pay for, place entry, stop and target correctly, follow session limits, keep a journal, and judge their own method by expectancy over a sample.

A graduate is **not** a profitable trader, and the app never suggests otherwise. The honest promise is: *ready to paper-trade with a real process, and able to improve from their own record.* Competence past that comes from screen time the app cannot supply. Chapter 8 of every path ends by handing the user a concrete 30-day simulator plan rather than a certificate.

**[v3.1] Where the promise stops, and the decision nobody has taken.** Read the sentence above carefully: it ends at *paper-trade*. Paper trading needs no broker, no account type, no market-data subscription and no configured platform — which is exactly why the path covers none of them, and why that went unnoticed for eight chapters. Verified against every `learning_goal` in the written path: opening an account or choosing its type, platform settings, and getting real-time data appear **zero** times, while all eight capabilities above are covered across the chapters that should carry them.

That is not yet a defect, because §1.1 never promised it. It is an **open product decision**: does this app finish at *a process you can paper-trade with*, or at *a person who can start*? Chapter 8 Level 15 (`docs/curriculum.md`, README items 10, 12 and 13) is drafted for the second answer and cannot be fully written until the first one is given, because two of its four sub-levels depend on decisions recorded in §3.6.

One constraint holds under either answer and binds today: **the app must never imply it has prepared the learner for a step it did not cover.** A graduation screen that reads as "you are ready to go" while the path has not said which account can even place the trades it taught is the same failure as a profitability claim, in a quieter register.

### Product decisions (fixed)

| Topic | Decision |
|---|---|
| Content language | English. (i18n later via keys; never mix languages inside content.) |
| Asset class | Stocks are the teaching vehicle. Where a path is typically traded in other instruments in Europe (scalping → futures/CFDs), one lesson says so explicitly; no CFD/forex content is taught. **[v3]** Partly kept, in the wrong place: `{{market.scalping_note}}` says exactly this ("In Europe, retail scalpers often trade futures or CFDs… this app teaches scalping with stocks because the mechanics are the same") — but as **one theory screen inside a fees lesson**, Chapter 3 Level 14-1, rather than as the lesson this row describes, and nowhere near the point where a learner opens an account. **Chapter 8 Level 15, "What You'll Actually Be Offered"** (`docs/curriculum.md`) is that lesson, specified and not yet written. Financial margin still appears zero times in the 387 written sub-levels. |
| Markets | Two market profiles at launch: `US` and `EU-DE` (`content/market_profiles.yaml`). Session times, currency symbol, index examples and regulation notes are tokens rendered per profile. |
| Path choice | After Chapter 1 (Chapter 1 is shared by all paths). Onboarding does not ask for a path. |
| Daily target **[v3]** | Two sub-levels ≈ 10 minutes. A path is ~385 sub-levels ≈ 22 hours ≈ 6 months at that pace. |
| Hearts | 5 hearts. A wrong answer in any lesson, Test or Final Exam costs one heart; practice never does. At 0 hearts the sub-level stops. Each lost heart refills after 4 hours. |
| Pressure | No timers, no quick-fire, no countdowns anywhere. Repetition is untimed. This applies to every new interaction type too. |
| Mascot | **No.** **[v3.1 — reversed]** v2 and v3 specified one recurring mascot plus five recurring characters (retail trader, market maker, institution, bull, bear), and the placeholder art, the poses and the `story` screen's `character` field were all built. All of it is withdrawn: the cast is out of the app, out of `docs/UI.md` §6.9 and out of all 198 sub-levels that named it. A screen carries its meaning in its copy, its data component and the reveal's verdict colour. Reopening this means reopening this row first. |
| Theme | Dark mode default, full light theme available. |
| Chart decisions | Scored on reasoning; "No trade" can be the best answer. Never framed as prediction or profit. |
| Guarantees | No profitability or success claims anywhere. |

---

## 2. Paths and chapters **[v3 — restructured]**

Three paths, organized by trading style (holding period), not by asset class:

| Path | Folder | Holding period |
|---|---|---|
| Day Trading | `content/paths/day-trading/` | minutes to hours, closed same day |
| Swing Trading | `content/paths/swing-trading/` | days to weeks |
| Scalping | `content/paths/scalping/` | seconds to minutes |

Every path has **8 chapters**. Chapter 1 is shared (`content/shared/chapter-01-market-basics/`) and is followed by the path choice. Chapters 2–8 live in the path folder. The full outline, per path, is in `docs/curriculum.md` — that file is the curriculum authority; this file holds the rules.

Chapter skeleton (same for all paths, content differs):

1. **Market Basics** (shared) — what a market is, and the first simulated trades
2. **Charts 101** — candles, volume, structure, levels
3. **Orders, Costs & Position Size** — the mechanics of getting in and out, and what it costs
4. **Reading the Market** — the path's core reading skill (VWAP/tape for scalping, multi-timeframe for day, patterns for swing). Contains the path's one fan-out.
5. **Finding the Trade** — selection, scanning, watchlist, market context. *New in v3.*
6. **Risk & Psychology** — R, expectancy, limits, tilt, the journal
7. **The Playbook** — the named setups, one card each, drilled
8. **The Trading Day** — platform and execution, the full routine, capstones, the simulator plan. *New in v3.*

Path structure is **linear with rare fan-outs** (max 1–2 per path, never per chapter): at a deliberately chosen point the path may split into up to 3 short parallel strands (2–3 sub-levels each, all mandatory, any order) that merge again. Current decisions: every path fans out once, in Chapter 4. Fan-outs are marked with `path_position` in the level file.

---

## 3. Content rules (binding)

### 3.1 Units and sizing **[v3 — changed]**

- A **level** is a node on the path (e.g. Level 3). A **sub-level** is one lesson file (e.g. `level-03-2.yaml`, "3-2").
- A sub-level takes **3–4 minutes**: **12–18 screens** at **10–15 seconds each**. Theory-type screens ≈10 s, question screens ≈15 s, chart decisions ≈20 s. `tools/validate_content.py` computes the estimate; stay inside 160–260 s. *(Unchanged — the lesson is still the atom.)*
- **Chapter length: at least 15 levels, typically 16–19.** Never fewer than 15. Split a chapter rather than let a level sprawl.
- **Sub-levels per level: 3–4 for teaching levels.** One- and two-sub levels are now the exception, allowed only for:
  - Tests and Final Exams (exactly 1 sub),
  - short practice/callback levels (2 subs),
  - a deliberate quick win between two heavy levels (2 subs, at most twice per chapter).
  Across a chapter, **at least 60 % of levels must have 3 or more subs**, and at least four levels must have 4.
- **Chapter totals** land around **45–52 sub-levels**. A path (Chapter 1 + seven path chapters) lands around **385** — about 22 hours, or six months at two sub-levels a day.
- Every level has a **title** the user sees on the path map ("Your First Trade", "The Spread Trap").
- Never pad to reach a number, and never compress at the cost of clarity. If a chapter genuinely runs past 19 levels, split it and say so in the report.

### 3.2 Categories and rhythm **[v3 — extended]**

- Categories: `new-theory`, `repetition`, `test`, `final-exam`.
- Rough mix per chapter: ~60 % new theory, ~30 % repetition/practice, **two Tests** (one after roughly the first third, one after roughly the second) and one Final Exam at the end. Soft guide, not a quota.
- **Interleaving:** every new-theory sub-level after the first two contains at least one question that reuses an earlier concept. Standalone repetition subs exist, but never more than **5 `repetition` subs in a row** with no new material in between.

  **Why five, and why only `repetition` counts.** The rule exists so a learner never goes a long stretch with nothing new — not to ration review, and not to make the end of a chapter illegal. A Checkpoint or Final Exam is a distinct event (scored, hearts, its own node on the path map), so it is not "more of the same": it does not lengthen a run, and it does not clear one either — only a `new-theory` sub does. Five is the worst case `docs/curriculum.md` actually demands, and it demands it in all three paths: Chapter 7's Capstone (3 subs) runs straight into the Chapter Review (2 subs) before the Final Exam. Everything else the outline asks for is shorter — Chapter 4's Callback + Chapter Review tail is four, and the Practice-then-Checkpoint pattern that punctuates every chapter is two. So five is the smallest number the curriculum can satisfy as written; six would be headroom nothing in the outline needs. Because a test does not reset the counter, the old evasion is closed too: five repetition subs, a Checkpoint, then two more is a run of seven and warns. If a chapter genuinely needs a longer review block, the fix is to split it with new material, not to relabel a practice level as theory.
- Every sub-level's first screen is an `intro`; every Test/Final Exam ends with a `summary` and every Final Exam with a `badge`.
- **[v3]** Each chapter contains at least one **drill sub-level**: a repetition sub whose body is 4–6 chart decisions or swipe decks with almost no theory. These are where recognition is actually built.

### 3.3 Reinforcement across chapters **[v3 — new section]**

The single biggest risk of a 385-sub-level path is that Chapter 2 is forgotten by Chapter 6. Reinforcement is therefore a rule, not a nicety.

- **`reinforces:` header field.** A sub-level lists the earlier chapter numbers whose material it deliberately re-tests, e.g. `reinforces: [1, 3]`. Empty for pure new theory.
- **Callback levels.** Every chapter from 3 onward contains at least one **Callback level** (category `repetition`, 2 subs, titled "… Callback" or similar) that re-tests **two named earlier chapters** in the new chapter's context. Example: Chapter 3's callback re-tests Chapter 1's liquidity and Chapter 2's levels *through* spread and stop placement.
- **Question quota.** At least **15 %** of a chapter's question screens must sit in sub-levels that declare `reinforces`.
- **Exams reach back.** Every Test draws at least **20 %** of its questions from earlier chapters; every Final Exam at least **25 %**. These carry `reinforces` too.
- **Reinforce in context, never verbatim.** A callback question re-tests the old idea inside the new chapter's material. "What is the spread?" is not a callback; "your stop is 6 cents and the spread is 4 — what does that do to the trade?" is.
- Spaced repetition in the Practice hub (UI.md §7.3) is additional, not a substitute.

### 3.4 Screens and interactions

- Screen archetypes and interaction types are defined in `docs/UI.md` and referenced by `type` in the YAML. Level files contain content only — never button labels, colors, animation or layout.
- Each sub-level uses **at least 3 different question types**; no more than **2 `mc` screens in a row**; every Chapter ≥2 sub-level contains at least one visual/interactive screen.
- **[v3] Variety at scale.** Across a chapter, use at least **10 different question types**, and every type in `docs/UI.md` §4 at least twice. No sub-level repeats the same sequence of types as the previous one. At 45 subs a chapter, sameness is the main enemy.
- **[v3] Closing screens vary.** No more than 70 % of a chapter's sub-levels may end on a `theory` card. Use `checklist-reveal`, `visual`, `story`, `example`, `recap` or `plan-card` for the rest.
- **Show, then ask.** A term appears on a theory/example/carousel screen before any question uses it. New terms are listed in `terms_introduced`; the validator checks use-before-definition across the chapter.
- **No self-explanatory questions.** Never ask something answerable from the wording of the prompt alone, or one screen after the exact sentence was shown.
- **Scenarios describe, they do not conclude. [v3]** A `chart-decision` scenario gives the observable facts (where price is, what the level is, what the share size is). It must not stack three verdict words ("thin, flat, nothing nearby") that answer the question before the chart is read. One or two observations, then let the chart carry the rest.
- **Plausible distractors only.** Every wrong option must be something a half-informed beginner could believe. If only one tempting alternative exists, use `tf`, `fill-*` or `numeric-input` instead of `mc`. Three options are fine.
- **No verbatim reuse.** A question may not appear with the same wording in a lesson, a Test and a Final Exam. Re-test the concept with a new situation or new numbers.
- Reveal notes: one sentence (two for numeric working). Say the correct idea, never just "wrong".
- Hedges ("generally", "though it varies") go into reveal notes, never into headlines or answer options.

### 3.5 Answer-key hygiene **[v3 — new section]**

A learner must not be able to score well without knowing the material. These are checked by the validator.

- **Correct-option position rotates.** Across a chapter, the correct option must be roughly evenly spread over the available positions. Never author a run of screens whose answer is the first option.
- **True/false balance.** Between 40 % and 60 % of `tf` answers in a chapter are `true`. A learner who always answers "false" must fail.
- **No length tell.** The correct option must not be the longest option in more than ~45 % of a chapter's `mc`/`numeric-mc` screens. Put the justification in the `explanation`, not in the option text. Options are short claims; the reveal carries the reasoning.
- **No punctuation tell.** Do not make the correct option the only one containing an em-dash, a number, or a qualifier.
- **Both directions are taught. [v3.1]** Across a chapter's directional `chart-decision` screens — the ones whose `best` is `long` or `short` — neither side may outnumber the other by more than about **2:1**. A learner who always answers "long" must not out-score one who always answers "short", any more than one who always answers "false" may. Checked from eight directional decisions up, below which the ratio says nothing. `no-trade` is not part of the count: how often standing aside is right is a curriculum decision, and the rule below is what protects it. A flipped decision is a **new chart**, not a mirrored one — a short setup reads differently from a long one (the failed push, the lower high, the break that traps buyers), so the scenario, the outcome and the explanation are rewritten with the setups that chapter actually taught.
- **"No trade" is never punished.** On any `chart-decision` whose `best` is `long` or `short`, `no-trade` must appear in `reasonable`. Standing aside is amber at worst, in lessons and in exams alike. This is a promise Chapter 1 makes explicitly and every later chapter must keep.

### 3.6 Numbers and realism

- Every cost calculation shows a **share count** and a position value ("500 shares × $0.04 = $20"). Per-share and per-trade amounts are never added without converting.
- Prices are written with `$`; the renderer swaps the symbol per market profile. Session times, index names and regulation notes use `{{market.*}}` tokens from `content/market_profiles.yaml`. **[v3]** Never write a clock time literally, not even in a story ("7:15" breaks under `EU-DE`). Use a market token or a relative phrase ("an hour before the open").
- **[v3] Two ceilings on share count.** Position size is `min(risk budget ÷ stop distance, (account × 95 %) ÷ share price)`. Every drill, worked example and exam question must respect the account behind it — a drill may never put the learner in more stock than the stated account can pay for. Where a lesson names an account, check it.
- **[v3.1] The concentration rule — settled.** **`shares × price ≤ 0.95 × the account named in the file`**, and a drill never has a second position open beside the first. That is the whole rule, and it is the number `tools/validate_content.py` checks and `tools/check_sizing.py` reports. The 5 % that is never spent is the buffer a real fill needs: you pay the ask, not the last price the drill quotes, and the fee comes out of the same cash.

  *Why the position is nearly the whole account.* The concentration is not an authoring accident, it is what the two ceilings produce. Position value ÷ account = risk-budget % × price ÷ stop distance. At 1 % of the account and a scalper's stop — six to twenty cents on a $10–$30 stock, well under 1 % of the price — that ratio lands between 70 % and 100 % every time, whatever the account is: it does not depend on the account at all, so a bigger account cannot fix it. Lowering it means lowering the risk budget below the 1 % Chapter 3 teaches, widening the stop past what a scalp is, or naming an account the learner does not have. The path keeps the concentration and teaches it instead: **a cash-account scalp puts nearly all the cash to work for sixty seconds, which is exactly why only one scalp is open at a time.** What the trade risks is the stop times the share count — a fraction of a per cent of the account — and not the position value. Those are two different numbers (Chapter 3, Level 10-1), and this is the one place the app has to say so out loud.

  *No margin, and no margin smuggled.* 95 % of the cash is still cash, so nothing here needs a margin account (§7). It is also the ceiling: a chapter that runs several scalps in one session (Chapters 6 and 8) states that they are sequential and the account is flat between them, and the day's trade cap is a discipline limit, never a claim about funding — `{{market.regulation_note}}` already tells the learner that cash has to settle.

  *A second one, larger: the path teaches 123 shorts and never says they need a different account.* A short is only possible in a margin-enabled account — a cash account cannot borrow, so it cannot short at all. The corpus has **123 short decisions against 199 longs**, 38 % of every directional call, and Chapter 1 Level 13-1 introduces the trade as "you borrow 100 shares of XYZ from your broker and sell them", which reads as though it were simply available. Chapter 3 Level 14-1 does teach borrow *availability* (hard-to-borrow, borrow fees, no borrow no short) — that part is sound — but **the account type is named nowhere in 387 sub-levels**, and Chapter 1 Level 12 teaches "a brokerage account" without types. So a learner opens the account the app describes and a third of the path is not executable for them. Three ways out, and the cheapest is probably right:

  - **(a) Name the account, keep the content.** One passage in Chapter 1 Level 12 and one in Chapter 8 Level 15: shorting needs a margin-enabled account, and in the US that account is what brings the pattern-day-trader rule with it. No drill changes. But then this section stops being able to say *nothing here needs a margin account*, and §7 needs one sentence on why holding a margin-enabled account for the borrow is not leverage *content*.
  - **(b) Assume a margin account throughout** and rework §3.6's cash framing around it. Larger, and it walks straight into §7.
  - **(c) Cut the shorts to a handful** and teach the rest as "this is what a short is, and why you cannot do it yet". This one is worse than it sounds: it guts the Chapter 7 playbook, where the failed-breakout fade, the mean reversion and the range rotation are short setups, and it undoes the long/short balance work already finished (README item 6, which deliberately *raised* the short count to fix a 1.85:1 skew).

  Whichever is chosen, it is a product decision like the one below and belongs in the same pass. Until then, no content may imply that a short is available to anyone holding the account Chapter 1 describes.

  *An unresolved conflict, recorded rather than papered over.* Those two sentences do not actually reconcile. Chapters 6 and 8 teach a **six-trade** session; the app's own US `regulation_note` says a cash account "must wait for funds to settle"; and 95 % of the cash sits in each position. Six same-day round trips on a cash account do not work under T+1 — the proceeds of trade one are unsettled when trade two is placed — and doing them on a margin account is exactly what triggers the pattern-day-trader rule the same note describes. So the model is internally inconsistent, and it resolves in one of three ways, none free: **(a)** smaller positions, so several settled-cash cycles fit — which breaks the concentration §3.6 spent this section justifying; **(b)** say plainly that several day trades a session need a margin account, which brings the PDT threshold and §7 into the content; or **(c)** reframe the trade cap as a per-*day-with-settled-funds* limit rather than a per-session one. This is a product and compliance decision, not an authoring one; §7 already lists the BaFin wording as outstanding, and this belongs in the same pass. Until it is decided, do not let a drill imply that six same-day round trips are free.

  *And the caveat that has to travel with it.* A position this size is only survivable because the stop is small and the name is liquid. Wherever the account ceiling is taught, say plainly what a halt or a gap does to a position worth nearly the account: a stop is an order, not a guarantee. Teaching the concentration without that sentence would be teaching the wrong half of it.

  *The 95 % is a ceiling, not a target, and only scalping lives against it.* Which of the two ceilings binds follows from the stop, and the stop is what separates the paths. From the same formula:

  | Path | Typical stop | Position value ÷ account | Which ceiling binds | Positions open |
  |---|---|---|---|---|
  | Scalping | 6–20 ¢ on a $10–$30 name (0.3–1 % of price) | raw 100–330 %, clamped to **70–95 %** | the account, always | one |
  | Day trading | 0.5–2 % of price | **50–95 %** | either, depending on the name | one, occasionally two |
  | Swing | 4–10 % of price | **10–50 %** | the risk budget, always | **several at once** |

  The ranges span a risk budget of 1–2 %. The app teaches **1 %** everywhere and never writes 2 %; that is a deliberate beginner's choice, not the only defensible number — Elder, a shared source (§4), sets 2 % as a *ceiling*, and the swing curriculum's Chapter 3 Level 7 says "the 1 % rule" explicitly. Keep 1 % as the taught number on every path, and do not let a drill quietly size at 2 % because the arithmetic came out nicer.

  So the concentration *teaching* — one position at a time, nearly all the cash at work, the halt caveat — is **scalping's, and Chapters 7 and 8 of the scalping path are where it belongs.** On swing it would be false twice over. A single swing position at 95 % of the account behind an 8 % stop risks **7.6 %** on one trade, eight times the taught 1 %: near the cap is not compliance there, it is a defect, and it means the risk budget was abandoned to reach the ceiling. And swing **runs several positions at the same time** — its own curriculum says so — so the per-position cap is close to meaningless on that path. What binds instead is the pair the single-position rule cannot see: **total exposure** across everything open, and **total risk** across it. Four swing positions at 25 % each is the whole account deployed and 4 % at risk, and neither number appears in a rule written about one position.

  The cap still applies everywhere — nothing may exceed the cash — it simply stops being the number that decides.

  *What this binds in content.* Chapter 3 Level 10 of the **scalping** path teaches the account ceiling as the usual answer rather than the exception: with a stop under 1 % of the price, the cash runs out before the risk budget does. Its day-trading and swing counterparts teach the opposite emphasis — the risk budget decides, and the account ceiling is the sanity check you still run.

  **`setup_max_account_pct` is not 95, and must not be.** Chapter 1 is shared by all three paths and `path-choice` fires *after* its badge — the plan card in Level 16-2 sits two sub-levels before the learner has a path. Prescribing a scalper's 95 there hands a future swing trader a rule that risks eight times what the app teaches. Chapter 1 keeps a **conservative, path-neutral number** (50 is fine, and the file's arithmetic is already built on it), and the **path's own Chapter 3 revises it with the reason** — which the plan schema already supports, since revisiting a field is defined as pre-filled and editable. A learner watching their own ceiling move from 50 to 95 *because they now understand why a scalp is different* is the lesson; being handed 95 in Chapter 1 is not.

  *Not yet enforced.* `tools/validate_content.py` and `tools/check_sizing.py` check the 95 % single-position ceiling only. On scalping that is the binding constraint, so the check has teeth. On day trading and swing it is not, and **nothing checks what actually binds there.** Two rules are missing, and both have to exist before Stage 5 writes either path:

  1. **Per-trade risk.** `shares × stop distance ÷ account` within roughly 0.5–2 % wherever a file names an account and a stop. A swing drill risking 8 % per trade passes today.
  2. **Total open exposure and risk**, for any file that shows more than one position at once: the sum of position values against the account, and the sum of `shares × stop distance` against it. A swing chapter teaching several concurrent holdings has no rule at all right now, and the single-position cap cannot be extended to cover it — four positions at 25 % each breaches nothing while deploying the entire account.
- Examples use realistic scale for a retail beginner (accounts of $5,000–$30,000).
- **[v3] Price bands.** Keep drill prices in a band where the path's share counts fit the account: scalping and day trading $10–$30, swing $20–$80. Illustrative (non-drill) charts may use $10–$200.
- **[v3] Volume magnitudes.** A 1-minute bar on a liquid scalping/day-trading stock is **40,000–500,000 shares**; a deliberately thin bar is 4,000–20,000; a 5-minute bar is 150,000–500,000; a daily bar for swing is 1–20 M. Never let a drill have the learner trade 1,500 shares in a stock printing 4,000 a minute — the app teaches the opposite.
- Scenarios use synthetic or anonymized historical data. Never imply prediction.

### 3.7 Tests and exams

- Test (there are two per chapter) 8–10 scored questions; Final Exam 12–15. `intro.counter` and `summary.total` must equal the number of question screens (validator-enforced).
- Every concept named in the Learning Goal is tested by at least one question.
- **[v3]** Tests and Final Exams reach back into earlier chapters per §3.3.
- Pass mark 70 %. Below that: "Almost — review these levels" with the per-question list and links; the user can retry immediately (hearts apply).
- Hearts are lost in lessons, Tests and Final Exams (not in practice).

### 3.8 Consistency across sessions

Chapters are written by different sessions and models. To keep them indistinguishable:

- **Reference files.** Before writing, read `content/shared/chapter-01-market-basics/level-01-1.yaml`, `content/paths/scalping/chapter-03-orders-costs-position-size/level-05-1.yaml` and `content/paths/scalping/chapter-07-scalping-playbook/level-02-2.yaml`. Match their tone (short, direct, second person), difficulty curve and screen rhythm exactly.
- **Outline is binding.** Write the chapter as laid out in `docs/curriculum.md` (levels, titles, subs, what each sub teaches, new terms, what it reinforces). If the material truly needs a different split, do it and list the deviation in the session report.
- **Terms.** A chapter may use terms introduced in Chapter 1 and in lower-numbered chapters of the same path (listed in `docs/curriculum.md`); the validator warns about anything else and about re-introducing a known term. New terms go into `terms_introduced` of the sub that defines them, defined in plain words on a theory/example/carousel screen first.
- **Charts.** `chart-decision` and `chart-tap` use synthetic data: 8–12 bars, `[open, high, low, close]` per candle, realistic tick sizes, `decision_index` between bar 4 and bar 7, the outcome visible in the remaining bars. Chapter 1 uses `kind: line`; every path chapter uses `kind: candles`. State the share count in the scenario and the P/L in the outcome.
- **[v3] Outcome variety.** Within a chapter, the per-share move quoted in `chart-decision` outcomes must span a real range. No single value may account for more than a quarter of them, and the outcome sentence must not use one template every time.
- **Component ids and hotspot targets** are fixed in `docs/schema.md`; never invent new ones — if a screen needs a component that doesn't exist, use the closest existing one and note it in the report.
- **Tokens.** Session times, currency notes, index names and regulation notes always come from `{{market.*}}`; never write "9:30 ET" or "the S&P 500" literally in a path chapter.
- **Difficulty curve.** `difficulty` runs 1–3 and must move. No more than **five consecutive sub-levels** may share the same difficulty; every chapter starts at 1 or 2 and ends at 3.

### 3.9 Copy

- Second person, present tense, one idea per screen, body text max 3 lines (≈220 characters).
- Confident simple statements; nuance in the reveal note.
- Define every new term in plain words on its first appearance and add it to `terms_introduced` (feeds the glossary popover).
- No profitability or success language ("you'll make money", "this works"). Use "improves the odds", "a well-structured trade".

---

### 3.10 Replays **[v3 — new section]**

A replay (`docs/UI.md` §4.4, format in `docs/schema.md` § Replays) is the only content in the
app that tests **timing** and **restraint**. Every other screen freezes a chart and asks what
it is; a replay asks *is it now?* — and counts the trade the learner took that was never there.
Authoring one is a different job from authoring a `chart-decision`, and these rules are what
keep it teachable.

- **No autoplay, ever.** The learner taps for each bar. This is not a rendering choice, it is
  section 1's fixed decision — *no timers, no quick-fire, no countdowns anywhere* — and a
  replay that advances on its own breaks it. The skill under test is deciding at bar N without
  seeing bar N+1, and a hand-advanced chart tests that completely. What is deliberately absent
  is time pressure: Chapter 6 teaches not trading under pressure, so manufacturing it to
  practise would rehearse the very state the curriculum tells the learner to stand down from.
- **40–80 bars.** Below 40 there is nothing to sit through and the setup is the only thing on
  screen; above 80 the tap becomes work. The session needs enough quiet bars that advancing
  through them is itself the exercise.
- **The trigger is the last field, not a judgement.** A setup triggers at the bar its final
  card field fills. Author the fields with the bar each one fills at, and let `trigger_bar`
  fall out of them. This is what makes Early / Textbook / Late arithmetic; an authored trigger
  that the fields do not support is an ungradeable replay.
- **Every decoy names the field it fails, and the reveal says which.** This is the rule that
  separates difficulty from noise. A chart that is hard because the bars are ambiguous is a
  coin flip, and a scored coin flip teaches superstition — the exact opposite of the
  expectancy thinking Chapter 6 exists to build. If you cannot name why the near-miss was not
  the setup, it is not a decoy: cut it or fix it.
- **At most two of the five fields may be `marginal`.** Marginal means *a real read that is
  genuinely close* — a reclaim that closes two cents above instead of engulfing. Three or more
  marginal fields is not a hard setup, it is an unreadable one.
- **A Phantom is a lesson, not a verdict.** The post-mortem names the field the learner stopped
  checking ("the card wants the third field; at this bar only the first two were filled").
  Never "wrong".
- **Restraint is never red.** `Missed` and `Phantom` are amber, never red, exactly as "No trade"
  is in §3.5. A replay whose honest answer is *no setup all session* is legitimate content and
  scores green for reaching the last bar unbothered.
- **The arithmetic still has to hold over every bar.** 40–80 candles, a volume series, a VWAP
  series and two or three stated positions is five to eight times the numbers of a
  `chart-decision`, and every one of §3.6's rules still applies: the two sizing ceilings, the
  account cap, the price band, the volume magnitudes. This is where errors hide, because no
  single screen displays them all.
- **Never generate a replay in a batch.** One at a time, each verified — recompute every stated
  stop distance, share count and R, and re-read the bar series against every `filled_at` you
  claimed. The Stage 4 drill batch works because a drill is 8–12 bars with one answer; a replay
  is not that shape.
- **Reading level is a property, not a label.** It follows from `shows_card`, `names_setup` and
  the decoy count (table in `docs/schema.md`). Do not write `reading_level: 3` on a replay that
  hands the learner the card.
- **A replay is not a simulator.** It teaches recognition, not live execution, and the copy
  never implies otherwise. Chapter 8 still ends on the 30-day simulator plan (§7); a replay is
  practice on the way there.

## 4. Sources (binding)

Content is synthesized in our own words from these books. Nothing is quoted or copied. Where sources disagree, teach the consensus and mention the disagreement briefly.

**Citation rule:** Chapters 1–3 teach consensus basics and cite `consensus` (no page-level attribution). From Chapter 4 on, every strategy or rule claim names at least **two** sources from the path's list. Never cite a chapter you have not verified.

### Shared (all paths)
- John J. Murphy — *Technical Analysis of the Financial Markets* (chart reading, indicators, trend)
- Steve Nison — *Japanese Candlestick Charting Techniques* (candlesticks)
- Alexander Elder — *Trading for a Living* (psychology, risk, journal)
- Mark Douglas — *Trading in the Zone* (mindset, probabilities)
- Van K. Tharp — *Trade Your Way to Financial Freedom* (position sizing, R-multiples, expectancy)
- **[v3]** Brett N. Steenbarger — *Trading Psychology 2.0*, *The Daily Trading Coach* (self-coaching, process, performance review)

### Day Trading
- Andrew Aziz — *How to Day Trade for a Living* (workflow, order types, risk, scanning)
- Al Brooks — *Trading Price Action* series (intraday price action)
- Mike Bellafiore — *One Good Trade*, *The PlayBook* (realistic intraday practice, playbooks)
- **[v3]** Linda Raschke & Laurence Connors — *Street Smarts* (short-term setups)

### Swing Trading
- Mark Minervini — *Trade Like a Stock Market Wizard* (stock selection, VCP, sizing)
- Andrew Aziz & Brian Pezim — *How to Swing Trade* (mechanics, routines)
- Brian Shannon — *Technical Analysis Using Multiple Timeframes*

### Scalping
- Andrew Aziz — *How to Day Trade for a Living* (scalping chapter, hotkeys, Level 2, scanners)
- Bob Volman — *Understanding Price Action*, *Forex Price Action Scalping* (scalping principles; examples transposed to stocks)
- Mike Bellafiore — *One Good Trade*, *The PlayBook* (tape reading, intraday execution)
- John F. Carter — *Mastering the Trade* (volatility setups, market internals; secondary source only)
- **[v3]** Linda Raschke & Laurence Connors — *Street Smarts* (short-term setups)

Never use influencers, YouTube or forum content as a source.

---

## 5. Working principles

1. Quality over speed. Think about the learning curve before writing; rewrite until a zero-knowledge reader would understand and enjoy it.
2. Combine sources; never treat one book as the truth.
3. No copyright violation — paraphrase, never quote.
4. Hook first. Every chapter's first level does something, not just explains something.
5. Simple first exposure, depth through repetition and scenarios.
6. **[v3]** Reps beat prose. When a choice exists between one more explanation and one more drill, write the drill.
7. Stop after each step and wait for explicit approval before the next (section 6).
8. Run `python3 tools/validate_content.py` and fix every error and warning before declaring a step done, then do a zero-knowledge read-through of the whole chapter (typos, jargon before definition, absolute claims, coverage gaps, boredom).

---

## 6. Process and status

### Session workflow (one chapter per session)

A v3 chapter is 45–52 sub-levels — too much for one clean pass. Write it in **level blocks**: 4–6 levels per pass, validating after each block, and keep the whole chapter in one session so the voice holds. `docs/build-plan.md` gives the stage order, the per-stage prompts and the model to use for each.

1. Read `CLAUDE.md`, this file, `docs/curriculum.md`, `docs/UI.md`, `docs/schema.md`, and the three reference files in section 3.8. Do not read other content files unless a term or callback requires it.
2. Write the chapter's lesson files in level order, into the folder named in `docs/curriculum.md`, in blocks.
3. Run `python3 tools/validate_content.py` after every block. Fix every error and every warning before moving on.
4. Do the zero-knowledge read-through (section 5, item 8) on the whole chapter and fix what you find.
5. Tick the chapter's status in `docs/curriculum.md` and in the step list below. Update the status lines in `README.md`.
6. Commit with a message that names the chapter and its level/sub counts; push.
7. Report back **only**: the `--status` table, deviations from the outline (with reasons), and questions that need a human decision. Then stop — the next chapter is a new session.

### Steps

1. Structure, rules, schema, validator, UI reference — **done**.
2. Chapter 1 (shared) — **done: 17 levels / 47 subs**.
3. Scalping Chapters 2–8 — **done: 18/19/18/17/19/19/17 levels, 340 subs**.
4. Open work on the written path — **see the list in `README.md`**. Category labels, the plan
   sheet, the long/short split and exam interactivity are **done**. Left: position sizes
   (66 breaches of the §3.6 cap, 60 of them in Chapter 2, plus Chapter 1's plan card still
   suggesting 50 %) and scenario phrasing (`state` chips at 16–38 % in Chapters 3, 6 and 7).
5. Drill bank (`content/drills/`) — **manifest, batch script and validator done; 1 of 15 packs written** (`content/drills/packs.yaml`, `tools/build_drill_batch.py`).
6. Day Trading Chapters 2–8 — planned.
7. Swing Trading Chapters 2–8 — planned.

Live status (levels, screens, minutes per chapter) is generated, not hand-written:

```
python3 tools/validate_content.py --status
```

---

## 7. Legal and safety

- First launch, every scenario result and the stats screen show the one-line risk note ("Trading involves risk of loss. This app teaches concepts, not signals."). The full disclaimer lives in Settings → Legal (EU/BaFin-compliant wording to be provided).
- No broker, platform, device or provider recommendations. Fees are explained as a category, not as a price list. **[v3]** Chapter 8 teaches platform *concepts* (order entry, hotkeys, a simulator) generically and names no product.
- No content about leverage products beyond the one explanatory lesson noted in section 1 — **Chapter 8 Level 15**, which is orientation and not instruction: it names what a broker will offer and what leverage does to arithmetic the learner already owns, and teaches no CFD, forex or margin *mechanics*, names no product and recommends nothing. **[v3]** This is why §3.6's account ceiling matters: a sizing rule that quietly requires margin is leverage content by the back door.
- **[v3] Saying nothing is its own failure.** The learner meets margin, settlement, the pattern-day-trader rule and — in Germany — the leveraged wrappers the moment they open an account, and a European retail scalper realistically cannot scalp cash stocks at all. Leaving that unsaid is not caution; it is sending a graduate into the one conversation this app prepared them least for. The answer is the orientation lesson, not silence and not a how-to.
- **[v3] Tax is out of scope, and saying so is the content.** The path mentions tax **zero** times. That is correct — tax treatment is jurisdiction-specific regulated advice, and this app must not give it — but silence is not the finished answer. Chapter 8 says once, plainly, that trading profits are taxed, that the treatment differs by country and by holding period, and that this is a question for a tax adviser. No rate, no jurisdiction rule, no worked example, no product.
- **[v3] Access is taught generically or not at all.** A scalper needs real-time data and an order-entry platform; delayed quotes make the whole path unusable. That fact may be stated. What may not: a provider, a platform, a price, a comparison, or anything shaped like "use X". `{{market.scalping_note}}` already carries the one market-specific sentence, and it is the only place such a claim belongs.
- **[v3]** Chapter 8 ends with a simulator plan, never with a claim that the user is ready to risk money.
