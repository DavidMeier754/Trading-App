# -*- coding: utf-8 -*-
"""
One source for the mascot family.

Emits, for each character, three stacked SVG layers (back / body / head) that
share a viewBox so they register exactly when overlaid. The app renders the
layers separately so each can be animated on its own; the PNG export flattens
them back into one file.

Design is taken from the Foxy reference: chunky chibi proportions, big head,
flat fills with no outlines, cream muzzle and chest, and a dark hoodie carrying
the character's motif.
"""

VB = "0 0 200 240"

# Sampled straight off the Foxy reference.
ORANGE      = "#FA742D"
ORANGE_DARK = "#E0581A"
ORANGE_DEEP = "#C8490F"
CREAM       = "#FDF5EA"
CREAM_SHADE = "#EADCC8"
HOODIE      = "#333333"
HOODIE_DARK = "#242424"
INK         = "#1A1A1A"
UP          = "#26C281"
DOWN        = "#F0574F"


def head_group(fur, fur_dark, cream, ears, brow=None):
    """Ears, skull, muzzle, eyes, nose, mouth. Face parts keep stable ids."""
    parts = [ears]
    parts.append(f'<ellipse cx="100" cy="78" rx="44" ry="42" fill="{fur}"/>')
    # the cream face patch: wide across the eyes, tapering to a rounded chin
    parts.append(f'<path d="M100 58 C121 58 132 70 132 86 C132 104 118 115 100 115 '
                 f'C82 115 68 104 68 86 C68 70 79 58 100 58 Z" fill="{cream}"/>')
    # brow patch (bear / bull get one)
    if brow:
        parts.append(brow)
    # eyes
    for cx in (84, 116):
        parts.append(f'<circle cx="{cx}" cy="80" r="9" fill="{INK}"/>')
        parts.append(f'<circle cx="{cx - 3}" cy="76.5" r="3" fill="#FFFFFF"/>')
    # nose + mouth
    parts.append(f'<ellipse cx="100" cy="95" rx="7" ry="5.5" fill="{INK}"/>')
    parts.append(f'<path d="M100 100 v4" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>')
    parts.append(f'<path d="M100 104 q-8 7 -14 1" stroke="{INK}" stroke-width="2.2" '
                 f'fill="none" stroke-linecap="round"/>')
    parts.append(f'<path d="M100 104 q8 7 14 1" stroke="{INK}" stroke-width="2.2" '
                 f'fill="none" stroke-linecap="round"/>')
    return "".join(parts)


def pointed_ears(fur, inner):
    return (f'<path d="M66 52 C58 34 56 18 60 8 C72 14 86 28 92 42 Z" fill="{fur}"/>'
            f'<path d="M134 52 C142 34 144 18 140 8 C128 14 114 28 108 42 Z" fill="{fur}"/>'
            f'<path d="M70 46 C65 34 64 24 66 18 C74 24 82 33 86 42 Z" fill="{inner}"/>'
            f'<path d="M130 46 C135 34 136 24 134 18 C126 24 118 33 114 42 Z" fill="{inner}"/>')


def round_ears(fur, inner):
    return (f'<circle cx="66" cy="44" r="16" fill="{fur}"/>'
            f'<circle cx="134" cy="44" r="16" fill="{fur}"/>'
            f'<circle cx="66" cy="44" r="8" fill="{inner}"/>'
            f'<circle cx="134" cy="44" r="8" fill="{inner}"/>')


def horn_ears(fur, horn):
    return (f'<path d="M66 64 C44 70 24 64 14 48 C22 42 34 46 44 54 '
            f'C52 60 60 62 68 58 Z" fill="{horn}"/>'
            f'<path d="M134 64 C156 70 176 64 186 48 C178 42 166 46 156 54 '
            f'C148 60 140 62 132 58 Z" fill="{horn}"/>'
            f'<path d="M14 48 C18 38 22 32 28 28 C32 34 31 42 26 48 Z" fill="{horn}"/>'
            f'<path d="M186 48 C182 38 178 32 172 28 C168 34 169 42 174 48 Z" fill="{horn}"/>'
            f'<ellipse cx="72" cy="48" rx="11" ry="8" fill="{fur}"/>'
            f'<ellipse cx="128" cy="48" rx="11" ry="8" fill="{fur}"/>')


