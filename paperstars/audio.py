"""The soundtrack: an original score and sound design, synthesised from scratch.

Everything is additive/subtractive synthesis on numpy arrays: a music box,
warm pads, Karplus-Strong plucked strings, a choir-like swell, and sound
effects (city hum, wind, paper, light switches) timed to the picture.
"""

import math
import wave

import numpy as np

from . import cameras as cam
from . import config as C

SR = C.SAMPLE_RATE
N = int((C.DURATION + 1.0) * SR)
NOTE_NAMES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def hz(note):
    """'F#5' -> frequency."""
    name, octave = note[:-1], int(note[-1])
    semi = NOTE_NAMES[name[0]] + name.count("#") - name.count("b")
    midi = 12 * (octave + 1) + semi
    return 440.0 * 2 ** ((midi - 69) / 12)


def _t(dur):
    return np.arange(int(dur * SR), dtype=np.float64) / SR


# ------------------------------------------------------------ instruments

def music_box(f, dur=3.0, bright=1.0):
    t = _t(dur)
    sig = np.zeros_like(t)
    for mult, amp, tau in ((1.0, 1.0, 1.1), (2.0, 0.28, 0.5), (3.0, 0.10 * bright, 0.3),
                           (5.93, 0.07 * bright, 0.12), (8.9, 0.03 * bright, 0.06)):
        if f * mult < SR / 2.2:
            sig += amp * np.sin(2 * np.pi * f * mult * t) * np.exp(-t / tau)
    sig *= np.minimum(1, t / 0.002)
    return sig * 0.5


def bell(f, dur=3.5):
    t = _t(dur)
    sig = np.zeros_like(t)
    for mult, amp, tau in ((1.0, 1.0, 1.6), (2.76, 0.4, 0.8), (5.40, 0.2, 0.35), (8.93, 0.08, 0.15)):
        if f * mult < SR / 2.2:
            sig += amp * np.sin(2 * np.pi * f * mult * t + mult) * np.exp(-t / tau)
    return sig * np.minimum(1, t / 0.003) * 0.4


def pad(freqs, dur, attack=1.5, release=2.0, bright=0.3):
    t = _t(dur + release)
    sig = np.zeros_like(t)
    rng = np.random.default_rng(int(sum(freqs)))
    for f in freqs:
        for det in (-0.0035, 0.0, 0.0041):
            ph = rng.uniform(0, 2 * np.pi)
            ff = f * (1 + det)
            sig += np.sin(2 * np.pi * ff * t + ph)
            sig += bright * 0.35 * np.sin(2 * np.pi * 2 * ff * t + ph * 2)
            sig += bright * 0.12 * np.sin(2 * np.pi * 3 * ff * t + ph * 3)
    env = np.minimum(1, t / attack) ** 2
    env *= np.clip((dur + release - t) / release, 0, 1) ** 1.5
    env *= 1 + 0.12 * np.sin(2 * np.pi * 0.21 * t)
    return sig * env / (len(freqs) * 3)


def choir(freqs, dur, attack=3.0, release=3.5):
    t = _t(dur + release)
    sig = np.zeros_like(t)
    rng = np.random.default_rng(int(sum(freqs)) + 1)
    for f in freqs:
        for voice in range(4):
            vib = 1 + 0.004 * np.sin(2 * np.pi * rng.uniform(4.6, 5.6) * t + rng.uniform(0, 6))
            drift = 1 + rng.uniform(-0.004, 0.004)
            phase = 2 * np.pi * np.cumsum(f * drift * vib) / SR
            sig += np.sin(phase) + 0.3 * np.sin(2 * phase) + 0.12 * np.sin(3 * phase) \
                + 0.06 * np.sin(4 * phase)
    env = np.minimum(1, t / attack) ** 2 * np.clip((dur + release - t) / release, 0, 1) ** 2
    return sig * env / (len(freqs) * 4)


def pluck(f, dur=2.0, damp=0.996, rng=None):
    rng = rng or np.random.default_rng(int(f * 100))
    n = int(dur * SR)
    P = max(2, int(round(SR / f)))
    out = np.zeros(n + P + 1)
    burst = rng.uniform(-1, 1, P)
    burst = np.convolve(burst, np.ones(3) / 3, mode="same")  # softer attack
    out[1:P + 1] = burst
    k = P + 1
    while k < n + 1:
        m = min(P, n + 1 - k)
        out[k:k + m] = damp * 0.5 * (out[k - P:k - P + m] + out[k - P - 1:k - P - 1 + m])
        k += m
    sig = out[1:n + 1]
    return sig * np.clip((dur - _t(dur)) / 0.2, 0, 1) * 0.5


