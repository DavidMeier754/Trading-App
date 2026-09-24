# -*- coding: utf-8 -*-
"""
The app's sounds and haptic patterns, from one table.

docs/UI.md 5.1 pairs every verdict with a sound and a haptic, and 10 gives each
its own toggle. They used to be two separate lists -- six WAVs here, a haptic per
call site in `src/lesson/haptics.ts` -- and they drifted: an answer card ticked
the motor on the way down, ticked it again on the way up, and made its only
sound on the second one.

So a cue is now a list of *pulses*. A pulse is one haptic and the notes that
start with it. This script renders each cue's notes into `assets/sounds/<cue>.wav`
and writes the same pulse times and haptic styles into
`src/lesson/cues.generated.ts`, which is what the app fires the motor from. The
sound and the haptic of a cue cannot disagree about when things happen, because
neither is written by hand.

Design rules:

- Everything is in C major. Cues follow each other closely -- a verdict into
  the streak's bloom, the ring's arpeggio into the chord -- and one key means
  any two that overlap are consonant.
- Weight matches weight. A `selection` pulse gets a tick or a short mallet
  note; `rigid` gets something bright and dry; `medium` a knock; `heavy` a low
  thud under a chord. A strong sound on a faint haptic, or the other way round,
  is exactly the mismatch this table exists to prevent.
- Good news is bright and rises, bad news is dull and falls, soft enough not to
  scold: a wrong answer in a lesson costs nothing but a second look (UI.md 1).
- Short where it repeats. A tick is 26 ms; a cue the learner hears on every
  screen is gone in well under half a second. Only the rare moments -- a
  finished lesson, a badge, a tier -- are allowed to ring.
- Soft where it repeats most. What sounds on every screen or under a dragging
  finger is round and low -- felt, not glass -- because a bright sound heard
  forty times stops being feedback and starts being a nag.

  python3 tools/gen_sounds.py
"""

import math
import os
import random
import struct
import sys
import wave

RATE = 22050
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOUND_DIR = os.path.join(ROOT, "assets", "sounds")
TS_OUT = os.path.join(ROOT, "src", "lesson", "cues.generated.ts")

HAPTICS = ("selection", "soft", "light", "medium", "rigid", "heavy")

# --------------------------------------------------------------------------
# Pitch
# --------------------------------------------------------------------------

_SEMITONE = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}


def hz(name):
    """'A4' -> 440.0, 'C#6' -> ..."""
    letter, rest = name[0], name[1:]
    shift = 0
    while rest and rest[0] in "#b":
        shift += 1 if rest[0] == "#" else -1
        rest = rest[1:]
    octave = int(rest)
    n = _SEMITONE[letter] + shift + (octave - 4) * 12
    return 440.0 * 2 ** (n / 12.0)


# C major pentatonic across two octaves: any run of these sounds like a tune,
# which matters when the order is set by a price series nobody composed.
PENTATONIC = ["C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6", "G6", "A6"]

# --------------------------------------------------------------------------
# Voices
# --------------------------------------------------------------------------


def _attack(i, a):
    return 0.5 - 0.5 * math.cos(math.pi * i / a) if i < a else 1.0


def _render(n, fn):
    return [fn(i, i / RATE) for i in range(n)]


def bell(freq, ms, gain=1.0):
    """A soft glass mallet: a few partials, the upper ones dying first."""
    n = int(RATE * ms / 1000)
    tau = ms / 1000 * 0.42
    partials = ((1.0, 1.0, 1.0), (2.0, 0.26, 1.7), (3.01, 0.09, 2.6), (4.18, 0.045, 3.4))
    a = max(1, int(RATE * 0.004))

    def f(i, t):
        v = 0.0
        for ratio, amp, fast in partials:
            if freq * ratio > RATE * 0.45:
                continue
            v += amp * math.sin(2 * math.pi * freq * ratio * t) * math.exp(-t * fast / tau)
        return gain * v * _attack(i, a) / 1.4

    return _fade_tail(_render(n, f), 0.12)


def marimba(freq, ms, gain=1.0):
    """Wood: a strong fundamental, the marimba's 4x partial, a mallet click."""
    n = int(RATE * ms / 1000)
    tau = ms / 1000 * 0.30
    a = max(1, int(RATE * 0.0025))
    rnd = random.Random(int(freq))
    click = [rnd.uniform(-1, 1) for _ in range(int(RATE * 0.003))]

    def f(i, t):
        v = math.sin(2 * math.pi * freq * t) * math.exp(-t / tau)
        if freq * 3.93 < RATE * 0.45:
            v += 0.16 * math.sin(2 * math.pi * freq * 3.93 * t) * math.exp(-t * 3.2 / tau)
        if i < len(click):
            v += 0.10 * click[i] * (1 - i / len(click))
        return gain * v * _attack(i, a)

    return _fade_tail(_render(n, f), 0.15)


