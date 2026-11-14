#!/usr/bin/env python3
"""The sound side of the lead's intro-card freeze (v3; src/videos/su/beats.ts FREEZE: the picture holds story frame
AT for N extra frames). Writes a voice track with N/30 s of silence inserted at AT/30 s and a timing file with every
time after that point moved later by the same amount (frames += N), so build.py lays the whole mix out on the
composition's clock: beds that started before the freeze simply play on through it.

  freeze.py [--timing voice_timing.json] [--voice voice_48k.wav] [--out-timing ...v3.json] [--out-voice ...v3_48k.wav]
Keep AT and N equal to beats.ts FREEZE (at = to("A01") + 3 = 72, n = 75)."""
import argparse, json, subprocess
AT, N, FPS, SR = 72, 75, 30, 48000

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timing", default="/home/user/su_work/voice/voice_timing.json")
    ap.add_argument("--voice", default="/home/user/su_work/voice/voice_48k.wav")
    ap.add_argument("--out-timing", default="/home/user/su_work/voice/voice_timing_v3.json")
    ap.add_argument("--out-voice", default="/home/user/su_work/voice/voice_v3_48k.wav")
    a = ap.parse_args()
    t0, gap = AT / FPS, N / FPS
    T = json.load(open(a.timing))
    sh = lambda x: x + gap if x >= t0 else x
    for l in T["lines"]:
        assert not (l["start"] < t0 < l["end"]), f"the freeze at {t0:.3f} s falls inside line {l['id']}"
        l["start"], l["end"] = sh(l["start"]), sh(l["end"])
        l["words"] = [[w, sh(s), sh(e)] for w, s, e in l.get("words", [])]
    T["frames"] += N; T["speech_end"] = sh(T["speech_end"]); T["voice"] += f" + freeze {N} f at {AT}"
    json.dump(T, open(a.out_timing, "w"), ensure_ascii=False, indent=1)
    cut = int(round(t0 * SR)); pad = int(round(gap * SR))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", a.voice, "-filter_complex",
                    f"[0:a]atrim=end_sample={cut},asetpts=PTS-STARTPTS[a];[0:a]atrim=start_sample={cut},asetpts=PTS-STARTPTS[b];"
                    f"aevalsrc=0:d={gap:.6f}:s={SR}[z];[a][z][b]concat=n=3:v=0:a=1[o]",
                    "-map", "[o]", "-ar", str(SR), "-ac", "1", a.out_voice], check=True)
    print("freeze", f"{N} frames at {t0:.3f} s ->", a.out_timing, a.out_voice, f"frames {T['frames']}")

if __name__ == "__main__":
    main()
