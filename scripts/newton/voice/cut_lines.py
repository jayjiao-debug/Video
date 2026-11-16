#!/usr/bin/env python3
"""Cuts the per-line clips out of the voice farm's multi-speaker dialogue takes (one take per scene).

  python3 scripts/newton/voice/cut_lines.py <take dir> [--report report.json] [--scene-file G=dlg_G_s4242.mp3 ...]
                                         [--only G04,G05] [--lines-dir <take dir>/lines]

Each dialogue clip's voice_segments are matched to the scene's lines in scripts/newton/voice/newton_lines.json, in order.
NEWTON: lines are Chinese (ji) or English (nt, hm); a voiced character is a Chinese character or a Latin letter/digit; Whisper's
whole-clip word times drop English inside mixed clips, so the cuts use the ElevenLabs alignment (--whisper to try Whisper).
Each cut also keeps "chars": every non-bracket character with its times (spaces included), for assemble.py's word times.
The voice service's character times run short (cutting at them clipped the first or last syllable of about 30 lines),
so the cut between two lines is placed from WHISPER's word times when the take has them (request "words": true; the
script's characters are aligned with the heard ones, homophones included): it goes in the middle of the longest SILENT
stretch (10 ms frames under the scene's peak -40 dB) between the end of one line and the start of the next, searched
0.35 s wider on each side (0.6 s around the service's own times when there are no word times); with no silent
stretch, at the quietest 10 ms. Each clip then loses its leading/trailing
silence (under peak -48 dB) but keeps 0.05 s before the first sound and 0.12 s after the last (the decay), with 8 ms
fades; a silent stretch inside a line (under peak -40 dB) longer than 0.40 s is shortened to 0.40 s (10 ms crossfade). Writes <take dir>/line_cuts.json (guide spans, cuts, character times), <take dir>/line_durs.json and
<lines dir>/<id>.wav (mono, 48 kHz). The film's assemble.py then lays them out.
"""
import argparse, json, os, re, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
HOP = 480            # 10 ms
SIL_DB, TRIM_DB = -40.0, -48.0
PRE, POST, FADE = 0.05, 0.12, 0.008
MAXGAP = 0.40     # a silence inside a line longer than this is shortened to it (the service pauses long at commas/ellipses)
WIDEN = 0.6


def load(f):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()


