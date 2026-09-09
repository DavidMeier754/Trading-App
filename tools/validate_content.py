#!/usr/bin/env python3
"""Validate lesson YAML files against docs/schema.md (v3). Usage:
  python3 tools/validate_content.py            # errors + warnings, exit 1 on errors
  python3 tools/validate_content.py --strict   # chapter-level warnings count as errors
  python3 tools/validate_content.py --status   # chapter statistics

File-level checks come from the "Validator rules" section of docs/schema.md.
Chapter-level checks come from the "Chapter-level warnings [v3]" block at the end
of the same file; each carries a short id (shown in brackets) so a chapter can be
gated on them one at a time while it is being written.
"""
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"

CATEGORIES = {"new-theory", "repetition", "test", "final-exam"}
PATHS = {"all", "scalping", "day-trading", "swing-trading"}
NON_QUESTION = {
    "intro", "theory", "example", "carousel", "walkthrough", "visual",
    "checklist-reveal", "story", "summary", "badge", "path-choice",
    # [v3] new archetypes
    "recap", "plan-card", "tier-up",
}
QUESTION = {
    "mc", "tf", "numeric-mc", "numeric-input", "fill-tiles", "fill-choice",
    "match", "sort", "order", "hotspot", "slider", "chart-tap",
    "chart-decision", "spot-mistake",
    # [v3] new question types
    "swipe-deck", "chart-annotate", "order-build", "scanner-pick", "compare",
    "branch", "journal-row", "depth-ladder",
}
INTERACTIVE = {
    "hotspot", "chart-tap", "chart-decision", "walkthrough", "visual",
    "spot-mistake", "slider", "order", "sort",
    # [v3] the new types are all visual or hands-on, and so is plan-card
    "swipe-deck", "chart-annotate", "order-build", "scanner-pick", "compare",
    "branch", "journal-row", "depth-ladder", "plan-card",
}
SECONDS = {
    "intro": 8, "theory": 10, "example": 10, "carousel": 10, "walkthrough": 10,
    "visual": 12, "checklist-reveal": 8, "story": 10, "summary": 10, "badge": 10,
    "path-choice": 15, "match": 18, "sort": 18, "order": 18, "chart-decision": 20,
    # [v3] per-type estimates from docs/schema.md; swipe-deck and branch are
    # multiplied per card/step in screen_seconds(). tier-up is not listed in the
    # doc and is priced like the badge screen it sits next to.
    "swipe-deck": 8, "branch": 18, "chart-annotate": 15, "order-build": 15,
    "scanner-pick": 15, "compare": 15, "journal-row": 15, "depth-ladder": 15,
    "recap": 10, "plan-card": 20, "tier-up": 10,
}
REQUIRED = [
    "id", "title", "chapter", "chapter_title", "path", "category", "tags",
    "learning_goal", "purpose", "terms_introduced", "xp", "difficulty",
    "sources", "screens",
]

TIERS = {"Observer", "Student", "Planner", "Sim Trader"}
# "a $12,000 account" / "Account: $12,000" / "account under $25,000"
ACCOUNT_RE = re.compile(
    r"\$\s*([\d][\d,]*(?:\.\d+)?)\s*(?:[a-z-]+\s+){0,2}account"
    r"|account\b\s*(?:of|is|holds|under|with|size)?\s*[:=]?\s*\$\s*([\d][\d,]*(?:\.\d+)?)",
    re.IGNORECASE,
)
# 1-minute bar volume band for the path chapters that trade 1-minute bars.
VOLUME_BAND = (4_000, 500_000)
ONE_MINUTE_PATHS = {"scalping", "day-trading"}


