# The plan

_Part of the [level file format](README.md)_

## The plan — one key schema for the whole path **[v3]**

`plan-card` writes the learner's plan; `plan-sheet` renders it. Between them they are the one
document the learner builds over eight chapters, so the keys are a single namespace for the
whole path, not per-chapter names. **A key a later chapter displays must be a key an earlier
chapter wrote** — the validator enforces it.

### How a key is written and read

- A `plan-card` field writes `fields[].key`. `kind` is `number` or `text`. `suggest` is the
  placeholder shown **only while the key is still empty**; once the learner has saved a value,
  `suggest` is ignored. A `number` field steps with − / + or takes its suggestion in one tap; a
  `text` field is typed. The card's button waits until every field is filled (a number above 0).
- A `plan-sheet` field with a literal `value` is a **specimen line**: a worked example or the
  given numbers of the scenario around it. It shows what it says and nothing is read from the
  profile.
- A `plan-sheet` field **without** `value` is a **learner line**: the renderer fills it from the
  learner's saved plan. Every learner line's key must have been written by a `plan-card` the
  learner has already reached (an earlier sub-level, or an earlier screen of the same one).
- Either kind may carry a shorter `label` than the card that wrote the key; the sheet is a
  summary, and the card is where the question is asked in full.

### Revisiting a field

**Pre-filled and editable — one live value per key, with a dated history.** When a chapter asks
for a key the learner already filled, the card opens with their current value in the field. Saving
overwrites the live value and pushes the old one into that key's history with the date it was
replaced. `plan-sheet` always renders the live value; the history is for the plan document (Account → Your plan, **[DESIGN-REVIEW]**) and the
export only. There is never a second live value for one key, so a later chapter and an earlier one
can never disagree about what the plan says.

The `card.<slot>.*` rows are the exception to nothing: each slot is its own row, so writing card B
never touches card A. Re-opening a slot pre-fills and overwrites that row exactly as above.

### The keys

Six groups. "Written" names the chapter and sub-level whose `plan-card` writes the key; where two
are listed, the second revisits the key under the rule above.

**1. Practice setup — `setup_*`** — where the learner practises and what is on their screen.

| key | kind | written | re-read by |
|---|---|---|---|
| `setup_session` | text | 1 · 16-2 | 1 · 16-2 sheet |
| `setup_name` | text | 1 · 16-2 | 1 · 16-2 sheet |
| `setup_max_account_pct` | number | 1 · 16-2; **[v4]** revisited in scalping 2 · 1-4 (50 → 95, `docs/rules/04-numbers-and-realism.md` §3.6) and in the swing path's Chapter 3 | 1 · 16-2 sheet |
| `setup_style` | text | 1 · 16-2 | 1 · 16-2 sheet |
| `setup_decision_timeframe` | number | 2 · 16-3 | — |
| `setup_context_timeframe` | number | 2 · 16-3 | — |
| `setup_levels_marked` | number | 2 · 16-3 | — |
| `setup_names_watched` | number | 2 · 16-3 | — |

**2. Cost limits — `cost_*`** — what the learner will let a trade cost before it is worth taking.

| key | kind | written | re-read by |
|---|---|---|---|
| `cost_max_share_of_target` | number | 3 · 17-3 | — |
| `cost_max_spread_cents` | number | 3 · 17-3 | — |

**3. The read — `read_*`** — how the learner reads a chart and picks the names to read.

| key | kind | written | re-read by |
|---|---|---|---|
| `read_order` | text | 4 · 12-3 | — |
| `read_min_agreeing` | number | 4 · 12-3 | — |
| `read_never_without` | text | 4 · 12-3 | — |
| `read_shortlist_size` | number | 5 · 15-3 | — |
| `read_lines_per_name` | number | 5 · 15-3 | — |
| `read_start_minutes` | number | 5 · 15-3 | — |
| `read_min_rvol` | number | 6 · 16-3 | — |

**4. Session limits — `session_*`** — the risk unit, the numbers that end a session, the reset
routine, and the rules for reading the record back.

