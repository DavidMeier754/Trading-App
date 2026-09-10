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
