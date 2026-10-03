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


def kalimba(freq, ms, gain=1.0):
    """
    A tine under a thumb: a round fundamental, a soft octave that fades first,
    and a faint high tine partial gone within a few milliseconds. No noise and
    a 3 ms attack, so it starts smoothly -- the warm voice of the new palette.
    """
    n = int(RATE * ms / 1000)
    tau = ms / 1000 * 0.32
    a = max(1, int(RATE * 0.003))

    def f(i, t):
        v = math.sin(2 * math.pi * freq * t)
        v += 0.20 * math.sin(4 * math.pi * freq * t) * math.exp(-t / (tau * 0.35))
        if freq * 5.4 < RATE * 0.45:
            v += 0.05 * math.sin(2 * math.pi * freq * 5.4 * t) * math.exp(-t / 0.006)
        return gain * v * math.exp(-t / tau) * _attack(i, a) / 1.2

    return _fade_tail(_render(n, f), 0.2)


def softtap(freq, ms, gain=1.0):
    """
    A fingertip on wood, felt more than heard: a sine that settles a little
    down onto its pitch, a 1.5 ms attack and a quick round decay. It replaces
    the old tick, whose high E7 and burst of noise were what made it sharp.
    """
    n = int(RATE * ms / 1000)
    a = max(1, int(RATE * 0.0015))
    phase = [0.0]

    def f(i, t):
        glide = 1.0 + 0.12 * math.exp(-t / 0.004)
        phase[0] += 2 * math.pi * freq * glide / RATE
        return gain * math.sin(phase[0]) * math.exp(-t / 0.011) * _attack(i, a)

    return _fade_tail(_render(n, f), 0.35)


def pad(freq, ms, gain=1.0):
    """A soft swell under a chord: fundamental, octave and a quiet twelfth, slow in and out."""
    n = int(RATE * ms / 1000)
    a = max(1, int(RATE * 0.05))

    def f(i, t):
        u = i / max(1, n - 1)
        v = math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(4 * math.pi * freq * t)
        v += 0.12 * math.sin(6 * math.pi * freq * t)
        return gain * v * _attack(i, a) * (1 - u) ** 1.8 / 1.42

    return _render(n, f)


def glide(freq, ms, gain=1.0):
    """A soft pluck that slides up a fourth into its note: moving on, not arriving."""
    n = int(RATE * ms / 1000)
    a = max(1, int(RATE * 0.004))
    phase = [0.0]

    def f(i, t):
        slide = 0.75 + 0.25 * min(1.0, t / 0.05)
        phase[0] += 2 * math.pi * freq * slide / RATE
        v = math.sin(phase[0]) + 0.12 * math.sin(2 * phase[0])
        return gain * v * math.exp(-t / (ms / 1000 * 0.3)) * _attack(i, a) / 1.12

    return _fade_tail(_render(n, f), 0.25)


def _noise_sweep(f_start, f_end, ms, gain, peak_at, seed):
    """
    Air: noise through two low-pass stages whose cutoff sweeps from `f_start`
    to `f_end`, with the rumble taken out, swelling to `peak_at` of its length
    and dying away after it.
    """
    n = int(RATE * ms / 1000)
    rnd = random.Random(seed)
    lp1 = lp2 = 0.0
    hp_in = hp_out = 0.0
    out = []
    for i in range(n):
        u = i / max(1, n - 1)
        fc = f_start * (f_end / f_start) ** u
        a = 1 - math.exp(-2 * math.pi * fc / RATE)
        lp1 += a * (rnd.uniform(-1, 1) - lp1)
        lp2 += a * (lp1 - lp2)
        hp = lp2 - hp_in + 0.965 * hp_out
        hp_in, hp_out = lp2, hp
        env = (u / peak_at) ** 1.5 if u < peak_at else ((1 - u) / (1 - peak_at)) ** 2
        out.append(gain * hp * env * 2.4)
    return _fade_tail(out, 0.1)


def whoosh(freq, ms, gain=1.0):
    """A flame catching: air brightening up to `freq` (a number, in Hz) as it swells."""
    return _noise_sweep(freq / 8, freq, ms, gain, 0.55, 11)


def exhale(freq, ms, gain=1.0):
    """A flame going out: air dulling down from `freq` (Hz), loudest at the start."""
    return _noise_sweep(freq, freq / 10, ms, gain, 0.12, 13)