def tick(freq, ms, gain=1.0):
    """A click with a pitch in it: a very short sine and a breath of noise."""
    n = int(RATE * ms / 1000)
    rnd = random.Random(7)

    def f(i, t):
        env = math.exp(-t / 0.0055)
        v = math.sin(2 * math.pi * freq * t) * env
        v += 0.25 * rnd.uniform(-1, 1) * math.exp(-t / 0.0012)
        return gain * v * _attack(i, 12)

    return _fade_tail(_render(n, f), 0.3)


def knock(freq, ms, gain=1.0):
    """A dull wooden knock that sags a little in pitch: the 'not quite' voice."""
    n = int(RATE * ms / 1000)
    tau = ms / 1000 * 0.24
    a = max(1, int(RATE * 0.003))
    phase = [0.0]

    def f(i, t):
        glide = 1.0 - 0.05 * min(1.0, t / 0.035)
        phase[0] += 2 * math.pi * freq * glide / RATE
        v = math.sin(phase[0]) + 0.22 * math.sin(2 * phase[0]) * math.exp(-t / (tau * 0.4))
        return gain * v * math.exp(-t / tau) * _attack(i, a) / 1.22

    return _fade_tail(_render(n, f), 0.18)


def pop(freq, ms, gain=1.0):
    """A bubble: the pitch lifts into the note, which reads as something landing."""
    n = int(RATE * ms / 1000)
    phase = [0.0]

    def f(i, t):
        lift = 0.72 + 0.28 * min(1.0, t / 0.022)
        phase[0] += 2 * math.pi * freq * lift / RATE
        env = math.exp(-t / 0.055)
        return gain * math.sin(phase[0]) * env * _attack(i, 30)

    return _fade_tail(_render(n, f), 0.2)


def thud(freq, ms, gain=1.0):
    """Something heavy set down: a low sine falling onto its pitch."""
    n = int(RATE * ms / 1000)
    phase = [0.0]
    rnd = random.Random(3)

    def f(i, t):
        glide = 1.0 + 0.7 * math.exp(-t / 0.018)
        phase[0] += 2 * math.pi * freq * glide / RATE
        v = math.sin(phase[0]) * math.exp(-t / 0.075)
        v += 0.12 * rnd.uniform(-1, 1) * math.exp(-t / 0.006)
        return gain * v * _attack(i, 40)

    return _fade_tail(_render(n, f), 0.2)


def shimmer(freq, ms, gain=1.0):
    """A sparkle: three detuned high partials swelling and trembling out."""
    n = int(RATE * ms / 1000)
    parts = ((1.0, 1.0), (1.5, 0.55), (2.003, 0.4))

    def f(i, t):
        u = i / max(1, n - 1)
        env = math.sin(math.pi * min(1.0, u / 0.35) / 2) * (1 - u) ** 1.6
        trem = 0.75 + 0.25 * math.sin(2 * math.pi * 11 * t)
        v = 0.0
        for ratio, amp in parts:
            if freq * ratio < RATE * 0.45:
                v += amp * math.sin(2 * math.pi * freq * ratio * t)
        return gain * v * env * trem / 1.95

    return _render(n, f)


def felt(freq, ms, gain=1.0):
    """A felt hammer on a soft string: a round sine, a trace of the octave, no click."""
    n = int(RATE * ms / 1000)
    tau = ms / 1000 * 0.3
    a = max(1, int(RATE * min(0.008, ms / 1000 * 0.2)))

    def f(i, t):
        v = math.sin(2 * math.pi * freq * t)
        v += 0.12 * math.sin(4 * math.pi * freq * t) * math.exp(-t / (tau * 0.45))
        return gain * v * math.exp(-t / tau) * _attack(i, a) / 1.12

    return _fade_tail(_render(n, f), 0.25)


VOICES = {
    "felt": felt,
    "bell": bell,
    "marimba": marimba,
    "tick": tick,
    "knock": knock,
    "pop": pop,
    "thud": thud,
    "shimmer": shimmer,
}


def _fade_tail(samples, frac):
    """Raised-cosine fade over the last `frac`, so nothing ends on a click."""
    n = len(samples)
    r = max(1, int(n * frac))
    for i in range(n - r, n):
        samples[i] *= 0.5 - 0.5 * math.cos(math.pi * (n - i) / r)
    return samples


