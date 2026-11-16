#!/usr/bin/env python3
"""《采访牛顿的一天》 (formerly 《跟着牛顿过一天》) v5 (the redo, gate-2 script table): writes the v5 lines file and the v5 clip folder from the takes that
already exist. No new take is made and no farm is called.

  python3 scripts/newton/voice/make_v5.py [--script lines_v5.json] [--force]

Reads
  --script   the gate-2 table's lines (/mnt/project-files/next-video/newton/redo/lines_v5.json, revision 3)
  scripts/newton/voice/newton_lines_v4.json             the v4 lines file (the scenes' places, F16's v4 words)
  /home/user/newton_work/film/voice/voice_timing_v4.json  the v4 voice track's per-line gains (gain_db)
  /home/user/newton_work/v4/voice/picked/                 the picked v4 clips (lines/<id>.wav, picks_v2.json) and their
                                                          alignment (line_cuts.json); G02 there is the laugh composite
Writes
  scripts/newton/voice/newton_lines.json   the v5 lines (A01 cut, G01 split into G01a / G01b, v5's pre / after / cards /
                                           title span / en_on_screen; F16 = THE SWAP POINT, see swap_take.py)
  <V5>/lines/<id>.wav                      one clip per v5 line (V5 = /home/user/newton_work/film/voice/v5): the v4 clip of
                                           its take; G01a / G01b cut from the G01 clip at its recorded pause
  <V5>/line_cuts.json                      the alignment entries per v5 id (assemble.py's word times)
  <V5>/split_G01.json                      where G01 was split and the level at every edge (the silence check)

Each line keeps the v4 take's gain (its "gain_db"; G01a and G01b both G01's), and the lines file keeps the v4 level target
("level_target_db") for a take that has no gain yet (the F16 swap), so the voice sits where REMIX_v3 measured it.
It refuses to overwrite a lines file whose F16 swap is not on the v4 take (that would undo a swap) unless --force.

THE v5 REVIEW FIXES (14 Nov) are applied on top of the gate-2 table, each line keeping the script's value beside the built
one ("review_fix"): TIMING_FIX (F05 pre 0.6, F09 pre 0.6: the held beats the script's directions ask for; G04 after 4.8:
card 5 gone before the camera switches off), RETIME (A06's character times laid on its heard speech) and the hot
syllables' clip gains (the lines file's voice.clip_gain -> clip_gain_v5.json, written by hot_syllables.py and applied by
assemble.py), so the bus limiter never touches the voice.
"""
import argparse, json, os, shutil, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = "/mnt/project-files/next-video/newton/redo/lines_v5.json"
V4_LINES = os.path.join(HERE, "newton_lines_v4.json")
V4_TIMING = "/home/user/newton_work/film/voice/voice_timing_v4.json"
PICKED = "/home/user/newton_work/v4/voice/picked"
V5 = "/home/user/newton_work/film/voice/v5"
OUT_DIR = "/home/user/newton_work/film/voice"
SR, HOP = 48000, 480
SIL_DB, TRIM_DB = -40.0, -48.0          # cut_lines.py's: a silent 10 ms frame / the trim threshold (dB under the peak)
PRE, POST, FADE = 0.05, 0.12, 0.008     # cut_lines.py's: kept before the first sound / after the last (decay), fades
LEVEL_TARGET_V4 = -23.748               # assemble.py's median speech level of the 55 v4 clips (dBFS), measured 14 Nov
BAD_WORDS = ("quiet", "soft", "low", "whisper", "hush", "breath", "murmur")
CLIP_GAIN = os.path.join(HERE, "clip_gain_v5.json")   # the hot syllables' clip gains (hot_syllables.py writes it, assemble.py applies it)

