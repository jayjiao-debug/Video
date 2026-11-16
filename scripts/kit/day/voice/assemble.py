#!/usr/bin/env python3
"""A day film's voice lane (the shared engine, src/kit/day/README.md; taken from scripts/newton/voice/assemble.py, the
newest copy): lays the per-line clips onto the film timeline and writes the voice track and its timing.

  assemble.py --film <name> <lines_dir> <out_dir> [cuts.json ...]
                                        lines_dir holds <id>.wav (one per line, 48 kHz mono, silence trimmed)
  assemble.py --film <name>             the run of record, from the lines file's "voice" block (lines_dir, cuts, out)
  (--lines <file> instead of the default scripts/<film>/voice/<film>_lines.json)
Reads the lines file: per line "pre" (silent seconds before it, for action), "after" (hold after it),
"silent" (seconds: the line keeps a span of that length on the timeline but has no voice and no caption),
plus "gap" (seconds between two lines), "lead" (silence before the first line), "trim" ({id: keep only the first N s}).
Writes <out_dir>/voice_timing.json (the format scripts/kit/day/gen_timing.py reads: lines with start/end, speech_end,
frames) and <out_dir>/voice_48k.wav (the whole dialogue track). No media goes into the repo.
Each cuts.json (scripts/kit/day/voice/cut_lines.py's line_cuts.json; a later file wins for the same line) gives the
character alignment of every line, written into the timing as "words" (character times, offset so the first voiced
character starts 0.05 s into the clip) so the captions follow the speech.
A line's "gain_db" in the lines file pins its gain (a take's gain kept from an earlier mix); a line without one is brought toward "level_target_db" (the v4 median) when the lines file has
it, else toward the median of this run. "swap" (a swapped take) is checked: the line must
show the swap entry's words and its clip must be the entry's length (and no longer than its "max_s"), else nothing is
written.
THE CLIP GAIN of the hot syllables. The lines file's voice.clip_gain names a JSON file
(Newton's scripts/newton/voice/hot_syllables.py writes one) of {"lines": {id: [span, ...]}, "lift_db": {id: dB}}:
a span is [t0, t1, [dB, ...]] (a curve: values evenly from t0 to t1, straight lines in dB between them; hot_syllables.py's
start and end at 0 dB) or [t0, t1, dB] (flat, CG_RAMP s raised-cosine ramps outside it), in the line's own clip seconds, so
it moves with the line; the rest of the clip is untouched, sample for sample. "lift_db" is added to a line's pinned gain
(the line whose loudest word was pulled down, so it keeps 10 LU over the bed), the -1 dBFS cap reading the clip-gained
peak. It keeps the voice's loudest syllables under the sound mix's bus limiter (master +6.2 dB, ceiling -1.8 dBTP), so the
limiter never acts on the voice. voice_timing.json lists each line's spans ("clip_gain": film seconds and the deepest dB)."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
FPS, SR, TAIL_S = 30, 48000, 0.8

def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())

SPOKEN = {}   # speaker -> "zh" | "en" (the lines file's engine.spoken; default "zh")

def words_for(cut, start, end, who=""):
    """tokens are the Chinese characters of a zh line, the English words of an en line (letters, digits and
    apostrophes joined; a word's start = its first letter's, its end = its last letter's)"""
    import re
    if not cut or not cut.get("chars"): return None
    v0 = cut["kept"][0]   # the clip starts at "kept"[0]
    def tm(a, b):
        a2 = min(max(start + (a - v0), start), end); b2 = min(max(start + (b - v0), a2), end)
        return round(a2, 3), round(b2, 3)
    w = []
    if SPOKEN.get(who, "zh") == "zh":
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
    """a line's speech level: RMS (dBFS) over its 10 ms frames within 30 dB of its loudest frame"""
    import numpy as np
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, np.float32); n = len(x) // 480
    r = np.sqrt((x[: n * 480].reshape(n, 480) ** 2).mean(1) + 1e-12); db = 20 * np.log10(r)
    act = r[db > db.max() - 30]
    return float(20 * np.log10(np.sqrt((act ** 2).mean()) + 1e-12)), float(20 * np.log10(np.abs(x).max() + 1e-12))

LEVEL_SPAN = 6.0   # each line is brought toward the median speech level, at most this many dB either way
CG_RAMP = 0.010    # the clip gain's ramps, s (outside each span)

