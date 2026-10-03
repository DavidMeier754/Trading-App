#!/usr/bin/env python3
"""Validate lesson files and drill packs against docs/schema.md. Usage:
  python3 tools/validate_content.py            # errors + warnings, exit 1 on errors
  python3 tools/validate_content.py --status   # chapter and drill-pack statistics
  python3 tools/validate_content.py --strict   # chapter-level warnings become errors
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"

CATEGORIES = {"new-theory", "repetition", "test", "final-exam"}
# docs/schema.md "Bonus side lessons" [DESIGN-REVIEW]: level-NN-bonus.yaml, beside the path.
BONUS_FILE = re.compile(r"level-(\d+)-bonus\.yaml$")
# The screens a skill's card may be (docs/schema.md `skills`).
SKILL_CARD_TYPES = {"theory", "example", "carousel", "walkthrough", "visual"}
TERM_CARD_TYPES = {"theory", "example", "carousel"}
DECISION_CELLS = {"right-won", "right-lost", "wrong-won", "wrong-lost"}
# A clock time written as digits (agent.md §3.6): "9:31", "15:30".
CLOCK_TIME = re.compile(r"\b\d{1,2}[:.]\d{2}\b")
PATHS = {"all", "scalping", "day-trading", "swing-trading"}
NON_QUESTION = {
    "intro", "theory", "example", "carousel", "walkthrough", "visual",
    "checklist-reveal", "story", "summary", "badge", "path-choice",
    # v3 archetypes
    "recap", "plan-card", "tier-up",
}
# v3 question types (schema.md "New question screens")
NEW_QUESTION = {
    "swipe-deck", "chart-annotate", "order-build", "scanner-pick",
    "compare", "branch", "journal-row", "depth-ladder",
}
QUESTION = {
    "mc", "tf", "numeric-mc", "numeric-input", "fill-tiles", "fill-choice",
    "match", "sort", "order", "hotspot", "slider", "chart-tap",
    "chart-decision", "spot-mistake",
} | NEW_QUESTION
INTERACTIVE = {
    "hotspot", "chart-tap", "chart-decision", "walkthrough", "visual",
    "spot-mistake", "slider", "order", "sort",
} | NEW_QUESTION | {"plan-card"}
# branch carries its explanation per step, not on the screen
NO_SCREEN_EXPLANATION = {"branch"}
# Built but not yet in the schema's content types (docs/UI.md §4.4): only the bench shows them.
BENCH_ONLY = {"chart-replay"}
SECONDS = {
    "intro": 8, "theory": 10, "example": 10, "carousel": 10, "walkthrough": 10,
    "visual": 12, "checklist-reveal": 8, "story": 10, "summary": 10, "badge": 10,
    "path-choice": 15, "match": 18, "sort": 18, "order": 18, "chart-decision": 20,
    # v3
    "recap": 10, "plan-card": 20, "tier-up": 10,
    "chart-annotate": 15, "order-build": 15, "scanner-pick": 15,
    "compare": 15, "journal-row": 15, "depth-ladder": 15,
}
# agent.md §3.2: the longest run of consecutive `repetition` sub-levels docs/curriculum.md
# demands of any path — Chapter 7's Capstone (3 subs) straight into the Chapter Review (2).
MAX_REPETITION_RUN = 5
REQUIRED = [
    "id", "title", "chapter", "chapter_title", "path", "category", "tags",
    "learning_goal", "purpose", "terms_introduced", "xp", "difficulty",
    "sources", "screens",
]


# docs/schema.md `icon`: the names src/home/icons.tsx can draw, read from its
# ICON_NAMES list so the two cannot drift apart.
ICON_NAMES = set(re.findall(r"^  '([a-z-]+)',$", (ROOT / "src/home/icons.tsx").read_text().split("] as const")[0].split("ICON_NAMES = [")[1], re.M))

# numbers, money and percentages collapse to "#" so two sentences that differ only
# in their figures count as one shape
TEMPLATE_RE = re.compile(r"[\d.,$%€]+")


def screen_units(s):
    if s["type"] == "carousel":
        return len(s.get("cards", []))
    if s["type"] == "walkthrough":
        return len(s.get("steps", []))
    if s["type"] == "checklist-reveal":
        return max(1, len(s.get("items", [])) // 2)
    if s["type"] == "swipe-deck":
        return max(1, len(s.get("cards", []) or []))
    if s["type"] == "branch":
        return max(1, len(s.get("steps", []) or []))
    return 1


def screen_seconds(s):
    t = s["type"]
    if t in ("carousel", "walkthrough"):
        return 10 * screen_units(s)
    if t == "checklist-reveal":
        return 8 * len(s.get("items", []))
    if t == "swipe-deck":
        return 8 * screen_units(s)
    if t == "branch":
        return 18 * screen_units(s)
    if t in SECONDS:
        return SECONDS[t]
    return 15


def question_text(s):
    parts = []
    for k in ("prompt", "statement", "sentence", "scenario", "explanation", "working", "outcome"):
        if s.get(k):
            parts.append(str(s[k]))
    for o in s.get("options", []) or []:
        parts.append(o["text"] if isinstance(o, dict) else str(o))
    for p in s.get("pairs", []) or []:
        parts.extend(str(x) for x in p)
    for it in s.get("items", []) or []:
        parts.append(it["text"] if isinstance(it, dict) else str(it))
    for seg in s.get("segments", []) or []:
        parts.append(seg.get("text", ""))
    # v3 types carry their text in their own structures
    for c in s.get("cards", []) or []:
        if isinstance(c, dict) and c.get("note"):
            parts.append(str(c["note"]))
    for st in s.get("steps", []) or []:
        if not isinstance(st, dict):
            continue
        for k in ("prompt", "explanation"):
            if st.get(k):
                parts.append(str(st[k]))
        for o in st.get("options", []) or []:
            parts.append(o["text"] if isinstance(o, dict) else str(o))
    for ch in s.get("charts", []) or []:
        if isinstance(ch, dict) and ch.get("label"):
            parts.append(str(ch["label"]))
    if s.get("label"):
        parts.append(str(s["label"]))
    for row in ((s.get("data") or {}).get("rows") if isinstance(s.get("data"), dict) else None) or []:
        if isinstance(row, dict) and row.get("catalyst"):
            parts.append(str(row["catalyst"]))
    return " ".join(parts)


def level_key(lvl_id):
    a, b = lvl_id.split("-")
    return (int(a), int(b))


class Report:
    def __init__(self, strict=False):
        self.errors = []
        self.warnings = []
        self.strict = strict
        self.chapter_warnings = 0

    def err(self, f, msg):
        self.errors.append(f"{f}: {msg}")

    def warn(self, f, msg):
        self.warnings.append(f"{f}: {msg}")

    def cwarn(self, f, msg):
        """Chapter-level warning (schema.md). Becomes an error under --strict."""
        self.chapter_warnings += 1
        (self.errors if self.strict else self.warnings).append(f"{f}: {msg}")


def validate_new_question(f, i, s, rep):
    """Shape checks for the v3 question types (schema.md "New question screens")."""
    t = s["type"]
    where = f"screen {i} ({t})"

    if t == "swipe-deck":
        cards = s.get("cards") or []
        if not 4 <= len(cards) <= 8:
            rep.err(f, f"{where}: needs 4–8 cards (has {len(cards)})")
        for n, c in enumerate(cards, 1):
            if not isinstance(c, dict) or c.get("answer") not in ("take", "pass"):
                rep.err(f, f"{where}: card {n} answer must be take or pass")

    elif t == "chart-annotate":
        if not isinstance(s.get("answer"), (int, float)) or isinstance(s.get("answer"), bool):
            rep.err(f, f"{where}: answer must be a price")
        if not isinstance(s.get("tolerance"), (int, float)) or isinstance(s.get("tolerance"), bool):
            rep.err(f, f"{where}: tolerance must be a number")

    elif t in ("order-build", "journal-row"):
        slots = s.get("slots") or []
        answer = s.get("answer")
        if not isinstance(answer, dict):
            rep.err(f, f"{where}: answer must be a mapping of slot → value")
            return
        if set(answer) != set(slots):
            missing = sorted(set(slots) - set(answer))
            extra = sorted(set(answer) - set(slots))
            rep.err(f, f"{where}: answer keys do not match slots"
                       + (f" (missing {missing})" if missing else "")
                       + (f" (unknown {extra})" if extra else ""))
        chips = s.get("chips") or {}
        for slot, val in answer.items():
            offered = chips.get(slot)
            if offered is not None and val not in offered:
                rep.err(f, f"{where}: answer {slot}={val!r} is not among its chips")

    elif t == "scanner-pick":
        rows = (s.get("data") or {}).get("rows") or []
        tickers = {r.get("ticker") for r in rows if isinstance(r, dict)}
        targets = s.get("targets") or ([s["target"]] if s.get("target") is not None else [])
        if not targets:
            rep.err(f, f"{where}: needs target or targets")
        for tg in targets:
            if tg not in tickers:
                rep.err(f, f"{where}: target '{tg}' is not a ticker in rows")

    elif t == "compare":
        charts = s.get("charts") or []
        labels = {c.get("label") for c in charts if isinstance(c, dict)}
        if len(charts) < 2:
            rep.err(f, f"{where}: needs at least 2 charts")
        if len(labels) != len(charts):
            rep.err(f, f"{where}: every chart needs a unique label")
        ans = s.get("answer")
        if ans == "neither":
            if not s.get("allow_neither"):
                rep.err(f, f"{where}: answer 'neither' needs allow_neither: true")
        elif ans not in labels:
            rep.err(f, f"{where}: answer '{ans}' is not a chart label")

    elif t == "branch":
        steps = s.get("steps") or []
        if not 2 <= len(steps) <= 4:
            rep.err(f, f"{where}: needs 2–4 steps (has {len(steps)})")
        for n, st in enumerate(steps, 1):
            if not isinstance(st, dict):
                rep.err(f, f"{where}: step {n} must be a mapping")
                continue
            opts = st.get("options") or []
            ncorrect = sum(1 for o in opts if isinstance(o, dict) and o.get("correct"))
            if ncorrect != 1:
                rep.err(f, f"{where}: step {n} needs exactly one correct option (has {ncorrect})")
            if not st.get("explanation"):
                rep.err(f, f"{where}: step {n} missing explanation")

    elif t == "depth-ladder":
        book = s.get("data") or {}
        tg = str(s.get("target") or "")
        m = re.fullmatch(r"(bid|ask)-([1-9]\d*)", tg)
        if not m:
            rep.err(f, f"{where}: target '{tg}' must look like bid-1 or ask-2")
            return
        side, n = m.group(1), int(m.group(2))
        levels = book.get(side + "s") or []
        if not 1 <= n <= len(levels):
            rep.err(f, f"{where}: target '{tg}' is not in the book ({side}s has {len(levels)} levels)")



# ---------------------------------------------------------------------------
# Component data (schema.md, "Components, data and hotspot targets"). The table
# there is the contract between the content and src/components; a field the
# renderer does not read, or a value of the wrong shape, is an error here
# rather than a crash or a missing line on a phone (review S39, M2, M3).
# ---------------------------------------------------------------------------

# component -> (required fields, optional fields). The chart components and
# cost-stack have their own checks below as well.
COMPONENT_FIELDS = {
    "quote-card": ({"ticker", "price"}, {"name", "change", "change_pct", "volume", "prev_close"}),
    "quote-panel": ({"bid", "ask"}, {"last", "animate_to"}),
    "order-ticket": ({"ticker", "side", "qty"}, {"type", "price", "stop_price"}),
    "order-book": ({"bids", "asks"}, set()),
    "chart-line": (set(), {"data", "series", "markers", "levels", "decision_index", "session_open"}),
    "chart-candles": ({"data"}, {"volume", "levels", "markers", "vwap", "decision_index", "session_open"}),
    "candle-anatomy": ({"candle"}, {"labels"}),
    "trade-plan": ({"entry", "stop", "target", "shares"}, {"chart"}),
    "bar-chart": ({"bars"}, {"unit"}),
    "session-ribbon": ({"premarket", "regular", "afterhours", "timezone"}, set()),
    "cost-stack": (set(), {"shares", "spread", "slippage", "fees", "target", "targets", "rows", "unit"}),
    "ownership-pie": ({"total", "owned"}, set()),
    "scanner-table": ({"rows"}, set()),
    "journal-table": ({"columns", "rows"}, set()),
    "internals-panel": ({"index", "breadth", "sectors"}, {"tone"}),
    "hotkey-pad": ({"keys"}, {"sequence"}),
    "stats-card": ({"rows"}, set()),
    "r-tracker": ({"trades", "limit"}, set()),
    "plan-sheet": ({"fields"}, {"slot"}),
    # [DESIGN-REVIEW]
    "decision-grid": (set(), {"cell"}),
}
# A chart inside a question screen: `chart:`, a swipe-deck card's chart, a compare chart.
CHART_SPEC_FIELDS = {"kind", "data", "decision_index", "volume", "levels", "vwap", "markers", "label",
                     "session_open"}


def is_num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def check_levels(f, where, levels, rep):
    """schema.md: `levels` is a list of {price, label} objects, never bare numbers."""
    if not isinstance(levels, list):
        rep.err(f, f"{where}: levels must be a list of {{price, label}}")
        return
    for n, lvl in enumerate(levels, 1):
        if not isinstance(lvl, dict) or not is_num(lvl.get("price")):
            rep.err(f, f"{where}: level {n} must be {{price, label}}, not {lvl!r}")
            continue
        extra = set(lvl) - {"price", "label"}
        if extra:
            rep.err(f, f"{where}: level {n} has unknown field(s) {sorted(extra)}")
        if "label" in lvl and not isinstance(lvl["label"], str):
            rep.err(f, f"{where}: level {n} label must be text")


def check_book(f, where, data, rep):
    """order-book and depth-ladder: `bids` and `asks` as [[price, size], …], best first."""
    for side in ("bids", "asks"):
        rows = data.get(side)
        if not isinstance(rows, list) or not rows:
            rep.err(f, f"{where}: {side} must be a non-empty list of [price, size]")
            continue
        for n, row in enumerate(rows, 1):
            if not (isinstance(row, list) and len(row) == 2 and all(is_num(x) for x in row)):
                rep.err(f, f"{where}: {side} row {n} must be [price, size], not {row!r}")
                break


def check_series(f, where, name, values, bars, rep):
    """`volume` and `vwap`: one number per bar."""
    if not isinstance(values, list) or not all(is_num(x) for x in values):
        rep.err(f, f"{where}: {name} must be a list of numbers")
    elif bars is not None and len(values) != bars:
        rep.err(f, f"{where}: {name} has {len(values)} values for {bars} bars")


def check_chart_data(f, where, kind, data, rep):
    """line: closes; candles: [open, high, low, close] per bar. Returns the bar count."""
    if not isinstance(data, list) or not data:
        rep.err(f, f"{where}: chart data must be a non-empty list")
        return None
    if kind == "line":
        if not all(is_num(x) for x in data):
            rep.err(f, f"{where}: line data must be numbers")
    else:
        for n, bar in enumerate(data):
            if not (isinstance(bar, list) and len(bar) == 4 and all(is_num(x) for x in bar)):
                rep.err(f, f"{where}: candle {n} must be [open, high, low, close]")
                break
    return len(data)


def check_chart_extras(f, where, spec, bars, rep):
    if "levels" in spec:
        check_levels(f, where, spec["levels"], rep)
    for name in ("volume", "vwap"):
        if name in spec:
            check_series(f, where, name, spec[name], bars, rep)
    if "session_open" in spec:
        so = spec["session_open"]
        if not isinstance(so, int) or isinstance(so, bool) or bars is None or not 1 <= so <= bars - 1:
            rep.err(f, f"{where}: session_open must be a bar index from 1 to {(bars or 1) - 1}, not {so!r}")


def check_spark(f, where, spark, rep):
    """A sparkline (an alert's, a scanner row's): 5–30 prices."""
    if not (isinstance(spark, list) and 5 <= len(spark) <= 30 and all(is_num(x) for x in spark)):
        rep.err(f, f"{where}: spark must be 5–30 numbers")


def check_short_strings(f, where, name, values, most, longest, rep):
    if not (isinstance(values, list) and 1 <= len(values) <= most
            and all(isinstance(v, str) and 1 <= len(v) <= longest for v in values)):
        rep.err(f, f"{where}: {name} must be 1–{most} texts of at most {longest} characters")


def check_chart_spec(f, where, spec, rep):
    """A question screen's chart: {kind, data, …} (schema.md chart-decision, swipe-deck …)."""
    if not isinstance(spec, dict):
        rep.err(f, f"{where}: chart must be a mapping")
        return
    extra = set(spec) - CHART_SPEC_FIELDS
    if extra:
        rep.err(f, f"{where}: chart has unknown field(s) {sorted(extra)}")
    kind = spec.get("kind", "candles")
    if kind not in ("line", "candles"):
        rep.err(f, f"{where}: chart.kind must be line or candles")
        return
    bars = check_chart_data(f, where, kind, spec.get("data"), rep)
    check_chart_extras(f, where, spec, bars, rep)


