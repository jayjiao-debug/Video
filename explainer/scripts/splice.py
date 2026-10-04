"""Splice re-rendered frame ranges (from scripts/render-ranges.mjs) into an existing render.

    python scripts/splice.py out/xuming.mp4 public/build/xuming/segs out/xuming-spliced.mp4

Segments are named seg-<a>-<b>.mp4 (frames a..b-1). The picture is re-encoded once
(CRF 18); the audio of the original render is copied unchanged.
"""
import glob
import os
import re
import subprocess
import sys


def main():
    src, seg_dir, out = sys.argv[1:4]
    segs = []
    for p in glob.glob(os.path.join(seg_dir, "seg-*.mp4")):
        a, b = map(int, re.search(r"seg-(\d+)-(\d+)\.mp4$", p).groups())
        segs.append((a, b, p))
    segs.sort()
    n = int(subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries",
                            "stream=nb_read_packets", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip())
    pieces = []  # (input index or None for the source, start, end)
    cur = 0
    for a, b, _ in segs:
        if a > cur:
            pieces.append(("src", cur, a))
        pieces.append(("seg", a, b))
        cur = b
    if cur < n:
        pieces.append(("src", cur, n))
    inputs = ["-i", src] + sum((["-i", p] for _, _, p in segs), [])
    n_src = sum(1 for k, _, _ in pieces if k == "src")
    filt = [f"[0:v]split={n_src}" + "".join(f"[s{i}]" for i in range(n_src))]
    labels = []
    si = 0
    gi = 0
    for k, a, b in pieces:
        if k == "src":
            filt.append(f"[s{si}]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[p{len(labels)}]")
            si += 1
        else:
            gi += 1
            filt.append(f"[{gi}:v]setpts=PTS-STARTPTS[p{len(labels)}]")
        labels.append(f"[p{len(labels)}]")
    filt.append("".join(labels) + f"concat=n={len(labels)}:v=1:a=0[v]")
    cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[v]", "-map", "0:a",
           "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    m = int(subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries",
                            "stream=nb_read_packets", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip())
    print(f"wrote {out}: {m} frames (source {n}), {len(segs)} segments spliced")


if __name__ == "__main__":
    main()
