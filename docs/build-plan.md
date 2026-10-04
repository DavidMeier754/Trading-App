# Build plan – from today to the release

Status: 2026-09-25. This plan replaces the previous `docs/build-plan.md`, which ordered only the content work. Its proven content prompts are kept in **Appendix E**, unchanged or updated.

Updated the same day with David's answers to the open decisions (§4.1): all three paths, calm motion, the practice arena with Nutrade Plus, accounts, every launch language, and a German business as the provider.

**Updated 2026-10-03** (stage `DESIGN-REVIEW`): David's verdicts on 50 design ideas. The approved ones are built in that stage, which is new in this plan (Phase C, after `LOOK-SYSTEM`), and every later stage now says what it no longer needs to build and what it still owns. The variance simulator is dropped and the app never states how often something works (§0 "Variance"). The content these designs need is in the new `docs/ContentToDo.md`, which every content stage reads. And the work runs in **Claude Code sessions** again, one per stage, instead of threads in the Claude project (§1).

**One rule first: this file's order is the order.**
- Stages have names (`CI`, `STABLE-APP`, …), not numbers, because numbers drifted apart before.
- To find what comes next, read the table in section 2 from top to bottom. The first stage without ✅ is the next one.

**Contents**
0. Goal and guardrails
1. How to work with this plan
2. All stages at a glance
3. Where things stand today
4. Decisions
5. Phase A – Foundation
6. Phase B – Stable
7. Phase C – Look & feel
8. Phase D – Learning loop and fun
9. Phase E – Scalping content: correct, honest, complete
10. Phase F – Beta 1
11. Phase G – The practice arena (Nutrade Plus)
12. Phase H – Swing and Day Trading paths
13. Phase I – Platform: account, subscription, ads
14. Phase J – Languages
15. Phase K – Release
16. Phase L – After the release
17. Appendix A–F: templates, prompts, mapping of the review items

---

## 0. Goal and guardrails

### The goal (David, 2026-09-25)

1. **Learners have fun.**
2. **After the course, only practical experience is missing.** The knowledge is complete.
3. **Quality comes before speed.**

What that means for every stage:

- **Stay honest.**
  - The app promises no profit (`docs/agent.md` §1, §7).
  - "Only practice is missing" means: the graduate knows everything they need to know before their first real trade.
  - They also know that the simulator and the smallest real size are indispensable, and that the app cannot make them profitable.
- **Explain variance before it happens** (section "Variance" below). Otherwise the learner concludes "right = profit", the most dangerous belief a trading app can leave behind.
- **Test before moving on.**
  - Every stage ends with automatic checks (Claude) and an acceptance test by you.
  - The next stage starts only after your `OK`.

### Graduate profile – what "enough knowledge" means

A graduate can do or knows everything below. Stage `KNOWLEDGE` checks the whole course against this list; whatever is missing gets added.

**Market and mechanics**
1. How a price comes about: bid, ask, spread, order book, liquidity, volatility, trading sessions.
2. Which order fits when: market, limit, marketable limit, stop-market, stop-limit, bracket/OCO.
3. What a trade really costs (spread, slippage, fees), and whether it is still worth taking after that.

**Reading and selecting**

4. Reading charts: candles, volume, structure, levels, VWAP, timeframes.
5. Selecting: which stock today, which day type, scanner and watchlist, catalyst.
6. Their own playbook: recognizing setups with context, entry, stop, target and invalidation.

**Risk and mindset**

7. Position size from risk *and* account, plus R, win rate and expectancy.
8. **Variance:** a good decision is not a good outcome. Sample size and drawdown belong here too.
9. Daily limits, a reset routine, recognizing tilt in themselves.
10. Journal and review: measuring themselves by their own numbers, not by single trades.

**The step into practice**

11. Account types:
    - cash and margin accounts;
    - short selling needs a margin-enabled account;
    - settlement;
    - the pattern-day-trader rule in the US;
    - what is offered in Europe (recognize leveraged products, do not use them).
12. What you need: real-time data, an order platform, a simulator. Generic, no product names.
13. How to judge a broker: regulation, deposit protection, cost structure, order types, short selling. No recommendation.
14. Profits are taxable, and the rules differ by country. The question belongs to a tax adviser; the app names neither rules nor rates.
15. The way into practice:
    - 30 (scalping, day trading) or 90 (swing) days on a simulator, following a plan;
    - then the smallest real size;
    - size up only with evidence from the journal.
16. Warning signs: signal groups, "gurus", pump-and-dump, promises of guaranteed returns.

### Variance – how the app explains that correct decisions lose

Today only 12 of the 338 correct long/short/buy decisions end in a loss, and in Chapters 1–4 not a single one does. That teaches "right = profit".

From now on, **30–40 %** of correct directional decisions lose, as in real trading. On its own that would confuse. So there are five building blocks that belong together:

1. **Explain it first.**
   - New lesson **1·2-4 "Good Call, Bad Luck"** (stage `VARIANCE`).
   - ~~With a variance simulator: the learner "trades" 10 trades of a good setup, sees winners and losers mixed together, runs it several times and then sees 100 trades.~~ **Dropped (David, 2026-10-03):** "this would imply the number given (like 6/10 are right) are reliable and I don't want this. The user should do his own research on how often strats work for him." The lesson uses the learner's own first right call that loses and the decision grid instead (`docs/ContentToDo.md` 4.1).
   - The message: one trade says almost nothing; the decision counts, the outcome varies; how often a method works, your own record tells you.
2. **Separate them in every reveal** (`docs/UI.md` §5.1b).
   - At the top, the grade of the *decision*: green, amber or red.
   - Below it, smaller, the *outcome this time*: +/− $.
   - For "right, but lost" an extra line, **without a rate** (David, 2026-10-03): "Right call — this trade lost anyway. One trade says little; judge the decision, not the result." Plus a "Why?" link to the card from 1·2-4.
   - The decision grid (`DESIGN-REVIEW`): a small 2 × 2 of decision against result, with this trade's dot in its cell.
3. **Right stays right.**
   - A correct decision that loses counts fully as correct: full XP, no mistake, a perfect run is still possible.
   - The outcome never affects the grade.
4. **Ramp up slowly** (`docs/agent.md` §3.11).
   - Chapter 1 before 1·2-4: no losers.
   - Chapter 1 after it: about 20–30 %, never two in a row.
   - From Chapter 2 on: 30–40 %.
   - From Chapter 3 on, every directional decision has a visible stop and target, so "hit by the stop" is something you see.
5. **Keep coming back to it.**
   - The lesson summary shows "Decisions 7/8 right · Results: 4 winners, 3 losers".
   - The statistics measure decision quality, never profit.
   - Chapter 6 (expectancy, probabilities) teaches how to measure a method from your own journal and simulator sample. Its numbers are examples for the arithmetic, and say so.
   - **No reliable-looking odds, anywhere** (`docs/agent.md` §3.11): no screen states how often a setup or a strategy wins as a fact. The 30–40 % above is how realistic the content's charts are, never a number the learner reads.

### Fun – how we measure it

Checked in the stages of Phase C, Phase D and in the beta:

- **Pace:**
  - A lesson takes 3–4 minutes, and no screen asks for more than ~20 s without interaction.
  - Feedback starts at once (< 100 ms). The motion itself is calm and high quality (decision H): unhurried, smooth on cheap phones, and never in the way, because a tap finishes or skips it.
- **No dead ends:** mistakes lead to repetition, not to lockouts. Hearts only exist in tests.
- **Every lesson ends with a small win:** a recap, a checklist, your own plan, the streak.
- **Variety:** ≥ 3 question types per lesson, pictures instead of text slides.
- **Visible progress:** ~~the daily goal in words,~~ a streak with states (one lesson a day keeps it), tiers and their card, the chapter medals, the skills collected.
- **Beta bar:**
  - Testers rate "fun" at ≥ 4 out of 5 on average.
  - They finish ≥ 85 % of the lessons they start.
  - They answer the comprehension questions (variance, position size) ≥ 80 % correctly.

### Definition of done for release v1.0

All of this must hold at the same time:

- **Content:**
  - Chapter 1 and all three paths, Scalping, Swing Trading and Day Trading, are complete (decision E).
  - The validator is green with `--strict`.
  - The reviews are worked through: `KNOWLEDGE` and `REVIEW-A` for scalping, `SWING-REVIEW`, `DAY-REVIEW`, and the expert review (`EXPERT`).
- **Practice arena:** the Daily Chart, replays, setup drills and the practice account, for all three paths (Phase G, `ARENA-PATHS`).
- **App:**
  - 0 crashes in the render test of all screens, in every launch language.
  - Crash-free ≥ 99.5 % in the beta.
  - All must-fix items of the review (`docs/review-2026-09-25.md`) are done.
- **Learning loop:**
  - ~~Hearts only in tests.~~ Hearts in every lesson and test, with practice free and giving one back (David, 2026-10-04).
  - Practice tab with heart refill, review cards and glossary.
  - ~~Daily goal,~~ Streak (one lesson a day) and reminders.
  - Statistics with decision quality.
- **Account and money:**
  - Sign-in and sync, account deletion and data export inside the app (decision K).
  - Nutrade Plus: unlimited hearts, no ads, the full arena (decision I). The free app is complete without it.
  - Ads only where `ADS` allows them, and never for financial products or gambling.
- **Languages:** every launch language passes the automatic checks and the native speakers' check of its key texts (decision M, Phase J).
- **Legal:**
  - The risk note in every place listed in `docs/agent.md` §7.
  - Legal page, the business's imprint (decision P), privacy policy (account, analytics, ads, subscription) and terms of use, reviewed by a lawyer.
- **Store:**
  - Name and icon after the conflict check (decision L), screenshots and texts in every launch language, privacy details, age rating.
  - TestFlight passed, and Google's closed test where the account type requires it.
- **You have accepted every stage.**

---

## 1. How to work with this plan

### How a stage runs

**One stage = one Claude Code session = one pull request.**

(From 2026-09-26 to 2026-10-03 the stages ran as threads in the Claude project. David moved back to plain sessions on 2026-10-03: a fresh session per stage, started by him.)

1. **Open a session:** Claude Code (the app or claude.ai/code) → repository `DavidMeier754/Trading-App` → new session. A session starts with the repository and nothing else; `CLAUDE.md` tells it what to read.
2. **Set model and effort before you send the prompt** — the stage's "Model · effort · sessions" line says which:
   - `/model opus` (= Opus 5.5), `/model fable` (= Fable 5.1, if your plan has it), `/model sonnet` (= Sonnet 5).
   - `/effort high`, `/effort xhigh` or `/effort max`.
   - **Important:** Opus 5.5 defaults to `medium`. Set the effort deliberately every time.
   - Where it says "plan mode": Claude shows its plan first; you read it and approve it before anything is built.
