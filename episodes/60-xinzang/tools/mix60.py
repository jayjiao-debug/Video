#!/usr/bin/env python3
"""ep60 《死后称心脏》 film mix: cues + stings + SFX on the fixed clock, mastered.

    python3 mix60.py [--plan episodes/60-xinzang/mix60_plan.md] [--out $S/snd60/mix60.wav] [--no-mp3]

Reads the placement table (mix60_plan.md: one row per cue segment / sting / SFX / ambience / synth) and the builders' sync
tables (episodes/60-xinzang/sync60_*.md, if present): a row whose `sync` key matches a builder's sound event takes that event's
film second. Music rows are placed as written (cue gains on the -14 LUFS files, equal-power fades, loops wrap, tape-stop, gain
ramps). SFX are levelled against the music actually under them: peak = local momentary loudness (400 ms) + 2 dB + row gain,
capped 1 dB under the local music peak unless `impact` (owner ep14 v10: "+1...+4 dB peak, never above the music"); ambiences sit
8 LU under the local music. Master: -14 LUFS integrated, true peak <= -1.5 dBTP (4x oversampled look-ahead limiter, chunked),
exactly 160.6 s at 48 kHz, 24-bit; mp3 preview; loudness/brightness plot; a placement log (json) for the report.
"""
import os, re, sys, json, glob, argparse, subprocess
import numpy as np, soundfile as sf
from scipy import signal
from scipy.ndimage import minimum_filter1d

HERE = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import egypt_cues as E

SR = E.SR
S = os.environ.get('SND60', '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/snd60')
CUES, SFX = f'{S}/cues', f'{S}/sfx'
SFX_OVER_MUSIC = 0.0      # dB: sfx peak over the local music momentary loudness (v2, owner: softer, never piercing)
SFX_SHELF = (4500, -4.0)  # every sfx gets a gentle high shelf (Hz, dB) unless fx 'bright'
AMB_UNDER_MUSIC = 8.0     # LU: ambience loudness under the local music
TARGET, TP_CEIL = -14.0, -1.5


# ------------------------------------------------------------------ tables
def parse_plan(path):
    rows, hdr = [], None
    for line in open(path, encoding='utf-8'):
        s = line.strip()
        if not s.startswith('|'): hdr = None if not s else hdr; continue
        cells = [c.strip() for c in s.strip('|').split('|')]
        if hdr is None: hdr = cells; continue
        if not ''.join(cells).strip('-: '): continue
        r = {k: (None if v in ('', '-') else v) for k, v in zip(hdr, cells)}
        if (r.get('on') or 'y').lower() in ('n', 'no', 'off', '0'): continue
        rows.append(r)
    return rows

def load_shots():
    try:
        s = open(os.path.join(EP, '..', '37-qiqing/remotion/src/qq60/story60.ts'), encoding='utf-8').read()
        i = s.index('= [', s.index('export const SHOTS')) + 2; return json.loads(s[i:s.index('];', i) + 1])
    except Exception: return []
SHOTS = load_shots(); SHOTW = {x['n']: (x['a'], x['b']) for x in SHOTS}
FILM = SHOTS[-1]['b'] if SHOTS else 157.6   # the film's length = the clock's last shot end
NF = int(round(FILM * SR))

