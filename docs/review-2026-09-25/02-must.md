# Must (M)

_Part of the [review of 2026-09-25](README.md) · §3_

## 3. MUST

### Bugs in the app

**M1 – The plan overview always shows "not set yet"**
- *Observed:* At `1·16-2 S14` the plan is saved (`progress.v1.plan`), but the `plan-sheet` still shows every row empty.
  - docs/ui/ calls your own plan "the single strongest engagement device in the app", and on its first appearance it is broken.
- *Cause:* `StaticScreens.tsx` → `VisualScreen` calls `<Visual>` without `planValues`; `LessonPlayer` does not pass the plan on.
- *Fix:* Pass the plan on to `VisualScreen` → `Visual`. That is a one-liner plus a test.

**M2 – All 40 `depth-ladder` screens crash ("Something broke")**
- *Affected (per render test):* 38 lessons in chapters 3–8.
  - Among them the final exams `3·19-1`, `5·17-1` and `8·17-1` and the checkpoints `4·8-1`, `5·10-1`, `6·5-1` and `8·5-1`.
  - The first crash is `3·15-2` "Inside the Quote".
  - Levels open one after another (`pathState.ts`), so once the content is wired in, nobody would get past chapter 3 level 15.
  - The error screen has no way back (see S23).
- *Cause:* The content and docs/level-files/ write `data: {bids, asks}`; the renderer (`TapScreens.tsx`) reads `screen.bids`.
  - The test bench (`demo/all-screens.yaml`) was written to match the renderer instead of the schema. That is why it was green although the real content crashes.
- *Fix:* Align the renderer with the schema and run the bench through the validator (see M14).

**M3 – Marked price lines are missing or `NaN`**
- *Observed:* There are 29 `levels` given as bare numbers (`levels: [24.4]`) in 13 files (ch. 2, 3, 5, 8). The renderer expects `{price, label}`.
  - The line is missing, and the console reports `y1: NaN`. In the render test this affects 15 screens, including several `swipe-deck` cards.
  - But the question refers to the line, e.g. `5·7-2` "each with its own marked price".
- *Fix:* Let the renderer accept both forms, or align the content. In addition, a validator rule for the `levels` format.

**M4 – The recap opens the wrong card**
- *Observed:* Tapping a takeaway in the recap always opens the lesson's first theory card.
  - Example `1·1-4`: "only a closed trade has a result" opens "This is a price chart".
- *Cause:* `content.ts` → `sourceCardOf()` always takes the first theory screen.
- *Fix:* Each recap item references its card (a new field `card:`, 🔶 W14) or is found by its title.

**M5 – The wrong lead sentence for "amber" answers**
- *Observed:*
  - Every amber choice shows "Standing aside costs nothing here. The better call was …", even when you chose Buy/Long, i.e. did not stand aside (`LessonPlayer.tsx` → `revealLead`; evidence image 1, `1·9-2 S3`).
  - The other way round, `1·1-1 S6` says "you just made your first trade" even when you chose "Wait" (evidence image 2).
- *Fix:* Make the sentence depend on the chosen option. The explanations get a variant for "stood aside" (or the explanation is worded neutrally).

**M6 – Web: screen readers give the answer away before you answer**
- *Observed:* `RevealProbe`, an invisible measuring copy of the explanation, is in the accessibility tree. A screen reader reads "The better call was Buy …" before you answer.
  - The attributes `accessibilityElementsHidden` and `importantForAccessibility` only work natively.
  - A smaller case of the same: in `fill-tiles` the answer word sits in the DOM as invisible "sizer" text.
- *Fix:* Set `aria-hidden` on web, mount the probe only after the answer, and fill the sizer with placeholder characters.

**M7 – The reveal of a chart decision shows the wrong thing**
- *Observed:*
  - The `outcome` sentence from the YAML is never shown; it is only in the accessibilityLabel.
    - Example `1·9-2 S3`: the lesson would be "… +$45 on 250 shares, and those 250 would have taken three prices to sell" (exit costs).
    - Instead of this sentence there is only a green "+$45.00 on 250" (evidence image 1).
  - So an amber answer gets a green reward signal while the text says "The better call was Wait".
  - For "Wait" there is also a colored "+$0.02 you stood aside".
  - The P/L ignores the exit costs that were just taught.