# THE v5 REVIEW FIXES (14 Nov, the review of the built v5 voice; they sit on top of the gate-2 table, which stays as Jay has it)
TIMING_FIX = {
    # the script's own directions, never put into the timing (v4 had the same 0.1 s gaps): each heard gap becomes ~0.9 s
    "F05": {"pre": 0.6, "why": "F05's Emotion cell: one held beat before the line (he could walk away and does not); the "
                              "personality sheet's held beat before each brush-off (his 14 f reaction delay)"},
    "F09": {"pre": 0.6, "why": "F08's row: N: no move for a beat; the turn (bible): music and camera go quiet, the fire "
                              "heard alone before \"My mother\" (the push still runs F09 -> F15, its length unchanged)"},
    # card 5 must be gone before her camera switches off (OFF_AT = TOTAL - 42): +9 f, OFF_AT two frames after its last frame
    "G04": {"after": 4.8, "why": "card 5 (f5107-5217 in the first build) was still up when the REC lamp died (OFF_AT f5211)"},
}
# lines whose character times are re-timed onto the HEARD speech: the service's times run short there, so a beat placed on
# a word would land in the voice. Each listed line's characters are split into phrases at punctuation and the clip's sound
# into phrases at silences (10 ms frames under SIL_DB, 0.15 s or longer; a sound under 50 ms is no phrase); when the counts agree, each phrase's characters
# are spread over its heard phrase in proportion to their aligned lengths (heard_retime)
RETIME = {"A06": "the alignment put 次 at film 17.08-17.16 s; the voice sounds until 17.70 and is silent from 17.75"}


def load(f):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()


def write(y, f):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", f],
                   input=y.astype(np.float32).tobytes(), check=True)


def env_db(x):
    n = len(x) // HOP
    r = np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(r / (r.max() + 1e-12) + 1e-12)


def split_at_pause(x, near0, near1):
    """THE SPLIT OF A TAKE AT ITS PAUSE: the longest run of silent 10 ms frames (under SIL_DB) in [near0 - 0.4, near1 + 0.2]
    s of clip x; the first half keeps POST s after its last sound (frames over TRIM_DB), the second starts PRE s before its
    first. Returns (a_end s, b_start s, report); fails unless both new edges lie inside the silent run."""
    e = env_db(x)
    a, b = max(0, int((near0 - 0.4) * 100)), min(len(e) - 1, int((near1 + 0.2) * 100))
    best, start = None, None
    for i in range(a, b + 2):
        sil = i <= b and e[i] < SIL_DB
        if sil and start is None: start = i
        if not sil and start is not None:
            if best is None or i - start > best[1] - best[0]: best = (start, i)
            start = None
    if not best or best[1] - best[0] < 20: raise SystemExit(f"make_v5: no silent run of 0.2 s or more near {near0:.2f}-{near1:.2f} s")
    r0, r1 = best                                            # frames [r0, r1) are silent
    mid = (r0 + r1) // 2
    last = max(i for i in range(0, mid) if e[i] > TRIM_DB)   # the last sounding frame before the pause (its decay)
    first = min(i for i in range(mid, len(e)) if e[i] > TRIM_DB)   # the first after it
    a_end, b_start = (last + 1) / 100 + POST, first / 100 - PRE
    if not (r0 / 100 <= a_end <= r1 / 100 and r0 / 100 <= b_start <= r1 / 100 and a_end < b_start):
        raise SystemExit(f"make_v5: the cut edges {a_end:.2f} / {b_start:.2f} s are not inside the silent run {r0 / 100:.2f}-{r1 / 100:.2f} s")
    edge = lambda t: round(float(e[min(len(e) - 1, max(0, int(round(t * 100))))]), 1)
    rep = {"silent_run_s": [r0 / 100, r1 / 100], "silent_run_len_s": round((r1 - r0) / 100, 2),
           "loudest_between_the_cuts_db": round(float(e[int(round(a_end * 100)): int(round(b_start * 100))].max()), 1),
           "last_sound_s": (last + 1) / 100, "first_sound_s": first / 100,
           "a": {"start_s": 0.0, "end_s": round(a_end, 3), "edge_db": [edge(0.0), edge(a_end - 0.01)]},
           "b": {"start_s": round(b_start, 3), "end_s": round(len(x) / SR, 3), "edge_db": [edge(b_start), edge(len(x) / SR - 0.01)]},
           "db_note": "10 ms RMS frames in dB under the clip's loudest frame; silent < -40, trim < -48"}
    return a_end, b_start, rep


def fade(y, start=True, end=True):
    f = min(int(FADE * SR), len(y) // 4)
    if f > 0:
        if start: y[:f] *= np.linspace(0, 1, f)
        if end: y[-f:] *= np.linspace(1, 0, f)
    return y


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())