def sub(f, dur, attack=0.8, release=1.5):
    t = _t(dur + release)
    env = np.minimum(1, t / attack) * np.clip((dur + release - t) / release, 0, 1)
    return np.sin(2 * np.pi * f * t) * env * 0.6


# ----------------------------------------------------------- dsp helpers

def fft_filter(x, lo=None, hi=None, slope=1.0):
    """Zero-phase band filter via FFT with soft (butterworth-like) edges."""
    n = len(x)
    size = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, size)
    f = np.fft.rfftfreq(size, 1 / SR)
    resp = np.ones_like(f)
    if hi:
        resp /= np.sqrt(1 + (f / hi) ** (4 * slope))
    if lo:
        resp /= np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (4 * slope))
    return np.fft.irfft(X * resp, size)[:n]


def envelope(points, n=N):
    """Piecewise-linear gain curve from (time, gain) pairs."""
    ts = np.array([p[0] for p in points]) * SR
    gs = np.array([p[1] for p in points])
    return np.interp(np.arange(n), ts, gs)


def reverb(x, seconds=3.2, seed=5):
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t * 6.9 / seconds)
    ir = fft_filter(ir, hi=5500)
    ir[:int(0.012 * SR)] = 0  # pre-delay
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << (len(x) + n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:len(x)]


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, t0, sig, gain=1.0, pan=0.0):
        i = int(t0 * SR)
        if i >= N:
            return
        if i < 0:
            sig, i = sig[-i:], 0
        j = min(N, i + len(sig))
        a = (pan + 1) * math.pi / 4
        self.L[i:j] += sig[:j - i] * gain * math.cos(a)
        self.R[i:j] += sig[:j - i] * gain * math.sin(a)


# ------------------------------------------------------------------ score

MOTIF = ["A4", "D5", "E5", "F#5", "A5"]  # "look up": five rising notes
ANSWER = ["B5", "A5", "F#5", "E5", "D5"]

CHORDS = {
    "D": ["D3", "A3", "F#4", "A4", "E5"],
    "Bm": ["B2", "F#3", "D4", "A4", "C#5"],
    "G": ["G2", "D3", "B3", "F#4", "A4"],
    "A": ["A2", "E3", "C#4", "E4", "B4"],
    "Asus": ["A2", "E3", "D4", "E4", "B4"],
    "Em": ["E3", "B3", "D4", "G4", "B4"],
    "F#m": ["F#2", "C#3", "A3", "E4", "A4"],
}


def phrase(bus, t0, notes, step, gain=0.5, octave_up=False, pan=0.0, inst=music_box):
    for k, n in enumerate(notes):
        f = hz(n) * (2 if octave_up else 1)
        bus.add(t0 + k * step + 0.012 * math.sin(k * 7), inst(f), gain, pan + 0.15 * math.sin(k * 2.3))


def progression(bus, t0, names, length, gain=0.22, bright=0.3, attack=1.5):
    for k, name in enumerate(names):
        bus.add(t0 + k * length, pad([hz(n) for n in CHORDS[name]], length, attack, 2.2, bright), gain)


def arpeggio(bus, t0, names, length, step, gain=0.18, rng=None, octave=1):
    rng = rng or np.random.default_rng(1)
    for k, name in enumerate(names):
        notes = CHORDS[name][1:]
        order = [0, 1, 2, 3, 2, 1, 3, 2]
        t = t0 + k * length
        i = 0
        while t < t0 + (k + 1) * length - 1e-6:
            f = hz(notes[order[i % len(order)]]) * octave
            bus.add(t, pluck(f, 1.6, 0.9965, rng), gain * (0.8 + 0.2 * (i % 2 == 0)),
                    pan=0.35 * math.sin(i * 1.3))
            t += step
            i += 1


