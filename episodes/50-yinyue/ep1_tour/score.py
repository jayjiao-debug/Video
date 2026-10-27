#!/usr/bin/env python3
"""节奏环游世界 · 第1站 维也纳 (3/4 waltz), test chapter. One file makes the music and the timing the picture follows.
python3 score.py <outdir> [soundfont.sf2]  ->  <outdir>/score.json and <outdir>/mix.wav"""
import json, os, sys, subprocess, tempfile, shutil, numpy as np, mido
from concurrent.futures import ThreadPoolExecutor
from scipy.io import wavfile
from scipy.signal import fftconvolve, butter, sosfilt

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
SF2 = sys.argv[2] if len(sys.argv) > 2 else '/usr/share/sounds/sf2/FluidR3_GM.sf2'
os.makedirs(OUT, exist_ok=True)
SR = 48000
rng = np.random.default_rng(7)

# ======================================================================= sections: name, bpm, beats per bar, bars, world
SECS = [('cold', 156, 3, 4, 'ball'), ('pull', 156, 3, 2, 'ball'),
        ('four', 156, 4, 3, 'paper'), ('three', 156, 3, 4, 'paper'), ('strong', 156, 3, 4, 'paper'), ('oompah', 156, 3, 4, 'paper'),
        ('fly', 156, 3, 4, 'paper'), ('ball', 156, 3, 12, 'ball'), ('end', 156, 3, 5, 'ball')]
RES = 96
def bpm_at(name, bpm, b, m):
    if name == 'end' and b > 2 * m: return bpm * (1 - .38 * min(1, (b - 2 * m) / (2.5 * m)) ** 1.3)   # slow down into the last chord
    return bpm
SEC, t = [], 0.0
for (name, bpm, m, bars, world) in SECS:
    n = (bars + 2) * m * RES; bb = np.arange(n) / RES
    cum = np.concatenate([[0], np.cumsum(60 / np.array([bpm_at(name, bpm, b, m) for b in bb]) / RES)])
    S = dict(name=name, bpm=bpm, meter=m, bars=bars, world=world, t0=t, cum=cum); S['t1'] = t + cum[bars * m * RES]
    SEC.append(S); t = S['t1']
END = t
SI = {S['name']: i for i, S in enumerate(SEC)}
def T(sec, b):
    S = SEC[SI[sec]]; x = b * RES; i = int(np.clip(np.floor(x), 0, len(S['cum']) - 2)); f = x - i
    return S['t0'] + S['cum'][i] + f * (S['cum'][i + 1] - S['cum'][i])

# ======================================================================= tracks
TR = {}
def track(key, prog, row, lvl, pan=0.0, hall=.3, drum=False, bank=0):
    TR[key] = dict(prog=prog, row=row, lvl=lvl, pan=pan, hall=hall, drum=drum, bank=bank, notes=[], cc=[])
track('kit', 0, 'beat', -14, 0, .15, drum=True)
track('oom', 32, 'oom', -19, -.1, .25)       # plucked bass: 嘭
track('tuba', 58, 'oom', -27, -.1, .35)
track('pah', 45, 'pah', -22, .25, .35)       # pizzicato strings: 恰
track('horn', 60, 'pah', -29, .3, .5)
track('mel', 48, 'mel', -19, -.15, .5)       # string section melody
track('vln', 40, 'mel', -25, -.2, .45)
track('flute', 73, 'mel', -29, .2, .5)
track('harp', 46, 'harp', -25, .35, .5)
track('timp', 47, 'timp', -24, 0, .5)
track('pad', 49, 'pad', -29, 0, .5)
track('fx', 0, 'fx', -26, 0, .6, drum=True)
EV = []
def N(key, sec, b, d, p, v=90, row=None, part=None, jit=.004, early=0.0):
    tr = TR[key]; t0 = T(sec, b - early); t1 = T(sec, b + d)
    if jit: t0 += float(np.clip(rng.normal(0, jit), -2.5 * jit, 2.5 * jit))
    t0 = max(0.0, t0); t1 = max(t0 + .05, t1 - .01)
    v = int(np.clip(v + rng.integers(-3, 4), 1, 127))
    tr['notes'].append((t0, t1, int(p), v))
    EV.append([round(t0, 4), round(t1 - t0, 4), row or tr['row'], part or key, int(p), v])
def mark(row, sec, b, d, v, part):   # an event for the picture only (dance steps, conductor beats)
    EV.append([round(T(sec, b), 4), round(T(sec, b + d) - T(sec, b), 4), row, part, 0, v])

