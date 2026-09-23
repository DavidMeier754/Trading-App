# -*- coding: utf-8 -*-
"""
The new look's film grain: one small tile of noise, repeated across the screen.

A smooth digital gradient on a dark screen is the look that reads as generated;
print and film never have one, because the medium itself is grainy. A faint,
static noise over the ground breaks the banding, gives the dark a surface, and
makes the light on it read as light falling on something rather than a colour
field. Static on purpose: grain that crawls is a filter effect, grain that
stays put is a material.

Grey + alpha, values centred on mid-grey, so the tile darkens and lightens in
equal measure and does not tint the ground. Seeded, so the file is the same on
every run.

  python3 tools/gen_grain.py
"""

import os
import random
import struct
import zlib

SIZE = 192
ALPHA = 13  # of 255: about 5% -- felt more than seen
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "textures", "grain.png")


def chunk(kind, data):
    body = kind + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def main():
    rnd = random.Random(1337)
    rows = bytearray()
    for _ in range(SIZE):
        rows.append(0)  # filter: none
        for _ in range(SIZE):
            # Sum of two uniforms: a soft bell around mid-grey, fewer hard specks.
            g = int((rnd.random() + rnd.random()) * 127.5)
            rows += bytes((g, ALPHA))
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 4, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(rows), 9))
    png += chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "wb") as f:
        f.write(png)
    print("%s  %d x %d  %.1f KB" % (os.path.relpath(OUT, ROOT), SIZE, SIZE, len(png) / 1024))


if __name__ == "__main__":
    main()