| key | kind | written | re-read by |
|---|---|---|---|
| `session_risk_pct` | number | 3 · 17-3 | — |
| `session_share_size` | number | 5 · 15-3, 8 · 4-4 | 8 · 13-1 sheet, 8 · 15-2 sheet |
| `session_r_dollars` | number | 6 · 9-3, 8 · 4-4 | 8 · 13-1 sheet, 8 · 17-1 sheet |
| `session_daily_loss_limit` | number | 6 · 9-3, 8 · 4-4, 8 · 7-3 | 8 · 13-1, 8 · 15-2, 8 · 17-1 sheets |
| `session_trade_cap` | number | 6 · 9-3, 8 · 4-4, 8 · 7-3 | 8 · 13-1, 8 · 15-2, 8 · 17-1 sheets |
| `session_new_trade_cutoff` | number | 6 · 9-3, 8 · 7-3 | — |
| `session_reset_stops` | number | 6 · 12-2 | — |
| `session_reset_minutes` | number | 6 · 12-2 | — |
| `session_return_size_pct` | number | 6 · 12-2 | — |
| `session_return_condition` | text | 6 · 12-2 | — |
| `session_rules_tested` | number | 6 · 16-3 | — |
| `session_rows_before_judging` | number | 6 · 16-3 | — |
| `session_review_rows` | number | 8 · 11-4 | — |
| `session_reviews_per_month` | number | 8 · 11-4 | — |
| `session_changes_per_review` | number | 8 · 11-4 | — |

**5. Playbook cards — `card.<slot>.<field>` and `card_*`** — the learner's own setups.

A `plan-card` carrying `slot: <id>` writes one **row** of the playbook. Its field keys are the six
row fields below and resolve to `card.<slot>.<field>`, so every card on the sheet has the same
shape. A `plan-sheet` may carry the same `slot:` and then use the short field names; without it,
use the full dotted key. The key `cards` renders the whole page of rows by name.

| slot | the card | written |
|---|---|---|
| `draft` | the setup the learner already half-recognises, before any are taught | 7 · 1-3 |
| `a` | VWAP bounce | 7 · 2-4 |
| `b` | Opening-range scalp | 7 · 3-4 |
| `c` | Momentum continuation | 7 · 4-4 |
| `d` | Mean reversion at a level | 7 · 6-4 |
| `e` | Failed-breakout fade | 7 · 7-3 |
| `f` | Gap-and-go continuation | 7 · 10-3 |
| `g` | Range rotation | 7 · 11-3 |
| `h` | The re-entry | 7 · 12-3 |

Row fields, the same on every slot: `name`, `context`, `entry`, `stop`, `target`, `invalidation`
(all `text`). `cards` is the list of the eight named cards `a`–`h`; `draft` is a practice row and
is not one of them.

| key | kind | written | re-read by |
|---|---|---|---|
| `cards` | list | 7 · 2-4 … 12-3 | 8 · 17-1 sheet |
| `card.c.stop` | text | 7 · 4-4 | 8 · 15-2 sheet |
| `card_reentry_max` | number | 7 · 12-1 | — |
| `card_reentry_size` | number | 7 · 12-1 | — |
| `card_reentry_condition` | text | 7 · 12-1 | — |
| `card_trend_day` | text | 7 · 14-3 | — |
| `card_range_day` | text | 7 · 14-3 | — |
| `card_min_band` | number | 7 · 14-3 | — |

**6. Simulator and live plan — `sim_*`, `live_*`** — the thirty days and the first live month.

| key | kind | written | re-read by |
|---|---|---|---|
| `sim_sessions` | number | 8 · 14-1 | — |
| `sim_cards` | number | 8 · 14-1 | — |
| `sim_trades_per_session` | number | 8 · 14-1 | — |
| `live_share_size` | number | 8 · 15-3 | — |
| `live_r_dollars` | number | 8 · 15-3 | — |
| `live_rows_before_rung` | number | 8 · 15-3 | — |

Never invent a key. If a screen needs a line the plan does not have, either render a key that
exists or add the key to this table and to the `plan-card` that writes it, in that order.

**[v4] Choices and ranges.** A field may be `kind: choice` with `options: [...]` (the learner picks one), and a `number` may carry `min` and `max`; an answer outside them is refused with a one-line reason. The history of every key (above) is what the plan screen shows under "changes".
