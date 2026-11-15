#!/usr/bin/env python3
"""《采访牛顿的一天》 (formerly 《跟着牛顿过一天》) THE SWAP POINT: drops a new take of a line into the film in one command (v5: F16, whose new words
「她丢下了您，您却守着她。」 need a take of their own; until it is in, F16 plays the v4 take with the v4 words).

  python3 scripts/newton/voice/swap_take.py F16 <the farm's take, mp3 or wav> --dry-run     what it would do; writes nothing
  python3 scripts/newton/voice/swap_take.py F16 <the farm's take, mp3 or wav>               the swap and the rebuild
          [--report <the farm's report.json>] [--segment N] [--take NAME] [--zh ... --en ... --tts ...] [--gain DB]
          [--allow-long] [--no-build]
  python3 scripts/newton/voice/swap_take.py F16 --back          back to the take before (the v4 take)
  python3 scripts/newton/voice/swap_take.py F16 --show          what is in now

The swap entry (newton_lines.json "swap" -> "F16") names the take that plays, its words (zh, en, tts, screens), its
clip's length (len_s), its gain and "max_s" (the longest clip it takes: next.est_s + 1.0 s); "next" holds the words the
new take says (v5's), used unless --zh / --en / --tts are given. A swap:
  1. THE CUT STEP. The voice farm renders a line as a DIALOGUE after the line before it, so the tone carries (v5's F16
     takes: Newton's F15 0-4.36 s, then Lin's F16): the take holds two voices. swap_take reads the farm's report.json (the
     one beside the take, or --report), finds the take's clip and the voice segment that says the line (its Han characters;
     --segment N to choose), and cuts that segment out IN THE SILENCE around it, found by the envelope the way
     cut_lines.py cuts every dialogue (the middle of the longest run of 10 ms frames under the take's peak -40 dB between
     the neighbour's last aligned character and this line's first, searched 0.12 s / 0.08 s wider; 0.6 s wider when there
     is no such run of 80 ms), never at the service's segment boundary (its times run late: in s1686 Lin's 她 sounds from
     4.46 s, the alignment says 4.64). A take with no report entry, or a single voice, is used whole.
  2. trims it the way cut_lines.py trims every clip (keeps 0.05 s before the first sound and 0.12 s after the last, 10 ms
     frames over -48 dB under the take's peak; silences inside it over 0.40 s shortened to 0.40 s; 8 ms fades);
     its characters (the alignment) come along, offset so the first voiced one starts where the first sound is (as for
     G01a / G01b), so the subtitle starts with the voice;
  3. REFUSES a clip longer than the entry's max_s (two voices left in one clip: v5's s1686 used whole is 7.20 s) unless
     --allow-long;
  4. writes <lines_dir>/F16.wav (the clip it replaces is kept in <lines_dir>/swap/F16_<take>.wav for --back), the entry
     (the take, its words, its length, the cut; its gain is left to assemble.py's level target, the v4 rule, unless
     --gain) and line F16's words; drops F16's clip gain (clip_gain_v5.json: it was the old take's);
  5. rebuilds: assemble.py, gen_timing.py (voice.ts, captions.ts: the picture looks every frame up, so it follows), then
     hot_syllables.py --build (the new take's clip gain, so the bus limiter stays idle; it reassembles). Then: the sound
     mix rebuild (scripts/newton/sound, the producer's; every line 10 LU over the bed) and the renders.
--dry-run prints the cut, the trim, the clip's length, the guard and the film's new length, and writes nothing.
"""
import argparse, json, os, re, shutil, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
LINES = os.path.join(HERE, "newton_lines.json")
sys.path.insert(0, HERE)
from cut_lines import load, env_db, squeeze, longest_silence, cut_between, SR, TRIM_DB, PRE, POST, FADE, WIDEN   # noqa: E402  (cut_lines' rules)

BAD_WORDS = ("quiet", "soft", "low", "whisper", "hush", "breath", "murmur")
FPS, TAIL_S = 30, 0.8
HAN = r"[一-鿿]"
VOICED = r"[一-鿿A-Za-z0-9]"


def seg_chars(al, g):
    """a voice segment's characters outside [tags]: [(index, char)]"""
    ch, out, inb = al["characters"], [], False
    for i in range(g["character_start_index"], g["character_end_index"]):
        if ch[i] == "[": inb = True
        elif ch[i] == "]": inb = False
        elif not inb: out.append((i, ch[i]))
    return out


def find_clip(report, take_file):
    if not report or not os.path.exists(report): return None
    try: rep = json.load(open(report))
    except (ValueError, OSError) as err: sys.exit(f"swap_take: {report} is not the farm's report.json ({err})")
    b = os.path.basename(take_file); stem = os.path.splitext(b)[0]
    return next((c for c in rep.get("clips", []) if os.path.basename(c.get("file") or "") == b or c.get("name") == stem), None)


