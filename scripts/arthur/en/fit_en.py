#!/usr/bin/env python3
"""fit_en.py <clips dir> <report.json> <out narration.wav> <out en_timing.json> [line=take ...] [--prefix x] [--takes abc] [--all 1] [--level 0.6] [--phase 200]

Fits the English narration to the picture, which is timed to the Chinese one. The picture's beats sit on the frames of
the Chinese caption groups (src/videos/arthur/captions.ts); script_en.json gives one English group per Chinese group.
For every line:
  1. the take (clips dir/<prefix><nn><take>.mp3) and where Whisper heard each word (report.json, "words");
  2. pauses longer than 0.10 s are cut to 0.07 s (the same edit as the Chinese takes), the breath after the last word
     is cut off, the word times follow;
  3. the take is cut at the group boundaries (inside the pause where there is one, else at the quietest point between
     the two words);
  4. every group gets its own tempo (atempo), and a pause may grow where the take had one, so that each group starts
     as near as possible to the first frame of its window and the line ends inside its slot. The tempos of a line are
     kept near each other (most of all across a boundary with no pause) and inside --tmin .. --tmax. A group whose
     caption is all gold ("Stuck", "Pull two": a stamp or the pull counter lands on it) counts three times.
Writes the narration (mono, 44.1 kHz, every line at its slot) and en_timing.json for gen_en.py (where each caption
chunk starts and ends). Prints, per line, the take, the tempos and how far each group starts from its window.
The take of a line: the one named on the command line (13=c), else, of the takes in --takes that exist, the one with
the smaller score: how far its groups start from their windows and how uneven its tempos are, plus a charge for how
much it has to be sped up and for words that were not heard. A take letter that script_en.json lists under a line's
"alt" is another wording of that line. --all 1 prints every take's fit."""
import json, os, re, subprocess, sys, difflib
import numpy as np
from scipy.optimize import minimize

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
SR, FPS = 44100, 30
args = [a for a in sys.argv[1:] if not a.startswith("--") and "=" not in a]
opt = {}
av = sys.argv[1:]
for i, a in enumerate(av):
    if a.startswith("--"): opt[a[2:]] = av[i + 1] if i + 1 < len(av) else ""
picks = {int(a.split("=")[0]): a.split("=")[1] for a in av if re.fullmatch(r"\d+=\w+", a)}
CLIPS, REPORT, OUT_WAV, OUT_JSON = args[:4]
PREFIX = opt.get("prefix", "x"); TAKES = opt.get("takes", "abc")
TMIN, TMAX = float(opt.get("tmin", 1.0)), float(opt.get("tmax", 1.38))
W_START, W_EVEN, W_STEP, W_STEP_P = float(opt.get("wstart", 25)), float(opt.get("weven", 40)), float(opt.get("wstep", 60)), float(opt.get("wstepp", 25)); W_FAST = float(opt.get("wfast", 12)); W_KEY = float(opt.get("wkey", 3)); LEVEL = float(opt.get("level", 0.6)); PHASE = float(opt.get("phase", 200))