3. **Paste the prompt:** the stage's prompt from its code block, unchanged. You fill in the placeholders in `[…]` (e.g. `session 2`). For stages with "You prepare" material (a critique, feedback, an export), paste it under the prompt or attach it.
4. **Claude works:**
   - on the branch the session creates;
   - opens a draft PR against `main` (stacked on an open PR's branch only when the stage builds on work that is not merged yet, and then it says so);
   - drives every check to green;
   - writes the report in the session, with **your test checklist** and real links to the preview.
5. **You test** on your phone and answer **in the same session**:
   - `OK <STAGE> – merge` → Claude merges the PR once every check on it is green (merge rule in `CLAUDE.md`), and the stage gets its ✅ in section 2. You can also merge the PR yourself on GitHub.
   - or a list of problems (template "Bug report", Appendix A) → Claude fixes them in the same session and PR, and you test again.
6. **Next stage = new session.** A fresh context is more accurate and cheaper. A stage with several sessions in section 2 gets one session per part (`session 1`, `session 2`), each with its own PR.
7. **Where to look:** the PR on GitHub shows the stage's state (its checks, the preview link, the report as its description). Questions about a running stage go into its session.

### Which model for what

| Model | Command | For | Usage |
|---|---|---|---|
| **Opus 5.5** | `/model opus` | The default for code and content, everything that takes judgment | medium |
| **Fable 5.1** | `/model fable` | The hardest tasks: the knowledge audit, full reviews, design directions. Only where the plan says so. | high (≈ 2.5× Opus) |
| **Sonnet 5** | `/model sonnet` | Mechanical work that follows a clear pattern (configuration, store metadata) | low |
| Haiku 4.5 | `/model haiku` | **Never for content with numbers.** At most for hunting typos. | very low |

If your plan does not include Fable 5.1, use Opus 5.5 with `/effort max` there instead.

### Which effort when

| Effort | When |
|---|---|
| `medium` | Only small mechanical sessions, never content |
| `high` | The default |
| `xhigh` | Design, didactics, legally sensitive texts, architecture |
| `max` | Audits where correctness matters more than time |

Tip: write `ultrathink` into a single message when Claude should think harder at one point. The session's effort stays the same.

### Rules for every session

These rules are in `CLAUDE.md`; the prompt does not have to repeat them.

- **Only the session's own stage.** Anything noticed that belongs to a later stage goes into the report, not into the code.
- **The standard checks run before the report** (below), and all are green.
- **The report**, in this order:
  1. What was built.
  2. Check results.
  3. Your test checklist, with real preview links.
  4. Open questions.

  Then **the session stops** and waits for you.
- **Everything in English:** code, content, docs, commits, PR texts and reports.
- **Never push to `main` directly.** Always a PR, unless you explicitly say otherwise.
- **Content sessions read `docs/ContentToDo.md`** as well as the four docs, and tick what they did there.

### Standard checks

Claude runs them before every report; from stage `CI` on they also run automatically on every PR.

```bash
python3 tools/validate_content.py          # 0 errors
python3 tools/test_validate.py             # every validator rule still fires
python3 tools/check_sizing.py --summary    # 0 positions over the cap
npm run typecheck                          # TypeScript clean
npm run lint && npm test                   # from stage CI on
npm run smoke                              # from stage WIRE on: every screen renders
```

**After every content stage, three checks by hand as well.** The validator cannot see these things, and that is exactly where real errors were found before:
1. Recompute one chart question completely.
2. Check one callback against the lesson it refers to.
3. Read one lesson as a beginner would. Boredom does not raise a warning.

### How you test

- **Preview:**
  - From stage `CI` on, every PR gets a link (web preview, for your phone).
  - From `CI` part B on there is also a QR code for Expo Go: real haptics, real sounds.
- **Deep links open any screen directly:**
  - `<preview>/#level-09-2/3` = Chapter 1, Level 9, lesson 2, screen 3.
  - `#scalping-ch3-level-15-2/5` = Scalping Chapter 3.
  - `#all-screens/12` = test bench.
  - Append `?look=neoMono` or `?look=classicContrast` = a different look, `?theme=light` a different theme.
- **Testing tools** (test builds only: every development run, so Expo Go, and exports with `EXPO_PUBLIC_TEST_TOOLS=1`) under Settings → Testing:
  - "Skip ahead" jumps to any level.
  - "Refill hearts" refills the hearts.
  - "Every screen type" opens the test bench.
  - "Animations" plays the animations of rare moments on a tap: a level opening, lesson complete, a perfect run, a chapter's badge, a new tier, the flame, a lost heart (from `LOOK-BRIEF`); from `DESIGN-REVIEW` also a chapter's medal, the tier card turning over, skills flying into Practice and the mistakes deck.
  - "Design suggestions" shows ideas for the look before they go in (from `LOOK-BRIEF`).
  - "New designs" plays a lesson made in code with every content field the content does not use yet: stop and target with the R ruler, chart notes, the open, a market alert, a checkpoint briefing, skills (from `DESIGN-REVIEW`).
  - "Show the first trade" opens the first-run decision again (from `DESIGN-REVIEW`).
  - From `LOOP-DAILY` on there is "Advance a day".
- **Test on your phone**, not on your computer. The checklists below are written for that.
- **A feeling is enough.** If something bothers you but you cannot say why, describe it in words ("sluggish", "cheap", "confusing") with a screen link.

### When something goes wrong

- **CI is red and Claude cannot get further:** a report with the cause, then stop. No building around it.
- **A stage gets too big:** Claude splits it, adds the rest as a new stage to this plan (in the same PR) and asks you.
- **A decision is missing:** Claude asks instead of guessing. Open decisions are in section 4.

---

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
| | `DESIGN-REVIEW` | 50 design ideas for David's verdict; the approved ones built (chart reveal, map, hearts, mistakes round, skills, Practice, Account, rewards, first trade); every doc and this plan brought up to date; `docs/ContentToDo.md` | Opus 5.5 · high | 1 (+ fixes) | 45 min |
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
| E Scalping content | `CONTENT-DESIGN` | The test bench learns the new content fields (`docs/ContentToDo.md` 4.9) | Opus 5.5 · high | 1 | 10 min |
| | `RULES` | Your content critique, new validator rules, a worklist per chapter | Opus 5.5 · high | 1–2 | 30 min critique + 10 min |
| | `VARIANCE` | Lesson 1·2-4 without a simulator and without odds, the decision-vs-outcome summary, the first losers in Chapter 1 | Opus 5.5 · xhigh | 1–2 | 30 min + newcomer test |
| | `OFFER` | Chapter 8 Level 15 (account types, margin, PDT, settlement, tax note) + renumbering + market profiles | Opus 5.5 · xhigh | 1–2 | 20 min |
| | `CONTENT-FIX-1` … `-8` | All content corrections, one chapter per stage | Opus 5.5 · high | 8–12 | 20 min each |
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
| Content | Chapter 1 (48 lessons, including the path choice) + Scalping Chapters 2–8 (340) = **388 lessons, 5,109 screens**. Day Trading and Swing: outlined only (`docs/curriculum.md`). |
| Gaps in the content | Chapter 8 Level 15 is missing (4 lessons, stage `OFFER`). Lesson 1·2-4 (variance) is newly planned (stage `VARIANCE`). |
| App | On `main` since PR #13 was merged (2026-09-25). Plays every written lesson since stage `WIRE` (388 lessons, 5,109 screens); the render test finds 40 known crashes, fixed in `STABLE-DATA`. |
| Render test of all 5,109 screens | **40 crashes** (all `depth-ladder`, in 38 lessons, three of them final exams) and **15 screens with a missing price line** (`NaN`). Both are fixed in `STABLE-DATA`. |
| Tools | Validator: 0 errors, 3 warnings. Self-test 110/110. Sizing: 0 of 572 positions over the cap. |
| Missing entirely | CI, app tests, onboarding, risk note, legal texts, glossary, practice tab, statistics, backend, store setup, branding |
| Review | `docs/review-2026-09-25.md`: 17 must-fix, 54 should-fix, 14 could-do items, 25 doc items (W). Appendix F assigns every item to a stage. |
| Decisions | A–C, E, H, I, K, L, M, O and P are made; N and Q–T are open (§4). |
| **Update 2026-10-03** | `LOOK-SYSTEM` is built (PRs #20 and #21 open, waiting for `EXPO_TOKEN` for item 9). `DESIGN-REVIEW` built David's approved designs on top of it (PR stacked on #21). Content unchanged since 2026-09-25: still 388 lessons, 0 validator errors. Open decisions: N, Q–V and X (§4.2). |

---

## 4. Decisions

### 4.1 Made

| # | Decision | Where recorded |
|---|---|---|
| A | **The course ends with a person who can start, not just with a paper process.** From your goal "after the course only practical experience is missing": the course teaches all knowledge up to the first real trade (graduate profile, points 11–16). Still: no product names, no recommendation, no profit promises, the simulator comes first. | `docs/agent.md` §1.1 |
| B | **123 shorts, option (a):** we name the account and keep the content. Short selling needs a margin-enabled account; 1·12, 1·13 and 8·15 say so. | `docs/agent.md` §3.6 |
| C | **Six trades per session, option (b): we say it plainly.** Several day trades per session need a margin account, and in the US the pattern-day-trader rule applies below $25,000 (check before release, the rule is being reformed). EU-DE has no PDT rule, but broker rules differ. Said in 6·9 and 8·15. | `docs/agent.md` §3.6 |
| E | **All three paths in v1.0:** Scalping, Swing Trading and Day Trading (David). Swing is written first, then Day Trading (Phase H). Every path gets the same reviews and its own arena content. | agent.md §1, curriculum.md |
| H | **Motion: calm and high quality** (David). Slower than a typical game, smooth on cheap phones, and never in the way: feedback starts at once, and a tap finishes or skips any motion. How calm: Calm's pace, chosen in `LOOK-BRIEF`; the exact durations and curves come from `LOOK-SYSTEM`. | UI.md §1, §5.1, §10 |
| I | **Money: Nutrade Plus** (David), a subscription with unlimited hearts, no ads and the practice arena: hands-on charts beyond the paths (the concept is in Phase G). Free: every lesson of every path, the Practice tab, glossary, statistics, the Daily Chart and a taste of the arena, with ads between lessons and 5 hearts in tests. Guardrails: nothing is sold one at a time (no hearts, no streak freezes), no pay-to-pass, no fake urgency. | agent.md §1, UI.md §7.7, §7.8 |
| K | **Accounts in v1.0** (David): sign-in with Apple, Google or email, sync across devices, account deletion and data export inside the app. The app works before sign-in, and a purchase never needs an account. | agent.md §1, `BACKEND` |
| L | **The name is Nutrade** (David, 2026-09-26): short, built from "trade", for new traders. Tradle was dropped: it is a registered EU trademark for apps and education (classes 9, 41, 42), and its US filing covers trading education. Checked for Nutrade on 2026-09-26: no app in the App Store or Google Play, and no live trademark for apps, education, finance or software (classes 9, 36, 41, 42) in the EU, Germany, the UK, the US or the international register. The name is in use elsewhere, though: a German maker of vitamin gummies holds NUTRADE for supplements and business services (classes 5 and 35; Germany, UK, international) and uses nutrade.de, and Syngenta holds NUTRADE in Mexico (including class 42). nutrade.com is parked with a domain seller, nutrade.app was registered in May 2026; nutradeapp.com, nutradeapp.app and nutradeapp.de were free. `BRAND` confirms this with the lawyer, files the mark and settles the web address. | agent.md §1, `BRAND` |
| M | **Every launch language in v1.0** (David): built in English first, then translated before the release by a checked AI pipeline, with the key texts read by native speakers (Phase J). More languages, more markets. The language never decides the market (`MARKETS`). | agent.md §1, UI.md §9 |
| O | **You find the testers** (David): at least 12 if your Google account is a personal one (Google's closed test), at least 3 without trading knowledge, and for `BETA-2` native speakers of the launch languages. | `BETA-1`, `BETA-2` |
| P | **The provider is a business registered in Germany** (David), before publishing. Recommended: register it **before `STORE-SETUP`**, so the developer accounts are opened once, in the business's name. The legal form (decision Q) decides how you enroll: a sole proprietorship enrolls with Apple as an individual and sells under your own name; a legal entity (e.g. UG or GmbH) enrolls as an organization and needs a D-U-N-S number (free, can take up to 30 days). A Google organization account needs one too, and is exempt from Google's 12-tester rule. | `LEGAL-DRAFT`, `STORE-SETUP` |
| W1 | ~~**Hearts only in checkpoints and final exams.** Lessons are for practicing: wrong answers come back in the mistakes round at the end (W25).~~ **Reversed by David, 2026-10-04:** "I want the hearts to go away even if it isn't a checkpoint level." Hearts are spent in every lesson and test; practice is free and gives one back. | agent.md, UI.md §5.2 |
| W2 | **This order:** the app stable and good-looking before new content. W2b (Swing before replays and drills) no longer sets a priority: since decisions E and I, Swing, Day Trading and the arena all ship in v1.0. The arena engine comes first (Phase G), so each new path gets its arena content right after its chapters. | this plan |
| W3 | **The 50 % plan value, option (a):** Chapter 1 stays at 50. The scalping path revises the value to 95 in **2·1-4**, with the reason (the revision was meant for Chapter 3, but never existed in the content). | agent.md §3.6, curriculum.md |
| W4–W6 | **Layout and looks:** answers in the thumb zone. A minimum type size, scrolling if needed. At most 3 looks plus light/dark/system. **The look** (David, `LOOK-BRIEF`, 2026-09-29): Calm on today's designs Neo, Neo Mono and Classic Contrast, with Precise's number face, chart, trade log, count-up numbers and step count; today's path map with his changes; fewer words on every screen; sounds play on silent. | UI.md §2, §7.1, §7.2, §10 |
| W7 | **No leaderboard in v1.0.** Later at most an opt-in friends league. | UI.md §7.2, §11 |
| W8 | **"See the card again"** as an overlay in lessons. | UI.md §2 |
| W9 | ~~**A choosable daily goal** (1/2/3 lessons, default 2). The streak counts when your own goal is met.~~ **Replaced by David, 2026-10-04:** one lesson a day keeps the streak; no goal to choose. | agent.md, UI.md §5.3 |
| W10 | **Body text ≤ 150 characters** per screen. | agent.md §3.9, UI.md §9 |
| W11 | **Replays earn ¼ XP**, "Skip ahead" earns no XP. | UI.md §5.3 |
| W12–W14 | **Variance rule, sign rule, recap reference.** | agent.md §3.11/§3.12, schema.md |
| W15 | **Match:** one wrong tap gives amber (counts as correct), two or more are wrong. | UI.md §4.1 |
| W16–W18 | **US English.** The label "Takeaway" for closing screens. Skills cleaned up; `docs/` win over skills. | agent.md, schema.md, CLAUDE.md |
| W19 | **Every UI string through i18n keys** (from `ONBOARDING`); every launch language before the release (decision M, Phase J). | agent.md §1, UI.md §9 |
| W20 | **The mascot stays dropped.** Not recommended; can be decided again at any time. | agent.md §1 |
| W21–W25 | **Content and checks:** an explanation per wrong option. New validator rules (tells, formats). A visual quota. App checks in CLAUDE.md. The mistakes round. | schema.md, agent.md, CLAUDE.md, UI.md §4.5 |

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
| X | Mistakes reviews: your note "a previous mistakes level 2 or 3 times per level". Read as **per chapter**, built as **optional side stops before each Checkpoint and the Final Exam**. Should they instead be required levels on the path, or more frequent? | Keep them optional side stops: mistakes cost nothing in this app (W1), and a required review would make a mistake cost a level. If they get skipped too often, the beta will show it. | `LOOP-HEARTS` |

---

## How each stage is described

- **Goal:** what is different afterwards.
- **Scope:** what gets built, with review numbers (`M…`, `S…`, `K…`, `W…` from `docs/review-2026-09-25.md`).
- **Not in this stage:** where needed.
- **You prepare:** if something is needed from you.
- **Model · effort · sessions.**
- **Prompt:** ready to copy.
- **Claude checks automatically.**
- **You test:** your checklist. Claude puts the exact links in the report.
- **Done when.**

Every prompt follows the same frame (Appendix E.0). That keeps them short: the details live in this file, and Claude reads them.

---

## 5. Phase A – Foundation

### `MERGE` ✅ – PR #13 into `main`

Merged on 2026-09-25 (merge commit `52f0811`). Since then `main` holds the app and the current state of all docs.

### `DOCS` ✅ – plan and docs

Also done on 2026-09-25:
- this plan;
- the review report as `docs/review-2026-09-25.md`;
- all decisions from section 4.1 written into `docs/agent.md`, `docs/UI.md`, `docs/schema.md`, `docs/curriculum.md`, `README.md`, `README-app.md` and `CLAUDE.md`;
- the skills cleaned up (W18);
- the whole project in English.

### `CI` – automatic checks and preview

Done on 2026-09-26 (PR #15). Checks run on every PR, the Cloudflare Pages preview is connected. Part B (Expo Go) is not set up yet: it moved to `LOOK-SYSTEM` (item 9 there). Branch rules are replaced by the merge rule in `CLAUDE.md`, because GitHub Free does not enforce them on private repositories.

**Goal.**
- No error reaches `main` unnoticed any more.
- You can test every PR on your phone.

**Scope**
1. **GitHub Actions `ci.yml`** on every PR and every push to `main`:
   - Python: `validate_content.py` (0 errors), `test_validate.py`, `check_sizing.py --summary` (0 breaches), `build_drill_batch.py --check`.
   - Node 22: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, web build (`npx expo export --platform web`).
   - Under 10 minutes, with caches. Background: private repositories get 2,000 Actions minutes per month on GitHub Free.
2. **ESLint** (Expo configuration) and **Prettier**. Prettier only checks; formatting the existing code once is a commit of its own.
3. **Jest** (`jest-expo`) with first unit tests for the most delicate places:
   - `src/lesson/answers.ts`: every question type right, wrong, amber.
   - `parseNumeric`: multiplication before addition, minus, decimals.
   - `src/progress.ts`: a heart exactly after 4 h, the streak across day boundaries and time zones, XP with the perfect bonus.
4. **Testing tools only in test builds** (S41):
   - `EXPO_PUBLIC_TEST_TOOLS=1` enables Skip ahead, Refill hearts and the test bench. Release builds do not show them (`docs/UI.md` §11.5).
   - `skipTo` no longer awards XP (W11).
5. **Preview per PR, part A (required):** Cloudflare Pages.
   - Free, works with private repositories, builds every PR automatically and posts the link on the PR.
   - Build command: `npx expo export --platform web --output-dir dist`.
   - Output directory: `dist`.
   - Environment variables: `NODE_VERSION=22`, `EXPO_PUBLIC_TEST_TOOLS=1`.
6. **Preview in Expo Go, part B** (recommended, at the latest before `LOOK-SYSTEM`):
   - EAS Update per PR with a QR-code comment (`expo/expo-github-action`). That way you feel real haptics and hear real sounds.
   - If Expo Go does not load the SDK version: an Android preview build (`eas build --profile preview`). iOS then comes with `STORE-SETUP` via TestFlight.
7. **Upkeep:**
   - `.github/pull_request_template.md` with the fields stage, what, checks, test checklist (S53).
   - In `package.json`: `"private": true` and `"license": "UNLICENSED"` instead of ISC (S44).

**You prepare.** Claude writes the exact click-by-click guide into the report.
- Create a Cloudflare account and connect the Pages project to the GitHub repository (about 10 minutes).
- Optional for part B: create an Expo account, generate an access token and store it as the GitHub secret `EXPO_TOKEN`.
- Recommended: GitHub → Settings → Branches → rule for `main` → "Require status checks to pass".

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage CI from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "CI" section of docs/build-plan.md in full.
Build exactly that scope — nothing from later stages.

Especially important:
- The Actions stay under 10 minutes (caches); the repository is private.
- Format existing code with Prettier only in a commit of its own.
- The unit tests test edge cases (minus, day change, a heart exactly after 4 h), not only the normal case.
- Once, deliberately introduce a validator error, show that CI turns red, and remove it again.
- Write me a step-by-step guide for Cloudflare Pages (and for Expo, if you get part B done).

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · what I have to set up · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- CI green on the PR.
- At least 30 unit tests.
- The web build succeeds.

**You test (~15 min)**
1. On the PR on GitHub, under "Checks": everything green (Python, TypeScript, lint, tests, build).
2. Open the preview link on your phone: the app starts, lesson 1-1 is playable.
3. In the preview: Account → Settings → "Testing" is there, "Skip ahead" works.
4. (Part B) Scan the QR code with Expo Go: the app runs, haptics can be felt.
5. In the report: the deliberately red run is visible.

**Done when** every PR has green checks and a preview link, and you have opened the link on your phone.

### `WIRE` ✅ – wire everything in, test every screen

Done on 2026-09-27 (PR #16). All 388 written lessons are on the map; `npm run smoke` opens all 5,158 screens and the CI job "Render" reports on every PR (not blocking until `STABLE-DATA`). Found beyond the known 40 crashes and price-line `NaN`s: 5 `cost-stack` screens that print `NaN` (→ `STABLE-DATA`). For `OFFER`: renumbering Chapter 8 Levels 15–17 changes their entry ids, so saved progress on them needs mapping.

**Goal.**
- Everything that is written is playable.
- A test opens every single screen.

**Scope**
1. **A generated content index instead of 58 hand-written imports** (M13, S38):
   - `npm run gen:content` builds the index of all lessons, chapters and entries from `content/**`.
   - `src/content.ts` uses it.
   - CI checks that the index is up to date.
2. **All Scalping Chapters 2–8 on the map.** Chapter 8 Level 15 comes with `OFFER`.
3. **Make the path choice honest** (S27): Day and Swing still show "Being written", now with one honest sentence. Both come before the release (decision E).
   - Scalping needs time at the market open.
   - Whoever does not have that time can flag interest in Swing. That is a local flag; the reminder comes with `LOOP-DAILY`.
4. **Design the end of the content** (S26): no "soon" without context, but an honest sentence and, later, the way to practice.
5. **Render test `npm run smoke`** (Playwright, Chromium):
   - Builds the web export with the testing tools and opens **every** screen by deep link.
   - Reports crashes (the error page), console errors (e.g. `NaN`) and blank screens.
   - Writes `smoke-report.json` and a contact sheet per chapter as CI artifacts.
   - `?test=1` switches animations off. Target: all screens in under 10 minutes.
6. **CI job "render":**
   - Runs on changes in `src/`, `content/` and `demo/`; on content-only PRs only for the affected chapters.
   - **Not blocking** until `STABLE-DATA` (the 40 known crashes), mandatory afterwards.
7. **Correct the test-bench subtitle** ("all 36 archetypes") to the real count (S51).

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage WIRE from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "WIRE" section of docs/build-plan.md in full, plus docs/UI.md §7.1 and §11.4.
Build exactly that scope — nothing from later stages.

Especially important:
- Existing players must not lose progress: the entry ids of lessons already wired in stay the same.
- The render test must open every screen of every lesson — count them and compare with `python3 tools/validate_content.py --status`.
- Until STABLE-DATA the render job is not blocking; its report still appears on the PR.

Open a PR against main and get every check green.
Report: what you built · check results (including the render numbers) · my test checklist with real links · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- `npm run smoke` reports exactly the known problems (40 crashes, 15 `NaN`) and nothing new.

**You test (~20 min)**
1. Map: Chapters 1–8 are there; later chapters are locked as usual.
2. Settings → Testing → Skip ahead → Chapter 5 Level 3: play one lesson.
3. Open Chapter 3 Level 15: the error page is **still expected** here and gets fixed in `STABLE-DATA`.
4. On the PR: the "render" job shows the numbers, and the contact sheets are attached as artifacts.
5. App start on your phone: does it feel like under 3 seconds?

**Done when** every written lesson can be reached through the map and the render test reports in CI.

---

## 6. Phase B – Stable

### `STABLE-APP` ✅ – the visible bugs

**Goal.**
- The bugs from the review are gone.
- The reveal separates decision and outcome. That is the basis for teaching variance.

**Scope**
1. **Plan overview** shows the saved plan (M1).
2. **The recap opens the right card** (M4):
   - The renderer uses `points[].card` (new field, `docs/schema.md`).
   - Without it, it takes the lesson's card whose text matches best.
   - `CONTENT-FIX` adds the `card:` values to the content.
3. **Reveal as in `docs/UI.md` §5.1b** (M5, M7):
   - At the top, the grade of the decision (green, amber, red).
   - The opening sentence fits the *chosen* option: never "Standing aside costs nothing" after a buy.
   - The `outcome` sentence from the YAML is shown.
   - The outcome "this time" sits small underneath, with the share count ("+$45.00 on 250 shares").
   - If you stood aside, it is gray and hypothetical ("Had you bought: …").
   - A new state "right, but lost" with the variance sentence from §5.1b. The "Why?" link follows in `VARIANCE`.
   - The only content change in this stage: the explanation in 1·1-1 S6 will fit both choices.
4. **Web accessibility** (M6):
   - Screen readers no longer read the solution in advance (the measuring copy gets `aria-hidden` or leaves the tree).
   - The answer word of `fill-tiles` is no longer in the DOM.
5. **An error page instead of a dead end** (S23):
   - A friendly text and "Back to the map".
   - Technical details only in test builds.
   - A hook for error reports (wired up in `ANALYTICS`).
   - A test route `#debug-crash`, only in test builds.
6. **Unit tests** for the reveal logic: every combination of choice, grade and outcome.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage STABLE-APP from docs/build-plan.md.

Read CLAUDE.md, then §1, §0 "Variance" and the "STABLE-APP" section of docs/build-plan.md in full, plus docs/UI.md §5.1 and §5.1b and items M1, M4–M7 and S23 in docs/review-2026-09-25.md.
Build exactly that scope — nothing from later stages.

Especially important:
- The reveal must be right for every combination: right/amber/wrong × win/loss × traded/stood aside. Put that table into the tests.
- The only content change: level-01-1 screen 6. No other content.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- The new unit tests.
- The render test without new problems.

**You test (~20 min)**
1. `#level-09-2/3` → **Buy**. Expected:
   - Grade amber ("Reasonable").
   - The first sentence talks about the purchase.
   - The sentence about the three price steps when selling is there.
   - "+$45.00 on 250 shares" sits small underneath.
2. `#level-09-2/3` → **Wait**: green; the outcome is gray, as a "would have".
3. `#level-01-1/6` → **Wait**: no "you just made your first trade" any more.
4. Skip ahead to Level 16, play lesson 16-2 to the end and fill in the plan: the overview shows your entries.
5. Play lesson 1-4 up to the recap and tap the first point: the matching card opens.
6. `#debug-crash`: a friendly error page; "Back to the map" works.
7. (Optional, iPhone) Turn VoiceOver on and answer one question in the web preview: no explanation is read out before answering.

**Done when** all seven points hold.

### `STABLE-DATA` ✅ – schema, renderer and validator say the same thing

**Goal.** Every one of the 5,109 screens renders, and it stays that way.

**Scope**
1. **`depth-ladder`** (M2):
   - The renderer reads `data.bids` and `data.asks` as in `docs/schema.md`.
   - The test bench (`demo/all-screens.yaml`) moves onto the schema; it had hidden the bug.
2. **`levels`** (M3):
   - The renderer expects `{price, label}`.
   - The 29 bare numbers in 13 files are rewritten, purely mechanically.
3. **Validator** (S39):
   - Checks the data shape of every component against the table in `docs/schema.md`, at least `levels`, `depth-ladder`, `order-book` and the charts.
   - Checks `demo/all-screens.yaml` as well.
   - Every new check gets a case in `tools/test_validate.py`.
4. **The render test becomes mandatory:** 0 crashes, 0 console errors, 0 blank screens.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage STABLE-DATA from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "STABLE-DATA" section of docs/build-plan.md in full, plus docs/schema.md in full.
Build exactly that scope — nothing from later stages.

Especially important:
- Where schema and renderer disagree, the schema wins — unless the schema is demonstrably wrong; then change the schema first and justify it in the report.
- The content changes are purely mechanical (the shape of the data): no numbers, no text.
- At the end the render job is blocking and green.

Open a PR against main and get every check green.
Report: what you built · check results (render numbers before/after) · my test checklist with real links · open questions. Then stop.
```

**Claude checks automatically.**
- All standard checks.
- The render test with 0 problems.
- The new validator cases fire.

**You test (~15 min)**
1. Skip ahead → Chapter 3 Level 15 → lesson 15-2: the depth ladder can be used.
2. Play the final exam of Chapter 3 (Level 19) through: no error page.
3. `#scalping-ch5-level-07-2/9`: the marked price lines are visible.
4. On the PR: the "render" job is green and reports 0 crashes.

**Done when** the render test is blocking and green.

---

## 7. Phase C – Look & feel

You are not yet happy with the look. That is why look & feel comes **before** the new learning features, and it starts with you, not with code.

### `LOOK-BRIEF` ✅ – your critique and three directions

**Goal.** Decide how the app should look and feel before anything gets rebuilt.

**You prepare.** This is the most important part. Write your critique using this template and paste it under the prompt:
```
What bothers me (screen link + one sentence):
- …
How it should feel (3 words):
Apps whose look I like – and what exactly about them:
Absolutely not:
```

**Scope**
1. **Collect:** your critique, review items S2–S13, S24 and W4–W6, the principles in `docs/UI.md` §1.
2. **Three design directions** as clickable prototypes in the preview (skill `prototype`), e.g. "Calm & clear", "Warm & playful", "Precise & professional".
   - Each direction on six key screens:
     - theory with a picture;
     - multiple choice with its reveal;
     - a chart decision with its reveal, including "right, but lost";
     - match;
     - lesson complete;
     - the map with the HUD.
   - Each direction in light and dark.
   - The name "Nutrade" as text; the logo follows in `BRAND`.
   - Reachable under `#prototype/<direction>/<screen>`.
3. **Motion** (decision H: calm and high quality): every direction shows its motion on the six screens — the reveal, a screen change, a chart playing out, lesson complete. Calm but never sluggish: a tap finishes or skips any motion.
4. **Layout variants:** answers in the thumb zone versus today; a proposal for the type scale.

**Not in this stage:** rebuilding the real screens. That is `LOOK-SYSTEM`. One exception, which you chose on 2026-09-29: two text bugs in the real app, from your critique, were fixed here — the stray text and cut-off titles on the map, and the Continue key breaking onto a second line (`LOOK-SYSTEM` items 5 and 6). Also added here at your request of the same day, as testing tools: they show in every development run (Expo Go) without a setting, and an **Animations** page under Settings → Testing plays the animations of rare moments on a tap.

**Model · effort · sessions:** Fable 5.1 · high (else Opus 5.5 · xhigh) · 1–2

**Prompt**
```
Stage LOOK-BRIEF from docs/build-plan.md.

Read CLAUDE.md, then §0 ("Fun"), §1 and the "LOOK-BRIEF" section of docs/build-plan.md in full, plus docs/UI.md in full and items S2–S13, S24, W4–W6 in docs/review-2026-09-25.md.
Use the "prototype" skill for the clickable variants.

My critique:
[paste your template here]

Build three genuinely different directions — not the same thing three times in different colors. Each must fit docs/UI.md §1 (one idea per screen, thumb first, motion only with a purpose).
Change no real screens.

Open a PR against main.
Report: the three directions in three sentences each · links to every variant · the rating table for me · open questions. Then stop.
```

**Claude checks automatically.** All standard checks; the prototype routes render in the render test.

**You test (~30 min)**
1. Click through every direction on your phone and rate each 1–5 for:
   - fun;
   - readability;
   - trust;
   - "I would open this every day".
2. Choose. Mixing is allowed, e.g. "colors from A, type from B".
3. Rate the motion: calm and polished, or sluggish? (Decision H is made; this sets how calm.)

**Done when** Claude has recorded your choice in `docs/UI.md` §10. That happens in the same PR, after your answer.

### `LOOK-SYSTEM` – the chosen direction as a system

**Goal.** Every screen benefits without touching every screen one by one.

**The direction** is your mix from `LOOK-BRIEF` (`docs/UI.md` §10): Calm's layout, type and motion on today's designs Neo, Neo Mono and Classic Contrast, with Precise's number face and the step count beside the progress bar. The home screen wears it too, and the path map keeps today's design with your changes (item 12). Its reference is the prototype `#prototype/mix/<screen>` in a test build. The chart, the trade log and the numbers that count up come in `LOOK-COMPONENTS`; the streak screens and the gems in `LOOP-DAILY`.

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
   - Calm, high-quality motion tokens: durations, easing curves and springs, tuned on real phones and recorded in `docs/UI.md` §10. Calm's pace from `LOOK-BRIEF` is the starting point.
   - A tap never waits for motion: it finishes or skips the running animation.
   - Everything runs on the UI thread (Reanimated) at the display's frame rate, also on a cheap Android phone.
   - Reduce motion replaces movement with short fades.
5. **Controls** ✅ (S13, S12):
   - Tap targets ≥ 48 pt.
   - Quit dialog: "Keep learning" is the main button, and the text says "lesson" instead of "sub-level".
   - A key's label stays on one line and never breaks (your critique: Continue sometimes did). Done in `LOOK-BRIEF` for today's keys (you chose to fix it there): the level card's "Continue: lesson 3" (`src/home/LearnScreen.tsx`) became "Continue", and the lesson key and the level card's key shrink a label that would not fit instead of breaking it. The new keys keep that rule.
6. **Top bar and wording** ✅ (S9, S36):
   - The top bar in your order, evenly spaced: the path's logo, the streak, the gems and the hearts, each an icon with its number (`docs/UI.md` §7.2, `#prototype/mix/map`). The daily goal leaves the bar: the flame lights when today's goal is met, and "Today 1/2" shows on lesson complete and when you tap the flame. The path logos are stand-ins until `BRAND`. The gems were planned for `LOOP-DAILY`; on 2026-09-30 you asked for them now, so they show third in the bar with their count (0 until they are earned; Settings → Testing adds 50 a tap). Earning them stays in `LOOP-DAILY`, what they buy is decision U. On 2026-10-01 you asked for the bar lined up with what is under it and for the logo to choose the path: the logo now sits on the banner's left edge and the hearts on its right edge, and a tap on the logo opens the three paths, the one in use ticked and the ones still being written shut (`docs/UI.md` §7.2). The logo shows the chosen path's icon.
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
    - The testing tools stay in Settings under **Testing** (a Development screen was built first; on 2026-09-30 you asked for them straight in Settings), still in test builds only, with the **Design suggestions** page (today Settings → Testing → Design suggestions): ideas for the look, drawn live, each marked in the mix or not (your wish in `LOOK-BRIEF`), and the **Animations** page (today Settings → Testing → Animations). Every new animation of a rare moment gets a row there. The streak screens were planned for `LOOP-DAILY`; on 2026-09-30 you missed them there and asked for them "real nice fancy", so they are built now (`src/lesson/StreakScreens.tsx`) and play there as "Streak goes up" and "Streak lost". `LOOP-DAILY` shows them in the app's own flow. On 2026-10-01 you asked for "way more" design suggestions, experimental and cool, and built like the Animations page: the page is now a list of ideas in groups, each a row that plays its preview on a page of its own (`docs/UI.md` §10, `src/home/ideas/`).
12. **The path map** ✅ (your answers in `LOOK-BRIEF`, `#prototype/mix/map`):
    - Today's design stays, in the chosen look (you: the list-style maps look too professional and not fun).
    - Smaller level buttons, 58 pt in a 76 pt ring instead of 72 in 96, so small scenes fit at the sides of the path. The scenes are drawn in the ground's own ink, as faint as its grid and with no colour, so they fit the background instead of standing out (your note of 2026-09-29). On 2026-09-30 you asked for the buttons "a little bigger" (now 66 pt in an 86 pt ring) and the drawings faintly in the background rather than next to each level, in several sizes: they are scattered down each chapter, the biggest partly off the screen. On 2026-10-01 you asked to remove the background decoration, so the drawings are gone.
    - Moving on to the next level, smoother and with haptics and sounds (your wish of 2026-09-30): the map glides down while a spark runs the path to climbing notes, the lock rattles and bursts off with sparks and the unlock chime, and START lands with a pop (`docs/UI.md` §7.1).
    - A finished level drops its progress ring and keeps its check; only the level you are on shows a ring.
    - The label beside a level is its title alone, in whole lines (`docs/UI.md` §7.1).
13. **Clean-up** ✅: once the mix is built, `src/prototype/` goes, with its route and its Settings row. The Design suggestions page stays under Settings → Testing (item 11).
    - **The prototype after it is gone.** Where a later stage points to `#prototype/mix/<screen>` or a file in `src/prototype/` (the forming candle and the count-up in `LOOK-COMPONENTS`, the streak screens in `LOOP-DAILY`, the bonus side lesson in `FUN-PASS`), it reads it at commit `a78e210`, the last one that has it: `git show a78e210:src/prototype/kit.tsx`, or `git checkout a78e210` and open `#prototype/mix/<screen>` in a test build.

**Two sessions** (David, 2026-09-30), each its own PR:
- **Session 1, the system:** items 1, 2, 4, 5 (tap targets and the quit dialog), 7, 8, 9 and 10, plus the check scripts (`npm run check:ui`, `npm run sheets`).
- **Session 2, the screens:** items 3, 5 (the key's label), 6, 11, 12 and 13, and the docs that go with them. Its test checklist is items 2, 3 and 7–10 of "You test" below; session 1's is items 1 and 4–6.

**Status** (2026-09-30, checked 2026-10-03): both sessions are built and are tested and merged together: PR #20 holds session 1, and PR #21 (session 2) goes into its branch. On 2026-10-03 both were still open; `DESIGN-REVIEW` is stacked on #21. Items 1–8 and 10–13 are done; item 9 waits for your `EXPO_TOKEN`. Your ten improvements of 2026-09-30 are in PR #21 too, among them two things pulled forward from `LOOP-DAILY` at your request: the gems in the top bar and the streak screens (built, and played on the Animations page). So are the fix for the crash on Animations → Chapter complete and your changes of 2026-10-01: the top bar lined up with the screen under it, the path picker on its logo, no background drawings, and the bigger Design suggestions page. The stage gets its ✅ in section 2 with "OK LOOK-SYSTEM – merge".

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 1–2

**Prompt**
```
Stage LOOK-SYSTEM from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "LOOK-SYSTEM" section of docs/build-plan.md in full, plus docs/UI.md in full (the chosen direction is in §10).
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

### `DESIGN-REVIEW` – fifty ideas, David's verdicts, the approved ones built

**Goal.** Before the remaining look and learning-loop stages, David sees fifty concrete design ideas for the whole app, decides each one, and the approved ones are built — so every later stage starts from his choices instead of guessing them.

**What happened.**
1. Claude went through every branch, played the app and published an artifact with 50 ideas in six groups (in the lesson, charts and market tools, rewards, the map, home and tabs, first run and the look), each with today's screen, a mockup, a short explanation and an approve box (2026-10-02).
2. David decided all fifty and left notes on many (2026-10-03). The table below is the record.
3. This stage built every approved idea, in the form his notes asked for, wrote his notes into the docs, added `docs/ContentToDo.md` for what the level files need (David: "Don't rewrite any .yaml"), brought this plan up to date and moved the work back to Claude Code sessions (§1).

**David's verdicts** (✅ approved and built here · ✗ not taken · 📄 decided, recorded in the docs, built later)

| # | Idea | Verdict | His note, and where it went |
|---|---|---|---|
| 1 | The decision grid in the chart reveal | ✅ | "Make sure the whole screen is filled … the chart bigger and the box a little smaller." Compact reveal with the 2 × 2 grid (`docs/UI.md` §5.1b, §2). |
| 2 | The future behind frosted glass | ✗ | Keep the hatched box, but the frame holds still: the visible line sits in the middle of the chart from the start and the axis never rescales (§6.4). Built. |
| 3 | An R ruler beside the chart | ✅ | Plus: charts start simple and grow, every element explained (`docs/agent.md` §3.8, `ContentToDo.md` 1.2); every "Good call" panel right above the key (§2). |
| 4 | Decision keys with a direction | ✅ | §4.3. |
| 5 | The reveal writes on the chart | ✅ | `notes` (§6.4, `docs/schema.md`). |
| 6 | A wrong option explains itself | ✗ | |
| 7 | Numbers that keep their units | ✗ | |
| 8 | Match pairs tied by a thread | ✗ | No colours per pair; make it fun with animation and haptics instead (§4.1). Built. |
| 9 | Pull the card in from the edge | ✗ | |
| 10 | Key terms with a marker | ✅ | "Don't over or underuse them." Marking rules in §8. |
| 11 | A glossary card with a picture | ✅ (changed) | Skills after every lesson → lesson complete → the cards fly into Practice → Skills by chapter with their info cards (§5.3, §7.3). |
| 12 | Scenes as market alerts | ✅ | `alert` (§3 `story`). |
| 13 | A quiet symbol on text-only cards | ✗ | |
| 14 | The mistakes round as a small deck | ✅ | Plus mistakes reviews, "2 or 3 times per level" (read as per chapter, open question X): side stops before each test (§4.5, §7.1). |
| 15 | A briefing card for checkpoints | ✅ | `facts` (§3 `intro`). |
| 16 | The intro shows what is ahead | ✗ | |
| 17 | The opening bell on the chart | ✅ | Only on charts where the open matters, explained (`session_open`, §6.4). |
| 18 | Turn the phone for a big chart | ✗ | |
| 19 | Watch the order eat the book | ✅ | "Too much going on. Keep it simpler." One movement (§4.2 `depth-ladder`). |
| 20 | A ticket that looks like a broker's | ✅ | §6.7. |
| 21 | Scanner rows with a sparkline | ✅ | Less space between Stock and Today (§6.8). |
| 22 | The tape beside the replay | ✗ | |
| 23 | A slider with ticks and detents | ✗ | "Too much for such a simple question." Became the rule "Don't overdo it" (§1, principle 11). |
| 24 | The lesson as a row of answers | ✗ | |
| 25 | The goal track lights the flame | ✗ | |
| 26 | Collect the takeaway | ✅ (as 11) | The skills of idea 11 instead of takeaways. |
| 27 | Confetti only for a perfect run | ✅ | §5.3. |
| 28 | A shelf of chapter medals | ✅ | Account (§7.4). |
| 29 | An emblem for every chapter | ✅ | Plus: great accomplishments get bigger moments (§1, principle 12; §5.4). |
| 30 | Tiers as materials | ✅ | §5.5, §7.5. |
| 31 | Your learning as a price chart | 📄 | Not in Account: "change the Leaderboard tab to an analytics". In the tabs concept (decision V, stage `TABS`). |
| 32 | The chapter card docks while you scroll | ✅ | §7.1. |
| 33 | Tier gates between chapters | ✅ | Only general info: chapter, name, levels; no tier sentence, no time (§7.1). |
| 34 | The level card lists its lessons | ✗ | |
| 35 | Bonus lessons as side stops | ✅ | In the path's own style; the path a sine curve; buttons and spacing kept (§7.1). |
| 36 | Today's goal on the START tag | ✗ | |
| 37 | The ground follows the market clock | ✗ | |
| 38 | The tabs the plan describes | 📄 | "First don't put this into the app. Give me an artifact where you explain the concept with screenshots." The artifact ["Nutrade tabs concept"](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD); decision V. |
| 39 | Hearts with a refill ring | ✅ | All hearts back after five hours; the ring never covers the count (§5.2, §7.2). |
| 40 | Pull down for Today | ✗ | |
| 41 | A Practice tab with something in it | ✅ | Plus a Skills tab and a Mistakes tab, and everything that must be recorded (§7.3). |
| 42 | The Trader Card | ✗ (changed) | The tier card instead, and All stats (§7.4). |
| 43 | Right calls that lost, in your stats | ✅ | All stats (§7.4). |
| 44 | The first decision before anything else | ✅ | §11.1. |
| 45 | The daily goal as three paces | ✗ (dropped) | ~~Goes into the registration screens; David adds it later (§11.1).~~ Dropped on 2026-10-04 with the daily goal: one lesson a day keeps the streak (§5.3). |
| 46 | A calm risk note | ✗ | |
| 47 | The variance simulator | ✗ | "This would imply the numbers given are reliable … the user should do his own research." No odds anywhere (`docs/agent.md` §3.11); the simulator is dropped. |
| 48 | Your plan as a real document | ✅ | "Make the design better and don't overdo." Account → Your plan, and the `plan-sheet` (§6.8, §7.4). |
| 49 | A face for titles | ✅ | "The title looks too stretched out": Archivo at its normal width (§10). |
| 50 | Two-tone level symbols | ✅ | §7.1. |

**Scope** (all built in this stage's PR)
1. **The chart decision** (`docs/UI.md` §4.3, §5.1b, §6.4): the frame that holds still; keys with a direction glyph; after the choice the entry, stop and target lines, playback ending at the first one touched; the R ruler from the lesson that teaches R; the chart notes; the open marker; the compact reveal with the decision grid and the result line without a rate; the chart as large as the screen allows; every reveal right above the key.
2. **The lesson flow:** ~~hearts only in Checkpoints and Final Exams (W1)~~ hearts in every lesson and test (David's change after his test, 2026-10-04); the mistakes round with its deck (W25); "What you learned" with the lesson's skills; confetti only for a perfect run; back home, the skills fly into the Practice tab.
3. **Screens:** match without colours, with the snap, the rising notes and the closing wave; the depth ladder's walk through the book; the order ticket like a broker's; scanner rows with sparkline and volume bar; the scene as a market alert; the checkpoint briefing; the plan sheet as a document; the term marker and its sheet; the `decision-grid` visual.
4. **Rewards:** a medal with its own emblem for every chapter, as a bigger moment; the tier card in its material, turning over.
5. **Home:** the map as a sine curve; side stops (mistakes reviews now, bonus lessons as soon as their files exist); the docking chapter bar; chapter gates; two-tone symbols; the title face; the heart ring with all hearts back after five hours; the Practice tab (Daily mix with spaced repetition and weak spots, Skills, Mistakes; a finished round gives a heart back); the Account page (tier card, medal shelf, All stats with the variance view, Your plan).
6. **First run:** the first trade, once, before anything else.
7. **The record behind it** (`docs/UI.md` §7.3): every graded question, mistakes, chart decisions, skills, the plan's dates, the longest streak — kept with the progress, `progress.v1` migrated.
8. **Tools:** validator rules and self-test cases for every new field (`docs/schema.md`); bonus files in the content index; Settings → Testing → **New designs** and **Show the first trade**; new rows on the Animations page.
9. **Docs:** `docs/UI.md`, `docs/agent.md`, `docs/schema.md`, `docs/curriculum.md`, the new `docs/ContentToDo.md`, this plan, `CLAUDE.md` and `README.md`.
10. **Not in the app:** the tabs concept (ideas 31 and 38) as an artifact for David's choice (decision V).

11. **After David's test (2026-10-04):** hearts in every lesson; one lesson a day keeps the streak; the path as a true sine; the streak moments in the flow and the flame catching; the medal landing on the shelf; Settings → Testing → **Reset streak**; and the skills: `content/skills.yaml` with every skill and its info, a `skills` line in every level file, `tools/skills.py`, the validator's rules (`docs/schema.md` "Skills").

**Not in this stage:** any other change to a level file or the test bench (David: "Don't rewrite any .yaml" — the `skills` line is the exception he asked for on 2026-10-04); the tab set (decision V); sharing the plan or a card as an image (`ONBOARDING`, `STATS`).

**Status** (2026-10-04): built, waiting for David's test. The PR is stacked on PR #21 (`LOOK-SYSTEM`, session 2), whose branch it starts from; it merges after #20 and #21. The tabs concept is published: ["Nutrade tabs concept"](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD).

**Also done on the way** (found while checking the built screens):
- The words on a chart stay readable: labels sit over the bars on a rim of the page's colour, a level's label takes the end of its line that covers the fewest bars, the stop's and target's labels clear the "decision" tag, and notes and the outcome tag keep off every label (`docs/UI.md` §6.4).
- The docked chapter bar names the chapter whose card it covers, not the one before it, and that card no longer shows past the bar's corners (§7.1).
- A test build opened on any deep link skips the first trade (§11.1).
- Animations has a **Mistakes round** row (§11.5).

**Left for later stages** (each is in its stage's scope):
- ~~The medal just won shining once on the shelf → `STATS`.~~ Built after David's test (2026-10-04).
- ~~The one-line meaning on each skill chip of "What you learned" → `GLOSSARY` (it needs `content/glossary.yaml`).~~ Built after David's test (2026-10-04), from `content/skills.yaml`.
- "What happened next" instead of "NEXT 5 BARS" over the hidden bars, the first trade included → `LOOK-COMPONENTS`.
- The new fields in the level files (`stop`, `target`, `notes`, `session_open`, `alert`, `facts`, scanner `spark`, ladder `shares`, the bonus lessons and the spot-it levels) → the content sessions, from `docs/ContentToDo.md`. (`skills` is written: 2026-10-04.)
- The tab set → `TABS`, from decision V.

**Model · effort · sessions:** Opus 5.5 · high · 1, plus a session for fixes if the test finds any.

**Prompt** (for a follow-up session, e.g. fixes after the test)
```
Stage DESIGN-REVIEW (fixes) from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "DESIGN-REVIEW" section of docs/build-plan.md in full, docs/UI.md in full and docs/ContentToDo.md.
Fix exactly these findings from my test: [list]. Change no level file and not the test bench.

Get every check green on the stage's PR.
Report: what you changed · check results · my test checklist for the fixes with real links · open questions. Then stop.
```

**You test (~45 min)** — Claude puts the exact links in the report.
1. A chart decision in Chapter 1 and one in Scalping Chapter 2: the chart fills the screen, the axis never changes while it plays out, the keys carry their arrows, and the reveal is a small panel right on the key with the grid and its dot.
2. Settings → Testing → New designs: the market alert; stop and target with the R ruler, two chart notes and the open; the same setup stopped out (right call, lost); the decision grid card; scanner rows with their day; the ladder's walk; the order ticket; the match.
3. A lesson with two deliberate mistakes: no heart lost, the deck, the round, then "What you learned", lesson complete without confetti, and back home the cards fly into Practice.
4. A perfect lesson: the gold ring and confetti behind it.
5. A checkpoint: the briefing card, hearts lost on mistakes; all hearts back after five hours (Settings → Testing → Refill hearts resets it).
6. The map: the sine curve, a mistakes review beside the path before the checkpoint, the chapter bar docking under the banner, the chapter gate, two-tone symbols, the heart ring and its tap.
7. Practice: Daily mix, Skills (tap one), Mistakes (play them).
8. Account: the tier card, the medal shelf, All stats with the variance view, Your plan.
9. Animations: Chapter complete (the medal), New tier (the card turning over), Skills into Practice and Mistakes round. Is the medal a big enough moment?
10. A fresh start (Settings → Reset, or a private window): the first trade comes first.
11. The [tabs concept](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD): choose (decision V) and copy the line for `TABS`.

**Done when** David has tested and the PR is merged after #20 and #21.

### `LOOK-COMPONENTS` – the building blocks of every lesson

**Goal.** The building blocks that appear in every lesson look finished.

**Since `DESIGN-REVIEW`** (2026-10-03) some items are done or changed; each says so. What is left fits one session, two if the candles take long.

**Session 1 – charts and reveal**
1. **Axis** (S6):
   - Round prices (0.05 / 0.10 / 0.25 / 0.50 / 1) and the currency symbol from the market profile.
   - The axis does not jump between decision and reveal. **Done in `DESIGN-REVIEW`:** the frame holds still from the first frame, the visible bars in its middle (`docs/UI.md` §6.4).
   - Prices in the number face of the mix (`docs/UI.md` §10).
2. **Decision buttons** (S7):
   - Equal in weight. **Done in `DESIGN-REVIEW`,** with a direction glyph on each key.
   - "What happened next" instead of "NEXT 5 BARS".
   - A text alternative for screen readers, e.g. "Price climbed in steps from 9.80 to 10.05".
3. **Stop and target lines** when a screen has `stop` or `target` (new, `docs/schema.md`), labelled with their prices, and the entry while the learner decides. **Done in `DESIGN-REVIEW`,** with one change: they appear with the choice, not while the learner decides (they would give the direction away); the R ruler, chart notes and the open marker came with them.
4. **State chips** easy to read.
5. **Candles that form** (your critique: the candle animations should move more realistically): a candle opens, runs to its high and low and settles at its close, with a live price tag on the axis, as in `#prototype/mix/chart` (`formingCandle` in `src/prototype/kit.tsx`; both at commit `a78e210`, `LOOK-SYSTEM` item 13). A tap still finishes the playback.
6. **The trade log** in the chart's reveal, from Precise: the outcome, the result and R, lined up in the number face, a neutral block under the grade (`docs/UI.md` §5.1b). Since `DESIGN-REVIEW` it shares its row with the decision grid; keep the panel compact (§5.1b).

**Session 2 – the rest**

7. ~~**Match:** every pair with its own color or connection (S8).~~ **Done differently in `DESIGN-REVIEW`:** David did not want colours or threads; matched pairs snap together with rising notes and haptics and the board ends on a wave (`docs/UI.md` §4.1).
8. **Lesson complete** (S11):
   - Confetti only for a perfect run and never over text. **Done in `DESIGN-REVIEW`.**
   - The lesson's name (`subtitle`) is shown.
   - The mistakes are listed, with "Practice these" (linked from `PRACTICE` on).
   - ~~Progress toward the daily goal is visible.~~ The streak is shown (one lesson a day keeps it). **Done in `DESIGN-REVIEW`.**
   - Its numbers count up to their value, together with the ring (from Precise, your choice in `LOOK-BRIEF`; `#prototype/mix/complete` at `a78e210`). Reduced motion shows them at once.
9. **Chapter badge** as in `docs/UI.md` §5.4: the XP bonus counts up, "Chapter N unlocked" (S21). **Done in `DESIGN-REVIEW`,** as the chapter's own emblem medal with the next chapter named.
10. **Visuals** (S24, W17):
    - The ownership graphic as a 10×10 grid from 20 parts upward.
    - Real icons for all 51 carousel icon names (e.g. the `lucide-react-native` library, MIT license, plus a mapping table).
    - The session ribbon to scale and with a "now" marker.
    - `spot-mistake` as one sentence.
    - The swipe gesture in `swipe-deck`.
    - The label "Takeaway" for a `story` with `label: takeaway`.
11. **Level icons on the map** (your critique; you like Chapters 1 and 2's): a level's symbol is the first `icon:` among its lessons (`levelIconOf` in `src/content.ts`). Chapters 1 and 2 set one in 44 of 48 and 46 of 49 lesson files, Chapters 3–8 in none of their 291, so every level there shows the same symbol for its type. Every level of every chapter gets its own symbol for what it teaches, and the validator warns when a level has none.

**Model · effort · sessions:** Opus 5.5 · high · 2

**Prompt** (for each of the two sessions; insert `[1]` or `[2]`)
```
Stage LOOK-COMPONENTS, session [1|2], from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "LOOK-COMPONENTS" section of docs/build-plan.md in full, plus docs/UI.md §4–§6 and docs/schema.md (components).
Build only the items of the named session.

Especially important:
- Nothing moves that the learner did not move (docs/UI.md §2).
- Icons: a mapping table icon name → symbol for every name the content uses; the validator rejects unknown names.

Open a PR against main and get every check green.
Report: what you built · check results · contact sheets · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min)**
1. `#level-01-1/6`: the axis shows round prices with $, and nothing jumps after the decision.
2. ~~A match in the test bench: the pairs are colored.~~ (tested in `DESIGN-REVIEW`)
3. Finish one lesson perfectly and one with mistakes: confetti only for the perfect one, the list of mistakes is visible.
4. The carousel in lesson 1·6-1: real icons instead of letters.
5. The session ribbon in lesson 1·10-1: the proportions are right, "now" is visible.
6. Swipe a `swipe-deck` with your finger.
7. The Chapter 1 badge (skip ahead to the final exam 17-1).
8. A chart decision (e.g. `#level-01-1/6`): the candles form as they play out, a price tag follows the forming one, and the reveal lists outcome, result and R.
9. The map: the levels of every chapter, Chapters 3–8 too, have their own icons.
10. Lesson complete: the numbers count up with the ring.

### `VISUALS` – new teaching graphics

**Goal.** The most important concepts are shown, not just described (S1, `docs/UI.md` §1 principle 5).

**Scope**
1. **Two new components** as in `docs/UI.md` §6.8:
   - `candle-anatomy`: one candle with open, high, low, close, body and wicks labeled; the labels appear one after another.
   - `trade-plan`: entry, stop and target as lines with their distances, plus R and a risk/reward bar.
2. **Both** in the test bench, in `docs/schema.md` (component table) and in the validator.
3. **Not built into lessons yet.** `VARIANCE` and `CONTENT-FIX` do that; the visual quota from `RULES` applies there.
4. **`decision-grid`** (`docs/UI.md` §6.8) is already built, in `DESIGN-REVIEW`: lesson 1·2-4 uses it.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage VISUALS from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "VISUALS" section of docs/build-plan.md in full, plus docs/UI.md §6 and docs/schema.md (components).
Build exactly that scope; no content except the entries in demo/all-screens.yaml.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min).** Both components in the test bench on your phone:
- Are they understandable without explanation?
- Are light and dark both right?

---

## 8. Phase D – Learning loop and fun

### `LOOP-HEARTS` – mistakes cost nothing, tests count

**Goal.** Learning without fear: mistakes in lessons come back instead of locking you out. ~~Hearts exist only in tests.~~ Since 2026-10-04 hearts are spent in every lesson and test (David); what keeps learning open is practice, which is free and gives a heart back, and the review cards.

**Since `DESIGN-REVIEW`** (2026-10-03) items 1 and 2 are built, with David's deck and his heart rule (all hearts back five hours after the first is lost); the stage keeps the rest. Decision X (mistakes reviews) is answered here at the latest.

**Scope**
1. ~~**Hearts only in checkpoints and final exams** (W1, `docs/UI.md` §5.2).~~ **Done in `DESIGN-REVIEW`,** then reversed by David on 2026-10-04: hearts in every lesson and test.
2. ~~**Mistakes round** (W25, `docs/UI.md` §4.5): wrongly answered questions come back once at the end of the lesson, reshuffled; the lesson is finished once they are answered; a lesson with a mistakes round does not count as perfect.~~ **Done in `DESIGN-REVIEW`,** opened by the deck.
3. **Review cards** (S15, W8):
   - Via the level card → "Review cards", a level's theory cards can be browsed without questions.
   - In every question, "See the card again" opens the last theory card as an overlay.
4. **Level card:** every lesson can be chosen individually, and perfect lessons are marked.
5. **Test summary** (S14):
   - For every wrong question: the correct answer and "Go to the lesson" (opens the source's review card).
   - "Review these" opens a practice round with exactly those questions. Complete from `PRACTICE` on.
6. **Out of hearts without a dead end:** instead of just "back", the actions "Review the cards" and "Practice → +1 heart" (the Practice tab gives a heart back since `DESIGN-REVIEW`).
7. **XP** (W11):
   - Replays earn ¼ XP.
   - The perfect bonus is paid only on the first perfect run.
8. **Match** (W15):
   - One wrong tap gives amber: counts as correct, costs no heart.
   - From two wrong taps on, the task is wrong.
9. **An explanation per wrong option** (`why`, W21) is shown where the content has one.
10. **One switch for unlimited hearts,** read from a single place, for Nutrade Plus (`MONEY`, decision I).
11. **Unit tests** for every rule.

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 1–2

**Prompt**
```
Stage LOOP-HEARTS from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "LOOP-HEARTS" section of docs/build-plan.md in full, plus docs/UI.md §2, §3, §4.1, §4.5, §5 and §7.1, and docs/agent.md §1 (Hearts) and §3.7.
Show me your plan first and wait for my approval.

Especially important:
- Existing progress is kept (migrate progress.v1 if necessary).
- Every rule has a unit test that would be red without the rule.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min)**
1. ~~Play a lesson with three deliberate mistakes: you lose no heart; the three questions come back at the end.~~ (tested in `DESIGN-REVIEW`)
2. Play a checkpoint with two mistakes:
   - Now hearts are lost.
   - The summary shows the correct answers.
   - "Go to the lesson" opens the matching card.
3. On a finished level, replay lesson 3 on its own: it earns only a few XP.
4. Lose all hearts in the checkpoint: "Review the cards" works.
5. A match with one wrong tap: amber, counts as correct.
6. Fun question (1–5): do mistakes feel fair now?

### `LOOP-DAILY` – coming back every day, without pressure

**Goal.** A reason to come back every day, without pressure and without guilt.

**Scope**
1. ~~**Daily goal** (W9):~~ Dropped by David on 2026-10-04: one lesson a day keeps the streak, there is nothing to choose.
   - ~~Choosable: 1, 2 or 3 lessons, default 2. In Settings; from `ONBOARDING` on also in the first run.~~
   - ~~"Today 1/2" shows on lesson complete and when you tap the flame; the goal left the top bar in `LOOK-SYSTEM`.~~ **Done in `DESIGN-REVIEW`:** lesson complete shows the streak, the flame's tap says whether today's lesson is done.
2. **Streak** (S10):
   - It counts the days with at least one finished lesson.
   - States:
     - **open:** no lesson yet today.
     - **done:** the flame lights up. **Done in `DESIGN-REVIEW`,** with the full-screen "streak goes up" moment after the day's first lesson.
     - **at risk:** in the evening, if there is no lesson yet.
     - **lost:** a friendly screen, "A new streak starts today". **Done in `DESIGN-REVIEW`** (2026-10-04), shown once as the app opens on a lost streak.
   - **Full screen** (your wish in `LOOK-BRIEF`, `#prototype/mix/streak` and `#prototype/mix/lost` at `a78e210`): every change of the streak gets its own screen. Up by a day, the flame lights and the count rolls on; lost, the flame goes cold and the count rolls to 0. About a second, only after something you did; Continue ends it (`docs/UI.md` §7.2). **Built in `LOOK-SYSTEM`** at your request (`src/lesson/StreakScreens.tsx`, played on Settings → Testing → Animations): ~~this stage shows them in the flow, after the lesson that meets the goal and when the app opens on a lost streak.~~ **In the flow since `DESIGN-REVIEW`** (David's test, 2026-10-04): after the day's first lesson, and when the app opens on a lost streak (`src/lesson/StreakMoment.tsx`).
3. **Streak freeze:**
   - At most two in store.
   - Used automatically, with the message "Freeze used".
   - Earned through the **weekly challenge** (`docs/UI.md` §7.6): 8–12 questions from everything unlocked, bonus XP plus a freeze.
4. **Reminders** (`expo-notifications`, local only):
   - A daily time of your choosing.
   - In the evening, at most one "streak at risk" reminder, and only if there is no lesson yet today.
   - Never guilt-trip texts; everything can be switched off.
5. **Testing tool** "Advance a day" (+1 day, +2 days).
6. **Gems** (your wish in `LOOK-BRIEF`, `docs/UI.md` §7.2): a new in-game currency in the top bar, earned in lessons (e.g. a few per lesson, more for a perfect one) and, from `FUN-PASS` on, in bonus side lessons. Never sold (decision I). What they buy is decision U. **In the top bar since `LOOK-SYSTEM`** (your wish of 2026-09-30), stored with the progress and still at 0: this stage makes them earned.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage LOOP-DAILY from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "LOOP-DAILY" section of docs/build-plan.md in full, plus docs/UI.md §5.3, §7.2, §7.6 and docs/agent.md §1 (Daily target).
Build exactly this scope.

Especially important:
- Day boundaries follow the device's local time; test daylight-saving changes and midnight.
- Reminder texts: friendly, never threatening, never guilt. Show me every text in the report.

Open a PR against main and get every check green.
Report: what you built · check results · every reminder text · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min + 3 days)**
1. ~~Set the goal to 1 and play one lesson: the streak screen plays full screen, the flame lights up, and lesson complete shows "Today 1/1".~~ Play the day's first lesson (Settings → Testing → Reset streak first): the streak screen plays full screen, the flame lights up, and lesson complete shows the streak. (Built in `DESIGN-REVIEW`.)
2. Testing → "+1 day": the streak is "open".
3. "+2 days" without a freeze: the "new streak" screen. With a freeze: "Freeze used".
4. Play the weekly challenge: you receive a freeze.
5. Set a reminder for 2 minutes from now: it arrives on the real device.
6. Finish a lesson: the gems in the top bar go up.
7. Use the app normally for three days: does anything annoy you?

### `ONBOARDING` – first impression, legal and market profile

**Goal.** A good first impression, and everything legally and professionally required before the first screen.

**Since `DESIGN-REVIEW`** (2026-10-03): the first trade comes before everything (`docs/UI.md` §11.1, `src/onboarding/`), and the steps below follow it. ~~The daily goal as three paces (Easy, Steady, Serious) belongs to the registration screens, which David adds later himself; this stage keeps the plain choice of 1, 2 or 3.~~ There is no daily goal any more (David, 2026-10-04): one lesson a day keeps the streak, so the first run has no goal step.

**Scope**
1. **First run** (`docs/UI.md` §11.1), in this order, after the first trade:
   1. What the app is.
   2. The risk note in one sentence, with "More".
   3. ~~Daily goal.~~ (dropped, 2026-10-04)
   4. Reminders yes/no.
   5. Market profile ("Where will you trade later?" US / Germany).

   Then straight into lesson 1-1.
2. **The risk note in every place** listed in `docs/agent.md` §7 (M8):
   - at first launch;
   - under every scenario result, as a small line;
   - on the statistics screen.
3. **Settings → Legal:** a scaffold for imprint, privacy policy, terms of use and disclaimer. The texts come from `LEGAL-DRAFT`; placeholders until then.
4. **Market profile in Settings** (S25):
   - EU number format ("10,00 €").
   - Clock times in local time, e.g. "US market: 15:30–22:00 German time".
   - "The market I trade" and "my time zone" are separate settings.
5. **Plan card** (S22):
   - Choice fields (`kind: choice`) and number ranges (`min`/`max`).
   - A dated plan history (`docs/schema.md`, "The plan").
   - Export as an image or text to share.
6. **i18n foundation** (W19, decision M): every UI string goes through keys (`t('…')`) with one `en.json` file, and numbers, currencies and dates are formatted through the locale (`Intl`), never by hand. The content stays English until Phase J.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage ONBOARDING from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "ONBOARDING" section of docs/build-plan.md in full, plus docs/UI.md §3 (plan-card), §9, §11, docs/agent.md §7, docs/schema.md ("The plan") and content/market_profiles.yaml.
Build exactly this scope; the legal texts stay placeholders.

Especially important:
- The risk note is visible but unobtrusive; it must not cover the chart reveal.
- After the i18n switch, no UI string may be hard-coded any more (check script).

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min)**
1. A fresh install (Settings → Reset, or a private browser window): go through the first run.
2. Choose the market profile "Germany": prices with € and a decimal comma, clock times in German time (lesson 1·10-1).
3. After a chart decision: the risk-note line is visible but unobtrusive.
4. Fill the plan card with nonsense: it is refused or queried. Then share the plan.
5. Settings → Legal opens.

### `PRACTICE` – the practice tab

**Goal.** A place where knowledge sticks: three minutes a day, never punishing.

**Since `DESIGN-REVIEW`** (2026-10-03) the tab exists (`docs/UI.md` §7.3): **Daily mix** (eight questions from played lessons, never twice in a round, the Leitner boxes 1 → 3 → 7 → 16 → 35 days, weak spots by tag), **Skills** (by chapter, each with its info card) and **Mistakes** (open mistakes, played as a round); a finished round gives a heart back; the record behind it is kept with the progress. This stage reviews that selection, makes it explainable, and adds what is missing: drill packs as a source, weak concepts by glossary term, the links from the test summary and lesson complete, and the "+1 day" testing tool. Keep the three tabs David asked for.

**Scope** (`docs/UI.md` §7.3)
1. **Practice tab** with three areas:
   - **Daily mix:** ~3 minutes, 8–10 questions.
   - **Weak concepts:** from wrong answers, via `tags` and `terms_introduced`.
   - **Scheduled review:** a Leitner system with 1 → 3 → 7 → 16 → 35 days.
2. **Where the questions come from:**
   - Questions from finished lessons, in a different order and never the same question twice in one round.
   - Plus drill packs, once they exist.
3. **Rules:**
   - Never hearts, never time pressure.
   - A finished practice round returns **1 heart** (`docs/UI.md` §5.2).
4. **Links:**
   - "Review these" from the test summary;
   - "Practice these" from the lesson-complete screen;
   - out of hearts.
5. **Unit tests** for the scheduling: due dates across days; a wrong answer sends a question back to box 1.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2

**Prompt**
```
Stage PRACTICE from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "PRACTICE" section of docs/build-plan.md in full, plus docs/UI.md §5.2, §7.3 and docs/agent.md §3.3.
Show me your plan first (data model, selection logic, screens) and wait for my approval.

Especially important:
- The selection must be explainable: why does this question come today? (for the tests and for me)
- No question twice in one round; no question whose lesson has not been played yet.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min + 1 week)**
1. Play five lessons with a few mistakes: the tab shows exactly those concepts.
2. Play the daily mix.
3. Lose a heart in the checkpoint, then play a practice round: the heart is back.
4. Testing → "+1 day" and "+3 days": the due questions appear.
5. Use it for 10 minutes a day for a week: does practicing feel useful, or like chewing the same thing over?

### `GLOSSARY` – every term one tap away

**Goal.** Every technical term is explained one tap away (`docs/UI.md` §8, S16).

**Scope**
1. ~~**`content/glossary.yaml`** (format in `docs/schema.md`): every term from all `terms_introduced`, one sentence of definition each, plus `taught_in` and `aliases`.~~ **The definitions are written** (`DESIGN-REVIEW`, after David's test on 2026-10-04): every word is an entry of `content/skills.yaml` with its `info` line, and where it is taught comes from the level file that lists it (`docs/schema.md` "Skills"). Left for this stage: **proofread** every word's line against the card that defines it (194 words; no line may contradict its lesson), and add **`aliases`** where the body spells a term differently ("bid-ask spread"), so the marker catches them.
2. ~~**Validator:** every introduced term has an entry, and no definition is too long.~~ Done with `content/skills.yaml` (`docs/schema.md` "Skills", rules of 2026-10-04).
3. **UI:**
   - ~~Terms in body text get a dotted underline (first occurrence per screen). A tap opens a sheet with the definition and "Taught in Level X-Y"; that opens the review card.~~ **Built in `DESIGN-REVIEW`** with David's marker (highlighter and underline, `docs/UI.md` §8) and his rule "don't over or underuse them"; the sheet shows "Taught in" and the card already. This stage adds the definition line from `content/glossary.yaml`, and the aliases.
   - ~~The one-line meaning on each skill chip of "What you learned" and on its sheet (`docs/UI.md` §5.3).~~ Built in `DESIGN-REVIEW` (2026-10-04).
   - A glossary list with search in Account.
   - A "recently missed" area, fed by `PRACTICE`.
4. **`docs/ContentToDo.md` 1.4:** every term in its lesson's `terms_introduced`, spelled as the body spells it, defined on a card of that lesson.

**Model · effort · sessions:** Opus 5.5 · high · 1–2. The definitions must be exact, so not with Sonnet or Haiku.

**Prompt**
```
Stage GLOSSARY from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "GLOSSARY" section of docs/build-plan.md in full, plus docs/UI.md §8, docs/schema.md (Skills), docs/agent.md §3.9 and §4, and docs/ContentToDo.md (Part 1).
Proofread every word's info line in content/skills.yaml against the lesson that introduces the term — read the screen that defines it. No line may contradict its lesson.

Open a PR against main and get every check green.
Report: what you built · number of terms and of lines changed · 15 random definitions to proofread · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min)**
1. Tap underlined terms in three lessons.
2. Search the glossary for "VWAP", "Spread" and "R".
3. Read the 15 definitions from the report: correct and understandable?

### `STATS` – progress, measured by decisions

**Goal.** Progress you can be proud of. Measured by decisions, never by profit.

**Since `DESIGN-REVIEW`** (2026-10-03) the Account page has the tier card in its material, the medal shelf, All stats with the variance view and the risk note, and Your plan (`docs/UI.md` §7.4). David did not take the Trader Card with stats ("the tier card design … could be shown here"), and the learning chart goes to the tab decided in `TABS`. Left for this stage:

**Scope** (`docs/UI.md` §7.4)
1. **Account and statistics:**
   - Accuracy per topic (a lesson's `tags`) and per setup, from the record `DESIGN-REVIEW` keeps.
   - Decision record: long, short, no trade. ~~The share of "good decisions".~~ Counts, not rates called good.
   - ~~A **variance view**, e.g. "Your correct decisions: 64 % winners, 36 % losers – that is what a good process looks like."~~ Built, as counts and without calling any split good (`docs/agent.md` §3.11).
2. ~~**Trader Card v1:** best setup, a summary of the saved plan, tier. Shareable as an image.~~ **The tier card, shareable as an image,** and the plan as an image if `ONBOARDING` has not done it.
3. ~~**The risk-note line** on the statistics screen (`docs/agent.md` §7).~~ Built.
4. ~~**The medal just won shines once on the shelf** (`docs/UI.md` §7.4, left from `DESIGN-REVIEW`): the app remembers which medals the shelf has shown, and a new one gets one pass of light the first time Account opens after it.~~ **Done in `DESIGN-REVIEW`** (David's test, 2026-10-04).

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage STATS from docs/build-plan.md.

Read CLAUDE.md, then §0 ("Variance"), §1 and the "STATS" section of docs/build-plan.md in full, plus docs/UI.md §7.4–§7.5 and docs/agent.md §7.
Never show profit or money as a measure of performance — only decisions.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min)**
1. Spot-check the numbers against what you played.
2. Share the tier card and look at the image.

### `TABS` – the tab set David chooses

**Goal.** The bar along the bottom holds the tabs David chose from the concept artifact (ideas 31 and 38 of `DESIGN-REVIEW`, decision V).

**You prepare.** Your choice from the artifact ["Nutrade tabs concept"](https://claude.ai/artifact/F7fex6S9DVzby2ZcKyWqHD): its "Copy the line" button gives the line for the prompt, e.g. "Option A: Learn, Practice, Analytics, Account now; the Arena joins as a fifth tab once the arena exists."

**Scope**
1. The tab bar as chosen; the Leaderboard placeholder goes (W7 already says there is none in v1.0).
2. **Analytics**, if chosen (David on idea 31: "change the Leaderboard tab to an analytics"): your learning as a weekly XP candle chart with its all-time high, the decision record, the variance view and accuracy by topic — moved from Account → All stats, which then keeps only what belongs to the profile. Measured in decisions and effort, never money.
3. **Arena**, if chosen: the tab with a lock until `ARENA-TAB` fills it.
4. `docs/UI.md` §11.2 and §7.4 record the choice.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage TABS from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "TABS" section of docs/build-plan.md in full, plus docs/UI.md §7.3, §7.4, §7.7 and §11.
My choice from the tabs concept: [paste]

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~15 min).** Every tab on your phone; the analytics against what you played.

### `FUN-PASS` – is it fun?

**Goal.** Before the content is reworked, find out: is the app fun, and where does it drag?

**Scope**
1. **Audit by Claude:**
   - Claude plays Chapter 1 and Scalping Chapter 2 through automatically (Playwright, screenshots, time per screen).
   - Measures lesson length and interaction density.
   - Finds boredom, repetition and weak rewards.
   - Checks the animations with the `review-animations` and `improve-animations` skills against `docs/UI.md`: "Nothing moves unless the learner moved it", and decision H (calm, high quality, never in the way).
2. **Newcomer test by you:** 2–3 people without trading knowledge play Levels 1–4 (guide in Appendix C).
3. **Implementation:**
   - Audit and newcomer test become a prioritized list. You choose from it.
   - What gets built: e.g. sounds, haptics, micro-animations, achievements for discipline (K6), and whatever the newcomer test showed.
   - **Bonus side lessons** on the path (your wish in `LOOK-BRIEF`, `docs/UI.md` §7.1, `#prototype/mix/bonus` at `a78e210`): a small node beside the path after some levels, opened by the level before it, with two or three charts played bar by bar where you don't know where, or whether, there is a setup (the `chart-replay` of `docs/UI.md` §4.4). Optional, never timed, never a heart; they pay gems. Hand-written charts first; from `ARENA-TAB` on, the generator fills them. **Since `DESIGN-REVIEW`** the map draws side stops in the path's own style and reads bonus files (`level-LL-bonus.yaml`, `docs/schema.md`); this stage writes the first ones, at the places in `docs/curriculum.md` "Side stops", and pays their gems (`docs/ContentToDo.md` 2.7, 4.4).

**Model · effort · sessions:**
- Audit: Fable 5.1 · high (else Opus 5.5 · xhigh).
- Implementation: Opus 5.5 · high · 1–2.

**Prompt (audit)**
```
Stage FUN-PASS (audit) from docs/build-plan.md.

Read CLAUDE.md, then §0 ("Fun"), §1 and the "FUN-PASS" section of docs/build-plan.md in full, plus docs/UI.md in full.
Play Chapter 1 and Scalping Chapter 2 in the web preview automatically (Playwright), measure the time per screen and per lesson, and assess them against the fun criteria in §0.
Change nothing.

Report: measurements · the 15 most important findings (screen link, what, why, proposal), sorted by impact · open questions. Then stop.
```

**Prompt (implementation)**
```
Stage FUN-PASS (implementation) from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "FUN-PASS" section of docs/build-plan.md. Implement these approved findings: [list], and the bonus side lessons (scope item 3).
Open a PR against main and get every check green. Report with a test checklist. Then stop.
```

**You test (~45 min).** The newcomer test from Appendix C, then play Levels 1–4 yourself after the implementation.

---

## 9. Phase E – Scalping content: correct, honest, complete

The order is deliberate:
1. First your critique is collected, and the validator checks the new rules (`RULES`).
2. Then the new building blocks are made (`VARIANCE`, `OFFER`).
3. Then every chapter is touched **once** (`CONTENT-FIX`).
4. Only then come the big reviews.

That way no file is rewritten twice.

### `CONTENT-DESIGN` – the test bench learns the new fields

**Goal.** Every content field the app renders since `DESIGN-REVIEW` has an example in the test bench, so every later content stage can see what it writes.

**Scope** (`docs/ContentToDo.md` 4.9)
1. In `demo/all-screens.yaml`: a chart decision with `stop`, `target` and `notes`; a chart with `session_open`; a story with an `alert`; a test-style intro with `facts`; `skills` in the header.
2. One bonus file in `demo/` that the bench can open.
3. The render test and the contact sheets cover them.
4. Tick 4.9 in `docs/ContentToDo.md`.

**Not in this stage:** any file in `content/`.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage CONTENT-DESIGN from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "CONTENT-DESIGN" section of docs/build-plan.md in full, plus docs/ContentToDo.md, docs/schema.md (every [DESIGN-REVIEW] field) and docs/UI.md §3, §5.1b, §6.4.
Change only the test bench; no file in content/.

Open a PR against main and get every check green.
Report: what you added · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~10 min).** The new bench screens on your phone (links in the report).

### `RULES` – new rules and worklists

**Goal.**
- Your own critique of the lessons is captured, so every chapter pass works on it.
- The new content rules are checked automatically.
- Every content session gets a ready-made worklist.

**You prepare (~30 min).** Play a few lessons from Chapter 1 and Scalping Chapters 2–3, then write down what bothers you, like the look critique in `LOOK-BRIEF`. Paste it under the prompt:
```
What bothers me in the lessons (screen link + one sentence):
- …
Too long / too short / too easy / too hard:
What I miss:
Lessons I liked, and why:
```

**Scope** (the rules are in `docs/agent.md` and `docs/schema.md`, marked [v4] there)
0. **`docs/ContentToDo.md`** is read with the critique: its Part 3 is part of every chapter's worklist.
1. **Your critique** goes into this plan, into the chapter-specific items of `CONTENT-FIX`: a part for every chapter, plus the chapter it names. So every chapter pass reads it. Two points are already in, from `LOOK-BRIEF`: more hands-on lessons where you don't know where, or whether, there is an entry; and fewer words on every screen, for which `RULES` proposes a tighter limit than W10's 150 characters, per screen type (you decide).
2. **Validator rules:** warnings first, errors under `--strict`.
   - **Variance** (§3.11):
     - the share per chapter;
     - in Chapter 1, never two "right, but lost" in a row;
     - `stop` and `target` from Chapter 3 on for directional decisions;
     - the `outcome` sentence matches the chart (win or loss).
   - **Signs** (§3.12): amount questions have `sign: any` or a direction word in the prompt.
   - **No odds** (§3.11, `DESIGN-REVIEW`): a sentence that states how often something wins or loses ("4 in 10", "x % of the time", "most of the time it works") outside a screen that labels its numbers as an example.
   - **Standalone questions** (§3.4, `DESIGN-REVIEW`): a question whose prompt points back ("the chart above", "this quote") without a `story` right before it.
   - **References and labels:** recap points with `card:`; a `story` screen at the end of a lesson with `label: takeaway`.
   - **Language:**
     - body text ≤ 150 characters;
     - US spelling (a list of British forms);
     - no gesture words in prompts ("drag", "tap", "swipe") and no mechanics hints like "Hearts are on."
   - **Tells** (§3.5): the length tell downwards as well (< ~15 %); the punctuation tell in chapters too, not only in packs.
   - **Visual quota:** ≥ 40 % of a chapter's `theory` and `example` screens have a visual (W23).
   - **Plan-aware cap:** after a `plan-card` that writes `setup_max_account_pct`, positions stay under the suggested value until the next revision.
   - **Per-trade risk and total exposure** (`docs/agent.md` §3.6):
     - risk per trade between 0.5 and 2 %;
     - with several positions at once: the sum of position values and the sum of the risks against the account;
     - required before the swing and day-trading paths.
3. **`tools/test_validate.py`:** one case per new rule.
4. **`tools/content_report.py --chapter N`:** a worklist per chapter (Markdown) with every finding, each with file and screen — including the counts behind `docs/ContentToDo.md` Part 3 (lessons without skills, scenes with a ticker and no alert, test intros without `facts`).
5. **`tools/export_readable.py --chapter N`:** a chapter as readable text, for you, for `EXPERT` and for the reviews.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage RULES from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "RULES" section of docs/build-plan.md in full, plus docs/agent.md and docs/schema.md in full (every rule marked [v4]).
New rules start as warnings; a plain `validate_content.py` stays at 0 errors. No content changes in this stage.

My critique of the lessons:
[paste your template here]

Open a PR against main and get every check green.
Report: new rules · warnings per chapter (table) · link to the worklists · my test checklist · open questions. Then stop.
```

**You test (~10 min)**
1. Read the worklists for Chapters 1 and 7: are the numbers plausible? The variance share today is e.g. 0 %.
2. Open a chapter export: is it easy to read?
3. Find your critique in the `CONTENT-FIX` section: is every point there, in the right chapter?

### `VARIANCE` – decided right, lost anyway

**Goal.** The learner understands that correct decisions can lose, before it happens to them (§0, "Variance"). You asked for the same in `LOOK-BRIEF`: a right decision can still lose, and the app should say so.

**Changed on 2026-10-03 (`DESIGN-REVIEW`):** the variance simulator is dropped — a fixed win rate on a screen would read as reliable, and the learner should find out for themselves how often a method works (`docs/agent.md` §3.11). The reveal line without a rate and the decision grid are already built; this stage writes the content.

**Scope**
1. ~~**New screen type `variance-sim`**~~ — dropped. The `decision-grid` visual (`docs/UI.md` §6.8) is built and is what 2-4 uses.
2. **New lesson 1·2-4 "Good Call, Bad Luck":**
   - In English, 12–16 screens, following `docs/curriculum.md` and the sequence in `docs/ContentToDo.md` 4.1: a scene, the first correct decision that loses (with the reveal and its grid), the grid as a card, why a good read can lose, `tf` "A trade that lost was a bad decision" (false), a sort into the grid, a right "wait" that would have won, a mini calculation, "how often it works, your own record says", the takeaway.
   - No rate anywhere, no simulator.
   - The prerequisite chain: 3-1 now follows 2-4.
3. **"Why?" link** in the "right, but lost" reveal: opens the grid card from 1·2-4 as a review card.
4. **Lesson summary** (`docs/UI.md` §5.3), e.g. "Decisions 7/8 right · Results: 4 won, 3 lost".
5. **First losers in Chapter 1:** from Level 3 on, the first correct buy decisions that lose, at the share from §3.11, worded without odds. `CONTENT-FIX-1` does the rest.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1–2

**Prompt**
```
Stage VARIANCE from docs/build-plan.md.

Read CLAUDE.md, then §0 ("Variance"), §1 and the "VARIANCE" section of docs/build-plan.md in full, plus docs/agent.md §3.11, docs/UI.md §3, §5.1b, §5.3, §6.8, §6.10, docs/schema.md (decision-grid), docs/ContentToDo.md (Part 1 and 4.1) and the reference files from docs/agent.md §3.8.
Read content/shared/chapter-01-market-basics/level-02-1.yaml to level-02-3.yaml before you write 2-4 — tone and rhythm must match.

Especially important:
- The lesson must be understandable for someone with no prior knowledge at all, and variance must never read as an excuse for bad decisions.
- No profit promises and no rates: nothing may say how often a setup or a decision wins. Where a number is needed for arithmetic, it is labelled as an example.

Open a PR against main and get every check green.
Report: what you built · check results · the full text of lesson 2-4 to proofread · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min + newcomer test)**
1. Play lessons 1·2-3 and 2-4. Does the grid make "right call, lost anyway" clear without any number?
2. Play a Chapter 1 decision that was right and loses (link in the report): is it immediately clear that you were *right*?
3. **Newcomer test:**
   - Someone without trading knowledge plays 2-3 and 2-4.
   - Ask them afterwards: "You decided right and still lost – what does that mean?"
   - Expected, in their own words: "One single trade says little; what counts is whether the decision was good."
   - And: "How often does a setup work?" Expected: "I'd have to find out from my own trades."
   - If they cannot say that, Claude revises the lesson.

### `OFFER` – Chapter 8 Level 15, account types and rules

**Goal.** Chapter 8 Level 15 "What You'll Actually Be Offered" teaches the knowledge for the step into a real account (decisions A, B, C).

**Scope**
1. **Part 1 – renumbering** as a commit of its own:
   - Chapter 8 Levels 15–17 become 16–18.
   - The prerequisite chain and every reference move with them.
2. **Part 2 – Level 15 with four lessons** following `docs/curriculum.md`. Decisions A–C are made now; nothing is left open.
   - Account types and what each allows. Short selling needs a margin-enabled account.
   - What leverage does to numbers the learner already knows: the ruin arithmetic.
   - The rules against your own plan:
     - the PDT rule against six trades per session;
     - settlement;
     - taxes as a question for an adviser.
   - Practice: the account that fits your own plan.
3. **`content/market_profiles.yaml`** (M17):
   - EU-DE `fee_note` without prices.
   - EU-DE `regulation_note` precise: the negative-balance protection covers CFDs.
   - The US PDT rule at its current state. Research with a source, because the FINRA reform is under way.
   - A new field `checked: <date>`.
   - `timezone` "German time" instead of "CET".
   - `first_minutes` in the same format as `premarket`.
4. **Not here:** the one-sentence additions in Chapter 1 (1·12, 1·13) and in 6·9 are done by `CONTENT-FIX-1` and `CONTENT-FIX-6`.

Detailed prompt: **Appendix E.1**.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1–2

**Prompt**
```
Stage OFFER from docs/build-plan.md.

Read CLAUDE.md, then §1, §4.1 (decisions A, B, C) and the "OFFER" section of docs/build-plan.md in full, and docs/ContentToDo.md (Parts 1–3: the new level is written with skills and the new fields from the start). Then follow the detailed prompt in Appendix E.1 exactly.
For the rule texts in content/market_profiles.yaml: research the current state on the web, name every source with its date in the report, and flag everything a lawyer has to check.

Open a PR against main and get every check green.
Report: what you built · check results · sources · sentences you are unsure about (for EXPERT/the lawyer) · my test checklist with real links. Then stop.
```

**You test (~20 min)**
1. Skip ahead to Chapter 8 Level 15 and play all four lessons, once with the US profile and once with Germany.
2. Check: informative, no recommendation, no product name, understandable.
3. Collect every place where Claude was unsure, for `EXPERT` or the lawyer.

### `CONTENT-FIX-1` … `CONTENT-FIX-8` – one pass per chapter

**Goal.** Every chapter meets every rule. One pass per chapter, so every file is touched only once.

**Order:** 1 → 2 → 3 → … → 8. Chapter 8 comes after `OFFER`.

**Scope per chapter**
1. **Work through the worklist** (`python3 tools/content_report.py --chapter N`):
   - The variance share, with new chart paths and `stop`/`target`.
   - Signs.
   - Recap `card:`.
   - Takeaway labels.
   - Text length, spelling, gesture words.
   - Tells.
   - The visual quota, with `candle-anatomy`, `trade-plan` and the existing components.
   - A `subtitle` for every lesson.
   - `why` for the most important wrong options (typical misconceptions).
2. **The chapter-specific items** in the list below.
   - Plus **`docs/ContentToDo.md` Part 3** for the chapter: skills, the chart ramp, notes, the open, alerts, briefings, no odds, standalone questions. Tick them there.
3. **Way of working:**
   - Blocks of 4–6 levels; after every block the validator and sizing.
   - At the end, the render test for the chapter and a contact sheet of the changed screens.
4. **Do not change:**
   - Learning goals, level structure and ids.
   - Share counts only with the arithmetic redone (`docs/agent.md` §3.6).

**Chapter-specific items** (from `docs/review-2026-09-25.md`, and from your critique once `RULES` has added it)

- **Every chapter:** your critique's general points (added by `RULES`). From `LOOK-BRIEF`: more hands-on decisions where the learner has to find the entry, or see that there is none and stand aside. And fewer words: every screen within the limit from `RULES`.
- **Chapter 1:**
  - Scenarios that already draw the conclusion: 13-2, 16-1.
  - A contradiction about rumors: 13-2 S9 ↔ 16-1 S11.
  - "Hearts are on." in 5-1 and 11-1.
  - "Drag …" in 3-3, 8-3, 10-1.
  - Single questions: 14-2 S7, 14-2 S13, 2-3 S4, 1-4 S9, 3-1 S13, 16-1 S2, 1-1 S11, 17-1 S5.
  - Signs: 1-1 S10, 1-3 S10, 5-1 S8, 13-1 S6, 13-3 S4, 15-2 S10.
  - In 1·12 one sentence on cash vs. margin accounts; in 1·13 one sentence that short selling needs a margin-enabled account (decision B).
  - In 16-2 one sentence on why your plan value (50 %) sits below the examples so far.
  - The ownership graphic in 3-1 as a grid.
  - Two questions that read alike (your critique in `LOOK-BRIEF`: the same question twice, with different right answers): 14-1 S11 "Which style fits that life best?" (swing trading) and 17-2 S13 "Which style fits that day best?" (scalping). Each question names its story.
- **Chapter 2:**
  - In 2·1-4, after the bridge screen, a `plan-card` revision of `setup_max_account_pct`, 50 → 95, with the reason (W3).
  - `candle-anatomy` in 2·1-1.
- **Chapter 3:**
  - State chips following Appendix E.3 (37 % today).
  - `stop`/`target` apply from here on.
  - 3·10 confirms the plan revision.
  - 3·14-1 consistent with decision B.
  - "Hearts are on." in 12-1.
- **Chapters 4 and 5:** only the worklist.
- **Chapter 6:**
  - State chips (38 %).
  - ~~`variance-sim` in 6·6 and 6·13.~~ 6·6 and 6·13 without a simulator: example numbers labelled as examples, and "your own sample decides" (`docs/curriculum.md`, `DESIGN-REVIEW`).
  - In 6·9 say plainly: six trades per session need a margin account, plus PDT and settlement (decision C).
- **Chapter 7:**
  - State chips first, only 16 % today.
  - Realistic variance per setup.
- **Chapter 8:**
  - "Hearts are on." in 5-1 and 10-1.
  - An honest ending: "ready to practice, not ready to profit".
  - References to Level 15.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per chapter

**Prompt** (`[N]` = chapter number)
```
Stage CONTENT-FIX-[N] from docs/build-plan.md.

Read CLAUDE.md, docs/agent.md, docs/schema.md and docs/UI.md in full, the section on Chapter [N] in docs/curriculum.md, docs/ContentToDo.md (Parts 1–3), §0 ("Variance"), §1 and the "CONTENT-FIX" section of docs/build-plan.md, and the reference files from docs/agent.md §3.8.
Then run `python3 tools/content_report.py --chapter [N]` — that is your worklist, together with the chapter-specific items in the plan.

Work in blocks of 4–6 levels. After every block: validate_content.py, check_sizing.py; 0 errors, no warning about a file you touched.
Recompute every changed chart question completely (entry, stop, size, result in $ and R, outcome sentence).
Change no learning goals, no level structure, no ids.

At the end: the render test for the chapter, a contact sheet of the changed screens, the three hand checks from §1, and Chapter [N]'s ticks in docs/ContentToDo.md.
Open a PR against main and get every check green.
Report: before/after numbers from the worklist · deviations with their reason · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min per chapter)**
1. Play two lessons and the checkpoint (links in the report).
2. Read the before/after numbers.
3. Look at three changed decisions, one of them "right, but lost".
4. Read one lesson as a beginner would.

### `KNOWLEDGE` – is the knowledge enough for practice?

**Goal.** Answer two questions:
- After the course, is really only practice missing? Checked against the graduate profile in §0.
- Does everything that is taught work like that in reality? That is review B.

**Scope:** a list of findings, no changes. Detailed prompt: **Appendix E.6**. The graduate profile is added as a fifth question.

**Model · effort · sessions:** Fable 5.1 · max (else Opus 5.5 · max) · 1

**Prompt**
```
Stage KNOWLEDGE from docs/build-plan.md.

Read CLAUDE.md, then §0 (graduate profile) and the "KNOWLEDGE" section of docs/build-plan.md, then follow the detailed prompt in Appendix E.6 for the scalping path.
An additional fifth question: go through the graduate profile point by point and name, for every point, where it is taught (file, screen) — or that it is missing, and where it would belong.
Change nothing.

Report: a numbered list of findings, most important first, with file and screen · items that need outside knowledge (for EXPERT) · open questions. Then stop.
```

**You:** read the findings and decide each one: yes, no or later. The yes-findings go to `KNOWLEDGE-FIX`. Items that need outside knowledge (law, broker practice) go to `EXPERT`.

### `KNOWLEDGE-FIX`

Implements the approved findings: new screens or lessons, following every rule.

**Model · effort · sessions:** Opus 5.5 · high · 1–3

**Prompt**
```
Stage KNOWLEDGE-FIX from docs/build-plan.md.

Read CLAUDE.md, docs/agent.md, docs/schema.md, docs/UI.md, docs/ContentToDo.md (Part 1), and §1 of docs/build-plan.md. Implement these approved findings from KNOWLEDGE: [list]. New lessons follow docs/curriculum.md (add them there) and every rule.
Open a PR against main and get every check green. Report with a test checklist. Then stop.
```

**You test:** play the new lessons.

### `REVIEW-A` – does the course teach well?

**Scope:** detailed prompt **Appendix E.5** (pass A). First a list of findings; you approve; then the corrections follow.

**Model · effort · sessions:**
- Review: Fable 5.1 · high (else Opus 5.5 · max) · 1.
- Corrections: Opus 5.5 · high · 1–3.

**Prompt (review)**
```
Stage REVIEW-A from docs/build-plan.md. Read CLAUDE.md and follow the detailed prompt in Appendix E.5 for the scalping path. Change nothing. Then stop.
```

**Prompt (corrections)**
```
Stage REVIEW-A (corrections) from docs/build-plan.md. Read CLAUDE.md, docs/agent.md, docs/schema.md, docs/UI.md and §1 of docs/build-plan.md. Implement these approved findings: [list]. PR, every check green, report with a test checklist. Then stop.
```

### `EXPERT` – expert review by a human

**Goal.** A person who actually trades checks the professionally most delicate parts.

**Scope:**
- Chapter 3 (orders, costs, size).
- Chapter 6 (risk).
- Chapter 7 (playbook).
- Chapter 8 (the trading day and Level 15).
- The market profiles.

Claude provides the exports (`tools/export_readable.py`) and a list of the places where Claude was unsure.

**You:**
1. Find the person: an experienced trader, ideally with training or teaching experience. Decision N is still open; ways that do not cost much:
   - **Keep the job small.** Claude's own reviews (`KNOWLEDGE`, `REVIEW-A`) come first, so the expert only checks the risky parts above and Claude's list of doubts. That is hours, not weeks.
   - **Where to look:** student investment and trading clubs at universities; former professional traders on LinkedIn or XING; lecturers who teach investing at adult education centers (Volkshochschule) or business schools; experienced traders among your beta testers; freelance platforms (e.g. Malt, Upwork) with a fixed price per chapter.
   - **How to pay:** a fixed price per chapter instead of an hourly budget; or, instead of money, lifetime Nutrade Plus and a credit in the app (only with their consent, and never worded as an endorsement).
   - **If possible, two views:** a practitioner (does it work like that?) and a teacher (is it taught well?).
2. Agree on scope and fee in writing.
3. Bring the result back as a list.

The same person, if possible, checks the same risky parts of Swing and Day Trading later (`SWING-REVIEW`, `DAY-REVIEW`).

The corrections are made in a session of their own (Opus 5.5 · high, prompt as for the `REVIEW-A` corrections).

---

## 10. Phase F – Beta 1 (closed, scalping)

The goal of this phase: real people test the finished scalping course before the arena, Swing and Day Trading are built.

### `BRAND` – Nutrade: the trademark, the address and a face

**Goal.** The name Nutrade is protected and has a web address, and the app has a face before store accounts, icons and texts are created.

**When:** first in Beta 1, before the legal texts, the store accounts and the first builds need the name, the web address and the icon. It moved here from Phase C at your request on 2026-09-30, because it is not important before then. Until it runs, the app shows the name "Nutrade" as text and stand-ins for the logos.

**Scope**
1. **Secure the name** (decision L):
   - Run the trademark search for "Nutrade" and close spellings again: DPMA (Germany), EUIPO (EU, e.g. via TMview), WIPO (international), USPTO (US) and the launch markets from decision T. Nice classes 9 (apps), 41 (education), 42 (software) and 36 (finance).
   - Known on 2026-09-26: NUTRADE for supplements and business services (classes 5 and 35; Germany, UK, international), held by a vitamin-gummy maker (nutrade.de); NUTRADE in Mexico, held by Syngenta (including class 42).
   - A one-page note for the lawyer: can Nutrade for an education app coexist with those marks, and what does Mexico mean for a launch there?
   - Prepare our own filing: the word mark "Nutrade" in classes 9 and 41 (42 optional). You or the lawyer file it.
   - The app-store search in the launch markets, and the social handles.
2. **The web address:** nutrade.com is parked with a domain seller (ask the price); otherwise e.g. nutradeapp.com, nutradeapp.app or nutradeapp.de, which were free on 2026-09-26. You register it.
3. **How the name reads in the launch languages:** no unfortunate meaning, easy to say (decision M).
4. **A store title,** e.g. "Nutrade – Learn to Trade". Neither title nor subtitle promises profit (`docs/agent.md` §1, §7 and the store guidelines).
5. **2–3 logo and icon concepts** as SVG, matching the direction from `LOOK-BRIEF`, and a small logo for each path (Scalping, Swing Trading, Day Trading) for the top bar (`docs/UI.md` §7.2). Optionally image concepts with the `brandkit` skill.
6. **Tone of voice in five sentences:** sober, friendly, honest.
7. **After your choice, recorded in:**
   - `app.json` (name, slug);
   - the web title;
   - placeholders for icon and splash.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1

**Prompt**
```
Stage BRAND from docs/build-plan.md.

Read CLAUDE.md, §1, §4.1 (decision L) and the "BRAND" section of docs/build-plan.md, docs/agent.md §1 and §7, and the direction chosen in LOOK-BRIEF in docs/UI.md §10.
Check the name "Nutrade" first: trademark registers, app stores, domains and social handles. State what you checked and what you could not check. If you find a conflict that is more serious than the ones §4.1 already lists, stop and tell me before any design work.
No name, title or subtitle may promise profit, wealth or signals.

Open a PR against main with the drafts (SVG) under assets/brand/.
Report: the name check · the note for the lawyer · web-address options · logo concepts (links) · store title · tone of voice · open questions. Then stop and wait for my choice.
```

**You decide:** the web address and the icon direction. File the trademark early; the lawyer checks it before the release (`LEGAL-FINAL`).

### `LEGAL-DRAFT` – legal texts as drafts

**Goal.** Legal texts as drafts, so the beta and the store entries become possible.

**Scope** (in English and German, because the provider is a business in Germany; the other languages follow in Phase J)
1. **Imprint** under the DDG, with the business's details (decision P).
2. **Privacy policy.** It covers what exists at the beta:
   - local storage;
   - notifications;
   - crash reports and analytics, only with consent;
   - the store providers.

   The stages that add data processing later (`BACKEND`, `MONEY`, `ADS`, `I18N-PIPELINE`) extend it, and `LEGAL-FINAL` reviews the full set.
3. **Terms of use.**
4. **Risk note and disclaimer:**
   - no investment advice;
   - synthetic data;
   - no guarantee.
5. **Draft privacy details** for the App Store and Google Play.
6. **A simple web page** with these texts, e.g. as a second Cloudflare Pages project. The stores require a privacy policy URL.
7. **Settings → Legal** shows the texts.

**Important.** These are drafts, not legal advice. A lawyer reviews them before the release (`LEGAL-FINAL`). Flag for the lawyer which language version is binding and whether a launch country needs texts of its own.

**You prepare.** The business's details: name, legal form, address, contact, and the register entry and VAT ID if there are any (decisions P and Q). Placeholders until the business is registered.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage LEGAL-DRAFT from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "LEGAL-DRAFT" section of docs/build-plan.md in full, plus docs/agent.md §7.
Business details: [name, legal form, address, email, register entry, VAT ID].
Write the drafts in English and German; flag every place a lawyer has to decide, including which language version is binding. No text may promise profit or read as investment advice.

Open a PR against main and get every check green.
Report: texts (links) · places flagged for the lawyer · my test checklist · open questions. Then stop.
```

**You test.**
1. Read the texts.
2. Open the web page on your phone.
3. Settings → Legal shows the texts.

### `STORE-SETUP` – accounts and test builds

**Goal.** The app runs as a real app on real devices: TestFlight (iPhone) and Play "internal testing" (Android).

**Scope**
1. **Accounts** (you create them, Claude gives you the steps), in the business's name (decision P):
   - **Apple Developer Program:** €99/year. A sole proprietorship enrolls as an individual and sells under your own name; a legal entity (e.g. UG or GmbH) enrolls as an organization and needs a D-U-N-S number.
   - **Google Play Console:** $25 one-time. An organization account needs a D-U-N-S number and is exempt from the closed-test rule. A personal account created after November 2023 must run a closed test with **at least 12 testers for 14 days in a row** before its first release. Check the current rules before you plan around them.
   - **The D-U-N-S number** is free but can take up to 30 days: request it as soon as the business exists.
   - **An Expo/EAS account.**
2. **Project configuration:**
   - `eas.json` with the profiles development, preview and production.
   - Bundle ID and package name.
   - A versioning scheme.
   - Icon and splash from `BRAND`.
3. **First builds:** TestFlight internal and Play "internal testing".

**You prepare.**
- Register the business first (decision P); the legal form is decision Q.
- Create and pay for the accounts.
- Store the tokens as GitHub secrets.
- Register the test devices.

**Model · effort · sessions:** Sonnet 5 · high · 1

**Prompt**
```
Stage STORE-SETUP from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "STORE-SETUP" section of docs/build-plan.md in full.
Set up eas.json, app.json (bundle ids, versions, icon, splash) and the build workflow. For every step only I can do (accounts, payments, tokens), write me a numbered guide.

Open a PR against main and get every check green.
Report: what is set up · my steps · my test checklist · open questions. Then stop.
```

**You test.**
1. Install the app via TestFlight (iPhone) and play one lesson.
2. The same via Play "internal testing" (Android).
3. Check haptics and sounds.

### `ANALYTICS` – crash reports, learning analytics, "Report a problem"

**Goal.** In the beta, see where the app crashes and where learners get stuck, without more data than necessary.

**Scope**
1. **Crash reports**, e.g. with Sentry (EU region), only with consent.
2. **Data-minimal learning analytics:**
   - Per question: right, wrong, abandoned.
   - Per lesson: duration and completion.
   - No personal data; limited retention.
3. **Consent** in the first run and in Settings, revocable at any time.
4. **A "Report a problem" button per screen** (K8): sends the screen id and a text by email or form.
5. **A weekly report** as a script: the hardest questions and the most frequent drop-offs.
6. **The privacy policy** is updated accordingly.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage ANALYTICS from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "ANALYTICS" section of docs/build-plan.md in full, plus the privacy policy from LEGAL-DRAFT.
Without consent nothing is sent — prove it with a test.

Open a PR against main and get every check green.
Report: what you built · which data goes where (table) · my test checklist · open questions. Then stop.
```

**You test.**
1. Decline consent: nothing is sent.
2. Agree and trigger `#debug-crash`: the crash appears in the dashboard.
3. Try "Report a problem" once.

### `BETA-1` – real testers

**Goal.** Real people, real feedback, before Swing is written.

**Scope**
1. **Testers** — you find them (decision O):
   - 10–30 people.
   - At least 12 if your Google account is a personal one, so the test also counts as Google's required test.
   - At least 3 of them without trading knowledge.
2. **Duration and channels:** 2–4 weeks via TestFlight and the Play closed test.
3. **Questionnaire:** Appendix D.
4. **One round every week:**
   1. Claude evaluates analytics and feedback and writes a prioritized list.
   2. You choose.
   3. A fix session implements it.
   4. An update for the testers: via EAS Update for JS or content changes, a new build only for native changes.

**Success**
- Crash-free ≥ 99.5 %.
- Lessons finished ≥ 85 %.
- Fun ≥ 4/5.
- Comprehension questions ≥ 80 % correct.
- Still active after 7 days ≥ 25 %.

**Model · effort · sessions:** Opus 5.5 · high · 2–4 (one session per weekly round)

**Prompt** (per week)
```
Stage BETA-1, week [n], from docs/build-plan.md.

Read CLAUDE.md and the "BETA-1" section of docs/build-plan.md. Evaluate: [paste analytics export / feedback].
First the prioritized list (impact × effort), then wait for my choice, then implement it.
PR, every check green, report with a test checklist. Then stop.
```

**Afterwards:** the arena (Phase G), then Swing and Day Trading (Phase H).

---

## 11. Phase G – The practice arena (Nutrade Plus)

**Why this phase exists.** The course promises that afterwards only practice is missing. The arena is where that practice starts, inside the app: charts you trade bar by bar, drills without end, and a practice account whose numbers behave like a trader's. It is also what Nutrade Plus sells (decision I), so it has to be worth paying for.

### The idea

David asked for the concept; `ARENA-DESIGN` turns it into the docs and the screens.

**Free for everyone**
- Every lesson of every path, the checkpoints and the final exams.
- The Practice tab: mistakes, weak concepts, scheduled review, the daily mix.
- Glossary, statistics and the streak (one lesson a day).
- 5 hearts in lessons and tests: all back five hours after the first is lost, or one per finished practice round.
- **The Daily Chart:** one chart a day, the same for everyone on the same path, played bar by bar. You pick your moment or stand aside, set stop and target, then see what happened. The result can be shared as a small grid that shows your decisions, never money. It is a reason to open the app every day, and the arena's shop window.
- **A taste of the arena**, e.g. one replay and ten drills, so you know what Plus contains.
- **Bonus side lessons** on the path (from `FUN-PASS`): short charts to spot the setup, or see that there is none. They pay gems.
- Ads between lessons (`ADS`).

**Nutrade Plus (subscription)**
- **Unlimited hearts.** A test still needs its pass mark.
- **No ads.**
- **The full arena:**
  1. **Replays.** Whole sessions, bar by bar, at your own pace: a scalping morning in 1-minute bars, a day-trading session in 5-minute bars, a swing month in daily bars with one decision each evening. You choose the stock from a small watchlist with context (gap, news, relative volume) and write your plan (entry, stop, target, size) before the trigger. Then you manage the trade, or pass.
  2. **Setup drills.** Short, unlimited reps from your path's playbook cards: a valid setup or not? Where does the stop go? How many shares for 1 %? Trade or pass? Your weak spots from the Practice tab come first.
  3. **The practice account.** A paper account per path that carries across the arena:
     - every trade posts to it with spread, fees and slippage;
     - the journal fills itself;
     - the statistics are the ones Chapter 6 teaches: expectancy, win rate against average R, the R distribution, rule breaks, results by setup and time of day;
     - your plan's daily loss limit ends the session when it is hit;
     - a reset starts a new season, and old seasons stay readable.
  4. **Scenario packs.** Themed sets beyond the paths, e.g. gap days, choppy days, trend days, news spikes, fake breakouts, the last hour, earnings weeks, a losing streak.

**Rules that carry over from the docs**
- **No timer and no autoplay:** the chart moves only when you tap (`docs/UI.md` §1, §4.4).
- **The decision is graded, the result is shown apart** (§5.1b). Standing aside is never punished.
- **The arena never costs hearts.**
- **Only synthetic charts**, labeled as practice. No real tickers.
- **Money in the arena is practice money**, never framed as income. The statistics screen carries the risk note.
- **Honest odds.**
  - The generator gives clean setups a small positive edge and poor ones a negative edge, with realistic variance: 30–40 % of right calls still lose.
  - Over 50 trades the practice account then shows what Chapter 6 teaches: the process decides the curve.
  - The app says plainly that real markets guarantee no edge. The arena's odds are a training model.
  - **No odds on screen** (David, 2026-10-03, `docs/agent.md` §3.11): the model's rates stay inside the generator. The arena shows the learner their own results — their journal, their sample — and never a setup's modeled win rate as if it were how often it works.
- **The arena does not replace paper trading on real-time data** before real money (graduate profile, point 15). The copy never implies otherwise.
- **Lessons never advertise Plus.** The paywall appears only at natural points: when the free part of the arena is used up, when hearts run out in a test (next to the free ways: wait, or practice for a heart), and in Account and Settings (`MONEY`).

**How the charts are made.**
- A chart generator (`CHART-GEN`) produces sessions from a seed: trend and range phases, volatility clusters, the intraday volume curve, gaps, a wider spread at the open, realistic ticks and volumes (`docs/agent.md` §3.6).
- The playbook's setups are planted as templates in three qualities: clean, marginal and failed. Some sessions contain nothing worth trading.
- Code checks every chart: valid candles, the planted setup is really there, the right answers can be computed.
- Hand-written replays stay for teaching; the generator makes the volume.
- Synthetic data avoids the license costs of real market data and cannot be mistaken for a signal. Real historical data can be looked at after the release (Phase L).

**Order in this phase:** the design → one replay by hand → the generator → the tab with the Daily Chart → the practice account → drills → the scalping replay bank. Swing and Day Trading get their arena content right after their chapters (`ARENA-PATHS`).

### `ARENA-DESIGN` – the arena on paper

**Goal.** The arena, the Daily Chart and the line between free and Plus are designed and written into the docs before anything is built.

**Scope**
1. **Docs:**
   - a new arena section in `docs/UI.md`, replacing §7.7 "Spot it";
   - the formats in `docs/schema.md`: generator templates, seeds, arena sessions, practice-account records;
   - the honesty rules in `docs/agent.md` §7: synthetic data, the training model's odds.
2. **Screens as clickable prototypes** (skill `prototype`), in the look from `LOOK-SYSTEM`:
   - the arena home;
   - a replay in progress: plan, management, pass;
   - the end of a replay with the process grade;
   - the practice account: statistics and journal;
   - the Daily Chart and its share card;
   - the paywall.
3. **The generator's model on one page:** which properties and parameters per path, how "clean", "marginal" and "failed" are defined, how the odds are set, how a chart is checked.
4. **Free vs. Plus** in one table, with the paywall's places and its texts: a clear price, a clear renewal, a clear way to cancel.
5. **A short spec each** for what `CHART-GEN`, `ARENA-TAB` and `SIM-ACCOUNT` build.

**Not in this stage:** code outside the prototypes.

**Model · effort · sessions:** Fable 5.1 · high (else Opus 5.5 · xhigh) · plan mode · 1

**Prompt**
```
Stage ARENA-DESIGN from docs/build-plan.md.

Read CLAUDE.md, then §0, §1, §4.1 (decision I) and all of Phase G of docs/build-plan.md, docs/UI.md in full, docs/agent.md §1, §3.6, §3.10, §3.11 and §7, and docs/schema.md § Replays.
Show me your plan first and wait for my approval. Use the "prototype" skill for the screens.

Especially important:
- Nothing in the arena may read as a signal or a promise of profit; that the charts follow a training model is disclosed, and no setup's modeled rate is shown as its odds (docs/agent.md §3.11).
- No timer, no autoplay: the chart moves only when the learner taps.
- The free part stays genuinely useful, and the paywall never interrupts a lesson.

Open a PR against main.
Report: the design in ten sentences · links to every prototype screen · the free/Plus table · open questions. Then stop and wait for my choice.
```

**You test (~30 min)**
1. Click through the prototypes on your phone: would you pay for this? What is missing?
2. Is the free part still worth using without paying?
3. Read the free/Plus table and the paywall texts.

**Done when** you have approved the design and it is recorded in the docs.

### `REPLAY-PILOT` – one replay, by hand

**Goal.** One replay first, to test the format the arena and the lessons' replay screens are built on.
- If it shows that the format carries, the twelve postponed drill packs stay canceled.
- If not, those packs get written instead.

**Scope:** one replay by hand plus its validator rules.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage REPLAY-PILOT from docs/build-plan.md. Read CLAUDE.md, §1 of docs/build-plan.md and docs/ContentToDo.md (Part 1), then follow Appendix E.2 (pilot). A PR instead of a push to main. Report with a test checklist. Then stop.
```

**You test.** Play the replay in the test bench:
- Is the "is it now?" feeling there?
- Are the grades (textbook, early, late, phantom) fair?

### `CHART-GEN` – the chart generator

**Goal.** An endless supply of realistic, checked practice charts.

**Scope**
1. **The market model** from `ARENA-DESIGN`:
   - bars from a seed, per timeframe (1-minute, 5-minute, daily);
   - trend and range phases, volatility clusters, the intraday volume curve, gaps, a wider spread at the open;
   - realistic ticks and volumes (`docs/agent.md` §3.6: price bands, volume magnitudes).
2. **Setup templates** for the scalping playbook cards (Chapter 7), each in three qualities (clean, marginal, failed), plus sessions without a setup. Swing and Day Trading templates follow in `ARENA-PATHS`.
3. **Outcomes with honest odds:** the edge per quality is a parameter. Over large samples, the share of right calls that lose stays within 30–40 % (§3.11).
4. **Checks by code:**
   - valid candles, ticks and volumes;
   - a detector confirms the planted setup, and finds nothing in a session without one;
   - the correct answers (entry, stop, size for 1 %, R) are computed, never set by hand;
   - property tests over at least 10,000 seeds, with the odds measured over the sample;
   - a render test over a sample of seeds.
5. **Deterministic:** the same seed gives the same chart on every device. The model carries a version number, so old seeds (a shared Daily Chart, a bug report) still open the same chart.
6. **Fast:** a session is generated on the phone in well under a second, on a cheap Android device too.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2–3

**Prompt**
```
Stage CHART-GEN from docs/build-plan.md.

Read CLAUDE.md, then §1, Phase G and the "CHART-GEN" section of docs/build-plan.md in full, plus the generator spec from ARENA-DESIGN (docs/UI.md, docs/schema.md), docs/agent.md §3.6 and §3.11, and the scalping Chapter 7 cards in docs/curriculum.md.
Show me your plan first (model, templates, checks) and wait for my approval.

Especially important:
- Every correct answer is computed by code, never written by hand.
- Measure the odds over at least 10,000 seeds and put the table in the report.
- The same seed gives the same chart everywhere; test it.

Open a PR against main and get every check green.
Report: what you built · the odds table · 12 sample charts (links: clean, marginal, failed, none) · the timing on a cheap device · my test checklist · open questions. Then stop.
```

**You test (~20 min)**
1. Look at the 12 sample charts: do they look like real charts, or like computer charts?
2. Can you see the setup in the clean ones? Is the marginal one really borderline?
3. Is there really nothing worth trading in the sessions without a setup?

### `ARENA-TAB` – the arena tab and the Daily Chart

**Goal.** The arena is in the app, and everyone gets one chart a day.

**Scope**
1. **The tab** as designed in `ARENA-DESIGN`. It replaces "Spot it" (`docs/UI.md` §7.7):
   - replays chosen by weak concepts;
   - tier-gated by reading level;
   - the strip at the end of a session.
2. **The Daily Chart:**
   - one chart per day and path, from a date seed, the same on every device;
   - the result grid;
   - sharing as an image or as text.
3. **The Plus gate:** every arena part asks one function whether it is unlocked. Until `MONEY`, test builds unlock everything.
4. **Never costs hearts, never timed.**
5. **Bonus side lessons** (`FUN-PASS`): from here on the generator fills them, with a new chart each time.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage ARENA-TAB from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "ARENA-TAB" section of docs/build-plan.md in full, plus the arena section of docs/UI.md, §4.4, and docs/schema.md § Replays.
Build exactly that scope.

Especially important:
- The Daily Chart is the same chart for everyone on the same path and day, and the same on every device (date seed).
- The share card shows decisions, never money or profit.
- Every Plus gate goes through one function; until MONEY, test builds unlock everything.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min + 1 week)**
1. Open the arena tab and play two replays: is the strip at the end right?
2. Play the Daily Chart on two devices on the same day: it is the same chart.
3. Share your result: does the card look good, and does it show no money?
4. Play the Daily Chart every day for a week: would you come back for it?

### `SIM-ACCOUNT` – the practice account

**Goal.** A practice account whose numbers behave like a trader's. This is where Chapter 6 becomes your own statistics.

**Scope**
1. **One paper account per path.** The starting balance comes from your plan card.
2. **Orders as the course teaches them:**
   - market, limit, stop, bracket (entry, stop and target at once);
   - fills with spread, slippage and fees as categories, never a real broker's price list.
3. **Your plan applies:**
   - risk per trade, the trade cap, and the daily loss limit, which ends the arena session when hit;
   - a rule break is recorded, never silently blocked.
4. **The journal fills itself:** setup, entry, stop, exit, R, grade, your note.
5. **Statistics** as in Chapter 6:
   - expectancy, win rate against average R, the R distribution, rule breaks;
   - results by setup and by time of day, the equity curve in R;
   - every number shows its sample size ("after 12 trades this says little").
6. **Seasons:** a reset starts a new season; old seasons stay readable.
7. **Stored locally;** `BACKEND` syncs it.
8. **Unit tests** for fills, P/L, R and every statistic, using the course's own worked examples.

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 2

**Prompt**
```
Stage SIM-ACCOUNT from docs/build-plan.md.

Read CLAUDE.md, then §1, Phase G and the "SIM-ACCOUNT" section of docs/build-plan.md in full, plus the arena section of docs/UI.md, docs/agent.md §3.6, §3.11 and §7, and the scalping Chapter 6 outline in docs/curriculum.md.
Show me your plan first and wait for my approval.

Especially important:
- Every number is computed the way the course teaches it; the unit tests use the course's own worked examples.
- Every statistic shows its sample size, and nothing reads as a promise.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

**You test (~30 min)**
1. Trade ten arena replays: does the journal fill itself correctly?
2. Break your own daily loss limit on purpose: the session ends, and the break is recorded.
3. Check two results by hand, in $ and in R.
4. Look at the statistics: are they understandable, and does the sample-size note show?

### `DRILLS` – two packs and generated drills

**Goal.**
- The two packs `selection` and `risk-calls`, which no replay replaces.
- The arena's unlimited setup drills for scalping.

**Scope**
1. Both packs are written in the session, following Appendix E.4. The Batch API is not needed for this.
2. Generated setup drills for the scalping cards, from the `CHART-GEN` templates:
   - valid setup or not, the stop, the size, trade or pass;
   - charts with no valid entry at all, where passing is the answer (your critique in `LOOK-BRIEF`);
   - weak concepts first.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage DRILLS from docs/build-plan.md. Read CLAUDE.md, docs/schema.md § Drill packs, the arena section of docs/UI.md, docs/ContentToDo.md (Part 1) and §1 and the "DRILLS" section of docs/build-plan.md. Write scalping-selection (25) and scalping-risk-calls (25) following Appendix E.4, validated under --strict, and build the generated setup drills for the scalping cards from the CHART-GEN templates. PR, report with a test checklist. Then stop.
```

**You test.**
1. In the Practice tab, play five questions from each pack.
2. In the arena, play twenty generated drills: are they fair, and do they vary?

### `REPLAY-BANK` – 22 replays for scalping

**Goal.** The 22 replays per path that `docs/curriculum.md` (§ Replays) plans, here for scalping. Only if `REPLAY-PILOT` has shown that the format carries.

**Scope**
- The generator proposes candidate sessions for each setup card and reading level.
- Claude picks them, annotates them (the moments, the decoys, the explanation for each decision) and checks them against Appendix E.2.
- A replay is written from scratch only where the generator cannot produce the case.

**Model · effort · sessions:** Opus 5.5 · high · ~4 (about six replays per session)

**Prompt** (per session)
```
Stage REPLAY-BANK from docs/build-plan.md. Read CLAUDE.md, §1 and the "REPLAY-BANK" section of docs/build-plan.md and docs/ContentToDo.md (Part 1), then follow Appendix E.2 (bank) for the cards [cards] at reading level [1/2/3], starting from CHART-GEN candidates. PR, report with a test checklist. Then stop.
```

**You test.** Play two replays per session in the arena.

---

## 12. Phase H – Swing and Day Trading paths (decision E)

All three paths ship in v1.0. Swing comes first, because Chapter 1 sends people with a full-time job there; Day Trading follows. Each path gets its chapters, its reviews, then its arena content.

**Prerequisites**
- `RULES` has the rules "per-trade risk" and "total exposure" (required, `docs/agent.md` §3.6).
- `REPLAY-PILOT` has fixed the replay format; Chapters 7 and 8 of every path contain replay screens.
- Every rule from Phase E applies from the start:
  - variance from Chapter 2;
  - `stop`/`target` from Chapter 3;
  - signs, text length, visual quota.

**Swing is different from scalping**
- Several positions at the same time.
- The risk budget binds, not the account cap.
- Overnight and weekend risk.
- 90 days on the simulator instead of 30.

**Day trading is different from scalping**
- 5- and 15-minute charts, with the daily chart as context.
- 5–10 trades a day, flat by the close.
- Wider stops: the 1 % risk budget usually decides the size, and the account ceiling is the check that still runs. Positions are typically 50–95 % of the account (`docs/agent.md` §3.6).
- The pattern-day-trader rule bites a day trader hardest. Chapter 6 Level 9 (the daily limits, where the trade cap is taught) and Chapter 8 Level 15 say it plainly, with the current wording from the market profile (decisions B and C).
- 30 days on the simulator, as for scalping.

In each path's Chapter 3, the plan card revises `setup_max_account_pct` with that path's reason.

**For EU-DE** the swing path points out: swing with cash stocks works without the PDT rule and without leverage. That is exactly the audience Chapter 1 sends to swing.

### `SWING-2` … `SWING-8`

**Goal.** Swing Chapters 2–8 following `docs/curriculum.md`.

**Scope:** one chapter per stage, in blocks of 4–6 levels, following every rule from Phase E.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per chapter

**Prompt** (`[N]` = chapter)
```
Stage SWING-[N] from docs/build-plan.md.

Read CLAUDE.md, docs/agent.md, docs/schema.md and docs/UI.md in full, the swing section for Chapter [N] in docs/curriculum.md (find it with grep), docs/ContentToDo.md (Parts 1–3: write the chapter with skills, the chart ramp and the new fields from the start), §0 ("Variance"), §1 and §12 of docs/build-plan.md, and the reference files from docs/agent.md §3.8.
Also follow the clause in Appendix E.7.
Write in blocks of 4–6 levels; after every block validate_content.py (0 errors, no warning about your files) and check_sizing.py. At the end --strict for the chapter, the render test, the three hand checks.
Open a PR against main. Report: --status table · deviations from the outline with their reason · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min per chapter)**
1. Play two lessons and the checkpoint.
2. Read one lesson as a beginner would.

**After `SWING-8`:** the path choice unlocks Swing; "Being written" goes away.

### `SWING-REVIEW`

**Goal.** Both reviews for swing: Appendix E.5 (pass A) and E.6 (pass B, with the graduate profile).

**Scope**
- Findings first, then you decide, then the corrections follow.
- The expert from `EXPERT` checks the same risky parts here if possible: Chapters 3, 6 and 7, and Chapter 8 Level 15.

**Model · effort · sessions:**
- Reviews: Fable 5.1 · high (pass A) and max (pass B).
- Corrections: Opus 5.5 · high.
- 2–4 sessions in total.

### `DAY-2` … `DAY-8`

**Goal.** Day Trading Chapters 2–8 following `docs/curriculum.md`.

**Scope:** one chapter per stage, in blocks of 4–6 levels, following every rule from Phase E.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per chapter

**Prompt** (`[N]` = chapter)
```
Stage DAY-[N] from docs/build-plan.md.

Read CLAUDE.md, docs/agent.md, docs/schema.md and docs/UI.md in full, the day-trading section for Chapter [N] in docs/curriculum.md (find it with grep), docs/ContentToDo.md (Parts 1–3: write the chapter with skills, the chart ramp and the new fields from the start), §0 ("Variance"), §1 and §12 of docs/build-plan.md, and the reference files from docs/agent.md §3.8.
Also follow the clause in Appendix E.7.
Write in blocks of 4–6 levels; after every block validate_content.py (0 errors, no warning about your files) and check_sizing.py. At the end --strict for the chapter, the render test, the three hand checks.
Open a PR against main. Report: --status table · deviations from the outline with their reason · my test checklist with real links · open questions. Then stop.
```

**You test (~20 min per chapter)**
1. Play two lessons and the checkpoint.
2. Read one lesson as a beginner would.

**After `DAY-8`:** the path choice unlocks Day Trading; no path says "Being written" any more.

### `DAY-REVIEW`

**Goal.** Both reviews for Day Trading, as in `SWING-REVIEW`.

**Scope**
- Findings first, then you decide, then the corrections follow.
- Special attention: the pattern-day-trader rule and the margin account in Chapter 6 Level 9 and Chapter 8 Level 15 (decisions B and C).
- The expert checks the same risky parts as for swing if possible.

**Model · effort · sessions:** as in `SWING-REVIEW` · 2–4 in total.

### `ARENA-PATHS` – the arena for Swing and Day Trading

**Goal.** At the release, the arena serves all three paths.

**Scope** (per path, after its review)
1. **Generator templates** for the path's Chapter 7 playbook cards, three qualities each, on the path's timeframe: daily bars and evening decisions for swing, 5-minute bars for Day Trading.
2. **Generated setup drills** for these cards.
3. **The replay bank:** 22 replays per path, made as in `REPLAY-BANK`.
4. **Scenario packs** for the path, e.g. earnings weeks for swing, gap days for Day Trading.
5. **The Daily Chart** for the path.

**Model · effort · sessions:** Opus 5.5 · high · per path 2–3 (templates and drills, then replays)

**Prompt** (per session)
```
Stage ARENA-PATHS, path [swing|day-trading], session [templates|replays], from docs/build-plan.md.
Read CLAUDE.md, then §1, Phase G and the "ARENA-PATHS" section of docs/build-plan.md, the arena section of docs/UI.md, the path's Chapter 7 in docs/curriculum.md, docs/ContentToDo.md (Part 1) and Appendix E.2.
PR, every check green, report with 12 sample charts (templates session) or the replay list (replays session) and a test checklist. Then stop.
```

**You test.** Per path: the 12 sample charts, five drills and two replays.

---

## 13. Phase I – Platform: account, subscription, ads

### `BACKEND` – accounts and sync (decision K)

**Goal.** Progress lives in an account: safe when a phone is lost, the same on every device, and the base for Nutrade Plus.

**Scope**
1. **Supabase in the EU** (Frankfurt), with access rules (RLS) on every table, tested.
2. **Sign-in with Apple, Google and email** (a one-time code). Apple's rule: an app that offers third-party logins must also offer an equivalent privacy-friendly one; Sign in with Apple covers it.
3. **No sign-in wall:**
   - the app works from the first second;
   - sign-in is offered after the first lessons, in Account and before a purchase, never forced;
   - local progress moves into the account on sign-in, without loss.
4. **What syncs:** progress, hearts, XP, streak and freezes, the plan with its history, the practice schedule, the practice account and journal, settings. The conflict rules between two devices are designed in plan mode and tested.
5. **Offline first:** everything works offline, and the sync catches up.
6. **Account deletion** inside the app and on a web page (both stores require it), and a **data export** (GDPR Art. 15 and 20).
7. **Privacy:** a data-processing agreement with Supabase, the privacy policy extended, the record of processing activities.

**You prepare.**
- A Supabase account. The free plan is enough to start; the paid plan before the release.
- The keys for Sign in with Apple and Google from the developer accounts. Claude gives you the steps.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2–3

**Prompt**
```
Stage BACKEND from docs/build-plan.md.

Read CLAUDE.md, then §1, §4.1 (decision K) and the "BACKEND" section of docs/build-plan.md in full, plus docs/agent.md §1 and §7.
Show me your plan first (data model, conflicts between two devices, moving local progress into the account, privacy) and wait for my approval.

Especially important:
- No progress may be lost: local to account, two devices, offline and back.
- Deleting the account removes everything, and a test proves it.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist · open questions. Then stop.
```

**You test (~30 min)**
1. Play three lessons without an account, then sign in: nothing is lost.
2. Sign in on a second device: the same state.
3. Play offline on one device, then go online: both devices agree.
4. Export your data, then delete the account: you are signed out, and the data is gone.

### `MONEY` – Nutrade Plus (decision I)

**Goal.** Nutrade Plus is built in: honest, within the store rules, and worth its price.

**Scope**
1. **RevenueCat** (`docs/agent.md` §1) with one entitlement, `plus`, and two products: monthly and yearly, optionally with a free trial.
2. **What Plus unlocks,** all through one check:
   - unlimited hearts (the switch from `LOOP-HEARTS`);
   - no ads (`ADS`);
   - the full arena (Phase G).
3. **The paywall,** as designed in `ARENA-DESIGN` (`docs/UI.md` §7.8):
   - only at natural points: the free part of the arena used up; out of hearts in a test, next to the free ways (wait, practice for a heart); Account and Settings;
   - never in a lesson, never at app start, never over a reveal;
   - a clear price per period, a clear renewal, a clear way to cancel; a trial names its end date, and a reminder comes the day before it ends;
   - no fake urgency, no pre-selected expensive option without its price.
4. **A purchase never needs an account.** "Restore purchases" works without one; with an account, Plus follows you to other devices.
5. **Prices per region** from the stores' price tiers: `MONEY` proposes, you decide (decision R).
6. **Terms:** the subscription terms, the EU right of withdrawal for digital content, cancellation.
7. **Never:** single purchases of hearts or streak freezes, pay-to-pass, "profit" promises.
8. **Tests:** sandbox purchase, renewal, expiry, refund, restore, offline.

**You prepare.**
- The paid-apps agreements with Apple and Google, with the business's tax and bank details (decision P).
- A RevenueCat account.

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 1–2

**Prompt**
```
Stage MONEY from docs/build-plan.md. Prices: [monthly, yearly, trial – or "propose"].

Read CLAUDE.md, docs/agent.md §1 and §7, docs/UI.md §5.2, §7.7 and §7.8, and §1, §4.1 (decision I) and the "MONEY" section of docs/build-plan.md in full.
Show me your plan first and wait for my approval.

Open a PR against main and get every check green.
Report: what you built · every paywall text · my test checklist (sandbox purchases) · open questions. Then stop.
```

**You test.**
1. A sandbox purchase on iPhone and on Android; restore; cancel.
2. With Plus: the hearts show ∞, there are no ads, the whole arena is open.
3. Without Plus: every lesson is playable, the Daily Chart and the taste of the arena work, and the paywall appears only where it should.

### `ADS` – ads in the free tier

**Goal.** Ads that pay a little and never harm learning or trust.

**Scope**
1. **Google AdMob** via `react-native-google-mobile-ads` (an Expo config plugin). Ads work in development and store builds, not in Expo Go or the web preview.
2. **Consent:**
   - Google's consent tool (UMP, a certified consent platform) wherever the law requires consent (EEA, UK, Switzerland);
   - personalized ads only with consent;
   - recommendation for v1.0: no personalized ads at all, so there is no tracking prompt on the iPhone (decision S).
3. **Placement:**
   - at most one full-screen ad after a finished lesson, once its result has been shown, and not after every lesson; the caps per day are set here;
   - never inside a lesson, test, reveal, the arena or onboarding; never on the first day; never at app start;
   - no banners and no rewarded ads in v1.0.
4. **Blocked content:**
   - every category of financial products and services the network offers (brokers, trading and investing apps, crypto, forex and CFDs, loans), gambling and betting, get-rich-quick, and age-restricted content;
   - the reason: an ad for a broker inside a trading course reads like a recommendation (`docs/agent.md` §7);
   - blocking is best effort, so there is a "Report this ad" link, and after the release the served advertisers get a look once a month.
5. **Plus users see no ads.** A test proves it.
6. **Privacy:** the privacy policy, the store privacy details and the consent texts are extended, and the age rating is checked again.

**You prepare.** An AdMob account, in the business's name.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage ADS from docs/build-plan.md.

Read CLAUDE.md, docs/agent.md §1 and §7, docs/UI.md §7.8, and §1, §4.1 (decision I) and the "ADS" section of docs/build-plan.md in full.
Research the current AdMob and consent requirements and name your sources with their date.

Especially important:
- No ad inside a lesson, test, reveal or the arena; financial and gambling categories blocked; no ads for Plus.

Open a PR against main and get every check green.
Report: every place an ad can appear · the blocked categories · my test checklist · open questions. Then stop.
```

**You test.**
1. Play five lessons in a test build: ads only where planned.
2. Decline consent: the app still works.
3. With Plus: no ad anywhere.

### `UPDATES` – content without store updates

**Goal.** Content can change after the release without a new store build and without lost progress.

**Scope**
- `expo-updates` with channels (preview, production).
- Content versions, per language (Phase J).
- **Progress migration:** if a lesson id changes after the release, a migration table makes sure no progress is lost. The rule for it is in `docs/agent.md` §6.
- Chapters and languages are loaded on demand instead of everything in the first bundle.
- Offline behavior.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage UPDATES from docs/build-plan.md. Read CLAUDE.md, docs/agent.md §6 and §1 and the "UPDATES" section of docs/build-plan.md. PR, every check green, report with a test checklist. Then stop.
```

**You test.**
- Send a content update to the preview: it arrives without reinstalling.
- A renamed test lesson keeps its progress.

### `TECH` – clean-up, only backed by measurements

**Goal.** Clean up where a measurement shows that it helps.

**Scope**
1. **Measure first:** bundle size, cold start, memory and frame rate on a cheap Android device.
2. **Then only what the measurement justifies:**
   - Split `Chart.tsx` (1,818 lines).
   - Optionally `expo-router`.
   - Optionally a JSON schema as the single source for the TS types and the validator (S39).

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage TECH from docs/build-plan.md. Read CLAUDE.md and §1 and the "TECH" section of docs/build-plan.md. Measure first and report; change only what a measurement justifies, and measure again afterwards. PR, every check green, report (measurements before/after) with a test checklist. Then stop.
```

**You test.** The app feels the same or faster; the measurements before and after are in the report.

---

## 14. Phase J – Languages (decision M)

**The principle.**
- English is the source. Every other language is generated from it by a checked pipeline and never edited by hand.
- Native speakers read the key texts.
- The phase starts when the English content is final, after the path reviews and `EXPERT`. A later change to an English file re-translates just that file (its source hash changes).

**The language does not decide the market.** A Spanish speaker in Mexico may trade US stocks, so the market profile stays a setting of its own (`MARKETS`).

### `I18N-PIPELINE` – how a language is added

**Goal.** Adding a language becomes a repeatable, checked process. It is proven on German first, because you can judge German yourself.

**Scope**
1. **The app:**
   - the language follows the phone and can be changed in Settings;
   - numbers, currencies and dates go through the locale (`Intl`): a German reader sees "1.234,50 $" for a US stock; plurals go through the i18n library;
   - the number keypad and the parser accept a decimal comma;
   - fonts for every planned script; the layout survives longer text (German runs about 30 % longer than English).
2. **The content:**
   - translations live apart from the source, e.g. `content/i18n/<lang>/…`, with the same ids and structure, and a source hash per file;
   - the translator is `tools/translate.py` via the Claude API, or Claude Code sessions: the stage measures cost and quality on one chapter and proposes one;
   - per language: a glossary (termbase), a style sheet (tone, formal or informal address, which terms stay English, e.g. "Stop-Loss") and a do-not-translate list (`{{market.*}}` tokens, ids, tickers);
   - screens that play with English words (letter tiles, word order) are adapted, not translated literally, and flagged.
3. **Checks per language** (`validate_content.py --lang xx`):
   - the same structure and ids as English, the tokens intact;
   - every number keeps its value (only the format may change), and the answer keys stay the same;
   - length limits per language, and no English left over;
   - the render test per language, and a contact sheet for the longest language.
4. **Store texts and legal texts** go through the same pipeline. Which legal versions are binding is the lawyer's call (`LEGAL-FINAL`).
5. **The German pilot:** the whole UI and Chapter 1 in German. You read it.
6. **The list of launch languages** (decision T): the stage proposes it, with store markets, effort and script. You decide. Right-to-left languages (Arabic, Hebrew) need the stage `RTL`.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2

**Prompt**
```
Stage I18N-PIPELINE from docs/build-plan.md.

Read CLAUDE.md, then §1, §4.1 (decision M), Phase J and the "I18N-PIPELINE" section of docs/build-plan.md in full, plus docs/UI.md §9, docs/agent.md §1 and §3.9, and docs/schema.md.
Show me your plan first (file layout, translator, checks, costs) and wait for my approval.

Especially important:
- No translated file is ever edited by hand; everything is regenerated from English plus glossary and style sheet.
- A number that changes its value in translation is an error, not a warning.
- Measure cost and time for one chapter before proposing the full run.

Open a PR against main and get every check green.
Report: what you built · cost and quality of the pilot · the proposed language list · my test checklist with real links · open questions. Then stop.
```

**You test (~45 min)**
1. Switch the app to German: the whole UI is German, and the numbers look German.
2. Play Chapter 1 Levels 1–4 in German: does it read like a German app, or like a translation?
3. Note every term that sounds wrong; they go into the German glossary.
4. Choose the launch languages.

### `MARKETS` – market profiles for the launch markets

**Goal.** Learners in every launch market get correct local facts.

**Scope**
1. The market stays a setting of its own ("the market I trade").
2. Profiles for the launch markets where the rules differ (e.g. the UK), or a generic "international" profile that explains the concept and says that the rules differ by country.
3. Every profile has sessions, currency, regulation notes with a `checked:` date and a source, and tax as "ask a tax advisor where you live".
4. The validator checks that every profile fills every token. Chapter 8 Level 15 of every path renders with every profile.
5. Sentences a lawyer or the expert should check are listed.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage MARKETS from docs/build-plan.md. Launch markets: [list].
Read CLAUDE.md, docs/agent.md §7, content/market_profiles.yaml and §1 and the "MARKETS" section of docs/build-plan.md. Research every rule on the web and name every source with its date. No advice, no provider names, no tax rules.
PR, every check green, report: sources · sentences for the lawyer · my test checklist. Then stop.
```

**You test.** Play Chapter 8 Level 15 with two of the new profiles.

### `TRANSLATE-1` … `TRANSLATE-n` – the launch languages

**Goal.** Every launch language, one batch at a time.

**Scope per stage:** one batch of 3–5 languages: glossary and style sheet, UI, content, store texts. Every check green, contact sheets.

**Suggested batches** (the list itself is decision T):
1. Western Europe and Latin America, e.g. Spanish, French, Italian, Portuguese (Brazil), Dutch.
2. Central and Eastern Europe and Turkey, e.g. Polish, Czech, Romanian, Turkish.
3. Asia, e.g. Japanese, Korean, Chinese (simplified), Hindi, Indonesian, Vietnamese.
4. Right to left, after `RTL`, e.g. Arabic, Hebrew.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per batch

**Prompt**
```
Stage TRANSLATE-[n] from docs/build-plan.md. Languages: [list].
Read CLAUDE.md, §1, Phase J and the "I18N-PIPELINE" and "TRANSLATE" sections of docs/build-plan.md. Run the pipeline for these languages. Fix every failed check through the glossary or the style sheet — never by editing a translation by hand — and report the numbers per language.
PR, every check green, report with contact sheets and a test checklist. Then stop.
```

**You test (~15 min per batch).** Switch the app to each language and play one lesson. You don't need to understand it: look for cut-off text, English leftovers and broken numbers.

### `RTL` – right-to-left languages

Only if Arabic, Hebrew or another right-to-left language is on the list.

**Scope**
- The layout mirrors: the path map, buttons, the direction of "back".
- Charts keep time running left to right, and numbers stay left to right.
- Text alignment.
- Tests with a right-to-left language on every screen type.

**Model · effort · sessions:** Opus 5.5 · high · 1

**You test.** One lesson and the arena in Arabic or Hebrew: nothing overlaps, and the charts read left to right.

### `LANG-REVIEW` – native speakers

**Goal.** No launch language embarrasses the app.

**Scope**
1. **What a native speaker reads in every language:** the risk note and the disclaimer, onboarding, the paywall and the Plus texts, the store texts, and one full lesson.
2. **Who:** testers from `BETA-1`, friends, or freelance proofreaders at a fixed price per language.
3. **Their findings** go into the glossary and the style sheet, and the pipeline runs again.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 (applying the findings)

**You:** find the readers, send each one the links Claude prepares, and bring the findings back.

---

## 15. Phase K – Release

### `A11Y-PERF` – accessibility and speed on real devices

**Goal.** The app works for everyone and runs smoothly on cheap devices too.

**Scope**
- **Screen readers:** a whole lesson, a checkpoint and an arena replay with VoiceOver (iPhone) and TalkBack (Android).
- **Large text:** Dynamic Type up to 130 %, also in the longest launch language.
- **Reduce motion, the color-blind palette, contrast.**
- **Cheap devices:** a small iPhone (SE) and a cheap Android device; the motion stays smooth (decision H), and the generator stays fast.
- **Offline:** flight mode.
- **Battery.**

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage A11Y-PERF from docs/build-plan.md. Read CLAUDE.md, docs/UI.md §10 and §1 and the "A11Y-PERF" section of docs/build-plan.md. Check what can be checked automatically, fix the findings and write me the device checklist. PR, report. Then stop.
```

**You test (~30 min).** The device checklist from the report, with VoiceOver or TalkBack on.

### `LEGAL-FINAL` – review by a lawyer

**You:** a lawyer for IT and financial law reviews (who, is decision N; see below for affordable ways):
- all legal texts, and which language versions are binding;
- the risk note and the wording in Chapter 8 Level 15 of every path and in the market profiles, especially the line against investment advice;
- the arena's honesty rules: synthetic data, the training odds;
- the name Nutrade and its trademark, including the coexistence with the NUTRADE marks for supplements (classes 5, 35) and in Mexico (`BRAND`);
- the subscription terms and the right of withdrawal (`MONEY`);
- ads: the consent and the blocked categories (`ADS`);
- privacy: account, analytics, ads.

**Keeping it affordable**
- **Prepare the questions.** Claude writes a short question list with the exact texts, e.g. "Is this financial education and not investment advice?", "Is this disclaimer enough?", "Which language version is binding?". A lawyer answers a focused list in hours, not days. Ask for a fixed price up front.
- **Legal-text services for apps** with an update service (e.g. IT-Recht Kanzlei, eRecht24): imprint, privacy policy and terms for a monthly fee, kept current when the law changes. Compare the current offers; the lawyer then only checks what is specific to Nutrade.
- **The IHK:** once your business is registered, you are usually a member of your local chamber of commerce. Many IHKs offer free advice for founders and general legal information.
- **Student law clinics:** some universities offer free, supervised legal advice, some of it for founders. Ask locally.

Afterwards a session applies the changes: Opus 5.5 · high.

### `STORE-LISTING` – the store entry

**Goal.** The store entry is complete in every launch language and promises nothing the app does not deliver.

**Scope**
- **Screenshots** in the currently required sizes, for every launch language, generated by a script from the web build (deep links, `?lang=`), not by hand.
- **Texts** in every launch language: title, subtitle, description, keywords. They go through the pipeline and are adapted per market: keywords are researched, not only translated. You read the German texts.
- **Category:** education.
- **Mandatory details:** the age-rating questionnaire, the privacy details (Apple) and "Data safety" (Google), now with account, subscription and ads, plus support and privacy URLs.
- **Review note:** synthetic data, no real trading, sign-in optional, how to test Plus (a test account).
- **No words like "profit", "gain" or "earn money"** (`docs/agent.md` §1, §7 and the store rules).

**Model · effort · sessions:** Sonnet 5 · high · 1–2

**Prompt**
```
Stage STORE-LISTING from docs/build-plan.md. Read CLAUDE.md, docs/agent.md §1 and §7, and §1, Phase J and the "STORE-LISTING" section of docs/build-plan.md. Launch languages and markets: [the list from decision T]. Put everything under store/ and tell me what I have to enter where. PR, report. Then stop.
```

**You test.** Read the English and German texts and look at the screenshots on your phone: would you download the app?

### `BETA-2` – the release candidate

**Goal.** The release candidate survives a last test with real users.

**Scope**
- TestFlight external (with beta review) and the Play closed test.
- Google's required test (≥ 12 testers × 14 days), if your Google account is a personal one and `BETA-1` did not already fulfill it.
- **Everything is in:** all three paths, the arena, sign-in and sync, Plus in the sandbox, ads, every launch language.
- **Testers:** yours (decision O), including native speakers of the launch languages.
- Last fixes, weekly as in `BETA-1`.

**Model · effort · sessions:** Opus 5.5 · high · 1–3 (one session per round)

**Prompt** (per round)
```
Stage BETA-2, round [n], from docs/build-plan.md. Read CLAUDE.md and the "BETA-1" and "BETA-2" sections of docs/build-plan.md. Evaluate: [analytics export / feedback]. First the prioritized list, then my choice, then implement it. PR, every check green, report with a test checklist. Then stop.
```

**Done when** the definition of done in §0 is fully met.

### `RELEASE` – submission and launch

**Goal.** v1.0 is in the stores, and the first week afterwards is looked after.

**Scope**
1. **Submit** to Apple and Google, in every launch market.
2. **Answer reviews:** Claude drafts answers if a review raises an objection.
3. **Staged rollout:** on Google Play 10 % → 50 % → 100 %; on Apple, the phased release.
4. **Every day for a week**, look at crashes, ratings and the first subscriptions.
5. **Hotfixes:** via EAS Update for JS and content bugs, otherwise a new build.
6. **Retrospective** after one week.

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage RELEASE from docs/build-plan.md. Read CLAUDE.md, §0 (definition of done) and the "RELEASE" section of docs/build-plan.md. Check the definition of done point by point with evidence, create the release checklist and accompany the submission. Report. Then stop.
```

---

## 16. Phase L – After the release (outlook)

Not part of v1.0. Every idea here gets a stage of its own in this plan before it starts.

- **More languages:** each one is a `TRANSLATE` run (Phase J).
- **`FRIENDS`:** an opt-in friends league instead of a global leaderboard (W7). Scored on decisions, not on the amount of XP.
- **`AI-EXPLAINER`:** "Explain it differently" after a wrong answer, via the Claude API (K9). Only with hard guardrails: no signals, no investment advice, only the lesson's material. A candidate for Nutrade Plus.
- **Arena extras:** monthly challenges and more scenario packs; real historical data, if a license is affordable.
- **Widgets:** streak (today's lesson done or not), the Daily Chart.
- **Tier card:** sharing, achievements (the Trader Card with stats was not taken in `DESIGN-REVIEW`).
- **Tablet and landscape charts.**

---

## 17. Appendix

### A. Template: bug report

```
Stage:
Link: <preview>/#level-09-2/3
Device: (e.g. iPhone 13, light)
What I did:
What happened:
What I expected:
How bad: blocking / annoying / minor
(attach a screenshot if possible)
```

For several items, just write them one below the other. Claude sorts them.

### B. Template: accepting a stage

```
OK <STAGE> – merge
Checklist: 1 ✓ 2 ✓ 3 ✗ (see below) 4 ✓
Fun (1–5):
What I noticed (small things too, and things for later stages):
```

If the list has an ✗, do not answer "OK" but send the bug report.

### C. Newcomer test (for `FUN-PASS` and `VARIANCE`)

1. **The person:** no trading knowledge, if possible not from your closest circle.
2. **Introduction:** only say "This is a learning app for trading, try it out". No further explanation.
3. **Observe:** let them think aloud, watch, and do not help.
4. **Take notes:** every hesitation, every "huh?", every smile. With the screen link.
5. **Ask afterwards:**
   - What was fun? What was annoying?
   - Explain to me in one sentence what a spread is. (Or the lesson's own term.)
   - You decided right and still lost – what does that mean? (after 1·2-4)
   - Would you carry on tomorrow? Why (not)?
6. **Result:** give your notes to Claude unedited.

### D. Beta questionnaire (end of week 1 and week 2)

1. How much fun is the app? (1–5)
2. How well do you understand what is explained? (1–5)
3. Too hard, just right, or too easy?
4. What annoys you most?
5. What do you like best?
6. You decided right and still lost money. What does that mean? (free text)
7. Your account holds $10,000. You risk 1 % per trade, and your stop is $0.20 away. How many shares do you buy? (Correct: 500)
8. Would you recommend the app? (0–10)

### E. Prompt frame and content prompts

**E.0 – The frame of every prompt** (the stages above fill it in; paste it into a new session)
```
Stage <NAME> from docs/build-plan.md.

Read CLAUDE.md, then §1 and the "<NAME>" section of docs/build-plan.md in full; read the places in docs/ it names.
<Content stages: docs/ContentToDo.md as well.>
Build exactly that scope — nothing from later stages.

<Especially important: …>

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.
```

The following detailed prompts come from the previous plan and have proven themselves. Updated:
- Decisions A–C are now made.
- A PR instead of a push to `main`.
- The new [v4] rules apply.
- **[DESIGN-REVIEW]** The rules of `docs/ContentToDo.md` Part 1 apply: no odds, the chart ramp, don't overdo, terms used well, standalone questions.

**E.1 – OFFER (Chapter 8 Level 15 and its renumber)**
```
Read CLAUDE.md, then docs/agent.md §1, §3.6, §3.11, §3.12 and §7, docs/schema.md and
docs/UI.md in full, then the Chapter 8 section of docs/curriculum.md - find it with
`grep -n 'Chapter 8 —' docs/curriculum.md` and read that range; the first match is the
scalping one.

Part 1 - the renumber, committed on its own.
In content/paths/scalping/chapter-08-the-trading-day/, Levels 15-17 become 16-18:
git mv each level-15-*.yaml to level-16-*.yaml, 16 to 17, 17 to 18. Highest first so
nothing collides. Update each file's `id`, and repair the `prerequisite` chain so it
reads straight through with Level 15 absent for now (14's last sub -> 16-1). Grep the
repo for anything naming those ids or the old titles and fix it (docs, the content
index, tests). Run `python3 tools/validate_content.py`; 0 errors. Commit as
"content: renumber chapter 8 levels 15-17 to 16-18".

Part 2 - write Level 15, "What You'll Actually Be Offered", 4 sub-levels, per the
curriculum table. Read first, and do not contradict: Chapter 3 Level 10 (the two
ceilings), Chapter 6 Levels 1-2 (the stop, R) and Level 9 (session limits), Chapter 3
Level 14-1 (borrow availability, and its {{market.scalping_note}} screen - build on it,
never repeat it), and Chapter 1 Levels 12-13 (what they say about accounts and shorting).

The product decisions are made (docs/build-plan.md §4.1, docs/agent.md §1.1 and §3.6):
(A) the path ends at a person who can start - this level gives the knowledge for the
first real account, and it is still orientation, not instruction; (B) a short needs a
margin-enabled account - say so plainly; (C) several same-day round trips need a margin
account, and in the US the pattern-day-trader rule applies below the equity threshold in
{{market.regulation_note}} - say so plainly, against the six-trade session this path
teaches.

  15-1  The two account types and what each allows. A cash account cannot borrow, so it
        cannot short at all - and 38% of this path's decisions are shorts. In Europe, the
        leveraged wrappers this path did not teach: recognize them, never use them here.
  15-2  What leverage does to numbers they already own. R is unchanged - the stop is
        still the stop. The ruin arithmetic is not: a deposit that survives six
        stop-outs on cash does not survive six at 5:1. Use Chapter 3's account sizes.
  15-3  What the rules do to the plan they wrote. {{market.regulation_note}} in place;
        the pattern-day-trader threshold against the six-trade session Chapters 6 and 8
        teach; settled funds against the same. Tax gets exactly one screen: profits are
        taxed, treatment differs by country and holding period, ask an adviser - no
        rate, no jurisdiction rule, no worked example (§7).
  15-4  Practice: choosing the account that fits their own plan sheet, and the checklist
        for judging a broker (regulation, deposit protection, cost structure, order
        types, borrow) - criteria only, never a name.

Also in this stage, content/market_profiles.yaml: EU-DE fee_note names no prices (§7);
EU-DE regulation_note says precisely what ESMA's negative-balance protection covers
(leveraged CFDs), not "losses are capped at the account"; the US pattern-day-trader
wording is checked against the current FINRA rule (the rule is under reform - search,
cite the source and date in the report); add a `checked:` date to every regulation
note; timezone "German time" instead of "CET"; first_minutes in the same format as
premarket.

Non-negotiable:
- No product, platform or provider named. No mechanics for opening or using a
  leveraged account. Nothing phrased as a recommendation. §7 governs every screen.
- Every number obeys docs/agent.md §3.6, including both ceilings and the account cap;
  the [v4] rules in §3.11 and §3.12 apply to every decision and numeric screen.
- {{market.*}} tokens for every session time, index and regulation note - never a
  literal clock time, never a jurisdiction claim written in prose.
- Set `reinforces: [3, 6]` per the curriculum table.

Run `python3 tools/validate_content.py --strict`, `tools/test_validate.py` and
`tools/check_sizing.py`; 0 errors, no warning naming a file you wrote. Commit as
"content: chapter 8 level 15" and open the stage PR.

Report: the four subs with their screen mix, every place you used a {{market.*}} token
instead of a jurisdiction claim, your sources for the regulation notes with dates, and
any sentence you were unsure sits on the right side of the §7 line - flag those rather
than deciding them.
```

**E.2 – REPLAY-PILOT and REPLAY-BANK**

Pilot:
```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4
and §7.7 in full. Then read content/paths/scalping/chapter-07-scalping-playbook/
level-02-1.yaml and level-02-2.yaml - the VWAP bounce card and its five fields are the
thing this replay is an instance of.

Write one replay to content/replays/scalping/vwap-bounce-01.yaml: reading level 2
(setup named, card hidden), ~60 bars, one clean VWAP bounce and two decoys that each
fail exactly one named field of the same card.

Then extend tools/validate_content.py with the replay rules from docs/schema.md
§ Replays - every error and warning listed there - and add cases to
tools/test_validate.py proving each one fires, in the style already there.

Non-negotiable, and check each by hand before you report:
- trigger_bar equals the highest filled_at of that setup's own fields. If it does not,
  the replay is ungradeable.
- Each decoy's `fails` names a field of its card, and that field either never fills or
  fills after the decoy's bar.
- Every stated shares × price is inside the 95% account ceiling, and
  tools/check_sizing.py sees the file.
- Candle high >= max(open, close) and low <= min(open, close) on all ~60 bars.
- Prices in the scalping band ($10-$30), median bar volume in 4,000-500,000.
- At most two fields marked `marginal`.

Run `python3 tools/validate_content.py`, `--strict`, `tools/test_validate.py` and
`tools/check_sizing.py`. Commit as "replays: pilot VWAP bounce plus validator rules"
and open the stage PR.

Report: the bar series with each marked moment and what fills at it, the three grades a
learner would get for acting at bars trigger-1, trigger and trigger+2, and your honest
read on whether 60 hand-authored bars is sustainable 22 times per path.
```

Bank (per session, three replays):
```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4.
Read content/replays/scalping/vwap-bounce-01.yaml - the pilot - and the last replays you
wrote, so bar rhythm and decoy style continue rather than restart. Read the Chapter 7
level that teaches [card], for the five fields.

Write [3] replays for [card] to content/replays/scalping/, at reading level [1/2/3] per
the table in docs/curriculum.md § Replays.

Every rule in docs/agent.md §3.10 binds. The two that go wrong silently:
- A decoy you cannot explain is noise, not difficulty. Each fails exactly one named
  field, and the note says which. If you cannot name it, cut the decoy.
- The arithmetic spreads across 60 bars and no single screen shows it all. Recompute
  every stop distance, share count, R-multiple and filled_at from the bars as written.

Verify each file alone before writing the next. Run `validate_content.py --strict`,
`test_validate.py` and `check_sizing.py`; 0 errors, no warning naming a file you wrote.
Commit as "replays: [card] levels [n]" and open the stage PR.

Report: per replay, the marked moments and their labels, which field each decoy fails,
and anything in the placement table you could not honor and why.
```

**E.3 – State chips (part of `CONTENT-FIX-3`, `-6`, `-7`)**

Current share: Chapter 1 0 % · 2 100 % · 3 37 % · 4 100 % · 5 100 % · 6 38 % · 7 **16 %** · 8 74 %. The 0 % in Chapter 1 is probably right; check that first.
```
In content/paths/scalping/chapter-NN-*/, move session state out of chart-decision
scenario prose and into the screen's `state` chips: day in R, the limit, trades taken,
size, account. Chapters 2, 4 and 5 are already at 100% - read one of their files first
and match how they phrase what is left behind.

What stays in the scenario: what the chart shows and what the learner is looking at.
What moves to chips: the numbers describing the learner's own session.

Two rules from §3.4 that this work exists to serve, and that it is easy to break:
- A scenario describes, it does not conclude. Do not let the shortened sentence become
  three verdict words that answer the question before the chart is read.
- No two consecutive sub-levels may end up with the same sentence shape. Moving state
  out makes scenarios shorter and more alike; vary what remains.

Report the percentage before and after, and any scenario where the state genuinely
belonged in the sentence - those are legitimate and should be listed, not forced.
```

**E.4 – DRILLS (per pack)**
```
Write [25] drill screens for the pack "[pack id]", covering these concepts:
[concept list]. Format per the drill-pack spec in docs/schema.md.

These are drills, not a lesson: no intro, no theory, no summary - question screens only,
each standing alone. The learner has already been taught this in [chapter/level];
assume it and test it.

Vary the interaction across the pack and vary the difficulty: about a third should be
near-misses where the right answer is "pass" or "no trade". Answer-key hygiene per
docs/agent.md §3.5 applies to the pack as a whole - check the distribution across all 25
before you finish. The outcome rule in §3.11 and the sign rule in §3.12 apply too.
Price and volume bands per §3.6. Every number arithmetically sound.
```

**E.5 – Review pass A (does it teach?)**
```
Read CLAUDE.md and the docs it names. Then read the complete [path] path in path order:
content/shared/chapter-01-market-basics/, then content/paths/[path]/ chapters 2-8, every
sub-level, as a learner with zero prior knowledge. `python3 tools/export_readable.py`
gives you each chapter as readable text.

Check: terms used before definition across chapters; callbacks to things not yet taught;
the difficulty curve, and whether any level jumps or stalls; question types and prompts
repeated across chapters; distractors that give the answer away; chart-decision "best"
answers that do not follow from the lesson just given; whether variance is taught before
a correct decision first loses, and whether every such reveal reads as "right call,
losing trade" rather than as a mistake; worked numbers; the Chapter 7 playbook setups
against the sources named in docs/agent.md §4; {{market.*}} tokens used where required;
anything a beginner would find boring, patronising or confusing; whether anything is
repeated enough to stick; and whether the questions are answerable by someone who
genuinely understood the lesson and nothing more.

Run `python3 tools/validate_content.py`, `--strict`, `tools/check_sizing.py` and
`tools/test_validate.py` first, so you do not re-report what a tool already catches.

Then give a numbered findings list, most important first, naming the file and screen for
each. Change nothing. Wait for approval before any fix.
```

**E.6 – Review pass B (does it survive reality?) + graduate profile**
```
Read CLAUDE.md, then docs/agent.md §1, §3.6 and §7 in full, content/market_profiles.yaml,
and the graduate profile in docs/build-plan.md §0.

This pass does not check whether the course teaches well - Pass A does that. It checks
whether the course survives contact with reality. Work these five questions across the
whole [path] path:

1. Every fixed product decision in §1 and every rule in §7: is it *delivered* - in the
   right place, at the right weight - not merely stated in the docs? Name the file and
   screen where each is delivered, or report it as unmet.
2. Every trade the content teaches, against the account the content describes. Can a
   learner actually place it? With which account type, how much capital, which
   permissions? Name any trade the described account cannot execute.
3. Every rule the content teaches, against the rules that actually bind in each market
   profile: position limits, trade limits, settlement, borrow, and whatever
   {{market.regulation_note}} promises.
4. The handover. At the last screen of the path, what does the graduate still not know
   that stands between them and the first thing the path tells them to do?
5. The graduate profile, point by point: where is each point taught (file, screen), or
   is it missing - and where would it belong?

Two method rules, and ignoring them is how this pass fails:
- Match counts lie. Read the hits. A previous scan reported `margin` and `settle` as
  covered; every match was the word "marginal" and the verb "settles". A grep result is
  a place to look, never an answer.
- Grep the concept, not the word. The same scan reported the instruments lesson absent;
  it exists inside {{market.scalping_note}}, which contains neither "leverage" nor
  "CFD". Before concluding something is missing, ask what it would be called here.

You are worst at this pass, because it needs knowledge from outside this repository.
Where you cannot decide, say so and name the decision rather than guessing.

Numbered findings list, most important first, file and screen for each. Change nothing.
```

**E.7 – Clause for new paths (Swing, Day Trading)**
```
The Scalping path's Chapter [N] covers the same ground for a different holding period.
Read it for structure, pacing and screen mix - then write for this path's timeframe from
scratch. Do not port examples across. Where the honest answer is that this path does the
same thing scalping does, say so in one screen and move on rather than padding the level.

One rule changes for this path (docs/agent.md §3.6): the concentration teaching is
scalping's. On swing the risk budget binds, not the account ceiling; positions run
10-50% of the account and several are open at once, so total exposure and total open
risk are what matter - the validator checks both. Chapter 3 revises the learner's
`setup_max_account_pct` with this path's reason. Overnight and weekend gaps are this
path's own risk; say what a gap does to a stop.

On day trading one position is open at a time, occasionally two, but the stop is wider
than a scalp's: the 1 % risk budget usually decides the size, and the account ceiling is
the check you still run (positions 50-95 % of the account). 5-10 trades a day, flat by
the close; the daily loss limit ends the day. Several same-day round trips need a margin
account, and in the US the pattern-day-trader rule applies below its equity threshold -
Chapter 6 Level 9 (the daily limits) and Chapter 8 Level 15 say so plainly (decisions B and C), with
{{market.regulation_note}} for the current wording. Chapter 3 revises
`setup_max_account_pct` with this path's reason.

Every [v4] rule applies from the first file: variance (§3.11) from Chapter 2, stop and
target on directional decisions from Chapter 3, signs (§3.12), text length, spelling,
visuals.
```

**E.8 – SIZING** (for any chapter in which `check_sizing.py` reports breaches)
```
Read CLAUDE.md and docs/agent.md §3.6 in full - the two ceilings, the account cap, the
per-path table and the price bands.

Run `python3 tools/check_sizing.py --chapter N` and re-size every position it lists so
that shares × decision price <= 0.95 × the account named in that file (and, after the
learner's plan card, the plan's ceiling - docs/agent.md §3.6).

How to re-size, in this order of preference:
1. Lower the share count. Check what the new count does to every other line in the same
   file - check_sizing.py prints them.
2. Shift the whole screen's prices by a constant. This preserves every cent-level
   distance, so stop distances, R-multiples and dollar totals stay exactly correct.
   Keep the result inside the path's price band (§3.6).
3. Raise the account named in the file, but only within $5,000-30,000 and only if the
   file's own narrative allows it.

Never change a stop distance to make the arithmetic work - that changes what the lesson
teaches. After each file, recompute by hand: stop distance, share count, risk in
dollars, R-multiple, and every total the screens quote. Then run validate_content.py,
check_sizing.py --chapter N and test_validate.py: 0 errors, 0 breaches in your chapter.
Open the stage PR. Report the breach count before and after and which method you used
where.
```

### F. Where each review item lands

Ids from `docs/review-2026-09-25.md`.

| Item | Stage |
|---|---|
| M1 plan overview | `STABLE-APP` |
| M2 depth-ladder | `STABLE-DATA` |
| M3 `levels` NaN | `STABLE-DATA` |
| M4 recap | `STABLE-APP` (renderer), `CONTENT-FIX` (`card:`) |
| M5 amber sentence | `STABLE-APP` |
| M6 screen-reader leak | `STABLE-APP` |
| M7 reveal | `STABLE-APP` |
| M8 risk note, legal, onboarding | `ONBOARDING`, `LEGAL-DRAFT`, `LEGAL-FINAL` |
| M9 outcome bias | `RULES`, `VARIANCE`, `CONTENT-FIX-1…8` |
| M10 signs | `RULES`, `CONTENT-FIX` |
| M11 hearts dead end | `LOOP-HEARTS`, `PRACTICE` |
| M12 PR #13 | `MERGE` ✅ |
| M13 wire in the content | `WIRE` |
| M14 CI | `CI`, `WIRE`, `STABLE-DATA` |
| M15 50 % vs. exercises | `RULES` (plan-aware cap), `CONTENT-FIX-2` |
| M16 decisions A–C | `DOCS` ✅, `OFFER` |
| M17 market profiles | `OFFER` |
| S1 visuals | `VISUALS`, `CONTENT-FIX` |
| S2–S5 type, small displays, thumb zone, pace | `LOOK-BRIEF`, `LOOK-SYSTEM` |
| S6–S8 charts, buttons, match | `LOOK-COMPONENTS` |
| S9 HUD | `LOOK-SYSTEM` |
| S10 streak | `LOOP-DAILY` |
| S11 lesson complete | `LOOK-COMPONENTS`, `LOOP-HEARTS`, `VARIANCE` |
| S12–S13 quit dialog, tap targets | `LOOK-SYSTEM` |
| S14–S15 test summary, reviewing | `LOOP-HEARTS` |
| S16 glossary | `GLOSSARY` |
| S17–S18 light theme, color-blind palette | `LOOK-SYSTEM` |
| S19 practice tab | `PRACTICE` |
| S20 statistics | `STATS` |
| S21 badge | `LOOK-COMPONENTS` |
| S22 plan card | `ONBOARDING` |
| S23 error page | `STABLE-APP` |
| S24 visual details | `LOOK-COMPONENTS` |
| S25 market profile | `ONBOARDING`, `MARKETS` |
| S26–S27 end of content, path choice | `WIRE` |
| S28–S37 content | `RULES`, `CONTENT-FIX` |
| S38 content index | `WIRE`, `UPDATES` |
| S39 one source for the format | `STABLE-DATA`, optionally `TECH` |
| S40–S41 tests, dev flag | `CI` |
| S42 backend | `BACKEND` |
| S43 store | `STORE-SETUP` |
| S44 license | `CI` |
| S45 XP | `LOOP-HEARTS` |
| S46 web build | `LOOK-SYSTEM` |
| S47 analytics | `ANALYTICS` |
| S48–S52 docs, skills | `DOCS` ✅ (bench subtitle: `WIRE`; `first_minutes`: `OFFER`) |
| S53 using GitHub | `CI` (PR template) |
| S54 phone tests | `CI` |
| K1 German | `ONBOARDING` (i18n keys), Phase J (`I18N-PIPELINE`: German is the pilot) |
| K2–K3 mistakes round, "See the card again" | `LOOP-HEARTS` |
| K4 leaderboard | Phase L |
| K5 Trader Card | `STATS` (as the tier card, `DESIGN-REVIEW`), Phase L |
| K6 achievements | `FUN-PASS` |
| K7 simulator | `SIM-ACCOUNT` (Phase G) |
| K8 "Report a problem" | `ANALYTICS` |
| K9 AI explainer | Phase L |
| K10 weekly review, widget | `LOOP-DAILY`, Phase L |
| K11 font size, tablet | `LOOK-SYSTEM`, `A11Y-PERF`, Phase L |
| K12 match | `LOOP-HEARTS` |
| K13 mascot | not done (W20) |
| K14 technical upkeep | `TECH` |
| W1–W25 | see §4.1; the implementation is listed with each stage |
