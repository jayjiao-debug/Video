#!/usr/bin/env python3
"""Assemble the 完璧归赵 narration (script v2, 23 lines, no loop) from the wanbi-vo-01 takes.
Adapted from scripts/hongmen/voice/assemble_hongmen.py (same clip processing; the loop sentence is gone).

  python3 assemble_wanbi.py --raw <clips+report.json> --out <dir> --work <scratch> [--rate 5.5] [--dry] [--words] [n=take ...]

Per chosen take: trim to the first / last sound with 30 ms of air, shorten every inner pause over 0.10 s to 0.07 s,
bring the clip to one speech level, speed it up with ffmpeg atempo toward RATE characters a second (1.0 .. 1.36),
lay the clips on one 44.1 kHz mono timeline: LEAD s before line 1, GAP between lines (BIG before a new beat),
TAIL s after line 23, padded to a whole number of 30 fps frames.
Writes narration.wav / .mp3 and voice_timing.json ("words" = [character, start, end] per Chinese character)."""
import json, os, re, subprocess, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../kit/voice"))
import audio as hmaudio
from audio import SR, HOP, cjk, strip, run, decode, read_wav, write_wav, env_db, runs_below

A = sys.argv[1:]
opt = lambda k, d: A[A.index(k) + 1] if k in A else d
RATE = float(opt("--rate", 5.5))
OUT = opt("--out", ".")
RAWDIR = opt("--raw", hmaudio.RAW)
WORKDIR = opt("--work", hmaudio.WORK)
hmaudio.configure(RAWDIR, WORKDIR)
DRY = "--dry" in A
LINES_JSON = opt("--lines", os.path.join(os.path.dirname(os.path.abspath(__file__)), "wanbi_lines.json"))
FPS = 30
SPF = SR // FPS
LO, HI = 1.0, 1.36
AIR = 0.030
GAP = 0.08
LEAD = 0.10                     # the first word is heard on frame 3: the subtitle is on screen from frame 0
TAIL = 0.80                     # after the last word: the punchline lands, the end card has a beat
PAUSE_MIN, PAUSE_TO = 0.10, 0.07
KEEP_A, KEEP_B = 0.025, 0.045
PAD = 0.15
LEVEL = -20.0
# a breath before a new beat / place: 3 the offer, 7 Qin's hall, 13 "秦王在演", 16 the escape, 17 five days later, 22 the bill
BIG = {3: 0.14, 7: 0.14, 13: 0.14, 14: 0.12, 16: 0.14, 17: 0.14, 19: 0.12, 22: 0.18}
# Rule: the recogniser's words must be the line (homophones allowed), then the shorter take, then the cleaner edges.
# Out: z05b (派 heard as 他), z06b (完整 heard as 完全), z20b (觑 heard as 聚 jù), z23b (连城 heard as 连成),
# z04b (兵 heard as 宾), z10p0 (怒髮衝冠 heard as 怒罚充管).
TAKES = {1: "z01a", 2: "z02b", 3: "z03a", 4: "z04a", 5: "z05a", 6: "z06a", 7: "z07b", 8: "z08b", 9: "z09b",
         10: "z10a", 11: "z11b", 12: "z12b", 13: "z13a", 14: "z14a", 15: "z15a", 16: "z16a", 17: "z17b",
         18: "z18b", 19: "z19b", 20: "z20a", 21: "z21b", 22: "z22a", 23: "z23a"}
for a in A:
    if re.fullmatch(r"\d+=\w+", a): k, v = a.split("="); TAKES[int(k)] = v

REP = {c["name"]: c for c in json.load(open(RAWDIR + "/report.json", encoding="utf8"))["clips"]}
LJ = json.load(open(LINES_JSON, encoding="utf8"))
LINES = LJ["lines"]
DIGITS = {"15": 2, "20": 2, "10": 1}


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



