# Your turn – your own changes

_Part of the [build plan](README.md)_

After every block of stages there is a stage that belongs to you: `YOUR-TURN-1` … `YOUR-TURN-9` (David, 2026-10-06). In it you change whatever you want: the design of a screen, a color, a sound, a word, how something works, a lesson, or something new. A decision in `04-decisions.md` can be changed here too; Claude records the new one.

### When

- **At the fixed places** in section 2 (`03-stages-at-a-glance.md`). Each comes right after a block whose result you can see as a whole:

  | Stage | Comes after | Good moment for |
  |---|---|---|
  | `YOUR-TURN-1` | `VISUALS` | the lesson screens: charts, graphics, the reveal |
  | `YOUR-TURN-2` | `ICON` | the app around the lessons: map, hearts, streak, practice, tabs, first run, icon |
  | `YOUR-TURN-3` | `FUN-PASS` | the arena, and anything in the app before the lessons are worked on |
  | `YOUR-TURN-4` | `CONTENT-FIX-8` | the fixed chapters: lessons, wording, order |
  | `YOUR-TURN-5` | `OWN-STRATEGY` | Scalping as a whole, before Swing starts |
  | `YOUR-TURN-6` | `I18N-PIPELINE` | accounts, Plus, ads, the language switch |
  | `YOUR-TURN-7` | `ARENA-PATHS` · Swing | Swing, before Day Trading starts |
  | `YOUR-TURN-8` | `ARENA-PATHS` · Day | the English app and course, the last change before they are translated |
  | `YOUR-TURN-9` | `RTL` | the app in every language, before the last check |

  The "Good moment" column is a hint, not a limit: any wish fits any turn.
- **Any time in between.** Between any two stages you may start an extra turn: use the prompt below with `[n]` = "after <the last finished stage>", for example `YOUR-TURN after TABS`. Then the plan continues where it was.
- **Skipping is fine.** If you have nothing, write `YOUR-TURN-[n] skipped` under the next stage's prompt; that session marks it "✅ skipped" in section 2.

### Parked wishes

A wish you have while testing another stage, one that is not a problem of that stage (something new, a different look, "later I'd like…"), is not built there. The session writes it here, in its own PR, and your next turn starts with this list. You can add lines yourself too, or ask any session to.

| Wish | From | Note |
|---|---|---|
| — | | |

A turn removes the lines it built; the PR is the record.

### `YOUR-TURN-1` … `YOUR-TURN-9` – your changes

**Goal.** The app is the way you want it at this point of the plan.

**You prepare.** Your wishes, as many as you like, in any form: words, screenshots, screen links (`<preview>/#level-…`), "like in app X", or a feeling ("this looks cheap", "this is boring"). A feeling is enough; Claude turns it into options.

**How the session runs**
1. **Claude sorts your wishes** and the parked ones: what each would change, where, and whether it clashes with a rule or decision in `docs/` (it names the rule; you decide).
2. **A design wish with an open look** ("nicer", "less plain", "more fun") gets two or three versions to choose from first, as screenshots or a clickable page; Claude builds the one you pick.
3. **A wish that belongs to a stage still ahead** (the arena before `ARENA-TAB`, say) is written into that stage's file instead of being built twice, unless you want it now.
4. **A wish too big for one session** becomes its own stage in this plan (same PR), placed where you say.
5. **You approve the plan** (plan mode), Claude builds it, updates the docs the change touches (`docs/ui/` for the look, `docs/rules/` and `docs/content-todo/` for lessons, `04-decisions.md` for a changed decision), runs every check and reports with your test checklist.

**Rules.** Everything else in `CLAUDE.md` still holds: every check green, English, one PR per session. A rule in `docs/` holds until you change it (the motion rule "nothing moves unless the learner moved it", for example), and then the doc changes with it.

**Model · effort · sessions:** Opus 5.5 · high, plan mode. For a bigger redesign: Fable 5.1 · high (else Opus 5.5 · xhigh). 1 session; a long list gets one session per part, each with its own PR. 0 if you skip.

**Prompt** (`[n]` = the turn's number, or "after <stage>" for an extra one)
```
Stage YOUR-TURN-[n] from docs/plan/ (my own changes).

Read CLAUDE.md, docs/plan/02-how-to-work.md §1 and docs/plan/22-your-turn.md in full, and the docs each wish touches (docs/ui/ for the look; docs/rules/, docs/level-files/ and docs/content-todo/ for lessons).
Take my wishes below and every line of "Parked wishes" in docs/plan/22-your-turn.md.

First, in plan mode: for each wish say what you would change, where, and which rule or decision in docs/ it clashes with, if any. For a design wish whose look is open, show me two or three versions to choose from before building. A wish that belongs to a later stage goes into that stage's file unless I say "now". Wait for my OK.
Then build what I approved, update the docs it touches (a changed decision goes into docs/plan/04-decisions.md with today's date) and remove the built lines from "Parked wishes".
Open a PR against main and get every check green.
Report: what you built · check results · my test checklist with real links · open questions. Then stop.

My wishes:
[your list]
```

**Claude checks automatically.** The standard checks (`02-how-to-work.md` §1); after a change to lessons also the three checks by hand; after a change to the look, contact sheets of the changed screens.

**You test.** What you changed, as long as you like. The report links every changed screen.

**Done when.** Every wish you approved is built or has its place in the plan, and "Parked wishes" holds only what is still open.
