#!/usr/bin/env python3
"""采访月老的一天: the voice lines as a LIST OF CUTS, so the voice track can be rebuilt anywhere (the Mac studio) from the
voice farm's public takes with every line exactly the length the picture was timed to.

  takes.py plan <out takes.json> <run dir> [...] --fit <prep dir> ID,ID,...   (here: records what prep_lines.py and
        bin/fit_takes.py did: per line its take, the spans kept, the pause cuts, the tempo, the exact length)
  takes.py render <takes.json> <runs root> <out lines dir>                    (anywhere: numpy + ffmpeg)
  takes.py fetch <takes.json> <runs root>                                     (git fetch the farm branches named in it and
        write each take under <runs root>/<branch>/: run from a clone of jayjiao-debug/video)
A line is: decode its take (48 kHz mono) -> keep its spans (8 ms fades at each span's edges, as prep_lines.py) -> for a
fitted line: cut its pause spans (10 ms fades), tempo (ffmpeg atempo), pad or trim to its exact sample count, an 8 ms
fade-out (as fit_takes.py). The character times (line_cuts) are the committed scripts/yuelao/voice/line_cuts.json."""
import json, os, subprocess, sys
import numpy as np
SR = 48000; HOP = 480
PRE, POST, FADE, MAXSIL = 0.05, 0.12, 0.008, 0.50          # prep_lines.py
DROP = {"B08": [[1.20, 2.72]]}
MINP, XF = 0.2, 0.01                                        # fit_takes.py

def load(f):
    return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]), np.float32).copy()
def save(y, f):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", f], input=y.astype(np.float32).tobytes(), check=True)

def keep_spans(x, drops):
    """prep_lines.py's trim: the spans of the raw take that are kept"""
    n = len(x) // HOP
    db = 20 * np.log10(np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12)); pk = db.max()
    loud = np.where(db > pk - 48)[0]
    k0 = max(0.0, loud[0] * HOP / SR - PRE); k1 = min(len(x) / SR, (loud[-1] + 1) * HOP / SR + POST)
    quiet = db < pk - 40; i = 0; removed = []
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            a, b = i * HOP / SR, j * HOP / SR
            if a > k0 and b < k1 and b - a > MAXSIL: removed.append([a + MAXSIL / 2, b - MAXSIL / 2])
            i = j
        else: i += 1
    removed = sorted(removed + [list(d) for d in drops]); merged = []
    for a, b in removed:
        if merged and a <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], b)
        else: merged.append([a, b])
    keep = []; t = k0
    for a, b in merged: keep.append([t, a]); t = b
    keep.append([t, k1])
    return keep

def apply_keep(x, keep):
    parts = []
    for a, b in keep:
        p = x[int(a * SR): int(b * SR)].copy(); f = int(FADE * SR)
        if len(p) > 2 * f: p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
        parts.append(p)
    return np.concatenate(parts)

def apply_cuts(x, cuts):
    if not cuts: return x
    parts = []; t = 0.0; f = int(XF * SR)
    for a, b in cuts:
        p = x[int(t * SR): int(a * SR)].copy()
        if len(p) > 2 * f: p[-f:] *= np.linspace(1, 0, f)
        if parts and len(p) > 2 * f: p[:f] *= np.linspace(0, 1, f)
        parts.append(p); t = b
    p = x[int(t * SR):].copy()
    if len(p) > 2 * f: p[:f] *= np.linspace(0, 1, f)
    parts.append(p); return np.concatenate(parts)

def tempo(x, k, tmp):
    save(x, tmp)
    return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", tmp, "-af", "atempo=%.5f" % k, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]), np.float32).copy()

def render_line(op, raw, tmp="/tmp/takes_tmp.wav"):
    y = apply_keep(raw, op["keep"])
    fit = op.get("fit")
    if fit:
        # prep_lines.py wrote the kept take as 16-bit wav before fit_takes.py read it: round the same way
        y = (np.clip(np.round(y.astype(np.float64) * 32768), -32768, 32767) / 32768).astype(np.float32) if fit.get("q16", True) else y
        y = apply_cuts(y, fit.get("cuts", []))
        if fit.get("tempo"): y = tempo(y, fit["tempo"], tmp)
        N = fit["samples"]
        if len(y) < N: y = np.concatenate([y, np.zeros(N - len(y), np.float32)])
        y = y[:N].copy(); f = int(0.008 * SR); y[-f:] *= np.linspace(1, 0, f)
    return y

def main():
    mode = sys.argv[1]
    if mode == "plan":
        out = sys.argv[2]; args = sys.argv[3:]; fi = args.index("--fit"); runs = args[:fi]; prep = args[fi + 1]; fit_ids = args[fi + 2].split(",")
        ops = {}
        for run in runs:
            rep = json.load(open(os.path.join(run, "report.json")))
            branch = "vo-" + rep["id"]
            for c in rep["clips"]:
                if c.get("status") != 200 or not os.path.exists(os.path.join(run, c["file"])): continue
                lid = c["name"].split("_")[0]
                x = load(os.path.join(run, c["file"]))
                ops[lid] = {"id": lid, "branch": branch, "file": c.get("src_file", c["file"]), "keep": keep_spans(x, DROP.get(lid, []) if run == runs[0] else []), "run": os.path.basename(run.rstrip("/"))}
        for lid in fit_ids:
            fc = json.load(open(os.path.join(prep, "fit.json")))[lid]
            ops[lid]["fit"] = fc
        json.dump({"sr": SR, "lines": [ops[k] for k in sorted(ops)]}, open(out, "w"), ensure_ascii=False, indent=0)
        print(len(ops), "lines planned,", len(fit_ids), "fitted")
    elif mode == "fetch":
        T = json.load(open(sys.argv[2])); root = sys.argv[3]
        for b in sorted({l["branch"] for l in T["lines"]}):
            subprocess.run(["git", "fetch", "-q", "origin", f"refs/heads/{b}:refs/remotes/origin/{b}"], check=True)
            d = os.path.join(root, b); os.makedirs(d, exist_ok=True)
            for l in T["lines"]:
                if l["branch"] == b:
                    with open(os.path.join(d, l["file"]), "wb") as fh: fh.write(subprocess.check_output(["git", "show", f"origin/{b}:{l['file']}"]))
        print("fetched", len(T["lines"]), "takes")
    elif mode == "render":
        T = json.load(open(sys.argv[2])); root = sys.argv[3]; out = sys.argv[4]; os.makedirs(out, exist_ok=True)
        for l in T["lines"]:
            y = render_line(l, load(os.path.join(root, l["branch"], l["file"])))
            save(y, os.path.join(out, l["id"] + ".wav"))
        print("rendered", len(T["lines"]), "lines into", out)

if __name__ == "__main__":
    main()
