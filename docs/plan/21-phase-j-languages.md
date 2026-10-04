# Phase J: Languages

_Part of the [build plan](README.md) · §14_

## 14. Phase J – Languages (decision M)

**The principle.**
- English is the source. Every other language is generated from it by a checked pipeline and never edited by hand.
- Native speakers read the key texts.
- The phase starts when the English content is final, after the path reviews and `EXPERT`. A later change to an English file re-translates just that file (its source hash changes).

**The language does not decide the market.** A Spanish speaker in Mexico may trade US stocks, so the market profile stays a setting of its own (`MARKETS`).

### `I18N-PIPELINE` – how a language is added

**Goal.** Adding a language becomes a repeatable, checked process. It is proven on German first, because you can judge German yourself.

**Scope**
1. **The app:**
   - the language follows the phone and can be changed in Settings;
   - numbers, currencies and dates go through the locale (`Intl`): a German reader sees "1.234,50 $" for a US stock; plurals go through the i18n library;
   - the number keypad and the parser accept a decimal comma;
   - fonts for every planned script; the layout survives longer text (German runs about 30 % longer than English).
2. **The content:**
   - translations live apart from the source, e.g. `content/i18n/<lang>/…`, with the same ids and structure, and a source hash per file;
   - the translator is `tools/translate.py` via the Claude API, or Claude Code sessions: the stage measures cost and quality on one chapter and proposes one;
   - per language: a glossary (termbase), a style sheet (tone, formal or informal address, which terms stay English, e.g. "Stop-Loss") and a do-not-translate list (`{{market.*}}` tokens, ids, tickers);
   - screens that play with English words (letter tiles, word order) are adapted, not translated literally, and flagged.
3. **Checks per language** (`validate_content.py --lang xx`):
   - the same structure and ids as English, the tokens intact;
   - every number keeps its value (only the format may change), and the answer keys stay the same;
   - length limits per language, and no English left over;
   - the render test per language, and a contact sheet for the longest language.
4. **Store texts and legal texts** go through the same pipeline. Which legal versions are binding is the lawyer's call (`LEGAL-FINAL`).
5. **The German pilot:** the whole UI and Chapter 1 in German. You read it.
6. **The list of launch languages** (decision T): the stage proposes it, with store markets, effort and script. You decide. Right-to-left languages (Arabic, Hebrew) need the stage `RTL`.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2

**Prompt**
```
Stage I18N-PIPELINE from docs/plan/21-phase-j-languages.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision M), the Phase J intro and the "I18N-PIPELINE" section in docs/plan/21-phase-j-languages.md in full, plus docs/ui/14-glossary-and-copy.md §9, docs/rules/01-what-we-build.md §1 and docs/rules/05-tests-consistency-and-copy.md §3.9, and docs/level-files/.
Show me your plan first (file layout, translator, checks, costs) and wait for my approval.

Especially important:
- No translated file is ever edited by hand; everything is regenerated from English plus glossary and style sheet.
- A number that changes its value in translation is an error, not a warning.
- Measure cost and time for one chapter before proposing the full run.

Open a PR against main and get every check green.
Report: what you built · cost and quality of the pilot · the proposed language list · my test checklist with real links · open questions. Then stop.
```

**You test (~45 min)**
1. Switch the app to German: the whole UI is German, and the numbers look German.
2. Play Chapter 1 Levels 1–4 in German: does it read like a German app, or like a translation?
3. Note every term that sounds wrong; they go into the German glossary.
4. Choose the launch languages.

### `MARKETS` – market profiles for the launch markets

**Goal.** Learners in every launch market get correct local facts.

**Scope**
1. The market stays a setting of its own ("the market I trade").
2. Profiles for the launch markets where the rules differ (e.g. the UK), or a generic "international" profile that explains the concept and says that the rules differ by country.
3. Every profile has sessions, currency, regulation notes with a `checked:` date and a source, and tax as "ask a tax advisor where you live".
4. The validator checks that every profile fills every token. Chapter 8 Level 15 of every path renders with every profile.
5. Sentences a lawyer or the expert should check are listed.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage MARKETS from docs/plan/21-phase-j-languages.md. Launch markets: [list].
Read CLAUDE.md, docs/rules/10-legal-and-safety.md §7, content/market_profiles.yaml and docs/plan/02-how-to-work.md §1 and the "MARKETS" section in docs/plan/21-phase-j-languages.md. Research every rule on the web and name every source with its date. No advice, no provider names, no tax rules.
PR, every check green, report: sources · sentences for the lawyer · my test checklist. Then stop.
```

**You test.** Play Chapter 8 Level 15 with two of the new profiles.

### `TRANSLATE-1` … `TRANSLATE-n` – the launch languages

**Goal.** Every launch language, one batch at a time.

**Scope per stage:** one batch of 3–5 languages: glossary and style sheet, UI, content, store texts. Every check green, contact sheets.

**Suggested batches** (the list itself is decision T):
1. Western Europe and Latin America, e.g. Spanish, French, Italian, Portuguese (Brazil), Dutch.
2. Central and Eastern Europe and Turkey, e.g. Polish, Czech, Romanian, Turkish.
3. Asia, e.g. Japanese, Korean, Chinese (simplified), Hindi, Indonesian, Vietnamese.
4. Right to left, after `RTL`, e.g. Arabic, Hebrew.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 per batch

**Prompt**
```
Stage TRANSLATE-[n] from docs/plan/. Languages: [list].
Read CLAUDE.md, §1, Phase J and the "I18N-PIPELINE" and "TRANSLATE" sections of docs/plan/. Run the pipeline for these languages. Fix every failed check through the glossary or the style sheet — never by editing a translation by hand — and report the numbers per language.
PR, every check green, report with contact sheets and a test checklist. Then stop.
```

**You test (~15 min per batch).** Switch the app to each language and play one lesson. You don't need to understand it: look for cut-off text, English leftovers and broken numbers.

### `RTL` – right-to-left languages

Only if Arabic, Hebrew or another right-to-left language is on the list.

**Scope**
- The layout mirrors: the path map, buttons, the direction of "back".
- Charts keep time running left to right, and numbers stay left to right.
- Text alignment.
- Tests with a right-to-left language on every screen type.

**Model · effort · sessions:** Opus 5.5 · high · 1

**You test.** One lesson and the arena in Arabic or Hebrew: nothing overlaps, and the charts read left to right.

### `LANG-REVIEW` – native speakers

**Goal.** No launch language embarrasses the app.

**Scope**
1. **What a native speaker reads in every language:** the risk note and the disclaimer, onboarding, the paywall and the Plus texts, the store texts, and one full lesson.
2. **Who:** testers from `BETA-1`, friends, or freelance proofreaders at a fixed price per language.
3. **Their findings** go into the glossary and the style sheet, and the pipeline runs again.

**Model · effort · sessions:** Opus 5.5 · high · 1–2 (applying the findings)

**You:** find the readers, send each one the links Claude prepares, and bring the findings back.
