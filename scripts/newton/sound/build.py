#!/usr/bin/env python3
"""《跟着牛顿过一天》 sound mix (copied from the Qin film): voice track + ambience beds + music + effects, from cues.json and the voice timing.

  build.py [--timing /home/user/newton_work/film/voice/voice_timing.json] [--voice /home/user/newton_work/film/voice/voice_48k.wav]
           [--clips /home/user/newton_work/film/sound/clips] [--out /home/user/newton_work/film/sound/mix_48k.wav]
           [--cues scripts/newton/sound/cues.json] [--only voice,music,amb,sfx] [--nolimit] [--gain 5.7]
Anchors: [line id, "start"|"end", offset s] from the voice timing; [scene letter, "from"|"to", offset] = the scene's
first frame / the first frame of the next scene, in seconds, read from the PICTURE's own scene bounds
(src/videos/newton/voice.ts SEGMENT_RAW, written by gen_timing.py: frame / 30), so a scene-anchored cue lands on the cut.
(Until v2 this script put a scene's start at its first line's start - pre - 0.3 s: the sound led the picture by about
0.3 s at five cuts. Review v2 row 4.)
Cards: a ding where each fact card appears (the end of its line). The output length equals the voice track exactly.
Music is never ducked (owner's rule): every cue has ONE static gain; no automation, no sidechain. The master gain and a
4x-oversampled peak limiter (idle under speech) keep the true peak under -1 dBTP; mono mix about -19 LUFS.
Stems for measuring: --only picks the groups to keep (voice / music = mus_* / amb = amb_* / sfx = everything else and the
card dings; a cue's "group" overrides); the others are left out, the voice is replaced by silence of the same length.
Use --nolimit with --only so the stems add up to the mix (the limiter is idle in normal use)."""
import argparse, json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SR = 48000
FPS = 30
VOICE_TS = os.path.join(ROOT, "src/videos/newton/voice.ts")

def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())

def picture_scenes(total_f):
    """the picture's scene bounds: SEGMENT_RAW [id, first line, last line, first frame, last frame] -> {id: (from s, to s)}
    with "to" = the next scene's first frame (the last scene: the film's end)"""
    src = open(VOICE_TS, encoding="utf-8").read()
    block = re.search(r"export const SEGMENT_RAW[^=]*=\s*\[(.*?)\n\];", src, re.S)
    if not block: raise SystemExit(f"build.py: no SEGMENT_RAW in {VOICE_TS}")
    rows = [(m[0], int(m[3]), int(m[4])) for m in re.findall(r'\[\s*"([A-Z])",\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*\]', block.group(1))]
    if not rows or rows[0][1] != 0 or rows[-1][2] + 1 != total_f:
        raise SystemExit(f"build.py: SEGMENT_RAW does not cover the voice timing's {total_f} frames: {rows}")
    for (_, _, t0), (s1, f1, _) in zip(rows, rows[1:]):
        if f1 != t0 + 1: raise SystemExit(f"build.py: SEGMENT_RAW scene {s1} does not follow on")
    return [s for s, _, _ in rows], {s: (f0 / FPS, (f1 + 1) / FPS) for s, f0, f1 in rows}

