#!/usr/bin/env python3
"""《采访拿破仑的一天》 sound mix (copied from the Newton film; its notes below describe the shared method): voice track + ambience beds + music + effects, from cues.json and the voice timing.

  build.py [--timing /home/user/napoleon_work/voice/voice_timing.json] [--voice /home/user/napoleon_work/voice/voice_48k.wav]
           [--clips /home/user/napoleon_work/sound/clips] [--out /home/user/napoleon_work/sound/mix_48k.wav]
           [--cues scripts/napoleon/sound/cues.json] [--only voice,music,amb,sfx] [--nolimit | --nosafety] [--gain 6.2]
           [--ceiling -1.8] [--safety -1.0] [--solo N] [--list cues_table.json]
Anchors ("at" / "until"):
  [line id, "start"|"end", offset s]    from the voice timing (v5 ids: A02 ... F16, G01a, G01b, G02 ...; A01 and G01 are
                                        retired and refused)
  [scene letter, "from"|"to", offset]   the scene's first frame / the first frame of the next scene, in seconds, read from
                                        the PICTURE's own scene bounds (src/videos/napoleon/voice.ts SEGMENT_RAW, frame / 30),
                                        so a scene-anchored cue lands on the cut
  ["card:<line id>", "from"|"to", off]  the fact card after that line: its first frame / the frame after its last one, from
                                        the picture's own CARD_RAW in voice.ts (v5: the noon strike under card 2's last 0.3 s)
(Until v2 this script put a scene's start at its first line's start - pre - 0.3 s: the sound led the picture by about
0.3 s at five cuts. Review v2 row 4.)
A cue's "sync" (seconds in the ORIGINAL clip, default its "in") is the moment of the clip that lands on "at": the cue starts
(sync - in) / rate earlier. So "at" is always where the hit is heard (the rap, the stroke, the thud), not where the file
starts.
Per-cue sound shaping (v5, all STATIC for the cue's whole length; nothing is automated):
  "in" s skipped at the clip's start; "len" s of the clip played (hits; beds run to "until");
  "rate" r = sampler-style speed (pitch and length together, like playing the clip on another key: 1.12 = +2 semitones,
             0.89 s per 1 s of clip); "pitch" st = a pitch shift in semitones that keeps the length (ffmpeg rubberband);
  "hp" [Hz, poles] / "lowshelf" [Hz, dB] / "lp" [Hz] (2-pole low-pass: a sound behind a door) = ONE fixed filter;
  "fade" / "fade_out" s at the cue's own start / end only; "fade_curve" (v5 r2: "qsin" = equal power, for a music splice
  where two passes of one clip cross over one beat) shapes both, default the linear "tri".
Cards: a ding where each fact card appears (the end of its line + card_delay + 0.1 s). The output length equals the voice
track exactly.
Music is never ducked (owner's rule): every cue has ONE static gain; no automation, no sidechain. A cue may also carry
ONE fixed filter for its whole length ("hp" / "lowshelf" / "lp", see static_eq): v3b puts a low shelf on mus_night and
mus_laugh so they carry on a phone speaker (director's gate-4 note 1).
THE LIMITER IS ON THE VOICE ONLY (v5 r2, sound review MAJOR 5): until v5 r1 one 4x limiter sat on the summed mix, so a hot
syllable pulled the music and the beds down with it (6.8 dB for 114 ms under B06's "Began"; 21 places, 1.85 s). Now the
master gain (--gain, +6.2 dB) is applied to every branch, the 4x-oversampled peak limiter (--ceiling -1.8 dBFS) sits on the
voice branch alone, and the sum only passes a safety limiter at --safety (-1.0 dBFS) that never engages: after the render
the build measures the mix's true peak (ffmpeg ebur128, 4x) and REFUSES the mix (exit 1, the file left as <out>.refused.wav)
if it is over --ceiling, so a mix that is written is one the safety limiter never touched. The voice's hot syllables are
clip-gained by the voice step (scripts/napoleon/voice/hot_syllables.py, clip_gain_v5.json), so the voice limiter is idle too
and the mix is the sum of its stems. The mono mix sits at about -19 LUFS with the true peak under -1.8 dBTP (under -1 dBTP
after mux.sh's AAC encode).
Placeholders (v5): a cue with "placeholder": "<the sound farm request>" plays a stand-in clip (ph_*.mp3, made by
scripts/napoleon/sound/make_placeholders.py) until the farm's clip exists; the run lists them.
Stems for measuring: --only picks the groups to keep (voice / music = mus_* / amb = amb_* / sfx = everything else and the
card dings; a cue's "group" overrides); the others are left out, the voice is replaced by silence of the same length.
Use --nosafety with --only for stems that add up to the mix: it drops only the sum's safety limiter and the true-peak check
(the sum still takes the limiter's 192 kHz round trip, which trims the clips' ultrasonic edges; the voice limiter stays: it is
part of the voice) and writes 32-bit float, so voice + music + amb + sfx = the mix to its 16-bit rounding, which proves no
limiter touched the music. --novoicelimit keeps the voice branch's round trip but not its limiter (what the voice limiter
did = the voice stem with it minus without it). --nolimit drops both limiters and both round trips (the bed
hot_syllables.py solves against; the voice as recorded x the master gain). --solo N renders cue N alone
(the index in --list's table: beds, then hits, then cards) for measuring where it lands; --list writes the cue table
(anchor, start, sync time, end) as JSON and renders nothing.
THE WHISPER DIP (Jay, 14 Nov: the reporter's asides are whispered; src/videos/napoleon/whisper.ts): over each whisper
line THE ROOM dips by cues.json "whisper_dip" db (-6) with "ramp" s (0.2) ramps, down by her first word and back up from
the end of her voice (both inside the line's picture scene). The room = the ambience beds (group "amb") plus the clips
named in "whisper_dip" "also" (["sfx_quill"]: in Newton's room amb_room is about -85 dBFS and the room you hear is the
quill loop; director, 14 Nov), as BEDS only (14 Nov evening: a hit cut from an "also" clip, skin A's nib, is an effect). The line ids are read from the picture's own list (whisper.ts WHISPER_LINES, the same
array the bubble and the camera's lean use), the times from the voice timing. It is a gain envelope on those cues only,
where they meet a window (an "also" clip that is music is refused: music is never ducked); voice, music and every other
effect are untouched, and outside the windows the envelope is exactly 1, so the rest of the mix is sample for sample
what it was. The run prints which cue was dipped under which line."""
import argparse, json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SR = 48000
FPS = 30
VOICE_TS = os.path.join(ROOT, "src/videos/napoleon/voice.ts")
WHISPER_TS = os.path.join(ROOT, "src/videos/napoleon/whisper.ts")
RETIRED = {}

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

