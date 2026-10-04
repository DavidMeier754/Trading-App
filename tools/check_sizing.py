#!/usr/bin/env python3
"""Report every simulated position in the corpus against the concentration rule.

`docs/rules/04-numbers-and-realism.md` §3.6: a position is `shares × price` and it may use at most
**95 %** of the account named in the same file, one position at a time. This script
reports every screen that carries a share count — the file, the count, the decision
price, the account, the position as a percentage of it — and, for each one, every
other line in the same file that writes that share count out. Re-sizing a drill is
never a one-line edit: the count is quoted again in the outcome, in the numeric
questions around it, in a story, and in the file's notes, and all of them have to
move together. There are ~3,300 such lines corpus-wide, which is why this is a
script and not a reading task.

Usage:
  python3 tools/check_sizing.py                    # every position, with its other mentions
  python3 tools/check_sizing.py --chapter 2        # one chapter
  python3 tools/check_sizing.py --path chapter-07  # any path substring
  python3 tools/check_sizing.py --breaches         # only positions over the cap
  python3 tools/check_sizing.py --summary          # per-chapter concentration table only
  python3 tools/check_sizing.py --quiet            # positions without the mention lists
  python3 tools/check_sizing.py --csv              # one row per position
  python3 tools/check_sizing.py --sites-csv        # one row per mention

Exits 1 if any position in scope breaches the rule, so a chapter can be worked until
it is clean. `tools/validate_content.py` is the gate and warns once per chapter, on the
`chart-decision` and `branch` screens it can price; this script reaches wider — an
`order-build` ticket and a `journal-row` trade are positions too — so its counts are the
larger ones.
"""
import argparse
import re
import statistics
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import validate_content as V  # noqa: E402

import yaml  # noqa: E402

# docs/rules/04-numbers-and-realism.md §3.6. Kept in step with validate_content.MAX_ACCOUNT_PCT.
CAP = V.MAX_ACCOUNT_PCT

# Lines that are the screen's own size declaration rather than another mention of it.
OWN_SIZE_RE = re.compile(r"^-?\s*(shares|qty)\s*:\s*[\d,]+\s*$")
# Numeric payload — chart data, volume bars, depth ladders. A share count that turns up
# inside one of these is a coincidence of digits, not a sentence to rewrite.
DATA_KEY_RE = re.compile(r"^-?\s*(data|volume|vwap|levels|markers|bids|asks|series)\s*:")
NUMERIC_LINE_RE = re.compile(r"^[\s\[\]\d,.\-]+$")
KEY_RE = re.compile(r"^-?\s*([a-z_]+)\s*:")


def sized_screens(doc):
    """(screen number, type, shares, price) for every screen that names a position.

    A `chart-decision` and a `branch` price off the bar the chart pauses on; a
    `journal-row` off the trade's entry; an `order-build` off the limit price on the
    ticket the learner assembles. That last one is indicative rather than exact: where
    the ticket is an exit, its price is the target and not what the position cost. The
    share count is the number that matters on those rows.
    """
    for i, s in enumerate(doc.get("screens") or [], 1):
        t = s.get("type")
        if t in ("chart-decision", "branch"):
            shares, price = s.get("shares"), V.decision_price(s)
        elif t == "journal-row":
            trade = s.get("trade") or {}
            shares, price = trade.get("shares"), trade.get("entry")
        elif t == "order-build":
            answer = s.get("answer") or {}
            shares, price = answer.get("qty"), answer.get("price")
        else:
            continue
        if isinstance(shares, int):
            yield i, t, shares, price if isinstance(price, (int, float)) else None


def count_pattern(n):
    """A share count as a reader writes it: 1800 or 1,800, never inside a longer number."""
    forms = sorted({str(n), f"{n:,}"}, key=len, reverse=True)
    return re.compile(r"(?<![\d,.])(" + "|".join(map(re.escape, forms)) + r")(?![\d,.])")


def mentions(lines, shares, own_line):
    """(line number, yaml key, text) for every other line in the file naming `shares`."""
    rx = count_pattern(shares)
    out = []
    for n, raw in enumerate(lines, 1):
        if n == own_line:
            continue
        line = raw.strip()
        if not rx.search(line):
            continue
        if OWN_SIZE_RE.match(line) or DATA_KEY_RE.match(line) or NUMERIC_LINE_RE.match(line):
            continue
        key = KEY_RE.match(line)
        out.append((n, key.group(1) if key else "-", line))
    return out


def own_size_line(lines, screen_no, shares):
    """The line the screen declares its own size on, so it is not reported as a mention."""
    rx = count_pattern(shares)
    for n, raw in enumerate(lines, 1):
        line = raw.strip()
        if OWN_SIZE_RE.match(line) and rx.search(line):
            yield n


def collect(args):
    rows = []
    for path in sorted(V.CONTENT.rglob("level-*.yaml")):
        rel = path.relative_to(V.ROOT)
        if args.path and args.path not in str(rel):
            continue
        text = path.read_text(encoding="utf-8")
        try:
            doc = yaml.safe_load(text)
        except yaml.YAMLError as e:
            print(f"SKIP {rel}: YAML error: {e}", file=sys.stderr)
            continue
        if not isinstance(doc, dict):
            continue
        if args.chapter is not None and doc.get("chapter") != args.chapter:
            continue
        lines = text.splitlines()
        account = V.stated_account(doc)
        used = set()
        for screen_no, kind, shares, price in sized_screens(doc):
            own = next((n for n in own_size_line(lines, screen_no, shares) if n not in used), None)
            if own:
                used.add(own)
            value = shares * price if price is not None else None
            pct = 100 * value / account if value is not None and account else None
            rows.append({
                "file": rel, "id": doc.get("id"), "chapter": doc.get("chapter"),
                "screen": screen_no, "type": kind, "shares": shares, "price": price,
                "account": account, "value": value, "pct": pct,
                "sites": mentions(lines, shares, own),
            })
    return rows


