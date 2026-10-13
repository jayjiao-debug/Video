"""Opening music + hits, synthesised: noir jazz groove at 120 bpm in D minor (walking bass,
brushed kit, brass stab on every cut) and a sound for each visual beat.
Cue times come from opening.py, so picture and sound share one clock. Writes out/opening.wav."""
import wave
import numpy as np
from scipy.signal import lfilter
import opening as O

SR = 48000
N = int(O.DUR * SR)
rng = np.random.default_rng(5)
B = O.BEAT


def t_(n):
    return np.arange(n) / SR


def env(n, a=0.005, r=0.1):
    e = np.ones(n)
    na, nr = max(1, min(n, int(a * SR))), max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    return lfilter([1 - a], [1, -a], x)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def saw(f, n):
    ph = np.cumsum(np.broadcast_to(f, (n,)) / SR) % 1
    return 2 * ph - 1


def add(buf, x, t, vol=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * vol


def kick():
    n = int(0.35 * SR)
    f = 45 + 90 * np.exp(-t_(n) * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_(n) * 9)


def snare():
    n = int(0.22 * SR)
    x = rng.normal(0, 1, n)
    x = x - lp(x, 1500)
    return (x * 0.6 + 0.3 * np.sin(2 * np.pi * 190 * t_(n))) * np.exp(-t_(n) * 18)


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    x = rng.normal(0, 1, n)
    x = x - lp(x, 7000)
    return x * np.exp(-t_(n) * (14 if open_ else 70))


def pluck(m, d=0.42):
    n = int(d * SR)
    f = hz(m)
    x = 0.6 * np.sin(2 * np.pi * f * t_(n)) + 0.3 * np.sin(4 * np.pi * f * t_(n)) + 0.15 * saw(f, n)
    return lp(x, 900) * np.exp(-t_(n) * 5) * env(n, 0.004, 0.05)


def stab(chord, d=0.35, cut=2600):
    n = int(d * SR)
    x = sum(saw(hz(m) * (1 + 0.003 * k), n) for k, m in enumerate(chord)) / len(chord)
    c = cut * np.exp(-t_(n) * 6) + 300
    y = np.zeros(n)
    acc = 0.0   # time-varying one-pole lowpass (brass "blat")
    al = 1 - np.exp(-2 * np.pi * c / SR)
    for i in range(n):
        acc += al[i] * (x[i] - acc)
        y[i] = acc
    return y * env(n, 0.01, 0.12)


def pad(chord, d):
    n = int(d * SR)
    x = sum(np.sin(2 * np.pi * hz(m) * t_(n) + k) + 0.3 * saw(hz(m), n) for k, m in enumerate(chord)) / len(chord)
    return lp(x, 1200) * env(n, 0.25, 0.6)


def bell(m, d=1.2):
    n = int(d * SR)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t_(n)) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t_(n)) * np.exp(-t_(n) * 4)
    return x * np.exp(-t_(n) * 3.5) * env(n, 0.002, 0.2)


def tick():
    n = int(0.02 * SR)
    x = rng.normal(0, 1, n)
    return (x - lp(x, 3000)) * np.exp(-t_(n) * 300)


def plip():
    n = int(0.25 * SR)
    f = 900 * np.exp(-t_(n) * 10) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_(n) * 16)


def thud():
    n = int(0.3 * SR)
    f = 70 + 60 * np.exp(-t_(n) * 25)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_(n) * 12)
    nz = rng.normal(0, 1, n)
    return x + 0.25 * lp(nz, 900) * np.exp(-t_(n) * 30)


def noise_sweep(d, f0, f1, up=True):
    n = int(d * SR)
    x = rng.normal(0, 1, n)
    k = np.linspace(0, 1, n)
    cut = f0 + (f1 - f0) * k ** 2
    y = np.zeros(n)
    acc = 0.0
    al = 1 - np.exp(-2 * np.pi * cut / SR)
    for i in range(n):
        acc += al[i] * (x[i] - acc)
        y[i] = acc
    return y * (k if up else (1 - k)) * env(n, 0.01, 0.03)


def crash(d=1.6):
    n = int(d * SR)
    x = rng.normal(0, 1, n)
    return (x - lp(x, 4000)) * np.exp(-t_(n) * 2.6)


def creak():
    n = int(0.5 * SR)
    f = 180 + 120 * np.sin(np.linspace(0, 3, n)) + 20 * rng.normal(0, 1, n)
    return saw(np.abs(f), n) * env(n, 0.05, 0.2) * 0.4


