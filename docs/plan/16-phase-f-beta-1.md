# Phase F: Beta 1

_Part of the [build plan](README.md) · §10_

## 10. Phase F – Beta 1 (closed, scalping)

The goal of this phase: real people test the finished scalping course before the arena, Swing and Day Trading are built.

### `BRAND` – Nutrade: the trademark, the address and a face

**Goal.** The name Nutrade is protected and has a web address, and the app has a face before store accounts, icons and texts are created.

**When:** first in Beta 1, before the legal texts, the store accounts and the first builds need the name, the web address and the icon. It moved here from Phase C at your request on 2026-09-30, because it is not important before then. Until it runs, the app shows the name "Nutrade" as text and stand-ins for the logos.

**Scope**
1. **Secure the name** (decision L):
   - Run the trademark search for "Nutrade" and close spellings again: DPMA (Germany), EUIPO (EU, e.g. via TMview), WIPO (international), USPTO (US) and the launch markets from decision T. Nice classes 9 (apps), 41 (education), 42 (software) and 36 (finance).
   - Known on 2026-09-26: NUTRADE for supplements and business services (classes 5 and 35; Germany, UK, international), held by a vitamin-gummy maker (nutrade.de); NUTRADE in Mexico, held by Syngenta (including class 42).
   - A one-page note for the lawyer: can Nutrade for an education app coexist with those marks, and what does Mexico mean for a launch there?
   - Prepare our own filing: the word mark "Nutrade" in classes 9 and 41 (42 optional). You or the lawyer file it.
   - The app-store search in the launch markets, and the social handles.
2. **The web address:** nutrade.com is parked with a domain seller (ask the price); otherwise e.g. nutradeapp.com, nutradeapp.app or nutradeapp.de, which were free on 2026-09-26. You register it.
3. **How the name reads in the launch languages:** no unfortunate meaning, easy to say (decision M).
4. **A store title,** e.g. "Nutrade – Learn to Trade". Neither title nor subtitle promises profit (`docs/rules/01-what-we-build.md` §1, docs/rules/10-legal-and-safety.md §7 and the store guidelines).
5. **2–3 logo and icon concepts** as SVG, matching the direction from `LOOK-BRIEF`, and a small logo for each path (Scalping, Swing Trading, Day Trading) for the top bar (`docs/ui/11-top-bar.md` §7.2). Optionally image concepts with the `brandkit` skill.
6. **Tone of voice in five sentences:** sober, friendly, honest.
7. **After your choice, recorded in:**
   - `app.json` (name, slug);
   - the web title;
   - placeholders for icon and splash.

**Model · effort · sessions:** Opus 5.5 · xhigh · 1

**Prompt**
```
Stage BRAND from docs/plan/16-phase-f-beta-1.md.

Read CLAUDE.md, docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision L) and the "BRAND" section in docs/plan/16-phase-f-beta-1.md, docs/rules/01-what-we-build.md §1 and docs/rules/10-legal-and-safety.md §7, and the direction chosen in LOOK-BRIEF in docs/ui/15-theming-and-accessibility.md §10.
Check the name "Nutrade" first: trademark registers, app stores, domains and social handles. State what you checked and what you could not check. If you find a conflict that is more serious than the ones §4.1 already lists, stop and tell me before any design work.
No name, title or subtitle may promise profit, wealth or signals.

Open a PR against main with the drafts (SVG) under assets/brand/.
Report: the name check · the note for the lawyer · web-address options · logo concepts (links) · store title · tone of voice · open questions. Then stop and wait for my choice.
```

**You decide:** the web address and the icon direction. File the trademark early; the lawyer checks it before the release (`LEGAL-FINAL`).

### `LEGAL-DRAFT` – legal texts as drafts

**Goal.** Legal texts as drafts, so the beta and the store entries become possible.

**Scope** (in English and German, because the provider is a business in Germany; the other languages follow in Phase J)
1. **Imprint** under the DDG, with the business's details (decision P).
2. **Privacy policy.** It covers what exists at the beta:
   - local storage;
   - notifications;
   - crash reports and analytics, only with consent;
   - the store providers.

   The stages that add data processing later (`BACKEND`, `MONEY`, `ADS`, `I18N-PIPELINE`) extend it, and `LEGAL-FINAL` reviews the full set.
3. **Terms of use.**
4. **Risk note and disclaimer:**
   - no investment advice;
   - synthetic data;
   - no guarantee.
5. **Draft privacy details** for the App Store and Google Play.
6. **A simple web page** with these texts, e.g. as a second Cloudflare Pages project. The stores require a privacy policy URL.
7. **Settings → Legal** shows the texts.

**Important.** These are drafts, not legal advice. A lawyer reviews them before the release (`LEGAL-FINAL`). Flag for the lawyer which language version is binding and whether a launch country needs texts of its own.

**You prepare.** The business's details: name, legal form, address, contact, and the register entry and VAT ID if there are any (decisions P and Q). Placeholders until the business is registered.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage LEGAL-DRAFT from docs/plan/16-phase-f-beta-1.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "LEGAL-DRAFT" section in docs/plan/16-phase-f-beta-1.md in full, plus docs/rules/10-legal-and-safety.md §7.
Business details: [name, legal form, address, email, register entry, VAT ID].
Write the drafts in English and German; flag every place a lawyer has to decide, including which language version is binding. No text may promise profit or read as investment advice.