# ======================================================================= harmony and the tune (D major, original)
CH = {'D': [50, 54, 57, 62], 'A7': [45, 55, 57, 61], 'D7': [50, 54, 60, 62], 'G': [43, 55, 59, 62], 'DA': [45, 54, 57, 62]}
PROG = ['D', 'D', 'A7', 'A7', 'A7', 'A7', 'D', 'D', 'D', 'D7', 'G', 'G', 'DA', 'A7', 'D', 'D']
MEL = [[(0, 1, 66), (1, 1, 69), (2, 1, 74)], [(0, 2, 78), (2, 1, 76)], [(0, 1, 76), (1, 1, 73), (2, 1, 69)], [(0, 2, 79), (2, 1, 78)],
       [(0, 1, 76), (1, 1, 79), (2, 1, 76)], [(0, 2, 73), (2, 1, 69)], [(0, 1, 74), (1, 1, 78), (2, 1, 81)], [(0, 3, 74)],
       [(0, 1, 78), (1, 1, 76), (2, 1, 74)], [(0, 2, 72), (2, 1, 69)], [(0, 1, 71), (1, 1, 74), (2, 1, 79)], [(0, 2, 79), (2, 1, 76)],
       [(0, 1, 78), (1, 1, 81), (2, 1, 78)], [(0, 1, 76), (1, 1, 79), (2, 1, 73)], [(0, 2, 74), (2, 1, 69)], [(0, 3, 74)]]
def oompah(sec, bar0, nbars, k0, full=True, lilt=0.0, v=1.0):
    for j in range(nbars):
        ch = CH[PROG[(k0 + j) % 16]]; b = (bar0 + j) * 3
        N('oom', sec, b, .9, ch[0] - 12 if ch[0] > 47 else ch[0], int(100 * v))
        if full: N('tuba', sec, b, .8, ch[0] - 12 if ch[0] > 47 else ch[0], int(84 * v))
        for k in (1, 2):
            for p in ch[1:]: N('pah', sec, b + k, .45, p, int(78 * v), early=lilt if k == 1 else 0)
            if full:
                for p in ch[1:3]: N('horn', sec, b + k, .5, p + 12, int(58 * v), early=lilt if k == 1 else 0)
        mark('step', sec, b, 1, 120, 'big'); mark('step', sec, b + 1, 1, 60, 'small'); mark('step', sec, b + 2, 1, 60, 'small')
def tune(sec, bar0, k0, nbars, flute=True, v=92):
    for j in range(nbars):
        for (o, d, p) in MEL[(k0 + j) % 16]:
            N('mel', sec, (bar0 + j) * 3 + o, d, p, v); N('vln', sec, (bar0 + j) * 3 + o, d, p + 12, v - 14, row='mel2')
            if flute: N('flute', sec, (bar0 + j) * 3 + o, d, p + 12, v - 18, row='mel2')
