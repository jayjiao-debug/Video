#!/usr/bin/env python3
"""ep60 v7 music library, composed and synthesised by us (owner 23:00: "旋律由我们自己写，确保每段都用希贾兹";
"eleven labs dont fit our film as much as the ones you generate, give it a try").

One style, one ensemble: ney (mizmar for the comic riff) lead, oud, qanun, darbuka, riq, finger cymbals, sistrum, frame drum,
gong, a low D/A drone. 120 BPM, D Hijaz (D Eb F# G A Bb C) over the drone, no western chord changes; every module has a written
melody leaning on the Eb -> F# augmented second and resolving to D, with ornaments (slides, trills, mordents, turns, graces,
falls) and heterophony (oud and qanun double the lead, slightly late and simplified, tremolo on long notes).

    python3 hijaz60.py build LIB_DIR REF_AUDIO[:start:end]    -> LIB_DIR/<mood>_<N>bar.wav (+ _thin, _intro_1bar, _end), lib.json
    python3 hijaz60.py preview LIB_DIR OUT.wav                 -> the modules on the v6 timeline (169.25 s, music only), mastered
    python3 hijaz60.py sampler LIB_DIR OUT.wav                 -> ~40 s of the main moods

Production: humanised (timing sd 5 ms clipped +-12 ms, downbeats tighter; velocity +-6 %; reed rubato, vibrato, pitch drift,
breath; pick clicks; ghost notes), modal bodies plus a sympathetic-string halo on oud and qanun, a shared room (early
reflections, RT 0.55 s) and a warm hall (RT 2.0 s, dark), a stereo stage (bass mono below 150 Hz). Loops are rendered
circularly (every tail, body ring and reverb wraps into bar 1), so the seams are seamless by construction. One band-share EQ for
the whole library toward the reference, one library gain (groove loop at -20 LUFS, stems with headroom).
"""
import os, sys, re, json, numpy as np, soundfile as sf
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import egypt_cues as E
import lib60
SR = 48000; BEAT = 0.5; E8 = 0.25; BAR = 2.0

# ------------------------------------------------------------------ notation
# a bar = "note:eighths[flags] ..." summing to 8; r = rest. flags: s slide-in from below, ~ trill, m mordent, t turn,
# g upper grace, f fall-off, . staccato, ^ re-tongued, > accent
def parse(bar):
    ev = []
    for tok in bar.split():
        n, rest = tok.split(':'); m = re.match(r'(\d*\.?\d+)(.*)', rest); ev.append((None if n == 'r' else n, float(m.group(1)), m.group(2)))
    return ev
def score(*bars):
    out = []
    for b in bars:
        ev = parse(b); tot = sum(d for _, d, _ in ev); assert abs(tot - 8) < 1e-6, (b, tot); out += ev
    return out
def timed(ev, t0=0.0):
    t = t0
    for n, d, fl in ev:
        yield t, n, d, fl; t += d * E8

def jit(rng, sd=0.005, lim=0.012): return float(np.clip(rng.normal() * sd, -lim, lim))
def tr(n, octv): return E.midi(n) + 12 * octv

# ------------------------------------------------------------------ the take (one module part) and its stems
class Take:
    def __init__(self, bars, loop=True, pre=0.0, tail=4.0, seed=0):
        self.bars, self.loop, self.pre = bars, loop, pre; self.L = bars * BAR; self.Ln = int(round(self.L * SR))
        self.n = self.Ln + (int(8 * SR) if loop else int(round((pre + tail) * SR))); self.stems = {}; self.rng = np.random.default_rng(seed)
    def put(self, stem, sig, t, pan=0.0, g=1.0):
        t = t + (0.0 if self.loop else self.pre)
        if self.loop: t %= self.L
        i = int(round(t * SR))
        if i < 0: sig = sig[-i:]; i = 0
        buf = self.stems.setdefault(stem, np.zeros((self.n, 2))); j = min(self.n, i + len(sig))
        if j <= i: return
        if sig.ndim == 2: buf[i:j] += sig[:j - i] * g; return
        th = (np.clip(pan, -1, 1) + 1) * np.pi / 4; s = sig[:j - i] * g
        buf[i:j, 0] += s * np.cos(th) * 1.4142; buf[i:j, 1] += s * np.sin(th) * 1.4142
    def folded(self):
        out = {}
        for k, b in self.stems.items():
            if not self.loop: out[k] = b; continue
            y = b[:self.Ln].copy(); i = self.Ln
            while i < len(b): seg = b[i:i + self.Ln]; y[:len(seg)] += seg; i += self.Ln
            out[k] = y
        return out

# ------------------------------------------------------------------ instruments (built on egypt_cues, upgraded)
def ney_phrase(T, ev, t0, kind='ney', vel=0.7, pan=-0.08, octv=0, breath=None, stem='lead'):
    """one legato phrase (no rests): ornaments expanded, slight rubato that never drifts off the grid."""
    rng = T.rng; notes = []; carry = 0.0
    for t, n, d, fl in timed(ev):
        m = tr(n, octv); sec = d * E8 + carry; r = jit(rng, 0.006, 0.012) if sec > 0.2 else 0.0; carry = -r; sec += r
        f = ' '.join(w for c, w in (('t', 'turn'), ('g', 'grace'), ('m', 'mord'), ('f', 'fall'), ('.', 'stacc tongue'), ('^', 'tongue')) if c in fl)
        if 's' in fl and sec > 0.18: notes.append((E.step(m, -1), 0.08, '')); sec -= 0.08
        if '~' in fl and sec > 0.3:
            k = int(sec * 0.5 / 0.05); u = E.step(m, 1)
            for j in range(k): notes.append((m if j % 2 == 0 else u, 0.05, ''))
            sec -= k * 0.05
        notes.append((m, max(0.04, sec), f))
    sig = E.reed(notes, vel=vel, rng=rng, kind=kind, breath=breath)
    T.put(stem, sig, t0 + jit(rng, 0.006), pan)

def lead(T, ev, t0=0.0, **kw):
    ph, start, t = [], None, t0
    for tt, n, d, fl in timed(ev, t0):
        if n is None:
            if ph: ney_phrase(T, ph, start, **kw); ph = []
            continue
        if not ph: start = tt
        ph.append((n, d, fl))
    if ph: ney_phrase(T, ph, start, **kw)

def pluck(T, inst, m, t, dur, vel, pan, stem, stacc=False):
    var = int(T.rng.integers(0, 4)); v = vel * (1 + 0.06 * T.rng.normal())
    if inst == 'oud': s = E.oud(m, dur, v, var, stacc=0.35 if stacc else 1.0)
    else: s = E.qanun(m, dur, v, var)
    if stacc:
        k = int(min(len(s), 0.16 * SR)); s = s.copy(); s[k:] *= np.exp(-np.arange(len(s) - k) / (0.03 * SR))
    T.put(stem, s, t, pan)

