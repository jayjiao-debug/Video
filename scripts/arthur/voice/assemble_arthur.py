#!/usr/bin/env python3
"""Assemble the Arthur narration: per line trim + compress pauses (already in av1/proc/*.wav), time-stretch each line
toward the target rate, join with short gaps, loudness-normalise, write the timing json.
usage: assemble_arthur.py <voice k|j> <out.mp3> <timing.json> [line=take ...] [--rate 5.5] [--fit other_timing.json] [--cuts line=t1,t2]
--cuts: where the caption groups of a line change, as seconds inside that line's processed take (the middle of its
pauses); written to the timing json as film seconds ("cuts"), for gen_timing.py.
--fit: instead of the target rate, stretch every line to the duration it has in another timing file (same slots)."""
import subprocess, json, sys, os, re
A = sys.argv[1:]
voice, out, timing = A[0], A[1], A[2]
rate = 5.5; fit = None; takes = {}; cuts = {}; engine = "rubberband"; norm = "loudnorm"; srcdir = "av1/proc"
i = 3
while i < len(A):
    if A[i] == "--rate": rate = float(A[i + 1]); i += 2
    elif A[i] == "--fit": fit = json.load(open(A[i + 1], encoding="utf8")); i += 2
    elif A[i] == "--engine": engine = A[i + 1]; i += 2          # rubberband (phase vocoder) | atempo (WSOLA, what players use for 1.25x)
    elif A[i] == "--norm": norm = A[i + 1]; i += 2              # loudnorm (dynamic) | gain (one fixed gain to -16 LUFS)
    elif A[i] == "--src": srcdir = A[i + 1]; i += 2             # folder with the processed takes {voice}{nn}{take}.wav
    elif A[i] == "--cuts": k, v = A[i + 1].split("="); cuts[int(k)] = [float(x) for x in v.split(",")]; i += 2
    else: k, v = A[i].split("="); takes[int(k)] = v; i += 1
lines = json.load(open("arthur_lines.json", encoding="utf8"))
cjk = lambda s: len(re.findall(r"[一-鿿]", s))
def dur(p): return float(subprocess.check_output(["ffprobe", "-v", "0", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())
LO, HI = 1.08, 1.36
BIG = {3: 0.10, 6: 0.14, 10: 0.10, 14: 0.14, 16: 0.10, 19: 0.10, 21: 0.12}   # a slightly longer breath before a new beat
os.makedirs("asm", exist_ok=True)
t = 0.0; rows = []; parts = []
for n, text in enumerate(lines, 1):
    src = f"{srcdir}/{voice}{n:02d}{takes.get(n, '')}.wav"
    d0 = dur(src)
    if fit:
        slot = fit["lines"][n - 1]; tempo = d0 / (slot["end"] - slot["start"])
    else:
        tempo = min(HI, max(LO, rate * d0 / cjk(text)))
    w = f"asm/{voice}{n:02d}.wav"
    flt = f"atempo={tempo:.4f}" if engine == "atempo" else f"rubberband=tempo={tempo:.4f}:pitch=1:transients=crisp:formant=preserved"
    subprocess.run(["ffmpeg", "-y", "-v", "0", "-i", src, "-af", flt, "-ar", "44100", "-ac", "1", w], check=True)
    d = dur(w)
    if fit:
        g = slot["start"] - t
        if g < 0: g = 0
    else:
        g = 0 if n == 1 else BIG.get(n, 0.04)
    if g > 0.001:
        gp = f"asm/gap{voice}{n:02d}.wav"
        subprocess.run(["ffmpeg", "-y", "-v", "0", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{g:.4f}", gp], check=True)
        parts.append(gp); t += dur(gp)
    rows.append({"line": n, "take": f"{voice}{n:02d}{takes.get(n, '')}", "text": text, "start": round(t, 3), "end": round(t + d, 3), "tempo": round(tempo, 3), "rate": round(cjk(text) / d, 2)})
    if n in cuts: rows[-1]["cuts"] = [round(t + c / tempo, 3) for c in cuts[n]]
    t += d; parts.append(w)
open("asm/list.txt", "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in parts))
if norm == "gain":   # one fixed gain (no dynamics): to -16 LUFS, but never above -1 dBFS sample peak
    subprocess.run(["ffmpeg", "-y", "-v", "0", "-f", "concat", "-safe", "0", "-i", "asm/list.txt", "-ar", "44100", "-c:a", "pcm_s24le", "asm/joined.wav"], check=True)
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "asm/joined.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr; e = e[e.rfind("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", e).group(1)); pk = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", e).group(1)); g = min(-16 - I, -1 - pk)
    print(f"fixed gain {g:+.1f} dB (was {I:.1f} LUFS, peak {pk:.1f})")
    subprocess.run(["ffmpeg", "-y", "-v", "0", "-i", "asm/joined.wav", "-af", f"volume={g:.2f}dB", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "256k", out], check=True)
else:
    subprocess.run(["ffmpeg", "-y", "-v", "0", "-f", "concat", "-safe", "0", "-i", "asm/list.txt", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", out], check=True)
json.dump({"voice": voice, "rate": rate, "loudness": "-16 LUFS", "speech_end": round(t, 3), "lines": rows}, open(timing, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("total", round(t, 2), "file", round(dur(out), 2), "chars/s overall", round(sum(cjk(x) for x in lines) / t, 2))
for r in rows: print(r["line"], r["take"], r["start"], r["end"], "tempo", r["tempo"], "rate", r["rate"])