def clip_gain_env(n, spans):
    """the gain (linear, one per sample) of a clip n samples long under its clip-gain spans: [t0, t1, dB] a flat
    span (raised-cosine ramps of CG_RAMP s outside it), [t0, t1, [dB, ...]] a curve (values evenly from t0 to t1, straight
    lines in dB between them, 1 outside: hot_syllables.py's curves start and end at 0 dB); the lowest gain wins where spans
    meet"""
    import numpy as np
    g = np.ones(n, np.float64); r = int(round(CG_RAMP * SR))
    for t0, t1, db in spans:
        if isinstance(db, list):
            a, b = max(0, int(round(t0 * SR))), min(n, int(round(t1 * SR)) + 1)
            if b <= a: continue
            xs = np.linspace(t0, t1, len(db)); ts = np.arange(a, b) / SR
            g[a:b] = np.minimum(g[a:b], 10 ** (np.minimum(0.0, np.interp(ts, xs, np.asarray(db, float))) / 20))
            continue
        k = 10 ** (min(0.0, float(db)) / 20)
        a, b = max(0, int(round(t0 * SR))), min(n, int(round(t1 * SR)))
        if b <= a: continue
        seg = np.full(b - a, k)
        g[a:b] = np.minimum(g[a:b], seg)
        if r:
            w = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, r + 2)[1:-1])      # 0 -> 1, open at both ends
            lo = max(0, a - r); up = 1 - (1 - k) * w[r - (a - lo):]          # into the span
            g[lo:a] = np.minimum(g[lo:a], up)
            hi = min(n, b + r); dn = 1 - (1 - k) * w[::-1][: hi - b]          # out of it
            g[b:hi] = np.minimum(g[b:hi], dn)
    return g

def apply_clip_gain(src, spans, tmp_dir, lid):
    """writes the clip with its clip gain applied (32-bit float wav, so the untouched samples stay exact) and
    returns its path"""
    import numpy as np
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    y = (x * clip_gain_env(len(x), spans)).astype(np.float32)
    out = os.path.join(tmp_dir, lid + ".wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_f32le", out],
                   input=y.tobytes(), check=True)
    return out

LINES_FILE = ""

