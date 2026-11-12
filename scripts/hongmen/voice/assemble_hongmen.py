#!/usr/bin/env python3
"""Assemble the Hongmen narration for script v4 (22 lines, the film loops) from the hongmen-vo-03 takes.

  python3 assemble_hongmen.py [--raw raw] [--out .] [--work work] [--lines hongmen_lines.json] [--rate 5.5]
                              [--dry] [--words] [line=take ...] [loop=take]
  --raw   the delivered clips (<name>.mp3) and their report.json (the recogniser's words); never in the repo
  --out   where narration_v4.wav / .mp3, narration_v4_looped_twice.mp3 and voice_timing_v4.json go; never in the repo
  --dry   print the layout only;  --words  also print every character's start;  7=z07a  use another take for a line
  --end N frames added to the hold after line 21 (default 0 = the whole-frame track whose hold is nearest the asked
          0.30 s: 0.293 s, 2092 frames; 1 = 0.326 s, 2093 frames; -1 = 0.259 s, 2091 frames). Only line 22 moves.

Per chosen take: find the first / last sound on the waveform, keep 30 ms of air, shorten every inner pause over
0.10 s to 0.07 s, bring the clip to one speech level, speed it up with ffmpeg atempo toward RATE characters a second
(1.0 .. 1.36), then lay the clips on one timeline (44.1 kHz mono) with the gaps below.
The loop sentence (z0122*) is processed as ONE piece (no pause shortening) and cut inside its comma: the part after
the cut opens the track (line 1), the part before the cut closes it (line 22), so the end of the track followed by its
head is the take's own comma, sample for sample in TIME. Its level is not left as spoken: the take falls about 4.5 dB
from 「至于刘邦」 to 「他靠上厕所…」, so each part gets its own gain (LOOP_OVER: line 22 ends 1 dB above the other
lines, line 1 0.8 dB under them) and the gain changes inside the comma, in the 40 ms before the cut where the take is
at its noise floor. Two faint ticks of the take's comma (before 「他」, so the first sounds of the film) are turned
down 12 dB (LOOP_DUCK).
Writes narration_v4.wav / .mp3, narration_v4_looped_twice.mp3, voice_timing_v4.json (times measured on the final
track; "words" = one [character, start, end] per Chinese character of the line)."""
import json, os, re, subprocess, sys
import numpy as np
import hmaudio
from hmaudio import SR, HOP, cjk, strip, run, decode, read_wav, write_wav, env_db, runs_below

A = sys.argv[1:]
opt = lambda k, d: A[A.index(k) + 1] if k in A else d
RATE = float(opt("--rate", 5.5))
OUT = opt("--out", ".")
RAWDIR = opt("--raw", hmaudio.RAW)
WORKDIR = opt("--work", hmaudio.WORK)
hmaudio.configure(RAWDIR, WORKDIR)
DRY = "--dry" in A
END_F = int(opt("--end", 0))
LINES_JSON = opt("--lines", os.path.join(os.path.dirname(os.path.abspath(__file__)), "hongmen_lines.json"))
FPS = 30
SPF = SR // FPS                 # 1470 samples a frame
LO, HI = 1.0, 1.36              # atempo limits
AIR = 0.030                     # air kept before the first and after the last sound of a clip, s (in the final track)
# Silence between two lines, from the last audible sound of one to the first audible sound of the next. The earlier
# assembly put 0.04 s between clips that each kept 0.02 s of air: 0.08 s; before a new beat 0.10 s + air = 0.14 s.
GAP = 0.08
BIG = {3: 0.14, 5: 0.14, 7: 0.14, 8: 0.14, 14: 0.14, 18: 0.14, 20: 0.14}   # a breath before a new beat / place
PAUSE_MIN, PAUSE_TO = 0.10, 0.07        # an inner pause longer than PAUSE_MIN becomes PAUSE_TO
KEEP_A, KEEP_B = 0.025, 0.045           # of PAUSE_TO: kept after the last sound / before the next sound
PAD = 0.15                      # silence around a clip while it is sped up (trimmed to AIR afterwards)
LOOP_RATE = 5.4                 # the loop sentence is brought to this rate whatever RATE is (its line has time to spare)
LEVEL = -20.0                   # every clip is brought to this active speech level (dBFS RMS) before the join
TAIL_F = 3                      # frames of film after the last word 「至于刘邦，」 (the rest of the comma is the head)
# The loop take's own contour is 「至于刘邦」 +2.6 dB / 「他靠上厕所…」 -1.9 dB against the other lines (4.5 dB down
# across the comma). Every line must sit within about 2 dB of the others, so the two parts are levelled separately:
LOOP_OVER = {22: +1.0, 1: -0.8}  # dB over LEVEL for 「至于刘邦，」 / for line 1: half a natural fall (1.8 dB) is kept
LOOP_RAMP = (0.060, 0.020)      # the gain changes between 60 and 20 ms before the cut (the comma's noise floor)
# Ticks in the loop take's comma, after the cut = the very first sounds of the film: (from s, to s, dB) on the track's
# clock, 5 ms ramps inside the stretch. z0122a: two 4 ms ticks at 0.042 and 0.077 s (peaks -34 / -30 dBFS), 「他」
# bursts at 0.104 s; they are low thuds (centroid 400 Hz), not the burst or the hiss of 「他」.
LOOP_DUCK = {"z0122a": (0.030, 0.090, -12.0)}
LINE2_MIN_F = 80                # line 2's first word: the privy shot is 78 frames, the cut is 2 frames before the word
Q_TEMPO = 1.08                  # 「生的。」 is deadpan: slower than the run of the line