def picture_cards():
    """the picture's fact cards: CARD_RAW [n, line id, first frame, last frame, zh, en] -> {line id: (from s, to s)}, "to" =
    the frame after the card's last frame"""
    src = open(VOICE_TS, encoding="utf-8").read()
    block = re.search(r"export const CARD_RAW[^=]*=\s*\[(.*?)\n\];", src, re.S)
    if not block: return {}
    return {m[0]: (int(m[1]) / FPS, (int(m[2]) + 1) / FPS) for m in re.findall(r'\[\s*\d+,\s*"([A-Z]\d{2}[a-z]?)",\s*(\d+),\s*(\d+),', block.group(1))}

def whisper_lines():
    """this film has no whispered lines"""
    return []

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

FADE_CURVES = {"tri", "qsin", "hsin", "esin", "log", "ipar", "qua", "cub", "squ", "cbr", "par", "exp"}

def true_peak_and_loudness(path):
    """(true peak dBTP, integrated LUFS) of a rendered file: ffmpeg ebur128 (BS.1770, true peak at 4x)"""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
    summ = r.stderr[r.stderr.rfind("Summary:"):]
    i = re.search(r"I:\s+(-?[\d.]+|-inf) LUFS", summ); p = re.search(r"True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS", summ)
    if not (i and p): raise SystemExit(f"build.py: could not read ebur128's summary for {path}")
    f = lambda m: -999.0 if m.group(1) == "-inf" else float(m.group(1))
    return f(p), f(i)

