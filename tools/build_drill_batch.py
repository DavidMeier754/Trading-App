#!/usr/bin/env python3
"""Stage 4 (docs/build-plan.md): build the drill-pack batch, one request per pack.

    python3 tools/build_drill_batch.py --check                 # manifest + exemplars resolve
    python3 tools/build_drill_batch.py --print cost-check      # one request, as text
    python3 tools/build_drill_batch.py --out requests.jsonl    # the whole batch
    python3 tools/build_drill_batch.py --out requests.jsonl --only setup-a-vwap-bounce,mixed-daily
    python3 tools/build_drill_batch.py --submit requests.jsonl # needs the anthropic SDK
    python3 tools/build_drill_batch.py --collect results.jsonl # results -> content/drills/<path>/

Every request is keyed by `custom_id = pack id` and is built the same way
(docs/build-plan.md, Stage 4):

    system  [0] the docs prefix — agent.md + schema.md + UI.md, byte-identical across
                every request and marked `cache_control`, so it is read from cache from
                the second request on
    user        the pack's manifest entry, its three exemplar screens, and the
                per-request instruction from docs/build-plan.md §"Per-request instruction"

Nothing here writes into content/ except --collect, and --collect writes only the packs
the manifest asks for. Batch output is not exempt from the validator: run
`python3 tools/validate_content.py --strict` after collecting.
"""
import argparse
import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "content/drills/packs.yaml"
DOCS = ["docs/agent.md", "docs/schema.md", "docs/UI.md"]

# docs/build-plan.md: Stage 4 is Sonnet on the Batch API; `effort: medium` is enough for
# work that follows a format already set, and `budget_tokens` 400s on current models.
MODEL = "claude-sonnet-5"
MAX_TOKENS = 32000
THINKING = {"type": "adaptive"}
OUTPUT_CONFIG = {"effort": "medium"}

# docs/build-plan.md, "Per-request instruction". Reviewed — do not rewrite it here.
# `{n}` is the pack's screen count, and it fills both of the instruction's counts.
INSTRUCTION = """Write {n} drill screens for the pack "{pack_id}", covering these concepts:
{concepts}. Format per the drill-pack spec in docs/schema.md.

These are drills, not a lesson: no intro, no theory, no summary — question screens
only, each one standing alone. The learner has already been taught this material in
{taught_in}; assume it and test it.

Vary the interaction across the pack (swipe-deck, chart-decision, numeric-input,
compare, branch) and vary the difficulty: about a third should be near-misses where
the right answer is "pass" or "no trade". Answer-key hygiene per docs/agent.md §3.5
applies to the pack as a whole — check the distribution across all {n} before you
finish. Price and volume bands per §3.6. Every number must be arithmetically sound."""

ENVELOPE = """Return one YAML document and nothing else: the header below exactly as it
stands, then a `screens:` list holding the {n} drill screens. No prose around it."""


def load_manifest():
    data = yaml.safe_load(MANIFEST.read_text(encoding="utf-8"))
    return data["packs"]


def docs_prefix():
    """The ~18K-token block every request shares. Byte-identical, or nothing caches."""
    parts = []
    for rel in DOCS:
        parts.append(f"# ===== {rel} =====\n\n" + (ROOT / rel).read_text(encoding="utf-8"))
    return "\n\n".join(parts)


def chapter_folder(path, chapter):
    """The folder a (path, chapter) pair lives in. Chapter 1 is shared by every path."""
    base = ROOT / "content/shared" if chapter == 1 else ROOT / "content/paths" / path
    for folder in sorted(base.glob(f"chapter-{chapter:02d}-*")):
        return folder
    return None


def sublevel_file(path, chapter, sub_id):
    folder = chapter_folder(path, chapter)
    if folder is None:
        return None
    lvl, sub = sub_id.split("-")
    f = folder / f"level-{int(lvl):02d}-{int(sub)}.yaml"
    return f if f.exists() else None


def unlock_label(pack):
    """"Chapter 3 — Orders, Costs & Position Size, through 19-1 (Final Exam)"."""
    f = sublevel_file(pack["path"], pack["unlocked_by_chapter"], pack["unlocked_by"])
    if f is None:
        return f"Chapter {pack['unlocked_by_chapter']}, sub-level {pack['unlocked_by']}"
    d = yaml.safe_load(f.read_text(encoding="utf-8"))
    return (f"Chapter {d['chapter']} — {d['chapter_title']}, through sub-level "
            f"{d['id']} ({d['title']})")


