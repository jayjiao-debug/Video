#!/usr/bin/env python3
"""Ep1 《一声「咚」，怎么变成一整支乐队》: the whole score. One file makes the music and the timing the picture follows.
python3 score.py <outdir>  ->  <outdir>/score.json (every note, section, beat and subtitle with its time) and <outdir>/mix.wav
Instruments are sampled (FluidR3 GM soundfont, played note by note through FluidSynth); the gang shouts are synthesised here."""
import json, os, sys, subprocess, tempfile, numpy as np, mido
from concurrent.futures import ThreadPoolExecutor
from scipy.io import wavfile
from scipy.signal import fftconvolve, butter, sosfilt

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
os.makedirs(OUT, exist_ok=True)
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 48000
rng = np.random.default_rng(11)

# ======================================================================= sections and time
SECS = [  # name, bpm, bars, world, swing
    ('cold', 100, 4, 'arena', 0), ('pulse', 100, 4, 'room', 0), ('bpm100', 100, 2, 'room', 0), ('bpm70', 70, 2, 'room', 0),
    ('bpm150', 150, 2, 'room', 0), ('bar', 100, 2, 'room', 0), ('strong', 100, 2, 'room', 0), ('backbeat', 100, 4, 'room', 0),
    ('hats', 100, 4, 'room', 0), ('groove', 100, 4, 'room', 0), ('bass', 100, 4, 'room', 0), ('chords', 100, 4, 'room', 0),
    ('guitar', 100, 4, 'room', 0), ('song', 100, 8, 'room', 0), ('bridge', 100, 2, 'room', 0),
    ('classical', 76, 12, 'hall', 0), ('run2', 132, 2, 'street', 1), ('jazz', 132, 20, 'club', 1),
    ('run3', 150, 2, 'dark', 0), ('rock', 150, 24, 'arena', 0), ('run4', 112, 2, 'stairs', 0),
    ('finale', 112, 20, 'roof', 0), ('outro', 100, 4, 'roof', 0)]
RES = 96
def bpm_at(name, bpm, b):
    if name == 'classical' and b > 40: return bpm - (bpm - 46) * min(1, (b - 40) / 8) ** 1.2
    if name == 'finale' and b > 76: return bpm - (bpm - 84) * min(1, (b - 76) / 4)
    if name == 'outro' and b > 8: return bpm - (bpm - 72) * min(1, (b - 8) / 8)
    return bpm
SEC, t = [], 0.0
for (name, bpm, bars, world, sw) in SECS:
    n = (bars + 6) * 4 * RES
    bb = np.arange(n) / RES
    dt = 60 / np.array([bpm_at(name, bpm, b) for b in bb]) / RES
    cum = np.concatenate([[0], np.cumsum(dt)])
    S = dict(name=name, bpm=bpm, bars=bars, world=world, swing=sw, t0=t, cum=cum)
    S['t1'] = t + cum[bars * 4 * RES]
    SEC.append(S); t = S['t1']
END = t
SI = {S['name']: i for i, S in enumerate(SEC)}
def swung(b, amt=.64):
    w = np.floor(b); f = b - w
    return w + (f / .5 * amt if f <= .5 else amt + (f - .5) / .5 * (1 - amt))
def T(sec, b):
    S = SEC[SI[sec]]
    if S['swing']: b = swung(b)
    x = b * RES; i = int(np.clip(np.floor(x), 0, len(S['cum']) - 2)); f = x - i
    return S['t0'] + S['cum'][i] + f * (S['cum'][i + 1] - S['cum'][i])

# ======================================================================= tracks
TR = {}
def track(key, prog, who, part, lvl, pan=0.0, room=.25, hall=.25, drum=False, drive=0.0):
    TR[key] = dict(prog=prog, who=who, part=part, lvl=lvl, pan=pan, room=room, hall=hall, drum=drum, drive=drive, notes=[], cc=[], pb=[])
# Part 1 pop band
track('kit', 0, 'drums', 'kit', -19, 0, .25, .12, drum=True)
track('pbass', 33, 'bass', 'bass', -21, 0, .1, .05)
track('keys', 0, 'keys', 'piano', -24, .25, .3, .2)
track('cgtr', 27, 'guitar', 'gtr', -25, -.35, .3, .15)
track('vox', 53, 'vox', 'vox', -18, 0, .35, .3)
# classical
track('strings', 48, 'guitar', 'strings', -23, 0, .1, .6)
track('cbass', 43, 'bass', 'cbass', -24, .1, .1, .5)
track('violin', 40, 'guitar', 'violin', -25, -.3, .1, .55)
track('timp', 47, 'drums', 'timp', -21, 0, .1, .55)
track('flute', 73, 'flute', 'flute', -24, .3, .1, .55)
track('cpiano', 0, 'keys', 'piano', -26, .2, .1, .5)
track('sop', 53, 'vox', 'vox', -18, 0, .1, .6)
# jazz
track('jkit', 40, 'drums', 'kit', -22, 0, .3, .1, drum=True)
track('jbass', 32, 'bass', 'walk', -21, 0, .25, .05)
track('jpiano', 0, 'keys', 'piano', -25, .25, .35, .1)
track('jgtr', 26, 'guitar', 'gtr', -29, -.3, .35, .1)
track('sax', 65, 'sax', 'sax', -22, -.25, .35, .15)
track('tpt', 56, 'tpt', 'tpt', -22, .25, .35, .15)
track('tbn', 57, 'tbn', 'tbn', -23, .05, .35, .15)
track('scat', 53, 'vox', 'vox', -19, 0, .35, .15)
# rock
track('rkit', 16, 'drums', 'kit', -18, 0, .2, .25, drum=True)
track('claps', 0, 'crowd', 'clap', -27, 0, .2, .5, drum=True)
track('rbass', 34, 'bass', 'bass', -20, 0, .1, .1)
track('rgtr', 30, 'guitar', 'power', -21, -.3, .15, .2)
track('lead', 30, 'guitar', 'lead', -20, .15, .2, .35)
track('organ', 18, 'keys', 'organ', -27, .3, .2, .3)
track('rvoxA', 52, 'vox', 'vox', -21, 0, .2, .35, drive=2.0)
track('rvoxB', 53, 'vox', 'vox', -20, 0, .2, .35, drive=2.5)
track('crowd', 52, 'crowd', 'sing', -29, 0, .2, .8)
track('fdbk', 30, 'guitar', 'fdbk', -27, -.2, .1, .5)
# finale and others
track('fkit', 8, 'drums', 'kit', -20, 0, .2, .25, drum=True)
track('fbass', 33, 'bass', 'bass', -21, 0, .1, .1)
track('fstr', 48, 'guitar', 'strings', -23, 0, .1, .45)
track('fpiano', 0, 'keys', 'piano', -26, .25, .2, .2)
track('fvox', 53, 'vox', 'vox', -18, 0, .25, .35)
track('fvox2', 52, 'vox', 'vox', -27, 0, .25, .45)
track('brass', 61, 'horns', 'brass', -22, 0, .2, .35)
track('applause', 126, 'crowd', 'applause', -27, 0, .1, .4)
track('birds', 123, 'fx', 'birds', -32, .4, .1, .5)
track('pad', 89, 'keys', 'pad', -28, 0, .2, .4)
track('perc', 0, 'fx', 'perc', -30, 0, .2, .2, drum=True)
track('bed', 89, 'fx', 'bed', -33, 0, .3, .3)

