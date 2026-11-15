#!/usr/bin/env python3
"""Her two hand claps in the empty Schools (scene D, before D06 "Don't clap."), synthesised: sfx_clap_a.mp3, sfx_clap_b.mp3.

  python3 scripts/newton/sound/make_clap.py [--clips /home/user/newton_work/film/sound/clips] [--wav DIR]

Owner's note 5 (15 Nov): "the clapping didn't sound very clapping like". The farm's sfx_clap was a 60 ms band of
steady noise (90 % of it between 900 Hz and 3 kHz, nothing under 500 Hz, nothing over 6 kHz) with a 13 ms rise and
a reverb wash at 47 dB/s: its level fell 10 dB only after 190 ms. A hand clap is the opposite: an impulse.

ONE PERSON'S CUPPED-PALM CLAP, as built here (every number is in CLAPS below):
  1. the contacts: three micro-impacts inside 10-25 ms (the palms meet, the fingers slap down, a small rebound),
     each a noise burst a few ms long (rise 0.15 ms, decay 0.7-1.7 ms), the first the loudest: that is the "crack";
     its energy peaks between 1 and 3 kHz;
  2. the body: the air popped out of the cupped palms, a short resonance at 790 Hz (clap 1) / 680 Hz (clap 2), a damped
     band of noise, 5-7 ms: this is what makes it a clap and not a click or a snap;
  3. the skin's own tail: a band of noise (1-4 kHz) that dies in 12-16 ms;
  4. near reflections (her own body, the benches, the floor: 4-70 ms, wood-dull) that give the 60-120 ms decay;
  5. THE HALL: the slap off the far wall at 140 / 290 / 450 ms (the echo taps ph_lecture gives the same hall),
     each duller and smeared, and a diffuse tail with the reverberation time measured on the old clip's wash (1.3 s
     at 1-2 kHz, 0.9 s over 4.5 kHz), 30 dB under the clap's loudest 5 ms, so the two claps stay two claps and D06 is
     clear;
  6. the microphone: a clap this close overloads a camera's capsule, so the dry clap goes through a soft ceiling (tanh);
     without it the clap is all peak (crest 24 dB) and reads as a tick at any peak the mix can carry (now 16-17 dB).
The two claps are not one sample twice: clap b (the second) is cupped deeper (body 680 Hz against 790 Hz, crack
1.65 kHz against 2.2 kHz), its contacts are spread wider (0 / 9.5 / 22 ms against 0 / 7 / 16 ms) and it decays a
little slower: slow, pointed applause. Its own noise (another seed), its own reflections.

The clip starts with 10 ms of silence (PRE): play it with "sync": 0.010 so the first contact lands on the anchor.
Deterministic (fixed seeds): the same files every run. Mono 48 kHz, mp3 320k (short blocks keep the attack)."""
import argparse, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000
PRE = 0.010                                   # silence before the first contact (the cue's "sync")
LEN = 1.45                                    # clip length (s): clap 2 (D06 start - 0.70) ends before the D -> E cut
CLAPS = {
    "sfx_clap_a": dict(seed=1686, hits=[(0.0, 1.00), (0.0070, 0.50), (0.0160, 0.26)], crack=(950, 5200, 2200), tau_crack=0.0010, air=0.22,
                       body=790, tau_body=0.0052, body_gain=0.48, tau_skin=0.012, skin_gain=0.13,
                       near=[(0.0043, -11), (0.0108, -15), (0.0215, -18), (0.0330, -22), (0.0480, -25), (0.0690, -29)],
                       slap=[(0.140, -18), (0.290, -25), (0.450, -31)], tail_db=-30.0, rt=1.30, drive=5.0),
    "sfx_clap_b": dict(seed=1687, hits=[(0.0, 1.00), (0.0095, 0.56), (0.0220, 0.30)], crack=(850, 3900, 1650), tau_crack=0.0013, air=0.14,
                       body=680, tau_body=0.0066, body_gain=0.56, tau_skin=0.015, skin_gain=0.15,
                       near=[(0.0047, -11), (0.0122, -14.5), (0.0236, -17.5), (0.0362, -21.5), (0.0525, -24.5), (0.0740, -28)],
                       slap=[(0.140, -17.5), (0.290, -24.5), (0.450, -30.5)], tail_db=-29.5, rt=1.30, drive=3.2),
}

def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], "bp", fs=SR, output="sos"), x)
def lp(x, hz, order=2): return sosfilt(butter(order, hz, "lp", fs=SR, output="sos"), x)
def hp(x, hz, order=2): return sosfilt(butter(order, hz, "hp", fs=SR, output="sos"), x)

def burst(rng, n, tau, rise=0.00015):
    """white noise with a 0.15 ms rise and an exponential decay tau (s)"""
    t = np.arange(n) / SR
    return rng.standard_normal(n) * np.minimum(1, t / rise) * np.exp(-t / tau)

