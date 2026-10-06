# Drill packs and replays

_Part of the [course outline](README.md)_

## Drill packs

Folder: `content/drills/<path>/<slug>.yaml` · format in `docs/level-files/`. These feed the Practice hub (docs/ui/12-practice-and-stats.md §7.3), not the path map. They are the rep volume that turns recognition into reflex, and they are written **after** the chapter they unlock from.

The table below is the plan; `content/drills/packs.yaml` is the manifest built from it, and it is what `tools/build_drill_batch.py` (**[v4]** stage DRILLS in `docs/plan/10-phase-1-app-arena-build.md`) and `tools/validate_content.py` both read. **Path `all` means every path gets a pack of this shape, not that one file serves three paths:** chapters 2–8 differ per path, so each pack is written once per path against that path's charts, prices and setups, and `unlocked_by` resolves inside that path. The "Unlocked by" column names a chapter's exam or a setup's level; the manifest turns each into the sub-level id that actually exists (a chapter's final exam, or the last sub of the setup's level — the one that writes its playbook card).

| Pack | Path | Unlocked by | Size | Contents |
|---|---|---|---|---|
| `charts-structure` | all | Ch2 exam | 30 | Trend / range / pullback naming, `swipe-deck` and `chart-tap` |
| `levels-and-breaks` | all | Ch2 exam | 30 | Bounce versus break, wick versus close |
| `cost-check` | all | Ch3 exam | 20 | Spread against target, sizing from both ceilings |
| `the-read` | all | Ch4 exam | 40 | The four-part read on unseen charts, a third of them passes |
| `selection` | all | Ch5 exam | 25 | `scanner-pick` and watchlist cuts |
| `risk-calls` | all | Ch6 exam | 25 | R, expectancy, limits and `branch` management decisions |
| `setup-a` … `setup-h` | all | each setup's level | 20 each | One `swipe-deck` bank per playbook card |
| `mixed-daily` | all | Ch7 exam | 40 | Everything, weighted by the learner's weak concepts |

Target at launch of a path: **~350 drill screens**, roughly the same volume again as the linear path's own questions. The sizes above add up to 370 across the fifteen packs; the manifest carries that figure.

**[v3] Twelve of the fifteen packs are on hold.** `chart-replay` (§ Replays) does the chart-recognition job better than a frozen drill screen can, and that is what `charts-structure`, `levels-and-breaks`, `the-read`, `mixed-daily` and the eight setup packs are — 300 of the 370 screens. Only `cost-check` (written), `selection` and `risk-calls` are unaffected: all-in cost arithmetic, scanner reading and trade management are not chart timing, and no replay reaches them. Decide the twelve after the replay pilot (stage REPLAY-PILOT), not before.

---

## Replays **[v3]**

The Spot-it tab (`docs/ui/13-tiers-replays-and-plus.md` §7.7) is fed from `content/replays/<path>/<slug>.yaml`, one
replay per file, format in `docs/level-files/07-drill-packs-and-replays.md` § Replays and authoring rules in `docs/rules/06-replays.md`
§3.10. Replays are not a chapter: they are a bank the tab draws from, gated by reading level
against the tiers.

**Where they sit in the linear path.** A `chart-replay` screen also appears inside lessons, and
only where the learner has just been given the card it needs:

| Chapter | Level | Reading level | Why here |
|---|---|---|---|
| 7 | each setup level (2, 3, 4, 6, 7, 10, 11, 12; 13 once `CONTENT-FIX-7` makes it Setup I) | 1 | The card is on the screen; the replay is the card applied once, in motion |
| 7 | 8 Mixed Drill I, 13 Mixed Drill II (its charts move into 18 Chapter Review in `CONTENT-FIX-7`, C8-01) | 2 | Setup named, card from memory |
| 7 | 14 Choosing the Setup for the Day | 3 | Any of the eight — that is the level's whole question |
| 7 | 17 Capstone — A Full Session | 3 | One session, several moments, decoys included |
| 8 | 9 Full-Day Practice, 16 Capstone — A Full Week | 3 | Includes a session that offers nothing (`allow_none`) |

**The bank at launch.** Two replays per Chapter 7 setup card (16), four mixed level-3 replays,
and two `allow_none` sessions — **22 replays per path**, ~1,300 bars authored. That is a
smaller number of files than the drill bank and considerably more work per file; see
`docs/plan/`, stages REPLAY-PILOT and REPLAY-BANK. **[v4.1]** All three paths get
their bank in the finished app (REPLAY-BANK, ARENA-PATHS); the chart generator proposes the
candidates, and each replay is picked and annotated by hand.

**Replays and drills are not the same job.** Drills build recognition at volume with spaced
repetition; a replay tests whether recognition survives when the outcome is hidden and the
learner has to choose a moment. Both feed the same weak-concept list: a `Phantom` whose decoy
fails on volume marks *volume* weak exactly as a wrong drill answer would.