EV = []
DRUMPART = {35: 'kick', 36: 'kick', 37: 'snap', 38: 'snare', 40: 'snare', 39: 'clap', 42: 'hat', 44: 'hatp', 46: 'ohat', 49: 'crash',
            57: 'crash', 51: 'ride', 53: 'bell', 41: 'tom', 43: 'tom', 45: 'tom', 47: 'tom', 48: 'tom', 50: 'tom', 76: 'wood', 77: 'wood'}
def N(key, sec, b, d, p, v=90, part=None, syl=None, vib=0, jit=None, who=None):
    tr = TR[key]; t0 = T(sec, b); t1 = T(sec, b + d)
    j = (0.002 if tr['drum'] else 0.005) if jit is None else jit
    if j: t0 += float(np.clip(rng.normal(0, j), -2.5 * j, 2.5 * j))
    t0 = max(0.0, t0); t1 = max(t0 + 0.04, t1 - 0.012)
    v = int(np.clip(v + rng.integers(-4, 5), 1, 127))
    tr['notes'].append((t0, t1, int(p), v))
    if vib and t1 - t0 > .4:
        tr['cc'] += [(t0, 1, 0), (t0 + .2, 1, vib // 3), (t0 + .4, 1, vib)]
    if tr['drum']: part = part or DRUMPART.get(int(p), 'perc')
    EV.append([round(t0, 4), round(t1 - t0, 4), who or tr['who'], part or tr['part'], int(p), v, syl])
def CC(key, sec, b0, b1, cc, v0, v1, n=24):
    for i in range(n + 1):
        bb = b0 + (b1 - b0) * i / n; TR[key]['cc'].append((T(sec, bb), cc, int(v0 + (v1 - v0) * i / n)))

# ======================================================================= the song 《晚风》
MEL = [(0, 0, 1.5, 67), (0, 1.5, .5, 69), (0, 2, 1, 72), (0, 3, 1, 74),
       (1, 0, 2, 76), (1, 2, 1, 74), (1, 3, 1, 72),
       (2, 0, 1, 69), (2, 1, 1, 72), (2, 2, 1, 77), (2, 3, 1, 76),
       (3, 0, 3, 74),
       (4, 0, 1.5, 67), (4, 1.5, .5, 69), (4, 2, 1, 72), (4, 3, 1, 74),
       (5, 0, 1.5, 76), (5, 1.5, .5, 79), (5, 2, 1, 76), (5, 3, 1, 74),
       (6, 0, 1, 72), (6, 1, 1, 69), (6, 2, 1, 71), (6, 3, 1, 74),
       (7, 0, 3, 72)]
SONG = [[(0, 4, 'C')], [(0, 4, 'Am')], [(0, 4, 'F')], [(0, 4, 'G')], [(0, 4, 'C')], [(0, 4, 'Am')], [(0, 2, 'F'), (2, 2, 'G')], [(0, 4, 'C')]]
JAZZ = [[(0, 4, 'Cmaj7')], [(0, 4, 'Am9')], [(0, 4, 'Fmaj7')], [(0, 2, 'Dm7'), (2, 2, 'G7')], [(0, 4, 'Cmaj7')], [(0, 4, 'Am7')], [(0, 2, 'Dm7'), (2, 2, 'G7')], [(0, 4, 'C69')]]
ROOT = dict(C=0, Am=9, F=5, G=7, Cmaj7=0, Am9=9, Am7=9, Fmaj7=5, Dm7=2, G7=7, C69=0)
TONES = dict(C=[0, 4, 7], Am=[9, 0, 4], F=[5, 9, 0], G=[7, 11, 2], Cmaj7=[0, 4, 7, 11], Am9=[9, 0, 4, 7, 11], Am7=[9, 0, 4, 7],
             Fmaj7=[5, 9, 0, 4], Dm7=[2, 5, 9, 0], G7=[7, 11, 2, 5], C69=[0, 4, 7, 9, 2])
VOI = dict(C=[52, 55, 60], Am=[52, 57, 60], F=[53, 57, 60], G=[50, 55, 59],
           Cmaj7=[52, 55, 59, 62], Am9=[55, 59, 60, 64], Fmaj7=[52, 55, 57, 60], Dm7=[53, 57, 60, 64], G7=[53, 57, 59, 64],
           Am7=[55, 57, 60, 64], C69=[52, 57, 62, 67])
SCAT = ['doo', 'bah', 'doo', 'dee', 'bah', 'dah', 'doo', 'bee', 'dah', 'doo', 'bah', 'dee']
def near(pc, lo, hi, ref):
    c = [p for p in range(lo, hi + 1) if p % 12 == pc % 12]
    return min(c, key=lambda p: (abs(p - ref), p))
def segs(table, idx):  # chord segments for a list of song-bar indexes, one per bar: [(bar_k, beat, dur, chord)]
    return [(k, b, d, ch) for k, i in enumerate(idx) for (b, d, ch) in table[i % 8]]
def sing(key, sec, bar0, mbars, tr=0, v=92, vib=0, delay=0.0, stacc=1.0, syls=None, octave=0, dv=None):
    k = 0
    for (mb, b, d, p) in MEL:
        if mb not in mbars: continue
        dd = d * stacc if d < 1.5 else d * .96
        N(key, sec, (bar0 + mbars.index(mb)) * 4 + b + delay, dd, p + tr + octave, v + (dv(k) if dv else 0),
          syl=(syls[k % len(syls)] if syls else None), vib=vib if d >= 1 else 0)
        k += 1
def dia(p, steps):  # move p by diatonic steps in C major
    sc = [q for q in range(p - 24, p + 25) if q % 12 in (0, 2, 4, 5, 7, 9, 11)]
    i = min(range(len(sc)), key=lambda j: abs(sc[j] - p)); return sc[i + steps]

# ======================================================================= Part 1: the lesson, 100 BPM pop band
K, S_, H = 36, 38, 42
def drums(sec, bar0, nbars, kick, snare=(), hats=(), kv=None, crash_bars=(), fill_bars=(), key='kit'):
    for k in range(nbars):
        bar = bar0 + k
        for s in kick: N(key, sec, bar * 4 + s / 4, .25, K, (kv[s] if kv else (112 if s == 0 else 100)))
        for s in snare: N(key, sec, bar * 4 + s / 4, .25, S_, 104)
        for s in hats: N(key, sec, bar * 4 + s / 4, .25, H, 74 if s % 4 == 0 else 56)
        if bar in crash_bars: N(key, sec, bar * 4, 2, 49, 100)
        if bar in fill_bars:
            for s in (12, 13, 14, 15): N(key, sec, bar * 4 + s / 4, .25, (S_, S_, 45, 41)[s - 12], 92 + (s - 12) * 6)
def pop_band(sec, bar0, idx, bass=True, keys=True, gtr=True, kick=(0, 10), crash=(), fill=(), keyv=66, gv=70):
    for (k, b, d, ch) in segs(SONG, idx):
        bar = bar0 + k; r = near(ROOT[ch], 31, 43, 36)
        if bass:
            for s in kick:
                if b * 4 <= s < (b + d) * 4: N('pbass', sec, bar * 4 + s / 4, (2.3 if s == 0 else 1.4) if d == 4 else min(1.4, b + d - s / 4), r, 96)
        if keys:
            for p in VOI[ch]: N('keys', sec, bar * 4 + b, d * .98, p + 12, keyv)
            N('keys', sec, bar * 4 + b, d * .98, r + 12, keyv - 8)
        if gtr:
            for s in (2, 6, 10, 14):
                if b * 4 <= s < (b + d) * 4:
                    for j, p in enumerate(VOI[ch]): N('cgtr', sec, bar * 4 + s / 4 + j * .012, .35, p + 12, gv)
# cold open: the last line of the song by the full band, then the hardest hit, and only the kick goes on
drums('cold', 0, 3, (0, 10), (4, 12), range(0, 16, 2), crash_bars=(0, 2), fill_bars=(2,))
pop_band('cold', 0, [4, 5, 6], keyv=74, gv=78)
sing('vox', 'cold', 0, [4, 5, 6], v=98, vib=50)
N('vox', 'cold', 12, 2.8, 72, 104, vib=60)
for p in VOI['C'] + [36, 48]: N('keys', 'cold', 12, 3.6, p + 12 if p > 40 else p, 92)
for p in VOI['C']: N('cgtr', 'cold', 12, 3.6, p + 12, 92)
N('pbass', 'cold', 12, 3.4, 36, 110); N('kit', 'cold', 12, 2, 49, 122); N('kit', 'cold', 12, 2, 57, 115); N('kit', 'cold', 12, .25, K, 124)
for b in (13, 14, 15): N('kit', 'cold', b, .25, K, 96)
# pulse, BPM, bar, strong and weak
for sec, n in (('pulse', 4), ('bpm100', 2), ('bpm70', 2), ('bpm150', 2), ('bar', 2)):
    for bar in range(n):
        for s in (0, 4, 8, 12): N('kit', sec, bar * 4 + s / 4, .25, K, (112 if (s == 0 and sec == 'bar') else 98) if sec != 'bar' else (116 if s == 0 else 84))
for bar in range(2):
    for s, v in ((0, 122), (4, 58), (8, 100), (12, 58)): N('kit', 'strong', bar * 4 + s / 4, .25, K, v)
drums('backbeat', 0, 4, (0, 8), (4, 12))
for sec, n in (('bar', 2), ('strong', 2), ('backbeat', 4), ('hats', 4), ('groove', 4)):   # a quiet held chord under the drum lessons
    for p in (48, 55, 64): N('bed', sec, 0, n * 4, p, 56, jit=0)
drums('hats', 0, 4, (0, 8), (4, 12), range(0, 16, 2))
drums('groove', 0, 1, (0, 8), (4, 12), range(0, 16, 2)); drums('groove', 1, 3, (0, 10), (4, 12), range(0, 16, 2), fill_bars=(3,))
drums('bass', 0, 4, (0, 10), (4, 12), range(0, 16, 2)); pop_band('bass', 0, [0, 1, 2, 3], keys=False, gtr=False)
drums('chords', 0, 4, (0, 10), (4, 12), range(0, 16, 2)); pop_band('chords', 0, [0, 1, 2, 3], gtr=False, keyv=70)
drums('guitar', 0, 4, (0, 10), (4, 12), range(0, 16, 2), fill_bars=(3,)); pop_band('guitar', 0, [0, 1, 2, 3], keyv=62)
drums('song', 0, 8, (0, 10), (4, 12), range(0, 16, 2), crash_bars=(0, 4), fill_bars=(3, 7)); pop_band('song', 0, list(range(8)), keyv=56, gv=64)
sing('vox', 'song', 0, list(range(8)), v=94, vib=45)
# bridge: one more bar of groove, then a held G that rings into the concert hall
drums('bridge', 0, 1, (0, 10), (4, 12), range(0, 16, 2)); pop_band('bridge', 0, [2], keyv=58)
for p in VOI['G']: N('keys', 'bridge', 4, 3.8, p + 12, 66); N('cgtr', 'bridge', 4, 3.8, p + 12, 66)
N('pbass', 'bridge', 4, 3.8, 43, 90); N('kit', 'bridge', 4, 2, 49, 96); N('kit', 'bridge', 4, .25, K, 100)

# ======================================================================= classical, 76 BPM: strings, timpani on the strong beat, flute, piano, soprano
CL = [0, 1, 2, 3, 0, 1, 2, 3, 4, 5, 6, 7]       # song-bar chords per bar; the song is sung in bars 4-11
def str_voicing(ch): v = VOI[ch]; return [v[0] - 12] + v + [v[1] + 12]
for (k, b, d, ch) in segs(SONG, CL):
    vel = 58 + min(k, 8) * 4
    for p in str_voicing(ch): N('strings', 'classical', k * 4 + b, d, p, vel)
    r = near(ROOT[ch], 31, 43, 36); N('cbass', 'classical', k * 4 + b, d, r, vel + 8)
    if k >= 4 and k < 11:   # piano breaks the chord into single notes
        arp = [r + 12, VOI[ch][1], VOI[ch][2], VOI[ch][1] + 12, VOI[ch][2] + 12, VOI[ch][1] + 12, VOI[ch][2], VOI[ch][1]]
        for j in range(int(d * 2)): N('cpiano', 'classical', k * 4 + b + j * .5, .6, arp[j % 8] + 12, 62)
for k in range(11): N('timp', 'classical', k * 4, 1.5, near(ROOT[SONG[CL[k]][0][2]], 36, 45, 40), 108 if k in (0, 4, 8) else 92)
for j in range(16): N('timp', 'classical', 44 + j * .25, .3, 36, 60 + j * 3)                   # roll on the last chord
N('timp', 'classical', 48, 1, 36, 120)
sing('flute', 'classical', 2, [0, 1], octave=12, v=78, vib=40)
sing('flute', 'classical', 8, [4, 5, 6, 7], octave=12, v=72, vib=40)
sing('sop', 'classical', 4, list(range(8)), v=96, vib=80, syls=['a'])
N('sop', 'classical', 44, 4, 79, 104, vib=90, syl='a')                                      # the diva holds a high G over the end
for (k, b, d, ch) in segs(SONG, [4, 5, 6, 7]):                                               # violin: a slow line above the voice
    k += 8; pts = sorted(set(near(pc, 76, 86, 79) for pc in TONES[ch]))
    for h in range(int(d // 2)): N('violin', 'classical', k * 4 + b + h * 2, 2, pts[(k + h) % len(pts)], 70, vib=70)
for (k, b, d, ch) in segs(SONG, [7]):
    for p in str_voicing('C'): N('strings', 'classical', 44, 4, p, 104)
N('applause', 'classical', 48.3, 7, 60, 100); CC('applause', 'classical', 48.3, 55, 11, 70, 127, 8); CC('applause', 'classical', 55, 60, 11, 127, 0, 8)

# ======================================================================= jazz, 132 BPM swung
def ride(sec, bar0, n, key='jkit'):
    for bar in range(bar0, bar0 + n):
        for b, v in ((0, 84), (1, 92), (1.5, 66), (2, 84), (3, 92), (3.5, 66)): N(key, sec, bar * 4 + b, .5, 51, v)
        for b in (1, 3): N(key, sec, bar * 4 + b, .3, 44, 70)
def walk(key, sec, sg, bar0, lo=31, hi=48, v=94):
    prev = 36; out = []
    for i, (k, b, d, ch) in enumerate(sg):
        nxt = sg[i + 1][3] if i + 1 < len(sg) else ch
        r = near(ROOT[ch], lo, hi - 5, prev)
        for j in range(int(d)):
            if j == 0: p = r
            elif j == int(d) - 1:
                tgt = near(ROOT[nxt], lo, hi - 5, p); p = tgt + (1 if (k + j) % 2 else -1)
            else:
                c = [near(pc, lo, hi, p) for pc in TONES[ch][1:3]]; c = [q for q in c if q != p] or c; p = c[(k + j) % len(c)]
            N(key, sec, (bar0 + k) * 4 + b + j, .9, p, v + (6 if j == 0 else 0)); prev = p
JZ = [(bar + 6) % 8 for bar in range(20)]      # chord index per bar; the song starts at bar 10
ride('jazz', 0, 19)
walk('jbass', 'jazz', segs(JAZZ, JZ[4:19]), 4)
for (k, b, d, ch) in segs(JAZZ, JZ[6:19]):     # piano comps on the off-beats, guitar on every beat
    k += 6
    for (x, y) in (((0, .9), (1.5, .4)) if k % 2 == 0 else ((1.5, .4), (3.5, .4))):
        if b <= x < b + d:
            for p in VOI[ch]: N('jpiano', 'jazz', k * 4 + x, y, p + 12, 64)
    sh = [near(ROOT[ch], 40, 51, 45), near(TONES[ch][1], 47, 58, 52), near(TONES[ch][3] if len(TONES[ch]) > 3 else TONES[ch][2], 50, 62, 56)]
    for j in range(int(d)):
        for p in sh: N('jgtr', 'jazz', k * 4 + b + j, .45, p, 62)
def horn_chord(ch, tr=0):  # three voices: trombone low, sax middle, trumpet on top
    t = TONES[ch]
    return (near(t[1], 52, 63, 57) + tr, near(t[-1] if len(t) > 3 else t[2], 62, 72, 66) + tr, near(t[2] if len(t) > 3 else t[0], 69, 79, 73) + tr)
for (k, b, d, ch) in segs(JAZZ, JZ[8:10]):   # the horns walk in one by one, then answer together
    k += 8; lo, mid_, hi = horn_chord(ch)
    if k == 8: N('sax', 'jazz', 32, 4, mid_, 80)
    if k == 8: N('tpt', 'jazz', 34, 2, hi, 82)
    if k == 9: N('tbn', 'jazz', 36, 1.5, lo, 86); N('sax', 'jazz', 36, 1.5, mid_, 80); N('tpt', 'jazz', 36, 1.5, hi, 84)
    if k == 9:
        for x in (2.5, 3.5): N('tbn', 'jazz', 36 + x, .4, lo, 92); N('sax', 'jazz', 36 + x, .4, mid_, 90); N('tpt', 'jazz', 36 + x, .4, hi, 94)
for (k, b, d, ch) in segs(JAZZ, JZ[10:14]):  # quiet horn pads under the scat
    k += 10; lo, mid_, hi = horn_chord(ch)
    for key, p in (('tbn', lo), ('sax', mid_), ('tpt', hi)): N(key, 'jazz', k * 4 + b, d * .95, p, 52)
sing('scat', 'jazz', 10, [0, 1, 2, 3], v=96, delay=.1, stacc=.55, syls=SCAT)
for bar in range(10, 19):
    for b in (1, 3): N('jkit', 'jazz', bar * 4 + b, .3, 38, 66)
    for b in (.5, 2.5): 
        if rng.random() < .5: N('jkit', 'jazz', bar * 4 + b, .3, 38, 40)
def solo(key, sec, bar0, sg, lo, hi, rhythm, seed):
    r = np.random.default_rng(seed); notes = [p for p in range(lo, hi + 1) if p % 12 in (0, 2, 4, 5, 7, 9, 11)]
    i = len(notes) // 2; bars = sorted(set(k for (k, _, _, _) in sg))
    for kk, k in enumerate(bars):
        for (x, y) in rhythm[kk % len(rhythm)]:
            ch = [c for (kb, b, d, c) in sg if kb == k and b <= x < b + d][0]
            i = int(np.clip(i + r.choice([-2, -1, -1, 1, 1, 2]) + (1 if kk == 0 else -1) * (r.random() < .3), 0, len(notes) - 1))
            if float(x).is_integer() or y >= 1:   # land on a chord tone on the beat
                ct = [j for j, p in enumerate(notes) if p % 12 in TONES[ch]]; i = min(ct, key=lambda j: abs(j - i))
            N(key, sec, (bar0 + k) * 4 + x, y * .92, notes[i], 96 + (8 if y >= 1 else 0))
solo('sax', 'jazz', 14, segs(JAZZ, JZ[14:16]), 62, 84, [[(0, 1), (1, .5), (1.5, .5), (2, .5), (2.5, .5), (3, 1)], [(0, .5), (.5, .5), (1, .5), (1.5, .5), (2, 2)]], 5)
for (mb, b, d, p) in MEL:                     # all three horns play the last line of the song, in harmony
    if mb not in (6, 7): continue
    at = (16 + mb - 6) * 4 + b; dd = d * .9 if d < 2 else d * .95
    N('tpt', 'jazz', at, dd, p, 100); N('sax', 'jazz', at, dd, dia(p, -2), 94); N('tbn', 'jazz', at, dd, dia(p, -5) - 0, 98)
for (k, b, d, ch) in segs(JAZZ, JZ[16:18]):
    k += 16
    for p in VOI[ch]: N('jpiano', 'jazz', k * 4 + b, .5, p + 12, 70)
# ending: a turnaround, then a held C6/9 with a sax trill and the ride bell
for (x, ch) in ((0, 'Dm7'), (2, 'G7')):
    lo, mid_, hi = horn_chord(ch)
    for key, p in (('tbn', lo), ('sax', mid_), ('tpt', hi)): N(key, 'jazz', 72 + x, 1.6, p, 98)
    for p in VOI[ch]: N('jpiano', 'jazz', 72 + x, 1.6, p + 12, 74)
walk('jbass', 'jazz', [(0, 0, 2, 'Dm7'), (0, 2, 2, 'G7')], 18)
N('jbass', 'jazz', 76, 3.5, 36, 100)
for p in VOI['C69']: N('jpiano', 'jazz', 76, 3.6, p + 12, 80)
lo, mid_, hi = horn_chord('C69'); N('tbn', 'jazz', 76, 3.6, lo, 96); N('tpt', 'jazz', 76, 3.6, hi, 96)
for j in range(20): N('sax', 'jazz', 76 + j * .17, .17, 74 if j % 2 else 76, 90, jit=0)
N('jkit', 'jazz', 76, 2, 53, 100); N('jkit', 'jazz', 76, 2, 49, 90)
N('applause', 'jazz', 79, 6, 60, 80); CC('applause', 'jazz', 79, 82, 11, 90, 120, 6); CC('applause', 'jazz', 82, 86, 11, 120, 0, 6)
# run 2: finger snaps and the bass on the way to the club
for bar in range(2):
    for b in (1, 3): N('perc', 'run2', bar * 4 + b, .2, 37, 96, who='fx', part='snap')
walk('jbass', 'run2', [(0, 0, 2, 'Dm7'), (0, 2, 2, 'G7'), (1, 0, 2, 'Dm7'), (1, 2, 2, 'G7')], 0, v=84)

# ======================================================================= rock, 150 BPM
RK = list(range(8)) + list(range(8)) + [0, 1, 2, 3] + [4, 5, 6, 7]   # song chords; the song is sung at bars 8-15, the last line at 20-23
for bar in range(23):
    dense = bar >= 8
    for s in ((0, 8, 10) if dense else (0, 8)): N('rkit', 'rock', bar * 4 + s / 4, .25, 36, 118)
    for s in (4, 12): N('rkit', 'rock', bar * 4 + s / 4, .25, 38, 122)
    if 16 <= bar < 20:
        for s in range(0, 16, 2): N('rkit', 'rock', bar * 4 + s / 4, .25, 51, 96 if s % 4 == 0 else 78)
    else:
        for s in range(0, 16, 2): N('rkit', 'rock', bar * 4 + s / 4, .25, 42 if s != 14 or bar % 2 == 0 else 46, 92 if s % 4 == 0 else 70)
    if bar in (0, 2, 4, 6, 8, 12, 16, 20): N('rkit', 'rock', bar * 4, 2, 49, 112)
    if bar in (7, 15, 19):
        for s, p in zip(range(12, 16), (38, 48, 45, 41)): N('rkit', 'rock', bar * 4 + s / 4, .25, p, 110)
    if 2 <= bar < 8 or bar >= 20:
        for b in (1, 3):
            for c in range(3): N('claps', 'rock', bar * 4 + b + c * .008, .2, 39, 90, jit=.006)
for (k, b, d, ch) in segs(SONG, RK[:23]):
    r = near(ROOT[ch], 28, 40, 33)
    if k >= 4:
        for j in range(int(d * 2)): N('rbass', 'rock', k * 4 + b + j * .5, .42, r, 104 if j % 2 == 0 else 92)
    if k >= 6 and not (16 <= k < 20):
        pr = near(ROOT[ch], 40, 51, 45)
        if k >= 20:
            for p in (pr, pr + 7, pr + 12): N('rgtr', 'rock', k * 4 + b, d * .95, p, 112)
        else:
            for j in range(int(d * 2)):
                for p in (pr, pr + 7, pr + 12): N('rgtr', 'rock', k * 4 + b + j * .5, .32, p, 108 if j % 2 == 0 else 94)
    if k >= 8:
        for p in VOI[ch]: N('organ', 'rock', k * 4 + b, d * .97, p + 12, 74)
sing('rvoxA', 'rock', 8, list(range(8)), v=102, vib=20, syls=['o'])
sing('rvoxB', 'rock', 8, list(range(8)), v=100, vib=20, syls=['o'])
sing('rvoxA', 'rock', 20, [4, 5, 6, 7], v=106, syls=['o']); sing('rvoxB', 'rock', 20, [4, 5, 6, 7], v=104, syls=['o'])
sing('crowd', 'rock', 20, [4, 5, 6, 7], octave=-12, v=92)
SHOUTS = [T('rock', b) for b in (8 * 4 + 15, 8 * 4 + 31, 20 * 4 + 7)]
# guitar solo: C major pentatonic with the blue note, bends on the long notes
LICK = [[(0, 2, 'bend'), (2, .5), (2.5, .5), (3, .5), (3.5, .5)], [(x / 4, .25) for x in range(16)],
        [(0, .25), (.25, .25), (.5, .5)] * 1 + [(1, .25), (1.25, .25), (1.5, .5), (2, .25), (2.25, .25), (2.5, .5), (3, 1, 'bend')],
        [(0, 4, 'bend')]]
PENT = [p for p in range(67, 92) if p % 12 in (0, 2, 3, 4, 7, 9)]
r5 = np.random.default_rng(9); i = 6
for kk in range(4):
    bar = 16 + kk
    for ev in LICK[kk]:
        x, y = ev[0], ev[1]; bend = len(ev) > 2
        i = int(np.clip(i + (r5.choice([1, 1, 2, -1]) if kk % 2 == 0 else r5.choice([-1, -1, -2, 1])), 0, len(PENT) - 1))
        if kk == 1: i = int(np.clip(4 + (x * 4 if x < 2 else 16 - x * 4), 0, len(PENT) - 1))
        p = PENT[i]; t0 = T('rock', bar * 4 + x); t1 = T('rock', bar * 4 + x + y)
        TR['lead']['pb'].append((t0 - .003, 0))
        N('lead', 'rock', bar * 4 + x, y * .95, p, 112, jit=0)
        if bend:
            for q in range(1, 13):
                tt_ = t0 + .08 + (t1 - t0 - .1) * q / 12; base = min(1, q / 4) * 7600
                TR['lead']['pb'].append((tt_, int(base + (q > 4) * 500 * np.sin(q * 1.9))))
TR['lead']['pb'].append((T('rock', 80) - .01, 0))
# ending: the big C, then feedback
N('rkit', 'rock', 92, 3, 49, 124); N('rkit', 'rock', 92, 3, 57, 120); N('rkit', 'rock', 92, .25, 36, 124)
for j in range(8): N('rkit', 'rock', 93 + j * .25, .25, (41, 43, 45, 48)[j % 4], 80 + j * 5)
N('rkit', 'rock', 95, 2, 49, 124); N('rkit', 'rock', 95, .25, 36, 124)
for p in (36, 43, 48): N('rgtr', 'rock', 92, 6, p + 12, 118)
N('rbass', 'rock', 92, 6, 36, 112)
for p in VOI['C']: N('organ', 'rock', 92, 6, p + 12, 84)
N('rvoxA', 'rock', 92, 4, 72, 108, syl='o'); N('rvoxB', 'rock', 92, 4, 72, 104, syl='o')
N('fdbk', 'rock', 93, 8, 79, 96); CC('fdbk', 'rock', 93, 101, 11, 60, 0, 10)
N('applause', 'rock', 93, 9, 60, 110); CC('applause', 'rock', 93, 96, 11, 80, 127, 6); CC('applause', 'rock', 96, 102, 11, 127, 0, 8)
# run 3: blackout, feedback, toms and the crowd
N('fdbk', 'run3', 0, 8, 79, 104); CC('fdbk', 'run3', 0, 8, 11, 40, 127, 12)
for q in range(40): TR['fdbk']['pb'].append((T('run3', q / 5), int(300 * np.sin(q * 1.3) * q / 40)))
TR['fdbk']['pb'].append((T('run3', 8) - .01, 0))
for j in range(8): N('rkit', 'run3', 4 + j * .5, .25, 41, 80 + j * 4)
for j in range(8): N('rkit', 'run3', 6 + j * .25, .25, 38, 84 + j * 5)
N('applause', 'run3', 0, 8, 60, 100); CC('applause', 'run3', 0, 8, 11, 30, 110, 10)

# ======================================================================= run 4 and the finale, 112 BPM: everything mixed
for (b, ch) in ((0, 'F'), (4, 'G')):
    for p in VOI[ch]: N('pad', 'run4', b, 4, p + 12, 70)
    arp = [VOI[ch][0] + 12, VOI[ch][1] + 12, VOI[ch][2] + 12, VOI[ch][1] + 24]
    for j in range(8): N('cgtr', 'run4', b + j * .5, .6, arp[j % 4], 58)
for j in range(7): N('birds', 'run4', float(r5.uniform(0, 7.5)), .3, int(r5.integers(76, 90)), 70)
FN = [0, 1, 2, 3] + list(range(8)) + list(range(8))
TRN = [0] * 12 + [2] * 8
for (k, b, d, ch) in segs(SONG, FN):
    tr = TRN[k]; r = near(ROOT[ch], 31, 43, 36) + tr
    for p in str_voicing(ch): N('fstr', 'finale', k * 4 + b, d, p + tr + (12 if k >= 12 else 0) * (p > 50), 64 + (k >= 12) * 16)
    if k >= 2:
        for (x, y) in ((0, .75), (1.5, .5), (2, .75), (3.5, .5)):
            if b <= x < b + d: N('fbass', 'finale', k * 4 + x, y, r + (7 if x == 2 and d == 4 else 0), 98)
        for x in (0, 1.5, 2.5):
            if b <= x < b + d:
                for p in VOI[ch]: N('fpiano', 'finale', k * 4 + x, .6, p + 12 + tr, 60)
        lo, mid_, hi = horn_chord(ch, tr)
        if k < 4 or 12 <= k < 16:
            for key, p in (('tbn', lo), ('sax', mid_), ('tpt', hi)): N(key, 'finale', k * 4 + b, d * .95, p, 66)
        elif k < 12:
            for x in (1.5, 3.5):
                if b <= x < b + d:
                    for key, p in (('tbn', lo), ('sax', mid_), ('tpt', hi)): N(key, 'finale', k * 4 + x, .4, p, 88)
for bar in range(2, 20):
    hard = bar >= 12
    for s in (0, 6, 8): N('fkit', 'finale', bar * 4 + s / 4, .25, 36, 112)
    for s in (4, 12): N('fkit', 'finale', bar * 4 + s / 4, .25, 38, 112)
    for s in range(0, 16, 2): N('fkit', 'finale', bar * 4 + s / 4, .25, 46 if (hard and s % 4 == 2) else 42, 80 if s % 4 == 0 else 62)
    if bar in (2, 4, 8, 12, 16): N('fkit', 'finale', bar * 4, 2, 49, 110)
    if bar in (3, 11, 15, 18):
        for s, p in zip(range(12, 16), (38, 48, 45, 41)): N('fkit', 'finale', bar * 4 + s / 4, .25, p, 106)
sing('fvox', 'finale', 4, list(range(8)), v=96, vib=45, syls=['la'])
sing('fvox', 'finale', 12, list(range(8)), tr=2, v=100, vib=50, syls=['la'])
sing('fvox2', 'finale', 12, list(range(8)), tr=2, v=80)
sing('tpt', 'finale', 16, [4, 5, 6, 7], tr=2, v=96)
sing('flute', 'finale', 12, list(range(8)), tr=2, octave=12, v=70, vib=40)
for (k, b, d, ch) in segs(SONG, [0, 1, 2, 3, 4, 5, 6, 7]):    # 炸毛 picks the violin this time
    k += 12; pts = sorted(set(near(pc + 2, 74, 88, 81) for pc in TONES[ch]))
    for h in range(int(d // 2)): N('violin', 'finale', k * 4 + b + h * 2, 2, pts[(k + h) % len(pts)], 76, vib=70)
for p in (50, 57, 62, 66, 69): N('brass', 'finale', 76, 4, p, 96)
N('fkit', 'finale', 79.5, .25, 49, 100)
# outro: back to one 咚, then the melody hummed once over a D chord
N('kit', 'outro', 0, .25, K, 116); N('kit', 'outro', 4, .25, K, 108)
for p in (38, 50, 57, 64, 66, 69): N('keys', 'outro', 8, 8, p, 60)
sing('vox', 'outro', 2, [0], tr=2, v=80, vib=40, syls=['mm'])
N('vox', 'outro', 12, 4, 74, 74, vib=40, syl='mm')

# ======================================================================= subtitles (section, from bar, to bar, text)
SUBS = [('cold', 0, 3, '这首歌，是从一声「咚」开始的'),
        ('pulse', 0, 2, '先听这一声：咚'), ('pulse', 2, 4, '一下一下，像心跳，这叫节拍'),
        ('bpm100', 0, 2, '一分钟 100 下，叫 100 BPM'), ('bpm70', 0, 2, '70：像散步'), ('bpm150', 0, 2, '150：像奔跑'),
        ('bar', 0, 2, '回到 100。四下一组，叫一小节'), ('strong', 0, 2, '强 · 弱 · 次强 · 弱'),
        ('backbeat', 0, 2, '第 2、4 拍，加一声「哒」'), ('backbeat', 2, 4, '咚 · 哒 · 咚 · 哒，这叫反拍'),
        ('hats', 0, 2, '镲：把每一拍切成两半'), ('hats', 2, 4, '节奏一下子「走」起来了'),
        ('groove', 0, 2, '底鼓挪一格'), ('groove', 2, 4, '这就是「律动」'),
        ('bass', 0, 2, '贝斯：给节奏加上高低'), ('bass', 2, 4, '它跟着底鼓走'),
        ('chords', 0, 2, '和弦：三个音一起按'), ('chords', 2, 4, '每小节换一个：C、Am、F、G'),
        ('guitar', 0, 2, '吉他：把和弦切成节奏'), ('guitar', 2, 4, '专挑「拍子中间」扫'),
        ('song', 0, 2, '最后，主唱唱出旋律'), ('song', 2, 4, '旋律，就是你会哼的那条线'), ('song', 4, 6, '五个人，五条线'), ('song', 6, 8, '合在一起，就是一首歌'),
        ('bridge', 0, 2, '今晚三场演出：同一首歌，换三身衣服'),
        ('classical', 0, 2, '古典：BPM 76，慢下来'), ('classical', 2, 4, '没有架子鼓，定音鼓只敲强拍'),
        ('classical', 4, 6, '乐器：弦乐、长笛、钢琴'), ('classical', 6, 8, '唱法：美声，长音带颤音'),
        ('classical', 8, 10, '吉他手炸毛，被迫拉小提琴'), ('classical', 10, 12, '第一场，过了'),
        ('run2', 0, 2, '第二场：爵士酒吧'),
        ('jazz', 0, 2, '爵士：BPM 132'), ('jazz', 2, 4, '前长后短：这叫「摇摆」'),
        ('jazz', 4, 6, '贝斯每拍一个音，像在走路'), ('jazz', 6, 8, '和弦多加一个音，味道就「爵士」了'),
        ('jazz', 8, 10, '三位客人：萨克斯、小号、长号'), ('jazz', 10, 12, '唱法：不唱词，唱「嘟巴」'), ('jazz', 12, 14, '旋律还是那条线'),
        ('jazz', 14, 16, '即兴：每次吹都不一样'), ('jazz', 16, 18, '三把铜管，一起收'), ('jazz', 18, 20, '第二场，过了'),
        ('run3', 0, 2, '第三场：体育馆'),
        ('rock', 0, 2, '摇滚：BPM 150'), ('rock', 2, 4, '军鼓砸在 2、4 拍，全场跟着拍'),
        ('rock', 4, 6, '贝斯每拍两下，一直往前冲'), ('rock', 6, 8, '吉他：两个音的强力和弦，加失真'),
        ('rock', 8, 10, '唱法：大声，带点沙哑'), ('rock', 10, 12, '同一首《晚风》，更快更响'),
        ('rock', 12, 14, '底鼓 1、3，军鼓 2、4，镲每拍两下'), ('rock', 14, 16, '这就是最经典的摇滚鼓点'),
        ('rock', 16, 20, '炸毛等了一整晚，就为这四小节'), ('rock', 20, 22, '全场一起唱最后一句'), ('rock', 22, 24, '第三场，过了'),
        ('run4', 0, 2, '凌晨五点，衣服全穿乱了'),
        ('finale', 0, 2, '那就混在一起'), ('finale', 2, 4, '古典的弦乐，摇滚的鼓，爵士的铜管'),
        ('finale', 4, 6, '同一首歌，变的只有四样'), ('finale', 6, 8, '速度：BPM'), ('finale', 8, 10, '鼓敲在哪几格'), ('finale', 10, 12, '谁来演奏，怎么唱'),
        ('finale', 12, 14, '这四样，就是音乐的基础'), ('finale', 14, 16, '换掉它们，就换了风格'), ('finale', 16, 18, '旋律不变，风格随你换'),
        ('outro', 0, 2, '一切，都从这一声「咚」开始'), ('outro', 2, 4, '下一集：为什么爵士要「摇摆」')]

# ======================================================================= render each track with FluidSynth
TPS = 960
def write_mid(key, tr, path):
    mid = mido.MidiFile(ticks_per_beat=480); trk = mido.MidiTrack(); mid.tracks.append(trk)
    trk.append(mido.MetaMessage('set_tempo', tempo=500000, time=0))
    ch = 9 if tr['drum'] else 0
    ev = [(0, 0, mido.Message('program_change', channel=ch, program=tr['prog']))]
    ev.append((0, 0, mido.Message('control_change', channel=ch, control=11, value=127)))
    by = {}
    for n in tr['notes']: by.setdefault(n[2], []).append(n)
    for p, L in by.items():
        L.sort()
        for j, (t0, t1, _, v) in enumerate(L):
            if j + 1 < len(L) and t1 > L[j + 1][0] - .004: t1 = max(t0 + .02, L[j + 1][0] - .004)
            ev.append((round(t0 * TPS), 2, mido.Message('note_on', channel=ch, note=p, velocity=v)))
            ev.append((round(t1 * TPS), 1, mido.Message('note_off', channel=ch, note=p, velocity=0)))
    for (t0, c, v) in tr['cc']: ev.append((round(t0 * TPS), 0, mido.Message('control_change', channel=ch, control=c, value=int(np.clip(v, 0, 127)))))
    for (t0, v) in tr['pb']: ev.append((round(max(0, t0) * TPS), 0, mido.Message('pitchwheel', channel=ch, pitch=int(np.clip(v, -8192, 8191)))))
    ev.sort(key=lambda e: (e[0], e[1])); last = 0
    for (tk, _, m) in ev: m.time = tk - last; last = tk; trk.append(m)
    trk.append(mido.MetaMessage('end_of_track', time=round((END + 8) * TPS) - last))
    mid.save(path)
NS = int((END + 8) * SR)
TMP = tempfile.mkdtemp(prefix='stems_', dir=OUT)
def render(key):
    tr = TR[key]
    if not tr['notes']: return key, None
    mp, wp = f'{TMP}/{key}.mid', f'{TMP}/{key}.wav'
    write_mid(key, tr, mp)
    subprocess.run(['fluidsynth', '-ni', '-R', '0', '-C', '0', '-g', '0.6', '-r', str(SR), '-O', 'float', '-T', 'wav', '-F', wp, SF2, mp],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return key, wp
with ThreadPoolExecutor(4) as ex: paths = dict(ex.map(render, list(TR)))

# ======================================================================= the gang shout ("hey!"), made here
def voice(f0, d=.3):
    x = np.arange(int(d * SR)) / SR; f = f0 * (1 + .01 * np.sin(2 * np.pi * 5 * x))
    ph = np.cumsum(f) / SR; src = (2 * (ph % 1) - 1) + .25 * rng.standard_normal(len(x))
    def bp(sig, lo, hi): return sosfilt(butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), sig)
    y = bp(src, 470, 600) + .7 * bp(src, 1650, 2000) + .35 * bp(src, 2300, 2700)
    n = int(.05 * SR); h = .6 * bp(rng.standard_normal(n), 1000, 4000)
    env = np.minimum(1, x / .02) * np.exp(-np.maximum(0, x - d * .5) / .05)
    return np.concatenate([h * np.linspace(.2, 1, n), y * env])
shout = np.zeros(NS, np.float32)
for t0 in SHOUTS:
    for f0 in (175, 196, 220, 233, 262, 294):
        s = voice(f0 * (1 + rng.uniform(-.02, .02))); i = int((t0 - .05 + rng.uniform(-.015, .015)) * SR); shout[i:i + len(s)] += s[:NS - i]

# ======================================================================= mix
def env_for(world_amt):   # a send level per section, eased across section changes
    pts = np.array([[S['t0'], world_amt.get(S['world'], .2)] for S in SEC] + [[END + 8, .2]])
    tt = np.arange(0, NS, 480) / SR
    e = np.interp(tt, pts[:, 0], pts[:, 1]); e = np.convolve(e, np.ones(30) / 30, 'same')
    return np.repeat(e, 480)[:NS].astype(np.float32)
ROOM = env_for(dict(room=.5, arena=.35, club=.8, street=.6, dark=.4, stairs=.5, roof=.4, hall=.15))
HALL = env_for(dict(room=.15, arena=.55, club=.25, street=.3, dark=.6, stairs=.4, roof=.5, hall=1.0))
def ir(rt, pre=.012, lp=7000):
    n = int(rt * 1.2 * SR); x = np.arange(n) / SR
    out = []
    for c in range(2):
        s = rng.standard_normal(n) * np.exp(-6.9 * x / rt)
        s = sosfilt(butter(2, lp / (SR / 2), output='sos'), s); s[:int(pre * SR)] = 0; out.append(s / np.sqrt(np.sum(s ** 2)))
    return out
dry = np.zeros((NS, 2), np.float32); sendR = np.zeros((NS, 2), np.float32); sendH = np.zeros((NS, 2), np.float32)
def level(x):
    w = 2400; m = len(x) // w * w; p = (x[:m] ** 2).reshape(-1, w).mean(1)
    act = p[p > p.max() * 1e-4]; return 10 * np.log10(act.mean() + 1e-12)
stems = {}
for key, wp in paths.items():
    if wp is None: continue
    sr, a = wavfile.read(wp); a = a.astype(np.float32)
    if a.ndim == 1: a = np.stack([a, a], 1)
    x = np.zeros((NS, 2), np.float32); n = min(NS, len(a)); x[:n] = a[:n]; os.remove(wp)
    tr = TR[key]
    if tr['drive']: x = np.tanh(x * 10 ** (tr['drive'] * 6 / 20) * 3) / 3
    x *= 10 ** ((tr['lvl'] - level(x.mean(1))) / 20)
    pan = tr['pan']; x[:, 0] *= np.sqrt((1 - pan) / 2) * 1.414; x[:, 1] *= np.sqrt((1 + pan) / 2) * 1.414
    dry += x; sendR += x * (tr['room'] * ROOM)[:, None]; sendH += x * (tr['hall'] * HALL)[:, None]
    stems[key] = level(x.mean(1))
s2 = np.stack([shout, shout], 1); s2 *= 10 ** ((-20 - level(shout)) / 20); dry += s2; sendH += s2 * .5 * HALL[:, None]
irR, irH = ir(.7), ir(2.6, .025, 6000)
wet = np.zeros_like(dry)
for c in range(2):
    wet[:, c] += fftconvolve(sendR[:, c], irR[c])[:NS] * .9 + fftconvolve(sendH[:, c], irH[c])[:NS] * .9
mix = dry + wet
mix = sosfilt(butter(2, 35 / (SR / 2), 'high', output='sos'), mix, axis=0)
# gentle bus compression
e = np.sqrt(np.convolve((mix ** 2).mean(1), np.ones(2400) / 2400, 'same')) + 1e-9
db = 20 * np.log10(e); gr = np.minimum(0, (-16 - db) * (1 - 1 / 2.5)); gr = np.convolve(gr, np.ones(4800) / 4800, 'same')
mix *= (10 ** (gr / 20))[:, None]
mix /= np.max(np.abs(mix)) / .9
wavfile.write(f'{OUT}/mix.wav', SR, (mix * 32767).astype(np.int16))
import shutil; shutil.rmtree(TMP)

# ======================================================================= the score for the picture
EV.sort(key=lambda e: e[0])
json.dump(dict(end=round(END, 4), sections=[dict(name=S['name'], bpm=S['bpm'], bars=S['bars'], world=S['world'], swing=S['swing'],
               t0=round(S['t0'], 4), t1=round(S['t1'], 4), beats=[round(T(S['name'], b) if not S['swing'] else S['t0'] + float(S['cum'][b * RES]), 4) for b in range(S['bars'] * 4 + 1)])
               for S in SEC],
               subs=[[round(T(s, a * 4), 4), round(T(s, b * 4), 4), txt] for (s, a, b, txt) in SUBS],
               shouts=[round(x, 4) for x in SHOUTS], ev=EV), open(f'{OUT}/score.json', 'w'), ensure_ascii=False)
print('end %.2f s, %d notes' % (END, len(EV)))
print(' '.join(f'{k}:{v:.0f}' for k, v in stems.items()))
