#!/usr/bin/env python3
"""Re-cut chosen lines of a dialogue take at hand-picked bounds, after scripts/kit/day/voice/cut_lines.py.

  python3 scripts/romeo/voice/fix_cuts.py <take dir> B04=6.94-7.45 B05=7.45-9.30 [--lines-dir <take dir>/lines]

cut_lines.py places the cut between two lines from the voice service's character times; for a very short English line
inside a scene take ("Who?" in scene B) those times can sit before the sound itself, and the cut lands in the wrong gap.
This writes <id>.wav for each named line from the given bounds (seconds in the take), with cut_lines.py's own trim,
long-silence squeeze and fades, and updates <take dir>/line_cuts.json and line_durs.json to match.
"""
import argparse, importlib.util, json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
spec = importlib.util.spec_from_file_location("cut_lines", os.path.join(REPO, "scripts/kit/day/voice/cut_lines.py"))
CL = importlib.util.module_from_spec(spec); spec.loader.exec_module(CL)

ap = argparse.ArgumentParser()
ap.add_argument("take"); ap.add_argument("bounds", nargs="+"); ap.add_argument("--lines-dir", default=None)
a = ap.parse_args()
cuts = json.load(open(os.path.join(a.take, "line_cuts.json")))
durs = json.load(open(os.path.join(a.take, "line_durs.json")))
out_dir = a.lines_dir or os.path.join(a.take, "lines")
byid = {c["id"]: c for c in cuts}
cache = {}
for b in a.bounds:
    lid, span = b.split("="); t0, t1 = map(float, span.split("-"))
    c = byid[lid]
    if c["file"] not in cache:
        x = CL.load(os.path.join(a.take, c["file"])); cache[c["file"]] = (x, CL.env_db(x))
    x, e = cache[c["file"]]
    a0, a1 = int(t0 * 100), max(int(t0 * 100) + 1, int(t1 * 100))
    loud = np.where(e[a0:a1] > CL.TRIM_DB)[0]
    k0, k1 = (max(t0, (a0 + loud[0]) / 100.0 - CL.PRE), min(t1, (a0 + loud[-1] + 1) / 100.0 + CL.POST)) if len(loud) else (t0, t1)
    y = x[int(k0 * CL.SR): int(k1 * CL.SR)].copy(); rem = []
    y = CL.squeeze(y, e[int(k0 * 100): int(k1 * 100)], rem).astype(np.float32)
    f = min(int(CL.FADE * CL.SR), len(y) // 4)
    if f > 0: y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(CL.SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le",
                    os.path.join(out_dir, lid + ".wav")], input=y.tobytes(), check=True)
    # the character times: the service's own run squeezed into [k0, k1] when they fall outside it (they ran early)
    ch = c["chars"]
    if ch:
        s0, s1 = ch[0][1], ch[-1][2]
        if s0 < k0 or s1 > k1:
            v0, v1 = k0 + CL.PRE, max(k0 + CL.PRE + 0.05, k1 - CL.POST)
            sc = (v1 - v0) / max(1e-3, s1 - s0)
            ch = [[cc, round(v0 + (st - s0) * sc, 3), round(v0 + (en - s0) * sc, 3)] for cc, st, en in ch]
    c.update({"cut": [t0, t1], "kept": [round(k0, 3), round(k1, 3)], "chars": ch, "fixed": True})
    if rem: c["squeezed"] = [[round(ra, 3), round(rb, 3)] for ra, rb in rem]
    durs[lid] = round(len(y) / CL.SR, 3)
    print(f"{lid} cut {t0:.2f}-{t1:.2f} kept {k0:.2f}-{k1:.2f} ({durs[lid]:.2f} s)")
json.dump(cuts, open(os.path.join(a.take, "line_cuts.json"), "w"), ensure_ascii=False)
json.dump(durs, open(os.path.join(a.take, "line_durs.json"), "w"))