- *Fix:*
  - Show the outcome sentence.
  - Color the P/L badge green or red only when the decision was also right or wrong; otherwise neutral.
  - For "Wait", show "Had you bought: +$0.02" in gray.
  - "on 250" becomes "on 250 shares" (docs/ui/14-glossary-and-copy.md §9: totals always show the share count).

### Legal & safety

**M8 – The risk note, legal texts, onboarding, imprint and privacy policy are missing completely**
- *Required by the docs:*
  - `docs/rules/10-legal-and-safety.md` §7 and docs/ui/16-navigation.md §11.6: the one-liner "Trading involves risk of loss. This app teaches concepts, not signals." appears on first launch, on every scenario result and on the stats screen.
  - The full text under Settings → Legal.
  - docs/ui/16-navigation.md §11.1: onboarding with 3 screens (what the app is, the risk note, notifications).
- *Actual:* Zero hits in code and content. The app starts straight on the map, and Settings have no Legal entry.
- *In addition, for an offering from Germany:*
  - An imprint (Impressum, DDG), a privacy policy (GDPR, even though everything is local so far) and terms of use.
  - The age rating for financial topics in the stores.
  - The "EU/BaFin-compliant wording" from docs/rules/ is still open and should be checked by a lawyer.
- *Fix:* Build everything named above. Have the legal texts checked externally.

**M9 – Outcome bias: the app almost always rewards "correct" with a profit** 🔶 W12
- *Measured across all the Scalping content:* Of 338 chart decisions whose best answer is Long/Short/Buy, only 12 (3.5 %) end in a loss.

  | Chapter | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
  |---|---|---|---|---|---|---|---|---|
  | Losses / correct decisions | 0/26 | 0/57 | 0/24 | 0/54 | 1/44 | 2/47 | 6/58 | 3/28 |

- *Chapter 1 in detail:*
  - 16 buy decisions, all with a profit.
  - 20 scenarios following the pattern "stepped higher/climbing … Buy, or wait?".
  - `1·17-1 S5` explains: "A direction already under way is the clearest reason a beginner has to buy".
  - That trains chasing, before chapter 2 L14 teaches "don't chase".
- *Why it is a must:*
  - Chapter 6 teaches that a 40 % hit rate can be profitable and that a single trade is close to chance.
  - `docs/rules/` (Product decisions → Chart decisions) says "Never framed as prediction or profit."
  - Implicitly, though, the learner absorbs a ~96 % hit rate. That is the most dangerous false lesson a trading learning app can leave behind.
- *Fix:*
  - A new content rule: about 30–40 % of correct long/short decisions run into the stop.
  - A reveal text "Right decision, losing trade – that is variance, not a mistake".
  - A validator warning for the share.
  - At least one lesson early in chapter 1 on "good decision ≠ good outcome".

**M10 – The sign trap in number inputs** 🔶 W13
- *Observed:* The same kind of question, different expectations.

  | Location | Expected answer |
  |---|---|
  | `1·1-1 S10` "result per share" | −0.40 |
  | `1·1-3 S10` "6 cents against you. How many dollars?" | +30 |
  | `1·5-1 S8` | −6 % |
  | `1·13-1 S6` | −150 |
  | `1·13-3 S4` | −122.5 |
  | `1·15-2 S10` | +300 |

  - Someone who understood the concept still loses hearts.
- *Fix:* Either a schema field `sign: any` (the absolute value counts), or the prompt says it explicitly ("as a negative number" / "how much did you lose?"). Plus a validator rule.

**M11 – Hearts: a dead end and a frustration spiral** 🔶 W1 (partly solvable without changing the docs)
- *Played:*
  - In `1·1-1`, 2 hearts were left after 3 mistakes. Five mistakes in the very first lesson mean hours of lockout.
  - Checkpoint `1·5-1` with 4 mistakes gave 60 % ("Almost"). After that 1 heart was left; one mistake in the retry leads to "Out of hearts", and all 5 hearts only come back after 20 h.
  - At "Out of hearts" all progress in the lesson is gone, even on screen 14 of 15.
  - There is nothing to do: Practice is empty, and you cannot reread cards.