# The chosen takes; 15 = two clips (…猪腿。 / 生的。); lines 1 and 22 = the loop take.
# Rule: the recogniser's words must be the line (homophones allowed), then the take that needs the smaller speed-up,
# then the cleaner start / end. Lines with a tts spelling use the takes of the PRIMARY spelling (a / b: 庆家, 樊快,
# 刀组, 曹无伤), so 亲家 is qìng by spelling. Out: z16a (刘邦 heard as 郵榜), z20d (伤 heard as 鄉), z09b (无 heard
# as 烏), z15q (生的 heard as 深得), z20b (the file starts on a click), z03a / z04a (start on the file's first sample).
TAKES = {2: "z02a", 3: "z03b", 4: "z04b", 5: "z05b", 6: "z06a", 7: "z07b", 8: "z08a", 9: "z09a", 10: "z10b",
         11: "z11b", 12: "z12b", 13: "z13a", 14: "z14b", 15: ("z15p", "z15qb"), 16: "z16b", 17: "z17a", 18: "z18b",
         19: "z19a", 20: "z20a", 21: "z21b"}
LOOP = "z0122a"
for a in A:
    if re.fullmatch(r"\d+=\w+", a): k, v = a.split("="); TAKES[int(k)] = v
    if a.startswith("loop="): LOOP = a[5:]

REP = {c["name"]: c for c in json.load(open(RAWDIR + "/report.json", encoding="utf8"))["clips"]}
LJ = json.load(open(LINES_JSON, encoding="utf8"))
LINES = LJ["lines"]
DIGITS = {"40": 2, "10": 1}     # the recogniser wrote 四十 / 十 as digits


# ---------------------------------------------------------------------------------------------- waveform facts
def groups(e, thr, join=0.08):
    """stretches above thr, merged when less than `join` apart: [(start s, end s, peak dB)]"""
    k = np.nonzero(e > thr)[0]
    if not len(k): return []
    out, a, p = [], k[0], k[0]
    for i in k[1:]:
        if (i - p) * HOP > join: out.append((a * HOP, (p + 1) * HOP, e[a:p + 1].max())); a = i
        p = i
    out.append((a * HOP, (p + 1) * HOP, e[a:p + 1].max()))
    return out


def facts(x, lo=None, hi=None):
    """loud level, strict first / last sound (-56 dBFS, blips at the file ends ignored), audible first / last sound"""
    e = env_db(x)
    loud = float(np.percentile(e, 90))
    g = groups(e, -56.0)
    # a blip: shorter than 40 ms and under -35 dBFS, alone at an end of the file (an mp3 edge artefact)
    while len(g) > 1 and g[-1][1] - g[-1][0] < 0.04 and g[-1][2] < -35: g.pop()
    while len(g) > 1 and g[0][1] - g[0][0] < 0.04 and g[0][2] < -35: g.pop(0)
    on, off = g[0][0], g[-1][1]
    a = [q for q in sounds(e, loud) if q[0] >= on - 1e-9 and q[1] <= off + 1e-9]
    return e, loud, on, off, a[0][0], a[-1][1]


def sounds(e, loud):
    """the audible stretches: above loud - 32 dB (dips under 20 ms belong to them) and reaching loud - 22 dB.
    A plosive's burst belongs to its word; a faint tick or breath that stands alone does not."""
    return [q for q in groups(e, loud - 32, 0.02) if q[2] > loud - 22]