def human_head(skin, hair, cream, cap=None):
    parts = []
    parts.append(f'<ellipse cx="100" cy="80" rx="40" ry="42" fill="{skin}"/>')
    parts.append(f'<ellipse cx="60" cy="86" rx="7" ry="9" fill="{skin}"/>')
    parts.append(f'<ellipse cx="140" cy="86" rx="7" ry="9" fill="{skin}"/>')
    if cap:
        parts.append(cap)
    else:
        parts.append(f'<path d="M60 70 C62 40 138 40 140 70 C128 56 72 56 60 70 Z" fill="{hair}"/>')
    for cx in (86, 114):
        parts.append(f'<circle cx="{cx}" cy="82" r="7.5" fill="{INK}"/>')
        parts.append(f'<circle cx="{cx - 2.5}" cy="79" r="2.4" fill="#FFFFFF"/>')
    parts.append(f'<path d="M88 98 q12 11 24 0" stroke="{INK}" stroke-width="2.6" '
                 f'fill="none" stroke-linecap="round"/>')
    return "".join(parts)


def body_group(outfit, outfit_dark, cream, paw, motif, hood=True):
    parts = []
    # hood bunched behind the neck
    if hood:
        parts.append(f'<path d="M68 124 C74 106 126 106 132 124 C120 134 80 134 68 124 Z" '
                     f'fill="{outfit_dark}"/>')
    # torso
    parts.append(f'<path d="M100 114 C124 114 138 130 138 156 L138 192 '
                 f'C138 202 130 208 120 208 L80 208 C70 208 62 202 62 192 '
                 f'L62 156 C62 130 76 114 100 114 Z" fill="{outfit}"/>')
    # sleeves, tapering from the shoulder to the paw
    parts.append(f'<path d="M66 132 C52 140 46 160 48 180 C49 188 62 188 63 180 '
                 f'C62 164 63 148 70 140 Z" fill="{outfit}"/>')
    parts.append(f'<path d="M134 132 C148 140 154 160 152 180 C151 188 138 188 137 180 '
                 f'C138 164 137 148 130 140 Z" fill="{outfit}"/>')
    # paws
    parts.append(f'<ellipse cx="55.5" cy="184" rx="9" ry="8.5" fill="{paw}"/>')
    parts.append(f'<ellipse cx="144.5" cy="184" rx="9" ry="8.5" fill="{paw}"/>')
    # pocket, a shade lighter so it reads as fabric rather than a hole
    parts.append(f'<path d="M76 178 L124 178 L119 196 L81 196 Z" fill="{outfit_dark}" opacity="0.55"/>')
    # drawstrings
    parts.append(f'<path d="M89 126 v15" stroke="{cream}" stroke-width="2.8" stroke-linecap="round"/>')
    parts.append(f'<path d="M111 126 v15" stroke="{cream}" stroke-width="2.8" stroke-linecap="round"/>')
    # motif on the chest
    parts.append(motif)
    # legs + feet
    parts.append(f'<rect x="78" y="202" width="17" height="18" rx="8" fill="{outfit_dark}"/>')
    parts.append(f'<rect x="105" y="202" width="17" height="18" rx="8" fill="{outfit_dark}"/>')
    parts.append(f'<ellipse cx="85" cy="221" rx="12.5" ry="7.5" fill="{paw}"/>')
    parts.append(f'<ellipse cx="115" cy="221" rx="12.5" ry="7.5" fill="{paw}"/>')
    return "".join(parts)


def candles_motif():
    """Foxy's chest print: three candles, green / red / green."""
    out = []
    for x, col, top, bot, oh, ol in ((86, UP, 148, 170, 143, 175),
                                     (100, DOWN, 153, 168, 148, 173),
                                     (114, UP, 146, 166, 141, 171)):
        out.append(f'<path d="M{x} {oh} V{ol}" stroke="{col}" stroke-width="2.4" stroke-linecap="round"/>')
        out.append(f'<rect x="{x - 5}" y="{top}" width="10" height="{bot - top}" rx="2" fill="{col}"/>')
    return "".join(out)


def arrow_motif(color, up=True):
    if up:
        d = "M100 140 L117 162 L108 162 L108 176 L92 176 L92 162 L83 162 Z"
    else:
        d = "M100 176 L83 154 L92 154 L92 140 L108 140 L108 154 L117 154 Z"
    return f'<path d="{d}" fill="{color}"/>'