def string_line(T, ev, t0=0.0, inst='oud', octv=-1, vel=0.6, pan=0.35, trem=4, rate=0.125, stacc=False, late=0.012,
                skip16=True, octave_double=False, stem=None, quarters=False):
    """heterophony: the lead's line on a plucked string, a touch late, simplified (every other 16th), tremolo on long notes."""
    stem = stem or inst; rng = T.rng; k16 = 0
    for t, n, d, fl in timed(ev, t0):
        if n is None: continue
        m = tr(n, octv); sec = d * E8; tt = t + late + jit(rng)
        if quarters and abs(((t - t0) / BEAT) - round((t - t0) / BEAT)) > 0.05: continue   # heterophony on the beats only
        if d < 1:
            k16 += 1
            if skip16 and k16 % 2 == 0: continue
        else: k16 = 0
        if 'g' in fl: pluck(T, inst, E.step(m, 1), tt - 0.05, 0.25, vel * 0.5, pan, stem)
        if 's' in fl: pluck(T, inst, E.step(m, -1), tt - 0.07, 0.2, vel * 0.45, pan, stem)
        if trem and d >= trem and not stacc:
            j = 0; tk = tt
            while tk < t + sec - 0.05:
                pluck(T, inst, m, tk + jit(rng, 0.003), 0.45, vel * (0.85 if j % 2 == 0 else 0.6) * (1 - 0.15 * j / max(1, sec / rate)), pan, stem); j += 1; tk += rate
        else:
            pluck(T, inst, m, tt, min(sec + 0.6, 2.2) if not stacc else sec + 0.15, vel * (1.15 if '>' in fl else 1.0), pan, stem, stacc=stacc or '.' in fl)
            if octave_double: pluck(T, inst, m - 12, tt + 0.006, min(sec + 0.6, 2.2), vel * 0.5, pan, stem)

def qrun(T, t0, n0, n1, dur, vel=0.55, pan=-0.4, stem='qanun'):
    a, b = E.midi(n0), E.midi(n1); sc = [m for m in E.SCALE if min(a, b) <= m <= max(a, b)]
    if a > b: sc = sc[::-1]
    for j, m in enumerate(sc):
        pluck(T, 'qanun', m, t0 + dur * j / len(sc) + jit(T.rng, 0.002), 0.7, vel * (0.6 + 0.4 * j / len(sc)), pan, stem)

def qroll(T, t0, n, dur, vel=0.5, rate=0.0625, pan=-0.4, stem='qanun'):
    m = E.midi(n); j = 0; t = t0
    while t < t0 + dur:
        pluck(T, 'qanun', m if j % 2 == 0 else m - 12, t + jit(T.rng, 0.002), 0.5, vel * (0.9 if j % 2 == 0 else 0.6), pan, stem); j += 1; t += rate

