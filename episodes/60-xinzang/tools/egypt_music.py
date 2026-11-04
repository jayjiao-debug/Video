"""ep60: a stereotypically 'Egyptian' bed synthesised in code (owner 10:47: "these vibes" = the earlier 4:3 test clips, whose
music was a code-synthesised D-Hijaz piece: drone, darbuka maqsum with rolls, oud plucks, ney/reed lead, finger cymbals).
Melody traced from that clip: D Eb F# G | A Bb A G | F# . D --  (the Hijaz rise and fall), then Bb C Bb A G F# Eb D.
All ours (no samples, no licence). `python3 egypt_music.py out.wav [seconds] [bpm] [seed]`"""
import sys, numpy as np, soundfile as sf
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else 'egypt.wav'
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 30.0
BPM = float(sys.argv[3]) if len(sys.argv) > 3 else 100.0
rng = np.random.default_rng(int(sys.argv[4]) if len(sys.argv) > 4 else 7)
BEAT = 60 / BPM; E8 = BEAT / 2; BAR = 4 * BEAT
import os
BGM = os.environ.get('BGM') == '1'   # background mode: lead rests, softer, no qanun sweeps
DR = 0.68   # drum level (the liked clip is melody-led: harmonic ≈ 10 dB over percussion)
N = int(DUR * SR) + SR * 3
L = np.zeros(N); R = np.zeros(N)
def hz(note):   # 'D4', 'Eb4', 'F#4'
    names = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
    n, o = note[:-1], int(note[-1]); return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)
def put(sig, t, pan=0.0, g=1.0):
    i = int(t * SR); j = min(N, i + len(sig)); s = sig[:j - i] * g
    L[i:j] += s * np.sqrt(0.5 * (1 - pan)); R[i:j] += s * np.sqrt(0.5 * (1 + pan))
def env(n, a, d):  # attack (s), exponential decay time constant (s)
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def bp(x, f, q):   # cheap resonant band-pass (2-pole)
    w = 2 * np.pi * f / SR; r = 1 - w / (2 * q); y = np.zeros_like(x); a1, a2 = 2 * r * np.cos(w), -r * r
    y1 = y2 = 0.0
    for k in range(len(x)): y0 = x[k] + a1 * y1 + a2 * y2; y[k] = y0; y2, y1 = y1, y0
    return y * (1 - r)
def lp(x, f):
    a = np.exp(-2 * np.pi * f / SR); y = np.zeros_like(x); p = 0.0
    for k in range(len(x)): p = (1 - a) * x[k] + a * p; y[k] = p
    return y
# ---------- instruments ----------
def dum(g=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR; f = 95 + 90 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.16) + 0.25 * rng.standard_normal(n) * env(n, 0.001, 0.012)
    return s * g
def tek(g=1.0, bright=1.0):
    n = int(0.12 * SR); nz = rng.standard_normal(n)
    s = bp(nz, 2600 * bright, 3.0) * 3 + np.sin(2 * np.pi * 1150 * np.arange(n) / SR) * 0.35
    return s * env(n, 0.0005, 0.025) * g
def zills(g=1.0):
    n = int(1.4 * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f, a in ((2730, 1), (4120, .7), (5810, .55), (7330, .4), (9050, .25)): s += a * np.sin(2 * np.pi * f * t + rng.random() * 6)
    return s * env(n, 0.001, 0.35) * 0.18 * g
def riq(g=1.0):
    n = int(0.18 * SR); nz = rng.standard_normal(n); s = bp(nz, 6500, 2.0) * 2 + zills(1)[:n] * 0.6
    return s * env(n, 0.001, 0.05) * 0.35 * g
def pluck(f, dur, g=1.0, bright=0.5):   # oud: Karplus-Strong + body resonance
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p) * (0.6 + 0.4 * bright); out = np.zeros(n); idx = 0
    for k in range(n):
        out[k] = buf[idx]; nxt = (idx + 1) % p; buf[idx] = 0.497 * (buf[idx] + buf[nxt]); idx = nxt
    body = bp(out, 260, 1.5) * 0.6 + bp(out, 1050, 2.5) * 0.3 + out * 0.5
    return body * env(n, 0.001, 0.9) * g
def reed(f0s, durs, g=1.0, breath=0.15, nasal=1.0):   # mizmar/ney lead: a list of notes, with glides and vibrato
    tot = sum(durs); n = int(tot * SR); f = np.zeros(n); i = 0
    for k, (fr, d) in enumerate(zip(f0s, durs)):
        m = int(d * SR); prev = f0s[k - 1] if k else fr
        gl = np.minimum(1, np.arange(m) / (0.035 * SR)); f[i:i + m] = prev + (fr - prev) * (gl * gl * (3 - 2 * gl)); i += m
    t = np.arange(n) / SR; vib = 1 + 0.008 * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / 0.4)
    ph = np.cumsum(f * vib) / SR; saw = 2 * (ph % 1) - 1; pulse = np.where((ph % 1) < 0.3, 1.0, -0.4)
    s = 0.55 * pulse + 0.45 * saw
    s = bp(s, 1400, 2.2) * 1.5 * nasal + bp(s, 2900, 3.0) * 1.0 * nasal + lp(s, 2200) * 0.6
    s += breath * bp(rng.standard_normal(n), 1800, 1.2) * 0.6
    a = np.ones(n); a[:int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR)); a[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))
    return s * a * g
