# Chart questions and the mistakes round

_Part of the [ui reference](README.md) · §4.3–4.5_

### 4.3 `chart-decision` — the scenario engine

The chart plays to a decision point and pauses. Three buttons: **Long**, **Short**, **No trade** (Chapter 1 uses a simplified **Buy / Wait** variant). After choosing, the chart continues candle by candle (~120 ms each, tap to skip) and shows the outcome strip and a one-line rationale.

- Scored on reasoning; "No trade" can be best; other answers can be "reasonable" and are marked amber.
- **"No trade" is never red when the best answer is directional.** Standing aside is at worst amber, in lessons and in exams. The app promises this in Chapter 1 and must keep it for 385 sub-levels.
- Session state (day in R, limit, trades taken, size) shows as chips above the chart (6.4).
- The outcome strip reports the move in points and %, with the share count from the scenario. Never as a prediction.
- **[DESIGN-REVIEW] Keys with a direction.** Long, Short and No trade (Buy and Wait in Chapter 1) each carry a small glyph: an arrow up and to the right, an arrow down and to the right, a flat line. The keys stay equal in weight and colour (§6.4); only the glyph carries the direction, and it nudges that way when the key is pressed. It reads faster than the word and does not depend on colour.
- **[DESIGN-REVIEW] After the choice** the chart draws what the file gives it: the entry, `stop` and `target` as labelled lines, playback ending at the first one touched (§6.4); the R ruler from the lesson that teaches R on; and once everything has played out, the file's `notes` on the bars they name.
- **[DESIGN-REVIEW, picks 2026-10-04]** **Swipe to make the call.** While the call is open the chart can be swiped: it follows the finger sideways, leaning the way it goes, with the call it would make stamped on it (LONG or BUY right, SHORT left — WAIT left on a Buy / Wait screen). Let go far enough and that call is made, exactly as its key makes it; short of that it springs back. The strip under the chart says so ("← Short · Long →"). The keys stay the tap path.

### 4.4 `chart-replay` — the spot-it engine **[v3]**

Every other interaction shows a frozen chart. Real scalping is recognising a setup *while it forms* and acting within a bar or two of its trigger — and, far more often, not acting at all. `chart-replay` is the only type that can test either.

**The interaction.** A chart opens showing the first few bars of a session and nothing else. The learner taps **Next bar** to advance one candle at a time. At any bar they may act — **Long**, **Short**, or keep advancing. They may also mark **Nothing here** and end the replay early. When the replay ends, a post-mortem walks the marked moments and grades what the learner did at each.

**No autoplay, no clock.** The learner controls the pace completely: there is no timer, no countdown, and the chart never advances on its own. This is not a compromise, it is section 1's fixed rule — *no timers, no quick-fire, no countdowns anywhere* — and it applies here like everywhere else. Nothing of value is lost: you still decide at bar N without seeing bar N+1, which is the whole skill. What is deliberately absent is adrenaline. Chapter 6 teaches not trading under pressure; manufacturing pressure to practise would teach the state the curriculum tells you to avoid.

**Playback is not new.** 4.3 already runs the chart candle by candle to show the outcome. `chart-replay` is the same playback engine placed *before* the decision instead of after it, with the tap under the learner's thumb.

**Grades.** Each marked moment resolves to exactly one label, and the label comes from arithmetic on the bar index, never from an opinion:

| Label | Means | Shown as |
|---|---|---|
| **Textbook** | Acted on the trigger bar, ±1 | green |
| **Early** | Acted before the card's last field filled | amber |
| **Late** | Acted more than one bar after the trigger | amber |
| **Missed** | The setup formed and triggered; no action | amber |
| **Phantom** | Acted at a decoy, or where nothing was marked | amber |
| **Passed** | Correctly took nothing at a decoy | green |

**Nothing here is red.** As with `chart-decision`, restraint is never punished: `Missed` and `Phantom` are amber, and a replay whose honest answer is "no setup all session" scores green for advancing to the end without acting. A learner who always passes scores badly on `Missed`, never on discipline.

**The post-mortem is the lesson.** Each moment reveals which of the setup card's five fields were filled at that bar and which were not — so `Phantom` reads *"the card wants the third field; at this bar only the first two were filled"*, not *"wrong"*. The learner leaves knowing which field they stopped checking.

**Difficulty is a property, not a claim.** How hard a replay is to *read* is separate from `difficulty` (which grades arithmetic). It is derived from the file: how many decoys it carries, how many card fields are marked `marginal`, whether the setup is named to the learner, and whether "no setup at all" is a possible answer. `docs/level-files/` fixes the thresholds and the validator checks that a replay labelled hard has the properties of a hard one. The ramp the curriculum uses:

| Reading level | Card shown | Setup named | Decoys |
|---|---|---|---|
| 1 | yes, all five fields beside the chart | yes | 0–1 |
| 2 | no | yes | 1–2 |
| 3 | no | no — any of the eight, or none | 2–4 |

### 4.5 The mistakes round **[v4]**

~~Lessons do not cost hearts (§5.2); a wrong answer in a lesson costs a repeat instead.~~ **[DESIGN-REVIEW, 2026-10-04]** A wrong answer in a lesson costs a heart (§5.2) and a repeat. Every question answered wrong comes back once after the lesson's last screen, in a new order and with its options reshuffled. Answering it right clears it; answering it wrong again shows the reveal and moves on — there is no third round. A lesson with a mistakes round is finished, but not perfect. Tests and Final Exams have no mistakes round: they are scored once.

**[DESIGN-REVIEW] The deck.** The round opens on a screen of its own: the missed questions as a small fanned deck, each card with the question's first words and what the learner answered ("You said: Short"), and the count ("2 to fix"). **Start the round** gathers the deck, shuffles it once and deals the first card; then the questions follow as ordinary screens, the progress bar continuing from where the lesson ended. The deck makes the round concrete and small, so it reads as a second chance, not a punishment (David approved it on 2026-10-03). Under reduced motion the deck is drawn still. **Built** as a pile rather than a fan: opaque cards, each one behind peeking out above the next with its question's first line readable, the front card showing its question and "You said: …", and "+2 more" past four cards (a fan of see-through cards overlapped the words into a blur). The top bar reads "Fix 2/6" during the round.

**[DESIGN-REVIEW] Questions stand alone.** A question can come back outside its lesson: in this round, in a mistakes review on the map (§7.1) and in Practice (§7.3). One that follows a `story` brings the scene with it; every other question must make sense on its own (`docs/content-todo/01-rules-from-the-design-review.md` 1.5).
