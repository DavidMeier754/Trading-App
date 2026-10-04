# Phase I: Platform

_Part of the [build plan](README.md) · §13_

## 13. Phase I – Platform: account, subscription, ads

### `BACKEND` – accounts and sync (decision K)

**Goal.** Progress lives in an account: safe when a phone is lost, the same on every device, and the base for Nutrade Plus.

**Scope**
1. **Supabase in the EU** (Frankfurt), with access rules (RLS) on every table, tested.
2. **Sign-in with Apple, Google and email** (a one-time code). Apple's rule: an app that offers third-party logins must also offer an equivalent privacy-friendly one; Sign in with Apple covers it.
3. **No sign-in wall:**
   - the app works from the first second;
   - sign-in is offered after the first lessons, in Account and before a purchase, never forced;
   - local progress moves into the account on sign-in, without loss.
4. **What syncs:** progress, hearts, XP, streak and freezes, the plan with its history, the practice schedule, the practice account and journal, settings. The conflict rules between two devices are designed in plan mode and tested.
5. **Offline first:** everything works offline, and the sync catches up.
6. **Account deletion** inside the app and on a web page (both stores require it), and a **data export** (GDPR Art. 15 and 20).
7. **Privacy:** a data-processing agreement with Supabase, the privacy policy extended, the record of processing activities.

**You prepare.**
- A Supabase account. The free plan is enough to start; the paid plan before the release.
- The keys for Sign in with Apple and Google from the developer accounts. Claude gives you the steps.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2–3

**Prompt**
```
Stage BACKEND from docs/plan/20-phase-i-platform.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision K) and the "BACKEND" section in docs/plan/20-phase-i-platform.md in full, plus docs/rules/01-what-we-build.md §1 and docs/rules/10-legal-and-safety.md §7.
Show me your plan first (data model, conflicts between two devices, moving local progress into the account, privacy) and wait for my approval.

Especially important:
- No progress may be lost: local to account, two devices, offline and back.
- Deleting the account removes everything, and a test proves it.

Open a PR against main and get every check green.
Report: what you built · check results · my test checklist · open questions. Then stop.
```

**You test (~30 min)**
1. Play three lessons without an account, then sign in: nothing is lost.
2. Sign in on a second device: the same state.
3. Play offline on one device, then go online: both devices agree.
4. Export your data, then delete the account: you are signed out, and the data is gone.

### `MONEY` – Nutrade Plus (decision I)

**Goal.** Nutrade Plus is built in: honest, within the store rules, and worth its price.

**Scope**
1. **RevenueCat** (`docs/rules/01-what-we-build.md` §1) with one entitlement, `plus`, and two products: monthly and yearly, optionally with a free trial.
2. **What Plus unlocks,** all through one check:
   - unlimited hearts (the switch from `LOOP-HEARTS`);
   - no ads (`ADS`);
   - the full arena (Phase G).
3. **The paywall,** as designed in `ARENA-DESIGN` (`docs/ui/13-tiers-replays-and-plus.md` §7.8):
   - only at natural points: the free part of the arena used up; out of hearts in a test, next to the free ways (wait, practice for a heart); Account and Settings;
   - never in a lesson, never at app start, never over a reveal;
   - a clear price per period, a clear renewal, a clear way to cancel; a trial names its end date, and a reminder comes the day before it ends;
   - no fake urgency, no pre-selected expensive option without its price.
4. **A purchase never needs an account.** "Restore purchases" works without one; with an account, Plus follows you to other devices.
5. **Prices per region** from the stores' price tiers: `MONEY` proposes, you decide (decision R).
6. **Terms:** the subscription terms, the EU right of withdrawal for digital content, cancellation.
7. **Never:** single purchases of hearts or streak freezes, pay-to-pass, "profit" promises.
8. **Tests:** sandbox purchase, renewal, expiry, refund, restore, offline.

**You prepare.**
- The paid-apps agreements with Apple and Google, with the business's tax and bank details (decision P).
- A RevenueCat account.

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 1–2

**Prompt**
```
Stage MONEY from docs/plan/20-phase-i-platform.md. Prices: [monthly, yearly, trial – or "propose"].

Read CLAUDE.md, docs/rules/01-what-we-build.md §1 and docs/rules/10-legal-and-safety.md §7, docs/ui/06-reveal-and-hearts.md §5.2, docs/ui/13-tiers-replays-and-plus.md §7.7 and §7.8, and docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision I) and the "MONEY" section in docs/plan/20-phase-i-platform.md in full.
Show me your plan first and wait for my approval.

Open a PR against main and get every check green.
Report: what you built · every paywall text · my test checklist (sandbox purchases) · open questions. Then stop.
```

