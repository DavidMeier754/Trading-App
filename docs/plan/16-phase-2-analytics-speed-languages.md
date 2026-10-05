# Phase 2, app lane – analytics, speed and the language pipeline

_Part of the [build plan](README.md)_

The rest of Phase 2's app lane: crash reports and learning analytics with consent, a clean-up backed by measurements, and the pipeline that adds a language, proven on German.

### `ANALYTICS` – crash reports, learning analytics, "Report a problem"

**Goal.** See where the app crashes and where learners get stuck, with their consent and without more data than necessary.

**Scope**
1. **Crash reports**, e.g. with Sentry (EU region), only with consent.
2. **Data-minimal learning analytics:**
   - Per question: right, wrong, abandoned.
   - Per lesson: duration and completion.
   - No personal data; limited retention.
3. **Consent:** asked after the first finished lesson, together with the reminders (`ONBOARDING`), and in Settings; revocable at any time. Without consent nothing is sent.
4. **A "Report a problem" button per screen** (K8): sends the screen id and a text by email or form.
5. **A weekly report** as a script: the hardest questions and the most frequent drop-offs.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage ANALYTICS from docs/plan/16-phase-2-analytics-speed-languages.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "ANALYTICS" section in docs/plan/16-phase-2-analytics-speed-languages.md in full, plus docs/rules/10-legal-and-safety.md §7.
Without consent nothing is sent — prove it with a test.

Open a PR against main and get every check green.
Report: what you built · which data goes where (table) · my test checklist · open questions. Then stop.
```

**You prepare.** A Sentry account in the EU region; Claude gives you the steps.

**You test.**
1. Decline consent: nothing is sent.
2. Agree and trigger `#debug-crash`: the crash appears in the dashboard.
3. Try "Report a problem" once.

### `TECH` – clean-up, only backed by measurements

**Goal.** Clean up where a measurement shows that it helps.

**Scope**
1. **Measure first:** bundle size, cold start, memory and frame rate on a cheap Android device.
2. **From the old `UPDATES` stage** (David, 2026-10-05; update channels belong to the store release, outside this plan):
   - chapters and languages load when they are needed, not all in the first bundle — needed once every language is in;
   - **progress migration:** if a lesson id changes, a migration table keeps every learner's progress (the rule is in `docs/rules/09-working-and-process.md` §6);
   - offline behavior.
3. **Then only what the measurement justifies:**
   - Split `Chart.tsx` (1,818 lines).
   - Optionally `expo-router`.
   - Optionally a JSON schema as the single source for the TS types and the validator (S39).

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage TECH from docs/plan/16-phase-2-analytics-speed-languages.md. Read CLAUDE.md and docs/plan/02-how-to-work.md §1 and the "TECH" section in docs/plan/16-phase-2-analytics-speed-languages.md. Measure first and report; change only what a measurement justifies, and measure again afterwards. PR, every check green, report (measurements before/after) with a test checklist. Then stop.
```

**You test.** The app feels the same or faster; the measurements before and after are in the report.

### `I18N-PIPELINE` – how a language is added

**When.** At the end of Phase 2's app lane. The pilot needs only Chapter 1 and the app; the other languages wait for the final English (Phase 3).

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
4. **The German pilot:** the whole UI and Chapter 1 in German. You read it.
5. **The list of launch languages** (decision T): the stage proposes it, with store markets, effort and script. You decide. Right-to-left languages (Arabic, Hebrew) need the stage `RTL`.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2

**Prompt**
```
Stage I18N-PIPELINE from docs/plan/16-phase-2-analytics-speed-languages.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision M), the Phase 3 intro in docs/plan/17-phase-3-languages-and-last-check.md and the "I18N-PIPELINE" section in docs/plan/16-phase-2-analytics-speed-languages.md in full, plus docs/ui/14-glossary-and-copy.md §9, docs/rules/01-what-we-build.md §1 and docs/rules/05-tests-consistency-and-copy.md §3.9, and docs/level-files/.
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