def split_motif():
    return (f'<path d="M100 138 v38" stroke="{CREAM}" stroke-width="2.6" stroke-linecap="round" opacity="0.5"/>'
            f'<circle cx="86" cy="157" r="9" fill="{UP}"/>'
            f'<circle cx="114" cy="157" r="9" fill="{DOWN}"/>')


def columns_motif(color):
    out = [f'<path d="M80 142 L120 142 L124 148 L76 148 Z" fill="{color}"/>']
    for x in (83, 96, 109):
        out.append(f'<rect x="{x}" y="150" width="8" height="20" rx="2" fill="{color}"/>')
    out.append(f'<rect x="76" y="172" width="48" height="5" rx="2" fill="{color}"/>')
    return "".join(out)


def phone_motif(color, screen):
    return (f'<rect x="89" y="142" width="22" height="34" rx="5" fill="{color}"/>'
            f'<rect x="92" y="146" width="16" height="24" rx="2" fill="{screen}"/>'
            f'<path d="M95 164 L99 157 L103 161 L106 152" stroke="{UP}" stroke-width="2" '
            f'fill="none" stroke-linecap="round" stroke-linejoin="round"/>')


def bushy_tail(fur, tip):
    return (f'<path d="M124 200 C160 208 186 186 184 154 C182 128 162 116 148 128 '
            f'C132 142 122 174 124 200 Z" fill="{fur}"/>'
            f'<path d="M184 154 C182 128 162 116 148 128 C164 127 178 138 184 154 Z" fill="{tip}"/>')


def small_tail(fur):
    return f'<circle cx="136" cy="198" r="12" fill="{fur}"/>'


CHARACTERS = {}


def add(name, back, body, head, shadow=True):
    CHARACTERS[name] = {
        "back": back,
        "body": body,
        "head": head,
        "shadow": (f'<ellipse cx="100" cy="228" rx="44" ry="7" fill="#000000" opacity="0.14"/>'
                   if shadow else ""),
    }


# --- Foxy, the reference ---------------------------------------------------
add("foxy",
    bushy_tail(ORANGE, CREAM),
    body_group(HOODIE, HOODIE_DARK, CREAM, ORANGE, candles_motif()),
    head_group(ORANGE, ORANGE_DARK, CREAM, pointed_ears(ORANGE, ORANGE_DEEP)))

# --- Bull: wide horns, green hoodie, up arrow ------------------------------
BULL_FUR = "#9BA8AF"
add("bull",
    small_tail(BULL_FUR),
    body_group("#1E7F52", "#166040", CREAM, BULL_FUR, arrow_motif(CREAM, up=True)),
    head_group(BULL_FUR, "#7C8990", "#E7EDF0",
               horn_ears(BULL_FUR, "#EFE6D2"),
               brow=f'<path d="M62 62 C76 50 124 50 138 62 C124 56 76 56 62 62 Z" fill="#7C8990"/>'))

# --- Bear: round ears, red hoodie, down arrow ------------------------------
BEAR_FUR = "#8B5E3C"
add("bear",
    small_tail(BEAR_FUR),
    body_group("#B03A33", "#8A2A25", CREAM, BEAR_FUR, arrow_motif(CREAM, up=False)),
    head_group(BEAR_FUR, "#6F462A", "#E3CDB4",
               round_ears(BEAR_FUR, "#6F462A"),
               brow=f'<path d="M60 64 C76 52 124 52 140 64 C124 58 76 58 60 64 Z" fill="#6F462A"/>'))

# --- Retail trader: the learner's stand-in, cap and a phone ----------------
SKIN = "#E7B489"
CAP = ('<path d="M62 70 C62 40 138 40 138 70 Z" fill="#3B6FD4"/>'
       '<path d="M58 70 C74 64 126 64 142 70 C142 77 58 77 58 70 Z" fill="#2F58AA"/>'
       '<circle cx="100" cy="42" r="5" fill="#2F58AA"/>')
add("retail-trader",
    "",
    body_group("#3B6FD4", "#2F58AA", CREAM, SKIN, phone_motif("#1C2430", "#0E1116")),
    human_head(SKIN, "#3A2A1E", CREAM, cap=CAP))