**You test.**
1. A sandbox purchase on iPhone and on Android; restore; cancel.
2. With Plus: the hearts show ∞, there are no ads, the whole arena is open.
3. Without Plus: every lesson is playable, the Daily Chart and the taste of the arena work, and the paywall appears only where it should.

### `ADS` – ads in the free tier

**Goal.** Ads that pay a little and never harm learning or trust.

**Scope**
1. **Google AdMob** via `react-native-google-mobile-ads` (an Expo config plugin). Ads work in development and store builds, not in Expo Go or the web preview.
2. **Consent:**
   - Google's consent tool (UMP, a certified consent platform) wherever the law requires consent (EEA, UK, Switzerland);
   - personalized ads only with consent;
   - recommendation for v1.0: no personalized ads at all, so there is no tracking prompt on the iPhone (decision S).
3. **Placement:**
   - at most one full-screen ad after a finished lesson, once its result has been shown, and not after every lesson; the caps per day are set here;
   - never inside a lesson, test, reveal, the arena or onboarding; never on the first day; never at app start;
   - no banners and no rewarded ads in v1.0.
4. **Blocked content:**
   - every category of financial products and services the network offers (brokers, trading and investing apps, crypto, forex and CFDs, loans), gambling and betting, get-rich-quick, and age-restricted content;
   - the reason: an ad for a broker inside a trading course reads like a recommendation (`docs/rules/10-legal-and-safety.md` §7);
   - blocking is best effort, so there is a "Report this ad" link, and after the release the served advertisers get a look once a month.
5. **Plus users see no ads.** A test proves it.
6. **Privacy:** the privacy policy, the store privacy details and the consent texts are extended, and the age rating is checked again.

**You prepare.** An AdMob account, in the business's name.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage ADS from docs/plan/20-phase-i-platform.md.

Read CLAUDE.md, docs/rules/01-what-we-build.md §1 and docs/rules/10-legal-and-safety.md §7, docs/ui/13-tiers-replays-and-plus.md §7.8, and docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision I) and the "ADS" section in docs/plan/20-phase-i-platform.md in full.
Research the current AdMob and consent requirements and name your sources with their date.

Especially important:
- No ad inside a lesson, test, reveal or the arena; financial and gambling categories blocked; no ads for Plus.

Open a PR against main and get every check green.
Report: every place an ad can appear · the blocked categories · my test checklist · open questions. Then stop.
```

**You test.**
1. Play five lessons in a test build: ads only where planned.
2. Decline consent: the app still works.
3. With Plus: no ad anywhere.

### `UPDATES` – content without store updates

**Goal.** Content can change after the release without a new store build and without lost progress.

**Scope**
- `expo-updates` with channels (preview, production).
- Content versions, per language (Phase J).
- **Progress migration:** if a lesson id changes after the release, a migration table makes sure no progress is lost. The rule for it is in `docs/rules/09-working-and-process.md` §6.
- Chapters and languages are loaded on demand instead of everything in the first bundle.
- Offline behavior.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage UPDATES from docs/plan/20-phase-i-platform.md. Read CLAUDE.md, docs/rules/09-working-and-process.md §6 and docs/plan/02-how-to-work.md §1 and the "UPDATES" section in docs/plan/20-phase-i-platform.md. PR, every check green, report with a test checklist. Then stop.
```

**You test.**
- Send a content update to the preview: it arrives without reinstalling.
- A renamed test lesson keeps its progress.

### `TECH` – clean-up, only backed by measurements

**Goal.** Clean up where a measurement shows that it helps.

**Scope**
1. **Measure first:** bundle size, cold start, memory and frame rate on a cheap Android device.
2. **Then only what the measurement justifies:**
   - Split `Chart.tsx` (1,818 lines).
   - Optionally `expo-router`.
   - Optionally a JSON schema as the single source for the TS types and the validator (S39).

**Model · effort · sessions:** Opus 5.5 · high · 1–2

**Prompt**
```
Stage TECH from docs/plan/20-phase-i-platform.md. Read CLAUDE.md and docs/plan/02-how-to-work.md §1 and the "TECH" section in docs/plan/20-phase-i-platform.md. Measure first and report; change only what a measurement justifies, and measure again afterwards. PR, every check green, report (measurements before/after) with a test checklist. Then stop.
```

**You test.** The app feels the same or faster; the measurements before and after are in the report.
