#!/usr/bin/env python3
"""fit_en.py <clips dir> <report.json> <out narration.wav> <out timing.json> [line=take ...] [line@tmax ...]
            [--script ..] [--captions ..] [--slots ..] [--frames 2107] [--fps 30] [--film wanbi] [--lang en]
            [--hold 13] [--prefix x] [--takes abc] [--all 1] [--level 0.6] [--phase 200] [--tmin 0.97] [--tmax 1.15]

Wanbi's English narration, fitted to the picture. A copy of the kit's scripts/kit/lang/fit_lang.py (the recipe:
scripts/kit/lang/README.md) WITHOUT the loop: this film does not loop (BUILD_PLAN section 6, kit request 6), so there is
no loop take, no line written round the end of the track and no seam; the defaults are Wanbi's paths. Also reads
Wanbi's captions.ts rows (["A", from, to, "text", line, k, end, [character frames], rows?]).
The picture is timed to the Chinese narration: its beats sit on the first frames of the Chinese caption groups
(--captions), and --script gives one English group per Chinese group. For every line:
  1. the take (clips dir/<prefix><nn><take>.mp3) and where Whisper heard each word (report.json, "words"). Qin and
     Zhao are sent to the voice respelt (script_en.json "say": Chin, Jow), with as many words as the written ones, so
     word k is word k in both;
  2. pauses longer than 0.10 s are cut to 0.07 s, the breath after the last word is cut off, the word times follow;
  3. the take is cut at the group boundaries (inside the pause where there is one, else at the quietest point between
     the two words);
  4. every group gets its own tempo (atempo) and a pause may grow where the take had one, so that each group starts as
     near as possible to the first frame of its Chinese window and the line ends inside its slot. The tempos of a line
     are kept near each other and inside --tmin .. --tmax. A group whose caption is all gold (【Nobody】: a beat lands
     on it) counts three times.
The slots: a line starts where the Chinese line starts (voice_timing.json) and may run to 0.08 s before the next
Chinese line starts; the --hold lines (default 13: the beat after 「秦王在演」 before 「他也演」) end where the Chinese ones
end; the last line ends where the Chinese one ends (the tail of the film stays silent).
Writes the narration (mono, 44.1 kHz, 24 bit, exactly the film's frames) and the timing json for gen_en.py and the
sound mix: per line its take, tempos, the group starts, the caption chunks' [start, end] and the words [word, s, e]
(film seconds). Prints, per line, the take, the tempos and how far each group starts from its window.
The take of a line: the one named on the command line (13=b), else, of the takes in --takes that exist, the one with
the smaller score (fit, plus a charge for speed-up and for words that were not heard). A take letter that
script_en.json lists under a line's "alt" is another wording of that line."""
import json, os, re, subprocess, sys, difflib
import numpy as np
from scipy.optimize import minimize

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "../../.."))
DEFAULTS = {"script": os.path.join(HERE, "script_en.json"), "captions": os.path.join(ROOT, "src/videos/wanbi/captions.ts"),
            "slots": "/home/user/wanbi_work/voice/zh_v1/voice_timing.json", "frames": "2107", "fps": "30",
            "film": "wanbi", "lang": "en", "hold": "13", "takes": "abc"}
for k, v in DEFAULTS.items():
    if "--" + k not in sys.argv: sys.argv += ["--" + k, v]
opt = {}
av = sys.argv[1:]
for i, a in enumerate(av):
    if a.startswith("--"): opt[a[2:]] = av[i + 1] if i + 1 < len(av) else ""
vals = {i + 1 for i, a in enumerate(av) if a.startswith("--")}
args = [a for i, a in enumerate(av) if i not in vals and not a.startswith("--") and not re.fullmatch(r"\d+=\w+|\d+@[\d.]+", a)]
for k in ("script", "captions", "slots", "frames"):
    if not opt.get(k): raise SystemExit(f"fit_en.py: --{k} is required\n" + __doc__)