NUM = {"1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "10": "ten", "k": "kay"}
# words for matching: lower case, no apostrophes (Whisper writes "Lord's" for "Lords"), digits as words ("10" for "ten"), "K" for "Kay"
words_of = lambda t: [NUM.get(w, w) for w in re.sub(r"[^a-z0-9]+", " ", re.sub("[【】'’]", "", t).lower()).split()]
script = json.load(open(os.path.join(HERE, "script_en.json"), encoding="utf8"))
zh = [(int(a), int(b)) for _, a, b, _ in re.findall(r'\["([A-E])", (\d+), (\d+), "(.*?)"\],', open(os.path.join(ROOT, "src/videos/arthur/captions.ts"), encoding="utf8").read())]
slots = json.load(open(os.path.join(ROOT, "scripts/arthur/voice/voice_timing_v1.json"), encoding="utf8"))["lines"]
report = {c["name"]: c for c in json.load(open(REPORT, encoding="utf8"))["clips"]}

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def atempo(x, t):
    if abs(t - 1) < 0.004 or len(x) < 0.03 * SR: return x
    out = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", "-af", f"atempo={t:.5f}", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         input=x.astype(np.float32).tobytes(), check=True, capture_output=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(np.float64)

def level_db(x, hop):
    n = len(x) // hop
    return 10 * np.log10(np.maximum((x[: n * hop].reshape(n, hop) ** 2).mean(1), 1e-12))

def squeeze(x):
    """cut the silence at both ends to 0.02 s and every pause longer than 0.10 s to 0.07 s.
    returns the new samples, a function old time -> new time, and the pauses that were cut (new time of each)"""
    hop = SR // 100; db = level_db(x, hop); sil = db < -38
    keep = np.ones(len(db), dtype=bool); cuts = []
    i = 0; n = len(db)
    while i < n:
        if not sil[i]: i += 1; continue
        j = i
        while j < n and sil[j]: j += 1
        first, last = i == 0, j == n
        if first: keep[: max(0, j - 2)] = False
        elif last: keep[i + 2:] = False
        elif j - i > 10: keep[i + 4: j - 3] = False; cuts.append(i + 4)
        i = j
    loud = np.nonzero(db >= -30)[0]      # the end of the take: what follows the last sound above -30 dB (a breath, the
    if len(loud): keep[loud[-1] + 6:] = False      # room) goes, 0.05 s after it; the last group is faded out over 0.04 s
    idx = np.nonzero(keep)[0]
    y = np.concatenate([x[k * hop: (k + 1) * hop] for k in idx]) if len(idx) else x[:0]
    newpos = np.cumsum(keep) - keep            # new frame index of every old frame (for removed frames: the next kept one)
    f_map = lambda t: float(np.interp(t * 100, np.arange(n + 1), np.append(newpos, keep.sum()))) / 100
    return y, f_map, [float(newpos[c]) / 100 for c in cuts]

def align(expect, heard):
    """expect: list of words; heard: [[word, start, end]]. returns ([(start, end)] per expected word, the expected
    words that were not heard). Words Whisper spelt another way ("d'Artur", "Face is" for "faces") take the time of
    what was heard in their place when it sounds alike (the letters match by 60 % or more); anything else counts as
    not heard and sits between its neighbours."""
    hw = [w for h in heard for w in (words_of(h[0]) or ["?"])]
    ht = [(h[1], h[2]) for h in heard for _ in (words_of(h[0]) or ["?"])]
    out = [None] * len(expect); bad = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, expect, hw, autojunk=False).get_opcodes():
        ne, nh = i2 - i1, j2 - j1
        if tag == "equal":
            for k in range(ne): out[i1 + k] = ht[j1 + k]
        elif tag == "replace" and difflib.SequenceMatcher(None, "".join(expect[i1:i2]), "".join(hw[j1:j2])).ratio() >= 0.6:
            for k in range(ne):
                ja, jb = j1 + k * nh // ne, max(j1 + k * nh // ne, j1 + (k + 1) * nh // ne - 1)
                out[i1 + k] = (ht[ja][0], ht[jb][1])
        elif ne: bad += expect[i1:i2]
    return out, bad

