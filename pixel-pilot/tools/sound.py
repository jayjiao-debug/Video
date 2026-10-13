"""Sound step: a code-synthesised chiptune bed, UI blips on every cue, voice on top,
music ducked under each spoken line. Writes public/audio/mix.wav (48 kHz stereo).

Cue times come from the same lines.json + timeline.json the picture uses, so sound
effects always land on the frame where their prop appears.
"""
import json, pathlib, wave
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
rng = np.random.default_rng(3)


def t_(n):
    return np.arange(n) / SR


def env(n, a=0.005, r=0.08):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def square(f, n, duty=0.5):
    ph = np.cumsum(np.broadcast_to(f, (n,)) / SR) % 1
    return np.where(ph < duty, 1.0, -1.0)


def tri(f, n):
    ph = np.cumsum(np.broadcast_to(f, (n,)) / SR) % 1
    return 4 * np.abs(ph - 0.5) - 1


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


# ------------------------------------------------------------------ music bed
def music(dur):
    bpm = 84
    beat = 60 / bpm
    n = int(dur * SR)
    out = np.zeros(n)
    chords = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]  # Am F C G
    bar = 4 * beat
    t = 0.0
    k = 0
    while t < dur:
        root, third, fifth = chords[k % 4]
        for b in range(4):
            s = int((t + b * beat) * SR)
            # triangle bass on each beat
            m = int(beat * 0.9 * SR)
            if s + m < n:
                out[s:s + m] += 0.30 * tri(note(root - 12), m) * env(m, 0.005, 0.3)
            # soft kick on 1 and 3
            if b in (0, 2):
                m2 = int(0.12 * SR)
                if s + m2 < n:
                    f = np.linspace(140, 45, m2)
                    out[s:s + m2] += 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(m2, 0.001, 0.1)
            # hat on the off-beat
            s2 = int((t + b * beat + beat / 2) * SR)
            m3 = int(0.03 * SR)
            if s2 + m3 < n:
                out[s2:s2 + m3] += 0.05 * rng.standard_normal(m3) * env(m3, 0.001, 0.025)
        # pulse arpeggio, eighth notes
        arp = [root, third, fifth, root + 12, fifth, third, root + 12, fifth]
        for j, m_ in enumerate(arp):
            s = int((t + j * beat / 2) * SR)
            m = int(beat / 2 * 0.8 * SR)
            if s + m < n:
                out[s:s + m] += 0.07 * square(note(m_ + 12), m, 0.125) * env(m, 0.004, 0.12)
        # pad: two detuned triangles holding the chord
        s = int(t * SR)
        m = min(int(bar * SR), n - s)
        for m_ in (root, third, fifth):
            out[s:s + m] += 0.045 * (tri(note(m_), m) + tri(note(m_) * 1.004, m)) * env(m, 0.3, 0.4)
        t += bar
        k += 1
    from scipy.signal import lfilter
    a = np.exp(-2 * np.pi * 3200 / SR)
    out = lfilter([1 - a], [1, -a], out)
    fade = env(n, 0.8, 2.5)
    return out * fade


# ------------------------------------------------------------------ sound effects
def sweep(f0, f1, d, shape="sq", duty=0.5, vol=0.25):
    n = int(d * SR)
    f = np.geomspace(f0, f1, n)
    w = square(f, n, duty) if shape == "sq" else np.sin(2 * np.pi * np.cumsum(f) / SR)
    return vol * w * env(n, 0.002, d * 0.5)


def tones(ms, d, vol=0.18, shape="sq", gap=0.0):
    parts = []
    for m in ms:
        n = int(d * SR)
        w = square(note(m), n, 0.25) if shape == "sq" else np.sin(2 * np.pi * note(m) * t_(n))
        parts += [vol * w * env(n, 0.002, d * 0.6), np.zeros(int(gap * SR))]
    return np.concatenate(parts)