def check_cost_stack(f, where, data, rep):
    """Three shapes (schema.md): per share against one `target`, one cost against several
    `targets`, or cost totals as `rows`. Anything else draws NaN."""
    def labelled(name):
        rows = data.get(name)
        if not isinstance(rows, list) or not rows or not all(
                isinstance(r, dict) and isinstance(r.get("label"), str) and is_num(r.get("value"))
                for r in rows):
            rep.err(f, f"{where}: {name} must be a non-empty list of {{label, value}}")
    costs = [k for k in ("spread", "slippage", "fees") if k in data]
    for k in costs + [k for k in ("shares", "target") if k in data]:
        if not is_num(data[k]):
            rep.err(f, f"{where}: cost-stack {k} must be a number")
    if "rows" in data:
        labelled("rows")
        mixed = set(data) - {"rows", "unit"}
        if mixed:
            rep.err(f, f"{where}: cost-stack rows take only a unit, not {sorted(mixed)}")
    elif "targets" in data:
        labelled("targets")
        if not costs:
            rep.err(f, f"{where}: cost-stack targets need a spread, slippage or fees")
        mixed = set(data) & {"target", "unit"}
        if mixed:
            rep.err(f, f"{where}: cost-stack with targets cannot also have {sorted(mixed)}")
    else:
        for k in ("shares", "target"):
            if k not in data:
                rep.err(f, f"{where}: cost-stack needs {k} (or targets, or rows)")
        if not costs:
            rep.err(f, f"{where}: cost-stack needs a spread, slippage or fees")
        if "unit" in data:
            rep.err(f, f"{where}: cost-stack unit belongs with rows")


def check_component(f, where, component, data, rep):
    """One component's `data`/`visual_data` against the table in schema.md."""
    if component not in COMPONENT_FIELDS:
        rep.err(f, f"{where}: unknown component '{component}'")
        return
    if data is None and component == "decision-grid":
        return  # its one field is optional (schema.md [DESIGN-REVIEW])
    if not isinstance(data, dict):
        rep.err(f, f"{where}: {component} needs its data as a mapping")
        return
    required, optional = COMPONENT_FIELDS[component]
    missing = sorted(required - set(data))
    if missing:
        rep.err(f, f"{where}: {component} is missing {missing}")
    extra = sorted(set(data) - required - optional)
    if extra:
        rep.err(f, f"{where}: {component} has field(s) the renderer does not read: {extra}")
    if component == "order-book":
        check_book(f, where, data, rep)
    elif component == "chart-candles":
        bars = check_chart_data(f, where, "candles", data.get("data"), rep) if "data" in data else None
        check_chart_extras(f, where, data, bars, rep)
    elif component == "chart-line":
        if "series" in data:
            series = data["series"]
            if not isinstance(series, list) or not all(
                    isinstance(s, dict) and set(s) <= {"label", "data"} for s in series):
                rep.err(f, f"{where}: series must be a list of {{label, data}}")
            else:
                for s in series:
                    check_chart_data(f, where, "line", s.get("data"), rep)
        elif "data" in data:
            bars = check_chart_data(f, where, "line", data["data"], rep)
            check_chart_extras(f, where, data, bars, rep)
        else:
            rep.err(f, f"{where}: chart-line needs data or series")
    elif component == "cost-stack":
        check_cost_stack(f, where, data, rep)
    elif component == "bar-chart":
        bars = data.get("bars")
        if not isinstance(bars, list) or not bars or not all(
                isinstance(b, dict) and is_num(b.get("value")) for b in bars):
            rep.err(f, f"{where}: bars must be a non-empty list of {{label, value}}")
    elif component == "quote-panel":
        for k in ("bid", "ask", "last"):
            if k in data and not is_num(data[k]):
                rep.err(f, f"{where}: quote-panel {k} must be a number")
    elif component == "decision-grid":
        if "cell" in data and data["cell"] not in DECISION_CELLS:
            rep.err(f, f"{where}: decision-grid cell must be one of {sorted(DECISION_CELLS)}")
    elif component == "scanner-table":
        for n, row in enumerate(data.get("rows") or [], 1):
            if isinstance(row, dict) and "spark" in row:
                check_spark(f, f"{where} row {n}", row["spark"], rep)