# --------------------------------------------------------------------------
# Room
# --------------------------------------------------------------------------


def room(samples, wet, tail_ms):
    """
    A small Schroeder room: four combs into two allpasses. A dry synth tone
    reads as a beep; a little air around it reads as an instrument.
    """
    if wet <= 0:
        return samples
    tail = int(RATE * tail_ms / 1000)
    x = samples + [0.0] * tail
    n = len(x)
    out = [0.0] * n
    for delay_ms, fb in ((29.7, 0.72), (37.1, 0.70), (41.1, 0.68), (43.7, 0.66)):
        d = int(RATE * delay_ms / 1000)
        buf = [0.0] * n
        for i in range(n):
            buf[i] = x[i] + (fb * buf[i - d] if i >= d else 0.0)
        for i in range(n):
            out[i] += buf[i] * 0.25
    for delay_ms, g in ((5.0, 0.7), (1.7, 0.7)):
        d = int(RATE * delay_ms / 1000)
        y = [0.0] * n
        for i in range(n):
            xd = out[i - d] if i >= d else 0.0
            yd = y[i - d] if i >= d else 0.0
            y[i] = -g * out[i] + xd + g * yd
        out = y
    mixed = [x[i] * (1 - wet) + out[i] * wet for i in range(n)]
    return _fade_tail(mixed, min(0.5, tail / max(1, n)))


# --------------------------------------------------------------------------
# The table
# --------------------------------------------------------------------------


def N(voice, note, ms, gain=1.0):
    return {"voice": voice, "freq": hz(note) if isinstance(note, str) else note,
            "note": note, "ms": ms, "gain": gain}


def P(t, haptic, notes):
    assert haptic in HAPTICS, haptic
    return {"t": t, "haptic": haptic, "notes": notes}


def correct(root, fifth):
    """
    A rising fifth, crisp on both pulses. The second right answer in a row is
    this same chime moved up a fourth, nothing added, so the climb is heard as
    the same "yes" getting higher.
    """
    return [
        P(0, "light", [N("bell", root, 420, 0.78), N("bell", hz(root) / 2, 380, 0.22)]),
        P(120, "rigid", [N("bell", fifth, 620, 1.0), N("tick", fifth, 20, 0.2)]),
    ]


