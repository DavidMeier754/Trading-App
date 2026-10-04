# UI reference

How every screen looks, moves and reacts. A level file only names a screen type (`type:`) and gives its content; how that screen is shown is described here.

## Files

Section numbers are the same as before the docs were split into these files.

| File | Sections | What is in it |
| --- | --- | --- |
| [01-design-principles.md](01-design-principles.md) | §1 | The rules every screen follows: one idea per screen, thumb first, instant feedback, no pressure, motion with a purpose, don't overdo it. |
| [02-lesson-player-layout.md](02-lesson-player-layout.md) | §2 | The frame of a lesson: the top bar, where the question, answers and reveal sit, and the key. |
| [03-screen-types.md](03-screen-types.md) | §3 | Every screen archetype (`intro`, `theory`, `story`, `recap`, `plan-card`, …) and how it looks. |
| [04-question-types.md](04-question-types.md) | §4–4.2 | The core and the newer question types and how each one is answered. |
| [05-chart-questions-and-mistakes-round.md](05-chart-questions-and-mistakes-round.md) | §4.3–4.5 | `chart-decision`, `chart-replay` and the mistakes round at a lesson's end. |
| [06-reveal-and-hearts.md](06-reveal-and-hearts.md) | §5–5.2 | The reveal after every answer, decision against outcome, and hearts. |
| [07-lesson-chapter-and-tier-complete.md](07-lesson-chapter-and-tier-complete.md) | §5.3–5.5 | The win screens, the chapter badge and the tier-up. |
| [08-quotes-and-charts.md](08-quotes-and-charts.md) | §6–6.4 | The ownership pie, quote card, quote panel and the chart component. |
| [09-order-tools-and-other-visuals.md](09-order-tools-and-other-visuals.md) | §6.5–6.10 | Bars and timelines, the order book, the order ticket, newer components, illustrations. |
| [10-path-map.md](10-path-map.md) | §7–7.1 | The home screen: the path, its nodes, side stops and gates. |
| [11-top-bar.md](11-top-bar.md) | §7.2 | The persistent HUD: the path's logo, the streak, gems and hearts, and the full-screen streak changes. |
| [12-practice-and-stats.md](12-practice-and-stats.md) | §7.3–7.4 | The Practice tab and the stats and profile page. |
| [13-tiers-replays-and-plus.md](13-tiers-replays-and-plus.md) | §7.5–7.8 | Tiers, the weekly challenge, the Spot it tab, Nutrade Plus, the paywall and ads. |
| [14-glossary-and-copy.md](14-glossary-and-copy.md) | §8–9 | The glossary popover, and how copy and numbers are written and localised. |
| [15-theming-and-accessibility.md](15-theming-and-accessibility.md) | §10 | Looks, colours, type, light and dark, sizes, screen readers and reduced motion. |
| [16-navigation.md](16-navigation.md) | §11–12 | Onboarding, the tab bar, path choice, settings, and how level files point at this reference. |

## About this reference

Generalized UI reference for every screen, interaction, animation and layout idea in the app.
Level files (`content/**/level-XX-Y.yaml`) do NOT describe UI. They reference the archetype IDs
defined here via `type:` plus the actual content (text, options, correct answer, explanation).
Everything about *how* a screen looks, moves and reacts lives in these files.

Status: **v3** — expanded for the eight-chapter curriculum. New interaction types, components and
long-path gamification are marked **[v3]**. Everything unmarked is unchanged from v2.
**[v4] (2026-09-25)** — the release plan's decisions (`docs/plan/04-decisions.md` §4.1): hearts only in
tests, the mistakes round, the reveal that grades a decision apart from its outcome, answers in the
thumb zone, a scroll fallback instead of illegible shrinking, at most three looks plus light and dark,
no leaderboard in v1.0. Marked **[v4]**.
**[v4.1] (2026-09-25)** — David's answers to the open decisions: calm, high-quality motion (H), the
practice arena and Nutrade Plus with ads in the free tier (I), accounts (K), every launch language
(M). Marked **[v4.1]**.
**[DESIGN-REVIEW] (2026-10-03)** — David's verdicts on 50 design ideas (stage `DESIGN-REVIEW` in
`docs/plan/09-phase-c-design-review.md`): the decision grid in the chart reveal, a fixed chart frame, the R ruler, chart
notes, the open on the chart, keys with a direction, matches without colours, the mistakes deck, the
checkpoint briefing, skills collected after each lesson, a Practice tab with Daily mix, Skills and
Mistakes, hearts that all come back after five hours, chapter emblems, tier materials, the Account
page, the sine-shaped map with side stops, and two rules of his own: don't overdo it, and the bigger
the accomplishment, the bigger the moment. The variance simulator is dropped: the app never states
how often something works (`docs/rules/07-variance-and-typed-numbers.md` §3.11). Marked **[DESIGN-REVIEW]**. The content these
need is listed in `docs/content-todo/`.
