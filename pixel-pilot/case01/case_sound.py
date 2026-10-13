"""Case 01 sound: rain bed, thunder, a low mystery ostinato (ducked under the voice),
and a sound on every visual beat (clue chimes, stamps, door, drips, heartbeat,
countdown). Cue times come from case_render, so picture and sound share one clock.
Writes audio/mix.wav (48 kHz stereo)."""
import pathlib, wave
import numpy as np
import case_render as R

HERE = pathlib.Path(__file__).resolve().parent
SR = 48000
rng = np.random.default_rng(11)
N = int((R.DUR + 0.5) * SR)


def t_(n):
    return np.arange(n) / SR


def env(n, a=0.005, r=0.1):
    e = np.ones(n)
    na, nr = max(1, min(n, int(a * SR))), max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.zeros_like(x)
    acc = 0.0
    # vectorised one-pole via lfilter-like recursion in chunks
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)


def tri(f, n):
    ph = np.cumsum(np.broadcast_to(f, (n,)) / SR) % 1
    return 4 * np.abs(ph - 0.5) - 1


def sq(f, n, duty=0.5):
    ph = np.cumsum(np.broadcast_to(f, (n,)) / SR) % 1
    return np.where(ph < duty, 1.0, -1.0)


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(buf, x, t, vol=1.0):
    s = int(t * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(x))
    buf[s:e] += vol * x[: e - s]


# ------------------------------------------------------------------ elements
def rain(n):
    x = rng.standard_normal(n)
    hiss = lowpass(x, 3000) - lowpass(x, 400)
    pat = np.zeros(n)
    for _ in range(int(n / SR * 18)):     # individual drops on the glass
        s = rng.integers(0, n - 2000)
        m = 600
        pat[s:s + m] += rng.uniform(0.1, 0.35) * np.sin(2 * np.pi * rng.uniform(1800, 4200) * t_(m)) * np.exp(-t_(m) * 90)
    return 0.35 * hiss / (np.abs(hiss).max() + 1e-9) + 0.25 * pat


def thunder(d=3.0):
    n = int(d * SR)
    x = lowpass(rng.standard_normal(n), 160)
    crack = lowpass(rng.standard_normal(n), 1200) * np.exp(-t_(n) * 9)
    e = np.minimum(1, t_(n) / 0.05) * np.exp(-t_(n) * 1.3) * (1 + 0.5 * np.sin(t_(n) * 13))
    y = x * e + 0.5 * crack
    return y / np.abs(y).max()


def door():
    n = int(1.3 * SR)
    f = 170 - 60 * t_(n) + 12 * np.sin(t_(n) * 40)
    y = sq(f, n, 0.3) * env(n, 0.05, 0.4) * (0.6 + 0.4 * np.sin(t_(n) * 23))
    return lowpass(y, 1500) * 0.5


def heart(n_beats=2):
    out = np.zeros(int(0.9 * SR))
    for k, (dt, v) in enumerate(((0, 1.0), (0.22, 0.7))):
        m = int(0.18 * SR)
        y = np.sin(2 * np.pi * (60 - 20 * t_(m)) * t_(m)) * np.exp(-t_(m) * 22)
        add(out, y, dt, v)
    return out


def chime():
    out = np.zeros(int(0.6 * SR))
    for i, m in enumerate((84, 91)):
        n = int(0.4 * SR)
        add(out, sq(note(m), n, 0.25) * env(n, 0.002, 0.3) * 0.5, i * 0.07)
    return out


def blip(m=79, d=0.07):
    n = int(d * SR)
    return sq(note(m), n, 0.5) * env(n, 0.002, 0.04) * 0.4


def thud(big=False):
    n = int((0.5 if big else 0.25) * SR)
    y = np.sin(2 * np.pi * (110 if big else 150) * t_(n) * np.exp(-t_(n) * 6)) * np.exp(-t_(n) * (8 if big else 16))
    y += 0.4 * lowpass(rng.standard_normal(n), 2500) * np.exp(-t_(n) * 40)
    return y * (1.0 if big else 0.8)


def click():
    n = int(0.03 * SR)
    return lowpass(rng.standard_normal(n), 4000) * np.exp(-t_(n) * 200) * 0.5


def drip():
    n = int(0.12 * SR)
    return np.sin(2 * np.pi * (900 + 1400 * t_(n) / 0.12) * t_(n)) * np.exp(-t_(n) * 45) * 0.35


