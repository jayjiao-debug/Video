#!/usr/bin/env python3
"""《采访八百壮士的一天》 the voice track, as the Mac studio builds it (studio.json voice.build):

  python3 scripts/sihang/voice/build_voice.py <lines_dir> <line_cuts.json> <out_dir>

lines_dir holds the 58 line clips (<id>.wav); line_cuts.json is cut_lines.py's file, as a list or as a dict keyed by line
id (the Mac keeps the dict). Lays the lines with scripts/kit/day/voice/assemble.py (the lines file's level target and the
hot syllables' clip gain, scripts/sihang/voice/clip_gain.json) into <out_dir>/voice_48k.wav and voice_timing.json, then
CHECKS the result against the picture's own timing (src/videos/sihang/voice.ts, which the render reads): the same number
of frames and every line's start and end within 2 ms. A difference stops the build: the picture and the voice would be
out of step (a different take in lines_dir, or voice.ts not regenerated after a change of the lines file)."""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))


FADE_IN, FADE_OUT = 0.008, 0.012


def faded(lines_dir, out):
    """copies of the line clips with an 8 ms fade in and a 12 ms fade out, same length to the sample: several clips begin
    or end on room tone a little above silence (the delivery gate's "still loud at its start / end"), which steps
    against the film's digital silence; the words themselves start later than 8 ms in every clip"""
    import subprocess
    dst = os.path.join(out, "lines_faded"); os.makedirs(dst, exist_ok=True)
    for fn in sorted(os.listdir(lines_dir)):
        if not fn.endswith(".wav"): continue
        src = os.path.join(lines_dir, fn)
        d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).decode())
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", "afade=t=in:d=%g,afade=t=out:st=%.5f:d=%g" % (FADE_IN, max(0.0, d - FADE_OUT), FADE_OUT),
                        "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", os.path.join(dst, fn)], check=True)
    return dst


def main():
    if len(sys.argv) != 4: sys.exit(__doc__)
    lines_dir, cuts_f, out = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out, exist_ok=True)
    lines_dir = faded(lines_dir, out)
    cuts = json.load(open(cuts_f))
    if isinstance(cuts, dict):
        cuts = [dict(v, id=k) if isinstance(v, dict) and "id" not in v else v for k, v in cuts.items()]
    lst = os.path.join(out, "line_cuts.list.json")
    json.dump(cuts, open(lst, "w"), ensure_ascii=False)
    os.chdir(ROOT)                                   # the lines file names the clip gain from the repo root
    sys.path.insert(0, os.path.join(ROOT, "scripts/kit/day/voice"))
    import assemble
    assemble.LINES_FILE = os.path.join(HERE, "sihang_lines.json")
    assemble.main(lines_dir, out, [lst])
    T = json.load(open(os.path.join(out, "voice_timing.json")))
    ts = open(os.path.join(ROOT, "src/videos/sihang/voice.ts"), encoding="utf-8").read()
    total = int(re.search(r"VOICE_TOTAL_F = (\d+)", ts).group(1))
    quote = re.findall(r"\[(\d+), \"\w+\", ([\d.]+), ([\d.]+), \d+, ", ts[ts.index("QUOTE_RAW"):])
    bad = []
    if T["frames"] != total: bad.append("the voice is %d frames, the picture %d" % (T["frames"], total))
    if len(quote) < len(T["lines"]): bad.append("voice.ts lists %d lines, the voice has %d" % (len(quote), len(T["lines"])))
    for l, q in zip(T["lines"], quote):
        if abs(l["start"] - float(q[1])) > 0.002 or abs(l["end"] - float(q[2])) > 0.002:
            bad.append("%s is %.3f-%.3f s in the voice, %s-%s s in the picture" % (l["id"], l["start"], l["end"], q[1], q[2]))
    if bad:
        sys.exit("build_voice.py: THE VOICE DOES NOT MATCH THE PICTURE'S TIMING:\n  " + "\n  ".join(bad[:12]))
    print("build_voice.py: %d lines, %d frames, in step with src/videos/sihang/voice.ts" % (len(T["lines"]), total))


if __name__ == "__main__":
    main()
