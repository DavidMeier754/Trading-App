#!/usr/bin/env python3
"""Validate lesson YAML files against docs/schema.md. Usage:
  python3 tools/validate_content.py            # errors + warnings, exit 1 on errors
  python3 tools/validate_content.py --status   # chapter statistics
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
}
QUESTION = {
    "mc", "tf", "numeric-mc", "numeric-input", "fill-tiles", "fill-choice",
    "match", "sort", "order", "hotspot", "slider", "chart-tap",
    "chart-decision", "spot-mistake",
}
INTERACTIVE = {
    "hotspot", "chart-tap", "chart-decision", "walkthrough", "visual",
    "spot-mistake", "slider", "order", "sort",
}
SECONDS = {
    "intro": 8, "theory": 10, "example": 10, "carousel": 10, "walkthrough": 10,
    "visual": 12, "checklist-reveal": 8, "story": 10, "summary": 10, "badge": 10,
    "path-choice": 15, "match": 18, "sort": 18, "order": 18, "chart-decision": 20,
}
REQUIRED = [
    "id", "title", "chapter", "chapter_title", "path", "category", "tags",
    "learning_goal", "purpose", "terms_introduced", "xp", "difficulty",
    "sources", "screens",
]


def screen_units(s):
    if s["type"] == "carousel":
        return len(s.get("cards", []))
    if s["type"] == "walkthrough":
        return len(s.get("steps", []))
    if s["type"] == "checklist-reveal":
        return max(1, len(s.get("items", [])) // 2)
    return 1


def screen_seconds(s):
    t = s["type"]
    if t in ("carousel", "walkthrough"):
        return 10 * screen_units(s)
    if t == "checklist-reveal":
        return 8 * len(s.get("items", []))
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
    return " ".join(parts)


def level_key(lvl_id):
    a, b = lvl_id.split("-")
    return (int(a), int(b))


class Report:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def err(self, f, msg):
        self.errors.append(f"{f}: {msg}")

    def warn(self, f, msg):
        self.warnings.append(f"{f}: {msg}")


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
            if not s.get("explanation"):
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
        if t == "numeric-input" and not isinstance(s.get("answer"), (int, float)):
            rep.err(f, f"screen {i}: numeric-input.answer must be a number")
        if t == "spot-mistake":
            segs = s.get("segments") or []
            if sum(1 for x in segs if x.get("wrong")) != 1:
                rep.err(f, f"screen {i}: spot-mistake needs exactly one wrong segment")
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
        if not 10 <= units <= 16:
            rep.err(f, f"{units} screens (tests/exams need 10–16)")
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


def validate_chapter(folder, files, rep):
    ids = {d["id"]: d for d in files}
    ordered = sorted(files, key=lambda d: level_key(d["id"]))
    for d in ordered:
        p = d.get("prerequisite")
        if p is not None and p not in ids:
            rep.err(d["_file"], f"prerequisite '{p}' not found in chapter")
    # use-before-definition
    introduced_at = {}
    for d in ordered:
        for term in d.get("terms_introduced") or []:
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


def main():
    status = "--status" in sys.argv
    rep = Report()
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
    for folder, files in chapters.items():
        validate_chapter(folder, files, rep)
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
    print(f"\n{len(chapters)} chapters, {sum(len(v) for v in chapters.values())} files, "
          f"{len(rep.errors)} errors, {len(rep.warnings)} warnings")
    sys.exit(1 if rep.errors else 0)


if __name__ == "__main__":
    main()