def parse_sync(paths):
    """tolerant reader for the builders' tables. A line starts with a shot number (table row or list); events are separated by
    · | ; and written either 'label 12.34' or '12.34 label (comment)'. A time takes the words before it, or the words after it
    when nothing comes before; a parenthesis right after a time belongs to that time; 'a–b' gives b the label '<a's label> end';
    a bare time repeats the last label (#2, #3 ...). Only times inside the shot's window (+-1 s) count (drops shot-relative ones)."""
    num = re.compile(r'(?<![\d.])(\d{1,3}\.\d{1,3})(?![\d.])')
    def clean(x): return re.sub(r'\s+', ' ', re.sub(r'[\[\]()=:@`*",+\u2013\u2014\-]+', ' ', x)).strip().lower()
    def has_word(x): return re.search(r'[a-z\u4e00-\u9fff]', x.lower()) is not None
    ev = []
    for p in paths:
        for line in open(p, encoding='utf-8'):
            m = re.match(r'\s*[|*#>\-\s]*(?:shot\s*)?(\d{1,2})\b', line, re.I)
            if not m or int(m.group(1)) not in SHOTW: continue
            shot = int(m.group(1)); a, b = SHOTW[shot]; last, k = None, 0
            for cell in line[m.end():].split('|'):
                for tok in re.split(r'[·;]', cell):
                    ms = list(num.finditer(tok))
                    for j, mm in enumerate(ms):
                        before = tok[ms[j - 1].end() if j else 0:mm.start()]; after = tok[mm.end():ms[j + 1].start() if j + 1 < len(ms) else len(tok)]
                        before_s = re.sub(r'^\s*\*?\*?\s*\([^)]*\)', '', before) if j else before   # '(lub) +' after the previous time is its comment
                        tv = float(mm.group(1))
                        nxt = tok[ms[j + 1].end():ms[j + 2].start() if j + 2 < len(ms) else len(tok)] if j + 1 < len(ms) else ''
                        if not has_word(before_s) and re.fullmatch(r'\W*[\u2013\-]\W*', after) and has_word(nxt):   # '27.45–28.10 label'
                            lab = clean(re.split(r'\(', nxt)[0]) or clean(nxt)
                        elif re.fullmatch(r'\W*[\u2013\-]\W*', before) and last: lab = last + ' end'
                        elif has_word(before_s): lab = clean(before_s)
                        elif last and (after.strip().lstrip('*').strip().startswith('(') or not has_word(after)): lab = None
                        else: lab = clean(re.split(r'\(', after)[0]) or clean(after)
                        if lab is None: k += 1; lab_use = last
                        else:
                            if lab != last: last, k = lab, 0
                            k += 1; lab_use = lab
                        if lab_use is None or not (a - 1.0 <= tv <= b + 1.0): continue
                        ev.append(dict(shot=shot, label=lab_use, k=k, t=tv, src=os.path.basename(p)))
    return ev

def find_sync(ev, key):
    """key 'shot:a+b~c#2': alternatives split by ~; in each, every word (split by space or +) must occur in the event's label;
    '#n' picks the n-th time of that label."""
    shot, labs = key.split(':', 1); shots = [int(x) for x in shot.split(',')]   # '31,42:roar' = look in 31, then 42
    for sh in shots:
        for lab in labs.lower().split('~'):
            lab, _, n = lab.strip().partition('#'); words = lab.replace('+', ' ').split()   # '+' = and
            if not words: continue
            for e in ev:
                if e['shot'] == sh and all(w in e['label'] for w in words) and (not n or e['k'] == int(n)): return e
    return None

def num(v, d=None):
    return d if v is None else float(v)

def fx_of(r):
    out = {}
    for tok in (r.get('fx') or '').split(','):
        tok = tok.strip()
        if not tok: continue
        k, _, v = tok.partition('='); out[k.strip()] = v.strip() if v else True
    return out


# ------------------------------------------------------------------ sources
_cache = {}
def load(path):
    if path not in _cache:
        x, sr = sf.read(path, dtype='float32', always_2d=True); assert sr == SR, path
        _cache[path] = x[:, :2] if x.shape[1] >= 2 else np.repeat(x, 2, 1)
    return _cache[path]

