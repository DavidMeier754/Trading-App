# -*- coding: utf-8 -*-
"""
The app's sound effects, synthesised.

docs/UI.md 5.1 asks for a soft "ding" on a correct answer and 10 gives sounds
their own toggle, so these are content the app owes, not decoration. They are
generated rather than sourced: a handful of short tones needs no library and no
licence, and a generator can be re-run when the palette changes.

Design rules, such as they are:

- Short. The longest is the end-of-lesson flourish at well under a second;
  everything inside a question is 30-250 ms. A sound the learner hears several
  hundred times over a path has to be over before it is noticed.
- Soft. Peak amplitude stays near a quarter of full scale, and every tone gets a
  raised-cosine envelope so it fades in and out instead of clicking.
- Consonant where the news is good and lower where it is not, which is the one
  convention nobody has to be taught: a rising fifth for correct, a falling
  minor third for wrong, one flat note for the amber middle.

  python3 tools/gen_sounds.py assets/sounds
"""

import math
import os
import struct
import sys
import wave

RATE = 44100


def envelope(i, n, attack=0.12, release=0.5):
    """Raised cosine in, raised cosine out. Keeps the ends silent."""
    a = max(1, int(n * attack))
    r = max(1, int(n * release))
    if i < a:
        return 0.5 - 0.5 * math.cos(math.pi * i / a)
    if i > n - r:
        return 0.5 - 0.5 * math.cos(math.pi * (n - i) / r)
    return 1.0


def tone(freq, ms, amp=0.25, harmonic=0.18, attack=0.12, release=0.5):
    """One note: a sine plus a quiet octave, so it reads as an instrument."""
    n = int(RATE * ms / 1000)
    out = []
    for i in range(n):
        t = i / RATE
        v = math.sin(2 * math.pi * freq * t)
        v += harmonic * math.sin(4 * math.pi * freq * t)
        out.append(v * amp * envelope(i, n, attack, release) / (1 + harmonic))
    return out


def silence(ms):
    return [0.0] * int(RATE * ms / 1000)


def write(path, samples):
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(RATE)
        frames = b"".join(
            struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767)) for s in samples
        )
        f.writeframes(frames)
    return os.path.getsize(path)


# A5, E6 -- a rising fifth.
CORRECT = tone(880.0, 90, amp=0.22) + tone(1318.5, 150, amp=0.24, release=0.65)
# E5 alone: neither the rise nor the fall. "Reasonable", not "right".
AMBER = tone(659.3, 170, amp=0.20, release=0.6)
# G4 down to E4 -- a falling minor third, soft enough not to scold.
WRONG = tone(392.0, 110, amp=0.20) + tone(329.6, 180, amp=0.22, release=0.6)
# A tick, not a note: high, 30 ms, and barely there.
TAP = tone(2100.0, 30, amp=0.10, harmonic=0.0, attack=0.25, release=0.6)
# The decision commits: one low, definite note.
COMMIT = tone(523.3, 120, amp=0.20, release=0.6)
# C5 E5 G5 C6, the end of a lesson.
COMPLETE = (
    tone(523.3, 95, amp=0.20)
    + tone(659.3, 95, amp=0.20)
    + tone(784.0, 95, amp=0.21)
    + tone(1046.5, 320, amp=0.24, release=0.7)
)

SOUNDS = {
    "correct": CORRECT,
    "amber": AMBER,
    "wrong": WRONG,
    "tap": TAP,
    "commit": COMMIT,
    "complete": COMPLETE,
}


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "assets/sounds"
    os.makedirs(out, exist_ok=True)
    total = 0
    for name, samples in SOUNDS.items():
        path = os.path.join(out, name + ".wav")
        size = write(path, samples)
        total += size
        print("%-10s %5.0f ms  %6.1f KB" % (name, 1000 * len(samples) / RATE, size / 1024))
    print("total %.1f KB" % (total / 1024))


if __name__ == "__main__":
    main()
