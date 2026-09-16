#!/usr/bin/env python3
"""Self-test for validate_content.py. Usage: python3 tools/test_validate.py

Feeds deliberately broken screens and files through the validator and asserts that
each rule fires. A validator whose checks silently stop firing is worse than none,
so every rule added to validate_content.py should get a case here.

Requires only PyYAML, like the validator itself. Exit 0 = all rules fire.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import validate_content as V  # noqa: E402

CHAPTER = pathlib.Path(V.ROOT) / "content/paths/scalping/chapter-03-x"
results = []


def expect(name, run, substring):
    """Run `run(report)` and assert some message contains `substring`."""
    rep = V.Report()
    run(rep)
    msgs = rep.errors + rep.warnings
    hit = any(substring.lower() in m.lower() for m in msgs)
    results.append(hit)
    print(f"{'PASS' if hit else 'FAIL':<5} {name}")
    if not hit:
        print(f"      expected {substring!r}, got: {msgs or '(nothing)'}")


def expect_no(name, run, substring):
    """Assert a rule does NOT fire on valid input. Other, unrelated findings are fine —
    the fixtures are minimal, so only the rule under test is asserted."""
    rep = V.Report()
    run(rep)
    msgs = rep.errors + rep.warnings
    hit = [m for m in msgs if substring.lower() in m.lower()]
    results.append(not hit)
    print(f"{'PASS' if not hit else 'FAIL':<5} {name}")
    if hit:
        print(f"      {substring!r} should not have fired: {hit}")


# --------------------------------------------------------------------------
# fixtures
# --------------------------------------------------------------------------

def question(screen):
    return lambda rep: V.validate_new_question("f.yaml", 1, screen, rep)


def lesson(**over):
    """A minimal valid lesson: intro + 11 theory + 1 mc = 13 screens."""
    d = {
        "id": "3-1", "title": "T", "chapter": 3, "chapter_title": "C", "path": "scalping",
        "category": "new-theory", "tags": [], "learning_goal": "g", "purpose": "p",
        "terms_introduced": [], "xp": 20, "difficulty": 1, "sources": ["consensus"],
        "screens": [{"type": "intro", "text": "x"}] + [{"type": "theory", "body": "b"}] * 11 +
                   [{"type": "mc", "prompt": "p",
                     "options": [{"text": "a", "correct": True}, {"text": "b"}], "explanation": "e"}],
    }
    d.update(over)
    return d


def exam(nq, category):
    """An exam with `nq` questions, alternating type so no mc run trips."""
    qs = []
    for i in range(nq):
        qs.append({"type": "tf", "statement": f"s{i}", "answer": i % 4 == 0, "explanation": "e"}
                  if i % 2 else
                  {"type": "mc", "prompt": f"p{i}",
                   "options": [{"text": "a", "correct": True}, {"text": "b"}], "explanation": "e"})
    return lesson(category=category,
                  screens=[{"type": "intro", "text": "x", "counter": nq}] + qs +
                          [{"type": "summary", "total": nq}, {"type": "badge", "name": "b", "unlocks": "u"}])


def check_file(data, name="level-03-1.yaml"):
    return lambda rep: V.validate_file(CHAPTER / name, data, rep)


def check_chapter(files):
    def run(rep):
        for d in files:
            d.setdefault("_file", f"level-{d['id']}.yaml")
            d.setdefault("_nq", sum(1 for s in d["screens"] if s.get("type") in V.QUESTION))
            d.setdefault("_units", len(d["screens"]))
        V.validate_chapter_v3(CHAPTER, files, rep)
    return run


def sub(i, **over):
    return lesson(id=f"{i}-1", **over)


CANDLES = {"kind": "candles", "data": [[20, 20.2, 19.9, 20.1]] * 10, "decision_index": 5}


# --------------------------------------------------------------------------
print("— v3 question type shapes —")
expect("swipe-deck: too few cards", question({"type": "swipe-deck", "cards": [{"answer": "take"}] * 3}), "4–8 cards")
expect("swipe-deck: bad card answer", question({"type": "swipe-deck", "cards": [{"answer": "maybe"}] * 5}), "take or pass")
expect("chart-annotate: missing tolerance", question({"type": "chart-annotate", "answer": 26.4}), "tolerance")
expect("chart-annotate: non-numeric answer", question({"type": "chart-annotate", "answer": "the high", "tolerance": 0.04}), "answer must be a price")
expect("order-build: answer key not a slot", question({"type": "order-build", "slots": ["side"], "answer": {"side": "buy", "price": 1}, "chips": {}}), "do not match slots")
expect("order-build: answer not among chips", question({"type": "order-build", "slots": ["side"], "answer": {"side": "buy"}, "chips": {"side": ["sell"]}}), "not among its chips")
expect("scanner-pick: target not in rows", question({"type": "scanner-pick", "data": {"rows": [{"ticker": "ABC"}]}, "target": "XYZ"}), "not a ticker in rows")
expect("compare: answer not a label", question({"type": "compare", "charts": [{"label": "A"}, {"label": "B"}], "answer": "C"}), "not a chart label")
expect("compare: neither without allow_neither", question({"type": "compare", "charts": [{"label": "A"}, {"label": "B"}], "answer": "neither"}), "allow_neither")
expect("branch: wrong step count", question({"type": "branch", "steps": [{"options": [{"correct": True}], "explanation": "x"}]}), "2–4 steps")
expect("branch: two correct in one step", question({"type": "branch", "steps": [{"options": [{"correct": True}, {"correct": True}], "explanation": "x"}, {"options": [{"correct": True}], "explanation": "y"}]}), "exactly one correct")
expect("branch: step missing explanation", question({"type": "branch", "steps": [{"options": [{"correct": True}]}, {"options": [{"correct": True}], "explanation": "y"}]}), "missing explanation")
expect("journal-row: answer keys mismatch slots", question({"type": "journal-row", "slots": ["grade"], "answer": {"r_made": "+2R"}, "chips": {}}), "do not match slots")
expect("depth-ladder: target off the book", question({"type": "depth-ladder", "data": {"asks": [[20.02, 500]]}, "target": "ask-3"}), "not in the book")
expect("depth-ladder: malformed target", question({"type": "depth-ladder", "data": {"asks": [[1, 2]]}, "target": "top"}), "must look like")
expect_no("swipe-deck: valid deck passes", question({"type": "swipe-deck", "cards": [{"answer": "take"}, {"answer": "pass"}] * 2}), "swipe-deck")
expect_no("depth-ladder: valid target passes", question({"type": "depth-ladder", "data": {"asks": [[20.02, 500], [20.03, 100]]}, "target": "ask-2"}), "depth-ladder")

print("\n— header and screen rules —")
expect("reinforces: not lower than own chapter", check_file(lesson(reinforces=[3])), "not lower than this chapter")
expect("reinforces: duplicates", check_file(lesson(reinforces=[1, 1])), "duplicates")
expect("reinforces: wrong type", check_file(lesson(reinforces="1,2")), "list of chapter numbers")
expect("path_position: bad value", check_file(lesson(path_position="sideways")), "bad path_position")
expect("chart-decision: no-trade punished", check_file(lesson(
    screens=[{"type": "intro", "text": "x"}] + [{"type": "theory", "body": "b"}] * 11 +
            [{"type": "chart-decision", "prompt": "p", "explanation": "e", "best": "long",
              "reasonable": ["short"], "outcome": "+$0.20", "shares": 100, "chart": CANDLES}])),
    "must contain 'no-trade'")
expect("final-exam: too few screens", check_file(exam(8, "final-exam")), "final-exam needs 12–18")
expect("test: too many screens", check_file(exam(15, "test")), "test needs 10–16")
expect_no("final-exam: 16 screens is fine", check_file(exam(13, "final-exam")), "final-exam needs")
expect_no("test: 12 screens is fine", check_file(exam(10, "test")), "test needs")

print("\n— chapter-level rules —")
expect("chapter: too few levels", check_chapter([sub(i) for i in range(1, 5)]), "levels (v3 wants at least 15)")
expect("chapter: position exceeds account", check_chapter([sub(1, screens=[
    {"type": "intro", "text": "You have a $5,000 account."},
    {"type": "chart-decision", "prompt": "p", "explanation": "e", "best": "no-trade",
     "outcome": "flat", "shares": 1000, "chart": CANDLES}])]), "exceeds the $5,000 account")
expect("chapter: thin bar volume", check_chapter([sub(1, screens=[
    {"type": "chart-decision", "prompt": "p", "explanation": "e", "best": "no-trade", "outcome": "flat",
     "chart": dict(CANDLES, volume=[900] * 10)}])]), "typical bar volume")
expect_no("chapter: a single climax bar is not flagged", check_chapter([sub(i, screens=[
    {"type": "chart-decision", "prompt": "p", "explanation": "e", "best": "no-trade", "outcome": f"flat {i}",
     "chart": dict(CANDLES, volume=[200_000] * 9 + [900_000])}]) for i in range(1, 16)]), "typical bar volume")
expect("chapter: tf answers skewed", check_chapter([sub(i, screens=[
    {"type": "tf", "statement": "s", "answer": False, "explanation": "e"}]) for i in range(1, 11)]), "tf answers are true")
expect("chapter: correct-option position skew", check_chapter([sub(i, screens=[
    {"type": "mc", "prompt": f"p{i}", "options": [{"text": "a", "correct": True}, {"text": "b"}, {"text": "c"}],
     "explanation": "e"}]) for i in range(1, 11)]), "correct option is at position 1")
expect("chapter: longest-is-correct tell", check_chapter([sub(i, screens=[
    {"type": "mc", "prompt": f"p{i}", "options": [{"text": "a" * 40, "correct": True}, {"text": "b"}, {"text": "c"}],
     "explanation": "e"}]) for i in range(1, 11)]), "correct option is the longest")
expect("chapter: outcome value clustering", check_chapter([sub(i, screens=[
    {"type": "chart-decision", "prompt": "p", "explanation": "e", "best": "no-trade",
     "outcome": "You make $0.28 a share.", "chart": CANDLES}]) for i in range(1, 11)]), "per-share outcome $0.28")
expect("chapter: no callback level", check_chapter([sub(i) for i in range(1, 20)]), "no Callback level")
expect("chapter: difficulty run", check_chapter([sub(i, difficulty=2) for i in range(1, 20)]), "consecutive sub-levels at difficulty 2")
expect("chapter: reinforcement quota", check_chapter([sub(i) for i in range(1, 20)]), "sit in subs declaring reinforces")
expect("chapter: exam declares no reinforces", check_chapter([exam(10, "final-exam")]), "declares no reinforces")

# --------------------------------------------------------------------------
print("\n— chain, tiers and phrasing —")


def check_chain(files):
    def run(rep):
        for d in files:
            d.setdefault("_file", f"level-{d['id']}.yaml")
        V.validate_chapter(CHAPTER, files, rep, set())
    return run


def chained(*ids, **over):
    """Subs wired into a chain; `over` maps an id to header overrides."""
    out = []
    for i, lid in enumerate(ids):
        d = lesson(id=lid, prerequisite=(ids[i - 1] if i else None))
        d.update(over.get(lid, {}))
        out.append(d)
    return out


expect("chain: prerequisite skips a sub",
       check_chain(chained("1-1", "1-2", "2-1", **{"2-1": {"prerequisite": "1-1"}})),
       "skips sub-level")
expect_no("chain: straight chain is fine",
          check_chain(chained("1-1", "1-2", "2-1")), "skips sub-level")
expect_no("chain: fan-out strand may reach back",
          check_chain(chained("8-1", "9-1", "10-1",
                              **{"10-1": {"prerequisite": "8-1", "path_position": "fan-out:levels"}})),
          "skips sub-level")


def review_run(*categories):
    """A chapter whose subs carry the given categories, in order."""
    ids = [f"{i}-1" for i in range(1, len(categories) + 1)]
    files = chained(*ids)
    for d, cat in zip(files, categories):
        d["category"] = cat
    return check_chain(files)


REP, NEW, TEST = "repetition", "test", "final-exam"
# Six repetition subs with nothing new between them is one more than the curriculum's
# own worst case (Chapter 7: Capstone 3 + Chapter Review 2).
expect("review run: six repetition subs in a row",
       review_run(NEW, *[REP] * 6, NEW),
       "repetition sub-levels in a row")
# A Checkpoint is a distinct event, not new material: it must not launder a long run.
expect("review run: a test does not clear the counter",
       review_run(NEW, *[REP] * 3, TEST, *[REP] * 3),
       "repetition sub-levels in a row")
# The curriculum's worst case must stay silent, exam tail included.
expect_no("review run: Capstone (3) + Chapter Review (2) + Final Exam passes",
          review_run(NEW, NEW, REP, REP, REP, REP, REP, TEST),
          "repetition sub-levels in a row")
expect_no("review run: Practice (2) then a Checkpoint passes",
          review_run(NEW, REP, REP, TEST, NEW),
          "repetition sub-levels in a row")


def tier_chapters(*awards):
    """awards: (path, tier, filename) tuples, one tier-up screen each."""
    files = []
    for path, tier, name in awards:
        files.append({"path": path, "_file": name,
                      "screens": [{"type": "tier-up", "tier": tier}]})
    return {pathlib.Path(f["_file"]).parent: [f] for f in files}


expect("tiers: same tier twice on one path",
       lambda rep: V.validate_tiers(tier_chapters(("scalping", "Observer", "a/l.yaml"),
                                                  ("scalping", "Observer", "b/l.yaml")), rep),
       "also awarded in")
expect("tiers: shared chapter collides with a path",
       lambda rep: V.validate_tiers(tier_chapters(("all", "Observer", "a/l.yaml"),
                                                  ("scalping", "Observer", "b/l.yaml")), rep),
       "also awarded in")
expect_no("tiers: two paths may share a tier name",
          lambda rep: V.validate_tiers(tier_chapters(("scalping", "Observer", "a/l.yaml"),
                                                     ("swing-trading", "Observer", "b/l.yaml")), rep),
          "also awarded in")


def decisions(n, outcome, scenario):
    """One sub carrying `n` chart-decisions, plus filler to keep the shape legal."""
    screens = [{"type": "intro", "text": "x"}]
    for i in range(n):
        screens.append({"type": "chart-decision", "explanation": "e", "best": "no-trade",
                        "chart": CANDLES, "shares": 100,
                        "outcome": outcome(i), "scenario": scenario(i)})
    return [lesson(id="1-1", screens=screens)]


expect("phrasing: outcome repeated verbatim",
       check_chapter(decisions(12, lambda i: "It ran to $17.40 — +$120 on 800 shares.",
                                   lambda i: f"Chart {i}. Long or short?")),
       "used verbatim")
expect("phrasing: too few outcome shapes",
       check_chapter(decisions(12, lambda i: f"It ran to ${17 + i}.40 — +${100 + i} on 800 shares.",
                                   lambda i: f"Chart {i} is a fresh one. Question {i}?")),
       "outcome sentence shapes")
expect("phrasing: scenarios end on one shape",
       check_chapter(decisions(12, lambda i: f"Outcome number {i} phrased its own way entirely here.",
                                   lambda i: f"Chart {i}. Your account is ${i} and you are sizing {i} shares.")),
       "end on the same sentence shape")
expect_no("phrasing: varied scenarios pass",
          check_chapter(decisions(12,
                                  lambda i: f"Outcome {i} phrased its own way entirely, differently again.",
                                  lambda i: f"Chart {i}. " + ["Long or short?", "What now?", "Take it?",
                                                              "Which side?"][i % 4])),
          "end on the same sentence shape")

expect("phrasing: one prompt dominates a question type",
       check_chapter([lesson(id="1-1", screens=[{"type": "intro", "text": "x"}] +
                             [{"type": "spot-mistake", "prompt": "Tap the mistake.",
                               "segments": [{"text": "a"}, {"text": "b", "wrong": True}],
                               "explanation": "e"}] * 12)]),
       "uses the same prompt")


print("\n— the plan (plan-card keys vs plan-sheet lines) —")


def planfile(i, screens, chapter=7, path="scalping"):
    return lesson(id=f"{i}-1", chapter=chapter, path=path, screens=screens)


def card(*keys, slot=None):
    s = {"type": "plan-card", "title": "t",
         "fields": [{"key": k, "label": k, "kind": "text"} for k in keys]}
    if slot:
        s["slot"] = slot
    return s


def sheet(*fields, slot=None):
    """fields are (key, value): a value makes it a specimen line, None a learner line."""
    fl = []
    for k, v in fields:
        f = {"key": k, "label": k}
        if v is not None:
            f["value"] = v
        fl.append(f)
    data = {"fields": fl}
    if slot:
        data["slot"] = slot
    return {"type": "visual", "component": "plan-sheet", "data": data, "caption": "c"}


def plan(*files):
    def run(rep):
        for d in files:
            d.setdefault("_file", f"level-{d['id']}.yaml")
        V.validate_plan({CHAPTER: list(files)}, rep)
    return run


expect("plan: sheet renders a key no card writes",
       plan(planfile(1, [card("session_trade_cap")]), planfile(2, [sheet(("made_up_line", None))])),
       "no plan-card")
expect("plan: learner line shown before its card",
       plan(planfile(1, [sheet(("session_trade_cap", None))]), planfile(2, [card("session_trade_cap")])),
       "before it is written")
expect_no("plan: a specimen line may precede its card",
          plan(planfile(1, [sheet(("session_trade_cap", "6"))]), planfile(2, [card("session_trade_cap")])),
          "before it is written")
expect_no("plan: a card earlier in the same sub-level counts",
          plan(planfile(1, [card("setup_name"), sheet(("setup_name", None))])),
          "setup_name")
expect_no("plan: the shared chapter feeds every path",
          plan(planfile(1, [card("setup_name")], chapter=1, path="all"),
               planfile(2, [sheet(("setup_name", None))], chapter=2)),
          "setup_name")
expect("plan: a slotted sheet needs that slot's card",
       plan(planfile(1, [card("stop", slot="a")]), planfile(2, [sheet(("stop", None), slot="b")])),
       "card.b.stop")
expect_no("plan: a slotted card feeds its own slotted sheet",
          plan(planfile(1, [card("stop", slot="c")]), planfile(2, [sheet(("stop", None), slot="c")])),
          "card.c.stop")
expect("plan: the draft row does not fill the cards list",
       plan(planfile(1, [card("name", slot="draft")]), planfile(2, [sheet(("cards", None))])),
       "renders plan key 'cards'")
expect_no("plan: a named card fills the cards list",
          plan(planfile(1, [card("name", slot="a")]), planfile(2, [sheet(("cards", None))])),
          "'cards'")


print("\n— strict mode —")
strict = V.Report(strict=True)
check_chapter([sub(1)])(strict)
promoted = bool(strict.errors) and not strict.warnings
results.append(promoted)
print(f"{'PASS' if promoted else 'FAIL':<5} --strict promotes chapter warnings to errors "
      f"({len(strict.errors)} errors, {len(strict.warnings)} warnings)")

# Chapter 1 has no earlier chapter, so the reinforcement quotas must not apply to it.
ch1 = V.Report()
V.validate_chapter_v3(pathlib.Path(V.ROOT) / "content/shared/chapter-01-x",
                      [dict(sub(i, chapter=1), _file=f"level-{i}.yaml", _nq=1, _units=13) for i in range(1, 20)], ch1)
no_quota = not any("reinforces" in m for m in ch1.errors + ch1.warnings)
results.append(no_quota)
print(f"{'PASS' if no_quota else 'FAIL':<5} reinforcement quota skips Chapter 1")

print(f"\n{sum(results)}/{len(results)} checks pass")
sys.exit(0 if all(results) else 1)