def pause_cuts(e, loud, aon, aoff):
    """[(pause start, pause end, cut from, cut to)]: every inner pause over PAUSE_MIN and the part of it that is
    taken out. What stays is PAUSE_TO, or more when a weak sound (the fade of a nasal, the hiss before a vowel)
    reaches into the pause: the cut never starts before the level has fallen 40 dB under the loud level and always
    ends 20 ms before whatever leads into the next sound (its short faint rise; a lone tick up to 50 ms ahead)."""
    out = []
    strict = loud - 40
    for p, q in quiet_runs(e, loud, aon, aoff, PAUSE_MIN):
        i = int(p / HOP)
        while i * HOP < p + 0.06 and e[i] > strict: i += 1
        # What leads into the next sound and must stay: its faint rise (a soft f / h / x), when that is short; and a
        # lone tick up to 50 ms ahead of it (the release of a plosive's closure). A noise that stays level for 90 ms
        # or more up to the sound is a breath: it gets no more than KEEP_B.
        P = int(p / HOP) + 1
        j = int(q / HOP) - 1; lim = int((q - 0.09) / HOP)
        while j > lim and j > P and e[j] > strict: j -= 1
        first = int(q / HOP)
        if j > lim:
            first = j + 1
            tick = [k for k in range(max(P, first - int(0.05 / HOP)), first) if e[k] > loud - 34]
            if tick:
                k = tick[0]
                while k > P and e[k - 1] > strict and (tick[0] - k) * HOP < 0.03: k -= 1
                if (tick[0] - k) * HOP < 0.03: first = k
        c0 = max(p + KEEP_A, i * HOP + 0.005); c1 = min(q - KEEP_B, first * HOP - 0.020)
        if c1 - c0 >= 0.02: out.append((p, q, c0, c1))
    return out


def quiet_runs(e, loud, a, b, min_s=0.05):
    """stretches inside a..b where the level stays 28 dB under the loud level for at least min_s"""
    return [(p, q) for p, q in runs_below(e, loud - 28, min_s) if p > a and q < b]


def active_level(x):
    e = env_db(x); loud = np.percentile(e, 90)
    h = SR * HOP
    idx = np.nonzero(e > loud - 20)[0]
    m = np.zeros(len(x), bool)
    for i in idx: m[max(0, int(i * h - h / 2)):int(i * h + h / 2) + 1] = True
    return 10 * np.log10(np.mean(x[m] ** 2) + 1e-12)


def atempo(y, tempo, tag):
    if abs(tempo - 1.0) < 1e-4: return y.copy()
    os.makedirs(WORKDIR + "/tmp", exist_ok=True)
    a, b = f"{WORKDIR}/tmp/{tag}_in.wav", f"{WORKDIR}/tmp/{tag}_out.wav"
    write_wav(a, y)
    run("-i", a, "-af", f"atempo={tempo:.5f}", "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s24le", b)
    return read_wav(b)


def fade(y, n_in, n_out):
    y = y.copy()
    if n_in: y[:n_in] *= np.linspace(0, 1, n_in)
    if n_out: y[-n_out:] *= np.linspace(1, 0, n_out)
    return y


