#!/usr/bin/env python3
"""《采访苏东坡的一天》 sound mix (a copy of scripts/qin/sound/build.py: exact scene bounds = the segments, a cue may
"seek" into its clip, a card's sound follows the lines file's card_delay): voice track + ambience beds + music + effects, from cues.json and the voice timing.

  build.py [--timing /home/user/su_work/voice/voice_timing.json] [--voice /home/user/su_work/voice/voice_48k.wav]
           [--clips /home/user/su_work/sound/clips] [--out /home/user/su_work/sound/mix_48k.wav]
Anchors: [line id, "start"|"end", offset s] from the voice timing; [scene letter, "from"|"to", offset] = the scene's
first / last second (a scene starts 0.3 s before its first line's pre-beat; it ends where the next one starts).
Cards: a ding where each fact card appears (the end of its line). The output length equals the voice track exactly.
Music is not ducked (owner's rule): it is mixed low and constant. Peak-limited to -1 dBTP, about -16 LUFS overall."""
import argparse, json, os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SR = 48000

def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timing", default="/home/user/su_work/voice/voice_timing.json")
    ap.add_argument("--voice", default="/home/user/su_work/voice/voice_48k.wav")
    ap.add_argument("--clips", default="/home/user/su_work/sound/clips")
    ap.add_argument("--out", default="/home/user/su_work/sound/mix_48k.wav")
    ap.add_argument("--gain", type=float, default=-1.6, help="master gain in dB before the limiter (mono mix ~-19.5 LUFS = ~-16.5 LUFS once mux.sh puts it on both channels)")
    a = ap.parse_args()
    T = json.load(open(a.timing)); spec = json.load(open(os.path.join(ROOT, "scripts/su/sound/cues.json")))
    lines_spec = {l["id"]: l for l in json.load(open(os.path.join(ROOT, "scripts/su/voice/su_lines.json")))["lines"]}
    total = T["frames"] / 30.0
    L = {l["id"]: l for l in T["lines"]}
    scenes = {}
    for l in T["lines"]:
        sc = l["id"][0]
        if sc not in scenes:
            scenes[sc] = max(0.0, l["start"] - lines_spec[l["id"]].get("pre", 0))
    order = sorted(scenes, key=lambda s: scenes[s]); scenes["A"] = 0.0
    bounds = {s: (scenes[s], scenes[order[i + 1]] if i + 1 < len(order) else total) for i, s in enumerate(order)}
    def at(x):
        k, which, off = x
        if len(k) == 1: return bounds[k][0 if which == "from" else 1] + off
        return L[k]["start" if which == "start" else "end"] + off
    inputs, flt = [a.voice], ["[0:a]aresample=48000,aformat=channel_layouts=mono[v]"]
    mix = ["[v]"]
    def add(clip, t0, t1, gain, loop, fade, fade_out=None, seek=0.0):
        path = os.path.join(a.clips, clip + ".mp3"); k = len(inputs)
        if not os.path.exists(path): print("missing", path); return
        args = []
        if loop: args = ["-stream_loop", "-1"]
        if seek: args = args + ["-ss", f"{seek:.3f}"]
        inputs.append((args, path))
        length = max(0.05, (t1 - t0) if t1 is not None else dur(path))
        f = f"[{k}:a]aresample=48000,aformat=channel_layouts=mono,atrim=0:{length:.3f},asetpts=PTS-STARTPTS,volume={gain}dB"
        fo = fade if fade_out is None else fade_out                 # "fade_out" (s) overrides the fade at the end
        if fade: f += f",afade=t=in:d={fade}"
        if fo: f += f",afade=t=out:st={max(0, length - fo):.3f}:d={fo}"
        ms = int(round(max(0, t0) * 1000)); f += f",adelay={ms}|{ms}[c{k}]"
        flt.append(f); mix.append(f"[c{k}]")
    for b in spec["beds"]:
        add(b["clip"], at(b["at"]), at(b["until"]), b["gain"], b.get("loop", False), b.get("fade", 0.3), b.get("fade_out"), b.get("seek", 0.0))
    for h in spec["hits"]:
        add(h["clip"], at(h["at"]), at(h["until"]) if "until" in h else None, h["gain"], False, 0, h.get("fade_out"))
    for l in T["lines"]:
        if "card" in lines_spec[l["id"]]: add(spec["cards"]["clip"], l["end"] + lines_spec[l["id"]].get("card_delay", 0.1), None, spec["cards"]["gain"], False, 0)
    flt.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:dropout_transition=0,apad,atrim=end_sample={int(round(total * SR))},volume={a.gain}dB,alimiter=limit=0.89:level=false[out]")
    args = ["ffmpeg", "-y", "-v", "error", "-i", a.voice]
    for x in inputs[1:]: args += x[0] + ["-i", x[1]]
    args += ["-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "1", "-ar", str(SR), a.out]
    subprocess.run(args, check=True)
    print("mix", a.out, f"{dur(a.out):.2f} s (film {total:.2f} s)", "scenes", {s: [round(x, 2) for x in bounds[s]] for s in order})

if __name__ == "__main__":
    main()
