# Phase 3 – every language, then the last check

_Part of the [build plan](README.md)_

**The principle.**
- English is the source. Every other language is generated from it by a checked pipeline and never edited by hand.
- The automatic checks per language decide. A reading by native speakers is outside this plan (David, 2026-10-05).
- The phase starts when the English content is final, after the path reviews and `YOUR-TURN-8`. `YOUR-TURN-9` comes after `RTL`, before the last check (`A11Y-PERF`). A later change to an English file re-translates just that file (its source hash changes).

**The language does not decide the market.** A Spanish speaker in Mexico may trade US stocks, so the market profile stays a setting of its own (`MARKETS`).

### `MARKETS` – market profiles for the launch markets

**Goal.** Learners in every launch market get correct local facts.

**Scope**
1. The market stays a setting of its own ("the market I trade").
2. Profiles for the launch markets where the rules differ (e.g. the UK), or a generic "international" profile that explains the concept and says that the rules differ by country.
3. Every profile has sessions, currency, regulation notes with a `checked:` date and a source, and tax as "ask a tax advisor where you live".
4. The validator checks that every profile fills every token. Chapter 8 Level 15 of every path renders with every profile.
5. Sentences Claude is unsure about are listed for you.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage, and fills `[list]` from your lines under `Next stage.`)
```
Stage MARKETS from docs/plan/17-phase-3-languages-and-last-check.md. Launch markets, from my lines under "Next stage." (ask me if they are missing): [list].
Read CLAUDE.md, docs/rules/10-legal-and-safety.md §7, content/market_profiles.yaml and docs/plan/02-how-to-work.md §1 and the "MARKETS" section in docs/plan/17-phase-3-languages-and-last-check.md. Research every rule on the web and name every source with its date. No advice, no provider names, no tax rules.
Open a PR against main that marks this step ✅ in docs/plan/, and get every check green. Check the changed screens yourself. Report: what was built (with where to see it) · check results · sources · sentences you should check · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** the sentences Claude is unsure about (scope item 5), listed in the report: check them.

**Where to look** (optional; the report links each): Chapter 8 Level 15 with two of the new profiles.

### `TRANSLATE-1` … `TRANSLATE-n` – the launch languages

**Goal.** Every launch language, one batch at a time.

**Scope per stage:** one batch of 3–5 languages: glossary and style sheet, UI, content. Every check green, contact sheets.

**Suggested batches** (the list itself is decision T):
1. Western Europe and Latin America, e.g. Spanish, French, Italian, Portuguese (Brazil), Dutch.
2. Central and Eastern Europe and Turkey, e.g. Polish, Czech, Romanian, Turkish.
3. Asia, e.g. Japanese, Korean, Chinese (simplified), Hindi, Indonesian, Vietnamese.
4. Right to left, after `RTL`, e.g. Arabic, Hebrew.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per batch

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage, puts in `[n]` itself and fills `[list]` from your lines under `Next stage.`)
```
Stage TRANSLATE-[n] from docs/plan/. Languages, from my lines under "Next stage." (ask me if they are missing): [list].
Read CLAUDE.md, §1, Phase 3 and the "I18N-PIPELINE" and "TRANSLATE" sections of docs/plan/. Run the pipeline for these languages. Fix every failed check through the glossary or the style sheet — never by editing a translation by hand — and report the numbers per language.
Open a PR against main that marks this step ✅ in docs/plan/, and get every check green. Check the changed screens yourself. Report: what was built (with where to see it) · check results · contact sheets · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** nothing, as a rule — Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each): each language, one lesson. You don't need to understand it: look for cut-off text, English leftovers and broken numbers.

### `RTL` – right-to-left languages

Only if Arabic, Hebrew or another right-to-left language is on the list.

**Scope**
- The layout mirrors: the path map, buttons, the direction of "back".
- Charts keep time running left to right, and numbers stay left to right.
- Text alignment.
- Tests with a right-to-left language on every screen type.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage RTL from docs/plan/17-phase-3-languages-and-last-check.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "RTL" section in docs/plan/17-phase-3-languages-and-last-check.md in full, plus docs/ui/14-glossary-and-copy.md §9 and docs/ui/15-theming-and-accessibility.md.
Build exactly that scope. Charts keep time running left to right and numbers stay left to right.

Open a PR against main that marks this step ✅ in docs/plan/, and get every check green.
Check the changed screens yourself.
Report: what was built (with where to see it) · check results · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** nothing, as a rule — Claude checks the screens itself and lists them under what was built.

**Where to look** (optional; the report links each): one lesson and the arena in Arabic or Hebrew — nothing overlaps, and the charts read left to right.

### `A11Y-PERF` – accessibility and speed on real devices

**Goal.** The app works for everyone and runs smoothly on cheap devices too.

**Scope**
- **Screen readers:** a whole lesson, a checkpoint and an arena replay with VoiceOver (iPhone) and TalkBack (Android).
- **Large text:** Dynamic Type up to 130 %, also in the longest launch language.
- **Reduce motion, the color-blind palette, contrast.**
- **Cheap devices:** a small iPhone (SE) and a cheap Android device; the motion stays smooth (decision H), and the generator stays fast.
- **Offline:** flight mode.
- **Battery.**

**Model · effort · sessions:** Opus 5.5 · high · 1

**Session instructions** (the session takes them as its prompt when `Next stage.` reaches this stage)
```
Stage A11Y-PERF from docs/plan/17-phase-3-languages-and-last-check.md. Read CLAUDE.md, docs/ui/15-theming-and-accessibility.md §10 and docs/plan/02-how-to-work.md §1 and the "A11Y-PERF" section in docs/plan/17-phase-3-languages-and-last-check.md. Check what can be checked automatically, fix the findings and write me the device checklist. Open a PR against main that marks this step ✅ in docs/plan/, and get every check green. Check the changed screens yourself. Report: what was built (with where to see it) · check results · the device checklist · needs your review (only what really does) · open questions · next. Then stop.
```

**Needs you:** the device checklist from the report, with VoiceOver or TalkBack on. Screen readers, cheap devices and the battery on a real phone are what Claude cannot check itself.

**Where to look** (optional; the report links each): the screens the fixes changed.

### The finished app

When `A11Y-PERF` is accepted and every point of "The finished app" in `docs/plan/01-goal-and-guardrails.md` §0 holds, the plan is done.