def validate_screen_data(f, i, s, rep):
    """Every component and chart a screen carries, wherever it sits."""
    t = s.get("type")
    where = f"screen {i} ({t})"
    if "visual" in s:
        check_component(f, where, s["visual"], s.get("visual_data"), rep)
    elif "visual_data" in s:
        rep.err(f, f"{where}: visual_data without a visual")
    if "component" in s:
        check_component(f, where, s["component"], s.get("data"), rep)
    if t == "depth-ladder":
        book = s.get("data")
        if not isinstance(book, dict):
            rep.err(f, f"{where}: the book goes under data: {{bids, asks}}")
        else:
            check_book(f, where, book, rep)
        stray = sorted({"bids", "asks"} & set(s))
        if stray:
            rep.err(f, f"{where}: {stray} belong under data:, where the renderer reads them")
    if t == "scanner-pick":
        rows = (s.get("data") or {}).get("rows") if isinstance(s.get("data"), dict) else None
        if not isinstance(rows, list) or not rows:
            rep.err(f, f"{where}: scanner-pick needs data: {{rows: [...]}}")
        else:
            for n, row in enumerate(rows, 1):
                if isinstance(row, dict) and "spark" in row:
                    check_spark(f, f"{where} row {n}", row["spark"], rep)
    if t == "story" and "alert" in s:
        check_alert(f, where, s, rep)
    if "chart" in s:
        check_chart_spec(f, where, s["chart"], rep)
    for n, card in enumerate(s.get("cards") or [], 1):
        if isinstance(card, dict) and "chart" in card:
            check_chart_spec(f, f"{where} card {n}", card["chart"], rep)
    if t == "compare":
        for n, chart in enumerate(s.get("charts") or [], 1):
            check_chart_spec(f, f"{where} chart {n}", chart, rep)


def validate_question_screen(f, i, s, rep):
    """Shape checks for one question screen.

    Shared by lesson files and by drill packs (schema.md, "Drill packs"), which hold the
    same question screens with no lesson around them. Rules that depend on a screen's
    neighbours — no more than 2 mc in a row — stay with the caller.
    """
    t = s["type"]
    if not s.get("explanation") and t not in NO_SCREEN_EXPLANATION:
        rep.err(f, f"screen {i} ({t}): missing explanation")
    if t in ("mc", "numeric-mc"):
        opts = s.get("options") or []
        if not 2 <= len(opts) <= 4:
            rep.err(f, f"screen {i}: mc needs 2–4 options")
        texts = [o.get("text") if isinstance(o, dict) else o for o in opts]
        if len(set(texts)) != len(texts):
            rep.err(f, f"screen {i}: duplicate option text")
        ncorrect = sum(1 for o in opts if isinstance(o, dict) and o.get("correct"))
        if ncorrect != 1:
            rep.err(f, f"screen {i}: needs exactly one correct option (has {ncorrect})")
    if t == "tf" and not isinstance(s.get("answer"), bool):
        rep.err(f, f"screen {i}: tf.answer must be true/false")
    if t == "fill-tiles":
        a = str(s.get("answer", ""))
        if not re.fullmatch(r"[A-Za-z]+", a):
            rep.err(f, f"screen {i}: fill-tiles.answer must be one word of letters ('{a}')")
    if t == "fill-choice":
        if s.get("answer") not in (s.get("options") or []):
            rep.err(f, f"screen {i}: fill-choice.answer not in options")
    if t == "match":
        pairs = s.get("pairs") or []
        if not 2 <= len(pairs) <= 5:
            rep.err(f, f"screen {i}: match needs 2–5 pairs")
        left = [p[0] for p in pairs]
        right = [p[1] for p in pairs]
        if len(set(left)) != len(left) or len(set(right)) != len(right):
            rep.err(f, f"screen {i}: match terms/definitions must be unique")
    if t == "sort":
        buckets = set(s.get("buckets") or [])
        for it in s.get("items") or []:
            if it.get("bucket") not in buckets:
                rep.err(f, f"screen {i}: sort item '{it.get('text')}' has unknown bucket")
    if t == "order" and len(s.get("items") or []) < 3:
        rep.err(f, f"screen {i}: order needs ≥3 items")
    if t == "hotspot" and not (s.get("target") or s.get("targets")):
        rep.err(f, f"screen {i}: hotspot needs target(s)")
    if t == "chart-decision":
        buttons = s.get("buttons") or ["long", "short", "no-trade"]
        if s.get("best") not in buttons:
            rep.err(f, f"screen {i}: chart-decision.best '{s.get('best')}' not in buttons")
        if not s.get("outcome"):
            rep.err(f, f"screen {i}: chart-decision needs outcome")
        if s.get("best") in ("long", "short") and "no-trade" in buttons:
            if "no-trade" not in (s.get("reasonable") or []):
                rep.err(f, f"screen {i}: best is '{s['best']}' so reasonable must contain 'no-trade'")
        check_decision_plan(f, i, s, rep)
        if "notes" in s:
            check_notes(f, i, s, rep)
    if t in ("chart-decision", "chart-tap"):
        chart = s.get("chart") or {}
        bars = chart.get("data") or []
        kind = chart.get("kind")
        if kind not in ("line", "candles"):
            rep.err(f, f"screen {i}: chart.kind must be line or candles")
        if t == "chart-decision" and not 8 <= len(bars) <= 12:
            rep.warn(f, f"screen {i}: chart has {len(bars)} bars (expected 8–12)")
        if kind == "candles":
            for b_i, bar in enumerate(bars):
                if not (isinstance(bar, list) and len(bar) == 4 and all(isinstance(x, (int, float)) for x in bar)):
                    rep.err(f, f"screen {i}: candle {b_i} must be [open, high, low, close]")
                    break
                o, h, l, c = bar
                if h < max(o, c) or l > min(o, c):
                    rep.err(f, f"screen {i}: candle {b_i} high/low inconsistent with open/close")
        if kind == "line" and not all(isinstance(x, (int, float)) for x in bars):
            rep.err(f, f"screen {i}: line data must be numbers")
        if t == "chart-decision":
            di = chart.get("decision_index")
            if not isinstance(di, int) or not 3 <= di <= len(bars) - 3:
                rep.warn(f, f"screen {i}: decision_index {di} should leave bars before and after the decision")
        if t == "chart-tap":
            tg = s.get("target")
            if not isinstance(tg, int) or not 0 <= tg < len(bars):
                rep.err(f, f"screen {i}: chart-tap.target must be a bar index")
    if t == "numeric-input" and not isinstance(s.get("answer"), (int, float)):
        rep.err(f, f"screen {i}: numeric-input.answer must be a number")
    if t == "spot-mistake":
        segs = s.get("segments") or []
        if sum(1 for x in segs if x.get("wrong")) != 1:
            rep.err(f, f"screen {i}: spot-mistake needs exactly one wrong segment")
    if t in NEW_QUESTION:
        validate_new_question(f, i, s, rep)


def decision_entry(s):
    """The entry of a chart decision: the close of its decision bar."""
    chart = s.get("chart") or {}
    bars = chart.get("data") or []
    di = chart.get("decision_index")
    if not isinstance(di, int) or not 0 <= di < len(bars):
        return None
    bar = bars[di]
    return bar[3] if isinstance(bar, list) and len(bar) == 4 else bar if is_num(bar) else None


def check_decision_plan(f, i, s, rep):
    """docs/schema.md: a stop below the entry for a long and above it for a short, the target
    on the other side. The app draws them and runs the R ruler from them (DESIGN-REVIEW)."""
    stop, target = s.get("stop"), s.get("target")
    for name, v in (("stop", stop), ("target", target)):
        if v is not None and not is_num(v):
            rep.err(f, f"screen {i}: chart-decision {name} must be a price")
            return
    entry = decision_entry(s)
    best = s.get("best")
    if entry is None or best not in ("long", "short", "buy"):
        return
    up = best in ("long", "buy")
    if stop is not None and (stop >= entry if up else stop <= entry):
        rep.err(f, f"screen {i}: the stop {stop} is on the wrong side of the entry {entry} for a {best}")
    if target is not None and (target <= entry if up else target >= entry):
        rep.err(f, f"screen {i}: the target {target} is on the wrong side of the entry {entry} for a {best}")


def check_notes(f, i, s, rep):
    """docs/schema.md `notes` [DESIGN-REVIEW]: 1–4 short notes on bars of the chart."""
    notes = s["notes"]
    bars = len((s.get("chart") or {}).get("data") or [])
    if not isinstance(notes, list) or not 1 <= len(notes) <= 4:
        rep.err(f, f"screen {i}: notes must be a list of 1–4 notes")
        return
    for n, note in enumerate(notes, 1):
        if not isinstance(note, dict) or set(note) - {"bar", "text", "at"}:
            rep.err(f, f"screen {i}: note {n} must be {{bar, text, at}}")
            continue
        b = note.get("bar")
        if not isinstance(b, int) or isinstance(b, bool) or not 0 <= b < bars:
            rep.err(f, f"screen {i}: note {n} bar must be a bar of the chart (0–{bars - 1})")
        text = note.get("text")
        if not isinstance(text, str) or not 1 <= len(text) <= 24:
            rep.err(f, f"screen {i}: note {n} text must be 1–24 characters")
        if note.get("at", "high") not in ("high", "low"):
            rep.err(f, f"screen {i}: note {n} at must be high or low")