def drone(dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for fr, a in ((hz('D2'), 1), (hz('A2'), .7), (hz('D3'), .5)):
        ph = np.cumsum(np.full(n, fr) * (1 + 0.0015 * np.sin(2 * np.pi * 0.17 * t + fr))) / SR; s += a * (2 * (ph % 1) - 1)
    s = lp(s, 700) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t)); fade = np.minimum(1, t / 2.5) * np.minimum(1, (dur - t) / 1.5)
    return s * fade * 0.16
# ---------- the score ----------
put(drone(DUR), 0, 0, 1.0)
# phrases in eighths (note, eighths)
A = [('D4', 1), ('Eb4', 1), ('F#4', 1), ('G4', 1), ('A4', 1), ('Bb4', 1), ('A4', 1), ('G4', 1), ('F#4', 2), ('D4', 6)]
B = [('Bb4', 2), ('C5', 1), ('Bb4', 1), ('A4', 1), ('G4', 1), ('F#4', 1), ('Eb4', 1), ('D4', 8)]
C = [('A4', 1), ('Bb4', 1), ('A4', 1), ('G4', 1), ('F#4', 1), ('G4', 1), ('F#4', 1), ('Eb4', 1), ('F#4', 1), ('Eb4', 1), ('D4', 6)]
def play_lead(ph, t0, g=0.32, octave=0, **kw):
    fs = [hz(n[:-1] + str(int(n[-1]) + octave)) for n, _ in ph]; ds = [k * E8 for _, k in ph]
    # an ornament: a quick upper-neighbour turn on the first long note
    put(reed(fs, ds, g=g, **kw), t0, -0.15)
def play_oud(ph, t0, g=0.22, tremolo=True):
    t = t0
    for n, k in ph:
        f = hz(n[:-1] + str(int(n[-1]) - 1)); d = k * E8
        if tremolo and k >= 2:
            m = int(d / (E8 / 2))
            for j in range(m): put(pluck(f, 0.5, g * (0.8 if j else 1), 0.4), t + j * E8 / 2, 0.25)
        else: put(pluck(f, 0.9, g, 0.6), t, 0.25)
        t += d
def qanun_run(t0, notes, step, g=0.16):
    for j, n in enumerate(notes): put(pluck(hz(n), 0.6, g, 0.9), t0 + j * step, 0.4)
bars = int(DUR / BAR)
INTRO = 2   # free lead + drone + zills, no drums
for b in range(bars):
    t = b * BAR
    if b >= INTRO:
        for e, kind in ((0, 'D'), (1, 'T'), (3, 'T'), (4, 'D'), (6, 'T')):   # maqsum: dum tek . tek dum . tek .
            put(dum(0.9 * DR) if kind == 'D' else tek(0.55 * DR), t + e * E8, -0.05 if kind == 'D' else 0.1)
        for e in (2, 5, 7): put(tek(0.18 * DR, 1.3), t + e * E8, 0.15)          # ghost notes
        for e in range(8): put(riq((0.5 if e % 2 else 0.25) * DR), t + e * E8 + 0.01, 0.35)
        if b % 4 == 3:   # a roll into the next phrase
            for j in range(8): put(tek(0.25 + 0.05 * j), t + 6 * E8 + j * E8 / 4, 0.1)
    if b % 2 == 0 and (not BGM or b % 4 == 0): put(zills((0.9 if b >= INTRO else 0.6) * (0.5 if BGM else 1)), t, -0.3)
plan = [A, B, A, C]
k = 0; b = 0
while (b + 2) * BAR <= DUR + 0.01:
    ph = plan[k % 4]; t0 = b * BAR
    if not BGM: play_lead(ph, t0, g=0.30 if b >= INTRO else 0.26, breath=0.25 if b < INTRO else 0.12)
    elif k % 4 == 0: play_lead(ph, t0, g=0.13, breath=0.3)        # BGM: the reed only every 4th phrase, quiet and breathy
    if b >= INTRO or BGM: play_oud(ph, t0, g=0.10 if BGM else 0.13)
    if b >= 6 and k % 2 == 1 and not BGM:   # qanun runs answering the lead
        qanun_run(t0 + 2 * BAR - 4 * E8, ['D4', 'Eb4', 'F#4', 'G4', 'A4', 'Bb4', 'C5', 'D5'], E8 / 4)
    k += 1; b += 2
mix = np.stack([L, R], 1)[: int(DUR * SR)]
# a small room: convolve with a short decaying noise burst
ir = rng.standard_normal(int(0.9 * SR)) * np.exp(-np.arange(int(0.9 * SR)) / (0.25 * SR)); ir[0] = 0; ir /= np.abs(ir).sum() / 6
from numpy.fft import rfft, irfft
nn = 1 << int(np.ceil(np.log2(len(mix) + len(ir))))
wet = np.stack([irfft(rfft(mix[:, c], nn) * rfft(ir, nn), nn)[: len(mix)] for c in (0, 1)], 1)
out = mix + 0.18 * wet
out = np.tanh(out * 1.2) / 1.2
out *= 0.9 / np.max(np.abs(out))
fade = np.minimum(1, (DUR - np.arange(len(out)) / SR) / 1.2)[:, None]; out *= np.clip(fade, 0, 1)
sf.write(OUT, out, SR)
print('ok', OUT, round(len(out) / SR, 2), 's')