def main(lines_dir, out_dir, cut_files=(), clip_gain=True):
    cuts = {}
    for cf in cut_files:
        for c in json.load(open(cf)): cuts[c["id"]] = c
    spec = json.load(open(LINES_FILE))
    SPOKEN.update(spec.get("engine", {}).get("spoken", {}))
    gap, lead, trim = spec.get("gap", 0.18), spec.get("lead", 0.1), spec.get("trim", {})
    byid = {l["id"]: l for l in spec["lines"]}
    for sid, sw in spec.get("swap", {}).items():   # the swap point must agree with its line and its clip
        l = byid.get(sid) or sys.exit(f"assemble: swap names line {sid}, which is not in the lines file")
        for k in ("zh", "en", "tts", "screens"):
            if l.get(k) != sw.get(k): sys.exit(f"assemble: line {sid}'s {k} is not the swap entry's ({sw.get('take')}): run swap_take.py")
        d = dur(os.path.join(lines_dir, sid + ".wav"))
        if abs(d - float(sw["len_s"])) > 0.002: sys.exit(f"assemble: {sid}.wav is {d:.3f} s, the swap entry ({sw.get('take')}) says {sw['len_s']} s: run swap_take.py")
        if sw.get("max_s") and d > float(sw["max_s"]) + 1e-6:
            sys.exit(f"assemble: {sid}.wav is {d:.3f} s, longer than the swap entry's max_s {sw['max_s']} s (two voices in one clip? swap_take.py cuts the line out of a dialogue render)")
    cg_file = spec.get("voice", {}).get("clip_gain")   # the hot syllables' clip gain
    cg = json.load(open(cg_file)) if clip_gain and cg_file and os.path.exists(cg_file) else {}
    cgain, lift = cg.get("lines", {}), cg.get("lift_db", {})
    for k in list(cgain) + list(lift):
        if k not in byid: sys.exit(f"assemble: {cg_file} names line {k}, which is not in the lines file")
    os.makedirs(out_dir, exist_ok=True)
    t, lines, parts = lead, [], []
    import tempfile
    tmp_dir = tempfile.mkdtemp(prefix="cg_", dir=out_dir)
    lv, cg_src = {}, {}
    for l in spec["lines"]:
        src = os.path.join(lines_dir, l["id"] + ".wav")
        if not l.get("silent") and os.path.exists(src):
            lv[l["id"]] = level_db(src)
            if cgain.get(l["id"]):   # the clip with its clip gain; the -1 dBFS cap below reads its peak
                d0 = dur(src)
                for t0, t1, _ in cgain[l["id"]]:
                    if not (0 <= t0 < t1 <= d0 + 1e-3): sys.exit(f"assemble: {l['id']}'s clip gain span {t0}-{t1} s is outside its {d0:.3f} s clip")
                cg_src[l["id"]] = apply_clip_gain(src, cgain[l["id"]], tmp_dir, l["id"])
                lv[l["id"]] = (lv[l["id"]][0], level_db(cg_src[l["id"]])[1])
    import statistics
    target = spec["level_target_db"] if "level_target_db" in spec else (statistics.median(v[0] for v in lv.values()) if lv else 0.0)
    gains = {}
    for k, (rms, pk) in lv.items():
        if byid[k].get("gain_db") is not None:   # pinned (the v4 take's own gain; + its lift, hot_syllables.py)
            gains[k] = round(min(float(byid[k]["gain_db"]) + float(lift.get(k, 0)), -1.0 - pk), 2); continue
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
        if not silent and l["id"] in cg_src:         # the clip gain (its spans in film seconds, for the mix)
            rec["clip_gain"] = [[round(t + t0, 3), round(t + t1, 3), round(min(db) if isinstance(db, list) else db, 1)] for t0, t1, db in cgain[l["id"]]]
            if lift.get(l["id"]): rec["lift_db"] = lift[l["id"]]
            src = cg_src[l["id"]]
        lines.append(rec)
        if not silent: parts.append((src, t, d, l["id"]))
        t += d + l.get("after", 0)
    speech_end = lines[-1]["end"]
    total = t + TAIL_S
    frames = int(round(total * FPS))
    # mix: each clip delayed to its start (adelay), summed; exact length = frames / FPS
    args = ["ffmpeg", "-y", "-v", "error"]
    for src, _, _, _ in parts: args += ["-i", src]
    flt = []
    for k, (src, st, d, lid) in enumerate(parts):
        ms = int(round(st * 1000))
        g = gains.get(lid, 0.0)
        flt.append(f"[{k}:a]atrim=0:{d:.3f},asetpts=PTS-STARTPTS,aresample={SR},volume={g}dB,adelay={ms}|{ms}[a{k}]")
    flt.append("".join(f"[a{k}]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0:dropout_transition=0,apad,atrim=0:{frames / FPS:.4f}[out]")
    args += ["-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "1", "-ar", str(SR), os.path.join(out_dir, "voice_48k.wav")]
    subprocess.run(args, check=True)
    import shutil; shutil.rmtree(tmp_dir, ignore_errors=True)
    for rec in lines:
        if rec["id"] in gains: rec["gain_db"] = gains[rec["id"]]
    json.dump({"lines": lines, "speech_end": speech_end, "frames": frames, "tail_f": frames - int(round(speech_end * FPS))},
              open(os.path.join(out_dir, "voice_timing.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{len(lines)} lines, speech end {speech_end:.2f} s, film {frames} frames = {frames / FPS:.2f} s")

def _args(argv):
    """--film <name> [--lines <file>] and the positional arguments"""
    global LINES_FILE
    film, lines, rest, i = None, None, [], 0
    while i < len(argv):
        if argv[i] == "--film": film = argv[i + 1]; i += 2
        elif argv[i] == "--lines": lines = argv[i + 1]; i += 2
        else: rest.append(argv[i]); i += 1
    if not film and not lines: sys.exit("assemble: give --film <name> (or --lines <file>)")
    LINES_FILE = lines or os.path.join(ROOT, f"scripts/{film}/voice/{film}_lines.json")
    return rest

if __name__ == "__main__":
    rest = _args(sys.argv[1:])
    if not rest:   # the lines file's "voice" block
        vb = json.load(open(LINES_FILE)).get("voice") or sys.exit("assemble: the lines file has no \"voice\" block: give <lines_dir> <out_dir>")
        main(vb["lines_dir"], vb["out"], vb.get("cuts", []))
    else:
        if len(rest) < 2: sys.exit("assemble: give <lines_dir> <out_dir> [cuts.json ...]")
        main(rest[0], rest[1], rest[2:])
