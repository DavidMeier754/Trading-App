# Paths and chapters

_Part of the [rules for content and code](README.md) · §2_

## 2. Paths and chapters **[v3 — restructured]**

Three paths, organized by trading style (holding period), not by asset class:

| Path | Folder | Holding period |
|---|---|---|
| Day Trading | `content/paths/day-trading/` | minutes to hours, closed same day |
| Swing Trading | `content/paths/swing-trading/` | days to weeks |
| Scalping | `content/paths/scalping/` | seconds to minutes |

Every path has **8 chapters**. Chapter 1 is shared (`content/shared/chapter-01-market-basics/`) and is followed by the path choice. Chapters 2–8 live in the path folder. The full outline, per path, is in `docs/course/` — that file is the curriculum authority; this file holds the rules.

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