# ---------------------------------------------------------------------------------------------- the recogniser's words
def char_times(name, text, e, loud, aon, aoff, part=False):
    """one (start, end) per Chinese character of `text`, in the raw clip's seconds.
    The recogniser's word starts are good to about 0.05 s inside a phrase, but it hides a pause inside the word that
    follows it (or ends the word before it early). So every silent stretch of the waveform is given to one boundary
    between two characters (the nearest one by the recogniser's times; a long pause prefers a punctuation mark of the
    text), and that boundary is moved onto the waveform: the character before ends where the silence starts, the
    character after starts where it ends. part: `text` is a part of the recorded sentence (the loop take), spoken
    between aon and aoff."""
    full = REP[name]["text"]
    st = []
    for w, a, b in REP[name]["words"]:
        n = DIGITS.get(re.sub(r"\W", "", w), cjk(w))
        for i in range(n): st.append((a + (b - a) * i / n, a + (b - a) * (i + 1) / n))
    if len(st) != cjk(full): raise SystemExit(f"{name}: {len(st)} recognised characters, {cjk(full)} in the text")
    if part: k0 = cjk(full[:full.index(text)]); st = st[k0:k0 + cjk(text)]
    n = len(st)
    # punct[i] = the text has a punctuation mark between character i-1 and character i
    punct, k = set(), 0
    for ch in text:
        if re.match(r"[一-鿿]", ch): k += 1
        elif ch in "，。：；！？、" and 0 < k < n: punct.add(k)
    qs = sorted(quiet_runs(e, loud, aon, aoff, 0.05), key=lambda q: q[0] - q[1])       # longest first
    anchors = {}                                                                       # boundary -> (q0, q1)
    for q0, q1 in qs:
        long = q1 - q0 >= PAUSE_MIN
        best = None
        for i in range(1, n):
            if i in anchors: continue
            if any((j < i and a[0] > q0) or (j > i and a[0] < q0) for j, a in anchors.items()): continue   # keep the order
            d = max(0.0, q0 - st[i][0], st[i - 1][1] - q1)
            cost = d - (0.2 if long and i in punct else 0.0)
            if (cost <= 0.30 if long else d <= 0.05) and (best is None or cost < best[0]): best = (cost, i)
        if best: anchors[best[1]] = (q0, q1)
    s = [a for a, b in st]; en = [b for a, b in st]
    bounds = {0: (None, aon), n: (aoff, None)}; bounds.update(anchors)
    keys = sorted(bounds)
    for ka, kb in zip(keys, keys[1:]):
        ta, tb = bounds[ka][1], bounds[kb][0]
        inner = [st[i][0] for i in range(ka + 1, kb)]
        seq = [ta] + inner + [tb]
        ok = all(y - x >= 0.03 for x, y in zip(seq, seq[1:]))
        s[ka] = ta; en[kb - 1] = tb
        for j, i in enumerate(range(ka + 1, kb)):
            even = ta + (tb - ta) * (j + 1) / (kb - ka)
            # half the recogniser's start, half an even spread between the two silences: checked against the waveform
            # on lines 8, 16 and 19, the mean is closer than either (the recogniser runs early at the start of a clip,
            # the even spread ignores short syllables)
            v = (inner[j] + even) / 2 if ok else even
            s[i] = v; en[i - 1] = v
    return list(zip(s, en)), sorted(anchors.items())


# ---------------------------------------------------------------------------------------------- one clip
def trim_air(z):
    """first sound - AIR .. last sound + AIR of a processed piece, short fades in the air -> (clip, offset removed)"""
    _, _, on, off, _, _ = facts(z)
    i0 = max(0, int(round((on - AIR) * SR))); i1 = min(len(z), int(round((off + AIR) * SR)))
    return fade(z[i0:i1], int(0.004 * SR), int(0.012 * SR)), i0 / SR


def prep(name, text, tag, tempo=None, squeeze=True):
    """-> dict(z = processed clip with AIR at both ends, start / end = first / last audible sound in z (s),
    words = [(start, end)] per character in z, tempo, raw facts)"""
    x = decode(name); e, loud, on, off, aon, aoff = facts(x)
    n = cjk(text)
    cuts = pause_cuts(e, loud, aon, aoff) if squeeze else []
    net = (aoff - aon) - sum(c1 - c0 for _, _, c0, c1 in cuts)
    if tempo is None: tempo = min(HI, max(LO, RATE * net / n))
    edges = [on] + [v for c in cuts for v in c[2:]] + [off]
    pieces = [(edges[i], edges[i + 1]) for i in range(0, len(edges), 2)]
    XF = int(0.004 * SR)
    y = np.zeros(int(PAD * SR))
    tmap = []                                    # (raw start, raw end, start in y)
    for i, (a, b) in enumerate(pieces):
        seg = x[int(round(a * SR)):int(round(b * SR))].copy()
        if i == 0: seg[:XF] *= np.linspace(0, 1, XF)          # the take may start on the file's first sample
        if i == len(pieces) - 1: seg[-XF:] *= np.linspace(1, 0, XF)
        if i > 0:                                # 4 ms cross-fade inside the quiet of the shortened pause
            seg[:XF] *= np.linspace(0, 1, XF); tail = y[-XF:] * np.linspace(1, 0, XF)
            y = np.concatenate([y[:-XF], tail + seg[:XF], seg[XF:]])
            tmap.append((a, b, (len(y) - len(seg)) / SR))
        else:
            tmap.append((a, b, len(y) / SR)); y = np.concatenate([y, seg])
    y = np.concatenate([y, np.zeros(int(PAD * SR))])
    def to_y(t):
        for a, b, o in tmap:
            if t < a: return o
            if t <= b: return o + (t - a)
        return tmap[-1][2] + tmap[-1][1] - tmap[-1][0]
    gain = LEVEL - active_level(y)
    y = y * 10 ** (gain / 20)
    zf = atempo(y, tempo, tag)
    k = tempo                                     # atempo keeps the asked tempo (it only drops a little of the end pad)
    z, off0 = trim_air(zf)
    _, _, onz, offz, aonz, aoffz = facts(z)
    ct, snapped = char_times(name, text, e, loud, aon, aoff)
    # raw time -> time in z: through the pause cuts, the speed-up and the trim; pinned to the measured ends
    pa, pb = to_y(aon) / k - off0, to_y(aoff) / k - off0
    f = lambda t: aonz + (to_y(t) / k - off0 - pa) * (aoffz - aonz) / (pb - pa)
    words = [(f(a), f(b)) for a, b in ct]
    return dict(name=name, text=text, z=z, start=aonz, end=aoffz, words=words, tempo=tempo, k=k, gain=gain, n=n,
                raw=dict(on=on, off=off, aon=aon, aoff=aoff, loud=loud, cuts=cuts, net=net, snapped=snapped,
                         drift=(pa - aonz, pb - aoffz), len=len(x) / SR))