CUES = {
    # -- choosing and moving on -------------------------------------------
    # The lightest pair there is: a finger landing on an option, a tile, a key.
    "tick": dict(pulses=[P(0, "selection", [N("tick", "E7", 26)])], peak=0.15, wet=0.0),
    # A drag passing a step -- a slider's 5, a line's fifth cent, a chip
    # picked up. It comes many times a second under a moving finger, so it is
    # barely there: a breath of a felt note, a third of a tick's level, and no
    # click in it at all.
    "detent": dict(pulses=[P(0, "selection", [N("felt", "E5", 30)])], peak=0.05, wet=0.0),
    # Continue / Got it: heard fifteen times a lesson and more, so it is the
    # softest thing a screen change can be -- one round felt note, low in the
    # middle of the range, with a faint fifth over it and a little room. The
    # bubble-and-bell before it was bright enough to grate by the tenth screen;
    # the wooden G4 before that sounded like a door closing.
    "advance": dict(
        pulses=[P(0, "light", [N("felt", "E5", 300, 0.9), N("felt", "B5", 220, 0.14)])],
        peak=0.13, wet=0.2,
    ),
    # Committing a trade call: a latch -- a bright click, then the bolt landing.
    "commit": dict(
        pulses=[
            P(0, "rigid", [N("tick", "C7", 22, 0.8), N("marimba", "C5", 140, 0.7)]),
            P(70, "medium", [N("knock", "G3", 220, 1.0)]),
        ],
        peak=0.30, wet=0.12,
    ),
    # -- verdicts ----------------------------------------------------------
    # A run of right answers is three sounds, no more (lesson/feedback.ts):
    # the chime for the first, the same chime a fourth higher for the second,
    # and from the third on the streak sound, the same every time.
    "correct0": dict(pulses=correct("G5", "D6"), peak=0.28, wet=0.22),
    "correct1": dict(pulses=correct("C6", "G6"), peak=0.28, wet=0.22),
    # Streak mode, three or more in a row: not a higher chime but a different
    # sound that stays put. The same glass bells rolling up a C major chord,
    # E5 G5 into C6, with a low C under the top note and a little sparkle on
    # it -- an arrival, heard as many times as the run lasts, so nothing in it
    # is shrill and nothing is noise. (The version before rushed in on a
    # filtered-noise swell over a low felt thud, and next to the chimes it
    # sounded like a different app.)
    "streak": dict(
        pulses=[
            P(0, "light", [N("bell", "E5", 620, 0.6)]),
            P(75, "light", [N("bell", "G5", 640, 0.66)]),
            P(150, "medium", [N("bell", "C6", 900, 0.92), N("bell", "C5", 760, 0.32),
                              N("shimmer", "C6", 820, 0.26)]),
        ],
        peak=0.29, wet=0.24,
    ),
    # Reasonable: one soft, level note. Neither the rise nor the fall.
    "amber": dict(pulses=[P(0, "soft", [N("bell", "E5", 460)])], peak=0.24, wet=0.2),
    # Not quite: a falling third, dull and quiet. The two pulses sit on the two
    # peaks of the wobble (lesson/Shake.tsx reads them from here).
    "wrong": dict(
        pulses=[
            P(0, "medium", [N("knock", "G4", 240)]),
            P(170, "soft", [N("knock", "E4", 360, 0.9)]),
        ],
        peak=0.25, wet=0.12,
    ),
    # -- match ---------------------------------------------------------------
    # A pair locking in. Each hit on a screen pops a step higher.
    **{
        "pop%d" % i: dict(pulses=[P(0, "light", [N("pop", note, 150)])], peak=0.25, wet=0.12)
        for i, note in enumerate(["G5", "C6", "E6", "G6"])
    },
    # A pair bouncing back: one dry knock, no scolding.
    "miss": dict(pulses=[P(0, "rigid", [N("knock", "D4", 200)])], peak=0.22, wet=0.08),
    # -- notes: replay bars, the ring, the checklist ---------------------------
    # One per pentatonic step, low to high. The replay picks by price, the ring
    # and the checklist climb them in order.
    **{
        "note%d" % i: dict(
            pulses=[P(0, "selection", [N("marimba", note, 200), N("bell", hz(note) * 2, 140, 0.10)])],
            peak=0.21, wet=0.16,
        )
        for i, note in enumerate(PENTATONIC)
    },
    # -- celebration -----------------------------------------------------------
    # XP counting up: a coin. Tiny, because it fires a dozen times in a second.
    "coin": dict(pulses=[P(0, "selection", [N("bell", "C7", 110), N("tick", "G7", 14, 0.3)])],
                 peak=0.13, wet=0.10),
    # The ring closing: a C major chord landing on a heavy pulse, and two light
    # echoes above it.
    "complete": dict(
        pulses=[
            P(0, "heavy", [N("thud", "C3", 240, 0.55), N("bell", "C5", 1000, 0.55),
                           N("bell", "E5", 1000, 0.5), N("bell", "G5", 1000, 0.5),
                           N("bell", "C6", 1100, 0.6)]),
            P(150, "light", [N("bell", "E6", 700, 0.36)]),
            P(300, "light", [N("bell", "G6", 700, 0.32), N("shimmer", "C7", 900, 0.35)]),
        ],
        peak=0.33, wet=0.28,
    ),
    # A perfect run: the same chord, and a run up the octave on top of it.
    "perfect": dict(
        pulses=[
            P(0, "heavy", [N("thud", "C3", 260, 0.6), N("bell", "C5", 1300, 0.55),
                           N("bell", "E5", 1300, 0.5), N("bell", "G5", 1300, 0.5),
                           N("bell", "C6", 1400, 0.6)]),
            P(120, "light", [N("bell", "E6", 700, 0.40)]),
            P(240, "light", [N("bell", "G6", 700, 0.38)]),
            P(360, "rigid", [N("bell", "C7", 900, 0.42), N("shimmer", "E7", 1200, 0.40)]),
            P(520, "selection", [N("bell", "G7", 500, 0.22)]),
        ],
        peak=0.34, wet=0.30,
    ),
    # A chapter badge landing: weight first, then the light around it.
    "badge": dict(
        pulses=[
            P(0, "heavy", [N("thud", "C2", 320, 0.9), N("bell", "C5", 1200, 0.45),
                           N("bell", "G5", 1200, 0.35)]),
            P(180, "light", [N("shimmer", "C7", 1000, 0.55), N("bell", "E6", 800, 0.3)]),
        ],
        peak=0.34, wet=0.30,
    ),
    # "Chapter N unlocked": the correct chime's shape, a fourth lower, softer.
    "unlock": dict(
        pulses=[P(0, "light", [N("bell", "G5", 380, 0.7)]),
                P(110, "rigid", [N("bell", "C6", 700, 0.9)])],
        peak=0.25, wet=0.25,
    ),
    # A tier: rarer and louder than a badge (UI.md 5.5). A pickup, then the chord.
    "tier": dict(
        pulses=[
            P(0, "light", [N("bell", "G4", 260, 0.6)]),
            P(140, "light", [N("bell", "C5", 260, 0.65)]),
            P(280, "medium", [N("bell", "E5", 300, 0.7)]),
            P(460, "heavy", [N("thud", "C2", 360, 0.9), N("bell", "C5", 1500, 0.55),
                             N("bell", "E5", 1500, 0.5), N("bell", "G5", 1500, 0.5),
                             N("bell", "C6", 1600, 0.6)]),
            P(640, "light", [N("shimmer", "C7", 1300, 0.5), N("bell", "G6", 900, 0.3)]),
        ],
        peak=0.35, wet=0.30,
    ),
}