def crackle(freq, ms, gain=1.0):
    """
    Embers: tiny pops of noise at uneven gaps, thinning out -- wood catching.
    `freq` only seeds where the pops fall.
    """
    n = int(RATE * ms / 1000)
    rnd = random.Random(int(freq) + 5)
    out = [0.0] * n
    t = 0
    while True:
        t += int(RATE * rnd.uniform(0.014, 0.07))
        if t >= n:
            break
        amp = rnd.uniform(0.3, 1.0) * (1 - t / n) ** 1.2
        length = max(2, int(RATE * rnd.uniform(0.002, 0.006)))
        for j in range(length):
            if t + j < n:
                out[t + j] += amp * rnd.uniform(-1, 1) * math.exp(-j / (length * 0.3))
    prev = 0.0
    for i in range(n):
        x = out[i]
        out[i] = gain * (x - 0.6 * prev)
        prev = x
    return out


VOICES = {
    "whoosh": whoosh,
    "exhale": exhale,
    "crackle": crackle,
    "felt": felt,
    "bell": bell,
    "marimba": marimba,
    "tick": tick,
    "knock": knock,
    "pop": pop,
    "thud": thud,
    "shimmer": shimmer,
    "kalimba": kalimba,
    "softtap": softtap,
    "pad": pad,
    "glide": glide,
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


def chime(low, high):
    """
    A right answer: two kalimba notes rising, the second landing on a light
    pulse, over a quiet pad on the lower one. The three steps of a run are
    this same shape moved up (lesson/feedback.ts), so the climb is heard as
    the same "yes" getting higher.
    """
    return [
        P(0, "light", [N("kalimba", low, 420, 0.75), N("pad", hz(low) / 2, 520, 0.16)]),
        P(95, "rigid", [N("kalimba", high, 640, 1.0)]),
    ]


CUES = {
    # -- choosing and moving on -------------------------------------------
    # A finger landing on an option, a tile, a key. Heard more than anything
    # else, so it is the smoothest sound in the app: a soft tap on wood around
    # A5, no noise, no edge. (The old one was a 26 ms E7 with a burst of noise.)
    "tick": dict(pulses=[P(0, "selection", [N("softtap", "A5", 55)])], peak=0.12, wet=0.0),
    # A drag passing a step. Many a second under a moving finger: the same tap,
    # lower and at a third of the level.
    "detent": dict(pulses=[P(0, "selection", [N("softtap", "E5", 40)])], peak=0.045, wet=0.0),
    # Continue / Got it: a soft pluck sliding up into G5 -- the page moving on.
    "advance": dict(
        pulses=[P(0, "light", [N("glide", "G5", 260, 0.9), N("pad", "C5", 300, 0.12)])],
        peak=0.11, wet=0.18,
    ),
    # Committing a trade call: a low wooden thock and a kalimba fifth on it --
    # decided, with no click in it.
    "commit": dict(
        pulses=[
            P(0, "rigid", [N("softtap", "C5", 60, 0.8), N("kalimba", "G4", 260, 0.7)]),
            P(70, "medium", [N("kalimba", "C4", 380, 0.9), N("pad", "C3", 400, 0.25)]),
        ],
        peak=0.27, wet=0.14,
    ),
    # -- verdicts ----------------------------------------------------------
    # A run of right answers climbs three steps (lesson/feedback.ts). Each is
    # higher than the last and none goes shrill: the first tops out on G5, the
    # second on C6, and the third -- the streak, the same from then on --
    # rolls a whole C major chord up to G6 over a swelling pad, with a
    # sparkle on top. It is the only verdict with three notes and a chord
    # under it, so it is told apart at once.
    "correct0": dict(pulses=chime("E5", "G5"), peak=0.27, wet=0.2),
    "correct1": dict(pulses=chime("G5", "C6"), peak=0.27, wet=0.2),
    "streak": dict(
        pulses=[
            P(0, "light", [N("kalimba", "C6", 520, 0.7), N("pad", "C4", 1100, 0.22),
                           N("pad", "G4", 1100, 0.14)]),
            P(80, "light", [N("kalimba", "E6", 560, 0.75)]),
            P(160, "medium", [N("kalimba", "G6", 900, 0.95), N("kalimba", "C5", 700, 0.3),
                              N("shimmer", "G6", 700, 0.14)]),
        ],
        peak=0.29, wet=0.26,
    ),
    # Reasonable: one soft, level note. Neither the rise nor the fall.
    "amber": dict(pulses=[P(0, "soft", [N("kalimba", "E5", 480), N("pad", "C4", 500, 0.14)])],
                  peak=0.22, wet=0.2),
    # Not quite: a falling third, dull and quiet. The two pulses sit on the two
    # peaks of the wobble (lesson/Shake.tsx reads them from here).
    "wrong": dict(
        pulses=[
            P(0, "medium", [N("knock", "G4", 240)]),
            P(170, "soft", [N("knock", "E4", 360, 0.9)]),
        ],
        peak=0.25, wet=0.12,
    ),
    # -- match (unchanged) ---------------------------------------------------------------
    # A pair locking in. Each hit on a screen pops a step higher.
    **{
        "pop%d" % i: dict(pulses=[P(0, "light", [N("pop", note, 150)])], peak=0.25, wet=0.12)
        for i, note in enumerate(["G5", "C6", "E6", "G6"])
    },
    # A chapter's medal landing (docs/UI.md §5.4, DESIGN-REVIEW: the bigger the
    # accomplishment, the bigger the moment). Heavier and longer than the
    # badge it replaces: a low thud as it lands, a bell-like fifth rising over
    # a warm chord, and a long shimmer as the light runs across its face.
    "medal": dict(
        pulses=[
            P(0, "heavy", [N("knock", "C3", 260, 0.9), N("pad", "C3", 1900, 0.4),
                           N("pad", "G3", 1900, 0.28), N("kalimba", "C5", 900, 0.7)]),
            P(150, "rigid", [N("kalimba", "G5", 900, 0.7), N("pad", "E4", 1600, 0.2)]),
            P(300, "medium", [N("kalimba", "C6", 1200, 0.8)]),
            P(560, "light", [N("shimmer", "G6", 1400, 0.2), N("kalimba", "E6", 1100, 0.45)]),
        ],
        peak=0.32, wet=0.32,
    ),
    # A pair bouncing back: one dry knock, no scolding.
    "miss": dict(pulses=[P(0, "rigid", [N("knock", "D4", 200)])], peak=0.22, wet=0.08),
    # The last pair: the board done. A wave runs across the cards (docs/UI.md
    # §4.1, DESIGN-REVIEW) on a firmer pulse and three quick pops up to C7,
    # over a short C chord -- the pops the pairs made, finished.
    "board": dict(
        pulses=[
            P(0, "medium", [N("pop", "G6", 160), N("pad", "C4", 700, 0.18), N("pad", "G4", 700, 0.12)]),
            P(90, "light", [N("pop", "A6", 150, 0.8)]),
            P(180, "rigid", [N("pop", "C7", 260, 0.9), N("shimmer", "C7", 500, 0.12)]),
        ],
        peak=0.26, wet=0.2,
    ),
    # -- notes: replay bars, the ring, the checklist ---------------------------
    # One per pentatonic step, low to high: a kalimba, round and clickless.
    **{
        "note%d" % i: dict(
            pulses=[P(0, "selection", [N("kalimba", note, 260)])],
            peak=0.19, wet=0.16,
        )
        for i, note in enumerate(PENTATONIC)
    },
    # -- celebration -----------------------------------------------------------
    # XP counting up. A dozen a second, so tiny and round: a soft tap on C6.
    "coin": dict(pulses=[P(0, "selection", [N("kalimba", "C6", 120, 0.8), N("softtap", "G6", 40, 0.3)])],
                 peak=0.10, wet=0.10),
    # The ring closing: a warm C major chord on a pad, a kalimba arpeggio over it.
    "complete": dict(
        pulses=[
            P(0, "heavy", [N("pad", "C3", 1300, 0.45), N("pad", "E4", 1300, 0.3),
                           N("pad", "G4", 1300, 0.3), N("kalimba", "C5", 900, 0.7)]),
            P(110, "light", [N("kalimba", "E5", 800, 0.6)]),
            P(220, "light", [N("kalimba", "G5", 800, 0.6)]),
            P(330, "light", [N("kalimba", "C6", 1000, 0.7), N("shimmer", "C6", 900, 0.16)]),
        ],
        peak=0.31, wet=0.28,
    ),
    # A perfect run: the same, one more step up and a little more sparkle.
    "perfect": dict(
        pulses=[
            P(0, "heavy", [N("pad", "C3", 1600, 0.45), N("pad", "E4", 1600, 0.3),
                           N("pad", "G4", 1600, 0.3), N("kalimba", "C5", 900, 0.7)]),
            P(100, "light", [N("kalimba", "E5", 800, 0.6)]),
            P(200, "light", [N("kalimba", "G5", 800, 0.6)]),
            P(300, "light", [N("kalimba", "C6", 900, 0.65)]),
            P(420, "rigid", [N("kalimba", "E6", 1100, 0.7), N("shimmer", "G6", 1100, 0.22)]),
        ],
        peak=0.32, wet=0.3,
    ),
    # A chapter badge landing: a low pad under a kalimba fifth, then light.
    "badge": dict(
        pulses=[
            P(0, "heavy", [N("pad", "C3", 1400, 0.55), N("kalimba", "C5", 1000, 0.7),
                           N("kalimba", "G5", 1000, 0.5)]),
            P(180, "light", [N("kalimba", "E6", 900, 0.5), N("shimmer", "C6", 1000, 0.2)]),
        ],
        peak=0.32, wet=0.3,
    ),
    # "Level unlocked" (David, 2026-09-30: a smoother unlock with haptics and
    # sounds). The lock rattles loose: three small dry ticks on the three
    # swings of its shake (home/LevelNode.tsx times the swings from here).
    "rattle": dict(
        pulses=[
            P(0, "rigid", [N("tick", "E7", 30, 0.6), N("softtap", "A5", 40, 0.5)]),
            P(90, "light", [N("tick", "D7", 30, 0.5)]),
            P(180, "light", [N("tick", "E7", 30, 0.45)]),
        ],
        peak=0.11, wet=0.05,
    ),
    # Then it bursts off: a pop with a low thump under it, and the chime's
    # rise going on up to E6 over a pad, with a sparkle as the rings go out.
    "unlock": dict(
        pulses=[
            P(0, "rigid", [N("pop", "C6", 160, 0.8), N("kalimba", "G5", 500, 0.6),
                           N("thud", "C4", 180, 0.35)]),
            P(100, "light", [N("kalimba", "C6", 700, 0.75)]),
            P(200, "medium", [N("kalimba", "E6", 1000, 0.85), N("shimmer", "G6", 1100, 0.22),
                              N("pad", "C4", 1100, 0.18)]),
        ],
        peak=0.28, wet=0.28,
    ),
    # -- the streak, full screen (UI.md 7.2) -----------------------------------
    # Up by a day: the flame catches -- air rushing up and a crackle of embers
    # over a low thump -- then a C major arpeggio lands as it stands full.
    "ignite": dict(
        pulses=[
            P(0, "heavy", [N("whoosh", 3600, 620, 0.9), N("thud", "C3", 220, 0.5),
                           N("pad", "C3", 1500, 0.3), N("crackle", 1, 900, 0.22)]),
            P(160, "light", [N("kalimba", "E5", 700, 0.6)]),
            P(280, "light", [N("kalimba", "G5", 700, 0.6)]),
            P(400, "medium", [N("kalimba", "C6", 1000, 0.75), N("shimmer", "G6", 1000, 0.18),
                              N("pad", "G4", 1100, 0.2)]),
        ],
        peak=0.32, wet=0.26,
    ),
    # The count turning over to its new number: a crisp flip and one clear note.
    "flip": dict(
        pulses=[P(0, "rigid", [N("softtap", "E6", 45, 1.0), N("kalimba", "C6", 520, 0.8),
                               N("pad", "C5", 500, 0.12)])],
        peak=0.24, wet=0.18,
    ),
    # Lost: the flame goes out with a soft breath of air, and a falling third,
    # dull and quiet, as the count rolls to nought. Never a scolding (UI.md 7.2).
    "fizzle": dict(
        pulses=[
            P(0, "soft", [N("exhale", 2400, 700, 0.8), N("felt", "E4", 700, 0.5)]),
            P(500, "soft", [N("felt", "C4", 1000, 0.6), N("pad", "C3", 1100, 0.2)]),
        ],
        peak=0.2, wet=0.22,
    ),
    # A tier: rarer and fuller than a badge (UI.md 5.5). A pickup, then the chord.
    "tier": dict(
        pulses=[
            P(0, "light", [N("kalimba", "G4", 300, 0.6)]),
            P(140, "light", [N("kalimba", "C5", 300, 0.65)]),
            P(280, "medium", [N("kalimba", "E5", 340, 0.7)]),
            P(440, "heavy", [N("pad", "C3", 1800, 0.5), N("pad", "E4", 1800, 0.3),
                             N("pad", "G4", 1800, 0.3), N("kalimba", "C5", 1200, 0.7),
                             N("kalimba", "G5", 1200, 0.55)]),
            P(620, "light", [N("kalimba", "C6", 1100, 0.6), N("shimmer", "E6", 1200, 0.2)]),
        ],
        peak=0.33, wet=0.3,
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