def prep_loop(name):
    """the loop sentence as one piece -> (line 22 clip, line 1 clip, facts). Cut inside the comma after 「至于刘邦」.
    Nothing is taken out of this take: its two commas stay as spoken (at the take's tempo)."""
    full = LJ["loop"]["record"]; first = LJ["loop"]["cut_after"]; second = full[len(first):]
    x = decode(name); e, loud, on, off, aon, aoff = facts(x)
    toks = REP[name]["words"]; nb = cjk(first)
    qs = quiet_runs(e, loud, aon, aoff, 0.05)
    bm = (toks[nb - 1][2] + toks[nb][1]) / 2
    cand = [q for q in qs if abs((q[0] + q[1]) / 2 - bm) < 0.3]
    c0, c1 = max(cand, key=lambda q: q[1] - q[0])        # the comma: the longest quiet stretch at 邦 | 他
    # 邦 ends where the level has fallen under -50 dBFS; 他 starts with its first audible stretch (see sounds())
    i = int(c0 / HOP)
    while e[i] > -50: i += 1
    g0 = i * HOP
    g1 = next(q[0] for q in sounds(e, loud) if q[0] >= c0)
    inner = [q for q in qs if q[0] > g1 and q[1] - q[0] >= PAUSE_MIN]
    net = (g0 - aon) + (aoff - g1) - sum(q - p - PAUSE_TO for p, q in inner)
    tempo = min(HI, max(LO, LOOP_RATE * net / cjk(full)))
    XF = int(0.004 * SR)
    seg = x[int(round(on * SR)):int(round(off * SR))].copy()
    seg[:XF] *= np.linspace(0, 1, XF); seg[-XF:] *= np.linspace(1, 0, XF)
    y = np.concatenate([np.zeros(int(PAD * SR)), seg, np.zeros(int(PAD * SR))])
    gain = LEVEL - active_level(y); y = y * 10 ** (gain / 20)
    zf = atempo(y, tempo, "loop")
    k = tempo
    z, off0 = trim_air(zf)
    ez, loudz, onz, offz, aonz, aoffz = facts(z)
    f0 = lambda t: (t - on + PAD) / k - off0          # raw time -> time in z, before pinning
    # the comma again, measured on the processed piece
    i = int((f0(g0) - 0.05) / HOP)
    while ez[i] > -50 + gain: i += 1               # the same level as -50 dBFS before the gain
    G0 = i * HOP
    G1 = next(q[0] for q in sounds(ez, loudz) if q[0] >= G0)
    cut = G0 + TAIL_F / FPS                       # the cut: TAIL_F frames after the last sound of 邦
    ci = int(round(cut * SR))
    # ---- the level of the two parts (the time base is not touched: only gains, changed where the take is silent)
    lv22, lv1 = active_level(z[:ci]), active_level(z[ci:])
    ga, gb = LEVEL + LOOP_OVER[22] - lv22, LEVEL + LOOP_OVER[1] - lv1
    r0, r1 = ci - int(LOOP_RAMP[0] * SR), ci - int(LOOP_RAMP[1] * SR)
    assert r0 / SR > G0 + 0.02, "the gain ramp would start inside 邦"
    gdb = np.full(len(z), gb); gdb[:r0] = ga
    gdb[r0:r1] = ga + (gb - ga) * (1 - np.cos(np.linspace(0, np.pi, r1 - r0))) / 2
    ramp_level = float(ez[int(r0 / SR / HOP):int(r1 / SR / HOP) + 1].max())
    duck = LOOP_DUCK.get(name)
    if duck:
        d0, d1, ddb = duck; XD = int(0.005 * SR)
        i0, i1 = ci + int(d0 * SR), ci + int(d1 * SR)
        if i1 / SR > G1 - 0.010: raise SystemExit(f"{name}: LOOP_DUCK would reach into the first word ({G1 - cut:.3f} s)")
        before_pk = 20 * np.log10(np.abs(z[i0:i1]).max() + 1e-12)
        sh = np.full(i1 - i0, ddb)
        sh[:XD] = ddb * (1 - np.cos(np.linspace(0, np.pi, XD))) / 2; sh[-XD:] = ddb * (1 + np.cos(np.linspace(0, np.pi, XD))) / 2
        gdb[i0:i1] += sh
    z = z * 10 ** (gdb / 20)
    level = dict(parts=(lv22, lv1), gains=(ga, gb), ramp=(r0 / SR - cut, r1 / SR - cut), ramp_level=ramp_level - gain,
                 duck=(duck, before_pk - gain) if duck else None)
    lvl = float(ez[int((cut - 0.01) / HOP):int((cut + 0.01) / HOP)].max()) - gain
    ct1, _ = char_times(name, first, e, loud, aon, g0, part=True)
    ct2, _ = char_times(name, second, e, loud, g1, aoff, part=True)
    pin = lambda a0, b0, a1, b1: (lambda t: a1 + (f0(t) - f0(a0)) * (b1 - a1) / (f0(b0) - f0(a0)))
    fa, fb = pin(aon, g0, aonz, G0), pin(g1, aoff, G1, aoffz)
    w22 = [(fa(a), fa(b)) for a, b in ct1]
    w1 = [(fb(a) - cut, fb(b) - cut) for a, b in ct2]
    raw = dict(on=on, off=off, aon=aon, aoff=aoff, loud=loud, cuts=[], net=net)
    info = dict(name=name, tempo=tempo, k=k, gain=gain, raw_gap=(g0, g1), gap=(G0, G1), cut=cut, cut_level=lvl, level=level,
                inner=[(round(p, 3), round(q, 3)) for p, q in qs], raw=raw)
    l22 = dict(name=name, text=first, z=z[:ci], start=aonz, end=G0, words=w22, tempo=tempo, k=k, gain=gain + ga, n=cjk(first), raw=raw)
    l1 = dict(name=name, text=second, z=z[ci:], start=G1 - cut, end=aoffz - cut, words=w1, tempo=tempo, k=k, gain=gain + gb, n=cjk(second), raw=raw)
    return l22, l1, info