def check_alert(f, where, s, rep):
    """docs/schema.md `alert` on a story [DESIGN-REVIEW]."""
    alert = s["alert"]
    if s.get("label") == "takeaway":
        rep.err(f, f"{where}: a takeaway has no alert")
    if not isinstance(alert, dict) or set(alert) - {"ticker", "time", "facts", "spark"}:
        rep.err(f, f"{where}: alert takes ticker, time, facts and spark")
        return
    if not re.fullmatch(r"[A-Z]{1,5}", str(alert.get("ticker", ""))):
        rep.err(f, f"{where}: alert ticker must be 1–5 capital letters")
    if "time" in alert:
        t = alert["time"]
        if not isinstance(t, str) or not 1 <= len(t) <= 24:
            rep.err(f, f"{where}: alert time must be at most 24 characters")
        elif CLOCK_TIME.search(t):
            rep.err(f, f"{where}: alert time '{t}' writes a clock time; use a token or a relative phrase")
    if "facts" in alert:
        check_short_strings(f, where, "alert facts", alert["facts"], 3, 16, rep)
    if "spark" in alert:
        check_spark(f, f"{where} alert", alert["spark"], rep)


def check_header_extras(f, data, rep):
    """docs/schema.md [DESIGN-REVIEW]: `skills` in the header, `facts` on a test's intro."""
    screens = data.get("screens") or []
    if "skills" in data and data["skills"] is not None:
        skills = data["skills"]
        if data.get("category") != "new-theory":
            rep.err(f, "skills belong only in new-theory lessons")
        if not isinstance(skills, list) or len(skills) > 3:
            rep.err(f, "skills must be a list of at most 3")
        else:
            for n, sk in enumerate(skills, 1):
                if not isinstance(sk, dict) or set(sk) != {"name", "card"}:
                    rep.err(f, f"skill {n} must be {{name, card}}")
                    continue
                if not isinstance(sk["name"], str) or not 1 <= len(sk["name"]) <= 40:
                    rep.err(f, f"skill {n} name must be 1–40 characters")
                c = sk["card"]
                if (not isinstance(c, int) or isinstance(c, bool) or not 1 <= c <= len(screens)
                        or screens[c - 1].get("type") not in SKILL_CARD_TYPES):
                    rep.err(f, f"skill {n} card must name a theory, example, carousel, walkthrough or visual screen")
    intro = screens[0] if screens else {}
    if isinstance(intro, dict) and "facts" in intro:
        if data.get("category") not in ("test", "final-exam"):
            rep.err(f, "intro facts belong only in tests and final exams")
        check_short_strings(f, "screen 1 (intro)", "facts", intro["facts"], 3, 20, rep)
    # A term no card of its lesson names: its skill would have nothing to open (warning).
    texts = [card_words(sc) for sc in screens if isinstance(sc, dict) and sc.get("type") in TERM_CARD_TYPES]
    for term in data.get("terms_introduced") or []:
        if not any(term_in(term, t) for t in texts):
            rep.warn(f, f"term '{term}' is on no theory, example or carousel card of this lesson "
                        f"(its skill has no card to open; docs/ContentToDo.md 1.4)")


def card_words(sc):
    t = sc.get("type")
    if t == "theory":
        return f"{sc.get('title', '')} {sc.get('body', '')}"
    if t == "example":
        return str(sc.get("body", ""))
    if t == "carousel":
        return " ".join(f"{c.get('label', '')} {c.get('text', '')}" for c in sc.get("cards") or []
                        if isinstance(c, dict))
    return ""


def term_in(term, text):
    """As src/skills.ts finds a term: whole word, any case (own case up to two letters), plural."""
    word = term.strip()
    flags = 0 if len(word) <= 2 else re.I
    return re.search(rf"(^|[^A-Za-z0-9]){re.escape(word)}(e?s)?(?=$|[^A-Za-z0-9])", text, flags) is not None


def validate_bonus_file(path, data, rep):
    """docs/schema.md "Bonus side lessons" [DESIGN-REVIEW]: one file per side stop, beside the
    level it follows. Its placement against the chapter's levels is checked by validate_bonus."""
    f = path.relative_to(ROOT)
    m = BONUS_FILE.match(path.name)
    for k in ("id", "title", "chapter", "chapter_title", "path", "category", "after", "screens"):
        if k not in data:
            rep.err(f, f"missing field '{k}'")
    if any(str(f) in e for e in rep.errors):
        return None
    if data["id"] != f"{int(m.group(1))}-bonus":
        rep.err(f, f"id '{data['id']}' does not match filename")
    if data["category"] != "bonus":
        rep.err(f, "a bonus file has category: bonus")
    if data["after"] != int(m.group(1)):
        rep.err(f, f"after {data['after']!r} must be the level in the filename ({int(m.group(1))})")
    if data.get("prerequisite") is not None:
        rep.err(f, "a bonus lesson has prerequisite: null — it opens with its level")
    gems = data.get("gems", 0)
    if not isinstance(gems, int) or isinstance(gems, bool) or gems < 0:
        rep.err(f, "gems must be a whole number, 0 or more")
    screens = data["screens"] or []
    if not screens or screens[0].get("type") != "intro":
        rep.err(f, "first screen must be intro")
    replays = screens[1:]
    if not 2 <= len(replays) <= 3 or any(s.get("type") != "chart-replay" for s in replays):
        rep.err(f, "a bonus lesson is an intro and 2–3 chart-replay screens")
    for i, s in enumerate(screens[1:], 2):
        if s.get("type") != "chart-replay":
            continue
        chart = s.get("chart") or {}
        bars = check_chart_data(f, f"screen {i} (chart-replay)", "candles", chart.get("data"), rep)
        moments = s.get("moments")
        if not isinstance(moments, list) or not moments:
            rep.err(f, f"screen {i}: chart-replay needs moments")
            continue
        for n, mo in enumerate(moments, 1):
            b = mo.get("bar") if isinstance(mo, dict) else None
            if not isinstance(b, int) or bars is None or not 0 <= b < bars:
                rep.err(f, f"screen {i}: moment {n} bar must be a bar of the chart")
            if not isinstance(mo, dict) or mo.get("kind") not in ("setup", "decoy"):
                rep.err(f, f"screen {i}: moment {n} kind must be setup or decoy")
    data["_file"] = f
    return data


def validate_bonus(bonus, chapters, rep):
    """A bonus stop sits after a level of its chapter that is neither a test nor right before one."""
    for folder, files in bonus.items():
        levels = {}
        for d in chapters.get(folder, []):
            levels.setdefault(level_key(d["id"])[0], d["category"])
        for d in files:
            after = d.get("after")
            if after not in levels:
                rep.err(d["_file"], f"after {after}: the chapter has no Level {after}")
            elif levels[after] in ("test", "final-exam"):
                rep.err(d["_file"], f"after {after}: a bonus never follows a test")
            elif levels.get(after + 1) in ("test", "final-exam"):
                rep.err(d["_file"], f"after {after}: the level before a test is the mistakes review's place")


def validate_file(path, data, rep):
    f = path.relative_to(ROOT)
    for k in REQUIRED:
        if k not in data:
            rep.err(f, f"missing field '{k}'")
    if rep.errors and any(str(f) in e for e in rep.errors):
        return None
    m = re.match(r"level-(\d+)-(\d+)\.yaml$", path.name)
    if not m or f"{int(m.group(1))}-{int(m.group(2))}" != data["id"]:
        rep.err(f, f"id '{data['id']}' does not match filename")
    if data["category"] not in CATEGORIES:
        rep.err(f, f"bad category '{data['category']}'")
    if "icon" in data and data["icon"] not in ICON_NAMES:
        rep.err(f, f"icon '{data['icon']}' is not one src/home/icons.tsx draws")
    if data["path"] not in PATHS:
        rep.err(f, f"bad path '{data['path']}'")
    if "reinforces" in data and data["reinforces"] is not None:
        rf = data["reinforces"]
        if not isinstance(rf, list) or not all(isinstance(x, int) and not isinstance(x, bool) for x in rf):
            rep.err(f, f"reinforces must be a list of chapter numbers (got {rf!r})")
        else:
            if len(set(rf)) != len(rf):
                rep.err(f, f"reinforces has duplicates: {rf}")
            for c in rf:
                if c >= data["chapter"]:
                    rep.err(f, f"reinforces {c} is not lower than this chapter ({data['chapter']})")
    pp = data.get("path_position")
    if pp is not None and pp not in ("main", "merge") and not re.fullmatch(r"fan-out:[a-z0-9-]+", str(pp)):
        rep.err(f, f"bad path_position '{pp}' (main | fan-out:<strand> | merge)")
    screens = data["screens"]
    if not screens:
        rep.err(f, "no screens")
        return data
    is_exam = data["category"] in ("test", "final-exam")
    units = 0
    seconds = 0
    qtypes = []
    mc_run = 0
    for i, s in enumerate(screens, 1):
        t = s.get("type")
        if t not in NON_QUESTION | QUESTION:
            rep.err(f, f"screen {i}: unknown type '{t}'")
            continue
        units += screen_units(s)
        seconds += screen_seconds(s)
        validate_screen_data(f, i, s, rep)
        if t in QUESTION:
            qtypes.append(t)
            validate_question_screen(f, i, s, rep)
        if t in ("mc", "numeric-mc"):
            mc_run += 1
            if mc_run > 2:
                rep.err(f, f"screen {i}: more than 2 multiple-choice screens in a row")
        else:
            mc_run = 0
    if screens[0].get("type") != "intro":
        rep.err(f, "first screen must be intro")
    nq = len(qtypes)
    if is_exam:
        if screens[-1].get("type") not in ("summary", "badge", "path-choice"):
            rep.err(f, "test/exam must end with summary (and badge for final exams)")
        counter = screens[0].get("counter")
        totals = [s.get("total") for s in screens if s.get("type") == "summary"]
        if counter != nq:
            rep.err(f, f"intro.counter={counter} but {nq} question screens")
        if not totals or totals[0] != nq:
            rep.err(f, f"summary.total={totals} but {nq} question screens")
        if data["category"] == "final-exam" and not any(s.get("type") == "badge" for s in screens):
            rep.err(f, "final exam needs a badge screen")
        lo, hi = (12, 18) if data["category"] == "final-exam" else (10, 16)
        if not lo <= units <= hi:
            rep.err(f, f"{units} screens ({data['category']} needs {lo}–{hi})")
    else:
        if not 12 <= units <= 18:
            rep.err(f, f"{units} screens (lessons need 12–18)")
        if len(set(qtypes)) < 3:
            rep.err(f, f"only {len(set(qtypes))} distinct question types (need ≥3)")
    if not 160 <= seconds <= 260:
        rep.warn(f, f"estimated {seconds}s (target 160–260s)")
    if data["chapter"] >= 2 and not any(s.get("type") in INTERACTIVE for s in screens):
        rep.warn(f, "no visual/interactive screen in a Chapter ≥2 level")
    check_header_extras(f, data, rep)
    data["_units"] = units
    data["_seconds"] = seconds
    data["_nq"] = nq
    return data


