# -*- coding: utf-8 -*-
"""
The looks' ground textures: small tiles, repeated across the screen.

- grain.png (Neo, Blueprint): film grain. A smooth digital gradient on a dark
  screen is the look that reads as generated; print and film never have one,
  because the medium itself is grainy. A faint, static noise breaks the banding
  and gives the dark a surface. Static on purpose: grain that crawls is a
  filter effect, grain that stays put is a material. Grey + alpha centred on
  mid-grey, so it darkens and lightens in equal measure and tints nothing.
- scanlines.png (Terminal): one faint light line every third pixel, the raster
  of an old monitor, in place of a grid.
- dots.png (Arcade): a dot at every grid intersection (theme.ts GRID, 28 pt),
  so the arcade board keeps the same 28-point rhythm the charts snap to.

Seeded and deterministic: the files are the same on every run.

  python3 tools/gen_textures.py
"""

import os
import random
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "textures")
GRID = 28


def chunk(kind, data):
    body = kind + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def png(path, width, height, color_type, rows):
    """`rows` is a list of bytes objects, one per row, without filter bytes."""
    raw = b"".join(b"\x00" + r for r in rows)
    data = b"\x89PNG\r\n\x1a\n"
    data += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, color_type, 0, 0, 0))
    data += chunk(b"IDAT", zlib.compress(raw, 9))
    data += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(data)
    print("%-28s %3d x %-3d %6.1f KB" % (os.path.relpath(path, ROOT), width, height, len(data) / 1024))


def grain(size=192, alpha=13):
    rnd = random.Random(1337)
    rows = []
    for _ in range(size):
        row = bytearray()
        for _ in range(size):
            # Sum of two uniforms: a soft bell around mid-grey, fewer hard specks.
            row += bytes((int((rnd.random() + rnd.random()) * 127.5), alpha))
        rows.append(bytes(row))
    png(os.path.join(OUT, "grain.png"), size, size, 4, rows)


def scanlines(width=8, period=3, alpha=12):
    rows = []
    for y in range(period):
        a = alpha if y == 0 else 0
        rows.append(bytes((255, 255, 255, a)) * width)
    png(os.path.join(OUT, "scanlines.png"), width, period, 6, rows)


def dots(size=GRID, alpha=46):
    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            # A 2 x 2 dot, centred on the tile's corner so it sits on the
            # intersection when the tiles meet.
            on = (x in (0, size - 1)) and (y in (0, size - 1))
            row += bytes((255, 255, 255, alpha if on else 0))
        rows.append(bytes(row))
    png(os.path.join(OUT, "dots.png"), size, size, 6, rows)


def main():
    os.makedirs(OUT, exist_ok=True)
    grain()
    scanlines()
    dots()


if __name__ == "__main__":
    main()