def overs(path, ceiling):
    """where a refused mix is over the ceiling: [(t0, t1, dBTP)] on the 4x-oversampled signal (numpy / scipy)"""
    import numpy as np
    from scipy.signal import resample_poly
    x = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-"]), dtype=np.float32).astype(np.float64)
    y = np.abs(resample_poly(x, 4, 1)); idx = np.where(y > 10 ** (ceiling / 20))[0]; out = []
    for i in idx:
        if out and i - out[-1][1] < 0.05 * 4 * SR: out[-1][1] = i
        else: out.append([i, i])
    return [(i0 / (4 * SR), i1 / (4 * SR), 20 * np.log10(y[i0:i1 + 1].max())) for i0, i1 in out]

def group_of(clip, cue=None):
    if cue and cue.get("group"): return cue["group"]
    return "music" if clip.startswith("mus_") else "amb" if clip.startswith("amb_") else "sfx"

def static_eq(cue):
    """ONE fixed filter for the whole cue (no automation: the same curve from its first to its last sample).
    "hp": [Hz, poles] = a Butterworth high-pass, poles 2 (12 dB/oct) or 4 (24 dB/oct: two 2-pole stages, -6 dB at Hz);
    "lowshelf": [Hz, dB] = a low shelf (Q 0.707). Used to take out low end a phone speaker cannot play (below about
    450 Hz) so the cue's static gain can come up without masking the voice on full-range playback (director's note,
    gate 4: mus_night, mus_laugh); "lp": [Hz] or [Hz, poles] = a Butterworth low-pass (v5: a sound heard through a shut
    door, the bed creak and the snore)."""
    f = ""
    if "hp" in cue:
        hz, poles = cue["hp"]
        if poles not in (2, 4): raise SystemExit(f"build.py: {cue['clip']} hp poles must be 2 or 4")
        f += f",highpass=f={hz}:poles=2:width_type=q:width=0.7071" * (poles // 2)
    if "lowshelf" in cue:
        hz, g = cue["lowshelf"]
        f += f",lowshelf=f={hz}:g={g}:width_type=q:width=0.7071"
    if "lp" in cue:
        hz, poles = (cue["lp"] + [2])[:2]
        if poles not in (2, 4): raise SystemExit(f"build.py: {cue['clip']} lp poles must be 2 or 4")
        f += f",lowpass=f={hz}:poles=2:width_type=q:width=0.7071" * (poles // 2)
    return f

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timing", default="/home/user/napoleon_work/voice/voice_timing.json")
    ap.add_argument("--voice", default="/home/user/napoleon_work/voice/voice_48k.wav")
    ap.add_argument("--clips", default="/home/user/napoleon_work/sound/clips")
    ap.add_argument("--out", default="/home/user/napoleon_work/sound/mix_48k.wav")
    ap.add_argument("--cues", default=os.path.join(ROOT, "scripts/napoleon/sound/cues.json"))
    ap.add_argument("--only", default="voice,music,amb,sfx", help="groups to keep (stems for measuring)")
    ap.add_argument("--nolimit", action="store_true", help="no limiter at all and no true-peak check (32-bit float)")
    ap.add_argument("--nosafety", action="store_true", help="stems: no safety limiter on the sum (its 192 kHz round trip stays) and no true-peak check; the voice limiter stays (32-bit float)")
    ap.add_argument("--novoicelimit", action="store_true", help="the voice branch's 192 kHz round trip without its limiter (to measure what the limiter does)")
    ap.add_argument("--solo", type=int, default=None, help="render only cue N (the --list index), voice silent, no limiter")
    ap.add_argument("--list", default=None, help="write the cue table (JSON) and render nothing")
    ap.add_argument("--ceiling", type=float, default=-1.8, help="the VOICE limiter's ceiling in dBFS at 4x oversampling, and the highest true peak the build accepts for the mix. -1.8 so the film stays under -1 dBTP after mux.sh's AAC 160k encode (measured -1.6 on the v3 mix, -1.4 on v3b with the brighter nocturne; at -1.2 the v2 mp4 reached -0.66: review v2 row 12)")
    ap.add_argument("--gain", type=float, default=6.2, help="master gain in dB on every branch (mono mix about -19 LUFS = -16 LUFS once mux.sh puts it on both channels); v5: REMIX_v5.md")
    ap.add_argument("--safety", type=float, default=-1.0, help="the summed mix's safety limiter in dBFS at 4x; it never engages, because the build refuses a mix whose true peak is over --ceiling")
    a = ap.parse_args()
    keep = set(a.only.split(","))
    if a.solo is not None: keep = {"music", "amb", "sfx"}; a.nolimit = True
    T = json.load(open(a.timing)); spec = json.load(open(a.cues))
    lines_spec = {l["id"]: l for l in json.load(open(os.path.join(ROOT, "scripts/napoleon/voice/napoleon_lines.json")))["lines"]}
    total = T["frames"] / FPS
    L = {l["id"]: l for l in T["lines"]}
    order, bounds = picture_scenes(T["frames"])
    cards = picture_cards()
    for l in T["lines"]:                                        # every line inside its picture scene
        b = bounds[l["id"][0]]
        if not (b[0] <= l["start"] and l["end"] <= b[1]): raise SystemExit(f"build.py: {l['id']} {l['start']}-{l['end']} outside scene {l['id'][0]} {b}")
    def at(x):
        k, which, off = x
        if k.startswith("card:"):
            c = cards.get(k[5:])
            if not c: raise SystemExit(f"build.py: anchor {x}: no fact card after {k[5:]} in voice.ts CARD_RAW")
            return c[0 if which == "from" else 1] + off
        if len(k) == 1:
            if which not in ("from", "to"): raise SystemExit(f"build.py: anchor {x}: a scene takes from / to")
            return bounds[k][0 if which == "from" else 1] + off
        if k in RETIRED: raise SystemExit(f"build.py: anchor {x}: {k} is {RETIRED[k]}")
        if k not in L: raise SystemExit(f"build.py: anchor {x}: no line {k} in the voice timing")
        if which not in ("start", "end"): raise SystemExit(f"build.py: anchor {x}: a line takes start / end")
        return L[k]["start" if which == "start" else "end"] + off
    windows = whisper_windows(spec, L, bounds)
    dip_db = spec.get("whisper_dip", {}).get("db", 0)
    dip_also = set(spec.get("whisper_dip", {}).get("also", []))     # room cues that are not amb_* (sfx_quill)
    for c in dip_also:
        if group_of(c) == "music" or c.startswith("voice"): raise SystemExit(f"build.py: whisper_dip also {c}: music and voice are never ducked")
    durs = {}
    def clip_dur(clip):
        if clip not in durs: durs[clip] = dur(os.path.join(a.clips, clip + ".mp3"))
        return durs[clip]
    # the cue table: every cue with its times (film seconds) and its filter chain
    table = []
    def cue(kind, c, anchor_t, until_t, fade, fade_out):
        clip = c["clip"]; path = os.path.join(a.clips, clip + ".mp3")
        if not os.path.exists(path): raise SystemExit(f"build.py: missing clip {path}")
        rate = float(c.get("rate", 1.0)); src = float(c.get("in", 0.0)); sync = float(c.get("sync", src))
        t0 = anchor_t - (sync - src) / rate                       # the cue's first sample on the film clock
        if until_t is not None: length = until_t - t0              # output seconds
        elif "len" in c: length = float(c["len"]) / rate
        else: length = (clip_dur(clip) - src) / rate
        length = max(0.05, length)
        curve = c.get("fade_curve", "tri")
        if curve not in FADE_CURVES: raise SystemExit(f"build.py: {clip} fade_curve {curve!r}: one of {sorted(FADE_CURVES)}")
        table.append({"i": len(table), "kind": kind, "clip": clip, "group": group_of(clip, c), "at": c["at"], "until": c.get("until"),
                      "anchor": round(anchor_t, 3), "start": round(t0, 3), "end": round(t0 + length, 3), "sync_clip": sync, "in": src, "rate": rate,
                      "gain": c["gain"], "loop": bool(c.get("loop")), "fade": fade, "fade_out": fade_out, "eq": static_eq(c), "pitch": c.get("pitch"),
                      "label": c.get("label", ""), "placeholder": c.get("placeholder"), "fade_curve": curve, "_end": t0 + length})
    for b in spec["beds"]:
        cue("bed", b, at(b["at"]), at(b["until"]), b.get("fade", 0.3), b.get("fade_out"))
    for h in spec["hits"]:
        cue("hit", h, at(h["at"]), None, h.get("fade", 0), h.get("fade_out"))
    for l in T["lines"]:
        ls = lines_spec[l["id"]]
        if "card" in ls:
            cue("card", {**spec["cards"], "at": [l["id"], "end", ls.get("card_delay", 0) + 0.1], "label": f"card after {l['id']}"},
                l["end"] + ls.get("card_delay", 0) + 0.1, None, 0, None)
    for r in table:                                             # a cue may run past the end (the output is cut to the voice track's length), never start outside
        if r["start"] < -1e-6 or r["start"] >= total:
            raise SystemExit(f"build.py: cue {r['i']} {r['clip']} starts at {r['start']:.3f} s, outside the film (0-{total:.3f})")
        if r["kind"] == "bed" and r.pop("_end") > total + 1e-3:     # the unrounded end, 1 ms tolerance (a bed "until" G to on a film
            raise SystemExit(f"build.py: bed {r['i']} {r['clip']} runs to {r['end']:.3f} s, past the film's end {total:.3f}")   # of 5312 f was refused at 177.067 = 177.067)
        r.pop("_end", None)
    if a.list:
        json.dump({"total": total, "scenes": {s: bounds[s] for s in order}, "cards": cards, "cues": table}, open(a.list, "w"), indent=1, ensure_ascii=False)
        print("cue table", a.list, len(table), "cues"); return
    # the master gain goes on every branch; the 4x peak limiter on the voice branch only (it can never touch the music: MAJOR 5).
    # latency=1: the limiter's 5 ms look-ahead is compensated (until v2 the whole mix came out 5 ms late)
    gain = 0.0 if a.solo is not None else a.gain
    v_lim = "" if a.nolimit else ",aresample=192000,aresample=48000" if a.novoicelimit else \
        f",aresample=192000,alimiter=limit={10 ** (a.ceiling / 20):.4f}:level=false:latency=1,aresample=48000"
    inputs, flt = [a.voice], ["[0:a]aresample=48000,aformat=channel_layouts=mono" + (f",volume={gain}dB{v_lim}" if ("voice" in keep and a.solo is None) else ",volume=0") + "[v]"]
    mix = ["[v]"]; dipped = []
    for r in table:
        if r["group"] not in keep or (a.solo is not None and r["i"] != a.solo): continue
        path = os.path.join(a.clips, r["clip"] + ".mp3"); k = len(inputs)
        inputs.append((["-stream_loop", "-1"] if r["loop"] else [], path))
        length = r["end"] - r["start"]; rate = r["rate"]; t0 = r["start"]
        f = f"[{k}:a]aresample=48000,aformat=channel_layouts=mono,atrim={r['in']:.4f}:{r['in'] + length * rate:.4f},asetpts=PTS-STARTPTS"
        if rate != 1.0: f += f",asetrate={int(round(SR * rate))},aresample=48000"
        if r["pitch"]: f += f",rubberband=pitch={2 ** (r['pitch'] / 12):.6f}:transients=smooth:window=long"
        f += f"{r['eq']},volume={r['gain'] + gain:.4f}dB"                # the cue's static gain + the master gain
        fo = r["fade"] if r["fade_out"] is None else r["fade_out"]      # "fade_out" (s) overrides the fade at the end
        fc = "" if r["fade_curve"] == "tri" else f":curve={r['fade_curve']}"
        if r["fade"]: f += f",afade=t=in:d={r['fade']}{fc}"
        if fo: f += f",afade=t=out:st={max(0, length - fo):.4f}:d={fo}{fc}"
        ms = int(round(max(0, t0) * 1000)); f += f",adelay={ms}|{ms}"
        env, hit = dip_filter(windows, dip_db, t0, t0 + length) if (r["group"] == "amb" or (r["clip"] in dip_also and r["kind"] == "bed")) else ("", [])   # the whisper dip: the room only
        # (an "also" clip dips only as a BED, the room loop; a short hit cut from the same clip, e.g. skin A's nib ticks from sfx_quill, is an effect and never dips)
        if env: dipped.append(f"{r['clip']}@{'+'.join(hit)}")
        f += env + f"[c{k}]"
        flt.append(f); mix.append(f"[c{k}]")
    # the sum: padded / trimmed to the voice track's exact length, then the SAFETY limiter (4x: a 48 kHz limiter at 0.89 let
    # true peaks reach -0.8 dBTP) that never engages (the true-peak check below refuses any mix it could have touched)
    n_out = int(round(total * SR))
    safety = "" if a.nolimit else f",aresample=192000,aresample=48000,apad,atrim=end_sample={n_out}" if a.nosafety else \
        f",aresample=192000,alimiter=limit={10 ** (a.safety / 20):.4f}:level=false:latency=1,aresample=48000,apad,atrim=end_sample={n_out}"
    flt.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:dropout_transition=0,apad,atrim=end_sample={n_out}{safety}[out]")
    args = ["ffmpeg", "-y", "-v", "error", "-i", a.voice]
    for x in inputs[1:]: args += x[0] + ["-i", x[1]]
    args += ["-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "1", "-ar", str(SR)]
    check = not (a.nolimit or a.nosafety or a.novoicelimit)
    if not check: args += ["-c:a", "pcm_f32le"]                 # stems: no clipping at the 16-bit ceiling
    out = a.out if not check else (a.out[:-4] if a.out.endswith(".wav") else a.out) + ".rendering.wav"
    args += [out]
    subprocess.run(args, check=True)
    if a.solo is not None: return
    if check:                                                   # the true-peak check: the safety limiter never engaged
        tp, lufs = true_peak_and_loudness(out)
        if tp > a.ceiling + 0.05:
            bad = out.replace(".rendering.wav", ".refused.wav"); os.replace(out, bad)
            where = "  ".join(f"{t0:.3f}-{t1:.3f} s {db:.2f}" for t0, t1, db in overs(bad, a.ceiling))
            raise SystemExit(f"build.py: REFUSED: the mix's true peak is {tp:.2f} dBTP, over the {a.ceiling} dBTP ceiling (the safety limiter "
                             f"at {a.safety} dBFS may have pulled the music down). Over at: {where}. Left as {bad}. Lower the cue that peaks "
                             f"there, or, under a line, run scripts/napoleon/voice/hot_syllables.py --check (and --build): the voice's clip gain "
                             f"is solved against the bed.")
        os.replace(out, a.out)
        print(f"true peak {tp:.2f} dBTP (ceiling {a.ceiling}: the safety limiter at {a.safety} dBFS never engaged), {lufs:.2f} LUFS integrated")
    print("mix", a.out, f"{dur(a.out):.2f} s (film {total:.2f} s)", "scenes (picture cuts, s)", {s: [round(x, 3) for x in bounds[s]] for s in order})
    if windows: print(f"whisper dip {dip_db} dB on the room ({', '.join(dipped) or 'no room cue in the stems kept'}):", "  ".join(f"{w[0]} {w[1]:.2f}>{w[2]:.2f}..{w[3]:.2f}>{w[4]:.2f}" for w in windows))
    ph = [r for r in table if r["placeholder"] and r["group"] in keep]
    if ph: print(f"PLACEHOLDERS ({len(ph)}; stand-ins until the sound farm's clips exist):", "  ".join(f"{r['clip']}@{r['anchor']:.2f}" for r in ph))

if __name__ == "__main__":
    main()
