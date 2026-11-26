#!/usr/bin/env python3
"""Sets every cue's static gain from the level it should have IN THE MIX, measured on the clips themselves.

  level_cues.py <clips_dir> [--src scripts/sihang/sound/cues.src.json] [--out scripts/sihang/sound/cues.json]
                [--timing <voice_timing.json>]

cues.src.json is the cue sheet as written by hand: beds and music carry "lufs" (the cue's integrated loudness in the
mix), hits carry "peak" (the cue's sample peak in the mix, dBFS). This script measures each clip once (ffmpeg ebur128 /
volumedetect), writes "gain" = target - the clip's own level - the mix's master gain (6.2 dB, build.py --gain), and
notes what it did. A clip too short for a loudness value is levelled by its mean level. It also expands the one
"pattern" the film has: scene G's shells, on the same frames as the picture's flashes (shots/segG.ts HITS).
The result is the cues.json scripts/kit/day/sound/build.py reads; nothing is automated in the mix itself."""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MASTER = 6.2
FPS = 30

def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

def measure(path):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=sample", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", e); p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
    v = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    mean = float(re.search(r"mean_volume: (-?[\d.]+) dB", v).group(1)); mx = float(re.search(r"max_volume: (-?[\d.]+) dB", v).group(1))
    lufs = float(m[-1]) if m and float(m[-1]) > -69 else None
    return {"lufs": lufs, "mean": mean, "peak": float(p[-1]) if p else mx, "max": mx}

def main():
    clips = sys.argv[1]
    src = arg("--src", os.path.join(ROOT, "scripts/sihang/sound/cues.src.json")); out = arg("--out", os.path.join(ROOT, "scripts/sihang/sound/cues.json"))
    timing = arg("--timing", None)
    spec = json.load(open(src)); lv = {}
    def level(c):
        clip = c["clip"]
        if clip not in lv:
            p = os.path.join(clips, clip + ".mp3")
            if not os.path.exists(p): raise SystemExit(f"level_cues.py: missing clip {p}")
            lv[clip] = measure(p)
        m = lv[clip]; c = dict(c)
        if "lufs" in c:
            own = m["lufs"] if m["lufs"] is not None else m["mean"] + 3
            c["gain"] = round(c.pop("lufs") - own - MASTER, 1); c["note"] = f"clip {own:.1f} LUFS -> {c['gain'] + own + MASTER:.0f} LUFS in the mix"
        elif "peak" in c:
            c["gain"] = round(c.pop("peak") - m["max"] - MASTER, 1); c["note"] = f"clip peak {m['max']:.1f} dBFS -> {c['gain'] + m['max'] + MASTER:.0f} dBFS in the mix"
        elif "gain" not in c: raise SystemExit(f"level_cues.py: cue {c.get('label')} has no lufs / peak / gain")
        return c
    hits = []
    for h in spec["hits"]:
        if "pattern" not in h: hits.append(h); continue
        if h["pattern"] != "G_shells": raise SystemExit(f"unknown pattern {h['pattern']}")
        if not timing: raise SystemExit("level_cues.py: the G_shells pattern needs --timing <voice_timing.json>")
        T = {l["id"]: l for l in json.load(open(timing))["lines"]}
        ts = open(os.path.join(ROOT, "src/videos/sihang/voice.ts")).read()
        seg = dict((m.group(1), int(m.group(2))) for m in re.finditer(r'\["(\w)", \d+, \d+, (\d+), \d+\]', ts[ts.index("SEGMENT_RAW"):]))
        g0 = seg["G"]; stop = round(T["G05"]["start"] * FPS) - 8
        t, i = g0 + 8, 0
        while t < stop:                                     # the same walk as shots/segG.ts HITS
            a = 0.45 + 0.4 * ((i * 0.618) % 1)
            hits.append({"label": f"G shell {i + 1} (with the flash)", "clip": h["clips"][i % len(h["clips"])], "at": ["G", "from", round((t - g0) / FPS, 3)],
                         "peak": round(h["peak"][0] + (h["peak"][1] - h["peak"][0]) * (a - 0.45) / 0.4, 1), "rate": round(0.88 + 0.26 * ((i * 0.37) % 1), 2),
                         "sync": h.get("sync", 0.0), "len": h.get("len", 2.6), "fade_out": 0.5})
            t += 27 + ((i * 7) % 9); i += 1
    res = {"note": spec.get("note", ""), "beds": [level(b) for b in spec["beds"]], "hits": [level(h) for h in hits]}
    for k in ("whisper_dip", "cards", "retired"):
        if k in spec: res[k] = spec[k]
    json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {out}: {len(res['beds'])} beds, {len(res['hits'])} hits, {len(lv)} clips measured")

if __name__ == "__main__":
    main()