def group_of(clip, cue=None):
    if cue and cue.get("group"): return cue["group"]
    return "music" if clip.startswith("mus_") else "amb" if clip.startswith("amb_") else "sfx"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timing", default="/home/user/newton_work/film/voice/voice_timing.json")
    ap.add_argument("--voice", default="/home/user/newton_work/film/voice/voice_48k.wav")
    ap.add_argument("--clips", default="/home/user/newton_work/film/sound/clips")
    ap.add_argument("--out", default="/home/user/newton_work/film/sound/mix_48k.wav")
    ap.add_argument("--cues", default=os.path.join(ROOT, "scripts/newton/sound/cues.json"))
    ap.add_argument("--only", default="voice,music,amb,sfx", help="groups to keep (stems for measuring)")
    ap.add_argument("--nolimit", action="store_true", help="no limiter (stems add up to the mix)")
    ap.add_argument("--gain", type=float, default=5.7, help="master gain in dB before the limiter (mono mix ~-19 LUFS = ~-16 LUFS once mux.sh puts it on both channels; measured with the v3 remix cues)")
    a = ap.parse_args()
    keep = set(a.only.split(","))
    T = json.load(open(a.timing)); spec = json.load(open(a.cues))
    lines_spec = {l["id"]: l for l in json.load(open(os.path.join(ROOT, "scripts/newton/voice/newton_lines.json")))["lines"]}
    total = T["frames"] / FPS
    L = {l["id"]: l for l in T["lines"]}
    order, bounds = picture_scenes(T["frames"])
    for l in T["lines"]:                                        # every line inside its picture scene
        b = bounds[l["id"][0]]
        if not (b[0] <= l["start"] and l["end"] <= b[1]): raise SystemExit(f"build.py: {l['id']} {l['start']}-{l['end']} outside scene {l['id'][0]} {b}")
    def at(x):
        k, which, off = x
        if len(k) == 1: return bounds[k][0 if which == "from" else 1] + off
        return L[k]["start" if which == "start" else "end"] + off
    inputs, flt = [a.voice], ["[0:a]aresample=48000,aformat=channel_layouts=mono" + ("" if "voice" in keep else ",volume=0") + "[v]"]
    mix = ["[v]"]
    def add(clip, t0, t1, gain, loop, fade, fade_out=None, src=0.0, group="sfx"):
        if group not in keep: return
        path = os.path.join(a.clips, clip + ".mp3"); k = len(inputs)
        if not os.path.exists(path): print("missing", path); return
        args = []
        if loop: args = ["-stream_loop", "-1"]
        inputs.append((args, path))
        length = max(0.05, (t1 - t0) if t1 is not None else dur(path) - src)
        f = f"[{k}:a]aresample=48000,aformat=channel_layouts=mono,atrim={src:.3f}:{src + length:.3f},asetpts=PTS-STARTPTS,volume={gain}dB"
        fo = fade if fade_out is None else fade_out                 # "fade_out" (s) overrides the fade at the end
        if fade: f += f",afade=t=in:d={fade}"
        if fo: f += f",afade=t=out:st={max(0, length - fo):.3f}:d={fo}"
        ms = int(round(max(0, t0) * 1000)); f += f",adelay={ms}|{ms}[c{k}]"
        flt.append(f); mix.append(f"[c{k}]")
    for b in spec["beds"]:
        add(b["clip"], at(b["at"]), at(b["until"]), b["gain"], b.get("loop", False), b.get("fade", 0.3), b.get("fade_out"), b.get("in", 0.0), group_of(b["clip"], b))
    for h in spec["hits"]:
        add(h["clip"], at(h["at"]), None, h["gain"], False, 0, None, h.get("in", 0.0), group_of(h["clip"], h))
    for l in T["lines"]:
        ls = lines_spec[l["id"]]
        if "card" in ls: add(spec["cards"]["clip"], l["end"] + ls.get("card_delay", 0) + 0.1, None, spec["cards"]["gain"], False, 0, group="sfx")
    # limiting at 4x (a 48 kHz limiter at 0.89 let true peaks reach -0.8 dBTP); latency=1: the limiter's 5 ms look-ahead is
    # compensated (until v2 the whole mix came out 5 ms late), then padded / trimmed to the voice track's exact length
    n_out = int(round(total * SR))
    limit = "" if a.nolimit else f",aresample=192000,alimiter=limit=0.87:level=false:latency=1,aresample=48000,apad,atrim=end_sample={n_out}"
    flt.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:dropout_transition=0,apad,atrim=end_sample={n_out},volume={a.gain}dB{limit}[out]")
    args = ["ffmpeg", "-y", "-v", "error", "-i", a.voice]
    for x in inputs[1:]: args += x[0] + ["-i", x[1]]
    args += ["-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "1", "-ar", str(SR)]
    if a.nolimit: args += ["-c:a", "pcm_f32le"]                 # stems: no clipping at the 16-bit ceiling
    args += [a.out]
    subprocess.run(args, check=True)
    print("mix", a.out, f"{dur(a.out):.2f} s (film {total:.2f} s)", "scenes (picture cuts, s)", {s: [round(x, 3) for x in bounds[s]] for s in order})

if __name__ == "__main__":
    main()
