# Tiers, replays and Nutrade Plus

_Part of the [ui reference](README.md) · §7.5–7.8_

### 7.5 Tiers **[v3]**
Four tiers per path, unlocked by chapter, shown on the tier card (**[DESIGN-REVIEW]**, §5.5) and the path overview. They give a 6-month path visible mid-term goals that badges alone do not.

| Tier | Unlocked after | Means |
|---|---|---|
| Observer | Chapter 2 | Can read a chart |
| Student | Chapter 4 | Can read the market in motion |
| Planner | Chapter 6 | Has a risk process and a journal |
| Sim Trader | Chapter 8 | Has a playbook and a 30-day simulator plan |

**[DESIGN-REVIEW]** Each tier has a material for its card (§5.5): Observer paper, Student bronze, Planner silver, Sim Trader graphite and gold.

### 7.6 Weekly challenge **[v3]**
One untimed, optional mixed set per week (8–12 questions drawn from everything unlocked), worth bonus XP and a streak freeze. Not ranked. **[v4]** It is how streak freezes are earned; the learner holds at most two, and a missed day uses one automatically. Exists to give lapsed users a low-friction way back in.

### 7.7 Spot it — the replay tab **[v3]**

**[2026-10-05] David's picks.** The arena is its own tab (Learn · Practice · Arena · You), with one practice account per path. **Today's chart** is new every day and the same for everyone on a path. **The chart calendar:** every Daily Chart played fills its day with the decision's grade (good call, reasonable, not this time, stood aside), and a full month earns a medal of its own; today's chart pays gems, and learners with reminders on can switch on "today's chart is ready". Replays, drills and scenario packs as many as the learner likes (stages `ARENA-DESIGN`, `ARENA-TAB`, `SIM-ACCOUNT`).

**[v4.1] This tab grows into the arena** (decision I, `docs/plan/09-phase-1-app-arena-design-and-generator.md`). Stage ARENA-DESIGN rewrites this section; the rules below stay.
- **For everyone:** the **Daily Chart** — one chart a day, the same for everyone on a path, played bar by bar, with a share card that shows decisions and never money — and a taste of each arena part.
- **With Nutrade Plus:** replays of whole sessions, unlimited setup drills from the chart generator, the practice account with its journal and statistics, and scenario packs.
- **Synthetic charts only.** Their odds are a training model, and the app says so (`docs/rules/10-legal-and-safety.md` §7).

The second practice surface, beside the Practice hub (7.3), and the home of `chart-replay` (4.4). One tap opens a replay the learner has not seen, drawn from the bank in `content/replays/` and filtered by what they have unlocked.

- **What it is for.** The linear path teaches recognition one frozen chart at a time. This is where the learner finds out whether they can spot a setup with the outcome still hidden — and whether they can sit through a session that offers them nothing.
- **Picked, not random.** The next replay is chosen by the weak-concept list, the same one the Practice hub reads: two `Phantom`s on volume and the tab starts serving replays whose decoys fail on volume.
- **Tier-gated by reading level.** Level 1 replays open at **Observer**, level 2 at **Student**, level 3 at **Planner** (7.5). A level-3 replay in front of a learner who has not finished Chapter 6 is a coin flip, not a lesson.
- **Session view.** A run of replays ends on a strip: how many Textbook, how many Missed, how many Phantom, and the **discipline line** — moments correctly passed as a share of decoys met. That number, not a win rate, is what the tab is scored on.
- **Never costs hearts, never timed.** Same as every practice surface.
- **What it does not do.** It does not replace the simulator plan Chapter 8 ends on. A replay you can pause teaches recognition; it does not teach a live market, and the copy must not imply otherwise.

### 7.8 Nutrade Plus, the paywall and ads **[v4.1]**

Decision I (`docs/plan/04-decisions.md` §4.1). Stages ARENA-DESIGN, MONEY and ADS fill in the details and record them here.

- **Free:** every lesson of every path, the checkpoints and final exams, the Practice hub (7.3), the glossary, the statistics, the Daily Chart and a taste of the arena (7.7); 5 hearts in tests (§5.2); ads between lessons.
- **Nutrade Plus:** unlimited hearts (∞ in the HUD), no ads, the full arena.
- **The paywall** appears only at natural points: when the free part of the arena is used up, on the Out-of-hearts screen below the free ways, and in Account and Settings. Never inside a lesson, over a reveal or at app start. It states the price per period, how it renews and how to cancel; a trial names its end date. No countdowns, no pre-selected expensive option without its price.
- **Ads** come only after a finished lesson, once its result has been shown, and not after every lesson. Never inside a lesson, test, reveal, the arena or onboarding, and never on the first day. No ads for financial products, trading, crypto, gambling or get-rich-quick (`docs/rules/10-legal-and-safety.md` §7). Personalized ads only with consent.
- **Nothing is sold one at a time:** no hearts, no streak freezes, no passes.