def noise_whoosh(d, vol=0.2):
    from scipy.signal import lfilter
    n = int(d * SR)
    x = rng.standard_normal(n)
    a = np.exp(-2 * np.pi * 1800 / SR)
    x = lfilter([1 - a], [1, -a], x)
    return vol * x * np.sin(np.linspace(0, np.pi, n)) * 3


SFX = {
    "pop": lambda: sweep(500, 1100, 0.07, vol=0.16),
    "phone": lambda: np.concatenate([
        0.22 * square(150, int(0.12 * SR)) * env(int(0.12 * SR)), np.zeros(int(0.05 * SR)),
        0.22 * square(150, int(0.12 * SR)) * env(int(0.12 * SR)), np.zeros(int(0.03 * SR)),
        tones([88, 93], 0.09, vol=0.2, shape="sin")]),
    "ticks": lambda: np.concatenate([np.concatenate([0.25 * sweep(3000, 2500, 0.01), np.zeros(int(0.04 * SR))]) for _ in range(24)]),
    "shock": lambda: tones([84, 79], 0.06, vol=0.14),
    "card": lambda: noise_whoosh(0.18, 0.12) + np.pad(sweep(700, 1400, 0.05, vol=0.1), (0, int(0.13 * SR))),
    "drain": lambda: tones([76, 72, 69], 0.06, vol=0.14),
    "shimmer": lambda: tones([72, 76, 79, 84, 88, 91], 0.09, vol=0.12, shape="sin"),
    "hit": lambda: np.pad(sweep(160, 50, 0.25, shape="sin", vol=0.6), (0, 0)) + np.pad(tones([69], 0.2, vol=0.12), (0, int(0.05 * SR))),
    "miss": lambda: sweep(900, 180, 0.22, duty=0.25, vol=0.16),
    "levelup": lambda: tones([72, 76, 79, 84], 0.07, vol=0.15),
    "whoosh": lambda: noise_whoosh(0.25, 0.16),
}

EVENT_SFX = {
    "prop_in": "pop", "prop_out": "whoosh", "clock_spin": "ticks", "stat_card": "card",
    "stat_set": "drain", "book_reveal": "shimmer", "title_card": "hit", "fx": "miss", "skill_card": "levelup",
}


def main():
    script = json.loads((ROOT / "lines.json").read_text())
    tl = json.loads((ROOT / "src/timeline.json").read_text())
    dur = tl["duration"]
    n = int(dur * SR)

    with wave.open(str(ROOT / "public/audio/voice.wav")) as w:
        voice = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32767
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]

    bed = music(dur)
    # duck the music under every spoken line (80 ms ramps)
    gain = np.ones(n)
    for l in tl["lines"]:
        a, b = int((l["start"] - 0.08) * SR), int((l["end"] + 0.15) * SR)
        gain[max(a, 0):b] = 0.32
    from scipy.signal import lfilter
    k = np.exp(-1 / (0.08 * SR))
    gain = lfilter([1 - k], [1, -k], gain)

    fx = np.zeros(n)
    for i, line in enumerate(script["lines"]):
        times = {"start": tl["lines"][i]["start"], "key": tl["lines"][i]["key"], "end": tl["lines"][i]["end"]}
        for e in line["events"]:
            name = EVENT_SFX.get(e["do"])
            if e["do"] == "prop_in" and e.get("sprite") == "phone":
                name = "phone"
            if e["do"] == "pose" and e.get("pose") == "shock":
                name = "shock"
            if e["do"] == "stat_card" and e["at"] == "end":
                name = "levelup"
            if not name:
                continue
            s = int(round(times[e["at"]] * FPS) / FPS * SR)
            x = SFX[name]()
            m = min(len(x), n - s)
            fx[s:s + m] += x[:m]

    music_l = bed * gain * 0.55
    mix = voice * 1.0 + fx * 0.8
    left = mix + music_l
    right = mix + music_l
    st = np.stack([left, right], 1)
    st /= max(1e-9, np.abs(st).max()) / 0.9
    with wave.open(str(ROOT / "public/audio/mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    print(f"mix {dur:.2f}s")


if __name__ == "__main__":
    main()