def whoosh(d=0.5, up=True):
    n = int(d * SR)
    x = rng.standard_normal(n)
    y = lowpass(x, 2500) * np.sin(np.pi * t_(n) / d) ** 2
    return y * 0.5


def beep(m=81):
    n = int(0.12 * SR)
    return sq(note(m), n, 0.5) * env(n, 0.002, 0.05) * 0.35


def stinger():
    n = int(1.6 * SR)
    out = np.zeros(n)
    for m in (50, 53, 56, 62):   # diminished hit
        out += sq(note(m), n, 0.4) * np.exp(-t_(n) * 2.2) * 0.18
    out += thud(True)[:n] if len(thud(True)) >= n else np.pad(thud(True), (0, n - len(thud(True))))
    return out


# ------------------------------------------------------------------ music
def ostinato(t0, t1, vol=0.22, bright=False):
    """Low minor pulse: bass on the beat, a quiet square arpeggio on off-beats."""
    bpm = 76
    beat = 60 / bpm
    out = np.zeros(N)
    prog = [(50, 53, 57), (46, 50, 53), (43, 46, 50), (45, 49, 52)]   # Dm Bb Gm A
    if bright:
        prog = [(50, 54, 57), (55, 59, 62), (52, 55, 59), (57, 61, 64)]
    t = t0
    k = 0
    while t < t1:
        ch = prog[(k // 8) % 4]
        n = int(beat * 0.5 * SR)
        add(out, tri(note(ch[0] - 12), n) * env(n, 0.005, 0.15), t, vol)
        m = int(beat * 0.45 * SR)
        add(out, sq(note(ch[1 + (k % 2)] + 12), m, 0.25) * env(m, 0.005, 0.2) * 0.35, t + beat / 2, vol)
        t += beat / 2 if False else beat
        k += 1
    return out


def footsteps(t0, n=4, gap=0.32, vol=0.5, buf=None):
    for i in range(n):
        m = int(0.09 * SR)
        y = lowpass(rng.standard_normal(m), 900) * np.exp(-t_(m) * 45)
        add(buf, y, t0 + i * gap, vol)


def rewind_noise(d=1.1):
    n = int(d * SR)
    f = 300 + 2500 * (t_(n) / d) ** 2
    return (sq(f, n, 0.5) * 0.15 + 0.4 * lowpass(rng.standard_normal(n), 3000)) * env(n, 0.02, 0.2)


def buzzer():
    n = int(0.35 * SR)
    return sq(np.full(n, 98.0), n, 0.5) * env(n, 0.005, 0.1) * 0.4


def main():
    s_, e_, k_ = R.s_, R.e_, R.k_
    mus = np.zeros(N)
    mus += ostinato(s_("open2"), s_("ready") + 0.8, 0.20)
    mus += ostinato(s_("r0") + 0.4, s_("r9"), 0.20)
    mus += ostinato(s_("end"), R.DUR, 0.16, bright=True)

    sfx = np.zeros(N)
    rn = rain(N)
    tt = t_(N)
    lvl = np.full(N, 0.32)
    lvl[tt < s_("open2")] = 0.9
    lvl[(tt > s_("three") - 0.1) & (tt < s_("hall1"))] = 0.16   # muffled while you question them
    lvl[(tt > s_("hall1")) & (tt < s_("ready"))] = 0.5         # by the front door, louder
    lvl[tt > s_("end")] = np.maximum(0, 0.32 - (tt[tt > s_("end")] - s_("end")) * 0.2)
    sfx += rn * lowpass(lvl, 5)

    add(sfx, thunder(), k_("open1") + 0.1, 0.9)
    add(sfx, door(), s_("open2"), 0.8)
    add(sfx, heart(), k_("open2"), 1.0)
    add(sfx, thud(), k_("me") - 0.1, 0.8)
    # lantern: a match strike and the flame
    add(sfx, whoosh(0.35), k_("dark") - 0.2, 0.7)
    add(sfx, lowpass(rng.standard_normal(int(0.5 * SR)), 2500) * np.exp(-t_(int(0.5 * SR)) * 9), k_("dark"), 0.5)
    for i in range(5):
        add(sfx, blip(76 + (2 if i % 2 else 0), 0.05), s_("clock") - 0.1 + 0.18 * i, 0.4)   # menu cursor
    add(sfx, chime(), s_("clock") + 0.8, 0.4)
    footsteps(s_("clock") + 0.6, 3, buf=sfx, vol=0.4)
    for tc, _ in R.CLUES:
        add(sfx, chime(), tc, 0.55)
    for t in (s_("poison") + 0.3, k_("poison"), k_("rain") , s_("hall2") + 0.2, k_("hall2") - 0.2):
        add(sfx, blip(), t, 0.7)
    add(sfx, thunder(2.4), s_("rain") + 0.9, 0.7)
    add(sfx, whoosh(0.5), s_("tea") + 0.05, 0.5)
    add(sfx, whoosh(0.5), s_("rain") + 0.05, 0.5)
    add(sfx, whoosh(0.4), k_("will1") - 0.2, 0.5)
    for k in range(5):
        add(sfx, blip(74 + k, 0.05), k_("will2") - 2.2 + 0.4 * k, 0.4)
    for i in range(3):
        add(sfx, whoosh(0.3), s_("three") + 0.15 * i, 0.4)
    # interrogation text blips while each suspect line types out
    for ln, tl in zip(R.LINES, R.TL["lines"]):
        if ln["w"] in "BSP":
            n = len(ln["t"])
            for i in range(n):
                if ln["t"][i] in "，。！？…：":
                    continue
                add(sfx, blip({"B": 64, "S": 79, "P": 72}[ln["w"]], 0.025), tl["start"] + (tl["end"] - tl["start"]) * 0.92 * i / n, 0.22)
    for t in (k_("b3"), k_("s2")):
        add(sfx, thud(), t, 0.7)
    t = s_("s1") + 0.1
    while t < e_("s2"):
        add(sfx, click(), t, 0.45)
        t += rng.uniform(0.07, 0.16)
    add(sfx, thud(True), s_("p2"), 0.5)
    add(sfx, stinger(), s_("p3"), 0.6)                                    # 追问！
    add(sfx, whoosh(0.4), k_("p3"), 0.6)
    footsteps(s_("hall1") + 0.1, 4, buf=sfx, vol=0.5)
    add(sfx, whoosh(0.7), s_("hall1") + 0.2, 0.5)
    t = s_("hall1") + 1.0
    while t < e_("hall2"):
        add(sfx, drip(), t, 0.5)
        t += 1 / 1.3 / 3
    # pause: heartbeat + countdown
    t = k_("ask")
    while t < s_("r0") - 0.3:
        add(sfx, heart(), t, 0.9)
        t += 0.85
    for i in range(5):
        add(sfx, beep(81 if i < 4 else 88), e_("ask") + i, 0.7)
    add(sfx, whoosh(0.6), s_("r0") - 0.3, 0.8)
    add(sfx, chime(), s_("r0"), 0.8)
    add(sfx, buzzer(), k_("r0"), 0.6)
    add(sfx, thud(), k_("r1") - 0.4, 0.8)
    add(sfx, chime(), k_("r2") - 0.6, 0.5)
    t = s_("r3")
    while t < e_("r3"):
        add(sfx, click(), t, 0.4)
        t += rng.uniform(0.07, 0.16)
    add(sfx, rewind_noise(), s_("r4"), 0.6)
    add(sfx, chime(), k_("r5") - 0.3, 0.9)
    for i in range(2):
        add(sfx, buzzer(), s_("r6") + 0.8 * i, 0.5)
    add(sfx, chime(), k_("r6"), 0.7)
    add(sfx, drip(), k_("r7"), 1.0)
    add(sfx, thud(), s_("r8") + 0.3, 0.6)
    add(sfx, stinger(), k_("r9"), 0.9)
    add(sfx, thud(), s_("r9") + (e_("r9") - s_("r9")) * 0.5, 0.6)
    add(sfx, chime(), k_("end"), 0.5)

    with wave.open(str(HERE / "audio/voice.wav")) as w:
        v = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float64) / 32768
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    vel = lowpass(np.abs(v), 6)
    duck = 1 - 0.6 * np.clip(vel / (vel.max() * 0.25), 0, 1)
    mix = v * 0.95 + mus * duck * 0.7 + sfx * 0.55
    st = np.stack([mix, mix], 1)
    st[:, 0] += 0.04 * rn[:N] * lvl
    st[:, 1] -= 0.04 * rn[:N] * lvl
    st /= np.abs(st).max() / 0.92
    with wave.open(str(HERE / "audio/mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    print("mix", N / SR)


if __name__ == "__main__":
    main()