def compose(music, rng):
    # --- title: the motif alone
    music.add(0.4, pad([hz(n) for n in CHORDS["D"][:3]], 6.0, 2.0, 2.5, 0.1), 0.14)
    phrase(music, 1.6, MOTIF, 0.42, 0.55)

    # --- the city: melancholy, sparse
    progression(music, 6.5, ["Bm", "G", "Bm", "Em"], 3.1, 0.16, 0.15, 2.0)
    phrase(music, 12.0, ANSWER, 0.7, 0.28, pan=-0.2)

    # --- rooftop: searching; hope at the plane, then it deflates
    progression(music, 19.0, ["G", "D", "Em", "Asus"], 3.2, 0.17, 0.2, 2.0)
    phrase(music, 23.9, ["A4", "D5", "E5"], 0.28, 0.45)
    phrase(music, 26.9, ["D5", "C#5", "A4"], 0.55, 0.3)
    music.add(29.6, music_box(hz("F#5"), 4.0), 0.25)

    # --- the fold: a patient ostinato that brightens as it takes shape
    ost = ["D5", "A4", "E5", "A4", "F#5", "A4", "E5", "A4"]
    t = 32.3
    k = 0
    while t < 38.4:
        g = 0.14 + 0.14 * (t - 32.3) / 6.0
        music.add(t, music_box(hz(ost[k % 8]), 1.6, 0.7), g, 0.2 * math.sin(k))
        t += 0.34
        k += 1
    progression(music, 32.0, ["D", "Bm"], 3.3, 0.14, 0.2, 2.2)
    music.add(C.FOLD_PUFF, bell(hz("A5")), 0.35, -0.1)
    music.add(C.FOLD_PUFF + 0.02, bell(hz("D6")), 0.3, 0.1)
    music.add(38.4, pad([hz(n) for n in ["D3", "A3", "E4", "F#4", "C#5"]], 4.0, 1.2, 2.5, 0.35), 0.2)

    # --- release: the motif lifts the first star, then the jar empties
    progression(music, 42.0, ["D", "Bm", "G", "A", "D"], 3.0, 0.2, 0.3, 1.2)
    phrase(music, 44.4, MOTIF[:4], 0.45, 0.5)
    music.add(C.FIRST_RELEASE, music_box(hz("A5"), 4.0), 0.55)
    music.add(C.FIRST_RELEASE, bell(hz("A6") / 2), 0.2)
    phrase(music, 48.0, ANSWER, 0.5, 0.3, pan=0.15)
    penta = ["D6", "E6", "F#6", "A6", "B6", "D7"]
    from .shots import world
    for st in world().jar_stars:
        music.add(st["t0"] + 0.05, bell(hz(penta[rng.integers(len(penta))]), 2.5),
                  0.07 + 0.04 * rng.random(), rng.uniform(-0.6, 0.2))

    # --- the drift: plucked strings join, the motif sings over the city
    arpeggio(music, 56.4, ["D", "Bm", "G", "A"] * 2, 3.75, 0.469, 0.17, rng)
    progression(music, 56.4, ["D", "Bm", "G", "A"], 3.75, 0.15, 0.25, 1.5)
    phrase(music, 58.3, MOTIF, 0.47, 0.4)
    phrase(music, 62.0, ANSWER, 0.47, 0.34)
    phrase(music, 65.8, MOTIF, 0.47, 0.36)
    phrase(music, 69.5, ["B5", "A5", "F#5", "A5", "B5"], 0.47, 0.34)

    # --- lights out: build, accelerate, and stop dead
    names = ["G", "A", "Bm", "G", "Asus", "A"]
    arpeggio(music, 71.6, names[:4], 2.4, 0.3, 0.17, rng)
    arpeggio(music, 71.6 + 4 * 2.4, names[4:], 1.55, 0.195, 0.2, rng)
    arpeggio(music, 76.4, ["Bm", "G", "Asus", "A"], 2.05, 0.15, 0.08, rng, octave=2)
    progression(music, 71.6, names[:4], 2.4, 0.18, 0.35, 1.0)
    for k in range(10):
        music.add(76.0 + k * 0.85, music_box(hz(["A5", "B5", "D6", "E6", "F#6"][k % 5]), 1.2), 0.2 + 0.02 * k)
    music.add(71.6, sub(hz("D2"), 12.5, 6.0, 0.08), 0.09)
    # everything is cut hard at SILENCE[0] (see gate below)

    # --- the reveal: first a few twinkles, then the whole sky sings
    t = C.STARS_IN[0]
    k = 0
    while t < 97:
        dens = (t - C.STARS_IN[0]) / (97 - C.STARS_IN[0])
        music.add(t, music_box(hz(penta[rng.integers(len(penta))]), 2.5, 1.2),
                  0.08 + 0.12 * dens, rng.uniform(-0.8, 0.8))
        t += lerp_(1.1, 0.16, dens) * rng.uniform(0.7, 1.3)
        k += 1
    music.add(91.5, choir([hz(n) for n in ["D4", "A4", "F#5", "E5"]], 6.5), 0.32)
    music.add(92.0, pad([hz(n) for n in ["D2", "A2", "D3", "A3", "F#4", "E5"]], 6.5, 3.5, 3.0, 0.4), 0.26)
    music.add(92.0, sub(hz("D2"), 6.5, 3.0, 3.0), 0.1)
    phrase(music, 94.0, MOTIF, 0.8, 0.45, octave_up=False)
    music.add(98.2, choir([hz(n) for n in ["B3", "F#4", "D5", "A5"]], 2.4), 0.28)
    music.add(98.2, pad([hz(n) for n in CHORDS["Bm"]], 2.4, 1.0, 2.0, 0.35), 0.2)
    music.add(100.4, choir([hz(n) for n in ["G3", "D4", "B4", "F#5"]], 2.2), 0.28)
    music.add(100.4, pad([hz(n) for n in CHORDS["G"]], 2.2, 1.0, 2.0, 0.35), 0.2)
    phrase(music, 98.6, ANSWER, 0.8, 0.36)

    # --- together: hello across the rooftops, and a shooting star
    progression(music, 102.4, ["D", "G", "Bm", "A", "D"], 2.9, 0.17, 0.25, 1.4)
    music.add(C.NEIGHBOR_WAVE + 0.3, music_box(hz("A5")), 0.4, 0.5)
    music.add(C.NEIGHBOR_WAVE + 0.65, music_box(hz("D6")), 0.4, 0.5)
    music.add(C.MIRA_WAVE + 0.3, music_box(hz("D6")), 0.4, -0.3)
    music.add(C.MIRA_WAVE + 0.65, music_box(hz("A5")), 0.4, -0.3)
    for k, n in enumerate(["D6", "F#6", "A6", "D7", "E7"]):
        music.add(C.SHOOTING_STAR + 0.1 + k * 0.09, bell(hz(n), 3.0), 0.12, -0.6 + k * 0.3)

    # --- end: the motif one last time, resolving
    phrase(music, 116.4, MOTIF, 0.62, 0.42)
    music.add(119.5, pad([hz(n) for n in ["D3", "A3", "F#4", "A4", "E5"]], 5.0, 1.5, 3.0, 0.3), 0.22)
    music.add(119.6, choir([hz(n) for n in ["D4", "A4", "F#5"]], 4.5, 2.5, 3.0), 0.16)
    music.add(119.6, music_box(hz("D6"), 5.0), 0.3)
    music.add(122.9, bell(hz("D6"), 4.0), 0.15)


