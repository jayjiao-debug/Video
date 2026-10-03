#!/usr/bin/env python3
"""Add Juno's title card (片头) and end card (片尾) to finished videos.

  python brand.py stopping              # full branded video -> out/brand/stopping.mp4
  python brand.py all                   # every video in brand/videos.yaml
  python brand.py stopping --stills     # review frames of both cards
  python brand.py stopping --parts      # the two cards alone (title.mp4, end.mp4) for an editor

Source videos live in public/build/brand/<id>.mp4 (not in git). The title card
covers the window `card` [start, end] seconds; the end card extends the video by
`extend` seconds while the background track keeps playing (the videos use the
same track from 0 s, so the audio is simply the track, matched in level, faded).
"""

import argparse
import glob
import json
import os
import subprocess
import sys

import numpy as np
import yaml

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from pipeline import fonts  # noqa: E402

BUILD = os.path.join(ROOT, "public", "build", "brand")
OUT = os.path.join(ROOT, "out", "brand")
BROWSER = os.environ.get("REMOTION_BROWSER") or next(iter(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell")), "")
TRACK = os.path.join(ROOT, "assets", "music", "bgm.mp3")


def run(cmd, **kw):
    print("$", " ".join(cmd)[:200], flush=True)
    subprocess.run(cmd, check=True, **kw)


def duration(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                capture_output=True, text=True, check=True).stdout)


def rms_db(path, ss, t):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ss), "-t", str(t), "-i", path, "-ac", "1", "-ar", "8000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, np.float32)
    return 20 * np.log10(np.sqrt((a ** 2).mean()) + 1e-12)


def prepare():
    cfg = yaml.safe_load(open(os.path.join(ROOT, "brand", "videos.yaml"), encoding="utf-8"))
    for v in cfg["videos"]:
        v["duration"] = round(duration(os.path.join(ROOT, "public", v["src"])), 3)
    os.makedirs(BUILD, exist_ok=True)
    json.dump(cfg, open(os.path.join(BUILD, "brand.json"), "w"), ensure_ascii=False)
    fonts.build(os.path.join(ROOT, "brand"), os.path.join(BUILD, "fonts"))
    return cfg


def remotion(args):
    run(["npx", "remotion", *args, f"--browser-executable={BROWSER}", "--log=error"], cwd=ROOT)


def audio(v, path):
    """The background track from 0 s, gain-matched to the source video, faded out at the new end."""
    src = os.path.join(ROOT, "public", v["src"])
    gain = rms_db(src, 20, 60) - rms_db(TRACK, 20, 60)
    total = v["duration"] + v["extend"]
    fade = min(3.0, v["extend"] * 0.6)
    run(["ffmpeg", "-v", "error", "-y", "-i", TRACK, "-af",
         f"atrim=0:{total},volume={gain:.2f}dB,afade=t=out:st={total - fade}:d={fade}",
         "-ar", "48000", "-c:a", "aac", "-b:a", "256k", path])


def brand(v, parts=False):
    os.makedirs(OUT, exist_ok=True)
    vid = v["id"]
    if parts:
        for part in ("title", "end"):
            remotion(["render", "src/index.ts", "Branded", os.path.join(OUT, f"{vid}-{part}.mp4"),
                      f"--props={json.dumps({'video': vid, 'part': part})}", "--codec=h264", "--crf=16"])
        return
    picture = os.path.join(BUILD, f"{vid}.picture.mp4")
    remotion(["render", "src/index.ts", "Branded", picture, f"--props={json.dumps({'video': vid})}",
              "--muted", "--codec=h264", "--crf=18", "--x264-preset=slow", "--concurrency=4"])
    sound = os.path.join(BUILD, f"{vid}.audio.m4a")
    audio(v, sound)
    final = os.path.join(OUT, f"{vid}.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", picture, "-i", sound, "-map", "0:v", "-map", "1:a", "-c", "copy",
         "-movflags", "+faststart", "-shortest", final])
    print("wrote", final)


def stills(v):
    d = os.path.join(OUT, f"{v['id']}-stills")
    os.makedirs(d, exist_ok=True)
    c0 = int(v["card"][0] * 30)
    end0 = int(v["duration"] * 30) - 12
    frames = [c0 + x for x in (8, 22, 34, 50, 80, 140)] + [end0 + x for x in (20, 50, 80, 120, 160)]
    run(["node", "scripts/stills.mjs", "brand", d, *map(str, frames)], cwd=ROOT,
        env={**os.environ, "COMPOSITION": "Branded", "REMOTION_BROWSER": BROWSER, "PROPS": json.dumps({"video": v["id"]})})
    sheet = os.path.join(OUT, f"{v['id']}-contact.jpg")
    run(["ffmpeg", "-v", "error", "-y", "-pattern_type", "glob", "-i", os.path.join(d, "*.jpg"), "-vf",
         "scale=640:-1,tile=3x4:padding=6:color=0x222222", "-frames:v", "1", "-update", "1", sheet])
    print("wrote", sheet)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--stills", action="store_true")
    ap.add_argument("--parts", action="store_true")
    a = ap.parse_args()
    cfg = prepare()
    todo = cfg["videos"] if a.video == "all" else [v for v in cfg["videos"] if v["id"] == a.video]
    if not todo:
        sys.exit(f"unknown video {a.video!r}; have {[v['id'] for v in cfg['videos']]}")
    for v in todo:
        stills(v) if a.stills else brand(v, a.parts)


if __name__ == "__main__":
    main()
