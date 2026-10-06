# Review of 2026-09-25

The review of 2026-09-25 that the build plan is built on. It records that day and is not updated; the current state is in the build plan.

## Files

Section numbers are the same as before the docs were split into these files.

| File | Sections | What is in it |
| --- | --- | --- |
| [01-how-tested-and-overview.md](01-how-tested-and-overview.md) | §0–2 | How the review was done, how the project works, and the twelve most important items. |
| [02-must.md](02-must.md) | §3 | Bugs, legal and safety, content integrity: the items that block the release. |
| [03-should-design.md](03-should-design.md) | §4–4.1 | The design and interaction items. |
| [04-should-content-tech-docs.md](04-should-content-tech-docs.md) | §4.2–4.4 | The content, tech, and docs and process items. |
| [05-could-and-doc-changes.md](05-could-and-doc-changes.md) | §5–6.2 | Nice-to-haves, and the proposals that changed or extended a doc. |
| [06-decisions-measurements-order.md](06-decisions-measurements-order.md) | §7–10 | The open decisions of that day, measurements, what is good, the proposed order. |

## About this review

> **Status (2026-09-25):**
> - This report is the basis of `docs/plan/`.
> - David approved every W item. They are implemented in `docs/rules/`, `docs/ui/`, `docs/level-files/`, `docs/course/` and `CLAUDE.md`.
> - W20 (mascot) is not implemented, because it was not recommended.
> - W3 was implemented as option (a).
> - The decisions from section 7 are recorded in `docs/plan/04-decisions.md` §4.
> - Which stage handles which item is in `docs/plan/21-appendix-review-map.md`, Appendix F.
> - The text below is the state of the review day. Numbers and findings are not updated here; the current state is in the build plan.
> - The report was written in German and translated into English on the same day. Ids, numbers and quotes are unchanged.

As of 2026-09-25 · Basis: `main` (6e21975) and the PR [DavidMeier754/Trading-App#13](https://github.com/DavidMeier754/Trading-App/pull/13) that was still open then (commit c0e26bb), because only it had app code.
Nothing in the repo was changed, committed or pushed for this review. Everything below is a proposal.

**How to read this**
- **M** = Must (bug, legal, wrong teaching content, blocks the release)
- **S** = Should (a clearly better product)
- **K** = Could (nice to have)
- **W** = A proposal that contradicts or extends a .md file. These need your permission (section 6).
- The letters come from the German original (Muss, Sollte, Kann, Widerspruch) and stay as ids.
- 🔶 on an item means: it touches a W approval.
- Locations: `Chapter·Level-Lesson Screen`, e.g. `1·13-2 S9` = chapter 1, level 13, lesson 2, screen 9.
- Evidence images 1 and 2 belong to the original report and are not in the repo.