Open a PR against main and get every check green.
Report: texts (links) · places flagged for the lawyer · my test checklist · open questions. Then stop.
```

**You test.**
1. Read the texts.
2. Open the web page on your phone.
3. Settings → Legal shows the texts.

### `STORE-SETUP` – accounts and test builds

**Goal.** The app runs as a real app on real devices: TestFlight (iPhone) and Play "internal testing" (Android).

**Scope**
1. **Accounts** (you create them, Claude gives you the steps), in the business's name (decision P):
   - **Apple Developer Program:** €99/year. A sole proprietorship enrolls as an individual and sells under your own name; a legal entity (e.g. UG or GmbH) enrolls as an organization and needs a D-U-N-S number.
   - **Google Play Console:** $25 one-time. An organization account needs a D-U-N-S number and is exempt from the closed-test rule. A personal account created after November 2023 must run a closed test with **at least 12 testers for 14 days in a row** before its first release. Check the current rules before you plan around them.
   - **The D-U-N-S number** is free but can take up to 30 days: request it as soon as the business exists.
   - **An Expo/EAS account.**
2. **Project configuration:**
   - `eas.json` with the profiles development, preview and production.
   - Bundle ID and package name.
   - A versioning scheme.
   - Icon and splash from `BRAND`.
3. **First builds:** TestFlight internal and Play "internal testing".

**You prepare.**
- Register the business first (decision P); the legal form is decision Q.
- Create and pay for the accounts.
- Store the tokens as GitHub secrets.
- Register the test devices.

**Model · effort · sessions:** Sonnet 5 · high · 1

**Prompt**
```
Stage STORE-SETUP from docs/plan/16-phase-f-beta-1.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "STORE-SETUP" section in docs/plan/16-phase-f-beta-1.md in full.
Set up eas.json, app.json (bundle ids, versions, icon, splash) and the build workflow. For every step only I can do (accounts, payments, tokens), write me a numbered guide.

Open a PR against main and get every check green.
Report: what is set up · my steps · my test checklist · open questions. Then stop.
```

**You test.**
1. Install the app via TestFlight (iPhone) and play one lesson.
2. The same via Play "internal testing" (Android).
3. Check haptics and sounds.

### `ANALYTICS` – crash reports, learning analytics, "Report a problem"

**Goal.** In the beta, see where the app crashes and where learners get stuck, without more data than necessary.

**Scope**
1. **Crash reports**, e.g. with Sentry (EU region), only with consent.
2. **Data-minimal learning analytics:**
   - Per question: right, wrong, abandoned.
   - Per lesson: duration and completion.
   - No personal data; limited retention.
3. **Consent** in the first run and in Settings, revocable at any time.
4. **A "Report a problem" button per screen** (K8): sends the screen id and a text by email or form.
5. **A weekly report** as a script: the hardest questions and the most frequent drop-offs.
6. **The privacy policy** is updated accordingly.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage ANALYTICS from docs/plan/16-phase-f-beta-1.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1 and the "ANALYTICS" section in docs/plan/16-phase-f-beta-1.md in full, plus the privacy policy from LEGAL-DRAFT.
Without consent nothing is sent — prove it with a test.

Open a PR against main and get every check green.
Report: what you built · which data goes where (table) · my test checklist · open questions. Then stop.
```

**You test.**
1. Decline consent: nothing is sent.
2. Agree and trigger `#debug-crash`: the crash appears in the dashboard.
3. Try "Report a problem" once.

### `BETA-1` – real testers

**Goal.** Real people, real feedback, before Swing is written.

**Scope**
1. **Testers** — you find them (decision O):
   - 10–30 people.
   - At least 12 if your Google account is a personal one, so the test also counts as Google's required test.
   - At least 3 of them without trading knowledge.
2. **Duration and channels:** 2–4 weeks via TestFlight and the Play closed test.
3. **Questionnaire:** Appendix D.
4. **One round every week:**
   1. Claude evaluates analytics and feedback and writes a prioritized list.
   2. You choose.
   3. A fix session implements it.
   4. An update for the testers: via EAS Update for JS or content changes, a new build only for native changes.

**Success**
- Crash-free ≥ 99.5 %.
- Lessons finished ≥ 85 %.
- Fun ≥ 4/5.
- Comprehension questions ≥ 80 % correct.
- Still active after 7 days ≥ 25 %.

**Model · effort · sessions:** Opus 5.5 · high · 2–4 (one session per weekly round)

**Prompt** (per week)
```
Stage BETA-1, week [n], from docs/plan/.

Read CLAUDE.md and the "BETA-1" section in docs/plan/16-phase-f-beta-1.md. Evaluate: [paste analytics export / feedback].
First the prioritized list (impact × effort), then wait for my choice, then implement it.
PR, every check green, report with a test checklist. Then stop.
```

**Afterwards:** the arena (Phase G), then Swing and Day Trading (Phase H).