CUEMETA = json.load(open(f'{CUES}/cues.json'))
SFXMETA = {r['name']: r for r in json.load(open(f'{SFX}/sfx_rows.json'))}
def synth_sfx(spec):
    """one-shot instruments from the score, so story sounds match the music: synth:heart = lub-dub (dub +0.17 s, as the
    builders animate the heart glow) from egypt_cues.heart, whose knock (150-400 Hz) a phone speaker can play."""
    kind = spec.split(':', 1)[1]
    if kind in ('heart', 'heart1'):   # heart1: the lub alone (fast beats, where a dub would smear into the next lub)
        rng = np.random.default_rng(9); n = int(0.9 * SR); m = np.zeros(n)
        a = E.heart(rng, 1.0); m[:len(a)] += a
        if kind == 'heart': b = E.heart(rng, 0.55); i = int(0.17 * SR); m[i:i + len(b)] += b[:n - i]
        x = np.stack([m, m], 1); x = 0.8 * x + 0.3 * E.conv_st(x, E.make_ir(0.9, seed=31))
        return (x / np.abs(x).max() * 10 ** (-3 / 20)).astype(np.float32), 0.004
    if kind == 'reedswell':   # the title: a mizmar on D5 (over A4) swelling to a peak at 0.35 s, held, falling away
        y = np.asarray(E.reed([('A4', 0.12), ('D5', 2.2, 'fall')], 0.75, np.random.default_rng(12), 'mizmar'), np.float64)
        y = y if y.ndim == 2 else np.stack([y, y], 1); n = len(y); t = np.arange(n) / SR
        env = np.where(t < 0.35, np.sin(np.pi / 2 * t / 0.35) ** 2, np.exp(-(t - 0.35) / 0.9)); y = y * env[:, None]
        y = np.concatenate([y, np.zeros((int(0.8 * SR), 2))]); y = 0.8 * y + 0.35 * E.conv_st(y, E.make_ir(1.4, seed=35))
        return (y / np.abs(y).max() * 10 ** (-3 / 20)).astype(np.float32), 0.35
    if kind == 'squeak':   # one reed player squeaks as the band stops: Eb6 -> C6 blip on the mizmar (in D Hijaz)
        y = E.reed([('Eb6', 0.08), ('C6', 0.11)], 0.8, np.random.default_rng(4), 'mizmar'); y = np.asarray(y, np.float64)
        y = y if y.ndim == 2 else np.stack([y, y], 1); y = np.concatenate([y, np.zeros((int(0.6 * SR), 2))])   # room for the tail
        y = 0.85 * y + 0.25 * E.conv_st(y, E.make_ir(1.0, seed=33)); return (y / np.abs(y).max() * 10 ** (-3 / 20)).astype(np.float32), 0.01
    raise ValueError(spec)

def base_cue(name):
    return name.replace('_loop', '').replace('_end', '')
def hit_of(r):
    f = r['file']
    if f.startswith('synth:'): return synth_sfx(f)[1]
    if r['type'] in ('sfx', 'amb'): return SFXMETA[f]['hit']
    m = CUEMETA.get(f) or CUEMETA.get(base_cue(f), {})
    return m.get('hit_s', m.get('hits', {}).get('VERDICT_HIT_s', 0.0))
def bpm_of(f):
    return CUEMETA.get(base_cue(f), {}).get('bpm')

def synth(spec, dur):
    """drone:D2,A2 (choir 'oo', slow) or bowl:D4 (struck singing bowl in a small room); normalised to -14 LUFS."""
    kind, _, arg = spec.partition(':'); n = int(dur * SR)
    if kind == 'drone':
        x = 0   # low notes on the arghul (Egyptian reed drone), upper notes on the 'oo' choir; an Eb (the Hijaz semitone) sits quieter
        for i, nt in enumerate(arg.split(',')):
            low = int(nt[-1]) <= 2; v = E.held(dur, nt, E.arghul if low else E.choir_oo, att=0.6, rel=0.01, gain=1.0, seed=7 + i, voices=3)[:n]
            x = x + v * (0.45 if nt.startswith('Eb') else 1.0) * (0.8 if low else 1.0)
    elif kind == 'bowl':
        rng = np.random.default_rng(5); m = E.bowl(rng, arg or 'D4', 1.0, dur)[:n]
        m2 = E.bowl(np.random.default_rng(6), 'D3', 0.35, dur)[:n]   # a soft octave below
        x = np.stack([m + m2, m + m2], 1); x = 0.75 * x + 0.35 * E.conv_st(x, E.make_ir(1.8, seed=21))
    else: raise ValueError(spec)
    x = np.asarray(x, np.float64); L = E.lufs(x)
    return (x * 10 ** ((-14 - L) / 20)).astype(np.float32)


# ------------------------------------------------------------------ placement
def fade_curve(k, out=False):
    x = np.linspace(0, 1, k, endpoint=False) + 0.5 / max(k, 1)
    return np.cos(x * np.pi / 2) if out else np.sin(x * np.pi / 2)

def tapestop(src, s0, k):
    """k output samples that read src from s0 while the speed falls linearly from 1 to 0."""
    j = np.arange(k); pos = s0 + j * (1 - j / (2 * k))
    return np.stack([np.interp(pos, np.arange(len(src)), src[:, c]) for c in (0, 1)], 1).astype(np.float32)

