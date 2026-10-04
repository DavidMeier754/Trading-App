# Replays

_Part of the [rules for content and code](README.md) · §3.10_

### 3.10 Replays **[v3 — new section]**

A replay (`docs/ui/05-chart-questions-and-mistakes-round.md` §4.4, format in `docs/level-files/07-drill-packs-and-replays.md` § Replays) is the only content in the
app that tests **timing** and **restraint**. Every other screen freezes a chart and asks what
it is; a replay asks *is it now?* — and counts the trade the learner took that was never there.
Authoring one is a different job from authoring a `chart-decision`, and these rules are what
keep it teachable.

- **No autoplay, ever.** The learner taps for each bar. This is not a rendering choice, it is
  section 1's fixed decision — *no timers, no quick-fire, no countdowns anywhere* — and a
  replay that advances on its own breaks it. The skill under test is deciding at bar N without
  seeing bar N+1, and a hand-advanced chart tests that completely. What is deliberately absent
  is time pressure: Chapter 6 teaches not trading under pressure, so manufacturing it to
  practise would rehearse the very state the curriculum tells the learner to stand down from.
- **40–80 bars.** Below 40 there is nothing to sit through and the setup is the only thing on
  screen; above 80 the tap becomes work. The session needs enough quiet bars that advancing
  through them is itself the exercise.
- **The trigger is the last field, not a judgement.** A setup triggers at the bar its final
  card field fills. Author the fields with the bar each one fills at, and let `trigger_bar`
  fall out of them. This is what makes Early / Textbook / Late arithmetic; an authored trigger
  that the fields do not support is an ungradeable replay.
- **Every decoy names the field it fails, and the reveal says which.** This is the rule that
  separates difficulty from noise. A chart that is hard because the bars are ambiguous is a
  coin flip, and a scored coin flip teaches superstition — the exact opposite of the
  expectancy thinking Chapter 6 exists to build. If you cannot name why the near-miss was not
  the setup, it is not a decoy: cut it or fix it.
- **At most two of the five fields may be `marginal`.** Marginal means *a real read that is
  genuinely close* — a reclaim that closes two cents above instead of engulfing. Three or more
  marginal fields is not a hard setup, it is an unreadable one.
- **A Phantom is a lesson, not a verdict.** The post-mortem names the field the learner stopped
  checking ("the card wants the third field; at this bar only the first two were filled").
  Never "wrong".
- **Restraint is never red.** `Missed` and `Phantom` are amber, never red, exactly as "No trade"
  is in §3.5. A replay whose honest answer is *no setup all session* is legitimate content and
  scores green for reaching the last bar unbothered.
- **The arithmetic still has to hold over every bar.** 40–80 candles, a volume series, a VWAP
  series and two or three stated positions is five to eight times the numbers of a
  `chart-decision`, and every one of §3.6's rules still applies: the two sizing ceilings, the
  account cap, the price band, the volume magnitudes. This is where errors hide, because no
  single screen displays them all.
- **Never generate a replay in a batch.** One at a time, each verified — recompute every stated
  stop distance, share count and R, and re-read the bar series against every `filled_at` you
  claimed. The drill batch (stage DRILLS) works because a drill is 8–12 bars with one answer; a replay
  is not that shape.
- **Reading level is a property, not a label.** It follows from `shows_card`, `names_setup` and
  the decoy count (table in `docs/level-files/`). Do not write `reading_level: 3` on a replay that
  hands the learner the card.
- **A replay is not a simulator.** It teaches recognition, not live execution, and the copy
  never implies otherwise. Chapter 8 still ends on the 30-day simulator plan (§7); a replay is
  practice on the way there.
