#!/usr/bin/env python3
"""expand_cues.py <cues.json> <beats.json> <clips dir> <out cues.json>: the Wanbi cue sheet -> the kit mixer's plain
cue sheet (scripts/kit/sound/mix.py, cuesheet.py). Two additions to the kit's format, both resolved here:

  "series": {"n": 15, "step": 1, "st_step": 1, "db_step": 0}
      one cue line = n cues, the k-th (k = 0 .. n-1) at off + k * step frames (rounded to a whole frame), pitched st + k * st_step semitones,
      trimmed db + k * db_step (the 15 ticks of the cities, the 22 crowns, the 15 pips going down). step may be a
      fraction of a frame.
  THE FILM DOES NOT LOOP. The kit mixer places every sound on a ring as long as the film (Hongmen loops): a sound that
      runs over the last frame would come back at frame 0. Here every cue that could run past the film's end (its
      frame + its clip's length, after max_s / from_s / pitch) gets "to": "FILM.end" (it stops ON the last sample,
      with a fade of out_f frames, default 6); a cue that already has a "to" past the end is clamped the same way.
      build.sh then refuses a mix whose log still shows a sound running over the loop point.
Prints one line per expansion and per clamp."""
import json, os, subprocess, sys
sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../kit/sound"))
import cuesheet

if len(sys.argv) < 5: raise SystemExit(__doc__)
cues_p, beats_p, clips, out_p = sys.argv[1:5]
sheet = json.load(open(cues_p, encoding="utf8")); beats = json.load(open(beats_p, encoding="utf8"))
TOTAL, FPS = beats["total"], beats["fps"]
_len = {}
def clip_s(name):
    """the length (s) of a sound's clip as the mixer will play it (max_s, from_s, the sound's own pitch)"""
    s = sheet["sounds"][name]; p = os.path.join(clips, s["file"])
    if not os.path.exists(p): return None
    if p not in _len:
        _len[p] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True, check=True).stdout.strip())
    d = _len[p] - (s.get("from_s") or 0)
    if s.get("max_s"): d = min(d, s["max_s"])
    return d / 2 ** ((s.get("st") or 0) / 12)

out = []
for c in sheet["cues"]:
    if c.get("on") is False: out.append(c); continue
    ser = c.get("series")
    if not ser: out.append(c); continue
    n, step = int(ser["n"]), float(ser.get("step", 1)); sst, sdb = float(ser.get("st_step", 0)), float(ser.get("db_step", 0))
    base_off = cuesheet._off(c.get("off"), sheet.get("vars", {}))
    for k in range(n):
        d = {kk: vv for kk, vv in c.items() if kk != "series"}
        d["off"] = int(round(base_off + k * step))          # whole frames: the kit mixer and its tables count in frames
        if sst or c.get("st"): d["st"] = round((c.get("st") or 0) + k * sst, 3)
        if sdb or c.get("db"): d["db"] = round((c.get("db") or 0) + k * sdb, 3)
        d["note"] = f"{c.get('note', '')} [{k + 1}/{n}]"
        out.append(d)
    print(f"series: {c['s']} at {c['at']} x {n}, every {step:g} frames" + (f", {sst:+g} st each" if sst else "") + (f", {sdb:+g} dB each" if sdb else ""))
# the end of the film: nothing may run over it (it would wrap to frame 0)
clamped = 0
for c in out:
    if c.get("on") is False: continue
    f = cuesheet.lookup(beats, c["at"]) + cuesheet._off(c.get("off"), sheet.get("vars", {}))
    if c.get("to"):
        ft = cuesheet.lookup(beats, c["to"]) + cuesheet._off(c.get("to_off"), sheet.get("vars", {}))
        if ft > TOTAL or ft <= f:
            print(f"end: {c['s']} at {c['at']} (f{f:g}) ran to {c['to']} (f{ft:g}): clamped to FILM.end")
            c["to"], c["to_off"] = "FILM.end", 0; c.setdefault("out_f", 6); clamped += 1
        continue
    d = clip_s(c["s"])
    if d is None: continue
    st = (c.get("st") or 0)
    d = d / 2 ** (st / 12)
    if f + d * FPS > TOTAL - 0.5:
        c["to"], c["to_off"] = "FILM.end", 0; c.setdefault("out_f", 6); clamped += 1
        print(f"end: {c['s']} at {c['at']} (f{f:g}, {d:.2f} s) would run past the film's end (f{TOTAL}): stops on FILM.end, fading over {c['out_f']} frames")
res = dict(sheet); res["cues"] = out
json.dump(res, open(out_p, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(f"cues: {len(sheet['cues'])} lines -> {len(out)} cues ({sum(1 for c in out if c.get('on') is not False)} on), {clamped} stopped at the film's end -> {out_p}")
