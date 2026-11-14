#!/usr/bin/env python3
"""《采访李白的一天》 sound mix (a copy of scripts/qin/sound/build.py: exact scene bounds = the segments, a cue may
"seek" into its clip, a card's sound follows the lines file's card_delay): voice track + ambience beds + music + effects, from cues.json and the voice timing.

  build.py [--timing /home/user/libai_work/voice/voice_timing.json] [--voice /home/user/libai_work/voice/voice_48k.wav]
           [--clips /home/user/libai_work/sound/clips] [--out /home/user/libai_work/sound/mix_48k.wav]
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
    ap.add_argument("--timing", default="/home/user/libai_work/voice/voice_timing.json")
    ap.add_argument("--voice", default="/home/user/libai_work/voice/voice_48k.wav")
    ap.add_argument("--clips", default="/home/user/libai_work/sound/clips")
    ap.add_argument("--out", default="/home/user/libai_work/sound/mix_48k.wav")
    ap.add_argument("--events", default="/home/user/libai_work/sound/events.json", help="node scripts/libai/sound/events.mjs: the freeze, the whispers, the overlays' sounds")
    ap.add_argument("--gain", type=float, default=1.6, help="master gain in dB before the limiter (mono mix ~-19.5 LUFS = ~-16.5 LUFS once mux.sh puts it on both channels)")
    a = ap.parse_args()
    T = json.load(open(a.timing)); spec = json.load(open(os.path.join(ROOT, "scripts/libai/sound/cues.json")))
    lines_spec = {l["id"]: l for l in json.load(open(os.path.join(ROOT, "scripts/libai/voice/libai_lines.json")))["lines"]}
    import re
    vt = open(os.path.join(ROOT, "src/videos/libai/voice.ts")).read()
    total = int(re.search(r"VOICE_TOTAL_F = (\d+)", vt).group(1)) / 30.0   # the film's length (with the end card), not the voice track's
    L = {l["id"]: l for l in T["lines"]}
    # THE FREEZE (src/videos/libai/story.ts CLOCK): the picture holds frame `at` for `frames` more frames, so every
    # picture time after it is played FZ seconds later; the voice gets FZ of silence there (it falls between two lines)
    EV = json.load(open(a.events)); fps = EV["fps"]
    FZ = EV["freeze"]["frames"] / fps; TF = (EV["freeze"]["at"] + 1) / fps
    shift = lambda t: t + FZ if t >= TF - 1e-6 else t
    pic_total = total; total = total + FZ
    # THE WHISPERS: the room (the ambience beds) dips 6 dB with 0.2 s ramps, from her first word to her voice's end
    dips = [(shift(w["word"] / fps) - 0.2, shift(w["end"] / fps) + 0.1) for w in EV["whispers"]]
    scenes = {}
    for l in T["lines"]:
        sc = l["id"][0]
        if sc not in scenes:
            scenes[sc] = max(0.0, l["start"] - lines_spec[l["id"]].get("pre", 0))
    order = sorted(scenes, key=lambda s: scenes[s]); scenes["A"] = 0.0
    bounds = {s: (scenes[s], scenes[order[i + 1]] if i + 1 < len(order) else pic_total) for i, s in enumerate(order)}
    def at(x):
        k, which, off = x
        if len(k) == 1: return shift(bounds[k][0 if which == "from" else 1] + off)
        return shift(L[k]["start" if which == "start" else "end"] + off)
    tfms = int(round((TF + FZ) * 1000))
    inputs, flt = [a.voice], ["[0:a]aresample=48000,aformat=channel_layouts=mono,asplit=2[v0][v1]", f"[v0]atrim=0:{TF:.4f}[va]", f"[v1]atrim=start={TF:.4f},asetpts=PTS-STARTPTS,adelay={tfms}|{tfms}[vb]"]
    mix = ["[va]", "[vb]"]
    def add(clip, t0, t1, gain, loop, fade, fade_out=None, seek=0.0, dip=False):
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
        if dip:
            ds = [(d0 - t0, d1 - t0) for d0, d1 in dips if d1 > t0 and d0 < t0 + length]
            if ds:
                e = "*".join(f"(1-0.5*clip(min((t-{x0:.3f})/0.2\\,({x1:.3f}-t)/0.2)\\,0\\,1))" for x0, x1 in ds)
                f += f",volume=volume='{e}':eval=frame"
        ms = int(round(max(0, t0) * 1000)); f += f",adelay={ms}|{ms}[c{k}]"
        flt.append(f); mix.append(f"[c{k}]")
    for b in spec["beds"]:
        add(b["clip"], at(b["at"]), at(b["until"]), b["gain"], b.get("loop", False), b.get("fade", 0.3), b.get("fade_out"), b.get("seek", 0.0), dip=b["clip"].startswith("amb_"))
    for h in spec["hits"]:
        add(h["clip"], at(h["at"]), at(h["until"]) if "until" in h else (at(h["at"]) + h["len"] if "len" in h else None), h["gain"], False, h.get("fade", 0), h.get("fade_out"), h.get("seek", 0.0))
    for l in T["lines"]:
        if "card" in lines_spec[l["id"]]: add(spec["cards"]["clip"], shift(l["end"] + lines_spec[l["id"]].get("card_delay", 0.1)), None, spec["cards"]["gain"], False, 0)
    # the overlays' own sounds (the title, the banner, the joins, the effects) and the freeze card's
    for fr, clip, gain, _ in EV["hits"]: add(clip, shift(fr / fps), None, gain, False, 0)
    for k, clip, gain, _ in EV["freezeHits"]: add(clip, (EV["freeze"]["at"] + k) / fps, None, gain, False, 0)
    flt.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:dropout_transition=0,apad,atrim=end_sample={int(round(total * SR))},volume={a.gain}dB,alimiter=limit=0.89:level=false[out]")
    args = ["ffmpeg", "-y", "-v", "error", "-i", a.voice]
    for x in inputs[1:]: args += x[0] + ["-i", x[1]]
    args += ["-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "1", "-ar", str(SR), a.out]
    subprocess.run(args, check=True)
    print("mix", a.out, f"{dur(a.out):.2f} s (film {total:.2f} s)", "scenes", {s: [round(x, 2) for x in bounds[s]] for s in order})

if __name__ == "__main__":
    main()