SR, FPS, FRAMES = 44100, int(opt.get("fps", 30)), int(opt["frames"])
TOTAL_S = FRAMES / FPS; TOTAL = FRAMES * SR // FPS
FILM, LANG = opt.get("film", "film"), opt.get("lang", "en")
picks = {int(a.split("=")[0]): a.split("=")[1] for a in av if re.fullmatch(r"\d+=\w+", a)}
tmax_of = {int(a.split("@")[0]): float(a.split("@")[1]) for a in av if re.fullmatch(r"\d+@[\d.]+", a)}   # 8@1.18 = line 8 may go to 1.18
CLIPS, REPORT, OUT_WAV, OUT_JSON = args[:4]
PREFIX = opt.get("prefix", "x"); TAKES = opt.get("takes", "ab")
TMIN, TMAX = float(opt.get("tmin", 0.97)), float(opt.get("tmax", 1.15))
SLOTS = opt["slots"]
W_START, W_EVEN, W_STEP, W_STEP_P = float(opt.get("wstart", 25)), float(opt.get("weven", 40)), float(opt.get("wstep", 60)), float(opt.get("wstepp", 25)); W_FAST = float(opt.get("wfast", 12)); W_KEY = float(opt.get("wkey", 3)); LEVEL = float(opt.get("level", 0.6)); PHASE = float(opt.get("phase", 200))
HOLD_AFTER = {int(x) for x in opt.get("hold", "").split(",") if x.strip()}; LINE_GAP = 0.08

words_of = lambda t: re.sub(r"[^a-z0-9]+", " ", re.sub("[【】'’]", "", t).lower()).split()
script = json.load(open(opt["script"], encoding="utf8"))
SAY = script.get("say", {})
def say(t):
    for k, v in SAY.items(): t = t.replace(k, v)
    return t
for k, v in SAY.items(): assert len(words_of(k)) == len(words_of(v)), (k, v)
zh = [(int(a), int(b)) for _, a, b, _ in re.findall(r'\["([A-Za-z0-9]+)", (\d+), (\d+), "(.*?)", \d+, \d+, \d+[,\]]', open(opt["captions"], encoding="utf8").read())]
slots = json.load(open(SLOTS, encoding="utf8"))["lines"]
report = {c["name"]: c for c in json.load(open(REPORT, encoding="utf8"))["clips"]}
NL = len(script["lines"])
assert len(zh) == sum(len(l["groups"]) for l in script["lines"]), (len(zh), "caption groups in captions.ts vs groups in the script")
assert len(slots) == NL, (len(slots), NL)
gi_of = lambda n: sum(len(l["groups"]) for l in script["lines"][: n - 1])

