# Design principles

_Part of the [ui reference](README.md) · §1_

## 1. Design principles

1. **One idea per screen.** A screen teaches one thing or asks one thing, never both.
2. **10–15 seconds per screen.** Theory cards are read in ~10 s, questions answered in ~15 s. A sub-level is 12–18 screens and takes 3–4 minutes. If a card needs longer, split it.
3. **Thumb-first.** Primary action always at the bottom, full-width, reachable one-handed. Answers are big tap targets (min 48 pt). **[v4]** Answers sit in the lower half, directly above the CTA; the question and its visual sit above them.
4. **Instant feedback, never a dead end.** Every answer reveals right/wrong in place within 100 ms. No separate feedback screen. The user always sees the correct answer before moving on.
5. **Show, then ask.** A concept is shown (card, visual, animation) before it is asked. Every defined term is tappable (Glossary popover, section 8).
6. **No pressure.** No timers, countdowns or quick-fire rounds anywhere — **including the new rapid types in §4**. **[v4]** Hearts are spent only in Tests and Final Exams; lessons and practice never cost one (§5.2).
7. **Motion has a purpose.** Animations explain (a slice filling, a spread widening) or reward (badge unlock). Respect the OS "reduce motion" setting. **[v4.1]** Motion is calm and high quality (decision H): unhurried, smooth at the display's frame rate on cheap phones too, and never in the way — the response to a tap starts at once, and a tap finishes or skips any running motion.
8. **Numbers are real.** Prices, spreads and costs use one format everywhere (section 9). Cost math always shows a share count.
9. **Confident tone, tiny caveats.** The card says the simple true thing in one sentence; nuance goes into the reveal note or glossary.
10. **[v3] Variety is a feature, not a decoration.** The path is ~385 sub-levels. A learner meets the same archetype hundreds of times, so every archetype must be worth meeting again, and no chapter may lean on three of them.
11. **[DESIGN-REVIEW] Don't overdo it.** David, 2026-10-03: a slider with ticks, a value bubble and a haptic at every tick is "too much for such a simple question"; a plan document must not "bring too much content on one page"; an order eating the book had "too much going on". A simple question gets a simple screen: no extra marks, bubbles, sounds or haptics where a plain control does the job, and one page carries one block of content. A design that needs a paragraph to explain itself is too much. When in doubt, leave it out.
12. **[DESIGN-REVIEW] The bigger the accomplishment, the bigger the moment.** David, 2026-10-03: "great accomplishments should get better animations, haptics, UI and so on." The celebration grows with what was achieved, so the rare ones stay special: a right answer gets its chime; a finished lesson its ring and count-up, calm; a perfect lesson the gold ring and the only confetti in a lesson (§5.3); a finished chapter its own emblem medal, a heavier haptic sequence and a longer sound (§5.4); a new tier the card turning over to its new material (§5.5). Rare moments may move more than anything else in the app — still calm (decision H), still skippable with a tap, and still never over text.
