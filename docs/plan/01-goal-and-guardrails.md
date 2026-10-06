# Goal and guardrails

_Part of the [build plan](README.md) · §0_

**Updated 2026-10-05** with David's picks: the plan now ends at the finished app, not at a store release ("The finished app" below); no quotas anywhere; practice and today's chart optional; the streak grows only on a day a lesson is finished.

## 0. Goal and guardrails

### The goal (David, 2026-09-25)

1. **Learners have fun.**
2. **After the course, only practical experience is missing.** The knowledge is complete.
3. **Quality comes before speed.**

What that means for every stage:

- **Stay honest.**
  - The app promises no profit (`docs/rules/01-what-we-build.md` §1, docs/rules/10-legal-and-safety.md §7).
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
   - ~~With a variance simulator: the learner "trades" 10 trades of a good setup, sees winners and losers mixed together, runs it several times and then sees 100 trades.~~ **Dropped (David, 2026-10-03):** "this would imply the number given (like 6/10 are right) are reliable and I don't want this. The user should do his own research on how often strats work for him." The lesson uses the learner's own first right call that loses and the decision grid instead (`docs/content-todo/04-still-to-write-and-done-log.md` 4.1).
   - The message: one trade says almost nothing; the decision counts, the outcome varies; how often a method works, your own record tells you.
2. **Separate them in every reveal** (`docs/ui/06-reveal-and-hearts.md` §5.1b).
   - At the top, the grade of the *decision*: green, amber or red.
   - Below it, smaller, the *outcome this time*: +/− $.
   - For "right, but lost" an extra line, **without a rate** (David, 2026-10-03): "Right call — this trade lost anyway. One trade says little; judge the decision, not the result." Plus a "Why?" link to the card from 1·2-4.
   - The decision grid (`DESIGN-REVIEW`): a small 2 × 2 of decision against result, with this trade's dot in its cell.
3. **Right stays right.**
   - A correct decision that loses counts fully as correct: full XP, no mistake, a perfect run is still possible.
   - The outcome never affects the grade.
4. **Ramp up slowly** (`docs/rules/07-variance-and-typed-numbers.md` §3.11).
   - Chapter 1 before 1·2-4: no losers.
   - Chapter 1 after it: about 20–30 %, never two in a row.
   - From Chapter 2 on: 30–40 %.
   - From Chapter 3 on, every directional decision has a visible stop and target, so "hit by the stop" is something you see.
5. **Keep coming back to it.**
   - The lesson summary shows "Decisions 7/8 right · Results: 4 winners, 3 losers".
   - The statistics measure decision quality, never profit.
   - Chapter 6 (expectancy, probabilities) teaches how to measure a method from your own journal and simulator sample. Its numbers are examples for the arithmetic, and say so.
   - **No reliable-looking odds, anywhere** (`docs/rules/07-variance-and-typed-numbers.md` §3.11): no screen states how often a setup or a strategy wins as a fact. The 30–40 % above is how realistic the content's charts are, never a number the learner reads.

### Fun – how we measure it

Checked in every app stage, above all in `FUN-PASS`:

- **No quotas** (David, 2026-10-05): the learner does as many lessons as they like. Practice, the practice levels on the path and today's chart are optional, and nothing in the app says how much to do. What draws a learner back is a pull, never a duty: fading skills, shining medals, the chart calendar, gems, the weekly challenge, and a reminder only if they asked for one.
- **Pace:**
  - A lesson is short, and no screen asks for more than ~20 s without interaction.
  - Feedback starts at once (< 100 ms). The motion itself is calm and high quality (decision H): unhurried, smooth on cheap phones, and never in the way, because a tap finishes or skips it.
- **No dead ends:** mistakes lead to repetition, not to lockouts. Hearts only exist in tests.
- **Every lesson ends with a small win:** a recap, a checklist, your own plan, the streak.
- **Variety:** ≥ 3 question types per lesson, pictures instead of text slides.
- **Visible progress:** a streak with states (it grows on a day a lesson on the path is finished; opening the app, a skip, a practice round or today's chart never count), tiers and their card, the chapter medals, the skills collected, the chart calendar.
### The finished app

The plan is done when all of this holds at the same time. Everything about taking the app to people (the trademark, legal texts, store accounts and listings, testers, the release) is outside this plan (David, 2026-10-05).

- **Content:**
  - Chapter 1 and all three paths, Scalping, Swing Trading and Day Trading, are complete (decision E), with Chapter 9 "Your Own Strategy" after each path's Chapter 8.
  - The validator is green with `--strict`.
  - Claude's reviews are worked through: `KNOWLEDGE` and `REVIEW-A` for Scalping, `SWING-REVIEW`, `DAY-REVIEW`.
- **Practice arena:** today's chart, replays, setup drills, the chart calendar and the practice account, for all three paths (`ARENA-PATHS`).
- **Learning loop:**
  - Hearts in every lesson and test, with practice free and giving one back (David, 2026-10-04).
  - The Practice tab (Daily mix · Skills · Mistakes), the practice levels on the path with their Skip, fading skills, shining medals, the glossary.
  - The streak, streak freezes, the weekly challenge, gems and what they buy, reminders.
  - Your numbers on the You tab, measured in decisions, never in money.
  - No quota anywhere.
- **Account and money:** sign-in and sync, account deletion and data export inside the app (decision K); Nutrade Plus with its paywall, and ads with their consent (decision I), all working with test keys.
- **Crash reports and learning analytics,** only with consent.
- **The app's face:** its icon, splash and the three path logos.
- **Languages:** every launch language passes the automatic checks (decision M, Phase 3).
- **Quality:**
  - 0 crashes in the render test of every screen, in every language.
  - All must-fix items of the review (`docs/review-2026-09-25/`) are done.
  - Smooth on a cheap Android phone, usable with a screen reader, with large text and with reduced motion (`A11Y-PERF`).
- **The risk note** in every place listed in `docs/rules/10-legal-and-safety.md` §7.
- **You have accepted every stage.**
