#!/usr/bin/env python3
"""Self-test for validate_content.py. Usage: python3 tools/test_validate.py

Feeds deliberately broken screens and files through the validator and asserts that
each rule fires. A validator whose checks silently stop firing is worse than none,
so every rule added to validate_content.py should get a case here.

Requires only PyYAML, like the validator itself. Exit 0 = all rules fire.
"""
import pathlib
import sys
from collections import defaultdict

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
        "terms_introduced": [], "skills": ["Reading a quote"], "xp": 20, "difficulty": 1,
        "sources": ["consensus"],
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
    return lesson(category=category, skills=[],
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
LADDER = {"type": "depth-ladder", "data": {"asks": [[20.02, 500], [20.03, 2200], [20.04, 900]]}, "target": "ask-2"}
expect("depth-ladder: shares that fill before the target", question(dict(LADDER, shares=400)), "fill to before ask-2")
expect("depth-ladder: shares that fill past the target", question(dict(LADDER, shares=3000)), "fill to past ask-2")
expect("depth-ladder: shares not a whole number", question(dict(LADDER, shares=12.5)), "positive whole number")
expect_no("depth-ladder: shares that end on the target pass", question(dict(LADDER, shares=1000)), "shares")

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
# agent.md §3.6: one position, at most 95 % of the account named in the same file.
expect("chapter: position over the 95 % cap", check_chapter([sub(1, screens=[
    {"type": "intro", "text": "You have a $5,000 account."},
    {"type": "chart-decision", "prompt": "p", "explanation": "e", "best": "no-trade",
     "outcome": "flat", "shares": 240, "chart": CANDLES}])]),
    "over the 95% cap on one position")
expect_no("chapter: a position inside the cap passes", check_chapter([sub(1, screens=[
    {"type": "intro", "text": "You have a $5,000 account."},
    {"type": "chart-decision", "prompt": "p", "explanation": "e", "best": "no-trade",
     "outcome": "flat", "shares": 230, "chart": CANDLES}])]),
    "over the 95% cap on one position")
# A branch puts the learner in stock too, so both ceilings reach it.
expect("chapter: branch position exceeds the account", check_chapter([sub(1, screens=[
    {"type": "intro", "text": "You have a $5,000 account."},
    {"type": "branch", "scenario": "s", "shares": 1000, "chart": CANDLES,
     "steps": [{"prompt": "p", "options": [{"text": "a", "correct": True}], "explanation": "e"},
               {"prompt": "q", "options": [{"text": "b", "correct": True}], "explanation": "e"}]}])]),
    "exceeds the $5,000 account")
expect("chapter: branch position over the 95 % cap", check_chapter([sub(1, screens=[
    {"type": "intro", "text": "You have a $5,000 account."},
    {"type": "branch", "scenario": "s", "shares": 240, "chart": CANDLES,
     "steps": [{"prompt": "p", "options": [{"text": "a", "correct": True}], "explanation": "e"},
               {"prompt": "q", "options": [{"text": "b", "correct": True}], "explanation": "e"}]}])]),
    "over the 95% cap on one position")
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


def split(longs, shorts, notrades=0):
    """A chapter whose chart-decisions resolve to the given long/short/no-trade split."""
    bests = ["long"] * longs + ["short"] * shorts + ["no-trade"] * notrades
    screens = [{"type": "intro", "text": "x"}]
    for i, best in enumerate(bests):
        screens.append({"type": "chart-decision", "explanation": "e", "best": best,
                        "reasonable": ["no-trade"], "shares": 100, "chart": CANDLES,
                        "outcome": f"Outcome {i}, phrased entirely its own way here.",
                        "scenario": f"Chart {i}. " + ["Long or short?", "What now?",
                                                      "Take it?", "Which side?"][i % 4]})
    return [lesson(id="1-1", screens=screens)]


expect("chapter: long/short split skewed", check_chapter(split(9, 1)),
       "resolve 9 long to 1 short")
expect("chapter: only one direction taught", check_chapter(split(8, 0)),
       "one side only")
expect_no("chapter: an even 2:1 split passes", check_chapter(split(8, 4)),
          "want no worse than 2:1")
expect_no("chapter: no-trade is not part of the split", check_chapter(split(8, 4, notrades=20)),
          "want no worse than 2:1")
expect_no("chapter: too few directional decisions to judge", check_chapter(split(6, 0)),
          "want no worse than 2:1")

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


print("\n— drill packs —")

# The sub-level index a pack's `unlocked_by` is resolved against, as main() builds it.
DRILL_IDX = {("scalping", 3): {"19-1", "18-2"}, ("all", 1): {"17-1"}}


def q(i=0, **over):
    """One valid drill screen: a true/false, alternating so a pack's split stays even."""
    d = {"type": "tf", "statement": f"s{i}", "answer": i % 2 == 0, "explanation": "e"}
    d.update(over)
    return d


def pack(screens=None, **over):
    d = {
        "id": "scalping-cost-check", "path": "scalping", "title": "Cost and size drills",
        "unlocked_by": "19-1", "unlocked_by_chapter": 3, "tags": ["costs"],
        "concepts": ["Spread"],
        "screens": screens if screens is not None else [
            [q(i),
             {"type": "numeric-input", "prompt": f"p{i}", "answer": i, "explanation": "e"},
             {"type": "fill-choice", "sentence": f"a ___ {i}", "options": ["limit", "market"],
              "answer": "limit", "explanation": "e"},
             {"type": "chart-decision", "explanation": "e", "best": "long",
              "reasonable": ["no-trade"], "outcome": f"o{i}", "scenario": f"c{i}",
              "chart": CANDLES}][i % 4]
            for i in range(12)
        ],
    }
    d.update(over)
    return d


PACKFILE = pathlib.Path(V.ROOT) / "content/drills/scalping/cost-check.yaml"


def check_pack(data, name=PACKFILE):
    def run(rep):
        V.validate_drill_pack(pathlib.Path(name), data, rep, DRILL_IDX)
    return run


def check_hygiene(data):
    def run(rep):
        d = V.validate_drill_pack(PACKFILE, data, rep, DRILL_IDX)
        if d:
            V.validate_drill_hygiene(d, rep)
    return run


expect("pack: a lesson screen in a drill pack",
       check_pack(pack(screens=[{"type": "intro", "text": "x"}] + [q(i) for i in range(11)])),
       "a drill pack holds question screens only")
expect("pack: a theory screen in a drill pack",
       check_pack(pack(screens=[q(i) for i in range(11)] + [{"type": "theory", "body": "b"}])),
       "is a lesson screen")
expect("pack: too few screens", check_pack(pack(screens=[q(i) for i in range(9)])),
       "9 screens (a pack holds 10–40)")
expect("pack: too many screens", check_pack(pack(screens=[q(i) for i in range(41)])),
       "41 screens (a pack holds 10–40)")
expect("pack: unlocked_by names no sub-level",
       check_pack(pack(unlocked_by="42-9")), "is not a sub-level of chapter 3")
expect("pack: unlocked_by in the wrong chapter",
       check_pack(pack(unlocked_by_chapter=2)), "is not a sub-level of chapter 2")
expect("pack: unlocked_by malformed", check_pack(pack(unlocked_by="Ch3 exam")),
       "must be a sub-level id")
expect_no("pack: the shared chapter unlocks every path",
          check_pack(pack(unlocked_by="17-1", unlocked_by_chapter=1)), "unlocked_by")
expect("pack: id is not <path>-<slug>", check_pack(pack(id="cost-check")),
       "is not '<path>-<slug>'")
expect("pack: a pack may not be for every path", check_pack(pack(path="all")),
       "a drill pack belongs to one path")
expect("pack: wrong folder for its path",
       check_pack(pack(), name=pathlib.Path(V.ROOT) / "content/drills/day-trading/cost-check.yaml"),
       "belongs in content/drills/scalping/")
expect("pack: empty concept list", check_pack(pack(concepts=[])),
       "concepts must be a non-empty list")
expect("pack: a screen's own shape is still checked",
       check_pack(pack(screens=[q(i) for i in range(11)] +
                       [{"type": "mc", "prompt": "p", "options": [{"text": "a"}], "explanation": "e"}])),
       "needs exactly one correct option")
expect("pack: no-trade punished inside a pack",
       check_pack(pack(screens=[q(i) for i in range(11)] +
                       [{"type": "chart-decision", "explanation": "e", "best": "long",
                         "reasonable": ["short"], "outcome": "o", "shares": 100, "chart": CANDLES}])),
       "must contain 'no-trade'")
expect("pack: too few question types",
       check_pack(pack(screens=[q(i) for i in range(12)])), "question type(s) in the pack")
expect_no("pack: a valid pack passes", check_pack(pack()), "cost-check.yaml")

print("\n— drill pack hygiene (agent.md §3.5, §3.6) —")
MC = {"type": "mc", "prompt": "p", "options": [{"text": "a", "correct": True}, {"text": "b"},
                                               {"text": "c"}], "explanation": "e"}
expect("pack: correct-option position skew",
       check_hygiene(pack(screens=[dict(MC, prompt=f"p{i}") for i in range(12)])),
       "correct option is at position 1")
expect("pack: tf answers skewed",
       check_hygiene(pack(screens=[q(i, answer=False, statement=f"s{i}") for i in range(12)])),
       "tf answers are true")
expect("pack: the number-only-in-the-answer tell",
       check_hygiene(pack(screens=[
           {"type": "mc", "prompt": f"p{i}",
            "options": [{"text": "wait for it"}, {"text": "$0.04 a share", "correct": True},
                        {"text": "nothing at all"}], "explanation": "e"} for i in range(12)])),
       "the only one carrying a number")
expect("pack: long/short balance", check_hygiene(pack(screens=[
    {"type": "chart-decision", "explanation": "e", "best": "long", "reasonable": ["no-trade"],
     "outcome": f"o{i}", "shares": 100, "chart": CANDLES, "scenario": f"c{i}"} for i in range(9)] +
    [q(i) for i in range(3)])), "one side only")
expect("pack: position over the 95 % cap", check_hygiene(pack(screens=[q(i) for i in range(11)] + [
    {"type": "chart-decision", "explanation": "e", "best": "no-trade", "outcome": "flat",
     "scenario": "You have a $5,000 account.", "shares": 240, "chart": CANDLES}])),
    "over the 95% cap on one position")
# A screen that names no account is measured against the smallest the pack names, so a
# drill cannot borrow a bigger account from three screens away.
expect("pack: a screen that names no account falls back to the pack's smallest",
       check_hygiene(pack(screens=[
           {"type": "chart-decision", "explanation": "e", "best": "no-trade", "outcome": "flat",
            "scenario": "A $5,000 account. Nothing to do here.", "shares": 100, "chart": CANDLES},
           {"type": "chart-decision", "explanation": "e", "best": "no-trade", "outcome": "flat",
            "scenario": "1,400 shares ready.", "shares": 1400, "chart": CANDLES}] +
           [q(i) for i in range(10)])),
       "exceeds the $5,000 account behind it")
expect("pack: thin bar volume", check_hygiene(pack(screens=[q(i) for i in range(11)] + [
    {"type": "chart-decision", "explanation": "e", "best": "no-trade", "outcome": "flat",
     "chart": dict(CANDLES, volume=[900] * 10)}])), "typical bar volume")
expect("pack: no near-misses at all", check_hygiene(pack(screens=[
    {"type": "chart-decision", "explanation": "e", "best": "long" if i % 2 else "short",
     "reasonable": ["no-trade"], "outcome": f"o{i}", "shares": 100, "chart": CANDLES,
     "scenario": f"c{i}"} for i in range(10)] + [q(i) for i in range(2)])),
    "resolve to no-trade")
expect("pack: the same drill twice", check_hygiene(pack(screens=[
    q(i, type="numeric-input", prompt="What is the spread?", answer=i, statement=None)
    for i in range(2)] + [q(i) for i in range(10)])), "repeats screen")

print("\n— drill manifest —")
ENTRY = {
    "id": "scalping-cost-check", "slug": "cost-check",
    "file": "content/drills/scalping/cost-check.yaml", "path": "scalping",
    "title": "Cost and size drills", "unlocked_by": "19-1", "unlocked_by_chapter": 3,
    "screens": 20, "tags": ["costs"], "concepts": ["Spread"], "exemplars": [],
}


def manifest(entries, written=()):
    def run(rep):
        V.validate_drill_manifest(rep, entries, list(written), DRILL_IDX)
    return run


expect("manifest: missing field", manifest([{k: v for k, v in ENTRY.items() if k != "title"}]),
       "missing title")
expect("manifest: duplicate pack id", manifest([ENTRY, ENTRY]), "duplicate pack id")
expect("manifest: unlocked_by does not exist",
       manifest([dict(ENTRY, unlocked_by="99-1")]), "is not a sub-level of chapter 3")
expect("manifest: commissioned size out of range",
       manifest([dict(ENTRY, screens=60)]), "60 screens")
expect("manifest: exemplar file missing",
       manifest([dict(ENTRY, exemplars=[{"file": "content/paths/scalping/nope.yaml",
                                         "screen": 1, "role": "straightforward"}])]),
       "does not exist")
expect("manifest: exemplar screen out of range",
       manifest([dict(ENTRY, exemplars=[
           {"file": "content/paths/scalping/chapter-03-orders-costs-position-size/level-03-1.yaml",
            "screen": 999, "role": "straightforward"}])]), "has no screen 999")
expect("manifest: exemplar is not a question screen",
       manifest([dict(ENTRY, exemplars=[
           {"file": "content/paths/scalping/chapter-03-orders-costs-position-size/level-03-1.yaml",
            "screen": 1, "role": "straightforward"}])]), "not a question")
expect("manifest: a pack nobody commissioned",
       manifest([], written=[dict(pack(), _file="cost-check.yaml", _screens=[])]),
       "has no entry in")
expect("manifest: written pack contradicts its entry",
       manifest([ENTRY], written=[dict(pack(unlocked_by="18-2"), _file="cost-check.yaml",
                                       _screens=[])]),
       "the manifest commissioned '19-1'"),
expect("manifest: written pack is the wrong size",
       manifest([ENTRY], written=[dict(pack(), _file="cost-check.yaml", _screens=[1] * 12)]),
       "the manifest commissioned 20")
expect("manifest: written pack drops a concept",
       manifest([dict(ENTRY, concepts=["Spread", "Slippage"])],
                written=[dict(pack(), _file="cost-check.yaml", _screens=[])]),
       "drops concept(s)")
expect_no("manifest: a matching pair passes",
          manifest([ENTRY], written=[dict(pack(), _file="cost-check.yaml", _screens=[1] * 20)]),
          "manifest")


print("\n— component data (schema.md table, stage STABLE-DATA) —")


def data(screen):
    return lambda rep: V.validate_screen_data("f.yaml", 1, screen, rep)


BARS = [[10.0, 10.2, 9.9, 10.1]] * 3
BOOK = {"bids": [[20.00, 1200], [19.99, 800]], "asks": [[20.02, 500], [20.03, 2200]]}

# levels: always {price, label}, never bare numbers (review M3)
expect("levels: a bare number in a question chart",
       data({"type": "chart-decision", "chart": {"kind": "candles", "data": BARS, "levels": [24.4]}}),
       "must be {price, label}")
expect("levels: a bare number in a visual",
       data({"type": "theory", "visual": "chart-candles", "visual_data": {"data": BARS, "levels": [24.4]}}),
       "must be {price, label}")
expect("levels: a bare number on a swipe-deck card",
       data({"type": "swipe-deck", "cards": [{"chart": {"kind": "candles", "data": BARS, "levels": [24.4]}}]}),
       "card 1: level 1")
expect("levels: a bare number on a compare chart",
       data({"type": "compare", "charts": [{"kind": "candles", "data": BARS, "label": "A", "levels": [24.4]}]}),
       "chart 1: level 1")
expect("levels: an unknown field on a level",
       data({"type": "chart-tap", "chart": {"kind": "candles", "data": BARS, "levels": [{"price": 1, "colour": "red"}]}}),
       "unknown field")
expect_no("levels: {price, label} and {price} pass",
          data({"type": "chart-tap", "chart": {"kind": "candles", "data": BARS,
                                               "levels": [{"price": 10.1, "label": "High"}, {"price": 10.0}]}}),
          "level")

# depth-ladder: the book under data (review M2)
expect("depth-ladder: book at the top level, as the old bench had it",
       data({"type": "depth-ladder", "bids": BOOK["bids"], "asks": BOOK["asks"], "target": "ask-1"}),
       "under data")
expect("depth-ladder: a book row that is not [price, size]",
       data({"type": "depth-ladder", "data": {"bids": [[20.0]], "asks": BOOK["asks"]}, "target": "ask-1"}),
       "must be [price, size]")
expect_no("depth-ladder: book under data passes",
          data({"type": "depth-ladder", "data": BOOK, "target": "ask-1"}), "depth-ladder")

# order-book
expect("order-book: an empty side",
       data({"type": "visual", "component": "order-book", "data": {"bids": BOOK["bids"], "asks": []}}),
       "asks must be a non-empty list")
expect_no("order-book: a full book passes",
          data({"type": "visual", "component": "order-book", "data": BOOK}), "order-book")

# charts
expect("chart: a candle that is not [o, h, l, c]",
       data({"type": "compare", "charts": [{"kind": "candles", "data": [[1, 2, 3]], "label": "A"}]}),
       "must be [open, high, low, close]")
expect("chart: volume of the wrong length",
       data({"type": "chart-decision", "chart": {"kind": "candles", "data": BARS, "volume": [1, 2]}}),
       "volume has 2 values for 3 bars")
expect("chart: vwap that is not numbers",
       data({"type": "theory", "visual": "chart-candles", "visual_data": {"data": BARS, "vwap": ["a", "b", "c"]}}),
       "vwap must be a list of numbers")
expect("chart: a field the renderer does not read",
       data({"type": "chart-decision", "chart": {"kind": "candles", "data": BARS, "lines": [1]}}),
       "unknown field")
expect("chart-line: neither data nor series",
       data({"type": "theory", "visual": "chart-line", "visual_data": {"markers": []}}),
       "needs data or series")
expect("chart-line: a series without label/data shape",
       data({"type": "theory", "visual": "chart-line", "visual_data": {"series": [{"closes": [1, 2]}]}}),
       "series must be a list")

# every component against its row of the table
expect("component: unknown id",
       data({"type": "visual", "component": "pie-chart", "data": {}}), "unknown component")
expect("component: a required field missing",
       data({"type": "visual", "component": "quote-panel", "data": {"bid": 1}}), "missing ['ask']")
expect("component: a field the renderer does not read",
       data({"type": "visual", "component": "quote-panel", "data": {"bid": 1, "ask": 2, "mid": 1.5}}),
       "does not read: ['mid']")
expect("component: data that is not a mapping",
       data({"type": "theory", "visual": "bar-chart", "visual_data": [1, 2]}), "as a mapping")
expect("component: visual_data without a visual",
       data({"type": "theory", "visual_data": {"bars": []}}), "without a visual")
expect("bar-chart: a bar without a value",
       data({"type": "visual", "component": "bar-chart", "data": {"bars": [{"label": "A"}]}}),
       "bars must be")
expect("scanner-pick: rows missing",
       data({"type": "scanner-pick", "data": {}, "target": "XYZ"}), "needs data")

# cost-stack: three shapes, anything else draws NaN
expect("cost-stack: per share without a target",
       data({"type": "theory", "visual": "cost-stack", "visual_data": {"shares": 100, "spread": 0.02}}),
       "needs target")
expect("cost-stack: targets without a cost",
       data({"type": "theory", "visual": "cost-stack",
             "visual_data": {"targets": [{"label": "A", "value": 0.1}]}}), "need a spread")
expect("cost-stack: rows without values",
       data({"type": "theory", "visual": "cost-stack", "visual_data": {"rows": [{"label": "A"}], "unit": "$"}}),
       "rows must be")
expect("cost-stack: rows mixed with a per-share field",
       data({"type": "theory", "visual": "cost-stack",
             "visual_data": {"rows": [{"label": "A", "value": 1}], "spread": 0.02}}), "take only a unit")
for shape in ({"shares": 100, "spread": 0.02, "target": 0.1},
              {"spread": 0.05, "targets": [{"label": "Scalp", "value": 0.12}]},
              {"rows": [{"label": "Per order", "value": 2}], "unit": "$ per round trip"}):
    expect_no(f"cost-stack: the {sorted(shape)[0]} shape passes",
              data({"type": "theory", "visual": "cost-stack", "visual_data": shape}), "cost-stack")

# the rules reach every screen of a lesson and of a drill pack
expect("lesson file: component data is checked",
       check_file(lesson(screens=lesson()["screens"][:-1] + [
           {"type": "theory", "body": "b", "visual": "chart-candles", "visual_data": {"data": BARS, "levels": [1]}},
           lesson()["screens"][-1]])),
       "must be {price, label}")

expect("drill pack: component data is checked",
       check_pack(pack(screens=pack()["screens"][:-1] + [
           {"type": "depth-ladder", "prompt": "p", "explanation": "e", "target": "ask-1", "data": {"bids": [[1]], "asks": []}}])),
       "must be [price, size]")

# the test bench is checked as well, with the lesson rules left out
BENCH = pathlib.Path(V.ROOT) / "demo/test-bench-fixture.yaml"


def bench(screens):
    def run(rep):
        import yaml
        BENCH.write_text(yaml.safe_dump({"screens": screens}), encoding="utf-8")
        try:
            V.validate_bench(rep, BENCH)
        finally:
            BENCH.unlink()
    return run


expect("bench: component data is checked",
       bench([{"type": "depth-ladder", "bids": BOOK["bids"], "asks": BOOK["asks"], "target": "ask-1",
               "prompt": "p", "explanation": "e"}]),
       "under data")
expect("bench: question shape is checked",
       bench([{"type": "mc", "prompt": "p", "options": [{"text": "a"}, {"text": "b"}], "explanation": "e"}]),
       "exactly one correct")
expect("bench: an unknown type",
       bench([{"type": "chart-dance"}]), "unknown type")
expect_no("bench: the lesson rules stay out",
          bench([{"type": "theory", "body": "b"}]), "screens")
expect_no("bench: the real bench passes", lambda rep: V.validate_bench(rep), "demo/")

print("\n— DESIGN-REVIEW fields (docs/schema.md) —")
DEC = {"type": "chart-decision", "scenario": "s", "shares": 100, "best": "long", "reasonable": ["no-trade"],
       "outcome": "o", "explanation": "e",
       "chart": {"kind": "candles", "decision_index": 4,
                 "data": [[20, 20.2, 19.9, 20.1]] * 4 + [[20.1, 20.3, 20.0, 20.2]] + [[20.2, 20.4, 20.1, 20.3]] * 5}}


def dec(**over):
    d = dict(DEC)
    d.update(over)
    return lambda rep: (V.validate_question_screen("f.yaml", 1, d, rep), V.validate_screen_data("f.yaml", 1, d, rep))


expect("notes: more than four", dec(notes=[{"bar": 1, "text": "x"}] * 5), "1–4 notes")
expect("notes: a bar off the chart", dec(notes=[{"bar": 10, "text": "Lower high"}]), "bar of the chart")
expect("notes: text too long", dec(notes=[{"bar": 2, "text": "A note far longer than twenty-four"}]), "1–24 characters")
expect("notes: at neither high nor low", dec(notes=[{"bar": 2, "text": "x", "at": "middle"}]), "high or low")
expect_no("notes: valid notes pass", dec(notes=[{"bar": 2, "text": "Higher low", "at": "low"}, {"bar": 9, "text": "Breaks the high"}]), "note")
expect("stop above the entry of a long", dec(stop=20.5, target=21), "stop 20.5 is on the wrong side")
expect("target below the entry of a long", dec(stop=19.9, target=20.0), "target 20.0 is on the wrong side")
expect("short: stop below the entry", dec(best="short", stop=20.0, target=19.5), "wrong side")
expect_no("stop and target on the right sides pass", dec(stop=19.95, target=20.6), "wrong side")
expect("session_open: off the chart", dec(chart=dict(DEC["chart"], session_open=10)), "session_open")
expect("session_open: the first bar", dec(chart=dict(DEC["chart"], session_open=0)), "session_open")
expect_no("session_open: a bar inside passes", dec(chart=dict(DEC["chart"], session_open=3)), "session_open")
expect("chart-candles takes session_open, not junk", data({"type": "visual", "component": "chart-candles", "data": {"data": BARS, "session_close": 1}}), "does not read")
expect_no("chart-candles: session_open is read", data({"type": "visual", "component": "chart-candles", "data": {"data": BARS, "session_open": 1}}), "does not read")

STORY = {"type": "story", "text": "XYZ gapped up."}
expect("alert: a lowercase ticker", data(dict(STORY, alert={"ticker": "xyz"})), "capital letters")
expect("alert: a clock time written out", data(dict(STORY, alert={"ticker": "XYZ", "time": "9:31"})), "clock time")
expect("alert: four facts", data(dict(STORY, alert={"ticker": "XYZ", "facts": ["a", "b", "c", "d"]})), "facts must be 1–3")
expect("alert: a short sparkline", data(dict(STORY, alert={"ticker": "XYZ", "spark": [1, 2, 3]})), "spark must be 5–30")
expect("alert: on a takeaway", data(dict(STORY, label="takeaway", alert={"ticker": "XYZ"})), "takeaway has no alert")
expect_no("alert: a valid alert passes", data(dict(STORY, alert={"ticker": "XYZ", "time": "1 min after the open", "facts": ["Gap +6.2 %", "RVOL 4.8×"], "spark": [17.4, 17.6, 17.5, 17.9, 18.1]})), "alert")
expect("scanner row: a short sparkline", data({"type": "scanner-pick", "data": {"rows": [{"ticker": "XYZ", "spark": [1, 2]}]}}), "spark must be 5–30")
ROW = {"ticker": "MARL", "price": 14.80, "change_pct": 8.6}
expect("scanner row: spark ends off the price", data({"type": "scanner-pick", "data": {"rows": [dict(ROW, spark=[13.63, 13.9, 14.2, 14.5, 14.6])]}}), "the row's price is")
expect("scanner row: spark disagrees with the %", data({"type": "scanner-pick", "data": {"rows": [dict(ROW, spark=[14.0, 14.2, 14.4, 14.6, 14.8])]}}), "the row says")
expect_no("scanner row: a spark that agrees passes", data({"type": "scanner-pick", "data": {"rows": [dict(ROW, spark=[13.63, 13.9, 14.2, 14.5, 14.8])]}}), "spark")
expect("decision-grid: an unknown cell", data({"type": "visual", "component": "decision-grid", "data": {"cell": "lucky"}}), "decision-grid cell")
expect_no("decision-grid: no data at all passes", data({"type": "theory", "body": "b", "visual": "decision-grid"}), "decision-grid")
expect_no("decision-grid: a known cell passes", data({"type": "visual", "component": "decision-grid", "data": {"cell": "right-lost"}}), "decision-grid")

expect("facts on a lesson intro", check_file(lesson(screens=[{"type": "intro", "text": "x", "facts": ["Account $20,000"]}] + lesson()["screens"][1:])), "only in tests")
expect("facts too long", check_file(exam(10, "test") | {"screens": [{"type": "intro", "text": "x", "counter": 10, "facts": ["An account of twenty-two thousand"]}] + exam(10, "test")["screens"][1:]}), "at most 20 characters")
# docs/schema.md "Skills": a lesson lists names; content/skills.yaml holds the entries.
no_skills = lesson()
del no_skills["skills"]
expect("skills: the field is missing", check_file(no_skills), "missing field 'skills'")
expect("skills: entries are objects, not names", check_file(lesson(skills=[{"name": "x", "card": 2}])), "list of names")
expect("skills: a name too long", check_file(lesson(skills=["x" * 41])), "1–40 characters")
expect("skills: a name listed twice", check_file(lesson(skills=["Reading a quote", "reading a  quote"])), "listed twice")
expect("skills: a test teaches none", check_file(exam(4, "test") | {"skills": ["Reading a quote"]}), "teach no skills")
expect("skills: a new-theory lesson with none", check_file(lesson(skills=[])), "at least one skill")
expect("skills: an introduced term not listed", check_file(lesson(terms_introduced=["Spread"])), "not in skills")
expect_no("skills: a valid list passes",
          check_file(lesson(terms_introduced=["Spread"], skills=["Spread", "Reading a quote"])), "skills")
expect_no("skills: a repetition lesson may list none", check_file(lesson(category="repetition", skills=[])), "skill")


def table(entries):
    return lambda rep: V.check_skill_table("content/skills.yaml", entries, rep)


W = {"name": "Spread", "kind": "word", "info": "The gap between bid and ask."}
T = {"name": "Reading a quote", "kind": "technique", "info": "Reading both prices at once."}
expect("skill table: not a list", table({"Spread": W}), "must be a list")
expect("skill table: info missing", table([{"name": "Spread", "kind": "word"}]), "name, kind and info")
expect("skill table: an unknown field", table([W | {"card": 2}]), "name, kind and info")
expect("skill table: a kind that is neither", table([W | {"kind": "term"}]), "word or technique")
expect("skill table: empty info", table([W | {"info": " "}]), "info is empty")
expect("skill table: info too long", table([W | {"info": "x" * 160 + "."}]), "at most 160")
expect("skill table: info without a full stop", table([W | {"info": "The gap"}]), "full stop")
expect("skill table: a name too long", table([W | {"name": "x" * 41}]), "1–40 characters")
expect("skill table: two entries, one name", table([W, W | {"name": "spread "}]), "already the name")
expect("skill table: an alias that is a name", table([W | {"aliases": ["reading a quote"]}, T]), "already the name")
expect("skill table: an alias on a technique", table([T | {"aliases": ["Quote reading"]}]), "only a word")
expect_no("skill table: a valid table passes", table([W | {"aliases": ["bid-ask spread"]}, T]), "skill")


def taught(*files, entries=(W, T)):
    def run(rep):
        tbl = V.check_skill_table("content/skills.yaml", list(entries), rep)
        chapters = defaultdict(list)
        for n, (folder, d) in enumerate(files):
            chapters[folder].append(dict(d, _file=f"{folder.name}/level-{n}.yaml"))
        V.validate_skills(tbl, chapters, rep)
    return run


SHARED = pathlib.Path(V.ROOT) / "content/shared/chapter-01-x"
DAY = pathlib.Path(V.ROOT) / "content/paths/day-trading/chapter-02-x"
spread = lesson(terms_introduced=["Spread"], skills=["Spread", "Reading a quote"])
expect("skills: a name with no entry", taught((CHAPTER, lesson(skills=["Tape reading"]))), "no entry")
expect("skills: a name spelled otherwise", taught((CHAPTER, lesson(skills=["reading a quote"]))), "is spelled")
expect("skills: a word not introduced", taught((CHAPTER, lesson(skills=["Spread"]))), "not in terms_introduced")
expect("skills: a technique in two lessons",
       taught((CHAPTER, spread), (CHAPTER, lesson(skills=["Reading a quote"]))), "belongs to one lesson")
expect("skills: a word twice on one path",
       taught((CHAPTER, spread), (CHAPTER, lesson(terms_introduced=["Spread"], skills=["Spread"]))),
       "already introduced")
expect("skills: a word in Chapter 1 and again on a path",
       taught((SHARED, lesson(path="all", terms_introduced=["Spread"], skills=["Spread"])), (CHAPTER, spread)),
       "already introduced")
expect_no("skills: one word on two paths",
          taught((CHAPTER, spread), (DAY, lesson(path="day-trading", terms_introduced=["Spread"], skills=["Spread"]))),
          "already introduced")
expect("skills: an entry no lesson lists", taught((CHAPTER, lesson(skills=["Reading a quote"]))), "listed by no lesson")
expect_no("skills: every entry listed once", taught((CHAPTER, spread)), "skill")
expect("a term no card names", check_file(lesson(terms_introduced=["Spread"])), "term 'Spread' is on no theory")
expect_no("a term a card names", check_file(lesson(terms_introduced=["Spread"], skills=["Spread"], screens=[{"type": "intro", "text": "x"}, {"type": "theory", "title": "t", "body": "The spread is the gap."}] + lesson()["screens"][2:])), "term 'Spread'")

REPLAY = {"type": "chart-replay", "prompt": "p", "explanation": "e",
          "chart": {"kind": "candles", "data": BARS * 4}, "moments": [{"bar": 3, "kind": "setup", "note": "n"}]}


def bonus(name="level-04-bonus.yaml", **over):
    d = {"id": "4-bonus", "title": "Spot it", "chapter": 3, "chapter_title": "C", "path": "scalping",
         "category": "bonus", "after": 4, "gems": 10, "prerequisite": None,
         "screens": [{"type": "intro", "text": "x"}, REPLAY, REPLAY]}
    d.update(over)
    return lambda rep: V.validate_bonus_file(CHAPTER / name, d, rep)


expect("bonus: id does not match the file", bonus(id="5-bonus"), "does not match filename")
expect("bonus: wrong category", bonus(category="new-theory"), "category: bonus")
expect("bonus: after differs from the file", bonus(after=5), "must be the level in the filename")
expect("bonus: a prerequisite", bonus(prerequisite="3-1"), "prerequisite: null")
expect("bonus: one replay only", bonus(screens=[{"type": "intro", "text": "x"}, REPLAY]), "2–3 chart-replay")
expect("bonus: a moment off the chart", bonus(screens=[{"type": "intro", "text": "x"}, REPLAY, dict(REPLAY, moments=[{"bar": 99, "kind": "setup"}])]), "moment 1 bar")
expect_no("bonus: a valid file passes", bonus(), "bonus")


def placed(after, categories):
    files = [dict(sub(n, category=c), _file=f"level-{n}-1.yaml") for n, c in categories]
    return lambda rep: V.validate_bonus({CHAPTER: [{"after": after, "_file": "level-x-bonus.yaml"}]}, {CHAPTER: files}, rep)


LEVELS = [(1, "new-theory"), (2, "new-theory"), (3, "repetition"), (4, "test"), (5, "new-theory")]
expect("bonus: after a level the chapter lacks", placed(9, LEVELS), "has no Level 9")
expect("bonus: after a test", placed(4, LEVELS), "never follows a test")
expect("bonus: right before a test", placed(3, LEVELS), "mistakes review's place")
expect_no("bonus: after an ordinary level", placed(2, LEVELS), "after 2")

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