def lerp_(a, b, t):
    return a + (b - a) * t


# ------------------------------------------------------------ sound design

def click(rng, strength=1.0):
    """A wall light switch: a sharp tick, then a softer second contact."""
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    s = rng.normal(0, 1, n) * np.exp(-t / 0.0015)
    s += 0.5 * rng.normal(0, 1, n) * np.exp(-np.maximum(t - 0.011, 0) / 0.002) * (t > 0.011)
    s = fft_filter(s, lo=1200, hi=9000)
    s += 0.6 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.008)
    return s * strength * 0.5


def design(sfx, rng):
    from .shots import world
    city = world().city

    # city ambience follows how much of the city is lit
    ts = np.arange(0, C.DURATION + 1, 0.1)
    lit = np.array([city.lit_fraction(t) for t in ts])
    lit_env = np.interp(np.arange(N) / SR, ts, lit)
    brown = np.cumsum(rng.normal(0, 1, N))
    brown = fft_filter(brown - np.mean(brown), lo=30, hi=420)
    brown /= np.max(np.abs(brown)) + 1e-9
    traffic = fft_filter(rng.normal(0, 1, N), lo=250, hi=1400)
    traffic /= np.max(np.abs(traffic)) + 1e-9
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * np.arange(N) / SR / 7.3) * np.sin(2 * np.pi * np.arange(N) / SR / 3.1)
    shot_gain = envelope([(0, 0), (5.5, 0.25), (7, 0.9), (19, 0.8), (19.01, 0.45), (32, 0.45),
                          (32.2, 0.25), (42, 0.25), (42.2, 0.45), (57, 0.45), (57.5, 0.8),
                          (72, 0.8), (C.DURATION + 1, 0.8)])
    city_sig = (brown * 0.9 + traffic * 0.18 * swell) * lit_env ** 1.5 * shot_gain
    sfx.L += city_sig * 0.18
    sfx.R += np.roll(city_sig, 1200) * 0.18

    # wind: two decorrelated bands with slow gusts
    gust_t = np.arange(N) / SR
    gust = 0.6 + 0.4 * np.sin(2 * np.pi * gust_t / 9.0) * np.sin(2 * np.pi * gust_t / 4.3 + 1)
    wind_gain = envelope([(0, 0), (6, 0.05), (7, 0.12), (19, 0.12), (19.01, 0.45), (32, 0.45),
                          (32.2, 0.2), (42, 0.2), (42.2, 0.45), (57, 0.4), (72, 0.3),
                          (C.SILENCE[0], 0.28), (C.SILENCE[1], 0.2), (102, 0.3), (116, 0.3),
                          (C.DURATION, 0.0), (C.DURATION + 1, 0.0)])
    for bus_side, seed in ((0, 11), (1, 12)):
        wn = fft_filter(np.random.default_rng(seed).normal(0, 1, N), lo=180, hi=900)
        wn /= np.max(np.abs(wn)) + 1e-9
        sig = wn * gust * wind_gain * 0.12
        if bus_side == 0:
            sfx.L += sig
        else:
            sfx.R += sig

    # airplanes: a distant low rumble crossing the stereo field
    for (t0, t1, g) in ((9.5, 19.5, 0.09), (22.2, 29.5, 0.11)):
        n = int((t1 - t0) * SR)
        rumble = fft_filter(rng.normal(0, 1, n), lo=60, hi=260)
        rumble /= np.max(np.abs(rumble)) + 1e-9
        env = np.sin(np.linspace(0, np.pi, n)) ** 2
        pan = np.linspace(-0.8, 0.8, n) if t0 < 20 else np.linspace(0.8, -0.8, n)
        a = (pan + 1) * np.pi / 4
        i = int(t0 * SR)
        sfx.L[i:i + n] += rumble * env * g * np.cos(a)
        sfx.R[i:i + n] += rumble * env * g * np.sin(a)

    # paper: crinkles while folding, a soft puff when the star pops
    t = C.FOLD_START + 0.6
    while t < C.FOLD_PUFF + 0.4:
        busy = 1.0 if (C.FOLD_START + 1.2 < t < C.FOLD_START + 5.4) else 0.5
        n = int(rng.uniform(0.002, 0.012) * SR)
        burst = fft_filter(rng.normal(0, 1, n), lo=2500, hi=11000) * np.hanning(n)
        sfx.add(t, burst, 0.05 * rng.uniform(0.3, 1.0) * busy, rng.uniform(-0.3, 0.3))
        t += rng.exponential(0.05 if busy > 0.9 else 0.15)
    for tt, g in ((C.FOLD_PUFF, 0.12), (C.FIRST_RELEASE - 0.1, 0.08)):
        n = int(0.5 * SR)
        puff = fft_filter(rng.normal(0, 1, n), lo=400, hi=3000) * np.hanning(n) ** 2
        sfx.add(tt, puff, g)

    # jar lid: a few gritty turns and a clink as it's set down
    for k in range(4):
        n = int(0.12 * SR)
        grit = fft_filter(rng.normal(0, 1, n), lo=1500, hi=6000) * np.hanning(n)
        sfx.add(C.JAR_OPEN - 0.55 + k * 0.14, grit, 0.05, -0.3)
    sfx.add(C.JAR_OPEN + 0.55, bell(hz("E7"), 0.4), 0.06, -0.3)

    # light switches: first adopters, the ripple, and the stubborn last one
    for t_off in city.early_off:
        sfx.add(t_off, click(rng, 0.9), 0.5, rng.uniform(-0.6, 0.6))
    offs = []
    for li, layer in enumerate(city.layers):
        if layer.name == "far":
            continue
        for w in layer.windows:
            i = w["id"]
            t_off = float(city.off[i])
            if not (C.RIPPLE_START - 0.5 < t_off < C.RIPPLE_END + 1.5) or not city.lit0[i]:
                continue
            x0, y0 = city.layer_origin(layer, cam.blackout_cam(t_off))
            sx, sy = w["x"] - x0, w["y"] - y0
            if 0 < sx < C.W and 0 < sy < C.H:
                offs.append((t_off, sx, li))
    offs.sort()
    # thin to a playable density, keeping the near layer's clicks
    keep = []
    last = -1.0
    for (t_off, sx, li) in offs:
        min_gap = 0.09 if li == 2 else 0.2
        if t_off - last > min_gap * (1.0 - 0.6 * (t_off - C.RIPPLE_START) / (C.RIPPLE_END - C.RIPPLE_START)):
            keep.append((t_off, sx, li))
            last = t_off
    for (t_off, sx, li) in keep:
        pan = (sx / C.W) * 1.6 - 0.8
        g = (0.35 if li == 2 else 0.18) * rng.uniform(0.7, 1.0)
        sfx.add(t_off, click(rng, 1.0), g, pan)
    x0, _ = city.layer_origin(city.layers[2], cam.blackout_cam(C.STUBBORN_OFF))
    stub_x = float(city.wx[city.stubborn]) - x0
    sfx.add(C.STUBBORN_OFF, click(rng, 1.3), 0.75, (stub_x / C.W) * 1.6 - 0.8)

    # the shooting star: a bright shimmering sweep
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    f = 5200 * np.exp(-t * 0.9)
    shimmer = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * (1 + 0.5 * np.sin(2 * np.pi * 23 * t))
    air = fft_filter(rng.normal(0, 1, n), lo=3000, hi=12000) * np.exp(-t * 3.0)
    sfx.add(C.SHOOTING_STAR, shimmer * 0.05 + air * 0.03, 1.0, -0.4)

    # release "whoosh" as each group of jar stars takes off
    n = int(3.5 * SR)
    whoosh = fft_filter(rng.normal(0, 1, n), lo=500, hi=4000) * np.hanning(n) ** 1.5
    sfx.add(C.JAR_STREAM[0] - 0.3, whoosh, 0.05, -0.2)


