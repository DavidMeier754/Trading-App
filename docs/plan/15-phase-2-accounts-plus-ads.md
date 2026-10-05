# Phase 2, app lane – accounts, Nutrade Plus and ads

_Part of the [build plan](README.md)_

While the content lane writes Swing and Day Trading, the app lane builds what the app needs around them: accounts and sync, Nutrade Plus and ads here; crash reports, a measured clean-up and the language pipeline in `docs/plan/16-phase-2-analytics-speed-languages.md`.

**Test keys only.** Plus, ads and Sign in with Apple are built and tested with test keys and sandboxes. Switching them on for real needs the store accounts, which are outside this plan (David, 2026-10-05). Each stage says what you prepare.

### `BACKEND` – accounts and sync (decision K)

**Goal.** Progress lives in an account: safe when a phone is lost, the same on every device, and the base for Nutrade Plus.

**Scope**
1. **Supabase in the EU** (Frankfurt), with access rules (RLS) on every table, tested.
2. **Sign-in with Apple, Google and email** (a one-time code). Apple's rule: an app that offers third-party logins must also offer an equivalent privacy-friendly one; Sign in with Apple covers it.
3. **No sign-in wall:**
   - the app works from the first second;
   - sign-in is offered after the first lessons, in You and before a purchase, never forced;
   - local progress moves into the account on sign-in, without loss.
4. **What syncs:** progress, hearts, XP, streak and freezes, the plan with its history, the practice schedule, the practice account and journal, settings. The conflict rules between two devices are designed in plan mode and tested.
5. **Offline first:** everything works offline, and the sync catches up.
6. **Account deletion** inside the app, and a **data export** (GDPR Art. 15 and 20).
7. **Sign in with Apple** needs an Apple developer account, which is outside this plan: it is built behind its own switch, and Google and email are what you test.

**You prepare.**
- A Supabase account. The free plan is enough.
- The key for Sign in with Google. Claude gives you the steps.

**Model · effort · sessions:** Opus 5.5 · xhigh · plan mode · 2–3

**Prompt**
```
Stage BACKEND from docs/plan/15-phase-2-accounts-plus-ads.md.

Read CLAUDE.md, then docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision K) and the "BACKEND" section in docs/plan/15-phase-2-accounts-plus-ads.md in full, plus docs/rules/01-what-we-build.md §1 and docs/rules/10-legal-and-safety.md §7.
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
   - the full arena.
3. **The paywall,** as designed in `ARENA-DESIGN` (`docs/ui/13-tiers-replays-and-plus.md` §7.8):
   - only at natural points: the free part of the arena used up; out of hearts in a test, next to the free ways (wait, practice for a heart); You and Settings;
   - never in a lesson, never at app start, never over a reveal;
   - a clear price per period, a clear renewal, a clear way to cancel; a trial names its end date, and a reminder comes the day before it ends;
   - no fake urgency, no pre-selected expensive option without its price.
4. **A purchase never needs an account.** "Restore purchases" works without one; with an account, Plus follows you to other devices.
5. **Prices per region** from the stores' price tiers: `MONEY` proposes, you decide (decision R).
6. **Never:** single purchases of hearts or streak freezes, pay-to-pass, "profit" promises.
7. **Built and tested with test keys:** RevenueCat's test store and the sandbox. Real products in the stores need the store accounts, which are outside this plan.
8. **Tests:** sandbox purchase, renewal, expiry, refund, restore, offline.

**You prepare.**
- A RevenueCat account.

**Model · effort · sessions:** Opus 5.5 · high · plan mode · 1–2

**Prompt**
```
Stage MONEY from docs/plan/15-phase-2-accounts-plus-ads.md. Prices: [monthly, yearly, trial – or "propose"].

Read CLAUDE.md, docs/rules/01-what-we-build.md §1 and docs/rules/10-legal-and-safety.md §7, docs/ui/06-reveal-and-hearts.md §5.2, docs/ui/13-tiers-replays-and-plus.md §7.7 and §7.8, and docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision I) and the "MONEY" section in docs/plan/15-phase-2-accounts-plus-ads.md in full.
Show me your plan first and wait for my approval.

Open a PR against main and get every check green.
Report: what you built · every paywall text · my test checklist (sandbox purchases) · open questions. Then stop.
```

**You test.**
1. A test purchase through RevenueCat's test store; restore; cancel.
2. With Plus: the hearts show ∞, there are no ads, the whole arena is open.
3. Without Plus: every lesson is playable, the Daily Chart and the taste of the arena work, and the paywall appears only where it should.

### `ADS` – ads in the free tier

**Goal.** Ads that pay a little and never harm learning or trust.

**Scope**
1. **Google AdMob** via `react-native-google-mobile-ads` (an Expo config plugin). Ads work in development and store builds, not in Expo Go or the web preview.
2. **Consent:**
   - Google's consent tool (UMP, a certified consent platform) wherever the law requires consent (EEA, UK, Switzerland);
   - personalized ads only with consent;
   - recommendation: no personalized ads at all, so there is no tracking prompt on the iPhone (decision S).
3. **Placement:**
   - at most one full-screen ad after a finished lesson, once its result has been shown, and not after every lesson; the caps per day are set here;
   - never inside a lesson, test, reveal, the arena or onboarding; never on the first day; never at app start;
   - no banners and no rewarded ads.
4. **Blocked content:**
   - every category of financial products and services the network offers (brokers, trading and investing apps, crypto, forex and CFDs, loans), gambling and betting, get-rich-quick, and age-restricted content;
   - the reason: an ad for a broker inside a trading course reads like a recommendation (`docs/rules/10-legal-and-safety.md` §7);
   - blocking is best effort, so there is a "Report this ad" link, and the served advertisers get a look once ads run for real.
5. **Plus users see no ads.** A test proves it.
6. **Built and tested with Google's test ad units.** Real ads need the store accounts, which are outside this plan.

**You prepare.** An AdMob account.

**Model · effort · sessions:** Opus 5.5 · high · 1

**Prompt**
```
Stage ADS from docs/plan/15-phase-2-accounts-plus-ads.md.

Read CLAUDE.md, docs/rules/01-what-we-build.md §1 and docs/rules/10-legal-and-safety.md §7, docs/ui/13-tiers-replays-and-plus.md §7.8, and docs/plan/02-how-to-work.md §1, docs/plan/04-decisions.md §4.1 (decision I) and the "ADS" section in docs/plan/15-phase-2-accounts-plus-ads.md in full.
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