# ---------------------------------------------------------------------------------------------- the timeline
def main():
    clips = {n: [prep(tk, LINES[n - 1]["text"], f"l{n:02d}")] for n, tk in TAKES.items()}
    track = np.zeros(int(150 * SR)); rows = []; used = 0
    def put(c, at_start):
        nonlocal used
        i0 = int(round((at_start - c["start"]) * SR))
        if i0 < 0: raise SystemExit(f"{c['name']}: would start before the track")
        track[i0:i0 + len(c["z"])] += c["z"]; used = max(used, i0 + len(c["z"]))
        return i0 / SR
    prev_end = None
    N = len(LINES)
    for n in range(1, N + 1):
        L = LINES[n - 1]; c = clips[n][0]
        start = max(LEAD, c["start"]) if n == 1 else prev_end + L.get("gap_before", BIG.get(n, GAP))
        o = put(c, start)
        row = {"line": n, "take": c["name"], "text": L["text"], "start": o + c["start"], "end": o + c["end"]}
        row["words"] = [[ch, o + a, o + b] for ch, (a, b) in zip(strip(c["text"]), c["words"])]
        row["tempo"] = c["tempo"]; row["rate"] = cjk(L["text"]) / (row["end"] - row["start"])
        rows.append(row); prev_end = row["end"]
    end_i = int(round((prev_end + TAIL) * SR)); end_i += (-end_i) % SPF
    used = max(used, end_i); track = track[:end_i]
    total_f = len(track) // SPF
    print(f"rate {RATE}: track {len(track) / SR:.3f} s = {total_f} frames")
    for r in rows:
        c = clips[r["line"]][0]
        print(f"{r['line']:2d} {r['take']:6s} {r['start']:7.3f}-{r['end']:7.3f} f{r['start'] * FPS:6.1f}-{r['end'] * FPS:6.1f} "
              f"tempo {c['tempo']:.3f} rate {r['rate']:.2f} gain {c['gain']:+.1f} pauses {[(round(q - p, 2)) for p, q, c0, c1 in c['raw']['cuts']]}")
        d = c["raw"].get("drift")
        if d and (abs(d[0]) > 0.012 or abs(d[1]) > 0.012):
            print(f"   note: the speed-up moved the edges by {d[0] * 1000:+.0f} / {d[1] * 1000:+.0f} ms")
    if "--words" in A:
        for r in rows: print(r["line"], " ".join(f"{ch}{a:.2f}" for ch, a, b in r["words"]))
    if DRY: return
    os.makedirs(OUT, exist_ok=True); os.makedirs(WORKDIR + "/tmp", exist_ok=True)
    pre = f"{WORKDIR}/tmp/joined.wav"; write_wav(pre, track)
    def loudness(p):
        e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        e = e[e.rfind("Summary:"):]
        return float(re.search(r"I:\s+(-?[\d.]+) LUFS", e).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", e).group(1))
    I, pk = loudness(pre)
    gdb = min(-16 - I, -1 - pk)
    track = track * 10 ** (gdb / 20)
    wav = f"{OUT}/narration.wav"; write_wav(wav, track)
    run("-i", wav, "-c:a", "libmp3lame", "-b:a", "256k", f"{OUT}/narration.mp3")
    I2, pk2 = loudness(wav)
    print(f"fixed gain {gdb:+.2f} dB; final {I2:.1f} LUFS, true peak {pk2:.1f} dBFS")
    r3 = lambda v: round(v + 1e-9, 3)
    out_rows = [{"line": r["line"], "take": r["take"], "text": r["text"], "start": r3(r["start"]), "end": r3(r["end"]),
                 "tempo": round(r["tempo"], 3), "rate": round(r["rate"], 2),
                 "words": [[ch, r3(a), r3(b)] for ch, a, b in r["words"]]} for r in rows]
    j = {"voice": "Xiaoxi (ElevenLabs eleven_v4), request wanbi-vo-01", "script": LJ["script"], "rate": RATE,
         "sample_rate": SR, "duration": round(len(track) / SR, 4), "frames": total_f, "fps": FPS,
         "lead": r3(rows[0]["start"]), "tail": TAIL, "loudness": f"{I2:.1f} LUFS, true peak {pk2:.1f} dBFS",
         "gaps": {"between_lines": GAP, "before_line": BIG, "air": AIR, "pause_over": PAUSE_MIN, "pause_to": PAUSE_TO},
         "lines": out_rows}
    json.dump(j, open(f"{OUT}/voice_timing.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("wrote", wav, f"{OUT}/narration.mp3", f"{OUT}/voice_timing.json")


main()