def exemplar_block(pack):
    out = []
    for ex in pack["exemplars"]:
        f = ROOT / ex["file"]
        d = yaml.safe_load(f.read_text(encoding="utf-8"))
        screen = d["screens"][ex["screen"] - 1]
        out.append(
            f"### {ex['role']} — {ex['file']}, screen {ex['screen']}\n"
            f"(from sub-level {d['id']}, \"{d['title']}\", difficulty {d['difficulty']})\n\n"
            "```yaml\n"
            + yaml.safe_dump([screen], sort_keys=False, allow_unicode=True, width=100)
            + "```"
        )
    return "\n\n".join(out)


def header_stub(pack):
    head = {
        "id": pack["id"],
        "path": pack["path"],
        "title": pack["title"],
        "unlocked_by": pack["unlocked_by"],
        "unlocked_by_chapter": pack["unlocked_by_chapter"],
        "tags": pack["tags"],
        "concepts": pack["concepts"],
    }
    return yaml.safe_dump(head, sort_keys=False, allow_unicode=True, width=100)


def user_prompt(pack):
    n = pack["screens"]
    return "\n\n".join([
        f"## Pack: {pack['id']}",
        "The manifest entry this request is built from (`content/drills/packs.yaml`):",
        "```yaml\n" + yaml.safe_dump(
            {k: v for k, v in pack.items() if k != "exemplars"},
            sort_keys=False, allow_unicode=True, width=100) + "```",
        "## Voice and difficulty reference",
        "Three screens from the linear chapter this pack unlocks from — one straightforward, "
        "one near-miss whose answer is pass or no trade, one that needs arithmetic. Match their "
        "voice, their level of detail and their arithmetic exactly. Do not reuse their charts, "
        "numbers or wording.",
        exemplar_block(pack),
        "## Instruction",
        INSTRUCTION.format(n=n, pack_id=pack["id"],
                           concepts=", ".join(pack["concepts"]),
                           taught_in=unlock_label(pack)),
        ENVELOPE.format(n=n),
        "```yaml\n" + header_stub(pack) + "```",
    ])


def request(pack, prefix):
    return {
        "custom_id": pack["id"],
        "params": {
            "model": MODEL,
            "max_tokens": MAX_TOKENS,
            "thinking": THINKING,
            "output_config": OUTPUT_CONFIG,
            "system": [{
                "type": "text",
                "text": prefix,
                "cache_control": {"type": "ephemeral"},
            }],
            "messages": [{"role": "user", "content": [{"type": "text", "text": user_prompt(pack)}]}],
        },
    }


def check(packs):
    """Everything the batch depends on: unlock targets and exemplars resolve, ids are sane."""
    problems = []
    seen = set()
    for p in packs:
        if p["id"] in seen:
            problems.append(f"{p['id']}: duplicate pack id")
        seen.add(p["id"])
        if p["id"] != f"{p['path']}-{p['slug']}":
            problems.append(f"{p['id']}: id is not <path>-<slug>")
        if p["file"] != f"content/drills/{p['path']}/{p['slug']}.yaml":
            problems.append(f"{p['id']}: file is not content/drills/<path>/<slug>.yaml")
        target = sublevel_file(p["path"], p["unlocked_by_chapter"], p["unlocked_by"])
        if target is None:
            problems.append(f"{p['id']}: unlocked_by {p['unlocked_by']} does not exist in "
                            f"chapter {p['unlocked_by_chapter']} of {p['path']}")
        roles = [e["role"] for e in p["exemplars"]]
        if sorted(roles) != ["arithmetic", "near-miss", "straightforward"]:
            problems.append(f"{p['id']}: exemplar roles are {roles}")
        for ex in p["exemplars"]:
            f = ROOT / ex["file"]
            if not f.exists():
                problems.append(f"{p['id']}: exemplar file {ex['file']} not found")
                continue
            d = yaml.safe_load(f.read_text(encoding="utf-8"))
            if not 1 <= ex["screen"] <= len(d["screens"]):
                problems.append(f"{p['id']}: {ex['file']} has no screen {ex['screen']}")
                continue
            s = d["screens"][ex["screen"] - 1]
            t = s.get("type")
            print(f"  {p['id']:<38} {ex['role']:<15} {ex['file'].split('/')[-1]}:{ex['screen']:<3} {t}")
            if t in ("intro", "theory", "example", "story", "recap", "summary", "badge"):
                problems.append(f"{p['id']}: {ex['role']} exemplar is a {t} screen, not a question")
            if ex["role"] == "near-miss" and not (
                    s.get("best") in ("no-trade", "wait")
                    or "pass" in [c.get("answer") for c in s.get("cards") or []]
                    or s.get("answer") == "neither"):
                problems.append(f"{p['id']}: near-miss exemplar does not resolve to pass/no-trade")
            if ex["role"] == "arithmetic" and t not in (
                    "numeric-input", "numeric-mc", "slider", "journal-row", "order-build"):
                problems.append(f"{p['id']}: arithmetic exemplar is a {t} screen")
    total = sum(p["screens"] for p in packs)
    print(f"\n{len(packs)} packs, {total} drill screens commissioned")
    for m in problems:
        print("PROBLEM", m)
    return not problems