def breach(row):
    return row["pct"] is not None and row["pct"] > CAP * 100


def fmt_price(p):
    return f"${p:,.2f}" if isinstance(p, (int, float)) else "—"


def print_rows(rows, args):
    current = None
    for r in rows:
        if args.breaches and not breach(r):
            continue
        if r["file"] != current:
            current = r["file"]
            account = f"account ${r['account']:,}" if r["account"] else "no account named"
            print(f"\n{current}  ({account})")
        mark = "!" if breach(r) else " " if r["pct"] is not None else "?"
        value = f"${r['value']:,.0f}" if r["value"] is not None else "—"
        pct = f"{r['pct']:5.1f}%" if r["pct"] is not None else "    —"
        print(f"  {mark} screen {r['screen']:>2}  {r['type']:<14} "
              f"{r['shares']:>6,} sh × {fmt_price(r['price']):>8} = {value:>9}  {pct}")
        if args.quiet:
            continue
        for n, key, line in r["sites"]:
            print(f"        L{n:<4} {key:<12} {line[:96]}")
        if not r["sites"]:
            print("        (the share count is named nowhere else in this file)")


def print_summary(rows, scope):
    per = defaultdict(list)
    for r in rows:
        if r["pct"] is not None:
            per[r["chapter"]].append(r["pct"])
    print(f"\nConcentration by chapter — position value as a share of the stated account "
          f"(cap {CAP:.0%}){scope}")
    print(f"{'ch':>3} {'sized':>6} {'median':>8} {'min':>7} {'max':>7} "
          f"{'>50%':>6} {'>90%':>6} {f'>{CAP:.0%}':>6} {'>100%':>6}")
    allv = []
    for ch in sorted(per, key=lambda c: (c is None, c)):
        v = per[ch]
        allv += v
        print(f"{str(ch):>3} {len(v):>6} {statistics.median(v):>7.1f}% {min(v):>6.1f}% {max(v):>6.1f}% "
              f"{sum(1 for x in v if x > 50):>6} {sum(1 for x in v if x > 90):>6} "
              f"{sum(1 for x in v if x > CAP * 100):>6} {sum(1 for x in v if x > 100):>6}")
    if allv:
        print(f"{'all':>3} {len(allv):>6} {statistics.median(allv):>7.1f}% {min(allv):>6.1f}% "
              f"{max(allv):>6.1f}% {sum(1 for x in allv if x > 50):>6} "
              f"{sum(1 for x in allv if x > 90):>6} {sum(1 for x in allv if x > CAP * 100):>6} "
              f"{sum(1 for x in allv if x > 100):>6}")


def print_csv(rows):
    print("file,id,chapter,screen,type,shares,price,account,value,pct,other_mentions")
    for r in rows:
        print(",".join([
            str(r["file"]), str(r["id"]), str(r["chapter"]), str(r["screen"]), r["type"],
            str(r["shares"]),
            f"{r['price']:.2f}" if r["price"] is not None else "",
            str(r["account"] or ""),
            f"{r['value']:.2f}" if r["value"] is not None else "",
            f"{r['pct']:.1f}" if r["pct"] is not None else "",
            str(len(r["sites"])),
        ]))


def print_sites_csv(rows):
    print("file,screen,shares,line,key,text")
    for r in rows:
        for n, key, line in r["sites"]:
            print(f'{r["file"]},{r["screen"]},{r["shares"]},{n},{key},"{line.replace(chr(34), chr(34) * 2)}"')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--chapter", type=int, help="only files whose chapter field is N")
    ap.add_argument("--path", help="only files whose path contains this substring")
    ap.add_argument("--breaches", action="store_true", help="list only positions over the cap")
    ap.add_argument("--summary", action="store_true", help="print the chapter table only")
    ap.add_argument("--quiet", action="store_true", help="omit the other-mention lists")
    ap.add_argument("--csv", action="store_true", help="one row per position")
    ap.add_argument("--sites-csv", action="store_true", help="one row per other mention")
    args = ap.parse_args()

    rows = collect(args)
    if args.csv:
        print_csv(rows)
    elif args.sites_csv:
        print_sites_csv(rows)
    else:
        if not args.summary:
            print_rows(rows, args)
        scope = ""
        if args.chapter is not None:
            scope = f" — chapter {args.chapter}"
        elif args.path:
            scope = f" — {args.path}"
        print_summary(rows, scope)
        sized = len(rows)
        priced = sum(1 for r in rows if r["pct"] is not None)
        no_account = sum(1 for r in rows if not r["account"])
        no_price = sum(1 for r in rows if r["price"] is None)
        sites = sum(len(r["sites"]) for r in rows)
        bad = sum(1 for r in rows if breach(r))
        print(f"\n{sized} positions in {len({r['file'] for r in rows})} files; "
              f"{priced} priced against a named account; {sites} other lines name one of "
              f"those share counts.")
        if no_account or no_price:
            print(f"{no_account} name no account and {no_price} carry no decision price, so the "
                  f"rule cannot see them — a drill that names no account is unchecked, not exempt.")
        print(f"{bad} positions breach the {CAP:.0%} cap (docs/rules/04-numbers-and-realism.md §3.6)."
              if bad else f"No position breaches the {CAP:.0%} cap (docs/rules/04-numbers-and-realism.md §3.6).")
    sys.exit(1 if any(breach(r) for r in rows) else 0)


if __name__ == "__main__":
    main()
