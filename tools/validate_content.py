#!/usr/bin/env python3
"""Validate lesson YAML files against docs/schema.md. Usage:
  python3 tools/validate_content.py            # errors + warnings, exit 1 on errors
  python3 tools/validate_content.py --status   # chapter statistics
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
SECONDS = {
    "intro": 8, "theory": 10, "example": 10, "carousel": 10, "walkthrough": 10,
    "visual": 12, "checklist-reveal": 8, "story": 10, "summary": 10, "badge": 10,
    "path-choice": 15, "match": 18, "sort": 18, "order": 18, "chart-decision": 20,
    # v3
    "recap": 10, "plan-card": 20, "tier-up": 10,
    "chart-annotate": 15, "order-build": 15, "scanner-pick": 15,
    "compare": 15, "journal-row": 15, "depth-ladder": 15,
}
REQUIRED = [
    "id", "title", "chapter", "chapter_title", "path", "category", "tags",
    "learning_goal", "purpose", "terms_introduced", "xp", "difficulty",
    "sources", "screens",
]


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
        if t in QUESTION:
            qtypes.append(t)
            if not s.get("explanation") and t not in NO_SCREEN_EXPLANATION:
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
            if s.get("best") in ("long", "short") and "no-trade" in buttons:
                if "no-trade" not in (s.get("reasonable") or []):
                    rep.err(f, f"screen {i}: best is '{s['best']}' so reasonable must contain 'no-trade'")
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
    # consecutive review subs
    run = 0
    for d in ordered:
        run = run + 1 if d["category"] != "new-theory" else 0
        if run > 2:
            rep.warn(d["_file"], "more than 2 review-type sub-levels in a row")


ACCOUNT_RE = [
    re.compile(r"\$([\d,]+)\s+account", re.I),
    re.compile(r"account[^.$]{0,30}\$([\d,]+)", re.I),
]
PER_SHARE_RE = re.compile(r"\$0\.\d\d")
VOLUME_MIN, VOLUME_MAX = 4_000, 500_000


def file_text(d):
    return " ".join(
        str(s.get(k))
        for s in d["screens"]
        for k in ("text", "body", "prompt", "statement", "scenario", "outcome", "explanation", "working")
        if s.get(k)
    )


def stated_account(d):
    """Largest account size named anywhere in the file, or None."""
    text = file_text(d)
    found = []
    for rx in ACCOUNT_RE:
        for m in rx.finditer(text):
            try:
                found.append(int(m.group(1).replace(",", "")))
            except ValueError:
                pass
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
    positions = defaultdict(int)
    longest_correct = 0
    mc_total = 0
    tf_true = tf_total = 0
    for d in ordered:
        for s in d["screens"]:
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
    if tf_total and not 0.40 <= tf_true / tf_total <= 0.60:
        rep.cwarn(where, f"{tf_true}/{tf_total} tf answers are true ({tf_true / tf_total:.0%}, want 40–60%)")

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
    for d in ordered:
        account = stated_account(d)
        for i, s in enumerate(d["screens"], 1):
            if s.get("type") == "chart-decision":
                vals = set(PER_SHARE_RE.findall(str(s.get("outcome") or "")))
                outcome_values.extend(vals)
                shares = s.get("shares")
                price = decision_price(s)
                if account and isinstance(shares, (int, float)) and isinstance(price, (int, float)):
                    value = shares * price
                    if value > account:
                        rep.cwarn(d["_file"], f"screen {i}: {shares:,} shares × ${price:.2f} = ${value:,.0f} "
                                              f"exceeds the ${account:,} account named in this file")
            if is_path_chapter:
                vol = sorted(v for v in ((s.get("chart") or {}).get("volume") or [])
                             if isinstance(v, (int, float)))
                if vol:
                    median = vol[len(vol) // 2]
                    if not VOLUME_MIN <= median <= VOLUME_MAX:
                        rep.cwarn(d["_file"], f"screen {i}: typical bar volume {median:,.0f} outside "
                                              f"{VOLUME_MIN:,}–{VOLUME_MAX:,} per bar")
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


def main():
    status = "--status" in sys.argv
    strict = "--strict" in sys.argv
    rep = Report(strict=strict)
    chapters = defaultdict(list)
    for path in sorted(CONTENT.rglob("level-*.yaml")):
        try:
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as e:
            rep.err(path.relative_to(ROOT), f"YAML error: {e}")
            continue
        data = validate_file(path, data, rep)
        if data:
            data["_file"] = path.relative_to(ROOT)
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
        validate_chapter_v3(folder, files, rep)
    validate_tiers(chapters, rep)
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
    mode = " (--strict: chapter-level warnings are errors)" if rep.strict else ""
    print(f"\n{len(chapters)} chapters, {sum(len(v) for v in chapters.values())} files, "
          f"{len(rep.errors)} errors, {len(rep.warnings)} warnings{mode}")
    if not rep.strict and rep.chapter_warnings:
        print(f"{rep.chapter_warnings} of those are chapter-level v3 warnings; "
              f"run with --strict to fail on them.")
    sys.exit(1 if rep.errors else 0)


if __name__ == "__main__":
    main()