def folder_info(folder):
    parts = folder.relative_to(CONTENT).parts
    m = re.match(r"chapter-(\d+)", folder.name)
    num = int(m.group(1)) if m else None
    path = "shared" if parts[0] == "shared" else parts[1]
    return path, num


def validate_chapter(folder, files, rep, known_terms):
    ids = {d["id"]: d for d in files}
    ordered = sorted(files, key=lambda d: level_key(d["id"]))
    _, folder_num = folder_info(folder)
    # One level, one symbol on the map: its lessons may not name different icons.
    icons = defaultdict(set)
    for d in files:
        if "icon" in d:
            icons[level_key(d["id"])[0]].add(d["icon"])
    for lvl, names in icons.items():
        if len(names) > 1:
            rep.err(folder, f"level {lvl} names more than one icon: {sorted(names)}")
    for i, d in enumerate(ordered):
        p = d.get("prerequisite")
        if p is not None and p not in ids:
            rep.err(d["_file"], f"prerequisite '{p}' not found in chapter")
        if folder_num is not None and d.get("chapter") != folder_num:
            rep.warn(d["_file"], f"chapter field {d.get('chapter')} differs from folder chapter {folder_num}")
        # the chain must not skip sub-levels: a level unlocked from the middle of the
        # previous level lets the learner past subs they never saw.
        expected = ordered[i - 1]["id"] if i else None
        if p == expected or p not in ids:
            continue
        strand_start = (str(d.get("path_position") or "").startswith("fan-out:")
                        and level_key(d["id"])[1] == 1
                        and level_key(p) < level_key(d["id"]))
        if not strand_start:
            rep.warn(d["_file"], f"prerequisite '{p}' skips sub-level(s); "
                                 f"the sub before this one is '{expected}'")
    # use-before-definition
    introduced_at = {}
    for d in ordered:
        for term in d.get("terms_introduced") or []:
            if term.lower() in known_terms:
                rep.warn(d["_file"], f"re-introduces '{term}', already known from a lower chapter")
                continue
            introduced_at.setdefault(term.lower(), level_key(d["id"]))
    for d in ordered:
        k = level_key(d["id"])
        text = " ".join(question_text(s) for s in d["screens"] if s.get("type") in QUESTION).lower()
        for term, at in introduced_at.items():
            if at > k and re.search(r"\b" + re.escape(term) + r"\b", text):
                rep.warn(d["_file"], f"uses '{term}' before it is introduced in {ordered[[level_key(x['id']) for x in ordered].index(at)]['id']}")
    # duplicate prompts
    seen = {}
    for d in ordered:
        for s in d["screens"]:
            p = s.get("prompt") or s.get("statement")
            if not p:
                continue
            content = s.get("pairs") or s.get("items") or s.get("options") or s.get("segments") or s.get("data") or ""
            key = (p.strip() + str(content)).lower()
            if key in seen and seen[key] != d["id"]:
                rep.warn(d["_file"], f"prompt also used in {seen[key]}: '{p[:60]}…'")
            seen.setdefault(key, d["id"])
    # consecutive repetition subs (agent.md §3.2). A test or final exam is a distinct,
    # scored event, so it is not "more of the same": it neither lengthens a run nor
    # clears one. Only new material resets the counter, which is what keeps a Checkpoint
    # from being parked between two long review blocks to hide them from this rule.
    run = 0
    for d in ordered:
        cat = d["category"]
        if cat == "new-theory":
            run = 0
            continue
        if cat != "repetition":
            continue
        run += 1
        if run > MAX_REPETITION_RUN:
            rep.warn(d["_file"], f"{run} repetition sub-levels in a row with no new material "
                                 f"in between (agent.md §3.2 allows {MAX_REPETITION_RUN})")


ACCOUNT_RE = [
    re.compile(r"\$([\d,]+)\s+account", re.I),
    re.compile(r"account[^.$]{0,30}\$([\d,]+)", re.I),
]
PER_SHARE_RE = re.compile(r"\$0\.\d\d")
VOLUME_MIN, VOLUME_MAX = 4_000, 500_000
# agent.md §3.6: one position at a time, and it may use at most this share of the account
# named in the same file. The rest is the buffer a real fill needs — the learner pays the
# ask, not the last price the drill quotes, and the fee comes out of the same cash.
MAX_ACCOUNT_PCT = 0.95
# agent.md §3.5: inside a chapter's directional chart-decisions, neither side may outnumber
# the other by more than this. Judged from MIN_DIRECTIONAL decisions up; under that the ratio
# is noise rather than a tell.
MAX_DIRECTION_RATIO = 2.0
MIN_DIRECTIONAL = 8


# `state` counts: once session state moves from the scenario into chips
# (UI.md 6.4), the account a drill is sized against is named there.
TEXT_KEYS = ("text", "body", "prompt", "statement", "scenario", "outcome",
             "explanation", "working", "state")


def screen_text(s):
    return " ".join(str(s.get(k)) for k in TEXT_KEYS if s.get(k))


def file_text(d):
    return " ".join(screen_text(s) for s in d["screens"])


def accounts_in(text):
    """Every account size named in a piece of text."""
    found = []
    for rx in ACCOUNT_RE:
        for m in rx.finditer(text):
            try:
                found.append(int(m.group(1).replace(",", "")))
            except ValueError:
                pass
    return found


def stated_account(d):
    """Largest account size named anywhere in the file, or None."""
    found = accounts_in(file_text(d))
    return max(found) if found else None


def decision_price(s):
    chart = s.get("chart") or {}
    bars = chart.get("data") or []
    di = chart.get("decision_index")
    if not isinstance(di, int) or not 0 <= di < len(bars):
        return None
    bar = bars[di]
    if isinstance(bar, list) and len(bar) == 4:
        return bar[3]
    return bar if isinstance(bar, (int, float)) else None


def answer_key_hygiene(where, screens, rep, digit_tell=False):
    """agent.md §3.5 over a set of screens: a chapter's, or a drill pack's.

    Position rotation, the length tell and the true/false split are properties of the
    bank a learner meets, so they are computed over the whole of it. `digit_tell` adds
    §3.5's punctuation tell, which only drill packs are checked for so far.
    """
    positions = defaultdict(int)
    longest_correct = 0
    digit_only_correct = 0
    mc_total = 0
    tf_true = tf_total = 0
    for s in screens:
        ty = s.get("type")
        if ty in ("mc", "numeric-mc"):
            opts = s.get("options") or []
            texts = [o.get("text") if isinstance(o, dict) else str(o) for o in opts]
            idx = next((n for n, o in enumerate(opts) if isinstance(o, dict) and o.get("correct")), None)
            if idx is None:
                continue
            mc_total += 1
            positions[idx] += 1
            lens = [len(str(x)) for x in texts]
            if lens and lens[idx] == max(lens) and lens.count(max(lens)) == 1:
                longest_correct += 1
            marked = [n for n, x in enumerate(texts) if re.search(r"\d|—", str(x))]
            if marked == [idx] and len(texts) > 1:
                digit_only_correct += 1
        elif ty == "tf" and isinstance(s.get("answer"), bool):
            tf_total += 1
            tf_true += 1 if s["answer"] else 0
    if mc_total:
        for pos, n in sorted(positions.items()):
            if n / mc_total > 0.50:
                rep.cwarn(where, f"correct option is at position {pos + 1} in {n}/{mc_total} "
                                 f"mc screens ({n / mc_total:.0%}, want ≤50%)")
        if longest_correct / mc_total > 0.45:
            rep.cwarn(where, f"correct option is the longest in {longest_correct}/{mc_total} "
                             f"mc screens ({longest_correct / mc_total:.0%}, want ≤45%)")
        if digit_tell and digit_only_correct / mc_total > 0.25:
            rep.cwarn(where, f"correct option is the only one carrying a number or an em-dash in "
                             f"{digit_only_correct}/{mc_total} mc screens "
                             f"({digit_only_correct / mc_total:.0%}, want ≤25%)")
    if tf_total and not 0.40 <= tf_true / tf_total <= 0.60:
        rep.cwarn(where, f"{tf_true}/{tf_total} tf answers are true ({tf_true / tf_total:.0%}, want 40–60%)")


def direction_balance(where, screens, rep):
    """agent.md §3.5: neither side of a directional chart-decision may dominate.

    The same answer-key tell as a run of first-position answers, in the one place the
    learner can act on it: if the charts lean one way, "always long" scores without a
    chart being read. `no-trade` is deliberately not counted — how often standing aside
    is right is a curriculum decision, and the reasonable-answer rule is what keeps it
    from being punished.
    """
    sides = defaultdict(int)
    for s in screens:
        if s.get("type") == "chart-decision" and s.get("best") in ("long", "short"):
            sides[s["best"]] += 1
    directional = sides["long"] + sides["short"]
    if directional >= MIN_DIRECTIONAL:
        hi, lo = max(sides["long"], sides["short"]), min(sides["long"], sides["short"])
        if lo == 0 or hi / lo > MAX_DIRECTION_RATIO:
            how = "one side only" if lo == 0 else f"{hi / lo:.1f}:1"
            rep.cwarn(where, f"chart-decisions resolve {sides['long']} long to {sides['short']} short "
                             f"({how}, want no worse than {MAX_DIRECTION_RATIO:.0f}:1 either way)")


