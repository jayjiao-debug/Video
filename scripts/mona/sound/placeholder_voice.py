#!/usr/bin/env python3
"""Before the voice exists: a voice timing from the placeholder layout in src/videos/mona/voice.ts and a silent voice
track of the film's length, so that scripts/kit/day/sound/build.py can mix the beds, music and effects.
    python3 scripts/mona/sound/placeholder_voice.py [--work /home/user/mona_work/film]"""
import argparse, json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
ap = argparse.ArgumentParser(); ap.add_argument("--work", default="/home/user/mona_work/film"); a = ap.parse_args()
v = open(os.path.join(ROOT, "src/videos/mona/voice.ts"), encoding="utf8").read()
raw = re.search(r"VOICE_RAW[^=]*= \[(.*?)\];", v, re.S).group(1)
times = {int(n): (float(s), float(e)) for n, s, e in re.findall(r"\[(\d+), ([\d.]+), ([\d.]+)\]", raw)}
frames = max(int(b) for b in re.findall(r"\[\"[A-Z]\", \d+, \d+, \d+, (\d+)\]", v)) + 1
lines = json.load(open(os.path.join(ROOT, "scripts/mona/voice/mona_lines.json"), encoding="utf8"))["lines"]
T = {"lines": [{"line": l["n"], "id": l["id"], "who": l["who"], "start": times[l["n"]][0], "end": times[l["n"]][1]} for l in lines],
     "speech_end": max(e for s, e in times.values()), "frames": frames, "source": "placeholder (no voice yet)"}
os.makedirs(os.path.join(a.work, "voice"), exist_ok=True)
json.dump(T, open(os.path.join(a.work, "voice/voice_timing.json"), "w"), indent=1, ensure_ascii=False)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", f"{frames / 30:.6f}", "-c:a", "pcm_s16le", os.path.join(a.work, "voice/voice_48k.wav")], check=True)
print("frames", frames, "lines", len(T["lines"]))
