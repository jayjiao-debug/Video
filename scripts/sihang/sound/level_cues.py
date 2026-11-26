#!/usr/bin/env python3
"""Sets every cue's static gain from the level it should have IN THE MIX, measured on the clips themselves.

  level_cues.py <clips_dir> [--src scripts/sihang/sound/cues.src.json] [--out scripts/sihang/sound/cues.json]
                [--timing <voice_timing.json>]

cues.src.json is the cue sheet as written by hand: beds and music carry "lufs" (the cue's integrated loudness in the
mix), hits carry "peak" (the sample peak, in the mix, of the part of the clip the cue plays, dBFS). This script measures
each clip as build.py hears it (float: an mp3 decodes over 0 dBFS), writes "gain" = target - the clip's own level - the mix's master gain (6.2 dB, build.py --gain), and
notes what it did. A clip too short for a loudness value is levelled by its mean level. It also expands the one
"pattern" the film has: scene G's shells, on the same frames as the picture's flashes (shots/segG.ts HITS); a shell
whose body falls on a spoken line takes "peak_under" / "len_under" / "lp_under" (lower, shorter, duller: the line stays
over it), the others "peak".
The result is the cues.json scripts/kit/day/sound/build.py reads; nothing is automated in the mix itself."""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MASTER = 6.2
FPS = 30

def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

SR = 48000
_PCM = {}

def pcm(path):
    """the clip as build.py hears it: float samples at 48 kHz mono (an mp3 decodes over 0 dBFS; volumedetect clips it)"""
    import numpy as np
    if path not in _PCM:
        raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
        _PCM[path] = np.frombuffer(raw, np.float32).astype(np.float64)
    return _PCM[path]

def peak_db(path, t0=0.0, t1=None):
    """the sample peak (dBFS, float) of the part of the clip a cue plays"""
    import numpy as np
    x = pcm(path); a = max(0, int(round(t0 * SR))); b = len(x) if t1 is None else min(len(x), int(round(t1 * SR)))
    return float(20 * np.log10(max(np.abs(x[a:b]).max() if b > a else 0.0, 1e-9)))

def measure(path):
    import numpy as np
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", e)
    x = pcm(path); mean = float(10 * np.log10((x ** 2).mean() + 1e-12))
    lufs = float(m[-1]) if m and float(m[-1]) > -69 else None
    return {"lufs": lufs, "mean": mean}

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
            t0 = c.get("in", 0.0); t1 = t0 + c["len"] * c.get("rate", 1.0) if "len" in c else None
            pk = peak_db(os.path.join(clips, clip + ".mp3"), t0, t1)
            c["gain"] = round(c.pop("peak") - pk - MASTER, 1); c["note"] = f"its part of the clip peaks at {pk:.1f} dBFS -> {c['gain'] + pk + MASTER:.0f} dBFS in the mix"
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
        spoken = [(l["start"] - 0.15, l["end"]) for l in T.values() if not l.get("silent")]
        t, i = g0 + 8, 0
        while t < stop:                                     # the same walk as shots/segG.ts HITS
            a = 0.45 + 0.4 * ((i * 0.618) % 1); sec = t / FPS
            under = any(s0 < sec + h.get("under_s", 0.9) and sec < s1 for s0, s1 in spoken)     # its body falls on a spoken line
            rng = h["peak_under"] if under else h["peak"]
            cue = {"label": f"G shell {i + 1} (with the flash" + (", under a line)" if under else ")"), "clip": h["clips"][i % len(h["clips"])],
                   "at": ["G", "from", round((t - g0) / FPS, 3)], "peak": round(rng[0] + (rng[1] - rng[0]) * (a - 0.45) / 0.4, 1),
                   "rate": round(0.88 + 0.26 * ((i * 0.37) % 1), 2), "sync": h.get("sync", 0.0),
                   "len": h.get("len_under", 1.4) if under else h.get("len", 2.2), "fade_out": h.get("fade_under", 0.8) if under else 0.6}
            if under and h.get("lp_under"): cue["lp"] = h["lp_under"]
            hits.append(cue)
            t += 27 + ((i * 7) % 9); i += 1
    res = {"note": spec.get("note", ""), "beds": [level(b) for b in spec["beds"]], "hits": [level(h) for h in hits]}
    for k in ("whisper_dip", "cards", "retired"):
        if k in spec: res[k] = spec[k]
    json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {out}: {len(res['beds'])} beds, {len(res['hits'])} hits, {len(lv)} clips measured")

if __name__ == "__main__":
    main()