# --- Market maker: two-faced, buy side and sell side -----------------------
MM_SKIN = "#C9C2D8"
add("market-maker",
    "",
    body_group("#4A4358", "#373242", CREAM, MM_SKIN, split_motif()),
    (f'<ellipse cx="100" cy="80" rx="41" ry="42" fill="{MM_SKIN}"/>'
     f'<path d="M100 38 A41 42 0 0 1 100 122 Z" fill="#B0A6C6"/>'
     f'<path d="M60 68 C62 40 138 40 140 68 C127 55 73 55 60 68 Z" fill="#373242"/>'
     # headset, the always-on quoting cue
     f'<path d="M60 80 C54 56 146 56 140 80" stroke="#373242" stroke-width="6" fill="none"/>'
     f'<rect x="50" y="76" width="13" height="19" rx="6" fill="#373242"/>'
     f'<rect x="137" y="76" width="13" height="19" rx="6" fill="#373242"/>'
     f'<circle cx="86" cy="82" r="8.5" fill="{UP}"/>'
     f'<circle cx="86" cy="82.5" r="4.2" fill="{INK}"/>'
     f'<circle cx="83.8" cy="79.8" r="1.9" fill="#FFFFFF"/>'
     f'<circle cx="114" cy="82" r="8.5" fill="{DOWN}"/>'
     f'<circle cx="114" cy="82.5" r="4.2" fill="{INK}"/>'
     f'<circle cx="111.8" cy="79.8" r="1.9" fill="#FFFFFF"/>'
     f'<path d="M88 100 h24" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>'))

# --- Institution: large, calm, columns -------------------------------------
INST_SKIN = "#B9A894"
add("institution",
    "",
    body_group("#5A6470", "#454D58", CREAM, INST_SKIN, columns_motif(CREAM)),
    (f'<ellipse cx="100" cy="80" rx="42" ry="42" fill="{INST_SKIN}"/>'
     f'<path d="M59 68 C61 40 139 40 141 68 C127 55 73 55 59 68 Z" fill="#6B6257"/>'
     f'<circle cx="86" cy="82" r="7.5" fill="{INK}"/>'
     f'<circle cx="83.5" cy="79" r="2.4" fill="#FFFFFF"/>'
     f'<circle cx="114" cy="82" r="7.5" fill="{INK}"/>'
     f'<circle cx="111.5" cy="79" r="2.4" fill="#FFFFFF"/>'
     f'<path d="M88 98 q12 7 24 0" stroke="{INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>'))


SPARKLES = (f'<path d="M34 54 l5 -12 5 12 12 5 -12 5 -5 12 -5 -12 -12 -5 z" fill="#E5A23C"/>'
            f'<path d="M164 44 l4 -9 4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 z" fill="#E5A23C"/>')


def flat_svg(name, with_sparkles=False):
    c = CHARACTERS[name]
    fx = SPARKLES if with_sparkles else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}" width="200" height="240">'
            f'{c["shadow"]}{c["back"]}{c["body"]}{c["head"]}{fx}</svg>')


if __name__ == "__main__":
    import json, os, sys
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name in CHARACTERS:
        with open(os.path.join(out, f"{name}.svg"), "w") as f:
            f.write(flat_svg(name))
    with open(os.path.join(out, "layers.json"), "w") as f:
        json.dump({"viewBox": VB, "characters": CHARACTERS, "sparkles": SPARKLES}, f, indent=1)
    print("wrote", len(CHARACTERS), "characters to", out)


def emit_ts(path):
    """Write the layer strings as a TS module for the app."""
    order = ["foxy", "bull", "bear", "retail-trader", "market-maker", "institution"]
    lines = [
        "// GENERATED by tools/gen_mascots.py -- do not edit by hand.",
        "//",
        "// Each character is three stacked SVG layers sharing one viewBox, so the app",
        "// can animate the tail, the body and the head independently. docs/UI.md 6.9.",
        "",
        f'export const MASCOT_VIEWBOX = "{VB}";',
        "export const MASCOT_ASPECT = 200 / 240;",
        "",
        "export type MascotLayers = { back: string; body: string; head: string; shadow: string };",
        "",
        "export const MASCOT_ART: Record<string, MascotLayers> = {",
    ]
    for name in order:
        c = CHARACTERS[name]
        lines.append(f'  "{name}": {{')
        for key in ("back", "body", "head", "shadow"):
            v = c[key].replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
            lines.append(f"    {key}: `{v}`,")
        lines.append("  },")
    lines.append("};")
    lines.append("")
    sp = SPARKLES.replace("`", "\\`")
    lines.append(f"export const MASCOT_SPARKLES = `{sp}`;")
    lines.append("")
    with open(path, "w") as f:
        f.write("\n".join(lines))
