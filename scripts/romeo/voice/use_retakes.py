#!/usr/bin/env python3
"""Put single-line retakes in place of lines cut from the scene takes.

  python3 scripts/romeo/voice/use_retakes.py <take dir> <retake dir> A01=rt_A01_s2584 B06=rt_B06_s2584 ...

Each retake is a one-line dialogue clip of the retake run (its report.json in <retake dir>). The clip is trimmed the way
cut_lines.py trims a line (leading / trailing silence under peak -48 dB, 0.05 s kept before and 0.12 s after, long
silences inside squeezed to 0.40 s, 8 ms fades), written over <take dir>/lines/<id>.wav, and the line's entry in
<take dir>/line_cuts.json takes the retake's character times (for the captions' word times) and names the retake.
"""
import argparse, importlib.util, json, os, re, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
spec = importlib.util.spec_from_file_location("cut_lines", os.path.join(REPO, "scripts/kit/day/voice/cut_lines.py"))
CL = importlib.util.module_from_spec(spec); spec.loader.exec_module(CL)

ap = argparse.ArgumentParser()
ap.add_argument("take"); ap.add_argument("retakes"); ap.add_argument("pick", nargs="+")
a = ap.parse_args()
rep = json.load(open(os.path.join(a.retakes, "report.json")))
clips = {c["name"]: c for c in rep["clips"]}
cuts = json.load(open(os.path.join(a.take, "line_cuts.json")))
durs = json.load(open(os.path.join(a.take, "line_durs.json")))
byid = {c["id"]: c for c in cuts}
for p in a.pick:
    lid, name = p.split("=")
    c = clips[name]
    fn = os.path.join(a.retakes, c.get("file") or name + ".mp3")
    x = CL.load(fn); e = CL.env_db(x); dur = len(x) / CL.SR
    al = c["alignment"]; ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    inb, chars = False, []
    for i, cc in enumerate(ch):
        if cc == "[": inb = True
        elif cc == "]": inb = False
        elif not inb: chars.append([cc, round(st[i], 3), round(en[i], 3)])
    while chars and chars[0][0] == " ": chars.pop(0)
    loud = np.where(e > CL.TRIM_DB)[0]
    k0, k1 = (max(0.0, loud[0] / 100.0 - CL.PRE), min(dur, (loud[-1] + 1) / 100.0 + CL.POST)) if len(loud) else (0.0, dur)
    y = x[int(k0 * CL.SR): int(k1 * CL.SR)].copy(); rem = []
    y = CL.squeeze(y, e[int(k0 * 100): int(k1 * 100)], rem).astype(np.float32)
    f = min(int(CL.FADE * CL.SR), len(y) // 4)
    if f > 0: y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(CL.SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le",
                    os.path.join(a.take, "lines", lid + ".wav")], input=y.tobytes(), check=True)
    if rem:
        def shift(t):
            d = 0.0
            for ra, rb in rem:
                if t - k0 >= rb: d += rb - ra
                elif t - k0 > ra: d += (t - k0) - ra
            return round(t - d, 3)
        chars = [[cc, shift(s0), shift(s1)] for cc, s0, s1 in chars]
    entry = byid[lid]
    entry.update({"file": os.path.relpath(fn, a.take), "seg": [0, dur], "guide": [chars[0][1] if chars else k0, chars[-1][2] if chars else k1],
                  "cut": [0.0, round(dur, 3)], "kept": [round(k0, 3), round(k1, 3)], "chars": chars, "retake": name})
    entry.pop("squeezed", None)
    if rem: entry["squeezed"] = [[round(ra, 3), round(rb, 3)] for ra, rb in rem]
    durs[lid] = round(len(y) / CL.SR, 3)
    print(f"{lid} <- {name}: kept {k0:.2f}-{k1:.2f} ({durs[lid]:.2f} s)")
json.dump(cuts, open(os.path.join(a.take, "line_cuts.json"), "w"), ensure_ascii=False)
json.dump(durs, open(os.path.join(a.take, "line_durs.json"), "w"))