def cut_from_dialogue(x, clip, zh, segment=None):
    """THE CUT STEP: [t0, t1] of the segment that says `zh` in the take x (seconds), how it was found, and its characters
    [[char, start, end]] (take seconds, outside tags)"""
    e = env_db(x); dur = len(x) / SR
    al, segs = clip["alignment"], clip["voice_segments"]
    st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
    want = "".join(re.findall(HAN, zh))
    if segment is None:
        texts = ["".join(c for _, c in seg_chars(al, g) if re.match(HAN, c)) for g in segs]
        hits = [i for i, t in enumerate(texts) if t and (t == want or want in t or t in want)]
        if len(hits) != 1: sys.exit(f"swap_take: {len(hits)} voice segments of {clip.get('file')} say 「{zh}」 ({texts}): give --segment N")
        segment = hits[0]
    g = segs[segment]
    def voiced(gi):
        vs = [i for i, c in seg_chars(al, segs[gi]) if re.match(VOICED, c)]
        return (st[vs[0]], en[vs[-1]]) if vs else (segs[gi]["start_time_seconds"], segs[gi]["end_time_seconds"])
    v0, v1 = voiced(segment)
    how = {"segment": segment, "voice_id": g.get("voice_id"), "service_segment_s": [g["start_time_seconds"], g["end_time_seconds"]],
           "aligned_voiced_s": [round(v0, 3), round(v1, 3)]}
    def between(a_end, b_start, a_start, b_end):
        n0, n1 = min(a_end, b_start) - 0.12, max(a_end, b_start) + 0.08
        run = longest_silence(e, n0, n1)
        if run and run[1] - run[0] >= 0.08: return (run[0] + run[1]) / 2, {"silent_run_s": [round(run[0], 2), round(run[1], 2)]}
        lo, hi = max(min(a_end, b_start) - WIDEN, a_start + 0.15), min(max(a_end, b_start) + WIDEN, b_end - 0.05)
        return cut_between(e, lo, hi), {"quietest_in_s": [round(lo, 2), round(hi, 2)]}
    t0, t1 = 0.0, dur
    if segment > 0:
        p0, p1 = voiced(segment - 1); t0, how["before"] = between(p1, v0, p0, v1)
    if segment < len(segs) - 1:
        n0, n1 = voiced(segment + 1); t1, how["after"] = between(v1, n0, v0, n1)
    how["cut_s"] = [round(t0, 3), round(t1, 3)]
    chars = [[c, round(st[i], 3), round(en[i], 3)] for i, c in seg_chars(al, g)]
    return t0, t1, how, chars


def trim(x, t0, t1, chars=None):
    """cut_lines' trim of x within [t0, t1]: the clip (8 ms fades), the kept range, the squeezed spans, the characters
    shifted for the squeeze and offset so the first voiced one starts PRE s into the clip"""
    e = env_db(x)
    a0, a1 = int(t0 * 100), max(int(t0 * 100) + 1, int(t1 * 100))
    loud = np.where(e[a0:a1] > TRIM_DB)[0]
    if not len(loud): sys.exit("swap_take: the take is silent there")
    k0 = max(t0, (a0 + loud[0]) / 100.0 - PRE); k1 = min(t1, (a0 + loud[-1] + 1) / 100.0 + POST)
    y = x[int(k0 * SR): int(k1 * SR)].copy()
    rem = []
    y = squeeze(y, e[int(k0 * 100): int(k1 * 100)], rem).astype(np.float32)
    f = min(int(FADE * SR), len(y) // 4)
    if f > 0: y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    out_chars, offset = [], 0.0
    if chars:
        def shift(t):
            d = 0.0
            for ra, rb in rem:
                if t - k0 >= rb: d += rb - ra
                elif t - k0 > ra: d += (t - k0) - ra
            return t - d
        sh = [[c, shift(a), shift(b)] for c, a, b in chars]
        vs = [c for c in sh if re.match(VOICED, c[0])]
        if vs:
            offset = (k0 + PRE) - vs[0][1]   # the service's times run late: the first voiced character where the first sound is
            sh = [[c, round(min(max(a + offset, k0), k0 + len(y) / SR), 3), round(min(max(b + offset, k0), k0 + len(y) / SR), 3)] for c, a, b in sh]
        out_chars = sh
    return y, (round(k0, 3), round(k1, 3)), [[round(a, 3), round(b, 3)] for a, b in rem], out_chars, round(offset, 3)


def write(y, f):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", f],
                   input=y.astype(np.float32).tobytes(), check=True)


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())


