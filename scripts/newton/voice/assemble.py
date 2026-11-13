#!/usr/bin/env python3
"""《跟着牛顿过一天》 (copied from the Qin film): lays the voice farm's per-line clips onto the film timeline and writes the voice track and its timing.

  assemble.py <lines_dir> <out_dir> [cuts.json ...]
                                        lines_dir holds <id>.wav (one per line, 48 kHz mono, silence trimmed), cut from the
                                        voice farm's dialogue generations (one generation per scene = consistent voices)
Reads scripts/newton/voice/newton_lines.json: per line "pre" (silent seconds before it, for action), "after" (hold after it),
"silent" (seconds: the line keeps a span of that length on the timeline but has no voice and no caption),
plus "gap" (seconds between two lines), "lead" (silence before the first line), "trim" ({id: keep only the first N s}).
Writes <out_dir>/voice_timing.json (the format scripts/newton/gen_timing.py reads: lines with start/end, speech_end,
frames) and <out_dir>/voice_48k.wav (the whole dialogue track). No media goes into the repo.
Each cuts.json (scripts/newton/voice/cut_lines.py's line_cuts.json; a later file wins for the same line) gives the
character alignment of every line, written into the timing as "words" (character times, offset so the first voiced
character starts 0.05 s into the clip) so the captions follow the speech."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
FPS, SR, TAIL_S = 30, 48000, 0.8

def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())

def words_for(cut, start, end, who="ji"):
    """NEWTON: tokens are the Chinese characters of a ji line, the English words of an nt / hm line (letters, digits and
    apostrophes joined; a word's start = its first letter's, its end = its last letter's)"""
    import re
    if not cut or not cut.get("chars"): return None
    v0 = cut["kept"][0]   # the clip starts at "kept"[0]
    def tm(a, b):
        a2 = min(max(start + (a - v0), start), end); b2 = min(max(start + (b - v0), a2), end)
        return round(a2, 3), round(b2, 3)
    w = []
    if who == "ji":
        for ch, a, b in cut["chars"]:
            if re.match(r"[\u4e00-\u9fff]", ch): w.append([ch, *tm(a, b)])
        return w
    cur = None
    for ch, a, b in cut["chars"]:
        if re.match(r"[A-Za-z0-9']", ch):
            if cur is None: cur = [ch, a, b]
            else: cur[0] += ch; cur[2] = b
        else:
            if cur: w.append([cur[0], *tm(cur[1], cur[2])]); cur = None
    if cur: w.append([cur[0], *tm(cur[1], cur[2])])
    return w

def level_db(src):
    """NEWTON: a line's speech level: RMS (dBFS) over its 10 ms frames within 30 dB of its loudest frame"""
    import numpy as np
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, np.float32); n = len(x) // 480
    r = np.sqrt((x[: n * 480].reshape(n, 480) ** 2).mean(1) + 1e-12); db = 20 * np.log10(r)
    act = r[db > db.max() - 30]
    return float(20 * np.log10(np.sqrt((act ** 2).mean()) + 1e-12)), float(20 * np.log10(np.abs(x).max() + 1e-12))

LEVEL_SPAN = 6.0   # NEWTON: each line is brought toward the median speech level, at most this many dB either way

def main(lines_dir, out_dir, cut_files=()):
    cuts = {}
    for cf in cut_files:
        for c in json.load(open(cf)): cuts[c["id"]] = c
    spec = json.load(open(os.path.join(ROOT, "scripts/newton/voice/newton_lines.json")))
    gap, lead, trim = spec.get("gap", 0.18), spec.get("lead", 0.1), spec.get("trim", {})
    os.makedirs(out_dir, exist_ok=True)
    t, lines, parts = lead, [], []
    lv = {}
    for l in spec["lines"]:
        src = os.path.join(lines_dir, l["id"] + ".wav")
        if not l.get("silent") and os.path.exists(src): lv[l["id"]] = level_db(src)
    import statistics
    target = statistics.median(v[0] for v in lv.values()) if lv else 0.0
    gains = {}
    for k, (rms, pk) in lv.items():
        g = max(-LEVEL_SPAN, min(LEVEL_SPAN, target - rms))
        gains[k] = round(min(g, -1.0 - pk), 2)   # never past -1 dBFS peak
    for i, l in enumerate(spec["lines"]):
        src = os.path.join(lines_dir, l["id"] + ".wav")
        silent = l.get("silent")                     # a silent line: its span stays on the timeline (for the action), no voice
        d = float(silent) if silent else dur(src)
        if l["id"] in trim: d = min(d, trim[l["id"]])
        if i: t += gap
        t += l.get("pre", 0)
        rec = {"line": l["n"], "id": l["id"], "who": l["who"], "text": l["zh"], "start": round(t, 3), "end": round(t + d, 3)}
        if silent: rec["silent"] = True
        w = None if silent else words_for(cuts.get(l["id"]), t, t + d, l["who"])
        if w: rec["words"] = w
        lines.append(rec)
        if not silent: parts.append((src, t, d))
        t += d + l.get("after", 0)
    speech_end = lines[-1]["end"]
    total = t + TAIL_S
    frames = int(round(total * FPS))
    # mix: each clip delayed to its start (adelay), summed; exact length = frames / FPS
    args = ["ffmpeg", "-y", "-v", "error"]
    for src, _, _ in parts: args += ["-i", src]
    flt = []
    for k, (src, st, d) in enumerate(parts):
        ms = int(round(st * 1000))
        g = gains.get(os.path.basename(src)[:-4], 0.0)
        flt.append(f"[{k}:a]atrim=0:{d:.3f},asetpts=PTS-STARTPTS,aresample={SR},volume={g}dB,adelay={ms}|{ms}[a{k}]")
    flt.append("".join(f"[a{k}]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0:dropout_transition=0,apad,atrim=0:{frames / FPS:.4f}[out]")
    args += ["-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "1", "-ar", str(SR), os.path.join(out_dir, "voice_48k.wav")]
    subprocess.run(args, check=True)
    for rec in lines:
        if rec["id"] in gains: rec["gain_db"] = gains[rec["id"]]
    json.dump({"lines": lines, "speech_end": speech_end, "frames": frames, "tail_f": frames - int(round(speech_end * FPS))},
              open(os.path.join(out_dir, "voice_timing.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{len(lines)} lines, speech end {speech_end:.2f} s, film {frames} frames = {frames / FPS:.2f} s")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3:])