def heard_retime(cut, clip, who):
    """THE HEARD RE-TIME of one line's character times (RETIME): returns a copy of its alignment entry whose voiced
    characters lie on the clip's heard phrases, or raises when the phrase counts disagree. Times stay in take seconds
    (assemble.py maps cut["kept"][0] to the clip's start)."""
    import re
    x = load(clip); e = env_db(x); v0 = cut["kept"][0]
    loud = e >= SIL_DB
    heard, i, n = [], 0, len(e)                  # sounding runs, joined across silences shorter than 0.15 s
    while i < n:
        if loud[i]:
            j = i
            while j < n and (loud[j] or (j + 15 < n and loud[j:j + 15].any())): j += 1
            if j - i >= 5: heard.append([i / 100, j / 100])   # a blip under 50 ms is not a phrase (A06: the cut's last 10 ms)
            i = j
        else:
            i += 1
    pat = r"[\u4e00-\u9fff]" if who == "ji" else r"[A-Za-z0-9]"
    phrases, cur = [], []
    for k, (ch, a, b) in enumerate(cut["chars"]):
        if re.match(pat, ch): cur.append(k)
        elif re.match(r"[，。！？、；：,.!?;:…—]", ch) and cur: phrases.append(cur); cur = []
    if cur: phrases.append(cur)
    if len(phrases) != len(heard):
        raise SystemExit(f"make_v5: heard re-time of {cut['id']}: {len(phrases)} phrases in the words, {len(heard)} heard in the clip")
    chars = [list(c) for c in cut["chars"]]
    for ks, (h0, h1) in zip(phrases, heard):
        a0, a1 = chars[ks[0]][1], chars[ks[-1]][2]
        sc = (h1 - h0) / max(1e-6, a1 - a0)
        for k in ks:
            chars[k][1] = round(v0 + h0 + (chars[k][1] - a0) * sc, 3)
            chars[k][2] = round(v0 + h0 + (chars[k][2] - a0) * sc, 3)
    vk = [k for k, c in enumerate(chars) if re.match(pat, c[0])]
    for k, c in enumerate(chars):               # spaces / punctuation: between their voiced neighbours
        if k in vk: continue
        p = max([q for q in vk if q < k], default=None); nx = min([q for q in vk if q > k], default=None)
        a = chars[p][2] if p is not None else c[1]; b = chars[nx][1] if nx is not None else max(a, chars[p][2] if p is not None else c[2])
        c[1], c[2] = round(min(a, b), 3), round(max(a, b), 3)
    out = dict(cut); out["chars"] = chars
    out["retimed"] = {"heard_s": [[round(a, 2), round(b, 2)] for a, b in heard], "why": RETIME[cut["id"]],
                      "aligned_chars": cut["chars"]}
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", default=SCRIPT)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    out_lines = os.path.join(HERE, "newton_lines.json")
    if os.path.exists(out_lines) and not a.force:
        cur = json.load(open(out_lines))
        sw = cur.get("swap", {}).get("F16")
        if sw and sw.get("take") != "v4": raise SystemExit("make_v5: F16 is swapped to its new take; rerunning would undo it (--force to do it anyway)")
    S = json.load(open(a.script))
    v4 = json.load(open(V4_LINES))
    v4l = {l["id"]: l for l in v4["lines"]}
    gains = {l["id"]: l["gain_db"] for l in json.load(open(V4_TIMING))["lines"] if "gain_db" in l}
    picks = json.load(open(os.path.join(os.path.dirname(PICKED), "picks_v2.json")))
    cuts4 = {c["id"]: c for c in json.load(open(os.path.join(PICKED, "line_cuts.json")))}
    os.makedirs(os.path.join(V5, "lines"), exist_ok=True)

    # ------------------------------------------------------------------ the G01 split (both halves from the one take)
    g = cuts4["G01"]
    gx = load(os.path.join(PICKED, "lines", "G01.wav"))
    k0 = g["kept"][0]
    han = [c for c in g["chars"] if "一" <= c[0] <= "鿿"]
    i_de = next(i for i, c in enumerate(han) if c[0] == "的")
    de_end, xue_start = han[i_de][2] - k0, han[i_de + 1][1] - k0      # the alignment's pause, in clip seconds
    a_end, b_start, rep = split_at_pause(gx, de_end, xue_start)
    rep.update({"take": "G01 (picked/lines/G01.wav, take 1686)", "alignment_pause_s": [round(de_end, 3), round(xue_start, 3)],
                "alignment_note": "the voice service's character times run about 0.2 s late in this take: the heard pause is earlier"})
    ga = fade(gx[: int(round(a_end * SR))].copy(), start=False, end=True)       # its start keeps the v4 clip's own fade
    gb = fade(gx[int(round(b_start * SR)):].copy(), start=True, end=False)
    write(ga, os.path.join(V5, "lines", "G01a.wav")); write(gb, os.path.join(V5, "lines", "G01b.wav"))
    rep["a"]["len_s"] = round(len(ga) / SR, 3); rep["b"]["len_s"] = round(len(gb) / SR, 3)
    json.dump(rep, open(os.path.join(V5, "split_G01.json"), "w"), indent=1)
    # their alignment: each half's characters, offset so its first Han character starts PRE s into its clip (where the
    # heard first sound is: the service's times run late here, so v4's offset would put the subtitle 5 frames late)
    def half(chars, cid, tlen):
        hs = [c for c in chars if "一" <= c[0] <= "鿿"]
        v0 = hs[0][1] - PRE
        return {"id": cid, "scene": "G", "file": g["file"], "from_take": "G01", "split": rep["silent_run_s"],
                "kept": [round(v0, 3), round(v0 + tlen, 3)], "chars": chars, "take": g.get("take")}
    ia = next(i for i, c in enumerate(g["chars"]) if c[0] == "学")
    cut_a = half(g["chars"][:ia], "G01a", len(ga) / SR)
    cut_b = half(g["chars"][ia:], "G01b", len(gb) / SR)

    # ------------------------------------------------------------------ the lines
    swap_src = os.path.join(PICKED, "lines", "F16.wav")
    lines, cuts = [], []
    for l in S["lines"]:
        i, tk = l["id"], l["take"]
        m = {"n": l["n"], "id": i, "script_id": l["script_id"], "v4_id": l.get("v4_id"), "scene": l["scene"], "who": l["who"],
             "tts": l["tts"], "zh": l["zh"], "en": l["en"], "screens": l["screens"]}
        for k in ("pre", "after", "card_hold", "card_delay"):
            if l.get(k): m[k] = l[k]
        if i in TIMING_FIX:                     # the review fixes (above): the script's value is kept beside it
            fx = TIMING_FIX[i]
            m["review_fix"] = {k: {"script": l.get(k, 0), "built": v} for k, v in fx.items() if k != "why"}
            m["review_fix"]["why"] = fx["why"]
            for k, v in fx.items():
                if k != "why": m[k] = v
        if l.get("card"):
            m["card"] = {"zh": l["card"]["zh"], "en": l["card"]["en"], "en_on_screen": bool(l["card"].get("en_on_screen", False))}
        m["en_on_screen"] = bool(l["en_on_screen"])
        for k in ("aside", "question"):
            if l.get(k): m[k] = l[k]
        if tk["status"] == "recorded":
            src = os.path.join(PICKED, "lines", tk["from_id"] + ".wav")
            if abs(dur(src) - (tk["src"][1] - tk["src"][0])) > 0.002: raise SystemExit(f"make_v5: {i}: the picked clip is not the take the script timed")
            shutil.copyfile(src, os.path.join(V5, "lines", i + ".wav"))
            m["take"] = {"status": "recorded", "from_id": tk["from_id"], "pick": picks[tk["from_id"]]}
            m["gain_db"] = gains[tk["from_id"]]
            c = dict(cuts4[tk["from_id"]]); c["id"] = i
            if i in RETIME: c = heard_retime(c, src, l["who"])
            cuts.append(c)
        elif tk["status"] == "recorded_split":
            m["take"] = {"status": "recorded_split", "from_id": "G01", "pick": picks["G01"], "split": rep["silent_run_s"]}
            m["gain_db"] = gains["G01"]
            cuts.append(cut_a if i == "G01a" else cut_b)
        elif tk["status"] == "rerecord":
            # THE SWAP POINT: until the new take arrives, F16 plays the v4 take and shows the v4 words (the swap entry)
            w4 = v4l[tk["from_id"]]
            m.update({"tts": w4["tts"], "zh": w4["zh"], "en": w4["en"], "screens": w4["screens"]})
            m["take"] = {"status": "swap", "swap": i, "note": "plays the swap entry's take (newton_lines.json swap.F16); "
                         "scripts/newton/voice/swap_take.py F16 <new take> drops the new one in"}
            m["gain_db"] = gains[tk["from_id"]]
            shutil.copyfile(swap_src, os.path.join(V5, "lines", i + ".wav"))
            c = dict(cuts4[tk["from_id"]]); c["id"] = i; cuts.append(c)
        else:
            raise SystemExit(f"make_v5: {i}: unknown take status {tk['status']}")
        m["est"] = [l["est_start"], l["est_end"]]
        for k in ("tts",):
            low = m[k].lower()
            if any(w in low for w in BAD_WORDS): raise SystemExit(f"make_v5: {i}: a voice direction says one of {BAD_WORDS}")
        lines.append(m)

    f16 = next(l for l in S["lines"] if l["id"] == "F16")
    w4 = v4l["F16"]
    swap = {"F16": {
        "take": "v4", "wav": swap_src, "zh": w4["zh"], "en": w4["en"], "tts": w4["tts"],
        "screens": w4["screens"], "len_s": round(dur(swap_src), 3), "gain_db": gains["F16"],
        "next": {"take": "v5", "zh": f16["zh"], "en": f16["en"], "tts": f16["tts"], "screens": f16["screens"], "est_s": f16["take"].get("est_s")},
        "max_s": round(f16["take"].get("est_s") + 1.0, 2),
        "how": "python3 scripts/newton/voice/swap_take.py F16 <the farm's take, mp3 or wav> --dry-run, then without "
               "--dry-run. THE CUT STEP: the farm renders F16 as a two-voice dialogue after Newton's F15, so swap_take reads "
               "the farm's report.json (the one beside the take, or --report) and cuts F16's own voice segment out in the "
               "silence before it (the envelope, cut_lines' rule; never at the service's segment boundary), then trims it "
               "the cut_lines way; it refuses a clip longer than max_s (next.est_s + 1.0 s), then rebuilds (assemble.py, "
               "gen_timing.py, hot_syllables.py --build: the new take's clip gain). Then the sound mix rebuild and the "
               "renders; --back returns to the take before",
    }}
    scenes = {}
    for k, sc in S["scenes"].items():
        v = dict(v4["scenes"][k])            # time / en / place: the timing generator's (place is one of its six islands)
        v["rec"] = sc["rec"]; v["join_in"] = sc["join_in"]; v["where"] = sc["place"]
        scenes[k] = v
    out = {
        "film": "newton",
        "version": "v5 (the redo, gate 2: script v5 revision 3, built on its recommended defaults while Jay decides)",
        "source": a.script + " (the acting, shot and sound cells stay there)",
        "title": S["title"], "subtitle": S["subtitle"],
        "title_span_s": S["title_span_s"], "title_en_on_screen": bool(S.get("title_en_on_screen", False)),
        "card_en_on_screen": False,
        "rec_display": S["rec_display"],
        "speakers": S["speakers"], "scenes": scenes, "gap": S["gap"], "lead": S["lead"],
        "level_target_db": LEVEL_TARGET_V4,
        "voice": {"lines_dir": os.path.join(V5, "lines"), "cuts": [os.path.join(V5, "line_cuts.json")], "out": OUT_DIR,
                  "clip_gain": CLIP_GAIN},
        "review_fixes": {"timing": {k: {kk: vv for kk, vv in v.items()} for k, v in TIMING_FIX.items()}, "retime": RETIME,
                         "clip_gain": CLIP_GAIN},
        "swap": swap,
        "cut_from_v4": S.get("cut_from_v4", []),
        "lines": lines,
    }
    json.dump(cuts, open(os.path.join(V5, "line_cuts.json"), "w"), ensure_ascii=False)
    json.dump(out, open(out_lines, "w"), ensure_ascii=False, indent=1)
    print(f"{len(lines)} lines -> {out_lines}; clips -> {V5}/lines; G01 split: G01a 0-{a_end:.2f} s, G01b {b_start:.2f}-{len(gx) / SR:.2f} s "
          f"(silent run {rep['silent_run_s'][0]:.2f}-{rep['silent_run_s'][1]:.2f} s, loudest between the cuts {rep['loudest_between_the_cuts_db']} dB; "
          f"edges a {rep['a']['edge_db']} b {rep['b']['edge_db']} dB)")


if __name__ == "__main__":
    main()
