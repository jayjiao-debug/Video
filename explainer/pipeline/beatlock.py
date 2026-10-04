"""
Beat-lock check: find stretches where the picture hits the beat over and over.

卡点 means landing the *meaningful* moments on the music (a reveal, a cut, the
title, the drop). Pulsing, printing, dealing or flashing on every beat reads as
mechanical and jarring (the owner: "有些特效没有必要一直和beat动，很突兀").

This measures it on a rendered video:
  - per-frame picture change (grey 160x90, subtitles band masked),
  - visual hits = sharp local peaks of that change,
  - a beat counts as "hit" if a visual hit lands within ±1 frame of it,
  - flags every run of >= RUN consecutive hit beats ("metronome"),
  - prints, per scene, how many of its beats carry a visual hit.

Usage:  python -m pipeline.beatlock out/<id>.mp4 <id> [--run 4]
Target: no metronome runs except where intended (the title stamps); per-scene
hit share well under ~35 % (the loudest section may go higher, in short bursts).
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
W, H, FPS = 160, 90, 30


def frames(path: str) -> np.ndarray:
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)


def visual_hits(v: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    v = v[:, : int(H * 0.8)]  # subtitles live in the bottom band; they change on lines by design
    d = np.zeros(len(v))
    d[1:] = np.abs(np.diff(v, axis=0)).mean(axis=(1, 2))
    # excess over the local median: a hit is sudden, a camera move is sustained
    k = 8
    pad = np.pad(d, k, mode="edge")
    med = np.array([np.median(pad[i : i + 2 * k + 1]) for i in range(len(d))])
    o = np.maximum(0, d - med)
    thr = max(0.6, 4 * np.median(o[o > 0]) if np.any(o > 0) else 0.6)
    peaks = np.array([i for i in range(2, len(o) - 2) if o[i] > thr and o[i] == o[i - 3 : i + 4].max()])
    return peaks, o


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("episode")
    ap.add_argument("--run", type=int, default=4)
    a = ap.parse_args()
    build = ROOT / "public" / "build" / a.episode
    music = json.loads((build / "music.json").read_text())
    tl = json.loads((build / "timeline.json").read_text())
    beats = [round(b * FPS) for b in music["beats"]]
    peaks, _ = visual_hits(frames(a.video))
    pk = set(int(p) for p in peaks)
    hit = [any((b + d) in pk for d in (-1, 0, 1)) for b in beats]

    print(f"{len(peaks)} visual hits, {sum(hit)}/{len(beats)} beats carry one ({100 * sum(hit) / len(beats):.0f} %)")
    print("\nmetronome runs (>= %d hit beats in a row):" % a.run)
    runs, i = 0, 0
    while i < len(hit):
        if hit[i]:
            j = i
            while j + 1 < len(hit) and hit[j + 1]:
                j += 1
            if j - i + 1 >= a.run:
                runs += 1
                print(f"  {beats[i] / FPS:7.2f}s – {beats[j] / FPS:7.2f}s  ({j - i + 1} beats)")
            i = j + 1
        else:
            i += 1
    if not runs:
        print("  none")
    print("\nper scene:")
    for s in tl["scenes"]:
        bs = [k for k, b in enumerate(beats) if s["from"] <= b < s["from"] + s["duration"]]
        if not bs:
            continue
        n = sum(hit[k] for k in bs)
        print(f"  {s['id']:<10} {n:3d}/{len(bs):<3d} beats hit ({100 * n / len(bs):3.0f} %)")


if __name__ == "__main__":
    main()
