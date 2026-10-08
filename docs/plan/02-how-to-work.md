# How to work with this plan

_Part of the [build plan](README.md) · §1_

## 1. How to work with this plan

### How a stage runs

**One stage = one Claude Code session = one pull request.**

(From 2026-09-26 to 2026-10-03 the stages ran as threads in the Claude project. David moved back to plain sessions on 2026-10-03: a fresh session per stage, started by him.)

**One stage at a time** (David, 2026-10-06). Phases 1 and 2 each have two parts that run one after the other: first **the app** (screens, the learning loop, the arena, the platform), then **the content** (rules, chapters, reviews, new paths). Section 2 (`03-stages-at-a-glance.md`) lists every stage in that order.
- Only one session runs at a time. The next stage is the first one without ✅, top to bottom.
- The app comes first because the content uses what it builds: the chapter fixes place `VISUALS`' graphics, the replays and Chapter 9 use `CHART-GEN`.
- Each stage keeps its own PR, merged with every check green on its latest commit before the next stage starts.

**Your turn** (David, 2026-10-06). After every block of stages comes a `YOUR-TURN` stage: you change whatever you want, the design or anything else (`22-your-turn.md`). You may start an extra one between any two stages, or skip one. A wish you have while testing another stage waits for it under "Parked wishes" in the same file.

**One prompt for every session** (David, 2026-10-08: no more copying prompts from a cheat sheet). You send the same words each time; the session finds the next step in this plan itself.

1. **Open a session:** Claude Code (the app or claude.ai/code) → repository `DavidMeier754/Trading-App` → new session. A session starts with the repository and nothing else; `CLAUDE.md` tells it what to read.
2. **Set model and effort before you send the prompt.** The last report's "Next:" line says which, from the "Model · effort" column of section 2:
   - `/model opus` (= Opus 5.5), `/model fable` (= Fable 5.1, if your plan has it), `/model sonnet` (= Sonnet 5).
   - `/effort high`, `/effort xhigh` or `/effort max`.
   - **Important:** Opus 5.5 defaults to `medium`. Set the effort deliberately every time.
   - Where it says "plan mode", the session shows you its plan first and builds nothing until you say OK.
3. **Send the prompt:**
   ```
   Next stage.
   ```
   Lines under it are for what only you can give: your wishes for a `YOUR-TURN`, material a stage asks you to prepare ("You prepare"), `skip YOUR-TURN-3`. If a stage needs something and the prompt does not carry it, the session asks.