def env_db(x):
    n = len(x) // HOP
    fr = x[: n * HOP].reshape(n, HOP)
    r = np.sqrt((fr ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(r / (r.max() + 1e-12) + 1e-12)


def cut_between(e, t0, t1):
    """the cut time in [t0, t1]: middle of the longest silent run, else the quietest frame"""
    a, b = max(0, int(t0 * 100)), min(len(e) - 1, int(t1 * 100))
    if b <= a: return (t0 + t1) / 2
    seg = e[a:b + 1]
    best, run, start = (0, None), 0, None
    for i, v in enumerate(seg):
        if v < SIL_DB:
            if run == 0: start = i
            run += 1
            if run > best[0]: best = (run, start)
        else:
            run = 0
    if best[1] is not None and best[0] >= 3:
        return (a + best[1] + best[0] / 2) / 100.0
    return (a + int(np.argmin(seg))) / 100.0


WSPAN = 0.35   # search this far around Whisper's line ends for the silence


def longest_silence(e, t0, t1):
    """NEWTON: the longest run of 10 ms frames under SIL_DB inside [t0, t1], as (start s, end s), or None"""
    a, b = max(0, int(t0 * 100)), min(len(e) - 1, int(t1 * 100))
    best, start = None, None
    for i in range(a, b + 2):
        sil = i <= b and e[i] < SIL_DB
        if sil and start is None: start = i
        if not sil and start is not None:
            if best is None or i - start > best[1] - best[0]: best = (start, i)
            start = None
    return (best[0] / 100.0, best[1] / 100.0) if best else None


def whisper_spans(words, lines):
    """each line's [start, end] in the clip from Whisper's word times (the request's "words": true), by aligning the
    script's characters with the heard characters (difflib); None when there are no word times"""
    import difflib
    if not words: return None
    hc, ht = [], []
    for w, a, b in words:
        cs = re.findall(r"[\u4e00-\u9fff]", w)
        for k, ch in enumerate(cs):
            hc.append(ch); ht.append((a + (b - a) * k / len(cs), a + (b - a) * (k + 1) / len(cs)))
    sc, owner = [], []
    for i, l in enumerate(lines):
        for ch in re.findall(r"[\u4e00-\u9fff]", l["zh"]):
            sc.append(ch); owner.append(i)
    if not hc or not sc: return None
    t = [None] * len(sc)
    sm = difflib.SequenceMatcher(None, sc, hc, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):   # same length = homophones Whisper mis-wrote
            for k in range(i2 - i1): t[i1 + k] = ht[j1 + k]
    known = [k for k in range(len(sc)) if t[k]]
    if len(known) < len(sc) * 0.6: return None
    for k in range(len(sc)):   # fill the gaps by interpolation between known neighbours
        if t[k] is None:
            p = max([q for q in known if q < k], default=None); nx = min([q for q in known if q > k], default=None)
            if p is None: t[k] = (t[nx][0], t[nx][0])
            elif nx is None: t[k] = (t[p][1], t[p][1])
            else:
                f = (k - p) / (nx - p); m = t[p][1] + (t[nx][0] - t[p][1]) * f; t[k] = (m, m)
    spans = []
    for i in range(len(lines)):
        ks = [k for k in range(len(sc)) if owner[k] == i]
        spans.append((t[ks[0]][0], t[ks[-1]][1]) if ks else None)
    for i in range(len(spans)):   # a line with no Chinese characters: between its neighbours
        if spans[i] is None:
            a = spans[i - 1][1] if i else 0.0; b = next((x[0] for x in spans[i + 1:] if x), a + 0.5); spans[i] = (a, b)
    return spans


def squeeze(y, e, removed=None):
    """shortens every silent run (10 ms frames under SIL_DB) longer than MAXGAP to MAXGAP, keeping its two ends;
    NEWTON: appends each removed span (seconds from the clip start, before removal) to `removed`"""
    keep, i, n, m = [], 0, len(e), int(MAXGAP * 100)
    cuts = []
    while i < n:
        if e[i] < SIL_DB:
            j = i
            while j < n and e[j] < SIL_DB: j += 1
            if j - i > m and i > 0 and j < n:
                cuts.append((i + m // 2, j - (m - m // 2)))   # drop the middle of the run
            i = j
        else:
            i += 1
    if removed is not None: removed.extend((a * HOP / SR, b * HOP / SR) for a, b in cuts)
    if not cuts: return y
    out, pos, xf = [], 0, int(0.01 * SR)
    for a, b in cuts:
        A, B = a * HOP, b * HOP
        out.append(y[pos:A]); pos = B
    out.append(y[pos:])
    z = out[0]
    for part in out[1:]:
        if len(z) > xf and len(part) > xf:
            r = np.linspace(0, 1, xf)
            z = np.concatenate([z[:-xf], z[-xf:] * (1 - r) + part[:xf] * r, part[xf:]])
        else:
            z = np.concatenate([z, part])
    return z


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("take")
    ap.add_argument("--report", default=None)
    ap.add_argument("--scene-file", action="append", default=[], help="S=file.mp3: use this clip of the report for scene S")
    ap.add_argument("--only", default="", help="comma-separated line ids to write (default all)")
    ap.add_argument("--lines-dir", default=None)
    ap.add_argument("--lines", default=os.path.join(HERE, "newton_lines.json"))
    ap.add_argument("--whisper", action="store_true")
    ap.add_argument("--prefix", default="v4_", help="clip name prefix; the scene is the letter mapped from S1..S7")
    a = ap.parse_args()
    rep = json.load(open(a.report or os.path.join(a.take, "report.json")))
    L = json.load(open(a.lines))["lines"]
    byscene = {}
    for l in L: byscene.setdefault(l["scene"], []).append(l)
    pick = dict(x.split("=", 1) for x in a.scene_file)
    only = set(filter(None, a.only.split(",")))
    out_dir = a.lines_dir or os.path.join(a.take, "lines")
    os.makedirs(out_dir, exist_ok=True)
    cuts, durs = [], {}
    for c in rep["clips"]:
        if c.get("type") != "dialogue" or "alignment" not in c: continue
        fname = os.path.basename(c.get("file") or c["name"] + ".mp3")
        if pick:
            sc = next((s for s, f in pick.items() if os.path.basename(f) == fname), None)
            if sc is None: continue
        else:
            if not c["name"].startswith(a.prefix): continue
            sc = "ABCDEFG"[int(c["name"][len(a.prefix):].split("_")[0][1:]) - 1]
        x = load(os.path.join(a.take, fname)); e = env_db(x); dur = len(x) / SR
        al = c["alignment"]
        ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
        guide = []
        for g, l in zip(c["voice_segments"], byscene[sc]):
            inb, voiced, allc = False, [], []
            for i in range(g["character_start_index"], g["character_end_index"]):
                if ch[i] == "[": inb = True
                elif ch[i] == "]": inb = False
                elif not inb:
                    allc.append(i)
                    if re.match(r"[一-鿿A-Za-z0-9]", ch[i]): voiced.append(i)
            s0, s1 = g["start_time_seconds"], g["end_time_seconds"]
            v0 = st[voiced[0]] if voiced else s0
            v1 = en[voiced[-1]] if voiced else s1
            guide.append((l, s0, s1, v0, v1, [[ch[i], round(st[i], 3), round(en[i], 3)] for i in allc]))
        n = len(guide)
        spans = whisper_spans(c.get("words"), [g[0] for g in guide]) if a.whisper else None   # [(t0, t1)] per line from Whisper, or None
        if spans: print(f"{fname}: line spans from Whisper's word times")
        bounds = [0.0]
        for i in range(n - 1):
            if spans:
                v1, v0n = spans[i][1], spans[i + 1][0]
                lo, hi = min(v1, v0n) - WSPAN, max(v1, v0n) + WSPAN
                lo = max(lo, spans[i][0] + 0.1); hi = min(hi, spans[i + 1][1] - 0.05)
            else:
                v1 = guide[i][4]; v0n = guide[i + 1][3]
                # NEWTON: first look for a real silence (>= 80 ms) right between the two lines' aligned edges: the wide
                # search picked the pause after a short opener (好， / 诶？) and gave the opener to the line before
                n0, n1 = min(v1, v0n) - 0.12, max(v1, v0n) + 0.08
                run = longest_silence(e, n0, n1)
                if run and run[1] - run[0] >= 0.08:
                    bounds.append((run[0] + run[1]) / 2); continue
                lo, hi = min(v1, v0n) - WIDEN, max(v1, v0n) + WIDEN
                lo = max(lo, guide[i][3] + 0.15); hi = min(hi, guide[i + 1][4] - 0.05)
            bounds.append(cut_between(e, lo, hi))
        bounds.append(dur)
        for i, (l, s0, s1, v0, v1, chars) in enumerate(guide):
            t0, t1 = bounds[i], bounds[i + 1]
            a0, a1 = int(t0 * 100), max(int(t0 * 100) + 1, int(t1 * 100))
            loud = np.where(e[a0:a1] > TRIM_DB)[0]
            if len(loud):
                k0 = max(t0, (a0 + loud[0]) / 100.0 - PRE); k1 = min(t1, (a0 + loud[-1] + 1) / 100.0 + POST)
            else:
                k0, k1 = t0, t1
            cut = {"id": l["id"], "scene": sc, "file": fname, "seg": [s0, s1], "guide": [round(v0, 3), round(v1, 3)],
                   "cut": [round(t0, 3), round(t1, 3)], "kept": [round(k0, 3), round(k1, 3)], "chars": chars,
                   "edge_db": [round(float(e[min(len(e) - 1, int(k0 * 100))]), 1), round(float(e[max(0, int(k1 * 100) - 1)]), 1)]}
            cuts.append(cut)
            if only and l["id"] not in only: continue
            y = x[int(k0 * SR): int(k1 * SR)].copy()
            rem = []
            y = squeeze(y, e[int(k0 * 100): int(k1 * 100)], rem).astype(np.float32)
            if rem:   # NEWTON: move the character times after each removed silence back by its length
                def shift(t):
                    d = 0.0
                    for ra, rb in rem:
                        if t - k0 >= rb: d += rb - ra
                        elif t - k0 > ra: d += (t - k0) - ra
                    return round(t - d, 3)
                cut["chars"] = [[c_, shift(a_), shift(b_)] for c_, a_, b_ in cut["chars"]]
                cut["squeezed"] = [[round(ra, 3), round(rb, 3)] for ra, rb in rem]
            f = min(int(FADE * SR), len(y) // 4)
            if f > 0:
                y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
            out = os.path.join(out_dir, l["id"] + ".wav")
            p = subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                                "-c:a", "pcm_s16le", out], input=y.tobytes(), check=True)
            durs[l["id"]] = round(len(y) / SR, 3)
            print(f"{l['id']} {fname} cut {t0:.2f}-{t1:.2f} kept {k0:.2f}-{k1:.2f} ({durs[l['id']]:.2f} s) edges {cut['edge_db']} guide {v0:.2f}-{v1:.2f}")
    json.dump(cuts, open(os.path.join(a.take, "line_cuts.json"), "w"), ensure_ascii=False)
    json.dump(durs, open(os.path.join(a.take, "line_durs.json"), "w"))


if __name__ == "__main__":
    main()