# D minor progression, one chord per bar
CHORDS = [  # (bass walk, stab chord)
    ([38, 41, 45, 48], [62, 65, 69, 72]),     # Dm7
    ([34, 38, 41, 45], [58, 62, 65, 69]),     # Bbmaj7
    ([31, 34, 38, 41], [55, 58, 62, 65]),     # Gm7
    ([33, 37, 40, 43], [57, 61, 64, 67]),     # A7
    ([38, 38, 38, 38], [50, 57, 62, 65, 69]), # Dm (title, held)
    ([33, 37, 40, 37], [57, 61, 64, 67, 70]), # A7b9
]


def main():
    mus = np.zeros(N)
    fx = np.zeros(N)
    bars = int(np.ceil(O.DUR / (4 * B)))
    for bar in range(bars):
        walk, _ = CHORDS[bar % len(CHORDS)]
        for q in range(4):
            t = (bar * 4 + q) * B
            if t >= O.DUR:
                break
            if bar == 4:   # title bar: bass holds a long root
                if q == 0:
                    add(mus, pluck(walk[0], 1.9), t, 0.9)
            else:
                add(mus, pluck(walk[q]), t, 0.8)
            if t >= O.T_MOON and not (O.T_TITLE <= t < O.T_TITLE + 0.5):
                if q in (0, 2):
                    add(mus, kick(), t, 0.9)
                if q in (1, 3):
                    add(mus, snare(), t, 0.35)
            add(mus, hat(), t, 0.18)
            add(mus, hat(), t + B * 0.66, 0.12)   # swung eighth
    # a stab on every cut
    cuts = [0.0, O.T_MOON, O.T_CLOCK, O.T_CUP, O.T_DOORS, O.T_MAG, O.T_END]
    for c in cuts:
        bar = int(c / (4 * B))
        add(mus, stab(CHORDS[bar % len(CHORDS)][1]), c, 0.45)
    add(mus, pad(CHORDS[4][1], 3.0), O.T_TITLE, 0.5)

    # picture hits
    add(fx, bell(88, 0.8), 1.45, 0.25)                    # Holmes at the window
    add(fx, noise_sweep(0.9, 300, 3000), O.T_MOON + 0.1, 0.12)
    k = 0.0
    while k < 0.75:   # clock hands spin, ticks slowing
        add(fx, tick(), O.T_CLOCK + k, 0.5)
        k += 0.03 + 0.12 * (k / 0.75) ** 2
    add(fx, bell(81, 1.4), O.T_CLOCK + 0.75, 0.55)        # locks on 9:45
    add(fx, bell(93, 1.0), O.T_CLOCK + 0.75, 0.2)
    add(fx, plip(), O.T_CUP + 0.5, 0.7)                   # poison drop
    add(fx, bell(70, 1.0), O.T_CUP + 0.52, 0.2)
    for i, m in enumerate((62, 65, 69)):                  # doors open one by one
        t = O.T_DOORS + B * (1 + i)
        add(fx, thud(), t, 0.7)
        add(fx, stab([m, m + 3, m + 7], 0.25, 3000), t, 0.35)
    add(fx, noise_sweep(0.5, 400, 2500, up=False), O.T_MAG + 0.05, 0.3)   # magnifier swish
    add(fx, noise_sweep(0.5, 200, 9000), O.T_TITLE - 0.5, 0.35)            # riser into the white
    add(fx, crash(), O.T_TITLE, 0.35)
    add(fx, kick(), O.T_TITLE, 1.0)
    add(fx, thud(), O.T_TITLE, 0.6)
    pent = [74, 77, 79, 81, 84, 86]
    for j, _ in enumerate(O.REVEAL_ORDER):                # one note per letter
        add(fx, bell(pent[j], 0.5), O.T_LETTERS + j * B / 2, 0.22)
    add(fx, stab([62, 65, 69, 74], 0.6, 3200), O.T_LETTERS + 3.5 * B, 0.4)   # subtitle
    add(fx, creak(), O.T_END + 0.95, 0.45)                # the door opens
    add(fx, pad([62, 66, 69, 74], 1.0), O.T_END + 1.0, 0.35)   # D major: warm light
    add(fx, noise_sweep(0.4, 300, 8000), O.DUR - 0.4, 0.3)

    mix = 0.8 * mus + fx
    mix *= np.minimum(1, np.linspace(0, 1, N) * O.DUR / 0.05)
    mix /= np.abs(mix).max() / 0.9
    st = np.stack([mix, mix], 1)
    st[:, 0] = mix + 0.15 * np.roll(fx, 300)   # a little width on the hits
    st /= np.abs(st).max() / 0.9
    O.OUT.mkdir(exist_ok=True)
    with wave.open(str(O.OUT / "opening.wav"), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    print("wrote", O.OUT / "opening.wav", f"{N / SR:.2f}s")


if __name__ == "__main__":
    main()
