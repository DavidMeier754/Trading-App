# Course outline

What is taught in which chapter and level, per path. It is the authority for *what* is taught where.

## Files

| File | What is in it |
| --- | --- |
| [01-chapter-1-market-basics.md](01-chapter-1-market-basics.md) | The shared first chapter, level by level, ending with the path choice. |
| [02-scalping-chapters-2-5.md](02-scalping-chapters-2-5.md) | Charts 101, orders and costs, reading fast markets, finding the trade. |
| [03-scalping-chapters-6-8.md](03-scalping-chapters-6-8.md) | Risk and psychology, the scalping playbook, the trading day. |
| [04-day-trading.md](04-day-trading.md) | The Day Trading path, Chapters 2–8 (planned). |
| [05-swing-trading.md](05-swing-trading.md) | The Swing Trading path, Chapters 2–8 (planned). |
| [06-drill-packs-and-replays.md](06-drill-packs-and-replays.md) | The drill packs per path and the replay bank. |
| [07-side-stops-and-writing-order.md](07-side-stops-and-writing-order.md) | The optional stops beside the path, and the order the chapters are written in. |

## About the outline

Authority for *what* is taught where. Rules live in `docs/rules/`, UI in `docs/ui/`, format in `docs/level-files/`.
Every path has **8 chapters**. Chapter 1 is shared and ends with the path choice.

Status: **v3**. The path is sized so a learner doing two sub-levels a day (~10 minutes) finishes in about six months and comes out able to run a plan: pick the stock, read the day, recognise the setup, size it, manage it, and review it. See `docs/rules/01-what-we-build.md` §1.1 for what "finished" is allowed to claim.
**[v4] (2026-09-25):** one new sub-level in Chapter 1 (2-4, variance), the scalping plan revision moved to Chapter 2 Level 1-4, the account facts that decisions B and C require, and Swing written before Day Trading. The order of all work is `docs/plan/`.

**[v4.1] (2026-09-25):** all three paths ship in v1.0 (decision E), so Day Trading is written before the release too, right after Swing. The practice arena (`docs/plan/17-phase-g-arena-idea-and-design.md` Phase G) adds hands-on charts beyond the paths; it does not change this outline.

**[DESIGN-REVIEW] (2026-10-03):** the variance simulator is dropped, so 1·2-4 and Scalping 6·6 and 6·13 teach variance without it and without stating any rate (`docs/rules/07-variance-and-typed-numbers.md` §3.11). Every chapter gets optional side stops beside the path: two or three mistakes reviews the app builds from the learner's own mistakes, and the bonus "Spot it" lessons (below, "Side stops"). Content work that follows from the design review — skills per lesson, the chart ramp, notes, alerts, briefings — is in `docs/content-todo/`.

Legend: `T` = test, `F` = final exam, `R` = repetition sub. Subs listed as a count; files are `level-LL-S.yaml`.
The **Reinforces** column lists earlier chapters the level deliberately re-tests — it becomes the `reinforces:` header field (`docs/level-files/`). Every chapter from 3 on has one explicit **Callback** level.

Write each chapter exactly as outlined; if the material genuinely needs a different split, note the deviation in the session report.

Chapter status: **written** = in the repo and validated · **expand** = v2 content exists, needs the v3 level plan · **new** = does not exist yet · **planned** = outlined only.

### Shape at a glance

| Path | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | Ch7 | Ch8 | Levels | Subs |
|---|---|---|---|---|---|---|---|---|---|---|
| Scalping | 17 | 18 | 19 | 18 | 17 | 19 | 19 | **18** | **145** | **~393** |
| Day Trading | 17 | 18 | 19 | 18 | 17 | 19 | 19 | **18** | **145** | **~389** |
| Swing Trading | 17 | 18 | 18 | 18 | 17 | 19 | 19 | **18** | **144** | **~386** |

(Chapter 1 is shared, so a learner sees Chapter 1 once plus one path's Chapters 2–8. ~393 sub-levels ≈ 22 hours ≈ six months at two a day. **[v4]** 388 scalping sub-levels are written (Chapter 1's 48 with the path choice, plus 340); five are planned: Chapter 8 Level 15 (four, stage OFFER) and Chapter 1 Level 2-4 (one, stage VARIANCE).)

### Migration note — v2 chapters are renumbered — **done**

v3 inserted **Finding the Trade** at Chapter 5, which pushed the two chapters after it down by one.
The scalping folders were renamed and their `chapter:` fields updated; the mapping was
`chapter-05-risk-and-psychology` → `chapter-06-risk-and-psychology`, `chapter-06-scalping-playbook` →
`chapter-07-scalping-playbook`, with `chapter-05-finding-the-trade` and `chapter-08-the-trading-day`
written new. Nothing here is outstanding — it is kept so cross-chapter references in older prose
can be traced.