def strip_fence(text):
    m = re.search(r"```(?:yaml)?\n(.*?)```", text, re.S)
    return m.group(1) if m else text


def collect(results_path, packs):
    by_id = {p["id"]: p for p in packs}
    written = []
    for line in Path(results_path).read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        pack = by_id.get(row["custom_id"])
        if pack is None:
            print(f"SKIP  unknown custom_id {row['custom_id']}")
            continue
        result = row.get("result", {})
        if result.get("type") != "succeeded":
            print(f"FAIL  {row['custom_id']}: {result.get('type')} {result.get('error')}")
            continue
        text = "".join(b.get("text", "") for b in result["message"]["content"]
                       if b.get("type") == "text")
        body = strip_fence(text)
        try:
            yaml.safe_load(body)
        except yaml.YAMLError as e:
            print(f"FAIL  {row['custom_id']}: returned YAML does not parse: {e}")
            continue
        out = ROOT / pack["file"]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(body if body.endswith("\n") else body + "\n", encoding="utf-8")
        written.append(pack["file"])
        print(f"WROTE {pack['file']}")
    print(f"\n{len(written)} packs written. Now run: python3 tools/validate_content.py --strict")


def submit(requests_path):
    try:
        from anthropic import Anthropic
    except ImportError:
        sys.exit("the anthropic SDK is not installed: pip install anthropic")
    reqs = [json.loads(l) for l in Path(requests_path).read_text(encoding="utf-8").splitlines() if l.strip()]
    batch = Anthropic().messages.batches.create(requests=reqs)
    print(f"batch {batch.id} created with {len(reqs)} requests ({batch.processing_status})")
    print("poll it, then: python3 tools/build_drill_batch.py --collect <results.jsonl>")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="verify the manifest and its exemplars")
    ap.add_argument("--print", metavar="PACK", help="print one request's prompt as text")
    ap.add_argument("--out", metavar="FILE", help="write the batch requests as JSONL")
    ap.add_argument("--only", metavar="IDS", help="comma-separated pack ids or slugs")
    ap.add_argument("--submit", metavar="FILE", help="submit a JSONL batch (needs the SDK and a key)")
    ap.add_argument("--collect", metavar="FILE", help="write returned packs into content/drills/")
    args = ap.parse_args()

    packs = load_manifest()
    if args.only:
        want = {s.strip() for s in args.only.split(",")}
        packs = [p for p in packs if p["id"] in want or p["slug"] in want]
        if not packs:
            sys.exit(f"no pack matches {args.only}")

    if args.check:
        sys.exit(0 if check(packs) else 1)
    if args.submit:
        return submit(args.submit)
    if args.collect:
        return collect(args.collect, load_manifest())
    if args.print:
        p = next((x for x in packs if args.print in (x["id"], x["slug"])), None)
        if p is None:
            sys.exit(f"no pack {args.print}")
        print(user_prompt(p))
        return
    if args.out:
        prefix = docs_prefix()
        with open(args.out, "w", encoding="utf-8") as fh:
            for p in packs:
                fh.write(json.dumps(request(p, prefix)) + "\n")
        chars = len(prefix)
        print(f"{len(packs)} requests -> {args.out}")
        print(f"docs prefix {chars:,} characters (~{chars // 4:,} tokens), cached from the "
              f"second request on; check usage.cache_read_input_tokens on the results")
        return
    ap.print_help()


if __name__ == "__main__":
    main()