def fit_line(n, take):
    ln = script["lines"][n - 1]; name = f"{PREFIX}{n:02d}{take}"; rec = report.get(name)
    G = ln.get("alt", {}).get(take, ln["groups"])          # another wording of the line has its own take letter
    if not rec or "words" not in rec: return None
    gi0 = sum(len(l["groups"]) for l in script["lines"][: n - 1])
    win = zh[gi0: gi0 + len(G)]; assert len(G) == len(ln["groups"]), (n, take)
    S, E = slots[n - 1]["start"], slots[n - 1]["end"]
    T = [S] + [w[0] / FPS for w in win[1:]] + [E]           # where each group should start; the last entry: the slot's end
    key = [len(g["cap"]) == 1 and bool(re.fullmatch(r"[“\"]?【[^】]*】[!?.”\"]*", g["cap"][0])) for g in G]   # a stamp or the pull counter lands on it
    gw = [words_of(g["t"]) for g in G]; expect = [w for g in gw for w in g]
    times, missing = align(expect, rec["words"])
    x = load(os.path.join(CLIPS, name + ".mp3")); y, tmap, pauses = squeeze(x)
    dur = len(y) / SR
    # word times in the squeezed take; a word that was not heard sits between its neighbours
    wt = [None if t is None else (tmap(t[0]), tmap(t[1])) for t in times]
    for i in range(len(wt)):
        if wt[i] is None:
            prev = next((wt[k][1] for k in range(i - 1, -1, -1) if wt[k]), 0.0); nxt = next((wt[k][0] for k in range(i + 1, len(wt)) if wt[k]), dur)
            wt[i] = (prev, max(prev, nxt))
    # group boundaries in the squeezed take
    hop = SR // 200; db = level_db(y, hop)
    cuts, paused, quiet, loudcuts, k = [0.0], [], [], [], 0
    for g in gw[:-1]:
        k += len(g); a, b = wt[k - 1][1], wt[k][0]; lo, hi = min(a, b) - 0.06, max(a, b) + 0.06
        ps = [p for p in pauses if lo - 0.04 <= p <= hi + 0.04]
        if ps: c = min(ps, key=lambda p: abs(p - (a + b) / 2)) + 0.035; paused.append(True); quiet.append(True)
        else:
            i0, i1 = max(0, int(lo * 200)), min(len(db), int(hi * 200) + 1)
            c = (i0 + int(np.argmin(db[i0:i1])) + 0.5) / 200; paused.append(False); quiet.append(bool(db[i0:i1].min() < -35))
            if not quiet[-1]: loudcuts.append((len(paused), round(float(db[i0:i1].min()), 1)))     # the voice does not drop here
        cuts.append(min(max(c, cuts[-1] + 0.03), dur))
    cuts.append(dur)
    d = np.diff(cuts); m = len(d)
    # tempos t (m) and added pauses g (m - 1): starts as near the windows as possible
    u0 = min(TMAX, max(TMIN, dur / (E - S))); wk = np.array([W_KEY if kk else 1.0 for kk in key[1:]])
    def place(v):
        t, g = v[:m], v[m:]; st = [S]
        for i in range(m - 1): st.append(st[-1] + d[i] / t[i] + g[i])
        return np.array(st), st[-1] + d[-1] / t[-1]
    def cost(v):
        t, g = v[:m], v[m:]; st, end = place(v)
        c = W_START * (wk * (st[1:] - np.array(T[1:m])) ** 2).sum() if m > 1 else 0.0
        c += W_EVEN * ((t - u0) ** 2).sum()
        for i in range(m - 1): c += (W_STEP_P if paused[i] else W_STEP if quiet[i] else 5000) * (t[i] - t[i + 1]) ** 2
        c += 2.0 * (g ** 2).sum() + 400 * max(0.0, end - E) ** 2
        return c
    # a pause may grow by 0.3 s where the take had one, by 0.12 s where the cut sits in a dip between two words
    bounds = [(TMIN, TMAX)] * m + [((0.0, 0.3) if p else (0.0, 0.12) if q else (0.0, 0.0)) for p, q in zip(paused, quiet)]
    r = minimize(cost, np.array([u0] * m + [0.0] * (m - 1)), bounds=bounds, method="L-BFGS-B")
    t, g = r.x[:m], r.x[m:]; st, end = place(r.x)
    # build the audio. Two groups whose boundary has no dip in the voice stay in one piece (their tempos are the same)
    pieces, pos, i = [], 0, 0          # (offset in the line, samples, level): the level is the rms of what is not silence
    while i < m:
        j = i
        while j < m - 1 and not quiet[j]: j += 1
        seg = atempo(y[int(cuts[i] * SR): int(cuts[j + 1] * SR)], float(np.mean(t[i: j + 1]))).copy()
        f = min(len(seg) // 2, int(0.004 * SR)); seg[:f] *= np.linspace(0, 1, f)
        f = min(len(seg) // 2, int((0.04 if j == m - 1 else 0.004) * SR)); seg[-f:] *= np.linspace(1, 0, f)
        want = int(round((st[i] - S) * SR)); pad = max(0, want - pos)
        pw = level_db(seg, SR // 100); act = pw > -38
        pieces.append((pos + pad, seg, float(10 * np.log10((10 ** (pw[act] / 10)).mean())) if act.any() else None))
        pos += pad + len(seg); i = j + 1
    audio_len = pos
    # where each caption chunk is spoken (film seconds)
    def film(tau):
        i = max(0, min(m - 1, int(np.searchsorted(cuts, tau, side="right")) - 1)); return st[i] + (tau - cuts[i]) / t[i]
    groups, k = [], 0
    for gi_, g_ in enumerate(G):
        chunks = []
        for c in g_["cap"]:
            nw = len(words_of(c)); a, b = wt[k][0], wt[k + nw - 1][1]; k += nw
            chunks.append([round(film(max(a, cuts[gi_]) if c is g_["cap"][0] else a), 3), round(film(b), 3)])
        chunks[0][0] = round(st[gi_], 3)
        groups.append({"start": round(float(st[gi_]), 3), "tempo": round(float(t[gi_]), 3), "chunks": chunks})
    off = [round(float(st[i] - T[i]) * FPS, 1) for i in range(1, m)]
    return {"n": n, "take": take, "name": name, "cost": float(r.fun) + (5 if missing else 0), "missing": missing, "heard": rec.get("heard", ""), "pieces": pieces, "start": S, "end": round(float(S + audio_len / SR), 3),
            "slot_end": E, "tempo": [round(float(v), 2) for v in t], "gaps": [round(float(v), 2) for v in g], "paused": paused, "off": off, "groups": groups, "u0": round(u0, 2), "loudcuts": loudcuts}

total = int(round((slots[-1]["end"] + 0.5) * SR)); track = np.zeros(total); lines_out = []; worst = []; chosen = []
for ln in script["lines"]:
    n = ln["n"]
    cands = [fit_line(n, tk) for tk in ([picks[n]] if n in picks else TAKES)]
    cands = [c for c in cands if c]
    if not cands: raise SystemExit(f"line {n}: no take")
    for c in cands: c["score"] = c["cost"] + W_FAST * (float(np.mean(c["tempo"])) - 1) ** 2      # of two takes that fit, the slower-spoken one
    best = min(cands, key=lambda c: c["score"])
    chosen.append(best)
    lines_out.append({"n": n, "take": best["take"], "start": best["start"], "end": max(best["end"], best["slot_end"]) if best["end"] < best["slot_end"] + 0.05 else best["end"], "speech_end": best["end"], "tempo": best["tempo"], "groups": best["groups"]})
    over = best["end"] - best["slot_end"]
    print(f"L{n:2d} take {best['take']} ({'/'.join(c['take'] + ':' + format(c['score'], '.2f') for c in cands)})  tempo {best['tempo']} (even {best['u0']})  pauses+ {best['gaps']}  starts off by {best['off']} f  ends {over * FPS:+.1f} f vs the slot"
          + (f"  NOT HEARD: {best['missing']} | heard: {best['heard']}" if best["missing"] else "")
          + (f"  no dip, not cut (boundary, dB): {best['loudcuts']}" if best["loudcuts"] else ""))
    if "all" in opt:
        for c in cands: print(f"      {c['take']}: score {c['score']:.2f}  even {c['u0']}  tempo {c['tempo']}  off {c['off']} f" + (f"  NOT HEARD {c['missing']}" if c["missing"] else ""))
    worst += [abs(o) for o in best["off"]]
# Levelling: the voice shouts the characters' lines and drops on asides (9 dB between the loudest and the quietest
# group). Every piece moves --level (0.6) of the way to the median level, by at most 4 dB down and 3 dB up: one fixed
# gain per piece, set in the silence between pieces, so the limiter that follows has less to hold down.
levels = [p[2] for c in chosen for p in c["pieces"] if p[2] is not None]; med = float(np.median(levels)); moved = []
for c in chosen:
    a = int(round(c["start"] * SR))
    for off, seg, lv in c["pieces"]:
        g = 0.0 if lv is None else float(np.clip(-LEVEL * (lv - med), -4.0, 3.0)); moved.append(g)
        seg = seg * 10 ** (g / 20); track[a + off: a + off + len(seg)] += seg[: total - a - off]
print(f"levels of the pieces: median {med:.1f} dB, from {min(levels):.1f} to {max(levels):.1f}; gains from {min(moved):+.1f} to {max(moved):+.1f} dB (--level {LEVEL})")
peak = np.abs(track).max()
# Phase rotation: four all-pass filters (--phase 200 Hz, 0 = off). They change no level at any frequency, only when the
# parts of each voice pulse arrive, which takes the tall one-sided peaks off this voice: the limiter in sfx_mix.py then
# has as little to do at -15 LUFS as it had on the Chinese narration at -14.5.
rot = ["-af", ",".join([f"allpass=f={PHASE:g}:t=q:w=0.7"] * 4)] if PHASE > 0 else []
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", *rot, "-c:a", "pcm_s24le", OUT_WAV], input=track.astype(np.float32).tobytes(), check=True)
json.dump({"lines": lines_out}, open(OUT_JSON, "w", encoding="utf8"), indent=1)
w = np.array(worst)
print(f"group starts vs their windows: mean {w.mean():.1f} f, 90 % within {np.percentile(w, 90):.1f} f, worst {w.max():.1f} f; track peak {20 * np.log10(peak):.1f} dBFS; {OUT_WAV}, {OUT_JSON}")
