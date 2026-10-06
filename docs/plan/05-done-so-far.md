# Done so far

_Part of the [build plan](README.md)_

The stages that are finished, in the order they ran. Their full descriptions left the plan on 2026-10-05; what they decided lives on in `docs/` (rules, UI, level files, course) and in `04-decisions.md`. Later stages and the docs still name them (for example "built in `DESIGN-REVIEW`"), so the names stay.

| Stage | What it did | PR |
|---|---|---|
| `MERGE` ✅ | The app (Expo lesson player, path map, progress) merged into `main` | #13 |
| `DOCS` ✅ | The build plan, the review report (`docs/review-2026-09-25/`), every doc brought onto the decisions | on `main` |
| `CI` ✅ | Automatic checks on every PR, lint, unit tests, testing tools only in test builds, a preview link per PR | #15 |
| `WIRE` ✅ | A content index instead of hand-written imports, every written chapter playable, the render test of every screen | #16 |
| `STABLE-APP` ✅ | The plan overview, recap, the reveal separating decision and outcome, the screen-reader leak, the error page | #17 |
| `STABLE-DATA` ✅ | The depth ladder, price lines, validator and test bench following the schema; the render test mandatory | #18 |
| `LOOK-BRIEF` ✅ | David's critique and three design directions as clickable prototypes; his mix chosen | #19 |
| `LOOK-SYSTEM` ✅ | The mix as a system: themes, the three looks, type, motion, sounds, the UI check, the centered layout, the map and top bar with gems, the streak screens, Change design, the testing tools in Settings. The Expo Go QR code on every PR works since `EXPO_TOKEN` is set. | #20, #21 |
| `DESIGN-REVIEW` ✅ | Fifty design ideas and David's verdicts; the approved ones built (chart reveal, map, hearts in every lesson, the mistakes round, skills, Practice, Account, rewards, the first trade); `docs/content-todo/` written | #22 |
| Docs split | The long docs split into folders of short, named files | #23 |
| `CONTENT-REVIEW` ✅ | The beginner's read of every chapter, 88 changes approved; the spread sweep, terms taught where first used, the 7·3-2 labels; the word rules; Chapter 9 outlined | #24 |
| Plan rework | This plan rebuilt from David's picks: only the app, Scalping first, one stage at a time (the app before the content in each phase), a turn for David's own changes after every block | this PR |

**The look prototype** (`LOOK-SYSTEM` item 13). `src/prototype/` was removed once the mix was built. Where a stage points to `#prototype/mix/<screen>` or a file in `src/prototype/` (the forming candle and the count-up in `LOOK-COMPONENTS`, the bonus side lesson in `FUN-PASS`), it reads it at commit `a78e210`, the last one that has it: `git show a78e210:src/prototype/kit.tsx`, or `git checkout a78e210` and open `#prototype/mix/<screen>` in a test build.

Where a later stage needs a detail of a finished one, it reads the code and the docs it names; a finished stage's old description is in the git history (`git log -- docs/plan/`).
