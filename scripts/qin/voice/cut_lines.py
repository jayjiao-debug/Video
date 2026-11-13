#!/usr/bin/env python3
"""Cuts the per-line clips out of the voice farm's multi-speaker dialogue takes (one take per scene).

  python3 scripts/qin/voice/cut_lines.py <take dir> [--report report.json] [--scene-file G=dlg_G_s4243.mp3] [--only G04,G05]
                                         [--lines-dir <take dir>/lines]

The take dir holds the farm's report.json and the dialogue mp3s. Each dialogue clip's voice_segments are matched to
the scene's lines in scripts/qin/voice/qin_lines.json, in order. A line's slice is its voiced span from the
character alignment (start -0.12 s, end +0.2 s), or the whole segment for a line with a non-verbal tag or a single
voiced character; leading and trailing silence under -42 dB is trimmed. Writes <take dir>/line_cuts.json,
<take dir>/line_durs.json and <lines dir>/<id>.wav (mono, 48 kHz). The film's assemble.py then lays them out.
"""
import argparse, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
NV = re.compile(r"laugh|clears|strain|grunt|hiss|sigh|breath")
TRIM = "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05"


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("take")
    ap.add_argument("--report", default=None)
    ap.add_argument("--scene-file", action="append", default=[], help="S=file.mp3: use this clip of the report for scene S")
    ap.add_argument("--only", default="", help="comma-separated line ids to write (default all)")
    ap.add_argument("--lines-dir", default=None)
    ap.add_argument("--lines", default=os.path.join(HERE, "qin_lines.json"))
    a = ap.parse_args()
    rep = json.load(open(a.report or os.path.join(a.take, "report.json")))
    L = json.load(open(a.lines))["lines"]
    byscene = {}
    for l in L:
        byscene.setdefault(l["scene"], []).append(l)
    pick = dict(x.split("=", 1) for x in a.scene_file)
    only = set(filter(None, a.only.split(",")))
    out_dir = a.lines_dir or os.path.join(a.take, "lines")
    os.makedirs(out_dir, exist_ok=True)
    cuts, durs = [], {}
    for c in rep["clips"]:
        if c.get("type") != "dialogue":
            continue
        fname = os.path.basename(c.get("file") or c["name"] + ".mp3")
        if pick:
            sc = next((s for s, f in pick.items() if os.path.basename(f) == fname), None)
            if sc is None:
                continue
        else:
            sc = c["name"][-1]
        al = c["alignment"]
        ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
        for g, l in zip(c["voice_segments"], byscene[sc]):
            cs, ce = g["character_start_index"], g["character_end_index"]
            inb, voiced = False, []
            for i in range(cs, ce):
                x = ch[i]
                if x == "[":
                    inb = True
                elif x == "]":
                    inb = False
                elif not inb and re.match(r"[一-鿿]", x):
                    voiced.append(i)
            s0, s1 = g["start_time_seconds"], g["end_time_seconds"]
            v0 = st[voiced[0]] if voiced else s0
            v1 = en[voiced[-1]] if voiced else s1
            cut = {"id": l["id"], "scene": sc, "file": fname, "seg": [s0, s1], "voiced": [round(v0, 3), round(v1, 3)],
                   "chars": [[ch[i], round(st[i], 3), round(en[i], 3)] for i in voiced]}
            cuts.append(cut)
            if only and l["id"] not in only:
                continue
            tag = " ".join(re.findall(r"\[([^\]]*)\]", l["tts"]))
            n = len(voiced)
            t0 = s0 if (NV.search(tag) or n <= 1) else max(s0, v0 - 0.12)
            t1 = s1 if n <= 2 else min(s1, v1 + 0.2)
            out = os.path.join(out_dir, l["id"] + ".wav")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}", "-i", os.path.join(a.take, fname),
                            "-af", f"{TRIM},areverse,{TRIM},areverse", "-ac", "1", "-ar", "48000", out], check=True)
            durs[l["id"]] = round(dur(out), 3)
            print(l["id"], fname, f"{t0:.2f}-{t1:.2f}", durs[l["id"]], "s", "".join(x[0] for x in cut["chars"]))
    json.dump(cuts, open(os.path.join(a.take, "line_cuts.json"), "w"), ensure_ascii=False)
    json.dump(durs, open(os.path.join(a.take, "line_durs.json"), "w"))


if __name__ == "__main__":
    main()