def is_num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def screen_units(s):
    t = s["type"]
    if t == "carousel":
        return len(s.get("cards", []) or [])
    if t == "walkthrough":
        return len(s.get("steps", []) or [])
    if t == "checklist-reveal":
        return max(1, len(s.get("items", []) or []) // 2)
    if t == "swipe-deck":                      # [v3] one screen per card
        return max(1, len(s.get("cards", []) or []))
    if t == "branch":                          # [v3] one screen per step
        return max(1, len(s.get("steps", []) or []))
    return 1


def screen_seconds(s):
    t = s["type"]
    if t in ("carousel", "walkthrough"):
        return 10 * screen_units(s)
    if t == "checklist-reveal":
        return 8 * len(s.get("items", []) or [])
    if t in ("swipe-deck", "branch"):
        return SECONDS[t] * screen_units(s)
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
    for c in s.get("cards", []) or []:          # [v3] swipe-deck card verdicts
        if isinstance(c, dict) and c.get("note"):
            parts.append(str(c["note"]))
    for st in s.get("steps", []) or []:          # [v3] branch steps
        if not isinstance(st, dict):
            continue
        for k in ("prompt", "explanation", "text"):
            if st.get(k):
                parts.append(str(st[k]))
        for o in st.get("options", []) or []:
            parts.append(o["text"] if isinstance(o, dict) else str(o))
    return " ".join(parts)


def level_key(lvl_id):
    a, b = lvl_id.split("-")
    return (int(a), int(b))


def decision_price(s):
    """Close of the bar the chart pauses on, or None."""
    chart = s.get("chart") or {}
    bars = chart.get("data") or []
    di = chart.get("decision_index")
    if not isinstance(di, int) or not 0 <= di < len(bars):
        return None
    bar = bars[di]
    if isinstance(bar, list) and len(bar) == 4:
        return bar[3]
    return bar if is_num(bar) else None


def per_share_move(s):
    """Per-share move the scenario actually resolves to, in cents of price."""
    chart = s.get("chart") or {}
    bars = chart.get("data") or []
    start = decision_price(s)
    if start is None or not bars:
        return None
    last = bars[-1]
    end = last[3] if isinstance(last, list) and len(last) == 4 else last
    if not is_num(end):
        return None
    return round(abs(end - start), 2)


def chart_volumes(obj):
    """Every `volume: [...]` list anywhere inside a screen."""
    if isinstance(obj, dict):
        if isinstance(obj.get("volume"), list):
            yield obj["volume"]
        for v in obj.values():
            yield from chart_volumes(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from chart_volumes(v)


class Report:
    def __init__(self, strict=False):
        self.errors = []
        self.warnings = []
        self.strict = strict
        self.chapter_hits = Counter()

    def err(self, f, msg):
        self.errors.append(f"{f}: {msg}")

    def warn(self, f, msg):
        self.warnings.append(f"{f}: {msg}")

    def cwarn(self, check, f, msg):
        """Chapter-level finding: a warning normally, an error under --strict."""
        self.chapter_hits[check] += 1
        line = f"{f}: [{check}] {msg}"
        (self.errors if self.strict else self.warnings).append(line)


def check_chart(chart, f, i, rep, what="chart", bars_range=(8, 12), require_kind=True):
    """Shared candle/line shape checks (docs/schema.md, 'Chart conventions')."""
    if not isinstance(chart, dict):
        rep.err(f, f"screen {i}: {what} must be a mapping")
        return
    bars = chart.get("data") or []
    kind = chart.get("kind")
    if require_kind and kind not in ("line", "candles"):
        rep.err(f, f"screen {i}: {what}.kind must be line or candles")
    if bars_range and not bars_range[0] <= len(bars) <= bars_range[1]:
        rep.warn(f, f"screen {i}: {what} has {len(bars)} bars (expected {bars_range[0]}–{bars_range[1]})")
    if kind == "candles":
        for b_i, bar in enumerate(bars):
            if not (isinstance(bar, list) and len(bar) == 4 and all(is_num(x) for x in bar)):
                rep.err(f, f"screen {i}: {what} candle {b_i} must be [open, high, low, close]")
                break
            o, h, l, c = bar
            if h < max(o, c) or l > min(o, c):
                rep.err(f, f"screen {i}: {what} candle {b_i} high/low inconsistent with open/close")
    if kind == "line" and not all(is_num(x) for x in bars):
        rep.err(f, f"screen {i}: {what} line data must be numbers")


def validate_screen_v3(t, s, i, f, rep):
    """Per-type shape checks for the [v3] screen types."""
    if t == "swipe-deck":
        cards = s.get("cards") or []
        if not 4 <= len(cards) <= 8:
            rep.err(f, f"screen {i}: swipe-deck needs 4–8 cards (has {len(cards)})")
        for ci, card in enumerate(cards, 1):
            if not isinstance(card, dict) or card.get("answer") not in ("take", "pass"):
                rep.err(f, f"screen {i}: swipe-deck card {ci} needs answer 'take' or 'pass'")
                continue
            if card.get("chart"):
                check_chart(card["chart"], f, i, rep, what=f"card {ci} chart", bars_range=(8, 10))
    elif t == "chart-annotate":
        if not is_num(s.get("answer")):
            rep.err(f, f"screen {i}: chart-annotate.answer must be a price")
        if not is_num(s.get("tolerance")):
            rep.err(f, f"screen {i}: chart-annotate needs a numeric tolerance")
        if s.get("chart"):
            check_chart(s["chart"], f, i, rep)
        else:
            rep.err(f, f"screen {i}: chart-annotate needs a chart")
    elif t == "order-build":
        slots = s.get("slots") or []
        ans = s.get("answer")
        chips = s.get("chips") or {}
        if not slots:
            rep.err(f, f"screen {i}: order-build needs slots")
        if not isinstance(ans, dict):
            rep.err(f, f"screen {i}: order-build.answer must be a mapping of slot → value")
        elif set(ans) != set(slots):
            rep.err(f, f"screen {i}: order-build.answer keys {sorted(ans)} do not match slots {sorted(slots)}")
        else:
            for k in slots:
                offered = chips.get(k) or []
                if ans[k] not in offered:
                    rep.err(f, f"screen {i}: order-build answer {k}={ans[k]!r} is not among the chips for '{k}'")
    elif t == "scanner-pick":
        rows = (s.get("data") or {}).get("rows") or []
        tickers = {r.get("ticker") for r in rows if isinstance(r, dict)}
        targets = s.get("targets") or ([s["target"]] if s.get("target") is not None else [])
        if not targets:
            rep.err(f, f"screen {i}: scanner-pick needs target(s)")
        for tg in targets:
            if tg not in tickers:
                rep.err(f, f"screen {i}: scanner-pick target '{tg}' is not a ticker in rows")
    elif t == "compare":
        charts = s.get("charts") or []
        if not charts:
            rep.err(f, f"screen {i}: compare needs charts")
        elif not 2 <= len(charts) <= 3:
            rep.warn(f, f"screen {i}: compare has {len(charts)} charts (expected 2–3)")
        labels = {c.get("label") for c in charts if isinstance(c, dict)}
        ans = s.get("answer")
        if ans == "neither":
            if not s.get("allow_neither"):
                rep.err(f, f"screen {i}: compare.answer 'neither' needs allow_neither: true")
        elif charts and ans not in labels:
            rep.err(f, f"screen {i}: compare.answer '{ans}' is not a chart label {sorted(x for x in labels if x)}")
        for c in charts:
            if isinstance(c, dict):
                check_chart(c, f, i, rep, what=f"chart {c.get('label')}", bars_range=(8, 10))
    elif t == "branch":
        steps = s.get("steps") or []
        if not 2 <= len(steps) <= 4:
            rep.err(f, f"screen {i}: branch needs 2–4 steps (has {len(steps)})")
        for si, st in enumerate(steps, 1):
            if not isinstance(st, dict):
                rep.err(f, f"screen {i}: branch step {si} must be a mapping")
                continue
            opts = st.get("options") or []
            n = sum(1 for o in opts if isinstance(o, dict) and o.get("correct"))
            if n != 1:
                rep.err(f, f"screen {i}: branch step {si} needs exactly one correct option (has {n})")
        if s.get("chart"):
            check_chart(s["chart"], f, i, rep)
    elif t == "journal-row":
        slots = s.get("slots") or []
        ans = s.get("answer")
        if not slots:
            rep.err(f, f"screen {i}: journal-row needs slots")
        if not isinstance(ans, dict):
            rep.err(f, f"screen {i}: journal-row.answer must be a mapping of slot → value")
        elif set(ans) != set(slots):
            rep.err(f, f"screen {i}: journal-row.answer keys {sorted(ans)} do not match slots {sorted(slots)}")
    elif t == "depth-ladder":
        book = s.get("data") or {}
        tg = str(s.get("target") or "")
        m = re.fullmatch(r"(bid|ask)-(\d+)", tg)
        if not m:
            rep.err(f, f"screen {i}: depth-ladder.target must look like 'bid-2' or 'ask-1' (got '{tg}')")
        else:
            side = book.get("bids" if m.group(1) == "bid" else "asks") or []
            n = int(m.group(2))
            if not 1 <= n <= len(side):
                rep.err(f, f"screen {i}: depth-ladder target '{tg}' is not in the book "
                           f"({len(side)} {m.group(1)} levels)")
    elif t == "recap":
        points = s.get("points") or []
        if not 2 <= len(points) <= 4:
            rep.err(f, f"screen {i}: recap needs 2–4 points (has {len(points)})")
        for pi, p in enumerate(points, 1):
            if not isinstance(p, dict) or not p.get("text"):
                rep.err(f, f"screen {i}: recap point {pi} needs text")
    elif t == "plan-card":
        fields = s.get("fields") or []
        if not fields:
            rep.err(f, f"screen {i}: plan-card needs fields")
        for fi, fld in enumerate(fields, 1):
            if not isinstance(fld, dict) or not fld.get("key") or not fld.get("label"):
                rep.err(f, f"screen {i}: plan-card field {fi} needs a key and a label")
    elif t == "tier-up":
        if not s.get("tier"):
            rep.err(f, f"screen {i}: tier-up needs a tier name")
        elif s["tier"] not in TIERS:
            rep.warn(f, f"screen {i}: tier '{s['tier']}' is not one of the four tiers in UI.md §7.5")
        if not s.get("means"):
            rep.err(f, f"screen {i}: tier-up needs a 'means' line")


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
    if data["path"] not in PATHS:
        rep.err(f, f"bad path '{data['path']}'")
    # [v3] reinforces
    if "reinforces" in data and data["reinforces"] is not None:
        r = data["reinforces"]
        if not isinstance(r, list):
            rep.err(f, "reinforces must be a list of chapter numbers")
        else:
            seen_ch = set()
            for v in r:
                if not isinstance(v, int) or isinstance(v, bool):
                    rep.err(f, f"reinforces entry {v!r} must be a chapter number")
                    continue
                if v < 1 or v >= data["chapter"]:
                    rep.err(f, f"reinforces {v} must be a chapter lower than {data['chapter']}")
                if v in seen_ch:
                    rep.err(f, f"reinforces lists chapter {v} twice")
                seen_ch.add(v)
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
        if t in QUESTION:
            qtypes.append(t)
            if t == "branch":
                for si, st in enumerate(s.get("steps") or [], 1):
                    if isinstance(st, dict) and not st.get("explanation"):
                        rep.err(f, f"screen {i} (branch): step {si} missing explanation")
            elif not s.get("explanation"):
                rep.err(f, f"screen {i} ({t}): missing explanation")
        if t in ("mc", "numeric-mc"):
            mc_run += 1
            if mc_run > 2:
                rep.err(f, f"screen {i}: more than 2 multiple-choice screens in a row")
            opts = s.get("options") or []
            if not 2 <= len(opts) <= 4:
                rep.err(f, f"screen {i}: mc needs 2–4 options")
            texts = [o.get("text") if isinstance(o, dict) else o for o in opts]
            if len(set(texts)) != len(texts):
                rep.err(f, f"screen {i}: duplicate option text")
            ncorrect = sum(1 for o in opts if isinstance(o, dict) and o.get("correct"))
            if ncorrect != 1:
                rep.err(f, f"screen {i}: needs exactly one correct option (has {ncorrect})")
        elif t in QUESTION:
            mc_run = 0
        else:
            mc_run = 0
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
            # [v3] standing aside is never punished
            if s.get("best") in ("long", "short") and "no-trade" in buttons:
                if "no-trade" not in (s.get("reasonable") or []):
                    rep.err(f, f"screen {i}: best is '{s['best']}' so reasonable must contain 'no-trade'")
        if t in ("chart-decision", "chart-tap"):
            chart = s.get("chart") or {}
            bars = chart.get("data") or []
            check_chart(chart, f, i, rep,
                        bars_range=(8, 12) if t == "chart-decision" else None)
            if t == "chart-decision":
                di = chart.get("decision_index")
                if not isinstance(di, int) or not 3 <= di <= len(bars) - 3:
                    rep.warn(f, f"screen {i}: decision_index {di} should leave bars before and after the decision")
            if t == "chart-tap":
                tg = s.get("target")
                if not isinstance(tg, int) or not 0 <= tg < len(bars):
                    rep.err(f, f"screen {i}: chart-tap.target must be a bar index")
        if t == "numeric-input" and not is_num(s.get("answer")):
            rep.err(f, f"screen {i}: numeric-input.answer must be a number")
        if t == "spot-mistake":
            segs = s.get("segments") or []
            if sum(1 for x in segs if x.get("wrong")) != 1:
                rep.err(f, f"screen {i}: spot-mistake needs exactly one wrong segment")
        validate_screen_v3(t, s, i, f, rep)
    if screens[0].get("type") != "intro":
        rep.err(f, "first screen must be intro")
    nq = len(qtypes)
    if is_exam:
        if screens[-1].get("type") not in ("summary", "badge", "path-choice", "tier-up"):
            rep.err(f, "test/exam must end with summary (and badge for final exams)")
        counter = screens[0].get("counter")
        totals = [s.get("total") for s in screens if s.get("type") == "summary"]
        if counter != nq:
            rep.err(f, f"intro.counter={counter} but {nq} question screens")
        if not totals or totals[0] != nq:
            rep.err(f, f"summary.total={totals} but {nq} question screens")
        if data["category"] == "final-exam" and not any(s.get("type") == "badge" for s in screens):
            rep.err(f, "final exam needs a badge screen")
        # [v3] final exams get the lesson budget; tests stay at 10–16
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
    for d in ordered:
        p = d.get("prerequisite")
        if p is not None and p not in ids:
            rep.err(d["_file"], f"prerequisite '{p}' not found in chapter")
        if folder_num is not None and d.get("chapter") != folder_num:
            rep.warn(d["_file"], f"chapter field {d.get('chapter')} differs from folder chapter {folder_num}")
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
    # consecutive review subs
    run = 0
    for d in ordered:
        run = run + 1 if d["category"] != "new-theory" else 0
        if run > 2:
            rep.warn(d["_file"], "more than 2 review-type sub-levels in a row")


def chapter_warnings(folder, files, rep):
    """The 'Chapter-level warnings [v3]' block at the end of docs/schema.md."""
    ordered = sorted(files, key=lambda d: level_key(d["id"]))
    fold = folder.relative_to(ROOT)
    path_name, num = folder_info(folder)

    # --- shape: level count and sub distribution -------------------------
    by_level = defaultdict(list)
    for d in ordered:
        by_level[level_key(d["id"])[0]].append(d)
    nlevels = len(by_level)
    if nlevels < 15:
        rep.cwarn("levels", fold, f"{nlevels} levels (a chapter needs at least 15)")
    big = sum(1 for subs in by_level.values() if len(subs) >= 3)
    four = sum(1 for subs in by_level.values() if len(subs) >= 4)
    if nlevels and big / nlevels < 0.60:
        rep.cwarn("subs", fold, f"only {big}/{nlevels} levels ({big / nlevels:.0%}) have ≥3 subs (need ≥60 %)")
    if four < 4:
        rep.cwarn("subs", fold, f"only {four} levels have 4 subs (need ≥4)")

    # --- question-type variety -------------------------------------------
    used = Counter()
    qscreens = 0
    for d in ordered:
        for s in d["screens"]:
            if s.get("type") in QUESTION:
                used[s["type"]] += 1
                qscreens += 1
    if len(used) < 10:
        rep.cwarn("variety", fold, f"only {len(used)} distinct question types used (need ≥10)")
    thin = sorted(t for t in QUESTION if used[t] < 2)
    if thin:
        rep.cwarn("variety", fold,
                  f"{len(thin)} question types used fewer than twice: {', '.join(thin)}")

    # --- callbacks and the reinforcement quota ---------------------------
    if num is not None and num >= 3:
        if not any("callback" in str(d.get("title", "")).lower() for d in ordered):
            rep.cwarn("callback", fold, "no Callback level in this chapter")
    reinforcing_q = sum(d["_nq"] for d in ordered if d.get("reinforces"))
    if qscreens:
        share = reinforcing_q / qscreens
        if share < 0.15:
            rep.cwarn("callback", fold,
                      f"{reinforcing_q}/{qscreens} question screens ({share:.0%}) sit in subs "
                      f"declaring 'reinforces' (need ≥15 %)")

    # --- exams reach back -------------------------------------------------
    for d in ordered:
        if d["category"] not in ("test", "final-exam"):
            continue
        need = 0.20 if d["category"] == "test" else 0.25
        marked = sum(1 for s in d["screens"] if s.get("type") in QUESTION and s.get("reinforces"))
        if not d.get("reinforces"):
            rep.cwarn("exam-reachback", d["_file"],
                      f"{d['category']} declares no 'reinforces' (needs ≥{need:.0%} of its "
                      f"{d['_nq']} questions from earlier chapters)")
        elif marked and d["_nq"] and marked / d["_nq"] < need:
            rep.cwarn("exam-reachback", d["_file"],
                      f"{marked}/{d['_nq']} questions ({marked / d['_nq']:.0%}) marked as reaching "
                      f"back (need ≥{need:.0%})")

    # --- answer-key hygiene ----------------------------------------------
    positions = Counter()
    longest_tell = 0
    mc_total = 0
    for d in ordered:
        for s in d["screens"]:
            if s.get("type") not in ("mc", "numeric-mc"):
                continue
            opts = s.get("options") or []
            texts = [str(o.get("text")) if isinstance(o, dict) else str(o) for o in opts]
            idx = [j for j, o in enumerate(opts) if isinstance(o, dict) and o.get("correct")]
            if len(idx) != 1:
                continue
            mc_total += 1
            positions[idx[0]] += 1
            lens = [len(x) for x in texts]
            if lens and lens[idx[0]] == max(lens) and lens.count(max(lens)) == 1:
                longest_tell += 1
    if mc_total >= 10:
        pos, n = positions.most_common(1)[0]
        if n / mc_total > 0.50:
            rep.cwarn("answer-position", fold,
                      f"position {pos + 1} holds {n}/{mc_total} ({n / mc_total:.0%}) of the correct "
                      f"mc/numeric-mc options (max 50 %)")
        if longest_tell / mc_total > 0.45:
            rep.cwarn("length-tell", fold,
                      f"the correct option is the longest in {longest_tell}/{mc_total} "
                      f"({longest_tell / mc_total:.0%}) of mc/numeric-mc screens (max 45 %)")
    tf = [s["answer"] for d in ordered for s in d["screens"]
          if s.get("type") == "tf" and isinstance(s.get("answer"), bool)]
    if len(tf) >= 5:
        share = sum(tf) / len(tf)
        if not 0.40 <= share <= 0.60:
            rep.cwarn("tf-split", fold,
                      f"{sum(tf)}/{len(tf)} tf answers are true ({share:.0%}); need 40–60 %")

    # --- closing screens ---------------------------------------------------
    ends_theory = sum(1 for d in ordered if d["screens"][-1].get("type") == "theory")
    if ordered and ends_theory / len(ordered) > 0.70:
        rep.cwarn("closing-screens", fold,
                  f"{ends_theory}/{len(ordered)} sub-levels ({ends_theory / len(ordered):.0%}) "
                  f"end on a theory screen (max 70 %)")

    # --- chart-decision outcome clustering ---------------------------------
    moves = Counter()
    for d in ordered:
        for s in d["screens"]:
            if s.get("type") == "chart-decision":
                mv = per_share_move(s)
                if mv is not None:
                    moves[mv] += 1
    total_moves = sum(moves.values())
    if total_moves >= 8:
        mv, n = moves.most_common(1)[0]
        if n / total_moves > 0.25:
            rep.cwarn("outcome-clustering", fold,
                      f"a per-share move of ${mv:.2f} is the outcome of {n}/{total_moves} "
                      f"({n / total_moves:.0%}) chart-decisions (max 25 %)")

    # --- difficulty curve ---------------------------------------------------
    run = 0
    prev = object()
    for d in ordered:
        cur = d.get("difficulty")
        run = run + 1 if cur == prev else 1
        prev = cur
        if run == 6:
            rep.cwarn("difficulty-runs", d["_file"],
                      f"6th sub-level in a row at difficulty {cur} (max 5)")

    # --- position value against the account the file names ------------------
    for d in ordered:
        accounts = []
        for m in ACCOUNT_RE.finditer(d.get("_text", "")):
            raw = m.group(1) or m.group(2)
            try:
                accounts.append(float(raw.replace(",", "")))
            except ValueError:
                pass
        if not accounts:
            continue
        account = min(accounts)
        for i, s in enumerate(d["screens"], 1):
            if s.get("type") != "chart-decision" or not s.get("shares"):
                continue
            price = decision_price(s)
            if price is None:
                continue
            value = s["shares"] * price
            if value > account:
                rep.cwarn("account-ceiling", d["_file"],
                          f"screen {i}: {s['shares']:,} shares × ${price:.2f} = ${value:,.0f}, "
                          f"more than the ${account:,.0f} account named in this file")

    # --- 1-minute volume magnitude -----------------------------------------
    if path_name in ONE_MINUTE_PATHS:
        lo, hi = VOLUME_BAND
        for d in ordered:
            for i, s in enumerate(d["screens"], 1):
                for vol in chart_volumes(s):
                    for b_i, v in enumerate(vol):
                        if is_num(v) and not lo <= v <= hi:
                            rep.cwarn("volume", d["_file"],
                                      f"screen {i}: bar {b_i} volume {v:,.0f} outside "
                                      f"{lo:,}–{hi:,} for a 1-minute bar")


def main():
    status = "--status" in sys.argv
    strict = "--strict" in sys.argv
    rep = Report(strict=strict)
    chapters = defaultdict(list)
    for path in sorted(CONTENT.rglob("level-*.yaml")):
        try:
            text = path.read_text(encoding="utf-8")
            data = yaml.safe_load(text)
        except yaml.YAMLError as e:
            rep.err(path.relative_to(ROOT), f"YAML error: {e}")
            continue
        data = validate_file(path, data, rep)
        if data:
            data["_file"] = path.relative_to(ROOT)
            data["_text"] = text
            chapters[path.parent].append(data)
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
        chapter_warnings(folder, files, rep)
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
    for w in rep.warnings:
        print("WARN ", w)
    for e in rep.errors:
        print("ERROR", e)
    if rep.chapter_hits:
        label = "promoted to errors by --strict" if strict else "warnings"
        print(f"\nchapter-level checks ({label}):")
        for check, n in sorted(rep.chapter_hits.items(), key=lambda kv: (-kv[1], kv[0])):
            print(f"  {check:<20} {n}")
    print(f"\n{len(chapters)} chapters, {sum(len(v) for v in chapters.values())} files, "
          f"{len(rep.errors)} errors, {len(rep.warnings)} warnings")
    sys.exit(1 if rep.errors else 0)


if __name__ == "__main__":
    main()