# --------------------------------------------------------------------------
# Render
# --------------------------------------------------------------------------


def render(cue):
    length = 0
    for p in cue["pulses"]:
        for note in p["notes"]:
            length = max(length, int(RATE * (p["t"] + note["ms"]) / 1000))
    mix = [0.0] * length
    for p in cue["pulses"]:
        start = int(RATE * p["t"] / 1000)
        for note in p["notes"]:
            voice = VOICES[note["voice"]]
            for i, v in enumerate(voice(note["freq"], note["ms"], note["gain"])):
                mix[start + i] += v
    mix = room(mix, cue.get("wet", 0.0), 160 if cue.get("wet", 0.0) else 0)
    peak = max(1e-9, max(abs(s) for s in mix))
    scale = cue["peak"] / peak
    return trim([s * scale for s in mix])


def trim(samples, floor=0.0018):
    """
    Cut the tail once it is below hearing on a phone speaker (about -55 dBFS),
    with a short fade so the cut itself is silent. The long bells and the room
    ring out in the table's arithmetic well after anyone can hear them, and the
    web build fetches every one of these files.
    """
    last = len(samples) - 1
    while last > 0 and abs(samples[last]) < floor:
        last -= 1
    end = min(len(samples), last + int(RATE * 0.012))
    return _fade_tail(samples[:end], min(0.5, (RATE * 0.012) / max(1, end)))


def write_wav(path, samples):
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes(b"".join(
            struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767)) for s in samples
        ))
    return os.path.getsize(path)


def check(name, cue):
    """Every pulse must start a note: a haptic with nothing to hear is the mismatch."""
    ts = [p["t"] for p in cue["pulses"]]
    assert ts == sorted(ts), "%s: pulses out of order" % name
    for p in cue["pulses"]:
        assert p["notes"], "%s: pulse at %d ms has no sound" % (name, p["t"])


def write_ts(names):
    lines = [
        "// Generated by tools/gen_sounds.py from its CUES table. Do not edit by hand:",
        "// change the table and re-run the script, which rewrites this file and the",
        "// WAVs together.",
        "//",
        "// Every pulse is one haptic and the notes that start with it, so the sound",
        "// of a cue and its haptic pattern are written from the same numbers.",
        "",
        "export type HapticStyle = %s;" % " | ".join("'%s'" % h for h in HAPTICS),
        "",
        "export type Pulse = readonly [ms: number, haptic: HapticStyle];",
        "",
        "export const CUES = {",
    ]
    for name in names:
        cue = CUES[name]
        pulses = ", ".join("[%d, '%s']" % (p["t"], p["haptic"]) for p in cue["pulses"])
        lines.append("  %s: {" % name)
        lines.append("    file: require('../../assets/sounds/%s.wav'),"% name)
        lines.append("    pulses: [%s] as readonly Pulse[]," % pulses)
        lines.append("  },")
    lines += ["} as const;", "", "export type CueName = keyof typeof CUES;", ""]
    with open(TS_OUT, "w") as f:
        f.write("\n".join(lines))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else SOUND_DIR
    os.makedirs(out, exist_ok=True)
    for stale in os.listdir(out):
        if stale.endswith(".wav") and stale[:-4] not in CUES:
            os.remove(os.path.join(out, stale))
    total = 0
    for name, cue in CUES.items():
        check(name, cue)
        samples = render(cue)
        size = write_wav(os.path.join(out, name + ".wav"), samples)
        total += size
        print("%-10s %5.0f ms  %5.1f KB  pulses %s" % (
            name, 1000 * len(samples) / RATE, size / 1024,
            " ".join("%d:%s" % (p["t"], p["haptic"]) for p in cue["pulses"])))
    write_ts(list(CUES))
    print("total %.1f KB in %d cues -> %s" % (total / 1024, len(CUES), os.path.relpath(TS_OUT, ROOT)))


if __name__ == "__main__":
    main()