- *Doable right away without changing the docs:*
  - "Reread cards" (docs/ui/02-lesson-player-layout.md §2/§7.1 promises "Review cards").
  - A heart back through a practice round (docs/ui/06-reveal-and-hearts.md §5.2 "Optional later").
  - An out-of-hearts screen that offers practice instead of only "back".
- *With a doc change (W1):* hearts only in tests and final exams, as it used to be on `main`; lessons are for trying things out.
  - The app teaches tilt and revenge trading in chapter 6, and itself creates exactly this frustration loop.

### Content integrity & project state

**M12 – Describe, review and merge PR #13 – `main` is outdated**
- PR #13 has 54 commits, +41,689 lines, the automatic branch name as its title, no description, no review and no checks.
- `main` has the hard validator error (`level-09-2`: 500×$12.80 > $6,000), 66 sizing breaches, 47 instead of 48 lessons in chapter 1 and a README saying "nothing rendered".
- Every new agent that starts from `main` works on the wrong state.
- *Fix:* Write the PR description (what, why, how to test), then merge, then continue in small PRs.

**M13 – Make the finished content playable (after M2/M3)**
- After chapter 2 L3 the map shows "Levels 4–18 of Chapter 2 soon". 330 finished, validated lessons are simply not imported.
- As a test I wired them in within a few minutes; the bundle grows from 2.4 to 4.6 MB (see S38 for a better solution).
- *Fix:* Generate the content index instead of 58 hand-written imports, wire in everything and unlock it after M2/M3. 🔶 W2, because this is not in the order of `docs/plan/`.

**M14 – CI with the validator, tests, typecheck and a render smoke test**
- There is no `.github/workflows`.
- The validator, `test_validate`, `check_sizing` and `tsc` only run when someone remembers.
- A render test of all screens would have found M2 and M3 at once. docs/plan/ asks for exactly that: "do not start PATHS until the schema has also survived a render of every screen type".
- *Fix:*
  - A GitHub Action for the validator (`--strict` on the PR diff), the self-test, sizing and tsc.
  - In addition a Playwright smoke test that opens every screen by deep link. My script can be the basis; it runs about 40 min and can be parallelized.
  - The test bench is validated as well.

**M15 – The learner's own plan rule (max. 50 % per position) is broken right away** 🔶 W3
- The plan card in `1·16-2` lets you enter "max 50 % of the account in one position". The reasoning is set out cleanly in docs/rules/04-numbers-and-realism.md §3.6.
- But:
  - The exercises in chapter 1 are at 84–94 % of the account (e.g. `1·1-3 S9` 94 %).
  - Chapter 2 runs at a median of 90 %.
  - Only chapter 3 raises the plan to 95 %.
  - On top of that, `2·1-4 S7` introduces a new $20,000 account (chapter 1: $6,000 "your practice account"), and `S8` immediately uses ~69 % of it.
- So for a whole chapter the learner breaks the rule they have just written down, and does not know which account is "theirs".
- *Options:* see W3.

**M16 – Make the three open product decisions A/B/C**
- According to docs/plan/ they block the next content step (OFFER).
- No agent can decide them, only you. Details in section 7.

**M17 – Legally delicate wording in `market_profiles.yaml`**
- EU-DE `fee_note` "often €1–€5 plus venue fees" is a price statement. `docs/rules/10-legal-and-safety.md` §7 says: "Fees are explained as a category, not as a price list." That breaks a rule in the project's own content.
- EU-DE `regulation_note` "losses are capped at the account for stocks" is misleading.
  - ESMA's negative balance protection applies to CFDs.
  - When you buy shares outright, the loss is limited to the stake anyway; when you sell short, it is exactly not.
- US `regulation_note` (the PDT rule): FINRA started a reform in 2025. Check the current state before the release and give every regulatory sentence a review date.
- EU-DE `timezone: "CET"` is wrong in summer (CEST). Better "German time" or `Europe/Berlin`.