def place(buf, r, x, loop):
    """x: source (frames, 2). Returns (film_start_s, film_end_s) actually written."""
    fx = fx_of(r); t, at = r['_t'], r['_at']
    if 'rev' in fx: x = x[::-1].copy()   # reversed (e.g. the sand blowing away, played backwards = the rewind)
    inn = num(r.get('in'), at if r['type'] in ('cue', 'sting', 'synth') else 0.0)
    if r['type'] in ('sfx', 'amb') and r.get('in') is None: inn = 0.0
    fs = t - (at - inn)
    if r.get('_prestart0') and fs > 0 and loop: inn -= fs; fs = 0.0
    fe = r['_end'] if r.get('_end') is not None else fs + (len(x) / SR - inn if not loop else 1e9)
    fe = min(fe, FILM); i0, i1 = int(round(max(0.0, fs) * SR)), int(round(fe * SR))
    if i1 <= i0: return None
    so = int(round(inn * SR)) + (i0 - int(round(fs * SR)))   # source sample at film i0
    idx = np.arange(so, so + (i1 - i0))
    if loop: seg = x[idx % len(x)]
    else:
        seg = np.zeros((i1 - i0, 2), np.float32); ok = (idx >= 0) & (idx < len(x)); seg[ok] = x[idx[ok]]
    seg = seg.copy()
    if 'wind' in fx:   # a soft drop: the band slows a little (to 0.6x) while it fades out (cos^2) over the last d s
        k = min(len(seg), int(float(fx['wind']) * SR)); s0 = so + len(seg) - k; src = np.concatenate([x, x]) if loop else x
        j = np.arange(k); pos = (s0 % len(x) if loop else s0) + j * (1 - 0.4 * j / (2 * k))
        seg[-k:] = np.stack([np.interp(pos, np.arange(len(src)), src[:, c]) for c in (0, 1)], 1) * (np.cos(np.linspace(0, np.pi / 2, k)) ** 2)[:, None]
    if 'tapestop' in fx:
        k = min(len(seg), int(float(fx['tapestop']) * SR)); s0 = so + len(seg) - k
        src = np.concatenate([x, x]) if loop else x
        seg[-k:] = tapestop(src, s0 % len(x) if loop else s0, k)
        seg[-k:] *= np.linspace(1, 0.0, k)[:, None] ** 0.5
    g = np.ones(len(seg), np.float32)
    if 'ramp' in fx:
        a, b, d = re.match(r'(-?[\d.]+)>(-?[\d.]+)@([\d.]+)', fx['ramp']).groups(); k = len(seg)
        tt = np.arange(k) / SR; g *= 10 ** ((float(a) + (float(b) - float(a)) * np.clip(tt / float(d), 0, 1)) / 20)
    if 'env' in fx:   # absolute film-time gain envelope: env=t1:dB1;t2:dB2;... (linear in dB)
        pts = [tuple(map(float, q.split(':'))) for q in fx['env'].split(';')]; tt = i0 / SR + np.arange(len(seg)) / SR
        g *= 10 ** (np.interp(tt, [p_[0] for p_ in pts], [p_[1] for p_ in pts]) / 20)
    fin, fout = r['_fin'], r['_fout']
    if fin and fs >= -1e-6:
        k = min(len(g), max(1, int(fin * SR))); g[:k] *= fade_curve(k)
    if fout:
        k = min(len(g), max(1, int(fout * SR))); g[-k:] *= fade_curve(k, True)
    seg *= g[:, None] * 10 ** (r['_gain'] / 20)
    if 'pan' in fx:
        p = float(fx['pan']); th = (np.clip(p, -1, 1) + 1) * np.pi / 4
        seg[:, 0] *= np.sqrt(2) * np.cos(th); seg[:, 1] *= np.sqrt(2) * np.sin(th)
    buf[i0:i1] += seg
    return i0 / SR, i1 / SR


# ------------------------------------------------------------------ measurement
def kweight(x):
    import pyloudnorm as pyln
    m = pyln.Meter(SR); y = x.astype(np.float64)
    for f in m._filters.values(): y = np.stack([f.apply_filter(y[:, c]) for c in range(2)], 1)
    return y

