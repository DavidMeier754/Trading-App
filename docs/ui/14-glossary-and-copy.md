# Glossary and copy

_Part of the [ui reference](README.md) · §8–9_

## 8. Glossary popover

Every defined term is rendered with a subtle dotted underline. Tap → bottom sheet: term, one-sentence definition, "Taught in Level X-Y" link. Terms enter the glossary from `terms_introduced` in level files. ~~**[v4]** Definitions live in `content/glossary.yaml`~~ **[Skills]** Definitions are the words' `info` lines in `content/skills.yaml` (one sentence each, format in `docs/level-files/06-skills-bonus-lessons-market-profiles.md` "Skills"); every term in any `terms_introduced` has one. The underline marks a term's first appearance on a screen, not every one.
**[v3]** The glossary is browsable from the profile as well (**[2026-10-05]** from the You tab, stage `GLOSSARY`), grouped by chapter, with a "terms you have missed recently" section fed by the practice engine.

**[DESIGN-REVIEW] The marker.** A marked term gets a soft highlighter stroke behind it as well as the dotted underline, so it reads as "this word matters" even to someone who never taps it. David, 2026-10-03: "Don't over or underuse them." So the app marks:
- only terms taught in an earlier lesson (the lesson that defines a term is busy defining it; marking it there would be noise), and only once the learner has played that lesson; never the course's first words (Chapter 1 Levels 1 and 2: price, chart, buy, sell, market …), which nearly every screen uses;
- only a term's first appearance in a lesson, not on every screen;
- at most two terms on one screen, the first two in reading order;
- in a theory card's body, an example, a scene and a question's prompt — never in answer options, chips or keys, where a tap must mean the answer.
A tap opens the sheet: the term, its line from `content/skills.yaml`, "Taught in Level 4 · The Quote Card", and **See the card**, which shows the card that taught it in the sheet itself (the same info card as Practice → Skills, §7.3). Closing the sheet returns to the screen exactly as it was.

---

## 9. Copy, numbers & localization

- Second person, present tense, short sentences, body max 3 lines. **[v4]** In characters: at most 150 (`docs/rules/05-tests-consistency-and-copy.md` §3.9).
- One caveat per screen at most; hedges live in reveal notes.
- Prices two decimals, thin-space thousands, currency symbol from the market profile (`$` in content is replaced). Percentages one decimal. Per-share values always say "per share"; totals always show the share count.
- Session times, index examples and regulation notes come from `content/market_profiles.yaml` via `{{market.*}}` tokens. **[v3]** Clock times are never written literally, even inside a story.
- **[v4] Locale.** Numbers follow the market profile: "$1,234.50" for US, "1.234,50 €" for EU-DE. Clock times show in the learner's own time zone ("US market: 15:30–22:00 German time") — the market a learner trades and the time zone they live in are two settings.
- **[v4] UI strings go through i18n keys** (`en.json` first). Content stays English (`docs/rules/01-what-we-build.md` §1).
- **[v4.1] Languages (decision M).** The app is built in English and translated into every launch language in Phase 3 (`docs/plan/17-phase-3-languages-and-last-check.md`). The language follows the phone and can be changed in Settings. Number formats follow the language (a German reader sees "1.234,50 $" for a US stock); the currency follows the market. Translated content is generated from the English files and never edited by hand, and every screen must also fit in the longest launch language.