def gliss(sec, b, up=True, n=14, span=1.0, lo=62):
    sc = [0, 2, 4, 5, 7, 9, 11]
    ps = [lo + 12 * (i // 7) + sc[i % 7] for i in range(n)]
    for i, p in enumerate(ps if up else ps[::-1]): N('harp', sec, b + span * i / n, 1.5, p, 70 + i, jit=0)

# ---- cold open: the ballroom, full orchestra
N('timp', 'cold', 0, 1, 38, 110); N('fx', 'cold', 0, 2, 81, 90, part='tri'); gliss('cold', 0, n=10, span=.6)
oompah('cold', 0, 4, 0); tune('cold', 0, 0, 4)
# ---- pull back into a postcard: the tune bows out, oom-pah-pah stays
oompah('pull', 0, 2, 4, full=False); tune('pull', 0, 4, 1, flute=False, v=80)
N('pad', 'pull', 3, 9, 50, 60); N('pad', 'pull', 3, 9, 57, 56); N('pad', 'pull', 3, 9, 62, 52)
# ---- the lesson, on paper
for b in range(12): N('kit', 'four', b, .5, 36 if b % 4 == 0 else 37, 112 if b % 4 == 0 else 62)
for b in range(12): N('kit', 'three', b, .5, 36 if b % 3 == 0 else 37, 112 if b % 3 == 0 else 62)
for b in range(12): N('kit', 'strong', b, .5, 36 if b % 3 == 0 else 37, 124 if b % 3 == 0 else 40)
N('pad', 'four', 0, 12, 50, 58); N('pad', 'four', 0, 12, 57, 52)
N('pad', 'three', 0, 12, 50, 58); N('pad', 'three', 0, 12, 57, 52); N('pad', 'strong', 0, 12, 50, 58); N('pad', 'strong', 0, 12, 57, 52)
oompah('oompah', 0, 4, 0, full=False)
# ---- the flight to Vienna: the stamp lands on bar 3, the harp lifts us into the postcard
oompah('fly', 0, 4, 0, full=False, v=.9); N('pad', 'fly', 0, 12, 50, 50); N('pad', 'fly', 0, 12, 62, 46)
N('timp', 'fly', 6, 1, 38, 118); N('fx', 'fly', 6, 2, 57, 70, part='crash'); N('fx', 'fly', 6, .5, 36, 110, part='stamp')
gliss('fly', 9, n=18, span=3, lo=55)
# ---- the ballroom
N('timp', 'ball', 0, 1, 38, 120); N('fx', 'ball', 0, 3, 57, 84, part='crash'); N('fx', 'ball', 0, 2, 81, 90, part='tri')
oompah('ball', 0, 8, 0); tune('ball', 0, 0, 8)
oompah('ball', 8, 4, 8, lilt=.16); tune('ball', 8, 8, 4)          # Vienna's secret: beat 2 comes a little early
for j in (0, 4, 8): N('timp', 'ball', j * 3, 1, 38, 96)
gliss('ball', 33, n=12, span=2.5, lo=62)
# ---- the end: last line, the stamp, the last chord
oompah('end', 0, 3, 12, lilt=.12); tune('end', 0, 12, 3)
N('mel', 'end', 9, 4.5, 74, 96); N('vln', 'end', 9, 4.5, 86, 80, row='mel2'); N('flute', 'end', 9, 4.5, 86, 70, row='mel2')
for p in (38, 50): N('oom', 'end', 9, 4, p, 104)
for p in (54, 57, 62, 66): N('pah', 'end', 9, .6, p, 92); N('horn', 'end', 9, 4.4, p + 12, 66)
N('timp', 'end', 9, 1, 38, 124); N('fx', 'end', 9, 4, 57, 96, part='crash'); N('fx', 'end', 9, .5, 36, 116, part='stamp'); gliss('end', 9.5, n=16, span=2, lo=62)
# conductor marks: one per beat in the ballroom, with the beat number
for s in ('cold', 'ball', 'end'):
    S = SEC[SI[s]]
    for b in range(S['bars'] * 3): mark('cond', s, b, 1, 120 if b % 3 == 0 else 70, str(b % 3 + 1))

# ======================================================================= subtitles: (section, bar0, bar1, text)
SUBS = [('cold', 0, 4, '为什么这段音乐，一听就想转圈？'), ('pull', 0, 2, '先来数数它的拍子'),
        ('four', 0, 3, '平时的歌，四下一组：1 2 3 4'), ('three', 0, 4, '华尔兹：三下一组，1 2 3'),
        ('strong', 0, 4, '第一下最重：强 · 弱 · 弱'), ('oompah', 0, 4, '低音「嘭」，弦乐「恰、恰」'),
        ('fly', 0, 2, '这个节奏，来自哪里？'), ('fly', 2, 4, '第1站：维也纳'),
        ('ball', 0, 4, '维也纳 · 华尔兹 · 3/4'), ('ball', 4, 8, '舞步也是三下：一大步，两小步'),
        ('ball', 8, 12, '小秘密：维也纳人的第2拍，会早一点'), ('end', 0, 3, '强 · 弱 · 弱，就会想转圈'), ('end', 3, 5, '下一站：金斯顿')]
subs = [[round(T(s, a * SEC[SI[s]]['meter']), 4), round(T(s, b * SEC[SI[s]]['meter']), 4), x] for (s, a, b, x) in SUBS]
subs[-1][1] = round(END + .6, 4)

# ======================================================================= render each track with FluidSynth
TPS = 960
def write_mid(tr, path):
    mid = mido.MidiFile(ticks_per_beat=480); trk = mido.MidiTrack(); mid.tracks.append(trk)
    trk.append(mido.MetaMessage('set_tempo', tempo=500000, time=0))
    ch = 9 if tr['drum'] else 0
    ev = [(0, 0, mido.Message('program_change', channel=ch, program=tr['prog'])), (0, 0, mido.Message('control_change', channel=ch, control=11, value=127))]
    by = {}
    for n in tr['notes']: by.setdefault(n[2], []).append(n)
    for p, L in by.items():
        L.sort()
        for j, (t0, t1, _, v) in enumerate(L):
            if j + 1 < len(L) and t1 > L[j + 1][0] - .004: t1 = max(t0 + .02, L[j + 1][0] - .004)
            ev.append((round(t0 * TPS), 2, mido.Message('note_on', channel=ch, note=p, velocity=v)))
            ev.append((round(t1 * TPS), 1, mido.Message('note_off', channel=ch, note=p, velocity=0)))
    ev.sort(key=lambda e: (e[0], e[1])); last = 0
    for (tk, _, m) in ev: m.time = tk - last; last = tk; trk.append(m)
    trk.append(mido.MetaMessage('end_of_track', time=round((END + 5) * TPS) - last)); mid.save(path)
NS = int((END + 5) * SR)
TMP = tempfile.mkdtemp(prefix='stems_', dir=OUT)
def render(key):
    tr = TR[key]
    if not tr['notes']: return key, None
    mp, wp = f'{TMP}/{key}.mid', f'{TMP}/{key}.wav'; write_mid(tr, mp)
    subprocess.run(['fluidsynth', '-ni', '-R', '0', '-C', '0', '-g', '0.6', '-r', str(SR), '-O', 'float', '-T', 'wav', '-F', wp, SF2, mp],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return key, wp
with ThreadPoolExecutor(4) as ex: paths = dict(ex.map(render, list(TR)))

# ======================================================================= mix: dry paper, big hall in the ballroom
def level(x):
    w = 2400; m = len(x) // w * w; p = (x[:m] ** 2).reshape(-1, w).mean(1); act = p[p > p.max() * 1e-4]; return 10 * np.log10(act.mean() + 1e-12)
pts = np.array([[S['t0'], 1.0 if S['world'] == 'ball' else .3] for S in SEC] + [[END + 5, 1.0]])
tt = np.arange(0, NS, 480) / SR; e = np.interp(tt, pts[:, 0], pts[:, 1], left=1.0); e = np.convolve(e, np.ones(40) / 40, 'same')
HALL = np.repeat(e, 480)[:NS].astype(np.float32)
def ir(rt, pre=.02, lp=6500):
    n = int(rt * 1.2 * SR); x = np.arange(n) / SR; out = []
    for c in range(2):
        s = rng.standard_normal(n) * np.exp(-6.9 * x / rt); s = sosfilt(butter(2, lp / (SR / 2), output='sos'), s); s[:int(pre * SR)] = 0
        out.append(s / np.sqrt(np.sum(s ** 2)))
    return out
dry = np.zeros((NS, 2), np.float32); send = np.zeros((NS, 2), np.float32)
for key, wp in paths.items():
    if wp is None: continue
    sr, a = wavfile.read(wp); a = a.astype(np.float32)
    if a.ndim == 1: a = np.stack([a, a], 1)
    x = np.zeros((NS, 2), np.float32); n = min(NS, len(a)); x[:n] = a[:n]
    tr = TR[key]; x *= 10 ** ((tr['lvl'] - level(x.mean(1))) / 20)
    pan = tr['pan']; x[:, 0] *= np.sqrt((1 - pan) / 2) * 1.414; x[:, 1] *= np.sqrt((1 + pan) / 2) * 1.414
    dry += x; send += x * (tr['hall'] * HALL)[:, None]
irH = ir(2.3); wet = np.zeros_like(dry)
for c in range(2): wet[:, c] = fftconvolve(send[:, c], irH[c])[:NS] * 1.1
mix = sosfilt(butter(2, 35 / (SR / 2), 'high', output='sos'), dry + wet, axis=0)
env = np.sqrt(np.convolve((mix ** 2).mean(1), np.ones(2400) / 2400, 'same')) + 1e-9
gr = np.minimum(0, (-17 - 20 * np.log10(env)) * (1 - 1 / 2.2)); gr = np.convolve(gr, np.ones(4800) / 4800, 'same'); mix *= (10 ** (gr / 20))[:, None]
mix /= np.max(np.abs(mix)) / .9
cut = int((END + 3.5) * SR); mix = mix[:cut]; mix[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))[:, None]
wavfile.write(f'{OUT}/mix.wav', SR, (mix * 32767).astype(np.int16)); shutil.rmtree(TMP)

# ======================================================================= the score for the picture
secs = []
for S in SEC:
    nb = S['bars'] * S['meter']
    secs.append(dict(name=S['name'], bpm=S['bpm'], meter=S['meter'], bars=S['bars'], world=S['world'], t0=round(S['t0'], 4), t1=round(S['t1'], 4),
                     beats=[round(T(S['name'], b), 4) for b in range(nb + S['meter'] + 1)]))
EV.sort(key=lambda e: e[0])
json.dump(dict(end=round(END + 3.5, 4), sections=secs, subs=subs, ev=EV), open(f'{OUT}/score.json', 'w'), ensure_ascii=False)
print('end', round(END, 2), 'events', len(EV), {S['name']: round(S['t0'], 2) for S in SEC})
