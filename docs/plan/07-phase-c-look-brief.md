# Phase C: Look brief

_Part of the [build plan](README.md) · §7_

## 7. Phase C – Look & feel

You are not yet happy with the look. That is why look & feel comes **before** the new learning features, and it starts with you, not with code.

### `LOOK-BRIEF` ✅ – your critique and three directions

**Goal.** Decide how the app should look and feel before anything gets rebuilt.

**You prepare.** This is the most important part. Write your critique using this template and paste it under the prompt:
```
What bothers me (screen link + one sentence):
- …
How it should feel (3 words):
Apps whose look I like – and what exactly about them:
Absolutely not:
```

**Scope**
1. **Collect:** your critique, review items S2–S13, S24 and W4–W6, the principles in `docs/ui/01-design-principles.md` §1.
2. **Three design directions** as clickable prototypes in the preview (skill `prototype`), e.g. "Calm & clear", "Warm & playful", "Precise & professional".
   - Each direction on six key screens:
     - theory with a picture;
     - multiple choice with its reveal;
     - a chart decision with its reveal, including "right, but lost";
     - match;
     - lesson complete;
     - the map with the HUD.
   - Each direction in light and dark.
   - The name "Nutrade" as text; the logo follows in `BRAND`.
   - Reachable under `#prototype/<direction>/<screen>`.
3. **Motion** (decision H: calm and high quality): every direction shows its motion on the six screens — the reveal, a screen change, a chart playing out, lesson complete. Calm but never sluggish: a tap finishes or skips any motion.
4. **Layout variants:** answers in the thumb zone versus today; a proposal for the type scale.

**Not in this stage:** rebuilding the real screens. That is `LOOK-SYSTEM`. One exception, which you chose on 2026-09-29: two text bugs in the real app, from your critique, were fixed here — the stray text and cut-off titles on the map, and the Continue key breaking onto a second line (`LOOK-SYSTEM` items 5 and 6). Also added here at your request of the same day, as testing tools: they show in every development run (Expo Go) without a setting, and an **Animations** page under Settings → Testing plays the animations of rare moments on a tap.

**Model · effort · sessions:** Fable 5.1 · high (else Opus 5.5 · xhigh) · 1–2

**Prompt**
```
Stage LOOK-BRIEF from docs/plan/07-phase-c-look-brief.md.

Read CLAUDE.md, then docs/plan/01-goal-and-guardrails.md §0 ("Fun"), docs/plan/02-how-to-work.md §1 and the "LOOK-BRIEF" section in docs/plan/07-phase-c-look-brief.md in full, plus docs/ui/ in full and items S2–S13, S24, W4–W6 in docs/review-2026-09-25/.
Use the "prototype" skill for the clickable variants.

My critique:
[paste your template here]

Build three genuinely different directions — not the same thing three times in different colors. Each must fit docs/ui/01-design-principles.md §1 (one idea per screen, thumb first, motion only with a purpose).
Change no real screens.

Open a PR against main.
Report: the three directions in three sentences each · links to every variant · the rating table for me · open questions. Then stop.
```

**Claude checks automatically.** All standard checks; the prototype routes render in the render test.

**You test (~30 min)**
1. Click through every direction on your phone and rate each 1–5 for:
   - fun;
   - readability;
   - trust;
   - "I would open this every day".
2. Choose. Mixing is allowed, e.g. "colors from A, type from B".
3. Rate the motion: calm and polished, or sluggish? (Decision H is made; this sets how calm.)

**Done when** Claude has recorded your choice in `docs/ui/15-theming-and-accessibility.md` §10. That happens in the same PR, after your answer.