def contact(rng, p, amp):
    """one micro-impact: the crack (1-5 kHz, peak near p["crack"][2]), a little air over 6 kHz, the cupped body"""
    n = int(0.06 * SR); lo, hi, pk = p["crack"]
    crack = bp(burst(rng, n, p["tau_crack"]), lo, hi) + 0.9 * bp(burst(rng, n, p["tau_crack"] * 1.3), pk / 1.25, pk * 1.25)
    air = p["air"] * bp(burst(rng, n, p["tau_crack"] * 0.7), 5500, 11000)
    body = p["body_gain"] * bp(burst(rng, n, p["tau_body"]), p["body"] / 1.22, p["body"] * 1.22)
    low = 0.30 * bp(burst(rng, n, p["tau_body"] * 1.2), 300, 520)                      # the palms' thud, small
    return amp * (crack + air + (0.55 + 0.45 * amp) * (body + low))                    # the later contacts carry less body

def dry_clap(p):
    rng = np.random.default_rng(p["seed"]); n = int(0.25 * SR); y = np.zeros(n)
    for t0, amp in p["hits"]:
        c = contact(rng, p, amp); i = int(round(t0 * SR)); y[i:i + len(c)] += c[:n - i]
    skin = bp(burst(rng, n, p["tau_skin"], rise=0.001), 1000, 4200) * p["skin_gain"]   # the skin's tail under the contacts
    y = y + skin
    # A CLAP THIS CLOSE OVERLOADS A CAMERA'S MICROPHONE: a soft ceiling (tanh, DRIVE) flattens the first contact's
    # top, so the later contacts, the body and the skin's tail stand 6-8 dB nearer the peak. Without it the clap is
    # all peak (crest 24 dB over its first 100 ms): at any peak the mix can carry it reads as a tick, not a clap.
    y = np.tanh(p["drive"] * y / np.abs(y).max()) / np.tanh(p["drive"])
    return lp(y, 9500)

def room(dry, p):
    """the clap in the hall: near reflections (wood-dull), the far wall's slap, the diffuse tail"""
    rng = np.random.default_rng(p["seed"] + 100); n = int(LEN * SR); out = np.zeros(n); out[:len(dry)] += dry
    def put(x, t0, db):
        i = int(round(t0 * SR)); m = min(len(x), n - i)
        if m > 0: out[i:i + m] += x[:m] * 10 ** (db / 20)
    for k, (t0, db) in enumerate(p["near"]):                    # benches, floor, her own body: each duller than the last
        sm = np.zeros(int(0.004 * SR) + 1); sm[0] = 1; sm[rng.integers(20, len(sm), 5)] += rng.uniform(-0.5, 0.5, 5)
        put(lp(fftconvolve(dry, sm), 5200 - 550 * k), t0, db)
    for k, (t0, db) in enumerate(p["slap"]):                    # the far wall: a smeared, darker copy (a slap, not a second clap)
        m = int((0.010 + 0.006 * k) * SR); sm = rng.standard_normal(m) * np.exp(-np.arange(m) / (0.3 * m)); sm /= np.sqrt(np.sum(sm ** 2))
        put(hp(lp(fftconvolve(dry, sm), 3800 - 800 * k), 300), t0, db)
    # the diffuse tail: noise shaped per band with the hall's decay (rt at 1-2 kHz; longer below, shorter above), from 45 ms on
    m = n; t = np.arange(m) / SR; w = rng.standard_normal(m)
    def band(lo, hi, rt, g): return bp(w, lo, hi) * np.exp(-6.908 * t / rt) * g
    h = band(300, 700, p["rt"] * 1.2, 0.8) + band(700, 2200, p["rt"], 1.0) + band(2200, 4500, p["rt"] * 0.85, 0.45) + band(4500, 8000, p["rt"] * 0.7, 0.12)
    h *= np.minimum(1, t / 0.025)                               # the tail builds over 25 ms
    tail = fftconvolve(dry, h)[:m]
    e_dry = np.sqrt(np.max(np.convolve(dry ** 2, np.ones(240) / 240)))               # the clap's loudest 5 ms (RMS)
    i0, i1 = int(0.10 * SR), int(0.20 * SR); e_tail = np.sqrt(np.mean(tail[i0:i1] ** 2)) + 1e-12
    put(tail * (e_dry / e_tail), 0.045, p["tail_db"])           # the tail's RMS 100-200 ms in = tail_db under the loudest 5 ms
    f = int(0.25 * SR); out[-f:] *= np.linspace(1, 0, f) ** 2
    return out

def make(name):
    p = CLAPS[name]; y = room(dry_clap(p), p)
    y = hp(y, 180)                                              # nothing under the palms' thud
    y = np.concatenate([np.zeros(int(PRE * SR)), y])[:int(LEN * SR)]
    return y / np.abs(y).max() * 10 ** (-1.0 / 20)

def write_mp3(x, path, title):
    raw = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "320k",
                    "-metadata", f"title={title}", "-metadata", "comment=synthesised: scripts/newton/sound/make_clap.py", path], input=raw, check=True)
    print("wrote", path, f"{len(x) / SR:.2f} s")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips", default="/home/user/newton_work/film/sound/clips")
    ap.add_argument("--wav", default=None, help="also write the two claps as 16-bit wav into this folder (for measuring)")
    a = ap.parse_args()
    for name, title in (("sfx_clap_a", "hand clap 1 (cupped palms, empty hall)"), ("sfx_clap_b", "hand clap 2 (deeper, slower)")):
        y = make(name)
        write_mp3(y, os.path.join(a.clips, name + ".mp3"), title)
        if a.wav:
            import soundfile as sf
            sf.write(os.path.join(a.wav, name + ".wav"), y.astype(np.float32), SR, subtype="PCM_16")