4. **Claude finds and does the step** (`CLAUDE.md`, "Next stage."):
   - the first stage in section 2 without ✅, and in it the first session without ✅;
   - that stage section's "Session instructions" are its prompt; it reads `docs/` as they say;
   - it works on the branch the session creates and opens a draft PR against `main` (stacked on an open PR's branch only when you say so);
   - **the PR marks its own step done:** "session n ✅" in the stage's row of section 2, or ✅ on the stage once nothing of it is left, with its line in `05-done-so-far.md` and the "Next" line of section 3. The mark lands on `main` with the merge and never before, so whoever merges, the next "Next stage." starts at the right place;
   - it drives every check to green and checks the changed screens itself (screenshots at phone size, both themes, the states that matter);
   - it writes the report in the session, with **"Needs your review"** only where you are really needed (below).
5. **You answer in the same session:**
   - `OK <STAGE> – merge` → Claude merges the PR once every check on it is green (merge rule in `CLAUDE.md`). You can also merge it yourself on GitHub; the ✅ is already in it.
   - or a list of problems (template "Bug report", Appendix A) → Claude fixes them in the same session and PR.
   - A wish that is not a problem of this stage (something new, a different look) → Claude writes it under "Parked wishes" in `22-your-turn.md`, in this PR, and your next `YOUR-TURN` builds it.
6. **Next step = new session**, with the same prompt. A fresh context is more accurate and cheaper. A stage with several sessions in section 2 gets one session per part, each with its own PR.
7. **Where to look:** the PR on GitHub shows the step's state (its checks, the preview link, the report as its description). Questions about a running step go into its session.

### Which model for what

| Model | Command | For | Usage |
|---|---|---|---|
| **Opus 5.5** | `/model opus` | The default for code and content, everything that takes judgment | medium |
| **Fable 5.1** | `/model fable` | The hardest tasks: the knowledge audit, full reviews, design directions. Only where the plan says so. | high (≈ 2.5× Opus) |
| **Sonnet 5** | `/model sonnet` | Mechanical work that follows a clear pattern (configuration) | low |
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

- **Only the session's own stage.** Anything noticed that belongs to a later stage goes into the report, not into the code. Your wishes beyond the stage go under "Parked wishes" in `22-your-turn.md`.
- **The standard checks run before the report** (below), and all are green.
- **The report**, in this order (`CLAUDE.md`, "The report"):
  1. What was built, each item with where you can see it if you want to (a link, or the place in the app).
  2. Check results, including what Claude looked at itself.
  3. **Needs your review:** only what really needs you (below, "What needs you"). Often nothing.
  4. Open questions.
  5. Next: the next step, with its model and effort.

  Then **the session stops** and waits for you.
- **Everything in English:** code, content, docs, commits, PR texts and reports.
- **Never push to `main` directly.** Always a PR, unless you explicitly say otherwise.
- **Content sessions read `docs/content-todo/`** as well as the four docs, and tick what they did there.

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

### What needs you, and how you look

**Claude checks its own work** (David, 2026-10-08: "only mark something I should review if it's really necessary"). Before the report it opens every screen it changed in a test build and looks at it, at phone size, light and dark, in the states that matter (before and after the answer, reduced motion), besides the standard checks and the render test of every screen. What it has seen working goes under "What was built", with a link, and is yours to look at only if you want to.

**"Needs your review"** lists only:
- a **choice** only you can make: between versions, a design direction, a finding to decide, a wording that is a matter of taste;
- what only a **real phone** shows (haptics, sound, how a gesture feels) when the stage is about exactly that;
- what Claude **could not verify** itself, with the reason.

If nothing is on it, the report says so, and you can merge without testing. Each stage's section has a "Needs you" line saying what is likely to come up, and a "Where to look" list of the links worth opening if you want to see the result.

**How to look**
- **Preview:**
  - Every PR gets a link (web preview, for your phone).
  - Every PR also gets a QR code for Expo Go: real haptics, real sounds.
- **Open a screen** (Settings → Testing, from 2026-10-08): type or paste a link from the report, with or without the `#`, or the whole preview address, and Open goes straight to that screen. The last six links stay under it, one tap each.
- **Deep links open any screen directly:**
  - `<preview>/#level-09-2/3` = Chapter 1, Level 9, lesson 2, screen 3.
  - `#scalping-ch3-level-15-2/5` = Scalping Chapter 3.
  - `#all-screens/12` = test bench.
  - `#home/settings`, `#home/animations` = a page of the home screen.
  - Append `?look=neoMono` or `?look=classicContrast` = a different look, `?theme=light` a different theme.
- **Testing tools** (test builds only: every development run, so Expo Go, and exports with `EXPO_PUBLIC_TEST_TOOLS=1`) under Settings → Testing:
  - "Open a screen" opens any screen by its link (above).
  - "Skip ahead" jumps to any level.
  - "Refill hearts" refills the hearts.
  - "Every screen type" opens the test bench.
  - "Animations" plays the animations of rare moments on a tap: a level opening, lesson complete, a perfect run, a chapter's badge, a new tier, the flame, a lost heart (from `LOOK-BRIEF`); from `DESIGN-REVIEW` also a chapter's medal, the tier card turning over, skills flying into Practice and the mistakes deck.
  - "Design suggestions" shows ideas for the look before they go in (from `LOOK-BRIEF`).
  - "New designs" plays a lesson made in code with every content field the content does not use yet: stop and target with the R ruler, chart notes, the open, a market alert, a checkpoint briefing, skills (from `DESIGN-REVIEW`).
  - "Show the first trade" opens the first-run decision again (from `DESIGN-REVIEW`).
  - From `LOOP-DAILY` on there is "Advance a day".
- **On your phone**, not on your computer, when you do look.
- **A feeling is enough.** If something bothers you but you cannot say why, describe it in words ("sluggish", "cheap", "confusing") with a screen link.

### When something goes wrong

- **CI is red and Claude cannot get further:** a report with the cause, then stop. No building around it.
- **A stage gets too big:** Claude splits it, adds the rest as a new stage to this plan (in the same PR) and asks you.
- **A decision is missing:** Claude asks instead of guessing. Open decisions are in section 4.