def validate_chapter_v3(folder, files, rep):
    """Chapter-level warnings from docs/schema.md. Errors under --strict."""
    where = folder.relative_to(ROOT)
    ordered = sorted(files, key=lambda d: level_key(d["id"]))
    chapter_num = ordered[0].get("chapter") if ordered else None
    is_path_chapter = bool(chapter_num and chapter_num >= 2)

    # --- structure -------------------------------------------------------
    by_level = defaultdict(list)
    for d in ordered:
        by_level[level_key(d["id"])[0]].append(d)
    nlevels = len(by_level)
    if nlevels < 15:
        rep.cwarn(where, f"{nlevels} levels (v3 wants at least 15)")
    big = sum(1 for subs in by_level.values() if len(subs) >= 3)
    four = sum(1 for subs in by_level.values() if len(subs) >= 4)
    if nlevels and big / nlevels < 0.60:
        rep.cwarn(where, f"only {big}/{nlevels} levels have ≥3 subs ({big / nlevels:.0%}, want ≥60%)")
    if four < 4:
        rep.cwarn(where, f"only {four} levels have 4 subs (want ≥4)")

    # --- question-type variety ------------------------------------------
    qcount = defaultdict(int)
    for d in ordered:
        for s in d["screens"]:
            if s.get("type") in QUESTION:
                qcount[s["type"]] += 1
    if len(qcount) < 10:
        rep.cwarn(where, f"only {len(qcount)} distinct question types (want ≥10): {', '.join(sorted(qcount))}")
    once = sorted(k for k, v in qcount.items() if v < 2)
    if once:
        rep.cwarn(where, f"question type(s) used only once: {', '.join(once)}")

    # --- reinforcement ---------------------------------------------------
    if chapter_num and chapter_num >= 3:
        if not any(re.search(r"callback", d.get("title", ""), re.I) for d in ordered):
            rep.cwarn(where, "no Callback level (agent.md §3.3 requires one from Chapter 3 on)")
    if is_path_chapter:   # Chapter 1 has no earlier chapter to reach back to
        total_q = sum(d["_nq"] for d in ordered)
        reinforced_q = sum(d["_nq"] for d in ordered if d.get("reinforces"))
        if total_q and reinforced_q / total_q < 0.15:
            rep.cwarn(where, f"only {reinforced_q}/{total_q} question screens ({reinforced_q / total_q:.0%}) "
                             "sit in subs declaring reinforces (want ≥15%)")
        for d in ordered:
            if d["category"] in ("test", "final-exam") and not d.get("reinforces"):
                want = "25%" if d["category"] == "final-exam" else "20%"
                rep.cwarn(d["_file"], f"{d['category']} declares no reinforces "
                                      f"(agent.md §3.3 wants ≥{want} of its questions reaching back)")

    # --- answer-key hygiene ---------------------------------------------
    answer_key_hygiene(where, [s for d in ordered for s in d["screens"]], rep)

    # --- rhythm ----------------------------------------------------------
    ending_theory = sum(1 for d in ordered if d["screens"][-1].get("type") == "theory")
    if ordered and ending_theory / len(ordered) > 0.70:
        rep.cwarn(where, f"{ending_theory}/{len(ordered)} sub-levels end on a theory screen "
                         f"({ending_theory / len(ordered):.0%}, want ≤70%)")
    run = 1
    for a, b in zip(ordered, ordered[1:]):
        run = run + 1 if a.get("difficulty") == b.get("difficulty") else 1
        if run > 5:
            rep.cwarn(b["_file"], f"{run} consecutive sub-levels at difficulty {b.get('difficulty')} (want ≤5)")
            break

    # --- chart drills ----------------------------------------------------
    outcome_values = []
    over_cap = []      # positions inside the account but above the concentration cap
    sized = 0
    for d in ordered:
        account = stated_account(d)
        for i, s in enumerate(d["screens"], 1):
            if s.get("type") == "chart-decision":
                vals = set(PER_SHARE_RE.findall(str(s.get("outcome") or "")))
                outcome_values.extend(vals)
            # A `branch` puts the learner in stock exactly as a `chart-decision` does, so the
            # same two ceilings apply to it (agent.md §3.6).
            if s.get("type") in ("chart-decision", "branch"):
                shares = s.get("shares")
                price = decision_price(s)
                if account and isinstance(shares, (int, float)) and isinstance(price, (int, float)):
                    value = shares * price
                    if value > account:
                        rep.cwarn(d["_file"], f"screen {i}: {shares:,} shares × ${price:.2f} = ${value:,.0f} "
                                              f"exceeds the ${account:,} account named in this file")
                    elif value > MAX_ACCOUNT_PCT * account:
                        over_cap.append((value / account, d["_file"], i, shares, price, value, account))
                    sized += 1
            if is_path_chapter:
                vol = sorted(v for v in ((s.get("chart") or {}).get("volume") or [])
                             if isinstance(v, (int, float)))
                if vol:
                    median = vol[len(vol) // 2]
                    if not VOLUME_MIN <= median <= VOLUME_MAX:
                        rep.cwarn(d["_file"], f"screen {i}: typical bar volume {median:,.0f} outside "
                                              f"{VOLUME_MIN:,}–{VOLUME_MAX:,} per bar")
    # agent.md §3.6 caps one position at MAX_ACCOUNT_PCT of the account named in the same
    # file. Reported once per chapter rather than once per screen — at 45 % of the corpus
    # this would otherwise bury every other finding. `tools/check_sizing.py --chapter N`
    # prints each one with every other line in the file that names the same share count.
    if over_cap:
        pct, worst_file, worst_i, shares, price, value, account = max(over_cap)
        rep.cwarn(where, f"{len(over_cap)}/{sized} positions are over the {MAX_ACCOUNT_PCT:.0%} cap on "
                         f"one position (agent.md §3.6); worst is {worst_file} screen {worst_i}, "
                         f"{shares:,} shares × ${price:.2f} = ${value:,.0f}, {pct:.1%} of the "
                         f"${account:,} account. Run tools/check_sizing.py for the list.")

    # --- long/short balance ---------------------------------------------
    direction_balance(where, [s for d in ordered for s in d["screens"]], rep)

    # --- scenario and outcome phrasing ----------------------------------
    # The charts are all different; the sentences around them must not settle into
    # one shape, or 90 decisions read like 90 copies of the same screen.
    decisions = [s for d in ordered for s in d["screens"] if s.get("type") == "chart-decision"]
    if len(decisions) >= 12:
        exact_out = defaultdict(int)
        shape_out = defaultdict(int)
        shape_close = defaultdict(int)
        for s in decisions:
            out = str(s.get("outcome") or "").strip()
            if out:
                exact_out[out] += 1
                shape_out[TEMPLATE_RE.sub("#", out.lower())] += 1
            scen = str(s.get("scenario") or "").strip()
            if scen:
                closer = re.split(r"(?<=[.?]) +", scen)[-1]
                shape_close[TEMPLATE_RE.sub("#", closer.lower())] += 1
        for out, n in sorted(exact_out.items(), key=lambda kv: -kv[1]):
            if n > 1:
                rep.cwarn(where, f"chart-decision outcome used verbatim {n}x: '{out[:60]}…'")
        if shape_out:
            variety = len(shape_out) / sum(shape_out.values())
            if variety < 0.60:
                rep.cwarn(where, f"only {len(shape_out)} outcome sentence shapes for "
                                 f"{sum(shape_out.values())} chart-decisions ({variety:.0%}, want ≥60%)")
        if shape_close:
            total = sum(shape_close.values())
            shape, n = max(shape_close.items(), key=lambda kv: kv[1])
            if n / total > 0.60:
                rep.cwarn(where, f"{n}/{total} chart-decision scenarios ({n / total:.0%}) end on the same "
                                 f"sentence shape: '{shape[:60]}…' — use state chips (UI.md §6.4) instead")

    # --- prompt reuse within a question type -----------------------------
    by_type = defaultdict(lambda: defaultdict(int))
    for d in ordered:
        for s in d["screens"]:
            p = s.get("prompt")
            if s.get("type") in QUESTION and isinstance(p, str) and p.strip():
                by_type[s["type"]][p.strip()] += 1
    for qtype, prompts in by_type.items():
        total = sum(prompts.values())
        prompt, n = max(prompts.items(), key=lambda kv: kv[1])
        if n >= 5 and n / total > 0.25:
            rep.cwarn(where, f"{qtype} uses the same prompt {n}/{total} times "
                             f"({n / total:.0%}, want ≤25%): '{prompt[:50]}…'")

    if outcome_values:
        n_outcomes = sum(1 for d in ordered for s in d["screens"] if s.get("type") == "chart-decision")
        common = defaultdict(int)
        for v in outcome_values:
            common[v] += 1
        for val, n in sorted(common.items(), key=lambda kv: -kv[1]):
            if n_outcomes and n / n_outcomes > 0.25:
                rep.cwarn(where, f"per-share outcome {val} appears in {n}/{n_outcomes} chart-decision "
                                 f"outcomes ({n / n_outcomes:.0%}, want ≤25%)")


def plan_card_keys(screen):
    """The plan keys a `plan-card` screen writes, resolved through its optional `slot`.

    A card with `slot: <id>` fills one playbook row, so its short field names resolve to
    `card.<slot>.<field>` (schema.md, "The plan"). Every named slot but `draft` also puts a
    row on the `cards` list the graduation sheet renders.
    """
    slot = screen.get("slot")
    keys = []
    for f in screen.get("fields") or []:
        if isinstance(f, dict) and f.get("key"):
            keys.append(f"card.{slot}.{f['key']}" if slot else str(f["key"]))
    if slot and str(slot) != "draft":
        keys.append("cards")
    return keys


def plan_sheet_fields(screen):
    """(key, is_learner_line) for every field a `plan-sheet` renders.

    A field carrying a literal `value` is a specimen line — a worked example, or the numbers the
    scenario around it already gave. A field without one is a learner line: the renderer fills it
    from the learner's own plan, so it may only name a key already written.
    """
    if (screen.get("component") or screen.get("visual")) != "plan-sheet":
        return []
    data = screen.get("data") or screen.get("visual_data") or {}
    if not isinstance(data, dict):
        return []
    slot = data.get("slot")
    out = []
    for f in data.get("fields") or []:
        if isinstance(f, dict) and f.get("key"):
            key = f"card.{slot}.{f['key']}" if slot else str(f["key"])
            out.append((key, "value" not in f))
    return out


def validate_plan(chapters, rep):
    """schema.md "The plan": a plan-sheet may only render keys a plan-card writes.

    The plan is one document the learner builds across all eight chapters, so this is computed
    over a whole path rather than a chapter. The shared chapter (`path: all`) is part of every
    path. A learner line must additionally be written *before* it is displayed — an earlier
    sub-level, or an earlier screen of the same sub-level — or the sheet shows a blank the learner
    was never asked to fill.
    """
    files = [d for cf in chapters.values() for d in cf]
    paths = sorted({d.get("path") for d in files} - {"all", None})
    for path in paths:
        mine = [d for d in files if d.get("path") in (path, "all")]
        mine.sort(key=lambda d: (d.get("chapter") or 0,) + level_key(d["id"]))
        written = {}           # key -> (position, file, screen number)
        sheets = []            # (position, file, screen number, key, is_learner_line)
        for f_i, d in enumerate(mine):
            for s_i, s in enumerate(d["screens"], 1):
                pos = (f_i, s_i)
                if s.get("type") == "plan-card":
                    for key in plan_card_keys(s):
                        written.setdefault(key, (pos, d["_file"], s_i))
                for key, learner in plan_sheet_fields(s):
                    sheets.append((pos, d["_file"], s_i, key, learner))
        for pos, f, s_i, key, learner in sheets:
            where = f"screen {s_i} (plan-sheet)"
            if key not in written:
                rep.err(f, f"{where}: renders plan key '{key}', which no plan-card "
                           f"in the {path} path writes")
                continue
            wpos, wfile, w_i = written[key]
            if learner and wpos >= pos:
                rep.err(f, f"{where}: renders the learner's '{key}' before it is written "
                           f"(written in {wfile} screen {w_i})")


def validate_tiers(chapters, rep):
    """A tier is a milestone, so a learner may only reach it once (UI.md §7.5).

    The shared chapter belongs to every path, so "all" collides with each of them;
    two different paths awarding the same tier name do not collide with each other.
    """
    awards = []
    for files in chapters.values():
        for d in files:
            for s in d["screens"]:
                if s.get("type") == "tier-up" and s.get("tier"):
                    awards.append((str(s["tier"]).strip(), d.get("path"), d["_file"]))
    for i, (tier, path, f) in enumerate(awards):
        clash = [g for other, opath, g in awards[i + 1:]
                 if other == tier and (path == opath or "all" in (path, opath))]
        if clash:
            rep.warn(f, f"tier '{tier}' is also awarded in {', '.join(str(g) for g in clash)}")


# ---------------------------------------------------------------------------
# Drill packs (docs/schema.md, "Drill packs")
# ---------------------------------------------------------------------------
# A pack is a flat bank of scored screens with no lesson around them: the Practice hub
# draws from it in its own order, weighted by the learner's weak concepts. So the rules
# that belong to a *lesson* — screen budget, intro/summary, the run of mc screens, the
# time estimate — do not apply, and the rules that belong to a *bank* do: every screen
# stands alone, and the answer key of the whole pack must not be guessable (agent.md §3.5).
DRILLS = CONTENT / "drills"
DRILL_MANIFEST = DRILLS / "packs.yaml"
DRILL_REQUIRED = ["id", "path", "title", "unlocked_by", "unlocked_by_chapter",
                  "tags", "concepts", "screens"]
MANIFEST_REQUIRED = ["id", "slug", "file", "path", "title", "unlocked_by",
                     "unlocked_by_chapter", "screens", "tags", "concepts", "exemplars"]
DRILL_MIN_SCREENS, DRILL_MAX_SCREENS = 10, 40
# build-plan.md Stage 4 asks for the interaction to vary across a pack; four types in
# 10–40 screens is the floor that keeps a pack from being 30 chart-decisions in a row.
DRILL_MIN_TYPES = 4


def drill_files():
    """Every written pack: content/drills/<path>/<slug>.yaml (packs.yaml is the manifest)."""
    return sorted(DRILLS.glob("*/*.yaml")) if DRILLS.exists() else []


def sublevel_index(chapters):
    """{(path, chapter): {sub-level id}} — what a pack's `unlocked_by` may name."""
    idx = defaultdict(set)
    for files in chapters.values():
        for d in files:
            idx[(d.get("path"), d.get("chapter"))].add(d["id"])
    return idx


def unlock_target(path, chapter, sub_id, idx):
    """True if `sub_id` is a sub-level of that chapter. The shared chapter is every path's."""
    return sub_id in (idx.get((path, chapter), set()) | idx.get(("all", chapter), set()))


def check_unlocked_by(f, data, rep, idx):
    chapter = data.get("unlocked_by_chapter")
    sub = data.get("unlocked_by")
    if not isinstance(chapter, int) or isinstance(chapter, bool):
        rep.err(f, f"unlocked_by_chapter must be a chapter number (got {chapter!r})")
        return
    if not isinstance(sub, str) or not re.fullmatch(r"\d+-\d+", sub):
        rep.err(f, f"unlocked_by must be a sub-level id like '12-3' (got {sub!r})")
        return
    if not unlock_target(data.get("path"), chapter, sub, idx):
        rep.err(f, f"unlocked_by '{sub}' is not a sub-level of chapter {chapter} "
                   f"of the {data.get('path')} path")


def validate_drill_pack(path_file, data, rep, idx):
    """One pack file. Returns the data (with `_file`) or None if it is unusable."""
    f = path_file.relative_to(ROOT)
    if not isinstance(data, dict):
        rep.err(f, "a drill pack must be a YAML mapping")
        return None
    missing = [k for k in DRILL_REQUIRED if k not in data]
    if missing:
        for k in missing:
            rep.err(f, f"missing field '{k}'")
        return None
    slug = path_file.stem
    pack_path = data["path"]
    if pack_path not in PATHS or pack_path == "all":
        rep.err(f, f"bad path '{pack_path}' — a drill pack belongs to one path, because its "
                   f"charts and its unlocked_by are that path's")
    else:
        if path_file.parent != DRILLS / pack_path:
            rep.err(f, f"a {pack_path} pack belongs in content/drills/{pack_path}/")
        if data["id"] != f"{pack_path}-{slug}":
            rep.err(f, f"id '{data['id']}' is not '<path>-<slug>' ('{pack_path}-{slug}')")
    check_unlocked_by(f, data, rep, idx)
    for k in ("tags", "concepts"):
        v = data.get(k)
        if not isinstance(v, list) or not v or not all(isinstance(x, str) and x.strip() for x in v):
            rep.err(f, f"{k} must be a non-empty list of strings")

    screens = data["screens"]
    if not isinstance(screens, list) or not screens:
        rep.err(f, "no screens")
        return None
    if not DRILL_MIN_SCREENS <= len(screens) <= DRILL_MAX_SCREENS:
        rep.err(f, f"{len(screens)} screens (a pack holds "
                   f"{DRILL_MIN_SCREENS}–{DRILL_MAX_SCREENS})")
    types = set()
    for i, s in enumerate(screens, 1):
        if not isinstance(s, dict):
            rep.err(f, f"screen {i}: must be a mapping")
            continue
        t = s.get("type")
        if t in NON_QUESTION:
            rep.err(f, f"screen {i}: '{t}' is a lesson screen — a drill pack holds question "
                       f"screens only, each one standing alone")
            continue
        if t not in QUESTION:
            rep.err(f, f"screen {i}: unknown type '{t}'")
            continue
        types.add(t)
        validate_question_screen(f, i, s, rep)
        validate_screen_data(f, i, s, rep)
    if types and len(types) < DRILL_MIN_TYPES:
        rep.cwarn(f, f"only {len(types)} question type(s) in the pack "
                     f"(want ≥{DRILL_MIN_TYPES}): {', '.join(sorted(types))}")
    data["_file"] = f
    data["_screens"] = screens
    return data


def validate_drill_hygiene(data, rep):
    """The whole-pack rules: agent.md §3.5 on the answer key, §3.6 on size and volume."""
    f = data["_file"]
    screens = data["_screens"]
    answer_key_hygiene(f, screens, rep, digit_tell=True)
    direction_balance(f, screens, rep)

    # --- §3.6, per screen ------------------------------------------------
    # A pack's screens are independent, so each one is sized against the account *it*
    # names. Where a screen names none, the smallest account the pack names is used:
    # a drill may never put the learner in more stock than the account behind it can pay
    # for, and the conservative reading is the one that cannot let an oversized position
    # through on a bigger account quoted three screens away.
    named = accounts_in(" ".join(screen_text(s) for s in screens))
    fallback = min(named) if named else None
    over_cap = []
    sized = 0
    for i, s in enumerate(screens, 1):
        if s.get("type") in ("chart-decision", "branch"):
            own = accounts_in(screen_text(s))
            account = max(own) if own else fallback
            shares = s.get("shares")
            price = decision_price(s)
            if account and isinstance(shares, (int, float)) and isinstance(price, (int, float)):
                value = shares * price
                sized += 1
                if value > account:
                    rep.cwarn(f, f"screen {i}: {shares:,} shares × ${price:.2f} = ${value:,.0f} "
                                 f"exceeds the ${account:,} account behind it")
                elif value > MAX_ACCOUNT_PCT * account:
                    over_cap.append((value / account, i, shares, price, value, account))
        vol = sorted(v for v in ((s.get("chart") or {}).get("volume") or [])
                     if isinstance(v, (int, float)))
        if vol:
            median = vol[len(vol) // 2]
            if not VOLUME_MIN <= median <= VOLUME_MAX:
                rep.cwarn(f, f"screen {i}: typical bar volume {median:,.0f} outside "
                             f"{VOLUME_MIN:,}–{VOLUME_MAX:,} per bar")
    if over_cap:
        pct, i, shares, price, value, account = max(over_cap)
        rep.cwarn(f, f"{len(over_cap)}/{sized} positions are over the {MAX_ACCOUNT_PCT:.0%} cap on "
                     f"one position (agent.md §3.6); worst is screen {i}, {shares:,} shares × "
                     f"${price:.2f} = ${value:,.0f}, {pct:.1%} of the ${account:,} account")

    # --- the pack must contain the near-misses it was commissioned for ----
    decisions = [s for s in screens if s.get("type") == "chart-decision"]
    if len(decisions) >= MIN_DIRECTIONAL and not any(s.get("best") == "no-trade" for s in decisions):
        rep.warn(f, f"none of the pack's {len(decisions)} chart-decisions resolve to no-trade "
                    f"(build-plan.md Stage 4 asks for about a third near-misses)")

    # --- one drill, one question ----------------------------------------
    seen = {}
    for i, s in enumerate(screens, 1):
        key = str(s.get("prompt") or s.get("scenario") or s.get("statement") or "").strip().lower()
        if not key:
            continue
        if key in seen:
            rep.warn(f, f"screen {i} repeats screen {seen[key]}'s wording: '{key[:60]}…'")
        seen[key] = i


def validate_drill_manifest(rep, packs, written, idx):
    """content/drills/packs.yaml against the packs on disk (schema.md, "Drill packs").

    The manifest is what the batch run is built from, so it is checked whether or not the
    pack has been written yet: a wrong `unlocked_by` or a missing exemplar is cheaper to
    find now than in 14 generated files.
    """
    m = DRILL_MANIFEST.relative_to(ROOT)
    seen = {}
    for n, entry in enumerate(packs, 1):
        missing = [k for k in MANIFEST_REQUIRED if k not in entry]
        if missing:
            rep.err(m, f"pack {n}: missing {', '.join(missing)}")
            continue
        pid = entry["id"]
        if pid in seen:
            rep.err(m, f"duplicate pack id '{pid}'")
        seen[pid] = entry
        if pid != f"{entry['path']}-{entry['slug']}":
            rep.err(m, f"{pid}: id is not '<path>-<slug>'")
        if entry["file"] != f"content/drills/{entry['path']}/{entry['slug']}.yaml":
            rep.err(m, f"{pid}: file is not content/drills/<path>/<slug>.yaml")
        if not isinstance(entry["screens"], int) or not (
                DRILL_MIN_SCREENS <= entry["screens"] <= DRILL_MAX_SCREENS):
            rep.err(m, f"{pid}: commissioned for {entry['screens']} screens "
                       f"({DRILL_MIN_SCREENS}–{DRILL_MAX_SCREENS} allowed)")
        check_unlocked_by(m, entry, rep, idx)
        for ex in entry["exemplars"] or []:
            ef = ROOT / str(ex.get("file", ""))
            if not ef.exists():
                rep.err(m, f"{pid}: exemplar file {ex.get('file')} does not exist")
                continue
            try:
                ed = yaml.safe_load(ef.read_text(encoding="utf-8"))
            except yaml.YAMLError as e:
                rep.err(m, f"{pid}: exemplar file {ex.get('file')} does not parse: {e}")
                continue
            n_screens = len(ed.get("screens") or [])
            if not isinstance(ex.get("screen"), int) or not 1 <= ex["screen"] <= n_screens:
                rep.err(m, f"{pid}: {ex.get('file')} has no screen {ex.get('screen')}")
            elif ed["screens"][ex["screen"] - 1].get("type") not in QUESTION:
                rep.err(m, f"{pid}: exemplar {ex.get('file')} screen {ex['screen']} is a "
                           f"{ed['screens'][ex['screen'] - 1].get('type')} screen, not a question")

    # what is on disk against what was commissioned
    for data in written:
        pid = data.get("id")
        entry = seen.get(pid)
        if entry is None:
            rep.err(data["_file"], f"pack '{pid}' has no entry in {m}")
            continue
        for k in ("path", "unlocked_by", "unlocked_by_chapter"):
            if data.get(k) != entry.get(k):
                rep.err(data["_file"], f"{k} is {data.get(k)!r}; the manifest commissioned "
                                       f"{entry.get(k)!r}")
        if data.get("title") != entry.get("title"):
            rep.cwarn(data["_file"], f"title '{data.get('title')}' differs from the manifest's "
                                     f"'{entry.get('title')}'")
        n = len(data.get("_screens") or [])
        if n != entry["screens"]:
            rep.cwarn(data["_file"], f"{n} screens; the manifest commissioned {entry['screens']}")
        gone = [c for c in entry["concepts"] if c not in (data.get("concepts") or [])]
        if gone:
            rep.warn(data["_file"], f"drops concept(s) the manifest lists: {', '.join(gone)}")


BENCH = ROOT / "demo/all-screens.yaml"


def validate_bench(rep, path=BENCH):
    """The test bench (demo/all-screens.yaml) is not a lesson, so the lesson rules (screen
    count, question mix, mc runs) do not apply. Every screen on it still has to be one the
    content could hold: a known type, a valid question, component data as in schema.md.
    Written to fit the renderer instead, it once hid the depth-ladder crash (review M2)."""
    f = path.relative_to(ROOT)
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as e:
        rep.err(f, f"YAML error: {e}")
        return
    screens = (data or {}).get("screens") if isinstance(data, dict) else None
    if not isinstance(screens, list) or not screens:
        rep.err(f, "no screens")
        return
    for i, s in enumerate(screens, 1):
        if not isinstance(s, dict):
            rep.err(f, f"screen {i}: must be a mapping")
            continue
        t = s.get("type")
        if t not in NON_QUESTION | QUESTION | BENCH_ONLY:
            rep.err(f, f"screen {i}: unknown type '{t}'")
            continue
        if t in QUESTION:
            validate_question_screen(f, i, s, rep)
        validate_screen_data(f, i, s, rep)

def main():
    status = "--status" in sys.argv
    strict = "--strict" in sys.argv
    rep = Report(strict=strict)
    chapters = defaultdict(list)
    bonus = defaultdict(list)
    for path in sorted(CONTENT.rglob("level-*.yaml")):
        try:
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as e:
            rep.err(path.relative_to(ROOT), f"YAML error: {e}")
            continue
        if BONUS_FILE.match(path.name):
            data = validate_bonus_file(path, data, rep)
            if data:
                bonus[path.parent].append(data)
            continue
        data = validate_file(path, data, rep)
        if data:
            data["_file"] = path.relative_to(ROOT)
            chapters[path.parent].append(data)
    validate_bonus(bonus, chapters, rep)
    # docs/ContentToDo.md 3.1 [DESIGN-REVIEW]: a new-theory lesson with nothing to collect
    # after it. One line per chapter -- the worklist (stage RULES) lists the lessons.
    for folder in sorted(chapters):
        bare = [d for d in chapters[folder]
                if d["category"] == "new-theory" and not d.get("terms_introduced") and not d.get("skills")]
        if bare:
            rep.warn(folder.relative_to(ROOT),
                     f"{len(bare)} new-theory lessons have neither terms_introduced nor skills "
                     f"(nothing to collect after them; docs/ContentToDo.md 3.1)")
    infos = {folder: folder_info(folder) for folder in chapters}
    for folder, files in chapters.items():
        path, num = infos[folder]
        known = set()
        for other, (opath, onum) in infos.items():
            if other == folder or onum is None or num is None or onum >= num:
                continue
            if opath == "shared" or opath == path:
                for d in chapters[other]:
                    known.update(t.lower() for t in d.get("terms_introduced") or [])
        validate_chapter(folder, files, rep, known)
        validate_chapter_v3(folder, files, rep)
    validate_tiers(chapters, rep)
    validate_plan(chapters, rep)
    validate_bench(rep)

    # drill packs (schema.md, "Drill packs"): the Practice hub's bank, validated against
    # the manifest that commissioned it. Batch output is not exempt from --strict.
    idx = sublevel_index(chapters)
    written = []
    for path in drill_files():
        try:
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as e:
            rep.err(path.relative_to(ROOT), f"YAML error: {e}")
            continue
        data = validate_drill_pack(path, data, rep, idx)
        if data:
            validate_drill_hygiene(data, rep)
            written.append(data)
    manifest_packs = []
    if DRILL_MANIFEST.exists():
        try:
            manifest_packs = (yaml.safe_load(DRILL_MANIFEST.read_text(encoding="utf-8")) or {}).get("packs") or []
        except yaml.YAMLError as e:
            rep.err(DRILL_MANIFEST.relative_to(ROOT), f"YAML error: {e}")
        validate_drill_manifest(rep, manifest_packs, written, idx)
    elif written:
        rep.err(DRILLS.relative_to(ROOT), "drill packs exist but content/drills/packs.yaml does not")
    if status:
        print(f"{'chapter':60} {'levels':>6} {'subs':>5} {'screens':>7} {'questions':>9} {'minutes':>7}")
        for folder in sorted(chapters):
            files = chapters[folder]
            levels = len({level_key(d['id'])[0] for d in files})
            screens = sum(d["_units"] for d in files)
            qs = sum(d["_nq"] for d in files)
            minutes = sum(d["_seconds"] for d in files) / 60
            print(f"{str(folder.relative_to(ROOT)):60} {levels:>6} {len(files):>5} {screens:>7} {qs:>9} {minutes:>7.1f}")
        print()
        if manifest_packs:
            by_id = {d.get("id"): d for d in written}
            print(f"{'drill pack':40} {'unlocks at':>12} {'screens':>8} {'of':>4}  state")
            for entry in manifest_packs:
                d = by_id.get(entry.get("id"))
                have = len(d.get("_screens") or []) if d else 0
                state = "written" if d else "not written"
                unlock = f"{entry.get('unlocked_by_chapter')}·{entry.get('unlocked_by')}"
                print(f"{str(entry.get('id')):40} {unlock:>12} {have:>8} "
                      f"{entry.get('screens'):>4}  {state}")
            done = sum(len(d.get("_screens") or []) for d in written)
            want = sum(e.get("screens", 0) for e in manifest_packs)
            print(f"{'':40} {'':>12} {done:>8} {want:>4}  "
                  f"{len(written)}/{len(manifest_packs)} packs")
            print()
    for w in rep.warnings:
        print("WARN ", w)
    for e in rep.errors:
        print("ERROR", e)
    mode = " (--strict: chapter-level warnings are errors)" if rep.strict else ""
    packs = (f"{len(written)}/{len(manifest_packs)} drill packs, " if manifest_packs else "")
    print(f"\n{len(chapters)} chapters, {sum(len(v) for v in chapters.values())} files, "
          f"{packs}{len(rep.errors)} errors, {len(rep.warnings)} warnings{mode}")
    if not rep.strict and rep.chapter_warnings:
        print(f"{rep.chapter_warnings} of those are chapter-level v3 warnings; "
              f"run with --strict to fail on them.")
    sys.exit(1 if rep.errors else 0)


if __name__ == "__main__":
    main()