def gong(rng, vel=1.0, f0=52.0, dur=7.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for r_, a, tau in ((1.0, 1.0, 4.0), (1.004, .6, 3.6), (1.51, .55, 3.0), (2.02, .5, 2.6), (2.49, .45, 2.0), (2.98, .35, 1.7),
                       (3.62, .3, 1.3), (4.37, .22, 1.0), (5.21, .16, .7), (6.33, .1, .5)):
        bloom = 1 - np.exp(-t / (0.03 + 0.12 * min(r_, 4)))
        s += a * np.sin(2 * np.pi * f0 * r_ * t + rng.random() * 6.28) * np.exp(-t / tau) * bloom
    s += E.filt(E.sos_lp(220), rng.standard_normal(n)) * np.exp(-t / 0.035) * 2.0      # the mallet
    return E.fade_edges(s * vel * 0.3, 0.001, 0.4)

def frame_drum(rng, vel=1.0, open_=True):
    """bendir: skin boom + hand slap + snare buzz (multi-layer)."""
    s = E.frame(rng, vel, buzz=0.14 if open_ else 0.04, damp=1.0 if open_ else 0.35)
    n = int(0.05 * SR); slap = E.filt(E.sos_bp(600, 2500), rng.standard_normal(n)) * np.exp(-np.arange(n) / (0.006 * SR)) * 0.25 * vel
    s[:n] += slap; return s

def stroke(T, t, k, v):
    rng = T.rng; v = v * (1 + 0.07 * rng.normal())
    if k == 'D': T.put('dum', E.dum(rng, v), t, 0.04)
    elif k == 'T': T.put('tek', E.tek(rng, v), t, 0.1)
    elif k == 'K': T.put('tek', E.tek(rng, v * 0.8, ka=True), t, 0.14)
    elif k == 'g': T.put('tek', E.tek(rng, v * 0.32, ka=rng.random() < 0.5), t, 0.12)
    elif k == 'F': T.put('frame', frame_drum(rng, v), t, -0.06)
    elif k == 'f': T.put('frame', frame_drum(rng, v * 0.6, False), t, -0.06)
    elif k == 'H': T.put('frame', E.heart(rng, v), t, 0.0)
    elif k == 'R': T.put('riq', E.riq(rng, v), t, 0.45)
    elif k == 'r': T.put('riq', E.riq(rng, v * 0.45), t, 0.45)
    elif k == 'Z': T.put('zills', E.zills(rng, v), t, -0.35)
    elif k == 'z': T.put('zills', E.zills(rng, v * 0.45, dur=0.8), t, -0.35)
    elif k == 'X': T.put('sis', E.sistrum(rng, v), t, 0.3)
    elif k == 'G': T.put('gong', gong(rng, v), t, 0.0)

PAT = {   # (eighth, stroke, velocity) per bar
 'maqsum': [(0, 'D', 1), (1, 'T', .8), (3, 'T', .72), (4, 'D', .9), (6, 'T', .8), (7, 'g', 1)],
 'baladi': [(0, 'D', 1), (1, 'D', .75), (3, 'T', .75), (4, 'D', .9), (6, 'T', .8), (7, 'K', .5)],
 'saidi':  [(0, 'D', 1), (1, 'T', .7), (3, 'D', .8), (4, 'D', .9), (6, 'T', .8), (7, 'g', 1)],
 'ayyub':  [(0, 'D', .9), (1.5, 'K', .5), (2, 'D', .75), (3, 'T', .7), (4, 'D', .9), (5.5, 'K', .5), (6, 'D', .75), (7, 'T', .7)],
 'wahda':  [(0, 'D', .8), (4, 'T', .55), (6, 'g', 1)],
 'heart':  [(0, 'H', 1), (0.55, 'H', .6), (4, 'H', .9), (4.55, 'H', .55)],
 'frame2': [(0, 'F', 1), (3, 'f', .6), (4, 'F', .8), (7, 'f', .55)],
}
def drums(T, t0, pat, vel=1.0, skip=()):
    for e, k, v in PAT[pat]:
        if k in skip: continue
        stroke(T, t0 + e * E8 + jit(T.rng, 0.0015 if e == 0 else 0.004, 0.012), k, v * vel)
def riq_bar(T, t0, vel=1.0, full=False):   # calm: jingles on the beats (+ the off-beats when full)
    for e in range(0, 8, 1 if full else 2):
        stroke(T, t0 + e * E8 + jit(T.rng, 0.004), 'R' if e % 2 == 0 else 'r', vel * (0.55 if e % 4 else 0.75))
def roll(T, t0, dur, v0=0.3, v1=0.9, rate=0.0625):
    n = int(round(dur / rate))
    for j in range(n): stroke(T, t0 + j * rate + jit(T.rng, 0.003), 'T' if j % 2 == 0 else 'K', v0 + (v1 - v0) * j / max(1, n - 1))

def drone(T, notes=(('D2', 1.0), ('A2', 0.55)), reed_amt=0.22, level=1.0, swell=True):
    L = T.L if T.loop else None; n = T.Ln if T.loop else T.n; y = np.zeros((n, 2))
    for k, (nm, a) in enumerate(notes): y += a * E.drone_voice(n, nm, L, E.strings, detune=2.5, vib=0.0012, seed=k + 3)
    if reed_amt: y += reed_amt * E.drone_voice(n, 'D3', L, E.arghul, detune=2.0, vib=0.001, seed=9)
    if T.loop: y *= (1 + 0.08 * E.lfo(n, 1 / T.L, L, 0.0))[:, None]
    elif swell:
        e = np.minimum(1, np.arange(n) / (1.2 * SR)); y *= e[:, None]
    T.put('drone', y * level, -T.pre if not T.loop else 0.0)

# ------------------------------------------------------------------ the score (owner 23:28: theme B is the leitmotif; hook A's riff
# drives the two dangerous passages; calm parts sparser: long ney notes, D-Eb trills, downbeat + light pickup percussion)
MEL = {}
def M(name, *bars): MEL[name] = bars; return score(*bars)
THEME = ('D4:1 F#4:1.5 G4:0.5 A4:3 r:2', 'G4:1.5 F#4:0.5 Eb4:2 D4:2 r:2', 'D4:1 F#4:1.5 G4:0.5 A4:3t r:2', 'G4:1.5 F#4:0.5 Eb4:2 D4:2 r:2',
         'G4:1 Bb4:1.5 C5:0.5 D5:3 r:2', 'C5:1.5 Bb4:0.5 A4:2 G4:2 r:2', 'A4:1 Bb4:1 A4:1.5 G4:0.5 F#4:2 r:2', 'G4:1.5 F#4:0.5 Eb4:2m D4:3 r:1')
RIFF = ('D4:1. D4:1. Eb4:1 F#4:2> r:1 G4:1 F#4:1', 'Eb4:1 F#4:1 Eb4:1 D4:3 r:2', 'G4:1. G4:1. A4:1 Bb4:2> r:1 C5:1 Bb4:1', 'A4:1 G4:1 F#4:1 Eb4:1 D4:2 r:2')
HOOK_NEY = M('hook (ney solo; D5 lands on the gong = the title)', 'D4:4s~ Eb4:2 D4:2', 'F#4:3 G4:1 A4:4', 'G4:1 A4:1 Bb4:2 A4:1 Bb4:1 C5:2', 'D5:4> C5:1 Bb4:1 A4:2')
CALM_NEY = M('calm / calm2 (ney; bars 7-8 hint the theme)', 'D4:6~ Eb4:1 D4:1', 'D4:2 Eb4:2 F#4:4', 'G4:2 F#4:1 Eb4:1 F#4:4~', 'Eb4:2 D4:4 r:2',
             'A4:4s Bb4:2 A4:2', 'G4:3 F#4:1 G4:2 F#4:1 Eb4:1', 'D4:1 F#4:1.5 G4:0.5 A4:3 r:2', 'G4:1.5 F#4:0.5 Eb4:2~ D4:2 r:2')
DANGER_RIFF = M('danger (hook A riff: oud + qanun in octaves; mizmar doubles bars 3-4)', *RIFF)
THEME_NEY = M('theme (the leitmotif, ney)', *THEME)
TENS_RIFF = M('tension (the riff building; bars 7-8 climb and stop on F#)', RIFF[0], RIFF[1], RIFF[0], RIFF[1], RIFF[2], RIFF[3],
              'G4:1. G4:1. A4:1 Bb4:2> r:1 C5:1 Bb4:1', 'A4:1 Bb4:1 A4:1 G4:1 F#4:1 Eb4:1 F#4:2>')
TENS_NEY = M('tension (ney, from bar 5)', 'r:8', 'r:8', 'r:8', 'r:8', 'F#4:6s G4:1 F#4:1', 'Eb5:6~ D5:2', 'F#5:4 Eb5:2 F#5:2', 'G5:2 F#5:2 Eb5:2 F#5:2')
PLAY_MIZ = M('playful (mizmar: the theme, staccato)', 'D4:1. F#4:1.5. G4:0.5. A4:1. r:4', 'G4:1.5. F#4:0.5. Eb4:1. D4:1. r:4', 'r:8',
             'G4:1.5. F#4:0.5. Eb4:1. D4:1f r:4', 'G4:1. Bb4:1.5. C5:0.5. D5:1. r:4', 'C5:1.5. Bb4:0.5. A4:1. G4:1. r:4', 'r:8',
             'G4:1.5. F#4:0.5. Eb4:1. D4:2f r:3')
PLAY_OUD = M('playful (oud answers)', 'r:5 Eb4:1. D4:1. Eb4:1.', 'r:5 D4:1. Eb4:1. F#4:1.', 'D4:1. F#4:1.5. G4:0.5. A4:1. G4:1. F#4:1. Eb4:1. D4:1.', 'r:8',
             'r:5 Eb4:1. F#4:1. Eb4:1.', 'r:5 G3:1. F#3:1. Eb3:1.', 'G4:1. Bb4:1.5. A4:0.5. G4:1. F#4:1. Eb4:1. F#4:1. G4:1.', 'r:8')
DARK_NEY = M('dark (low ney, D-Eb trill)', 'r:8', 'D4:6s~ Eb4:2', 'D4:4 Eb4:2 D4:2', 'r:8')
BRIGHT_NEY = M('bright (the theme an octave up)', *[' '.join(f"{t.split(':')[0][:-1]}{int(t.split(':')[0][-1]) + 1}:{t.split(':')[1]}" if not t.startswith('r:') else t for t in b.split()) for b in THEME])
RES_NEY = M('resolution (the theme slow, the chromatic slide C#-C-B-Bb, D)', 'D4:2 F#4:3 G4:1 A4:2', 'A4:4 r:2 A4:1 Bb4:1', 'C#5:2s C5:2 B4:2 Bb4:2',
            'A4:3 G4:1 F#4:2 Eb4:2~', 'D4:8', 'Eb4:1 D4:3 r:4')
PAT.update({'sparse1': [(0, 'D', .85), (2, 'T', .35)], 'sparse2': [(0, 'D', .85), (2, 'T', .35), (6, 'T', .4)],
            'drive': [(0, 'D', 1), (1, 'D', .75), (2, 'T', .6), (3, 'T', .5), (4, 'T', .62), (5, 'T', .5), (7, 'T', .6)]})

def m_hook(T):
    drone(T, reed_amt=0.3)
    lead(T, HOOK_NEY, 0.0, breath=0.28, vel=0.72)
    stroke(T, 0.0, 'z', 0.6); stroke(T, 4.0, 'X', 0.55); qrun(T, 5.5, 'D4', 'D5', 0.5, 0.45)
    for k, v in (('G', 1.0), ('F', 1.0), ('Z', 1.0), ('D', 0.7)): stroke(T, 6.0, k, v)
    pluck(T, 'oud', E.midi('D3'), 6.0, 2.0, 0.85, 0.35, 'oud'); pluck(T, 'oud', E.midi('D2'), 6.006, 2.2, 0.6, 0.35, 'oud')
    qroll(T, 6.0, 'D5', 1.2, 0.3)

CALM_OST = score(*['D3:1. A3:1. D4:1. A3:1. Eb4:1. A3:1. D4:1. A3:1.'] * 8)
def m_calm(T, book=False):   # owner 12:38 "always some music": a soft oud ostinato + a frame-drum pulse under the ney; calm2 = the theme
    drone(T, reed_amt=0.28)
    lead(T, THEME_NEY if book else CALM_NEY, 0.0, breath=0.24, vel=0.68)
    string_line(T, CALM_OST, 0.0, 'oud', 0, 0.34, pan=0.35, trem=0, stacc=True, skip16=False, late=0.0)
    for b in range(8):
        drums(T, b * BAR, 'sparse1', 0.75); stroke(T, b * BAR, 'f', 0.5); stroke(T, b * BAR + 7 * E8, 'f', 0.3)
    for b in (0, 4): stroke(T, b * BAR, 'z', 0.5)
    if book:   # the Book of the Dead: the same melody, the qanun joins in octaves, light riq on the beats, sistrum on the phrase starts
        string_line(T, THEME_NEY, 0.0, 'qanun', 0, 0.36, pan=-0.38, trem=4, rate=0.0625, quarters=True, late=0.006)
        for b in range(8): riq_bar(T, b * BAR, 0.38)
        for b in (0, 4): stroke(T, b * BAR, 'X', 0.45)
    else:
        for t, n, d, fl in timed(CALM_NEY):
            if n and d >= 4: qroll(T, t + 0.03, n, min(d * E8, 1.0), 0.18)

def m_danger(T):
    drone(T, notes=(('D2', 1.0), ('A2', 0.35)), reed_amt=0.3)
    string_line(T, DANGER_RIFF, 0.0, 'oud', -1, 0.75, pan=0.35, trem=0, late=0.0, skip16=False)
    string_line(T, DANGER_RIFF, 0.0, 'qanun', 0, 0.42, pan=-0.38, trem=0, late=0.006, skip16=False)
    lead(T, score('r:8', 'r:8', RIFF[2], RIFF[3]), 0.0, kind='mizmar', vel=0.5, pan=-0.12, breath=0.06)
    qrun(T, BAR + 6 * E8, 'D4', 'A4', 0.5, 0.5); qrun(T, 3 * BAR + 6 * E8, 'Eb4', 'D5', 0.5, 0.55)
    for b in range(4): drums(T, b * BAR, 'drive', 0.9)
    stroke(T, 0.0, 'Z', 0.7); roll(T, 3 * BAR + 6 * E8, 0.5, 0.25, 0.75)

def m_theme(T):
    drone(T, level=0.65, reed_amt=0.18)
    lead(T, THEME_NEY, 0.0, breath=0.2, vel=0.74)
    string_line(T, THEME_NEY, 0.0, 'oud', -1, 0.5, trem=0, quarters=True)
    for t, n, d, fl in timed(THEME_NEY):
        if n and d >= 3: qroll(T, t + 0.02, n, min(d * E8, 0.9), 0.22)
    for b in range(8): drums(T, b * BAR, 'sparse2', 0.9); riq_bar(T, b * BAR, 0.34)
    for b in (0, 4): stroke(T, b * BAR, 'Z', 0.6)
    roll(T, 7 * BAR + 6 * E8, 0.5, 0.2, 0.6)

def m_tension(T):
    drone(T, reed_amt=0.32)
    for b in range(8):
        cres = 0.45 + 0.55 * b / 7; ev = parse(TENS_RIFF_BARS[b])
        string_line(T, ev, b * BAR, 'oud', -1, 0.45 + 0.35 * cres, pan=0.35, trem=0, late=0.0, skip16=False)
        if b >= 2: string_line(T, ev, b * BAR, 'qanun', 0, 0.45 * cres, pan=-0.38, trem=0, late=0.006, skip16=False)
        drums(T, b * BAR, 'heart', 0.75 + 0.3 * cres)
        if 2 <= b < 4:
            for e in (3, 7): stroke(T, b * BAR + e * E8 + jit(T.rng), 'T', 0.5 * cres)
        if b >= 4: drums(T, b * BAR, 'drive', 0.8 * cres)
        if b >= 6: riq_bar(T, b * BAR, 0.5 * cres, full=True)
    lead(T, TENS_NEY, 0.0, breath=0.2, vel=0.74)
    roll(T, 7 * BAR, 1.75, 0.3, 1.0); qroll(T, 7 * BAR + 4 * E8, 'D5', 1.0, 0.45)
    for k in ('F', 'Z'): stroke(T, 7 * BAR, k, 1.0)
TENS_RIFF_BARS = (RIFF[0], RIFF[1], RIFF[0], RIFF[1], RIFF[2], RIFF[3], 'G4:1. G4:1. A4:1 Bb4:2> r:1 C5:1 Bb4:1', 'A4:1 Bb4:1 A4:1 G4:1 F#4:1 Eb4:1 F#4:2>')

def m_playful(T):
    drone(T, notes=(('D2', 1.0), ('A2', 0.25)), level=0.85, reed_amt=0.1)
    lead(T, PLAY_MIZ, 0.0, kind='mizmar', vel=0.48, pan=-0.12, breath=0.06)
    string_line(T, PLAY_MIZ, 0.0, 'oud', -1, 0.42, trem=0, stacc=True, late=0.014, quarters=True)
    string_line(T, PLAY_OUD, 0.0, 'oud', 0, 0.58, trem=0, stacc=True, skip16=False)
    for b in range(8):
        drums(T, b * BAR, 'sparse2', 0.85); stroke(T, b * BAR + 7 * E8 + jit(T.rng), 'K', 0.45)
        if b % 4 == 0:
            for e in (0, 2, 3): stroke(T, b * BAR + e * E8 + jit(T.rng), 'z', 0.5)
    roll(T, 7 * BAR + 6 * E8, 0.5, 0.2, 0.6)

def m_dark(T):
    drone(T, notes=(('D2', 1.0), ('A2', 0.45)), reed_amt=0.35, level=1.2)
    stroke(T, 0.0, 'G', 0.9); stroke(T, 2 * BAR, 'f', 0.45)
    lead(T, DARK_NEY, 0.0, breath=0.32, vel=0.55)

def m_bright(T):
    drone(T, level=1.0, reed_amt=0.15)
    lead(T, BRIGHT_NEY, 0.0, breath=0.16, vel=0.5)
    string_line(T, BRIGHT_NEY, 0.0, 'oud', -2, 0.8, trem=4, rate=0.125, quarters=True)
    for t, n, d, fl in timed(BRIGHT_NEY):
        if n and d >= 3: qroll(T, t + 0.02, tr(n, -1), min(d * E8, 0.9), 0.28)
    qrun(T, -0.5, 'D4', 'D6', 0.5, 0.5); qrun(T, 4 * BAR - 0.5, 'D4', 'D6', 0.5, 0.45)
    for b in range(8): drums(T, b * BAR, 'sparse2', 0.9); riq_bar(T, b * BAR, 0.5, full=True)
    for b in (0, 4): stroke(T, b * BAR, 'X', 0.6); stroke(T, b * BAR, 'Z', 0.65)

def m_resolution(T):
    drone(T, reed_amt=0.25)
    lead(T, RES_NEY, 0.0, breath=0.22, vel=0.7)
    string_line(T, RES_NEY, 0.0, 'oud', -1, 0.45, trem=0, quarters=True)
    for t, n, d, fl in timed(RES_NEY):
        if n and d >= 4 and t < 4 * BAR: qroll(T, t + 0.03, n, min(d * E8, 1.0), 0.2)
    for b in range(4): drums(T, b * BAR, 'sparse1', 0.6)
    for k, v in (('F', 0.9), ('D', 0.6), ('Z', 0.85), ('G', 0.45)): stroke(T, 4 * BAR, k, v)
    pluck(T, 'oud', E.midi('D3'), 4 * BAR, 2.4, 0.8, 0.35, 'oud'); pluck(T, 'oud', E.midi('D2'), 4 * BAR + 0.008, 2.6, 0.55, 0.35, 'oud')
    qroll(T, 4 * BAR, 'D5', 2.0, 0.32)

def m_intro(T, mood):   # one pickup bar into the loop
    drone(T, reed_amt=0.2)
    if mood in ('danger', 'tension', 'playful'): roll(T, 1.0, 1.0, 0.15, 0.7)
    if mood in ('theme', 'bright', 'calm2'): qrun(T, 1.0, 'D4', 'A4' if mood != 'bright' else 'D5', 1.0, 0.42)
    if mood in ('calm', 'dark'): stroke(T, 0.0, 'z', 0.4); lead(T, score('r:4 Eb4:2 D4:2~'), 0.0, breath=0.3, vel=0.5)

def m_end(T, mood):     # the button: D on the downbeat, then the room rings
    if mood == 'dark': stroke(T, 0.0, 'G', 0.8); drone(T, reed_amt=0.3, swell=False); return
    for k, v in (('F', 0.9), ('D', 0.75), ('Z', 0.8)): stroke(T, 0.0, k, v)
    pluck(T, 'oud', E.midi('D3'), 0.0, 2.0, 0.85, 0.35, 'oud'); pluck(T, 'oud', E.midi('D2'), 0.006, 2.2, 0.6, 0.35, 'oud')
    pluck(T, 'qanun', E.midi('D5'), 0.004, 1.8, 0.5, -0.38, 'qanun'); pluck(T, 'qanun', E.midi('D4'), 0.008, 1.8, 0.45, -0.38, 'qanun')
    if mood in ('calm', 'calm2', 'theme', 'bright'): lead(T, score('D4:4 r:4'), 0.0, breath=0.3, vel=0.5)

MODS = {   # mood: (loop bars, composer, thin?, character)
 'calm': (8, m_calm, False, 'die / mummy: ney long notes with D-Eb trills, oud on the beats, qanun rolls on the long notes, drone, dum on 1 + a light tek pickup'),
 'calm2': (8, lambda T: m_calm(T, book=True), False, 'the Book of the Dead: the same melody, qanun joins in octaves, light riq, sistrum on the phrase starts'),
 'danger': (4, m_danger, False, 'the road: hook A riff on oud + qanun in octaves, mizmar doubles the answer, Eb-F# qanun runs, driving darbuka (DDtttt.t)'),
 'theme': (8, m_theme, True, 'hall of the 42 judges: the leitmotif in full on ney, oud on the beats, qanun rolls, sparse darbuka (D.t...t.), riq, zills'),
 'tension': (8, m_tension, True, 'the weighing: the riff builds (oud, + qanun, + drive, + riq), heartbeat bendir, ney climbs to a D5-Eb5 trill, stops on F#'),
 'playful': (8, m_playful, True, 'the scarab cheat: the theme as a staccato mizmar line, oud answers, sparse darbuka + ka, cymbal taps, comic falls'),
 'dark': (4, m_dark, True, 'the second death / the hush: low drone (strings + arghul), low gong, low ney D-Eb trill (thin = the drone alone)'),
 'bright': (8, m_bright, True, 'paradise + shabtis: the theme an octave up, oud on the beats, qanun rolls and glissandi, full riq, sistrum'),
}
ONESHOT = {'hook_intro_4bar': (4, 0.3, m_hook, 'ney solo rising over the drone (D-Eb trill, the augmented second, up to D5 on the gong = the title at 6.30)'),
           'resolution_6bar': (6, 0.0, m_resolution, 'the theme slow, the chromatic slide C#-C-B-Bb, the final D (bar 5) with qanun roll and soft gong, ringing out')}
PERC = {'dum', 'tek', 'riq', 'zills', 'frame', 'sis'}
MOOD_LUFS = {'calm': -21.0, 'calm2': -20.5, 'danger': -19.0, 'theme': -20.0, 'tension': -18.5, 'playful': -20.0, 'dark': -25.0,
             'bright': -19.0, 'hook_intro_4bar': -21.0, 'resolution_6bar': -20.5}
MOD_MELODIES = ['hook (ney solo; D5 lands on the gong = the title)', 'calm / calm2 (ney; bars 7-8 hint the theme)',
                'danger (hook A riff: oud + qanun in octaves; mizmar doubles bars 3-4)', 'theme (the leitmotif, ney)',
                'tension (the riff building; bars 7-8 climb and stop on F#)', 'tension (ney, from bar 5)', 'playful (mizmar: the theme, staccato)',
                'playful (oud answers)', 'dark (low ney, D-Eb trill)', 'bright (the theme an octave up)', 'resolution (the theme slow, the chromatic slide C#-C-B-Bb, D)']

# ------------------------------------------------------------------ production
CFG = {
 'lead':  dict(db=-2.0, hp=230, lp=9000, eq=[(2600, 0.5, 1.0), (900, 1.0, 0.8)], room=0.18, hall=0.36),
 'oud':   dict(db=7.0, body=E.OUD_BODY, symp=-19, hp=70, eq=[(260, -4.0, 0.9), (2200, 2.0, 1.2)], room=0.22, hall=0.2),
 'qanun': dict(db=3.0, body=E.QANUN_BODY, symp=-20, hp=130, room=0.2, hall=0.3),
 'drone': dict(db=-14.5, hp=40, lp=1200, eq=[(250, -3.0, 1.0)], room=0.0, hall=0.25),
 'dum':   dict(db=-4.5, hp=40, eq=[(300, -3.0, 1.0)], room=0.12, hall=0.05),
 'tek':   dict(db=-4.5, eq=[(2500, -2.0, 1.2)], room=0.2, hall=0.08),
 'riq':   dict(db=-13.5, hp=2500, room=0.15, hall=0.12),
 'zills': dict(db=-13.0, hall=0.4),
 'frame': dict(db=-8.0, hp=40, room=0.15, hall=0.1),
 'gong':  dict(db=-7.0, hall=0.35),
 'sis':   dict(db=-15.0, hp=2500, hall=0.3),
}
_IR = {}
def irs():
    if not _IR:
        _IR['room'] = E.make_ir(rt60=0.55, pre=0.006, seed=31)
        h = E.make_ir(rt60=2.0, pre=0.022, seed=32); _IR['hall'] = E.filt(E.sos_lp(5000), h)
        rng = np.random.default_rng(5); n = int(2.5 * SR); t = np.arange(n) / SR; s = np.zeros(n)
        for nm in ('D2', 'A2', 'D3', 'G3', 'A3', 'D4'):
            f = E.hz(nm)
            for k in range(1, 6): s += 0.6 ** k * np.sin(2 * np.pi * f * k * t + rng.random() * 6.28) * np.exp(-t / (1.4 / k ** 0.3))
        _IR['symp'] = s / np.sqrt((s ** 2).sum())
    return _IR

def cconv(x, ir, n):
    """circular convolution over the loop length n (exact steady state of a looped signal)."""
    irp = ir if ir.ndim == 2 else np.stack([ir, ir], 1); f = np.zeros((n, 2)); i = 0
    while i < len(irp): seg = irp[i:i + n]; f[:len(seg)] += seg; i += n
    return np.fft.irfft(np.fft.rfft(x, axis=0) * np.fft.rfft(f, axis=0), n, axis=0)
def lconv(x, ir):
    irp = ir if ir.ndim == 2 else np.stack([ir, ir], 1)
    return np.stack([signal.oaconvolve(x[:, c], irp[:, c])[:len(x)] for c in (0, 1)], 1)

def mixdown(T, side=1.5):
    stems = T.folded(); loop = T.loop; n = len(next(iter(stems.values())))
    conv = (lambda x, ir: cconv(x, ir, n)) if loop else lconv
    flt = (lambda fn, x: lib60.circ(fn, x)) if loop else (lambda fn, x: fn(x))
    R = irs(); dry = {}; sends = {}
    for name, x in stems.items():
        c = CFG[name]
        if c.get('body') is not None: x = conv(x, c['body'])
        if c.get('symp') is not None:
            s = conv(np.repeat(x.mean(1, keepdims=True), 2, 1), R['symp']); r = np.sqrt((x ** 2).mean() / ((s ** 2).mean() + 1e-20))
            x = x + s * r * 10 ** (c['symp'] / 20)
        if c.get('hp'): x = flt(lambda z: E.filt(E.sos_hp(c['hp']), z), x)
        if c.get('lp'): x = flt(lambda z: E.filt(E.sos_lp(c['lp']), z), x)
        for f, g, q in c.get('eq', []): x = flt(lambda z: E.peak_eq(z, f, g, q), x)
        x = x * 10 ** (c['db'] / 20); dry[name] = x; sends[name] = (x * c.get('room', 0), x * c.get('hall', 0))
    def bus(names):
        y = sum(dry[k] for k in names); rs = sum(sends[k][0] for k in names); hs = sum(sends[k][1] for k in names)
        hs = flt(lambda z: E.filt(E.sos_hp(200), z), hs)
        y = y + 0.5 * conv(rs, R['room']) + 0.42 * conv(hs, R['hall'])
        M_, S_ = (y[:, 0] + y[:, 1]) / 2, (y[:, 0] - y[:, 1]) / 2
        S_ = side * flt(lambda z: signal.sosfiltfilt(signal.butter(4, 150, 'high', fs=SR, output='sos'), z, axis=0), S_[:, None])[:, 0]
        y = np.stack([M_ + S_, M_ - S_], 1); return flt(lambda z: E.filt(E.sos_hp(30), z), y)
    names = list(dry); full = bus(names)
    thin_names = [k for k in names if k not in PERC]
    return full, (bus(thin_names) if thin_names else None), dry

# ------------------------------------------------------------------ owner 23:16: three catchy theme options (8 bars each)
HA_RIFF = M('hook A (riff, oud + qanun in octaves)',
            'D4:1. D4:1. Eb4:1 F#4:2> r:1 G4:1 F#4:1', 'Eb4:1 F#4:1 Eb4:1 D4:3 r:2',
            'D4:1. D4:1. Eb4:1 F#4:2> r:1 G4:1 F#4:1', 'Eb4:1 F#4:1 Eb4:1 D4:3 r:2',
            'G4:1. G4:1. A4:1 Bb4:2> r:1 C5:1 Bb4:1', 'A4:1 G4:1 F#4:1 Eb4:1 D4:2 r:2',
            'D4:1. D4:1. Eb4:1 F#4:2> r:1 G4:1 F#4:1', 'Eb4:1 F#4:1 Eb4:1 D4:3 r:2')
HA_MIZ = M('hook A (mizmar answer)', 'r:8', 'r:8', 'r:8', 'r:8', 'G5:1. G5:1. A5:1 Bb5:2 r:1 C6:1 Bb5:1', 'A5:1 G5:1 F#5:1 Eb5:1 D5:2 r:2', 'r:8', 'r:8')
HB_NEY = M('hook B (ney, AABA)',
           'D4:1 F#4:1.5 G4:0.5 A4:3 r:2', 'G4:1.5 F#4:0.5 Eb4:2 D4:2 r:2',
           'D4:1 F#4:1.5 G4:0.5 A4:3t r:2', 'G4:1.5 F#4:0.5 Eb4:2 D4:2 r:2',
           'G4:1 Bb4:1.5 C5:0.5 D5:3 r:2', 'C5:1.5 Bb4:0.5 A4:2 G4:2 r:2',
           'A4:1 Bb4:1 A4:1.5 G4:0.5 F#4:2 r:2', 'G4:1.5 F#4:0.5 Eb4:2m D4:3 r:1')
HC_CALL = M('hook C (mizmar calls)',
            'D4:1. Eb4:1. F#4:2> G4:1. F#4:1. r:2', 'r:8', 'Eb4:1. F#4:1. A4:2> G4:1. F#4:1. r:2', 'r:8',
            'G4:1. A4:1. Bb4:2> C5:1. Bb4:1. r:2', 'r:8', 'D5:2> C5:1. Bb4:1. A4:1. G4:1. F#4:1. Eb4:1.', 'r:8')
HC_ANS = M('hook C (oud + qanun answers in unison)',
           'r:8', 'Eb4:1 F#4:1 Eb4:1 D4:2> r:3', 'r:8', 'Eb4:1 F#4:1 G4:1 F#4:2> r:3',
           'r:8', 'Eb4:1 F#4:1 A4:1 G4:2> r:3', 'r:8', 'D4:2> r:1 D4:1> r:1 D4:1> r:2')

def m_hookA(T):
    drone(T, level=0.55, reed_amt=0.12)
    string_line(T, HA_RIFF, 0.0, 'oud', -1, 0.75, pan=0.35, trem=0, late=0.0, skip16=False)
    string_line(T, HA_RIFF, 0.0, 'qanun', 0, 0.5, pan=-0.38, trem=0, late=0.006, skip16=False)
    lead(T, HA_MIZ, 0.0, kind='mizmar', vel=0.5, pan=-0.12, breath=0.06, octv=-1)
    for b in range(8):
        drums(T, b * BAR, 'maqsum', 0.95)
        if b % 2 == 0: stroke(T, b * BAR + 3 * E8, 'T', 0.9)          # the riff's syncopation, doubled on the drum
    for b in (0, 4): stroke(T, b * BAR, 'Z', 0.7)
    roll(T, 7 * BAR + 6 * E8, 0.5, 0.25, 0.75)

def m_hookB(T):
    drone(T, level=0.7, reed_amt=0.2)
    lead(T, HB_NEY, 0.0, breath=0.2, vel=0.74)
    string_line(T, HB_NEY, 0.0, 'oud', -1, 0.5, trem=0, quarters=True)
    for t, n, d, fl in timed(HB_NEY):
        if n and d >= 3: qroll(T, t + 0.02, n, min(d * E8, 0.9), 0.22)
    for b in range(8): drums(T, b * BAR, 'wahda', 0.9); stroke(T, b * BAR + 6 * E8, 'D', 0.55); riq_bar(T, b * BAR, 0.35)
    for b in (0, 4): stroke(T, b * BAR, 'z', 0.6)

def m_hookC(T):
    drone(T, notes=(('D2', 1.0), ('A2', 0.25)), level=0.6, reed_amt=0.15)
    lead(T, HC_CALL, 0.0, kind='mizmar', vel=0.62, pan=-0.12, breath=0.06)
    string_line(T, HC_ANS, 0.0, 'oud', -1, 0.75, pan=0.35, trem=0, late=0.0, skip16=False)
    string_line(T, HC_ANS, 0.0, 'qanun', 0, 0.55, pan=-0.38, trem=0, late=0.004, skip16=False)
    for t, n, d, fl in timed(HC_ANS):
        if n and '>' in fl: stroke(T, t, 'D', 1.0); stroke(T, t + 0.003, 'T', 0.8)
        if n and '>' in fl and t >= 7 * BAR: stroke(T, t, 'Z', 0.8)
    for b in range(8):
        if b % 2 == 0: drums(T, b * BAR, 'wahda', 0.7)
        riq_bar(T, b * BAR, 0.4)

HOOKS = {'A': (m_hookA, 'riff-led'), 'B': (m_hookB, 'singable theme'), 'C': (m_hookC, 'call and response')}
def hooks(out, ref):
    rend = {}
    for k, (fn, _) in HOOKS.items():
        T = Take(8, True, seed=101 + ord(k)); fn(T); rend[k] = mixdown(T)[0]; E._KS.clear(); print('rendered hook', k, flush=True)
    segs = []
    for k, x in rend.items():   # each candidate EQ'd on its own toward the targets (the library EQ is set once the theme is picked)
        fir = lib_eq([x], ref, {})
        eq = lambda z: signal.fftconvolve(np.concatenate([z, np.zeros((len(fir), 2))]), fir[:, None], mode='full')[len(fir) // 2:len(fir) // 2 + len(z)]
        x = lib60.circ(eq, x); y = np.concatenate([x, x[:int(0.4 * SR)]]); r = int(0.4 * SR); y[-r:] *= np.linspace(1, 0, r)[:, None] ** 2
        q = int(0.02 * SR); y[:q] *= np.linspace(0, 1, q)[:, None]; y *= 10 ** ((-20 - E.lufs(y)) / 20); segs.append(y)
        sf.write(out.replace('.wav', f'_{k}.wav'), y.astype(np.float32), SR, subtype='PCM_24')
    gap = np.zeros((int(0.8 * SR), 2)); y = np.concatenate([segs[0], gap, segs[1], gap, segs[2]])
    y = lib60.master(y); sf.write(out, y.astype(np.float32), SR, subtype='PCM_24'); print('hooks', out, round(len(y) / SR, 2), 's', round(E.lufs(y), 2), 'LUFS')

def lib_eq(loops, ref, meta, strength=1.0, lim=8.0):
    """one band-share EQ for the library (targets: the reference's shares, <120 Hz -6, 500-2k -4; the top 1-4 dB under the mids)."""
    rp, *rr = ref.split(':'); r = lib60.load(rp, *rr) if rr else lib60.load(rp)
    f, Pr = signal.welch(r.mean(1), SR, nperseg=16384)
    Pl = np.mean([signal.welch(x.mean(1), SR, nperseg=16384)[1] for x in loops], 0)
    edges = [(20, 120), (120, 500), (500, 2000), (2000, 6000)]; cen = np.array([60., 245., 1000., 3460.])
    share = lambda P: np.array([10 * np.log10(P[(f >= a) & (f < b)].sum() / P[f >= 20].sum()) for a, b in edges])
    target = share(Pr); target[0] = -6.0; target[2] = -4.0; gc = np.zeros(4)
    curve = lambda fq, gc: np.where(fq >= 6000, np.clip(gc[3], gc[2] - 6, gc[2] - 3), np.interp(np.log(np.maximum(fq, 20)), np.log(cen), gc))
    for _ in range(14):
        gc += 0.8 * (target - share(Pl * 10 ** (curve(f, gc) / 10))); gc -= gc[2]; gc = np.clip(gc, [-8, -8, 0, -8], [3, 6, 0, 6])   # 1 kHz fixed; sub boost <= +3 dB
    gc = np.clip(gc * strength, -lim, lim); c = np.geomspace(31.5, 16000, 28); g = curve(c, gc)
    meta['eq_db'] = {f'{int(a)}': round(float(v), 1) for a, v in zip(c, g)}
    meta['band_shares'] = dict(target=[round(v, 1) for v in target], before=[round(v, 1) for v in share(Pl)], after=[round(v, 1) for v in share(Pl * 10 ** (curve(f, gc) / 10))])
    print('EQ', ' '.join(f'{int(a)}:{v:+.1f}' for a, v in zip(c, g)), '\nbands', meta['band_shares'], flush=True)
    return lib60.eq_fir(c, g)

def direction(out, ref, mood='theme'):
    """owner 23:09: one short direction sample (8 bars of one mood, mastered to -14 LUFS)."""
    N, fn, *_ = MODS[mood]; T = Take(N, True, seed=hash(mood) % 10000); fn(T); full = mixdown(T)[0]; meta = {}
    fir = lib_eq([full], ref, meta)
    x = lib60.circ(lambda z: signal.fftconvolve(np.concatenate([z, np.zeros((len(fir), 2))]), fir[:, None], mode='full')[len(fir) // 2:len(fir) // 2 + len(z)], full)
    y = np.concatenate([x, x[:int(0.5 * SR)]]); k = int(0.5 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2   # 16 s + a short fade
    k = int(0.02 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]
    y = lib60.master(y); sf.write(out, y.astype(np.float32), SR, subtype='PCM_24'); print('direction', out, round(len(y) / SR, 2), 's', round(E.lufs(y), 2), 'LUFS', round(E.true_peak(y), 2), 'dBTP')

def build(lib, ref):
    os.makedirs(lib, exist_ok=True); files, meta = {}, {'grid': 'film downbeats at 0.3 + 2k s; 120 BPM; D Hijaz', 'modules': {}, 'melodies': {}}
    for mood, (N, fn, thin, what) in MODS.items():
        T = Take(N, True, seed=hash(mood) % 10000); fn(T); full, th, _ = mixdown(T)
        files[f'{mood}_{N}bar'] = full
        if thin:
            if mood == 'dark':
                T2 = Take(N, True, seed=11); drone(T2, notes=(('D2', 1.0), ('A2', 0.45)), reed_amt=0.35, level=1.2); files[f'{mood}_{N}bar_thin'] = mixdown(T2)[0]
            else: files[f'{mood}_{N}bar_thin'] = th
        Ti = Take(1, False, pre=0.0, tail=3.0, seed=7); m_intro(Ti, mood); files[f'{mood}_intro_1bar'] = mixdown(Ti)[0]
        Te = Take(1, False, pre=0.0, tail=3.5, seed=8); m_end(Te, mood); files[f'{mood}_end'] = E.trim_tail(mixdown(Te)[0], -70, 0.3)
        meta['modules'][mood] = dict(bars=N, seconds=N * BAR, thin=thin, character=what); E._KS.clear(); print('rendered', mood, flush=True)
    for name, (N, pre, fn, what) in ONESHOT.items():
        T = Take(N, False, pre=pre, tail=4.0, seed=5); fn(T); files[name] = E.trim_tail(mixdown(T)[0], -70, 0.4)
        meta['modules'][name] = dict(bars=N, pickup_s=pre, seconds=round(len(files[name]) / SR, 2), character=what); print('rendered', name, flush=True)
    meta['melodies'] = {k: list(MEL[k]) for k in MOD_MELODIES}
    fir = lib_eq([files[f'{m}_{MODS[m][0]}bar'] for m in MODS], ref, meta)
    eq = lambda x: signal.fftconvolve(np.concatenate([x, np.zeros((len(fir), 2))]), fir[:, None], mode='full')[len(fir) // 2:len(fir) // 2 + len(x)]
    isloop = lambda k: (k.endswith('bar') or k.endswith('bar_thin')) and 'intro' not in k
    for k in files: files[k] = lib60.circ(eq, files[k]) if isloop(k) else eq(files[k])
    # one tone for every module: a gentle per-module trim (60 % toward the same band targets, +-3 dB), shared by its thin/intro/end
    for mood, (N, *_r) in MODS.items():
        mm = {}; fm = lib_eq([files[f'{mood}_{N}bar']], ref, mm, strength=0.6, lim=3.0); meta['modules'][mood]['trim_db'] = mm['eq_db']
        eqm = lambda x, fm=fm: signal.fftconvolve(np.concatenate([x, np.zeros((len(fm), 2))]), fm[:, None], mode='full')[len(fm) // 2:len(fm) // 2 + len(x)]
        for k in [k for k in files if k.startswith(mood + '_')]: files[k] = lib60.circ(eqm, files[k]) if isloop(k) else eqm(files[k])
    # energy flat like the reference (sections within ~4 dB; the hush lower): one loudness per mood, shared by all its files
    gains = {}
    for mood, (N, *_r) in MODS.items(): gains[mood] = 10 ** ((MOOD_LUFS[mood] - E.lufs(files[f'{mood}_{N}bar'])) / 20)
    for name in ONESHOT: gains[name] = 10 ** ((MOOD_LUFS[name] - E.lufs(files[name])) / 20)
    meta['mood_lufs'] = MOOD_LUFS; meta['library_gain_db'] = 'per mood (mood_lufs)'
    for k, x in files.items():
        mood = k if k in ONESHOT else k.split('_')[0]; gain = gains[mood]
        x = E.limit(x * gain, -1.0, circular=isloop(k)); sf.write(f'{lib}/{k}.wav', x.astype(np.float32), SR, subtype='PCM_24')
        meta.setdefault('files', {})[k] = dict(seconds=round(len(x) / SR, 3), lufs=round(E.lufs(x), 1) if len(x) > SR else None, tp=round(E.true_peak(x), 2))
    json.dump(meta, open(f'{lib}/lib.json', 'w'), indent=1, ensure_ascii=False); print('wrote', lib, len(files), 'files')

# ------------------------------------------------------------------ the v6 layout (same plan as v6b, our modules)
PLAN = [
 (0.0, 8.3, 'hook_intro_4bar', dict(inn='hard', out='x')),            # 0.3 s pickup; bars at 0.3/2.3/4.3/6.3: D5 + gong on the title 6.30
 (8.3, 26.3, 'calm_8bar', dict(inn='x')),                              # you die, the mummy
 (26.3, 42.3, 'calm2_8bar', dict(inn='eg', bar0=1)),                   # the Book: same melody, new arrangement (sample-aligned: equal-gain swap)
 (42.3, 52.3, 'danger_4bar', dict(inn='x')),                           # the road: the riff
 (52.3, 72.3, 'theme_8bar', dict(inn='x', out='button')),              # hall + oath: the leitmotif; bar 2 ends on D, button on 72.3 = 「话太多」
 (76.3, 92.3, 'tension_8bar', dict(inn='swell')),                      # the weighing (BGM out for the roar at 90.77 in the SFX pass)
 (92.3, 96.3, 'dark_4bar', dict(inn='x')),                             # 32: the bed thins: drone + low gong
 (96.3, 98.3, 'dark_4bar_thin', dict(inn='eg', out='cut', bar0=2, db=-3)),   # 33: drone only; cut on 98.3
 (98.3, 106.3, 'playful_8bar', dict(inn='hard')),                      # 34 「等等——」 the cheat: the theme, staccato
 (106.3, 114.3, 'playful_8bar_thin', dict(inn='eg', out='eg', bar0=4)),# 37: drums out under the papyrus line
 (114.3, 121.57, 'playful_8bar', dict(inn='eg', out='cut', bar0=0)),   # cut on the pan crash 121.57
 (126.3, 130.11, 'dark_4bar', dict(inn='swell', out='cut', db=-2)),    # 43: after the chomp, the doom drone; dead stop 130.11
 (130.3, 142.17, 'bright_8bar', dict(inn='swell', out='cut')),         # pass: the theme an octave up; the hiccup at 142.17
 (142.3, 156.3, 'bright_8bar', dict(inn='hard', out='x', bar0=6)),     # shabtis: picks up where it hiccuped
 (156.3, 169.25, 'resolution_6bar', dict(inn='x')),                    # close: the theme slow, chromatic slide, final D on 164.3, ring through the card
]

def sampler(lib, out):
    parts = [('calm_8bar', 0, 3), ('theme_8bar', 0, 4), ('danger_4bar', 0, 2), ('tension_8bar', 5, 3), ('playful_8bar', 0, 3), ('bright_8bar', 0, 4)]
    segs = []
    for name, b0, nb in parts:
        x = sf.read(f'{lib}/{name}.wav', always_2d=True)[0]; x = np.roll(x, -b0 * int(BAR * SR), 0)[:nb * int(BAR * SR)].copy()
        k = int(0.06 * SR); x[:k] *= np.linspace(0, 1, k)[:, None]; segs.append(x)
    y = segs[0]; xf = int(0.25 * SR)
    for s in segs[1:]:
        w = np.sin(np.linspace(0, np.pi / 2, xf))[:, None]; y[-xf:] = y[-xf:] * w[::-1] + s[:xf] * w; y = np.concatenate([y, s[xf:]])
    k = int(1.5 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
    y = lib60.master(y); sf.write(out, y.astype(np.float32), SR, subtype='PCM_24'); print('sampler', round(len(y) / SR, 2), 's', round(E.lufs(y), 2), 'LUFS')

if __name__ == '__main__':
    if sys.argv[1] == 'build': build(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'preview': lib60.preview(sys.argv[2], sys.argv[3], PLAN)
    elif sys.argv[1] == 'sampler': sampler(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'hooks': hooks(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'direction': direction(sys.argv[2], sys.argv[3], *(sys.argv[4:5]))
