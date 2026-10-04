# How to work with this plan

_Part of the [build plan](README.md) · §1_

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
