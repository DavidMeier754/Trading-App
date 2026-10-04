#!/usr/bin/env python3
"""The skills of every lesson (docs/level-files/06-skills-bonus-lessons-market-profiles.md "Skills"). Usage:
  python3 tools/skills.py                 every lesson's skills with their info, by chapter
  python3 tools/skills.py --chapter 3     one chapter (the folder's number)
  python3 tools/skills.py --sync          bring the level files and content/skills.yaml together

content/skills.yaml holds every skill: its name, its kind (word or technique) and one
line of info. A level file names the skills it teaches in `skills`, on one line, words
first. What --sync does, and nothing else:
  1. A level file without `skills` gets the line, after `terms_introduced`.
  2. A term in `terms_introduced` that `skills` does not list yet is added, with the words.
  3. A name a level file lists that content/skills.yaml lacks is appended there with empty
     info. The validator fails until the info is written, so a stub cannot ship.
Then run python3 tools/validate_content.py.
"""
import json
import re
import sys

import yaml

from validate_content import BONUS_FILE, CONTENT, ROOT, SKILLS_FILE, fold, level_key

SKILLS_LINE = re.compile(r"^skills:.*$", re.M)
TERMS_LINE = re.compile(r"^terms_introduced:.*$", re.M)


def level_files():
    """Every sub-level file, Chapter 1 first, each chapter in level order."""
    files = [p for p in CONTENT.rglob("level-*.yaml") if not BONUS_FILE.match(p.name)]
    return sorted(files, key=lambda p: (0 if "/shared/" in str(p) else 1, str(p.parent),
                                        level_key(p.stem[len("level-"):])))


def entries():
    data = yaml.safe_load(SKILLS_FILE.read_text(encoding="utf-8")) or []
    return {fold(e["name"]): e for e in data if isinstance(e, dict) and "name" in e}


def flow(names):
    return "skills: [" + ", ".join(json.dumps(n, ensure_ascii=False) for n in names) + "]"


def listing(chapter=None):
    table = entries()
    current = None
    for path in level_files():
        d = yaml.safe_load(path.read_text(encoding="utf-8"))
        if chapter is not None and d["chapter"] != chapter:
            continue
        if path.parent != current:
            current = path.parent
            print(f"\n{path.parent.relative_to(ROOT)}")
        names = d.get("skills") or []
        head = f"  {d['id']:>6}  {d['title']}"
        if not names:
            print(f"{head}  ·  {'(none)' if 'skills' in d else '(no skills line)'}")
            continue
        print(head)
        for name in names:
            e = table.get(fold(name))
            kind = e["kind"] if e else "?"
            info = (e or {}).get("info") or "(no info yet)"
            print(f"          {kind:<9} {name}: {info}")


def sync():
    table = entries()
    changed, stubs = [], []
    for path in level_files():
        text = path.read_text(encoding="utf-8")
        d = yaml.safe_load(text)
        terms = d.get("terms_introduced") or []
        rel = path.relative_to(ROOT)
        if "skills" in d and not SKILLS_LINE.search(text):
            print(f"skip  {rel}: write `skills` on one line ([...]) and run again")
            continue
        names = list(d.get("skills") or [])
        listed = {fold(n) for n in names}
        missing = [t for t in terms if fold(t) not in listed]
        if "skills" not in d or missing:
            words = [n for n in names if fold(n) in {fold(t) for t in terms}]
            rest = [n for n in names if n not in words]
            names = words + missing + rest
            line = flow(names)
            if "skills" in d:
                text = SKILLS_LINE.sub(lambda _: line, text, count=1)
            elif TERMS_LINE.search(text):
                text = TERMS_LINE.sub(lambda m: m.group(0) + "\n" + line, text, count=1)
            else:
                print(f"skip  {rel}: no `terms_introduced` line to put `skills` after")
                continue
            path.write_text(text, encoding="utf-8")
            changed.append(rel)
        for name in names:
            if fold(name) not in table:
                kind = "word" if fold(name) in {fold(t) for t in terms} else "technique"
                table[fold(name)] = {"name": name, "kind": kind, "info": ""}
                stubs.append((name, kind, rel))
    if stubs:
        with SKILLS_FILE.open("a", encoding="utf-8") as out:
            out.write("\n# Added by tools/skills.py --sync: write each info line, then move the entry to its chapter.\n")
            for name, kind, rel in stubs:
                out.write(f'- name: {json.dumps(name, ensure_ascii=False)}\n  kind: {kind}\n  info: ""\n')
    for rel in changed:
        print(f"level  {rel}")
    for name, kind, rel in stubs:
        print(f"stub   {kind:<9} {name}  (from {rel})")
    print(f"\n{len(changed)} level files updated, {len(stubs)} entries added to "
          f"{SKILLS_FILE.relative_to(ROOT)}." + (" Write their info." if stubs else ""))


def main():
    args = sys.argv[1:]
    if "--sync" in args:
        sync()
    elif "--chapter" in args:
        listing(int(args[args.index("--chapter") + 1]))
    elif args:
        print(__doc__)
        sys.exit(2)
    else:
        listing()


if __name__ == "__main__":
    main()