def slot(n):
    S = slots[n - 1]["start"]
    E = slots[n - 1]["end"] if n in HOLD_AFTER or n == NL else slots[n]["start"] - LINE_GAP
    return S, E

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
    words that were not heard). Words Whisper spelt another way take the time of what was heard in their place when it
    sounds alike (the letters match by 60 % or more); anything else counts as not heard and sits between its
    neighbours."""
    hw = [w for h in heard for w in (words_of(h[0]) or ["?"])]
    ht = [(h[1], h[2]) for h in heard for _ in (words_of(h[0]) or ["?"])]
    out = [None] * len(expect); bad = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, expect, hw, autojunk=False).get_opcodes():
        ne, nh = i2 - i1, j2 - j1
        if tag == "equal":
            for k in range(ne): out[i1 + k] = ht[j1 + k]
        elif tag == "replace" and (ne == nh or difflib.SequenceMatcher(None, "".join(expect[i1:i2]), "".join(hw[j1:j2])).ratio() >= 0.6):
            for k in range(ne):        # (as many words heard as expected: a respelt name heard as other words, same places)
                ja, jb = j1 + k * nh // ne, max(j1 + k * nh // ne, j1 + (k + 1) * nh // ne - 1)
                out[i1 + k] = (ht[ja][0], ht[jb][1])
        elif ne: bad += expect[i1:i2]
    return out, bad

def groups_of(n, take):
    ln = script["lines"][n - 1]; G = ln.get("alt", {}).get(take, ln["groups"]); assert len(G) == len(ln["groups"]), (n, take); return G

def fit_line(n, take):
    name = f"{PREFIX}{n:02d}{take}"; G = groups_of(n, take)
    win = zh[gi_of(n): gi_of(n) + len(G)]; S, E = slot(n)
    rec = report.get(name)
    if not rec or "words" not in rec: return None
    T = [S] + [w[0] / FPS for w in win[1:]] + [E]           # where each group should start; the last entry: the slot's end
    key = [len(g["cap"]) == 1 and bool(re.fullmatch(r"[“\"]?【[^】]*】[!?.”\"]*", g["cap"][0])) for g in G]
    gw = [words_of(say(g["t"])) for g in G]; expect = [w for g in gw for w in g]
    times, missing = align(expect, rec["words"])
    x = load(os.path.join(CLIPS, name + ".mp3")); y, tmap, pauses = squeeze(x)
    dur = len(y) / SR
    wt = [None if t is None else (tmap(t[0]), tmap(t[1])) for t in times]
    for i in range(len(wt)):
        if wt[i] is None:
            prev = next((wt[k][1] for k in range(i - 1, -1, -1) if wt[k]), 0.0); nxt = next((wt[k][0] for k in range(i + 1, len(wt)) if wt[k]), dur)
            wt[i] = (prev, max(prev, nxt))
    hop = SR // 200; db = level_db(y, hop)
    cuts, paused, quiet, loudcuts, k = [0.0], [], [], [], 0
    for g in gw[:-1]:
        k += len(g); a, b = wt[k - 1][1], wt[k][0]; lo, hi = min(a, b) - 0.06, max(a, b) + 0.06
        ps = [p for p in pauses if lo - 0.04 <= p <= hi + 0.04]
        if ps: c = min(ps, key=lambda p: abs(p - (a + b) / 2)) + 0.035; paused.append(True); quiet.append(True)
        else:
            i0, i1 = max(0, int(lo * 200)), min(len(db), int(hi * 200) + 1)
            c = (i0 + int(np.argmin(db[i0:i1])) + 0.5) / 200; paused.append(False); quiet.append(bool(db[i0:i1].min() < -35))
            if not quiet[-1]: loudcuts.append((len(paused), round(float(db[i0:i1].min()), 1)))
        cuts.append(min(max(c, cuts[-1] + 0.03), dur))
    cuts.append(dur)
    d = np.diff(cuts); m = len(d)
    tmax = tmax_of.get(n, TMAX)
    u0 = min(tmax, max(TMIN, dur / (E - S))); wk = np.array([W_KEY if kk else 1.0 for kk in key[1:]])
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
    bounds = [(TMIN, tmax)] * m + [((0.0, 0.3) if p else (0.0, 0.12) if q else (0.0, 0.0)) for p, q in zip(paused, quiet)]
    r = minimize(cost, np.array([u0] * m + [0.0] * (m - 1)), bounds=bounds, method="L-BFGS-B")
    t, g = r.x[:m], r.x[m:]; st, end = place(r.x)
    pieces, pos, i = [], 0, 0
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
    def film(tau):
        i = max(0, min(m - 1, int(np.searchsorted(cuts, tau, side="right")) - 1)); return st[i] + (tau - cuts[i]) / t[i]
    groups, k, wl = [], 0, []
    for gi_, g_ in enumerate(G):
        chunks = []
        for c in g_["cap"]:
            nw = len(words_of(c)); a, b = wt[k][0], wt[k + nw - 1][1]
            chunks.append([round(film(max(a, cuts[gi_]) if c is g_["cap"][0] else a), 3), round(film(b), 3)])
            k += nw
        chunks[0][0] = round(st[gi_], 3)
        groups.append({"start": round(float(st[gi_]), 3), "tempo": round(float(t[gi_]), 3), "chunks": chunks})
    for (w, (a, b)) in zip([w for g_ in G for w in words_of(g_["t"])], wt): wl.append([w, round(film(a), 3), round(film(b), 3)])
    off = [round(float(st[i] - T[i]) * FPS, 1) for i in range(1, m)]
    return {"n": n, "take": take, "name": name, "cost": float(r.fun) + (5 if missing else 0), "missing": missing, "heard": rec.get("heard", ""), "pieces": pieces, "start": S, "end": round(float(S + audio_len / SR), 3),
            "slot_end": E, "tempo": [round(float(v), 2) for v in t], "gaps": [round(float(v), 2) for v in g], "paused": paused, "off": off, "groups": groups, "words": wl, "u0": round(u0, 2), "loudcuts": loudcuts}

track = np.zeros(TOTAL); lines_out = {}; worst = []; chosen = []
order = [l["n"] for l in script["lines"]]
for n in order:
    cands = [fit_line(n, tk) for tk in ([picks[n]] if n in picks else TAKES)]
    cands = [c for c in cands if c]
    if not cands: raise SystemExit(f"line {n}: no take")
    for c in cands: c["score"] = c["cost"] + W_FAST * (float(np.mean(c["tempo"])) - 1) ** 2
    best = min(cands, key=lambda c: c["score"]); chosen.append(best)
    over = best["end"] - best["slot_end"]
    print(f"L{n:>4} take {best['take']} ({'/'.join(c['take'] + ':' + format(c['score'], '.2f') for c in cands)})  tempo {best['tempo']} (even {best['u0']})  pauses+ {best['gaps']}  starts off by {best['off']} f  ends {over * FPS:+.1f} f vs the slot"
          + (f"  NOT HEARD: {best['missing']} | heard: {best['heard']}" if best["missing"] else "")
          + (f"  no dip, not cut (boundary, dB): {best['loudcuts']}" if best["loudcuts"] else ""))
    if "all" in opt:
        for c in cands: print(f"      {c['take']}: score {c['score']:.2f}  even {c['u0']}  tempo {c['tempo']}  off {c['off']} f" + (f"  NOT HEARD {c['missing']}" if c["missing"] else ""))
    worst += [abs(o) for o in best["off"]]
    end = max(best["end"], best["slot_end"]) if best["end"] < best["slot_end"] + 0.05 else best["end"]
    lines_out[n] = {"n": n, "line": n, "take": best["take"], "start": best["start"], "end": end, "speech_end": best["end"], "tempo": best["tempo"], "groups": best["groups"], "words": best["words"]}
# Levelling: every piece moves --level (0.6) of the way to the median level, by at most 4 dB down and 3 dB up.
levels = [p[2] for c in chosen for p in c["pieces"] if p[2] is not None]; med = float(np.median(levels)); moved = []
for c in chosen:
    a = int(round(c["start"] * SR))
    for off, seg, lv in c["pieces"]:
        g = 0.0 if lv is None else float(np.clip(-LEVEL * (lv - med), -4.0, 3.0)); moved.append(g)
        seg = seg * 10 ** (g / 20); p0 = a + off
        if p0 + len(seg) > TOTAL: raise SystemExit(f"line {c['n']} runs past the end of the film")
        track[p0: p0 + len(seg)] += seg
print(f"levels of the pieces: median {med:.1f} dB, from {min(levels):.1f} to {max(levels):.1f}; gains from {min(moved):+.1f} to {max(moved):+.1f} dB (--level {LEVEL})")
# Phase rotation (four all-pass filters at --phase Hz): no level change at any frequency, the tall one-sided peaks of
# this voice come down. The film does not loop: the track starts from silence and ends in 0.8 s of silence, so it is
# filtered once (with half a second of silence after it for the filters' tail, cut off again).
rot = ["-af", ",".join([f"allpass=f={PHASE:g}:t=q:w=0.7"] * 4)] if PHASE > 0 else []
padded = np.concatenate([track, np.zeros(SR // 2)])
out = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", *rot, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], input=padded.astype(np.float32).tobytes(), check=True, capture_output=True).stdout
track = np.frombuffer(out, dtype=np.float32).astype(np.float64)[:TOTAL]
assert len(track) == TOTAL
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s24le", OUT_WAV], input=track.astype(np.float32).tobytes(), check=True)
json.dump({"film": FILM, "lang": LANG, "frames": FRAMES, "fps": FPS, "duration": round(TOTAL_S, 4), "sample_rate": SR,
           "lines": [lines_out[k] for k in sorted(lines_out)]}, open(OUT_JSON, "w", encoding="utf8"), indent=1)
w = np.array(worst); peak = np.abs(track).max()
print(f"line {NL} speech ends {lines_out[NL]['speech_end']:.3f} s (film {TOTAL_S:.3f} s); line 1 starts speaking {lines_out[1]['words'][0][1]:.3f} s")
print(f"group starts vs their windows: mean {w.mean():.1f} f, 90 % within {np.percentile(w, 90):.1f} f, worst {w.max():.1f} f; track peak {20 * np.log10(peak):.1f} dBFS; {TOTAL} samples; {OUT_WAV}, {OUT_JSON}")
