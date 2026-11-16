#!/usr/bin/env python3
"""Stand-in clips (PLACEHOLDERS) for the v5 sounds no existing clip can make, until the sound farm renders them.

  python3 scripts/newton/sound/make_placeholders.py [--clips /home/user/newton_work/film/sound/clips]

Writes ph_*.mp3 into the clips folder (each tagged "PLACEHOLDER" in its title). cues.json plays them under a
"placeholder" key that holds the exact sound-farm request; build.py lists them on every run. When the farm's clip
arrives, put it in the clips folder under the request's name, change the cue's "clip" to that name, delete the
"placeholder" key (and the "lp" if the farm's clip is already behind the door), and rebuild.

  ph_snore    one muffled snore behind his shut door (A, after A06's 次): an inhale snore (a palate flutter at
              about 26 Hz on breath noise) and a short breath out, 2-pole low-pass at 700 Hz. 1.1 s
  ph_sigh     Humphrey's sigh (B, after his flick): a breath out through the mouth, noise through two vowel-ish band-passes,
              quick rise, slow fall. 0.8 s
  ph_sniff    her sniff (G, after the board falls): one quick nasal intake, high band noise, in over 25 ms, out over
              70 ms (r2: the first stand-in rose slowly and was cut, a reverse whoosh). 0.24 s
  ph_snuff    the candle snuffed (G, the end): a short puff of breath and a faint hiss after it. 0.6 s
  ph_lecture  his lecture as a muffled echo (D, after D05): HIS OWN TAKES D02 + D04 (the recorded lines, no new voice),
              4-pole low-pass at 420 Hz (no word survives) and the hall's echo (taps at 140 / 290 / 450 ms). 2.0 s of
              his takes + a 0.6 s echo tail = 2.6 s (cues.json plays 1.1 s of it)
Deterministic (fixed seeds): the same files every run."""
import argparse, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
LINES = "/home/user/newton_work/film/voice/v5/lines"

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "bp", fs=SR, output="sos"), x)

def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "lp", fs=SR, output="sos"), x)

def env(n, a, d, peak=0.3):
    """attack-decay envelope over n samples: rise to `peak` (fraction of n) with exponent a, fall with exponent d"""
    t = np.linspace(0, 1, n); p = max(1e-3, peak)
    return np.where(t < p, (t / p) ** a, ((1 - t) / (1 - p)) ** d)

def norm(x, peak_db):
    return x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)

def write(x, path, title):
    raw = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k",
                    "-metadata", f"title=PLACEHOLDER {title}", "-metadata", "comment=stand-in until the sound farm renders it (scripts/newton/sound/make_placeholders.py)", path],
                   input=raw, check=True)
    print("wrote", path, f"{len(x) / SR:.2f} s")

def snore(rng):
    n1 = int(0.75 * SR); t = np.arange(n1) / SR
    flutter = 26 + 4 * np.sin(2 * np.pi * 0.6 * t)                       # the soft palate's rattle, slowing a little
    ph = 2 * np.pi * np.cumsum(flutter) / SR
    pulses = np.maximum(0, np.sin(ph)) ** 6                               # one short burst per flutter cycle
    noise = rng.standard_normal(n1)
    body = bp(noise, 90, 900) * pulses + 0.25 * bp(noise, 120, 500)
    tone = 0.3 * np.sin(2 * np.pi * 62 * t + 0.4 * np.sin(ph))           # a little voiced growl under it
    inhale = (body + tone * pulses) * env(n1, 1.6, 1.2, 0.6)
    n2 = int(0.35 * SR)
    exhale = bp(rng.standard_normal(n2), 150, 700) * env(n2, 0.6, 2.0, 0.15) * 0.35
    x = np.concatenate([inhale, exhale])
    return lp(x, 700)

def sigh(rng):
    n = int(0.8 * SR); x = rng.standard_normal(n)
    y = 0.8 * bp(x, 500, 900) + 0.6 * bp(x, 1000, 1600) + 0.25 * bp(x, 2200, 3200)   # a breathed "haa"
    return y * env(n, 0.8, 1.8, 0.18)

def sniff(rng):
    """v5 r2 (sound review MINOR 8: the first stand-in rose slowly and was cut, a reverse whoosh): one quick intake through
    the nose: in over 25 ms, a short body that narrows and brightens a little (the nostrils closing in), out over 70 ms;
    0.24 s. It draws the same 0.35 s of noise as before, so ph_snuff and ph_lecture after it are unchanged."""
    n0 = int(0.35 * SR); x = rng.standard_normal(n0)
    n = int(0.24 * SR); x = x[:n]; t = np.arange(n) / SR
    y = bp(x, 2200, 5200) * (0.7 + 0.3 * t / t[-1]) + 0.35 * bp(x, 800, 1400) * (1 - 0.6 * t / t[-1])
    a, r = int(0.025 * SR), int(0.07 * SR)
    e = np.ones(n); e[:a] = np.linspace(0, 1, a) ** 1.5; e[-r:] = np.linspace(1, 0, r) ** 1.3
    e *= 1 - 0.25 * np.exp(-((t - 0.06) / 0.03) ** 2)       # a small catch early in the intake
    return y * e

def snuff(rng):
    n1 = int(0.14 * SR); puff = bp(rng.standard_normal(n1), 250, 2200) * env(n1, 0.5, 2.5, 0.1)
    n2 = int(0.46 * SR); hiss = bp(rng.standard_normal(n2), 3500, 9000) * env(n2, 1.0, 1.5, 0.2) * 0.12
    return np.concatenate([puff, hiss])

def lecture():
    def load(p):
        return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]), dtype=np.float32).astype(float)
    x = np.concatenate([load(os.path.join(LINES, "D02.wav")), load(os.path.join(LINES, "D04.wav"))])
    x = x[: int(2.0 * SR)]
    y = lp(x, 420, 4)
    out = np.zeros(len(y) + int(0.6 * SR)); out[: len(y)] += y
    for d, g in [(0.14, 0.45), (0.29, 0.3), (0.45, 0.18)]:
        k = int(d * SR); out[k: k + len(y)] += g * y
    fo = int(0.35 * SR); out[-fo:] *= np.linspace(1, 0, fo)
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--clips", default="/home/user/newton_work/film/sound/clips"); a = ap.parse_args()
    rng = np.random.default_rng(1686)
    write(norm(snore(rng), -3), os.path.join(a.clips, "ph_snore.mp3"), "snore behind the door")
    write(norm(sigh(rng), -3), os.path.join(a.clips, "ph_sigh.mp3"), "Humphrey's sigh")
    write(norm(sniff(rng), -3), os.path.join(a.clips, "ph_sniff.mp3"), "her sniff")
    write(norm(snuff(rng), -3), os.path.join(a.clips, "ph_snuff.mp3"), "candle snuffed")
    write(norm(lecture(), -3), os.path.join(a.clips, "ph_lecture.mp3"), "his lecture, muffled echo")

if __name__ == "__main__":
    main()