def build_soundtrack():
    rng = np.random.default_rng(C.SEED + 7)
    music, sfx = Bus(), Bus()
    compose(music, rng)
    design(sfx, rng)

    # the hard cut before the stubborn window, and the silence after it
    gate = envelope([(0, 1), (C.SILENCE[0] - 0.02, 1), (C.SILENCE[0] + 0.03, 0),
                     (C.SILENCE[1] - 0.05, 0), (C.SILENCE[1], 1), (C.DURATION + 1, 1)])
    # music already sounding at the cut shouldn't ring on in the reverb either
    music.L *= gate
    music.R *= gate
    wet_L = reverb(music.L, 3.4, 1)
    wet_R = reverb(music.R, 3.4, 2)
    wet_gate = envelope([(0, 1), (C.SILENCE[0], 1), (C.SILENCE[0] + 0.35, 0),
                         (C.SILENCE[1] - 0.05, 0), (C.SILENCE[1], 1), (C.DURATION + 1, 1)])
    L = music.L * 0.8 + wet_L * 0.55 * wet_gate + sfx.L + reverb(sfx.L, 1.2, 3) * 0.15
    R = music.R * 0.8 + wet_R * 0.55 * wet_gate + sfx.R + reverb(sfx.R, 1.2, 4) * 0.15

    # gentle master fade and peak normalisation to -1 dBFS
    master = envelope([(0, 0), (0.3, 1), (C.DURATION - 2.5, 1), (C.DURATION, 0), (C.DURATION + 1, 0)])
    L *= master
    R *= master
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
    scale = 10 ** (-1 / 20) / (peak + 1e-9)
    return (L * scale).astype(np.float32), (R * scale).astype(np.float32)


def write_soundtrack(path):
    L, R = build_soundtrack()
    n = int(C.DURATION * SR)
    data = np.stack([L[:n], R[:n]], axis=1)
    pcm = np.clip(data * 32767, -32768, 32767).astype("<i2")
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())