def momentary(x, win=0.4, hop=0.05):
    p = (kweight(x) ** 2).sum(1); c = np.concatenate([[0.0], np.cumsum(p)]); w, h = int(win * SR), int(hop * SR)
    idx = np.arange(0, len(p) - w, h)
    return idx / SR + win / 2, -0.691 + 10 * np.log10((c[idx + w] - c[idx]) / w + 1e-12)

def seg_lufs(x):
    import pyloudnorm as pyln
    if len(x) < int(0.45 * SR): x = np.concatenate([x, np.zeros((int(0.45 * SR) - len(x), 2), x.dtype)])
    L = pyln.Meter(SR).integrated_loudness(x.astype(np.float64)); return L if np.isfinite(L) else -70.0

BANDS = np.geomspace(100, 12500, 22)   # third-octave-ish edges
def audibility(sfx, mus, i0, win=0.35):
    """how far the effect pokes out: max over ~21 ms frames and third-octave bands (100 Hz-12.5 kHz, what a phone plays) of
    (sfx band level - music band level) in dB. > +6 clearly heard on a phone; 0...+6 noticed; < 0 masked."""
    n = int(win * SR); a = sfx[i0:i0 + n].mean(1).astype(np.float64); b = mus[i0:i0 + n].mean(1).astype(np.float64)
    if len(a) < 2048: return None
    f, _, A = signal.stft(a, SR, nperseg=1024, noverlap=512); _, _, Bm = signal.stft(b, SR, nperseg=1024, noverlap=512)
    A, Bm = np.abs(A) ** 2, np.abs(Bm) ** 2; best = -99.0; floor = A.max() * 1e-4
    for lo, hi in zip(BANDS[:-1], BANDS[1:]):
        k = (f >= lo) & (f < hi)
        if not k.any(): continue
        ea, eb = A[k].sum(0), Bm[k].sum(0); ok = ea > floor
        if ok.any(): best = max(best, float((10 * np.log10(ea[ok] / (eb[ok] + 1e-12))).max()))
    return round(best, 1)

def true_peak_long(x):
    m = 0.0
    for a in range(0, len(x), 1 << 19):
        seg = x[max(0, a - 64):a + (1 << 19) + 64].astype(np.float64)
        m = max(m, np.abs(signal.resample_poly(seg, 4, 1, axis=0)).max())
    return 20 * np.log10(m + 1e-12)