# ---------------------------------------------------------------------------------------------- the timeline
def main():
    l22, l1, loop = prep_loop(LOOP)
    clips = {1: [l1], 22: [l22]}
    for n, tk in TAKES.items():
        tx = LINES[n - 1]["text"]
        if isinstance(tk, tuple):
            at = LINES[n - 1]["hold_before"][0]["at"]; k = tx.index(at)
            clips[n] = [prep(tk[0], tx[:k], f"l{n:02d}a"), prep(tk[1], tx[k:], f"l{n:02d}b", tempo=Q_TEMPO, squeeze=False)]
        else:
            clips[n] = [prep(tk, tx, f"l{n:02d}")]
    # Every clip is laid on the timeline by its audible edges: the silence between two lines is counted from the
    # last audible sound of one to the first audible sound of the next (the faint fade of one clip and the air of
    # the next share that silence).
    track = np.zeros(int(120 * SR)); rows = []; used = 0
    def put(c, at_start):
        """place clip c so that its first audible sound is at at_start (s) -> the clip's offset on the timeline"""
        nonlocal used
        i0 = int(round((at_start - c["start"]) * SR))
        if i0 < 0: raise SystemExit(f"{c['name']}: would start before the track")
        track[i0:i0 + len(c["z"])] += c["z"]; used = max(used, i0 + len(c["z"]))
        return i0 / SR
    prev_end = None
    for n in range(1, 23):
        L = LINES[n - 1]; cs = clips[n]
        if n == 1: start = cs[0]["start"]            # the head of the track is the take's own comma, after the cut
        elif n == 2: start = max(prev_end + GAP, LINE2_MIN_F / FPS)     # the privy shot is 78 frames
        else:
            start = prev_end + LINES[n - 2].get("hold_after", BIG.get(n, GAP))
            if n == 22:     # the track ends on the cut of the loop take: the hold nearest the asked one that makes the
                end_i = int(round((start - cs[0]["start"]) * SR)) + len(cs[0]["z"])      # track a whole number of frames
                pad = (-end_i) % SPF
                start += ((pad if pad <= SPF // 2 else pad - SPF) + END_F * SPF) / SR
        row = {"line": n, "take": "+".join(c["name"] for c in cs), "text": L["text"]}
        words, cuts, holds = [], [], []
        for i, c in enumerate(cs):
            if i > 0:
                h = L["hold_before"][i - 1]["s"]; start = row["end"] + h
                cuts.append(start); holds.append(h)
            o = put(c, start)
            if i == 0: row["start"] = o + c["start"]
            row["end"] = o + c["end"]
            words += [[ch, o + a, o + b] for ch, (a, b) in zip(strip(c["text"]), c["words"])]
        row["tempo"] = cs[0]["tempo"]; row["rate"] = cjk(L["text"]) / (row["end"] - row["start"] - sum(holds))
        if cuts: row["cuts"] = cuts; row["holds"] = holds
        row["words"] = words
        rows.append(row); prev_end = row["end"]
    track = track[:used]
    assert len(track) % SPF == 0, (len(track), len(track) % SPF)
    total_f = len(track) // SPF
    # ---- report
    print(f"rate {RATE}: track {len(track) / SR:.4f} s = {total_f} frames; loop take {LOOP}")
    print(f"loop: raw comma {loop['raw_gap'][0]:.3f}-{loop['raw_gap'][1]:.3f} = {loop['raw_gap'][1] - loop['raw_gap'][0]:.3f} s; tempo {loop['tempo']:.3f}; "
          f"in the track {loop['gap'][1] - loop['gap'][0]:.3f} s = tail {TAIL_F / FPS:.3f} + head {rows[0]['start']:.3f}; level at the cut {loop['cut_level']:.0f} dBFS (raw scale)")
    lv = loop["level"]
    print(f"loop level: as spoken 「至于刘邦」 {lv['parts'][0] - LEVEL:+.1f} dB / line 1 {lv['parts'][1] - LEVEL:+.1f} dB against the other lines; gains {lv['gains'][0]:+.2f} / {lv['gains'][1]:+.2f} dB, "
          f"changed {lv['ramp'][0] * 1000:.0f}..{lv['ramp'][1] * 1000:.0f} ms before the cut where the take is at {lv['ramp_level']:.0f} dBFS (raw scale)"
          + (f"; ticks at {lv['duck'][0][0]:.3f}-{lv['duck'][0][1]:.3f} s (peak {lv['duck'][1]:.0f} dBFS raw scale) turned down {-lv['duck'][0][2]:.0f} dB" if lv["duck"] else ""))
    gaps = [rows[i + 1]["start"] - rows[i]["end"] for i in range(len(rows) - 1)]
    print("silence after each line:", " ".join(f"{i + 1}:{g:.3f}" for i, g in enumerate(gaps)), f"| after 22 (to the loop point): {len(track) / SR - rows[-1]['end']:.3f}")
    for r in rows:
        cs = clips[r["line"]]
        f0, f1 = r["start"] * FPS, r["end"] * FPS
        print(f"{r['line']:2d} {r['take']:12s} {r['start']:7.3f}-{r['end']:7.3f} f{f0:7.1f}-{f1:7.1f} tempo {' / '.join('%.3f' % c['tempo'] for c in cs)} rate {r['rate']:.2f} "
              f"gain {' / '.join('%+.1f' % c['gain'] for c in cs)} pauses {[(round(q - p, 2), round(q - p - (c1 - c0), 2)) for c in cs for p, q, c0, c1 in c['raw']['cuts']]}"
              + (f" cuts {[round(v, 3) for v in r['cuts']]} holds {[round(v, 3) for v in r['holds']]}" if "cuts" in r else ""))
    for n, cs in clips.items():
        for c in cs:
            d = c["raw"].get("drift")
            if d and (abs(d[0]) > 0.012 or abs(d[1]) > 0.012):
                print(f"   note line {n} {c['name']}: the speed-up moved the edges by {d[0] * 1000:+.0f} / {d[1] * 1000:+.0f} ms against a plain division by the tempo")
    if "--words" in A:
        for r in rows: print(r["line"], " ".join(f"{ch}{a:.2f}" for ch, a, b in r["words"]), f"| end {r['end']:.2f}")
    if DRY: return
    # ---- one fixed gain for the whole track: toward -16 LUFS, never above -1 dBFS (true peak)
    os.makedirs(OUT, exist_ok=True)
    pre = f"{WORKDIR}/tmp/joined.wav"; os.makedirs(WORKDIR + "/tmp", exist_ok=True); write_wav(pre, track)
    def loudness(p):
        e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        e = e[e.rfind("Summary:"):]
        return float(re.search(r"I:\s+(-?[\d.]+) LUFS", e).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", e).group(1))
    I, pk = loudness(pre)
    gdb = min(-16 - I, -1 - pk)
    track = track * 10 ** (gdb / 20)
    wav = f"{OUT}/narration_v4.wav"; write_wav(wav, track)
    run("-i", wav, "-c:a", "libmp3lame", "-b:a", "256k", f"{OUT}/narration_v4.mp3")
    two = f"{WORKDIR}/tmp/twice.wav"; write_wav(two, np.concatenate([track, track]))
    run("-i", two, "-c:a", "libmp3lame", "-b:a", "256k", f"{OUT}/narration_v4_looped_twice.mp3")
    I2, pk2 = loudness(wav)
    print(f"fixed gain {gdb:+.2f} dB (was {I:.1f} LUFS, true peak {pk:.1f}); final {I2:.1f} LUFS, true peak {pk2:.1f} dBFS")
    r3 = lambda v: round(v + 1e-9, 3)
    out_rows = []
    for r in rows:
        o = {"line": r["line"], "take": r["take"], "text": r["text"], "start": r3(r["start"]), "end": r3(r["end"]),
             "tempo": round(r["tempo"], 3), "rate": round(r["rate"], 2)}
        if "cuts" in r: o["cuts"] = [r3(v) for v in r["cuts"]]; o["holds"] = [r3(v) for v in r["holds"]]
        o["words"] = [[ch, r3(a), r3(b)] for ch, a, b in r["words"]]
        out_rows.append(o)
    speech_end = (total_f - TAIL_F) / FPS
    j = {"voice": "Xiaoxi (ElevenLabs eleven_v4), request hongmen-vo-03", "script": "script_v4.md, 22 lines",
         "rate": RATE, "sample_rate": SR, "duration": round(len(track) / SR, 4), "frames": total_f, "fps": FPS,
         "lead": r3(rows[0]["start"]), "tail_f": TAIL_F, "speech_end": round(speech_end, 4),
         "loudness": f"{I2:.1f} LUFS, true peak {pk2:.1f} dBFS",
         "loop": {"take": LOOP, "cut_after": LJ["loop"]["cut_after"], "tempo": round(loop["tempo"], 3),
                  "comma_raw_s": r3(loop["raw_gap"][1] - loop["raw_gap"][0]), "comma_in_track_s": r3(loop["gap"][1] - loop["gap"][0]),
                  "tail_s": r3(TAIL_F / FPS), "head_s": r3(rows[0]["start"]),
                  "gain_db": {"line22": round(loop["level"]["gains"][0], 2), "line1": round(loop["level"]["gains"][1], 2),
                              "target_over_other_lines_db": {"line22": LOOP_OVER[22], "line1": LOOP_OVER[1]},
                              "changed_s_before_cut": list(LOOP_RAMP)},
                  "duck": ({"from": LOOP_DUCK[LOOP][0], "to": LOOP_DUCK[LOOP][1], "db": LOOP_DUCK[LOOP][2]} if LOOP in LOOP_DUCK else None),
                  "note": "the end of the track followed by its head is the take's own comma: no time was added or removed at the cut; the two parts of the take have their own gain (changed inside the comma)"},
         "gaps": {"between_lines": GAP, "before_line": BIG, "air": AIR, "pause_over": PAUSE_MIN, "pause_to": PAUSE_TO,
                  "note": "silences are counted from the last audible sound of a line to the first audible sound of the next"},
         "lines": out_rows}
    json.dump(j, open(f"{OUT}/voice_timing_v4.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("wrote", wav, f"{OUT}/narration_v4.mp3", f"{OUT}/narration_v4_looped_twice.mp3", f"{OUT}/voice_timing_v4.json")


main()
