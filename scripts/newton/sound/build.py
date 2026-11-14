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
Music is never ducked (owner's rule): every cue has ONE static gain; no automation, no sidechain. A cue may also carry
ONE fixed filter for its whole length ("hp": [Hz, poles] / "lowshelf": [Hz, dB], see static_eq): v3b puts a low shelf on
mus_night and mus_laugh so they carry on a phone speaker (director's gate-4 note 1). The master gain and a
4x-oversampled peak limiter (it only touches the voice's loudest syllables: > 1 dB on 0.8 % of the loud 10 ms blocks) set
the mono mix at about -19 LUFS with the true peak at -1.8 dBTP (-1.4 dBTP after mux.sh's AAC encode: v3b, 14 Nov).
Stems for measuring: --only picks the groups to keep (voice / music = mus_* / amb = amb_* / sfx = everything else and the
card dings; a cue's "group" overrides); the others are left out, the voice is replaced by silence of the same length.
Use --nolimit with --only so the stems add up to the mix (the limiter is idle in normal use).
THE WHISPER DIP (Jay, 14 Nov: the reporter's asides are whispered; src/videos/newton/whisper.ts): over each whisper
line THE ROOM dips by cues.json "whisper_dip" db (-6) with "ramp" s (0.2) ramps, down by her first word and back up from
the end of her voice (both inside the line's picture scene). The room = the ambience beds (group "amb") plus the clips
named in "whisper_dip" "also" (["sfx_quill"]: in Newton's room amb_room is about -85 dBFS and the room you hear is the
quill loop; director, 14 Nov). The line ids are read from the picture's own list (whisper.ts WHISPER_LINES, the same
array the bubble and the camera's lean use), the times from the voice timing. It is a gain envelope on those cues only,
where they meet a window (an "also" clip that is music is refused: music is never ducked); voice, music and every other
effect are untouched, and outside the windows the envelope is exactly 1, so the rest of the mix is sample for sample
what it was. The run prints which cue was dipped under which line."""
import argparse, json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SR = 48000
FPS = 30
VOICE_TS = os.path.join(ROOT, "src/videos/newton/voice.ts")
WHISPER_TS = os.path.join(ROOT, "src/videos/newton/whisper.ts")

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

def whisper_lines():
    """the whisper lines (the picture's list: whisper.ts WHISPER_LINES = ["A03", ...])"""
    src = open(WHISPER_TS, encoding="utf-8").read()
    m = re.search(r"export const WHISPER_LINES[^=]*=\s*\[(.*?)\];", src, re.S)
    if not m: raise SystemExit(f"build.py: no WHISPER_LINES in {WHISPER_TS}")
    return re.findall(r'"([A-Z]\d{2})"', m.group(1))

def whisper_windows(spec, L, bounds):
    """[(id, a0, a1, b0, b1)] in seconds: the amb gain goes down over a0..a1 (a1 = her first word), stays down, comes back
    over b0..b1 (b0 = the end of her voice); every ramp inside the line's picture scene"""
    d = spec.get("whisper_dip")
    if not d: return []
    r, out = d["ramp"], []
    for lid in whisper_lines():
        if lid not in L: raise SystemExit(f"build.py: whisper line {lid} is not in the voice timing")
        l = L[lid]; s0, s1 = bounds[lid[0]]
        w0 = l["words"][0][1] if l.get("words") else l["start"]
        a1 = max(s0 + r, w0); b0 = min(l["end"], s1 - r)
        out.append((lid, a1 - r, a1, b0, b0 + r))
    return out

DIP_BLOCK = 64   # samples per envelope step (1.3 ms)

def dip_filter(windows, db, t0, t1):
    """(the room cue's gain envelope, the ids of the windows it meets), or ("", []) when the cue [t0, t1] meets no window:
    1 outside the windows (exactly: 10^0), db at the bottom, smoothstep ramps; evaluated on 64-sample blocks (1.3 ms).
    Its clock is the SAMPLE COUNT after the cue's adelay (block n starts at film time n * 64 / 48000 s), not the frame
    timestamp t: a looped mp3 cue's timestamps drift about one mp3 frame (26 ms) per loop, and amix places samples by
    count, so a t-clock put the dip up to 48 ms early on the quill and amb loops (first pass; measured 14 Nov)."""
    hit = [w for w in windows if w[1] < t1 and w[4] > t0]
    if not hit: return "", []
    terms = []
    for _, a0, a1, b0, b1 in hit:
        terms.append(f"st(0,clip((ld(1)-{a0:.4f})/{a1 - a0:.4f},0,1)*clip(({b1:.4f}-ld(1))/{b1 - b0:.4f},0,1));ld(0)*ld(0)*(3-2*ld(0))")
    expr = f"st(1,n*{DIP_BLOCK}/{SR});pow(10,{db / 20:.6f}*(" + "+".join(f"({x})" for x in terms) + "))"   # the windows never overlap: their sum <= 1
    return f",asetnsamples=n={DIP_BLOCK}:p=0,volume='{expr}':eval=frame:precision=float", [w[0] for w in hit]

def group_of(clip, cue=None):
    if cue and cue.get("group"): return cue["group"]
    return "music" if clip.startswith("mus_") else "amb" if clip.startswith("amb_") else "sfx"

def static_eq(cue):
    """ONE fixed filter for the whole cue (no automation: the same curve from its first to its last sample).
    "hp": [Hz, poles] = a Butterworth high-pass, poles 2 (12 dB/oct) or 4 (24 dB/oct: two 2-pole stages, -6 dB at Hz);
    "lowshelf": [Hz, dB] = a low shelf (Q 0.707). Used to take out low end a phone speaker cannot play (below about
    450 Hz) so the cue's static gain can come up without masking the voice on full-range playback (director's note,
    gate 4: mus_night, mus_laugh)."""
    f = ""
    if "hp" in cue:
        hz, poles = cue["hp"]
        if poles not in (2, 4): raise SystemExit(f"build.py: {cue['clip']} hp poles must be 2 or 4")
        f += f",highpass=f={hz}:poles=2:width_type=q:width=0.7071" * (poles // 2)
    if "lowshelf" in cue:
        hz, g = cue["lowshelf"]
        f += f",lowshelf=f={hz}:g={g}:width_type=q:width=0.7071"
    return f

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timing", default="/home/user/newton_work/film/voice/voice_timing.json")
    ap.add_argument("--voice", default="/home/user/newton_work/film/voice/voice_48k.wav")
    ap.add_argument("--clips", default="/home/user/newton_work/film/sound/clips")
    ap.add_argument("--out", default="/home/user/newton_work/film/sound/mix_48k.wav")
    ap.add_argument("--cues", default=os.path.join(ROOT, "scripts/newton/sound/cues.json"))
    ap.add_argument("--only", default="voice,music,amb,sfx", help="groups to keep (stems for measuring)")
    ap.add_argument("--nolimit", action="store_true", help="no limiter (stems add up to the mix)")
    ap.add_argument("--ceiling", type=float, default=-1.8, help="limiter ceiling in dBFS at 4x oversampling (= the mix's true peak). -1.8 so the film stays under -1 dBTP after mux.sh's AAC 160k encode (measured -1.6 on the v3 mix, -1.4 on v3b with the brighter nocturne; at -1.2 the v2 mp4 reached -0.66: review v2 row 12)")
    ap.add_argument("--gain", type=float, default=6.2, help="master gain in dB before the limiter: mono mix -19.1 LUFS (= -16.1 LUFS once mux.sh puts it on both channels), true peak -1.8 dBTP; measured with the v3 remix cues (/home/user/newton_work/film/sound/REMIX_v3.md)")
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
    windows = whisper_windows(spec, L, bounds)
    dip_db = spec.get("whisper_dip", {}).get("db", 0)
    dip_also = set(spec.get("whisper_dip", {}).get("also", []))     # room cues that are not amb_* (sfx_quill)
    for c in dip_also:
        if group_of(c) == "music" or c.startswith("voice"): raise SystemExit(f"build.py: whisper_dip also {c}: music and voice are never ducked")
    dipped = []
    def add(clip, t0, t1, gain, loop, fade, fade_out=None, src=0.0, group="sfx", eq=""):
        if group not in keep: return
        path = os.path.join(a.clips, clip + ".mp3"); k = len(inputs)
        if not os.path.exists(path): print("missing", path); return
        args = []
        if loop: args = ["-stream_loop", "-1"]
        inputs.append((args, path))
        length = max(0.05, (t1 - t0) if t1 is not None else dur(path) - src)
        f = f"[{k}:a]aresample=48000,aformat=channel_layouts=mono,atrim={src:.3f}:{src + length:.3f},asetpts=PTS-STARTPTS{eq},volume={gain}dB"
        fo = fade if fade_out is None else fade_out                 # "fade_out" (s) overrides the fade at the end
        if fade: f += f",afade=t=in:d={fade}"
        if fo: f += f",afade=t=out:st={max(0, length - fo):.3f}:d={fo}"
        ms = int(round(max(0, t0) * 1000)); f += f",adelay={ms}|{ms}"
        env, hit = dip_filter(windows, dip_db, t0, t0 + length) if (group == "amb" or clip in dip_also) else ("", [])   # the whisper dip: the room only
        if env: dipped.append(f"{clip}@{'+'.join(hit)}")
        f += env + f"[c{k}]"
        flt.append(f); mix.append(f"[c{k}]")
    for b in spec["beds"]:
        add(b["clip"], at(b["at"]), at(b["until"]), b["gain"], b.get("loop", False), b.get("fade", 0.3), b.get("fade_out"), b.get("in", 0.0), group_of(b["clip"], b), static_eq(b))
    for h in spec["hits"]:
        add(h["clip"], at(h["at"]), None, h["gain"], False, 0, None, h.get("in", 0.0), group_of(h["clip"], h), static_eq(h))
    for l in T["lines"]:
        ls = lines_spec[l["id"]]
        if "card" in ls: add(spec["cards"]["clip"], l["end"] + ls.get("card_delay", 0) + 0.1, None, spec["cards"]["gain"], False, 0, group="sfx")
    # limiting at 4x (a 48 kHz limiter at 0.89 let true peaks reach -0.8 dBTP); latency=1: the limiter's 5 ms look-ahead is
    # compensated (until v2 the whole mix came out 5 ms late), then padded / trimmed to the voice track's exact length
    n_out = int(round(total * SR))
    limit = "" if a.nolimit else f",aresample=192000,alimiter=limit={10 ** (a.ceiling / 20):.4f}:level=false:latency=1,aresample=48000,apad,atrim=end_sample={n_out}"
    flt.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:dropout_transition=0,apad,atrim=end_sample={n_out},volume={a.gain}dB{limit}[out]")
    args = ["ffmpeg", "-y", "-v", "error", "-i", a.voice]
    for x in inputs[1:]: args += x[0] + ["-i", x[1]]
    args += ["-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "1", "-ar", str(SR)]
    if a.nolimit: args += ["-c:a", "pcm_f32le"]                 # stems: no clipping at the 16-bit ceiling
    args += [a.out]
    subprocess.run(args, check=True)
    print("mix", a.out, f"{dur(a.out):.2f} s (film {total:.2f} s)", "scenes (picture cuts, s)", {s: [round(x, 3) for x in bounds[s]] for s in order})
    if windows: print(f"whisper dip {dip_db} dB on the room ({', '.join(dipped) or 'no room cue in the stems kept'}):", "  ".join(f"{w[0]} {w[1]:.2f}>{w[2]:.2f}..{w[3]:.2f}>{w[4]:.2f}" for w in windows))

if __name__ == "__main__":
    main()