def limit_long(x, ceiling_db, look=0.002, rel=0.08):
    """egypt_cues.limit, with the 4x oversampled peak detector run in chunks (a whole film at 4x does not fit in memory)."""
    c = 10 ** (ceiling_db / 20); n = len(x); up = np.empty(n); B, pad = 1 << 19, 64
    for a in range(0, n, B):
        a0, b1 = max(0, a - pad), min(n, a + B + pad)
        u = np.abs(signal.resample_poly(x[a0:b1].astype(np.float64), 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)
        up[a:min(n, a + B)] = u[a - a0:a - a0 + min(B, n - a)]
    need = np.minimum(1, c / np.maximum(up, 1e-9)); la = int(look * SR)
    g = minimum_filter1d(need, 2 * la + 1)
    out = E._release(g, np.exp(-1 / (rel * SR)))
    out = np.minimum(out, signal.lfilter(np.ones(la) / la, 1, np.concatenate([np.ones(la), out]))[la:])
    return (x * out[:, None]).astype(np.float32), out


# ------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--plan', default=f'{EP}/mix60_plan.md'); ap.add_argument('--out', default=f'{S}/mix60.wav')
    ap.add_argument('--no-mp3', action='store_true'); ap.add_argument('--plot', default=f'{S}/mix60_curve.png')
    a = ap.parse_args()
    rows = parse_plan(a.plan)
    syncs = sorted(glob.glob(f'{EP}/sync60_*.md')); ev = parse_sync(syncs)
    print(f'plan rows {len(rows)} | sync tables {[os.path.basename(p) for p in syncs] or "none yet"} ({len(ev)} events)')
    used, waiting = set(), []
    for r in rows:
        r['_t'] = float(r['t']); r['_at'] = hit_of(r) if (r.get('at') in (None, 'hit') and (r['type'] in ('sfx', 'amb') or r.get('at') == 'hit')) else num(r.get('at'), 0.0)
        r['_gain'] = num(r.get('gain'), 0.0)
        dfin, dfout = (0.003, 0.06) if r['type'] in ('sfx',) else (0.03, 0.08)
        r['_fin'], r['_fout'] = num(r.get('fin'), dfin), num(r.get('fout'), dfout)
        r['_sync'] = None
        if r.get('sync'):
            what, _, key = r['sync'].partition('<-'); key, _, off = key.partition('@'); e = find_sync(ev, key)
            if e is not None: e = dict(e, t=e['t'] + float(off or 0))
            if e is None: waiting.append(r['id'])
            else:
                used.add((e['shot'], e['label'], e['t'])); r['_sync'] = f"{e['src']}: {e['shot']} {e['label']}#{e['k']} {e['t']:.2f}"
                if what == 't': r['_t'] = e['t']
                elif what == 'end': r['_endsync'] = e['t']
                elif what == 'lock':
                    p = float(fx_of(r)['lock']); d = (e['t'] - r['_t']); r['_t'] += d - round(d / p) * p; r['_prestart0'] = True
        end = r.get('end')
        r['_end'] = r.get('_endsync', (r['_t'] + float(end[1:]) if end and end.startswith('+') else num(end)))
    # music bus
    music = np.zeros((NF, 2), np.float32); log = []
    for r in rows:
        if r['type'] not in ('cue', 'sting', 'synth'): continue
        if r['type'] == 'synth':
            x = synth(r['file'], max(0.5, (r['_end'] or FILM) - r['_t'] + 0.05)); loop = False
        else:
            x = load(f"{CUES}/{r['file']}.wav"); loop = r['file'].endswith('_loop')
        span = place(music, r, x, loop)
        if span: log.append(dict(id=r['id'], type=r['type'], file=r['file'], t=round(r['_t'], 3), start=round(span[0], 3), end=round(span[1], 3), gain=r['_gain'], sync=r['_sync'], note=r.get('note')))
    # ducks: the music dips under a motivated big sound (Ammit's roar), like the reference's lioness roaring in a gap
    for r in rows:
        fx = fx_of(r)
        if r['type'] in ('sfx', 'amb') and 'duck' in fx:
            dd, T = float(fx['duck']), r['_t']; ln = len(load(f"{SFX}/{r['file']}.wav")) / SR if not r['file'].startswith('synth:') else 0.8
            t1, t2 = T - 0.15, min(FILM, T + 0.75 * ln); tt = np.arange(int(max(0, t1 - 0.12) * SR), int(min(FILM, t2 + 0.5) * SR)) / SR
            gd = np.interp(tt, [t1 - 0.12, t1, t2, t2 + 0.5], [0, -dd, -dd, 0]); music[int(tt[0] * SR):int(tt[0] * SR) + len(tt)] *= (10 ** (gd / 20))[:, None].astype(np.float32)
    # SFX bus, levelled against the music
    tm, Lm = momentary(music)
    def local(t0, t1): s = Lm[(tm >= t0) & (tm <= t1)]; return float(s.max()) if len(s) else -70.0
    def mpeak(t0, t1):
        a_, b_ = int(max(0, t0) * SR), int(min(FILM, t1) * SR); return 20 * np.log10(np.abs(music[a_:b_]).max() + 1e-9) if b_ > a_ else -90.0
    sfxbus = np.zeros((NF, 2), np.float32)
    for r in rows:
        if r['type'] not in ('sfx', 'amb'): continue
        fx = fx_of(r); x = synth_sfx(r['file'])[0] if r['file'].startswith('synth:') else load(f"{SFX}/{r['file']}.wav")
        if 'bright' not in fx and SFX_SHELF:
            key = (r['file'], 'shelf')
            if key not in _cache: _cache[key] = E.shelf(x.astype(np.float64), SFX_SHELF[0], SFX_SHELF[1], high=True).astype(np.float32)
            x = _cache[key]
        loop = r['type'] == 'amb' and r.get('_end') is not None
        tmp = np.zeros((NF, 2), np.float32); g0 = r['_gain']; r['_gain'] = 0.0
        span = place(tmp, r, x, loop)
        if not span: continue
        a_, b_ = int(span[0] * SR), int(span[1] * SR); seg = tmp[a_:b_]; T = r['_t']
        if r['type'] == 'sfx':
            pk = 20 * np.log10(np.abs(seg).max() + 1e-9); loc = local(T - 0.25, T + 0.25); mp = mpeak(T - 0.3, T + 0.3)
            want = float(fx['abs']) if 'abs' in fx else max(loc, -40.0) + SFX_OVER_MUSIC + g0
            if 'impact' not in fx and 'abs' not in fx: want = min(want, mp - 1.0)
            gdb = want - pk; info = dict(peak_dbfs=round(want, 1), local_lufs=round(loc, 1), music_peak=round(mp, 1))
        else:
            Ls = seg_lufs(seg); s = Lm[(tm >= span[0]) & (tm <= span[1])]; loc = float(np.median(s)) if len(s) else -70.0
            want = float(fx['abs']) if 'abs' in fx else loc - AMB_UNDER_MUSIC + g0
            gdb = want - Ls; info = dict(lufs=round(want, 1), local_lufs=round(loc, 1))
        sfxbus[a_:b_] += seg * 10 ** (gdb / 20); del tmp
        info['audible_db'] = audibility(seg * 10 ** (gdb / 20), music[a_:b_], max(0, int((T - 0.05) * SR) - a_))
        log.append(dict(id=r['id'], type=r['type'], file=r['file'], t=round(T, 3), start=round(span[0], 3), end=round(span[1], 3), gain=round(gdb, 1), sync=r['_sync'], note=r.get('note'), **info))
    # master
    mix = music + sfxbus
    L0 = E.lufs(mix.astype(np.float64)); g = 10 ** ((TARGET - L0) / 20)
    for it in range(3):
        y, gcurve = limit_long(mix * g, TP_CEIL - 0.25)
        L = E.lufs(y.astype(np.float64))
        if abs(L - TARGET) < 0.05: break
        g *= 10 ** ((TARGET - L) / 20)
    k = int(0.002 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]; k = int(0.05 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None]
    tp = true_peak_long(y); L = E.lufs(y.astype(np.float64)); gr = float(20 * np.log10(gcurve.min()))
    grdb = 20 * np.log10(gcurve + 1e-12); hot = []   # where the limiter works: regions with > 1 dB of gain reduction
    on = np.flatnonzero(grdb < -1.0)
    if len(on):
        brk = np.flatnonzero(np.diff(on) > int(0.25 * SR)); starts = np.r_[on[0], on[brk + 1]]; ends = np.r_[on[brk], on[-1]]
        hot = [(round(a_ / SR, 2), round(b_ / SR, 2), round(float(grdb[a_:b_ + 1].min()), 1)) for a_, b_ in zip(starts, ends)]
    sf.write(a.out, y, SR, subtype='PCM_24')
    print(f'master: {len(y) / SR:.3f} s ({len(y)} samples)  LUFS {L:.2f}  TP {tp:.2f} dBTP  limiter max GR {gr:.1f} dB  pre-master LUFS {L0:.1f}')
    if not a.no_mp3:
        mp3 = os.path.splitext(a.out)[0] + '.mp3'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.out, '-c:a', 'libmp3lame', '-b:a', '192k', mp3], check=True)
    # report data
    unused = [e for e in ev if (e['shot'], e['label'], e['t']) not in used]
    meta = dict(lufs=round(L, 2), tp=round(tp, 2), seconds=round(len(y) / SR, 4), samples=len(y), limiter_max_gr_db=round(gr, 2),
                limiter_regions_gt1db=hot, rows=log, sync_tables=[os.path.basename(p) for p in syncs], waiting_for_sync=waiting,
                sync_events_not_used=[f"{e['src']}: {e['shot']} {e['label']} {e['t']}" for e in unused])
    json.dump(meta, open(os.path.splitext(a.out)[0] + '_placed.json', 'w'), ensure_ascii=False, indent=1, default=float)
    print('limiter > 1 dB at:', hot)
    tq, Lq = momentary(y.astype(np.float32), 1.0, 0.05); cliffs = []   # sudden level changes: 1 s loudness moves > 8 dB within 0.5 s
    for i in range(10, len(Lq)):                                            # (rhythm averages out at 1 s; drop-outs and slams don't)
        d_ = Lq[i] - Lq[i - 10]
        if abs(d_) > 8 and (not cliffs or tq[i] - cliffs[-1][0] > 0.8): cliffs.append((round(float(tq[i]), 2), round(float(d_), 1)))
    meta['cliffs'] = cliffs; json.dump(meta, open(os.path.splitext(a.out)[0] + '_placed.json', 'w'), ensure_ascii=False, indent=1, default=float)
    print('sudden level changes (1 s loudness, > 8 dB in 0.5 s):', cliffs)
    for e in log: print(f"{e['start']:8.3f}-{e['end']:8.3f}  {e['type']:5s} {e['id']:16s} {e['file']:28s} gain {e['gain']:+6.1f}" + (f"  peak {e['peak_dbfs']:+.1f} over local {e['local_lufs']:+.1f}" if 'peak_dbfs' in e else '') + (f"  aud {e['audible_db']:+.1f}" if e.get('audible_db') is not None else '') + (f"  [{e['sync']}]" if e['sync'] else ''))
    print('waiting for sync:', ', '.join(waiting) or '-')
    if unused: print('sync events not used by any row:', len(unused))
    if a.plot: plot(y, music, sfxbus, log, a.plot)