def film_now(spec):
    """the film's frames now, its lines, and the unrounded end assemble.py rounds to frames (the last line's end + its
    after + TAIL_S)"""
    t = json.load(open(os.path.join(spec["voice"]["out"], "voice_timing.json")))
    return t["frames"], {l["id"]: l for l in t["lines"]}, t["lines"][-1]["end"] + spec["lines"][-1].get("after", 0) + TAIL_S


def build():
    vb = json.load(open(LINES))["voice"]
    subprocess.run([sys.executable, os.path.join(HERE, "assemble.py")], check=True)
    subprocess.run([sys.executable, os.path.join(ROOT, "scripts/newton/gen_timing.py"), os.path.join(vb["out"], "voice_timing.json")], check=True)
    subprocess.run([sys.executable, os.path.join(HERE, "hot_syllables.py"), "--build"], check=True)   # the clip gain of the new take
    subprocess.run([sys.executable, os.path.join(HERE, "hot_syllables.py"), "--check"], check=True)


def drop_clip_gain(spec, line_id):
    f = spec["voice"].get("clip_gain")
    if not f or not os.path.exists(f): return False
    cg = json.load(open(f)); hit = False
    for k in ("lines", "lift_db"):
        if line_id in cg.get(k, {}): cg[k].pop(line_id); hit = True
    if hit: json.dump(cg, open(f, "w"), indent=1)
    return hit


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("line")
    ap.add_argument("take_file", nargs="?")
    ap.add_argument("--report", default=None, help="the farm's report.json (default: the one beside the take, when it lists the take)")
    ap.add_argument("--segment", type=int, default=None, help="the voice segment that says the line (default: found by its words)")
    ap.add_argument("--take", default=None, help="the take's name (default: the entry's next.take)")
    ap.add_argument("--zh"); ap.add_argument("--en"); ap.add_argument("--tts")
    ap.add_argument("--gain", type=float, default=None)
    ap.add_argument("--allow-long", action="store_true", help="take a clip longer than the entry's max_s")
    ap.add_argument("--dry-run", action="store_true", help="print the cut, the trim, the length and the film's new length; write nothing")
    ap.add_argument("--back", action="store_true")
    ap.add_argument("--show", action="store_true")
    ap.add_argument("--no-build", action="store_true")
    a = ap.parse_args()
    spec = json.load(open(LINES))
    sw = spec.get("swap", {}).get(a.line) or sys.exit(f"swap_take: {a.line} is not a swap point (newton_lines.json swap: {', '.join(spec.get('swap', {}))})")
    if a.show:
        print(json.dumps({k: v for k, v in sw.items() if k != "prev"}, ensure_ascii=False, indent=1)); return
    line = next(l for l in spec["lines"] if l["id"] == a.line)
    vb = spec["voice"]; lines_dir = vb["lines_dir"]
    keep_dir = os.path.join(lines_dir, "swap")
    clip = os.path.join(lines_dir, a.line + ".wav")
    cuts_f = vb["cuts"][0]
    cuts = json.load(open(cuts_f))
    ci = next(i for i, c in enumerate(cuts) if c["id"] == a.line)
    max_s = sw.get("max_s") or ((sw.get("next") or {}).get("est_s") or 0) + 1.0
    if a.back:
        if a.dry_run: sys.exit("swap_take: --back has no dry run (it restores the kept clip)")
        prev = sw.get("prev") or sys.exit("swap_take: no take before this one")
        kept = os.path.join(keep_dir, f"{a.line}_{prev['take']}.wav")
        if not os.path.exists(kept): sys.exit(f"swap_take: {kept} is missing")
        os.makedirs(keep_dir, exist_ok=True)
        shutil.copyfile(clip, os.path.join(keep_dir, f"{a.line}_{sw['take']}.wav"))   # the clip that plays now
        shutil.copyfile(kept, clip)
        new = dict(prev); new["prev"] = {k: v for k, v in sw.items() if k != "prev"}
        cut = new.pop("cut", None)
        new["prev"]["cut"] = cuts[ci]
        new.setdefault("max_s", max_s)
    else:
        if not a.take_file: sys.exit("swap_take: give the new take's file (or --back / --show)")
        nx = sw.get("next") or {}
        words = {"zh": a.zh or nx.get("zh"), "en": a.en or nx.get("en"), "tts": a.tts or nx.get("tts")}
        if not all(words.values()): sys.exit("swap_take: the new take's zh / en / tts are not known (give --zh --en --tts)")
        if any(w in words["tts"].lower() for w in BAD_WORDS): sys.exit(f"swap_take: the voice direction says one of {BAD_WORDS}")
        screens = nx.get("screens") if words["zh"] == nx.get("zh") and words["en"] == nx.get("en") else [{"zh": words["zh"], "en": words["en"]}]
        x = load(a.take_file)
        report = a.report or os.path.join(os.path.dirname(os.path.abspath(a.take_file)), "report.json")
        rc = find_clip(report, a.take_file)
        if a.report and not rc: sys.exit(f"swap_take: {a.report} does not list {os.path.basename(a.take_file)}")
        if rc and len(rc.get("voice_segments", [])) > 1 and "alignment" in rc:
            t0, t1, how, chars = cut_from_dialogue(x, rc, words["zh"], a.segment)
            how["report"] = os.path.abspath(report)
        else:
            t0, t1, chars = 0.0, len(x) / SR, None
            how = {"whole_take": True, "why": "no report entry with two voices" if not rc else "one voice in the report"}
        y, kept, squeezed, chars, offset = trim(x, t0, t1, chars)
        n_len = round(len(y) / SR, 3)
        frames, tl, t_end = film_now(spec)
        delta = n_len - float(sw["len_s"])
        new_frames = int(round((t_end + delta) * FPS))
        ok = n_len <= max_s + 1e-6
        print(f"{a.line} <- {a.take_file}")
        if "whole_take" in how: print(f"  the cut: the whole take ({how['why']})")
        else:
            print(f"  the cut: voice segment {how['segment']} ({how['voice_id']}; the service says {how['service_segment_s'][0]:.2f}-{how['service_segment_s'][1]:.2f} s, "
                  f"its aligned characters {how['aligned_voiced_s'][0]:.2f}-{how['aligned_voiced_s'][1]:.2f} s), cut at {t0:.3f}-{t1:.3f} s "
                  f"(before: {how.get('before', 'the take start')}; after: {how.get('after', 'the take end')})")
        print(f"  the trim: kept {kept[0]:.3f}-{kept[1]:.3f} s of the take, squeezed {squeezed or 'nothing'}; characters offset {offset:+.3f} s")
        print(f"  the clip: {n_len:.3f} s (now {sw['len_s']} s; max_s {max_s:.2f} s): {'OK' if ok else 'REFUSED (longer than max_s)'}")
        print(f"  the film: {frames} frames = {frames / FPS:.2f} s now -> {new_frames} frames = {new_frames / FPS:.2f} s; everything after "
              f"{a.line} moves {delta:+.3f} s (G01a {tl['G01a']['start']:.2f} -> {tl['G01a']['start'] + delta:.2f} s)" if "G01a" in tl else "")
        print(f"  the words: 「{words['zh']}」 / {words['en']}")
        if a.dry_run: print("dry run: nothing written"); return
        if not ok and not a.allow_long:
            sys.exit(f"swap_take: the clip would be {n_len:.3f} s, longer than max_s {max_s:.2f} s (next.est_s + 1.0): two voices left in it? "
                     "Give the farm's report.json (--report) or --segment, or --allow-long if it is right")
        os.makedirs(keep_dir, exist_ok=True)
        shutil.copyfile(clip, os.path.join(keep_dir, f"{a.line}_{sw['take']}.wav"))   # the clip that plays now, for --back
        write(y, clip)
        new = {"take": a.take or nx.get("take") or "new", "wav": os.path.abspath(a.take_file), **words, "screens": screens,
               "len_s": n_len, "gain_db": a.gain, "cut": how, "trimmed_s": list(kept), "squeezed_s": squeezed, "max_s": max_s,
               "next": nx, "how": sw.get("how"), "prev": {**{k: v for k, v in sw.items() if k != "prev"}, "cut": cuts[ci]}}
        cut = {"id": a.line, "scene": line["scene"], "file": os.path.basename(a.take_file), "kept": list(kept), "chars": chars or [],
               "take": new["take"], "cut": how.get("cut_s", [0.0, round(len(x) / SR, 3)]), "squeezed": squeezed, "char_offset_s": offset}
    new["len_s"] = round(dur(clip), 3)
    spec["swap"][a.line] = new
    for k in ("zh", "en", "tts", "screens"): line[k] = new[k]
    if new.get("gain_db") is None: line.pop("gain_db", None)
    else: line["gain_db"] = new["gain_db"]
    cuts[ci] = cut if cut else {"id": a.line, "scene": line["scene"], "kept": [0, new["len_s"]], "chars": []}
    json.dump(cuts, open(cuts_f, "w"), ensure_ascii=False)
    json.dump(spec, open(LINES, "w"), ensure_ascii=False, indent=1)
    if drop_clip_gain(spec, a.line): print(f"{a.line}: its clip gain (the old take's) is dropped")
    print(f"{a.line}: now the {new['take']} take ({new['len_s']} s) 「{new['zh']}」 / {new['en']}")
    if not a.no_build: build()
    print("next: the sound mix rebuild (scripts/newton/sound; every line 10 LU over the bed, full band and phone band), then the renders")


if __name__ == "__main__":
    main()
