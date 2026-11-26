#!/usr/bin/env python3
"""采访月老的一天: the voice farm made one clip per line (request by make_request.py). This turns a run's folder into what
scripts/kit/day/voice/assemble.py reads: <out>/lines/<id>.wav (48 kHz mono, silence trimmed, long inner pauses shortened)
and <out>/line_cuts.json (the service's character times, moved with the edits).

  python3 scripts/yuelao/voice/prep_lines.py <run dir> [<retake dir> ...] <out dir>
A later run dir wins for a line it holds. DROP removes a span of a take (seconds in the raw clip) before anything else."""
import json, os, re, subprocess, sys
import numpy as np
SR = 48000; HOP = 480
PRE, POST, FADE, MAXSIL = 0.05, 0.12, 0.008, 0.50
DROP = {"B08": [[1.20, 2.72]]}     # take 1 said 扣仙丹 twice


def load(f):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()


def main():
    *runs, out = sys.argv[1:]
    os.makedirs(os.path.join(out, "lines"), exist_ok=True)
    clips = {}
    for run in runs:
        for c in json.load(open(os.path.join(run, "report.json")))["clips"]:
            if c.get("status") == 200 and os.path.exists(os.path.join(run, c["file"])):
                clips[c["name"].split("_")[0]] = (run, c)
    cuts = []
    for lid in sorted(clips):
        run, c = clips[lid]
        x = load(os.path.join(run, c["file"]))
        al = c["alignment"]; chars = []
        depth = 0
        for ch, a, b in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
            if ch == "[": depth += 1
            if depth == 0: chars.append([ch, a, b])
            if ch == "]": depth -= 1
        removed = []
        drops = DROP.get(lid, []) if run == runs[0] else []
        n = len(x) // HOP
        db = 20 * np.log10(np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12)); pk = db.max()
        loud = np.where(db > pk - 48)[0]
        k0 = max(0.0, loud[0] * HOP / SR - PRE); k1 = min(len(x) / SR, (loud[-1] + 1) * HOP / SR + POST)
        # inner silences
        quiet = db < pk - 40; i = 0
        while i < n:
            if quiet[i]:
                j = i
                while j < n and quiet[j]: j += 1
                a, b = i * HOP / SR, j * HOP / SR
                if a > k0 and b < k1 and b - a > MAXSIL: removed.append([a + MAXSIL / 2, b - MAXSIL / 2])
                i = j
            else: i += 1
        removed = sorted(removed + [d for d in drops])
        keep = []; t = k0
        for a, b in removed:
            keep.append([t, a]); t = b
        keep.append([t, k1])
        parts = []
        for a, b in keep:
            p = x[int(a * SR): int(b * SR)].copy(); f = int(FADE * SR)
            if len(p) > 2 * f:
                p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
            parts.append(p)
        y = np.concatenate(parts)

        def shift(tm):
            s = 0.0
            for a, b in removed:
                if tm >= b: s += b - a
                elif tm > a: s += tm - a
            return round(tm - s, 3)
        dst = os.path.join(out, "lines", lid + ".wav")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", dst], input=y.tobytes(), check=True)
        cuts.append({"id": lid, "kept": [round(k0, 3), shift(k1)], "chars": [[ch, shift(a), shift(b)] for ch, a, b in chars],
                     "dur": round(len(y) / SR, 3), "heard": c.get("heard"), "take": os.path.basename(run.rstrip("/"))})
    json.dump(cuts, open(os.path.join(out, "line_cuts.json"), "w"), ensure_ascii=False, indent=0)
    print("%d lines, %.1f s of speech" % (len(cuts), sum(c["dur"] for c in cuts)))


if __name__ == "__main__":
    main()