def plot(y, music, sfxbus, log, path):
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    shots = SHOTS
    t, L = momentary(y); _, Ls = momentary(y, 3.0, 0.1)
    fig, ax = plt.subplots(3, 1, figsize=(22, 11), sharex=True, gridspec_kw=dict(height_ratios=[3, 2.2, 1]))
    ax[0].plot(t, L, lw=0.6, color='#555', label='momentary 400 ms'); ax[0].plot(_, Ls, lw=1.6, color='#c33', label='short-term 3 s')
    ax[0].axhline(-14, color='g', lw=0.6, ls='--'); ax[0].set_ylim(-50, -4); ax[0].set_ylabel('LUFS'); ax[0].legend(loc='lower left')
    cols = {'cue': '#3a6ea5', 'sting': '#d0a020', 'synth': '#7a4ab0', 'sfx': '#2a9d5c', 'amb': '#8fbf9f'}
    for e in log:
        if e['type'] in ('cue', 'synth'):
            ax[0].axvspan(e['start'], e['end'], ymin=0.93, ymax=0.99, color=cols[e['type']], alpha=0.5)
            ax[0].text(e['start'] + 0.2, -5.2, e['file'].replace('_loop', ''), fontsize=7, va='top')
        elif e['type'] == 'sting': ax[0].plot([e['t']], [-8], 'v', color=cols['sting'], ms=7)
        else: ax[0].plot([e['t']], [-47], '|', color=cols[e['type']], ms=12, mew=1.5)
    for sh in shots:
        for a_ in ax: a_.axvline(sh['a'], color='#bbb', lw=0.4, zorder=0)
        ax[0].text(sh['a'] + 0.1, -49, str(sh['n']), fontsize=6, color='#888')
    mono = signal.resample_poly(y.mean(1).astype(np.float64), 1, 2); f, tt, Z = signal.stft(mono, SR // 2, nperseg=2048, noverlap=1024)
    P = 10 * np.log10(np.abs(Z) ** 2 + 1e-12); fl = np.geomspace(40, 11000, 160); Pi = np.array([np.interp(fl, f, P[:, j]) for j in range(P.shape[1])]).T
    ax[1].imshow(Pi, aspect='auto', origin='lower', extent=[tt[0], tt[-1], 0, len(fl)], cmap='magma', vmin=Pi.max() - 80, vmax=Pi.max())
    ticks = [64, 128, 256, 512, 1024, 2048, 4096, 8192]; ax[1].set_yticks([np.searchsorted(fl, v) for v in ticks]); ax[1].set_yticklabels(ticks); ax[1].set_ylabel('Hz')
    pw = np.abs(Z) ** 2; cen = (f[:, None] * pw).sum(0) / (pw.sum(0) + 1e-12); k = 9
    ax[2].plot(tt, np.convolve(cen, np.ones(k) / k, 'same'), lw=0.8, color='#a50'); ax[2].set_ylabel('centroid Hz'); ax[2].set_ylim(0, 4000)
    ax[2].set_xlabel('film s'); ax[2].set_xlim(0, FILM); plt.tight_layout(); plt.savefig(path, dpi=70); plt.close()
    print('plot', path)

if __name__ == '__main__':
    main()
